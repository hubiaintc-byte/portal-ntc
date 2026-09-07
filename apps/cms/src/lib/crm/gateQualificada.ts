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

/** Forma mínima do `data`/`originalDoc` do hook `beforeChange` que a decisão lê. */
export interface CamposGateQualificada {
  estagio?: string | null;
  id?: number | string | null;
}

export interface DecisaoGateQualificada {
  /** true quando esta escrita está transicionando o estágio PARA "qualificada". */
  precisaGate: boolean;
  /**
   * Id da oportunidade a consultar no gate. `undefined` quando a escrita é
   * uma criação (a oportunidade ainda não tem id) — nesse caso não há como
   * existir avaliação vigente, e o chamador deve bloquear direto, sem
   * consultar a Local API.
   */
  oportunidadeId: number | string | undefined;
}

const idOuIndefinido = (v: number | string | null | undefined): number | string | undefined =>
  v === null || v === undefined ? undefined : v;

/**
 * Decide, a partir de `data`/`originalDoc` do hook `beforeChange` de
 * `oportunidades`, se esta escrita precisa passar pelo gate do §18 e contra
 * qual id de oportunidade. Pura — sem I/O — para ser testada sem mockar a
 * Local API; o hook da coleção é só o invólucro fino que chama esta função e,
 * quando `precisaGate` é `true`, decide a mensagem (consultando
 * `erroDoGateQualificada` quando há id, ou bloqueando direto quando não há).
 *
 * Só age na transição PARA "qualificada": se `originalDoc.estagio` já é
 * "qualificada" (edição por motivo não relacionado, ex.: trocar o
 * responsável), ou se `data.estagio` não é "qualificada" (criação/edição
 * indo para qualquer outro estágio), a resposta é `precisaGate: false` e o
 * `oportunidadeId` não importa. Na criação, `originalDoc` não existe —
 * `originalDoc?.estagio` fica `undefined` (`!== "qualificada"`) — então uma
 * oportunidade criada DIRETO como "Qualificada" também aciona o gate, com
 * `oportunidadeId: undefined` (ainda não existe id a consultar).
 */
export function decisaoGateQualificada(
  data: CamposGateQualificada | null | undefined,
  originalDoc: CamposGateQualificada | null | undefined,
): DecisaoGateQualificada {
  const precisaGate = originalDoc?.estagio !== "qualificada" && data?.estagio === "qualificada";
  if (!precisaGate) return { precisaGate: false, oportunidadeId: undefined };
  const oportunidadeId = idOuIndefinido(originalDoc?.id) ?? idOuIndefinido(data?.id);
  return { precisaGate: true, oportunidadeId };
}
