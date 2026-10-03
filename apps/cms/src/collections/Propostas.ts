import type { CollectionConfig } from "payload";

import { STATUS_PROPOSTA, TIPOS_PROPOSTA } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Propostas comerciais (spec 2026-07-22 · Fase B1). Derivados (valorBruto,
 * desconto, valorLiquido) são gravados pela Server Action a partir dos inputs.
 * Versionamento: codigoBase agrupa versões; codigo é unique por versão.
 */
export const Propostas: CollectionConfig = {
  slug: "propostas",
  labels: { singular: "Proposta", plural: "Propostas" },
  typescript: { interface: "Proposta" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valorLiquido", "status", "versao"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codigoBase", type: "text", required: true, index: true },
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "versao", type: "number", defaultValue: 1 },
    // opcional para o lead poder ser apagado sem cascata (spec §5.6)
    { name: "lead", type: "relationship", relationTo: "leads", index: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "programa", type: "relationship", relationTo: "programas" },
    { name: "tipo", type: "select", options: TIPOS_PROPOSTA },
    { name: "status", type: "select", options: STATUS_PROPOSTA, defaultValue: "rascunho" },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "valorUnitario", type: "number", min: 0 },
    { name: "qtdPagantes", type: "number", min: 0 },
    { name: "cortesias", type: "number", min: 0 },
    { name: "percDesconto", type: "number", min: 0, max: 100 },
    { name: "valorBruto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "desconto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "valorLiquido", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "modalidade", type: "text" },
    { name: "replay", type: "text" },
    { name: "condPagto", type: "text" },
    { name: "condEspecificas", type: "textarea" },
    { name: "observacoes", type: "textarea" },
    { name: "textoApresentacao", type: "richText" },
    { name: "textoContexto", type: "richText" },
    { name: "textoObjetivos", type: "richText" },
    { name: "textoPublicoAlvo", type: "richText" },
    { name: "textoMetodologia", type: "richText" },
    { name: "textoEventon", type: "richText" },
    { name: "textoCertificacaoReplay", type: "richText" },
    { name: "textoCancelamento", type: "richText" },
    { name: "textoProtecaoConteudo", type: "richText" },
    { name: "textoFundamentacaoLegal", type: "richText" },
    { name: "textoProximosPassos", type: "richText" },
    { name: "textoFechamento", type: "richText" },
    {
      name: "eixos",
      type: "array",
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
      ],
    },
    {
      name: "diferenciais",
      type: "array",
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
      ],
    },
    { name: "resultados", type: "array", fields: [{ name: "texto", type: "textarea" }] },
    {
      name: "docentes",
      type: "array",
      admin: { description: "Escolher da coleção preenche nome e credencial; entrada livre é permitida." },
      fields: [
        { name: "especialista", type: "relationship", relationTo: "especialistas" },
        { name: "nome", type: "text" },
        { name: "credencial", type: "textarea" },
        { name: "eixo", type: "text" },
      ],
    },
    {
      name: "modulosDetalhados",
      type: "array",
      fields: [
        { name: "modulo", type: "relationship", relationTo: "modulos" },
        { name: "tituloExibido", type: "text" },
        { name: "ementa", type: "richText" },
      ],
    },
    {
      name: "secoesExtras",
      type: "array",
      admin: { description: "Seções livres do documento (observações, anexos textuais)." },
      fields: [
        { name: "titulo", type: "text" },
        { name: "corpo", type: "richText" },
        {
          name: "posicao",
          type: "select",
          defaultValue: "fim",
          options: [
            { label: "Antes do Quadro Comercial", value: "antes-quadro-comercial" },
            { label: "Depois das Condições Comerciais", value: "apos-condicoes-comerciais" },
            { label: "No fim, antes do Fechamento", value: "fim" },
          ],
        },
      ],
    },
    { name: "elaborador", type: "relationship", relationTo: "users" },
    { name: "aprovador", type: "relationship", relationTo: "users" },
    { name: "validadeDias", type: "number", defaultValue: 30 },
    { name: "dataCriacao", type: "date" },
    { name: "validade", type: "date" },
    { name: "motivoRevisao", type: "text" },
    { name: "substitui", type: "text", admin: { description: "Código da versão substituída." } },
    {
      name: "pdfGerado",
      type: "relationship",
      relationTo: "documentos-comerciais",
      admin: { readOnly: true, description: "Gerado pelo botão 'Gerar PDF' na tela de detalhe." },
    },
  ],
};
