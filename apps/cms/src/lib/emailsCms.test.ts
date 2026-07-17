import { afterEach, describe, expect, it, vi } from "vitest";

import { emailBoasVindasHtml, emailLeadHtml, emailRecuperacaoHtml, urlRedefinir } from "./emailsCms";

afterEach(() => vi.unstubAllEnvs());

describe("urlRedefinir", () => {
  it("monta o link absoluto com o token", () => {
    vi.stubEnv("PAYLOAD_PUBLIC_SERVER_URL", "https://admin.institutontc.com.br");
    expect(urlRedefinir("abc123")).toBe(
      "https://admin.institutontc.com.br/entrar/redefinir?token=abc123",
    );
  });

  it("acrescenta novo=1 para boas-vindas", () => {
    expect(urlRedefinir("t", true)).toContain("&novo=1");
  });
});

describe("templates", () => {
  it("recuperação contém nome e link com token", () => {
    const html = emailRecuperacaoHtml({ nome: "João", token: "tok-1" });
    expect(html).toContain("João");
    expect(html).toContain("token=tok-1");
    expect(html).toContain("Redefinir minha senha");
  });

  it("boas-vindas contém link com novo=1 e chamada para definir senha", () => {
    const html = emailBoasVindasHtml({ nome: "Maria", token: "tok-2" });
    expect(html).toContain("token=tok-2");
    expect(html).toContain("novo=1");
    expect(html).toContain("Definir minha senha");
  });

  it("lead contém tipo, nome e e-mail", () => {
    const html = emailLeadHtml({
      tipo: "proposta",
      nome: "Fulano",
      email: "f@x.br",
      instituicao: "Prefeitura X",
    });
    expect(html).toContain("proposta");
    expect(html).toContain("Fulano");
    expect(html).toContain("f@x.br");
    expect(html).toContain("Prefeitura X");
  });
});
