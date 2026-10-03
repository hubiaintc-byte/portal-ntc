import { describe, expect, it } from "vitest";

import {
  cargaHorariaTotalDosModulos,
  contagemDeItensDoDocumento,
  digitosDoCodigo,
  modulosContadosDoDocumento,
} from "./modulos";

const mod = (codigo: string, titulo: string, cargaHoraria: string | null = "8h") => ({
  codigo,
  titulo,
  cargaHoraria,
});

describe("digitosDoCodigo", () => {
  it("lê os dígitos do código", () => expect(digitosDoCodigo("M04")).toBe("04"));
  it("código vazio não é legível", () => expect(digitosDoCodigo("")).toBeNull());
  it("código sem dígito não é legível", () => expect(digitosDoCodigo("M")).toBeNull());
});

describe("modulosContadosDoDocumento", () => {
  it("devolve dígitos, número, título e carga de cada módulo", () => {
    expect(modulosContadosDoDocumento([mod("M01", "A"), mod("M04", "B", "16h")])).toEqual([
      { digitos: "01", numero: 1, titulo: "A", cargaHoraria: "8h" },
      { digitos: "04", numero: 4, titulo: "B", cargaHoraria: "16h" },
    ]);
  });

  it("carga vazia do Payload vira null (linhasDoQuadro só trata null)", () => {
    expect(modulosContadosDoDocumento([mod("M01", "A", "  ")])[0]?.cargaHoraria).toBeNull();
  });

  it("um código ilegível zera a lista inteira (todo-ou-nada)", () => {
    expect(modulosContadosDoDocumento([mod("M01", "A"), mod("", "Órfão")])).toEqual([]);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(modulosContadosDoDocumento([])).toEqual([]);
  });
});

describe("contagemDeItensDoDocumento", () => {
  it("com módulos legíveis, conta os módulos — nunca os itens", () => {
    // 2 módulos + 1 evento em `itens`: é o caso que produzia dois
    // quantitativos contraditórios no mesmo PDF antes da fix wave.
    expect(
      contagemDeItensDoDocumento({
        modulosDetalhados: [mod("M01", "A"), mod("M02", "B")],
        itens: [1, 2, 3],
      }),
    ).toBe(2);
  });

  it("sem módulo legível, cai nos itens contratados (fallback da Fase B2)", () => {
    expect(contagemDeItensDoDocumento({ modulosDetalhados: [], itens: [1] })).toBe(1);
  });

  it("sem módulo e sem item, zero", () => {
    expect(contagemDeItensDoDocumento({ modulosDetalhados: [], itens: [] })).toBe(0);
  });
});

describe("cargaHorariaTotalDosModulos", () => {
  it("mesma carga legível soma", () =>
    expect(cargaHorariaTotalDosModulos([mod("M01", "A"), mod("M02", "B", "8 horas")])).toBe(
      "16h · 2 módulos · 8h por módulo",
    ));
  it("cargas diferentes não inventam total", () =>
    expect(cargaHorariaTotalDosModulos([mod("M01", "A"), mod("M02", "B", "16h")])).toBe(
      "2 módulos",
    ));
  it("carga composta não é somada", () =>
    expect(cargaHorariaTotalDosModulos([mod("M01", "A", "16h · 2 dias")])).toBe("1 módulo"));
  it("um módulo não repete 'por módulo'", () =>
    expect(cargaHorariaTotalDosModulos([mod("M01", "A", "40h")])).toBe("40h · 1 módulo"));
  it("sem módulos, string vazia", () => expect(cargaHorariaTotalDosModulos([])).toBe(""));
});
