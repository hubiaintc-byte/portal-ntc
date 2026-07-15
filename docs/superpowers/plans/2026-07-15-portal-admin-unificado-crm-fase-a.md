# Portal Admin Unificado — Módulo CRM (Fase A) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar o Painel Admin do CMS e o CRM comercial num único portal com seletor de módulo **Site | CRM** na sidebar, mesmo login, mesma identidade visual — com coleções comerciais no Payload/Supabase, telas CRUD e importador do JSON do CRM legado.

**Architecture:** Casco visual compartilhado (`ShellPainel`) extraído 1:1 do `ShellCms`; uma rota Next por módulo (`/` = Site intacto, `/crm` = novo módulo, cada uma um SPA-de-telas client-side no padrão atual). 3 coleções novas no Payload (`clientes-crm`, `contatos-crm`, `oportunidades`) + grupo `comercial` em `modulos`/`eventos` (catálogo único). Leitura via Local API (`painelCrm.ts` server-only), escrita via Server Actions com guarda de sessão (`acoesCrm.ts` → `painelCrmEscrita.ts`).

**Tech Stack:** Next.js 15 App Router, Payload CMS 3.18 (Postgres/Supabase), React Server Components + client shells, CSS global `painel.css` (tokens Soberana, prefixo `pcms-`), Vitest.

**Spec:** `docs/superpowers/specs/2026-07-15-portal-admin-unificado-crm-design.md`

## Global Constraints

- TypeScript strict; **sem `any`**; props como interface nomeada (CLAUDE.md §4.4).
- Naming: componentes PascalCase em português; variáveis/funções camelCase em português para conceitos NTC (CLAUDE.md §4.2).
- Visual: tokens Soberana existentes em `painel.css` (`--pcms-oxford #11365e`, `--pcms-dourado #b5995a`, radius 0 em estruturas); todo CSS novo prefixado `pcms-`; **não** usar o navy/gold do protótipo (`#0E2A47`/`#B68B40`) nem radius > 0 em estruturas.
- **Sem dependências novas** (nada de Chart.js na Fase A) — CLAUDE.md §5.4.
- Módulo Site (`/`) permanece **visualmente idêntico** — a única mudança funcional permitida é o seletor de módulo e a saída do grupo Comercial/Leads (CLAUDE.md §5.6).
- Banco: `push: false` é a regra; a sincronização de schema é um passo único e controlado (Task 4) — **nunca** com `pnpm dev` rodando em paralelo; prompt de DATA LOSS ⇒ abortar e responder N.
- Server Actions novas validam sessão (`obterUsuarioCms()`) antes de qualquer escrita.
- Git: branch `feat/crm-modulo`, commits pequenos em português (Conventional Commits), **sem emojis**, **sem `git push`** até ordem explícita do usuário.
- Comandos rodam de `apps/cms` salvo indicação: `cd /Users/joao/Documents/portal-ntc/apps/cms`.

---

### Task 1: Listas controladas do CRM em `@ntc/lib`

**Files:**
- Create: `packages/lib/src/crm/listas.ts`
- Modify: `packages/lib/src/index.ts` (adicionar re-export)
- Test: `apps/cms/src/lib/crm/listas.test.ts` (o Vitest configurado do monorepo vive em `apps/cms`; testa o pacote via import `@ntc/lib`)

**Interfaces:**
- Produces: `OpcaoLista { label: string; value: string }`, `slugDeRotulo(rotulo: string): string`, e as constantes `UFS: string[]`, `AREAS_CRM`, `ESFERAS_CRM`, `TIPOS_INSTITUICAO`, `ORIGENS_CRM`, `STATUS_CLIENTE_CRM`, `STATUS_OPORTUNIDADE` (todas `OpcaoLista[]`), `STATUS_OPORTUNIDADE_FECHADA: string[]`.
- Valores (`value`) são o slug do rótulo — estáveis, gravados no banco pelos selects do Payload.

- [ ] **Step 1: Criar branch**

```bash
cd /Users/joao/Documents/portal-ntc && git checkout -b feat/crm-modulo
```

- [ ] **Step 2: Escrever o teste que falha** — `apps/cms/src/lib/crm/listas.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { slugDeRotulo, STATUS_CLIENTE_CRM, STATUS_OPORTUNIDADE, UFS } from "@ntc/lib";

describe("listas do CRM", () => {
  it("slugDeRotulo normaliza acentos, espaços e pontuação", () => {
    expect(slugDeRotulo("Em qualificação")).toBe("em-qualificacao");
    expect(slugDeRotulo("Apresentação institucional")).toBe("apresentacao-institucional");
    expect(slugDeRotulo("Cliente ativo")).toBe("cliente-ativo");
    expect(slugDeRotulo("À vista após NF · 15 dias")).toBe("a-vista-apos-nf-15-dias");
  });

  it("listas têm os valores do CRM legado", () => {
    expect(UFS).toHaveLength(27);
    expect(STATUS_CLIENTE_CRM.map((o) => o.value)).toContain("prospect");
    expect(STATUS_OPORTUNIDADE.map((o) => o.value)).toContain("proposta-enviada");
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd apps/cms && pnpm test -- listas`
Expected: FAIL (`slugDeRotulo` não exportado por `@ntc/lib`).

- [ ] **Step 4: Implementar** — `packages/lib/src/crm/listas.ts`

```ts
/**
 * Listas controladas do módulo CRM — espelham as LIST do protótipo
 * NTC_Comercial_Premium.html (apenas as entidades da Fase A).
 * `value` é o slug do rótulo: estável, é o que os selects do Payload gravam.
 */

export interface OpcaoLista {
  label: string;
  value: string;
}

/** "Em qualificação" → "em-qualificacao". Também usado pelo importador. */
export function slugDeRotulo(rotulo: string): string {
  return rotulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const opcoes = (rotulos: string[]): OpcaoLista[] =>
  rotulos.map((label) => ({ label, value: slugDeRotulo(label) }));

// prettier-ignore
export const UFS: string[] = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export const AREAS_CRM = opcoes([
  "Educação", "Gestão Pública", "Governança", "Licitações e Contratos", "Inovação",
  "Saúde", "Assistência Social", "Controle Interno", "Jurídico", "Alta Gestão",
]);

export const ESFERAS_CRM = opcoes([
  "Municipal", "Estadual", "Federal", "Consórcio", "Autarquia", "Fundação",
  "Escola de Governo", "Tribunal", "Câmara", "Assembleia", "Outros",
]);

export const TIPOS_INSTITUICAO = opcoes([
  "Secretaria Federal", "Secretaria Estadual", "Secretaria Municipal", "Autarquia",
  "Fundação", "Tribunal", "Câmara", "Assembleia", "Consórcio", "Escola de Governo", "Outro",
]);

export const ORIGENS_CRM = opcoes([
  "Indicação", "Indicação institucional", "Evento", "Prospecção ativa",
  "Cliente recorrente", "Continuidade de relacionamento", "Inbound", "EventON", "Outros",
]);

export const STATUS_CLIENTE_CRM = opcoes([
  "Prospect", "Em qualificação", "Em negociação", "Cliente ativo", "Cliente inativo", "Encerrado",
]);

export const STATUS_OPORTUNIDADE = opcoes([
  "Em qualificação", "Apresentação institucional", "Proposta enviada", "Em negociação",
  "Aprovada", "Contratada", "Perdida", "Cancelada",
]);

/** Status que tiram a oportunidade do funil (não contam como "aberta"). */
export const STATUS_OPORTUNIDADE_FECHADA: string[] = ["contratada", "perdida", "cancelada"];
```

Em `packages/lib/src/index.ts`, adicionar junto aos re-exports existentes:

```ts
export * from "./crm/listas";
```

- [ ] **Step 5: Rodar e ver passar**

Run: `cd apps/cms && pnpm test -- listas`
Expected: PASS (2 testes).

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/crm/listas.ts packages/lib/src/index.ts apps/cms/src/lib/crm/listas.test.ts
git commit -m "feat(crm): listas controladas do CRM em @ntc/lib"
```

---

### Task 2: Coleções `clientes-crm`, `contatos-crm` e `oportunidades`

**Files:**
- Create: `apps/cms/src/collections/ClientesCrm.ts`
- Create: `apps/cms/src/collections/ContatosCrm.ts`
- Create: `apps/cms/src/collections/Oportunidades.ts`
- Modify: `apps/cms/src/payload.config.ts` (imports + registrar as 3 no array `collections`, após `Leads`)

**Interfaces:**
- Consumes: listas de `@ntc/lib` (Task 1); `atendimentoComercial` e `superAdmin` de `../access/`.
- Produces: slugs `"clientes-crm"`, `"contatos-crm"`, `"oportunidades"`; tipos gerados `ClienteCrm`, `ContatoCrm`, `Oportunidade` (via `typescript.interface`, disponíveis após Task 4).

- [ ] **Step 1: Criar `ClientesCrm.ts`**

```ts
import type { CollectionConfig } from "payload";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Clientes (CRM) — conta comercial do funil (spec 2026-07-15 §Modelagem).
 * NÃO confundir com a coleção `clientes` (vitrine de instituições no site);
 * `clienteSite` liga as duas quando o prospect vira case público.
 */
export const ClientesCrm: CollectionConfig = {
  slug: "clientes-crm",
  labels: { singular: "Cliente (CRM)", plural: "Clientes (CRM)" },
  typescript: { interface: "ClienteCrm" },
  admin: {
    useAsTitle: "orgao",
    defaultColumns: ["orgao", "uf", "status", "responsavel"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "orgao", type: "text", required: true },
    { name: "sigla", type: "text" },
    { name: "tipo", type: "select", options: TIPOS_INSTITUICAO },
    { name: "municipio", type: "text" },
    { name: "uf", type: "select", options: UFS },
    { name: "esfera", type: "select", options: ESFERAS_CRM },
    { name: "area", type: "select", options: AREAS_CRM },
    { name: "cnpj", type: "text" },
    { name: "dirigente", type: "text" },
    { name: "cargoDirigente", type: "text" },
    { name: "email", type: "email" },
    { name: "origem", type: "select", options: ORIGENS_CRM },
    {
      name: "potencial",
      type: "number",
      min: 0,
      admin: { description: "Potencial estimado de contratação (R$)." },
    },
    { name: "status", type: "select", options: STATUS_CLIENTE_CRM, defaultValue: "prospect" },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "proximaAcao", type: "text" },
    { name: "observacoes", type: "textarea" },
    {
      name: "clienteSite",
      type: "relationship",
      relationTo: "clientes",
      admin: { description: "Instituição correspondente na vitrine do site, se houver." },
    },
  ],
};
```

- [ ] **Step 2: Criar `ContatosCrm.ts`**

```ts
import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/** Contatos (CRM) — pessoas dentro do órgão cliente (spec 2026-07-15). */
export const ContatosCrm: CollectionConfig = {
  slug: "contatos-crm",
  labels: { singular: "Contato (CRM)", plural: "Contatos (CRM)" },
  typescript: { interface: "ContatoCrm" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "cliente", "cargo", "email"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "cargo", type: "text" },
    { name: "setor", type: "text" },
    { name: "email", type: "email" },
    { name: "whatsapp", type: "text" },
    { name: "principal", type: "checkbox", defaultValue: false },
    { name: "decisor", type: "checkbox", defaultValue: false },
  ],
};
```

- [ ] **Step 3: Criar `Oportunidades.ts`**

```ts
import type { CollectionConfig } from "payload";

import { ORIGENS_CRM, STATUS_OPORTUNIDADE, UFS } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Oportunidades — funil comercial (spec 2026-07-15 §Modelagem).
 * Catálogo único: aponta para as coleções editoriais programas/modulos/eventos.
 * Pipeline ponderado (valor × probabilidade) é derivado na tela, não persistido.
 */
