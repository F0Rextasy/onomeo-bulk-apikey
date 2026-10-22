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

**自動生成された API キーで Onomeo アカウントを一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-28-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 イシュー](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Onomeo は OpenAI 互換のアグリゲーターです: `https://onomeo.com/v1`、28 個のモデル ID、`Authorization: Bearer sk-onomeo-…`。サインアップは**メールコード**方式 — パスワードを選ぶ必要も、カードも不要 — そして API キーは*まさに*検証呼び出しが返すものです。唯一の障壁は Cloudflare Turnstile ウィジェットであり、だからこそこのツールは解決済みトークン（`--token-cmd` または `--manual`）を受け取り、あとは自力で残りをこなします: 新しい受信箱 → コード → キー → ライブチャットでの証明。

## 🎁 無料枠 — どれだけ得られるか

**すべての新規アカウントに独自の無料枠が付与されます** — カード不要。

| 項目 | 値（公開 `GET /api/info` より、2026-10-21 計測） |
| --- | --- |
| 無料モデル | **13**（上記に記載） |
| アカウントあたりの呼び出し | **30 / 5 時間** |
| ネットワークあたりの呼び出し | **60 / 5 時間** |
| キーあたりのレート | **12 / 分** |
| 1 日あたりの IP ごとのアカウント数 | **3**（`accountsPerIpPerDay`） |
| 招待報酬 | **45 呼び出し / 7 日間** |
| BYOK | 対応（自身のアップストリームキーを持ち込み可能） |
| スケールする単位 | **1 アカウント = 1 キー** → `--count N` は「N 個の無料アカウント」 |

アカウントごとの上限があるため、このレールは**キーごとに 1 アカウント**を維持し、プロキシプールがその価値を発揮します: パネルはアドレスごとにサインアップをカウントします。

> 💡 無料枠は Onomeo が設定するもので、変更される可能性があります。最新の数値は [onomeo.com](https://onomeo.com) で確認してください — そしてツール自身のゲートに判断を委ねましょう:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全 28 個

カタログは **28 個の ID** です。エンドポイントは無料モデルとアカウント資金によるモデルの両方を提供します。このレールが*検証可能な*回答（単なる 200 ではなく）で証明したものは上記および `src/cli.js` にゲートプローブとして記載されています:

| モデル ID | 証明 |
| --- | --- |
| `deepseek-v4-flash` | **200** + 回答チェック（`17 * 3` → `51`）、レールが生成したすべてのキーで |
| `glm-5.2` | **200** + 回答チェック（gold → `Au`）、レールが生成したすべてのキーで |
| `auto` | **200** + ツール呼び出し（返信に `get_time` が存在）、同じキーで計測 |

パネルの無料枠は 13 個の ID を公開しています（`/api/info`）: `auto`、`deepseek-v4-flash`、`glm-5.2`、`gemini-3.5-flash-lite`、`gpt-oss-20b`、`muse-glimmer-30b`、`glm-5.3-flash`、`codestral-latest`、`ministral-14b-latest`、`hy4-preview`、`stealth/glyph-cluster`、`glm-4.5-flash`、`glm-4.6v-flash`。

> ⚠️ すべての返信にはサイトの `— via onomeo.com` サフィックスが付きます。これはモデルではなく、パネルが帰属表示を追加しているものです。

## 🧪 API の使い方

ベース URL は **`https://onomeo.com/v1`** — OpenAI 互換です。すべてのリクエストにはベアラートークンの隣にサイトヘッダー **`x-onomeo-web: 1`** が必要です。これがないとエンドポイントは匿名クライアントとして応答します。

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

> `src/cli.js` のリーダーは**両方**を受け付けます: プレーンな JSON ボディと `text/event-stream` のもの。パネルは `stream:false` リクエストに対して SSE `data:` フレームで応答したことがあり、JSON 専用のリーダーはその場合ライブキーを死んでいるものとして報告してしまいます。

## 🛠 クイックスタート

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

`keys.txt` はライブの `chat-200` と 2 つのコンテンツプローブがキーを証明した**後にのみ**書き込まれます。

### 🖱️ ランチャー

ランチャーはプロキシリスト（オプション — なければ CLI は直接実行）、カウント、検証モデル、Mailtrap トークンを尋ね、それらを `launcher.config.json` に記憶し、CLI を実行します — 生成、検証、終了、設定、ヘルプ、9Router への接続。

Turnstile トークンを推測することはできないため、ランチャーから開始した生成でも CLI に `--token-cmd`（または `--manual`）を渡す必要があります。

## ✅ 検証済みで動作 — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/info`（ヘッダー `x-onomeo-web: 1`） | **200** — 公開設定: 13 個の無料モデル、30 呼び出し/アカウント/5 時間、60/ネットワーク/5 時間、12/分 キーあたり、`accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — 同じ出口からの本物のトークンで |
| メール | 実行が作成した受信箱に `onomeo verification code: 617076` |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` が**まさに** API キー |
| `GET /v1/models`（Bearer + `x-onomeo-web: 1`） | **200** — 28 個の ID のカタログ |
| `POST /v1/chat/completions` — 書き込まれる前の**すべての**キーに対して実行 | **200** 期待される回答付き（`51`、`Au`） |
| ツール呼び出し（`auto`） | **200** — 返信に `get_time` が存在 |
| プローブに失敗したキー | `keys.txt` に決して書き込まれない — アカウントは `accounts.json` で復元可能なまま |

2026-10-21 に生成された 3 つのキーは、同日後半にライブで再検証されました（`/v1/models` 200 + chat 200）。

> **品質ゲート。** ここにあるすべてのキーは `keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` に応答し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加される代わりに除外されます。検証ステップはいつでも再実行できます;
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| メールボックス | Mailtrap `POST /inbound/folders/{id}/inboxes` | アカウントごとに新しい `…@inbound-mailtrap.io` アドレス |
| turnstile | Cloudflare ウィジェット、sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | トークンを消費する**同じ出口**で解決; `--token-cmd`、キャプチャした `--token`、または `--manual` |
| コード | `POST /api/auth/email/code {email,lang,turnstile}` | この出口が解決しなかったトークンは拒否される（`delivered` が true にならない） |
| メール | 同じ受信箱をポーリング | `onomeo verification code: <6 digits>` |
| 検証 | `POST /api/auth/email/verify {email,code}` | **`.secret` が API キー**; 出口がフロー途中で死んだ場合、他の出口で再試行 |
| チェック | `GET /v1/models` + 2 つのコンテンツプローブ | `keys.txt` の前に、正しい回答を伴うライブの `chat-200` が必要 |

## ⚙️ CLI オプション

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | 出口プール、1 行につき 1 プロキシ — オプション: プールがなければ CLI は直接接続 |
| `ONOMEO_MAILTRAP_TOKEN` | — | あなたの Mailtrap API トークン（Settings → API Tokens）; 受信箱レール |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | チャットゲート用のモデル |
| `ONOMEO_TURNSTILE` | — | キャプチャした Turnstile トークン（`--token` と同じ; 1 アカウント） — ランチャーが生成を実行する際に便利 |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | `--token-cmd` に*エクスポート*され、ソルバーが何を解くべきか把握できる |

| フラグ | 意味 |
| --- | --- |
| `--count N` | 生成するアカウント/キー数（デフォルト 1） |
| `--pool <file>` | プロキシリスト、1 行につき 1 出口 |
| `--token <tok>` | キャプチャした 1 つの Turnstile トークン — **単一アカウント**、トークンは 1 回だけ消費される |
| `--token-cmd <cmd>` | stdout に新しいトークンを出力するコマンド（`--count` > 1 にはこれが必要） |
| `--manual` | プロンプトが表示されたらトークンを貼り付け |
| `--mailtrap-token <t>` | Mailtrap API トークン |
| `--mt-folder <name>` | 受信箱用の Mailtrap フォルダ（デフォルト `onomeo`） |
| `--model <id>` | チャットゲート用のモデル |
| `--tries N` | アカウントあたりの試行回数、1 回につき 1 出口（デフォルト 2） |
| `--verify-only` · `--screen` · `--help` | 再検証 · 出口のプローブ · このテキスト |

## 🛰️ プロキシの背後で

**オプション — 大規模運用では推奨（サインアップ制限は IP ごと: 1 日 3 アカウント）。** このツールはプロキシなしでも動作します。

- **プールあり:** `--pool <file>` を渡す（または `ONOMEO_PROXIES` を設定する）と、すべてのリクエストがそのリストの出口を経由します; レールはアカウントごとに 1 つの出口をローテートし、死につつある出口を隣の出口で再試行します。死んだ回線はその試行を失敗させます — 提供されたプールがあなた自身のアドレスにフォールバックすることは決してありません。
- **プールなし:** CLI は `running WITHOUT a proxy (direct)` と表示し、直接接続します。サインアップ、キー生成、チャットゲートは変わりません — 変わるのはパケットが出ていく場所だけです。
- `--screen` は実行前に、あなたが持つ出口を `https://onomeo.com/api/info` に対してテストします。

> **スケールの障壁（2026-10-21/22 計測、正直に文書化）。** Cloudflare Turnstile ウィジェットは、フリートが持っていた出口の**ごく一部**でしか解決しませんでした: 3 キーのスケール実行では、到達可能な 11 の出口のうち **2 つ**がトークンを生成し（最初のスクリーニングパスでは **28 のうち 1**）、他のすべての到達可能な出口は**長さゼロ**のトークン（チャレンジページからの `food` キープアライブフレーム）を返し、その後サインアップを進めることができませんでした。解決と消費もまた**同じ**出口で行われる必要があります — 別の場所で解決されたトークンは拒否されます。したがってこのリポジトリは動作する**生成ツールであり、完成したキーフリートではありません**: あなたの出口で Turnstile を打ち負かすソルバー（または手で貼り付けたトークン）があれば、キーをエンドツーエンドで生成・検証します; なければコードステップで停止し、そう告げます。既存のライブキーは `--verify-only` でいつでも再検証できます。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済みキー（`sk-onomeo-…`） — git 無視 |
| `accounts.json` | メール / Mailtrap 受信箱 ID / キー（マスク済み） / 出口 / プローブ結果 — git 無視 |
| `proxies.txt` | あなたの出口、1 行につき 1 つ — git 無視 |

## 🔌 9Router への接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

デフォルト: `--prefix onomeo`、`--base-url https://onomeo.com/v1`、`--model deepseek-v4-flash`。モデルは `onomeo/<model id>` として提供され、`keys.txt` 内のすべてのキーにわたってロードバランスされます。

## 🔌 OmniRoute への接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

デフォルト: `--prefix onomeo`、`--base-url https://onomeo.com/v1`、`--model deepseek-v4-flash`。モデルは `onomeo/<model id>` として提供され、`keys.txt` 内のすべてのキーにわたってロードバランスされます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 プロバイダーが提供するもの | キーごとに 1 アカウント — Turnstile の背後にあるメールコード、すべてのキーがチャット検証済み |
| 🔑 1 つのキーで得られるもの | 自身のアカウントにスコープされた 1 つの API キー: 下記エンドポイントの 28 個のモデル ID を、あなたのプランの制限で。クォータは**アカウント**に存在し、まさにそれがこのツールがキーごとに 1 アカウントを作成する理由です |
| 🌐 API の形 | OpenAI 互換: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは onomeo.com とあなたが設定した受信箱バックエンドのみ; キーはあなたのマシンに留まります |

## 🐞 イシュー

Onomeo がメールサインアップ、Turnstile sitekey、`x-onomeo-web` ヘッダー、または `/api/info` の制限を変更した場合、ツールはそのステップで停止し、そう告げます。実行したコマンドと正確な出力を添えて**[イシューを開いてください](../../issues)**; PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>