import { describe, expect, it } from "vitest";

import { extrairCartoesDeResultado, htmlParaLexical, listaParaLexical } from "./htmlParaLexical";

const textoDo = (doc: { root: { children: unknown[] } }): string =>
  JSON.stringify(doc.root.children).replace(/[^ -~À-ÿ]/g, "");

describe("htmlParaLexical", () => {
  it("converte parágrafos em nós de parágrafo", () => {
    const { doc, tagsIgnoradas } = htmlParaLexical("<p>Primeiro.</p><p>Segundo.</p>");
    expect(doc.root.children).toHaveLength(2);
    expect(tagsIgnoradas).toEqual([]);
    expect(textoDo(doc)).toContain("Primeiro.");
    expect(textoDo(doc)).toContain("Segundo.");
  });

  it("marca negrito e itálico no format do nó de texto", () => {
    const { doc } = htmlParaLexical("<p>a <strong>b</strong> <em>c</em></p>");
    const paragrafo = doc.root.children[0] as { children: { text: string; format: number }[] };
    expect(paragrafo.children.find((n) => n.text === "b")?.format).toBe(1);
    expect(paragrafo.children.find((n) => n.text === "c")?.format).toBe(2);
  });

  it("converte ul/li em lista Lexical", () => {
    const { doc } = htmlParaLexical("<ul><li>um</li><li>dois</li></ul>");
    const lista = doc.root.children[0] as { type: string; children: unknown[] };
    expect(lista.type).toBe("list");
    expect(lista.children).toHaveLength(2);
  });

  it("preserva o texto e relata a tag fora do subconjunto", () => {
    const { doc, tagsIgnoradas } = htmlParaLexical('<div class="results-grid"><p>Fica.</p></div>');
    expect(textoDo(doc)).toContain("Fica.");
    expect(tagsIgnoradas).toEqual(["div"]);
  });

  it("relata cada tag desconhecida uma vez só", () => {
    const { tagsIgnoradas } = htmlParaLexical("<section><p>a</p></section><section><p>b</p></section>");
    expect(tagsIgnoradas).toEqual(["section"]);
  });

  it("html vazio vira documento com um parágrafo vazio", () => {
    const { doc } = htmlParaLexical("");
    expect(doc.root.children).toHaveLength(1);
  });

  it("decodifica entidades HTML", () => {
    const { doc } = htmlParaLexical("<p>Gest&atilde;o &amp; Inova&ccedil;&atilde;o</p>");
    expect(textoDo(doc)).toContain("Gestão & Inovação");
  });

  it("converte ol em lista ordenada", () => {
    const { doc } = htmlParaLexical("<ol><li>um</li><li>dois</li></ol>");
    const lista = doc.root.children[0] as { type: string; listType: string; tag: string; children: unknown[] };
    expect(lista.type).toBe("list");
    expect(lista.listType).toBe("number");
    expect(lista.tag).toBe("ol");
    expect(lista.children).toHaveLength(2);
  });

  it("aplica formatação inline dentro do item de lista", () => {
    const { doc } = htmlParaLexical("<ul><li>a <strong>b</strong></li></ul>");
    const lista = doc.root.children[0] as { children: { children: { text: string; format: number }[] }[] };
    const item = lista.children[0]!;
    expect(item.children.find((n) => n.text === "b")?.format).toBe(1);
  });
});

describe("extrairCartoesDeResultado", () => {
  it("extrai o texto de cada result-card e descarta o número", () => {
    const html = `<div class="results-grid">
      <div class="result-card"><span class="r-num">01</span><p>Rede qualificada.</p></div>
      <div class="result-card"><span class="r-num">02</span><p>Gestores aptos.</p></div>
    </div>`;
    expect(extrairCartoesDeResultado(html)).toEqual(["Rede qualificada.", "Gestores aptos."]);
  });

  it("sem cartões, devolve lista vazia", () => {
    expect(extrairCartoesDeResultado("<p>Só um parágrafo.</p>")).toEqual([]);
  });
});

describe("listaParaLexical", () => {
  it("junta o corpo e os itens numa lista", () => {
    const { doc } = listaParaLexical("<p>Para quem:</p>", ["Diretores", "Coordenadores"]);
    expect(doc.root.children).toHaveLength(2);
    expect((doc.root.children[1] as { type: string }).type).toBe("list");
  });

  it("sem itens, devolve só o corpo", () => {
    const { doc } = listaParaLexical("<p>Para quem:</p>", []);
    expect(doc.root.children).toHaveLength(1);
  });
});
