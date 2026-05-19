/**
 * Enums compartilhados do Portal Grupo NTC — Seção 3 do
 * docs/11_Schema_Payload_CMS_v1.md.
 *
 * Usados como `select.options` nas coleções editoriais e exportados
 * (via packages/types) para tipagem fim-a-fim entre CMS e web.
 */

export const AREA_SIGLAS = ["educacao", "gestao-publica", "saude"] as const;
export type AreaSigla = (typeof AREA_SIGLAS)[number];

export const MODALIDADE_EVENTO = ["online", "presencial", "hibrido"] as const;
export type ModalidadeEvento = (typeof MODALIDADE_EVENTO)[number];

export const ESFERA_INSTITUCIONAL = [
  "municipal",
  "estadual",
  "federal",
  "privada",
  "terceiro-setor",
] as const;
export type EsferaInstitucional = (typeof ESFERA_INSTITUCIONAL)[number];

export const LEAD_TIPO = ["proposta", "contato", "newsletter", "candidatura"] as const;
export type LeadTipo = (typeof LEAD_TIPO)[number];

export const LEAD_STATUS = [
  "novo",
  "em-atendimento",
  "qualificado",
  "descartado",
  "convertido",
] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

export const TITULACAO_DOCENTE = [
  "doutorado",
  "pos-doutorado",
  "mestrado",
  "especializacao",
  "graduacao",
] as const;
export type TitulacaoDocente = (typeof TITULACAO_DOCENTE)[number];

export const CONTEUDO_CATEGORIA = [
  "artigo",
  "insight",
  "publicacao",
  "material-download",
  "noticia",
] as const;
export type ConteudoCategoria = (typeof CONTEUDO_CATEGORIA)[number];

/** Perfis administrativos do admin Payload (DAB §10.1). */
export const PERFIL_ADMIN = [
  "super-admin",
  "editor-institucional",
  "editor-eventos",
  "atendimento-comercial",
] as const;
export type PerfilAdmin = (typeof PERFIL_ADMIN)[number];
