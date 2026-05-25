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

// ----------------- MODALIDADES (4 cards canônicos) -----------------

export interface CardModalidade {
  slug: ModalidadeSlug;
  numLabel: string;
  eyebrow: string;
  titulo: string;
  descricao: string;
  bullets: string[];
  indicadoHtml: string;
  ctaSaibaMais: LinkInterno;
  ctaProposta: LinkInterno;
}

export const MODALIDADES_HEAD = {
  eyebrow: "Modalidades canon",
  tituloHtml: "Quatro modelos de contratação <em>institucional</em>",
  intro:
    "Cada modalidade resolve um conjunto específico de demandas institucionais. A composição comercial pode combinar mais de uma modalidade conforme o objeto da contratação.",
};

export const MODALIDADES: CardModalidade[] = [
  {
    slug: "in-company",
    numLabel: "Modalidade A",
    eyebrow: "Programa exclusivo institucional",
    titulo: "Soluções in company",
    descricao:
      "Programa entregue exclusivamente à instituição contratante, com conteúdo, formato e calendário customizados para a realidade da rede ou do órgão.",
    bullets: [
      "Conteúdo customizado a partir do programa-mãe (PEAR, AGIP, LIDERA, EDUTEC etc.)",
      "Formato presencial, online ou híbrido — definido pela instituição",
      "Calendário operacional acordado com a equipe contratante",
      "Curadoria docente dimensionada para o perfil dos participantes",
      "Material institucional personalizado + certificação NTC",
    ],
    indicadoHtml:
      "Indicado para · <strong>Órgãos federais, secretarias estaduais e municipais, autarquias, fundações, tribunais, agências reguladoras, empresas estatais e demais instituições públicas</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#in-company",
      cmsLink: "detalhe-incompany",
      track: "sol_card_incompany_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-incompany",
      track: "sol_card_incompany_proposta",
    },
  },
  {
    slug: "turmas-fechadas",
    numLabel: "Modalidade B",
    eyebrow: "Edição operacional dedicada",
    titulo: "Turmas fechadas",
    descricao:
      "Edição operacional dedicada à equipe contratante, com conteúdo padrão de um programa NTC entregue para um grupo institucional específico.",
    bullets: [
      "Conteúdo padrão do programa-mãe (ementa NTC preservada)",
      "Turma dedicada — apenas servidores e quadros da instituição",
      "Formato presencial, online ou híbrido",
      "Datas e cargas horárias adequadas à agenda operacional",
      "Certificação NTC institucional para todos os participantes",
    ],
    indicadoHtml:
      "Indicado para · <strong>Equipes de 20 a 300 servidores que precisam de formação padronizada do programa NTC sem mistura com turmas abertas</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#turmas-fechadas",
      cmsLink: "detalhe-turmas",
      track: "sol_card_turmas_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-turmas",
      track: "sol_card_turmas_proposta",
    },
  },
  {
    slug: "sob-medida",
    numLabel: "Modalidade C",
    eyebrow: "Customização profunda",
    titulo: "Soluções sob medida",
    descricao:
      "Customização profunda de ementas, módulos, cargas horárias e formato — quando a demanda institucional não cabe nos programas standards.",
    bullets: [
      "Diagnóstico institucional inicial para identificar lacunas reais",
      "Ementa nova ou híbrida entre programas existentes",
      "Cargas horárias dimensionadas por objetivo",
      "Materiais autorais produzidos para a contratação",
      "Curadoria docente específica para o tema institucional",
    ],
    indicadoHtml:
      "Indicado para · <strong>Demandas formativas únicas, projetos institucionais especiais, contratações de alta complexidade ou estágio avançado de maturidade da gestão</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#sob-medida",
      cmsLink: "detalhe-sobmedida",
      track: "sol_card_sobmedida_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-sobmedida",
      track: "sol_card_sobmedida_proposta",
    },
  },
  {
    slug: "trilhas",
    numLabel: "Modalidade D",
    eyebrow: "Sequências formativas curadas",
    titulo: "Trilhas e jornadas",
    descricao:
      "Sequências formativas curadas combinando módulos de diferentes programas NTC — adequadas a uma necessidade institucional específica que requer formação multinível.",
    bullets: [
      "Combinação curada de módulos entre programas (cross-program)",
      "Jornadas executivas de 32 a 120 horas",
      "Trilhas multinível (gestão estratégica + operacional + técnico)",
      "Certificação por trilha completa + atestado por módulo",
      "Curadoria científica que articula os módulos selecionados",
    ],
    indicadoHtml:
      "Indicado para · <strong>Capacitação de quadros executivos, formação de carreira plurianual, jornadas de alta gestão e programas com múltiplos perfis de público na mesma instituição</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#trilhas",
      cmsLink: "detalhe-trilhas",
      track: "sol_card_trilhas_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-trilhas",
      track: "sol_card_trilhas_proposta",
    },
  },
];

