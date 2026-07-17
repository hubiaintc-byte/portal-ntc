export {
  montaMetadataSoberana,
  type MetadataSoberanaInput,
} from "./seo/montaMetadataSoberana";

// Enums espelhados (DAB §3) — não importam @ntc/cms para evitar ciclo.
export {
  LEAD_TIPO,
  type LeadTipo,
  ESFERA_INSTITUCIONAL,
  type EsferaInstitucional,
  MODALIDADE_PROPOSTA,
  type ModalidadeProposta,
  ASSUNTO_CONTATO,
  type AssuntoContato,
  TITULACAO_DOCENTE,
  type TitulacaoDocente,
} from "./tipos";

// Forms — schemas Zod, origem, política, hooks e stubs de segurança.
export {
  schemaProposta,
  schemaContato,
  schemaNewsletter,
  schemaCandidatura,
  type DadosProposta,
  type DadosContato,
  type DadosNewsletter,
  type DadosCandidatura,
} from "./forms/schemas";

export {
  extrairOrigem,
  origemFrontSchema,
  type OrigemFront,
  type OrigemResolvida,
} from "./forms/origemRequest";

export { POLITICA_VERSAO_ATUAL } from "./forms/politicaVersao";

export { aposCriarLead, type LeadCriado } from "./forms/aposCriarLead";

export { verificarHcaptcha } from "./forms/hcaptcha";

export { checarRateLimit, type ResultadoRateLimit } from "./forms/rateLimit";

// CRM — listas controladas da Fase A
export {
  slugDeRotulo,
  type OpcaoLista,
  UFS,
  AREAS_CRM,
  ESFERAS_CRM,
  TIPOS_INSTITUICAO,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  STATUS_OPORTUNIDADE,
  STATUS_OPORTUNIDADE_FECHADA,
} from "./crm/listas";
