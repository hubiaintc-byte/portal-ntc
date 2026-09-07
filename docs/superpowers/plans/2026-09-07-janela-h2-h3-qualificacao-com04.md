# Janela H · Sessões H2 e H3 — Qualificação COM-04 e a porta do estágio "Qualificada"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o CRM passa a registrar a qualificação formal de uma oportunidade pelo método COM-04 — 9 dimensões, score, 7 hard gates, resultado — e o estágio "Qualificada" deixa de ser uma escolha do vendedor: só é aceito quando existe uma avaliação vigente que sustenta a decisão.

**Architecture:** as regras vivem em funções puras em `packages/lib/src/crm/qualificacao.ts`, testadas sem banco — mesmo padrão de `crm/funil.ts` (Sessão H1) e `crm/propostas.ts`. A coleção nova `avaliacoes-qualificacao` guarda a avaliação; derivados (`scoreTotal`, `faixa`, `concluidaEm`) são calculados em `beforeChange` e persistidos, para permitir ordenar e filtrar. A unicidade da avaliação vigente por oportunidade é resolvida em `afterChange`, dentro da **mesma transação** do Payload (`req` repassado). O gate do estágio entra como `beforeChange` em `oportunidades`, consultando a avaliação vigente e recusando a escrita com a mensagem exata que o Manual Operacional documenta.

**Tech Stack:** TypeScript strict · Payload CMS 3 (postgres adapter, Local API) · Next.js 15 App Router (Server Actions) · Vitest · pnpm workspaces + Turbo.

**Spec:** `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` — §1.2 (a entidade), §1.3 (as regras), §4.0 (divergências M4 e M5 do Manual), Sessões H2 e H3 em §4. **Fonte normativa do método:** Manual Operacional `NTC-COM-CRM-01` v1.0 FINAL — §13 (estados da avaliação), §14 (as 9 dimensões), §15 (notas e score), §16 (hard gates), §17 (resultados), §18 (as 10 condições do gate), §19 (requalificação).

## Global Constraints

- **TypeScript strict. Sem `any`, sem `unknown` quando há tipo conhecido, sem `@ts-ignore`, sem `eslint-disable`, sem `as` que force um tipo mentindo** (`CLAUDE.md` §4.1, §4.4, §5.7).
- **Nomes em português** para conceitos comerciais NTC; componentes `PascalCase.tsx`; imports absolutos `@/` (`CLAUDE.md` §4.2, §4.3).
- **Commits em português, Conventional Commits, sem emojis, com acentuação correta** (`CLAUDE.md` §7.2).
- **`pnpm payload:push:schema` é manual**: dev parado, diff revisado, `N` em qualquer `DATA LOSS`. Nenhum agente roda sozinho — o plano marca onde parar. **O dev server precisa estar parado**: sessão paralela no banco trava o push (aconteceu na H1).
- **Nunca rodar `pnpm build` com o dev server no ar** — o `.next` é compartilhado.
- **As mensagens de bloqueio são contratuais.** Os textos do §18 do manual são exatamente as strings do protótipo; a equipe será treinada neles. Reproduzir verbatim, inclusive o sinal `≠`.
- **Escrita passa o usuário da sessão para a Local API.** O padrão foi estabelecido na H1 (`obterUsuarioAutenticado()` → `payload.create/update({ user })`); toda escrita nova segue.
- **Score é apoio, não decisão.** O `resultado` da avaliação é escolha registrada do avaliador; nada no código pode derivá-lo do score (manual §15).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `packages/lib/src/crm/qualificacao.ts` **(criar)** | Listas, dimensões, hard gates, `calcularScore`, `faixaDoScore` e `avaliacaoPermiteQualificada` — as 10 condições do §18. Puro. |
| `packages/lib/src/crm/qualificacao.test.ts` **(criar)** | Testes das regras, com um caso por condição de bloqueio. |
| `packages/lib/src/index.ts` **(modificar)** | Reexports. |
| `apps/cms/src/collections/AvaliacoesQualificacao.ts` **(criar)** | A coleção, com validação estrita das notas e derivados em hook. |
| `apps/cms/src/lib/crm/derivadosAvaliacao.ts` **(criar)** | `montarDerivadosAvaliacao()` — o que o `beforeChange` grava. Puro. |
| `apps/cms/src/lib/crm/derivadosAvaliacao.test.ts` **(criar)** | Testes dos derivados. |
| `apps/cms/src/payload.config.ts` **(modificar)** | Registra a coleção. |
| `apps/cms/src/lib/cms/painelCrm.ts` **(modificar)** | `AvaliacaoResumo`, `AvaliacaoDetalhe`, `listarAvaliacoesCrm`, `obterAvaliacaoCrm`. |
| `apps/cms/src/lib/cms/painelCrmEscrita.ts` **(modificar)** | `DadosAvaliacao`, `criarAvaliacao`, `atualizarAvaliacao`. |
| `apps/cms/src/app/(painel)/acoesCrm.ts` **(modificar)** | Server Actions da avaliação. |
| `apps/cms/src/app/(painel)/crm/TelaQualificacao.tsx` **(criar)** | Lista de avaliações. |
| `apps/cms/src/app/(painel)/crm/FormAvaliacao.tsx` **(criar)** | Formulário das 9 dimensões + 7 hard gates + decisão. |
| `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` **(modificar)** | 3º grupo de navegação "Processo Comercial B2G (P0)" com a tela nova. |
| `apps/cms/src/app/(painel)/crm/seloStatus.ts` **(modificar)** | Selo por resultado e por faixa. |
| `apps/cms/src/collections/Oportunidades.ts` **(modificar)** | O gate do estágio "Qualificada". |
| `apps/cms/src/lib/crm/gateQualificada.ts` **(criar)** | Ponte entre o hook e a regra pura: lê a avaliação vigente e devolve o erro. |
| `apps/cms/src/lib/crm/gateQualificada.test.ts` **(criar)** | Testes do gate com Local API mockada. |

