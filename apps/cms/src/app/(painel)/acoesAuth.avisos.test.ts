import { beforeEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  COOKIE_SESSAO: "payload-token",
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: vi.fn(),
}));

const salvarInscricaoMock = vi.fn();
const removerInscricaoMock = vi.fn();
vi.mock("@/lib/cms/inscricoesAviso", () => ({
  salvarInscricao: salvarInscricaoMock,
  removerInscricao: removerInscricaoMock,
}));

vi.mock("@/lib/payloadClient", () => ({ obterPayload: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/cms/painelPasskeys", () => ({}));

const { ativarAvisosCms, desativarAvisosCms, chaveAvisosCms } = await import("./acoesAuth");

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
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "pub");
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
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
    expect(await chaveAvisosCms()).toBe("pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    expect(await chaveAvisosCms()).toBeNull();
  });
});
