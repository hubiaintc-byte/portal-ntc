import { z } from "zod";

import {
  ASSUNTO_CONTATO,
  ESFERA_INSTITUCIONAL,
  MODALIDADE_PROPOSTA,
  TITULACAO_DOCENTE,
} from "../tipos";
import { origemFrontSchema } from "./origemRequest";

/**
 * Schemas Zod dos 4 formulários institucionais (DAB §7).
 *
 * Validam tanto no client (dentro do `<FormularioSoberano>`) quanto no
 * server (rotas /api/forms/*). Use `z.infer<typeof schemaX>` para tipar
 * o body.
 */

const consentimentoLgpd = z.object({
  aceito: z.literal(true),
  politicaVersao: z.string().min(1),
});

const baseIdentidade = {
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
};

export const schemaProposta = z.object({
  ...baseIdentidade,
  programaId: z.string().optional(),
  areaId: z.string().optional(),
  modalidade: z.enum(MODALIDADE_PROPOSTA),
  cargo: z.string().min(1, "Informe o cargo"),
  instituicao: z.string().min(1, "Informe a instituição"),
  esfera: z.enum(ESFERA_INSTITUCIONAL),
  participantesEstimados: z.coerce.number().int().positive().optional(),
  mensagem: z.string().min(10, "Mensagem muito curta"),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaContato = z.object({
  ...baseIdentidade,
  assunto: z.enum(ASSUNTO_CONTATO),
  instituicao: z.string().optional(),
  cargo: z.string().optional(),
  mensagem: z.string().min(10, "Mensagem muito curta"),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaNewsletter = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  areasInteresse: z.array(z.string()).min(1, "Selecione ao menos uma área"),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaCandidatura = z.object({
  ...baseIdentidade,
  titulacao: z.enum(TITULACAO_DOCENTE),
  linhasAtuacao: z.array(z.string()).min(1, "Selecione ao menos uma linha"),
  apresentacao: z.string().min(40, "Apresentação muito curta"),
  linkLattes: z.string().url().optional().or(z.literal("")),
  linkLinkedin: z.string().url().optional().or(z.literal("")),
  // curriculo é validado fora do schema (multipart): mime application/pdf, ≤10MB.
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export type DadosProposta = z.infer<typeof schemaProposta>;
export type DadosContato = z.infer<typeof schemaContato>;
export type DadosNewsletter = z.infer<typeof schemaNewsletter>;
export type DadosCandidatura = z.infer<typeof schemaCandidatura>;
