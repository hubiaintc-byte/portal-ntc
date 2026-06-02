# Portal Grupo NTC

Plataforma institucional premium do **Instituto NTC do Brasil** — um ecossistema editorial voltado a tomadores de decisão pública, organizado em três verticais: **NTC Educação**, **NTC Gestão Pública** e **NTC Saúde**.

> *Inteligência institucional. Impacto real.*

Não é vitrine de cursos, marketplace ou site corporativo genérico. É uma plataforma editorial com identidade visual própria (Soberana 2026) e governança documental rígida.

---

## Sumário

- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Aplicações e pacotes](#aplicações-e-pacotes)
- [Rotas do front-end](#rotas-do-front-end)
- [Scripts disponíveis](#scripts-disponíveis)
- [Qualidade e CI](#qualidade-e-ci)
- [Padrões e convenções](#padrões-e-convenções)
- [Documentação de governança](#documentação-de-governança)
- [Contribuindo](#contribuindo)

---

## Stack

| Camada        | Tecnologia                                              |
| ------------- | ------------------------------------------------------- |
| Monorepo      | pnpm workspaces + Turborepo                             |
| Front-end     | Next.js 15 (App Router) · React 19 · React Server Components |
| Estilo        | Tailwind CSS 4 + tokens próprios (design system Soberana 2026) |
| CMS           | Payload CMS 3 (adapter PostgreSQL)                      |
| Banco         | Supabase Postgres (região `sa-east-1`)                  |
| Storage       | Supabase Storage (S3-compatível)                        |
| E-mail        | Resend (notificação transacional)                       |
| Linguagem     | TypeScript strict em todo o monorepo                    |
| Qualidade     | ESLint 9 · Prettier 3 · Vitest · Playwright             |
| Deploy        | Vercel (Web + CMS)                                       |

---

## Pré-requisitos

- **Node.js** `>= 22` (use a versão fixada em [`.nvmrc`](./.nvmrc): `22`)
- **pnpm** `>= 9` (recomendado `9.15.0`, conforme `packageManager` no `package.json`)
- Acesso ao banco Supabase Postgres e ao bucket de Storage (ver [Variáveis de ambiente](#variáveis-de-ambiente))

```bash
# Se usa nvm:
nvm use

# Instala pnpm globalmente (caso ainda não tenha):
corepack enable && corepack prepare pnpm@9.15.0 --activate
```

---

## Como rodar

```bash
# 1. Instalar dependências (em todo o workspace)
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# preencha os valores reais em .env (NUNCA commite este arquivo)

# 3. Gerar os tipos do Payload a partir do schema
pnpm payload:generate

# 4. Rodar em desenvolvimento (Web + CMS em paralelo)
pnpm dev
```

| App   | URL local                        |
| ----- | -------------------------------- |
| Web   | http://localhost:3000            |
| CMS   | http://localhost:3001            |
| Admin | http://localhost:3001/admin      |

Para rodar apenas uma das aplicações:

```bash
pnpm dev:web   # somente Next.js (front)
pnpm dev:cms   # somente Payload (CMS/admin)
```

### Seed inicial

```bash
pnpm payload:seed              # seed base (Áreas + Programas em rascunho)
pnpm payload:seed:home-v3      # conteúdo da Home v3
pnpm payload:seed:imagens-home # upload das imagens da Home
pnpm fotos:especialistas       # vincula fotos ao corpo docente
```

---

## Variáveis de ambiente

Um [`.env.example`](./.env.example) versionado lista todas as variáveis obrigatórias. **Nunca commite `.env`.** Resumo dos grupos:

| Grupo               | Variáveis                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| Banco               | `DATABASE_URI` (Supabase Postgres · pooler porta 6543)                     |
| Supabase API        | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`           |
| Supabase Storage    | `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_BUCKET` |
| Payload             | `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`                              |
| Front               | `PAYLOAD_PUBLIC_FRONT_URL`, `REVALIDATE_SECRET`                            |
| E-mail              | `RESEND_API_KEY`                                                          |
| Captcha             | `HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET`                                    |
| Observabilidade     | `SENTRY_DSN`                                                              |

> ⚠️ Secrets (senha do banco, `PAYLOAD_SECRET`, chaves de Storage) são zona de máxima sensibilidade. Não rotacione sem instrução. Em produção (Vercel), as env vars precisam estar configuradas no painel — sem elas, o portal cai no fallback estático.

---

## Estrutura do monorepo

```
/
├── apps/
│   ├── web/          → Next.js (front-end + API routes)
│   └── cms/          → Payload CMS (admin + API, mesmo deploy)
├── packages/
│   ├── ui/           → Design system (componentes, tokens visuais)
│   ├── lib/          → Utilitários compartilhados (forms, SEO, helpers)
│   └── types/        → Tipos compartilhados (inclui gerados pelo Payload)
├── docs/             → Documentos de governança + specs/plans (superpowers)
├── scripts/          → Scripts utilitários (ex.: revalidação ISR)
├── img/              → Assets brutos dos protótipos
├── feito/            → Protótipos HTML aprovados (referência visual)
├── CLAUDE.md         → Instruções permanentes do projeto (alta prioridade)
├── turbo.json        → Pipeline Turborepo
├── pnpm-workspace.yaml
└── .github/workflows/ci.yml
```

---

## Aplicações e pacotes

### `apps/web` — Front-end (`@ntc/web`)

Next.js 15 App Router, rodando na porta **3000**. Organizado em **route groups** por área editorial. Consome o CMS via `lib/payloadClient.ts` e helpers em `lib/cms/`. Inclui `lib/respostaForm.ts` para envio de formulários (Leads) e fallbacks estáticos quando o CMS não está disponível.

### `apps/cms` — Payload CMS (`@ntc/cms`)

Payload 3 com adapter Postgres e Storage S3, rodando na porta **3001** (admin em `/admin`). Define:

- **Coleções:** `Areas`, `Programas`, `Modulos`, `Especialistas`, `Eventos`, `Conteudos`, `Clientes`, `Leads`, `Media`, `Users`, `AuditLog`
- **Globals:** `Home`, `OGrupo`, `Rodape`, `CorpoDocente`
- **Access control** por papel (`superAdmin`, `editorInstitucional`, `editorEventos`, `atendimentoComercial`, `authenticated`)
- **Hooks:** `autoSlug`, `revalidatePage`, `sanitizarFilename`
- **Seeds** em `src/seed/`

### `packages/ui` — Design system (`@ntc/ui`)

Tokens visuais (`src/tokens.ts`) e componentes do Inventário Editorial. Exporta `./tokens` separadamente. Inclui helpers de LGPD (`BannerCookies`, `DialogoPolitica`).

### `packages/lib` — Utilitários (`@ntc/lib`)

Lógica compartilhada: validação de formulários (zod), hCaptcha, rate limit, versão da política LGPD, origem da request, e construção de metadata de SEO (`montaMetadataSoberana`).

### `packages/types` — Tipos (`@ntc/types`)

Tipos compartilhados, incluindo `payload-types.ts` **gerado automaticamente** (`pnpm payload:generate`). Não edite à mão.

---

## Rotas do front-end

Organizadas por route group em `apps/web/app/`:

| Route group        | Rotas principais                                                      |
| ------------------ | -------------------------------------------------------------------- |
| `(home)`           | `/`                                                                  |
| `(o-grupo)`        | `/o-grupo`, `/o-grupo/corpo-docente`                                 |
| `(programas)`      | `/programas/[slug]`, `/programas/[slug]/modulos/[modulo]`            |
| `(solucoes)`       | `/solucoes`                                                          |
| `(vertical)`       | `/solucoes-estrategicas/[area]`                                      |
| `(capacitacao)`    | `/capacitacao`, `/agenda`, `/agenda/[slug]`                          |
| `(conteudos)`      | `/conteudos`                                                         |
| `(institucional)`  | `/contato`, `/lgpd`, `/mapa-do-site`, `/politica-de-privacidade`, `/politica-de-cookies`, `/termos-de-uso` |

O mapa canônico completo está em [`docs/13_Mapa_Pagina_a_Pagina_v1.md`](./docs/13_Mapa_Pagina_a_Pagina_v1.md).

---

## Scripts disponíveis

Executados a partir da raiz (orquestrados via Turborepo, exceto onde indicado):

| Comando                            | Descrição                                          |
| ---------------------------------- | -------------------------------------------------- |
| `pnpm dev`                         | Roda Web + CMS em paralelo                          |
| `pnpm dev:web` / `pnpm dev:cms`    | Roda apenas uma das aplicações                     |
| `pnpm build`                       | Build de produção de todo o monorepo               |
| `pnpm preview`                     | Preview do build de produção                       |
| `pnpm lint`                        | ESLint em todo o monorepo                           |
| `pnpm typecheck`                   | `tsc --noEmit`                                      |
| `pnpm test`                        | Vitest                                              |
| `pnpm test:e2e`                    | Playwright                                          |
| `pnpm format` / `pnpm format:check`| Prettier (escreve / verifica)                      |
| `pnpm payload:generate`            | Regenera os tipos do Payload                        |
| `pnpm payload:seed`                | Seed inicial (Áreas + Programas)                    |
| `pnpm payload:seed:home-v3`        | Seed do conteúdo da Home v3                         |
| `pnpm payload:seed:imagens-home`   | Upload das imagens da Home                          |
| `pnpm fotos:especialistas`         | Vincula fotos ao corpo docente                      |
| `pnpm revalidar [rota]`            | Dispara revalidação ISR de uma rota                 |
| `pnpm revalidar:corpo-docente`     | Revalida `/o-grupo/corpo-docente`                   |
| `pnpm clean`                       | Limpa builds, caches e `node_modules`               |

---

## Qualidade e CI

O workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) roda em pull requests e pushes para `main` e `develop`, executando **lint → typecheck → build**. PR não pode mergear com CI falhando.

Antes de abrir PR, rode localmente:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

> `pnpm build` pega erros que o typecheck sozinho não pega (ex.: uso de `<a>` em vez de `<Link>` para rotas internas). Sempre rode o build antes do PR.

---

## Padrões e convenções

Resumo — o contrato completo está em [`CLAUDE.md`](./CLAUDE.md).

- **TypeScript strict**, sem `any`. App Router only (sem Pages Router). RSC por padrão; Client Component só quando justificado.
- **Naming:** componentes em PascalCase com nome em português (`<CardEvento>`); hooks em `useCamelCase`; arquivos `kebab-case.ts` para utils e `PascalCase.tsx` para componentes.
- **Imports** absolutos via alias `@/...`, na ordem React/Next → externos → `@/components` → `@/lib` → `@/types` → relativos.
- **Identidade visual (Soberana 2026):** paleta Oxford `#11365E` dominante, Pergaminho `#F4EFE6`, acentos por vertical, Dourado cerimonial. Tipografia Cormorant Garamond (títulos) + Barlow (corpo) via `next/font`. Sem `border-radius` em estruturas; sem ícones decorativos. **Tokens vêm sempre de `packages/ui/src/tokens.ts` — não invente cores.**
- **Acessibilidade** WCAG 2.1 AA (contraste, navegação por teclado, landmarks, skip-link) — não negociável.
- **Performance** alvo: LCP ≤ 1.8s, CLS ≤ 0.05, INP ≤ 200ms (P75 mobile).
- **LGPD:** todo formulário com checkbox de consentimento não pré-marcado, link à política, versão/timestamp/IP gravados no Lead.
- **Anti-improvisação:** não crie componentes fora do Inventário, não troque tokens, não invente conteúdo institucional, não adicione libs fora da stack aprovada, não toque em páginas aprovadas sem pedido explícito. Em dúvida, **pergunte**.

### Git

- `main` → produção (deploy em tag `v*.*.*`); `develop` → staging; features em `feat/<escopo>`, bugs em `fix/<escopo>`.
- Commits em português, Conventional Commits adaptado, sem emojis: `feat(componente): adiciona HeroPrograma`.
- PR com seções "O que muda / Por quê / Como testar / Riscos". Mudança visual exige screenshot e aprovação explícita.

---

## Documentação de governança

Fontes de verdade, em ordem de precedência (ver `CLAUDE.md §2`):

1. [`docs/10_DAB_Backend_Enxuto_GrupoNTC_v1.md`](./docs/10_DAB_Backend_Enxuto_GrupoNTC_v1.md) — arquitetura técnica
2. [`docs/11_Schema_Payload_CMS_v1.md`](./docs/11_Schema_Payload_CMS_v1.md) — modelagem de dados
3. [`docs/12_Inventario_Componentes_Editoriais_v1.md`](./docs/12_Inventario_Componentes_Editoriais_v1.md) — componentes (canônico)
4. [`docs/13_Mapa_Pagina_a_Pagina_v1.md`](./docs/13_Mapa_Pagina_a_Pagina_v1.md) — mapa de rotas
5. Protótipos HTML aprovados em `feito/` — fonte visual canônica

`docs/superpowers/` guarda specs e plans de cada sessão de desenvolvimento.

---

## Contribuindo

1. Leia [`CLAUDE.md`](./CLAUDE.md) — é o contrato do projeto e tem precedência sobre defaults.
2. Antes de codar componente/rota/modelagem, consulte os documentos de governança.
3. Trabalhe em feature branch, commits pequenos em português.
4. Rode `pnpm lint && pnpm typecheck && pnpm build` antes do PR.
5. Para mudança visual, anexe screenshots (desktop 1440 + mobile 375) e aguarde aprovação.

---

*Portal Grupo NTC · Instituto NTC do Brasil*
