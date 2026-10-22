import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Gates das Server Actions do palestrante. Server Action é endpoint público
 * e a Local API ignora o `access` das coleções, então sessão E tela
 * (`site.palestrantes`) são checados aqui, antes de qualquer escrita.
 * A Local API é falsa; `temTela` é o real.
 */
const create = vi.fn();
const update = vi.fn();
const updateGlobal = vi.fn();
const findByID = vi.fn();
const findGlobal = vi.fn();
const find = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, updateGlobal, findByID, findGlobal, find }),
}));

vi.mock("@/lib/crm/transacao", () => ({
  executarEmTransacao: async (_p: unknown, _u: unknown, fn: (req: unknown) => Promise<unknown>) => fn({}),
}));

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temTela, acessoDoUsuario } = await import("@/lib/cms/telas");
  const comTela =
    (obter: () => Promise<{ administrador?: boolean; telas?: string[] } | null>) =>
    async (telas: Parameters<typeof temTela>[1]) => {
      const u = await obter();
      return u && temTela(acessoDoUsuario(u), telas) ? u : null;
    };
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComTela: comTela(obterUsuarioCmsMock),
    obterUsuarioAutenticadoComTela: comTela(obterUsuarioAutenticadoMock),
  };
});

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { carregarOpcoesPalestrante, salvarOrdemCorpoDocente, salvarPalestrante } = await import("./acoes");

const administrador = { id: 1, nome: "Ana", administrador: true, telas: [] };
const soEventos = { id: 2, nome: "Iara", administrador: false, telas: ["site.eventos"] };
const soPalestrantes = { id: 3, nome: "Rui", administrador: false, telas: ["site.palestrantes"] };
const soCorpoDocente = { id: 4, nome: "Eva", administrador: false, telas: ["site.corpo-docente"] };
const cardDesejado = {
  formato: "expert",
  textos: { tag: "", axisBadge: "", credencialCard: "", metaAtuacao: "", metaEixos: "", programasTexto: "", programasStrong: "", sufixoPrograma: "", ctaHref: "", ctaRotulo: "" },
};

const campos = {
  nome: "Ana Souza",
  titulacao: "doutorado",
  instituicao: "UnB",
  cargoAtual: "",
  curriculoCurtoMarkdown: "Professora.",
  curriculoCompletoMarkdown: "",
  linkLattes: "",
  linkLinkedin: "",
  vertical: "",
  tipo: "",
  frente: "",
  formacao: "",
  atuacao: [],
  linhasAtuacaoIds: [],
  programasIds: [],
  ocultarDoSite: false,
  corpoDocente: null,
};

function formulario(camposJson: string, id = ""): FormData {
  const fd = new FormData();
  fd.append("id", id);
  fd.append("campos", camposJson);
  fd.append("foto", new File([new Uint8Array([1, 2])], "ana.jpg", { type: "image/jpeg" }));
  fd.append("fotoAlt", "Retrato");
  return fd;
}

