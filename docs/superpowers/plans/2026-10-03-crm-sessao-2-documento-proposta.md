# CRM Sessão 2 — Documento da proposta · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O PDF da proposta passa de capa + 3 seções para capa + Resumo Executivo + 21 seções numeradas, e todo o conteúdo textual passa a viver dentro da proposta, pré-preenchido na criação e editável ali.

**Architecture:** As regras ficam puras em `packages/lib/src/crm/` (textos institucionais, quadro comercial, composição do conteúdo inicial). O gerador é quebrado por responsabilidade: tokens visuais isolados, capa e Resumo Executivo à parte, seções em módulos por origem, e um montador puro que ordena, omite as vazias, intercala as extras e numera pela posição final. A leitura segue concentrada em `dados.ts`, agora lendo o conteúdo da própria proposta em vez do programa.

**Tech Stack:** TypeScript strict (`noUncheckedIndexedAccess`) · Payload CMS 3.18 (postgres) · Playwright (Chromium headless) · Vitest · Next.js 15 · pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-10-03-crm-sessao-2-documento-proposta-design.md`

## Global Constraints

- CLAUDE.md tem precedência. §5.3: **nenhum texto institucional é redigido pelo agente** — tudo transcrito do modelo versionado. §5.4: nenhuma dependência nova. §5.7: sem `any`, `@ts-ignore`, `eslint-disable`.
- **Paleta do modelo, à risca** — `--navy:#0E2A47`, `--navy-exec:#1E4474`, `--gold:#B68B40`, `--gold-light:#D6B070`, `--offwhite:#F5EDD8`, `--bg-suave:#FBF9F2`, `--ink:#3A3A3A`, `--ink-mid:#6B6B6B`, `--acento:#1E5B7B`, `--acento-claro:#3B8AB0`. **Exceção deliberada ao §3**, confinada a `tokens.ts`.
- **Descartar do modelo:** o `<link>` para Google Fonts e todo `@page { @top-* }`.
- **Seção sem conteúdo é omitida**, nunca impressa vazia, e entra no relatório.
- **Nenhum campo novo é `required`** — `required: true` emite `NOT NULL` no adapter (lição da Sessão 4, CLAUDE.md v3.1) e propostas antigas não têm nada disso.
- **NÃO rodar `payload:push:schema`** — é passo manual do PO (§14). A Task 2 só altera as coleções e roda `payload:generate`.
- `pnpm lint` (0 erros), `pnpm typecheck`, `pnpm test` verdes ao fim de cada task. `pnpm build` só na última.
- Commits em português, Conventional Commits, sem emoji; subject, linha em branco, e o trailer exato `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch: `feat/crm-sessao-2-documento` a partir da `main`, **depois** de `feat/cms-importar-programas` ser mergeada.

## Review Focus

1. **Proposta sem programa, sem módulos ou sem valores** — o documento não quebra nem imprime `undefined`/`NaN`; seções sem conteúdo são omitidas e relatadas. *(Task 7)*
2. **Divisão não exata de pagantes/cortesias pelos módulos** — a regra recusa e o formulário mostra o múltiplo esperado. *(Tasks 5 e 11)*
3. **Seção extra com âncora omitida, posição repetida ou corpo vazio.** *(Task 4)*
4. **Restaurar padrão sobrescrevendo edição manual** — o aviso vem antes, e restaurar uma seção não toca nas outras. *(Task 12)*
5. **Módulo acrescentado ou removido depois de criada a proposta** — entra com a ementa do catálogo daquele momento; removido, some da lista sem deixar texto órfão. *(Task 11)*

---

## Estrutura de arquivos

- Create `docs/prototipos/proposta-modelo-v1.html`.
- Create `apps/cms/src/lib/documentoProposta/tokens.ts`, `montar.ts`, `capa.ts`, `secoes/{programa,comercial,institucional}.ts` (+ testes).
- Create `packages/lib/src/crm/textosProposta.ts`, `quadroComercial.ts`, `conteudoProposta.ts` (+ testes).
- Modify `apps/cms/src/collections/Propostas.ts`, `Programas.ts`, `packages/types/src/payload-types.ts` (gerado), `packages/lib/src/index.ts`.
- Modify `apps/cms/src/lib/documentoProposta/dados.ts`, `html.ts` (+ testes).
- Modify `apps/cms/src/lib/cms/painelCrmEscrita.ts` (+ testes), `apps/cms/src/app/(painel)/acoesCrm.ts`, `crm/DetalheProposta.tsx`, `crm/FormProposta.tsx`.
- Create `apps/cms/src/app/(painel)/crm/ConteudoProposta.tsx`.
- Modify `CLAUDE.md`, `apps/cms/src/app/(painel)/painel.css`.

---

### Task 1: Versionar o modelo e isolar os tokens

**Files:** Create `docs/prototipos/proposta-modelo-v1.html`, `apps/cms/src/lib/documentoProposta/tokens.ts`, `tokens.test.ts`

**Produces:**
```ts
export const PALETA_PROPOSTA: Readonly<Record<string, string>>
export function cssVariaveisProposta(): string
export function cssBaseProposta(): string
```

- [ ] **Step 1: Copiar o modelo**

```bash
cp "/Users/joao/Documents/portal-ntc-conteudos/ MODELO PROPOSTA.html" docs/prototipos/proposta-modelo-v1.html
```
Se não estiver nesse caminho: `find /Users/joao/Documents -maxdepth 3 -iname "*MODELO*PROPOSTA*"`. **Se não existir, parar e relatar** — sem ele nada pode ser transcrito fielmente.

- [ ] **Step 2: Teste**

```ts
// apps/cms/src/lib/documentoProposta/tokens.test.ts
import { describe, expect, it } from "vitest";

