import type { CollectionConfig } from "payload";

import { LISTAS_FIN } from "@ntc/lib";

import { bloquearFinEventoComLancamentos } from "../../lib/financeiro/exclusao";

import {
  acessoFin,
  data,
  hooksAuditoriaFin,
  inteiro,
  lista,
  naoNegativo,
  texto,
  textoLongo,
} from "./campos";

/**
 * Cadastro financeiro do evento (spec §3.2). Ligado opcionalmente — e no
 * máximo uma vez — a um evento comercial do CRM; sem ligação, é evento
 * próprio do financeiro. Para o evento ligado, título/datas/modalidade/local/
 * cliente vêm do CRM na leitura (Task 9) e aqui ficam só como reserva.
 * `refCrm`, `origem`, `cadastroPendente` e `canceladoNoCrm` não são gravados.
 */
export const FinEventos: CollectionConfig = {
  slug: "fin-eventos",
  labels: { singular: "Evento financeiro", plural: "Eventos financeiros" },
  typescript: { interface: "FinEvento" },
  admin: { useAsTitle: "nome", group: "Financeiro" },
  access: acessoFin(["fin.eventos"]),
  hooks: { ...hooksAuditoriaFin, beforeDelete: [bloquearFinEventoComLancamentos] },
  fields: [
    {
      name: "eventoComercial",
      type: "relationship",
      relationTo: "eventos-comerciais",
      unique: true,
      index: true,
    },
    texto("nome"),
    lista("vertical", LISTAS_FIN.verticais),
    lista("tipo", LISTAS_FIN.tiposOperacao),
    lista("modalidade", LISTAS_FIN.modalidades),
    texto("programa"),
    texto("modulo"),
    texto("cliente"),
    texto("cidade"),
    lista("uf", LISTAS_FIN.ufs),
    texto("local"),
    data("dataInicio"),
    data("dataFim"),
    naoNegativo("cargaHoraria"),
    texto("responsavel"),
    lista("status", LISTAS_FIN.statusOperacional),
    inteiro("qtdPrevista"),
    inteiro("capacidade"),
    inteiro("efetivos"),
    inteiro("pagantesPrev"),
    inteiro("cortesiasPrev"),
    texto("refContratual"),
    textoLongo("observacoes"),
  ],
};
