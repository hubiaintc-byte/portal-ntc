import type { Area, Cliente, Evento, Home } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Carrega o Global Home + dados auxiliares para `app/page.tsx`.
 *
 * `depth: 2` para popular `areasEmFoco`, `eventosAgendaDestaque`,
 * `clientesDestaque` e suas imagens. Try/catch garante boot do site
 * mesmo com Payload offline — cada bloco da Home aplica fallback
 * gracioso quando a chave correspondente vier `null`.
 */
export interface DadosHome {
  global: Home | null;
  areasEmFoco: Area[];
  eventosDestaque: Evento[];
  clientesDestaque: Cliente[];
}

export async function carregarHome(): Promise<DadosHome> {
  try {
    const payload = await obterPayload();
    const global = (await payload.findGlobal({ slug: "home", depth: 2 })) as Home;

    const areasEmFoco = Array.isArray(global.areasEmFoco)
      ? (global.areasEmFoco.filter((a) => typeof a === "object" && a !== null) as Area[])
      : [];

    const eventosDestaque = Array.isArray(global.eventosAgendaDestaque)
      ? (global.eventosAgendaDestaque.filter(
          (e) => typeof e === "object" && e !== null,
        ) as Evento[])
      : [];

    const clientesDestaque = Array.isArray(global.clientesDestaque)
      ? (global.clientesDestaque.filter(
          (c) => typeof c === "object" && c !== null,
        ) as Cliente[])
      : [];

    return { global, areasEmFoco, eventosDestaque, clientesDestaque };
  } catch (err) {
    console.warn("[carregarHome] falha — usando fallback", err);
    return { global: null, areasEmFoco: [], eventosDestaque: [], clientesDestaque: [] };
  }
}
