import { acessoPorTela } from "../access/porTela";
import { TELAS_LEADS } from "../lib/cms/telas";
import type { Access, CollectionConfig } from "payload";

import { TIPOS_LINHA_DO_TEMPO } from "@ntc/lib";

/**
 * Linha do tempo do cliente (spec 2026-09-15 §3.7). Append-only: update e
 * delete negados a todos. `create` é negado à UI, exceto para notas
 * manuais (`tipo = nota`) de usuário com acesso ao CRM — os demais tipos são
 * gravados só pela Local API interna (hooks), com overrideAccess padrão.
 */
const telasLinha = [...TELAS_LEADS, "crm.clientes"] as const;
const porTelas = acessoPorTela(telasLinha);

const criarSoNota: Access = ({ req, data }) => {
  if (data?.tipo !== "nota") return false;
  return porTelas({ req, data } as never);
};

export const LinhaDoTempo: CollectionConfig = {
  slug: "linha-do-tempo",
  labels: { singular: "Item da linha do tempo", plural: "Linha do tempo" },
  typescript: { interface: "LinhaDoTempo" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["cliente", "tipo", "titulo", "em"],
    group: "CRM",
  },
  access: { read: porTelas, create: criarSoNota, update: () => false, delete: () => false },
  fields: [
    {
      name: "cliente",
      type: "relationship",
      relationTo: "clientes-crm",
      required: true,
      index: true,
    },
    { name: "lead", type: "relationship", relationTo: "leads", index: true },
    { name: "tipo", type: "select", options: TIPOS_LINHA_DO_TEMPO, required: true, index: true },
    { name: "titulo", type: "text", required: true },
    { name: "detalhe", type: "textarea" },
    {
      name: "referencia",
      type: "group",
      fields: [
        { name: "colecao", type: "text" },
        { name: "id", type: "text" },
      ],
    },
    { name: "usuario", type: "relationship", relationTo: "users" },
    {
      name: "em",
      type: "date",
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
};
