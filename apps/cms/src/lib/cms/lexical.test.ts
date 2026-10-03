import { describe, expect, it } from "vitest";

import { paragrafosParaLexical, sessoesParaLexical, textoParaLexical } from "@/lib/lexicalBuilders";

import { lexicalParaTexto, lexicalToHtml } from "./lexical";

describe("lexicalToHtml", () => {
  it("separa parágrafos e itens de lista com <br> (nada de texto colado)", () => {
    const doc = textoParaLexical("Intro.\n- Secretários de Educação\n- Diretores escolares");
    expect(lexicalToHtml(doc)).toBe(
      "Intro.<br>Secretários de Educação<br>Diretores escolares",
    );
  });

  it("headings de sessão viram blocos separados", () => {
    const doc = sessoesParaLexical([{ titulo: "Sessão 01", itens: ["A", "B"] }]);
    expect(lexicalToHtml(doc)).toBe("Sessão 01<br>A<br>B");
  });

  it("doc de um parágrafo continua inline, sem <br> extra", () => {
    expect(lexicalToHtml(paragrafosParaLexical(["Só um parágrafo."]))).toBe("Só um parágrafo.");
  });

  it("sem o parâmetro, a saída não escapa nada (comportamento de corpo-docente e eventos)", () => {
    const doc = paragrafosParaLexical(["Prazo < 30 dias & cia > tudo"]);
    expect(lexicalToHtml(doc)).toBe("Prazo < 30 dias & cia > tudo");
  });

  it("com escapar: true, escapa &, < e > no nó de texto", () => {
    const doc = paragrafosParaLexical(["Prazo < 30 dias & cia > tudo"]);
    expect(lexicalToHtml(doc, { escapar: true })).toBe(
      "Prazo &lt; 30 dias &amp; cia &gt; tudo",
    );
  });
});

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
