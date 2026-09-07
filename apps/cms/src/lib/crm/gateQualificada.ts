/**
 * Gate do estágio "Qualificada" (Sessão H3 · docs/17 · Manual NTC-COM-CRM-01
 * §18). Ponte fina entre a Local API e a regra pura `avaliacaoPermiteQualificada`
 * (`@ntc/lib`): busca a avaliação COM-04 vigente da oportunidade e devolve o
 * veredito da regra — a mensagem de bloqueio (texto contratual, verbatim) ou
 * `null` quando as 10 condições do §18 estão cumpridas.
 */

import type { Payload, PayloadRequest } from "payload";
import type { AvaliacaoQualificacao } from "@ntc/types";

import { avaliacaoPermiteQualificada, type AvaliacaoCom04 } from "@ntc/lib";

/**
 * Estreita o doc gerado do Payload — tipado com campos fixos, sem index
 * signature — para a forma solta que a regra pura lê (`AvaliacaoCom04`, que
 * cobre as 9 dimensões e os 7 hard gates por nome dinâmico). Toda propriedade
 * de `AvaliacaoQualificacao` já é compatível com os tipos explícitos de
 * `AvaliacaoCom04` ou com o `unknown` do índice — a conversão só remove a
 * exigência formal de index signature que o TS pede entre dois tipos nomeados.
 */
const comoAvaliacaoCom04 = (doc: AvaliacaoQualificacao | null): AvaliacaoCom04 | null =>
  doc as unknown as AvaliacaoCom04 | null;

/**
 * Erro de negócio do gate — distinto de uma falha genérica de escrita. A
 * camada de escrita (`painelCrmEscrita.ts`) o reconhece pelo tipo e repassa
 * a mensagem íntegra ao usuário, em vez do erro genérico que a esconderia.
 */
export class ErroGateQualificada extends Error {}

/**
 * Devolve a mensagem de bloqueio do §18, ou `null` quando a avaliação vigente
 * de `oportunidadeId` cumpre as 10 condições. A consulta filtra por
 * `oportunidade equals` **e** `vigente equals true` juntos: uma avaliação
 * vigente de OUTRA oportunidade nunca libera o gate desta. `req` é opcional
 * e, quando presente, mantém a leitura na mesma transação do Payload.
 */
export async function erroDoGateQualificada(
  payload: Payload,
  oportunidadeId: number | string,
  req?: PayloadRequest,
): Promise<string | null> {
  const resultado = await payload.find({
    collection: "avaliacoes-qualificacao",
    where: {
      and: [{ oportunidade: { equals: oportunidadeId } }, { vigente: { equals: true } }],
    },
    limit: 1,
    depth: 0,
    req,
  });
  return avaliacaoPermiteQualificada(comoAvaliacaoCom04(resultado.docs[0] ?? null));
}
