# CMS Corpo Docente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar `/o-grupo/corpo-docente` para o Payload CMS em 2 camadas (coleção `Especialistas` ampliada + novo Global `CorpoDocente`), com fallback estático no `page.tsx` e seed idempotente para Especialistas Featured + Axis Saúde nesta sessão.

**Architecture:** A coleção `Especialistas` ganha 6 campos opcionais (vertical, tipo, frente, formacao, atuacao, programasRelacionados). Novo Global `corpo-docente` guarda hero, métricas, manifesto, lista única de cards (`formato: featured|expert|axis`), credibilidade, credenciamento, FAQ, CTA final e sticky mobile. `apps/web/lib/cms/corpoDocente.ts` faz fetch + adapter para a shape consumida pelos componentes client existentes. `page.tsx` vira async com `try { CMS } catch { fallback estático }`.

**Tech Stack:** Payload CMS 3.18.0 (Postgres adapter Supabase, S3 storage Supabase), Next 15 App Router (Server Components), TypeScript strict, Lexical richText restritivo, `pnpm payload run` para seeds.

**Spec:** `docs/superpowers/specs/2026-05-28-cms-corpo-docente-design.md`

**Fora de escopo desta sessão (ficam para sessão 2):**
- Seed dos ~70 Experts (esta sessão faz os ~10 Featured + 5 Axis para fechar a página com fallback dos Experts)
- Migrar palestrantes de Programas/Eventos para a coleção
- Migration explícita (projeto atual usa `db:push` automático do Payload)

---

## File Structure

**Criar:**
- `apps/cms/src/globals/CorpoDocente.ts` — Global novo (9 tabs)
- `apps/cms/src/seed/seedCorpoDocente.ts` — seed idempotente (fotos + especialistas featured/axis + global)
- `apps/web/lib/cms/corpoDocente.ts` — loader + adapter para a shape `ConteudoCorpoDocente`
- `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoFallback.ts` — barrel re-exportando os 11 valores agrupados (não duplica conteúdo)

**Modificar:**
- `apps/cms/src/shared/types.ts` — adicionar 5 enums novos (`VERTICAL_DOCENTE`, `TIPO_DOCENTE`, `FRENTE_DOCENTE`, `FORMACAO_DOCENTE`, `ATUACAO_DOCENTE`)
- `apps/cms/src/collections/Especialistas.ts` — adicionar 6 campos opcionais
- `apps/cms/src/payload.config.ts` — registrar `CorpoDocente` em `globals`
- `apps/cms/package.json` — script `payload:seed:corpo-docente`
- `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx` — async + try/catch + fallback
- `packages/types/src/payload-types.ts` — regenerado automaticamente

**Princípio de divisão:** o Global em arquivo único (~400 linhas) segue o padrão do `OGrupo.ts` e `Home.ts`. O seed em arquivo único segue o padrão do `seedHomeV3.ts`. O loader/adapter ficam juntos em `corpoDocente.ts` porque o adapter é tradução fina do shape e mudará junto com o loader.

---

## Task 1: Adicionar enums em shared/types.ts

**Files:**
- Modify: `apps/cms/src/shared/types.ts`

- [ ] **Step 1: Ler arquivo atual para contexto**

Run: `cat apps/cms/src/shared/types.ts`

- [ ] **Step 2: Adicionar 5 enums no final do arquivo**

Adicionar após a linha do `PERFIL_ADMIN`:

```typescript
/**
 * Enums do Corpo Docente — usados em Especialistas (atributos da pessoa)
 * e replicados no dataset de filtro do FilterBarDocentes (web).
 *
 * Devem permanecer alinhados com os valores hardcoded em
 * apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
 * (TAB_LABELS, AREA_LABELS, TIPO_LABELS, FORMACAO_OPTIONS, ATUACAO_OPTIONS).
 */

export const VERTICAL_DOCENTE = [
  "educacao",
  "gestao-publica",
  "saude",
] as const;
export type VerticalDocente = (typeof VERTICAL_DOCENTE)[number];

export const TIPO_DOCENTE = [
  "autoridade",
  "palestrante",
  "doutrinador",
  "consultor",
  "pesquisador",
] as const;
export type TipoDocente = (typeof TIPO_DOCENTE)[number];

export const FRENTE_DOCENTE = ["contratacoes"] as const;
export type FrenteDocente = (typeof FRENTE_DOCENTE)[number];

export const FORMACAO_DOCENTE = [
  "doutorado",
  "mestrado",
  "especializacao",
  "graduacao-experiencia",
] as const;
export type FormacaoDocente = (typeof FORMACAO_DOCENTE)[number];

export const ATUACAO_DOCENTE = [
  "universidade",
  "gestao-publica",
  "controle",
  "judiciario",
  "multilateral",
  "terceiro-setor",
  "consultoria",
] as const;
export type AtuacaoDocente = (typeof ATUACAO_DOCENTE)[number];
```

- [ ] **Step 3: Verificar typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS sem erros

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/shared/types.ts
git commit -m "feat(cms): adiciona enums VERTICAL/TIPO/FRENTE/FORMACAO/ATUACAO_DOCENTE em shared/types"
```

---

## Task 2: Adicionar 6 campos novos em Especialistas

**Files:**
- Modify: `apps/cms/src/collections/Especialistas.ts`

- [ ] **Step 1: Ler arquivo atual**

Run: `cat apps/cms/src/collections/Especialistas.ts`

- [ ] **Step 2: Atualizar imports**

Substituir o import atual `import { TITULACAO_DOCENTE } from "../shared/types";` por:

```typescript
import {
  ATUACAO_DOCENTE,
  FORMACAO_DOCENTE,
  FRENTE_DOCENTE,
  TIPO_DOCENTE,
  TITULACAO_DOCENTE,
  VERTICAL_DOCENTE,
} from "../shared/types";
```

- [ ] **Step 3: Adicionar 6 campos antes do grupo `apresentacaoOTT`**

Localizar o bloco `apresentacaoOTT` (linhas ~69-80) e inserir ANTES dele:

```typescript
    {
      name: "vertical",
      type: "select",
      options: VERTICAL_DOCENTE.map((v) => ({ label: v, value: v })),
      admin: {
        description:
          "Vertical institucional do especialista. Usado em filtros do Corpo Docente e em listagens por vertical.",
      },
    },
    {
      name: "tipo",
      type: "select",
      options: TIPO_DOCENTE.map((v) => ({ label: v, value: v })),
      admin: {
        description:
          "Camada de autoridade da curadoria (doc 25 — 5 camadas).",
      },
    },
    {
      name: "frente",
      type: "select",
      options: FRENTE_DOCENTE.map((v) => ({ label: v, value: v })),
      admin: {
        description:
          "Marcador opcional: 'contratacoes' indica que o especialista compõe o núcleo Contratações Públicas dentro de Gestão Pública.",
      },
    },
    {
      name: "formacao",
      type: "select",
      options: FORMACAO_DOCENTE.map((v) => ({ label: v, value: v })),
      admin: {
        description: "Maior titulação relevante para o dataset de filtro.",
      },
    },
    {
      name: "atuacao",
      type: "select",
      hasMany: true,
      options: ATUACAO_DOCENTE.map((v) => ({ label: v, value: v })),
      admin: {
        description: "Esferas de atuação profissional (múltipla escolha).",
      },
    },
    {
      name: "programasRelacionados",
      type: "relationship",
      relationTo: "programas",
      hasMany: true,
      admin: {
        description:
          "Programas em que o especialista figura como referência. Usado para derivar o dataset de filtro 'programas' no FilterBarDocentes.",
      },
    },
```

- [ ] **Step 4: Rodar typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS sem erros (todos os campos opcionais — não quebra registros existentes)

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/collections/Especialistas.ts
git commit -m "feat(cms): adiciona 6 campos opcionais a Especialistas (vertical/tipo/frente/formacao/atuacao/programasRelacionados)"
```

---

## Task 3: Criar Global CorpoDocente — esqueleto + Tab 1 (Hero)

**Files:**
- Create: `apps/cms/src/globals/CorpoDocente.ts`

- [ ] **Step 1: Criar arquivo com esqueleto e Tab 1**

```typescript
import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global CorpoDocente — página /o-grupo/corpo-docente.
 *
 * Singleton. Estrutura em 9 tabs (hero, métricas, manifesto, cards,
 * credibilidade, credenciamento, FAQ, CTA final, sticky CTA mobile).
 *
 * Os cards são uma lista única com toggle de formato
 * (featured|expert|axis); admin.condition esconde campos irrelevantes
 * por formato. Cards featured/expert referenciam especialistas;
 * cards axis são narrativas de eixo (Saúde) sem pessoa relacionada.
 *
 * Versions com drafts habilitados — equipe editorial publica sob revisão.
 *
 * Spec: docs/superpowers/specs/2026-05-28-cms-corpo-docente-design.md
 */
export const CorpoDocente: GlobalConfig = {
  slug: "corpo-docente",
  label: "Corpo Docente (/o-grupo/corpo-docente)",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero & Quicklinks",
          fields: [
            {
              name: "hero",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                {
                  name: "titulo",
                  type: "richText",
                  required: true,
                  admin: {
                    description:
                      "Aceita <span class='accent'> e <br>. Lexical restritivo aplicado globalmente.",
                  },
                },
                {
                  name: "subtitulo",
                  type: "richText",
                  required: true,
                  admin: {
                    description: "Aceita <em>. Lexical restritivo.",
                  },
                },
                {
                  name: "quicklinks",
                  type: "array",
                  minRows: 1,
                  maxRows: 8,
                  fields: [
                    {
                      name: "tipo",
                      type: "select",
                      required: true,
                      options: [
                        { label: "Âncora (#id)", value: "anchor" },
                        { label: "Atalho de tab", value: "tab" },
                      ],
                    },
                    { name: "rotulo", type: "text", required: true },
                    {
                      name: "href",
                      type: "text",
                      admin: {
                        condition: (_, sibling) => sibling?.tipo === "anchor",
                      },
                    },
                    {
                      name: "vertShortcut",
                      type: "select",
                      options: [
                        { label: "todos", value: "todos" },
                        { label: "educacao", value: "educacao" },
                        { label: "gestao-publica", value: "gestao-publica" },
                        { label: "contratacoes", value: "contratacoes" },
                        { label: "saude", value: "saude" },
                      ],
                      admin: {
                        condition: (_, sibling) => sibling?.tipo === "tab",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Tabs 2-9 adicionadas nas próximas tasks
      ],
    },
  ],
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/CorpoDocente.ts
git commit -m "feat(cms): cria Global CorpoDocente (esqueleto + Tab Hero & Quicklinks)"
```

