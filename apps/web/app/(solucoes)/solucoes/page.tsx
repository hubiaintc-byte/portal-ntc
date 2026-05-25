import type { Metadata } from "next";
import { Fragment } from "react";

import {
  CTA_FINAL,
  DETALHES_MODALIDADES,
  FAQ_HEAD,
  FAQ_SOLUCOES,
  HERO_SOLUCOES,
  JURIDICO,
  MANIFESTO,
  METRICAS,
  MODALIDADES,
  MODALIDADES_HEAD,
  PARALLAX,
  PILARES,
  PILARES_HEAD,
  PROCESSO_CTA,
  PROCESSO_HEAD,
  PROCESSO_PASSOS,
  VITRINE,
  VITRINE_HEAD,
  type BlocoDetalhe,
} from "./conteudoSolucoes";
import { FaqAcordeao } from "./FaqAcordeao";
import { StickyCtaSolucoes } from "./StickyCtaSolucoes";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Soluções institucionais · Modelos de contratação · Grupo NTC",
  description:
    "Programas in company, turmas fechadas, soluções sob medida e trilhas formativas curadas — entregues pelo Instituto NTC do Brasil com segurança jurídica e aderência à Lei 14.133/2021.",
};

/**
 * Página /solucoes — porta literal de 26_Pagina_Solucoes_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Hero institucional slim.
 *   2. Faixa de métricas (4).
 *   3. Manifesto consultivo.
 *   4. 3 pilares.
 *   5. 4 cards de modalidades.
 *   6-9. 4 blocos de detalhamento (in-company, turmas-fechadas, sob-medida, trilhas).
 *   10. Parallax editorial.
 *   11. Bloco jurídico (Lei 14.133/2021).
 *   12. Vitrine por área (4 verticais).
 *   13. Processo 5 passos.
 *   14. FAQ acordeão (8 itens).
 *   15. CTA final.
 *
 * Fora do <main>: <StickyCtaSolucoes /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (solucoes).
 */