---

### Task 1: Regras puras da qualificação (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/qualificacao.ts`
- Create: `packages/lib/src/crm/qualificacao.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Consumes: `opcoes`, `OpcaoLista` de `./listas`.
- Produces:
  - `STATUS_AVALIACAO`, `RESULTADO_QUALIFICACAO`, `HARD_GATE_ESTADO`, `FAIXA_SCORE: OpcaoLista[]`
  - `DIMENSOES_COM04: { campo: string; rotulo: string }[]` (9) e `HARD_GATES_COM04: { campo: string; rotulo: string }[]` (7)
  - `interface AvaliacaoCom04` — a forma mínima que as regras leem
  - `notaValida(v: unknown): boolean`
  - `notasCompletas(av: AvaliacaoCom04): boolean`
  - `calcularScore(av: AvaliacaoCom04): number | null`
  - `faixaDoScore(score: number | null): string | null`
  - `avaliacaoPermiteQualificada(av: AvaliacaoCom04 | null): string | null`

- [ ] **Step 1: Escrever o teste que falha**

Criar `packages/lib/src/crm/qualificacao.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  DIMENSOES_COM04,
  HARD_GATES_COM04,
  avaliacaoPermiteQualificada,
  calcularScore,
  faixaDoScore,
  notaValida,
  notasCompletas,
  type AvaliacaoCom04,
} from "./qualificacao";

/** Avaliação que cumpre as 10 condições do manual §18 — base dos casos negativos. */
function avaliacaoAprovada(): AvaliacaoCom04 {
  const av: AvaliacaoCom04 = {
    statusAvaliacao: "concluida",
    resultado: "qualificada",
    justificativa: "Demanda confirmada com a SEDUC em reunião de 02/09.",
    proximoPasso: "Enviar proposta até 15/09.",
    vigente: true,
  };
  for (const d of DIMENSOES_COM04) av[d.campo] = 2;
  for (const g of HARD_GATES_COM04) av[g.campo] = "nao";
  return av;
}

describe("método COM-04 — estrutura", () => {
  it("tem 9 dimensões e 7 hard gates", () => {
    expect(DIMENSOES_COM04).toHaveLength(9);
    expect(HARD_GATES_COM04).toHaveLength(7);
  });
});

describe("notas", () => {
  it("aceita apenas inteiros de 0 a 3", () => {
    for (const v of [0, 1, 2, 3]) expect(notaValida(v)).toBe(true);
    for (const v of [-1, 4, 2.5, "3", "", null, undefined, NaN]) expect(notaValida(v)).toBe(false);
  });

  it("só considera completo quando as 9 dimensões têm nota", () => {
    const av = avaliacaoAprovada();
    expect(notasCompletas(av)).toBe(true);
    delete av[DIMENSOES_COM04[4]!.campo];
    expect(notasCompletas(av)).toBe(false);
  });
});

describe("score e faixa", () => {
  it("soma as 9 notas quando completas e devolve null quando não", () => {
    const av = avaliacaoAprovada();
    expect(calcularScore(av)).toBe(18);
    for (const d of DIMENSOES_COM04) av[d.campo] = 3;
    expect(calcularScore(av)).toBe(27);
    for (const d of DIMENSOES_COM04) av[d.campo] = 0;
    expect(calcularScore(av)).toBe(0);
    delete av[DIMENSOES_COM04[0]!.campo];
    expect(calcularScore(av)).toBeNull();
  });

  it("aplica os cortes do manual §15: 18 e 10", () => {
    expect(faixaDoScore(27)).toBe("forte");
    expect(faixaDoScore(18)).toBe("forte");
    expect(faixaDoScore(17)).toBe("intermediario");
    expect(faixaDoScore(10)).toBe("intermediario");
    expect(faixaDoScore(9)).toBe("fraco");
    expect(faixaDoScore(0)).toBe("fraco");
    expect(faixaDoScore(null)).toBeNull();
  });
});

