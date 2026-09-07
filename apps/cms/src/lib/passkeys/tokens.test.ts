// apps/cms/src/lib/passkeys/tokens.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("tokens de ponte (login) — cifrados", () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = "segredo-de-teste-bem-longo-0123456789";
  });

  it("cifra e decifra as claims corretamente", async () => {
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const claims = {
      userId: "42",
      sessaoReal: "jwt.da.sessao.real",
      challenge: "abc123",
      manter: true,
    };
    const token = await cifrarTokenPonte(claims);
    const decifradas = await decifrarTokenPonte(token);
    expect(decifradas).toEqual(claims);
  });

  it("um JWT comum (jose.decodeJwt) não consegue ler as claims do token de ponte", async () => {
    const { cifrarTokenPonte } = await import("./tokens");
    const { decodeJwt } = await import("jose");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "segredo-nao-pode-vazar",
      challenge: "abc123",
      manter: false,
    });
    expect(() => decodeJwt(token)).toThrow();
  });

  it("token expirado devolve null, não lança", async () => {
    vi.useFakeTimers();
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "x",
      challenge: "y",
      manter: false,
    });
    vi.setSystemTime(Date.now() + 6 * 60 * 1000); // +6min, token de ponte expira em 5min
    const resultado = await decifrarTokenPonte(token);
    expect(resultado).toBeNull();
    vi.useRealTimers();
  });

  it("token adulterado devolve null, não lança", async () => {
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "x",
      challenge: "y",
      manter: false,
    });
    const adulterado = token.slice(0, -4) + "XXXX";
    expect(await decifrarTokenPonte(adulterado)).toBeNull();
  });
});

describe("tokens de desafio (cadastro) — assinados", () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = "segredo-de-teste-bem-longo-0123456789";
  });

  it("assina e verifica as claims corretamente", async () => {
    const { assinarTokenDesafio, verificarTokenDesafio } = await import("./tokens");
    const claims = { userId: "42", challenge: "desafio-abc" };
    const token = await assinarTokenDesafio(claims);
    expect(await verificarTokenDesafio(token)).toEqual(claims);
  });

  it("token de desafio expirado devolve null", async () => {
    vi.useFakeTimers();
    const { assinarTokenDesafio, verificarTokenDesafio } = await import("./tokens");
    const token = await assinarTokenDesafio({ userId: "42", challenge: "y" });
    vi.setSystemTime(Date.now() + 6 * 60 * 1000);
    expect(await verificarTokenDesafio(token)).toBeNull();
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
