import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const EGIDE: ConteudoPrograma = {
  sigla: "EGIDE",
  siglaCss: "EGIDE",
  siglaExibida: "EGIDE",
  slug: "egide",
  nomeCompleto: "Programa de Governança Digital, IA Educacional e Cultura de Dados nas Redes Públicas",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "EGIDE" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Governança Digital, IA Educacional e Cultura de <em>Dados</em> nas Redes Públicas`,
    sub: "Capacitação executiva para secretarias e equipes de educação na arquitetura institucional da transformação digital — articulando governança de dados pedagógicos, inteligência artificial aplicada à aprendizagem, plataformas educacionais públicas e protocolos de proteção, ética e equidade digital nas redes estaduais e municipais.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=egide", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=egide&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Governança Digital e IA Educacional" },
    { rotulo: "Estrutura",     valor: "8 módulos",        valorSub: "8 horas por módulo" },
    { rotulo: "Carga horária", valor: "64 horas",         valorSub: "Total do programa" },
    { rotulo: "Modalidades",   valor: "Híbrido",          valorSub: "Online · Presencial · In company" },
    { rotulo: "Status",        valor: "Módulos abertos",  valorSub: "Inscrições ativas" },
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
    titulo: "Um programa estratégico para a governança digital das redes públicas de educação.",
    tituloHtml: `Um programa estratégico para a <em>governança digital</em> das redes públicas de educação.`,
    corpoHtml: `<p class="lede-block">O EGIDE articula governança de dados pedagógicos, inteligência artificial aplicada à aprendizagem, plataformas educacionais públicas e proteção institucional em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias estaduais e municipais de educação, equipes pedagógicas, áreas de tecnologia educacional e quadros executivos das redes.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a transformação digital das redes — secretários e secretários-adjuntos de educação, superintendentes pedagógicos, diretores de tecnologia educacional, coordenadores de currículo e equipes técnicas de dados, plataformas e formação digital — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada à governança de IA educacional</strong> e <strong>protocolos institucionais</strong> compatíveis com a LGPD, a Política Nacional de Educação Digital e os marcos contemporâneos de proteção de crianças e adolescentes.</p>
<p>O EGIDE não é um curso de tecnologia educacional isolado nem um programa genérico de inovação. É um programa de governança institucional da transformação digital — articulando dados, IA, plataformas, currículo digital, formação docente e proteção em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de governança digital educacional</strong>, construída pelos próprios participantes para sua rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A educação básica brasileira opera hoje em ambiente de aceleração digital sem paralelo — Política Nacional de Educação Digital (PNED), inteligência artificial generativa nas redes, plataformas educacionais escaláveis, LGPD aplicada à educação e dados pedagógicos como ativo institucional crítico. Secretarias estaduais e municipais precisam articular respostas estruturadas, éticas e institucionalmente defensáveis.</p>
<p>A maioria das redes convive simultaneamente com três pressões: ausência de política institucional de dados pedagógicos, ausência de governança qualificada de IA aplicada à aprendizagem e ausência de protocolos institucionais que articulem currículo digital, formação docente e proteção do estudante. Iniciativas isoladas de tecnologia, sem arquitetura institucional, não respondem ao desafio.</p>
<p>O EGIDE responde a essa pressão construindo capacidade institucional avançada: redes com política de dados pedagógicos estruturada, equipes preparadas para governança qualificada de IA educacional e protocolos institucionais que sustentam a transformação digital com ética, equidade e proteção das crianças e adolescentes.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de ferramentas ou plataformas isoladas. <strong>É a arquitetura institucional da transformação digital educacional como instrumento de governança</strong> — articulando dados, IA, plataformas, currículo, formação e proteção em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de governança digital, IA e cultura de dados na educação básica — articulando arquitetura de dados pedagógicos, IA aplicada à aprendizagem, plataformas educacionais públicas, formação docente digital e protocolos de proteção institucional aplicados à rotina das secretarias e dos quadros executivos das redes.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O EGIDE é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a transformação digital das redes:</p>`,
    chips: [
      "Secretários e secretários-adjuntos de educação",
      "Diretores de tecnologia educacional",
      "Coordenadores de currículo e plataformas",
      "Encarregados de dados (DPO) das secretarias",
      "Equipes técnicas de dados educacionais",
      "Formadores e equipes de formação digital docente",
      "Gestores de programas estaduais e municipais de educação digital",
      "Quadros sucessórios das áreas digitais",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Governança de dados pedagógicos",
        descricao: "Política institucional de dados pedagógicos, arquitetura de coleta, padronização, interoperabilidade e proteção da informação educacional na perspectiva das redes públicas.",
      },
      {
        titulo: "IA aplicada à aprendizagem",
        descricao: "Uso institucional de inteligência artificial generativa e adaptativa em educação básica, governança de IA pedagógica, mitigação de vieses e protocolos de aplicação responsável.",
      },
      {
        titulo: "Plataformas, currículo e formação digital",
        descricao: "Plataformas educacionais públicas, currículo digital articulado à BNCC, materiais didáticos digitais, formação continuada docente na cultura digital e letramento institucional.",
      },
      {
        titulo: "Proteção, ética e equidade digital",
        descricao: "LGPD aplicada à educação, proteção de crianças e adolescentes no ambiente digital, equidade no acesso à tecnologia e protocolos institucionais de cidadania digital.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O EGIDE é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Governança de dados pedagógicos: arquitetura institucional para redes públicas",
        descricao: "Fundamentos institucionais da governança de dados pedagógicos na educação básica brasileira contemporânea — política, arquitetura e proteção.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Interoperabilidade, indicadores educacionais e cultura de dados",
        descricao: "Interoperabilidade entre sistemas das redes, indicadores educacionais estratégicos e construção de uma cultura institucional baseada em dados.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "IA educacional contemporânea: usos pedagógicos, riscos e governança",
        descricao: "Panorama institucional da IA aplicada à educação contemporânea — usos pedagógicos, riscos, vieses e modelos consolidados de governança.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Aplicação responsável de IA generativa em sala de aula e na gestão da rede",
        descricao: "IA generativa aplicada com responsabilidade institucional — protocolos de uso pedagógico e protocolos de uso administrativo nas redes.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Plataformas educacionais públicas e currículo digital articulado à BNCC",
        descricao: "Plataformas educacionais públicas, currículo digital articulado à BNCC e materiais didáticos digitais como infraestrutura institucional da aprendizagem.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Formação digital docente e cultura institucional da transformação digital",
        descricao: "Formação continuada docente em cultura digital — modelos institucionais aplicáveis às redes contemporâneas, com letramento, prática e avaliação.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "LGPD aplicada à educação e proteção de crianças e adolescentes",
        descricao: "LGPD aplicada à educação contemporânea, proteção da criança e do adolescente no ambiente digital e equidade no acesso à tecnologia educacional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz EGIDE de governança digital",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de governança digital educacional para a sua rede de origem.",
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
        titulo: "Governança de dados pedagógicos: arquitetura institucional para redes públicas",
        cargaHoraria: "8h",
        descricao: "Fundamentos institucionais da governança de dados pedagógicos na educação básica brasileira contemporânea — política, arquitetura e proteção.",
        topicos: [
          "Política institucional de dados pedagógicos nas redes",
          "Arquitetura de coleta, integração e curadoria de dados educacionais",
          "Padronização e interoperabilidade entre sistemas da rede",
          "Indicadores institucionais e prestação de contas pública",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Interoperabilidade, indicadores educacionais e cultura de dados",
        cargaHoraria: "8h",
        descricao: "Interoperabilidade entre sistemas das redes, indicadores educacionais estratégicos e construção de uma cultura institucional baseada em dados.",
        topicos: [
          "Modelos de interoperabilidade entre sistemas educacionais",
          "Indicadores pedagógicos e painéis institucionais",
          "Cultura institucional de dados nas secretarias",
          "Uso pedagógico e gerencial dos dados educacionais",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "IA educacional contemporânea: usos pedagógicos, riscos e governança",
        cargaHoraria: "8h",
        descricao: "Panorama institucional da IA aplicada à educação contemporânea — usos pedagógicos, riscos, vieses e modelos consolidados de governança.",
        topicos: [
          "IA aplicada à educação básica: panorama contemporâneo",
          "Riscos institucionais, vieses e dilemas éticos da IA na sala de aula",
          "Modelos internacionais e nacionais de governança de IA educacional",
          "Marco legal e regulatório aplicável à IA na educação pública",
        ],
      },
      {
        numero: "IV",
        titulo: "Aplicação responsável de IA generativa em sala de aula e na gestão da rede",
        cargaHoraria: "8h",
        descricao: "IA generativa aplicada com responsabilidade institucional — protocolos de uso pedagógico e protocolos de uso administrativo nas redes.",
        topicos: [
          "IA generativa para apoio à prática docente em sala de aula",
          "IA generativa para apoio à gestão pedagógica da rede",
          "Protocolos institucionais de uso responsável",
          "Avaliação contínua de impacto e segurança institucional",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Plataformas educacionais públicas e currículo digital articulado à BNCC",
        cargaHoraria: "8h",
        descricao: "Plataformas educacionais públicas, currículo digital articulado à BNCC e materiais didáticos digitais como infraestrutura institucional da aprendizagem.",
        topicos: [
          "Plataformas educacionais públicas contemporâneas",
          "Currículo digital articulado à BNCC e ao território da rede",
          "Materiais didáticos digitais e licenciamento aberto (REA)",
          "Modelos institucionais de adoção de plataformas pelas redes",
        ],
      },
      {
        numero: "VI",
        titulo: "Formação digital docente e cultura institucional da transformação digital",
        cargaHoraria: "8h",
        descricao: "Formação continuada docente em cultura digital — modelos institucionais aplicáveis às redes contemporâneas, com letramento, prática e avaliação.",
        topicos: [
          "Modelos de formação digital docente nas redes públicas",
          "Letramento digital institucional e cultura da transformação",
          "Trilhas formativas em IA aplicada à prática docente",
          "Monitoramento de impacto da formação digital",
        ],
      },
      {
        numero: "VII",
        titulo: "LGPD aplicada à educação e proteção de crianças e adolescentes",
        cargaHoraria: "8h",
        descricao: "LGPD aplicada à educação contemporânea, proteção da criança e do adolescente no ambiente digital e equidade no acesso à tecnologia educacional.",
        topicos: [
          "LGPD aplicada à educação básica brasileira",
          "ECA, marcos legais e proteção digital de crianças e adolescentes",
          "Equidade no acesso à tecnologia educacional",
          "Cidadania digital institucionalizada nas redes",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz EGIDE de governança digital",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de governança digital educacional para a sua rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do EGIDE",
          "Plano de aplicação da matriz na rede de origem",
          "Encerramento e construção de comunidade de governança digital",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do EGIDE",
    tituloHtml: `O que a instituição <em>leva</em> do EGIDE`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Política institucional de dados pedagógicos estruturada na rede.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Governança qualificada de IA educacional institucionalizada.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Plataformas educacionais articuladas ao currículo da rede.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Formação continuada docente em cultura digital implantada.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Protocolos institucionais de LGPD e proteção digital aplicados.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de governança digital construída para a rede.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o EGIDE uma referência",
    tituloHtml: `O que torna o EGIDE <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade das redes públicas brasileiras",
        descricao: "Estruturado a partir da prática real das redes estaduais e municipais brasileiras, com leitura crítica dos modelos internacionais de IA educacional.",
      },
      {
        titulo: "Coordenação com trajetória executiva em educação digital",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias, MEC, organismos internacionais e referência em governança de dados educacionais.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de governança digital construída para a rede do participante.",
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
    titulo: "Curadoria técnica para a transformação digital das redes",
    tituloHtml: `Curadoria técnica para a <em>transformação digital das redes</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O EGIDE articula gestores educacionais, especialistas em dados pedagógicos, IA aplicada à educação, plataformas, formação digital docente e proteção da criança e do adolescente no ambiente digital — apoiando redes e equipes na construção institucional da governança digital.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Governança de dados pedagógicos e IA educacional",
        axisBadge: "Governança digital educacional",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em governança de dados pedagógicos, IA educacional e transformação digital de redes públicas brasileiras.",
        eixo: "Dados, IA e governança digital",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Plataformas, currículo e formação digital docente",
        axisBadge: "Plataformas e formação",
        nome: "Nome em validação institucional",
        credencial: "Atuação em plataformas educacionais públicas, currículo digital articulado à BNCC e formação continuada docente em cultura digital.",
        eixo: "Plataformas, currículo e formação",
        modulos: "V · VI",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Política institucional de dados pedagógicos",
        axisBadge: "Dados pedagógicos",
        nome: "Especialista convidado",
        credencial: "Política institucional de dados pedagógicos, arquitetura de coleta e indicadores educacionais aplicados às redes públicas.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Interoperabilidade e cultura de dados",
        axisBadge: "Interoperabilidade",
        nome: "Especialista convidada",
        credencial: "Interoperabilidade entre sistemas das redes públicas, modelos contemporâneos de integração e cultura institucional de dados.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · IA aplicada à educação",
        axisBadge: "IA educacional",
        nome: "Especialista convidado",
        credencial: "IA aplicada à educação básica, panorama contemporâneo, vieses e modelos institucionais de governança da IA pedagógica.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · IA generativa em prática docente",
        axisBadge: "IA generativa",
        nome: "Especialista convidada",
        credencial: "IA generativa aplicada à prática docente e à gestão pedagógica, protocolos institucionais de uso responsável nas redes públicas.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Plataformas e currículo digital",
        axisBadge: "Plataformas e currículo",
        nome: "Especialista convidado",
        credencial: "Plataformas educacionais públicas, currículo digital articulado à BNCC e materiais didáticos digitais para as redes.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Formação continuada docente digital",
        axisBadge: "Formação digital docente",
        nome: "Especialista convidada",
        credencial: "Formação continuada docente em cultura digital, letramento institucional e trilhas formativas em IA aplicada à prática docente.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · LGPD educacional e proteção digital",
        axisBadge: "LGPD educacional",
        nome: "Especialista convidado",
        credencial: "LGPD aplicada à educação, proteção da criança e do adolescente no ambiente digital e equidade no acesso à tecnologia.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Governança institucional e cultura digital",
        axisBadge: "Governança e cultura digital",
        nome: "Especialista convidada",
        credencial: "Governança institucional da transformação digital, formação de equipes estratégicas e construção de cultura digital nas redes.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos digitais" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do EGIDE é organizada por competências da governança digital educacional e pode variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o EGIDE",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O EGIDE é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do EGIDE — dados pedagógicos, interoperabilidade, IA educacional, IA generativa aplicada, plataformas, formação digital docente, LGPD educacional e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=egide&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a maturidade digital da rede e o perfil das equipes executivas.</p>
    <a class="cta" href="/contato?programa=egide&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=egide&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do EGIDE",
    tituloHtml: `Próximos módulos do <em>EGIDE</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "12–13", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Governança de dados pedagógicos — arquitetura institucional para redes públicas",
      binding: "Porta de entrada · Módulo I do EGIDE",
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
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "14", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Interoperabilidade, indicadores educacionais e cultura de dados",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "26", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "IA generativa aplicada à prática docente e à gestão da rede",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "16–17", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "IA educacional contemporânea: usos, riscos e governança",
        metaHtml: "Módulo <strong>III</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do EGIDE é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias de educação ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do EGIDE", href: "/agenda?programa=egide", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=egide&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do EGIDE?",
        resposta: "Sim. O EGIDE é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Governança de dados pedagógicos) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O EGIDE atende às exigências da LGPD aplicada à educação?",
        resposta: "Sim. O Módulo VII é estruturado integralmente sobre LGPD aplicada à educação básica, proteção de crianças e adolescentes no ambiente digital e equidade no acesso à tecnologia educacional, com aplicação prática para secretarias estaduais e municipais.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O EGIDE pode ser entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a maturidade digital da rede e o perfil dos quadros executivos. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha EGIDE. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>EGIDE</em> para a sua rede.",
    corpo: "Solicite proposta institucional para sua secretaria estadual ou municipal de educação — trilha completa, módulos avulsos, in company ou solução sob medida.",
  },
  sidebar: {
    titulo: "Programa estratégico",
    rows: [
      { rotulo: "Vertical",     valor: "NTC Educação" },
      { rotulo: "Estrutura",    valor: "8 módulos · 64h" },
      { rotulo: "Eixos",        valor: "4 eixos formativos" },
      { rotulo: "Modalidades",  valor: "Online · Presencial · Híbrido · In company" },
      { rotulo: "Status",       valor: "Módulos abertos" },
    ],
    entregasTitulo: "O programa entrega",
    entregas: [
      "8 módulos formativos sequenciais",
      "Política institucional de dados pedagógicos",
      "Governança de IA aplicada à aprendizagem",
      "Protocolos institucionais de LGPD educacional",
      "Matriz aplicada de governança digital",
      "Certificação institucional NTC",
    ],
  },
};
