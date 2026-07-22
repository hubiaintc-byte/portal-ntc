# CRM Fase B1 — Propostas (registro) · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registrar propostas comerciais no módulo CRM (`/crm`) — modelagem, wizard de criação com cálculo ao vivo, versionamento completo e registro de envios — destravando as telas Propostas, Versões e Envios (hoje cascas "Em breve").

**Architecture:** Três coleções Payload novas (`propostas`, `versoes`, `envios`) espelhando o objeto legado de `NTC_Comercial_Premium.html`. Leitura em `painelCrm.ts` (`server-only`), escrita em `painelCrmEscrita.ts`, Server Actions em `acoesCrm.ts` — exatamente o padrão das entidades da Fase A. Cálculo de valores é uma função pura em `@ntc/lib`, compartilhada entre o wizard client (resumo ao vivo) e o servidor (grava derivados). Telas seguem o padrão SPA-de-telas do `ShellCrm`.

**Tech Stack:** Next.js 15 App Router (RSC + Client Components), Payload CMS 3 (Local API), TypeScript strict, Vitest.

## Global Constraints

- TypeScript strict, sem `any`/`unknown` quando há tipo conhecido (cast pontual campo-a-campo como em `painelCrmEscrita.ts`).
- Tipos do Payload vêm de `@/types/payload-types` (gerados) — regenerar com `pnpm payload:generate` após alterar coleções.
- Naming editorial em português (`criarProposta`, `TelaPropostas`); componentes PascalCase, utilitários kebab-case, hooks `useXxx`.
- `border-radius: 0` no site; o painel admin é exceção deliberada (§19 v1.5) e já usa as classes `pcms-*` — reutilizá-las, não inventar CSS.
- Schema com `push: false`. Nunca `payload:push:schema` com dev rodando. Sincronização é passo manual do PO no momento certo (ver Task 2).
- Server Actions são endpoints públicos: toda action valida sessão (`obterUsuarioCms()`) ANTES da Local API.
- Relationship do Payload é id numérico; `""` (placeholder "— selecionar —") vira `null` (`idOuNulo`); hasMany via `idsLista`.
- Branch `feat/crm-fase-b1`. Commits pequenos, Conventional Commits em português, sem emojis. **Sem `git push`** até ordem explícita.
- Origem canônica do comportamento legado: `NTC_Comercial_Premium.html` (funções `startPropostaWizard`, `finalizarWizard`, `novaVersaoProposta`, `registrarEnvioProposta`).

---

## File Structure

**Criar:**
- `packages/lib/src/crm/propostas.ts` — função pura `calcularValoresProposta` + gerador de código-base + helpers de versão.
- `packages/lib/src/crm/propostas.test.ts` — Vitest da lógica pura.
- `apps/cms/src/collections/Propostas.ts` — coleção `propostas`.
- `apps/cms/src/collections/VersoesProposta.ts` — coleção `versoes`.
- `apps/cms/src/collections/EnviosProposta.ts` — coleção `envios`.
- `apps/cms/src/app/(painel)/crm/TelaPropostas.tsx` — lista de propostas.
- `apps/cms/src/app/(painel)/crm/DetalheProposta.tsx` — detalhe + ações.
- `apps/cms/src/app/(painel)/crm/FormProposta.tsx` — wizard client reativo.
- `apps/cms/src/app/(painel)/crm/TelaVersoes.tsx` — histórico de versões.
- `apps/cms/src/app/(painel)/crm/TelaEnvios.tsx` — lista consolidada de envios.

**Modificar:**
- `packages/lib/src/crm/listas.ts` — 4 listas novas.
- `packages/lib/src/index.ts` (ou barrel `@ntc/lib`) — reexportar `propostas.ts` se necessário.
- `apps/cms/src/payload.config.ts` — registrar as 3 coleções.
- `apps/cms/src/lib/cms/painelCrm.ts` — tipos + funções de leitura.
- `apps/cms/src/lib/cms/painelCrmEscrita.ts` — tipos `DadosProposta`/`DadosEnvio` + funções de escrita.
- `apps/cms/src/app/(painel)/acoesCrm.ts` — Server Actions.
- `apps/cms/src/app/(painel)/crm/page.tsx` — carregar propostas/versões/envios e passar ao Shell.
- `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` — fiar as telas reais no lugar das cascas.

---

## Task 1: Lógica pura de propostas (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/propostas.ts`
- Test: `packages/lib/src/crm/propostas.test.ts`
- Modify: `packages/lib/src/crm/listas.ts`

