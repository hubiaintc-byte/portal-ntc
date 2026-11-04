import type { CollectionAfterChangeHook } from "payload";
import { after } from "next/server";

import { deveAvisarLead, montarAvisoLead } from "@ntc/lib";

import { enviarAvisoATodos } from "./enviarAviso";

/**
 * Avisa os aparelhos inscritos quando um lead chega pelo site (só na criação).
 * Usa `after()` para a plataforma manter a função viva até o envio terminar;
 * fora de um request (scripts, seeds) `after` lança e cai no disparo solto.
 */
export const avisarLeadNovo: CollectionAfterChangeHook = ({ doc, operation, req }) => {
  if (deveAvisarLead({ operation, origemEntrada: doc.origemEntrada })) {
    const enviar = () =>
      enviarAvisoATodos(req.payload, montarAvisoLead(doc)).catch((e) =>
        console.error("[avisoLead]", e),
      );
    try {
      after(enviar);
    } catch {
      void enviar();
    }
  }
  return doc;
};
