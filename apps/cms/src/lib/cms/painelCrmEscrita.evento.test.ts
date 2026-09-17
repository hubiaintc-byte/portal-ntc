import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const registrarNaLinhaDoTempoMock = vi.fn(async () => undefined);
const entradasDoDocumentoMock = vi.fn(
  (p: {
    operation: "create" | "delete";
    doc: { filename?: string | null };
    clienteId: number | null;
    leadId?: number | null;
    usuarioId: number | null;
  }) => {
    if (p.clienteId === null) return [];
    const verbo = p.operation === "create" ? "anexado" : "removido";
    return [
      {
        clienteId: p.clienteId,
        leadId: p.leadId ?? null,
        tipo: "documento",
        titulo: `Documento ${verbo} · ${p.doc.filename ?? ""}`,
        usuarioId: p.usuarioId,
      },
    ];
  },
);
vi.mock("@/lib/crm/linhaDoTempo", () => ({
  registrarNaLinhaDoTempo: registrarNaLinhaDoTempoMock,
  entradasDoDocumento: entradasDoDocumentoMock,
}));

const {
  agendarEvento,
  apagarCliente,
  apagarLead,
  cancelarEvento,
  marcarEventoRealizado,
  registrarContratoEmpenho,
  removerDocumentoEvento,
  salvarLinksInscricao,
  subirDocumentoEvento,
} = await import("./painelCrmEscrita");

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

function payloadFalso() {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 101, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const findByID = vi.fn();
  const deleteMock = vi.fn(async () => ({ id: 1 }));
  const count = vi.fn(async () => ({ totalDocs: 0 }));
  const payload = { create, update, findByID, delete: deleteMock, count };
  obterPayloadMock.mockResolvedValue(payload);
  return { payload, create, update, findByID, delete: deleteMock, count };
}

function arquivoFalso(tamanho: number, tipo: string, nome = "arquivo.pdf"): File {
  return {
    size: tamanho,
    type: tipo,
    name: nome,
    arrayBuffer: async () => new ArrayBuffer(8),
  } as unknown as File;
}

const dadosEventoBase = {
  titulo: "Curso de Gestão Escolar",
  dataInicio: "2026-10-01",
  dataFim: "",
  modalidade: "presencial",
  local: "Auditório central",
  moduloCatalogo: "",
  observacoes: "",
};

afterEach(() => vi.clearAllMocks());

describe("agendarEvento", () => {
  it("cria o evento com o cliente do lead e move o lead para evento-agendado", async () => {
    const { create, update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 7, cliente: 3 });

    const resultado = await agendarEvento("7", dadosEventoBase, usuario);

    expect(resultado).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "eventos-comerciais",
        data: expect.objectContaining({
          lead: 7,
          cliente: 3,
          titulo: "Curso de Gestão Escolar",
          dataInicio: "2026-10-01",
          status: "agendado",
        }),
        req: expect.objectContaining({ user: usuario }),
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        id: "7",
        data: { estagio: "evento-agendado" },
        req: expect.objectContaining({ user: usuario }),
      }),
    );
  });

  it("recusa quando o lead não tem cliente vinculado, sem criar o evento", async () => {
    const { create, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 7, cliente: null });

    const resultado = await agendarEvento("7", dadosEventoBase, usuario);

    expect(resultado).toEqual({ ok: false, erro: "Lead sem cliente vinculado." });
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa evento sem título, sem tocar o banco", async () => {
    const { findByID } = payloadFalso();
    const resultado = await agendarEvento("7", { ...dadosEventoBase, titulo: "  " }, usuario);
    expect(resultado).toEqual({ ok: false, erro: "Informe o título do evento." });
    expect(findByID).not.toHaveBeenCalled();
  });
});

