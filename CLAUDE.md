# CLAUDE.md Operacional — Portal Grupo NTC
## Instruções permanentes para o Claude Code · v1 Sprint F

**Versão:** 2.0 · 7 de setembro de 2026
**Destino:** este arquivo está na raiz do monorepo. O Claude Code o lê automaticamente em toda sessão e o trata como instrução de mais alta prioridade depois do prompt do usuário.

### Histórico de revisões

- **v2.0 — 07/09/2026** — **Sessão C2 (Janela C, anti-spam real) implementada** na branch `feat/anti-spam-c2-turnstile`, **ainda não mergeada na `main`**. Plano: `docs/superpowers/plans/2026-09-07-sessao-c2-anti-spam.md`. Os dois stubs de segurança saíram do papel: `verificarHcaptcha` (que nunca chamou provedor nenhum) virou `verificarCaptcha` com siteverify real do **Cloudflare Turnstile**, e `checarRateLimit` (que devolvia `ok:true` mesmo com a flag ligada — falha **aberta**) virou contagem por (IP, rota) em janela deslizante, lastreada na coleção nova `tentativas-acesso` (21ª) no Postgres do Supabase que já existe. **Nenhuma dependência nova e nenhum fornecedor novo.** A regra ficou pura em `@ntc/lib` com store injetado (padrão `PayloadUsuarios`), adapter por app; os dois caminhos **falham fechado**. `/entrar/recuperar` passou a ter rate limit (3/15 min) — antes qualquer um podia bombardear de e-mail o endereço de admin, que é público neste próprio arquivo — e ao bloquear devolve a mesma mensagem genérica de sucesso, para não confirmar que o endereço existe. Fechada a lacuna que tornava impossível ligar o captcha: o front **não enviava token nenhum**, então virar a flag teria quebrado os 4 formulários; agora existe `<CampoTurnstile>` em `@ntc/ui`, nos 4 formulários públicos. **Entregue com `CAPTCHA_ENABLED=false` e `RATELIMIT_ENABLED=false`** — o PO liga depois de provisionar a conta, sem tocar em código (mesmo padrão do `RESEND_API_KEY`). As três env vars do Turnstile vão **só no projeto web** (o cms não chama `verificarCaptcha`); `RATELIMIT_ENABLED` vai nos dois. Desvios do plano, ambos justificados: `CollectionConfig` do Payload 3.18 não aceita a chave `indexes` (o plano previa isso — ficaram os `index: true` por campo), e o widget usa o `<script async>` nativo do React 19 em vez de `next/script`, porque `@ntc/ui` é Next-free de propósito e não vale ganhar uma dependência do Next por uma tag de script. **Pendências:** `pnpm payload:push:schema` (manual, do PO — a tabela `tentativas_acesso` não existe no banco até lá, e há um worktree irmão vivo `feat/crm-janela-h2-h3-qualificacao` com coleção própria, então vale a regra da v1.9: mergear num estado único e rodar **um** push de lá); credenciais do Turnstile; checkpoint visual humano (§6). **Achado colateral:** `/api/forms/candidatura-especialista` não tem chamador nenhum no front — protegido, mas órfão. §15 e §19 atualizadas.
- **v1.9 — 07/09/2026** — **Passkey (WebAuthn) como 2º fator do Painel Admin, mergeado na `main`** (branch `feat/passkey-2fa-painel`, 14 commits, execução via `subagent-driven-development` — 7 tasks + 2 rounds de fix por task + revisão whole-branch + 1 fix wave de 5 achados). **Substitui o plano de 2FA via TOTP** do §17.8 — TOTP nunca foi implementado e não é mais o caminho. Spec: `docs/superpowers/specs/2026-09-02-passkey-2fa-design.md`. Entregue: 20ª coleção `passkeys`; senha continua sendo o 1º fator (quem não tem passkey cadastrado não vê diferença nenhuma); quem tem passkey recebe, no lugar do cookie de sessão, um **token de ponte cifrado (JWE via `jose`)** com a sessão real selada dentro — o cookie só é setado depois da cerimônia WebAuthn verificada (um JWT só assinado vazaria a sessão pro navegador antes do 2º fator); autogestão em Configurações → Minha conta e remoção pelo super-admin na tela Usuários (cobre dispositivo perdido). A revisão whole-branch pegou **2 Critical que teriam inutilizado a feature**: a checagem anti-clonagem rejeitava `counter=0`, o que travaria Touch ID e passkeys sincronizadas **permanentemente** (a lib só aplica a checagem quando algum lado já reportou contador > 0), e o fluxo "esqueci minha senha" abria sessão sem checar passkey nenhum, contornando o 2º fator inteiro. Ambos corrigidos. **Incidente de schema no caminho:** rodar `payload:push:schema` a partir de uma feature branch isolada **dropou a tabela `historico_estagio`** da branch irmã H1 — o push reconcilia o banco com o código *da branch atual* e trata como órfã qualquer tabela que ela não conheça. Sem perda de dados (banco de dev vazio), restaurado depois. **Regra que fica:** com duas feature branches vivas sobre o mesmo banco, nunca pushar schema de uma delas — mergear num estado único e rodar **um** push de lá (foi o que se fez: as duas branches na `main`, um push, `historico_estagio` restaurada, `passkeys_id` criada, zero colunas órfãs, 115 tabelas). `main` pushada pro origin. **Pendências:** checkpoint visual humano (§6) das duas features; `PAYLOAD_PUBLIC_SERVER_URL` virou **obrigatória em produção** (o `rp.ts` lança se faltar, de propósito — sem ela o WebAuthn falharia silenciosamente); WebAuthn amarra a credencial ao hostname exato, então usar só o domínio canônico (`admin.institutontc.com.br`), nunca o alias `.vercel.app`; com um único super-admin, cadastrar 2 passkeys (notebook + celular) ou criar uma segunda conta antes de depender da feature — perder o único dispositivo bloqueia o login por senha também. §19 atualizada.
- **v1.8 — 04/09/2026** — Sessão H1 da Janela H (Processo Comercial B2G, P0; `docs/17`) implementada na branch `feat/crm-janela-h1-funil-p0` — **ainda não mergeada na `main`**; execução via `subagent-driven-development` — 7 tasks do plano (as tasks 3, 4 e 5 num dispatch único) + 2 rodadas de correção pós-revisão na task do modelo de dados. Entregue: coleção nova `historico-estagio` (19ª coleção; append-only por access control — `create`/`update`/`delete` negados a todo perfil, escrita só pela Local API interna); campos `estagio` (11 estágios), `situacao` (3 valores), `migracaoPendenteRevisao` e `migracaoFlag` em `oportunidades`; o campo `status` legado mantido e agora **derivado** por hook `beforeChange`; hook `afterChange` gravando o histórico de transições; regras puras em `packages/lib/src/crm/funil.ts`; telas de Oportunidades (lista, formulário, detalhe com linha do tempo do histórico e aviso de estágio provisório); script `pnpm --filter @ntc/cms crm:migrar-p0` (dry-run por padrão, aplica com `CRM_MIGRACAO_APLICAR=1`); importador do CRM legado passando a gravar o funil novo. Dois `payload:push:schema` executados no banco de desenvolvimento sem prompt de DATA LOSS, com `payload:generate` depois de cada um. `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam no monorepo inteiro (138 testes no cms, 25 em `@ntc/lib`). **Pendências que ficaram:** o checkpoint visual humano (CLAUDE.md §6) ainda não foi feito; o banco de desenvolvimento tem zero oportunidades — o dry-run do script de migração reportou 0 registros, então ele nunca foi exercitado contra dado real, e a primeira execução com dado de verdade será sem ensaio, exigindo backup antes; a fila de revisão de migração (`migracaoPendenteRevisao`) ainda não tem tela própria, só filtro/coluna na listagem — a tela de trabalho da Direção é escopo da Sessão H7; o campo `status` legado continua sendo gravado como espelho até a H7 migrar Dashboard e gráficos; Dashboard e gráficos ainda leem o funil pelos 6 status legados, não pelos 11 estágios (divergência M2 de `docs/17` §4.0, escopo da H7). §19 atualizada.
- **v1.7.1 — 02/09/2026** — bucket privado `ntc-portal-documentos-comerciais` criado no Supabase Storage (via Storage API, com a `SUPABASE_SERVICE_ROLE_KEY` já existente no `.env` — não precisou de acesso ao dashboard nem de MCP autenticado; `public: false` confirmado por leitura pós-criação e por uma tentativa de fetch anônimo no path público, que respondeu `NoSuchBucket`). `SUPABASE_BUCKET_PRIVADO=ntc-portal-documentos-comerciais` já está no `.env` local — a coleção `documentos-comerciais` (Fase B2) está genuinamente privada em dev agora, não mais caindo no bucket público `ntc-portal-media` como fallback. Falta levar a mesma env var pras envs da Vercel (projeto cms) antes do primeiro deploy com propostas reais — item 4 do backlog em §19.3 atualizado.
- **v1.7 — 29/08/2026** — CRM Fase B2 (Sessão D1 do roadmap, `docs/16`): motor de geração de PDF de propostas implementado e mergeado na `main` (branch `feat/crm-fase-b2-motor-pdf`, 15 commits, execução via `subagent-driven-development` — 5 tasks do plano + 2 rounds de fix pós-revisão final). Fatia vertical: capa + 3 seções (Identificação, Quadro Comercial, Condições Comerciais), tokens visuais do site (não a paleta do CRM legado), Playwright com dev local (Chromium da raiz do monorepo) e branch serverless (`@sparticuz/chromium`, para Vercel). PDF é gerado e salvo (não só baixado sob demanda) numa coleção **nova e dedicada** `documentos-comerciais` (18ª coleção) — diferente de `media`, exige usuário autenticado para leitura (CLAUDE.md §12 · LGPD: propostas carregam preço, desconto e dados de contato). A revisão final (whole-branch) encontrou e corrigiu: capa que transbordava para uma página em branco; fontes da marca (Cormorant/Barlow) que não carregavam no PDF (agora auto-hospedadas via `@font-face` base64, sem CDN — CLAUDE.md §3); valores arredondados para reais inteiros num documento contratual; config serverless (`serverExternalPackages`); erro de leitura silencioso reportado como "proposta não encontrada". **Pendência que ficou para o PO** (não pode ser resolvida por um agente sem credenciais de nuvem): `documentos-comerciais` está registrada numa segunda instância do plugin `s3Storage` apontando para `SUPABASE_BUCKET_PRIVADO` — enquanto esse bucket privado não for criado no Supabase e a env var configurada (documentada em `.env.example`), a coleção cai de volta no bucket público `ntc-portal-media` (mitigado com nome de arquivo não-adivinhável via `crypto.randomBytes`, mas não é `read`-privado de fato até o bucket existir). §19 atualizada — item 4 do backlog vira essa pendência de infraestrutura em vez do motor de PDF em si.
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

# Anti-spam
# Cloudflare Turnstile. Enquanto CAPTCHA_ENABLED != "true" a verificação é
# pulada e o widget não renderiza — estado de entrega da Sessão C2, até as
# chaves serem provisionadas. Site key é pública (vai pro bundle do front).
CAPTCHA_ENABLED=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET=

# Rate limit por (IP, rota), lastreado na coleção tentativas-acesso do
# Payload (Postgres do Supabase — sem serviço externo).
RATELIMIT_ENABLED=false

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

## 19. Estado e backlog do CMS/CRM (atualizado 04/09/2026, verificado em código + `pnpm --filter @ntc/cms typecheck`/`test` local)

O CMS é um **Payload CMS 3** com **21 coleções + 4 globals** modeladas e um **Painel Admin próprio** (route group `apps/cms/src/app/(painel)/`, ex-"CMS Soberano") que é o único admin desde 11/06/2026 — o admin nativo do Payload foi removido. O painel está operacional para **ler, editar e publicar** o que já existe, incluindo o registro comercial completo de propostas do CRM e a geração do PDF da proposta (Fase B2); **criar do zero fora do CRM**, o **anti-spam** e o **2FA** ainda têm pendências.

### 19.1. Estrutura atual

**Monorepo** (ver §13 para o desenho completo): `apps/web` (site público), `apps/cms` (Payload + Painel Admin, mesmo deploy), `packages/{ui,lib,types}`.

**Site (`apps/web/app`) — route groups:**
`(home)` · `(institucional)` · `(o-grupo)` · `(programas)` (`/programas/[slug]`, `/programas/[slug]/modulos/[modulo]`) · `(capacitacao)` (`/agenda`, `/agenda/[slug]`) · `(conteudos)` · `(solucoes)` · `(vertical)`.

**Coleções do Payload (21):** `users`, `media`, `areas`, `programas`, `modulos`, `eventos`, `especialistas`, `conteudos`, `clientes`, `leads`, `clientes-crm`, `contatos-crm`, `oportunidades`, `propostas`, `versoes-proposta`, `envios-proposta`, `documentos-comerciais`, `historico-estagio`, `passkeys`, `tentativas-acesso`, `audit-log`.
**Globals (4):** Home, O Grupo, Corpo Docente, Rodapé.

**Painel Admin — módulo Site:** Dashboard, Palestrantes, Eventos, curadoria da Home, Usuários, Configurações (parcial) — todos com dados reais via Local API.

**Painel Admin — módulo CRM (rota `/crm`, casco `ShellCrm` dentro do `ShellPainel` compartilhado, seletor Site|CRM na sidebar):**
- **Operação Comercial:** Dashboard Executivo (KPIs + gráficos SVG próprios + follow-ups) · Leads · Clientes · Contatos · Oportunidades · **Propostas · Versões · Envios** (reais desde a Fase B1, 22/07) · Condições (**ainda "Em breve"** — única casca vazia que resta no grupo).
- **Catálogo Institucional:** Programas, Módulos, Produtos/Eventos — listas **read-only** (edição segue no módulo Site).
- Coleções próprias do CRM: `clientes-crm`, `contatos-crm`, `oportunidades`, `propostas`, `versoes-proposta`, `envios-proposta`, `historico-estagio`. Catálogo comercial único (oportunidades/propostas apontam para `programas`/`modulos`/`eventos`, que têm o grupo `comercial`).
- Importador do CRM legado: `CRM_JSON=/caminho.json CRM_DRY_RUN=1 pnpm crm:importar` (idempotente; sem dry-run grava) — desde a Sessão H1, já grava `estagio`/`situacao` do funil novo.
- **Fundação do funil P0** (Sessão H1 da Janela H, `docs/17`): `oportunidades` ganhou os campos `estagio` (11 estágios) e `situacao` (3 valores), ortogonais ao `status` legado — mantido, mas agora derivado por hook `beforeChange`. Toda transição de estágio é gravada na coleção `historico-estagio` (append-only, hook `afterChange`). Telas de Oportunidades (lista, formulário, detalhe) já refletem o funil novo; **Dashboard e gráficos continuam lendo o `status` legado** — migrar para os 11 estágios é escopo da Sessão H7.

### 19.2. O que já funciona

- **Fluxo rascunho → publicar → revalidar** de Áreas/Programas/Módulos/Eventos/Especialistas/Conteúdos/Home, com o site atualizando via `/api/revalidate` (inclui a Home revalidando ao publicar evento, desde 25/08).
- **Upload de mídia** no Supabase Storage com variantes de imagem (Sharp).
- **Gestão de usuários + recuperação de senha**: tela Usuários (super-admin: listar, criar com convite por e-mail, editar, remover, com proteção do último super-admin); fluxo esqueci/redefinir senha no `/entrar` (tokens nativos do Payload); trocar a própria senha em Configurações → Minha conta. E-mail via adapter Resend (sem `RESEND_API_KEY`, degrada para log no console).
- **Notificação de Lead via Resend**: `aposCriarLead` envia e-mail interno via REST do Resend quando há `RESEND_API_KEY` (default `LEADS_EMAIL_DESTINO`/`contato@institutontc.com.br`, HTML escapado). Sem a chave, só loga.
- **CRM Operação Comercial**: Leads/Clientes/Contatos/Oportunidades com criar e editar reais.
- **CRM Fase B1 — Propostas** (mergeada 22/07, `a4a5c49`): wizard de criação, tela de detalhe editável, versionamento (código-base + versão), registro de envios.
- **CRM Fase B2 — motor de PDF de propostas** (mergeada 29/08): botão "Gerar PDF" na tela de detalhe gera capa + 3 seções (Identificação, Quadro Comercial, Condições Comerciais) via Playwright, com os tokens visuais do site (não a paleta do CRM legado), e salva o PDF vinculado à proposta (campo `pdfGerado`, coleção dedicada `documentos-comerciais`) — não é só download sob demanda. Fatia vertical: as ~15 seções descritivas do documento completo (histórico institucional, metodologia, etc.) ficam para uma sessão seguinte (Sessão D2 do roadmap). **Pendência de infraestrutura antes de ir ao ar com dados reais de cliente:** ver item 4 do backlog abaixo.
- **CRM P0 — fundação do funil (Sessão H1 da Janela H, concluída 04/09 na branch `feat/crm-janela-h1-funil-p0`, ainda não mergeada na `main`)**: `oportunidades` ganhou `estagio` (11 estágios) e `situacao` (3 valores) ortogonais ao `status` legado (mantido, agora derivado em hook `beforeChange`); histórico imutável de transições na nova coleção `historico-estagio` (hook `afterChange`, append-only por access control); telas de Oportunidades (lista, formulário, detalhe com linha do tempo do histórico e aviso de estágio provisório) refletem o funil novo; script `crm:migrar-p0` (dry-run por padrão) e o importador do CRM legado já gravam o funil novo. Dashboard e gráficos **não mudaram** nesta sessão — continuam lendo o `status` legado (migrar é escopo da Sessão H7, `docs/17`).

### 19.3. Backlog — o que falta para o go-live (em ordem de prioridade)

1. **2FA do admin — ENTREGUE via passkey/WebAuthn** (v1.9, mergeado na `main` em 07/09), **não** via TOTP. Falta só o **checkpoint visual humano** (§6): cadastrar um passkey com Touch ID em Configurações → Minha conta, deslogar e confirmar que a 2ª etapa aparece e completa — é o teste que expõe em 30 segundos o Critical do contador que a revisão pegou. É opcional por usuário (quem não cadastra segue só com senha), então **ainda não fecha sozinho o "2FA obrigatório" do DAB §10.1** — tornar obrigatório é decisão futura do PO. A seção "Segurança e acesso" da tela Configurações segue **"Demonstrativo"** (toggles decorativos) — a parte real de passkeys fica em "Minha conta".
2. **`RESEND_API_KEY` real na Vercel** — código já funciona (notificação de lead, convites, recuperação de senha); falta o PO provisionar a chave nas envs da Vercel (projetos **cms e web**) + `.env` locais, redeploy e teste real de envio.
3. **Anti-spam real — IMPLEMENTADO na Sessão C2 (07/09/2026), entregue com as duas flags DESLIGADAS.** `verificarHcaptcha` deixou de existir: no lugar entrou `verificarCaptcha` (`packages/lib/src/forms/captcha.ts`), que chama de verdade o siteverify do **Cloudflare Turnstile** (decisão do PO — não hCaptcha: grátis e ilimitado, quase sempre invisível, melhor privacidade). `checarRateLimit` deixou de devolver `ok:true` sempre: agora conta tentativas por (IP, rota) numa janela deslizante, com o store **no Postgres do Supabase que já existe**, via a coleção nova `tentativas-acesso` (21ª coleção) — sem fornecedor novo e sem credencial nova. A regra ficou pura e testável em `@ntc/lib` com o store injetado (padrão `PayloadUsuarios`); cada app tem seu adapter (`apps/web/lib/storeRateLimit.ts` e `apps/cms/src/lib/storeRateLimit.ts`). **Os dois falham fechado**: provedor de captcha fora do ar, sem secret ou banco indisponível **bloqueiam** a requisição, nunca liberam. Limites: 5 envios / 10 min nos formulários públicos; 3 / 15 min na recuperação de senha. **`/entrar/recuperar` está coberto** — e ao bloquear devolve a mesma mensagem genérica de sucesso, para não confirmar ao atacante que o endereço existe. Fechada também a lacuna que impedia ligar o captcha: o front **não enviava token nenhum**; agora há `<CampoTurnstile>` em `@ntc/ui` renderizado nos 4 formulários públicos (newsletter + as 4 abas do /contato). LGPD (§12): `tentativas-acesso` guarda IP, e o próprio fluxo de checagem apaga o que sai da janela — retenção curta e limpeza automática são requisito, não otimização.
   **O que falta para ligar (tudo do PO, sem tocar em código):** (a) rodar `pnpm payload:push:schema` — a tabela `tentativas_acesso` **não existe no banco** até isso (ver o aviso de branches paralelas em §14 e no histórico da v1.9); (b) criar a conta Cloudflare Turnstile (widget manual, modo *Managed*; o "Set up with Spin" do dashboard **não** serve aqui — ele reescreveria por cima da integração que já existe) e setar `CAPTCHA_ENABLED=true`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET` **só no projeto web** (local + Vercel): o captcha é chamado apenas pelos 4 handlers de `/api/forms/*`, o cms não usa `verificarCaptcha` em lugar nenhum; (c) virar `RATELIMIT_ENABLED=true` **nos dois** projetos (web e cms — o rate limit roda nos dois), e só **depois** do push de schema do item (a): com a flag ligada e a tabela ausente o store falha, e como a falha é fechada por desenho, todo formulário passa a ser bloqueado. Antes disso o comportamento para o usuário final é idêntico ao de hoje. O toggle "hCaptcha" da tela Configurações continua **decorativo** (a seção segue "Demonstrativo", item 7). **Achado colateral da sessão:** `/api/forms/candidatura-especialista` **não tem chamador nenhum no front** (confirmado por grep) — está protegido como os outros, mas é um endpoint órfão; manter ou remover é decisão do PO.

