import { describe, expect, it } from "vitest";

import { montarSecoes, type SecaoDocumento, type SecaoExtra } from "./montar";

const base: SecaoDocumento[] = [
  { chave: "identificacao", titulo: "Dados de Identificação", corpoHtml: "<p>a</p>" },
  { chave: "quadro-comercial", titulo: "Quadro Comercial", corpoHtml: "<p>b</p>" },
  { chave: "condicoes-comerciais", titulo: "Condições Comerciais", corpoHtml: "<p>c</p>" },
  { chave: "fechamento", titulo: "Fechamento Institucional", corpoHtml: "<p>d</p>" },
];

describe("montarSecoes", () => {
  it("numera a partir de 3, como o modelo", () => {
    const r = montarSecoes(base, []);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
    expect(r.omitidas).toEqual([]);
  });

  it("omite corpo vazio e fecha a numeração sem buraco", () => {
    const r = montarSecoes([base[0]!, { chave: "docentes", titulo: "Corpo Docente", corpoHtml: "" }, ...base.slice(1)], []);
    expect(r.secoes.map((s) => s.chave)).toEqual(["identificacao", "quadro-comercial", "condicoes-comerciais", "fechamento"]);
    expect(r.secoes.map((s) => s.numero)).toEqual([3, 4, 5, 6]);
    expect(r.omitidas).toEqual(["docentes"]);
  });

  it("insere antes do Quadro Comercial", () => {
    const extra: SecaoExtra = { titulo: "Observação", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" };
    expect(montarSecoes(base, [extra]).secoes.map((s) => s.titulo)).toEqual([
      "Dados de Identificação", "Observação", "Quadro Comercial", "Condições Comerciais", "Fechamento Institucional",
    ]);
  });

  it("insere depois das Condições Comerciais", () => {
    const r = montarSecoes(base, [{ titulo: "Anexo", corpoHtml: "<p>x</p>", posicao: "apos-condicoes-comerciais" }]);
    expect(r.secoes.map((s) => s.titulo)[3]).toBe("Anexo");
  });

  it("'fim' entra antes do Fechamento", () => {
    const t = montarSecoes(base, [{ titulo: "Nota final", corpoHtml: "<p>x</p>", posicao: "fim" }]).secoes.map((s) => s.titulo);
    expect(t[t.length - 2]).toBe("Nota final");
    expect(t[t.length - 1]).toBe("Fechamento Institucional");
  });

  it("duas extras na mesma posição mantêm a ordem de cadastro", () => {
    const t = montarSecoes(base, [
      { titulo: "Primeira", corpoHtml: "<p>1</p>", posicao: "fim" },
      { titulo: "Segunda", corpoHtml: "<p>2</p>", posicao: "fim" },
    ]).secoes.map((s) => s.titulo);
    expect(t.indexOf("Primeira")).toBeLessThan(t.indexOf("Segunda"));
  });

  it("extra com âncora omitida cai para o fim", () => {
    const semQuadro = base.filter((s) => s.chave !== "quadro-comercial");
    const t = montarSecoes(semQuadro, [{ titulo: "Órfã", corpoHtml: "<p>x</p>", posicao: "antes-quadro-comercial" }]).secoes.map((s) => s.titulo);
    expect(t[t.length - 2]).toBe("Órfã");
  });

  it("extra de corpo vazio é descartada", () => {
    expect(montarSecoes(base, [{ titulo: "Vazia", corpoHtml: "", posicao: "fim" }]).secoes.map((s) => s.titulo)).not.toContain("Vazia");
  });

  it("lista vazia não quebra", () => {
    expect(montarSecoes([], [])).toEqual({ secoes: [], omitidas: [] });
  });
});
