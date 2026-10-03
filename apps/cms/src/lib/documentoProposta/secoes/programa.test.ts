import { describe, expect, it } from "vitest";

import type { DadosDocumentoProposta } from "../dados";
import { secoesDeConteudo } from "./programa";

const BASE: DadosDocumentoProposta = {
  id: "1",
  codigo: "COD-v01",
  codigoBase: "COD",
  versao: 1,
  tipoTexto: "Trilha Completa de Programa Estratégico",
  subtitulo: "Combo de Três Módulos · PTE",
  modalidade: "EventON NTC ao vivo",
  replay: "180 dias",
  condPagto: "Em 30 dias após a NF",
  condEspecificas: "",
  dataCriacaoISO: "2026-05-14T12:00:00.000Z",
  validadeISO: "2026-06-13T12:00:00.000Z",
  elaboradorNome: "Ana",
  aprovadorNome: "",
  clienteOrgao: "Secretaria de Teste <X>",
  clienteSigla: "SET",
  clienteUf: "TO",
  clienteMunicipio: "Cidade",
  clienteCnpj: "24.851.511/0001-85",
  clienteDirigente: "Fulano",
  clienteDirigenteCargo: "Secretária Municipal de Educação",
  clienteContatoEmail: "gabinete@orgao.gov.br",
  programaNome: "Programa de Teste",
  programaSigla: "PTE",
  itens: [],
  cargaHorariaTotalModulos: "24h · 3 módulos · 8h por módulo",
  conteudoHtml: {
    apresentacao: "<p>apresentação</p>",
    contexto: "<p>contexto</p>",
    objetivos: "<h3>Objetivo Geral</h3><p>geral</p>",
    publicoAlvo: "<ul><li>gestores</li></ul>",
    metodologia: "<p>metodologia</p>",
    eventon: "",
    certificacaoReplay: "",
    cancelamento: "",
    protecaoConteudo: "",
    fundamentacaoLegal: "",
    proximosPassos: "",
    fechamento: "",
  },
  eixos: [
    { titulo: "Eixo 1 · Fundamentos", descricao: "Base conceitual do programa." },
    { titulo: "Eixo 2 · Aplicação", descricao: "Prática em rede pública." },
  ],
  diferenciais: [
    { titulo: "Corpo docente de elite", descricao: "Vivência prática em redes públicas." },
    { titulo: "Selo institucional", descricao: "" },
  ],
  resultados: ["Rede qualificada para a transformação digital."],
  docentes: [
    { nome: "Roberta Aquino", credencial: "Doutora em Ciências · Unicamp", eixo: "Fundamentos" },
    { nome: "Karla Priscilla", credencial: "Mestranda em Tecnologias", eixo: "" },
  ],
  modulosDetalhados: [
    { codigo: "M01", titulo: "Cultura Digital", cargaHoraria: "8h", ementaHtml: "<p>ementa 1</p>" },
    { codigo: "M02", titulo: "Fluência Digital", cargaHoraria: null, ementaHtml: "<p>ementa 2</p>" },
    { codigo: "M04", titulo: "Currículo & Computação", cargaHoraria: "8h", ementaHtml: "" },
  ],
  secoesExtras: [],
  valorUnitario: 1470,
  qtdPagantes: 1800,
  cortesias: 180,
  percDesconto: 35.4,
  valorBruto: 2646000,
  desconto: 935874,
  valorLiquido: 1710126,
};

const porChave = (d: DadosDocumentoProposta, chave: string): string =>
  secoesDeConteudo(d).find((s) => s.chave === chave)?.corpoHtml ?? "__nao-encontrada__";

const VAZIO: DadosDocumentoProposta = {
  ...BASE,
  modalidade: "",
  replay: "",
  programaSigla: "",
  cargaHorariaTotalModulos: "",
  clienteOrgao: "—",
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
};

