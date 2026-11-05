import {
  APIError,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
  type Where,
} from "payload";

import {
  podeExcluirConta,
  podeExcluirCusto,
  podeExcluirReceita,
  type FaturamentoFin,
  type LivroFinanceiro,
  type PagamentoFin,
  type ResultadoValidacao,
} from "@ntc/lib";

/**
 * Regras de exclusão do Financeiro também no nível da coleção (spec §4.2),
 * para valer fora das Server Actions (REST/Local API de um administrador).
 * Sem isto a FK `ON DELETE SET NULL` zeraria em silêncio, sem auditoria, a
 * conta de faturamentos/pagamentos ou o evento de receitas/custos. Falha
 * fechado, no padrão de `lib/crm/exclusaoCliente.ts`: consulta que falha
 * propaga e a exclusão não acontece. A cascata de `excluirEventoFin` apaga os
 * filhos antes (pagamentos → custos → faturamentos → receitas → evento), então
 * passa por estas guardas.
 *
 * As consultas rodam em sequência: compartilham o `req` (a mesma transação).
 */

type Id = string | number;

async function contar(
  req: PayloadRequest,
  collection: Parameters<PayloadRequest["payload"]["count"]>[0]["collection"],
  where: Where,
) {
  const r = await req.payload.count({ collection, where, req });
  return r.totalDocs;
}

function recusarSe(r: ResultadoValidacao): void {
  if (!r.ok) throw new APIError(r.erro, 400);
}

const LIVRO_VAZIO: LivroFinanceiro = {
  eventos: [],
  receitas: [],
  faturamentos: [],
  custos: [],
  pagamentos: [],
  contas: [],
};

/**
 * Livro mínimo com `k` linhas dependentes, só para reaproveitar as mensagens
 * literais de `podeExcluir*` (que contam linhas do livro) a partir de uma
 * contagem no banco. Só os campos que essas funções leem são preenchidos.
 */
function linhas<T>(k: number, campos: Partial<T>): T[] {
  return Array.from({ length: k }, () => campos as T);
}

/** `beforeDelete` de `fin-receitas`: receita com faturamento não se exclui. */
export const bloquearReceitaComFaturamento: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const k = await contar(req, "fin-faturamentos", { receita: { equals: id } });
  const ref = String(id);
  recusarSe(
    podeExcluirReceita(ref, {
      ...LIVRO_VAZIO,
      faturamentos: linhas<FaturamentoFin>(k, { receitaId: ref }),
    }),
  );
};

/** `beforeDelete` de `fin-custos`: custo com título não se exclui. */
export const bloquearCustoComPagamento: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const k = await contar(req, "fin-pagamentos", { custo: { equals: id } });
  const ref = String(id);
  recusarSe(
    podeExcluirCusto(ref, {
      ...LIVRO_VAZIO,
      pagamentos: linhas<PagamentoFin>(k, { custoId: ref }),
    }),
  );
};

/** `beforeDelete` de `fin-contas`: conta usada por recebimento ou pagamento não se exclui ("Inative-a"). */
export const bloquearContaEmUso: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const nf = await contar(req, "fin-faturamentos", { conta: { equals: id } });
  const np = await contar(req, "fin-pagamentos", { conta: { equals: id } });
  const ref = String(id);
  recusarSe(
    podeExcluirConta(ref, {
      ...LIVRO_VAZIO,
      faturamentos: linhas<FaturamentoFin>(nf, { contaId: ref }),
      pagamentos: linhas<PagamentoFin>(np, { contaId: ref }),
    }),
  );
};

/** Mensagem da Task 10 (`excluirEventoFin`) para evento com lançamentos. */
export const MSG_EVENTO_FIN_COM_LANCAMENTOS =
  "Este evento tem lançamentos; exclua-os antes de remover o cadastro financeiro.";

/** `beforeDelete` de `fin-eventos`: só sai sem receitas nem custos. */
export const bloquearFinEventoComLancamentos: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const receitas = await contar(req, "fin-receitas", { evento: { equals: id } });
  const custos = await contar(req, "fin-custos", { evento: { equals: id } });
  if (receitas > 0 || custos > 0) throw new APIError(MSG_EVENTO_FIN_COM_LANCAMENTOS, 400);
};

/**
 * `beforeDelete` de `eventos-comerciais` (spec §8.1): recusa apagar o evento
 * comercial enquanto o registro financeiro dele (`fin-eventos`) tiver receita
 * ou custo. Sem lançamentos, apaga o registro financeiro na mesma transação
 * (auditado) — senão a FK `SET NULL` deixaria um `fin-eventos` sem vínculo e
 * sem nome, que a leitura mostraria como evento próprio do financeiro.
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
  const ids: Id[] = fin.docs.map((d) => d.id);
  const receitas = await contar(req, "fin-receitas", { evento: { in: ids } });
  const custos = await contar(req, "fin-custos", { evento: { in: ids } });
  if (receitas > 0 || custos > 0) {
    throw new APIError("Este evento tem lançamentos no Financeiro e não pode ser apagado.", 400);
  }
  for (const finId of ids) {
    await req.payload.delete({ collection: "fin-eventos", id: finId, req });
  }
};
