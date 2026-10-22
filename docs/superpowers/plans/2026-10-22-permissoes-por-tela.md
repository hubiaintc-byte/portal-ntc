# Permissões por tela — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar os 4 perfis fixos do Painel Admin por telas marcadas pessoa a pessoa (mais a caixinha Administrador), com o servidor conferindo as telas em toda action, rota, página e na REST.

**Architecture:** Um catálogo puro de telas (`lib/cms/telas.ts`) define as 15 caixinhas e as regras (`temTela`, `capacidadesDoAcesso`); `users` ganha `administrador` + `telas` (select `hasMany`); `autenticacao.ts` expõe guardas por tela; access das coleções, Server Actions, páginas e shells passam a consultar só esse catálogo. Migração em duas etapas: a 1 acrescenta campos e deixa `perfil` opcional (sem perda de dado); a 2 (depois do deploy) remove `perfil`.

**Tech Stack:** Next 16 App Router (cms), Payload 3.90.2 + Postgres (Supabase), Vitest (node), TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-10-21-permissoes-por-tela-design.md` (ler inteiro antes de começar).

**Base:** branch `docs/permissoes-por-tela` (contém `fix/painel-botoes-por-perfil`, que já criou `capacidadesDoPerfil` e esconde os controles por flag). Worktree: `/Users/joao/Documents/portal-ntc-botoes`. Criar a branch de trabalho `feat/permissoes-por-tela` a partir dela.

## Global Constraints

- Banco único dev+produção. **Nenhuma task escreve no banco.** `payload:push:schema` e o script de migração são **do PO**, nas Tasks 2 e 10. Leitura no banco só com `BEGIN READ ONLY; …; COMMIT;` (nunca `SET` solto — vaza pelo pooler 6543).
- **Nunca remover `manterRlsLigado`** (`lib/cms/compatibilidadeSchema.ts`). O diff de schema não pode conter `DISABLE ROW LEVEL SECURITY`, `DROP TABLE` nem `DROP COLUMN` na etapa 1.
- Mensagem de recusa das actions: exatamente `"Sessão expirada ou sem permissão para esta ação."` (a que já existe).
- Administrador tem acesso total; "Minha conta" (Configurações → Minha conta) sempre disponível; o sistema recusa remover o último administrador, desmarcar Administrador na própria conta e remover a si mesmo.
- Leitura pública da REST (`access/leituraPublica.ts`) **não muda**.
- Cada página só carrega os dados das telas permitidas + dados de apoio mínimos (spec §3.3, §6 anti-objetivo de vazamento).
- Gates ao fim de cada task: `pnpm --filter @ntc/cms typecheck`, `pnpm --filter @ntc/cms test`, `pnpm lint` (0 erros; avisos pré-existentes: cms 6, web 32). `pnpm build` nas Tasks 7 e 9.
- Commits em português, Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **Usuário sem nenhuma tela marcada** entra e cai em Configurações → Minha conta, sem erro e sem dado de nenhuma tela — teste na Task 7 (`destinoDepoisDoLogin` com acesso vazio).
2. **Id de tela desconhecido gravado no banco** (tela renomeada no futuro) é ignorado, não quebra a leitura do usuário — teste na Task 1 (`acessoDoUsuario` filtra ids fora de `TELAS`).
3. **PATCH na REST de `users`** tentando marcar `administrador`/`telas` (por quem não é administrador) ou desmarcar o próprio administrador — recusado pelo field access e pela regra de último administrador — testes na Task 4 e na Task 8. (A REST de `users` hoje responde 404 pelo `proxy.ts`; a regra precisa valer mesmo assim.)
4. **Usuário com Leads e sem Clientes** chama `salvarClienteCrm`/`apagarClienteCrm` direto (action forjada) — recusado; mas `salvarLeadCrm` com "criar cliente novo" e `vincularClienteCrm` funcionam (spec §3.7) — testes na Task 5.
5. **Usuário com Clientes e sem Leads** não recebe dados do lead (mensagem, e-mail, telefone) no HTML do detalhe do cliente nem por `carregarLeadCrm` — testes nas Tasks 5 e 7.

---

## Mapeamento de referência (usado pelas Tasks 4–7)

Ids das telas (Task 1 os define; os rótulos são os do menu atual):

| id | módulo | rótulo | id de navegação atual |
|---|---|---|---|
| `site.painel` | site | Painel | `dashboard` (ShellCms) |
| `site.palestrantes` | site | Palestrantes | `palestrantes` |
| `site.corpo-docente` | site | Corpo Docente | `corpo-docente` |
| `site.eventos` | site | Eventos | `eventos` |
| `site.conteudos` | site | Conteúdos | `conteudos` |
| `site.home` | site | Home | `home` |
| `site.contatos` | site | Contatos do site | seção de contatos em `config` |
| `crm.dashboard` | crm | Dashboard | `painel` (ShellCrm) |
| `crm.leads` | crm | Leads | `leads` |
| `crm.clientes` | crm | Clientes | `clientes` |
| `crm.propostas` | crm | Propostas | `propostas` |
| `crm.envios` | crm | Envios | `envios` |
| `crm.programas` | crm | Programas | `programas` |
| `crm.modulos` | crm | Módulos | `modulos` |
| `crm.produtos` | crm | Produtos / Eventos | `produtos` |

Constantes de grupo (Task 1): `TELAS_LEADS = ["crm.dashboard","crm.leads"]`.

**Server Actions → telas exigidas** (administrador sempre passa):

| Action(s) | Telas (qualquer uma) |
|---|---|
| `acoesCrm`: carregarLeadCrm, salvarLeadCrm (inclui criar cliente novo — §3.7), moverLeadCrm, marcarLeadPerdidoCrm, reabrirLeadCrm, vincularClienteCrm (§3.7), apagarLeadCrm | `TELAS_LEADS` |
| `acoesCrm`: agendarEventoCrm | `TELAS_LEADS` |
| `acoesCrm`: registrarContratoCrm, salvarLinksCrm, marcarEventoRealizadoCrm, cancelarEventoCrm, subirDocumentoEventoCrm, removerDocumentoEventoCrm | `TELAS_LEADS` + `crm.clientes` (acervo — §3.8) |
| `acoesCrm`: adicionarNotaCrm | `TELAS_LEADS` + `crm.clientes` |
| `acoesCrm`: carregarClienteCrm, salvarClienteCrm, apagarClienteCrm | `crm.clientes` |
| `acoesCrm`: carregarPropostaCrm, salvarPropostaCrm, novaVersaoPropostaCrm, restaurar/salvarSecaoConteudoPropostaCrm, registrarEnvioCrm; rota `crm/propostas/[id]/documento` | `crm.propostas` |
| `acoesCatalogo`: salvar/excluirProgramaCatalogoCrm | `crm.programas` |
| `acoesCatalogo`: salvar/excluirModuloCatalogoCrm | `crm.modulos`, `crm.programas` (o detalhe do programa cria módulo — decisão do plano) |
| `acoesCatalogo`: carregarPrograma/ModuloCatalogoCrm | `crm.programas`, `crm.modulos`, `crm.propostas` |
| `acoes.ts`: salvarEvento, enviarMidia, alternarPublicacaoEvento, salvarPalestrantesEvento, importarEventoPdf, criarEventoEmBranco | `site.eventos` |
| `acoes.ts`: salvarPalestrante, alternarOcultarPalestrante | `site.palestrantes` (+ bloco Corpo Docente só com `site.corpo-docente` — spec §7) |
| `acoes.ts`: salvarOrdemCorpoDocente | `site.corpo-docente` |
| `acoes.ts`: salvarEventosDestaqueHome | `site.home` |
| `acoes.ts`: salvar/publicar/despublicar/excluirConteudo, enviarMidiaConteudo | `site.conteudos` |
| `acoes.ts`: salvarContatos | `site.contatos` |
| `acoes.ts`: usuários e passkeys de terceiros | administrador |
| leituras de conteúdo público (carregarEvento, carregarPalestrante, listarConteudos, …) | só sessão (como hoje) |

**Access das coleções/globals (REST)** — escrita e leitura autenticada (leitura anônima segue `leituraPublica`):

| Coleção/global | read (logado) | create/update | delete |
|---|---|---|---|
| leads | `TELAS_LEADS` | `TELAS_LEADS` | administrador |
| clientes-crm | `TELAS_LEADS` + clientes + propostas | `crm.clientes` | administrador |
| eventos-comerciais | `TELAS_LEADS` + clientes | `TELAS_LEADS` + clientes | administrador |
| linha-do-tempo | `TELAS_LEADS` + clientes | regra `criarSoNota` com `TELAS_LEADS` + clientes | (como hoje) |
| propostas, versoes-proposta, envios-proposta | `crm.propostas` | `crm.propostas` | administrador |
| documentos-comerciais | clientes + propostas | clientes + propostas | administrador |
| programas | (público) | `crm.programas` | `crm.programas` |
| modulos | (público) | `crm.modulos`, `crm.programas` | idem |
| eventos | (público) | `site.eventos` | `site.eventos` |
| especialistas | (público) | `site.palestrantes` | `site.palestrantes` |
| conteudos | (público) | `site.conteudos` | `site.conteudos` |
| global home / corpo-docente / rodape | (público) | `site.home` / `site.corpo-docente` / `site.contatos` | — |
| areas, clientes (vitrine), global o-grupo, modelos-email, envios-email, audit-log, tentativas-acesso, media* | (como hoje) | administrador | administrador |
| users | o próprio + administrador | update do próprio (nome/senha); `administrador`/`telas` só administrador | administrador |

\* `media`: create/update hoje é de editores; passa a `site.eventos` + `site.palestrantes` + `site.conteudos` + `site.home` (quem sobe imagem). Confirmar lendo `collections/Media.ts`.

---

### Task 1: Catálogo de telas e regras puras

**Files:**
- Create: `apps/cms/src/lib/cms/telas.ts`
- Create: `apps/cms/src/lib/cms/telas.test.ts`
- Modify: `apps/cms/src/lib/cms/perfis.ts` (passa a reexportar de `telas.ts` o que as telas consomem; `capacidadesDoPerfil` vira `capacidadesDoAcesso`)
- Modify: `apps/cms/src/lib/cms/perfis.test.ts`

**Interfaces:**
- Produces:
  - `TELAS: readonly { id: TelaPainel; modulo: "site" | "crm"; rotulo: string }[]` (ordem = ordem do menu, tabela acima)
  - `type TelaPainel = "site.painel" | … | "crm.produtos"` (15 ids)
  - `TELAS_LEADS: readonly TelaPainel[]`
  - `interface AcessoPainel { administrador: boolean; telas: readonly TelaPainel[] }`
  - `acessoDoUsuario(u: { administrador?: boolean | null; telas?: readonly string[] | null } | null | undefined): AcessoPainel` — filtra ids desconhecidos, remove duplicatas
  - `temTela(acesso: AcessoPainel | null | undefined, telas: readonly TelaPainel[]): boolean` — administrador → true; senão interseção não vazia
  - `telasDoModulo(acesso: AcessoPainel, modulo: "site" | "crm"): TelaPainel[]` — administrador → todas do módulo
  - `capacidadesDoAcesso(acesso: AcessoPainel): CapacidadesPainel` — mesmas 9 flags de hoje, agora por tela: editarEventos←site.eventos; editarPalestrantes←site.palestrantes; editarCorpoDocente←site.corpo-docente; editarHome←site.home; editarConteudos←site.conteudos; editarContatos←site.contatos; editarCatalogo←crm.programas|crm.modulos; usarCrm←qualquer tela crm; gerirUsuarios←administrador. Acrescenta `editarCardCorpoDocente` ← site.palestrantes **e** site.corpo-docente; `verLeads` ← `TELAS_LEADS`.

- [ ] **Step 1: Write the failing tests** em `telas.test.ts`:
  - `acessoDoUsuario({ telas: ["crm.leads","inexistente","crm.leads"] })` → `{ administrador: false, telas: ["crm.leads"] }`; `acessoDoUsuario(null)` → `{ administrador: false, telas: [] }`.
  - `temTela({administrador:true,telas:[]}, ["crm.clientes"])` → true; `temTela({administrador:false,telas:["crm.leads"]}, ["crm.clientes"])` → false; `temTela(null, TELAS_LEADS)` → false.
  - Secretaria `{administrador:false, telas:["crm.dashboard","crm.leads","crm.propostas"]}`: `capacidadesDoAcesso` → `usarCrm: true, verLeads: true, editarCatalogo: false, gerirUsuarios: false, editarEventos: false`.
  - `{telas:["site.palestrantes"]}` → `editarPalestrantes: true, editarCardCorpoDocente: false`; com `site.corpo-docente` também → `editarCardCorpoDocente: true`.
  - `TELAS.length === 15` e ids únicos.
- [ ] **Step 2:** `pnpm --filter @ntc/cms exec vitest run src/lib/cms/telas.test.ts` → FAIL (módulo não existe).
- [ ] **Step 3:** Implementar `telas.ts`; em `perfis.ts`, remover `capacidadesDoPerfil` e reexportar `CapacidadesPainel`/`capacidadesDoAcesso` de `telas.ts` (os `PERFIS_*`/`temPerfil` ficam até a Task 9). Ajustar os dois chamadores de `capacidadesDoPerfil` (`(painel)/page.tsx`, `crm/page.tsx`) temporariamente para `capacidadesDoAcesso(acessoDoPerfilLegado(perfil))`, onde `acessoDoPerfilLegado(perfil: string): AcessoPainel` (em `telas.ts`, marcado `@deprecated`, removido na Task 9) devolve o mapeamento da Task 2 — assim nada muda de comportamento até a Task 3.
- [ ] **Step 4:** vitest dos dois arquivos de teste → PASS; typecheck → limpo.
- [ ] **Step 5: Commit** `feat(painel): catalogo de telas e regras de acesso por tela`

### Task 2: Campos em `users`, migração da etapa 1 (código) e roteiro do push

**Files:**
- Modify: `apps/cms/src/collections/Users.ts`
- Create: `apps/cms/src/seed/migrarPermissoesPorTela.ts`, `apps/cms/src/seed/migrarPermissoesPorTela.test.ts`
- Modify: `apps/cms/package.json` (script `permissoes:migrar`)
- Modify: `packages/types/src/payload-types.ts` (via `pnpm --filter @ntc/cms payload:generate`)

**Interfaces:**
- Consumes: `TELAS`, `TelaPainel`, `acessoDoPerfilLegado` (Task 1).
- Produces: campos `users.administrador` (checkbox, default `false`) e `users.telas` (select `hasMany`, options = `TELAS` com `label: rotulo`, `value: id`); `perfil` com `required: false` e `admin.hidden: true` (removido só na etapa 2). Field access de `administrador` e `telas`: `update` só administrador (`({ req }) => Boolean(req.user?.administrador)`), `create` idem.
- Produces: `planejarMigracao(usuarios: { id: number; perfil?: string | null; administrador?: boolean | null; telas?: string[] | null }[]): { id: number; administrador: boolean; telas: TelaPainel[] }[]` — só usuários ainda sem `administrador` nem `telas`; `super-admin` → administrador; os outros perfis → `acessoDoPerfilLegado`.

Mapeamento legado (para `acessoDoPerfilLegado`, mantendo o que cada perfil podia hoje):
- `super-admin` → `{ administrador: true, telas: [] }`
- `atendimento-comercial` → todas as `crm.*` + `site.painel`
- `editor-institucional` → todas as `site.*` + `crm.programas`, `crm.modulos`, `crm.produtos`
- `editor-eventos` → `site.painel`, `site.eventos`

- [ ] **Step 1:** Testes de `planejarMigracao`: super-admin vira administrador; editor-eventos vira as duas telas; usuário que já tem `administrador: true` é pulado; perfil desconhecido → `{ administrador: false, telas: [] }`.
- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3:** Implementar `planejarMigracao` e o script `seed/migrarPermissoesPorTela.ts` no padrão de `seed/importarProgramas.ts`: dry-run por padrão (imprime o plano), aplica com `PERMISSOES_MIGRAR_APLICAR=1` via `payload.update` por usuário. Alterar `Users.ts` como no bloco Produces e rodar `payload:generate`.
- [ ] **Step 4:** vitest → PASS; typecheck → limpo.
- [ ] **Step 5:** **Diff de schema só de leitura** (não aplicar): script descartável no scratchpad que chama `payload.db.requireDrizzleKit().pushSchema(...)` **sem** `apply()` (mesmo método do upgrade de 07/10). Esperado e nada além: `CREATE TYPE "enum_users_telas"`, `CREATE TABLE "users_telas"` (+ `ENABLE ROW LEVEL SECURITY`, FK e índices), `ALTER TABLE "users" ADD COLUMN "administrador" boolean DEFAULT false`, `ALTER TABLE "users" ALTER COLUMN "perfil" DROP NOT NULL`. Registrar a lista no commit. Se aparecer `DROP TABLE`/`DROP COLUMN`/`DISABLE ROW LEVEL SECURITY`: parar e relatar.
- [ ] **Step 6: Commit** `feat(cms): campos administrador e telas em users e migracao por perfil` (corpo com o diff esperado e: "push e `permissoes:migrar` são do PO — Task 10").

### Task 3: Guardas de sessão por tela

**Files:**
- Modify: `apps/cms/src/lib/cms/autenticacao.ts`
- Create: `apps/cms/src/lib/cms/autenticacao.telas.test.ts`

**Interfaces:**
- Consumes: `acessoDoUsuario`, `temTela`, `TelaPainel`, `AcessoPainel` (Task 1); campos da Task 2.
- Produces:
  - `UsuarioCms` ganha `acesso: AcessoPainel` (o campo `perfil` sai na Task 9).
  - `obterUsuarioCmsComTela(telas: readonly TelaPainel[]): Promise<UsuarioCms | null>`
  - `obterUsuarioAutenticadoComTela(telas: readonly TelaPainel[]): Promise<UsuarioAutenticado | null>`
  - `obterAdministrador(): Promise<UsuarioCms | null>` e `obterAdministradorAutenticado(): Promise<UsuarioAutenticado | null>`
  - `exigirTela(telas: readonly TelaPainel[]): Promise<UsuarioCms>` (sem sessão → `/entrar`; sem tela → `/`)
  - `exigirAdministrador(): Promise<UsuarioCms>` (substitui `exigirSuperAdmin`)
  - As variantes `ComPerfil` e `exigirPerfil` ficam **como estão** (lendo `perfil`) até as Tasks 5–7 trocarem cada chamada pelas variantes `ComTela`; a Task 9 as remove. Nenhuma guarda mistura perfil e tela.

- [ ] **Step 1:** Testes com `payload.auth` mockado (padrão de `acoesCrm.test.ts`): usuário `{administrador:false, telas:["crm.leads"]}` → `obterUsuarioCmsComTela(["crm.leads"])` devolve o usuário; `(["crm.clientes"])` → null; administrador → qualquer tela; sem sessão → null.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS + typecheck.
- [ ] **Step 5: Commit** `feat(painel): guardas de sessao por tela e de administrador`

### Task 4: Access das coleções e globals por tela

**Files:**
- Create: `apps/cms/src/access/porTela.ts`, `apps/cms/src/access/porTela.test.ts`
- Modify: todas as coleções/globals da tabela "Access" acima; `apps/cms/src/collections/Users.ts` (access de coleção e field access)
- Delete (no fim desta task, se não houver mais uso): `access/{atendimentoComercial,editorInstitucional,editorEventos,editorCatalogo}.ts`; `superAdmin.ts`/`superAdminField` viram `administrador`/`administradorField` em `access/porTela.ts`

**Interfaces:**
- Consumes: `acessoDoUsuario`, `temTela`, `TELAS_LEADS` (Task 1).
- Produces: `acessoPorTela(telas: readonly TelaPainel[]): Access`, `administrador: Access`, `administradorField: FieldAccess`, `proprioOuAdministrador: Access` (users: read/update do próprio registro ou administrador — `{ id: { equals: req.user.id } }`).

- [ ] **Step 1:** Testes no padrão de `access/leituraPublica.test.ts`, chamando `Colecao.access.<op>({ req })` com usuários fictícios: secretaria (`TELAS_LEADS` + propostas) → `leads.read/create/update` true, `clientes-crm.create` false, `clientes-crm.read` true, `propostas.update` true, `programas.update` false, `eventos.update` false; só-Clientes → `leads.read` false, `eventos-comerciais.update` true; administrador → `areas.update` true; não administrador → `users` field `administrador.update` false e `telas.update` false; `users.read` de outro usuário → filtro `{ id: { equals: <próprio> } }`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar e trocar os access conforme a tabela (o `create` de `linha-do-tempo` mantém a regra de "só nota", trocando o perfil pela tela). **Step 4:** PASS + typecheck + `vitest` completo do cms (os testes antigos de access, ex. `Leads.access.test.ts`, passam a usar telas).
- [ ] **Step 5: Commit** `feat(cms): access das colecoes por tela`

### Task 5: Server Actions do CRM por tela (+ rota do documento)

**Files:**
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`, `apps/cms/src/app/(painel)/crm/propostas/[id]/documento/route.ts`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.test.ts`

**Interfaces:**
- Consumes: `obterUsuarioCmsComTela`, `obterUsuarioAutenticadoComTela` (Task 3); `TELAS_LEADS` (Task 1).
- Produces: cada action do CRM exige as telas da tabela "Server Actions" acima; a rota do documento usa `obterUsuarioCmsComTela(["crm.propostas"])` (401 sem a tela).

- [ ] **Step 1:** No `acoesCrm.test.ts`, trocar o mock de autenticação para as variantes `ComTela` (mesmo padrão atual: implementadas sobre os mocks de sessão com o `temTela` real) e acrescentar: secretaria → `moverLeadCrm` ok, `salvarPropostaCrm` ok, `salvarClienteCrm`/`apagarClienteCrm` recusados com a mensagem padrão sem tocar a Local API; `salvarLeadCrm` com cliente novo → ok (§3.7); `vincularClienteCrm` → ok; só-Clientes → `carregarLeadCrm` null, `marcarEventoRealizadoCrm` ok, `agendarEventoCrm` recusado.
- [ ] **Step 2:** FAIL. **Step 3:** trocar as guardas. **Step 4:** PASS + typecheck.
- [ ] **Step 5: Commit** `feat(crm): actions e rota do documento conferem a tela`

### Task 6: Actions do catálogo e do módulo Site por tela

**Files:**
- Modify: `apps/cms/src/app/(painel)/acoesCatalogo.ts`, `apps/cms/src/app/(painel)/acoes.ts`, `apps/cms/src/lib/cms/painelCmsUsuarios.ts` só onde `acoes.ts` decide quem é administrador (a lógica de usuários é da Task 8)
- Modify: `apps/cms/src/app/(painel)/acoesCatalogo.test.ts`, `acoes.evento.test.ts`, `acoes.palestrante.test.ts`, `acoes.conteudos.test.ts`, `acoes.contatos.test.ts`

**Interfaces:**
- Consumes: Task 3; `capacidadesDoAcesso(...).editarCardCorpoDocente` (Task 1).
- Produces: guardas da tabela; `barrarNaoEditorial` vira `barrarSemTela(telas: readonly TelaPainel[])` com o mesmo retorno; `salvarPalestrante` recusa (mensagem padrão) quando os dados trazem o bloco Corpo Docente e o usuário não tem `site.corpo-docente`; as actions de usuários/passkeys de terceiros usam `obterAdministrador()`.

- [ ] **Step 1:** Testes: só `site.eventos` → `salvarEvento` ok, `salvarPalestrante` recusado; só `site.palestrantes` → `salvarPalestrante` sem bloco ok, com bloco recusado; `crm.modulos` sem `crm.programas` → `salvarModuloCatalogoCrm` ok, `salvarProgramaCatalogoCrm` recusado; `site.contatos` → `salvarContatos` ok, `salvarConteudo` recusado.
- [ ] **Step 2:** FAIL. **Step 3:** trocar as guardas. **Step 4:** PASS + typecheck.
- [ ] **Step 5: Commit** `feat(painel): actions do catalogo e do modulo Site conferem a tela`

### Task 7: Páginas, menus, destino depois do login e dados por tela

**Files:**
- Modify: `apps/cms/src/app/(painel)/page.tsx`, `ShellCms.tsx`, `crm/page.tsx`, `crm/ShellCrm.tsx`, `shell/ShellPainel.tsx` (seletor de módulo), `crm/DetalheCliente.tsx`, `TelaConfiguracoes.tsx` (seção Contatos só com `site.contatos`), `entrar` (destino depois do login)
- Create: `apps/cms/src/lib/cms/navegacao.ts`, `apps/cms/src/lib/cms/navegacao.test.ts`

**Interfaces:**
- Consumes: Tasks 1 e 3.
- Produces:
  - `destinoDepoisDoLogin(acesso: AcessoPainel): "/" | "/crm"` — `"/crm"` se não houver nenhuma tela `site.*` e houver alguma `crm.*`; senão `"/"`.
  - `telaInicialSite(acesso): TelaIdSite` — primeira tela `site.*` marcada na ordem do menu; sem nenhuma → `"config"` (Minha conta).
  - `telaInicialCrm(acesso): TelaCrmId` — primeira `crm.*` marcada.
  - Seletor de módulo: **Site sempre aparece** (é onde fica Minha conta); CRM aparece se `telasDoModulo(acesso,"crm").length > 0`. (Ajuste do plano à spec §5: sem isso, quem só tem telas do CRM não alcança Minha conta.)
  - `crm/page.tsx`: entra com `exigirUsuarioCms()` + redireciona a `/` se não houver tela `crm.*`; carrega **só** os conjuntos permitidos: leads ← `TELAS_LEADS`; clientes completos ← `crm.clientes`; lista mínima `{id, orgao, sigla}` de clientes ← `TELAS_LEADS` ou `crm.propostas` (apoio, §3.3); propostas ← `crm.propostas`; envios ← `crm.envios`; programas/módulos/áreas ← `crm.programas`/`crm.modulos`; catálogo do wizard ← `crm.propostas` ou `TELAS_LEADS`; produtos ← `crm.produtos`; usuários (responsáveis) ← `TELAS_LEADS`.
  - `page.tsx` (Site): eventos ← `site.eventos` ou `site.home` ou `site.painel`; palestrantes ← `site.palestrantes`, `site.eventos`, `site.corpo-docente` ou `site.painel`; conteúdos ← `site.conteudos` ou `site.painel`; resumo de leads ← `site.painel`.
  - `DetalheCliente`: sem `verLeads`, a lista de negócios mostra só nome do contato e estágio e não abre o `ModalLead` (§3.8); a leitura `obterClienteCrm` devolve os negócios nessa forma mínima quando o chamador não tem `TELAS_LEADS` (parâmetro `{ negociosMinimos: boolean }`).
- [ ] **Step 1:** Testes de `navegacao.ts`: acesso vazio → `destinoDepoisDoLogin` = `"/"` e `telaInicialSite` = `"config"`; secretaria → `"/crm"` e `telaInicialCrm` = `"painel"`; administrador → `"/"` e `"dashboard"`. Teste de `obterClienteCrm(id, { negociosMinimos: true })` (mock do payload): negócios sem `email`, `telefone`, `mensagem`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS; typecheck; `pnpm build`.
- [ ] **Step 5: Commit** `feat(painel): menus, destino e dados de cada pagina conforme as telas`

### Task 8: Tela Usuários com Administrador e telas

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCmsUsuarios.ts`, `painelCmsUsuarios.test.ts`, `apps/cms/src/app/(painel)/TelaUsuarios.tsx`, `acoes.ts` (assinaturas de criar/editar usuário)

