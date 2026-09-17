import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const { adicionarNota, atualizarLeadCrm, criarLeadManual, marcarLeadPerdido, moverLead } = await import("./painelCrmEscrita");

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

function payloadFalso(leadNoBanco: Record<string, unknown> = { id: 7, cliente: 3 }) {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  const findByID = vi.fn(async () => leadNoBanco);
  obterPayloadMock.mockResolvedValue({ create, update, findByID });
  return { create, update, findByID };
}

afterEach(() => vi.clearAllMocks());

describe("moverLead", () => {
  it("recusa estágio fora da lista sem tocar o banco", async () => {
    const { update } = payloadFalso();
    expect(await moverLead("7", "ganha", usuario)).toEqual({ ok: false, erro: "Estágio inválido." });
    expect(update).not.toHaveBeenCalled();
  });

  it("grava o estágio com o usuário da sessão", async () => {
    const { update } = payloadFalso();
    expect(await moverLead("7", "em-contato", usuario)).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "leads", id: "7", data: { estagio: "em-contato" }, user: usuario }),
    );
  });
});

describe("marcarLeadPerdido", () => {
  it("exige motivo válido", async () => {
    payloadFalso();
    expect(await marcarLeadPerdido("7", "", "", usuario)).toEqual({ ok: false, erro: "Informe o motivo da perda." });
  });

  it("grava perdido, motivo, detalhe e data", async () => {
    const { update } = payloadFalso();
    await marcarLeadPerdido("7", "sem-resposta", "3 tentativas", usuario);
    const chamada = update.mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(chamada.data).toMatchObject({ perdido: true, motivoPerda: "sem-resposta", detalhePerda: "3 tentativas" });
    expect(typeof chamada.data.perdidoEm).toBe("string");
  });
});

