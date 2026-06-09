import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const EDUTEC: ConteudoPrograma = {
  sigla: "EDUTEC",
  siglaCss: "EDUTEC",
  siglaExibida: "EDUTEC",
  slug: "edutec",
  nomeCompleto: "Educação Conectada, Inovação Pedagógica e Tecnologia em Sala de Aula",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "EDUTEC" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Educação Conectada, Inovação Pedagógica e <em>Tecnologia em Sala de Aula</em>`,
    sub: "Capacitação executiva para redes públicas brasileiras na transformação da prática pedagógica — articulando conectividade, ferramentas digitais educacionais, IA aplicada à sala de aula, formação docente digital e modelos institucionais de inovação pedagógica na educação básica.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=edutec", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=edutec&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Educação Conectada e Inovação Pedagógica" },
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
    titulo: "Um programa estratégico para a prática pedagógica digital nas redes públicas de educação.",
    tituloHtml: `Um programa estratégico para a <em>prática pedagógica digital</em> nas redes públicas de educação.`,
    corpoHtml: `<p class="lede-block">O EDUTEC articula educação conectada, ferramentas digitais educacionais, IA aplicada à sala de aula, formação docente digital e modelos institucionais de inovação pedagógica em um arco formativo de 8 módulos e 64 horas, dimensionado para escolas, formadores e equipes pedagógicas das redes estaduais e municipais.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a prática pedagógica digital — diretores escolares, coordenadores pedagógicos, formadores, supervisores, professores referência e equipes técnicas de inovação pedagógica — que precisam de <strong>repertório aplicado atualizado</strong>, <strong>metodologia para uso pedagógico de tecnologia</strong> e <strong>protocolos institucionais</strong> compatíveis com a Política Nacional de Educação Digital e com a realidade das escolas públicas brasileiras.</p>
<p>O EDUTEC não é um curso de informática básica nem um programa genérico de inovação. É um programa de transformação pedagógica aplicada — articulando conectividade, ferramentas digitais, IA generativa em sala de aula, formação continuada e cultura institucional de inovação em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de inovação pedagógica</strong>, construída pelos próprios participantes para sua escola ou rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A educação básica brasileira opera hoje em ambiente de transformação digital sem paralelo na sala de aula — IA generativa nas mãos dos estudantes, plataformas educacionais escaláveis, ferramentas digitais cada vez mais sofisticadas e expectativa social por inovação pedagógica institucionalmente sustentada. Escolas e redes precisam articular respostas pedagógicas estruturadas, formativas e replicáveis.</p>
<p>A maioria das redes convive simultaneamente com três pressões: conectividade desigual entre escolas, ausência de formação continuada estruturada para uso pedagógico de tecnologia e ausência de protocolos institucionais que articulem ferramenta, currículo e prática docente. Iniciativas pontuais de tecnologia, sem arquitetura pedagógica, não respondem ao desafio.</p>
<p>O EDUTEC responde a essa pressão construindo capacidade institucional avançada: escolas com prática pedagógica digital estruturada, equipes preparadas para uso responsável de IA em sala de aula e redes capazes de sustentar cultura institucional de inovação pedagógica para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a distribuição de equipamentos ou a adoção isolada de ferramentas. <strong>É a arquitetura institucional da prática pedagógica digital como instrumento de transformação educacional</strong> — articulando conectividade, ferramentas, currículo digital, formação e inovação em um sistema coerente, replicável e adequado à realidade das redes públicas brasileiras.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de prática pedagógica digital e inovação educacional na educação básica — articulando conectividade, ferramentas digitais, IA aplicada à sala de aula, formação docente digital e modelos institucionais de inovação pedagógica aplicados à rotina das escolas, formadores e quadros pedagógicos das redes.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O EDUTEC é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a prática pedagógica digital:</p>`,
    chips: [
      "Diretores escolares e coordenadores pedagógicos",
      "Supervisores e técnicos de inovação pedagógica",
      "Formadores e equipes de formação continuada",
      "Professores referência de uso pedagógico de tecnologia",
      "Coordenadores de tecnologia educacional das escolas",
      "Equipes técnicas de currículo digital",
      "Gestores de programas de inovação pedagógica",
      "Quadros sucessórios em prática docente digital",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Conectividade e ambientes digitais educacionais",
        descricao: "Conectividade nas escolas públicas, ambientes digitais de aprendizagem, infraestrutura mínima viável e modelos institucionais de educação conectada nas redes.",
      },
      {
        titulo: "Ferramentas digitais para a prática docente",
        descricao: "Curadoria institucional de ferramentas digitais educacionais, plataformas, aplicativos pedagógicos e modelos de integração entre ferramenta e prática docente.",
      },
      {
        titulo: "IA generativa aplicada à sala de aula",
        descricao: "Uso pedagógico responsável de inteligência artificial generativa na rotina docente e discente, protocolos institucionais e mediação crítica em sala de aula.",
      },
      {
        titulo: "Formação docente digital e inovação institucional",
        descricao: "Formação continuada de professores em cultura digital, trilhas formativas institucionais e modelos de inovação pedagógica replicáveis nas redes.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O EDUTEC é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Educação conectada: panorama institucional e arquitetura mínima viável nas escolas",
        descricao: "Panorama institucional da educação conectada no Brasil contemporâneo — Política Nacional de Educação Digital, arquitetura mínima viável de conectividade e modelos institucionais aplicáveis às redes.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Ambientes digitais de aprendizagem nas redes públicas brasileiras",
        descricao: "Ambientes digitais de aprendizagem como infraestrutura pedagógica institucional — articulando plataforma, currículo e prática docente.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Curadoria institucional de ferramentas digitais educacionais",
        descricao: "Curadoria institucional de ferramentas digitais educacionais — critérios, protocolos e modelos de integração à prática docente nas redes.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "IA generativa aplicada à prática docente: protocolos pedagógicos",
        descricao: "IA generativa aplicada à prática docente — protocolos pedagógicos institucionais para planejamento, avaliação e personalização da aprendizagem.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "IA generativa aplicada ao protagonismo do estudante e à mediação crítica",
        descricao: "IA generativa aplicada ao protagonismo do estudante — mediação crítica, ética e proteção da criança e do adolescente em ambientes mediados por IA.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Formação continuada docente em cultura digital: modelos institucionais",
        descricao: "Formação continuada docente em cultura digital — modelos institucionais aplicáveis às redes contemporâneas brasileiras, com letramento, prática e avaliação.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Inovação pedagógica institucional: do projeto-piloto à política de rede",
        descricao: "Inovação pedagógica institucional — protocolos para sustentação institucional de iniciativas, do projeto-piloto à política consolidada da rede.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz EDUTEC de inovação pedagógica",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inovação pedagógica para a sua escola ou rede de origem.",
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
        titulo: "Educação conectada: panorama institucional e arquitetura mínima viável nas escolas",
        cargaHoraria: "8h",
        descricao: "Panorama institucional da educação conectada no Brasil contemporâneo — Política Nacional de Educação Digital, arquitetura mínima viável de conectividade e modelos institucionais aplicáveis às redes.",
        topicos: [
          "Política Nacional de Educação Digital aplicada às redes",
          "Arquitetura mínima viável de conectividade nas escolas",
          "Modelos institucionais de educação conectada",
          "Indicadores de conectividade e inclusão digital escolar",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Ambientes digitais de aprendizagem nas redes públicas brasileiras",
        cargaHoraria: "8h",
        descricao: "Ambientes digitais de aprendizagem como infraestrutura pedagógica institucional — articulando plataforma, currículo e prática docente.",
        topicos: [
          "AVAs e plataformas educacionais contemporâneas",
          "Articulação entre plataforma, currículo e prática",
          "Modelos institucionais de adoção e governança",
          "Indicadores pedagógicos do ambiente digital",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Curadoria institucional de ferramentas digitais educacionais",
        cargaHoraria: "8h",
        descricao: "Curadoria institucional de ferramentas digitais educacionais — critérios, protocolos e modelos de integração à prática docente nas redes.",
        topicos: [
          "Critérios institucionais para curadoria de ferramentas",
          "Protocolos de avaliação pedagógica e técnica",
          "Integração entre ferramenta, currículo e prática docente",
          "Governança institucional do estoque de ferramentas",
        ],
      },
      {
        numero: "IV",
        titulo: "IA generativa aplicada à prática docente: protocolos pedagógicos",
        cargaHoraria: "8h",
        descricao: "IA generativa aplicada à prática docente — protocolos pedagógicos institucionais para planejamento, avaliação e personalização da aprendizagem.",
        topicos: [
          "IA generativa para apoio ao planejamento docente",
          "IA aplicada à elaboração de materiais didáticos",
          "IA na avaliação pedagógica e devolutiva qualificada",
          "Protocolos institucionais de uso responsável na prática docente",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "IA generativa aplicada ao protagonismo do estudante e à mediação crítica",
        cargaHoraria: "8h",
        descricao: "IA generativa aplicada ao protagonismo do estudante — mediação crítica, ética e proteção da criança e do adolescente em ambientes mediados por IA.",
        topicos: [
          "Mediação crítica do uso de IA pelo estudante",
          "Letramento em IA aplicado à educação básica",
          "Ética e proteção do estudante em ambientes com IA",
          "Articulação família-escola na cultura digital com IA",
        ],
      },
      {
        numero: "VI",
        titulo: "Formação continuada docente em cultura digital: modelos institucionais",
        cargaHoraria: "8h",
        descricao: "Formação continuada docente em cultura digital — modelos institucionais aplicáveis às redes contemporâneas brasileiras, com letramento, prática e avaliação.",
        topicos: [
          "Modelos contemporâneos de formação docente digital",
          "Trilhas formativas em prática pedagógica com tecnologia",
          "Comunidades de prática e formação entre pares",
          "Monitoramento institucional do impacto da formação",
        ],
      },
      {
        numero: "VII",
        titulo: "Inovação pedagógica institucional: do projeto-piloto à política de rede",
        cargaHoraria: "8h",
        descricao: "Inovação pedagógica institucional — protocolos para sustentação institucional de iniciativas, do projeto-piloto à política consolidada da rede.",
        topicos: [
          "Modelos institucionais de inovação pedagógica",
          "Do projeto-piloto à política de rede sustentada",
          "Cultura institucional de inovação na educação básica",
          "Indicadores e monitoramento da inovação pedagógica",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz EDUTEC de inovação pedagógica",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inovação pedagógica para a sua escola ou rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do EDUTEC",
          "Plano de aplicação da matriz na escola ou rede",
          "Encerramento e construção de comunidade de inovação",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do EDUTEC",
    tituloHtml: `O que a instituição <em>leva</em> do EDUTEC`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Educação conectada estruturada nas escolas da rede.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Ambientes digitais de aprendizagem articulados ao currículo.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Curadoria institucional de ferramentas digitais educacionais.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>IA generativa aplicada com protocolos pedagógicos responsáveis.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Formação continuada docente em cultura digital implantada.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de inovação pedagógica construída para a rede.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o EDUTEC uma referência",
    tituloHtml: `O que torna o EDUTEC <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade das escolas públicas brasileiras",
        descricao: "Estruturado a partir da prática real das escolas e redes brasileiras contemporâneas, com leitura crítica de modelos internacionais de educação digital.",
      },
      {
        titulo: "Coordenação com trajetória em prática pedagógica digital",
        descricao: "Coordenação científica e docentes com vivência aplicada em escolas, secretarias e organismos especializados em tecnologia educacional.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de inovação pedagógica construída para a escola ou rede do participante.",
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
    titulo: "Curadoria técnica em prática pedagógica digital",
    tituloHtml: `Curadoria técnica em <em>prática pedagógica digital</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O EDUTEC articula gestores educacionais, especialistas em educação conectada, ferramentas digitais, IA aplicada à educação, formação docente digital e inovação pedagógica institucional — apoiando escolas e redes na construção da prática pedagógica digital.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Educação conectada e prática pedagógica digital",
        axisBadge: "Prática pedagógica digital",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em educação conectada, IA na sala de aula e inovação pedagógica institucional nas redes públicas brasileiras.",
        eixo: "Educação conectada e inovação pedagógica",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Formação docente digital e cultura institucional",
        axisBadge: "Formação docente digital",
        nome: "Nome em validação institucional",
        credencial: "Atuação em formação continuada docente, cultura digital institucional e trilhas formativas em prática pedagógica com tecnologia.",
        eixo: "Formação docente digital",
        modulos: "VI · VII",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Educação conectada",
        axisBadge: "Educação conectada",
        nome: "Especialista convidado",
        credencial: "Política Nacional de Educação Digital, arquitetura de conectividade escolar e modelos institucionais aplicáveis às redes públicas.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Ambientes digitais de aprendizagem",
        axisBadge: "Ambientes digitais",
        nome: "Especialista convidada",
        credencial: "AVAs, plataformas educacionais, articulação entre plataforma, currículo e prática docente nas redes públicas.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Curadoria de ferramentas digitais",
        axisBadge: "Curadoria de ferramentas",
        nome: "Especialista convidado",
        credencial: "Curadoria institucional de ferramentas digitais educacionais, critérios de avaliação pedagógica e técnica.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · IA aplicada à prática docente",
        axisBadge: "IA na prática docente",
        nome: "Especialista convidada",
        credencial: "IA generativa aplicada ao planejamento docente, materiais didáticos e avaliação pedagógica nas redes públicas.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · IA e protagonismo estudantil",
        axisBadge: "IA e protagonismo",
        nome: "Especialista convidado",
        credencial: "Mediação crítica do uso de IA pelos estudantes, letramento em IA na educação básica e proteção da criança e do adolescente.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Formação continuada docente digital",
        axisBadge: "Formação digital docente",
        nome: "Especialista convidada",
        credencial: "Formação continuada docente em cultura digital, trilhas formativas e comunidades de prática entre pares.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Inovação pedagógica institucional",
        axisBadge: "Inovação pedagógica",
        nome: "Especialista convidado",
        credencial: "Inovação pedagógica institucional, do projeto-piloto à política de rede sustentada nas escolas públicas brasileiras.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Cultura institucional e direção pedagógica",
        axisBadge: "Cultura institucional",
        nome: "Especialista convidada",
        credencial: "Construção de cultura institucional de inovação na educação básica e formação de equipes pedagógicas estratégicas.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos pedagógicos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do EDUTEC é organizada por competências da prática pedagógica digital e pode variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o EDUTEC",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O EDUTEC é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para escolas, secretarias ou redes, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do EDUTEC — conectividade, ambientes digitais, curadoria de ferramentas, IA na prática docente, IA e protagonismo estudantil, formação digital docente, inovação pedagógica e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=edutec&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da escola/secretaria. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para escola, secretaria ou rede</h4>
    <p>Programa entregue exclusivamente à instituição contratante — escola, secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade da rede e o perfil dos profissionais.</p>
    <a class="cta" href="/contato?programa=edutec&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=edutec&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do EDUTEC",
    tituloHtml: `Próximos módulos do <em>EDUTEC</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "19–20", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Educação conectada — panorama institucional e arquitetura mínima viável",
      binding: "Porta de entrada · Módulo I do EDUTEC",
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
        dataLabel: { dias: "22", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "IA generativa aplicada à prática docente: protocolos pedagógicos",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "5", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Ambientes digitais de aprendizagem nas redes públicas",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "23–24", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Formação continuada docente em cultura digital: modelos institucionais",
        metaHtml: "Módulo <strong>VI</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do EDUTEC é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para escolas e secretarias ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do EDUTEC", href: "/agenda?programa=edutec", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=edutec&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do EDUTEC?",
        resposta: "Sim. O EDUTEC é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura pedagógica integrada. Recomendamos o Módulo I (Educação conectada) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "Qual a diferença entre EDUTEC e EGIDE?",
        resposta: "O EDUTEC opera no nível pedagógico — escola, sala de aula, prática docente, uso de ferramentas digitais e IA na rotina pedagógica. O EGIDE opera no nível institucional — governança de dados pedagógicos, política de IA educacional, LGPD educacional e arquitetura institucional da transformação digital da rede. São complementares: EDUTEC é para professores e equipes pedagógicas, EGIDE é para secretarias e direção institucional.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O EDUTEC pode ser entregue exclusivamente à escola, secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil dos profissionais. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha EDUTEC. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>EDUTEC</em> para a sua escola ou rede.",
    corpo: "Solicite proposta institucional para sua escola, secretaria estadual ou municipal de educação — trilha completa, módulos avulsos, in company ou solução sob medida.",
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
      "Arquitetura de educação conectada na rede",
      "Curadoria de ferramentas digitais educacionais",
      "Protocolos pedagógicos para IA em sala de aula",
      "Matriz aplicada de inovação pedagógica",
      "Certificação institucional NTC",
    ],
  },
};
