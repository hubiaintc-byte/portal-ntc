import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PROAPS: ConteudoPrograma = {
  sigla: "PROAPS+",
  siglaCss: "PROAPS",
  siglaExibida: "PROAPS+",
  slug: "proaps",
  nomeCompleto: "Programa Avançado de Atenção Primária à Saúde",
  vertical: "saude",
  verticalRotulo: "NTC Saúde",
  breadcrumb: { current: "PROAPS+" },
  hero: {
    bgSrc: `${IMG}/area-saude.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa Avançado de <em>Atenção Primária à Saúde</em>`,
    sub: "Capacitação executiva para secretarias, gestores e equipes da Atenção Primária à Saúde — articulando Estratégia Saúde da Família, redes de atenção primária, gestão territorial, indicadores assistenciais e modelos contemporâneos de APS no SUS brasileiro.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=proaps", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=proaps&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Saúde",          valorSub: "Atenção Primária à Saúde" },
    { rotulo: "Estrutura",     valor: "8 módulos",          valorSub: "8 horas por módulo" },
    { rotulo: "Carga horária", valor: "64 horas",           valorSub: "Total do programa" },
    { rotulo: "Modalidades",   valor: "Híbrido",            valorSub: "Online · Presencial · In company" },
    { rotulo: "Status",        valor: "Módulos abertos",    valorSub: "Inscrições ativas" },
  ],
  navAnchors: [
    { href: "#visao-geral",     rotulo: "Visão geral" },
    { href: "#problema",        rotulo: "Problema" },
    { href: "#publico",         rotulo: "Público" },
    { href: "#eixos",           rotulo: "Eixos" },
    { href: "#modulos",         rotulo: "Módulos" },
    { href: "#resultados",      rotulo: "Resultados" },
    { href: "#docentes",        rotulo: "Corpo docente" },
    { href: "#modalidades",     rotulo: "Modalidades" },
    { href: "#modulos-abertos", rotulo: "Módulos abertos" },
    { href: "#faq",             rotulo: "FAQ" },
  ],
  visaoGeral: {
    eyebrow: "Visão geral",
    titulo: "Um programa estratégico para a Atenção Primária à Saúde nas redes brasileiras.",
    tituloHtml: `Um programa estratégico para a <em>Atenção Primária à Saúde</em> nas redes brasileiras.`,
    corpoHtml: `<p class="lede-block">O PROAPS+ articula gestão territorial da APS, Estratégia Saúde da Família, redes de atenção primária, indicadores assistenciais e modelos contemporâneos de cuidado em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias municipais, coordenadores de APS, gerentes de unidades básicas e equipes técnicas das redes.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a APS — secretários municipais de saúde, coordenadores de Atenção Primária, gerentes de unidades básicas, apoiadores institucionais, equipes de planejamento da APS e quadros executivos das secretarias — que precisam de <strong>repertório técnico-assistencial atualizado</strong>, <strong>metodologia aplicada à gestão territorial</strong> e <strong>protocolos institucionais</strong> compatíveis com a Política Nacional de Atenção Básica e com a realidade dos territórios brasileiros.</p>
<p>O PROAPS+ não é um curso assistencial isolado nem um programa genérico de saúde pública. É um programa de fortalecimento institucional da APS — articulando ESF, redes, gestão territorial, indicadores e cuidado integral em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de gestão da APS</strong>, construída pelos próprios participantes para o seu município ou rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A Atenção Primária à Saúde brasileira opera hoje em ambiente de pressão crescente — desafios de cobertura, fragmentação assistencial, baixo financiamento per capita, transição demográfica e epidemiológica, judicialização da saúde e expectativa social por resultados verificáveis. Secretarias municipais precisam articular respostas estruturadas, territorializadas e sustentáveis.</p>
<p>A maioria dos municípios convive simultaneamente com três pressões: rotatividade de equipes da ESF, ausência de cultura institucional de gestão territorial qualificada e ausência de painéis institucionais que conectem indicadores de APS, financiamento e cuidado integral. Programas pontuais, sem articulação institucional, não respondem ao desafio.</p>
<p>O PROAPS+ responde a essa pressão construindo capacidade institucional avançada: municípios com APS estruturada, equipes preparadas para gestão territorial qualificada e secretarias capazes de sustentar a continuidade institucional da Atenção Primária para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências assistenciais isoladas. <strong>É a arquitetura institucional da Atenção Primária como instrumento de governança territorial</strong> — articulando ESF, redes, indicadores, financiamento e cuidado integral em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de gestão da Atenção Primária à Saúde — articulando Estratégia Saúde da Família, redes de atenção primária, gestão territorial, indicadores assistenciais e modelos contemporâneos de cuidado aplicados à rotina dos municípios e das secretarias.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PROAPS+ é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a Atenção Primária à Saúde:</p>`,
    chips: [
      "Secretários municipais de saúde",
      "Coordenadores municipais de Atenção Primária",
      "Gerentes e responsáveis técnicos de unidades básicas",
      "Apoiadores institucionais e matriciadores",
      "Equipes de planejamento e monitoramento da APS",
      "Equipes de regulação e referência da rede",
      "Gestores de programas estratégicos da APS",
      "Quadros sucessórios das secretarias municipais",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Política e modelo institucional da APS",
        descricao: "Política Nacional de Atenção Básica, modelo brasileiro da APS, Estratégia Saúde da Família, referenciais institucionais e marco regulatório contemporâneo.",
      },
      {
        titulo: "Gestão territorial e redes de atenção primária",
        descricao: "Territorialização, planejamento territorial em saúde, redes de atenção primária, articulação intersetorial e gestão de equipamentos comunitários.",
      },
      {
        titulo: "Indicadores, financiamento e Previne Brasil",
        descricao: "Indicadores assistenciais da APS, financiamento federal contemporâneo (Previne Brasil), modelos de pagamento por desempenho e prestação de contas institucional.",
      },
      {
        titulo: "Cuidado integral e aplicação institucional",
        descricao: "Cuidado integral à pessoa, à família e à comunidade, integração assistencial e construção da matriz aplicada de gestão da APS para o município.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PROAPS+ é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Política Nacional de Atenção Básica e modelo brasileiro da APS",
        descricao: "Fundamentos institucionais da Política Nacional de Atenção Básica e modelo brasileiro contemporâneo da APS no SUS.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Estratégia Saúde da Família, equipes e modelos de organização",
        descricao: "Estratégia Saúde da Família como modelo estruturante da APS — equipes, organização do trabalho e modelos contemporâneos de implantação nas redes municipais.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Territorialização, planejamento territorial e gestão de equipamentos",
        descricao: "Territorialização da APS como ferramenta institucional de planejamento e gestão — articulando equipamentos, comunidade e cuidado.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Redes de atenção primária e articulação intersetorial",
        descricao: "Redes de atenção primária e articulação intersetorial — protocolos institucionais para integração da APS com a rede de atenção e com setores parceiros.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Indicadores assistenciais da APS e painéis institucionais",
        descricao: "Indicadores assistenciais da APS e construção de painéis institucionais — articulando dado, decisão e prestação de contas pública.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Financiamento federal contemporâneo da APS (Previne Brasil)",
        descricao: "Financiamento federal contemporâneo da APS — Previne Brasil, blocos de financiamento, pagamento por desempenho e prestação de contas institucional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Cuidado integral à pessoa, à família e à comunidade",
        descricao: "Cuidado integral à pessoa, à família e à comunidade — modelos institucionais contemporâneos do cuidado na APS brasileira.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROAPS+ da APS municipal",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão da Atenção Primária para o seu município de origem.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
    ],
  },
  detalhamento: {
    eyebrow: "Detalhamento",
    titulo: "O que cada módulo entrega",
    intro: "Cada módulo articula fundamentação técnica, casos aplicados e construção institucional — selecione abaixo para ver a ementa detalhada.",
    itens: [
      {
        numero: "I",
        titulo: "Política Nacional de Atenção Básica e modelo brasileiro da APS",
        cargaHoraria: "8h",
        descricao: "Fundamentos institucionais da Política Nacional de Atenção Básica e modelo brasileiro contemporâneo da APS no SUS.",
        topicos: [
          "Política Nacional de Atenção Básica vigente",
          "Modelo brasileiro da APS contemporânea",
          "Marcos regulatórios e referenciais institucionais",
          "Indicadores estruturais da APS no SUS",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Estratégia Saúde da Família, equipes e modelos de organização",
        cargaHoraria: "8h",
        descricao: "Estratégia Saúde da Família como modelo estruturante da APS — equipes, organização do trabalho e modelos contemporâneos de implantação nas redes municipais.",
        topicos: [
          "Estratégia Saúde da Família contemporânea",
          "Composição e organização das equipes da ESF",
          "Modelos contemporâneos de implantação e expansão",
          "Indicadores de cobertura e de processo da ESF",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Territorialização, planejamento territorial e gestão de equipamentos",
        cargaHoraria: "8h",
        descricao: "Territorialização da APS como ferramenta institucional de planejamento e gestão — articulando equipamentos, comunidade e cuidado.",
        topicos: [
          "Territorialização: conceito e aplicação institucional",
          "Planejamento territorial em saúde aplicado ao município",
          "Gestão de equipamentos comunitários e referenciais",
          "Cartografia territorial e diagnóstico participativo",
        ],
      },
      {
        numero: "IV",
        titulo: "Redes de atenção primária e articulação intersetorial",
        cargaHoraria: "8h",
        descricao: "Redes de atenção primária e articulação intersetorial — protocolos institucionais para integração da APS com a rede de atenção e com setores parceiros.",
        topicos: [
          "Redes de atenção primária no SUS contemporâneo",
          "Referência, contrarreferência e regulação assistencial",
          "Articulação intersetorial: educação, assistência social, segurança alimentar",
          "Modelos institucionais de integração territorial",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Indicadores assistenciais da APS e painéis institucionais",
        cargaHoraria: "8h",
        descricao: "Indicadores assistenciais da APS e construção de painéis institucionais — articulando dado, decisão e prestação de contas pública.",
        topicos: [
          "Indicadores assistenciais centrais da APS",
          "Painéis institucionais de governança da APS",
          "Cultura institucional de mensuração e accountability",
          "Uso pedagógico-gerencial dos indicadores da APS",
        ],
      },
      {
        numero: "VI",
        titulo: "Financiamento federal contemporâneo da APS (Previne Brasil)",
        cargaHoraria: "8h",
        descricao: "Financiamento federal contemporâneo da APS — Previne Brasil, blocos de financiamento, pagamento por desempenho e prestação de contas institucional.",
        topicos: [
          "Previne Brasil e modelo de pagamento por desempenho",
          "Blocos de financiamento da APS contemporâneos",
          "Planejamento orçamentário aplicado à APS municipal",
          "Prestação de contas pública e instrumentos de transparência",
        ],
      },
      {
        numero: "VII",
        titulo: "Cuidado integral à pessoa, à família e à comunidade",
        cargaHoraria: "8h",
        descricao: "Cuidado integral à pessoa, à família e à comunidade — modelos institucionais contemporâneos do cuidado na APS brasileira.",
        topicos: [
          "Cuidado integral: pessoa, família e comunidade",
          "Linhas de cuidado prioritárias na APS contemporânea",
          "Modelos institucionais de integração assistencial",
          "Indicadores de qualidade do cuidado integral",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROAPS+ da APS municipal",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão da Atenção Primária para o seu município de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PROAPS+",
          "Plano de aplicação da matriz no município de origem",
          "Encerramento e construção de comunidade de gestores da APS",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PROAPS+",
    tituloHtml: `O que a instituição <em>leva</em> do PROAPS+`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Política municipal de Atenção Primária estruturada e articulada à rede.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Estratégia Saúde da Família consolidada com equipes qualificadas.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Territorialização da rede e gestão de equipamentos comunitários implantada.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Painel institucional de indicadores assistenciais da APS.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Modelo de financiamento Previne Brasil institucionalizado no município.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de gestão da APS construída para a secretaria.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PROAPS+ uma referência",
    tituloHtml: `O que torna o PROAPS+ <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade da APS brasileira",
        descricao: "Estruturado a partir da prática real dos municípios brasileiros, sem importação acrítica de modelos privados ou de sistemas estrangeiros.",
      },
      {
        titulo: "Coordenação com trajetória executiva na APS",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias municipais de saúde, CONASEMS, MS e organismos especializados em APS.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de gestão da APS construída para o município do participante.",
      },
      {
        titulo: "Flexibilidade contratual",
        descricao: "Trilha completa, módulos avulsos, in company ou solução sob medida — adequando-se ao planejamento institucional.",
      },
      {
        titulo: "Plataforma EventOn NTC",
        descricao: "Módulos online com transmissão ao vivo, replay protegido e suporte técnico dedicado.",
      },
      {
        titulo: "Certificação institucional",
        descricao: "Certificado validável emitido pelo Instituto NTC do Brasil, modular ou consolidado da trilha completa.",
      },
    ],
  },
  docentes: {
    eyebrow: "Autoridade técnica",
    titulo: "Curadoria técnica em gestão da Atenção Primária à Saúde",
    tituloHtml: `Curadoria técnica em <em>gestão da Atenção Primária à Saúde</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PROAPS+ articula gestores municipais de saúde, especialistas em APS, Estratégia Saúde da Família, redes de atenção primária, financiamento e indicadores assistenciais para apoiar secretarias e equipes na governança qualificada da APS brasileira.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-saude.1920.webp`,
        imgAlt: "Coordenação científica · Política e gestão da APS",
        axisBadge: "Política e gestão da APS",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em política e gestão da Atenção Primária à Saúde, secretarias municipais de saúde, CONASEMS e formação executiva de quadros da APS.",
        eixo: "Política e gestão da APS",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Financiamento e indicadores da APS",
        axisBadge: "Financiamento e indicadores",
        nome: "Nome em validação institucional",
        credencial: "Atuação em financiamento federal da APS, Previne Brasil, indicadores assistenciais e modelos de pagamento por desempenho no SUS.",
        eixo: "Financiamento e indicadores",
        modulos: "V · VI",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Política Nacional de Atenção Básica",
        axisBadge: "Política da APS",
        nome: "Especialista convidado",
        credencial: "Política Nacional de Atenção Básica, modelo brasileiro da APS e marcos regulatórios contemporâneos do SUS.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Estratégia Saúde da Família",
        axisBadge: "Estratégia Saúde da Família",
        nome: "Especialista convidada",
        credencial: "Estratégia Saúde da Família, organização de equipes da ESF e modelos contemporâneos de implantação nas redes municipais.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Territorialização e planejamento territorial",
        axisBadge: "Territorialização",
        nome: "Especialista convidado",
        credencial: "Territorialização da APS, planejamento territorial em saúde e gestão de equipamentos comunitários nas redes brasileiras.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Redes de atenção primária",
        axisBadge: "Redes da APS",
        nome: "Especialista convidada",
        credencial: "Redes de atenção primária no SUS, referência e contrarreferência, articulação intersetorial e modelos institucionais de integração territorial.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Indicadores e painéis da APS",
        axisBadge: "Indicadores assistenciais",
        nome: "Especialista convidado",
        credencial: "Indicadores assistenciais centrais da APS, painéis institucionais de governança e cultura institucional de mensuração na rede.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Previne Brasil e financiamento da APS",
        axisBadge: "Previne Brasil",
        nome: "Especialista convidada",
        credencial: "Previne Brasil, modelo de pagamento por desempenho, blocos de financiamento contemporâneos e prestação de contas pública da APS.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Cuidado integral",
        axisBadge: "Cuidado integral",
        nome: "Especialista convidado",
        credencial: "Cuidado integral à pessoa, à família e à comunidade, linhas de cuidado prioritárias e modelos institucionais de integração assistencial.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Aplicação institucional e cultura da APS",
        axisBadge: "Cultura institucional da APS",
        nome: "Especialista convidada",
        credencial: "Construção de cultura institucional da APS, formação de equipes estratégicas e implantação de matrizes de gestão nos municípios.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos da APS" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PROAPS+ é organizada por competências da gestão da Atenção Primária à Saúde e pode variar conforme o perfil da turma, os desafios institucionais do município contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PROAPS+",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PROAPS+ é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias municipais de saúde, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PROAPS+ — política da APS, Estratégia Saúde da Família, territorialização, redes, indicadores, Previne Brasil, cuidado integral e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=proaps&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da secretaria. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a secretaria</h4>
    <p>Programa entregue exclusivamente à secretaria municipal de saúde ou ao consórcio público regional, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade do território e o perfil dos quadros executivos da APS.</p>
    <a class="cta" href="/contato?programa=proaps&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=proaps&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PROAPS+",
    tituloHtml: `Próximos módulos do <em>PROAPS+</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-saude.1920.webp`,
      dataLabel: { dias: "24–25", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário executivo · NTC Saúde",
      titulo: "Política Nacional de Atenção Básica e modelo brasileiro da APS",
      binding: "Porta de entrada · Módulo I do PROAPS+",
      metas: [
        "<strong>12h</strong> · 2 tardes",
        "Transmissão ao vivo · acesso institucional",
        "Replay protegido <strong>· EventOn NTC</strong>",
      ],
      ctaPrimario: "Inscrever-se",
      ctaSecundario: "Ver detalhes",
    },
    miniStack: [
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "30", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Estratégia Saúde da Família e organização das equipes da ESF",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "11", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Redes de atenção primária e articulação intersetorial",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "07–08", mesAno: "Out · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Previne Brasil e financiamento federal contemporâneo da APS",
        metaHtml: "Módulo <strong>VI</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PROAPS+ é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias municipais ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PROAPS+", href: "/agenda?programa=proaps", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=proaps&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PROAPS+?",
        resposta: "Sim. O PROAPS+ é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Política Nacional de Atenção Básica) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PROAPS+ é indicado para municípios pequenos?",
        resposta: "Sim. O programa é dimensionado para municípios de qualquer porte, com módulos aplicáveis à realidade das pequenas, médias e grandes secretarias municipais. Para contratação institucional dedicada ao perfil do município ou consórcio, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PROAPS+ pode ser entregue exclusivamente à secretaria municipal de saúde ou ao consórcio público regional, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade territorial e o perfil dos quadros executivos. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há modalidades de contratação compatíveis com o SUS?",
        resposta: "Sim. Atendemos órgãos do SUS por dispensa, inexigibilidade, Lei 14.133, convênio, contrato de programa e demais modalidades compatíveis com a realidade da saúde pública. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PROAPS++. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PROAPS+</em> para o seu município.",
    corpo: "Solicite proposta institucional para sua secretaria municipal de saúde ou consórcio público regional — trilha completa, módulos avulsos, in company ou solução sob medida.",
  },
  sidebar: {
    titulo: "Programa estratégico",
    rows: [
      { rotulo: "Vertical",     valor: "NTC Saúde" },
      { rotulo: "Estrutura",    valor: "8 módulos · 64h" },
      { rotulo: "Eixos",        valor: "4 eixos formativos" },
      { rotulo: "Modalidades",  valor: "Online · Presencial · Híbrido · In company" },
      { rotulo: "Status",       valor: "Módulos abertos" },
    ],
    entregasTitulo: "O programa entrega",
    entregas: [
      "8 módulos formativos sequenciais",
      "Política municipal da APS estruturada",
      "Estratégia Saúde da Família consolidada",
      "Painel institucional de indicadores da APS",
      "Matriz aplicada de gestão da APS",
      "Certificação institucional NTC",
    ],
  },
};
