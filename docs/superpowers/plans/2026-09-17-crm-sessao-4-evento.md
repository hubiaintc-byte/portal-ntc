# CRM Kanban — Sessão 4 (Evento comercial) · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O evento comercial entra no fluxo: aba **Ações** do modal do lead (agendar, registrar contrato/empenho, links de inscrição, realizado, cancelar), acervo de eventos e documentos na página do cliente, e as regras de exclusão de lead/cliente do spec §5.6 — tudo em transação, sem `push:schema`.

**Architecture:** Regras puras em `packages/lib/src/crm/` (`eventos.ts`, `exclusao.ts`), helper de transação `executarEmTransacao` em `apps/cms/src/lib/crm/transacao.ts` (usado por toda escrita composta), hooks finos de linha do tempo em `eventos-comerciais` e `documentos-comerciais` (mesmo helper `registrarNaLinhaDoTempo`), hook `beforeDelete` em `clientes-crm`, escrita em `painelCrmEscrita.ts`, Server Actions em `acoesCrm.ts`, telas client com o idiom `pcms-*`.

**Tech Stack:** Next.js 15 App Router · React 19 · Payload CMS 3.18 (postgres) · TypeScript strict · Vitest · pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-09-17-crm-sessao-4-evento-design.md` (adendo) sobre `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` (spec-mãe: §3.4, §3.8, §4.4, §4.5, §5.2, §5.3, §5.5, §5.6).

## Global Constraints

- CLAUDE.md tem precedência (§3 idiom do painel é exceção aceita; §5.4 sem dependência nova; §5.7 sem `any`/`@ts-ignore`/`eslint-disable`; §10 a11y; §12 LGPD).
- **Corrigido em 21/09/2026**: a premissa "sem `push:schema`" estava errada. `required: true` emite `NOT NULL` no adapter drizzle 3.18 (`@payloadcms/drizzle@3.18.0/dist/schema/traverseFields.js:718-719`, confirmado contra o banco), então tirar `required: true` de `eventos-comerciais.lead`/`propostas.lead` só na validação do Payload **não** os torna opcionais no Postgres — `lead_id` continua `NOT NULL` até um `ALTER TABLE ... DROP NOT NULL` manual do PO (ver `CLAUDE.md` §19.3 item 0). Nenhuma coleção/campo novo nesta sessão; ainda assim **não** rodar `payload:push:schema` a partir desta branch sem coordenar com o PO — o `ALTER TABLE` é feito à mão, fora do fluxo de push.
- Toda escrita composta (evento + lead; cliente + linha do tempo; upload + linha do tempo) roda em **uma transação** via `executarEmTransacao(payload, usuario, fn)`; dentro de `fn`, toda chamada da Local API passa `req` (para hooks entrarem na transação e verem `req.user`).
- Server Actions validam a sessão **antes** de qualquer Local API (`obterUsuarioAutenticado` → `RECUSADO`); `revalidatePath("/crm")` no sucesso.
- Pré-requisitos das ações são **avisos** (spec §5.2), nunca bloqueiam o arraste.
- Links: só `http://`/`https://` (`urlValida`). Upload: PDF, imagens, DOCX/XLSX, até 20 MB, gravado em `documentos-comerciais` com `evento` e `descricao`.
- Linha do tempo: um único helper `registrarNaLinhaDoTempo`; decisão do que gravar em funções puras testadas.
- Estilo: classes `pcms-*` no bloco `/* ===== CRM Kanban ===== */` de `apps/cms/src/app/(painel)/painel.css`; variáveis existentes (`--pcms-oxford`, `--pcms-cardeal`, `--pcms-dourado`, `--pcms-pergaminho`, `--pcms-osso`, `--pcms-grafite`, `--pcms-grafite-suave`, `--pcms-linha`, `--pcms-radius`, `--pcms-sombra`, `--pcms-erro`); inputs dentro de `<div className="pcms-field">`; **não existe** `pcms-input`.
- `pnpm lint` (0 erros), `pnpm typecheck`, `pnpm test` verdes ao fim de cada task; `pnpm build` só na última, com o dev parado, e `rm -rf apps/cms/.next apps/web/.next` depois.
- Commits em português, Conventional Commits, sem emoji; subject, linha em branco, trailer `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>` (exatamente esta string — implementers Sonnet tendem a escrever "Claude Sonnet 5"; o controller corrige com `--amend`).
- Branch: `feat/crm-sessao-4-evento` a partir da `main` (`4dc4fe9` ou posterior).

---

## Estrutura de arquivos

