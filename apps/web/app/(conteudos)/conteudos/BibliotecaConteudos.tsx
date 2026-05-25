"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type CardBiblioteca,
  type OpcaoTab,
  type OpcaoTipo,
  type TipoConteudo,
  type VerticalConteudo,
  BIBLIOTECA_EMPTY,
  BIBLIOTECA_FOOTER,
  BIBLIOTECA_SEARCH_PLACEHOLDER,
  FILTROS_TIPO,
  TABS_VERTICAL,
} from "./conteudoConteudos";

/**
 * Biblioteca filtrável de /conteudos. Espelha o IIFE do protótipo
 * (linhas 2518-2617 de 28_Pagina_Conteudos_v1.html):
 *
 * - Tabs vertical (5) + filtros tipo (6) + busca debounced 180ms.
 * - URL sync via history.replaceState: ?vertical=&tipo=&q=
 *   (defaults all/all/empty são omitidos).
 * - Busca normalizada (lowercase + NFD strip diacritics) contra
 *   data-search + título + descrição.
 * - Counter dinâmico ("N conteúdos em preparação").
 * - Empty state quando shown === 0.
 * - Hidratação inicial: lê querystring e aplica.
 *
 * Estratégia render: todos os cards permanecem no DOM, recebem
 * className "is-hidden" quando filtrados (paridade com CSS do
 * protótipo, que define `.cont-card.is-hidden { display: none }`).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

interface BibliotecaConteudosProps {
  cards: CardBiblioteca[];
  head: {
    eyebrow: string;
    tituloHtml: string;
    intro: string;
    note: string;
  };
}

interface EstadoBiblioteca {
  vert: "all" | VerticalConteudo;
  tipo: "all" | TipoConteudo;
  busca: string;
}

const ESTADO_INICIAL: EstadoBiblioteca = {
  vert: "all",
  tipo: "all",
  busca: "",
};

function readURL(): Partial<EstadoBiblioteca> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<EstadoBiblioteca> = {};
  const v = p.get("vertical");
  if (v && TABS_VERTICAL.some((t) => t.value === v && t.value !== "all")) {
    out.vert = v as VerticalConteudo;
  }
  const tp = p.get("tipo");
  if (tp && FILTROS_TIPO.some((f) => f.value === tp && f.value !== "all")) {
    out.tipo = tp as TipoConteudo;
  }
  const q = p.get("q");
  if (q) out.busca = q;
  return out;
}

function writeURL(state: EstadoBiblioteca): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (state.vert !== "all") p.set("vertical", state.vert);
  if (state.tipo !== "all") p.set("tipo", state.tipo);
  if (state.busca.trim().length >= 2) p.set("q", state.busca.trim());
  const qs = p.toString();
  const url =
    window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
  window.history.replaceState(null, "", url);
}

export function BibliotecaConteudos({ cards, head }: BibliotecaConteudosProps) {
  const [state, setState] = useState<EstadoBiblioteca>(ESTADO_INICIAL);
  const [buscaLocal, setBuscaLocal] = useState("");
  const [hidratado, setHidratado] = useState(false);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fromUrl = readURL();
    if (Object.keys(fromUrl).length > 0) {
      setState((s) => ({ ...s, ...fromUrl }));
      if (fromUrl.busca) setBuscaLocal(fromUrl.busca);
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState((s) =>
        s.busca === buscaLocal ? s : { ...s, busca: buscaLocal },
      );
      if (buscaLocal !== state.busca) {
        track("cont_search", { q: buscaLocal.slice(0, 60) });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [buscaLocal, state.busca]);

  useEffect(() => {
    if (!hidratado) return;
    writeURL(state);
  }, [state, hidratado]);

  const visiveis = useMemo(() => {
    const q = norm(state.busca.trim());
    return cards.map((card) => {
      const vOk = state.vert === "all" || card.vert === state.vert;
      const tOk = state.tipo === "all" || card.tipo === state.tipo;
      const haystack = norm(`${card.search} ${card.titulo} ${card.descricao}`);
      const qOk = q.length < 2 || haystack.includes(q);
      return { card, visible: vOk && tOk && qOk };
    });
  }, [cards, state]);

  const shown = visiveis.filter((v) => v.visible).length;

  return (
    <section
      className="cont-biblioteca"
      id="biblioteca"
      aria-label="Biblioteca filtravel do Grupo NTC"
    >
      <div className="container">
        <div className="section-head fade-in">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: head.tituloHtml }} />
          <p className="intro">{head.intro}</p>
          <span className="cont-biblioteca-note">{head.note}</span>
        </div>

        <div className="cont-tabs fade-in" role="tablist" aria-label="Filtrar por vertical">
          {TABS_VERTICAL.map((tab: OpcaoTab) => {
            const ativa = state.vert === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                className={`cont-tab${ativa ? " is-active" : ""}`}
                data-vert={tab.value}
                role="tab"
                aria-selected={ativa}
                onClick={() => {
                  setState((s) => ({ ...s, vert: tab.value }));
                  track("cont_tab_change", { vert: tab.value });
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="cont-filterbar fade-in">
          <div className="cont-search">
            <input
              ref={buscaInputRef}
              id="contSearch"
              type="search"
              placeholder={BIBLIOTECA_SEARCH_PLACEHOLDER}
              aria-label="Buscar conteúdos"
              value={buscaLocal}
              onChange={(e) => setBuscaLocal(e.target.value)}
            />
          </div>
          <div
            className="cont-typefilter"
            role="group"
            aria-label="Filtrar por tipo"
          >
            {FILTROS_TIPO.map((f: OpcaoTipo) => {
              const ativa = state.tipo === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  className={ativa ? "is-active" : undefined}
                  data-type={f.value}
                  onClick={() => {
                    setState((s) => ({ ...s, tipo: f.value }));
                    track("cont_typefilter_change", { type: f.value });
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="cont-filterbar-stats" id="contStats">
            <strong id="contCount">{shown}</strong> conteúdos em preparação
          </div>
        </div>

        <div className="cont-grid" id="contGrid">
          {visiveis.map(({ card, visible }, i) => (
            <article
              key={i}
              className={`cont-card${visible ? "" : " is-hidden"}`}
              data-vert={card.vert}
              data-type={card.tipo}
              data-search={card.search}
            >
              <div className="cont-card-band" aria-hidden="true" />
              <div className="cont-card-body">
                <div className="cont-card-tags">
                  <span className="cont-card-tag">{card.verticalLabel}</span>
                  <span className="cont-card-tag type">{card.tipoLabel}</span>
                </div>
                <span className="cont-card-prep">{card.prep}</span>
                <h3>{card.titulo}</h3>
                <p>{card.descricao}</p>
                <div className="cont-card-meta">
                  <span>{card.meta[0]}</span>
                  <span>{card.meta[1]}</span>
                </div>
              </div>
              <div className="cont-card-foot">
                <div className="author">
                  {card.authorPrefix}<strong>{card.authorBold}</strong>
                </div>
                <span
                  className="cont-card-link is-soon"
                  data-cms-link={card.linkSoon.cmsLink}
                >
                  {card.linkSoon.texto}
                </span>
              </div>
            </article>
          ))}
        </div>

        <p
          className={`cont-empty${shown === 0 ? " is-visible" : ""}`}
          id="contEmpty"
        >
          {BIBLIOTECA_EMPTY}
        </p>

        <div className="cont-biblioteca-foot fade-in">
          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: "12px",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "var(--grafite)",
              margin: "0 0 var(--space-3)",
            }}
          >
            {BIBLIOTECA_FOOTER.nota}
          </p>
          <a
            className={BIBLIOTECA_FOOTER.cta.classe}
            href={BIBLIOTECA_FOOTER.cta.href}
            data-cms-link={BIBLIOTECA_FOOTER.cta.cmsLink}
            data-track={BIBLIOTECA_FOOTER.cta.track}
          >
            {BIBLIOTECA_FOOTER.cta.texto}
            {BIBLIOTECA_FOOTER.cta.arrow && <span className="btn-arrow"> →</span>}
          </a>
        </div>
      </div>
    </section>
  );
}