**Interfaces:**
- Consumes: Tasks 1, 3, 6.
- Produces:
  - `criarUsuario(p, dados: { nome: string; email: string; administrador: boolean; telas: TelaPainel[] })`, `editarUsuario(p, id, dados: { nome: string; administrador: boolean; telas: TelaPainel[] }, autorId: string)`, `removerUsuario(p, id, autorId)` — recusas com mensagens próprias: `"Não é possível remover o último administrador."`, `"Você não pode tirar o seu próprio acesso de administrador."`, `"Você não pode remover a si mesmo."` (esta já existe). Telas desconhecidas são descartadas (via `acessoDoUsuario`).
  - `UsuarioGestaoResumo` troca `perfil` por `administrador: boolean; telas: TelaPainel[]`.
  - Formulário: caixinha "Administrador (acesso total)" + caixinhas das 15 telas agrupadas por módulo (Site · CRM), na ordem de `TELAS`; com Administrador marcado, as caixinhas aparecem marcadas e desabilitadas. A lista mostra "Administrador" ou "N telas".
- [ ] **Step 1:** Testes: editar a si mesmo com `administrador: false` → recusa; remover/desmarcar o único administrador → recusa; dois administradores → desmarcar um funciona; criar com telas `["crm.leads","x"]` grava só `["crm.leads"]`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS + typecheck.
- [ ] **Step 5: Commit** `feat(painel): tela Usuarios marca administrador e telas por pessoa`