- Create `packages/lib/src/crm/eventos.ts` (+ `.test.ts`), `packages/lib/src/crm/exclusao.ts` (+ `.test.ts`); Modify `packages/lib/src/index.ts`.
- Create `apps/cms/src/lib/crm/transacao.ts` (+ `.test.ts`), `apps/cms/src/lib/crm/exclusaoCliente.ts` (+ `.test.ts`); Modify `apps/cms/src/lib/crm/linhaDoTempo.ts` (+ `.test.ts`).
- Modify `apps/cms/src/collections/EventosComerciais.ts`, `DocumentosComerciais.ts`, `ClientesCrm.ts`.
- Modify `apps/cms/src/lib/cms/painelCrm.ts`, `painelCrmEscrita.ts` (+ `painelCrmEscrita.evento.test.ts`, `painelCrmEscrita.lead.test.ts`), `apps/cms/src/app/(painel)/acoesCrm.ts` (+ `.test.ts`).
- Create `apps/cms/src/app/(painel)/crm/AbaAcoes.tsx`, `FormEvento.tsx`, `FormContrato.tsx`, `EditorLinks.tsx`, `EventosDoCliente.tsx`, `UploadDocumento.tsx`; Modify `ModalLead.tsx`, `DetalheCliente.tsx`, `ShellCrm.tsx`, `painel.css`.
- Modify `CLAUDE.md`.

---

### Task 0: Branch

- [ ] `git checkout main && git checkout -b feat/crm-sessao-4-evento`; `pnpm test` baseline verde (52 lib · 168 cms).

---

### Task 1: Regras puras — `eventos.ts` e `exclusao.ts` (`@ntc/lib`)

**Files:** Create `packages/lib/src/crm/eventos.ts`, `eventos.test.ts`, `exclusao.ts`, `exclusao.test.ts`; Modify `packages/lib/src/index.ts`.

**Interfaces (Produces):**
```ts
type AcaoEvento = "agendar" | "registrar-contrato" | "links" | "realizado" | "cancelar";
interface EventoParaAcoes { id: string; status: "agendado" | "realizado" | "cancelado"; dataInicioISO: string; temContrato: boolean; numLinks: number }
interface LeadParaAcoes { perdido: boolean }
function eventoCorrente(eventos: EventoParaAcoes[]): EventoParaAcoes | null   // o mais recente `agendado`; senão o mais recente por dataInicioISO; [] → null
function acoesDeEvento(lead: LeadParaAcoes, corrente: EventoParaAcoes | null): AcaoEvento[]
function estagioDaAcaoEvento(acao: AcaoEvento): EstagioLead | null   // agendar→evento-agendado, registrar-contrato→contrato-recebido, realizado→evento-realizado, links/cancelar→null
function urlValida(url: string): boolean
const TIPOS_CONTRATO: OpcaoLista[]   // contrato·empenho·termo·outro
const MODALIDADES_EVENTO: OpcaoLista[]   // presencial·online·hibrido
function podeApagarCliente(d: { numLeads: number; numEventos: number }): { ok: true } | { ok: false; motivo: string }   // motivo: "Tem N negócio(s) e M evento(s) — apague ou revincule antes."
function exigeConfirmacaoDupla(d: { numEventos: number; numPropostas: number; numEnvios: number }): boolean
function tituloLeadApagado(d: { nome: string; instituicao: string | null; estagio: string }): string   // "Lead apagado · Ana (SME, estava em Em contato)"
```

- [ ] **Step 1: Testes**

```ts
// packages/lib/src/crm/eventos.test.ts
import { describe, expect, it } from "vitest";
import { acoesDeEvento, estagioDaAcaoEvento, eventoCorrente, urlValida, type EventoParaAcoes } from "./eventos";

const ag: EventoParaAcoes = { id: "1", status: "agendado", dataInicioISO: "2026-10-01", temContrato: false, numLinks: 0 };
const re: EventoParaAcoes = { id: "2", status: "realizado", dataInicioISO: "2026-08-01", temContrato: true, numLinks: 2 };

describe("eventoCorrente", () => {
  it("prefere o agendado mais recente", () => {
    expect(eventoCorrente([re, ag, { ...ag, id: "3", dataInicioISO: "2026-09-01" }])?.id).toBe("1");
  });
  it("sem agendado, o mais recente por data", () => {
    expect(eventoCorrente([re, { ...re, id: "4", dataInicioISO: "2026-09-15" }])?.id).toBe("4");
  });
  it("vazio → null", () => expect(eventoCorrente([])).toBeNull());
});

describe("acoesDeEvento", () => {
  it("sem evento: só agendar", () => expect(acoesDeEvento({ perdido: false }, null)).toEqual(["agendar"]));
  it("lead perdido: nada", () => expect(acoesDeEvento({ perdido: true }, null)).toEqual([]));
  it("com evento agendado: contrato, links, realizado, cancelar", () =>
    expect(acoesDeEvento({ perdido: false }, ag)).toEqual(["registrar-contrato", "links", "realizado", "cancelar"]));
  it("evento realizado/cancelado: volta a agendar", () => {
    expect(acoesDeEvento({ perdido: false }, re)).toEqual(["agendar"]);
    expect(acoesDeEvento({ perdido: false }, { ...ag, status: "cancelado" })).toEqual(["agendar"]);
  });
});

describe("estagioDaAcaoEvento", () => {
  it("mapeia as ações que movem o card", () => {
    expect(estagioDaAcaoEvento("agendar")).toBe("evento-agendado");
    expect(estagioDaAcaoEvento("registrar-contrato")).toBe("contrato-recebido");
    expect(estagioDaAcaoEvento("realizado")).toBe("evento-realizado");
    expect(estagioDaAcaoEvento("links")).toBeNull();
    expect(estagioDaAcaoEvento("cancelar")).toBeNull();
  });
});

describe("urlValida", () => {
  it("aceita http(s) e recusa o resto", () => {
    expect(urlValida("https://inscricao.exemplo.com/x?y=1")).toBe(true);
    expect(urlValida("http://a.b")).toBe(true);
    expect(urlValida("javascript:alert(1)")).toBe(false);
    expect(urlValida("inscricao.exemplo.com")).toBe(false);
    expect(urlValida("")).toBe(false);
  });
});
```

