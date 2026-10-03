import { describe, expect, it } from "vitest";

import type { DadosDocumentoProposta } from "../dados";
import { secoesInstitucionais } from "./institucional";

const BASE: DadosDocumentoProposta = {
  id: "1",
  codigo: "COD-v01",
  codigoBase: "COD",
  versao: 1,
  tipoTexto: "Módulo Avulso",
  subtitulo: "Módulo Avulso · PTE",
  modalidade: "Online ao vivo · EventON NTC",
  replay: "180 dias",
  condPagto: "Em 30 dias após a NF",
  condEspecificas: "",
  dataCriacaoISO: "2026-05-14T12:00:00.000Z",
  validadeISO: "2026-06-13T12:00:00.000Z",
  elaboradorNome: "Ana",
  clienteOrgao: "Secretaria de Teste",
  clienteSigla: "SET",
  clienteUf: "TO",
  clienteMunicipio: "Cidade",
  clienteDirigente: "Fulano",
  programaNome: "Programa de Teste",
  programaSigla: "PTE",
  itens: [],
  cargaHorariaTotalModulos: "8h · 1 módulo",
  conteudoHtml: {
    apresentacao: "<p>ap</p>",
    contexto: "<p>ct</p>",
    objetivos: "<p>ob</p>",
    publicoAlvo: "<p>pa</p>",
    metodologia: "<p>me</p>",
    eventon: "<p>condições do EventON</p>",
    certificacaoReplay: "<p>certificação</p>",
    cancelamento: "<p>cancelamento</p>",
    protecaoConteudo: "<p>proteção</p>",
    fundamentacaoLegal: "<p>fundamentação</p>",
    proximosPassos: "<p>próximos</p>",
    fechamento: "<p>fechamento</p>",
  },
  eixos: [],
  diferenciais: [],
  resultados: [],
  docentes: [],
  modulosDetalhados: [],
  secoesExtras: [],
  valorUnitario: 1470,
  qtdPagantes: 10,
  cortesias: 1,
  percDesconto: 10,
  valorBruto: 14700,
  desconto: 1470,
  valorLiquido: 13230,
};

const vazio = (d: DadosDocumentoProposta): DadosDocumentoProposta => ({
  ...d,
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
});

describe("secoesInstitucionais", () => {
  it("em modalidade online devolve as 7 seções, com os títulos exatos do modelo", () => {
    expect(secoesInstitucionais(BASE).map((s) => [s.chave, s.titulo])).toEqual([
      ["eventon", "Condições de Participação · Evento Online EventON"],
      ["certificacao-replay", "Certificação e Replay"],
      ["cancelamento", "Cancelamento, Substituição e Reagendamento"],
      ["protecao-conteudo", "Proteção de Conteúdo e Direitos Autorais"],
      ["fundamentacao-legal", "Fundamentação Legal e Segurança Jurídica"],
      ["proximos-passos", "Próximos Passos"],
      ["fechamento", "Fechamento Institucional"],
    ]);
  });

  it("em Presencial devolve 6 seções, sem a de EventON", () => {
    const s = secoesInstitucionais({ ...BASE, modalidade: "Presencial" });
    expect(s).toHaveLength(6);
    expect(s.map((x) => x.chave)).not.toContain("eventon");
  });

  it("em Híbrido devolve 6 seções, sem a de EventON", () => {
    const s = secoesInstitucionais({ ...BASE, modalidade: "Híbrido" });
    expect(s).toHaveLength(6);
    expect(s.map((x) => x.chave)).not.toContain("eventon");
  });

  it("reconhece a modalidade online sem diferenciar maiúsculas nem acentos", () => {
    for (const m of ["ONLINE", "on-line não é online", "Evento ONLINE ao vivo"]) {
      expect(secoesInstitucionais({ ...BASE, modalidade: m })).toHaveLength(7);
    }
  });

  it("modalidade vazia ou a definir não traz a seção de EventON", () => {
    expect(secoesInstitucionais({ ...BASE, modalidade: "" })).toHaveLength(6);
    expect(secoesInstitucionais({ ...BASE, modalidade: "A definir" })).toHaveLength(6);
  });

  it("entrega o corpo de cada seção tal e qual o HTML da proposta", () => {
    const porChave = new Map(secoesInstitucionais(BASE).map((s) => [s.chave, s.corpoHtml]));
    expect(porChave.get("certificacao-replay")).toBe("<p>certificação</p>");
    expect(porChave.get("cancelamento")).toBe("<p>cancelamento</p>");
    expect(porChave.get("protecao-conteudo")).toBe("<p>proteção</p>");
    expect(porChave.get("fundamentacao-legal")).toBe("<p>fundamentação</p>");
    expect(porChave.get("proximos-passos")).toBe("<p>próximos</p>");
    expect(porChave.get("eventon")).toBe("<p>condições do EventON</p>");
  });

  it("texto vazio vira corpo vazio, para a montagem omitir a seção", () => {
    for (const s of secoesInstitucionais(vazio(BASE))) expect(s.corpoHtml).toBe("");
  });

  it("o Fechamento traz a citação institucional fixa depois do corpo", () => {
    const fechamento = secoesInstitucionais(BASE).find((s) => s.chave === "fechamento");
    expect(fechamento?.corpoHtml).toContain("<p>fechamento</p>");
    expect(fechamento?.corpoHtml).toContain(
      '<div class="quote">Excelência institucional, rigor técnico e compromisso com a Administração Pública brasileira.</div>',
    );
    expect(fechamento?.corpoHtml.indexOf("<p>fechamento</p>")).toBeLessThan(
      fechamento?.corpoHtml.indexOf('<div class="quote">') ?? -1,
    );
  });

  it("sem texto de fechamento, não imprime a citação sozinha", () => {
    const fechamento = secoesInstitucionais(vazio(BASE)).find((s) => s.chave === "fechamento");
    expect(fechamento?.corpoHtml).toBe("");
  });

  it("nenhum corpo sai com undefined, NaN ou null", () => {
    const tudo = secoesInstitucionais(BASE)
      .map((s) => s.corpoHtml)
      .join("\n");
    expect(tudo).not.toMatch(/undefined|NaN|null/);
  });
});
