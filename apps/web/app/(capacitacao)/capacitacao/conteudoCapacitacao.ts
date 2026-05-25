// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /CAPACITACAO
//  Porta de 27_Pagina_Capacitacao_v1.html (linhas 1619-2403 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs / Discriminantes -----------------

export type VerticalCapacitacao = "edu" | "gov" | "sau";
export type TipoVsBlock = "cap" | "sol";
export type CaminhoTipo = "participante" | "instituicao";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  classe?: string;
  arrow?: boolean;
}

// ----------------- Interfaces das seções -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export interface MetricaCap {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}

export interface SubnavLink {
  texto: string;
  href: string;
  cmsLink: string;
}

export interface PilarCap {
  num: string;
  titulo: string;
  descricao: string;
  rule: string;
}

// ----------------- HERO -----------------

export const heroCrumbs: CrumbItem[] = [
  { texto: "Grupo NTC", href: "/" },
  { texto: "Capacitação institucional", current: true },
];

export const heroEyebrow = "Ecossistema formativo · 2026";

export const heroH1 = `Capacitação institucional <span class="accent">de alto nível</span><br>para a administração pública brasileira.`;

export const heroSub =
  "O Grupo NTC estrutura programas, eventos e jornadas formativas para órgãos públicos, redes de ensino, sistemas de saúde e equipes de gestão — combinando curadoria científica, excelência docente, tecnologia própria e segurança institucional em cada entrega.";

export const heroQuicklinks: LinkInterno[] = [
  { texto: "Verticais", href: "#verticais", track: "hero_quicklink", cmsLink: "quicklink-verticais" },
  { texto: "Modalidades", href: "#modalidades", track: "hero_quicklink", cmsLink: "quicklink-modalidades" },
  { texto: "Formatos", href: "#formatos", track: "hero_quicklink", cmsLink: "quicklink-formatos" },
  { texto: "Curadoria", href: "#curadoria", track: "hero_quicklink", cmsLink: "quicklink-curadoria" },
  { texto: "Agenda", href: "#proximos", track: "hero_quicklink", cmsLink: "quicklink-agenda" },
];

// ----------------- MÉTRICAS (5) -----------------

export const metricasCapacitacao: MetricaCap[] = [
  {
    num: "20+",
    lbl: "Anos de história",
    detail: "Capacitação contínua de quadros da administração pública",
  },
  {
    num: "15",
    lbl: "Programas estratégicos",
    detail: "9 Educação · 3 Gestão Pública · 3 Saúde",
  },
  {
    num: "500+",
    lbl: "Eventos realizados",
    detail: "300+ presenciais · 200+ online · híbridos",
  },
  {
    num: "400 mil+",
    lbl: "Agentes formados",
    detail: "Servidores, dirigentes e equipes técnicas atendidos",
  },
  {
    num: "Alta",
    numClasseExtra: "cm-num--word",
    lbl: "Satisfação",
    detail: "Avaliações consistentes em eventos presenciais, online e híbridos",
  },
];

// ----------------- SUBNAV -----------------

export const subnavLabel = "Nesta página";

export const subnavLinks: SubnavLink[] = [
  { texto: "Verticais", href: "#verticais", cmsLink: "subnav-verticais" },
  { texto: "Modalidades", href: "#modalidades", cmsLink: "subnav-modalidades" },
  { texto: "Formatos", href: "#formatos", cmsLink: "subnav-formatos" },
  { texto: "Curadoria", href: "#curadoria", cmsLink: "subnav-curadoria" },
  { texto: "EventOn", href: "#eventon", cmsLink: "subnav-eventon" },
  { texto: "Agenda", href: "#proximos", cmsLink: "subnav-agenda" },
];

// ----------------- MANIFESTO -----------------

export const manifestoEyebrow = "Como pensamos a capacitação institucional";
export const manifestoH2 = `Não é treinamento. É <em>formação de Estado</em>.`;
export const manifestoLede =
  "Para a NTC, capacitar servidores não é apenas transmitir conteúdo. É fortalecer a capacidade do Estado de planejar, decidir, contratar, executar, avaliar e entregar políticas públicas com consistência técnica.";
