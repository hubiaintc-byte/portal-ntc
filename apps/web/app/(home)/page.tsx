import type { Metadata } from "next";

import {
  EVENTOS_AGENDA,
  EVENTOS_LISTAGEM,
} from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";
import {
  paraCardHomePrincipal,
  paraCardHomeSecundario,
} from "@/lib/eventos/adaptarParaCard";
import { buscarOverride } from "@/lib/cms/overrideEventoOnline";

import { SliderHero, type SlidePremium } from "./SliderHero";
import { FALLBACK_HOME } from "./conteudoFallback";

/**
 * Home v3 Premium — portada literal do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html.
 *
 * Estrutura na ordem do protótipo (15 seções).
 *
 * Conteúdo: este arquivo consome `FALLBACK_HOME` de `conteudoFallback.ts`
 * — extração literal dos textos do HTML aprovado. Quando o Global Home
 * do Payload tiver os mesmos campos (sessão futura), substituímos a
 * importação por um adapter `carregarHome()` que faz fallback para
 * este objeto em caso de erro.
 *
 * Política da sessão "porta do HTML": textos = HTML aprovado; CMS é
 * fonte de exibição (eventos, programas, especialistas dinâmicos),
 * não de copy editorial.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Grupo NTC · Inteligência institucional. Impacto real.",
  description:
    "O novo padrão da formação institucional para a Administração Pública brasileira. Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
};

const f = FALLBACK_HOME;

type EventoReal = NonNullable<(typeof EVENTOS_AGENDA)[keyof typeof EVENTOS_AGENDA]>;

/**
 * Sobrescreve a capa estática de cada evento (`card.imagemUrl`) pela capa do
 * CMS quando houver, casando por slug via `buscarOverride` (mesma fonte da
 * página /agenda/[slug]). Falha do CMS → mantém a capa estática. Só a capa é
 * sobrescrita aqui; o resto do card permanece do conteúdo aprovado.
 */
async function aplicarCapaCms(eventos: EventoReal[]): Promise<EventoReal[]> {
  return Promise.all(
    eventos.map(async (e) => {
      if (!e.slug || !e.card) return e;
      try {
        const ovr = await buscarOverride(e.slug);
        if (ovr?.coverUrl) {
          return { ...e, card: { ...e.card, imagemUrl: ovr.coverUrl } };
        }
      } catch {
        // CMS fora do ar → capa estática (fallback silencioso).
      }
      return e;
    }),
  );
}