export const Oportunidades: CollectionConfig = {
  slug: "oportunidades",
  labels: { singular: "Oportunidade", plural: "Oportunidades" },
  typescript: { interface: "Oportunidade" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valor", "probabilidade", "status"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "programa", type: "relationship", relationTo: "programas" },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "uf", type: "select", options: UFS },
    { name: "origem", type: "select", options: ORIGENS_CRM },
    {
      name: "quantidade",
      type: "number",
      min: 0,
      admin: { description: "Quantidade estimada de participantes." },
    },
    { name: "modalidade", type: "text" },
    { name: "valor", type: "number", min: 0, admin: { description: "Valor estimado (R$)." } },
    { name: "probabilidade", type: "number", min: 0, max: 100 },
    {
      name: "status",
      type: "select",
      options: STATUS_OPORTUNIDADE,
      defaultValue: "em-qualificacao",
    },
    { name: "dataAbertura", type: "date" },
    { name: "dataPrevFechamento", type: "date" },
    { name: "proximaAcao", type: "text" },
    { name: "followup", type: "date", admin: { description: "Data do próximo follow-up." } },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 4: Registrar no `payload.config.ts`** — adicionar imports (ordem alfabética junto aos existentes) e, no array `collections`, inserir `ClientesCrm, ContatosCrm, Oportunidades` logo após `Leads`.

- [ ] **Step 5: Typecheck**

Run: `cd apps/cms && pnpm typecheck`
Expected: PASS. (Os slugs novos ainda não existem em `payload-types` — `relationTo: "clientes-crm"` só valida contra os tipos gerados após a Task 4; se o typecheck acusar slug desconhecido nas relationships, é esperado — nesse caso rode o typecheck de novo ao final da Task 4 e siga.)

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/collections/ClientesCrm.ts apps/cms/src/collections/ContatosCrm.ts apps/cms/src/collections/Oportunidades.ts apps/cms/src/payload.config.ts
git commit -m "feat(crm): coleções clientes-crm, contatos-crm e oportunidades"
```

---

### Task 3: Grupo `comercial` em Modulos e Eventos

**Files:**
- Modify: `apps/cms/src/collections/Modulos.ts` (fim do array `fields`)
- Modify: `apps/cms/src/collections/Eventos.ts` (fim do array `fields`, DEPOIS do bloco `tabs` — campo irmão das tabs)

**Interfaces:**
- Produces: `modulos.comercial.{tituloComercial,valor,replay,certificacao}`, `eventos.comercial.{codigo,valor}` — consumidos pelo importador (Task 13) e pela Fase B.

- [ ] **Step 1: Adicionar ao final de `fields` em `Modulos.ts`**

```ts
    {
      name: "comercial",
      type: "group",
      label: "Dados comerciais (CRM)",
      admin: { description: "Usado pelo módulo CRM do painel; o site ignora este grupo." },
      fields: [
        { name: "tituloComercial", type: "text" },
        { name: "valor", type: "number", min: 0, admin: { description: "Valor de referência (R$)." } },
        { name: "replay", type: "text" },
        { name: "certificacao", type: "text" },
      ],
    },
```

- [ ] **Step 2: Adicionar ao final de `fields` em `Eventos.ts`** (irmão do bloco `tabs`, não dentro dele)

```ts
    {
      name: "comercial",
      type: "group",
      label: "Dados comerciais (CRM)",
      admin: { description: "Usado pelo módulo CRM do painel; o site ignora este grupo." },
      fields: [
        { name: "codigo", type: "text", admin: { description: "Código comercial do produto (CRM legado)." } },
        { name: "valor", type: "number", min: 0, admin: { description: "Valor de referência (R$)." } },
      ],
    },
```

- [ ] **Step 3: Typecheck** — `cd apps/cms && pnpm typecheck` → PASS (mesma ressalva da Task 2).

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/Modulos.ts apps/cms/src/collections/Eventos.ts
git commit -m "feat(crm): grupo comercial nas coleções modulos e eventos"
```

---

### Task 4: Sincronizar schema no banco e regenerar tipos

⚠️ **Tarefa sensível ao banco. NÃO rode com `pnpm dev`/`pnpm dev:cms` ativo em nenhum terminal.** As mudanças são aditivas (tabelas e colunas novas); se aparecer prompt do drizzle mencionando **DATA LOSS/truncate/drop**, responda **N** e aborte — reporte ao usuário.

**Files:**
- Modify: `apps/cms/src/payload.config.ts` (linha do `push`)
- Create: `apps/cms/src/seed/sincronizarSchema.ts`
- Modify: `apps/cms/package.json` (script novo)
- Modify (gerado): `packages/types/src/payload-types.ts`

**Interfaces:**
- Produces: tabelas `clientes_crm`, `contatos_crm`, `oportunidades` (+ rels) e colunas `comercial_*` no banco; tipos `ClienteCrm`, `ContatoCrm`, `Oportunidade` em `@ntc/types`.

- [ ] **Step 1: Push guardado por env var** — em `payload.config.ts`, trocar `push: false,` por:

```ts
    // push desabilitado por padrão (dev-mode do drizzle re-puxa o schema a cada
    // request e um push acidental pode descartar dados). Sincronização de schema
    // é manual e pontual: PAYLOAD_DB_PUSH=1 pnpm payload:push:schema.
    push: process.env.PAYLOAD_DB_PUSH === "1",
```

- [ ] **Step 2: Criar `src/seed/sincronizarSchema.ts`**

```ts
/**
 * Força a sincronização do schema (drizzle push) numa execução única e
 * controlada. Uso: pnpm payload:push:schema (exige PAYLOAD_DB_PUSH=1, que o
 * script npm já define). Mudanças devem ser ADITIVAS; prompt de DATA LOSS ⇒ N.
 */
import { getPayload } from "payload";

import config from "../payload.config";

const payload = await getPayload({ config });
// Uma leitura qualquer garante a conexão inicializada (o push roda no connect).
const usuarios = await payload.count({ collection: "users" });
console.log(`Schema sincronizado. (users: ${usuarios.totalDocs})`);
process.exit(0);
```

- [ ] **Step 3: Script em `apps/cms/package.json`** (junto aos `payload:*`):

```json
    "payload:push:schema": "cross-env PAYLOAD_DB_PUSH=1 NODE_ENV=development pnpm payload run src/seed/sincronizarSchema.ts",
```

- [ ] **Step 4: Executar a sincronização**

Run: `cd apps/cms && pnpm payload:push:schema`
Expected: termina com `Schema sincronizado.` sem prompts. Se pedir confirmação de coluna/tabela a REMOVER: **N + abortar + reportar**.
Fallback se o push não disparar via `payload run`: rodar `PAYLOAD_DB_PUSH=1 pnpm dev:cms` sozinho, abrir `http://localhost:3001/entrar`, aguardar o log do push, encerrar o dev.

- [ ] **Step 5: Regenerar tipos e verificar**

```bash
pnpm payload:generate
grep -n "export interface ClienteCrm\|export interface ContatoCrm\|export interface Oportunidade" ../../packages/types/src/payload-types.ts
pnpm typecheck
```
Expected: os 3 interfaces existem; typecheck PASS (agora sem ressalvas).

- [ ] **Step 6: Verificar no banco (leitura, opcional mas recomendado)** — `pnpm payload run` de um one-liner não é prático; confie no log do push + smoke na Task 9.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/payload.config.ts apps/cms/src/seed/sincronizarSchema.ts apps/cms/package.json ../../packages/types/src/payload-types.ts
git commit -m "feat(crm): sincronização de schema controlada e tipos gerados das coleções CRM"
```

---

### Task 5: Leitura — `painelCrm.ts`

**Files:**
- Create: `apps/cms/src/lib/cms/painelCrm.ts`

**Interfaces:**
- Consumes: `obterPayload()` de `@/lib/payloadClient`; tipos gerados `ClienteCrm`, `ContatoCrm`, `Oportunidade` de `@ntc/types`.
- Produces (usados pelas Tasks 7–12):

```ts
export interface ClienteCrmResumo { id: string; orgao: string; sigla: string | null; municipio: string | null; uf: string | null; area: string | null; status: string; potencial: number | null; responsavelNome: string | null; }
export interface ClienteCrmDetalhe extends ClienteCrmResumo { tipo: string | null; esfera: string | null; cnpj: string | null; dirigente: string | null; cargoDirigente: string | null; email: string | null; origem: string | null; proximaAcao: string | null; observacoes: string | null; responsavelId: string | null; contatos: ContatoCrmResumo[]; oportunidades: OportunidadeCrmResumo[]; }
export interface ContatoCrmResumo { id: string; nome: string; clienteId: string; clienteNome: string; cargo: string | null; setor: string | null; email: string | null; whatsapp: string | null; principal: boolean; decisor: boolean; }
export interface OportunidadeCrmResumo { id: string; codigo: string; clienteId: string; clienteNome: string; programaSigla: string | null; valor: number | null; probabilidade: number | null; status: string; dataAberturaISO: string | null; followupISO: string | null; responsavelNome: string | null; }
export interface OportunidadeCrmDetalhe extends OportunidadeCrmResumo { programaId: string | null; modulos: { id: string; titulo: string }[]; eventos: { id: string; nome: string }[]; uf: string | null; origem: string | null; quantidade: number | null; modalidade: string | null; dataPrevFechamentoISO: string | null; proximaAcao: string | null; observacoes: string | null; responsavelId: string | null; }
export interface CatalogoCrm { programas: { id: string; sigla: string; nome: string }[]; modulos: { id: string; titulo: string; numero: number; programaId: string | null }[]; eventos: { id: string; nome: string }[]; }
export interface UsuarioCmsResumo { id: string; nome: string; }
```
Funções: `listarClientesCrm(): Promise<ClienteCrmResumo[]>`, `obterClienteCrm(id: string): Promise<ClienteCrmDetalhe | null>`, `listarContatosCrm(): Promise<ContatoCrmResumo[]>`, `listarOportunidadesCrm(): Promise<OportunidadeCrmResumo[]>`, `obterOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null>`, `obterCatalogoCrm(): Promise<CatalogoCrm>`, `listarUsuariosCms(): Promise<UsuarioCmsResumo[]>`.

- [ ] **Step 1: Implementar `painelCrm.ts`** (espelha o estilo de `painelCms.ts`: `server-only`, Local API, mapeadores por doc)

```ts
import "server-only";

import type { ClienteCrm, ContatoCrm, Oportunidade } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura de dados do módulo CRM (rota /crm). SOMENTE LEITURA, via Local API.
 * Mapeia as coleções clientes-crm/contatos-crm/oportunidades para tipos
 * enxutos que as telas consomem. server-only: nunca vaza ao browser.
 */

// [colar aqui os interfaces do bloco "Produces" acima]

/** Relationship do Payload: extrai id como string, populado ou não. */
function idRel(v: unknown): string | null {
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: string | number }).id);
  return null;
}

/** Relationship populado: extrai uma propriedade de exibição. */
function campoRel(v: unknown, campo: string): string | null {
  if (v && typeof v === "object" && campo in v) {
    const bruto = (v as Record<string, unknown>)[campo];
    return typeof bruto === "string" && bruto.length > 0 ? bruto : null;
  }
  return null;
}

const soData = (iso: string | null | undefined): string | null => (iso ? iso.slice(0, 10) : null);

function mapearClienteResumo(doc: ClienteCrm): ClienteCrmResumo {
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    municipio: doc.municipio ?? null,
    uf: doc.uf ?? null,
    area: doc.area ?? null,
    status: doc.status ?? "prospect",
    potencial: doc.potencial ?? null,
    responsavelNome: campoRel(doc.responsavel, "nome"),
  };
}

function mapearContato(doc: ContatoCrm): ContatoCrmResumo {
  return {
    id: String(doc.id),
    nome: doc.nome,
    clienteId: idRel(doc.cliente) ?? "",
    clienteNome: campoRel(doc.cliente, "orgao") ?? "",
    cargo: doc.cargo ?? null,
    setor: doc.setor ?? null,
    email: doc.email ?? null,
    whatsapp: doc.whatsapp ?? null,
    principal: doc.principal ?? false,
    decisor: doc.decisor ?? false,
  };
}

function mapearOportunidadeResumo(doc: Oportunidade): OportunidadeCrmResumo {
  return {
    id: String(doc.id),
    codigo: doc.codigo,
    clienteId: idRel(doc.cliente) ?? "",
    clienteNome: campoRel(doc.cliente, "orgao") ?? "",
    programaSigla: campoRel(doc.programa, "sigla"),
    valor: doc.valor ?? null,
    probabilidade: doc.probabilidade ?? null,
    status: doc.status ?? "em-qualificacao",
    dataAberturaISO: soData(doc.dataAbertura),
    followupISO: soData(doc.followup),
    responsavelNome: campoRel(doc.responsavel, "nome"),
  };
}

export async function listarClientesCrm(): Promise<ClienteCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "clientes-crm",
    depth: 1,
    limit: 500,
    sort: "orgao",
  });
  return res.docs.map(mapearClienteResumo);
}

export async function obterClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: ClienteCrm;
  try {
    doc = await payload.findByID({ collection: "clientes-crm", id, depth: 1 });
  } catch {
    return null;
  }
  const [contatos, oportunidades] = await Promise.all([
    payload.find({ collection: "contatos-crm", depth: 1, limit: 100, where: { cliente: { equals: doc.id } }, sort: "nome" }),
    payload.find({ collection: "oportunidades", depth: 1, limit: 100, where: { cliente: { equals: doc.id } }, sort: "-dataAbertura" }),
  ]);
  return {
    ...mapearClienteResumo(doc),
    tipo: doc.tipo ?? null,
    esfera: doc.esfera ?? null,
    cnpj: doc.cnpj ?? null,
    dirigente: doc.dirigente ?? null,
    cargoDirigente: doc.cargoDirigente ?? null,
    email: doc.email ?? null,
    origem: doc.origem ?? null,
    proximaAcao: doc.proximaAcao ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
    contatos: contatos.docs.map(mapearContato),
    oportunidades: oportunidades.docs.map(mapearOportunidadeResumo),
  };
}

export async function listarContatosCrm(): Promise<ContatoCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "contatos-crm", depth: 1, limit: 500, sort: "nome" });
  return res.docs.map(mapearContato);
}

export async function listarOportunidadesCrm(): Promise<OportunidadeCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "oportunidades", depth: 1, limit: 500, sort: "-dataAbertura" });
  return res.docs.map(mapearOportunidadeResumo);
}

