# CLAUDE.md Operacional — Portal Grupo NTC
## Instruções permanentes para o Claude Code · v1 Sprint F

**Versão:** 1.0 · 15 de maio de 2026
**Destino:** este arquivo é renomeado para `CLAUDE.md` e colocado na raiz do monorepo. O Claude Code o lê automaticamente em toda sessão e o trata como instrução de mais alta prioridade depois do prompt do usuário.

> **Como usar este documento.** Após criar o repositório do portal, copie o conteúdo abaixo (a partir da linha `# Portal Grupo NTC — Instruções Permanentes`) para um arquivo `CLAUDE.md` na raiz. Em todas as sessões de Claude Code daqui em diante, essas instruções estarão ativas como contrato.

---

# Portal Grupo NTC — Instruções Permanentes

Você está trabalhando no Portal do **Grupo NTC** — uma plataforma institucional premium do Instituto NTC do Brasil. Estas instruções têm precedência sobre seus comportamentos default e devem ser respeitadas em toda sessão.

## 1. Identidade do projeto

**Cliente:** Instituto NTC do Brasil.
**Marca:** Grupo NTC — Núcleo de Tecnologia e Conhecimento.
**Verticais:** NTC Educação · NTC Gestão Pública · NTC Saúde.
**Assinatura institucional:** *Inteligência institucional. Impacto real.*
**Posicionamento:** organização de inteligência institucional aplicada à formação de capacidades públicas.

O portal **não** é vitrine de cursos, **não** é marketplace, **não** é site corporativo genérico. É um ecossistema editorial premium voltado a tomadores de decisão pública.

## 2. Documentos de governança

Você deve consultar como fonte de verdade, nesta ordem de precedência:

1. `docs/10_DAB_Backend_Enxuto_GrupoNTC_v1.md` — arquitetura técnica.
2. `docs/11_Schema_Payload_CMS_v1.md` — modelagem de dados.
3. `docs/12_Inventario_Componentes_Editoriais_v1.md` — fonte canônica de componentes.
4. `docs/13_Mapa_Pagina_a_Pagina_v1.md` — mapa de rotas.
5. `docs/01_Concepcao_Estrategica_Portal_GrupoNTC_v1.md` — concepção institucional (origem).
6. Protótipos HTML aprovados em `docs/prototipos/` — fonte visual canônica.

Antes de qualquer decisão de modelagem, componente novo ou rota, **consulte os documentos acima**. Se houver conflito entre documentos, o mais específico vence (Inventário sobre DAB para componentes; Mapa sobre Inventário para fluxo de rota).

## 3. Identidade visual — Soberana 2026

Você não pode quebrar o sistema visual. Em qualquer ponto onde precisar tomar decisão estética, respeite:

- **Paleta:** Oxford `#11365E` dominante (60%), Pergaminho `#F4EFE6` (15%), acentos por vertical (10%) — Cardeal `#8E2B27` para Gestão Pública, Oliva `#5C6B3B` para Saúde —, Dourado `#B5995A` cerimonial (5%).
- **Tipografia:** Cormorant Garamond (títulos), Barlow (corpo e interface). Auto-hospedadas via `next/font`. **Não importe outras fontes.**
- **Hierarquia:** 60·15·10·5 (Oxford·Pergaminho·Acento·Cerimonial).
- **Sem gradientes vibrantes.** Sem bordas arredondadas em estruturas (`border-radius: 0` para cards, blocos, containers). Pílulas e selos podem ser arredondados.
- **Espaçamento generoso.** Margens editoriais amplas. Use os tokens de `packages/ui/src/tokens.ts`.
- **Sem ícones decorativos.** Ícones apenas funcionais (busca, fechar, expandir), em estilo linear, peso 1.5.

## 4. Regras de código

### 4.1. Stack obrigatória

