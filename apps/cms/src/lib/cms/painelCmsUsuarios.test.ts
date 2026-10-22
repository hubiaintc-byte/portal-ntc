import { describe, expect, it, vi } from "vitest";

import {
  criarUsuario,
  editarUsuario,
  gerarSenhaAleatoria,
  listarUsuarios,
  reenviarConvite,
  removerUsuario,
  type PayloadUsuarios,
  type UsuarioGestaoResumo,
} from "./painelCmsUsuarios";

function mockPayload(
  usuarios: { id: string | number; nome: string; email: string; administrador?: boolean; telas?: string[]; updatedAt: string }[],
): PayloadUsuarios & {
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  forgotPassword: ReturnType<typeof vi.fn>;
  findByID: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  sendEmail: ReturnType<typeof vi.fn>;
} {
  return {
    find: vi.fn().mockResolvedValue({ docs: usuarios }),
    create: vi.fn().mockResolvedValue({ id: "novo-1" }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    findByID: vi.fn(async ({ id }: { id: string | number }) => usuarios.find((u) => String(u.id) === String(id)) ?? null),
    count: vi.fn(async () => ({ totalDocs: usuarios.filter((u) => u.administrador === true).length })),
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
      { id: 1, nome: "Ana", email: "ana@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r: UsuarioGestaoResumo[] = await listarUsuarios(payload);
    expect(r).toEqual([
      { id: "1", nome: "Ana", email: "ana@ntc.org", administrador: true, telas: [], atualizadoEm: "2026-07-01T00:00:00.000Z" },
    ]);
  });
});

