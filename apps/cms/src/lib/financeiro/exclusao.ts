import { APIError, type CollectionBeforeDeleteHook } from "payload";

/**
 * `beforeDelete` de `eventos-comerciais` (spec §8.1): recusa apagar o evento
 * comercial enquanto o registro financeiro dele (`fin-eventos`) tiver receita
 * ou custo. Falha fechado, no padrão de `lib/crm/exclusaoCliente.ts`: consulta
 * que falha propaga e a exclusão não acontece.
 */
export const bloquearEventoComFinanceiro: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const fin = await req.payload.find({
    collection: "fin-eventos",
    where: { eventoComercial: { equals: id } },
    depth: 0,
    pagination: false,
    req,
  });
  if (fin.docs.length === 0) return;
  const ids = fin.docs.map((d) => d.id);
  const [receitas, custos] = await Promise.all([
    req.payload.count({ collection: "fin-receitas", where: { evento: { in: ids } }, req }),
    req.payload.count({ collection: "fin-custos", where: { evento: { in: ids } }, req }),
  ]);
  if (receitas.totalDocs > 0 || custos.totalDocs > 0) {
    throw new APIError("Este evento tem lançamentos no Financeiro e não pode ser apagado.", 400);
  }
};
