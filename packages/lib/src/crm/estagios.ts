/**
 * Estágios do kanban comercial (spec 2026-09-15 §2 e §3.1). A ordem do array
 * É a ordem das colunas. "Perdido" não é estágio: é o par perdido/motivoPerda
 * do lead, ortogonal a esta lista.
 */

import type { OpcaoLista } from "./listas";

export const ESTAGIOS_LEAD: OpcaoLista[] = [
  { label: "Lead", value: "lead" },
  { label: "Oportunidade", value: "oportunidade" },
  { label: "Em contato", value: "em-contato" },
  { label: "Proposta em produção", value: "proposta-em-producao" },
  { label: "Proposta enviada", value: "proposta-enviada" },
  { label: "Proposta aceita", value: "proposta-aceita" },
  { label: "Evento agendado", value: "evento-agendado" },
  { label: "Contrato/empenho recebido", value: "contrato-recebido" },
  { label: "Links enviados", value: "links-enviados" },
  { label: "Evento realizado", value: "evento-realizado" },
];

export type EstagioLead =
  | "lead"
  | "oportunidade"
  | "em-contato"
  | "proposta-em-producao"
  | "proposta-enviada"
  | "proposta-aceita"
  | "evento-agendado"
  | "contrato-recebido"
  | "links-enviados"
  | "evento-realizado";

export const MOTIVOS_PERDA: OpcaoLista[] = [
  { label: "Sem resposta", value: "sem-resposta" },
  { label: "Recusou a proposta", value: "recusou" },
  { label: "Sem orçamento", value: "sem-orcamento" },
  { label: "Cancelado", value: "cancelado" },
  { label: "Outro", value: "outro" },
];

export const ORIGENS_ENTRADA_LEAD: OpcaoLista[] = [
  { label: "Site", value: "site" },
  { label: "Manual", value: "manual" },
  { label: "WhatsApp", value: "whatsapp" },
];

export const ORIGENS_CLIENTE: OpcaoLista[] = [
  { label: "Lead do site", value: "lead-site" },
  { label: "Manual", value: "manual" },
  { label: "Importado", value: "importado" },
];

export function ehEstagioLead(v: unknown): v is EstagioLead {
  return typeof v === "string" && ESTAGIOS_LEAD.some((e) => e.value === v);
}

export function indiceDoEstagio(estagio: EstagioLead): number {
  return ESTAGIOS_LEAD.findIndex((e) => e.value === estagio);
}

export function rotuloDoEstagio(estagio: string): string {
  return ESTAGIOS_LEAD.find((e) => e.value === estagio)?.label ?? estagio;
}

const MS_POR_DIA = 86_400_000;

/** Dias inteiros de `deISO` até `ateISO`; 0 para datas inválidas ou ordem invertida. */
export function diasEntre(deISO: string, ateISO: string): number {
  const de = Date.parse(deISO);
  const ate = Date.parse(ateISO);
  if (!Number.isFinite(de) || !Number.isFinite(ate) || ate < de) return 0;
  return Math.floor((ate - de) / MS_POR_DIA);
}
