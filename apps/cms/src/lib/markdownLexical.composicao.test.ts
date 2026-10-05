import { describe, expect, it } from "vitest";

import { lexicalParaHtmlEditorial } from "@ntc/lib";

import { markdownParaLexical, lexicalParaMarkdown } from "./markdownLexical";

/**
 * Costura md → Lexical → HTML, que é a emenda central da feature: o painel
 * grava o corpo com `markdownParaLexical` (apps/cms) e o site publica esse
 * mesmo documento com `lexicalParaHtmlEditorial` (@ntc/lib).
 *
 * Os dois lados já têm teste próprio, mas cada um contra fixtures escritas à
 * mão — nenhuma delas prova que o que um grava é o que o outro lê. Trocar
 * `listType: "number"` por `"ordered"` de um lado, ou a tag de um heading,
 * deixaria as duas suítes verdes e quebraria a página pública em silêncio.
 *
 * O teste mora aqui, e não em `packages/lib`, porque só este lado enxerga os
 * dois: `@ntc/cms` depende de `@ntc/lib`, nunca o contrário.
 */

const MARKDOWN = [
  '## Título com <tag> & "aspas"',
  "",
  "Parágrafo com **negrito**, *itálico* e [link](https://institutontc.com.br).",
  "",
  "### Subtítulo",
  "",
  "- Primeiro item",
  "- Segundo item",
  "",
  "1988. Ano de fundação",
  "1989. Ano seguinte",
  "",
  "> Citação com & e <b>",
].join("\n");

const HTML_ESPERADO =
  "<h2>Título com &lt;tag&gt; &amp; &quot;aspas&quot;</h2>" +
  "<p>Parágrafo com <strong>negrito</strong>, <em>itálico</em> e " +
  '<a href="https://institutontc.com.br" rel="noopener">link</a>.</p>' +
  "<h3>Subtítulo</h3>" +
  "<ul><li>Primeiro item</li><li>Segundo item</li></ul>" +
  '<ol start="1988"><li>Ano de fundação</li><li>Ano seguinte</li></ol>' +
  "<blockquote>Citação com &amp; e &lt;b&gt;</blockquote>";

describe("Markdown leve → Lexical → HTML editorial", () => {
  it("entrega o documento inteiro como o site vai publicá-lo", () => {
    expect(lexicalParaHtmlEditorial(markdownParaLexical(MARKDOWN))).toBe(HTML_ESPERADO);
  });

  it("mantém a lista com marcadores como <ul>", () => {
    const html = lexicalParaHtmlEditorial(markdownParaLexical("- um\n- dois"));
    expect(html).toBe("<ul><li>um</li><li>dois</li></ul>");
  });

  it("mantém a lista ordenada como <ol> e preserva o número inicial digitado", () => {
    const html = lexicalParaHtmlEditorial(markdownParaLexical("1988. um\n1989. dois"));
    expect(html).toBe('<ol start="1988"><li>um</li><li>dois</li></ol>');
  });

  it("não emite start quando a lista ordenada começa em 1", () => {
    const html = lexicalParaHtmlEditorial(markdownParaLexical("1. um\n2. dois"));
    expect(html).toBe("<ol><li>um</li><li>dois</li></ol>");
  });

  it("escapa < > & e aspas vindos do editor, sem deixar markup passar", () => {
    const html = lexicalParaHtmlEditorial(markdownParaLexical('<script>alert("x" & 1)</script>'));
    expect(html).toBe("<p>&lt;script&gt;alert(&quot;x&quot; &amp; 1)&lt;/script&gt;</p>");
  });

  it("a ida e volta pelo Markdown chega ao mesmo HTML (o que o painel reabre)", () => {
    const lexical = markdownParaLexical(MARKDOWN);
    const reaberto = markdownParaLexical(lexicalParaMarkdown(lexical));
    expect(lexicalParaHtmlEditorial(reaberto)).toBe(HTML_ESPERADO);
  });
});
