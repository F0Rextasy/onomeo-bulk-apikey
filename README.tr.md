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

**Otomatik oluşturulan API anahtarlarıyla toplu Onomeo hesabı açın — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-28-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Onomeo, OpenAI uyumlu bir toplayıcıdır: `https://onomeo.com/v1`, 28 model kimliği, `Authorization: Bearer sk-onomeo-…`. Kayıt bir **e-posta kodu** ile yapılır — seçilecek parola yok, kart yok — ve API anahtarı *tam olarak* doğrulama çağrısının geri döndürdüğü şeydir. Tek engel bir Cloudflare Turnstile widget'ıdır; bu yüzden bu araç çözülmüş bir token alır (`--token-cmd` veya `--manual`) ve gerisini kendi başına yapar: yeni gelen kutusu → kod → anahtar → canlı sohbet kanıtı.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

**Her yeni hesap kendi ücretsiz hakkını alır** — kart yok.

| Ne | Değer (genel `GET /api/info`'dan, ölçüm 2026-10-21) |
| --- | --- |
| Ücretsiz modeller | **13** (yukarıda listelenmiştir) |
| Hesap başına çağrı | **30 / 5 sa** |
| Ağ başına çağrı | **60 / 5 sa** |
| Anahtar başına hız | **12 / dk** |
| IP başına günlük hesap | **3** (`accountsPerIpPerDay`) |
| Davet ödülü | **45 çağrı / 7 gün** |
| BYOK | desteklenir (kendi üst kaynak anahtarınızı getirin) |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` "N ücretsiz hesap" demektir |

Hesap başına sınır, rayın neden **anahtar başına bir hesap** tuttuğunu ve bir proxy havuzunun neden işe yaradığını açıklar: panel kayıtları adres başına sayar.

> 💡 Ücretsiz katman Onomeo tarafından belirlenir ve değişebilir. Canlı sayıları [onomeo.com](https://onomeo.com) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 28'inin tamamı

Katalog **28 kimlik** içerir. Uç nokta hem ücretsiz hem de hesapla finanse edilen modelleri sunar; bu rayın *doğrulanabilir* bir yanıtla (yalnızca 200 değil) kanıtladığı modeller yukarıda ve `src/cli.js` içinde kapı yoklamaları olarak listelenmiştir:

| Model Kimliği | Kanıt |
| --- | --- |
| `deepseek-v4-flash` | **200** + yanıt kontrolü (`17 * 3` → `51`), rayın ürettiği her anahtarda |
| `glm-5.2` | **200** + yanıt kontrolü (altın → `Au`), rayın ürettiği her anahtarda |
| `auto` | **200** + araç çağrısı (yanıtta `get_time` mevcut), aynı anahtarlarda ölçüldü |

Panelin ücretsiz katmanı kimliklerin 13'ünü sunar (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Her yanıt sitenin `— via onomeo.com` son ekini taşır; bu, modelin değil panelin eklediği atıftır.

## 🧪 API nasıl kullanılır

Temel URL **`https://onomeo.com/v1`** — OpenAI uyumlu. Her istek, bearer token'ın yanında site başlığı **`x-onomeo-web: 1`** gerektirir; bu olmadan uç nokta anonim bir istemci olarak yanıt verir.

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

> `src/cli.js` içindeki okuyucu **hem** düz bir JSON gövdesini hem de bir `text/event-stream` gövdesini kabul eder: panel `stream:false` isteklerine SSE `data:` çerçeveleriyle yanıt vermiştir ve yalnızca JSON okuyan bir okuyucu o zaman canlı bir anahtarı ölü olarak bildirir.

## 🛠 Hızlı başlangıç

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

`keys.txt` **yalnızca** canlı bir `chat-200` artı iki içerik yoklaması anahtarı kanıtladıktan sonra yazılır.

### 🖱️ Başlatıcı

Başlatıcı proxy listesini (isteğe bağlı — olmadan CLI doğrudan çalışır), sayıyı, doğrulama modelini ve Mailtrap token'ını sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi çalıştırır — üret, doğrula, çıkışları tara, ayarlar, yardım, 9Router'a Bağlan.

Turnstile token'ını tahmin edemez, bu yüzden başlatıcıdan başlatılan bir üretim yine de CLI'ye aktarılan `--token-cmd` (veya `--manual`) gerektirir.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `GET /api/info` (başlık `x-onomeo-web: 1`) | **200** — genel yapılandırma: 13 ücretsiz model, 30 çağrı/hesap/5sa, 60/ağ/5sa, anahtar başına 12/dk, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — aynı çıkıştan gerçek bir token ile |
| posta | çalıştırmanın oluşturduğu gelen kutusunda `onomeo verification code: 617076` |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **API anahtarıdır** |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — 28 kimlikten oluşan katalog |
| `POST /v1/chat/completions` — yazılmadan önce **her** anahtar için çalıştırılır | **200** beklenen yanıtla (`51`, `Au`) |
| araç çağırma (`auto`) | **200** — yanıtta `get_time` mevcut |
| yoklamalarında başarısız olan bir anahtar | asla `keys.txt`'ye yazılmaz — hesap `accounts.json` içinde kurtarılabilir kalır |

2026-10-21'de üretilen üç anahtar aynı gün daha sonra canlı olarak yeniden doğrulandı (`/v1/models` 200 + sohbet 200).

> **Kalite kapıları.** Buradaki her anahtar `keys.txt`'ye yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| posta kutusu | Mailtrap `POST /inbound/folders/{id}/inboxes` | hesap başına yeni bir `…@inbound-mailtrap.io` adresi |
| turnstile | Cloudflare widget, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | token'ı harcayan **aynı çıkışta** çözülür; `--token-cmd`, yakalanmış bir `--token` veya `--manual` |
| kod | `POST /api/auth/email/code {email,lang,turnstile}` | bu çıkışın çözmediği bir token reddedilir (`delivered` asla true olmaz) |
| posta | aynı gelen kutusunu yokla | `onomeo verification code: <6 digits>` |
| doğrula | `POST /api/auth/email/verify {email,code}` | **`.secret` API anahtarıdır**; akış ortasında bir çıkış ölürse diğer çıkışlarda yeniden denenir |
| kontrol | `GET /v1/models` + 2 içerik yoklaması | `keys.txt`'den önce doğru yanıtlı canlı bir `chat-200` gerekir |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Ortam | Varsayılan | Anlam |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | çıkış havuzu, proxy başına bir satır — isteğe bağlı: havuz olmadan CLI doğrudan bağlanır |
| `ONOMEO_MAILTRAP_TOKEN` | — | Mailtrap API token'ınız (Settings → API Tokens); gelen kutusu rayı |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | sohbet kapısı için model |
| `ONOMEO_TURNSTILE` | — | yakalanmış bir Turnstile token'ı (`--token` ile aynı; bir hesap) — başlatıcı üretimi çalıştırdığında kullanışlıdır |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | `--token-cmd`'ye *dışa* aktarılır, böylece bir çözücü neyi çözeceğini bilir |

| Bayrak | Anlam |
| --- | --- |
| `--count N` | üretilecek hesap/anahtar (varsayılan 1) |
| `--pool <file>` | proxy listesi, satır başına bir çıkış |
| `--token <tok>` | yakalanmış bir Turnstile token'ı — **tek hesap**, token bir kez harcanır |
| `--token-cmd <cmd>` | stdout'a yeni bir token yazdıran komut (`--count` > 1 bunu gerektirir) |
| `--manual` | istendiğinde token'ı yapıştırın |
| `--mailtrap-token <t>` | Mailtrap API token'ı |
| `--mt-folder <name>` | gelen kutuları için Mailtrap klasörü (varsayılan `onomeo`) |
| `--model <id>` | sohbet kapısı için model |
| `--tries N` | hesap başına deneme, her biri bir çıkış (varsayılan 2) |
| `--verify-only` · `--screen` · `--help` | yeniden doğrula · çıkışları yokla · bu metin |

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir (kayıt sınırı IP başınadır: günde 3 hesap).** Araç proxy olmadan da çalışır.

- **Havuzla:** `--pool <file>` geçin (veya `ONOMEO_PROXIES` ayarlayın) ve her istek o listeden bir çıkıştan geçer; ray hesap başına bir çıkış döndürür ve ölmekte olan bir çıkışı komşularında yeniden dener. Ölü bir satır o denemeyi başarısız kılar — sağlanan bir havuz asla kendi adresinize geri dönmez.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve doğrudan bağlanır. Kayıt, anahtar üretimi ve sohbet kapısı değişmez — yalnızca paketlerin çıktığı yer değişir.
- `--screen`, bir çalıştırmadan önce sahip olduğunuz çıkışları `https://onomeo.com/api/info`'ya karşı test eder.

> **Ölçek engeli (ölçüm 2026-10-21/22, dürüstçe belgelenmiştir).** Cloudflare Turnstile widget'ı filonun sahip olduğu çıkışların yalnızca **küçük bir diliminde** çözüldü: 3 anahtarlık ölçek çalıştırmasında **ulaşılabilir 11 çıkıştan 2'si** bir token üretti (ve ilk tarama geçişinde **28'de 1**), diğer tüm ulaşılabilir çıkışlar **sıfır uzunlukta** bir token döndürdü (meydan okuma sayfasından `food` keep-alive çerçeveleri) ve kayıt daha sonra ilerleyemedi. Çözme ve harcama da **aynı** çıkışta gerçekleşmelidir — başka bir yerde çözülen bir token reddedilir. Yani bu depo çalışan bir **üretim aracıdır, tamamlanmış bir anahtar filosu değil**: çıkışlarınızda Turnstile'ı yenen bir çözücüyle (veya elle yapıştırılmış bir token'la) anahtarları uçtan uca üretir ve doğrular; olmadan kod adımında durur ve bunu söyler. Mevcut canlı anahtarlar `--verify-only` ile her zaman yeniden doğrulanabilir.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına canlı doğrulanmış bir anahtar (`sk-onomeo-…`) — git tarafından yok sayılır |
| `accounts.json` | e-posta / Mailtrap gelen kutusu kimliği / anahtar (maskelenmiş) / çıkış / yoklama sonuçları — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız, satır başına bir tane — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Modeller `onomeo/<model id>` olarak sunulur ve `keys.txt` içindeki her anahtar arasında yük dengelenir.

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Modeller `onomeo/<model id>` olarak sunulur ve `keys.txt` içindeki her anahtar arasında yük dengelenir.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 Sağlayıcının verdikleri | anahtar başına bir hesap — Turnstile arkasında e-posta kodu, her anahtar sohbet ile doğrulanır |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktada 28 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın neden anahtar başına bir hesap oluşturduğunun tam nedeni budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca onomeo.com ve yapılandırdığınız gelen kutusu arka ucuna bağlanılır; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Onomeo e-posta kaydını, Turnstile sitekey'ini, `x-onomeo-web` başlığını veya `/api/info` sınırlarını değiştirirse, araç o adımda durur ve bunu söyler. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey katkıda bulunanlar

</div>