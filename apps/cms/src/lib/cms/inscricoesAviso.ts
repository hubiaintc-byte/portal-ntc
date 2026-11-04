import "server-only";

import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Inscrições de aviso (web push) por aparelho, sobre a Local API. Um
 * aparelho (endpoint) pertence a um usuário por vez: quem entra depois no
 * mesmo aparelho passa a ser o dono. Não fala com sessão — quem resolve
 * "quem é o usuário" é a Server Action.
 */

const MSG_RECUSA = "Não foi possível ativar os avisos neste aparelho.";
const ERRO_GENERICO = "Não foi possível completar a operação. Tente novamente.";

export interface DadosInscricao {
  endpoint: string;
  p256dh: string;
  auth: string;
  aparelho?: string;
}

/** Subconjunto da Local API que a remoção por usuário usa (também satisfeito por `PayloadUsuarios`). */
export interface PayloadInscricoes {
  delete(args: {
    collection: "inscricoes-aviso";
    where: { usuario: { equals: string } };
    overrideAccess: true;
  }): Promise<unknown>;
}

function vazio(v: unknown): boolean {
  return typeof v !== "string" || v.trim() === "";
}

export async function salvarInscricao(
  usuarioId: string,
  i: DadosInscricao,
): Promise<ResultadoEscrita> {
  if (vazio(usuarioId) || vazio(i?.endpoint) || vazio(i?.p256dh) || vazio(i?.auth)) {
    return { ok: false, erro: MSG_RECUSA };
  }
  if (!i.endpoint.startsWith("https://")) return { ok: false, erro: MSG_RECUSA };
  // O id do usuário é numérico no banco; o relacionamento exige número.
  const dono = Number(usuarioId);
  if (!Number.isInteger(dono)) return { ok: false, erro: MSG_RECUSA };

  try {
    const payload = await obterPayload();
    const dados = {
      usuario: dono,
      endpoint: i.endpoint,
      p256dh: i.p256dh,
      auth: i.auth,
      aparelho: i.aparelho || undefined,
    };
    const existente = await payload.find({
      collection: "inscricoes-aviso",
      where: { endpoint: { equals: i.endpoint } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const atual = existente.docs[0];
    if (atual) {
      await payload.update({
        collection: "inscricoes-aviso",
        id: atual.id,
        data: dados,
        overrideAccess: true,
      });
    } else {
      await payload.create({ collection: "inscricoes-aviso", data: dados, overrideAccess: true });
    }
    return { ok: true };
  } catch (e) {
    console.error("[salvarInscricao]", e);
    return { ok: false, erro: MSG_RECUSA };
  }
}

export async function removerInscricao(
  usuarioId: string,
  endpoint: string,
): Promise<ResultadoEscrita> {
  if (vazio(usuarioId) || vazio(endpoint)) return { ok: true };
  try {
    const payload = await obterPayload();
    await payload.delete({
      collection: "inscricoes-aviso",
      where: {
        and: [{ endpoint: { equals: endpoint } }, { usuario: { equals: usuarioId } }],
      },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    console.error("[removerInscricao]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerInscricoesDoUsuario(
  p: PayloadInscricoes,
  usuarioId: string,
): Promise<void> {
  await p.delete({
    collection: "inscricoes-aviso",
    where: { usuario: { equals: usuarioId } },
    overrideAccess: true,
  });
}
