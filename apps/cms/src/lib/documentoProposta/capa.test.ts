import { describe, expect, it } from "vitest";

import { montarCapa, montarContracapa, montarResumoExecutivo, subtituloProposta } from "./capa";
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
  aprovadorNome: "Direção Executiva NTC",
  clienteOrgao: "Secretaria Municipal de Educação de Palmas",
  clienteSigla: "SEMED-Palmas",
  clienteUf: "TO",
  clienteMunicipio: "Palmas",
  clienteCnpj: "24.851.511/0001-85",
  clienteDirigente: "Profa. Anice Moura",
  clienteDirigenteCargo: "Secretária Municipal de Educação",
  clienteContatoEmail: "gabinete@orgao.gov.br",
  programaNome: "Educação Digital, Inovação e Tecnologias",
  programaSigla: "EDUTEC",
  programaTemas: "",
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
  eixos: [], diferenciais: [], resultados: [], docentes: [],
  modulosDetalhados: [
    { codigo: "M01", titulo: "A", cargaHoraria: "8h", ementaHtml: "" },
    { codigo: "M02", titulo: "B", cargaHoraria: "8h", ementaHtml: "" },
    { codigo: "M04", titulo: "C", cargaHoraria: "8h", ementaHtml: "" },
  ],
  secoesExtras: [],
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
  it("linha de temas do programa sai abaixo do selo, quando preenchida", () => {
    const h = montarCapa({ ...BASE, programaTemas: "Cultura Digital · IA <&>" });
    expect(h).toContain('<div class="tagline-programa">Cultura Digital · IA &lt;&amp;&gt;</div>');
    expect(h.indexOf("tagline-programa")).toBeGreaterThan(h.indexOf("selo-programa"));
  });
  it("sem linha de temas, a capa não imprime a tagline", () => {
    expect(montarCapa({ ...BASE, programaTemas: "  " })).not.toContain("tagline-programa");
  });
});

describe("montarResumoExecutivo · faixa e temas", () => {
  it("abre com a faixa do modelo: logo e 'Resumo Executivo' com a sigla", () => {
    const h = montarResumoExecutivo(BASE);
    expect(h).toMatch(/<section class="resumo-exec">\s*<div class="header-pag">/);
    expect(h).toContain("<svg");
    expect(h).toContain('<div class="programa-id">Resumo Executivo<span class="sigla">EDUTEC</span></div>');
  });
  it("sem sigla, a faixa fica só com 'Resumo Executivo'", () => {
    const h = montarResumoExecutivo({ ...BASE, programaSigla: "" });
    expect(h).toContain('<div class="programa-id">Resumo Executivo</div>');
  });
  it("o cartão Programa traz a linha de temas como descrição, quando preenchida", () => {
    const h = montarResumoExecutivo({ ...BASE, programaTemas: "Cultura Digital · IA" });
    expect(h).toContain('<div class="label">Programa</div><div class="value menor">EDUTEC</div><div class="desc">Cultura Digital · IA</div>');
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
    const h = montarResumoExecutivo({
      ...BASE,
      itens: [],
      modulosDetalhados: [],
      cargaHorariaTotalModulos: "",
    });
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
  it("evento na proposta não muda a contagem que o Resumo afirma", () => {
    // 3 módulos + 1 evento: antes da fix wave o Resumo dizia "4 módulos-evento"
    // e "450 por módulo × 4 módulos" enquanto o Quadro Comercial dividia por 3.
    const h = montarResumoExecutivo({
      ...BASE,
      itens: [...BASE.itens, { rotulo: "Seminário Nacional", cargaHoraria: "4h", valorUnitario: 1470 }],
    });
    expect(h).toContain("3 módulos-evento");
    expect(h).not.toContain("4 módulos-evento");
    expect(h).toContain("600 por módulo × 3 módulos");
    // O rótulo do evento não casa /^M\d+/ e antes zerava a enumeração inteira.
    expect(h).toContain("(M01 · M02 · M04)");
  });

  it("sem módulo legível, a contagem da prosa cai nos itens contratados", () => {
    const h = montarResumoExecutivo({
      ...BASE,
      modulosDetalhados: [],
      itens: [{ rotulo: "Seminário Nacional", cargaHoraria: "4h", valorUnitario: 1470 }],
      cargaHorariaTotalModulos: "",
    });
    expect(h).toContain("1 módulo-evento");
    expect(h).not.toContain("por módulo ×");
    expect(h).not.toMatch(SUJO);
  });

  it("divisão inexata não imprime por módulo", () => {
    expect(montarResumoExecutivo({ ...BASE, qtdPagantes: 1000, cortesias: 100 })).not.toContain("por módulo ×");
  });
});

describe("montarContracapa", () => {
  const h = montarContracapa({ ...BASE, versao: 1, programaTemas: "Cultura Digital · IA" });
  it("é a seção .contracapa do modelo, com logo, slogan e dados institucionais", () => {
    expect(h).toMatch(/^<section class="contracapa">/);
    // O degradê fica numa camada interna, não no fundo da seção — ver tokens.ts.
    expect(h).toContain('<div class="contracapa-fundo"></div>');
    expect(h).toContain('<div class="logo-grande"><svg');
    expect(h).toContain("Inteligência institucional.<br>Impacto real.");
    expect(h).toContain("SCS Quadra 9 · Bloco C · Ed. Parque Cidade Corporate · Sala 1001 · Asa Sul");
    expect(h).toContain("contato@institutontc.com.br");
  });
  it("traz a sigla e a linha de temas do programa", () => {
    expect(h).toContain("Programas Estratégicos do Instituto NTC do Brasil &nbsp;·&nbsp; EDUTEC");
    expect(h).toContain(">Cultura Digital · IA</span>");
  });
  it("fecha com código, versão com dois dígitos e sigla", () => {
    expect(h).toContain(`<div class="selo-final">Proposta ${BASE.codigo} · Versão v01 · EDUTEC</div>`);
  });
  it("sem sigla nem temas, não sobra separador nem linha vazia", () => {
    const v = montarContracapa({ ...BASE, programaSigla: "", programaTemas: "" });
    expect(v).toContain("Programas Estratégicos do Instituto NTC do Brasil\n");
    expect(v).not.toContain("&nbsp;·&nbsp;");
    expect(v).not.toContain("<br>\n      <span");
    expect(v).toMatch(/Versão v\d\d<\/div>/);
  });
  it("não vaza undefined/NaN/null", () => expect(h).not.toMatch(SUJO));
});