export default async function HomePage() {
  // Eventos reais (EVENTOS_AGENDA via adapter) substituem os mockados.
  // Grandes = card.destaqueHome (EDUTEC M01/M02/M04); menores = os demais (PROGE).
  const eventosBase = EVENTOS_LISTAGEM.map((slug) => EVENTOS_AGENDA[slug]).filter(
    (e): e is EventoReal => Boolean(e),
  );
  const eventosReais = await aplicarCapaCms(eventosBase);
  const eventosPrincipais = eventosReais
    .filter((e) => e.card?.destaqueHome)
    .map(paraCardHomePrincipal)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const eventosSecundarios = eventosReais
    .filter((e) => !e.card?.destaqueHome)
    .map(paraCardHomeSecundario)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <main id="main">
      <SliderHero slides={f.slider.slides as SlidePremium[]} intervaloMs={f.slider.intervaloMs} />

      {/* =================== EVENTOS · GRADE 3+3 =================== */}
      <section
        className="events-prime"
        id="eventos-abertos"
        aria-label="Eventos e módulos com inscrições abertas"
      >
        <div className="container">
          <div className="events-status-bar fade-in">
            <span className="live-pill">{f.statusBar.livePill}</span>
            <span>{f.statusBar.atualizadoEm}</span>
          </div>

          <div className="section-head fade-in">
            <p className="eyebrow gold">{f.eventosSecao.eyebrow}</p>
            <h2>{f.eventosSecao.titulo}</h2>
            <p className="section-intro">{f.eventosSecao.intro}</p>
          </div>

          <div className="events-grid fade-in">
            {eventosPrincipais.map((evt, idx) => (
              <article
                key={idx}
                className={`event-card ${evt.destaque ? "is-featured" : ""}`}
                data-area={evt.area}
              >
                {evt.destaque ? (
                  <span className="event-featured-badge">Evento em destaque</span>
                ) : null}
                <span className={`event-status-tag status-${evt.statusTag.tipo}`}>
                  {evt.statusTag.rotulo}
                </span>
                <div className="event-cover">
                  <div
                    className="event-cover-img"
                    style={{ backgroundImage: `url('${evt.imagemSrc}')` }}
                    aria-hidden="true"
                  />
                  <div className="event-cover-overlay" />
                  <div className="event-cover-meta">
                    <div className={`event-date-block ${evt.data.variante}`}>
                      {evt.data.variante === "single" ? (
                        <>
                          <span className="day">{evt.data.dia}</span>
                          <span className="mon-yr">{evt.data.monYr}</span>
                        </>
                      ) : evt.data.variante === "range" ? (
                        <>
                          <span className="days">
                            {evt.data.diasInicio}
                            <span className="dash">–</span>
                            {evt.data.diasFim}
                          </span>
                          <span className="mon-yr">{evt.data.monYr}</span>
                        </>
                      ) : (
                        <>
                          <span className="count">
                            <span className="number">{evt.data.encontros?.split(" ")[0]}</span>{" "}
                            {evt.data.encontros?.split(" ").slice(1).join(" ")}
                          </span>
                          <span className="period">{evt.data.periodo}</span>
                        </>
                      )}
                    </div>
                    <span className={`event-modality ${evt.modalidade.classe ?? ""}`}>
                      {evt.modalidade.texto}
                    </span>
                  </div>
                </div>
                <div className="event-body">
                  <p className="event-program-link">
                    {evt.programLink.split(" · ")[0]} <span className="dot">·</span>{" "}
                    {evt.programLink.split(" · ").slice(1).join(" · ")}
                  </p>
                  <h3>{evt.titulo}</h3>
                  <div className="event-speakers-line">
                    <span className="label">{evt.coordenacao.label}</span>
                    <span className="names">{evt.coordenacao.nomes}</span>
                  </div>
                  <div className="event-meta-essentials">
                    <span>{evt.meta.ch}</span>
                    <span>{evt.meta.local}</span>
                  </div>
                  <div className="event-program-binding">
                    <span className="epb-label">Integra o programa</span>
                    <span className="epb-program">
                      <a href={evt.programaBinding.href}>{evt.programaBinding.sigla}</a>
                    </span>
                  </div>
                  <div className="event-pricing">
                    <span className="event-price">
                      Inscrição individual<strong>{evt.precoIndividual}</strong>
                    </span>
                    <span className="event-price institutional">
                      Equipes / órgãos<strong>{evt.precoInstitucional}</strong>
                    </span>
                  </div>
                </div>
                <div className="event-actions">
                  <a className="btn btn--gold" href={evt.ctas.principal.href}>
                    {evt.ctas.principal.rotulo} <span className="btn-arrow">→</span>
                  </a>
                  <div className="event-actions-row">
                    <a className="link-arrow" href={evt.ctas.detalhes.href}>
                      {evt.ctas.detalhes.rotulo}
                    </a>
                    <a className="link-arrow" href={evt.ctas.grupo.href}>
                      {evt.ctas.grupo.rotulo}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="events-secondary fade-in">
            <div className="events-secondary-head">
              <div>
                <p className="eyebrow gold">{f.eventosSecundariosCabecalho.eyebrow}</p>
                <h3>{f.eventosSecundariosCabecalho.titulo}</h3>
              </div>
              <a className="link-arrow" href={f.eventosSecundariosCabecalho.ctaHref}>
                {f.eventosSecundariosCabecalho.ctaRotulo}
              </a>
            </div>

            <div className="events-secondary-grid">
              {eventosSecundarios.map((evt, idx) => (
                <article key={idx} className="event-secondary-card" data-area={evt.area}>
                  <div className="es-cover">
                    <div
                      className="es-cover-img"
                      style={{ backgroundImage: `url('${evt.imagemSrc}')` }}
                      aria-hidden="true"
                    />
                    <div className="es-cover-overlay" />
                    <div className={`es-date ${evt.data.variante}`}>
                      {evt.data.variante === "single" ? (
                        <>
                          <span className="day">{evt.data.dia}</span>
                          <span className="mon-yr">{evt.data.monYr}</span>
                        </>
                      ) : evt.data.variante === "range" ? (
                        <>
                          <span className="days">
                            {evt.data.diasInicio}
                            <span className="dash">–</span>
                            {evt.data.diasFim}
                          </span>
                          <span className="mon-yr">{evt.data.monYr}</span>
                        </>
                      ) : (
                        <>
                          <span className="count">
                            <span className="number">{evt.data.encontros?.split(" ")[0]}</span>{" "}
                            {evt.data.encontros?.split(" ").slice(1).join(" ")}
                          </span>
                          <span className="period">{evt.data.periodo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">{evt.programa}</p>
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
                    <a className="es-cta" href={evt.ctaHref}>
                      {evt.ctaRotulo}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="events-prime-foot fade-in">
            <a className="btn btn--primary" href={f.eventosFooter.ctaPrincipal.href}>
              {f.eventosFooter.ctaPrincipal.rotulo} <span className="btn-arrow">→</span>
            </a>
            <a className="btn btn--secondary" href={f.eventosFooter.ctaSecundario.href}>
              {f.eventosFooter.ctaSecundario.rotulo}
            </a>
          </div>
        </div>
      </section>

      {/* =================== AGENDA · FAIXA =================== */}
      <section className="agenda-band" id="capacitacao" aria-label="Acesso rápido à agenda">
        <div className="container">
          <div className="agenda-band-inner fade-in">
            <div>
              <h3>{f.agendaBand.titulo}</h3>
              <p>{f.agendaBand.descricao}</p>
            </div>
            <div className="agenda-filters" role="tablist" aria-label="Filtros rápidos da agenda">
              {f.agendaBand.chips.map((chip) => (
                <button key={chip} type="button" className="agenda-chip">
                  {chip}
                </button>
              ))}
            </div>
            <a className="btn btn--gold" href={f.agendaBand.cta.href}>
              {f.agendaBand.cta.rotulo} <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =================== APRESENTAÇÃO INSTITUCIONAL ENXUTA =================== */}
      <section className="intro-short section--cream" id="sobre">
        <div className="container">
          <div className="intro-short-inner fade-in">
            <p className="intro-short-headline">{f.introCurta.headline}</p>
            <div className="intro-short-body">
              <p dangerouslySetInnerHTML={{ __html: f.introCurta.corpoHtml }} />
              <div className="intro-short-highlights">
                {f.introCurta.highlights.map((h, idx) => (
                  <div key={idx} className="intro-highlight">
                    <div className={`num ${h.numEhTexto ? "text" : ""}`}>{h.num}</div>
                    <div
                      className="lbl"
                      dangerouslySetInnerHTML={{ __html: h.lbl.replace(/\n/g, "<br />") }}
                    />
                  </div>
                ))}
              </div>
              <a className="link-arrow" href={f.introCurta.link.href}>
                {f.introCurta.link.rotulo}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =================== PROGRAMAS =================== */}
      <section className="programs-section" id="programas">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow gold">{f.programasSecao.eyebrow}</p>
            <h2>{f.programasSecao.titulo}</h2>
            <p className="section-intro">{f.programasSecao.intro}</p>
          </div>

          <p className="programs-intro-line">{f.programasSecao.introLinha}</p>

          <div className="area-cards fade-in">
            {f.areas.map((area) => (
              <article key={area.vert} className="area-card" data-vert={area.vert}>
                <div
                  className="area-card-img"
                  style={{ backgroundImage: `url('${area.imagemSrc}')` }}
                  aria-hidden="true"
                />
                <div className="area-card-overlay" />
                <span className="area-card-num">{area.num}</span>
                <div className="area-card-content">
                  <p className="area-vertical-tag">{area.verticalTag}</p>
                  <h3>
                    {area.tituloLinha1}
                    <br />
                    {area.tituloLinha2}
                  </h3>
                  <p className="area-tagline">{area.tagline}</p>
                  <div className="area-card-divider" />
                  <p className="area-card-meta">
                    <strong>{area.programasCount}</strong> Programas estratégicos
                  </p>
                  <div className="area-card-actions">
                    <a className="link-arrow light" href={area.linkProgramas.href}>
                      {area.linkProgramas.rotulo}
                    </a>
                    <a className="link-arrow light" href={area.linkEventos.href}>
                      {area.linkEventos.rotulo}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="programs-curated-head fade-in">
            <div>
              <h3>{f.programasSecao.evidenciaTitulo}</h3>
              <p>{f.programasSecao.evidenciaSub}</p>
            </div>
            <a className="link-arrow" href={f.programasSecao.verTodosLink.href}>
              {f.programasSecao.verTodosLink.rotulo}
            </a>
          </div>

          <div className="programs-curated fade-in">
            {f.programasEvidencia.map((p) => (
              <article
                key={p.sigla}
                className="program-card-evidence"
                data-area={p.area}
                title={p.tituloLong}
              >
                <div className="program-evidence-head">
                  <h4 className="program-evidence-sigla">{p.sigla}</h4>
                  <span className="program-evidence-area">{p.areaLabel}</span>
                </div>
                <p className="program-evidence-name">{p.nome}</p>
                <p className="program-evidence-value">{p.valor}</p>
                {p.flagModuloAberto ? (
                  <span className="program-evidence-flag">Módulo aberto</span>
                ) : null}
                <div className="program-evidence-meta">
                  <span>{p.modulosCount}</span>
                  <span>{p.cargaHoraria}</span>
                </div>
                <div className="program-evidence-actions">
                  <a
                    className={`link-arrow ${p.corLink === "padrao" ? "" : p.corLink}`}
                    href={p.ctaConhecer.href}
                  >
                    {p.ctaConhecer.rotulo}
                  </a>
                  <a
                    className={`link-arrow ${p.corLink === "padrao" ? "" : p.corLink}`}
                    href={p.ctaSecundario.href}
                  >
                    {p.ctaSecundario.rotulo}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="programs-cta-foot fade-in">
            <a className="btn btn--primary" href={f.programasFooter.ctaPrincipal.href}>
              {f.programasFooter.ctaPrincipal.rotulo} <span className="btn-arrow">→</span>
            </a>
            <a className="btn btn--secondary" href={f.programasFooter.ctaSecundario.href}>
              {f.programasFooter.ctaSecundario.rotulo}
            </a>
          </div>
        </div>
      </section>

      {/* =================== ESPECIALISTAS / CURADORIA =================== */}
      <section
        className="experts-section experts-section--premium"
        id="docentes"
        aria-label="Curadoria científica e corpo docente"
      >
        <div className="experts-parallax" aria-hidden="true" />
        <div className="container">
          <header className="curadoria-selo fade-in">
            <div className="curadoria-selo-text">
              <p className="curadoria-selo-eyebrow">{f.curadoria.eyebrow}</p>
              <h2 className="curadoria-selo-headline">
                <strong>{f.curadoria.headlineBold}</strong>
              </h2>
              <p className="curadoria-selo-subhead">{f.curadoria.subhead}</p>
              <p className="curadoria-selo-context">{f.curadoria.contexto}</p>
            </div>
            <a className="curadoria-selo-link" href={f.curadoria.ctaLink.href}>
              {f.curadoria.ctaLink.rotulo}
            </a>
          </header>

          <div className="curadoria-grid fade-in" role="list">
            {f.curadoria.vitrines.map((v) => (
              <a
                key={v.vertical}
                className="vitrine"
                data-vertical={v.vertical}
                role="listitem"
                href={v.href}
              >
                <div className="vitrine-img" aria-hidden="true" />
                <div className="vitrine-content">
                  <p className="vitrine-eyebrow">{v.eyebrow}</p>
                  <h3
                    className="vitrine-curadoria-label"
                    dangerouslySetInnerHTML={{ __html: v.labelDestaque }}
                  />
                  <p className="vitrine-name">{v.nome}</p>
                  <div className="vitrine-divider" aria-hidden="true" />
                  <ul className="vitrine-credenciais">
                    {v.credenciais.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <span className="vitrine-cta">{v.cta}</span>
                </div>
              </a>
            ))}
          </div>

          <div className="curadoria-cta-final fade-in">
            <p className="curadoria-cta-final-text">{f.curadoria.rodape.texto}</p>
            <a href={f.curadoria.rodape.href}>
              {f.curadoria.rodape.cta}
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =================== SOLUÇÕES =================== */}
      <section className="solutions" id="solucoes">
        <div className="container">
          <div className="solutions-grid fade-in">
            <div className="solutions-content">
              <p className="eyebrow">{f.solucoes.eyebrow}</p>
              <h2>{f.solucoes.titulo}</h2>
              <p>{f.solucoes.corpo}</p>
              <ul className="solutions-list">
                {f.solucoes.lista.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {f.solucoes.ctas.map((c, idx) => (
                  <a
                    key={idx}
                    className={`btn ${c.variante === "primary" ? "btn--primary" : "btn--secondary"}`}
                    href={c.href}
                  >
                    {c.rotulo}
                    {c.variante === "primary" ? <span className="btn-arrow">→</span> : null}
                  </a>
                ))}
              </div>
            </div>
            <div className="solutions-image">
              <img src={f.solucoes.imagemSrc} alt={f.solucoes.imagemAlt} loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* =================== ONLINE × PRESENCIAL =================== */}
      <section className="section section--cream">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow">{f.modalidades.eyebrow}</p>
            <h2>{f.modalidades.titulo}</h2>
            <p className="section-intro">{f.modalidades.intro}</p>
          </div>

          <div className="modes-grid fade-in">
            {f.modalidades.cards.map((m) => (
              <article key={m.titulo} className="mode-card">
                <div
                  className="mode-card-bg"
                  style={{ backgroundImage: `url('${m.imagemSrc}')` }}
                  aria-hidden="true"
                />
                <div className="mode-card-overlay" />
                <div className="mode-card-content">
                  <p className="eyebrow gold">{m.eyebrow}</p>
                  <h3>{m.titulo}</h3>
                  <div className="mode-list">
                    {m.lista.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <a className="btn btn--gold" href={m.ctaHref}>
                    {m.ctaRotulo} <span className="btn-arrow">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =================== EVENTON =================== */}
      <section className="eventon eventon-section--parallax" id="eventon">
        <div className="eventon-parallax" aria-hidden="true" />
        <div className="eventon-bg" aria-hidden="true" />
        <div className="container eventon-grid fade-in">
          <div>
            <p className="eyebrow gold">{f.eventOn.eyebrow}</p>
            <h2>{f.eventOn.titulo}</h2>
            <p>{f.eventOn.descricao}</p>
            <div className="eventon-ctas">
              {f.eventOn.ctas.map((c, idx) => (
                <a key={idx} className={`btn btn--${c.variante}`} href={c.href}>
                  {c.rotulo}
                  {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                </a>
              ))}
            </div>
          </div>

          <div className="eventon-ops">
            {f.eventOn.operacoes.map((op) => (
              <div key={op.num} className="eventon-op">
                <span className="op-num">{op.num}</span>
                <h4>{op.titulo}</h4>
                <p>{op.descricao}</p>
                <a href={op.link}>{op.linkRotulo} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CONTRATAÇÃO INSTITUCIONAL =================== */}
      <section className="contracting contratacao-section--parallax" id="contratacao">
        <div className="contratacao-parallax" aria-hidden="true" />
        <div className="contracting-bg" aria-hidden="true" />
        <div className="container contracting-grid fade-in">
          <div>
            <p className="eyebrow gold">{f.contratacao.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: f.contratacao.tituloHtml }} />
            <p>{f.contratacao.descricao}</p>
            <div className="contracting-ctas">
              {f.contratacao.ctas.map((c, idx) => (
                <a key={idx} className={`btn btn--${c.variante}`} href={c.href}>
                  {c.rotulo}
                  {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                </a>
              ))}
            </div>
          </div>

          <aside className="contracting-options">
            <h4>{f.contratacao.asideTitulo}</h4>
            <ul>
              {f.contratacao.modelos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* =================== DIFERENCIAIS =================== */}
      <section className="section section--tight">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow">{f.diferenciais.eyebrow}</p>
            <h2>{f.diferenciais.titulo}</h2>
          </div>

          <div className="diff-grid fade-in">
            {f.diferenciais.cards.map((d) => (
              <div key={d.num} className="diff-card">
                <span className="diff-num">{d.num}</span>
                <h4>{d.titulo}</h4>
                <p>{d.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== NÚMEROS =================== */}
      <section className="numbers-band">
        <div className="container">
          <div className="numbers-grid fade-in">
            {f.numeros.band.map((n) => (
              <div key={n.valor} className="number-item">
                <div className="num text">{n.valor}</div>
                <div className="label">{n.label}</div>
              </div>
            ))}
          </div>
          <p className="numbers-disclaimer">{f.numeros.disclaimer}</p>
        </div>
      </section>

      {/* =================== PROVA INSTITUCIONAL =================== */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-banner fade-in">
            <p className="eyebrow">{f.prova.eyebrow}</p>
            <h3>{f.prova.headline}</h3>
          </div>
          <div className="trust-categories fade-in">
            {f.prova.categorias.map((cat) => (
              <div key={cat} className="trust-cat">
                <div className="icon-line" />
                <h4>{cat}</h4>
              </div>
            ))}
          </div>
          <p className="placeholder-note">{f.prova.nota}</p>
        </div>
      </section>

      {/* =================== CTA FINAL =================== */}
      <section className="cta-final" id="contato">
        <div className="container fade-in">
          <p className="eyebrow gold">{f.ctaFinal.eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: f.ctaFinal.tituloHtml }} />
          <p className="cta-final-sub">{f.ctaFinal.subtitulo}</p>
          <div className="cta-final-buttons">
            {f.ctaFinal.ctas.map((c, idx) => (
              <a key={idx} className={`btn btn--${c.variante}`} href={c.href}>
                {c.rotulo}
                {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
              </a>
            ))}
          </div>
          <p className="cta-tagline">{f.ctaFinal.tagline}</p>
        </div>
      </section>
    </main>
  );
}
