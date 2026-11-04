import type { CollectionConfig } from "payload";

/**
 * Aparelhos inscritos para receber o aviso de lead novo (PWA Painel NTC,
 * spec 2026-10-30). Um registro por aparelho: o `endpoint` do navegador é
 * único e as chaves `p256dh`/`auth` são credenciais de envio, por isso nenhuma
 * operação é aberta pela REST — nem para administrador. Leitura e escrita
 * acontecem só pela Local API com `overrideAccess`, a partir das Server
 * Actions e do envio do aviso.
 */
export const InscricoesAviso: CollectionConfig = {
  slug: "inscricoes-aviso",
  labels: { singular: "Inscrição de aviso", plural: "Inscrições de aviso" },
  admin: {
    useAsTitle: "aparelho",
    defaultColumns: ["usuario", "aparelho", "createdAt"],
    group: "Sistema",
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "usuario", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "endpoint", type: "text", required: true, unique: true },
    { name: "p256dh", type: "text", required: true },
    { name: "auth", type: "text", required: true },
    {
      name: "aparelho",
      type: "text",
      admin: { description: "User-agent resumido, só para identificar o aparelho." },
    },
  ],
};