```ts
// packages/lib/src/crm/exclusao.test.ts
import { describe, expect, it } from "vitest";
import { exigeConfirmacaoDupla, podeApagarCliente, tituloLeadApagado } from "./exclusao";

describe("podeApagarCliente", () => {
  it("só sem dependentes", () => {
    expect(podeApagarCliente({ numLeads: 0, numEventos: 0 })).toEqual({ ok: true });
    expect(podeApagarCliente({ numLeads: 2, numEventos: 1 })).toEqual({ ok: false, motivo: "Tem 2 negócios e 1 evento — apague ou revincule antes." });
    expect(podeApagarCliente({ numLeads: 1, numEventos: 0 })).toEqual({ ok: false, motivo: "Tem 1 negócio e 0 eventos — apague ou revincule antes." });
  });
});

describe("exigeConfirmacaoDupla", () => {
  it("qualquer dependente exige", () => {
    expect(exigeConfirmacaoDupla({ numEventos: 0, numPropostas: 0, numEnvios: 0 })).toBe(false);
    expect(exigeConfirmacaoDupla({ numEventos: 1, numPropostas: 0, numEnvios: 0 })).toBe(true);
    expect(exigeConfirmacaoDupla({ numEventos: 0, numPropostas: 0, numEnvios: 3 })).toBe(true);
  });
});

describe("tituloLeadApagado", () => {
  it("monta o título com órgão e estágio legíveis", () => {
    expect(tituloLeadApagado({ nome: "Ana", instituicao: "SME", estagio: "em-contato" })).toBe("Lead apagado · Ana (SME, estava em Em contato)");
    expect(tituloLeadApagado({ nome: "Ana", instituicao: null, estagio: "lead" })).toBe("Lead apagado · Ana (estava em Lead)");
  });
});
```

- [ ] **Step 2: RED** — `pnpm --filter @ntc/lib test -- eventos` e `-- exclusao` falham (módulo inexistente).

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/crm/eventos.ts
/** Ações de evento comercial no modal do lead (adendo 2026-09-17 §1). Puras. */
import type { EstagioLead } from "./estagios";
import type { OpcaoLista } from "./listas";

export type AcaoEvento = "agendar" | "registrar-contrato" | "links" | "realizado" | "cancelar";
export type StatusEvento = "agendado" | "realizado" | "cancelado";

export interface EventoParaAcoes { id: string; status: StatusEvento; dataInicioISO: string; temContrato: boolean; numLinks: number }
export interface LeadParaAcoes { perdido: boolean }

export const TIPOS_CONTRATO: OpcaoLista[] = [
  { label: "Contrato", value: "contrato" }, { label: "Empenho", value: "empenho" },
  { label: "Termo", value: "termo" }, { label: "Outro", value: "outro" },
];
export const MODALIDADES_EVENTO: OpcaoLista[] = [
  { label: "Presencial", value: "presencial" }, { label: "Online", value: "online" }, { label: "Híbrido", value: "hibrido" },
];
export const STATUS_EVENTO: OpcaoLista[] = [
  { label: "Agendado", value: "agendado" }, { label: "Realizado", value: "realizado" }, { label: "Cancelado", value: "cancelado" },
];

const maisRecente = (a: EventoParaAcoes, b: EventoParaAcoes) => (a.dataInicioISO >= b.dataInicioISO ? a : b);

export function eventoCorrente(eventos: EventoParaAcoes[]): EventoParaAcoes | null {
  if (eventos.length === 0) return null;
  const agendados = eventos.filter((e) => e.status === "agendado");
  return (agendados.length > 0 ? agendados : eventos).reduce(maisRecente);
}

export function acoesDeEvento(lead: LeadParaAcoes, corrente: EventoParaAcoes | null): AcaoEvento[] {
  if (lead.perdido) return [];
  if (corrente === null || corrente.status !== "agendado") return ["agendar"];
  return ["registrar-contrato", "links", "realizado", "cancelar"];
}

