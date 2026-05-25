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

// ----------------- EIXOS (5) -----------------

export interface EixoCap {
  num: string;
  titulo: string;
  descricao: string;
}

export const eixosEyebrow = "Eixos formativos transversais";
export const eixosH2 = `Cinco eixos que <em>atravessam</em> todos os programas.`;
export const eixosP1 =
  "Independentemente da vertical, todos os programas NTC mobilizam ao menos um destes cinco eixos. Eles dão consistência editorial à oferta e permitem que diferentes públicos da administração pública se reconheçam no que estão fazendo.";
export const eixosImpact =
  "Cada programa fala mais de um eixo — e cada servidor encontra, em pelo menos um deles, a sua leitura.";

export const eixosCapacitacao: EixoCap[] = [
  {
    num: "01",
    titulo: "Executivo e estratégico",
    descricao:
      "Direção institucional, tomada de decisão, governança da política pública, articulação federativa e leitura de cenário. Para a alta gestão.",
  },
  {
    num: "02",
    titulo: "Técnico-jurídico",
    descricao:
      "Lei 14.133/2021, controle, integridade, contratações públicas, direito administrativo aplicado. Para áreas-meio, jurídicas e de controle.",
  },
  {
    num: "03",
    titulo: "Pedagógico-formativo",
    descricao:
      "Alfabetização, currículo, avaliação, formação de professores, inclusão e gestão pedagógica. Para áreas-fim da educação pública.",
  },
  {
    num: "04",
    titulo: "Operacional e de gestão",
    descricao:
      "Processos, rotinas, indicadores, planejamento, monitoramento, prestação de contas. Para o quadro técnico que executa a política.",
  },
  {
    num: "05",
    titulo: "Dados, IA e governança digital",
    descricao:
      "Transformação digital, governança de dados, inteligência artificial aplicada ao setor público, cibersegurança e privacidade. Eixo emergente.",
  },
];

// ----------------- CURADORIA -----------------

export const curadoriaEyebrow = "Curadoria científica";
export const curadoriaH2 = `A diferença entre treinar e <em>formar</em> está em quem ensina.`;
export const curadoriaP1 =
  "A capacitação institucional do Grupo NTC é sustentada por uma rede curada de especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional — convocados pelo encaixe técnico ao programa, à modalidade e ao público da turma.";
export const curadoriaP2 =
  "A curadoria científica não é um catálogo: é um critério editorial. Por isso publicamos a página do Corpo Docente — para que cada órgão contratante saiba, antes de contratar, quem efetivamente entregará a formação.";
export const curadoriaPills: string[] = [
  "Educação",
  "Gestão Pública",
  "Contratações Públicas",
  "Saúde",
];
export const curadoriaCtas: LinkInterno[] = [
  {
    texto: "Conhecer o corpo docente",
    href: "/o-grupo/corpo-docente",
    cmsLink: "pagina-corpo-docente",
    track: "cap_corpo_docente_click",
    classe: "btn btn--primary",
    arrow: true,
  },
  {
    texto: "Falar com a curadoria",
    href: "/contato#tab-atendimento",
    cmsLink: "atendimento-curadoria",
    track: "cap_corpo_docente_atendimento",
    classe: "btn btn--secondary",
  },
];

// ----------------- EVENTON -----------------

export interface EventonFeature {
  strong: string;
  span: string;
}

export const eventonEyebrow = "Plataforma proprietária";
export const eventonH2 = `EventOn — a plataforma <em>editorial</em> de transmissão do Grupo NTC.`;
export const eventonP1 =
  "O EventOn é a plataforma proprietária do Grupo NTC — pensada não como mera sala de webinar, mas como <strong>ambiente de experiência formativa</strong>: transmissão executiva, replay institucional, materiais editoriais, certificação dos participantes e relatórios consolidados ao órgão contratante.";
export const eventonP2 =
  "O servidor inscrito acessa um único hub — a <strong>Área do Participante</strong> — em que encontra os eventos ao vivo, os replays, os materiais oficiais e os certificados. O órgão contratante recebe os indicadores de presença, conclusão e avaliação por turma.";
export const eventonCtas: LinkInterno[] = [
  {
    texto: "Conhecer o EventOn",
    href: "/#eventon",
    cmsLink: "eventon-home",
    track: "cap_eventon_click",
    classe: "btn btn--gold",
    arrow: true,
  },
  {
    texto: "Área do Participante",
    href: "/#eventon",
    cmsLink: "area-participante",
    track: "cap_area_participante",
    classe: "btn btn--ghost-light",
  },
];