describe("secoesDeConteudo", () => {
  it("devolve as 10 seções na ordem do modelo, com os títulos exatos", () => {
    expect(secoesDeConteudo(BASE).map((s) => [s.chave, s.titulo])).toEqual([
      ["apresentacao", "Apresentação Executiva"],
      ["contexto", "Contexto e Justificativa"],
      ["objetivos", "Objetivos"],
      ["publico-alvo", "Público-alvo"],
      ["arquitetura", "Arquitetura da Solução"],
      ["modulos", "Módulos Contratados"],
      ["metodologia", "Metodologia"],
      ["docentes", "Corpo Docente e Curadoria"],
      ["diferenciais", "Diferenciais NTC"],
      ["resultados", "Resultados Esperados"],
    ]);
  });

  it("entrega os textos corridos tal e qual o HTML da proposta", () => {
    expect(porChave(BASE, "apresentacao")).toBe("<p>apresentação</p>");
    expect(porChave(BASE, "contexto")).toBe("<p>contexto</p>");
    expect(porChave(BASE, "objetivos")).toBe("<h3>Objetivo Geral</h3><p>geral</p>");
    expect(porChave(BASE, "publico-alvo")).toBe("<ul><li>gestores</li></ul>");
    expect(porChave(BASE, "metodologia")).toBe("<p>metodologia</p>");
  });

  it("proposta sem nenhum conteúdo deixa todas as 10 seções com corpo vazio", () => {
    for (const s of secoesDeConteudo(VAZIO)) expect(s.corpoHtml).toBe("");
  });

  // --- Arquitetura ---------------------------------------------------------

  it("Arquitetura traz o parágrafo parametrizado e o grid3 do modelo", () => {
    const html = porChave(BASE, "arquitetura");
    expect(html).toContain("A arquitetura técnico-pedagógica da presente proposta");
    expect(html).toContain("<strong>3 módulos-evento</strong>");
    expect(html).toContain("<strong>PTE</strong>");
    expect(html).toContain('<div class="grid3">');
    expect(html).toContain("Carga Horária Total");
    expect(html).toContain("Módulos-Evento");
    expect(html).toContain("Modalidade");
    expect(html).toContain("24h");
  });

  it("Arquitetura imprime os eixos como grid2 DEPOIS do grid3", () => {
    const html = porChave(BASE, "arquitetura");
    expect(html).toContain('<div class="grid2">');
    expect(html).toContain("Eixo 1 · Fundamentos");
    expect(html).toContain("Base conceitual do programa.");
    expect(html.indexOf('<div class="grid3">')).toBeLessThan(html.indexOf('<div class="grid2">'));
  });

  it("Arquitetura sem eixos fica só com o parágrafo e o grid3", () => {
    const html = porChave({ ...BASE, eixos: [] }, "arquitetura");
    expect(html).toContain('<div class="grid3">');
    expect(html).not.toContain('<div class="grid2">');
  });

  it("Arquitetura imprime a carga horária total só quando ela começa por horas", () => {
    const html = porChave(BASE, "arquitetura");
    expect(html).toContain("carga horária total de <strong>24h</strong>");
    expect(html).toContain("Carga Horária Total");
  });

  it("contagem de módulos sem horas NÃO é impressa como carga horária", () => {
    // "3 módulos" é o que dados.ts devolve quando as cargas dos módulos são
    // heterogêneas ("8h" e "16h") ou compostas ("16h · 2 dias"): não há total
    // a afirmar, então a caixa e o trecho do parágrafo somem.
    const html = porChave({ ...BASE, cargaHorariaTotalModulos: "3 módulos" }, "arquitetura");
    expect(html).not.toContain("Carga Horária Total");
    expect(html).not.toContain("carga horária total de");
    expect(html).toContain("<strong>3 módulos-evento</strong>");
  });

  it("Arquitetura sem nenhum dado sai com corpo vazio, em vez de prosa sem informação", () => {
    expect(porChave(VAZIO, "arquitetura")).toBe("");
  });

  // --- Módulos Contratados -------------------------------------------------

  it("Módulos Contratados traz um cartão por módulo, numerado em sequência", () => {
    const html = porChave(BASE, "modulos");
    expect([...html.matchAll(/<div class="modulo-premium">/g)]).toHaveLength(3);
    expect([...html.matchAll(/<div class="numero">(\d+)<\/div>/g)].map((m) => m[1])).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(html).toContain("M01 · Cultura Digital");
    expect(html).toContain("<p>ementa 1</p>");
  });

  it("badge dourado só quando o módulo tem carga horária; badge de data nunca", () => {
    const html = porChave(BASE, "modulos");
    expect([...html.matchAll(/<span class="badge gold">/g)]).toHaveLength(2);
    expect(html).not.toContain("badge acento");
  });

  it("badge outline leva a modalidade da proposta", () => {
    expect(porChave(BASE, "modulos")).toContain(
      '<span class="badge outline">EventON NTC ao vivo</span>',
    );
    expect(porChave({ ...BASE, modalidade: "" }, "modulos")).not.toContain("badge outline");
  });

  it("não usa os elementos do modelo sem dado na proposta (grid-mod e nota-anexo)", () => {
    const html = porChave(BASE, "modulos");
    expect(html).not.toContain("grid-mod");
    expect(html).not.toContain("nota-anexo");
    expect(html).not.toContain("Entregas Formativas");
    expect(html).not.toContain("Conduzido por");
  });

  it("a abertura de Módulos Contratados cita o órgão do cliente, escapado", () => {
    const html = porChave(BASE, "modulos");
    expect(html).toContain("Secretaria de Teste &lt;X&gt;");
    expect(html).not.toContain("<X>");
  });

  it("sem módulos detalhados, Módulos Contratados sai com corpo vazio", () => {
    expect(porChave({ ...BASE, modulosDetalhados: [] }, "modulos")).toBe("");
  });

  // --- Corpo Docente -------------------------------------------------------

  it("Corpo Docente traz um cartão por docente, com credencial e eixo", () => {
    const html = porChave(BASE, "docentes");
    expect([...html.matchAll(/<div class="docente-card">/g)]).toHaveLength(2);
    expect(html).toContain('<div class="nome">Roberta Aquino</div>');
    expect(html).toContain('<div class="titulacao">Doutora em Ciências · Unicamp</div>');
    expect(html).toContain('<div class="bio">Eixo · Fundamentos</div>');
  });

  it("docente sem eixo não imprime a linha do eixo", () => {
    const html = porChave({ ...BASE, docentes: [BASE.docentes[1]!] }, "docentes");
    expect(html).toContain("Karla Priscilla");
    expect(html).not.toContain("Eixo ·");
  });

  it("sem docentes, Corpo Docente sai com corpo vazio (caso normal hoje)", () => {
    expect(porChave({ ...BASE, docentes: [] }, "docentes")).toBe("");
  });

  // --- Diferenciais e Resultados ------------------------------------------

  it("Diferenciais sai como lista, com o título em negrito e a descrição quando existe", () => {
    const html = porChave(BASE, "diferenciais");
    expect(html).toContain("<ul>");
    expect([...html.matchAll(/<li>/g)]).toHaveLength(2);
    expect(html).toContain("<strong>Corpo docente de elite</strong>");
    expect(html).toContain("Vivência prática em redes públicas.");
    expect(html).toContain("<li><strong>Selo institucional</strong></li>");
  });

  it("um resultado só sai como parágrafo; vários, como lista", () => {
    expect(porChave(BASE, "resultados")).toBe(
      "<p>Rede qualificada para a transformação digital.</p>",
    );
    const varios = porChave({ ...BASE, resultados: ["Um", "Dois"] }, "resultados");
    expect(varios).toContain("<ul>");
    expect(varios).toContain("<li>Um</li>");
    expect(varios).toContain("<li>Dois</li>");
  });

  it("nenhum corpo sai com undefined, NaN ou null", () => {
    const tudo = secoesDeConteudo(BASE)
      .map((s) => s.corpoHtml)
      .join("\n");
    expect(tudo).not.toMatch(/undefined|NaN|null/);
    expect(
      secoesDeConteudo(VAZIO)
        .map((s) => s.corpoHtml)
        .join("\n"),
    ).not.toMatch(/undefined|NaN|null/);
  });

  it("só usa classes que existem nos tokens do documento", () => {
    const html = secoesDeConteudo(BASE)
      .map((s) => s.corpoHtml)
      .join("\n");
    const classes = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(" ")));
    const conhecidas = new Set([
      "grid2",
      "grid3",
      "box",
      "label",
      "value",
      "text",
      "modulo-premium",
      "numero",
      "titulo-mod",
      "badges",
      "badge",
      "gold",
      "outline",
      "docente-card",
      "nome",
      "titulacao",
      "bio",
      "quote",
    ]);
    expect([...classes].filter((c) => !conhecidas.has(c))).toEqual([]);
  });
});
