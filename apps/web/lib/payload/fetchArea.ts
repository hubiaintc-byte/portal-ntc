import type { Area, Programa } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

export interface DadosArea {
  area: Area | null;
  programas: Programa[];
}

/**
 * Carrega uma Área Estratégica pelo `slug` + todos os programas vinculados.
 *
 * `depth: 1` para popular `imagemHero` da Área e `imagemCapa` dos Programas.
 * Retorna `{ area: null, programas: [] }` se a área não existir ou o
 * Payload falhar — o caller deve aplicar `notFound()` quando `area === null`.
 */
export async function carregarArea(slug: string): Promise<DadosArea> {
  try {
    const payload = await obterPayload();
    const resultadoArea = await payload.find({
      collection: "areas",
      depth: 1,
      where: { slug: { equals: slug } },
      limit: 1,
    });
    const area = (resultadoArea.docs[0] as Area | undefined) ?? null;
    if (!area) return { area: null, programas: [] };

    const resultadoProgramas = await payload.find({
      collection: "programas",
      depth: 1,
      where: { area: { equals: area.id } },
      limit: 50,
      sort: "sigla",
    });

    return { area, programas: resultadoProgramas.docs as Programa[] };
  } catch (err) {
    console.warn("[carregarArea] falha — usando fallback", err);
    return { area: null, programas: [] };
  }
}