**Interfaces:**
- Consumes: `slugDeRotulo`, `opcoes` de `listas.ts` (mesmo módulo `crm`).
- Produces:
  - `calcularValoresProposta(e: EntradaValores): ValoresProposta`
    - `EntradaValores = { valorUnitario: number; qtdPagantes: number; cortesias: number; percDesconto: number }`
    - `ValoresProposta = { valorBruto: number; desconto: number; valorLiquido: number; acessosTotais: number }`
  - `siglaCanonica(v: string): string` — remove tudo que não é `[A-Z0-9]`, upper.
  - `gerarCodigoBase(a: { ano: number; siglaPrograma: string; uf: string; siglaCliente: string }): string`
  - `proximaVersao(codigosExistentes: string[]): number` — 1 se vazio; senão max(versão)+1.
  - `codigoDaVersao(codigoBase: string, versao: number): string` — `${base}-v${'01'..}`.
  - Listas exportadas de `listas.ts`: `TIPOS_PROPOSTA`, `STATUS_PROPOSTA`, `CANAIS_ENVIO`, `STATUS_ENVIO` (todas `OpcaoLista[]`).

- [ ] **Step 1: Adicionar as 4 listas em `listas.ts`**

Ao final de `packages/lib/src/crm/listas.ts`:

```ts
export const TIPOS_PROPOSTA = opcoes([
  "Programa Completo", "Módulo Avulso", "Produto/Evento Avulso", "Customizada",
]);

export const STATUS_PROPOSTA = opcoes([
  "Rascunho", "Enviada", "Em análise", "Aprovada", "Recusada", "Substituída", "Expirada",
]);

export const CANAIS_ENVIO = opcoes([
  "E-mail", "WhatsApp", "Ofício", "Presencial", "Outro",
]);

export const STATUS_ENVIO = opcoes([
  "Enviada", "Recebida", "Em análise", "Respondida",
]);
```

- [ ] **Step 2: Escrever os testes (falhando)**

Create `packages/lib/src/crm/propostas.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  calcularValoresProposta,
  codigoDaVersao,
  gerarCodigoBase,
  proximaVersao,
  siglaCanonica,
} from "./propostas";

describe("calcularValoresProposta", () => {
  it("calcula bruto, desconto, líquido e acessos", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 100, qtdPagantes: 10, cortesias: 2, percDesconto: 10 }),
    ).toEqual({ valorBruto: 1000, desconto: 100, valorLiquido: 900, acessosTotais: 12 });
  });

  it("zera tudo com 0 pagantes", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 100, qtdPagantes: 0, cortesias: 5, percDesconto: 20 }),
    ).toEqual({ valorBruto: 0, desconto: 0, valorLiquido: 0, acessosTotais: 5 });
  });

  it("desconto de 100% zera o líquido", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 50, qtdPagantes: 4, cortesias: 0, percDesconto: 100 }),
    ).toEqual({ valorBruto: 200, desconto: 200, valorLiquido: 0, acessosTotais: 4 });
  });
});

describe("gerarCodigoBase", () => {
  it("monta NTC-PROP-ano-programa-uf-cliente com sigla sanitizada", () => {
    expect(
      gerarCodigoBase({ ano: 2026, siglaPrograma: "PROGE", uf: "SP", siglaCliente: "SEE-SP nº1" }),
    ).toBe("NTC-PROP-2026-PROGE-SP-SEESP1");
  });
});

describe("proximaVersao", () => {
  it("é 1 quando não há versões", () => {
    expect(proximaVersao([])).toBe(1);
  });
  it("é max+1 sobre o conjunto (pode ser esparso)", () => {
    expect(proximaVersao(["X-v01", "X-v03"])).toBe(4);
  });
});

describe("codigoDaVersao", () => {
  it("acrescenta -vNN com 2 dígitos", () => {
    expect(codigoDaVersao("NTC-PROP-2026-PROGE-SP-SEESP", 2)).toBe("NTC-PROP-2026-PROGE-SP-SEESP-v02");
  });
});

describe("siglaCanonica", () => {
  it("remove não-alfanuméricos e faz upper", () => {
    expect(siglaCanonica("Câmara nº 3")).toBe("CMARA3");
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/lib test -- propostas`
Expected: FAIL — módulo `./propostas` não existe.

- [ ] **Step 4: Implementar `propostas.ts`**

Create `packages/lib/src/crm/propostas.ts`:

