import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

import {
  areaEventOn,
  ctaFinalEventOn,
  faqEventOn,
  heroEventOn,
  manifestoEventOn,
  metricasEventOn,
  parallaxEventOn,
  processoEventOn,
  recursosEventOn,
  subnavEventOn,
  suporteEventOn,
  tourEventOn,
  vitrineEventOn,
  type CabecalhoSecao,
  type LinkEventOn,
} from "./conteudoEventOn";
import { FaqEventOn } from "./FaqEventOn";
import { StickyCtaEventOn } from "./StickyCtaEventOn";
import { SubnavEventOn } from "./SubnavEventOn";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Plataforma EventOn · Grupo NTC",
  description:
    "Plataforma EventOn · ambiente digital institucional do Grupo NTC para acesso ao vivo, replay protegido, materiais de apoio, certificação digital e suporte dedicado aos participantes dos eventos online, presenciais e híbridos.",
};

/**
 * Página /eventon — porta literal de 27_Pagina_EventOn_v1.html.
 *
 * Estrutura (espelho do <main id="main">, linhas 817-1419):
 *   1.  Hero institucional (breadcrumb, CTAs, quicklinks).
 *   2.  Faixa de métricas (4).
 *   3.  <SubnavEventOn /> com scroll-spy.
 *   4.  Manifesto.
 *   5.  6 recursos.
 *   6.  Tour visual (3 telas mockadas em CSS).
 *   7.  Como funciona (4 passos).
 *   8.  Parallax editorial.
 *   9.  Vitrine por área (4 cards).
 *   10. Suporte ao participante (4 canais).
 *   11. Área do Participante (o card de login do protótipo foi removido a pedido do PO).
 *   12. <FaqEventOn /> (8 perguntas).
 *   13. CTA final.
 * Fora do <main>: <StickyCtaEventOn /> (mobile).
 *
 * Spec: docs/superpowers/specs/2026-10-23-pagina-eventon-design.md.
 */

/** Rota interna vira <Link>; âncora `#…` e link externo ficam <a>. */
function LinkEo({ link }: { link: LinkEventOn }) {
  const conteudo = (
    <>
      {link.texto}
      {link.seta && (
        <>
          {" "}
          <span className="btn-arrow">→</span>
        </>
      )}
    </>
  );
  const props = {
    className: link.classe,
    "data-cms-link": link.cmsLink,
    "data-track": link.track,
  };
  if (!link.href.startsWith("/")) {
    return (
      <a href={link.href} {...props}>
        {conteudo}
      </a>
    );
  }
  return (
    <Link href={link.href} {...props}>
      {conteudo}
    </Link>
  );
}

function CabecalhoEo({ head, eyebrowClasse }: { head: CabecalhoSecao; eyebrowClasse: string }) {
  return (
    <>
      <p className={eyebrowClasse}>{head.eyebrow}</p>
      <h2 dangerouslySetInnerHTML={{ __html: head.tituloHtml }} />
      <p className="intro">{head.intro}</p>
    </>
  );
}

const [tela1, tela2, tela3] = tourEventOn.telas;

