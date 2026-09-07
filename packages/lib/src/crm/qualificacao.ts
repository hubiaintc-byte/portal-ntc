/**
 * Qualificação de oportunidade — método COM-04 (Manual NTC-COM-CRM-01 §§13-19).
 * Puro, sem I/O: usado no formulário (resumo ao vivo), no hook da coleção
 * (derivados) e no gate do estágio "Qualificada".
 *
 * As mensagens de bloqueio são contratuais: a equipe é treinada nelas e o
 * §18 do manual as reproduz palavra por palavra. Não reescrever.
 */

import { opcoes, type OpcaoLista } from "./listas";

export const STATUS_AVALIACAO: OpcaoLista[] = opcoes(["Em preenchimento", "Concluída", "Cancelada"]);

export const RESULTADO_QUALIFICACAO: OpcaoLista[] = opcoes([
  "Qualificada",
  "Qualificar mais",
  "Nurturing",
  "Não qualificada",
]);

export const HARD_GATE_ESTADO: OpcaoLista[] = opcoes(["Sim", "Não", "Em validação"]);

export const FAIXA_SCORE: OpcaoLista[] = opcoes(["Forte", "Intermediário", "Fraco"]);

/** As 9 dimensões do §14, na ordem do manual. A 8 (Risco) tem régua invertida. */
export const DIMENSOES_COM04: { campo: string; rotulo: string }[] = [
  { campo: "notaNecessidade", rotulo: "1 · Necessidade" },
  { campo: "notaAderencia", rotulo: "2 · Aderência" },
  { campo: "notaPrioridade", rotulo: "3 · Prioridade" },
  { campo: "notaTiming", rotulo: "4 · Timing" },
  { campo: "notaCaminho", rotulo: "5 · Caminho de contratação" },
  { campo: "notaStakeholders", rotulo: "6 · Stakeholders" },
  { campo: "notaOrcamento", rotulo: "7 · Orçamento / capacidade" },
  { campo: "notaRisco", rotulo: "8 · Risco (régua invertida)" },
  { campo: "notaValor", rotulo: "9 · Valor estratégico para a NTC" },
];

/** Os 7 hard gates do §16, na ordem do manual. */
export const HARD_GATES_COM04: { campo: string; rotulo: string }[] = [
  { campo: "hgAderencia", rotulo: "Ausência total de aderência" },
  { campo: "hgJuridico", rotulo: "Risco jurídico / compliance impeditivo" },
  { campo: "hgCondicao", rotulo: "Condição comercial inviável" },
  { campo: "hgIncapacidade", rotulo: "Incapacidade estrutural / insanável" },
  { campo: "hgDemanda", rotulo: "Demanda inexistente" },
  { campo: "hgRequisito", rotulo: "Requisito não atendível" },
  { campo: "hgIntegridade", rotulo: "Violação de integridade" },
];

/** Forma mínima que as regras leem — a coleção tem mais campos que isto. */
export interface AvaliacaoCom04 {
  statusAvaliacao?: string | null;
  resultado?: string | null;
  justificativa?: string | null;
  proximoPasso?: string | null;
  vigente?: boolean | null;
  [campo: string]: unknown;
}

/** Só inteiro de 0 a 3 — o manual §15 recusa 2,5 e valores fora da faixa. */
export function notaValida(v: unknown): boolean {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 3;
}

export function notasCompletas(av: AvaliacaoCom04): boolean {
  return DIMENSOES_COM04.every((d) => notaValida(av[d.campo]));
}

/** Soma das 9 notas (0-27); null enquanto alguma dimensão não tiver nota válida. */
export function calcularScore(av: AvaliacaoCom04): number | null {
  if (!notasCompletas(av)) return null;
  return DIMENSOES_COM04.reduce((soma, d) => soma + (av[d.campo] as number), 0);
}

/** Cortes do §15: 18 e 10. Referência de leitura, nunca a decisão. */
export function faixaDoScore(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 18) return "forte";
  if (score >= 10) return "intermediario";
  return "fraco";
}

const preenchido = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;

/**
 * As 10 condições do §18, na ordem em que o manual as lista. Devolve a
 * mensagem da PRIMEIRA que falhar, ou null quando todas passam.
 */
export function avaliacaoPermiteQualificada(av: AvaliacaoCom04 | null): string | null {
  if (av === null) return "Estágio Qualificada bloqueado: não há avaliação vigente.";
  if (av.statusAvaliacao !== "concluida") {
    return "Estágio Qualificada bloqueado: a avaliação vigente não está Concluída (status_avaliacao).";
  }
  if (!notasCompletas(av)) {
    return "Estágio Qualificada bloqueado: as 9 dimensões não estão preenchidas.";
  }
  if (calcularScore(av) === null) return "Estágio Qualificada bloqueado: score não calculado.";
  const estados = HARD_GATES_COM04.map((g) => av[g.campo]);
  if (!estados.every((e) => typeof e === "string" && e.length > 0)) {
    return "Estágio Qualificada bloqueado: os 7 hard gates não foram todos avaliados.";
  }
  if (estados.some((e) => e === "sim")) {
    return "Estágio Qualificada bloqueado: há hard gate acionado (Sim).";
  }
  if (estados.some((e) => e === "em-validacao")) {
    return "Estágio Qualificada bloqueado: há hard gate Em validação.";
  }
  if (av.resultado !== "qualificada") {
    return "Estágio Qualificada bloqueado: resultado da avaliação ≠ Qualificada.";
  }
  if (!preenchido(av.justificativa)) {
    return "Estágio Qualificada bloqueado: justificativa ausente.";
  }
  if (!preenchido(av.proximoPasso)) {
    return "Estágio Qualificada bloqueado: próximo passo ausente.";
  }
  return null;
}
