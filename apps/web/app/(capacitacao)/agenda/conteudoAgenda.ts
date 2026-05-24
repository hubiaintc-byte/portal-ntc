// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /AGENDA
//  Porta de 09_Pagina_Agenda_v2.html (linhas 2237-3026 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs (espelham data-* dos cards) -----------------

export type AreaSlug = "edu" | "gov" | "sau";

export type TabSlug = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

export type StatusEvento = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

export type FormatoEvento =
  | "seminario"
  | "oficina"
  | "curso"
  | "jornada"
  | "simposio"
  | "congresso";

export type ModalidadeEvento = "online" | "presencial" | "hibrido";

export type ProgramaSlug =
  | "EDUTEC"
  | "PEAR"
  | "PEI"
  | "PROGE"
  | "PROGIR"
  | "EGIDE"
  | "VIVAESCOLA"
  | "PINEI"
  | "FUTURA"
  | "AGIP"
  | "LIDERA"
  | "SIGA"
  | "SIGS"
  | "PROAPS"
  | "PROSUS";

export type FlagEvento =
  | "destaque_editorial"
  | "prioridade_comercial"
  | "ultimas_vagas"
  | "fixado_na_agenda";

export type CidadeSlug = "" | "brasilia" | "sp" | "recife" | "salvador" | "fortaleza";

// ----------------- Tipos de bloco de data -----------------

export type DataBloco =
  | { tipo: "range"; diaInicio: string; diaFim: string; mesAno: string }
  | { tipo: "multi"; quantidade: number; rotulo: string; periodo: string }
  | { tipo: "single"; dia: string; mesAno: string };

// ----------------- Link interno (CTA, programa binding, etc.) -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  title?: string;
}

// ----------------- Cartão de evento (espelho do <article class="event-card">) -----------------

export interface CartaoEvento {
  ordem: number; // posição original no protótipo (1..17)

  // data-* attributes (preservados para CSS/seletores)
  area: AreaSlug;
  programa: ProgramaSlug;
  formato: FormatoEvento;
  modalidade: ModalidadeEvento;
  cidade: CidadeSlug;
  mes: string; // YYYY-MM
  cargaHorariaHoras: number;
  valorReais: number;
  dataIso: string; // YYYY-MM-DD
  deadlineIso: string; // YYYY-MM-DD
  tab: TabSlug;
  flags: FlagEvento[];
  keywords: string;
  status: StatusEvento;

  // Conteúdo visual
  selo: { texto: string; classe: string }; // ex.: "Inscrições abertas" / "status-open"
  imagemUrl: string;
  dataBloco: DataBloco;
  modalidadeLabel: string;
  modalidadeClasseExtra?: "hibrido" | "presencial";
  formatoLabel: string;
  areaLabel: string;
  tituloHtml: string; // pode conter inline tags
  coordenacaoNomes: string;
  metaEssenciais: [string, string];
  precoIndividualLabel: string;
  precoEquipesLabel: string;
  programaBinding: { sigla: string; href: string; cmsLink: string };
  ctaInscrever: LinkInterno;
  linkDetalhes: LinkInterno;
  linkInscreverEquipe: LinkInterno;
}

// ----------------- HERO -----------------

export const HERO_AGENDA = {
  eyebrow: "Capacitação e Desenvolvimento · Edição 2026",
  tituloHtml:
    "Agenda <em>Geral NTC</em>.<br>Eventos, formações e jornadas com inscrições abertas.",
  sub:
    "Encontre seminários, oficinas, cursos executivos, jornadas, simpósios e congressos do Grupo NTC nas áreas de Educação, Gestão Pública e Saúde — em formato online, presencial ou híbrido.",
  ctas: [
    {
      classe: "btn btn--gold",
      texto: "Ver eventos com inscrições abertas",
      seta: true,
      href: "#agenda-eventos",
      cmsLink: "ver-eventos-abertos",
      track: "hero_cta_ver_eventos",
    },
    {
      classe: "btn btn--ghost-light",
      texto: "Solicitar proposta para equipe ou órgão público",
      seta: false,
      href: "/contato",
      // TODO: protótipo aponta para tab `#tab-proposta` — ativar quando /contato suportar âncoras de tab
      cmsLink: "proposta-equipe-orgao",
      track: "hero_cta_proposta",
    },
  ],
  microbar: [
    { valor: "18", rotulo: "eventos abertos", id: "microbar-abertos" },
    { valor: "6", rotulo: "formatos comerciais" },
    { valor: "3", rotulo: "áreas estratégicas" },
    { valor: "5", rotulo: "capitais nacionais" },
  ],
} as const;

// ----------------- TABS -----------------

export interface TabAgenda {
  slug: TabSlug;
  rotulo: string;
  idCount: string;
}

export const TABS_AGENDA: TabAgenda[] = [
  { slug: "abertas", rotulo: "Inscrições abertas", idCount: "cnt-abertas" },
  { slug: "proximas", rotulo: "Próximas turmas", idCount: "cnt-proximas" },
  { slug: "em-breve", rotulo: "Em breve", idCount: "cnt-em-breve" },
  { slug: "replay", rotulo: "Replay disponível", idCount: "cnt-replay" },
  { slug: "realizados", rotulo: "Eventos realizados", idCount: "cnt-realizados" },
];

