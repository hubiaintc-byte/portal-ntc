import { describe, expect, it } from "vitest";

import { montarCapa, montarResumoExecutivo, subtituloProposta } from "./capa";
import type { DadosDocumentoProposta } from "./dados";

describe("subtituloProposta", () => {
  it("trilha completa", () =>
    expect(subtituloProposta("programa-completo", 8, "EDUTEC")).toBe("Trilha Completa · EDUTEC"));
  it("combo por extenso", () =>
    expect(subtituloProposta("modulo-avulso", 3, "EDUTEC")).toBe(
      "Combo de Três Módulos · EDUTEC",
    ));
  it("módulo único", () =>
    expect(subtituloProposta("modulo-avulso", 1, "EDUTEC")).toBe("Módulo Avulso · EDUTEC"));
  it("sem módulos, só o programa", () =>
    expect(subtituloProposta("customizada", 0, "EDUTEC")).toBe("EDUTEC"));
  it("acima de dez volta ao algarismo", () =>
    expect(subtituloProposta("modulo-avulso", 12, "EDUTEC")).toBe(
      "Combo de 12 Módulos · EDUTEC",
    ));
  it("sem sigla, não sobra separador", () =>
    expect(subtituloProposta("modulo-avulso", 2, "")).toBe("Combo de Dois Módulos"));
});

const BASE: DadosDocumentoProposta = {
  id: "1",
  codigo: "NTC-PROP-2026-EDUTEC-TO-SEMED-v01",
  codigoBase: "NTC-PROP-2026-EDUTEC-TO-SEMED",
  versao: 1,
  tipoTexto: "Módulo Avulso",
  subtitulo: "Combo de Três Módulos · EDUTEC",
  modalidade: "Online ao vivo",
  replay: "180 dias",
  condPagto: "",
  condEspecificas: "",
  dataCriacaoISO: "2026-05-14T12:00:00.000Z",
  validadeISO: "2026-06-13T12:00:00.000Z",
  elaboradorNome: "Ana",
  clienteOrgao: "Secretaria Municipal de Educação de Palmas",
  clienteSigla: "SEMED-Palmas",
  clienteUf: "TO",
  clienteMunicipio: "Palmas",
  clienteDirigente: "Profa. Anice Moura",
  programaNome: "Educação Digital, Inovação e Tecnologias",
  programaSigla: "EDUTEC",
  itens: [
    { rotulo: "M1 · A", cargaHoraria: "8h", valorUnitario: 1470 },
    { rotulo: "M2 · B", cargaHoraria: "8h", valorUnitario: 1470 },
    { rotulo: "M4 · C", cargaHoraria: "8h", valorUnitario: 1470 },
  ],
  cargaHorariaTotalModulos: "24h · 3 módulos · 8h por módulo",
  conteudoHtml: {
    apresentacao: "", contexto: "", objetivos: "", publicoAlvo: "", metodologia: "", eventon: "",
    certificacaoReplay: "", cancelamento: "", protecaoConteudo: "", fundamentacaoLegal: "",
    proximosPassos: "", fechamento: "",
  },
  eixos: [], diferenciais: [], resultados: [], docentes: [], modulosDetalhados: [], secoesExtras: [],
  valorUnitario: 1470,
  qtdPagantes: 1800,
  cortesias: 180,
  percDesconto: 35.4,
  valorBruto: 2646000,
  desconto: 936000,
  valorLiquido: 1710126,
};

const SUJO = /undefined|NaN|Infinity|null/;

describe("montarCapa", () => {
  const html = montarCapa(BASE);
  it("traz código, órgão, sigla, dirigente, modalidade, carga e subtítulo", () => {
    for (const t of [
      BASE.codigo,
      BASE.clienteOrgao,
      "EDUTEC",
      "Profa. Anice Moura",
      "Online ao vivo",
      "24h · 3 módulos · 8h por módulo",
      "Combo de Três Módulos · EDUTEC",
      "1.800 pagantes + 180 cortesias",
    ])
      expect(html).toContain(t);
  });
  it("não vaza undefined/NaN/null", () => expect(html).not.toMatch(SUJO));
  it("contagem de módulos sem horas NÃO é impressa como carga horária", () => {
    const h = montarCapa({ ...BASE, cargaHorariaTotalModulos: "3 módulos" });
    expect(h).not.toContain("Carga Horária");
    expect(h).not.toContain("3 módulos");
    expect(h).not.toMatch(SUJO);
  });
  it("sem sigla, não imprime 'Programa ' solto nem subtitulo vazio", () => {
    const h = montarCapa({ ...BASE, programaSigla: "", subtitulo: "" });
    expect(h).not.toContain("Programa </div>");
    expect(h).not.toContain("selo-programa");
    expect(h).not.toContain('class="subtitulo"');
    expect(h).not.toContain("selo-tipo");
    expect(h).toContain(BASE.programaNome);
  });
});

describe("montarResumoExecutivo", () => {
  it("traz líquido, tabela, desconto, replay, cortesias e pagantes", () => {
    const h = montarResumoExecutivo(BASE);
    for (const t of ["1.710.126,00", "1.470,00", "35,4%", "180 dias", "180 cortesias", "1.800", "600 por módulo × 3 módulos", "para SEMED-Palmas"])
      expect(h).toContain(t);
    expect(h).toContain("(M01 · M02 · M04)");
    expect(h).not.toMatch(SUJO);
  });
  it("sem pagantes não produz NaN/Infinity", () => {
    const h = montarResumoExecutivo({ ...BASE, qtdPagantes: 0 });
    expect(h).not.toMatch(SUJO);
    expect(h).not.toContain("Valor por Inscrição");
  });
  it("sem módulos não imprime decomposição por módulo", () => {
    const h = montarResumoExecutivo({ ...BASE, itens: [], cargaHorariaTotalModulos: "" });
    expect(h).not.toContain("por módulo");
    expect(h).not.toContain("Carga Horária Total");
    expect(h).not.toMatch(SUJO);
  });
  it("imprime a carga horária total quando ela começa por horas", () => {
    const h = montarResumoExecutivo(BASE);
    expect(h).toContain("Carga Horária Total");
    expect(h).toContain("24h");
  });
  it("contagem de módulos sem horas NÃO é impressa como carga horária", () => {
    // dados.ts devolve só a contagem ("3 módulos") quando as cargas dos
    // módulos são heterogêneas ou ilegíveis; imprimir isso sob o rótulo
    // "Carga Horária Total" num documento contratual seria afirmar o errado.
    const h = montarResumoExecutivo({ ...BASE, cargaHorariaTotalModulos: "3 módulos" });
    expect(h).not.toContain("Carga Horária Total");
    expect(h).not.toMatch(SUJO);
  });
  it("divisão inexata não imprime por módulo", () => {
    expect(montarResumoExecutivo({ ...BASE, qtdPagantes: 1000, cortesias: 100 })).not.toContain("por módulo ×");
  });
});
