import type { Metadata } from "next";
import { Fragment } from "react";

import {
  cardsVerticaisCapacitacao,
  caminhosCapacitacao,
  caminhosEyebrow,
  caminhosH2,
  caminhosIntro,
  ctaFinalBtns,
  ctaFinalEyebrow,
  ctaFinalH2,
  ctaFinalP,
  ctaFinalVerticais,
  curadoriaCtas,
  curadoriaEyebrow,
  curadoriaH2,
  curadoriaP1,
  curadoriaP2,
  curadoriaPills,
  eixosCapacitacao,
  eixosEyebrow,
  eixosH2,
  eixosImpact,
  eixosP1,
  eventonCtas,
  eventonEyebrow,
  eventonFeatures,
  eventonH2,
  eventonP1,
  eventonP2,
  eventosCapacitacao,
  faqCapacitacao,
  faqEyebrow,
  faqH2,
  faqIntro,
  filtrosProximos,
  formatosCapacitacao,
  formatosEyebrow,
  formatosH2,
  formatosIntro,
  heroCrumbs,
  heroEyebrow,
  heroH1,
  heroQuicklinks,
  heroSub,
  manifestoEyebrow,
  manifestoH2,
  manifestoLede,
  manifestoMarker,
  manifestoP,
  metricasCapacitacao,
  modalidadesCapacitacao,
  modalidadesEyebrow,
  modalidadesH2,
  modalidadesIntro,
  pilaresCapacitacao,
  pilaresEyebrow,
  pilaresH2,
  pilaresIntro,
  proximosEyebrow,
  proximosFooterLink,
  proximosH2,
  proximosIntro,
  proximosSelo,
  subnavLabel,
  subnavLinks,
  verticaisEyebrow,
  verticaisH2,
  verticaisIntro,
  vsBlocks,
} from "./conteudoCapacitacao";
import { FaqCapacitacao } from "./FaqCapacitacao";
import { ProximosEventosFiltro } from "./ProximosEventosFiltro";
import { StickyCtaCapacitacao } from "./StickyCtaCapacitacao";
import { SubnavStickyCapacitacao } from "./SubnavStickyCapacitacao";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Capacitação institucional · Grupo NTC",
  description:
    "Capacitação institucional do Grupo NTC — programas, eventos e jornadas formativas para órgãos públicos, redes de ensino, sistemas de saúde e equipes de gestão. Curadoria científica, excelência docente, tecnologia própria EventOn e segurança institucional.",
};

/**
 * Página /capacitacao — porta literal de 27_Pagina_Capacitacao_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo, linhas 1619-2403):
 *   1.  Hero institucional slim.
 *   2.  Faixa de métricas (5).
 *   3.  <SubnavStickyCapacitacao /> com 6 âncoras.
 *   4.  Manifesto editorial.
 *   5.  3 pilares.
 *   6.  3 verticais formativas (com 3-4 programas linkados cada).
 *   7.  4 modalidades.
 *   8.  Capacitação vs Soluções (2 blocos).
 *   9.  3 formatos.
 *   10. 5 eixos transversais (com aside lateral).
 *   11. Curadoria científica.
 *   12. EventOn (com 4 features).
 *   13. <ProximosEventosFiltro /> com 6 cards filtráveis.
 *   14. 2 caminhos (participante + instituição).
 *   15. <FaqCapacitacao /> com 8 perguntas.
 *   16. CTA final (3 botões + 3 cards-ponte).
 *
 * Fora do <main>: <StickyCtaCapacitacao /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm de (capacitacao)/layout.tsx já existente.
 */
