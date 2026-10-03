// packages/lib/src/crm/conteudoProposta.test.ts
import { describe, expect, it } from "vitest";

import { conteudoInicialProposta } from "./conteudoProposta";
import type { ContextoTextosProposta } from "./textosProposta";

const CTX: ContextoTextosProposta = {
  clienteOrgao: "SME de Palmas", clienteSigla: "SEMED", programaSigla: "EDUTEC",
  modalidade: "Online", replay: "180 dias", numModulos: 2,
};
const PROGRAMA = {
  eixos: [{ titulo: "E1", descricao: "d1" }],
  diferenciais: [{ titulo: "D1", descricao: "dd1" }],
  resultados: ["R1", "R2"],
};
const MODULOS = [{ id: "9", titulo: "Módulo um" }, { id: "10", titulo: "Módulo dois" }];

describe("conteudoInicialProposta", () => {
  it("copia eixos e diferenciais do programa", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.eixos).toEqual([{ titulo: "E1", descricao: "d1" }]);
    expect(c.diferenciais).toEqual([{ titulo: "D1", descricao: "dd1" }]);
  });

  it("resultados viram itens com a chave texto", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.resultados).toEqual([{ texto: "R1" }, { texto: "R2" }]);
  });

  it("um item por módulo escolhido, com o título do catálogo", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(c.modulosDetalhados).toEqual([
      { modulo: "9", tituloExibido: "Módulo um" },
      { modulo: "10", tituloExibido: "Módulo dois" },
    ]);
  });

  it("traz os 7 textos institucionais", () => {
    const c = conteudoInicialProposta({ programa: PROGRAMA, modulos: MODULOS, contextoTextos: CTX });
    expect(Object.keys(c.textos)).toHaveLength(7);
    expect(c.textos.fechamento).toContain("SME de Palmas");
  });

  it("sem programa, as listas nascem vazias e os textos continuam", () => {
    const c = conteudoInicialProposta({ programa: null, modulos: [], contextoTextos: CTX });
    expect(c.eixos).toEqual([]);
    expect(c.diferenciais).toEqual([]);
    expect(c.resultados).toEqual([]);
    expect(c.modulosDetalhados).toEqual([]);
    expect(Object.keys(c.textos)).toHaveLength(7);
  });

  it("sem programa, os módulos escolhidos ainda viram modulosDetalhados", () => {
    const c = conteudoInicialProposta({ programa: null, modulos: MODULOS, contextoTextos: CTX });
    expect(c.modulosDetalhados).toEqual([
      { modulo: "9", tituloExibido: "Módulo um" },
      { modulo: "10", tituloExibido: "Módulo dois" },
    ]);
    expect(c.eixos).toEqual([]);
    expect(c.diferenciais).toEqual([]);
    expect(c.resultados).toEqual([]);
  });
});