4. **`RESEND_API_KEY`/bucket privado na Vercel** — o bucket privado `ntc-portal-documentos-comerciais` já foi criado no Supabase Storage (02/09/2026, via Storage API com a service_role key, `public: false` confirmado) e `SUPABASE_BUCKET_PRIVADO` já está no `.env` local — `documentos-comerciais` está genuinamente privada em dev agora. Falta só levar a mesma env var pras envs da Vercel (projeto **cms**) antes do primeiro deploy com propostas reais, junto com a pendência já conhecida do `RESEND_API_KEY` (item 2). Também pendente da mesma sessão (não bloqueador): `maxDuration` da função serverless não foi configurado (o caminho real é a Server Action `gerarPdfPropostaCrm`, precisa ir em `(painel)/crm/page.tsx`) — cold start do Chromium pode estourar o timeout padrão da Vercel em produção; validar num deploy real antes do go-live.
5. **Tela Condições** — última casca "Em breve" do grupo Operação Comercial.
6. **Criar conteúdo novo pelo painel (fora do CRM)** — botões "Novo evento"/"Novo palestrante" seguem desabilitados. Padrão de formulário de criação já existe (`FormCliente`/`FormOportunidade`/`CamposCrm` no CRM) e pode ser replicado.
7. **Tela de Configurações** — só "Minha conta" é funcional; Segurança, Integrações e Notificações são mockup visual (rotuladas "Demonstrativo" no próprio código).
8. **AuditLog** — coleção existe (`AuditLog.ts`, campos usuario/ação/entidade/metadata/ip), registrada no `payload.config.ts`, mas **nenhum hook escreve nela** — zero rastro de auditoria hoje, apesar do toggle de Configurações sugerir o contrário.
9. **CRM Fase C (Financeiro)** — Contratos, Empenhos, NFs, Recebimentos, Comissões: não iniciada.
10. **CRM Fase D (permissões por módulo)** — não iniciada.
11. **Grupos "Biblioteca Comercial" e "Financeiro"** no menu do CRM — não existem ainda.
12. **CRM P0 — Processo Comercial B2G (Janela H, `docs/17`)** — Sessão H1 (fundação: estágio/situação/histórico/migração) concluída em 04/09/2026 na branch `feat/crm-janela-h1-funil-p0`, **ainda não mergeada na `main`**. O que ficou: o checkpoint visual humano (CLAUDE.md §6) ainda não foi feito; o banco de desenvolvimento tem zero oportunidades — o dry-run do script de migração não teve dado real para exercitar, então a primeira execução contra dado de verdade será sem ensaio e exige backup antes; a fila de revisão de migração (`migracaoPendenteRevisao`) é só filtro/coluna na listagem, sem tela própria de trabalho (Sessão H7); o campo `status` legado segue sendo gravado como espelho até a H7 migrar Dashboard e gráficos; Dashboard e gráficos continuam no funil de 6 status legados, não nos 11 estágios (divergência M2 de `docs/17` §4.0). Sessões H2–H8 não iniciadas.

