import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Mesmo padrão de painelCrmEscrita.versao.test.ts: a Local API é mockada por
 * completo, então a regra é exercitada sem banco.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarOportunidade, atualizarOportunidade } = await import("./painelCrmEscrita");

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
  obterPayloadMock.mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      criados.push(data);
      return { id: 1, ...data };
    }),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      atualizados.push(data);
      return { id: 1, ...data };
    }),
  });
  return { criados, atualizados };
}

afterEach(() => vi.clearAllMocks());

describe("escrita da oportunidade — estágio e situação", () => {
  it("persiste estágio e situação ao criar", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarOportunidade(dadosBase);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ estagio: "demanda-identificada", situacao: "ativa" });
  });

  it("aplica os defaults do funil quando o formulário vem vazio", async () => {
    const { criados } = montarPayloadFalso();
    await criarOportunidade({ ...dadosBase, estagio: "", situacao: "" });
    expect(criados[0]).toMatchObject({ estagio: "mapeada", situacao: "ativa" });
  });

  it("persiste estágio e situação ao atualizar", async () => {
    const { atualizados } = montarPayloadFalso();
    await atualizarOportunidade("7", { ...dadosBase, estagio: "ganha", situacao: "ativa" });
    expect(atualizados[0]).toMatchObject({ estagio: "ganha", situacao: "ativa" });
  });

  it("recusa a gravação sem cliente, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarOportunidade({ ...dadosBase, cliente: "" });
    expect(r).toEqual({ ok: false, erro: "Selecione o cliente." });
  });
});
