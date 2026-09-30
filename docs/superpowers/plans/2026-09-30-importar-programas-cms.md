# Importar o conteúdo editorial dos 15 programas para o CMS · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar o subconjunto editorial dos 15 programas (e seus módulos) dos arquivos estáticos do site para as coleções `programas`/`modulos` do Payload, publicado, para que o documento de proposta da Sessão 2 tenha o que ler.

**Architecture:** Dois passos desacoplados. Um script na raiz (`scripts/`) importa os `conteudo<SIGLA>.ts` do `apps/web` e emite um instantâneo JSON versionado em `apps/cms/src/seed/assets/programas.json`; um seed no `apps/cms` lê esse JSON e grava pela Local API. Assim o `apps/cms` nunca importa do `apps/web` em runtime — o `tsconfig` do cms resolve só `@/*`, `@ntc/lib` e `@ntc/types`. As regras (conversão HTML→Lexical, mapeamento, numeral romano) ficam em funções puras testadas, separadas do script que escreve no banco.

**Tech Stack:** TypeScript strict · Payload CMS 3.18 (postgres) · Vitest · Node 22 · pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-09-30-importar-programas-cms-design.md`

## Global Constraints

- CLAUDE.md tem precedência. §5.7: sem `any`, sem `@ts-ignore`, sem `eslint-disable`. §5.4: nenhuma dependência nova. §5.6: **as páginas de `/programas/[slug]` não são tocadas** — nenhum arquivo em `apps/web` é modificado por este plano.
- **Nada é inventado** (§5.3): o que não casar ou não estiver na origem vira linha de relatório, nunca texto gerado.
- O script de import é **idempotente** (chave `sigla` para programa, `(programa, numero)` para módulo) e roda em **dry-run por padrão**, aplicando só com `PROGRAMAS_IMPORTAR_APLICAR=1`.
- O import grava `_status: "published"` — o gerador do PDF lê a versão publicada (`payload.findByID` sem `draft: true`).
- **Não rodar** `payload:push:schema` (nenhuma coleção ou campo novo), `pnpm build` (exceto na última task, com o dev parado) nem `pnpm dev`.
- `pnpm lint` (0 erros), `pnpm typecheck` e `pnpm test` verdes ao fim de cada task.
- Commits em português, Conventional Commits, sem emoji; subject, linha em branco, e o trailer exato `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Branch: `feat/cms-importar-programas`, já criada a partir da `main` (`88d5eda`).

## Review Focus

Classes de entrada que o spec implica e que precisam de teste no lugar certo:

1. **Campo opcional ausente na origem** — `objetivoGeral`, `detalhamento`, `diferenciais` e `publico.chips` são opcionais no tipo `ConteudoPrograma`. O mapeador não pode quebrar nem gravar `undefined` num campo `required` do Payload. *(teste na Task 2)*
2. **HTML com tag fora do subconjunto** — `corpoHtml` traz `<div class="results-grid">`, `<span class="r-num">` e classes de apresentação. O conversor preserva o texto e **relata** a tag, sem silenciar e sem quebrar. *(teste na Task 1)*
3. **Numeral romano inesperado** — `numero` é romano ("I".."VIII"); um valor fora de I–XX, ou vazio, tem de virar erro relatado, não `NaN` gravado num campo `number`. *(teste na Task 2)*
4. **Programa cuja sigla não existe no CMS** — o instantâneo não pode criar programa: a lista canônica dos 15 é de `seed/programasShell.ts`. Sigla sem correspondência é erro relatado. *(teste na Task 4)*
5. **Reexecução do import** — rodar duas vezes não pode duplicar módulo nem criar programa novo; o segundo passe atualiza. *(teste na Task 4)*

---

## Estrutura de arquivos

- Create `apps/cms/src/lib/cms/htmlParaLexical.ts` (+ `.test.ts`) — conversor puro HTML→Lexical e extração dos cartões de resultados.
- Create `apps/cms/src/lib/cms/importacaoProgramas/tipos.ts` — a forma do instantâneo, compartilhada pelo gerador e pelo seed.
- Create `apps/cms/src/lib/cms/importacaoProgramas/mapear.ts` (+ `.test.ts`) — instantâneo → forma do Payload.
- Create `scripts/gerar-instantaneo-programas.mjs` — lê `apps/web/.../conteudo*.ts`, emite o JSON.
- Create `apps/cms/src/seed/assets/programas.json` — instantâneo versionado (gerado, revisado no diff).
- Create `apps/cms/src/seed/importarProgramas.ts` — o seed que escreve no banco.
- Modify `apps/cms/package.json` — script `programas:importar`.
- Modify `CLAUDE.md` — §19 e histórico.

