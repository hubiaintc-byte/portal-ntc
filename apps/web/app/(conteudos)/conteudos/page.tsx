import type { Metadata } from "next";
import { Fragment } from "react";

import { listarConteudosPublicados, listarDestaques } from "@/lib/conteudos";

import {
  BIBLIOTECA_HEAD,
  CTA_FINAL_HEAD,
  CTA_FINAL_PONTES,
  DESTAQUES_HEAD,
  FAQ_CONTEUDOS,
  FAQ_HEAD,
  HERO_CONTEUDOS,
  MANIFESTO_CONTEUDOS,
  METRICAS_CONTEUDO,
  NEWSLETTER_TEXT,
  SUBNAV_LABEL,
  SUBNAV_LINKS,
  TESE_HEAD,
  TESE_PILARES,
  TIPOS_EDITORIAIS,
  TIPOS_HEAD,
  VERTICAIS_HEAD,
  VERT_CARDS,
} from "./conteudoConteudos";
import { BibliotecaConteudos } from "./BibliotecaConteudos";
import { FaqAcordeao } from "./FaqAcordeao";
import { NewsletterForm } from "./NewsletterForm";
import { StickyCtaConteudos } from "./StickyCtaConteudos";
import { SubnavSticky } from "./SubnavSticky";

// doc 13 (Mapa Página-a-Página) fixa 600s para /conteudos*.
export const revalidate = 600;

export const metadata: Metadata = {
  title:
    "Conteúdos institucionais · Biblioteca editorial · Grupo NTC",
  description:
    "Artigos, estudos, notas técnicas, webinars e materiais didáticos produzidos pela curadoria científica das três verticais NTC — para servidores, dirigentes, juristas, pesquisadores e equipes técnicas da administração pública brasileira.",
};

/** Texto do selo de destaque ainda sem publicação — mesmo texto do card da Biblioteca. */
const DESTAQUE_TEXTO_PREP = "Em preparação editorial";
/** Texto do link "Em breve" de um destaque sem link — literal do protótipo (idêntico nos 3 cards estáticos). */
const DESTAQUE_TEXTO_EM_BREVE = "Em breve · curadoria em andamento";
/** Texto do link de leitura de um destaque já publicado. */
const DESTAQUE_TEXTO_LER = "Ler conteúdo";

/**
 * Página /conteudos — porta literal de 28_Pagina_Conteudos_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Hero institucional slim.
 *   2. Faixa de métricas editoriais (5).
 *   3. <SubnavSticky /> com 6 âncoras + sticky + active anchor.
 *   4. Manifesto editorial.
 *   5. Tese editorial (3 pilares).
 *   6. Destaques editoriais (até 3, do CMS — listarDestaques()).
 *   7. <BibliotecaConteudos /> com os cards filtráveis do CMS + URL sync.
 *   8. 5 tipos editoriais.
 *   9. Curadoria por vertical (3).
 *   10. <NewsletterForm /> com validação inline mock.
 *   11. <FaqAcordeao /> com 8 perguntas.
 *   12. CTA final 3 pontes.
 *
 * Fora do <main>: <StickyCtaConteudos /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (conteudos).
 */
