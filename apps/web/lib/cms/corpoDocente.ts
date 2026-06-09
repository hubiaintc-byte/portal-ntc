/**
 * Loader + adapter do Global CorpoDocente.
 *
 * Faz fetch do Global via Payload Local API (depth=2 para popular
 * especialista + programas relacionados) e transforma o shape do
 * Payload para `ConteudoCorpoDocente` — mesmo contrato dos componentes
 * client (FilterBarDocentes, HeroQuicklinks, etc.).
 *
 * Cards featured/expert sem especialista populado (deletado ou nunca
 * referenciado) são silenciosamente omitidos com warn no log.
 *
 * Server-only — não importe no client.
 */

import type {
  CorpoDocente as CorpoDocenteGlobal,
  Especialista,
  Media,
  Programa,
} from "@ntc/types/payload-types";

import { obterPayload } from "../payloadClient";

import {
  conteudoFallback,
  type ConteudoCorpoDocente,
} from "../../app/(o-grupo)/o-grupo/corpo-docente/conteudoFallback";
import type {
  CardAxis,
  CardExpert,
  CardFeatured,
  FaqItem,
  Quicklink,
} from "../../app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente";

import { lexicalToHtml } from "./lexical";

const CTA_ROTULO_DEFAULT = "Consultar disponibilidade";

type CardCMS = NonNullable<CorpoDocenteGlobal["cards"]>[number];
type QuicklinkCMS = NonNullable<NonNullable<CorpoDocenteGlobal["hero"]>["quicklinks"]>[number];

export async function fetchCorpoDocente(): Promise<ConteudoCorpoDocente> {
  const payload = await obterPayload();
  const global = (await payload.findGlobal({
    slug: "corpo-docente",
    depth: 2,
  })) as CorpoDocenteGlobal;
  return adaptarGlobal(global);
}

function adaptarGlobal(g: CorpoDocenteGlobal): ConteudoCorpoDocente {
  return {
    HERO: adaptarHero(g),
    METRICAS: adaptarMetricas(g),
    MANIFESTO: adaptarManifesto(g),
    ...adaptarCards(g),
    CREDIBILIDADE: adaptarCredibilidade(g),
    CREDENCIAMENTO: adaptarCredenciamento(g),
    FAQ: adaptarFaq(g),
    CTA_FINAL: adaptarCtaFinal(g),
    STICKY_CTA: adaptarSticky(g),
  };
}

// ============================================================
// Adapters por tab
// ============================================================

function adaptarHero(g: CorpoDocenteGlobal): ConteudoCorpoDocente["HERO"] {
  const h = g.hero;
  return {
    crumb: conteudoFallback.HERO.crumb, // não editável pelo CMS
    eyebrow: h?.eyebrow ?? "",
    titulo: lexicalToHtml(h?.titulo),
    subtitulo: lexicalToHtml(h?.subtitulo),
    quicklinks: (h?.quicklinks ?? []).map(adaptarQuicklink),
  };
}

type QuicklinkTab = Extract<Quicklink, { tipo: "tab" }>;

function adaptarQuicklink(q: QuicklinkCMS): Quicklink {
  if (q.tipo === "tab") {
    return {
      tipo: "tab",
      rotulo: q.rotulo,
      vertShortcut: (q.vertShortcut ?? "todos") as QuicklinkTab["vertShortcut"],
    };
  }
  return { tipo: "anchor", rotulo: q.rotulo, href: q.href ?? "#" };
}

function adaptarMetricas(g: CorpoDocenteGlobal): ConteudoCorpoDocente["METRICAS"] {
  return (g.metricas ?? []).map((m) => ({
    classe: m.classe,
    sublabel: m.sublabel,
    num: m.num,
    label: m.label,
    detalhe: m.detalhe,
  }));
}

function adaptarManifesto(g: CorpoDocenteGlobal): ConteudoCorpoDocente["MANIFESTO"] {
  return {
    marker: g.marker ?? "",
    titulo: lexicalToHtml(g.tituloManifesto),
    lede: g.lede ?? "",
    archCards: (g.archCards ?? []).map((c) => ({
      area: c.area,
      eyebrow: c.eyebrow,
      titulo: c.tituloArch,
      descricao: c.descricao,
      selo: c.selo,
    })),
    camadas: (g.camadas ?? []).map((c) => ({
      num: c.num,
      titulo: c.tituloCamada,
      descricao: c.descricao,
    })),
    callout: {
      titulo: g.callout?.tituloCallout ?? "",
      descricao: g.callout?.descricao ?? "",
    },
    nota: lexicalToHtml(g.nota),
  };
}