export async function obterOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: Oportunidade;
  try {
    doc = await payload.findByID({ collection: "oportunidades", id, depth: 1 });
  } catch {
    return null;
  }
  const modulos = (Array.isArray(doc.modulos) ? doc.modulos : [])
    .map((m) => ({ id: idRel(m) ?? "", titulo: campoRel(m, "titulo") ?? "" }))
    .filter((m) => m.id !== "");
  const eventos = (Array.isArray(doc.eventos) ? doc.eventos : [])
    .map((e) => ({ id: idRel(e) ?? "", nome: campoRel(e, "nome") ?? "" }))
    .filter((e) => e.id !== "");
  return {
    ...mapearOportunidadeResumo(doc),
    programaId: idRel(doc.programa),
    modulos,
    eventos,
    uf: doc.uf ?? null,
    origem: doc.origem ?? null,
    quantidade: doc.quantidade ?? null,
    modalidade: doc.modalidade ?? null,
    dataPrevFechamentoISO: soData(doc.dataPrevFechamento),
    proximaAcao: doc.proximaAcao ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
  };
}

export async function obterCatalogoCrm(): Promise<CatalogoCrm> {
  const payload = await obterPayload();
  const [programas, modulos, eventos] = await Promise.all([
    payload.find({ collection: "programas", depth: 0, limit: 100, draft: true, sort: "sigla" }),
    payload.find({ collection: "modulos", depth: 0, limit: 500, draft: true, sort: "numero" }),
    payload.find({ collection: "eventos", depth: 0, limit: 500, draft: true, sort: "nome" }),
  ]);
  return {
    programas: programas.docs.map((p) => ({ id: String(p.id), sigla: p.sigla ?? "", nome: p.nomeCompleto ?? "" })),
    modulos: modulos.docs.map((m) => ({ id: String(m.id), titulo: m.titulo, numero: m.numero, programaId: idRel(m.programa) })),
    eventos: eventos.docs.map((e) => ({ id: String(e.id), nome: e.nome })),
  };
}

export async function listarUsuariosCms(): Promise<UsuarioCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "users", depth: 0, limit: 100, sort: "nome" });
  return res.docs.map((u) => ({ id: String(u.id), nome: u.nome ?? u.email }));
}
```

Nota: os nomes exatos dos campos de `programas` (`sigla`, `nomeCompleto`) e `users` (`nome`) devem ser confirmados contra `packages/types/src/payload-types.ts` — o typecheck acusa se divergirem.

- [ ] **Step 2: Typecheck** — `cd apps/cms && pnpm typecheck` → PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrm.ts
git commit -m "feat(crm): leitura do módulo CRM via Local API (painelCrm)"
```

---

### Task 6: KPIs comerciais (TDD)

**Files:**
- Create: `apps/cms/src/lib/cms/kpisComercial.ts`
- Test: `apps/cms/src/lib/cms/kpisComercial.test.ts`

**Interfaces:**
- Consumes: `import type { OportunidadeCrmResumo } from "./painelCrm"` e `import type { LeadCmsResumo } from "./painelCms"` (só tipos — não puxa `server-only` em runtime); `STATUS_OPORTUNIDADE_FECHADA` de `@ntc/lib`.
- Produces: `interface KpisComercial { oportunidadesAbertas: number; valorEmNegociacao: number; pipelinePonderado: number; leadsNovos: number }`, `calcularKpisComercial(oportunidades, leads): KpisComercial`, `formatarMoedaBRL(valor: number): string`, `followupsProximos(oportunidades: OportunidadeCrmResumo[], hojeISO: string, dias?: number): OportunidadeCrmResumo[]`.

- [ ] **Step 1: Teste que falha** — `kpisComercial.test.ts`

```ts
import { describe, expect, it } from "vitest";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";
import { calcularKpisComercial, followupsProximos, formatarMoedaBRL } from "./kpisComercial";

const opp = (extra: Partial<OportunidadeCrmResumo>): OportunidadeCrmResumo => ({
  id: "1", codigo: "OPO-1", clienteId: "1", clienteNome: "SEDUC-TO", programaSigla: "EDUTEC",
  valor: null, probabilidade: null, status: "em-qualificacao",
  dataAberturaISO: null, followupISO: null, responsavelNome: null,
  ...extra,
});

const lead = (status: string): LeadCmsResumo => ({
  id: "1", nome: "Fulano", email: "f@x.br", instituicao: "SEMED",
  tipo: "contato", status, data: "01/07/2026", dataISO: "2026-07-01",
});

describe("calcularKpisComercial", () => {
  it("conta abertas, soma valores e pondera pipeline; fechadas ficam de fora", () => {
    const kpis = calcularKpisComercial(
      [
        opp({ valor: 100_000, probabilidade: 50 }),
        opp({ id: "2", codigo: "OPO-2", valor: 40_000, probabilidade: 25, status: "proposta-enviada" }),
        opp({ id: "3", codigo: "OPO-3", valor: 999_999, probabilidade: 90, status: "perdida" }),
      ],
      [lead("novo"), lead("em-atendimento"), lead("novo")],
    );
    expect(kpis.oportunidadesAbertas).toBe(2);
    expect(kpis.valorEmNegociacao).toBe(140_000);
    expect(kpis.pipelinePonderado).toBe(60_000);
    expect(kpis.leadsNovos).toBe(2);
  });
});

describe("followupsProximos", () => {
  it("retorna abertas com follow-up na janela, ordenadas por data", () => {
    const lista = followupsProximos(
      [
        opp({ followupISO: "2026-07-20" }),
        opp({ id: "2", codigo: "OPO-2", followupISO: "2026-07-16" }),
        opp({ id: "3", codigo: "OPO-3", followupISO: "2026-08-01" }),
        opp({ id: "4", codigo: "OPO-4", followupISO: "2026-07-16", status: "cancelada" }),
      ],
      "2026-07-15",
    );
    expect(lista.map((o) => o.codigo)).toEqual(["OPO-2", "OPO-1"]);
  });
});

describe("formatarMoedaBRL", () => {
  it("formata inteiro em reais sem centavos", () => {
    expect(formatarMoedaBRL(140_000).replace(/ /g, " ")).toBe("R$ 140.000");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd apps/cms && pnpm test -- kpisComercial` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar** — `kpisComercial.ts`

```ts
import { STATUS_OPORTUNIDADE_FECHADA } from "@ntc/lib";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";

/**
 * Cálculos puros do Painel Comercial (sem I/O — testável e usável no client).
 * Pipeline ponderado = Σ valor × probabilidade das oportunidades abertas.
 */

export interface KpisComercial {
  oportunidadesAbertas: number;
  valorEmNegociacao: number;
  pipelinePonderado: number;
  leadsNovos: number;
}

const aberta = (o: OportunidadeCrmResumo): boolean =>
  !STATUS_OPORTUNIDADE_FECHADA.includes(o.status);

export function calcularKpisComercial(
  oportunidades: OportunidadeCrmResumo[],
  leads: LeadCmsResumo[],
): KpisComercial {
  const abertas = oportunidades.filter(aberta);
  return {
    oportunidadesAbertas: abertas.length,
    valorEmNegociacao: abertas.reduce((soma, o) => soma + (o.valor ?? 0), 0),
    pipelinePonderado: abertas.reduce(
      (soma, o) => soma + ((o.valor ?? 0) * (o.probabilidade ?? 0)) / 100,
      0,
    ),
    leadsNovos: leads.filter((l) => l.status === "novo").length,
  };
}

/** Oportunidades abertas com follow-up entre hoje e hoje+dias, mais próximas primeiro. */
export function followupsProximos(
  oportunidades: OportunidadeCrmResumo[],
  hojeISO: string,
  dias = 7,
): OportunidadeCrmResumo[] {
  const limite = new Date(`${hojeISO}T12:00:00`);
  limite.setDate(limite.getDate() + dias);
  const limiteISO = limite.toISOString().slice(0, 10);
  return oportunidades
    .filter((o) => aberta(o) && o.followupISO !== null && o.followupISO >= hojeISO && o.followupISO <= limiteISO)
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}
```

- [ ] **Step 4: Rodar e ver passar** — `pnpm test -- kpisComercial` → PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/kpisComercial.ts apps/cms/src/lib/cms/kpisComercial.test.ts
git commit -m "feat(crm): cálculos de KPIs comerciais e follow-ups próximos"
```

---

### Task 7: Escrita — `painelCrmEscrita.ts` + Server Actions `acoesCrm.ts`

**Files:**
- Create: `apps/cms/src/lib/cms/painelCrmEscrita.ts`
- Create: `apps/cms/src/app/(painel)/acoesCrm.ts`
- Test: `apps/cms/src/lib/cms/painelCrmEscrita.test.ts` (só a parte pura: `gerarCodigoOportunidade`, conversores)

**Interfaces:**
- Consumes: `ResultadoEscrita` de `./painelCmsEscrita`; `obterUsuarioCms` de `@/lib/cms/autenticacao`; leitura da Task 5.
- Produces (consumidos pelas telas, Tasks 10–12):

```ts
export interface DadosClienteCrm { orgao: string; sigla: string; tipo: string; municipio: string; uf: string; esfera: string; area: string; cnpj: string; dirigente: string; cargoDirigente: string; email: string; origem: string; potencial: string; status: string; responsavel: string; proximaAcao: string; observacoes: string; }
export interface DadosContatoCrm { nome: string; cliente: string; cargo: string; setor: string; email: string; whatsapp: string; principal: boolean; decisor: boolean; }
export interface DadosOportunidade { cliente: string; programa: string; modulos: string[]; eventos: string[]; uf: string; origem: string; quantidade: string; modalidade: string; valor: string; probabilidade: string; status: string; dataAbertura: string; dataPrevFechamento: string; proximaAcao: string; followup: string; responsavel: string; observacoes: string; }
```
Funções em `painelCrmEscrita.ts`: `criarClienteCrm(dados)`, `atualizarClienteCrm(id, dados)`, `criarContatoCrm(dados)`, `atualizarContatoCrm(id, dados)`, `criarOportunidade(dados)` (gera `codigo`), `atualizarOportunidade(id, dados)` — todas `Promise<ResultadoEscrita>`; puras exportadas: `gerarCodigoOportunidade(ano: number, sequencia: number): string`, `numeroOuNulo(v: string): number | null`.
Server Actions em `acoesCrm.ts`: `carregarClienteCrm(id)`, `carregarOportunidadeCrm(id)`, `salvarClienteCrm(id: string | null, dados)`, `salvarContatoCrm(id: string | null, dados)`, `salvarOportunidadeCrm(id: string | null, dados)` — todas com guarda de sessão; escritas fazem `revalidatePath("/crm")`.

- [ ] **Step 1: Teste que falha** — `painelCrmEscrita.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { gerarCodigoOportunidade, numeroOuNulo } from "./painelCrmEscrita";

describe("gerarCodigoOportunidade", () => {
  it("monta OPO-<ano>-<seq> com 3 dígitos", () => {
    expect(gerarCodigoOportunidade(2026, 1)).toBe("OPO-2026-001");
    expect(gerarCodigoOportunidade(2026, 42)).toBe("OPO-2026-042");
  });
});

describe("numeroOuNulo", () => {
  it("converte string de formulário em número ou null", () => {
    expect(numeroOuNulo("140000")).toBe(140000);
    expect(numeroOuNulo("75,5")).toBe(75.5);
    expect(numeroOuNulo("")).toBeNull();
    expect(numeroOuNulo("abc")).toBeNull();
  });
});
```

⚠️ `painelCrmEscrita.ts` importa `server-only`, que explode fora do React server. Siga o padrão que o Vitest do cms já usa para testar libs server-only (verifique com `grep -rl "server-only" apps/cms/src/lib | xargs grep -l vitest` e como `vitest.config.ts` resolve; se não houver precedente, adicione alias no `vitest.config.ts`: `"server-only": fileURLToPath(new URL("./src/lib/testes/server-only-stub.ts", import.meta.url))` e crie o stub `export {};`).

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test -- painelCrmEscrita` → FAIL.

- [ ] **Step 3: Implementar `painelCrmEscrita.ts`**