- TypeScript strict em todo o monorepo.
- Next.js 15 App Router. **Não** use Pages Router.
- React Server Components por padrão. Client Component apenas quando justificado (interação, hooks de estado).
- Tailwind CSS 4 com tokens em `tailwind.config.ts`. **Não** escreva CSS literal fora de Tailwind, salvo `globals.css` (reset + tokens).
- Payload CMS 3 com adapter PostgreSQL.
- ESLint 9, Prettier 3, Vitest, Playwright.

### 4.2. Convenções de naming

- Componentes em **PascalCase** com nome em português (`<CardEvento>`, `<HeroPrograma>`, `<GradeEspecialistas>`).
- Hooks em **camelCase** com prefixo `use` (`useFiltrosAgenda`, `useConsentimentoLgpd`).
- Arquivos: `kebab-case.ts` para utilitários, `PascalCase.tsx` para componentes.
- Variáveis e funções: **camelCase em português** quando o conceito é editorial NTC (`carregarProgramas`, `revalidarPagina`), inglês para conceitos técnicos puros (`fetchData`, `parseResponse`).

### 4.3. Imports

- Imports absolutos via path alias `@/...`.
- Ordem: React/Next → bibliotecas externas → `@/components` → `@/lib` → `@/types` → relativos.
- Sem imports default exceto em componentes React e em rotas Next.js.

### 4.4. Tipagem

- Sem `any`. Sem `unknown` quando há tipo conhecido.
- Tipos vindos do Payload importados de `@/types/payload-types` (gerado automaticamente).
- Props sempre como interface nomeada (`interface CardEventoProps`).

## 5. Política anti-improvisação

**Esta seção define o que você não faz.** Estas regras existem porque o projeto é premium institucional e qualquer desvio degrada a marca.

### 5.1. Não crie componentes novos sem autorização explícita

Antes de codar qualquer componente que não esteja em `docs/12_Inventario_Componentes_Editoriais_v1.md`, **pare e pergunte**. Apresente: nome proposto, props sugeridas, justificativa, qual protótipo o origina. Aguarde aprovação.

### 5.2. Não troque tokens visuais

Cores, fontes, raios, sombras, espaçamentos: vêm sempre dos tokens. Se você precisar de uma cor "parecida com Oxford mas mais clara", pergunte — não invente.

### 5.3. Não invente conteúdo institucional

Todo texto institucional (mission, vision, descrição de programa, slogan) deve vir do CMS ou de fontes editoriais aprovadas. **Não preencha placeholders com texto criativo seu.** Use `[texto a definir pela equipe editorial]` ou comente o componente como pendente.

### 5.4. Não use bibliotecas fora da stack aprovada

A stack aprovada está no DAB. Antes de adicionar nova dependência (especialmente UI libraries: shadcn/ui, MUI, Chakra, Mantine — **proibidas**), pergunte. O design system é próprio.

### 5.5. Não otimize prematuramente

Não introduza memoization, code splitting agressivo, ou refatoração de performance antes de medir. Velocidade é importante, mas vem de SSG/ISR bem aplicados, não de micro-otimizações.

### 5.6. Não toque em páginas aprovadas sem motivo declarado

Se uma página já está implementada e aprovada (após smoke test institucional), você só edita se houver pedido explícito do usuário. Refatorações silenciosas estão proibidas.

### 5.7. Não desabilite checks de CI

Lint, type-check, testes — se falham, você corrige. Não adicione `// @ts-ignore`, `// eslint-disable`, `expect.fail` sem justificar no commit e mencionar ao usuário.

### 5.8. Não desabilite a 2FA do admin nem rotacione secrets sem ordem

Acesso administrativo, tokens RD Station, chaves R2, senha do banco: zona de máxima sensibilidade. Não toque sem instrução direta.

## 6. Checkpoints visuais obrigatórios

Você opera em sessões de 60–90 minutos. Ao final de cada sessão produtiva (e em todo `git commit` significativo), você deve:

