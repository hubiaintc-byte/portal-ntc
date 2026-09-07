import { describe, expect, it } from "vitest";

import { DIMENSOES_COM04, type AvaliacaoCom04 } from "@ntc/lib";

import { montarDerivadosAvaliacao } from "./derivadosAvaliacao";

const HOJE = "2026-09-07";

function comNotas(nota: number): AvaliacaoCom04 {
  const dados: AvaliacaoCom04 = {};
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
