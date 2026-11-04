import type { CollectionAfterChangeHook } from "payload";

import { deveAvisarLead, montarAvisoLead } from "@ntc/lib";

import { enviarAvisoATodos } from "./enviarAviso";

/** Avisa os aparelhos inscritos quando um lead chega pelo site (só na criação). */
export const avisarLeadNovo: CollectionAfterChangeHook = ({ doc, operation, req }) => {
  if (deveAvisarLead({ operation, origemEntrada: doc.origemEntrada })) {
    void enviarAvisoATodos(req.payload, montarAvisoLead(doc)).catch((e) =>
      console.error("[avisoLead]", e),
    );
  }
  return doc;
};
