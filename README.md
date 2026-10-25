# Desconfia

Verificador de alegações políticas brasileiras. O usuário cola uma alegação ou o link de uma notícia e recebe um relatório com avaliação, nível de confiança, evidências ligadas a fontes reais e um link para compartilhar.

Criado com [Better-T-Stack](https://better-t-stack.dev): Next.js 16, TypeScript, Tailwind, shadcn/ui (Base UI), Drizzle + SQLite/libSQL, Turborepo, Biome e Varlock para variáveis de ambiente.

## Como funciona

```
Texto, link ou print → Alegações (até 3) → Cache de 7 dias → Pesquisa (Tavily + checagens) → Síntese (Gemini + Zod) → Validação → SQLite → /r/{id} ou /g/{id}
```

- `lib/research/input.ts`: valida texto, link e imagem. Bloqueia esquemas que não sejam http(s), localhost, IPs privados e endereços de metadados de nuvem. Imagens são aceitas só como PNG, JPEG ou WebP (pelos bytes, não pela extensão), até 5 MB, e nunca são guardadas. O servidor nunca acessa diretamente o link enviado; quem lê a página é a Tavily.
- `lib/verification.ts`: orquestra a verificação. Textos curtos são verificados como digitados; mensagens longas, links e prints passam pelo Gemini para separar até 3 alegações. Alegações iguais (ignorando maiúsculas, espaços e pontuação) verificadas nos últimos 7 dias reaproveitam o relatório. Com mais de uma alegação, o resultado é um grupo em `/g/{id}`.
- `lib/research/tavily.ts` e `factcheck.ts`: buscas em paralelo, uma geral, outra restrita a domínios oficiais (`gov.br`, `leg.br`, `jus.br`…) e, se houver chave, a Google Fact Check Tools API. Até 8 fontes por alegação, com URL e trecho.
- `lib/research/synthesize.ts`: o Gemini recebe as fontes como dados não confiáveis entre tags `<fonte>` e devolve um objeto validado pelo schema Zod (`lib/report.ts`).
- `lib/research/validate.ts`: descarta constatações que citam fontes inexistentes, mantém apenas as fontes citadas e força `inconclusive` quando nenhuma evidência sustenta o veredito.
- `app/api/verify/route.ts`: transmite as etapas reais em NDJSON, aplica timeout e limite de 5 verificações a cada 10 min por IP.
- `/r/[id]`: relatório com id aleatório, `noindex` e sem listagem pública. Tem prévia Open Graph, compartilhamento no WhatsApp, "Pesquisar novamente" (cria uma nova versão ligada à anterior), formulário de erro e, para quem criou o relatório, a opção de apagá-lo. O token de exclusão fica só no navegador de quem verificou; o servidor guarda apenas o hash.
- O histórico "Vistos recentemente" fica no `localStorage` do aparelho.

## Rodando localmente

```bash
bun install
bun run db:migrate   # cria as tabelas em ./local.db
bun run dev          # http://localhost:3001
```

### Variáveis de ambiente (`apps/web/.env`)

O schema está em `apps/web/.env.schema`. Copie `apps/web/.env.example` para `apps/web/.env` e preencha as chaves. O `.env` não é versionado.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | `file:../../local.db` por padrão. Para usar o Turso, informe a URL `libsql://…`. |
| `TAVILY_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://app.tavily.com (1000 créditos/mês). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://aistudio.google.com/apikey. |
| `GEMINI_MODEL` | não | Padrão: `gemini-3.5-flash-lite`. |
| `SITE_URL` | não | URL pública usada em prévias de link, no sitemap e nas respostas do bot. Na Vercel é resolvida automaticamente. |
| `WHATSAPP_*` | não | Ativam o bot de WhatsApp (veja abaixo). |
| `GOOGLE_FACT_CHECK_API_KEY` | não | Ativa a busca de checagens profissionais (Lupa, Aos Fatos…) via [Google Fact Check Tools API](https://developers.google.com/fact-check/tools/api), gratuita. |

**Sem as duas chaves a aplicação roda em modo demonstração**: tudo funciona, mas ao enviar uma alegação aparece um aviso de que a pesquisa ao vivo está desativada. Os quatro relatórios em `/exemplos/*` foram escritos manualmente, estão identificados como ilustrativos e citam fontes reais (LexML).

## Scripts

```bash
bun run check-types              # next typegen + tsc
bun run check                    # biome (lint + format)
bun run --cwd apps/web test      # testes unitários e de integração (SQLite temporário, provedores mockados)
bun run build
bun run --cwd apps/web test:e2e  # Playwright no build de produção, em modo demonstração
bun run --cwd apps/web eval      # avaliação com provedores reais (exige as chaves)
```

O CI (`.github/workflows/ci.yml`) roda lint, tipos, testes, migrations, build e E2E em cada PR. Para o E2E local, rode `bun run build` antes; com o Chromium do sistema, use `CHROMIUM_PATH=/usr/bin/chromium`.

### Avaliação

`apps/web/evals/claims.json` tem 20 alegações cívicas com veredito conhecido (mandatos, idades mínimas, datas oficiais). `bun run --cwd apps/web eval` pesquisa cada uma com os provedores reais e mostra acertos, inconclusivos e vereditos invertidos. O script falha se algum veredito sair invertido ou se houver erro: um "inconclusivo" é aceitável, afirmar o contrário não. Rode antes de trocar o prompt ou o modelo.

## Deploy (Vercel + Turso)

1. Crie um banco no [Turso](https://turso.tech) e gere um token: `turso db create desconfia` e `turso db tokens create desconfia`.
2. Aplique as migrations: `DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… bun run db:migrate`.
3. Na Vercel, importe o repositório com **Root Directory** `apps/web` e configure `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `TAVILY_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` e, se quiser, `GOOGLE_FACT_CHECK_API_KEY`.
4. As URLs absolutas das prévias de link são resolvidas automaticamente na Vercel. Em outro host, defina `SITE_URL`.

O limite de requisições fica na tabela `rate_limit_hits` (IP guardado só como hash), então funciona com várias instâncias. Cada verificação gera uma linha JSON `{"event":"verification",…}` nos logs com resultado, tipo de entrada, duração, número de alegações, reaproveitadas e vereditos, nunca com o texto da alegação nem o IP.

## Canais

### Bot de WhatsApp

A pessoa encaminha o texto, o link ou o print para o número do Desconfia e recebe o veredito, um resumo e o link do relatório. O bot usa o mesmo pipeline do site, com cache, várias alegações por mensagem e limite de 10 verificações por hora por número (guardado só como hash).

1. Crie um app no [Meta for Developers](https://developers.facebook.com) com o produto WhatsApp e anote o *Phone number ID*, um *access token* permanente e o *App secret*.
2. Configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` (qualquer texto que você escolher) e `SITE_URL`, se não estiver na Vercel.
3. Registre o webhook `https://<seu-domínio>/api/whatsapp` com o mesmo verify token e assine o campo `messages`.

Toda chamada ao webhook tem a assinatura `X-Hub-Signature-256` verificada; sem as quatro variáveis, a rota responde 404. A resposta ao Meta é imediata e a verificação roda depois, com `after()`.

### Extensão de navegador

A pasta `extension/` é uma extensão Manifest V3 sem build. Ela adiciona "Verificar no Desconfia" ao menu de contexto quando há texto selecionado e abre o site com o campo já preenchido (`/?q=…`). A pessoa revisa o texto antes de verificar.

Para instalar: `chrome://extensions` → *Modo do desenvolvedor* → *Carregar sem compactação* → escolha a pasta `extension`. Em *Opções*, informe o endereço do Desconfia (padrão: `http://localhost:3001`). Testes: `bun test ./extension`.

### Destaques

`/destaques` lista relatórios escolhidos pela equipe. Nada entra ali automaticamente:

```bash
bun run --cwd apps/web feature <id-do-relatório>            # destacar
bun run --cwd apps/web feature <id-do-relatório> --remove   # remover
```

Só relatórios em destaque podem ser indexados por buscadores e aparecem no `sitemap.xml`; todos os outros continuam `noindex` e acessíveis apenas pelo link.

## Limitações conhecidas

- O plano gratuito do Gemini tem limites baixos de requisições. Quando o limite estoura, o usuário vê uma mensagem com a opção de tentar novamente.
# desconfia