---

### Task 1: Conversor HTML → Lexical

**Files:**
- Create: `apps/cms/src/lib/cms/htmlParaLexical.ts`
- Test: `apps/cms/src/lib/cms/htmlParaLexical.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
```ts
export interface DocumentoLexical { root: { type: "root"; format: ""; indent: 0; version: 1; direction: "ltr"; children: unknown[] } }
export interface ResultadoConversao { doc: DocumentoLexical; tagsIgnoradas: string[] }
export function htmlParaLexical(html: string): ResultadoConversao
export function textoParaLexical(texto: string): DocumentoLexical
export function extrairCartoesDeResultado(html: string): string[]
export function listaParaLexical(corpoHtml: string, itens: string[]): ResultadoConversao
```

O formato dos nós é o mesmo já usado em `apps/cms/src/seed/seedCorpoDocente.ts` (`richTextFromTexto`, linhas ~1050): `root` com `format: ""`, `indent: 0`, `version: 1`, `direction: "ltr"`, e nós de texto com `{ type: "text", format: 0, mode: "normal", style: "", text, version: 1, detail: 0 }`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// apps/cms/src/lib/cms/htmlParaLexical.test.ts
import { describe, expect, it } from "vitest";

import { extrairCartoesDeResultado, htmlParaLexical, listaParaLexical, textoParaLexical } from "./htmlParaLexical";

const textoDo = (doc: { root: { children: unknown[] } }): string =>
  JSON.stringify(doc.root.children).replace(/[^ -~À-ÿ]/g, "");

describe("htmlParaLexical", () => {
  it("converte parágrafos em nós de parágrafo", () => {
    const { doc, tagsIgnoradas } = htmlParaLexical("<p>Primeiro.</p><p>Segundo.</p>");
    expect(doc.root.children).toHaveLength(2);
    expect(tagsIgnoradas).toEqual([]);
    expect(textoDo(doc)).toContain("Primeiro.");
    expect(textoDo(doc)).toContain("Segundo.");
  });

  it("marca negrito e itálico no format do nó de texto", () => {
    const { doc } = htmlParaLexical("<p>a <strong>b</strong> <em>c</em></p>");
    const paragrafo = doc.root.children[0] as { children: { text: string; format: number }[] };
    expect(paragrafo.children.find((n) => n.text === "b")?.format).toBe(1);
    expect(paragrafo.children.find((n) => n.text === "c")?.format).toBe(2);
  });

  it("converte ul/li em lista Lexical", () => {
    const { doc } = htmlParaLexical("<ul><li>um</li><li>dois</li></ul>");
    const lista = doc.root.children[0] as { type: string; children: unknown[] };
    expect(lista.type).toBe("list");
    expect(lista.children).toHaveLength(2);
  });

  it("preserva o texto e relata a tag fora do subconjunto", () => {
    const { doc, tagsIgnoradas } = htmlParaLexical('<div class="results-grid"><p>Fica.</p></div>');
    expect(textoDo(doc)).toContain("Fica.");
    expect(tagsIgnoradas).toEqual(["div"]);
  });

  it("relata cada tag desconhecida uma vez só", () => {
    const { tagsIgnoradas } = htmlParaLexical("<section><p>a</p></section><section><p>b</p></section>");
    expect(tagsIgnoradas).toEqual(["section"]);
  });

  it("html vazio vira documento com um parágrafo vazio", () => {
    const { doc } = htmlParaLexical("");
    expect(doc.root.children).toHaveLength(1);
  });

  it("decodifica entidades HTML", () => {
    const { doc } = htmlParaLexical("<p>Gest&atilde;o &amp; Inova&ccedil;&atilde;o</p>");
    expect(textoDo(doc)).toContain("Gestão & Inovação");
  });
});

describe("extrairCartoesDeResultado", () => {
  it("extrai o texto de cada result-card e descarta o número", () => {
    const html = `<div class="results-grid">
      <div class="result-card"><span class="r-num">01</span><p>Rede qualificada.</p></div>
      <div class="result-card"><span class="r-num">02</span><p>Gestores aptos.</p></div>
    </div>`;
    expect(extrairCartoesDeResultado(html)).toEqual(["Rede qualificada.", "Gestores aptos."]);
  });

  it("sem cartões, devolve lista vazia", () => {
    expect(extrairCartoesDeResultado("<p>Só um parágrafo.</p>")).toEqual([]);
  });
});

describe("listaParaLexical", () => {
  it("junta o corpo e os itens numa lista", () => {
    const { doc } = listaParaLexical("<p>Para quem:</p>", ["Diretores", "Coordenadores"]);
    expect(doc.root.children).toHaveLength(2);
    expect((doc.root.children[1] as { type: string }).type).toBe("list");
  });

  it("sem itens, devolve só o corpo", () => {
    const { doc } = listaParaLexical("<p>Para quem:</p>", []);
    expect(doc.root.children).toHaveLength(1);
  });
});

describe("textoParaLexical", () => {
  it("embrulha texto puro num parágrafo", () => {
    const doc = textoParaLexical("Metodologia aplicada.");
    expect(doc.root.children).toHaveLength(1);
    expect(textoDo(doc)).toContain("Metodologia aplicada.");
  });
});
```

