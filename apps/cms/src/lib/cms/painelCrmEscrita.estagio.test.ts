import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Mesmo padrão de painelCrmEscrita.versao.test.ts: a Local API é mockada por
 * completo, então a regra é exercitada sem banco.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarOportunidade, atualizarOportunidade } = await import("./painelCrmEscrita");
const { ErroGateQualificada } = await import("@/lib/crm/gateQualificada");

type UsuarioAutenticado = Parameters<typeof criarOportunidade>[1];

/** Sessão do painel: é este objeto que precisa chegar à Local API em `user`. */
const usuarioFalso: NonNullable<UsuarioAutenticado> = {
  id: 5,
  collection: "users",
  nome: "Ana Diretora",
  perfil: "super-admin",
  email: "ana@institutontc.com.br",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const dadosBase = {
  cliente: "3",
  programa: "2",
  modulos: [],
  eventos: [],
  uf: "SP",
  origem: "indicacao",
  quantidade: "80",
  modalidade: "Online",
  valor: "104400",
  probabilidade: "70",
  estagio: "demanda-identificada",
  situacao: "ativa",
  dataAbertura: "2026-09-01",
  dataPrevFechamento: "",
  proximaAcao: "Enviar proposta",
  followup: "2026-09-10",
  responsavel: "1",
  observacoes: "",
};

function montarPayloadFalso() {
  const criados: Record<string, unknown>[] = [];
  const atualizados: Record<string, unknown>[] = [];
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    criados.push(data);
    return { id: 1, ...data };
  });
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    atualizados.push(data);
    return { id: 1, ...data };
  });
  obterPayloadMock.mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create,
    update,
  });
  return { criados, atualizados, create, update };
}

afterEach(() => vi.clearAllMocks());

describe("escrita da oportunidade — estágio e situação", () => {
  it("persiste estágio e situação ao criar", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarOportunidade(dadosBase, null);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ estagio: "demanda-identificada", situacao: "ativa" });
  });

  it("aplica os defaults do funil quando o formulário vem vazio", async () => {
    const { criados } = montarPayloadFalso();
    await criarOportunidade({ ...dadosBase, estagio: "", situacao: "" }, null);
    expect(criados[0]).toMatchObject({ estagio: "mapeada", situacao: "ativa" });
  });

  it("persiste estágio e situação ao atualizar", async () => {
    const { atualizados } = montarPayloadFalso();
    await atualizarOportunidade("7", { ...dadosBase, estagio: "ganha", situacao: "ativa" }, null);
    expect(atualizados[0]).toMatchObject({ estagio: "ganha", situacao: "ativa" });
  });

  it("recusa a gravação sem cliente, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarOportunidade({ ...dadosBase, cliente: "" }, null);
    expect(r).toEqual({ ok: false, erro: "Selecione o cliente." });
  });
});

describe("escrita da oportunidade — campos obrigatórios", () => {
  // Programa, UF, origem, data de abertura e responsável passaram a ser
  // obrigatórios (decisão do PO · Manual NTC-COM-CRM-01). A recusa é da camada
  // de escrita: nem o `required` do HTML nem a validação do Payload cobrem uma
  // Server Action chamada direto.
  it("recusa a criação sem programa, antes de tocar a Local API", async () => {
    const { create } = montarPayloadFalso();
    const r = await criarOportunidade({ ...dadosBase, programa: "" }, null);
    expect(r).toEqual({ ok: false, erro: "Selecione o programa." });
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa a criação sem responsável, antes de tocar a Local API", async () => {
    const { create } = montarPayloadFalso();
    const r = await criarOportunidade({ ...dadosBase, responsavel: "" }, null);
    expect(r).toEqual({ ok: false, erro: "Selecione o responsável comercial." });
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa a atualização sem data de abertura, antes de tocar a Local API", async () => {
    const { update } = montarPayloadFalso();
    const r = await atualizarOportunidade("7", { ...dadosBase, dataAbertura: "" }, null);
    expect(r).toEqual({ ok: false, erro: "Informe a data de abertura." });
    expect(update).not.toHaveBeenCalled();
  });

  it("grava os cinco obrigatórios quando todos vêm preenchidos", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarOportunidade(dadosBase, null);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({
      programa: 2,
      uf: "SP",
      origem: "indicacao",
      dataAbertura: "2026-09-01",
      responsavel: 1,
    });
  });
});

describe("escrita da oportunidade — autoria da transição de estágio", () => {
  // O hook `registrarTransicaoEstagio` da coleção lê `req.user`, que a Local
  // API só popula quando a chamada passa `user`. Sem isso o histórico do funil
  // sai todo com ator "sistema", nunca com quem mudou o estágio.
  it("repassa o usuário da sessão à Local API ao criar", async () => {
    const { create } = montarPayloadFalso();
    await criarOportunidade(dadosBase, usuarioFalso);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ user: usuarioFalso }));
  });

  it("repassa o usuário da sessão à Local API ao atualizar", async () => {
    const { update } = montarPayloadFalso();
    await atualizarOportunidade("7", dadosBase, usuarioFalso);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: "7", user: usuarioFalso }));
  });
});

describe("escrita da oportunidade — gate do estágio Qualificada (Sessão H3)", () => {
  // O hook `bloquearQualificadaSemAvaliacao` da coleção lança `ErroGateQualificada`
  // com a mensagem contratual do manual §18. A camada de escrita precisa
  // repassar essa mensagem íntegra ao painel — não o ERRO_GENERICO, que
  // esconderia justamente o que o usuário precisa ler para corrigir.
  const mensagemDoGate = "Estágio Qualificada bloqueado: não há avaliação vigente.";

  it("repassa a mensagem do gate quando a Local API recusa ao criar", async () => {
    montarPayloadFalso();
    obterPayloadMock.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockRejectedValue(new ErroGateQualificada(mensagemDoGate)),
      update: vi.fn(),
    });
    const r = await criarOportunidade({ ...dadosBase, estagio: "qualificada" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: mensagemDoGate });
  });

  it("repassa a mensagem do gate quando a Local API recusa ao atualizar", async () => {
    montarPayloadFalso();
    obterPayloadMock.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(new ErroGateQualificada(mensagemDoGate)),
    });
    const r = await atualizarOportunidade(
      "7",
      { ...dadosBase, estagio: "qualificada" },
      usuarioFalso,
    );
    expect(r).toEqual({ ok: false, erro: mensagemDoGate });
  });
});
