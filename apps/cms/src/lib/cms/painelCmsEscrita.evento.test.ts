import { ValidationError } from "payload";
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const update = vi.fn();
const findByID = vi.fn();
const find = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, findByID, find }),
}));

import {
  criarEventoEmBrancoCms,
  publicarEvento,
  salvarCamposEvento,
  type CamposEventoCompletos,
} from "./painelCmsEscrita";

/** O que o adapter drizzle 3.90 lança numa violação de unicidade (23505). */
const slugDuplicado = () =>
  new ValidationError({ collection: "eventos", errors: [{ message: "Value must be unique", path: "slug" }] });
const ERRO_SLUG = "Já existe um evento com este endereço (slug).";
import { ehSlugProvisorio } from "./slugEvento";

const campos: CamposEventoCompletos = {
  nome: "Seminário de Gestão Escolar",
  slug: "novo-evento-rascunho-abc",
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
  find.mockReset();
  find.mockResolvedValue({ docs: [] });
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
    findByID.mockResolvedValue({ slug: "novo-evento-rascunho-abc" });
    update.mockResolvedValue({});
    const r = await salvarCamposEvento("9", campos);
    expect(r).toEqual({ ok: true });
    expect(findByID.mock.calls[0]![0]).toMatchObject({ collection: "eventos", id: "9", draft: true, depth: 0 });
    expect(update.mock.calls[0]![0].data.slug).toBe("seminario-de-gestao-escolar");
  });

  it("confere antes de salvar se outro evento (inclusive rascunho) já usa o slug", async () => {
    findByID.mockResolvedValue({ slug: "novo-evento-rascunho-abc" });
    find.mockResolvedValue({ docs: [{ id: 4 }] });
    expect(await salvarCamposEvento("9", campos)).toEqual({ ok: false, erro: ERRO_SLUG });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "eventos",
        where: { and: [{ slug: { equals: "seminario-de-gestao-escolar" } }, { id: { not_equals: "9" } }] },
        draft: true,
        limit: 1,
        depth: 0,
      }),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("traduz a ValidationError de unicidade do slug lançada pelo Payload", async () => {
    findByID.mockResolvedValue({ slug: "novo-evento-rascunho-abc" });
    update.mockRejectedValue(slugDuplicado());
    expect(await salvarCamposEvento("9", campos)).toEqual({ ok: false, erro: ERRO_SLUG });
  });
});

describe("publicarEvento", () => {
  it("traduz a colisão de slug que só aparece ao publicar", async () => {
    update.mockRejectedValue(slugDuplicado());
    expect(await publicarEvento("9")).toEqual({ ok: false, erro: ERRO_SLUG });
  });

  it("outros erros seguem com a mensagem original", async () => {
    update.mockRejectedValue(new Error("falhou"));
    expect(await publicarEvento("9")).toEqual({ ok: false, erro: "falhou" });
  });
});