- [ ] **Step 2: RED**

Rodar: `pnpm --filter @ntc/cms test -- htmlParaLexical`
Esperado: falha com "Failed to resolve import ./htmlParaLexical".

- [ ] **Step 3: Implementar**

Sem dependência nova (§5.4): o parser é uma varredura por regex sobre um subconjunto fechado. Subconjunto suportado: `p`, `strong`/`b`, `em`/`i`, `br`, `ul`, `ol`, `li`. Qualquer outra tag é **desembrulhada** (o conteúdo segue, a tag some) e o nome dela entra em `tagsIgnoradas`, sem repetir. Entidades: `&amp;` `&lt;` `&gt;` `&quot;` `&#39;` `&nbsp;` e as acentuadas nomeadas que aparecem nos arquivos (`&atilde;` `&ccedil;` `&eacute;` `&aacute;` `&oacute;` `&ecirc;` `&ocirc;` `&uacute;` `&iacute;` `&agrave;` `&otilde;` `&ccedil;`), mais o caminho numérico `&#NNN;`.

`format` do nó de texto segue a convenção do Lexical: `0` normal, `1` negrito, `2` itálico, `3` negrito+itálico.

- [ ] **Step 4: GREEN**

Rodar: `pnpm --filter @ntc/cms test -- htmlParaLexical`
Esperado: 12 testes passando, saída limpa.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/htmlParaLexical.ts apps/cms/src/lib/cms/htmlParaLexical.test.ts
git commit
```
Subject: `feat(cms): conversor de HTML editorial para Lexical`

---

### Task 2: Mapeador do instantâneo para a forma do Payload

**Files:**
- Create: `apps/cms/src/lib/cms/importacaoProgramas/tipos.ts`
- Create: `apps/cms/src/lib/cms/importacaoProgramas/mapear.ts`
- Test: `apps/cms/src/lib/cms/importacaoProgramas/mapear.test.ts`

**Interfaces:**
- Consumes (Task 1): `htmlParaLexical`, `textoParaLexical`, `extrairCartoesDeResultado`, `listaParaLexical`, `DocumentoLexical`.
- Produces:
```ts
// tipos.ts — a forma do instantâneo JSON, espelhando só o que é importado
export interface ModuloInstantaneo { numero: string; titulo: string; cargaHoraria: string; descricao: string; topicos: string[] }
export interface ProgramaInstantaneo {
  sigla: string; slug: string; nomeCompleto: string;
  visaoGeralHtml: string; problemaHtml: string; objetivoHtml: string | null;
  publicoHtml: string; publicoChips: string[];
  eixos: { titulo: string; descricao: string }[];
  resultadosHtml: string;
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: string }[];
  modulos: ModuloInstantaneo[];
}
export interface Instantaneo { geradoEm: string; programas: ProgramaInstantaneo[] }

