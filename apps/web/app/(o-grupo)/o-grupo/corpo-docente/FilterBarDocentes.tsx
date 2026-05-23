"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AREA_LABELS,
  ATUACAO_OPTIONS,
  CONTADORES,
  FORMACAO_OPTIONS,
  NOTAS,
  PERPAGE_OPTIONS,
  PROGRAMAS_OPTIONS,
  SORT_OPTIONS,
  TAB_LABELS,
  TIPO_LABELS,
} from "./conteudoCorpoDocente";
import type {
  CardAxis,
  CardExpert,
  CardFeatured,
  TabId,
  Tipo,
} from "./conteudoCorpoDocente";
import { useCorpoDocenteCtx } from "./CorpoDocenteContext";

/* ============================================================
   TIPOS
   ============================================================ */

type SortMode = "editorial" | "alfa" | "alfa-desc" | "programa" | "area";

interface FiltersState {
  tab: TabId;
  search: string;
  area: string;
  tipo: Tipo | "";
  programa: string;
  formacao: string;
  atuacao: string;
  sort: SortMode;
  page: number;
  perpage: number;
}

interface CardLike {
  vertical: "educacao" | "gestao-publica" | "saude";
  area: string;
  tipo: Tipo;
  frente: "" | "contratacoes";
  programas: string;
  formacao: string;
  atuacao: string;
  nome: string;
  cmsLink: string;
  searchHaystack: string;
  kind: "expert" | "axis";
  original: CardExpert | CardAxis;
}

interface FilterBarDocentesProps {
  featured: CardFeatured[];
  experts: CardExpert[];
  axisSaude: CardAxis[];
}

/* ============================================================
   HELPERS
   ============================================================ */

const DEFAULT_FILTERS: FiltersState = {
  tab: "todos",
  search: "",
  area: "",
  tipo: "",
  programa: "",
  formacao: "",
  atuacao: "",
  sort: "editorial",
  page: 1,
  perpage: 24,
};

const TIPO_ORDER: Record<string, number> = {
  autoridade: 0,
  palestrante: 1,
  doutrinador: 2,
  consultor: 3,
  pesquisador: 4,
};

function toCardLike(c: CardExpert | CardAxis, kind: "expert" | "axis"): CardLike {
  return {
    vertical: c.vertical,
    area: c.area,
    tipo: c.tipo,
    frente: c.frente,
    programas: c.programas,
    formacao: c.formacao,
    atuacao: c.atuacao,
    nome: c.nome,
    cmsLink: c.cmsLink,
    searchHaystack: `${c.nome} ${c.vertical} ${c.area} ${c.programas}`.toLowerCase(),
    kind,
    original: c,
  };
}

function matchTab(c: CardLike, tab: TabId): boolean {
  if (tab === "todos") return true;
  if (tab === "contratacoes") return c.frente === "contratacoes";
  if (tab === "gestao-publica")
    return c.vertical === "gestao-publica" && c.frente !== "contratacoes";
  return c.vertical === tab;
}

function applyFilters(cards: CardLike[], f: FiltersState): CardLike[] {
  const q = f.search.trim().toLowerCase();
  return cards.filter((c) => {
    if (!matchTab(c, f.tab)) return false;
    if (f.area && c.area !== f.area) return false;
    if (f.tipo && c.tipo !== f.tipo) return false;
    if (f.programa) {
      const list = c.programas.split(",").map((s) => s.trim());
      if (!list.includes(f.programa)) return false;
    }
    if (f.formacao && c.formacao !== f.formacao) return false;
    if (f.atuacao) {
      const list = c.atuacao.split(",").map((s) => s.trim());
      if (!list.includes(f.atuacao)) return false;
    }
    if (q && c.searchHaystack.indexOf(q) === -1) return false;
    return true;
  });
}

function sortCards(cards: CardLike[], sort: SortMode): CardLike[] {
  const arr = cards.slice();
  if (sort === "editorial") {
    arr.sort((a, b) => {
      const ta = TIPO_ORDER[a.tipo] ?? 9;
      const tb = TIPO_ORDER[b.tipo] ?? 9;
      if (ta !== tb) return ta - tb;
      return a.nome.localeCompare(b.nome);
    });
  } else if (sort === "alfa") {
    arr.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (sort === "alfa-desc") {
    arr.sort((a, b) => b.nome.localeCompare(a.nome));
  } else if (sort === "programa") {
    arr.sort((a, b) => {
      const pa = (a.programas.split(",")[0] ?? "").trim();
      const pb = (b.programas.split(",")[0] ?? "").trim();
      return pa.localeCompare(pb);
    });
  } else if (sort === "area") {
    arr.sort((a, b) =>
      (AREA_LABELS[a.area] ?? "").localeCompare(AREA_LABELS[b.area] ?? "")
    );
  }
  return arr;
}

function paginate(
  cards: CardLike[],
  page: number,
  perpage: number
): { visible: CardLike[]; total: number; totalPages: number; currentPage: number } {
  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / perpage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perpage;
  return { visible: cards.slice(start, start + perpage), total, totalPages, currentPage };
}

function computeTabCounts(
  all: CardLike[],
  f: FiltersState
): Record<TabId, number> {
  const fNoTab: FiltersState = { ...f, tab: "todos" };
  const base = applyFilters(all, fNoTab);
  const counts: Record<TabId, number> = {
    todos: base.length,
    educacao: 0,
    "gestao-publica": 0,
    contratacoes: 0,
    saude: 0,
  };
  base.forEach((c) => {
    if (c.frente === "contratacoes") counts.contratacoes++;
    else if (c.vertical === "gestao-publica") counts["gestao-publica"]++;
    else if (c.vertical === "educacao") counts.educacao++;
    else if (c.vertical === "saude") counts.saude++;
  });
  return counts;
}

function compactRange(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (cur > 3) out.push("…");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) out.push(p);
  if (cur < total - 2) out.push("…");
  out.push(total);
  return out;
}