describe("avaliacaoPermiteQualificada — as 10 condições do manual §18", () => {
  it("libera quando a avaliação cumpre todas", () => {
    expect(avaliacaoPermiteQualificada(avaliacaoAprovada())).toBeNull();
  });

  it("sem avaliação vigente", () => {
    expect(avaliacaoPermiteQualificada(null)).toBe(
      "Estágio Qualificada bloqueado: não há avaliação vigente.",
    );
  });

  it("avaliação vigente não concluída", () => {
    const av = { ...avaliacaoAprovada(), statusAvaliacao: "em-preenchimento" };
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: a avaliação vigente não está Concluída (status_avaliacao).",
    );
  });

  it("dimensões incompletas", () => {
    const av = avaliacaoAprovada();
    delete av[DIMENSOES_COM04[8]!.campo];
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: as 9 dimensões não estão preenchidas.",
    );
  });

  it("hard gates não avaliados", () => {
    const av = avaliacaoAprovada();
    delete av[HARD_GATES_COM04[3]!.campo];
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: os 7 hard gates não foram todos avaliados.",
    );
  });

  it("hard gate acionado", () => {
    const av = avaliacaoAprovada();
    av[HARD_GATES_COM04[1]!.campo] = "sim";
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: há hard gate acionado (Sim).",
    );
  });

  it("hard gate em validação", () => {
    const av = avaliacaoAprovada();
    av[HARD_GATES_COM04[6]!.campo] = "em-validacao";
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: há hard gate Em validação.",
    );
  });

  it("resultado diferente de Qualificada", () => {
    const av = { ...avaliacaoAprovada(), resultado: "nurturing" };
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: resultado da avaliação ≠ Qualificada.",
    );
  });

  it("justificativa ausente", () => {
    const av = { ...avaliacaoAprovada(), justificativa: "   " };
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: justificativa ausente.",
    );
  });

  it("próximo passo ausente", () => {
    const av = { ...avaliacaoAprovada(), proximoPasso: "" };
    expect(avaliacaoPermiteQualificada(av)).toBe(
      "Estágio Qualificada bloqueado: próximo passo ausente.",
    );
  });

  it("hard gate acionado vence score alto — manual §16", () => {
    const av = avaliacaoAprovada();
    for (const d of DIMENSOES_COM04) av[d.campo] = 3;
    av[HARD_GATES_COM04[0]!.campo] = "sim";
    expect(calcularScore(av)).toBe(27);
    expect(avaliacaoPermiteQualificada(av)).toContain("hard gate acionado");
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/lib test`
Expected: FAIL — `Failed to resolve import "./qualificacao"`.

- [ ] **Step 3: Implementar**

Criar `packages/lib/src/crm/qualificacao.ts`:

```ts
/**
 * Qualificação de oportunidade — método COM-04 (Manual NTC-COM-CRM-01 §§13-19).
 * Puro, sem I/O: usado no formulário (resumo ao vivo), no hook da coleção
 * (derivados) e no gate do estágio "Qualificada".
 *
 * As mensagens de bloqueio são contratuais: a equipe é treinada nelas e o
 * §18 do manual as reproduz palavra por palavra. Não reescrever.
 */

import { opcoes, type OpcaoLista } from "./listas";

export const STATUS_AVALIACAO: OpcaoLista[] = opcoes(["Em preenchimento", "Concluída", "Cancelada"]);

export const RESULTADO_QUALIFICACAO: OpcaoLista[] = opcoes([
  "Qualificada",
  "Qualificar mais",
  "Nurturing",
  "Não qualificada",
]);

export const HARD_GATE_ESTADO: OpcaoLista[] = opcoes(["Sim", "Não", "Em validação"]);

export const FAIXA_SCORE: OpcaoLista[] = opcoes(["Forte", "Intermediário", "Fraco"]);

/** As 9 dimensões do §14, na ordem do manual. A 8 (Risco) tem régua invertida. */
export const DIMENSOES_COM04: { campo: string; rotulo: string }[] = [
  { campo: "notaNecessidade", rotulo: "1 · Necessidade" },
  { campo: "notaAderencia", rotulo: "2 · Aderência" },
  { campo: "notaPrioridade", rotulo: "3 · Prioridade" },
  { campo: "notaTiming", rotulo: "4 · Timing" },
  { campo: "notaCaminho", rotulo: "5 · Caminho de contratação" },
  { campo: "notaStakeholders", rotulo: "6 · Stakeholders" },
  { campo: "notaOrcamento", rotulo: "7 · Orçamento / capacidade" },
  { campo: "notaRisco", rotulo: "8 · Risco (régua invertida)" },
  { campo: "notaValor", rotulo: "9 · Valor estratégico para a NTC" },
];

/** Os 7 hard gates do §16, na ordem do manual. */
export const HARD_GATES_COM04: { campo: string; rotulo: string }[] = [
  { campo: "hgAderencia", rotulo: "Ausência total de aderência" },
  { campo: "hgJuridico", rotulo: "Risco jurídico / compliance impeditivo" },
  { campo: "hgCondicao", rotulo: "Condição comercial inviável" },
  { campo: "hgIncapacidade", rotulo: "Incapacidade estrutural / insanável" },
  { campo: "hgDemanda", rotulo: "Demanda inexistente" },
  { campo: "hgRequisito", rotulo: "Requisito não atendível" },
  { campo: "hgIntegridade", rotulo: "Violação de integridade" },
];

/** Forma mínima que as regras leem — a coleção tem mais campos que isto. */
export interface AvaliacaoCom04 {
  statusAvaliacao?: string | null;
  resultado?: string | null;
  justificativa?: string | null;
  proximoPasso?: string | null;
  vigente?: boolean | null;
  [campo: string]: unknown;
}

/** Só inteiro de 0 a 3 — o manual §15 recusa 2,5 e valores fora da faixa. */
export function notaValida(v: unknown): boolean {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 3;
}

export function notasCompletas(av: AvaliacaoCom04): boolean {
  return DIMENSOES_COM04.every((d) => notaValida(av[d.campo]));
}

/** Soma das 9 notas (0-27); null enquanto alguma dimensão não tiver nota válida. */
export function calcularScore(av: AvaliacaoCom04): number | null {
  if (!notasCompletas(av)) return null;
  return DIMENSOES_COM04.reduce((soma, d) => soma + (av[d.campo] as number), 0);
}

/** Cortes do §15: 18 e 10. Referência de leitura, nunca a decisão. */
export function faixaDoScore(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 18) return "forte";
  if (score >= 10) return "intermediario";
  return "fraco";
}

const preenchido = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;

/**
 * As 10 condições do §18, na ordem em que o manual as lista. Devolve a
 * mensagem da PRIMEIRA que falhar, ou null quando todas passam.
 */
export function avaliacaoPermiteQualificada(av: AvaliacaoCom04 | null): string | null {
  if (av === null) return "Estágio Qualificada bloqueado: não há avaliação vigente.";
  if (av.statusAvaliacao !== "concluida") {
    return "Estágio Qualificada bloqueado: a avaliação vigente não está Concluída (status_avaliacao).";
  }
  if (!notasCompletas(av)) {
    return "Estágio Qualificada bloqueado: as 9 dimensões não estão preenchidas.";
  }
  if (calcularScore(av) === null) return "Estágio Qualificada bloqueado: score não calculado.";
  const estados = HARD_GATES_COM04.map((g) => av[g.campo]);
  if (!estados.every((e) => typeof e === "string" && e.length > 0)) {
    return "Estágio Qualificada bloqueado: os 7 hard gates não foram todos avaliados.";
  }
  if (estados.some((e) => e === "sim")) {
    return "Estágio Qualificada bloqueado: há hard gate acionado (Sim).";
  }
  if (estados.some((e) => e === "em-validacao")) {
    return "Estágio Qualificada bloqueado: há hard gate Em validação.";
  }
  if (av.resultado !== "qualificada") {
    return "Estágio Qualificada bloqueado: resultado da avaliação ≠ Qualificada.";
  }
  if (!preenchido(av.justificativa)) {
    return "Estágio Qualificada bloqueado: justificativa ausente.";
  }
  if (!preenchido(av.proximoPasso)) {
    return "Estágio Qualificada bloqueado: próximo passo ausente.";
  }
  return null;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/lib test`
Expected: PASS — 16 testes em `qualificacao.test.ts`.

- [ ] **Step 5: Exportar no índice**

Em `packages/lib/src/index.ts`, junto do bloco de `./crm/funil`:

```ts
export {
  STATUS_AVALIACAO,
  RESULTADO_QUALIFICACAO,
  HARD_GATE_ESTADO,
  FAIXA_SCORE,
  DIMENSOES_COM04,
  HARD_GATES_COM04,
  notaValida,
  notasCompletas,
  calcularScore,
  faixaDoScore,
  avaliacaoPermiteQualificada,
  type AvaliacaoCom04,
} from "./crm/qualificacao";
```

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @ntc/lib typecheck && pnpm --filter @ntc/lib lint`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add packages/lib/src/crm/qualificacao.ts packages/lib/src/crm/qualificacao.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): adiciona as regras puras da qualificação COM-04"
```

---

### Task 2: Coleção `avaliacoes-qualificacao`

**Files:**
- Create: `apps/cms/src/lib/crm/derivadosAvaliacao.ts`
- Create: `apps/cms/src/lib/crm/derivadosAvaliacao.test.ts`
- Create: `apps/cms/src/collections/AvaliacoesQualificacao.ts`
- Modify: `apps/cms/src/payload.config.ts` (imports e array `collections`, logo depois de `HistoricoEstagio`)

**Interfaces:**
- Consumes: tudo o que a Task 1 exporta; `atendimentoComercial` de `../access/atendimentoComercial`.
- Produces:
  - `montarDerivadosAvaliacao(dados, hojeISO): { scoreTotal: number | null; faixa: string | null; concluidaEm: string | null }`
  - Coleção `avaliacoes-qualificacao` (interface TS gerada: `AvaliacaoQualificacao`).

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/derivadosAvaliacao.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { DIMENSOES_COM04 } from "@ntc/lib";

import { montarDerivadosAvaliacao } from "./derivadosAvaliacao";

const HOJE = "2026-09-07";

function comNotas(nota: number): Record<string, unknown> {
  const dados: Record<string, unknown> = {};
  for (const d of DIMENSOES_COM04) dados[d.campo] = nota;
  return dados;
}

describe("montarDerivadosAvaliacao", () => {
  it("calcula score e faixa quando as 9 dimensões têm nota", () => {
    expect(montarDerivadosAvaliacao(comNotas(3), HOJE)).toMatchObject({
      scoreTotal: 27,
      faixa: "forte",
    });
    expect(montarDerivadosAvaliacao(comNotas(1), HOJE)).toMatchObject({
      scoreTotal: 9,
      faixa: "fraco",
    });
  });

  it("zera score e faixa quando falta nota", () => {
    const dados = comNotas(2);
    delete dados[DIMENSOES_COM04[0]!.campo];
    expect(montarDerivadosAvaliacao(dados, HOJE)).toMatchObject({ scoreTotal: null, faixa: null });
  });

  it("carimba a data de conclusão quando a avaliação é concluída sem data", () => {
    const dados = { ...comNotas(2), statusAvaliacao: "concluida" };
    expect(montarDerivadosAvaliacao(dados, HOJE).concluidaEm).toBe(HOJE);
  });

  it("respeita a data de conclusão já informada", () => {
    const dados = { ...comNotas(2), statusAvaliacao: "concluida", concluidaEm: "2026-08-30" };
    expect(montarDerivadosAvaliacao(dados, HOJE).concluidaEm).toBe("2026-08-30");
  });

  it("não carimba data quando a avaliação não está concluída", () => {
    const dados = { ...comNotas(2), statusAvaliacao: "em-preenchimento" };
    expect(montarDerivadosAvaliacao(dados, HOJE).concluidaEm).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- derivadosAvaliacao`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar os derivados**

Criar `apps/cms/src/lib/crm/derivadosAvaliacao.ts`:

```ts
/**
 * Derivados da avaliação de qualificação, gravados pelo hook beforeChange da
 * coleção: score, faixa e a data de conclusão. Persistidos (e não só
 * calculados na tela) para permitir ordenar e filtrar — decisão de docs/17 §4.
 */
import { calcularScore, faixaDoScore, type AvaliacaoCom04 } from "@ntc/lib";

export interface DerivadosAvaliacao {
  scoreTotal: number | null;
  faixa: string | null;
  concluidaEm: string | null;
}

export function montarDerivadosAvaliacao(
  dados: AvaliacaoCom04,
  hojeISO: string,
): DerivadosAvaliacao {
  const scoreTotal = calcularScore(dados);
  const concluidaAtual = typeof dados.concluidaEm === "string" ? dados.concluidaEm : null;
  return {
    scoreTotal,
    faixa: faixaDoScore(scoreTotal),
    concluidaEm:
      dados.statusAvaliacao === "concluida" ? (concluidaAtual ?? hojeISO) : concluidaAtual,
  };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- derivadosAvaliacao`
Expected: PASS — 5 testes.

- [ ] **Step 5: Criar a coleção**

Criar `apps/cms/src/collections/AvaliacoesQualificacao.ts`:

```ts
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from "payload";

import {
  DIMENSOES_COM04,
  FAIXA_SCORE,
  HARD_GATES_COM04,
  HARD_GATE_ESTADO,
  RESULTADO_QUALIFICACAO,
  STATUS_AVALIACAO,
  notaValida,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { montarDerivadosAvaliacao } from "../lib/crm/derivadosAvaliacao";

/** Nota 0-3 inteira; o manual §15 recusa 2,5 e valores fora da faixa. */
const validarNota = (valor: number | null | undefined): true | string =>
  valor === null || valor === undefined || notaValida(valor)
    ? true
    : "Use apenas os inteiros 0, 1, 2 ou 3.";

const gravarDerivados: CollectionBeforeChangeHook = ({ data }) => ({
  ...data,
  ...montarDerivadosAvaliacao(data, new Date().toISOString().slice(0, 10)),
});

/**
 * Uma única avaliação vigente por oportunidade (manual §13). Desmarca as
 * anteriores na MESMA transação — `req` repassado — para não existir instante
 * em que duas valem ao mesmo tempo.
 */
const manterUnicaVigente: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.vigente !== true) return doc;
  const oportunidadeId = typeof doc.oportunidade === "object" ? doc.oportunidade?.id : doc.oportunidade;
  if (oportunidadeId === undefined || oportunidadeId === null) return doc;
  await req.payload.update({
    collection: "avaliacoes-qualificacao",
    where: {
      and: [
        { oportunidade: { equals: oportunidadeId } },
        { id: { not_equals: doc.id } },
        { vigente: { equals: true } },
      ],
    },
    data: { vigente: false },
    req,
  });
  return doc;
};

/**
 * Avaliações de Qualificação (COM-04) — docs/17 §1.2, Manual §§13-19.
 * A avaliação antiga nunca é sobrescrita: requalificar é criar uma nova e
 * marcá-la como vigente (§19).
 */
export const AvaliacoesQualificacao: CollectionConfig = {
  slug: "avaliacoes-qualificacao",
  labels: { singular: "Avaliação de Qualificação", plural: "Avaliações de Qualificação" },
  typescript: { interface: "AvaliacaoQualificacao" },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["oportunidade", "statusAvaliacao", "scoreTotal", "resultado", "vigente"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [gravarDerivados],
    afterChange: [manterUnicaVigente],
  },
  fields: [
    {
      name: "oportunidade",
      type: "relationship",
      relationTo: "oportunidades",
      required: true,
      index: true,
    },
    { name: "sequencia", type: "number", min: 1 },
    {
      name: "statusAvaliacao",
      type: "select",
      options: STATUS_AVALIACAO,
      required: true,
      defaultValue: "em-preenchimento",
    },
    {
      name: "concluidaEm",
      type: "date",
      admin: { description: "Preenchida automaticamente quando a avaliação é concluída." },
    },
    { name: "avaliador", type: "relationship", relationTo: "users", required: true },
    { name: "owner", type: "relationship", relationTo: "users" },
    ...DIMENSOES_COM04.map((d) => ({
      name: d.campo,
      label: `${d.rotulo} (0-3)`,
      type: "number" as const,
      min: 0,
      max: 3,
      validate: validarNota,
    })),
    {
      name: "scoreTotal",
      type: "number",
      admin: { readOnly: true, description: "Soma das 9 dimensões (0-27). Derivado." },
    },
    {
      name: "faixa",
      type: "select",
      options: FAIXA_SCORE,
      admin: { readOnly: true, description: "Referência de leitura do score. Derivada." },
    },
    ...HARD_GATES_COM04.map((g) => ({
      name: g.campo,
      label: `HG · ${g.rotulo}`,
      type: "select" as const,
      options: HARD_GATE_ESTADO,
    })),
    {
      name: "resultado",
      type: "select",
      options: RESULTADO_QUALIFICACAO,
      admin: { description: "Decisão do avaliador. O score é apoio, não decide (manual §15)." },
    },
    { name: "justificativa", type: "textarea" },
    { name: "proximoPasso", type: "text" },
    {
      name: "vigente",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uma única avaliação vigente por oportunidade (manual §13)." },
    },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 6: Registrar no config**

Em `apps/cms/src/payload.config.ts`, o import junto dos demais (ordem alfabética) e o item no array logo depois de `HistoricoEstagio`:

```ts
import { AvaliacoesQualificacao } from "./collections/AvaliacoesQualificacao";
```

```ts
    HistoricoEstagio,
    AvaliacoesQualificacao,
```

- [ ] **Step 7: Verificar tipos e testes**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test`
Expected: o typecheck acusa `"avaliacoes-qualificacao"` fora de `CollectionSlug` até a geração de tipos do Step 8 — esperado. Qualquer outro erro é regressão.

- [ ] **Step 8: PARE — sincronização de schema é do coordenador**

Não execute. Peça: **dev server parado** (sessão paralela trava o push — aconteceu na H1), `pnpm payload:push:schema` com o diff revisado (tabela `avaliacoes_qualificacao` nova, tudo aditivo), `N` em qualquer `DATA LOSS`, e `pnpm payload:generate` depois.

- [ ] **Step 9: Confirmar os tipos e commitar**

Run: `grep -n "avaliacoes-qualificacao" packages/types/src/payload-types.ts | head -3`
Expected: a coleção aparece no arquivo gerado; typecheck limpo.

```bash
git add apps/cms/src/collections/AvaliacoesQualificacao.ts apps/cms/src/lib/crm/derivadosAvaliacao.ts \
  apps/cms/src/lib/crm/derivadosAvaliacao.test.ts apps/cms/src/payload.config.ts packages/types/src/payload-types.ts
git commit -m "feat(crm): adiciona a coleção de avaliações de qualificação COM-04"
```

---

### Task 3: Escrita, leitura e telas da qualificação

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts`
- Create: `apps/cms/src/lib/cms/painelCrmEscrita.avaliacao.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCrm.ts`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`
- Create: `apps/cms/src/app/(painel)/crm/TelaQualificacao.tsx`
- Create: `apps/cms/src/app/(painel)/crm/FormAvaliacao.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/seloStatus.ts`
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx`

**Interfaces:**
- Consumes: Task 1 e Task 2; `obterUsuarioAutenticado()` de `@/lib/cms/autenticacao` (padrão da H1 para propagar o usuário à Local API).
- Produces:
  - `interface DadosAvaliacao` (campos do formulário, todos `string`, como as demais entidades do CRM)
  - `criarAvaliacao(dados, usuario)` e `atualizarAvaliacao(id, dados, usuario)` → `ResultadoEscrita`
  - `AvaliacaoResumo`, `AvaliacaoDetalhe`, `listarAvaliacoesCrm()`, `obterAvaliacaoCrm(id)`
  - Server Actions `salvarAvaliacaoCrm`, `carregarAvaliacaoCrm`
  - `seloDeResultado(resultado)`, `seloDeFaixa(faixa)`
  - `TelaCrmId` ganha `"qualificacao"`

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/cms/painelCrmEscrita.avaliacao.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarAvaliacao } = await import("./painelCrmEscrita");

const usuarioFalso = { id: 4, email: "contato@institutontc.com.br", collection: "users" };

const dadosBase = {
  oportunidade: "7",
  statusAvaliacao: "em-preenchimento",
  avaliador: "4",
  owner: "4",
  notaNecessidade: "3",
  notaAderencia: "3",
  notaPrioridade: "2",
  notaTiming: "2",
  notaCaminho: "2",
  notaStakeholders: "2",
  notaOrcamento: "2",
  notaRisco: "2",
  notaValor: "3",
  hgAderencia: "nao",
  hgJuridico: "nao",
  hgCondicao: "nao",
  hgIncapacidade: "nao",
  hgDemanda: "nao",
  hgRequisito: "nao",
  hgIntegridade: "nao",
  resultado: "qualificada",
  justificativa: "Demanda confirmada em reunião.",
  proximoPasso: "Enviar proposta.",
  vigente: true,
  observacoes: "",
};

function montarPayloadFalso() {
  const criados: Record<string, unknown>[] = [];
  const opcoes: Record<string, unknown>[] = [];
  obterPayloadMock.mockResolvedValue({
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      criados.push(args.data);
      opcoes.push(args as unknown as Record<string, unknown>);
      return { id: 1, ...args.data };
    }),
    update: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockResolvedValue({ docs: [] }),
  });
  return { criados, opcoes };
}

afterEach(() => vi.clearAllMocks());

describe("criarAvaliacao", () => {
  it("converte as notas de texto para número inteiro", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarAvaliacao(dadosBase, usuarioFalso);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ notaNecessidade: 3, notaRisco: 2, oportunidade: 7 });
  });

  it("propaga o usuário da sessão para a Local API", async () => {
    const { opcoes } = montarPayloadFalso();
    await criarAvaliacao(dadosBase, usuarioFalso);
    expect(opcoes[0]).toMatchObject({ user: usuarioFalso });
  });

  it("recusa sem oportunidade, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarAvaliacao({ ...dadosBase, oportunidade: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione a oportunidade." });
  });

  it("recusa nota fora da faixa com mensagem específica", async () => {
    montarPayloadFalso();
    const r = await criarAvaliacao({ ...dadosBase, notaTiming: "4" }, usuarioFalso);
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("0, 1, 2 ou 3");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.avaliacao`
Expected: FAIL — `criarAvaliacao` não existe.

- [ ] **Step 3: Implementar a escrita**

Em `apps/cms/src/lib/cms/painelCrmEscrita.ts`, seguindo o formato das entidades vizinhas (`DadosOportunidade`/`criarOportunidade`): a interface `DadosAvaliacao` com todos os campos como `string` (mais `vigente: boolean`), um mapper que converte notas com `Number` e recusa fora de 0-3 usando `notaValida` de `@ntc/lib`, e as funções `criarAvaliacao`/`atualizarAvaliacao` que validam **antes** de `obterPayload()` e repassam `user`. Mensagens: `"Selecione a oportunidade."`, `"Selecione o avaliador."`, e para nota inválida `"Nota inválida em <rótulo da dimensão>: use apenas os inteiros 0, 1, 2 ou 3."`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.avaliacao`
Expected: PASS — 4 testes.

- [ ] **Step 5: Leitura e Server Actions**

Em `painelCrm.ts`, `AvaliacaoResumo` (`id`, `oportunidadeId`, `oportunidadeCodigo`, `statusAvaliacao`, `scoreTotal`, `faixa`, `resultado`, `vigente`, `concluidaEmISO`, `avaliadorNome`) e `AvaliacaoDetalhe` (as 9 notas, os 7 hard gates, justificativa, próximo passo, observações, ids de avaliador/owner); `listarAvaliacoesCrm()` ordenando `-createdAt` e `obterAvaliacaoCrm(id)`. Em `acoesCrm.ts`, `carregarAvaliacaoCrm(id)` e `salvarAvaliacaoCrm(id, dados)` — sessão validada antes de qualquer leitura ou escrita, com `obterUsuarioAutenticado()` repassado à camada de escrita, exatamente como as ações de oportunidade fazem.

- [ ] **Step 6: Telas**

`TelaQualificacao.tsx` no padrão de `TelaVersoes.tsx`: cabeçalho com eyebrow "Processo Comercial B2G", tabela com oportunidade, status, score, faixa, resultado, vigente e a data de conclusão; botão "Nova avaliação". `FormAvaliacao.tsx` no padrão de `FormOportunidade.tsx`, com três blocos — identificação, as 9 dimensões (selects 0-3, com o rótulo do manual e a nota da régua invertida no campo Risco), os 7 hard gates — e o bloco de decisão (resultado, justificativa, próximo passo, vigente). Mostre o score e a faixa calculados ao vivo com `calcularScore`/`faixaDoScore`, deixando claro que são apoio à decisão.

Em `seloStatus.ts`, `seloDeResultado` (qualificada → ok, qualificar-mais → atencao, nurturing → info, nao-qualificada → erro) e `seloDeFaixa` (forte → ok, intermediario → atencao, fraco → erro).

Em `ShellCrm.tsx`: `TelaCrmId` ganha `"qualificacao"`; um terceiro grupo de navegação entre "Operação Comercial" e "Catálogo Institucional":

```tsx
const NAV_P0: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "qualificacao", rotulo: "Qualificação (COM-04)", icone: Ico.qualificacao },
];
```

com o rótulo do grupo "Processo Comercial B2G (P0)" — as demais entradas do grupo (Contratações, Instrumentos, Handoff, Histórico) chegam nas sessões H4-H7. Acrescente o ícone `qualificacao` ao objeto `Ico` seguindo o estilo linear dos existentes, e a entrada no `CRUMB`. Em `page.tsx`, carregue `listarAvaliacoesCrm()` junto das demais listas e passe ao `ShellCrm`.

- [ ] **Step 7: Verificar tudo**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src packages
git commit -m "feat(crm): telas, escrita e leitura da avaliação de qualificação"
```