export function estagioDaAcaoEvento(acao: AcaoEvento): EstagioLead | null {
  switch (acao) {
    case "agendar": return "evento-agendado";
    case "registrar-contrato": return "contrato-recebido";
    case "realizado": return "evento-realizado";
    default: return null;
  }
}

export function urlValida(url: string): boolean {
  try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
}
```

```ts
// packages/lib/src/crm/exclusao.ts
/** Regras de exclusão do CRM (spec-mãe §5.6 · adendo §3). Puras. */
import { rotuloDoEstagio } from "./estagios";

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

export function podeApagarCliente(d: { numLeads: number; numEventos: number }): { ok: true } | { ok: false; motivo: string } {
  if (d.numLeads === 0 && d.numEventos === 0) return { ok: true };
  return { ok: false, motivo: `Tem ${plural(d.numLeads, "negócio", "negócios")} e ${plural(d.numEventos, "evento", "eventos")} — apague ou revincule antes.` };
}

export function exigeConfirmacaoDupla(d: { numEventos: number; numPropostas: number; numEnvios: number }): boolean {
  return d.numEventos + d.numPropostas + d.numEnvios > 0;
}

export function tituloLeadApagado(d: { nome: string; instituicao: string | null; estagio: string }): string {
  const orgao = d.instituicao ? `${d.instituicao}, ` : "";
  return `Lead apagado · ${d.nome} (${orgao}estava em ${rotuloDoEstagio(d.estagio)})`;
}
```

`index.ts`: exportar tudo acima (`AcaoEvento`, `StatusEvento`, `EventoParaAcoes`, `LeadParaAcoes`, `TIPOS_CONTRATO`, `MODALIDADES_EVENTO`, `STATUS_EVENTO`, `eventoCorrente`, `acoesDeEvento`, `estagioDaAcaoEvento`, `urlValida`, `podeApagarCliente`, `exigeConfirmacaoDupla`, `tituloLeadApagado`).

- [ ] **Step 4: GREEN** — `pnpm --filter @ntc/lib test` (52 + 13). **Step 5: Commit** `feat(crm): regras puras das ações de evento e da exclusão de lead/cliente`.

---

### Task 2: Coleções, linha do tempo de evento/documento e `beforeDelete` do cliente

**Files:** Modify `apps/cms/src/collections/EventosComerciais.ts`, `DocumentosComerciais.ts`, `ClientesCrm.ts`, `apps/cms/src/lib/crm/linhaDoTempo.ts` (+ test); Create `apps/cms/src/lib/crm/exclusaoCliente.ts` (+ test).

**Interfaces (Produces):**
```ts
// linhaDoTempo.ts (pure + hooks)
function entradasDoEvento(p: { operation: "create" | "update"; doc: EventoComercial; previousDoc?: EventoComercial; usuarioId: number | null }): EntradaLinhaDoTempo[]
function entradasDoDocumento(p: { operation: "create" | "delete"; doc: DocumentoComercial; clienteId: number | null; usuarioId: number | null }): EntradaLinhaDoTempo[]
const registrarEventoNaLinhaDoTempo: CollectionAfterChangeHook<EventoComercial>
const registrarDocumentoNaLinhaDoTempo: CollectionAfterChangeHook<DocumentoComercial>   // create only; delete é registrado pela escrita (Task 3), porque afterDelete não tem cliente à mão
// exclusaoCliente.ts
const bloquearClienteComDependentes: CollectionBeforeDeleteHook   // conta leads (tipo proposta) e eventos do cliente com req; lança Error(motivo) se houver
```

- [ ] **Step 1: Coleções**
  - `EventosComerciais.ts`: `lead` → `required: false` (mantém `index: true`); comentário: "opcional para o lead poder ser apagado sem cascata (spec §5.6)". Hook: `hooks: { afterChange: [registrarEventoNaLinhaDoTempo] }`.
  - `DocumentosComerciais.ts`: `hooks: { afterChange: [registrarDocumentoNaLinhaDoTempo] }`; `delete` continua `authenticated`.
  - `ClientesCrm.ts`: `hooks.beforeDelete: [bloquearClienteComDependentes]` (manter o `beforeChange` existente).

- [ ] **Step 2: Testes de `entradasDoEvento`/`entradasDoDocumento`** (em `linhaDoTempo.test.ts`, mesmo estilo dos de `entradasDoLead`): create → `{ tipo: "evento", titulo: "Evento agendado · <titulo>", clienteId, leadId, referencia: { colecao: "eventos-comerciais", id } }`; update com `contratoEmpenho.numero` passando de vazio para preenchido → "Contrato/empenho registrado · Empenho 2026NE000123" (rótulo do tipo + número; sem número, só o rótulo); update com `linksInscricao.length` mudando → "Links de inscrição atualizados (2)"; status agendado→realizado → "Evento realizado · <titulo>"; agendado→cancelado → "Evento cancelado · <titulo>"; update sem mudança relevante → `[]`; sem `cliente` → `[]`. Documento: create com `evento` → `{ tipo: "documento", titulo: "Documento anexado · <filename>", detalhe: descricao }`; create sem `evento` (PDF de proposta) → `[]`.

- [ ] **Step 3: Teste de `bloquearClienteComDependentes`** (`exclusaoCliente.test.ts`, mock de `req.payload.count` devolvendo `{ totalDocs }`): 0/0 → resolve; 1 lead → rejeita com "Tem 1 negócio e 0 eventos — apague ou revincule antes."; usa `podeApagarCliente`.

- [ ] **Step 4: Implementar** (no `linhaDoTempo.ts` existente, ao lado de `entradasDoLead`; hooks lendo `req.user` como o do lead; `clienteId` do evento via `idRel(doc.cliente)`; para o documento, o `evento` vem populado com `depth: 1`? não — o hook recebe `doc` com `evento` como id: buscar o evento com `req.payload.findByID({ collection: "eventos-comerciais", id, depth: 0, req })` para obter `cliente` e `lead`). `exclusaoCliente.ts`:

```ts
import type { CollectionBeforeDeleteHook } from "payload";
import { podeApagarCliente } from "@ntc/lib";

