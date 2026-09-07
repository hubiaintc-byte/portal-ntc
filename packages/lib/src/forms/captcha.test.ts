import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verificarCaptcha } from "./captcha";

describe("verificarCaptcha", () => {
  beforeEach(() => {
    process.env.CAPTCHA_ENABLED = "true";
    process.env.TURNSTILE_SECRET = "segredo-de-teste";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CAPTCHA_ENABLED;
    delete process.env.TURNSTILE_SECRET;
  });

  it("desligado por flag: libera sem chamar o provedor", async () => {
    process.env.CAPTCHA_ENABLED = "false";
    const f = vi.spyOn(globalThis, "fetch");
    expect(await verificarCaptcha(undefined)).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it("ligado sem token: rejeita sem chamar o provedor", async () => {
    const f = vi.spyOn(globalThis, "fetch");
    expect(await verificarCaptcha(undefined)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("ligado sem TURNSTILE_SECRET: rejeita e loga (falha fechada)", async () => {
    delete process.env.TURNSTILE_SECRET;
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verificarCaptcha("token-qualquer")).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });

  it("provedor aprova: retorna true e envia secret + response", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    expect(await verificarCaptcha("tok-123", "9.9.9.9")).toBe(true);
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const corpo = init.body as URLSearchParams;
    expect(corpo.get("secret")).toBe("segredo-de-teste");
    expect(corpo.get("response")).toBe("tok-123");
    expect(corpo.get("remoteip")).toBe("9.9.9.9");
  });

  it("provedor reprova: retorna false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
        status: 200,
      }),
    );
    expect(await verificarCaptcha("tok-ruim")).toBe(false);
  });

  it("provedor fora do ar: rejeita e loga, nunca libera", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("timeout"));
    expect(await verificarCaptcha("tok-123")).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });

  it("resposta HTTP não-2xx: rejeita", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("erro", { status: 500 }));
    expect(await verificarCaptcha("tok-123")).toBe(false);
  });
});
