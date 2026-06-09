import type { Metadata } from "next";
import { Fragment } from "react";

import { paraCartaoAgenda } from "@/lib/eventos/adaptarParaCard";

import {
  EVENTOS_AGENDA,
  EVENTOS_LISTAGEM,
} from "./[slug]/conteudoEventos";
import {
  BREADCRUMB_AGENDA,
  type CartaoEvento,
  CTAS_INTERMEDIARIOS,
  HERO_AGENDA,
  RODAPE_CONTEXTUAL,
} from "./conteudoAgenda";
import { PipelineAgenda } from "./PipelineAgenda";
import { StickyMobileCTA } from "./StickyMobileCTA";

// Eventos reais (EVENTOS_AGENDA via adapter) substituem o array mockado.
const eventosAgenda: CartaoEvento[] = EVENTOS_LISTAGEM.map(
  (slug) => EVENTOS_AGENDA[slug],
)
  .filter((e): e is NonNullable<typeof e> => Boolean(e))
  .map((e, i) => paraCartaoAgenda(e, i + 1))
  .filter((c): c is CartaoEvento => Boolean(c));

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agenda Geral NTC · Eventos, formações e jornadas com inscrições abertas",
  description:
    "Encontre seminários, oficinas, cursos executivos, jornadas, simpósios e congressos do Grupo NTC nas áreas de Educação, Gestão Pública e Saúde — em formato online, presencial ou híbrido.",
};

/**
 * Página /agenda — porta literal de 09_Pagina_Agenda_v2.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Breadcrumb dark.
 *   2. Hero comercial.
 *   3. <PipelineAgenda> — tabs + filterbar + destaques + grid + paginação.
 *   4. CTAs intermediários (sob medida + in company).
 *   5. Rodapé contextual (4 colunas).
 *   6. <StickyMobileCTA> mobile.
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (capacitacao).
 */
export default function AgendaPage() {
  return (
    <main id="main">
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {BREADCRUMB_AGENDA.map((item, i) => (
              <Fragment key={`crumb-${i}`}>
                <li className={item.current ? "current" : undefined}>
                  {item.href ? (
                    <a href={item.href} data-cms-link={item.cmsLink}>
                      {item.texto}
                    </a>
                  ) : (
                    <span>{item.texto}</span>
                  )}
                </li>
                {i < BREADCRUMB_AGENDA.length - 1 && <li className="sep">/</li>}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="agenda-hero" aria-label="Agenda Geral · Grupo NTC">
        <div className="agenda-hero-bg" aria-hidden="true" />
        <div className="container fade-in">
          <p className="agenda-hero-eyebrow">{HERO_AGENDA.eyebrow}</p>
          <h1 dangerouslySetInnerHTML={{ __html: HERO_AGENDA.tituloHtml }} />
          <p className="agenda-hero-sub">{HERO_AGENDA.sub}</p>

          <div className="agenda-hero-ctas">
            {HERO_AGENDA.ctas.map((cta) => (
              <a
                key={cta.cmsLink}
                className={cta.classe}
                href={cta.href}
                data-cms-link={cta.cmsLink}
                data-track={cta.track}
              >
                {cta.texto}
                {cta.seta && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>

          <div className="agenda-hero-microbar" aria-hidden="true">
            {HERO_AGENDA.microbar.map((m) => (
              <div key={m.rotulo}>
                <strong id={"id" in m ? m.id : undefined}>{m.valor}</strong> {m.rotulo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PIPELINE (tabs + filterbar + grid + paginação) */}
      <PipelineAgenda eventos={eventosAgenda} />

      {/* 4. CTAs INTERMEDIÁRIOS */}
      <div className="agenda-intercta fade-in">
        {CTAS_INTERMEDIARIOS.map((c) => (
          <article
            key={c.eyebrow}
            className={`agenda-intercta-card${c.classeExtra ? ` ${c.classeExtra}` : ""}`}
          >
            <p className="ic-eyebrow">{c.eyebrow}</p>
            <h4 dangerouslySetInnerHTML={{ __html: c.tituloHtml }} />
            <p>{c.descricao}</p>
            <div className="ic-actions">
              <a
                className="btn btn--primary"
                href={c.cta.href}
                data-cms-link={c.cta.cmsLink}
                data-track={c.cta.track}
              >
                {c.cta.texto} <span className="btn-arrow">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* 5. RODAPÉ CONTEXTUAL */}
      <section className="agenda-context" aria-label="Navegação contextual relacionada à agenda">
        <div className="container">
          <div className="agenda-context-grid">
            {RODAPE_CONTEXTUAL.map((col) => (
              <div key={col.titulo} className="agenda-context-col">
                <h5>{col.titulo}</h5>
                <ul>
                  {col.itens.map((item) => (
                    <li key={item.cmsLink ?? item.texto}>
                      <a href={item.href} data-cms-link={item.cmsLink}>
                        {item.texto}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STICKY MOBILE CTA */}
      <StickyMobileCTA />
    </main>
  );
}
