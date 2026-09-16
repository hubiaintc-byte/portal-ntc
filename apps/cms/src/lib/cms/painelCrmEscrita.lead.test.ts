import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { adicionarNota, criarLeadManual, marcarLeadPerdido, moverLead } = await import("./painelCrmEscrita");

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

function payloadFalso() {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  obterPayloadMock.mockResolvedValue({ create, update });
  return { create, update };
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

  it("grava item tipo nota na linha do tempo, com lead opcional", async () => {
    const { create } = payloadFalso();
    expect(await adicionarNota("3", "7", "Liguei, pediu retorno em março", usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "linha-do-tempo",
        user: usuario,
        data: expect.objectContaining({ cliente: 3, lead: 7, tipo: "nota", titulo: "Nota", detalhe: "Liguei, pediu retorno em março", usuario: 5 }),
      }),
    );
  });
});

describe("criarLeadManual", () => {
  const dados = {
    nome: "Bruno", email: "b@x.gov.br", telefone: "", cargo: "", instituicao: "SME", esfera: "municipal",
    programa: "", modalidade: "", participantesEstimados: "40", mensagem: "", cliente: "3", responsavel: "5",
    valorEstimado: "12000", dataPrevistaEvento: "", observacoes: "",
  };

  it("exige nome, e-mail e cliente", async () => {
    payloadFalso();
    expect(await criarLeadManual({ ...dados, nome: "" }, usuario)).toEqual({ ok: false, erro: "Informe o nome do contato." });
    expect(await criarLeadManual({ ...dados, email: "" }, usuario)).toEqual({ ok: false, erro: "Informe o e-mail do contato." });
    expect(await criarLeadManual({ ...dados, cliente: "" }, usuario)).toEqual({ ok: false, erro: "Selecione o cliente." });
  });

  it("grava tipo proposta, origem manual, estágio lead e vínculo manual", async () => {
    const { create } = payloadFalso();
    expect(await criarLeadManual(dados, usuario)).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        user: usuario,
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
