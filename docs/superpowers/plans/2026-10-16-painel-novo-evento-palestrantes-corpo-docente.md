# Novo evento, palestrantes e Corpo Docente no Painel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Habilitar "Novo evento" (em branco) e "Novo palestrante", tornar o palestrante editável e gerir os cards da página Corpo Docente pelo painel do módulo Site.

**Architecture:** Mesma arquitetura do painel: leitura em `lib/cms/painelCms.ts`, escrita em `lib/cms/painelCmsEscrita.ts` (Local API, `overrideAccess: true`), Server Actions com guarda de perfil em `app/(painel)/acoes.ts`, telas client em `app/(painel)/`. As regras de cards do Global `corpo-docente` e do slug provisório do evento ficam em módulos puros com testes. Palestrante e cards gravam **publicado** (decisão do PO). O evento continua com rascunho e Publicar.

**Tech Stack:** Next.js 15 App Router, Payload 3.18 (Local API, adapter Postgres), TypeScript strict, Vitest (env `node`), `slugify` (já é dependência do cms).

**Spec:** `docs/superpowers/specs/2026-10-16-painel-novo-evento-palestrantes-corpo-docente-design.md`

## Global Constraints

- Sem dependência nova. Sem mudança de schema: `pnpm --filter @ntc/cms payload:generate` tem que terminar **sem diff** em `packages/types/src/payload-types.ts`. **Nunca rodar `payload:push:schema`.**
- Toda Server Action valida a sessão **e** o perfil antes de tocar a Local API. Palestrante e Corpo Docente usam `PERFIS_INSTITUCIONAL`, e evento usa `PERFIS_EVENTOS` (`lib/cms/perfis.ts`).
- Palestrante e Global `corpo-docente`: gravar com `_status: "published"` (sem `draft: true`). Evento: criar e salvar com `draft: true`.
- Nenhum texto institucional inventado (CLAUDE.md §5.3). Só rótulos, dicas e mensagens de interface.
- Reaproveitar classes `pcms-*` e padrões existentes (`DetalheConteudo` para formulário com Markdown e upload, `TelaHome` para setas ↑/↓, `AvisoForm`). Nenhum componente de design system novo em `packages/ui`.
- Confirmação destrutiva em dois cliques, sem `window.confirm`.
- Labels associados a inputs, foco visível (WCAG AA, CLAUDE.md §10).
- Commits em português, Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- **Antes de qualquer `pnpm build`, parar o dev server** (o `.next` é compartilhado e o build corrompe o dev).
- Rodar testes de um arquivo com `pnpm --filter @ntc/cms exec vitest run <caminho relativo a apps/cms>` (o `pnpm` engole flags sem `exec`).

## Review Focus

1. **Dois palestrantes com o mesmo nome** (o `slug` é `unique`): esperar a mensagem "Já existe um palestrante com este nome…", com nada gravado, nem card órfão no Global. *Teste na Task 4.*
2. **Global `corpo-docente` recusa a gravação** (validação do Global inteiro, ou remover o último card com `minRows: 1`): esperar que o palestrante **não** fique gravado pela metade (transação revertida) e uma mensagem que diga que o problema está na página Corpo Docente. *Teste na Task 4.*
3. **"Salvar ordem" com lista desatualizada** (um card foi incluído ou removido em outra aba depois que a tela abriu): esperar recusa com "A lista do Corpo Docente mudou, recarregue a tela", sem apagar nem duplicar card. *Teste na Task 2 (`reordenarCards`) e na Task 6.*
4. **Editar um palestrante sem tocar no currículo**: esperar que o `curriculoCurto`/`curriculoCompleto` importados **não** sejam reenviados (Lexical preservado). *Teste na Task 4.*
5. **"Novo evento" duas vezes seguidas e renomear depois**: esperar dois eventos distintos sem erro de unicidade. O slug provisório vira o slug do nome no primeiro salvar com nome real, e evento com slug definitivo não muda de slug sozinho. *Teste na Task 3.*

---

### Task 1: Verificar se o Global `corpo-docente` aceita ser publicado

Gate do spec §5.5. **Se falhar, PARAR e relatar ao coordenador a lista de erros. Não seguir para as próximas tasks.**

**Files:**
- Create: `apps/cms/src/seed/verificarPublicacaoCorpoDocente.ts`
- Modify: `apps/cms/package.json` (script `corpo-docente:verificar`)

**Interfaces:**
- Produces: nada consumido em código, só o resultado da verificação (OK, ou a lista de erros).

