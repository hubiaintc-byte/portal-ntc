import type {
  CartaoEvento,
} from "@/app/(capacitacao)/agenda/conteudoAgenda";
import type {
  Evento,
} from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";
import type {
  EventoCard,
  EventoCardSecundario,
} from "@/app/(home)/conteudoFallback";

/**
 * Adapters: derivam os shapes de card (Home e Agenda) a partir dos eventos
 * reais de EVENTOS_AGENDA. Fonte única — adicionar/editar evento mexe num lugar.
 * Eventos sem bloco `card` retornam null (não entram nas listagens).
 */

function areaLabel(a: "edu" | "gov" | "sau"): string {
  return a === "edu"
    ? "NTC Educação"
    : a === "gov"
      ? "NTC Gestão Pública"
      : "NTC Saúde";
}

export function paraCardHomePrincipal(e: Evento): EventoCard | null {
  const c = e.card;
  if (!c) return null;
  return {
    area: e.area,
    destaque: c.flags.includes("destaque_editorial"),
    statusTag: { rotulo: "Inscrições abertas", tipo: "open" },
    imagemSrc: c.imagemUrl,
    data: {
      variante: "single",
      dia: c.diaDataBloco,
      monYr: c.mesAnoDataBloco,
    },
    modalidade: { texto: c.modalidadeLabel },
    programLink: `${c.formatoLabel} · ${areaLabel(e.area)}`,
    titulo: e.titulo,
    coordenacao: { label: "Coordenação", nomes: c.coordenacaoNomes },
    meta: { ch: c.metaEssenciais[0], local: c.metaEssenciais[1] },
    programaBinding: {
      sigla: c.programaSlug,
      href: `/programas/${c.programaSlug.toLowerCase()}`,
    },
    precoIndividual: c.precoIndividualLabel,
    precoInstitucional: c.precoEquipesLabel,
    ctas: {
      principal: { rotulo: "Inscrever-se", href: `/agenda/${e.slug}` },
      detalhes: { rotulo: "Ver detalhes", href: `/agenda/${e.slug}` },
      grupo: {
        rotulo: "Proposta para grupo",
        href: `/contato?evento=${encodeURIComponent(e.titulo)}`,
      },
    },
  };
}

export function paraCardHomeSecundario(e: Evento): EventoCardSecundario | null {
  const c = e.card;
  if (!c) return null;
  return {
    area: e.area,
    imagemSrc: c.imagemUrl,
    data: {
      variante: "single",
      dia: c.diaDataBloco,
      monYr: c.mesAnoDataBloco,
    },
    programa: `${c.formatoLabel} · ${areaLabel(e.area)}`,
    titulo: e.titulo,
    bindingSigla: c.programaSlug,
    metaCompleto: `${c.modalidadeLabel} · ${c.metaEssenciais[0]} · ${c.precoIndividualLabel}`,
    preco: c.precoIndividualLabel,
    ctaRotulo: "Ver detalhes",
    ctaHref: `/agenda/${e.slug}`,
  };
}

export function paraCartaoAgenda(e: Evento, ordem: number): CartaoEvento | null {
  const c = e.card;
  if (!c) return null;
  return {
    ordem,
    area: e.area,
    programa: c.programaSlug,
    formato: c.formatoCard,
    modalidade: "online",
    cidade: "",
    mes: c.deadlineIso.slice(0, 7),
    cargaHorariaHoras: 8,
    valorReais: c.valorReais,
    dataIso: c.deadlineIso,
    deadlineIso: c.deadlineIso,
    tab: "abertas",
    flags: [],
    keywords: c.keywords,
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: c.imagemUrl,
    dataBloco: { tipo: "single", dia: c.diaDataBloco, mesAno: c.mesAnoDataBloco },
    modalidadeLabel: c.modalidadeLabel,
    formatoLabel: c.formatoLabel,
    areaLabel: areaLabel(e.area),
    tituloHtml: e.titulo,
    coordenacaoNomes: c.coordenacaoNomes,
    metaEssenciais: c.metaEssenciais,
    precoIndividualLabel: c.precoIndividualLabel,
    precoEquipesLabel: c.precoEquipesLabel,
    programaBinding: {
      sigla: c.programaSlug,
      href: `/programas/${c.programaSlug.toLowerCase()}`,
      cmsLink: `programa-${c.programaSlug}`,
    },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: `/agenda/${e.slug}`,
      cmsLink: `inscricao-${e.slug}`,
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: `/agenda/${e.slug}`,
      cmsLink: `detalhes-${e.slug}`,
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: `/contato?evento=${encodeURIComponent(e.titulo)}`,
      cmsLink: `proposta-grupo-${e.slug}`,
      track: "cta_proposta_grupo",
    },
  };
}
