/**
 * Enums espelhados de `apps/cms/src/shared/types.ts`.
 *
 * Espelhados — não importados — porque `@ntc/lib` deve permanecer livre de
 * dependências do `@ntc/cms` (evita ciclo de build). Se um enum aqui divergir
 * do CMS, o typecheck do servidor de Payload acusa via mismatch no
 * `payload.create({ collection: 'leads', data })`.
 */

export const LEAD_TIPO = ["proposta", "contato", "newsletter", "candidatura"] as const;
export type LeadTipo = (typeof LEAD_TIPO)[number];

export const ESFERA_INSTITUCIONAL = [
  "municipal",
  "estadual",
  "federal",
  "privada",
  "terceiro-setor",
] as const;
export type EsferaInstitucional = (typeof ESFERA_INSTITUCIONAL)[number];

export const MODALIDADE_PROPOSTA = [
  "in-company",
  "turma-aberta",
  "sob-medida",
  "proposta-livre",
] as const;
export type ModalidadeProposta = (typeof MODALIDADE_PROPOSTA)[number];

export const ASSUNTO_CONTATO = [
  "imprensa",
  "parcerias",
  "fornecedor",
  "duvida-institucional",
  "outro",
] as const;
export type AssuntoContato = (typeof ASSUNTO_CONTATO)[number];

export const TITULACAO_DOCENTE = [
  "doutorado",
  "pos-doutorado",
  "mestrado",
  "especializacao",
  "graduacao",
] as const;
export type TitulacaoDocente = (typeof TITULACAO_DOCENTE)[number];
