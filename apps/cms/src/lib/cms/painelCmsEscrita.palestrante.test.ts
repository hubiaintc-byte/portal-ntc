import { ValidationError } from "payload";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { aplicarCardDe, reordenarCards, type CardDesejado, type CardGlobal, TEXTOS_CARD_VAZIOS } from "./cardsCorpoDocente";
import { markdownParaLexical } from "@/lib/markdownLexical";

/**
 * Escrita do palestrante (coleção `especialistas`, gravada PUBLICADA) e do
 * card dele no Global `corpo-docente`, as duas na mesma transação.
 *
 * `executarEmTransacao` é trocado por uma versão que roda `fn(req)` direto e
 * registra commit/rollback — o que importa aqui é que a escrita do
 * especialista e a do Global usem o MESMO `req` e que uma falha no Global
 * reverta tudo.
 */
const create = vi.fn();
const update = vi.fn();
const findByID = vi.fn();
const findGlobal = vi.fn();
const updateGlobal = vi.fn();
const find = vi.fn();
const payloadFalso = { create, update, findByID, findGlobal, updateGlobal, find };
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => payloadFalso }));

const transacao = { commits: 0, rollbacks: 0 };
const REQ = { marca: "req-da-transacao" };
vi.mock("@/lib/crm/transacao", () => ({
  executarEmTransacao: async (_payload: unknown, _usuario: unknown, fn: (req: unknown) => Promise<unknown>) => {
    try {
      const r = await fn(REQ);
      transacao.commits++;
      return r;
    } catch (e) {
      transacao.rollbacks++;
      throw e;
    }
  },
}));

const { salvarPalestranteCms, salvarOrdemCorpoDocenteCms } = await import("./painelCmsEscrita");
type Campos = Parameters<typeof salvarPalestranteCms>[2];

const usuario = { id: 1, perfil: "super-admin" } as unknown as Parameters<typeof salvarPalestranteCms>[0];

const campos: Campos = {
  nome: "Ana Souza",
  titulacao: "doutorado",
  instituicao: "UnB",
  cargoAtual: "",
  curriculoCurtoMarkdown: "Professora **titular**.",
  curriculoCompletoMarkdown: "",
  linkLattes: "",
  linkLinkedin: "https://linkedin.com/in/ana",
  vertical: "educacao",
  tipo: "",
  frente: "",
  formacao: "doutorado",
  atuacao: ["universidade"],
  linhasAtuacaoIds: ["3", "7"],
  programasIds: ["11"],
  ocultarDoSite: false,
  corpoDocente: null,
};

const desejo: CardDesejado = {
  formato: "expert",
  textos: { ...TEXTOS_CARD_VAZIOS, tag: "Docente", credencialCard: "Doutora pela UnB." },
};

const ERRO_NOME_REPETIDO = "Já existe um palestrante com este nome. Diferencie o nome (ex.: inclua o sobrenome).";

const imagem = () => new File([new Uint8Array([1, 2, 3])], "ana.jpg", { type: "image/jpeg" });

const cardDe = (id: number, formato: CardGlobal["formato"] = "expert"): CardGlobal => ({
  formato,
  especialista: id,
  id: `c${id}`,
});

beforeEach(() => {
  vi.clearAllMocks();
  transacao.commits = 0;
  transacao.rollbacks = 0;
  create.mockImplementation(async (args: { collection: string }) =>
    args.collection === "media" ? { id: 90 } : { id: 42 },
  );
  update.mockResolvedValue({ id: 42 });
  findByID.mockResolvedValue({ id: 42, foto: 5, curriculoCurto: markdownParaLexical("Texto.") });
  findGlobal.mockResolvedValue({ cards: [cardDe(1), cardDe(2)] });
  updateGlobal.mockResolvedValue({});
  find.mockResolvedValue({ docs: [] });
});

function nenhumaEscrita() {
  expect(create).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(updateGlobal).not.toHaveBeenCalled();
}

