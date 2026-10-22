import type { CollectionConfig } from "payload";

import { administrador, administradorField, proprioOuAdministrador } from "../access/porTela";
import { recusarLoginForaDoPainel } from "../lib/cms/loginSoPeloPainel";
import { emailRecuperacaoHtml } from "../lib/emailsCms";
import { TELAS } from "../lib/cms/telas";

/**
 * Coleção Users — auth nativa do Payload, com permissões por tela
 * (`administrador` + `telas`, escolhidas por pessoa; DAB §10.1).
 *
 * Apenas administradores podem criar/atualizar/deletar outros usuários.
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
    defaultColumns: ["email", "nome", "administrador", "updatedAt"],
    group: "Sistema",
  },
  auth: {
    // Sessões do Painel Admin valem 14 dias. O cookie do
    // login é de sessão por padrão; "Manter sessão iniciada" o
    // persiste pelos 14 dias. Interim até a 2FA da Janela C (CLAUDE.md §17).
    tokenExpiration: 60 * 60 * 24 * 14,
    // Sessões no banco (`users_sessions`, Payload 3.90): o token só vale
    // enquanto a sessão existir, então "Sair" (acoesAuth.sair) a encerra no
    // servidor e um token copiado deixa de valer no logout.
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
  hooks: {
    // Login só pela Local API (painel), que aplica o passkey; a REST/GraphQL
    // nativa entregaria sessão só com a senha.
    beforeLogin: [recusarLoginForaDoPainel],
  },
  access: {
    read: proprioOuAdministrador,
    create: administrador,
    delete: administrador,
    update: proprioOuAdministrador,
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
      // Legado: substituído por `administrador`/`telas`. Some na etapa 2.
      required: false,
      defaultValue: "editor-institucional",
      options: [
        { label: "Super-administrador", value: "super-admin" },
        { label: "Editor institucional", value: "editor-institucional" },
        { label: "Editor de eventos", value: "editor-eventos" },
        { label: "Atendimento comercial", value: "atendimento-comercial" },
      ],
      access: {
        // Legado (campo oculto): só administrador altera.
        update: administradorField,
      },
      admin: {
        hidden: true,
        description:
          "Legado, sem efeito: o acesso agora vem de Administrador e Telas. Removido na etapa 2.",
      },
    },
    {
      name: "administrador",
      label: "Administrador",
      type: "checkbox",
      defaultValue: false,
      access: { create: administradorField, update: administradorField },
      admin: { description: "Acesso total ao painel, inclusive gestão de usuários." },
    },
    {
      name: "telas",
      label: "Telas",
      type: "select",
      hasMany: true,
      options: TELAS.map((t) => ({ label: t.rotulo, value: t.id })),
      access: { create: administradorField, update: administradorField },
      admin: { description: "Telas do painel que esta pessoa pode usar." },
    },
  ],
};
