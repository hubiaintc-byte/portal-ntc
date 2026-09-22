import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  carregarConteudo,
  listarConteudosPublicados,
  listarRelacionados,
  type ConteudoLeitura,
} from "@/lib/conteudos";

import { CtaFinalConteudos } from "../../CtaFinalConteudos";

/**
 * Página de leitura de um conteúdo editorial —
 * `/conteudos/[categoria]/[slug]` (spec §7.3).
 *
 * Server Component puro: nenhum JS novo no cliente. Herda header,
 * footer, `InteracoesScroll` e o CSS do route group `(conteudos)`.
 *
 * Estrutura (espelho dos 6 itens da spec):
 *   1. Breadcrumb + hero editorial (vertical · categoria, título, lide,
 *      linha de meta, capa).
 *   2. Corpo em coluna de leitura (~68ch), vindo de
 *      `lexicalParaHtmlEditorial` — a sanitização mora lá.
 *   3. Anexo para download e/ou link externo, quando houver.
 *   4. Assinatura: autores do corpo docente ou assinatura institucional.
 *   5. "Leia também".
 *   6. CTA final de 3 pontes, o mesmo de `/conteudos`.
 *
 * Não existe protótipo HTML desta página (a numeração pula de 28 para
 * 30, spec §1): o desenho reusa os tokens e as classes do protótipo 28.
 */

// doc 13 (Mapa Página-a-Página) fixa 600s para /conteudos*.
export const revalidate = 600;
/** Publicação nova entre dois builds chega por render sob demanda. */
export const dynamicParams = true;

interface Params {
  params: Promise<{ categoria: string; slug: string }>;
}

/** Só os publicados entram na build; o resto chega por `dynamicParams`. */
export async function generateStaticParams(): Promise<
  { categoria: string; slug: string }[]