interface Chip {
  key: keyof FiltersState | "search";
  label: string;
  vertClass?: string;
}

function buildChips(f: FiltersState): Chip[] {
  const chips: Chip[] = [];
  if (f.tab !== "todos") {
    const label =
      f.tab === "contratacoes"
        ? "Contratações Públicas · Frente NTC GP"
        : TAB_LABELS[f.tab];
    const vertClass =
      f.tab === "educacao"
        ? "chip-vert-edu"
        : f.tab === "gestao-publica"
        ? "chip-vert-gov"
        : f.tab === "contratacoes"
        ? "chip-vert-cpr"
        : "chip-vert-sau";
    chips.push({ key: "tab", label, vertClass });
  }
  if (f.area) chips.push({ key: "area", label: `Área: ${AREA_LABELS[f.area] ?? f.area}` });
  if (f.tipo) chips.push({ key: "tipo", label: `Vínculo: ${TIPO_LABELS[f.tipo] ?? f.tipo}` });
  if (f.programa) chips.push({ key: "programa", label: `Programa: ${f.programa}` });
  if (f.formacao) chips.push({ key: "formacao", label: `Formação: ${f.formacao}` });
  if (f.atuacao) chips.push({ key: "atuacao", label: `Atuação: ${f.atuacao}` });
  if (f.search) chips.push({ key: "search", label: `Busca: "${f.search}"` });
  return chips;
}

function readFiltersFromURL(): FiltersState {
  if (typeof window === "undefined") return { ...DEFAULT_FILTERS };
  const p = new URLSearchParams(window.location.search);
  const get = (k: string, def = "") => p.get(k) ?? def;
  return {
    tab: (get("tab", "todos") as TabId) || "todos",
    search: get("q"),
    area: get("area"),
    tipo: (get("tipo") as Tipo | "") || "",
    programa: get("programa"),
    formacao: get("formacao"),
    atuacao: get("atuacao"),
    sort: (get("sort", "editorial") as SortMode) || "editorial",
    page: parseInt(get("page", "1"), 10) || 1,
    perpage: parseInt(get("perpage", "24"), 10) || 24,
  };
}

function writeFiltersToURL(f: FiltersState): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (f.tab !== "todos") p.set("tab", f.tab);
  if (f.search) p.set("q", f.search);
  if (f.area) p.set("area", f.area);
  if (f.tipo) p.set("tipo", f.tipo);
  if (f.programa) p.set("programa", f.programa);
  if (f.formacao) p.set("formacao", f.formacao);
  if (f.atuacao) p.set("atuacao", f.atuacao);
  if (f.sort !== "editorial") p.set("sort", f.sort);
  if (f.perpage !== 24) p.set("perpage", String(f.perpage));
  if (f.page !== 1) p.set("page", String(f.page));
  const qs = p.toString();
  const newUrl = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
  window.history.replaceState(null, "", newUrl);
}

/* ============================================================
   Reservas para Task 10 (JSX) — evitam erros de noUnusedLocals
   enquanto o componente ainda não renderiza nada de fato.
   ============================================================ */
void useCallback;
void useEffect;
void useMemo;
void useState;
void useCorpoDocenteCtx;
void ATUACAO_OPTIONS;
void CONTADORES;
void FORMACAO_OPTIONS;
void NOTAS;
void PERPAGE_OPTIONS;
void PROGRAMAS_OPTIONS;
void SORT_OPTIONS;
void toCardLike;
void applyFilters;
void sortCards;
void paginate;
void computeTabCounts;
void compactRange;
void buildChips;
void readFiltersFromURL;
void writeFiltersToURL;

/* ============================================================
   COMPONENT (JSX vem na Task 10)
   ============================================================ */

export function FilterBarDocentes(_props: FilterBarDocentesProps) {
  void _props;
  return null;
}
