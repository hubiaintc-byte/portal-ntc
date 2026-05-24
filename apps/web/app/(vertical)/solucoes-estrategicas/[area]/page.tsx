import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FALLBACK_VERTICAIS, type VerticalSlug } from "./conteudoFallback";
import { FaqAcordeao } from "./FaqAcordeao";
import { NavBarInternaSticky } from "./NavBarInternaSticky";
import { IconeEixo } from "./icones";

/**
 * Página `/solucoes-estrategicas/[area]` — porta literal das 13
 * seções dos protótipos 07_Pagina_Vertical_NTC_*.html.
 *
 * Conteúdo: `FALLBACK_VERTICAIS[area]` (conteudoFallback.ts) com
 * textos validados do protótipo. Cromático: `<div
 * className="vertical-page" data-vertical={area}>` ativa as CSS
 * custom properties (--vertical-accent etc.).
 */

export const revalidate = 3600;

const VERTICAIS_VALIDAS: VerticalSlug[] = ["educacao", "gestao-publica", "saude"];

export function generateStaticParams() {
  return VERTICAIS_VALIDAS.map((area) => ({ area }));
}

interface Props {
  params: Promise<{ area: string }>;
}

const TITULO_POR_VERTICAL: Record<VerticalSlug, string> = {
  educacao: "NTC Educação · Vertical Estratégica · Grupo NTC",
  "gestao-publica": "NTC Gestão Pública · Vertical Estratégica · Grupo NTC",
  saude: "NTC Saúde · Vertical Estratégica · Grupo NTC",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  if (!VERTICAIS_VALIDAS.includes(area as VerticalSlug)) {
    return { title: "Vertical · Grupo NTC" };
  }
  return { title: TITULO_POR_VERTICAL[area as VerticalSlug] };
}

function classeCta(variante: string): string {
  switch (variante) {
    case "gold":
      return "btn btn--gold";
    case "secondary-vert":
      return "btn btn--secondary-vert";
    case "ghost-light":
    default:
      return "btn btn--ghost-light";
  }
}