```ts
import "server-only";

import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Escrita do módulo CRM via Local API. Toda função devolve ResultadoEscrita
 * com mensagem neutra — o detalhe do erro vai para o console do servidor.
 */

// [colar aqui os interfaces DadosClienteCrm / DadosContatoCrm / DadosOportunidade]

const ouNulo = (v: string): string | null => (v.trim().length > 0 ? v.trim() : null);

export function numeroOuNulo(v: string): number | null {
  const limpo = v.trim().replace(/\./g, "").replace(",", ".");
  if (limpo === "") return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

export function gerarCodigoOportunidade(ano: number, sequencia: number): string {
  return `OPO-${ano}-${String(sequencia).padStart(3, "0")}`;
}

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

function dadosCliente(dados: DadosClienteCrm) {
  return {
    orgao: dados.orgao.trim(),
    sigla: ouNulo(dados.sigla),
    tipo: ouNulo(dados.tipo),
    municipio: ouNulo(dados.municipio),
    uf: ouNulo(dados.uf),
    esfera: ouNulo(dados.esfera),
    area: ouNulo(dados.area),
    cnpj: ouNulo(dados.cnpj),
    dirigente: ouNulo(dados.dirigente),
    cargoDirigente: ouNulo(dados.cargoDirigente),
    email: ouNulo(dados.email),
    origem: ouNulo(dados.origem),
    potencial: numeroOuNulo(dados.potencial),
    status: ouNulo(dados.status) ?? "prospect",
    responsavel: ouNulo(dados.responsavel),
    proximaAcao: ouNulo(dados.proximaAcao),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarClienteCrm(dados: DadosClienteCrm): Promise<ResultadoEscrita> {
  if (dados.orgao.trim() === "") return { ok: false, erro: "Informe o órgão." };
  try {
    const payload = await obterPayload();
    await payload.create({ collection: "clientes-crm", data: dadosCliente(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[criarClienteCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarClienteCrm(id: string, dados: DadosClienteCrm): Promise<ResultadoEscrita> {
  if (dados.orgao.trim() === "") return { ok: false, erro: "Informe o órgão." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "clientes-crm", id, data: dadosCliente(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarClienteCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function dadosContato(dados: DadosContatoCrm) {
  return {
    nome: dados.nome.trim(),
    cliente: dados.cliente,
    cargo: ouNulo(dados.cargo),
    setor: ouNulo(dados.setor),
    email: ouNulo(dados.email),
    whatsapp: ouNulo(dados.whatsapp),
    principal: dados.principal,
    decisor: dados.decisor,
  };
}

export async function criarContatoCrm(dados: DadosContatoCrm): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "" || dados.cliente === "")
    return { ok: false, erro: "Informe nome e cliente." };
  try {
    const payload = await obterPayload();
    await payload.create({ collection: "contatos-crm", data: dadosContato(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[criarContatoCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarContatoCrm(id: string, dados: DadosContatoCrm): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "" || dados.cliente === "")
    return { ok: false, erro: "Informe nome e cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "contatos-crm", id, data: dadosContato(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarContatoCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function dadosOportunidade(dados: DadosOportunidade) {
  return {
    cliente: dados.cliente,
    programa: ouNulo(dados.programa),
    modulos: dados.modulos,
    eventos: dados.eventos,
    uf: ouNulo(dados.uf),
    origem: ouNulo(dados.origem),
    quantidade: numeroOuNulo(dados.quantidade),
    modalidade: ouNulo(dados.modalidade),
    valor: numeroOuNulo(dados.valor),
    probabilidade: numeroOuNulo(dados.probabilidade),
    status: ouNulo(dados.status) ?? "em-qualificacao",
    dataAbertura: ouNulo(dados.dataAbertura),
    dataPrevFechamento: ouNulo(dados.dataPrevFechamento),
    proximaAcao: ouNulo(dados.proximaAcao),
    followup: ouNulo(dados.followup),
    responsavel: ouNulo(dados.responsavel),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarOportunidade(dados: DadosOportunidade): Promise<ResultadoEscrita> {
  if (dados.cliente === "") return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    const ano = new Date().getFullYear();
    const existentes = await payload.count({
      collection: "oportunidades",
      where: { codigo: { like: `OPO-${ano}-` } },
    });
    const codigo = gerarCodigoOportunidade(ano, existentes.totalDocs + 1);
    await payload.create({
      collection: "oportunidades",
      data: { codigo, ...dadosOportunidade(dados) },
    });
    return { ok: true };
  } catch (e) {
    console.error("[criarOportunidade]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarOportunidade(id: string, dados: DadosOportunidade): Promise<ResultadoEscrita> {
  if (dados.cliente === "") return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "oportunidades", id, data: dadosOportunidade(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarOportunidade]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
```

Nota: se o typecheck reclamar dos `data` (tipos gerados esperam uniões literais nos selects, ex. `status: "prospect" | ...`), tipar os retornos dos montadores `dadosCliente`/`dadosOportunidade` com os tipos gerados parciais (`Partial<ClienteCrm>`-like) fazendo cast estreito campo a campo — **sem `any`**; o padrão de referência é como `painelCmsEscrita.ts` monta `data` hoje.

- [ ] **Step 4: Rodar e ver passar** — `pnpm test -- painelCrmEscrita` → PASS.

- [ ] **Step 5: Criar `acoesCrm.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterClienteCrm,
  obterOportunidadeCrm,
  type ClienteCrmDetalhe,
  type OportunidadeCrmDetalhe,
} from "@/lib/cms/painelCrm";
import {
  atualizarClienteCrm,
  atualizarContatoCrm,
  atualizarOportunidade,
  criarClienteCrm,
  criarContatoCrm,
  criarOportunidade,
  type DadosClienteCrm,
  type DadosContatoCrm,
  type DadosOportunidade,
} from "@/lib/cms/painelCrmEscrita";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

/**
 * Server Actions do módulo CRM. Toda action valida a sessão ANTES de tocar a
 * Local API — Server Actions são endpoints públicos (mesma regra de acoes.ts).
 */

const RECUSADO: ResultadoEscrita = { ok: false, erro: "Sessão expirada. Entre novamente." };

export async function carregarClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterClienteCrm(id);
}

export async function carregarOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterOportunidadeCrm(id);
}

export async function salvarClienteCrm(
  id: string | null,
  dados: DadosClienteCrm,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = id === null ? await criarClienteCrm(dados) : await atualizarClienteCrm(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function salvarContatoCrm(
  id: string | null,
  dados: DadosContatoCrm,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = id === null ? await criarContatoCrm(dados) : await atualizarContatoCrm(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function salvarOportunidadeCrm(
  id: string | null,
  dados: DadosOportunidade,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado =
    id === null ? await criarOportunidade(dados) : await atualizarOportunidade(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}
```

- [ ] **Step 6: Typecheck + testes** — `pnpm typecheck && pnpm test` → PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrmEscrita.ts apps/cms/src/lib/cms/painelCrmEscrita.test.ts apps/cms/src/app/\(painel\)/acoesCrm.ts apps/cms/vitest.config.ts
git commit -m "feat(crm): escrita das entidades CRM e server actions com guarda de sessão"
```

---

### Task 8: Casco compartilhado `ShellPainel` + seletor de módulo

**Files:**
- Create: `apps/cms/src/app/(painel)/shell/ShellPainel.tsx`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx` (vira consumidor fino)
- Modify: `apps/cms/src/app/(painel)/painel.css` (CSS do seletor + selos semânticos, ao final do arquivo)

**Interfaces:**
- Produces:

```ts
export type ModuloPainel = "site" | "crm";
export interface ItemNavPainel { id: string; rotulo: string; icone: React.ReactNode; }
export interface GrupoNav { rotulo: string; itens: ItemNavPainel[]; }
interface ShellPainelProps { modulo: ModuloPainel; usuario: { nome: string; email: string }; grupos: GrupoNav[]; telaAtiva: string; onIrPara: (id: string) => void; breadcrumb: string; carregando: boolean; children: React.ReactNode; }
```

**Regra de ouro:** o markup do casco (classes, ordem, SVGs) é copiado **byte a byte** de `ShellCms.tsx` — a única adição é o bloco `.pcms-modulos` entre `.pcms-sidebar__brand` e `.pcms-nav`. O módulo Site deve continuar visualmente idêntico.

- [ ] **Step 1: Criar `shell/ShellPainel.tsx`** — mover de `ShellCms.tsx`: a função `iniciais()`, o JSX de `.pcms-root`/`.pcms-sidebar` (brand, nav, foot) e `.pcms-main` (topbar, content). Nav renderizada a partir de `grupos` (map duplo, mesmo `<button>` com `pcms-nav__item`/`--ativo`/`aria-current`). Adicionar o seletor:

```tsx
"use client";

import Link from "next/link";

import { sair } from "../acoesAuth";

export type ModuloPainel = "site" | "crm";

export interface ItemNavPainel {
  id: string;
  rotulo: string;
  icone: React.ReactNode;
}

export interface GrupoNav {
  rotulo: string;
  itens: ItemNavPainel[];
}

interface ShellPainelProps {
  modulo: ModuloPainel;
  usuario: { nome: string; email: string };
  grupos: GrupoNav[];
  telaAtiva: string;
  onIrPara: (id: string) => void;
  breadcrumb: string;
  carregando: boolean;
  children: React.ReactNode;
}

const MODULOS: { id: ModuloPainel; rotulo: string; href: string }[] = [
  { id: "site", rotulo: "Site", href: "/" },
  { id: "crm", rotulo: "CRM", href: "/crm" },
];

/** Iniciais para o avatar da sidebar ("Maria Souza" → "MS"). */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "NT";
}

/**
 * Casco visual compartilhado do Portal Admin (sidebar Oxford + topbar +
 * conteúdo) — usado pelos módulos Site (/) e CRM (/crm). O seletor de módulo
 * navega por rota real; a navegação interna de cada módulo é client-side.
 */
export function ShellPainel({
  modulo,
  usuario,
  grupos,
  telaAtiva,
  onIrPara,
  breadcrumb,
  carregando,
  children,
}: ShellPainelProps) {
  return (
    <div className="pcms-root">
      <aside className="pcms-sidebar">
        {/* [COPIAR de ShellCms.tsx: <div className="pcms-sidebar__brand">…</div> inteiro, sem alterações] */}

        <div className="pcms-modulos" role="navigation" aria-label="Módulos do portal">
          {MODULOS.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={`pcms-modulos__opcao${modulo === m.id ? " pcms-modulos__opcao--ativa" : ""}`}
              aria-current={modulo === m.id ? "page" : undefined}
            >
              {m.rotulo}
            </Link>
          ))}
        </div>

        <nav className="pcms-nav" aria-label="Navegação principal do painel">
          {grupos.map((grupo) => (
            <div key={grupo.rotulo} className="pcms-nav__group">
              <p className="pcms-nav__label">{grupo.rotulo}</p>
              {grupo.itens.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pcms-nav__item${telaAtiva === item.id ? " pcms-nav__item--ativo" : ""}`}
                  aria-current={telaAtiva === item.id ? "page" : undefined}
                  onClick={() => onIrPara(item.id)}
                >
                  {item.icone}
                  {item.rotulo}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* [COPIAR de ShellCms.tsx: <div className="pcms-sidebar__foot">…</div> inteiro, incluindo o form de sair] */}
      </aside>

      <div className="pcms-main">
        {/* [COPIAR de ShellCms.tsx: <header className="pcms-topbar">…</header>, trocando {CRUMB[tela]} por {breadcrumb}] */}
        <main className="pcms-content" aria-busy={carregando}>
          {carregando && <div className="pcms-carregando">Carregando…</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Refatorar `ShellCms.tsx`** — remover `iniciais()`, o JSX do casco e o import de `sair`; manter `Ico`, `NAV_*`, `CRUMB`, estados e handlers. O return vira:

```tsx
  const grupos: GrupoNav[] = [
    { rotulo: "Editorial", itens: NAV_PRINCIPAL },
    { rotulo: "Comercial", itens: NAV_COMERCIAL },
    { rotulo: "Sistema", itens: NAV_SISTEMA },
  ];

  return (
    <ShellPainel
      modulo="site"
      usuario={usuario}
      grupos={grupos}
      telaAtiva={tela}
      onIrPara={(id) => irPara(id as TelaId)}
      breadcrumb={CRUMB[tela]}
      carregando={carregando}
    >
      {/* [conteúdo condicional existente: eventoDet ? … : palestranteDet ? … : etc — inalterado] */}
    </ShellPainel>
  );
```

Import novo: `import { ShellPainel, type GrupoNav } from "./shell/ShellPainel";`. O grupo Comercial/Leads **permanece** nesta task (sai na Task 9, quando `/crm` existir).

- [ ] **Step 3: CSS ao final de `painel.css`**

```css
/* =====================================================================
   Seletor de módulo (Site | CRM) — extensão Fase A do portal unificado
   ===================================================================== */
.pcms-modulos {
  display: flex;
  margin: 0 20px 18px;
  border: 1px solid rgba(244, 239, 230, 0.28);
}
.pcms-modulos__opcao {
  flex: 1;
  padding: 8px 0 7px;
  text-align: center;
  font-family: var(--font-corpo-cond, var(--font-corpo)), "Barlow", sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(244, 239, 230, 0.68);
  text-decoration: none;
}
.pcms-modulos__opcao + .pcms-modulos__opcao {
  border-left: 1px solid rgba(244, 239, 230, 0.28);
}
.pcms-modulos__opcao--ativa {
  background: rgba(181, 153, 90, 0.16);
  color: var(--pcms-dourado);
  box-shadow: inset 0 -2px 0 var(--pcms-dourado);
}
.pcms-modulos__opcao:focus-visible {
  outline: 2px solid var(--pcms-dourado);
  outline-offset: -2px;
}

/* Selos semânticos (padrão trazido do CRM, re-tokenizado Soberana) */
.pcms-selo--ok {
  background: rgba(63, 107, 63, 0.12);
  color: var(--pcms-sucesso);
}
.pcms-selo--atencao {
  background: rgba(181, 153, 90, 0.18);
  color: #7a6330;
}
.pcms-selo--erro {
  background: rgba(154, 27, 27, 0.1);
  color: var(--pcms-erro);
}
.pcms-selo--info {
  background: rgba(30, 78, 140, 0.1);
  color: var(--pcms-oxford-claro);
}

/* Aviso inline de formulário (sucesso/erro de Server Action) */
.pcms-form-aviso {
  padding: 10px 14px;
  font-size: 0.9rem;
  border-left: 3px solid var(--pcms-sucesso);
  background: rgba(63, 107, 63, 0.08);
  color: var(--pcms-grafite);
}
.pcms-form-aviso--erro {
  border-left-color: var(--pcms-erro);
  background: rgba(154, 27, 27, 0.06);
}
```

Ajustar o `margin` horizontal de `.pcms-modulos` para casar com o padding real de `.pcms-sidebar__brand` (conferir em `painel.css` linha ~59) — o seletor deve alinhar com a logo.

- [ ] **Step 4: Verificar** — `cd apps/cms && pnpm typecheck && pnpm build`
Expected: build PASS. Abrir `pnpm dev:cms` → `http://localhost:3001/` e conferir que o módulo Site está **idêntico** (exceto o seletor novo; link CRM ainda dá 404 — esperado até a Task 9). Encerrar o dev.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/app/\(painel\)/shell/ShellPainel.tsx apps/cms/src/app/\(painel\)/ShellCms.tsx apps/cms/src/app/\(painel\)/painel.css
git commit -m "feat(painel): casco compartilhado ShellPainel com seletor de módulo Site|CRM"
```

---

### Task 9: Rota `/crm` — `page.tsx`, `ShellCrm`, Painel Comercial e Leads

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/page.tsx`
- Create: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaPainelComercial.tsx`
- Create: `apps/cms/src/app/(painel)/crm/seloStatus.ts`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx` (remover grupo Comercial: `NAV_COMERCIAL`, tela/estado/crumb de leads, imports de `TelaLeads`/`DetalheLead`/`carregarLead`)

**Interfaces:**
- Consumes: Tasks 5–8 (`painelCrm`, `kpisComercial`, `ShellPainel`, `acoesCrm`); `TelaLeads`/`DetalheLead`/`carregarLead` existentes (reusados via import relativo `../TelaLeads` etc.).
- Produces: `TelaCrmId = "painel" | "leads" | "clientes" | "contatos" | "oportunidades"`; `ShellCrmProps { usuario; clientes; contatos; oportunidades; leads; catalogo; usuarios; hojeISO: string; erroLeitura: boolean }`. `ShellCrm` renderiza placeholders "Em construção" para clientes/contatos/oportunidades nesta task (telas chegam nas Tasks 10–12 — ver Steps 4–6 lá).

- [ ] **Step 1: `crm/seloStatus.ts`** — mapeamento status → classe de selo (client-safe, sem imports de servidor):

```ts
/** Classe de selo (pcms-selo--*) por status de oportunidade e cliente. */
const SELO_OPORTUNIDADE: Record<string, string> = {
  "em-qualificacao": "info",
  "apresentacao-institucional": "info",
  "proposta-enviada": "info",
  "em-negociacao": "atencao",
  aprovada: "ok",
  contratada: "ok",
  perdida: "erro",
  cancelada: "erro",
};

const SELO_CLIENTE: Record<string, string> = {
  prospect: "info",
  "em-qualificacao": "info",
  "em-negociacao": "atencao",
  "cliente-ativo": "ok",
  "cliente-inativo": "erro",
  encerrado: "erro",
};

export const seloDeOportunidade = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_OPORTUNIDADE[status] ?? "info"}`;

export const seloDeCliente = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_CLIENTE[status] ?? "info"}`;

/** Rótulo legível a partir do value ("em-negociacao" → via lista). */
export function rotuloDeLista(opcoes: { label: string; value: string }[], value: string | null): string {
  if (value === null) return "—";
  return opcoes.find((o) => o.value === value)?.label ?? value;
}
```

