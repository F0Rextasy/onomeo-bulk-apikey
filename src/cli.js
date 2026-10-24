'use strict';
/**
 * onomeo (onomeo.com) bulk mint CLI — one free account per API key.
 *
 * Measured flow (2026-10-21, three live keys):
 *   1. Mailtrap inbound inbox -> a fresh address
 *   2. POST /api/auth/email/code {email, lang:'en', turnstile:<token>}
 *      -> {"sent":true,"delivered":true,"minutes":10}; the token comes from the
 *      Cloudflare Turnstile widget (sitekey below), solved on THIS exit
 *   3. mail "onomeo verification code: 617076" -> the 6-digit code
 *   4. POST /api/auth/email/verify {email, code} -> {"secret":"<API KEY>"}
 *   5. GET /v1/models + two checkable chat prompts; only a key that answers
 *      both probes is written to keys.txt
 *
 * Every onomeo request carries `x-onomeo-web: 1` — without it the API answers
 * as an anonymous client. Keys are `Authorization: Bearer <sk-onomeo-…>`
 * against the OpenAI-compatible https://onomeo.com/v1.
 *
 * SCALE BLOCKER (measured 2026-10-21/22): the Turnstile challenge only solves
 * on a small slice of public exits (2 of 11 reachable exits in the scale run;
 * 1 in 28 on the first pass), and a solver that cannot solve returns a
 * zero-length token. Supply a token with --token-cmd (your solver) or --manual;
 * without one this CLI stops at step 2 with the panel's own refusal message.
 *
 *   node src/cli.js --count 3 --token-cmd "<your solver>"
 *   node src/cli.js --count 1 --manual
 *   node src/cli.js --verify-only
 *   node src/cli.js --screen
 *   node src/cli.js --help
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { spawnSync } = require('child_process');
const readline = require('readline');
// Vendored so the shipped `src/cli.js` is self-contained: the same
// `./vendor/*` paths resolve in the lab (providers/onomeo/) and in the
// published repo (<repo>/src/).
const { parseProxyText, createAgent, isDirect, label } = require('./vendor/proxy.js');
const { Mailtrap } = require('./vendor/mailtrap.js');

// Two layouts, one source (lab checkout vs published <repo>/src). Everything
// the user owns — keys.txt, accounts.json, proxies.txt — lives in the checkout
// root, which is where connect-9router.js looks for keys.txt.
const IS_SRC = path.basename(__dirname) === 'src';
const ROOT = IS_SRC ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');

const BASE = 'https://onomeo.com';
const API = `${BASE}/v1`;
const SITEKEY = '0x4AAAAAADhgHpmYKLCUCGVk';
const LOGIN_URL = `${BASE}/login`;
// Every onomeo endpoint (public /api/info, the auth calls, /v1/*) is fronted by
// the site and refuses a request without this header.
const WEB_HEADER = 'x-onomeo-web';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
// Content-checkable probes: a 200 alone is not proof, so each model must answer
// a question with a known answer (measured 2026-10-21 on all three live keys).
const PROBES = [
  ['deepseek-v4-flash', 'What is 17 times 3? Reply with just the number.', /^51/],
  ['glm-5.2', 'What is the chemical symbol for gold? Reply with just the symbol.', /^Au/i],
];
const GATE_PROMPT = 'Reply with the single word: OK';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
}
const has = (name) => argv.includes(`--${name}`);

if (has('help') || has('h')) {
  console.log(`onomeo-bulk-apikey — mint Onomeo accounts, one API key each, verified by a live chat call.

  node src/cli.js --count 3                          mint (Turnstile solved automatically)
  node src/cli.js --verify-only                      re-check every key in keys.txt
  node src/cli.js --screen                           which exits carry the API
  node src/cli.js --help

  --count N          accounts/keys to mint                                          [1]
  --verify-only      re-verify keys.txt, no minting
  --screen           probe each pool exit against ${BASE}/api/info
  --pool <file>      proxy list, one exit per line (env ONOMEO_PROXIES)         [optional]
  --auto             solve the Turnstile with the embedded solver (default)
  --no-auto          disable the embedded solver
  --dry              resolve the plan, write nothing (no network, no files)
  --mailtrap-token <t>  Mailtrap API token (env ONOMEO_MAILTRAP_TOKEN)
  --mt-folder <name> Mailtrap folder the inboxes live in                    [onomeo]
  --model <id>       model for the chat gate                             [deepseek-v4-flash]
  --exits N          attempts per account, one exit each                            [6]

The Cloudflare Turnstile widget is solved on the SAME exit that spends the
token. By default (--auto) the bundled src/solver.js does it over the account's
pinned exit — one command, nothing else to run. Advanced solver wiring is
described in ADVANCED.md. If Chrome is not found, install it once or point
CHROME_PATH at it. Requests go through the pool when one is given; without a
pool the CLI connects directly.`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '1'), 10) || 1);
const EXITS = Math.max(1, parseInt(arg('exits', '6'), 10) || 6);
const MODEL = arg('model', process.env.ONOMEO_MODEL || 'deepseek-v4-flash');
const MT_TOKEN = arg('mailtrap-token', process.env.ONOMEO_MAILTRAP_TOKEN || null);
const MT_FOLDER = arg('mt-folder', 'onomeo');
const POOL_ARG = arg('pool', process.env.ONOMEO_PROXIES || null);
const TOKEN = arg('token', process.env.ONOMEO_TURNSTILE || null);
const TOKEN_CMD = arg('token-cmd', null);
const MANUAL = has('manual');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const AUTO = !has('no-auto'); // the embedded solver is the default path (one command)
const DRY = has('dry'); // resolve the plan, write nothing, send nothing
/** Lazy require: a checkout without src/solver.js still runs off --token / --token-cmd. */
let _solver = null;
const solver = () => (_solver && _solver.solveCaptcha ? _solver : (_solver = require('./solver.js')));
/** The exit as a proxy string for the solver ('direct' → null = DIRECT). */
const exitProxy = (exit) => (isDirect(exit) ? null : exit.raw);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

