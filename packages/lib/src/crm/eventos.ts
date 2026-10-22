/** Ações de evento comercial no modal do lead (adendo 2026-09-17 §1). Puras. */
import type { EstagioLead } from "./estagios";
import type { OpcaoLista } from "./listas";

export type AcaoEvento = "agendar" | "registrar-contrato" | "links" | "realizado" | "cancelar";
export type StatusEvento = "agendado" | "realizado" | "cancelado";

export interface EventoParaAcoes { id: string; status: StatusEvento; dataInicioISO: string; temContrato: boolean; numLinks: number }
export interface LeadParaAcoes { perdido: boolean }

export const TIPOS_CONTRATO: OpcaoLista[] = [
  { label: "Contrato", value: "contrato" }, { label: "Empenho", value: "empenho" },
  { label: "Termo", value: "termo" }, { label: "Outro", value: "outro" },
];
export const MODALIDADES_EVENTO: OpcaoLista[] = [
  { label: "Presencial", value: "presencial" }, { label: "Online", value: "online" }, { label: "Híbrido", value: "hibrido" },
];
export const STATUS_EVENTO: OpcaoLista[] = [
  { label: "Agendado", value: "agendado" }, { label: "Realizado", value: "realizado" }, { label: "Cancelado", value: "cancelado" },
];

const maisRecente = (a: EventoParaAcoes, b: EventoParaAcoes) => (a.dataInicioISO >= b.dataInicioISO ? a : b);

export function eventoCorrente(eventos: EventoParaAcoes[]): EventoParaAcoes | null {
  if (eventos.length === 0) return null;
  const agendados = eventos.filter((e) => e.status === "agendado");
  return (agendados.length > 0 ? agendados : eventos).reduce(maisRecente);
}

export function acoesDeEvento(lead: LeadParaAcoes, corrente: EventoParaAcoes | null): AcaoEvento[] {
  if (lead.perdido) return [];
  if (corrente === null || corrente.status !== "agendado") return ["agendar"];
  return ["registrar-contrato", "links", "realizado", "cancelar"];
}

/**
 * Ações de acompanhamento de um evento no acervo do cliente (spec de
 * permissões §3.8): as mesmas da aba Ações para um evento agendado, menos
 * "agendar" — agendar nasce de um lead e fica no modal.
 */
export function acoesDoAcervo(status: string): AcaoEvento[] {
  if (status !== "agendado") return [];
  return acoesDeEvento({ perdido: false }, {
    id: "", status: "agendado", dataInicioISO: "", temContrato: false, numLinks: 0,
  }).filter((a) => a !== "agendar");
}

export function estagioDaAcaoEvento(acao: AcaoEvento): EstagioLead | null {
  switch (acao) {
    case "agendar": return "evento-agendado";
    case "registrar-contrato": return "contrato-recebido";
    case "realizado": return "evento-realizado";
    default: return null;
  }
}

export function urlValida(url: string): boolean {
  try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
}
