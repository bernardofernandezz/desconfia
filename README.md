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
bun run db:push      # cria as tabelas em ./local.db
bun run dev          # http://localhost:3001
```

### Variáveis de ambiente (`apps/web/.env`)

O schema está em `apps/web/.env.schema`. Copie `apps/web/.env.example` para `apps/web/.env` e preencha as chaves. O `.env` não é versionado.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | `file:../../local.db` por padrão. Para usar o Turso, informe a URL `libsql://…`. |
| `TAVILY_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://app.tavily.com (1000 créditos/mês). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://aistudio.google.com/apikey. |
| `GEMINI_MODEL` | não | Padrão: `gemini-2.5-flash`. |
| `GOOGLE_FACT_CHECK_API_KEY` | não | Ativa a busca de checagens profissionais (Lupa, Aos Fatos…) via [Google Fact Check Tools API](https://developers.google.com/fact-check/tools/api), gratuita. |

**Sem as duas chaves a aplicação roda em modo demonstração**: tudo funciona, mas ao enviar uma alegação aparece um aviso de que a pesquisa ao vivo está desativada. Os quatro relatórios em `/exemplos/*` foram escritos manualmente, estão identificados como ilustrativos e citam fontes reais (LexML).

## Scripts

```bash
bun run check-types   # next typegen + tsc
bun run check         # biome (lint + format)
bun run --cwd apps/web test   # testes de validação e segurança de URL
bun run build
```

## Limitações conhecidas

- O rate limit fica em memória e vale por instância. Com mais de uma instância, troque por um armazenamento compartilhado.
- O plano gratuito do Gemini tem limites baixos de requisições. Quando o limite estoura, o usuário vê uma mensagem com a opção de tentar novamente.
- Ainda não há envio de imagem/print.
# desconfia