// ----------------- FILTROS -----------------

export interface OpcaoSelect {
  value: string;
  label: string;
}

export interface OptgroupSelect {
  label: string;
  opcoes: OpcaoSelect[];
}

export const FILTRO_AREA: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "edu", label: "NTC Educação" },
  { value: "gov", label: "NTC Gestão Pública" },
  { value: "sau", label: "NTC Saúde" },
];

export const FILTRO_MODALIDADE: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "online", label: "Online ao vivo + replay" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
];

export const FILTRO_MES: OpcaoSelect[] = [
  { value: "", label: "Todos" },
  { value: "2026-05", label: "Mai 2026" },
  { value: "2026-06", label: "Jun 2026" },
  { value: "2026-07", label: "Jul 2026" },
  { value: "2026-08", label: "Ago 2026" },
  { value: "2026-09", label: "Set 2026" },
  { value: "2026-10", label: "Out 2026" },
];

export const FILTRO_PROGRAMA_GROUPS: OptgroupSelect[] = [
  {
    label: "NTC Educação",
    opcoes: [
      { value: "EDUTEC", label: "EDUTEC" },
      { value: "PEAR", label: "PEAR" },
      { value: "PEI", label: "PEI" },
      { value: "PROGE", label: "PROGE" },
      { value: "PROGIR", label: "PROGIR" },
      { value: "EGIDE", label: "EGIDE" },
      { value: "VIVAESCOLA", label: "VIVAESCOLA" },
      { value: "PINEI", label: "PINEI" },
      { value: "FUTURA", label: "FUTURA" },
    ],
  },
  {
    label: "NTC Gestão Pública",
    opcoes: [
      { value: "AGIP", label: "AGIP" },
      { value: "LIDERA", label: "LIDERA" },
      { value: "SIGA", label: "SIGA" },
    ],
  },
  {
    label: "NTC Saúde",
    opcoes: [
      { value: "SIGS", label: "SIGS" },
      { value: "PROAPS", label: "PROAPS+" },
      { value: "PROSUS", label: "PROSUS+" },
    ],
  },
];

export const FILTRO_FORMATO: OpcaoSelect[] = [
  { value: "", label: "Todos" },
  { value: "seminario", label: "Seminário" },
  { value: "oficina", label: "Oficina" },
  { value: "curso", label: "Curso Executivo" },
  { value: "jornada", label: "Jornada" },
  { value: "simposio", label: "Simpósio" },
  { value: "congresso", label: "Congresso" },
];

export const FILTRO_CIDADE: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "brasilia", label: "Brasília · DF" },
  { value: "sp", label: "São Paulo · SP" },
  { value: "recife", label: "Recife · PE" },
  { value: "salvador", label: "Salvador · BA" },
  { value: "fortaleza", label: "Fortaleza · CE" },
];

export const FILTRO_SORT: OpcaoSelect[] = [
  { value: "editorial", label: "Editorial (destaque + cronologia)" },
  { value: "cronologica", label: "Cronologia (próximos primeiro)" },
  { value: "encerramento", label: "Encerramento das inscrições" },
  { value: "ch", label: "Carga horária" },
  { value: "valor-asc", label: "Valor (menor → maior)" },
  { value: "valor-desc", label: "Valor (maior → menor)" },
];

export type SortSlug =
  | "editorial"
  | "cronologica"
  | "encerramento"
  | "ch"
  | "valor-asc"
  | "valor-desc";

export const PERPAGE_OPCOES = [9, 12, 18] as const;
export type PerPageOpcao = (typeof PERPAGE_OPCOES)[number];

export const DEFAULTS = {
  tab: "abertas" as TabSlug,
  sort: "editorial" as SortSlug,
  page: 1,
  perPage: 9 as PerPageOpcao,
};

// Labels para chips de filtros aplicados (espelha objeto `labels` do protótipo)
export const LABELS = {
  area: { edu: "NTC Educação", gov: "NTC Gestão Pública", sau: "NTC Saúde" } as Record<
    AreaSlug,
    string
  >,
  formato: {
    seminario: "Seminário",
    oficina: "Oficina",
    curso: "Curso Executivo",
    jornada: "Jornada",
    simposio: "Simpósio",
    congresso: "Congresso",
  } as Record<FormatoEvento, string>,
  modalidade: {
    online: "Online ao vivo",
    presencial: "Presencial",
    hibrido: "Híbrido",
  } as Record<ModalidadeEvento, string>,
  cidade: {
    brasilia: "Brasília · DF",
    sp: "São Paulo · SP",
    recife: "Recife · PE",
    salvador: "Salvador · BA",
    fortaleza: "Fortaleza · CE",
  } as Record<Exclude<CidadeSlug, "">, string>,
  mes: {
    "2026-05": "Mai 2026",
    "2026-06": "Jun 2026",
    "2026-07": "Jul 2026",
    "2026-08": "Ago 2026",
    "2026-09": "Set 2026",
    "2026-10": "Out 2026",
  } as Record<string, string>,
};

