import { acessoPorTela, administrador } from "../access/porTela";
import type { CollectionConfig } from "payload";

/** Trilha de versionamento de propostas (spec 2026-07-22 · Fase B1). */
export const VersoesProposta: CollectionConfig = {
  slug: "versoes",
  labels: { singular: "Versão", plural: "Versões" },
  typescript: { interface: "VersaoProposta" },
  admin: {
    useAsTitle: "codBase",
    defaultColumns: ["codBase", "nVersao", "data", "vigente"],
    group: "CRM",
  },
  access: {
    read: acessoPorTela(["crm.propostas"]),
    create: acessoPorTela(["crm.propostas"]),
    update: acessoPorTela(["crm.propostas"]),
    delete: administrador,
  },
  fields: [
    { name: "codBase", type: "text", required: true, index: true },
    { name: "nVersao", type: "number" },
    { name: "proposta", type: "relationship", relationTo: "propostas" },
    { name: "data", type: "date" },
    { name: "substitui", type: "text" },
    { name: "motivo", type: "text" },
    { name: "sintese", type: "text" },
    { name: "statusAnterior", type: "text" },
    { name: "vigente", type: "checkbox", defaultValue: true },
  ],
};
