import { describe, expect, it } from "vitest";

import { lexicalDocumentoParaHtml } from "./lexicalDocumento";

function doc(children: unknown[]): unknown {
  return { root: { type: "root", children, direction: "ltr", format: "", indent: 0, version: 1 } };
}

function texto(t: string, format = 0): unknown {
  return { type: "text", text: t, format, version: 1 };
}

function paragrafo(...children: unknown[]): unknown {
  return { type: "paragraph", children, version: 1 };
}

describe("lexicalDocumentoParaHtml", () => {
  it("cada parágrafo de topo vira um <p> próprio", () => {
    const html = lexicalDocumentoParaHtml(
      doc([paragrafo(texto("Primeiro.")), paragrafo(texto("Segundo."))]),
    );
    expect(html).toBe("<p>Primeiro.</p><p>Segundo.</p>");
  });

  it("preserva a formatação inline de lexicalToHtml", () => {
    const html = lexicalDocumentoParaHtml(
      doc([paragrafo(texto("Carga de "), texto("24h", 1), texto(" por turma."))]),
    );
    expect(html).toBe("<p>Carga de <strong>24h</strong> por turma.</p>");
  });

  it("heading vira <h3>", () => {
    const html = lexicalDocumentoParaHtml(
      doc([{ type: "heading", tag: "h3", children: [texto("Eixos")], version: 1 }]),
    );
    expect(html).toBe("<h3>Eixos</h3>");
  });

  it("lista não ordenada vira <ul> com um <li> por item", () => {
    const html = lexicalDocumentoParaHtml(
      doc([
        {
          type: "list",
          listType: "bullet",
          version: 1,
          children: [
            { type: "listitem", version: 1, children: [texto("Um")] },
            { type: "listitem", version: 1, children: [texto("Dois")] },
          ],
        },
      ]),
    );
    expect(html).toBe("<ul><li>Um</li><li>Dois</li></ul>");
  });

  it("lista ordenada vira <ol>", () => {
    const html = lexicalDocumentoParaHtml(
      doc([
        {
          type: "list",
          listType: "number",
          version: 1,
          children: [{ type: "listitem", version: 1, children: [texto("Único")] }],
        },
      ]),
    );
    expect(html).toBe("<ol><li>Único</li></ol>");
  });

  it("documento ausente, vazio ou só com blocos vazios devolve string vazia", () => {
    expect(lexicalDocumentoParaHtml(null)).toBe("");
    expect(lexicalDocumentoParaHtml(undefined)).toBe("");
    expect(lexicalDocumentoParaHtml({})).toBe("");
    expect(lexicalDocumentoParaHtml(doc([]))).toBe("");
    // Estado "campo limpo" do editor do Payload: um parágrafo sem texto.
    expect(lexicalDocumentoParaHtml(doc([paragrafo()]))).toBe("");
    expect(lexicalDocumentoParaHtml(doc([paragrafo(texto(""))]))).toBe("");
    expect(
      lexicalDocumentoParaHtml(doc([{ type: "list", listType: "bullet", version: 1, children: [] }])),
    ).toBe("");
  });

  it("descarta só os blocos vazios, mantendo os preenchidos", () => {
    const html = lexicalDocumentoParaHtml(
      doc([paragrafo(), paragrafo(texto("Vale.")), paragrafo(texto(""))]),
    );
    expect(html).toBe("<p>Vale.</p>");
  });
});
