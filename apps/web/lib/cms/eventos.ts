/**
 * Loader + adapter da coleção `eventos`.
 *
 * Faz fetch de um evento por slug via Payload Local API (depth=2 para popular
 * `area`, `palestrantes` → especialistas e `imagemCapa`) e transforma o shape
 * do Payload para o tipo `Evento` local (union discriminada que o layout de
 * `/agenda/[slug]` já consome).
 *
 * O tipo local é editorialmente rico (porta do protótipo HTML); o CMS preenche
 * hoje um subconjunto. Seções sem equivalente no CMS são devolvidas como
 * estrutura válida vazia — o layout (outra task) as oculta quando vazias.
 *
 * Server-only — não importe no client.
 */

import type {
  Area,
  Especialista,
  Evento as EventoCMS,
  Media,
} from "@ntc/types/payload-types";

import { obterPayload } from "../payloadClient";

import type {
  AreaVertical,
  Diferencial,
  Evento,
  EventoBase,
  FormatoEvento,
  ItemFaqEvento,
  Palestrante,
  SecaoConteudoProgramatico,
  SecaoCtaFinal,
  SecaoDiferenciais,
  SecaoFaq,
  SecaoInvestimento,
  SecaoLocal,
  SecaoObjetivos,
  SecaoPalestrantes,
  SecaoProgramacao,
  SecaoPublico,
  SecaoRelatedEvents,
  SecaoReplayCert,
  SecaoVisaoGeral,
  HeroEvento,
  SidebarCard,
} from "../../app/(capacitacao)/agenda/[slug]/conteudoEventos";

import { lexicalParaBlocos, lexicalToHtml } from "./lexical";

// ============================================================
// Loader
// ============================================================

export async function fetchEvento(slug: string): Promise<Evento | null> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "eventos",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  });
  const doc = res.docs[0];
  if (!doc) return null;
  return adaptarEvento(doc);
}

// ============================================================
// Helpers
// ============================================================

function urlDaFoto(foto: Especialista["foto"] | EventoCMS["imagemCapa"]): string {
  if (typeof foto === "object" && foto !== null) {
    return (foto as Media).url ?? "";
  }
  return "";
}

function adaptarPalestrantes(doc: EventoCMS): Palestrante[] {
  const lista = doc.palestrantes ?? [];
  return lista
    .filter((esp): esp is Especialista => typeof esp === "object" && esp !== null)
    .map((esp) => ({
      foto: urlDaFoto(esp.foto),
      role: esp.instituicao ?? "",
      nome: esp.nome ?? "",
      credenciais: lexicalToHtml(esp.curriculoCurto),
    }));
}

function derivarArea(area: EventoCMS["area"]): AreaVertical {
  const sigla =
    typeof area === "object" && area !== null ? (area as Area).sigla : undefined;
  switch (sigla) {
    case "saude":
      return "sau";
    case "gestao-publica":
      return "gov";
    case "educacao":
      return "edu";
    default:
      return "edu";
  }
}

function derivarFormato(modalidade: EventoCMS["modalidade"]): FormatoEvento {
  if (modalidade === "online") return "online";
  if (modalidade === "hibrido") return "hibrido";
  return "presencial";
}

function juntarLocal(local: EventoCMS["local"]): string {
  if (!local) return "";
  return [local.nomeLocal, local.endereco, local.cidade, local.estado]
    .filter((p): p is string => Boolean(p))
    .join(", ");
}

// ------------------ Seções editoriais ------------------

function adaptarPalestrantesSecao(doc: EventoCMS): SecaoPalestrantes {
  return {
    eyebrow: "Quem conduz",
    h2: "Palestrantes",
    intro: "",
    palestrantes: adaptarPalestrantes(doc),
    nota: "",
  };
}

function adaptarVisaoGeral(doc: EventoCMS): SecaoVisaoGeral {
  return {
    eyebrow: "Visão geral",
    h2: "Sobre o evento",
    lede: doc.resumo ?? "",
    paragrafos: [],
  };
}

function adaptarPublico(doc: EventoCMS): SecaoPublico {
  // O layout renderiza intro/chips como texto escapado — usa a estrutura do
  // documento (parágrafos → intro, itens de lista → chips), não HTML.
  const blocos = lexicalParaBlocos(doc.publicoAlvo);
  return {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: blocos.paragrafos.join(" "),
    chips: blocos.itens.map((texto) => ({ texto })),
  };
}

function adaptarObjetivos(doc: EventoCMS): SecaoObjetivos {
  const blocos = lexicalParaBlocos(doc.objetivos);
  const entradas = blocos.itens.length > 0 ? blocos.itens : blocos.paragrafos;
  return {
    eyebrow: "Objetivos",
    h2: "O que você desenvolve",
    objetivos: entradas.map((texto) => ({ texto })),
  };
}

function adaptarConteudoProgramatico(doc: EventoCMS): SecaoConteudoProgramatico {
  const blocos = lexicalParaBlocos(doc.conteudoProgramatico);
  return {
    eyebrow: "Conteúdo",
    h2: "Conteúdo programático",
    intro: blocos.paragrafos.join(" "),
    itens: blocos.itens.map((texto, i) => ({
      num: String(i + 1).padStart(2, "0"),
      texto,
    })),
  };
}