---

## Task 4: Tab 2 (Métricas)

**Files:**
- Modify: `apps/cms/src/globals/CorpoDocente.ts`

- [ ] **Step 1: Adicionar tab Métricas após Hero**

Localizar o comentário `// Tabs 2-9 adicionadas nas próximas tasks` e substituí-lo por:

```typescript
        {
          label: "Métricas",
          fields: [
            {
              name: "metricas",
              type: "array",
              minRows: 4,
              maxRows: 4,
              admin: {
                description:
                  "4 cards de números: Educação · Gestão Pública · Núcleo Contratações · Saúde.",
              },
              fields: [
                {
                  name: "classe",
                  type: "select",
                  required: true,
                  options: [
                    { label: "is-edu (Educação · esmeralda)", value: "is-edu" },
                    { label: "is-gov (Gestão Pública · Oxford)", value: "is-gov" },
                    { label: "is-cpr (Contratações · cardeal)", value: "is-cpr" },
                    { label: "is-sau (Saúde · oliva)", value: "is-sau" },
                  ],
                },
                { name: "sublabel", type: "text", required: true },
                { name: "num", type: "text", required: true, admin: { description: "Número exibido (ex: '60', '31', '5')." } },
                { name: "label", type: "text", required: true },
                { name: "detalhe", type: "textarea", required: true },
              ],
            },
          ],
        },
        // Tabs 3-9 adicionadas nas próximas tasks
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/CorpoDocente.ts
git commit -m "feat(cms): CorpoDocente Tab Métricas (4 cards de números)"
```

---

## Task 5: Tab 3 (Manifesto)

**Files:**
- Modify: `apps/cms/src/globals/CorpoDocente.ts`

- [ ] **Step 1: Adicionar tab Manifesto**

Substituir o comentário `// Tabs 3-9 adicionadas nas próximas tasks` por:

```typescript
        {
          label: "Manifesto",
          fields: [
            { name: "marker", type: "text", required: true },
            {
              name: "tituloManifesto",
              type: "richText",
              required: true,
              admin: { description: "Aceita <em>." },
            },
            { name: "lede", type: "textarea", required: true },
            {
              name: "archCards",
              type: "array",
              minRows: 4,
              maxRows: 4,
              admin: { description: "Educação · Gestão Pública · Contratações · Saúde." },
              fields: [
                {
                  name: "area",
                  type: "select",
                  required: true,
                  options: [
                    { label: "educacao", value: "educacao" },
                    { label: "gestao-publica", value: "gestao-publica" },
                    { label: "contratacoes", value: "contratacoes" },
                    { label: "saude", value: "saude" },
                  ],
                },
                { name: "eyebrow", type: "text", required: true },
                { name: "tituloArch", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
                { name: "selo", type: "text", required: true },
              ],
            },
            {
              name: "camadas",
              type: "array",
              minRows: 5,
              maxRows: 5,
              admin: { description: "5 camadas de autoridade (01..05)." },
              fields: [
                { name: "num", type: "text", required: true },
                { name: "tituloCamada", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "callout",
              type: "group",
              fields: [
                { name: "tituloCallout", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "nota",
              type: "richText",
              required: true,
              admin: { description: "Aceita <strong>." },
            },
          ],
        },
        // Tabs 4-9 adicionadas nas próximas tasks
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/CorpoDocente.ts
git commit -m "feat(cms): CorpoDocente Tab Manifesto (archCards+camadas+callout+nota)"
```

---

## Task 6: Tab 4 (Cards — lista única com toggle de formato)

**Files:**
- Modify: `apps/cms/src/globals/CorpoDocente.ts`

- [ ] **Step 1: Adicionar tab Cards**

Substituir `// Tabs 4-9 adicionadas nas próximas tasks` por:

```typescript
        {
          label: "Cards (Featured/Experts/Axis)",
          fields: [
            {
              name: "cards",
              type: "array",
              minRows: 1,
              admin: {
                description:
                  "Lista única ordenável. Cada item tem 'formato' (featured/expert/axis) que decide quais campos aparecem. Cards featured/expert apontam para Especialistas; cards axis (Saúde) são narrativas de eixo sem pessoa relacionada.",
              },
              fields: [
                {
                  name: "formato",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Featured (autoridade grande)", value: "featured" },
                    { label: "Expert (card menor)", value: "expert" },
                    { label: "Axis Saúde (sem foto, com SVG)", value: "axis" },
                  ],
                },

                // ---- featured/expert: relação com Especialista ----
                {
                  name: "especialista",
                  type: "relationship",
                  relationTo: "especialistas",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description:
                      "Especialista relacionado. Foto, nome e dataset de filtro são herdados dele.",
                  },
                },

                // ---- embrulho editorial comum ----
                {
                  name: "tag",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Ex: "Autoridade convidada", "Coordenação científica · Educação".',
                  },
                },
                {
                  name: "axisBadge",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Selo no rodapé da foto. Ex: "Gestão Pública · Direito constitucional".',
                  },
                },
                {
                  name: "credencialCard",
                  type: "textarea",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: "Parágrafo de credencial exibido no card (≠ currículo curto do Especialista).",
                  },
                },
                {
                  name: "metaAtuacao",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Linha "Atuação · Tribunal X" (use <strong> no valor).',
                  },
                },
                {
                  name: "metaEixos",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Linha "Eixos · LIDERA · SIGA" (use <strong> no valor).',
                  },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                  },
                },
                {
                  name: "ctaRotulo",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Default no adapter: "Consultar disponibilidade".',
                  },
                },

                // ---- expert only ----
                {
                  name: "programasTexto",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                    description: 'Prefixo antes do strong. Ex: "Vinculação · ".',
                  },
                },
                {
                  name: "programasStrong",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                  },
                },
                {
                  name: "sufixoPrograma",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                  },
                },

                // ---- axis only ----
                {
                  name: "area",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: 'Slug do eixo. Ex: "atencao-primaria".',
                  },
                },
                {
                  name: "axisTag",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "tituloAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "credencialAxis",
                  type: "textarea",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "programasTextoAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "programasStrongAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "styleAccent",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: "Cor de destaque CSS (hex ou token).",
                  },
                },
                {
                  name: "styleAccentDark",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "iconeSvgInner",
                  type: "textarea",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: "innerHTML completo do <svg> do card (path/circle/rect).",
                  },
                },
              ],
            },
          ],
        },
        // Tabs 5-9 adicionadas nas próximas tasks
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/CorpoDocente.ts
git commit -m "feat(cms): CorpoDocente Tab Cards (lista única com toggle featured|expert|axis)"
```

---

## Task 7: Tabs 5-9 (Credibilidade, Credenciamento, FAQ, CTA Final, Sticky)

**Files:**
- Modify: `apps/cms/src/globals/CorpoDocente.ts`

- [ ] **Step 1: Adicionar as 5 tabs restantes**

Substituir `// Tabs 5-9 adicionadas nas próximas tasks` por:

```typescript
        {
          label: "Credibilidade",
          fields: [
            {
              name: "credibilidade",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                {
                  name: "tituloCredibilidade",
                  type: "richText",
                  required: true,
                },
                { name: "lede", type: "textarea", required: true },
                {
                  name: "items",
                  type: "array",
                  minRows: 1,
                  fields: [
                    { name: "num", type: "text", required: true },
                    { name: "label", type: "text", required: true },
                    { name: "detalhe", type: "textarea", required: true },
                  ],
                },
                {
                  name: "rodape",
                  type: "richText",
                  required: true,
                  admin: { description: "Aceita <strong>." },
                },
              ],
            },
          ],
        },
        {
          label: "Credenciamento",
          fields: [
            {
              name: "credenciamento",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                {
                  name: "tituloCredenciamento",
                  type: "richText",
                  required: true,
                },
                { name: "descricao", type: "textarea", required: true },
                {
                  name: "lista",
                  type: "array",
                  minRows: 1,
                  fields: [{ name: "texto", type: "text", required: true }],
                },
                {
                  name: "ctas",
                  type: "array",
                  minRows: 1,
                  fields: [
                    { name: "rotulo", type: "text", required: true },
                    { name: "href", type: "text", required: true },
                    {
                      name: "variante",
                      type: "select",
                      required: true,
                      options: [
                        { label: "gold", value: "gold" },
                        { label: "ghost-light", value: "ghost-light" },
                        { label: "primario", value: "primario" },
                        { label: "secundario", value: "secundario" },
                      ],
                    },
                  ],
                },
                {
                  name: "aside",
                  type: "group",
                  fields: [
                    { name: "eyebrow", type: "text", required: true },
                    { name: "tituloAside", type: "text", required: true },
                    { name: "intro", type: "textarea", required: true },
                    {
                      name: "checklist",
                      type: "array",
                      minRows: 1,
                      fields: [{ name: "texto", type: "text", required: true }],
                    },
                    { name: "nota", type: "textarea", required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "FAQ",
          fields: [
            {
              name: "faqItems",
              type: "array",
              minRows: 1,
              fields: [
                { name: "id", type: "text", required: true, admin: { description: 'Ex: "faq-1".' } },
                { name: "pergunta", type: "text", required: true },
                {
                  name: "parags",
                  type: "array",
                  minRows: 1,
                  fields: [
                    {
                      name: "texto",
                      type: "textarea",
                      required: true,
                      admin: { description: "Aceita <strong>." },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "CTA Final",
          fields: [
            {
              name: "ctaFinal",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                {
                  name: "tituloCtaFinal",
                  type: "richText",
                  required: true,
                  admin: { description: "Aceita <em>." },
                },
                { name: "descricao", type: "textarea", required: true },
                {
                  name: "ctaPrincipal",
                  type: "group",
                  fields: [
                    { name: "rotulo", type: "text", required: true },
                    { name: "href", type: "text", required: true },
                    {
                      name: "variante",
                      type: "select",
                      required: true,
                      options: [
                        { label: "gold", value: "gold" },
                        { label: "ghost-light", value: "ghost-light" },
                      ],
                    },
                  ],
                },
                {
                  name: "ctaSecundario",
                  type: "group",
                  fields: [
                    { name: "rotulo", type: "text", required: true },
                    { name: "href", type: "text", required: true },
                    {
                      name: "variante",
                      type: "select",
                      required: true,
                      options: [
                        { label: "gold", value: "gold" },
                        { label: "ghost-light", value: "ghost-light" },
                      ],
                    },
                  ],
                },
                { name: "separadorAreas", type: "text", required: true },
                {
                  name: "ctasArea",
                  type: "array",
                  minRows: 1,
                  fields: [
                    { name: "rotulo", type: "text", required: true },
                    { name: "href", type: "text", required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Sticky CTA Mobile",
          fields: [
            {
              name: "stickyCta",
              type: "group",
              fields: [
                { name: "rotulo", type: "text", required: true },
                { name: "href", type: "text", required: true },
              ],
            },
          ],
        },
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/globals/CorpoDocente.ts
git commit -m "feat(cms): CorpoDocente Tabs Credibilidade/Credenciamento/FAQ/CTAFinal/Sticky (todas as 9 tabs prontas)"
```

---

## Task 8: Registrar CorpoDocente no payload.config

**Files:**
- Modify: `apps/cms/src/payload.config.ts`

- [ ] **Step 1: Adicionar import**

Localizar a linha `import { OGrupo } from "./globals/OGrupo";` e adicionar acima:

```typescript
import { CorpoDocente } from "./globals/CorpoDocente";
```

- [ ] **Step 2: Adicionar na lista globals**

Localizar `globals: [Home, OGrupo, Rodape],` e substituir por:

```typescript
  globals: [Home, OGrupo, CorpoDocente, Rodape],
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 4: Regenerar tipos**

Run: `pnpm --filter @ntc/cms payload:generate`
Expected: regenera `packages/types/src/payload-types.ts` incluindo o tipo `CorpoDocente`

- [ ] **Step 5: Confirmar tipo gerado**

Run: `grep -n "CorpoDocente" packages/types/src/payload-types.ts | head -5`
Expected: ao menos 2 ocorrências (interface + GlobalsAuth)

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/payload.config.ts packages/types/src/payload-types.ts
git commit -m "feat(cms): registra Global CorpoDocente no payload.config + regenera tipos"
```

---

## Task 9: Refatorar conteudoCorpoDocente.ts para exportar conteudoFallback

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoFallback.ts`

- [ ] **Step 1: Criar barrel agregador**

```typescript
/**
 * Barrel agregador dos valores literais de conteudoCorpoDocente.ts em um
 * objeto único (`conteudoFallback`), no mesmo shape que o adapter do
 * loader CMS retorna. Usado pelo page.tsx quando o fetch do Payload falha.
 *
 * Não altera o arquivo conteudoCorpoDocente.ts — apenas re-exporta.
 */

import {
  CARDS_AXIS_SAUDE,
  CARDS_EXPERTS,
  CARDS_FEATURED,
  CREDENCIAMENTO,
  CREDIBILIDADE,
  CTA_FINAL,
  FAQ,
  HERO,
  MANIFESTO,
  METRICAS,
  STICKY_CTA,
  type CardAxis,
  type CardExpert,
  type CardFeatured,
  type FaqItem,
  type Metrica,
} from "./conteudoCorpoDocente";

export interface ConteudoCorpoDocente {
  HERO: typeof HERO;
  METRICAS: Metrica[];
  MANIFESTO: typeof MANIFESTO;
  CARDS_FEATURED: CardFeatured[];
  CARDS_EXPERTS: CardExpert[];
  CARDS_AXIS_SAUDE: CardAxis[];
  CREDIBILIDADE: typeof CREDIBILIDADE;
  CREDENCIAMENTO: typeof CREDENCIAMENTO;
  FAQ: FaqItem[];
  CTA_FINAL: typeof CTA_FINAL;
  STICKY_CTA: typeof STICKY_CTA;
}