import { cssBaseProposta, cssVariaveisProposta, PALETA_PROPOSTA } from "./tokens";

describe("PALETA_PROPOSTA", () => {
  it("usa as cores do modelo", () => {
    expect(PALETA_PROPOSTA.navy).toBe("#0E2A47");
    expect(PALETA_PROPOSTA.gold).toBe("#B68B40");
    expect(PALETA_PROPOSTA.offwhite).toBe("#F5EDD8");
  });

  it("não contém nenhum hex da paleta Soberana", () => {
    const hexes = Object.values(PALETA_PROPOSTA).map((h) => h.toUpperCase());
    expect(hexes).not.toContain("#11365E");
    expect(hexes).not.toContain("#B5995A");
    expect(hexes).not.toContain("#F4EFE6");
  });
});

describe("cssVariaveisProposta", () => {
  it("declara todas as variáveis em :root", () => {
    const css = cssVariaveisProposta();
    for (const valor of Object.values(PALETA_PROPOSTA)) expect(css).toContain(valor);
    expect(css).toContain(":root");
  });
});

describe("cssBaseProposta", () => {
  it("não traz fonte externa", () => expect(cssBaseProposta()).not.toContain("fonts.googleapis"));
  it("não usa margin boxes, que o Chromium ignora", () => {
    const css = cssBaseProposta();
    expect(css).not.toContain("@top-left");
    expect(css).not.toContain("@bottom-right");
  });
});
```

- [ ] **Step 3: RED** — `pnpm --filter @ntc/cms test -- tokens`.
- [ ] **Step 4: Implementar** — as 10 chaves do `:root` do modelo; `cssBaseProposta` transcreve reset, tipografia e classes de layout, **sem** `<link>` de fonte e **sem** `@page`. Comentário no topo registrando a exceção ao §3 e o porquê.
- [ ] **Step 5: GREEN** (5 testes). **Commit** — `feat(crm): versiona o modelo da proposta e isola a paleta do documento`

---

### Task 2: Campos nas coleções

**Files:** Modify `apps/cms/src/collections/Propostas.ts`, `Programas.ts`, `packages/types/src/payload-types.ts`

- [ ] **Step 1: `Propostas.ts`** — depois de `observacoes`:

```ts
    { name: "textoApresentacao", type: "richText" },
    { name: "textoContexto", type: "richText" },
    { name: "textoObjetivos", type: "richText" },
    { name: "textoPublicoAlvo", type: "richText" },
    { name: "textoMetodologia", type: "richText" },
    { name: "textoEventon", type: "richText" },
    { name: "textoCertificacaoReplay", type: "richText" },
    { name: "textoCancelamento", type: "richText" },
    { name: "textoProtecaoConteudo", type: "richText" },
    { name: "textoFundamentacaoLegal", type: "richText" },
    { name: "textoProximosPassos", type: "richText" },
    { name: "textoFechamento", type: "richText" },
    {
      name: "eixos",
      type: "array",
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
      ],
    },
    {
      name: "diferenciais",
      type: "array",
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
      ],
    },
    { name: "resultados", type: "array", fields: [{ name: "texto", type: "textarea" }] },
    {
      name: "docentes",
      type: "array",
      admin: { description: "Escolher da coleção preenche nome e credencial; entrada livre é permitida." },
      fields: [
        { name: "especialista", type: "relationship", relationTo: "especialistas" },
        { name: "nome", type: "text" },
        { name: "credencial", type: "textarea" },
        { name: "eixo", type: "text" },
      ],
    },
    {
      name: "modulosDetalhados",
      type: "array",
      fields: [
        { name: "modulo", type: "relationship", relationTo: "modulos" },
        { name: "tituloExibido", type: "text" },
        { name: "ementa", type: "richText" },
      ],
    },
    {
      name: "secoesExtras",
      type: "array",
      admin: { description: "Seções livres do documento (observações, anexos textuais)." },
      fields: [
        { name: "titulo", type: "text" },
        { name: "corpo", type: "richText" },
        {
          name: "posicao",
          type: "select",
          defaultValue: "fim",
          options: [
            { label: "Antes do Quadro Comercial", value: "antes-quadro-comercial" },
            { label: "Depois das Condições Comerciais", value: "apos-condicoes-comerciais" },
            { label: "No fim, antes do Fechamento", value: "fim" },
          ],
        },
      ],
    },