- [ ] **Step 2: `crm/page.tsx`**

```tsx
import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { listarLeadsCms, type LeadCmsResumo } from "@/lib/cms/painelCms";
import {
  listarClientesCrm,
  listarContatosCrm,
  listarOportunidadesCrm,
  listarUsuariosCms,
  obterCatalogoCrm,
  type CatalogoCrm,
  type ClienteCrmResumo,
  type ContatoCrmResumo,
  type OportunidadeCrmResumo,
  type UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";

import { ShellCrm } from "./ShellCrm";

export const dynamic = "force-dynamic";

/**
 * Rota /crm — módulo CRM do Portal Admin. Server Component: carrega SÓ os
 * dados comerciais e entrega ao casco client. Banco indisponível ⇒ listas
 * vazias + erroLeitura (mesmo padrão da rota /).
 */
export default async function PainelCrmPage() {
  const usuario = await exigirUsuarioCms();

  let clientes: ClienteCrmResumo[] = [];
  let contatos: ContatoCrmResumo[] = [];
  let oportunidades: OportunidadeCrmResumo[] = [];
  let leads: LeadCmsResumo[] = [];
  let catalogo: CatalogoCrm = { programas: [], modulos: [], eventos: [] };
  let usuarios: UsuarioCmsResumo[] = [];
  let erroLeitura = false;

  try {
    [clientes, contatos, oportunidades, leads, catalogo, usuarios] = await Promise.all([
      listarClientesCrm(),
      listarContatosCrm(),
      listarOportunidadesCrm(),
      listarLeadsCms(),
      obterCatalogoCrm(),
      listarUsuariosCms(),
    ]);
  } catch (e) {
    console.error("[PainelCrmPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  const hojeISO = new Date().toISOString().slice(0, 10);

  return (
    <ShellCrm
      usuario={usuario}
      clientes={clientes}
      contatos={contatos}
      oportunidades={oportunidades}
      leads={leads}
      catalogo={catalogo}
      usuarios={usuarios}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
```

- [ ] **Step 3: `crm/ShellCrm.tsx`** — mesmo padrão do ShellCms (estado de tela + detalhes + form aberto):

```tsx
"use client";

import { useState, useTransition } from "react";

import type { LeadCmsDetalhe, LeadCmsResumo } from "@/lib/cms/painelCms";
import type {
  CatalogoCrm,
  ClienteCrmDetalhe,
  ClienteCrmResumo,
  ContatoCrmResumo,
  OportunidadeCrmDetalhe,
  OportunidadeCrmResumo,
  UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";

import { carregarLead } from "../acoes";
import { carregarClienteCrm, carregarOportunidadeCrm } from "../acoesCrm";
import { DetalheLead } from "../DetalheLead";
import { TelaLeads } from "../TelaLeads";
import { ShellPainel, type GrupoNav } from "../shell/ShellPainel";
import { TelaPainelComercial } from "./TelaPainelComercial";

interface ShellCrmProps {
  usuario: { nome: string; email: string };
  clientes: ClienteCrmResumo[];
  contatos: ContatoCrmResumo[];
  oportunidades: OportunidadeCrmResumo[];
  leads: LeadCmsResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  hojeISO: string;
  erroLeitura: boolean;
}

type TelaCrmId = "painel" | "leads" | "clientes" | "contatos" | "oportunidades";

/** Formulário de criação/edição aberto em tela cheia. */
type FormCrmAberto =
  | { entidade: "cliente"; inicial: ClienteCrmDetalhe | null }
  | { entidade: "contato"; inicial: ContatoCrmResumo | null }
  | { entidade: "oportunidade"; inicial: OportunidadeCrmDetalhe | null };

/* Ícones lineares funcionais, peso 1.5 (CLAUDE.md §3). */
const Ico = {
  painel: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  leads: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  clientes: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l6-2v18" />
      <path d="M10 21h10V9l-10-2" />
      <path d="M14 12h2M14 16h2" />
    </svg>
  ),
  contatos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    </svg>
  ),
  oportunidades: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 21 12l-9 9-9-9z" />
    </svg>
  ),
};

const NAV_COMERCIAL: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "painel", rotulo: "Painel Comercial", icone: Ico.painel },
  { id: "leads", rotulo: "Leads", icone: Ico.leads },
  { id: "clientes", rotulo: "Clientes", icone: Ico.clientes },
  { id: "contatos", rotulo: "Contatos", icone: Ico.contatos },
  { id: "oportunidades", rotulo: "Oportunidades", icone: Ico.oportunidades },
];

const CRUMB: Record<TelaCrmId, string> = {
  painel: "CRM · Painel Comercial",
  leads: "CRM · Leads",
  clientes: "CRM · Clientes",
  contatos: "CRM · Contatos",
  oportunidades: "CRM · Oportunidades",
};

export function ShellCrm({
  usuario,
  clientes,
  contatos,
  oportunidades,
  leads,
  catalogo,
  usuarios,
  hojeISO,
  erroLeitura,
}: ShellCrmProps) {
  const [tela, setTela] = useState<TelaCrmId>("painel");
  const [clienteDet, setClienteDet] = useState<ClienteCrmDetalhe | null>(null);
  const [oportunidadeDet, setOportunidadeDet] = useState<OportunidadeCrmDetalhe | null>(null);
  const [leadDet, setLeadDet] = useState<LeadCmsDetalhe | null>(null);
  const [formAberto, setFormAberto] = useState<FormCrmAberto | null>(null);
  const [carregando, iniciarCarga] = useTransition();

  function fecharTudo() {
    setClienteDet(null);
    setOportunidadeDet(null);
    setLeadDet(null);
    setFormAberto(null);
  }

  function irPara(id: string) {
    fecharTudo();
    setTela(id as TelaCrmId);
  }

  function abrirCliente(id: string) {
    iniciarCarga(async () => {
      const det = await carregarClienteCrm(id);
      if (det) setClienteDet(det);
    });
  }

  function abrirOportunidade(id: string) {
    iniciarCarga(async () => {
      const det = await carregarOportunidadeCrm(id);
      if (det) setOportunidadeDet(det);
    });
  }

  function abrirLead(id: string) {
    iniciarCarga(async () => {
      const det = await carregarLead(id);
      if (det) setLeadDet(det);
    });
  }

  const grupos: GrupoNav[] = [{ rotulo: "Comercial", itens: NAV_COMERCIAL }];

  return (
    <ShellPainel
      modulo="crm"
      usuario={usuario}
      grupos={grupos}
      telaAtiva={tela}
      onIrPara={irPara}
      breadcrumb={CRUMB[tela]}
      carregando={carregando}
    >
      {/* Detalhes e formulários em tela cheia têm precedência sobre a tela ativa. */}
      {leadDet ? (
        <DetalheLead lead={leadDet} onVoltar={() => setLeadDet(null)} />
      ) : formAberto ? (
        <PlaceholderConstrucao onVoltar={fecharTudo} />
      ) : clienteDet ? (
        <PlaceholderConstrucao onVoltar={fecharTudo} />
      ) : oportunidadeDet ? (
        <PlaceholderConstrucao onVoltar={fecharTudo} />
      ) : (
        <>
          {tela === "painel" && (
            <TelaPainelComercial
              oportunidades={oportunidades}
              leads={leads}
              hojeISO={hojeISO}
              erroLeitura={erroLeitura}
              onAbrirOportunidade={abrirOportunidade}
            />
          )}
          {tela === "leads" && <TelaLeads leads={leads} onAbrir={abrirLead} />}
          {tela === "clientes" && <PlaceholderConstrucao />}
          {tela === "contatos" && <PlaceholderConstrucao />}
          {tela === "oportunidades" && <PlaceholderConstrucao />}
        </>
      )}
    </ShellPainel>
  );
}

/** Temporário — substituído pelas telas reais nas Tasks 10-12. */
function PlaceholderConstrucao({ onVoltar }: { onVoltar?: () => void }) {
  return (
    <div className="pcms-pagehead">
      <h1>Em construção</h1>
      {onVoltar && (
        <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onVoltar}>
          Voltar
        </button>
      )}
    </div>
  );
}
```

(As variáveis `clientes`, `contatos`, `catalogo`, `usuarios`, `setFormAberto`, `abrirCliente` ficam sem uso nesta task; se o ESLint reclamar, prefixe temporariamente com `void clientes;` etc. no corpo — as Tasks 10-12 as consomem. NÃO desabilite regras.)

- [ ] **Step 4: `crm/TelaPainelComercial.tsx`**

```tsx
"use client";

import type { LeadCmsResumo } from "@/lib/cms/painelCms";
import type { OportunidadeCrmResumo } from "@/lib/cms/painelCrm";
import {
  calcularKpisComercial,
  followupsProximos,
  formatarMoedaBRL,
} from "@/lib/cms/kpisComercial";
import { STATUS_OPORTUNIDADE } from "@ntc/lib";

import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface TelaPainelComercialProps {
  oportunidades: OportunidadeCrmResumo[];
  leads: LeadCmsResumo[];
  hojeISO: string;
  erroLeitura: boolean;
  onAbrirOportunidade: (id: string) => void;
}

/** Painel Comercial — KPIs do funil + follow-ups da semana. */
export function TelaPainelComercial({
  oportunidades,
  leads,
  hojeISO,
  erroLeitura,
  onAbrirOportunidade,
}: TelaPainelComercialProps) {
  const kpis = calcularKpisComercial(oportunidades, leads);
  const followups = followupsProximos(oportunidades, hojeISO);

  const metricas = [
    { rotulo: "Oportunidades abertas", valor: String(kpis.oportunidadesAbertas) },
    { rotulo: "Valor em negociação", valor: formatarMoedaBRL(kpis.valorEmNegociacao) },
    { rotulo: "Pipeline ponderado", valor: formatarMoedaBRL(kpis.pipelinePonderado) },
    { rotulo: "Leads novos", valor: String(kpis.leadsNovos) },
  ];

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Painel Comercial</h1>
          <p>Visão do funil de oportunidades e follow-ups da semana.</p>
        </div>
      </div>

      {erroLeitura && (
        <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">
          Não foi possível ler o banco de dados. Os números abaixo podem estar incompletos.
        </p>
      )}

      <div className="pcms-metricas">
        {metricas.map((m) => (
          <div key={m.rotulo} className="pcms-metrica">
            <div className="pcms-metrica__valor">{m.valor}</div>
            <div className="pcms-metrica__rotulo">{m.rotulo}</div>
          </div>
        ))}
      </div>

      <h2 className="pcms-pagehead__eyebrow">Follow-ups · próximos 7 dias</h2>
      {followups.length === 0 ? (
        <p>Nenhum follow-up programado para os próximos 7 dias.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((o) => (
              <tr
                key={o.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrirOportunidade(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrirOportunidade(o.id);
                  }
                }}
              >
                <td>{o.codigo}</td>
                <td>{o.clienteNome}</td>
                <td>{o.programaSigla ?? "—"}</td>
                <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                <td>
                  <span className={seloDeOportunidade(o.status)}>
                    {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                  </span>
                </td>
                <td>{o.followupISO?.split("-").reverse().join("/") ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

Antes de finalizar, conferir o markup real de `pcms-pagehead`/`pcms-tabela`/`pcms-linha-click` em `TelaLeads.tsx` e alinhar o esqueleto acima ao padrão existente (mesma estrutura de nós).

- [ ] **Step 5: Tirar Leads do módulo Site** — em `ShellCms.tsx`: remover `NAV_COMERCIAL`, o grupo "Comercial" de `grupos`, `"leads"` do union `TelaId`, o `CRUMB.leads`, os imports/estado/handler (`TelaLeads`, `DetalheLead`, `carregarLead`, `leadDet`, `abrirLead`) e o bloco `{tela === "leads" && …}`. `page.tsx` da rota `/` continua carregando `listarLeadsCms` **apenas** se `TelaDashboard` usar `leads` (usa — mantém).

- [ ] **Step 6: Verificar** — `pnpm typecheck && pnpm lint && pnpm build` → PASS. `pnpm dev:cms`: `/` sem grupo Comercial; seletor navega para `/crm`; Painel Comercial renderiza KPIs zerados (banco vazio) e Leads abre a tela existente. Encerrar dev.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm apps/cms/src/app/\(painel\)/ShellCms.tsx
git commit -m "feat(crm): rota /crm com casco, painel comercial e leads migrados"
```

