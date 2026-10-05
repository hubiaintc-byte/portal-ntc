# CRM — Gestão do Catálogo (Programas e Módulos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar as telas Programas e Módulos do CRM (hoje read-only, sem filtro) em gestão completa do catálogo comercial — busca e filtros, criar, editar, publicar (programas) e excluir com bloqueio por dependentes.

**Architecture:** Regras puras em `packages/lib/src/crm/catalogo.ts`; leitura em `apps/cms/src/lib/cms/catalogoCrm.ts`, escrita em `catalogoCrmEscrita.ts`, contagem de dependentes + hooks `beforeDelete` em `apps/cms/src/lib/crm/exclusaoCatalogo.ts`; Server Actions em `app/(painel)/acoesCatalogo.ts`; telas client no `ShellCrm`. Texto rico editado como Markdown leve (`BarraFormatacao` + `markdownParaLexical`/`lexicalParaMarkdown`, já usados nos Conteúdos), só reescrevendo os campos que o usuário mudou.

**Tech Stack:** Next.js 15 (Server Actions, Client Components), Payload CMS 3.18 Local API (Postgres/drizzle, drafts), Vitest, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-10-05-crm-catalogo-programas-modulos-design.md`

## Global Constraints

- Site (`apps/web`) **não** é tocado. Nenhuma página pública muda.
- Sem dependência nova (CLAUDE.md §5.4). Sem `any`, sem `@ts-ignore`, sem `eslint-disable` (§4.4, §5.7).
- Nenhum `payload:push:schema`: `imagemCapa` sai de `required` só como validação — o banco já tem todas as colunas de `programas` nullable (coleção com drafts). `payload:generate` **sim**, e os tipos são commitados.
- Toda Server Action valida a sessão **antes** de tocar a Local API (`obterUsuarioAutenticado` para escrita, `obterUsuarioCms` para leitura) e devolve `{ ok: false, erro: "Sessão expirada. Entre novamente." }` sem sessão.
- Toda escrita composta passa por `executarEmTransacao` (`apps/cms/src/lib/crm/transacao.ts`). Recusa de validação **antes** de qualquer escrita (ver o comentário do helper).
- Mensagens ao usuário em português, específicas (sigla duplicada, número em uso, faltas para publicar, bloqueios de exclusão). Erro inesperado: `"Não foi possível salvar. Tente novamente."` + `console.error("[nomeDaFuncao]", e)`.
- Rascunho exige **sigla e nome completo**; publicar exige sigla, nome completo, área, carga horária total, visão geral não-vazia e itens de lista completos.
- Programa novo nasce **rascunho**. O wizard de proposta lista **só programas publicados** (e só módulos deles).
- `modulosQuantidade`: recalculado (contagem real) ao criar, excluir ou mudar o programa de um módulo; grava **publicado** só se o programa estiver na situação `publicado`, senão grava no **rascunho**.
- Exclusão bloqueada — programa: módulos, propostas, leads, eventos do site, especialistas; módulo: propostas (`modulos` ou `modulosDetalhados.modulo`), eventos comerciais (`moduloCatalogo`).
- Classes CSS do painel (`pcms-*`) existentes; sem CSS novo além do estritamente necessário em `painel.css`. Botões para ações; listas reordenáveis por botões ↑/↓ (teclado), não arraste.
- Commits em português, Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Trabalhar na branch `feat/crm-catalogo-programas-modulos`.
- Rodar testes com o dev server **parado** antes de qualquer `pnpm build` (o build corrompe o `.next` do dev).

## Review Focus

1. **Salvar um programa importado sem tocar num texto com negrito+itálico/linebreak não pode apagar a formatação** — só campos alterados são reescritos (teste na Task 5: `textos` parcial só grava as chaves enviadas).
2. **Publicar um rascunho de programa que já estava publicado precisa publicar o conteúdo do formulário, não o antigo** — `salvarPrograma(..., publicar: true)` envia os dados + `_status: "published"` numa só escrita (teste na Task 5).
3. **Criar/excluir módulo de programa com alterações pendentes não pode publicar essas alterações por tabela** — teste do recálculo com situação `alteracoes-pendentes` grava com `draft: true` (Task 5).
4. **Sigla duplicada (inclusive em caixa diferente: "edutec" vs "EDUTEC") recusa com mensagem clara** — a sigla é gravada em maiúsculas e a checagem compara em maiúsculas (teste na Task 5).
5. **Número de módulo repetido ao mover um módulo para outro programa** — a checagem de unicidade usa o programa **de destino** e ignora o próprio id (teste na Task 5).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `packages/lib/src/crm/catalogo.ts` (novo) | Regras puras: situação, filtros, faltas para rascunho/publicação, limpeza de listas, número do módulo, bloqueios de exclusão, onde gravar `modulosQuantidade`. |
| `packages/lib/src/crm/catalogo.test.ts` (novo) | Testes das regras. |
| `packages/lib/src/index.ts` | Exports. |
| `apps/cms/src/collections/Programas.ts` | `imagemCapa` sem `required`; `beforeDelete`. |
| `apps/cms/src/collections/Modulos.ts` | `beforeDelete`. |
| `packages/types/src/payload-types.ts` | Regenerado. |
| `apps/cms/src/lib/markdownLexical.ts` | `idaEVoltaPreserva(doc)`. |
| `apps/cms/src/lib/markdownLexical.catalogo.test.ts` (novo) | Round-trip sobre o instantâneo real. |
| `apps/cms/src/lib/crm/exclusaoCatalogo.ts` (novo) | `contarDependentesPrograma/Modulo` + hooks `beforeDelete`. |
| `apps/cms/src/lib/crm/exclusaoCatalogo.test.ts` (novo) | Testes. |
| `apps/cms/src/lib/cms/catalogoCrm.ts` (novo) | Leitura: listas com situação, áreas, detalhes em Markdown, `situacaoDoPrograma`. |
| `apps/cms/src/lib/cms/catalogoCrm.test.ts` (novo) | Testes de leitura. |
| `apps/cms/src/lib/cms/painelCrm.ts` | Remove `listarProgramasCrm`/`listarModulosCrm`/tipos (migram); `obterCatalogoCrm` só publicados. |
| `apps/cms/src/lib/cms/painelCrm.catalogo.test.ts` (novo) | Teste do filtro de publicados no wizard. |
| `apps/cms/src/lib/cms/catalogoCrmEscrita.ts` (novo) | Escrita: salvar/publicar/excluir programa, salvar/excluir módulo, recálculo. |
| `apps/cms/src/lib/cms/catalogoCrmEscrita.test.ts` (novo) | Testes de escrita. |
| `apps/cms/src/app/(painel)/acoesCatalogo.ts` (novo) | Server Actions. |
| `apps/cms/src/app/(painel)/acoesCatalogo.test.ts` (novo) | Gate de sessão. |
| `apps/cms/src/app/(painel)/crm/TelaProgramas.tsx`, `TelaModulos.tsx` | Filtros, botões Novo, linha clicável. |
| `apps/cms/src/app/(painel)/crm/CampoMarkdown.tsx` (novo) | Textarea + `BarraFormatacao` + aviso de perda. |
| `apps/cms/src/app/(painel)/crm/EditorListaCatalogo.tsx` (novo) | Lista editável genérica (adicionar, remover, ↑/↓). |
| `apps/cms/src/app/(painel)/crm/DetalheProgramaCatalogo.tsx` (novo) | Detalhe/edição/publicação/exclusão do programa. |
| `apps/cms/src/app/(painel)/crm/DetalheModuloCatalogo.tsx` (novo) | Detalhe/edição/exclusão do módulo. |
| `apps/cms/src/app/(painel)/crm/seloStatus.ts` | `seloDeSituacaoPrograma`. |
| `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`, `page.tsx` | Estados de detalhe e props novas (`areas`). |
| `CLAUDE.md` | Entrada de histórico + §19. |

---

### Task 1: Regras puras do catálogo (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/catalogo.ts`
- Create: `packages/lib/src/crm/catalogo.test.ts`
- Modify: `packages/lib/src/index.ts` (bloco de exports do CRM, depois do bloco `./crm/conteudoProposta`)

**Interfaces:**
- Consumes: `normalizarNome` de `./casamento-cliente` (já existe: NFD, sem acento, minúsculas, não-alfanumérico vira espaço).
- Produces (todos exportados por `@ntc/lib`):
  - `type SituacaoPrograma = "rascunho" | "publicado" | "alteracoes-pendentes"`
  - `SITUACOES_PROGRAMA: readonly { value: SituacaoPrograma; label: string }[]`
  - `rotuloSituacaoPrograma(s: SituacaoPrograma): string`
  - `situacaoPrograma(statusPrincipal: string | null | undefined, statusUltimaVersao: string | null | undefined): SituacaoPrograma`
  - `CAMPOS_TEXTO_PROGRAMA` (readonly `{ chave, rotulo }[]`) e `type CampoTextoPrograma = "visaoGeral" | "problema" | "objetivo" | "publicoAlvo" | "metodologia"`
  - `interface ItemTituloDescricao { titulo: string; descricao: string }`
  - `interface FiltroProgramas { busca: string; areaId: string; situacao: SituacaoPrograma | "" }`, `interface ProgramaFiltravel { sigla: string; nome: string; areaId: string | null; situacao: SituacaoPrograma }`, `filtrarProgramas<T extends ProgramaFiltravel>(lista: readonly T[], f: FiltroProgramas): T[]`
  - `interface FiltroModulos { busca: string; programaId: string }`, `interface ModuloFiltravel { titulo: string; tituloComercial: string | null; programaId: string | null }`, `filtrarModulos<T extends ModuloFiltravel>(lista: readonly T[], f: FiltroModulos): T[]`
  - `faltasParaRascunho(p: { sigla: string; nomeCompleto: string }): string[]`
  - `interface ProgramaParaPublicar { sigla: string; nomeCompleto: string; areaId: string; cargaHorariaTotal: string; visaoGeral: string; eixos: ItemTituloDescricao[]; diferenciais: ItemTituloDescricao[]; resultados: string[] }`, `faltasParaPublicar(p: ProgramaParaPublicar): string[]`
  - `semItensVazios(itens: readonly ItemTituloDescricao[]): ItemTituloDescricao[]`, `semResultadosVazios(r: readonly string[]): string[]`
  - `lerNumeroModulo(texto: string): number | null`
  - `interface DependentesPrograma { modulos: number; propostas: number; leads: number; eventos: number; especialistas: number }`, `podeExcluirPrograma(d: DependentesPrograma): { ok: true } | { ok: false; motivo: string }`
  - `interface DependentesModulo { propostas: number; eventosComerciais: number }`, `podeExcluirModulo(d: DependentesModulo): { ok: true } | { ok: false; motivo: string }`
  - `quantidadeModulosVaiPublicado(s: SituacaoPrograma): boolean`

- [ ] **Step 1: Criar a branch**

```bash
cd /Users/joao/Documents/portal-ntc && git switch -c feat/crm-catalogo-programas-modulos
```

- [ ] **Step 2: Escrever os testes que falham**

`packages/lib/src/crm/catalogo.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  faltasParaPublicar,
  faltasParaRascunho,
  filtrarModulos,
  filtrarProgramas,
  lerNumeroModulo,
  podeExcluirModulo,
  podeExcluirPrograma,
  quantidadeModulosVaiPublicado,
  rotuloSituacaoPrograma,
  semItensVazios,
  semResultadosVazios,
  situacaoPrograma,
  type ProgramaParaPublicar,
} from "./catalogo";

describe("situacaoPrograma", () => {
  it("nunca publicado é rascunho, qualquer que seja a última versão", () => {
    expect(situacaoPrograma("draft", "draft")).toBe("rascunho");
    expect(situacaoPrograma(undefined, undefined)).toBe("rascunho");
  });
  it("publicado com última versão rascunho tem alterações pendentes", () => {
    expect(situacaoPrograma("published", "draft")).toBe("alteracoes-pendentes");
  });
  it("publicado com última versão publicada é publicado", () => {
    expect(situacaoPrograma("published", "published")).toBe("publicado");
  });
  it("rótulos legíveis", () => {
    expect(rotuloSituacaoPrograma("alteracoes-pendentes")).toBe("Alterações não publicadas");
  });
});

describe("filtrarProgramas", () => {
  const lista = [
    { sigla: "EDUTEC", nome: "Educação Conectada", areaId: "1", situacao: "publicado" as const },
    { sigla: "PROSUS+", nome: "Saúde Pública", areaId: "3", situacao: "rascunho" as const },
  ];
  it("busca sem acento e sem caixa em sigla e nome", () => {
    expect(filtrarProgramas(lista, { busca: "educacao", areaId: "", situacao: "" })).toHaveLength(1);
    expect(filtrarProgramas(lista, { busca: "prosus", areaId: "", situacao: "" })[0]!.sigla).toBe("PROSUS+");
  });
  it("filtra por área e situação", () => {
    expect(filtrarProgramas(lista, { busca: "", areaId: "3", situacao: "" })).toHaveLength(1);
    expect(filtrarProgramas(lista, { busca: "", areaId: "", situacao: "publicado" })[0]!.sigla).toBe("EDUTEC");
  });
  it("filtros vazios devolvem tudo", () => {
    expect(filtrarProgramas(lista, { busca: "  ", areaId: "", situacao: "" })).toHaveLength(2);
  });
});

describe("filtrarModulos", () => {
  const lista = [
    { titulo: "Gestão escolar", tituloComercial: "Seminário de Gestão", programaId: "1" },
    { titulo: "Avaliação", tituloComercial: null, programaId: "2" },
  ];
  it("busca no título e no título comercial", () => {
    expect(filtrarModulos(lista, { busca: "seminario", programaId: "" })).toHaveLength(1);
    expect(filtrarModulos(lista, { busca: "AVALIA", programaId: "" })).toHaveLength(1);
  });
  it("filtra por programa", () => {
    expect(filtrarModulos(lista, { busca: "", programaId: "2" })[0]!.titulo).toBe("Avaliação");
  });
});

describe("faltas", () => {
  const completo: ProgramaParaPublicar = {
    sigla: "X",
    nomeCompleto: "Programa X",
    areaId: "1",
    cargaHorariaTotal: "64 horas",
    visaoGeral: "Texto.",
    eixos: [{ titulo: "E1", descricao: "D1" }],
    diferenciais: [{ titulo: "Dif", descricao: "" }],
    resultados: ["R1"],
  };
  it("rascunho exige sigla e nome", () => {
    expect(faltasParaRascunho({ sigla: " ", nomeCompleto: "" })).toEqual(["Sigla", "Nome completo"]);
    expect(faltasParaRascunho({ sigla: "X", nomeCompleto: "Y" })).toEqual([]);
  });
  it("publicação completa não tem faltas (descrição do diferencial é opcional)", () => {
    expect(faltasParaPublicar(completo)).toEqual([]);
  });
  it("publicação lista campos e itens incompletos", () => {
    expect(
      faltasParaPublicar({
        ...completo,
        areaId: "",
        cargaHorariaTotal: "",
        visaoGeral: "  ",
        eixos: [{ titulo: "E1", descricao: "" }],
        diferenciais: [{ titulo: "", descricao: "algo" }],
        resultados: [""],
      }),
    ).toEqual([
      "Área",
      "Carga horária total",
      "Visão geral",
      "Eixo 1: descrição",
      "Diferencial 1: título",
      "Resultado 1: texto",
    ]);
  });
});

describe("limpeza de listas", () => {
  it("descarta só itens totalmente vazios", () => {
    expect(
      semItensVazios([
        { titulo: " ", descricao: "" },
        { titulo: "A", descricao: "" },
      ]),
    ).toEqual([{ titulo: "A", descricao: "" }]);
    expect(semResultadosVazios(["", " x "])).toEqual([" x "]);
  });
});

describe("lerNumeroModulo", () => {
  it("aceita inteiro ≥ 1", () => {
    expect(lerNumeroModulo(" 3 ")).toBe(3);
  });
  it("recusa zero, negativo, decimal e texto", () => {
    for (const v of ["0", "-1", "2.5", "2,5", "", "três"]) expect(lerNumeroModulo(v)).toBeNull();
  });
});

describe("exclusão", () => {
  it("programa sem dependentes pode", () => {
    expect(podeExcluirPrograma({ modulos: 0, propostas: 0, leads: 0, eventos: 0, especialistas: 0 })).toEqual({ ok: true });
  });
  it("programa lista só os dependentes que existem, com plural certo", () => {
    expect(podeExcluirPrograma({ modulos: 3, propostas: 1, leads: 0, eventos: 0, especialistas: 0 })).toEqual({
      ok: false,
      motivo: "Vinculado a 3 módulos e 1 proposta — exclua ou desvincule antes.",
    });
    expect(podeExcluirPrograma({ modulos: 0, propostas: 0, leads: 2, eventos: 1, especialistas: 1 })).toEqual({
      ok: false,
      motivo: "Vinculado a 2 leads, 1 evento do site e 1 especialista — exclua ou desvincule antes.",
    });
  });
  it("módulo usado em proposta ou evento comercial não pode", () => {
    expect(podeExcluirModulo({ propostas: 0, eventosComerciais: 0 })).toEqual({ ok: true });
    expect(podeExcluirModulo({ propostas: 2, eventosComerciais: 1 })).toEqual({
      ok: false,
      motivo: "Usado em 2 propostas e 1 evento comercial — não pode ser excluído.",
    });
  });
});

describe("quantidadeModulosVaiPublicado", () => {
  it("só grava publicado quando o programa está publicado sem pendência", () => {
    expect(quantidadeModulosVaiPublicado("publicado")).toBe(true);
    expect(quantidadeModulosVaiPublicado("rascunho")).toBe(false);
    expect(quantidadeModulosVaiPublicado("alteracoes-pendentes")).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `pnpm --filter @ntc/lib test -- catalogo`
Expected: FAIL — `Failed to resolve import "./catalogo"`.

- [ ] **Step 4: Implementar**

`packages/lib/src/crm/catalogo.ts`:

```ts
/**
 * Regras puras do catálogo comercial — programas e módulos geridos pelo CRM
 * (spec 2026-10-05-crm-catalogo-programas-modulos). Sem I/O.
 */