interface CardsAdaptados {
  CARDS_FEATURED: CardFeatured[];
  CARDS_EXPERTS: CardExpert[];
  CARDS_AXIS_SAUDE: CardAxis[];
}

function adaptarCards(g: CorpoDocenteGlobal): CardsAdaptados {
  const featured: CardFeatured[] = [];
  const experts: CardExpert[] = [];
  const axis: CardAxis[] = [];

  for (const card of g.cards ?? []) {
    if (card.formato === "axis") {
      axis.push(adaptarCardAxis(card));
      continue;
    }

    const esp = card.especialista;
    if (typeof esp !== "object" || esp === null) {
      console.warn(
        `[cms/corpoDocente] card '${card.formato}' sem especialista populado — omitido. id=${card.id ?? "?"}`,
      );
      continue;
    }

    // Especialista marcado como oculto no CMS (ex.: ainda com foto genérica)
    // não entra na grade nem nos featured.
    if (esp.ocultarDoSite) {
      console.warn(
        `[cms/corpoDocente] especialista '${esp.nome}' oculto do site — card omitido.`,
      );
      continue;
    }

    if (card.formato === "featured") {
      featured.push(adaptarCardFeatured(card, esp));
    } else {
      experts.push(adaptarCardExpert(card, esp));
    }
  }

  return { CARDS_FEATURED: featured, CARDS_EXPERTS: experts, CARDS_AXIS_SAUDE: axis };
}

function adaptarCardFeatured(card: CardCMS, esp: Especialista): CardFeatured {
  const dataset = derivarDataset(esp);
  const fotoUrl = urlDaFoto(esp.foto);
  return {
    ...dataset,
    nome: esp.nome,
    imagemSrc: fotoUrl,
    imagemAlt: esp.nome,
    axisBadge: card.axisBadge ?? "",
    tag: card.tag ?? "",
    credencial: card.credencialCard ?? "",
    metaAtuacao: card.metaAtuacao ?? "",
    metaEixos: card.metaEixos ?? "",
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
  };
}

function adaptarCardExpert(card: CardCMS, esp: Especialista): CardExpert {
  const dataset = derivarDataset(esp);
  const fotoUrl = urlDaFoto(esp.foto);
  return {
    ...dataset,
    nome: esp.nome,
    imagemSrc: fotoUrl,
    imagemAlt: esp.nome,
    axisBadge: card.axisBadge ?? "",
    tipoTag: card.tag ?? "",
    nomeExibido: esp.nome,
    credencial: card.credencialCard ?? "",
    programasTexto: card.programasTexto ?? "",
    programasStrong: card.programasStrong ?? "",
    sufixoPrograma: card.sufixoPrograma ?? undefined,
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
  };
}

function adaptarCardAxis(card: CardCMS): CardAxis {
  return {
    vertical: "saude",
    area: card.area ?? "",
    tipo: "pesquisador",
    frente: "",
    programas: card.programasStrongAxis ?? "",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "",
    nome: card.tituloAxis ?? "",
    iconeSvgInner: card.iconeSvgInner ?? "",
    axisTag: card.axisTag ?? "",
    titulo: card.tituloAxis ?? "",
    credencial: card.credencialAxis ?? "",
    programasTexto: card.programasTextoAxis ?? "",
    programasStrong: card.programasStrongAxis ?? "",
    ctaHref: card.ctaHref ?? "#",
    ctaRotulo: card.ctaRotulo ?? CTA_ROTULO_DEFAULT,
    styleAccent: card.styleAccent ?? "",
    styleAccentDark: card.styleAccentDark ?? "",
  };
}

interface Dataset {
  vertical: CardFeatured["vertical"];
  area: string;
  tipo: CardFeatured["tipo"];
  frente: CardFeatured["frente"];
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
}