---

### Task 10: Clientes — campos de formulário compartilhados + tela + detalhe + form

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/CamposCrm.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaClientes.tsx`
- Create: `apps/cms/src/app/(painel)/crm/DetalheCliente.tsx`
- Create: `apps/cms/src/app/(painel)/crm/FormCliente.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (ligar telas reais no lugar dos placeholders de cliente)

**Interfaces:**
- Consumes: `salvarClienteCrm` (Task 7), tipos da Task 5, listas de `@ntc/lib`, `seloDeCliente`/`rotuloDeLista` (Task 9).
- Produces:
  - `CamposCrm.tsx`: `CampoTexto { rotulo, valor, onMudar, tipo?, obrigatorio?, curto? }`, `CampoSelect { rotulo, valor, onMudar, opcoes: OpcaoLista[], curto? }` (inclui opção vazia "—"), `CampoNumero { rotulo, valor, onMudar, curto? }`, `CampoData { rotulo, valor, onMudar }`, `CampoCheck { rotulo, marcado, onMudar }`, `CampoArea { rotulo, valor, onMudar }`, `AvisoForm { erro: string | null }`, `BarraForm { titulo, salvando, onCancelar }` (header do form com botões Cancelar/Salvar — Salvar é `type="submit"`).
  - `TelaClientes { clientes, onAbrir(id), onNovo() }`; `DetalheCliente { cliente: ClienteCrmDetalhe, onVoltar(), onEditar(), onAbrirOportunidade(id), onNovaOportunidade(), onNovoContato() }`; `FormCliente { inicial: ClienteCrmDetalhe | null, usuarios: UsuarioCmsResumo[], onSalvo(), onCancelar() }`.

- [ ] **Step 1: Conferir o markup real de `pcms-field`** — `grep -n "pcms-field" apps/cms/src/app/\(painel\)/DetalheEvento.tsx | head -5` e abrir 10 linhas em torno do primeiro uso. Os componentes de `CamposCrm.tsx` devem reproduzir exatamente essa estrutura (`<label className="pcms-field"><span>Rótulo</span><input …/></label>` ou o que o painel usar).

- [ ] **Step 2: Criar `CamposCrm.tsx`** (esqueleto — ajustar ao markup verificado):

```tsx
"use client";

import type { OpcaoLista } from "@ntc/lib";

/** Campos de formulário do módulo CRM — mesmo visual dos campos do editor de evento. */

interface CampoTextoProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  tipo?: "text" | "email";
  obrigatorio?: boolean;
  curto?: boolean;
}

export function CampoTexto({ rotulo, valor, onMudar, tipo = "text", obrigatorio, curto }: CampoTextoProps) {
  return (
    <label className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <span>{rotulo}</span>
      <input type={tipo} value={valor} required={obrigatorio} onChange={(e) => onMudar(e.target.value)} />
    </label>
  );
}

interface CampoSelectProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  opcoes: OpcaoLista[];
  curto?: boolean;
}

export function CampoSelect({ rotulo, valor, onMudar, opcoes, curto }: CampoSelectProps) {
  return (
    <label className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <span>{rotulo}</span>
      <select value={valor} onChange={(e) => onMudar(e.target.value)}>
        <option value="">—</option>
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CampoNumeroProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  curto?: boolean;
}

export function CampoNumero({ rotulo, valor, onMudar, curto }: CampoNumeroProps) {
  return (
    <label className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <span>{rotulo}</span>
      <input type="text" inputMode="decimal" value={valor} onChange={(e) => onMudar(e.target.value)} />
    </label>
  );
}

interface CampoDataProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
}

export function CampoData({ rotulo, valor, onMudar }: CampoDataProps) {
  return (
    <label className="pcms-field pcms-field--curto">
      <span>{rotulo}</span>
      <input type="date" value={valor} onChange={(e) => onMudar(e.target.value)} />
    </label>
  );
}

interface CampoCheckProps {
  rotulo: string;
  marcado: boolean;
  onMudar: (v: boolean) => void;
}

export function CampoCheck({ rotulo, marcado, onMudar }: CampoCheckProps) {
  return (
    <label className="pcms-field pcms-field--check">
      <input type="checkbox" checked={marcado} onChange={(e) => onMudar(e.target.checked)} />
      <span>{rotulo}</span>
    </label>
  );
}

interface CampoAreaProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
}

export function CampoArea({ rotulo, valor, onMudar }: CampoAreaProps) {
  return (
    <label className="pcms-field">
      <span>{rotulo}</span>
      <textarea rows={3} value={valor} onChange={(e) => onMudar(e.target.value)} />
    </label>
  );
}

export function AvisoForm({ erro }: { erro: string | null }) {
  if (erro === null) return null;
  return (
    <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">
      {erro}
    </p>
  );
}

interface BarraFormProps {
  titulo: string;
  salvando: boolean;
  onCancelar: () => void;
}

export function BarraForm({ titulo, salvando, onCancelar }: BarraFormProps) {
  return (
    <div className="pcms-pagehead">
      <div>
        <p className="pcms-pagehead__eyebrow">Comercial</p>
        <h1>{titulo}</h1>
      </div>
      <div className="pcms-pagehead__acoes">
        <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="pcms-btn" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar `TelaClientes.tsx`**

```tsx
"use client";

import { STATUS_CLIENTE_CRM } from "@ntc/lib";

import type { ClienteCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeCliente } from "./seloStatus";

interface TelaClientesProps {
  clientes: ClienteCrmResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaClientes({ clientes, onAbrir, onNovo }: TelaClientesProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Clientes</h1>
          <p>Órgãos e instituições do funil comercial.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo cliente
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Órgão</th>
              <th>UF</th>
              <th>Área</th>
              <th>Potencial</th>
              <th>Status</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(c.id);
                  }
                }}
              >
                <td>
                  <strong>{c.orgao}</strong>
                  {c.sigla !== null && <> · {c.sigla}</>}
                </td>
                <td>{c.uf ?? "—"}</td>
                <td>{c.area ?? "—"}</td>
                <td>{c.potencial !== null ? formatarMoedaBRL(c.potencial) : "—"}</td>
                <td>
                  <span className={seloDeCliente(c.status)}>
                    {rotuloDeLista(STATUS_CLIENTE_CRM, c.status)}
                  </span>
                </td>
                <td>{c.responsavelNome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

Nota: `area` guarda o slug; exibir via `rotuloDeLista(AREAS_CRM, c.area)` (import de `@ntc/lib`).

- [ ] **Step 4: Criar `DetalheCliente.tsx`** — tela cheia de leitura no padrão de `DetalheLead` (verificar classes reais lá: `pcms-det-head`, `pcms-deflist` etc.): cabeçalho com botão Voltar + botão "Editar" (`onEditar`); lista de definições com órgão/sigla/tipo/município-UF/esfera/área/CNPJ/dirigente/e-mail/origem/potencial/status/responsável/próxima ação/observações (usar `rotuloDeLista` nas listas); seção "Contatos" (tabela simples nome/cargo/email/whatsapp + botão "Novo contato" → `onNovoContato()`); seção "Oportunidades" (tabela código/valor/status clicável → `onAbrirOportunidade(id)` + botão "Nova oportunidade" → `onNovaOportunidade()`).

- [ ] **Step 5: Criar `FormCliente.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

import type { ClienteCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosClienteCrm } from "@/lib/cms/painelCrmEscrita";

import { salvarClienteCrm } from "../acoesCrm";
import {
  AvisoForm,
  BarraForm,
  CampoArea,
  CampoNumero,
  CampoSelect,
  CampoTexto,
} from "./CamposCrm";

interface FormClienteProps {
  inicial: ClienteCrmDetalhe | null;
  usuarios: UsuarioCmsResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const paraOpcoes = (valores: string[]) => valores.map((v) => ({ label: v, value: v }));

export function FormCliente({ inicial, usuarios, onSalvo, onCancelar }: FormClienteProps) {
  const [dados, setDados] = useState<DadosClienteCrm>({
    orgao: inicial?.orgao ?? "",
    sigla: inicial?.sigla ?? "",
    tipo: inicial?.tipo ?? "",
    municipio: inicial?.municipio ?? "",
    uf: inicial?.uf ?? "",
    esfera: inicial?.esfera ?? "",
    area: inicial?.area ?? "",
    cnpj: inicial?.cnpj ?? "",
    dirigente: inicial?.dirigente ?? "",
    cargoDirigente: inicial?.cargoDirigente ?? "",
    email: inicial?.email ?? "",
    origem: inicial?.origem ?? "",
    potencial: inicial?.potencial !== null && inicial !== null ? String(inicial.potencial) : "",
    status: inicial?.status ?? "prospect",
    responsavel: inicial?.responsavelId ?? "",
    proximaAcao: inicial?.proximaAcao ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosClienteCrm>(campo: K) => (v: DadosClienteCrm[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarClienteCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        titulo={inicial === null ? "Novo cliente" : `Editar · ${inicial.orgao}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />
      <div className="pcms-det-grid">
        <CampoTexto rotulo="Órgão" valor={dados.orgao} onMudar={m("orgao")} obrigatorio />
        <CampoTexto rotulo="Sigla" valor={dados.sigla} onMudar={m("sigla")} curto />
        <CampoSelect rotulo="Tipo" valor={dados.tipo} onMudar={m("tipo")} opcoes={TIPOS_INSTITUICAO} />
        <CampoTexto rotulo="Município" valor={dados.municipio} onMudar={m("municipio")} />
        <CampoSelect rotulo="UF" valor={dados.uf} onMudar={m("uf")} opcoes={paraOpcoes(UFS)} curto />
        <CampoSelect rotulo="Esfera" valor={dados.esfera} onMudar={m("esfera")} opcoes={ESFERAS_CRM} />
        <CampoSelect rotulo="Área" valor={dados.area} onMudar={m("area")} opcoes={AREAS_CRM} />
        <CampoTexto rotulo="CNPJ" valor={dados.cnpj} onMudar={m("cnpj")} curto />
        <CampoTexto rotulo="Dirigente" valor={dados.dirigente} onMudar={m("dirigente")} />
        <CampoTexto rotulo="Cargo do dirigente" valor={dados.cargoDirigente} onMudar={m("cargoDirigente")} />
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} />
        <CampoSelect rotulo="Origem" valor={dados.origem} onMudar={m("origem")} opcoes={ORIGENS_CRM} />
        <CampoNumero rotulo="Potencial (R$)" valor={dados.potencial} onMudar={m("potencial")} curto />
        <CampoSelect rotulo="Status" valor={dados.status} onMudar={m("status")} opcoes={STATUS_CLIENTE_CRM} />
        <CampoSelect
          rotulo="Responsável"
          valor={dados.responsavel}
          onMudar={m("responsavel")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
        <CampoTexto rotulo="Próxima ação" valor={dados.proximaAcao} onMudar={m("proximaAcao")} />
        <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
      </div>
    </form>
  );
}
```

- [ ] **Step 6: Ligar no `ShellCrm.tsx`** — substituir os placeholders de cliente:
  - `{tela === "clientes" && (<TelaClientes clientes={clientes} onAbrir={abrirCliente} onNovo={() => setFormAberto({ entidade: "cliente", inicial: null })} />)}`
  - `clienteDet ? (<DetalheCliente cliente={clienteDet} onVoltar={fecharTudo} onEditar={() => setFormAberto({ entidade: "cliente", inicial: clienteDet })} onAbrirOportunidade={abrirOportunidade} onNovaOportunidade={() => setFormAberto({ entidade: "oportunidade", inicial: null })} onNovoContato={() => setFormAberto({ entidade: "contato", inicial: null })} />)`
  - `formAberto?.entidade === "cliente"` → `<FormCliente inicial={formAberto.inicial} usuarios={usuarios} onSalvo={fecharTudo} onCancelar={fecharTudo} />` (as entidades contato/oportunidade continuam no placeholder até as Tasks 11-12).

- [ ] **Step 7: Verificar** — `pnpm typecheck && pnpm build` PASS; no dev, criar um cliente de teste, ver na listagem, abrir detalhe, editar, salvar.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm
git commit -m "feat(crm): tela de clientes com detalhe e formulário de criação/edição"
```