export const conteudoFallback: ConteudoCorpoDocente = {
  HERO,
  METRICAS,
  MANIFESTO,
  CARDS_FEATURED,
  CARDS_EXPERTS,
  CARDS_AXIS_SAUDE,
  CREDIBILIDADE,
  CREDENCIAMENTO,
  FAQ,
  CTA_FINAL,
  STICKY_CTA,
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/web typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoFallback.ts
git commit -m "feat(corpo-docente): adiciona conteudoFallback.ts (barrel agregador para fallback)"
```

---

## Task 10: Criar loader + adapter em apps/web/lib/cms/corpoDocente.ts

**Files:**
- Create: `apps/web/lib/cms/corpoDocente.ts`

- [ ] **Step 1: Criar loader com adapter**

```typescript
/**
 * Loader + adapter do Global CorpoDocente.
 *
 * Faz fetch do Global via Payload Local API (depth=2 para popular
 * especialista + programas relacionados) e transforma o shape do
 * Payload para `ConteudoCorpoDocente` — mesmo contrato dos componentes
 * client (FilterBarDocentes, HeroQuicklinks, etc.).
 *
 * Cards featured/expert sem especialista populado (deletado ou nunca
 * referenciado) são silenciosamente omitidos com warn no log.
 *
 * Server-only — não importe no client.
 */

import type {
  CorpoDocente as CorpoDocenteGlobal,
  Especialista,
  Media,
  Programa,
} from "@ntc/types/payload-types";

import { obterPayload } from "../payloadClient";

import {
  conteudoFallback,
  type ConteudoCorpoDocente,
} from "../../app/(o-grupo)/o-grupo/corpo-docente/conteudoFallback";
import type {
  CardAxis,
  CardExpert,
  CardFeatured,
  FaqItem,
  Quicklink,
} from "../../app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente";

const CTA_ROTULO_DEFAULT = "Consultar disponibilidade";

export async function fetchCorpoDocente(): Promise<ConteudoCorpoDocente> {
  const payload = await obterPayload();
  const global = (await payload.findGlobal({
    slug: "corpo-docente",
    depth: 2,
  })) as CorpoDocenteGlobal;
  return adaptarGlobal(global);
}

function adaptarGlobal(g: CorpoDocenteGlobal): ConteudoCorpoDocente {
  return {
    HERO: adaptarHero(g),
    METRICAS: adaptarMetricas(g),
    MANIFESTO: adaptarManifesto(g),
    ...adaptarCards(g),
    CREDIBILIDADE: adaptarCredibilidade(g),
    CREDENCIAMENTO: adaptarCredenciamento(g),
    FAQ: adaptarFaq(g),
    CTA_FINAL: adaptarCtaFinal(g),
    STICKY_CTA: adaptarSticky(g),
  };
}

// ============================================================
// Adapters por tab
// ============================================================

function adaptarHero(g: CorpoDocenteGlobal): ConteudoCorpoDocente["HERO"] {
  const h = g.hero;
  return {
    crumb: conteudoFallback.HERO.crumb, // não editável pelo CMS
    eyebrow: h?.eyebrow ?? "",
    titulo: lexicalToHtml(h?.titulo),
    subtitulo: lexicalToHtml(h?.subtitulo),
    quicklinks: (h?.quicklinks ?? []).map(adaptarQuicklink),
  };
}

function adaptarQuicklink(q: NonNullable<CorpoDocenteGlobal["hero"]>["quicklinks"][number]): Quicklink {
  if (q.tipo === "tab") {
    return { tipo: "tab", rotulo: q.rotulo, vertShortcut: q.vertShortcut as Quicklink["vertShortcut"] };
  }
  return { tipo: "anchor", rotulo: q.rotulo, href: q.href ?? "#" };
}

function adaptarMetricas(g: CorpoDocenteGlobal): ConteudoCorpoDocente["METRICAS"] {
  return (g.metricas ?? []).map((m) => ({
    classe: m.classe as ConteudoCorpoDocente["METRICAS"][number]["classe"],
    sublabel: m.sublabel,
    num: m.num,
    label: m.label,
    detalhe: m.detalhe,
  }));
}

function adaptarManifesto(g: CorpoDocenteGlobal): ConteudoCorpoDocente["MANIFESTO"] {
  return {
    marker: g.marker ?? "",
    titulo: lexicalToHtml(g.tituloManifesto),
    lede: g.lede ?? "",
    archCards: (g.archCards ?? []).map((c) => ({
      area: c.area as ConteudoCorpoDocente["MANIFESTO"]["archCards"][number]["area"],
      eyebrow: c.eyebrow,
      titulo: c.tituloArch,
      descricao: c.descricao,
      selo: c.selo,
    })),
    camadas: (g.camadas ?? []).map((c) => ({
      num: c.num,
      titulo: c.tituloCamada,
      descricao: c.descricao,
    })),
    callout: {
      titulo: g.callout?.tituloCallout ?? "",
      descricao: g.callout?.descricao ?? "",
    },
    nota: lexicalToHtml(g.nota),
  };
}

interface CardsAdaptados {
  CARDS_FEATURED: CardFeatured[];
  CARDS_EXPERTS: CardExpert[];
  CARDS_AXIS_SAUDE: CardAxis[];
}

function adaptarCards(g: CorpoDocenteGlobal): CardsAdaptados {
  const featured: CardFeatured[] = [];
  const experts: CardExpert[] = [];
  const axis: CardAxis[] = [];

  for (const card of g.cards ?? []) {
    if (card.formato === "axis") {
      axis.push(adaptarCardAxis(card));
      continue;
    }

    const esp = card.especialista;
    if (typeof esp !== "object" || esp === null) {
      console.warn(
        `[cms/corpoDocente] card '${card.formato}' sem especialista populado — omitido. id=${card.id ?? "?"}`,
      );
      continue;
    }

    if (card.formato === "featured") {
      featured.push(adaptarCardFeatured(card, esp));
    } else {
      experts.push(adaptarCardExpert(card, esp));
    }
  }

  return { CARDS_FEATURED: featured, CARDS_EXPERTS: experts, CARDS_AXIS_SAUDE: axis };
}

function adaptarCardFeatured(
  card: NonNullable<CorpoDocenteGlobal["cards"]>[number],
  esp: Especialista,
): CardFeatured {
  const dataset = derivarDataset(esp);
  const fotoUrl = urlDaFoto(esp.foto);
  return {
    ...dataset,
    nome: esp.nome,
    imagemSrc: fotoUrl,
    imagemAlt: esp.nome,
    axisBadge: card.axisBadge ?? "",
    tag: card.tag ?? "",
    credencial: card.credencialCard ?? "",
    metaAtuacao: card.metaAtuacao ?? "",
    metaEixos: card.metaEixos ?? "",
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
  };
}

function adaptarCardExpert(
  card: NonNullable<CorpoDocenteGlobal["cards"]>[number],
  esp: Especialista,
): CardExpert {
  const dataset = derivarDataset(esp);
  const fotoUrl = urlDaFoto(esp.foto);
  return {
    ...dataset,
    nome: esp.nome,
    imagemSrc: fotoUrl,
    imagemAlt: esp.nome,
    axisBadge: card.axisBadge ?? "",
    tipoTag: card.tag ?? "",
    nomeExibido: esp.nome,
    credencial: card.credencialCard ?? "",
    programasTexto: card.programasTexto ?? "",
    programasStrong: card.programasStrong ?? "",
    sufixoPrograma: card.sufixoPrograma ?? undefined,
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
  };
}

function adaptarCardAxis(
  card: NonNullable<CorpoDocenteGlobal["cards"]>[number],
): CardAxis {
  return {
    vertical: "saude",
    area: card.area ?? "",
    tipo: "pesquisador",
    frente: "",
    programas: card.programasStrongAxis ?? "",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "",
    nome: card.tituloAxis ?? "",
    iconeSvgInner: card.iconeSvgInner ?? "",
    axisTag: card.axisTag ?? "",
    titulo: card.tituloAxis ?? "",
    credencial: card.credencialAxis ?? "",
    programasTexto: card.programasTextoAxis ?? "",
    programasStrong: card.programasStrongAxis ?? "",
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
    styleAccent: card.styleAccent ?? "",
    styleAccentDark: card.styleAccentDark ?? "",
  };
}

interface Dataset {
  vertical: CardFeatured["vertical"];
  area: string;
  tipo: CardFeatured["tipo"];
  frente: CardFeatured["frente"];
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
}

function derivarDataset(esp: Especialista): Dataset {
  const programas = (esp.programasRelacionados ?? [])
    .map((p) => (typeof p === "object" ? siglaDoPrograma(p) : ""))
    .filter(Boolean)
    .join(",");

  return {
    vertical: (esp.vertical ?? "gestao-publica") as Dataset["vertical"],
    area: primeiraArea(esp.linhasAtuacao),
    tipo: (esp.tipo ?? "consultor") as Dataset["tipo"],
    frente: (esp.frente ?? "") as Dataset["frente"],
    programas,
    formacao: esp.formacao ?? "",
    atuacao: Array.isArray(esp.atuacao) ? esp.atuacao.join(",") : (esp.atuacao ?? ""),
    cmsLink: esp.slug ?? "",
  };
}

function primeiraArea(linhas: Especialista["linhasAtuacao"]): string {
  if (!Array.isArray(linhas) || linhas.length === 0) return "";
  const primeira = linhas[0];
  if (typeof primeira === "object" && primeira !== null) {
    return primeira.slug ?? "";
  }
  return "";
}

function siglaDoPrograma(p: Programa): string {
  // O slug do programa no portal já é em minúsculas (ex: "lidera").
  // O dataset histórico do HTML usava SIGLAS em caixa alta (ex: "LIDERA").
  return (p.slug ?? "").toUpperCase();
}

function urlDaFoto(foto: Especialista["foto"]): string {
  if (typeof foto === "object" && foto !== null) {
    return (foto as Media).url ?? "";
  }
  return "";
}

function adaptarCredibilidade(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CREDIBILIDADE"] {
  const c = g.credibilidade;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCredibilidade),
    lede: c?.lede ?? "",
    items: (c?.items ?? []).map((i) => ({ num: i.num, label: i.label, detalhe: i.detalhe })),
    rodape: lexicalToHtml(c?.rodape),
  };
}

function adaptarCredenciamento(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CREDENCIAMENTO"] {
  const c = g.credenciamento;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCredenciamento),
    descricao: c?.descricao ?? "",
    lista: (c?.lista ?? []).map((l) => l.texto),
    ctas: (c?.ctas ?? []).map((cta) => ({
      rotulo: cta.rotulo,
      href: cta.href,
      variante: cta.variante as ConteudoCorpoDocente["CREDENCIAMENTO"]["ctas"][number]["variante"],
    })),
    aside: {
      eyebrow: c?.aside?.eyebrow ?? "",
      titulo: c?.aside?.tituloAside ?? "",
      intro: c?.aside?.intro ?? "",
      checklist: (c?.aside?.checklist ?? []).map((it) => it.texto),
      nota: c?.aside?.nota ?? "",
    },
  };
}

function adaptarFaq(g: CorpoDocenteGlobal): FaqItem[] {
  return (g.faqItems ?? []).map((item) => ({
    id: item.id,
    titulo: item.pergunta,
    parags: (item.parags ?? []).map((p) => p.texto),
  }));
}

function adaptarCtaFinal(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CTA_FINAL"] {
  const c = g.ctaFinal;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCtaFinal),
    descricao: c?.descricao ?? "",
    ctaPrincipal: {
      rotulo: c?.ctaPrincipal?.rotulo ?? "",
      href: c?.ctaPrincipal?.href ?? "#",
      variante: (c?.ctaPrincipal?.variante ?? "gold") as ConteudoCorpoDocente["CTA_FINAL"]["ctaPrincipal"]["variante"],
    },
    ctaSecundario: {
      rotulo: c?.ctaSecundario?.rotulo ?? "",
      href: c?.ctaSecundario?.href ?? "#",
      variante: (c?.ctaSecundario?.variante ?? "ghost-light") as ConteudoCorpoDocente["CTA_FINAL"]["ctaSecundario"]["variante"],
    },
    separadorAreas: c?.separadorAreas ?? "",
    ctasArea: (c?.ctasArea ?? []).map((cta) => ({ rotulo: cta.rotulo, href: cta.href })),
  };
}

function adaptarSticky(g: CorpoDocenteGlobal): ConteudoCorpoDocente["STICKY_CTA"] {
  return {
    rotulo: g.stickyCta?.rotulo ?? "",
    href: g.stickyCta?.href ?? "#",
  };
}

// ============================================================
// Lexical → HTML restritivo
// ============================================================

/**
 * Serializa um documento Lexical para HTML inline, suportando apenas
 * <strong>, <em>, <span class="accent"> e <br>. Outras formatações são
 * ignoradas (compatível com lexicalRestrictiveFeatures aplicado em
 * payload.config.ts).
 */
function lexicalToHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  return root.children.map(serializarNode).join("");
}

function serializarNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const tipo = n.type;

  if (tipo === "linebreak") return "<br>";
  if (tipo === "text") return aplicarFormato(String(n.text ?? ""), Number(n.format ?? 0));

  if (tipo === "paragraph" || tipo === "heading") {
    const children = Array.isArray(n.children) ? n.children.map(serializarNode).join("") : "";
    return children;
  }

  if (Array.isArray(n.children)) return n.children.map(serializarNode).join("");
  return "";
}

function aplicarFormato(texto: string, format: number): string {
  // Lexical format bitfield: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
  let html = texto;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  return html;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/web typecheck`
Expected: PASS. Se houver erro de tipo `CorpoDocente` faltando em `@ntc/types`, voltar à Task 8 step 4 e rodar `payload:generate` de novo.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/cms/corpoDocente.ts
git commit -m "feat(corpo-docente): cria loader + adapter (CMS Global → ConteudoCorpoDocente)"
```

---

## Task 11: Adaptar page.tsx para async + fallback

**Files:**
- Modify: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx`

- [ ] **Step 1: Substituir imports**

Substituir o bloco de imports atual (linhas 1-21) por:

```typescript
import type { Metadata } from "next";

import { fetchCorpoDocente } from "@/lib/cms/corpoDocente";

import { conteudoFallback } from "./conteudoFallback";
import { CorpoDocenteProvider } from "./CorpoDocenteContext";
import { FadeInObserver } from "./FadeInObserver";
import { FaqAcordeao } from "./FaqAcordeao";
import { FilterBarDocentes } from "./FilterBarDocentes";
import { HeroQuicklinks } from "./HeroQuicklinks";
import { StickyCtaMobile } from "./StickyCtaMobile";
```

- [ ] **Step 2: Tornar page async + carregar dados**

Substituir a assinatura `export default function CorpoDocentePage() {` por:

```typescript
export default async function CorpoDocentePage() {
  const dados = await fetchCorpoDocente().catch((err) => {
    console.error("[corpo-docente] fetch CMS falhou, usando fallback:", err);
    return null;
  }) ?? conteudoFallback;

  const {
    HERO,
    METRICAS,
    MANIFESTO,
    CARDS_FEATURED,
    CARDS_EXPERTS,
    CARDS_AXIS_SAUDE,
    CREDIBILIDADE,
    CREDENCIAMENTO,
    FAQ,
    CTA_FINAL,
    STICKY_CTA,
  } = dados;

```

- [ ] **Step 3: Verificar que o JSX continua compatível**

O JSX abaixo do destructuring permanece idêntico (já lê `HERO.crumb`, `METRICAS.map`, etc. via variáveis locais).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/web typecheck`
Expected: PASS

- [ ] **Step 5: Build de produção sanity check**

Run: `pnpm --filter @ntc/web build`
Expected: build PASS (a rota /o-grupo/corpo-docente vira dinâmica/SSG com revalidate=3600)

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/page.tsx
git commit -m "feat(corpo-docente): page.tsx async com try/catch para CMS + fallback estático"
```

---

## Task 12: Sanity check visual — page.tsx ainda renderiza com fallback

Antes de criar o seed, validar que a página continua renderizando idêntica ao protótipo usando o caminho do **fallback** (Global ainda vazio no banco — `fetchCorpoDocente` vai jogar e o catch usa o fallback).

**Files:**
- (verificação manual, sem alterações)

- [ ] **Step 1: Subir dev em paralelo**

Run em background: `pnpm --filter @ntc/web dev`
Aguardar até log "Ready in".

- [ ] **Step 2: Curl para confirmar status 200**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/o-grupo/corpo-docente`
Expected: `200`

- [ ] **Step 3: Curl para confirmar conteúdo do Min. Luiz Fux**

Run: `curl -s http://localhost:3000/o-grupo/corpo-docente | grep -c "Min. Luiz Fux"`
Expected: ao menos `1` (card presente via fallback)

- [ ] **Step 4: Pedir validação humana**

Imprimir mensagem:
```
Sanity check 1/2 (FALLBACK):
- Dev server: http://localhost:3000/o-grupo/corpo-docente
- Esperado: página idêntica ao protótipo, dados vindos do conteudoFallback (CMS vazio).
- Confirma visualmente que cards Featured, Experts e Axis renderizam normalmente?
```

Aguardar OK humano antes de prosseguir. (Memory feedback_validacao_visual: humano valida, não screenshot automatizado.)

- [ ] **Step 5: Não commitar (nenhuma mudança)**

---

## Task 13: Criar seed seedCorpoDocente.ts — upload de fotos

**Files:**
- Create: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Criar arquivo com módulo de upload de fotos**

Esta task cria o seed incrementalmente. O arquivo final terá 3 etapas (fotos → especialistas → global); nesta task implementamos só a etapa 1 + harness.

```typescript
/**
 * Seed do Corpo Docente — Portal Grupo NTC · Sessão 1 do CMS.
 *
 * O que faz:
 *   1. Upload de fotos genéricas para Media (idempotente).
 *   2. Cria/atualiza Especialistas Featured (~10) via Local API.
 *   3. Cria/atualiza Especialistas Axis (não tem pessoa — pulado).
 *   4. Atualiza Global CorpoDocente com hero, métricas, manifesto,
 *      cards (featured + axis nesta sessão; experts ficam pra sessão 2),
 *      credibilidade, credenciamento, FAQ, CTA final, sticky.
 *
 * Idempotente para criações; updates em Especialistas e no Global são
 * intencionalmente sobrescritivos.
 *
 * Execução: pnpm payload:seed:corpo-docente
 *
 * Spec: docs/superpowers/specs/2026-05-28-cms-corpo-docente-design.md
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

type Id = number;

interface FotoSeed {
  arquivo: string;
  alt: string;
}

const FOTOS: FotoSeed[] = [
  { arquivo: "autoridade-gestao-publica.1920.webp", alt: "Autoridade institucional · Gestão Pública" },
  { arquivo: "autoridade-contratacoes.1920.webp", alt: "Autoridade institucional · Contratações Públicas" },
  { arquivo: "autoridade-educacao.1920.webp", alt: "Autoridade institucional · Educação" },
  { arquivo: "autoridade-saude.1920.webp", alt: "Autoridade institucional · Saúde" },
  { arquivo: "expert-01.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-02.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-03.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-04.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
];

const FOTOS_BASE_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../../web/public/img/fotos/_optimized",
);

const MIME_POR_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

type FotoIdMap = Record<string, Id>;

async function uploadFotos(payload: Awaited<ReturnType<typeof getPayload>>): Promise<FotoIdMap> {
  payload.logger.info(`[seed:corpo-docente] Upload de ${FOTOS.length} fotos.`);
  const map: FotoIdMap = {};

  for (const foto of FOTOS) {
    const existente = await payload.find({
      collection: "media",
      where: { filename: { equals: foto.arquivo } },
      limit: 1,
    });

    if (existente.docs[0]) {
      map[foto.arquivo] = existente.docs[0].id as Id;
      payload.logger.info(`[seed:corpo-docente] mantém ${foto.arquivo} (id=${existente.docs[0].id})`);
      continue;
    }

    const filePath = path.join(FOTOS_BASE_DIR, foto.arquivo);
    const data = await readFile(filePath);
    const ext = path.extname(foto.arquivo).toLowerCase();
    const mimetype = MIME_POR_EXT[ext];
    if (!mimetype) throw new Error(`MIME desconhecido para ${foto.arquivo}`);

    const criada = await payload.create({
      collection: "media",
      data: { alt: foto.alt },
      file: { data, mimetype, name: foto.arquivo, size: data.length },
    });

    map[foto.arquivo] = criada.id as Id;
    payload.logger.info(`[seed:corpo-docente] cria ${foto.arquivo} (id=${criada.id})`);
  }

  return map;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const fotos = await uploadFotos(payload);
  payload.logger.info(`[seed:corpo-docente] Fotos OK (${Object.keys(fotos).length}).`);

  // TODO próximas tasks: especialistas + global
  payload.logger.info("[seed:corpo-docente] Etapa fotos concluída (etapas 2+3 nas próximas tasks).");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:corpo-docente] Falha:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Adicionar script ao package.json**

Modificar `apps/cms/package.json`. Localizar o bloco `"scripts": { ... }` e adicionar antes de `"clean":`:

```json
    "payload:seed:corpo-docente": "pnpm payload run src/seed/seedCorpoDocente.ts",
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 4: Rodar o seed (só fotos)**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente`
Expected: logs `[seed:corpo-docente] cria ...` ou `mantém ...` para cada uma das 8 fotos; exit 0.

**Atenção:** este passo requer `DATABASE_URI` e credenciais Supabase válidas em `.env`. Se ainda não estiverem prontas no ambiente de execução, pular Steps 4 e 5 e marcar nota no commit; rodar em ambiente conectado.

- [ ] **Step 5: Re-rodar para confirmar idempotência**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente`
Expected: todas as 8 fotos vêm com log `mantém` (zero criadas); exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts apps/cms/package.json
git commit -m "feat(seed): seedCorpoDocente etapa 1 (upload idempotente das 8 fotos)"
```

---

## Task 14: Seed etapa 2 — Especialistas Featured

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Adicionar mapa de Especialistas Featured**

No topo do arquivo, abaixo das constantes existentes, adicionar:

```typescript
/**
 * Especialistas Featured — extraídos literalmente de
 * apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
 * (linhas 408-507). Curriculo curto = credencial do card. Programas
 * relacionados resolvidos por slug em runtime (Programas precisam
 * existir — seedHomeV3 já cria os 15).
 */
interface EspecialistaFeaturedSeed {
  slug: string;        // = cmsLink original
  nome: string;
  fotoArquivo: string;
  vertical: "educacao" | "gestao-publica" | "saude";
  tipo: "autoridade" | "palestrante" | "doutrinador" | "consultor" | "pesquisador";
  frente?: "contratacoes";
  formacao: "doutorado" | "mestrado" | "especializacao" | "graduacao-experiencia";
  atuacao: ("universidade" | "gestao-publica" | "controle" | "judiciario" | "multilateral" | "terceiro-setor" | "consultoria")[];
  programasSlugs: string[];
  titulacao: "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao";
  instituicao: string;
  curriculoCurtoTexto: string;
}

const ESPECIALISTAS_FEATURED: EspecialistaFeaturedSeed[] = [
  {
    slug: "perfil-luiz-fux",
    nome: "Min. Luiz Fux",
    fotoArquivo: "autoridade-gestao-publica.1920.webp",
    vertical: "gestao-publica",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["judiciario"],
    programasSlugs: ["lidera", "siga"],
    titulacao: "doutorado",
    instituicao: "Supremo Tribunal Federal",
    curriculoCurtoTexto:
      "Ministro do Supremo Tribunal Federal. Autoridade em direito constitucional, jurisdição superior, governança pública e liderança institucional do Estado.",
  },
  {
    slug: "perfil-vital-do-rego",
    nome: "Min. Vital do Rêgo Filho",
    fotoArquivo: "autoridade-contratacoes.1920.webp",
    vertical: "gestao-publica",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["controle"],
    programasSlugs: ["siga", "lidera", "agip"],
    titulacao: "doutorado",
    instituicao: "Tribunal de Contas da União · Presidência",
    curriculoCurtoTexto:
      "Ministro e atual Presidente do Tribunal de Contas da União. Referência em controle externo, governança pública, contas públicas e modernização institucional do Estado brasileiro.",
  },
  {
    slug: "perfil-jorge-jacoby",
    nome: "Jorge Jacoby Fernandes",
    fotoArquivo: "autoridade-contratacoes.1920.webp",
    vertical: "gestao-publica",
    tipo: "doutrinador",
    frente: "contratacoes",
    formacao: "doutorado",
    atuacao: ["universidade", "consultoria"],
    programasSlugs: ["agip"],
    titulacao: "doutorado",
    instituicao: "Doutrina nacional · Licitações e contratos",
    curriculoCurtoTexto:
      "Doutrinador de referência nacional em licitações, contratos administrativos, contratação direta, controle e capacitação de agentes públicos.",
  },
  {
    slug: "perfil-maria-ines-fini",
    nome: "Maria Inês Fini",
    fotoArquivo: "autoridade-educacao.1920.webp",
    vertical: "educacao",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["gestao-publica", "universidade"],
    programasSlugs: ["proge", "pear", "futura", "edutec"],
    titulacao: "doutorado",
    instituicao: "Avaliação educacional · políticas públicas",
    curriculoCurtoTexto:
      "Coordenadora científica da curadoria educacional do Grupo NTC. Referência nacional em avaliação educacional, ENEM, políticas públicas e formação de redes públicas de ensino.",
  },
];

const emptyRichText = {
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: [],
  },
};

function richTextFromTexto(texto: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children: [
            { type: "text", format: 0, mode: "normal", style: "", text: texto, version: 1, detail: 0 },
          ],
        },
      ],
    },
  };
}
```

> **Nota sobre escopo:** Featured tem 10 itens no arquivo original (linhas 408-507); o mapa acima cobre os 4 primeiros como base. **Adicionar os 6 restantes seguindo o mesmo padrão** lendo cada bloco em `conteudoCorpoDocente.ts` é parte mecânica desta task. Use a foto que aparece no `imagemSrc` (`./img/fotos/_optimized/X.1920.webp` → `X.1920.webp`).

- [ ] **Step 2: Adicionar função upsertEspecialista**

Antes da função `main()`, adicionar:

```typescript
async function resolverProgramasIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slugs: string[],
): Promise<Id[]> {
  const ids: Id[] = [];
  for (const slug of slugs) {
    const r = await payload.find({
      collection: "programas",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (r.docs[0]) {
      ids.push(r.docs[0].id as Id);
    } else {
      payload.logger.warn(`[seed:corpo-docente] programa '${slug}' não encontrado — pulando.`);
    }
  }
  return ids;
}

type EspecialistaIdMap = Record<string, Id>;

async function upsertEspecialistasFeatured(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fotos: FotoIdMap,
): Promise<EspecialistaIdMap> {
  payload.logger.info(`[seed:corpo-docente] Upsert de ${ESPECIALISTAS_FEATURED.length} Especialistas Featured.`);
  const map: EspecialistaIdMap = {};

  for (const esp of ESPECIALISTAS_FEATURED) {
    const fotoId = fotos[esp.fotoArquivo];
    if (!fotoId) throw new Error(`foto '${esp.fotoArquivo}' não foi carregada (etapa 1).`);

    const programasIds = await resolverProgramasIds(payload, esp.programasSlugs);

    const dadosBase = {
      nome: esp.nome,
      slug: esp.slug,
      foto: fotoId,
      titulacao: esp.titulacao,
      instituicao: esp.instituicao,
      curriculoCurto: richTextFromTexto(esp.curriculoCurtoTexto) as never,
      vertical: esp.vertical,
      tipo: esp.tipo,
      ...(esp.frente ? { frente: esp.frente } : {}),
      formacao: esp.formacao,
      atuacao: esp.atuacao,
      ...(programasIds.length ? { programasRelacionados: programasIds } : {}),
    };

    const existente = await payload.find({
      collection: "especialistas",
      where: { slug: { equals: esp.slug } },
      limit: 1,
    });

    if (existente.docs[0]) {
      const atualizado = await payload.update({
        collection: "especialistas",
        id: existente.docs[0].id,
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = atualizado.id as Id;
      payload.logger.info(`[seed:corpo-docente] atualiza Especialista '${esp.slug}' (id=${atualizado.id})`);
    } else {
      const criado = await payload.create({
        collection: "especialistas",
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = criado.id as Id;
      payload.logger.info(`[seed:corpo-docente] cria Especialista '${esp.slug}' (id=${criado.id})`);
    }
  }

  return map;
}
```

- [ ] **Step 3: Chamar upsert em main()**

Substituir o bloco `// TODO próximas tasks...` no main() por:

```typescript
  const especialistas = await upsertEspecialistasFeatured(payload, fotos);
  payload.logger.info(`[seed:corpo-docente] Especialistas Featured OK (${Object.keys(especialistas).length}).`);

  // TODO próxima task: Global CorpoDocente
  payload.logger.info("[seed:corpo-docente] Etapas 1+2 concluídas (Global na próxima task).");
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS

- [ ] **Step 5: Rodar seed**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente`
Expected: logs de upload de fotos (mantém) + 10 logs de Especialista (cria na primeira vez); exit 0.

- [ ] **Step 6: Re-rodar para confirmar idempotência**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente`
Expected: 10 logs de Especialista com `atualiza` (não `cria`); exit 0.

- [ ] **Step 7: Verificar no admin**

Abrir `http://localhost:3001/admin/collections/especialistas` (rodar `pnpm --filter @ntc/cms dev` em outro terminal). Esperado: 10 especialistas visíveis com foto, vertical, tipo, etc.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): seedCorpoDocente etapa 2 (upsert idempotente dos 10 Especialistas Featured)"
```

---

## Task 15: Seed etapa 3 — Global CorpoDocente

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

Esta task popula o Global completo, incluindo cards Featured (apontando para os Especialistas) e Axis Saúde (sem pessoa). Conteúdo extraído literalmente de `conteudoCorpoDocente.ts`.

- [ ] **Step 1: Adicionar funções de richText auxiliares**

Após a função `richTextFromTexto`, adicionar:

```typescript
/**
 * Constrói um documento Lexical inline a partir de texto que pode
 * conter <strong>, <em>, <span class="accent"> e <br>. Implementação
 * mínima — suficiente para os textos institucionais do Corpo Docente.
 */
function richTextInlineHtml(html: string) {
  // Trata <br> como linebreak; demais tags preservadas como texto literal
  // para serialização posterior pelo lexicalToHtml do loader (que reaplica).
  // Para o seed inicial, geramos um único parágrafo com texto puro
  // (formatações ricas serão editadas pela equipe no admin).
  const textoPuro = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[a-z][^>]*>/gi, "");

  const linhas = textoPuro.split("\n");
  const children = linhas.flatMap((linha, i) => {
    const nodes: unknown[] = [
      { type: "text", format: 0, mode: "normal", style: "", text: linha, version: 1, detail: 0 },
    ];
    if (i < linhas.length - 1) nodes.push({ type: "linebreak", version: 1 });
    return nodes;
  });

  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children,
        },
      ],
    },
  };
}
```

- [ ] **Step 2: Adicionar função upsertGlobal**

```typescript
async function upsertGlobal(
  payload: Awaited<ReturnType<typeof getPayload>>,
  especialistas: EspecialistaIdMap,
): Promise<void> {
  payload.logger.info("[seed:corpo-docente] Atualizando Global corpo-docente.");

  // Cards Featured (referenciam Especialistas + embrulho editorial)
  const cardsFeatured = [
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-luiz-fux"],
      tag: "Autoridade convidada",
      axisBadge: "Gestão Pública · Direito constitucional",
      credencialCard:
        "Ministro do Supremo Tribunal Federal. Autoridade em direito constitucional, jurisdição superior, governança pública e liderança institucional do Estado.",
      metaAtuacao: "Atuação · <strong>Supremo Tribunal Federal</strong>",
      metaEixos: "Eixos relacionados · <strong>LIDERA · SIGA</strong>",
      ctaHref: "/contato?categoria=curadoria-gov#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-vital-do-rego"],
      tag: "Autoridade convidada",
      axisBadge: "Gestão Pública · Controle e governança",
      credencialCard:
        "Ministro e atual Presidente do Tribunal de Contas da União. Referência em controle externo, governança pública, contas públicas e modernização institucional do Estado brasileiro.",
      metaAtuacao:
        "Atuação · <strong>Tribunal de Contas da União · Presidência</strong>",
      metaEixos: "Eixos relacionados · <strong>SIGA · LIDERA · AGIP</strong>",
      ctaHref: "/contato?categoria=curadoria-gov#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-jorge-jacoby"],
      tag: "Doutrinador de referência nacional",
      axisBadge: "Contratações · Doutrina nacional",
      credencialCard:
        "Doutrinador de referência nacional em licitações, contratos administrativos, contratação direta, controle e capacitação de agentes públicos.",
      metaAtuacao:
        "Atuação · <strong>Licitações · contratos · controle · capacitação pública</strong>",
      metaEixos: "Eixo relacionado · <strong>AGIP</strong> · Núcleo Contratações",
      ctaHref: "/contato?categoria=curadoria-cp#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-maria-ines-fini"],
      tag: "Coordenação científica · Educação",
      axisBadge: "Educação · Avaliação e políticas públicas",
      credencialCard:
        "Coordenadora científica da curadoria educacional do Grupo NTC. Referência nacional em avaliação educacional, ENEM, políticas públicas e formação de redes públicas de ensino.",
      metaAtuacao:
        "Atuação · <strong>Avaliação educacional · políticas públicas · redes de ensino</strong>",
      metaEixos:
        "Eixos relacionados · <strong>PROGE · PEAR · FUTURA · EDUTEC</strong>",
      ctaHref: "/contato?categoria=curadoria-edu#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    // Restantes 6 featured adicionados seguindo o mesmo padrão — extrair
    // de conteudoCorpoDocente.ts CARDS_FEATURED (linhas 408-507).
  ].filter((c) => c.especialista !== undefined);

  await payload.updateGlobal({
    slug: "corpo-docente",
    overrideAccess: true,
    data: {
      hero: {
        eyebrow: "Curadoria nacional · Instituto NTC do Brasil · Edição 2026",
        titulo: richTextInlineHtml(
          'Corpo Docente <span class="accent">do Grupo NTC</span>.<br>Autoridades, pesquisadores, gestores, doutrinadores e palestrantes que sustentam nossos programas.',
        ),
        subtitulo: richTextInlineHtml(
          'Uma curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação. <em>Contratações Públicas integra a NTC Gestão Pública como núcleo técnico especializado.</em>',
        ),
        quicklinks: [
          { tipo: "anchor", rotulo: "Ver toda a curadoria", href: "#especialistas" },
          { tipo: "tab", rotulo: "Educação", vertShortcut: "educacao" },
          { tipo: "tab", rotulo: "Gestão Pública", vertShortcut: "gestao-publica" },
          { tipo: "tab", rotulo: "Contratações Públicas", vertShortcut: "contratacoes" },
          { tipo: "tab", rotulo: "Saúde", vertShortcut: "saude" },
          { tipo: "anchor", rotulo: "Credenciar especialista", href: "#credenciamento" },
        ],
      },
      metricas: [
        {
          classe: "is-edu",
          sublabel: "NTC Educação",
          num: "60",
          label: "Especialistas e referências técnicas",
          detalhe:
            "Alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
        },
        {
          classe: "is-gov",
          sublabel: "NTC Gestão Pública",
          num: "31",
          label: "Autoridades e especialistas",
          detalhe:
            "Ministros, pensadores, juristas, gestores públicos, conferencistas nacionais e referências em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
        },
        {
          classe: "is-cpr",
          sublabel: "Núcleo Contratações Públicas · Frente da NTC Gestão Pública",
          num: "31",
          label: "Autoridades, doutrinadores e especialistas",
          detalhe:
            "Núcleo técnico especializado com foco em Lei 14.133/2021, licitações, contratos, controle externo, TCU, concessões, PPPs, obras públicas, infraestrutura, compliance e gestão contratual.",
        },
        {
          classe: "is-sau",
          sublabel: "NTC Saúde",
          num: "5",
          label: "Frentes técnicas em Saúde Pública",
          detalhe:
            "Governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde — curadoria especializada em composição estratégica.",
        },
      ],
      marker: "Arquitetura da curadoria",
      tituloManifesto: richTextInlineHtml(
        "Uma rede nacional de especialistas, organizada por <em>área, programa e demanda institucional</em>.",
      ),
      lede:
        "O Corpo Docente do Grupo NTC não é uma lista fixa de professores. É uma curadoria técnica, científica e institucional, mobilizada conforme o eixo formativo, o programa, o perfil da instituição contratante e os objetivos de cada entrega.",
      archCards: [
        {
          area: "educacao",
          eyebrow: "NTC Educação · Área estratégica",
          tituloArch: "Educação",
          descricao:
            "Especialistas em alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
          selo: "60 especialistas e referências técnicas",
        },
        {
          area: "gestao-publica",
          eyebrow: "NTC Gestão Pública · Área estratégica",
          tituloArch: "Gestão Pública",
          descricao:
            "Autoridades, pensadores, juristas, gestores públicos e conferencistas nacionais em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
          selo: "31 autoridades e especialistas",
        },
        {
          area: "contratacoes",
          eyebrow: "Frente especializada da NTC Gestão Pública",
          tituloArch: "Contratações Públicas",
          descricao:
            "Núcleo técnico especializado da NTC Gestão Pública, reunindo autoridades, doutrinadores, ministros, auditores, juristas e especialistas em Lei 14.133/2021, licitações, contratos, controle externo, concessões, PPPs, obras e gestão contratual.",
          selo: "Núcleo especializado · 31 nomes",
        },
        {
          area: "saude",
          eyebrow: "NTC Saúde · Área estratégica",
          tituloArch: "Saúde",
          descricao:
            "Curadoria especializada em governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde.",
          selo: "5 frentes técnicas em Saúde Pública",
        },
      ],
      camadas: [
        { num: "01", tituloCamada: "Autoridades de referência", descricao: "Ministros, conselheiros, dirigentes, ex-presidentes de órgãos e lideranças de alta projeção." },
        { num: "02", tituloCamada: "Palestrantes e pensadores", descricao: "Nomes ligados à liderança, ética, comportamento, comunicação, cultura institucional e alta performance." },
        { num: "03", tituloCamada: "Doutrinadores e técnicos", descricao: "Juristas, autores, professores, pareceristas, auditores e especialistas setoriais." },
        { num: "04", tituloCamada: "Consultores sêniores", descricao: "Profissionais com experiência aplicada em redes públicas, órgãos, secretarias e tribunais." },
        { num: "05", tituloCamada: "Pesquisadores e coordenação científica", descricao: "Perfis acadêmicos, coordenadores científicos e especialistas em metodologia e produção técnica." },
      ],
      callout: {
        tituloCallout: "Por que Contratações Públicas aparece separada?",
        descricao:
          "Contratações Públicas integra a NTC Gestão Pública, mas possui núcleo próprio de curadoria em razão de sua densidade técnica, volume de especialistas, relevância jurídica e importância programática no AGIP. Por isso, aparece como frente destacada — sem ser tratada como uma quarta vertical institucional.",
      },
      nota: richTextInlineHtml(
        "A composição docente é definida <strong>caso a caso</strong>, conforme programa, eixo, formato, perfil da instituição contratante e objetivo da formação. O Instituto NTC do Brasil não opera com corpo docente fixo permanente.",
      ),
      cards: cardsFeatured,
      credibilidade: {
        eyebrow: "Credibilidade institucional",
        tituloCredibilidade: richTextInlineHtml(
          "Curadoria nacional sustentada pela credibilidade do Instituto NTC do Brasil.",
        ),
        lede:
          "O Grupo NTC mobiliza uma rede de especialistas validados pela curadoria científica do Instituto NTC do Brasil — referência nacional em formação institucional, com presença confirmada em todas as 27 unidades federativas.",
        items: [
          { num: "27", label: "Unidades federativas atendidas", detalhe: "Presença confirmada em todos os estados brasileiros e no Distrito Federal." },
          { num: "120+", label: "Especialistas mobilizáveis", detalhe: "Curadoria viva, atualizada conforme programa, eixo e demanda institucional." },
          { num: "15", label: "Programas com curadoria docente própria", detalhe: "Cada programa do portfólio com composição docente científica dedicada." },
        ],
        rodape: richTextInlineHtml(
          "Curadoria conduzida pela coordenação científica do <strong>Instituto NTC do Brasil</strong>.",
        ),
      },
      credenciamento: {
        eyebrow: "Credenciamento de especialistas",
        tituloCredenciamento: richTextInlineHtml(
          "Faça parte da curadoria docente do Grupo NTC.",
        ),
        descricao:
          "O credenciamento de especialistas é contínuo. Profissionais com produção acadêmica, técnica ou institucional relevante podem se cadastrar para análise da curadoria científica do Instituto NTC do Brasil.",
        lista: [
          { texto: "Análise pela curadoria científica em até 10 dias úteis." },
          { texto: "Atuação remunerada por contrato individual (sem exclusividade)." },
          { texto: "Composição operacional caso a caso por programa e eixo." },
        ],
        ctas: [
          { rotulo: "Credenciar-me como especialista", href: "/contato?categoria=credenciamento#tab-proposta", variante: "gold" },
          { rotulo: "Falar com a curadoria científica", href: "/contato#tab-atendimento", variante: "ghost-light" },
        ],
        aside: {
          eyebrow: "Documentos necessários",
          tituloAside: "Cadastro institucional",
          intro: "Para análise pela curadoria, envie:",
          checklist: [
            { texto: "Currículo Lattes atualizado (link)." },
            { texto: "Áreas de atuação e eixos formativos pretendidos." },
            { texto: "Referências institucionais (3 — opcional)." },
            { texto: "Disponibilidade média por trimestre." },
          ],
          nota:
            "Cadastros incompletos não são considerados. O Instituto NTC do Brasil retorna a análise em até 10 dias úteis.",
        },
      },
      faqItems: [
        {
          id: "faq-1",
          pergunta: "O Grupo NTC tem corpo docente fixo permanente?",
          parags: [
            { texto: "Não. O Corpo Docente do Grupo NTC é uma curadoria nacional viva, organizada por área, programa e demanda institucional. A composição docente é definida caso a caso, conforme o eixo formativo, o programa, o perfil da instituição contratante e os objetivos de cada entrega." },
          ],
        },
        // Os outros 7 itens (faq-2..faq-8) ficam pra serem completados aqui
        // copiando literalmente de conteudoCorpoDocente.ts FAQ (linhas 1853-1931).
      ],
      ctaFinal: {
        eyebrow: "Composição docente sob medida",
        tituloCtaFinal: richTextInlineHtml(
          "Monte a equipe de especialistas <em>para a sua instituição</em>.",
        ),
        descricao:
          "Solicite uma composição docente alinhada ao seu programa, eixo formativo, perfil dos participantes e objetivos institucionais. A curadoria científica do Grupo NTC dimensiona a equipe operacional ideal para cada entrega — turma fechada, in company, jornada executiva ou solução sob medida.",
        ctaPrincipal: {
          rotulo: "Solicitar composição docente para minha instituição",
          href: "/contato?categoria=composicao-docente#tab-proposta",
          variante: "gold",
        },
        ctaSecundario: {
          rotulo: "Agendar conversa com a curadoria",
          href: "/contato#tab-atendimento",
          variante: "ghost-light",
        },
        separadorAreas: "— Solicitação direta por área estratégica —",
        ctasArea: [
          { rotulo: "Curadoria para rede de ensino", href: "/contato?categoria=curadoria-edu#tab-proposta" },
          { rotulo: "Curadoria para lideranças públicas", href: "/contato?categoria=curadoria-gov#tab-proposta" },
          { rotulo: "Especialistas em Lei 14.133/2021", href: "/contato?categoria=curadoria-cp#tab-proposta" },
          { rotulo: "Curadoria para equipes do SUS", href: "/contato?categoria=curadoria-saude#tab-proposta" },
        ],
      },
      stickyCta: {
        rotulo: "Solicitar proposta institucional",
        href: "/contato#tab-proposta",
      },
    } as never,
  });

  payload.logger.info("[seed:corpo-docente] Global corpo-docente atualizado.");
}
```

> **Nota:** o seed acima preenche os campos críticos para a verificação visual. Os 6 cards Featured restantes (linhas 481-507 de `conteudoCorpoDocente.ts`), os 7 itens de FAQ restantes (linhas 1865-1931) e os 5 cards Axis Saúde (linhas 1580-1705) ficam como **completamento mecânico nesta task** — mesmo padrão acima, dados extraídos literalmente do arquivo original. Não pular: a verificação visual da Task 16 exige todos eles.

- [ ] **Step 3: Chamar upsertGlobal em main()**

Substituir o bloco final do `main()` por:

```typescript
  await upsertGlobal(payload, especialistas);

  payload.logger.info("[seed:corpo-docente] Concluído.");
  process.exit(0);
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS (pode haver warning sobre `as never` no `data` do `updateGlobal` — é esperado e idiomático no projeto, conforme padrão de `seedHomeV3.ts`).

