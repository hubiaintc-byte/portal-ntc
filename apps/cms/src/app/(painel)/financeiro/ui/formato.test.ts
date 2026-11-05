import { describe, expect, it } from "vitest";

import {
  compacto,
  inteiro,
  intervaloDatas,
  lerCampoDinheiro,
  moeda,
  porcentagem,
  resumoGrafico,
  textoAoSairDinheiro,
  textoDeCentavos,
  tipoCurto,
} from "./formato";

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

describe("lerCampoDinheiro e textoAoSairDinheiro (CampoDinheiro valida ao sair)", () => {
  it("vazio é válido e sem valor", () => {
    expect(lerCampoDinheiro("  ")).toEqual({ valor: null, valido: true });
  });

  it("aceita os formatos brasileiros (Review Focus 2)", () => {
    expect(lerCampoDinheiro("1.234,56")).toEqual({ valor: 123456, valido: true });
    expect(lerCampoDinheiro("1234,5")).toEqual({ valor: 123450, valido: true });
    expect(lerCampoDinheiro("1234")).toEqual({ valor: 123400, valido: true });
    expect(lerCampoDinheiro("R$ 10")).toEqual({ valor: 1000, valido: true });
  });

  it("recusa texto que não é valor, inclusive os prefixos de uma digitação correta", () => {
    for (const t of ["abc", "1,2,3", "1.", "1.234,"]) expect(lerCampoDinheiro(t)).toEqual({ valor: null, valido: false });
  });

  it("ao sair reescreve o válido e mantém o inválido como digitado", () => {
    expect(textoAoSairDinheiro("1234,5")).toBe("1.234,50");
    expect(textoAoSairDinheiro("abc")).toBe("abc");
    expect(textoAoSairDinheiro("")).toBe("");
  });
});

describe("formatação da Visão Executiva (fmtBRL, fmtPct, fmtNum, fmtRange, tipoShort)", () => {
  it("moeda: traço no zero e na ausência, R$ 0,00 sem traço, sinal −", () => {
    expect(moeda(123456)).toBe("R$ 1.234,56");
    expect(moeda(-5000)).toBe("−R$ 50,00");
    expect(moeda(0)).toBe("—");
    expect(moeda(0, false)).toBe("R$ 0,00");
    expect(moeda(null)).toBe("—");
    expect(moeda(Number.NaN, false)).toBe("—");
  });

  it("porcentagem com casas e ÷ 0", () => {
    expect(porcentagem(0.625, 0)).toBe("63%");
    expect(porcentagem(null, 0)).toBe("—");
    expect(porcentagem(1 / 0, 0)).toBe("—");
  });

  it("inteiro, intervalo de datas e tipo curto", () => {
    expect(inteiro(1234)).toBe("1.234");
    expect(inteiro(Number.NaN)).toBe("—");
    expect(intervaloDatas("2026-08-05", "2026-08-07")).toBe("05–07/08/2026");
    expect(intervaloDatas("2026-08-30", "2026-09-02")).toBe("30/08/2026 – 02/09/2026");
    expect(intervaloDatas("2026-08-05", "2026-08-05")).toBe("05/08/2026");
    expect(intervaloDatas("", "")).toBe("—");
    expect(tipoCurto("In Company / Projeto B2G")).toBe("In Company / B2G");
    expect(tipoCurto("Módulo")).toBe("Módulo");
  });
});
