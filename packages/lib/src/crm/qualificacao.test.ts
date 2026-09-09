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
