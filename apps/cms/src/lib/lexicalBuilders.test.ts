import { describe, expect, it } from "vitest";

import {
  paragrafosParaLexical,
  sessoesParaLexical,
  textoComSubtitulosParaLexical,
  textoParaLexical,
} from "./lexicalBuilders";

interface NoGenerico {
  type: string;
  tag?: string;
  children?: NoGenerico[];
  text?: string;
  listType?: string;
}

function filhos(doc: { root: { children: unknown[] } }): NoGenerico[] {
  return doc.root.children as NoGenerico[];
}

describe("paragrafosParaLexical", () => {
  it("gera um parágrafo por string, ignorando vazias", () => {
    const doc = paragrafosParaLexical(["Primeiro.", "", "  Segundo.  "]);
    const nos = filhos(doc);
    expect(nos).toHaveLength(2);
    expect(nos[0]?.type).toBe("paragraph");
    expect(nos[0]?.children?.[0]?.text).toBe("Primeiro.");
    expect(nos[1]?.children?.[0]?.text).toBe("Segundo.");
  });

  it("entrada vazia produz um parágrafo vazio (root nunca sem filhos)", () => {
    const nos = filhos(paragrafosParaLexical([]));
    expect(nos).toHaveLength(1);
    expect(nos[0]?.type).toBe("paragraph");
  });
});

describe("textoParaLexical", () => {
  it("linhas viram parágrafos e '- ' vira lista", () => {
    const doc = textoParaLexical("Intro.\n- item um\n- item dois\nFecho.");
    const nos = filhos(doc);
    expect(nos.map((n) => n.type)).toEqual(["paragraph", "list", "paragraph"]);
    const lista = nos[1];
    expect(lista?.listType).toBe("bullet");
    expect(lista?.children).toHaveLength(2);
    expect(lista?.children?.[0]?.children?.[0]?.text).toBe("item um");
  });
});

describe("textoComSubtitulosParaLexical", () => {
  it("'## ' vira heading h3, o resto segue a regra de textoParaLexical", () => {
    const doc = textoComSubtitulosParaLexical(
      "## Certificação\n\nPrimeiro parágrafo.\n- item um\n- item dois\n\n## Replay\n\nFecho.",
    );
    const nos = filhos(doc);
    expect(nos.map((n) => n.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "heading",
      "paragraph",
    ]);
    expect(nos[0]?.tag).toBe("h3");
    expect(nos[0]?.children?.[0]?.text).toBe("Certificação");
    expect(nos[3]?.children?.[0]?.text).toBe("Replay");
    expect(nos[2]?.children).toHaveLength(2);
  });

  it("texto sem '## ' sai igual ao de textoParaLexical", () => {
    const texto = "Intro.\n- item um\n- item dois\nFecho.";
    expect(textoComSubtitulosParaLexical(texto)).toEqual(textoParaLexical(texto));
  });

  it("entrada vazia produz um parágrafo vazio (root nunca sem filhos)", () => {
    const nos = filhos(textoComSubtitulosParaLexical("   "));
    expect(nos).toHaveLength(1);
    expect(nos[0]?.type).toBe("paragraph");
  });
});

describe("sessoesParaLexical", () => {
  it("gera heading + lista por sessão", () => {
    const doc = sessoesParaLexical([
      { titulo: "Sessão 01", itens: ["Pergunta A?", "Pergunta B?"] },
      { titulo: "Sessão 02", itens: ["Pergunta C?"] },
    ]);
    const nos = filhos(doc);
    expect(nos.map((n) => n.type)).toEqual(["heading", "list", "heading", "list"]);
    expect(nos[0]?.children?.[0]?.text).toBe("Sessão 01");
    expect(nos[3]?.children).toHaveLength(1);
  });
});