export const manifestoP =
  "Por isso a NTC não opera treinamentos avulsos. Estruturamos <strong>programas estratégicos</strong> — linhas formativas longas, conectadas à doutrina, ao direito vigente e aos desafios concretos das redes, dos órgãos e dos territórios — entregues em modalidades, formatos e eixos articulados pela mesma curadoria científica.";
export const manifestoMarker = "Ecossistema formativo NTC · 2026";

// ----------------- PILARES (3) -----------------

export const pilaresEyebrow = "Como entregamos";
export const pilaresH2 = `Conteúdo, curadoria <em>e entrega institucional</em>.`;
export const pilaresIntro =
  "A formação NTC combina programas estratégicos, especialistas reconhecidos e operação orientada à realidade dos órgãos públicos brasileiros.";

export const pilaresCapacitacao: PilarCap[] = [
  {
    num: "I",
    titulo: "Programas estratégicos",
    descricao:
      "Linhas formativas longas, articuladas à doutrina, ao direito vigente e aos desafios reais das redes, dos órgãos e dos territórios.",
    rule: "15 programas · 3 verticais",
  },
  {
    num: "II",
    titulo: "Curadoria científica",
    descricao:
      "Rede curada de especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional.",
    rule: "Critério editorial · não catálogo",
  },
  {
    num: "III",
    titulo: "Entrega institucional",
    descricao:
      "Operação executiva orientada ao servidor público — turmas dedicadas, EventOn, materiais editoriais, certificação e relatórios ao contratante.",
    rule: "Plataforma própria · segurança institucional",
  },
];

// ----------------- VERTICAIS (3) -----------------

export interface VerticalItemPrograma {
  textoHtml: string;
  href: string;
  cmsLink: string;
}

export interface CardVerticalCap {
  vert: VerticalCapacitacao;
  bandMark: string;
  bandNum: string;
  titulo: string;
  descricao: string;
  contagem: string;
  programas: VerticalItemPrograma[];
  link: LinkInterno;
}

export const verticaisEyebrow = "As três verticais formativas";
export const verticaisH2 = `Cada vertical, um <em>recorte editorial próprio</em> da administração pública.`;
export const verticaisIntro =
  "A oferta formativa do Grupo NTC se organiza em três verticais especializadas. Cada uma reúne programas estratégicos articulados por uma curadoria científica dedicada — e cada uma fala diretamente com o seu público de carreira pública.";

