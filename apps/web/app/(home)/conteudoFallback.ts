/**
 * Conteúdo de fallback da Home v3 Premium — textos literais
 * aprovados do 02_Prototipo_Home_GrupoNTC_v3_Premium.html.
 *
 * Esses textos são usados quando o Global `home` do Payload ainda
 * não foi preenchido pela equipe editorial. Servem também como
 * referência canônica para um eventual seed (ainda não rodado —
 * `db.push: false` no payload.config.ts pausa migrações enquanto os
 * schemas Home + OGrupo estabilizam).
 *
 * Toda mudança nesses textos deve passar pela equipe editorial e
 * pela atualização do protótipo HTML correspondente. Não editar
 * livremente (CLAUDE.md §5.3).
 */

// Fotos locais otimizadas (webp 1920) — os originais do bucket Supabase têm
// 2-3 MB cada; as variantes em public/img/fotos/_optimized são ~25x menores.
const SUPABASE_URL = "/img/fotos/_optimized";

// =============================================================
// Tipos
// =============================================================

export type TipoSlide = "institucional" | "evento" | "programa" | "solucao" | "eventon";
export type VerticalSlide = "edu" | "gov" | "sau";
export type VarianteCtaSlide = "gold" | "ghost-light" | "textlink";

export interface SlideFallback {
  tipo: TipoSlide;
  vertical?: VerticalSlide;
  imagemSrc: string;
  eyebrow: string;
  /** Aceita `<accent>palavra</accent>` para destaque dourado italic. */
  titulo: string;
  subtitulo: string;
  eventoPill?: { texto: string };
  ctas: { rotulo: string; href: string; variante: VarianteCtaSlide }[];
  textlink?: { rotulo: string; href: string };
  rotuloA11y?: string;
}

export interface EventoCard {
  area: VerticalSlide;
  destaque?: boolean;
  statusTag: { rotulo: string; tipo: "open" | "last" };
  imagemSrc: string;
  data: {
    variante: "single" | "range" | "multi";
    dia?: string;
    diasInicio?: string;
    diasFim?: string;
    monYr?: string;
    encontros?: string;
    periodo?: string;
  };
  modalidade: { texto: string; classe?: "presencial" | "hibrido" };
  programLink: string;
  titulo: string;
  coordenacao: { label: string; nomes: string };
  meta: { ch: string; local: string };
  programaBinding: { sigla: string; href: string };
  precoIndividual: string;
  precoInstitucional: string;
  ctas: {
    principal: { rotulo: string; href: string };
    detalhes: { rotulo: string; href: string };
    grupo: { rotulo: string; href: string };
  };
}

export interface EventoCardSecundario {
  area: VerticalSlide;
  imagemSrc: string;
  data: {
    variante: "single" | "range" | "multi";
    dia?: string;
    diasInicio?: string;
    diasFim?: string;
    monYr?: string;
    encontros?: string;
    periodo?: string;
  };
  programa: string;
  titulo: string;
  bindingSigla: string;
  metaCompleto: string;
  preco: string;
  ctaRotulo: string;
  ctaHref: string;
}

export interface AreaCard {
  vert: VerticalSlide;
  num: string;
  imagemSrc: string;
  verticalTag: string;
  tituloLinha1: string;
  tituloLinha2: string;
  tagline: string;
  programasCount: string;
  linkProgramas: { rotulo: string; href: string };
  linkEventos: { rotulo: string; href: string };
}

export interface ProgramaEvidencia {
  area: VerticalSlide;
  sigla: string;
  areaLabel: string;
  nome: string;
  valor: string;
  modulosCount: string;
  cargaHoraria: string;
  flagModuloAberto: boolean;
  tituloLong: string;
  corLink: "padrao" | "crimson" | "olive";
  ctaConhecer: { rotulo: string; href: string };
  ctaSecundario: { rotulo: string; href: string };
}

export interface Vitrine {
  vertical: VerticalSlide;
  eyebrow: string;
  labelDestaque: string; // pode conter <em>
  nome: string;
  credenciais: string[];
  cta: string;
  href: string;
}

export interface ModeCard {
  imagemSrc: string;
  eyebrow: string;
  titulo: string;
  lista: string[];
  ctaRotulo: string;
  ctaHref: string;
}

export interface OperacaoEventOn {
  num: string;
  titulo: string;
  descricao: string;
  linkRotulo: string;
  link: string;
}