export default async function VerticalPage({ params }: Props) {
  const { area } = await params;
  if (!VERTICAIS_VALIDAS.includes(area as VerticalSlug)) {
    notFound();
  }
  const v = FALLBACK_VERTICAIS[area as VerticalSlug];

  return (
    <div className="vertical-page" data-vertical={area}>
      <main id="main">
        {/* ============= BREADCRUMB ============= */}
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <div className="container">
            <ol className="breadcrumb-list">
              <li>
                <Link href="/">Grupo NTC</Link>
              </li>
              <li className="sep">/</li>
              <li>
                <Link href="/#solucoes">Soluções Estratégicas</Link>
              </li>
              <li className="sep">/</li>
              <li className="current">{v.breadcrumb.current}</li>
            </ol>
          </div>
        </nav>

        {/* ============= HERO ============= */}
        <section className="vert-hero" aria-label={`${v.breadcrumb.current} · Vertical Estratégica`}>
          <div
            className="vert-hero-bg"
            style={{ backgroundImage: `url('${v.hero.bgSrc}')` }}
            aria-hidden="true"
          />
          <div className="container vert-hero-content fade-in">
            <p className="vert-hero-eyebrow">{v.hero.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: v.hero.tituloHtml }} />
            <p className="vert-hero-tagline">{v.hero.tagline}</p>
            <p className="vert-hero-sub">{v.hero.sub}</p>
            <div className="vert-hero-ctas">
              {v.hero.ctas.map((c, i) => (
                <a key={i} className={classeCta(c.variante)} href={c.href}>
                  {c.rotulo}
                  {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============= FAIXA DE METADADOS ============= */}
        <section className="vert-meta-bar" aria-label="Informações da vertical">
          <div className="container">
            <div className="vert-meta-grid fade-in">
              {v.metadados.map((m) => (
                <div key={m.label} className="vert-meta-item">
                  <span className="label">{m.label}</span>
                  <span className="value">{m.value}</span>
                  <span className="value-sub">{m.valueSub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============= NAV-BAR INTERNA STICKY ============= */}
        <NavBarInternaSticky navLinks={v.navLinks} navActions={v.navActions} />

        {/* ============= VISÃO GERAL ============= */}
        <section className="vert-section vert-section--cream" id="visao-geral">
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow">{v.visaoGeral.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.visaoGeral.tituloHtml }} />
            </div>
            <div className="vert-overview fade-in">
              <p className="lede">{v.visaoGeral.lede}</p>
              <div className="body">
                {v.visaoGeral.paragrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============= ÁREAS DE ATUAÇÃO ============= */}
        <section className="vert-section" id="areas">
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow">{v.areas.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.areas.tituloHtml }} />
              <p className="intro">{v.areas.intro}</p>
            </div>

            <div className="areas-grid fade-in">
              {v.areas.cards.map((c) => (
                <article key={c.num} className="area-card">
                  <span className="a-num">{c.num}</span>
                  <h4>{c.titulo}</h4>
                  <p>{c.texto}</p>
                  <p className="a-program-link">
                    Programa · <strong>{c.programaSigla}</strong>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============= GRADE DOS PROGRAMAS ============= */}
        <section
          className="vert-section vert-section--ivory"
          id={v.navLinks.find((l) => l.label === "Programas")!.href.replace(/^#/, "")}
        >
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow">{v.programas.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.programas.tituloHtml }} />
              <p className="intro">{v.programas.intro}</p>
            </div>

            <div className="programs-grid-vert fade-in">
              {v.programas.cards.map((p) => (
                <a key={p.sigla} className="program-card-vert" href="#">
                  <div className="pc-cover">
                    <div
                      className="pc-cover-img"
                      style={{ backgroundImage: `url('${p.imagemSrc}')` }}
                      aria-hidden="true"
                    />
                    {p.flagAberto ? <span className="pc-flag">Módulos abertos</span> : null}
                    <span className="pc-sigla">{p.sigla}</span>
                  </div>
                  <div className="pc-body">
                    <h3 className="pc-name">{p.nome}</h3>
                    <p className="pc-tagline">{p.tagline}</p>
                    <div className="pc-meta">
                      <span>{p.meta}</span>
                      <span className="pc-cta">Conhecer →</span>
                    </div>
                  </div>
                </a>
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
              <a className="btn btn--primary" href={v.programas.ctaPrimario.href}>
                {v.programas.ctaPrimario.rotulo} <span className="btn-arrow">→</span>
              </a>
              <a className="btn btn--secondary" href={v.programas.ctaSecundario.href}>
                {v.programas.ctaSecundario.rotulo}
              </a>
            </div>
          </div>
        </section>

        {/* ============= AUTORIDADE TÉCNICA ============= */}
        <section className="vert-section vert-section--cream" id="especialistas">
          <div className="container">
            <div className="vert-section-head fade-in">
              <span className="curadoria-pill">{v.autoridade.pillTexto}</span>
              <p className="eyebrow">{v.autoridade.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.autoridade.tituloHtml }} />
              <p className="intro">{v.autoridade.intro}</p>
            </div>

            <div className="experts-authority fade-in">
              {/* Variante "experts-featured": NTC Gestão Pública (2 cards destaque + grade) */}
              {v.autoridade.tipo === "experts-featured" ? (
                <>
                  <p className="experts-marker">{v.autoridade.markerFeatured}</p>
                  <div className="experts-featured">
                    {v.autoridade.featured.map((e, i) => (
                      <article key={i} className="expert-featured-card">
                        <div className="efc-portrait">
                          <img src={e.imagemSrc} alt={e.imagemAlt} loading="lazy" />
                          <span className="efc-axis-badge">{e.axisBadge}</span>
                        </div>
                        <div className="efc-info">
                          <span className="efc-tag">{e.tag}</span>
                          <h4>{e.titulo}</h4>
                          <p className="efc-credential">{e.credencial}</p>
                          <div className="efc-meta">
                            <span>
                              Eixo · <strong>{e.metaEixo}</strong>
                            </span>
                            <span>
                              Programas · <strong>{e.metaPrograma}</strong>
                            </span>
                          </div>
                          <Link className="efc-link" href="/contato">
                            Conhecer atuação <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="experts-marker">{v.autoridade.markerGrid}</p>
                </>
              ) : null}

              {/* Variante "experts" (Educação) e "experts-featured" (parte grade) */}
              {v.autoridade.tipo === "experts" || v.autoridade.tipo === "experts-featured" ? (
                <>
                  {v.autoridade.tipo === "experts" ? (
                    <p className="experts-marker">{v.autoridade.marker}</p>
                  ) : null}
                  <div className="experts-authority-grid">
                    {v.autoridade.cards.map((e, i) => (
                      <article key={i} className="expert-authority-card">
                        <div className="eac-portrait">
                          <img src={e.imagemSrc} alt={e.imagemAlt} loading="lazy" />
                          <span className="eac-axis-badge">{e.axisBadge}</span>
                        </div>
                        <div className="eac-info">
                          <h4>{e.titulo}</h4>
                          <p className="eac-credential">{e.credencial}</p>
                          <p className="eac-programs">
                            Programa · <strong>{e.programa}</strong>
                          </p>
                          <Link className="eac-link" href="/contato">
                            Conhecer atuação <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Variante "axis" (Saúde): cards com ícones em vez de fotos */}
              {v.autoridade.tipo === "axis" ? (
                <>
                  <p className="experts-marker">{v.autoridade.marker}</p>
                  <div className="experts-authority-grid">
                    {v.autoridade.cards.map((c, i) => (
                      <article key={i} className="expert-authority-card is-axis-card">
                        <div className="eac-icon-wrap" aria-hidden="true">
                          <IconeEixo id={c.iconId} />
                          <span className="eac-axis-tag">{c.axisTag}</span>
                        </div>
                        <div className="eac-info">
                          <h4>{c.titulo}</h4>
                          <p className="eac-credential">{c.credencial}</p>
                          <p className="eac-programs">
                            Programa · <strong>{c.programa}</strong>
                          </p>
                          <Link className="eac-link" href="/contato">
                            Conhecer atuação <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="experts-counters fade-in" aria-label="Indicadores da curadoria">
                {v.autoridade.counters.map((c, i) => (
                  <div key={i} className="experts-counter">
                    <span className="ec-num">{c.num}</span>
                    <span className="ec-lbl">{c.label}</span>
                  </div>
                ))}
              </div>

              <p className="placeholder-note" style={{ textAlign: "left" }}>
                {v.autoridade.nota}
              </p>

              <div className="experts-authority-cta">
                {v.autoridade.ctas.map((c, i) => (
                  <a key={i} className={classeCta(c.variante)} href={c.href}>
                    {c.rotulo}
                    {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============= EVENTOS ABERTOS ============= */}
        <section
          className="vert-section vert-section--cream"
          id={v.navLinks.find((l) => l.label === "Eventos abertos")!.href.replace(/^#/, "")}
        >
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow gold">{v.eventos.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.eventos.tituloHtml }} />
              <p className="intro">{v.eventos.intro}</p>
            </div>

            <div className="events-vert-grid fade-in">
              {v.eventos.cards.map((evt, i) => (
                <article key={i} className="event-secondary-card" data-area={v.slug.replace(/-publica$/, "").slice(0, 3)}>
                  <div className="es-cover">
                    <div
                      className="es-cover-img"
                      style={{ backgroundImage: `url('${evt.imagemSrc}')` }}
                      aria-hidden="true"
                    />
                    <div className="es-cover-overlay" />
                    {evt.data.variante === "single" ? (
                      <div className="es-date single">
                        <span className="day">{evt.data.day}</span>
                        <span className="mon-yr">{evt.data.monYr}</span>
                      </div>
                    ) : evt.data.variante === "range" ? (
                      <div className="es-date range">
                        <span className="days">
                          {evt.data.days.split("–")[0]}
                          <span className="dash">–</span>
                          {evt.data.days.split("–")[1]}
                        </span>
                        <span className="mon-yr">{evt.data.monYr}</span>
                      </div>
                    ) : (
                      <div className="es-date multi">
                        <span className="count">
                          <span className="number">{evt.data.count.split(" ")[0]}</span>{" "}
                          {evt.data.count.split(" ").slice(1).join(" ")}
                        </span>
                        <span className="period">{evt.data.period}</span>
                      </div>
                    )}
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">{evt.programLine}</p>
                      <h4 className="es-title">{evt.titulo}</h4>
                      <p className="es-program-binding">
                        Integra o programa <strong>{evt.bindingSigla}</strong>
                      </p>
                    </div>
                    <div className="es-meta-row">
                      <span
                        className="es-meta"
                        dangerouslySetInnerHTML={{ __html: evt.metaCompleto }}
                      />
                    </div>
                    <a className="es-cta" href={evt.cta.href}>
                      {evt.cta.rotulo}
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
              <a className="btn btn--primary" href={v.eventos.ctaAgenda.href}>
                {v.eventos.ctaAgenda.rotulo} <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* ============= SOLUÇÕES INSTITUCIONAIS ============= */}
        <section className="institutional-solutions" id="solucoes-inst">
          <div className="container">
            <div className="solutions-grid-vert">
              <div className="vert-section-head fade-in" style={{ marginBottom: 0 }}>
                <p className="eyebrow gold">{v.solucoes.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: v.solucoes.tituloHtml }} />
                <p className="intro">{v.solucoes.intro}</p>
                <div className="solutions-cta-vert">
                  {v.solucoes.ctas.map((c, i) => (
                    <a key={i} className={classeCta(c.variante)} href={c.href}>
                      {c.rotulo}
                      {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                    </a>
                  ))}
                </div>
              </div>
              <div className="solutions-list-vert fade-in">
                {v.solucoes.items.map((s, i) => (
                  <article key={i} className="solution-item-vert">
                    <h4>{s.titulo}</h4>
                    <p>{s.texto}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============= CONTEÚDOS EDITORIAIS ============= */}
        <section className="vert-section" id="conteudos">
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow">{v.conteudos.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: v.conteudos.tituloHtml }} />
              <p className="intro">{v.conteudos.intro}</p>
            </div>

            <div className="contents-vert fade-in">
              {v.conteudos.cards.map((c, i) => (
                <article
                  key={i}
                  className={`content-vert-card${c.featured ? " featured" : ""}`}
                >
                  <div className="content-vert-img">
                    <img src={c.imagemSrc} alt={c.imagemAlt} loading="lazy" />
                  </div>
                  <div className="content-vert-body">
                    <span className="content-demo-tag">Demonstrativo</span>
                    <span className="cat">{c.categoria}</span>
                    <h4>{c.titulo}</h4>
                    <p>{c.resumo}</p>
                    <div className="meta">
                      <span>{c.meta1}</span>
                      <span>{c.meta2}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============= FAQ ============= */}
        <section className="vert-section vert-section--cream" id="faq">
          <div className="container">
            <div className="vert-section-head fade-in">
              <p className="eyebrow">{v.faq.eyebrow}</p>
              <h2>{v.faq.titulo}</h2>
            </div>
            <FaqAcordeao items={v.faq.items} />
          </div>
        </section>

        {/* ============= CTA FINAL ============= */}
        <section className="vert-cta-final" id="contato">
          <div className="container fade-in">
            <p className="eyebrow gold">{v.ctaFinal.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: v.ctaFinal.tituloHtml }} />
            <p className="vert-cta-final-sub">{v.ctaFinal.sub}</p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              {v.ctaFinal.ctas.map((c, i) => (
                <a key={i} className={classeCta(c.variante)} href={c.href}>
                  {c.rotulo}
                  {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
