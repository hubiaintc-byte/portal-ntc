import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from "payload";

import {
  DIMENSOES_COM04,
  FAIXA_SCORE,
  HARD_GATES_COM04,
  HARD_GATE_ESTADO,
  RESULTADO_QUALIFICACAO,
  STATUS_AVALIACAO,
  notaValida,
  type AvaliacaoCom04,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { montarDerivadosAvaliacao } from "../lib/crm/derivadosAvaliacao";

/** Nota 0-3 inteira; o manual §15 recusa 2,5 e valores fora da faixa. */
const validarNota = (valor: number | null | undefined): true | string =>
  valor === null || valor === undefined || notaValida(valor)
    ? true
    : "Use apenas os inteiros 0, 1, 2 ou 3.";

/** Estreita o `data` do hook (tipo genérico do Payload) para a forma que as regras puras leem. */
const comoAvaliacaoCom04 = (data: Record<string, unknown>): AvaliacaoCom04 => data;

const gravarDerivados: CollectionBeforeChangeHook = ({ data }) => ({
  ...data,
  ...montarDerivadosAvaliacao(comoAvaliacaoCom04(data), new Date().toISOString().slice(0, 10)),
});

/**
 * Uma única avaliação vigente por oportunidade (manual §13). Desmarca as
 * anteriores na MESMA transação — `req` repassado — para não existir instante
 * em que duas valem ao mesmo tempo.
 */
const manterUnicaVigente: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.vigente !== true) return doc;
  const oportunidadeId = typeof doc.oportunidade === "object" ? doc.oportunidade?.id : doc.oportunidade;
  if (oportunidadeId === undefined || oportunidadeId === null) return doc;
  await req.payload.update({
    collection: "avaliacoes-qualificacao",
    where: {
      and: [
        { oportunidade: { equals: oportunidadeId } },
        { id: { not_equals: doc.id } },
        { vigente: { equals: true } },
      ],
    },
    data: { vigente: false },
    req,
  });
  return doc;
};

/**
 * Avaliações de Qualificação (COM-04) — docs/17 §1.2, Manual §§13-19.
 * A avaliação antiga nunca é sobrescrita: requalificar é criar uma nova e
 * marcá-la como vigente (§19).
 */
export const AvaliacoesQualificacao: CollectionConfig = {
  slug: "avaliacoes-qualificacao",
  labels: { singular: "Avaliação de Qualificação", plural: "Avaliações de Qualificação" },
  typescript: { interface: "AvaliacaoQualificacao" },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["oportunidade", "statusAvaliacao", "scoreTotal", "resultado", "vigente"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [gravarDerivados],
    afterChange: [manterUnicaVigente],
  },
  fields: [
    {
      name: "oportunidade",
      type: "relationship",
      relationTo: "oportunidades",
      required: true,
      index: true,
    },
    { name: "sequencia", type: "number", min: 1 },
    {
      name: "statusAvaliacao",
      type: "select",
      options: STATUS_AVALIACAO,
      required: true,
      defaultValue: "em-preenchimento",
    },
    {
      name: "concluidaEm",
      type: "date",
      admin: { description: "Preenchida automaticamente quando a avaliação é concluída." },
    },
    { name: "avaliador", type: "relationship", relationTo: "users", required: true },
    { name: "owner", type: "relationship", relationTo: "users" },
    ...DIMENSOES_COM04.map((d) => ({
      name: d.campo,
      label: `${d.rotulo} (0-3)`,
      type: "number" as const,
      min: 0,
      max: 3,
      validate: validarNota,
    })),
    {
      name: "scoreTotal",
      type: "number",
      admin: { readOnly: true, description: "Soma das 9 dimensões (0-27). Derivado." },
    },
    {
      name: "faixa",
      type: "select",
      options: FAIXA_SCORE,
      admin: { readOnly: true, description: "Referência de leitura do score. Derivada." },
    },
    ...HARD_GATES_COM04.map((g) => ({
      name: g.campo,
      label: `HG · ${g.rotulo}`,
      type: "select" as const,
      options: HARD_GATE_ESTADO,
    })),
    {
      name: "resultado",
      type: "select",
      options: RESULTADO_QUALIFICACAO,
      admin: { description: "Decisão do avaliador. O score é apoio, não decide (manual §15)." },
    },
    { name: "justificativa", type: "textarea" },
    { name: "proximoPasso", type: "text" },
    {
      name: "vigente",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uma única avaliação vigente por oportunidade (manual §13)." },
    },
    { name: "observacoes", type: "textarea" },
  ],
};
