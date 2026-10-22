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
 * permissões §3.8): as mesmas da aba Ações para um evento agendado. "Agendar"
 * não é ação de um evento existente — cria um novo, a partir de um negócio do
 * cliente; quais negócios podem agendar é `negociosQuePodemAgendar`.
 */
export function acoesDoAcervo(status: string): AcaoEvento[] {
  return status === "agendado" ? ["registrar-contrato", "links", "realizado", "cancelar"] : [];
}

const STATUS_VALIDOS: readonly string[] = ["agendado", "realizado", "cancelado"];

/**
 * Negócios do cliente que podem receber um evento novo no acervo (§3.8):
 * a mesma regra da aba Ações do modal — lead não perdido e sem evento
 * corrente agendado.
 */
export function negociosQuePodemAgendar<N extends { id: string; perdido: boolean }>(
  negocios: readonly N[],
  eventos: readonly { id: string; leadId: string | null; status: string; dataInicioISO: string }[],
): N[] {
  return negocios.filter((n) => {
    const doLead: EventoParaAcoes[] = eventos
      .filter((e) => e.leadId === n.id && STATUS_VALIDOS.includes(e.status))
      .map((e) => ({ id: e.id, status: e.status as StatusEvento, dataInicioISO: e.dataInicioISO, temContrato: false, numLinks: 0 }));
    return acoesDeEvento({ perdido: n.perdido }, eventoCorrente(doLead)).includes("agendar");
  });
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
