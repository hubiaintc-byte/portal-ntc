import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";

/**
 * Executa `fn` numa transação do Payload com `req.user` = usuário da sessão.
 * Toda chamada da Local API dentro de `fn` DEVE passar `req` — é o que faz
 * hooks (linha do tempo) e escritas compostas entrarem na mesma transação.
 */
export async function executarEmTransacao<T>(
  payload: Payload,
  usuario: UsuarioAutenticado,
  fn: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const req = await createLocalReq({ user: usuario }, payload);
  await initTransaction(req);
  try {
    const r = await fn(req);
    await commitTransaction(req);
    return r;
  } catch (e) {
    await killTransaction(req);
    throw e;
  }
}
