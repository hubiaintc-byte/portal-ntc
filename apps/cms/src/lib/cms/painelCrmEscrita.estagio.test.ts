import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Mesmo padrão de painelCrmEscrita.versao.test.ts: a Local API é mockada por
 * completo, então a regra é exercitada sem banco.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarOportunidade, atualizarOportunidade } = await import("./painelCrmEscrita");

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
