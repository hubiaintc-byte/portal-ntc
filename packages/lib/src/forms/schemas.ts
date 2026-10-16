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

/**
 * Tetos por campo: os formulários são públicos, então nenhum texto pode ter
 * tamanho livre (o corpo inteiro também é limitado nas rotas — ver
 * `lerCorpoJson` em apps/web/lib/respostaForm.ts).
 */
export const LIMITES_FORM = {
  nome: 120,
  email: 254,
  telefone: 30,
  curto: 200,
  id: 40,
  mensagem: 5000,
  itensLista: 20,
} as const;

const maximo = (n: number) => `Máximo de ${n} caracteres`;
const textoCurto = () => z.string().max(LIMITES_FORM.curto, maximo(LIMITES_FORM.curto));
const id = () => z.string().max(LIMITES_FORM.id, maximo(LIMITES_FORM.id));

const consentimentoLgpd = z.object({
  aceito: z.literal(true),
  politicaVersao: z.string().min(1).max(LIMITES_FORM.id),
});

const baseIdentidade = {
  nome: z.string().min(2, "Nome muito curto").max(LIMITES_FORM.nome, maximo(LIMITES_FORM.nome)),
  email: z.string().email("E-mail inválido").max(LIMITES_FORM.email, maximo(LIMITES_FORM.email)),
  telefone: z.string().min(8, "Telefone inválido").max(LIMITES_FORM.telefone, maximo(LIMITES_FORM.telefone)),
};

const mensagem = () =>
  z.string().min(10, "Mensagem muito curta").max(LIMITES_FORM.mensagem, maximo(LIMITES_FORM.mensagem));

export const schemaProposta = z.object({
  ...baseIdentidade,
  programaId: id().optional(),
  areaId: id().optional(),
  modalidade: z.enum(MODALIDADE_PROPOSTA),
  cargo: textoCurto().min(1, "Informe o cargo"),
  instituicao: textoCurto().min(1, "Informe a instituição"),
  esfera: z.enum(ESFERA_INSTITUCIONAL),
  participantesEstimados: z.coerce.number().int().positive().max(1_000_000).optional(),
  mensagem: mensagem(),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaContato = z.object({
  ...baseIdentidade,
  assunto: z.enum(ASSUNTO_CONTATO),
  instituicao: textoCurto().optional(),
  cargo: textoCurto().optional(),
  mensagem: mensagem(),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaNewsletter = z.object({
  nome: baseIdentidade.nome,
  email: baseIdentidade.email,
  // Preferência editorial vinda do <select name="vertical"> em /conteudos:
  // todas | educacao | gestao | saude | transversal. O handler resolve para
  // IDs de `areas` quando há vertical específica; "todas"/"transversal" não
  // mapeiam para uma única área e ficam só no registro (payloadBruto).
  vertical: id().optional(),
  // IDs de `areas` (relationship hasMany). Opcional: o front pode mandar a
  // preferência via `vertical` em vez de IDs explícitos.
  areasInteresse: z.array(id()).max(LIMITES_FORM.itensLista).optional(),
  instituicao: textoCurto().optional(),
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export const schemaCandidatura = z.object({
  ...baseIdentidade,
  titulacao: z.enum(TITULACAO_DOCENTE),
  linhasAtuacao: z.array(textoCurto()).min(1, "Selecione ao menos uma linha").max(LIMITES_FORM.itensLista),
  apresentacao: z
    .string()
    .min(40, "Apresentação muito curta")
    .max(LIMITES_FORM.mensagem, maximo(LIMITES_FORM.mensagem)),
  linkLattes: z.string().url().max(500).optional().or(z.literal("")),
  linkLinkedin: z.string().url().max(500).optional().or(z.literal("")),
  // curriculo é validado fora do schema (multipart): mime application/pdf, ≤10MB.
  origem: origemFrontSchema,
  consentimentoLgpd,
});

export type DadosProposta = z.infer<typeof schemaProposta>;
export type DadosContato = z.infer<typeof schemaContato>;
export type DadosNewsletter = z.infer<typeof schemaNewsletter>;
export type DadosCandidatura = z.infer<typeof schemaCandidatura>;
