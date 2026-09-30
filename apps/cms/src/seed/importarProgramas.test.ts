import { describe, expect, it } from "vitest";

import { planejarImportacao } from "./importarProgramas";
import type { Instantaneo } from "../lib/cms/importacaoProgramas/tipos";

const instantaneo = (siglas: string[]): Instantaneo => ({
  geradoEm: "2026-09-30T00:00:00.000Z",
  programas: siglas.map((sigla) => ({
    sigla, slug: sigla.toLowerCase(), nomeCompleto: sigla,
    visaoGeralHtml: "<p>a</p>", problemaHtml: "<p>b</p>", objetivoHtml: null,
    publicoHtml: "<p>c</p>", publicoChips: [], eixos: [], resultadosHtml: "",
    diferenciais: [], faq: [], modulos: [],
  })),
});

describe("planejarImportacao", () => {
  it("casa por sigla e ignora diferença de caixa", () => {
    const r = planejarImportacao(instantaneo(["EDUTEC", "PROGE"]), [
      { id: 7, sigla: "edutec" },
      { id: 9, sigla: "PROGE" },
    ]);
    expect(r.paraImportar).toEqual([{ sigla: "EDUTEC", id: 7 }, { sigla: "PROGE", id: 9 }]);
    expect(r.semCorrespondencia).toEqual([]);
  });

  it("sigla do instantâneo que não existe no banco é relatada, nunca criada", () => {
    const r = planejarImportacao(instantaneo(["EDUTEC", "NOVO"]), [{ id: 7, sigla: "EDUTEC" }]);
    expect(r.paraImportar).toEqual([{ sigla: "EDUTEC", id: 7 }]);
    expect(r.semCorrespondencia).toEqual(["NOVO"]);
  });

  it("rodar de novo sobre o mesmo banco produz o mesmo plano", () => {
    const banco = [{ id: 7, sigla: "EDUTEC" }];
    const primeiro = planejarImportacao(instantaneo(["EDUTEC"]), banco);
    const segundo = planejarImportacao(instantaneo(["EDUTEC"]), banco);
    expect(segundo).toEqual(primeiro);
  });

  it("instantâneo vazio não planeja nada", () => {
    expect(planejarImportacao(instantaneo([]), [{ id: 7, sigla: "EDUTEC" }])).toEqual({
      paraImportar: [], semCorrespondencia: [],
    });
  });
});
