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

**자동 생성된 API 키로 Onomeo 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-28-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

Onomeo는 OpenAI 호환 애그리게이터입니다: `https://onomeo.com/v1`, 28개의 모델 id, `Authorization: Bearer sk-onomeo-…`. 가입은 **이메일 코드** 방식입니다 — 선택할 비밀번호도, 카드도 없으며, API 키는 *바로* verify 호출이 돌려주는 값입니다. 유일한 관문은 Cloudflare Turnstile 위젯이며, 그래서 이 도구는 해결된 토큰(`--token-cmd` 또는 `--manual`)을 받은 뒤 나머지를 스스로 처리합니다: 새 받은편지함 → 코드 → 키 → 실시간 채팅 증명.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 신규 계정은 자체 무료 할당량을 받습니다** — 카드 불필요.

| 항목 | 값 (공개 `GET /api/info` 기준, 2026-10-21 측정) |
| --- | --- |
| 무료 모델 | **13개** (위에 나열) |
| 계정당 호출 | **30 / 5시간** |
| 네트워크당 호출 | **60 / 5시간** |
| 키당 속도 | **12 / 분** |
| IP당 일일 계정 수 | **3** (`accountsPerIpPerDay`) |
| 초대 보상 | **45 호출 / 7일** |
| BYOK | 지원됨 (자체 업스트림 키 사용) |
| 확장되는 단위 | **계정 하나 = 키 하나** → `--count N`은 "무료 계정 N개" |

계정당 상한이 바로 이 레일이 **키당 계정 하나**를 유지하는 이유이며, 프록시 풀이 가치를 발휘하는 이유입니다: 패널은 주소별로 가입 수를 집계합니다.