// The direct-mode sentinel: the single exit of a pool-less run (`protocol:
// 'direct'`), which the HTTP layer dials straight out.
const DIRECT_EXIT = { protocol: 'direct', host: 'direct', port: 0, username: null, password: null };

// The exits this run may use, resolved once by loadExits().
let exits = [DIRECT_EXIT];

// ------------------------------------------------------------------- reading
/**
 * A panel may stream `text/event-stream` even when the request asks for
 * `stream:false`, and a JSON-only reader then reports a live key as empty.
 * Parses a plain JSON body, or the concatenated `data:` frames of an SSE one.
 */
function readJson(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch (e) {
    /* not plain JSON — try SSE */
  }
  const chunks = [];
  for (const line of t.split(/\r?\n/)) {
    const m = /^data:(.*)$/.exec(line);
    if (!m) continue;
    const payload = m[1].trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      chunks.push(JSON.parse(payload));
    } catch (e) {
      /* keep-alive comment or a truncated frame */
    }
  }
  return chunks.length ? { sse: chunks } : null;
}

/** The assistant text of a reply, plain JSON or SSE deltas alike. */
function replyText(json) {
  if (!json || typeof json !== 'object') return '';
  if (Array.isArray(json.sse)) {
    return json.sse
      .map((c) => {
        const d = c && c.choices && c.choices[0] && c.choices[0].delta;
        return d ? String(d.content || d.reasoning_content || '') : '';
      })
      .join('');
  }
  const msg = json.choices && json.choices[0] && json.choices[0].message;
  return msg ? String(msg.content || msg.reasoning_content || '') : '';
}

