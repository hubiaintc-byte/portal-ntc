import { afterEach, describe, expect, it, vi } from "vitest";

/** Gate da Server Action de criação de evento em branco (sessão + tela). */
const create = vi.fn();
const findByID = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update: vi.fn(), find: vi.fn(), findByID, delete: vi.fn() }),
}));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temTela, acessoDoUsuario } = await import("@/lib/cms/telas");
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: vi.fn(),
    obterUsuarioCmsComTela: async (telas: Parameters<typeof temTela>[1]) => {
      const u = await obterUsuarioCmsMock();
      return u && temTela(acessoDoUsuario(u), telas) ? u : null;
    },
  };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const revalidarProgramasDoEventoMock = vi.fn(async () => true);
const programaPublicadoDoEventoMock = vi.fn(async () => "8" as string | null);
vi.mock("@/lib/cms/revalidarSite", () => ({
  revalidarProgramasDoEvento: revalidarProgramasDoEventoMock,
  programaPublicadoDoEvento: programaPublicadoDoEventoMock,
  AVISO_REVALIDACAO_SITE: "Salvo, mas a atualização no site pode levar alguns minutos.",
}));

const { alternarPublicacaoEvento, carregarEvento, criarEventoEmBranco } = await import("./acoes");

afterEach(() => {
  vi.clearAllMocks();
});

describe("criarEventoEmBranco (Server Action)", () => {
  it("sem sessão, recusa antes de tocar a Local API", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);
    const r = await criarEventoEmBranco();
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("só com site.palestrantes (sem site.eventos), recusa", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: "1", nome: "A", administrador: false, telas: ["site.palestrantes"] });
    const r = await criarEventoEmBranco();
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("com site.eventos, cria o rascunho", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: "2", nome: "B", administrador: false, telas: ["site.eventos"] });
    create.mockResolvedValue({ id: 8 });
    const r = await criarEventoEmBranco();
    expect(r).toEqual({ ok: true, id: "8" });
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("carregarEvento (Server Action)", () => {
  it("quem não tem a tela Eventos recebe null sem ler o banco", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 3, administrador: false, telas: ["site.palestrantes"] });
    expect(await carregarEvento("9")).toBeNull();
    expect(findByID).not.toHaveBeenCalled();
  });

  it("quem tem a tela Eventos lê o evento", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 4, administrador: false, telas: ["site.eventos"] });
    findByID.mockResolvedValue(null);
    expect(await carregarEvento("9")).toBeNull();
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: "eventos", id: "9" }));
  });
});

describe("alternarPublicacaoEvento revalida a página do programa do evento", () => {
  it("publicar e despublicar pedem a revalidação do programa", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 1, administrador: false, telas: ["site.eventos"] });
    findByID.mockResolvedValue(null);
    const r = await alternarPublicacaoEvento("12", true);
    expect(r.resultado).toEqual({ ok: true });
    await alternarPublicacaoEvento("12", false);
    expect(revalidarProgramasDoEventoMock).toHaveBeenCalledTimes(2);
    // O programa da versão publicada é lido antes e também revalidado (troca de programa).
    expect(revalidarProgramasDoEventoMock).toHaveBeenCalledWith(expect.anything(), "12", ["8"]);
  });

  it("falha na revalidação vira aviso, nunca erro", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 1, administrador: false, telas: ["site.eventos"] });
    findByID.mockResolvedValue(null);
    revalidarProgramasDoEventoMock.mockResolvedValueOnce(false);
    const r = await alternarPublicacaoEvento("12", true);
    expect(r.resultado).toEqual({ ok: true, aviso: "Salvo, mas a atualização no site pode levar alguns minutos." });
  });

  it("revalidação que lança também vira aviso", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 1, administrador: false, telas: ["site.eventos"] });
    findByID.mockResolvedValue(null);
    revalidarProgramasDoEventoMock.mockRejectedValueOnce(new Error("banco fora"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await alternarPublicacaoEvento("12", false);
    expect(r.resultado).toEqual({ ok: true, aviso: "Salvo, mas a atualização no site pode levar alguns minutos." });
  });

  it("sem a tela Eventos não publica nem revalida", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: 1, administrador: false, telas: ["site.home"] });
    await alternarPublicacaoEvento("12", true);
    expect(revalidarProgramasDoEventoMock).not.toHaveBeenCalled();
  });
});
