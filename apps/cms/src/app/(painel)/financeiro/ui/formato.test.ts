import { describe, expect, it } from "vitest";

import { compacto, porcentagem, resumoGrafico, textoDeCentavos } from "./formato";

describe("resumoGrafico (aria-label dos gráficos, spec §5)", () => {
  it("livro vazio não produz NaN", () => {
    expect(resumoGrafico({ labels: [], series: [] })).toBe("sem dados no recorte");
    const r = resumoGrafico({ labels: ["Educação"], series: [{ nome: "Receita", valores: [Number.NaN] }] });
    expect(r).toBe("Educação: R$ 0,00");
    expect(r).not.toMatch(/NaN|Infinity/);
  });

  it("descreve cada rótulo com o nome e o valor em reais de cada série", () => {
    const r = resumoGrafico({
      labels: ["jul/26", "ago/26"],
      series: [
        { nome: "Faturado", valores: [123456, 0] },
        { nome: "Pago", valores: [1000, 50], tipo: "linha" },
      ],
    });
    expect(r).toBe("jul/26: Faturado R$ 1.234,56, Pago R$ 10,00; ago/26: Faturado R$ 0,00, Pago R$ 0,50");
  });

  it("contagens saem sem R$", () => {
    expect(resumoGrafico({ labels: ["SME"], series: [{ nome: "Pagantes", valores: [1800] }] }, false)).toBe("SME: 1.800");
  });
});

describe("textoDeCentavos (exibição do CampoDinheiro)", () => {
  it("formata no padrão brasileiro e deixa vazio o zero", () => {
    expect(textoDeCentavos(123456)).toBe("1.234,56");
    expect(textoDeCentavos(0)).toBe("");
    expect(textoDeCentavos(null)).toBe("");
  });
});

describe("compacto e porcentagem (eixos e tooltip da rosca)", () => {
  it("segue o Charts.compact e o fmtPct do protótipo", () => {
    expect(compacto(120_000_000)).toBe("1,2 mi");
    expect(compacto(35_000_000)).toBe("350 mil");
    expect(compacto(80_000)).toBe("800");
    expect(compacto(Number.NaN)).toBe("0");
    expect(porcentagem(0.3537)).toBe("35,4%");
    expect(porcentagem(0 / 0)).toBe("—");
  });
});