export const cardsVerticaisCapacitacao: CardVerticalCap[] = [
  {
    vert: "edu",
    bandMark: "NTC Educação",
    bandNum: "01",
    titulo: "Educação pública de alta performance",
    descricao:
      "Formação institucional de redes municipais e estaduais de ensino. Da alfabetização à educação integral, da gestão escolar à inclusão e à educação digital.",
    contagem: "9 programas estratégicos",
    programas: [
      { textoHtml: "<strong>PEAR</strong><span>Alfabetização</span>", href: "/programas/pear", cmsLink: "programa-PEAR" },
      { textoHtml: "<strong>EDUTEC</strong><span>Educação digital</span>", href: "/programas/edutec", cmsLink: "programa-EDUTEC" },
      { textoHtml: "<strong>PROGE</strong><span>Gestão escolar</span>", href: "/programas/proge", cmsLink: "programa-PROGE" },
      { textoHtml: "<strong>PROGIR</strong><span>Inclusão e equidade</span>", href: "/programas/progir", cmsLink: "programa-PROGIR" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
  {
    vert: "gov",
    bandMark: "NTC Gestão Pública",
    bandNum: "02",
    titulo: "Direção, governança e contratações",
    descricao:
      "Capacitação para a alta gestão da administração pública brasileira. Liderança, governança institucional, contratações e sistemas administrativos.",
    contagem: "3 programas estratégicos",
    programas: [
      { textoHtml: "<strong>LIDERA</strong><span>Direção estratégica</span>", href: "/programas/lidera", cmsLink: "programa-LIDERA" },
      { textoHtml: "<strong>AGIP</strong><span>Contratações Lei 14.133/2021</span>", href: "/programas/agip", cmsLink: "programa-AGIP" },
      { textoHtml: "<strong>SIGA</strong><span>Governança administrativa</span>", href: "/programas/siga", cmsLink: "programa-SIGA" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
  {
    vert: "sau",
    bandMark: "NTC Saúde",
    bandNum: "03",
    titulo: "Inteligência institucional para o SUS",
    descricao:
      "Formação dedicada à direção do Sistema Único de Saúde — atenção primária, redes de cuidado, gestão integrada e governança institucional do SUS.",
    contagem: "3 programas estratégicos",
    programas: [
      { textoHtml: "<strong>SIGS</strong><span>Gestão integrada SUS</span>", href: "/programas/sigs", cmsLink: "programa-SIGS" },
      { textoHtml: "<strong>PROAPS+</strong><span>Atenção Primária</span>", href: "/programas/proaps", cmsLink: "programa-PROAPS" },
      { textoHtml: "<strong>PROSUS+</strong><span>Direção institucional SUS</span>", href: "/programas/prosus", cmsLink: "programa-PROSUS" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
];

// ----------------- MODALIDADES (4) -----------------

export interface ModalidadeCap {
  num: string;
  titulo: string;
  descricao: string;
  lista: string[];
  contratacaoHtml: string;
  link: LinkInterno;
}

export const modalidadesEyebrow = "Modalidades estruturantes";
export const modalidadesH2 = `Quatro formas de <em>acessar a formação</em> NTC.`;
export const modalidadesIntro =
  "Cada programa estratégico pode ser entregue em quatro modalidades complementares. Você escolhe a que melhor se ajusta ao seu cenário institucional — e nós articulamos a curadoria, a docência, o formato e a logística.";

export const modalidadesCapacitacao: ModalidadeCap[] = [
  {
    num: "01",
    titulo: "Eventos abertos",
    descricao:
      "Turmas regulares organizadas pela NTC, com data, ementa e docentes definidos. Servidores e dirigentes se inscrevem individualmente ou em grupos institucionais. A modalidade ideal quando o órgão precisa formar quadros sem assumir a operação logística.",
    lista: [
      "Eventos online · presenciais · híbridos",
      "Inscrição individual ou em grupo institucional",
      "Certificado oficial NTC e EventOn",
      "Replay disponível para inscritos",
    ],
    contratacaoHtml: "<strong>Inscrição:</strong> direta no site · individual ou em grupo · com nota fiscal e empenho",
    link: {
      texto: "Ver agenda completa",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_modalidade_agenda",
      classe: "link-arrow",
    },
  },
  {
    num: "02",
    titulo: "Soluções in company",
    descricao:
      "Programa entregue exclusivamente à instituição contratante, com conteúdo, formato, calendário e docência customizados. A turma é formada apenas pelos servidores do órgão — o que permite tratar dados internos, casos e dilemas reais sem expô-los ao público externo.",
    lista: [
      "Programa-mãe customizado para o órgão",
      "Turma exclusiva · sem participantes externos",
      "Pode tratar casos internos com confidencialidade",
      "Cronograma negociado com a área demandante",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade ou dispensa, conforme a hipótese aplicável",
    link: {
      texto: "Conhecer in company",
      href: "/solucoes#in-company",
      cmsLink: "modelo-incompany",
      track: "cap_modalidade_incompany",
      classe: "link-arrow",
    },
  },
  {
    num: "03",
    titulo: "Turmas fechadas",
    descricao:
      "Edição operacional do programa-mãe, com a ementa NTC preservada, entregue a uma turma exclusiva da equipe contratante. Versão mais leve que a in company customizada — ideal quando o órgão quer formar muitos servidores no mesmo programa de catálogo.",
    lista: [
      "Ementa NTC preservada · sem customização profunda",
      "Turma dedicada · 20 a 300 servidores",
      "Pode ser online, presencial ou híbrida",
      "Logística simplificada · entrega mais rápida",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade do programa NTC",
    link: {
      texto: "Conhecer turmas fechadas",
      href: "/solucoes#turmas-fechadas",
      cmsLink: "modelo-fechada",
      track: "cap_modalidade_fechada",
      classe: "link-arrow",
    },
  },
  {
    num: "04",
    titulo: "Sob medida e trilhas curadas",
    descricao:
      "Customização profunda de ementas, módulos e formato — ou sequências formativas combinando módulos de diferentes programas NTC, articuladas pela curadoria científica em jornada coerente. A solução quando o desafio institucional não cabe em um programa standard.",
    lista: [
      "Customização profunda de conteúdo e cargas horárias",
      "Trilhas multinível · até 4 programas combinados",
      "Apoio da curadoria científica desde o briefing",
      "Ideal para carreiras públicas e formações plurianuais",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade ou dispensa, conforme o caso",
    link: {
      texto: "Conhecer sob medida e trilhas",
      href: "/solucoes#sob-medida",
      cmsLink: "modelo-sobmedida",
      track: "cap_modalidade_sobmedida",
      classe: "link-arrow",
    },
  },
];

// ----------------- VS BLOCKS (Capacitação × Soluções) -----------------

export interface VsBlock {
  tipo: TipoVsBlock;
  eyebrow: string;
  titulo: string;
  paragrafoHtml: string;
  link: LinkInterno;
}

export const vsBlocks: VsBlock[] = [
  {
    tipo: "cap",
    eyebrow: "Capacitação",
    titulo: "O ecossistema formativo",
    paragrafoHtml:
      "<strong>Capacitação</strong> é o ecossistema formativo da NTC: agenda, programas, formatos, curadoria e experiência pedagógica — toda a oferta aberta ao mercado público, organizada nesta página-mãe.",
    link: {
      texto: "Ver Agenda Geral",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_vs_agenda",
      classe: "link-arrow",
    },
  },
  {
    tipo: "sol",
    eyebrow: "Soluções",
    titulo: "O caminho institucional dedicado",
    paragrafoHtml:
      "<strong>Soluções</strong> é o caminho institucional para demandas exclusivas: in company, turmas fechadas, trilhas e programas sob medida — com curadoria e contratação dedicadas ao órgão demandante.",
    link: {
      texto: "Conhecer Soluções Institucionais",
      href: "/solucoes",
      cmsLink: "pagina-solucoes",
      track: "cap_vs_solucoes",
      classe: "link-arrow",
    },
  },
];

// ----------------- FORMATOS (3) -----------------

export interface FormatoCap {
  num: string;
  titulo: string;
  descricao: string;
  tag: string;
}

export const formatosEyebrow = "Formatos de entrega";
export const formatosH2 = `Online, <em>híbrido</em>, presencial — onde fizer sentido para o seu cenário.`;
export const formatosIntro =
  "A NTC opera os três formatos de entrega com a mesma exigência editorial e a mesma curadoria. Diferentes momentos institucionais pedem diferentes formatos — e fazemos a recomendação técnica como parte da proposta.";

export const formatosCapacitacao: FormatoCap[] = [
  {
    num: "01",
    titulo: "Online",
    descricao:
      "Transmissão executiva ao vivo pela plataforma EventOn, com chat moderado, materiais sincronizados, gravação e certificado. Ideal para alcance nacional, agendas concentradas e formações com grandes contingentes em rede.",
    tag: "Replay · certificado · materiais",
  },
  {
    num: "02",
    titulo: "Híbrido",
    descricao:
      "Combina núcleo presencial executivo com participação remota via EventOn. Recomendado quando há núcleo dirigente em uma capital e equipe distribuída nos territórios. Mantém a experiência presencial sem excluir a rede ampliada.",
    tag: "Núcleo presencial · rede remota",
  },
  {
    num: "03",
    titulo: "Presencial",
    descricao:
      "Encontros executivos em capitais estratégicas, com docência de especialistas de referência, materiais editoriais e momentos de articulação institucional entre participantes. Ideal para públicos de direção e tomada de decisão estratégica.",
    tag: "Capitais · networking · alta gestão",
  },
];