describe("registrarContratoEmpenho", () => {
  const dados = { tipo: "contrato", numero: "123/2026", data: "2026-10-05", valor: "15000" };

  it("sem arquivo, só atualiza o grupo contratoEmpenho (preservando o arquivo anterior) e move o lead", async () => {
    const { create, update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 9, lead: 7, cliente: 3, contratoEmpenho: { arquivo: 55 } });

    const resultado = await registrarContratoEmpenho("9", dados, null, usuario);

    expect(resultado).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: "eventos-comerciais",
        id: "9",
        data: { contratoEmpenho: { tipo: "contrato", numero: "123/2026", data: "2026-10-05", valor: 15000, arquivo: 55 } },
        req: expect.objectContaining({ user: usuario }),
      }),
    );
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: "leads",
        id: "7",
        data: { estagio: "contrato-recebido" },
        req: expect.objectContaining({ user: usuario }),
      }),
    );
  });

  it("com arquivo, cria o documento em documentos-comerciais e referencia no grupo", async () => {
    const { create, update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 9, lead: 7, cliente: 3, contratoEmpenho: {} });

    const resultado = await registrarContratoEmpenho("9", dados, arquivoFalso(1000, "application/pdf", "empenho.pdf"), usuario);

    expect(resultado).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "documentos-comerciais",
        data: expect.objectContaining({ evento: 9, descricao: "Contrato/empenho" }),
      }),
    );
    const chamadaEvento = update.mock.calls[0]![0] as { data: { contratoEmpenho: { arquivo: number } } };
    expect(chamadaEvento.data.contratoEmpenho.arquivo).toBe(101);
  });

  it("recusa arquivo maior que 20 MB antes de abrir a transação", async () => {
    const { create, findByID } = payloadFalso();
    const resultado = await registrarContratoEmpenho("9", dados, arquivoFalso(21 * 1024 * 1024, "application/pdf"), usuario);
    expect(resultado).toEqual({ ok: false, erro: "Arquivo maior que 20 MB." });
    expect(findByID).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("sem lead vinculado ao evento, não move nenhum lead", async () => {
    const { update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 9, lead: null, cliente: 3, contratoEmpenho: {} });

    const resultado = await registrarContratoEmpenho("9", dados, null, usuario);

    expect(resultado).toEqual({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("salvarLinksInscricao", () => {
  it("recusa URL inválida e não chama update", async () => {
    const { update } = payloadFalso();
    const resultado = await salvarLinksInscricao("9", [{ rotulo: "Inscrição", url: "não é url" }], usuario);
    expect(resultado).toEqual({ ok: false, erro: "Link inválido: não é url" });
    expect(update).not.toHaveBeenCalled();
  });

  it("salva os links válidos", async () => {
    const { update } = payloadFalso();
    const resultado = await salvarLinksInscricao(
      "9",
      [{ rotulo: "Inscrição", url: "https://forms.example.com/x" }],
      usuario,
    );
    expect(resultado).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "eventos-comerciais",
        id: "9",
        data: { linksInscricao: [{ rotulo: "Inscrição", url: "https://forms.example.com/x" }] },
        user: usuario,
      }),
    );
  });
});

describe("marcarEventoRealizado", () => {
  it("marca o evento como realizado e move o lead para evento-realizado", async () => {
    const { update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 9, lead: 7 });

    const resultado = await marcarEventoRealizado("9", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ collection: "eventos-comerciais", id: "9", data: { status: "realizado" } }),
    );
    expect(update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: "leads", id: "7", data: { estagio: "evento-realizado" } }),
    );
  });

  it("sem lead vinculado, só atualiza o evento", async () => {
    const { update, findByID } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 9, lead: null });

    const resultado = await marcarEventoRealizado("9", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("cancelarEvento", () => {
  it("cancela o evento sem tocar o lead", async () => {
    const { update } = payloadFalso();
    const resultado = await cancelarEvento("9", usuario);
    expect(resultado).toEqual({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "eventos-comerciais", id: "9", data: { status: "cancelado" }, user: usuario }),
    );
  });
});

describe("subirDocumentoEvento", () => {
  it("recusa arquivo maior que 20 MB", async () => {
    const { create } = payloadFalso();
    const resultado = await subirDocumentoEvento("9", arquivoFalso(21 * 1024 * 1024, "application/pdf"), "Ata", usuario);
    expect(resultado).toEqual({ ok: false, erro: "Arquivo maior que 20 MB." });
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa tipo de arquivo fora da lista", async () => {
    const { create } = payloadFalso();
    const resultado = await subirDocumentoEvento("9", arquivoFalso(1000, "application/zip"), "Ata", usuario);
    expect(resultado).toEqual({ ok: false, erro: "Tipo de arquivo não permitido." });
    expect(create).not.toHaveBeenCalled();
  });

  it("cria o documento vinculado ao evento com a descrição informada", async () => {
    const { create } = payloadFalso();
    const resultado = await subirDocumentoEvento("9", arquivoFalso(1000, "application/pdf"), "Ata da reunião", usuario);
    expect(resultado).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "documentos-comerciais",
        data: expect.objectContaining({ evento: 9, descricao: "Ata da reunião" }),
        user: usuario,
      }),
    );
  });
});