- [ ] **Step 1: Escrever o script** no padrão dos scripts de `src/seed/` (rodados com `pnpm payload run`). Ele:
  1. obtém o Payload, cria `req` com `createLocalReq({}, payload)` e `initTransaction(req)`;
  2. lê `payload.findGlobal({ slug: "corpo-docente", depth: 0, draft: true, req })`;
  3. chama `payload.updateGlobal({ slug: "corpo-docente", data: { cards: <os mesmos cards lidos>, _status: "published" }, depth: 0, overrideAccess: true, req })`, **exatamente a chamada que a Task 4 vai usar**;
  4. relê com `findGlobal(..., draft: false, req)` e compara `hero`, `quicklinks` e a contagem de `cards` com o lido no passo 2, para provar que mandar só `{ cards, _status }` não apaga o resto;
  5. **sempre** `killTransaction(req)` no `finally` (nada fica gravado);
  6. imprime `OK — publicável, demais campos preservados` ou o erro (`ValidationError` do Payload lista os campos) e sai com código 1.
- [ ] **Step 2: Adicionar o script** `"corpo-docente:verificar": "pnpm payload run src/seed/verificarPublicacaoCorpoDocente.ts"`.
- [ ] **Step 3: Rodar contra o banco real** com `pnpm --filter @ntc/cms corpo-docente:verificar`. Esperado: `OK — publicável, demais campos preservados`. Conferir depois por `psql` (`begin read only; select _status, updated_at from corpo_docente; commit;`) que a linha segue `draft | 2026-06-01 14:21:51…`, ou seja, que nada foi gravado. **Nunca** usar `set default_transaction_read_only` (vaza pelo pooler).
- [ ] **Step 4: Se o passo 3 falhar, parar** e relatar o erro. Se passar, fazer o commit:

```bash
git add apps/cms/src/seed/verificarPublicacaoCorpoDocente.ts apps/cms/package.json
git commit -m "chore(cms): script que verifica se o Global corpo-docente aceita publicação"
```

---

### Task 2: Regras puras dos cards do Corpo Docente

**Files:**
- Create: `apps/cms/src/lib/cms/cardsCorpoDocente.ts`
- Test: `apps/cms/src/lib/cms/cardsCorpoDocente.test.ts`

**Interfaces:**
- Produces:
  ```ts
  import type { CorpoDocente } from "@ntc/types";
  export type CardGlobal = NonNullable<CorpoDocente["cards"]>[number];
  export type FormatoCard = "featured" | "expert";
  export interface TextosCard {
    tag: string; axisBadge: string; credencialCard: string;
    metaAtuacao: string; metaEixos: string;                       // só featured
    programasTexto: string; programasStrong: string; sufixoPrograma: string; // só expert
    ctaHref: string; ctaRotulo: string;
  }
  export interface CardDesejado { formato: FormatoCard; textos: TextosCard }
  export const TEXTOS_CARD_VAZIOS: TextosCard;
  export function idEspecialistaDoCard(card: CardGlobal): string | null; // aceita number ou objeto populado
  export function cardDoEspecialista(cards: CardGlobal[], especialistaId: string): CardDesejado | null;
  export function aplicarCardDe(cards: CardGlobal[], especialistaId: string, desejo: CardDesejado | null): CardGlobal[];
  export class ListaDesatualizadaError extends Error {}
  export function reordenarCards(cards: CardGlobal[], idsNaOrdem: string[]): CardGlobal[];
  ```

- [ ] **Step 1: Escrever os testes que falham** (`cardsCorpoDocente.test.ts`). Usar cards de fixture com `especialista` como `number` e um `axis` sem especialista no meio. Casos:
  - `cardDoEspecialista` devolve `{ formato, textos }` com `""` no lugar de `null`/`undefined`, e `null` quando o especialista não tem card.
  - `aplicarCardDe(cards, "9", desejo)` sem card existente **acrescenta no fim**, com `especialista: 9` (number) e `formato` do desejo.
  - Com card existente: troca `formato` e textos **na mesma posição**, preserva o `id` do item.
  - `featured` grava `programasTexto`/`programasStrong`/`sufixoPrograma` como `null`, e `expert` grava `metaAtuacao`/`metaEixos` como `null`. Texto `""` vira `null`.
  - `aplicarCardDe(cards, "9", null)` remove o card dele e mantém o resto na ordem. Para especialista sem card, devolve o array igual (`toEqual`).
  - Card `axis` nunca é tocado nem movido por `aplicarCardDe`.
  - Card com `especialista` populado (objeto `{ id: 9, … }`) é reconhecido por `idEspecialistaDoCard` e **gravado de volta como `9`**: todos os itens de pessoa no array devolvido têm `especialista` numérico.
  - `reordenarCards(cards, ["12","9","4"])` devolve os cards de pessoa nessa ordem, com os `axis` **nas mesmas posições absolutas**.
  - `reordenarCards` com id faltando, sobrando ou repetido lança `ListaDesatualizadaError` (Review Focus 3).