---

### Task 4: A porta do estágio "Qualificada" (Sessão H3)

**Files:**
- Create: `apps/cms/src/lib/crm/gateQualificada.ts`
- Create: `apps/cms/src/lib/crm/gateQualificada.test.ts`
- Modify: `apps/cms/src/collections/Oportunidades.ts`
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts` (repasse da mensagem à UI)

**Interfaces:**
- Consumes: `avaliacaoPermiteQualificada` (Task 1); a coleção da Task 2.
- Produces: `erroDoGateQualificada(payload, oportunidadeId, req?): Promise<string | null>` e a classe `ErroGateQualificada`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/gateQualificada.test.ts`, com a Local API mockada, cobrindo: sem avaliação vigente → mensagem de "não há avaliação vigente"; avaliação vigente incompleta → a mensagem correspondente; avaliação completa → `null`; e que a consulta filtra por `vigente: true` **e** pela oportunidade certa (uma avaliação vigente de OUTRA oportunidade não pode liberar o gate).

```ts
import { describe, expect, it, vi } from "vitest";

import { DIMENSOES_COM04, HARD_GATES_COM04 } from "@ntc/lib";

import { erroDoGateQualificada } from "./gateQualificada";

function avaliacaoCompleta(): Record<string, unknown> {
  const av: Record<string, unknown> = {
    statusAvaliacao: "concluida",
    resultado: "qualificada",
    justificativa: "Confirmada em reunião.",
    proximoPasso: "Enviar proposta.",
    vigente: true,
  };
  for (const d of DIMENSOES_COM04) av[d.campo] = 2;
  for (const g of HARD_GATES_COM04) av[g.campo] = "nao";
  return av;
}

function payloadCom(docs: Record<string, unknown>[]) {
  const find = vi.fn().mockResolvedValue({ docs });
  return { payload: { find } as never, find };
}

describe("erroDoGateQualificada", () => {
  it("bloqueia quando não há avaliação vigente", async () => {
    const { payload } = payloadCom([]);
    expect(await erroDoGateQualificada(payload, 7)).toBe(
      "Estágio Qualificada bloqueado: não há avaliação vigente.",
    );
  });

  it("repassa a mensagem da regra quando a avaliação está incompleta", async () => {
    const av = avaliacaoCompleta();
    av.justificativa = "";
    const { payload } = payloadCom([av]);
    expect(await erroDoGateQualificada(payload, 7)).toBe(
      "Estágio Qualificada bloqueado: justificativa ausente.",
    );
  });

  it("libera quando a avaliação vigente cumpre as 10 condições", async () => {
    const { payload } = payloadCom([avaliacaoCompleta()]);
    expect(await erroDoGateQualificada(payload, 7)).toBeNull();
  });

  it("consulta só a avaliação vigente daquela oportunidade", async () => {
    const { payload, find } = payloadCom([avaliacaoCompleta()]);
    await erroDoGateQualificada(payload, 7);
    const args = find.mock.calls[0]![0] as { collection: string; where: unknown };
    expect(args.collection).toBe("avaliacoes-qualificacao");
    expect(JSON.stringify(args.where)).toContain("\"equals\":7");
    expect(JSON.stringify(args.where)).toContain("vigente");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- gateQualificada`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar a ponte e o erro tipado**

