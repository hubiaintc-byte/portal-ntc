import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const update = vi.fn();
const deleteFn = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, delete: deleteFn }),
}));

import {
  despublicarConteudoCms,
  enviarMidiaConteudo,
  excluirConteudoCms,
  publicarConteudoCms,
  salvarConteudoCms,
  type CamposConteudo,
} from "./painelCmsEscrita";

const campos: CamposConteudo = {
  titulo: "Nota sobre a LGPD",
  slug: "nota-sobre-a-lgpd",
  categoria: "nota-tecnica",
  areaId: "2",
  lide: "O que muda na operação.",
  corpoMarkdown: "## Contexto\n\nTexto do corpo.",
  assinatura: "Direção Científica NTC",
  autorIds: [],
  dataPublicacao: "2026-09-22",
  destaque: false,
  anunciarEmPreparacao: false,
  linkExterno: "",
  seoTitulo: "",
  seoDescricao: "",
};

beforeEach(() => {
  create.mockReset();
  update.mockReset();
  deleteFn.mockReset();
});

describe("salvarConteudoCms", () => {
  it("cria como rascunho quando não há id, convertendo o corpo para Lexical", async () => {
    create.mockResolvedValue({ id: 12 });
    const r = await salvarConteudoCms(null, campos);
    expect(r).toEqual({ ok: true, id: "12" });

    const enviado = create.mock.calls[0]![0];
    expect(enviado.collection).toBe("conteudos");
    expect(enviado.draft).toBe(true);
    expect(enviado.data.titulo).toBe("Nota sobre a LGPD");
    expect(enviado.data.corpo.root.children[0]).toMatchObject({ type: "heading", tag: "h2" });
    // SEO vazio grava o grupo aninhado com os dois campos null, não a chave
    // solta "seoTitulo"/"seoDescricao" — a coleção usa um grupo `seo`.
    expect(enviado.data.seo).toEqual({ tituloSeo: null, descricaoSeo: null });
  });

  it("atualiza preservando o estado de publicação quando há id, gravando o SEO no grupo aninhado", async () => {
    update.mockResolvedValue({ id: 12 });
    await salvarConteudoCms("12", {
      ...campos,
      seoTitulo: "Título SEO da nota",
      seoDescricao: "Descrição SEO da nota.",
    });
    const enviado = update.mock.calls[0]![0];
    expect(enviado).toMatchObject({ collection: "conteudos", id: "12", draft: true });
    // Grava em `seo.tituloSeo`/`seo.descricaoSeo` (grupo da coleção), não em
    // chaves soltas `seoTitulo`/`seoDescricao` — gravar flat perderia os dois
    // campos silenciosamente.
    expect(enviado.data.seo).toEqual({
      tituloSeo: "Título SEO da nota",
      descricaoSeo: "Descrição SEO da nota.",
    });
  });

  it("grava área nula quando areaId vem vazio", async () => {
    create.mockResolvedValue({ id: 13 });
    await salvarConteudoCms(null, { ...campos, areaId: "" });
    expect(create.mock.calls[0]![0].data.area).toBeNull();
  });

  it("recusa título vazio sem tocar no banco", async () => {
    const r = await salvarConteudoCms(null, { ...campos, titulo: "   " });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/título/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa lide acima de 280 caracteres", async () => {
    const r = await salvarConteudoCms(null, { ...campos, lide: "x".repeat(281) });
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("traduz erro de slug duplicado do Payload", async () => {
    create.mockRejectedValue(new Error("duplicate key value violates unique constraint"));
    const r = await salvarConteudoCms(null, campos);
    expect(r).toEqual({ ok: false, erro: "Já existe um conteúdo com este endereço (slug)." });
  });
});

describe("publicar, despublicar e excluir", () => {
  it("publicar exige corpo, lide e categoria — e manda _status published", async () => {
    update.mockResolvedValue({ id: 12 });
    const r = await publicarConteudoCms("12");
    expect(r.ok).toBe(true);
    expect(update.mock.calls[0]![0].data).toEqual({ _status: "published" });
  });

  it("despublicar volta para draft", async () => {
    update.mockResolvedValue({ id: 12 });
    await despublicarConteudoCms("12");
    expect(update.mock.calls[0]![0].data).toEqual({ _status: "draft" });
  });

  it("excluir chama delete na coleção certa", async () => {
    deleteFn.mockResolvedValue({});
    const r = await excluirConteudoCms("12");
    expect(r.ok).toBe(true);
    expect(deleteFn.mock.calls[0]![0]).toMatchObject({ collection: "conteudos", id: "12" });
  });
});

describe("enviarMidiaConteudo", () => {
  function arquivoFalso(nome = "capa.png", tipo = "image/png") {
    return new File([new Uint8Array([1, 2, 3])], nome, { type: tipo });
  }

  it("cria a Media e aponta o campo no rascunho do conteúdo", async () => {
    create.mockResolvedValue({ id: 9 });
    update.mockResolvedValue({ id: 12 });

    const r = await enviarMidiaConteudo("12", "imagemDestaque", arquivoFalso());
    expect(r).toEqual({ ok: true });

    expect(create.mock.calls[0]![0]).toMatchObject({ collection: "media" });
    const escrita = update.mock.calls[0]![0];
    // draft: true — o arquivo entra no rascunho e vai ao ar no próximo
    // "Publicar", junto com o texto (nunca publica de carona).
    expect(escrita).toMatchObject({ collection: "conteudos", id: "12", draft: true });
    expect(escrita.data).toEqual({ imagemDestaque: 9 });
  });

  it("aponta o anexo quando o campo é anexoDownload", async () => {
    create.mockResolvedValue({ id: 31 });
    update.mockResolvedValue({ id: 12 });

    await enviarMidiaConteudo("12", "anexoDownload", arquivoFalso("estudo.pdf", "application/pdf"));
    expect(update.mock.calls[0]![0].data).toEqual({ anexoDownload: 31 });
  });

  it("não deixa um campo arbitrário chegar ao documento", async () => {
    create.mockResolvedValue({ id: 44 });
    update.mockResolvedValue({ id: 12 });

    // `campo` chega como argumento de Server Action: a união é só de
    // compilação, então o cast aqui simula o que um cliente hostil mandaria
    // pelo fio. A escrita tem de cair num dos dois campos previstos.
    await enviarMidiaConteudo("12", "slug" as "imagemDestaque", arquivoFalso());
    expect(update.mock.calls[0]![0].data).toEqual({ anexoDownload: 44 });
    expect(update.mock.calls[0]![0].data.slug).toBeUndefined();
  });

  it("devolve a mensagem do erro quando o upload falha", async () => {
    create.mockRejectedValue(new Error("Storage fora do ar"));
    const r = await enviarMidiaConteudo("12", "imagemDestaque", arquivoFalso());
    expect(r).toEqual({ ok: false, erro: "Storage fora do ar" });
    expect(update).not.toHaveBeenCalled();
  });
});