export default async function ConteudosPage() {
  const [cards, destaques] = await Promise.all([
    listarConteudosPublicados(),
    listarDestaques(),
  ]);

  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Conteúdos">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Trilha de navegação">
              {HERO_CONTEUDOS.crumb.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < HERO_CONTEUDOS.crumb.length - 1 && <span className="sep" aria-hidden="true" />}
                </Fragment>
              ))}
            </nav>
            <p className="eyebrow light">{HERO_CONTEUDOS.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: HERO_CONTEUDOS.tituloHtml }} />
            <p className="hero-page-sub">{HERO_CONTEUDOS.sub}</p>
            <div className="hero-quicklinks" aria-label="Atalhos rápidos">
              {HERO_CONTEUDOS.quicklinks.map((q) => (
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

        {/* 2. FAIXA DE MÉTRICAS EDITORIAIS */}
        <section
          className="cont-metrics"
          aria-label="Métricas editoriais do Grupo NTC"
        >
          <div className="container">
            <div className="cont-metrics-grid fade-in">
              {METRICAS_CONTEUDO.map((m) => (
                <div key={m.lbl} className="cont-metric">
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
        <SubnavSticky label={SUBNAV_LABEL} links={SUBNAV_LINKS} />

        {/* 4. MANIFESTO EDITORIAL */}
        <section
          className="cont-manifesto"
          aria-label="Manifesto editorial dos Conteúdos NTC"
        >
          <div className="container">
            <div className="cont-manifesto-inner fade-in">
              <p className="eyebrow gold">{MANIFESTO_CONTEUDOS.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: MANIFESTO_CONTEUDOS.tituloHtml }} />
              <p className="lede">{MANIFESTO_CONTEUDOS.lede}</p>
              <p>{MANIFESTO_CONTEUDOS.paragrafo}</p>
              <div className="cont-manifesto-marker">
                {MANIFESTO_CONTEUDOS.marker}
              </div>
            </div>
          </div>
        </section>

        {/* 5. TESE EDITORIAL (3 pilares) */}
        <section
          className="cont-thesis"
          aria-label="Pilares editoriais do Grupo NTC"
        >
          <div className="container cont-thesis-inner">
            <div className="cont-thesis-head fade-in">
              <p className="eyebrow gold">{TESE_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: TESE_HEAD.tituloHtml }} />
              <p>{TESE_HEAD.descricao}</p>
            </div>
            <div className="cont-thesis-grid fade-in">
              {TESE_PILARES.map((p) => (
                <article key={p.num} className="cont-thesis-pilar">
                  <span className="cont-thesis-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="cont-thesis-rule">{p.rule}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. DESTAQUES EDITORIAIS (até 3, do CMS) */}
        <section
          className="cont-featured"
          id="destaques"
          aria-label="Destaques editoriais"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{DESTAQUES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: DESTAQUES_HEAD.tituloHtml }} />
              <p className="intro">{DESTAQUES_HEAD.intro}</p>
            </div>
            <div className="cont-featured-list fade-in">
              {destaques.map((d) => (
                <article
                  key={d.id}
                  className="cont-featured-card"
                  data-vert={d.vert}
                >
                  <div
                    className="cont-featured-figura"
                    style={d.imagemUrl ? { backgroundImage: `url('${d.imagemUrl}')` } : undefined}
                  >
                    <span className="cont-featured-figura-tag">{d.tipoLabel}</span>
                  </div>
                  <div className="cont-featured-body">
                    {d.emPreparacao && (
                      <span className="cont-featured-prep">{DESTAQUE_TEXTO_PREP}</span>
                    )}
                    <p className="cont-featured-eyebrow">{d.verticalLabel}</p>
                    <h3>{d.titulo}</h3>
                    <p>{d.lide}</p>
                    <div className="cont-featured-meta">
                      <span>{d.dataLegivel}</span>
                      <span>{d.assinatura}</span>
                    </div>
                    {d.href ? (
                      <a className="link-arrow" href={d.href}>
                        {DESTAQUE_TEXTO_LER}
                      </a>
                    ) : (
                      <span className="cont-featured-soon">{DESTAQUE_TEXTO_EM_BREVE}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. BIBLIOTECA FILTRÁVEL */}
        <BibliotecaConteudos cards={cards} head={BIBLIOTECA_HEAD} />

        {/* 8. 5 TIPOS EDITORIAIS */}
        <section
          className="cont-tipos"
          id="tipos"
          aria-label="Tipos editoriais do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{TIPOS_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: TIPOS_HEAD.tituloHtml }} />
              <p className="intro">{TIPOS_HEAD.intro}</p>
            </div>
            <div className="cont-tipos-grid fade-in">
              {TIPOS_EDITORIAIS.map((t) => (
                <article key={t.num} className="cont-tipo">
                  <span className="cont-tipo-num">{t.num}</span>
                  <h3>{t.titulo}</h3>
                  <p>{t.descricao}</p>
                  <span className="cont-tipo-tag">{t.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. CURADORIA POR VERTICAL (3) */}
        <section
          className="cont-verticais"
          id="verticais"
          aria-label="Curadoria editorial por vertical"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{VERTICAIS_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: VERTICAIS_HEAD.tituloHtml }} />
              <p className="intro">{VERTICAIS_HEAD.intro}</p>
            </div>
            <div className="cont-verticais-grid fade-in">
              {VERT_CARDS.map((v) => (
                <article key={v.vert} className="cont-vert-card" data-vert={v.vert}>
                  <div className="cont-vert-band" aria-hidden="true">
                    <span className="cont-vert-band-mark">{v.bandMark}</span>
                    <span className="cont-vert-band-num">{v.bandNum}</span>
                  </div>
                  <div className="cont-vert-body">
                    <h3>{v.titulo}</h3>
                    <p>{v.descricao}</p>
                    <ul className="cont-vert-list">
                      {v.listaHtml.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                      ))}
                    </ul>
                    <a
                      className="link-arrow"
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

        {/* 10. NEWSLETTER */}
        <section
          className="cont-newsletter"
          id="newsletter"
          aria-label="Newsletter institucional Boletim NTC"
        >
          <div className="container">
            <div className="cont-newsletter-inner fade-in">
              <div className="cont-newsletter-text">
                <p className="eyebrow gold">{NEWSLETTER_TEXT.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: NEWSLETTER_TEXT.tituloHtml }} />
                {NEWSLETTER_TEXT.paragrafosHtml.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <div className="cont-newsletter-pillars">
                  {NEWSLETTER_TEXT.pills.map((pill) => (
                    <span key={pill} className="cont-newsletter-pill">{pill}</span>
                  ))}
                </div>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section
          className="cont-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre os Conteúdos NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{FAQ_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: FAQ_HEAD.tituloHtml }} />
              <p className="intro">{FAQ_HEAD.intro}</p>
            </div>
            <div className="cont-faq-list fade-in">
              <FaqAcordeao itens={FAQ_CONTEUDOS} />
            </div>
          </div>
        </section>

        {/* 12. CTA FINAL 3 PONTES */}
        <section
          className="cont-cta-final"
          id="cta-final"
          aria-label="CTA institucional final"
        >
          <div className="container cont-cta-final-inner fade-in">
            <p className="eyebrow gold">{CTA_FINAL_HEAD.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL_HEAD.tituloHtml }} />
            <p>{CTA_FINAL_HEAD.intro}</p>

            <div className="cont-cta-final-grid">
              {CTA_FINAL_PONTES.map((p) => (
                <div
                  key={p.ponte}
                  className="cont-cta-final-card"
                  data-ponte={p.ponte}
                >
                  <p className="eyebrow">{p.eyebrow}</p>
                  <h4>{p.titulo}</h4>
                  <p>{p.descricao}</p>
                  <a
                    className="link-arrow light"
                    href={p.link.href}
                    data-cms-link={p.link.cmsLink}
                    data-track={p.link.track}
                  >
                    {p.link.texto}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyCtaConteudos />
    </>
  );
}
