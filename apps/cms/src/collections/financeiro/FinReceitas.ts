import type { CollectionConfig } from "payload";

import { LISTAS_FIN } from "@ntc/lib";

import { bloquearReceitaComFaturamento } from "../../lib/financeiro/exclusao";

import {
  acessoFin,
  CENTROS_CUSTO,
  centavos,
  competencia,
  data,
  hooksAuditoriaFin,
  inteiro,
  lista,
  naoNegativo,
  texto,
  textoLongo,
  TIPOS_LANCAMENTO,
} from "./campos";

/** Só estes dois são gravados; os demais status da receita são derivados na leitura. */
const STATUS_ECONOMICO_GRAVADO: readonly string[] = ["Prevista", "Contratada"];

/** Receita (spec §4.2). Sem `evento` ⇒ corporativa, com centro de custo. */
export const FinReceitas: CollectionConfig = {
  slug: "fin-receitas",
  labels: { singular: "Receita", plural: "Receitas" },
  typescript: { interface: "FinReceita" },
  admin: { useAsTitle: "cliente", group: "Financeiro" },
  access: acessoFin("fin-receitas"),
  hooks: { ...hooksAuditoriaFin, beforeDelete: [bloquearReceitaComFaturamento] },
  fields: [
    { name: "evento", type: "relationship", relationTo: "fin-eventos", index: true },
    lista("tipoLancamento", TIPOS_LANCAMENTO),
    lista("centroCusto", CENTROS_CUSTO),
    texto("cliente"),
    lista("segmento", LISTAS_FIN.segmentos),
    texto("origem"),
    lista("tipoReceita", LISTAS_FIN.tiposReceita),
    texto("etapa"),
    naoNegativo("qtde"),
    centavos("valorUnit"),
    centavos("desconto"),
    inteiro("pagantes"),
    inteiro("cortesias"),
    lista("statusEconomico", STATUS_ECONOMICO_GRAVADO),
    lista("criterioReconhecimento", LISTAS_FIN.criteriosReconhecimento),
    {
      name: "etapas",
      type: "array",
      fields: [
        texto("nome"),
        lista("base", ["valor", "percentual"]),
        centavos("valor"),
        naoNegativo("percentual"),
        { name: "concluida", type: "checkbox" },
        data("dataConclusao"),
      ],
    },
    competencia("competencia"),
    texto("referencia"),
    textoLongo("observacao"),
  ],
};
