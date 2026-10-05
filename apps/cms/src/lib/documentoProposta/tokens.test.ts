import { describe, expect, it } from "vitest";

import { cssBaseProposta, cssPaginasProposta, cssVariaveisProposta, PALETA_PROPOSTA } from "./tokens";

describe("PALETA_PROPOSTA", () => {
  it("usa as cores do modelo", () => {
    expect(PALETA_PROPOSTA.navy).toBe("#0E2A47");
    expect(PALETA_PROPOSTA.gold).toBe("#B68B40");
    expect(PALETA_PROPOSTA.offwhite).toBe("#F5EDD8");
  });

  it("não contém nenhum hex da paleta Soberana", () => {
    const hexes = Object.values(PALETA_PROPOSTA).map((h) => h.toUpperCase());
    expect(hexes).not.toContain("#11365E");
    expect(hexes).not.toContain("#B5995A");
    expect(hexes).not.toContain("#F4EFE6");
  });
});

describe("cssVariaveisProposta", () => {
  it("declara todas as variáveis em :root", () => {
    const css = cssVariaveisProposta();
    for (const valor of Object.values(PALETA_PROPOSTA)) expect(css).toContain(valor);
    expect(css).toContain(":root");
  });
});

describe("cssBaseProposta", () => {
  it("não traz fonte externa", () => expect(cssBaseProposta()).not.toContain("fonts.googleapis"));
  // No modelo, `table.qc .total td` (0,2,2) perde para a zebra
  // `table.qc tr:nth-child(even) td` (0,2,3): a linha "VALOR LÍQUIDO DA
  // PROPOSTA" saía creme sobre creme, ilegível. A regra do total precisa ter
  // especificidade pelo menos igual à da zebra e vir depois dela.
  it("a linha de total do quadro comercial vence a zebra das linhas pares", () => {
    const css = cssBaseProposta();
    const zebra = css.indexOf("table.qc tr:nth-child(even) td{");
    const total = css.indexOf("table.qc tr.total td{");
    expect(zebra).toBeGreaterThanOrEqual(0);
    expect(total).toBeGreaterThan(zebra);
    expect(css).toContain("table.qc tr.total td:last-child{");
  });
  // O Chromium atual (149, local e @sparticuz/chromium na Vercel) implementa
  // margin boxes, `@page :first` e páginas nomeadas — o PDF segue o @page do
  // modelo, e capa e contracapa sangram sem cabeçalho nem rodapé.
  it("capa com a altura cheia do A4, como no modelo", () => {
    expect(cssBaseProposta()).toContain(".cover{width:210mm;height:297mm;");
    expect(cssBaseProposta()).not.toContain("calc(297mm - 42mm)");
  });

  it("o corpo não tem recuo próprio: o recuo lateral vem da margem do @page", () => {
    expect(cssBaseProposta()).not.toContain(".body-wrap{padding");
  });

  it("o degradê da contracapa fica numa camada interna, não no fundo da seção", () => {
    // No fundo da própria seção, o Chromium pinta um fio do degradê no pé da
    // página anterior (o modelo tem esse fio).
    const css = cssBaseProposta();
    expect(css).toMatch(/\.contracapa\{page:contracapa;[^}]*background:var\(--navy\);/);
    expect(css).toMatch(/\.contracapa-fundo\{[^}]*linear-gradient/);
  });

  it("separa os eixos da Arquitetura da grade de cima", () => {
    expect(cssBaseProposta()).toMatch(/\.grid3 \+ \.grid2\{margin-top:\d/);
  });
});

describe("cssPaginasProposta", () => {
  const css = cssPaginasProposta({ codigo: "NTC-PROP-1-v01", sigla: "EDUTEC", validade: "04/11/2026", emissao: "05/10/2026" });
  it("transcreve o @page do modelo, com margens e as quatro margin boxes", () => {
    expect(css).toContain("size: A4 portrait; margin: 20mm 18mm 22mm 18mm;");
    expect(css).toContain('@top-left { content: "Instituto NTC do Brasil · EDUTEC";');
    expect(css).toContain('@top-right { content: "NTC-PROP-1-v01";');
    expect(css).toContain('@bottom-left { content: "Validade: 04/11/2026 · Emitida: 05/10/2026";');
    expect(css).toContain('@bottom-right { content: "Página " counter(page) " de " counter(pages);');
  });
  it("capa (primeira página) e contracapa (página nomeada) sem margem nem margin boxes", () => {
    expect(css).toContain('@page :first { margin:0; @top-left{content:""}');
    expect(css).toContain('@page contracapa { margin:0; @top-left{content:""}');
  });
  it("sem sigla nem datas, não sobra separador", () => {
    const vazio = cssPaginasProposta({ codigo: "C", sigla: "", validade: "", emissao: "" });
    expect(vazio).toContain('@top-left { content: "Instituto NTC do Brasil";');
    expect(vazio).toContain('@bottom-left { content: "";');
  });
  it("escapa aspas, barra invertida e quebra de linha no conteúdo das margin boxes", () => {
    const c = cssPaginasProposta({ codigo: 'A"B\\C\nD', sigla: "S", validade: "", emissao: "" });
    expect(c).toContain('content: "A\\"B\\\\C\\A D";');
  });
});
