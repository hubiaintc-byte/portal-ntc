import { describe, expect, it } from "vitest";

import { paragrafosParaLexical, sessoesParaLexical, textoParaLexical } from "@/lib/lexicalBuilders";

import { lexicalParaTexto } from "./lexical";

describe("lexicalParaTexto", () => {
  it("parágrafos viram linhas", () => {
    const doc = paragrafosParaLexical(["Primeiro.", "Segundo."]);
    expect(lexicalParaTexto(doc)).toBe("Primeiro.\nSegundo.");
  });

  it("listas viram linhas com '- ' (ida e volta com textoParaLexical)", () => {
    const texto = "Intro.\n- item um\n- item dois";
    expect(lexicalParaTexto(textoParaLexical(texto))).toBe(texto);
  });

  it("headings de sessões viram linhas próprias", () => {
    const doc = sessoesParaLexical([{ titulo: "Sessão 01", itens: ["A?", "B?"] }]);
    expect(lexicalParaTexto(doc)).toBe("Sessão 01\n- A?\n- B?");
  });

  it("doc nulo ou malformado vira string vazia", () => {
    expect(lexicalParaTexto(null)).toBe("");
    expect(lexicalParaTexto({})).toBe("");
    expect(lexicalParaTexto({ root: {} })).toBe("");
  });
});