export const eventonFeatures: EventonFeature[] = [
  {
    strong: "Transmissão executiva",
    span: "Estúdio NTC com regie, chat moderado, materiais sincronizados e qualidade broadcast.",
  },
  {
    strong: "Replay institucional",
    span: "Gravação editada e disponibilizada aos inscritos pela duração contratada.",
  },
  {
    strong: "Certificado oficial",
    span: "Emissão automática com identidade NTC, registro digital e validação institucional.",
  },
  {
    strong: "Relatório ao contratante",
    span: "Presença, conclusão, avaliação e indicadores consolidados ao órgão demandante.",
  },
];

// ----------------- PRÓXIMOS EVENTOS (6) -----------------

export interface EventoCap {
  vert: VerticalCapacitacao;
  eyebrow: string;
  prefixoHtml: string;
  titulo: string;
  data: string;
  formato: string;
  local: string;
  descricao: string;
  preco: string;
  cta: LinkInterno;
}

export interface FiltroProximos {
  value: "all" | VerticalCapacitacao;
  label: string;
}

export const proximosEyebrow = "Próximos eventos abertos";
export const proximosH2 = `Inscrições <em>em aberto</em> no calendário NTC.`;
export const proximosIntro =
  "Uma seleção dos próximos eventos abertos — turmas regulares organizadas pela NTC nas três verticais, em diferentes formatos. A agenda completa, com filtros por área, formato e período, está na página da Agenda.";
export const proximosSelo = "Eventos alimentados pela Agenda Geral NTC";

export const filtrosProximos: FiltroProximos[] = [
  { value: "all", label: "Todos" },
  { value: "edu", label: "Educação" },
  { value: "gov", label: "Gestão Pública" },
  { value: "sau", label: "Saúde" },
];

