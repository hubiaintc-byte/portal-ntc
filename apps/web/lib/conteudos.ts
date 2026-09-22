/**
 * Loader + adapter da coleção `conteudos` para a biblioteca editorial
 * (`/conteudos` e, na Task 11, `/conteudos/[segmento]/[slug]`).
 *
 * Toda leitura passa por try/catch e degrada para lista vazia / null —
 * uma falha do banco não pode derrubar a página (CLAUDE.md §7.1 do
 * spec desta sessão). `cache()` do React memoiza por request de render;
 * fora de um render (ex.: chamado direto num teste) age como passthrough.
 *
 * Server-only — não importe no client.
 */

import { cache } from "react";

import {
  categoriaParaSegmento,
  formatarDataBR,
  lexicalParaHtmlEditorial,
  rotuloCategoria,
  segmentoParaCategoria,
  type ConteudoCategoria,
} from "@ntc/lib";

import { obterPayload } from "./payloadClient";

export interface ConteudoCard {
  id: string;
  titulo: string;
  lide: string;
  categoria: ConteudoCategoria;
  tipoLabel: string;
  vert: "edu" | "gov" | "sau" | "trans";
  verticalLabel: string;
  href: string | null; // null = em preparação, sem link
  emPreparacao: boolean;
  dataLegivel: string; // "Publicado · 22/09/2026" ou "Em preparação editorial"
  assinatura: string;
  imagemUrl: string | null;
  search: string; // texto normalizado para a busca client-side
}

/**
 * Capa do conteúdo nas três formas de que a página de leitura precisa.
 * Separadas de propósito: o que a página renderiza não serve ao crawler.
 */
export interface CapaConteudo {
  /** Variante `hero` (800×920) do Sharp — o que a página de leitura renderiza. */
  url: string;
  /** `media.alt`, obrigatório no CMS; "" quando o editor a declarou decorativa. */
  alt: string;
  /** Upload original + dimensões — só para `openGraph`, que quer imagem grande. */
  ogUrl: string;
  ogLargura: number | null;
  ogAltura: number | null;
}

export interface ConteudoLeitura extends ConteudoCard {
  slug: string;
  capa: CapaConteudo | null;
  corpoHtml: string;
  tempoLeituraMin: number;
  autores: { nome: string; titulacao: string; fotoUrl: string | null }[];
  anexoUrl: string | null;
  linkExterno: string | null;
  dataISO: string | null;
  seoTitulo: string;
  seoDescricao: string;
}

// ============================================================
// Vertical por área
// ============================================================

/**
 * Áreas Estratégicas nascem com `slug: area.sigla` (apps/cms/src/seed/seed.ts)
 * — "educacao" | "gestao-publica" | "saude", conferido contra
 * apps/cms/src/collections/Areas.ts e o seed. Área ausente ou fora deste
 * mapa vira "trans" / "Transversal".
 */
const VERT_POR_SLUG_AREA: Record<string, "edu" | "gov" | "sau"> = {
  educacao: "edu",
  "gestao-publica": "gov",
  saude: "sau",
};

// ============================================================
// Shapes brutos vindos do Payload (defensivos — depth pode variar)
// ============================================================

interface AreaBruta {
  id?: number | string;
  nome?: string;
  slug?: string;
}

interface MediaBruta {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    card?: { url?: string | null } | null;
    hero?: { url?: string | null } | null;
    thumbnail?: { url?: string | null } | null;
  } | null;
}

interface EspecialistaBruta {
  nome?: string;
  titulacao?: string;
  foto?: unknown;
}

interface ConteudoBruto {
  id: number | string;
  titulo?: string;
  slug?: string;
  categoria?: string;
  area?: unknown;
  lide?: string;
  corpo?: unknown;
  imagemDestaque?: unknown;
  autor?: unknown[] | null;
  dataPublicacao?: string | null;
  assinatura?: string | null;
  destaque?: boolean | null;
  anunciarEmPreparacao?: boolean | null;
  tempoLeituraMin?: number | null;
  linkExterno?: string | null;
  anexoDownload?: unknown;
  conteudosRelacionados?: unknown[] | null;
  seo?: { tituloSeo?: string | null; descricaoSeo?: string | null } | null;
  _status?: string;
}

/** Relacionamento populado (objeto) ou não (id cru/ausente) → objeto tipado ou null. */
function objetoOuNulo<T>(valor: unknown): T | null {
  return valor && typeof valor === "object" ? (valor as T) : null;
}

/** URL crua do upload — para anexo (download) e foto de autor, nunca redimensionadas aqui. */
function urlDeMidia(media: unknown): string | null {
  const m = objetoOuNulo<MediaBruta>(media);
  return typeof m?.url === "string" && m.url.length > 0 ? m.url : null;
}

/**
 * URL de uma variante otimizada (Sharp, apps/cms/src/collections/Media.ts
 * — imageSizes thumbnail/card/hero) para usar como `background-image` de
 * card/destaque — nunca o upload original em resolução plena (CLAUDE.md
 * §11, não-negociável). Prioriza "card" (600px), a mais próxima da largura
 * real do bloco na página; cai para "hero" e "thumbnail" e só usa a url
 * crua como último recurso, se o Sharp não gerou nenhuma variante.
 */