export default function PaginaEventOn() {
  return (
    <>
      <main id="main">
        {/* ============================ HERO INSTITUCIONAL ============================ */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Plataforma EventOn">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              {heroEventOn.crumb.map((item) => (
                <Fragment key={item.href}>
                  <Link href={item.href}>{item.texto}</Link>
                  <span className="sep" aria-hidden="true" />
                </Fragment>
              ))}
              <span className="current">{heroEventOn.crumbAtual}</span>
            </nav>

            <p className="eyebrow gold">{heroEventOn.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: heroEventOn.tituloHtml }} />
            <p className="hero-page-sub" dangerouslySetInnerHTML={{ __html: heroEventOn.subHtml }} />

            <div className="hero-cta-row">
              {heroEventOn.ctas.map((cta) => (
                <LinkEo key={cta.href} link={cta} />
              ))}
            </div>

            <div className="hero-quicklinks" aria-label="Atalhos para recursos da Plataforma EventOn">
              {heroEventOn.quicklinks.map((q) => (
                <LinkEo key={q.href} link={q} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================ FAIXA DE MÉTRICAS ============================ */}
        <section className="eo-metrics" aria-label="Métricas operacionais da Plataforma EventOn">
          <div className="container">
            <div className="eo-metrics-grid fade-in">
              {metricasEventOn.map((m) => (
                <div className="eo-metric" key={m.rotulo}>
                  <span className="em-num">{m.num}</span>
                  <span className="em-lbl">{m.rotulo}</span>
                  <span className="em-detail">{m.detalhe}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ SUBNAV STICKY ============================ */}
        <SubnavEventOn links={subnavEventOn} />

        {/* ============================ MANIFESTO ============================ */}
        <section className="eo-manifesto" aria-label="O que é a Plataforma EventOn">
          <div className="container">
            <div className="eo-manifesto-inner fade-in">
              <span className="eo-manifesto-marker">{manifestoEventOn.marcador}</span>
              <h2 dangerouslySetInnerHTML={{ __html: manifestoEventOn.tituloHtml }} />
              <p className="lede">{manifestoEventOn.lede}</p>
              {manifestoEventOn.paragrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ 6 RECURSOS ============================ */}
        <section className="eo-recursos" id="recursos" aria-label="Recursos da Plataforma EventOn">
          <div className="container">
            <div className="section-head fade-in">
              <CabecalhoEo head={recursosEventOn} eyebrowClasse="eyebrow gold" />
            </div>

            <div className="eo-recursos-grid fade-in">
              {recursosEventOn.itens.map((r) => (
                <article className="eo-recurso" key={r.num}>
                  <span className="eo-recurso-num">{r.num}</span>
                  <div className="eo-recurso-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dangerouslySetInnerHTML={{ __html: r.iconeSvgInner }}
                    />
                  </div>
                  <h3>{r.titulo}</h3>
                  <p>{r.texto}</p>
                  <span className="eo-recurso-meta">{r.meta}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ TOUR VISUAL ============================ */}
        <section className="eo-tour" id="tour" aria-label="Tour visual da Plataforma EventOn">
          <div className="container eo-tour-inner">
            <div className="eo-tour-head fade-in">
              <CabecalhoEo head={tourEventOn} eyebrowClasse="eyebrow light" />
            </div>

            <div className="eo-tour-grid fade-in">
              <article className="eo-tela">
                <div className="eo-tela-screen" aria-hidden="true">
                  <div className="eo-tela-screen-body">
                    <div className="eo-mock-live">
                      <div className="eo-mock-live-video">
                        <span className="play-icon" />
                      </div>
                      <div className="eo-mock-live-chat">
                        <span className="chat-h">Chat moderado</span>
                        <div className="msg"><span className="av" /><span className="ln" /></div>
                        <div className="msg"><span className="av" /><span className="ln short" /></div>
                        <div className="msg"><span className="av" /><span className="ln" /></div>
                        <div className="msg"><span className="av" /><span className="ln short" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="eo-tela-tag">{tela1.tag}</span>
                <h4>{tela1.titulo}</h4>
                <p>{tela1.texto}</p>
                <span className="eo-tela-foot">{tela1.rodape}</span>
              </article>

              <article className="eo-tela">
                <div className="eo-tela-screen" aria-hidden="true">
                  <div className="eo-tela-screen-body">
                    <div className="eo-mock-area">
                      <div className="eo-mock-area-side">
                        <span className="sd-item active" />
                        <span className="sd-item" />
                        <span className="sd-item" />
                        <span className="sd-item" />
                        <span className="sd-item" />
                        <span className="sd-item" />
                      </div>
                      <div className="eo-mock-area-main">
                        <span className="hd" />
                        <span className="sub" />
                        <div className="eo-mock-area-cards">
                          <div className="eo-mock-area-card">
                            <span className="cd-l" />
                            <span className="cd-m" />
                            <span className="cd-bar" />
                          </div>
                          <div className="eo-mock-area-card">
                            <span className="cd-l" />
                            <span className="cd-m" />
                            <span className="cd-bar" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="eo-tela-tag">{tela2.tag}</span>
                <h4>{tela2.titulo}</h4>
                <p>{tela2.texto}</p>
                <span className="eo-tela-foot">{tela2.rodape}</span>
              </article>

              <article className="eo-tela">
                <div className="eo-tela-screen" aria-hidden="true">
                  <div className="eo-tela-screen-body">
                    <div className="eo-mock-cert">
                      <div className="eo-mock-cert-pdf">
                        <div className="eo-mock-cert-text">
                          <span className="ct-title">Certificado · Instituto NTC do Brasil</span>
                          <span className="ct-line gold" />
                          <span className="ct-line w90" />
                          <span className="ct-line w80" />
                          <span className="ct-line w70" />
                          <span className="ct-line w80" />
                        </div>
                        <div className="eo-mock-cert-qr" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="eo-tela-tag">{tela3.tag}</span>
                <h4>{tela3.titulo}</h4>
                <p>{tela3.texto}</p>
                <span className="eo-tela-foot">{tela3.rodape}</span>
              </article>
            </div>
          </div>
        </section>

        {/* ============================ COMO FUNCIONA ============================ */}
        <section className="eo-processo" id="como-funciona" aria-label="Como funciona a Plataforma EventOn">
          <div className="container">
            <div className="section-head fade-in">
              <CabecalhoEo head={processoEventOn} eyebrowClasse="eyebrow gold" />
            </div>

            <div className="eo-processo-grid fade-in">
              {processoEventOn.passos.map((passo) => (
                <article className="eo-passo" key={passo.titulo}>
                  <h4>{passo.titulo}</h4>
                  <p>{passo.texto}</p>
                  <span className="eo-passo-prazo">{passo.prazo}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ PARALLAX EDITORIAL ============================ */}
        <aside className="eo-parallax" role="presentation" aria-hidden="true">
          <div className="eo-parallax-inner">
            <span className="eo-parallax-eyebrow">{parallaxEventOn.eyebrow}</span>
            <h2 dangerouslySetInnerHTML={{ __html: parallaxEventOn.tituloHtml }} />
          </div>
        </aside>

        {/* ============================ VITRINE POR ÁREA ============================ */}
        <section
          className="eo-vitrine"
          id="aplicacoes"
          aria-label="Aplicações da Plataforma EventOn por área estratégica"
        >
          <div className="container">
            <div className="section-head fade-in">
              <CabecalhoEo head={vitrineEventOn} eyebrowClasse="eyebrow" />
            </div>

            <div className="eo-vitrine-grid fade-in">
              {vitrineEventOn.cards.map((card) => (
                <article className="eo-vert-card" data-vertical={card.vertical} key={card.vertical}>
                  <span className="eo-vert-card-eyebrow">{card.eyebrow}</span>
                  <h3>{card.titulo}</h3>
                  <p>{card.texto}</p>
                  <p className="eo-vert-card-meta" dangerouslySetInnerHTML={{ __html: card.metaHtml }} />
                  <Link
                    className="eo-vert-card-link"
                    href={card.link.href}
                    data-cms-link={card.link.cmsLink}
                    data-track={card.link.track}
                  >
                    {card.link.texto} <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ SUPORTE AO PARTICIPANTE ============================ */}
        <section className="eo-suporte" id="suporte" aria-label="Suporte ao participante da Plataforma EventOn">
          <div className="container">
            <div className="eo-suporte-inner fade-in">
              <div className="eo-suporte-body">
                <p className="eyebrow light">{suporteEventOn.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: suporteEventOn.tituloHtml }} />
                <p>{suporteEventOn.texto}</p>
              </div>

              <div className="eo-suporte-canais">
                {suporteEventOn.canais.map((canal) => (
                  <div className="eo-canal" key={canal.titulo}>
                    <div>
                      <h4>{canal.titulo}</h4>
                      <p dangerouslySetInnerHTML={{ __html: canal.textoHtml }} />
                    </div>
                    <span className="eo-canal-sla">{canal.sla}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================ ÁREA DO PARTICIPANTE ============================ */}
        <section
          className="eo-area"
          id="area-participante"
          aria-label="Área do Participante da Plataforma EventOn"
        >
          <div className="container">
            <div className="eo-area-inner fade-in">
              <div className="eo-area-body">
                <p className="eyebrow gold">{areaEventOn.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: areaEventOn.tituloHtml }} />
                {areaEventOn.paragrafos.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <div className="eo-area-actions">
                  {areaEventOn.acoes.map((acao) => (
                    <LinkEo key={acao.texto} link={acao} />
                  ))}
                </div>
              </div>

              <div className="eo-area-aside">
                <aside className="eo-area-aside-inner">
                  <p className="eo-area-aside-eyebrow">{areaEventOn.aside.eyebrow}</p>
                  <h3>{areaEventOn.aside.titulo}</h3>
                  <ul>
                    {areaEventOn.aside.itens.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </aside>

              </div>
            </div>
          </div>
        </section>

        {/* ============================ FAQ ============================ */}
        <section className="eo-faq" id="faq" aria-label="Perguntas frequentes sobre a Plataforma EventOn">
          <div className="container">
            <div className="eo-faq-inner">
              <div className="eo-faq-head fade-in">
                <p className="eyebrow">{faqEventOn.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: faqEventOn.tituloHtml }} />
              </div>

              <FaqEventOn itens={faqEventOn.itens} />
            </div>
          </div>
        </section>

        {/* ============================ CTA FINAL ============================ */}
        <section className="eo-cta-final" aria-label="Chamada institucional · Plataforma EventOn">
          <div className="container">
            <div className="eo-cta-final-inner fade-in">
              <p className="eyebrow light">{ctaFinalEventOn.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: ctaFinalEventOn.tituloHtml }} />
              <p>{ctaFinalEventOn.texto}</p>
              <div className="eo-cta-final-actions">
                {ctaFinalEventOn.acoes.map((acao) => (
                  <LinkEo key={acao.texto} link={acao} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <StickyCtaEventOn />
    </>
  );
}