// ------------------------------------------------------------------- HTTP
/** One request through one exit. Returns { status, text, json }. */
function ask(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = 25000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const h = { 'User-Agent': UA, [WEB_HEADER]: '1', ...headers };
    if (payload && !Object.keys(h).some((k) => k.toLowerCase() === 'content-type')) h['Content-Type'] = 'application/json';
    if (payload) h['Content-Length'] = payload.length;
    const req = lib.request(
      {
        method,
        host: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        agent: isDirect(proxy) ? undefined : createAgent(proxy),
        headers: h,
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (text += c));
        res.on('end', () => resolve({ status: res.statusCode, text, json: readJson(text) }));
      }
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ------------------------------------------------------------------- pool
/** The exits this run may use: --pool / ONOMEO_PROXIES / a local proxies.txt. */
function loadExits() {
  const file = POOL_ARG || (fs.existsSync(path.join(ROOT, 'proxies.txt')) ? 'proxies.txt' : null);
  if (file) {
    try {
      const list = parseProxyText(fs.readFileSync(path.resolve(ROOT, file), 'utf8'));
      if (list.length) return list;
      console.log(`  ! ${file} has no usable exit — running WITHOUT a proxy (direct)`);
    } catch (e) {
      console.log(`  ! ${file}: ${e.message} — running WITHOUT a proxy (direct)`);
    }
  } else {
    console.log('running WITHOUT a proxy (direct)');
  }
  return [DIRECT_EXIT];
}
/** A dead exit, not a panel verdict — the flow rotates to the next candidate. */
const isExitError = (e) =>
  /proxy connect failed|proxy CONNECT refused|proxy timeout|connect timeout|connect failed|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|ENETUNREACH|EHOSTUNREACH|EAI_AGAIN|socket hang up|secureConnect|TLS|handshake/i.test(
    String((e && e.message) || e),
  );


async function screen(exits) {
  let live = 0;
  for (let i = 0; i < exits.length; i++) {
    const exit = exits[i];
    try {
      const r = await ask(exit, `${BASE}/api/info`, { timeoutMs: 15000 });
      const ok = r.status === 200 && !!r.json;
      if (ok) live++;
      console.log(`  ${ok ? '✔' : '✘'} ${label(exit)} ${r.status}`);
    } catch (e) {
      console.log(`  ✘ ${label(exit)} ${String(e.message).slice(0, 60)}`);
    }
  }
  console.log(`screen: ${live}/${exits.length} exits carry ${BASE}/api/info`);
}

// ------------------------------------------------------------------- turnstile
const rl = () => readline.createInterface({ input: process.stdin, output: process.stdout });

/**
 * One Turnstile token for the e-mail/code call.
 *
 * onomeo binds no cData challenge id — the widget is solved and the token spent
 * directly — so a `--token` value is used as-is (a `label:token` pair keeps the
 * token). The token is single-use, which is why `--token` only serves one
 * account and a multi-account run needs `--token-cmd`.
 */
/** One Turnstile token for the e-mail/code call. Order: --token → --token-cmd → --auto. */
async function turnstileToken(exit) {
  if (TOKEN) return TOKEN.includes(':') ? TOKEN.split(':').pop() : TOKEN;
  if (TOKEN_CMD) {
    const r = spawnSync(TOKEN_CMD, {
      shell: true,
      encoding: 'utf8',
      timeout: 300000,
      env: { ...process.env, ONOMEO_SITEKEY: SITEKEY, ONOMEO_URL: LOGIN_URL },
    });
    // Turnstile tokens are `<digit>.<body>` and 65-4096 chars (measured 752/773/
    // 794/816/837, always a `1.` prefix). The last whitespace run alone keeps a
    // fragment when the solver labels the token, so the strict shape comes first
    // and the loose classes only rescue a labelled line.
    const out = String(r.stdout || '');
    const line = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).pop() || '';
    const m = line.match(/\d\.[A-Za-z0-9._-]{63,}$/) || out.match(/[A-Za-z0-9_.-]{40,}/) || out.match(/[A-Za-z0-9_-]{40,}/);
    const tok = m ? m[0] : '';
    if (!tok) throw new Error(`an external solver produced no token (status ${r.status}): ${String(r.stderr || '').slice(0, 160)} — advanced solver flags: see ADVANCED.md`);
    return tok;
  }
  if (AUTO) {
    const r = await solver().solveCaptcha({ type: 'turnstile', sitekey: SITEKEY, url: LOGIN_URL, proxy: exitProxy(exit) });
    if (r && r.token) return r.token;
  }
  if (MANUAL) {
    const iface = rl();
    const answer = await new Promise((res) => {
      console.log(`\n  Turnstile needed (sitekey ${SITEKEY}).`);
      console.log(`  1. open ${LOGIN_URL} , start an e-mail sign-in with this address, solve the widget`);
      console.log(`  2. copy the hidden input  input[name="cf-turnstile-response"]  (DevTools → Elements)\n`);
      iface.question('  paste the token: ', (a) => {
        iface.close();
        res(a.trim());
      });
    });
    if (!answer) throw new Error('no token pasted');
    return answer;
  }
  throw new Error('no Turnstile source: the embedded solver (--auto) gave nothing — advanced solver flags: see ADVANCED.md');
}

