import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from "payload";

import {
  ESTAGIO_OPORTUNIDADE,
  ORIGENS_CRM,
  SITUACAO_OPORTUNIDADE,
  STATUS_OPORTUNIDADE,
  UFS,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { calcularStatusLegadoEspelhado } from "../lib/crm/espelhoStatusLegado";
import { ErroGateQualificada, erroDoGateQualificada } from "../lib/crm/gateQualificada";
import { lerEstagioOuNulo, montarTransicaoEstagio } from "../lib/crm/historicoEstagio";

/**
 * Gate do estágio "Qualificada" (Sessão H3 · docs/17 · Manual NTC-COM-CRM-01
 * §18): só libera a transição PARA "qualificada" quando a avaliação COM-04
 * vigente da oportunidade cumpre as 10 condições do manual. Roda ANTES de
 * `espelharStatusLegado` na lista de `beforeChange` — se o gate recusar
 * (lançando `ErroGateQualificada`), a escrita inteira aborta, então não pode
 * sobrar um espelho `status` gravado para um estágio que nunca foi aceito.
 *
 * A condição só age quando o estágio MUDA para "qualificada": edições que
 * mantêm "qualificada" (ex.: trocar o responsável) não re-exigem o gate. Na
 * criação, `originalDoc` não existe — `originalDoc?.estagio` fica
 * `undefined`, que já é `!== "qualificada"` — então uma oportunidade criada
 * DIRETO como "Qualificada" também passa pelo gate. Nesse caso não há ainda
 * um id de oportunidade (o registro não foi inserido): a consulta é pulada e
 * o bloqueio é imediato com a mesma mensagem do §18, porque é logicamente
 * impossível existir uma avaliação vigente para uma oportunidade que ainda
 * não existe.
 */
const bloquearQualificadaSemAvaliacao: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (originalDoc?.estagio === "qualificada" || data.estagio !== "qualificada") return data;
  const oportunidadeId: number | string | undefined = originalDoc?.id ?? data.id;
  const mensagem =
    oportunidadeId === undefined
      ? "Estágio Qualificada bloqueado: não há avaliação vigente."
      : await erroDoGateQualificada(req.payload, oportunidadeId, req);
  if (mensagem !== null) throw new ErroGateQualificada(mensagem);
  return data;
};

/**
 * Mantém o campo `status` legado preenchido a partir de estágio+situação como
 * espelho automatizado. O Dashboard e os gráficos já foram migrados para ler
 * `estagio` e `situacao` — o campo `status` é preservado apenas porque ainda
 * existe na coleção e pode ser lido por consumidores externos e pela base de
 * dados já gravada.
 *
 * Invólucro fino: a regra fica em `calcularStatusLegadoEspelhado` (pura,
 * testada), que já lê `originalDoc` como fallback para atualizações parciais
 * que só enviam um dos dois campos.
 */
const espelharStatusLegado: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = calcularStatusLegadoEspelhado(data, originalDoc);
  if (status === null) return data;
  return { ...data, status };
};

/** Grava a transição no histórico append-only sempre que o estágio muda. */
const registrarTransicaoEstagio: CollectionAfterChangeHook = async ({ context, doc, previousDoc, req }) => {
  // O script de migração (Sessão H1, Task 6) grava a própria linha de histórico,
  // com motivo e ator de sistema; sem esta saída o registro sairia duplicado.
  if (context?.migracaoP0 === true) return doc;
  const transicao = montarTransicaoEstagio({
    oportunidadeId: doc.id,
    anterior: lerEstagioOuNulo(previousDoc?.estagio),
    novo: lerEstagioOuNulo(doc.estagio),
    usuarioId: req.user?.collection === "users" ? req.user.id : null,
  });
  if (transicao === null) return doc;
  // `req` vai junto para a escrita entrar na mesma transação do Payload.
  await req.payload.create({ collection: "historico-estagio", data: transicao, req });
  return doc;
};

/**
 * Oportunidades — funil comercial (spec 2026-07-15 §Modelagem).
 * Catálogo único: aponta para as coleções editoriais programas/modulos/eventos.
 * Pipeline ponderado (valor × probabilidade) é derivado na tela, não persistido.
 */
export const Oportunidades: CollectionConfig = {
  slug: "oportunidades",
  labels: { singular: "Oportunidade", plural: "Oportunidades" },
  typescript: { interface: "Oportunidade" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valor", "probabilidade", "status"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [bloquearQualificadaSemAvaliacao, espelharStatusLegado],
    afterChange: [registrarTransicaoEstagio],
  },
  fields: [
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    // Os cinco campos abaixo (programa, uf, origem, dataAbertura, responsavel)
    // são obrigatórios por decisão do PO: é o que o Manual Operacional
    // NTC-COM-CRM-01 já documenta como mínimo de uma oportunidade registrada.
    // A regra é reforçada na camada de escrita do painel (painelCrmEscrita.ts),
    // que falha fechado antes de tocar a Local API.
    { name: "programa", type: "relationship", relationTo: "programas", required: true },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "uf", type: "select", options: UFS, required: true },
    { name: "origem", type: "select", options: ORIGENS_CRM, required: true },
    {
      name: "quantidade",
      type: "number",
      min: 0,
      admin: { description: "Quantidade estimada de participantes." },
    },
    { name: "modalidade", type: "text" },
    { name: "valor", type: "number", min: 0, admin: { description: "Valor estimado (R$)." } },
    { name: "probabilidade", type: "number", min: 0, max: 100 },
    {
      name: "status",
      type: "select",
      options: STATUS_OPORTUNIDADE,
      defaultValue: "em-qualificacao",
      admin: {
        description:
          "Campo legado, preenchido automaticamente a partir de Estágio e Situação. Não editar: será removido depois da Sessão H7.",
        readOnly: true,
      },
    },
    {
      name: "estagio",
      type: "select",
      options: ESTAGIO_OPORTUNIDADE,
      required: true,
      defaultValue: "mapeada",
      admin: { description: "Posição no funil comercial (manual NTC-COM-CRM-01 §11)." },
    },
    {
      name: "situacao",
      type: "select",
      options: SITUACAO_OPORTUNIDADE,
      required: true,
      defaultValue: "ativa",
      admin: { description: "Condição da oportunidade — independente do estágio (§12)." },
    },
    {
      name: "migracaoPendenteRevisao",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Estágio atribuído pela migração automática e ainda não confirmado pela Direção. Enquanto marcado, o estágio é provisório e não é verdade histórica.",
      },
    },
    {
      name: "migracaoFlag",
      type: "text",
      admin: {
        readOnly: true,
        description: "O que a Direção precisa confirmar nesta oportunidade migrada.",
      },
    },
    { name: "dataAbertura", type: "date", required: true },
    { name: "dataPrevFechamento", type: "date" },
    { name: "proximaAcao", type: "text" },
    { name: "followup", type: "date", admin: { description: "Data do próximo follow-up." } },
    { name: "responsavel", type: "relationship", relationTo: "users", required: true },
    { name: "observacoes", type: "textarea" },
  ],
};
