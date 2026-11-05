import { describe, expect, it } from "vitest";
import { paragrafosParaHtml, textoDoLexical } from "./paragrafos";

const t = (text: string, format = 0) => ({ type: "text", text, format });
const doc = {
  root: {
    type: "root",
    children: [
      { type: "paragraph", children: [t("A")] },
      { type: "list", children: [] },
      { type: "paragraph", children: [t("B "), t("C", 1)] },
    ],
  },
};

describe("paragrafos", () => {
  it("serializa com classe só no primeiro", () => {
    expect(paragrafosParaHtml(doc, { classePrimeiro: "lede-block" })).toBe(
      '<p class="lede-block">A</p><p>B <strong>C</strong></p>',
    );
  });
  it("itálico e escape", () => {
    expect(paragrafosParaHtml({ root: { children: [{ type: "paragraph", children: [t("a<b", 2)] }] } })).toBe(
      "<p><em>a&lt;b</em></p>",
    );
  });
  it("vazio/nulo", () => {
    expect(paragrafosParaHtml(null)).toBe("");
    expect(paragrafosParaHtml({})).toBe("");
    expect(textoDoLexical(undefined)).toBe("");
  });
  it("texto puro", () => {
    expect(textoDoLexical(doc)).toBe("A\n\nB C");
  });
});
