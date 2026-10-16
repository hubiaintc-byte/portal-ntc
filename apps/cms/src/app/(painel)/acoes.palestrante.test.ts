import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Gates das Server Actions do palestrante. Server Action é endpoint público
 * e a Local API ignora o `access` das coleções, então sessão E perfil
 * (`PERFIS_INSTITUCIONAL`) são checados aqui, antes de qualquer escrita.
 * A Local API é falsa; `temPerfil` é o real.
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
  const { temPerfil } = await import("@/lib/cms/perfis");
  const comPerfil =
    (obter: () => Promise<{ perfil?: string } | null>) =>
    async (permitidos: Parameters<typeof temPerfil>[1]) => {
      const u = await obter();
      return u && temPerfil(u.perfil, permitidos) ? u : null;
    };
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComPerfil: comPerfil(obterUsuarioCmsMock),
    obterUsuarioAutenticadoComPerfil: comPerfil(obterUsuarioAutenticadoMock),
  };
});

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { carregarOpcoesPalestrante, salvarPalestrante } = await import("./acoes");

const superAdmin = { id: 1, nome: "Ana", perfil: "super-admin" };
const editorEventos = { id: 2, nome: "Iara", perfil: "editor-eventos" };

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
    ["com perfil editor-eventos", editorEventos],
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
    obterUsuarioAutenticadoMock.mockResolvedValue(superAdmin);
    const r = await salvarPalestrante(formulario(json));
    expect(r).toEqual({ resultado: { ok: false, erro: "Dados do formulário inválidos." }, palestrante: null });
    nenhumaEscrita();
  });

  it("id não numérico → dados inválidos", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(superAdmin);
    const r = await salvarPalestrante(formulario(JSON.stringify(campos), "12; drop"));
    expect(r.resultado).toEqual({ ok: false, erro: "Dados do formulário inválidos." });
    nenhumaEscrita();
  });

  it("com super-admin e id vazio, cria e devolve o detalhe recarregado", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(superAdmin);
    create.mockImplementation(async (args: { collection: string }) =>
      args.collection === "media" ? { id: 90 } : { id: 42 },
    );
    findGlobal.mockResolvedValue({ cards: [{ formato: "expert", especialista: 1, id: "c1" }] });
    findByID.mockResolvedValue({ id: 42, nome: "Ana Souza", slug: "ana-souza", titulacao: "doutorado" });

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

describe("carregarOpcoesPalestrante (Server Action)", () => {
  it("sem sessão, devolve listas vazias sem ler o banco", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);
    expect(await carregarOpcoesPalestrante()).toEqual({ areas: [], programas: [] });
    expect(find).not.toHaveBeenCalled();
  });

  it("com sessão, devolve áreas e programas", async () => {
    obterUsuarioCmsMock.mockResolvedValue(superAdmin);
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