// mapear.ts
export interface CamposPrograma {
  visaoGeral: DocumentoLexical; problema: DocumentoLexical; objetivo?: DocumentoLexical;
  publicoAlvo: DocumentoLexical;
  eixosTematicos: { titulo: string; descricao: string }[];
  resultadosEsperados: { resultado: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: DocumentoLexical }[];
  modulosQuantidade: number;
}
export interface CamposModulo { numero: number; titulo: string; ementa: DocumentoLexical; cargaHoraria: string }
export interface Aviso { campo: string; motivo: string }
export interface MapeamentoPrograma { campos: CamposPrograma; modulos: CamposModulo[]; avisos: Aviso[] }

export function romanoParaInteiro(v: string): number | null
export function mapearPrograma(p: ProgramaInstantaneo): MapeamentoPrograma
```

- [ ] **Step 1: Escrever os testes que falham**

```ts
// apps/cms/src/lib/cms/importacaoProgramas/mapear.test.ts
import { describe, expect, it } from "vitest";

import { mapearPrograma, romanoParaInteiro } from "./mapear";
import type { ProgramaInstantaneo } from "./tipos";

const BASE: ProgramaInstantaneo = {
  sigla: "EDUTEC",
  slug: "edutec",
  nomeCompleto: "Educação Conectada",
  visaoGeralHtml: "<p>Visão.</p>",
  problemaHtml: "<p>Problema.</p>",
  objetivoHtml: "<p>Objetivo.</p>",
  publicoHtml: "<p>Para quem:</p>",
  publicoChips: ["Diretores", "Coordenadores"],
  eixos: [{ titulo: "Eixo 1", descricao: "Desc 1" }],
  resultadosHtml: '<div class="results-grid"><div class="result-card"><span class="r-num">01</span><p>Rede qualificada.</p></div></div>',
  diferenciais: [{ titulo: "Dif 1", descricao: "Desc" }],
  faq: [{ pergunta: "Posso cursar um módulo?", resposta: "Sim." }],
  modulos: [{ numero: "I", titulo: "Módulo um", cargaHoraria: "8h", descricao: "Desc do módulo.", topicos: ["Tópico A", "Tópico B"] }],
};

describe("romanoParaInteiro", () => {
  it("converte os romanos usados nos programas", () => {
    expect(romanoParaInteiro("I")).toBe(1);
    expect(romanoParaInteiro("IV")).toBe(4);
    expect(romanoParaInteiro("VIII")).toBe(8);
    expect(romanoParaInteiro("XX")).toBe(20);
  });

  it("recusa o que não é romano válido de I a XX", () => {
    expect(romanoParaInteiro("")).toBeNull();
    expect(romanoParaInteiro("01")).toBeNull();
    expect(romanoParaInteiro("XXI")).toBeNull();
    expect(romanoParaInteiro("IIII")).toBeNull();
  });
});