describe("criarUsuario", () => {
  const dados = { nome: "Bruno", email: "bruno@ntc.org", administrador: false, telas: ["site.eventos" as const, "crm.leads" as const] };

  it("cria com senha aleatória, dispara forgotPassword e envia e-mail com o token", async () => {
    const payload = mockPayload([]);
    const r = await criarUsuario(payload, dados);

    expect(r.ok).toBe(true);
    expect(payload.create).toHaveBeenCalledTimes(1);
    const dataCriada = payload.create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(dataCriada.nome).toBe("Bruno");
    expect(dataCriada.email).toBe("bruno@ntc.org");
    expect(dataCriada.administrador).toBe(false);
    expect(dataCriada.telas).toEqual(["site.eventos", "crm.leads"]);
    // null explícito: não herda o defaultValue legado do campo oculto.
    expect(dataCriada.perfil).toBeNull();
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

  it("falha apenas no envio do e-mail retorna ok com aviso (usuário já existe no banco)", async () => {
    const payload = mockPayload([]);
    payload.sendEmail.mockRejectedValue(new Error("Resend fora do ar"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await criarUsuario(payload, dados);
    expect(r.ok).toBe(true);
    expect(r.aviso).toBe('Usuário criado, mas o e-mail de convite falhou — use "Reenviar convite".');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("sucesso completo não traz aviso", async () => {
    const payload = mockPayload([]);
    const r = await criarUsuario(payload, dados);
    expect(r).toEqual({ ok: true });
  });

  it("telas desconhecidas são descartadas", async () => {
    const payload = mockPayload([]);
    await criarUsuario(payload, { ...dados, telas: ["crm.leads", "x" as never] });
    const data = payload.create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data.telas).toEqual(["crm.leads"]);
  });
});

describe("editarUsuario", () => {
  const A = { id: 2, nome: "A", email: "a@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" };
  const B = { id: 3, nome: "B", email: "b@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" };

  it("atualiza nome, administrador e telas (sem o campo legado)", async () => {
    const payload = mockPayload([
      { id: 5, nome: "Carla", email: "c@ntc.org", administrador: false, telas: [], updatedAt: "2026-07-01T00:00:00.000Z" },
      A,
    ]);
    const r = await editarUsuario(payload, "5", { nome: "Carla", administrador: false, telas: ["crm.leads", "x" as never] }, "2");
    expect(r.ok).toBe(true);
    expect(payload.update).toHaveBeenCalledWith({
      collection: "users",
      id: "5",
      data: { nome: "Carla", administrador: false, telas: ["crm.leads"] },
      overrideAccess: true,
    });
  });

  it("recusa desmarcar o próprio administrador", async () => {
    const payload = mockPayload([A, B]);
    const r = await editarUsuario(payload, "2", { nome: "A", administrador: false, telas: [] }, "2");
    expect(r).toEqual({ ok: false, erro: "Você não pode tirar o seu próprio acesso de administrador." });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("recusa desmarcar o único administrador", async () => {
    const payload = mockPayload([A]);
    const r = await editarUsuario(payload, "2", { nome: "A", administrador: false, telas: [] }, "9");
    expect(r).toEqual({ ok: false, erro: "Não é possível remover o último administrador." });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("com dois administradores, desmarcar um funciona", async () => {
    const payload = mockPayload([A, B]);
    const r = await editarUsuario(payload, "2", { nome: "A", administrador: false, telas: ["site.eventos"] }, "3");
    expect(r.ok).toBe(true);
    expect(payload.update).toHaveBeenCalled();
  });

  it("id não canônico ('02') não contorna as guardas", async () => {
    const payload = mockPayload([A]);
    const r = await editarUsuario(payload, "02", { nome: "A", administrador: false, telas: [] }, "2");
    expect(r).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("id desconhecido é recusado sem escrever", async () => {
    const payload = mockPayload([A]);
    const r = await editarUsuario(payload, "99", { nome: "X", administrador: false, telas: [] }, "2");
    expect(r).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("administrador 'false' (string forjada) é tratado como false", async () => {
    const payload = mockPayload([A]);
    const r = await editarUsuario(payload, "2", { nome: "A", administrador: "false" as never, telas: [] }, "2");
    expect(r).toEqual({ ok: false, erro: "Você não pode tirar o seu próprio acesso de administrador." });
    expect(payload.update).not.toHaveBeenCalled();
    const r2 = await editarUsuario(payload, "2", { nome: "A", administrador: "false" as never, telas: [] }, "9");
    expect(r2).toEqual({ ok: false, erro: "Não é possível remover o último administrador." });
  });

  it("manter o único administrador como administrador segue permitido", async () => {
    const payload = mockPayload([A]);
    const r = await editarUsuario(payload, "2", { nome: "Renomeado", administrador: true, telas: [] }, "2");
    expect(r.ok).toBe(true);
  });
});

describe("reenviarConvite", () => {
  it("dispara forgotPassword e envia e-mail com o token para o usuário alvo", async () => {
    const payload = mockPayload([
      { id: 7, nome: "Dora", email: "dora@ntc.org", administrador: false, telas: ["site.eventos"], updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await reenviarConvite(payload, "7");
    expect(r).toEqual({ ok: true });
    expect(payload.forgotPassword).toHaveBeenCalledWith({
      collection: "users",
      data: { email: "dora@ntc.org" },
      disableEmail: true,
    });
    const envio = payload.sendEmail.mock.calls[0]?.[0] as { to: string; html: string };
    expect(envio.to).toBe("dora@ntc.org");
    expect(envio.html).toContain("token-abc");
  });

  it("usuário inexistente gera erro claro", async () => {
    const payload = mockPayload([]);
    const r = await reenviarConvite(payload, "999");
    expect(r).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(payload.forgotPassword).not.toHaveBeenCalled();
  });

  it("falha no envio retorna erro sem lançar", async () => {
    const payload = mockPayload([
      { id: 7, nome: "Dora", email: "dora@ntc.org", administrador: false, telas: ["site.eventos"], updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    payload.sendEmail.mockRejectedValue(new Error("Resend fora do ar"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await reenviarConvite(payload, "7");
    expect(r.ok).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("removerUsuario", () => {
  it("id não canônico ('02') e id desconhecido são recusados sem apagar", async () => {
    const payload = mockPayload([
      { id: 2, nome: "A", email: "a@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    expect(await removerUsuario(payload, "02", "2")).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(await removerUsuario(payload, " 2", "9")).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(await removerUsuario(payload, "99", "9")).toEqual({ ok: false, erro: "Usuário não encontrado." });
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("bloqueia remover a si mesmo", async () => {
    const payload = mockPayload([]);
    const r = await removerUsuario(payload, "1", "1");
    expect(r).toEqual({ ok: false, erro: "Você não pode remover a si mesmo." });
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("bloqueia remover o último administrador", async () => {
    const payload = mockPayload([
      { id: 2, nome: "Único", email: "unico@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r).toEqual({ ok: false, erro: "Não é possível remover o último administrador." });
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("remove quando há outro administrador", async () => {
    const payload = mockPayload([
      { id: 2, nome: "A", email: "a@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" },
      { id: 3, nome: "B", email: "b@ntc.org", administrador: true, updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r.ok).toBe(true);
    expect(payload.delete).toHaveBeenCalledWith({ collection: "users", id: "2", overrideAccess: true });
  });

  it("remove normalmente um usuário não administrador", async () => {
    const payload = mockPayload([
      { id: 2, nome: "A", email: "a@ntc.org", administrador: false, telas: ["site.eventos"], updatedAt: "2026-07-01T00:00:00.000Z" },
    ]);
    const r = await removerUsuario(payload, "2", "1");
    expect(r.ok).toBe(true);
    expect(payload.delete).toHaveBeenCalledWith({ collection: "users", id: "2", overrideAccess: true });
  });
});