---

### Task 11: Contatos — tela + form

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/TelaContatos.tsx`
- Create: `apps/cms/src/app/(painel)/crm/FormContato.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`

**Interfaces:**
- Consumes: `salvarContatoCrm` (Task 7), `ContatoCrmResumo`, `ClienteCrmResumo`, `CamposCrm` (Task 10).
- Produces: `TelaContatos { contatos, onEditar(contato), onNovo() }` (linha clicável abre direto o form de edição — contato não tem tela de detalhe); `FormContato { inicial: ContatoCrmResumo | null, clientes: ClienteCrmResumo[], clientePreSelecionado?: string, onSalvo(), onCancelar() }`.

- [ ] **Step 1: `TelaContatos.tsx`** — mesmo esqueleto de `TelaClientes` (pagehead "Contatos" + botão "Novo contato" + tabela Nome / Cliente / Cargo / E-mail / WhatsApp / selos "Principal"/"Decisor" com `pcms-selo--info`); linha clicável chama `onEditar(contato)`.

- [ ] **Step 2: `FormContato.tsx`** — mesmo padrão do `FormCliente`: estado `DadosContatoCrm` inicializado de `inicial` (com `cliente: inicial?.clienteId ?? clientePreSelecionado ?? ""`), campos `CampoTexto` (nome obrigatório), `CampoSelect` de cliente (`clientes.map((c) => ({ label: c.orgao, value: c.id }))`), cargo, setor, e-mail, whatsapp, `CampoCheck` principal e decisor; submit → `salvarContatoCrm(inicial?.id ?? null, dados)`.

- [ ] **Step 3: Ligar no `ShellCrm.tsx`** — `{tela === "contatos" && <TelaContatos contatos={contatos} onEditar={(c) => setFormAberto({ entidade: "contato", inicial: c })} onNovo={() => setFormAberto({ entidade: "contato", inicial: null })} />}` e o ramo `formAberto?.entidade === "contato"` → `<FormContato inicial={formAberto.inicial} clientes={clientes} clientePreSelecionado={clienteDet?.id} onSalvo={fecharTudo} onCancelar={fecharTudo} />`. (Ao abrir "Novo contato" de dentro de `DetalheCliente`, `clienteDet` ainda está setado — o form nasce com o cliente pré-selecionado; `fecharTudo` limpa os dois estados.)

- [ ] **Step 4: Verificar** — `pnpm typecheck && pnpm build` PASS; no dev, criar/editar contato, inclusive a partir do detalhe de um cliente.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm
git commit -m "feat(crm): tela de contatos com formulário de criação/edição"
```

---

### Task 12: Oportunidades — tela + detalhe + form

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/TelaOportunidades.tsx`
- Create: `apps/cms/src/app/(painel)/crm/DetalheOportunidade.tsx`
- Create: `apps/cms/src/app/(painel)/crm/FormOportunidade.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`

**Interfaces:**
- Consumes: `salvarOportunidadeCrm` (Task 7), tipos da Task 5, `CatalogoCrm`, `CamposCrm`, `seloDeOportunidade`.
- Produces: `TelaOportunidades { oportunidades, onAbrir(id), onNovo() }`; `DetalheOportunidade { oportunidade: OportunidadeCrmDetalhe, onVoltar(), onEditar() }`; `FormOportunidade { inicial: OportunidadeCrmDetalhe | null, clientes, catalogo, usuarios, clientePreSelecionado?, onSalvo(), onCancelar() }`.

- [ ] **Step 1: `TelaOportunidades.tsx`** — pagehead "Oportunidades" + "Nova oportunidade"; tabela Código / Cliente / Programa / Valor / Prob. / Status (selo) / Follow-up; linha clicável → `onAbrir(id)`. Mesmos padrões de acessibilidade das outras telas (role="button", tabIndex, Enter/Espaço).

- [ ] **Step 2: `DetalheOportunidade.tsx`** — cabeçalho com código + selo de status + botões Voltar/Editar; deflist com cliente, programa, módulos (lista "M{numero} — {titulo}"), eventos, UF, origem, quantidade, modalidade, valor (`formatarMoedaBRL`), probabilidade (%), **valor ponderado** (valor × prob/100 — calculado inline), datas (abertura, prev. fechamento, follow-up — exibir dd/mm/aaaa), próxima ação, responsável, observações.

- [ ] **Step 3: `FormOportunidade.tsx`** — padrão do `FormCliente`, estado `DadosOportunidade`. Campos: cliente (`CampoSelect` obrigatório, de `clientes`), programa (`CampoSelect` de `catalogo.programas` — label `${sigla} — ${nome}`), **módulos** e **eventos** (múltipla escolha: lista de `CampoCheck`, um por item de `catalogo.modulos` filtrado pelo programa selecionado quando houver / `catalogo.eventos`; estado como `string[]` de ids), UF, origem, quantidade (`CampoNumero`), modalidade (`CampoTexto`), valor, probabilidade (`CampoNumero`), status (`CampoSelect` de `STATUS_OPORTUNIDADE`), dataAbertura/dataPrevFechamento/followup (`CampoData`), próxima ação, responsável, observações. Ao criar (`inicial === null`), `dataAbertura` nasce com a data de hoje (`new Date().toISOString().slice(0, 10)`) e o código é gerado no servidor (não há campo código no form de criação; na edição exibir o código no título).

- [ ] **Step 4: Ligar no `ShellCrm.tsx`** — tela, detalhe (`oportunidadeDet`) e ramo `formAberto?.entidade === "oportunidade"` → `<FormOportunidade inicial={formAberto.inicial} clientes={clientes} catalogo={catalogo} usuarios={usuarios} clientePreSelecionado={clienteDet?.id} onSalvo={fecharTudo} onCancelar={fecharTudo} />`. Remover `PlaceholderConstrucao` (não deve sobrar nenhum uso) e os `void` temporários da Task 9.

- [ ] **Step 5: Verificar** — `pnpm typecheck && pnpm lint && pnpm test && pnpm build` PASS; no dev: criar oportunidade (código `OPO-2026-001` gerado), ver no Painel Comercial os KPIs mudarem, abrir detalhe, editar.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/app/\(painel\)/crm
git commit -m "feat(crm): tela de oportunidades com detalhe, formulário e código gerado"
```

---

### Task 13: Importador do JSON do CRM legado (TDD)

**Files:**
- Create: `apps/cms/src/lib/crm/importadorCrm.ts` (puro: parse + plano)
- Test: `apps/cms/src/lib/crm/importadorCrm.test.ts`
- Create: `apps/cms/src/seed/importarCrm.ts` (executor via Local API)
- Modify: `apps/cms/package.json` (script `crm:importar`)

**Contexto — formato do export** (tela "Backup e Sync" do CRM legado):

```json
{ "versao": "3.0", "data": "2026-07-15", "tabelas": { "clientes": [...], "contatos": [...], "programas": [...], "modulos": [...], "produtos": [...], "oportunidades": [...], "usuarios": [...], ... } }
```

Campos legados relevantes — clientes: `id, orgao, sigla, tipo, municipio, uf, esfera, area, cnpj, dirigente, cargo, email, origem, potencial, status, responsavel, proxima_acao`; contatos: `id, nome, cliente, cargo, setor, email, whatsapp, principal, decisor`; programas: `id, sigla, nome`; modulos: `id, programa, numero, titulo, titulo_comercial, valor, replay, certificacao`; produtos: `id, codigo, nome, valor`; oportunidades: `id, codigo, cliente, programa, modulos[], produtos[], uf, origem, qtd, modalidade, valor, prob, status, data_abertura, data_prev_fech, proxima_acao, followup, responsavel, observacoes`; usuarios: `id, nome, email`.

**Regras do plano de importação:**
1. Idempotente por chaves naturais: cliente por `slugDeRotulo(orgao)+uf`; contato por `clienteLegadoId+slugDeRotulo(nome)`; oportunidade por `codigo`.
2. Catálogo: programa casa por `sigla` (case-insensitive) — **nunca cria** programa; módulo casa por `(programaId, numero)` — sem correspondente vira **atualização pendente nenhuma + aviso** (criar módulo exige ementa richText — fica manual, aviso lista o que faltou); módulo casado gera atualização do grupo `comercial` **apenas se o grupo estiver vazio** (não sobrescreve); produto casa evento por `nome` normalizado — sem correspondente ⇒ aviso (não cria evento: campos obrigatórios editoriais).
3. Selects: status/origem/uf/esfera/área/tipo convertidos com `slugDeRotulo` e validados contra as listas de `@ntc/lib`; valor fora da lista ⇒ campo `null` + aviso.
4. `responsavel` resolve por e-mail do usuário legado → usuário Payload existente (mapa fornecido); sem match ⇒ `null` + aviso (uma vez por e-mail).
5. Oportunidades: refs legadas (`cliente`, `programa`, `modulos[]`, `produtos[]`) resolvem via mapas; ref não resolvida em `cliente` ⇒ pula a oportunidade com aviso; nas demais ⇒ omite a ref com aviso.

**Interfaces:**
- Produces:

```ts
export interface ExportCrmLegado { versao?: string; tabelas?: Record<string, RegistroLegado[]>; }
export type RegistroLegado = Record<string, unknown> & { id: string };
export interface ExistentesNoBanco {
  programasPorSigla: Map<string, string>;              // sigla minúscula → payload id
  modulosPorChave: Map<string, { id: string; comercialVazio: boolean }>; // `${programaId}#${numero}`
  eventosPorNome: Map<string, string>;                 // slugDeRotulo(nome) → payload id
  clientesPorChave: Map<string, string>;               // `${slugDeRotulo(orgao)}#${uf}` → payload id
  contatosPorChave: Set<string>;                       // `${clientePayloadId}#${slugDeRotulo(nome)}`
  oportunidadesPorCodigo: Set<string>;
  usuariosPorEmail: Map<string, string>;
}
export interface PlanoImportacao {
  criarClientes: { chave: string; idLegado: string; data: Record<string, unknown> }[];
  criarContatos: { idLegado: string; clienteLegadoId: string; data: Record<string, unknown> }[];
  criarOportunidades: { idLegado: string; clienteLegadoId: string; data: Record<string, unknown> }[];
  atualizarModulos: { id: string; comercial: Record<string, unknown> }[];
  atualizarEventos: { id: string; comercial: Record<string, unknown> }[];
  avisos: string[];
  resumo: { clientes: number; contatos: number; oportunidades: number; modulos: number; eventos: number; ignorados: number };
}
export function planejarImportacao(dados: ExportCrmLegado, existentes: ExistentesNoBanco): PlanoImportacao;
```
Obs.: nos `data` de contatos/oportunidades os campos `cliente`/`programa`/`modulos`/`eventos`/`responsavel` já saem RESOLVIDOS para ids do Payload quando possível; `cliente` de registros criados na mesma rodada sai como marcador `{ clienteLegadoId }` que o executor troca pelo id recém-criado.

- [ ] **Step 1: Teste que falha** — `importadorCrm.test.ts` com um fixture pequeno:

```ts
import { describe, expect, it } from "vitest";

import { planejarImportacao, type ExistentesNoBanco, type ExportCrmLegado } from "./importadorCrm";

const dados: ExportCrmLegado = {
  versao: "3.0",
  tabelas: {
    clientes: [
      { id: "CLI-001", orgao: "SEDUC Tocantins", sigla: "SEDUC-TO", uf: "TO", esfera: "Estadual",
        area: "Educação", status: "Em negociação", potencial: 250000, responsavel: "USR-003" },
    ],
    contatos: [
      { id: "CON-001", nome: "Maria Silva", cliente: "CLI-001", cargo: "Superintendente",
        email: "maria@seduc.to.gov.br", principal: true, decisor: true },
    ],
    programas: [{ id: "PRG-001", sigla: "EDUTEC", nome: "Educação Digital" }],
    modulos: [
      { id: "MOD-001", programa: "PRG-001", numero: 1, titulo: "Cultura Digital",
        titulo_comercial: "Módulo 01 · Cultura Digital", valor: 39000 },
    ],
    produtos: [{ id: "PRD-001", codigo: "EVT-01", nome: "Seminário EDUTEC", valor: 490 }],
    oportunidades: [
      { id: "OPO-001", codigo: "OPO-2026-001", cliente: "CLI-001", programa: "PRG-001",
        modulos: ["MOD-001"], produtos: ["PRD-001"], uf: "TO", origem: "Indicação",
        qtd: 120, valor: 120000, prob: 60, status: "Em negociação",
        data_abertura: "2026-06-01", followup: "2026-07-20", responsavel: "USR-003" },
    ],
    usuarios: [{ id: "USR-003", nome: "Comercial NTC", email: "comercial1@institutontc.com.br" }],
  },
};

