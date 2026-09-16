# CRM Kanban — Sessão 1 (Fundação) · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o modelo do CRM para "Lead é o card, Cliente é o ativo": novo modelo de dados completo (o único `push:schema` da entrega), remoção das coleções e telas do processo P0, Clientes como ativo com contatos embutidos e linha do tempo, Leads com modal e Novo Lead, kanban de 10 colunas no Dashboard com Perdido.

**Architecture:** Regras puras em `packages/lib/src/crm/` (listas de estágio, casamento lead→cliente, montagem de itens da linha do tempo) com teste Vitest; hooks finos nas coleções do Payload em `apps/cms/src/lib/crm/` (casamento na criação do lead; linha do tempo em `afterChange`, sempre com `req` para ficar na mesma transação); leitura em `painelCrm.ts`, escrita em `painelCrmEscrita.ts`, Server Actions em `acoesCrm.ts` (sessão validada antes de tocar a Local API); telas client em `apps/cms/src/app/(painel)/crm/` com o idiom `pcms-*` do Painel Admin.

**Tech Stack:** Next.js 15 App Router · React 19 · Payload CMS 3.18 (postgres) · TypeScript strict · Vitest · pnpm workspaces (`@ntc/lib`, `@ntc/types`, `@ntc/cms`).

**Spec:** `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` (ler §3 modelo de dados, §4 telas, §5 regras, §8 sessão 1).

## Global Constraints

- CLAUDE.md tem precedência. Sem dependência nova (§5.4): drag-and-drop é a API HTML5 nativa. Sem `any`, sem `@ts-ignore`, sem `eslint-disable` (§5.7).
- Nomes em português para conceitos editoriais/comerciais; `camelCase` em funções; `PascalCase.tsx` em componentes; `kebab-case.ts` em utilitários (§4.2).
- Estilo do painel: classes `pcms-*` em `apps/cms/src/app/(painel)/painel.css` (exceção deliberada do §3, só no painel). Novas classes vão nesse arquivo, no fim, sob um comentário `/* ===== CRM Kanban ===== */`.
- Toda escrita da Local API que precise de autor ou de transação recebe `req` (hooks) ou `user` (Server Actions → `painelCrmEscrita`). Server Action é endpoint público: valida sessão **antes** de ler ou escrever.
- Coleções append-only (`linha-do-tempo`, `envios-email`): `create`/`update`/`delete` negados por access control; escrita só pela Local API interna (que roda com `overrideAccess` padrão). Exceção: `linha-do-tempo` aceita `create` de usuário autenticado **só** quando `tipo = nota`.
- Slug da coleção de clientes continua `clientes-crm` (o slug `clientes` é da coleção de logos do site). Rótulo "Clientes" só na UI.
- Só leads com `tipo = proposta` entram no CRM. "Novo Lead" grava `tipo: "proposta"`, `origemEntrada: "manual"`.
- Os 10 estágios, nesta ordem e com estes slugs: `lead` · `oportunidade` · `em-contato` · `proposta-em-producao` · `proposta-enviada` · `proposta-aceita` · `evento-agendado` · `contrato-recebido` · `links-enviados` · `evento-realizado`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` verdes ao fim de **cada task**. `pnpm build` só na task final e **com o dev server parado** (o `.next` é compartilhado — memória do projeto).
- `pnpm payload:generate` roda sem banco; `pnpm payload:push:schema` **nunca** é rodado por agente — é passo manual do PO (Task 12).
- Commits em português, Conventional Commits, sem emoji, terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch de trabalho: `feat/crm-kanban-sessao-1`, criada a partir da `main` (`3d71fde` ou posterior).

---

## Estrutura de arquivos

**`packages/lib/src/crm/` (regras puras, testadas)**
- Create `estagios.ts` — listas `ESTAGIOS_LEAD`, `MOTIVOS_PERDA`, `ORIGENS_ENTRADA_LEAD`, `ORIGENS_CLIENTE`; guards `ehEstagioLead`, `indiceDoEstagio`; `diasEntre`.
- Create `casamento-cliente.ts` — `normalizarNome`, `dominioDoEmail`, `ehDominioInstitucional`, `casarCliente`.
- Create `linha-do-tempo.ts` — `TIPOS_LINHA_DO_TEMPO`, `montarItemLinhaDoTempo`, `tituloTransicao`, `rotuloDoEstagio`.
- Delete `funil.ts`, `funil.test.ts`, `qualificacao.ts`, `qualificacao.test.ts`.
- Modify `listas.ts` (remove `STATUS_CLIENTE_CRM`, `STATUS_OPORTUNIDADE`, `STATUS_OPORTUNIDADE_FECHADA`), `../index.ts` (exports).

**`apps/cms/src/collections/`**
- Create `LinhaDoTempo.ts`, `EnviosEmail.ts`, `ModelosEmail.ts`, `EventosComerciais.ts`.
- Modify `Leads.ts`, `ClientesCrm.ts`, `Propostas.ts`, `DocumentosComerciais.ts`.
- Delete `Oportunidades.ts`, `HistoricoEstagio.ts`, `AvaliacoesQualificacao.ts`, `ContatosCrm.ts`.
- Modify `../payload.config.ts`, `../shared/types.ts` (remove `LEAD_STATUS`).

**`apps/cms/src/lib/crm/`**
- Create `linhaDoTempo.ts` (+ `.test.ts`) — helper `registrarNaLinhaDoTempo` e hook `registrarLeadNaLinhaDoTempo`.
- Create `casamento.ts` (+ `.test.ts`) — hook `casarClienteDoLead`.
- Delete `gateQualificada*`, `vigenciaAvaliacao*`, `derivadosAvaliacao*`, `espelhoStatusLegado*`, `situacaoOportunidade.ts`, `historicoEstagio*`, `importadorCrm*`, `listas.test.ts` (se referenciar o que saiu).

**`apps/cms/src/lib/cms/`**
- Modify `painelCrm.ts` (tipos e leitores de lead/cliente/linha do tempo/evento), `painelCrmEscrita.ts` (escritas do lead e do cliente com contatos), `kpisComercial.ts` (+ `.test.ts`), `painelCms.ts` (`listarLeadsCms` sem `status`).

**`apps/cms/src/app/(painel)/`**
- Modify `acoesCrm.ts` (+ `.test.ts`), `TelaDashboard.tsx` (KPI de leads sem `status`).
- Delete `TelaLeads.tsx`, `DetalheLead.tsx` (substituídos pelos do CRM).
- `crm/`: Create `Kanban.tsx`, `ModalLead.tsx`, `FormLead.tsx`, `TelaLeadsCrm.tsx`, `EditorContatos.tsx`, `LinhaDoTempo.tsx`; Modify `ShellCrm.tsx`, `page.tsx`, `TelaPainelComercial.tsx`, `TelaClientes.tsx`, `DetalheCliente.tsx`, `FormCliente.tsx`, `FormProposta.tsx`, `seloStatus.ts`; Delete `TelaOportunidades.tsx`, `FormOportunidade.tsx`, `DetalheOportunidade.tsx`, `TelaFollowups.tsx`, `TelaQualificacao.tsx`, `FormAvaliacao.tsx`, `TelaContatos.tsx`, `FormContato.tsx`, `TelaVersoes.tsx`, `TelaEmBreve.tsx`, `GraficosComercial.tsx`.
- Modify `painel.css` (bloco CRM Kanban).

**`apps/cms/src/seed/`**: Delete `importarCrm.ts`, `migrarOportunidadesP0.ts`; remover scripts `crm:importar`, `crm:migrar-p0` de `apps/cms/package.json`.

**`apps/web/app/api/forms/*/route.ts`** (4 arquivos): remover a linha `status: "novo",` do `payload.create`.

**Docs**: `CLAUDE.md` (§19 e histórico), `docs/16_Roadmap_CMS_CRM_v1.md`, `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` (nota de substituição no cabeçalho).

---

### Task 0: Branch

- [ ] **Step 1:** `git checkout main && git pull --ff-only origin main` (se o origin recusar por estar atrás, seguir com a `main` local).
- [ ] **Step 2:** `git checkout -b feat/crm-kanban-sessao-1`
- [ ] **Step 3:** `pnpm install --frozen-lockfile` e `pnpm test` — baseline verde antes de qualquer mudança (esperado: 41 testes em `@ntc/lib`, 200+ no cms).

---

### Task 1: Listas e guards dos estágios (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/estagios.ts`
- Test: `packages/lib/src/crm/estagios.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Produces: `ESTAGIOS_LEAD: OpcaoLista[]` (10, ordem do kanban), `type EstagioLead`, `MOTIVOS_PERDA: OpcaoLista[]`, `ORIGENS_ENTRADA_LEAD: OpcaoLista[]`, `ORIGENS_CLIENTE: OpcaoLista[]`, `ehEstagioLead(v: unknown): v is EstagioLead`, `indiceDoEstagio(e: EstagioLead): number`, `rotuloDoEstagio(e: string): string`, `diasEntre(deISO: string, ateISO: string): number`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// packages/lib/src/crm/estagios.test.ts
import { describe, expect, it } from "vitest";

import {
  ESTAGIOS_LEAD,
  MOTIVOS_PERDA,
  diasEntre,
  ehEstagioLead,
  indiceDoEstagio,
  rotuloDoEstagio,
} from "./estagios";

describe("ESTAGIOS_LEAD", () => {
  it("tem os 10 estágios do kanban na ordem do spec", () => {
    expect(ESTAGIOS_LEAD.map((e) => e.value)).toEqual([
      "lead",
      "oportunidade",
      "em-contato",
      "proposta-em-producao",
      "proposta-enviada",
      "proposta-aceita",
      "evento-agendado",
      "contrato-recebido",
      "links-enviados",
      "evento-realizado",
    ]);
  });

  it("tem rótulos legíveis", () => {
    expect(rotuloDoEstagio("proposta-em-producao")).toBe("Proposta em produção");
    expect(rotuloDoEstagio("contrato-recebido")).toBe("Contrato/empenho recebido");
    expect(rotuloDoEstagio("inexistente")).toBe("inexistente");
  });
});

describe("ehEstagioLead", () => {
  it("aceita só os slugs da lista", () => {
    expect(ehEstagioLead("lead")).toBe(true);
    expect(ehEstagioLead("evento-realizado")).toBe(true);
    expect(ehEstagioLead("mapeada")).toBe(false);
    expect(ehEstagioLead(null)).toBe(false);
    expect(ehEstagioLead(3)).toBe(false);
  });
});

describe("indiceDoEstagio", () => {
  it("devolve a posição na ordem do kanban", () => {
    expect(indiceDoEstagio("lead")).toBe(0);
    expect(indiceDoEstagio("evento-realizado")).toBe(9);
  });
});

describe("MOTIVOS_PERDA", () => {
  it("tem os 5 motivos do spec", () => {
    expect(MOTIVOS_PERDA.map((m) => m.value)).toEqual([
      "sem-resposta",
      "recusou",
      "sem-orcamento",
      "cancelado",
      "outro",
    ]);
  });
});

describe("diasEntre", () => {
  it("conta dias inteiros entre duas datas ISO", () => {
    expect(diasEntre("2026-09-01T10:00:00.000Z", "2026-09-16T09:00:00.000Z")).toBe(14);
    expect(diasEntre("2026-09-16T10:00:00.000Z", "2026-09-16T12:00:00.000Z")).toBe(0);
  });

  it("nunca devolve negativo nem NaN", () => {
    expect(diasEntre("2026-09-20T00:00:00.000Z", "2026-09-16T00:00:00.000Z")).toBe(0);
    expect(diasEntre("data inválida", "2026-09-16T00:00:00.000Z")).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/lib test -- estagios`
Expected: FAIL — "Cannot find module './estagios'".

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/crm/estagios.ts
/**
 * Estágios do kanban comercial (spec 2026-09-15 §2 e §3.1). A ordem do array
 * É a ordem das colunas. "Perdido" não é estágio: é o par perdido/motivoPerda
 * do lead, ortogonal a esta lista.
 */

import type { OpcaoLista } from "./listas";

export const ESTAGIOS_LEAD: OpcaoLista[] = [
  { label: "Lead", value: "lead" },
  { label: "Oportunidade", value: "oportunidade" },
  { label: "Em contato", value: "em-contato" },
  { label: "Proposta em produção", value: "proposta-em-producao" },
  { label: "Proposta enviada", value: "proposta-enviada" },
  { label: "Proposta aceita", value: "proposta-aceita" },
  { label: "Evento agendado", value: "evento-agendado" },
  { label: "Contrato/empenho recebido", value: "contrato-recebido" },
  { label: "Links enviados", value: "links-enviados" },
  { label: "Evento realizado", value: "evento-realizado" },
];

export type EstagioLead =
  | "lead"
  | "oportunidade"
  | "em-contato"
  | "proposta-em-producao"
  | "proposta-enviada"
  | "proposta-aceita"
  | "evento-agendado"
  | "contrato-recebido"
  | "links-enviados"
  | "evento-realizado";

export const MOTIVOS_PERDA: OpcaoLista[] = [
  { label: "Sem resposta", value: "sem-resposta" },
  { label: "Recusou a proposta", value: "recusou" },
  { label: "Sem orçamento", value: "sem-orcamento" },
  { label: "Cancelado", value: "cancelado" },
  { label: "Outro", value: "outro" },
];

export const ORIGENS_ENTRADA_LEAD: OpcaoLista[] = [
  { label: "Site", value: "site" },
  { label: "Manual", value: "manual" },
  { label: "WhatsApp", value: "whatsapp" },
];

export const ORIGENS_CLIENTE: OpcaoLista[] = [
  { label: "Lead do site", value: "lead-site" },
  { label: "Manual", value: "manual" },
  { label: "Importado", value: "importado" },
];

export function ehEstagioLead(v: unknown): v is EstagioLead {
  return typeof v === "string" && ESTAGIOS_LEAD.some((e) => e.value === v);
}

export function indiceDoEstagio(estagio: EstagioLead): number {
  return ESTAGIOS_LEAD.findIndex((e) => e.value === estagio);
}

export function rotuloDoEstagio(estagio: string): string {
  return ESTAGIOS_LEAD.find((e) => e.value === estagio)?.label ?? estagio;
}

const MS_POR_DIA = 86_400_000;

/** Dias inteiros de `deISO` até `ateISO`; 0 para datas inválidas ou ordem invertida. */
export function diasEntre(deISO: string, ateISO: string): number {
  const de = Date.parse(deISO);
  const ate = Date.parse(ateISO);
  if (!Number.isFinite(de) || !Number.isFinite(ate) || ate < de) return 0;
  return Math.floor((ate - de) / MS_POR_DIA);
}
```

Em `packages/lib/src/index.ts`, acrescentar ao fim do bloco `// CRM`:

```ts
export {
  ESTAGIOS_LEAD,
  type EstagioLead,
  MOTIVOS_PERDA,
  ORIGENS_ENTRADA_LEAD,
  ORIGENS_CLIENTE,
  ehEstagioLead,
  indiceDoEstagio,
  rotuloDoEstagio,
  diasEntre,
} from "./crm/estagios";
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/lib test -- estagios` → PASS (7 testes). `pnpm --filter @ntc/lib typecheck` verde.

- [ ] **Step 5: Commit**

```bash
git add packages/lib/src/crm/estagios.ts packages/lib/src/crm/estagios.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): listas e guards dos 10 estágios do kanban em @ntc/lib"
```

---

### Task 2: Regra pura de casamento lead → cliente (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/casamento-cliente.ts`
- Test: `packages/lib/src/crm/casamento-cliente.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Produces:
  ```ts
  interface LeadParaCasar { instituicao: string | null; email: string | null; cnpj: string | null }
  interface ClienteCandidato { id: string; orgao: string; sigla: string | null; cnpj: string | null; email: string | null; emailsContatos: string[] }
  type MotivoCasamento = "cnpj" | "dominio" | "nome";
  function casarCliente(lead: LeadParaCasar, candidatos: ClienteCandidato[]): { clienteId: string; por: MotivoCasamento } | null
  function normalizarNome(v: string): string
  function dominioDoEmail(email: string | null): string | null
  function ehDominioInstitucional(dominio: string): boolean
  function somenteDigitos(v: string | null): string
  ```

- [ ] **Step 1: Escrever o teste que falha**

```ts
// packages/lib/src/crm/casamento-cliente.test.ts
import { describe, expect, it } from "vitest";

import {
  casarCliente,
  dominioDoEmail,
  ehDominioInstitucional,
  normalizarNome,
  type ClienteCandidato,
} from "./casamento-cliente";

const candidatos: ClienteCandidato[] = [
  {
    id: "1",
    orgao: "Secretaria Municipal de Educação de Campinas",
    sigla: "SME Campinas",
    cnpj: "51.885.242/0001-40",
    email: "gabinete@campinas.sp.gov.br",
    emailsContatos: ["ana@campinas.sp.gov.br"],
  },
  {
    id: "2",
    orgao: "Tribunal de Contas do Estado",
    sigla: "TCE-SP",
    cnpj: null,
    email: null,
    emailsContatos: ["joao@tce.sp.gov.br"],
  },
  {
    id: "3",
    orgao: "Consultoria Particular",
    sigla: null,
    cnpj: null,
    email: "contato@gmail.com",
    emailsContatos: [],
  },
];

describe("normalizarNome", () => {
  it("remove acento, caixa, pontuação e espaços repetidos", () => {
    expect(normalizarNome("  Secretaria   Municipal de Educação — Campinas! ")).toBe(
      "secretaria municipal de educacao campinas",
    );
  });
});

describe("dominioDoEmail / ehDominioInstitucional", () => {
  it("extrai o domínio em minúsculas", () => {
    expect(dominioDoEmail("Ana@Campinas.SP.GOV.BR")).toBe("campinas.sp.gov.br");
    expect(dominioDoEmail("sem-arroba")).toBeNull();
    expect(dominioDoEmail(null)).toBeNull();
  });

  it("reconhece sufixos institucionais e recusa provedores públicos", () => {
    expect(ehDominioInstitucional("campinas.sp.gov.br")).toBe(true);
    expect(ehDominioInstitucional("tce.sp.gov.br")).toBe(true);
    expect(ehDominioInstitucional("camara.leg.br")).toBe(true);
    expect(ehDominioInstitucional("ufmg.edu.br")).toBe(true);
    expect(ehDominioInstitucional("gmail.com")).toBe(false);
    expect(ehDominioInstitucional("empresa.com.br")).toBe(false);
  });
});

