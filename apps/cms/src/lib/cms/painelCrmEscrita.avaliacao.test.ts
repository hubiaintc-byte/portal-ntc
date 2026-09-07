import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Mesmo padrão de painelCrmEscrita.estagio.test.ts: a Local API é mockada por
 * completo, então a regra é exercitada sem banco.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarAvaliacao } = await import("./painelCrmEscrita");

type UsuarioAutenticado = Parameters<typeof criarAvaliacao>[1];

/** Sessão do painel: é este objeto que precisa chegar à Local API em `user`. */
const usuarioFalso: NonNullable<UsuarioAutenticado> = {
  id: 4,
  collection: "users",
  nome: "Ana Diretora",
  perfil: "super-admin",
  email: "contato@institutontc.com.br",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const dadosBase = {
  oportunidade: "7",
  statusAvaliacao: "em-preenchimento",
  avaliador: "4",
  owner: "4",
  notaNecessidade: "3",
  notaAderencia: "3",
  notaPrioridade: "2",
  notaTiming: "2",
  notaCaminho: "2",
  notaStakeholders: "2",
  notaOrcamento: "2",
  notaRisco: "2",
  notaValor: "3",
  hgAderencia: "nao",
  hgJuridico: "nao",
  hgCondicao: "nao",
  hgIncapacidade: "nao",
  hgDemanda: "nao",
  hgRequisito: "nao",
  hgIntegridade: "nao",
  resultado: "qualificada",
  justificativa: "Demanda confirmada em reunião.",
  proximoPasso: "Enviar proposta.",
  vigente: true,
  observacoes: "",
};

function montarPayloadFalso() {
  const criados: Record<string, unknown>[] = [];
  const opcoes: Record<string, unknown>[] = [];
  obterPayloadMock.mockResolvedValue({
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      criados.push(args.data);
      opcoes.push(args as unknown as Record<string, unknown>);
      return { id: 1, ...args.data };
    }),
    update: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockResolvedValue({ docs: [] }),
  });
  return { criados, opcoes };
}

afterEach(() => vi.clearAllMocks());

describe("criarAvaliacao", () => {
  it("converte as notas de texto para número inteiro", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarAvaliacao(dadosBase, usuarioFalso);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ notaNecessidade: 3, notaRisco: 2, oportunidade: 7 });
  });

  it("propaga o usuário da sessão para a Local API", async () => {
    const { opcoes } = montarPayloadFalso();
    await criarAvaliacao(dadosBase, usuarioFalso);
    expect(opcoes[0]).toMatchObject({ user: usuarioFalso });
  });

  it("recusa sem oportunidade, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarAvaliacao({ ...dadosBase, oportunidade: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione a oportunidade." });
  });

  it("recusa nota fora da faixa com mensagem específica", async () => {
    montarPayloadFalso();
    const r = await criarAvaliacao({ ...dadosBase, notaTiming: "4" }, usuarioFalso);
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("0, 1, 2 ou 3");
  });

  // Manual §13/§19: uma avaliação "em preenchimento" pode ser salva parcial e
  // retomada depois — mesma tolerância de notasCompletas()/calcularScore()
  // (@ntc/lib) e do hook beforeChange da coleção, que já convive com
  // scoreTotal: null nesse estado.
  it("aceita notas vazias quando a avaliação está em preenchimento", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarAvaliacao(
      { ...dadosBase, statusAvaliacao: "em-preenchimento", notaTiming: "", notaCaminho: "" },
      usuarioFalso,
    );
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({
      notaTiming: null,
      notaCaminho: null,
      notaNecessidade: 3,
    });
  });

  it("recusa nota vazia quando a avaliação é salva como concluída", async () => {
    montarPayloadFalso();
    const r = await criarAvaliacao(
      { ...dadosBase, statusAvaliacao: "concluida", notaTiming: "" },
      usuarioFalso,
    );
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("0, 1, 2 ou 3");
  });
});
