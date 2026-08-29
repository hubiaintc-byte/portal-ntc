# CLAUDE.md Operacional — Portal Grupo NTC
## Instruções permanentes para o Claude Code · v1 Sprint F

**Versão:** 1.6.1 · 27 de agosto de 2026
**Destino:** este arquivo está na raiz do monorepo. O Claude Code o lê automaticamente em toda sessão e o trata como instrução de mais alta prioridade depois do prompt do usuário.

### Histórico de revisões

- **v1.6.1 — 27/08/2026** — limpeza de pasta local (pente-fino pesando a máquina). Removidos sem risco (regeneram sozinhos): caches `.next` de web e cms (259 MB), cache `.turbo` (209 MB), `*.tsbuildinfo`, 25 scripts de debug `_probe-*.tmp.mjs`/`_valida-*.tmp.mjs` em `scripts/`, e uma duplicata de `06_Pagina_Programa_AGIP_v1.html` na raiz (idêntica à de `feito/`). **Nova pasta `arquivos-fonte/`** (§13) criada e versionada: `img/` da raiz (fotos/logos brutos, 62 MB) virou `arquivos-fonte/fotos-logos-brutos/`, e `Marca_NTC_Pacote_Oficial/` (kit oficial completo da marca, 31 MB) virou `arquivos-fonte/marca-ntc-pacote-oficial/` — ambos commitados localmente (`5136e7b`) para permitir apagar as cópias em disco sem perder o material-fonte; regra órfã `/img/` removida do `.gitignore`. Total liberado no disco: ~500 MB (Fase 1); ~93 MB adicionais movidos para dentro do controle de versão (Fase 2, ainda sem push). Ficaram de fora por decisão pendente do usuário: os 5 PDFs "Folder · Módulo..." na raiz (2 de PROGE ainda sem evento correspondente no site, 3 de EDUTEC prováveis já usados), `NTC_Comercial_Premium.html` (referência viva da Fase B2 do CRM), `05_Pagina_Evento_AGIP_SP_Hibrido_v1.html` (evento AGIP ainda não portado) e a duplicata `feito/12_Pagina_Contato_v1.html` (não commitada, diverge da versão já commitada na raiz — não comparada nesta sessão).
- **v1.6 — 26/08/2026** — sessão de pente-fino: §19 reescrita com o estado real verificado em código (branches locais auditadas: as 9 fora da `main` — `feat/cms-soberana`, `feat/cms-tela-leads`, `feat/cms-eventos-template`, `feat/ocultar-palestrante-site`, `feat/crm-modulo`, `feat/nova-identidade-logos`, `fix/data-card-home-cms`, `fix/imagens-public-img-404`, `fix/revalidar-home-ao-publicar-evento` — estão 100% mergeadas na `main`, sem trabalho órfão; candidatas a limpeza, decisão do usuário). Validado com `pnpm dev` local: site (home, agenda, evento, programa) e Painel Admin (`/entrar`, `/crm`) sobem sem erro de build/runtime. Mudanças incorporadas desde a v1.5 que ainda não estavam documentadas: **CRM Fase B1 mergeada** (`a4a5c49`) — Propostas, Versões e Envios viraram telas reais (antes eram cascas "Em breve"); fix de revalidação da Home ao publicar evento; fix do card de evento na Home para ler a data do CMS; fix de `public/img` não versionado (quebrava fotos em prod); nova identidade visual (logos). Coleções do Payload subiram de 11 para 17 (+ `propostas`, `versoes-proposta`, `envios-proposta` da Fase B1, além de `clientes-crm`/`contatos-crm`/`oportunidades` da Fase A que já estavam contadas). Backlog revisado: item "CRM Fases B/C/D" do §19.2 desmembrado — Fase B1 (registro de propostas) está pronta, falta só o motor A4/PDF (Fase B2, não iniciada) e a tela **Condições** (ainda "Em breve"); Fases C e D seguem do zero.
- **v1.5 — 17/07/2026** — merge da branch `feat/crm-modulo` na `main` (PR #2). Além da Fase A: (1) notificação de lead via Resend REST em `aposCriarLead` (default de destino + escape HTML; sem `RESEND_API_KEY` degrada para console); (2) reestilização do Painel Admin com o idiom do CRM legado (cantos arredondados e sombras — **exceção deliberada ao §3, válida SÓ no painel admin**; site público mantém `border-radius: 0`), logo transparente + seletor de módulo em droplist + bloco do usuário no rodapé da sidebar + gráficos SVG próprios (sem lib) no Dashboard; (3) páginas do CRM organizadas em 2 grupos — **Operação Comercial** (Dashboard Executivo, Leads, Clientes, Contatos, Oportunidades + cascas "Em breve" Propostas/Versões/Envios/Condições) e **Catálogo Institucional** (Programas, Módulos, Produtos/Eventos, listas read-only). §19 atualizada. Specs/planos em `docs/superpowers/` (2026-07-17).
- **v1.4 — 16/07/2026** — Fase A do portal admin unificado: módulo CRM na rota `/crm` (seletor Site|CRM na sidebar, casco compartilhado `ShellPainel`), coleções `clientes-crm`/`contatos-crm`/`oportunidades`, grupo `comercial` em modulos/eventos, importador `crm:importar`. §19 atualizada. Spec/plano em `docs/superpowers/` (2026-07-15).
- **v1.3 — 16/06/2026** — sessão de reativação dos formulários: adicionada §19 (Estado e backlog do CMS) com o que falta para o go-live. Formulários `/api/forms/*` reativados (handlers restaurados do commit `9402e85` + front ligado ao fetch real). Resend e anti-spam (hCaptcha/rate-limit) seguem como stub por decisão do PO.
- **v1.2 — 19/05/2026** — sessão 3 (setup base do Payload): adiamento de 2FA para Janela C (item 8 de §17), `payload-types.ts` versionado em `packages/types/src` em vez de `apps/web/types` (alinha com §13).
- **v1.1 — 19/05/2026** — migração de stack: Neon→Supabase Postgres SP, Cloudflare R2→Supabase Storage, RD Station removido (coleção `Lead` no Payload é fonte única). §15 reescrita; §17 atualizada. Detalhes em `docs/10_DAB §1.1`.
- **v1.0 — 15/05/2026** — versão original Sprint F.

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

Para saber **o que fazer a seguir** no CMS/CRM (não como modelar, mas o que está pendente e em que ordem), consulte `docs/16_Roadmap_CMS_CRM_v1.md` — organizado em Janelas/Sessões no mesmo formato do `docs/15_Prompts_Iniciais_Claude_Code_v1.md`, com prompt pronto pra colar em cada sessão.

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
├── arquivos-fonte/   → material-fonte bruto versionado (fotos/logos em alta
│                        resolução, kit oficial da marca). NÃO é servido pelo
│                        app — as versões otimizadas em uso ficam em
│                        apps/web/public/img/ e apps/cms/public/.
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
pnpm payload:generate     # regenera types
pnpm payload:push:schema  # sincroniza schema do banco (PAYLOAD_DB_PUSH=1). MANUAL, dev PARADO, diff antes. Responder N a DATA LOSS.
pnpm payload:seed         # seed inicial (Áreas + 15 Programas em rascunho)
```

## 15. Variáveis de ambiente

Mantenha um `.env.example` versionado e nunca commit `.env`. Variáveis obrigatórias:

```
# Database (Supabase Postgres SP · pooler porta 6543)
DATABASE_URI=postgresql://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Supabase API
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Supabase Storage (S3-compat)
SUPABASE_S3_ENDPOINT=https://<ref>.storage.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=sa-east-1
SUPABASE_S3_ACCESS_KEY_ID=...
SUPABASE_S3_SECRET_ACCESS_KEY=...
SUPABASE_BUCKET=ntc-portal-media

# Payload
PAYLOAD_SECRET=...
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001

# Front
PAYLOAD_PUBLIC_FRONT_URL=http://localhost:3000
REVALIDATE_SECRET=...

# E-mail transacional
RESEND_API_KEY=...

# Captcha
HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET=...

# Observabilidade
SENTRY_DSN=...
```

## 16. Resposta a erros e incidentes

- Erros 5xx em produção → notificar usuário no canal de comunicação acordado, abrir issue, propor fix.
- Erros 4xx repetitivos no mesmo endpoint → investigar e propor ajuste.
- Falha em envio de e-mail interno (Resend) → log no Sentry; Lead já está persistido na coleção, equipe acessa via admin direto.
- Vazamento de dado pessoal → seguir protocolo LGPD (notificar DPO em até 24h via `dpo@gruponctc.org.br`).

## 17. Decisões pendentes ao iniciar Sprint F

Estas decisões devem ser confirmadas pelo usuário antes da Janela A:

1. Domínio definitivo (gruponctc.org.br confirmado ou alternativo?).
2. Conta Vercel Pro (quem provisiona, quem paga, quem administra). **Tier:** Pro para o go-live (Web + CMS), Free durante desenvolvimento se houver baixo tráfego.
3. ~~Conta Neon Postgres SP~~ → **Supabase Postgres SP** provisionado via MCP em 19/05/2026 (projeto `portal-ntc-staging`, ref `irekejunwknguzdfszyi`, região `sa-east-1`). Projeto de produção a criar na Janela C.
4. ~~Conta Cloudflare R2~~ → **Supabase Storage** (bucket `ntc-portal-media` já criado no projeto de staging).
5. Conta Resend (quem provisiona, quem paga, quem administra).
6. ~~Token RD Station~~ → **RD Station removido da v1.** Leads ficam na coleção `Lead` do Payload, com notificação ativa por e-mail interno via Resend.
7. Logo lockup SVG do admin (variante para fundo claro do painel).
8. **2FA do admin (TOTP)** — pendência da Janela C antes do go-live. DAB §10.1 mantém 2FA obrigatório, mas em staging com 1 super-admin e senha forte gerada (login `contato@institutontc.com.br`), a defesa interim é senha forte + JWT do Payload com expiração. Não há plugin oficial Payload 3 mantido em 19/05/2026 — implementar via middleware custom (`otplib`) ou aguardar plugin estável.
9. Política de Privacidade — versão final aprovada pelo DPO.
10. Termos de Uso — idem.
11. Lista canônica dos 15 programas com siglas oficiais (já há divergências em documentos antigos — confirmar a nomenclatura final na skill `ntc-grupo:ntc-sistema-editorial`).

## 18. O que fazer quando estiver em dúvida

> **Em qualquer dúvida visual ou editorial, a fonte de verdade é o protótipo HTML aprovado mais recente da página em questão.**

Se o protótipo é ambíguo, a fonte de verdade é o Inventário (doc 12).
Se o Inventário é ambíguo, a fonte de verdade é o DAB (doc 10).
Se o DAB é ambíguo, **você pergunta ao usuário**.

Não improvise. Não invente. Não interprete liberalmente.

---

## 19. Estado e backlog do CMS/CRM (atualizado 26/08/2026, verificado em código + `pnpm dev` local)

O CMS é um **Payload CMS 3** com **17 coleções + 4 globals** modeladas e um **Painel Admin próprio** (route group `apps/cms/src/app/(painel)/`, ex-"CMS Soberano") que é o único admin desde 11/06/2026 — o admin nativo do Payload foi removido. O painel está operacional para **ler, editar e publicar** o que já existe, incluindo o registro comercial completo de propostas do CRM; **criar do zero fora do CRM**, o **motor de PDF de propostas**, o **anti-spam** e o **2FA** ainda têm pendências.

### 19.1. Estrutura atual

**Monorepo** (ver §13 para o desenho completo): `apps/web` (site público), `apps/cms` (Payload + Painel Admin, mesmo deploy), `packages/{ui,lib,types}`.

**Site (`apps/web/app`) — route groups:**
`(home)` · `(institucional)` · `(o-grupo)` · `(programas)` (`/programas/[slug]`, `/programas/[slug]/modulos/[modulo]`) · `(capacitacao)` (`/agenda`, `/agenda/[slug]`) · `(conteudos)` · `(solucoes)` · `(vertical)`.

**Coleções do Payload (17):** `users`, `media`, `areas`, `programas`, `modulos`, `eventos`, `especialistas`, `conteudos`, `clientes`, `leads`, `clientes-crm`, `contatos-crm`, `oportunidades`, `propostas`, `versoes-proposta`, `envios-proposta`, `audit-log`.
**Globals (4):** Home, O Grupo, Corpo Docente, Rodapé.

**Painel Admin — módulo Site:** Dashboard, Palestrantes, Eventos, curadoria da Home, Usuários, Configurações (parcial) — todos com dados reais via Local API.

**Painel Admin — módulo CRM (rota `/crm`, casco `ShellCrm` dentro do `ShellPainel` compartilhado, seletor Site|CRM na sidebar):**
- **Operação Comercial:** Dashboard Executivo (KPIs + gráficos SVG próprios + follow-ups) · Leads · Clientes · Contatos · Oportunidades · **Propostas · Versões · Envios** (reais desde a Fase B1, 22/07) · Condições (**ainda "Em breve"** — única casca vazia que resta no grupo).
- **Catálogo Institucional:** Programas, Módulos, Produtos/Eventos — listas **read-only** (edição segue no módulo Site).
- Coleções próprias do CRM: `clientes-crm`, `contatos-crm`, `oportunidades`, `propostas`, `versoes-proposta`, `envios-proposta`. Catálogo comercial único (oportunidades/propostas apontam para `programas`/`modulos`/`eventos`, que têm o grupo `comercial`).
- Importador do CRM legado: `CRM_JSON=/caminho.json CRM_DRY_RUN=1 pnpm crm:importar` (idempotente; sem dry-run grava).

### 19.2. O que já funciona

- **Fluxo rascunho → publicar → revalidar** de Áreas/Programas/Módulos/Eventos/Especialistas/Conteúdos/Home, com o site atualizando via `/api/revalidate` (inclui a Home revalidando ao publicar evento, desde 25/08).
- **Upload de mídia** no Supabase Storage com variantes de imagem (Sharp).
- **Gestão de usuários + recuperação de senha**: tela Usuários (super-admin: listar, criar com convite por e-mail, editar, remover, com proteção do último super-admin); fluxo esqueci/redefinir senha no `/entrar` (tokens nativos do Payload); trocar a própria senha em Configurações → Minha conta. E-mail via adapter Resend (sem `RESEND_API_KEY`, degrada para log no console).
- **Notificação de Lead via Resend**: `aposCriarLead` envia e-mail interno via REST do Resend quando há `RESEND_API_KEY` (default `LEADS_EMAIL_DESTINO`/`contato@institutontc.com.br`, HTML escapado). Sem a chave, só loga.
- **CRM Operação Comercial**: Leads/Clientes/Contatos/Oportunidades com criar e editar reais.
- **CRM Fase B1 — Propostas** (mergeada 22/07, `a4a5c49`): wizard de criação, tela de detalhe editável, versionamento (código-base + versão), registro de envios. É registro/gestão do ciclo comercial — **não gera o documento em PDF ainda** (isso é a Fase B2, não iniciada; não encontrei nenhum código de geração de PDF/A4 no repo).

### 19.3. Backlog — o que falta para o go-live (em ordem de prioridade)

1. **2FA do admin (TOTP)** — login é só senha + JWT de 14 dias. Nunca foi implementado: não há campo TOTP em `Users.ts` nem lógica de verificação; a seção "Segurança e acesso" da tela Configurações está rotulada **"Demonstrativo"** no próprio código — os toggles (2FA, expiração de sessão, auditoria) são decorativos, não persistem nada. Pendência da Janela C (§17.8). **Bloqueador de go-live.**
2. **`RESEND_API_KEY` real na Vercel** — código já funciona (notificação de lead, convites, recuperação de senha); falta o PO provisionar a chave nas envs da Vercel (projetos **cms e web**) + `.env` locais, redeploy e teste real de envio.
3. **Anti-spam real** — `verificarHcaptcha`/`checarRateLimit` seguem stub, atrás de `HCAPTCHA_ENABLED`/`RATELIMIT_ENABLED` (ambos `false`); confirmado também na UI — o toggle "hCaptcha" em Configurações aparece desligado. Implementar siteverify real + store de rate-limit (ex.: Upstash) antes do tráfego público. **Incluir `/entrar/recuperar`** (hoje nada impede e-mail-bombing do endereço de admin conhecido).
4. **CRM Fase B2 — motor A4/PDF de proposta** — é o objetivo original que faltou da Fase B (o "grosso" do CRM legado): gerar o documento formatado a partir do registro já existente em Propostas/Versões.
5. **Tela Condições** — última casca "Em breve" do grupo Operação Comercial.
6. **Criar conteúdo novo pelo painel (fora do CRM)** — botões "Novo evento"/"Novo palestrante" seguem desabilitados. Padrão de formulário de criação já existe (`FormCliente`/`FormOportunidade`/`CamposCrm` no CRM) e pode ser replicado.
7. **Tela de Configurações** — só "Minha conta" é funcional; Segurança, Integrações e Notificações são mockup visual (rotuladas "Demonstrativo" no próprio código).
8. **AuditLog** — coleção existe (`AuditLog.ts`, campos usuario/ação/entidade/metadata/ip), registrada no `payload.config.ts`, mas **nenhum hook escreve nela** — zero rastro de auditoria hoje, apesar do toggle de Configurações sugerir o contrário.
9. **CRM Fase C (Financeiro)** — Contratos, Empenhos, NFs, Recebimentos, Comissões: não iniciada.
10. **CRM Fase D (permissões por módulo)** — não iniciada.
11. **Grupos "Biblioteca Comercial" e "Financeiro"** no menu do CRM — não existem ainda.

### 19.4. Housekeeping pendente (não bloqueia go-live)

Auditoria de 26/08 confirmou que as branches locais `feat/cms-soberana`, `feat/cms-tela-leads`, `feat/cms-eventos-template`, `feat/ocultar-palestrante-site`, `feat/crm-modulo`, `feat/nova-identidade-logos`, `fix/data-card-home-cms`, `fix/imagens-public-img-404` e `fix/revalidar-home-ao-publicar-evento` estão **100% mergeadas na `main`** (`git merge-base --is-ancestor` confirmou as 9), sem nenhum commit à frente — não há trabalho perdido nelas. São candidatas a `git branch -d` (local) e, se o usuário concordar, remoção dos equivalentes em `origin` (5 delas têm branch remota). Decisão e execução ficam para o usuário — apagar branch remota é ação visível para terceiros.

### 19.5. Regra ao mexer em formulários

A infra de forms já existe e não deve ser reinventada (§5.1): schemas Zod em `packages/lib/src/forms/schemas.ts`, helpers de resposta em `apps/web/lib/respostaForm.ts`, `extrairOrigem`/`aposCriarLead`/`verificarHcaptcha`/`checarRateLimit` em `packages/lib/src/forms/`. Os handlers de referência estão preservados no commit `9402e85`. LGPD (§12) é obrigatório em todo submit: consentimento não pré-marcado, versão da política, timestamp e IP gravados no Lead.

---

**Fim das instruções permanentes.**
*Portal Grupo NTC · CLAUDE.md · v1.6.1 · 27 de agosto de 2026 · Instituto NTC do Brasil*