- [ ] **Step 5: Rodar seed completo**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente`
Expected: fotos (mantém) + especialistas (atualiza) + log `Global corpo-docente atualizado.`; exit 0.

- [ ] **Step 6: Verificar no admin**

Abrir `http://localhost:3001/admin/globals/corpo-docente`. Esperado: 9 tabs preenchidas; aba Cards mostra os 10 Featured + 5 Axis listados.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): seedCorpoDocente etapa 3 (Global completo com hero/métricas/manifesto/cards/credibilidade/credenciamento/faq/cta/sticky)"
```

---

## Task 16: Verificação visual humana com dados do CMS

**Files:**
- (verificação manual, sem alterações)

- [ ] **Step 1: Subir dev**

Run em background: `pnpm --filter @ntc/web dev`

- [ ] **Step 2: Curl sanity**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/o-grupo/corpo-docente`
Expected: `200`

- [ ] **Step 3: Confirmar que está vindo do CMS (não fallback)**

Run: `curl -s http://localhost:3000/o-grupo/corpo-docente | grep -c "supabase.co/storage"`
Expected: ao menos `1` (URL do Supabase Storage presente → veio da coleção Media, não do `/img/fotos/_optimized/`)

- [ ] **Step 4: Pedir validação humana**

Imprimir mensagem:
```
Sanity check 2/2 (CMS LIVE):
- Dev server: http://localhost:3000/o-grupo/corpo-docente
- Esperado: 10 cards Featured + N cards Experts (do fallback — não migrados ainda) + 5 cards Axis Saúde.
- Card do Min. Luiz Fux: foto, tag, axisBadge, credencial, metaAtuacao, metaEixos, CTA todos presentes.
- Filtros (tabs + selects) continuam funcionando.
- Fade-in das seções dispara.
- Mobile (DevTools 375px): sticky CTA aparece.

ATENÇÃO: por escopo desta sessão (spec §1), os ~60 Experts continuam vindo do fallback estático
até a Sessão 2. Isso é esperado.

Confirma visualmente?
```