// ------------------------------------------------------------------- flows
function readKeys() {
  try {
    return fs
      .readFileSync(KEYS_FILE, 'utf8')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'));
  } catch (e) {
    return [];
  }
}
function appendKey(key) {
  fs.appendFileSync(KEYS_FILE, (fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '') + key + '\n');
}
function loadAccounts() {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}
function saveAccounts(list) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2) + '\n');
}

/** One account on one exit. Returns { email, inboxId, key }. */
async function signUp(exit, index) {
  const mt = new Mailtrap({ proxy: exit, token: MT_TOKEN, folder: MT_FOLDER, log: (m) => log(`    ${m}`) });
  const box = await mt.createAccount();
  const token = await turnstileToken(exit);
  const send = await ask(exit, `${BASE}/api/auth/email/code`, {
    method: 'POST',
    body: { email: box.address, lang: 'en', turnstile: token },
    timeoutMs: 30000,
  });
  const accepted = send.json && (send.json.delivered === true || send.json.sent === true);
  if (send.status !== 200 || !accepted) {
    mt.close();
    throw new Error(`email/code HTTP ${send.status}: ${String(send.text).slice(0, 160)}`);
  }
  // A rejected Turnstile token is the blocker this rail hits most often: the
  // panel answers 200 with no delivery, and the inbox then stays empty, so the
  // wait is capped instead of burning the whole run.
  let code = null;
  try {
    code = await mt.waitForCode({ timeoutMs: 240000, match: (m) => /onomeo/i.test(`${m.subject} ${m.from}`) });
  } finally {
    mt.close();
  }
  // Exits die mid-flow: the verify call retries on up to four other exits.
  let ver = null;
  for (const e of [exit, ...exits.filter((x) => x !== exit).slice(0, 4)]) {
    try {
      ver = await ask(e, `${BASE}/api/auth/email/verify`, { method: 'POST', body: { email: box.address, code }, timeoutMs: 25000 });
    } catch (err) {
      continue;
    }
    if (ver.json) break; // an answer is an answer — a refusal is not a dead route
  }
  const key = ver && ver.json && ver.json.secret;
  if (!key) throw new Error(`verify HTTP ${ver ? ver.status : 'ERR'}: ${String(ver && ver.text).slice(0, 160)}`);
  return { email: box.address, inboxId: box.inboxId, key };
}