### 19.4. Housekeeping pendente (não bloqueia go-live)

Auditoria de 26/08 confirmou que as branches locais `feat/cms-soberana`, `feat/cms-tela-leads`, `feat/cms-eventos-template`, `feat/ocultar-palestrante-site`, `feat/crm-modulo`, `feat/nova-identidade-logos`, `fix/data-card-home-cms`, `fix/imagens-public-img-404` e `fix/revalidar-home-ao-publicar-evento` estão **100% mergeadas na `main`** (`git merge-base --is-ancestor` confirmou as 9), sem nenhum commit à frente — não há trabalho perdido nelas. São candidatas a `git branch -d` (local) e, se o usuário concordar, remoção dos equivalentes em `origin` (5 delas têm branch remota). Decisão e execução ficam para o usuário — apagar branch remota é ação visível para terceiros.

### 19.5. Regra ao mexer em formulários

A infra de forms já existe e não deve ser reinventada (§5.1): schemas Zod em `packages/lib/src/forms/schemas.ts`, helpers de resposta em `apps/web/lib/respostaForm.ts`, `extrairOrigem`/`aposCriarLead`/`verificarCaptcha`/`checarRateLimit` em `packages/lib/src/forms/`. Anti-spam é real desde a Sessão C2 (§19.3 item 3), só entregue com as flags desligadas: **não** volte a tratar `verificarCaptcha`/`checarRateLimit` como stub, e ao chamar `checarRateLimit` injete o store do app (`criarStoreRateLimit`) — sem ele não compila. Os handlers de referência estão preservados no commit `9402e85`. LGPD (§12) é obrigatório em todo submit: consentimento não pré-marcado, versão da política, timestamp e IP gravados no Lead.

---

**Fim das instruções permanentes.**
*Portal Grupo NTC · CLAUDE.md · v2.0 · 7 de setembro de 2026 · Instituto NTC do Brasil*