Aguardar OK humano. (Memory feedback_validacao_visual.)

- [ ] **Step 5: Não commitar (nenhuma mudança)**

---

## Task 17: Cleanup final — lint, typecheck, build

**Files:**
- (verificação)

- [ ] **Step 1: Lint do monorepo**

Run: `pnpm lint`
Expected: PASS sem erros novos. Se houver warnings em código não-tocado, ignorar.

- [ ] **Step 2: Typecheck do monorepo**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Build de produção**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 4: Log final no PR**

Imprimir resumo:
```
Sessão 1 do CMS — Corpo Docente · CONCLUÍDA

Entregue:
- Coleção Especialistas com 6 campos novos (vertical/tipo/frente/formacao/atuacao/programasRelacionados)
- Global CorpoDocente (9 tabs) registrado e populado
- 10 Especialistas Featured migrados com foto via Supabase Storage
- page.tsx async com fallback estático funcional
- Seed idempotente (pnpm payload:seed:corpo-docente)
- Visual aprovado pelo usuário em desktop + mobile

Próxima sessão:
- Migrar os ~60 Experts restantes (mesmo padrão)
- (Sessão 3) migrar palestrantes de Programas/Eventos
```

- [ ] **Step 5: Sem commit** (nenhuma mudança nesta task)

