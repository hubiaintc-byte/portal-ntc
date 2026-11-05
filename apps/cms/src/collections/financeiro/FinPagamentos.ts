import type { CollectionConfig } from "payload";

import { acessoFin, centavos, data, hooksAuditoriaFin, texto, textoLongo } from "./campos";

/** Título e baixa na mesma linha, como no protótipo. O evento é derivado pelo custo. */
export const FinPagamentos: CollectionConfig = {
  slug: "fin-pagamentos",
  labels: { singular: "Pagamento", plural: "Pagamentos" },
  typescript: { interface: "FinPagamento" },
  admin: { useAsTitle: "documento", group: "Financeiro" },
  access: acessoFin("fin-pagamentos"),
  hooks: hooksAuditoriaFin,
  fields: [
    { name: "custo", type: "relationship", relationTo: "fin-custos", required: true, index: true },
    texto("documento"),
    data("vencimento"),
    centavos("valor"),
    data("dataPagamento"),
    centavos("valorPago"),
    { name: "conta", type: "relationship", relationTo: "fin-contas", index: true },
    textoLongo("observacao"),
  ],
};
