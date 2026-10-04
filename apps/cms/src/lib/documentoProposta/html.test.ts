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
  aprovadorNome: "Direção Executiva NTC",
  clienteOrgao: "Secretaria de Educação de São Paulo",
  clienteSigla: "SEDUC-SP",
  clienteUf: "SP",
  clienteMunicipio: "São Paulo",
  clienteCnpj: "24.851.511/0001-85",
  clienteDirigente: "Fulano de Tal",
  clienteDirigenteCargo: "Secretária Municipal de Educação",
  clienteContatoEmail: "gabinete@orgao.gov.br",
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
  clienteCnpj: "",
  clienteDirigente: "—",
  clienteDirigenteCargo: "",
  clienteContatoEmail: "",
  aprovadorNome: "",
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

/** O HTML do documento; `montarHtmlDocumentoProposta` devolve também as omitidas. */
function htmlDe(d: DadosDocumentoProposta): string {
  return montarHtmlDocumentoProposta(d).html;
}

function secoesDo(html: string): SecaoLida[] {
  return [...html.matchAll(/<h2><span class="num">(\d+)<\/span>([^<]*)<\/h2>/g)].map((m) => ({
    numero: Number(m[1]),
    titulo: m[2] ?? "",
  }));
}

describe("montarHtmlDocumentoProposta", () => {
  it("monta as 21 seções do modelo, na ordem e numeradas de 3 a 23", () => {
    const secoes = secoesDo(htmlDe(DADOS_COMPLETOS));
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
    const html = htmlDe(DADOS_COMPLETOS);
    expect(html.indexOf('class="cover"')).toBeGreaterThan(-1);
    expect(html.indexOf('class="cover"')).toBeLessThan(html.indexOf('class="resumo-exec"'));
    expect(html.indexOf('class="resumo-exec"')).toBeLessThan(html.indexOf('class="num"'));
    expect(html).toContain("NTC-PROP-2026-PROGE-SP-X-v01");
    expect(html).toContain("Secretaria de Educação de São Paulo");
  });

  it("usa a paleta do modelo, nunca a Soberana", () => {
    const html = htmlDe(DADOS_COMPLETOS);
    expect(html).toContain("#0E2A47");
    expect(html).toContain("#B68B40");
    expect(html).not.toContain("#11365E");
    expect(html).not.toContain("#B5995A");
  });

  it("não busca fonte na rede nem usa margin boxes de paged media", () => {
    const html = htmlDe(DADOS_COMPLETOS);
    expect(html).not.toContain("fonts.googleapis");
    expect(html).not.toContain("fonts.gstatic");
    expect(html).not.toContain("@top-left");
    expect(html).not.toContain("@bottom-right");
    expect(html).toContain("@font-face");
  });

  it("em Presencial, omite a seção de EventON e fecha a numeração sem buraco", () => {
    const secoes = secoesDo(
      htmlDe({ ...DADOS_COMPLETOS, modalidade: "Presencial" }),
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
    const html = htmlDe(DADOS_VAZIOS);
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

  it("seção 3: imprime as 13 caixas do modelo, com os rótulos dele", () => {
    const html = htmlDe(DADOS_COMPLETOS);
    const secao = html.slice(html.indexOf("Dados de Identificação da Proposta"));
    const corpo = secao.slice(0, secao.indexOf("</section>"));
    for (const rotulo of [
      "Código da Proposta",
      "Versão",
      "Cliente",
      "UF · Município",
      "CNPJ",
      "Dirigente",
      "Contato Institucional",
      "Programa",
      "Escopo",
      "Modalidade",
      "Replay",
      "Emissão · Validade",
      "Elaborador · Aprovador",
    ])
      expect(corpo).toContain(`<div class="label">${rotulo}</div>`);
    expect(corpo.match(/<div class="box">/g)).toHaveLength(13);
    // O dado de cada caixa que a Fase B2 não imprimia.
    expect(corpo).toContain("24.851.511/0001-85");
    expect(corpo).toContain("Secretária Municipal de Educação");
    expect(corpo).toContain("gabinete@orgao.gov.br");
    expect(corpo).toContain("SP · São Paulo");
    expect(corpo).toContain("1 módulo-evento · 40h totais");
    // A autoria, que a Fase B2 trazia na capa e esta branch havia perdido.
    expect(corpo).toContain("Ana Comercial");
    expect(corpo).toContain("Direção Executiva NTC");
    expect(corpo).toContain("29/08/2026 · 28/09/2026");
    // Classe por caixa, como o modelo (linhas 246-258): das 13, só Versão usa
    // `value` (Cormorant 14pt), as outras 12 usam `text` (corpo 9.8pt).
    expect(corpo).toContain('<div class="label">Versão</div><div class="value">v01</div>');
    expect(corpo.match(/<div class="value"/g)).toHaveLength(1);
    expect(corpo.match(/<div class="text"/g)).toHaveLength(12);
  });

  it("seção 3: caixa sem dado é omitida, nunca impressa vazia", () => {
    const html = htmlDe(DADOS_VAZIOS);
    const secao = html.slice(html.indexOf("Dados de Identificação da Proposta"));
    const corpo = secao.slice(0, secao.indexOf("</section>"));
    for (const rotulo of [
      "UF · Município",
      "CNPJ",
      "Dirigente",
      "Contato Institucional",
      "Escopo",
      "Modalidade",
      "Replay",
      "Emissão · Validade",
    ])
      expect(corpo).not.toContain(`<div class="label">${rotulo}</div>`);
    // Sobram as caixas que sempre têm dado (código, versão, cliente, programa)
    // mais Elaborador · Aprovador, que cai no default "Comercial NTC".
    expect(corpo.match(/<div class="box">/g)).toHaveLength(5);
    expect(corpo).not.toMatch(/<div class="text"[^>]*><\/div>/);
  });

  it("intercala a seção extra em cada uma das 3 posições previstas", () => {
    const extras = htmlDe({
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

  it("devolve o relatório de omissão junto com o HTML", () => {
    const r = montarHtmlDocumentoProposta({
      ...DADOS_COMPLETOS,
      docentes: [],
      conteudoHtml: { ...DADOS_COMPLETOS.conteudoHtml, metodologia: "" },
      secoesExtras: [{ titulo: "", corpoHtml: "<p>rascunho</p>", posicao: "fim" }],
    });
    expect(r.html).toContain("<!DOCTYPE html>");
    expect(r.omitidas.map((o) => o.titulo)).toEqual([
      "Metodologia",
      "Corpo Docente e Curadoria",
      "Seção extra sem título",
    ]);
    expect(r.omitidas.map((o) => o.chave)).toEqual(["metodologia", "docentes", ""]);
  });

  it("EventON omitida pela modalidade não entra no relatório (a tela já sinaliza)", () => {
    // `secoesInstitucionais` nem produz a seção fora de online, então ela não
    // chega a `montarSecoes`. Quem avisa é o selo "não sai no documento" do
    // editor daquela seção (prop `omitida` de `ConteudoProposta`).
    const r = montarHtmlDocumentoProposta({ ...DADOS_COMPLETOS, modalidade: "Presencial" });
    expect(r.omitidas).toEqual([]);
    expect(secoesDo(r.html).map((s) => s.titulo)).not.toContain(
      "Condições de Participação · Evento Online EventON",
    );
  });

  it("documento completo não omite nada", () => {
    expect(montarHtmlDocumentoProposta(DADOS_COMPLETOS).omitidas).toEqual([]);
  });

  it("escapa HTML nos campos de texto livre (evita injeção no PDF)", () => {
    const html = htmlDe({
      ...DADOS_COMPLETOS,
      clienteOrgao: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formata valores em BRL com centavos e datas em dd/mm/aaaa", () => {
    const html = htmlDe(DADOS_COMPLETOS);
    // normaliza espaço não-quebrável (U+00A0) que o Intl.NumberFormat pt-BR
    // pode emitir entre "R$" e o valor, dependendo do ICU do runtime.
    expect(html.replace(/\s/g, " ")).toContain("R$ 900,00");
    expect(html).toContain("29/08/2026");
  });
});
