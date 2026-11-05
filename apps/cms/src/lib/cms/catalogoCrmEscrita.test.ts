import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { paginaVazia, type PaginaProgramaEdicao } from "./paginaProgramaCatalogo";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const { salvarPrograma, excluirPrograma, salvarModulo, excluirModulo, enviarImagemPrograma, removerImagemPrograma } =
  await import("./catalogoCrmEscrita");
type DadosPrograma = Parameters<typeof salvarPrograma>[1];
type DadosModulo = Parameters<typeof salvarModulo>[1];

const usuario = { id: 5, collection: "users", nome: "Ana", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

interface Opcoes {
  siglaEmUso?: boolean;
  numeroEmUso?: boolean;
  statusPrincipal?: string;
  statusUltima?: string;
  contagens?: Record<string, number>;
  moduloAtual?: Record<string, unknown>;
  programaGravado?: Record<string, unknown>;
}

function payloadFalso(o: Opcoes = {}) {
  const create = vi.fn(async ({ data }: { collection?: string; data: Record<string, unknown> }) => ({ id: 77, ...data }));
  const update = vi.fn(async ({ data }: { collection?: string; id?: unknown; data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const del = vi.fn(async () => ({ id: 1 }));
  const find = vi.fn(async () => ({ docs: o.siglaEmUso ? [{ id: 2 }] : [] }));
  const count = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "modulos" && o.numeroEmUso !== undefined) return { totalDocs: o.numeroEmUso ? 1 : 0 };
    return { totalDocs: o.contagens?.[collection] ?? 0 };
  });
  const findByID = vi.fn(async ({ collection, draft }: { collection: string; draft?: boolean }) => {
    if (collection === "modulos") return o.moduloAtual ?? { id: 9, programa: 4 };
    return {
      id: 4,
      sigla: "EDU",
      _status: draft ? (o.statusUltima ?? "published") : (o.statusPrincipal ?? "published"),
      ...(o.programaGravado ?? {}),
    };
  });
  return { create, update, delete: del, find, count, findByID };
}

const programaBase: DadosPrograma = {
  sigla: " edu ",
  nomeCompleto: "Educação",
  areaId: "2",
  cargaHorariaTotal: "64 horas",
  textos: { visaoGeral: "Texto **forte**." },
  eixos: [{ titulo: " E ", descricao: "D " }, { titulo: "", descricao: "" }],
  diferenciais: [],
  resultados: [" R ", " "],
};

const fetchMock = vi.fn(async () => ({ ok: true }));
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("PAYLOAD_PUBLIC_FRONT_URL", "https://site.test");
  vi.stubEnv("REVALIDATE_SECRET", "s");
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const pathsRevalidados = () =>
  fetchMock.mock.calls.map((c) => (JSON.parse(((c as unknown[])[1] as { body: string }).body) as { path: string }).path);

function paginaCompleta(): PaginaProgramaEdicao {
  const pg = paginaVazia();
  pg.heroTitulo = "Programa *X*";
  pg.heroSubtitulo = "Sub";
  pg.heroImagemCaminho = "/img/x.webp";
  pg.cartao.nome = "X";
  pg.cartao.tagline = "Chamada";
  pg.cartao.descricaoMenu = "Menu";
  pg.cartao.descricaoMapa = "Mapa";
  return pg;
}

/** Programa já gravado, com o que a revalidação lê (slug e sigla da área). */
const GRAVADO_EDUTEC = { slug: "edutec", area: { id: 2, sigla: "educacao" } };

describe("salvarPrograma", () => {
  it("programa novo nasce rascunho, sigla em maiúsculas, listas sem itens vazios e aparadas", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma(null, programaBase, false, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    const args = p.create.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(true);
    expect(args.data).toMatchObject({ sigla: "EDU", _status: "draft", area: 2, eixosTematicos: [{ titulo: "E", descricao: "D" }], resultadosEsperados: [{ resultado: "R" }] });
  });

  it("só grava os textos enviados — campo ausente não é tocado", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, textos: { objetivo: "" } }, false, usuario);
    const data = (p.update.mock.calls[0]![0] as { data: Record<string, unknown> }).data;
    expect(data.objetivo).toBeNull();
    expect("visaoGeral" in data).toBe(false);
    expect("problema" in data).toBe(false);
  });

  it("linha de temas vai para eyebrow, aparada; vazia vira null; ausente não é tocada", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, temas: " Cultura Digital · IA " }, false, usuario);
    await salvarPrograma("4", { ...programaBase, temas: "  " }, false, usuario);
    await salvarPrograma("4", programaBase, false, usuario);
    const dados = p.update.mock.calls.map((c) => (c[0] as { data: Record<string, unknown> }).data);
    expect(dados[0]!.eyebrow).toBe("Cultura Digital · IA");
    expect(dados[1]!.eyebrow).toBeNull();
    expect("eyebrow" in dados[2]!).toBe(false);
  });

  it("ignora chaves de textos fora da lista de campos de texto", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const forjado = { sigla: "x", slug: "y", objetivo: "Texto" } as unknown as DadosPrograma["textos"];
    await salvarPrograma("4", { ...programaBase, textos: forjado }, false, usuario);
    const data = (p.update.mock.calls[0]![0] as { data: Record<string, unknown> }).data;
    expect(data.objetivo).not.toBeNull();
    expect("slug" in data).toBe(false);
    expect(data.sigla).toBe("EDU");
  });

  it("publicar envia os dados do formulário com _status published numa só escrita", async () => {
    const p = payloadFalso({ contagens: { modulos: 1 }, programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", { ...programaBase, pagina: paginaCompleta() }, true, usuario);
    expect(r).toEqual({ ok: true, id: "1" });
    expect(p.update).toHaveBeenCalledTimes(1);
    const args = p.update.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(false);
    expect(args.data).toMatchObject({ _status: "published", nomeCompleto: "Educação" });
  });

  it("publicar sem visão geral (nem no formulário nem gravada) lista as faltas e não escreve", async () => {
    const p = payloadFalso({ programaGravado: { visaoGeral: null } });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma(
      "4",
      { ...programaBase, areaId: "", textos: {}, pagina: paginaCompleta() },
      true,
      usuario,
    );
    expect(r).toEqual({ ok: false, erro: "Para publicar, preencha: Área, Visão geral, Ao menos um módulo." });
    expect(p.update).not.toHaveBeenCalled();
  });

  it("publicar só com o mínimo antigo pede o mínimo da página (lido do gravado quando não vem no formulário)", async () => {
    const p = payloadFalso({ contagens: { modulos: 2 }, programaGravado: { pagina: { heroTitulo: "Gravado" } } });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", programaBase, true, usuario);
    expect(r).toEqual({
      ok: false,
      erro:
        "Para publicar, preencha: Subtítulo do topo, Imagem do topo, Cartão: nome, Cartão: chamada, Cartão: descrição no menu, Cartão: descrição no mapa do site.",
    });
    expect(p.update).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("publicar pede ao site a página do programa, a lista, a vertente, o menu e o mapa", async () => {
    const p = payloadFalso({ contagens: { modulos: 1 }, programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, pagina: paginaCompleta() }, true, usuario);
    expect(pathsRevalidados()).toEqual([
      "/programas/edutec",
      "/programas",
      "/solucoes-estrategicas/educacao",
      "/",
      "/mapa-do-site",
    ]);
  });

  it("falha na revalidação vira aviso — a publicação fica", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const p = payloadFalso({ contagens: { modulos: 1 }, programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", { ...programaBase, pagina: paginaCompleta() }, true, usuario);
    expect(r).toEqual({ ok: true, id: "1", aviso: "Salvo, mas a atualização no site pode levar alguns minutos." });
    expect(p.update).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValue({ ok: true });
  });

  it("salvar rascunho não revalida o site (ele lê o publicado)", async () => {
    const p = payloadFalso({ programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, pagina: paginaCompleta() }, false, usuario);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("página enviada vai inteira no group pagina; ausente não é tocada", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, pagina: paginaCompleta() }, false, usuario);
    await salvarPrograma("4", programaBase, false, usuario);
    const dados = p.update.mock.calls.map((c) => (c[0] as { data: Record<string, unknown> }).data);
    expect(dados[0]!.pagina).toMatchObject({ heroTitulo: "Programa *X*", heroImagemCaminho: "/img/x.webp", cartao: { nome: "X" } });
    expect("pagina" in dados[1]!).toBe(false);
  });

  it("página com link ou caminho inválido recusa antes de escrever", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const pg = paginaCompleta();
    pg.modalidadesCards = [{ destaque: false, tag: "", titulo: "A", descricao: "", ctaRotulo: "", ctaHref: "javascript:x" }];
    const r = await salvarPrograma("4", { ...programaBase, pagina: pg }, false, usuario);
    expect(r).toEqual({
      ok: false,
      erro: "Corrija: Modalidade 1: o link do botão deve começar com /, #, http://, https:// ou mailto:.",
    });
    expect(p.update).not.toHaveBeenCalled();
  });

  it("rascunho sem sigla recusa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, { ...programaBase, sigla: "" }, false, usuario)).toEqual({ ok: false, erro: "Para salvar, preencha: Sigla." });
  });

  it("sigla duplicada (comparada em maiúsculas) recusa", async () => {
    const p = payloadFalso({ siglaEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, programaBase, false, usuario)).toEqual({ ok: false, erro: "Já existe um programa com a sigla EDU." });
    expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ where: { and: [{ sigla: { equals: "EDU" } }] } }));
  });
});

