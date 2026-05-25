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
  | "fixado_na_agenda"
  | "evento_em_destaque"
  | "inscricoes_encerrando";

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

  // Featured (espelha class="event-card is-featured" + <span class="event-featured-badge">)
  eventoEmDestaque?: boolean;
  badgeDestaqueTexto?: string;

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
      { texto: "NTC Educação", href: "/solucoes-estrategicas/educacao", cmsLink: "vertical-edu" },
      { texto: "NTC Gestão Pública", href: "/solucoes-estrategicas/gestao-publica", cmsLink: "vertical-gov" },
      { texto: "NTC Saúde", href: "/solucoes-estrategicas/saude", cmsLink: "vertical-sau" },
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

// ----------------- 18 EVENTOS (ordem literal do protótipo) -----------------
//
// Mapeamento fiel de cada <article class="event-card"> do <main> do HTML
// (linhas 2475-2998 de 09_Pagina_Agenda_v2.html). Nenhum texto é rephrased.
// Todos os data-* são preservados nos campos do CartaoEvento.

export const EVENTOS: CartaoEvento[] = [
  // EV 01 · PEAR · Online · Seminário · NTC Educação
  {
    ordem: 1,
    area: "edu",
    programa: "PEAR",
    formato: "seminario",
    modalidade: "online",
    cidade: "",
    mes: "2026-05",
    cargaHorariaHoras: 16,
    valorReais: 1490,
    dataIso: "2026-05-22",
    deadlineIso: "2026-05-13",
    tab: "abertas",
    flags: ["destaque_editorial", "prioridade_comercial"],
    keywords: "alfabetizacao recomposicao aprendizagem currículo formacao docente",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "22", diaFim: "23", mesAno: "Mai · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    areaLabel: "NTC Educação",
    tituloHtml: "Alfabetização de Alta Performance: estratégias para recomposição da aprendizagem",
    coordenacaoNomes:
      "NTC Educação · Especialistas em alfabetização, currículo e formação docente · com convidados",
    metaEssenciais: ["16h · 2 dias", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PEAR", href: "/programas/pear", cmsLink: "programa-PEAR" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PEAR-2026-mai",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PEAR-2026-mai",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEAR",
      track: "cta_proposta_grupo",
    },
  },

  // EV 02 · EDUTEC · Híbrido · Oficina · NTC Educação
  {
    ordem: 2,
    area: "edu",
    programa: "EDUTEC",
    formato: "oficina",
    modalidade: "hibrido",
    cidade: "sp",
    mes: "2026-06",
    cargaHorariaHoras: 12,
    valorReais: 980,
    dataIso: "2026-06-12",
    deadlineIso: "2026-06-05",
    tab: "abertas",
    flags: [],
    keywords: "ia generativa tecnologia educacional pedagogia",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/educacao-inclusiva.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 3, rotulo: "encontros", periodo: "Jun · 2026" },
    modalidadeLabel: "Híbrido · SP",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Oficina",
    areaLabel: "NTC Educação",
    tituloHtml: "EDUTEC · IA generativa aplicada à gestão pedagógica e à formação docente",
    coordenacaoNomes:
      "NTC Educação · Especialistas em tecnologias educacionais e formação · com convidados",
    metaEssenciais: ["12h · 3 encontros", "São Paulo · SP"],
    precoIndividualLabel: "R$ 980",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "EDUTEC", href: "/programas/edutec", cmsLink: "programa-EDUTEC" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-EDUTEC-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-EDUTEC-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-EDUTEC",
      track: "cta_proposta_grupo",
    },
  },

  // EV 03 · PROGE · Presencial · Curso Executivo · NTC Educação (últimas vagas)
  {
    ordem: 3,
    area: "edu",
    programa: "PROGE",
    formato: "curso",
    modalidade: "presencial",
    cidade: "brasilia",
    mes: "2026-06",
    cargaHorariaHoras: 24,
    valorReais: 3290,
    dataIso: "2026-06-05",
    deadlineIso: "2026-05-15",
    tab: "abertas",
    flags: ["ultimas_vagas"],
    keywords: "gestao escolar coordenacao pedagogica resultados",
    status: "abertas",
    selo: { texto: "Últimas vagas", classe: "status-last" },
    imagemUrl: "/img/fotos/_optimized/area-educacao.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "05", diaFim: "07", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · Brasília",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Curso Executivo",
    areaLabel: "NTC Educação",
    tituloHtml: "PROGE · Gestão escolar, coordenação pedagógica e resultados de aprendizagem",
    coordenacaoNomes:
      "NTC Educação · Especialistas em gestão escolar, currículo e avaliação · com convidados",
    metaEssenciais: ["24h · 3 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 3.290",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROGE", href: "/programas/proge", cmsLink: "programa-PROGE" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PROGE-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PROGE-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-PROGE",
      track: "cta_proposta_grupo",
    },
  },

  // EV 04 · VIVAESCOLA · Online · Jornada · NTC Educação
  {
    ordem: 4,
    area: "edu",
    programa: "VIVAESCOLA",
    formato: "jornada",
    modalidade: "online",
    cidade: "",
    mes: "2026-06",
    cargaHorariaHoras: 32,
    valorReais: 2490,
    dataIso: "2026-06-18",
    deadlineIso: "2026-06-10",
    tab: "abertas",
    flags: [],
    keywords: "convivencia escolar bem-estar protecao integral",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/conteudo-01.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 4, rotulo: "encontros", periodo: "Jun – Jul · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Jornada",
    areaLabel: "NTC Educação",
    tituloHtml: "VIVAESCOLA · Convivência, permanência, bem-estar e proteção integral",
    coordenacaoNomes:
      "NTC Educação · Especialistas em convivência escolar, bem-estar e proteção · com convidados",
    metaEssenciais: ["32h · 4 encontros", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 2.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: {
      sigla: "VIVAESCOLA",
      href: "/programas/vivaescola",
      cmsLink: "programa-VIVAESCOLA",
    },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-VIVAESCOLA-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-VIVAESCOLA-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-VIVAESCOLA",
      track: "cta_proposta_grupo",
    },
  },

  // EV 05 · PEI · Presencial · Simpósio · NTC Educação
  {
    ordem: 5,
    area: "edu",
    programa: "PEI",
    formato: "simposio",
    modalidade: "presencial",
    cidade: "salvador",
    mes: "2026-06",
    cargaHorariaHoras: 12,
    valorReais: 1690,
    dataIso: "2026-06-26",
    deadlineIso: "2026-06-19",
    tab: "abertas",
    flags: [],
    keywords: "educacao integral curriculo gestao redes",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/conteudo-02.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "26", diaFim: "27", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · Salvador",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Simpósio",
    areaLabel: "NTC Educação",
    tituloHtml: "PEI · Educação Integral — gestão, currículo e resultados em escala",
    coordenacaoNomes:
      "NTC Educação · Especialistas em educação integral, currículo e gestão de redes · com convidados",
    metaEssenciais: ["12h · 2 tardes", "Salvador · BA"],
    precoIndividualLabel: "R$ 1.690",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PEI", href: "/programas/pei", cmsLink: "programa-PEI" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PEI-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PEI-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEI",
      track: "cta_proposta_grupo",
    },
  },

  // EV 06 · PINEI · Híbrido · Congresso · NTC Educação
  {
    ordem: 6,
    area: "edu",
    programa: "PINEI",
    formato: "congresso",
    modalidade: "hibrido",
    cidade: "brasilia",
    mes: "2026-07",
    cargaHorariaHoras: 40,
    valorReais: 3890,
    dataIso: "2026-07-12",
    deadlineIso: "2026-07-04",
    tab: "abertas",
    flags: [],
    keywords: "primeira infancia educacao infantil 0-6 politicas",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "12", diaFim: "16", mesAno: "Jul · 2026" },
    modalidadeLabel: "Híbrido · Brasília",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Congresso",
    areaLabel: "NTC Educação",
    tituloHtml: "PINEI · I Congresso Nacional da Primeira Infância e Educação Infantil",
    coordenacaoNomes:
      "NTC Educação · Especialistas em primeira infância, educação infantil e políticas para zero a seis anos · com convidados",
    metaEssenciais: ["40h · 5 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 3.890",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PINEI", href: "/programas/pinei", cmsLink: "programa-PINEI" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PINEI-2026-jul",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PINEI-2026-jul",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-PINEI",
      track: "cta_proposta_grupo",
    },
  },

  // EV 07 · AGIP · Presencial · Seminário · NTC Gestão Pública · destaque
  {
    ordem: 7,
    area: "gov",
    programa: "AGIP",
    formato: "seminario",
    modalidade: "presencial",
    cidade: "sp",
    mes: "2026-06",
    cargaHorariaHoras: 20,
    valorReais: 2890,
    dataIso: "2026-06-18",
    deadlineIso: "2026-06-10",
    tab: "abertas",
    flags: ["destaque_editorial", "prioridade_comercial"],
    keywords: "contratacoes publicas integridade governanca lei 14133",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-gestao-publica-premium.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "18", diaFim: "20", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · SP",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Seminário",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "AGIP · Integridade e performance nas contratações públicas — fundamentos avançados",
    coordenacaoNomes:
      "NTC Gestão Pública · Especialistas em contratações, integridade e governança · com convidados",
    metaEssenciais: ["20h · 3 dias", "São Paulo · SP"],
    precoIndividualLabel: "R$ 2.890",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "AGIP", href: "/programas/agip", cmsLink: "programa-AGIP" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-AGIP-SP-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-AGIP-SP-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-AGIP",
      track: "cta_proposta_grupo",
    },
  },

  // EV 08 · LIDERA · Online · Oficina · NTC Gestão Pública (inscrições encerrando)
  {
    ordem: 8,
    area: "gov",
    programa: "LIDERA",
    formato: "oficina",
    modalidade: "online",
    cidade: "",
    mes: "2026-05",
    cargaHorariaHoras: 8,
    valorReais: 690,
    dataIso: "2026-05-29",
    deadlineIso: "2026-05-18",
    tab: "abertas",
    flags: ["inscricoes_encerrando"],
    keywords: "lideranca direcao estrategica decisao crises",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/expert-02.1920.webp",
    dataBloco: { tipo: "single", dia: "29", mesAno: "Mai · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Oficina",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "LIDERA · Tomada de decisão executiva sob pressão e gestão de crises",
    coordenacaoNomes:
      "NTC Gestão Pública · Especialistas em liderança, direção estratégica e crises · com convidados",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 690",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "LIDERA", href: "/programas/lidera", cmsLink: "programa-LIDERA" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-LIDERA-2026-mai",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-LIDERA-2026-mai",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-LIDERA",
      track: "cta_proposta_grupo",
    },
  },

  // EV 09 · AGIP Avançado · Híbrido · Curso Executivo · NTC Gestão Pública (página de evento real)
  {
    ordem: 9,
    area: "gov",
    programa: "AGIP",
    formato: "curso",
    modalidade: "hibrido",
    cidade: "sp",
    mes: "2026-06",
    cargaHorariaHoras: 24,
    valorReais: 3490,
    dataIso: "2026-06-18",
    deadlineIso: "2026-06-10",
    tab: "abertas",
    flags: [],
    keywords: "agip avancado governanca contratacoes lei 14133",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/contratacao.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 4, rotulo: "encontros", periodo: "Jun – Jul · 2026" },
    modalidadeLabel: "Híbrido · SP",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Curso Executivo",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "AGIP Avançado · Governança e performance no novo regime de contratações públicas",
    coordenacaoNomes:
      "NTC Gestão Pública · Especialistas em Lei 14.133, governança e controle · com convidados",
    metaEssenciais: ["24h · 4 encontros", "São Paulo · SP"],
    precoIndividualLabel: "R$ 3.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "AGIP", href: "/programas/agip", cmsLink: "programa-AGIP" },
    ctaInscrever: {
      texto: "Inscrever-se",
      // TODO: protótipo aponta para ./05_Pagina_Evento_AGIP_SP_Hibrido_v1.html (página individual de evento ainda não portada)
      href: "#agenda-eventos",
      cmsLink: "inscricao-AGIP-AV-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      // TODO: protótipo aponta para ./05_Pagina_Evento_AGIP_SP_Hibrido_v1.html
      href: "#agenda-eventos",
      cmsLink: "detalhes-AGIP-AV-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-AGIP",
      track: "cta_proposta_grupo",
    },
  },

  // EV 10 · SIGA · Presencial · Jornada · NTC Gestão Pública
  {
    ordem: 10,
    area: "gov",
    programa: "SIGA",
    formato: "jornada",
    modalidade: "presencial",
    cidade: "recife",
    mes: "2026-07",
    cargaHorariaHoras: 32,
    valorReais: 3990,
    dataIso: "2026-07-02",
    deadlineIso: "2026-06-24",
    tab: "abertas",
    flags: [],
    keywords: "solucoes inteligentes governanca administracao transformacao ia",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/solucoes-lab.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 4, rotulo: "encontros", periodo: "Jul – Ago · 2026" },
    modalidadeLabel: "Presencial · Recife",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Jornada",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "SIGA · Soluções inteligentes de governança e administração — jornada executiva",
    coordenacaoNomes:
      "NTC Gestão Pública · Especialistas em governança, transformação e IA aplicada · com convidados",
    metaEssenciais: ["32h · 4 encontros", "Recife · PE"],
    precoIndividualLabel: "R$ 3.990",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "SIGA", href: "/programas/siga", cmsLink: "programa-SIGA" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-SIGA-2026-jul",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-SIGA-2026-jul",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-SIGA",
      track: "cta_proposta_grupo",
    },
  },

  // EV 11 · LIDERA · Online · Simpósio · NTC Gestão Pública
  {
    ordem: 11,
    area: "gov",
    programa: "LIDERA",
    formato: "simposio",
    modalidade: "online",
    cidade: "",
    mes: "2026-06",
    cargaHorariaHoras: 12,
    valorReais: 990,
    dataIso: "2026-06-11",
    deadlineIso: "2026-06-04",
    tab: "abertas",
    flags: [],
    keywords: "direcao estrategica gestao executiva publica",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/expert-01.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "11", diaFim: "12", mesAno: "Jun · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Simpósio",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "LIDERA · I Simpósio Nacional de Direção Estratégica do Estado",
    coordenacaoNomes:
      "NTC Gestão Pública · Especialistas em direção estratégica e gestão executiva pública · com convidados",
    metaEssenciais: ["12h · 2 dias", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 990",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "LIDERA", href: "/programas/lidera", cmsLink: "programa-LIDERA" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-LIDERA-SIMP-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-LIDERA-SIMP-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-LIDERA",
      track: "cta_proposta_grupo",
    },
  },

  // EV 12 · AGIP · Presencial · Congresso · NTC Gestão Pública · próxima turma
  {
    ordem: 12,
    area: "gov",
    programa: "AGIP",
    formato: "congresso",
    modalidade: "presencial",
    cidade: "brasilia",
    mes: "2026-09",
    cargaHorariaHoras: 40,
    valorReais: 4490,
    dataIso: "2026-09-22",
    deadlineIso: "2026-09-14",
    tab: "proximas",
    flags: [],
    keywords: "agip congresso nacional lei 14133 controle governanca",
    status: "proximas",
    selo: { texto: "Próxima turma", classe: "status-soon" },
    imagemUrl: "/img/fotos/_optimized/area-gestao-publica.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "22", diaFim: "26", mesAno: "Set · 2026" },
    modalidadeLabel: "Presencial · Brasília",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Congresso",
    areaLabel: "NTC Gestão Pública",
    tituloHtml: "AGIP · III Congresso Nacional de Contratações, Integridade e Governança Pública",
    coordenacaoNomes:
      "NTC Gestão Pública · Ministros, juristas e autoridades em Lei 14.133, controle e governança · com convidados",
    metaEssenciais: ["40h · 5 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 4.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "AGIP", href: "/programas/agip", cmsLink: "programa-AGIP" },
    ctaInscrever: {
      texto: "Reserve sua vaga",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-AGIP-CONG-2026-set",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-AGIP-CONG-2026-set",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-AGIP",
      track: "cta_proposta_grupo",
    },
  },

  // EV 13 · PROAPS+ · Híbrido · Seminário · NTC Saúde
  {
    ordem: 13,
    area: "sau",
    programa: "PROAPS",
    formato: "seminario",
    modalidade: "hibrido",
    cidade: "fortaleza",
    mes: "2026-06",
    cargaHorariaHoras: 20,
    valorReais: 2490,
    dataIso: "2026-06-04",
    deadlineIso: "2026-05-28",
    tab: "abertas",
    flags: [],
    keywords: "aps atencao primaria redes cuidado saude",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-saude-premium2.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 3, rotulo: "encontros", periodo: "Jun · 2026" },
    modalidadeLabel: "Híbrido · Fortaleza",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Seminário",
    areaLabel: "NTC Saúde",
    tituloHtml: "PROAPS+ · Alta performance na Atenção Primária e nas redes de cuidado",
    coordenacaoNomes:
      "NTC Saúde · Especialistas em APS, atenção primária e governança em saúde · com convidados",
    metaEssenciais: ["20h · 3 encontros", "Fortaleza · CE"],
    precoIndividualLabel: "R$ 2.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROAPS+", href: "/programas/proaps", cmsLink: "programa-PROAPS" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PROAPS-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PROAPS-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PROAPS",
      track: "cta_proposta_grupo",
    },
  },

  // EV 14 · SIGS · Online · Oficina · NTC Saúde
  {
    ordem: 14,
    area: "sau",
    programa: "SIGS",
    formato: "oficina",
    modalidade: "online",
    cidade: "",
    mes: "2026-06",
    cargaHorariaHoras: 8,
    valorReais: 690,
    dataIso: "2026-06-05",
    deadlineIso: "2026-05-29",
    tab: "abertas",
    flags: [],
    keywords: "saude digital ia transformacao sus",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/conteudo-03.1920.webp",
    dataBloco: { tipo: "single", dia: "05", mesAno: "Jun · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Oficina",
    areaLabel: "NTC Saúde",
    tituloHtml: "SIGS · IA aplicada à gestão da saúde pública e à transformação digital do SUS",
    coordenacaoNomes:
      "NTC Saúde · Especialistas em saúde digital, IA aplicada e governança · com convidados",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 690",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "SIGS", href: "/programas/sigs", cmsLink: "programa-SIGS" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-SIGS-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-SIGS-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-SIGS",
      track: "cta_proposta_grupo",
    },
  },

  // EV 15 · PROSUS+ · Presencial · Curso Executivo · NTC Saúde · FEATURED (is-featured + badge)
  {
    ordem: 15,
    area: "sau",
    programa: "PROSUS",
    formato: "curso",
    modalidade: "presencial",
    cidade: "brasilia",
    mes: "2026-06",
    cargaHorariaHoras: 24,
    valorReais: 2890,
    dataIso: "2026-06-05",
    deadlineIso: "2026-05-15",
    tab: "abertas",
    flags: ["destaque_editorial", "prioridade_comercial", "evento_em_destaque", "ultimas_vagas"],
    keywords: "sus financiamento governanca performance saude",
    status: "abertas",
    eventoEmDestaque: true,
    badgeDestaqueTexto: "Evento em destaque",
    selo: { texto: "Últimas vagas", classe: "status-last" },
    imagemUrl: "/img/fotos/_optimized/area-saude.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "05", diaFim: "07", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · Brasília",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Curso Executivo",
    areaLabel: "NTC Saúde",
    tituloHtml: "PROSUS+ · Governança, financiamento e performance no SUS — Edição Brasília 2026",
    coordenacaoNomes:
      "NTC Saúde · Especialistas em gestão do SUS, governança e financiamento · com convidados",
    metaEssenciais: ["24h · 3 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 2.890",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROSUS+", href: "/programas/prosus", cmsLink: "programa-PROSUS" },
    ctaInscrever: {
      texto: "Inscrever-se",
      // TODO: protótipo aponta para ./03_Pagina_Evento_PROSUS_Brasilia_v3.html (página individual de evento ainda não portada)
      href: "#agenda-eventos",
      cmsLink: "inscricao-PROSUS-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      // TODO: protótipo aponta para ./03_Pagina_Evento_PROSUS_Brasilia_v3.html
      href: "#agenda-eventos",
      cmsLink: "detalhes-PROSUS-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-PROSUS",
      track: "cta_proposta_grupo",
    },
  },

  // EV 16 · SIGS · Híbrido · Jornada · NTC Saúde
  {
    ordem: 16,
    area: "sau",
    programa: "SIGS",
    formato: "jornada",
    modalidade: "hibrido",
    cidade: "sp",
    mes: "2026-07",
    cargaHorariaHoras: 32,
    valorReais: 3890,
    dataIso: "2026-07-09",
    deadlineIso: "2026-07-02",
    tab: "abertas",
    flags: [],
    keywords: "saude digital ia dados interoperabilidade sus",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/detalhe-still-01.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 4, rotulo: "encontros", periodo: "Jul – Ago · 2026" },
    modalidadeLabel: "Híbrido · SP",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Jornada",
    areaLabel: "NTC Saúde",
    tituloHtml: "SIGS · Jornada Executiva em Saúde Digital, IA e Transformação do SUS",
    coordenacaoNomes:
      "NTC Saúde · Especialistas em saúde digital, IA, dados e interoperabilidade · com convidados",
    metaEssenciais: ["32h · 4 encontros", "São Paulo · SP"],
    precoIndividualLabel: "R$ 3.890",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "SIGS", href: "/programas/sigs", cmsLink: "programa-SIGS" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-SIGS-JOR-2026-jul",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-SIGS-JOR-2026-jul",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-SIGS",
      track: "cta_proposta_grupo",
    },
  },

  // EV 17 · PROAPS+ · Online · Simpósio · NTC Saúde
  {
    ordem: 17,
    area: "sau",
    programa: "PROAPS",
    formato: "simposio",
    modalidade: "online",
    cidade: "",
    mes: "2026-07",
    cargaHorariaHoras: 12,
    valorReais: 990,
    dataIso: "2026-07-02",
    deadlineIso: "2026-06-25",
    tab: "abertas",
    flags: [],
    keywords: "aps atencao primaria redes cuidado simposio",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/expert-03.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "02", diaFim: "03", mesAno: "Jul · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Simpósio",
    areaLabel: "NTC Saúde",
    tituloHtml: "PROAPS+ · II Simpósio Nacional de Atenção Primária e Redes de Cuidado",
    coordenacaoNomes:
      "NTC Saúde · Especialistas em APS, redes de atenção e gestão do cuidado · com convidados",
    metaEssenciais: ["12h · 2 dias", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 990",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROAPS+", href: "/programas/proaps", cmsLink: "programa-PROAPS" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PROAPS-SIMP-2026-jul",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PROAPS-SIMP-2026-jul",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PROAPS",
      track: "cta_proposta_grupo",
    },
  },

  // EV 18 · PROSUS+ · Presencial · Congresso · NTC Saúde · próxima turma
  {
    ordem: 18,
    area: "sau",
    programa: "PROSUS",
    formato: "congresso",
    modalidade: "presencial",
    cidade: "sp",
    mes: "2026-08",
    cargaHorariaHoras: 40,
    valorReais: 4490,
    dataIso: "2026-08-18",
    deadlineIso: "2026-08-11",
    tab: "proximas",
    flags: [],
    keywords: "prosus congresso sus financiamento governanca",
    status: "proximas",
    selo: { texto: "Próxima turma", classe: "status-soon" },
    imagemUrl: "/img/fotos/_optimized/eventon-estudio.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "18", diaFim: "22", mesAno: "Ago · 2026" },
    modalidadeLabel: "Presencial · SP",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Congresso",
    areaLabel: "NTC Saúde",
    tituloHtml: "PROSUS+ · II Congresso Nacional de Governança, Financiamento e Performance no SUS",
    coordenacaoNomes:
      "NTC Saúde · Lideranças do SUS, especialistas em financiamento e governança em saúde · com convidados",
    metaEssenciais: ["40h · 5 dias", "São Paulo · SP"],
    precoIndividualLabel: "R$ 4.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROSUS+", href: "/programas/prosus", cmsLink: "programa-PROSUS" },
    ctaInscrever: {
      texto: "Reserve sua vaga",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PROSUS-CONG-2026-ago",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PROSUS-CONG-2026-ago",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-PROSUS",
      track: "cta_proposta_grupo",
    },
  },
];
