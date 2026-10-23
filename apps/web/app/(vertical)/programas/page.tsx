import type { Metadata } from "next";
import Link from "next/link";

import { fundoResponsivo } from "@/lib/imagemLocal";

import {
  FALLBACK_VERTICAIS,
  type VerticalSlug,
} from "../solucoes-estrategicas/[area]/conteudoFallback";

/**
 * Página `/programas` — índice dos 15 programas estratégicos,
 * agrupados pelas 3 verticais.
 *
 * Mora no route group (vertical) para reaproveitar o CSS das páginas
 * de vertical (verticais-prototipo.css): hero, faixa de metadados,
 * grade `.programs-grid-vert` e CTA final. Os cards vêm da mesma
 * fonte das páginas de vertical (`FALLBACK_VERTICAIS[area].programas`),
 * então um card editado lá muda aqui também. Cada bloco recebe
 * `data-vertical` para herdar o acento cromático da vertical.
 */

export const metadata: Metadata = {
  title: "Programas Estratégicos · Grupo NTC",
};

const ORDEM_VERTICAIS: VerticalSlug[] = ["educacao", "gestao-publica", "saude"];

const FUNDO_SECAO: Record<VerticalSlug, string> = {
  educacao: "vert-section--ivory",
  "gestao-publica": "vert-section--cream",
  saude: "vert-section--ivory",
};

export default function ProgramasPage() {
  const verticais = ORDEM_VERTICAIS.map((slug) => ({ slug, v: FALLBACK_VERTICAIS[slug] }));
  const total = verticais.reduce((soma, { v }) => soma + v.programas.cards.length, 0);

  return (
    <div className="vertical-page">
      <main id="main">
        {/* ============= BREADCRUMB ============= */}
        <nav className="breadcrumb" aria-label="Trilha de navegação">
          <div className="container">
            <ol className="breadcrumb-list">
              <li>
                <Link href="/">Grupo NTC</Link>
              </li>
              <li className="sep">/</li>
              <li className="current">Programas estratégicos</li>
            </ol>
          </div>
        </nav>

        {/* ============= HERO ============= */}
        <section className="vert-hero" aria-label="Programas estratégicos do Grupo NTC">
          <div className="container vert-hero-content fade-in">
            <p className="vert-hero-eyebrow">Portfólio estratégico · Grupo NTC</p>
            <h1>
              {total} programas <em>estratégicos</em>
            </h1>
            <p className="vert-hero-sub">[texto a definir pela equipe editorial]</p>
            <div className="vert-hero-ctas">
              {verticais.map(({ slug, v }) => (
                <a key={slug} className="btn btn--ghost-light" href={`#programas-${slug}`}>
                  {v.breadcrumb.current}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============= FAIXA DE METADADOS ============= */}
        <section className="vert-meta-bar" aria-label="Resumo do portfólio">
          <div className="container">
            <div className="vert-meta-grid fade-in">
              <div className="vert-meta-item">
                <span className="label">Portfólio</span>
                <span className="value">{total} programas</span>
                <span className="value-sub">Estratégicos</span>
              </div>
              {verticais.map(({ slug, v }) => (
                <div key={slug} className="vert-meta-item">
                  <span className="label">{v.breadcrumb.current}</span>
                  <span className="value">{v.programas.cards.length} programas</span>
                  <span className="value-sub">
                    {v.programas.cards.map((p) => p.sigla).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============= GRADES POR VERTICAL ============= */}
        {verticais.map(({ slug, v }) => (
          <section
            key={slug}
            className={`vert-section vertical-page ${FUNDO_SECAO[slug]}`}
            data-vertical={slug}
            id={`programas-${slug}`}
          >
            <div className="container">
              <div className="vert-section-head fade-in">
                <p className="eyebrow">
                  {v.breadcrumb.current} · {v.programas.cards.length} programas
                </p>
                <h2 dangerouslySetInnerHTML={{ __html: v.programas.tituloHtml }} />
                <p className="intro">{v.programas.intro}</p>
              </div>

              <div className="programs-grid-vert fade-in">
                {v.programas.cards.map((p) => (
                  <Link
                    key={p.sigla}
                    className="program-card-vert"
                    href={`/programas/${p.sigla.toLowerCase().replace(/\+$/, "")}`}
                  >
                    <div className="pc-cover">
                      <div
                        className="pc-cover-img"
                        style={fundoResponsivo(p.imagemSrc)}
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
                  </Link>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "var(--space-5)",
                }}
              >
                <Link className="btn btn--secondary" href={`/solucoes-estrategicas/${slug}`}>
                  Conhecer a vertical {v.breadcrumb.current} <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          </section>
        ))}

        {/* ============= CTA FINAL ============= */}
        <section className="vert-cta-final" id="contato">
          <div className="container fade-in">
            <p className="eyebrow gold">Próximo passo</p>
            <h2>
              Leve os programas do <em>Grupo NTC</em> para sua instituição.
            </h2>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn--gold" href="/contato?assunto=proposta">
                Solicitar proposta institucional <span className="btn-arrow">→</span>
              </a>
              <Link className="btn btn--ghost-light" href="/agenda">
                Ver agenda de capacitação
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
