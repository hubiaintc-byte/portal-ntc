import { describe, expect, it } from "vitest";

import { mapearPrograma, romanoParaInteiro } from "./mapear";
import type { ProgramaInstantaneo } from "./tipos";

const BASE: ProgramaInstantaneo = {
  sigla: "EDUTEC",
  slug: "edutec",
  nomeCompleto: "Educação Conectada",
  visaoGeralHtml: "<p>Visão.</p>",
  problemaHtml: "<p>Problema.</p>",
  objetivoHtml: "<p>Objetivo.</p>",
  publicoHtml: "<p>Para quem:</p>",
  publicoChips: ["Diretores", "Coordenadores"],
  eixos: [{ titulo: "Eixo 1", descricao: "Desc 1" }],
  resultadosHtml: '<div class="results-grid"><div class="result-card"><span class="r-num">01</span><p>Rede qualificada.</p></div></div>',
  diferenciais: [{ titulo: "Dif 1", descricao: "Desc" }],
  faq: [{ pergunta: "Posso cursar um módulo?", resposta: "Sim." }],
  modulos: [{ numero: "I", titulo: "Módulo um", cargaHoraria: "8h", descricao: "Desc do módulo.", topicos: ["Tópico A", "Tópico B"] }],
  cargaHorariaTotal: "64 horas",
};

describe("romanoParaInteiro", () => {
  it("converte os romanos usados nos programas", () => {
    expect(romanoParaInteiro("I")).toBe(1);
    expect(romanoParaInteiro("IV")).toBe(4);
    expect(romanoParaInteiro("VIII")).toBe(8);
    expect(romanoParaInteiro("XX")).toBe(20);
  });

  it("recusa o que não é romano válido de I a XX", () => {
    expect(romanoParaInteiro("")).toBeNull();
    expect(romanoParaInteiro("01")).toBeNull();
    expect(romanoParaInteiro("XXI")).toBeNull();
    expect(romanoParaInteiro("IIII")).toBeNull();
  });
});

describe("mapearPrograma", () => {
  it("mapeia os campos de texto para Lexical", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.visaoGeral.root.children.length).toBeGreaterThan(0);
    expect(campos.problema.root.children.length).toBeGreaterThan(0);
    expect(campos.objetivo?.root.children.length).toBeGreaterThan(0);
  });

  it("extrai os cartões de resultado para o array", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.resultadosEsperados).toEqual([{ resultado: "Rede qualificada." }]);
  });

  it("junta os chips do público ao corpo", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.publicoAlvo.root.children).toHaveLength(2);
  });

  it("copia eixos e diferenciais sem alterar", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.eixosTematicos).toEqual([{ titulo: "Eixo 1", descricao: "Desc 1" }]);
    expect(campos.diferenciais).toEqual([{ titulo: "Dif 1", descricao: "Desc" }]);
  });

  it("converte a resposta do FAQ para Lexical", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.faq[0]!.pergunta).toBe("Posso cursar um módulo?");
    expect(campos.faq[0]!.resposta.root.children.length).toBeGreaterThan(0);
  });

  it("monta a ementa com a descrição e os tópicos", () => {
    const { modulos } = mapearPrograma(BASE);
    expect(modulos).toHaveLength(1);
    expect(modulos[0]!.numero).toBe(1);
    expect(modulos[0]!.cargaHoraria).toBe("8h");
    expect(modulos[0]!.ementa.root.children).toHaveLength(2);
  });

  it("modulosQuantidade é a contagem de módulos", () => {
    const { campos } = mapearPrograma(BASE);
    expect(campos.modulosQuantidade).toBe(1);
  });

  it("objetivo ausente não vira campo vazio e é avisado", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, objetivoHtml: null });
    expect(campos.objetivo).toBeUndefined();
    expect(avisos).toContainEqual({ campo: "objetivo", motivo: "ausente na origem" });
  });

  it("diferenciais e chips ausentes não quebram", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, diferenciais: [], publicoChips: [] });
    expect(campos.diferenciais).toEqual([]);
    expect(campos.publicoAlvo.root.children).toHaveLength(1);
    expect(avisos).toContainEqual({ campo: "diferenciais", motivo: "ausente na origem" });
  });

  it("módulo sem tópicos grava a ementa só com a descrição, e avisa", () => {
    const { modulos, avisos } = mapearPrograma({
      ...BASE,
      modulos: [{ numero: "II", titulo: "M2", cargaHoraria: "8h", descricao: "Só descrição.", topicos: [] }],
    });
    expect(modulos[0]!.ementa.root.children).toHaveLength(1);
    expect(avisos).toContainEqual({ campo: "modulos[II].topicos", motivo: "ausente na origem" });
  });

  it("numeral romano inválido descarta o módulo e avisa, sem gravar NaN", () => {
    const { modulos, avisos } = mapearPrograma({
      ...BASE,
      modulos: [{ numero: "XXV", titulo: "M", cargaHoraria: "8h", descricao: "d", topicos: [] }],
    });
    expect(modulos).toHaveLength(0);
    expect(avisos).toContainEqual({ campo: "modulos[XXV].numero", motivo: "numeral romano fora de I–XX" });
  });

  it("tag fora do subconjunto no corpo vira aviso do campo", () => {
    const { avisos } = mapearPrograma({ ...BASE, visaoGeralHtml: '<div class="x"><p>a</p></div>' });
    expect(avisos).toContainEqual({ campo: "visaoGeral", motivo: "tag ignorada: div" });
  });

  it("resultadosHtml sem cartão nenhum é avisado, não só um array vazio silencioso", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, resultadosHtml: "<p>sem cartões aqui</p>" });
    expect(campos.resultadosEsperados).toEqual([]);
    expect(avisos).toContainEqual({ campo: "resultadosEsperados", motivo: "ausente na origem" });
  });

  it("copia cargaHorariaTotal quando a origem tem", () => {
    const { campos, avisos } = mapearPrograma(BASE);
    expect(campos.cargaHorariaTotal).toBe("64 horas");
    expect(avisos).not.toContainEqual(expect.objectContaining({ campo: "cargaHorariaTotal" }));
  });

  it("cargaHorariaTotal vazia não vira campo vazio (não sobrescreve o banco) e é avisada", () => {
    const { campos, avisos } = mapearPrograma({ ...BASE, cargaHorariaTotal: "" });
    expect(campos.cargaHorariaTotal).toBeUndefined();
    expect(avisos).toContainEqual({ campo: "cargaHorariaTotal", motivo: "ausente na origem" });
  });
});
