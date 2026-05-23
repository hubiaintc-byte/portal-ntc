import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PROSUS: ConteudoPrograma = {
  sigla: "PROSUS+",
  siglaCss: "PROSUS",
  siglaExibida: "PROSUS+",
  slug: "prosus",
  nomeCompleto: "Programa Avançado de Direção Institucional em Saúde Pública",
  vertical: "saude",
  verticalRotulo: "NTC Saúde",
  breadcrumb: { current: "PROSUS+" },
  hero: {
    bgSrc: `${IMG}/area-saude.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa Avançado de Direção Institucional em <em>Saúde Pública</em>`,
    sub: "Capacitação executiva para gestores, secretários e lideranças com responsabilidade direta sobre a direção institucional do SUS — articulando liderança em saúde pública, decisão estratégica, governança, performance e articulação política aplicada à alta gestão das secretarias e órgãos do sistema.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=prosus", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=prosus&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Saúde",          valorSub: "Direção Institucional em Saúde Pública" },
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
    titulo: "Um programa estratégico para a direção institucional do SUS brasileiro.",
    tituloHtml: `Um programa estratégico para a <em>direção institucional</em> do SUS brasileiro.`,
    corpoHtml: `<p class="lede-block">O PROSUS+ articula liderança em saúde pública contemporânea, direção estratégica, governança institucional, performance e articulação política em um arco formativo de 8 módulos e 64 horas, dimensionado para gestores que ocupam — ou são preparados para ocupar — posições de direção nas secretarias e órgãos do SUS.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a direção institucional do SUS — secretários e secretários-adjuntos de saúde, superintendentes, diretores executivos, presidentes de fundações estaduais de saúde, gestores de autarquias do sistema e coordenadores de áreas estratégicas — que precisam de <strong>repertório executivo atualizado</strong>, <strong>metodologia aplicada à decisão pública em saúde</strong> e <strong>protocolos institucionais</strong> que conversem com a complexidade real da gestão do SUS brasileiro contemporâneo.</p>
<p>O PROSUS+ não é um curso de gestão hospitalar nem um programa genérico de liderança aplicada à saúde. É um programa de direção estratégica em saúde pública — articulando visão institucional do SUS, decisão baseada em evidências, gestão de pessoas, performance e articulação política em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de direção institucional em saúde</strong>, construída pelos próprios participantes para a sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A direção institucional do SUS brasileiro opera em ambiente de complexidade crescente — pactuação interfederativa, sub-financiamento crônico, regionalização incompleta, judicialização da saúde, transição demográfica e epidemiológica, e expectativa social por resultados verificáveis. Cargos de direção no SUS exigem hoje uma combinação rara de visão sistêmica, capacidade técnica e habilidade institucional.</p>
<p>A maioria das instituições do SUS convive simultaneamente com três pressões: rotatividade de quadros estratégicos, decisões cada vez mais complexas com janelas mais curtas e expectativa social por performance mensurável. Programas de liderança comportamental abstrata, sem ancoragem no SUS, perdem o ponto.</p>
<p>O PROSUS+ responde a essa pressão construindo capacidade institucional avançada: lideranças que dirigem secretarias e órgãos com método, instituições do SUS que operam com cultura de performance documentada e quadros estratégicos preparados para sustentar a continuidade institucional do sistema para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências genéricas de liderança. <strong>É a arquitetura institucional da direção pública em saúde como instrumento de governança</strong> — articulando visão estratégica do SUS, decisão baseada em evidências, gestão de pessoas, performance e articulação política em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de liderança e direção estratégica em saúde pública — articulando visão institucional do SUS, decisão baseada em evidências, gestão de pessoas e cultura de performance verificável aplicadas à rotina das posições de direção nas secretarias e órgãos do sistema.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PROSUS+ é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a direção institucional do SUS:</p>`,
    chips: [
      "Secretários e secretários-adjuntos estaduais de saúde",
      "Secretários e secretários-adjuntos municipais de saúde",
      "Superintendentes e diretores executivos de secretarias",
      "Presidentes e diretores de fundações estaduais de saúde",
      "Gestores de autarquias e órgãos do SUS",
      "Coordenadores de áreas estratégicas em saúde pública",
      "Equipes de planejamento e gestão estratégica do SUS",
      "Quadros sucessórios das secretarias e órgãos",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Liderança em saúde pública contemporânea",
        descricao: "Fundamentos contemporâneos de liderança aplicada ao SUS, modelos de direção institucional em saúde e referenciais consolidados para a tomada de posição em cargos estratégicos do sistema.",
      },
      {
        titulo: "Direção estratégica e decisão no SUS",
        descricao: "Construção da visão institucional para o cargo de direção em saúde, metodologias de decisão baseada em evidências, planejamento estratégico aplicado ao SUS e articulação entre direção, áreas técnicas e equipes.",
      },
      {
        titulo: "Governança, performance e accountability em saúde",
        descricao: "Governança institucional do SUS, indicadores estratégicos em saúde pública, painéis de governança e modelos de accountability aplicáveis à direção em saúde.",
      },
      {
        titulo: "Articulação política-institucional e aplicação",
        descricao: "Comunicação executiva, articulação com Legislativo, Judiciário e órgãos de controle, gestão de crise em saúde e construção da matriz aplicada de direção institucional.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PROSUS+ é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Liderança em saúde pública contemporânea: fundamentos para a direção do SUS",
        descricao: "Fundamentos contemporâneos de liderança aplicada à direção do SUS, com leitura crítica de modelos consolidados e referenciais nacionais e internacionais.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Direção estratégica e construção da visão institucional em saúde",
        descricao: "Construção da visão institucional como instrumento de direção em saúde pública — articulando diagnóstico, prioridades e arquitetura de implementação no SUS.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Decisão baseada em evidências aplicada ao SUS",
        descricao: "Metodologias de decisão baseada em evidências aplicadas à rotina do cargo de direção no SUS — articulando dados, contexto e responsabilidade institucional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Gestão de pessoas e equipes de alta performance em saúde pública",
        descricao: "Construção e direção de equipes de alta performance no SUS, com foco em cultura organizacional, gestão de talentos e formação de quadros sucessórios.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Governança institucional e performance estratégica no SUS",
        descricao: "Governança institucional do SUS e construção de sistemas de performance — indicadores estratégicos, painéis de governança e accountability aplicáveis à direção em saúde.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Articulação política, comunicação executiva e gestão de crise em saúde",
        descricao: "Comunicação executiva, articulação política e relacionamento institucional aplicados à direção em saúde pública contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Direção em cenários de complexidade e judicialização da saúde",
        descricao: "Direção em ambientes de complexidade e judicialização da saúde — protocolos, decisão sob pressão e proteção da continuidade institucional do SUS.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROSUS+ de direção institucional",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de direção institucional em saúde para a sua instituição de origem.",
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
        titulo: "Liderança em saúde pública contemporânea: fundamentos para a direção do SUS",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos de liderança aplicada à direção do SUS, com leitura crítica de modelos consolidados e referenciais nacionais e internacionais.",
        topicos: [
          "Modelos contemporâneos de liderança em saúde pública",
          "Diferenças entre liderança política, técnica e institucional no SUS",
          "Repertório executivo do cargo de direção em saúde",
          "Autoconhecimento de estilo de direção e pontos de atenção",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Direção estratégica e construção da visão institucional em saúde",
        cargaHoraria: "8h",
        descricao: "Construção da visão institucional como instrumento de direção em saúde pública — articulando diagnóstico, prioridades e arquitetura de implementação no SUS.",
        topicos: [
          "Diagnóstico institucional rápido e dirigido em saúde",
          "Construção de visão estratégica para o cargo de direção no SUS",
          "Definição de prioridades sob restrição orçamentária da saúde",
          "Articulação entre visão, planejamento e execução em saúde",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Decisão baseada em evidências aplicada ao SUS",
        cargaHoraria: "8h",
        descricao: "Metodologias de decisão baseada em evidências aplicadas à rotina do cargo de direção no SUS — articulando dados, contexto e responsabilidade institucional.",
        topicos: [
          "Metodologias de decisão pública aplicadas à saúde",
          "Uso de evidências, dados e indicadores na decisão em saúde",
          "Decisão em ambientes de incerteza no SUS",
          "Articulação entre direção e áreas técnicas",
        ],
      },
      {
        numero: "IV",
        titulo: "Gestão de pessoas e equipes de alta performance em saúde pública",
        cargaHoraria: "8h",
        descricao: "Construção e direção de equipes de alta performance no SUS, com foco em cultura organizacional, gestão de talentos e formação de quadros sucessórios.",
        topicos: [
          "Diagnóstico e construção de equipes estratégicas no SUS",
          "Cultura organizacional aplicada à Administração em saúde",
          "Gestão de talentos, sucessão e desenvolvimento de equipes",
          "Liderança de equipes em ambientes públicos complexos",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Governança institucional e performance estratégica no SUS",
        cargaHoraria: "8h",
        descricao: "Governança institucional do SUS e construção de sistemas de performance — indicadores estratégicos, painéis de governança e accountability aplicáveis à direção em saúde.",
        topicos: [
          "Governança institucional contemporânea no SUS",
          "Indicadores estratégicos do cargo de direção em saúde",
          "Painéis institucionais de governança e acompanhamento",
          "Cultura de performance e accountability na saúde pública",
        ],
      },
      {
        numero: "VI",
        titulo: "Articulação política, comunicação executiva e gestão de crise em saúde",
        cargaHoraria: "8h",
        descricao: "Comunicação executiva, articulação política e relacionamento institucional aplicados à direção em saúde pública contemporânea.",
        topicos: [
          "Comunicação executiva aplicada à direção em saúde",
          "Articulação com Legislativo, Judiciário e órgãos de controle",
          "Gestão de crise em saúde pública e protocolos institucionais",
          "Relacionamento com imprensa, sociedade civil e conselhos",
        ],
      },
      {
        numero: "VII",
        titulo: "Direção em cenários de complexidade e judicialização da saúde",
        cargaHoraria: "8h",
        descricao: "Direção em ambientes de complexidade e judicialização da saúde — protocolos, decisão sob pressão e proteção da continuidade institucional do SUS.",
        topicos: [
          "Mapeamento institucional de cenários de complexidade em saúde",
          "Judicialização da saúde: leitura institucional e direção",
          "Decisão sob pressão e janelas críticas no SUS",
          "Proteção da continuidade institucional em crises de saúde",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROSUS+ de direção institucional",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de direção institucional em saúde para a sua instituição de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PROSUS+",
          "Plano de aplicação da matriz na rotina do cargo de direção",
          "Encerramento e construção de comunidade de lideranças em saúde",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PROSUS+",
    tituloHtml: `O que a instituição <em>leva</em> do PROSUS+`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Capacidade institucional de direção estratégica em saúde fortalecida.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Tomada de decisão pública em saúde estruturada em evidências.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Cultura de performance e accountability instalada nas áreas estratégicas.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Equipes de alta performance estruturadas no SUS.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores estratégicos da direção em saúde.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de direção institucional em saúde construída para a instituição.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PROSUS+ uma referência",
    tituloHtml: `O que torna o PROSUS+ <em>uma referência</em>`,
    itens: [
      {
        titulo: "Direção aplicada à realidade do SUS brasileiro",
        descricao: "Programa estruturado a partir da prática real da direção pública em saúde no Brasil, sem importação acrítica de modelos estrangeiros.",
      },
      {
        titulo: "Coordenação com trajetória executiva em saúde pública",
        descricao: "Coordenação científica e docentes com vivência aplicada em cargos de direção em secretarias estaduais e municipais de saúde, MS, CONASS, CONASEMS e fundações estaduais.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de direção institucional em saúde construída para a instituição do participante.",
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
    titulo: "Lideranças e especialistas para a alta gestão do SUS",
    tituloHtml: `Lideranças e especialistas para a <em>alta gestão do SUS</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PROSUS+ articula gestores públicos da saúde, especialistas em liderança, governança, estratégia, comunicação, performance e direção institucional em saúde pública — apoiando dirigentes e equipes na condução de secretarias e órgãos do SUS.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-saude.1920.webp`,
        imgAlt: "Coordenação científica · Liderança em saúde pública e direção do SUS",
        axisBadge: "Liderança no SUS",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em direção de secretarias estaduais e municipais de saúde, MS, CONASS e formação executiva de dirigentes do SUS.",
        eixo: "Direção estratégica em saúde",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Governança e performance no SUS",
        axisBadge: "Governança no SUS",
        nome: "Nome em validação institucional",
        credencial: "Atuação em governança institucional no SUS, indicadores estratégicos e modelos de articulação executiva em secretarias de saúde.",
        eixo: "Governança e performance",
        modulos: "V",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Liderança em saúde pública",
        axisBadge: "Liderança em saúde",
        nome: "Especialista convidado",
        credencial: "Liderança em saúde pública contemporânea, modelos de direção aplicados ao SUS e formação de dirigentes para a alta gestão.",
        modulos: "I · II",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Decisão baseada em evidências em saúde",
        axisBadge: "Decisão por evidências",
        nome: "Especialista convidada",
        credencial: "Decisão baseada em evidências em saúde pública, uso institucional de dados e modelos de articulação técnica no SUS.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Gestão de pessoas no SUS",
        axisBadge: "Gestão de pessoas no SUS",
        nome: "Especialista convidado",
        credencial: "Cultura organizacional, equipes de alta performance e formação de quadros sucessórios em secretarias e órgãos do SUS.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Performance e accountability em saúde",
        axisBadge: "Performance no SUS",
        nome: "Especialista convidada",
        credencial: "Indicadores estratégicos em saúde pública, painéis institucionais de governança e modelos de accountability aplicados ao SUS.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Articulação política e comunicação",
        axisBadge: "Articulação política",
        nome: "Especialista convidado",
        credencial: "Comunicação executiva, articulação com Legislativo, Judiciário e órgãos de controle, e relacionamento institucional aplicado à saúde pública.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Gestão de crise em saúde pública",
        axisBadge: "Gestão de crise",
        nome: "Especialista convidada",
        credencial: "Gestão de crise em saúde pública, protocolos institucionais e proteção da continuidade institucional do SUS.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Judicialização da saúde e direção",
        axisBadge: "Judicialização da saúde",
        nome: "Especialista convidado",
        credencial: "Judicialização da saúde, leitura institucional para a direção do SUS e articulação com Ministério Público e Judiciário.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Cultura institucional e alta gestão em saúde",
        axisBadge: "Cultura institucional",
        nome: "Especialista convidada",
        credencial: "Cultura institucional da alta gestão em saúde, formação de equipes estratégicas e implantação de matrizes de direção no SUS.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos executivos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PROSUS+ é organizada por competências executivas da direção em saúde pública e pode variar conforme o perfil da turma, os desafios institucionais do órgão contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PROSUS+",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PROSUS+ é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias e órgãos do SUS, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PROSUS+ — liderança em saúde, direção estratégica, decisão por evidências, gestão de pessoas, governança, articulação política, gestão de crise e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato/proposta?programa=prosus&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da secretaria. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a secretaria ou órgão</h4>
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de saúde, fundação estadual ou órgão do SUS, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil dos quadros de direção.</p>
    <a class="cta" href="/contato/proposta?programa=prosus&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato/proposta?programa=prosus&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PROSUS+",
    tituloHtml: `Próximos módulos do <em>PROSUS+</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-saude.1920.webp`,
      dataLabel: { dias: "05–07", mesAno: "Jun · 2026" },
      modalidade: "Presencial · Brasília · DF",
      eyebrow: "Seminário executivo · NTC Saúde",
      titulo: "Liderança em saúde pública contemporânea: fundamentos para a direção do SUS",
      binding: "Porta de entrada · Módulo I do PROSUS+",
      metas: [
        "<strong>20h</strong> · 3 dias",
        "Brasília · DF · imersão executiva",
        "Certificação <strong>· EventOn NTC</strong>",
      ],
      ctaPrimario: "Inscrever-se",
      ctaSecundario: "Ver detalhes",
    },
    miniStack: [
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "24", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Direção estratégica e construção da visão institucional em saúde",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "26", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Gestão de pessoas e equipes de alta performance em saúde",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "29–30", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Articulação política, comunicação executiva e gestão de crise",
        metaHtml: "Módulo <strong>VI</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PROSUS+ é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias e órgãos do SUS ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PROSUS+", href: "/agenda?programa=prosus", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato/proposta?programa=prosus&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PROSUS+?",
        resposta: "Sim. O PROSUS+ é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Liderança em saúde pública contemporânea) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PROSUS+ é indicado para lideranças em formação no SUS?",
        resposta: "Sim. O programa é dimensionado tanto para quem já ocupa cargos de direção no SUS quanto para quadros em formação — coordenadores e gerentes estratégicos sendo preparados para posições de comando em secretarias e órgãos do sistema. Para mapeamento sucessório institucional, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PROSUS+ pode ser entregue exclusivamente à secretaria estadual ou municipal de saúde, fundação estadual ou órgão do SUS, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade institucional e o perfil dos quadros de direção. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há modalidades de contratação compatíveis com o SUS?",
        resposta: "Sim. Atendemos órgãos do SUS por dispensa, inexigibilidade, Lei 14.133, convênio, contrato de programa e demais modalidades compatíveis com a realidade da saúde pública. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PROSUS++. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PROSUS+</em> para a sua instituição.",
    corpo: "Solicite proposta institucional para sua secretaria, fundação estadual ou órgão do SUS — trilha completa, módulos avulsos, in company ou solução sob medida.",
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
      "Capacidade de direção estratégica em saúde",
      "Decisão baseada em evidências no SUS",
      "Painel de indicadores estratégicos da direção",
      "Matriz aplicada de direção institucional",
      "Certificação institucional NTC",
    ],
  },
};
