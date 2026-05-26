import { Fragment } from "react";

import type { Modulo } from "./conteudoModulos";
import { ModuloSubnav } from "./ModuloSubnav";

/**
 * Layout de módulo de programa em formato online ao vivo — porta literal de
 * 04_Pagina_Evento_EDUTEC_M01_Online_v2.html.
 *
 * Espelho do <main id="main" class="event-page" data-evento> do protótipo,
 * linhas 2496-3225. 16 blocos editoriais + sidebar + related modulos.
 *
 * Header/Footer/InteracoesScroll vêm de (programas)/layout.tsx já existente.
 */
interface ModuloOnlineLayoutProps {
  modulo: Modulo;
}

export function ModuloOnlineLayout({ modulo }: ModuloOnlineLayoutProps) {
  const inscricaoCmsLink = modulo.hero.ctas[0]?.cmsLink ?? "inscricao";
  const folderCta = modulo.hero.ctas[1];

  return (
    <main
      id="main"
      className="event-page"
      data-evento={`${modulo.slugPrograma.toUpperCase()}-${modulo.slugModulo.toUpperCase()}`}
    >
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {modulo.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                {c.href ? (
                  <li>
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  </li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
                {i < modulo.crumb.length - 1 && (
                  <li className="sep" aria-hidden="true">/</li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section
        className="evt-hero"
        aria-label={`Seminário ${modulo.slugPrograma.toUpperCase()} Módulo ${modulo.slugModulo.slice(1).padStart(2, "0")}`}
      >
        <div
          className="evt-hero-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url('${modulo.hero.bgImg}')` }}
        />
        <div className="container evt-hero-content fade-in">
          <div className="evt-hero-tags">
            {modulo.hero.tags.map((tag, i) => (
              <span key={i} className={tag.classe}>{tag.texto}</span>
            ))}
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: modulo.hero.h1 }} />
          <p className="evt-hero-sub">{modulo.hero.sub}</p>
          <div className="evt-hero-program-binding">
            <span>{modulo.hero.programBinding.texto}</span>
            <strong>
              <a
                href={modulo.hero.programBinding.href}
                data-cms-link={modulo.hero.programBinding.cmsLink}
              >
                {modulo.hero.programBinding.nomePrograma}
              </a>
            </strong>
          </div>
          <div className="evt-hero-ctas">
            {modulo.hero.ctas.map((cta, i) => (
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
      <section
        className="evt-meta-bar"
        aria-label="Informações principais do evento"
      >
        <div className="container">
          <div className="evt-meta-bar-grid fade-in">
            {modulo.metas.map((meta, i) => (
              <div key={i} className="evt-meta-item">
                <span className="label">{meta.label}</span>
                <span className="value">{meta.value}</span>
                <span className="value-sub">{meta.valueSub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUBNAV (client) */}
      <ModuloSubnav
        links={modulo.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={modulo.agendaIcs}
      />

      {/* 5. EVT-LAYOUT (2-col grid) */}
      <section className="evt-layout">
        <div className="container">
          <div className="evt-layout-grid">
            <div className="evt-main">
              {/* 5.1 VISÃO GERAL (com why-grid embutido) */}
              <article className="evt-section fade-in" id="visao-geral">
                <p className="eyebrow">{modulo.visaoGeral.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.h2 }} />
                <p className="lede-block">{modulo.visaoGeral.lede}</p>
                {modulo.visaoGeral.paragrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <p
                  className="module-binding-note"
                  dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.moduleBindingNote }}
                />
                <h2
                  style={{ marginTop: "var(--space-6)" }}
                  dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.segundoH2 }}
                />
                <div className="why-grid">
                  {modulo.visaoGeral.whyCards.map((card, i) => (
                    <div key={i} className="why-card">
                      <span className="why-num">{card.num}</span>
                      <div className="why-body">
                        <h4>{card.titulo}</h4>
                        <p>{card.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.2 PÚBLICO (chips + objetivo + highlights) */}
              <article className="evt-section fade-in" id="publico">
                <p className="eyebrow">{modulo.publico.eyebrow}</p>
                <h2>{modulo.publico.h2}</h2>
                <p>{modulo.publico.intro}</p>
                <div className="audience-chips">
                  {modulo.publico.chips.map((chip, i) => (
                    <span key={i}>{chip.texto}</span>
                  ))}
                </div>
                <h2 style={{ marginTop: "var(--space-6)" }}>
                  {modulo.publico.objetivoH2}
                </h2>
                <p>{modulo.publico.objetivoTexto}</p>
                <h2 style={{ marginTop: "var(--space-6)" }}>
                  {modulo.publico.destaquesH2}
                </h2>
                <div className="highlights-list">
                  {modulo.publico.highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <span className="h-num">{h.num}</span>
                      <span
                        className="h-text"
                        dangerouslySetInnerHTML={{ __html: h.textoHtml }}
                      />
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.3 PROGRAMAÇÃO (timeline com 4 nodes) */}
              <article className="evt-section fade-in" id="programacao">
                <p className="eyebrow">{modulo.programacao.eyebrow}</p>
                <h2>{modulo.programacao.h2}</h2>
                <p>{modulo.programacao.intro}</p>
                <div className="schedule-timeline">
                  <div className="schedule-timeline-head">
                    <span
                      className="tt-day"
                      dangerouslySetInnerHTML={{ __html: modulo.programacao.timeline.ttDay }}
                    />
                    <span className="tt-meta">{modulo.programacao.timeline.ttMeta}</span>
                  </div>
                  {modulo.programacao.timeline.nodes.map((node, i) => (
                    <div key={i} className="schedule-node">
                      <div className="sn-time">
                        {node.time}
                        <span className="ttag">{node.ttag}</span>
                      </div>
                      <div className="sn-marker">
                        <span className="sn-num">{node.num}</span>
                      </div>
                      <div className="sn-content">
                        <h4>{node.titulo}</h4>
                        <p
                          className="speaker-line"
                          dangerouslySetInnerHTML={{ __html: node.speakerLine }}
                        />
                        <ul>
                          {node.topicos.map((t, j) => (
                            <li key={j}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* PARTES SEGUINTES — Task 12 */}
            </div>

            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED MODULOS — Task 13 */}
    </main>
  );
}