export default function CapacitacaoPage() {
  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Capacitação">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Trilha de navegação">
              {heroCrumbs.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < heroCrumbs.length - 1 && <span className="sep" aria-hidden="true" />}
                </Fragment>
              ))}
            </nav>
            <p className="eyebrow light">{heroEyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: heroH1 }} />
            <p className="hero-page-sub">{heroSub}</p>
            <div className="hero-quicklinks" aria-label="Atalhos rápidos">
              {heroQuicklinks.map((q) => (
                <a
                  key={q.href}
                  href={q.href}
                  data-track={q.track}
                  data-cms-link={q.cmsLink}
                >
                  {q.texto}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 2. FAIXA DE MÉTRICAS */}
        <section
          className="cap-metrics"
          aria-label="Métricas institucionais da capacitação NTC"
        >
          <div className="container">
            <div className="cap-metrics-grid fade-in">
              {metricasCapacitacao.map((m) => (
                <div key={m.lbl} className="cap-metric">
                  <span
                    className={`cm-num${m.numClasseExtra ? ` ${m.numClasseExtra}` : ""}`}
                  >
                    {m.num}
                  </span>
                  <span className="cm-lbl">{m.lbl}</span>
                  <span className="cm-detail">{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SUBNAV STICKY */}
        <SubnavStickyCapacitacao label={subnavLabel} links={subnavLinks} />

        {/* 4. MANIFESTO EDITORIAL */}
        <section
          className="cap-manifesto"
          aria-label="Manifesto editorial da Capacitação NTC"
        >
          <div className="container">
            <div className="cap-manifesto-inner fade-in">
              <p className="eyebrow gold">{manifestoEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: manifestoH2 }} />
              <p className="lede">{manifestoLede}</p>
              <p dangerouslySetInnerHTML={{ __html: manifestoP }} />
              <div className="cap-manifesto-marker">{manifestoMarker}</div>
            </div>
          </div>
        </section>

        {/* 5. PILARES (3) */}
        <section
          className="cap-pilares"
          aria-label="Pilares editoriais da formação NTC"
        >
          <div className="container cap-pilares-inner">
            <div className="cap-pilares-head fade-in">
              <p className="eyebrow gold">{pilaresEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: pilaresH2 }} />
              <p>{pilaresIntro}</p>
            </div>
            <div className="cap-pilares-grid fade-in">
              {pilaresCapacitacao.map((p) => (
                <article key={p.num} className="cap-pilar">
                  <span className="cap-pilar-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="cap-pilar-rule">{p.rule}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 3 VERTICAIS FORMATIVAS */}
        <section
          className="cap-verticais"
          id="verticais"
          aria-label="Verticais formativas do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{verticaisEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: verticaisH2 }} />
              <p className="intro">{verticaisIntro}</p>
            </div>
            <div className="cap-verticais-grid fade-in">
              {cardsVerticaisCapacitacao.map((v) => (
                <article key={v.vert} className="cap-vert-card" data-vert={v.vert}>
                  <div className="cap-vert-band" aria-hidden="true">
                    <span className="cap-vert-band-mark">{v.bandMark}</span>
                    <span className="cap-vert-band-num">{v.bandNum}</span>
                  </div>
                  <div className="cap-vert-body">
                    <h3>{v.titulo}</h3>
                    <p>{v.descricao}</p>
                    <span className="cap-vert-count">{v.contagem}</span>
                    <ul
                      className="cap-vert-list"
                      aria-label={
                        v.vert === "edu"
                          ? `Programas da ${v.bandMark} em destaque`
                          : `Programas da ${v.bandMark}`
                      }
                    >
                      {v.programas.map((p) => (
                        <li key={p.href}>
                          <a
                            href={p.href}
                            data-cms-link={p.cmsLink}
                            dangerouslySetInnerHTML={{ __html: p.textoHtml }}
                          />
                        </li>
                      ))}
                    </ul>
                    <a
                      className={v.link.classe}
                      href={v.link.href}
                      data-cms-link={v.link.cmsLink}
                      data-track={v.link.track}
                    >
                      {v.link.texto}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 4 MODALIDADES */}
        <section
          className="cap-modalidades"
          id="modalidades"
          aria-label="Modalidades de capacitação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{modalidadesEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: modalidadesH2 }} />
              <p className="intro">{modalidadesIntro}</p>
            </div>
            <div className="cap-modalidades-grid fade-in">
              {modalidadesCapacitacao.map((m) => (
                <article key={m.num} className="cap-modalidade-card">
                  <span className="cap-mod-num">{m.num}</span>
                  <h3>{m.titulo}</h3>
                  <p>{m.descricao}</p>
                  <ul className="cap-mod-list">
                    {m.lista.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div
                    className="cap-mod-aside"
                    dangerouslySetInnerHTML={{ __html: m.contratacaoHtml }}
                  />
                  <a
                    className={m.link.classe}
                    href={m.link.href}
                    data-cms-link={m.link.cmsLink}
                    data-track={m.link.track}
                  >
                    {m.link.texto}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CAPACITAÇÃO VS SOLUÇÕES */}
        <section
          className="cap-vs-solucoes"
          aria-label="Diferença entre Capacitação e Soluções"
        >
          <div className="container">
            <div className="cap-vs-solucoes-inner fade-in">
              <div className="cap-vs-solucoes-grid">
                {vsBlocks.map((b) => (
                  <div key={b.tipo} className="cap-vs-cell" data-tipo={b.tipo}>
                    <p className="eyebrow">{b.eyebrow}</p>
                    <h3>{b.titulo}</h3>
                    <p dangerouslySetInnerHTML={{ __html: b.paragrafoHtml }} />
                    <a
                      className={b.link.classe}
                      href={b.link.href}
                      data-cms-link={b.link.cmsLink}
                      data-track={b.link.track}
                    >
                      {b.link.texto}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. 3 FORMATOS */}
        <section
          className="cap-formatos"
          id="formatos"
          aria-label="Formatos de entrega das formações NTC"
        >
          <div className="container cap-formatos-inner">
            <div className="section-head fade-in">
              <p className="eyebrow light">{formatosEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: formatosH2 }} />
              <p className="intro">{formatosIntro}</p>
            </div>
            <div className="cap-formatos-grid fade-in">
              {formatosCapacitacao.map((f) => (
                <article key={f.num} className="cap-formato-card">
                  <div className="cap-formato-numeral" aria-hidden="true">
                    <span className="num">{f.num}</span>
                    <span className="num-rule" />
                    <span className="num-tag">Formato</span>
                  </div>
                  <h3>{f.titulo}</h3>
                  <p>{f.descricao}</p>
                  <span className="cap-formato-tag">{f.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 10. 5 EIXOS TRANSVERSAIS */}
        <section
          className="cap-eixos"
          id="eixos"
          aria-label="Eixos formativos transversais NTC"
        >
          <div className="container">
            <div className="cap-eixos-layout fade-in">
              <aside className="cap-eixos-aside">
                <p className="eyebrow">{eixosEyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: eixosH2 }} />
                <p>{eixosP1}</p>
                <p className="impact">{eixosImpact}</p>
              </aside>
              <ol className="cap-eixos-list" aria-label="Lista de eixos formativos">
                {eixosCapacitacao.map((e) => (
                  <li key={e.num} className="cap-eixo-item">
                    <span className="cap-eixo-num-edit">{e.num}</span>
                    <div>
                      <h3>{e.titulo}</h3>
                      <p>{e.descricao}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 11. CURADORIA CIENTÍFICA */}
        <section
          className="cap-curadoria"
          id="curadoria"
          aria-label="Curadoria científica do Grupo NTC"
        >
          <div className="container">
            <div className="cap-curadoria-grid fade-in">
              <div className="cap-curadoria-text">
                <p className="eyebrow">{curadoriaEyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: curadoriaH2 }} />
                <p>{curadoriaP1}</p>
                <p>{curadoriaP2}</p>
                <div className="cap-curadoria-pills" aria-label="Áreas de curadoria">
                  {curadoriaPills.map((pill) => (
                    <span key={pill} className="cap-curadoria-pill">{pill}</span>
                  ))}
                </div>
                <div className="cap-curadoria-cta">
                  {curadoriaCtas.map((cta) => (
                    <a
                      key={cta.href}
                      className={cta.classe}
                      href={cta.href}
                      data-cms-link={cta.cmsLink}
                      data-track={cta.track}
                    >
                      {cta.texto}
                      {cta.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
              </div>
              <div className="cap-curadoria-figura" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* 12. EVENTON */}
        <section
          className="cap-eventon"
          id="eventon"
          aria-label="Plataforma EventOn do Grupo NTC"
        >
          <div className="container cap-eventon-inner">
            <div className="cap-eventon-grid fade-in">
              <div className="cap-eventon-text">
                <p className="eyebrow light">{eventonEyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: eventonH2 }} />
                <p dangerouslySetInnerHTML={{ __html: eventonP1 }} />
                <p dangerouslySetInnerHTML={{ __html: eventonP2 }} />
                <div className="cap-eventon-cta">
                  {eventonCtas.map((cta) => (
                    <a
                      key={`${cta.href}-${cta.cmsLink}`}
                      className={cta.classe}
                      href={cta.href}
                      data-cms-link={cta.cmsLink}
                      data-track={cta.track}
                    >
                      {cta.texto}
                      {cta.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
              </div>
              <div className="cap-eventon-features">
                {eventonFeatures.map((f) => (
                  <div key={f.strong} className="cap-eventon-feature">
                    <strong>{f.strong}</strong>
                    <span>{f.span}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 13. PRÓXIMOS EVENTOS FILTRÁVEIS */}
        <ProximosEventosFiltro
          eventos={eventosCapacitacao}
          filtros={filtrosProximos}
          head={{
            eyebrow: proximosEyebrow,
            tituloHtml: proximosH2,
            intro: proximosIntro,
            selo: proximosSelo,
          }}
          footerCta={proximosFooterLink}
        />

        {/* 14. 2 CAMINHOS */}
        <section
          className="cap-caminhos"
          id="caminhos"
          aria-label="Como participar — caminhos para servidor e instituição"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{caminhosEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: caminhosH2 }} />
              <p className="intro">{caminhosIntro}</p>
            </div>
            <div className="cap-caminhos-grid fade-in">
              {caminhosCapacitacao.map((c) => (
                <article key={c.tipo} className="cap-caminho" data-tipo={c.tipo}>
                  <p className="cap-caminho-eyebrow">{c.eyebrow}</p>
                  <h3>{c.titulo}</h3>
                  <p>{c.descricao}</p>
                  <div className="cap-caminho-passos">
                    {c.passos.map((p, i) => (
                      <div key={i} className="cap-caminho-passo">
                        <div>
                          <strong>{p.title}</strong>
                          <span>{p.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cap-caminho-cta">
                    <a
                      className={c.cta.classe}
                      href={c.cta.href}
                      data-cms-link={c.cta.cmsLink}
                      data-track={c.cta.track}
                    >
                      {c.cta.texto}
                      {c.cta.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 15. FAQ */}
        <section
          className="cap-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre a capacitação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{faqEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: faqH2 }} />
              <p className="intro">{faqIntro}</p>
            </div>
            <div className="cap-faq-list fade-in">
              <FaqCapacitacao itens={faqCapacitacao} />
            </div>
          </div>
        </section>

        {/* 16. CTA FINAL */}
        <section
          className="cap-cta-final"
          id="cta-final"
          aria-label="CTA institucional final"
        >
          <div className="container cap-cta-final-inner fade-in">
            <p className="eyebrow gold">{ctaFinalEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: ctaFinalH2 }} />
            <p>{ctaFinalP}</p>

            <div className="cap-cta-final-btns">
              {ctaFinalBtns.map((btn) => (
                <a
                  key={`${btn.href}-${btn.cmsLink}`}
                  className={btn.classe}
                  href={btn.href}
                  data-cms-link={btn.cmsLink}
                  data-track={btn.track}
                >
                  {btn.texto}
                  {btn.arrow && <span className="btn-arrow"> →</span>}
                </a>
              ))}
            </div>

            <div className="cap-cta-final-verticais">
              {ctaFinalVerticais.map((card) => (
                <div key={card.vert} className="cap-cta-final-vert" data-vert={card.vert}>
                  <p className="eyebrow">{card.eyebrow}</p>
                  <h4>{card.titulo}</h4>
                  <p>{card.descricao}</p>
                  <a
                    className={card.link.classe}
                    href={card.link.href}
                    data-cms-link={card.link.cmsLink}
                    data-track={card.link.track}
                  >
                    {card.link.texto}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyCtaCapacitacao />
    </>
  );
}
