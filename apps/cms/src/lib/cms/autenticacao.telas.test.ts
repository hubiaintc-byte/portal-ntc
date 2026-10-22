import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ auth: authMock }) }));

let token: string | undefined = "tok";
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (token ? { value: token } : undefined) }),
}));

const redirectMock = vi.fn((destino: string) => {
  throw new Error(`REDIRECT:${destino}`);
});
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const {
  obterUsuarioCmsComTela,
  obterUsuarioAutenticadoComTela,
  obterAdministrador,
  obterAdministradorAutenticado,
  exigirTela,
  exigirAdministrador,
} = await import("./autenticacao");

function sessao(extra: Record<string, unknown>) {
  authMock.mockResolvedValue({
    user: { collection: "users", id: 1, nome: "Ana", email: "a@x.br", ...extra },
  });
}

beforeEach(() => {
  token = "tok";
  authMock.mockReset();
  redirectMock.mockClear();
});

describe("guardas por tela", () => {
  it("devolve o usuário que tem a tela", async () => {
    sessao({ administrador: false, telas: ["crm.leads"] });
    const u = await obterUsuarioCmsComTela(["crm.leads"]);
    expect(u?.id).toBe("1");
    expect(u?.acesso).toEqual({ administrador: false, telas: ["crm.leads"] });
  });

  it("recusa usuário sem a tela", async () => {
    sessao({ administrador: false, telas: ["crm.leads"] });
    expect(await obterUsuarioCmsComTela(["crm.clientes"])).toBeNull();
    expect(await obterUsuarioAutenticadoComTela(["crm.clientes"])).toBeNull();
  });

  it("administrador passa em qualquer tela", async () => {
    sessao({ administrador: true, telas: [] });
    expect(await obterUsuarioCmsComTela(["crm.clientes"])).not.toBeNull();
    expect(await obterUsuarioAutenticadoComTela(["site.home"])).not.toBeNull();
  });

  it("sem sessão devolve null", async () => {
    token = undefined;
    expect(await obterUsuarioCmsComTela(["crm.leads"])).toBeNull();
    authMock.mockResolvedValue({ user: null });
    token = "tok";
    expect(await obterUsuarioCmsComTela(["crm.leads"])).toBeNull();
  });

  it("administrador: só quem é administrador", async () => {
    sessao({ administrador: false, telas: ["crm.leads"] });
    expect(await obterAdministrador()).toBeNull();
    expect(await obterAdministradorAutenticado()).toBeNull();
    sessao({ administrador: true });
    expect(await obterAdministrador()).not.toBeNull();
    expect(await obterAdministradorAutenticado()).not.toBeNull();
  });

  it("exigirTela redireciona: sem sessão para /entrar, sem tela para /", async () => {
    token = undefined;
    await expect(exigirTela(["crm.leads"])).rejects.toThrow("REDIRECT:/entrar");
    token = "tok";
    sessao({ administrador: false, telas: [] });
    await expect(exigirTela(["crm.leads"])).rejects.toThrow("REDIRECT:/");
    sessao({ administrador: false, telas: ["crm.leads"] });
    await expect(exigirTela(["crm.leads"])).resolves.toMatchObject({ id: "1" });
  });

  it("exigirAdministrador redireciona para / quem não é administrador", async () => {
    sessao({ administrador: false, telas: ["crm.leads"] });
    await expect(exigirAdministrador()).rejects.toThrow("REDIRECT:/");
    sessao({ administrador: true });
    await expect(exigirAdministrador()).resolves.toMatchObject({ id: "1" });
  });
});
