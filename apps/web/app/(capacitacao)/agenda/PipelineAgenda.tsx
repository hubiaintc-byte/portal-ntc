"use client";

import type React from "react";
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

// ----------------- Componente principal -----------------

export function PipelineAgenda({ eventos }: PipelineAgendaProps) {
  const [state, setState] = useState<EstadoAgenda>(ESTADO_INICIAL);
  const [advancedAberto, setAdvancedAberto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [hidratado, setHidratado] = useState(false);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  // Debounce da busca: usuário digita em buscaLocal, state.busca só atualiza
  // após 220ms (espelha o protótipo).
  const [buscaLocal, setBuscaLocal] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState((s) => (s.busca === buscaLocal ? s : { ...s, busca: buscaLocal, page: 1 }));
      if (buscaLocal !== state.busca) {
        track("search_input", { query: buscaLocal, length: buscaLocal.length });
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [buscaLocal, state.busca]);

  // Contagem por tab (espelha updateTabCounts), ignora filtros.
  const counts = useMemo(() => {
    const buckets: Record<TabSlug, number> = {
      abertas: 0,
      proximas: 0,
      "em-breve": 0,
      replay: 0,
      realizados: 0,
    };
    eventos.forEach((e) => {
      buckets[e.tab] += 1;
    });
    return buckets;
  }, [eventos]);

  const onMudarFiltro = useCallback(
    <K extends keyof EstadoAgenda>(key: K, value: EstadoAgenda[K], trackName: string) => {
      setState((s) => ({ ...s, [key]: value, page: 1 }));
      track(trackName, { filter: key, value });
    },
    [],
  );

  const clearAll = useCallback(() => {
    setState(ESTADO_INICIAL);
    setBuscaLocal("");
    track("filters_clear_all");
  }, []);

  const removerFiltro = useCallback((key: keyof EstadoAgenda) => {
    setState((s) => ({ ...s, [key]: ESTADO_INICIAL[key], page: 1 }));
    if (key === "busca") setBuscaLocal("");
  }, []);

  const ativosCount =
    (state.area ? 1 : 0) +
    (state.programa ? 1 : 0) +
    (state.formato ? 1 : 0) +
    (state.modalidade ? 1 : 0) +
    (state.cidade ? 1 : 0) +
    (state.mes ? 1 : 0) +
    (state.busca ? 1 : 0);

  // Hidratação inicial (Task 12 vai sobrescrever isso com leitura de URL).
  useEffect(() => {
    setHidratado(true);
  }, []);

  // Relógio para recálculo do selo de deadline. Atualiza a cada 30s e
  // após o mount (evita mismatch SSR/CSR: durante SSR usamos new Date()
  // de referência, mas o card só ganha selo dinâmico após a hidratação).
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Pipeline (espelha apply() do protótipo).
  const { visiveis, total, totalPages, pageEfetiva, destaques } = useMemo(() => {
    let pool = filterByTab(eventos, state.tab);
    pool = filterByControls(pool, state);
    pool = filterBySearch(pool, state.busca);
    pool = sortCards(pool, state.sort);
    const pag = paginate(pool, state.page, state.perPage);
    const semFiltros =
      !state.area &&
      !state.programa &&
      !state.formato &&
      !state.modalidade &&
      !state.cidade &&
      !state.mes &&
      !state.busca;
    const dest =
      state.tab === "abertas" && semFiltros
        ? eventos
            .filter((e) => e.tab === "abertas" && e.flags.includes("destaque_editorial"))
            .slice(0, 3)
        : [];
    return {
      visiveis: pag.visiveis,
      total: pag.total,
      totalPages: pag.totalPages,
      pageEfetiva: pag.pageEfetiva,
      destaques: dest,
    };
  }, [eventos, state]);

  // Sincroniza page efetiva (paginate pode reduzir page se for inválida).
  useEffect(() => {
    if (state.page !== pageEfetiva) {
      setState((s) => ({ ...s, page: pageEfetiva }));
    }
  }, [pageEfetiva, state.page]);

  return (
    <>
      {/* TABS */}
      <nav className="agenda-tabs" aria-label="Categorias de oferta">
        <div className="container">
          <div className="agenda-tabs-inner" role="tablist">
            {TABS_AGENDA.map((tab) => {
              const cnt = counts[tab.slug];
              const desabilitada = cnt === 0 && tab.slug !== "abertas";
              const ativa = state.tab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  className={`agenda-tab${ativa ? " is-active" : ""}`}
                  data-tab={tab.slug}
                  role="tab"
                  aria-selected={ativa}
                  disabled={desabilitada}
                  aria-disabled={desabilitada || undefined}
                  title={desabilitada ? "Conteúdo será publicado em breve" : undefined}
                  onClick={() => {
                    setState((s) => ({ ...s, tab: tab.slug, page: 1 }));
                    track("tab_change", { tab: tab.slug });
                  }}
                >
                  {tab.rotulo} <span className="tab-count" id={tab.idCount}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FILTERBAR */}
      <div className="agenda-filterbar" aria-label="Filtros da agenda">
        <button
          className="agenda-mobile-filter-toggle"
          type="button"
          id="btn-mobile-filter-toggle"
          aria-expanded={mobileAberto}
          aria-controls="agenda-filters-inner"
          onClick={() => {
            const aberto = !mobileAberto;
            setMobileAberto(aberto);
            track("mobile_filter_toggle", { open: aberto });
          }}
        >
          <span className="mft-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
          </span>
          <span className="mft-label">{mobileAberto ? "Fechar filtros" : "Filtrar agenda"}</span>
          {ativosCount > 0 && <span className="mft-count" id="mft-active-count">{ativosCount}</span>}
        </button>
        <div
          className={`container agenda-filterbar-inner${mobileAberto ? " is-mobile-open" : ""}`}
          id="agenda-filters-inner"
        >
          {/* Linha primária */}
          <div className="agenda-filters-row is-primary">
            <label className="agenda-search" aria-label="Buscar eventos">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l5 5" />
              </svg>
              <input
                ref={buscaInputRef}
                type="search"
                id="filter-search"
                placeholder="Buscar por tema, programa, cidade ou palavra-chave"
                autoComplete="off"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
              />
              {buscaLocal && (
                <button
                  type="button"
                  className="clear-search"
                  id="btn-clear-search"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setBuscaLocal("");
                    setState((s) => ({ ...s, busca: "", page: 1 }));
                    buscaInputRef.current?.focus();
                  }}
                >
                  ×
                </button>
              )}
            </label>

            <label className="agenda-filter">
              Área
              <select
                id="filter-area"
                aria-label="Filtrar por área estratégica"
                value={state.area}
                onChange={(e) =>
                  onMudarFiltro("area", e.target.value as EstadoAgenda["area"], "filter_change")
                }
              >
                {FILTRO_AREA.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Modalidade
              <select
                id="filter-modalidade"
                aria-label="Filtrar por modalidade"
                value={state.modalidade}
                onChange={(e) =>
                  onMudarFiltro(
                    "modalidade",
                    e.target.value as EstadoAgenda["modalidade"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_MODALIDADE.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Mês
              <select
                id="filter-mes"
                aria-label="Filtrar por mês"
                value={state.mes}
                onChange={(e) => onMudarFiltro("mes", e.target.value, "filter_change")}
              >
                {FILTRO_MES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <button
              className={`agenda-advanced-toggle${advancedAberto ? " is-open" : ""}`}
              type="button"
              id="btn-toggle-advanced"
              aria-expanded={advancedAberto}
              aria-controls="filters-advanced"
              onClick={() => setAdvancedAberto((v) => !v)}
            >
              Filtros avançados <span className="chevron" aria-hidden="true">▾</span>
            </button>

            <button
              className="agenda-filter-clear"
              id="btn-clear-filters"
              type="button"
              onClick={clearAll}
            >
              Limpar filtros ×
            </button>
          </div>

          {/* Linha avançada */}
          <div
            className={`agenda-filters-row is-advanced${advancedAberto ? " is-open" : ""}`}
            id="filters-advanced"
            aria-label="Filtros avançados"
          >
            <label className="agenda-filter">
              Programa
              <select
                id="filter-programa"
                aria-label="Filtrar por programa"
                value={state.programa}
                onChange={(e) =>
                  onMudarFiltro(
                    "programa",
                    e.target.value as EstadoAgenda["programa"],
                    "filter_change",
                  )
                }
              >
                <option value="">Todos</option>
                {FILTRO_PROGRAMA_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.opcoes.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Formato
              <select
                id="filter-formato"
                aria-label="Filtrar por formato"
                value={state.formato}
                onChange={(e) =>
                  onMudarFiltro(
                    "formato",
                    e.target.value as EstadoAgenda["formato"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_FORMATO.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Cidade
              <select
                id="filter-cidade"
                aria-label="Filtrar por cidade"
                value={state.cidade}
                onChange={(e) =>
                  onMudarFiltro(
                    "cidade",
                    e.target.value as EstadoAgenda["cidade"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_CIDADE.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Ordenar
              <select
                id="filter-sort"
                aria-label="Ordenar resultados"
                value={state.sort}
                onChange={(e) => {
                  const v = e.target.value as SortSlug;
                  setState((s) => ({ ...s, sort: v, page: 1 }));
                  track("sort_change", { value: v });
                }}
              >
                {FILTRO_SORT.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <section className="section" id="agenda-eventos" aria-label="Resultados da agenda">
        <div className="container">
          {/* DESTAQUES */}
          {destaques.length > 0 && (
            <div className="agenda-destaques" id="agenda-destaques">
              <header className="agenda-destaques-head">
                <div>
                  <p className="destaques-eyebrow">Curadoria editorial</p>
                  <h2>
                    Destaques da <em>agenda</em>
                  </h2>
                </div>
              </header>
              <div className="agenda-destaques-grid" id="agenda-destaques-grid">
                {destaques.map((e) => (
                  <CardEvento key={`dest-${e.ordem}`} evento={e} now={now} />
                ))}
              </div>
            </div>
          )}

          <header className="agenda-todos-head">
            <div>
              <p className="todos-eyebrow">Todos os eventos abertos</p>
              <h2>
                Agenda <em>completa</em>
              </h2>
            </div>
          </header>

          {/* CONTROL ROW */}
          <div className="agenda-controlrow">
            <p className="agenda-counter" aria-live="polite" id="counter-text">
              {renderCounterText(total, pageEfetiva, state.perPage, visiveis.length)}
            </p>
            <div className="agenda-controls-right">
              <span className="agenda-perpage">
                Mostrar
                <span
                  className="agenda-perpage-buttons"
                  role="group"
                  aria-label="Eventos por página"
                >
                  {PERPAGE_OPCOES.map((pp) => (
                    <button
                      key={pp}
                      type="button"
                      data-perpage={pp}
                      className={state.perPage === pp ? "is-active" : undefined}
                      onClick={() => {
                        setState((s) => ({ ...s, perPage: pp, page: 1 }));
                        track("perpage_change", { value: pp });
                      }}
                    >
                      {pp}
                    </button>
                  ))}
                </span>
              </span>
            </div>
          </div>

          {/* APPLIED CHIPS */}
          <div className="agenda-applied" id="applied-filters" aria-live="polite">
            {chipsAplicados(state).map((chip) => (
              <span key={chip.key} className="chip-applied">
                {chip.label}{" "}
                <button
                  type="button"
                  aria-label={`Remover filtro ${chip.label}`}
                  data-clear-key={chip.key}
                  onClick={() => removerFiltro(chip.key)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* GRID + EMPTY */}
          <div className="agenda-grid" id="agenda-grid">
            {visiveis.map((e) => (
              <CardEvento key={e.ordem} evento={e} now={now} />
            ))}
            {total === 0 && (
              <div className="agenda-empty" id="agenda-empty">
                <span className="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16 16l5 5" />
                    <path d="M8 11h6" />
                  </svg>
                </span>
                <h3>{EMPTY_AGENDA.titulo}</h3>
                <p>{EMPTY_AGENDA.descricao}</p>
                <div className="empty-actions">
                  <a
                    className="btn btn--primary"
                    href={EMPTY_AGENDA.ctaLimpar.href}
                    id="btn-empty-clear"
                    onClick={(ev) => {
                      ev.preventDefault();
                      clearAll();
                    }}
                  >
                    {EMPTY_AGENDA.ctaLimpar.texto}
                  </a>
                  <a
                    className="btn btn--ghost"
                    href={EMPTY_AGENDA.ctaSobMedida.href}
                    data-cms-link={EMPTY_AGENDA.ctaSobMedida.cmsLink}
                    data-track={EMPTY_AGENDA.ctaSobMedida.track}
                  >
                    {EMPTY_AGENDA.ctaSobMedida.texto}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <nav
              className="agenda-pagination"
              id="agenda-pagination"
              aria-label="Paginação dos resultados"
            >
              <button
                type="button"
                className="page-nav prev"
                disabled={pageEfetiva === 1}
                onClick={() => {
                  setState((s) => ({ ...s, page: Math.max(1, s.page - 1) }));
                  track("pagination_change", { label: "Anterior" });
                }}
              >
                Anterior
              </button>
              {compactRange(pageEfetiva, totalPages).map((p, idx) => {
                if (p === "…") {
                  return (
                    <span key={`gap-${idx}`} className="page-ellipsis">
                      …
                    </span>
                  );
                }
                const ativa = p === pageEfetiva;
                return (
                  <button
                    key={p}
                    type="button"
                    className={ativa ? "is-current" : undefined}
                    onClick={() => {
                      setState((s) => ({ ...s, page: p }));
                      track("pagination_change", { label: String(p) });
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                className="page-nav next"
                disabled={pageEfetiva === totalPages}
                onClick={() => {
                  setState((s) => ({ ...s, page: Math.min(totalPages, s.page + 1) }));
                  track("pagination_change", { label: "Próxima" });
                }}
              >
                Próxima
              </button>
            </nav>
          )}
        </div>
      </section>

      {hidratado ? null : null}
    </>
  );
}

// ----------------- helpers de render -----------------

function renderCounterText(
  total: number,
  page: number,
  perPage: number,
  visiveisLen: number,
): React.ReactNode {
  if (total === 0) {
    return "Nenhum evento encontrado com os filtros aplicados";
  }
  if (total <= perPage) {
    return (
      <>
        <strong>{total}</strong> {total === 1 ? "evento encontrado" : "eventos encontrados"}
      </>
    );
  }
  const start = (page - 1) * perPage + 1;
  const end = start + visiveisLen - 1;
  return (
    <>
      Mostrando <strong>{start}–{end}</strong> de <strong>{total}</strong> eventos encontrados
    </>
  );
}

type ChipKey =
  | "area"
  | "programa"
  | "formato"
  | "modalidade"
  | "cidade"
  | "mes"
  | "busca";

function chipsAplicados(state: EstadoAgenda): { key: ChipKey; label: string }[] {
  const items: { key: ChipKey; label: string }[] = [];
  if (state.area) items.push({ key: "area", label: LABELS.area[state.area] });
  if (state.programa) items.push({ key: "programa", label: state.programa });
  if (state.formato) items.push({ key: "formato", label: LABELS.formato[state.formato] });
  if (state.modalidade) {
    items.push({ key: "modalidade", label: LABELS.modalidade[state.modalidade] });
  }
  if (state.cidade) items.push({ key: "cidade", label: LABELS.cidade[state.cidade] });
  if (state.mes) {
    const mesLabel = LABELS.mes[state.mes];
    if (mesLabel) items.push({ key: "mes", label: mesLabel });
  }
  if (state.busca) items.push({ key: "busca", label: `"${state.busca}"` });
  return items;
}

// ----------------- CardEvento -----------------

interface CardEventoProps {
  evento: CartaoEvento;
  now: Date;
}

function CardEvento({ evento: e, now }: CardEventoProps) {
  const deadline = computeDeadline(e.deadlineIso, now);
  const seal =
    deadline && !deadline.expired && deadline.diffDays <= 7
      ? deadline.diffDays <= 2
        ? {
            texto: "Inscrições encerrando",
            classe: "is-critical",
            aria: "Inscrições encerrando em até 48 horas",
          }
        : {
            texto: `Encerram em ${deadline.diffDays} dias`,
            classe: "",
            aria: `Inscrições encerram em ${deadline.diffDays} dias`,
          }
      : null;

  return (
    <article
      className={`event-card${e.eventoEmDestaque ? " is-featured" : ""}`}
      data-area={e.area}
      data-programa={e.programa}
      data-formato={e.formato}
      data-modalidade={e.modalidade}
      data-cidade={e.cidade}
      data-mes={e.mes}
      data-ch={e.cargaHorariaHoras}
      data-valor={e.valorReais}
      data-dateiso={e.dataIso}
      data-deadline-iso={e.deadlineIso}
      data-tab={e.tab}
      data-flags={e.flags.join(",")}
      data-keywords={e.keywords}
      data-status={e.status}
    >
      {e.eventoEmDestaque && e.badgeDestaqueTexto && (
        <span className="event-featured-badge">{e.badgeDestaqueTexto}</span>
      )}
      <span className={`event-status-tag ${e.selo.classe}`}>{e.selo.texto}</span>
      <div className="event-cover">
        <div
          className="event-cover-img"
          style={{ backgroundImage: `url('${e.imagemUrl}')` }}
          aria-hidden="true"
        />
        <div className="event-cover-overlay" />
        <div className="event-cover-meta">
          <DataBlocoView bloco={e.dataBloco} />
          <span
            className={`event-modality${
              e.modalidadeClasseExtra ? ` ${e.modalidadeClasseExtra}` : ""
            }`}
          >
            {e.modalidadeLabel}
          </span>
        </div>
        {seal && (
          <span
            className={`event-deadline-seal ${seal.classe}`.trim()}
            aria-label={seal.aria}
          >
            {seal.texto}
          </span>
        )}
      </div>
      <div className="event-body">
        <p className="event-program-link">
          {e.formatoLabel} <span className="dot">·</span> {e.areaLabel}
        </p>
        <h3 dangerouslySetInnerHTML={{ __html: e.tituloHtml }} />
        <div className="event-speakers-line">
          <span className="label">Coordenação científica</span>
          <span className="names">{e.coordenacaoNomes}</span>
        </div>
        <div className="event-meta-essentials">
          <span>{e.metaEssenciais[0]}</span>
          <span>{e.metaEssenciais[1]}</span>
        </div>
        <div className="event-program-binding">
          <span className="epb-label">Integra o programa</span>
          <span className="epb-program">
            <a href={e.programaBinding.href} data-cms-link={e.programaBinding.cmsLink}>
              {e.programaBinding.sigla}
            </a>
          </span>
        </div>
        <div className="event-pricing">
          <span className="event-price">
            Inscrição individual<strong>{e.precoIndividualLabel}</strong>
          </span>
          <span className="event-price institutional">
            Equipes / órgãos<strong>{e.precoEquipesLabel}</strong>
          </span>
        </div>
      </div>
      <div className="event-actions">
        <a
          className="btn btn--gold"
          href={e.ctaInscrever.href}
          title={e.ctaInscrever.title}
          data-cms-link={e.ctaInscrever.cmsLink}
          data-track={e.ctaInscrever.track}
        >
          {e.ctaInscrever.texto} <span className="btn-arrow">→</span>
        </a>
        <div className="event-actions-row">
          <a
            className="link-arrow"
            href={e.linkDetalhes.href}
            title={e.linkDetalhes.title}
            data-cms-link={e.linkDetalhes.cmsLink}
            data-track={e.linkDetalhes.track}
          >
            {e.linkDetalhes.texto}
          </a>
          <a
            className="link-arrow"
            href={e.linkInscreverEquipe.href}
            data-cms-link={e.linkInscreverEquipe.cmsLink}
            data-track={e.linkInscreverEquipe.track}
          >
            {e.linkInscreverEquipe.texto}
          </a>
        </div>
      </div>
    </article>
  );
}

function DataBlocoView({ bloco }: { bloco: CartaoEvento["dataBloco"] }) {
  if (bloco.tipo === "range") {
    return (
      <div className="event-date-block range">
        <span className="days">
          {bloco.diaInicio}
          <span className="dash">–</span>
          {bloco.diaFim}
        </span>
        <span className="mon-yr">{bloco.mesAno}</span>
      </div>
    );
  }
  if (bloco.tipo === "multi") {
    return (
      <div className="event-date-block multi">
        <span className="count">
          <span className="number">{bloco.quantidade}</span> {bloco.rotulo}
        </span>
        <span className="period">{bloco.periodo}</span>
      </div>
    );
  }
  return (
    <div className="event-date-block single">
      <span className="day">{bloco.dia}</span>
      <span className="mon-yr">{bloco.mesAno}</span>
    </div>
  );
}