describe("salvarPalestranteCms — validação antes de qualquer escrita", () => {
  it.each([
    ["nome", { nome: "  " }, "Informe o nome do palestrante."],
    ["titulação", { titulacao: "" }, "Informe a titulação."],
    ["instituição", { instituicao: " " }, "Informe a instituição."],
  ])("recusa %s vazio", async (_rotulo, parcial, erro) => {
    const r = await salvarPalestranteCms(usuario, null, { ...campos, ...parcial }, { arquivo: imagem(), alt: "" });
    expect(r).toEqual({ ok: false, erro });
    nenhumaEscrita();
  });

  it("na criação, exige a foto", async () => {
    const r = await salvarPalestranteCms(usuario, null, campos, null);
    expect(r).toEqual({ ok: false, erro: "Envie a foto do palestrante." });
    nenhumaEscrita();
  });

  it.each([undefined, "  "])("na criação, exige o currículo curto (%s)", async (curto) => {
    const r = await salvarPalestranteCms(
      usuario,
      null,
      { ...campos, curriculoCurtoMarkdown: curto },
      { arquivo: imagem(), alt: "" },
    );
    expect(r).toEqual({ ok: false, erro: "Informe o currículo curto." });
    nenhumaEscrita();
  });

  it("na atualização, currículo curto vazio também é recusado", async () => {
    const r = await salvarPalestranteCms(usuario, "42", { ...campos, curriculoCurtoMarkdown: "" }, null);
    expect(r).toEqual({ ok: false, erro: "Informe o currículo curto." });
    nenhumaEscrita();
  });

  it("recusa link do botão do card fora de /, #, http(s) e mailto", async () => {
    const card: CardDesejado = { formato: "expert", textos: { ...TEXTOS_CARD_VAZIOS, ctaHref: "javascript:alert(1)" } };
    const r = await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: card }, null);
    expect(r).toEqual({
      ok: false,
      erro: "Link do botão do card: use um endereço que comece com /, #, http://, https:// ou mailto:.",
    });
    nenhumaEscrita();
  });

  it("recusa foto que não é imagem", async () => {
    const pdf = new File([new Uint8Array([1])], "ana.pdf", { type: "application/pdf" });
    const r = await salvarPalestranteCms(usuario, null, campos, { arquivo: pdf, alt: "" });
    expect(r).toEqual({ ok: false, erro: "A foto precisa ser uma imagem." });
    nenhumaEscrita();
  });

  it.each([
    ["id", "abc", {}],
    ["linhas de atuação", "42", { linhasAtuacaoIds: ["3", "x"] }],
    ["programas", "42", { programasIds: ["1.5"] }],
  ])("recusa %s não numérico", async (_rotulo, id, parcial) => {
    const r = await salvarPalestranteCms(usuario, id, { ...campos, ...parcial }, null);
    expect(r).toEqual({ ok: false, erro: "Dados do formulário inválidos." });
    nenhumaEscrita();
  });

  it("na atualização, um registro sem foto exige o envio de uma", async () => {
    findByID.mockResolvedValue({ id: 42, foto: null, curriculoCurto: markdownParaLexical("Texto.") });
    const r = await salvarPalestranteCms(usuario, "42", campos, null);
    expect(r).toEqual({ ok: false, erro: "Envie a foto do palestrante." });
    nenhumaEscrita();
  });

  it("tirar do Corpo Docente o único card de pessoa é recusado antes de escrever", async () => {
    findGlobal.mockResolvedValue({ cards: [cardDe(42), { formato: "axis", especialista: null, id: "ax" }] });
    const r = await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: null }, { arquivo: imagem(), alt: "" });
    expect(r).toEqual({
      ok: false,
      erro: "O Corpo Docente precisa de ao menos um nome — inclua outro antes de tirar este.",
    });
    nenhumaEscrita();
  });
});

