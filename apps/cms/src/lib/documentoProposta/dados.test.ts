import { describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterDadosDocumentoProposta } = await import("./dados");

describe("obterDadosDocumentoProposta", () => {
  it("resolve cliente, programa, módulos e eventos populados", async () => {
    const propostaFalsa = {
      id: 42,
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      codigoBase: "NTC-PROP-2026-PROGE-SP-X",
      versao: 1,
      tipo: "programa-completo",
      status: "rascunho",
      modalidade: "Presencial",
      replay: null,
      condPagto: "À vista após NF · 15 dias",
      condEspecificas: null,
      dataCriacao: "2026-08-29T12:00:00.000Z",
      validade: "2026-09-28T12:00:00.000Z",
      elaborador: { id: 5, nome: "Ana Comercial" },
      cliente: {
        id: 3,
        orgao: "Secretaria de Educação de São Paulo",
        sigla: "SEDUC-SP",
        municipio: "São Paulo",
        uf: "SP",
        dirigente: "Fulano de Tal",
      },
      programa: { id: 7, sigla: "PROGE", nomeCompleto: "Programa de Gestão Estratégica" },
      modulos: [{ id: 1, numero: 1, titulo: "Gestão Democrática", cargaHoraria: "40h" }],
      eventos: [],
      valorUnitario: 100,
      qtdPagantes: 10,
      cortesias: 2,
      percDesconto: 10,
      valorBruto: 1000,
      desconto: 100,
      valorLiquido: 900,
    };
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue(propostaFalsa),
    });

    const dados = await obterDadosDocumentoProposta("42");

    expect(dados).not.toBeNull();
    expect(dados?.clienteOrgao).toBe("Secretaria de Educação de São Paulo");
    expect(dados?.programaNome).toBe("Programa de Gestão Estratégica");
    expect(dados?.tipoTexto).toBe("Trilha Completa de Programa Estratégico");
    expect(dados?.itens).toEqual([
      { rotulo: "M1 · Gestão Democrática", cargaHoraria: "40h", valorUnitario: 100 },
    ]);
    expect(dados?.elaboradorNome).toBe("Ana Comercial");
  });

  it("devolve null quando a proposta não existe", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockRejectedValue(new Error("not found")),
    });

    const dados = await obterDadosDocumentoProposta("999");

    expect(dados).toBeNull();
  });

  it("usa fallbacks quando cliente/programa/elaborador não estão populados", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue({
        id: 1,
        codigo: "NTC-PROP-2026-X-v01",
        codigoBase: "NTC-PROP-2026-X",
        versao: 1,
        tipo: "customizada",
        cliente: 3, // não populado (id cru)
        programa: null,
        modulos: [],
        eventos: [],
        elaborador: null,
      }),
    });

    const dados = await obterDadosDocumentoProposta("1");

    expect(dados?.clienteOrgao).toBe("—");
    expect(dados?.programaNome).toBe("Programa Estratégico NTC");
    expect(dados?.elaboradorNome).toBe("Comercial NTC");
    expect(dados?.tipoTexto).toBe("Solução Customizada · In Company");
  });
});
