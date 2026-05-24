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

      {/* Placeholder · grid + paginação entram no Task 11 */}
      <section className="section" id="agenda-eventos" aria-label="Resultados da agenda">
        <div className="container">
          <p
            style={{
              padding: "var(--space-4)",
              textAlign: "center",
              color: "var(--oxford)",
            }}
          >
            Carregando agenda…
          </p>
        </div>
      </section>

      {/* Reservas: hooks/símbolos consumidos no Task 11 */}
      {hidratado ? null : null}
      <RemoverFiltroReserva removerFiltro={removerFiltro} eventos={eventos} />
    </>
  );
}

// Stub para manter `removerFiltro`, `eventos` e helpers/imports consumidos
// até o Task 11 plumbar grid + applied chips + paginação. Renderiza nada.
interface RemoverFiltroReservaProps {
  removerFiltro: (key: keyof EstadoAgenda) => void;
  eventos: CartaoEvento[];
}
function RemoverFiltroReserva({ removerFiltro, eventos }: RemoverFiltroReservaProps) {
  void removerFiltro;
  void eventos;
  void EMPTY_AGENDA;
  void LABELS;
  void PERPAGE_OPCOES;
  void filterByTab;
  void filterByControls;
  void filterBySearch;
  void sortCards;
  void paginate;
  void compactRange;
  void computeDeadline;
  return null;
}