export default function SolucoesPage() {
  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Soluções">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              {HERO_SOLUCOES.crumb.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < HERO_SOLUCOES.crumb.length - 1 && (
                    <span className="sep" aria-hidden="true" />
                  )}
                </Fragment>
              ))}
            </nav>

            <p className="eyebrow gold">{HERO_SOLUCOES.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: HERO_SOLUCOES.tituloHtml }} />
            <p
              className="hero-page-sub"
              dangerouslySetInnerHTML={{ __html: HERO_SOLUCOES.subHtml }}
            />

            <div className="hero-quicklinks" aria-label="Atalhos para modelos de contratação">
              {HERO_SOLUCOES.quicklinks.map((q) => (
                <a key={q.href} href={q.href} data-track={q.track}>
                  {q.texto}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 2. FAIXA DE MÉTRICAS */}
        <section className="sol-metrics" aria-label="Métricas institucionais de contratação">
          <div className="container">
            <div className="sol-metrics-grid fade-in">
              {METRICAS.map((m) => (
                <div key={m.lbl} className="sol-metric">
                  <span className="sm-num">{m.num}</span>
                  <span className="sm-lbl">{m.lbl}</span>
                  <span className="sm-detail">{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MANIFESTO */}
        <section className="sol-manifesto" aria-label="Abordagem consultiva do Grupo NTC">
          <div className="container">
            <div className="sol-manifesto-inner fade-in">
              <span className="sol-manifesto-marker">{MANIFESTO.marker}</span>
              <h2 dangerouslySetInnerHTML={{ __html: MANIFESTO.tituloHtml }} />
              <p
                className="lede"
                dangerouslySetInnerHTML={{ __html: MANIFESTO.ledeHtml }}
              />
              {MANIFESTO.paragrafosHtml.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. 3 PILARES */}
        <section className="sol-pilares" aria-label="Três pilares da abordagem NTC">
          <div className="container sol-pilares-inner">
            <div className="sol-pilares-head fade-in">
              <p className="eyebrow">{PILARES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: PILARES_HEAD.tituloHtml }} />
              <p>{PILARES_HEAD.descricao}</p>
            </div>
            <div className="sol-pilares-grid fade-in">
              {PILARES.map((p) => (
                <article key={p.num} className="sol-pilar">
                  <span className="sol-pilar-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="sol-pilar-marker">{p.marker}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 4 CARDS DE MODALIDADES */}
        <section
          className="sol-modalidades"
          id="modalidades"
          aria-label="Quatro modalidades canon de contratação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{MODALIDADES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: MODALIDADES_HEAD.tituloHtml }} />
              <p className="intro">{MODALIDADES_HEAD.intro}</p>
            </div>
            <div className="sol-modalidades-grid fade-in">
              {MODALIDADES.map((m) => (
                <article key={m.slug} className="sol-card" data-modalidade={m.slug}>
                  <span className="sol-card-num">{m.numLabel}</span>
                  <p className="sol-card-eyebrow">{m.eyebrow}</p>
                  <h3>{m.titulo}</h3>
                  <p className="sol-card-desc">{m.descricao}</p>
                  <ul>
                    {m.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div
                    className="sol-card-indicado"
                    dangerouslySetInnerHTML={{ __html: m.indicadoHtml }}
                  />
                  <div className="sol-card-actions">
                    <a
                      className="btn btn--gold btn--mini"
                      href={m.ctaSaibaMais.href}
                      data-cms-link={m.ctaSaibaMais.cmsLink}
                      data-track={m.ctaSaibaMais.track}
                    >
                      {m.ctaSaibaMais.texto}
                      {m.ctaSaibaMais.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                    <a
                      className="btn btn--secondary btn--mini"
                      href={m.ctaProposta.href}
                      data-cms-link={m.ctaProposta.cmsLink}
                      data-track={m.ctaProposta.track}
                    >
                      {m.ctaProposta.texto}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6-9. DETALHAMENTO POR MODALIDADE (4 blocos) */}
        {DETALHES_MODALIDADES.map((d) => (
          <BlocoDetalheView key={d.slug} bloco={d} />
        ))}

        {/* 10. PARALLAX EDITORIAL */}
        <aside className="sol-parallax" role="presentation" aria-hidden="true">
          <div className="sol-parallax-inner">
            <span className="sol-parallax-eyebrow">{PARALLAX.eyebrow}</span>
            <h2 dangerouslySetInnerHTML={{ __html: PARALLAX.tituloHtml }} />
          </div>
        </aside>

        {/* 11. BLOCO JURÍDICO */}
        <section
          className="sol-juridico"
          id="contratacao-institucional"
          aria-label="Contratação institucional e Lei 14.133/2021"
        >
          <div className="container">
            <div className="sol-juridico-inner">
              <div className="sol-juridico-head fade-in">
                <p className="eyebrow gold">{JURIDICO.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: JURIDICO.tituloHtml }} />
                <p
                  className="intro"
                  dangerouslySetInnerHTML={{ __html: JURIDICO.introHtml }}
                />
              </div>

              <div className="sol-juridico-grid fade-in">
                {JURIDICO.cards.map((c) => (
                  <article key={c.num} className="sol-juridico-card">
                    <span className="sol-juridico-card-num">{c.num}</span>
                    <h4>{c.titulo}</h4>
                    <p className="sol-juridico-card-art">{c.artigo}</p>
                    <p>{c.descricao}</p>
                  </article>
                ))}
              </div>

              <div className="sol-juridico-cta">
                <p
                  style={{
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    color: "var(--pergaminho-80)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    maxWidth: "800px",
                    margin: "0 auto var(--space-3)",
                  }}
                >
                  {JURIDICO.disclaimer}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    gap: "var(--space-2)",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {JURIDICO.ctas.map((cta) => (
                    <a
                      key={cta.cmsLink ?? cta.texto}
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
            </div>
          </div>
        </section>

        {/* 12. VITRINE POR ÁREA */}
        <section
          className="sol-vitrine"
          id="por-area"
          aria-label="Aplicações por área estratégica"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{VITRINE_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: VITRINE_HEAD.tituloHtml }} />
              <p className="intro">{VITRINE_HEAD.intro}</p>
            </div>
            <div className="sol-vitrine-grid fade-in">
              {VITRINE.map((v) => (
                <article key={v.slug} className="sol-vert-card" data-vertical={v.slug}>
                  <span className="sol-vert-card-eyebrow">{v.eyebrow}</span>
                  <h3>{v.titulo}</h3>
                  <p>{v.descricao}</p>
                  <p
                    className="sol-vert-card-meta"
                    dangerouslySetInnerHTML={{ __html: v.metaHtml }}
                  />
                  <a
                    className="sol-vert-card-link"
                    href={v.link.href}
                    data-cms-link={v.link.cmsLink}
                    data-track={v.link.track}
                  >
                    {v.link.texto} <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 13. PROCESSO 5 PASSOS */}
        <section
          className="sol-processo"
          id="processo"
          aria-label="Processo de proposta institucional"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{PROCESSO_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: PROCESSO_HEAD.tituloHtml }} />
              <p className="intro">{PROCESSO_HEAD.intro}</p>
            </div>

            <div className="sol-processo-grid fade-in">
              {PROCESSO_PASSOS.map((p) => (
                <article key={p.titulo} className="sol-passo">
                  <h4>{p.titulo}</h4>
                  <p>{p.descricao}</p>
                  <span className="sol-passo-prazo">{p.prazo}</span>
                </article>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
              <a
                className={PROCESSO_CTA.classe}
                href={PROCESSO_CTA.href}
                data-cms-link={PROCESSO_CTA.cmsLink}
                data-track={PROCESSO_CTA.track}
              >
                {PROCESSO_CTA.texto}
                {PROCESSO_CTA.arrow && <span className="btn-arrow"> →</span>}
              </a>
            </div>
          </div>
        </section>

        {/* 14. FAQ */}
        <section
          className="sol-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre contratação institucional"
        >
          <div className="container">
            <div className="sol-faq-inner">
              <div className="sol-faq-head fade-in">
                <p className="eyebrow">{FAQ_HEAD.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: FAQ_HEAD.tituloHtml }} />
              </div>
              <FaqAcordeao itens={FAQ_SOLUCOES} />
            </div>
          </div>
        </section>

        {/* 15. CTA FINAL */}
        <section
          className="sol-cta-final"
          aria-label="Chamadas institucionais por modalidade e área"
        >
          <div className="container">
            <div className="sol-cta-final-inner fade-in">
              <p className="eyebrow light">{CTA_FINAL.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL.tituloHtml }} />
              <p>{CTA_FINAL.descricao}</p>

              <div className="sol-cta-final-actions">
                {CTA_FINAL.ctasPrincipais.map((cta) => (
                  <a
                    key={cta.cmsLink ?? cta.texto}
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

              <p className="sol-cta-final-divider">{CTA_FINAL.divisor}</p>

              <div className="sol-cta-final-areas">
                {CTA_FINAL.ctasArea.map((cta) => (
                  <a
                    key={cta.cmsLink ?? cta.texto}
                    className={cta.classe}
                    href={cta.href}
                    data-cms-link={cta.cmsLink}
                    data-track={cta.track}
                  >
                    {cta.texto}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <StickyCtaSolucoes />
    </>
  );
}

// ----------------- Helper interno · um bloco de detalhamento -----------------

function BlocoDetalheView({ bloco }: { bloco: BlocoDetalhe }) {
  return (
    <section
      className={`sol-detail${bloco.cream ? " sol-detail--cream" : ""}`}
      id={bloco.slug}
      aria-label={`Detalhamento · ${bloco.asideEyebrow}`}
    >
      <div className="container">
        <div className="sol-detail-inner">
          <div className="sol-detail-aside fade-in">
            <p className="sol-detail-aside-eyebrow">{bloco.asideEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: bloco.asideTituloHtml }} />
            <p>{bloco.asideDescricao}</p>
            <p
              style={{
                fontFamily: "var(--font-cond)",
                fontSize: "11.5px",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                color: "var(--oxford)",
                fontWeight: 600,
              }}
            >
              {bloco.asideJuridicoLinha}
            </p>
            <div className="sol-detail-actions">
              <a
                className="btn btn--gold"
                href={bloco.asideCtaPrimario.href}
                data-cms-link={bloco.asideCtaPrimario.cmsLink}
                data-track={bloco.asideCtaPrimario.track}
              >
                {bloco.asideCtaPrimario.texto}
                {bloco.asideCtaPrimario.arrow && <span className="btn-arrow"> →</span>}
              </a>
              <a
                className="btn btn--secondary"
                href={bloco.asideCtaSecundario.href}
                data-cms-link={bloco.asideCtaSecundario.cmsLink}
                data-track={bloco.asideCtaSecundario.track}
              >
                {bloco.asideCtaSecundario.texto}
              </a>
            </div>
          </div>

          <div className="sol-detail-body fade-in">
            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Como funciona</p>
              <h3>4 passos operacionais</h3>
              <div className="sol-steps">
                {bloco.passos.map((p) => (
                  <div key={p.titulo} className="sol-step">
                    <span className="sol-step-num" />
                    <div>
                      <h4>{p.titulo}</h4>
                      <p>{p.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Quando indicar</p>
              <h3>{bloco.cenariosTitulo}</h3>
              <ul className="sol-bullets">
                {bloco.cenarios.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </article>

            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Diferenciais NTC</p>
              <h3>{bloco.diferenciaisTitulo}</h3>
              <ul className="sol-bullets">
                {bloco.diferenciais.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
