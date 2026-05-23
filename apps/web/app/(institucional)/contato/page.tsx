import type { Metadata } from "next";
import Link from "next/link";

import {
  CHANNELS,
  CTA_FINAL,
  FAQS,
  HERO,
  HQ,
  LGPD,
  SLA_HORARIOS,
  SLAS,
  VERTICAIS,
} from "./conteudoContato";
import { EfeitosContato } from "./EfeitosContato";
import { FaqAccordion } from "./FaqAccordion";
import { RoteadorFormularios } from "./RoteadorFormularios";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contato — Canais institucionais · Grupo NTC",
  description:
    "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa. Atendimento humano, com retorno em horário comercial.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/contato",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Contato — Canais institucionais · Grupo NTC",
    description:
      "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa.",
    url: "https://www.grupontc.com.br/contato",
    images: [
      {
        url: "https://www.grupontc.com.br/img/og/og-institucional.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contato — Canais institucionais · Grupo NTC",
    description:
      "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa.",
  },
};

export default function ContatoPage() {
  return (
    <>
      <main id="main">
        {/* ============================================================
            1) HERO INSTITUCIONAL · SLIM
            ============================================================ */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Contato">
          <div className="hero-page-bg" aria-hidden="true"></div>
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              <Link href={HERO.breadcrumbHomeHref}>{HERO.breadcrumbHomeLabel}</Link>
              <span className="sep" aria-hidden="true"></span>
              <span className="current">{HERO.breadcrumbCurrent}</span>
            </nav>
            <p className="eyebrow gold" style={{ marginTop: "var(--space-3)" }}>
              {HERO.eyebrow}
            </p>
            <h1>
              {HERO.tituloAntes}
              <span className="accent">{HERO.tituloAccent}</span>
              {HERO.tituloDepois}
            </h1>
            <p className="hero-page-sub">{HERO.lede}</p>
            <div className="hero-quicklinks">
              {HERO.quicklinks.map((q) => (
                <a key={q.href} href={q.href} data-cms-link={q.cmsLink}>
                  {q.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            2 + 3) ROTEADOR DE FORMULÁRIOS · TABS + 4 PAINÉIS
            ============================================================ */}
        <RoteadorFormularios />

        {/* ============================================================
            4) CANAIS DIRETOS + SEDE + MAPA
            ============================================================ */}
        <section
          className="channels"
          id="canais-diretos"
          aria-label="Canais diretos e sede institucional"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">Canais diretos</p>
              <h2>Prefere falar diretamente? Use os canais oficiais.</h2>
              <p className="section-intro">
                Atendimento humano, com encaminhamento direto à área responsável. Operado pela
                coordenação do Instituto NTC do Brasil em horário comercial.
              </p>
            </div>

            <div className="channels-grid">
              <div className="channels-list">
                {CHANNELS.map((c) => (
                  <div
                    key={c.data}
                    className={`channel-card${c.destaque ? " is-featured" : ""}`}
                    data-channel={c.data}
                  >
                    <div className="channel-icon" aria-hidden="true">
                      {c.iconeChar}
                    </div>
                    <div className="channel-body">
                      <p className="label">{c.label}</p>
                      <p className="value">{c.valor}</p>
                      <p className="note">{c.nota}</p>
                    </div>
                    <div className="channel-action">
                      <a
                        className={`link-arrow${c.acaoCrimson ? " crimson" : ""}`}
                        href={c.acaoHref}
                        data-cms-link={c.acaoCmsLink}
                        {...(c.acaoTarget
                          ? { target: c.acaoTarget, rel: "noopener noreferrer" }
                          : {})}
                      >
                        {c.acaoTexto}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hq-card fade-in">
                <div className="hq-head">
                  <h3>Sede institucional</h3>
                  <span className="hq-pill">{HQ.cidade}</span>
                </div>
                <p
                  className="hq-address"
                  dangerouslySetInnerHTML={{ __html: HQ.enderecoHtml }}
                />
                <div
                  className="hq-map"
                  aria-label="Mapa da sede do Instituto NTC do Brasil em Brasília — DF"
                >
                  <iframe
                    src={HQ.mapaIframeSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={HQ.mapaIframeTitle}
                  />
                </div>
                <div className="hq-foot">
                  <a
                    className="btn btn--secondary btn--mini"
                    href={HQ.mapsBotaoHref}
                    data-cms-link="maps-sede"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir no Google Maps <span className="btn-arrow">→</span>
                  </a>
                  <a className="link-arrow" href="#tab-proposta" data-cms-link="agendar-visita">
                    Solicitar reunião institucional
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            5) ATENDIMENTO POR VERTICAL
            ============================================================ */}
        <section
          className="section section--cream"
          aria-label="Atendimento dedicado por vertical do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">Atendimento por vertical</p>
              <h2>Coordenação dedicada · Educação, Gestão Pública e Saúde.</h2>
              <p className="section-intro">
                Cada vertical do Grupo NTC tem uma coordenação técnica e comercial dedicada, com
                pessoas que conhecem profundamente o setor — redes públicas de ensino,
                Administração Pública e o SUS. Escolha o canal que faz sentido à sua demanda.
              </p>
            </div>

            <div className="verticals-grid">
              {VERTICAIS.map((v) => (
                <article
                  key={v.vertical}
                  className="vert-card fade-in"
                  data-vertical={v.vertical}
                >
                  <span className="vert-eyebrow">{v.eyebrow}</span>
                  <h3>{v.titulo}</h3>
                  <p className="vert-lede">{v.lede}</p>
                  <div className="vert-info">
                    <div>
                      <b>Programas</b>
                      {` ${v.programas}`}
                    </div>
                    <div>
                      <b>Canais</b>{" "}
                      <span dangerouslySetInnerHTML={{ __html: v.canaisHtml }} />
                    </div>
                  </div>
                  <div className="vert-cta">
                    <a
                      className="btn-vert"
                      href={v.conhecerHref}
                      data-cms-link={v.conhecerCmsLink}
                    >
                      Conhecer a vertical
                    </a>
                    <a
                      className="btn-vert"
                      href="#tab-proposta"
                      data-cms-link={v.propostaCmsLink}
                      data-vertical-preset={v.vertical}
                    >
                      Solicitar proposta
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            6) PRAZOS DE RETORNO (SLA BAR)
            ============================================================ */}
        <section className="sla-bar" aria-label="Prazos de retorno por canal de atendimento">
          <div className="container">
            <div
              className="section-head fade-in"
              style={{ marginBottom: "var(--space-4)", color: "var(--pergaminho)" }}
            >
              <p className="eyebrow" style={{ color: "var(--dourado-soft)" }}>
                Prazos de retorno
              </p>
              <h2
                style={{
                  color: "var(--pergaminho)",
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                }}
              >
                Quanto tempo você pode esperar por uma resposta.
              </h2>
            </div>
            <div className="sla-grid fade-in">
              {SLAS.map((sla) => (
                <div key={sla.label} className="sla-cell">
                  <div className="sla-num">{sla.numero}</div>
                  <div className="sla-label">{sla.label}</div>
                  <p className="sla-note">{sla.nota}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid rgba(244, 241, 232, 0.18)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                fontFamily: "var(--font-cond)",
                fontSize: "12.5px",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "var(--pergaminho-80)",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: SLA_HORARIOS.comercialHtml }} />
              <span dangerouslySetInnerHTML={{ __html: SLA_HORARIOS.suporteHtml }} />
            </div>
          </div>
        </section>

        {/* ============================================================
            7) FAQ
            ============================================================ */}
        <section
          className="faq"
          id="faq"
          aria-label="Perguntas frequentes sobre contato e atendimento"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">FAQ · Contato e atendimento</p>
              <h2>Perguntas frequentes sobre relacionamento institucional.</h2>
              <p className="section-intro">
                Reunimos as 8 dúvidas mais recorrentes sobre proposta institucional, inscrição em
                grupo, faturamento por órgão público, certificação e prazos de retorno. Se a sua
                não está aqui, use o canal de Atendimento Geral.
              </p>
            </div>

            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* ============================================================
            8) LGPD INSTITUCIONAL
            ============================================================ */}
        <section className="lgpd" id="lgpd" aria-label="Tratamento de dados e LGPD">
          <div className="container">
            <div className="lgpd-grid fade-in">
              <div>
                <p className="eyebrow lgpd-eyebrow">{LGPD.eyebrow}</p>
                <h2>{LGPD.titulo}</h2>
                {LGPD.paragrafosHtml.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <p style={{ marginTop: "var(--space-3)" }}>
                  <Link
                    className="link-arrow light"
                    href={LGPD.ctaPrivacidadeHref}
                    data-cms-link="legal-privacidade"
                  >
                    {LGPD.ctaPrivacidadeTexto}
                  </Link>
                </p>
              </div>
              <div className="lgpd-cards">
                {LGPD.cells.map((cell) => (
                  <div key={cell.titulo} className="lgpd-cell">
                    <b>{cell.titulo}</b>
                    <span>{cell.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            9) CTA INSTITUCIONAL FINAL
            ============================================================ */}
        <section className="cta-final" aria-label="Chamada institucional de encerramento">
          <div className="container">
            <div className="cta-final-inner fade-in">
              <div>
                <p className="eyebrow light" style={{ color: "var(--dourado-soft)" }}>
                  {CTA_FINAL.eyebrow}
                </p>
                <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL.tituloHtml }} />
                <p>{CTA_FINAL.paragrafo}</p>
              </div>
              <div className="cta-final-actions">
                {CTA_FINAL.acoes.map((acao) => (
                  <a
                    key={acao.cmsLink}
                    className={`btn btn--${acao.variant}`}
                    href={acao.href}
                    data-cms-link={acao.cmsLink}
                  >
                    {acao.texto}
                    {acao.comArrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <EfeitosContato />
    </>
  );
}
