import { describe, expect, it } from "vitest";

import { dadosProposta } from "./painelCrmEscrita";

describe("dadosProposta", () => {
  it("grava derivados calculados", () => {
    const d = dadosProposta(
      {
        valorUnitario: "100",
        qtdPagantes: "10",
        cortesias: "0",
        percDesconto: "10",
        cliente: "1",
        programa: "2",
        oportunidade: "",
        tipo: "programa-completo",
        modulos: [],
        eventos: [],
        modalidade: "",
        replay: "",
        condPagto: "",
        condEspecificas: "",
        observacoes: "",
        elaborador: "",
        aprovador: "",
        validadeDias: "30",
        status: "rascunho",
      },
      3, // clienteId
      { codigoBase: "NTC-PROP-2026-PROGE-SP-X", codigo: "NTC-PROP-2026-PROGE-SP-X-v01", versao: 1 },
    );
    expect(d.valorBruto).toBe(1000);
    expect(d.desconto).toBe(100);
    expect(d.valorLiquido).toBe(900);
    expect(typeof d.percDesconto).toBe("number");
    expect(d.percDesconto).toBe(10);
  });
});