function derivarDataset(esp: Especialista): Dataset {
  const programas = (esp.programasRelacionados ?? [])
    .map((p) => (typeof p === "object" && p !== null ? siglaDoPrograma(p) : ""))
    .filter(Boolean)
    .join(",");

  return {
    vertical: (esp.vertical ?? "gestao-publica") as Dataset["vertical"],
    area: primeiraArea(esp.linhasAtuacao),
    tipo: (esp.tipo ?? "consultor") as Dataset["tipo"],
    frente: (esp.frente ?? "") as Dataset["frente"],
    programas,
    formacao: esp.formacao ?? "",
    atuacao: Array.isArray(esp.atuacao) ? esp.atuacao.join(",") : "",
    cmsLink: esp.slug ?? "",
  };
}

function primeiraArea(linhas: Especialista["linhasAtuacao"]): string {
  if (!Array.isArray(linhas) || linhas.length === 0) return "";
  const primeira = linhas[0];
  if (typeof primeira === "object" && primeira !== null) {
    return primeira.slug ?? "";
  }
  return "";
}

function siglaDoPrograma(p: Programa): string {
  // Programas têm campo `sigla` próprio (ex: "PROGE", "EDUTEC", "PROSUS+");
  // o dataset do HTML usa SIGLAS, não slug. Fallback para slug em UPPER caso
  // o seed ainda não tenha populado `sigla`.
  if (p.sigla) return p.sigla;
  return (p.slug ?? "").toUpperCase();
}

function urlDaFoto(foto: Especialista["foto"]): string {
  if (typeof foto === "object" && foto !== null) {
    return (foto as Media).url ?? "";
  }
  return "";
}

function adaptarCredibilidade(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CREDIBILIDADE"] {
  const c = g.credibilidade;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCredibilidade),
    lede: c?.lede ?? "",
    items: (c?.items ?? []).map((i) => ({ num: i.num, label: i.label, detalhe: i.detalhe })),
    rodape: lexicalToHtml(c?.rodape),
  };
}

function adaptarCredenciamento(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CREDENCIAMENTO"] {
  const c = g.credenciamento;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCredenciamento),
    descricao: c?.descricao ?? "",
    lista: (c?.lista ?? []).map((l) => l.texto),
    ctas: (c?.ctas ?? []).map((cta) => ({
      rotulo: cta.rotulo,
      href: cta.href,
      variante: cta.variante as ConteudoCorpoDocente["CREDENCIAMENTO"]["ctas"][number]["variante"],
    })),
    aside: {
      eyebrow: c?.aside?.eyebrow ?? "",
      titulo: c?.aside?.tituloAside ?? "",
      intro: c?.aside?.intro ?? "",
      checklist: (c?.aside?.checklist ?? []).map((it) => it.texto),
      nota: c?.aside?.nota ?? "",
    },
  };
}

function adaptarFaq(g: CorpoDocenteGlobal): FaqItem[] {
  return (g.faqItems ?? []).map((item) => ({
    id: item.id ?? "",
    titulo: item.pergunta,
    parags: (item.parags ?? []).map((p) => p.texto),
  }));
}

function adaptarCtaFinal(g: CorpoDocenteGlobal): ConteudoCorpoDocente["CTA_FINAL"] {
  const c = g.ctaFinal;
  return {
    eyebrow: c?.eyebrow ?? "",
    titulo: lexicalToHtml(c?.tituloCtaFinal),
    descricao: c?.descricao ?? "",
    ctaPrincipal: {
      rotulo: c?.ctaPrincipal?.rotulo ?? "",
      href: c?.ctaPrincipal?.href ?? "#",
      variante: (c?.ctaPrincipal?.variante ?? "gold") as ConteudoCorpoDocente["CTA_FINAL"]["ctaPrincipal"]["variante"],
    },
    ctaSecundario: {
      rotulo: c?.ctaSecundario?.rotulo ?? "",
      href: c?.ctaSecundario?.href ?? "#",
      variante: (c?.ctaSecundario?.variante ?? "ghost-light") as ConteudoCorpoDocente["CTA_FINAL"]["ctaSecundario"]["variante"],
    },
    separadorAreas: c?.separadorAreas ?? "",
    ctasArea: (c?.ctasArea ?? []).map((cta) => ({ rotulo: cta.rotulo, href: cta.href })),
  };
}

function adaptarSticky(g: CorpoDocenteGlobal): ConteudoCorpoDocente["STICKY_CTA"] {
  return {
    rotulo: g.stickyCta?.rotulo ?? "",
    href: g.stickyCta?.href ?? "#",
  };
}
