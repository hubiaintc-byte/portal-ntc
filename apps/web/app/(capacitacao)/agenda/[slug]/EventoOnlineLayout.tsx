import { Fragment } from "react";

import type { EventoOnline } from "./conteudoEventos";
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";

/**
 * Layout de evento ONLINE — porta de feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html.
 * Espelha o <main class="event-page"> do protótipo (classes evt-* / sb-*). Lê os
 * campos *Online do EventoOnline. Header/Footer/InteracoesScroll vêm de
 * (capacitacao)/layout.tsx.
 */
interface EventoOnlineLayoutProps {
  evento: EventoOnline;
}

export function EventoOnlineLayout({ evento }: EventoOnlineLayoutProps) {
  const hero = evento.heroOnline;
  const folderCta = hero?.ctas[1];
  const inscricaoCmsLink = hero?.ctas[0]?.cmsLink ?? "inscricao";

  return (
    <main id="main" className="event-page" data-evento="EDUTEC-M01">
      {/* data-evento é a CHAVE do acento cromático no CSS (.event-page[data-evento='EDUTEC-M01']),
          não o slug (edutec-m01-2026). Manter literal para o acento #1F5060 aplicar. */}
      {/* BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {evento.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                {c.href ? (
                  <li><a href={c.href} data-cms-link={c.cmsLink}>{c.texto}</a></li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
                {i < evento.crumb.length - 1 && <li className="sep" aria-hidden="true">/</li>}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* HERO */}
      {hero && (
        <section className="evt-hero" aria-label={`${evento.titulo} ${evento.dataEvento}`}>
          <div
            className="evt-hero-bg"
            style={{
              backgroundImage: `url('${hero.bgUrl ?? "/img/fotos/_optimized/area-educacao.1920.webp"}')`,
            }}
            aria-hidden="true"
          />
          <div className="container evt-hero-content fade-in">
            <div className="evt-hero-tags">
              {hero.tags.map((t, i) => <span key={i} className={t.classe}>{t.texto}</span>)}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: hero.h1Html }} />
            <p className="evt-hero-sub">{hero.sub}</p>
            <div className="evt-hero-program-binding">
              <span>{hero.programBinding.texto}</span>
              <strong>
                <a href={hero.programBinding.href} data-cms-link={hero.programBinding.cmsLink}>
                  {hero.programBinding.nomePrograma}
                </a>
              </strong>
            </div>
            <div className="evt-hero-ctas">
              {hero.ctas
                .filter((cta) => {
                  // CTA "Baixar folder" só aparece quando há PDF real (href != placeholder).
                  const ehFolder = /folder/i.test(cta.cmsLink ?? "");
                  return !ehFolder || (cta.href !== "#" && cta.href !== "");
                })
                .map((cta, i) => (
                  <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                    {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* META-BAR */}
      {evento.metasOnline && evento.metasOnline.length > 0 && (
        <section className="evt-meta-bar" aria-label="Informações principais do evento">
          <div className="container">
            <div className="evt-meta-bar-grid fade-in">
              {evento.metasOnline.map((m, i) => (
                <div key={i} className="evt-meta-item">
                  <span className="label">{m.label}</span>
                  <span className="value">{m.value}</span>
                  <span className="value-sub">{m.valueSub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SUBNAV */}
      <EventoSubnav
        links={evento.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={evento.agendaIcs}
      />

      {/* LAYOUT 2 COLUNAS */}
      <section className="evt-layout">
        <div className="container">
          <div className="evt-layout-grid">
            <div className="evt-main">

              {/* VISÃO GERAL + 6 RAZÕES */}
              {evento.visaoGeralOnline && (
                <article className="evt-section fade-in" id="visao-geral">
                  <p className="eyebrow">{evento.visaoGeralOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.h2Html }} />
                  <p className="lede-block">{evento.visaoGeralOnline.lede}</p>
                  {evento.visaoGeralOnline.paragrafosHtml.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                  <div className="module-binding-note" dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.moduleBindingHtml }} />
                  <h2
                    style={{ marginTop: "var(--space-5)" }}
                    dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.razoesTituloHtml }}
                  />
                  <div className="why-grid">
                    {evento.visaoGeralOnline.razoes.map((r, i) => (
                      <div key={i} className="why-card">
                        <span className="why-num">{r.num}</span>
                        <div className="why-body">
                          <h4>{r.titulo}</h4>
                          <p>{r.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* PÚBLICO + OBJETIVO + DESTAQUES */}
              {evento.publicoOnline && (
                <article className="evt-section fade-in" id="publico">
                  <p className="eyebrow">{evento.publicoOnline.eyebrow}</p>
                  <h2>{evento.publicoOnline.h2}</h2>
                  <p>{evento.publicoOnline.intro}</p>
                  <div className="audience-chips">
                    {evento.publicoOnline.chips.map((c, i) => <span key={i}>{c}</span>)}
                  </div>
                  <h2 style={{ marginTop: "var(--space-5)" }}>{evento.publicoOnline.objetivoTitulo}</h2>
                  <p>{evento.publicoOnline.objetivoTexto}</p>
                  <h2 style={{ marginTop: "var(--space-5)" }}>{evento.publicoOnline.destaquesTitulo}</h2>
                  <div className="highlights-list">
                    {evento.publicoOnline.destaques.map((d, i) => (
                      <div key={i} className="highlight-item">
                        <span className="h-num">{d.num}</span>
                        <span className="h-text" dangerouslySetInnerHTML={{ __html: d.html }} />
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* PROGRAMAÇÃO (timeline) */}
              {evento.programacaoOnline && (
                <article className="evt-section fade-in" id="programacao">
                  <p className="eyebrow">{evento.programacaoOnline.eyebrow}</p>
                  <h2>{evento.programacaoOnline.h2}</h2>
                  <p>{evento.programacaoOnline.intro}</p>
                  <div className="schedule-timeline">
                    <div className="schedule-timeline-head">
                      <span className="tt-day" dangerouslySetInnerHTML={{ __html: evento.programacaoOnline.headDayHtml }} />
                      <span className="tt-meta">{evento.programacaoOnline.headMeta}</span>
                    </div>
                    {evento.programacaoOnline.nodes.map((n, i) => (
                      <div key={i} className="schedule-node">
                        <div className="sn-time">
                          {n.time}
                          <span className="ttag">{n.ttag}</span>
                        </div>
                        <div className="sn-marker"><div className="sn-num">{n.num}</div></div>
                        <div className="sn-content">
                          <h4>{n.titulo}</h4>
                          <p className="speaker-line" dangerouslySetInnerHTML={{ __html: n.speakerLineHtml }} />
                          <ul>{n.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* QUESTÕES FORMATIVAS (extra, do PDF) */}
              {evento.questoesOnline && (
                <article className="evt-section fade-in" id="questoes">
                  <p className="eyebrow">{evento.questoesOnline.eyebrow}</p>
                  <h2>{evento.questoesOnline.h2}</h2>
                  <p>{evento.questoesOnline.intro}</p>
                  {evento.questoesOnline.grupos.map((g, i) => (
                    <div key={i} style={{ marginTop: "var(--space-4)" }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--oxford)", margin: "0 0 8px" }}>
                        {g.sessao} · {g.titulo} <span style={{ fontFamily: "var(--font-cond)", fontSize: "12px", color: "var(--grafite)" }}>{g.palestrante}</span>
                      </h4>
                      <div className="highlights-list">
                        {g.questoes.map((q, j) => (
                          <div key={j} className="highlight-item">
                            <span className="h-num">{q.numero}</span>
                            {/* questões renderizam em peso 400 — mais leve que os destaques (.h-text é 500) */}
                            <span className="h-text" style={{ fontWeight: 400 }}>{q.pergunta}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="module-binding-note" style={{ marginTop: "var(--space-4)" }}>
                    <strong>{evento.questoesOnline.naPratica.titulo}:</strong> {evento.questoesOnline.naPratica.itens.join(" · ")}
                  </div>
                </article>
              )}

              {/* PALESTRANTES */}
              {evento.palestrantesOnline && (
                <article className="evt-section fade-in" id="palestrantes">
                  <p className="eyebrow">{evento.palestrantesOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.palestrantesOnline.h2Html }} />
                  <p>{evento.palestrantesOnline.intro}</p>
                  <div className="speakers-detailed">
                    {evento.palestrantesOnline.palestrantes.map((p, i) => (
                      <article key={i} className="speaker-detail-card">
                        <div className="speaker-detail-portrait">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.foto} alt={`${p.nome} · ${p.roleTag}`} loading="lazy" />
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
                  <p className="placeholder-note" style={{ textAlign: "left" }}>{evento.palestrantesOnline.nota}</p>
                </article>
              )}

              {/* EVENTON */}
              {evento.eventonOnline && (
                <article className="evt-section fade-in" id="eventon">
                  <p className="eyebrow">{evento.eventonOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.eventonOnline.h2Html }} />
                  <p>{evento.eventonOnline.intro}</p>
                  <div className="eventon-section">
                    <div className="eventon-head">
                      <div className="eventon-mark">
                        <span className="name" dangerouslySetInnerHTML={{ __html: evento.eventonOnline.markNameHtml }} />
                        <span className="tag">{evento.eventonOnline.markTag}</span>
                      </div>
                      <div className="eventon-stats">
                        {evento.eventonOnline.stats.map((s, i) => (
                          <div key={i} className="eventon-stat">
                            <div className="n">{s.n}</div>
                            <div className="l">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="eventon-features">
                      {evento.eventonOnline.feats.map((f, i) => (
                        <div key={i} className="eventon-feat">
                          <div className="feat-icon">
                            <svg
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                              dangerouslySetInnerHTML={{ __html: f.iconeSvgInner }}
                            />
                          </div>
                          <div className="feat-body">
                            <h4>{f.titulo}</h4>
                            <p>{f.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )}

              {/* INVESTIMENTO */}
              {evento.investimentoOnline && (
                <article className="evt-section fade-in" id="investimento">
                  <p className="eyebrow">{evento.investimentoOnline.eyebrow}</p>
                  <h2>{evento.investimentoOnline.h2}</h2>
                  <p>{evento.investimentoOnline.intro}</p>
                  <div className="investment-block">
                    <div className="invest-price">
                      <span className="label">{evento.investimentoOnline.priceLabel}</span>
                      <span className="value" dangerouslySetInnerHTML={{ __html: evento.investimentoOnline.priceValueHtml }} />
                      <span className="sub">{evento.investimentoOnline.priceSub}</span>
                    </div>
                    <div className="invest-includes">
                      <h4>{evento.investimentoOnline.includesTitulo}</h4>
                      <ul>{evento.investimentoOnline.includes.map((it, i) => <li key={i}>{it}</li>)}</ul>
                    </div>
                  </div>
                  <div className="invest-modes">
                    {evento.investimentoOnline.modes.map((m, i) => (
                      <div key={i} className={`invest-mode${m.featured ? " featured" : ""}`}>
                        <div className="tag">{m.tag}</div>
                        <h4>{m.titulo}</h4>
                        <p>{m.descricao}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* REGRAS */}
              {evento.regrasOnline && (
                <article className="evt-section fade-in" id="regras">
                  <p className="eyebrow">{evento.regrasOnline.eyebrow}</p>
                  <h2>{evento.regrasOnline.h2}</h2>
                  <ul className="rules-list">
                    {evento.regrasOnline.rules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </article>
              )}

              {/* FAQ */}
              {evento.faq.faqs.length > 0 && (
                <article className="evt-section fade-in" id="faq">
                  <p className="eyebrow">{evento.faq.eyebrow}</p>
                  <h2>{evento.faq.h2}</h2>
                  <div className="faq-list">
                    <FaqEvento itens={evento.faq.faqs} />
                  </div>
                </article>
              )}

              {/* CTA FINAL */}
              {evento.ctaFinalOnline && (
                <article className="evt-section fade-in" style={{ textAlign: "center", paddingTop: "var(--space-6)" }}>
                  <p className="eyebrow gold">{evento.ctaFinalOnline.eyebrowGold}</p>
                  <h2
                    style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}
                    dangerouslySetInnerHTML={{ __html: evento.ctaFinalOnline.h2Html }}
                  />
                  <p style={{ maxWidth: "640px", margin: "0 auto var(--space-4)" }}>{evento.ctaFinalOnline.paragrafo}</p>
                  <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                    {evento.ctaFinalOnline.ctas.map((cta, i) => (
                      <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                        {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                      </a>
                    ))}
                  </div>
                </article>
              )}
            </div>

            {/* SIDEBAR */}
            {evento.sidebarOnline && (
              <aside className="evt-sidebar" aria-label="Card de inscrição">
                <div className="sb-card">
                  <div className="sb-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={evento.sidebarOnline.coverImg} alt={evento.titulo} loading="lazy" />
                    <span className="sb-status">{evento.sidebarOnline.status}</span>
                    <span className="sb-cover-eventon" dangerouslySetInnerHTML={{ __html: evento.sidebarOnline.coverEventonHtml }} />
                  </div>
                  <div className="sb-body">
                    <p className="sb-title-tag">{evento.sidebarOnline.tituloTag}</p>
                    <div className="sb-rows">
                      {evento.sidebarOnline.rows.map((row, i) => (
                        <div key={i} className={`sb-row${row.price ? " price" : ""}`}>
                          <span>{row.label}</span><strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sb-includes">
                    <h4>{evento.sidebarOnline.includes.titulo}</h4>
                    <ul>{evento.sidebarOnline.includes.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </div>
                  <CountdownSidebar
                    label={evento.sidebarOnline.countdown.label}
                    dateText={evento.sidebarOnline.countdown.dateText}
                    deadline={evento.sidebarOnline.countdown.deadline}
                    tipo={evento.sidebarOnline.countdown.tipo}
                  />
                  <div className="sb-actions">
                    {evento.sidebarOnline.acoes.map((a, i) => (
                      <a key={i} className={a.classe} href={a.href} data-cms-link={a.cmsLink}>
                        {a.texto}{a.arrow && <span className="btn-arrow"> →</span>}
                      </a>
                    ))}
                  </div>
                  <div className="sb-share">
                    <span style={{ color: "var(--prata)", marginRight: "4px" }}>{evento.sidebarOnline.share.label}</span>
                    {evento.sidebarOnline.share.links.map((l, i) => (
                      <a key={i} href={l.href} data-cms-link={l.cmsLink}>{l.texto}</a>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* RELATED EVENTS */}
      {evento.relatedOnline && evento.relatedOnline.cards.length > 0 && (
        <section className="related-events-section" aria-label="Outros eventos da trilha EDUTEC e da NTC Educação">
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{evento.relatedOnline.eyebrowGold}</p>
              <h2>{evento.relatedOnline.h2}</h2>
              <p className="section-intro" dangerouslySetInnerHTML={{ __html: evento.relatedOnline.introHtml }} />
            </div>
            <div className="related-events-grid fade-in">
              {evento.relatedOnline.cards.map((card, i) => (
                <article key={i} className="event-secondary-card" data-area={card.area}>
                  <div className="es-cover">
                    <div className="es-cover-img" aria-hidden="true" style={{ backgroundImage: `url('${card.coverImg}')` }} />
                    <div className="es-cover-overlay" />
                    {card.date.tipo === "range" ? (
                      <div className="es-date range">
                        <span className="days">{card.date.daysStart}<span className="dash">{card.date.dash}</span>{card.date.daysEnd}</span>
                        <span className="mon-yr">{card.date.monYr}</span>
                      </div>
                    ) : card.date.tipo === "single" ? (
                      <div className="es-date single">
                        <span className="day">{card.date.day}</span>
                        <span className="mon-yr">{card.date.monYr}</span>
                      </div>
                    ) : (
                      <div className="es-date multi">
                        <span className="count"><span className="number">{card.date.number}</span> {card.date.count}</span>
                        <span className="period">{card.date.period}</span>
                      </div>
                    )}
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">{card.program}</p>
                      <h4 className="es-title">{card.titulo}</h4>
                      <p className="es-program-binding" dangerouslySetInnerHTML={{ __html: `Integra o programa <strong>${card.programBinding}</strong>` }} />
                    </div>
                    <div className="es-meta-row">
                      <span className="es-meta" dangerouslySetInnerHTML={{ __html: card.metaHtml }} />
                    </div>
                    <a className={card.cta.classe} href={card.cta.href} data-cms-link={card.cta.cmsLink}>{card.cta.texto}</a>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)", marginTop: "var(--space-5)", flexWrap: "wrap" }}>
              {evento.relatedOnline.footerCtas.map((cta, i) => (
                <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                  {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