function adaptarProgramacao(): SecaoProgramacao {
  return {
    eyebrow: "Programação",
    h2: "Programação detalhada",
    intro: "",
    dias: [],
  };
}

function adaptarDiferenciais(doc: EventoCMS): SecaoDiferenciais {
  const diferenciais: Diferencial[] = (doc.diferenciais ?? []).map((d, i) => ({
    num: String(i + 1).padStart(2, "0"),
    titulo: d.titulo ?? "",
    descricao: d.descricao ?? "",
  }));
  return {
    eyebrow: "Diferenciais",
    h2: "Por que participar",
    diferenciais,
  };
}

function adaptarReplayCert(): SecaoReplayCert {
  return {
    eyebrow: "Replay e certificado",
    h2: "Acesso pós-evento",
    cards: [],
  };
}

function adaptarInvestimento(doc: EventoCMS): SecaoInvestimento {
  return {
    eyebrow: "Investimento",
    h2: "Investimento",
    rules: doc.valor ? [doc.valor] : [],
  };
}

function adaptarFaq(doc: EventoCMS): SecaoFaq {
  const faqs: ItemFaqEvento[] = (doc.faq ?? []).map((item, i) => ({
    id: item.id ?? `faq-${i + 1}`,
    pergunta: item.pergunta,
    respostaHtml: lexicalToHtml(item.resposta),
  }));
  return {
    eyebrow: "Dúvidas",
    h2: "Perguntas frequentes",
    faqs,
  };
}

function adaptarCtaFinal(): SecaoCtaFinal {
  return {
    eyebrowGold: "",
    h2: "",
    paragrafo: "",
    ctas: [],
  };
}

function adaptarRelatedEvents(): SecaoRelatedEvents {
  return {
    eyebrowGold: "",
    h2: "",
    intro: "",
    cards: [],
    footerCtas: [],
  };
}

function adaptarLocal(doc: EventoCMS): SecaoLocal {
  const local = doc.local;
  const enderecoLinhas = local
    ? [local.endereco, [local.cidade, local.estado].filter(Boolean).join(" · ")].filter(
        (l): l is string => Boolean(l),
      )
    : [];
  return {
    eyebrow: "Onde",
    h2: "Local",
    venueInfo: {
      titulo: local?.nomeLocal ?? "",
      enderecoLinhas,
      meta: "",
      hospedagemHtml: "",
    },
    mapLabel: "",
    pinLabel: local?.cidade ?? "",
  };
}

function adaptarHero(doc: EventoCMS, formato: FormatoEvento): HeroEvento {
  const tags: HeroEvento["tags"] = [];
  if (doc.eyebrow) {
    tags.push({ texto: doc.eyebrow, classe: "event-hero-format" });
  }
  const labelFormato =
    formato === "online" ? "Online" : formato === "hibrido" ? "Híbrido" : "Presencial";
  tags.push({ texto: labelFormato, classe: "event-hero-format" });

  return {
    tags,
    h1: doc.nome ?? "",
    sub: doc.resumo ?? "",
    programBinding: {
      texto: "",
      href: "#",
      nomePrograma: "",
    },
    ctas: [],
  };
}

function sidebarVazio(): SidebarCard {
  return {
    coverImg: "",
    status: "",
    tituloCard: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "textual" },
    acoes: [],
    share: { label: "", links: [] },
  };
}

// ============================================================
// Adapter principal
// ============================================================

export function adaptarEvento(doc: EventoCMS): Evento {
  const formato = derivarFormato(doc.modalidade);
  const area = derivarArea(doc.area);

  const base: Omit<EventoBase, "formato"> = {
    slug: doc.slug,
    titulo: doc.nome,
    subtitulo: doc.resumo ?? "",
    dataEvento: doc.dataInicio,
    area,
    crumb: [],
    hero: adaptarHero(doc, formato),
    metas: [],
    navLinks: [],
    visaoGeral: adaptarVisaoGeral(doc),
    publico: adaptarPublico(doc),
    objetivos: adaptarObjetivos(doc),
    conteudoProgramatico: adaptarConteudoProgramatico(doc),
    programacao: adaptarProgramacao(),
    palestrantes: adaptarPalestrantesSecao(doc),
    diferenciais: adaptarDiferenciais(doc),
    replayCert: adaptarReplayCert(),
    investimento: adaptarInvestimento(doc),
    faq: adaptarFaq(doc),
    ctaFinal: adaptarCtaFinal(),
    sidebar: sidebarVazio(),
    relatedEvents: adaptarRelatedEvents(),
    agendaIcs: {
      titulo: doc.nome,
      descricao: doc.resumo ?? "",
      location: juntarLocal(doc.local),
      startISO: doc.dataInicio,
      endISO: doc.dataFim ?? doc.dataInicio,
      filename: `${doc.slug}.ics`,
    },
  };

  if (formato === "online") {
    return { ...base, formato: "online" };
  }

  return {
    ...base,
    formato,
    local: adaptarLocal(doc),
  };
}