### Task 9: Remover os perfis fixos do código

**Files:**
- Modify: `apps/cms/src/lib/cms/perfis.ts` (fica só a reexportação ou é apagado, com imports trocados para `telas.ts`), `autenticacao.ts` (remove `ComPerfil`, `exigirPerfil`, `exigirSuperAdmin`, `UsuarioCms.perfil`), `telas.ts` (remove `acessoDoPerfilLegado`; `planejarMigracao` passa a ter o mapeamento próprio no script da Task 2), `shared/user-shape.ts`, `shared/types.ts` (`PERFIL_ADMIN`), testes que ainda citam perfil, `ShellPainel.tsx` (rótulo do perfil no rodapé da sidebar vira "Administrador" ou "Equipe")
- Modify: `CLAUDE.md` (entrada de histórico v3.8 e §19)

**Interfaces:** nenhuma nova; `grep -rn "perfil" apps/cms/src --include=*.ts --include=*.tsx | grep -v "seed/\|__fixtures__\|perfil-"` deve ficar só no campo `perfil` de `Users.ts` (oculto, para a etapa 2) e no script de migração.
- [ ] **Step 1:** Rodar o grep acima e remover os usos. **Step 2:** typecheck, lint, test, `pnpm build` verdes.
- [ ] **Step 3: Commit** `refactor(painel): remove os perfis fixos em favor das telas`

