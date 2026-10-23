<div align="center">

```
 ██████╗ ███╗   ██╗ ██████╗ ███╗   ███╗███████╗ ██████╗
██╔═══██╗████╗  ██║██╔═══██╗████╗ ████║██╔════╝██╔═══██╗
██║   ██║██╔██╗ ██║██║   ██║██╔████╔██║█████╗  ██║   ██║
██║   ██║██║╚██╗██║██║   ██║██║╚██╔╝██║██╔══╝  ██║   ██║
╚██████╔╝██║ ╚████║╚██████╔╝██║ ╚═╝ ██║███████╗╚██████╔╝
 ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝
```

# onomeo-bulk-apikey

**Bulk-create Onomeo accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-28-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Onomeo is an OpenAI-compatible aggregator: `https://onomeo.com/v1`, 28 model ids, `Authorization: Bearer sk-onomeo-…`. Sign-up is an **e-mail code** — no password to choose, no card — and the API key *is* what the verify call hands back. The only gate in the way is a Cloudflare Turnstile widget, which is why this tool takes a solved token (`--token-cmd` or `--manual`) and then does the rest on its own: fresh inbox → code → key → live chat proof.

## 🎁 Free tier — how much you get

**Every new account gets its own free allowance** — no card.

| What | Value (from the public `GET /api/info`, measured 2026-10-21) |
| --- | --- |
| Free models | **13** (listed above) |
| Calls per account | **30 / 5 h** |
| Calls per network | **60 / 5 h** |
| Per-key rate | **12 / min** |
| Accounts per IP per day | **3** (`accountsPerIpPerDay`) |
| Invite reward | **45 calls / 7 days** |
| BYOK | supported (bring your own upstream key) |
| The unit that scales | **one account = one key** → `--count N` is "N free accounts" |

The per-account cap is why the rail keeps **one account per key** and why a proxy pool earns its keep: the panel counts sign-ups per address.

