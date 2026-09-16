/**
 * Listas controladas do módulo CRM — espelham as LIST do protótipo
 * NTC_Comercial_Premium.html (apenas as entidades da Fase A).
 * `value` é o slug do rótulo: estável, é o que os selects do Payload gravam.
 */

export interface OpcaoLista {
  label: string;
  value: string;
}

/** "Em qualificação" → "em-qualificacao". */
export function slugDeRotulo(rotulo: string): string {
  return rotulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const opcoes = (rotulos: string[]): OpcaoLista[] =>
  rotulos.map((label) => ({ label, value: slugDeRotulo(label) }));

// prettier-ignore
export const UFS: string[] = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export const AREAS_CRM = opcoes([
  "Educação", "Gestão Pública", "Governança", "Licitações e Contratos", "Inovação",
  "Saúde", "Assistência Social", "Controle Interno", "Jurídico", "Alta Gestão",
]);

export const ESFERAS_CRM = opcoes([
  "Municipal", "Estadual", "Federal", "Consórcio", "Autarquia", "Fundação",
  "Escola de Governo", "Tribunal", "Câmara", "Assembleia", "Outros",
]);

export const TIPOS_INSTITUICAO = opcoes([
  "Secretaria Federal", "Secretaria Estadual", "Secretaria Municipal", "Autarquia",
  "Fundação", "Tribunal", "Câmara", "Assembleia", "Consórcio", "Escola de Governo", "Outro",
]);

export const TIPOS_PROPOSTA = opcoes([
  "Programa Completo", "Módulo Avulso", "Produto/Evento Avulso", "Customizada",
]);

export const STATUS_PROPOSTA = opcoes([
  "Rascunho", "Enviada", "Em análise", "Aprovada", "Recusada", "Substituída", "Expirada",
]);

export const CANAIS_ENVIO = opcoes([
  "E-mail", "WhatsApp", "Ofício", "Presencial", "Outro",
]);

export const STATUS_ENVIO = opcoes([
  "Enviada", "Recebida", "Em análise", "Respondida",
]);