describe("salvarPalestranteCms — criação", () => {
  it("cria a media e depois o especialista PUBLICADO, com nulos e ids numéricos", async () => {
    const r = await salvarPalestranteCms(usuario, null, campos, { arquivo: imagem(), alt: "Retrato de Ana" });
    expect(r).toEqual({ ok: true, id: "42" });

    const [chamadaMedia, chamadaEsp] = create.mock.calls.map((c) => c[0]);
    expect(chamadaMedia.collection).toBe("media");
    expect(chamadaMedia.data).toEqual({ alt: "Retrato de Ana" });
    expect(chamadaMedia.file).toMatchObject({ name: "ana.jpg", mimetype: "image/jpeg", size: 3 });

    expect(chamadaEsp.collection).toBe("especialistas");
    expect(chamadaEsp.draft).toBeUndefined();
    expect(chamadaEsp.req).toBe(REQ);
    expect(chamadaEsp.data).toMatchObject({
      nome: "Ana Souza",
      titulacao: "doutorado",
      instituicao: "UnB",
      cargoAtual: null,
      curriculoCompleto: null,
      linkLattes: null,
      linkLinkedin: "https://linkedin.com/in/ana",
      vertical: "educacao",
      tipo: null,
      frente: null,
      formacao: "doutorado",
      atuacao: ["universidade"],
      linhasAtuacao: [3, 7],
      programasRelacionados: [11],
      ocultarDoSite: false,
      foto: 90,
      _status: "published",
    });
    expect(chamadaEsp.data.curriculoCurto).toEqual(markdownParaLexical("Professora **titular**."));
    expect(transacao.commits).toBe(1);
  });

  it("sem alt, a media usa o nome do palestrante", async () => {
    await salvarPalestranteCms(usuario, null, campos, { arquivo: imagem(), alt: "  " });
    expect(create.mock.calls[0]![0].data).toEqual({ alt: "Ana Souza" });
  });

  it("criação com card acrescenta o card do id novo no Global", async () => {
    await salvarPalestranteCms(usuario, null, { ...campos, corpoDocente: desejo }, { arquivo: imagem(), alt: "" });
    expect(updateGlobal).toHaveBeenCalledTimes(1);
    const chamada = updateGlobal.mock.calls[0]![0];
    expect(chamada.data.cards).toEqual(aplicarCardDe([cardDe(1), cardDe(2)], "42", desejo));
    expect(chamada.data.cards).toHaveLength(3);
  });

  it("na criação, confere antes de qualquer escrita o slug que o nome vai gerar", async () => {
    find.mockResolvedValue({ docs: [{ id: 7 }] });
    const r = await salvarPalestranteCms(
      usuario,
      null,
      { ...campos, nome: "  Ana Souza Júnior " },
      { arquivo: imagem(), alt: "" },
    );
    expect(r).toEqual({ ok: false, erro: ERRO_NOME_REPETIDO });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "especialistas",
        where: { slug: { equals: "ana-souza-junior" } },
        draft: true,
        limit: 1,
        depth: 0,
      }),
    );
    nenhumaEscrita();
  });

  it("slug duplicado lançado pelo Payload (ValidationError) vira mensagem legível", async () => {
    create.mockImplementation(async (args: { collection: string }) => {
      if (args.collection === "media") return { id: 90 };
      throw new ValidationError({
        collection: "especialistas",
        errors: [{ message: "Value must be unique", path: "slug" }],
      });
    });
    const r = await salvarPalestranteCms(usuario, null, campos, { arquivo: imagem(), alt: "" });
    expect(r).toEqual({ ok: false, erro: ERRO_NOME_REPETIDO });
    expect(transacao.rollbacks).toBe(1);
  });

  it("na atualização, não confere slug (o nome não muda o slug existente)", async () => {
    await salvarPalestranteCms(usuario, "42", campos, null);
    expect(find).not.toHaveBeenCalled();
  });
});