```

Nenhum `required` — ver Global Constraints.

- [ ] **Step 2: `Programas.ts`** — `{ name: "metodologia", type: "richText" }` ao lado de `visaoGeral`/`problema`/`objetivo`.
- [ ] **Step 3:** `pnpm --filter @ntc/cms payload:generate`; commitar `payload-types.ts`.
- [ ] **Step 4:** `pnpm lint`, `pnpm typecheck`, `pnpm --filter @ntc/cms test`. **Não rodar `payload:push:schema`.**
- [ ] **Step 5: Commit** — `feat(crm): campos de conteudo do documento na proposta`

---

### Task 3: Textos institucionais padrão

**Files:** Create `packages/lib/src/crm/textosProposta.ts`, `textosProposta.test.ts`; Modify `packages/lib/src/index.ts`

**Produces:**
```ts
export interface ContextoTextosProposta {
  clienteOrgao: string; clienteSigla: string; programaSigla: string;
  modalidade: string; replay: string; numModulos: number;
}
export type ChaveTextoInstitucional =
  | "eventon" | "certificacaoReplay" | "cancelamento"
  | "protecaoConteudo" | "fundamentacaoLegal" | "proximosPassos" | "fechamento";
export function textosPadraoProposta(c: ContextoTextosProposta): Record<ChaveTextoInstitucional, string>;
```
Devolve **texto puro, parágrafos separados por `\n\n`**; a conversão para Lexical é da Task 6.

- [ ] **Step 1: Teste**

```ts
// packages/lib/src/crm/textosProposta.test.ts
import { describe, expect, it } from "vitest";

import { textosPadraoProposta, type ContextoTextosProposta } from "./textosProposta";

const CTX: ContextoTextosProposta = {
  clienteOrgao: "Secretaria Municipal de Educação de Palmas",
  clienteSigla: "SEMED-Palmas", programaSigla: "EDUTEC",
  modalidade: "Online ao vivo · EventON NTC", replay: "180 dias", numModulos: 3,
};