> 💡 무료 티어는 Onomeo가 설정하며 변경될 수 있습니다. 실시간 수치는 [onomeo.com](https://onomeo.com)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # keys.txt의 모든 키가 실제 채팅 호출로 재검증됩니다
```

## 🤖 모델 — 28개 전부

카탈로그는 **28개의 id**입니다. 엔드포인트는 무료 모델과 계정 자금 모델을 모두 제공합니다; 이 레일이 *검증 가능한* 답변(단순 200이 아닌)으로 증명한 모델은 위에 나열되어 있으며 `src/cli.js`에 게이트 프로브로 있습니다:

| 모델 ID | 증명 |
| --- | --- |
| `deepseek-v4-flash` | **200** + 답변 검증 (`17 * 3` → `51`), 레일이 발급한 모든 키에서 |
| `glm-5.2` | **200** + 답변 검증 (gold → `Au`), 레일이 발급한 모든 키에서 |
| `auto` | **200** + 도구 호출 (응답에 `get_time` 존재), 동일한 키에서 측정 |

패널의 무료 티어는 id 중 13개를 노출합니다 (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ 모든 응답에는 사이트의 `— via onomeo.com` 접미사가 붙습니다; 이는 모델이 아니라 패널이 출처 표시를 추가하는 것입니다.

## 🧪 API 사용 방법

베이스 URL은 **`https://onomeo.com/v1`** 입니다 — OpenAI 호환. 모든 요청에는 베어러 토큰 옆에 사이트 헤더 **`x-onomeo-web: 1`**이 필요합니다; 이것이 없으면 엔드포인트는 익명 클라이언트로 응답합니다.

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

> `src/cli.js`의 리더는 **일반 JSON 본문과** `text/event-stream` 본문 **둘 다** 허용합니다: 패널이 `stream:false` 요청에 SSE `data:` 프레임으로 응답한 적이 있으며, JSON 전용 리더는 그러면 살아있는 키를 죽은 것으로 보고합니다.

## 🛠 빠른 시작

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

`keys.txt`는 실시간 `chat-200`과 두 가지 콘텐츠 프로브가 키를 증명한 **후에만** 기록됩니다.

### 🖱️ 런처

런처는 프록시 목록(선택 사항 — 없으면 CLI는 직접 연결), 개수, 검증 모델, Mailtrap 토큰을 묻고, 이를 `launcher.config.json`에 기억한 뒤 CLI를 실행합니다 — 발급, 검증, 출구 스크리닝, 설정, 도움말, 9Router 연결.

런처는 Turnstile 토큰을 추측할 수 없으므로, 런처에서 시작한 발급도 여전히 CLI로 `--token-cmd`(또는 `--manual`)를 전달해야 합니다.

## ✅ 검증됨 — 모든 키가 테스트됩니다

| 검사 | 결과 |
| --- | --- |
| `GET /api/info` (헤더 `x-onomeo-web: 1`) | **200** — 공개 설정: 무료 모델 13개, 30 호출/계정/5시간, 60/네트워크/5시간, 키당 12/분, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — 동일한 출구에서 얻은 실제 토큰으로 |
| 메일 | 실행이 생성한 받은편지함에 `onomeo verification code: 617076` |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret`이 **바로** API 키 |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — 28개 id 카탈로그 |
| `POST /v1/chat/completions` — 기록되기 **전에** 모든 키에 대해 실행 | **200** 예상 답변과 함께 (`51`, `Au`) |
| 도구 호출 (`auto`) | **200** — 응답에 `get_time` 존재 |
| 프로브에 실패한 키 | `keys.txt`에 절대 기록되지 않음 — 계정은 `accounts.json`에서 복구 가능하게 유지됨 |

2026-10-21에 발급된 세 개의 키는 같은 날 나중에 실시간으로 재검증되었습니다 (`/v1/models` 200 + chat 200).

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 콤보도 모델 수준에서 동일한 규칙을 따릅니다: 항목은
> **모델이 `chat-200`으로 응답하고 도구를 호출할 수 있을 때만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 언제든지 검증 단계를 다시 실행하세요;
> 실패는 보고되며 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| mailbox | Mailtrap `POST /inbound/folders/{id}/inboxes` | 계정당 새 `…@inbound-mailtrap.io` 주소 |
| turnstile | Cloudflare 위젯, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | 토큰을 소비하는 **동일한 출구에서** 해결됨; `--token-cmd`, 캡처된 `--token`, 또는 `--manual` |
| code | `POST /api/auth/email/code {email,lang,turnstile}` | 이 출구가 해결하지 않은 토큰은 거부됨 (`delivered`가 true가 되지 않음) |
| mail | 동일한 받은편지함 폴링 | `onomeo verification code: <6 digits>` |
| verify | `POST /api/auth/email/verify {email,code}` | **`.secret`이 API 키**; 흐름 중간에 출구가 죽으면 다른 출구에서 재시도 |
| check | `GET /v1/models` + 2개 콘텐츠 프로브 | `keys.txt` 전에 올바른 답변과 함께 실시간 `chat-200`이 필요 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | 출구 풀, 프록시당 한 줄 — 선택 사항: 풀이 없으면 CLI는 직접 연결 |
| `ONOMEO_MAILTRAP_TOKEN` | — | Mailtrap API 토큰 (Settings → API Tokens); 받은편지함 레일 |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | 채팅 게이트용 모델 |
| `ONOMEO_TURNSTILE` | — | 캡처된 Turnstile 토큰 (`--token`과 동일; 계정 하나) — 런처가 발급을 실행할 때 유용 |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | `--token-cmd`로 *내보내짐*, 솔버가 무엇을 풀어야 하는지 알 수 있도록 |

| 플래그 | 의미 |
| --- | --- |
| `--count N` | 발급할 계정/키 수 (기본 1) |
| `--pool <file>` | 프록시 목록, 줄당 출구 하나 |
| `--token <tok>` | 캡처된 Turnstile 토큰 하나 — **단일 계정**, 토큰은 한 번만 소비됨 |
| `--token-cmd <cmd>` | stdout에 새 토큰을 출력하는 명령 (`--count` > 1에는 이것이 필요) |
| `--manual` | 프롬프트가 나오면 토큰 붙여넣기 |
| `--mailtrap-token <t>` | Mailtrap API 토큰 |
| `--mt-folder <name>` | 받은편지함용 Mailtrap 폴더 (기본 `onomeo`) |
| `--model <id>` | 채팅 게이트용 모델 |
| `--tries N` | 계정당 시도 횟수, 각각 다른 출구 (기본 2) |
| `--verify-only` · `--screen` · `--help` | 재검증 · 출구 프로브 · 이 텍스트 |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장 (가입 제한은 IP당: 하루 3계정).** 이 도구는 프록시 없이도 작동합니다.

- **풀이 있을 때:** `--pool <file>`을 전달하거나 `ONOMEO_PROXIES`를 설정하면 모든 요청이 해당 목록의 출구를 통해 나갑니다; 레일은 계정당 출구 하나를 순환하고 죽어가는 출구를 이웃에서 재시도합니다. 죽은 회선은 해당 시도를 실패시킵니다 — 제공된 풀은 절대 자체 주소로 폴백하지 않습니다.
- **풀이 없을 때:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다. 가입, 키 발급, 채팅 게이트는 변경되지 않습니다 — 패킷이 나가는 위치만 다릅니다.
- `--screen`은 실행 전에 보유한 출구를 `https://onomeo.com/api/info`에 대해 테스트합니다.

> **규모 병목 (2026-10-21/22 측정, 솔직하게 문서화).** Cloudflare Turnstile 위젯은 플릿이 보유한 출구 중 **일부에서만** 해결되었습니다: 3키 규모 실행에서 **도달 가능한 출구 11개 중 2개**가 토큰을 생성했고(첫 스크리닝 패스에서는 **28개 중 1개**), 다른 모든 도달 가능한 출구는 **길이 0**의 토큰(챌린지 페이지의 `food` keep-alive 프레임)을 반환하여 가입이 진행될 수 없었습니다. 해결과 소비도 **동일한** 출구에서 이루어져야 합니다 — 다른 곳에서 해결된 토큰은 거부됩니다. 따라서 이 저장소는 작동하는 **발급 도구이지 완성된 키 플릿이 아닙니다**: 출구에서 Turnstile을 이기는 솔버(또는 직접 붙여넣은 토큰)가 있으면 키를 처음부터 끝까지 발급하고 검증합니다; 없으면 코드 단계에서 멈추고 그렇게 알립니다. 기존의 살아있는 키는 언제든지 `--verify-only`로 재검증할 수 있습니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 (`sk-onomeo-…`) — git-ignored |
| `accounts.json` | 이메일 / Mailtrap 받은편지함 id / 키 (마스킹됨) / 출구 / 프로브 결과 — git-ignored |
| `proxies.txt` | 출구 목록, 한 줄에 하나 — git-ignored |

## 🔌 9Router 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

기본값: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. 모델은 `onomeo/<model id>`로 제공되며 `keys.txt`의 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔌 OmniRoute 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

기본값: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. 모델은 `onomeo/<model id>`로 제공되며 `keys.txt`의 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 제공자가 주는 것 | 키당 계정 하나 — Turnstile 뒤의 이메일 코드, 모든 키가 채팅 검증됨 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 한정된 API 키 하나: 아래 엔드포인트의 28개 모델 id, 요금제 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키당 계정 하나를 생성하는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 데이터 | onomeo.com과 설정한 받은편지함 백엔드만 접속됩니다; 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

Onomeo가 이메일 가입, Turnstile sitekey, `x-onomeo-web` 헤더 또는 `/api/info` 한도를 변경하면, 도구는 해당 단계에서 멈추고 그렇게 알립니다. 실행한 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>