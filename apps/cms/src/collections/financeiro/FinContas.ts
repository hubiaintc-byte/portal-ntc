import type { CollectionConfig } from "payload";

import { LISTAS_FIN } from "@ntc/lib";

import { bloquearContaEmUso } from "../../lib/financeiro/exclusao";

import { acessoFin, centavosComSinal, data, hooksAuditoriaFin, lista, texto, textoLongo } from "./campos";

/** Conta financeira — cadastro mínimo emprestado da Fase 2 (spec §3.4). */
export const FinContas: CollectionConfig = {
  slug: "fin-contas",
  labels: { singular: "Conta financeira", plural: "Contas financeiras" },
  typescript: { interface: "FinConta" },
  admin: { useAsTitle: "nome", group: "Financeiro" },
  access: acessoFin("fin-contas"),
  hooks: { ...hooksAuditoriaFin, beforeDelete: [bloquearContaEmUso] },
  fields: [
    { name: "nome", type: "text", required: true },
    lista("tipo", LISTAS_FIN.tiposConta),
    texto("banco"),
    texto("agencia"),
    texto("numero"),
    centavosComSinal("saldoInicial"),
    data("dataSaldoInicial"),
    { name: "ativa", type: "checkbox", defaultValue: true },
    textoLongo("observacao"),
  ],
};