Criar `apps/cms/src/lib/crm/gateQualificada.ts` com uma função que busca a avaliação vigente da oportunidade (`limit: 1`, `depth: 0`, `where` com `oportunidade equals` e `vigente equals true`) e devolve `avaliacaoPermiteQualificada(doc ?? null)`. Exporte também `class ErroGateQualificada extends Error`, para a camada de escrita distinguir o bloqueio de negócio de um erro genérico.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- gateQualificada`
Expected: PASS — 4 testes.

- [ ] **Step 5: Ligar o gate no hook da oportunidade**

Em `Oportunidades.ts`, um `beforeChange` novo — **antes** de `espelharStatusLegado` na lista, para não gravar espelho de um estágio que será recusado. Ele só age quando o estágio muda para `qualificada` (`originalDoc?.estagio !== "qualificada" && data.estagio === "qualificada"`), consulta `erroDoGateQualificada` com `req.payload` e `req`, e lança `ErroGateQualificada` com a mensagem. Documente no comentário que a criação de oportunidade já em "Qualificada" também passa pelo gate.

- [ ] **Step 6: Fazer a mensagem chegar à tela**

Em `painelCrmEscrita.ts`, `criarOportunidade`/`atualizarOportunidade` capturam `ErroGateQualificada` e devolvem `{ ok: false, erro: mensagem }` — em vez do `ERRO_GENERICO`, que esconderia justamente o que o usuário precisa ler. Qualquer outro erro segue genérico. Acrescente ao `painelCrmEscrita.estagio.test.ts` um caso: a Local API rejeita com `ErroGateQualificada` e a função devolve a mensagem íntegra.

- [ ] **Step 7: Verificar**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: verde, com os testes novos do gate e do repasse.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src
git commit -m "feat(crm): bloqueia o estágio Qualificada sem avaliação que o sustente"
```

