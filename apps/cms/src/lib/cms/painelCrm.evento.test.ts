import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { listarEventosDoLead } = await import("./painelCrm");

/**
 * Leitura de eventos comerciais. O que se testa aqui é o corte de data: o
 * Payload guarda `type: "date"` como `timestamp with time zone`, e entregar o
 * datetime cru à tela faz `dataLegivel` formatar com fuso ("30/09/2026, 21:00"
 * para um evento do dia 01/10 em São Paulo).
 */

const EVENTO_NO_BANCO = {
  id: 12,
  titulo: "Turma EDUTEC M01",
  dataInicio: "2026-10-01T00:00:00.000Z",
  dataFim: "2026-10-03T00:00:00.000Z",
  status: "agendado",
  modalidade: "presencial",
  local: "Brasília",
  observacoes: null,
  lead: { id: 7, nome: "Ana" },
  cliente: { id: 3 },
  moduloCatalogo: { id: 4, titulo: "Módulo 01" },
  contratoEmpenho: { tipo: "empenho", numero: "2026NE000123", data: "2026-09-15T00:00:00.000Z", valor: 1000, arquivo: null },
  linksInscricao: [],
};

function payloadFalso(eventos: Record<string, unknown>[], documentos: Record<string, unknown>[] = []) {
  const find = vi.fn(async ({ collection }: { collection: string }) =>
    collection === "eventos-comerciais" ? { docs: eventos } : { docs: documentos },
  );
  obterPayloadMock.mockResolvedValue({ find });
  return { find };
}

afterEach(() => vi.clearAllMocks());

describe("listarEventosDoLead", () => {
  it("entrega as datas do evento como data-só, sem hora nem fuso", async () => {
    payloadFalso([EVENTO_NO_BANCO]);
    const [ev] = await listarEventosDoLead("7");
    expect(ev!.dataInicioISO).toBe("2026-10-01");
    expect(ev!.dataFimISO).toBe("2026-10-03");
  });

  it("entrega a data do contrato como data-só", async () => {
    payloadFalso([EVENTO_NO_BANCO]);
    const [ev] = await listarEventosDoLead("7");
    expect(ev!.contrato?.dataISO).toBe("2026-09-15");
  });

  it("sem dataFim, devolve null", async () => {
    payloadFalso([{ ...EVENTO_NO_BANCO, dataFim: null }]);
    const [ev] = await listarEventosDoLead("7");
    expect(ev!.dataFimISO).toBeNull();
  });

  it("agrupa os documentos do evento e conta quantos são", async () => {
    payloadFalso(
      [EVENTO_NO_BANCO],
      [
        { id: 90, filename: "contrato.pdf", descricao: "Contrato/empenho", url: "/x/contrato.pdf", filesize: 2048, createdAt: "2026-09-16T12:00:00.000Z", evento: 12 },
        { id: 91, filename: "lista.xlsx", descricao: null, url: "/x/lista.xlsx", filesize: null, createdAt: "2026-09-17T12:00:00.000Z", evento: 99 },
      ],
    );
    const [ev] = await listarEventosDoLead("7");
    expect(ev!.numDocumentos).toBe(1);
    expect(ev!.documentos[0]).toMatchObject({ id: "90", nome: "contrato.pdf", tamanho: 2048 });
  });

  it("sem eventos, não vai atrás de documentos", async () => {
    const { find } = payloadFalso([]);
    expect(await listarEventosDoLead("7")).toEqual([]);
    expect(find).toHaveBeenCalledTimes(1);
  });
});
