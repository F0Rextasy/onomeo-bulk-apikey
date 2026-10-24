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

**批量创建 Onomeo 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-28-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Onomeo 是一个兼容 OpenAI 的聚合服务：`https://onomeo.com/v1`，28 个模型 id，`Authorization: Bearer sk-onomeo-…`。注册方式是**邮箱验证码**——无需设置密码，无需银行卡——而 API 密钥*正是*验证调用返回的内容。唯一的障碍是 Cloudflare Turnstile 组件，因此本工具接收一个已解出的 token（`--token-cmd` 或 `--manual`），然后自行完成其余工作：全新收件箱 → 验证码 → 密钥 → 实时聊天验证。

## 🎁 免费额度 — 你能获得多少

**每个新账户都有自己的免费额度**——无需银行卡。

| 项目 | 数值（来自公开的 `GET /api/info`，测量于 2026-10-21） |
| --- | --- |
| 免费模型 | **13** 个（见上文） |
| 每账户调用次数 | **30 / 5 小时** |
| 每网络调用次数 | **60 / 5 小时** |
| 每密钥速率 | **12 / 分钟** |
| 每 IP 每日账户数 | **3**（`accountsPerIpPerDay`） |
| 邀请奖励 | **45 次调用 / 7 天** |
| BYOK | 支持（自带上游密钥） |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 即“N 个免费账户” |

每账户上限正是这条流水线保持**一账户一密钥**的原因，也是代理池发挥作用的原因：面板按地址统计注册数。

