import { Fragment } from "react";

import type { EventoPresencial } from "./conteudoEventos";
import { EventoSubnav } from "./EventoSubnav";

/**
 * Layout de evento presencial — porta literal de 03_Pagina_Evento_PROSUS_Brasilia_v3.html.
 *
 * Espelho do <main id="main" class="event-page" data-evento="..."> do protótipo,
 * linhas 2325-2846. 16 blocos editoriais + sidebar + related events.
 *
 * Header/Footer/InteracoesScroll vêm de (capacitacao)/layout.tsx já existente.
 */
interface EventoPresencialLayoutProps {
  evento: EventoPresencial;
}

export function EventoPresencialLayout({ evento }: EventoPresencialLayoutProps) {
  const inscricaoCmsLink = evento.hero.ctas[0]?.cmsLink ?? "inscricao";
  const folderCta = evento.hero.ctas[1];

  return (
    <main id="main" className="event-page" data-evento={evento.slug}>
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {evento.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                <li>
                  {c.href ? (
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  ) : (
                    <span className="current">{c.texto}</span>
                  )}
                </li>
                {i < evento.crumb.length - 1 && (
                  <li className="sep" aria-hidden="true">/</li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section
        className="event-hero"
        aria-label={`${evento.titulo} ${evento.dataEvento}`}
      >
        <div className="event-hero-bg" aria-hidden="true" />
        <div className="container event-hero-content fade-in">
          <div className="event-hero-tags">
            {evento.hero.tags.map((tag, i) => (
              <span key={i} className={tag.classe}>{tag.texto}</span>
            ))}
          </div>
          <h1>{evento.hero.h1}</h1>
          <p className="event-hero-sub">{evento.hero.sub}</p>
          <div className="event-hero-program-binding">
            <span>{evento.hero.programBinding.texto}</span>
            <strong>
              <a
                href={evento.hero.programBinding.href}
                data-cms-link={evento.hero.programBinding.cmsLink}
              >
                {evento.hero.programBinding.nomePrograma}
              </a>
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "24px",
            }}
          >
            {evento.hero.ctas.map((cta, i) => (
              <a
                key={i}
                className={cta.classe}
                href={cta.href}
                data-cms-link={cta.cmsLink}
              >
                {cta.texto}
                {cta.arrow && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. META-BAR */}
      <section className="event-meta-bar" aria-label="Informações principais do evento">
        <div className="container">
          <div className="event-meta-bar-grid fade-in">
            {evento.metas.map((meta, i) => (
              <div key={i} className="event-meta-item">
                <span className="label">{meta.label}</span>
                <span className="value">{meta.value}</span>
                <span className="value-sub">{meta.valueSub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUBNAV (client) */}
      <EventoSubnav
        links={evento.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={evento.agendaIcs}
      />

      {/* 5. EVENT-LAYOUT (2-col grid) */}
      <section className="event-layout">
        <div className="container">
          <div className="event-layout-grid">
            <div className="event-main-content">
              {/* 5.1 VISÃO GERAL */}
              <article className="event-section fade-in" id="visao-geral">
                <p className="eyebrow">{evento.visaoGeral.eyebrow}</p>
                <h2>{evento.visaoGeral.h2}</h2>
                <p className="lede-block">{evento.visaoGeral.lede}</p>
                {evento.visaoGeral.paragrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </article>

              {/* 5.2 PÚBLICO */}
              <article className="event-section fade-in" id="publico">
                <p className="eyebrow">{evento.publico.eyebrow}</p>
                <h2>{evento.publico.h2}</h2>
                <p>{evento.publico.intro}</p>
                <div className="audience-chips">
                  {evento.publico.chips.map((chip, i) => (
                    <span key={i}>{chip.texto}</span>
                  ))}
                </div>
              </article>

              {/* 5.3 OBJETIVOS (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.objetivos.eyebrow}</p>
                <h2>{evento.objetivos.h2}</h2>
                <ol className="objective-list">
                  {evento.objetivos.objetivos.map((o, i) => (
                    <li key={i}>{o.texto}</li>
                  ))}
                </ol>
              </article>

              {/* PARTES SEGUINTES — Task 12 */}
            </div>

            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED EVENTS — Task 13 */}
    </main>
  );
}