describe("adicionarNota", () => {
  it("recusa nota vazia", async () => {
    const { create } = payloadFalso();
    expect(await adicionarNota("3", null, "   ", usuario)).toEqual({ ok: false, erro: "Escreva a nota." });
    expect(create).not.toHaveBeenCalled();
  });

  it("sem lead, grava a nota no cliente informado sem consultar o lead", async () => {
    const { create, findByID } = payloadFalso();
    expect(await adicionarNota("3", null, "Reunião marcada", usuario)).toEqual({ ok: true });
    expect(findByID).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "linha-do-tempo",
        user: usuario,
        data: expect.objectContaining({ cliente: 3, lead: null, tipo: "nota", titulo: "Nota", detalhe: "Reunião marcada", usuario: 5 }),
      }),
    );
  });

  it("com lead, deriva o cliente do lead no banco e ignora o clienteId passado", async () => {
    const { create, findByID } = payloadFalso({ id: 7, cliente: 3 });
    expect(await adicionarNota("99", "7", "Liguei, pediu retorno em março", usuario)).toEqual({ ok: true });
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: "leads", id: 7, depth: 0 }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "linha-do-tempo",
        user: usuario,
        data: expect.objectContaining({ cliente: 3, lead: 7, tipo: "nota", titulo: "Nota", detalhe: "Liguei, pediu retorno em março", usuario: 5 }),
      }),
    );
  });

  it("com lead populado (objeto), usa o id do cliente do objeto", async () => {
    const { create } = payloadFalso({ id: 7, cliente: { id: 4, orgao: "SME" } });
    expect(await adicionarNota("99", "7", "Nota", usuario)).toEqual({ ok: true });
    const chamada = create.mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(chamada.data.cliente).toBe(4);
  });

  it("recusa lead sem cliente vinculado", async () => {
    const { create } = payloadFalso({ id: 7, cliente: null });
    expect(await adicionarNota("3", "7", "Nota", usuario)).toEqual({ ok: false, erro: "Lead sem cliente vinculado." });
    expect(create).not.toHaveBeenCalled();
  });

  it("sem lead, recusa cliente inválido", async () => {
    const { create } = payloadFalso();
    expect(await adicionarNota("", null, "Nota", usuario)).toEqual({ ok: false, erro: "Cliente inválido." });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("criarLeadManual", () => {
  const dados = {
    nome: "Bruno", email: "b@x.gov.br", telefone: "", cargo: "", instituicao: "SME", esfera: "municipal",
    programa: "", modalidade: "", participantesEstimados: "40", mensagem: "", cliente: "3", responsavel: "5",
    valorEstimado: "12000", dataPrevistaEvento: "", observacoes: "", novoClienteOrgao: "",
  };

  it("exige nome, e-mail e cliente (ou o órgão de um cliente novo)", async () => {
    const { create } = payloadFalso();
    expect(await criarLeadManual({ ...dados, nome: "" }, usuario)).toEqual({ ok: false, erro: "Informe o nome do contato." });
    expect(await criarLeadManual({ ...dados, email: "" }, usuario)).toEqual({ ok: false, erro: "Informe o e-mail do contato." });
    expect(await criarLeadManual({ ...dados, cliente: "" }, usuario)).toEqual({
      ok: false,
      erro: "Selecione o cliente ou informe o órgão para criar um novo.",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("sem cliente selecionado, cria o cliente na hora e vincula o lead a ele", async () => {
    const { create } = payloadFalso();
    expect(await criarLeadManual({ ...dados, cliente: "", novoClienteOrgao: " Prefeitura X ", telefone: "11 9", cargo: "Secretário" }, usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      collection: "clientes-crm",
      req: expect.objectContaining({ user: usuario }),
      data: {
        orgao: "Prefeitura X",
        esfera: "municipal",
        origem: "manual",
        contatos: [{ nome: "Bruno", cargo: "Secretário", setor: null, email: "b@x.gov.br", whatsapp: "11 9", principal: true, decisor: false }],
      },
    }));
    expect(create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      collection: "leads",
      data: expect.objectContaining({ cliente: 1, clienteCasadoPor: "manual" }),
    }));
  });

  it("esfera do lead sem correspondente no CRM (privada) não vai para o cliente novo", async () => {
    const { create } = payloadFalso();
    await criarLeadManual({ ...dados, cliente: "", novoClienteOrgao: "ONG Y", esfera: "privada" }, usuario);
    const primeira = create.mock.calls[0]![0] as { collection: string; data: Record<string, unknown> };
    expect(primeira.collection).toBe("clientes-crm");
    expect(primeira.data.esfera).toBeNull();
  });

  it("atualizarLeadCrm não exige cliente (lead sem vínculo continua editável) e não toca o cliente", async () => {
    const { update } = payloadFalso();
    expect(await atualizarLeadCrm("7", { ...dados, cliente: "", novoClienteOrgao: "", telefone: "11 9" }, usuario)).toEqual({ ok: true });
    const chamada = update.mock.calls[0]![0] as { collection: string; id: string; data: Record<string, unknown> };
    expect(chamada.collection).toBe("leads");
    expect(chamada.id).toBe("7");
    expect(chamada.data.telefone).toBe("11 9");
    expect(chamada.data).not.toHaveProperty("cliente");
    expect(chamada.data).not.toHaveProperty("novoClienteOrgao");
  });

  it("atualizarLeadCrm ainda exige nome e e-mail", async () => {
    const { update } = payloadFalso();
    expect(await atualizarLeadCrm("7", { ...dados, nome: "" }, usuario)).toEqual({ ok: false, erro: "Informe o nome do contato." });
    expect(await atualizarLeadCrm("7", { ...dados, email: " " }, usuario)).toEqual({ ok: false, erro: "Informe o e-mail do contato." });
    expect(update).not.toHaveBeenCalled();
  });

  it("grava tipo proposta, origem manual, estágio lead e vínculo manual", async () => {
    const { create } = payloadFalso();
    expect(await criarLeadManual(dados, usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        req: expect.objectContaining({ user: usuario }),
        data: expect.objectContaining({
          tipo: "proposta", origemEntrada: "manual", estagio: "lead", perdido: false, cliente: 3, clienteCasadoPor: "manual",
          nome: "Bruno", email: "b@x.gov.br", instituicao: "SME", esfera: "municipal", responsavel: 5, valorEstimado: 12000,
          detalhesProposta: expect.objectContaining({ participantesEstimados: 40 }),
          consentimentoLgpd: { aceito: false },
        }),
      }),
    );
  });
});
