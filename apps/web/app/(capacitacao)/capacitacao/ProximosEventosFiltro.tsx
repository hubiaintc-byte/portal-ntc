"use client";

import { useMemo, useState } from "react";

import type {
  EventoCap,
  FiltroProximos,
  LinkInterno,
  VerticalCapacitacao,
} from "./conteudoCapacitacao";

/**
 * Microfiltros de próximos eventos da página /capacitacao. Espelha o IIFE
 * do protótipo (linhas 2628-2650 de 27_Pagina_Capacitacao_v1.html):
 *
 * - 4 filtros tab (all / edu / gov / sau) com aria-selected.
 * - 6 cards `.cap-evento-card` com `data-vert`.
 * - Estratégia "todos no DOM com is-hidden" (paridade com CSS portado).
 * - Counter via track('cap_proximos_filter', { filter, shown }) — no-op stub.
 *
 * Não tem URL sync nem busca (protótipo não tem).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface ProximosEventosFiltroProps {
  eventos: EventoCap[];
  filtros: FiltroProximos[];
  head: {
    eyebrow: string;
    tituloHtml: string;
    intro: string;
    selo: string;
  };
  footerCta: LinkInterno;
}

type FiltroValor = "all" | VerticalCapacitacao;

export function ProximosEventosFiltro({
  eventos,
  filtros,
  head,
  footerCta,
}: ProximosEventosFiltroProps) {
  const [filtro, setFiltro] = useState<FiltroValor>("all");

  const visiveis = useMemo(() => {
    return eventos.map((evento) => {
      const visible = filtro === "all" || evento.vert === filtro;
      return { evento, visible };
    });
  }, [eventos, filtro]);

  const onFiltroClick = (valor: FiltroValor) => {
    setFiltro(valor);
    const shown = eventos.filter((e) => valor === "all" || e.vert === valor).length;
    track("cap_proximos_filter", { filter: valor, shown });
  };

  return (
    <section
      className="cap-proximos"
      id="proximos"
      aria-label="Próximos eventos abertos"
    >
      <div className="container">
        <div className="section-head fade-in">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: head.tituloHtml }} />
          <p className="intro">{head.intro}</p>
          <span className="cap-proximos-selo" aria-label="Selo institucional">
            {head.selo}
          </span>
        </div>

        <div
          className="cap-proximos-filters fade-in"
          role="tablist"
          aria-label="Filtrar eventos por vertical"
        >
          {filtros.map((f) => {
            const ativa = filtro === f.value;
            return (
              <button
                key={f.value}
                type="button"
                className={`cap-proximos-filter${ativa ? " is-active" : ""}`}
                data-filter={f.value}
                role="tab"
                aria-selected={ativa}
                onClick={() => onFiltroClick(f.value)}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="cap-proximos-grid fade-in">
          {visiveis.map(({ evento, visible }, i) => (
            <article
              key={i}
              className={`cap-evento-card${visible ? "" : " is-hidden"}`}
              data-vert={evento.vert}
            >
              <div className="cap-evento-band" aria-hidden="true" />
              <div className="cap-evento-body">
                <p className="cap-evento-vert">{evento.eyebrow}</p>
                <h3
                  dangerouslySetInnerHTML={{
                    __html: `${evento.prefixoHtml}${evento.titulo}`,
                  }}
                />
                <div className="cap-evento-meta">
                  <span>{evento.data}</span>
                  <span className="fmt">{evento.formato}</span>
                  <span>{evento.local}</span>
                </div>
                <p>{evento.descricao}</p>
              </div>
              <div className="cap-evento-foot">
                <span className="cap-evento-price">{evento.preco}</span>
                <a
                  className="cap-evento-link"
                  href={evento.cta.href}
                  data-cms-link={evento.cta.cmsLink}
                  data-track={evento.cta.track}
                >
                  {evento.cta.texto}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="cap-proximos-foot fade-in">
          <a
            className={footerCta.classe}
            href={footerCta.href}
            data-cms-link={footerCta.cmsLink}
            data-track={footerCta.track}
          >
            {footerCta.texto}
            {footerCta.arrow && <span className="btn-arrow"> →</span>}
          </a>
        </div>
      </div>
    </section>
  );
}
