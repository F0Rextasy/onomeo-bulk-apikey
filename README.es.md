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

**Crea cuentas de Onomeo en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-28-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Onomeo es un agregador compatible con OpenAI: `https://onomeo.com/v1`, 28 ids de modelos, `Authorization: Bearer sk-onomeo-…`. El registro es un **código por correo electrónico** — sin contraseña que elegir, sin tarjeta — y la clave API *es* lo que devuelve la llamada de verificación. La única barrera en el camino es un widget de Cloudflare Turnstile, y por eso esta herramienta recibe un token ya resuelto (`--token-cmd` o `--manual`) y luego hace el resto por su cuenta: bandeja nueva → código → clave → prueba de chat en vivo.

## 🎁 Nivel gratuito — cuánto obtienes

**Cada cuenta nueva recibe su propia asignación gratuita** — sin tarjeta.

| Qué | Valor (del `GET /api/info` público, medido el 2026-10-21) |
| --- | --- |
| Modelos gratuitos | **13** (listados arriba) |
| Llamadas por cuenta | **30 / 5 h** |
| Llamadas por red | **60 / 5 h** |
| Tasa por clave | **12 / min** |
| Cuentas por IP por día | **3** (`accountsPerIpPerDay`) |
| Recompensa por invitación | **45 llamadas / 7 días** |
| BYOK | compatible (trae tu propia clave de proveedor) |
| La unidad que escala | **una cuenta = una clave** → `--count N` es "N cuentas gratuitas" |

El límite por cuenta es la razón por la que el riel mantiene **una cuenta por clave** y por la que un grupo de proxies vale la pena: el panel cuenta los registros por dirección.

