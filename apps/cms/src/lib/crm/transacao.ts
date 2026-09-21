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
 *
 * Atenção: só um `throw` dentro de `fn` faz rollback (`killTransaction`).
 * Um `return { ok: false, ... }` normal ainda **comita** a transação — é
 * o caminho certo para uma recusa de validação que não escreveu nada
 * (ex.: "digite o nome para confirmar"), mas seria o caminho ERRADO se um
 * dia `fn` escrever algo e só depois decidir devolver `ok: false`: essa
 * escrita ficaria commitada mesmo com o resultado dizendo que falhou. Hoje
 * nenhum `return { ok: false }` em `fn` acontece depois de uma escrita
 * (ver `apagarLead`/`apagarCliente`/`registrarContratoEmpenho`), mas quem
 * adicionar um novo fluxo composto precisa preservar essa ordem — falhar
 * validação sempre ANTES de escrever, ou lançar em vez de retornar.
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
