import type { Metadata } from "next";
import Link from "next/link";

import { CONTEUDO_OGRUPO } from "./conteudoOGrupo";
import { NavBarAncoras } from "./NavBarAncoras";
import {
  ICONE_DIFERENCIAIS,
  ICONE_EVENTON,
  ICONE_METODOLOGIA,
  ICONE_MVV,
} from "./icones";

export const metadata: Metadata = {
  title: "O Grupo NTC · Inteligência institucional. Impacto real.",
  description:
    "O Grupo NTC · Inteligência institucional aplicada à formação executiva, capacitação técnica e desenvolvimento institucional para a Administração Pública brasileira. Cerca de duas décadas de atuação · 3 verticais · 15 programas estratégicos.",
};

/**
 * Helper para injetar HTML inline (`<em>`, `<strong>`) dos textos
 * literais do protótipo. O CSS portado em `o-grupo-prototipo.css` já
 * estiliza `em` e `strong` dentro das classes específicas. Sem
 * sanitização adicional — a fonte é o arquivo TS local
 * (`conteudoOGrupo.ts`), versionado no repositório.
 */
function html(s: string): { __html: string } {
  return { __html: s };
}

export default function OGrupoPage() {
  const C = CONTEUDO_OGRUPO;

  // Hero
  const heroImgUrl = C.hero.imagemFundoUrl;
  const heroEyebrow = C.hero.eyebrow;
  const heroTitulo = C.hero.titulo;
  const heroSub = C.hero.subtitulo;
  const heroSelo = C.hero.selo;
  const heroMicro = C.hero.microindicadores;
  const heroCtas = C.hero.ctas;

  // Indicadores oficiais
  const indicadores = C.indicadoresOficiais;

  // Síntese
  const sinteseEyebrow = C.sintese.eyebrow;
  const sinteseTitulo = C.sintese.titulo;
  const sinteseLede = C.sintese.lede;
  const sinteseFecho = C.sintese.fecho;
  const sinteseSelo = C.sintese.seloMarca;
  const sinteseParagrafos: string[] = C.sintese.paragrafos;

  // Proposta de valor
  const pvEyebrow = C.propostaValor.eyebrow;
  const pvTitulo = C.propostaValor.titulo;
  const pvIntro = C.propostaValor.intro;
  const pvFecho = C.propostaValor.fecho;
  const pvPilares = C.propostaValor.pilares;

  // MVV
  const mvvEyebrow = C.mvv.eyebrow;
  const mvvTitulo = C.mvv.titulo;
  const mvvIntro = C.mvv.intro;
  const mvvMissao = C.mvv.missao;
  const mvvVisao = C.mvv.visao;
  const mvvValores = C.mvv.valores;

  // Áreas estratégicas
  const aeEyebrow = C.areasEstrategicas.eyebrow;
  const aeTitulo = C.areasEstrategicas.titulo;
  const aeIntro = C.areasEstrategicas.intro;
  const aeFecho = C.areasEstrategicas.fecho;
  const aeVerticais = C.areasEstrategicas.verticais;

  // Trajetória
  const trEyebrow = C.trajetoria.eyebrow;
  const trTitulo = C.trajetoria.titulo;
  const trIntro = C.trajetoria.intro;
  const trFecho = C.trajetoria.fecho;
  const trMarcos = C.trajetoria.marcos;

  // Portfólio
  const pcEyebrow = C.portfolioCompleto.eyebrow;
  const pcTitulo = C.portfolioCompleto.titulo;
  const pcIntro = C.portfolioCompleto.intro;
  const pcAreas = C.portfolioCompleto.areas;
  const pcCtaTodos = C.portfolioCompleto.ctaVerTodos;

  // Diferenciais
  const dfEyebrow = C.diferenciais.eyebrow;
  const dfTitulo = C.diferenciais.titulo;
  const dfIntro = C.diferenciais.intro;
  const dfCards = C.diferenciais.cards;

  // Metodologia
  const mdEyebrow = C.metodologia.eyebrow;
  const mdTitulo = C.metodologia.titulo;
  const mdIntro = C.metodologia.intro;
  const mdEtapas = C.metodologia.etapas;

  // Autoridade
  const auEyebrow = C.autoridade.eyebrow;
  const auTitulo = C.autoridade.titulo;
  const auIntro = C.autoridade.intro;
  const auCuradorias = C.autoridade.curadorias;

  // Credibilidade
  const crEyebrow = C.credibilidade.eyebrow;
  const crTitulo = C.credibilidade.titulo;
  const crIntro = C.credibilidade.intro;
  const crFecho = C.credibilidade.fecho;
  const crIndicadores = C.credibilidade.indicadores;
  const crMosaico = C.credibilidade.mosaico;

  // EventON
  const evEyebrow = C.eventon.eyebrow;
  const evTitulo = C.eventon.titulo;
  const evIntro = C.eventon.intro;
  const evFecho = C.eventon.fecho;
  const evMockup = C.eventon.mockup;
  const evFeatures = C.eventon.features;

  // Jurídico
  const juEyebrow = C.juridico.eyebrow;
  const juTitulo = C.juridico.titulo;
  const juIntro = C.juridico.intro;
  const juQuote = C.juridico.quote;
  const juRodape = C.juridico.rodape;
  const juDiretrizes = C.juridico.diretrizes;
  const juFundamento = C.juridico.fundamentoLegal;

  // CTA final
  const ctaFEyebrow = C.ctaFinal.eyebrow;
  const ctaFTitulo = C.ctaFinal.titulo;
  const ctaFSub = C.ctaFinal.subtitulo;
  const ctaFCtas = C.ctaFinal.ctas;
  const ctaFTag = C.ctaFinal.tagline;
  const ctaFEndereco = C.ctaFinal.endereco;

  return (
    <main id="main">
      {/* ========================== BREADCRUMB ========================== */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            <li>
              <Link href="/" data-cms-link="home">
                Grupo NTC
              </Link>
            </li>
            <li className="sep">/</li>
            <li className="current">O Grupo</li>
          </ol>
        </div>
      </nav>

      {/* ========================== 1. HERO INSTITUCIONAL ========================== */}
      <section
        className="grupo-hero"
        aria-label="O Grupo NTC · Plataforma nacional de soluções para a Administração Pública"
      >
        <div
          className="grupo-hero-bg"
          style={{ backgroundImage: `url('${heroImgUrl}')` }}
          aria-hidden
        />

        <div className="grupo-hero-seal" aria-hidden>
          <span className="seal-years">{heroSelo.anos}</span>
          <span className="seal-label">{heroSelo.label}</span>
        </div>

        <div className="container grupo-hero-content fade-in">
          <p className="grupo-hero-eyebrow">{heroEyebrow}</p>
          <h1 dangerouslySetInnerHTML={html(heroTitulo)} />
          <p className="grupo-hero-sub">{heroSub}</p>
          <div className="grupo-hero-ctas">
            {heroCtas.map((c, i) => (
              <a
                key={i}
                className={`btn ${c.variante === "dourado" ? "btn--gold" : "btn--ghost-light"}`}
                href={c.link}
              >
                {c.rotulo}
                {c.variante === "dourado" ? <span className="btn-arrow"> →</span> : null}
              </a>
            ))}
          </div>
        </div>

        <div className="grupo-hero-microbar" aria-hidden>
          {heroMicro.map((m, i) => (
            <div key={i}>
              <strong>{m.valor}</strong> {m.rotulo}
            </div>
          ))}
        </div>
      </section>

      {/* ========================== FAIXA DE METADADOS ========================== */}
      <section
        className="grupo-meta-bar grupo-meta-bar--dark"
        aria-label="Indicadores oficiais do Grupo NTC"
      >
        <div className="container">
          <div className="grupo-meta-grid fade-in">
            {indicadores.map((ind, i) => (
              <div key={i} className="grupo-meta-item">
                <span className="label">{ind.label}</span>
                <span className="value" dangerouslySetInnerHTML={html(ind.valor)} />
                {ind.valorSub ? <span className="value-sub">{ind.valorSub}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== NAV-BAR STICKY ========================== */}
      <NavBarAncoras />

      {/* ========================== 2. SÍNTESE INSTITUCIONAL ========================== */}
      <section className="grupo-section grupo-section--cream" id="sintese">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{sinteseEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(sinteseTitulo)} />
          </div>

          <div className="sintese-editorial fade-in">
            <div className="sintese-editorial-text">
              <p className="quem-lede">{sinteseLede}</p>
              <div className="quem-body">
                {sinteseParagrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={html(p)} />
                ))}
              </div>
            </div>

            <figure
              className="sintese-editorial-image"
              role="img"
              aria-label="Plenária institucional pública · Grupo NTC"
            >
              <figcaption className="sintese-editorial-seal">
                <p className="seal-eyebrow">{sinteseSelo.eyebrow}</p>
                <p className="seal-line">
                  <span dangerouslySetInnerHTML={html(sinteseSelo.linha1)} />
                  <br />
                  {sinteseSelo.linha2}
                </p>
              </figcaption>
            </figure>
          </div>

          <div className="sintese-block fade-in">
            <p dangerouslySetInnerHTML={html(sinteseFecho)} />
          </div>
        </div>
      </section>

      {/* ========================== 3. PROPOSTA DE VALOR ========================== */}
      <section className="grupo-section grupo-section--valor-dark" id="proposta-valor">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{pvEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(pvTitulo)} />
            <p className="intro">{pvIntro}</p>
          </div>

          <div className="pilares-grid pilares-grid--dark fade-in">
            {pvPilares.map((p, i) => (
              <article key={i} className="pilar-card">
                <span className="p-num">{p.numero ?? String(i + 1).padStart(2, "0")}</span>
                <h4>{p.titulo}</h4>
                <p>{p.descricao}</p>
              </article>
            ))}
          </div>

          <div className="sintese-block fade-in" style={{ marginTop: "var(--space-5)" }}>
            <p
              style={{ fontSize: "clamp(18px, 2vw, 22px)" }}
              dangerouslySetInnerHTML={html(pvFecho)}
            />
          </div>
        </div>
      </section>

      {/* ========================== 4. MISSÃO · VISÃO · VALORES ========================== */}
      <section className="grupo-section grupo-section--mvv-band" id="mvv">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{mvvEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(mvvTitulo)} />
            <p className="intro">{mvvIntro}</p>
          </div>

          <div className="mvv-band-grid fade-in">
            <article className="mvv-card">
              <span className="mvv-icon" aria-hidden>
                {ICONE_MVV.missao}
              </span>
              <div className="mvv-body">
                <p className="lbl">Missão</p>
                <h4>{mvvMissao.tituloCurto}</h4>
                <p>{mvvMissao.texto}</p>
              </div>
            </article>
            <article className="mvv-card">
              <span className="mvv-icon" aria-hidden>
                {ICONE_MVV.visao}
              </span>
              <div className="mvv-body">
                <p className="lbl">Visão</p>
                <h4>{mvvVisao.tituloCurto}</h4>
                <p>{mvvVisao.texto}</p>
              </div>
            </article>
            <article className="mvv-card">
              <span className="mvv-icon" aria-hidden>
                {ICONE_MVV.valores}
              </span>
              <div className="mvv-body">
                <p className="lbl">Valores</p>
                <h4>{mvvValores.tituloCurto}</h4>
                <p>{mvvValores.texto}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ========================== 5. ÁREAS ESTRATÉGICAS ========================== */}
      <section className="grupo-section" id="areas">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{aeEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(aeTitulo)} />
            <p className="intro">{aeIntro}</p>
          </div>

          <div className="portfolio-verticals portfolio-verticals--rich fade-in">
            {aeVerticais.map((v, i) => {
              const chips = v.chips;
              return (
                <a
                  key={i}
                  className={`portfolio-vert-card ${v.vertical}`}
                  href={v.ctaLink ?? "#portfolio"}
                  data-cms-link={`vertical-${v.vertical}`}
                >
                  <span className="vert-num">{v.numero ?? String(i + 1).padStart(2, "0")}</span>
                  <span className="vert-name">{v.label ?? "Área Estratégica"}</span>
                  <h3>{v.nome}</h3>
                  <p>{v.descricao}</p>
                  {v.areaLabel ? <p className="vert-area-label">{v.areaLabel}</p> : null}
                  {chips.length > 0 ? (
                    <div className="vert-programs" aria-label={`Programas da área ${v.nome}`}>
                      {chips.map((c, j) => (
                        <span key={j} className="vert-chip">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="vert-foot">
                    <span className="vert-count">
                      {v.contagemRotulo ?? `${chips.length} programas`}
                    </span>
                    <span className="vert-cta">{v.ctaRotulo ?? "Conhecer área →"}</span>
                  </div>
                </a>
              );
            })}
          </div>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "var(--grafite)",
              marginTop: "var(--space-4)",
              textAlign: "center",
              maxWidth: 880,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {aeFecho}
          </p>
        </div>
      </section>

      {/* ========================== 6. TRAJETÓRIA ========================== */}
      <section className="grupo-section grupo-section--cream" id="trajetoria">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{trEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(trTitulo)} />
            <p className="intro">{trIntro}</p>
          </div>

          <div className="trajetoria-visual fade-in">
            {trMarcos.map((m, i) => (
              <article
                key={i}
                className={`trajetoria-marco${m.destaque ? " is-highlight" : ""}`}
              >
                <span className="tm-year">
                  {m.ano.split("\n").map((linha, j, arr) => (
                    <span key={j}>
                      {linha}
                      {j < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </span>
                <span className="tm-dot" aria-hidden />
                <h4 className="tm-title">{m.titulo}</h4>
                <p className="tm-text">{m.texto}</p>
              </article>
            ))}
          </div>

          <div className="sintese-block fade-in" style={{ marginTop: "var(--space-5)" }}>
            <p
              style={{ fontSize: "clamp(18px, 2vw, 22px)", color: "var(--tinta)" }}
              dangerouslySetInnerHTML={html(trFecho)}
            />
          </div>
        </div>
      </section>

      {/* ========================== 7. VISÃO CONSOLIDADA DOS 15 PROGRAMAS ========================== */}
      <section className="grupo-section" id="portfolio">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{pcEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(pcTitulo)} />
            <p className="intro">{pcIntro}</p>
          </div>

          <div className="programas-matrix fade-in">
            {pcAreas.map((a, i) => (
              <section
                key={i}
                className={`programa-area area-${a.vertical}`}
                aria-labelledby={`pa-${a.vertical}-head`}
              >
                <header className="programa-area-head">
                  <h3
                    className="pa-name"
                    id={`pa-${a.vertical}-head`}
                    dangerouslySetInnerHTML={html(a.nome)}
                  />
                  {a.count ? <span className="pa-count">{a.count}</span> : null}
                </header>
                <div className="pa-grid">
                  {(a.programas ?? []).map((p, j) => (
                    <a
                      key={j}
                      className="pa-chip"
                      href={p.link ?? "#portfolio"}
                      data-cms-link={`programa-${p.sigla}`}
                    >
                      <span className="pc-sigla">{p.sigla}</span>
                      <span className="pc-desc">{p.descricao}</span>
                    </a>
                  ))}
                </div>
              </section>
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
            <a
              className="btn btn--primary"
              href={pcCtaTodos.link ?? "#portfolio"}
              data-cms-link="ver-todos-programas"
            >
              {pcCtaTodos.rotulo}
              <span className="btn-arrow"> →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================== 8. DIFERENCIAIS ========================== */}
      <section className="grupo-section grupo-section--cream" id="diferenciais">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{dfEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(dfTitulo)} />
            <p className="intro">{dfIntro}</p>
          </div>

          <div className="diff-6-grid fade-in">
            {dfCards.map((c, i) => (
              <div key={i} className="diff-6-card diff-icon">
                <span className="d-icon" aria-hidden>
                  {ICONE_DIFERENCIAIS[c.icone]}
                </span>
                <span className="d-num">
                  {c.numero ?? `${String(i + 1).padStart(2, "0")} · Diferencial`}
                </span>
                <h4>{c.titulo}</h4>
                <p>{c.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== 9. METODOLOGIA ========================== */}
      <section className="grupo-section" id="metodologia">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{mdEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(mdTitulo)} />
            <p className="intro">{mdIntro}</p>
          </div>

          <div className="metodo-flow fade-in">
            {mdEtapas.map((e, i) => (
              <article key={i} className="metodo-flow-step">
                <span className="mfs-num">
                  {e.numero ?? `Etapa ${String(i + 1).padStart(2, "0")}`}
                </span>
                <span className="mfs-icon" aria-hidden>
                  {ICONE_METODOLOGIA[e.icone]}
                </span>
                <h4>{e.titulo}</h4>
                <p>{e.descricao}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== 10. AUTORIDADE ========================== */}
      <section className="grupo-section grupo-section--autoridade-dark" id="autoridade">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{auEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(auTitulo)} />
            <p className="intro">{auIntro}</p>
          </div>

          <div className="autoridade-mosaic fade-in">
            {auCuradorias.map((c, i) => (
              <article key={i} className="am-card">
                <div
                  className={`am-photo ${c.fotoSlug}`}
                  role="img"
                  aria-label={`Curadoria · ${c.titulo}`}
                />
                <div className="am-body">
                  <span className="am-tag">
                    {c.tag ?? `Curadoria ${String(i + 1).padStart(2, "0")}`}
                  </span>
                  <h4 className="am-title">{c.titulo}</h4>
                  {c.count ? <span className="am-count">{c.count}</span> : null}
                  <p className="am-text">{c.texto}</p>
                  {c.ctaRotulo ? (
                    <a
                      className="am-cta"
                      href={c.ctaLink ?? "#cta-final"}
                      data-cms-link={`especialistas-${c.fotoSlug}`}
                    >
                      {c.ctaRotulo}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== 11. CREDIBILIDADE ========================== */}
      <section className="grupo-section grupo-section--oxford" id="credibilidade">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{crEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(crTitulo)} />
            <p className="intro">{crIntro}</p>
          </div>

          <div className="credibilidade-numbers fade-in">
            {crIndicadores.map((ind, i) => (
              <div key={i} className="cn-item">
                <div className="num">
                  {ind.valor}
                  {ind.sufixo ? <span className="suffix">{ind.sufixo}</span> : null}
                </div>
                <div className="label">{ind.label}</div>
              </div>
            ))}
          </div>

          <div
            className="credibilidade-mosaic fade-in"
            aria-label="Mosaico de credibilidade institucional"
          >
            {crMosaico.map((cell, i) => (
              <div
                key={i}
                className={[
                  "cm-cell",
                  cell.slug,
                  cell.wide ? "cm-wide" : "",
                  cell.tall ? "cm-tall" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="img"
                aria-label={cell.label}
              >
                <span className="cm-label">{cell.label}</span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.8vw, 19px)",
              lineHeight: 1.55,
              color: "var(--pergaminho-80)",
              marginTop: "var(--space-5)",
              textAlign: "center",
              maxWidth: 880,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {crFecho}
          </p>
        </div>
      </section>

      {/* ========================== 12. EVENTON ========================== */}
      <section className="grupo-section grupo-section--dark" id="eventon">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{evEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(evTitulo)} />
            <p className="intro">{evIntro}</p>
          </div>

          <div className="eventon-mockup fade-in">
            <div
              className="eventon-mockup-screen"
              role="img"
              aria-label="Mockup da plataforma EventON · transmissão ao vivo HD"
            >
              <div className="em-topbar">
                <span className="em-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
                <span className="em-url">{evMockup.urlBarra}</span>
                <span className="em-live">{evMockup.statusLabel}</span>
              </div>
              <div className="em-body">
                <div className="em-player" aria-hidden>
                  <span className="em-player-hd">{evMockup.playerHd}</span>
                  <span className="em-player-play" />
                  <span className="em-player-speaker">
                    {evMockup.playerTitulo}
                    <small>{evMockup.playerSub}</small>
                  </span>
                </div>
                <div className="em-chat" aria-hidden>
                  <p className="em-chat-head">{evMockup.chatTitulo}</p>
                  {evMockup.chatMensagens.map((msg, i) => (
                    <div key={i} className="em-msg">
                      <b>{msg.autor}</b>
                      <span>{msg.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="em-foot" aria-hidden>
                {evMockup.stats.map((s, i) => (
                  <span key={i} className="em-stat">
                    <strong>{s.valor}</strong> {s.rotulo}
                  </span>
                ))}
              </div>
            </div>

            <div className="eventon-features-list">
              {evFeatures.map((f, i) => (
                <article key={i} className="efl-item">
                  <span className="efl-icon" aria-hidden>
                    {ICONE_EVENTON[f.icone]}
                  </span>
                  <div>
                    <h4>{f.titulo}</h4>
                    <p>{f.descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.8vw, 19px)",
              lineHeight: 1.55,
              color: "var(--pergaminho-80)",
              marginTop: "var(--space-4)",
              textAlign: "center",
              maxWidth: 760,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {evFecho}
          </p>
        </div>
      </section>

      {/* ========================== 13. SEGURANÇA JURÍDICA ========================== */}
      <section className="grupo-section grupo-section--cream" id="juridico">
        <div className="container">
          <div className="grupo-section-head fade-in">
            <p className="eyebrow">{juEyebrow}</p>
            <h2 dangerouslySetInnerHTML={html(juTitulo)} />
            <p className="intro">{juIntro}</p>
          </div>

          <div className="juridico-block fade-in">
            <p dangerouslySetInnerHTML={html(juFundamento)} />
            <div className="juridico-quote">{juQuote}</div>
          </div>

          <div className="juridico-diretrizes fade-in">
            {juDiretrizes.map((d, i) => (
              <article key={i} className="diretriz-card">
                <span className="dt-num">
                  {d.numero ?? `Diretriz ${String(i + 1).padStart(2, "0")}`}
                </span>
                <h4>{d.titulo}</h4>
                <p>{d.descricao}</p>
              </article>
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: "12px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              color: "var(--prata)",
              marginTop: "var(--space-4)",
              textAlign: "center",
            }}
          >
            {juRodape}
          </p>
        </div>
      </section>

      {/* ========================== 14. CTA FINAL ========================== */}
      <section className="grupo-cta-final grupo-cta-final--image" id="cta-final">
        <div className="container fade-in">
          <p className="eyebrow gold">{ctaFEyebrow}</p>
          <h2 dangerouslySetInnerHTML={html(ctaFTitulo)} />
          <p className="grupo-cta-final-sub">{ctaFSub}</p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {ctaFCtas.map((c, i) => (
              <a
                key={i}
                className={`btn ${c.variante === "dourado" ? "btn--gold" : "btn--ghost-light"}`}
                href={c.link}
              >
                {c.rotulo}
                {c.variante === "dourado" ? <span className="btn-arrow"> →</span> : null}
              </a>
            ))}
          </div>
          <p className="grupo-cta-tagline">{ctaFTag}</p>
          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: "11px",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "var(--pergaminho-80)",
              marginTop: "var(--space-4)",
            }}
          >
            {ctaFEndereco}
          </p>
        </div>
      </section>
    </main>
  );
}
