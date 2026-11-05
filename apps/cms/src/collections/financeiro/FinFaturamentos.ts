import type { CollectionConfig } from "payload";

import { acessoFin, centavos, data, hooksAuditoriaFin, texto, textoLongo } from "./campos";

/**
 * Faturamento e recebimento na mesma linha (`fatrec` do protótipo). O evento
 * é derivado pela receita (não se copia `eventoId`), e `quitado` é derivado.
 */
export const FinFaturamentos: CollectionConfig = {
  slug: "fin-faturamentos",
  labels: { singular: "Faturamento", plural: "Faturamentos" },
  typescript: { interface: "FinFaturamento" },
  admin: { useAsTitle: "parcela", group: "Financeiro" },
  access: acessoFin(["fin.eventos", "fin.receber"]),
  hooks: hooksAuditoriaFin,
  fields: [
    {
      name: "receita",
      type: "relationship",
      relationTo: "fin-receitas",
      required: true,
      index: true,
    },
    texto("parcela"),
    texto("nf"),
    data("dataFaturamento"),
    centavos("valorFaturado"),
    data("vencimento"),
    centavos("retencaoTributaria"),
    centavos("retencaoContratual"),
    centavos("retencaoContratualLiberada"),
    data("dataRecebimento"),
    centavos("valorRecebido"),
    { name: "conta", type: "relationship", relationTo: "fin-contas", index: true },
    textoLongo("observacao"),
  ],
};