describe("excluirPrograma", () => {
  it("com módulos recusa antes de apagar", async () => {
    const p = payloadFalso({ contagens: { modulos: 2 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: false, erro: "Vinculado a 2 módulos — exclua ou desvincule antes." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("sem dependentes apaga e revalida o que mostrava o programa (lido antes de apagar)", async () => {
    const p = payloadFalso({ programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: "4" }));
    expect(pathsRevalidados()).toContain("/programas/edutec");
    expect(pathsRevalidados()).toContain("/programas");
  });
});

const moduloBase: DadosModulo = {
  programaId: "4",
  numero: "3",
  titulo: "Gestão",
  ementa: "Ementa **x**.",
  cargaHoraria: "8h",
  tituloComercial: "",
  valor: "1.500,50",
  replay: "",
  certificacao: "",
};

describe("salvarModulo", () => {
  it("cria, converte valor e recalcula modulosQuantidade publicado quando o programa está publicado", async () => {
    const p = payloadFalso({ numeroEmUso: false });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarModulo(null, moduloBase, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    expect(p.create.mock.calls[0]![0]).toMatchObject({ collection: "modulos", data: { programa: 4, numero: 3, comercial: { valor: 1500.5, tituloComercial: null } } });
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBeFalsy();
    expect("modulosQuantidade" in recalculo.data).toBe(true);
    expect("_status" in recalculo.data).toBe(false);
  });

  it("programa com alterações pendentes: recálculo grava no rascunho", async () => {
    const p = payloadFalso({ numeroEmUso: false, statusUltima: "draft" });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo(null, moduloBase, usuario);
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBe(true);
    expect(recalculo.data._status).toBe("draft");
  });

  it("número repetido no programa de destino recusa com a sigla", async () => {
    const p = payloadFalso({ numeroEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarModulo("9", moduloBase, usuario)).toEqual({ ok: false, erro: "Já existe o módulo 3 em EDU." });
    expect(p.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "modulos",
        where: { and: [{ programa: { equals: "4" } }, { numero: { equals: 3 } }, { id: { not_equals: "9" } }] },
      }),
    );
  });

  it("mudar de programa recalcula os dois", async () => {
    const p = payloadFalso({ numeroEmUso: false, moduloAtual: { id: 9, programa: 8 } });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo("9", moduloBase, usuario);
    const recalculados = p.update.mock.calls
      .filter((c) => (c[0] as { collection: string }).collection === "programas")
      .map((c) => String((c[0] as { id: unknown }).id));
    expect(recalculados.sort()).toEqual(["4", "8"]);
  });

  it("tópicos: enviados viram a lista (sem os vazios); ausentes não são tocados", async () => {
    const p = payloadFalso({ numeroEmUso: false });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo("9", { ...moduloBase, topicos: [" A ", "", "B"] }, usuario);
    await salvarModulo("9", moduloBase, usuario);
    const dados = p.update.mock.calls
      .filter((c) => (c[0] as { collection: string }).collection === "modulos")
      .map((c) => (c[0] as { data: Record<string, unknown> }).data);
    expect(dados[0]!.topicos).toEqual([{ texto: "A" }, { texto: "B" }]);
    expect("topicos" in dados[1]!).toBe(false);
  });

  it("salvar módulo revalida a página do programa", async () => {
    const p = payloadFalso({ numeroEmUso: false, programaGravado: GRAVADO_EDUTEC });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarModulo("9", moduloBase, usuario)).toEqual({ ok: true, id: "1" });
    expect(pathsRevalidados()).toContain("/programas/edutec");
  });

  it("atualizar sem ementa não reescreve a ementa", async () => {
    const p = payloadFalso({ numeroEmUso: false });
    obterPayloadMock.mockResolvedValue(p);
    const semEmenta: DadosModulo = { ...moduloBase };
    delete semEmenta.ementa;
    const r = await salvarModulo("9", semEmenta, usuario);
    expect(r.ok).toBe(true);
    const data = (p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "modulos")![0] as { data: Record<string, unknown> }).data;
    expect("ementa" in data).toBe(false);
  });

  it("criar sem ementa e atualizar com ementa vazia recusam", async () => {
    obterPayloadMock.mockResolvedValue(payloadFalso({ numeroEmUso: false }));
    const semEmenta: DadosModulo = { ...moduloBase };
    delete semEmenta.ementa;
    expect(await salvarModulo(null, semEmenta, usuario)).toEqual({ ok: false, erro: "Preencha: Ementa." });
    expect(await salvarModulo("9", { ...moduloBase, ementa: " " }, usuario)).toEqual({ ok: false, erro: "Preencha: Ementa." });
  });

  it("valida número, obrigatórios e valor", async () => {
    obterPayloadMock.mockResolvedValue(payloadFalso({ numeroEmUso: false }));
    expect(await salvarModulo(null, { ...moduloBase, numero: "0" }, usuario)).toEqual({ ok: false, erro: "Número do módulo deve ser um inteiro a partir de 1." });
    expect(await salvarModulo(null, { ...moduloBase, titulo: " ", ementa: "" }, usuario)).toEqual({ ok: false, erro: "Preencha: Título, Ementa." });
    expect(await salvarModulo(null, { ...moduloBase, valor: "abc" }, usuario)).toEqual({ ok: false, erro: "Valor de referência inválido." });
  });
});

describe("excluirModulo", () => {
  it("usado em proposta recusa", async () => {
    const p = payloadFalso({ contagens: { propostas: 1 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: false, erro: "Usado em 1 proposta — não pode ser excluído." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("livre: apaga e recalcula o programa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "modulos", id: "9" }));
    expect(p.update).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: 4 }));
    expect(pathsRevalidados()).toContain("/programas");
  });
});

/** Programa gravado com imagens legadas por caminho e uma linha de cada docente. */
const PAGINA_GRAVADA = {
  heroTitulo: "T",
  heroImagem: null,
  heroImagemCaminho: "/img/topo.webp",
  docentes: {
    titulo: "D",
    coordenacao: [{ id: "c1", nome: "Ana", imagem: null, imagemCaminho: "/img/ana.webp" }],
    especialistas: [{ id: "e1", nome: "Beto", imagem: 5, imagemCaminho: "/img/beto.webp" }],
  },
  cartao: { nome: "N", imagem: 6, imagemCaminho: "/img/cartao.webp" },
};

function arquivo(tipo = "image/webp"): File {
  return new File([new Uint8Array([1, 2, 3])], "foto.webp", { type: tipo });
}

function paginaGravadaNoUpdate(p: ReturnType<typeof payloadFalso>) {
  const chamada = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas");
  return chamada![0] as { data: { pagina: typeof PAGINA_GRAVADA; _status: string }; draft?: boolean };
}

describe("enviarImagemPrograma", () => {
  it("topo: cria a media e aponta pagina.heroImagem para ela, sem tocar no caminho legado", async () => {
    const p = payloadFalso({ programaGravado: { ...GRAVADO_EDUTEC, pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(p);
    const r = await enviarImagemPrograma("4", { tipo: "topo" }, arquivo(), usuario);
    expect(r).toEqual({ ok: true, midiaId: "77" });
    expect(p.create).toHaveBeenCalledWith(expect.objectContaining({ collection: "media" }));
    const { data, draft } = paginaGravadaNoUpdate(p);
    expect(draft).toBeFalsy();
    expect(data._status).toBe("published");
    expect(data.pagina.heroImagem).toBe(77);
    expect(data.pagina.heroImagemCaminho).toBe("/img/topo.webp");
    expect(data.pagina.cartao).toEqual(PAGINA_GRAVADA.cartao);
  });

  it("programa publicado: revalida a página; nunca publicado: grava rascunho e não revalida", async () => {
    const p = payloadFalso({ programaGravado: { ...GRAVADO_EDUTEC, pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(p);
    await enviarImagemPrograma("4", { tipo: "cartao" }, arquivo(), usuario);
    expect(pathsRevalidados()).toContain("/programas/edutec");
    expect(paginaGravadaNoUpdate(p).data.pagina.cartao).toEqual({ ...PAGINA_GRAVADA.cartao, imagem: 77 });

    fetchMock.mockClear();
    const q = payloadFalso({ statusPrincipal: "draft", statusUltima: "draft", programaGravado: { pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(q);
    await enviarImagemPrograma("4", { tipo: "cartao" }, arquivo(), usuario);
    expect(paginaGravadaNoUpdate(q).data._status).toBe("draft");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("docente: acha a linha pelo id e preserva o caminho e as outras linhas", async () => {
    const p = payloadFalso({ programaGravado: { ...GRAVADO_EDUTEC, pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(p);
    await enviarImagemPrograma("4", { tipo: "coordenacao", linhaId: "c1" }, arquivo(), usuario);
    const d = paginaGravadaNoUpdate(p).data.pagina.docentes;
    expect(d.coordenacao).toEqual([{ id: "c1", nome: "Ana", imagem: 77, imagemCaminho: "/img/ana.webp" }]);
    expect(d.especialistas).toEqual(PAGINA_GRAVADA.docentes.especialistas);
  });

  it("linha inexistente ou arquivo que não é imagem recusam antes de subir a media", async () => {
    const p = payloadFalso({ programaGravado: { pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await enviarImagemPrograma("4", { tipo: "especialista", linhaId: "nao-existe" }, arquivo(), usuario)).toEqual({
      ok: false,
      erro: "Salve o programa antes de enviar a imagem desta linha.",
    });
    expect(await enviarImagemPrograma("4", { tipo: "topo" }, arquivo("application/pdf"), usuario)).toEqual({
      ok: false,
      erro: "Envie uma imagem JPEG, PNG, WebP, AVIF ou SVG.",
    });
    expect(await enviarImagemPrograma("4", { tipo: "forjado" } as never, arquivo(), usuario)).toEqual({
      ok: false,
      erro: "Imagem desconhecida.",
    });
    expect(p.create).not.toHaveBeenCalled();
    expect(p.update).not.toHaveBeenCalled();
  });
});

describe("removerImagemPrograma", () => {
  it("limpa a relação e mantém o caminho legado (o site volta a usá-lo)", async () => {
    const p = payloadFalso({ programaGravado: { ...GRAVADO_EDUTEC, pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await removerImagemPrograma("4", { tipo: "especialista", linhaId: "e1" }, usuario)).toEqual({ ok: true });
    const d = paginaGravadaNoUpdate(p).data.pagina.docentes;
    expect(d.especialistas).toEqual([{ id: "e1", nome: "Beto", imagem: null, imagemCaminho: "/img/beto.webp" }]);
    expect(p.create).not.toHaveBeenCalled();

    const q = payloadFalso({ programaGravado: { ...GRAVADO_EDUTEC, pagina: PAGINA_GRAVADA } });
    obterPayloadMock.mockResolvedValue(q);
    await removerImagemPrograma("4", { tipo: "cartao" }, usuario);
    expect(paginaGravadaNoUpdate(q).data.pagina.cartao).toEqual({ ...PAGINA_GRAVADA.cartao, imagem: null });
  });
});
