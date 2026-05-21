import { cache } from "react";
import { getPayload, type Payload } from "payload";

import config from "@ntc/cms/payload.config";

/**
 * Cliente Payload server-only para o `apps/web`.
 *
 * Carrega a config do `@ntc/cms` (devDependency) e instancia o Payload
 * uma única vez por request via `cache()` do React. Use em route handlers
 * de `/api/forms/*` e em Server Components que precisem ler globals
 * (ex.: `<RodapeSoberano>` no `app/layout.tsx`).
 *
 * Nunca importe este módulo no client — o `@ntc/cms` puxa dependências
 * server-only (db-postgres, sharp, etc.) que quebram o bundle do browser.
 */
export const obterPayload = cache(async (): Promise<Payload> => {
  return getPayload({ config });
});
