import { describe, expect, it } from "vitest";

import { DIMENSOES_COM04, type AvaliacaoCom04 } from "@ntc/lib";

import { hojeEmSaoPaulo, montarDerivadosAvaliacao } from "./derivadosAvaliacao";

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

  // Escrita parcial: o hook de vigência dispara `payload.update({ where },
  // { vigente: false })`, e um PATCH via REST pode mandar um campo só. Os
  // derivados precisam sair do documento persistido, não de um `data` curto.
  it("preserva score, faixa e conclusão numa escrita parcial, lendo o documento persistido", () => {
    const original = { ...comNotas(3), statusAvaliacao: "concluida", concluidaEm: "2026-08-30" };
    expect(montarDerivadosAvaliacao({ vigente: false }, HOJE, original)).toEqual({
      scoreTotal: 27,
      faixa: "forte",
      concluidaEm: "2026-08-30",
    });
  });

  it("preserva a data de conclusão que chega como Date, sem recarimbar", () => {
    const original = {
      ...comNotas(2),
      statusAvaliacao: "concluida",
      concluidaEm: new Date("2026-08-30T00:00:00.000Z"),
    };
    expect(montarDerivadosAvaliacao({ vigente: false }, HOJE, original).concluidaEm).toBe("2026-08-30");
  });

  it("dá precedência ao que chega na escrita sobre o documento persistido", () => {
    const original = { ...comNotas(3), statusAvaliacao: "concluida", concluidaEm: "2026-08-30" };
    const dados = { ...comNotas(1), statusAvaliacao: "concluida", concluidaEm: "2026-09-01" };
    expect(montarDerivadosAvaliacao(dados, HOJE, original)).toEqual({
      scoreTotal: 9,
      faixa: "fraco",
      concluidaEm: "2026-09-01",
    });
  });

  it("apaga a nota que a escrita enviou explicitamente como null", () => {
    const original = comNotas(3);
    const dados: Record<string, unknown> = { [DIMENSOES_COM04[0]!.campo]: null };
    expect(montarDerivadosAvaliacao(dados, HOJE, original)).toMatchObject({
      scoreTotal: null,
      faixa: null,
    });
  });
});

describe("hojeEmSaoPaulo", () => {
  it("usa o dia de São Paulo, não o de UTC, depois das 21h", () => {
    // 2026-09-08T02:30:00Z é ainda 07/09 às 23h30 em São Paulo (UTC-3).
    expect(hojeEmSaoPaulo(new Date("2026-09-08T02:30:00.000Z"))).toBe("2026-09-07");
  });

  it("formata como YYYY-MM-DD", () => {
    expect(hojeEmSaoPaulo(new Date("2026-01-05T15:00:00.000Z"))).toBe("2026-01-05");
  });
});
