# Desconfia

Verificador de alegações políticas brasileiras. O usuário cola uma alegação ou o link de uma notícia e recebe um relatório com avaliação, nível de confiança, evidências ligadas a fontes reais e um link para compartilhar.

Criado com [Better-T-Stack](https://better-t-stack.dev): Next.js 16, TypeScript, Tailwind, shadcn/ui (Base UI), Drizzle + SQLite/libSQL, Turborepo, Biome e Varlock para variáveis de ambiente.

## Como funciona

```
Entrada → Pesquisa (Tavily) → Fontes recuperadas → Síntese (Gemini + Zod) → Validação → SQLite → /r/{id}
```

- `apps/web/src/lib/research/input.ts`: valida o texto ou o link e bloqueia esquemas que não sejam http(s), localhost, IPs privados e endereços de metadados de nuvem. O servidor nunca acessa diretamente o link enviado; quem lê a página é a Tavily.
- `tavily.ts`: faz duas buscas em paralelo, uma geral e outra restrita a domínios oficiais (`gov.br`, `leg.br`, `jus.br`…), e guarda até 8 fontes com URL e trecho do conteúdo.
- `synthesize.ts`: o Gemini recebe as fontes como dados não confiáveis entre tags `<fonte>` e devolve um objeto validado pelo schema Zod (`lib/report.ts`).
- `validate.ts`: descarta constatações que citam fontes inexistentes, mantém apenas as fontes citadas e força `inconclusive` quando nenhuma evidência sustenta o veredito.
- `app/api/verify/route.ts`: transmite as etapas reais da pesquisa em NDJSON, aplica timeout de 100 s e limite de 5 verificações a cada 10 min por IP, e devolve mensagens de erro em português.
- `/r/[id]`: relatório persistido, com id aleatório de 14 caracteres, `noindex` e sem listagem pública.

## Rodando localmente

```bash
bun install
bun run db:push      # cria as tabelas em ./local.db
bun run dev          # http://localhost:3001
```

### Variáveis de ambiente (`apps/web/.env`)

O schema está em `apps/web/.env.schema`. Coloque os valores em `apps/web/.env`, que não é versionado.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | `file:../../local.db` por padrão. Para usar o Turso, informe a URL `libsql://…`. |
| `TAVILY_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://app.tavily.com (1000 créditos/mês). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | para pesquisa ao vivo | Chave gratuita em https://aistudio.google.com/apikey. |
| `GEMINI_MODEL` | não | Padrão: `gemini-2.5-flash`. |

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
