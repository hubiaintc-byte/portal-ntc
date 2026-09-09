/**
 * Vigência única da avaliação COM-04 (Manual NTC-COM-CRM-01 §13): uma
 * oportunidade tem no máximo uma avaliação `vigente`. Quando uma avaliação é
 * gravada como vigente, as outras da MESMA oportunidade são desmarcadas.
 *
 * Ponte fina entre o hook `afterChange` da coleção e a Local API, no mesmo
 * formato de `erroDoGateQualificada`: a decisão de SE há o que desmarcar (e
 * com qual filtro) fica na função pura `filtroOutrasVigentes`, testável sem
 * banco; o `req` é repassado para a escrita entrar na MESMA transação do
 * Payload — sem ele existiria um instante em que duas avaliações valem ao
 * mesmo tempo, e um rollback poderia deixar a desmarcação órfã.
 */

import type { Payload, PayloadRequest, Where } from "payload";

/** Forma mínima do `doc` do hook `afterChange` que a regra de vigência lê. */
export interface AvaliacaoVigenciaDoc {
  id: number | string;
  vigente?: boolean | null;
  oportunidade?: number | string | { id?: number | string | null } | null;
}

/** Id da oportunidade, aceitando a relação populada (`depth > 0`) ou só o id. */
export function idDaOportunidade(
  relacao: AvaliacaoVigenciaDoc["oportunidade"],
): number | string | null {
  if (relacao === null || relacao === undefined) return null;
  if (typeof relacao === "object") return relacao.id ?? null;
  return relacao;
}

/**
 * Filtro das OUTRAS avaliações vigentes da mesma oportunidade — a mesma
 * oportunidade, id diferente do documento recém-gravado, ainda vigentes.
 * `null` quando não há nada a desmarcar: o documento não é o vigente, ou não
 * tem oportunidade a que se referir.
 */
export function filtroOutrasVigentes(doc: AvaliacaoVigenciaDoc): Where | null {
  if (doc.vigente !== true) return null;
  const oportunidadeId = idDaOportunidade(doc.oportunidade);
  if (oportunidadeId === null) return null;
  return {
    and: [
      { oportunidade: { equals: oportunidadeId } },
      { id: { not_equals: doc.id } },
      { vigente: { equals: true } },
    ],
  };
}

/** Desmarca as outras avaliações vigentes da oportunidade. No-op quando não há filtro. */
export async function desmarcarOutrasVigentes(
  payload: Payload,
  doc: AvaliacaoVigenciaDoc,
  req?: PayloadRequest,
): Promise<void> {
  const where = filtroOutrasVigentes(doc);
  if (where === null) return;
  await payload.update({
    collection: "avaliacoes-qualificacao",
    where,
    data: { vigente: false },
    req,
  });
}