function nenhumaEscrita() {
  expect(create).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(updateGlobal).not.toHaveBeenCalled();
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("salvarPalestrante (Server Action)", () => {
  it.each([
    ["sem sessão", null],
    ["só com site.eventos", soEventos],
  ])("%s, recusa sem tocar a Local API", async (_rotulo, usuario) => {
    obterUsuarioAutenticadoMock.mockResolvedValue(usuario);
    const r = await salvarPalestrante(formulario(JSON.stringify(campos)));
    expect(r.resultado.ok).toBe(false);
    expect(r.palestrante).toBeNull();
    nenhumaEscrita();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ["JSON inválido", "{não é json"],
    ["formato errado", JSON.stringify({ ...campos, atuacao: "universidade" })],
  ])("campos com %s → dados inválidos", async (_rotulo, json) => {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    const r = await salvarPalestrante(formulario(json));
    expect(r).toEqual({ resultado: { ok: false, erro: "Dados do formulário inválidos." }, palestrante: null });
    nenhumaEscrita();
  });

  it("id não numérico → dados inválidos", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    const r = await salvarPalestrante(formulario(JSON.stringify(campos), "12; drop"));
    expect(r.resultado).toEqual({ ok: false, erro: "Dados do formulário inválidos." });
    nenhumaEscrita();
  });

  it("com administrador e id vazio, cria e devolve o detalhe recarregado", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    create.mockImplementation(async (args: { collection: string }) =>
      args.collection === "media" ? { id: 90 } : { id: 42 },
    );
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] });
    findByID.mockResolvedValue({ id: 42, nome: "Ana Souza", slug: "ana-souza", titulacao: "doutorado" });
    find.mockResolvedValue({ docs: [] });

    const r = await salvarPalestrante(formulario(JSON.stringify(campos)));

    expect(r.resultado).toEqual({ ok: true, id: "42" });
    const criacaoEsp = create.mock.calls.map((c) => c[0]).find((a) => a.collection === "especialistas");
    expect(criacaoEsp.data).toMatchObject({ nome: "Ana Souza", foto: 90, _status: "published" });
    expect(create.mock.calls[0]![0].data).toEqual({ alt: "Retrato" });
    expect(update).not.toHaveBeenCalled();
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: "especialistas", id: "42" }));
    expect(r.palestrante).toMatchObject({ id: "42", nome: "Ana Souza", slug: "ana-souza" });
    expect(r.palestrante?.editavel.corpoDocente).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("salvarPalestrante — bloco Corpo Docente por tela", () => {
  function preparaCriacao() {
    create.mockImplementation(async (args: { collection: string }) =>
      args.collection === "media" ? { id: 90 } : { id: 42 },
    );
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] });
    findByID.mockResolvedValue({ id: 42, nome: "Ana Souza", slug: "ana-souza" });
    find.mockResolvedValue({ docs: [] });
  }

  const camposSemBloco: Record<string, unknown> = { ...campos };
  delete camposSemBloco.corpoDocente;

  it("site.palestrantes com corpoDocente ausente → salva e não toca o card", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(soPalestrantes);
    preparaCriacao();
    const r = await salvarPalestrante(formulario(JSON.stringify(camposSemBloco)));
    expect(r.resultado.ok).toBe(true);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("site.palestrantes com corpoDocente null → recusa antes de qualquer escrita", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(soPalestrantes);
    preparaCriacao();
    const r = await salvarPalestrante(formulario(JSON.stringify({ ...campos, corpoDocente: null }), "42"));
    expect(r.resultado).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    nenhumaEscrita();
  });

  it("com site.corpo-docente, null remove o card existente", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue({ ...soPalestrantes, telas: ["site.palestrantes", "site.corpo-docente"] });
    findByID.mockResolvedValue({ id: 42, foto: 5, curriculoCurto: { root: {} }, nome: "Ana", slug: "ana" });
    findGlobal.mockResolvedValue({
      cards: [
        { formato: "expert", especialista: 42, id: "c42" },
        { formato: "expert", especialista: 1, id: "c1" },
      ],
    });
    update.mockResolvedValue({ id: 42 });
    updateGlobal.mockResolvedValue({});
    const fd = formulario(JSON.stringify({ ...campos, corpoDocente: null }), "42");
    fd.delete("foto");
    const r = await salvarPalestrante(fd);
    expect(r.resultado.ok).toBe(true);
    expect(updateGlobal.mock.calls[0]![0].data.cards.map((c: { especialista: number }) => c.especialista)).toEqual([1]);
  });

  it("site.palestrantes com o bloco → recusa antes de qualquer escrita", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(soPalestrantes);
    preparaCriacao();
    const r = await salvarPalestrante(formulario(JSON.stringify({ ...campos, corpoDocente: cardDesejado })));
    expect(r.resultado).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    nenhumaEscrita();
  });

  it("com site.palestrantes e site.corpo-docente, o bloco é gravado", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue({ ...soPalestrantes, telas: ["site.palestrantes", "site.corpo-docente"] });
    preparaCriacao();
    const r = await salvarPalestrante(formulario(JSON.stringify({ ...campos, corpoDocente: cardDesejado })));
    expect(r.resultado.ok).toBe(true);
    expect(updateGlobal).toHaveBeenCalled();
  });

  it("só site.corpo-docente (sem site.palestrantes) é recusado", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(soCorpoDocente);
    const r = await salvarPalestrante(formulario(JSON.stringify(campos)));
    expect(r.resultado.ok).toBe(false);
    nenhumaEscrita();
  });
});