> {
  const cards = await listarConteudosPublicados();
  return cards.flatMap((c) => {
    // href é `/conteudos/<segmento>/<slug>` — null em conteúdo "em preparação".
    const partes = c.href?.split("/") ?? [];
    const categoria = partes[2];
    const slug = partes[3];
    return categoria && slug ? [{ categoria, slug }] : [];
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria, slug } = await params;
  const doc = await carregarConteudo(categoria, slug);
  if (!doc) return { title: "Conteúdo não encontrado · Grupo NTC" };

  const descricao = doc.seoDescricao || doc.lide;
  const autores = doc.autores.map((a) => a.nome).filter((nome) => nome.length > 0);
  return {
    title: doc.seoTitulo || `${doc.titulo} · ${doc.tipoLabel} · Grupo NTC`,
    description: descricao,
    openGraph: {
      title: doc.titulo,
      description: descricao,
      type: "article",
      publishedTime: doc.dataISO ?? undefined,
      authors: autores.length > 0 ? autores : [doc.assinatura || "Instituto NTC do Brasil"],
      // Upload original, não a variante da página: o openGraph é lido por
      // crawler, e as redes querem ≥1200×630 — o recorte 20:23 de 600px da
      // variante seria enquadrado com tarja ou recusado.
      images: doc.capa
        ? [
            {
              url: doc.capa.ogUrl,
              width: doc.capa.ogLargura ?? undefined,
              height: doc.capa.ogAltura ?? undefined,
            },
          ]
        : undefined,
    },
  };
}

/** Autores do corpo docente quando houver; senão a assinatura institucional. */
function linhaDeAssinatura(doc: ConteudoLeitura): string {
  const nomes = doc.autores.map((a) => a.nome).filter((nome) => nome.length > 0);
  return nomes.length > 0 ? nomes.join(" · ") : doc.assinatura;
}

export default async function ConteudoLeituraPage({ params }: Params) {
  const { categoria, slug } = await params;
  // Segmento desconhecido, slug inexistente e rascunho voltam null aqui.
  const doc = await carregarConteudo(categoria, slug);
  if (!doc) notFound();

  const relacionados = await listarRelacionados(doc);
  const assinatura = linhaDeAssinatura(doc);
  const autoresComFicha = doc.autores.filter((a) => a.nome.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: doc.titulo,
    description: doc.lide,
    datePublished: doc.dataISO ?? undefined,
    author:
      autoresComFicha.length > 0
        ? autoresComFicha.map((a) => ({ "@type": "Person", name: a.nome }))
        : [
            {
              "@type": "Organization",
              name: doc.assinatura || "Instituto NTC do Brasil",
            },
          ],
    publisher: { "@type": "Organization", name: "Instituto NTC do Brasil" },
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // `\u003c` impede que um "</script>" no título feche a tag aqui.
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <article className="cont-artigo" data-vert={doc.vert}>
        {/* 1. HERO EDITORIAL */}
        <header className="cont-artigo-hero">
          <div className="container cont-artigo-hero-inner">
            <nav className="crumb" aria-label="Trilha de navegação">
              <Link href="/">Grupo NTC</Link>
              <span className="sep" aria-hidden="true" />
              <Link href="/conteudos">Conteúdos</Link>
              <span className="sep" aria-hidden="true" />
              <span className="current">{doc.tipoLabel}</span>
            </nav>
            <p className="eyebrow light cont-artigo-eyebrow">
              {doc.verticalLabel} · {doc.tipoLabel}
            </p>
            <h1 className="cont-artigo-titulo">{doc.titulo}</h1>
            {doc.lide && <p className="cont-artigo-lide">{doc.lide}</p>}
            <p className="cont-artigo-meta">
              {assinatura && <span>{assinatura}</span>}
              <span>{doc.dataLegivel}</span>
              <span>{doc.tempoLeituraMin} min de leitura</span>
            </p>
          </div>
          {doc.capa && (
            <div className="container cont-artigo-hero-inner">
              {/* `alt` escrito pelo editor (media.alt é obrigatório no CMS);
                  "" quando ele a declarou decorativa. */}
              <Image
                className="cont-artigo-capa"
                src={doc.capa.url}
                alt={doc.capa.alt}
                width={800}
                height={920}
                sizes="(max-width: 900px) 100vw, 760px"
                priority
              />
            </div>
          )}
        </header>

        <div className="cont-artigo-corpo">
          {/* 2. CORPO — HTML já escapado por lexicalParaHtmlEditorial. */}
          {doc.corpoHtml && (
            <div
              className="cont-artigo-texto"
              dangerouslySetInnerHTML={{ __html: doc.corpoHtml }}
            />
          )}

          {/* 3. ANEXO E/OU LINK EXTERNO */}
          {(doc.anexoUrl || doc.linkExterno) && (
            <p className="cont-artigo-acao">
              {doc.anexoUrl && (
                <a
                  className="btn btn--gold"
                  href={doc.anexoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Baixar material →
                </a>
              )}
              {doc.linkExterno && (
                <a
                  className="btn btn--secondary"
                  href={doc.linkExterno}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Assistir ao webinar →
                </a>
              )}
            </p>
          )}

          {/* 4. ASSINATURA */}
          <aside className="cont-artigo-assinatura" aria-label="Assinatura editorial">
            {autoresComFicha.length > 0 ? (
              <ul className="cont-artigo-autores">
                {autoresComFicha.map((a) => (
                  <li key={a.nome} className="cont-artigo-autor">
                    {a.fotoUrl && (
                      <Image
                        className="cont-artigo-autor-foto"
                        src={a.fotoUrl}
                        alt=""
                        width={96}
                        height={110}
                        sizes="96px"
                      />
                    )}
                    <div>
                      <strong>{a.nome}</strong>
                      {a.titulacao && <span>{a.titulacao}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              doc.assinatura && <p className="cont-artigo-assinatura-texto">{doc.assinatura}</p>
            )}
            <Link className="link-arrow" href="/o-grupo/corpo-docente">
              Conhecer o corpo docente
            </Link>
          </aside>
        </div>
      </article>

      {/* 5. LEIA TAMBÉM */}
      {relacionados.length > 0 && (
        <section className="cont-artigo-relacionados" aria-labelledby="leia-tambem">
          <div className="container">
            <h2 id="leia-tambem" className="cont-artigo-relacionados-titulo">
              Leia também
            </h2>
            <ul className="cont-artigo-relacionados-lista">
              {relacionados.map((r) => (
                <li key={r.id} className="cont-artigo-relacionado" data-vert={r.vert}>
                  <span className="cont-artigo-relacionado-tag">
                    {r.tipoLabel} · {r.verticalLabel}
                  </span>
                  <h3>
                    {/* href dinâmico: <a>, como nos cards da Biblioteca —
                        `typedRoutes` recusa uma string livre em <Link>. */}
                    {r.href ? <a href={r.href}>{r.titulo}</a> : r.titulo}
                  </h3>
                  <p>{r.lide}</p>
                  {/* "Em preparação editorial" explica o card sem link —
                      mesmo texto que o card equivalente de /conteudos usa. */}
                  <span className="cont-artigo-relacionado-data">{r.dataLegivel}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6. CTA FINAL 3 PONTES */}
      <CtaFinalConteudos />
    </main>
  );
}