> 💡 免费额度由 Onomeo 设定，可能发生变化。请到 [onomeo.com](https://onomeo.com) 查看实时数值——并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 28 个

目录共有 **28 个 id**。该端点同时提供免费模型和账户付费模型；这条流水线用*可验证*的答案（而不仅仅是 200）证明过的模型列于上文，并在 `src/cli.js` 中作为关卡探针：

| 模型 ID | 证明 |
| --- | --- |
| `deepseek-v4-flash` | **200** + 答案校验（`17 * 3` → `51`），在流水线铸造的每个密钥上 |
| `glm-5.2` | **200** + 答案校验（gold → `Au`），在流水线铸造的每个密钥上 |
| `auto` | **200** + 工具调用（回复中出现 `get_time`），在同一批密钥上测量 |

面板的免费额度开放了其中 13 个 id（`/api/info`）：`auto`、`deepseek-v4-flash`、`glm-5.2`、`gemini-3.5-flash-lite`、`gpt-oss-20b`、`muse-glimmer-30b`、`glm-5.3-flash`、`codestral-latest`、`ministral-14b-latest`、`hy4-preview`、`stealth/glyph-cluster`、`glm-4.5-flash`、`glm-4.6v-flash`。

> ⚠️ 每条回复都带有站点的 `— via onomeo.com` 后缀；那是面板添加的署名，而非模型本身。

## 🧪 如何使用 API

基础 URL 是 **`https://onomeo.com/v1`**——兼容 OpenAI。每个请求都需要在 bearer token 旁边带上站点标头 **`x-onomeo-web: 1`**；没有它，端点会以匿名客户端身份应答。

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

> `src/cli.js` 中的读取器**同时**接受纯 JSON 响应体和 `text/event-stream` 响应体：面板曾对 `stream:false` 请求返回 SSE `data:` 帧，而只认 JSON 的读取器会把一个有效密钥误报为失效。

## 🛠 快速开始

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

`keys.txt` **只有**在一次实时 `chat-200` 加上两个内容探针证明该密钥有效后才会写入。

### 🖱️ 启动器

启动器会询问代理列表（可选——没有代理时 CLI 直接连接）、数量、验证模型和 Mailtrap token，将它们记住在 `launcher.config.json` 中，并运行 CLI——铸造、验证、筛选出口、设置、帮助、连接到 9Router。

它无法猜出 Turnstile token，因此从启动器发起的铸造仍需将 `--token-cmd`（或 `--manual`）传递给 CLI。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| `GET /api/info`（标头 `x-onomeo-web: 1`） | **200** — 公开配置：13 个免费模型，30 次调用/账户/5 小时，60 次/网络/5 小时，12 次/分钟每密钥，`accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — 使用来自同一出口的真实 token |
| 邮件 | 本次运行创建的收件箱中收到 `onomeo verification code: 617076` |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **就是** API 密钥 |
| `GET /v1/models`（Bearer + `x-onomeo-web: 1`） | **200** — 28 个 id 的目录 |
| `POST /v1/chat/completions` — 在写入**每个**密钥前都会运行 | **200**，且答案符合预期（`51`、`Au`） |
| 工具调用（`auto`） | **200** — 回复中出现 `get_time` |
| 未通过探针的密钥 | 绝不写入 `keys.txt` — 该账户仍可在 `accounts.json` 中恢复 |

2026-10-21 铸造的三个密钥在当天晚些时候再次实时验证通过（`/v1/models` 200 + chat 200）。

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （失效密钥绝不交付）。路由器组合在模型层面遵循同样的规则：只有模型能应答 `chat-200`
> **且**能调用工具时才会添加条目——不支持工具的模型、失效的密钥或失效的提供方会被丢弃而非添加。
> 可随时重新运行验证步骤；失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 邮箱 | Mailtrap `POST /inbound/folders/{id}/inboxes` | 每个账户一个全新的 `…@inbound-mailtrap.io` 地址 |
| turnstile | Cloudflare 组件，sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | 在**消耗该 token 的同一出口**上解出；`--token-cmd`、捕获的 `--token` 或 `--manual` |
| 验证码 | `POST /api/auth/email/code {email,lang,turnstile}` | 非本出口解出的 token 会被拒绝（`delivered` 永远不会变为 true） |
| 邮件 | 轮询同一收件箱 | `onomeo verification code: <6 digits>` |
| 验证 | `POST /api/auth/email/verify {email,code}` | **`.secret` 就是 API 密钥**；当某出口在流程中途失效时会在其他出口上重试 |
| 检查 | `GET /v1/models` + 2 个内容探针 | 必须有一次答案正确的实时 `chat-200` 才能写入 `keys.txt` |

## ⚙️ CLI 选项

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | 出口池，每行一个代理——可选：没有代理池时 CLI 直接连接 |
| `ONOMEO_MAILTRAP_TOKEN` | — | 你的 Mailtrap API token（Settings → API Tokens）；收件箱流水线 |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | 用于聊天关卡的模型 |
| `ONOMEO_TURNSTILE` | — | 一个捕获的 Turnstile token（等同于 `--token`；仅限一个账户）——当启动器运行铸造时很方便 |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | 导出*给* `--token-cmd`，以便求解器知道要解什么 |

| 标志 | 含义 |
| --- | --- |
| `--count N` | 要铸造的账户/密钥数量（默认 1） |
| `--pool <file>` | 代理列表，每行一个出口 |
| `--token <tok>` | 一个捕获的 Turnstile token——**仅限单个账户**，该 token 只能使用一次 |
| `--token-cmd <cmd>` | 在 stdout 上打印新 token 的命令（`--count` > 1 时需要） |
| `--manual` | 在提示时粘贴 token |
| `--mailtrap-token <t>` | Mailtrap API token |
| `--mt-folder <name>` | 用于收件箱的 Mailtrap 文件夹（默认 `onomeo`） |
| `--model <id>` | 用于聊天关卡的模型 |
| `--exits N` | 每账户的尝试次数，每次一个出口（默认 6） |
| `--verify-only` · `--screen` · `--help` | 重新验证 · 探测出口 · 本说明 |

## 🛰️ 在代理之后

**可选——大规模使用时推荐（注册限制按 IP 计算：每天 3 个账户）。** 本工具在没有代理时也能工作。

- **有代理池时：** 传入 `--pool <file>`（或设置 `ONOMEO_PROXIES`），每个请求都经过该列表中的一个出口；流水线为每个账户轮换一个出口，并在相邻出口上重试失效的出口。失效的线路会使该次尝试失败——提供的代理池绝不会回退到你自己的地址。
- **没有代理池时：** CLI 会打印 `running WITHOUT a proxy (direct)` 并直接连接。注册、密钥铸造和聊天关卡都不变——只是数据包发出的位置不同。
- `--screen` 会在运行前用 `https://onomeo.com/api/info` 测试你现有的出口。

> **规模瓶颈（测量于 2026-10-21/22，如实记录）。** Cloudflare Turnstile 组件只在集群拥有的**一小部分出口**上解出：在 3 密钥规模运行中，**11 个可达出口中有 2 个**产出了 token（首次筛选时是 **28 个中有 1 个**），而其他所有可达出口都返回**零长度** token（来自挑战页面的 `food` 保活帧），注册随后无法继续。解出和使用也必须在**同一**出口上进行——在其他地方解出的 token 会被拒绝。因此本仓库是一个可用的**铸造工具，而非完成的密钥集群**：如果你的出口上有一个能击败 Turnstile 的求解器（或手动粘贴的 token），它就能端到端地铸造并验证密钥；没有的话，它会停在验证码步骤并如实说明。现有的有效密钥可随时用 `--verify-only` 重新验证。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个实时验证过的密钥（`sk-onomeo-…`）——已被 git 忽略 |
| `accounts.json` | 邮箱 / Mailtrap 收件箱 id / 密钥（已掩码）/ 出口 / 探针结果——已被 git 忽略 |
| `proxies.txt` | 你的出口，每行一个——已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix onomeo`、`--base-url https://onomeo.com/v1`、`--model deepseek-v4-flash`。模型以 `onomeo/<model id>` 形式提供，并在 `keys.txt` 中的每个密钥之间负载均衡。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix onomeo`、`--base-url https://onomeo.com/v1`、`--model deepseek-v4-flash`。模型以 `onomeo/<model id>` 形式提供，并在 `keys.txt` 中的每个密钥之间负载均衡。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供方 | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 提供方给予什么 | 每个密钥一个账户——Turnstile 背后的邮箱验证码，每个密钥都经过聊天验证 |
| 🔑 一个密钥能给你什么 | 一个绑定到其自身账户的 API 密钥：下方端点上的 28 个模型 id，按你的套餐限额。配额存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://onomeo.com/v1/chat/completions` |
| 🔒 你的数据 | 只联系 onomeo.com 和你配置的收件箱后端；密钥留在你的机器上 |

## 🐞 问题

如果 Onomeo 更改其邮箱注册、Turnstile sitekey、`x-onomeo-web` 标头或 `/api/info` 限额，本工具会停在该步骤并如实说明。请**[提交 issue](../../issues)**，附上你运行的命令和确切的输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>