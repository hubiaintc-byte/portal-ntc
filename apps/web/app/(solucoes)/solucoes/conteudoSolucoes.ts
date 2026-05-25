// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /SOLUCOES
//  Porta de 26_Pagina_Solucoes_v1.html (linhas 1298-2060 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs -----------------

export type ModalidadeSlug = "in-company" | "turmas-fechadas" | "sob-medida" | "trilhas";

export type VerticalSlug = "educacao" | "gestao-publica" | "contratacoes" | "saude";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  title?: string;
  classe?: string;
  arrow?: boolean;
}

// ----------------- HERO -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export const HERO_SOLUCOES = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Soluções institucionais", current: true },
  ] as CrumbItem[],
  eyebrow: "Modelos de contratação · Edição 2026",
  tituloHtml:
    'Soluções institucionais <span class="accent">do Grupo NTC</span>.<br>Formação dedicada a órgãos, redes e instituições públicas brasileiras.',
  subHtml:
    'Programas in company, turmas fechadas, soluções sob medida e trilhas formativas curadas — entregues pelo <strong style="color: var(--pergaminho);">Instituto NTC do Brasil</strong> com segurança jurídica, aderência à Lei 14.133/2021 e atendimento institucional dedicado.',
  quicklinks: [
    { texto: "In company", href: "#in-company", track: "hero_quicklink_incompany" },
    { texto: "Turmas fechadas", href: "#turmas-fechadas", track: "hero_quicklink_turmas" },
    { texto: "Sob medida", href: "#sob-medida", track: "hero_quicklink_sobmedida" },
    { texto: "Trilhas e jornadas", href: "#trilhas", track: "hero_quicklink_trilhas" },
    { texto: "Contratação institucional", href: "#contratacao-institucional", track: "hero_quicklink_contratacao" },
    { texto: "Como funciona", href: "#processo", track: "hero_quicklink_processo" },
  ] as LinkInterno[],
};

// ----------------- MÉTRICAS -----------------

export interface Metrica {
  num: string;
  lbl: string;
  detail: string;
}

export const METRICAS: Metrica[] = [
  {
    num: "20+",
    lbl: "Anos de atuação nacional",
    detail:
      "Trajetória ininterrupta de formação institucional de quadros públicos brasileiros — Instituto NTC do Brasil.",
  },
  {
    num: "500+",
    lbl: "Eventos e programas realizados",
    detail:
      "300+ encontros presenciais e 200+ online — seminários, jornadas, oficinas, cursos executivos, congressos e formações in company.",
  },
  {
    num: "400 mil+",
    lbl: "Agentes públicos capacitados",
    detail:
      "Servidores federais, estaduais e municipais formados nas três áreas estratégicas do Grupo NTC.",
  },
  {
    num: "4",
    lbl: "Modalidades canon + contratação institucional",
    detail:
      "In company · turmas fechadas · sob medida · trilhas curadas · contratação institucional dedicada com Lei 14.133/2021.",
  },
];

// ----------------- MANIFESTO -----------------

export const MANIFESTO = {
  marker: "Abordagem consultiva",
  tituloHtml: "Cada contratação é uma <em>arquitetura formativa institucional</em>.",
  ledeHtml:
    "O Grupo NTC não vende cursos prontos a órgãos públicos. Cada contratação é tratada como uma arquitetura formativa específica, calibrada para o perfil da instituição, os objetivos da gestão e o estágio de maturidade da rede contratante.",
  paragrafosHtml: [
    "Trabalhamos em <strong>quatro modalidades canon</strong> — in company, turmas fechadas, soluções sob medida e trilhas curadas — combinadas com <strong>atendimento institucional dedicado</strong> que apoia a formalização da contratação direta, por inexigibilidade ou dispensa de licitação, bem como de convênios, parcerias ou instrumentos de cooperação quando aplicáveis.",
    "A equipe comercial NTC atua como parceiro institucional do órgão contratante — desde o briefing inicial até a entrega do programa, com curadoria docente dimensionada por demanda, suporte logístico, ambiente da Plataforma EventOn e cuidado integral em cada etapa.",
  ],
};

// ----------------- PILARES (3) -----------------

export interface Pilar {
  num: string;
  titulo: string;
  descricao: string;
  marker: string;
}

export const PILARES_HEAD = {
  eyebrow: "Abordagem institucional NTC",
  tituloHtml: "Três pilares <em>de leitura institucional</em>.",
  descricao:
    "Cada solução nasce de uma leitura institucional precisa: demanda, público, maturidade da gestão, objetivos estratégicos e forma jurídica adequada ao caso.",
};

export const PILARES: Pilar[] = [
  {
    num: "01",
    titulo: "Diagnóstico institucional",
    descricao:
      "Leitura precisa da demanda da instituição — público-alvo, maturidade da gestão, contexto político-administrativo, prazo institucional e objetivo estratégico da contratação.",
    marker: "Briefing · diagnóstico aplicado",
  },
  {
    num: "02",
    titulo: "Curadoria técnica",
    descricao:
      "Composição da arquitetura formativa pela curadoria científica do Grupo NTC — programa-mãe, módulos, equipe docente e materiais selecionados especificamente para a contratação.",
    marker: "Curadoria científica institucional",
  },
  {
    num: "03",
    titulo: "Execução dedicada",
    descricao:
      "Entrega operacional com Plataforma EventOn, suporte logístico, acompanhamento institucional próximo e relatório executivo de encerramento da contratação.",
    marker: "Plataforma EventOn · suporte dedicado",
  },
];
