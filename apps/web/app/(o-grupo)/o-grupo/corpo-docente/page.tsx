import type { Metadata } from "next";

import { fetchCorpoDocente } from "@/lib/cms/corpoDocente";

import { conteudoFallback } from "./conteudoFallback";
import { CorpoDocenteProvider } from "./CorpoDocenteContext";
import { FadeInObserver } from "./FadeInObserver";
import { FaqAcordeao } from "./FaqAcordeao";
import { FilterBarDocentes } from "./FilterBarDocentes";
import { HeroQuicklinks } from "./HeroQuicklinks";
import { StickyCtaMobile } from "./StickyCtaMobile";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corpo Docente · Grupo NTC",
  description:
    "Curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação.",
};

function html(s: string) {
  return { __html: s };
}

export default async function CorpoDocentePage() {
  const dados =
    (await fetchCorpoDocente().catch((err) => {
      console.error("[corpo-docente] fetch CMS falhou, usando fallback:", err);
      return null;
    })) ?? conteudoFallback;

  const {
    HERO,
    METRICAS,
    MANIFESTO,
    CARDS_FEATURED,
    CARDS_EXPERTS,
    CARDS_AXIS_SAUDE,
    CREDIBILIDADE,
    CREDENCIAMENTO,
    FAQ,
    CTA_FINAL,
    STICKY_CTA,
  } = dados;

  return (
    <CorpoDocenteProvider>
      <main id="main">
        {/* ===== 1. HERO ===== */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Corpo Docente">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              <a href={HERO.crumb.home.href}>{HERO.crumb.home.rotulo}</a>
              <span className="sep" aria-hidden="true" />
              <a href={HERO.crumb.parent.href}>{HERO.crumb.parent.rotulo}</a>
              <span className="sep" aria-hidden="true" />
              <span className="current">{HERO.crumb.current}</span>
            </nav>

            <p className="eyebrow gold">{HERO.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={html(HERO.titulo)} />
            <p
              className="hero-page-sub"
              dangerouslySetInnerHTML={html(HERO.subtitulo)}
            />

            <HeroQuicklinks items={HERO.quicklinks} />
          </div>
        </section>

        {/* ===== 2. MÉTRICAS ===== */}
        <section className="docentes-metrics" aria-label="Composição da curadoria docente do Grupo NTC">
          <div className="container">
            <div className="docentes-metrics-grid fade-in">
              {METRICAS.map((m) => (
                <div key={m.sublabel} className={`docentes-metric ${m.classe}`}>
                  <span className="dm-sublabel">{m.sublabel}</span>
                  <span className="dm-num">{m.num}</span>
                  <span className="dm-lbl">{m.label}</span>
                  <span className="dm-detail">{m.detalhe}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 3. MANIFESTO ===== */}
        <section
          className="docentes-manifesto"
          aria-label="Arquitetura da curadoria docente do Grupo NTC"
        >
          <div className="container">
            <div
              className="docentes-manifesto-inner fade-in"
              style={{ textAlign: "left", maxWidth: 1080 }}
            >
              <span className="docentes-manifesto-marker">{MANIFESTO.marker}</span>
              <h2
                style={{ textAlign: "left" }}
                dangerouslySetInnerHTML={html(MANIFESTO.titulo)}
              />
              <p className="lede" style={{ marginLeft: 0, textAlign: "left" }}>
                {MANIFESTO.lede}
              </p>

              <div className="arch-grid" aria-label="Áreas estratégicas e núcleo Contratações Públicas">
                {MANIFESTO.archCards.map((c) => (
                  <article key={c.area} className="arch-card" data-area={c.area}>
                    <span className="arch-card-eyebrow">{c.eyebrow}</span>
                    <h3>{c.titulo}</h3>
                    <p>{c.descricao}</p>
                    <span className="arch-card-selo">{c.selo}</span>
                  </article>
                ))}
              </div>

              <div className="arch-camadas" aria-label="Cinco camadas de autoridade da curadoria">
                <span className="arch-camadas-head">5 camadas de autoridade</span>
                <div className="arch-camadas-grid">
                  {MANIFESTO.camadas.map((c) => (
                    <div key={c.num} className="arch-camada">
                      <span className="arch-camada-num">{c.num}</span>
                      <span className="arch-camada-title">{c.titulo}</span>
                      <span className="arch-camada-desc">{c.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>

              <aside
                className="arch-callout"
                role="note"
                aria-label="Por que Contratações Públicas aparece separada"
              >
                <div className="arch-callout-mark" aria-hidden="true">
                  i
                </div>
                <div className="arch-callout-body">
                  <h4>{MANIFESTO.callout.titulo}</h4>
                  <p>{MANIFESTO.callout.descricao}</p>
                </div>
              </aside>

              <p className="arch-nota" dangerouslySetInnerHTML={html(MANIFESTO.nota)} />
            </div>
          </div>
        </section>

        {/* ===== 4. FILTERBAR + GRADE DE ESPECIALISTAS ===== */}
        <FilterBarDocentes
          featured={CARDS_FEATURED}
          experts={CARDS_EXPERTS}
          axisSaude={CARDS_AXIS_SAUDE}
        />

        {/* ===== 5. CREDIBILIDADE ===== */}
        <section
          className="docentes-credibilidade"
          aria-label="Credibilidade institucional do Instituto NTC do Brasil"
        >
          <div className="container">
            <div className="docentes-credibilidade-inner fade-in">
              <p className="eyebrow light">{CREDIBILIDADE.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={html(CREDIBILIDADE.titulo)} />
              <p className="lede">{CREDIBILIDADE.lede}</p>

              <div className="credibilidade-grid">
                {CREDIBILIDADE.items.map((it) => (
                  <div key={it.label} className="credibilidade-item">
                    <span className="ci-num">{it.num}</span>
                    <span className="ci-lbl">{it.label}</span>
                    <span className="ci-detail">{it.detalhe}</span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginTop: "var(--space-4)",
                  fontFamily: "var(--font-cond)",
                  fontSize: 12.5,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: "var(--pergaminho-80)",
                  textAlign: "center",
                }}
                dangerouslySetInnerHTML={html(CREDIBILIDADE.rodape)}
              />
            </div>
          </div>
        </section>

        {/* ===== 6. CREDENCIAMENTO ===== */}
        <section
          className="cta-credenciamento"
          id="credenciamento"
          aria-label="Credenciamento de especialistas para o Grupo NTC"
        >
          <div className="container">
            <div className="cta-credenciamento-inner fade-in">
              <div className="cta-credenciamento-body">
                <p className="eyebrow gold">{CREDENCIAMENTO.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={html(CREDENCIAMENTO.titulo)} />
                <p>{CREDENCIAMENTO.descricao}</p>
                <ul>
                  {CREDENCIAMENTO.lista.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <div className="cta-credenciamento-actions">
                  {CREDENCIAMENTO.ctas.map((c) => (
                    <a
                      key={c.rotulo}
                      className={`btn btn--${c.variante}`}
                      href={c.href}
                    >
                      {c.rotulo}
                      {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                    </a>
                  ))}
                </div>
              </div>

              <aside className="cta-credenciamento-aside">
                <p className="cta-credenciamento-aside-eyebrow">
                  {CREDENCIAMENTO.aside.eyebrow}
                </p>
                <h3>{CREDENCIAMENTO.aside.titulo}</h3>
                <p>{CREDENCIAMENTO.aside.intro}</p>
                <ul className="checklist">
                  {CREDENCIAMENTO.aside.checklist.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--grafite)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  {CREDENCIAMENTO.aside.nota}
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ===== 7. FAQ ===== */}
        <FaqAcordeao items={FAQ} />

        {/* ===== 8. CTA FINAL ===== */}
        <section
          className="docentes-cta-final"
          aria-label="Chamadas institucionais por área e composição docente"
        >
          <div className="container">
            <div className="docentes-cta-final-inner fade-in">
              <p className="eyebrow light">{CTA_FINAL.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={html(CTA_FINAL.titulo)} />
              <p>{CTA_FINAL.descricao}</p>

              <div
                className="docentes-cta-final-actions"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <a
                  className={`btn btn--${CTA_FINAL.ctaPrincipal.variante}`}
                  href={CTA_FINAL.ctaPrincipal.href}
                >
                  {CTA_FINAL.ctaPrincipal.rotulo}{" "}
                  <span className="btn-arrow">→</span>
                </a>
                <a
                  className={`btn btn--${CTA_FINAL.ctaSecundario.variante}`}
                  href={CTA_FINAL.ctaSecundario.href}
                >
                  {CTA_FINAL.ctaSecundario.rotulo}
                </a>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-cond)",
                  fontSize: 11.5,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  color: "var(--dourado-soft)",
                  margin: "var(--space-3) 0 var(--space-2)",
                }}
              >
                {CTA_FINAL.separadorAreas}
              </p>

              <div
                className="docentes-cta-final-areas"
                style={{ marginTop: "var(--space-2)" }}
              >
                {CTA_FINAL.ctasArea.map((c) => (
                  <a
                    key={c.rotulo}
                    className="btn btn--ghost-light btn--mini"
                    href={c.href}
                  >
                    {c.rotulo}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== AUXILIARES (fora do <main>) ===== */}
      <StickyCtaMobile rotulo={STICKY_CTA.rotulo} href={STICKY_CTA.href} />
      <FadeInObserver />
    </CorpoDocenteProvider>
  );
}
