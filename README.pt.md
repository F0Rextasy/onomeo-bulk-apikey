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

**Crie contas Onomeo em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-28%20served-412991?style=for-the-badge)](https://onomeo.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Plano gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-28-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

Onomeo é um agregador compatível com OpenAI: `https://onomeo.com/v1`, 28 ids de modelos, `Authorization: Bearer sk-onomeo-…`. O cadastro é por **código de e-mail** — sem senha para escolher, sem cartão — e a chave de API *é* o que a chamada de verificação devolve. O único obstáculo no caminho é um widget Cloudflare Turnstile, e é por isso que esta ferramenta recebe um token já resolvido (`--token-cmd` ou `--manual`) e então faz o resto sozinha: caixa de entrada nova → código → chave → prova de chat ao vivo.

## 🎁 Plano gratuito — quanto você recebe

**Cada nova conta recebe sua própria cota gratuita** — sem cartão.

| O quê | Valor (do `GET /api/info` público, medido em 2026-10-21) |
| --- | --- |
| Modelos gratuitos | **13** (listados acima) |
| Chamadas por conta | **30 / 5 h** |
| Chamadas por rede | **60 / 5 h** |
| Taxa por chave | **12 / min** |
| Contas por IP por dia | **3** (`accountsPerIpPerDay`) |
| Recompensa por convite | **45 chamadas / 7 dias** |
| BYOK | suportado (traga sua própria chave de upstream) |
| A unidade que escala | **uma conta = uma chave** → `--count N` é "N contas gratuitas" |

O limite por conta é o motivo pelo qual o rail mantém **uma conta por chave** e pelo qual um pool de proxies compensa: o painel conta cadastros por endereço.

> 💡 O plano gratuito é definido pela Onomeo e pode mudar. Confira os números ao vivo em [onomeo.com](https://onomeo.com) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 28

O catálogo tem **28 ids**. O endpoint serve tanto modelos gratuitos quanto modelos custeados pela conta; os que este rail comprovou com uma resposta *verificável* (não apenas um 200) estão listados acima e em `src/cli.js` como as sondagens do gate:

| ID do modelo | Prova |
| --- | --- |
| `deepseek-v4-flash` | **200** + verificação de resposta (`17 * 3` → `51`), em cada chave que o rail cunhou |
| `glm-5.2` | **200** + verificação de resposta (ouro → `Au`), em cada chave que o rail cunhou |
| `auto` | **200** + chamada de ferramenta (`get_time` presente na resposta), medido nas mesmas chaves |

O plano gratuito do painel expõe 13 dos ids (`/api/info`): `auto`, `deepseek-v4-flash`, `glm-5.2`, `gemini-3.5-flash-lite`, `gpt-oss-20b`, `muse-glimmer-30b`, `glm-5.3-flash`, `codestral-latest`, `ministral-14b-latest`, `hy4-preview`, `stealth/glyph-cluster`, `glm-4.5-flash`, `glm-4.6v-flash`.

> ⚠️ Toda resposta carrega o sufixo `— via onomeo.com` do site; isso é o painel adicionando atribuição, não o modelo.

## 🧪 Como usar a API

A URL base é **`https://onomeo.com/v1`** — compatível com OpenAI. Toda requisição precisa do cabeçalho do site **`x-onomeo-web: 1`** junto ao token bearer; sem ele o endpoint responde como um cliente anônimo.

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

> O leitor em `src/cli.js` aceita **tanto** um corpo JSON simples quanto um `text/event-stream`: o painel já respondeu a requisições `stream:false` com quadros SSE `data:`, e um leitor apenas de JSON então reporta uma chave ativa como morta.

## 🛠 Início rápido

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

`keys.txt` é escrito **somente** após um `chat-200` ao vivo mais as duas sondagens de conteúdo comprovarem a chave.

### 🖱️ O launcher

O launcher pede a lista de proxies (opcional — sem uma, a CLI roda direto), a contagem, o modelo de verificação e o token do Mailtrap, memoriza-os em `launcher.config.json` e executa a CLI — cunhar, verificar, triagem de saídas, configurações, ajuda, Connect to 9Router.

Ele não consegue adivinhar o token Turnstile, então uma cunhagem iniciada pelo launcher ainda precisa de `--token-cmd` (ou `--manual`) repassado para a CLI.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `GET /api/info` (cabeçalho `x-onomeo-web: 1`) | **200** — configuração pública: 13 modelos gratuitos, 30 chamadas/conta/5h, 60/rede/5h, 12/min por chave, `accountsPerIpPerDay: 3` |
| `POST /api/auth/email/code {email,lang:"en",turnstile:<token>}` | **200** `{"sent":true,"delivered":true,"minutes":10}` — com um token real da mesma saída |
| e-mail | `onomeo verification code: 617076` na caixa de entrada que a execução criou |
| `POST /api/auth/email/verify {email,code}` | **200** `{"secret":"sk-onomeo-…","fresh":true}` — `.secret` **é** a chave de API |
| `GET /v1/models` (Bearer + `x-onomeo-web: 1`) | **200** — catálogo de 28 ids |
| `POST /v1/chat/completions` — executado para **cada** chave antes de ser escrita | **200** com a resposta esperada (`51`, `Au`) |
| chamada de ferramenta (`auto`) | **200** — `get_time` presente na resposta |
| uma chave que falha nas sondagens | nunca é escrita em `keys.txt` — a conta permanece recuperável em `accounts.json` |

Três chaves cunhadas em 2026-10-21 foram re-verificadas ao vivo mais tarde no mesmo dia (`/v1/models` 200 + chat 200).

> **Portões de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser escrita em `keys.txt`
> (chaves mortas nunca são entregues). As combinações de roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são reportadas, nunca escondidas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Onomeo page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://onomeo.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Notas |
| --- | --- | --- |
| caixa de correio | Mailtrap `POST /inbound/folders/{id}/inboxes` | um endereço novo `…@inbound-mailtrap.io` por conta |
| turnstile | widget Cloudflare, sitekey `0x4AAAAAADhgHpmYKLCUCGVk` | resolvido **na mesma saída** que gasta o token; `--token-cmd`, um `--token` capturado ou `--manual` |
| código | `POST /api/auth/email/code {email,lang,turnstile}` | um token que esta saída não resolveu é recusado (`delivered` nunca se torna true) |
| e-mail | consultar a mesma caixa de entrada | `onomeo verification code: <6 digits>` |
| verificar | `POST /api/auth/email/verify {email,code}` | **`.secret` é a chave de API**; repetido em outras saídas quando uma saída morre no meio do fluxo |
| verificação | `GET /v1/models` + 2 sondagens de conteúdo | um `chat-200` ao vivo com a resposta correta é exigido antes de `keys.txt` |

## ⚙️ Opções da CLI

```bash
node src/cli.js --count N --token-cmd "<solver>"   # mint N keys, chat-200 gate on each
node src/cli.js --count 1 --manual                 # paste one Turnstile token by hand
node src/cli.js --verify-only                      # re-verify every key in keys.txt
node src/cli.js --screen                           # which exits carry /api/info
node src/cli.js --help
```

| Env | Padrão | Significado |
| --- | --- | --- |
| `ONOMEO_PROXIES` | `proxies.txt` | pool de saídas, uma linha por proxy — opcional: sem um pool a CLI conecta diretamente |
| `ONOMEO_MAILTRAP_TOKEN` | — | seu token de API do Mailtrap (Settings → API Tokens); o rail da caixa de entrada |
| `ONOMEO_MODEL` | `deepseek-v4-flash` | modelo para o gate de chat |
| `ONOMEO_TURNSTILE` | — | um token Turnstile capturado (igual a `--token`; uma conta) — útil quando o launcher executa a cunhagem |
| `ONOMEO_SITEKEY` / `ONOMEO_URL` | sitekey / `/login` | exportados *para* `--token-cmd`, para que um solver saiba o que resolver |

| Flag | Significado |
| --- | --- |
| `--count N` | contas/chaves a cunhar (padrão 1) |
| `--pool <file>` | lista de proxies, uma saída por linha |
| `--token <tok>` | um token Turnstile capturado — **conta única**, o token é gasto uma vez |
| `--token-cmd <cmd>` | comando que imprime um token novo em stdout (`--count` > 1 exige isto) |
| `--manual` | colar o token quando solicitado |
| `--mailtrap-token <t>` | token de API do Mailtrap |
| `--mt-folder <name>` | pasta do Mailtrap para as caixas de entrada (padrão `onomeo`) |
| `--model <id>` | modelo para o gate de chat |
| `--tries N` | tentativas por conta, uma saída cada (padrão 2) |
| `--verify-only` · `--screen` · `--help` | re-verificar · sondar saídas · este texto |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala (o limite de cadastro é por IP: 3 contas/dia).** A ferramenta funciona sem proxy também.

- **Com um pool:** passe `--pool <file>` (ou defina `ONOMEO_PROXIES`) e toda requisição passa por uma saída dessa lista; o rail rotaciona uma saída por conta e tenta novamente uma saída que morre nas vizinhas. Uma linha morta faz aquela tentativa falhar — um pool fornecido nunca recorre ao seu próprio endereço.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente. Cadastro, cunhagem de chave e gate de chat permanecem inalterados — só muda de onde os pacotes saem.
- `--screen` testa as saídas que você tem contra `https://onomeo.com/api/info` antes de uma execução.

> **Bloqueio de escala (medido em 2026-10-21/22, documentado honestamente).** O widget Cloudflare Turnstile só foi resolvido em uma **pequena fração das saídas** que a frota tinha: na execução de escala de 3 chaves, **2 de 11 saídas alcançáveis** produziram um token (e **1 em 28** na primeira passagem de triagem), enquanto todas as outras saídas alcançáveis retornaram um token de **comprimento zero** (quadros keep-alive `food` da página de desafio) e o cadastro então não pôde prosseguir. Resolver e gastar também devem acontecer na **mesma** saída — um token resolvido em outro lugar é recusado. Portanto este repositório é uma **ferramenta de cunhagem funcional, não uma frota de chaves pronta**: com um solver que vence o Turnstile nas suas saídas (ou um token colado à mão) ele cunha e verifica chaves de ponta a ponta; sem um, ele para na etapa do código e diz isso. Chaves ativas existentes podem ser re-verificadas a qualquer momento com `--verify-only`.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha (`sk-onomeo-…`) — ignorado pelo git |
| `accounts.json` | e-mail / id da caixa de entrada do Mailtrap / chave (mascarada) / saída / resultados das sondagens — ignorado pelo git |
| `proxies.txt` | suas saídas, uma por linha — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Padrões: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Os modelos são servidos como `onomeo/<model id>` e balanceados entre todas as chaves em `keys.txt`.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Padrões: `--prefix onomeo`, `--base-url https://onomeo.com/v1`, `--model deepseek-v4-flash`. Os modelos são servidos como `onomeo/<model id>` e balanceados entre todas as chaves em `keys.txt`.

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **Onomeo** — [onomeo.com](https://onomeo.com) |
| 🎁 O que o provedor dá | uma conta por chave — código de e-mail atrás do Turnstile, toda chave verificada por chat |
| 🔑 O que uma chave te dá | uma chave de API limitada à sua própria conta: os 28 ids de modelos no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, e é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | compatível com OpenAI: `POST https://onomeo.com/v1/chat/completions` |
| 🔒 Seus dados | apenas onomeo.com e o backend de caixa de entrada que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a Onomeo mudar seu cadastro por e-mail, sua sitekey do Turnstile, o cabeçalho `x-onomeo-web` ou os limites de `/api/info`, a ferramenta para nessa etapa e diz isso. **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 onomeo-bulk-apikey contributors

</div>