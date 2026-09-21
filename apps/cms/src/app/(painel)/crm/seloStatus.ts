/** Classe de selo (pcms-selo--*) por status de proposta, envio e estágio do lead. */
const SELO_PROPOSTA: Record<string, string> = {
  rascunho: "info",
  enviada: "info",
  "em-analise": "atencao",
  aprovada: "ok",
  recusada: "erro",
  substituida: "erro",
  expirada: "erro",
};

const SELO_ENVIO: Record<string, string> = {
  enviada: "info",
  recebida: "info",
  "em-analise": "atencao",
  respondida: "ok",
};

/** Estágio do lead: neutro no início, atenção na proposta, ok do evento em diante. */
const SELO_ESTAGIO_LEAD: Record<string, string> = {
  lead: "info",
  oportunidade: "info",
  "em-contato": "info",
  "proposta-em-producao": "atencao",
  "proposta-enviada": "atencao",
  "proposta-aceita": "ok",
  "evento-agendado": "ok",
  "contrato-recebido": "ok",
  "links-enviados": "ok",
  "evento-realizado": "ok",
};

export const seloDeEstagioLead = (estagio: string): string =>
  `pcms-selo pcms-selo--${SELO_ESTAGIO_LEAD[estagio] ?? "info"}`;

/** Status do evento comercial: agendado neutro, realizado ok, cancelado erro. */
const SELO_STATUS_EVENTO: Record<string, string> = {
  agendado: "agendado",
  realizado: "ok",
  cancelado: "erro",
};

export const seloDeStatusEvento = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_STATUS_EVENTO[status] ?? "info"}`;

export const seloDeProposta = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_PROPOSTA[status] ?? "info"}`;

export const seloDeEnvio = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_ENVIO[status] ?? "info"}`;

/** Rótulo legível a partir do value ("em-negociacao" → via lista). */
export function rotuloDeLista(opcoes: { label: string; value: string }[], value: string | null): string {
  if (value === null) return "—";
  return opcoes.find((o) => o.value === value)?.label ?? value;
}