### Task 10: Verificação de ponta a ponta (depende do PO)

Sem código novo. Ordem obrigatória, cada passo **do PO** salvo onde dito:
1. PO roda `pnpm --filter @ntc/cms payload:push:schema` a partir da branch — o diff deve ser **exatamente** o da Task 2 Step 5.
2. PO roda `pnpm --filter @ntc/cms permissoes:migrar` (dry-run), confere que a conta dele vira administradora, e roda com `PERMISSOES_MIGRAR_APLICAR=1`.
3. Agente confere por SQL só de leitura: `users.administrador = true` na conta do PO; `users_telas` com RLS; 0 grants para `anon`.
4. Com **autorização explícita do PO para criar contas temporárias**, agente cria (e apaga no fim) três contas: secretaria (`crm.dashboard`, `crm.leads`, `crm.propostas`), só-Clientes (`crm.clientes`), só-Eventos (`site.eventos`). Roteiro no navegador automatizado, sem acionar escrita real exceto onde indicado: menus e seletor de módulo de cada uma; destino depois do login; HTML de `/` e `/crm` sem e-mails/nomes de leads para quem não tem `TELAS_LEADS`; actions de outra tela recusadas com a mensagem padrão (sem versão nova no banco); REST com `Authorization: JWT` respeitando a tabela de access; tela Usuários: travas de último administrador e de desmarcar a si mesmo (com uma conta administradora temporária).
5. Deploy do código pelo PO (`git push origin main` depois do merge).

### Task 11: Etapa 2 da migração (depois do deploy, em outra sessão)

**Files:** Modify `apps/cms/src/collections/Users.ts` (remove o campo `perfil`), `seed/migrarPermissoesPorTela.ts` (remove), `packages/types` (generate).
- [ ] Diff só de leitura: esperado `ALTER TABLE "users" DROP COLUMN "perfil"` e `DROP TYPE "enum_users_perfil"` — e nada mais. PO roda o push respondendo ao prompt de perda de dados **só** para esses dois itens.
- [ ] Commit `chore(cms): remove o campo perfil de users (etapa 2)`.
