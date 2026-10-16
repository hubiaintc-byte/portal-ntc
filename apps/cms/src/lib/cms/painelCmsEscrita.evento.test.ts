import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const update = vi.fn();
const findByID = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, findByID }),
}));

import { criarEventoEmBrancoCms, salvarCamposEvento, type CamposEventoCompletos } from "./painelCmsEscrita";
import { ehSlugProvisorio } from "./slugEvento";

const campos: CamposEventoCompletos = {
  nome: "Seminário de Gestão Escolar",
  slug: "novo-evento-abc",
  dataInicio: "",
  dataFim: "",
  resumo: "",
  modalidade: "",
  cargaHoraria: "",
  valor: "",
  linkInscricaoExterna: "",
  localNome: "",
  localEndereco: "",
  localCidade: "",
  localEstado: "",
  replayDisponivel: false,
  prazoReplay: "",
  publicoAlvoTexto: "",
  objetivosTexto: "",
  conteudoProgramaticoTexto: "",
  programacaoDetalhada: [],
  diferenciais: [],
  faq: [],
};

beforeEach(() => {
  create.mockReset();
  update.mockReset();
  findByID.mockReset();
});

describe("criarEventoEmBrancoCms", () => {
  it("cria rascunho com nome e slug provisórios e devolve o id", async () => {
    create.mockResolvedValue({ id: 31 });
    const r = await criarEventoEmBrancoCms();
    expect(r).toEqual({ ok: true, id: "31" });
    const enviado = create.mock.calls[0]![0];
    expect(enviado.collection).toBe("eventos");
    expect(enviado.draft).toBe(true);
    expect(enviado.data.nome).toBe("Novo evento");
    expect(ehSlugProvisorio(enviado.data.slug)).toBe(true);
  });

  it("devolve o erro quando a criação falha", async () => {
    create.mockRejectedValue(new Error("falhou"));
    expect(await criarEventoEmBrancoCms()).toEqual({ ok: false, erro: "falhou" });
  });
});

describe("salvarCamposEvento (slug)", () => {
  it("lê o slug atual e grava o slug derivado do nome quando era provisório", async () => {
    findByID.mockResolvedValue({ slug: "novo-evento-abc" });
    update.mockResolvedValue({});
    const r = await salvarCamposEvento("9", campos);
    expect(r).toEqual({ ok: true });
    expect(findByID.mock.calls[0]![0]).toMatchObject({ collection: "eventos", id: "9", draft: true, depth: 0 });
    expect(update.mock.calls[0]![0].data.slug).toBe("seminario-de-gestao-escolar");
  });

  it("traduz violação de unicidade do slug", async () => {
    findByID.mockResolvedValue({ slug: "novo-evento-abc" });
    update.mockRejectedValue(new Error('duplicate key value violates unique constraint "eventos_slug_idx"'));
    expect(await salvarCamposEvento("9", campos)).toEqual({
      ok: false,
      erro: "Já existe um evento com este endereço (slug).",
    });
  });
});