describe("mapearPrograma", () => {
  it("mapeia os campos de texto para Lexical", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.visaoGeral.root.children.length).toBeGreaterThan(0);
    expect(campos.problema.root.children.length).toBeGreaterThan(0);
    expect(campos.objetivo?.root.children.length).toBeGreaterThan(0);
  });

  it("extrai os cartões de resultado para o array", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.resultadosEsperados).toEqual([{ resultado: "Rede qualificada." }]);
  });

  it("junta os chips do público ao corpo", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.publicoAlvo.root.children).toHaveLength(2);
  });

  it("copia eixos e diferenciais sem alterar", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.eixosTematicos).toEqual([{ titulo: "Eixo 1", descricao: "Desc 1" }]);
    expect(campos.diferenciais).toEqual([{ titulo: "Dif 1", descricao: "Desc" }]);
  });

  it("converte a resposta do FAQ para Lexical", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.faq[0]!.pergunta).toBe("Posso cursar um módulo?");
    expect(campos.faq[0]!.resposta.root.children.length).toBeGreaterThan(0);
  });

  it("monta a ementa com a descrição e os tópicos", () => {
    const { modulos } = mapearPrograma(BASE);
    expect(modulos).toHaveLength(1);
    expect(modulos[0]!.numero).toBe(1);
    expect(modulos[0]!.cargaHoraria).toBe("8h");
    expect(modulos[0]!.ementa.root.children).toHaveLength(2);
  });

  it("modulosQuantidade é a contagem de módulos", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.modulosQuantidade).toBe(1);
  });

  it("objetivo ausente não vira campo vazio e é avisado", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, objetivoHtml: null });
    expect(campos.objetivo).toBeUndefined();
    expect(avisos).toContainEqual({ campo: "objetivo", motivo: "ausente na origem" });
  });

  it("diferenciais e chips ausentes não quebram", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, diferenciais: [], publicoChips: [] });
    expect(campos.diferenciais).toEqual([]);
    expect(campos.publicoAlvo.root.children).toHaveLength(1);
    expect(avisos).toContainEqual({ campo: "diferenciais", motivo: "ausente na origem" });
  });

  it("módulo sem tópicos grava a ementa só com a descrição, e avisa", () => {
    const { modulos, avisos } = mapearPrograma({
      ...BASE,
      modulos: [{ numero: "II", titulo: "M2", cargaHoraria: "8h", descricao: "Só descrição.", topicos: [] }],
    });
    expect(modulos[0]!.ementa.root.children).toHaveLength(1);
    expect(avisos).toContainEqual({ campo: "modulos[II].topicos", motivo: "ausente na origem" });
  });

  it("numeral romano inválido descarta o módulo e avisa, sem gravar NaN", () => {
    const { modulos, avisos } = mapearPrograma({
      ...BASE,
      modulos: [{ numero: "XXV", titulo: "M", cargaHoraria: "8h", descricao: "d", topicos: [] }],
    });
    expect(modulos).toHaveLength(0);
    expect(avisos).toContainEqual({ campo: "modulos[XXV].numero", motivo: "numeral romano fora de I–XX" });
  });

  it("tag fora do subconjunto no corpo vira aviso do campo", () => {
    const { avisos } = mapearPrograma({ ...BASE, visaoGeralHtml: '<div class="x"><p>a</p></div>' });
    expect(avisos).toContainEqual({ campo: "visaoGeral", motivo: "tag ignorada: div" });
  });
});
```

- [ ] **Step 2: RED**

Rodar: `pnpm --filter @ntc/cms test -- mapear`
Esperado: falha por módulo inexistente.

- [ ] **Step 3: Implementar**

`romanoParaInteiro` aceita só a forma canônica de I a XX (uma tabela de 20 entradas é mais honesta e mais curta que um parser geral). Módulo com romano inválido **não entra** em `modulos` e gera aviso — não se grava `NaN` num campo `number`.

- [ ] **Step 4: GREEN**

Rodar: `pnpm --filter @ntc/cms test -- mapear`
Esperado: 14 testes passando.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/importacaoProgramas/
git commit
```
Subject: `feat(cms): mapeia o instantaneo dos programas para a forma do Payload`

---

### Task 3: Gerador do instantâneo

**Files:**
- Create: `scripts/gerar-instantaneo-programas.mjs`
- Create: `apps/cms/src/seed/assets/programas.json` (saída do script, commitada)
- Modify: `package.json` (raiz) — script `programas:instantaneo`

**Interfaces:**
- Consumes (Task 2): a forma `Instantaneo` de `tipos.ts` (o script é `.mjs`, então espelha a forma sem importar o tipo; a Task 5 valida o JSON contra ela ao carregar).
- Produces: `apps/cms/src/seed/assets/programas.json`.

**Verificado em 30/09, não presuma outra coisa:** o Node 24 remove tipos nativamente, então `node scripts/gerar-instantaneo-programas.mjs` carrega os `.ts` sem flag e **sem dependência nova** (`tsx` não está instalado na raiz e não deve ser adicionado — §5.4).

O script importa **cada `conteudo<SIGLA>.ts` direto**, nunca pelo `conteudoIndex.ts`: o índice faz `import { X } from "./conteudoX"` sem extensão, e o resolver do Node recusa (`ERR_MODULE_NOT_FOUND`). O `import type` que os arquivos individuais fazem do índice é apagado na remoção de tipos e não chega a ser resolvido. Padrão que funciona:

