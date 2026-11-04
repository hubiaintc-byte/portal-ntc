import { beforeEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  COOKIE_SESSAO: "payload-token",
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
}));

const logoutOperationMock = vi.fn();
vi.mock("payload", async (original) => ({
  ...(await original<typeof import("payload")>()),
  createLocalReq: vi.fn().mockResolvedValue({}),
  logoutOperation: logoutOperationMock,
}));

const salvarInscricaoMock = vi.fn();
const removerInscricaoMock = vi.fn();
vi.mock("@/lib/cms/inscricoesAviso", () => ({
  salvarInscricao: salvarInscricaoMock,
  removerInscricao: removerInscricaoMock,
}));

vi.mock("@/lib/payloadClient", () => ({ obterPayload: vi.fn().mockResolvedValue({ collections: { users: {} } }) }));
const apagarCookieMock = vi.fn();
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ delete: apagarCookieMock })), headers: vi.fn() }));
const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/cms/painelPasskeys", () => ({}));

const { ativarAvisosCms, desativarAvisosCms, chaveAvisosCms, sair } = await import("./acoesAuth");

const dados = { endpoint: "https://push.exemplo/a", p256dh: "k", auth: "a" };
const SESSAO = { ok: false, erro: "Sessão expirada. Entre novamente." };

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("avisos — sem sessão", () => {
  beforeEach(() => obterUsuarioCmsMock.mockResolvedValue(null));

  it("ativar e desativar recusam sem tocar na coleção", async () => {
    expect(await ativarAvisosCms(dados)).toEqual(SESSAO);
    expect(await desativarAvisosCms(dados.endpoint)).toEqual(SESSAO);
    expect(salvarInscricaoMock).not.toHaveBeenCalled();
    expect(removerInscricaoMock).not.toHaveBeenCalled();
  });

  it("a chave pública não é entregue", async () => {
    vi.stubEnv("VAPID_PUBLIC_KEY", "pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
    expect(await chaveAvisosCms()).toBeNull();
  });
});

describe("avisos — com sessão", () => {
  beforeEach(() => obterUsuarioCmsMock.mockResolvedValue({ id: "9" }));

  it("usa o id da sessão, nunca um vindo do cliente", async () => {
    salvarInscricaoMock.mockResolvedValue({ ok: true });
    removerInscricaoMock.mockResolvedValue({ ok: true });
    await ativarAvisosCms(dados);
    await desativarAvisosCms(dados.endpoint);
    expect(salvarInscricaoMock).toHaveBeenCalledWith("9", dados);
    expect(removerInscricaoMock).toHaveBeenCalledWith("9", dados.endpoint);
  });

  it("chave: devolve a pública, ou null sem VAPID configurado", async () => {
    vi.stubEnv("VAPID_PUBLIC_KEY", "pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
    expect(await chaveAvisosCms()).toBe("pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    expect(await chaveAvisosCms()).toBeNull();
  });
});

describe("sair — inscrição deste aparelho", () => {
  function comEndpoint(endpoint: string): FormData {
    const fd = new FormData();
    fd.set("endpoint", endpoint);
    return fd;
  }

  beforeEach(() => {
    obterUsuarioCmsMock.mockResolvedValue({ id: "9" });
    obterUsuarioAutenticadoMock.mockResolvedValue({ id: "9" });
  });

  it("remove a inscrição do usuário da sessão antes de encerrar a sessão", async () => {
    removerInscricaoMock.mockResolvedValue({ ok: true });
    await sair(comEndpoint(dados.endpoint));
    expect(removerInscricaoMock).toHaveBeenCalledWith("9", dados.endpoint);
    const ordemRemocao = removerInscricaoMock.mock.invocationCallOrder[0]!;
    expect(ordemRemocao).toBeLessThan(logoutOperationMock.mock.invocationCallOrder[0]!);
    expect(ordemRemocao).toBeLessThan(apagarCookieMock.mock.invocationCallOrder[0]!);
    expect(redirectMock).toHaveBeenCalledWith("/entrar");
  });

  it("falha ao remover a inscrição não impede o logout", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    removerInscricaoMock.mockRejectedValue(new Error("banco fora"));
    await sair(comEndpoint(dados.endpoint));
    expect(apagarCookieMock).toHaveBeenCalledWith("payload-token");
    expect(redirectMock).toHaveBeenCalledWith("/entrar");
    erro.mockRestore();
  });

  it("sem endpoint, não toca nas inscrições", async () => {
    await sair(new FormData());
    expect(removerInscricaoMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/entrar");
  });
});