/** Falha fechado: cliente com leads (tipo proposta) ou eventos não pode ser apagado (spec §5.6). */
export const bloquearClienteComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const [leads, eventos] = await Promise.all([
    req.payload.count({ collection: "leads", where: { and: [{ cliente: { equals: id } }, { tipo: { equals: "proposta" } }] }, req }),
    req.payload.count({ collection: "eventos-comerciais", where: { cliente: { equals: id } }, req }),
  ]);
  const r = podeApagarCliente({ numLeads: leads.totalDocs, numEventos: eventos.totalDocs });
  if (!r.ok) throw new Error(r.motivo);
};
```

- [ ] **Step 5:** `pnpm --filter @ntc/cms payload:generate` (esperado sem diff — `required` não muda o tipo? **muda**: `lead` vira opcional em `EventoComercial`; commitar `payload-types.ts`). `pnpm lint && pnpm typecheck && pnpm test`. **Commit** `feat(crm): linha do tempo de evento e documento, lead opcional no evento e bloqueio de exclusão de cliente com dependentes`.

---

### Task 3: Transação + escrita das ações de evento, documentos e exclusão

**Files:** Create `apps/cms/src/lib/crm/transacao.ts` (+ test); Modify `apps/cms/src/lib/cms/painelCrmEscrita.ts`; Create `apps/cms/src/lib/cms/painelCrmEscrita.evento.test.ts`; Modify `painelCrmEscrita.lead.test.ts`.

**Interfaces (Produces):**
```ts
// transacao.ts
function executarEmTransacao<T>(payload: Payload, usuario: UsuarioAutenticado, fn: (req: PayloadRequest) => Promise<T>): Promise<T>
// painelCrmEscrita.ts — todas Promise<ResultadoEscrita>, todas com `usuario: UsuarioAutenticado`
interface DadosEvento { titulo; dataInicio; dataFim; modalidade; local; moduloCatalogo; observacoes }   // strings
interface DadosContrato { tipo; numero; data; valor }   // strings; arquivo vai por FormData na action
interface DadosLink { rotulo: string; url: string }
agendarEvento(leadId, dados, usuario)                       // cria evento (cliente = lead.cliente; "Lead sem cliente vinculado." se nulo) + move lead → evento-agendado
registrarContratoEmpenho(eventoId, dados, arquivo: File | null, usuario)   // upload (se houver) em documentos-comerciais {evento, descricao: "Contrato/empenho"} + update do grupo + move lead → contrato-recebido
salvarLinksInscricao(eventoId, links: DadosLink[], usuario)  // valida urlValida em todos ("Link inválido: <url>"); não move
marcarEventoRealizado(eventoId, usuario)                     // status realizado + move lead → evento-realizado
cancelarEvento(eventoId, usuario)                            // status cancelado; não move
subirDocumentoEvento(eventoId, arquivo: File, descricao, usuario)   // documentos-comerciais {evento, descricao}; 20 MB; tipos permitidos
removerDocumentoEvento(documentoId, usuario)                 // delete + item "Documento removido · <nome>" na linha do tempo (cliente do evento)
apagarLead(leadId, confirmacaoNome: string, usuario)         // se exigeConfirmacaoDupla → confirmacaoNome deve igualar lead.nome (case-insensitive, trim) senão "Digite o nome do contato para confirmar."; desvincula eventos/propostas/envios-email/linha-do-tempo (lead = null); grava item lead "Lead apagado · …" no cliente (se houver); delete
apagarCliente(clienteId, usuario)                            // podeApagarCliente → delete linha-do-tempo do cliente + delete cliente (hook beforeDelete repete a regra)
```
`criarLeadManual` passa a usar `executarEmTransacao` quando cria o cliente na hora (fecha a dívida da Sessão 1).

- [ ] **Step 1: `transacao.ts`**

```ts
import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload, type PayloadRequest } from "payload";
import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";