import { normalizarNome } from "./casamento-cliente";

export type SituacaoPrograma = "rascunho" | "publicado" | "alteracoes-pendentes";

export const SITUACOES_PROGRAMA: readonly { value: SituacaoPrograma; label: string }[] = [
  { value: "publicado", label: "Publicado" },
  { value: "rascunho", label: "Rascunho" },
  { value: "alteracoes-pendentes", label: "Alterações não publicadas" },
];

export function rotuloSituacaoPrograma(s: SituacaoPrograma): string {
  return SITUACOES_PROGRAMA.find((x) => x.value === s)?.label ?? s;
}

/**
 * `statusPrincipal` é o `_status` lido SEM `draft` (linha principal — fica
 * "draft" só enquanto o programa nunca foi publicado); `statusUltimaVersao`
 * é o `_status` lido COM `draft: true` (última versão salva).
 */
export function situacaoPrograma(
  statusPrincipal: string | null | undefined,
  statusUltimaVersao: string | null | undefined,
): SituacaoPrograma {
  if (statusPrincipal !== "published") return "rascunho";
  return statusUltimaVersao === "draft" ? "alteracoes-pendentes" : "publicado";
}

/** Os cinco textos do programa que alimentam a proposta, com o rótulo usado na tela. */
export const CAMPOS_TEXTO_PROGRAMA = [
  { chave: "visaoGeral", rotulo: "Visão geral (apresentação)" },
  { chave: "problema", rotulo: "Contexto (problema)" },
  { chave: "objetivo", rotulo: "Objetivos" },
  { chave: "publicoAlvo", rotulo: "Público-alvo" },
  { chave: "metodologia", rotulo: "Metodologia" },
] as const;

export type CampoTextoPrograma = (typeof CAMPOS_TEXTO_PROGRAMA)[number]["chave"];

export interface ItemTituloDescricao {
  titulo: string;
  descricao: string;
}

export interface FiltroProgramas {
  busca: string;
  areaId: string;
  situacao: SituacaoPrograma | "";
}

export interface ProgramaFiltravel {
  sigla: string;
  nome: string;
  areaId: string | null;
  situacao: SituacaoPrograma;
}

export function filtrarProgramas<T extends ProgramaFiltravel>(lista: readonly T[], f: FiltroProgramas): T[] {
  const termo = normalizarNome(f.busca);
  return lista.filter(
    (p) =>
      (f.areaId === "" || p.areaId === f.areaId) &&
      (f.situacao === "" || p.situacao === f.situacao) &&
      (termo === "" || normalizarNome(`${p.sigla} ${p.nome}`).includes(termo)),
  );
}

export interface FiltroModulos {
  busca: string;
  programaId: string;
}

export interface ModuloFiltravel {
  titulo: string;
  tituloComercial: string | null;
  programaId: string | null;
}

export function filtrarModulos<T extends ModuloFiltravel>(lista: readonly T[], f: FiltroModulos): T[] {
  const termo = normalizarNome(f.busca);
  return lista.filter(
    (m) =>
      (f.programaId === "" || m.programaId === f.programaId) &&
      (termo === "" || normalizarNome(`${m.titulo} ${m.tituloComercial ?? ""}`).includes(termo)),
  );
}

const vazio = (v: string) => v.trim() === "";

/** Sigla para o rascunho ser encontrável; nome porque o slug (único) deriva dele (`autoSlug`). */
export function faltasParaRascunho(p: { sigla: string; nomeCompleto: string }): string[] {
  const faltas: string[] = [];
  if (vazio(p.sigla)) faltas.push("Sigla");
  if (vazio(p.nomeCompleto)) faltas.push("Nome completo");
  return faltas;
}

export interface ProgramaParaPublicar {
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  /** Markdown da visão geral. */
  visaoGeral: string;
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
}

/** O que o schema do Payload exige na publicação, em rótulos da tela. Listas já devem vir sem itens vazios. */
export function faltasParaPublicar(p: ProgramaParaPublicar): string[] {
  const faltas = faltasParaRascunho(p);
  if (vazio(p.areaId)) faltas.push("Área");
  if (vazio(p.cargaHorariaTotal)) faltas.push("Carga horária total");
  if (vazio(p.visaoGeral)) faltas.push("Visão geral");
  p.eixos.forEach((e, i) => {
    if (vazio(e.titulo)) faltas.push(`Eixo ${i + 1}: título`);
    if (vazio(e.descricao)) faltas.push(`Eixo ${i + 1}: descrição`);
  });
  p.diferenciais.forEach((d, i) => {
    if (vazio(d.titulo)) faltas.push(`Diferencial ${i + 1}: título`);
  });
  p.resultados.forEach((r, i) => {
    if (vazio(r)) faltas.push(`Resultado ${i + 1}: texto`);
  });
  return faltas;
}

/** Item acrescentado e deixado em branco não é dado — some antes de gravar. */
export function semItensVazios(itens: readonly ItemTituloDescricao[]): ItemTituloDescricao[] {
  return itens.filter((i) => !(vazio(i.titulo) && vazio(i.descricao)));
}

export function semResultadosVazios(r: readonly string[]): string[] {
  return r.filter((x) => !vazio(x));
}

export function lerNumeroModulo(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 ? n : null;
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

export interface DependentesPrograma {
  modulos: number;
  propostas: number;
  leads: number;
  eventos: number;
  especialistas: number;
}

export function podeExcluirPrograma(d: DependentesPrograma): { ok: true } | { ok: false; motivo: string } {
  const partes = [
    d.modulos > 0 ? plural(d.modulos, "módulo", "módulos") : null,
    d.propostas > 0 ? plural(d.propostas, "proposta", "propostas") : null,
    d.leads > 0 ? plural(d.leads, "lead", "leads") : null,
    d.eventos > 0 ? plural(d.eventos, "evento do site", "eventos do site") : null,
    d.especialistas > 0 ? plural(d.especialistas, "especialista", "especialistas") : null,
  ].filter((p): p is string => p !== null);
  if (partes.length === 0) return { ok: true };
  return { ok: false, motivo: `Vinculado a ${juntar(partes)} — exclua ou desvincule antes.` };
}

export interface DependentesModulo {
  propostas: number;
  eventosComerciais: number;
}

export function podeExcluirModulo(d: DependentesModulo): { ok: true } | { ok: false; motivo: string } {
  const partes = [
    d.propostas > 0 ? plural(d.propostas, "proposta", "propostas") : null,
    d.eventosComerciais > 0 ? plural(d.eventosComerciais, "evento comercial", "eventos comerciais") : null,
  ].filter((p): p is string => p !== null);
  if (partes.length === 0) return { ok: true };
  return { ok: false, motivo: `Usado em ${juntar(partes)} — não pode ser excluído.` };
}

/**
 * `modulosQuantidade` grava publicado só quando o programa não tem rascunho
 * em curso — senão a escrita publicaria por tabela o que o PO ainda edita.
 */
export function quantidadeModulosVaiPublicado(s: SituacaoPrograma): boolean {
  return s === "publicado";
}
```

Em `packages/lib/src/index.ts`, logo depois do bloco `} from "./crm/conteudoProposta";`, acrescentar:

```ts
export {
  SITUACOES_PROGRAMA,
  CAMPOS_TEXTO_PROGRAMA,
  rotuloSituacaoPrograma,
  situacaoPrograma,
  filtrarProgramas,
  filtrarModulos,
  faltasParaRascunho,
  faltasParaPublicar,
  semItensVazios,
  semResultadosVazios,
  lerNumeroModulo,
  podeExcluirPrograma,
  podeExcluirModulo,
  quantidadeModulosVaiPublicado,
  type SituacaoPrograma,
  type CampoTextoPrograma,
  type ItemTituloDescricao,
  type FiltroProgramas,
  type ProgramaFiltravel,
  type FiltroModulos,
  type ModuloFiltravel,
  type ProgramaParaPublicar,
  type DependentesPrograma,
  type DependentesModulo,
} from "./crm/catalogo";
```

- [ ] **Step 5: Rodar e ver passar**

Run: `pnpm --filter @ntc/lib test -- catalogo && pnpm --filter @ntc/lib typecheck`
Expected: PASS; typecheck sem erro.

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/crm/catalogo.ts packages/lib/src/crm/catalogo.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): regras puras do catalogo de programas e modulos

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Capa opcional e detector de perda no round-trip Markdown

**Files:**
- Modify: `apps/cms/src/collections/Programas.ts` (campo `imagemCapa`)
- Modify: `packages/types/src/payload-types.ts` (regenerado)
- Modify: `apps/cms/src/lib/markdownLexical.ts` (acrescentar `idaEVoltaPreserva` no fim)
- Create: `apps/cms/src/lib/markdownLexical.catalogo.test.ts`

**Interfaces:**
- Consumes: `markdownParaLexical`, `lexicalParaMarkdown`, constantes `FORMATO_BOLD = 1`, `FORMATO_ITALIC = 2` (já no arquivo); `mapearPrograma` de `@/lib/cms/importacaoProgramas/mapear` e o instantâneo `apps/cms/src/seed/assets/programas.json` (`{ programas: ProgramaInstantaneo[] }`).
- Produces: `idaEVoltaPreserva(doc: unknown): boolean` — `true` quando `markdownParaLexical(lexicalParaMarkdown(doc))` preserva blocos, texto (espaços colapsados), negrito/itálico e links.

- [ ] **Step 1: Tirar `required` da capa**

Em `apps/cms/src/collections/Programas.ts`, substituir:

```ts
            {
              name: "imagemCapa",
              type: "upload",
              relationTo: "media",
              required: true,
            },
```

por:

```ts
            {
              name: "imagemCapa",
              type: "upload",
              relationTo: "media",
              // Opcional desde 05/10/2026: o CRM cria programas sem imagem, e o
              // site não lê programas do CMS. Sem push de schema — coleção com
              // drafts já tem a coluna nullable no banco.
            },
```

- [ ] **Step 2: Regenerar tipos**

Run: `pnpm --filter @ntc/cms payload:generate && git diff --stat packages/types`
Expected: só `packages/types/src/payload-types.ts` mudou, com `imagemCapa?: (number | null) | Media;` (ou forma equivalente opcional) em `Programa`.

- [ ] **Step 3: Escrever o teste que falha**

`apps/cms/src/lib/markdownLexical.catalogo.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { mapearPrograma } from "@/lib/cms/importacaoProgramas/mapear";
import type { ProgramaInstantaneo } from "@/lib/cms/importacaoProgramas/tipos";
import instantaneo from "@/seed/assets/programas.json";

import { idaEVoltaPreserva, markdownParaLexical } from "./markdownLexical";

function paragrafo(...filhos: unknown[]) {
  return { root: { type: "root", children: [{ type: "paragraph", children: filhos }] } };
}

describe("idaEVoltaPreserva", () => {
  it("texto com negrito e itálico separados sobrevive", () => {
    expect(idaEVoltaPreserva(markdownParaLexical("Um **forte** e *suave*.\n\n- item\n- outro"))).toBe(true);
  });
  it("negrito+itálico no mesmo trecho é perda (o Markdown leve só guarda o negrito)", () => {
    expect(idaEVoltaPreserva(paragrafo({ type: "text", text: "ambos", format: 3 }))).toBe(false);
  });
  it("sublinhado é ignorado na comparação — não é formato que o painel edita", () => {
    expect(idaEVoltaPreserva(paragrafo({ type: "text", text: "sub", format: 8 }))).toBe(true);
  });
  it("documento vazio ou nulo preserva", () => {
    expect(idaEVoltaPreserva(null)).toBe(true);
  });
});

