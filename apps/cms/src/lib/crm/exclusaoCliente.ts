import type { CollectionBeforeDeleteHook } from "payload";

import { podeApagarCliente } from "@ntc/lib";

/** Falha fechado: cliente com leads (tipo proposta) ou eventos não pode ser apagado (spec §5.6). */
export const bloquearClienteComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const [leads, eventos] = await Promise.all([
    req.payload.count({
      collection: "leads",
      where: { and: [{ cliente: { equals: id } }, { tipo: { equals: "proposta" } }] },
      req,
    }),
    req.payload.count({ collection: "eventos-comerciais", where: { cliente: { equals: id } }, req }),
  ]);
  const r = podeApagarCliente({ numLeads: leads.totalDocs, numEventos: eventos.totalDocs });
  if (!r.ok) throw new Error(r.motivo);
};