describe("textosPadraoProposta", () => {
  it("devolve as 7 chaves, todas preenchidas", () => {
    const t = textosPadraoProposta(CTX);
    const chaves = ["eventon", "certificacaoReplay", "cancelamento", "protecaoConteudo", "fundamentacaoLegal", "proximosPassos", "fechamento"] as const;
    expect(Object.keys(t).sort()).toEqual([...chaves].sort());
    for (const c of chaves) expect(t[c].length).toBeGreaterThan(80);
  });

  it("interpola órgão e sigla do cliente", () => {
    const t = textosPadraoProposta(CTX);
    expect(t.fechamento).toContain("Secretaria Municipal de Educação de Palmas");
    expect(t.proximosPassos).toContain("SEMED-Palmas");
  });

  it("interpola o replay", () => {
    expect(textosPadraoProposta(CTX).certificacaoReplay).toContain("180 dias");
  });

  it("não deixa marcador sem substituir", () => {
    for (const texto of Object.values(textosPadraoProposta(CTX))) {
      expect(texto).not.toMatch(/\{\{|\}\}|\$\{/);
    }
  });

  it("separa parágrafos por linha em branco", () => {
    expect(textosPadraoProposta(CTX).eventon).toContain("\n\n");
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Transcrever** as seções **17 a 23** de `docs/prototipos/proposta-modelo-v1.html`, substituindo só o que varia. **Não reescrever, não resumir, não "melhorar"** (§5.3). Frase que não dê para parametrizar sem reescrever fica literal, e vai no report. · **Step 4: GREEN** (5 testes) · **Step 5:** exportar no `index.ts`.
- [ ] **Step 6: Commit** — `feat(crm): textos institucionais padrao, transcritos do modelo`

---

### Task 4: Montagem e numeração

**Files:** Create `apps/cms/src/lib/documentoProposta/montar.ts`, `montar.test.ts`

**Produces:**
```ts
export type PosicaoExtra = "antes-quadro-comercial" | "apos-condicoes-comerciais" | "fim";
export interface SecaoDocumento { chave: string; titulo: string; corpoHtml: string }
export interface SecaoExtra { titulo: string; corpoHtml: string; posicao: PosicaoExtra }
export interface SecaoNumerada extends SecaoDocumento { numero: number }
export interface ResultadoMontagem { secoes: SecaoNumerada[]; omitidas: string[] }
export function montarSecoes(base: SecaoDocumento[], extras: SecaoExtra[]): ResultadoMontagem;
```
Descarta corpo vazio (registrando a `chave` em `omitidas`), intercala as extras e numera **a partir de 3**. Âncoras: `antes-quadro-comercial` imediatamente antes da chave `quadro-comercial`; `apos-condicoes-comerciais` logo após `condicoes-comerciais`; `fim` logo antes de `fechamento`. Âncora ausente → a extra vai para o fim.

- [ ] **Step 1: Teste**

```ts
// apps/cms/src/lib/documentoProposta/montar.test.ts
import { describe, expect, it } from "vitest";

import { montarSecoes, type SecaoDocumento, type SecaoExtra } from "./montar";

const base: SecaoDocumento[] = [
  { chave: "identificacao", titulo: "Dados de Identificação", corpoHtml: "<p>a</p>" },
  { chave: "quadro-comercial", titulo: "Quadro Comercial", corpoHtml: "<p>b</p>" },
  { chave: "condicoes-comerciais", titulo: "Condições Comerciais", corpoHtml: "<p>c</p>" },
  { chave: "fechamento", titulo: "Fechamento Institucional", corpoHtml: "<p>d</p>" },
];

describe("montarSecoes", () => {
  it("numera a partir de 3, como o modelo", () => {
    const r = montarSecoes(base, []);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
    expect(r.omitidas).toEqual([]);
  });

  it("omite corpo vazio e fecha a numeração sem buraco", () => {
    const r = montarSecoes([base[0]!, { chave: "docentes", titulo: "Corpo Docente", corpoHtml: "" }, ...base.slice(1)], []);
    expect(r.secoes.map((s) => s.chave)).toEqual(["identificacao", "quadro-comercial", "condicoes-comerciais", "fechamento"]);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
    expect(r.omitidas).toEqual(["docentes"]);
  });

  it("insere antes do Quadro Comercial", () => {
    const extra: SecaoExtra = { titulo: "Observação", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" };
    expect(montarSecoes(base, [extra]).secoes.map((s) => s.titulo)).toEqual([
      "Dados de Identificação", "Observação", "Quadro Comercial", "Condições Comerciais", "Fechamento Institucional",
    ]);
  });

  it("insere depois das Condições Comerciais", () => {
    const r = montarSecoes(base, [{ titulo: "Anexo", corpoHtml: "<p>x</p>", posicao: "apos-condicoes-comerciais" }]);
    expect(r.secoes.map((s) => s.titulo)[3]).toBe("Anexo");
  });

  it("'fim' entra antes do Fechamento", () => {
    const t = montarSecoes(base, [{ titulo: "Nota final", corpoHtml: "<p>x</p>", posicao: "fim" }]).secoes.map((s) => s.titulo);
    expect(t[t.length - 2]).toBe("Nota final");
    expect(t[t.length - 1]).toBe("Fechamento Institucional");
  });

  it("duas extras na mesma posição mantêm a ordem de cadastro", () => {
    const t = montarSecoes(base, [
      { titulo: "Primeira", corpoHtml: "<p>1</p>", posicao: "fim" },
      { titulo: "Segunda", corpoHtml: "<p>2</p>", posicao: "fim" },
    ]).secoes.map((s) => s.titulo);
    expect(t.indexOf("Primeira")).toBeLessThan(t.indexOf("Segunda"));
  });

  it("extra com âncora omitida cai para o fim", () => {
    const semQuadro = base.filter((s) => s.chave !== "quadro-comercial");
    const t = montarSecoes(semQuadro, [{ titulo: "Órfã", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" }]).secoes.map((s) => s.titulo);
    expect(t[t.length - 2]).toBe("Órfã");
  });

  it("extra de corpo vazio é descartada", () => {
    expect(montarSecoes(base, [{ titulo: "Vazia", corpoHtml: "", posicao: "fim" }]).secoes.map((s) => s.titulo)).not.toContain("Vazia");
  });

  it("lista vazia não quebra", () => {
    expect(montarSecoes([], [])).toEqual({ secoes: [], omitidas: [] });
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** (9 testes) · **Step 5: Commit** — `feat(crm): montagem e numeracao das secoes do documento`

---

### Task 5: Quadro Comercial — regra pura

**Files:** Create `packages/lib/src/crm/quadroComercial.ts`, `quadroComercial.test.ts`; Modify `packages/lib/src/index.ts`

**Produces:**
```ts
export interface LinhaQuadro { codigo: string; titulo: string; cargaHoraria: string; pagantes: number; cortesias: number; valorUnitarioLiquido: number; subtotal: number }
export interface EntradaQuadro {
  modulos: { numero: number; titulo: string; cargaHoraria: string | null }[];
  qtdPagantes: number; cortesias: number; valorLiquido: number;
}
export function divisaoExata(total: number, partes: number): boolean;
export function linhasDoQuadro(e: EntradaQuadro): LinhaQuadro[];
```
`linhasDoQuadro` devolve `[]` quando não há módulos ou a divisão não é exata — o documento então omite a tabela por módulo e mantém o resumo financeiro.

- [ ] **Step 1: Teste**

```ts
// packages/lib/src/crm/quadroComercial.test.ts
import { describe, expect, it } from "vitest";

import { divisaoExata, linhasDoQuadro, type EntradaQuadro } from "./quadroComercial";

const E: EntradaQuadro = {
  modulos: [
    { numero: 1, titulo: "Cultura Digital", cargaHoraria: "8h" },
    { numero: 2, titulo: "Fluência Digital", cargaHoraria: "8h" },
    { numero: 4, titulo: "Currículo e Computação", cargaHoraria: "8h" },
  ],
  qtdPagantes: 1800, cortesias: 180, valorLiquido: 1710126,
};

describe("divisaoExata", () => {
  it("aceita múltiplo, recusa resto", () => {
    expect(divisaoExata(1800, 3)).toBe(true);
    expect(divisaoExata(1700, 3)).toBe(false);
  });
  it("zero partes é falso, nunca divisão por zero", () => expect(divisaoExata(1800, 0)).toBe(false));
  it("total zero é exato", () => expect(divisaoExata(0, 3)).toBe(true));
});

describe("linhasDoQuadro", () => {
  it("divide igualmente entre os módulos", () => {
    const l = linhasDoQuadro(E);
    expect(l.map((x) => x.pagantes)).toEqual([600, 600, 600]);
    expect(l.map((x) => x.cortesias)).toEqual([60, 60, 60]);
  });
  it("código com dois dígitos, como o modelo", () => {
    expect(linhasDoQuadro(E).map((x) => x.codigo)).toEqual(["M01", "M02", "M04"]);
  });
  it("unitário líquido é o líquido sobre os pagantes", () => {
    expect(linhasDoQuadro(E)[0]!.valorUnitarioLiquido).toBeCloseTo(950.07, 2);
  });
  it("subtotal é unitário vezes pagantes da linha", () => {
    expect(linhasDoQuadro(E)[0]!.subtotal).toBeCloseTo(570042, 0);
  });
  it("sem módulos devolve vazio", () => expect(linhasDoQuadro({ ...E, modulos: [] })).toEqual([]));
  it("divisão não exata devolve vazio", () => expect(linhasDoQuadro({ ...E, qtdPagantes: 1700 })).toEqual([]));
  it("carga horária ausente vira travessão", () => {
    const l = linhasDoQuadro({ ...E, modulos: [{ numero: 1, titulo: "X", cargaHoraria: null }], qtdPagantes: 600, cortesias: 60 });
    expect(l[0]!.cargaHoraria).toBe("—");
  });
  it("zero pagantes não divide por zero", () => {
    const l = linhasDoQuadro({ ...E, qtdPagantes: 0, cortesias: 0, valorLiquido: 0 });
    expect(l.every((x) => Number.isFinite(x.valorUnitarioLiquido))).toBe(true);
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** (11 testes) · **Step 5:** exportar no `index.ts`. **Commit** — `feat(crm): regra pura do quadro comercial por modulo`

---

### Task 6: Composição do conteúdo inicial

**Files:** Create `packages/lib/src/crm/conteudoProposta.ts`, `conteudoProposta.test.ts`; Modify `packages/lib/src/index.ts`

**Consumes:** `textosPadraoProposta` (T3).
**Produces:**
```ts
export interface ProgramaParaConteudo {
  eixos: { titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  resultados: string[];
}
export interface ModuloParaConteudo { id: string; titulo: string }
export interface ConteudoInicialProposta {
  eixos: { titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  resultados: { texto: string }[];
  modulosDetalhados: { modulo: string; tituloExibido: string }[];
  textos: Record<ChaveTextoInstitucional, string>;
}
export function conteudoInicialProposta(p: {
  programa: ProgramaParaConteudo | null;
  modulos: ModuloParaConteudo[];
  contextoTextos: ContextoTextosProposta;
}): ConteudoInicialProposta;
```

Os cinco campos de texto que vêm do programa (`textoApresentacao`, `textoContexto`, `textoObjetivos`, `textoPublicoAlvo`, `textoMetodologia`) são documentos Lexical copiados tal e qual — **não passam por aqui**, porque esta função é pura e não conhece Lexical. A cópia deles é feita na escrita (T11), que já tem os documentos em mãos.

- [ ] **Step 1: Teste**

```ts
// packages/lib/src/crm/conteudoProposta.test.ts
import { describe, expect, it } from "vitest";

import { conteudoInicialProposta } from "./conteudoProposta";
import type { ContextoTextosProposta } from "./textosProposta";

const CTX: ContextoTextosProposta = {
  clienteOrgao: "SME de Palmas", clienteSigla: "SEMED", programaSigla: "EDUTEC",
  modalidade: "Online", replay: "180 dias", numModulos: 2,
};
const PROGRAMA = {
  eixos: [{ titulo: "E1", descricao: "d1" }],
  diferenciais: [{ titulo: "D1", descricao: "dd1" }],
  resultados: ["R1", "R2"],
};
const MODULOS = [{ id: "9", titulo: "Módulo um" }, { id: "10", titulo: "Módulo dois" }];

describe("conteudoInicialProposta", () => {
  it("copia eixos e diferenciais do programa", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.eixos).toEqual([{ titulo: "E1", descricao: "d1" }]);
    expect(c.diferenciais).toEqual([{ titulo: "D1", descricao: "dd1" }]);
  });

  it("resultados viram itens com a chave texto", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.resultados).toEqual([{ texto: "R1" }, { texto: "R2" }]);
  });

  it("um item por módulo escolhido, com o título do catálogo", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.modulosDetalhados).toEqual([
      { modulo: "9", tituloExibido: "Módulo um" },
      { modulo: "10", tituloExibido: "Módulo dois" },
    ]);
  });

  it("traz os 7 textos institucionais", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(Object.keys(c.textos)).toHaveLength(7);
    expect(c.textos.fechamento).toContain("SME de Palmas");
  });

  it("sem programa, as listas nascem vazias e os textos continuam", () => {
    const c = conteudoInicialProposta({ programa: null, modulos: [], contextoTextos: CTX });
    expect(c.eixos).toEqual([]);
    expect(c.diferenciais).toEqual([]);
    expect(c.resultados).toEqual([]);
    expect(c.modulosDetalhados).toEqual([]);
    expect(Object.keys(c.textos)).toHaveLength(7);
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** (5 testes) · **Step 5:** exportar. **Commit** — `feat(crm): composicao do conteudo inicial da proposta`

---

### Task 7: Leitura — `dados.ts`

**Files:** Modify `apps/cms/src/lib/documentoProposta/dados.ts`; Create/estender `dados.test.ts`

**Produces:** `DadosDocumentoProposta` ganha:
```ts
  subtitulo: string;
  cargaHorariaTotalModulos: string;      // "24h · 3 módulos · 8h por módulo"
  conteudoHtml: {                         // da PRÓPRIA proposta, já Lexical→HTML
    apresentacao: string; contexto: string; objetivos: string; publicoAlvo: string; metodologia: string;
    eventon: string; certificacaoReplay: string; cancelamento: string;
    protecaoConteudo: string; fundamentacaoLegal: string; proximosPassos: string; fechamento: string;
  };
  eixos: { titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  resultados: string[];
  docentes: { nome: string; credencial: string; eixo: string }[];
  modulosDetalhados: { codigo: string; titulo: string; cargaHoraria: string | null; ementaHtml: string }[];
  secoesExtras: { titulo: string; corpoHtml: string; posicao: PosicaoExtra }[];
```

Conversão Lexical→HTML com `lexicalToHtml` de `apps/cms/src/lib/cms/lexical.ts`. Campo vazio vira `""` — é o que faz a seção ser omitida. **O programa não é mais lido para o conteúdo**; só para a sigla na capa e no cabeçalho.

`docentes`: quando há `especialista` vinculado, `nome`/`credencial` vêm da ficha; senão, dos campos livres.

- [ ] **Step 1: Teste** (mock de `obterPayload`, padrão de `painelCrmEscrita.lead.test.ts`): proposta sem conteúdo devolve todas as chaves de `conteudoHtml` como `""` e as listas vazias; `cargaHorariaTotalModulos` com 3 módulos de "8h" vira `"24h · 3 módulos · 8h por módulo"`; cargas diferentes caem para `"3 módulos"`, sem inventar total; docente com especialista vinculado usa o nome da ficha, e sem vínculo usa o campo livre.
- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** · **Step 5: Commit** — `feat(crm): leitura do conteudo do documento a partir da propria proposta`

---

### Task 8: Capa e Resumo Executivo

**Files:** Create `apps/cms/src/lib/documentoProposta/capa.ts`, `capa.test.ts`

**Produces:**
```ts
export function subtituloProposta(tipo: string, numModulos: number, programaSigla: string): string;
export function montarCapa(d: DadosDocumentoProposta): string;
export function montarResumoExecutivo(d: DadosDocumentoProposta): string;
```

- [ ] **Step 1: Teste**

```ts
describe("subtituloProposta", () => {
  it("trilha completa", () => expect(subtituloProposta("programa-completo", 8, "EDUTEC")).toBe("Trilha Completa · EDUTEC"));
  it("combo por extenso", () => expect(subtituloProposta("modulo-avulso", 3, "EDUTEC")).toBe("Combo de Três Módulos · EDUTEC"));
  it("módulo único", () => expect(subtituloProposta("modulo-avulso", 1, "EDUTEC")).toBe("Módulo Avulso · EDUTEC"));
  it("sem módulos, só o programa", () => expect(subtituloProposta("customizada", 0, "EDUTEC")).toBe("EDUTEC"));
  it("acima de dez volta ao algarismo", () => expect(subtituloProposta("modulo-avulso", 12, "EDUTEC")).toBe("Combo de 12 Módulos · EDUTEC"));
});
```
Por extenso de dois a dez; acima disso, algarismo.

- [ ] **Step 2: RED** · **Step 3: Implementar** transcrevendo o layout do modelo versionado · **Step 4: GREEN** (5 testes) · **Step 5: Commit** — `feat(crm): capa e resumo executivo do documento`

---

### Task 9: Seções comerciais

**Files:** Create `apps/cms/src/lib/documentoProposta/secoes/comercial.ts`, `comercial.test.ts`

**Consumes:** `linhasDoQuadro` (T5), `SecaoDocumento` (T4).
**Produces:** `secoesComerciais(d: DadosDocumentoProposta): SecaoDocumento[]` — chaves `objeto`, `quadro-comercial`, `condicoes-comerciais`.

- [ ] **Step 1: Teste** — a tabela por módulo aparece com divisão exata e **não** aparece sem ela, mantendo o resumo financeiro; o resumo traz valor de tabela, valor com desconto, pagantes, cortesias, acessos totais, bruto, desconto e líquido; valores em reais **com centavos**, nunca arredondados para inteiro (achado da revisão da Fase B2).
- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** · **Step 5: Commit** — `feat(crm): secoes comerciais do documento`

---

### Task 10: Seções de conteúdo e montagem final

**Files:** Create `apps/cms/src/lib/documentoProposta/secoes/programa.ts`, `institucional.ts`, `institucional.test.ts`; Modify `html.ts`, `html.test.ts`

**Produces:**
```ts
export function secoesDeConteudo(d: DadosDocumentoProposta): SecaoDocumento[];     // programa.ts — 8 seções
export function secoesInstitucionais(d: DadosDocumentoProposta): SecaoDocumento[]; // institucional.ts — 7 seções
```

`secoesDeConteudo` monta Apresentação, Contexto, Objetivos, Público-alvo, Arquitetura (cartões a partir de `eixos`), Módulos Contratados (de `modulosDetalhados`), Metodologia, Corpo Docente (de `docentes`), Diferenciais (cartões) e Resultados (cartões) — tudo do conteúdo da proposta.

`secoesInstitucionais` **omite a de EventON** quando `d.modalidade` não é online; as outras seis valem para qualquer modalidade.

`html.ts` compõe: capa + Resumo Executivo + `montarSecoes([...secoesDeConteudo, ...secoesComerciais, ...secoesInstitucionais], d.secoesExtras)` na ordem do modelo, com o CSS de `tokens.ts`.

- [ ] **Step 1: Teste** (`institucional.test.ts`): modalidade online devolve 7 seções; "Presencial" devolve 6 sem a de EventON; "Híbrido" idem; texto vazio vira `corpoHtml: ""`.
- [ ] **Step 2: Teste** (`html.test.ts`, estendendo): documento com dados completos tem as 21 seções numeradas de 3 a 23; não contém `fonts.googleapis`; não contém `@top-left`; contém `#0E2A47` e **não** contém `#11365E`.
- [ ] **Step 3: RED** · **Step 4: Implementar** · **Step 5: GREEN** · **Step 6: Commit** — `feat(crm): secoes de conteudo e montagem final do documento`

---

### Task 11: Escrita — criar com conteúdo e validar múltiplos

**Files:** Modify `apps/cms/src/lib/cms/painelCrmEscrita.ts`, `painelCrmEscrita.propostas.test.ts`

**Comportamento:**
- `criarProposta` passa a gravar todo o conteúdo: os 5 textos do programa copiados como documento Lexical; os 7 institucionais de `conteudoInicialProposta` convertidos com `textoParaLexical` de `@/lib/lexicalBuilders`; as 3 listas; `modulosDetalhados` com a ementa de cada módulo do catálogo; `docentes` dos especialistas vinculados ao programa (hoje nenhum).
- `atualizarProposta`: módulo **acrescentado** ganha entrada em `modulosDetalhados` com título e ementa do catálogo **naquele momento**; módulo **removido** tem a entrada descartada. Entradas já existentes **não são sobrescritas** — a edição manual sobrevive.
- Ambas **recusam** quando `qtdPagantes` ou `cortesias` não é múltiplo do número de módulos: `"Pagantes e cortesias precisam ser múltiplos de <N> (número de módulos)."`, usando `divisaoExata`. Sem módulos, a regra não se aplica.

- [ ] **Step 1: Teste** — recusa múltiplo inválido sem tocar o banco; aceita sem módulos; `criarProposta` grava os 12 textos e as listas; módulo acrescentado entra em `modulosDetalhados` sem mexer nos existentes; módulo removido some.
- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** · **Step 5: Commit** — `feat(crm): criacao da proposta grava todo o conteudo do documento`

---

### Task 12: Restaurar conteúdo padrão

**Files:** Modify `apps/cms/src/lib/cms/painelCrmEscrita.ts` (+ teste), `apps/cms/src/app/(painel)/acoesCrm.ts`

**Produces:**
```ts
export type AlvoRestauracao = "tudo" | ChaveTextoInstitucional | "apresentacao" | "contexto"
  | "objetivos" | "publicoAlvo" | "metodologia" | "eixos" | "diferenciais" | "resultados" | "modulos";
export async function restaurarConteudoProposta(id: string, alvo: AlvoRestauracao, usuario: UsuarioAutenticado): Promise<ResultadoEscrita>;
```
Recalcula a partir do estado atual (programa vinculado, cliente, módulos) e grava **só o alvo**. `"tudo"` recalcula todos.

- [ ] **Step 1: Teste** — restaurar `"fechamento"` grava só esse campo e não toca nos outros 11 nem nas listas; restaurar `"eixos"` grava só a lista; `"tudo"` grava todos; proposta sem programa restaura os institucionais e deixa as listas vazias, sem erro.
- [ ] **Step 2: RED** · **Step 3: Implementar** a escrita e a Server Action (`obterUsuarioAutenticado` → `RECUSADO`; `revalidatePath("/crm")` no sucesso) · **Step 4: GREEN** · **Step 5: Commit** — `feat(crm): restaurar conteudo padrao da proposta, por secao ou inteiro`

---

### Task 13: Tela — o conteúdo no detalhe da proposta

**Files:** Create `apps/cms/src/app/(painel)/crm/ConteudoProposta.tsx`; Modify `DetalheProposta.tsx`, `FormProposta.tsx`, `painel.css`

**Comportamento:**
- `DetalheProposta` ganha o bloco **"Conteúdo do documento"**: um `<details>` por seção (mesmo idiom nativo de `EventosDoCliente`, Sessão 4), na ordem do documento. Cada um mostra o conteúdo atual, permite editar e tem **"Restaurar padrão"** com confirmação em dois cliques e o aviso **"Isso sobrescreve o que você editou nesta seção."**
- Textos em `CampoArea`; listas com editor de itens (adicionar, remover, reordenar não é necessário nesta sessão); `docentes` com seletor de especialista **e** campos livres; `secoesExtras` com título, corpo e posição.
- Botão **"Restaurar tudo"** no cabeçalho do bloco, com o mesmo padrão de confirmação.
- `FormProposta` **não muda** — a criação segue pedindo só lead, cliente, programa, tipo, módulos, valores e condições.
- a11y: cada `<details>` com `<summary>` clicável por teclado; todo campo com `<label>`; botões reais.
- CSS no bloco `/* ===== CRM Kanban ===== */` de `painel.css`, com as variáveis existentes.

- [ ] **Step 1: Implementar** · **Step 2:** `pnpm lint`, `pnpm typecheck`, `pnpm --filter @ntc/cms test` · **Step 3: Commit** — `feat(crm): edicao do conteudo do documento no detalhe da proposta`

---

### Task 14: Docs, build e checkpoint

- [ ] **Step 1: `CLAUDE.md`** — entrada **v3.3**: documento de 23 seções; a proposta passando a guardar todo o conteúdo e o que isso implica (mudar o programa não atualiza proposta criada); os campos novos e que **o `push:schema` é pendência do PO**; a **exceção ao §3** da paleta, registrada como tal; seções omitidas em vez de vazias; só online nesta sessão; `maxDuration` a validar; a proposta de teste a recriar. Atualizar §19.2 e §19.3 (itens 4 e 14).
- [ ] **Step 2:** `pnpm build` com o dev parado; depois `rm -rf apps/cms/.next apps/web/.next`.
- [ ] **Step 3: Commit** — `docs: CLAUDE.md v3.3 — documento da proposta com conteudo proprio`
- [ ] **Step 4: Checkpoint visual (PO, dev no ar, depois do `push:schema`):** (1) criar uma proposta nova de EDUTEC com 3 módulos → abrir o detalhe → o bloco Conteúdo já vem preenchido em todas as seções; (2) Gerar PDF → conferir contra `docs/prototipos/proposta-modelo-v1.html`: capa, Resumo Executivo, numeração de 3 a 23, cabeçalho e rodapé em todas as páginas, cartões de Arquitetura/Diferenciais/Resultados; (3) editar um parágrafo da Apresentação → gerar de novo → a edição aparece; (4) "Restaurar padrão" naquela seção → aviso → confirmar → volta ao texto do programa, e as outras seções seguem como estavam; (5) acrescentar um docente à mão e outro escolhido da coleção → os dois saem na seção 12; (6) acrescentar uma seção extra em cada uma das 3 posições → conferir onde saem; (7) acrescentar um módulo → a ementa dele entra; remover → some; (8) trocar a modalidade para Presencial → a seção de EventON some, numeração fecha, a tela avisa; (9) tentar salvar com 1.700 pagantes e 3 módulos → recusa com o múltiplo esperado; (10) desktop 1440 / mobile 375 do detalhe.

---

## Self-review (feito ao escrever)

**Cobertura do spec:** §0.1 modelo versionado → T1. §0.2 proposta autossuficiente → T2 (campos), T6/T11 (pré-preenchimento), T7 (leitura da proposta), T13 (edição). §1 origem → T6, T10. §1.1 omissão → T4 (regra), T10 (uso). §2 capa e resumo → T8. §2.1 subtítulo → T8. §3 quadro e divisão → T5, T9, T11. §4.1–4.3 campos → T2. §4.4 como nasce → T6, T11. §4.5 restaurar → T12, T13. §5.1 tela → T13. §6 motor, fontes, `@page`, paleta, numeração → T1, T4, T10. §7 modalidade → T10. §8 testes → T1, T3–T12. §9 riscos → T14 e o checkpoint.

**Nomes entre tasks:** `PALETA_PROPOSTA`/`cssVariaveisProposta`/`cssBaseProposta` (T1) em T10. `ChaveTextoInstitucional`/`textosPadraoProposta`/`ContextoTextosProposta` (T3) em T6, T7, T11, T12. `SecaoDocumento`/`SecaoExtra`/`PosicaoExtra`/`montarSecoes` (T4) em T7, T9, T10. `divisaoExata`/`linhasDoQuadro` (T5) em T9, T11. `conteudoInicialProposta`/`ConteudoInicialProposta` (T6) em T11, T12. `DadosDocumentoProposta` estendido (T7) em T8–T10. `subtituloProposta` (T8) em T7. `restaurarConteudoProposta`/`AlvoRestauracao` (T12) em T13.

**Review Focus coberto:** (1) proposta incompleta → T7. (2) divisão não exata → T5, T9, T11. (3) extras órfãs/repetidas/vazias → T4, quatro testes. (4) restaurar sobrescrevendo → T12 (só o alvo) e T13 (o aviso). (5) módulo acrescentado ou removido depois → T11.

**Decisões embutidas:** a numeração começa em 3 porque o modelo numera assim; extra com âncora omitida cai para o fim em vez de sumir, para não perder texto escrito por alguém; `linhasDoQuadro` devolve vazio na divisão inexata e o formulário impede o caso de chegar lá; os 5 textos do programa são copiados como Lexical na escrita, não na função pura, que não conhece Lexical; `modulosDetalhados` existente nunca é sobrescrito por reedição, senão a edição manual morreria a cada save.
