import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { atualizarProposta, criarProposta, dadosProposta } = await import("./painelCrmEscrita");

afterEach(() => vi.clearAllMocks());

/** Dados mínimos válidos; cada teste sobrescreve o que quer testar. */
const base = {
  valorUnitario: "100", qtdPagantes: "10", cortesias: "0", percDesconto: "0",
  cliente: "1", programa: "2", lead: "7", tipo: "programa-completo",
  modulos: [], eventos: [], modalidade: "", replay: "", condPagto: "",
  condEspecificas: "", observacoes: "", elaborador: "", aprovador: "",
  validadeDias: "30", status: "rascunho",
};

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
        lead: "7",
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
      7, // leadId
      { codigoBase: "NTC-PROP-2026-PROGE-SP-X", codigo: "NTC-PROP-2026-PROGE-SP-X-v01", versao: 1 },
    );
    expect(d.lead).toBe(7);
    expect(d.valorBruto).toBe(1000);
    expect(d.desconto).toBe(100);
    expect(d.valorLiquido).toBe(900);
    expect(typeof d.percDesconto).toBe("number");
    expect(d.percDesconto).toBe(10);
  });
});

describe("programa obrigatório na proposta (decisão do PO, 30/09/2026)", () => {
  it("criarProposta recusa sem programa, sem tocar o banco", async () => {
    expect(await criarProposta({ ...base, programa: "" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("atualizarProposta recusa sem programa, sem tocar o banco", async () => {
    expect(await atualizarProposta("9", { ...base, programa: "" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("recusa programa que não resolve para um id", async () => {
    expect(await criarProposta({ ...base, programa: "abc" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });
});
