import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const contarNegociosPorCliente = vi.fn();
const ultimoItemLinhaDoTempoPorCliente = vi.fn();
vi.mock("@/lib/cms/agregadosCrm", () => ({ contarNegociosPorCliente, ultimoItemLinhaDoTempoPorCliente }));

const { listarClientesCrm, listarLeadsCrm, listarProdutosCrm, listarPropostasCrm, todosEnviosCrm, listarLinhaDoTempo } =
  await import("./painelCrm");

afterEach(() => vi.clearAllMocks());

type FindFn = (a: ArgsFind) => Promise<{ docs: unknown[] }>;

/** Argumentos da primeira chamada de `find`. */
function argsDe(f: { mock: { calls: unknown[][] } }): ArgsFind {
  return f.mock.calls[0]?.[0] as ArgsFind;
}

interface ArgsFind {
  collection: string;
  select?: Record<string, unknown>;
  populate?: Record<string, unknown>;
  depth?: number;
}

describe("listarClientesCrm", () => {
  it("usa os agregados do banco, sem ler leads nem a linha do tempo inteiros", async () => {
    const find = vi.fn<FindFn>(async (a) => {
      expect(a.collection).toBe("clientes-crm");
      return {
        docs: [
          { id: 1, orgao: "SME Alfa", contatos: [{ nome: "Ana", principal: false }, { nome: "Bia", principal: true }], responsavel: { id: 4, nome: "João" } },
          { id: 2, orgao: "SME Beta", contatos: [] },
        ],
      };
    });
    obterPayloadMock.mockResolvedValue({ find });
    contarNegociosPorCliente.mockResolvedValue(new Map([["1", 3]]));
    ultimoItemLinhaDoTempoPorCliente.mockResolvedValue(new Map([["2", "2026-10-01T12:00:00.000Z"]]));

    const lista = await listarClientesCrm();

    expect(find).toHaveBeenCalledTimes(1);
    expect(argsDe(find).select).not.toHaveProperty("observacoes");
    expect(lista.map((c) => [c.id, c.numNegocios, c.ultimoItemISO, c.contatoPrincipal, c.responsavelNome])).toEqual([
      ["1", 3, null, "Bia", "João"],
      ["2", 0, "2026-10-01T12:00:00.000Z", null, null],
    ]);
  });
});

describe("listarPropostasCrm", () => {
  it("lê só os campos do resumo e fica com a maior versão de cada código-base", async () => {
    const find = vi.fn<FindFn>(async () => ({
      docs: [
        { id: 1, codigo: "P-01-v01", codigoBase: "P-01", versao: 1, status: "substituida", cliente: { id: 9, orgao: "SME" }, programa: { id: 2, sigla: "EDUTEC" }, valorLiquido: 10, lead: { id: 5 } },
        { id: 2, codigo: "P-01-v02", codigoBase: "P-01", versao: 2, status: "enviada", cliente: { id: 9, orgao: "SME" }, programa: { id: 2, sigla: "EDUTEC" }, valorLiquido: 20, lead: null },
        { id: 3, codigo: "P-02-v01", codigoBase: "P-02", versao: 1, cliente: 9, programa: 2, lead: 7 },
      ],
    }));
    obterPayloadMock.mockResolvedValue({ find });

    const lista = await listarPropostasCrm();

    const args = argsDe(find);
    expect(Object.keys(args.select ?? {})).not.toContain("textoApresentacao");
    expect(Object.keys(args.select ?? {})).not.toContain("modulosDetalhados");
    expect(args.populate).toEqual({ "clientes-crm": { orgao: true }, programas: { sigla: true }, leads: { nome: true } });
    expect(lista).toEqual([
      { id: "3", codigo: "P-02-v01", codigoBase: "P-02", versao: 1, clienteNome: "", programaSigla: "", valorLiquido: 0, status: "rascunho", vigente: true, leadId: "7" },
      { id: "2", codigo: "P-01-v02", codigoBase: "P-01", versao: 2, clienteNome: "SME", programaSigla: "EDUTEC", valorLiquido: 20, status: "enviada", vigente: true, leadId: null },
    ]);
  });
});

describe("listarLeadsCrm", () => {
  it("popula as relações só no rótulo exibido", async () => {
    const find = vi.fn<FindFn>(async () => ({
      docs: [
        {
          id: 7, nome: "Ana", email: "a@x.gov.br", detalhesProposta: { programa: { id: 2, sigla: "EDUTEC" }, participantesEstimados: 300 },
          cliente: { id: 9, orgao: "SME" }, responsavel: { id: 4, nome: "João" }, createdAt: "c", updatedAt: "u",
        },
      ],
    }));
    obterPayloadMock.mockResolvedValue({ find });
    const [lead] = await listarLeadsCrm();
    expect(argsDe(find).populate).toEqual({ programas: { sigla: true }, "clientes-crm": { orgao: true }, users: { nome: true } });
    expect(lead).toMatchObject({ programaSigla: "EDUTEC", participantesEstimados: 300, clienteId: "9", clienteNome: "SME", responsavelNome: "João", estagio: "lead" });
  });
});

describe("listarProdutosCrm", () => {
  it("lê só nome e dados comerciais do evento", async () => {
    const find = vi.fn<FindFn>(async () => ({ docs: [{ id: 1, nome: "Seminário", comercial: { codigo: "S1", valor: 90 } }, { id: 2, nome: "Oficina" }] }));
    obterPayloadMock.mockResolvedValue({ find });
    expect(await listarProdutosCrm()).toEqual([
      { id: "1", nome: "Seminário", codigo: "S1", valor: 90 },
      { id: "2", nome: "Oficina", codigo: null, valor: null },
    ]);
    expect(argsDe(find).select).toEqual({ nome: true, comercial: { codigo: true, valor: true } });
  });
});

describe("todosEnviosCrm", () => {
  it("da proposta popula só o código", async () => {
    const find = vi.fn<FindFn>(async () => ({ docs: [{ id: 1, proposta: { id: 3, codigo: "P-01-v01" }, data: "2026-10-01T03:00:00.000Z" }] }));
    obterPayloadMock.mockResolvedValue({ find });
    const [envio] = await todosEnviosCrm();
    expect(argsDe(find).populate).toEqual({ propostas: { codigo: true } });
    expect(envio).toMatchObject({ propostaCodigo: "P-01-v01", data: "2026-10-01" });
  });
});

describe("listarLinhaDoTempo", () => {
  it("popula o usuário só no nome e mantém o lead como id", async () => {
    const find = vi.fn<FindFn>(async () => ({
      docs: [{ id: 1, tipo: "nota", titulo: "Nota", usuario: { id: 4, nome: "João" }, em: "2026-10-01T12:00:00.000Z", lead: { id: 7, nome: "Ana" }, referencia: { colecao: "propostas", id: "3" } }],
    }));
    obterPayloadMock.mockResolvedValue({ find });
    const [item] = await listarLinhaDoTempo({ clienteId: "9" });
    expect(argsDe(find).populate).toEqual({ users: { nome: true }, leads: { nome: true } });
    expect(item).toEqual({ id: "1", tipo: "nota", titulo: "Nota", detalhe: null, usuarioNome: "João", emISO: "2026-10-01T12:00:00.000Z", leadId: "7", referencia: { colecao: "propostas", id: "3" } });
  });
});
