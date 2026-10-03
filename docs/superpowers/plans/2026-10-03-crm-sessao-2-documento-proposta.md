# CRM Sessão 2 — Documento da proposta · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O PDF da proposta passa de capa + 3 seções para capa + Resumo Executivo + 21 seções numeradas, fiel ao modelo aprovado, com texto institucional editável por proposta e seções extras posicionáveis.

**Architecture:** O gerador é quebrado por responsabilidade — tokens visuais isolados num módulo, capa e Resumo Executivo num segundo, as seções em três módulos por origem (programa, comercial, institucional), e um montador puro que ordena, omite as vazias, intercala as extras e **numera pela posição final**. A leitura continua concentrada em `dados.ts`. Os 7 textos institucionais nascem de uma função pura versionada e são copiados para campos da proposta na criação.

**Tech Stack:** TypeScript strict (`noUncheckedIndexedAccess`) · Payload CMS 3.18 (postgres) · Playwright (Chromium headless) · Vitest · Next.js 15 · pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-10-03-crm-sessao-2-documento-proposta-design.md`

## Global Constraints

- CLAUDE.md tem precedência. §5.3: **nenhum texto institucional é redigido pelo agente** — tudo é transcrito do modelo versionado. §5.4: nenhuma dependência nova. §5.7: sem `any`, `@ts-ignore`, `eslint-disable`.
- **Paleta do modelo, à risca** — `--navy:#0E2A47`, `--navy-exec:#1E4474`, `--gold:#B68B40`, `--gold-light:#D6B070`, `--offwhite:#F5EDD8`, `--bg-suave:#FBF9F2`, `--ink:#3A3A3A`, `--ink-mid:#6B6B6B`, `--acento:#1E5B7B`, `--acento-claro:#3B8AB0`. É **exceção deliberada ao §3 do CLAUDE.md**, confinada a `tokens.ts`.
- **Descartar do modelo:** o `<link>` para Google Fonts (as fontes já estão em base64 em `fontsEmbutidas.ts`) e todo `@page { @top-* }` (Chromium não implementa margin boxes; cabeçalho e rodapé vão pelo `headerTemplate`/`footerTemplate` que `gerarPdfDeHtml` já usa).
- **Seção sem conteúdo é omitida**, nunca impressa vazia, e entra no relatório de geração.
- **Nada é inventado**: campo ausente vira omissão relatada.
- **NÃO rodar `payload:push:schema`** — é passo manual do PO (§14). A Task 2 só altera as coleções e roda `payload:generate`.
- `pnpm lint` (0 erros), `pnpm typecheck`, `pnpm test` verdes ao fim de cada task. `pnpm build` só na última.
- Commits em português, Conventional Commits, sem emoji; subject, linha em branco, e o trailer exato `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch: `feat/crm-sessao-2-documento` a partir da `main`, **depois** de `feat/cms-importar-programas` ser mergeada (o documento lê os programas importados).

## Review Focus

Classes de entrada que o spec implica e que precisam de teste no lugar certo:

1. **Proposta sem programa, sem módulos ou sem valores** — o documento não pode quebrar nem imprimir `undefined`/`NaN`; seções sem fonte são omitidas e relatadas. *(teste na Task 4)*
2. **Divisão não exata de pagantes/cortesias pelos módulos** — hoje nada impede `1700 ÷ 3`; a regra pura recusa e o formulário mostra o múltiplo esperado. *(teste nas Tasks 8 e 10)*
3. **Seção extra com posição repetida ou lista vazia** — duas extras na mesma posição mantêm a ordem de cadastro; nenhuma extra não altera a numeração. *(teste na Task 4)*
4. **Texto institucional editado pelo PO e depois "Restaurar padrão"** — a restauração sobrescreve, e isso tem de ser dito antes, não depois. *(teste na Task 10)*
5. **Modalidade presencial/híbrida** — o documento sai sem as seções de EventON, a numeração se fecha, e a tela avisa que o texto presencial não existe. *(teste na Task 9)*

---

## Estrutura de arquivos

- Create `docs/prototipos/proposta-modelo-v1.html` (cópia versionada do modelo).
- Create `apps/cms/src/lib/documentoProposta/tokens.ts` (+ `.test.ts`).
- Create `apps/cms/src/lib/documentoProposta/montar.ts` (+ `.test.ts`).
- Create `apps/cms/src/lib/documentoProposta/capa.ts`.
- Create `apps/cms/src/lib/documentoProposta/secoes/programa.ts`, `comercial.ts` (+ `.test.ts`), `institucional.ts`.
- Create `packages/lib/src/crm/textosProposta.ts` (+ `.test.ts`), `packages/lib/src/crm/quadroComercial.ts` (+ `.test.ts`).
- Modify `apps/cms/src/collections/Propostas.ts`, `Programas.ts`, `packages/types/src/payload-types.ts` (gerado).
- Modify `apps/cms/src/lib/documentoProposta/dados.ts` (+ `.test.ts`), `html.ts` (+ `.test.ts`).
- Modify `apps/cms/src/lib/cms/painelCrmEscrita.ts`, `apps/cms/src/app/(painel)/crm/FormProposta.tsx`, `DetalheProposta.tsx`, `apps/cms/src/app/(painel)/acoesCrm.ts`.
- Modify `CLAUDE.md`, `packages/lib/src/index.ts`.

---

### Task 1: Versionar o modelo e isolar os tokens

**Files:**
- Create: `docs/prototipos/proposta-modelo-v1.html`
- Create: `apps/cms/src/lib/documentoProposta/tokens.ts`, `tokens.test.ts`

**Interfaces (Produces):**
```ts
export const PALETA_PROPOSTA: Readonly<Record<string, string>>
export function cssVariaveisProposta(): string   // ":root{--navy:#0E2A47;…}"
export function cssBaseProposta(): string        // reset + tipografia + classes do modelo
```

- [ ] **Step 1: Copiar o modelo para dentro do repositório**

```bash
cp "/Users/joao/Documents/portal-ntc-conteudos/ MODELO PROPOSTA.html" docs/prototipos/proposta-modelo-v1.html
```
Se o arquivo não estiver nesse caminho, procurar com `find /Users/joao/Documents -maxdepth 3 -iname "*MODELO*PROPOSTA*"` e **parar e relatar** se não existir — sem ele nada nesta sessão pode ser transcrito fielmente.

- [ ] **Step 2: Escrever o teste**

```ts
// apps/cms/src/lib/documentoProposta/tokens.test.ts
import { describe, expect, it } from "vitest";