// ----------------- EMPTY STATE -----------------

export const EMPTY_AGENDA = {
  titulo: "Nenhum evento encontrado com os filtros aplicados.",
  descricao:
    "Tente remover algum filtro ou solicite uma capacitação sob medida para a sua instituição — desenhamos a oferta com você.",
  ctaLimpar: { texto: "Limpar filtros", href: "#" },
  ctaSobMedida: {
    texto: "Solicitar evento sob medida",
    href: "/contato",
    cmsLink: "solicitar-sob-medida",
    track: "empty_state_sob_medida",
  },
};

// ----------------- CTAs INTERMEDIÁRIOS -----------------

export interface CtaIntermediario {
  eyebrow: string;
  tituloHtml: string;
  descricao: string;
  cta: LinkInterno;
  classeExtra?: "alt";
}

export const CTAS_INTERMEDIARIOS: CtaIntermediario[] = [
  {
    eyebrow: "Sob medida · Solução exclusiva",
    tituloHtml:
      "Desenhe uma capacitação exclusiva para a <em>sua instituição</em>",
    descricao:
      "Solicite um evento sob medida com ementa, especialistas, formato e calendário alinhados às necessidades da sua equipe, rede ou órgão público.",
    cta: {
      texto: "Solicitar evento sob medida",
      href: "/contato",
      cmsLink: "solicitar-sob-medida",
      track: "cta_intermediate_sob_medida",
    },
  },
  {
    eyebrow: "In company · Turmas fechadas",
    tituloHtml: "Leve esta formação para a sua <em>equipe ou órgão público</em>",
    descricao:
      "Programas, jornadas e módulos do portfólio NTC podem ser organizados em turmas fechadas, soluções in company ou trilhas institucionais personalizadas.",
    cta: {
      texto: "Falar com atendimento institucional",
      href: "/contato",
      cmsLink: "atendimento-institucional",
      track: "cta_intermediate_in_company",
    },
    classeExtra: "alt",
  },
];

// ----------------- RODAPÉ CONTEXTUAL -----------------

export interface ColunaRodape {
  titulo: string;
  itens: LinkInterno[];
}

export const RODAPE_CONTEXTUAL: ColunaRodape[] = [
  {
    titulo: "Áreas estratégicas",
    itens: [
      { texto: "NTC Educação", href: "/solucoes-estrategicas/ntc-educacao", cmsLink: "vertical-edu" },
      // TODO: rota /solucoes-estrategicas/ntc-gestao-publica existe — verificar slug
      { texto: "NTC Gestão Pública", href: "/solucoes-estrategicas/ntc-gestao-publica", cmsLink: "vertical-gov" },
      { texto: "NTC Saúde", href: "/solucoes-estrategicas/ntc-saude", cmsLink: "vertical-sau" },
    ],
  },
  {
    titulo: "Plataforma e suporte",
    itens: [
      // TODO: âncora #eventon ainda não existe em /o-grupo
      { texto: "EventOn · Plataforma de transmissão", href: "/o-grupo#eventon", cmsLink: "eventon" },
      { texto: "Suporte ao participante", href: "/contato", cmsLink: "eventon-suporte" },
      { texto: "Área do Participante", href: "/contato", cmsLink: "area-participante" },
    ],
  },
  {
    titulo: "Modelos de contratação",
    itens: [
      // TODO: âncora #juridico ainda não existe em /o-grupo
      { texto: "Lei 14.133/2021 · Inexigibilidade", href: "/o-grupo#juridico", cmsLink: "contratacao-lei14133" },
      { texto: "Soluções in company", href: "/contato", cmsLink: "contratacao-incompany" },
      { texto: "Soluções sob medida", href: "/contato", cmsLink: "contratacao-sobmedida" },
    ],
  },
  {
    titulo: "Atendimento comercial",
    itens: [
      { texto: "Solicitar proposta institucional", href: "/contato", cmsLink: "proposta-institucional" },
      { texto: "WhatsApp · (63) 98444-4040", href: "/contato", cmsLink: "whatsapp" },
      { texto: "contato@institutontc.com.br", href: "/contato", cmsLink: "comercial-email" },
    ],
  },
];

// ----------------- STICKY MOBILE CTA -----------------

export const STICKY_CTA = {
  strong: "Precisa de ajuda?",
  texto: "Atendimento institucional NTC",
  cta: {
    texto: "Falar com atendimento",
    href: "/contato",
    cmsLink: "atendimento-mobile",
    track: "sticky_cta_atendimento",
  },
};

// ----------------- BREADCRUMB -----------------

export const BREADCRUMB_AGENDA = [
  { texto: "Grupo NTC", href: "/", cmsLink: "home" },
  { texto: "Capacitação", href: null }, // sem rota ainda
  { texto: "Agenda Geral", href: null, current: true },
];
