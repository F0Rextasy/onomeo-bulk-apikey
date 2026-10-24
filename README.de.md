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

**Onomeo-Konten in großen Mengen erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-28-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Onomeo ist ein OpenAI-kompatibler Aggregator: `https://onomeo.com/v1`, 28 Modell-IDs, `Authorization: Bearer sk-onomeo-…`. Die Anmeldung erfolgt über einen **E-Mail-Code** — kein Passwort zu wählen, keine Karte — und der API-Schlüssel *ist* genau das, was der Verifizierungsaufruf zurückgibt. Das einzige Hindernis ist ein Cloudflare-Turnstile-Widget. Deshalb nimmt dieses Tool ein gelöstes Token entgegen (`--token-cmd` oder `--manual`) und erledigt den Rest selbst: frisches Postfach → Code → Schlüssel → Live-Chat-Nachweis.

## 🎁 Kostenlose Stufe — wie viel du bekommst

**Jedes neue Konto erhält sein eigenes kostenloses Kontingent** — ohne Karte.

| Was | Wert (aus dem öffentlichen `GET /api/info`, gemessen am 2026-10-21) |
| --- | --- |
| Kostenlose Modelle | **13** (oben aufgeführt) |
| Aufrufe pro Konto | **30 / 5 h** |
| Aufrufe pro Netzwerk | **60 / 5 h** |
| Rate pro Schlüssel | **12 / min** |
| Konten pro IP pro Tag | **3** (`accountsPerIpPerDay`) |
| Einladungsprämie | **45 Aufrufe / 7 Tage** |
| BYOK | unterstützt (eigenen Upstream-Schlüssel mitbringen) |
| Die skalierende Einheit | **ein Konto = ein Schlüssel** → `--count N` bedeutet „N kostenlose Konten" |

Die Obergrenze pro Konto ist der Grund, warum die Rail **ein Konto pro Schlüssel** beibehält und warum ein Proxy-Pool sich lohnt: Das Panel zählt Anmeldungen pro Adresse.