- [ ] **Step 2: Rodar e ver falhar:** `pnpm --filter @ntc/cms exec vitest run src/lib/cms/cardsCorpoDocente.test.ts`. Esperado: FAIL (módulo inexistente).
- [ ] **Step 3: Implementar** `cardsCorpoDocente.ts` com as assinaturas acima. Puro, sem `server-only` nem Payload.
- [ ] **Step 4: Rodar e ver passar** (mesmo comando). Esperado: PASS.
- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/cardsCorpoDocente.ts apps/cms/src/lib/cms/cardsCorpoDocente.test.ts
git commit -m "feat(cms): regras puras dos cards do Corpo Docente"
```

---

### Task 3: Novo evento em branco + endereço (slug) no formulário do evento

**Files:**
- Create: `apps/cms/src/lib/cms/slugEvento.ts`, `apps/cms/src/lib/cms/slugEvento.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts` (`CamposEventoCompletos`, `salvarCamposEvento`, nova `criarEventoEmBrancoCms`)
- Modify: `apps/cms/src/lib/cms/painelCms.ts` (`EventoCmsDetalhe.slug`, preencher em `obterEventoCms`)
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (nova action `criarEventoEmBranco`)
- Modify: `apps/cms/src/app/(painel)/TelaEventos.tsx` (habilitar botão, prop `onNovo`), `ShellCms.tsx` (passar `onNovo`), `DetalheEvento.tsx` (campo "Endereço (slug)")
- Test: `apps/cms/src/lib/cms/painelCmsEscrita.evento.test.ts` (novo), `apps/cms/src/app/(painel)/acoes.evento.test.ts` (novo)

**Interfaces:**
- Produces:
  ```ts
  // slugEvento.ts
  export const PREFIXO_SLUG_PROVISORIO = "novo-evento-";
  export const NOME_EVENTO_EM_BRANCO = "Novo evento";
  export function slugProvisorio(agora?: Date): string;          // "novo-evento-" + Date.now().toString(36)
  export function ehSlugProvisorio(slug: string): boolean;
  export function slugParaSalvar(p: { slugDigitado: string; slugAtual: string; nome: string }): string;
  // painelCmsEscrita.ts
  export async function criarEventoEmBrancoCms(): Promise<ResultadoEscrita & { id?: string }>;
  // CamposEventoCompletos ganha: slug: string
  // acoes.ts
  export async function criarEventoEmBranco(): Promise<ResultadoEscrita & { id?: string }>;
  // EventoCmsDetalhe ganha: slug: string
  ```

- [ ] **Step 1: Testes que falham de `slugParaSalvar`** (`slugEvento.test.ts`):
  - provisório + digitado igual ao atual + nome "Seminário de Gestão Escolar" → `"seminario-de-gestao-escolar"`;
  - provisório + nome ainda "Novo evento" → mantém o provisório;
  - slug definitivo (`"seminario-x"`) + digitado igual + nome mudou → mantém `"seminario-x"` (Review Focus 5);
  - digitado diferente do atual (`"Meu Evento SP"`) → `"meu-evento-sp"` (slugify `lower`, `strict`, `locale: "pt"`, igual ao `autoSlug`);
  - digitado vazio → mesma regra de "igual ao atual".
  - Para `slugProvisorio`: duas chamadas com `Date` diferentes dão valores diferentes, ambos com `ehSlugProvisorio` true.
- [ ] **Step 2: Rodar e ver falhar:** `pnpm --filter @ntc/cms exec vitest run src/lib/cms/slugEvento.test.ts`.
- [ ] **Step 3: Implementar `slugEvento.ts`.**
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Testes que falham da escrita** (`painelCmsEscrita.evento.test.ts`, mock de `@/lib/payloadClient` como em `painelCmsEscrita.conteudos.test.ts`):
  - `criarEventoEmBrancoCms()` chama `create` com `collection: "eventos"`, `draft: true`, `data.nome === "Novo evento"`, `ehSlugProvisorio(data.slug)`, e devolve `{ ok: true, id: "<id>" }`;
  - erro de `duplicate key` em `salvarCamposEvento` vira `"Já existe um evento com este endereço (slug)."`;
  - `salvarCamposEvento` envia `data.slug` = `slugParaSalvar(...)`. Para isso precisa do slug atual: ler com `findByID({ collection: "eventos", id, draft: true, depth: 0 })` antes do update (adicionar `findByID` ao mock).
- [ ] **Step 6: Implementar** `criarEventoEmBrancoCms` e o slug em `salvarCamposEvento` (campo novo `slug` em `CamposEventoCompletos`; tradução do erro de unicidade no `catch`).
- [ ] **Step 7: Teste do gate da action** (`acoes.evento.test.ts`, padrão de `acoes.conteudos.test.ts`): sem sessão, ou com perfil `atendimento-comercial`, `criarEventoEmBranco()` devolve `ok: false` sem chamar `create`. Com `editor-eventos`, chama. Implementar a action com `obterUsuarioCmsComPerfil(PERFIS_EVENTOS)` e `revalidatePath("/")` no sucesso.
- [ ] **Step 8: Rodar os dois arquivos de teste e ver passar.**
- [ ] **Step 9: UI.** Em `TelaEventos.tsx`, o botão "Novo evento" perde `disabled`/`title`, ganha `onClick={onNovo}` e fica desabilitado só enquanto cria. Em `ShellCms.tsx`, `onNovo` chama `criarEventoEmBranco()`, depois `router.refresh()` e `abrirEvento(id, true)`, e mostra o erro se falhar. Em `obterEventoCms`, preencher `slug`. Em `DetalheEvento.tsx`, `camposDe` inclui `slug`, e o editor ganha, logo abaixo do nome, o campo `id="ed-slug"` "Endereço (slug)", com a dica: provisório → "será gerado a partir do nome ao salvar"; publicado → "mudar o endereço muda a URL pública do evento".
- [ ] **Step 10: Typecheck** com `pnpm --filter @ntc/cms typecheck`. Esperado: sem erros.
- [ ] **Step 11: Commit**

```bash
git add apps/cms/src/lib/cms/slugEvento.ts apps/cms/src/lib/cms/slugEvento.test.ts apps/cms/src/lib/cms/painelCmsEscrita.ts apps/cms/src/lib/cms/painelCmsEscrita.evento.test.ts apps/cms/src/lib/cms/painelCms.ts "apps/cms/src/app/(painel)/acoes.ts" "apps/cms/src/app/(painel)/acoes.evento.test.ts" "apps/cms/src/app/(painel)/TelaEventos.tsx" "apps/cms/src/app/(painel)/ShellCms.tsx" "apps/cms/src/app/(painel)/DetalheEvento.tsx"
git commit -m "feat(painel): habilita Novo evento e o campo de endereço do evento"
```

---

### Task 4: Leitura e escrita do palestrante (com o card do Corpo Docente)

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCms.ts` (`PalestranteCmsDetalhe` ganha `editavel` e afins, `obterPalestranteCms`, nova `listarOpcoesPalestranteCms`)
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts` (novas `salvarPalestranteCms`, `lerCardsCorpoDocente`, `gravarCardsCorpoDocente`, `ErroCorpoDocente`)
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (novas `salvarPalestrante`, `carregarOpcoesPalestrante`)
- Test: `apps/cms/src/lib/cms/painelCmsEscrita.palestrante.test.ts`, `apps/cms/src/app/(painel)/acoes.palestrante.test.ts`

**Interfaces:**
- Consumes: Task 2 (`CardDesejado`, `cardDoEspecialista`, `aplicarCardDe`, `CardGlobal`); `executarEmTransacao` (`lib/crm/transacao.ts`); `markdownParaLexical`/`lexicalParaMarkdown`/`idaEVoltaPreserva` (`lib/markdownLexical.ts`).
- Produces:
  ```ts
  // painelCmsEscrita.ts
  export interface CamposPalestrante {
    nome: string; titulacao: string; instituicao: string; cargoAtual: string;
    /** undefined = não mudou (não reenviar). Obrigatório e não vazio na criação. */
    curriculoCurtoMarkdown?: string;
    curriculoCompletoMarkdown?: string;
    linkLattes: string; linkLinkedin: string;
    vertical: string; tipo: string; frente: string; formacao: string;
    atuacao: string[]; linhasAtuacaoIds: string[]; programasIds: string[];
    ocultarDoSite: boolean;
    /** null = não aparece no Corpo Docente. */
    corpoDocente: CardDesejado | null;
  }
  export class ErroCorpoDocente extends Error {}
  export async function lerCardsCorpoDocente(payload: Payload, req?: PayloadRequest): Promise<CardGlobal[]>;
  export async function gravarCardsCorpoDocente(payload: Payload, req: PayloadRequest, cards: CardGlobal[]): Promise<void>; // lança ErroCorpoDocente
  export async function salvarPalestranteCms(
    usuario: UsuarioAutenticado, id: string | null, campos: CamposPalestrante,
    foto: { arquivo: File; alt: string } | null,
  ): Promise<ResultadoEscrita & { id?: string }>;
  // painelCms.ts
  export interface PalestranteCmsDetalhe { /* campos atuais */ editavel: CamposPalestrante; curriculoCurtoComPerda: boolean; curriculoCompletoComPerda: boolean; slug: string; }
  export async function listarOpcoesPalestranteCms(): Promise<{ areas: { id: string; nome: string }[]; programas: { id: string; sigla: string }[] }>;
  // acoes.ts
  export async function salvarPalestrante(formData: FormData): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }>;
  export async function carregarOpcoesPalestrante(): Promise<{ areas: { id: string; nome: string }[]; programas: { id: string; sigla: string }[] }>;
  ```
  `salvarPalestrante` lê do `FormData` as chaves `id` (`""` = novo), `campos` (JSON de `CamposPalestrante`), `foto` (File, opcional) e `fotoAlt`.

- [ ] **Step 1: Testes que falham da escrita** (`painelCmsEscrita.palestrante.test.ts`). Mockar `@/lib/payloadClient` e `payload`/`executarEmTransacao` para rodar `fn(req)` direto, registrando commit e rollback. Casos:
  - **validação antes de qualquer escrita:** nome, titulação ou instituição vazios → `ok: false` com mensagem do campo. Na criação: sem foto → `"Envie a foto do palestrante."`; `curriculoCurtoMarkdown` ausente ou vazio → `"Informe o currículo curto."`. Na atualização, `curriculoCurtoMarkdown: ""` → mesmo erro. Foto com `type` fora de `image/*` → `"A foto precisa ser uma imagem."`. Nenhum `create`/`update` chamado.
  - **criação:** cria `media` (alt = `fotoAlt` ou o nome), depois `create({ collection: "especialistas", data: { …, foto: mediaId, _status: "published" } })` **sem** `draft: true`, com `curriculoCurto` = `markdownParaLexical(...)`. Strings vazias viram `null`, ids viram `number`.
  - **atualização sem currículo** (`curriculoCurtoMarkdown` e `curriculoCompletoMarkdown` `undefined`): o `data` do `update` **não tem** as chaves `curriculoCurto`/`curriculoCompleto` (Review Focus 4).
  - **card:** com `corpoDocente` definido, chama `updateGlobal` com `{ cards: aplicarCardDe(lidos, id, desejo), _status: "published" }` e o mesmo `req`. Com `corpoDocente: null` e sem card existente, **não** chama `updateGlobal`.
  - **Global recusa** (`updateGlobal` rejeita): resultado `ok: false`, erro começando com `"Não foi possível atualizar o Corpo Docente"` e terminando com `"— o problema está nos dados da página Corpo Docente, não neste palestrante."`. A transação foi revertida, e o `update` do especialista estava dentro dela (mesmo `req`) (Review Focus 2).
  - **último card:** tirar do Corpo Docente o único card de pessoa → `"O Corpo Docente precisa de ao menos um nome — inclua outro antes de tirar este."`, checado antes de qualquer escrita.
  - **slug duplicado** (`create` rejeita com `duplicate key`): `"Já existe um palestrante com este nome. Diferencie o nome (ex.: inclua o sobrenome)."` (Review Focus 1).
- [ ] **Step 2: Rodar e ver falhar:** `pnpm --filter @ntc/cms exec vitest run src/lib/cms/painelCmsEscrita.palestrante.test.ts`.
- [ ] **Step 3: Implementar.**
  - `lerCardsCorpoDocente` usa `findGlobal({ slug: "corpo-docente", depth: 0, draft: true, req })`.
  - `gravarCardsCorpoDocente` usa `updateGlobal({ slug: "corpo-docente", data: { cards, _status: "published" }, depth: 0, overrideAccess: true, req })` e embrulha a falha em `ErroCorpoDocente`. É a mesma chamada que a Task 1 provou segura.
  - `salvarPalestranteCms` cria a `media` da foto **antes** da transação. Upload em storage não é transacional, e uma media órfã numa falha é aceitável e já acontece no import de PDF. Depois, dentro de `executarEmTransacao(payload, usuario, req => …)`: grava o especialista e, se a lista de cards mudou (compare com `JSON.stringify`), grava os cards.
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Leitura.** Em `obterPalestranteCms`, preencher `slug` e `editavel` (`curriculo*Markdown` com `lexicalParaMarkdown`, ids como string, `corpoDocente` com `cardDoEspecialista(await lerCardsCorpoDocente(payload), id)`), além de `curriculoCurtoComPerda`/`curriculoCompletoComPerda` com `!idaEVoltaPreserva(doc)`. `listarOpcoesPalestranteCms`: áreas (reusar `listarAreasCms`) e programas (`find` em `programas`, `depth: 0`, `limit: 100`, `sort: "sigla"`, `select: { sigla: true }`).
- [ ] **Step 6: Testes que falham das actions** (`acoes.palestrante.test.ts`):
  - sem sessão, ou com perfil `editor-eventos`, `salvarPalestrante` recusa sem tocar `create`/`update`/`updateGlobal`;
  - `campos` com JSON inválido → `{ ok: false, erro: "Dados do formulário inválidos." }`;
  - com `super-admin`, `id: ""` chama a escrita como criação e devolve o detalhe recarregado.

  A action usa `obterUsuarioAutenticadoComPerfil(PERFIS_INSTITUCIONAL)` (o `executarEmTransacao` precisa do usuário cru) e `revalidatePath("/")` no sucesso. `carregarOpcoesPalestrante` exige sessão.
- [ ] **Step 7: Implementar as actions e rodar os testes** (`pnpm --filter @ntc/cms exec vitest run "src/app/(painel)/acoes.palestrante.test.ts"`). Esperado: PASS.
- [ ] **Step 8: Typecheck e suíte do cms** com `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test`. Esperado: tudo verde.
- [ ] **Step 9: Commit**

```bash
git add apps/cms/src/lib/cms/painelCms.ts apps/cms/src/lib/cms/painelCmsEscrita.ts apps/cms/src/lib/cms/painelCmsEscrita.palestrante.test.ts "apps/cms/src/app/(painel)/acoes.ts" "apps/cms/src/app/(painel)/acoes.palestrante.test.ts"
git commit -m "feat(painel): escrita do palestrante publicada e do card do Corpo Docente"
```

---

### Task 5: Formulário do palestrante (Novo + Editar, com bloco Corpo Docente)

**Files:**
- Create: `apps/cms/src/app/(painel)/FormPalestrante.tsx`
- Modify: `apps/cms/src/app/(painel)/TelaPalestrantes.tsx` (botão habilitado, prop `onNovo`), `DetalhePalestrante.tsx` (botão "Editar" que troca para o formulário; reflete o salvo), `ShellCms.tsx` (estado `criandoPalestrante`, carregar opções, `router.refresh()` ao salvar)
- Modify: `apps/cms/src/app/(painel)/painel.css` só se faltar classe. Preferir as existentes.

**Interfaces:**
- Consumes: Task 4 (`salvarPalestrante`, `carregarOpcoesPalestrante`, `CamposPalestrante`, `PalestranteCmsDetalhe.editavel`, `curriculo*ComPerda`), Task 2 (`TEXTOS_CARD_VAZIOS`, `FormatoCard`), `TITULACAO_DOCENTE`/`VERTICAL_DOCENTE`/`TIPO_DOCENTE`/`FRENTE_DOCENTE`/`FORMACAO_DOCENTE`/`ATUACAO_DOCENTE` (`shared/types.ts`), `BarraFormatacao`/`aplicarNoTextarea`/`atalhoDaTecla`, `AvisoForm`.
- Produces:
  ```ts
  interface FormPalestranteProps {
    palestrante: PalestranteCmsDetalhe | null; // null = novo
    opcoes: { areas: { id: string; nome: string }[]; programas: { id: string; sigla: string }[] };
    onCancelar: () => void;
    onSalvou: (p: PalestranteCmsDetalhe) => void;
  }
  export function FormPalestrante(props: FormPalestranteProps): JSX.Element;
  ```

- [ ] **Step 1: Implementar `FormPalestrante`** com os grupos e campos da tabela do spec §5.2:
  - Foto: input file `accept="image/*"` + campo "Texto alternativo", com pré-visualização da atual e a dica "Proporção 20:23".
  - Currículos: textarea com `BarraFormatacao`, como em `DetalheConteudo`. Guardar o Markdown inicial e enviar `curriculo*Markdown` **só se mudou**. Se `curriculo*ComPerda`, mostrar `AvisoForm` "Salvar este campo remove formatação que o editor não representa".
  - Dicas nos selects `vertical`/`tipo`: "Usado nos filtros do Corpo Docente — vazio cai em Gestão Pública / Consultor". Rótulos legíveis para os valores dos selects; o mapa de rótulos fica no próprio arquivo.
  - Bloco **"Corpo Docente"**: switch `role="switch"` "Aparece no Corpo Docente"; radio Destaque/Card comum; campos de texto por formato (tabela do spec §5.3), com a dica "aceita <strong>" em `metaAtuacao`/`metaEixos`. Desligar um card existente pede confirmação em dois cliques ("Tirar do Corpo Docente? Clique de novo para confirmar"). Se `ocultarDoSite`, mostrar o aviso "Não aparece na página enquanto estiver oculto do site".
  - Validação no cliente dos obrigatórios (nome, titulação, instituição, currículo curto, foto quando novo), com mensagem por campo, antes de enviar. Um botão **"Salvar"** monta o `FormData` (`id`, `campos` JSON, `foto`, `fotoAlt`) e chama `salvarPalestrante`. Erro do servidor no `AvisoForm`.
- [ ] **Step 2: Ligar nas telas.**
  - `TelaPalestrantes`: o botão "Novo palestrante" chama `onNovo`.
  - `ShellCms`: `novoPalestrante()` carrega as opções e abre `FormPalestrante` com `palestrante={null}`. No `onSalvou`, `router.refresh()` e abre o `DetalhePalestrante` do salvo. `irPara` também fecha `criandoPalestrante`.
  - `DetalhePalestrante`: botão "Editar" que carrega as opções (`carregarOpcoesPalestrante`) e troca para o formulário. Ao salvar, volta à leitura com os dados novos. O card do Corpo Docente aparece na leitura (tipo + etiqueta), ou "Não aparece no Corpo Docente".
- [ ] **Step 3: Typecheck e lint** com `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`. Esperado: 0 erros (os 3 warnings pré-existentes do cms são aceitos).
- [ ] **Step 4: Verificação manual com o dev no ar** (`pnpm dev:cms`): criar um palestrante de teste com foto, editá-lo, ligar o Corpo Docente e conferir `/o-grupo/corpo-docente` (web no ar). **Depois, desfazer**: desligar o card e marcar "Ocultar do site" no palestrante de teste. Avisar o coordenador, porque não há exclusão pelo painel.
- [ ] **Step 5: Commit**

```bash
git add "apps/cms/src/app/(painel)/FormPalestrante.tsx" "apps/cms/src/app/(painel)/TelaPalestrantes.tsx" "apps/cms/src/app/(painel)/DetalhePalestrante.tsx" "apps/cms/src/app/(painel)/ShellCms.tsx" "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(painel): formulário de palestrante com o bloco Corpo Docente"
```

---

### Task 6: Tela "Corpo Docente" (ordem dos cards)

**Files:**
- Create: `apps/cms/src/app/(painel)/TelaCorpoDocente.tsx`
- Modify: `apps/cms/src/lib/cms/painelCms.ts` (nova `listarCardsCorpoDocenteCms`), `painelCmsEscrita.ts` (nova `salvarOrdemCorpoDocenteCms`), `app/(painel)/acoes.ts` (novas `carregarCorpoDocente`, `salvarOrdemCorpoDocente`), `ShellCms.tsx` (item de menu e `TelaId` `"corpo-docente"`)
- Test: `apps/cms/src/lib/cms/painelCmsEscrita.palestrante.test.ts` (acrescentar o bloco `salvarOrdemCorpoDocenteCms`)

**Interfaces:**
- Consumes: Task 2 (`reordenarCards`, `ListaDesatualizadaError`, `idEspecialistaDoCard`), Task 4 (`lerCardsCorpoDocente`, `gravarCardsCorpoDocente`, `ErroCorpoDocente`), `executarEmTransacao`.
- Produces:
  ```ts
  export interface CardCorpoDocenteResumo { especialistaId: string; nome: string; fotoUrl: string | null; formato: FormatoCard; ocultarDoSite: boolean; }
  export async function listarCardsCorpoDocenteCms(): Promise<CardCorpoDocenteResumo[]>; // só featured/expert, na ordem do Global
  export async function salvarOrdemCorpoDocenteCms(usuario: UsuarioAutenticado, idsNaOrdem: string[]): Promise<ResultadoEscrita>;
  export async function carregarCorpoDocente(): Promise<CardCorpoDocenteResumo[]>;
  export async function salvarOrdemCorpoDocente(idsNaOrdem: string[]): Promise<{ resultado: ResultadoEscrita; cards: CardCorpoDocenteResumo[] | null }>;
  ```

- [ ] **Step 1: Testes que falham** de `salvarOrdemCorpoDocenteCms`:
  - grava `reordenarCards(lidos, ids)` com `_status: "published"`;
  - lista desatualizada → `{ ok: false, erro: "A lista do Corpo Docente mudou desde que a tela foi aberta — recarregue e tente de novo." }` **sem** `updateGlobal` (Review Focus 3);
  - Global recusa → mesma mensagem de `ErroCorpoDocente` da Task 4.
- [ ] **Step 2: Rodar e ver falhar**, implementar, rodar e ver passar (`pnpm --filter @ntc/cms exec vitest run src/lib/cms/painelCmsEscrita.palestrante.test.ts`).
- [ ] **Step 3: Leitura.** `listarCardsCorpoDocenteCms` lê o Global com `depth: 1`, `draft: true` para popular `especialista` e a foto. Card cujo especialista não resolve é omitido da lista e da ordem enviada, e o servidor recusa por lista desatualizada, o que é seguro. Actions: `carregarCorpoDocente` exige sessão; `salvarOrdemCorpoDocente` exige `obterUsuarioAutenticadoComPerfil(PERFIS_INSTITUCIONAL)` e faz `revalidatePath("/")`.
- [ ] **Step 4: Tela.** `TelaCorpoDocente`, padrão visual e de setas de `TelaHome`: lista numerada com miniatura, nome (botão que abre o palestrante via `onAbrirPalestrante(id)`), selo "Destaque"/"Card comum", selo "Oculto do site" quando for o caso, ↑/↓ (desabilitadas nas pontas, `aria-label` "Subir X"/"Descer X"), "Salvar ordem" (desabilitado sem mudança) e o texto "Para incluir ou tirar alguém, abra o palestrante". Erro e sucesso por `AvisoForm`. No `ShellCms`, item "Corpo Docente" entre Palestrantes e Eventos (ícone linear simples, peso 1.5), crumb "Editorial · Corpo Docente", carregamento sob demanda ao abrir a tela (como `abrirUsuarios`).
- [ ] **Step 5: Typecheck, lint e testes do cms.** Esperado: verdes.
- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/TelaCorpoDocente.tsx" "apps/cms/src/app/(painel)/ShellCms.tsx" "apps/cms/src/app/(painel)/acoes.ts" apps/cms/src/lib/cms/painelCms.ts apps/cms/src/lib/cms/painelCmsEscrita.ts apps/cms/src/lib/cms/painelCmsEscrita.palestrante.test.ts
git commit -m "feat(painel): tela Corpo Docente para ordenar os cards"
```

---

### Task 7: Gates finais e documentação

**Files:**
- Modify: `CLAUDE.md` (histórico v3.6 + §19.1/§19.2/§19.3)

- [ ] **Step 1: Gates com o dev PARADO:** `pnpm lint` (0 erros), `pnpm typecheck` (5/5), `pnpm test` (verde), `pnpm --filter @ntc/cms payload:generate` + `git status` sem diff em `packages/types`, e `pnpm build --force` (2 tasks green). Depois apagar os `.next`.
- [ ] **Step 2: CLAUDE.md.**
  - Entrada **v3.6** no histórico: o que entrega (Novo evento com slug provisório e campo Endereço; palestrante criável e editável, gravando publicado; bloco e tela Corpo Docente), a decisão do PO "salvar já manda para o site", o resultado da Task 1, as contagens de testes e as dívidas: sem exclusão de palestrante, media órfã se a transação falhar, telas sem teste de componente.
  - §19.1 e §19.2: o módulo Site passa a criar evento e palestrante e a gerir o Corpo Docente.
  - §19.3: remover o item 9 ("Criar conteúdo novo…") e acrescentar o roteiro de checkpoint do spec §8 como pendência do PO.
- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: registra Novo evento, gestão de palestrantes e Corpo Docente no painel (v3.6)"
```
