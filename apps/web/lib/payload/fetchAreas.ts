import type { Area } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Carrega as 3 Áreas Estratégicas. `depth: 1` para popular `imagemHero`.
 * Ordenação respeita a hierarquia editorial: Educação → Gestão Pública → Saúde.
 */
const ORDEM_SIGLAS: Record<string, number> = {
  educacao: 0,
  "gestao-publica": 1,
  saude: 2,
};

export async function carregarAreas(): Promise<Area[]> {
  try {
    const payload = await obterPayload();
    const resultado = await payload.find({
      collection: "areas",
      depth: 1,
      limit: 10,
    });
    return (resultado.docs as Area[]).sort(
      (a, b) => (ORDEM_SIGLAS[a.sigla] ?? 99) - (ORDEM_SIGLAS[b.sigla] ?? 99),
    );
  } catch (err) {
    console.warn("[carregarAreas] falha — usando lista vazia", err);
    return [];
  }
}