describe("conteúdo real dos 15 programas (instantâneo de 30/09)", () => {
  const programas = (instantaneo as { programas: ProgramaInstantaneo[] }).programas;
  const perdas: string[] = [];
  for (const p of programas) {
    const { campos, modulos } = mapearPrograma(p);
    const textos = { visaoGeral: campos.visaoGeral, problema: campos.problema, objetivo: campos.objetivo, publicoAlvo: campos.publicoAlvo };
    for (const [chave, doc] of Object.entries(textos)) {
      if (doc && !idaEVoltaPreserva(doc)) perdas.push(`${p.sigla}.${chave}`);
    }
    for (const m of modulos) if (!idaEVoltaPreserva(m.ementa)) perdas.push(`${p.sigla}.M${m.numero}.ementa`);
  }

  it("enumera os campos com perda no round-trip (decide se o aviso da tela aparece na prática)", () => {
    // Se este snapshot mudar, a lista de campos com perda mudou: revisar o aviso por campo da tela.
    expect(perdas).toMatchSnapshot();
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- markdownLexical.catalogo`
Expected: FAIL — `idaEVoltaPreserva` não exportado. (Se o import do JSON falhar por `resolveJsonModule`, conferir `apps/cms/tsconfig.json`: o seed `importarProgramas.ts` já importa esse JSON, então a opção existe.)

- [ ] **Step 5: Implementar no fim de `apps/cms/src/lib/markdownLexical.ts`**

```ts
interface Trecho {
  t: string;
  f: number;
  url: string;
}

/** Trechos de texto de um bloco, com só os formatos que o Markdown leve representa. */
function trechosDe(nos: unknown[], url = ""): Trecho[] {
  const saida: Trecho[] = [];
  for (const no of nos) {
    if (!no || typeof no !== "object") continue;
    const n = no as Record<string, unknown>;
    if (n.type === "text") {
      saida.push({ t: String(n.text ?? ""), f: Number(n.format ?? 0) & (FORMATO_BOLD | FORMATO_ITALIC), url });
    } else if (n.type === "linebreak") {
      saida.push({ t: " ", f: 0, url });
    } else if (n.type === "link") {
      const destino = (n.fields as { url?: string } | undefined)?.url ?? "";
      saida.push(...trechosDe(Array.isArray(n.children) ? n.children : [], destino));
    } else if (Array.isArray(n.children)) {
      saida.push(...trechosDe(n.children, url));
    }
  }
  const juntos: Trecho[] = [];
  for (const tr of saida) {
    const ultimo = juntos[juntos.length - 1];
    if (ultimo && ultimo.f === tr.f && ultimo.url === tr.url) ultimo.t += tr.t;
    else juntos.push({ ...tr });
  }
  return juntos
    .map((j) => ({ ...j, t: j.t.replace(/\s+/g, " ") }))
    .filter((j) => j.t.trim() !== "")
    .map((j, i, arr) => ({
      ...j,
      t: i === 0 ? j.t.trimStart() : i === arr.length - 1 ? j.t.trimEnd() : j.t,
    }));
}

/** Projeção comparável de um documento: um item por bloco (ou por item de lista). */
function projecao(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "[]";
  const filhos = (doc as { root?: { children?: unknown[] } }).root?.children ?? [];
  const blocos: unknown[] = [];
  for (const no of filhos) {
    if (!no || typeof no !== "object") continue;
    const n = no as Record<string, unknown>;
    const netos = Array.isArray(n.children) ? n.children : [];
    if (n.type === "list") {
      for (const item of netos) {
        const it = item as Record<string, unknown>;
        blocos.push({ tipo: `li-${String(n.listType)}`, trechos: trechosDe(Array.isArray(it?.children) ? it.children : []) });
      }
      continue;
    }
    const trechos = trechosDe(netos);
    const conhecido = n.type === "paragraph" || n.type === "heading" || n.type === "quote";
    if (conhecido && trechos.length === 0) continue;
    blocos.push({ tipo: n.type, tag: n.type === "heading" ? n.tag : undefined, trechos });
  }
  return JSON.stringify(blocos);
}

/**
 * O documento sobrevive à ida e volta pelo editor do painel (Lexical →
 * Markdown leve → Lexical)? `false` = salvar o campo descartaria algo
 * (ex.: negrito+itálico no mesmo trecho, bloco de tipo desconhecido).
 */
export function idaEVoltaPreserva(doc: unknown): boolean {
  return projecao(doc) === projecao(markdownParaLexical(lexicalParaMarkdown(doc)));
}
```

- [ ] **Step 6: Rodar e ver passar; inspecionar o snapshot**

Run: `pnpm --filter @ntc/cms test -- markdownLexical.catalogo && cat apps/cms/src/lib/__snapshots__/markdownLexical.catalogo.test.ts.snap`
Expected: PASS; o snapshot gravado lista os campos com perda (pode ser `[]`). Anotar a lista no relatório da task — ela vai para o CLAUDE.md na Task 9.

- [ ] **Step 7: Rodar a suíte inteira do cms (a capa opcional não pode quebrar nada)**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src/collections/Programas.ts packages/types/src/payload-types.ts apps/cms/src/lib/markdownLexical.ts apps/cms/src/lib/markdownLexical.catalogo.test.ts apps/cms/src/lib/__snapshots__
git commit -m "feat(cms): capa do programa opcional e detector de perda no round-trip Markdown

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Dependentes e hooks `beforeDelete`

**Files:**
- Create: `apps/cms/src/lib/crm/exclusaoCatalogo.ts`
- Create: `apps/cms/src/lib/crm/exclusaoCatalogo.test.ts`
- Modify: `apps/cms/src/collections/Programas.ts` (acrescentar `hooks: { beforeDelete: [bloquearProgramaComDependentes] }`)
- Modify: `apps/cms/src/collections/Modulos.ts` (acrescentar `hooks: { beforeDelete: [bloquearModuloComDependentes] }`)

**Interfaces:**
- Consumes: `podeExcluirPrograma`, `podeExcluirModulo`, `DependentesPrograma`, `DependentesModulo` (Task 1).
- Produces:
  - `contarDependentesPrograma(payload: Payload, id: string | number, req?: PayloadRequest): Promise<DependentesPrograma>`
  - `contarDependentesModulo(payload: Payload, id: string | number, req?: PayloadRequest): Promise<DependentesModulo>`
  - `bloquearProgramaComDependentes: CollectionBeforeDeleteHook`, `bloquearModuloComDependentes: CollectionBeforeDeleteHook`

Antes de escrever, confirmar em `packages/types/src/payload-types.ts` os nomes: `Evento.programa`, `Especialista.programasRelacionados`, `Lead.programa`, `Proposta.programa`, `Proposta.modulos`, `Proposta.modulosDetalhados[].modulo`, `EventosComerciai*.moduloCatalogo`. Se algum estiver dentro de um `group` nomeado, o `where` usa o caminho com ponto (`grupo.campo`).

- [ ] **Step 1: Escrever os testes que falham**

`apps/cms/src/lib/crm/exclusaoCatalogo.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import {
  bloquearModuloComDependentes,
  bloquearProgramaComDependentes,
  contarDependentesModulo,
  contarDependentesPrograma,
} from "./exclusaoCatalogo";

function payloadComContagens(por: Record<string, number>) {
  const count = vi.fn(async ({ collection }: { collection: string }) => ({ totalDocs: por[collection] ?? 0 }));
  return { count };
}

type Hook = (args: Record<string, unknown>) => Promise<void>;

describe("contarDependentesPrograma", () => {
  it("conta as cinco coleções com o where certo", async () => {
    const payload = payloadComContagens({ modulos: 2, propostas: 1, leads: 0, eventos: 3, especialistas: 1 });
    const d = await contarDependentesPrograma(payload as never, 7);
    expect(d).toEqual({ modulos: 2, propostas: 1, leads: 0, eventos: 3, especialistas: 1 });
    expect(payload.count).toHaveBeenCalledWith(expect.objectContaining({ collection: "modulos", where: { programa: { equals: 7 } } }));
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "especialistas", where: { programasRelacionados: { equals: 7 } } }),
    );
  });
});

describe("contarDependentesModulo", () => {
  it("proposta conta por modulos OU modulosDetalhados.modulo", async () => {
    const payload = payloadComContagens({ propostas: 1, "eventos-comerciais": 2 });
    expect(await contarDependentesModulo(payload as never, 9)).toEqual({ propostas: 1, eventosComerciais: 2 });
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "propostas",
        where: { or: [{ modulos: { equals: 9 } }, { "modulosDetalhados.modulo": { equals: 9 } }] },
      }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "eventos-comerciais", where: { moduloCatalogo: { equals: 9 } } }),
    );
  });
});