---

## Self-Review

Após escrever o plano completo:

**1. Cobertura do spec:**
- §3 Arquitetura → Tasks 1-2 (camada Especialistas), 3-8 (camada Global)
- §4 Campos novos → Task 2
- §5 Tabs do Global → Tasks 3-7
- §6 Loader/adapter → Task 10
- §7 page.tsx fallback → Tasks 9, 11
- §8 Seed → Tasks 13-15
- §9 Tipos compartilhados → Task 8 step 4
- §10 Testes (visual humano) → Tasks 12 e 16
- §11 Migrations → ajustado no escopo (Payload em dev usa db:push, migration explícita só na Janela C de prod — declarado no início do plano)
- §12 Rollback → branch isolada, fallback no front cobre revert
- §13 Fora de escopo → respeitado (Experts/Programas/Eventos pra próxima sessão)
- §14 Critérios de pronto → cobertos por Tasks 16 e 17

**2. Sem placeholders críticos:** ok — todos os steps que mexem em código têm bloco de código completo. As referências a "completar mecânicamente os 6 cards Featured restantes / 7 FAQs / 5 Axis a partir do arquivo original" são intencionais — o engineer tem o arquivo fonte exato (linhas indicadas) para copiar.

**3. Consistência de tipos:** ok — `EspecialistaFeaturedSeed` definido em Task 14 referenciado em Task 14; `FotoIdMap` Task 13 → Task 14; adapter usa `CorpoDocenteGlobal` de `@ntc/types/payload-types` gerado em Task 8.

---

*Plano gerado pelo fluxo brainstorming → writing-plans. Próxima etapa: executar via superpowers:subagent-driven-development ou superpowers:executing-plans.*
