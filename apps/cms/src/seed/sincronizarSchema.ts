/**
 * Força a sincronização do schema (drizzle push) numa execução única e
 * controlada. Uso: pnpm payload:push:schema (exige PAYLOAD_DB_PUSH=1, que o
 * script npm já define). Mudanças devem ser ADITIVAS; prompt de DATA LOSS ⇒ N.
 */
import { getPayload } from "payload";

import config from "../payload.config";

const payload = await getPayload({ config });
// Uma leitura qualquer garante a conexão inicializada (o push roda no connect).
const usuarios = await payload.count({ collection: "users" });
console.log(`Schema sincronizado. (users: ${usuarios.totalDocs})`);
process.exit(0);
