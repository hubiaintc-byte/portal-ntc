import "server-only";

import type { Where } from "payload";

import type { StoreRateLimit } from "@ntc/lib";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Store do rate limit apoiado na coleção `tentativas-acesso` (Payload).
 * A regra fica em @ntc/lib; aqui só entra o acesso ao banco, que só os
 * apps alcançam.
 */
export function criarStoreRateLimit(): StoreRateLimit {
  const filtro = (rota: string, ip: string): Where[] => [
    { rota: { equals: rota } },
    { ip: { equals: ip } },
  ];

  return {
    async contarDesde(rota, ip, desde) {
      const payload = await obterPayload();
      const res = await payload.find({
        collection: "tentativas-acesso",
        where: { and: [...filtro(rota, ip), { createdAt: { greater_than: desde.toISOString() } }] },
        limit: 0,
        depth: 0,
        overrideAccess: true,
      });
      return res.totalDocs;
    },

    async registrar(rota, ip) {
      const payload = await obterPayload();
      await payload.create({
        collection: "tentativas-acesso",
        data: { rota, ip },
        overrideAccess: true,
      });
    },

    async limparAntesDe(rota, ip, antesDe) {
      const payload = await obterPayload();
      await payload.delete({
        collection: "tentativas-acesso",
        where: { and: [...filtro(rota, ip), { createdAt: { less_than: antesDe.toISOString() } }] },
        overrideAccess: true,
      });
    },
  };
}
