import { describe, expect, it } from "vitest";

import { lexicalParaMarkdown, markdownParaLexical } from "./markdownLexical";

/** Atalho: converte e volta, que é a garantia que o editor precisa. */
function idaEVolta(md: string): string {
  return lexicalParaMarkdown(markdownParaLexical(md));
}

describe("markdownParaLexical", () => {
  it("transforma linha simples em parágrafo", () => {
    const doc = markdownParaLexical("Um parágrafo.");
    const bloco = doc.root.children[0] as { type: string; children: { text: string }[] };
    expect(bloco.type).toBe("paragraph");
    expect(bloco.children[0]!.text).toBe("Um parágrafo.");
  });

  it("transforma ## e ### em heading h2 e h3", () => {
    const doc = markdownParaLexical("## Seção\n\n### Subseção");
    const blocos = doc.root.children as { type: string; tag: string }[];
    expect(blocos[0]).toMatchObject({ type: "heading", tag: "h2" });
    expect(blocos[1]).toMatchObject({ type: "heading", tag: "h3" });
  });

  it("marca negrito e itálico no bitfield de format", () => {
    const doc = markdownParaLexical("Isto é **forte** e *suave*.");
    const filhos = (doc.root.children[0] as { children: { text: string; format: number }[] })
      .children;
    expect(filhos).toEqual([
      expect.objectContaining({ text: "Isto é ", format: 0 }),
      expect.objectContaining({ text: "forte", format: 1 }),
      expect.objectContaining({ text: " e ", format: 0 }),
      expect.objectContaining({ text: "suave", format: 2 }),
      expect.objectContaining({ text: ".", format: 0 }),
    ]);
  });

  it("transforma [texto](url) em nó de link", () => {
    const doc = markdownParaLexical("Veja o [portal](https://institutontc.com.br) hoje.");
    const filhos = (doc.root.children[0] as { children: Record<string, unknown>[] }).children;
    expect(filhos[1]).toMatchObject({
      type: "link",
      fields: { url: "https://institutontc.com.br" },
    });
  });

  it("agrupa linhas '- ' numa lista e '1. ' numa lista ordenada", () => {
    const doc = markdownParaLexical("- um\n- dois\n\n1. passo\n2. outro");
    const blocos = doc.root.children as { type: string; listType: string; children: unknown[] }[];
    expect(blocos[0]).toMatchObject({ type: "list", listType: "bullet" });
    expect(blocos[0]!.children).toHaveLength(2);
    expect(blocos[1]).toMatchObject({ type: "list", listType: "number" });
  });

  it("transforma '> ' em citação", () => {
    const doc = markdownParaLexical("> Uma citação.");
    expect(doc.root.children[0]).toMatchObject({ type: "quote" });
  });

  it("documento vazio tem um parágrafo vazio, não children vazio", () => {
    const doc = markdownParaLexical("");
    expect(doc.root.children).toHaveLength(1);
  });
});

describe("ida e volta", () => {
  it.each([
    ["parágrafos", "Primeiro.\n\nSegundo."],
    ["headings", "## Seção\n\nTexto.\n\n### Sub"],
    ["negrito e itálico", "Isto é **forte** e *suave*."],
    ["link", "Veja o [portal](https://institutontc.com.br) hoje."],
    ["lista", "- um\n- dois"],
    ["lista ordenada", "1. um\n2. dois"],
    ["lista ordenada que não começa em 1", "5. five\n6. six"],
    ["lista ordenada de um item cujo número é um ano", "1988. Ano de fundação do Instituto."],
    ["citação", "> Uma citação."],
    ["combinado", "## Seção\n\nTexto com **peso**.\n\n- item\n\n> nota"],
  ])("preserva %s", (_nome, md) => {
    expect(idaEVolta(md)).toBe(md);
  });

  it("trata sintaxe não suportada como texto literal, sem perder conteúdo", () => {
    const md = "Uma ~~tentativa~~ de riscado e `código`.";
    expect(idaEVolta(md)).toBe(md);
  });

  it("colapsa linhas em branco repetidas numa separação só", () => {
    expect(idaEVolta("Um.\n\n\n\nDois.")).toBe("Um.\n\nDois.");
  });

  it("não perde o número de uma lista ordenada que não começa em 1", () => {
    expect(idaEVolta("5. five\n6. six")).toBe("5. five\n6. six");
  });

  it("não confunde '1988. Texto' com o início de uma lista renumerada", () => {
    expect(idaEVolta("1988. Ano de fundação do Instituto.")).toBe(
      "1988. Ano de fundação do Instituto.",
    );
  });

  it("junta linhas comuns consecutivas (sem linha em branco entre elas) num parágrafo só", () => {
    expect(idaEVolta("Primeiro.\nSegundo.")).toBe("Primeiro. Segundo.");
  });
});