const existentes: ExistentesNoBanco = {
  programasPorSigla: new Map([["edutec", "10"]]),
  modulosPorChave: new Map([["10#1", { id: "20", comercialVazio: true }]]),
  eventosPorNome: new Map([["seminario-edutec", "30"]]),
  clientesPorChave: new Map(),
  contatosPorChave: new Set(),
  oportunidadesPorCodigo: new Set(),
  usuariosPorEmail: new Map([["comercial1@institutontc.com.br", "2"]]),
};

describe("planejarImportacao", () => {
  it("cria cliente/contato/oportunidade resolvendo catálogo, status e responsável", () => {
    const plano = planejarImportacao(dados, existentes);
    expect(plano.criarClientes).toHaveLength(1);
    expect(plano.criarClientes[0]?.data.status).toBe("em-negociacao");
    expect(plano.criarClientes[0]?.data.responsavel).toBe("2");
    expect(plano.criarContatos).toHaveLength(1);
    expect(plano.criarOportunidades).toHaveLength(1);
    expect(plano.criarOportunidades[0]?.data.programa).toBe("10");
    expect(plano.criarOportunidades[0]?.data.modulos).toEqual(["20"]);
    expect(plano.criarOportunidades[0]?.data.eventos).toEqual(["30"]);
    expect(plano.atualizarModulos).toEqual([
      { id: "20", comercial: { tituloComercial: "Módulo 01 · Cultura Digital", valor: 39000, replay: null, certificacao: null } },
    ]);
    expect(plano.atualizarEventos).toEqual([{ id: "30", comercial: { codigo: "EVT-01", valor: 490 } }]);
  });

  it("é idempotente: nada a criar quando as chaves já existem", () => {
    const jaImportado: ExistentesNoBanco = {
      ...existentes,
      clientesPorChave: new Map([["seduc-tocantins#TO", "50"]]),
      contatosPorChave: new Set(["50#maria-silva"]),
      oportunidadesPorCodigo: new Set(["OPO-2026-001"]),
      modulosPorChave: new Map([["10#1", { id: "20", comercialVazio: false }]]),
    };
    const plano = planejarImportacao(dados, jaImportado);
    expect(plano.criarClientes).toHaveLength(0);
    expect(plano.criarContatos).toHaveLength(0);
    expect(plano.criarOportunidades).toHaveLength(0);
    expect(plano.atualizarModulos).toHaveLength(0);
  });

  it("gera avisos para refs e valores não resolvidos", () => {
    const semCatalogo: ExistentesNoBanco = { ...existentes, programasPorSigla: new Map(), modulosPorChave: new Map(), eventosPorNome: new Map(), usuariosPorEmail: new Map() };
    const plano = planejarImportacao(dados, semCatalogo);
    expect(plano.avisos.length).toBeGreaterThan(0);
    expect(plano.criarOportunidades[0]?.data.programa).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar** — `pnpm test -- importadorCrm` → FAIL.

- [ ] **Step 3: Implementar `importadorCrm.ts`** — módulo puro (sem `server-only`, sem Payload): helpers `texto(r, campo)`, `numero(r, campo)`, `slugValidado(valor, lista, avisos, contexto)` (usa `slugDeRotulo` + listas de `@ntc/lib`); montar os mapas de ids legados (`clientesLegados`, `programasLegados`, `modulosLegados`, `produtosLegados`, `usuariosLegados`) a partir de `tabelas`; aplicar as 5 regras acima preenchendo `PlanoImportacao`. Datas legadas já são `YYYY-MM-DD` — passar direto. `cliente` das oportunidades/contatos: se o cliente casar com existente usar o id do banco; senão usar `{ clienteLegadoId }` (o executor resolve).

- [ ] **Step 4: Rodar e ver passar** — `pnpm test -- importadorCrm` → PASS (3 testes).

- [ ] **Step 5: Executor `src/seed/importarCrm.ts`**

```ts
/**
 * Importa o export JSON do CRM legado (NTC_Comercial_Premium) para o Payload.
 *
 * Uso:
 *   CRM_JSON=/caminho/backup.json CRM_DRY_RUN=1 pnpm crm:importar   # só relata
 *   CRM_JSON=/caminho/backup.json pnpm crm:importar                 # executa
 *
 * Env vars em vez de flags porque o pnpm engole flags sem `--`.
 * Idempotente: reexecutar não duplica (chaves naturais).
 */
import fs from "node:fs";

import { getPayload } from "payload";

import { slugDeRotulo } from "@ntc/lib";

import { planejarImportacao, type ExistentesNoBanco, type ExportCrmLegado } from "../lib/crm/importadorCrm";
import config from "../payload.config";

const caminho = process.env.CRM_JSON;
const dryRun = process.env.CRM_DRY_RUN === "1";
if (!caminho) {
  console.error("Defina CRM_JSON=/caminho/do/backup.json");
  process.exit(1);
}

const dados = JSON.parse(fs.readFileSync(caminho, "utf-8")) as ExportCrmLegado;
const payload = await getPayload({ config });

// ---- Carrega o estado atual do banco para os mapas de casamento ----
const [programas, modulos, eventos, clientes, contatos, oportunidades, usuarios] = await Promise.all([
  payload.find({ collection: "programas", depth: 0, limit: 500, draft: true }),
  payload.find({ collection: "modulos", depth: 0, limit: 1000, draft: true }),
  payload.find({ collection: "eventos", depth: 0, limit: 1000, draft: true }),
  payload.find({ collection: "clientes-crm", depth: 0, limit: 2000 }),
  payload.find({ collection: "contatos-crm", depth: 1, limit: 2000 }),
  payload.find({ collection: "oportunidades", depth: 0, limit: 2000 }),
  payload.find({ collection: "users", depth: 0, limit: 200 }),
]);

const idRel = (v: unknown): string =>
  typeof v === "object" && v !== null && "id" in v ? String((v as { id: unknown }).id) : String(v);

const existentes: ExistentesNoBanco = {
  programasPorSigla: new Map(programas.docs.map((p) => [(p.sigla ?? "").toLowerCase(), String(p.id)])),
  modulosPorChave: new Map(
    modulos.docs.map((m) => [
      `${idRel(m.programa)}#${m.numero}`,
      { id: String(m.id), comercialVazio: !m.comercial?.tituloComercial && !m.comercial?.valor },
    ]),
  ),
  eventosPorNome: new Map(eventos.docs.map((e) => [slugDeRotulo(e.nome), String(e.id)])),
  clientesPorChave: new Map(
    clientes.docs.map((c) => [`${slugDeRotulo(c.orgao)}#${c.uf ?? ""}`, String(c.id)]),
  ),
  contatosPorChave: new Set(
    contatos.docs.map((c) => `${idRel(c.cliente)}#${slugDeRotulo(c.nome)}`),
  ),
  oportunidadesPorCodigo: new Set(oportunidades.docs.map((o) => o.codigo)),
  usuariosPorEmail: new Map(usuarios.docs.map((u) => [u.email.toLowerCase(), String(u.id)])),
};

const plano = planejarImportacao(dados, existentes);

console.log("=== Plano de importação ===");
console.log(JSON.stringify(plano.resumo, null, 2));
for (const aviso of plano.avisos) console.log(`AVISO: ${aviso}`);

if (dryRun) {
  console.log("Dry-run: nada foi gravado.");
  process.exit(0);
}

// ---- Execução: clientes → contatos/oportunidades (refs resolvidas) ----
const idPorClienteLegado = new Map<string, string>();
for (const item of plano.criarClientes) {
  const doc = await payload.create({ collection: "clientes-crm", data: item.data });
  idPorClienteLegado.set(item.idLegado, String(doc.id));
}

const resolverCliente = (data: Record<string, unknown>, clienteLegadoId: string): boolean => {
  if (typeof data.cliente === "string") return true; // já era id do banco
  const novo = idPorClienteLegado.get(clienteLegadoId);
  if (!novo) return false;
  data.cliente = novo;
  return true;
};

for (const item of plano.criarContatos) {
  if (!resolverCliente(item.data, item.clienteLegadoId)) continue;
  await payload.create({ collection: "contatos-crm", data: item.data });
}
for (const item of plano.criarOportunidades) {
  if (!resolverCliente(item.data, item.clienteLegadoId)) continue;
  await payload.create({ collection: "oportunidades", data: item.data });
}
for (const item of plano.atualizarModulos) {
  await payload.update({ collection: "modulos", id: item.id, data: { comercial: item.comercial } });
}
for (const item of plano.atualizarEventos) {
  await payload.update({ collection: "eventos", id: item.id, data: { comercial: item.comercial } });
}

console.log("Importação concluída.");
process.exit(0);
```

Nota de tipos: os `data: Record<string, unknown>` do plano precisam de cast para os tipos de create do Payload — seguir o precedente dos seeds existentes (`src/seed/*.ts`); se os seeds usam objetos literais tipados, fazer o cast via `as Parameters<typeof payload.create>[0]["data"]` NÃO é aceitável se degradar para `any` — preferir montar os `data` já com shape correto no importador puro e tipar `PlanoImportacao` com esses shapes.

- [ ] **Step 6: Script em `apps/cms/package.json`**:

```json
    "crm:importar": "pnpm payload run src/seed/importarCrm.ts",
```

- [ ] **Step 7: Ensaiar com dados reais** — o usuário exporta o JSON no CRM legado (Backup e Sync → Exportar). Rodar primeiro `CRM_JSON=… CRM_DRY_RUN=1 pnpm crm:importar`, revisar resumo + avisos com o usuário, então rodar sem dry-run. Conferir nas telas `/crm` os registros importados. (Se o usuário ainda não tiver o JSON à mão, deixar este step registrado como pendência no resumo final — o código fica pronto e testado via fixtures.)

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src/lib/crm/importadorCrm.ts apps/cms/src/lib/crm/importadorCrm.test.ts apps/cms/src/seed/importarCrm.ts apps/cms/package.json
git commit -m "feat(crm): importador idempotente do JSON do CRM legado com dry-run"
```

---

### Task 14: Qualidade final + checkpoint visual

**Files:**
- Modify: `CLAUDE.md` (§19 — registrar o módulo CRM no estado do CMS)

- [ ] **Step 1: Bateria completa na raiz**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
Expected: tudo PASS. Corrigir o que falhar (sem desabilitar checks — CLAUDE.md §5.7).

- [ ] **Step 2: Atualizar `CLAUDE.md` §19** — acrescentar ao §19.1 uma linha: módulo CRM na rota `/crm` (clientes, contatos, oportunidades, leads migrados, importador `crm:importar`); e ao §19.2 remover/ajustar itens que esta fase resolveu parcialmente (item 3 "criar conteúdo novo": anotar que o padrão de criação nasceu no CRM e segue pendente para eventos/palestrantes). Registrar histórico de revisão (v1.4, data, uma linha).

- [ ] **Step 3: Checkpoint visual (CLAUDE.md §6 + preferência do usuário)** — subir `pnpm dev` e deixar o servidor NO AR; pedir validação humana (não screenshot automatizado):
  - `/` (módulo Site): idêntico ao anterior + seletor Site|CRM (desktop 1440 e mobile 375).
  - `/crm`: Painel Comercial, Leads, Clientes (lista/detalhe/form), Contatos, Oportunidades (lista/detalhe/form).
  - Login/logout funcionando nos dois módulos.

- [ ] **Step 4: Commit final**

```bash
git add CLAUDE.md
git commit -m "docs(claude): registra módulo CRM Fase A no estado do CMS"
```

- [ ] **Step 5: Resumo da sessão ao usuário** (≤10 linhas): o que foi feito, pendências (JSON real do importador se não rodado; toasts substituídos por aviso inline; eventos/módulos sem correspondente no catálogo ficam como aviso do importador), próximos passos (Fase B — Propostas). **Sem push** — aguardar ordem.

---

## Self-review (executado na escrita do plano)

- **Cobertura da spec:** casco compartilhado ✅ (T8) · seletor ✅ (T8) · rota /crm ✅ (T9) · Leads migrado ✅ (T9) · 3 coleções ✅ (T2) · grupo comercial ✅ (T3) · enums ✅ (T1) · telas CRUD ✅ (T10-12) · Painel Comercial + KPIs ✅ (T6, T9) · importador dry-run idempotente ✅ (T13) · auth/guardas ✅ (T7) · erros listas vazias ✅ (T9) · testes Vitest ✅ (T1, T6, T7, T13) · checkpoint visual ✅ (T14).
- **Desvios conscientes da spec (avisar o usuário no resumo):** (a) toasts viraram aviso inline `pcms-form-aviso` (mais simples e acessível; toasts ficam para quando houver ação fora de formulário); (b) importador **não cria** módulos/eventos faltantes (campos editoriais obrigatórios — richText/resumo — tornariam a criação automática inválida ou inventada, §5.3); casa e preenche grupo comercial + avisa o que ficou de fora; (c) script usa env vars (`CRM_JSON`, `CRM_DRY_RUN`) em vez de flags, porque pnpm engole flags.
- **Consistência de tipos:** nomes cruzados conferidos (ClienteCrmResumo/Detalhe, DadosClienteCrm, GrupoNav, TelaCrmId, salvarClienteCrm(id|null, dados), planejarImportacao/ExistentesNoBanco/PlanoImportacao).
