import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const montarOpcoesRegistroMock = vi.fn();
const conferirRegistroMock = vi.fn();
const montarOpcoesAutenticacaoMock = vi.fn();
const conferirAutenticacaoMock = vi.fn();
vi.mock("@/lib/passkeys/webauthn", () => ({
  montarOpcoesRegistro: montarOpcoesRegistroMock,
  conferirRegistro: conferirRegistroMock,
  montarOpcoesAutenticacao: montarOpcoesAutenticacaoMock,
  conferirAutenticacao: conferirAutenticacaoMock,
}));

const assinarTokenDesafioMock = vi.fn();
const verificarTokenDesafioMock = vi.fn();
vi.mock("@/lib/passkeys/tokens", () => ({
  assinarTokenDesafio: assinarTokenDesafioMock,
  verificarTokenDesafio: verificarTokenDesafioMock,
}));

const {
  listarPasskeysDoUsuario,
  prepararCadastroPasskey,
  confirmarCadastroPasskey,
  removerPasskey,
  prepararLoginPasskey,
  confirmarLoginPasskey,
} = await import("./painelPasskeys");

function montarPayloadFalso(overrides: Record<string, unknown> = {}) {
  const payloadFalso = {
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    findByID: vi.fn(),
    ...overrides,
  };
  obterPayloadMock.mockResolvedValue(payloadFalso);
  return payloadFalso;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("listarPasskeysDoUsuario", () => {
  it("mapeia os documentos pro resumo público (sem credentialId/publicKey)", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 7,
            apelido: "MacBook do Jotta",
            createdAt: "2026-09-01T10:00:00.000Z",
            ultimoUsoEm: null,
          },
        ],
      }),
    });
    const resultado = await listarPasskeysDoUsuario("42");
    expect(resultado).toEqual([
      { id: "7", apelido: "MacBook do Jotta", criadoEm: "2026-09-01T10:00:00.000Z", ultimoUsoEm: null },
    ]);
  });
});

describe("prepararCadastroPasskey / confirmarCadastroPasskey", () => {
  it("prepara opções excluindo credenciais já existentes e devolve token de desafio", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({ docs: [{ credentialId: "cred-1", transports: ["internal"] }] }),
    });
    montarOpcoesRegistroMock.mockResolvedValue({
      opcoes: { challenge: "novo-desafio" },
      challenge: "novo-desafio",
    });
    assinarTokenDesafioMock.mockResolvedValue("token-assinado");

    const resultado = await prepararCadastroPasskey("42", "contato@institutontc.com.br", "Jotta");

    expect(montarOpcoesRegistroMock).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: "42",
        credenciaisExistentes: [{ credentialId: "cred-1", transports: ["internal"] }],
      }),
    );
    expect(resultado).toEqual({ opcoes: { challenge: "novo-desafio" }, tokenDesafio: "token-assinado" });
  });

  it("confirmarCadastroPasskey rejeita token de desafio inválido sem chamar a Local API", async () => {
    verificarTokenDesafioMock.mockResolvedValue(null);
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-invalido",
      "Apelido",
    );

    expect(resultado.ok).toBe(false);
    expect(payloadFalso.create).not.toHaveBeenCalled();
  });

  it("confirmarCadastroPasskey rejeita quando o userId do token não bate com o usuário atual", async () => {
    verificarTokenDesafioMock.mockResolvedValue({ userId: "outro-usuario", challenge: "abc" });
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-de-outro-usuario",
      "Apelido",
    );

    expect(resultado.ok).toBe(false);
    expect(payloadFalso.create).not.toHaveBeenCalled();
  });

  it("confirmarCadastroPasskey salva a credencial verificada vinculada ao usuário", async () => {
    verificarTokenDesafioMock.mockResolvedValue({ userId: "42", challenge: "abc" });
    conferirRegistroMock.mockResolvedValue({
      credentialId: "novo-cred",
      publicKeyBase64: "base64==",
      counter: 0,
      transports: ["internal"],
    });
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-valido",
      "MacBook do Jotta",
    );

    expect(resultado.ok).toBe(true);
    expect(payloadFalso.create).toHaveBeenCalledWith({
      collection: "passkeys",
      data: {
        usuario: 42,
        apelido: "MacBook do Jotta",
        credentialId: "novo-cred",
        publicKey: "base64==",
        counter: 0,
        transports: ["internal"],
      },
      overrideAccess: true,
    });
  });
});

describe("removerPasskey", () => {
  it("dono remove o próprio passkey", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "42", false);
    expect(resultado.ok).toBe(true);
    expect(payloadFalso.delete).toHaveBeenCalledWith({
      collection: "passkeys",
      id: "7",
      overrideAccess: true,
    });
  });

  it("não-dono e não-super-admin não consegue remover", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "99", false);
    expect(resultado.ok).toBe(false);
    expect(payloadFalso.delete).not.toHaveBeenCalled();
  });

  it("super-admin remove o passkey de qualquer usuário", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "99", true);
    expect(resultado.ok).toBe(true);
    expect(payloadFalso.delete).toHaveBeenCalled();
  });
});

describe("prepararLoginPasskey", () => {
  it("devolve null quando o usuário não tem nenhum passkey", async () => {
    montarPayloadFalso({ find: vi.fn().mockResolvedValue({ docs: [] }) });
    expect(await prepararLoginPasskey("42")).toBeNull();
  });

  it("monta opções restritas às credenciais do usuário quando ele tem passkey", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({ docs: [{ credentialId: "cred-1", transports: ["internal"] }] }),
    });
    montarOpcoesAutenticacaoMock.mockResolvedValue({
      opcoes: { challenge: "desafio-login" },
      challenge: "desafio-login",
    });
    const resultado = await prepararLoginPasskey("42");
    expect(resultado).toEqual({ opcoes: { challenge: "desafio-login" }, challenge: "desafio-login" });
  });
});

describe("confirmarLoginPasskey", () => {
  it("false quando a credencial não é encontrada", async () => {
    montarPayloadFalso({ find: vi.fn().mockResolvedValue({ docs: [] }) });
    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-inexistente" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );
    expect(ok).toBe(false);
  });

  it("true e atualiza counter/ultimoUsoEm quando a verificação passa", async () => {
    const payloadFalso = montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 7, credentialId: "cred-1", publicKey: "b64", counter: 5, transports: [] }],
      }),
    });
    conferirAutenticacaoMock.mockResolvedValue({ novoContador: 6 });

    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-1" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );

    expect(ok).toBe(true);
    expect(payloadFalso.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "passkeys",
        id: 7,
        data: expect.objectContaining({ counter: 6 }),
        overrideAccess: true,
      }),
    );
  });

  it("false quando conferirAutenticacao rejeita (ex.: contador não avançou)", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 7, credentialId: "cred-1", publicKey: "b64", counter: 5, transports: [] }],
      }),
    });
    conferirAutenticacaoMock.mockResolvedValue(null);

    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-1" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );
    expect(ok).toBe(false);
  });
});
