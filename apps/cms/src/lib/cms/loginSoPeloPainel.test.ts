import { describe, expect, it } from "vitest";

import { recusarLoginForaDoPainel } from "./loginSoPeloPainel";
import { rotaDeApiBloqueada } from "./rotasApiBloqueadas";

/**
 * O 2º fator (passkey) só existe no fluxo do painel (`/entrar`, Local API). O
 * login da REST/GraphQL nativa do Payload devolvia o mesmo JWT/cookie que o
 * painel aceita só com a senha — contornando o passkey inteiro.
 */
describe("recusarLoginForaDoPainel (beforeLogin de users)", () => {
  const user = { id: 1, email: "a@b.c" };

  it("deixa passar o login da Local API (Server Actions do painel)", () => {
    expect(recusarLoginForaDoPainel({ req: { payloadAPI: "local" }, user } as never)).toBe(user);
  });

  it("recusa login pela REST", () => {
    expect(() => recusarLoginForaDoPainel({ req: { payloadAPI: "REST" }, user } as never)).toThrow();
  });

  it("recusa login pelo GraphQL", () => {
    expect(() => recusarLoginForaDoPainel({ req: { payloadAPI: "GraphQL" }, user } as never)).toThrow();
  });
});

describe("rotaDeApiBloqueada", () => {
  it("bloqueia os endpoints de autenticação de users", () => {
    for (const rota of [
      "/api/users/login",
      "/api/users/forgot-password",
      "/api/users/reset-password",
      "/api/users/refresh-token",
      "/api/users/unlock",
      "/api/users/me",
      "/api/users",
      "/api/users/1",
    ]) {
      expect(rotaDeApiBloqueada(rota), rota).toBe(true);
    }
  });

  it("bloqueia o GraphQL e o playground", () => {
    expect(rotaDeApiBloqueada("/api/graphql")).toBe(true);
    expect(rotaDeApiBloqueada("/api/graphql-playground")).toBe(true);
  });

  it("não bloqueia o resto da REST (arquivos privados, conteúdo público)", () => {
    expect(rotaDeApiBloqueada("/api/documentos-comerciais/file/proposta-abc.pdf")).toBe(false);
    expect(rotaDeApiBloqueada("/api/programas")).toBe(false);
    expect(rotaDeApiBloqueada("/api/usersx")).toBe(false);
  });
});
