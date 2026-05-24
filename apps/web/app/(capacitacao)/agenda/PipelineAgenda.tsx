"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type AreaSlug,
  type CartaoEvento,
  type CidadeSlug,
  type FormatoEvento,
  type ModalidadeEvento,
  type PerPageOpcao,
  type ProgramaSlug,
  type SortSlug,
  type TabSlug,
  DEFAULTS,
  EMPTY_AGENDA,
  FILTRO_AREA,
  FILTRO_CIDADE,
  FILTRO_FORMATO,
  FILTRO_MES,
  FILTRO_MODALIDADE,
  FILTRO_PROGRAMA_GROUPS,
  FILTRO_SORT,
  LABELS,
  PERPAGE_OPCOES,
  TABS_AGENDA,
} from "./conteudoAgenda";

// =============================================================
//  PipelineAgenda · client component
//  Espelho do IIFE "AGENDA v2" do protótipo (linhas 3241-3845
//  de 09_Pagina_Agenda_v2.html). Estado React + render React,
//  sem mutação direta do DOM.
// =============================================================

interface PipelineAgendaProps {
  eventos: CartaoEvento[];
}

interface EstadoAgenda {
  tab: TabSlug;
  area: "" | AreaSlug;
  programa: "" | ProgramaSlug;
  formato: "" | FormatoEvento;
  modalidade: "" | ModalidadeEvento;
  cidade: CidadeSlug;
  mes: string;
  busca: string;
  sort: SortSlug;
  page: number;
  perPage: PerPageOpcao;
}

const ESTADO_INICIAL: EstadoAgenda = {
  tab: DEFAULTS.tab,
  area: "",
  programa: "",
  formato: "",
  modalidade: "",
  cidade: "",
  mes: "",
  busca: "",
  sort: DEFAULTS.sort,
  page: DEFAULTS.page,
  perPage: DEFAULTS.perPage,
};

// ----------------- Helpers puros (pipeline) -----------------

const score = (e: CartaoEvento, flag: string): number =>
  e.flags.includes(flag as never) ? 1 : 0;

function filterByTab(eventos: CartaoEvento[], tab: TabSlug): CartaoEvento[] {
  return eventos.filter((e) => e.tab === tab);
}

function filterByControls(eventos: CartaoEvento[], state: EstadoAgenda): CartaoEvento[] {
  return eventos.filter(
    (e) =>
      (!state.area || e.area === state.area) &&
      (!state.programa || e.programa === state.programa) &&
      (!state.formato || e.formato === state.formato) &&
      (!state.modalidade || e.modalidade === state.modalidade) &&
      (!state.cidade || e.cidade === state.cidade) &&
      (!state.mes || e.mes === state.mes),
  );
}

function filterBySearch(eventos: CartaoEvento[], busca: string): CartaoEvento[] {
  const q = busca.toLowerCase().trim();
  if (!q) return eventos;
  return eventos.filter((e) => {
    const hay = [
      e.tituloHtml,
      e.formatoLabel,
      e.areaLabel,
      e.programa,
      e.area,
      e.formato,
      e.cidade,
      e.modalidade,
      e.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function sortCards(eventos: CartaoEvento[], sort: SortSlug): CartaoEvento[] {
  const arr = eventos.slice();
  if (sort === "editorial") {
    arr.sort((a, b) => {
      const fixA = score(a, "fixado_na_agenda");
      const fixB = score(b, "fixado_na_agenda");
      if (fixA !== fixB) return fixB - fixA;
      const prA = score(a, "destaque_editorial") * 2 + score(a, "prioridade_comercial");
      const prB = score(b, "destaque_editorial") * 2 + score(b, "prioridade_comercial");
      if (prA !== prB) return prB - prA;
      return a.dataIso.localeCompare(b.dataIso);
    });
  } else if (sort === "cronologica") {
    arr.sort((a, b) => a.dataIso.localeCompare(b.dataIso));
  } else if (sort === "encerramento") {
    arr.sort((a, b) => (a.deadlineIso || a.dataIso).localeCompare(b.deadlineIso || b.dataIso));
  } else if (sort === "ch") {
    arr.sort((a, b) => b.cargaHorariaHoras - a.cargaHorariaHoras);
  } else if (sort === "valor-asc") {
    arr.sort((a, b) => a.valorReais - b.valorReais);
  } else if (sort === "valor-desc") {
    arr.sort((a, b) => b.valorReais - a.valorReais);
  }
  return arr;
}

function paginate(
  eventos: CartaoEvento[],
  page: number,
  perPage: PerPageOpcao,
): { visiveis: CartaoEvento[]; total: number; totalPages: number; pageEfetiva: number } {
  const total = eventos.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageEfetiva = page > totalPages ? 1 : page;
  const start = (pageEfetiva - 1) * perPage;
  const end = start + perPage;
  return { visiveis: eventos.slice(start, end), total, totalPages, pageEfetiva };
}

function compactRange(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (cur > 3) out.push("…");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) out.push(i);
  if (cur < total - 2) out.push("…");
  out.push(total);
  return out;
}

// ----------------- Deadline (espelha applyDeadlineSeal) -----------------

interface DeadlineInfo {
  diffDays: number;
  expired: boolean;
}

function computeDeadline(deadlineIso: string, now: Date): DeadlineInfo | null {
  if (!deadlineIso) return null;
  const deadline = new Date(`${deadlineIso}T23:59:59Z`);
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  return { diffDays, expired: diffMs <= 0 };
}

// ----------------- Analytics (no-op por enquanto) -----------------

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

export function PipelineAgenda({ eventos }: PipelineAgendaProps) {
  // Stub mínimo para o arquivo compilar; o markup completo entra no Task 10.
  void eventos;
  return null;
}

// Reservas para Tasks 10-12 (markup, URL sync, paginação UI). Mantém os
// símbolos consumidos para satisfazer tsconfig `noUnusedLocals: true`.
/* eslint-disable @typescript-eslint/no-unused-vars */
void filterByTab;
void filterByControls;
void filterBySearch;
void sortCards;
void paginate;
void compactRange;
void computeDeadline;
void track;
void ESTADO_INICIAL;
void LABELS;
void FILTRO_AREA;
void FILTRO_PROGRAMA_GROUPS;
void FILTRO_FORMATO;
void FILTRO_MODALIDADE;
void FILTRO_CIDADE;
void FILTRO_MES;
void FILTRO_SORT;
void PERPAGE_OPCOES;
void TABS_AGENDA;
void EMPTY_AGENDA;
void useCallback;
void useEffect;
void useMemo;
void useRef;
void useState;
/* eslint-enable @typescript-eslint/no-unused-vars */
