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

export const seloDeOportunidade = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_OPORTUNIDADE[status] ?? "info"}`;

export const seloDeCliente = (status: string): string =>
  `pcms-selo pcms-selo--${SELO_CLIENTE[status] ?? "info"}`;

/** Rótulo legível a partir do value ("em-negociacao" → via lista). */
export function rotuloDeLista(opcoes: { label: string; value: string }[], value: string | null): string {
  if (value === null) return "—";
  return opcoes.find((o) => o.value === value)?.label ?? value;
}
