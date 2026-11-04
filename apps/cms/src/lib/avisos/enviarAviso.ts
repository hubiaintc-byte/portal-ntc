import webpush from "web-push";
import type { Payload } from "payload";

import type { AvisoPush } from "@ntc/lib";

/**
 * Envio do web push do aviso de lead novo. Alcançado pelo hook de `leads`,
 * que também roda no processo do apps/web: só imports relativos ou `@ntc/*`.
 */

export interface ConfigVapid {
  publica: string;
  privada: string;
  assunto: string;
}

export type EnviarFn = (
  inscricao: { endpoint: string; keys: { p256dh: string; auth: string } },
  corpo: string,
) => Promise<unknown>;

export function configVapid(
  env: Record<string, string | undefined> = process.env,
): ConfigVapid | null {
  const publica = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = env.VAPID_PRIVATE_KEY;
  if (!publica || !privada) return null;
  return {
    publica,
    privada,
    assunto: env.VAPID_SUBJECT || "mailto:contato@institutontc.com.br",
  };
}

function enviarPadrao(vapid: ConfigVapid): EnviarFn {
  return (inscricao, corpo) =>
    webpush.sendNotification(inscricao, corpo, {
      vapidDetails: { subject: vapid.assunto, publicKey: vapid.publica, privateKey: vapid.privada },
    });
}

function statusDoErro(e: unknown): number | null {
  if (typeof e === "object" && e !== null && "statusCode" in e) {
    const s = (e as { statusCode: unknown }).statusCode;
    return typeof s === "number" ? s : null;
  }
  return null;
}

function hostDoEndpoint(endpoint: string): string {
  try {
    return new URL(endpoint).host;
  } catch {
    return "?";
  }
}

export async function enviarAvisoATodos(
  payload: Payload,
  aviso: AvisoPush,
  deps: { enviar?: EnviarFn; vapid?: ConfigVapid | null } = {},
): Promise<{ enviados: number; removidos: number }> {
  const vapid = deps.vapid === undefined ? configVapid() : deps.vapid;
  if (!vapid) return { enviados: 0, removidos: 0 };
  const enviar = deps.enviar ?? enviarPadrao(vapid);

  const { docs } = await payload.find({
    collection: "inscricoes-aviso",
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });
  const corpo = JSON.stringify(aviso);

  const resultados = await Promise.allSettled(
    docs.map(async (d) => {
      try {
        await enviar({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, corpo);
        return "enviado" as const;
      } catch (e) {
        const status = statusDoErro(e);
        if (status === 404 || status === 410) {
          await payload.delete({ collection: "inscricoes-aviso", id: d.id, overrideAccess: true });
          return "removido" as const;
        }
        console.error(
          "[avisoLead]",
          status ?? e,
          "host:",
          hostDoEndpoint(d.endpoint),
        );
        return "falhou" as const;
      }
    }),
  );

  let enviados = 0;
  let removidos = 0;
  for (const r of resultados) {
    if (r.status !== "fulfilled") {
      console.error("[avisoLead]", r.reason);
      continue;
    }
    if (r.value === "enviado") enviados += 1;
    if (r.value === "removido") removidos += 1;
  }
  return { enviados, removidos };
}