export const eventosCapacitacao: EventoCap[] = [
  {
    vert: "sau",
    eyebrow: "NTC Saúde · PROSUS+ · Brasília",
    prefixoHtml: `<span class="ev-prefix">Seminário executivo</span>`,
    titulo: "Direção institucional em saúde pública — alta gestão do SUS",
    data: "04–05 jun 2026",
    formato: "Presencial",
    local: "Brasília · DF",
    descricao:
      "Dois dias de imersão executiva sobre a alta gestão do Sistema Único de Saúde, articulando direito sanitário, financiamento e governança institucional.",
    preco: "R$ 4.890 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-PROSUS-bsb",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "edu",
    eyebrow: "NTC Educação · EDUTEC · Online",
    prefixoHtml: `<span class="ev-prefix">Módulo formativo</span>`,
    titulo: "IA generativa em sala de aula — fundamentos e aplicações",
    data: "11–13 jun 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Três encontros online sobre o uso pedagógico e ético da IA generativa por professores e coordenadores das redes públicas de ensino.",
    preco: "R$ 1.190 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-EDUTEC-m01",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "gov",
    eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
    prefixoHtml: `<span class="ev-prefix">Jornada executiva</span>`,
    titulo: "Lei 14.133/2021 — governança e integridade nas contratações",
    data: "18–20 jun 2026",
    formato: "Híbrido",
    local: "São Paulo · SP",
    descricao:
      "Jornada híbrida de três dias com núcleo presencial executivo em São Paulo e participação remota via EventOn pelas equipes técnicas das redes.",
    preco: "R$ 5.290 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-AGIP-sp",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "sau",
    eyebrow: "NTC Saúde · PROAPS+ · Online",
    prefixoHtml: `<span class="ev-prefix">Formação executiva</span>`,
    titulo: "Previne Brasil, redes territoriais e atenção primária resolutiva",
    data: "02–04 jul 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Três encontros sobre o desenho da APS contemporânea no SUS — financiamento Previne Brasil, redes territoriais e arquitetura institucional.",
    preco: "R$ 1.490 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-PROAPS",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "edu",
    eyebrow: "NTC Educação · PEAR · Brasília",
    prefixoHtml: `<span class="ev-prefix">Seminário nacional</span>`,
    titulo: "Alfabetização na idade certa — recomposição da aprendizagem",
    data: "16–17 jul 2026",
    formato: "Presencial",
    local: "Brasília · DF",
    descricao:
      "Encontro nacional dedicado à alfabetização baseada em evidências e à recomposição da aprendizagem nos anos iniciais do ensino fundamental.",
    preco: "R$ 3.890 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-PEAR",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "gov",
    eyebrow: "NTC Gestão Pública · LIDERA · Online",
    prefixoHtml: `<span class="ev-prefix">Programa executivo</span>`,
    titulo: "Direção estratégica e governança da política pública",
    data: "30 jul – 01 ago 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Programa executivo de três encontros para dirigentes públicos sobre governança institucional, leitura estratégica de cenário e articulação federativa.",
    preco: "R$ 1.690 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-LIDERA",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
];

export const proximosFooterLink: LinkInterno = {
  texto: "Ver agenda completa",
  href: "/capacitacao/agenda",
  cmsLink: "agenda-completa",
  track: "cap_agenda_completa",
  classe: "btn btn--primary",
  arrow: true,
};

// ----------------- CAMINHOS (2) -----------------

export interface PassoCaminho {
  title: string;
  sub: string;
}

export interface CaminhoCap {
  tipo: CaminhoTipo;
  eyebrow: string;
  titulo: string;
  descricao: string;
  passos: PassoCaminho[];
  cta: LinkInterno;
}

export const caminhosEyebrow = "Como participar";
export const caminhosH2 = `Dois caminhos paralelos, <em>uma só curadoria</em>.`;
export const caminhosIntro =
  "A capacitação NTC pode ser acessada de duas maneiras complementares: pelo caminho do participante individual ou do grupo institucional inscrito em evento aberto, e pelo caminho da contratação institucional dedicada. Em ambos, a curadoria editorial é a mesma.";

export const caminhosCapacitacao: CaminhoCap[] = [
  {
    tipo: "participante",
    eyebrow: "Caminho A · Servidor ou grupo",
    titulo: "Quero me inscrever em um evento aberto",
    descricao:
      "O caminho do servidor individual ou da equipe institucional que se inscreve em uma turma regular da agenda NTC. Use este caminho quando a sua necessidade já está bem atendida por um programa do nosso calendário aberto.",
    passos: [
      {
        title: "Encontre o evento",
        sub: "Navegue pela Agenda Geral · filtre por área, formato e período",
      },
      {
        title: "Escolha a modalidade de inscrição",
        sub: "Individual com cartão · ou em grupo institucional com nota fiscal e empenho",
      },
      {
        title: "Inscreva-se",
        sub: "Pelo formulário oficial · com autofill quando vier de uma página de evento",
      },
      {
        title: "Acesse o EventOn",
        sub: "Acompanhe a turma, baixe materiais, assista ao replay, receba certificado",
      },
    ],
    cta: {
      texto: "Ver agenda completa",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_caminho_a",
      classe: "btn btn--primary",
      arrow: true,
    },
  },
  {
    tipo: "instituicao",
    eyebrow: "Caminho B · Órgão público",
    titulo: "Quero contratar uma formação institucional",
    descricao:
      "O caminho do órgão público que precisa formar quadros institucionais com uma turma exclusiva, customização de conteúdo ou trilha plurianual. A contratação institucional dedicada ocorre por via direta — especialmente por inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável — ou por instrumentos de parceria e cooperação, quando cabíveis.",
    passos: [
      {
        title: "Solicite o briefing",
        sub: "Conte ao atendimento institucional o cenário, o público e o objetivo formativo",
      },
      {
        title: "Receba o diagnóstico técnico",
        sub: "Em até 10 dias úteis, devolvemos a leitura técnica e a recomendação editorial",
      },
      {
        title: "Aprove a proposta",
        sub: "Programa-mãe ou customizado · turma fechada ou sob medida · escopo, prazo, valor",
      },
      {
        title: "Execução com EventOn e relatórios",
        sub: "Entrega dedicada · curadoria científica · relatórios consolidados ao órgão",
      },
    ],
    cta: {
      texto: "Solicitar proposta",
      href: "/contato#tab-proposta",
      cmsLink: "proposta-institucional",
      track: "cap_caminho_b",
      classe: "btn btn--gold",
      arrow: true,
    },
  },
];

// ----------------- FAQ (8) -----------------

export interface ItemFaqCap {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export const faqEyebrow = "Perguntas frequentes";
export const faqH2 = `O que <em>perguntam</em> antes de contratar.`;
export const faqIntro =
  "Reunimos as oito perguntas mais comuns que recebemos sobre a capacitação institucional NTC. Se a sua dúvida não estiver aqui, o atendimento institucional responde diretamente.";

export const faqCapacitacao: ItemFaqCap[] = [
  {
    id: "cap-faq-1",
    pergunta: "Qual a diferença entre modalidade e formato?",
    respostaHtml: `<p><strong>Modalidade</strong> é a forma comercial-institucional de contratar a formação: eventos abertos, in company, turmas fechadas, sob medida ou trilhas. É a resposta à pergunta "quem é a turma?".</p>
<p><strong>Formato</strong> é como a entrega acontece operacionalmente: online, presencial ou híbrido. É a resposta à pergunta "onde a turma se encontra?".</p>
<p>Os dois eixos se combinam. Uma mesma modalidade pode ser entregue em qualquer dos três formatos — e cada órgão escolhe a combinação que melhor responde ao seu cenário.</p>`,
  },
  {
    id: "cap-faq-2",
    pergunta: "Os certificados têm validação oficial?",
    respostaHtml: `<p>Sim. Todos os certificados são emitidos pelo Instituto NTC do Brasil — instituição responsável pela curadoria, pela docência e pela operação das formações — com identidade visual NTC, registro digital único, código de validação e descrição editorial do conteúdo, das horas e da turma.</p>
<p>O certificado é emitido automaticamente pelo EventOn ao final da formação, mediante cumprimento dos critérios mínimos de presença e/ou conclusão definidos para cada evento.</p>`,
  },
  {
    id: "cap-faq-3",
    pergunta: "Como funciona o replay no EventOn?",
    respostaHtml: `<p>Todos os eventos online e híbridos são gravados, editados e disponibilizados aos inscritos pela Área do Participante. O acesso ao replay é nominal — vinculado ao CPF do servidor inscrito — e dura pela janela contratada (em geral, entre 30 e 90 dias após o último encontro).</p>
<p>Para turmas fechadas e in company, o replay pode ser estendido conforme acordo institucional. Eventos presenciais sem transmissão híbrida não geram replay público — mas podem gerar registros editoriais entregues como material da turma.</p>`,
  },
  {
    id: "cap-faq-4",
    pergunta: "Como a NTC é contratada por órgãos públicos?",
    respostaHtml: `<p>A contratação da NTC por órgãos públicos ocorre <strong>exclusivamente por via direta</strong> — inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável — ou por convênios, parcerias e instrumentos de cooperação, quando juridicamente cabíveis.</p>
<p>A NTC <strong>não participa</strong> de licitações, pregões, concorrências, ARP, registro de preços ou processos similares. Esta é uma diretriz institucional do Instituto, em razão da natureza especializada das formações que desenvolve. A página de <a href="/solucoes#contratacao-institucional" data-cms-link="modelo-institucional">Soluções</a> detalha as hipóteses jurídicas e o apoio técnico que oferecemos ao órgão na formalização.</p>`,
  },
  {
    id: "cap-faq-5",
    pergunta: "Posso combinar módulos de programas diferentes?",
    respostaHtml: `<p>Sim. Essa é exatamente a função da modalidade de <strong>trilhas e jornadas curadas</strong>. A curadoria científica da NTC combina módulos de diferentes programas — articulando, por exemplo, módulos de AGIP (contratações), LIDERA (direção) e SIGA (governança administrativa) em uma trilha de formação plurianual para uma carreira pública.</p>
<p>As trilhas são sempre articuladas com apoio da curadoria desde o briefing, para preservar a coerência editorial e técnica da jornada formativa.</p>`,
  },
  {
    id: "cap-faq-6",
    pergunta: "A NTC respeita a LGPD nas inscrições?",
    respostaHtml: `<p>Sim. O Instituto NTC do Brasil é controlador dos dados pessoais coletados em inscrições, formulários e na operação do EventOn, sob a Lei 13.709/2018 (LGPD). Os dados são tratados exclusivamente para a finalidade da formação contratada — operação, comunicação, certificação, relatório institucional — e não são compartilhados com terceiros para fins comerciais.</p>
<p>O encarregado de dados (DPO) e os direitos titulares estão disponíveis na página de <a href="/lgpd" data-cms-link="legal-lgpd">Contato · LGPD</a>.</p>`,
  },
  {
    id: "cap-faq-7",
    pergunta: "Posso inscrever uma equipe institucional inteira?",
    respostaHtml: `<p>Sim. Há um fluxo dedicado a inscrições em grupo institucional — pelo formulário "Equipe ou grupo institucional" da página de Contato. Suportamos inscrições de qualquer tamanho, com faixas de atendimento de até 50 participantes (preenchimento direto) e a partir de 50 (envio do modelo XLSX oficial com a relação de servidores).</p>
<p>Em grupos maiores, o atendimento institucional pode também avaliar se a hipótese mais aderente é a contratação direta de uma turma fechada — o que muitas vezes oferece melhor custo institucional e mais customização.</p>`,
  },
  {
    id: "cap-faq-8",
    pergunta: "Quanto tempo leva para a NTC apresentar uma proposta?",
    respostaHtml: `<p>Para inscrição em evento aberto: o atendimento responde em até <strong>2 dias úteis</strong>.</p>
<p>Para proposta institucional dedicada (in company, turma fechada, sob medida, trilha): após o briefing recebido, devolvemos a leitura técnica e a recomendação editorial em <strong>até 10 dias úteis</strong>. A proposta formal — com escopo, prazo, equipe docente, formato e valor — segue em até 15 dias úteis, conforme a complexidade do desenho.</p>
<p>Para demandas emergenciais (formação executiva em curto prazo), há rito acelerado que pode ser combinado com o atendimento institucional.</p>`,
  },
];
