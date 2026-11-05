import type { CollectionConfig } from "payload";

import { LISTAS_FIN } from "@ntc/lib";

import { bloquearCustoComPagamento } from "../../lib/financeiro/exclusao";

import {
  acessoFin,
  CENTROS_CUSTO,
  centavos,
  competencia,
  data,
  hooksAuditoriaFin,
  lista,
  naoNegativo,
  texto,
  textoLongo,
  TIPOS_LANCAMENTO,
} from "./campos";

/**
 * Custo (spec §4.2). Sem `evento` ⇒ despesa corporativa. `origemLancamento`
 * fica em texto livre: na Fase 2 recebe "Comissão" sem migração (spec §3.5).
 */
export const FinCustos: CollectionConfig = {
  slug: "fin-custos",
  labels: { singular: "Custo", plural: "Custos" },
  typescript: { interface: "FinCusto" },
  admin: { useAsTitle: "descricao", group: "Financeiro" },
  access: acessoFin("fin-custos"),
  hooks: { ...hooksAuditoriaFin, beforeDelete: [bloquearCustoComPagamento] },
  fields: [
    { name: "evento", type: "relationship", relationTo: "fin-eventos", index: true },
    lista("tipoLancamento", TIPOS_LANCAMENTO),
    lista("centroCusto", CENTROS_CUSTO),
    { name: "compartilhada", type: "checkbox" },
    texto("origemLancamento"),
    lista("fase", LISTAS_FIN.fases),
    texto("categoria"),
    texto("subcategoria"),
    texto("descricao"),
    texto("fornecedor"),
    texto("documento"),
    lista("natureza", LISTAS_FIN.naturezas),
    lista("comportamento", LISTAS_FIN.comportamentos),
    lista("driver", LISTAS_FIN.drivers),
    lista("unidade", LISTAS_FIN.unidades),
    naoNegativo("qtde"),
    centavos("valorUnitPrev"),
    centavos("valorRealizado"),
    competencia("competencia"),
    data("dataPrevista"),
    lista("periodicidade", LISTAS_FIN.periodicidades),
    texto("criterioApropriacao"),
    textoLongo("observacao"),
  ],
};