describe("casarCliente", () => {
  it("casa por CNPJ ignorando máscara", () => {
    expect(
      casarCliente({ instituicao: "outro nome", email: null, cnpj: "51885242000140" }, candidatos),
    ).toEqual({ clienteId: "1", por: "cnpj" });
  });

  it("casa por domínio institucional do e-mail do cliente", () => {
    expect(
      casarCliente({ instituicao: null, email: "novo@campinas.sp.gov.br", cnpj: null }, candidatos),
    ).toEqual({ clienteId: "1", por: "dominio" });
  });

  it("casa por domínio institucional de um contato", () => {
    expect(
      casarCliente({ instituicao: null, email: "maria@tce.sp.gov.br", cnpj: null }, candidatos),
    ).toEqual({ clienteId: "2", por: "dominio" });
  });

  it("nunca casa por domínio de provedor público", () => {
    expect(
      casarCliente({ instituicao: null, email: "fulano@gmail.com", cnpj: null }, candidatos),
    ).toBeNull();
  });

  it("casa por nome normalizado do órgão ou pela sigla", () => {
    expect(
      casarCliente(
        { instituicao: "secretaria municipal de educacao de campinas", email: null, cnpj: null },
        candidatos,
      ),
    ).toEqual({ clienteId: "1", por: "nome" });
    expect(casarCliente({ instituicao: "tce-sp", email: null, cnpj: null }, candidatos)).toEqual({
      clienteId: "2",
      por: "nome",
    });
  });

  it("CNPJ vence domínio, domínio vence nome", () => {
    expect(
      casarCliente(
        { instituicao: "Tribunal de Contas do Estado", email: "x@campinas.sp.gov.br", cnpj: null },
        candidatos,
      ),
    ).toEqual({ clienteId: "1", por: "dominio" });
  });

  it("devolve null sem candidato compatível", () => {
    expect(
      casarCliente({ instituicao: "Prefeitura de Sorocaba", email: "a@sorocaba.sp.gov.br", cnpj: null }, candidatos),
    ).toBeNull();
    expect(casarCliente({ instituicao: null, email: null, cnpj: null }, candidatos)).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/lib test -- casamento` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/crm/casamento-cliente.ts
/**
 * Casamento automático lead → cliente (spec 2026-09-15 §5.1). Pura: recebe o
 * lead e a lista de candidatos já carregada; o hook do Payload faz a busca e
 * a escrita. Ordem de tentativa: CNPJ → domínio institucional → nome/sigla.
 */

export interface LeadParaCasar {
  instituicao: string | null;
  email: string | null;
  cnpj: string | null;
}

export interface ClienteCandidato {
  id: string;
  orgao: string;
  sigla: string | null;
  cnpj: string | null;
  email: string | null;
  emailsContatos: string[];
}

export type MotivoCasamento = "cnpj" | "dominio" | "nome";

export interface ResultadoCasamento {
  clienteId: string;
  por: MotivoCasamento;
}

const SUFIXOS_INSTITUCIONAIS = [".gov.br", ".leg.br", ".jus.br", ".mp.br", ".edu.br", ".org.br"];
const PROVEDORES_PUBLICOS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "outlook.com.br",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "live.com",
  "bol.com.br",
  "uol.com.br",
  "terra.com.br",
]);

export function normalizarNome(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function somenteDigitos(v: string | null): string {
  return (v ?? "").replace(/\D/g, "");
}

export function dominioDoEmail(email: string | null): string | null {
  if (!email) return null;
  const arroba = email.lastIndexOf("@");
  if (arroba < 0 || arroba === email.length - 1) return null;
  return email.slice(arroba + 1).trim().toLowerCase();
}

export function ehDominioInstitucional(dominio: string): boolean {
  const d = dominio.toLowerCase();
  if (PROVEDORES_PUBLICOS.has(d)) return false;
  return SUFIXOS_INSTITUCIONAIS.some((sufixo) => d.endsWith(sufixo));
}

function dominiosDoCandidato(c: ClienteCandidato): string[] {
  return [c.email, ...c.emailsContatos]
    .map(dominioDoEmail)
    .filter((d): d is string => d !== null);
}

export function casarCliente(
  lead: LeadParaCasar,
  candidatos: ClienteCandidato[],
): ResultadoCasamento | null {
  const cnpj = somenteDigitos(lead.cnpj);
  if (cnpj.length === 14) {
    const porCnpj = candidatos.find((c) => somenteDigitos(c.cnpj) === cnpj);
    if (porCnpj) return { clienteId: porCnpj.id, por: "cnpj" };
  }

  const dominio = dominioDoEmail(lead.email);
  if (dominio !== null && ehDominioInstitucional(dominio)) {
    const porDominio = candidatos.find((c) => dominiosDoCandidato(c).includes(dominio));
    if (porDominio) return { clienteId: porDominio.id, por: "dominio" };
  }

  const nome = lead.instituicao ? normalizarNome(lead.instituicao) : "";
  if (nome !== "") {
    const porNome = candidatos.find(
      (c) =>
        normalizarNome(c.orgao) === nome || (c.sigla !== null && normalizarNome(c.sigla) === nome),
    );
    if (porNome) return { clienteId: porNome.id, por: "nome" };
  }

  return null;
}
```

Em `packages/lib/src/index.ts`:

```ts
export {
  casarCliente,
  normalizarNome,
  somenteDigitos,
  dominioDoEmail,
  ehDominioInstitucional,
  type LeadParaCasar,
  type ClienteCandidato,
  type MotivoCasamento,
  type ResultadoCasamento,
} from "./crm/casamento-cliente";
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/lib test -- casamento` → PASS (10 testes).

- [ ] **Step 5: Commit**

```bash
git add packages/lib/src/crm/casamento-cliente.ts packages/lib/src/crm/casamento-cliente.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): regra pura de casamento lead → cliente (cnpj, domínio institucional, nome)"
```

---

### Task 3: Montagem dos itens da linha do tempo (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/linha-do-tempo.ts`
- Test: `packages/lib/src/crm/linha-do-tempo.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Produces:
  ```ts
  const TIPOS_LINHA_DO_TEMPO: OpcaoLista[] // lead·transicao·perda·reabertura·email·proposta·evento·documento·vinculo·nota
  type TipoLinhaDoTempo = "lead" | "transicao" | "perda" | "reabertura" | "email" | "proposta" | "evento" | "documento" | "vinculo" | "nota"
  interface ItemLinhaDoTempo { cliente: number; lead: number | null; tipo: TipoLinhaDoTempo; titulo: string; detalhe: string | null; referencia: { colecao: string; id: string } | null; usuario: number | null; em: string }
  function montarItemLinhaDoTempo(e: { clienteId, leadId?, tipo, titulo, detalhe?, referencia?, usuarioId?, agora?: Date }): ItemLinhaDoTempo | null
  function tituloTransicao(de: string | null, para: string): string
  function tituloPerda(motivo: string): string
  ```

- [ ] **Step 1: Escrever o teste que falha**

```ts
// packages/lib/src/crm/linha-do-tempo.test.ts
import { describe, expect, it } from "vitest";

import { montarItemLinhaDoTempo, tituloPerda, tituloTransicao } from "./linha-do-tempo";

const agora = new Date("2026-09-16T12:00:00.000Z");

describe("montarItemLinhaDoTempo", () => {
  it("monta o item com ids numéricos e data fixa", () => {
    expect(
      montarItemLinhaDoTempo({
        clienteId: "3",
        leadId: 7,
        tipo: "transicao",
        titulo: "Movido para Em contato",
        usuarioId: "5",
        referencia: { colecao: "leads", id: "7" },
        agora,
      }),
    ).toEqual({
      cliente: 3,
      lead: 7,
      tipo: "transicao",
      titulo: "Movido para Em contato",
      detalhe: null,
      referencia: { colecao: "leads", id: "7" },
      usuario: 5,
      em: "2026-09-16T12:00:00.000Z",
    });
  });

  it("devolve null sem cliente válido — a linha do tempo é sempre do cliente", () => {
    expect(
      montarItemLinhaDoTempo({ clienteId: null, tipo: "nota", titulo: "x", agora }),
    ).toBeNull();
    expect(
      montarItemLinhaDoTempo({ clienteId: "abc", tipo: "nota", titulo: "x", agora }),
    ).toBeNull();
  });

  it("recusa título vazio", () => {
    expect(montarItemLinhaDoTempo({ clienteId: 1, tipo: "nota", titulo: "  ", agora })).toBeNull();
  });

  it("usuário ausente vira null (ator sistema)", () => {
    expect(
      montarItemLinhaDoTempo({ clienteId: 1, tipo: "lead", titulo: "Lead recebido", agora }),
    ).toMatchObject({ usuario: null, lead: null });
  });
});

describe("títulos", () => {
  it("transição com e sem estágio anterior", () => {
    expect(tituloTransicao("lead", "oportunidade")).toBe("Lead → Oportunidade");
    expect(tituloTransicao(null, "lead")).toBe("Entrou em Lead");
  });

  it("perda com o rótulo do motivo", () => {
    expect(tituloPerda("sem-orcamento")).toBe("Marcado como perdido · Sem orçamento");
    expect(tituloPerda("qualquer")).toBe("Marcado como perdido · qualquer");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/lib test -- linha-do-tempo` → FAIL.

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/crm/linha-do-tempo.ts
/**
 * Linha do tempo do cliente (spec 2026-09-15 §3.7 e §5.5). Pura: monta o
 * documento que o helper do Payload grava. Todo item pertence a um cliente;
 * `lead` é opcional (itens do próprio cliente, como nota manual, não têm lead).
 */

import { MOTIVOS_PERDA, rotuloDoEstagio } from "./estagios";
import type { OpcaoLista } from "./listas";

export const TIPOS_LINHA_DO_TEMPO: OpcaoLista[] = [
  { label: "Lead", value: "lead" },
  { label: "Transição de estágio", value: "transicao" },
  { label: "Perda", value: "perda" },
  { label: "Reabertura", value: "reabertura" },
  { label: "E-mail", value: "email" },
  { label: "Proposta", value: "proposta" },
  { label: "Evento", value: "evento" },
  { label: "Documento", value: "documento" },
  { label: "Vínculo com cliente", value: "vinculo" },
  { label: "Nota", value: "nota" },
];

export type TipoLinhaDoTempo =
  | "lead"
  | "transicao"
  | "perda"
  | "reabertura"
  | "email"
  | "proposta"
  | "evento"
  | "documento"
  | "vinculo"
  | "nota";

export interface ReferenciaLinhaDoTempo {
  colecao: string;
  id: string;
}

export interface ItemLinhaDoTempo {
  cliente: number;
  lead: number | null;
  tipo: TipoLinhaDoTempo;
  titulo: string;
  detalhe: string | null;
  referencia: ReferenciaLinhaDoTempo | null;
  usuario: number | null;
  em: string;
}

export interface EntradaLinhaDoTempo {
  clienteId: number | string | null | undefined;
  leadId?: number | string | null;
  tipo: TipoLinhaDoTempo;
  titulo: string;
  detalhe?: string | null;
  referencia?: ReferenciaLinhaDoTempo | null;
  usuarioId?: number | string | null;
  /** Injetável para teste; default `new Date()`. */
  agora?: Date;
}

const numeroOuNulo = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function montarItemLinhaDoTempo(e: EntradaLinhaDoTempo): ItemLinhaDoTempo | null {
  const cliente = numeroOuNulo(e.clienteId);
  if (cliente === null) return null;
  const titulo = e.titulo.trim();
  if (titulo === "") return null;
  return {
    cliente,
    lead: numeroOuNulo(e.leadId),
    tipo: e.tipo,
    titulo,
    detalhe: e.detalhe?.trim() ? e.detalhe.trim() : null,
    referencia: e.referencia ?? null,
    usuario: numeroOuNulo(e.usuarioId),
    em: (e.agora ?? new Date()).toISOString(),
  };
}

export function tituloTransicao(de: string | null, para: string): string {
  if (de === null) return `Entrou em ${rotuloDoEstagio(para)}`;
  return `${rotuloDoEstagio(de)} → ${rotuloDoEstagio(para)}`;
}

export function tituloPerda(motivo: string): string {
  const rotulo = MOTIVOS_PERDA.find((m) => m.value === motivo)?.label ?? motivo;
  return `Marcado como perdido · ${rotulo}`;
}
```

Em `packages/lib/src/index.ts`:

```ts
export {
  TIPOS_LINHA_DO_TEMPO,
  type TipoLinhaDoTempo,
  type ItemLinhaDoTempo,
  type EntradaLinhaDoTempo,
  type ReferenciaLinhaDoTempo,
  montarItemLinhaDoTempo,
  tituloTransicao,
  tituloPerda,
} from "./crm/linha-do-tempo";
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/lib test` → PASS (todos, inclusive os antigos — `funil`/`qualificacao` ainda existem nesta task).

- [ ] **Step 5: Commit**

```bash
git add packages/lib/src/crm/linha-do-tempo.ts packages/lib/src/crm/linha-do-tempo.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): montagem pura dos itens da linha do tempo do cliente"
```

---

### Task 4: Coleções novas e campos novos (aditivo) + `payload:generate`

**Files:**
- Create: `apps/cms/src/collections/LinhaDoTempo.ts`, `EnviosEmail.ts`, `ModelosEmail.ts`, `EventosComerciais.ts`
- Modify: `apps/cms/src/collections/Leads.ts`, `ClientesCrm.ts`, `DocumentosComerciais.ts`, `apps/cms/src/payload.config.ts`
- Generated: `packages/types/src/payload-types.ts`

**Interfaces:**
- Produces: slugs `linha-do-tempo`, `envios-email`, `modelos-email`, `eventos-comerciais`; interfaces TS `LinhaDoTempo`, `EnvioEmail`, `ModeloEmail`, `EventoComercial`; campos novos em `Lead` (`estagio`, `perdido`, `motivoPerda`, `perdidoEm`, `detalhePerda`, `cliente`, `clienteCasadoPor`, `responsavel`, `valorEstimado`, `dataPrevistaEvento`, `observacoes`, `origemEntrada`) e em `ClienteCrm` (`contatos[]`, `origem` com valores novos); `DocumentoComercial.evento`, `DocumentoComercial.descricao`.

Esta task é só aditiva (nada é removido) para o typecheck seguir verde; a remoção é a Task 5.

- [ ] **Step 1: Coleção `linha-do-tempo`**

```ts
// apps/cms/src/collections/LinhaDoTempo.ts
import type { Access, CollectionConfig } from "payload";

import { TIPOS_LINHA_DO_TEMPO } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";

/**
 * Linha do tempo do cliente (spec 2026-09-15 §3.7). Append-only: update e
 * delete negados a todo perfil. `create` é negado à UI, exceto para notas
 * manuais (`tipo = nota`) de usuário com acesso ao CRM — os demais tipos são
 * gravados só pela Local API interna (hooks), com overrideAccess padrão.
 */
const criarSoNota: Access = ({ req, data }) => {
  if (data?.tipo !== "nota") return false;
  return atendimentoComercial({ req });
};

export const LinhaDoTempo: CollectionConfig = {
  slug: "linha-do-tempo",
  labels: { singular: "Item da linha do tempo", plural: "Linha do tempo" },
  typescript: { interface: "LinhaDoTempo" },
  admin: { useAsTitle: "titulo", defaultColumns: ["cliente", "tipo", "titulo", "em"], group: "CRM" },
  access: { read: atendimentoComercial, create: criarSoNota, update: () => false, delete: () => false },
  fields: [
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true, index: true },
    { name: "lead", type: "relationship", relationTo: "leads", index: true },
    { name: "tipo", type: "select", options: TIPOS_LINHA_DO_TEMPO, required: true, index: true },
    { name: "titulo", type: "text", required: true },
    { name: "detalhe", type: "textarea" },
    {
      name: "referencia",
      type: "group",
      fields: [
        { name: "colecao", type: "text" },
        { name: "id", type: "text" },
      ],
    },
    { name: "usuario", type: "relationship", relationTo: "users" },
    { name: "em", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
  ],
};
```

- [ ] **Step 2: Coleção `envios-email`**

```ts
// apps/cms/src/collections/EnviosEmail.ts
import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";

export const FINALIDADES_EMAIL = [
  { label: "Proposta", value: "proposta" },
  { label: "Solicitação de documentos", value: "documentos" },
  { label: "Links de inscrição", value: "links-inscricao" },
  { label: "Livre", value: "livre" },
];

/**
 * Log de tudo que saiu por e-mail do CRM (spec §3.6). Append-only; escrita
 * só pela Local API interna (Sessão 3 — e-mail). Nesta sessão a coleção
 * existe para o push de schema ser único.
 */
export const EnviosEmail: CollectionConfig = {
  slug: "envios-email",
  labels: { singular: "Envio de e-mail", plural: "Envios de e-mail" },
  typescript: { interface: "EnvioEmail" },
  admin: { useAsTitle: "assunto", defaultColumns: ["enviadoEm", "cliente", "finalidade", "status"], group: "CRM" },
  access: { read: atendimentoComercial, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: "lead", type: "relationship", relationTo: "leads", index: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", index: true },
    { name: "modelo", type: "relationship", relationTo: "modelos-email" },
    { name: "finalidade", type: "select", options: FINALIDADES_EMAIL, required: true },
    { name: "destinatarios", type: "text", required: true },
    { name: "copia", type: "text" },
    { name: "assunto", type: "text", required: true },
    { name: "corpoRenderizado", type: "textarea", required: true },
    { name: "anexos", type: "relationship", relationTo: "documentos-comerciais", hasMany: true },
    { name: "enviadoPor", type: "relationship", relationTo: "users" },
    { name: "enviadoEm", type: "date", required: true, index: true },
    { name: "idResend", type: "text" },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Enviado", value: "enviado" },
        { label: "Falhou", value: "falhou" },
      ],
      required: true,
    },
    { name: "erro", type: "text" },
  ],
};
```

- [ ] **Step 3: Coleção `modelos-email`**

```ts
// apps/cms/src/collections/ModelosEmail.ts
import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { FINALIDADES_EMAIL } from "./EnviosEmail";

/** Modelos de e-mail com placeholders `{{...}}` (spec §3.5). Editor e envio: Sessão 3. */
export const ModelosEmail: CollectionConfig = {
  slug: "modelos-email",
  labels: { singular: "Modelo de e-mail", plural: "Modelos de e-mail" },
  typescript: { interface: "ModeloEmail" },
  admin: { useAsTitle: "nome", defaultColumns: ["nome", "finalidade", "padrao"], group: "CRM" },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "finalidade", type: "select", options: FINALIDADES_EMAIL, required: true, index: true },
    { name: "padrao", type: "checkbox", defaultValue: false },
    { name: "assunto", type: "text", required: true },
    { name: "corpo", type: "richText", required: true },
    { name: "anexarPdfProposta", type: "checkbox", defaultValue: false },
  ],
};
```

- [ ] **Step 4: Coleção `eventos-comerciais`**

```ts
// apps/cms/src/collections/EventosComerciais.ts
import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Evento comercial (spec §3.4): a turma/entrega contratada por um órgão.
 * NÃO tem relação com a coleção `eventos` (agenda pública do site). A
 * inscrição de participantes é feita em plataforma externa — aqui só os links.
 */
export const EventosComerciais: CollectionConfig = {
  slug: "eventos-comerciais",
  labels: { singular: "Evento comercial", plural: "Eventos comerciais" },
  typescript: { interface: "EventoComercial" },
  admin: { useAsTitle: "titulo", defaultColumns: ["titulo", "cliente", "dataInicio", "status"], group: "CRM" },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "lead", type: "relationship", relationTo: "leads", required: true, index: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true, index: true },
    { name: "proposta", type: "relationship", relationTo: "propostas" },
    { name: "titulo", type: "text", required: true },
    { name: "dataInicio", type: "date", required: true },
    { name: "dataFim", type: "date" },
    {
      name: "modalidade",
      type: "select",
      options: [
        { label: "Presencial", value: "presencial" },
        { label: "Online", value: "online" },
        { label: "Híbrido", value: "hibrido" },
      ],
    },
    { name: "local", type: "text" },
    { name: "moduloCatalogo", type: "relationship", relationTo: "modulos" },
    {
      name: "contratoEmpenho",
      type: "group",
      fields: [
        {
          name: "tipo",
          type: "select",
          options: [
            { label: "Contrato", value: "contrato" },
            { label: "Empenho", value: "empenho" },
            { label: "Termo", value: "termo" },
            { label: "Outro", value: "outro" },
          ],
        },
        { name: "numero", type: "text" },
        { name: "data", type: "date" },
        { name: "valor", type: "number", min: 0 },
        { name: "arquivo", type: "upload", relationTo: "documentos-comerciais" },
      ],
    },
    {
      name: "linksInscricao",
      type: "array",
      fields: [
        { name: "rotulo", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "agendado",
      required: true,
      options: [
        { label: "Agendado", value: "agendado" },
        { label: "Realizado", value: "realizado" },
        { label: "Cancelado", value: "cancelado" },
      ],
    },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 5: Campos novos em `Leads.ts`**

Adicionar ao import de `@ntc/lib` (criar o import se não existir — hoje `Leads.ts` importa só de `../shared/types`):

```ts
import { ESTAGIOS_LEAD, MOTIVOS_PERDA, ORIGENS_ENTRADA_LEAD } from "@ntc/lib";
```

Inserir **logo depois** do campo `observacoesInternas` (linha `{ name: "observacoesInternas", type: "textarea" },`) o bloco:

```ts
    // ---- CRM (spec 2026-09-15 §3.1): o lead é o card do kanban ------------
    {
      name: "estagio",
      type: "select",
      options: ESTAGIOS_LEAD,
      defaultValue: "lead",
      required: true,
      index: true,
      admin: { description: "Coluna do kanban comercial." },
    },
    { name: "perdido", type: "checkbox", defaultValue: false, index: true },
    { name: "motivoPerda", type: "select", options: MOTIVOS_PERDA },
    { name: "perdidoEm", type: "date" },
    { name: "detalhePerda", type: "text" },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", index: true },
    {
      name: "clienteCasadoPor",
      type: "select",
      options: [
        { label: "CNPJ", value: "cnpj" },
        { label: "Domínio do e-mail", value: "dominio" },
        { label: "Nome do órgão", value: "nome" },
        { label: "Cliente criado a partir do lead", value: "criado" },
        { label: "Vínculo manual", value: "manual" },
      ],
    },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "valorEstimado", type: "number", min: 0 },
    { name: "dataPrevistaEvento", type: "date" },
    { name: "observacoes", type: "textarea" },
    {
      name: "origemEntrada",
      type: "select",
      options: ORIGENS_ENTRADA_LEAD,
      defaultValue: "site",
      required: true,
    },
```

- [ ] **Step 6: Campos novos em `ClientesCrm.ts`**

Trocar o import de `ORIGENS_CRM` por `ORIGENS_CLIENTE` (de `@ntc/lib`) e substituir a linha `{ name: "origem", type: "select", options: ORIGENS_CRM },` por:

```ts
    { name: "origem", type: "select", options: ORIGENS_CLIENTE, defaultValue: "manual" },
    {
      name: "contatos",
      type: "array",
      admin: { description: "Pessoas do órgão. No máximo um contato principal." },
      fields: [
        { name: "nome", type: "text", required: true },
        { name: "cargo", type: "text" },
        { name: "setor", type: "text" },
        { name: "email", type: "email" },
        { name: "whatsapp", type: "text" },
        { name: "principal", type: "checkbox", defaultValue: false },
        { name: "decisor", type: "checkbox", defaultValue: false },
      ],
    },
```

E acrescentar o hook que garante um único `principal` (abaixo de `access`):

```ts
  hooks: {
    beforeChange: [
      ({ data }) => {
        const contatos = Array.isArray(data?.contatos) ? data.contatos : [];
        const principais = contatos.filter((c: { principal?: boolean }) => c?.principal === true);
        if (principais.length > 1) {
          throw new Error("Só um contato pode ser o principal.");
        }
        return data;
      },
    ],
  },
```

(A tipagem de `data` no hook é `Partial<ClienteCrm>`; `contatos` já vem tipado depois do `payload:generate` — se o typecheck reclamar do `c: { principal?: boolean }`, remover a anotação e deixar inferir.)

- [ ] **Step 7: `DocumentosComerciais.ts`**

Trocar `fields: [{ name: "alt", type: "text" }],` por:

```ts
  fields: [
    { name: "alt", type: "text" },
    { name: "descricao", type: "text" },
    { name: "evento", type: "relationship", relationTo: "eventos-comerciais", index: true },
  ],
```

- [ ] **Step 8: Registrar no `payload.config.ts`**

Imports (ordem alfabética junto dos existentes):

```ts
import { EnviosEmail } from "./collections/EnviosEmail";
import { EventosComerciais } from "./collections/EventosComerciais";
import { LinhaDoTempo } from "./collections/LinhaDoTempo";
import { ModelosEmail } from "./collections/ModelosEmail";
```

No array `collections`, inserir após `DocumentosComerciais,`:

```ts
    EventosComerciais,
    ModelosEmail,
    EnviosEmail,
    LinhaDoTempo,
```

- [ ] **Step 9: Gerar tipos e validar**

Run: `pnpm --filter @ntc/cms payload:generate` → `packages/types/src/payload-types.ts` ganha `LinhaDoTempo`, `EnvioEmail`, `ModeloEmail`, `EventoComercial` e os campos novos de `Lead`/`ClienteCrm`.
Run: `pnpm typecheck && pnpm lint && pnpm test` → tudo verde (nada foi removido ainda).

- [ ] **Step 10: Commit**

```bash
git add apps/cms/src/collections apps/cms/src/payload.config.ts packages/types/src/payload-types.ts
git commit -m "feat(crm): coleções linha-do-tempo, envios-email, modelos-email, eventos-comerciais e campos do kanban em leads/clientes"
```

---

### Task 5: Cut-over — remover o P0/oportunidades/contatos e compilar de novo

Esta task apaga o que morre e faz a **adaptação mínima** para `lint`/`typecheck`/`test` voltarem a ficar verdes. Telas novas (kanban, modal, cliente como ativo) vêm nas Tasks 9–11; aqui as telas remanescentes só deixam de referenciar o que sumiu. No fim desta task o CRM abre com Dashboard (só KPIs), Leads (lista simples), Clientes, Propostas, Envios e Catálogo.

**Files:**
- Delete (`git rm`): `packages/lib/src/crm/funil.ts`, `funil.test.ts`, `qualificacao.ts`, `qualificacao.test.ts`; `apps/cms/src/collections/Oportunidades.ts`, `HistoricoEstagio.ts`, `AvaliacoesQualificacao.ts`, `ContatosCrm.ts`; `apps/cms/src/lib/crm/gateQualificada.ts`, `gateQualificada.test.ts`, `vigenciaAvaliacao.ts`, `vigenciaAvaliacao.test.ts`, `derivadosAvaliacao.ts`, `derivadosAvaliacao.test.ts`, `espelhoStatusLegado.ts`, `espelhoStatusLegado.test.ts`, `situacaoOportunidade.ts`, `historicoEstagio.ts`, `historicoEstagio.test.ts`, `importadorCrm.ts`, `importadorCrm.test.ts`; `apps/cms/src/lib/cms/painelCrmEscrita.avaliacao.test.ts`; `apps/cms/src/seed/importarCrm.ts`, `migrarOportunidadesP0.ts`; `apps/cms/src/app/(painel)/crm/TelaOportunidades.tsx`, `FormOportunidade.tsx`, `DetalheOportunidade.tsx`, `TelaFollowups.tsx`, `TelaQualificacao.tsx`, `FormAvaliacao.tsx`, `TelaContatos.tsx`, `FormContato.tsx`, `TelaVersoes.tsx`, `TelaEmBreve.tsx`, `GraficosComercial.tsx`.
- Modify: `packages/lib/src/crm/listas.ts`, `packages/lib/src/index.ts`, `apps/cms/src/shared/types.ts`, `apps/cms/src/collections/Leads.ts`, `ClientesCrm.ts`, `Propostas.ts`, `apps/cms/src/payload.config.ts`, `apps/cms/package.json`, `apps/web/app/api/forms/{proposta,contato,newsletter,candidatura-especialista}/route.ts`, `apps/cms/src/lib/cms/painelCms.ts`, `painelCrm.ts`, `painelCrmEscrita.ts`, `kpisComercial.ts`, `kpisComercial.test.ts`, `apps/cms/src/lib/crm/listas.test.ts` (se citar listas removidas), `apps/cms/src/app/(painel)/TelaDashboard.tsx`, `TelaLeads.tsx`, `DetalheLead.tsx`, `acoesCrm.ts`, `acoesCrm.test.ts`, `crm/ShellCrm.tsx`, `crm/page.tsx`, `crm/TelaPainelComercial.tsx`, `crm/seloStatus.ts`, `crm/TelaClientes.tsx`, `crm/DetalheCliente.tsx`, `crm/FormCliente.tsx`, `crm/FormProposta.tsx`.

**Interfaces:**
- Produces (em `painelCrm.ts`): `LeadCrmResumo`, `listarLeadsCrm()`, `ContatoResumo`, `ClienteCrmResumo` (novo formato), `ClienteCrmDetalhe` (novo formato), `PropostaDetalhe.leadId`; (em `painelCrmEscrita.ts`): `DadosClienteCrm` (novo formato, com `contatos`), `DadosContato`, `DadosProposta.lead`; (em `kpisComercial.ts`): `calcularKpisComercial(leads, hojeISO)`, `KpisComercial { leadsNovos30d, negociosAtivos, valorEmNegociacao, eventosAgendados }`.

- [ ] **Step 1: Apagar arquivos e scripts**

```bash
git rm packages/lib/src/crm/funil.ts packages/lib/src/crm/funil.test.ts packages/lib/src/crm/qualificacao.ts packages/lib/src/crm/qualificacao.test.ts
git rm apps/cms/src/collections/Oportunidades.ts apps/cms/src/collections/HistoricoEstagio.ts apps/cms/src/collections/AvaliacoesQualificacao.ts apps/cms/src/collections/ContatosCrm.ts
git rm apps/cms/src/lib/crm/gateQualificada.ts apps/cms/src/lib/crm/gateQualificada.test.ts apps/cms/src/lib/crm/vigenciaAvaliacao.ts apps/cms/src/lib/crm/vigenciaAvaliacao.test.ts apps/cms/src/lib/crm/derivadosAvaliacao.ts apps/cms/src/lib/crm/derivadosAvaliacao.test.ts apps/cms/src/lib/crm/espelhoStatusLegado.ts apps/cms/src/lib/crm/espelhoStatusLegado.test.ts apps/cms/src/lib/crm/situacaoOportunidade.ts apps/cms/src/lib/crm/historicoEstagio.ts apps/cms/src/lib/crm/historicoEstagio.test.ts apps/cms/src/lib/crm/importadorCrm.ts apps/cms/src/lib/crm/importadorCrm.test.ts
git rm apps/cms/src/lib/cms/painelCrmEscrita.avaliacao.test.ts apps/cms/src/seed/importarCrm.ts apps/cms/src/seed/migrarOportunidadesP0.ts
cd "apps/cms/src/app/(painel)/crm" && git rm TelaOportunidades.tsx FormOportunidade.tsx DetalheOportunidade.tsx TelaFollowups.tsx TelaQualificacao.tsx FormAvaliacao.tsx TelaContatos.tsx FormContato.tsx TelaVersoes.tsx TelaEmBreve.tsx GraficosComercial.tsx && cd -
```

Em `apps/cms/package.json` remover as linhas `"crm:importar"` e `"crm:migrar-p0"`.

- [ ] **Step 2: `@ntc/lib` — listas e index**

`packages/lib/src/crm/listas.ts`: remover `STATUS_CLIENTE_CRM`, `STATUS_OPORTUNIDADE`, `STATUS_OPORTUNIDADE_FECHADA` e `ORIGENS_CRM` (o cliente agora usa `ORIGENS_CLIENTE`). Manter `UFS`, `AREAS_CRM`, `ESFERAS_CRM`, `TIPOS_INSTITUICAO`, `TIPOS_PROPOSTA`, `STATUS_PROPOSTA`, `CANAIS_ENVIO`, `STATUS_ENVIO`.

`packages/lib/src/index.ts`: apagar os quatro nomes do bloco `./crm/listas` e apagar inteiros os blocos `export { ... } from "./crm/funil"` e `export { ... } from "./crm/qualificacao"`.

`apps/cms/src/lib/crm/listas.test.ts`: se algum `it` importar as listas removidas, apagar só esses casos.

- [ ] **Step 3: Coleções — remover campos e o slug morto**

`apps/cms/src/shared/types.ts`: apagar `LEAD_STATUS` e `LeadStatus`.

`apps/cms/src/collections/Leads.ts`: apagar o campo `status` (bloco `{ name: "status", type: "select", options: LEAD_STATUS..., required: true }`) e tirar `LEAD_STATUS` do import.

`apps/cms/src/collections/ClientesCrm.ts`: apagar os campos `dirigente`, `cargoDirigente`, `potencial`, `status`, `proximaAcao`; tirar `STATUS_CLIENTE_CRM` do import; `defaultColumns: ["orgao", "uf", "esfera", "responsavel"]`.

`apps/cms/src/collections/Propostas.ts`: substituir `{ name: "oportunidade", type: "relationship", relationTo: "oportunidades" },` por `{ name: "lead", type: "relationship", relationTo: "leads", required: true, index: true },`.

`apps/cms/src/payload.config.ts`: apagar os imports e as entradas `ContatosCrm`, `Oportunidades`, `HistoricoEstagio`, `AvaliacoesQualificacao`.

- [ ] **Step 4: `apps/web` — handlers sem `status`**

Nos 4 arquivos `apps/web/app/api/forms/*/route.ts`, apagar a linha `status: "novo",` dentro do `payload.create({ ... data: { ... } })`. Nenhuma outra mudança no `apps/web`.

- [ ] **Step 5: Gerar tipos**

Run: `pnpm --filter @ntc/cms payload:generate`. A partir daqui o typecheck aponta todo consumidor morto — os passos seguintes fecham um a um.

- [ ] **Step 6: `painelCms.ts` (módulo Site) sem `status` de lead**

Em `LeadCmsResumo`/`LeadCmsDetalhe`: apagar `status: string;`. Em `listarLeadsCms` e `obterLeadCms`: apagar `status` do tipo interno e do objeto devolvido.

`apps/cms/src/app/(painel)/TelaDashboard.tsx`: trocar

```ts
const leadsNovos = leads.filter((l) => l.status === "novo").length;
```
por
```ts
const limite = Date.now() - 30 * 86_400_000;
const leadsNovos = leads.filter((l) => Date.parse(l.dataISO) >= limite).length;
```
e o rótulo do card para `"Leads (30 dias)"`.

- [ ] **Step 7: `painelCrm.ts` — tipos e leitores novos**

Apagar: `ContatoCrmResumo`, `OportunidadeCrmResumo`, `OportunidadeCrmDetalhe`, `mapearContato`, `mapearOportunidadeResumo`, `listarContatosCrm`, `listarOportunidadesCrm`, `obterOportunidadeCrm`, `TransicaoEstagioResumo`, `listarHistoricoEstagio`, `AvaliacaoResumo`, `AvaliacaoDetalhe`, `listarAvaliacoesCrm`, `obterAvaliacaoCrm`, e os imports `AvaliacaoQualificacao`, `ContatoCrm`, `Oportunidade`. Acrescentar `Lead` ao import de `@ntc/types`.

Substituir `ClienteCrmResumo`, `ClienteCrmDetalhe`, `mapearClienteResumo`, `obterClienteCrm` por:

```ts
export interface ContatoResumo {
  nome: string;
  cargo: string | null;
  setor: string | null;
  email: string | null;
  whatsapp: string | null;
  principal: boolean;
  decisor: boolean;
}

export interface ClienteCrmResumo {
  id: string;
  orgao: string;
  sigla: string | null;
  municipio: string | null;
  uf: string | null;
  esfera: string | null;
  area: string | null;
  origem: string | null;
  responsavelNome: string | null;
  contatoPrincipal: string | null;
}

export interface ClienteCrmDetalhe extends ClienteCrmResumo {
  tipo: string | null;
  cnpj: string | null;
  email: string | null;
  observacoes: string | null;
  responsavelId: string | null;
  contatos: ContatoResumo[];
}

function mapearContatos(doc: ClienteCrm): ContatoResumo[] {
  return (doc.contatos ?? []).map((c) => ({
    nome: c.nome,
    cargo: c.cargo ?? null,
    setor: c.setor ?? null,
    email: c.email ?? null,
    whatsapp: c.whatsapp ?? null,
    principal: c.principal ?? false,
    decisor: c.decisor ?? false,
  }));
}

function mapearClienteResumo(doc: ClienteCrm): ClienteCrmResumo {
  const contatos = mapearContatos(doc);
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    municipio: doc.municipio ?? null,
    uf: doc.uf ?? null,
    esfera: doc.esfera ?? null,
    area: doc.area ?? null,
    origem: doc.origem ?? null,
    responsavelNome: campoRel(doc.responsavel, "nome"),
    contatoPrincipal: (contatos.find((c) => c.principal) ?? contatos[0])?.nome ?? null,
  };
}

export async function obterClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: ClienteCrm;
  try {
    doc = await payload.findByID({ collection: "clientes-crm", id, depth: 1 });
  } catch {
    return null;
  }
  return {
    ...mapearClienteResumo(doc),
    tipo: doc.tipo ?? null,
    cnpj: doc.cnpj ?? null,
    email: doc.email ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
    contatos: mapearContatos(doc),
  };
}
```

Acrescentar o resumo do lead do CRM e o leitor (usado pelo Dashboard, por Leads e pelo `FormProposta`):

```ts
export interface LeadCrmResumo {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  cargo: string | null;
  programaSigla: string | null;
  participantesEstimados: number | null;
  estagio: string;
  perdido: boolean;
  motivoPerda: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  valorEstimado: number | null;
  origemEntrada: string;
  /** ISO de createdAt. */
  criadoEmISO: string;
  /** ISO de updatedAt — proxy de "dias na coluna" até a Sessão 5 gravar por transição. */
  atualizadoEmISO: string;
}

export function mapearLeadCrm(doc: Lead): LeadCrmResumo {
  return {
    id: String(doc.id),
    nome: doc.nome,
    email: doc.email,
    instituicao: doc.instituicao ?? "—",
    cargo: doc.cargo ?? null,
    programaSigla: campoRel(doc.detalhesProposta?.programa, "sigla"),
    participantesEstimados: doc.detalhesProposta?.participantesEstimados ?? null,
    estagio: doc.estagio ?? "lead",
    perdido: doc.perdido === true,
    motivoPerda: doc.motivoPerda ?? null,
    clienteId: idRel(doc.cliente),
    clienteNome: campoRel(doc.cliente, "orgao"),
    responsavelId: idRel(doc.responsavel),
    responsavelNome: campoRel(doc.responsavel, "nome"),
    valorEstimado: doc.valorEstimado ?? null,
    origemEntrada: doc.origemEntrada ?? "site",
    criadoEmISO: doc.createdAt,
    atualizadoEmISO: doc.updatedAt,
  };
}

/** Só os leads do CRM: `tipo = proposta` (site e manuais). */
export async function listarLeadsCrm(): Promise<LeadCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "leads",
    depth: 1,
    limit: 500,
    sort: "-createdAt",
    where: { tipo: { equals: "proposta" } },
  });
  return res.docs.map(mapearLeadCrm);
}
```

Em `PropostaDetalhe`: renomear `oportunidadeId` → `leadId`; em `obterPropostaCrm`: `leadId: idRel(doc.lead),`. Em `PropostaResumo` acrescentar `leadId: string | null` e preencher com `idRel(doc.lead)` no mapper de resumo.

- [ ] **Step 8: `painelCrmEscrita.ts` — escrita sem oportunidade/contato/avaliação**

Apagar: `DadosContatoCrm`, `dadosContato`, `criarContatoCrm`, `atualizarContatoCrm`, `DadosOportunidade`, `validarObrigatoriosOportunidade`, `dadosOportunidade`, `criarOportunidade`, `atualizarOportunidade`, `gerarCodigoOportunidade`, `proximaSequencia` (se só a oportunidade usar — conferir com grep), `DadosAvaliacao`, `numeroDeNota`, `validarObrigatoriosAvaliacao`, `dadosAvaliacao`, `criarAvaliacao`, `atualizarAvaliacao`, os `type ... = RequiredDataFromCollectionSlug<"oportunidades"|"contatos-crm"|"avaliacoes-qualificacao">`, e os imports `DIMENSOES_COM04`, `notaValida`, `ErroGateQualificada`, `UsuarioAutenticado` (se ficar sem uso).

Substituir `DadosClienteCrm` e `dadosCliente` por:

```ts
export interface DadosContato {
  nome: string;
  cargo: string;
  setor: string;
  email: string;
  whatsapp: string;
  principal: boolean;
  decisor: boolean;
}

export interface DadosClienteCrm {
  orgao: string;
  sigla: string;
  tipo: string;
  municipio: string;
  uf: string;
  esfera: string;
  area: string;
  cnpj: string;
  email: string;
  origem: string;
  responsavel: string;
  observacoes: string;
  contatos: DadosContato[];
}

function dadosCliente(dados: DadosClienteCrm): ClienteCrmData {
  return {
    orgao: dados.orgao.trim(),
    sigla: ouNulo(dados.sigla),
    tipo: ouNulo(dados.tipo) as ClienteCrmData["tipo"],
    municipio: ouNulo(dados.municipio),
    uf: ouNulo(dados.uf) as ClienteCrmData["uf"],
    esfera: ouNulo(dados.esfera) as ClienteCrmData["esfera"],
    area: ouNulo(dados.area) as ClienteCrmData["area"],
    cnpj: ouNulo(dados.cnpj),
    email: ouNulo(dados.email),
    origem: (ouNulo(dados.origem) ?? "manual") as ClienteCrmData["origem"],
    responsavel: idOuNulo(dados.responsavel),
    observacoes: ouNulo(dados.observacoes),
    contatos: dados.contatos
      .filter((c) => c.nome.trim() !== "")
      .map((c) => ({
        nome: c.nome.trim(),
        cargo: ouNulo(c.cargo),
        setor: ouNulo(c.setor),
        email: ouNulo(c.email),
        whatsapp: ouNulo(c.whatsapp),
        principal: c.principal,
        decisor: c.decisor,
      })),
  };
}
```

`criarClienteCrm`/`atualizarClienteCrm`: acrescentar, antes do `try`, a validação `if (dados.contatos.filter((c) => c.principal).length > 1) return { ok: false, erro: "Só um contato pode ser o principal." };` — a mesma regra do hook, aqui para a mensagem chegar ao formulário sem virar erro genérico.

`DadosProposta`: `oportunidade: string` → `lead: string`. `dadosProposta`: `oportunidade: idOuNulo(dados.oportunidade),` → `lead: leadId,` com a assinatura ganhando `leadId: number` como 3º parâmetro (`dadosProposta(dados, clienteId, leadId, ids)`). `criarProposta` e `atualizarProposta`: resolver `const leadId = idOuNulo(dados.lead); if (leadId === null) return { ok: false, erro: "Selecione o lead." };` antes do cliente. `criarVersaoProposta`: `oportunidade: vigente.oportunidade,` → `lead: vigente.lead,`.

- [ ] **Step 9: `kpisComercial.ts` sobre leads**

Substituir o arquivo inteiro:

```ts
import type { LeadCrmResumo } from "./painelCrm";

/** Cálculos puros do Dashboard comercial (spec 2026-09-15 §4.2). Sem I/O. */

export interface KpisComercial {
  leadsNovos30d: number;
  negociosAtivos: number;
  valorEmNegociacao: number;
  eventosAgendados: number;
}

const MS_30_DIAS = 30 * 86_400_000;

/** Ativo = não perdido e ainda não realizado. */
export const leadAtivo = (l: LeadCrmResumo): boolean => !l.perdido && l.estagio !== "evento-realizado";

export function calcularKpisComercial(leads: LeadCrmResumo[], hojeISO: string): KpisComercial {
  const limite = Date.parse(hojeISO) - MS_30_DIAS;
  const ativos = leads.filter(leadAtivo);
  return {
    leadsNovos30d: leads.filter((l) => Date.parse(l.criadoEmISO) >= limite).length,
    negociosAtivos: ativos.length,
    valorEmNegociacao: ativos.reduce((soma, l) => soma + (l.valorEstimado ?? 0), 0),
    eventosAgendados: ativos.filter((l) => l.estagio === "evento-agendado").length,
  };
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}
```

(`valorEmNegociacao` usa só `valorEstimado` nesta sessão; a Sessão 2 soma o `valorLiquido` da proposta vigente quando existir, como o spec pede.)

Reescrever `kpisComercial.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { calcularKpisComercial, formatarMoedaBRL, leadAtivo } from "./kpisComercial";
import type { LeadCrmResumo } from "./painelCrm";

const base: LeadCrmResumo = {
  id: "1", nome: "Ana", email: "ana@x.gov.br", instituicao: "SME", cargo: null, programaSigla: "EDUTEC",
  participantesEstimados: 40, estagio: "em-contato", perdido: false, motivoPerda: null, clienteId: "1",
  clienteNome: "SME", responsavelId: null, responsavelNome: null, valorEstimado: 10000,
  origemEntrada: "site", criadoEmISO: "2026-09-10T00:00:00.000Z", atualizadoEmISO: "2026-09-10T00:00:00.000Z",
};
const hoje = "2026-09-16T12:00:00.000Z";

describe("calcularKpisComercial", () => {
  it("conta leads dos últimos 30 dias, ativos, valor e eventos agendados", () => {
    const leads: LeadCrmResumo[] = [
      base,
      { ...base, id: "2", criadoEmISO: "2026-07-01T00:00:00.000Z", estagio: "evento-agendado", valorEstimado: 5000 },
      { ...base, id: "3", perdido: true, valorEstimado: 99999 },
      { ...base, id: "4", estagio: "evento-realizado", valorEstimado: 77777 },
    ];
    expect(calcularKpisComercial(leads, hoje)).toEqual({
      leadsNovos30d: 3,
      negociosAtivos: 2,
      valorEmNegociacao: 15000,
      eventosAgendados: 1,
    });
  });

  it("lista vazia zera tudo", () => {
    expect(calcularKpisComercial([], hoje)).toEqual({ leadsNovos30d: 0, negociosAtivos: 0, valorEmNegociacao: 0, eventosAgendados: 0 });
  });
});

describe("leadAtivo", () => {
  it("perdido e realizado não são ativos", () => {
    expect(leadAtivo(base)).toBe(true);
    expect(leadAtivo({ ...base, perdido: true })).toBe(false);
    expect(leadAtivo({ ...base, estagio: "evento-realizado" })).toBe(false);
  });
});

describe("formatarMoedaBRL", () => {
  it("formata em real", () => {
    expect(formatarMoedaBRL(1234.5).replace(/ /g, " ")).toBe("R$ 1.234,50");
  });
});
```

- [ ] **Step 10: `acoesCrm.ts` e `acoesCrm.test.ts`**

Apagar `carregarOportunidadeCrm`, `carregarHistoricoOportunidade`, `salvarContatoCrm`, `salvarOportunidadeCrm`, `carregarAvaliacaoCrm`, `salvarAvaliacaoCrm` e os imports que ficarem sem uso. O `acoesCrm.test.ts` testava `salvarOportunidadeCrm`; reescrever para cobrir `salvarClienteCrm` com o mesmo mock (troque `salvarOportunidadeCrm` por `salvarClienteCrm`, `dadosBase` por um `DadosClienteCrm` mínimo `{ orgao: "SME", ..., contatos: [] }` e a asserção para `create` ter sido chamado com `collection: "clientes-crm"`; o caso "sem sessão devolve RECUSADO" continua igual).

- [ ] **Step 11: Telas — adaptação mínima**

`seloStatus.ts`: apagar `SELO_OPORTUNIDADE`, `SELO_CLIENTE`, `SELO_ESTAGIO`, `SELO_SITUACAO`, `SELO_RESULTADO`, `SELO_FAIXA` e os exports correspondentes; manter `SELO_PROPOSTA`, `SELO_ENVIO`, `seloDeProposta`, `seloDeEnvio`, `rotuloDeLista`. Acrescentar:

```ts
/** Estágio do lead: neutro no início, atenção na proposta, ok do evento em diante. */
const SELO_ESTAGIO_LEAD: Record<string, string> = {
  lead: "info",
  oportunidade: "info",
  "em-contato": "info",
  "proposta-em-producao": "atencao",
  "proposta-enviada": "atencao",
  "proposta-aceita": "ok",
  "evento-agendado": "ok",
  "contrato-recebido": "ok",
  "links-enviados": "ok",
  "evento-realizado": "ok",
};
export const seloDeEstagioLead = (estagio: string): string =>
  `pcms-selo pcms-selo--${SELO_ESTAGIO_LEAD[estagio] ?? "info"}`;
```

`TelaClientes.tsx`: colunas `Órgão · UF · Esfera · Contato principal · Origem · Responsável`; remover `formatarMoedaBRL`, `STATUS_CLIENTE_CRM`, `seloDeCliente`; usar `rotuloDeLista(ESFERAS_CRM, c.esfera)` e `rotuloDeLista(ORIGENS_CLIENTE, c.origem)`.

`DetalheCliente.tsx`: props ficam `{ cliente, onVoltar, onEditar }`; remover os blocos de oportunidades e o botão de contato; a lista `dados` fica com Órgão, Sigla, Tipo, Município, Esfera, Área, CNPJ, E-mail, Origem, Responsável; a seção "Contatos" lê `c.contatos` (array) numa `pcms-tabela` com Nome · Cargo · Setor · E-mail · WhatsApp · selos "Principal"/"Decisor". (A Task 11 reescreve esta tela como ativo; aqui só compila.)

`FormCliente.tsx`: estado `DadosClienteCrm` novo (sem `dirigente`, `cargoDirigente`, `potencial`, `status`, `proximaAcao`; com `contatos: inicial?.contatos.map(...) ?? []`); remover os campos correspondentes do JSX e trocar `ORIGENS_CRM` por `ORIGENS_CLIENTE`. Os contatos ainda não são editáveis aqui (Task 11 traz o `EditorContatos`); o form só preserva o array que veio.

`FormProposta.tsx`: prop `oportunidades: OportunidadeCrmResumo[]` → `leads: LeadCrmResumo[]`; estado `oportunidade` → `lead: inicial?.leadId ?? ""`; `selecionarOportunidade` → `selecionarLead(id)` que faz `setDados((d) => ({ ...d, lead: id, cliente: l.clienteId ?? d.cliente, programa: catalogo.programas.find((p) => p.sigla === l.programaSigla)?.id ?? d.programa }))`; o `CampoSelect` vira `rotulo="Lead" obrigatorio` com `opcoes={leads.map((l) => ({ label: `${l.instituicao} — ${l.nome}`, value: l.id }))}`.

`TelaLeads.tsx` (ainda o antigo, em `(painel)/`): prop `leads: LeadCrmResumo[]`; remover os chips de tipo e `ROTULO_STATUS`; colunas `Órgão · Contato · Programa · Estágio · Recebido`; estágio com `seloDeEstagioLead(l.estagio)` + `rotuloDoEstagio(l.estagio)` (de `@ntc/lib`); data com `new Date(l.criadoEmISO).toLocaleDateString("pt-BR")`; "Perdido" como selo `pcms-selo--erro` quando `l.perdido`. Importar `seloDeEstagioLead` de `./crm/seloStatus`.

`DetalheLead.tsx`: apagar `ROTULO_STATUS` e o `<span>` de status no cabeçalho.

`TelaPainelComercial.tsx`: props `{ leads: LeadCrmResumo[]; hojeISO; erroLeitura }`; `const kpis = calcularKpisComercial(leads, hojeISO)`; cards `Leads (30 dias)` · `Negócios ativos` · `Valor em negociação` · `Eventos agendados`; abaixo dos cards, temporariamente `<div className="pcms-vazio">Quadro kanban — Task 9.</div>` (substituído na Task 9). Remover imports de gráficos, follow-ups e `ESTAGIO_OPORTUNIDADE`.

`ShellCrm.tsx`:
- `TelaCrmId = "painel" | "leads" | "clientes" | "propostas" | "envios" | "programas" | "modulos" | "produtos"`.
- `FormCrmAberto = { entidade: "cliente"; inicial: ClienteCrmDetalhe | null } | { entidade: "proposta"; inicial: PropostaDetalhe | null }`.
- Props: apagar `contatos`, `oportunidades`, `versoes`, `avaliacoes`; `leads: LeadCrmResumo[]`.
- Nav: `NAV_COMERCIAL = [painel "Dashboard", leads "Leads", clientes "Clientes", propostas "Propostas", envios "Envios"]`, `NAV_CATALOGO` igual; `grupos = [{ rotulo: "Comercial", itens: NAV_COMERCIAL }, { rotulo: "Catálogo Institucional", itens: NAV_CATALOGO }]`; `CRUMB` só com as 8 telas; apagar os ícones sem uso (`contatos`, `oportunidades`, `versoes`, `followups`, `condicoes`, `qualificacao`).
- Estado: apagar `oportunidadeDet`, `historicoOportunidade`, `abrirOportunidade`, `abrirAvaliacao` e os ramos de render de `contato`, `oportunidade`, `avaliacao`, `oportunidadeDet`, `contatos`, `oportunidades`, `followups`, `versoes`, `condicoes`, `qualificacao`. `DetalheCliente` recebe só `cliente/onVoltar/onEditar`. `FormProposta` recebe `leads={leads}` no lugar de `oportunidades`. `TelaPainelComercial` recebe `leads`, `hojeISO`, `erroLeitura`.

`page.tsx`: apagar `listarContatosCrm`, `listarOportunidadesCrm`, `listarAvaliacoesCrm`, `versoesDeProposta`, `listarLeadsCms` e os tipos; `leads` passa a vir de `listarLeadsCrm()` (`LeadCrmResumo[]`); apagar o bloco de `versoes`; `ShellCrm` sem `contatos`/`oportunidades`/`versoes`/`avaliacoes`.

- [ ] **Step 12: Verificar**

Run: `pnpm --filter @ntc/cms payload:generate` (de novo, agora com os campos removidos) e depois `pnpm lint && pnpm typecheck && pnpm test`. Esperado: tudo verde; `grep -rn "oportunidades\|contatos-crm\|historico-estagio\|avaliacoes-qualificacao\|LEAD_STATUS\|ESTAGIO_OPORTUNIDADE" apps/cms/src packages/lib/src apps/web/app/api` devolve **zero** linhas (fora comentários de `docs/`).

Subir o dev (`pnpm dev:cms`) e abrir `/crm`: Dashboard com 4 KPIs, Leads listando só os 4 de `tipo = proposta`, Clientes vazio, Propostas vazio, Envios vazio, Catálogo. Sem erro no console. **Nota:** enquanto o `push:schema` não roda, o banco não tem as colunas novas — a leitura de `leads` pode falhar com "column estagio does not exist". Isso é esperado nesta fase; o roteiro de validação com banco é a Task 12. Se quiser validar antes, o PO pode rodar o push já nesta task (o diff será o mesmo).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "refactor(crm): remove oportunidades, contatos-crm e o processo P0; lead vira o card e proposta aponta para lead"
```

---

### Task 6: Helper da linha do tempo + hook do lead (transição, perda, reabertura, vínculo)

**Files:**
- Create: `apps/cms/src/lib/crm/linhaDoTempo.ts`
- Test: `apps/cms/src/lib/crm/linhaDoTempo.test.ts`
- Modify: `apps/cms/src/collections/Leads.ts` (hook `afterChange`)

**Interfaces:**
- Consumes: `montarItemLinhaDoTempo`, `tituloTransicao`, `tituloPerda`, `ehEstagioLead`, `type EntradaLinhaDoTempo` de `@ntc/lib`; tipo `Lead` de `@ntc/types`.
- Produces:
  ```ts
  function registrarNaLinhaDoTempo(req: PayloadRequest, entrada: EntradaLinhaDoTempo): Promise<void>
  function entradasDoLead(p: { operation: "create" | "update"; doc: Lead; previousDoc?: Lead; usuarioId: number | null; casamentoAutomatico: string | null }): EntradaLinhaDoTempo[]   // pura
  const registrarLeadNaLinhaDoTempo: CollectionAfterChangeHook<Lead>
  ```
  e a chave de contexto `context.casamentoAutomatico` (string com o motivo) que a Task 7 preenche.

- [ ] **Step 1: Teste da regra pura `entradasDoLead`**

```ts
// apps/cms/src/lib/crm/linhaDoTempo.test.ts
import { describe, expect, it } from "vitest";
import type { Lead } from "@ntc/types";

import { entradasDoLead } from "./linhaDoTempo";

const lead = {
  id: 7,
  tipo: "proposta",
  nome: "Ana",
  email: "ana@x.gov.br",
  instituicao: "SME",
  estagio: "lead",
  perdido: false,
  cliente: 3,
  origemEntrada: "site",
  consentimentoLgpd: { aceito: true },
  createdAt: "2026-09-16T00:00:00.000Z",
  updatedAt: "2026-09-16T00:00:00.000Z",
} as unknown as Lead;

const base = { usuarioId: 5, casamentoAutomatico: null };

describe("entradasDoLead", () => {
  it("lead manual criado já com cliente gera item 'lead'", () => {
    const itens = entradasDoLead({ ...base, operation: "create", doc: { ...lead, origemEntrada: "manual" } });
    expect(itens).toEqual([
      expect.objectContaining({ clienteId: 3, leadId: 7, tipo: "lead", titulo: "Lead criado manualmente", usuarioId: 5 }),
    ]);
  });

  it("lead do site criado sem cliente não gera nada (o casamento vem depois)", () => {
    expect(entradasDoLead({ ...base, operation: "create", doc: { ...lead, cliente: null } })).toEqual([]);
  });

  it("vínculo feito pelo casamento automático gera 'lead' com o motivo", () => {
    const itens = entradasDoLead({
      ...base,
      usuarioId: null,
      casamentoAutomatico: "dominio",
      operation: "update",
      doc: lead,
      previousDoc: { ...lead, cliente: null },
    });
    expect(itens).toEqual([
      expect.objectContaining({ tipo: "lead", titulo: "Lead recebido pelo site", detalhe: "Vinculado ao cliente por domínio do e-mail" }),
    ]);
  });

  it("cliente criado a partir do lead diz isso no detalhe", () => {
    const itens = entradasDoLead({
      ...base, usuarioId: null, casamentoAutomatico: "criado", operation: "update", doc: lead, previousDoc: { ...lead, cliente: null },
    });
    expect(itens[0]).toMatchObject({ detalhe: "Cliente criado a partir do lead" });
  });

  it("troca manual de cliente gera 'vinculo'", () => {
    const itens = entradasDoLead({ ...base, operation: "update", doc: { ...lead, cliente: 9 }, previousDoc: lead });
    expect(itens).toEqual([expect.objectContaining({ clienteId: 9, tipo: "vinculo", titulo: "Lead vinculado a este cliente" })]);
  });

  it("mudança de estágio gera 'transicao' com o título de→para", () => {
    const itens = entradasDoLead({ ...base, operation: "update", doc: { ...lead, estagio: "em-contato" }, previousDoc: { ...lead, estagio: "oportunidade" } });
    expect(itens).toEqual([expect.objectContaining({ tipo: "transicao", titulo: "Oportunidade → Em contato", referencia: { colecao: "leads", id: "7" } })]);
  });

  it("perda e reabertura", () => {
    const perda = entradasDoLead({ ...base, operation: "update", doc: { ...lead, perdido: true, motivoPerda: "recusou", detalhePerda: "preço" }, previousDoc: lead });
    expect(perda).toEqual([expect.objectContaining({ tipo: "perda", titulo: "Marcado como perdido · Recusou a proposta", detalhe: "preço" })]);
    const reab = entradasDoLead({ ...base, operation: "update", doc: lead, previousDoc: { ...lead, perdido: true } });
    expect(reab).toEqual([expect.objectContaining({ tipo: "reabertura", titulo: "Reaberto em Lead" })]);
  });

  it("update sem mudança relevante não gera nada", () => {
    expect(entradasDoLead({ ...base, operation: "update", doc: { ...lead, observacoes: "x" }, previousDoc: lead })).toEqual([]);
  });

  it("lead sem cliente nunca gera item (a linha do tempo é do cliente)", () => {
    expect(entradasDoLead({ ...base, operation: "update", doc: { ...lead, cliente: null, estagio: "em-contato" }, previousDoc: { ...lead, cliente: null } })).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- linhaDoTempo` → FAIL.

- [ ] **Step 3: Implementar**

```ts
// apps/cms/src/lib/crm/linhaDoTempo.ts
import type { CollectionAfterChangeHook, PayloadRequest, RequiredDataFromCollectionSlug } from "payload";

import {
  ehEstagioLead,
  montarItemLinhaDoTempo,
  rotuloDoEstagio,
  tituloPerda,
  tituloTransicao,
  type EntradaLinhaDoTempo,
} from "@ntc/lib";
import type { Lead } from "@ntc/types";

/**
 * Linha do tempo do cliente (spec 2026-09-15 §5.5). Um único ponto de escrita:
 * `registrarNaLinhaDoTempo`, sempre com `req` para entrar na mesma transação
 * do Payload da escrita que a originou. A decisão do QUE registrar fica em
 * funções puras (`entradasDoLead` aqui; as de proposta/e-mail/evento chegam
 * nas Sessões 2–4 no mesmo arquivo).
 */

type LinhaDoTempoData = RequiredDataFromCollectionSlug<"linha-do-tempo">;

export async function registrarNaLinhaDoTempo(
  req: PayloadRequest,
  entrada: EntradaLinhaDoTempo,
): Promise<void> {
  const item = montarItemLinhaDoTempo(entrada);
  if (item === null) return;
  const data: LinhaDoTempoData = {
    cliente: item.cliente,
    lead: item.lead,
    tipo: item.tipo,
    titulo: item.titulo,
    detalhe: item.detalhe,
    referencia: item.referencia,
    usuario: item.usuario,
    em: item.em,
  };
  await req.payload.create({ collection: "linha-do-tempo", data, req });
}

const idRel = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "") return Number.isFinite(Number(v)) ? Number(v) : null;
  if (v && typeof v === "object" && "id" in v) return idRel((v as { id: unknown }).id);
  return null;
};

const DETALHE_CASAMENTO: Record<string, string> = {
  cnpj: "Vinculado ao cliente por CNPJ",
  dominio: "Vinculado ao cliente por domínio do e-mail",
  nome: "Vinculado ao cliente por nome do órgão",
  criado: "Cliente criado a partir do lead",
};

export interface ParametrosEntradasDoLead {
  operation: "create" | "update";
  doc: Lead;
  previousDoc?: Lead;
  usuarioId: number | null;
  /** Motivo do casamento automático (Task 7), ou null quando a escrita veio da UI. */
  casamentoAutomatico: string | null;
}

/** Pura: decide quais itens uma escrita em `leads` gera. */
export function entradasDoLead(p: ParametrosEntradasDoLead): EntradaLinhaDoTempo[] {
  const clienteId = idRel(p.doc.cliente);
  if (clienteId === null) return [];
  const leadId = p.doc.id;
  const referencia = { colecao: "leads", id: String(leadId) };
  const comum = { clienteId, leadId, usuarioId: p.usuarioId, referencia };

  if (p.operation === "create") {
    return [{ ...comum, tipo: "lead", titulo: p.doc.origemEntrada === "manual" ? "Lead criado manualmente" : "Lead recebido pelo site" }];
  }

  const antes = p.previousDoc;
  const itens: EntradaLinhaDoTempo[] = [];
  const clienteAntes = antes ? idRel(antes.cliente) : null;

  if (clienteAntes !== clienteId) {
    if (p.casamentoAutomatico !== null) {
      itens.push({
        ...comum,
        tipo: "lead",
        titulo: p.doc.origemEntrada === "manual" ? "Lead criado manualmente" : "Lead recebido pelo site",
        detalhe: DETALHE_CASAMENTO[p.casamentoAutomatico] ?? null,
      });
    } else {
      itens.push({ ...comum, tipo: "vinculo", titulo: "Lead vinculado a este cliente" });
    }
  }

  const estagioAntes = antes && ehEstagioLead(antes.estagio) ? antes.estagio : null;
  const estagioAgora = ehEstagioLead(p.doc.estagio) ? p.doc.estagio : null;
  if (estagioAgora !== null && estagioAntes !== estagioAgora) {
    itens.push({ ...comum, tipo: "transicao", titulo: tituloTransicao(estagioAntes, estagioAgora) });
  }

  const perdidoAntes = antes?.perdido === true;
  const perdidoAgora = p.doc.perdido === true;
  if (!perdidoAntes && perdidoAgora) {
    itens.push({ ...comum, tipo: "perda", titulo: tituloPerda(p.doc.motivoPerda ?? "outro"), detalhe: p.doc.detalhePerda ?? null });
  } else if (perdidoAntes && !perdidoAgora) {
    itens.push({ ...comum, tipo: "reabertura", titulo: `Reaberto em ${rotuloDoEstagio(p.doc.estagio ?? "lead")}` });
  }

  return itens;
}

/** Hook `afterChange` de `leads`. Só grava; a decisão é de `entradasDoLead`. */
export const registrarLeadNaLinhaDoTempo: CollectionAfterChangeHook<Lead> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (doc.tipo !== "proposta") return doc;
  const usuarioId = req.user?.collection === "users" ? Number(req.user.id) : null;
  const casamentoAutomatico =
    typeof context?.casamentoAutomatico === "string" ? context.casamentoAutomatico : null;
  const entradas = entradasDoLead({ operation, doc, previousDoc, usuarioId, casamentoAutomatico });
  for (const entrada of entradas) {
    await registrarNaLinhaDoTempo(req, entrada);
  }
  return doc;
};
```

Se o typecheck reclamar de `tipo: item.tipo` contra a união do select gerado, usar `tipo: item.tipo as LinhaDoTempoData["tipo"]` (as duas uniões são idênticas por construção — `TIPOS_LINHA_DO_TEMPO` alimenta o select).

- [ ] **Step 4: Ligar o hook em `Leads.ts`**

```ts
import { registrarLeadNaLinhaDoTempo } from "../lib/crm/linhaDoTempo";
// ...
  hooks: {
    beforeChange: [ /* o hook de identificacao existente */ ],
    afterChange: [registrarLeadNaLinhaDoTempo],
  },
```

- [ ] **Step 5: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- linhaDoTempo` → PASS (9). `pnpm typecheck && pnpm lint` verdes.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/lib/crm/linhaDoTempo.ts apps/cms/src/lib/crm/linhaDoTempo.test.ts apps/cms/src/collections/Leads.ts
git commit -m "feat(crm): linha do tempo do cliente gravada a partir das mudanças do lead"
```

---

### Task 7: Casamento automático lead → cliente (hook de criação)

**Files:**
- Create: `apps/cms/src/lib/crm/casamento.ts`
- Test: `apps/cms/src/lib/crm/casamento.test.ts`
- Modify: `apps/cms/src/collections/Leads.ts`

**Interfaces:**
- Consumes: `casarCliente`, `type ClienteCandidato` de `@ntc/lib`; `Lead`, `ClienteCrm` de `@ntc/types`; `context.casamentoAutomatico` (Task 6).
- Produces: `candidatoDeCliente(doc: ClienteCrm): ClienteCandidato` (pura), `dadosDoClienteNovo(lead: Lead): RequiredDataFromCollectionSlug<"clientes-crm">` (pura), `casarClienteDoLead: CollectionAfterChangeHook<Lead>`.

- [ ] **Step 1: Testes**

```ts
// apps/cms/src/lib/crm/casamento.test.ts
import { describe, expect, it, vi } from "vitest";
import type { ClienteCrm, Lead } from "@ntc/types";

import { candidatoDeCliente, casarClienteDoLead, dadosDoClienteNovo } from "./casamento";

const cliente = {
  id: 3,
  orgao: "Secretaria Municipal de Educação",
  sigla: "SME",
  cnpj: null,
  email: "sme@cidade.sp.gov.br",
  contatos: [{ nome: "Ana", email: "ana@cidade.sp.gov.br", principal: true }],
  createdAt: "",
  updatedAt: "",
} as unknown as ClienteCrm;

const lead = {
  id: 7,
  tipo: "proposta",
  nome: "Bruno",
  email: "bruno@cidade.sp.gov.br",
  telefone: "11 99999-0000",
  cargo: "Diretor",
  instituicao: "Secretaria Municipal de Educação",
  esfera: "municipal",
  cliente: null,
  origemEntrada: "site",
  createdAt: "",
  updatedAt: "",
} as unknown as Lead;

describe("candidatoDeCliente", () => {
  it("achata o cliente com os e-mails dos contatos", () => {
    expect(candidatoDeCliente(cliente)).toEqual({
      id: "3",
      orgao: "Secretaria Municipal de Educação",
      sigla: "SME",
      cnpj: null,
      email: "sme@cidade.sp.gov.br",
      emailsContatos: ["ana@cidade.sp.gov.br"],
    });
  });
});

describe("dadosDoClienteNovo", () => {
  it("cria o cliente a partir do lead com a pessoa como contato principal", () => {
    expect(dadosDoClienteNovo(lead)).toEqual({
      orgao: "Secretaria Municipal de Educação",
      esfera: "municipal",
      email: null,
      origem: "lead-site",
      contatos: [
        { nome: "Bruno", cargo: "Diretor", setor: null, email: "bruno@cidade.sp.gov.br", whatsapp: "11 99999-0000", principal: true, decisor: false },
      ],
    });
  });

  it("sem instituição usa o nome da pessoa como órgão provisório", () => {
    expect(dadosDoClienteNovo({ ...lead, instituicao: null } as Lead).orgao).toBe("Bruno (órgão a confirmar)");
  });
});

function montarReq(clientes: ClienteCrm[]) {
  const find = vi.fn(async () => ({ docs: clientes }));
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 42, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  return { req: { payload: { find, create, update } }, find, create, update };
}

describe("casarClienteDoLead", () => {
  it("vincula ao cliente existente por domínio e marca o motivo", async () => {
    const { req, update, create } = montarReq([cliente]);
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    const saida = await hook({ doc: lead, operation: "create", req });
    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        id: 7,
        data: { cliente: 3, clienteCasadoPor: "dominio" },
        context: { casamentoAutomatico: "dominio" },
      }),
    );
    expect(saida).toMatchObject({ cliente: 3, clienteCasadoPor: "dominio" });
  });

  it("cria o cliente quando nada casa", async () => {
    const { req, update, create } = montarReq([]);
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    await hook({ doc: lead, operation: "create", req });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ collection: "clientes-crm" }));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { cliente: 42, clienteCasadoPor: "criado" }, context: { casamentoAutomatico: "criado" } }),
    );
  });

  it("não age em update, em lead de outro tipo nem em lead já vinculado", async () => {
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    const a = montarReq([cliente]);
    await hook({ doc: lead, operation: "update", req: a.req });
    const b = montarReq([cliente]);
    await hook({ doc: { ...lead, tipo: "contato" }, operation: "create", req: b.req });
    const c = montarReq([cliente]);
    await hook({ doc: { ...lead, cliente: 3 }, operation: "create", req: c.req });
    expect(a.find).not.toHaveBeenCalled();
    expect(b.find).not.toHaveBeenCalled();
    expect(c.find).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm --filter @ntc/cms test -- casamento` → FAIL.

- [ ] **Step 3: Implementar**

```ts
// apps/cms/src/lib/crm/casamento.ts
import type { CollectionAfterChangeHook, RequiredDataFromCollectionSlug } from "payload";

import { casarCliente, type ClienteCandidato } from "@ntc/lib";
import type { ClienteCrm, Lead } from "@ntc/types";

/**
 * Casamento automático lead → cliente na criação (spec 2026-09-15 §5.1).
 * O hook carrega os candidatos, chama a regra pura de @ntc/lib e escreve o
 * vínculo (ou cria o cliente). A escrita do vínculo é um `update` do próprio
 * lead com `context.casamentoAutomatico`, que a linha do tempo (Task 6) lê
 * para registrar "Lead recebido pelo site · vinculado por …".
 */

type ClienteCrmData = RequiredDataFromCollectionSlug<"clientes-crm">;

export function candidatoDeCliente(doc: ClienteCrm): ClienteCandidato {
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    cnpj: doc.cnpj ?? null,
    email: doc.email ?? null,
    emailsContatos: (doc.contatos ?? [])
      .map((c) => c.email ?? null)
      .filter((e): e is string => e !== null && e !== ""),
  };
}

export function dadosDoClienteNovo(lead: Lead): ClienteCrmData {
  const orgao = lead.instituicao?.trim() ? lead.instituicao.trim() : `${lead.nome} (órgão a confirmar)`;
  return {
    orgao,
    esfera: (lead.esfera ?? null) as ClienteCrmData["esfera"],
    email: null,
    origem: "lead-site",
    contatos: [
      {
        nome: lead.nome,
        cargo: lead.cargo ?? null,
        setor: null,
        email: lead.email,
        whatsapp: lead.telefone ?? null,
        principal: true,
        decisor: false,
      },
    ],
  };
}

export const casarClienteDoLead: CollectionAfterChangeHook<Lead> = async ({ doc, operation, req }) => {
  if (operation !== "create" || doc.tipo !== "proposta" || doc.cliente) return doc;

  const clientes = await req.payload.find({ collection: "clientes-crm", limit: 1000, depth: 0, req });
  const casado = casarCliente(
    { instituicao: doc.instituicao ?? null, email: doc.email, cnpj: null },
    clientes.docs.map(candidatoDeCliente),
  );

  let clienteId: number;
  let por: NonNullable<Lead["clienteCasadoPor"]>;
  if (casado !== null) {
    clienteId = Number(casado.clienteId);
    por = casado.por;
  } else {
    const novo = await req.payload.create({ collection: "clientes-crm", data: dadosDoClienteNovo(doc), req });
    clienteId = Number(novo.id);
    por = "criado";
  }

  await req.payload.update({
    collection: "leads",
    id: doc.id,
    data: { cliente: clienteId, clienteCasadoPor: por },
    req,
    context: { casamentoAutomatico: por },
  });
  return { ...doc, cliente: clienteId, clienteCasadoPor: por };
};
```

Se `esfera` do lead (`ESFERA_INSTITUCIONAL`: municipal/estadual/federal/privada/terceiro-setor) não coincidir com `ESFERAS_CRM` do cliente, mapear: os valores iguais passam, os demais viram `null` — conferir as duas listas no momento da implementação e ajustar `dadosDoClienteNovo` com um `Record` explícito se diferirem (e cobrir no teste).

- [ ] **Step 4: Ligar o hook antes do da linha do tempo**

Em `Leads.ts`: `afterChange: [casarClienteDoLead, registrarLeadNaLinhaDoTempo]`.

- [ ] **Step 5: Rodar e ver passar** — `pnpm --filter @ntc/cms test` e `pnpm typecheck && pnpm lint` verdes.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/lib/crm/casamento.ts apps/cms/src/lib/crm/casamento.test.ts apps/cms/src/collections/Leads.ts
git commit -m "feat(crm): casamento automático do lead com o cliente na entrada (cnpj, domínio, nome ou criação)"
```

---

### Task 8: Leitura, escrita e Server Actions do lead, da nota e do cliente

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrm.ts`, `apps/cms/src/lib/cms/painelCrmEscrita.ts`, `apps/cms/src/app/(painel)/acoesCrm.ts`
- Test: `apps/cms/src/lib/cms/painelCrmEscrita.lead.test.ts`, `apps/cms/src/app/(painel)/acoesCrm.test.ts`

**Interfaces:**
- Produces (leitura):
  ```ts
  interface ItemLinhaDoTempoResumo { id: string; tipo: string; titulo: string; detalhe: string | null; usuarioNome: string | null; emISO: string; leadId: string | null; referencia: { colecao: string; id: string } | null }
  interface EventoComercialResumo { id: string; titulo: string; dataInicioISO: string; status: string; modalidade: string | null; local: string | null; leadId: string }
  interface LeadCrmDetalhe extends LeadCrmResumo { telefone: string | null; esfera: string | null; modalidade: string | null; mensagem: string | null; origem: { rotulo: string; valor: string }[]; consentimento: { aceito: boolean; timestamp: string | null; politicaVersao: string | null; ipSubmissao: string | null }; observacoes: string | null; dataPrevistaEventoISO: string | null; perdidoEmISO: string | null; detalhePerda: string | null; clienteCasadoPor: string | null; linhaDoTempo: ItemLinhaDoTempoResumo[] }
  ClienteCrmDetalhe += { negocios: LeadCrmResumo[]; linhaDoTempo: ItemLinhaDoTempoResumo[]; eventos: EventoComercialResumo[] }
  obterLeadCrm(id): Promise<LeadCrmDetalhe | null>
  listarLinhaDoTempo(filtro: { clienteId: string } | { leadId: string }): Promise<ItemLinhaDoTempoResumo[]>
  ```
- Produces (escrita, todas `Promise<ResultadoEscrita>`, todas recebem `usuario: UsuarioAutenticado` e passam `user: usuario` à Local API):
  ```ts
  interface DadosLeadManual { nome; email; telefone; cargo; instituicao; esfera; programa; modalidade; participantesEstimados; mensagem; cliente; responsavel; valorEstimado; dataPrevistaEvento; observacoes }  // todos string
  criarLeadManual(dados, usuario) · atualizarLeadCrm(id, dados, usuario) · moverLead(id, estagio, usuario) · marcarLeadPerdido(id, motivo, detalhe, usuario) · reabrirLead(id, usuario) · vincularClienteAoLead(id, clienteId, usuario) · adicionarNota(clienteId, leadId: string | null, texto, usuario)
  ```
- Produces (actions): `carregarLeadCrm(id)`, `salvarLeadCrm(id | null, dados)`, `moverLeadCrm(id, estagio)`, `marcarLeadPerdidoCrm(id, motivo, detalhe)`, `reabrirLeadCrm(id)`, `vincularClienteCrm(leadId, clienteId)`, `adicionarNotaCrm(clienteId, leadId | null, texto)`.

- [ ] **Step 1: Testes da escrita**

```ts
// apps/cms/src/lib/cms/painelCrmEscrita.lead.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { adicionarNota, criarLeadManual, marcarLeadPerdido, moverLead } = await import("./painelCrmEscrita");

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

function payloadFalso() {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  obterPayloadMock.mockResolvedValue({ create, update });
  return { create, update };
}

afterEach(() => vi.clearAllMocks());

describe("moverLead", () => {
  it("recusa estágio fora da lista sem tocar o banco", async () => {
    const { update } = payloadFalso();
    expect(await moverLead("7", "ganha", usuario)).toEqual({ ok: false, erro: "Estágio inválido." });
    expect(update).not.toHaveBeenCalled();
  });

  it("grava o estágio com o usuário da sessão", async () => {
    const { update } = payloadFalso();
    expect(await moverLead("7", "em-contato", usuario)).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "leads", id: "7", data: { estagio: "em-contato" }, user: usuario }),
    );
  });
});

describe("marcarLeadPerdido", () => {
  it("exige motivo válido", async () => {
    payloadFalso();
    expect(await marcarLeadPerdido("7", "", "", usuario)).toEqual({ ok: false, erro: "Informe o motivo da perda." });
  });

  it("grava perdido, motivo, detalhe e data", async () => {
    const { update } = payloadFalso();
    await marcarLeadPerdido("7", "sem-resposta", "3 tentativas", usuario);
    const chamada = update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(chamada.data).toMatchObject({ perdido: true, motivoPerda: "sem-resposta", detalhePerda: "3 tentativas" });
    expect(typeof chamada.data.perdidoEm).toBe("string");
  });
});

describe("adicionarNota", () => {
  it("recusa nota vazia", async () => {
    const { create } = payloadFalso();
    expect(await adicionarNota("3", null, "   ", usuario)).toEqual({ ok: false, erro: "Escreva a nota." });
    expect(create).not.toHaveBeenCalled();
  });

  it("grava item tipo nota na linha do tempo, com lead opcional", async () => {
    const { create } = payloadFalso();
    expect(await adicionarNota("3", "7", "Liguei, pediu retorno em março", usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "linha-do-tempo",
        user: usuario,
        data: expect.objectContaining({ cliente: 3, lead: 7, tipo: "nota", titulo: "Nota", detalhe: "Liguei, pediu retorno em março", usuario: 5 }),
      }),
    );
  });
});

describe("criarLeadManual", () => {
  const dados = {
    nome: "Bruno", email: "b@x.gov.br", telefone: "", cargo: "", instituicao: "SME", esfera: "municipal",
    programa: "", modalidade: "", participantesEstimados: "40", mensagem: "", cliente: "3", responsavel: "5",
    valorEstimado: "12000", dataPrevistaEvento: "", observacoes: "",
  };

  it("exige nome, e-mail e cliente", async () => {
    payloadFalso();
    expect(await criarLeadManual({ ...dados, nome: "" }, usuario)).toEqual({ ok: false, erro: "Informe o nome do contato." });
    expect(await criarLeadManual({ ...dados, email: "" }, usuario)).toEqual({ ok: false, erro: "Informe o e-mail do contato." });
    expect(await criarLeadManual({ ...dados, cliente: "" }, usuario)).toEqual({ ok: false, erro: "Selecione o cliente." });
  });

  it("grava tipo proposta, origem manual, estágio lead e vínculo manual", async () => {
    const { create } = payloadFalso();
    expect(await criarLeadManual(dados, usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        user: usuario,
        data: expect.objectContaining({
          tipo: "proposta", origemEntrada: "manual", estagio: "lead", perdido: false, cliente: 3, clienteCasadoPor: "manual",
          nome: "Bruno", email: "b@x.gov.br", instituicao: "SME", esfera: "municipal", responsavel: 5, valorEstimado: 12000,
          detalhesProposta: expect.objectContaining({ participantesEstimados: 40 }),
          consentimentoLgpd: { aceito: false },
        }),
      }),
    );
  });
});
```

`consentimentoLgpd.aceito` é `required: true` na coleção: um lead manual não passou por formulário público, então grava `aceito: false` sem timestamp — honesto e consistente com §12 (nada foi aceito). Se o Payload recusar `false` num `required` checkbox (não recusa — `required` em checkbox só exige que o campo exista), documentar aqui e ajustar.

- [ ] **Step 2: Rodar e ver falhar** — `pnpm --filter @ntc/cms test -- painelCrmEscrita.lead` → FAIL.

- [ ] **Step 3: Implementar a escrita** (acrescentar em `painelCrmEscrita.ts`)

```ts
import { ehEstagioLead, MOTIVOS_PERDA } from "@ntc/lib";
// ...
type LeadData = RequiredDataFromCollectionSlug<"leads">;
type LinhaDoTempoData = RequiredDataFromCollectionSlug<"linha-do-tempo">;

export interface DadosLeadManual {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  instituicao: string;
  esfera: string;
  programa: string;
  modalidade: string;
  participantesEstimados: string;
  mensagem: string;
  cliente: string;
  responsavel: string;
  valorEstimado: string;
  dataPrevistaEvento: string;
  observacoes: string;
}

function validarLeadManual(dados: DadosLeadManual): string | null {
  if (dados.nome.trim() === "") return "Informe o nome do contato.";
  if (dados.email.trim() === "") return "Informe o e-mail do contato.";
  if (idOuNulo(dados.cliente) === null) return "Selecione o cliente.";
  return null;
}

/** Campos editáveis pela UI (criação manual e edição do modal). */
function camposEditaveisDoLead(dados: DadosLeadManual): Partial<LeadData> {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    telefone: ouNulo(dados.telefone),
    cargo: ouNulo(dados.cargo),
    instituicao: ouNulo(dados.instituicao),
    esfera: ouNulo(dados.esfera) as LeadData["esfera"],
    detalhesProposta: {
      programa: idOuNulo(dados.programa),
      modalidade: ouNulo(dados.modalidade) as NonNullable<LeadData["detalhesProposta"]>["modalidade"],
      participantesEstimados: numeroOuNulo(dados.participantesEstimados),
      mensagem: ouNulo(dados.mensagem),
    },
    responsavel: idOuNulo(dados.responsavel),
    valorEstimado: numeroOuNulo(dados.valorEstimado),
    dataPrevistaEvento: ouNulo(dados.dataPrevistaEvento),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarLeadManual(dados: DadosLeadManual, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const erro = validarLeadManual(dados);
  if (erro) return { ok: false, erro };
  try {
    const payload = await obterPayload();
    const data: LeadData = {
      ...camposEditaveisDoLead(dados),
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      tipo: "proposta",
      origemEntrada: "manual",
      estagio: "lead",
      perdido: false,
      cliente: idOuNulo(dados.cliente),
      clienteCasadoPor: "manual",
      consentimentoLgpd: { aceito: false },
    };
    await payload.create({ collection: "leads", data, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[criarLeadManual]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarLeadCrm(id: string, dados: DadosLeadManual, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const erro = validarLeadManual(dados);
  if (erro) return { ok: false, erro };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: camposEditaveisDoLead(dados), user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarLeadCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function moverLead(id: string, estagio: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  if (!ehEstagioLead(estagio)) return { ok: false, erro: "Estágio inválido." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { estagio }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[moverLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function marcarLeadPerdido(id: string, motivo: string, detalhe: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  if (!MOTIVOS_PERDA.some((m) => m.value === motivo)) return { ok: false, erro: "Informe o motivo da perda." };
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "leads",
      id,
      data: { perdido: true, motivoPerda: motivo as LeadData["motivoPerda"], detalhePerda: ouNulo(detalhe), perdidoEm: new Date().toISOString() },
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[marcarLeadPerdido]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function reabrirLead(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { perdido: false, motivoPerda: null, detalhePerda: null, perdidoEm: null }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[reabrirLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function vincularClienteAoLead(id: string, clienteId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const cliente = idOuNulo(clienteId);
  if (cliente === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { cliente, clienteCasadoPor: "manual" }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[vincularClienteAoLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function adicionarNota(clienteId: string, leadId: string | null, texto: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const cliente = idOuNulo(clienteId);
  if (cliente === null) return { ok: false, erro: "Cliente inválido." };
  const detalhe = texto.trim();
  if (detalhe === "") return { ok: false, erro: "Escreva a nota." };
  try {
    const payload = await obterPayload();
    const data: LinhaDoTempoData = {
      cliente,
      lead: leadId === null ? null : idOuNulo(leadId),
      tipo: "nota",
      titulo: "Nota",
      detalhe,
      referencia: null,
      usuario: Number(usuario.id),
      em: new Date().toISOString(),
    };
    await payload.create({ collection: "linha-do-tempo", data, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[adicionarNota]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
```

(`ouNulo`, `idOuNulo`, `numeroOuNulo`, `ERRO_GENERICO` já existem no arquivo. A nota passa pelo access `criarSoNota` da coleção porque a Local API com `user` e sem `overrideAccess: false` ainda ignora access — se quiser que o access valha aqui, passar `overrideAccess: false`; como a Server Action já validou a sessão, deixar o padrão.)

- [ ] **Step 4: Implementar a leitura** (acrescentar em `painelCrm.ts`)

```ts
import type { EventoComercial, LinhaDoTempo } from "@ntc/types";

export interface ItemLinhaDoTempoResumo {
  id: string;
  tipo: string;
  titulo: string;
  detalhe: string | null;
  usuarioNome: string | null;
  emISO: string;
  leadId: string | null;
  referencia: { colecao: string; id: string } | null;
}

function mapearItemLinhaDoTempo(doc: LinhaDoTempo): ItemLinhaDoTempoResumo {
  const ref = doc.referencia;
  return {
    id: String(doc.id),
    tipo: doc.tipo,
    titulo: doc.titulo,
    detalhe: doc.detalhe ?? null,
    usuarioNome: campoRel(doc.usuario, "nome"),
    emISO: doc.em,
    leadId: idRel(doc.lead),
    referencia: ref?.colecao && ref.id ? { colecao: ref.colecao, id: ref.id } : null,
  };
}

export async function listarLinhaDoTempo(
  filtro: { clienteId: string } | { leadId: string },
): Promise<ItemLinhaDoTempoResumo[]> {
  const payload = await obterPayload();
  const where = "clienteId" in filtro ? { cliente: { equals: filtro.clienteId } } : { lead: { equals: filtro.leadId } };
  const res = await payload.find({ collection: "linha-do-tempo", depth: 1, limit: 300, sort: "-em", where });
  return res.docs.map(mapearItemLinhaDoTempo);
}

export interface EventoComercialResumo {
  id: string;
  titulo: string;
  dataInicioISO: string;
  status: string;
  modalidade: string | null;
  local: string | null;
  leadId: string;
}

function mapearEventoComercial(doc: EventoComercial): EventoComercialResumo {
  return {
    id: String(doc.id),
    titulo: doc.titulo,
    dataInicioISO: doc.dataInicio,
    status: doc.status,
    modalidade: doc.modalidade ?? null,
    local: doc.local ?? null,
    leadId: idRel(doc.lead) ?? "",
  };
}

export interface LeadCrmDetalhe extends LeadCrmResumo {
  telefone: string | null;
  esfera: string | null;
  modalidade: string | null;
  mensagem: string | null;
  programaId: string | null;
  origem: { rotulo: string; valor: string }[];
  consentimento: { aceito: boolean; timestamp: string | null; politicaVersao: string | null; ipSubmissao: string | null };
  observacoes: string | null;
  dataPrevistaEventoISO: string | null;
  perdidoEmISO: string | null;
  detalhePerda: string | null;
  clienteCasadoPor: string | null;
  linhaDoTempo: ItemLinhaDoTempoResumo[];
}

export async function obterLeadCrm(id: string): Promise<LeadCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: Lead;
  try {
    doc = await payload.findByID({ collection: "leads", id, depth: 1 });
  } catch {
    return null;
  }
  if (doc.tipo !== "proposta") return null;
  const linhaDoTempo = await listarLinhaDoTempo({ leadId: id });
  const og = doc.origem ?? {};
  const origem: { rotulo: string; valor: string }[] = [];
  const par = (rotulo: string, v: unknown) => { if (typeof v === "string" && v !== "") origem.push({ rotulo, valor: v }); };
  par("Página", og.paginaSubmissao); par("Referrer", og.referrer); par("utm_source", og.utmSource);
  par("utm_medium", og.utmMedium); par("utm_campaign", og.utmCampaign); par("utm_term", og.utmTerm); par("utm_content", og.utmContent);
  const cons = doc.consentimentoLgpd;
  return {
    ...mapearLeadCrm(doc),
    telefone: doc.telefone ?? null,
    esfera: doc.esfera ?? null,
    modalidade: doc.detalhesProposta?.modalidade ?? null,
    mensagem: doc.detalhesProposta?.mensagem ?? null,
    programaId: idRel(doc.detalhesProposta?.programa),
    origem,
    consentimento: {
      aceito: cons?.aceito === true,
      timestamp: cons?.timestamp ?? null,
      politicaVersao: cons?.politicaVersao ?? null,
      ipSubmissao: cons?.ipSubmissao ?? null,
    },
    observacoes: doc.observacoes ?? null,
    dataPrevistaEventoISO: soData(doc.dataPrevistaEvento),
    perdidoEmISO: doc.perdidoEm ?? null,
    detalhePerda: doc.detalhePerda ?? null,
    clienteCasadoPor: doc.clienteCasadoPor ?? null,
    linhaDoTempo,
  };
}
```

Em `ClienteCrmDetalhe` acrescentar `negocios: LeadCrmResumo[]; linhaDoTempo: ItemLinhaDoTempoResumo[]; eventos: EventoComercialResumo[];` e em `obterClienteCrm`, depois do `findByID`:

```ts
  const [negocios, linhaDoTempo, eventos] = await Promise.all([
    payload.find({ collection: "leads", depth: 1, limit: 200, sort: "-createdAt", where: { and: [{ cliente: { equals: doc.id } }, { tipo: { equals: "proposta" } }] } }),
    listarLinhaDoTempo({ clienteId: id }),
    payload.find({ collection: "eventos-comerciais", depth: 0, limit: 100, sort: "-dataInicio", where: { cliente: { equals: doc.id } } }),
  ]);
```
e no objeto devolvido: `negocios: negocios.docs.map(mapearLeadCrm), linhaDoTempo, eventos: eventos.docs.map(mapearEventoComercial),`.

- [ ] **Step 5: Server Actions** (acrescentar em `acoesCrm.ts`, padrão do arquivo: sessão antes de tudo, `revalidatePath("/crm")` no sucesso)

```ts
export async function carregarLeadCrm(id: string): Promise<LeadCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterLeadCrm(id);
}

export async function salvarLeadCrm(id: string | null, dados: DadosLeadManual): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = id === null ? await criarLeadManual(dados, usuario) : await atualizarLeadCrm(id, dados, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function moverLeadCrm(id: string, estagio: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await moverLead(id, estagio, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function marcarLeadPerdidoCrm(id: string, motivo: string, detalhe: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await marcarLeadPerdido(id, motivo, detalhe, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function reabrirLeadCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await reabrirLead(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function vincularClienteCrm(leadId: string, clienteId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await vincularClienteAoLead(leadId, clienteId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function adicionarNotaCrm(clienteId: string, leadId: string | null, texto: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await adicionarNota(clienteId, leadId, texto, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}
```

Acrescentar em `acoesCrm.test.ts` (mesmo mock da Task 5):

```ts
describe("moverLeadCrm", () => {
  it("sem sessão recusa sem tocar a Local API", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    const { update } = montarPayloadFalso();
    expect(await moverLeadCrm("7", "em-contato")).toEqual({ ok: false, erro: "Sessão expirada. Entre novamente." });
    expect(update).not.toHaveBeenCalled();
  });

  it("repassa o usuário da sessão à Local API (autor da transição na linha do tempo)", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);
    const { update } = montarPayloadFalso();
    expect(await moverLeadCrm("7", "em-contato")).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: "leads", user: usuarioFalso }));
  });
});
```

- [ ] **Step 6: Rodar e ver passar** — `pnpm --filter @ntc/cms test` → PASS; `pnpm typecheck && pnpm lint` verdes.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/lib/cms apps/cms/src/app/\(painel\)/acoesCrm.ts apps/cms/src/app/\(painel\)/acoesCrm.test.ts
git commit -m "feat(crm): leitura, escrita e actions do lead (mover, perder, reabrir, vincular), nota e detalhe do cliente"
```

---

### Task 9: Kanban no Dashboard (arraste, Perdido, filtros)

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/Kanban.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/TelaPainelComercial.tsx`, `crm/ShellCrm.tsx`, `apps/cms/src/app/(painel)/painel.css`

**Interfaces:**
- Consumes: `LeadCrmResumo`, `calcularKpisComercial`, `formatarMoedaBRL`, `ESTAGIOS_LEAD`, `diasEntre`, `moverLeadCrm`.
- Produces: `<Kanban leads usuarios hojeISO onAbrir onMover />` com `onMover(leadId: string, estagio: string): void`.

- [ ] **Step 1: Componente**

```tsx
// apps/cms/src/app/(painel)/crm/Kanban.tsx
"use client";

import { useMemo, useState } from "react";

import { ESTAGIOS_LEAD, diasEntre } from "@ntc/lib";

import type { LeadCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface KanbanProps {
  leads: LeadCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  hojeISO: string;
  onAbrir: (id: string) => void;
  onMover: (id: string, estagio: string) => void;
}

/**
 * Quadro kanban do fluxo comercial (spec 2026-09-15 §4.2). Arraste com a API
 * HTML5 nativa (sem lib). O select de estágio do modal é o caminho por
 * teclado — o card em si abre o modal com Enter/Espaço.
 */
export function Kanban({ leads, usuarios, hojeISO, onAbrir, onMover }: KanbanProps) {
  const [busca, setBusca] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [mostrarPerdidos, setMostrarPerdidos] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<string | null>(null);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (!mostrarPerdidos && l.perdido) return false;
      if (responsavel !== "" && l.responsavelId !== responsavel) return false;
      if (termo === "") return true;
      return [l.instituicao, l.nome, l.clienteNome ?? "", l.programaSigla ?? ""].some((v) =>
        v.toLowerCase().includes(termo),
      );
    });
  }, [leads, busca, responsavel, mostrarPerdidos]);

  function soltar(estagio: string) {
    if (arrastando !== null) {
      const lead = leads.find((l) => l.id === arrastando);
      if (lead && lead.estagio !== estagio) onMover(arrastando, estagio);
    }
    setArrastando(null);
    setColunaAlvo(null);
  }

  return (
    <section className="pcms-kanban" aria-label="Quadro comercial">
      <div className="pcms-toolbar pcms-kanban__toolbar">
        <input
          type="search"
          className="pcms-input pcms-kanban__busca"
          placeholder="Buscar por órgão, contato ou programa"
          aria-label="Buscar no quadro"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className="pcms-input"
          aria-label="Filtrar por responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        <label className="pcms-kanban__toggle">
          <input type="checkbox" checked={mostrarPerdidos} onChange={(e) => setMostrarPerdidos(e.target.checked)} />
          Mostrar perdidos
        </label>
      </div>

      <div className="pcms-kanban__colunas">
        {ESTAGIOS_LEAD.map((estagio) => {
          const cards = visiveis.filter((l) => l.estagio === estagio.value);
          const alvo = colunaAlvo === estagio.value;
          return (
            <div
              key={estagio.value}
              className={`pcms-kanban__coluna${alvo ? " pcms-kanban__coluna--alvo" : ""}`}
              onDragOver={(e) => { e.preventDefault(); if (colunaAlvo !== estagio.value) setColunaAlvo(estagio.value); }}
              onDragLeave={() => { if (colunaAlvo === estagio.value) setColunaAlvo(null); }}
              onDrop={(e) => { e.preventDefault(); soltar(estagio.value); }}
            >
              <header className="pcms-kanban__cabecalho">
                <h2>{estagio.label}</h2>
                <span className="pcms-kanban__contagem" aria-label={`${cards.length} no estágio`}>{cards.length}</span>
              </header>
              <div className="pcms-kanban__cards">
                {cards.map((l) => (
                  <article
                    key={l.id}
                    className={`pcms-kanban__card${l.perdido ? " pcms-kanban__card--perdido" : ""}${arrastando === l.id ? " pcms-kanban__card--arrastando" : ""}`}
                    draggable={!l.perdido}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir lead de ${l.instituicao}`}
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setArrastando(l.id); }}
                    onDragEnd={() => { setArrastando(null); setColunaAlvo(null); }}
                    onClick={() => onAbrir(l.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(l.id); } }}
                  >
                    <strong className="pcms-kanban__orgao">{l.clienteNome ?? l.instituicao}</strong>
                    <span className="pcms-kanban__contato">{l.nome}</span>
                    <div className="pcms-kanban__meta">
                      {l.programaSigla && <span className="pcms-modalidade">{l.programaSigla}</span>}
                      {l.valorEstimado !== null && <span>{formatarMoedaBRL(l.valorEstimado)}</span>}
                    </div>
                    <div className="pcms-kanban__rodape">
                      <span>{diasEntre(l.atualizadoEmISO, hojeISO)} d na coluna</span>
                      {l.perdido && <span className="pcms-selo pcms-selo--erro">Perdido</span>}
                    </div>
                  </article>
                ))}
                {cards.length === 0 && <div className="pcms-kanban__vazio">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

(Se `pcms-input` não existir no `painel.css`, usar a classe que os `CampoTexto`/`CampoSelect` de `CamposCrm.tsx` aplicam ao `<input>` — conferir lá e usar a mesma.)

- [ ] **Step 2: CSS** (fim de `painel.css`)

```css
/* ===== CRM Kanban ======================================================= */
.pcms-kanban__toolbar { gap: 12px; flex-wrap: wrap; align-items: center; }
.pcms-kanban__busca { min-width: 260px; flex: 1; }
.pcms-kanban__toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--pcms-grafite); }
.pcms-kanban__colunas {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 12px;
  align-items: start;
}
.pcms-kanban__coluna {
  background: var(--pcms-pergaminho);
  border: 1px solid var(--pcms-linha);
  border-radius: var(--pcms-radius);
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.pcms-kanban__coluna--alvo { outline: 2px solid var(--pcms-oxford); outline-offset: -2px; }
.pcms-kanban__cabecalho { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--pcms-linha); }
.pcms-kanban__cabecalho h2 { font-family: var(--font-corpo), "Barlow", sans-serif; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--pcms-oxford); margin: 0; }
.pcms-kanban__contagem { background: #fff; border: 1px solid var(--pcms-linha); border-radius: 999px; padding: 1px 9px; font-size: 0.78rem; color: var(--pcms-grafite); }
.pcms-kanban__cards { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
.pcms-kanban__card {
  background: #fff;
  border: 1px solid var(--pcms-linha);
  border-left: 3px solid var(--pcms-oxford);
  border-radius: var(--pcms-radius);
  box-shadow: var(--pcms-sombra);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: grab;
}
.pcms-kanban__card:focus-visible { outline: 2px solid var(--pcms-oxford); outline-offset: 2px; }
.pcms-kanban__card--arrastando { opacity: 0.5; }
.pcms-kanban__card--perdido { border-left-color: var(--pcms-cardeal, #8e2b27); opacity: 0.7; cursor: default; }
.pcms-kanban__orgao { color: var(--pcms-oxford); font-size: 0.95rem; line-height: 1.25; }
.pcms-kanban__contato { color: var(--pcms-grafite); font-size: 0.85rem; }
.pcms-kanban__meta, .pcms-kanban__rodape { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--pcms-grafite-suave); }
.pcms-kanban__vazio { text-align: center; color: var(--pcms-grafite-suave); padding: 18px 0; }
```

(Conferir no topo do `painel.css` os nomes reais das variáveis — `--pcms-linha`, `--pcms-pergaminho`, `--pcms-oxford`, `--pcms-grafite`, `--pcms-grafite-suave`, `--pcms-radius`, `--pcms-sombra` — e usar os que existem; não inventar cor: Cardeal `#8E2B27` é token do §3.)

- [ ] **Step 3: Dashboard usa o Kanban**

`TelaPainelComercial.tsx`: props `{ leads; usuarios; hojeISO; erroLeitura; onAbrirLead; onMoverLead }`; trocar o `<div className="pcms-vazio">Quadro kanban — Task 9.</div>` por `<Kanban leads={leads} usuarios={usuarios} hojeISO={hojeISO} onAbrir={onAbrirLead} onMover={onMoverLead} />`. Cabeçalho: eyebrow "Comercial", h1 "Dashboard", parágrafo "Leads em andamento por estágio. Arraste para mover; clique para abrir."

`ShellCrm.tsx`: estado otimista do quadro —

```ts
const [leadsLocal, setLeadsLocal] = useState<LeadCrmResumo[]>(leads);
useEffect(() => setLeadsLocal(leads), [leads]);

function moverLead(id: string, estagio: string) {
  const anterior = leadsLocal;
  setLeadsLocal((ls) => ls.map((l) => (l.id === id ? { ...l, estagio, atualizadoEmISO: new Date().toISOString() } : l)));
  iniciarCarga(async () => {
    const r = await moverLeadCrm(id, estagio);
    if (!r.ok) {
      setLeadsLocal(anterior);
      setErroAcao(r.erro ?? "Erro ao mover o lead.");
    }
  });
}
```

Passar `leadsLocal` (não `leads`) para `TelaPainelComercial` e `TelaLeads`; `onAbrirLead={abrirLead}` (ainda o `DetalheLead` antigo — a Task 10 troca pelo modal); `onMoverLead={moverLead}`. Renderizar `<AvisoForm erro={erroAcao} />` acima da tela do painel quando `erroAcao !== null`.

- [ ] **Step 4: Verificar** — `pnpm lint && pnpm typecheck && pnpm test` verdes. Com o dev no ar (e o schema pushado, se o PO já rodou): arrastar um card muda de coluna sem recarregar; ao recarregar, a coluna persiste; `linha_do_tempo` ganha uma linha `transicao` com `usuario` preenchido.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/app/\(painel\)
git commit -m "feat(crm): kanban de 10 colunas no dashboard com arraste, filtros e perdidos"
```

---

### Task 10: Modal do lead (Dados / Histórico), tela Leads e Novo Lead

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/LinhaDoTempo.tsx`, `crm/FormLead.tsx`, `crm/ModalLead.tsx`, `crm/TelaLeadsCrm.tsx`
- Modify: `crm/ShellCrm.tsx`, `apps/cms/src/lib/cms/painelCrmEscrita.ts` (+ teste), `apps/cms/src/app/(painel)/painel.css`
- Delete: `apps/cms/src/app/(painel)/TelaLeads.tsx`, `DetalheLead.tsx`

**Interfaces:**
- Consumes: `LeadCrmDetalhe`, `LeadCrmResumo`, `ClienteCrmResumo`, `CatalogoCrm`, `UsuarioCmsResumo`, `ItemLinhaDoTempoResumo`; actions da Task 8; `ESTAGIOS_LEAD`, `MOTIVOS_PERDA`, `rotuloDoEstagio`, `MODALIDADE_PROPOSTA`, `ESFERA_INSTITUCIONAL`; `seloDeEstagioLead`.
- Produces: `<LinhaDoTempo itens onNota? />`, `<FormLead inicial clientes catalogo usuarios onSalvo onCancelar />`, `<ModalLead lead clientes catalogo usuarios onFechar onAtualizado onAbrirCliente />`, `<TelaLeadsCrm leads usuarios onAbrir onNovo />`; `DadosLeadManual.novoClienteOrgao`.

- [ ] **Step 1: "Criar o cliente na hora" no `criarLeadManual`**

Em `DadosLeadManual` acrescentar `novoClienteOrgao: string;`. Em `validarLeadManual`, trocar a 3ª regra por `if (idOuNulo(dados.cliente) === null && dados.novoClienteOrgao.trim() === "") return "Selecione o cliente ou informe o órgão para criar um novo.";`. Em `criarLeadManual`, antes de montar `data`:

```ts
    let clienteId = idOuNulo(dados.cliente);
    if (clienteId === null) {
      const novo = await payload.create({
        collection: "clientes-crm",
        data: {
          orgao: dados.novoClienteOrgao.trim(),
          esfera: (ouNulo(dados.esfera) ?? null) as ClienteCrmData["esfera"],
          origem: "manual",
          contatos: [{ nome: dados.nome.trim(), cargo: ouNulo(dados.cargo), setor: null, email: dados.email.trim(), whatsapp: ouNulo(dados.telefone), principal: true, decisor: false }],
        },
        user: usuario,
      });
      clienteId = Number(novo.id);
    }
```
e `cliente: clienteId`. Teste novo em `painelCrmEscrita.lead.test.ts`: com `cliente: ""` e `novoClienteOrgao: "Prefeitura X"`, `create` é chamado primeiro com `collection: "clientes-crm"` (origem `manual`, contato principal = a pessoa) e depois com `collection: "leads"` e `cliente: 1`. Atualizar o teste "exige nome, e-mail e cliente" para a mensagem nova. `atualizarLeadCrm` ignora `novoClienteOrgao`.

- [ ] **Step 2: `LinhaDoTempo.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import type { ItemLinhaDoTempoResumo } from "@/lib/cms/painelCrm";

interface LinhaDoTempoProps {
  itens: ItemLinhaDoTempoResumo[];
  /** Quando presente, mostra o campo de nota manual. */
  onNota?: (texto: string) => Promise<string | null>;
}

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Lista cronológica (mais recente primeiro) + nota manual. Usada no modal do lead e no detalhe do cliente. */
export function LinhaDoTempo({ itens, onNota }: LinhaDoTempoProps) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!onNota) return;
    setErro(null);
    iniciar(async () => {
      const r = await onNota(texto);
      if (r === null) setTexto("");
      else setErro(r);
    });
  }

  return (
    <div className="pcms-timeline">
      {onNota && (
        <form className="pcms-timeline__nota" onSubmit={enviar}>
          <label htmlFor="pcms-nota">Nota</label>
          <textarea id="pcms-nota" rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Registro manual: ligação, reunião, combinado…" />
          {erro && <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">{erro}</p>}
          <button type="submit" className="pcms-btn pcms-btn--mini" disabled={salvando || texto.trim() === ""}>Adicionar nota</button>
        </form>
      )}
      {itens.length === 0 ? (
        <div className="pcms-vazio">Nada registrado ainda.</div>
      ) : (
        <ol className="pcms-timeline__lista">
          {itens.map((i) => (
            <li key={i.id} className={`pcms-timeline__item pcms-timeline__item--${i.tipo}`}>
              <time dateTime={i.emISO}>{FMT.format(new Date(i.emISO))}</time>
              <div>
                <strong>{i.titulo}</strong>
                {i.detalhe && <p>{i.detalhe}</p>}
                <small>{i.usuarioNome ?? "Sistema"}</small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `FormLead.tsx`** (criação manual e edição dos campos manuais)

```tsx
"use client";

import { useState, useTransition } from "react";

import { ESFERA_INSTITUCIONAL, MODALIDADE_PROPOSTA } from "@ntc/lib";

import type { CatalogoCrm, ClienteCrmResumo, LeadCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosLeadManual } from "@/lib/cms/painelCrmEscrita";

import { salvarLeadCrm } from "../acoesCrm";
import { AvisoForm, CampoArea, CampoData, CampoNumero, CampoSelect, CampoTexto } from "./CamposCrm";

interface FormLeadProps {
  inicial: LeadCrmDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const paraOpcoes = (valores: readonly string[]) => valores.map((v) => ({ label: v, value: v }));

export function FormLead({ inicial, clientes, catalogo, usuarios, onSalvo, onCancelar }: FormLeadProps) {
  const [dados, setDados] = useState<DadosLeadManual>({
    nome: inicial?.nome ?? "",
    email: inicial?.email ?? "",
    telefone: inicial?.telefone ?? "",
    cargo: inicial?.cargo ?? "",
    instituicao: inicial?.instituicao === "—" ? "" : (inicial?.instituicao ?? ""),
    esfera: inicial?.esfera ?? "",
    programa: inicial?.programaId ?? "",
    modalidade: inicial?.modalidade ?? "",
    participantesEstimados: inicial?.participantesEstimados !== null && inicial !== null ? String(inicial.participantesEstimados) : "",
    mensagem: inicial?.mensagem ?? "",
    cliente: inicial?.clienteId ?? "",
    novoClienteOrgao: "",
    responsavel: inicial?.responsavelId ?? "",
    valorEstimado: inicial?.valorEstimado !== null && inicial !== null ? String(inicial.valorEstimado) : "",
    dataPrevistaEvento: inicial?.dataPrevistaEventoISO ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const m = <K extends keyof DadosLeadManual>(campo: K) => (v: DadosLeadManual[K]) => setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await salvarLeadCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar} className="pcms-form-lead">
      <AvisoForm erro={erro} />
      <div className="pcms-editor__head--sub">Contato</div>
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Nome" valor={dados.nome} onMudar={m("nome")} obrigatorio />
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} obrigatorio />
        <CampoTexto rotulo="Telefone" valor={dados.telefone} onMudar={m("telefone")} curto />
        <CampoTexto rotulo="Cargo" valor={dados.cargo} onMudar={m("cargo")} />
      </div>
      <div className="pcms-editor__head--sub">Órgão</div>
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Instituição (como informada)" valor={dados.instituicao} onMudar={m("instituicao")} />
        <CampoSelect rotulo="Esfera" valor={dados.esfera} onMudar={m("esfera")} opcoes={paraOpcoes(ESFERA_INSTITUCIONAL)} />
        <CampoSelect rotulo="Cliente" valor={dados.cliente} onMudar={m("cliente")} opcoes={clientes.map((c) => ({ label: c.orgao, value: c.id }))} />
        {inicial === null && dados.cliente === "" && (
          <CampoTexto rotulo="Ou criar cliente novo (órgão)" valor={dados.novoClienteOrgao} onMudar={m("novoClienteOrgao")} />
        )}
      </div>
      <div className="pcms-editor__head--sub">Interesse</div>
      <div className="pcms-editor__grid">
        <CampoSelect rotulo="Programa" valor={dados.programa} onMudar={m("programa")} opcoes={catalogo.programas.map((p) => ({ label: `${p.sigla} — ${p.nome}`, value: p.id }))} />
        <CampoSelect rotulo="Modalidade" valor={dados.modalidade} onMudar={m("modalidade")} opcoes={paraOpcoes(MODALIDADE_PROPOSTA)} />
        <CampoNumero rotulo="Participantes estimados" valor={dados.participantesEstimados} onMudar={m("participantesEstimados")} curto />
        <CampoNumero rotulo="Valor estimado (R$)" valor={dados.valorEstimado} onMudar={m("valorEstimado")} curto />
        <CampoData rotulo="Data prevista do evento" valor={dados.dataPrevistaEvento} onMudar={m("dataPrevistaEvento")} />
        <CampoSelect rotulo="Responsável" valor={dados.responsavel} onMudar={m("responsavel")} opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))} />
      </div>
      <CampoArea rotulo="Mensagem" valor={dados.mensagem} onMudar={m("mensagem")} />
      <CampoArea rotulo="Observações internas" valor={dados.observacoes} onMudar={m("observacoes")} />
      <div className="pcms-modal__foot">
        <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onCancelar} disabled={salvando}>Cancelar</button>
        <button type="submit" className="pcms-btn" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: `ModalLead.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import { ESTAGIOS_LEAD, MOTIVOS_PERDA, rotuloDoEstagio } from "@ntc/lib";

import type { CatalogoCrm, ClienteCrmResumo, LeadCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { adicionarNotaCrm, marcarLeadPerdidoCrm, moverLeadCrm, reabrirLeadCrm, vincularClienteCrm } from "../acoesCrm";
import { AvisoForm } from "./CamposCrm";
import { FormLead } from "./FormLead";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { seloDeEstagioLead } from "./seloStatus";

type Aba = "dados" | "historico";

interface ModalLeadProps {
  /** null = modo criação (Novo Lead). */
  lead: LeadCrmDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  onFechar: () => void;
  /** Recarrega o lead após qualquer escrita (o pai chama carregarLeadCrm). */
  onAtualizado: (id: string) => void;
  onAbrirCliente: (id: string) => void;
}

/** Modal único do lead (spec §4.4): usado no kanban, em Leads e no cliente. A aba Ações chega na Sessão 2. */
export function ModalLead({ lead, clientes, catalogo, usuarios, onFechar, onAtualizado, onAbrirCliente }: ModalLeadProps) {
  const [aba, setAba] = useState<Aba>("dados");
  const [editando, setEditando] = useState(lead === null);
  const [perdendo, setPerdendo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [clienteNovo, setClienteNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, iniciar] = useTransition();

  function executar(acao: () => Promise<{ ok: boolean; erro?: string }>, depois?: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) { setErro(r.erro ?? "Erro."); return; }
      depois?.();
      if (lead) onAtualizado(lead.id);
    });
  }

  const titulo = lead ? (lead.clienteNome ?? lead.instituicao) : "Novo lead";

  return (
    <div className="pcms-modal__overlay" role="dialog" aria-modal="true" aria-labelledby="pcms-modal-lead-titulo" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="pcms-modal pcms-modal--largo">
        <div className="pcms-modal__head">
          <div>
            <p className="pcms-pagehead__eyebrow">{lead ? `Lead · ${lead.nome}` : "Comercial"}</p>
            <h2 id="pcms-modal-lead-titulo">
              {lead?.clienteId ? (
                <button type="button" className="pcms-link" onClick={() => onAbrirCliente(lead.clienteId as string)}>{titulo}</button>
              ) : titulo}
            </h2>
          </div>
          <button type="button" className="pcms-modal__fechar" onClick={onFechar} aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {lead && (
          <div className="pcms-modal__barra">
            <label className="pcms-modal__estagio">
              Estágio
              <select value={lead.estagio} disabled={ocupado || lead.perdido} aria-label="Estágio do lead" onChange={(e) => executar(() => moverLeadCrm(lead.id, e.target.value))}>
                {ESTAGIOS_LEAD.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </label>
            <span className={seloDeEstagioLead(lead.estagio)}>{rotuloDoEstagio(lead.estagio)}</span>
            {lead.perdido && <span className="pcms-selo pcms-selo--erro">Perdido · {MOTIVOS_PERDA.find((m) => m.value === lead.motivoPerda)?.label ?? lead.motivoPerda}</span>}
            <span className="pcms-modal__resp">{lead.responsavelNome ?? "Sem responsável"}</span>
            <div className="pcms-modal__acoes">
              {!lead.perdido && !editando && <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" onClick={() => setEditando(true)}>Editar</button>}
              {lead.perdido ? (
                <button type="button" className="pcms-btn pcms-btn--mini" disabled={ocupado} onClick={() => executar(() => reabrirLeadCrm(lead.id))}>Reabrir</button>
              ) : (
                <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" disabled={ocupado} onClick={() => setPerdendo((v) => !v)}>Marcar como perdido</button>
              )}
            </div>
          </div>
        )}

        {lead && perdendo && (
          <form className="pcms-modal__perda" onSubmit={(e) => { e.preventDefault(); executar(() => marcarLeadPerdidoCrm(lead.id, motivo, detalhe), () => setPerdendo(false)); }}>
            <label>Motivo
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
                <option value="">Selecione</option>
                {MOTIVOS_PERDA.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </label>
            <label>Detalhe<input type="text" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} /></label>
            <button type="submit" className="pcms-btn pcms-btn--mini" disabled={ocupado}>Confirmar perda</button>
          </form>
        )}

        {lead && (
          <div className="pcms-modal__abas" role="tablist">
            {(["dados", "historico"] as Aba[]).map((a) => (
              <button key={a} type="button" role="tab" aria-selected={aba === a} className={`pcms-chip${aba === a ? " pcms-chip--ativo" : ""}`} onClick={() => setAba(a)}>
                {a === "dados" ? "Dados" : "Histórico"}
              </button>
            ))}
          </div>
        )}

        <div className="pcms-modal__body">
          <AvisoForm erro={erro} />
          {editando ? (
            <FormLead inicial={lead} clientes={clientes} catalogo={catalogo} usuarios={usuarios}
              onSalvo={() => { setEditando(false); if (lead) onAtualizado(lead.id); else onFechar(); }}
              onCancelar={() => (lead ? setEditando(false) : onFechar())} />
          ) : lead && aba === "dados" ? (
            <>
              <section className="pcms-det-bloco">
                <h3>Contato</h3>
                <dl className="pcms-deflist">
                  <dt>Nome</dt><dd>{lead.nome}</dd>
                  <dt>E-mail</dt><dd>{lead.email}</dd>
                  <dt>Telefone</dt><dd>{lead.telefone ?? "—"}</dd>
                  <dt>Cargo</dt><dd>{lead.cargo ?? "—"}</dd>
                  <dt>Instituição informada</dt><dd>{lead.instituicao}</dd>
                  <dt>Esfera</dt><dd>{lead.esfera ?? "—"}</dd>
                </dl>
              </section>
              <section className="pcms-det-bloco">
                <h3>Interesse</h3>
                <dl className="pcms-deflist">
                  <dt>Programa</dt><dd>{lead.programaSigla ?? "—"}</dd>
                  <dt>Modalidade</dt><dd>{lead.modalidade ?? "—"}</dd>
                  <dt>Participantes estimados</dt><dd>{lead.participantesEstimados ?? "—"}</dd>
                  <dt>Valor estimado</dt><dd>{lead.valorEstimado !== null ? formatarMoedaBRL(lead.valorEstimado) : "—"}</dd>
                  <dt>Data prevista</dt><dd>{lead.dataPrevistaEventoISO?.split("-").reverse().join("/") ?? "—"}</dd>
                </dl>
                {lead.mensagem && <blockquote className="pcms-modal__mensagem">{lead.mensagem}</blockquote>}
                {lead.observacoes && <p><strong>Observações internas:</strong> {lead.observacoes}</p>}
              </section>
              <section className="pcms-det-bloco">
                <h3>Cliente</h3>
                <p>{lead.clienteNome ?? "Sem cliente vinculado"}{lead.clienteCasadoPor && <small> · vínculo por {lead.clienteCasadoPor}</small>}</p>
                <div className="pcms-modal__vincular">
                  <select value={clienteNovo} onChange={(e) => setClienteNovo(e.target.value)} aria-label="Trocar cliente">
                    <option value="">Trocar cliente…</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.orgao}</option>)}
                  </select>
                  <button type="button" className="pcms-btn pcms-btn--mini" disabled={ocupado || clienteNovo === ""} onClick={() => executar(() => vincularClienteCrm(lead.id, clienteNovo), () => setClienteNovo(""))}>Vincular</button>
                </div>
              </section>
              <section className="pcms-det-bloco">
                <h3>Origem e LGPD</h3>
                <dl className="pcms-deflist">
                  <dt>Entrada</dt><dd>{lead.origemEntrada}</dd>
                  {lead.origem.map((o) => (<><dt key={`${o.rotulo}-t`}>{o.rotulo}</dt><dd key={`${o.rotulo}-d`}>{o.valor}</dd></>))}
                  <dt>Consentimento</dt><dd>{lead.consentimento.aceito ? `Aceito em ${lead.consentimento.timestamp ?? "—"} · política ${lead.consentimento.politicaVersao ?? "—"} · IP ${lead.consentimento.ipSubmissao ?? "—"}` : "Não registrado (lead manual)"}</dd>
                </dl>
              </section>
            </>
          ) : lead ? (
            <LinhaDoTempo itens={lead.linhaDoTempo} onNota={lead.clienteId ? async (t) => { const r = await adicionarNotaCrm(lead.clienteId as string, lead.id, t); if (r.ok) onAtualizado(lead.id); return r.ok ? null : (r.erro ?? "Erro."); } : undefined} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

(Fragment com `key` dentro do `map` de origem: usar `<Fragment key={o.rotulo}>` importando `Fragment` de `react` — o lint recusa fragment curto com key.)

- [ ] **Step 5: `TelaLeadsCrm.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";

