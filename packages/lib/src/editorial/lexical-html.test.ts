import { describe, expect, it } from "vitest";

import { lexicalParaHtmlEditorial } from "./lexical-html";

/** Monta um documento Lexical mínimo com os filhos dados. */
function doc(children: unknown[]): unknown {
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

function texto(t: string, format = 0): unknown {
  return { type: "text", format, mode: "normal", style: "", text: t, version: 1, detail: 0 };
}

describe("lexicalParaHtmlEditorial", () => {
  it("devolve string vazia para documento ausente ou malformado", () => {
    expect(lexicalParaHtmlEditorial(null)).toBe("");
    expect(lexicalParaHtmlEditorial({})).toBe("");
    expect(lexicalParaHtmlEditorial({ root: {} })).toBe("");
  });

  it("serializa parágrafo em <p>", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto("Primeiro parágrafo.")] }]),
    );
    expect(html).toBe("<p>Primeiro parágrafo.</p>");
  });

  it("serializa headings h2 e h3 com a tag do nó", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        { type: "heading", tag: "h2", children: [texto("Seção")] },
        { type: "heading", tag: "h3", children: [texto("Subseção")] },
      ]),
    );
    expect(html).toBe("<h2>Seção</h2><h3>Subseção</h3>");
  });

  it("rebaixa heading de nível não suportado para h3", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "heading", tag: "h1", children: [texto("Título")] }]),
    );
    expect(html).toBe("<h3>Título</h3>");
  });

  it("serializa negrito e itálico pelo bitfield de format", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto("bold", 1), texto("it", 2)] }]),
    );
    expect(html).toBe("<p><strong>bold</strong><em>it</em></p>");
  });

  it("serializa lista com marcadores e lista ordenada", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "list",
          listType: "bullet",
          children: [
            { type: "listitem", children: [texto("um")] },
            { type: "listitem", children: [texto("dois")] },
          ],
        },
        {
          type: "list",
          listType: "number",
          children: [{ type: "listitem", children: [texto("passo")] }],
        },
      ]),
    );
    expect(html).toBe("<ul><li>um</li><li>dois</li></ul><ol><li>passo</li></ol>");
  });

  it("emite start no <ol> quando o primeiro item não começa em 1", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "list",
          listType: "number",
          children: [
            { type: "listitem", value: 5, children: [texto("five")] },
            { type: "listitem", value: 6, children: [texto("six")] },
          ],
        },
      ]),
    );
    expect(html).toBe('<ol start="5"><li>five</li><li>six</li></ol>');
  });

  it("não emite start quando a lista ordenada começa em 1", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "list",
          listType: "number",
          children: [{ type: "listitem", value: 1, children: [texto("passo")] }],
        },
      ]),
    );
    expect(html).toBe("<ol><li>passo</li></ol>");
  });

  it("serializa citação em <blockquote>", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "quote", children: [texto("A citação.")] }]),
    );
    expect(html).toBe("<blockquote>A citação.</blockquote>");
  });

  it("serializa link com rel e target seguros", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              fields: { url: "https://institutontc.com.br", newTab: true },
              children: [texto("NTC")],
            },
          ],
        },
      ]),
    );
    expect(html).toBe(
      '<p><a href="https://institutontc.com.br" target="_blank" rel="noopener noreferrer">NTC</a></p>',
    );
  });

  it("descarta href que não seja http, https ou mailto", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "paragraph",
          children: [
            { type: "link", fields: { url: "javascript:alert(1)" }, children: [texto("clique")] },
          ],
        },
      ]),
    );
    expect(html).toBe("<p>clique</p>");
  });

  it("escapa HTML do texto para não permitir injeção", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto('<img src=x onerror="alert(1)"> & cia')] }]),
    );
    expect(html).toBe("<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; cia</p>");
  });

  it("ignora bloco vazio em vez de emitir tag vazia", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        { type: "paragraph", children: [texto("")] },
        { type: "paragraph", children: [texto("ok")] },
      ]),
    );
    expect(html).toBe("<p>ok</p>");
  });
});
