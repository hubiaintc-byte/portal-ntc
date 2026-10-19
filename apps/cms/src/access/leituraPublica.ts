import type { Access, FieldAccess, PayloadRequest, Where } from "payload";

/**
 * Leitura pela API pública do Payload (REST) para quem não está logado.
 *
 * Até 19/10/2026 estas coleções tinham `read: () => true`, e a REST entregava
 * rascunhos (inclusive com `?draft=true`), especialistas ocultos do site e
 * campos comerciais. O site e o painel leem pela Local API, que ignora estas
 * regras (`overrideAccess`), então nada muda para eles.
 */

const PUBLICADO: Where = { _status: { equals: "published" } };

/** `?draft=true` na REST (ou `draft: true` vindo pela query). */
function pedeRascunho(req: PayloadRequest): boolean {
  const draft = (req.query as Record<string, unknown> | undefined)?.draft;
  return draft === "true" || draft === true;
}

/** Coleção com rascunho: anônimo vê só o publicado (mais o filtro `extra`) e nunca pede rascunho. */
export function leituraPublica(extra?: Where): Access {
  return ({ req }) => {
    if (req.user) return true;
    if (pedeRascunho(req)) return false;
    return extra ? { and: [PUBLICADO, extra] } : PUBLICADO;
  };
}

/** Global com rascunho: anônimo lê o documento publicado, mas não a versão em rascunho. */
export const leituraPublicaGlobal: Access = ({ req }) => Boolean(req.user) || !pedeRascunho(req);

/** Campo interno (preço, link de replay pago): só para quem está logado. */
export const campoSoParaLogado: FieldAccess = ({ req }) => Boolean(req.user);
