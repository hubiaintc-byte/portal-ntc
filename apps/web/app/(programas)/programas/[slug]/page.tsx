import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PROGRAMAS,
  SLUGS_VALIDOS,
  calcularRelacionados,
} from "./conteudoIndex";
import { NavBarAncoras } from "./NavBarAncoras";
import { FaqAcordeao } from "./FaqAcordeao";
import { ModulosAcordeao } from "./ModulosAcordeao";

/**
 * Página `/programas/[slug]` — porta literal das ~13 seções dos
 * 15 protótipos `*_Pagina_Programa_*.html`.
 *
 * Conteúdo: `PROGRAMAS[slug]` (conteudoIndex.ts) com textos
 * extraídos 1:1 do HTML. Cromático: `<main className="program-page"
 * data-programa={siglaCss}>` ativa os seletores específicos do CSS
 * portado em programas-prototipo.css.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  return SLUGS_VALIDOS.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function primeiraFrase(html: string): string {
  const texto = stripHtml(html);
  const ponto = texto.indexOf(". ");
  return ponto > 0 ? texto.slice(0, ponto + 1) : texto;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PROGRAMAS[slug];
  if (!p) return { title: "Programa · Grupo NTC" };
  return {
    title: `${p.siglaExibida} · ${p.nomeCompleto}`,
    description: primeiraFrase(p.visaoGeral.corpoHtml),
    openGraph: {
      title: `${p.siglaExibida} · ${p.nomeCompleto}`,
      description: primeiraFrase(p.visaoGeral.corpoHtml),
      images: [{ url: p.hero.bgSrc }],
    },
  };
}

function classeCta(variante?: string): string {
  switch (variante) {
    case "gold":
      return "btn btn--gold";
    case "ghost-light":
    default:
      return "btn btn--ghost-light";
  }
}

// TODO: JSON-LD Course (Mapa §4.2) — exige dados estruturados
// (provider URL, timeRequired ISO 8601) ainda não presentes nos
// protótipos. Adicionar quando o catálogo editorial for confirmado.

export default async function ProgramaPage({ params }: Props) {
  const { slug } = await params;
  const p = PROGRAMAS[slug];
  if (!p) notFound();

  const relacionados = calcularRelacionados(slug);

  return (
    <main id="main" className="program-page" data-programa={p.siglaCss}>
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
            <li>
              <Link href={`/solucoes-estrategicas/${p.vertical}`}>
                {p.verticalRotulo}
              </Link>
            </li>
            <li className="sep">/</li>
            <li className="current">{p.breadcrumb.current}</li>
          </ol>
        </div>
      </nav>

      {/* ============= HERO ============= */}
      <section className="prog-hero" aria-label={`${p.siglaExibida} · ${p.nomeCompleto}`}>
        <div
          className="prog-hero-bg"
          style={{ backgroundImage: `url('${p.hero.bgSrc}')` }}
          aria-hidden="true"
        />
        <div className="container prog-hero-content fade-in">
          <div className="prog-hero-mark">
            <p className="prog-hero-eyebrow">{p.hero.eyebrow}</p>
            <h2 className="prog-hero-sigla">{p.siglaExibida}</h2>
            <div className="prog-hero-stats">
              {p.hero.stats.map((s, i) => (
                <div key={i} className="prog-hero-stat">
                  <span className="num">{s.num}</span>
                  <span className="lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="prog-hero-text">
            <span className="prog-hero-vert">{p.verticalRotulo}</span>
            <h1 dangerouslySetInnerHTML={{ __html: p.hero.tituloHtml }} />
            <p className="prog-hero-sub">{p.hero.sub}</p>
            <div className="prog-hero-ctas">
              {p.hero.ctas.map((c, i) => (
                <a key={i} className={classeCta(c.variante)} href={c.href}>
                  {c.rotulo}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============= META-BAR ============= */}
      <section className="prog-meta-bar" aria-label="Informações principais do programa">
        <div className="container">
          <div className="prog-meta-grid fade-in">
            {p.metaBar.map((m, i) => (
              <div key={i} className="prog-meta-item">
                <span className="label">{m.rotulo}</span>
                <span className="value">{m.valor}</span>
                {m.valorSub ? <span className="value-sub">{m.valorSub}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= NAV STICKY ============= */}
      <NavBarAncoras anchors={p.navAnchors} slug={p.slug} />

      {/* ============= LAYOUT PRINCIPAL ============= */}
      <section className="prog-layout">
        <div className="container">
          <div className="prog-layout-grid">
            <div className="prog-main">

              {/* VISÃO GERAL */}
              <article className="prog-section fade-in" id="visao-geral">
                <p className="eyebrow">{p.visaoGeral.eyebrow}</p>
                {p.visaoGeral.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.visaoGeral.tituloHtml }} />
                  : <h2>{p.visaoGeral.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.visaoGeral.corpoHtml }} />
              </article>

              {/* PROBLEMA */}
              <article className="prog-section fade-in" id="problema">
                <p className="eyebrow">{p.problema.eyebrow}</p>
                {p.problema.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.problema.tituloHtml }} />
                  : <h2>{p.problema.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.problema.corpoHtml }} />
                {p.problema.destaqueHtml ? (
                  <div
                    className="problem-block"
                    dangerouslySetInnerHTML={{ __html: p.problema.destaqueHtml }}
                  />
                ) : null}
              </article>

              {/* OBJETIVO GERAL */}
              {p.objetivoGeral ? (
                <article className="prog-section fade-in">
                  <p className="eyebrow">{p.objetivoGeral.eyebrow}</p>
                  {p.objetivoGeral.tituloHtml
                    ? <h2 dangerouslySetInnerHTML={{ __html: p.objetivoGeral.tituloHtml }} />
                    : <h2>{p.objetivoGeral.titulo}</h2>
                  }
                  <div dangerouslySetInnerHTML={{ __html: p.objetivoGeral.corpoHtml }} />
                </article>
              ) : null}

              {/* PÚBLICO */}
              <article className="prog-section fade-in" id="publico">
                <p className="eyebrow">{p.publico.eyebrow}</p>
                {p.publico.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.publico.tituloHtml }} />
                  : <h2>{p.publico.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.publico.corpoHtml }} />
                {p.publico.chips && p.publico.chips.length > 0 ? (
                  <div className="audience-chips">
                    {p.publico.chips.map((chip, i) => (
                      <span key={i}>{chip}</span>
                    ))}
                  </div>
                ) : null}
              </article>

              {/* EIXOS */}
              <article className="prog-section fade-in" id="eixos">
                <p className="eyebrow">{p.eixos.eyebrow}</p>
                {p.eixos.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.eixos.tituloHtml }} />
                  : <h2>{p.eixos.titulo}</h2>
                }
                <div className="axes-grid">
                  {p.eixos.itens.map((e, i) => (
                    <article key={i} className="axis-card">
                      <span className="axis-num">{String(i + 1).padStart(2, "0")}</span>
                      <h4>{e.titulo}</h4>
                      <p>{e.descricao}</p>
                    </article>
                  ))}
                </div>
              </article>

              {/* MÓDULOS — tabela com status */}
              <article className="prog-section fade-in" id="modulos">
                <p className="eyebrow">{p.modulos.eyebrow}</p>
                {p.modulos.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.modulos.tituloHtml }} />
                  : <h2>{p.modulos.titulo}</h2>
                }
                {p.modulos.intro ? <p>{p.modulos.intro}</p> : null}
                <table className="modules-table">
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Módulo</th>
                      <th>CH</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.modulos.itens.map((m, i) => (
                      <tr key={i}>
                        <td className="m-num">{m.numero}</td>
                        <td className="m-title">{m.titulo}</td>
                        <td className="m-ch">{m.cargaHoraria}</td>
                        <td>
                          {m.statusRotulo ? (
                            <span className={`m-status ${m.statusTipo ?? ""}`}>
                              {m.statusRotulo}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>

              {/* DETALHAMENTO — accordion */}
              {p.detalhamento ? (
                <article className="prog-section fade-in">
                  <p className="eyebrow">{p.detalhamento.eyebrow}</p>
                  {p.detalhamento.tituloHtml
                    ? <h2 dangerouslySetInnerHTML={{ __html: p.detalhamento.tituloHtml }} />
                    : <h2>{p.detalhamento.titulo}</h2>
                  }
                  <p>{p.detalhamento.intro}</p>
                  <ModulosAcordeao itens={p.detalhamento.itens} slug={p.slug} />
                </article>
              ) : null}

              {/* RESULTADOS */}
              <article className="prog-section fade-in" id="resultados">
                <p className="eyebrow">{p.resultados.eyebrow}</p>
                {p.resultados.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.resultados.tituloHtml }} />
                  : <h2>{p.resultados.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.resultados.corpoHtml }} />
              </article>

              {/* DIFERENCIAIS */}
              {p.diferenciais ? (
                <article className="prog-section fade-in">
                  <p className="eyebrow">{p.diferenciais.eyebrow}</p>
                  {p.diferenciais.tituloHtml
                    ? <h2 dangerouslySetInnerHTML={{ __html: p.diferenciais.tituloHtml }} />
                    : <h2>{p.diferenciais.titulo}</h2>
                  }
                  <div className="diffs-grid">
                    {p.diferenciais.itens.map((d, i) => (
                      <div key={i} className="diff-item">
                        <span className="d-num">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <h4>{d.titulo}</h4>
                          <p>{d.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}

              {/* CORPO DOCENTE — faculty-prime */}
              <article className="prog-section fade-in" id="docentes">
                <div className="faculty-prime">

                  <div className="faculty-prime-head">
                    <span className="faculty-prime-pill">{p.docentes.pill}</span>
                    <p className="eyebrow">{p.docentes.eyebrow}</p>
                    {p.docentes.tituloHtml
                      ? <h2 dangerouslySetInnerHTML={{ __html: p.docentes.tituloHtml }} />
                      : <h2>{p.docentes.titulo}</h2>
                    }
                    <div dangerouslySetInnerHTML={{ __html: p.docentes.introHtml }} />
                  </div>

                  <p className="faculty-prime-marker">{p.docentes.coordenacaoMarker}</p>
                  <div className="faculty-prime-featured">
                    {p.docentes.coordenacao.map((c, i) => (
                      <article key={i} className="fpc-card">
                        <div className="fpc-portrait">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.imgSrc} alt={c.imgAlt} loading="lazy" />
                          <span className="fpc-axis-badge">{c.axisBadge}</span>
                        </div>
                        <div className="fpc-info">
                          <span className="fpc-tag">{c.tag}</span>
                          <h4>{c.nome}</h4>
                          <p className="fpc-credential">{c.credencial}</p>
                          <div className="fpc-meta">
                            <span>Eixo · <strong>{c.eixo}</strong></span>
                            <span>Módulos · <strong>{c.modulos}</strong></span>
                          </div>
                          <Link className="fpc-link" href="/contato">
                            Conhecer atuação <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  <p className="faculty-prime-marker">{p.docentes.especialistasMarker}</p>
                  <div className="faculty-prime-grid">
                    {p.docentes.especialistas.map((e, i) => (
                      <article key={i} className="fac-card">
                        <div className="fac-portrait">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={e.imgSrc} alt={e.imgAlt} loading="lazy" />
                          <span className="fac-axis-badge">{e.axisBadge}</span>
                        </div>
                        <div className="fac-info">
                          <h4>{e.nome}</h4>
                          <p className="fac-credential">{e.credencial}</p>
                          <p className="fac-modules">
                            {e.modulos.includes("·") ? "Módulos" : "Módulo"} · <strong>{e.modulos}</strong>
                          </p>
                          <Link className="fac-link" href="/contato">
                            Conhecer atuação <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="faculty-prime-counters" aria-label={`Indicadores da curadoria do ${p.siglaExibida}`}>
                    {p.docentes.counters.map((c, i) => (
                      <div key={i} className="faculty-counter">
                        <span className="fc-num">{c.num}</span>
                        <span className="fc-lbl">{c.lbl}</span>
                      </div>
                    ))}
                  </div>

                  <p className="faculty-prime-note">{p.docentes.nota}</p>

                  <div className="faculty-prime-actions">
                    <Link className="btn btn--gold" href="/contato">
                      {p.docentes.ctaPrimario} <span className="btn-arrow">→</span>
                    </Link>
                    <Link className="btn btn--secondary" href="/contato">
                      {p.docentes.ctaSecundario}
                    </Link>
                  </div>

                </div>
              </article>

              {/* MODALIDADES */}
              <article className="prog-section fade-in" id="modalidades">
                <p className="eyebrow">{p.modalidades.eyebrow}</p>
                {p.modalidades.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.modalidades.tituloHtml }} />
                  : <h2>{p.modalidades.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.modalidades.corpoHtml }} />
              </article>

              {/* MÓDULOS ABERTOS — layout de eventos */}
              <article className="prog-section fade-in" id="modulos-abertos">
                <p className="eyebrow">{p.modulosAbertos.eyebrow}</p>
                {p.modulosAbertos.tituloHtml
                  ? <h2 dangerouslySetInnerHTML={{ __html: p.modulosAbertos.tituloHtml }} />
                  : <h2>{p.modulosAbertos.titulo}</h2>
                }
                <div dangerouslySetInnerHTML={{ __html: p.modulosAbertos.corpoHtml }} />

                {(p.modulosAbertos.feature ?? p.modulosAbertos.miniStack) ? (
                  <div className="prog-events-layout">

                    {p.modulosAbertos.feature ? (() => {
                      const f = p.modulosAbertos.feature!;
                      const isRange = f.dataLabel.dias.includes("–");
                      return (
                        <article className="prog-event-feature">
                          <span className="pef-priority-badge">{f.badge}</span>
                          <div className="pef-cover">
                            <div
                              className="pef-cover-img"
                              style={{ backgroundImage: `url('${f.bgImg}')` }}
                              aria-hidden="true"
                            />
                            <div className="pef-cover-overlay" />
                            <div className="pef-cover-tint" />
                            <div className="pef-cover-meta">
                              <div className={`pef-date ${isRange ? "range" : "single"}`}>
                                {isRange ? (
                                  <span className="days">
                                    {f.dataLabel.dias.replace("–", "")}
                                    <span className="dash">–</span>
                                    {f.dataLabel.dias.split("–")[1]}
                                  </span>
                                ) : (
                                  <span className="day">{f.dataLabel.dias}</span>
                                )}
                                <span className="mon-yr">{f.dataLabel.mesAno}</span>
                              </div>
                              <span className="pef-modality">{f.modalidade}</span>
                            </div>
                          </div>
                          <div className="pef-body">
                            <p className="pef-eyebrow">{f.eyebrow}</p>
                            <h3>{f.titulo}</h3>
                            <p
                              className="pef-binding"
                              dangerouslySetInnerHTML={{ __html: f.binding.replace(" I ", " <strong>I</strong> ") }}
                            />
                            <div className="pef-meta-row">
                              {f.metas.map((m, i) => (
                                <span key={i} dangerouslySetInnerHTML={{ __html: m }} />
                              ))}
                            </div>
                          </div>
                          <div className="pef-actions">
                            <a className="btn btn--gold" href={`/contato/proposta?programa=${p.slug}`}>
                              {f.ctaPrimario} <span className="btn-arrow">→</span>
                            </a>
                            <a className="btn btn--secondary" href={`/contato/proposta?programa=${p.slug}&assunto=detalhes`}>
                              {f.ctaSecundario}
                            </a>
                          </div>
                        </article>
                      );
                    })() : null}

                    {p.modulosAbertos.miniStack && p.modulosAbertos.miniStack.length > 0 ? (
                      <div className="prog-events-mini-stack">
                        {p.modulosAbertos.miniStack.map((mini, i) => {
                          const isRange = mini.dataLabel.dias.includes("–");
                          return (
                            <article key={i} className="prog-event-mini">
                              <div className="pem-cover">
                                <div
                                  className="pem-cover-img"
                                  style={{ backgroundImage: `url('${mini.bgImg}')` }}
                                  aria-hidden="true"
                                />
                                <div className="pem-cover-overlay" />
                                <div className={`pem-date ${isRange ? "range" : "single"}`}>
                                  {isRange ? (
                                    <span className="days">
                                      {mini.dataLabel.dias.split("–")[0]}
                                      <span className="dash">–</span>
                                      {mini.dataLabel.dias.split("–")[1]}
                                    </span>
                                  ) : (
                                    <span className="day">{mini.dataLabel.dias}</span>
                                  )}
                                  <span className="mon-yr">{mini.dataLabel.mesAno}</span>
                                </div>
                              </div>
                              <div className="pem-body">
                                <p className="pem-eyebrow">{mini.eyebrow}</p>
                                <h4 className="pem-title">{mini.titulo}</h4>
                                <p
                                  className="pem-meta"
                                  dangerouslySetInnerHTML={{ __html: mini.metaHtml }}
                                />
                                <a
                                  className="pem-cta"
                                  href={`/contato/proposta?programa=${p.slug}&assunto=inscricao`}
                                >
                                  {mini.ctaRotulo}
                                </a>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : null}

                  </div>
                ) : null}

                <p className="prog-events-microcopy">{p.modulosAbertos.microcopy}</p>

                {p.modulosAbertos.bottomCtas.length > 0 ? (
                  <div className="prog-events-bottom">
                    {p.modulosAbertos.bottomCtas.map((cta, i) => (
                      <a
                        key={i}
                        className={cta.primario ? "btn btn--primary" : "btn btn--secondary"}
                        href={cta.href}
                      >
                        {cta.rotulo}
                        {cta.primario ? <span className="btn-arrow"> →</span> : null}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>

              {/* FAQ */}
              <article className="prog-section fade-in" id="faq">
                <p className="eyebrow">{p.faq.eyebrow}</p>
                <h2>{p.faq.titulo}</h2>
                <FaqAcordeao itens={p.faq.itens} />
              </article>

              {/* CTA FINAL */}
              {p.ctaFinal ? (
                <article
                  className="prog-section fade-in"
                  id="contato"
                  style={{ textAlign: "center" }}
                >
                  <p className="eyebrow gold">{p.ctaFinal.eyebrow}</p>
                  <h2
                    style={{ maxWidth: "760px", margin: "0 auto var(--space-3)" }}
                    dangerouslySetInnerHTML={{ __html: p.ctaFinal.tituloHtml }}
                  />
                  <p style={{ maxWidth: "640px", margin: "0 auto var(--space-4)" }}>
                    {p.ctaFinal.corpo}
                  </p>
                  <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                    <a className="btn btn--gold" href={`/contato/proposta?programa=${p.slug}`}>
                      Solicitar proposta institucional <span className="btn-arrow">→</span>
                    </a>
                    <a className="btn btn--secondary" href={`/contato/proposta?programa=${p.slug}&assunto=folder`}>
                      Solicitar folder do programa
                    </a>
                    <a className="btn btn--secondary" href="#modulos-abertos">
                      Ver módulos abertos
                    </a>
                  </div>
                </article>
              ) : null}

            </div>

            {p.sidebar ? (
              <aside className="prog-sidebar" aria-label="Card comercial do programa">
                <div className="prog-sb-card">
                  <div className="prog-sb-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.hero.bgSrc}
                      alt={`${p.siglaExibida} · ${p.nomeCompleto}`}
                      loading="lazy"
                    />
                    <span className="sigla-watermark">{p.siglaExibida}</span>
                  </div>
                  <div className="prog-sb-body">
                    <p className="prog-sb-title">{p.sidebar.titulo}</p>
                    <div className="prog-sb-rows">
                      {p.sidebar.rows.map((r, i) => (
                        <div key={i} className="prog-sb-row">
                          <span>{r.rotulo}</span>
                          <strong>{r.valor}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="prog-sb-includes">
                    <h4>{p.sidebar.entregasTitulo}</h4>
                    <ul>
                      {p.sidebar.entregas.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="prog-sb-actions">
                    <a className="btn btn--gold" href={`/contato/proposta?programa=${p.slug}`}>
                      Solicitar proposta <span className="btn-arrow">→</span>
                    </a>
                    <a className="btn btn--secondary" href={`/contato/proposta?programa=${p.slug}&assunto=folder`}>
                      Solicitar folder do programa
                    </a>
                    <a className="link-arrow" href="#modulos-abertos">
                      Ver módulos abertos
                    </a>
                  </div>
                </div>
              </aside>
            ) : null}

          </div>
        </div>
      </section>

      {/* ============= PROGRAMAS RELACIONADOS ============= */}
      {relacionados.length > 0 ? (
        <section
          className="related-events-section"
          aria-label={`Outros programas da ${p.verticalRotulo}`}
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">Mesma vertical</p>
              <h2>
                Outros programas da <em>{p.verticalRotulo}</em>
              </h2>
              <p className="section-intro">
                Programas estratégicos complementares ao {p.siglaExibida} na linha de governança e modernização institucional da Administração Pública.
              </p>
            </div>
            <div className="related-events-grid fade-in">
              {relacionados.map((r) => (
                <article key={r.slug} className="event-secondary-card" data-area="gov">
                  <div className="es-cover">
                    <div
                      className="es-cover-img"
                      style={{ backgroundImage: `url('${p.hero.bgSrc}')` }}
                      aria-hidden="true"
                    />
                    <div className="es-cover-overlay" />
                    <div className="es-date single">
                      <span className="day">8</span>
                      <span className="mon-yr">Módulos · 64h</span>
                    </div>
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">Programa Estratégico</p>
                      <h4 className="es-title">{r.sigla} · {r.nomeCurto}</h4>
                      <p className="es-program-binding">{p.verticalRotulo}</p>
                    </div>
                    <div className="es-meta-row">
                      <span className="es-meta">8 módulos · 64h <strong>Sob consulta</strong></span>
                    </div>
                    <Link className="es-cta" href={`/programas/${r.slug}`}>
                      Conhecer programa
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div
              className="fade-in"
              style={{
                marginTop: "var(--space-4)",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Link className="btn btn--primary" href="/#solucoes">
                Ver todos os 15 programas <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