```js
const dir = "../apps/web/app/(programas)/programas/[slug]/";
const arquivos = (await readdir(new URL(dir, import.meta.url)))
  .filter((f) => /^conteudo[A-Z]/.test(f) && f !== "conteudoIndex.ts");
for (const f of arquivos.sort()) {
  const programa = Object.values(await import(dir + f))[0];
  // …
}
```

- [ ] **Step 1: Escrever o script**

Lê `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts` (export `PROGRAMAS`), e para cada programa emite um `ProgramaInstantaneo`:

| Campo do instantâneo | Origem |
|---|---|
| `sigla` / `slug` / `nomeCompleto` | homônimos |
| `visaoGeralHtml` | `visaoGeral.corpoHtml` |
| `problemaHtml` | `problema.corpoHtml` |
| `objetivoHtml` | `objetivoGeral?.corpoHtml ?? null` |
| `publicoHtml` / `publicoChips` | `publico.corpoHtml` / `publico.chips ?? []` |
| `eixos` | `eixos.itens` (só `titulo`, `descricao`) |
| `resultadosHtml` | `resultados.corpoHtml` |
| `diferenciais` | `diferenciais?.itens ?? []` |
| `faq` | `faq.itens` |
| `modulos` | `detalhamento?.itens` — caindo para `modulos.itens` com `topicos: []` quando não houver |

`geradoEm` recebe a data ISO. O JSON sai com indentação 2 e chaves ordenadas, para o diff ser legível.

- [ ] **Step 2: Rodar e conferir a saída**

Rodar: `pnpm programas:instantaneo`

Conferir com:
```bash
node -e "const j=require('./apps/cms/src/seed/assets/programas.json'); console.log('programas:', j.programas.length, '| modulos:', j.programas.reduce((t,p)=>t+p.modulos.length,0)); console.log(j.programas.map(p=>p.sigla+':'+p.modulos.length).join(' '))"
```

**Números medidos na origem em 30/09 — a saída tem de bater exatamente:**

```
programas: 15 | modulos: 112
AGIP:8 EDUTEC:8 EGIDE:8 FUTURA:4 LIDERA:8 PEAR:8 PEI:8 PINEI:6
PROAPS+:8 PROGE:8 PROGIR:8 PROSUS+:8 SIGA:8 SIGS:8 VIVAESCOLA:6
```

Todos os 15 têm `detalhamento`, `objetivoGeral` e `diferenciais`; os numerais vão de I a VIII. **Qualquer divergência para, e relata** — significa que a origem mudou ou o mapeamento está errado.

- [ ] **Step 3: Commit**

```bash
git add scripts/gerar-instantaneo-programas.mjs apps/cms/src/seed/assets/programas.json package.json
git commit
```
Subject: `feat(scripts): gera o instantaneo do conteudo editorial dos 15 programas`

---

### Task 4: Script de import

**Files:**
- Create: `apps/cms/src/seed/importarProgramas.ts`
- Test: `apps/cms/src/seed/importarProgramas.test.ts`
- Modify: `apps/cms/package.json` — `"programas:importar": "pnpm payload run src/seed/importarProgramas.ts"`

**Interfaces:**
- Consumes: `mapearPrograma` (Task 2), `Instantaneo` (Task 2), o JSON (Task 3).
- Produces:
```ts
export interface LinhaRelatorio { sigla: string; acao: "criado" | "atualizado" | "erro"; modulosCriados: number; modulosAtualizados: number; avisos: string[] }
export function planejarImportacao(
  instantaneo: Instantaneo,
  programasNoBanco: { id: number; sigla: string }[],
): { paraImportar: { sigla: string; id: number }[]; semCorrespondencia: string[] }
```

A função pura `planejarImportacao` é o que os testes cobrem; o corpo que escreve no banco é exercitado pelo dry-run.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// apps/cms/src/seed/importarProgramas.test.ts
import { describe, expect, it } from "vitest";

import { planejarImportacao } from "./importarProgramas";
import type { Instantaneo } from "../lib/cms/importacaoProgramas/tipos";

