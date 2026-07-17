/**
 * Listas controladas do módulo CRM — espelham as LIST do protótipo
 * NTC_Comercial_Premium.html (apenas as entidades da Fase A).
 * `value` é o slug do rótulo: estável, é o que os selects do Payload gravam.
 */

export interface OpcaoLista {
  label: string;
  value: string;
}

/** "Em qualificação" → "em-qualificacao". Também usado pelo importador. */
export function slugDeRotulo(rotulo: string): string {
  return rotulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const opcoes = (rotulos: string[]): OpcaoLista[] =>
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

export const ORIGENS_CRM = opcoes([
  "Indicação", "Indicação institucional", "Evento", "Prospecção ativa",
  "Cliente recorrente", "Continuidade de relacionamento", "Inbound", "EventON", "Outros",
]);

export const STATUS_CLIENTE_CRM = opcoes([
  "Prospect", "Em qualificação", "Em negociação", "Cliente ativo", "Cliente inativo", "Encerrado",
]);

export const STATUS_OPORTUNIDADE = opcoes([
  "Em qualificação", "Apresentação institucional", "Proposta enviada", "Em negociação",
  "Aprovada", "Contratada", "Perdida", "Cancelada",
]);

/** Status que tiram a oportunidade do funil (não contam como "aberta"). */
export const STATUS_OPORTUNIDADE_FECHADA: string[] = ["contratada", "perdida", "cancelada"];
