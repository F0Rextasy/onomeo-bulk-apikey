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

**Массовое создание аккаунтов Onomeo с автоматически сгенерированными API-ключами — OpenAI-совместимый инференс + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-28-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Onomeo — это OpenAI-совместимый агрегатор: `https://onomeo.com/v1`, 28 идентификаторов моделей, `Authorization: Bearer sk-onomeo-…`. Регистрация проходит через **код на e-mail** — не нужно выбирать пароль, не нужна карта — а API-ключ *и есть* то, что возвращает вызов верификации. Единственное препятствие на пути — виджет Cloudflare Turnstile, поэтому этот инструмент принимает уже решённый токен (`--token-cmd` или `--manual`) и дальше делает всё сам: свежий почтовый ящик → код → ключ → подтверждение живым чатом.

## 🎁 Бесплатный тариф — сколько вы получаете

**Каждый новый аккаунт получает собственный бесплатный лимит** — без карты.

| Что | Значение (из публичного `GET /api/info`, измерено 2026-10-21) |
| --- | --- |
| Бесплатные модели | **13** (перечислены выше) |
| Запросов на аккаунт | **30 / 5 ч** |
| Запросов на сеть | **60 / 5 ч** |
| Лимит на ключ | **12 / мин** |
| Аккаунтов на IP в день | **3** (`accountsPerIpPerDay`) |
| Награда за приглашение | **45 запросов / 7 дней** |
| BYOK | поддерживается (используйте свой upstream-ключ) |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` означает «N бесплатных аккаунтов» |

Ограничение на аккаунт — причина, по которой инструмент придерживается правила **один аккаунт на ключ**, и почему пул прокси оправдывает себя: панель считает регистрации по адресу.

> 💡 Бесплатный тариф устанавливается Onomeo и может меняться. Проверяйте актуальные цифры на [onomeo.com](https://onomeo.com) — и пусть собственный контроль инструмента решает:

```bash
node src/cli.js --verify-only     # каждый ключ в keys.txt перепроверяется реальным вызовом чата
```

## 🤖 Модели — все 28

Каталог содержит **28 идентификаторов**. Эндпоинт обслуживает как бесплатные, так и оплачиваемые с аккаунта модели; те, что этот инструмент подтвердил *проверяемым* ответом (а не просто 200), перечислены выше и в `src/cli.js` в качестве проверочных проб:

| ID модели | Подтверждение |
| --- | --- |
| `deepseek-v4-flash` | **200** + проверка ответа (`17 * 3` → `51`), на каждом ключе, созданном инструментом |
| `glm-5.2` | **200** + проверка ответа (gold → `Au`), на каждом ключе, созданном инструментом |
| `auto` | **200** + вызов инструмента (`get_time` присутствует в ответе), измерено на тех же ключах |

Бесплатный тариф панели открывает 13 идентификаторов (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Каждый ответ несёт суффикс сайта `— via onomeo.com`; это панель добавляет атрибуцию, а не модель.

## 🧪 Как использовать API

Базовый URL — **`https://onomeo.com/v1`** — OpenAI-совместимый. Каждый запрос требует заголовок сайта **`x-onomeo-web: 1`** рядом с bearer-токеном; без него эндпоинт отвечает как анонимный клиент.

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

> Читатель в `src/cli.js` принимает **и** обычное JSON-тело, **и** `text/event-stream`: панель отвечала на запросы `stream:false` кадрами SSE `data:`, и читатель, понимающий только JSON, тогда сообщает о живом ключе как о мёртвом.

## 🛠 Быстрый старт

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

`keys.txt` записывается **только** после живого `chat-200` плюс две проверки содержимого, подтверждающие ключ.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси (необязательно — без него CLI работает напрямую), количество, модель для проверки и токен Mailtrap, запоминает их в `launcher.config.json` и запускает CLI — создание, проверка, проверка выходов, настройки, справка, Connect to 9Router.

Он не может угадать токен Turnstile, поэтому создание, запущенное из лаунчера, всё равно требует передачи `--token-cmd` (или `--manual`) в CLI.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `GET /api/info` (заголовок `x-onomeo-web: 1`) | **200** — публичная конфигурация: 13 бесплатных моделей, 30 запросов/аккаунт/5ч, 60/сеть/5ч, 12/мин на ключ, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — с реальным токеном с того же выхода |
| почта | `onomeo verification code: 617076` в ящике, созданном запуском |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **и есть** API-ключ |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — каталог из 28 идентификаторов |
| `POST /v1/chat/completions` — выполняется для **каждого** ключа перед записью | **200** с ожидаемым ответом (`51`, `Au`) |
| вызов инструментов (`auto`) | **200** — `get_time` присутствует в ответе |
| ключ, не прошедший проверки | никогда не записывается в `keys.txt` — аккаунт остаётся восстановимым в `accounts.json` |