import { ESTAGIOS_LEAD, rotuloDoEstagio } from "@ntc/lib";

import type { LeadCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";

import { seloDeEstagioLead } from "./seloStatus";

interface TelaLeadsCrmProps {
  leads: LeadCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function TelaLeadsCrm({ leads, usuarios, onAbrir, onNovo }: TelaLeadsCrmProps) {
  const [estagio, setEstagio] = useState("");
  const [situacao, setSituacao] = useState<"ativos" | "perdidos" | "todos">("ativos");
  const [responsavel, setResponsavel] = useState("");
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) =>
      (estagio === "" || l.estagio === estagio) &&
      (situacao === "todos" || (situacao === "perdidos") === l.perdido) &&
      (responsavel === "" || l.responsavelId === responsavel) &&
      (termo === "" || [l.instituicao, l.nome, l.email, l.clienteNome ?? ""].some((v) => v.toLowerCase().includes(termo))),
    );
  }, [leads, estagio, situacao, responsavel, busca]);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Leads</h1>
          <p>{leads.length} {leads.length === 1 ? "lead" : "leads"} — pedidos de proposta do site e leads criados à mão.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>Novo lead</button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <input type="search" className="pcms-input pcms-kanban__busca" placeholder="Buscar" aria-label="Buscar leads" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="pcms-input" aria-label="Estágio" value={estagio} onChange={(e) => setEstagio(e.target.value)}>
          <option value="">Todos os estágios</option>
          {ESTAGIOS_LEAD.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select className="pcms-input" aria-label="Situação" value={situacao} onChange={(e) => setSituacao(e.target.value as typeof situacao)}>
          <option value="ativos">Ativos</option>
          <option value="perdidos">Perdidos</option>
          <option value="todos">Todos</option>
        </select>
        <select className="pcms-input" aria-label="Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
          <option value="">Todos os responsáveis</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
      </div>

      {visiveis.length === 0 ? (
        <div className="pcms-vazio">Nenhum lead com esses filtros.</div>
      ) : (
        <table className="pcms-tabela">
          <thead><tr><th>Recebido</th><th>Órgão</th><th>Contato</th><th>Programa</th><th>Estágio</th><th>Responsável</th></tr></thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.id} className="pcms-linha-click" role="button" tabIndex={0} aria-label={`Abrir lead de ${l.instituicao}`}
                onClick={() => onAbrir(l.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(l.id); } }}>
                <td>{FMT.format(new Date(l.criadoEmISO))}</td>
                <td><strong>{l.clienteNome ?? l.instituicao}</strong></td>
                <td><div className="pcms-cel-nome"><span><strong>{l.nome}</strong><small>{l.email}</small></span></div></td>
                <td>{l.programaSigla ?? "—"}</td>
                <td><span className={seloDeEstagioLead(l.estagio)}>{rotuloDoEstagio(l.estagio)}</span>{l.perdido && <> <span className="pcms-selo pcms-selo--erro">Perdido</span></>}</td>
                <td>{l.responsavelNome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 6: Ligar no `ShellCrm.tsx` e apagar o antigo**

- Estado: trocar `leadDet: LeadCmsDetalhe | null` por `modalLead: { modo: "ver"; lead: LeadCrmDetalhe } | { modo: "novo" } | null`.
- `abrirLead(id)`: `iniciarCarga(async () => { const det = await carregarLeadCrm(id); if (det) setModalLead({ modo: "ver", lead: det }); })`. `recarregarLead(id)` = mesma coisa (usado por `onAtualizado`).
- Render: o modal é **sobreposição**, não substitui a tela — renderizar `{modalLead && <ModalLead lead={modalLead.modo === "ver" ? modalLead.lead : null} clientes={clientes} catalogo={catalogo} usuarios={usuarios} onFechar={() => setModalLead(null)} onAtualizado={recarregarLead} onAbrirCliente={(id) => { setModalLead(null); abrirCliente(id); }} />}` no fim do `ShellPainel`, fora do ramo `leadDet ? … :`.
- `tela === "leads"`: `<TelaLeadsCrm leads={leadsLocal} usuarios={usuarios} onAbrir={abrirLead} onNovo={() => setModalLead({ modo: "novo" })} />`.
- Apagar imports de `DetalheLead`, `TelaLeads`, `carregarLead`, `LeadCmsDetalhe`; `git rm apps/cms/src/app/\(painel\)/TelaLeads.tsx apps/cms/src/app/\(painel\)/DetalheLead.tsx`. Se `carregarLead`/`obterLeadCms` ficarem sem chamador (grep), apagar também de `acoes.ts`/`painelCms.ts` — não deixar código morto.

- [ ] **Step 7: CSS** (acrescentar ao bloco CRM Kanban)

```css
.pcms-modal--largo { max-width: 880px; }
.pcms-modal__barra { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 26px; border-bottom: 1px solid var(--pcms-pergaminho); font-size: 0.88rem; }
.pcms-modal__estagio { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--pcms-oxford); }
.pcms-modal__resp { color: var(--pcms-grafite-suave); }
.pcms-modal__acoes { margin-left: auto; display: flex; gap: 8px; }
.pcms-modal__perda { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; padding: 12px 26px; background: var(--pcms-pergaminho); }
.pcms-modal__perda label { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; }
.pcms-modal__abas { display: flex; gap: 8px; padding: 12px 26px 0; }
.pcms-modal__mensagem { margin: 12px 0 0; padding: 10px 14px; border-left: 3px solid var(--pcms-dourado); background: var(--pcms-pergaminho); white-space: pre-wrap; }
.pcms-modal__vincular { display: flex; gap: 8px; margin-top: 8px; }
.pcms-link { background: none; border: 0; padding: 0; color: inherit; font: inherit; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.pcms-timeline__nota { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.pcms-timeline__nota textarea { font: inherit; padding: 8px 10px; border: 1px solid var(--pcms-linha); }
.pcms-timeline__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.pcms-timeline__item { display: grid; grid-template-columns: 120px 1fr; gap: 12px; padding-left: 12px; border-left: 2px solid var(--pcms-linha); font-size: 0.88rem; }
.pcms-timeline__item time { color: var(--pcms-grafite-suave); }
.pcms-timeline__item p { margin: 4px 0; white-space: pre-wrap; }
.pcms-timeline__item small { color: var(--pcms-grafite-suave); }
.pcms-timeline__item--perda { border-left-color: var(--pcms-cardeal, #8e2b27); }
.pcms-timeline__item--nota { border-left-color: var(--pcms-dourado); }
```

- [ ] **Step 8: Verificar** — `pnpm lint && pnpm typecheck && pnpm test` verdes. No dev: clicar num card abre o modal; mudar o estágio no select move o card; "Marcar como perdido" tira do quadro e aparece em Leads → Perdidos; "Reabrir" volta; nota aparece no Histórico; Novo Lead com "criar cliente novo" cria os dois e o card nasce em Lead.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(crm): modal do lead com dados, histórico e nota; tela Leads do CRM e Novo Lead"
```

---

### Task 11: Cliente como ativo — contatos editáveis, negócios, linha do tempo, eventos

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/EditorContatos.tsx`
- Modify: `crm/FormCliente.tsx`, `crm/DetalheCliente.tsx`, `crm/ShellCrm.tsx`, `painel.css`

**Interfaces:**
- Consumes: `ClienteCrmDetalhe` (com `negocios`, `linhaDoTempo`, `eventos`), `DadosContato`, `adicionarNotaCrm`, `<LinhaDoTempo>`, `seloDeEstagioLead`, `rotuloDoEstagio`.
- Produces: `<EditorContatos contatos onMudar />`; `DetalheCliente` com props `{ cliente, onVoltar, onEditar, onAbrirLead, onNovoLead, onNota }`.

- [ ] **Step 1: `EditorContatos.tsx`**

```tsx
"use client";

import type { DadosContato } from "@/lib/cms/painelCrmEscrita";

interface EditorContatosProps {
  contatos: DadosContato[];
  onMudar: (contatos: DadosContato[]) => void;
}

const VAZIO: DadosContato = { nome: "", cargo: "", setor: "", email: "", whatsapp: "", principal: false, decisor: false };

/** Array de contatos do cliente, inline. Marcar um como principal desmarca os outros. */
export function EditorContatos({ contatos, onMudar }: EditorContatosProps) {
  const mudar = (i: number, campo: keyof DadosContato, v: string | boolean) =>
    onMudar(
      contatos.map((c, j) => {
        if (campo === "principal" && v === true) return { ...c, principal: j === i };
        return j === i ? { ...c, [campo]: v } : c;
      }),
    );

  return (
    <div className="pcms-contatos">
      <div className="pcms-editor__head--sub">Contatos</div>
      {contatos.length === 0 && <p className="pcms-vazio">Nenhum contato. Adicione a pessoa com quem vocês falam no órgão.</p>}
      {contatos.map((c, i) => (
        <fieldset key={i} className="pcms-contatos__linha">
          <legend className="pcms-sr-only">Contato {i + 1}</legend>
          <input aria-label="Nome" placeholder="Nome" value={c.nome} onChange={(e) => mudar(i, "nome", e.target.value)} required />
          <input aria-label="Cargo" placeholder="Cargo" value={c.cargo} onChange={(e) => mudar(i, "cargo", e.target.value)} />
          <input aria-label="Setor" placeholder="Setor" value={c.setor} onChange={(e) => mudar(i, "setor", e.target.value)} />
          <input aria-label="E-mail" type="email" placeholder="E-mail" value={c.email} onChange={(e) => mudar(i, "email", e.target.value)} />
          <input aria-label="WhatsApp" placeholder="WhatsApp" value={c.whatsapp} onChange={(e) => mudar(i, "whatsapp", e.target.value)} />
          <label><input type="radio" name="contato-principal" checked={c.principal} onChange={() => mudar(i, "principal", true)} /> Principal</label>
          <label><input type="checkbox" checked={c.decisor} onChange={(e) => mudar(i, "decisor", e.target.checked)} /> Decisor</label>
          <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" aria-label={`Remover contato ${c.nome || i + 1}`} onClick={() => onMudar(contatos.filter((_, j) => j !== i))}>Remover</button>
        </fieldset>
      ))}
      <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" onClick={() => onMudar([...contatos, { ...VAZIO, principal: contatos.length === 0 }])}>Adicionar contato</button>
    </div>
  );
}
```

(Se `pcms-sr-only` não existir, acrescentar no CSS: `.pcms-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`.)

- [ ] **Step 2: `FormCliente.tsx` com contatos**

No estado inicial: `contatos: inicial?.contatos.map((c) => ({ nome: c.nome, cargo: c.cargo ?? "", setor: c.setor ?? "", email: c.email ?? "", whatsapp: c.whatsapp ?? "", principal: c.principal, decisor: c.decisor })) ?? []`. Depois do grid de dados, antes de Observações: `<EditorContatos contatos={dados.contatos} onMudar={m("contatos")} />`. Manter `ORIGENS_CLIENTE` no select de origem.

- [ ] **Step 3: `DetalheCliente.tsx` — o ativo**

Reescrever com quatro blocos, nesta ordem, e o cabeçalho com "Editar" e "Novo lead":

```tsx
"use client";

import { AREAS_CRM, ESFERAS_CRM, ORIGENS_CLIENTE, TIPOS_INSTITUICAO, rotuloDoEstagio } from "@ntc/lib";

import type { ClienteCrmDetalhe } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { LinhaDoTempo } from "./LinhaDoTempo";
import { rotuloDeLista, seloDeEstagioLead } from "./seloStatus";

interface DetalheClienteProps {
  cliente: ClienteCrmDetalhe;
  onVoltar: () => void;
  onEditar: () => void;
  onAbrirLead: (id: string) => void;
  onNovoLead: () => void;
  onNota: (texto: string) => Promise<string | null>;
}

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const ROTULO_STATUS_EVENTO: Record<string, string> = { agendado: "Agendado", realizado: "Realizado", cancelado: "Cancelado" };

export function DetalheCliente({ cliente: c, onVoltar, onEditar, onAbrirLead, onNovoLead, onNota }: DetalheClienteProps) {
  const dados = [
    { rotulo: "Órgão", valor: c.orgao },
    { rotulo: "Sigla", valor: c.sigla ?? "—" },
    { rotulo: "Tipo", valor: rotuloDeLista(TIPOS_INSTITUICAO, c.tipo) },
    { rotulo: "Município", valor: c.municipio !== null ? `${c.municipio}${c.uf !== null ? ` / ${c.uf}` : ""}` : (c.uf ?? "—") },
    { rotulo: "Esfera", valor: rotuloDeLista(ESFERAS_CRM, c.esfera) },
    { rotulo: "Área", valor: rotuloDeLista(AREAS_CRM, c.area) },
    { rotulo: "CNPJ", valor: c.cnpj ?? "—" },
    { rotulo: "E-mail", valor: c.email ?? "—" },
    { rotulo: "Origem", valor: rotuloDeLista(ORIGENS_CLIENTE, c.origem) },
    { rotulo: "Responsável", valor: c.responsavelNome ?? "—" },
  ];

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Clientes <span>/ {c.orgao}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Cliente</p>
          <h1>{c.orgao}</h1>
          {c.observacoes && <p>{c.observacoes}</p>}
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onEditar}>Editar</button>
          <button type="button" className="pcms-btn" onClick={onNovoLead}>Novo lead</button>
        </div>
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          <section className="pcms-det-bloco">
            <h2>Dados</h2>
            <dl className="pcms-deflist">{dados.map((d) => (<div key={d.rotulo}><dt>{d.rotulo}</dt><dd>{d.valor}</dd></div>))}</dl>
          </section>

          <section className="pcms-det-bloco">
            <h2>Contatos</h2>
            {c.contatos.length === 0 ? <div className="pcms-vazio">Nenhum contato cadastrado.</div> : (
              <table className="pcms-tabela">
                <thead><tr><th>Nome</th><th>Cargo</th><th>Setor</th><th>E-mail</th><th>WhatsApp</th><th></th></tr></thead>
                <tbody>{c.contatos.map((ct) => (
                  <tr key={`${ct.nome}-${ct.email ?? ""}`}>
                    <td><strong>{ct.nome}</strong></td><td>{ct.cargo ?? "—"}</td><td>{ct.setor ?? "—"}</td><td>{ct.email ?? "—"}</td><td>{ct.whatsapp ?? "—"}</td>
                    <td>{ct.principal && <span className="pcms-selo pcms-selo--ok">Principal</span>} {ct.decisor && <span className="pcms-selo pcms-selo--info">Decisor</span>}</td>
                  </tr>))}</tbody>
              </table>
            )}
          </section>

          <section className="pcms-det-bloco">
            <h2>Negócios</h2>
            {c.negocios.length === 0 ? <div className="pcms-vazio">Nenhum lead deste cliente.</div> : (
              <table className="pcms-tabela">
                <thead><tr><th>Recebido</th><th>Contato</th><th>Programa</th><th>Valor</th><th>Estágio</th></tr></thead>
                <tbody>{c.negocios.map((l) => (
                  <tr key={l.id} className="pcms-linha-click" role="button" tabIndex={0} aria-label={`Abrir lead de ${l.nome}`} onClick={() => onAbrirLead(l.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrirLead(l.id); } }}>
                    <td>{FMT.format(new Date(l.criadoEmISO))}</td><td>{l.nome}</td><td>{l.programaSigla ?? "—"}</td>
                    <td>{l.valorEstimado !== null ? formatarMoedaBRL(l.valorEstimado) : "—"}</td>
                    <td><span className={seloDeEstagioLead(l.estagio)}>{rotuloDoEstagio(l.estagio)}</span>{l.perdido && <> <span className="pcms-selo pcms-selo--erro">Perdido</span></>}</td>
                  </tr>))}</tbody>
              </table>
            )}
          </section>

          <section className="pcms-det-bloco">
            <h2>Eventos</h2>
            {c.eventos.length === 0 ? <div className="pcms-vazio">Nenhum evento ainda. (Agendar evento chega na Sessão 4.)</div> : (
              <ul className="pcms-eventos-cliente">{c.eventos.map((ev) => (
                <li key={ev.id}><strong>{ev.titulo}</strong> · {FMT.format(new Date(ev.dataInicioISO))} · {ev.modalidade ?? "—"} · <span className="pcms-selo pcms-selo--info">{ROTULO_STATUS_EVENTO[ev.status] ?? ev.status}</span></li>
              ))}</ul>
            )}
          </section>
        </div>

        <aside className="pcms-det-side">
          <section className="pcms-det-bloco">
            <h2>Linha do tempo</h2>
            <LinhaDoTempo itens={c.linhaDoTempo} onNota={onNota} />
          </section>
        </aside>
      </div>
    </>
  );
}
```

(Conferir se `pcms-det-grid`/`pcms-det-main`/`pcms-det-side` existem no `painel.css` — `DetalheLead` antigo usava `pcms-det-grid` e `pcms-det-main`; se `pcms-det-side` não existir, criar: `.pcms-det-side{min-width:320px}` e o grid em duas colunas `minmax(0,1fr) 360px` com `@media (max-width: 1100px){grid-template-columns:1fr}`.)

- [ ] **Step 4: `ShellCrm.tsx`**

`DetalheCliente` recebe `onAbrirLead={abrirLead}`, `onNovoLead={() => setModalLead({ modo: "novo" })}` e `onNota={async (t) => { const r = await adicionarNotaCrm(clienteDet.id, null, t); if (r.ok) abrirCliente(clienteDet.id); return r.ok ? null : (r.erro ?? "Erro."); }}`. Quando o modal fecha e há `clienteDet` aberto, recarregar o cliente (`abrirCliente(clienteDet.id)`) para a linha do tempo refletir o que o modal fez. Novo lead aberto de dentro do cliente pré-seleciona o cliente: passar `clientePreSelecionado={clienteDet?.id}` ao `ModalLead` → `FormLead` (prop opcional `clientePreSelecionado?: string`, usada como default de `dados.cliente` quando `inicial === null`).

- [ ] **Step 5: CSS**

```css
.pcms-contatos__linha { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.4fr 1fr auto auto auto; gap: 8px; align-items: center; border: 1px solid var(--pcms-linha); padding: 10px; margin: 0 0 8px; }
.pcms-contatos__linha input:not([type="radio"]):not([type="checkbox"]) { font: inherit; padding: 6px 8px; border: 1px solid var(--pcms-linha); min-width: 0; }
.pcms-contatos__linha label { font-size: 0.82rem; white-space: nowrap; }
@media (max-width: 1100px) { .pcms-contatos__linha { grid-template-columns: 1fr 1fr; } }
.pcms-eventos-cliente { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem; }
```

- [ ] **Step 6: Verificar** — `pnpm lint && pnpm typecheck && pnpm test` verdes. No dev: Novo Cliente com dois contatos, um principal (tentar dois principais → mensagem "Só um contato pode ser o principal."); detalhe mostra os 4 blocos; nota manual aparece na linha do tempo; "Novo lead" de dentro do cliente nasce vinculado; abrir um negócio abre o modal.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(crm): cliente como ativo — contatos editáveis, negócios, linha do tempo com nota e eventos"
```

---

### Task 12: Documentação, roteiro do `push:schema`, build e checkpoint visual

**Files:**
- Modify: `CLAUDE.md`, `docs/16_Roadmap_CMS_CRM_v1.md`, `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md`

- [ ] **Step 1: `CLAUDE.md`**

Acrescentar no topo do "Histórico de revisões" a entrada **v3.0 — <data>** resumindo: spec de 15/09 aprovado; H4 e D2 descartadas (tags `arquivo/*`); Sessão 1 do CRM Kanban entregue na branch `feat/crm-kanban-sessao-1`; coleções 22 → 22 (−`oportunidades`, `historico-estagio`, `avaliacoes-qualificacao`, `contatos-crm`; +`linha-do-tempo`, `envios-email`, `modelos-email`, `eventos-comerciais`); `leads.status` removido; `propostas.oportunidade` → `propostas.lead`; `push:schema` pendente (com a lista dos `DROP` esperados); checkpoint visual pendente. Reescrever a **§19** inteira: 19.1 estrutura (menu Comercial · Catálogo; coleções atuais; hooks `casarClienteDoLead` e `registrarLeadNaLinhaDoTempo`), 19.2 o que funciona (kanban, modal, cliente ativo, linha do tempo, propostas com lead), 19.3 backlog (Sessões 2–5 do spec + as pendências antigas que continuam: Resend na Vercel, Turnstile, bucket privado na Vercel, passkey checkpoint, Configurações demonstrativa; **remover** itens 5, 8, 9, 10, 11, 12 antigos ou reescrevê-los como "substituído pelo spec de 15/09"), 19.4 housekeeping (incluir as tags `arquivo/*` e o worktree `portal-ntc-cms`), 19.5 regra de formulários (sem mudança de conteúdo; só tirar a menção a `status`). Atualizar a linha final de versão.

- [ ] **Step 2: `docs/16` e `docs/17`**

No cabeçalho de cada um, logo abaixo de "Versão", inserir:

> **Nota (16/09/2026):** as Janelas/Sessões deste documento que tratam do CRM (Janela H inteira no `docs/17`; Sessões D2 e E3 e Janelas F e G no `docs/16`) foram **substituídas** pelo spec `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md`. O texto abaixo é mantido como histórico e não deve ser executado.

- [ ] **Step 3: Build com o dev parado**

Parar o `pnpm dev`. `pnpm build` no monorepo → verde. Depois `rm -rf apps/cms/.next` antes de subir o dev de novo (memória: build corrompe o dev).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/16_Roadmap_CMS_CRM_v1.md docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md
git commit -m "docs: CLAUDE.md v3.0 — CRM kanban sessão 1; docs/16 e docs/17 marcados como substituídos"
```

- [ ] **Step 5: Roteiro do `push:schema` (manual, do PO — o agente só entrega este texto)**

1. Parar o dev server. Conferir `git branch --show-current` = `feat/crm-kanban-sessao-1` e `git worktree list` sem worktree do CRM vivo além deste (o `portal-ntc-cms` é da `feat/cms-soberana`, 100% mergeada, e não toca schema do CRM — mas o ideal é removê-lo antes, `git worktree remove /Users/joao/Documents/portal-ntc-cms`).
2. `pnpm --filter @ntc/cms payload:push:schema`. Ler o diff. **`DROP` esperados (responder `Y`):** tabelas `oportunidades`, `oportunidades_rels`, `oportunidades_modulos`/`_eventos` (ou como o Payload nomeou as `hasMany`), `historico_estagio`, `avaliacoes_qualificacao`, `contatos_crm`, os enums `enum_oportunidades_*`, `enum_historico_estagio_*`, `enum_avaliacoes_qualificacao_*`, e as colunas `leads.status`, `clientes_crm.dirigente`, `clientes_crm.cargo_dirigente`, `clientes_crm.potencial`, `clientes_crm.status`, `clientes_crm.proxima_acao`, `propostas.oportunidade_id`, e o enum `enum_leads_status`. **Qualquer outro `DROP` é `N`** e volta para o agente.
3. `pnpm --filter @ntc/cms payload:generate`; `git status` deve ficar limpo (os tipos já foram gerados na branch).
4. Subir o dev e seguir o checkpoint abaixo.

- [ ] **Step 6: Checkpoint visual humano (CLAUDE.md §6)** — roteiro para o PO, com o dev no ar:

1. `/crm` → Dashboard: 4 KPIs; quadro com 10 colunas; os 4 leads de `tipo = proposta` existentes na coluna **Lead**, cada um já vinculado a um cliente criado automaticamente (conferir em Clientes: 4 clientes novos com `origem = Lead do site` e a pessoa como contato principal; se dois leads eram do mesmo órgão/domínio, 3 clientes e um lead casado por domínio/nome — ver `clienteCasadoPor` no modal).
2. Arrastar um card para **Em contato**; recarregar; continua lá; modal → Histórico mostra "Lead → Em contato" com seu nome.
3. Modal → Marcar como perdido (motivo "Sem resposta"); card some; toggle "Mostrar perdidos" mostra em cinza; Leads → Perdidos lista; Reabrir devolve à coluna Em contato.
4. Leads → Novo lead com "criar cliente novo"; card nasce em Lead; cliente aparece em Clientes.
5. Clientes → abrir um; editar; adicionar 2º contato marcando Principal (o 1º desmarca); salvar; detalhe mostra os dois; nota manual na linha do tempo.
6. Propostas → Nova proposta: o select "Lead" lista os leads; salvar; a proposta aparece; Gerar PDF continua funcionando.
7. Site: enviar o formulário de Proposta em `/contato` (dev do web no ar) → o lead aparece no quadro em segundos, com cliente casado ou criado, e a linha do tempo do cliente tem "Lead recebido pelo site".
8. Desktop 1440 e mobile 375 do Dashboard e do modal (o quadro rola horizontalmente; o modal ocupa a largura).

Reportar ao PO o que divergir antes de declarar a sessão concluída.

---

## Self-review (feito ao escrever)

**Cobertura do spec §8 (Sessão 1):** modelo de dados completo → Tasks 4–5; remoção das 4 coleções e telas → Task 5; Clientes (lista, detalhe com dados/contatos/negócios/linha do tempo, Novo Cliente) → Tasks 5, 11; Leads (filtro, modal Dados/Histórico, Novo Lead, casamento) → Tasks 7, 8, 10; Dashboard com KPIs novos e kanban com arraste e Perdido → Task 9; helper da linha do tempo → Task 6; `payload:generate` → Tasks 4, 5; docs → Task 12. §5.6 (apagar lead/cliente com dependentes): **não coberto nesta sessão** — nenhuma tela desta sessão expõe "apagar" (o botão não existe no painel para lead nem cliente); fica registrado no backlog da Task 12 como pendência da Sessão 4, junto com a exclusão de eventos. §4.2 "Valor em negociação" usa só `valorEstimado` até a Sessão 2 (anotado na Task 5).

**Desvios do spec, deliberados:** (1) tipo `lead` acrescentado à lista fechada de tipos da linha do tempo (§3.7) — precisa existir um item de entrada por lead, e "vinculo" não descreve isso. (2) `apps/web` é tocado em 4 linhas (remoção de `status: "novo"`) porque `leads.status` sai da coleção; a abordagem A dizia "formulários do site intactos" — o comportamento do site não muda. (3) `DadosLeadManual.novoClienteOrgao` para o "criar cliente na hora" do §4.3.

**Consistência de nomes entre tasks:** `ESTAGIOS_LEAD`/`ehEstagioLead`/`rotuloDoEstagio`/`diasEntre` (T1) usados em T5, T6, T8, T9, T10, T11; `casarCliente`/`ClienteCandidato` (T2) em T7; `montarItemLinhaDoTempo`/`tituloTransicao`/`tituloPerda` (T3) em T6; `registrarNaLinhaDoTempo` (T6) reservado para as Sessões 2–4; `context.casamentoAutomatico` (T6 ↔ T7); `LeadCrmResumo`/`listarLeadsCrm`/`mapearLeadCrm` (T5) em T8–T11; `LeadCrmDetalhe`/`ItemLinhaDoTempoResumo`/`EventoComercialResumo` (T8) em T10–T11; actions `carregarLeadCrm`/`salvarLeadCrm`/`moverLeadCrm`/`marcarLeadPerdidoCrm`/`reabrirLeadCrm`/`vincularClienteCrm`/`adicionarNotaCrm` (T8) em T9–T11; `DadosContato`/`DadosClienteCrm.contatos` (T5) em T11; `seloDeEstagioLead` (T5) em T10–T11.
