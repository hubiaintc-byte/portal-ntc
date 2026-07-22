import { describe, expect, it } from "vitest";

import {
  calcularValoresProposta,
  codigoDaVersao,
  gerarCodigoBase,
  proximaVersao,
  siglaCanonica,
} from "./propostas";

describe("calcularValoresProposta", () => {
  it("calcula bruto, desconto, líquido e acessos", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 100, qtdPagantes: 10, cortesias: 2, percDesconto: 10 }),
    ).toEqual({ valorBruto: 1000, desconto: 100, valorLiquido: 900, acessosTotais: 12 });
  });

  it("zera tudo com 0 pagantes", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 100, qtdPagantes: 0, cortesias: 5, percDesconto: 20 }),
    ).toEqual({ valorBruto: 0, desconto: 0, valorLiquido: 0, acessosTotais: 5 });
  });

  it("desconto de 100% zera o líquido", () => {
    expect(
      calcularValoresProposta({ valorUnitario: 50, qtdPagantes: 4, cortesias: 0, percDesconto: 100 }),
    ).toEqual({ valorBruto: 200, desconto: 200, valorLiquido: 0, acessosTotais: 4 });
  });
});

describe("gerarCodigoBase", () => {
  it("monta NTC-PROP-ano-programa-uf-cliente com sigla sanitizada", () => {
    expect(
      gerarCodigoBase({ ano: 2026, siglaPrograma: "PROGE", uf: "SP", siglaCliente: "SEE-SP 1" }),
    ).toBe("NTC-PROP-2026-PROGE-SP-SEESP1");
  });
});

describe("proximaVersao", () => {
  it("é 1 quando não há versões", () => {
    expect(proximaVersao([])).toBe(1);
  });
  it("é max+1 sobre o conjunto (pode ser esparso)", () => {
    expect(proximaVersao(["X-v01", "X-v03"])).toBe(4);
  });
});

describe("codigoDaVersao", () => {
  it("acrescenta -vNN com 2 dígitos", () => {
    expect(codigoDaVersao("NTC-PROP-2026-PROGE-SP-SEESP", 2)).toBe("NTC-PROP-2026-PROGE-SP-SEESP-v02");
  });
});

describe("siglaCanonica", () => {
  it("remove não-alfanuméricos e faz upper", () => {
    expect(siglaCanonica("Câmara 3")).toBe("CAMARA3");
  });
});