> 💡 El nivel gratuito lo define Onomeo y puede cambiar. Consulta los números en vivo en [onomeo.com](https://onomeo.com) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 28

El catálogo tiene **28 ids**. El endpoint sirve tanto modelos gratuitos como financiados por la cuenta; los que este riel comprobó con una respuesta *verificable* (no solo un 200) se listan arriba y en `src/cli.js` como las sondas de la puerta:

| ID del modelo | Prueba |
| --- | --- |
| `deepseek-v4-flash` | **200** + verificación de respuesta (`17 * 3` → `51`), en cada clave que el riel acuñó |
| `glm-5.2` | **200** + verificación de respuesta (oro → `Au`), en cada clave que el riel acuñó |
| `auto` | **200** + llamada a herramienta (`get_time` presente en la respuesta), medido en las mismas claves |

El nivel gratuito del panel expone 13 de los ids (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Cada respuesta lleva el sufijo `— via onomeo.com` del sitio; eso es el panel añadiendo atribución, no el modelo.

## 🧪 Cómo usar la API

La URL base es **`https://onomeo.com/v1`** — compatible con OpenAI. Cada solicitud necesita el encabezado del sitio **`x-onomeo-web: 1`** junto al token bearer; sin él, el endpoint responde como un cliente anónimo.

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

> El lector en `src/cli.js` acepta **tanto** un cuerpo JSON simple como uno `text/event-stream`: el panel ha respondido a solicitudes `stream:false` con tramas SSE `data:`, y un lector solo-JSON entonces reporta una clave viva como muerta.

## 🛠 Inicio rápido

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

`keys.txt` se escribe **solo** después de un `chat-200` en vivo más las dos sondas de contenido que prueban la clave.

### 🖱️ El lanzador

El lanzador pide la lista de proxies (opcional — sin una, el CLI se ejecuta directo), la cantidad, el modelo de verificación y el token de Mailtrap, los recuerda en `launcher.config.json` y ejecuta el CLI — acuñar, verificar, examinar salidas, ajustes, ayuda, Conectar a 9Router.

No puede adivinar el token de Turnstile, así que un acuñado iniciado desde el lanzador aún necesita `--token-cmd` (o `--manual`) pasado al CLI.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api/info` (encabezado `x-onomeo-web: 1`) | **200** — configuración pública: 13 modelos gratuitos, 30 llamadas/cuenta/5h, 60/red/5h, 12/min por clave, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — con un token real desde la misma salida |
| correo | `onomeo verification code: 617076` en la bandeja que creó la ejecución |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **es** la clave API |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — catálogo de 28 ids |
| `POST /v1/chat/completions` — ejecutado para **cada** clave antes de escribirse | **200** con la respuesta esperada (`51`, `Au`) |
| llamada a herramientas (`auto`) | **200** — `get_time` presente en la respuesta |
| una clave que falla sus sondas | nunca se escribe en `keys.txt` — la cuenta queda recuperable en `accounts.json` |

Tres claves acuñadas el 2026-10-21 se re-verificaron en vivo más tarde ese mismo día (`/v1/models` 200 + chat 200).

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| buzón | Mailtrap `POST /inbound/folders/{id}/inboxes` | una dirección `…@inbound-mailtrap.io` nueva por cuenta |
| turnstile | Widget de Cloudflare, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | resuelto **en la misma salida** que gasta el token; `--token-cmd`, un `--token` capturado, o `--manual` |
| código | `POST /api/auth/email/code {email,lang,turnstile}` | un token que esta salida no resolvió se rechaza (`delivered` nunca se vuelve true) |
| correo | sondear la misma bandeja | `onomeo verification code: <6 digits>` |
| verificar | `POST /api/auth/email/verify {email,code}` | **`.secret` es la clave API**; se reintenta en otras salidas cuando una salida muere a mitad del flujo |
| comprobar | `GET /v1/models` + 2 sondas de contenido | se requiere un `chat-200` en vivo con la respuesta correcta antes de `keys.txt` |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Env | Predeterminado | Significado |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | grupo de salidas, una línea por proxy — opcional: sin un grupo, el CLI se conecta directamente |
| `ONOMEO_MAILTRAP_TOKEN` | — | tu token de API de Mailtrap (Settings → API Tokens); el riel de la bandeja |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | modelo para la puerta de chat |
| `ONOMEO_TURNSTILE` | — | un token de Turnstile capturado (igual que `--token`; una cuenta) — útil cuando el lanzador ejecuta el acuñado |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | exportados *hacia* `--token-cmd`, para que un solucionador sepa qué resolver |

| Flag | Significado |
| --- | --- |
| `--count N` | cuentas/claves a acuñar (predeterminado 1) |
| `--pool <file>` | lista de proxies, una salida por línea |
| `--token <tok>` | un token de Turnstile capturado — **una sola cuenta**, el token se gasta una vez |
| `--token-cmd <cmd>` | comando que imprime un token nuevo en stdout (`--count` > 1 lo necesita) |
| `--manual` | pega el token cuando se solicite |
| `--mailtrap-token <t>` | token de API de Mailtrap |
| `--mt-folder <name>` | carpeta de Mailtrap para las bandejas (predeterminado `onomeo`) |
| `--model <id>` | modelo para la puerta de chat |
| `--exits N` | intentos por cuenta, una salida cada uno (predeterminado 6) |
| `--verify-only` · `--screen` · `--help` | re-verificar · sondear salidas · este texto |

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala (el límite de registro es por IP: 3 cuentas/día).** La herramienta también funciona sin proxy.

- **Con un grupo:** pasa `--pool <file>` (o define `ONOMEO_PROXIES`) y cada solicitud pasa por una salida de esa lista; el riel rota una salida por cuenta y reintenta una salida moribunda en sus vecinas. Una línea muerta falla ese intento — un grupo proporcionado nunca recurre a tu propia dirección.
- **Sin un grupo:** el CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente. El registro, el acuñado de claves y la puerta de chat no cambian — solo desde dónde salen los paquetes.
- `--screen` prueba las salidas que tienes contra `https://onomeo.com/api/info` antes de una ejecución.

> **Bloqueo de escala (medido el 2026-10-21/22, documentado con honestidad).** El widget de Cloudflare Turnstile solo se resolvió en una **pequeña porción de las salidas** que tenía la flota: en la ejecución de escala de 3 claves, **2 de 11 salidas alcanzables** produjeron un token (y **1 de 28** en la primera pasada de sondeo), mientras que todas las demás salidas alcanzables devolvieron un token de **longitud cero** (tramas keep-alive `food` de la página de desafío) y el registro entonces no pudo continuar. Resolver y gastar también debe ocurrir en la **misma** salida — un token resuelto en otro lugar se rechaza. Así que este repositorio es una **herramienta de acuñado en funcionamiento, no una flota de claves terminada**: con un solucionador que venza a Turnstile en tus salidas (o un token pegado a mano) acuña y verifica claves de extremo a extremo; sin uno, se detiene en el paso del código y lo dice. Las claves vivas existentes se pueden re-verificar en cualquier momento con `--verify-only`.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea (`sk-onomeo-…`) — ignorada por git |
| `accounts.json` | correo / id de bandeja de Mailtrap / clave (enmascarada) / salida / resultados de sondas — ignorado por git |
| `proxies.txt` | tus salidas, una por línea — ignorado por git |

## 🔌 Conectar a 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Predeterminados: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Los modelos se sirven como `onomeo/<model id>` y se balancean entre todas las claves de `keys.txt`.

## 🔌 Conectar a OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Predeterminados: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Los modelos se sirven como `onomeo/<model id>` y se balancean entre todas las claves de `keys.txt`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 Qué da el proveedor | una cuenta por clave — código por correo tras Turnstile, cada clave verificada por chat |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 28 ids de modelos en el endpoint de abajo, a los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta a onomeo.com y al backend de bandeja que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

Si Onomeo cambia su registro por correo, su sitekey de Turnstile, el encabezado `x-onomeo-web` o los límites de `/api/info`, la herramienta se detiene en ese paso y lo dice. **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PR son bienvenidos.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>