/**
 * Executa `fn` numa transação do Payload com `req.user` = usuário da sessão.
 * Toda chamada da Local API dentro de `fn` DEVE passar `req` — é o que faz
 * hooks (linha do tempo) e escritas compostas entrarem na mesma transação.
 */
export async function executarEmTransacao<T>(payload: Payload, usuario: UsuarioAutenticado, fn: (req: PayloadRequest) => Promise<T>): Promise<T> {
  const req = await createLocalReq({ user: usuario }, payload);
  await initTransaction(req);
  try {
    const r = await fn(req);
    await commitTransaction(req);
    return r;
  } catch (e) {
    await killTransaction(req);
    throw e;
  }
}
```
Teste (`transacao.test.ts`, mock de `payload` com `db.beginTransaction/commitTransaction/rollbackTransaction` como `vi.fn`): commit no sucesso; rollback + rethrow no erro. (Se `initTransaction` exigir `payload.db.beginTransaction` retornando id, o mock devolve `"tx1"`.)

- [ ] **Step 2: Testes da escrita** (`painelCrmEscrita.evento.test.ts`, mesmo padrão de mocks de `painelCrmEscrita.lead.test.ts`; mockar `@/lib/crm/transacao` para `executarEmTransacao` chamar `fn(reqFalso)` direto, com `reqFalso.payload` = o payload falso): `agendarEvento` cria com `cliente` do lead e atualiza `estagio: "evento-agendado"`; lead sem cliente → erro; `salvarLinksInscricao` recusa URL inválida e não chama update; `registrarContratoEmpenho` sem arquivo só atualiza o grupo + move; `marcarEventoRealizado` move; `cancelarEvento` não toca o lead; `subirDocumentoEvento` recusa > 20 MB e mimetype fora da lista; `apagarLead` exige confirmação quando há evento (count) e, aceita, chama update de desvínculo em `eventos-comerciais`/`propostas`/`envios-email`/`linha-do-tempo` (`where lead equals`), cria o item na linha do tempo e `delete`; `apagarCliente` recusa com dependentes e, sem, apaga linha do tempo e cliente.

- [ ] **Step 3: Implementar** seguindo o padrão do arquivo (`ouNulo`, `idOuNulo`, `numeroOuNulo`, `ERRO_GENERICO`, `console.error`). Upload: `payload.create({ collection: "documentos-comerciais", data: { evento, descricao, alt: nome }, file: { data: Buffer.from(await arquivo.arrayBuffer()), mimetype: arquivo.type, name: arquivo.name, size: arquivo.size }, req })` — mesmo formato de `gerarESalvarPdfProposta`. Tipos permitidos: `application/pdf`, `image/png`, `image/jpeg`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. Constantes `TAMANHO_MAX_DOCUMENTO = 20 * 1024 * 1024` e `MIMES_DOCUMENTO` exportadas.

- [ ] **Step 4:** `pnpm --filter @ntc/cms test`, `typecheck`, `lint`. **Commit** `feat(crm): escrita transacional das ações de evento, documentos e exclusão de lead/cliente`.

---

### Task 4: Leitura e Server Actions

**Files:** Modify `apps/cms/src/lib/cms/painelCrm.ts`, `apps/cms/src/app/(painel)/acoesCrm.ts` (+ test).

**Interfaces (Produces):**
```ts
interface DocumentoEventoResumo { id: string; nome: string; descricao: string | null; url: string; tamanho: number | null; criadoEmISO: string }
interface EventoComercialResumo {   // substitui a atual
  id; titulo; dataInicioISO; dataFimISO: string | null; status; modalidade; local; observacoes: string | null;
  leadId: string | null; leadNome: string | null; clienteId: string; moduloTitulo: string | null;
  contrato: { tipo: string | null; numero: string | null; dataISO: string | null; valor: number | null; arquivo: { nome: string; url: string } | null } | null;   // null quando tipo, numero, data, valor e arquivo estão todos vazios
  links: { rotulo: string; url: string }[];
  documentos: DocumentoEventoResumo[];
  numDocumentos: number;
}
listarEventosDoLead(leadId): Promise<EventoComercialResumo[]>   // -dataInicio, depth 1, documentos via find em documentos-comerciais where evento in ids
LeadCrmDetalhe.eventos: EventoComercialResumo[]                  // obterLeadCrm
ClienteCrmDetalhe.eventos: EventoComercialResumo[]               // obterClienteCrm — mesmo mapper, com documentos
// acoesCrm.ts
agendarEventoCrm(leadId, dados) · registrarContratoCrm(eventoId, dados, formData: FormData /* arquivo opcional no campo "arquivo" */) · salvarLinksCrm(eventoId, links) · marcarEventoRealizadoCrm(eventoId) · cancelarEventoCrm(eventoId) · subirDocumentoEventoCrm(eventoId, descricao, formData) · removerDocumentoEventoCrm(documentoId) · apagarLeadCrm(leadId, confirmacaoNome) · apagarClienteCrm(clienteId)
```
Todas: `obterUsuarioAutenticado` → `RECUSADO`; `revalidatePath("/crm")` no sucesso. Upload: `formData.get("arquivo") instanceof File && size > 0` como em `enviarMidia` (`acoes.ts`). Teste em `acoesCrm.test.ts`: `apagarLeadCrm` sem sessão recusa sem tocar a Local API; `agendarEventoCrm` repassa o usuário.

- [ ] **Commit** `feat(crm): leitura detalhada de eventos e actions de evento, documentos e exclusão`.

---

### Task 5: Modal — aba Ações, formulários de evento/contrato/links, Apagar lead

**Files:** Create `apps/cms/src/app/(painel)/crm/AbaAcoes.tsx`, `FormEvento.tsx`, `FormContrato.tsx`, `EditorLinks.tsx`; Modify `ModalLead.tsx`, `ShellCrm.tsx`, `painel.css`.

**Comportamento:**
- `ModalLead`: `type Aba = "dados" | "acoes" | "historico"`; aba **Ações** entre Dados e Histórico; renderiza `<AbaAcoes lead={lead} catalogo={catalogo} ocupado onExecutar={executar} />`. No fim da aba Dados, seção "Zona de risco" com o botão **Apagar lead** (`pcms-btn pcms-btn--perigo`): ao clicar, se `exigeConfirmacaoDupla({ numEventos: lead.eventos.length, numPropostas: lead.numPropostas, numEnvios: lead.numEnvios })` (`LeadCrmDetalhe` ganha `numPropostas`/`numEnvios` via `count` em `obterLeadCrm` — acrescentar na Task 4 se ainda não estiver) mostra input "Digite o nome do contato para confirmar" + "Confirmar exclusão"; senão confirma com um segundo clique ("Confirmar"). Sucesso → `onApagado()` (novo prop): `ShellCrm` fecha o modal e, se há `clienteDet`, recarrega o cliente.
- `AbaAcoes`: calcula `corrente = eventoCorrente(lead.eventos.map(...))` e `acoes = acoesDeEvento(lead, corrente)`; painel do evento corrente (título, datas `dd/mm/aaaa`, modalidade, status com selo, "Contrato: <tipo nº>" ou "sem contrato", "N links", "N documentos"); botões conforme `acoes`, cada um abrindo o formulário inline correspondente: `FormEvento` (agendar), `FormContrato` (registrar), `EditorLinks` (links), e confirmações simples para realizado/cancelar. Eventos anteriores em lista compacta (título · data · status). Rodapé: aviso em texto quando não há evento e o lead está em estágio ≥ `evento-agendado` ("Este lead está em <estágio> sem evento agendado — agende ou ajuste o estágio.") — aviso, não bloqueio.
- `FormEvento`: campos com `CampoTexto`/`CampoData`/`CampoSelect`/`CampoArea` (`MODALIDADES_EVENTO`; módulos do `catalogo.modulos`); Salvar → `agendarEventoCrm`.
- `FormContrato`: tipo (`TIPOS_CONTRATO`), número, data, valor (`CampoNumero`), `<input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx">` opcional; Salvar → `registrarContratoCrm(eventoId, dados, formData)`.
- `EditorLinks`: linhas rótulo + URL, adicionar/remover, validação `urlValida` no client antes de salvar (mensagem "Link inválido"); Salvar → `salvarLinksCrm`.
- Todos os formulários: fecham só no sucesso; erro em `AvisoForm`; após sucesso `onAtualizado(lead.id)`.
- CSS: `.pcms-acoes__evento` (cartão do evento corrente), `.pcms-acoes__botoes`, `.pcms-links__linha` (grid rótulo/url/remover), `.pcms-btn--perigo` (borda/texto `--pcms-cardeal`), `.pcms-zona-risco`.
- a11y: botões `<button>`, inputs com `aria-label`/`label`, `role="tab"` existente estendido para 3 abas.