1. **Build local OK.** `pnpm build` sem erros.
2. **Rodar a página no navegador local.** `pnpm dev` e abrir a URL afetada.
3. **Screenshot da página afetada** (desktop 1440 + mobile 375) e listar no resumo da sessão.
4. **Comparar visualmente com o protótipo HTML de referência** mencionado no Mapa Página-a-Página.
5. **Reportar discrepâncias** abertas ao usuário ANTES de declarar a sessão concluída.

Não declare "pronto" sem checkpoint visual. Não declare "alinhado" sem comparação com protótipo.

## 7. Workflow Git

### 7.1. Branches

- `main` — produção. Deploy automático em tag `v*.*.*`.
- `develop` — staging. Deploy automático no merge.
- Feature branches: `feat/<escopo-curto>`, ex.: `feat/hero-programa`.
- Bugfix: `fix/<escopo>`.

### 7.2. Commits

Commits em português, formato Conventional Commits adaptado:

```
feat(componente): adiciona HeroPrograma com lockup vertical
fix(formularios): corrige validação de e-mail no form proposta
docs(dab): atualiza seção de integrações com RD Station
chore(deps): atualiza next para 15.0.3
```

Mensagens descrevem **o que mudou**, não "o que eu fiz". Sem emojis em commits.

### 7.3. Pull Requests

- Descrição em português, com seção "O que muda", "Por quê", "Como testar", "Riscos".
- Screenshot anexado para qualquer mudança visual.
- PR não pode mergear se CI falhar.
- PR de mudança visual exige aprovação explícita do usuário (não apenas review automático).

## 8. Workflow de sessão guiada

Quando o usuário inicia uma sessão pedindo "implemente X":

1. **Leia o pedido com atenção.** Identifique a página/rota/componente alvo.
2. **Consulte os documentos de governança** relevantes — DAB, Schema, Inventário, Mapa.
3. **Antes de codar, exponha o plano:**
   - Arquivos que pretende criar/editar.
   - Componentes do Inventário que vai usar.
   - Decisões pendentes de confirmação humana.
   - Estimativa de duração da sessão.
4. **Espere validação** (verbal/textual) do usuário antes de começar.
5. **Implemente em commits pequenos** com mensagem clara.
6. **Faça checkpoint visual** ao final.
7. **Resuma a sessão** ao final em até 10 linhas: o que foi feito, o que ficou pendente, próximos passos sugeridos.

## 9. Tratamento de pendências e ambiguidades

Se uma instrução do usuário é ambígua ou conflita com documentos de governança, **você pergunta**. Não decide silenciosamente.

Formato sugerido:

> "Antes de prosseguir, preciso confirmar:
> 1. [pergunta específica]
> 2. [pergunta específica]
> Minha leitura preferencial é [X], baseada em [doc Y, seção Z]. Confirma?"

## 10. Acessibilidade — não negociável

Toda página/componente entregue deve atender WCAG 2.1 AA. Específico:

- Contraste mínimo 4.5:1 em texto corrido, 3:1 em textos grandes.
- Navegação completa por teclado. `:focus` visível em Oxford.
- `<button>` para ações, `<a>` para navegação. Sem `<div onClick>`.
- Imagens informativas com `alt` descritivo; decorativas com `alt=""`.
- Formulários com `<label>` associado ao input.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>` explícitos.
- Skip-link "Pular para conteúdo principal" no topo.

## 11. Performance — não negociável

- LCP ≤ 1.8s, CLS ≤ 0.05, INP ≤ 200ms em P75 mobile.
- Antes de cada PR, rodar Lighthouse local (mobile + desktop).
- Imagens via `<ImagemSoberana>` com `sizes` explícito.
- Fonts via `next/font` com `display: swap`.
- Nunca `getStaticProps` (Pages Router) — App Router only.

## 12. LGPD — não negociável

Todo formulário deve ter:

1. Checkbox de consentimento (não pré-marcado).
2. Link para `/politica-de-privacidade` (abrir em modal ou nova aba).
3. Versão da política registrada no payload do submit.
4. Timestamp e IP do aceite gravados no Lead.
5. Não enviar dados pessoais a terceiros sem o aceite registrado.

Banner de cookies aparece **antes** do `<main>` em primeira visita, com categorias granulares.

## 13. Estrutura do monorepo

```
/
├── apps/
│   ├── web/          → Next.js (front-end + API routes)
│   └── cms/          → Payload (admin + integração no mesmo deploy)
├── packages/
│   ├── ui/           → Design system (componentes do Inventário 12)
│   ├── lib/          → utilitários compartilhados (formatadores, helpers)
│   └── types/        → tipos compartilhados (incluindo gerados pelo Payload)
├── docs/             → documentos de governança (10-15)
├── CLAUDE.md         → este arquivo
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .github/workflows/
```

## 14. Comandos canônicos

```bash
# Desenvolvimento
pnpm dev               # roda Next.js + Payload em paralelo
pnpm dev:web           # apenas web
pnpm dev:cms           # apenas Payload