```ts
/**
 * Lógica pura de propostas comerciais — espelha finalizarWizard/novaVersao do
 * protótipo NTC_Comercial_Premium.html. Sem I/O: usada no cliente (resumo ao
 * vivo do wizard) e no servidor (grava derivados). Fonte única da fórmula.
 */

export interface EntradaValores {
  valorUnitario: number;
  qtdPagantes: number;
  cortesias: number;
  percDesconto: number;
}

export interface ValoresProposta {
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
  acessosTotais: number;
}

export function calcularValoresProposta(e: EntradaValores): ValoresProposta {
  const valorBruto = e.valorUnitario * e.qtdPagantes;
  const desconto = (valorBruto * e.percDesconto) / 100;
  return {
    valorBruto,
    desconto,
    valorLiquido: valorBruto - desconto,
    acessosTotais: e.qtdPagantes + e.cortesias,
  };
}

/** "Câmara nº 3" → "CMARA3" — só [A-Z0-9], upper (esc de sigla do legado). */
export function siglaCanonica(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

export function gerarCodigoBase(a: {
  ano: number;
  siglaPrograma: string;
  uf: string;
  siglaCliente: string;
}): string {
  return `NTC-PROP-${a.ano}-${siglaCanonica(a.siglaPrograma)}-${a.uf.toUpperCase()}-${siglaCanonica(a.siglaCliente)}`;
}

/** Extrai o número de versão do sufixo -vNN de um código. 0 se não casar. */
function versaoDoCodigo(codigo: string): number {
  const m = codigo.match(/-v(\d+)$/);
  return m ? Number(m[1]) : 0;
}

export function proximaVersao(codigosExistentes: string[]): number {
  if (codigosExistentes.length === 0) return 1;
  return Math.max(...codigosExistentes.map(versaoDoCodigo)) + 1;
}

export function codigoDaVersao(codigoBase: string, versao: number): string {
  return `${codigoBase}-v${String(versao).padStart(2, "0")}`;
}
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `pnpm --filter @ntc/lib test -- propostas`
Expected: PASS (todos).

- [ ] **Step 6: Garantir reexport de `@ntc/lib`**

Verifique se `packages/lib/src/index.ts` reexporta o módulo `crm`. Se as listas já são exportadas via `export * from "./crm/listas"` (ou barrel `./crm`), acrescente ao mesmo lugar:

```ts
export * from "./crm/propostas";
```

Run: `pnpm --filter @ntc/lib build` (ou `pnpm typecheck`)
Expected: sem erros de tipo.

- [ ] **Step 7: Commit**

```bash
git add packages/lib/src/crm/propostas.ts packages/lib/src/crm/propostas.test.ts packages/lib/src/crm/listas.ts packages/lib/src/index.ts
git commit -m "feat(crm): logica pura de propostas (valores, codigo-base, versao) + listas"
```

---

## Task 2: Coleções Payload (`propostas`, `versoes`, `envios`)

**Files:**
- Create: `apps/cms/src/collections/Propostas.ts`
- Create: `apps/cms/src/collections/VersoesProposta.ts`
- Create: `apps/cms/src/collections/EnviosProposta.ts`
- Modify: `apps/cms/src/payload.config.ts`

**Interfaces:**
- Consumes: `atendimentoComercial`, `superAdmin` de `../access/*`; `TIPOS_PROPOSTA`, `STATUS_PROPOSTA`, `CANAIS_ENVIO`, `STATUS_ENVIO`, `UFS` de `@ntc/lib`.
- Produces: interfaces geradas `Proposta`, `VersaoProposta`, `EnvioProposta` em `payload-types` (via `typescript.interface`), consumidas pelas Tasks 3+.

Referência de padrão: `apps/cms/src/collections/Oportunidades.ts`.

- [ ] **Step 1: Criar `Propostas.ts`**

```ts
import type { CollectionConfig } from "payload";

import { STATUS_PROPOSTA, TIPOS_PROPOSTA } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Propostas comerciais (spec 2026-07-22 · Fase B1). Derivados (valorBruto,
 * desconto, valorLiquido) são gravados pela Server Action a partir dos inputs.
 * Versionamento: codigoBase agrupa versões; codigo é unique por versão.
 */