export interface Diferencial {
  num: string;
  titulo: string;
  descricao: string;
}

export interface NumeroBand {
  valor: string;
  label: string;
}

// =============================================================
// Conteúdo
// =============================================================

export const FALLBACK_HOME = {
  slider: {
    intervaloMs: 7000,
    slides: [
      {
        tipo: "institucional",
        imagemSrc: `${SUPABASE_URL}/hero-principal.1920.webp`,
        eyebrow: "Grupo NTC · Núcleo de Tecnologia e Conhecimento",
        titulo:
          "O novo padrão da formação <accent>institucional</accent> para a Administração Pública brasileira.",
        subtitulo:
          "Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
        ctas: [
          { rotulo: "Ver eventos com inscrições abertas", href: "#eventos-abertos", variante: "gold" as const },
          { rotulo: "Solicitar proposta institucional", href: "/contato?assunto=proposta", variante: "ghost-light" as const },
        ],
        textlink: { rotulo: "Conhecer programas estratégicos", href: "#programas" },
      },
      // OCULTADO 10/06/2026 — slide do evento PROSUS/SUS removido do hero a pedido do usuário.
      // Mantido comentado para reativação futura.
      // {
      //   tipo: "evento",
      //   vertical: "sau",
      //   imagemSrc: `${SUPABASE_URL}/area-saude.1920.webp`,
      //   eyebrow: "Evento em destaque · Inscrições abertas",
      //   eventoPill: { texto: "05–07 Jun · Brasília · Presencial" },
      //   titulo:
      //     "Governança, financiamento e <accent>performance</accent> no SUS — Brasília 2026.",
      //   subtitulo:
      //     "Curso executivo presencial em Brasília · 05 a 07 de junho · 24 horas · com a coordenação científica do NTC Saúde e convidados especialistas em gestão do SUS, governança e financiamento.",
      //   ctas: [
      //     { rotulo: "Inscrever-se", href: "#eventos-abertos", variante: "gold" as const },
      //     { rotulo: "Ver detalhes do evento", href: "#eventos-abertos", variante: "ghost-light" as const },
      //   ],
      // },
      // OCULTADO 10/06/2026 — slide do evento AGIP/contratações removido do hero a pedido do usuário.
      // Mantido comentado para reativação futura.
      // {
      //   tipo: "evento",
      //   vertical: "gov",
      //   imagemSrc: `${SUPABASE_URL}/area-gestao-publica.1920.webp`,
      //   eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
      //   eventoPill: { texto: "18–20 Jun · São Paulo · Híbrido" },
      //   titulo: "Integridade e performance nas <accent>contratações públicas</accent>.",
      //   subtitulo:
      //     "Seminário presencial em São Paulo · 18 a 20 de junho · 20 horas · ministros, juristas e autoridades em Lei 14.133/2021 compõem o painel do programa.",
      //   ctas: [
      //     { rotulo: "Conhecer evento", href: "#programas", variante: "gold" as const },
      //     { rotulo: "Inscrever-se", href: "#eventos-abertos", variante: "ghost-light" as const },
      //   ],
      // },
      {
        tipo: "programa",
        vertical: "edu",
        imagemSrc: `${SUPABASE_URL}/area-educacao.1920.webp`,
        eyebrow: "NTC Educação · PEAR · Programa Estratégico",
        titulo: "Alfabetização de <accent>Alta Performance</accent> para redes públicas.",
        subtitulo:
          "Recomposição da aprendizagem, currículo e formação docente em escala. Programa estruturado para secretarias de educação, redes municipais e estaduais que buscam resultados sustentáveis.",
        ctas: [
          { rotulo: "Conhecer programa", href: "#programas", variante: "gold" as const },
          { rotulo: "Ver módulos abertos", href: "/agenda", variante: "ghost-light" as const },
        ],
      },
      {
        tipo: "solucao",
        imagemSrc: `${SUPABASE_URL}/contratacao.1920.webp`,
        eyebrow: "Soluções institucionais · In company · Turmas fechadas",
        titulo: "Capacitações <accent>sob medida</accent> para a sua instituição.",
        subtitulo:
          "Programas, jornadas e trilhas do portfólio NTC entregues exclusivamente à sua equipe, rede ou órgão público — com desenho, especialistas, formato e calendário alinhados aos objetivos da contratante.",
        ctas: [
          { rotulo: "Solicitar proposta", href: "/contato?assunto=proposta", variante: "gold" as const },
          { rotulo: "Agendar apresentação", href: "#contato", variante: "ghost-light" as const },
        ],
      },
      {
        tipo: "eventon",
        imagemSrc: `${SUPABASE_URL}/eventon-estudio.1920.webp`,
        eyebrow: "EventOn · Plataforma própria · Infraestrutura digital",
        titulo:
          "Transmissão ao vivo, replay, certificado e <accent>suporte</accent> em uma única plataforma.",
        subtitulo:
          "A infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira.",
        ctas: [
          { rotulo: "Acessar EventOn", href: "#eventon", variante: "gold" as const },
          { rotulo: "Suporte ao participante", href: "#contato", variante: "ghost-light" as const },
        ],
      },
    ] satisfies SlideFallback[],
  },

  statusBar: {
    livePill: "Inscrições abertas agora",
    atualizadoEm: "Atualizado · Maio · 2026",
  },

  eventosSecao: {
    eyebrow: "Capacitação e Desenvolvimento",
    titulo: "Eventos com inscrições abertas",
    intro:
      "Seminários, oficinas, jornadas, simpósios e cursos executivos do Grupo NTC, disponíveis para participação individual, inscrição de equipes e contratação institucional.",
  },

  eventosPrincipais: [
    {
      area: "sau",
      destaque: true,
      statusTag: { rotulo: "Últimas vagas", tipo: "last" },
      imagemSrc: `${SUPABASE_URL}/area-saude.1920.webp`,
      data: { variante: "range", diasInicio: "05", diasFim: "07", monYr: "Jun · 2026" },
      modalidade: { texto: "Presencial · Brasília", classe: "presencial" },
      programLink: "Seminário · NTC Saúde",
      titulo: "Governança, financiamento e performance no SUS — Edição 2026",
      coordenacao: {
        label: "Coordenação científica",
        nomes:
          "NTC Saúde · Especialistas em gestão do SUS, governança e financiamento · com convidados",
      },
      meta: { ch: "20h · 3 dias", local: "Brasília · DF" },
      programaBinding: { sigla: "PROSUS+", href: "#programas" },
      precoIndividual: "R$ 2.890",
      precoInstitucional: "Sob consulta",
      ctas: {
        principal: { rotulo: "Inscrever-se", href: "#contato" },
        detalhes: { rotulo: "Ver detalhes", href: "#programas" },
        grupo: { rotulo: "Proposta para grupo", href: "#contratacao" },
      },
    },
    {
      area: "edu",
      statusTag: { rotulo: "Inscrições abertas", tipo: "open" },
      imagemSrc: `${SUPABASE_URL}/area-educacao.1920.webp`,
      data: { variante: "range", diasInicio: "22", diasFim: "23", monYr: "Mai · 2026" },
      modalidade: { texto: "Online ao vivo + replay" },
      programLink: "Seminário · NTC Educação",
      titulo:
        "Alfabetização de Alta Performance: estratégias para recomposição da aprendizagem",
      coordenacao: {
        label: "Coordenação científica",
        nomes:
          "NTC Educação · Especialistas em alfabetização, currículo e formação docente · com convidados",
      },
      meta: { ch: "16h · 2 dias", local: "Plataforma EventOn" },
      programaBinding: { sigla: "PEAR", href: "#programas" },
      precoIndividual: "R$ 1.490",
      precoInstitucional: "Sob consulta",
      ctas: {
        principal: { rotulo: "Inscrever-se", href: "#contato" },
        detalhes: { rotulo: "Ver detalhes", href: "#programas" },
        grupo: { rotulo: "Inscrever equipe", href: "#contratacao" },
      },
    },
    {
      area: "gov",
      statusTag: { rotulo: "Inscrições abertas", tipo: "open" },
      imagemSrc: `${SUPABASE_URL}/area-gestao-publica.1920.webp`,
      data: { variante: "multi", encontros: "4 encontros", periodo: "Jun – Jul · 2026" },
      modalidade: { texto: "Híbrido · SP", classe: "hibrido" },
      programLink: "Oficina · NTC Gestão Pública",
      titulo:
        "Integridade e performance nas contratações públicas — fundamentos avançados",
      coordenacao: {
        label: "Coordenação científica",
        nomes:
          "NTC Gestão Pública · Especialistas em contratações, integridade e governança · com convidados",
      },
      meta: { ch: "24h · 4 encontros", local: "São Paulo · SP" },
      programaBinding: { sigla: "AGIP", href: "#programas" },
      precoIndividual: "R$ 1.890",
      precoInstitucional: "Sob consulta",
      ctas: {
        principal: { rotulo: "Inscrever-se", href: "#contato" },
        detalhes: { rotulo: "Ver detalhes", href: "#programas" },
        grupo: { rotulo: "Inscrever equipe", href: "#contratacao" },
      },
    },
  ] satisfies EventoCard[],

  eventosSecundariosCabecalho: {
    eyebrow: "Também em destaque",
    titulo: "Outros eventos abertos no período",
    ctaRotulo: "Ver agenda completa",
    ctaHref: "/agenda",
  },

  eventosSecundarios: [
    {
      area: "gov",
      imagemSrc: `${SUPABASE_URL}/area-gestao-publica.1920.webp`,
      data: { variante: "range", diasInicio: "28", diasFim: "29", monYr: "Mai · 2026" },
      programa: "Curso Executivo · NTC Gestão Pública",
      titulo: "Liderança e direção estratégica para secretários e diretores",
      bindingSigla: "LIDERA",
      metaCompleto: "Online · 12h · 2 tardes <strong>R$ 1.290</strong>",
      preco: "R$ 1.290",
      ctaRotulo: "Inscrever-se",
      ctaHref: "#contato",
    },
    {
      area: "edu",
      imagemSrc: `${SUPABASE_URL}/area-educacao.1920.webp`,
      data: { variante: "multi", encontros: "3 encontros", periodo: "Jun · 2026" },
      programa: "Jornada · NTC Educação",
      titulo: "Tecnologias e IA aplicadas à gestão escolar pública",
      bindingSigla: "EDUTEC",
      metaCompleto: "Híbrido · SP · 18h · 3 encontros <strong>R$ 1.690</strong>",
      preco: "R$ 1.690",
      ctaRotulo: "Inscrever-se",
      ctaHref: "#contato",
    },
    {
      area: "sau",
      imagemSrc: `${SUPABASE_URL}/area-saude.1920.webp`,
      data: { variante: "range", diasInicio: "02", diasFim: "03", monYr: "Jul · 2026" },
      programa: "Simpósio · NTC Saúde",
      titulo: "Alta performance na atenção primária e redes de cuidado",
      bindingSigla: "PROAPS+",
      metaCompleto: "Online · 16h · 2 dias <strong>R$ 1.490</strong>",
      preco: "R$ 1.490",
      ctaRotulo: "Inscrever-se",
      ctaHref: "#contato",
    },
  ] satisfies EventoCardSecundario[],

  eventosFooter: {
    ctaPrincipal: { rotulo: "Ver agenda completa", href: "/agenda" },
    ctaSecundario: { rotulo: "Solicitar proposta para minha instituição", href: "/contato?assunto=proposta" },
  },

  agendaBand: {
    titulo: "Agenda Geral NTC",
    descricao:
      "Consulte todos os eventos, módulos, turmas e capacitações disponíveis no calendário do Grupo NTC.",
    chips: [
      "Educação",
      "Gestão Pública",
      "Saúde",
      "Online",
      "Presencial",
      "Híbrido",
      "Inscrições abertas",
      "Próximas turmas",
    ],
    cta: { rotulo: "Ver agenda completa", href: "/agenda" },
  },

  introCurta: {
    headline:
      "O Grupo NTC estrutura programas, eventos, trilhas e soluções institucionais para desenvolver capacidades públicas com rigor, escala e aplicabilidade.",
    corpoHtml:
      'Atuamos em três verticais — <strong>NTC Educação</strong>, <strong>NTC Gestão Pública</strong> e <strong>NTC Saúde</strong> — com 15 programas estruturados, corpo docente especializado e capacidade nacional de entrega para a Administração Pública brasileira.',
    highlights: [
      { num: "15", numEhTexto: false, lbl: "Programas estratégicos\nnas três verticais" },
      { num: "3 áreas", numEhTexto: true, lbl: "Educação · Gestão Pública\n· Saúde" },
      { num: "Eventos e turmas", numEhTexto: true, lbl: "Abertos · Fechados\n· Sob medida" },
    ],
    link: { rotulo: "Conheça o Grupo NTC", href: "#sobre" },
  },

  programasSecao: {
    eyebrow: "Portfólio estruturante",
    titulo: "Programas estratégicos que estruturam a atuação do Grupo NTC",
    intro:
      "Cada programa é uma solução estruturada — com identidade, módulos e coordenação científica próprias — distribuída em três verticais que organizam todo o portfólio.",
    introLinha: "Camada institucional · três áreas estratégicas",
    evidenciaTitulo: "Programas em evidência",
    evidenciaSub: "Seleção comercial · Atualizado para Maio · 2026",
    verTodosLink: { rotulo: "Ver todos os 15 programas", href: "#programas" },
  },

  areas: [
    {
      vert: "edu",
      num: "01",
      imagemSrc: `${SUPABASE_URL}/area-educacao.1920.webp`,
      verticalTag: "NTC Educação",
      tituloLinha1: "Educação",
      tituloLinha2: "com excelência.",
      tagline:
        "Soluções estruturadas para redes públicas de ensino — gestão escolar, alfabetização, educação inclusiva, tecnologia, currículo e primeira infância.",
      programasCount: "9",
      linkProgramas: { rotulo: "Ver programas da área", href: "/solucoes-estrategicas/educacao" },
      linkEventos: { rotulo: "Ver módulos e eventos abertos", href: "#eventos-abertos" },
    },
    {
      vert: "gov",
      num: "02",
      imagemSrc: `${SUPABASE_URL}/area-gestao-publica.1920.webp`,
      verticalTag: "NTC Gestão Pública",
      tituloLinha1: "Governança",
      tituloLinha2: "com transformação.",
      tagline:
        "Capacitação executiva e técnica para a Administração Pública — liderança, contratações, governança, integridade e performance institucional.",
      programasCount: "3",
      linkProgramas: { rotulo: "Ver programas da área", href: "/solucoes-estrategicas/gestao-publica" },
      linkEventos: { rotulo: "Ver módulos e eventos abertos", href: "#eventos-abertos" },
    },
    {
      vert: "sau",
      num: "03",
      imagemSrc: `${SUPABASE_URL}/area-saude.1920.webp`,
      verticalTag: "NTC Saúde",
      tituloLinha1: "Saúde",
      tituloLinha2: "com qualidade.",
      tagline:
        "Inteligência institucional aplicada ao SUS — atenção primária, governança digital, financiamento e transformação dos sistemas públicos de saúde.",
      programasCount: "3",
      linkProgramas: { rotulo: "Ver programas da área", href: "/solucoes-estrategicas/saude" },
      linkEventos: { rotulo: "Ver módulos e eventos abertos", href: "#eventos-abertos" },
    },
  ] satisfies AreaCard[],

  programasEvidencia: [
    {
      area: "edu",
      sigla: "PEAR",
      areaLabel: "NTC Educação",
      nome: "Alfabetização e Recomposição",
      valor: "Recompor a aprendizagem com método e velocidade nas redes públicas de ensino.",
      modulosCount: "8 módulos",
      cargaHoraria: "64h",
      flagModuloAberto: true,
      tituloLong:
        "PEAR — Programa Estratégico de Alfabetização de Alta Performance e Recomposição da Aprendizagem",
      corLink: "padrao",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/pear" },
      ctaSecundario: { rotulo: "Ver módulo aberto", href: "/agenda" },
    },
    {
      area: "gov",
      sigla: "AGIP",
      areaLabel: "NTC Gestão Pública",
      nome: "Contratações Públicas",
      valor: "Elevar integridade e performance das contratações como vantagem institucional.",
      modulosCount: "8 módulos",
      cargaHoraria: "64h",
      flagModuloAberto: true,
      tituloLong:
        "AGIP — Programa Avançado de Governança, Integridade e Performance nas Contratações Públicas",
      corLink: "crimson",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/agip" },
      ctaSecundario: { rotulo: "Ver módulo aberto", href: "/agenda" },
    },
    {
      area: "sau",
      sigla: "PROSUS+",
      areaLabel: "NTC Saúde",
      nome: "Governança no SUS",
      valor: "Governança, financiamento e performance estratégica do Sistema Único de Saúde.",
      modulosCount: "6 módulos",
      cargaHoraria: "48h",
      flagModuloAberto: true,
      tituloLong:
        "PROSUS+ — Programa Estratégico de Governança, Financiamento e Performance no SUS",
      corLink: "olive",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/prosus" },
      ctaSecundario: { rotulo: "Ver módulo aberto", href: "/agenda" },
    },
    {
      area: "edu",
      sigla: "EDUTEC",
      areaLabel: "NTC Educação",
      nome: "Educação Digital",
      valor: "Tecnologias e inovação aplicadas à gestão das redes públicas de ensino.",
      modulosCount: "10 módulos",
      cargaHoraria: "80h",
      flagModuloAberto: true,
      tituloLong:
        "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
      corLink: "padrao",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/edutec" },
      ctaSecundario: { rotulo: "Ver módulo aberto", href: "/agenda" },
    },
    {
      area: "edu",
      sigla: "PROGE",
      areaLabel: "NTC Educação",
      nome: "Gestão Escolar",
      valor: "Gestão escolar e coordenação pedagógica orientadas a resultados mensuráveis.",
      modulosCount: "10 módulos",
      cargaHoraria: "80h",
      flagModuloAberto: false,
      tituloLong:
        "PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Resultados",
      corLink: "padrao",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/proge" },
      ctaSecundario: { rotulo: "Solicitar proposta", href: "/contato" },
    },
    {
      area: "gov",
      sigla: "LIDERA",
      areaLabel: "NTC Gestão Pública",
      nome: "Liderança e Direção",
      valor: "Direção estratégica e formação executiva para a Administração Pública.",
      modulosCount: "8 módulos",
      cargaHoraria: "64h",
      flagModuloAberto: false,
      tituloLong: "LIDERA — Liderança, Direção Estratégica e Resultados na Administração",
      corLink: "crimson",
      ctaConhecer: { rotulo: "Conhecer programa", href: "/programas/lidera" },
      ctaSecundario: { rotulo: "Solicitar proposta", href: "/contato" },
    },
  ] satisfies ProgramaEvidencia[],

  programasFooter: {
    ctaPrincipal: { rotulo: "Ver todos os 15 programas", href: "#programas" },
    ctaSecundario: { rotulo: "Solicitar proposta institucional", href: "/contato?assunto=proposta" },
  },

  curadoria: {
    eyebrow: "Curadoria científica · Corpo docente",
    headlineBold: "Ministros e ex-ministros do STF e do TCU.",
    subhead: "Juristas, gestores públicos, pesquisadores e autoridades técnicas.",
    contexto:
      "A curadoria científica do Grupo NTC reúne profissionais de referência nacional nas áreas de Educação, Gestão Pública, Contratações Públicas e Saúde. A composição docente é estruturada conforme o programa, o evento, a demanda institucional e os objetivos de cada contratante.",
    ctaLink: { rotulo: "Corpo docente completo →", href: "/o-grupo/corpo-docente" },
    vitrines: [
      {
        vertical: "gov",
        eyebrow: "Curadoria por vertical",
        labelDestaque: "Curadoria técnica <em>nacional</em>",
        nome: "NTC Gestão Pública e Contratações",
        credenciais: [
          "Juristas e doutrinadores em Direito Administrativo",
          "Auditores do TCU e especialistas em Lei 14.133/2021",
          "Procuradores federais e gestores públicos",
          "Referências em governança, integridade e performance",
        ],
        cta: "Conhecer curadoria",
        href: "/o-grupo/corpo-docente",
      },
      {
        vertical: "edu",
        eyebrow: "Curadoria por vertical",
        labelDestaque: "Curadoria educacional <em>nacional</em>",
        nome: "NTC Educação",
        credenciais: [
          "Pesquisadores e gestores educacionais de referência",
          "Especialistas em alfabetização, currículo e avaliação",
          "Autoridades em primeira infância e educação inclusiva",
          "Lideranças em transformação digital de redes públicas",
        ],
        cta: "Conhecer curadoria",
        href: "/o-grupo/corpo-docente",
      },
      {
        vertical: "sau",
        eyebrow: "Curadoria por vertical",
        labelDestaque: "Curadoria SUS e <em>saúde pública</em>",
        nome: "NTC Saúde",
        credenciais: [
          "Gestores do SUS e ex-secretários estaduais",
          "Sanitaristas e pesquisadores de referência nacional",
          "Especialistas em atenção primária e redes de cuidado",
          "Autoridades em saúde digital, financiamento e dados",
        ],
        cta: "Conhecer curadoria",
        href: "/o-grupo/corpo-docente",
      },
    ] satisfies Vitrine[],
    rodape: {
      texto:
        "A curadoria científica do Grupo NTC é construída programa a programa, evento a evento, conforme a demanda institucional do cliente.",
      cta: "Conhecer corpo docente completo",
      href: "/o-grupo/corpo-docente",
    },
  },

  solucoes: {
    eyebrow: "Visão arquitetural",
    titulo:
      "Soluções estratégicas para o desenvolvimento institucional do setor público",
    corpo:
      "O Grupo NTC organiza sua atuação em uma arquitetura ampla de soluções, que vai além da oferta de eventos abertos — combinando programas, trilhas, jornadas, turmas fechadas e formatos institucionais customizados.",
    lista: [
      "Programas estratégicos",
      "Trilhas formativas",
      "Jornadas executivas",
      "Eventos abertos",
      "Turmas fechadas",
      "Soluções in company",
      "Projetos institucionais",
      "Soluções sob medida",
    ],
    imagemSrc: `${SUPABASE_URL}/solucoes-lab.1920.webp`,
    imagemAlt: "Ambiente institucional do setor público",
    ctas: [
      { rotulo: "Conhecer soluções estratégicas", href: "#solucoes", variante: "primary" as const },
      { rotulo: "Solicitar proposta", href: "/contato?assunto=proposta", variante: "secondary" as const },
    ],
  },

  modalidades: {
    eyebrow: "Modalidades de participação",
    titulo: "Eventos online e eventos presenciais",
    intro:
      "O Grupo NTC opera com forte presença em capitais estratégicas e simultaneamente sustenta uma plataforma digital própria de transmissão e replay.",
    cards: [
      {
        imagemSrc: `${SUPABASE_URL}/eventon-estudio.1920.webp`,
        eyebrow: "Modalidade",
        titulo: "Eventos online",
        lista: [
          "Transmissão ao vivo",
          "Interação com docentes",
          "Replay protegido",
          "Certificado",
          "Acesso EventOn",
        ],
        ctaRotulo: "Ver eventos online",
        ctaHref: "#eventos-abertos",
      },
      {
        imagemSrc: `${SUPABASE_URL}/plenario-publico.1920.webp`,
        eyebrow: "Modalidade",
        titulo: "Eventos presenciais",
        lista: [
          "Experiência imersiva",
          "Networking executivo",
          "Capitais estratégicas",
          "Certificação",
          "Atendimento institucional",
        ],
        ctaRotulo: "Ver eventos presenciais",
        ctaHref: "#eventos-abertos",
      },
    ] satisfies ModeCard[],
  },

  eventOn: {
    eyebrow: "EventOn · Plataforma do Grupo NTC",
    titulo: "EventOn: acesso, replay e certificado em um só ambiente",
    descricao:
      "O EventOn é a infraestrutura digital dos eventos online do Grupo NTC, reunindo acesso ao vivo, replay protegido, materiais de apoio, suporte ao participante e emissão de certificados.",
    ctas: [
      { rotulo: "Acessar EventOn", href: "#eventon", variante: "gold" as const },
      { rotulo: "Suporte ao participante", href: "#eventon", variante: "ghost-light" as const },
    ],
    operacoes: [
      {
        num: "01",
        titulo: "Acessar evento ao vivo",
        descricao: "Sala de transmissão protegida com login e interação com docentes.",
        linkRotulo: "Acessar agora",
        link: "#eventon",
      },
      {
        num: "02",
        titulo: "Assistir replay",
        descricao: "Conteúdo gravado disponível em prazo determinado para inscritos.",
        linkRotulo: "Ver replays",
        link: "#eventon",
      },
      {
        num: "03",
        titulo: "Emitir certificado",
        descricao: "Certificado validável por código QR após cumprimento dos requisitos.",
        linkRotulo: "Emitir certificado",
        link: "#eventon",
      },
      {
        num: "04",
        titulo: "Falar com suporte",
        descricao: "Atendimento dedicado para participantes durante e após o evento.",
        linkRotulo: "Abrir chamado",
        link: "#eventon",
      },
    ] satisfies OperacaoEventOn[],
  },

  contratacao: {
    eyebrow: "Contratação institucional",
    tituloHtml:
      "Precisa formar uma equipe, rede ou <em>instituição inteira</em>?",
    descricao:
      "Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas completos, módulos específicos, trilhas formativas e soluções sob medida para secretarias, autarquias, fundações, escolas de governo, redes públicas e órgãos governamentais.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "/contato?assunto=proposta", variante: "gold" as const },
      { rotulo: "Inscrever minha equipe", href: "#contato", variante: "ghost-light" as const },
      { rotulo: "Agendar apresentação", href: "#contato", variante: "ghost-light" as const },
    ],
    asideTitulo: "Modelos disponíveis",
    modelos: [
      "Programa completo entregue exclusivamente à instituição contratante",
      "Módulos específicos em formato in company",
      "Turma fechada presencial, online ou híbrida",
      "Trilhas e jornadas curadas para necessidades específicas",
      "Soluções sob medida com customização de ementas e cargas",
      "Atendimento dedicado para órgãos públicos em todo o país",
    ],
  },

  diferenciais: {
    eyebrow: "Diferenciais institucionais",
    titulo: "O que sustenta a entrega do Grupo NTC.",
    cards: [
      {
        num: "01",
        titulo: "Trajetória consolidada",
        descricao:
          "Cerca de duas décadas dedicadas à formação institucional para a Administração Pública brasileira.",
      },
      {
        num: "02",
        titulo: "Excelência docente",
        descricao:
          "Corpo docente formado por especialistas reconhecidos com atuação na gestão pública nacional.",
      },
      {
        num: "03",
        titulo: "Arquitetura programática",
        descricao:
          "Programas estruturados em módulos e trilhas, com ementas, coordenação científica e linha editorial próprias.",
      },
      {
        num: "04",
        titulo: "Aderência ao setor público",
        descricao:
          "Cada programa é desenhado a partir de desafios concretos da Administração Pública, com aplicabilidade direta.",
      },
      {
        num: "05",
        titulo: "Flexibilidade de contratação",
        descricao:
          "Eventos abertos, módulos avulsos, turmas fechadas, trilhas customizadas e soluções in company.",
      },
      {
        num: "06",
        titulo: "Execução nacional",
        descricao:
          "Capacidade operacional para atendimento simultâneo a múltiplos órgãos em diferentes regiões do país.",
      },
      {
        num: "07",
        titulo: "Eventos online e presenciais",
        descricao:
          "Plataforma EventOn própria para transmissão ao vivo e replay; estrutura ativa em capitais estratégicas.",
      },
      {
        num: "08",
        titulo: "Certificação e suporte",
        descricao:
          "Emissão de certificados validáveis e atendimento dedicado ao participante e às instituições contratantes.",
      },
    ] satisfies Diferencial[],
  },

  numeros: {
    band: [
      { valor: "Duas décadas", label: "De atuação institucional" },
      { valor: "Milhares", label: "Participantes capacitados" },
      { valor: "Múltiplas regiões", label: "Eventos realizados" },
      { valor: "Diferentes esferas", label: "Órgãos públicos atendidos" },
      { valor: "Nacional", label: "Presença operacional" },
    ] satisfies NumeroBand[],
    disclaimer:
      "Indicadores institucionais — números exatos sujeitos à validação interna do Grupo NTC.",
  },

  prova: {
    eyebrow: "Atuação institucional",
    headline:
      "Atuação junto a órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais em diferentes regiões do país.",
    categorias: [
      "Secretarias estaduais",
      "Prefeituras",
      "Autarquias",
      "Escolas de governo",
      "Redes públicas de ensino",
      "Instituições parceiras",
    ],
    nota: "Logos institucionais serão inseridos após autorização formal de cada órgão.",
  },

  ctaFinal: {
    eyebrow: "Próximos passos",
    tituloHtml: "Encontre a formação certa para sua <em>instituição</em> ou equipe.",
    subtitulo:
      "Participe dos eventos abertos, inscreva sua equipe ou solicite uma proposta institucional para programas, módulos e soluções sob medida.",
    ctas: [
      { rotulo: "Ver eventos com inscrições abertas", href: "#eventos-abertos", variante: "gold" as const },
      { rotulo: "Solicitar proposta institucional", href: "/contato?assunto=proposta", variante: "ghost-light" as const },
      { rotulo: "Falar com a equipe", href: "#contato", variante: "ghost-light" as const },
    ],
    tagline: "— Inteligência institucional. Impacto real. —",
  },
};
