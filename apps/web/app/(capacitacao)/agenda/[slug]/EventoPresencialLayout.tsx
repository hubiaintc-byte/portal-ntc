import { Fragment } from "react";

import type { EventoPresencial } from "./conteudoEventos";
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";

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
                {c.href ? (
                  <li>
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  </li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
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

              {/* 5.4 CONTEÚDO PROGRAMÁTICO (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.conteudoProgramatico.eyebrow}</p>
                <h2>{evento.conteudoProgramatico.h2}</h2>
                <p>{evento.conteudoProgramatico.intro}</p>
                <div className="program-content">
                  {evento.conteudoProgramatico.itens.map((item, i) => (
                    <div key={i} className="program-content-item">
                      <span className="num">{item.num}</span>
                      <span className="text">{item.texto}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.5 PROGRAMAÇÃO */}
              <article className="event-section fade-in" id="programacao">
                <p className="eyebrow">{evento.programacao.eyebrow}</p>
                <h2>{evento.programacao.h2}</h2>
                <p>{evento.programacao.intro}</p>
                {evento.programacao.dias.map((dia, i) => (
                  <div key={i} className="schedule-day">
                    <div className="schedule-day-head">
                      <span className="date-big">{dia.dateBig}</span>
                      <span className="date-sub">{dia.dateSub}</span>
                      <span className="day-tag">{dia.dayTag}</span>
                    </div>
                    <div className="schedule-rows">
                      {dia.rows.map((row, j) => (
                        <div key={j} className="schedule-row">
                          <span className="time">{row.time}</span>
                          <div className="activity">
                            <strong>{row.titulo}</strong>
                            <span>{row.descricao}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </article>

              {/* 5.6 PALESTRANTES */}
              <article className="event-section fade-in" id="palestrantes">
                <p className="eyebrow">{evento.palestrantes.eyebrow}</p>
                <h2>{evento.palestrantes.h2}</h2>
                <p>{evento.palestrantes.intro}</p>
                <div className="speakers-detailed">
                  {evento.palestrantes.palestrantes.map((p, i) => (
                    <article key={i} className="speaker-detail-card">
                      <div className="speaker-detail-portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.foto} alt={p.nome} loading="lazy" />
                      </div>
                      <div className="speaker-detail-info">
                        <span className="role">{p.role}</span>
                        <h3>{p.nome}</h3>
                        <p className="cred">{p.credenciais}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <p
                  className="placeholder-note"
                  style={{
                    marginTop: "var(--space-3)",
                    textAlign: "left",
                  }}
                >
                  {evento.palestrantes.nota}
                </p>
              </article>

              {/* 5.7 DIFERENCIAIS (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.diferenciais.eyebrow}</p>
                <h2>{evento.diferenciais.h2}</h2>
                <div className="event-differentials">
                  {evento.diferenciais.diferenciais.map((d, i) => (
                    <div key={i} className="event-diff-card">
                      <span className="diff-num">{d.num}</span>
                      <div className="diff-body">
                        <h4>{d.titulo}</h4>
                        <p>{d.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.8 LOCAL (só presencial) */}
              <article className="event-section fade-in" id="local">
                <p className="eyebrow">{evento.local.eyebrow}</p>
                <h2>{evento.local.h2}</h2>
                <div className="venue-grid">
                  <div className="venue-info">
                    <h4>{evento.local.venueInfo.titulo}</h4>
                    <address>
                      {evento.local.venueInfo.enderecoLinhas.map((linha, i) => (
                        <Fragment key={i}>
                          {linha}
                          {i < evento.local.venueInfo.enderecoLinhas.length - 1 && <br />}
                        </Fragment>
                      ))}
                    </address>
                    <p className="venue-meta">{evento.local.venueInfo.meta}</p>
                    <p
                      style={{
                        fontSize: "14.5px",
                        color: "var(--grafite)",
                        lineHeight: 1.55,
                        margin: "6px 0 0",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: evento.local.venueInfo.hospedagemHtml,
                      }}
                    />
                  </div>
                  <div
                    className="venue-map"
                    aria-label={`Mapa institucional · ${evento.local.mapLabel}`}
                  >
                    <div className="pin" />
                    <span className="map-label">{evento.local.pinLabel}</span>
                  </div>
                </div>
              </article>

              {/* 5.9 REPLAY E CERTIFICAÇÃO (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.replayCert.eyebrow}</p>
                <h2>{evento.replayCert.h2}</h2>
                <div className="replay-cert-grid">
                  {evento.replayCert.cards.map((card, i) => (
                    <div key={i} className="replay-cert-card">
                      <span className="icon-line" aria-hidden="true">{card.icone}</span>
                      <h4>{card.titulo}</h4>
                      <p>{card.descricao}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.10 INVESTIMENTO/REGRAS */}
              <article className="event-section fade-in" id="investimento">
                <p className="eyebrow">{evento.investimento.eyebrow}</p>
                <h2 id={evento.investimento.h2Id}>{evento.investimento.h2}</h2>
                <ul className="rules-list">
                  {evento.investimento.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </article>

              {/* 5.11 FAQ */}
              <article className="event-section fade-in" id="faq">
                <p className="eyebrow">{evento.faq.eyebrow}</p>
                <h2>{evento.faq.h2}</h2>
                <div className="faq-list">
                  <FaqEvento itens={evento.faq.faqs} />
                </div>
              </article>

              {/* 5.12 CTA FINAL (sem id) */}
              <article
                className="event-section fade-in"
                style={{ textAlign: "center", paddingTop: "var(--space-6)" }}
              >
                <p className="eyebrow gold">{evento.ctaFinal.eyebrowGold}</p>
                <h2 style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}>
                  {evento.ctaFinal.h2}
                </h2>
                <p
                  style={{
                    maxWidth: "640px",
                    margin: "0 auto var(--space-4)",
                  }}
                >
                  {evento.ctaFinal.paragrafo}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {evento.ctaFinal.ctas.map((cta, i) => (
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

            {/* SIDEBAR */}
            <aside className="event-sidebar" aria-label="Card de inscrição">
              <div className="sidebar-card">
                <div className="sidebar-card-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={evento.sidebar.coverImg} alt={evento.titulo} loading="lazy" />
                  <span className="sidebar-card-status">{evento.sidebar.status}</span>
                </div>
                <div className="sidebar-card-body">
                  <h3>{evento.sidebar.tituloCard}</h3>
                  <div className="sidebar-rows">
                    {evento.sidebar.rows.map((row, i) => (
                      <div
                        key={i}
                        className={`sidebar-row${row.price ? " price" : ""}`}
                      >
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sidebar-includes">
                  <h4>{evento.sidebar.includes.titulo}</h4>
                  <ul>
                    {evento.sidebar.includes.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <CountdownSidebar
                  label={evento.sidebar.countdown.label}
                  dateText={evento.sidebar.countdown.dateText}
                  deadline={evento.sidebar.countdown.deadline}
                  tipo={evento.sidebar.countdown.tipo}
                />
                <div className="sidebar-actions">
                  {evento.sidebar.acoes.map((acao, i) => (
                    <a
                      key={i}
                      className={acao.classe}
                      href={acao.href}
                      data-cms-link={acao.cmsLink}
                    >
                      {acao.texto}
                      {acao.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
                <div className="sidebar-share">
                  <span style={{ color: "var(--prata)", marginRight: "4px" }}>
                    {evento.sidebar.share.label}
                  </span>
                  {evento.sidebar.share.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      data-cms-link={link.cmsLink}
                    >
                      {link.texto}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 6. RELATED EVENTS */}
      <section
        className="related-events-section"
        aria-label={`Outros eventos da vertical ${
          evento.area === "edu" ? "NTC Educação"
            : evento.area === "gov" ? "NTC Gestão Pública"
              : "NTC Saúde"
        }`}
      >
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow gold">{evento.relatedEvents.eyebrowGold}</p>
            <h2>{evento.relatedEvents.h2}</h2>
            <p
              className="section-intro"
              dangerouslySetInnerHTML={{ __html: evento.relatedEvents.intro }}
            />
          </div>
          <div className="related-events-grid fade-in">
            {evento.relatedEvents.cards.map((card, i) => (
              <article
                key={i}
                className="event-secondary-card"
                data-area={card.area}
              >
                <div className="es-cover">
                  <div
                    className="es-cover-img"
                    aria-hidden="true"
                    style={{ backgroundImage: `url('${card.coverImg}')` }}
                  />
                  <div className="es-cover-overlay" />
                  {card.date.tipo === "range" ? (
                    <div className="es-date range">
                      <span className="days">
                        {card.date.daysStart}
                        <span className="dash">{card.date.dash}</span>
                        {card.date.daysEnd}
                      </span>
                      <span className="mon-yr">{card.date.monYr}</span>
                    </div>
                  ) : (
                    <div className="es-date multi">
                      <span className="count">
                        <span className="number">{card.date.number}</span> {card.date.count}
                      </span>
                      <span className="period">{card.date.period}</span>
                    </div>
                  )}
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">{card.program}</p>
                    <h4 className="es-title">{card.titulo}</h4>
                    <p
                      className="es-program-binding"
                      dangerouslySetInnerHTML={{
                        __html: `Integra o programa <strong>${card.programBinding}</strong>`,
                      }}
                    />
                  </div>
                  <div className="es-meta-row">
                    <span
                      className="es-meta"
                      dangerouslySetInnerHTML={{ __html: card.metaHtml }}
                    />
                  </div>
                  <a
                    className={card.cta.classe}
                    href={card.cta.href}
                    data-cms-link={card.cta.cmsLink}
                  >
                    {card.cta.texto}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-2)",
              marginTop: "var(--space-5)",
              flexWrap: "wrap",
            }}
          >
            {evento.relatedEvents.footerCtas.map((cta, i) => (
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
    </main>
  );
}