describe("salvarPalestranteCms — atualização", () => {
  it("sem currículo alterado, o update não reenvia curriculoCurto/curriculoCompleto", async () => {
    const r = await salvarPalestranteCms(
      usuario,
      "42",
      { ...campos, curriculoCurtoMarkdown: undefined, curriculoCompletoMarkdown: undefined },
      null,
    );
    expect(r).toEqual({ ok: true, id: "42" });
    const chamada = update.mock.calls[0]![0];
    expect(chamada).toMatchObject({ collection: "especialistas", id: "42", req: REQ });
    expect(chamada.draft).toBeUndefined();
    expect(chamada.data._status).toBe("published");
    expect(chamada.data).not.toHaveProperty("curriculoCurto");
    expect(chamada.data).not.toHaveProperty("curriculoCompleto");
    expect(chamada.data).not.toHaveProperty("foto");
  });

  it("com foto nova, aponta foto para a media criada", async () => {
    await salvarPalestranteCms(usuario, "42", campos, { arquivo: imagem(), alt: "" });
    expect(update.mock.calls[0]![0].data.foto).toBe(90);
  });

  it("com corpoDocente definido, grava os cards no Global com o mesmo req, publicados", async () => {
    await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: desejo }, null);
    expect(updateGlobal).toHaveBeenCalledTimes(1);
    expect(updateGlobal.mock.calls[0]![0]).toEqual({
      slug: "corpo-docente",
      data: { cards: aplicarCardDe([cardDe(1), cardDe(2)], "42", desejo), _status: "published" },
      depth: 0,
      overrideAccess: true,
      req: REQ,
    });
    expect(findGlobal.mock.calls.at(-1)![0]).toMatchObject({ slug: "corpo-docente", depth: 0, draft: true });
  });

  it("com corpoDocente ausente, não lê nem grava o Global, mesmo com card existente", async () => {
    const semBloco = { ...campos };
    delete semBloco.corpoDocente;
    await salvarPalestranteCms(usuario, "42", semBloco, null);
    expect(findGlobal).not.toHaveBeenCalled();
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("com corpoDocente null e sem card existente, não toca o Global", async () => {
    await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: null }, null);
    expect(update).toHaveBeenCalledTimes(1);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("com corpoDocente null e card existente, remove o card", async () => {
    findGlobal.mockResolvedValue({ cards: [cardDe(1), cardDe(42)] });
    await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: null }, null);
    expect(updateGlobal.mock.calls[0]![0].data.cards).toEqual([cardDe(1)]);
  });

  it("Global recusa: erro legível apontando o Corpo Docente e transação revertida", async () => {
    updateGlobal.mockRejectedValue(new Error("The following field is invalid: quicklinks"));
    const r = await salvarPalestranteCms(usuario, "42", { ...campos, corpoDocente: desejo }, null);
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/^Não foi possível atualizar o Corpo Docente/);
    expect(r.erro).toMatch(/— o problema está nos dados da página Corpo Docente, não neste palestrante\.$/);
    expect(r.erro).toContain("quicklinks");
    // O update do especialista aconteceu DENTRO da transação revertida.
    expect(update.mock.calls[0]![0].req).toBe(REQ);
    expect(transacao.rollbacks).toBe(1);
    expect(transacao.commits).toBe(0);
  });
});

describe("salvarOrdemCorpoDocenteCms", () => {
  it("grava reordenarCards(lidos, ids) publicado, com o req da transação", async () => {
    findGlobal.mockResolvedValue({ cards: [cardDe(1), cardDe(2), cardDe(3)] });
    const r = await salvarOrdemCorpoDocenteCms(usuario, ["3", "1", "2"]);
    expect(r).toEqual({ ok: true });
    expect(updateGlobal).toHaveBeenCalledTimes(1);
    expect(updateGlobal.mock.calls[0]![0]).toEqual({
      slug: "corpo-docente",
      data: { cards: reordenarCards([cardDe(1), cardDe(2), cardDe(3)], ["3", "1", "2"]), _status: "published" },
      depth: 0,
      overrideAccess: true,
      req: REQ,
    });
    expect(transacao.commits).toBe(1);
  });

  it("lista desatualizada: erro legível e nenhuma escrita no Global", async () => {
    findGlobal.mockResolvedValue({ cards: [cardDe(1), cardDe(2), cardDe(3)] });
    const r = await salvarOrdemCorpoDocenteCms(usuario, ["1", "2"]);
    expect(r).toEqual({
      ok: false,
      erro: "A lista do Corpo Docente mudou desde que a tela foi aberta — recarregue e tente de novo.",
    });
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("Global recusa: mesma mensagem de ErroCorpoDocente", async () => {
    updateGlobal.mockRejectedValue(new Error("The following field is invalid: quicklinks"));
    const r = await salvarOrdemCorpoDocenteCms(usuario, ["2", "1"]);
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/^Não foi possível atualizar o Corpo Docente/);
    expect(r.erro).toContain("quicklinks");
    expect(transacao.rollbacks).toBe(1);
  });
});
