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

// Forms — schemas Zod, origem, política, hooks e anti-spam.
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

export { verificarCaptcha } from "./forms/captcha";

export {
  checarRateLimit,
  LIMITE_PADRAO,
  LIMITE_RECUPERACAO,
  type LimiteRota,
  type ResultadoRateLimit,
  type StoreRateLimit,
} from "./forms/rateLimit";

// CRM — listas controladas da Fase A
export {
  opcoes,
  slugDeRotulo,
  type OpcaoLista,
  UFS,
  AREAS_CRM,
  ESFERAS_CRM,
  TIPOS_INSTITUICAO,
  TIPOS_PROPOSTA,
  STATUS_PROPOSTA,
  CANAIS_ENVIO,
  STATUS_ENVIO,
} from "./crm/listas";

export {
  calcularValoresProposta,
  type EntradaValores,
  type ValoresProposta,
  siglaCanonica,
  gerarCodigoBase,
  proximaVersao,
  codigoDaVersao,
  modulosDoPrograma,
} from "./crm/propostas";

export {
  ESTAGIOS_LEAD,
  type EstagioLead,
  MOTIVOS_PERDA,
  ORIGENS_ENTRADA_LEAD,
  ORIGENS_CLIENTE,
  ehEstagioLead,
  indiceDoEstagio,
  rotuloDoEstagio,
  diasEntre,
} from "./crm/estagios";

export {
  casarCliente,
  normalizarNome,
  somenteDigitos,
  dominioDoEmail,
  ehDominioInstitucional,
  type LeadParaCasar,
  type ClienteCandidato,
  type MotivoCasamento,
  type ResultadoCasamento,
} from "./crm/casamento-cliente";

export {
  TIPOS_LINHA_DO_TEMPO,
  type TipoLinhaDoTempo,
  type ItemLinhaDoTempo,
  type EntradaLinhaDoTempo,
  type ReferenciaLinhaDoTempo,
  montarItemLinhaDoTempo,
  tituloTransicao,
  tituloPerda,
} from "./crm/linha-do-tempo";

export {
  type AcaoEvento,
  type StatusEvento,
  type EventoParaAcoes,
  type LeadParaAcoes,
  TIPOS_CONTRATO,
  MODALIDADES_EVENTO,
  STATUS_EVENTO,
  eventoCorrente,
  acoesDeEvento,
  estagioDaAcaoEvento,
  urlValida,
} from "./crm/eventos";

export {
  podeApagarCliente,
  exigeConfirmacaoDupla,
  tituloLeadApagado,
} from "./crm/exclusao";

export {
  textosPadraoProposta,
  type ContextoTextosProposta,
  type ChaveTextoInstitucional,
} from "./crm/textosProposta";

export {
  divisaoExata,
  linhasDoQuadro,
  type LinhaQuadro,
  type EntradaQuadro,
} from "./crm/quadroComercial";

export {
  conteudoInicialProposta,
  type ProgramaParaConteudo,
  type ModuloParaConteudo,
  type ConteudoInicialProposta,
} from "./crm/conteudoProposta";