- [ ] **Commit** `feat(crm): aba Ações do modal com evento, contrato/empenho, links de inscrição e exclusão do lead`.

---

### Task 6: Cliente — acervo de eventos com documentos e Apagar cliente

**Files:** Create `apps/cms/src/app/(painel)/crm/EventosDoCliente.tsx`, `UploadDocumento.tsx`; Modify `DetalheCliente.tsx`, `ShellCrm.tsx`, `painel.css`.

**Comportamento:**
- `EventosDoCliente({ eventos, onAbrirLead, onAtualizado })`: filtro (chips `pcms-chip`) todos/agendados/realizados/cancelados; card por evento (`<details>`/`<summary>` nativo para expandir — acessível sem JS extra): summary = título · datas · modalidade · selo de status · "lead: <nome>" (botão que chama `onAbrirLead` quando `leadId`); corpo = bloco Contrato/empenho (ou "Sem contrato registrado"; link "Baixar" → `contrato.arquivo.url`, nova aba), bloco Links (lista `<a target="_blank" rel="noopener">`), bloco Documentos (tabela nome · descrição · data · tamanho legível · Baixar · Remover com confirmação em 2 cliques) + `<UploadDocumento eventoId onEnviado />`.
- `UploadDocumento`: `<input type="file">` + campo descrição + botão Enviar; `FormData` com `arquivo`; chama `subirDocumentoEventoCrm(eventoId, descricao, fd)`; erro inline; sucesso → `onEnviado()` (o pai recarrega o cliente). Baseado em `CampoUpload.tsx` (mesmas classes `pcms-upload*`).
- `DetalheCliente`: bloco Eventos passa a `<EventosDoCliente …/>`; cabeçalho ganha **Apagar cliente** (`pcms-btn--perigo`), desabilitado com `title`/texto explicativo quando `podeApagarCliente({ numLeads: c.negocios.length, numEventos: c.eventos.length })` falha; habilitado → confirmação em 2 cliques → `apagarClienteCrm` → `onApagado()` (ShellCrm: `fecharTudo()` + volta para a tela Clientes).
- CSS: `.pcms-evento-card` (`details`), `.pcms-evento-card summary`, `.pcms-evento-card__corpo` (grid 3 blocos, 1 coluna < 1100px).