describe("salvarOrdemCorpoDocente por tela", () => {
  it("site.palestrantes sem site.corpo-docente é recusado; com a tela, grava", async () => {
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 7, id: "a" }] });
    updateGlobal.mockResolvedValue({});
    obterUsuarioAutenticadoMock.mockResolvedValue(soPalestrantes);
    expect((await salvarOrdemCorpoDocente(["7"])).resultado.ok).toBe(false);
    expect(updateGlobal).not.toHaveBeenCalled();
    obterUsuarioAutenticadoMock.mockResolvedValue(soCorpoDocente);
    expect((await salvarOrdemCorpoDocente(["7"])).resultado.ok).toBe(true);
  });
});

describe("salvarPalestrante — releitura depois de salvar", () => {
  const AVISO = "Salvo. Não foi possível recarregar os dados — reabra o palestrante.";

  function preparaCriacao() {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    create.mockImplementation(async (args: { collection: string }) =>
      args.collection === "media" ? { id: 90 } : { id: 42 },
    );
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] });
    find.mockResolvedValue({ docs: [] });
  }

  it("se a releitura lança, devolve ok com aviso e palestrante null", async () => {
    preparaCriacao();
    // A releitura (obterPalestranteCms) lê o Global depois do especialista.
    findByID.mockResolvedValue({ id: 42, nome: "Ana Souza", slug: "ana-souza" });
    findGlobal
      .mockResolvedValueOnce({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] })
      .mockRejectedValue(new Error("conexão caiu"));
    const r = await salvarPalestrante(formulario(JSON.stringify(campos)));
    expect(r).toEqual({ resultado: { ok: true, id: "42", aviso: AVISO }, palestrante: null });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("se a releitura não encontra o registro, devolve o mesmo aviso", async () => {
    preparaCriacao();
    findByID.mockRejectedValue(new Error("não achou"));
    const r = await salvarPalestrante(formulario(JSON.stringify(campos)));
    expect(r).toEqual({ resultado: { ok: true, id: "42", aviso: AVISO }, palestrante: null });
  });
});

describe("normalização de ids", () => {
  it("salvarPalestrante: id com zeros à esquerda vira o número canônico", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    findByID.mockResolvedValue({ id: 7, foto: 5, curriculoCurto: { root: {} }, nome: "Ana" });
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] });
    update.mockResolvedValue({ id: 7 });
    const fd = formulario(JSON.stringify({ ...campos, linhasAtuacaoIds: ["003"], programasIds: ["011"] }), "007");
    fd.delete("foto");
    await salvarPalestrante(fd);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: "especialistas", id: "7" }));
    const data = update.mock.calls[0]![0].data;
    expect(data.linhasAtuacao).toEqual([3]);
    expect(data.programasRelacionados).toEqual([11]);
  });

  it("salvarOrdemCorpoDocente: '007' casa o card do especialista 7", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(administrador);
    findGlobal.mockResolvedValue({
      cards: [
        { formato: "expert", especialista: 7, id: "a" },
        { formato: "expert", especialista: 8, id: "b" },
      ],
    });
    updateGlobal.mockResolvedValue({});
    const r = await salvarOrdemCorpoDocente(["008", "007"]);
    expect(r.resultado.ok).toBe(true);
    expect(updateGlobal.mock.calls[0]![0].data.cards.map((c: { especialista: number }) => c.especialista)).toEqual([
      8, 7,
    ]);
  });
});

describe("carregarOpcoesPalestrante (Server Action)", () => {
  it("sem sessão, devolve listas vazias sem ler o banco", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);
    expect(await carregarOpcoesPalestrante()).toEqual({ areas: [], programas: [] });
    expect(find).not.toHaveBeenCalled();
  });

  it("com sessão, devolve áreas e programas", async () => {
    obterUsuarioCmsMock.mockResolvedValue(administrador);
    find.mockImplementation(async (args: { collection: string }) =>
      args.collection === "areas"
        ? { docs: [{ id: 3, nome: "Educação" }] }
        : { docs: [{ id: 11, sigla: "EDUTEC" }] },
    );
    expect(await carregarOpcoesPalestrante()).toEqual({
      areas: [{ id: "3", nome: "Educação" }],
      programas: [{ id: "11", sigla: "EDUTEC" }],
    });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "programas", depth: 0, limit: 100, sort: "sigla", select: { sigla: true } }),
    );
  });
});