describe("hooks beforeDelete", () => {
  it("programa sem dependentes passa", async () => {
    const payload = payloadComContagens({});
    await expect((bloquearProgramaComDependentes as unknown as Hook)({ id: 1, req: { payload } })).resolves.toBeUndefined();
  });
  it("programa com módulo falha fechado com a mensagem da regra", async () => {
    const payload = payloadComContagens({ modulos: 1 });
    await expect((bloquearProgramaComDependentes as unknown as Hook)({ id: 1, req: { payload } })).rejects.toThrow(
      "Vinculado a 1 módulo — exclua ou desvincule antes.",
    );
  });
  it("módulo usado em proposta falha fechado", async () => {
    const payload = payloadComContagens({ propostas: 1 });
    await expect((bloquearModuloComDependentes as unknown as Hook)({ id: 1, req: { payload } })).rejects.toThrow(
      "Usado em 1 proposta — não pode ser excluído.",
    );
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- exclusaoCatalogo`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar**

`apps/cms/src/lib/crm/exclusaoCatalogo.ts`:

```ts
import type { CollectionBeforeDeleteHook, Payload, PayloadRequest } from "payload";

import { podeExcluirModulo, podeExcluirPrograma, type DependentesModulo, type DependentesPrograma } from "@ntc/lib";

/**
 * Dependentes de programa e módulo do catálogo (spec catálogo §6). Uma só
 * contagem para a tela (estado do botão), a escrita (recusa antes do delete)
 * e o hook `beforeDelete` (falha fechado se a UI for contornada).
 *
 * Referências em `areas.programasDestacados` e em `programasRelacionados` de
 * outros programas NÃO bloqueiam: são hasMany em tabela `_rels`, que o banco
 * limpa sozinho no delete.
 */
export async function contarDependentesPrograma(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<DependentesPrograma> {
  const [modulos, propostas, leads, eventos, especialistas] = await Promise.all([
    payload.count({ collection: "modulos", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "propostas", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "leads", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "eventos", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "especialistas", where: { programasRelacionados: { equals: id } }, req }),
  ]);
  return {
    modulos: modulos.totalDocs,
    propostas: propostas.totalDocs,
    leads: leads.totalDocs,
    eventos: eventos.totalDocs,
    especialistas: especialistas.totalDocs,
  };
}

/**
 * Proposta conta pelos dois caminhos: `modulos` (os contratados) e
 * `modulosDetalhados.modulo` (o conteúdo congelado do documento) — apagar um
 * módulo referenciado só pelo segundo dispararia o fail-safe da Sessão 2
 * (tabela por módulo some do PDF).
 */
export async function contarDependentesModulo(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<DependentesModulo> {
  const [propostas, eventosComerciais] = await Promise.all([
    payload.count({
      collection: "propostas",
      where: { or: [{ modulos: { equals: id } }, { "modulosDetalhados.modulo": { equals: id } }] },
      req,
    }),
    payload.count({ collection: "eventos-comerciais", where: { moduloCatalogo: { equals: id } }, req }),
  ]);
  return { propostas: propostas.totalDocs, eventosComerciais: eventosComerciais.totalDocs };
}

export const bloquearProgramaComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const r = podeExcluirPrograma(await contarDependentesPrograma(req.payload, id, req));
  if (!r.ok) throw new Error(r.motivo);
};

export const bloquearModuloComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const r = podeExcluirModulo(await contarDependentesModulo(req.payload, id, req));
  if (!r.ok) throw new Error(r.motivo);
};
```

Registrar nas coleções — `Programas.ts` (import no topo, ao lado dos outros, e chave `hooks` logo depois de `versions`):

```ts
import { bloquearProgramaComDependentes } from "../lib/crm/exclusaoCatalogo";
// ...
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { beforeDelete: [bloquearProgramaComDependentes] },
```

`Modulos.ts` (import no topo; `hooks` logo depois de `access`):

```ts
import { bloquearModuloComDependentes } from "../lib/crm/exclusaoCatalogo";
// ...
  hooks: { beforeDelete: [bloquearModuloComDependentes] },
```

(Conferir o caminho de import relativo usado por `ClientesCrm.ts` para `bloquearClienteComDependentes` e seguir o mesmo estilo — `@/lib/...` ou relativo.)

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- exclusaoCatalogo && pnpm --filter @ntc/cms typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/crm/exclusaoCatalogo.ts apps/cms/src/lib/crm/exclusaoCatalogo.test.ts apps/cms/src/collections/Programas.ts apps/cms/src/collections/Modulos.ts
git commit -m "feat(crm): bloqueia excluir programa ou modulo com dependentes

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Leitura do catálogo e wizard só com publicados

**Files:**
- Create: `apps/cms/src/lib/cms/catalogoCrm.ts`
- Create: `apps/cms/src/lib/cms/catalogoCrm.test.ts`
- Create: `apps/cms/src/lib/cms/painelCrm.catalogo.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCrm.ts` — remover `ProgramaCrmResumo`, `ModuloCrmResumo`, `listarProgramasCrm`, `listarModulosCrm` (migram); alterar `obterCatalogoCrm`
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx`, `ShellCrm.tsx`, `TelaProgramas.tsx`, `TelaModulos.tsx` — só os imports (`@/lib/cms/catalogoCrm`), para o typecheck fechar; `areas` entra na Task 6

**Interfaces:**
- Consumes: `situacaoPrograma`, `CAMPOS_TEXTO_PROGRAMA`, `CampoTextoPrograma`, `SituacaoPrograma`, `DependentesPrograma`, `DependentesModulo` (Task 1); `lexicalParaMarkdown`, `idaEVoltaPreserva` (Task 2); `contarDependentesPrograma/Modulo` (Task 3); `obterPayload` (`@/lib/payloadClient`).
- Produces:

```ts
export interface AreaOpcao { id: string; nome: string }
export interface ProgramaCrmResumo { id: string; sigla: string; nome: string; areaId: string | null; area: string | null; situacao: SituacaoPrograma; numModulos: number }
export interface ModuloCrmResumo { id: string; numero: number; titulo: string; tituloComercial: string | null; programaId: string | null; programaSigla: string | null; valor: number | null; replay: string | null; certificacao: string | null }
export interface ModuloDoPrograma { id: string; numero: number; titulo: string; cargaHoraria: string | null }
export interface ProgramaCatalogoDetalhe {
  id: string; situacao: SituacaoPrograma; sigla: string; nomeCompleto: string; areaId: string; cargaHorariaTotal: string;
  textos: Record<CampoTextoPrograma, string>; textosComPerda: CampoTextoPrograma[];
  eixos: ItemTituloDescricao[]; diferenciais: ItemTituloDescricao[]; resultados: string[];
  modulos: ModuloDoPrograma[]; dependentes: DependentesPrograma;
}
export interface ModuloCatalogoDetalhe {
  id: string; programaId: string; numero: string; titulo: string; ementa: string; ementaComPerda: boolean; cargaHoraria: string;
  tituloComercial: string; valor: string; replay: string; certificacao: string; dependentes: DependentesModulo;
}
export async function listarAreasCrm(): Promise<AreaOpcao[]>
export async function listarProgramasCrm(): Promise<ProgramaCrmResumo[]>
export async function listarModulosCrm(): Promise<ModuloCrmResumo[]>
export async function situacaoDoPrograma(payload: Payload, id: string | number, req?: PayloadRequest): Promise<SituacaoPrograma>
export async function obterProgramaCatalogo(id: string): Promise<ProgramaCatalogoDetalhe | null>
export async function obterModuloCatalogo(id: string): Promise<ModuloCatalogoDetalhe | null>
```

`valor` do módulo detalhe vem formatado para edição: `null` → `""`, número → `String(n).replace(".", ",")`.

- [ ] **Step 1: Escrever os testes que falham**

`apps/cms/src/lib/cms/catalogoCrm.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { listarProgramasCrm, obterProgramaCatalogo, obterModuloCatalogo, situacaoDoPrograma } = await import("./catalogoCrm");

const negrito = {
  root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Forte", format: 1 }] }] },
};

afterEach(() => vi.clearAllMocks());

describe("listarProgramasCrm", () => {
  it("cruza a leitura publicada com a última versão para a situação, e conta módulos", async () => {
    const find = vi.fn(async (args: { collection: string; draft?: boolean }) => {
      if (args.collection === "modulos") return { docs: [{ programa: 1 }, { programa: 1 }, { programa: 2 }] };
      if (args.draft) {
        return { docs: [{ id: 1, sigla: "A", nomeCompleto: "Alfa", area: { id: 9, nome: "Educação" }, _status: "draft" }, { id: 2, sigla: "B", nomeCompleto: "Beta", area: null, _status: "draft" }] };
      }
      return { docs: [{ id: 1, _status: "published" }, { id: 2, _status: "draft" }] };
    });
    obterPayloadMock.mockResolvedValue({ find });
    const lista = await listarProgramasCrm();
    expect(lista).toEqual([
      { id: "1", sigla: "A", nome: "Alfa", areaId: "9", area: "Educação", situacao: "alteracoes-pendentes", numModulos: 2 },
      { id: "2", sigla: "B", nome: "Beta", areaId: null, area: null, situacao: "rascunho", numModulos: 1 },
    ]);
  });
});

describe("situacaoDoPrograma", () => {
  it("lê os dois status do mesmo programa", async () => {
    const findByID = vi.fn(async (a: { draft?: boolean }) => ({ _status: a.draft ? "published" : "published" }));
    expect(await situacaoDoPrograma({ findByID } as never, 3)).toBe("publicado");
  });
});

describe("obterProgramaCatalogo", () => {
  it("devolve textos em Markdown, marca perda e traz módulos e dependentes", async () => {
    const ambos = { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "x", format: 3 }] }] } };
    const findByID = vi.fn(async (a: { draft?: boolean }) =>
      a.draft
        ? {
            id: 4, _status: "draft", sigla: "EDU", nomeCompleto: "Edu", area: 2, cargaHorariaTotal: "64 horas",
            visaoGeral: negrito, problema: ambos, objetivo: null, publicoAlvo: null, metodologia: null,
            eixosTematicos: [{ titulo: "E", descricao: "D" }], diferenciais: [{ titulo: "T", descricao: null }],
            resultadosEsperados: [{ resultado: "R" }],
          }
        : { id: 4, _status: "published" },
    );
    const find = vi.fn(async () => ({ docs: [{ id: 11, numero: 1, titulo: "M1", cargaHoraria: "8h" }] }));
    const count = vi.fn(async () => ({ totalDocs: 0 }));
    obterPayloadMock.mockResolvedValue({ findByID, find, count });
    const d = await obterProgramaCatalogo("4");
    expect(d).toMatchObject({
      situacao: "alteracoes-pendentes",
      areaId: "2",
      textos: { visaoGeral: "**Forte**", objetivo: "" },
      textosComPerda: ["problema"],
      eixos: [{ titulo: "E", descricao: "D" }],
      diferenciais: [{ titulo: "T", descricao: "" }],
      resultados: ["R"],
      modulos: [{ id: "11", numero: 1, titulo: "M1", cargaHoraria: "8h" }],
      dependentes: { modulos: 0, propostas: 0, leads: 0, eventos: 0, especialistas: 0 },
    });
  });
  it("id inexistente devolve null", async () => {
    obterPayloadMock.mockResolvedValue({ findByID: vi.fn(async () => { throw new Error("Not Found"); }) });
    expect(await obterProgramaCatalogo("999")).toBeNull();
  });
});

describe("obterModuloCatalogo", () => {
  it("formata o valor para edição e converte a ementa", async () => {
    const findByID = vi.fn(async () => ({
      id: 5, programa: { id: 4 }, numero: 2, titulo: "T", ementa: negrito, cargaHoraria: null,
      comercial: { tituloComercial: null, valor: 1500.5, replay: "90 dias", certificacao: null },
    }));
    const count = vi.fn(async () => ({ totalDocs: 0 }));
    obterPayloadMock.mockResolvedValue({ findByID, count });
    expect(await obterModuloCatalogo("5")).toMatchObject({
      programaId: "4", numero: "2", ementa: "**Forte**", ementaComPerda: false, cargaHoraria: "",
      tituloComercial: "", valor: "1500,5", replay: "90 dias", certificacao: "",
      dependentes: { propostas: 0, eventosComerciais: 0 },
    });
  });
});
```

`apps/cms/src/lib/cms/painelCrm.catalogo.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterCatalogoCrm } = await import("./painelCrm");

describe("obterCatalogoCrm (wizard de proposta)", () => {
  it("lista só programas publicados e só módulos deles", async () => {
    const find = vi.fn(async (a: { collection: string; where?: unknown; draft?: boolean }) => {
      if (a.collection === "programas") {
        expect(a.where).toEqual({ _status: { equals: "published" } });
        expect(a.draft).toBe(false);
        return { docs: [{ id: 1, sigla: "PUB", nomeCompleto: "Publicado" }] };
      }
      if (a.collection === "modulos") return { docs: [{ id: 10, titulo: "Do publicado", numero: 1, programa: 1 }, { id: 11, titulo: "De rascunho", numero: 1, programa: 2 }] };
      return { docs: [] };
    });
    obterPayloadMock.mockResolvedValue({ find });
    const c = await obterCatalogoCrm();
    expect(c.programas.map((p) => p.sigla)).toEqual(["PUB"]);
    expect(c.modulos.map((m) => m.id)).toEqual(["10"]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- catalogoCrm painelCrm.catalogo`
Expected: FAIL — `./catalogoCrm` não existe; o teste do wizard falha no `expect(a.where)`.

- [ ] **Step 3: Implementar `catalogoCrm.ts`**

```ts
import "server-only";

import {
  CAMPOS_TEXTO_PROGRAMA,
  situacaoPrograma,
  type CampoTextoPrograma,
  type DependentesModulo,
  type DependentesPrograma,
  type ItemTituloDescricao,
  type SituacaoPrograma,
} from "@ntc/lib";
import type { Payload, PayloadRequest } from "payload";

import { contarDependentesModulo, contarDependentesPrograma } from "@/lib/crm/exclusaoCatalogo";
import { idaEVoltaPreserva, lexicalParaMarkdown } from "@/lib/markdownLexical";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura do catálogo comercial gerido pelo CRM (spec catálogo §2–§4).
 * Programas têm rascunho: a situação cruza a linha principal (sem `draft`)
 * com a última versão (`draft: true`) — ver `situacaoPrograma`.
 */

export interface AreaOpcao {
  id: string;
  nome: string;
}

export interface ProgramaCrmResumo {
  id: string;
  sigla: string;
  nome: string;
  areaId: string | null;
  area: string | null;
  situacao: SituacaoPrograma;
  numModulos: number;
}

export interface ModuloCrmResumo {
  id: string;
  numero: number;
  titulo: string;
  tituloComercial: string | null;
  programaId: string | null;
  programaSigla: string | null;
  valor: number | null;
  replay: string | null;
  certificacao: string | null;
}

export interface ModuloDoPrograma {
  id: string;
  numero: number;
  titulo: string;
  cargaHoraria: string | null;
}

export interface ProgramaCatalogoDetalhe {
  id: string;
  situacao: SituacaoPrograma;
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  textos: Record<CampoTextoPrograma, string>;
  /** Campos cujo conteúdo atual não sobrevive ao editor — salvar o campo perderia formatação. */
  textosComPerda: CampoTextoPrograma[];
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
  modulos: ModuloDoPrograma[];
  dependentes: DependentesPrograma;
}

export interface ModuloCatalogoDetalhe {
  id: string;
  programaId: string;
  numero: string;
  titulo: string;
  ementa: string;
  ementaComPerda: boolean;
  cargaHoraria: string;
  tituloComercial: string;
  valor: string;
  replay: string;
  certificacao: string;
  dependentes: DependentesModulo;
}

function idDe(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return null;
}

function nomeDe(v: unknown, campo: string): string | null {
  if (v && typeof v === "object" && campo in v) {
    const x = (v as Record<string, unknown>)[campo];
    return typeof x === "string" ? x : null;
  }
  return null;
}

export async function listarAreasCrm(): Promise<AreaOpcao[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "areas", depth: 0, limit: 50, sort: "nome" });
  return res.docs.map((a) => ({ id: String(a.id), nome: a.nome }));
}

export async function listarProgramasCrm(): Promise<ProgramaCrmResumo[]> {
  const payload = await obterPayload();
  const [ultimas, principais, modulos] = await Promise.all([
    payload.find({ collection: "programas", depth: 1, limit: 200, draft: true, sort: "sigla" }),
    payload.find({ collection: "programas", depth: 0, limit: 200, draft: false, select: { _status: true } }),
    payload.find({ collection: "modulos", depth: 0, limit: 2000, select: { programa: true } }),
  ]);
  const statusPrincipal = new Map(principais.docs.map((p) => [String(p.id), p._status]));
  const contagem = new Map<string, number>();
  for (const m of modulos.docs) {
    const pid = idDe(m.programa);
    if (pid !== null) contagem.set(pid, (contagem.get(pid) ?? 0) + 1);
  }
  return ultimas.docs.map((p) => ({
    id: String(p.id),
    sigla: p.sigla ?? "",
    nome: p.nomeCompleto ?? "",
    areaId: idDe(p.area),
    area: nomeDe(p.area, "nome"),
    situacao: situacaoPrograma(statusPrincipal.get(String(p.id)), p._status),
    numModulos: contagem.get(String(p.id)) ?? 0,
  }));
}

export async function listarModulosCrm(): Promise<ModuloCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "modulos", depth: 1, limit: 2000, sort: "numero" });
  return res.docs.map((m) => ({
    id: String(m.id),
    numero: m.numero,
    titulo: m.titulo,
    tituloComercial: m.comercial?.tituloComercial ?? null,
    programaId: idDe(m.programa),
    programaSigla: nomeDe(m.programa, "sigla"),
    valor: m.comercial?.valor ?? null,
    replay: m.comercial?.replay ?? null,
    certificacao: m.comercial?.certificacao ?? null,
  }));
}

export async function situacaoDoPrograma(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<SituacaoPrograma> {
  const [principal, ultima] = await Promise.all([
    payload.findByID({ collection: "programas", id, depth: 0, draft: false, req }),
    payload.findByID({ collection: "programas", id, depth: 0, draft: true, req }),
  ]);
  return situacaoPrograma(principal._status, ultima._status);
}

export async function obterProgramaCatalogo(id: string): Promise<ProgramaCatalogoDetalhe | null> {
  const payload = await obterPayload();
  try {
    const [principal, p] = await Promise.all([
      payload.findByID({ collection: "programas", id, depth: 0, draft: false }),
      payload.findByID({ collection: "programas", id, depth: 0, draft: true }),
    ]);
    const [modulos, dependentes] = await Promise.all([
      payload.find({ collection: "modulos", where: { programa: { equals: id } }, depth: 0, limit: 200, sort: "numero" }),
      contarDependentesPrograma(payload, id),
    ]);
    const textos = {} as Record<CampoTextoPrograma, string>;
    const textosComPerda: CampoTextoPrograma[] = [];
    for (const { chave } of CAMPOS_TEXTO_PROGRAMA) {
      const doc: unknown = p[chave];
      textos[chave] = lexicalParaMarkdown(doc);
      if (!idaEVoltaPreserva(doc)) textosComPerda.push(chave);
    }
    return {
      id: String(p.id),
      situacao: situacaoPrograma(principal._status, p._status),
      sigla: p.sigla ?? "",
      nomeCompleto: p.nomeCompleto ?? "",
      areaId: idDe(p.area) ?? "",
      cargaHorariaTotal: p.cargaHorariaTotal ?? "",
      textos,
      textosComPerda,
      eixos: (p.eixosTematicos ?? []).map((e) => ({ titulo: e.titulo ?? "", descricao: e.descricao ?? "" })),
      diferenciais: (p.diferenciais ?? []).map((d) => ({ titulo: d.titulo ?? "", descricao: d.descricao ?? "" })),
      resultados: (p.resultadosEsperados ?? []).map((r) => r.resultado ?? ""),
      modulos: modulos.docs.map((m) => ({ id: String(m.id), numero: m.numero, titulo: m.titulo, cargaHoraria: m.cargaHoraria ?? null })),
      dependentes,
    };
  } catch (e) {
    console.error("[obterProgramaCatalogo]", e);
    return null;
  }
}

export async function obterModuloCatalogo(id: string): Promise<ModuloCatalogoDetalhe | null> {
  const payload = await obterPayload();
  try {
    const m = await payload.findByID({ collection: "modulos", id, depth: 0 });
    const dependentes = await contarDependentesModulo(payload, id);
    const valor = m.comercial?.valor;
    return {
      id: String(m.id),
      programaId: idDe(m.programa) ?? "",
      numero: String(m.numero),
      titulo: m.titulo,
      ementa: lexicalParaMarkdown(m.ementa),
      ementaComPerda: !idaEVoltaPreserva(m.ementa),
      cargaHoraria: m.cargaHoraria ?? "",
      tituloComercial: m.comercial?.tituloComercial ?? "",
      valor: valor === null || valor === undefined ? "" : String(valor).replace(".", ","),
      replay: m.comercial?.replay ?? "",
      certificacao: m.comercial?.certificacao ?? "",
      dependentes,
    };
  } catch (e) {
    console.error("[obterModuloCatalogo]", e);
    return null;
  }
}
```

Se o `select` do Payload 3.18 não aceitar `_status` no tipo, trocar por `depth: 0` sem `select` (o volume é pequeno) — não usar cast.

- [ ] **Step 4: Alterar `painelCrm.ts`**

Remover as interfaces `ProgramaCrmResumo` e `ModuloCrmResumo` e as funções `listarProgramasCrm`/`listarModulosCrm` (linhas ~113–129 e ~711–735). Em `obterCatalogoCrm`, substituir as duas primeiras leituras e o mapeamento de módulos:

```ts
  const [programas, modulos, eventos, especialistas] = await Promise.all([
    // Só publicados (spec catálogo §3.2): `criarProposta` lê a versão publicada,
    // então um rascunho no wizard criaria proposta com conteúdo vazio/antigo.
    payload.find({
      collection: "programas",
      depth: 0,
      limit: 200,
      draft: false,
      where: { _status: { equals: "published" } },
      sort: "sigla",
    }),
    payload.find({ collection: "modulos", depth: 0, limit: 2000, draft: true, sort: "numero" }),
    payload.find({ collection: "eventos", depth: 0, limit: 500, draft: true, sort: "nome" }),
    payload.find({ collection: "especialistas", depth: 0, limit: 500, draft: true, sort: "nome" }),
  ]);
  const publicados = new Set(programas.docs.map((p) => String(p.id)));
  return {
    programas: programas.docs.map((p) => ({ id: String(p.id), sigla: p.sigla ?? "", nome: p.nomeCompleto ?? "" })),
    modulos: modulos.docs
      .filter((m) => {
        const pid = idRel(m.programa);
        return pid !== null && publicados.has(pid);
      })
      .map((m) => ({ id: String(m.id), titulo: m.titulo, numero: m.numero, programaId: idRel(m.programa) })),
```

(manter o resto — `eventos` e `especialistas` — como está). Remover imports que ficarem sem uso (`Programa`, `Modulo` de `@ntc/types`, se só eram usados ali).

- [ ] **Step 5: Reapontar imports das telas e da página**

- `page.tsx`: importar `listarProgramasCrm`, `listarModulosCrm`, `type ProgramaCrmResumo`, `type ModuloCrmResumo` de `@/lib/cms/catalogoCrm` (e tirá-los do import de `@/lib/cms/painelCrm`).
- `ShellCrm.tsx`: importar `type ProgramaCrmResumo`, `type ModuloCrmResumo` de `@/lib/cms/catalogoCrm`.
- `TelaProgramas.tsx`/`TelaModulos.tsx`: trocar o import de tipo para `@/lib/cms/catalogoCrm`.

- [ ] **Step 6: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- catalogoCrm painelCrm && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: PASS, 0 erros.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/lib/cms/catalogoCrm.ts apps/cms/src/lib/cms/catalogoCrm.test.ts apps/cms/src/lib/cms/painelCrm.ts apps/cms/src/lib/cms/painelCrm.catalogo.test.ts "apps/cms/src/app/(painel)/crm"
git commit -m "feat(crm): leitura do catalogo com situacao e wizard so com programas publicados

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Escrita do catálogo e Server Actions

**Files:**
- Create: `apps/cms/src/lib/cms/catalogoCrmEscrita.ts`
- Create: `apps/cms/src/lib/cms/catalogoCrmEscrita.test.ts`
- Create: `apps/cms/src/app/(painel)/acoesCatalogo.ts`
- Create: `apps/cms/src/app/(painel)/acoesCatalogo.test.ts`

**Interfaces:**
- Consumes: Task 1 (`faltasParaRascunho`, `faltasParaPublicar`, `semItensVazios`, `semResultadosVazios`, `lerNumeroModulo`, `podeExcluirPrograma`, `podeExcluirModulo`, `quantidadeModulosVaiPublicado`, `CampoTextoPrograma`, `ItemTituloDescricao`); Task 2 (`markdownParaLexical`, `lexicalParaMarkdown`); Task 3 (`contarDependentesPrograma/Modulo`); Task 4 (`situacaoDoPrograma`, `obterProgramaCatalogo`, `obterModuloCatalogo`, tipos de detalhe); `executarEmTransacao`; `numeroOuNulo` (exportado de `@/lib/cms/painelCrmEscrita`); `ResultadoEscrita` (`@/lib/cms/painelCmsEscrita`); `UsuarioAutenticado`, `obterUsuarioAutenticado`, `obterUsuarioCms` (`@/lib/cms/autenticacao`).
- Produces:

```ts
// catalogoCrmEscrita.ts
export interface DadosPrograma {
  sigla: string; nomeCompleto: string; areaId: string; cargaHorariaTotal: string;
  /** Só os textos que o usuário alterou (ou todos, num programa novo). Campo ausente = não tocar. */
  textos: Partial<Record<CampoTextoPrograma, string>>;
  eixos: ItemTituloDescricao[]; diferenciais: ItemTituloDescricao[]; resultados: string[];
}
export interface DadosModulo {
  programaId: string; numero: string; titulo: string; ementa: string; cargaHoraria: string;
  tituloComercial: string; valor: string; replay: string; certificacao: string;
}
export type ResultadoComId = ResultadoEscrita & { id?: string };
export async function salvarPrograma(id: string | null, dados: DadosPrograma, publicar: boolean, usuario: UsuarioAutenticado): Promise<ResultadoComId>
export async function excluirPrograma(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita>
export async function salvarModulo(id: string | null, dados: DadosModulo, usuario: UsuarioAutenticado): Promise<ResultadoComId>
export async function excluirModulo(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita>

// acoesCatalogo.ts ("use server")
export async function carregarProgramaCatalogoCrm(id: string): Promise<ProgramaCatalogoDetalhe | null>
export async function salvarProgramaCatalogoCrm(id: string | null, dados: DadosPrograma, publicar: boolean): Promise<ResultadoComId>
export async function excluirProgramaCatalogoCrm(id: string): Promise<ResultadoEscrita>
export async function carregarModuloCatalogoCrm(id: string): Promise<ModuloCatalogoDetalhe | null>
export async function salvarModuloCatalogoCrm(id: string | null, dados: DadosModulo): Promise<ResultadoComId>
export async function excluirModuloCatalogoCrm(id: string): Promise<ResultadoEscrita>
```

Regras de escrita (todas dentro de `executarEmTransacao`, validações **antes** de escrever):
- Programa: `sigla` gravada `trim().toUpperCase()`; listas passam por `semItensVazios`/`semResultadosVazios`; rascunho exige `faltasParaRascunho` vazio; publicar exige `faltasParaPublicar` vazio, com `visaoGeral` = `dados.textos.visaoGeral` se enviado, senão o Markdown da última versão gravada (`lexicalParaMarkdown` da leitura `draft: true`). Mensagem de faltas: `"Para publicar, preencha: Área, Visão geral."` / `"Para salvar, preencha: Sigla."`.
- Sigla duplicada: `payload.find({ collection: "programas", where: { and: [{ sigla: { equals: SIGLA } }, ...(id ? [{ id: { not_equals: id } }] : [])] }, draft: true, limit: 1, depth: 0, req })` com algum doc → `"Já existe um programa com a sigla EDUTEC."`.
- Texto vazio (`trim() === ""`) grava `null`; senão `markdownParaLexical(texto)`.
- Escrita: novo → `payload.create({ collection: "programas", data: { ...campos, _status: publicar ? "published" : "draft" }, draft: !publicar, req })`; existente → `payload.update({ collection: "programas", id, data: { ...campos, _status: publicar ? "published" : "draft" }, draft: !publicar, req })`. `area` grava `Number(areaId)` ou `null`; `eixosTematicos` = `eixos`, `diferenciais`, `resultadosEsperados` = `resultados.map((resultado) => ({ resultado }))`.
- Módulo: `lerNumeroModulo` (null → `"Número do módulo deve ser um inteiro a partir de 1."`); obrigatórios programa, título, ementa (`"Preencha: Programa, Título, Ementa."` com só os faltantes); valor: vazio → `null`, `numeroOuNulo` null com texto não-vazio → `"Valor de referência inválido."`, negativo → mesma mensagem; unicidade: `payload.count({ collection: "modulos", where: { and: [{ programa: { equals: programaId } }, { numero: { equals: n } }, ...(id ? [{ id: { not_equals: id } }] : [])] }, req })` > 0 → `"Já existe o módulo ${n} em ${sigla}."` (sigla via `findByID` do programa de destino, `draft: true`).
- Recálculo `modulosQuantidade(programaId)`: `count` de `modulos` do programa (com `req`) → `situacaoDoPrograma(payload, programaId, req)` → se `quantidadeModulosVaiPublicado` → `payload.update({ collection: "programas", id: programaId, data: { modulosQuantidade: n }, req })`; senão `payload.update({ ..., data: { modulosQuantidade: n, _status: "draft" }, draft: true, req })`. Chamado depois de criar módulo, excluir módulo, e para **os dois** programas quando `salvarModulo` muda o programa (ler o programa anterior com `findByID` do módulo antes de atualizar).
- Exclusão: `contarDependentes*` com `req` → regra → `{ ok: false, erro: motivo }` antes de qualquer escrita → `payload.delete({ collection, id, req })` → (módulo) recálculo.
- Erro inesperado: `console.error("[nomeDaFuncao]", e)` e `{ ok: false, erro: "Não foi possível salvar. Tente novamente." }`.

- [ ] **Step 1: Escrever os testes de escrita que falham**

`apps/cms/src/lib/cms/catalogoCrmEscrita.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const { salvarPrograma, excluirPrograma, salvarModulo, excluirModulo } = await import("./catalogoCrmEscrita");
type DadosPrograma = Parameters<typeof salvarPrograma>[1];
type DadosModulo = Parameters<typeof salvarModulo>[1];

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

interface Opcoes {
  siglaEmUso?: boolean;
  numeroEmUso?: boolean;
  statusPrincipal?: string;
  statusUltima?: string;
  contagens?: Record<string, number>;
  moduloAtual?: Record<string, unknown>;
  programaGravado?: Record<string, unknown>;
}

function payloadFalso(o: Opcoes = {}) {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 77, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const del = vi.fn(async () => ({ id: 1 }));
  const find = vi.fn(async () => ({ docs: o.siglaEmUso ? [{ id: 2 }] : [] }));
  const count = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "modulos" && o.numeroEmUso !== undefined) return { totalDocs: o.numeroEmUso ? 1 : 0 };
    return { totalDocs: o.contagens?.[collection] ?? 0 };
  });
  const findByID = vi.fn(async ({ collection, draft }: { collection: string; draft?: boolean }) => {
    if (collection === "modulos") return o.moduloAtual ?? { id: 9, programa: 4 };
    return {
      id: 4,
      sigla: "EDU",
      _status: draft ? (o.statusUltima ?? "published") : (o.statusPrincipal ?? "published"),
      ...(o.programaGravado ?? {}),
    };
  });
  return { create, update, delete: del, find, count, findByID };
}

const programaBase: DadosPrograma = {
  sigla: " edu ",
  nomeCompleto: "Educação",
  areaId: "2",
  cargaHorariaTotal: "64 horas",
  textos: { visaoGeral: "Texto **forte**." },
  eixos: [{ titulo: "E", descricao: "D" }, { titulo: "", descricao: "" }],
  diferenciais: [],
  resultados: ["R", " "],
};

afterEach(() => vi.clearAllMocks());

describe("salvarPrograma", () => {
  it("programa novo nasce rascunho, sigla em maiúsculas, listas sem itens vazios", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma(null, programaBase, false, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    const args = p.create.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(true);
    expect(args.data).toMatchObject({ sigla: "EDU", _status: "draft", area: 2, eixosTematicos: [{ titulo: "E", descricao: "D" }], resultadosEsperados: [{ resultado: "R" }] });
  });

  it("só grava os textos enviados — campo ausente não é tocado", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, textos: { objetivo: "" } }, false, usuario);
    const data = (p.update.mock.calls[0]![0] as { data: Record<string, unknown> }).data;
    expect(data.objetivo).toBeNull();
    expect("visaoGeral" in data).toBe(false);
    expect("problema" in data).toBe(false);
  });

  it("publicar envia os dados do formulário com _status published numa só escrita", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", programaBase, true, usuario);
    expect(r.ok).toBe(true);
    expect(p.update).toHaveBeenCalledTimes(1);
    const args = p.update.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(false);
    expect(args.data).toMatchObject({ _status: "published", nomeCompleto: "Educação" });
  });

  it("publicar sem visão geral (nem no formulário nem gravada) lista as faltas e não escreve", async () => {
    const p = payloadFalso({ programaGravado: { visaoGeral: null } });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", { ...programaBase, areaId: "", textos: {} }, true, usuario);
    expect(r).toEqual({ ok: false, erro: "Para publicar, preencha: Área, Visão geral." });
    expect(p.update).not.toHaveBeenCalled();
  });

  it("rascunho sem sigla recusa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, { ...programaBase, sigla: "" }, false, usuario)).toEqual({ ok: false, erro: "Para salvar, preencha: Sigla." });
  });

  it("sigla duplicada (comparada em maiúsculas) recusa", async () => {
    const p = payloadFalso({ siglaEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, programaBase, false, usuario)).toEqual({ ok: false, erro: "Já existe um programa com a sigla EDU." });
    expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ where: { and: [{ sigla: { equals: "EDU" } }] } }));
  });
});

describe("excluirPrograma", () => {
  it("com módulos recusa antes de apagar", async () => {
    const p = payloadFalso({ contagens: { modulos: 2 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: false, erro: "Vinculado a 2 módulos — exclua ou desvincule antes." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("sem dependentes apaga", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: "4" }));
  });
});

const moduloBase: DadosModulo = {
  programaId: "4",
  numero: "3",
  titulo: "Gestão",
  ementa: "Ementa **x**.",
  cargaHoraria: "8h",
  tituloComercial: "",
  valor: "1.500,50",
  replay: "",
  certificacao: "",
};

describe("salvarModulo", () => {
  it("cria, converte valor e recalcula modulosQuantidade publicado quando o programa está publicado", async () => {
    const p = payloadFalso({ numeroEmUso: false });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarModulo(null, moduloBase, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    expect(p.create.mock.calls[0]![0]).toMatchObject({ collection: "modulos", data: { programa: 4, numero: 3, comercial: { valor: 1500.5, tituloComercial: null } } });
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBeFalsy();
    expect("modulosQuantidade" in recalculo.data).toBe(true);
    expect("_status" in recalculo.data).toBe(false);
  });

  it("programa com alterações pendentes: recálculo grava no rascunho", async () => {
    const p = payloadFalso({ numeroEmUso: false, statusUltima: "draft" });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo(null, moduloBase, usuario);
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBe(true);
    expect(recalculo.data._status).toBe("draft");
  });

  it("número repetido no programa de destino recusa com a sigla", async () => {
    const p = payloadFalso({ numeroEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarModulo("9", moduloBase, usuario)).toEqual({ ok: false, erro: "Já existe o módulo 3 em EDU." });
    expect(p.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "modulos",
        where: { and: [{ programa: { equals: "4" } }, { numero: { equals: 3 } }, { id: { not_equals: "9" } }] },
      }),
    );
  });

  it("mudar de programa recalcula os dois", async () => {
    const p = payloadFalso({ numeroEmUso: false, moduloAtual: { id: 9, programa: 8 } });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo("9", moduloBase, usuario);
    const recalculados = p.update.mock.calls
      .filter((c) => (c[0] as { collection: string }).collection === "programas")
      .map((c) => String((c[0] as { id: unknown }).id));
    expect(recalculados.sort()).toEqual(["4", "8"]);
  });

  it("valida número, obrigatórios e valor", async () => {
    obterPayloadMock.mockResolvedValue(payloadFalso({ numeroEmUso: false }));
    expect(await salvarModulo(null, { ...moduloBase, numero: "0" }, usuario)).toEqual({ ok: false, erro: "Número do módulo deve ser um inteiro a partir de 1." });
    expect(await salvarModulo(null, { ...moduloBase, titulo: " ", ementa: "" }, usuario)).toEqual({ ok: false, erro: "Preencha: Título, Ementa." });
    expect(await salvarModulo(null, { ...moduloBase, valor: "abc" }, usuario)).toEqual({ ok: false, erro: "Valor de referência inválido." });
  });
});

describe("excluirModulo", () => {
  it("usado em proposta recusa", async () => {
    const p = payloadFalso({ contagens: { propostas: 1 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: false, erro: "Usado em 1 proposta — não pode ser excluído." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("livre: apaga e recalcula o programa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "modulos", id: "9" }));
    expect(p.update).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: 4 }));
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- catalogoCrmEscrita`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `catalogoCrmEscrita.ts`**

```ts
import "server-only";

import {
  faltasParaPublicar,
  faltasParaRascunho,
  lerNumeroModulo,
  podeExcluirModulo,
  podeExcluirPrograma,
  quantidadeModulosVaiPublicado,
  semItensVazios,
  semResultadosVazios,
  type CampoTextoPrograma,
  type ItemTituloDescricao,
} from "@ntc/lib";
import type { Payload, PayloadRequest } from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";
import { situacaoDoPrograma } from "@/lib/cms/catalogoCrm";
import { numeroOuNulo } from "@/lib/cms/painelCrmEscrita";
import { contarDependentesModulo, contarDependentesPrograma } from "@/lib/crm/exclusaoCatalogo";
import { executarEmTransacao } from "@/lib/crm/transacao";
import { lexicalParaMarkdown, markdownParaLexical } from "@/lib/markdownLexical";
import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Escrita do catálogo comercial (spec catálogo §3–§6). Validação sempre
 * ANTES da primeira escrita — um `return { ok: false }` dentro de
 * `executarEmTransacao` comita (ver o helper).
 */

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

export interface DadosPrograma {
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  /** Só os textos que o usuário alterou (todos, num programa novo). Ausente = não tocar — preserva formatação que o editor não representa. */
  textos: Partial<Record<CampoTextoPrograma, string>>;
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
}

export interface DadosModulo {
  programaId: string;
  numero: string;
  titulo: string;
  ementa: string;
  cargaHoraria: string;
  tituloComercial: string;
  valor: string;
  replay: string;
  certificacao: string;
}

export type ResultadoComId = ResultadoEscrita & { id?: string };

const textoOuNulo = (v: string) => (v.trim() === "" ? null : v.trim());
const richOuNulo = (md: string) => (md.trim() === "" ? null : markdownParaLexical(md));

async function recalcularQuantidade(payload: Payload, programaId: string | number, req: PayloadRequest): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "modulos", where: { programa: { equals: programaId } }, req });
  const situacao = await situacaoDoPrograma(payload, programaId, req);
  if (quantidadeModulosVaiPublicado(situacao)) {
    await payload.update({ collection: "programas", id: programaId, data: { modulosQuantidade: totalDocs }, req });
  } else {
    await payload.update({
      collection: "programas",
      id: programaId,
      data: { modulosQuantidade: totalDocs, _status: "draft" },
      draft: true,
      req,
    });
  }
}

export async function salvarPrograma(
  id: string | null,
  dados: DadosPrograma,
  publicar: boolean,
  usuario: UsuarioAutenticado,
): Promise<ResultadoComId> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoComId> => {
      const sigla = dados.sigla.trim().toUpperCase();
      const eixos = semItensVazios(dados.eixos);
      const diferenciais = semItensVazios(dados.diferenciais);
      const resultados = semResultadosVazios(dados.resultados);

      const faltasRascunho = faltasParaRascunho({ sigla, nomeCompleto: dados.nomeCompleto });
      if (!publicar && faltasRascunho.length > 0) return { ok: false, erro: `Para salvar, preencha: ${faltasRascunho.join(", ")}.` };

      if (publicar) {
        let visaoGeral = dados.textos.visaoGeral;
        if (visaoGeral === undefined) {
          visaoGeral = id === null ? "" : lexicalParaMarkdown((await payload.findByID({ collection: "programas", id, depth: 0, draft: true, req })).visaoGeral);
        }
        const faltas = faltasParaPublicar({ sigla, nomeCompleto: dados.nomeCompleto, areaId: dados.areaId, cargaHorariaTotal: dados.cargaHorariaTotal, visaoGeral, eixos, diferenciais, resultados });
        if (faltas.length > 0) return { ok: false, erro: `Para publicar, preencha: ${faltas.join(", ")}.` };
      }

      const repetida = await payload.find({
        collection: "programas",
        where: { and: [{ sigla: { equals: sigla } }, ...(id !== null ? [{ id: { not_equals: id } }] : [])] },
        draft: true,
        limit: 1,
        depth: 0,
        req,
      });
      if (repetida.docs.length > 0) return { ok: false, erro: `Já existe um programa com a sigla ${sigla}.` };

      const textos: Record<string, unknown> = {};
      for (const [chave, md] of Object.entries(dados.textos)) {
        if (md !== undefined) textos[chave] = richOuNulo(md);
      }
      const data = {
        sigla,
        nomeCompleto: dados.nomeCompleto.trim(),
        area: dados.areaId === "" ? null : Number(dados.areaId),
        cargaHorariaTotal: textoOuNulo(dados.cargaHorariaTotal),
        ...textos,
        eixosTematicos: eixos,
        diferenciais,
        resultadosEsperados: resultados.map((resultado) => ({ resultado })),
        _status: publicar ? ("published" as const) : ("draft" as const),
      };

      const doc =
        id === null
          ? await payload.create({ collection: "programas", data, draft: !publicar, req })
          : await payload.update({ collection: "programas", id, data, draft: !publicar, req });
      return { ok: true, id: String(doc.id) };
    });
  } catch (e) {
    console.error("[salvarPrograma]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function excluirPrograma(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoEscrita> => {
      const r = podeExcluirPrograma(await contarDependentesPrograma(payload, id, req));
      if (!r.ok) return { ok: false, erro: r.motivo };
      await payload.delete({ collection: "programas", id, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[excluirPrograma]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function idDe(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return null;
}

export async function salvarModulo(id: string | null, dados: DadosModulo, usuario: UsuarioAutenticado): Promise<ResultadoComId> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoComId> => {
      const numero = lerNumeroModulo(dados.numero);
      if (numero === null) return { ok: false, erro: "Número do módulo deve ser um inteiro a partir de 1." };
      const faltas = [
        dados.programaId === "" ? "Programa" : null,
        dados.titulo.trim() === "" ? "Título" : null,
        dados.ementa.trim() === "" ? "Ementa" : null,
      ].filter((f): f is string => f !== null);
      if (faltas.length > 0) return { ok: false, erro: `Preencha: ${faltas.join(", ")}.` };
      const valor = numeroOuNulo(dados.valor);
      if ((dados.valor.trim() !== "" && valor === null) || (valor !== null && valor < 0)) {
        return { ok: false, erro: "Valor de referência inválido." };
      }

      const emUso = await payload.count({
        collection: "modulos",
        where: {
          and: [
            { programa: { equals: dados.programaId } },
            { numero: { equals: numero } },
            ...(id !== null ? [{ id: { not_equals: id } }] : []),
          ],
        },
        req,
      });
      if (emUso.totalDocs > 0) {
        const destino = await payload.findByID({ collection: "programas", id: dados.programaId, depth: 0, draft: true, req });
        return { ok: false, erro: `Já existe o módulo ${numero} em ${destino.sigla}.` };
      }

      const programaAnterior = id === null ? null : idDe((await payload.findByID({ collection: "modulos", id, depth: 0, req })).programa);

      const data = {
        programa: Number(dados.programaId),
        numero,
        titulo: dados.titulo.trim(),
        ementa: markdownParaLexical(dados.ementa),
        cargaHoraria: textoOuNulo(dados.cargaHoraria),
        comercial: {
          tituloComercial: textoOuNulo(dados.tituloComercial),
          valor,
          replay: textoOuNulo(dados.replay),
          certificacao: textoOuNulo(dados.certificacao),
        },
      };
      const doc =
        id === null
          ? await payload.create({ collection: "modulos", data, req })
          : await payload.update({ collection: "modulos", id, data, req });

      if (id === null || programaAnterior !== dados.programaId) await recalcularQuantidade(payload, dados.programaId, req);
      if (programaAnterior !== null && programaAnterior !== dados.programaId) await recalcularQuantidade(payload, programaAnterior, req);
      return { ok: true, id: String(doc.id) };
    });
  } catch (e) {
    console.error("[salvarModulo]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function excluirModulo(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoEscrita> => {
      const r = podeExcluirModulo(await contarDependentesModulo(payload, id, req));
      if (!r.ok) return { ok: false, erro: r.motivo };
      const modulo = await payload.findByID({ collection: "modulos", id, depth: 0, req });
      await payload.delete({ collection: "modulos", id, req });
      const programaId = idDe(modulo.programa);
      if (programaId !== null) await recalcularQuantidade(payload, Number(programaId), req);
      return { ok: true };
    });
  } catch (e) {
    console.error("[excluirModulo]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
```

Notas para o implementador:
- O teste "sigla duplicada" espera `where: { and: [{ sigla: { equals: "EDU" } }] }` para programa novo — é o que o código acima produz.
- No teste "livre: apaga e recalcula", o `findByID` falso de módulos devolve `programa: 4` (número) e o recálculo chama `update` com `id: 4` (número): o `Number(programaId)` acima garante isso.
- Se o typecheck reclamar do tipo de `data` no `create`/`update` (campos `required` do tipo gerado), tipar com `RequiredDataFromCollectionSlug<"programas">`/`Partial<...>` como `painelCrmEscrita.ts` já faz — sem `any` nem cast cego. O Payload aceita rascunho incompleto em runtime (`skipValidation`).
- `numeroOuNulo` vive em `painelCrmEscrita.ts` (que tem `import "server-only"`); importar dele é aceitável. Se criar ciclo de import (não deveria), mover `numeroOuNulo` para um utilitário e reexportar de lá.

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- catalogoCrmEscrita`
Expected: PASS.

- [ ] **Step 5: Teste de gate das Server Actions (falha primeiro)**

`apps/cms/src/app/(painel)/acoesCatalogo.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const escrita = {
  salvarPrograma: vi.fn(async () => ({ ok: true, id: "1" })),
  excluirPrograma: vi.fn(async () => ({ ok: true })),
  salvarModulo: vi.fn(async () => ({ ok: true, id: "2" })),
  excluirModulo: vi.fn(async () => ({ ok: true })),
};
vi.mock("@/lib/cms/catalogoCrmEscrita", () => escrita);
const leitura = { obterProgramaCatalogo: vi.fn(async () => null), obterModuloCatalogo: vi.fn(async () => null) };
vi.mock("@/lib/cms/catalogoCrm", () => leitura);

const acoes = await import("./acoesCatalogo");

const RECUSADO = { ok: false, erro: "Sessão expirada. Entre novamente." };

afterEach(() => vi.clearAllMocks());

describe("acoesCatalogo sem sessão", () => {
  it("recusa as quatro escritas sem tocar a escrita", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    const dadosP = { sigla: "", nomeCompleto: "", areaId: "", cargaHorariaTotal: "", textos: {}, eixos: [], diferenciais: [], resultados: [] };
    const dadosM = { programaId: "", numero: "", titulo: "", ementa: "", cargaHoraria: "", tituloComercial: "", valor: "", replay: "", certificacao: "" };
    expect(await acoes.salvarProgramaCatalogoCrm(null, dadosP, false)).toEqual(RECUSADO);
    expect(await acoes.excluirProgramaCatalogoCrm("1")).toEqual(RECUSADO);
    expect(await acoes.salvarModuloCatalogoCrm(null, dadosM)).toEqual(RECUSADO);
    expect(await acoes.excluirModuloCatalogoCrm("1")).toEqual(RECUSADO);
    for (const f of Object.values(escrita)) expect(f).not.toHaveBeenCalled();
  });
  it("leituras devolvem null sem sessão", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);
    expect(await acoes.carregarProgramaCatalogoCrm("1")).toBeNull();
    expect(await acoes.carregarModuloCatalogoCrm("1")).toBeNull();
    expect(leitura.obterProgramaCatalogo).not.toHaveBeenCalled();
  });
});

describe("acoesCatalogo com sessão", () => {
  it("repassa o usuário à escrita", async () => {
    const u = { id: 5 };
    obterUsuarioAutenticadoMock.mockResolvedValue(u);
    await acoes.excluirModuloCatalogoCrm("9");
    expect(escrita.excluirModulo).toHaveBeenCalledWith("9", u);
  });
});
```

Run: `pnpm --filter @ntc/cms test -- acoesCatalogo`
Expected: FAIL — `./acoesCatalogo` não existe.

- [ ] **Step 6: Implementar `app/(painel)/acoesCatalogo.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioAutenticado, obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterModuloCatalogo,
  obterProgramaCatalogo,
  type ModuloCatalogoDetalhe,
  type ProgramaCatalogoDetalhe,
} from "@/lib/cms/catalogoCrm";
import {
  excluirModulo,
  excluirPrograma,
  salvarModulo,
  salvarPrograma,
  type DadosModulo,
  type DadosPrograma,
  type ResultadoComId,
} from "@/lib/cms/catalogoCrmEscrita";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

