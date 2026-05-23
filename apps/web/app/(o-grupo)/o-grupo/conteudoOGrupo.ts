/**
 * Conteúdo da página /o-grupo — textos literais aprovados do
 * 08_Pagina_O_Grupo_NTC_v3.html.
 *
 * Este arquivo é a **fonte única** dos textos institucionais da
 * página. A página não consulta o CMS para essa rota; quando o
 * usuário decidir gerenciar pelo admin, basta criar um Global no
 * Payload espelhando essa estrutura e ligar a leitura na page.tsx.
 *
 * Toda mudança nesses textos deve passar pela equipe editorial e
 * pela atualização do protótipo HTML correspondente. Não editar
 * livremente (CLAUDE.md §5.3).
 */

export const CONTEUDO_OGRUPO = {
  hero: {
    eyebrow: "O Grupo NTC · Edição 2026",
    titulo: "Uma <em>plataforma nacional</em> de soluções para a Administração Pública brasileira.",
    subtitulo:
      "Inteligência institucional, autoridade técnica e capacidade de execução — reunidas em uma única organização. Soluções de alta especialização para capacitar, aperfeiçoar e fortalecer instituições, equipes e lideranças públicas.",
    imagemFundoUrl: "/img/fotos/_optimized/hero-grupo-plenaria.1920.webp",
    selo: {
      anos: "2006 — 2026",
      label: "20 anos · Edição institucional",
    },
    microindicadores: [
      { valor: "500+", rotulo: "eventos" },
      { valor: "400 mil+", rotulo: "agentes capacitados" },
      { valor: "3", rotulo: "áreas estratégicas" },
    ],
    ctas: [
      {
        rotulo: "Conhecer a arquitetura do portfólio",
        link: "#portfolio",
        variante: "dourado" as const,
      },
      {
        rotulo: "Solicitar proposta institucional",
        link: "#cta-final",
        variante: "ghost-light" as const,
      },
    ],
  },
  indicadoresOficiais: [
    { label: "Trajetória", valor: "20+ <em>anos</em>", valorSub: "De atuação institucional" },
    { label: "Eventos realizados", valor: "500+", valorSub: "Presenciais + on-line" },
    { label: "Agentes capacitados", valor: "400 mil+", valorSub: "Em escala nacional" },
    { label: "Satisfação", valor: "98%", valorSub: "Índice consolidado" },
  ],
  sintese: {
    eyebrow: "Apresentação institucional",
    titulo:
      "Inteligência institucional, autoridade técnica e capacidade de execução — <em>reunidas em uma única organização</em>.",
    lede: "Mais do que ofertar ações de capacitação, o Grupo NTC organiza conhecimento especializado em arquiteturas de solução capazes de apoiar governos, secretarias, órgãos de controle, redes públicas, equipes técnicas e lideranças institucionais.",
    paragrafos: [
      'O <strong>Grupo NTC</strong> é uma organização de referência nacional na concepção, estruturação e entrega de soluções de alta especialização voltadas à <strong>formação, capacitação, aperfeiçoamento e fortalecimento institucional</strong> do setor público brasileiro.',
      'Com trajetória consolidada, atuação em escala nacional e reconhecida excelência programática, a NTC desenvolve <strong>programas estratégicos, jornadas executivas, trilhas formativas, consultorias especializadas e soluções sob medida</strong> para os desafios contemporâneos da educação pública, da gestão pública, da saúde e da transformação institucional.',
      'Nosso compromisso é <strong>ampliar capacidades, qualificar a tomada de decisão e gerar resultados sustentáveis</strong> para o interesse público — com rigor editorial, disciplina metodológica e responsabilidade institucional.',
    ],
    seloMarca: {
      eyebrow: "Marca institucional",
      linha1: "<em>Inteligência institucional.</em>",
      linha2: "Impacto real.",
    },
    fecho:
      "Inteligência institucional, curadoria qualificada, autoridade técnica e capacidade nacional de execução — reunidas em uma <em>única plataforma</em>.",
  },
  propostaValor: {
    eyebrow: "Posicionamento e proposta de valor",
    titulo: "Parceira estratégica de instituições que buscam <em>excelência técnica</em>.",
    intro:
      "O Grupo NTC se apresenta ao mercado público como parceira estratégica de instituições comprometidas com qualificação técnica, modernização institucional e fortalecimento de capacidades organizacionais. Nossa proposta de valor está ancorada em quatro pilares.",
    pilares: [
      {
        numero: "01",
        titulo: "Autoridade técnica",
        descricao:
          "Especialistas e lideranças de referência nacional, selecionados com rigor de curadoria para cada tema e formato.",
      },
      {
        numero: "02",
        titulo: "Inteligência programática",
        descricao:
          "Desenho pedagógico consistente, trilhas orientadas a objetivos e integração entre programas, jornadas e módulos.",
      },
      {
        numero: "03",
        titulo: "Leitura aplicada do público",
        descricao:
          "Conteúdos, linguagens e cargas alinhados à realidade decisória de governos, secretarias, redes e órgãos.",
      },
      {
        numero: "04",
        titulo: "Escala nacional de execução",
        descricao:
          "Capacidade de entrega em múltiplos formatos e territórios, preservando padrão e aderência institucional.",
      },
    ],
    fecho:
      "Os Programas Estratégicos NTC são o núcleo estruturante desse posicionamento — a passagem de uma lógica fragmentada para uma <em>arquitetura institucional robusta</em>, orientada a soluções e alinhada ao novo padrão de gestão pública brasileira.",
  },
  mvv: {
    eyebrow: "Missão · Visão · Valores",
    titulo: "Uma identidade institucional alinhada à <em>nova fase</em> do Grupo NTC.",
    intro:
      "Fundamentos que sustentam a linguagem, a postura e a proposta de valor do Grupo NTC em sua interlocução com governos, redes públicas de ensino, órgãos de controle, sistemas de justiça, parlamentos, secretarias e organizações públicas de saúde.",
    missao: {
      tituloCurto: "O que entregamos",
      texto:
        "Desenvolver soluções de alta especialização para capacitar, aperfeiçoar e fortalecer instituições, equipes e lideranças públicas — promovendo decisões mais qualificadas, gestão mais eficiente e resultados de maior valor para o interesse público.",
    },
    visao: {
      tituloCurto: "Onde queremos chegar",
      texto:
        "Consolidar-se como uma das principais referências nacionais em formação executiva, capacitação estratégica e desenvolvimento institucional para a Administração Pública, integrando excelência editorial, profundidade técnica e escala de execução.",
    },
    valores: {
      tituloCurto: "O que sustenta a marca",
      texto:
        "Excelência técnica; ética e responsabilidade institucional; compromisso com resultados; inovação com aplicabilidade; rigor, qualidade e credibilidade; respeito às pessoas e às instituições; cooperação e valorização das equipes.",
    },
  },
  areasEstrategicas: {
    eyebrow: "Áreas estratégicas de atuação",
    titulo: "Três áreas, uma <em>arquitetura integrada</em> de valor público.",
    intro:
      "O portfólio institucional do Grupo NTC está organizado em três grandes áreas — Educação, Gestão Pública e Saúde — articuladas transversalmente com governança, inovação, inteligência aplicada, liderança e transformação digital.",
    verticais: [
      {
        vertical: "edu" as const,
        numero: "01",
        label: "Área Estratégica",
        nome: "NTC Educação",
        descricao:
          "Da primeira infância ao ensino médio. Arquitetura educacional ampla e contemporânea, com nove programas que cobrem alfabetização, educação integral, gestão escolar, inclusão, convivência, tecnologia, IA e itinerários de futuro.",
        areaLabel: "Portfólio · 9 programas",
        chips: ["EDUTEC", "PEAR", "PEI", "PROGE", "PROGIR", "EGIDE", "VIVAESCOLA", "PINEI", "FUTURA"],
        contagemRotulo: "9 programas",
        ctaRotulo: "Conhecer área →",
        ctaLink: "#portfolio",
      },
      {
        vertical: "gov" as const,
        numero: "02",
        label: "Área Estratégica",
        nome: "NTC Gestão Pública",
        descricao:
          "Governança, liderança e performance. Plataforma executiva para modernização administrativa, contratações públicas, fortalecimento da governança, integridade e ampliação da capacidade estatal.",
        areaLabel: "Portfólio · 3 programas",
        chips: ["AGIP", "LIDERA", "SIGA"],
        contagemRotulo: "3 programas",
        ctaRotulo: "Conhecer área →",
        ctaLink: "#portfolio",
      },
      {
        vertical: "sau" as const,
        numero: "03",
        label: "Área Estratégica",
        nome: "NTC Saúde",
        descricao:
          "Transformação do SUS e redes de cuidado. Eixo maduro e estratégico voltado à gestão pública em saúde, atenção primária, saúde digital, inteligência artificial, dados e interoperabilidade.",
        areaLabel: "Portfólio · 3 programas",
        chips: ["SIGS", "PROAPS+", "PROSUS+"],
        contagemRotulo: "3 programas",
        ctaRotulo: "Conhecer área →",
        ctaLink: "#portfolio",
      },
    ],
    fecho:
      "Essa organização permite apresentar ao mercado público uma leitura clara das frentes prioritárias, reduzir dispersão, fortalecer coerência comercial e ampliar a capacidade de personalização das soluções.",
  },
  trajetoria: {
    eyebrow: "Trajetória institucional · 2006 – 2026",
    titulo: "Duas décadas de <em>presença qualificada</em> no setor público brasileiro.",
    intro:
      "Ao longo de sua trajetória, o Grupo NTC consolidou-se como uma plataforma nacional de formação, capacitação e desenvolvimento institucional para a Administração Pública, reunindo excelência docente, inteligência programática e capacidade de execução em escala.",
    marcos: [
      {
        ano: "2006",
        titulo: "Origem institucional",
        texto:
          "Capacitação e aperfeiçoamento de agentes públicos — foco inicial em Direito Administrativo, licitações e contratos.",
        destaque: true,
      },
      {
        ano: "2007",
        titulo: "Grandes eventos e autoridade técnica",
        texto:
          "Congressos, seminários e jornadas técnicas em capitais do Norte e Nordeste — marco do Congresso Norte-Nordeste de Licitações.",
        destaque: false,
      },
      {
        ano: "2008\n2012",
        titulo: "Expansão regional e presença nacional",
        texto:
          "Atuação ampliada para Norte, Nordeste e Centro-Oeste, consolidando referência em capacitação pública, controle e governança.",
        destaque: false,
      },
      {
        ano: "2013",
        titulo: "Educação pública como frente estratégica",
        texto:
          "Início dos projetos voltados a redes públicas de ensino, gestão escolar e políticas educacionais.",
        destaque: false,
      },
      {
        ano: "2019\n2020",
        titulo: "Digitalização e escala",
        texto:
          "Virtualização antecipada e consolidação de formações remotas e híbridas em larga escala — alcance nacional.",
        destaque: true,
      },
      {
        ano: "2024\n2026",
        titulo: "Nova arquitetura programática",
        texto:
          "Portfólio reorganizado em áreas estratégicas, programas estruturados e trilhas formativas — plataforma integrada.",
        destaque: true,
      },
    ],
    fecho:
      "Ao completar <em>20 anos</em>, o Grupo NTC reafirma sua posição como instituição nacionalmente reconhecida pela excelência técnica, pela curadoria de especialistas, pela capacidade de execução e pelo compromisso com o desenvolvimento das instituições públicas brasileiras.",
  },
  portfolioCompleto: {
    eyebrow: "Visão consolidada dos programas estratégicos",
    titulo: "Três áreas. Quinze programas. <em>Uma arquitetura integrada</em>.",
    intro:
      "O portfólio estratégico do Grupo NTC reúne hoje 15 programas prioritários, distribuídos em três áreas: nove em Educação, três em Gestão Pública e três em Saúde. A arquitetura por eixos amplia coerência comercial, fortalece a leitura institucional do portfólio e facilita a composição de soluções por eixo, por programa, por trilha ou por módulos avulsos.",
    areas: [
      {
        vertical: "edu" as const,
        nome: "NTC <em>Educação</em>",
        count: "9 programas · Educação pública",
        programas: [
          { sigla: "EDUTEC", descricao: "Educação Digital, Inovação e Tecnologias", link: "#portfolio" },
          { sigla: "PEAR", descricao: "Alfabetização de Alta Performance", link: "#portfolio" },
          { sigla: "PEI", descricao: "Educação Integral", link: "#portfolio" },
          { sigla: "PROGE", descricao: "Gestão Escolar e Coordenação Pedagógica", link: "#portfolio" },
          { sigla: "PROGIR", descricao: "Gestão da Inclusão com Resultado", link: "#portfolio" },
          { sigla: "EGIDE", descricao: "IA, Dados e Transformação Digital", link: "#portfolio" },
          { sigla: "VIVAESCOLA", descricao: "Convivência, Permanência e Proteção", link: "#portfolio" },
          { sigla: "PINEI", descricao: "Primeira Infância e Educação Infantil", link: "#portfolio" },
          { sigla: "FUTURA", descricao: "Ensino Médio e Itinerários de Futuro", link: "#portfolio" },
        ],
      },
      {
        vertical: "gov" as const,
        nome: "NTC <em>Gestão Pública</em>",
        count: "3 programas · Governança e gestão",
        programas: [
          {
            sigla: "AGIP",
            descricao: "Governança, Integridade e Performance nas Contratações Públicas",
            link: "#portfolio",
          },
          { sigla: "LIDERA", descricao: "Liderança, Direção Estratégica e Resultados", link: "#portfolio" },
          { sigla: "SIGA", descricao: "Soluções Inteligentes de Governança e Administração", link: "#portfolio" },
        ],
      },
      {
        vertical: "sau" as const,
        nome: "NTC <em>Saúde</em>",
        count: "3 programas · Transformação do SUS",
        programas: [
          {
            sigla: "SIGS",
            descricao: "Saúde Inteligente, Governança Digital, IA e Transformação do SUS",
            link: "#portfolio",
          },
          {
            sigla: "PROAPS+",
            descricao: "Alta Performance na Atenção Primária e Redes de Cuidado",
            link: "#portfolio",
          },
          { sigla: "PROSUS+", descricao: "Governança, Financiamento e Performance no SUS", link: "#portfolio" },
        ],
      },
    ],
    ctaVerTodos: {
      rotulo: "Ver todos os 15 programas em detalhe",
      link: "#portfolio",
    },
  },
  diferenciais: {
    eyebrow: "Diferenciais competitivos",
    titulo: "Razões para <em>confiar</em> no Grupo NTC.",
    intro:
      "O Grupo NTC diferencia-se pela combinação entre excelência docente, inteligência programática, curadoria temática de alto nível, compreensão qualificada do ambiente público e capacidade de entrega em múltiplos formatos.",
    cards: [
      {
        numero: "01 · Diferencial",
        icone: "medalha" as const,
        titulo: "Excelência docente e programática",
        descricao:
          "Especialistas de referência nacional e seleção criteriosa de temas, enfoques e formatos para cada solução entregue.",
      },
      {
        numero: "02 · Diferencial",
        icone: "edificio" as const,
        titulo: "Aderência ao setor público",
        descricao:
          "Conteúdos e soluções pensados a partir das necessidades concretas da Administração Pública brasileira e de suas redes.",
      },
      {
        numero: "03 · Diferencial",
        icone: "modulos" as const,
        titulo: "Arquitetura flexível e escalável",
        descricao:
          "Programas, trilhas, jornadas e ações customizadas ajustáveis ao porte, à maturidade e ao contexto do cliente.",
      },
      {
        numero: "04 · Diferencial",
        icone: "regua" as const,
        titulo: "Capacidade de personalização",
        descricao:
          "Desenho sob medida para redes públicas, órgãos, equipes, segmentos institucionais e sistemas de saúde.",
      },
      {
        numero: "05 · Diferencial",
        icone: "lampada" as const,
        titulo: "Inovação com aplicabilidade",
        descricao:
          "Abordagem contemporânea traduzida em soluções práticas, consistentes e institucionalmente relevantes.",
      },
      {
        numero: "06 · Diferencial",
        icone: "mapa" as const,
        titulo: "Capacidade nacional de entrega",
        descricao:
          "Execução em escala, com consistência de padrão, forte interlocução institucional e presença em diferentes regiões.",
      },
    ],
  },
  metodologia: {
    eyebrow: "Metodologia de atuação",
    titulo: "Da <em>leitura do contexto</em> à entrega orientada a resultados.",
    intro:
      "A metodologia do Grupo NTC organiza a entrega das soluções em etapas coerentes, flexíveis e orientadas a objetivos, garantindo aderência institucional, qualidade pedagógica e efetividade de aplicação.",
    etapas: [
      {
        numero: "Etapa 01",
        icone: "lupa" as const,
        titulo: "Diagnóstico",
        descricao:
          "Compreensão da realidade institucional, dos desafios, do público e das prioridades do cliente.",
      },
      {
        numero: "Etapa 02",
        icone: "grafico" as const,
        titulo: "Desenho programático",
        descricao:
          "Estruturação da solução a partir da finalidade, do nível de maturidade e dos resultados esperados.",
      },
      {
        numero: "Etapa 03",
        icone: "lista" as const,
        titulo: "Curadoria de especialistas",
        descricao:
          "Seleção criteriosa de temas, enfoques e profissionais com legitimidade acadêmica, técnica e prática.",
      },
      {
        numero: "Etapa 04",
        icone: "play" as const,
        titulo: "Execução em formatos adequados",
        descricao:
          "Presencial, on-line ao vivo, híbrido, in company ou em trilhas e jornadas customizadas.",
      },
      {
        numero: "Etapa 05",
        icone: "escudo" as const,
        titulo: "Aplicabilidade",
        descricao:
          "Conteúdos conectados à prática, à tomada de decisão e ao fortalecimento institucional.",
      },
      {
        numero: "Etapa 06",
        icone: "documento" as const,
        titulo: "Flexibilidade de contratação",
        descricao:
          "Execução por programa completo, módulos avulsos, trilhas, jornadas ou formatos exclusivos.",
      },
    ],
  },
  autoridade: {
    eyebrow: "Autoridade técnica e curadoria científica",
    titulo: "Curadoria composta por <em>especialistas de referência nacional</em>.",
    intro:
      "A NTC congrega ministros, juristas, lideranças intelectuais e referências em gestão estratégica do Estado — selecionados com rigor de curadoria para cada tema, formato e necessidade institucional do cliente. A composição docente é construída caso a caso, de acordo com o desenho pedagógico, a demanda institucional e o nível de maturidade da rede contratante.",
    curadorias: [
      {
        tag: "Curadoria 01",
        titulo: "Gestão Pública",
        count: "31 especialistas · 5 blocos temáticos",
        texto:
          "Ministros, juristas, lideranças intelectuais e referências em gestão estratégica do Estado. Administração pública, governança, liderança executiva, cultura organizacional, jurídico, controle, compliance, LGPD e políticas setoriais.",
        fotoSlug: "am-gov" as const,
        ctaRotulo: "Ver curadoria completa →",
        ctaLink: "#cta-final",
      },
      {
        tag: "Curadoria 02",
        titulo: "Contratações Públicas",
        count: "31 especialistas · 5 blocos temáticos",
        texto:
          "Autoridades nacionais em licitações e Lei 14.133/2021 — ministros, juristas, doutrinadores, auditores do TCU e referências em concessões, PPPs, controle externo, obras públicas, jurisprudência e capacitação técnica.",
        fotoSlug: "am-cont" as const,
        ctaRotulo: "Ver curadoria completa →",
        ctaLink: "#cta-final",
      },
      {
        tag: "Curadoria 03",
        titulo: "Educação",
        count: "60 especialistas · 6 áreas-chave",
        texto:
          "Autoridades nacionais da educação brasileira — ex-presidentes do INEP, conselheiros do CNE, doutores de USP/PUC, referências em alfabetização, avaliação, gestão escolar, primeira infância, política educacional, inovação pedagógica e tecnologias.",
        fotoSlug: "am-edu" as const,
        ctaRotulo: "Ver curadoria completa →",
        ctaLink: "#cta-final",
      },
      {
        tag: "Curadoria 04",
        titulo: "Saúde",
        count: "4 frentes técnicas",
        texto:
          "Lideranças e especialistas com experiência em gestão pública em saúde, atenção primária, redes de cuidado, saúde digital, inteligência artificial aplicada, governança, financiamento e transformação do SUS. Composição docente caso a caso.",
        fotoSlug: "am-sau" as const,
        ctaRotulo: "Ver curadoria completa →",
        ctaLink: "#cta-final",
      },
    ],
  },
  credibilidade: {
    eyebrow: "Credibilidade institucional",
    titulo: "Presença junto a estruturas <em>relevantes</em> do setor público.",
    intro:
      "A trajetória do Grupo NTC é respaldada por ampla atuação nacional, relacionamento com órgãos e instituições relevantes e histórico consistente de programas executados, jornadas formativas e capacitação de agentes públicos.",
    indicadores: [
      { valor: "20", sufixo: "+", label: "Anos de atuação" },
      { valor: "500", sufixo: "+", label: "Eventos realizados" },
      { valor: "400", sufixo: " mil+", label: "Agentes capacitados" },
      { valor: "300", sufixo: "+", label: "Eventos presenciais" },
      { valor: "200", sufixo: "+", label: "Eventos on-line" },
      { valor: "98", sufixo: "%", label: "Índice de satisfação" },
    ],
    mosaico: [
      { slug: "cm-1" as const, label: "Plenária institucional · Brasília", wide: true, tall: true },
      { slug: "cm-2" as const, label: "Auditório público", wide: false, tall: false },
      { slug: "cm-3" as const, label: "Transmissão EventON · ao vivo", wide: false, tall: false },
      { slug: "cm-4" as const, label: "Curadoria · Contratações Públicas", wide: true, tall: false },
      { slug: "cm-5" as const, label: "Estúdio profissional · HD", wide: false, tall: false },
      { slug: "cm-6" as const, label: "Educação pública · redes", wide: false, tall: false },
      { slug: "cm-7" as const, label: "Saúde pública · SUS", wide: false, tall: false },
      { slug: "cm-8" as const, label: "Bastidor institucional", wide: false, tall: false },
    ],
    fecho:
      "Sua interlocução alcança governos estaduais e municipais, secretarias, redes públicas de ensino, estruturas da saúde pública, órgãos de controle, poder legislativo, autarquias, fundações, conselhos e outras organizações estratégicas do setor público — uma plataforma nacional que combina escala, profundidade e aderência à realidade da Administração Pública brasileira.",
  },
  eventon: {
    eyebrow: "EventON NTC · Infraestrutura digital própria",
    titulo: "Plataforma própria para eventos institucionais <em>ao vivo</em>.",
    intro:
      "O EventON NTC é a infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira. Reúne em uma única plataforma a transmissão profissional, a interação em tempo real, a continuidade pedagógica e o padrão editorial NTC.",
    mockup: {
      urlBarra: "eventon.institutontc.com.br · ao vivo",
      statusLabel: "Ao vivo HD",
      playerHd: "HD · 1080p",
      playerTitulo: "Palestra ao vivo",
      playerSub: "Especialista convidado · NTC",
      chatTitulo: "Interação · Chat ao vivo",
      chatMensagens: [
        { autor: "Secretaria de Educação · MA", texto: "Como integrar PEAR à rede municipal?" },
        { autor: "Procuradoria · GO", texto: 'Lei 14.133 · Art. 74 III "c" aplica?' },
        { autor: "SES · BA", texto: "Aguardo a parte sobre APS digital." },
        { autor: "TCE · RJ", texto: "Indicadores de engajamento disponíveis?" },
      ],
      stats: [
        { valor: "1.847", rotulo: "participantes" },
        { valor: "96%", rotulo: "presença" },
        { valor: "Replay", rotulo: "habilitado" },
        { valor: "Certificado", rotulo: "NTC" },
      ],
    },
    features: [
      {
        icone: "escudo" as const,
        titulo: "Plataforma segura e escalável",
        descricao:
          "Operação resiliente, capaz de comportar de pequenos grupos a grandes audiências nacionais sem perda de qualidade ou integridade do registro.",
      },
      {
        icone: "globo" as const,
        titulo: "Acesso sem instalação",
        descricao:
          "Participação direta pelo navegador. Convite institucional pré-validado, ingresso em poucos cliques, suporte técnico ativo.",
      },
      {
        icone: "camera" as const,
        titulo: "Transmissão ao vivo em HD",
        descricao:
          "Vídeo e áudio em alta definição, múltiplos palestrantes, integração com câmeras profissionais, operação coordenada pela equipe NTC.",
      },
      {
        icone: "telas" as const,
        titulo: "Múltiplos dispositivos",
        descricao:
          "Acesso fluido por desktop, laptop, tablet e telefone — consistência da experiência em qualquer ponto da rede pública nacional.",
      },
      {
        icone: "chat" as const,
        titulo: "Interação em tempo real",
        descricao:
          "Chat, perguntas, enquetes, tomada de fala e moderação ativa. A interatividade é parte do desenho pedagógico, não recurso acessório.",
      },
      {
        icone: "certificado" as const,
        titulo: "Gestão e certificação",
        descricao:
          "Inscrição, controle de presença, relatórios, indicadores de engajamento e certificados institucionais com identidade visual NTC.",
      },
    ],
    fecho: "Transmissão, curadoria e entrega institucional em uma única infraestrutura digital.",
  },
  juridico: {
    eyebrow: "Segurança institucional e aderência jurídica",
    titulo: "Contratação com <em>suporte técnico</em> e clareza institucional.",
    intro:
      "As soluções do Grupo NTC podem ser contratadas de acordo com a natureza do objeto, o formato da ação e a realidade administrativa de cada instituição, observada a legislação aplicável — com destaque para a Lei nº 14.133/2021 (Nova Lei de Licitações e Contratos Administrativos).",
    fundamentoLegal:
      'Nos termos do <strong>art. 74, III, alínea "c", da Lei nº 14.133/2021</strong>, é inexigível a licitação para contratação de profissional do setor artístico ou de serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, <strong>incluindo-se aí, de forma expressa, o treinamento e aperfeiçoamento de pessoal</strong>.',
    quote:
      "A NTC dispõe de base institucional, corpo docente de notória especialização e argumentação técnico-jurídica consistente para apoiar a adequada instrução dos processos relacionados a capacitações, seminários, programas formativos e soluções especializadas, preservando integridade, segurança e transparência dos procedimentos.",
    diretrizes: [
      {
        numero: "Diretriz 01",
        titulo: "Fundamento legal expresso",
        descricao:
          'Lei nº 14.133/2021, art. 74, III, "c" — inexigibilidade para serviços técnicos especializados de natureza intelectual, incluído o treinamento e o aperfeiçoamento de pessoal.',
      },
      {
        numero: "Diretriz 02",
        titulo: "Notória especialização",
        descricao:
          "Corpo docente, curadoria temática e trajetória institucional que suportam tecnicamente a caracterização da notória especialização nos termos da lei.",
      },
      {
        numero: "Diretriz 03",
        titulo: "Aderência ao objeto",
        descricao:
          "Proposta ajustada ao objeto, ao público, ao formato e à realidade administrativa de cada instituição contratante, observados princípios da legalidade e da eficiência.",
      },
      {
        numero: "Diretriz 04",
        titulo: "Cooperação técnica",
        descricao:
          "Apoio qualificado na instrução do processo — memórias, justificativas técnicas, currículos, portfólio e anexos complementares.",
      },
    ],
    rodape:
      "O detalhamento normativo, a fundamentação jurídica e os anexos comerciais-jurídicos são apresentados em caderno próprio, conforme o objeto e a demanda do cliente.",
  },
  ctaFinal: {
    eyebrow: "Encerramento institucional · Edição 2026",
    titulo: "Parceiro estratégico de <em>instituições públicas</em>.",
    subtitulo:
      "Mais do que oferecer ações pontuais, a NTC estrutura programas estratégicos, jornadas executivas e soluções institucionais desenhadas para apoiar organizações públicas na construção de resultados mais consistentes, decisões mais qualificadas e capacidades institucionais mais robustas.",
    ctas: [
      {
        rotulo: "Solicitar proposta institucional",
        link: "/#contato",
        variante: "dourado" as const,
      },
      {
        rotulo: "Ver os 15 programas estratégicos",
        link: "/#programas",
        variante: "ghost-light" as const,
      },
      {
        rotulo: "Ver agenda completa",
        link: "/#capacitacao",
        variante: "ghost-light" as const,
      },
    ],
    tagline: "— Inteligência institucional. Impacto real. —",
    endereco:
      "Instituto NTC do Brasil · SCS Quadra 9, Bloco C · Ed. Parque Cidade Corporate · Sala 1001 · Asa Sul · CEP 70308-200 · Brasília — DF · (63) 3212-1199 · contato@institutontc.com.br",
  },
};

export type IconeDiferencial = "medalha" | "edificio" | "modulos" | "regua" | "lampada" | "mapa";
export type IconeMetodologia = "lupa" | "grafico" | "lista" | "play" | "escudo" | "documento";
export type IconeMvv = "missao" | "visao" | "valores";
export type IconeEventon = "escudo" | "globo" | "camera" | "telas" | "chat" | "certificado";
