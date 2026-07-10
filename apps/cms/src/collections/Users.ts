import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import { superAdmin, superAdminField } from "../access/superAdmin";
import { emailRecuperacaoHtml } from "../lib/emailsCms";

/**
 * Coleção Users — auth nativa do Payload, com perfis administrativos
 * conforme DAB §10.1.
 *
 * Apenas super-admins podem criar/atualizar/deletar outros usuários.
 * Demais autenticados podem ler (para fins de exibição de "criado por",
 * dropdowns de responsável em Leads etc.) e atualizar o próprio
 * registro (alteração de senha, e-mail).
 *
 * 2FA (TOTP) é pendência da Janela C — CLAUDE.md §17. Até lá, a única
 * defesa de credenciais é senha forte + JWT do Payload com expiração.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuário", plural: "Usuários" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "nome", "perfil", "updatedAt"],
    group: "Sistema",
  },
  auth: {
    // Sessões do Painel Admin valem 14 dias. O cookie do
    // login é de sessão por padrão; "Manter sessão iniciada" o
    // persiste pelos 14 dias. Interim até a 2FA da Janela C (CLAUDE.md §17).
    tokenExpiration: 60 * 60 * 24 * 14,
    forgotPassword: {
      // 24h — validade única da coleção cobre o reset e o convite de
      // boas-vindas (spec 2026-07-10 §3).
      expiration: 1000 * 60 * 60 * 24,
      generateEmailSubject: () => "Redefinição de senha — Painel Admin NTC",
      generateEmailHTML: (args) =>
        emailRecuperacaoHtml({
          nome: (args?.user as { nome?: string } | undefined)?.nome ?? "",
          token: args?.token ?? "",
        }),
    },
  },
  access: {
    read: authenticated,
    create: superAdmin,
    delete: superAdmin,
    update: ({ req, id }) => {
      if (!req.user) return false;
      if (req.user.collection !== "users") return false;
      // super-admin atualiza qualquer um; demais perfis só atualizam o próprio registro.
      if ((req.user as { perfil?: string }).perfil === "super-admin") return true;
      return req.user.id === id;
    },
  },
  fields: [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      required: true,
      admin: {
        description: "Nome completo do usuário (aparece em logs e em atribuições de Lead).",
      },
    },
    {
      name: "perfil",
      label: "Perfil administrativo",
      type: "select",
      required: true,
      defaultValue: "editor-institucional",
      options: [
        { label: "Super-administrador", value: "super-admin" },
        { label: "Editor institucional", value: "editor-institucional" },
        { label: "Editor de eventos", value: "editor-eventos" },
        { label: "Atendimento comercial", value: "atendimento-comercial" },
      ],
      access: {
        // Apenas super-admin pode alterar o próprio perfil ou o de outros.
        update: superAdminField,
      },
      admin: {
        description:
          "Define o escopo de acesso ao admin (DAB §10.1). Apenas super-administradores podem alterar.",
      },
    },
  ],
};