---

### Task 5: Fechamento da sessão

- [ ] **Step 1: Suíte completa**

Run: `pnpm lint && pnpm typecheck && pnpm test`

- [ ] **Step 2: Build**

Com o dev server **parado**: `pnpm build`. Depois: `rm -rf apps/cms/.next apps/web/.next`.

- [ ] **Step 3: Checkpoint visual (humano)**

Suba `pnpm dev:cms` e peça a aprovação: a tela Qualificação no grupo novo do menu; o formulário com as 9 dimensões, os 7 hard gates e o score ao vivo; e o teste que importa — criar uma oportunidade, tentar movê-la para "Qualificada" sem avaliação e **ver a mensagem exata do §18 aparecer no formulário**, não um erro genérico. Depois criar a avaliação completa e ver o estágio ser aceito.

- [ ] **Step 4: Documentação**

`CLAUDE.md` §19 (coleções 19 → 20, o que passa a funcionar, backlog), `docs/17` §4 (marcar H2 e H3 concluídas, no formato da H1) e `docs/16` (bloco da Janela H). Registre o que ficou: a Sessão H4 depende da ratificação do *Accountable* pelo PO.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/16_Roadmap_CMS_CRM_v1.md docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md
git commit -m "docs: registra a conclusão das Sessões H2 e H3 (qualificação COM-04)"
```

---

## Cobertura da spec

| Requisito (docs/17 §4 · Manual §§13-19) | Onde |
|---|---|
| 9 dimensões, notas inteiras 0-3, validação estrita | Task 1 (regra), Task 2 (coleção), Task 3 (escrita) |
| Score 0-27 e faixa nos cortes 18/10, persistidos | Task 1, Task 2 |
| 7 hard gates com três estados | Task 1, Task 2 |
| `concluidaEm` automática ao concluir | Task 2 |
| Uma única avaliação vigente por oportunidade, na mesma transação | Task 2 (`manterUnicaVigente`) |
| Requalificação sem sobrescrever a anterior (§19) | consequência do modelo: nova avaliação + `vigente`, coberto em Task 2 |
| As 10 condições do §18, com as mensagens exatas | Task 1 (regra + testes), Task 4 (gate) |
| Score não decide — resultado é registro do avaliador (§15) | Task 1 (nenhuma derivação de `resultado`), Task 3 (formulário) |
| Mensagem de bloqueio visível no formulário, não toast genérico | Task 4, Step 6 |
| Tela e grupo de menu "Processo Comercial B2G (P0)" | Task 3 |

**Fora do escopo:** contratação, instrumentos, handoff e a porta de "Ganha" (H4/H5); integridade de exclusão e auditoria (H6); a tela da fila de revisão de migração (H7); a reedição do manual (H8).

---

## Antes de começar

- **Pré-requisito do PO:** confirmar que as 9 dimensões, os 7 hard gates e os cortes 18/10 são os oficiais (`docs/17` §3, decisão 7). O Manual Operacional v1.0, aprovado para uso interno, já os fixa e foi conferido contra o código do protótipo — se o PO aceitar o manual como fonte, o item está respondido.
- **Estado do repositório na abertura da sessão:** a Sessão H1 está mergeada na `main`; há branches locais aguardando decisão do PO (`chore/senha-minima-8`, `docs/estado-pos-merge-h1`, `docs/plano-h2-h3`) e a `main` local está à frente do `origin`.
- **Herança da H1 que esta sessão usa sem reimplementar:** `estagioLegado`/`planejarMigracaoOportunidade` e o histórico de estágio; o padrão de propagação do usuário para a Local API; as type guards `ehEstagioOportunidade`/`ehSituacaoOportunidade`.

---

*Portal Grupo NTC · plano das Sessões H2 e H3 · 7 de setembro de 2026 · Instituto NTC do Brasil*