const instantaneo = (siglas: string[]): Instantaneo => ({
  geradoEm: "2026-09-30T00:00:00.000Z",
  programas: siglas.map((sigla) => ({
    sigla, slug: sigla.toLowerCase(), nomeCompleto: sigla,
    visaoGeralHtml: "<p>a</p>", problemaHtml: "<p>b</p>", objetivoHtml: null,
    publicoHtml: "<p>c</p>", publicoChips: [], eixos: [], resultadosHtml: "",
    diferenciais: [], faq: [], modulos: [],
  })),
});

describe("planejarImportacao", () => {
  it("casa por sigla e ignora diferença de caixa", () => {
    const r = planejarImportacao(instantaneo(["EDUTEC", "PROGE"]), [
      { id: 7, sigla: "edutec" },
      { id: 9, sigla: "PROGE" },
    ]);
    expect(r.paraImportar).toEqual([{ sigla: "EDUTEC", id: 7 }, { sigla: "PROGE", id: 9 }]);
    expect(r.semCorrespondencia).toEqual([]);
  });

  it("sigla do instantâneo que não existe no banco é relatada, nunca criada", () => {
    const r = planejarImportacao(instantaneo(["EDUTEC", "NOVO"]), [{ id: 7, sigla: "EDUTEC" }]);
    expect(r.paraImportar).toEqual([{ sigla: "EDUTEC", id: 7 }]);
    expect(r.semCorrespondencia).toEqual(["NOVO"]);
  });

  it("rodar de novo sobre o mesmo banco produz o mesmo plano", () => {
    const banco = [{ id: 7, sigla: "EDUTEC" }];
    const primeiro = planejarImportacao(instantaneo(["EDUTEC"]), banco);
    const segundo = planejarImportacao(instantaneo(["EDUTEC"]), banco);
    expect(segundo).toEqual(primeiro);
  });

  it("instantâneo vazio não planeja nada", () => {
    expect(planejarImportacao(instantaneo([]), [{ id: 7, sigla: "EDUTEC" }])).toEqual({
      paraImportar: [], semCorrespondencia: [],
    });
  });
});
```

- [ ] **Step 2: RED**

Rodar: `pnpm --filter @ntc/cms test -- importarProgramas`
Esperado: falha por módulo inexistente.

- [ ] **Step 3: Implementar**

Estrutura, seguindo `seed/seedContatos.ts`:

```ts
const APLICAR = process.env.PROGRAMAS_IMPORTAR_APLICAR === "1";
```

Fluxo: carrega o JSON → `payload.find({ collection: "programas", limit: 100, depth: 0 })` → `planejarImportacao` → para cada programa casado: `mapearPrograma`, e então
`payload.update({ collection: "programas", id, data: { ...campos, _status: "published" }, overrideAccess: true })`.
Módulos: para cada um, `payload.find({ collection: "modulos", where: { and: [{ programa: { equals: id } }, { numero: { equals: n } }] }, limit: 1 })` → `update` se existe, `create` se não, sempre com `_status` publicado quando a coleção tiver drafts.

Em dry-run, nenhuma dessas escritas roda: o script só imprime a `LinhaRelatorio` que produziria.

Ao fim, imprime sempre: linhas por programa, siglas sem correspondência, tags ignoradas, a lista de programas com `cargaHorariaTotal` ainda em `"A definir"` e a lista de programas **sem docente vinculado** (pendência manual do PO, spec §2.2).

- [ ] **Step 4: GREEN e dry-run real**

Rodar: `pnpm --filter @ntc/cms test -- importarProgramas` → 4 testes passando.
Depois, com o dev parado: `pnpm --filter @ntc/cms programas:importar`
Esperado: relatório com 15 programas, nenhuma escrita, nenhuma sigla sem correspondência. **Colar o relatório no report da task.**

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/seed/importarProgramas.ts apps/cms/src/seed/importarProgramas.test.ts apps/cms/package.json
git commit
```
Subject: `feat(cms): script de importacao dos programas, com dry-run por padrao`

---

### Task 5: Aplicar, verificar e documentar

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Aplicar o import**

Com o dev parado:
```bash
PROGRAMAS_IMPORTAR_APLICAR=1 pnpm --filter @ntc/cms programas:importar
```
Colar o relatório no report da task.

- [ ] **Step 2: Verificar no banco**

