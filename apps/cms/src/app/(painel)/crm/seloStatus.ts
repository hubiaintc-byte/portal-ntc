/** Classe de selo (pcms-selo--*) por status de oportunidade e cliente. */
const SELO_OPORTUNIDADE: Record<string, string> = {
  "em-qualificacao": "info",
  "apresentacao-institucional": "info",
  "proposta-enviada": "info",
  "em-negociacao": "atencao",
  aprovada: "ok",
  contratada: "ok",
  perdida: "erro",
  cancelada: "erro",
};

const SELO_CLIENTE: Record<string, string> = {
  prospect: "info",
  "em-qualificacao": "info",
  "em-negociacao": "atencao",
  "cliente-ativo": "ok",
  "cliente-inativo": "erro",
  encerrado: "erro",
};

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

export const seloDeOportunidade = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_OPORTUNIDADE[status] ?? "info"}`;

export const seloDeCliente = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_CLIENTE[status] ?? "info"}`;

export const seloDeProposta = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_PROPOSTA[status] ?? "info"}`;

export const seloDeEnvio = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_ENVIO[status] ?? "info"}`;

/** Rótulo legível a partir do value ("em-negociacao" → via lista). */
export function rotuloDeLista(opcoes: { label: string; value: string }[], value: string | null): string {
  if (value === null) return "—";
  return opcoes.find((o) => o.value === value)?.label ?? value;
}
