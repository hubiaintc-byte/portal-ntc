import { describe, expect, it } from "vitest";

import { corpoParaRegistro, lerCorpoJson, LIMITE_CORPO_BYTES } from "./respostaForm";

const pedido = (corpo: string, headers: Record<string, string> = {}) =>
  new Request("http://x/api/forms/contato", { method: "POST", body: corpo, headers });

describe("lerCorpoJson", () => {
  it("devolve o objeto de um JSON válido", async () => {
    const r = await lerCorpoJson(pedido(JSON.stringify({ nome: "Ana" })));
    expect(r).toEqual({ ok: true, body: { nome: "Ana" } });
  });

  it("recusa com 413 o corpo acima do teto, mesmo sem content-length", async () => {
    const r = await lerCorpoJson(pedido(JSON.stringify({ m: "x".repeat(LIMITE_CORPO_BYTES) })));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.resposta.status).toBe(413);
  });

  it("recusa com 413 pelo content-length declarado, antes de ler", async () => {
    const r = await lerCorpoJson(pedido("{}", { "content-length": String(LIMITE_CORPO_BYTES + 1) }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.resposta.status).toBe(413);
  });

  it("recusa com 400 o que não é objeto JSON", async () => {
    for (const corpo of ["nao-e-json", "[1,2]", "null", "42"]) {
      const r = await lerCorpoJson(pedido(corpo));
      expect(r.ok, corpo).toBe(false);
      if (!r.ok) expect(r.resposta.status).toBe(400);
    }
  });
});

describe("corpoParaRegistro", () => {
  it("tira o token do captcha e mantém o resto", () => {
    expect(corpoParaRegistro({ nome: "Ana", hcaptchaToken: "tok", extra: 1 })).toEqual({ nome: "Ana", extra: 1 });
  });
});
