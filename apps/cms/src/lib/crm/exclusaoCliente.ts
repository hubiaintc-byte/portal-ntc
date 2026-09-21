import type { CollectionBeforeDeleteHook } from "payload";

import { podeApagarCliente } from "@ntc/lib";

/**
 * Falha fechado: cliente com leads (tipo proposta), eventos ou propostas não
 * pode ser apagado (spec §5.6). Propostas contam à parte dos leads porque
 * `propostas.cliente` sobrevive mesmo depois de o lead que a originou ser
 * apagado (`apagarLead` desvincula o lead, não a proposta) — sem essa
 * contagem, esse cliente passava aqui e só falhava no `delete`, contra a
 * FK `NOT NULL` de `propostas.cliente_id`.
 */
export const bloquearClienteComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const [leads, eventos, propostas] = await Promise.all([
    req.payload.count({
      collection: "leads",
      where: { and: [{ cliente: { equals: id } }, { tipo: { equals: "proposta" } }] },
      req,
    }),
    req.payload.count({ collection: "eventos-comerciais", where: { cliente: { equals: id } }, req }),
    req.payload.count({ collection: "propostas", where: { cliente: { equals: id } }, req }),
  ]);
  const r = podeApagarCliente({ numLeads: leads.totalDocs, numEventos: eventos.totalDocs, numPropostas: propostas.totalDocs });
  if (!r.ok) throw new Error(r.motivo);
};
