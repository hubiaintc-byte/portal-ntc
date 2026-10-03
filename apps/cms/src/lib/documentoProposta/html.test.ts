import { describe, expect, it } from "vitest";

import type { DadosDocumentoProposta } from "./dados";
import { montarHtmlDocumentoProposta } from "./html";

/** Proposta com TODOS os campos preenchidos: fecha as 21 seções do modelo. */
const DADOS_COMPLETOS: DadosDocumentoProposta = {
  id: "42",
  codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
  codigoBase: "NTC-PROP-2026-PROGE-SP-X",
  versao: 1,
  tipoTexto: "Trilha Completa de Programa Estratégico",
  subtitulo: "Trilha Completa · PROGE",
  modalidade: "Online ao vivo · EventON NTC",
  replay: "180 dias",
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
  cargaHorariaTotalModulos: "40h · 1 módulo",
  conteudoHtml: {
    apresentacao: "<p>apresentação</p>",
    contexto: "<p>contexto</p>",
    objetivos: "<p>objetivos</p>",
    publicoAlvo: "<p>público-alvo</p>",
    metodologia: "<p>metodologia</p>",
    eventon: "<p>eventon</p>",
    certificacaoReplay: "<p>certificação</p>",
    cancelamento: "<p>cancelamento</p>",
    protecaoConteudo: "<p>proteção</p>",
    fundamentacaoLegal: "<p>fundamentação</p>",
    proximosPassos: "<p>próximos passos</p>",
    fechamento: "<p>fechamento</p>",
  },
  eixos: [{ titulo: "Eixo 1", descricao: "Descrição do eixo." }],
  diferenciais: [{ titulo: "Selo institucional", descricao: "Qualidade técnica." }],
  resultados: ["Rede qualificada."],
  docentes: [{ nome: "Roberta Aquino", credencial: "Doutora · Unicamp", eixo: "Eixo 1" }],
  modulosDetalhados: [
    { codigo: "M01", titulo: "Gestão Democrática", cargaHoraria: "40h", ementaHtml: "<p>ementa</p>" },
  ],
  secoesExtras: [],
  valorUnitario: 100,
  qtdPagantes: 10,
  cortesias: 2,
  percDesconto: 10,
  valorBruto: 1000,
  desconto: 100,
  valorLiquido: 900,
};

/** Proposta recém-criada: nenhum texto, nenhum módulo, nenhum valor. */
const DADOS_VAZIOS: DadosDocumentoProposta = {
  ...DADOS_COMPLETOS,
  modalidade: "",
  replay: "",
  condPagto: "",
  programaSigla: "",
  cargaHorariaTotalModulos: "",
  clienteOrgao: "—",
  clienteSigla: "—",
  clienteUf: "",
  clienteMunicipio: "—",
  clienteDirigente: "—",
  dataCriacaoISO: null,
  validadeISO: null,
  itens: [],
  conteudoHtml: {
    apresentacao: "",
    contexto: "",
    objetivos: "",
    publicoAlvo: "",
    metodologia: "",
    eventon: "",
    certificacaoReplay: "",
    cancelamento: "",
    protecaoConteudo: "",
    fundamentacaoLegal: "",
    proximosPassos: "",
    fechamento: "",
  },
  eixos: [],
  diferenciais: [],
  resultados: [],
  docentes: [],
  modulosDetalhados: [],
  valorUnitario: 0,
  qtdPagantes: 0,
  cortesias: 0,
  percDesconto: 0,
  valorBruto: 0,
  desconto: 0,
  valorLiquido: 0,
};

interface SecaoLida {
  numero: number;
  titulo: string;
}

function secoesDo(html: string): SecaoLida[] {
  return [...html.matchAll(/<h2><span class="num">(\d+)<\/span>([^<]*)<\/h2>/g)].map((m) => ({
    numero: Number(m[1]),
    titulo: m[2] ?? "",
  }));
}

