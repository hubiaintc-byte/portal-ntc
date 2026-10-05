import { describe, expect, it } from "vitest";

import { telefoneParaHref, whatsappParaHref } from "./contatos";

describe("telefoneParaHref", () => {
  it("monta tel: com código do país a partir do número mascarado", () => {
    expect(telefoneParaHref("(63) 3212-1199")).toBe("tel:+556332121199");
  });

  it("aceita número sem máscara", () => {
    expect(telefoneParaHref("6332121199")).toBe("tel:+556332121199");
  });

  it("não duplica o 55 quando o número já vem com código do país", () => {
    expect(telefoneParaHref("+55 (63) 3212-1199")).toBe("tel:+556332121199");
  });

  it("devolve string vazia para entrada vazia ou sem dígitos", () => {
    expect(telefoneParaHref("")).toBe("");
    expect(telefoneParaHref("   ")).toBe("");
    expect(telefoneParaHref("ligue para nós")).toBe("");
  });
});

describe("whatsappParaHref", () => {
  it("monta o link do wa.me", () => {
    expect(whatsappParaHref("(63) 98444-4040")).toBe("https://wa.me/5563984444040");
  });

  it("não duplica o 55", () => {
    expect(whatsappParaHref("55 63 98444-4040")).toBe("https://wa.me/5563984444040");
  });

  it("devolve string vazia quando não há número", () => {
    expect(whatsappParaHref("")).toBe("");
  });
});