function urlImagemCard(media: unknown): string | null {
  const m = objetoOuNulo<MediaBruta>(media);
  if (!m) return null;
  const candidato = m.sizes?.card?.url ?? m.sizes?.hero?.url ?? m.sizes?.thumbnail?.url ?? m.url;
  return typeof candidato === "string" && candidato.length > 0 ? candidato : null;
}

/**
 * Capa da página de leitura. Prioriza a variante `hero` (800×920) — a maior
 * que o Sharp gera (apps/cms/src/collections/Media.ts) e a única que cobre o
 * bloco de ~760px sem o otimizador do Next reamostrar para cima a partir da
 * `card` de 600px. Cai para `card`/`thumbnail` e só usa a url crua se o Sharp
 * não gerou variante nenhuma (CLAUDE.md §11).
 *
 * `ogUrl` é o upload **original** de propósito: `openGraph` é lido por
 * crawler, não por visitante, e Facebook/LinkedIn/X pedem ≥1200×630 — um
 * recorte 20:23 de 600px seria rejeitado ou enquadrado com tarja.
 */
function capaDoDoc(media: unknown): CapaConteudo | null {
  const m = objetoOuNulo<MediaBruta>(media);
  if (!m) return null;
  const candidato = m.sizes?.hero?.url ?? m.sizes?.card?.url ?? m.sizes?.thumbnail?.url ?? m.url;
  if (typeof candidato !== "string" || candidato.length === 0) return null;
  const original = typeof m.url === "string" && m.url.length > 0 ? m.url : candidato;
  return {
    url: candidato,
    alt: typeof m.alt === "string" ? m.alt : "",
    ogUrl: original,
    ogLargura: typeof m.width === "number" ? m.width : null,
    ogAltura: typeof m.height === "number" ? m.height : null,
  };
}

/**
 * `assinatura` é opcional — a descrição do campo no Payload diz "use
 * quando o conteúdo não é assinado por um especialista do corpo docente",
 * ou seja, o modelo é assinatura OU autor. Sem este fallback, um conteúdo
 * assinado só por `autor[]` mostra o rodapé do card vazio.
 */
function assinaturaDoDoc(doc: ConteudoBruto): string {
  if (doc.assinatura) return doc.assinatura;
  if (!Array.isArray(doc.autor)) return "";
  const nomes = doc.autor
    .map((a) => objetoOuNulo<EspecialistaBruta>(a))
    .filter((a): a is EspecialistaBruta => a !== null)
    .map((a) => a.nome)
    .filter((nome): nome is string => Boolean(nome));
  return nomes.join(", ");
}

// ============================================================
// Derivações puras a partir do doc bruto
// ============================================================

function vertDoDoc(doc: ConteudoBruto): "edu" | "gov" | "sau" | "trans" {
  const area = objetoOuNulo<AreaBruta>(doc.area);
  const slug = area?.slug;
  if (slug && slug in VERT_POR_SLUG_AREA) return VERT_POR_SLUG_AREA[slug]!;
  return "trans";
}

function verticalLabelDoDoc(doc: ConteudoBruto): string {
  if (vertDoDoc(doc) === "trans") return "Transversal";
  const area = objetoOuNulo<AreaBruta>(doc.area);
  return area?.nome ?? "Transversal";
}

/** Publicado, ou rascunho que pediu anúncio ("Em preparação editorial"). */
function elegivel(doc: ConteudoBruto): boolean {
  return doc._status === "published" || Boolean(doc.anunciarEmPreparacao);
}

function dataLegivelDoDoc(doc: ConteudoBruto): string {
  if (doc._status !== "published") return "Em preparação editorial";
  if (!doc.dataPublicacao) return "Publicado";
  return `Publicado · ${formatarDataBR(doc.dataPublicacao)}`;
}

