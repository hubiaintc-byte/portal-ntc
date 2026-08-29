import { describe, expect, it } from "vitest";

import { montarHtmlDocumentoProposta } from "./html";
import type { DadosDocumentoProposta } from "./dados";

const DADOS_BASE: DadosDocumentoProposta = {
  id: "42",
  codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
  codigoBase: "NTC-PROP-2026-PROGE-SP-X",
  versao: 1,
  tipoTexto: "Trilha Completa de Programa Estratégico",
  modalidade: "Presencial",
  replay: "90 dias",
  condPagto: "À vista após NF · 15 dias",
  condEspecificas: "",
  dataCriacaoISO: "2026-08-29T12:00:00.000Z",
  validadeISO: "2026-09-28T12:00:00.000Z",
  elaboradorNome: "Ana Comercial",
  clienteOrgao: "Secretaria de Educação de São Paulo",
  clienteSigla: "SEDUC-SP",
  clienteUf: "SP",
  clienteMunicipio: "São Paulo",
  clienteDirigente: "Fulano de Tal",
  programaNome: "Programa de Gestão Estratégica",
  programaSigla: "PROGE",
  itens: [{ rotulo: "M1 · Gestão Democrática", cargaHoraria: "40h", valorUnitario: 100 }],
  valorUnitario: 100,
  qtdPagantes: 10,
  cortesias: 2,
  percDesconto: 10,
  valorBruto: 1000,
  desconto: 100,
  valorLiquido: 900,
};

describe("montarHtmlDocumentoProposta", () => {
  it("inclui a capa com código, cliente e tipo", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    expect(html).toContain("NTC-PROP-2026-PROGE-SP-X-v01");
    expect(html).toContain("Secretaria de Educação de São Paulo");
    expect(html).toContain("Trilha Completa de Programa Estratégico");
  });

  it("numera as 3 seções em sequência (1, 2, 3) sem pular números", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    const numeros = [...html.matchAll(/<span class="num">(\d+)<\/span>/g)].map((m) => m[1]);
    expect(numeros).toEqual(["1", "2", "3"]);
  });

  it("omite Condições Específicas quando vazia, mas mantém Forma de Pagamento", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    expect(html).not.toContain("Condições Específicas");
    expect(html).toContain("À vista após NF · 15 dias");
  });

  it("inclui Condições Específicas quando preenchida", () => {
    const html = montarHtmlDocumentoProposta({
      ...DADOS_BASE,
      condEspecificas: "Sujeito a aprovação orçamentária.",
    });
    expect(html).toContain("Condições Específicas");
    expect(html).toContain("Sujeito a aprovação orçamentária.");
  });

  it("escapa HTML nos campos de texto livre (evita injeção no PDF)", () => {
    const html = montarHtmlDocumentoProposta({
      ...DADOS_BASE,
      clienteOrgao: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formata valores em BRL e datas em dd/mm/aaaa", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    // normaliza espaço não-quebrável (U+00A0) que o Intl.NumberFormat pt-BR
    // pode emitir entre "R$" e o valor, dependendo do ICU do runtime —
    // mesma defesa já usada em apps/cms/src/lib/cms/kpisComercial.test.ts.
    expect(html.replace(/\s/g, " ")).toContain("R$ 900");
    expect(html).toContain("29/08/2026");
  });
});