/**
 * Server Actions do catálogo comercial (Programas e Módulos no CRM). Mesma
 * regra de acoesCrm.ts: sessão validada ANTES de tocar a Local API.
 */

const RECUSADO: ResultadoEscrita = { ok: false, erro: "Sessão expirada. Entre novamente." };

export async function carregarProgramaCatalogoCrm(id: string): Promise<ProgramaCatalogoDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterProgramaCatalogo(id);
}

export async function salvarProgramaCatalogoCrm(id: string | null, dados: DadosPrograma, publicar: boolean): Promise<ResultadoComId> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await salvarPrograma(id, dados, publicar, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function excluirProgramaCatalogoCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await excluirPrograma(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function carregarModuloCatalogoCrm(id: string): Promise<ModuloCatalogoDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterModuloCatalogo(id);
}

export async function salvarModuloCatalogoCrm(id: string | null, dados: DadosModulo): Promise<ResultadoComId> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await salvarModulo(id, dados, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function excluirModuloCatalogoCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await excluirModulo(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- acoesCatalogo catalogoCrmEscrita && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: PASS, 0 erros.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src/lib/cms/catalogoCrmEscrita.ts apps/cms/src/lib/cms/catalogoCrmEscrita.test.ts "apps/cms/src/app/(painel)/acoesCatalogo.ts" "apps/cms/src/app/(painel)/acoesCatalogo.test.ts"
git commit -m "feat(crm): escrita do catalogo com rascunho, publicacao e exclusao protegida

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Listas com filtros e navegação para o detalhe

**Files:**
- Modify: `apps/cms/src/app/(painel)/crm/TelaProgramas.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/TelaModulos.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/seloStatus.ts` (acrescentar `seloDeSituacaoPrograma`)
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx` (carregar `areas` com `listarAreasCrm`)
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (prop `areas`; estado `catalogoDet` e as funções que abrem os detalhes — o render dos detalhes entra nas Tasks 7 e 8)

**Interfaces:**
- Consumes: `filtrarProgramas`, `filtrarModulos`, `SITUACOES_PROGRAMA`, `rotuloSituacaoPrograma`, `SituacaoPrograma` (Task 1); `ProgramaCrmResumo`, `ModuloCrmResumo`, `AreaOpcao` (Task 4); `carregarProgramaCatalogoCrm`, `carregarModuloCatalogoCrm` (Task 5).
- Produces:
  - `seloDeSituacaoPrograma(s: SituacaoPrograma): string` (em `seloStatus.ts`)
  - `TelaProgramas` props: `{ programas: ProgramaCrmResumo[]; areas: AreaOpcao[]; onAbrir: (id: string) => void; onNovo: () => void }`
  - `TelaModulos` props: `{ modulos: ModuloCrmResumo[]; programas: ProgramaCrmResumo[]; onAbrir: (id: string) => void; onNovo: () => void }`
  - No `ShellCrm`: tipos e estado que as Tasks 7–8 usam:

```ts
type DetalheCatalogoAberto =
  | { tipo: "programa"; programa: ProgramaCatalogoDetalhe | null }
  | { tipo: "modulo"; modulo: ModuloCatalogoDetalhe | null; programaIdInicial?: string };
const [catalogoDet, setCatalogoDet] = useState<DetalheCatalogoAberto | null>(null);
function abrirProgramaCatalogo(id: string): void   // carrega via carregarProgramaCatalogoCrm e seta { tipo: "programa", programa }
function abrirModuloCatalogo(id: string): void     // idem com carregarModuloCatalogoCrm
```

`fecharTudo` passa a também fazer `setCatalogoDet(null)`.

- [ ] **Step 1: `seloStatus.ts`** — acrescentar no fim:

```ts
import type { SituacaoPrograma } from "@ntc/lib";

const SELO_SITUACAO_PROGRAMA: Record<SituacaoPrograma, string> = {
  publicado: "publicado",
  rascunho: "rascunho",
  "alteracoes-pendentes": "atencao",
};

/** Situação editorial do programa do catálogo (rascunho/publicado/pendente). */
export const seloDeSituacaoPrograma = (s: SituacaoPrograma): string => `pcms-selo pcms-selo--${SELO_SITUACAO_PROGRAMA[s]}`;
```

(o `import type` vai para o topo do arquivo, junto aos outros imports, se houver; senão, primeira linha.)

- [ ] **Step 2: Reescrever `TelaProgramas.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";

import { filtrarProgramas, rotuloSituacaoPrograma, SITUACOES_PROGRAMA, type SituacaoPrograma } from "@ntc/lib";

import type { AreaOpcao, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";

import { seloDeSituacaoPrograma } from "./seloStatus";

interface TelaProgramasProps {
  programas: ProgramaCrmResumo[];
  areas: AreaOpcao[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaProgramas({ programas, areas, onAbrir, onNovo }: TelaProgramasProps) {
  const [busca, setBusca] = useState("");
  const [areaId, setAreaId] = useState("");
  const [situacao, setSituacao] = useState<SituacaoPrograma | "">("");

  const visiveis = useMemo(() => filtrarProgramas(programas, { busca, areaId, situacao }), [programas, busca, areaId, situacao]);
  const filtrando = busca.trim() !== "" || areaId !== "" || situacao !== "";

  function limpar() {
    setBusca("");
    setAreaId("");
    setSituacao("");
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Programas</h1>
          <p>Programas do catálogo comercial — alimentam o wizard e o documento da proposta. O site não lê daqui.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo programa
          </button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input type="search" placeholder="Buscar por sigla ou nome" aria-label="Buscar programas" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Área" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Situação" value={situacao} onChange={(e) => setSituacao(e.target.value as SituacaoPrograma | "")}>
            <option value="">Todas as situações</option>
            {SITUACOES_PROGRAMA.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {programas.length === 0 ? (
        <div className="pcms-vazio">Nenhum programa cadastrado.</div>
      ) : visiveis.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum resultado para os filtros.{" "}
          {filtrando && (
            <button type="button" className="pcms-btn pcms-btn--ghost" onClick={limpar}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome</th>
              <th>Área</th>
              <th>Situação</th>
              <th>Módulos</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((p) => (
              <tr
                key={p.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(p.id);
                  }
                }}
              >
                <td>
                  <strong>{p.sigla}</strong>
                </td>
                <td>{p.nome}</td>
                <td>{p.area ?? "—"}</td>
                <td>
                  <span className={seloDeSituacaoPrograma(p.situacao)}>{rotuloSituacaoPrograma(p.situacao)}</span>
                </td>
                <td>{p.numModulos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 3: Reescrever `TelaModulos.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";

import { filtrarModulos } from "@ntc/lib";

import type { ModuloCrmResumo, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaModulosProps {
  modulos: ModuloCrmResumo[];
  programas: ProgramaCrmResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaModulos({ modulos, programas, onAbrir, onNovo }: TelaModulosProps) {
  const [busca, setBusca] = useState("");
  const [programaId, setProgramaId] = useState("");

  const visiveis = useMemo(() => filtrarModulos(modulos, { busca, programaId }), [modulos, busca, programaId]);
  const filtrando = busca.trim() !== "" || programaId !== "";

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Módulos</h1>
          <p>Módulos do catálogo com seus dados comerciais de referência.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo módulo
          </button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input type="search" placeholder="Buscar por título" aria-label="Buscar módulos" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Programa" value={programaId} onChange={(e) => setProgramaId(e.target.value)}>
            <option value="">Todos os programas</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sigla}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modulos.length === 0 ? (
        <div className="pcms-vazio">Nenhum módulo cadastrado.</div>
      ) : visiveis.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum resultado para os filtros.{" "}
          {filtrando && (
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={() => {
                setBusca("");
                setProgramaId("");
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Título</th>
              <th>Programa</th>
              <th>Valor ref.</th>
              <th>Replay</th>
              <th>Certificação</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((m) => (
              <tr
                key={m.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(m.id);
                  }
                }}
              >
                <td>{m.numero}</td>
                <td>
                  <strong>{m.tituloComercial ?? m.titulo}</strong>
                </td>
                <td>{m.programaSigla ?? "—"}</td>
                <td>{m.valor !== null ? formatarMoedaBRL(m.valor) : "—"}</td>
                <td>{m.replay ?? "—"}</td>
                <td>{m.certificacao ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 4: Ligar `page.tsx` e `ShellCrm.tsx`**

0. `page.tsx`: importar `listarAreasCrm` e `type AreaOpcao` de `@/lib/cms/catalogoCrm`; declarar `let areas: AreaOpcao[] = [];`, acrescentar `listarAreasCrm()` ao `Promise.all` (e `areas` à desestruturação) e passar `areas={areas}` ao `ShellCrm`. Em `ShellCrm.tsx`, acrescentar `areas: AreaOpcao[];` em `ShellCrmProps` e desestruturar.
1. Imports: `carregarModuloCatalogoCrm`, `carregarProgramaCatalogoCrm` de `"../acoesCatalogo"`; `type ModuloCatalogoDetalhe`, `type ProgramaCatalogoDetalhe` de `"@/lib/cms/catalogoCrm"`.
2. Depois de `type ModalLeadAberto ...`, acrescentar o tipo `DetalheCatalogoAberto` (ver Interfaces).
3. Estado: `const [catalogoDet, setCatalogoDet] = useState<DetalheCatalogoAberto | null>(null);` e `setCatalogoDet(null);` dentro de `fecharTudo`.
4. Funções, logo depois de `abrirProposta`:

```tsx
  function abrirProgramaCatalogo(id: string) {
    iniciarCarga(async () => {
      const det = await carregarProgramaCatalogoCrm(id);
      if (det) setCatalogoDet({ tipo: "programa", programa: det });
      else setErroAcao("Não foi possível abrir o programa.");
    });
  }

  function abrirModuloCatalogo(id: string) {
    iniciarCarga(async () => {
      const det = await carregarModuloCatalogoCrm(id);
      if (det) setCatalogoDet({ tipo: "modulo", modulo: det });
      else setErroAcao("Não foi possível abrir o módulo.");
    });
  }
```

5. Render das telas:

```tsx
          {tela === "programas" && (
            <TelaProgramas
              programas={programas}
              areas={areas}
              onAbrir={abrirProgramaCatalogo}
              onNovo={() => setCatalogoDet({ tipo: "programa", programa: null })}
            />
          )}
          {tela === "modulos" && (
            <TelaModulos
              modulos={modulos}
              programas={programas}
              onAbrir={abrirModuloCatalogo}
              onNovo={() => setCatalogoDet({ tipo: "modulo", modulo: null })}
            />
          )}
```

O render do detalhe (ramo `catalogoDet ? ...`) entra nas Tasks 7 e 8. Até lá, clicar não mostra nada além do carregamento — aceitável **entre** tasks da mesma branch; a Task 7 fecha isso.

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint && pnpm --filter @ntc/cms test`
Expected: PASS, 0 erros de lint. (Sem teste de componente — a suíte roda em `node`; a cobertura da tela é o checkpoint visual, e a lógica dos filtros já está testada na Task 1.)

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm"
git commit -m "feat(crm): busca e filtros nas listas de programas e modulos

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Detalhe do programa

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/CampoMarkdown.tsx`
- Create: `apps/cms/src/app/(painel)/crm/EditorListaCatalogo.tsx`
- Create: `apps/cms/src/app/(painel)/crm/DetalheProgramaCatalogo.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (render do ramo programa)

**Interfaces:**
- Consumes: `BarraFormatacao`, `aplicarNoTextarea`, `atalhoDaTecla` (`../BarraFormatacao`); `CampoTexto`, `CampoSelect`, `AvisoForm` (`./CamposCrm`); `CAMPOS_TEXTO_PROGRAMA`, `rotuloSituacaoPrograma`, `podeExcluirPrograma`, `type CampoTextoPrograma`, `type ItemTituloDescricao` (`@ntc/lib`); `seloDeSituacaoPrograma` (Task 6); `salvarProgramaCatalogoCrm`, `excluirProgramaCatalogoCrm`, `carregarProgramaCatalogoCrm` (Task 5); `ProgramaCatalogoDetalhe`, `AreaOpcao` (Task 4); `DadosPrograma` (Task 5, `import type`).
- Produces:
  - `CampoMarkdown` props: `{ rotulo: string; valor: string; onMudar: (v: string) => void; linhas?: number; avisoPerda?: boolean }`
  - `EditorListaCatalogo<T>` props: `{ rotulo: string; itens: T[]; onMudar: (itens: T[]) => void; novo: () => T; campos: { chave: keyof T & string; rotulo: string; area?: boolean }[]; rotuloItem: string }`
  - `DetalheProgramaCatalogo` props: `{ programa: ProgramaCatalogoDetalhe | null; areas: AreaOpcao[]; onVoltar: () => void; onSalvo: (id: string) => void; onExcluido: () => void; onAbrirModulo: (id: string) => void; onNovoModulo: (programaId: string) => void }`

- [ ] **Step 1: `CampoMarkdown.tsx`**

```tsx
"use client";

import { useId, useRef } from "react";

import { BarraFormatacao, aplicarNoTextarea, atalhoDaTecla } from "../BarraFormatacao";

interface CampoMarkdownProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  linhas?: number;
  /** O conteúdo gravado tem formatação que o editor não representa — salvar este campo a perderia. */
  avisoPerda?: boolean;
}

/** Texto rico do catálogo editado como Markdown leve, com a mesma barra dos Conteúdos. */
export function CampoMarkdown({ rotulo, valor, onMudar, linhas = 6, avisoPerda }: CampoMarkdownProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="pcms-field">
      <label htmlFor={id}>{rotulo}</label>
      {avisoPerda && (
        <p className="pcms-aviso" role="note">
          Este texto tem formatação que o editor não representa (ex.: negrito e itálico juntos). Se você alterar e salvar este campo, essa formatação se perde.
        </p>
      )}
      <BarraFormatacao textareaRef={ref} valor={valor} onMudar={onMudar} />
      <textarea
        id={id}
        ref={ref}
        rows={linhas}
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        onKeyDown={(e) => {
          const acao = atalhoDaTecla(e);
          if (!acao) return;
          e.preventDefault();
          aplicarNoTextarea(ref.current, valor, acao, onMudar);
        }}
      />
    </div>
  );
}
```

Antes, abrir `BarraFormatacao.tsx` e conferir o nome exato das props de `BarraFormatacaoProps` (`textareaRef`, `valor`, `onMudar` — como usado em `DetalheConteudo.tsx:489-493`) e se o atalho em `DetalheConteudo.tsx:499-505` chama `e.preventDefault()`; seguir exatamente o mesmo padrão.

- [ ] **Step 2: `EditorListaCatalogo.tsx`**

```tsx
"use client";

import { useId } from "react";

interface CampoItem<T> {
  chave: keyof T & string;
  rotulo: string;
  area?: boolean;
}

interface EditorListaCatalogoProps<T> {
  rotulo: string;
  /** "Eixo", "Diferencial", "Resultado" — usado em "Eixo 2" e nos nomes acessíveis dos botões. */
  rotuloItem: string;
  itens: T[];
  onMudar: (itens: T[]) => void;
  novo: () => T;
  campos: CampoItem<T>[];
}

/** Lista editável do catálogo: adicionar, remover e reordenar por botões (acessível por teclado). */
export function EditorListaCatalogo<T extends { [K in keyof T]: string }>({ rotulo, rotuloItem, itens, onMudar, novo, campos }: EditorListaCatalogoProps<T>) {
  const base = useId();

  function mudar(i: number, chave: keyof T & string, valor: string) {
    onMudar(itens.map((it, j) => (j === i ? { ...it, [chave]: valor } : it)));
  }
  function mover(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= itens.length) return;
    const copia = [...itens];
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    onMudar(copia);
  }

  return (
    <section className="pcms-det-bloco">
      <h2>{rotulo}</h2>
      {itens.length === 0 && <p>Nenhum item.</p>}
      <ol className="pcms-lista-catalogo">
        {itens.map((it, i) => (
          <li key={i} className="pcms-lista-catalogo__item">
            <p className="pcms-lista-catalogo__titulo">
              {rotuloItem} {i + 1}
            </p>
            {campos.map((c) => {
              const id = `${base}-${i}-${c.chave}`;
              return (
                <div key={c.chave} className="pcms-field">
                  <label htmlFor={id}>{c.rotulo}</label>
                  {c.area ? (
                    <textarea id={id} rows={3} value={it[c.chave]} onChange={(e) => mudar(i, c.chave, e.target.value)} />
                  ) : (
                    <input id={id} type="text" value={it[c.chave]} onChange={(e) => mudar(i, c.chave, e.target.value)} />
                  )}
                </div>
              );
            })}
            <div className="pcms-lista-catalogo__acoes">
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={i === 0} onClick={() => mover(i, -1)} aria-label={`Mover ${rotuloItem} ${i + 1} para cima`}>
                ↑
              </button>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={i === itens.length - 1} onClick={() => mover(i, 1)} aria-label={`Mover ${rotuloItem} ${i + 1} para baixo`}>
                ↓
              </button>
              <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onMudar(itens.filter((_, j) => j !== i))} aria-label={`Remover ${rotuloItem} ${i + 1}`}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onMudar([...itens, novo()])}>
        Adicionar {rotuloItem.toLowerCase()}
      </button>
    </section>
  );
}
```

`resultados` é `string[]`; no detalhe, adaptar para `{ texto: string }[]` na entrada/saída do editor (ver Step 3). CSS mínimo em `apps/cms/src/app/(painel)/painel.css`, no fim do arquivo:

```css
/* Lista editável do catálogo (Programas → eixos, diferenciais, resultados). */
.pcms-lista-catalogo { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 12px; }
.pcms-lista-catalogo__item { border: 1px solid var(--pcms-linha); padding: 12px; border-radius: 8px; }
.pcms-lista-catalogo__titulo { margin: 0 0 8px; font-weight: 600; }
.pcms-lista-catalogo__acoes { display: flex; gap: 8px; flex-wrap: wrap; }
```

(Antes de escrever, conferir em `painel.css` que `--pcms-linha` existe — é usado em `.pcms-modal__body .pcms-det-bloco h3`. O raio de 8px segue a exceção visual do painel registrada na v1.5.)

- [ ] **Step 3: `DetalheProgramaCatalogo.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import {
  CAMPOS_TEXTO_PROGRAMA,
  podeExcluirPrograma,
  rotuloSituacaoPrograma,
  type CampoTextoPrograma,
  type ItemTituloDescricao,
} from "@ntc/lib";

import type { AreaOpcao, ProgramaCatalogoDetalhe } from "@/lib/cms/catalogoCrm";
import type { DadosPrograma } from "@/lib/cms/catalogoCrmEscrita";

import { excluirProgramaCatalogoCrm, salvarProgramaCatalogoCrm } from "../acoesCatalogo";

import { CampoMarkdown } from "./CampoMarkdown";
import { AvisoForm, CampoSelect, CampoTexto } from "./CamposCrm";
import { EditorListaCatalogo } from "./EditorListaCatalogo";
import { seloDeSituacaoPrograma } from "./seloStatus";

interface DetalheProgramaCatalogoProps {
  programa: ProgramaCatalogoDetalhe | null;
  areas: AreaOpcao[];
  onVoltar: () => void;
  /** Depois de salvar/publicar: o Shell recarrega o detalhe pelo id. */
  onSalvo: (id: string) => void;
  onExcluido: () => void;
  onAbrirModulo: (id: string) => void;
  onNovoModulo: (programaId: string) => void;
}

const TEXTOS_VAZIOS: Record<CampoTextoPrograma, string> = { visaoGeral: "", problema: "", objetivo: "", publicoAlvo: "", metodologia: "" };

export function DetalheProgramaCatalogo({ programa: p, areas, onVoltar, onSalvo, onExcluido, onAbrirModulo, onNovoModulo }: DetalheProgramaCatalogoProps) {
  const novo = p === null;
  const [sigla, setSigla] = useState(p?.sigla ?? "");
  const [nome, setNome] = useState(p?.nomeCompleto ?? "");
  const [areaId, setAreaId] = useState(p?.areaId ?? "");
  const [carga, setCarga] = useState(p?.cargaHorariaTotal ?? "");
  const [textos, setTextos] = useState<Record<CampoTextoPrograma, string>>(p?.textos ?? TEXTOS_VAZIOS);
  const [alterados, setAlterados] = useState<Set<CampoTextoPrograma>>(new Set());
  const [eixos, setEixos] = useState<ItemTituloDescricao[]>(p?.eixos ?? []);
  const [diferenciais, setDiferenciais] = useState<ItemTituloDescricao[]>(p?.diferenciais ?? []);
  const [resultados, setResultados] = useState<{ texto: string }[]>((p?.resultados ?? []).map((texto) => ({ texto })));
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [enviando, iniciar] = useTransition();

  const podeExcluir = p ? podeExcluirPrograma(p.dependentes) : { ok: false as const, motivo: "" };

  function mudarTexto(chave: CampoTextoPrograma, v: string) {
    setTextos((t) => ({ ...t, [chave]: v }));
    setAlterados((s) => new Set(s).add(chave));
  }

  function gravar(publicar: boolean) {
    setErro(null);
    const enviar: Partial<Record<CampoTextoPrograma, string>> = {};
    for (const { chave } of CAMPOS_TEXTO_PROGRAMA) if (novo || alterados.has(chave)) enviar[chave] = textos[chave];
    const dados: DadosPrograma = {
      sigla,
      nomeCompleto: nome,
      areaId,
      cargaHorariaTotal: carga,
      textos: enviar,
      eixos,
      diferenciais,
      resultados: resultados.map((r) => r.texto),
    };
    iniciar(async () => {
      const r = await salvarProgramaCatalogoCrm(p?.id ?? null, dados, publicar);
      if (r.ok && r.id) onSalvo(r.id);
      else setErro(r.erro ?? "Erro ao salvar o programa.");
    });
  }

  function confirmarExclusao() {
    if (!p) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirProgramaCatalogoCrm(p.id);
      if (r.ok) onExcluido();
      else {
        setErro(r.erro ?? "Erro ao excluir o programa.");
        setExcluindo(false);
      }
    });
  }

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Programas <span>/ {novo ? "Novo programa" : p.sigla}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional · Programa</p>
          <h1>{novo ? "Novo programa" : p.nomeCompleto || p.sigla}</h1>
          {!novo && <span className={seloDeSituacaoPrograma(p.situacao)}>{rotuloSituacaoPrograma(p.situacao)}</span>}
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => gravar(false)}>
            {enviando ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button type="button" className="pcms-btn" disabled={enviando} onClick={() => gravar(true)}>
            Publicar
          </button>
        </div>
      </div>

      {(novo || p.situacao === "rascunho") && (
        <p className="pcms-aviso" role="note">
          Rascunho não aparece no wizard de proposta. Publique para que ele possa ser vendido.
        </p>
      )}
      {!novo && p.situacao === "alteracoes-pendentes" && (
        <p className="pcms-aviso" role="note">
          Há alterações não publicadas. Propostas novas continuam usando a versão publicada até você publicar.
        </p>
      )}
      <p className="pcms-aviso" role="note">
        Editar um programa não altera propostas já criadas — use "Restaurar padrão" na proposta para trazer o texto novo.
      </p>
      <AvisoForm erro={erro} />

      <section className="pcms-det-bloco">
        <h2>Identificação</h2>
        <CampoTexto rotulo="Sigla" valor={sigla} onMudar={setSigla} obrigatorio curto />
        <CampoTexto rotulo="Nome completo" valor={nome} onMudar={setNome} obrigatorio />
        <CampoSelect rotulo="Área" valor={areaId} onMudar={setAreaId} opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))} />
        <CampoTexto rotulo="Carga horária total (ex.: 64 horas)" valor={carga} onMudar={setCarga} curto />
      </section>

      <section className="pcms-det-bloco">
        <h2>Textos</h2>
        {CAMPOS_TEXTO_PROGRAMA.map(({ chave, rotulo }) => (
          <CampoMarkdown
            key={chave}
            rotulo={rotulo}
            valor={textos[chave]}
            onMudar={(v) => mudarTexto(chave, v)}
            avisoPerda={!novo && p.textosComPerda.includes(chave)}
          />
        ))}
      </section>

      <EditorListaCatalogo
        rotulo="Eixos temáticos"
        rotuloItem="Eixo"
        itens={eixos}
        onMudar={setEixos}
        novo={() => ({ titulo: "", descricao: "" })}
        campos={[{ chave: "titulo", rotulo: "Título" }, { chave: "descricao", rotulo: "Descrição", area: true }]}
      />
      <EditorListaCatalogo
        rotulo="Diferenciais"
        rotuloItem="Diferencial"
        itens={diferenciais}
        onMudar={setDiferenciais}
        novo={() => ({ titulo: "", descricao: "" })}
        campos={[{ chave: "titulo", rotulo: "Título" }, { chave: "descricao", rotulo: "Descrição (opcional)", area: true }]}
      />
      <EditorListaCatalogo
        rotulo="Resultados esperados"
        rotuloItem="Resultado"
        itens={resultados}
        onMudar={setResultados}
        novo={() => ({ texto: "" })}
        campos={[{ chave: "texto", rotulo: "Resultado", area: true }]}
      />

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Módulos do programa</h2>
          {p.modulos.length === 0 ? (
            <p>Nenhum módulo.</p>
          ) : (
            <ul>
              {p.modulos.map((m) => (
                <li key={m.id}>
                  <button type="button" className="pcms-link" onClick={() => onAbrirModulo(m.id)}>
                    Módulo {m.numero} — {m.titulo}
                    {m.cargaHoraria ? ` (${m.cargaHoraria})` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onNovoModulo(p.id)}>
            Novo módulo neste programa
          </button>
        </section>
      )}

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Zona de risco</h2>
          {!podeExcluir.ok && <p className="pcms-pagehead__aviso-apagar">{podeExcluir.motivo}</p>}
          {!excluindo ? (
            <button type="button" className="pcms-btn pcms-btn--perigo" disabled={!podeExcluir.ok || enviando} onClick={() => setExcluindo(true)}>
              Excluir programa
            </button>
          ) : (
            <>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => setExcluindo(false)}>
                Cancelar
              </button>
              <button type="button" className="pcms-btn pcms-btn--perigo" disabled={enviando} onClick={confirmarExclusao}>
                {enviando ? "Excluindo…" : "Confirmar exclusão"}
              </button>
            </>
          )}
        </section>
      )}
    </>
  );
}
```

Conferir em `painel.css` se `.pcms-link` existe (`grep -n "pcms-link\b" painel.css`). Se não existir, usar `pcms-btn pcms-btn--ghost` no botão de cada módulo em vez de criar classe nova. Conferir também se `CampoSelect` aceita `opcoes` como `{ value; label }[]` (tipo `OpcaoLista` de `@ntc/lib`) — é o que `CamposCrm.tsx:82-95` mostra.

- [ ] **Step 4: Render no `ShellCrm.tsx`**

Antes do ramo `formAberto?.entidade === "cliente" ? (...)`, inserir como **primeiro** ramo da cadeia:

```tsx
      {catalogoDet?.tipo === "programa" ? (
        <DetalheProgramaCatalogo
          key={catalogoDet.programa?.id ?? "novo"}
          programa={catalogoDet.programa}
          areas={areas}
          onVoltar={fecharTudo}
          onSalvo={abrirProgramaCatalogo}
          onExcluido={() => {
            fecharTudo();
            setTela("programas");
          }}
          onAbrirModulo={abrirModuloCatalogo}
          onNovoModulo={(programaId) => setCatalogoDet({ tipo: "modulo", modulo: null, programaIdInicial: programaId })}
        />
      ) : formAberto?.entidade === "cliente" ? (
```

(e importar `DetalheProgramaCatalogo` de `"./DetalheProgramaCatalogo"`). O ramo `catalogoDet?.tipo === "modulo"` vem na Task 8.

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint && pnpm --filter @ntc/cms test`
Expected: PASS, 0 erros.

Smoke manual (dev no ar, `pnpm dev:cms`, `/crm` → Programas): abrir EDUTEC → textos aparecem com `**…**` onde há negrito; "Salvar rascunho" sem mudar nada → o selo passa a "Alterações não publicadas" (esperado: salvar rascunho cria uma versão rascunho, mesmo sem mudança de conteúdo); "Publicar" volta para "Publicado". Novo programa → Salvar rascunho sem nome → erro "Para salvar, preencha: Nome completo.". Parar o dev depois.

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm" "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(crm): detalhe do programa com edicao, publicacao e exclusao

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Detalhe do módulo

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/DetalheModuloCatalogo.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (render do ramo módulo)

**Interfaces:**
- Consumes: `CampoMarkdown` (Task 7); `CampoTexto`, `CampoSelect`, `CampoNumero`, `AvisoForm` (`./CamposCrm`); `podeExcluirModulo` (`@ntc/lib`); `salvarModuloCatalogoCrm`, `excluirModuloCatalogoCrm` (Task 5); `ModuloCatalogoDetalhe`, `ProgramaCrmResumo` (Task 4); `DadosModulo` (Task 5).
- Produces: `DetalheModuloCatalogo` props: `{ modulo: ModuloCatalogoDetalhe | null; programaIdInicial?: string; programas: ProgramaCrmResumo[]; onVoltar: () => void; onSalvo: (id: string) => void; onExcluido: () => void }`

- [ ] **Step 1: `DetalheModuloCatalogo.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";

import { podeExcluirModulo } from "@ntc/lib";

import type { ModuloCatalogoDetalhe, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";
import type { DadosModulo } from "@/lib/cms/catalogoCrmEscrita";

import { excluirModuloCatalogoCrm, salvarModuloCatalogoCrm } from "../acoesCatalogo";

import { CampoMarkdown } from "./CampoMarkdown";
import { AvisoForm, CampoNumero, CampoSelect, CampoTexto } from "./CamposCrm";

interface DetalheModuloCatalogoProps {
  modulo: ModuloCatalogoDetalhe | null;
  programaIdInicial?: string;
  programas: ProgramaCrmResumo[];
  onVoltar: () => void;
  onSalvo: (id: string) => void;
  onExcluido: () => void;
}

export function DetalheModuloCatalogo({ modulo: m, programaIdInicial, programas, onVoltar, onSalvo, onExcluido }: DetalheModuloCatalogoProps) {
  const novo = m === null;
  const [dados, setDados] = useState<DadosModulo>({
    programaId: m?.programaId ?? programaIdInicial ?? "",
    numero: m?.numero ?? "",
    titulo: m?.titulo ?? "",
    ementa: m?.ementa ?? "",
    cargaHoraria: m?.cargaHoraria ?? "",
    tituloComercial: m?.tituloComercial ?? "",
    valor: m?.valor ?? "",
    replay: m?.replay ?? "",
    certificacao: m?.certificacao ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [enviando, iniciar] = useTransition();
  const podeExcluir = m ? podeExcluirModulo(m.dependentes) : { ok: false as const, motivo: "" };

  const mudar = (campo: keyof DadosModulo) => (v: string) => setDados((d) => ({ ...d, [campo]: v }));

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const r = await salvarModuloCatalogoCrm(m?.id ?? null, dados);
      if (r.ok && r.id) onSalvo(r.id);
      else setErro(r.erro ?? "Erro ao salvar o módulo.");
    });
  }

  function confirmarExclusao() {
    if (!m) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirModuloCatalogoCrm(m.id);
      if (r.ok) onExcluido();
      else {
        setErro(r.erro ?? "Erro ao excluir o módulo.");
        setExcluindo(false);
      }
    });
  }

  const sigla = programas.find((p) => p.id === dados.programaId)?.sigla;

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Módulos <span>/ {novo ? "Novo módulo" : `${sigla ?? ""} M${m.numero}`}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional · Módulo</p>
          <h1>{novo ? "Novo módulo" : m.titulo}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" disabled={enviando} onClick={salvar}>
            {enviando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <p className="pcms-aviso" role="note">
        Editar um módulo não altera propostas já criadas.
      </p>
      <AvisoForm erro={erro} />

      <section className="pcms-det-bloco">
        <h2>Módulo</h2>
        <CampoSelect
          rotulo="Programa"
          valor={dados.programaId}
          onMudar={mudar("programaId")}
          opcoes={programas.map((p) => ({ value: p.id, label: `${p.sigla} — ${p.nome}` }))}
          obrigatorio
        />
        <CampoNumero rotulo="Número" valor={dados.numero} onMudar={mudar("numero")} curto />
        <CampoTexto rotulo="Título" valor={dados.titulo} onMudar={mudar("titulo")} obrigatorio />
        <CampoMarkdown rotulo="Ementa" valor={dados.ementa} onMudar={mudar("ementa")} avisoPerda={!novo && m.ementaComPerda} />
        <CampoTexto rotulo="Carga horária (ex.: 8h)" valor={dados.cargaHoraria} onMudar={mudar("cargaHoraria")} curto />
      </section>

      <section className="pcms-det-bloco">
        <h2>Dados comerciais</h2>
        <CampoTexto rotulo="Título comercial" valor={dados.tituloComercial} onMudar={mudar("tituloComercial")} />
        <CampoNumero rotulo="Valor de referência (R$)" valor={dados.valor} onMudar={mudar("valor")} curto />
        <CampoTexto rotulo="Replay" valor={dados.replay} onMudar={mudar("replay")} curto />
        <CampoTexto rotulo="Certificação" valor={dados.certificacao} onMudar={mudar("certificacao")} />
      </section>

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Zona de risco</h2>
          {!podeExcluir.ok && <p className="pcms-pagehead__aviso-apagar">{podeExcluir.motivo}</p>}
          {!excluindo ? (
            <button type="button" className="pcms-btn pcms-btn--perigo" disabled={!podeExcluir.ok || enviando} onClick={() => setExcluindo(true)}>
              Excluir módulo
            </button>
          ) : (
            <>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => setExcluindo(false)}>
                Cancelar
              </button>
              <button type="button" className="pcms-btn pcms-btn--perigo" disabled={enviando} onClick={confirmarExclusao}>
                {enviando ? "Excluindo…" : "Confirmar exclusão"}
              </button>
            </>
          )}
        </section>
      )}
    </>
  );
}
```

- [ ] **Step 2: Render no `ShellCrm.tsx`**

Logo depois do ramo do programa (Task 7), antes de `: formAberto?.entidade === "cliente"`:

```tsx
      ) : catalogoDet?.tipo === "modulo" ? (
        <DetalheModuloCatalogo
          key={catalogoDet.modulo?.id ?? `novo-${catalogoDet.programaIdInicial ?? ""}`}
          modulo={catalogoDet.modulo}
          programaIdInicial={catalogoDet.programaIdInicial}
          programas={programas}
          onVoltar={fecharTudo}
          onSalvo={abrirModuloCatalogo}
          onExcluido={() => {
            fecharTudo();
            setTela("modulos");
          }}
        />
```

(e importar `DetalheModuloCatalogo`). `programas` aqui é a lista resumo da página — inclui rascunhos (de propósito: dá para montar os módulos de um programa novo antes de publicá-lo).

- [ ] **Step 3: Verificar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint && pnpm --filter @ntc/cms test`
Expected: PASS, 0 erros.

- [ ] **Step 4: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm"
git commit -m "feat(crm): detalhe do modulo com edicao e exclusao

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Documentação e gates finais

**Files:**
- Modify: `CLAUDE.md` (histórico v3.4 no topo da lista "Histórico de revisões", cabeçalho de versão, §19.1 bullet do Catálogo, §19.2 bullet novo, §19.3 item novo de checkpoint)

**Interfaces:**
- Consumes: o snapshot de perdas da Task 2 e o comportamento observado no smoke da Task 7.

- [ ] **Step 1: Gates com o dev parado**

```bash
cd /Users/joao/Documents/portal-ntc
pgrep -fl "next dev" && echo "PARE O DEV ANTES" || true
pnpm lint && pnpm typecheck && pnpm test && pnpm build --force
rm -rf apps/cms/.next apps/web/.next
```

Expected: lint 0 erros (warnings pré-existentes apenas: anotar o número), typecheck 5/5, testes verdes (anotar contagens de `@ntc/lib` e `@ntc/cms`), build 2 tasks green.

- [ ] **Step 2: Atualizar `CLAUDE.md`**

- Cabeçalho: `**Versão:** 3.4 · 5 de outubro de 2026` e o rodapé final `v3.4 · 5 de outubro de 2026`.
- Nova entrada no topo de "Histórico de revisões": `- **v3.4 — 05/10/2026** — **Gestão do catálogo (Programas e Módulos) no CRM**` com: branch, spec e plano; o que entrega (filtros; criar/editar/publicar programa com rascunho; criar/editar módulo; exclusão bloqueada por dependentes com `beforeDelete`); a correção do subtítulo falso "edição no módulo Site"; **wizard de proposta passa a listar só programas publicados**; `imagemCapa` opcional **sem push de schema** (coleção com drafts já tem colunas nullable — verificado por `psql`); editor em Markdown leve preservando negrito (diferente da proposta) e só reescrevendo campos alterados; o resultado do snapshot de perdas da Task 2 (quais campos, ou "nenhum"); contagens dos gates; pendência: checkpoint visual do PO (roteiro do spec §9).
- §19.1: substituir "Programas · Módulos · Produtos/Eventos — listas **read-only** (edição segue no módulo Site)" por "Programas e Módulos **editáveis** (criar, editar, publicar programa, excluir sem dependentes — v3.4); Produtos/Eventos read-only (edição no módulo Site)".
- §19.2: bullet novo "**CRM — Catálogo (Programas e Módulos)**" resumindo o que funciona.
- §19.3: item novo "**Checkpoint visual do catálogo (v3.4)**" com o roteiro de 9 passos do spec §9.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: registra a gestao do catalogo de programas e modulos (v3.4)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Avisar o PO** — checkpoint visual é dele (roteiro no spec §9, desktop 1440 + mobile 375), com o dev no ar; nada de push sem ordem explícita.