/** Minúsculas, sem acento — mesma normalização usada pela busca client-side de BibliotecaConteudos. */
function normalizarBusca(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function paraCard(doc: ConteudoBruto): ConteudoCard {
  const categoria = (doc.categoria ?? "artigo") as ConteudoCategoria;
  const slug = doc.slug ?? "";
  const emPreparacao = doc._status !== "published";
  const titulo = doc.titulo ?? "";
  const lide = doc.lide ?? "";
  return {
    id: String(doc.id),
    titulo,
    lide,
    categoria,
    tipoLabel: rotuloCategoria(categoria),
    vert: vertDoDoc(doc),
    verticalLabel: verticalLabelDoDoc(doc),
    href: emPreparacao ? null : `/conteudos/${categoriaParaSegmento(categoria)}/${slug}`,
    emPreparacao,
    dataLegivel: dataLegivelDoDoc(doc),
    assinatura: assinaturaDoDoc(doc),
    imagemUrl: urlImagemCard(doc.imagemDestaque),
    search: normalizarBusca(`${titulo} ${lide}`),
  };
}

function paraLeitura(doc: ConteudoBruto): ConteudoLeitura {
  const autores = Array.isArray(doc.autor)
    ? doc.autor
        .map((a) => objetoOuNulo<EspecialistaBruta>(a))
        .filter((a): a is EspecialistaBruta => a !== null)
        .map((a) => ({
          nome: a.nome ?? "",
          titulacao: a.titulacao ?? "",
          fotoUrl: urlDeMidia(a.foto),
        }))
    : [];

  return {
    ...paraCard(doc),
    slug: doc.slug ?? "",
    capa: capaDoDoc(doc.imagemDestaque),
    corpoHtml: lexicalParaHtmlEditorial(doc.corpo),
    tempoLeituraMin: doc.tempoLeituraMin ?? 1,
    autores,
    anexoUrl: urlDeMidia(doc.anexoDownload),
    linkExterno: doc.linkExterno ?? null,
    dataISO: doc.dataPublicacao ?? null,
    seoTitulo: doc.seo?.tituloSeo ?? "",
    seoDescricao: doc.seo?.descricaoSeo ?? "",
  };
}

// ============================================================
// Leitura
// ============================================================

/**
 * Busca todos os conteúdos (`draft: true` — vê rascunhos "em preparação"
 * também) e filtra para o que o site pode mostrar. Base compartilhada de
 * `listarConteudosPublicados`, `listarDestaques` e do fallback de
 * `listarRelacionados`. Falha do banco degrada para lista vazia, logada.
 *
 * `cache()` aqui (não só nas funções exportadas) é o que garante a
 * deduplicação de verdade: `page.tsx` chama `listarConteudosPublicados()`
 * e `listarDestaques()` no mesmo request, e ambas passam por aqui — sem
 * este `cache()`, seriam duas leituras (`find` com `limit: 200, depth: 2`)
 * das mesmas linhas por render, e uma terceira em qualquer página de
 * conteúdo via o fallback de `listarRelacionados`.
 */
const buscarDocsElegiveis = cache(async (): Promise<ConteudoBruto[]> => {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "conteudos",
      depth: 2,
      draft: true,
      limit: 200,
      sort: "-dataPublicacao",
    });
    return (res.docs as unknown as ConteudoBruto[]).filter(elegivel);
  } catch (erro) {
    console.error("[conteudos] Falha ao listar conteúdos.", erro);
    return [];
  }
});

export const listarConteudosPublicados = cache(async (): Promise<ConteudoCard[]> => {
  const docs = await buscarDocsElegiveis();
  return docs.map(paraCard);
});

export const listarDestaques = cache(async (): Promise<ConteudoCard[]> => {
  const docs = await buscarDocsElegiveis();
  return docs
    .filter((d) => Boolean(d.destaque))
    .slice(0, 3)
    .map(paraCard);
});

export const carregarConteudo = cache(
  async (segmento: string, slug: string): Promise<ConteudoLeitura | null> => {
    const categoria = segmentoParaCategoria(segmento);
    if (!categoria) return null;

    try {
      const payload = await obterPayload();
      const res = await payload.find({
        collection: "conteudos",
        where: { slug: { equals: slug }, categoria: { equals: categoria } },
        depth: 2,
        limit: 1,
        draft: false,
      });
      const doc = res.docs[0] as unknown as ConteudoBruto | undefined;
      if (!doc || doc._status !== "published") return null;
      return paraLeitura(doc);
    } catch (erro) {
      console.error("[conteudos] Falha ao carregar conteúdo.", erro);
      return null;
    }
  },
);

export const listarRelacionados = cache(
  async (doc: ConteudoLeitura): Promise<ConteudoCard[]> => {
    try {
      const payload = await obterPayload();
      const res = await payload.find({
        collection: "conteudos",
        where: { id: { equals: Number(doc.id) } },
        depth: 2,
        limit: 1,
        draft: false,
      });
      const bruto = res.docs[0] as unknown as ConteudoBruto | undefined;
      const escolhidos = Array.isArray(bruto?.conteudosRelacionados)
        ? bruto.conteudosRelacionados
            .map((r) => objetoOuNulo<ConteudoBruto>(r))
            .filter((r): r is ConteudoBruto => r !== null)
        : [];

      if (escolhidos.length > 0) {
        return escolhidos.filter(elegivel).slice(0, 3).map(paraCard);
      }

      // Sem escolha do editor: os 3 publicados mais recentes da mesma área
      // (excluindo o próprio), ou de qualquer vertical quando o conteúdo é
      // transversal (sem área).
      const candidatos = await buscarDocsElegiveis();
      const mesmaVertical =
        doc.vert === "trans" ? candidatos : candidatos.filter((d) => vertDoDoc(d) === doc.vert);
      return mesmaVertical
        .filter((d) => String(d.id) !== doc.id)
        .slice(0, 3)
        .map(paraCard);
    } catch (erro) {
      console.error("[conteudos] Falha ao listar conteúdos relacionados.", erro);
      return [];
    }
  },
);
