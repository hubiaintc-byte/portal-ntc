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

const { carregarEvento, criarEventoEmBranco } = await import("./acoes");

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
