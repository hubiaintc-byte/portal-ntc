import { describe, expect, it, vi } from "vitest";

import {
  criarUsuario,
  editarUsuario,
  gerarSenhaAleatoria,
  listarUsuarios,
  removerUsuario,
  type PayloadUsuarios,
} from "./painelCmsUsuarios";

function mockPayload(
  usuarios: { id: string | number; nome: string; email: string; perfil: string; updatedAt: string }[],
): PayloadUsuarios & {
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  forgotPassword: ReturnType<typeof vi.fn>;
  sendEmail: ReturnType<typeof vi.fn>;
} {
  return {
    find: vi.fn().mockResolvedValue({ docs: usuarios }),
    create: vi.fn().mockResolvedValue({ id: "novo-1" }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    forgotPassword: vi.fn().mockResolvedValue("token-abc"),
    sendEmail: vi.fn().mockResolvedValue({}),
  };
}

describe("gerarSenhaAleatoria", () => {
  it("gera senha com 24 caracteres do alfabeto esperado", () => {
    const senha = gerarSenhaAleatoria();
    expect(senha).toHaveLength(24);
    expect(senha).toMatch(/^[A-Za-z0-9!@#$%]{24}$/);
  });

  it("varia entre chamadas", () => {
    const a = gerarSenhaAleatoria();
    const b = gerarSenhaAleatoria();
    expect(a).not.toBe(b);
  });
});

describe("listarUsuarios", () => {
  it("mapeia os docs do Payload para o resumo", async () => {
    const payload = mockPayload([
      { id: 1, nome: "Ana", email: "ana@ntc.org", perfil: "super-admin", updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await listarUsuarios(payload);
    expect(r).toEqual([
      { id: "1", nome: "Ana", email: "ana@ntc.org", perfil: "super-admin", atualizadoEm: "2026-07-01T00:00:00.000Z" },
    ]);
  });
});

describe("criarUsuario", () => {
  const dados = { nome: "Bruno", email: "bruno@ntc.org", perfil: "editor-institucional" };

  it("cria com senha aleatória, dispara forgotPassword e envia e-mail com o token", async () => {
    const payload = mockPayload([]);
    const r = await criarUsuario(payload, dados);

    expect(r.ok).toBe(true);
    expect(payload.create).toHaveBeenCalledTimes(1);
    const dataCriada = payload.create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(dataCriada.nome).toBe("Bruno");
    expect(dataCriada.email).toBe("bruno@ntc.org");
    expect(dataCriada.perfil).toBe("editor-institucional");
    expect(typeof dataCriada.password).toBe("string");
    expect((dataCriada.password as string).length).toBe(24);

    expect(payload.forgotPassword).toHaveBeenCalledTimes(1);
    expect(payload.forgotPassword).toHaveBeenCalledWith({
      collection: "users",
      data: { email: "bruno@ntc.org" },
      disableEmail: true,
    });

    expect(payload.sendEmail).toHaveBeenCalledTimes(1);
    const envio = payload.sendEmail.mock.calls[0]?.[0] as { to: string; html: string };
    expect(envio.to).toBe("bruno@ntc.org");
    expect(envio.html).toContain("token-abc");
  });

  it("e-mail duplicado gera erro claro", async () => {
    const payload = mockPayload([]);
    payload.create.mockRejectedValue(new Error("E-mail already registered (email)"));
    const r = await criarUsuario(payload, dados);
    expect(r).toEqual({ ok: false, erro: "Já existe usuário com este e-mail." });
    expect(payload.forgotPassword).not.toHaveBeenCalled();
  });

  it("falha apenas no envio do e-mail ainda retorna ok (usuário já existe no banco)", async () => {
    const payload = mockPayload([]);
    payload.sendEmail.mockRejectedValue(new Error("Resend fora do ar"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await criarUsuario(payload, dados);
    expect(r.ok).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("editarUsuario", () => {
  it("atualiza nome e perfil", async () => {
    const payload = mockPayload([]);
    const r = await editarUsuario(payload, "5", { nome: "Carla", perfil: "editor-eventos" });
    expect(r.ok).toBe(true);
    expect(payload.update).toHaveBeenCalledWith({
      collection: "users",
      id: "5",
      data: { nome: "Carla", perfil: "editor-eventos" },
      overrideAccess: true,
    });
  });
});

describe("removerUsuario", () => {
  it("bloqueia remover a si mesmo", async () => {
    const payload = mockPayload([]);
    const r = await removerUsuario(payload, "1", "1");
    expect(r).toEqual({ ok: false, erro: "Você não pode remover a si mesmo." });
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("bloqueia remover o último super-admin", async () => {
    const payload = mockPayload([
      { id: 2, nome: "Único", email: "unico@ntc.org", perfil: "super-admin", updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r).toEqual({ ok: false, erro: "Não é possível remover o último super-administrador." });
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("remove quando há outro super-admin", async () => {
    const payload = mockPayload([
      { id: 2, nome: "A", email: "a@ntc.org", perfil: "super-admin", updatedAt: "2026-07-01T00:00:00.000Z" },
      { id: 3, nome: "B", email: "b@ntc.org", perfil: "super-admin", updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r.ok).toBe(true);
    expect(payload.delete).toHaveBeenCalledWith({ collection: "users", id: "2", overrideAccess: true });
  });

  it("remove normalmente um perfil não super-admin", async () => {
    const payload = mockPayload([
      { id: 2, nome: "A", email: "a@ntc.org", perfil: "editor-institucional", updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r.ok).toBe(true);
    expect(payload.delete).toHaveBeenCalledWith({ collection: "users", id: "2", overrideAccess: true });
  });
});
