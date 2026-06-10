import { cache } from "react";
import { getPayload, type Payload } from "payload";

import config from "@payload-config";

/**
 * Cliente Payload server-only do app cms — espelho de
 * apps/web/lib/payloadClient.ts, mas importando a config local via alias
 * @payload-config. Instancia o Payload uma vez por request via cache().
 *
 * Nunca importe este módulo em Client Component.
 */
export const obterPayload = cache(async (): Promise<Payload> => {
  return getPayload({ config });
});