# Qualidade
pnpm lint              # ESLint em todo o monorepo
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest
pnpm test:e2e          # Playwright

# Build
pnpm build             # build de produção
pnpm preview           # preview do build de produção

# Payload
pnpm payload:generate  # regenera types
pnpm payload:seed      # seed inicial (Áreas + 15 Programas em rascunho)
```

## 15. Variáveis de ambiente

Mantenha um `.env.example` versionado e nunca commit `.env`. Variáveis obrigatórias:

```
# Database
DATABASE_URI=postgres://...

# Payload
PAYLOAD_SECRET=...
PAYLOAD_PUBLIC_SERVER_URL=https://...

# Front
PAYLOAD_PUBLIC_FRONT_URL=https://...
REVALIDATE_SECRET=...

# Storage R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=ntc-portal-media
R2_ENDPOINT=...

# Integrações
RDSTATION_TOKEN=...
RESEND_API_KEY=...
HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...

# Observabilidade
SENTRY_DSN=...
```

## 16. Resposta a erros e incidentes

- Erros 5xx em produção → notificar usuário no canal de comunicação acordado, abrir issue, propor fix.
- Erros 4xx repetitivos no mesmo endpoint → investigar e propor ajuste.
- Falha em sincronização RD Station → log no Sentry, Lead marcado como pendente, job retoma.
- Vazamento de dado pessoal → seguir protocolo LGPD (notificar DPO em até 24h via `dpo@gruponctc.org.br`).

## 17. Decisões pendentes ao iniciar Sprint F

Estas decisões devem ser confirmadas pelo usuário antes da Janela A:

1. Domínio definitivo (gruponctc.org.br confirmado ou alternativo?).
2. Conta Vercel Pro (quem provisiona, quem paga, quem administra).
3. Conta Neon Postgres SP (mesmo).
4. Conta Cloudflare R2 (mesmo).
5. Conta Resend (mesmo).
6. Token RD Station (quem gera, quando entrega).
7. Logo lockup SVG do admin (variante para fundo claro do painel).
8. Política de Privacidade — versão final aprovada pelo DPO.
9. Termos de Uso — idem.
10. Lista canônica dos 15 programas com siglas oficiais (já há divergências em documentos antigos — confirmar a nomenclatura final na skill `ntc-grupo:ntc-sistema-editorial`).

## 18. O que fazer quando estiver em dúvida

> **Em qualquer dúvida visual ou editorial, a fonte de verdade é o protótipo HTML aprovado mais recente da página em questão.**

Se o protótipo é ambíguo, a fonte de verdade é o Inventário (doc 12).
Se o Inventário é ambíguo, a fonte de verdade é o DAB (doc 10).
Se o DAB é ambíguo, **você pergunta ao usuário**.

Não improvise. Não invente. Não interprete liberalmente.

---

**Fim das instruções permanentes.**
*Portal Grupo NTC · CLAUDE.md · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