Три ключа, созданные 2026-10-21, были перепроверены вживую позже в тот же день (`/v1/models` 200 + chat 200).

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` перед записью в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Перезапускайте шаг проверки в любое время;
> сбои сообщаются, никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| почтовый ящик | Mailtrap `POST /inbound/folders/{id}/inboxes` | свежий адрес `…@inbound-mailtrap.io` на каждый аккаунт |
| turnstile | виджет Cloudflare, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | решается **на том же выходе**, который тратит токен; `--token-cmd`, захваченный `--token` или `--manual` |
| код | `POST /api/auth/email/code {email,lang,turnstile}` | токен, решённый не на этом выходе, отклоняется (`delivered` так и не становится true) |
| почта | опрос того же ящика | `onomeo verification code: <6 digits>` |
| верификация | `POST /api/auth/email/verify {email,code}` | **`.secret` — это API-ключ**; повторяется на других выходах, если выход умирает посреди процесса |
| проверка | `GET /v1/models` + 2 проверки содержимого | живой `chat-200` с правильным ответом требуется до записи в `keys.txt` |

## ⚙️ Опции CLI

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Переменная | По умолчанию | Значение |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | пул выходов, одна строка на прокси — необязательно: без пула CLI подключается напрямую |
| `ONOMEO_MAILTRAP_TOKEN` | — | ваш API-токен Mailtrap (Settings → API Tokens); почтовый рельс |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | модель для проверки чатом |
| `ONOMEO_TURNSTILE` | — | захваченный токен Turnstile (то же, что `--token`; один аккаунт) — удобно, когда лаунчер запускает создание |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | экспортируются *в* `--token-cmd`, чтобы решатель знал, что решать |

| Флаг | Значение |
| --- | --- |
| `--count N` | сколько аккаунтов/ключей создать (по умолчанию 1) |
| `--pool <file>` | список прокси, один выход на строку |
| `--token <tok>` | один захваченный токен Turnstile — **один аккаунт**, токен тратится один раз |
| `--token-cmd <cmd>` | команда, выводящая свежий токен в stdout (`--count` > 1 требует этого) |
| `--manual` | вставить токен по запросу |
| `--mailtrap-token <t>` | API-токен Mailtrap |
| `--mt-folder <name>` | папка Mailtrap для ящиков (по умолчанию `onomeo`) |
| `--model <id>` | модель для проверки чатом |
| `--tries N` | попыток на аккаунт, по одному выходу каждая (по умолчанию 2) |
| `--verify-only` · `--screen` · `--help` | перепроверка · проверка выходов · этот текст |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабировании (лимит регистраций на IP: 3 аккаунта/день).** Инструмент работает и без прокси.

- **С пулом:** передайте `--pool <file>` (или задайте `ONOMEO_PROXIES`), и каждый запрос идёт через выход из этого списка; инструмент меняет один выход на аккаунт и повторяет попытку на соседних, если выход умирает. Мёртвая строка проваливает эту попытку — предоставленный пул никогда не откатывается к вашему собственному адресу.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую. Регистрация, создание ключа и проверка чатом не меняются — меняется только то, откуда уходят пакеты.
- `--screen` проверяет имеющиеся у вас выходы против `https://onomeo.com/api/info` перед запуском.

> **Блокер масштабирования (измерено 2026-10-21/22, задокументировано честно).** Виджет Cloudflare Turnstile решался только на **малой доле выходов**, имевшихся в распоряжении: в масштабном запуске на 3 ключа **2 из 11 доступных выходов** выдали токен (и **1 из 28** при первом проходе проверки), тогда как все остальные доступные выходы возвращали токен **нулевой длины** (кадры keep-alive `food` со страницы испытания), и регистрация затем не могла продолжиться. Решение и трата также должны происходить на **одном и том же** выходе — токен, решённый в другом месте, отклоняется. Таким образом, этот репозиторий — рабочий **инструмент создания, а не готовый парк ключей**: с решателем, который побеждает Turnstile на ваших выходах (или с вручную вставленным токеном), он создаёт и проверяет ключи от начала до конца; без него он останавливается на шаге с кодом и сообщает об этом. Существующие живые ключи можно перепроверить в любое время с помощью `--verify-only`.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный вживую ключ на строку (`sk-onomeo-…`) — игнорируется git |
| `accounts.json` | email / id ящика Mailtrap / ключ (замаскирован) / выход / результаты проверок — игнорируется git |
| `proxies.txt` | ваши выходы, по одному на строку — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый OpenAI-совместимый роутер:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

По умолчанию: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Модели обслуживаются как `onomeo/<model id>` и балансируются между всеми ключами в `keys.txt`.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый OpenAI-совместимый роутер:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

По умолчанию: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Модели обслуживаются как `onomeo/<model id>` и балансируются между всеми ключами в `keys.txt`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 Что даёт провайдер | один аккаунт на ключ — код на e-mail за Turnstile, каждый ключ проверен чатом |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 28 идентификаторов моделей на эндпоинте ниже, в пределах лимитов вашего тарифа. Квота живёт на **аккаунте**, и именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Форма API | OpenAI-совместимый: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Ваши данные | связь только с onomeo.com и настроенным вами почтовым бэкендом; ключи остаются на вашей машине |

## 🐞 Проблемы

Если Onomeo изменит регистрацию по e-mail, свой sitekey Turnstile, заголовок `x-onomeo-web` или лимиты `/api/info`, инструмент остановится на этом шаге и сообщит об этом. **[Откройте issue](../../issues)** с командой, которую вы запустили, и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>