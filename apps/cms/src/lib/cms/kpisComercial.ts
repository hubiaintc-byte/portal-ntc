import type { LeadCrmResumo } from "./painelCrm";

/** Cálculos puros do Dashboard comercial (spec 2026-09-15 §4.2). Sem I/O. */

export interface KpisComercial {
  leadsNovos30d: number;
  negociosAtivos: number;
  valorEmNegociacao: number;
  eventosAgendados: number;
}

const MS_30_DIAS = 30 * 86_400_000;

/** Ativo = não perdido e ainda não realizado. */
export const leadAtivo = (l: LeadCrmResumo): boolean => !l.perdido && l.estagio !== "evento-realizado";

export function calcularKpisComercial(leads: LeadCrmResumo[], hojeISO: string): KpisComercial {
  const limite = Date.parse(hojeISO) - MS_30_DIAS;
  const ativos = leads.filter(leadAtivo);
  return {
    leadsNovos30d: leads.filter((l) => Date.parse(l.criadoEmISO) >= limite).length,
    negociosAtivos: ativos.length,
    valorEmNegociacao: ativos.reduce((soma, l) => soma + (l.valorEstimado ?? 0), 0),
    eventosAgendados: ativos.filter((l) => l.estagio === "evento-agendado").length,
  };
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}