async function chat(exit, key, model, prompt, maxTokens) {
  const r = await ask(exit, `${API}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: { model, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens },
    timeoutMs: 90000,
  });
  return { status: r.status, text: replyText(r.json), raw: String(r.text).slice(0, 160) };
}

/** Catalogue + the content-checkable probes — what "verified" means here. */
async function verifyKey(exit, key) {
  const m = await ask(exit, `${API}/models`, { headers: { Authorization: `Bearer ${key}` }, timeoutMs: 25000 });
  const models = m.json && Array.isArray(m.json.data) ? m.json.data.length : 0;
  const probes = [];
  for (const [model, prompt, re] of PROBES) {
    try {
      const r = await chat(exit, key, model, prompt, 40);
      probes.push({ model, status: r.status, ok: r.status === 200 && re.test(r.text.trim()), sample: r.text.trim().slice(0, 40) });
    } catch (e) {
      probes.push({ model, status: 'ERR', ok: false, sample: String(e.message).slice(0, 60) });
    }
  }
  return { ok: m.status === 200 && probes.every((p) => p.ok), models, probes };
}

async function chatGate(exit, key, model = MODEL) {
  const r = await chat(exit, key, model, GATE_PROMPT, 16);
  return { ok: r.status === 200 && !!r.text.trim(), status: r.status, sample: r.text.trim().slice(0, 60) || r.raw };
}

async function mint() {
  exits = loadExits();
  if (SCREEN) return void (await screen(exits));
  if (DRY) {
    console.log('dry run — nothing is written and no request is sent.');
    console.log(`  count ${COUNT} · exits ${exits.length} · model ${MODEL} · solver ${AUTO ? 'embedded src/solver.js (--auto)' : 'off (--no-auto)'}`);
    return;
  }
  const accounts = loadAccounts();
  const routes = isDirect(exits[0]) ? 1 : EXITS;
  log(`onomeo · ${COUNT} key(s) · exits ${exits.length} · up to ${routes} per account · keys land in ${KEYS_FILE}`);
  let made = 0;
  let transportDead = 0;
  for (let i = 0; i < COUNT; i++) {
    let lastErr = null;
    let ok = false;
    let lastWasExit = false;
    for (let a = 0; a < routes; a++) {
      const exit = exits[(i + a) % exits.length];
      lastWasExit = false;
      try {
        const rec = await signUp(exit, i + 1);
        const live = await verifyKey(exit, rec.key);
        accounts.push({
          at: new Date().toISOString(),
          email: rec.email,
          inboxId: rec.inboxId,
          folder: MT_FOLDER,
          exit: label(exit),
          key_masked: `${rec.key.slice(0, 14)}…`,
          models: live.models,
          probes: live.probes,
          gate: live.ok ? 'chat-200' : 'failed',
        });
        saveAccounts(accounts);
        if (!live.ok) {
          lastErr = new Error(`chat gate: ${JSON.stringify(live.probes.map((p) => [p.model, p.status, p.ok]))}`);
          continue;
        }
        appendKey(rec.key);
        made++;
        log(`account ${i + 1} ✔ models ${live.models} · probes 2/2 · ${rec.key.slice(0, 14)}…`);
        ok = true;
        break;
      } catch (e) {
        lastErr = e;
        lastWasExit = isExitError(e);
        if (lastWasExit) log(`account ${i + 1}: exit ${a + 1}/${routes} ${label(exit)} dead (${String(e.message).slice(0, 70)}) → next exit`);
        if (a < routes - 1) await sleep(2000);
      }
    }
    if (!ok && lastWasExit) transportDead++;
    if (!ok) log(`account ${i + 1}: ${lastErr ? String(lastErr.message).slice(0, 160) : 'no key'}`);
  }
  if (!made && transportDead === COUNT) {
    const route = isDirect(exits[0]) ? 'direct mode (no proxy list)' : `${exits.length}-exit pool`;
    console.error(`[fatal] no usable route — ${COUNT} account(s) × ${routes} candidate(s) over ${route}: every attempt died at the transport layer.`);
    process.exit(1);
  }
  log(`done — ${made}/${COUNT} key(s) written to ${KEYS_FILE}`);
  console.log(`__MINT_SUMMARY__ ${JSON.stringify({ requested: COUNT, live: made, keysFile: KEYS_FILE, deadFile: DEAD_FILE })}`);
}

async function verifyOnly() {
  exits = loadExits();
  const keys = readKeys();
  if (!keys.length) {
    console.log(`no keys in ${KEYS_FILE}`);
    process.exit(0);
  }
  let live = 0;
  const dead = [];
  // The pool flaps: keep walking distinct exits until one answers, because a
  // transport error is not a provider verdict.
  const attempts = Math.max(EXITS, Math.min(exits.length, 6));
  for (let i = 0; i < keys.length; i++) {
    let g = null;
    let lastErr = null;
    for (let t = 0; t < attempts; t++) {
      try {
        g = await chatGate(exits[(i + t) % exits.length], keys[i]);
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!g) {
      dead.push({ key: keys[i], why: String(lastErr && lastErr.message).slice(0, 60) });
      console.log(`  ✘ ${keys[i].slice(0, 14)}… ${String(lastErr && lastErr.message).slice(0, 90)} (${attempts} exits tried)`);
      continue;
    }
    if (g.ok) live++;
    else dead.push({ key: keys[i], why: `chat=${g.status}` });
    console.log(`  ${g.ok ? '✔' : '✘'} ${keys[i].slice(0, 14)}… chat=${g.status}${g.ok ? ` ${g.sample}` : ''}`);
  }
  fs.writeFileSync(DEAD_FILE, dead.map((d) => `${d.key}\t# ${d.why}`).join('\n') + (dead.length ? '\n' : ''));
  console.log(`verify: ${live}/${keys.length} keys live — the ${dead.length} dead one(s) are in ${DEAD_FILE}`);
  process.exit(live === keys.length ? 0 : 1);
}

(VERIFY_ONLY ? verifyOnly() : mint()).catch((e) => {
  console.error('[fatal]', e.message);
  process.exit(1);
});