// ----------------- DETALHES POR MODALIDADE (4 blocos) -----------------

export interface PassoOperacional {
  titulo: string;
  descricao: string;
}

export interface BlocoDetalhe {
  slug: ModalidadeSlug;
  cream?: boolean;
  asideEyebrow: string;
  asideTituloHtml: string;
  asideDescricao: string;
  asideJuridicoLinha: string;
  asideCtaPrimario: LinkInterno;
  asideCtaSecundario: LinkInterno;
  passos: PassoOperacional[];
  cenariosTitulo: string;
  cenarios: string[];
  diferenciaisTitulo: string;
  diferenciais: string[];
}

export const DETALHES_MODALIDADES: BlocoDetalhe[] = [
  {
    slug: "in-company",
    asideEyebrow: "Modalidade A · In company",
    asideTituloHtml: "Soluções <em>in company</em>.",
    asideDescricao:
      "Programa exclusivo institucional, com conteúdo, formato e calendário customizados para a realidade da instituição contratante. A NTC entrega o programa-mãe (PEAR, AGIP, LIDERA, EDUTEC, SIGS etc.) ajustado à rede que está formando seus quadros.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · inexigibilidade (art. 74, III) ou dispensa",
    asideCtaPrimario: {
      texto: "Solicitar proposta in company",
      href: "/contato",
      cmsLink: "proposta-incompany",
      track: "sol_detail_incompany_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Briefing inicial",
      href: "/contato",
      cmsLink: "briefing-incompany",
      track: "sol_detail_incompany_briefing",
    },
    passos: [
      {
        titulo: "Briefing institucional",
        descricao:
          "Conversa inicial com a equipe da instituição para entender objetivos, público, prazo e contexto da contratação.",
      },
      {
        titulo: "Proposta customizada",
        descricao:
          "A NTC apresenta proposta institucional com programa-mãe, módulos selecionados, curadoria docente sugerida, carga horária e investimento.",
      },
      {
        titulo: "Validação e contratação",
        descricao:
          "Ajustes finais, validação da especificação técnica e da justificativa institucional, formalização da contratação direta por inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável da Lei 14.133/2021.",
      },
      {
        titulo: "Entrega do programa",
        descricao:
          "Execução do programa nas datas combinadas, com plataforma EventOn, suporte logístico, certificação institucional e relatório executivo de encerramento.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Secretaria municipal ou estadual precisa formar 80-300 servidores em um programa específico (alfabetização, contratações, governança, APS).",
      "Órgão de controle precisa capacitar auditores na nova Lei de Licitações em formato dedicado.",
      "Autarquia ou fundação precisa profissionalizar seus quadros em gestão estratégica do Estado.",
      "Tribunal precisa capacitar magistrados e servidores em direito administrativo aplicado.",
      "Rede pública precisa formar diretores escolares em gestão escolar de alta performance.",
    ],
    diferenciaisTitulo: "O que torna a entrega NTC distinta",
    diferenciais: [
      "Programa-mãe é canon (não inventamos curso na hora) — 15 programas estratégicos validados.",
      "Curadoria docente nacional com nomes do portfólio institucional mobilizada por demanda.",
      "Plataforma EventOn — acesso, replay, certificado, área do participante.",
      "Equipe comercial dedicada apoia formalização (termo de referência, empenho, NF no CNPJ do órgão).",
      "Relatório executivo de encerramento com indicadores de aprendizagem.",
    ],
  },
  {
    slug: "turmas-fechadas",
    cream: true,
    asideEyebrow: "Modalidade B · Turmas fechadas",
    asideTituloHtml: "<em>Turmas fechadas</em> dedicadas.",
    asideDescricao:
      "Edição operacional do programa-mãe entregue exclusivamente à equipe contratante. A ementa NTC é preservada — a customização está na composição da turma (apenas servidores da instituição), nas datas e na carga horária ajustadas ao calendário do órgão.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · inexigibilidade (art. 74, III)",
    asideCtaPrimario: {
      texto: "Solicitar proposta de turma fechada",
      href: "/contato",
      cmsLink: "proposta-turmas",
      track: "sol_detail_turmas_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Ver agenda padrão",
      href: "/agenda",
      cmsLink: "agenda-turma-fechada",
      track: "sol_detail_turmas_agenda",
    },
    passos: [
      {
        titulo: "Seleção do programa",
        descricao:
          "A instituição escolhe um dos 15 programas estratégicos canon — PEAR, AGIP, LIDERA, EDUTEC, PROGE, SIGS etc.",
      },
      {
        titulo: "Definição operacional",
        descricao:
          "Datas, carga horária, formato (presencial · online · híbrido) e quantidade de participantes — apenas servidores do órgão.",
      },
      {
        titulo: "Contratação direta",
        descricao:
          "Inexigibilidade pela natureza singular da atuação NTC e notória especialização. Formalização apoiada pela equipe comercial.",
      },
      {
        titulo: "Execução dedicada",
        descricao:
          "Programa entregue para a turma fechada com curadoria docente NTC, EventOn, material padrão e certificação institucional.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Instituição quer o programa NTC tal como ele é, mas sem misturar sua equipe com participantes externos.",
      "Há demanda de mais de 20 servidores no mesmo programa — turma fechada fica mais eficiente que inscrições individuais.",
      "O calendário do órgão exige datas específicas que diferem das turmas abertas da agenda nacional.",
      "Há requisitos de confidencialidade institucional (cases internos, dados sensíveis) que pedem turma dedicada.",
    ],
    diferenciaisTitulo: "Por que turma fechada NTC funciona",
    diferenciais: [
      "Ementa do programa-mãe preservada — você recebe exatamente o programa canon NTC.",
      "Sem necessidade de redesenho — implementação mais ágil que in company customizado.",
      "Certificação institucional NTC com o nome do órgão na lista de participantes.",
      "Investimento por turma costuma ser mais eficiente que inscrições individuais a partir de 25 servidores.",
    ],
  },
  {
    slug: "sob-medida",
    asideEyebrow: "Modalidade C · Sob medida",
    asideTituloHtml: "Soluções <em>sob medida</em>.",
    asideDescricao:
      "Customização profunda de ementas, módulos e formato — quando a demanda institucional é única e não cabe nos programas standards. A NTC desenha do zero a arquitetura formativa específica, com curadoria docente e materiais autorais para a contratação.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · contratação direta por inexigibilidade ou dispensa, conforme o caso",
    asideCtaPrimario: {
      texto: "Solicitar proposta sob medida",
      href: "/contato",
      cmsLink: "proposta-sobmedida",
      track: "sol_detail_sobmedida_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Conversa com curadoria",
      href: "/contato",
      cmsLink: "conversa-curadoria-sobmedida",
      track: "sol_detail_sobmedida_conversa",
    },
    passos: [
      {
        titulo: "Diagnóstico institucional",
        descricao:
          "Mapeamento aprofundado com a equipe contratante — objetivos da gestão, perfil dos quadros, contexto institucional, indicadores esperados.",
      },
      {
        titulo: "Desenho da arquitetura",
        descricao:
          "NTC propõe ementa nova, combina módulos existentes ou cria abordagem híbrida — com cargas horárias, formato, curadoria docente e cronograma específicos.",
      },
      {
        titulo: "Validação e produção",
        descricao:
          "Validação técnica da proposta, produção de materiais autorais, definição da equipe docente, formalização da contratação.",
      },
      {
        titulo: "Execução acompanhada",
        descricao:
          "Entrega do programa com acompanhamento institucional, ajustes em tempo real conforme retorno dos participantes, relatório executivo de impacto.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Tribunal precisa formar magistrados em direito constitucional aplicado à jurisdição superior (recorte inédito).",
      "Secretaria estadual precisa de uma jornada articulando educação digital + LGPD educacional + IA em sala de aula.",
      "Ministério precisa capacitar coordenação técnica em gestão de programas federais com regulamentação específica.",
      "Autarquia regulatória precisa formar quadros em regulação setorial + concessões + PPPs simultaneamente.",
      "Estatal precisa de programa interno único combinando compliance + governança + Lei 14.133/2021 + cultura organizacional.",
    ],
    diferenciaisTitulo: "O nível de customização que entregamos",
    diferenciais: [
      "Curadoria científica desenha a arquitetura — não é simples ajuste de programa existente.",
      "Materiais autorais produzidos para a contratação — apostilas, slides, cases específicos.",
      "Equipe docente selecionada nominalmente para a demanda — curadoria caso a caso.",
      "Acompanhamento institucional próximo durante toda a execução.",
      "Possibilidade de evolução em rodadas plurianuais com a mesma instituição.",
    ],
  },
  {
    slug: "trilhas",
    cream: true,
    asideEyebrow: "Modalidade D · Trilhas e jornadas",
    asideTituloHtml: "Trilhas e <em>jornadas</em> curadas.",
    asideDescricao:
      "Sequências formativas combinando módulos de diferentes programas NTC — quando a demanda institucional exige cobertura multinível ou cross-program. A curadoria científica articula os módulos selecionados em uma jornada coerente, com certificação por trilha completa.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · contratação direta por inexigibilidade ou dispensa, conforme o caso",
    asideCtaPrimario: {
      texto: "Solicitar proposta de trilha",
      href: "/contato",
      cmsLink: "proposta-trilhas",
      track: "sol_detail_trilhas_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Ver corpo docente",
      href: "/o-grupo/corpo-docente",
      cmsLink: "corpo-docente-trilhas",
      track: "sol_detail_trilhas_curadoria",
    },
    passos: [
      {
        titulo: "Mapa de competências",
        descricao:
          "Análise das competências que a jornada precisa desenvolver — em alta gestão, gestão intermediária e camada técnica.",
      },
      {
        titulo: "Curadoria de módulos",
        descricao:
          "Seleção dos módulos canon entre os 15 programas estratégicos NTC, com curadoria científica articuladora.",
      },
      {
        titulo: "Cronograma plurianual",
        descricao:
          "Sequenciamento dos módulos em jornada de 32 a 120 horas, com pausa entre módulos para aplicação institucional.",
      },
      {
        titulo: "Execução e certificação",
        descricao:
          "Entrega progressiva da trilha com certificação por trilha completa + atestado por módulo + reconhecimento institucional NTC.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Carreira pública precisa de jornada plurianual estruturada — formação executiva continuada.",
      "Programa de capacitação multinível: alta gestão (LIDERA) + camada técnica (AGIP) + operacional (módulos selecionados).",
      "Rede pública precisa de trilha combinando alfabetização (PEAR) + gestão escolar (PROGE) + avaliação (módulos PROGE).",
      "Sistema de Saúde precisa articular SIGS + PROAPS+ + PROSUS+ em jornada coerente por perfil de público.",
      "Escola de governo precisa montar programa de mestrado profissional ou pós-graduação institucional com módulos NTC.",
    ],
    diferenciaisTitulo: "O que torna a trilha NTC distinta",
    diferenciais: [
      "Curadoria científica articuladora — não é simples soma de cursos, é jornada coerente.",
      "Cross-program · combina módulos de diferentes programas (raro no mercado de formação institucional).",
      "Certificação dupla · por trilha completa + por módulo individual.",
      "Pausa institucional entre módulos para que os participantes apliquem o aprendizado.",
      "Possibilidade de evolução plurianual com a mesma instituição.",
    ],
  },
];
