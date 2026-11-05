/**
 * Molde das páginas de programa: textos que são iguais nos 15 programas
 * depois de trocar sigla e slug (análise do instantâneo de 05/11/2026).
 * `{SIGLA}` e `{slug}` são interpolados por `interpolarMolde`.
 *
 * Mudar um valor aqui muda a página de todos os programas de uma vez.
 */

import type { NavAnchor, Vertical } from "./tipos";

export const MOLDE = {
  hero: {
    eyebrow: "Programa Estratégico",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa={slug}", variante: "gold" },
      { rotulo: "Solicitar folder", href: "/contato?programa={slug}&assunto=folder", variante: "ghost-light" },
    ],
    statsLbl: ["Módulos formativos", "Carga horária total", "Eixos temáticos"],
  },
  navAnchors: [
    { href: "#visao-geral", rotulo: "Visão geral" },
    { href: "#problema", rotulo: "Problema" },
    { href: "#publico", rotulo: "Público" },
    { href: "#eixos", rotulo: "Eixos" },
    { href: "#modulos", rotulo: "Módulos" },
    { href: "#resultados", rotulo: "Resultados" },
    { href: "#docentes", rotulo: "Corpo docente" },
    { href: "#modalidades", rotulo: "Modalidades" },
    { href: "#modulos-abertos", rotulo: "Módulos abertos" },
    { href: "#faq", rotulo: "FAQ" },
  ] satisfies NavAnchor[],
  visaoGeral: { eyebrow: "Visão geral" },
  problema: { eyebrow: "Problema público que enfrentamos" },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    tituloHtml: "O que o programa <em>entrega</em>",
  },
  publico: { eyebrow: "Para quem", titulo: "Público-alvo" },
  eixos: { eyebrow: "Eixos formativos", tituloHtml: "Quatro <em>eixos estruturantes</em>" },
  modulos: { eyebrow: "Arquitetura formativa" },
  detalhamento: {
    eyebrow: "Detalhamento",
    titulo: "O que cada módulo entrega",
    intro:
      "Cada módulo articula fundamentação técnica, casos aplicados e construção institucional — selecione abaixo para ver a ementa detalhada.",
  },
  resultados: { eyebrow: "Resultados esperados", tituloHtml: "O que a instituição <em>leva</em> do {SIGLA}" },
  diferenciais: { eyebrow: "Diferenciais", tituloHtml: "O que torna o {SIGLA} <em>uma referência</em>" },
  docentes: {
    eyebrow: "Autoridade técnica",
    pill: "Curadoria científica · Em estruturação contínua",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o {SIGLA}",
  },
  modalidades: { eyebrow: "Como contratar", tituloHtml: "Modalidades de <em>entrega</em>" },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    tituloHtml: "Próximos módulos do <em>{SIGLA}</em>",
    corpoHtml:
      "<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>",
    bottomCtas: [
      { rotulo: "Ver agenda completa do {SIGLA}", href: "/agenda?programa={slug}", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa={slug}&assunto=inscricao", primario: false },
    ],
    feature: { badge: "Próximo módulo · Em destaque", ctaPrimario: "Inscrever-se", ctaSecundario: "Ver detalhes" },
    miniCtaRotulo: "Solicitar inscrição",
  },
  faq: { eyebrow: "Perguntas frequentes", titulo: "FAQ" },
  ctaFinal: { eyebrow: "Próximo passo" },
  sidebar: { titulo: "Programa estratégico", entregasTitulo: "O programa entrega" },
} as const;

export const ROTULO_VERTICAL: Record<Vertical, string> = {
  educacao: "NTC Educação",
  "gestao-publica": "NTC Gestão Pública",
  saude: "NTC Saúde",
};

/**
 * Identidade visual "pela vertente": o estilo (`data-programa`) de um
 * programa representativo de cada vertente (a confirmar pelo PO no
 * checkpoint).
 */
export const SIGLA_CSS_DA_VERTENTE: Record<Vertical, string> = {
  educacao: "EDUTEC",
  "gestao-publica": "AGIP",
  saude: "PROSUS",
};

export function interpolarMolde(texto: string, v: { sigla: string; slug: string }): string {
  return texto.split("{SIGLA}").join(v.sigla).split("{slug}").join(v.slug);
}