- [ ] **Commit** `feat(crm): acervo de eventos e documentos no cliente, upload de documentos e exclusão do cliente`.

---

### Task 7: Docs, build e checkpoint

- [ ] `CLAUDE.md`: entrada **v3.1** no histórico (Sessão 4 antes das 2/3 e por quê; o que entrou; sem push:schema; transação `executarEmTransacao` fechando a dívida do `criarLeadManual`; testes/lint/typecheck/build); §19.1 (hooks novos, `lead` opcional em eventos), §19.2 (bullets "CRM — Evento comercial" e "Exclusão"), §19.3 (item 4 reordenado: S2, S3 pendentes; item 12 sem a dívida da transação; roteiro do checkpoint visual abaixo).
- [ ] `pnpm build` com dev parado; `rm -rf apps/cms/.next apps/web/.next`. **Commit** `docs: CLAUDE.md v3.1 — Sessão 4 (evento comercial)`.
- [ ] **Checkpoint visual (PO, dev no ar):** (1) modal de um lead em *Em contato* → aba Ações → Agendar evento (título, data, modalidade) → card vai para *Evento agendado*; Histórico mostra "Evento agendado · …"; (2) Registrar contrato/empenho com um PDF → card em *Contrato/empenho recebido*; no cliente, o card do evento mostra o contrato e "Baixar" abre o PDF (URL do bucket privado exige login — abrir logado); (3) Links de inscrição: adicionar 2, um inválido (sem https) → erro; corrigir → salvo; card **não** move; arrastar para *Links enviados*; (4) Cliente → Eventos → expandir → enviar um documento com descrição → aparece na lista; Remover (2 cliques) → some; Histórico do cliente tem "Documento anexado"/"Documento removido"; (5) Marcar realizado → card em *Evento realizado*; "Agendar evento" reaparece; (6) Apagar lead com evento → pede o nome; digitar errado → erro; certo → lead some do quadro, o evento continua no cliente com "lead: —", linha do tempo tem "Lead apagado · …"; (7) Apagar cliente com evento → botão desabilitado com a explicação; num cliente vazio → apaga e volta para Clientes; (8) desktop 1440 / mobile 375 da aba Ações e do acervo.

---

## Self-review (feito ao escrever)

**Cobertura do adendo:** §1 (aba Ações, 5 ações, evento corrente, múltiplos eventos, transação, linha do tempo) → Tasks 1, 2, 3, 5; §2 (acervo, documentos, upload/remover, filtro) → Tasks 3, 4, 6; §3 (apagar lead/cliente, desvínculo, beforeDelete) → Tasks 1, 2, 3, 5, 6; §4 (código) → estrutura de arquivos; sem push:schema → Task 2 só muda validação.
**Nomes entre tasks:** `eventoCorrente`/`acoesDeEvento`/`estagioDaAcaoEvento`/`urlValida`/`TIPOS_CONTRATO`/`MODALIDADES_EVENTO` (T1) em T3, T5; `podeApagarCliente`/`exigeConfirmacaoDupla`/`tituloLeadApagado` (T1) em T2, T3, T5, T6; `executarEmTransacao` (T3) em T3; `EventoComercialResumo` novo (T4) em T5, T6; actions (T4) em T5, T6; `LeadCrmDetalhe.eventos/numPropostas/numEnvios` (T4) em T5.
**Decisões embutidas:** `afterDelete` de documento não grava linha do tempo (sem cliente à mão) — a escrita `removerDocumentoEvento` grava; `<details>` nativo para os cards (a11y sem JS); confirmação de exclusão em 2 cliques (sem `window.confirm`).
