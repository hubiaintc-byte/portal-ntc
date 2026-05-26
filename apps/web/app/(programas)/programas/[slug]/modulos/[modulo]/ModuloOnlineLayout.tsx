import { Fragment } from "react";

import type { Modulo } from "./conteudoModulos";
import { ModuloFaq } from "./ModuloFaq";
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

              {/* 5.4 PALESTRANTES */}
              <article className="evt-section fade-in" id="palestrantes">
                <p className="eyebrow">{modulo.palestrantes.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.palestrantes.h2 }} />
                <div className="speakers-detailed">
                  {modulo.palestrantes.palestrantes.map((p, i) => (
                    <article key={i} className="speaker-detail-card">
                      <div className="speaker-detail-portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.foto} alt={p.nome} loading="lazy" />
                        <span className="speaker-role-tag">{p.roleTag}</span>
                      </div>
                      <div className="speaker-detail-info">
                        <h3>{p.nome}</h3>
                        <p className="credentials">{p.credentials}</p>
                        <p className="bio">{p.bio}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="placeholder-note">{modulo.palestrantes.nota}</p>
              </article>

              {/* 5.5 EVENTON (plataforma) */}
              <article className="evt-section fade-in" id="eventon">
                <p className="eyebrow">{modulo.eventon.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.eventon.h2 }} />
                <p>{modulo.eventon.intro}</p>
                <div className="eventon-section">
                  <div className="eventon-head">
                    <div className="eventon-mark">
                      <span
                        className="name"
                        dangerouslySetInnerHTML={{ __html: modulo.eventon.markName }}
                      />
                      <span className="tag">{modulo.eventon.markTag}</span>
                    </div>
                    <div className="eventon-stats">
                      {modulo.eventon.stats.map((stat, i) => (
                        <div key={i} className="eventon-stat">
                          <span className="n">{stat.n}</span>
                          <span className="l">{stat.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="eventon-features">
                    {modulo.eventon.features.map((feat, i) => (
                      <div key={i} className="eventon-feat">
                        <span className="feat-icon" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dangerouslySetInnerHTML={{ __html: feat.iconSvg }}
                          />
                        </span>
                        <div className="feat-body">
                          <h4>{feat.titulo}</h4>
                          <p>{feat.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* 5.6 INVESTIMENTO */}
              <article className="evt-section fade-in" id="investimento">
                <p className="eyebrow">{modulo.investimento.eyebrow}</p>
                <h2>{modulo.investimento.h2}</h2>
                <div className="investment-block">
                  <div className="invest-price">
                    <span className="label">{modulo.investimento.block.priceLabel}</span>
                    <span className="value">
                      <span className="cur">{modulo.investimento.block.priceCur}</span>
                      <span className="amt">{modulo.investimento.block.priceAmt}</span>
                    </span>
                    <span className="sub">{modulo.investimento.block.priceSub}</span>
                  </div>
                  <div className="invest-includes">
                    <h4>{modulo.investimento.block.includesTitulo}</h4>
                    <ul>
                      {modulo.investimento.block.includesItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="invest-modes">
                  {modulo.investimento.modes.map((mode, i) => (
                    <div
                      key={i}
                      className={`invest-mode${mode.featured ? " featured" : ""}`}
                    >
                      <span className="tag">{mode.tag}</span>
                      <h4>{mode.titulo}</h4>
                      <p>{mode.descricao}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.7 REGRAS */}
              <article className="evt-section fade-in" id="regras">
                <p className="eyebrow">{modulo.regras.eyebrow}</p>
                <h2>{modulo.regras.h2}</h2>
                <div className="rules-list">
                  <ul>
                    {modulo.regras.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* 5.8 FAQ */}
              <article className="evt-section fade-in" id="faq">
                <p className="eyebrow">{modulo.faq.eyebrow}</p>
                <h2>{modulo.faq.h2}</h2>
                <div className="faq-list">
                  <ModuloFaq itens={modulo.faq.faqs} />
                </div>
              </article>

              {/* 5.9 CTA FINAL (sem id) */}
              <article
                className="evt-section fade-in"
                style={{ textAlign: "center", paddingTop: "var(--space-6)" }}
              >
                <p className="eyebrow gold">{modulo.ctaFinal.eyebrowGold}</p>
                <h2
                  style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}
                  dangerouslySetInnerHTML={{ __html: modulo.ctaFinal.h2 }}
                />
                <p
                  style={{
                    maxWidth: "640px",
                    margin: "0 auto var(--space-4)",
                  }}
                >
                  {modulo.ctaFinal.paragrafo}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {modulo.ctaFinal.ctas.map((cta, i) => (
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
              </article>
            </div>

            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED MODULOS — Task 13 */}
    </main>
  );
}