> 💡 The free tier is set by Onomeo and can change. Check the live numbers at [onomeo.com](https://onomeo.com) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 28 of them

The catalogue is **28 ids**. The endpoint serves both free and account-funded models; the ones this rail proved with a *checkable* answer (not just a 200) are listed above and in `src/cli.js` as the gate probes:

| Model ID | Proof |
| --- | --- |
| `deepseek-v4-flash` | **200** + answer check (`17 * 3` → `51`), on every key the rail minted |
| `glm-5.2` | **200** + answer check (gold → `Au`), on every key the rail minted |
| `auto` | **200** + tool call (`get_time` present in the reply), measured on the same keys |

The panel's free tier exposes 13 of the ids (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Every reply carries the site's `— via onomeo.com` suffix; that is the panel adding attribution, not the model.

## 🧪 How to use the API

The base URL is **`https://onomeo.com/v1`** — OpenAI-compatible. Every request needs the site header **`x-onomeo-web: 1`** next to the bearer token; without it the endpoint answers as an anonymous client.

```bash
curl https://onomeo.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "x-onomeo-web: 1" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

```python
import os
from openai import OpenAI
c = OpenAI(base_url="https://onomeo.com/v1", api_key=os.environ["ONOMEO_KEY"],
           default_headers={"x-onomeo-web": "1"})   # the header is required
print(c.chat.completions.create(model="deepseek-v4-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

> The reader in `src/cli.js` accepts **both** a plain JSON body and a `text/event-stream` one: the panel has answered `stream:false` requests with SSE `data:` frames, and a JSON-only reader then reports a live key as dead.

## 🛠 Quick start

```bash
# clone or fork this repository, then:
cd onomeo-bulk-apikey
npm install                       # once: pulls puppeteer-core, the embedded solver's browser engine
# the solver needs a real Chrome: winget install --id Google.Chrome (or set CHROME_PATH)

# 1) your proxy list, one per line (http://… or socks5://…) — optional: without it the tool runs direct
printf 'http://127.0.0.1:8080\n' > proxies.txt

# 2) your Mailtrap token (Settings → API Tokens) — the inbox rail
export ONOMEO_MAILTRAP_TOKEN=<your mailtrap token>

# 3) go — the Turnstile token is the one manual input
node src/launcher.js                       # interactive
# or directly:
node src/cli.js --count 3 --token-cmd "<your solver>"
node src/cli.js --count 1 --manual         # paste one token by hand
node src/cli.js --verify-only              # re-check keys.txt
```

`keys.txt` is written **only** after a live `chat-200` plus the two content probes prove the key.

### 🖱️ The launcher

The launcher asks for the proxy list (optional — without one the CLI runs direct), the count, the verification model and the Mailtrap token, remembers them in `launcher.config.json`, and runs the CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

It cannot guess the Turnstile token, so a mint started from the launcher still needs `--token-cmd` (or `--manual`) passed through to the CLI.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `GET /api/info` (header `x-onomeo-web: 1`) | **200** — public config: 13 free models, 30 calls/account/5h, 60/network/5h, 12/min per key, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — with a real token from the same exit |
| mail | `onomeo verification code: 617076` in the inbox the run created |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **is** the API key |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — catalogue of 28 ids |
| `POST /v1/chat/completions` — run for **every** key before it is written | **200** with the expected answer (`51`, `Au`) |
| tool calling (`auto`) | **200** — `get_time` present in the reply |
| a key that fails its probes | never written to `keys.txt` — the account stays recoverable in `accounts.json` |

Three keys minted on 2026-10-21 were re-verified live later the same day (`/v1/models` 200 + chat 200).

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| mailbox | Mailtrap `POST /inbound/folders/{id}/inboxes` | a fresh `…@inbound-mailtrap.io` address per account |
| turnstile | Cloudflare widget, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | solved **on the same exit** that spends the token; `--token-cmd`, a captured `--token`, or `--manual` |
| code | `POST /api/auth/email/code {email,lang,turnstile}` | a token this exit did not solve is refused (`delivered` never becomes true) |
| mail | poll the same inbox | `onomeo verification code: <6 digits>` |
| verify | `POST /api/auth/email/verify {email,code}` | **`.secret` is the API key**; retried on other exits when an exit dies mid-flow |
| check | `GET /v1/models` + 2 content probes | a live `chat-200` with the right answer is required before `keys.txt` |

## ⚙️ CLI options

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Env | Default | Meaning |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | exit pool, one line per proxy — optional: without a pool the CLI connects directly |
| `ONOMEO_MAILTRAP_TOKEN` | — | your Mailtrap API token (Settings → API Tokens); the inbox rail |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | model for the chat gate |
| `ONOMEO_TURNSTILE` | — | a captured Turnstile token (same as `--token`; one account) — handy when the launcher runs the mint |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | exported *to* `--token-cmd`, so a solver knows what to solve |

| Flag | Meaning |
| --- | --- |
| `--count N` | accounts/keys to mint (default 1) |
| `--pool <file>` | proxy list, one exit per line |
| `--token <tok>` | one captured Turnstile token — **single account**, the token is spent once |
| `--token-cmd <cmd>` | command that prints a fresh token on stdout (`--count` > 1 needs this) |
| `--manual` | paste the token when prompted |
| `--mailtrap-token <t>` | Mailtrap API token |
| `--mt-folder <name>` | Mailtrap folder for the inboxes (default `onomeo`) |
| `--model <id>` | model for the chat gate |
| `--tries N` | attempts per account, one exit each (default 2) |
| `--verify-only` · `--screen` · `--help` | re-verify · probe exits · this text |

## 🛰️ Behind a proxy

**Optional — recommended at scale (the sign-up limit is per IP: 3 accounts/day).** The tool works without a proxy too.

- **With a pool:** pass `--pool <file>` (or set `ONOMEO_PROXIES`) and every request goes through an exit from that list; the rail rotates one exit per account and re-tries a dying exit on its neighbours. A dead line fails that attempt — a supplied pool never falls back to your own address.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly. Sign-up, key mint and the chat gate are unchanged — only where the packets leave from.
- `--screen` tests the exits you have against `https://onomeo.com/api/info` before a run.

> **Scale blocker (measured 2026-10-21/22, documented honestly).** The Cloudflare Turnstile widget only solved on a **small slice of the exits** the fleet had: in the 3-key scale run **2 of 11 reachable exits** produced a token (and **1 in 28** on the first screening pass), while every other reachable exit returned a **zero-length** token (`food` keep-alive frames from the challenge page) and the sign-up then could not proceed. Solving and spending must also happen on the **same** exit — a token solved elsewhere is refused. So this repo is a working **mint tool, not a finished key fleet**: with a solver that beats Turnstile on your exits (or a hand-pasted token) it mints and verifies keys end-to-end; without one it stops at the code step and says so. Existing live keys are re-verifiable at any time with `--verify-only`.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line (`sk-onomeo-…`) — git-ignored |
| `accounts.json` | email / Mailtrap inbox id / key (masked) / exit / probe results — git-ignored |
| `proxies.txt` | your exits, one per line — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Defaults: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Models are served as `onomeo/<model id>` and load-balanced across every key in `keys.txt`.

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Defaults: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Models are served as `onomeo/<model id>` and load-balanced across every key in `keys.txt`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 What the provider gives | one account per key — e-mail code behind Turnstile, every key chat-verified |
| 🔑 What one key gets you | one API key scoped to its own account: the 28 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Your data | only onomeo.com and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

If Onomeo changes its e-mail sign-up, its Turnstile sitekey, the `x-onomeo-web` header or the `/api/info` limits, the tool stops at that step and says so. **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>