describe("montarHtmlDocumentoProposta", () => {
  it("monta as 21 seções do modelo, na ordem e numeradas de 3 a 23", () => {
    const secoes = secoesDo(montarHtmlDocumentoProposta(DADOS_COMPLETOS));
    expect(secoes.map((s) => s.titulo)).toEqual([
      "Dados de Identificação da Proposta",
      "Apresentação Executiva",
      "Contexto e Justificativa",
      "Objeto da Proposta",
      "Objetivos",
      "Público-alvo",
      "Arquitetura da Solução",
      "Módulos Contratados",
      "Metodologia",
      "Corpo Docente e Curadoria",
      "Diferenciais NTC",
      "Resultados Esperados",
      "Quadro Comercial",
      "Condições Comerciais",
      "Condições de Participação · Evento Online EventON",
      "Certificação e Replay",
      "Cancelamento, Substituição e Reagendamento",
      "Proteção de Conteúdo e Direitos Autorais",
      "Fundamentação Legal e Segurança Jurídica",
      "Próximos Passos",
      "Fechamento Institucional",
    ]);
    expect(secoes.map((s) => s.numero)).toEqual([
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    ]);
  });

  it("traz a capa e o Resumo Executivo antes das seções numeradas", () => {
    const html = montarHtmlDocumentoProposta(DADOS_COMPLETOS);
    expect(html.indexOf('class="cover"')).toBeGreaterThan(-1);
    expect(html.indexOf('class="cover"')).toBeLessThan(html.indexOf('class="resumo-exec"'));
    expect(html.indexOf('class="resumo-exec"')).toBeLessThan(html.indexOf('class="num"'));
    expect(html).toContain("NTC-PROP-2026-PROGE-SP-X-v01");
    expect(html).toContain("Secretaria de Educação de São Paulo");
  });

  it("usa a paleta do modelo, nunca a Soberana", () => {
    const html = montarHtmlDocumentoProposta(DADOS_COMPLETOS);
    expect(html).toContain("#0E2A47");
    expect(html).toContain("#B68B40");
    expect(html).not.toContain("#11365E");
    expect(html).not.toContain("#B5995A");
  });

  it("não busca fonte na rede nem usa margin boxes de paged media", () => {
    const html = montarHtmlDocumentoProposta(DADOS_COMPLETOS);
    expect(html).not.toContain("fonts.googleapis");
    expect(html).not.toContain("fonts.gstatic");
    expect(html).not.toContain("@top-left");
    expect(html).not.toContain("@bottom-right");
    expect(html).toContain("@font-face");
  });

  it("em Presencial, omite a seção de EventON e fecha a numeração sem buraco", () => {
    const secoes = secoesDo(
      montarHtmlDocumentoProposta({ ...DADOS_COMPLETOS, modalidade: "Presencial" }),
    );
    expect(secoes).toHaveLength(20);
    expect(secoes.map((s) => s.titulo)).not.toContain(
      "Condições de Participação · Evento Online EventON",
    );
    expect(secoes.map((s) => s.numero)).toEqual(
      secoes.map((_, i) => 3 + i),
    );
  });

  it("proposta vazia gera documento sem undefined/NaN, com numeração contígua", () => {
    const html = montarHtmlDocumentoProposta(DADOS_VAZIOS);
    const secoes = secoesDo(html);
    expect(secoes.length).toBeGreaterThan(0);
    expect(secoes.map((s) => s.numero)).toEqual(secoes.map((_, i) => 3 + i));
    expect(secoes.map((s) => s.titulo)).toContain("Dados de Identificação da Proposta");
    expect(secoes.map((s) => s.titulo)).not.toContain("Módulos Contratados");
    expect(secoes.map((s) => s.titulo)).not.toContain("Corpo Docente e Curadoria");
    // As fontes base64 trazem qualquer sequência de letras; a varredura olha
    // só o corpo do documento, depois do </style>.
    const corpo = html.slice(html.indexOf("</style>"));
    expect(corpo).not.toMatch(/undefined|NaN|Infinity/);
  });

  it("intercala a seção extra em cada uma das 3 posições previstas", () => {
    const extras = montarHtmlDocumentoProposta({
      ...DADOS_COMPLETOS,
      secoesExtras: [
        { titulo: "Antes do Quadro", corpoHtml: "<p>a</p>", posicao: "antes-quadro-comercial" },
        { titulo: "Depois das Condições", corpoHtml: "<p>b</p>", posicao: "apos-condicoes-comerciais" },
        { titulo: "No Fim", corpoHtml: "<p>c</p>", posicao: "fim" },
      ],
    });
    const titulos = secoesDo(extras).map((s) => s.titulo);
    expect(titulos).toHaveLength(24);
    expect(titulos[titulos.indexOf("Quadro Comercial") - 1]).toBe("Antes do Quadro");
    expect(titulos[titulos.indexOf("Condições Comerciais") + 1]).toBe("Depois das Condições");
    expect(titulos[titulos.indexOf("Fechamento Institucional") - 1]).toBe("No Fim");
    expect(secoesDo(extras).map((s) => s.numero)).toEqual(titulos.map((_, i) => 3 + i));
  });

  it("escapa HTML nos campos de texto livre (evita injeção no PDF)", () => {
    const html = montarHtmlDocumentoProposta({
      ...DADOS_COMPLETOS,
      clienteOrgao: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formata valores em BRL com centavos e datas em dd/mm/aaaa", () => {
    const html = montarHtmlDocumentoProposta(DADOS_COMPLETOS);
    // normaliza espaço não-quebrável (U+00A0) que o Intl.NumberFormat pt-BR
    // pode emitir entre "R$" e o valor, dependendo do ICU do runtime.
    expect(html.replace(/\s/g, " ")).toContain("R$ 900,00");
    expect(html).toContain("29/08/2026");
  });
});
