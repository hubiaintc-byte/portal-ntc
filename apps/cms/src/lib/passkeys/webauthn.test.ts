// apps/cms/src/lib/passkeys/webauthn.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./rp", () => ({
  obterConfigRp: () => ({
    rpID: "localhost",
    rpName: "Painel Admin NTC",
    origin: "http://localhost:3001",
  }),
}));

describe("montarOpcoesRegistro", () => {
  it("gera opções com o usuário e exclui credenciais já cadastradas", async () => {
    const { montarOpcoesRegistro } = await import("./webauthn");
    const { opcoes, challenge } = await montarOpcoesRegistro({
      usuarioId: "42",
      emailUsuario: "contato@institutontc.com.br",
      nomeUsuario: "Jotta",
      credenciaisExistentes: [{ credentialId: "cred-existente", transports: ["internal"] }],
    });
    expect(opcoes.rp.id).toBe("localhost");
    expect(opcoes.rp.name).toBe("Painel Admin NTC");
    expect(opcoes.user.name).toBe("contato@institutontc.com.br");
    expect(opcoes.excludeCredentials).toEqual([{ id: "cred-existente", transports: ["internal"], type: "public-key" }]);
    expect(opcoes.challenge).toBe(challenge);
    expect(typeof challenge).toBe("string");
    expect(challenge.length).toBeGreaterThan(10);
  });
});

describe("montarOpcoesAutenticacao", () => {
  it("gera opções restritas às credenciais permitidas", async () => {
    const { montarOpcoesAutenticacao } = await import("./webauthn");
    const { opcoes, challenge } = await montarOpcoesAutenticacao({
      credenciaisPermitidas: [{ credentialId: "cred-1", transports: ["internal", "hybrid"] }],
    });
    expect(opcoes.rpId).toBe("localhost");
    expect(opcoes.allowCredentials).toEqual([{ id: "cred-1", transports: ["internal", "hybrid"], type: "public-key" }]);
    expect(opcoes.challenge).toBe(challenge);
  });
});

describe("conferirRegistro", () => {
  beforeEach(() => {
    vi.doMock("@simplewebauthn/server", async () => {
      const real = await vi.importActual<typeof import("@simplewebauthn/server")>(
        "@simplewebauthn/server",
      );
      return { ...real, verifyRegistrationResponse: vi.fn() };
    });
  });

  it("devolve null quando a verificação falha (verified: false)", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyRegistrationResponse).mockResolvedValue({
      verified: false,
    } as Awaited<ReturnType<typeof modulo.verifyRegistrationResponse>>);
    const { conferirRegistro } = await import("./webauthn");
    const resultado = await conferirRegistro({
      resposta: {} as Parameters<typeof conferirRegistro>[0]["resposta"],
      challenge: "abc",
    });
    expect(resultado).toBeNull();
  });

  it("extrai credentialId/publicKey/counter/transports quando verificado", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyRegistrationResponse).mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: "novo-credential-id",
          publicKey: new Uint8Array([1, 2, 3, 4]),
          counter: 0,
          transports: ["internal"],
        },
      },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyRegistrationResponse>>);
    const { conferirRegistro } = await import("./webauthn");
    const resultado = await conferirRegistro({
      resposta: {} as Parameters<typeof conferirRegistro>[0]["resposta"],
      challenge: "abc",
    });
    expect(resultado).toEqual({
      credentialId: "novo-credential-id",
      publicKeyBase64: Buffer.from([1, 2, 3, 4]).toString("base64"),
      counter: 0,
      transports: ["internal"],
    });
  });
});

describe("conferirAutenticacao", () => {
  beforeEach(() => {
    vi.doMock("@simplewebauthn/server", async () => {
      const real = await vi.importActual<typeof import("@simplewebauthn/server")>(
        "@simplewebauthn/server",
      );
      return { ...real, verifyAuthenticationResponse: vi.fn() };
    });
  });

  it("devolve null quando o contador não avança (indício de clonagem)", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 5 },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyAuthenticationResponse>>);
    const { conferirAutenticacao } = await import("./webauthn");
    const resultado = await conferirAutenticacao({
      resposta: {} as Parameters<typeof conferirAutenticacao>[0]["resposta"],
      challenge: "abc",
      credentialIdEsperado: "cred-1",
      publicKeyBase64: Buffer.from([1, 2, 3]).toString("base64"),
      counterAtual: 5, // igual ao newCounter -> não avançou -> rejeita
    });
    expect(resultado).toBeNull();
  });

  it("devolve o novo contador quando avançou e verificou", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 6 },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyAuthenticationResponse>>);
    const { conferirAutenticacao } = await import("./webauthn");
    const resultado = await conferirAutenticacao({
      resposta: {} as Parameters<typeof conferirAutenticacao>[0]["resposta"],
      challenge: "abc",
      credentialIdEsperado: "cred-1",
      publicKeyBase64: Buffer.from([1, 2, 3]).toString("base64"),
      counterAtual: 5,
    });
    expect(resultado).toEqual({ novoContador: 6 });
  });
});