```bash
psql "$(grep '^DATABASE_URI' apps/cms/.env | cut -d= -f2- | tr -d '"')" -At -c "
select sigla || ' | ' || coalesce(_status::text,'-')
  || ' | problema=' || case when problema is not null then 'ok' else 'VAZIO' end
  || ' | eixos=' || (select count(*) from programas_eixos_tematicos e where e._parent_id = programas.id)
  || ' | result=' || (select count(*) from programas_resultados_esperados r where r._parent_id = programas.id)
  || ' | mods=' || (select count(*) from modulos m where m.programa_id = programas.id)
from programas order by sigla;"
```
Esperado: 15 linhas, todas `published`, `problema=ok`, e contagens > 0. Qualquer linha fora disso volta para investigação antes do commit.

- [ ] **Step 3: Rodar o import de novo (idempotência)**

Repetir o comando do Step 1 e conferir no relatório que **nenhum módulo foi criado** na segunda passada (só atualizados) e que as contagens do Step 2 não mudaram.

- [ ] **Step 4: Verificação final**

Com o dev parado: `pnpm lint` (0 erros), `pnpm typecheck`, `pnpm test`, `pnpm build`. Depois `rm -rf apps/cms/.next apps/web/.next`.

- [ ] **Step 5: CLAUDE.md**

Entrada **v3.2** no histórico: o que era o problema (CMS com as cascas vazias; conteúdo real nos `conteudo*.ts`), o que o import faz, a dívida aceita da duplicação de fonte, a publicação obrigatória e o porquê, e os números de lint/typecheck/test/build. Em §19.1, registrar que `programas` e `modulos` passam a ter conteúdo e que o site **continua** lendo os arquivos estáticos. Em §19.3, acrescentar como item a Sessão 2 (apontando para o apêndice do spec) e a dívida da fonte duplicada.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit
```
Subject: `docs: CLAUDE.md v3.2 — importacao do conteudo editorial dos programas`

---

## Self-review (feito ao escrever)

**Cobertura do spec:** §1 escopo → Tasks 3 e 4 (só o subconjunto editorial; nenhum arquivo de `apps/web` é tocado). §2 mapeamento → Task 2 (programa) e Tasks 2/3 (módulo, com `detalhamento` como origem e a queda para `modulos.itens`). §2.1 conversão HTML→Lexical → Task 1, incluindo a extração dos cartões de resultado e o relato de tag fora do subconjunto. §2.2 docentes **fora do escopo** — nenhuma task os importa; a pendência entra no relatório da Task 4. §3 como roda (dois passos, idempotência, dry-run) → Tasks 3 e 4, idempotência verificada de fato na Task 5 Step 3. §3.1 publicação obrigatória → Task 4 Step 3 e Task 5 Step 2. §4 erros e relatório → Task 4 Step 3. §5 testes → Tasks 1, 2, 4.

**Nomes entre tasks:** `htmlParaLexical`/`textoParaLexical`/`extrairCartoesDeResultado`/`listaParaLexical`/`DocumentoLexical` (T1) usados em T2. `ProgramaInstantaneo`/`Instantaneo`/`ModuloInstantaneo` (T2, `tipos.ts`) usados em T3 e T4. `mapearPrograma`/`romanoParaInteiro` (T2) em T4. `planejarImportacao` (T4) só em T4.

**Review Focus coberto:** (1) campo opcional ausente → T2, três testes (`objetivo`, `diferenciais`/chips, `topicos`). (2) tag fora do subconjunto → T1 (dois testes) e T2 (aviso propagado). (3) romano inválido → T2, dois testes. (4) sigla sem correspondência → T4, um teste. (5) reexecução → T4 (plano estável) e T5 Step 3 (contra o banco).

**Decisões embutidas:** docentes ficam fora do import porque a origem só tem rótulos ("Especialista convidado"), verificado nos 15 arquivos em 30/09 — importá-los exigiria criar especialistas falsos; o vínculo é manual do PO. O instantâneo JSON é versionado, para o import não depender da árvore do site e o diff ser revisável; módulo com romano inválido é descartado com aviso em vez de gravar `NaN`; `cargaHorariaTotal` não é tocado (é string de exibição, hoje `"A definir"` nos 15) e vira linha de relatório; o script nunca cria programa — sigla sem correspondência é erro relatado, porque a lista canônica dos 15 é de `seed/programasShell.ts`.
