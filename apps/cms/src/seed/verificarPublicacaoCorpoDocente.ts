/**
 * Verificação (somente leitura de fato) de que o Global corpo-docente aceita
 * ser publicado com `{ cards, _status: "published" }` sem apagar o resto.
 *
 * A transação é SEMPRE desfeita (killTransaction) — nada fica gravado.
 *
 * Execução: pnpm --filter @ntc/cms corpo-docente:verificar
 */

import { createLocalReq, getPayload, initTransaction, killTransaction } from "payload";

import config from "../payload.config";

async function main(): Promise<void> {
  let falhou = false;
  let req: Awaited<ReturnType<typeof createLocalReq>> | undefined;
  let transacaoAberta = false;
  try {
    const payload = await getPayload({ config });
    req = await createLocalReq({}, payload);
    transacaoAberta = Boolean(await initTransaction(req));
    const antes = await payload.findGlobal({ slug: "corpo-docente", depth: 0, draft: true, req });
    const cards = antes.cards ?? [];

    await payload.updateGlobal({
      slug: "corpo-docente",
      data: { cards, _status: "published" },
      depth: 0,
      overrideAccess: true,
      req,
    });

    const depois = await payload.findGlobal({ slug: "corpo-docente", depth: 0, draft: false, req });

    const heroIgual = JSON.stringify(antes.hero) === JSON.stringify(depois.hero);
    const linksIgual = JSON.stringify(antes.hero?.quicklinks) === JSON.stringify(depois.hero?.quicklinks);
    const cardsIgual = (depois.cards ?? []).length === cards.length;
    if (!heroIgual || !linksIgual || !cardsIgual) {
      throw new Error(
        `Campos alterados: hero=${heroIgual ? "ok" : "DIFERENTE"} quicklinks=${linksIgual ? "ok" : "DIFERENTE"} cards=${cardsIgual ? "ok" : `DIFERENTE (${cards.length} -> ${(depois.cards ?? []).length})`}`,
      );
    }
    console.log("OK — publicável, demais campos preservados");
  } catch (e) {
    falhou = true;
    console.error("FALHOU:", e instanceof Error ? e.message : e);
    const dados = (e as { data?: unknown }).data;
    if (dados) console.error(JSON.stringify(dados, null, 2));
  } finally {
    if (req && transacaoAberta) await killTransaction(req);
  }
  process.exit(falhou ? 1 : 0);
}

await main();
