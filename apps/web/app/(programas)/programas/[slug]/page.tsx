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

              <article className="prog-section fade-in" id="visao-geral">
                <p className="eyebrow">{p.visaoGeral.eyebrow}</p>
                <h2>{p.visaoGeral.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.visaoGeral.corpoHtml }} />
              </article>

              <article className="prog-section fade-in" id="problema">
                <p className="eyebrow">{p.problema.eyebrow}</p>
                <h2>{p.problema.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.problema.corpoHtml }} />
                {p.problema.destaqueHtml ? (
                  <div
                    className="problem-block"
                    dangerouslySetInnerHTML={{ __html: p.problema.destaqueHtml }}
                  />
                ) : null}
              </article>

              {p.objetivoGeral ? (
                <article className="prog-section fade-in">
                  <p className="eyebrow">{p.objetivoGeral.eyebrow}</p>
                  <h2>{p.objetivoGeral.titulo}</h2>
                  <div dangerouslySetInnerHTML={{ __html: p.objetivoGeral.corpoHtml }} />
                </article>
              ) : null}

              <article className="prog-section fade-in" id="publico">
                <p className="eyebrow">{p.publico.eyebrow}</p>
                <h2>{p.publico.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.publico.corpoHtml }} />
                {p.publico.chips && p.publico.chips.length > 0 ? (
                  <div className="audience-chips">
                    {p.publico.chips.map((chip, i) => (
                      <span key={i}>{chip}</span>
                    ))}
                  </div>
                ) : null}
              </article>

              <article className="prog-section fade-in" id="eixos">
                <p className="eyebrow">{p.eixos.eyebrow}</p>
                <h2>{p.eixos.titulo}</h2>
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

              <article className="prog-section fade-in" id="modulos">
                <p className="eyebrow">{p.modulos.eyebrow}</p>
                <h2>{p.modulos.titulo}</h2>
                <ol className="modules-list">
                  {p.modulos.itens.map((m, i) => (
                    <li key={i} className="module-item">
                      <span className="module-num">{m.numero}</span>
                      <div className="module-body">
                        <h4>{m.titulo}</h4>
                        <p>{m.descricao}</p>
                        {m.cargaHoraria ? (
                          <span className="module-load">{m.cargaHoraria}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="prog-section fade-in" id="resultados">
                <p className="eyebrow">{p.resultados.eyebrow}</p>
                <h2>{p.resultados.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.resultados.corpoHtml }} />
              </article>

              <article className="prog-section fade-in" id="docentes">
                <p className="eyebrow">{p.docentes.eyebrow}</p>
                <h2>{p.docentes.titulo}</h2>
                {p.docentes.descricaoHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: p.docentes.descricaoHtml }} />
                ) : null}
              </article>

              <article className="prog-section fade-in" id="modalidades">
                <p className="eyebrow">{p.modalidades.eyebrow}</p>
                <h2>{p.modalidades.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.modalidades.corpoHtml }} />
              </article>

              <article className="prog-section fade-in" id="modulos-abertos">
                <p className="eyebrow">{p.modulosAbertos.eyebrow}</p>
                <h2>{p.modulosAbertos.titulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: p.modulosAbertos.corpoHtml }} />
              </article>

              <article className="prog-section fade-in" id="faq">
                <p className="eyebrow">{p.faq.eyebrow}</p>
                <h2>{p.faq.titulo}</h2>
                <FaqAcordeao itens={p.faq.itens} />
              </article>

            </div>
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
            <h2 className="related-events-titulo">
              Outros programas da {p.verticalRotulo}
            </h2>
            <div className="related-events-grid">
              {relacionados.map((r) => (
                <Link
                  key={r.slug}
                  href={`/programas/${r.slug}`}
                  className="related-event-card"
                >
                  <h3>{r.sigla}</h3>
                  <p>{r.nomeCurto}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