> 💡 Die kostenlose Stufe wird von Onomeo festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [onomeo.com](https://onomeo.com) — und lass das eigene Gate des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 28

Der Katalog umfasst **28 IDs**. Der Endpunkt bedient sowohl kostenlose als auch kontofinanzierte Modelle; diejenigen, die diese Rail mit einer *überprüfbaren* Antwort bewiesen hat (nicht nur einem 200), sind oben und in `src/cli.js` als Gate-Proben aufgeführt:

| Modell-ID | Nachweis |
| --- | --- |
| `deepseek-v4-flash` | **200** + Antwortprüfung (`17 * 3` → `51`), bei jedem Schlüssel, den die Rail erzeugt hat |
| `glm-5.2` | **200** + Antwortprüfung (Gold → `Au`), bei jedem Schlüssel, den die Rail erzeugt hat |
| `auto` | **200** + Tool-Aufruf (`get_time` in der Antwort vorhanden), gemessen mit denselben Schlüsseln |

Die kostenlose Stufe des Panels stellt 13 der IDs bereit (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Jede Antwort trägt das Suffix `— via onomeo.com` der Seite; das ist das Panel, das die Quellenangabe hinzufügt, nicht das Modell.

## 🧪 So verwendest du die API

Die Basis-URL ist **`https://onomeo.com/v1`** — OpenAI-kompatibel. Jede Anfrage benötigt den Site-Header **`x-onomeo-web: 1`** neben dem Bearer-Token; ohne ihn antwortet der Endpunkt als anonymer Client.

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

> Der Reader in `src/cli.js` akzeptiert **sowohl** einen reinen JSON-Body als auch einen `text/event-stream`-Body: Das Panel hat auf `stream:false`-Anfragen mit SSE-`data:`-Frames geantwortet, und ein nur-JSON-Reader meldet dann einen aktiven Schlüssel als tot.

## 🛠 Schnellstart

```bash

# clone or fork this repository, then:
cd onomeo-bulk-apikey

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

`keys.txt` wird **erst** geschrieben, nachdem ein Live-`chat-200` plus die beiden Inhaltsproben den Schlüssel bestätigt haben.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste (optional — ohne eine läuft die CLI direkt), der Anzahl, dem Verifizierungsmodell und dem Mailtrap-Token, merkt sie sich in `launcher.config.json` und führt die CLI aus — erzeugen, verifizieren, Exits prüfen, Einstellungen, Hilfe, Connect to 9Router.

Er kann das Turnstile-Token nicht erraten, daher benötigt ein vom Launcher gestarteter Mint weiterhin `--token-cmd` (oder `--manual`), das an die CLI durchgereicht wird.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api/info` (Header `x-onomeo-web: 1`) | **200** — öffentliche Konfiguration: 13 kostenlose Modelle, 30 Aufrufe/Konto/5h, 60/Netzwerk/5h, 12/min pro Schlüssel, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — mit einem echten Token vom selben Exit |
| Mail | `onomeo verification code: 617076` im Postfach, das der Lauf erstellt hat |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **ist** der API-Schlüssel |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — Katalog mit 28 IDs |
| `POST /v1/chat/completions` — für **jeden** Schlüssel ausgeführt, bevor er geschrieben wird | **200** mit der erwarteten Antwort (`51`, `Au`) |
| Tool-Aufruf (`auto`) | **200** — `get_time` in der Antwort vorhanden |
| ein Schlüssel, der seine Proben nicht besteht | wird nie in `keys.txt` geschrieben — das Konto bleibt in `accounts.json` wiederherstellbar |

Drei am 2026-10-21 erzeugte Schlüssel wurden noch am selben Tag live erneut verifiziert (`/v1/models` 200 + Chat 200).

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt`
> geschrieben wurde (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel
> auf Modellebene: Ein Eintrag wird **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools
> aufrufen kann** — ein Modell ohne Tool-Unterstützung, ein toter Schlüssel oder ein toter Anbieter wird
> verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie verborgen.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Postfach | Mailtrap `POST /inbound/folders/{id}/inboxes` | eine frische `…@inbound-mailtrap.io`-Adresse pro Konto |
| Turnstile | Cloudflare-Widget, Sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | gelöst **auf demselben Exit**, der das Token verbraucht; `--token-cmd`, ein erfasstes `--token` oder `--manual` |
| Code | `POST /api/auth/email/code {email,lang,turnstile}` | ein Token, das dieser Exit nicht gelöst hat, wird abgelehnt (`delivered` wird nie true) |
| Mail | dasselbe Postfach abfragen | `onomeo verification code: <6 digits>` |
| Verifizieren | `POST /api/auth/email/verify {email,code}` | **`.secret` ist der API-Schlüssel**; bei einem Exit-Ausfall mitten im Ablauf wird auf anderen Exits erneut versucht |
| Prüfen | `GET /v1/models` + 2 Inhaltsproben | ein Live-`chat-200` mit der richtigen Antwort ist erforderlich, bevor `keys.txt` geschrieben wird |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Env | Standard | Bedeutung |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | Exit-Pool, eine Zeile pro Proxy — optional: ohne einen Pool verbindet sich die CLI direkt |
| `ONOMEO_MAILTRAP_TOKEN` | — | dein Mailtrap-API-Token (Settings → API Tokens); die Postfach-Rail |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | Modell für das Chat-Gate |
| `ONOMEO_TURNSTILE` | — | ein erfasstes Turnstile-Token (wie `--token`; ein Konto) — praktisch, wenn der Launcher den Mint ausführt |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | Sitekey / `/login` | wird *an* `--token-cmd` exportiert, damit ein Solver weiß, was zu lösen ist |

| Flag | Bedeutung |
| --- | --- |
| `--count N` | Anzahl der zu erzeugenden Konten/Schlüssel (Standard 1) |
| `--pool <file>` | Proxy-Liste, ein Exit pro Zeile |
| `--token <tok>` | ein erfasstes Turnstile-Token — **einzelnes Konto**, das Token wird einmal verbraucht |
| `--token-cmd <cmd>` | Befehl, der ein frisches Token auf stdout ausgibt (`--count` > 1 benötigt dies) |
| `--manual` | Token bei Aufforderung einfügen |
| `--mailtrap-token <t>` | Mailtrap-API-Token |
| `--mt-folder <name>` | Mailtrap-Ordner für die Postfächer (Standard `onomeo`) |
| `--model <id>` | Modell für das Chat-Gate |
| `--exits N` | Versuche pro Konto, je ein Exit (Standard 6) |
| `--verify-only` · `--screen` · `--help` | erneut verifizieren · Exits prüfen · dieser Text |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (das Anmeldelimit gilt pro IP: 3 Konten/Tag).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `ONOMEO_PROXIES`), und jede Anfrage geht durch einen Exit aus dieser Liste; die Rail rotiert ein Exit pro Konto und versucht einen sterbenden Exit bei seinen Nachbarn erneut. Eine tote Zeile lässt diesen Versuch fehlschlagen — ein bereitgestellter Pool fällt nie auf deine eigene Adresse zurück.
- **Ohne einen Pool:** die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet sich direkt. Anmeldung, Schlüsselerzeugung und Chat-Gate bleiben unverändert — nur der Ursprung der Pakete ändert sich.
- `--screen` testet die vorhandenen Exits gegen `https://onomeo.com/api/info` vor einem Lauf.

> **Skalierungsblocker (gemessen am 2026-10-21/22, ehrlich dokumentiert).** Das Cloudflare-Turnstile-Widget löste nur auf einem **kleinen Teil der Exits** der Flotte: Im 3-Schlüssel-Skalierungslauf erzeugten **2 von 11 erreichbaren Exits** ein Token (und **1 von 28** beim ersten Screening-Durchlauf), während jeder andere erreichbare Exit ein **Token der Länge null** zurückgab (`food`-Keep-Alive-Frames von der Challenge-Seite) und die Anmeldung dann nicht fortgesetzt werden konnte. Lösen und Verbrauchen müssen außerdem auf demselben Exit erfolgen — ein anderswo gelöstes Token wird abgelehnt. Dieses Repo ist also ein funktionierendes **Mint-Tool, keine fertige Schlüssel-Flotte**: Mit einem Solver, der Turnstile auf deinen Exits besiegt (oder einem manuell eingefügten Token), erzeugt und verifiziert es Schlüssel von Anfang bis Ende; ohne einen stoppt es beim Code-Schritt und sagt das auch. Bestehende aktive Schlüssel sind jederzeit mit `--verify-only` erneut verifizierbar.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile (`sk-onomeo-…`) — von Git ignoriert |
| `accounts.json` | E-Mail / Mailtrap-Postfach-ID / Schlüssel (maskiert) / Exit / Probenergebnisse — von Git ignoriert |
| `proxies.txt` | deine Exits, eine pro Zeile — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Modelle werden als `onomeo/<model id>` bereitgestellt und über jeden Schlüssel in `keys.txt` lastverteilt.

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Modelle werden als `onomeo/<model id>` bereitgestellt und über jeden Schlüssel in `keys.txt` lastverteilt.

## 🔑 Was dir ein Schlüssel bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 Was der Anbieter gibt | ein Konto pro Schlüssel — E-Mail-Code hinter Turnstile, jeder Schlüssel chat-verifiziert |
| 🔑 Was dir ein Schlüssel bringt | einen API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 28 Modell-IDs am unten stehenden Endpunkt, zu den Limits deines Tarifs. Das Kontingent liegt auf dem **Konto**, genau deshalb erstellt dieses Tool ein Konto pro Schlüssel |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Deine Daten | nur onomeo.com und das von dir konfigurierte Postfach-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Wenn Onomeo seine E-Mail-Anmeldung, seinen Turnstile-Sitekey, den Header `x-onomeo-web` oder die Limits von `/api/info` ändert, stoppt das Tool bei diesem Schritt und sagt das auch. **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und der genauen Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>