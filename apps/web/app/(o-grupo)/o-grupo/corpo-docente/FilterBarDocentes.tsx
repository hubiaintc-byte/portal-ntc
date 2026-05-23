"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

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
   COMPONENT
   ============================================================ */

export function FilterBarDocentes({
  featured,
  experts,
  axisSaude,
}: FilterBarDocentesProps) {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ctx = useCorpoDocenteCtx();

  const allCards: CardLike[] = useMemo(
    () => [
      ...experts.map((c) => toCardLike(c, "expert")),
      ...axisSaude.map((c) => toCardLike(c, "axis")),
    ],
    [experts, axisSaude]
  );

  const filtered = useMemo(() => applyFilters(allCards, filters), [allCards, filters]);
  const sorted = useMemo(() => sortCards(filtered, filters.sort), [filtered, filters.sort]);
  const { visible, total, totalPages, currentPage } = useMemo(
    () => paginate(sorted, filters.page, filters.perpage),
    [sorted, filters.page, filters.perpage]
  );
  const tabCounts = useMemo(() => computeTabCounts(allCards, filters), [allCards, filters]);
  const chips = useMemo(() => buildChips(filters), [filters]);

  // Hidratação inicial via URL + popstate
  useEffect(() => {
    const initial = readFiltersFromURL();
    setFilters(initial);
    setSearchInput(initial.search);
    if (
      initial.programa ||
      initial.formacao ||
      initial.atuacao ||
      initial.sort !== "editorial"
    ) {
      setAdvancedOpen(true);
    }
    setHydrated(true);

    const onPop = () => {
      const next = readFiltersFromURL();
      setFilters(next);
      setSearchInput(next.search);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // URL-sync (depois da hidratação)
  useEffect(() => {
    if (!hydrated) return;
    writeFiltersToURL(filters);
  }, [filters, hydrated]);

  // Hero quicklinks: observar tabRequest do context
  useEffect(() => {
    if (!ctx.tabRequest) return;
    setFilters((prev) => ({ ...prev, tab: ctx.tabRequest!.id, page: 1 }));
    const el = document.getElementById("especialistas");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 148;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [ctx.tabRequest]);

  // Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchInput.trim()
          ? prev
          : { ...prev, search: searchInput.trim(), page: 1 }
      );
    }, 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Handlers
  const setTab = useCallback((tab: TabId) => {
    setFilters((prev) => ({ ...prev, tab, page: 1 }));
  }, []);

  const setField = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const removeChip = useCallback((chip: Chip) => {
    if (chip.key === "tab") setFilters((p) => ({ ...p, tab: "todos", page: 1 }));
    else if (chip.key === "search") {
      setSearchInput("");
      setFilters((p) => ({ ...p, search: "", page: 1 }));
    } else {
      setFilters((p) => ({ ...p, [chip.key]: "", page: 1 }));
    }
  }, []);

  const clearAll = useCallback(() => {
    setSearchInput("");
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    requestAnimationFrame(() => {
      const el = document.getElementById("especialistas");
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 148;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  }, []);

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentTab: TabId) => {
    const order = ["todos", "educacao", "gestao-publica", "contratacoes", "saude"] as const;
    const idx = order.indexOf(currentTab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setTab(order[(idx + 1) % order.length]!);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setTab(order[(idx - 1 + order.length) % order.length]!);
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab(order[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setTab(order[order.length - 1]!);
    }
  };

  const activeFilterCount = chips.length;

  return (
    <>
      {/* ===== FILTERBAR ===== */}
      <div
        className={`docentes-filterbar ${mobileOpen ? "is-open" : ""}`}
        id="docentes-filterbar"
        aria-label="Filtros do corpo docente"
      >
        <button
          type="button"
          className="docentes-mobile-filter-toggle"
          id="btn-mobile-filter-toggle"
          aria-expanded={mobileOpen}
          aria-controls="docentes-filters-inner"
          onClick={() => setMobileOpen((v) => !v)}
        >
          Filtros{" "}
          {activeFilterCount > 0 ? (
            <span id="mft-active-count">{activeFilterCount}</span>
          ) : null}
        </button>

        <div className="container docentes-filterbar-inner" id="docentes-filters-inner">
          <nav className="docentes-tabs-inner" role="tablist" aria-label="Área estratégica">
            {(["todos", "educacao", "gestao-publica", "contratacoes", "saude"] as TabId[]).map(
              (tab) => {
                const isActive = filters.tab === tab;
                const count = tabCounts[tab];
                const disabled = count === 0 && !isActive;
                return (
                  <button
                    key={tab}
                    type="button"
                    className={`docentes-tab ${isActive ? "is-active" : ""}`}
                    data-tab={tab}
                    role="tab"
                    aria-selected={isActive}
                    disabled={disabled}
                    onClick={() => setTab(tab)}
                    onKeyDown={(e) => onTabKeyDown(e, tab)}
                  >
                    <span className="tab-row">
                      {TAB_LABELS[tab]} <span className="tab-count">{count}</span>
                    </span>
                    {tab === "contratacoes" ? (
                      <span className="tab-microcopy">
                        Frente especializada da NTC Gestão Pública
                      </span>
                    ) : null}
                  </button>
                );
              }
            )}
          </nav>

          <div className="docentes-filters-row is-primary">
            <label className="docentes-search" aria-label="Buscar especialista">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l5 5" />
              </svg>
              <input
                id="filter-search"
                type="search"
                placeholder="Buscar por eixo, programa, credencial ou área de atuação"
                autoComplete="off"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput ? (
                <button
                  type="button"
                  id="btn-clear-search"
                  aria-label="Limpar busca"
                  onClick={() => setSearchInput("")}
                >
                  ×
                </button>
              ) : null}
            </label>

            <label className="docentes-filter">
              Área formativa
              <select
                id="filter-area"
                aria-label="Filtrar por área formativa"
                value={filters.area}
                onChange={(e) => setField("area", e.target.value)}
              >
                <option value="">Todas as áreas</option>
                {Object.entries(AREA_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Vínculo
              <select
                id="filter-tipo"
                aria-label="Filtrar por vínculo"
                value={filters.tipo}
                onChange={(e) => setField("tipo", e.target.value as Tipo | "")}
              >
                <option value="">Todos os vínculos</option>
                {(Object.entries(TIPO_LABELS) as [Tipo, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="docentes-advanced-toggle"
              id="btn-toggle-advanced"
              aria-expanded={advancedOpen}
              aria-controls="filters-advanced"
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              {advancedOpen ? "Filtros avançados ▴" : "Filtros avançados ▾"}
            </button>

            <button
              type="button"
              id="btn-clear-filters"
              className={`docentes-filter-clear ${activeFilterCount === 0 ? "is-hidden" : ""}`}
              onClick={clearAll}
            >
              Limpar filtros ×
            </button>
          </div>

          <div
            className={`docentes-filters-row is-advanced ${advancedOpen ? "is-open" : ""}`}
            id="filters-advanced"
            aria-label="Filtros avançados"
          >
            <label className="docentes-filter">
              Programa
              <select
                id="filter-programa"
                aria-label="Filtrar por programa"
                value={filters.programa}
                onChange={(e) => setField("programa", e.target.value)}
              >
                <option value="">Todos os programas</option>
                {PROGRAMAS_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Formação
              <select
                id="filter-formacao"
                aria-label="Filtrar por formação"
                value={filters.formacao}
                onChange={(e) => setField("formacao", e.target.value)}
              >
                <option value="">Todas as formações</option>
                {FORMACAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Atuação
              <select
                id="filter-atuacao"
                aria-label="Filtrar por atuação"
                value={filters.atuacao}
                onChange={(e) => setField("atuacao", e.target.value)}
              >
                <option value="">Todas as atuações</option>
                {ATUACAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Ordenar
              <select
                id="filter-sort"
                aria-label="Ordenar resultados"
                value={filters.sort}
                onChange={(e) => setField("sort", e.target.value as SortMode)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Por página
              <select
                id="filter-perpage"
                aria-label="Itens por página"
                value={filters.perpage}
                onChange={(e) => setField("perpage", parseInt(e.target.value, 10) || 24)}
              >
                {PERPAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="docentes-chips" id="docentes-chips" aria-live="polite" aria-label="Filtros ativos">
            {chips.map((c, i) => (
              <span key={`${c.key}-${i}`} className={`docentes-chip ${c.vertClass ?? ""}`}>
                {c.label}
                <button
                  type="button"
                  aria-label={`Remover filtro ${c.label}`}
                  onClick={() => removeChip(c)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SEÇÃO ESPECIALISTAS ===== */}
      <section className="section" id="especialistas" aria-label="Curadoria docente do Grupo NTC">
        <div className="container">
          <div
            className="section-head fade-in"
            style={{ textAlign: "left", maxWidth: "none", marginBottom: "var(--space-4)" }}
          >
            <span className="curadoria-pill">
              Curadoria científica · Em estruturação contínua
            </span>
            <p className="eyebrow">Corpo docente do Grupo NTC</p>
            <h2
              style={{ textAlign: "left" }}
              dangerouslySetInnerHTML={{
                __html:
                  "Especialistas que conectam <em>política pública, gestão institucional e prática de rede</em>",
              }}
            />
          </div>

          <div className="docentes-results-head">
            <p className="docentes-results-counter" aria-live="polite">
              Exibindo <strong id="docentes-counter-shown">{visible.length}</strong> de{" "}
              <strong id="docentes-counter-total">{total}</strong> especialistas
            </p>
          </div>

          {/* Destaques institucionais — fora da pipeline */}
          <p className="experts-marker">Destaques institucionais da curadoria</p>
          <div className="experts-featured fade-in">
            {featured.map((f) => (
              <article
                key={f.cmsLink}
                className="expert-featured-card"
                data-vertical={f.vertical}
                data-area={f.area}
                data-tipo={f.tipo}
                data-frente={f.frente}
                data-programas={f.programas}
                data-formacao={f.formacao}
                data-atuacao={f.atuacao}
                data-cms-link={f.cmsLink}
                data-name={f.nome}
              >
                <div className="efc-portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.imagemSrc} alt={f.imagemAlt} loading="lazy" />
                  <span className="efc-axis-badge">{f.axisBadge}</span>
                </div>
                <div className="efc-info">
                  <span className="efc-tag">{f.tag}</span>
                  <h4>{f.nome}</h4>
                  <p className="efc-credential">{f.credencial}</p>
                  <div className="efc-meta">
                    <span dangerouslySetInnerHTML={{ __html: f.metaAtuacao }} />
                    <span dangerouslySetInnerHTML={{ __html: f.metaEixos }} />
                  </div>
                  <a className="efc-link" href={f.ctaHref}>
                    {f.ctaRotulo} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Grade principal — experts + axis-saúde filtrados */}
          <p className="experts-marker">Especialistas convidados · Por eixo formativo</p>
          <div className="experts-authority-grid" id="docentes-grid">
            {visible.map((card) =>
              card.kind === "expert" ? (
                <ExpertAuthorityCard key={card.cmsLink} c={card.original as CardExpert} />
              ) : (
                <AxisCard key={card.cmsLink} c={card.original as CardAxis} />
              )
            )}
          </div>

          {/* Empty state */}
          <div
            className={`docentes-empty ${total === 0 ? "is-visible" : ""}`}
            id="docentes-empty"
          >
            <p>Nenhum especialista encontrado para os filtros selecionados.</p>
            <button type="button" id="empty-clear" onClick={clearAll}>
              Limpar filtros
            </button>
          </div>

          {/* Paginação */}
          {totalPages > 1 ? (
            <div className="docentes-pagination" id="docentes-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                ←
              </button>
              {compactRange(currentPage, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="pg-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={p === currentPage ? "is-current" : ""}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                →
              </button>
            </div>
          ) : null}

          {/* Contadores institucionais */}
          <div
            className="experts-counters fade-in"
            aria-label="Indicadores institucionais da curadoria"
          >
            {CONTADORES.map((c) => (
              <div key={c.label} className="experts-counter">
                <span className="ec-num">
                  {c.num}
                  {c.sufixoOuro ? (
                    <span
                      style={{
                        fontSize: 18,
                        color: "var(--dourado)",
                        marginLeft: 2,
                      }}
                    >
                      {c.sufixoOuro}
                    </span>
                  ) : null}
                </span>
                <span className="ec-lbl">
                  {c.label}
                  {c.asterisco ? (
                    <sup
                      style={{
                        fontSize: 11,
                        color: "var(--dourado)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      *
                    </sup>
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          {/* Nota 122+ */}
          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: 11.5,
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "var(--dourado)",
              margin: "var(--space-2) 0 0",
            }}
          >
            <strong style={{ color: "var(--dourado)" }}>*</strong>{" "}
            {NOTAS.indicador122.rotulo.replace(/^\*\s*/, "")}
          </p>
          <p
            style={{
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              color: "var(--grafite)",
              margin: "6px 0 0",
              maxWidth: 920,
              lineHeight: 1.55,
            }}
            dangerouslySetInnerHTML={{ __html: NOTAS.indicador122.texto }}
          />

          {/* Nota seleção operacional */}
          <p
            style={{
              textAlign: "left",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              color: "var(--grafite)",
              margin: "var(--space-4) 0 0",
              maxWidth: 920,
            }}
            dangerouslySetInnerHTML={{ __html: NOTAS.selecaoOperacional }}
          />
        </div>
      </section>
    </>
  );
}

/* ============================================================
   SUBCOMPONENTES DE CARD
   ============================================================ */

function ExpertAuthorityCard({ c }: { c: CardExpert }) {
  return (
    <article
      className="expert-authority-card"
      data-vertical={c.vertical}
      data-area={c.area}
      data-tipo={c.tipo}
      data-frente={c.frente}
      data-programas={c.programas}
      data-formacao={c.formacao}
      data-atuacao={c.atuacao}
      data-cms-link={c.cmsLink}
      data-name={c.nome}
    >
      <div className="eac-portrait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.imagemSrc} alt={c.imagemAlt} loading="lazy" />
        <span className="eac-axis-badge">{c.axisBadge}</span>
        <span className="eac-tipo-tag">{c.tipoTag}</span>
      </div>
      <div className="eac-info">
        <h4>{c.nomeExibido}</h4>
        <p className="eac-credential">{c.credencial}</p>
        <p className="eac-programs">
          {c.programasTexto}<strong>{c.programasStrong}</strong>
          {c.sufixoPrograma ?? ""}
        </p>
        <a className="eac-link" href={c.ctaHref}>
          {c.ctaRotulo} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

function AxisCard({ c }: { c: CardAxis }) {
  return (
    <article
      className="expert-authority-card is-axis-card"
      data-vertical={c.vertical}
      data-area={c.area}
      data-tipo={c.tipo}
      data-frente={c.frente}
      data-programas={c.programas}
      data-cms-link={c.cmsLink}
      data-name={c.nome}
      style={
        {
          "--vertical-accent": c.styleAccent,
          "--vertical-accent-dark": c.styleAccentDark,
        } as CSSProperties
      }
    >
      <div className="eac-portrait" style={{ aspectRatio: "4/5" }}>
        <div className="eac-icon-wrap">
          <svg
            className="eac-icon"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: c.iconeSvgInner }}
          />
        </div>
        <span className="eac-axis-tag">{c.axisTag}</span>
      </div>
      <div className="eac-info">
        <h4>{c.titulo}</h4>
        <p className="eac-credential">{c.credencial}</p>
        <p className="eac-programs">
          {c.programasTexto}<strong>{c.programasStrong}</strong>
        </p>
        <a className="eac-link" href={c.ctaHref}>
          {c.ctaRotulo} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
