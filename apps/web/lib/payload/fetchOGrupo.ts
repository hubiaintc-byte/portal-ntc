import type { Cliente, Especialista, OGrupo } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

export interface DadosOGrupo {
  global: OGrupo | null;
  especialistas: Especialista[];
  clientes: Cliente[];
}

/**
 * Carrega o Global `o-grupo` + populates de especialistas e clientes
 * destacados. `depth: 2` para resolver as imagens/fotos. Fallback
 * gracioso quando o Global não foi salvo no admin ainda.
 */
export async function carregarOGrupo(): Promise<DadosOGrupo> {
  try {
    const payload = await obterPayload();
    const global = (await payload.findGlobal({ slug: "o-grupo", depth: 2 })) as OGrupo;

    const especialistas = Array.isArray(global.especialistasDestaque)
      ? (global.especialistasDestaque.filter(
          (e) => typeof e === "object" && e !== null,
        ) as Especialista[])
      : [];

    const clientes = Array.isArray(global.clientesDestaque)
      ? (global.clientesDestaque.filter(
          (c) => typeof c === "object" && c !== null,
        ) as Cliente[])
      : [];

    return { global, especialistas, clientes };
  } catch (err) {
    console.warn("[carregarOGrupo] falha — usando fallback", err);
    return { global: null, especialistas: [], clientes: [] };
  }
}