import { cssBaseProposta, cssVariaveisProposta, PALETA_PROPOSTA } from "./tokens";

describe("PALETA_PROPOSTA", () => {
  it("usa as cores do modelo, não as da Soberana", () => {
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
  it("declara todas as variáveis da paleta em :root", () => {
    const css = cssVariaveisProposta();
    for (const [nome, valor] of Object.entries(PALETA_PROPOSTA)) {
      expect(css).toContain(`--${nome}:${valor}`);
    }
  });
});

describe("cssBaseProposta", () => {
  it("não traz link para fonte externa", () => {
    expect(cssBaseProposta()).not.toContain("fonts.googleapis");
  });

  it("não usa margin boxes de paged media, que o Chromium ignora", () => {
    const css = cssBaseProposta();
    expect(css).not.toContain("@top-left");
    expect(css).not.toContain("@bottom-right");
  });
});
```

- [ ] **Step 3: RED** — `pnpm --filter @ntc/cms test -- tokens` falha por módulo inexistente.

- [ ] **Step 4: Implementar**

`PALETA_PROPOSTA` com as 10 chaves do `:root` do modelo (`navy`, `navy-exec` → `navyExec`, `gold`, `gold-light` → `goldLight`, `offwhite`, `bg-suave` → `bgSuave`, `ink`, `ink-mid` → `inkMid`, `acento`, `acento-claro` → `acentoClaro`; a variável CSS mantém o nome com hífen do modelo). `cssBaseProposta` transcreve do modelo versionado o reset, a tipografia e as classes de layout — **sem** o `<link>` de fonte e **sem** qualquer bloco `@page`. Comentário no topo do arquivo dizendo que esta é a exceção ao §3 do CLAUDE.md e por quê.

- [ ] **Step 5: GREEN** — `pnpm --filter @ntc/cms test -- tokens`, 5 testes.

- [ ] **Step 6: Commit** — `feat(crm): versiona o modelo da proposta e isola a paleta do documento`

---

### Task 2: Campos novos nas coleções

**Files:**
- Modify: `apps/cms/src/collections/Propostas.ts`, `apps/cms/src/collections/Programas.ts`
- Modify: `packages/types/src/payload-types.ts` (gerado)

**Interfaces (Produces):** os campos abaixo passam a existir nos tipos `Proposta` e `Programa`.

- [ ] **Step 1: `Propostas.ts`** — sete campos `richText` e o array, depois de `observacoes`:

```ts
    { name: "textoEventon", type: "richText" },
    { name: "textoCertificacaoReplay", type: "richText" },
    { name: "textoCancelamento", type: "richText" },
    { name: "textoProtecaoConteudo", type: "richText" },
    { name: "textoFundamentacaoLegal", type: "richText" },
    { name: "textoProximosPassos", type: "richText" },
    { name: "textoFechamento", type: "richText" },
    {
      name: "secoesExtras",
      type: "array",
      admin: { description: "Seções livres do documento (observações, anexos textuais)." },
      fields: [
        { name: "titulo", type: "text", required: true },
        { name: "corpo", type: "richText", required: true },
        {
          name: "posicao",
          type: "select",
          required: true,
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

Nenhum deles é `required` — `required: true` faria o adapter emitir `NOT NULL` (lição da Sessão 4, CLAUDE.md v3.1), e propostas antigas não têm esses textos.

- [ ] **Step 2: `Programas.ts`** — `{ name: "metodologia", type: "richText" }` no mesmo grupo de `visaoGeral`/`problema`/`objetivo`.

- [ ] **Step 3: Gerar tipos**

Run: `pnpm --filter @ntc/cms payload:generate`
Esperado: `packages/types/src/payload-types.ts` ganha os 8 campos. Commitar o arquivo gerado.

- [ ] **Step 4: Verificar** — `pnpm lint`, `pnpm typecheck`, `pnpm --filter @ntc/cms test`. **Não rodar `payload:push:schema`**: é do PO (§8 do spec).

- [ ] **Step 5: Commit** — `feat(crm): campos de texto institucional e secoes extras na proposta`

---

### Task 3: Textos institucionais padrão

**Files:**
- Create: `packages/lib/src/crm/textosProposta.ts`, `textosProposta.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces (Produces):**
```ts
export interface ContextoTextosProposta {
  clienteOrgao: string;
  clienteSigla: string;
  programaSigla: string;
  modalidade: string;
  replay: string;
  numModulos: number;
}
export type ChaveTextoProposta =
  | "eventon" | "certificacaoReplay" | "cancelamento"
  | "protecaoConteudo" | "fundamentacaoLegal" | "proximosPassos" | "fechamento";
export function textosPadraoProposta(c: ContextoTextosProposta): Record<ChaveTextoProposta, string>;
```

Devolve **texto puro com parágrafos separados por `\n\n`** — a conversão para Lexical acontece na escrita (Task 10), com o `textoParaLexical` que já existe em `apps/cms/src/lib/lexicalBuilders.ts`.

- [ ] **Step 1: Escrever o teste**

```ts
// packages/lib/src/crm/textosProposta.test.ts
import { describe, expect, it } from "vitest";

import { textosPadraoProposta, type ContextoTextosProposta } from "./textosProposta";

const CTX: ContextoTextosProposta = {
  clienteOrgao: "Secretaria Municipal de Educação de Palmas",
  clienteSigla: "SEMED-Palmas",
  programaSigla: "EDUTEC",
  modalidade: "Online ao vivo · EventON NTC",
  replay: "180 dias",
  numModulos: 3,
};

describe("textosPadraoProposta", () => {
  it("devolve as 7 chaves, todas preenchidas", () => {
    const t = textosPadraoProposta(CTX);
    const chaves = ["eventon", "certificacaoReplay", "cancelamento", "protecaoConteudo", "fundamentacaoLegal", "proximosPassos", "fechamento"] as const;
    expect(Object.keys(t).sort()).toEqual([...chaves].sort());
    for (const c of chaves) expect(t[c].length).toBeGreaterThan(80);
  });

  it("interpola o órgão e a sigla do cliente", () => {
    const t = textosPadraoProposta(CTX);
    expect(t.fechamento).toContain("Secretaria Municipal de Educação de Palmas");
    expect(t.proximosPassos).toContain("SEMED-Palmas");
  });

  it("interpola o replay nas condições de replay", () => {
    expect(textosPadraoProposta(CTX).certificacaoReplay).toContain("180 dias");
  });

  it("não deixa marcador de interpolação sem substituir", () => {
    const t = textosPadraoProposta(CTX);
    for (const texto of Object.values(t)) {
      expect(texto).not.toMatch(/\{\{|\}\}|\$\{/);
    }
  });

  it("separa parágrafos por linha em branco", () => {
    expect(textosPadraoProposta(CTX).eventon).toContain("\n\n");
  });
});
```

- [ ] **Step 2: RED** — `pnpm --filter @ntc/lib test -- textosProposta`.

- [ ] **Step 3: Implementar — transcrevendo, nunca redigindo**

Abrir `docs/prototipos/proposta-modelo-v1.html` (versionado na Task 1) e transcrever o texto das seções **17 a 23** para as 7 chaves, substituindo pelos valores do contexto só o que varia: nome e sigla do cliente, sigla do programa, modalidade, replay, número de módulos. **Não reescrever, não resumir, não "melhorar"** — §5.3 do CLAUDE.md. Se alguma frase do modelo não puder ser parametrizada sem reescrever, mantenha-a literal e relate no report.

- [ ] **Step 4: GREEN** — `pnpm --filter @ntc/lib test -- textosProposta`, 5 testes.

- [ ] **Step 5: Exportar** em `packages/lib/src/index.ts` (`textosPadraoProposta`, `ContextoTextosProposta`, `ChaveTextoProposta`).

- [ ] **Step 6: Commit** — `feat(crm): textos institucionais padrao da proposta, transcritos do modelo`

---

### Task 4: Montagem e numeração

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/montar.ts`, `montar.test.ts`

**Interfaces (Produces):**
```ts
export type PosicaoExtra = "antes-quadro-comercial" | "apos-condicoes-comerciais" | "fim";
export interface SecaoDocumento { chave: string; titulo: string; corpoHtml: string }
export interface SecaoExtra { titulo: string; corpoHtml: string; posicao: PosicaoExtra }
export interface SecaoNumerada extends SecaoDocumento { numero: number }
export interface ResultadoMontagem { secoes: SecaoNumerada[]; omitidas: string[] }
export function montarSecoes(base: SecaoDocumento[], extras: SecaoExtra[]): ResultadoMontagem;
```

`montarSecoes` descarta as de `corpoHtml` vazio (registrando a `chave` em `omitidas`), intercala as extras e numera **a partir de 3** — capa e Resumo Executivo não são numerados, e o modelo começa a numeração em "3 Dados de Identificação".

Posições de ancoragem: `antes-quadro-comercial` entra imediatamente antes da seção de chave `quadro-comercial`; `apos-condicoes-comerciais` logo depois de `condicoes-comerciais`; `fim` logo antes de `fechamento`. Se a âncora tiver sido omitida, a extra cai para o fim.

- [ ] **Step 1: Escrever o teste**

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

  it("omite seção de corpo vazio e fecha a numeração sem buraco", () => {
    const r = montarSecoes([...base.slice(0, 1), { chave: "docentes", titulo: "Corpo Docente", corpoHtml: "" }, ...base.slice(1)], []);
    expect(r.secoes.map((s) => s.chave)).toEqual(["identificacao", "quadro-comercial", "condicoes-comerciais", "fechamento"]);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
    expect(r.omitidas).toEqual(["docentes"]);
  });

  it("insere a extra antes do Quadro Comercial", () => {
    const extra: SecaoExtra = { titulo: "Observação", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" };
    const r = montarSecoes(base, [extra]);
    expect(r.secoes.map((s) => s.titulo)).toEqual([
      "Dados de Identificação", "Observação", "Quadro Comercial", "Condições Comerciais", "Fechamento Institucional",
    ]);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6, 7]);
  });

  it("insere a extra depois das Condições Comerciais", () => {
    const r = montarSecoes(base, [{ titulo: "Anexo", corpoHtml: "<p>x</p>", posicao: "apos-condicoes-comerciais" }]);
    expect(r.secoes.map((s) => s.titulo)[3]).toBe("Anexo");
  });

  it("insere a extra de posição 'fim' antes do Fechamento", () => {
    const r = montarSecoes(base, [{ titulo: "Nota final", corpoHtml: "<p>x</p>", posicao: "fim" }]);
    const titulos = r.secoes.map((s) => s.titulo);
    expect(titulos[titulos.length - 2]).toBe("Nota final");
    expect(titulos[titulos.length - 1]).toBe("Fechamento Institucional");
  });

  it("duas extras na mesma posição mantêm a ordem de cadastro", () => {
    const r = montarSecoes(base, [
      { titulo: "Primeira", corpoHtml: "<p>1</p>", posicao: "fim" },
      { titulo: "Segunda", corpoHtml: "<p>2</p>", posicao: "fim" },
    ]);
    const titulos = r.secoes.map((s) => s.titulo);
    expect(titulos.indexOf("Primeira")).toBeLessThan(titulos.indexOf("Segunda"));
  });

  it("sem extras, a numeração não muda", () => {
    expect(montarSecoes(base, []).secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
  });

  it("extra cuja âncora foi omitida cai para o fim", () => {
    const semQuadro = base.filter((s) => s.chave !== "quadro-comercial");
    const r = montarSecoes(semQuadro, [{ titulo: "Órfã", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" }]);
    const titulos = r.secoes.map((s) => s.titulo);
    expect(titulos[titulos.length - 2]).toBe("Órfã");
  });

  it("extra de corpo vazio é descartada", () => {
    const r = montarSecoes(base, [{ titulo: "Vazia", corpoHtml: "", posicao: "fim" }]);
    expect(r.secoes.map((s) => s.titulo)).not.toContain("Vazia");
  });

  it("lista base vazia devolve nada, sem quebrar", () => {
    expect(montarSecoes([], [])).toEqual({ secoes: [], omitidas: [] });
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** (`pnpm --filter @ntc/cms test -- montar`, 10 testes).

- [ ] **Step 5: Commit** — `feat(crm): montagem e numeracao das secoes do documento`

---

### Task 5: Quadro Comercial — regra pura

**Files:**
- Create: `packages/lib/src/crm/quadroComercial.ts`, `quadroComercial.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces (Produces):**
```ts
export interface LinhaQuadro { codigo: string; titulo: string; cargaHoraria: string; pagantes: number; cortesias: number; valorUnitarioLiquido: number; subtotal: number }
export interface EntradaQuadro {
  modulos: { numero: number; titulo: string; cargaHoraria: string | null }[];
  qtdPagantes: number; cortesias: number; valorLiquido: number;
}
export function divisaoExata(total: number, partes: number): boolean;
export function linhasDoQuadro(e: EntradaQuadro): LinhaQuadro[];
```

`divisaoExata` é a regra que o formulário usa para recusar (Task 10). `linhasDoQuadro` devolve `[]` quando não há módulos ou a divisão não é exata — o documento então omite a tabela por módulo e mantém só o resumo financeiro.

- [ ] **Step 1: Escrever o teste**

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
  it("aceita múltiplo e recusa o resto", () => {
    expect(divisaoExata(1800, 3)).toBe(true);
    expect(divisaoExata(1700, 3)).toBe(false);
  });
  it("zero partes é sempre falso, nunca divisão por zero", () => {
    expect(divisaoExata(1800, 0)).toBe(false);
  });
  it("total zero é exato", () => {
    expect(divisaoExata(0, 3)).toBe(true);
  });
});

describe("linhasDoQuadro", () => {
  it("divide pagantes e cortesias igualmente entre os módulos", () => {
    const l = linhasDoQuadro(E);
    expect(l).toHaveLength(3);
    expect(l.map((x) => x.pagantes)).toEqual([600, 600, 600]);
    expect(l.map((x) => x.cortesias)).toEqual([60, 60, 60]);
  });

  it("formata o código do módulo com dois dígitos, como o modelo", () => {
    expect(linhasDoQuadro(E).map((x) => x.codigo)).toEqual(["M01", "M02", "M04"]);
  });

  it("valor unitário líquido é o líquido dividido pelos pagantes", () => {
    expect(linhasDoQuadro(E)[0]!.valorUnitarioLiquido).toBeCloseTo(950.07, 2);
  });

  it("subtotal é o unitário líquido vezes os pagantes da linha", () => {
    expect(linhasDoQuadro(E)[0]!.subtotal).toBeCloseTo(570042, 0);
  });

  it("sem módulos devolve vazio", () => {
    expect(linhasDoQuadro({ ...E, modulos: [] })).toEqual([]);
  });

  it("divisão não exata devolve vazio, em vez de esconder o resto", () => {
    expect(linhasDoQuadro({ ...E, qtdPagantes: 1700 })).toEqual([]);
  });

  it("carga horária ausente vira travessão, nunca 'null'", () => {
    const l = linhasDoQuadro({ ...E, modulos: [{ numero: 1, titulo: "X", cargaHoraria: null }] , qtdPagantes: 600, cortesias: 60 });
    expect(l[0]!.cargaHoraria).toBe("—");
  });

  it("zero pagantes não divide por zero", () => {
    const l = linhasDoQuadro({ ...E, qtdPagantes: 0, cortesias: 0, valorLiquido: 0 });
    expect(l.every((x) => Number.isFinite(x.valorUnitarioLiquido))).toBe(true);
  });
});
```

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN** (`pnpm --filter @ntc/lib test -- quadroComercial`, 12 testes).

- [ ] **Step 5: Exportar** em `packages/lib/src/index.ts`. **Commit** — `feat(crm): regra pura do quadro comercial por modulo`

---

### Task 6: Leitura — `dados.ts`

**Files:**
- Modify: `apps/cms/src/lib/documentoProposta/dados.ts`
- Create: `apps/cms/src/lib/documentoProposta/dados.test.ts` (hoje existe; estender)

**Interfaces (Produces):** `DadosDocumentoProposta` ganha:
```ts
  subtitulo: string;                       // gerado (Task 7)
  clienteDirigenteCargo: string;
  programaId: string | null;
  cargaHorariaTotalModulos: string;        // "24h · 3 módulos · 8h por módulo"
  modulosDetalhados: { numero: number; titulo: string; cargaHoraria: string | null; ementaHtml: string }[];
  programaHtml: {                           // já convertido de Lexical para HTML
    visaoGeral: string; problema: string; objetivo: string; publicoAlvo: string;
    metodologia: string; diferenciais: string; resultados: string; eixos: string; docentes: string;
  };
  textosInstitucionais: Record<ChaveTextoProposta, string>;   // HTML; "" quando o campo está vazio
  secoesExtras: { titulo: string; corpoHtml: string; posicao: PosicaoExtra }[];
```

A conversão Lexical→HTML usa `lexicalToHtml` de `apps/cms/src/lib/cms/lexical.ts`. Campo ausente vira `""` — é o que faz a seção ser omitida na Task 4.

- [ ] **Step 1: Teste** — com `obterPayload` mockado (padrão de `painelCrmEscrita.lead.test.ts`): proposta sem programa devolve `programaHtml` com todas as chaves `""`; proposta sem módulos devolve `modulosDetalhados: []`; `cargaHorariaTotalModulos` com 3 módulos de "8h" vira `"24h · 3 módulos · 8h por módulo"`; módulos com cargas diferentes caem para `"3 módulos"` sem inventar total.

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN**

- [ ] **Step 5: Commit** — `feat(crm): leitura do programa, modulos e textos para o documento`

---

### Task 7: Capa e Resumo Executivo

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/capa.ts`, `capa.test.ts`

**Interfaces (Produces):**
```ts
export function subtituloProposta(tipo: string, numModulos: number, programaSigla: string): string;
export function montarCapa(d: DadosDocumentoProposta): string;
export function montarResumoExecutivo(d: DadosDocumentoProposta): string;
```

- [ ] **Step 1: Teste do subtítulo** (a única regra do bloco; o resto é layout, coberto pelo checkpoint visual):

```ts
describe("subtituloProposta", () => {
  it("trilha completa", () => expect(subtituloProposta("programa-completo", 8, "EDUTEC")).toBe("Trilha Completa · EDUTEC"));
  it("combo por extenso", () => expect(subtituloProposta("modulo-avulso", 3, "EDUTEC")).toBe("Combo de Três Módulos · EDUTEC"));
  it("módulo único", () => expect(subtituloProposta("modulo-avulso", 1, "EDUTEC")).toBe("Módulo Avulso · EDUTEC"));
  it("sem módulos, só o programa", () => expect(subtituloProposta("customizada", 0, "EDUTEC")).toBe("EDUTEC"));
  it("acima de dez volta ao algarismo", () => expect(subtituloProposta("modulo-avulso", 12, "EDUTEC")).toBe("Combo de 12 Módulos · EDUTEC"));
});
```

Números por extenso de dois a dez (`Dois`…`Dez`); acima disso, algarismo.

- [ ] **Step 2: RED** · **Step 3: Implementar** capa e Resumo Executivo transcrevendo o layout do modelo versionado · **Step 4: GREEN**

- [ ] **Step 5: Commit** — `feat(crm): capa e resumo executivo do documento da proposta`

---

### Task 8: Seções comerciais

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/secoes/comercial.ts`, `comercial.test.ts`

**Interfaces (Consumes):** `linhasDoQuadro` (Task 5), `SecaoDocumento` (Task 4).
**Produces:** `secoesComerciais(d: DadosDocumentoProposta): SecaoDocumento[]` — Objeto, Quadro Comercial, Condições Comerciais, nessa ordem, com as chaves `objeto`, `quadro-comercial`, `condicoes-comerciais`.

- [ ] **Step 1: Teste** — a tabela por módulo aparece quando a divisão é exata; **não** aparece (e o resumo financeiro continua) quando não é; o resumo traz valor de tabela, valor com desconto, pagantes, cortesias, acessos totais, bruto, desconto e líquido; valores em reais com centavos, nunca arredondados para inteiro (achado da revisão da Fase B2).

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN**

- [ ] **Step 5: Commit** — `feat(crm): secoes comerciais do documento`

---

### Task 9: Seções do programa, institucionais e modalidade

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/secoes/programa.ts`, `institucional.ts`, `institucional.test.ts`
- Modify: `apps/cms/src/lib/documentoProposta/html.ts` (+ `html.test.ts`)

**Produces:**
```ts
export function secoesDoPrograma(d: DadosDocumentoProposta): SecaoDocumento[];       // programa.ts — 9 seções
export function secoesInstitucionais(d: DadosDocumentoProposta): SecaoDocumento[];   // institucional.ts — 7 seções
```

`secoesInstitucionais` **omite a de EventON** quando `d.modalidade` não é online — e só ela; as outras seis valem para qualquer modalidade.

`html.ts` passa a compor: capa + Resumo Executivo + `montarSecoes([...secoesDoPrograma, ...secoesComerciais, ...secoesInstitucionais], d.secoesExtras)`, na ordem do modelo (as 21 seções), usando `tokens.ts` para o CSS.

- [ ] **Step 1: Teste** (`institucional.test.ts`): modalidade "Online ao vivo · EventON NTC" devolve 7 seções; "Presencial" devolve 6, sem a de EventON; "Híbrido" devolve 6; texto institucional vazio vira `corpoHtml: ""` (e a Task 4 omite).

- [ ] **Step 2: Teste** (`html.test.ts`, estendendo o existente): o documento tem as 21 seções numeradas de 3 a 23 com os dados completos; não contém `fonts.googleapis`; não contém `@top-left`; contém `#0E2A47` e **não** contém `#11365E`.

- [ ] **Step 3: RED** · **Step 4: Implementar** · **Step 5: GREEN**

- [ ] **Step 6: Commit** — `feat(crm): secoes do programa e institucionais, com a modalidade decidindo o EventON`

---

### Task 10: Formulário e escrita

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts` (+ `painelCrmEscrita.propostas.test.ts`)
- Modify: `apps/cms/src/app/(painel)/crm/FormProposta.tsx`, `DetalheProposta.tsx`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`

**Comportamento:**
- `criarProposta` passa a gravar os 7 textos, convertendo `textosPadraoProposta(contexto)` com `textoParaLexical` de `@/lib/lexicalBuilders`.
- `criarProposta` e `atualizarProposta` **recusam** quando `qtdPagantes` ou `cortesias` não é múltiplo do número de módulos: `"Pagantes e cortesias precisam ser múltiplos de <N> (número de módulos)."` — usa `divisaoExata` da Task 5. Sem módulos, a regra não se aplica.
- `restaurarTextosPadraoProposta(id, usuario)` — nova escrita e Server Action; recalcula os 7 a partir do estado atual.
- `DetalheProposta` ganha os 7 campos editáveis (`CampoArea` por enquanto; richText no painel é da Sessão 5), a lista de `secoesExtras` (adicionar/remover, com título, corpo e posição) e o botão **"Restaurar textos padrão"** com confirmação em dois cliques e o aviso **"Isso sobrescreve as edições manuais dos 7 textos."** antes de aplicar.

- [ ] **Step 1: Teste da escrita** — recusa múltiplo inválido sem tocar o banco; aceita quando não há módulos; `criarProposta` grava os 7 textos não vazios; `restaurarTextosPadraoProposta` sobrescreve os 7 e não toca em mais nada.

- [ ] **Step 2: RED** · **Step 3: Implementar** · **Step 4: GREEN**

- [ ] **Step 5: Commit** — `feat(crm): textos institucionais e secoes extras no formulario da proposta`

---

### Task 11: Docs, build e checkpoint

- [ ] **Step 1: `CLAUDE.md`** — entrada **v3.3**: o documento de 23 seções; os 8 campos novos e que **o `push:schema` é pendência do PO**; a **exceção ao §3** da paleta do modelo, registrada como tal (é a segunda exceção aceita, depois do painel admin); seções omitidas em vez de vazias; Corpo Docente dependendo do vínculo manual; só online nesta sessão; `maxDuration` a validar. Atualizar §19.2 (o bullet de Propostas) e §19.3 (item 4 e item 14).

- [ ] **Step 2: `pnpm build`** com o dev parado; depois `rm -rf apps/cms/.next apps/web/.next`.

- [ ] **Step 3: Commit** — `docs: CLAUDE.md v3.3 — documento da proposta com 23 secoes`

- [ ] **Step 4: Checkpoint visual (PO, dev no ar, depois do `push:schema`):** (1) abrir a proposta de teste `NTC-PROP-2026-EDUTEC-TO-SMETESTE-v01` → Gerar PDF → conferir contra `docs/prototipos/proposta-modelo-v1.html`: capa, Resumo Executivo, numeração de 3 a 23, cabeçalho e rodapé em todas as páginas; (2) conferir que a seção Corpo Docente **não** aparece (nenhum especialista vinculado) e que a numeração não tem buraco; (3) editar um dos 7 textos, gerar de novo, ver a edição no PDF; (4) "Restaurar textos padrão" → o aviso aparece → confirmar → o texto volta ao padrão; (5) acrescentar uma seção extra em cada uma das 3 posições e conferir onde saem; (6) trocar a modalidade para Presencial → a seção de EventON some e a tela avisa que o texto presencial não existe; (7) tentar salvar com 1.700 pagantes e 3 módulos → recusa com a mensagem do múltiplo; (8) desktop 1440 / mobile 375 do formulário e do detalhe.

---

## Self-review (feito ao escrever)

**Cobertura do spec:** §0.1 modelo versionado → T1. §1 origem das seções → T6 (leitura), T7–T9 (render). §1.1/§1.2 omissão → T4 (regra) e T9 (uso). §2 capa e resumo → T7. §2.1 subtítulo → T7. §3 quadro comercial e divisão → T5, T8, T10. §4.1/§4.2 campos → T2. §4.3 textos padrão e restauração → T3, T10. §5 motor, fontes, `@page`, paleta → T1, T9. §6 modalidade → T9. §7 testes → T1, T3–T10. §8 riscos → T11 (docs) e o checkpoint.

**Nomes entre tasks:** `PALETA_PROPOSTA`/`cssVariaveisProposta`/`cssBaseProposta` (T1) em T9. `textosPadraoProposta`/`ChaveTextoProposta` (T3) em T6, T10. `SecaoDocumento`/`SecaoExtra`/`montarSecoes`/`PosicaoExtra` (T4) em T6, T8, T9. `divisaoExata`/`linhasDoQuadro` (T5) em T8, T10. `DadosDocumentoProposta` estendido (T6) em T7–T9. `subtituloProposta` (T7) em T6 (que preenche `subtitulo`).

**Review Focus coberto:** (1) proposta incompleta → T6. (2) divisão não exata → T5 (regra), T8 (tabela some), T10 (formulário recusa). (3) extras repetidas/vazias/órfãs → T4, quatro testes. (4) restaurar sobrescrevendo → T10. (5) modalidade presencial → T9.

**Decisões embutidas:** a numeração começa em 3 porque o modelo numera assim (capa e Resumo Executivo ficam fora); extra cuja âncora foi omitida cai para o fim em vez de sumir; `linhasDoQuadro` devolve vazio na divisão inexata para a tabela sumir enquanto o resumo financeiro permanece — e o formulário é quem impede o caso de chegar lá; os 7 textos ficam em `CampoArea` nesta sessão porque editor richText no painel é escopo da Sessão 5.
