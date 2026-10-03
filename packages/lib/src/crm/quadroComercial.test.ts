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
