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

**Créez en masse des comptes Onomeo avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-28-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

Onomeo est un agrégateur compatible OpenAI : `https://onomeo.com/v1`, 28 identifiants de modèles, `Authorization: Bearer sk-onomeo-…`. L'inscription se fait par **code e-mail** — aucun mot de passe à choisir, aucune carte — et la clé API *est* ce que renvoie l'appel de vérification. Le seul obstacle sur le chemin est un widget Cloudflare Turnstile, c'est pourquoi cet outil prend un jeton résolu (`--token-cmd` ou `--manual`) puis fait le reste tout seul : boîte de réception neuve → code → clé → preuve de chat en direct.

## 🎁 Offre gratuite — ce que vous obtenez

**Chaque nouveau compte reçoit sa propre allocation gratuite** — sans carte.

| Élément | Valeur (d'après le `GET /api/info` public, mesuré le 2026-10-21) |
| --- | --- |
| Modèles gratuits | **13** (listés ci-dessus) |
| Appels par compte | **30 / 5 h** |
| Appels par réseau | **60 / 5 h** |
| Débit par clé | **12 / min** |
| Comptes par IP et par jour | **3** (`accountsPerIpPerDay`) |
| Récompense d'invitation | **45 appels / 7 jours** |
| BYOK | pris en charge (apportez votre propre clé amont) |
| L'unité qui évolue | **un compte = une clé** → `--count N` signifie « N comptes gratuits » |

Le plafond par compte est la raison pour laquelle le rail maintient **un compte par clé** et pourquoi un pool de proxys est utile : le panneau compte les inscriptions par adresse.

> 💡 L'offre gratuite est définie par Onomeo et peut changer. Consultez les chiffres en direct sur [onomeo.com](https://onomeo.com) — et laissez la propre barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 28 au complet

Le catalogue compte **28 identifiants**. Le point d'accès sert à la fois les modèles gratuits et ceux financés par le compte ; ceux que ce rail a prouvés avec une réponse *vérifiable* (pas seulement un 200) sont listés ci-dessus et dans `src/cli.js` comme sondes de la barrière :

| Identifiant du modèle | Preuve |
| --- | --- |
| `deepseek-v4-flash` | **200** + vérification de la réponse (`17 * 3` → `51`), sur chaque clé créée par le rail |
| `glm-5.2` | **200** + vérification de la réponse (or → `Au`), sur chaque clé créée par le rail |
| `auto` | **200** + appel d'outil (`get_time` présent dans la réponse), mesuré sur les mêmes clés |

L'offre gratuite du panneau expose 13 des identifiants (`/api/info`) : `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Chaque réponse porte le suffixe `— via onomeo.com` du site ; c'est le panneau qui ajoute l'attribution, pas le modèle.

## 🧪 Comment utiliser l'API

L'URL de base est **`https://onomeo.com/v1`** — compatible OpenAI. Chaque requête nécessite l'en-tête du site **`x-onomeo-web: 1`** à côté du jeton bearer ; sans lui, le point d'accès répond comme un client anonyme.

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

> Le lecteur dans `src/cli.js` accepte **à la fois** un corps JSON brut et un corps `text/event-stream` : le panneau a répondu à des requêtes `stream:false` avec des trames SSE `data:`, et un lecteur JSON uniquement signale alors une clé active comme morte.

## 🛠 Démarrage rapide

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

`keys.txt` n'est écrit **qu'**après un `chat-200` en direct plus les deux sondes de contenu qui prouvent la clé.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys (facultative — sans elle, le CLI se connecte directement), le nombre, le modèle de vérification et le jeton Mailtrap, les mémorise dans `launcher.config.json`, et exécute le CLI — création, vérification, test des sorties, paramètres, aide, Connect to 9Router.

Il ne peut pas deviner le jeton Turnstile, donc une création lancée depuis le lanceur a toujours besoin de `--token-cmd` (ou `--manual`) transmis au CLI.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `GET /api/info` (en-tête `x-onomeo-web: 1`) | **200** — configuration publique : 13 modèles gratuits, 30 appels/compte/5h, 60/réseau/5h, 12/min par clé, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — avec un vrai jeton provenant de la même sortie |
| courrier | `onomeo verification code: 617076` dans la boîte de réception créée par l'exécution |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **est** la clé API |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — catalogue de 28 identifiants |
| `POST /v1/chat/completions` — exécuté pour **chaque** clé avant son écriture | **200** avec la réponse attendue (`51`, `Au`) |
| appel d'outil (`auto`) | **200** — `get_time` présent dans la réponse |
| une clé qui échoue à ses sondes | jamais écrite dans `keys.txt` — le compte reste récupérable dans `accounts.json` |

Trois clés créées le 2026-10-21 ont été re-vérifiées en direct plus tard le même jour (`/v1/models` 200 + chat 200).

> **Barrières de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons de routeur suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans prise en charge des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais masqués.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| boîte aux lettres | Mailtrap `POST /inbound/folders/{id}/inboxes` | une adresse `…@inbound-mailtrap.io` neuve par compte |
| turnstile | widget Cloudflare, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | résolu **sur la même sortie** qui dépense le jeton ; `--token-cmd`, un `--token` capturé, ou `--manual` |
| code | `POST /api/auth/email/code {email,lang,turnstile}` | un jeton que cette sortie n'a pas résolu est refusé (`delivered` ne devient jamais vrai) |
| courrier | interroger la même boîte de réception | `onomeo verification code: <6 digits>` |
| vérification | `POST /api/auth/email/verify {email,code}` | **`.secret` est la clé API** ; réessayé sur d'autres sorties quand une sortie meurt en cours de flux |
| contrôle | `GET /v1/models` + 2 sondes de contenu | un `chat-200` en direct avec la bonne réponse est requis avant `keys.txt` |

## ⚙️ Options du CLI

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Env | Défaut | Signification |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | pool de sorties, une ligne par proxy — facultatif : sans pool, le CLI se connecte directement |
| `ONOMEO_MAILTRAP_TOKEN` | — | votre jeton API Mailtrap (Settings → API Tokens) ; le rail de boîte de réception |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | modèle pour la barrière de chat |
| `ONOMEO_TURNSTILE` | — | un jeton Turnstile capturé (identique à `--token` ; un compte) — pratique quand le lanceur exécute la création |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | exportés *vers* `--token-cmd`, pour qu'un solveur sache quoi résoudre |

| Option | Signification |
| --- | --- |
| `--count N` | comptes/clés à créer (défaut 1) |
| `--pool <file>` | liste de proxys, une sortie par ligne |
| `--token <tok>` | un jeton Turnstile capturé — **compte unique**, le jeton est dépensé une fois |
| `--token-cmd <cmd>` | commande qui affiche un jeton frais sur stdout (`--count` > 1 nécessite ceci) |
| `--manual` | coller le jeton lorsqu'il est demandé |
| `--mailtrap-token <t>` | jeton API Mailtrap |
| `--mt-folder <name>` | dossier Mailtrap pour les boîtes de réception (défaut `onomeo`) |
| `--model <id>` | modèle pour la barrière de chat |
| `--tries N` | tentatives par compte, une sortie chacune (défaut 2) |
| `--verify-only` · `--screen` · `--help` | re-vérifier · tester les sorties · ce texte |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle (la limite d'inscription est par IP : 3 comptes/jour).** L'outil fonctionne aussi sans proxy.

- **Avec un pool :** passez `--pool <file>` (ou définissez `ONOMEO_PROXIES`) et chaque requête passe par une sortie de cette liste ; le rail fait tourner une sortie par compte et réessaie une sortie mourante sur ses voisines. Une ligne morte fait échouer cette tentative — un pool fourni ne retombe jamais sur votre propre adresse.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement. L'inscription, la création de clé et la barrière de chat sont inchangées — seul le point de départ des paquets change.
- `--screen` teste les sorties dont vous disposez contre `https://onomeo.com/api/info` avant une exécution.

> **Blocage à grande échelle (mesuré les 2026-10-21/22, documenté honnêtement).** Le widget Cloudflare Turnstile ne s'est résolu que sur une **petite fraction des sorties** dont disposait la flotte : dans l'exécution à l'échelle de 3 clés, **2 sorties sur 11 joignables** ont produit un jeton (et **1 sur 28** lors de la première passe de test), tandis que toutes les autres sorties joignables renvoyaient un jeton de **longueur nulle** (trames keep-alive `food` de la page de défi) et l'inscription ne pouvait alors pas se poursuivre. La résolution et la dépense doivent aussi se produire sur la **même** sortie — un jeton résolu ailleurs est refusé. Ce dépôt est donc un **outil de création fonctionnel, pas une flotte de clés finie** : avec un solveur qui bat Turnstile sur vos sorties (ou un jeton collé à la main), il crée et vérifie les clés de bout en bout ; sans cela, il s'arrête à l'étape du code et le dit. Les clés actives existantes sont re-vérifiables à tout moment avec `--verify-only`.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne (`sk-onomeo-…`) — ignoré par git |
| `accounts.json` | e-mail / id de boîte Mailtrap / clé (masquée) / sortie / résultats des sondes — ignoré par git |
| `proxies.txt` | vos sorties, une par ligne — ignoré par git |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé, compatible OpenAI :

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Défauts : `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Les modèles sont servis sous `onomeo/<model id>` et répartis en charge sur chaque clé de `keys.txt`.

## 🔌 Connexion à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé, compatible OpenAI :

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Défauts : `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Les modèles sont servis sous `onomeo/<model id>` et répartis en charge sur chaque clé de `keys.txt`.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 Ce que le fournisseur donne | un compte par clé — code e-mail derrière Turnstile, chaque clé vérifiée par chat |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 28 identifiants de modèles sur le point d'accès ci-dessous, aux limites de votre offre. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Vos données | seuls onomeo.com et le backend de boîte de réception que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si Onomeo modifie son inscription par e-mail, sa sitekey Turnstile, l'en-tête `x-onomeo-web` ou les limites de `/api/info`, l'outil s'arrête à cette étape et le dit. **[Ouvrez un ticket](../../issues)** avec la commande que vous avez exécutée et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>