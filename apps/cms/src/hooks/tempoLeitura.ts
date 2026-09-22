import type { CollectionBeforeChangeHook } from "payload";

import { calcularTempoLeituraMin } from "@ntc/lib";

import { lexicalParaTexto } from "../lib/cms/lexical";

/**
 * Deriva `tempoLeituraMin` do corpo a cada gravação. O campo é read-only
 * no painel: é informação calculada, não digitada.
 *
 * beforeChange de coleção no Payload 3.18 já recebe `data` mesclado com o
 * documento original, então update parcial não zera o corpo ausente.
 */
export const derivarTempoLeitura: CollectionBeforeChangeHook = async ({ data }) => {
  const texto = lexicalParaTexto(data?.corpo);
  return { ...data, tempoLeituraMin: calcularTempoLeituraMin(texto) };
};
