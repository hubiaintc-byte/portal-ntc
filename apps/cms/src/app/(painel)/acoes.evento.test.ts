import { afterEach, describe, expect, it, vi } from "vitest";

/** Gate da Server Action de criação de evento em branco (sessão + perfil). */
const create = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update: vi.fn(), find: vi.fn(), findByID: vi.fn(), delete: vi.fn() }),
}));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temPerfil } = await import("@/lib/cms/perfis");
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: vi.fn(),
    obterUsuarioCmsComPerfil: async (permitidos: readonly string[]) => {
      const u = await obterUsuarioCmsMock();
      return u && temPerfil(u.perfil, permitidos as never) ? u : null;
    },
  };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { criarEventoEmBranco } = await import("./acoes");

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

  it("com perfil atendimento-comercial, recusa", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: "1", nome: "A", perfil: "atendimento-comercial" });
    const r = await criarEventoEmBranco();
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("com editor-eventos, cria o rascunho", async () => {
    obterUsuarioCmsMock.mockResolvedValue({ id: "2", nome: "B", perfil: "editor-eventos" });
    create.mockResolvedValue({ id: 8 });
    const r = await criarEventoEmBranco();
    expect(r).toEqual({ ok: true, id: "8" });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
