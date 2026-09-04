import type { CollectionConfig } from "payload";

/**
 * Credenciais WebAuthn (passkeys) — 2º fator opcional do login do painel
 * (spec 2026-09-02, substitui o plano de 2FA via TOTP de CLAUDE.md §17.8).
 * Um usuário pode ter várias (um por dispositivo). Leitura/remoção: dono
 * OU super-admin (a tela Usuários permite ao super-admin remover o passkey
 * de qualquer usuário — caso de dispositivo perdido). Escrita real
 * acontece só via Local API com overrideAccess, a partir das Server
 * Actions de apps/cms/src/app/(painel)/acoesAuth.ts e acoes.ts — os
 * campos create/update ficam fechados aqui como defesa em profundidade,
 * não como o único controle.
 */
export const Passkeys: CollectionConfig = {
  slug: "passkeys",
  labels: { singular: "Passkey", plural: "Passkeys" },
  admin: {
    useAsTitle: "apelido",
    defaultColumns: ["usuario", "apelido", "ultimoUsoEm"],
    group: "Sistema",
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as { perfil?: string }).perfil === "super-admin") return true;
      return { usuario: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as { perfil?: string }).perfil === "super-admin") return true;
      return { usuario: { equals: req.user.id } };
    },
    create: () => false,
    update: () => false,
  },
  fields: [
    { name: "usuario", type: "relationship", relationTo: "users", required: true },
    {
      name: "apelido",
      type: "text",
      required: true,
      admin: { description: 'Nome livre pra identificar o dispositivo — ex.: "MacBook do Jotta".' },
    },
    { name: "credentialId", type: "text", required: true, unique: true },
    { name: "publicKey", type: "text", required: true },
    { name: "counter", type: "number", required: true, defaultValue: 0 },
    { name: "transports", type: "text", hasMany: true },
    { name: "ultimoUsoEm", type: "date" },
  ],
};
