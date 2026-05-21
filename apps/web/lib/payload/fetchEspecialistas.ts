import type { Especialista } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Carrega todos os Especialistas publicados para a página /o-grupo/corpo-docente.
 *
 * `depth: 1` para popular `foto` (Media). Ordenação por nome.
 * Retorna lista vazia em caso de falha, sem propagar exceção (fallback
 * gracioso no front).
 */
export async function carregarEspecialistas(limite = 100): Promise<Especialista[]> {
  try {
    const payload = await obterPayload();
    const resultado = await payload.find({
      collection: "especialistas",
      depth: 1,
      limit: limite,
      sort: "nome",
    });
    return resultado.docs as Especialista[];
  } catch (err) {
    console.warn("[carregarEspecialistas] falha — usando lista vazia", err);
    return [];
  }
}