export const Propostas: CollectionConfig = {
  slug: "propostas",
  labels: { singular: "Proposta", plural: "Propostas" },
  typescript: { interface: "Proposta" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valorLiquido", "status", "versao"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codigoBase", type: "text", required: true, index: true },
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "versao", type: "number", defaultValue: 1 },
    { name: "oportunidade", type: "relationship", relationTo: "oportunidades" },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "programa", type: "relationship", relationTo: "programas" },
    { name: "tipo", type: "select", options: TIPOS_PROPOSTA },
    { name: "status", type: "select", options: STATUS_PROPOSTA, defaultValue: "rascunho" },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "valorUnitario", type: "number", min: 0 },
    { name: "qtdPagantes", type: "number", min: 0 },
    { name: "cortesias", type: "number", min: 0 },
    { name: "percDesconto", type: "number", min: 0, max: 100 },
    { name: "valorBruto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "desconto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "valorLiquido", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "modalidade", type: "text" },
    { name: "replay", type: "text" },
    { name: "condPagto", type: "text" },
    { name: "condEspecificas", type: "textarea" },
    { name: "observacoes", type: "textarea" },
    { name: "elaborador", type: "relationship", relationTo: "users" },
    { name: "aprovador", type: "relationship", relationTo: "users" },
    { name: "validadeDias", type: "number", defaultValue: 30 },
    { name: "dataCriacao", type: "date" },
    { name: "validade", type: "date" },
    { name: "motivoRevisao", type: "text" },
    { name: "substitui", type: "text", admin: { description: "Código da versão substituída." } },
  ],
};
```

- [ ] **Step 2: Criar `VersoesProposta.ts`**

```ts
import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/** Trilha de versionamento de propostas (spec 2026-07-22 · Fase B1). */
export const VersoesProposta: CollectionConfig = {
  slug: "versoes",
  labels: { singular: "Versão", plural: "Versões" },
  typescript: { interface: "VersaoProposta" },
  admin: {
    useAsTitle: "codBase",
    defaultColumns: ["codBase", "nVersao", "data", "vigente"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codBase", type: "text", required: true, index: true },
    { name: "nVersao", type: "number" },
    { name: "proposta", type: "relationship", relationTo: "propostas" },
    { name: "data", type: "date" },
    { name: "substitui", type: "text" },
    { name: "motivo", type: "text" },
    { name: "sintese", type: "text" },
    { name: "statusAnterior", type: "text" },
    { name: "vigente", type: "checkbox", defaultValue: true },
  ],
};
```

- [ ] **Step 3: Criar `EnviosProposta.ts`**

```ts
import type { CollectionConfig } from "payload";

import { CANAIS_ENVIO, STATUS_ENVIO } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/** Registro de envios de propostas — registro de fato, não disparo (Fase B1). */
export const EnviosProposta: CollectionConfig = {
  slug: "envios",
  labels: { singular: "Envio", plural: "Envios" },
  typescript: { interface: "EnvioProposta" },
  admin: {
    useAsTitle: "destinatarios",
    defaultColumns: ["proposta", "data", "canal", "status"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "proposta", type: "relationship", relationTo: "propostas", required: true },
    { name: "data", type: "date" },
    { name: "canal", type: "select", options: CANAIS_ENVIO },
    { name: "destinatarios", type: "text" },
    { name: "status", type: "select", options: STATUS_ENVIO },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 4: Registrar no `payload.config.ts`**

Import junto dos outros de `./collections` e acrescentar ao array `collections` (perto de `Oportunidades`):

```ts
import { Propostas } from "./collections/Propostas";
import { VersoesProposta } from "./collections/VersoesProposta";
import { EnviosProposta } from "./collections/EnviosProposta";
```

No array:

```ts
    Oportunidades,
    Propostas,
    VersoesProposta,
    EnviosProposta,
```

- [ ] **Step 5: Regenerar tipos**

Run: `pnpm payload:generate`
Expected: `payload-types` passa a exportar `Proposta`, `VersaoProposta`, `EnvioProposta`. (Não requer dev rodando; não faz db push.)

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: sem erros (coleções bem tipadas, tipos gerados presentes).

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/collections/Propostas.ts apps/cms/src/collections/VersoesProposta.ts apps/cms/src/collections/EnviosProposta.ts apps/cms/src/payload.config.ts packages/types
git commit -m "feat(crm): coleções propostas, versoes e envios"
```

> **Nota de schema (manual, fora do fluxo de tasks):** a sincronização do banco (`pnpm payload:push:schema`) é feita pelo PO, sem dev rodando, com diff de collections antes. Enquanto não sincronizar, `/crm` continua funcionando; leituras das novas coleções caem no `try/catch → erroLeitura` (Task 6). Não rodar db push dentro de subagente.

---

## Task 3: Leitura (`painelCrm.ts`)

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrm.ts`

**Interfaces:**
- Consumes: `obterPayload` (padrão do arquivo); tipos `Proposta`/`VersaoProposta`/`EnvioProposta` de `payload-types`.
- Produces:
  - `PropostaResumo = { id: string; codigo: string; codigoBase: string; versao: number; clienteNome: string; programaSigla: string; valorLiquido: number; status: string; vigente: boolean }`
  - `PropostaDetalhe extends PropostaResumo` com todos os campos + `itens: { rotulo: string; detalhe: string }[]` + `envios: EnvioResumo[]` + `elaboradorNome`/`aprovadorNome`.
  - `VersaoResumo = { id: string; codBase: string; nVersao: number; data: string | null; valorLiquido: number; status: string; motivo: string; propostaId: string }`
  - `EnvioResumo = { id: string; propostaCodigo: string; data: string | null; canal: string; destinatarios: string; status: string; observacoes: string }`
  - `listarPropostasCrm(): Promise<PropostaResumo[]>` (só vigentes por codigoBase)
  - `obterPropostaCrm(id: string): Promise<PropostaDetalhe | null>`
  - `versoesDeProposta(codBase: string): Promise<VersaoResumo[]>`
  - `todosEnviosCrm(): Promise<EnvioResumo[]>`

- [ ] **Step 1: Adicionar os tipos e as funções de leitura**

Seguir o estilo das funções existentes (`listarOportunidadesCrm`/`obterOportunidadeCrm`): `depth` suficiente para resolver relacionamentos, `String(doc.id)` nos ids, campos ausentes viram `""`/`0`/`null`. "Vigente por codigoBase" = a de maior `versao` cujo `status !== "substituida"` (ou simplesmente a maior versão do grupo — o legado marca a anterior como Substituída ao versionar, então a maior versão é a vigente).

Esboço de `listarPropostasCrm` (agrupamento por codigoBase, só a maior versão):

```ts
export async function listarPropostasCrm(): Promise<PropostaResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "propostas", limit: 1000, depth: 1 });
  const porBase = new Map<string, PropostaResumo>();
  for (const doc of res.docs) {
    const resumo = mapearPropostaResumo(doc);
    const atual = porBase.get(resumo.codigoBase);
    if (!atual || resumo.versao > atual.versao) porBase.set(resumo.codigoBase, resumo);
  }
  return [...porBase.values()].sort((a, b) => b.codigo.localeCompare(a.codigo));
}
```

Implementar `mapearPropostaResumo`, `obterPropostaCrm`, `versoesDeProposta`, `todosEnviosCrm` no mesmo módulo, resolvendo nomes de cliente/programa/usuário e montando `itens` a partir de `modulos`/`eventos` (rótulo `M{numero} · {titulo}` / `{tipo} · {nome}`), espelhando `openPropostaDetail` do legado.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrm.ts
git commit -m "feat(crm): leitura de propostas, versoes e envios (painelCrm)"
```

---

## Task 4: Escrita (`painelCrmEscrita.ts`) + Server Actions (`acoesCrm.ts`)

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`

**Interfaces:**
- Consumes: `calcularValoresProposta`, `gerarCodigoBase`, `proximaVersao`, `codigoDaVersao`, `siglaCanonica` de `@ntc/lib`; helpers locais `idOuNulo`, `idsLista`, `numeroOuNulo`, `ouNulo`, `ERRO_GENERICO`, `obterPayload`, `ResultadoEscrita`.
- Produces:
  - `DadosProposta` (todos os campos string do form, ids como string/`string[]`).
  - `DadosEnvio = { proposta: string; data: string; canal: string; destinatarios: string; status: string; observacoes: string }`.
  - `criarProposta(dados: DadosProposta): Promise<ResultadoEscrita>`
  - `atualizarProposta(id: string, dados: DadosProposta): Promise<ResultadoEscrita>`
  - `criarVersaoProposta(codBase: string, motivo: string): Promise<ResultadoEscrita>`
  - `registrarEnvio(dados: DadosEnvio): Promise<ResultadoEscrita>`
  - Server Actions: `salvarPropostaCrm(id, dados)`, `novaVersaoPropostaCrm(codBase, motivo)`, `registrarEnvioCrm(dados)`, `carregarPropostaCrm(id)`.

- [ ] **Step 1: Escrever o teste de derivação (falhando)**

Crie `apps/cms/src/lib/cms/painelCrmEscrita.propostas.test.ts` testando o mapper puro `dadosProposta` (extraia-o como função exportada, como `dadosOportunidade`), verificando que valores derivados são calculados via `calcularValoresProposta` e que `percDesconto` é gravado como número (não fração):

```ts
import { describe, expect, it } from "vitest";
import { dadosProposta } from "./painelCrmEscrita";

describe("dadosProposta", () => {
  it("grava derivados calculados", () => {
    const d = dadosProposta(
      {
        valorUnitario: "100", qtdPagantes: "10", cortesias: "0", percDesconto: "10",
        cliente: "1", programa: "2", oportunidade: "", tipo: "programa-completo",
        modulos: [], eventos: [], modalidade: "", replay: "", condPagto: "",
        condEspecificas: "", observacoes: "", elaborador: "", aprovador: "",
        validadeDias: "30", status: "rascunho",
      },
      3, // clienteId
      { codigoBase: "NTC-PROP-2026-PROGE-SP-X", codigo: "NTC-PROP-2026-PROGE-SP-X-v01", versao: 1 },
    );
    expect(d.valorBruto).toBe(1000);
    expect(d.desconto).toBe(100);
    expect(d.valorLiquido).toBe(900);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.propostas`
Expected: FAIL — `dadosProposta` não existe.

- [ ] **Step 3: Implementar tipos e mapper**

Em `painelCrmEscrita.ts`, adicionar `DadosProposta`, `DadosEnvio`, e o mapper exportado `dadosProposta(dados, clienteId, ids)` que:
- resolve relationships com `idOuNulo`/`idsLista`;
- chama `calcularValoresProposta` com números parseados por `numeroOuNulo` (default 0) e grava `valorBruto`/`desconto`/`valorLiquido`;
- fixa `codigoBase`/`codigo`/`versao` a partir do argumento `ids`.

Assinatura:

```ts
export function dadosProposta(
  dados: DadosProposta,
  clienteId: number,
  ids: { codigoBase: string; codigo: string; versao: number },
): RequiredDataFromCollectionSlug<"propostas"> { /* ... */ }
```

- [ ] **Step 4: Implementar `criarProposta`**

Espelha `criarOportunidade`: valida `clienteId`; lê programa (para `sigla`) e cliente (para `uf`/`sigla`); monta `codigoBase` com `gerarCodigoBase`; busca códigos existentes desse `codigoBase` (`where: { codigoBase: { equals: base } }`), calcula `versao = proximaVersao(...)` e `codigo = codigoDaVersao(base, versao)`; grava `dataCriacao`/`validade` (via `addDays` do dia — use utilitário existente do projeto ou `new Date()` no servidor). `create` na coleção `propostas`.

- [ ] **Step 5: Implementar `atualizarProposta`, `criarVersaoProposta`, `registrarEnvio`**

- `atualizarProposta(id, dados)`: recarrega o doc para manter `codigoBase`/`codigo`/`versao`, recalcula derivados via `dadosProposta`, `update`.
- `criarVersaoProposta(codBase, motivo)`: carrega a vigente (maior versão) do `codBase`; clona os campos; `versao+1`; novo `codigo`; `status: "rascunho"`; `motivoRevisao: motivo`; `substitui: <codigo anterior>`; `create`. Depois `update` na anterior → `status: "substituida"`. Depois `create` em `versoes` (`vigente: true`, `statusAnterior: "Substituída"`).
- `registrarEnvio(dados)`: valida `proposta` id; `create` em `envios`.

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.propostas`
Expected: PASS.

- [ ] **Step 7: Adicionar as Server Actions em `acoesCrm.ts`**

Seguindo `salvarOportunidadeCrm`, com `obterUsuarioCms()` + `revalidatePath("/crm")`:

```ts
export async function carregarPropostaCrm(id: string): Promise<PropostaDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterPropostaCrm(id);
}

export async function salvarPropostaCrm(id: string | null, dados: DadosProposta): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = id === null ? await criarProposta(dados) : await atualizarProposta(id, dados);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function novaVersaoPropostaCrm(codBase: string, motivo: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await criarVersaoProposta(codBase, motivo);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function registrarEnvioCrm(dados: DadosEnvio): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await registrarEnvio(dados);
  if (r.ok) revalidatePath("/crm");
  return r;
}
```

(Importar os novos símbolos de `painelCrm`/`painelCrmEscrita` no topo.)

- [ ] **Step 8: Typecheck + testes**

Run: `pnpm typecheck && pnpm --filter @ntc/cms test -- painelCrmEscrita`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrmEscrita.ts apps/cms/src/lib/cms/painelCrmEscrita.propostas.test.ts apps/cms/src/app/\(painel\)/acoesCrm.ts
git commit -m "feat(crm): escrita de propostas (criar, versionar, envio) + server actions"
```

---

## Task 5: Telas (`FormProposta`, `TelaPropostas`, `DetalheProposta`, `TelaVersoes`, `TelaEnvios`)

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/FormProposta.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaPropostas.tsx`
- Create: `apps/cms/src/app/(painel)/crm/DetalheProposta.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaVersoes.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaEnvios.tsx`

**Interfaces:**
- Consumes: tipos de `painelCrm` (Task 3); Server Actions de `acoesCrm` (Task 4); `calcularValoresProposta` de `@ntc/lib`; `CatalogoCrm`, `ClienteCrmResumo`, `UsuarioCmsResumo` (já existentes).
- Produces: componentes React usados pelo `ShellCrm` (Task 6) via props:
  - `TelaPropostas({ propostas: PropostaResumo[], onAbrir(id), onNovo() })`
  - `DetalheProposta({ proposta: PropostaDetalhe, onVoltar(), onEditar(), onNovaVersao(codBase, motivo), onRegistrarEnvio(dados) })`
  - `FormProposta({ inicial: PropostaDetalhe | null, clientes, catalogo, usuarios, oportunidades, onSalvo(), onCancelar() })`
  - `TelaVersoes({ propostas: PropostaResumo[], onAbrirVersoes(codBase) })` (ou lista achatada de versões; ver Step)
  - `TelaEnvios({ envios: EnvioResumo[] })`

- [ ] **Step 1: `TelaPropostas` e `TelaEnvios` (listas simples)**

Copiar o esqueleto de `TelaOportunidades.tsx` (pagehead + toolbar com botão "Nova proposta" → `onNovo` + `pcms-tabela` com linha clicável → `onAbrir`). Colunas: Código · Cliente · Programa · Valor líquido · Status · v. `TelaEnvios` é só a tabela consolidada (Data · Proposta · Canal · Destinatário · Status), sem "novo" (envio nasce no detalhe da proposta).

- [ ] **Step 2: `DetalheProposta`**

Copiar layout de `DetalheOportunidade.tsx`. Blocos: KPIs (bruto/desconto/líquido/acessos, via `calcularValoresProposta` sobre os campos já persistidos — ou usar os campos derivados direto), dados gerais, itens contemplados, condições comerciais, registro de envios. Ações no header: **Voltar**, **Editar** (→ `onEditar`), **Nova versão** (abre `prompt`/modal de motivo → `onNovaVersao(codBase, motivo)`), **Registrar envio** (form inline/modal → `onRegistrarEnvio`). Sem botões de HTML/PDF.

- [ ] **Step 3: `FormProposta` (wizard client reativo)**

`"use client"`. Estado local com todos os campos. 5 blocos (cards) como no `renderWizard` legado. Bloco de módulos/eventos: checkboxes filtrados por `programa` selecionado a partir de `catalogo`. Bloco de valores: `onInput` recalcula com `calcularValoresProposta` e atualiza o resumo (4 números) sem re-render pesado. Selecionar oportunidade pré-preenche cliente/programa/módulos/quantidade/modalidade. "Gerar Proposta" chama `salvarPropostaCrm(inicial?.id ?? null, dados)` dentro de `useTransition`; em `ok` chama `onSalvo`, senão exibe erro. Reutilizar classes `pcms-*` e as do CRM (`.card`, `.form`, `.field`) já presentes no painel — não criar CSS novo.

- [ ] **Step 4: `TelaVersoes`**

Lista todas as propostas agrupadas por `codigoBase` (a partir de `PropostaResumo[]`); cada linha abre o histórico daquele `codigoBase` via `onAbrirVersoes` (que carrega `versoesDeProposta`). Tabela do histórico: Versão · Criada · Valor líquido · Status · Motivo · [Abrir]. (Se preferir simplicidade, `TelaVersoes` pode receber já a lista achatada de `VersaoResumo[]` de todas as propostas e linkar direto para a proposta daquela versão — escolha a que melhor casa com o `ShellCrm` na Task 6; documente a escolha no commit.)

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm/FormProposta.tsx apps/cms/src/app/\(painel\)/crm/TelaPropostas.tsx apps/cms/src/app/\(painel\)/crm/DetalheProposta.tsx apps/cms/src/app/\(painel\)/crm/TelaVersoes.tsx apps/cms/src/app/\(painel\)/crm/TelaEnvios.tsx
git commit -m "feat(crm): telas de propostas, wizard, detalhe, versoes e envios"
```

---

## Task 6: Fiar no `ShellCrm` + `page.tsx`

**Files:**
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`

**Interfaces:**
- Consumes: tudo das Tasks 3–5.
- Produces: `/crm` com as telas Propostas/Versões/Envios funcionais no lugar das cascas.

- [ ] **Step 1: Carregar dados novos no `page.tsx`**

Adicionar `listarPropostasCrm`, `todosEnviosCrm` ao import e ao `Promise.all` (com defaults `[]` e cobertos pelo mesmo `try/catch → erroLeitura`). Passar `propostas` e `envios` como props novas ao `ShellCrm`.

- [ ] **Step 2: Atualizar `ShellCrm`**

- Props novas: `propostas: PropostaResumo[]`, `envios: EnvioResumo[]`.
- Estado: `propostaDet: PropostaDetalhe | null`; incluir `"proposta"` no union `FormCrmAberto` (`{ entidade: "proposta"; inicial: PropostaDetalhe | null }`).
- `abrirProposta(id)`: `carregarPropostaCrm(id)` dentro de `iniciarCarga`, seta `propostaDet`.
- Renderizar `FormProposta` quando `formAberto?.entidade === "proposta"` (passando `oportunidades`, `clientes`, `catalogo`, `usuarios`).
- Renderizar `DetalheProposta` quando `propostaDet` (ações → Server Actions `novaVersaoPropostaCrm`/`registrarEnvioCrm` dentro de `iniciarCarga`, `fecharTudo` no sucesso).
- Substituir as 3 cascas `TelaEmBreve` (`propostas`, `versoes`, `envios`) pelas telas reais:
  - `tela === "propostas"` → `<TelaPropostas propostas={propostas} onAbrir={abrirProposta} onNovo={() => setFormAberto({ entidade: "proposta", inicial: null })} />`
  - `tela === "versoes"` → `<TelaVersoes .../>`
  - `tela === "envios"` → `<TelaEnvios envios={envios} />`
- Manter `condicoes` como `TelaEmBreve`.
- Incluir `propostaDet` em `fecharTudo()`.
- Importar os componentes novos.

- [ ] **Step 3: Build de verificação**

> **Antes de buildar, PARE o dev server** — `pnpm build` corrompe o `.next` compartilhado (memória do projeto). Se algo quebrar depois: `rm -rf apps/cms/.next` + restart + hard refresh.

Run: `pnpm build`
Expected: build sem erros.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm/page.tsx apps/cms/src/app/\(painel\)/crm/ShellCrm.tsx
git commit -m "feat(crm): ativa telas de propostas, versoes e envios no ShellCrm"
```

---

## Task 7: Checkpoint visual (validação humana)

**Files:** nenhum (verificação).

- [ ] **Step 1: Sincronizar schema (PO)**

Com o dev **parado** e sem sessão paralela, o PO roda `pnpm payload:push:schema` (diff de collections antes). Isso cria as tabelas `propostas`/`versoes`/`envios`.

- [ ] **Step 2: Subir o dev e validar**

Run: `pnpm dev:cms`
Abrir `http://localhost:3001/crm` (ou porta do painel). Percorrer: criar proposta pelo wizard (conferir resumo ao vivo), abrir detalhe, gerar nova versão (a anterior vira Substituída e some da lista principal), registrar um envio, abrir Versões e Envios. Conferir desktop 1440 + mobile 375.

- [ ] **Step 3: Reportar ao PO**

Deixar o servidor no ar e pedir aprovação humana (regra do projeto — validação visual é do PO, não por screenshot automatizado). Listar discrepâncias abertas antes de declarar concluído.

---

## Self-Review (do autor do plano)

- **Cobertura da spec:** modelagem (Task 2) ✓ · listas (Task 1) ✓ · código-base no servidor (Task 1/4) ✓ · leitura (Task 3) ✓ · escrita+actions (Task 4) ✓ · cálculo compartilhado (Task 1, usado em 4 e 5) ✓ · wizard reativo (Task 5) ✓ · versionamento completo + entidade `versoes` (Task 4/5) ✓ · envios (Task 2/4/5) ✓ · destravar 3 cascas, Condições fica (Task 6) ✓ · testes Vitest (Tasks 1/4) ✓ · checkpoint visual humano (Task 7) ✓ · `push: false`/schema manual (Task 2 nota, Task 7) ✓.
- **Fora de escopo respeitado:** sem motor A4/PDF, sem Biblioteca/Textos-Padrão, sem Condições, sem Orientações EventON, sem exclusão — nenhuma task os inclui. ✓
- **Consistência de tipos:** `calcularValoresProposta`/`gerarCodigoBase`/`proximaVersao`/`codigoDaVersao` definidos na Task 1 e consumidos com a mesma assinatura nas Tasks 4/5. `DadosProposta`/`dadosProposta` consistentes entre Task 4 e seu teste. Slugs de select (`"rascunho"`, `"substituida"`) batem com `slugDeRotulo` das listas da Task 1. ✓
- **Placeholders:** os passos de leitura/telas (Tasks 3 e 5) descrevem o mapeamento com esboços de código e apontam o arquivo-modelo exato a copiar (`listarOportunidadesCrm`, `TelaOportunidades`, `DetalheOportunidade`, `renderWizard` do legado) em vez de código integral — é a forma DRY de reaproveitar um padrão já estabelecido no repo, não um "implemente depois". As funções puras e a escrita (onde o risco de divergência é real) têm código completo e testes.