describe("removerDocumentoEvento", () => {
  it("registra 'Documento removido' na linha do tempo do cliente do evento e apaga o documento", async () => {
    const { findByID, delete: del } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 55, evento: 9, filename: "contrato.pdf" });
    findByID.mockResolvedValueOnce({ id: 9, cliente: 3, lead: 7 });

    const resultado = await removerDocumentoEvento("55", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(registrarNaLinhaDoTempoMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ clienteId: 3, leadId: 7, titulo: "Documento removido · contrato.pdf" }),
    );
    expect(del).toHaveBeenCalledWith(expect.objectContaining({ collection: "documentos-comerciais", id: "55" }));
  });

  it("sem evento vinculado, apaga sem gravar item na linha do tempo", async () => {
    const { findByID, delete: del } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 55, evento: null, filename: "solto.pdf" });

    const resultado = await removerDocumentoEvento("55", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(registrarNaLinhaDoTempoMock).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith(expect.objectContaining({ collection: "documentos-comerciais", id: "55" }));
  });
});

describe("apagarLead", () => {
  it("exige confirmação do nome quando há eventos/propostas/envios, e recusa nome errado", async () => {
    const { findByID, count, delete: del, update } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 7, nome: "Bruno Silva", instituicao: "SME", estagio: "em-contato", cliente: 3 });
    count
      .mockResolvedValueOnce({ totalDocs: 1 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 });

    const resultado = await apagarLead("7", "Nome Errado", usuario);

    expect(resultado).toEqual({ ok: false, erro: "Digite o nome do contato para confirmar." });
    expect(del).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("com o nome confirmado, desvincula os dependentes, registra a linha do tempo e apaga o lead", async () => {
    const { findByID, count, delete: del, update } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 7, nome: "Bruno Silva", instituicao: "SME", estagio: "em-contato", cliente: 3 });
    count
      .mockResolvedValueOnce({ totalDocs: 1 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 });

    const resultado = await apagarLead("7", " bruno silva ", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(registrarNaLinhaDoTempoMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ clienteId: 3, leadId: null, tipo: "lead", titulo: expect.stringContaining("Lead apagado") }),
    );
    const colecoesDesvinculadas = update.mock.calls.map((c) => (c[0] as unknown as { collection: string }).collection);
    expect(colecoesDesvinculadas).toEqual(
      expect.arrayContaining(["eventos-comerciais", "propostas", "envios-email", "linha-do-tempo"]),
    );
    for (const chamada of update.mock.calls) {
      const args = chamada[0] as unknown as { where: unknown; data: unknown };
      expect(args.where).toEqual({ lead: { equals: "7" } });
      expect(args.data).toEqual({ lead: null });
    }
    expect(del).toHaveBeenCalledWith(expect.objectContaining({ collection: "leads", id: "7" }));
  });

  it("sem dependentes, não exige confirmação e apaga sem item na linha do tempo se o lead não tem cliente", async () => {
    const { findByID, count, delete: del } = payloadFalso();
    findByID.mockResolvedValueOnce({ id: 7, nome: "Bruno Silva", instituicao: null, estagio: "lead", cliente: null });
    count.mockResolvedValue({ totalDocs: 0 });

    const resultado = await apagarLead("7", "", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(registrarNaLinhaDoTempoMock).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith(expect.objectContaining({ collection: "leads", id: "7" }));
  });
});

describe("apagarCliente", () => {
  it("recusa apagar cliente com leads ou eventos vinculados", async () => {
    const { count, delete: del } = payloadFalso();
    count.mockResolvedValueOnce({ totalDocs: 2 }).mockResolvedValueOnce({ totalDocs: 0 });

    const resultado = await apagarCliente("3", usuario);

    expect(resultado.ok).toBe(false);
    expect(del).not.toHaveBeenCalled();
  });

  it("sem dependentes, apaga a linha do tempo do cliente e o cliente", async () => {
    const { count, delete: del } = payloadFalso();
    count.mockResolvedValueOnce({ totalDocs: 0 }).mockResolvedValueOnce({ totalDocs: 0 });

    const resultado = await apagarCliente("3", usuario);

    expect(resultado).toEqual({ ok: true });
    expect(del).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ collection: "linha-do-tempo", where: { cliente: { equals: "3" } } }),
    );
    expect(del).toHaveBeenNthCalledWith(2, expect.objectContaining({ collection: "clientes-crm", id: "3" }));
  });
});
