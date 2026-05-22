import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PROGIR: ConteudoPrograma = {
  sigla: "PROGIR",
  siglaCss: "PROGIR",
  siglaExibida: "PROGIR",
  slug: "progir",
  nomeCompleto: "Programa de Inclusão, Equidade e Garantia de Direitos Educacionais nas Redes Públicas",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "PROGIR" },
  hero: {
    bgSrc: `${IMG}/educacao-inclusiva.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Inclusão, Equidade e <em>Garantia de Direitos Educacionais</em> nas Redes Públicas`,
    sub: "Capacitação executiva para secretarias e equipes pedagógicas na construção institucional da escola inclusiva — articulando educação especial, atendimento educacional especializado (AEE), educação para diversidade, equidade de gênero, raça e classe, e garantia de direitos educacionais nas redes públicas brasileiras.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=progir", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=progir&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Inclusão e Equidade Educacional" },
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
    titulo: "Um programa estratégico para a educação inclusiva e equitativa nas redes públicas brasileiras.",
    tituloHtml: `Um programa estratégico para a <em>educação inclusiva e equitativa</em> nas redes públicas brasileiras.`,
    corpoHtml: `<p class="lede-block">O PROGIR articula política institucional da inclusão, atendimento educacional especializado (AEE), práticas pedagógicas inclusivas, educação para diversidade e equidade racial, de gênero e de classe em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias estaduais e municipais de educação, coordenadores da inclusão, equipes pedagógicas e diretores escolares.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a construção institucional da escola inclusiva — secretários e secretários-adjuntos de educação, coordenadores da educação inclusiva e da educação especial, equipes técnicas do AEE, diretores e coordenadores pedagógicos, formadores e equipes de educação para a diversidade — que precisam de <strong>repertório técnico-pedagógico atualizado</strong>, <strong>metodologia aplicada à inclusão</strong> e <strong>protocolos institucionais</strong> compatíveis com a Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva, com a LBI (Lei 13.146/2015) e com a realidade das redes públicas brasileiras.</p>
<p>O PROGIR não é um curso isolado de educação especial nem uma trilha genérica de diversidade. É um programa de fortalecimento institucional da inclusão educacional — articulando AEE, práticas pedagógicas inclusivas, diversidade e equidade em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de inclusão e equidade</strong>, construída pelos próprios participantes para a sua rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A educação básica brasileira opera hoje sob pressão crescente em torno da inclusão — Lei Brasileira de Inclusão (Lei 13.146/2015), Política Nacional de Educação Especial, expansão do AEE, demanda por equidade racial e de gênero, judicialização do direito à educação inclusiva e expectativa social por escolas verdadeiramente abertas à diferença. Secretarias precisam articular respostas estruturadas, defensáveis e sustentáveis.</p>
<p>A maioria das redes convive simultaneamente com três pressões: ausência de política institucional consolidada de educação inclusiva, fragilidade do AEE como instância pedagógica estratégica e ausência de protocolos institucionais que articulem inclusão, diversidade e equidade no cotidiano da rede. Iniciativas pontuais, sem arquitetura institucional, não respondem ao desafio.</p>
<p>O PROGIR responde a essa pressão construindo capacidade institucional avançada: redes com política de inclusão estruturada, AEE consolidado como instância pedagógica e equipes preparadas para sustentar a cultura institucional da inclusão e da equidade para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências isoladas em educação especial. <strong>É a arquitetura institucional da inclusão educacional como instrumento de garantia de direitos</strong> — articulando AEE, práticas inclusivas em sala, diversidade, equidade e indicadores em um sistema coerente, defensável e replicável nas redes públicas brasileiras.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de inclusão, equidade e garantia de direitos educacionais nas redes públicas brasileiras — articulando política da inclusão, AEE, práticas pedagógicas inclusivas, educação para diversidade e equidade racial, de gênero e de classe aplicados à rotina das secretarias e das escolas.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PROGIR é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a inclusão educacional das redes:</p>`,
    chips: [
      "Secretários e secretários-adjuntos de educação",
      "Coordenadores da educação inclusiva e da educação especial",
      "Equipes técnicas do AEE nas redes",
      "Diretores e coordenadores pedagógicos das escolas",
      "Professores do AEE e da sala de recursos multifuncionais",
      "Formadores e equipes de educação para a diversidade",
      "Equipes técnicas de educação para as relações étnico-raciais",
      "Quadros sucessórios das áreas de inclusão e equidade",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Política institucional da inclusão educacional",
        descricao: "Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva, Lei Brasileira de Inclusão (Lei 13.146/2015) e marcos contemporâneos consolidados.",
      },
      {
        titulo: "AEE e práticas pedagógicas inclusivas",
        descricao: "Atendimento Educacional Especializado contemporâneo, sala de recursos multifuncionais, práticas pedagógicas inclusivas em sala de aula comum e articulação institucional.",
      },
      {
        titulo: "Educação para diversidade e equidade",
        descricao: "Educação para as relações étnico-raciais (Lei 10.639/2003), educação para diversidade de gênero, equidade de classe e modelos institucionais consolidados nas redes.",
      },
      {
        titulo: "Gestão institucional da inclusão e aplicação",
        descricao: "Gestão institucional da inclusão na rede, indicadores institucionais e construção da matriz aplicada de inclusão e equidade para a secretaria.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PROGIR é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Marco institucional da educação inclusiva e Lei Brasileira de Inclusão (Lei 13.146/2015)",
        descricao: "Marco institucional contemporâneo da educação inclusiva no Brasil — referenciais legais, Lei Brasileira de Inclusão e Política Nacional de Educação Especial.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Atendimento Educacional Especializado (AEE) contemporâneo nas redes públicas",
        descricao: "Atendimento Educacional Especializado contemporâneo — sala de recursos multifuncionais, articulação com a sala comum e protocolos institucionais consolidados.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Práticas pedagógicas inclusivas na sala de aula comum",
        descricao: "Práticas pedagógicas inclusivas na sala de aula comum — modelos contemporâneos aplicáveis ao ensino regular nas redes públicas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Educação especial contemporânea: deficiências, TGD/TEA e altas habilidades",
        descricao: "Educação especial contemporânea — panorama institucional das deficiências, TGD/TEA, altas habilidades/superdotação e protocolos pedagógicos consolidados.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Educação para as relações étnico-raciais (Lei 10.639/2003) nas redes públicas",
        descricao: "Educação para as relações étnico-raciais nas redes públicas — Lei 10.639/2003 aplicada ao currículo, à prática docente e à cultura escolar.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Diversidade de gênero, equidade e proteção integral nas escolas",
        descricao: "Diversidade de gênero, equidade e proteção integral nas escolas — modelos institucionais contemporâneos aplicáveis às redes públicas.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Gestão institucional da inclusão na rede e indicadores de equidade",
        descricao: "Gestão institucional da inclusão na rede — indicadores institucionais, planejamento e protocolos de monitoramento da equidade educacional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROGIR de inclusão e equidade",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inclusão e equidade para a sua rede de origem.",
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
        titulo: "Marco institucional da educação inclusiva e Lei Brasileira de Inclusão (Lei 13.146/2015)",
        cargaHoraria: "8h",
        descricao: "Marco institucional contemporâneo da educação inclusiva no Brasil — referenciais legais, Lei Brasileira de Inclusão e Política Nacional de Educação Especial.",
        topicos: [
          "Lei 13.146/2015 (Lei Brasileira de Inclusão) aplicada",
          "Política Nacional de Educação Especial vigente",
          "Marcos legais complementares: ECA, LDB, Constituição",
          "Arquitetura federativa da educação inclusiva",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Atendimento Educacional Especializado (AEE) contemporâneo nas redes públicas",
        cargaHoraria: "8h",
        descricao: "Atendimento Educacional Especializado contemporâneo — sala de recursos multifuncionais, articulação com a sala comum e protocolos institucionais consolidados.",
        topicos: [
          "AEE contemporâneo nas redes públicas",
          "Sala de recursos multifuncionais e organização do trabalho",
          "Articulação entre AEE e sala de aula comum",
          "Indicadores institucionais do AEE",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Práticas pedagógicas inclusivas na sala de aula comum",
        cargaHoraria: "8h",
        descricao: "Práticas pedagógicas inclusivas na sala de aula comum — modelos contemporâneos aplicáveis ao ensino regular nas redes públicas brasileiras.",
        topicos: [
          "Desenho universal para a aprendizagem (DUA)",
          "Adaptações curriculares e flexibilizações",
          "Avaliação inclusiva e processos formativos",
          "Articulação entre professor regente e AEE",
        ],
      },
      {
        numero: "IV",
        titulo: "Educação especial contemporânea: deficiências, TGD/TEA e altas habilidades",
        cargaHoraria: "8h",
        descricao: "Educação especial contemporânea — panorama institucional das deficiências, TGD/TEA, altas habilidades/superdotação e protocolos pedagógicos consolidados.",
        topicos: [
          "Deficiências e protocolos pedagógicos contemporâneos",
          "Transtornos do espectro autista (TEA) e práticas inclusivas",
          "Altas habilidades/superdotação na escola pública",
          "Articulação com saúde, assistência e justiça",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Educação para as relações étnico-raciais (Lei 10.639/2003) nas redes públicas",
        cargaHoraria: "8h",
        descricao: "Educação para as relações étnico-raciais nas redes públicas — Lei 10.639/2003 aplicada ao currículo, à prática docente e à cultura escolar.",
        topicos: [
          "Lei 10.639/2003 e DCNERER vigentes",
          "História e cultura afro-brasileira e indígena no currículo",
          "Práticas docentes antirracistas na escola pública",
          "Cultura institucional antirracista nas redes",
        ],
      },
      {
        numero: "VI",
        titulo: "Diversidade de gênero, equidade e proteção integral nas escolas",
        cargaHoraria: "8h",
        descricao: "Diversidade de gênero, equidade e proteção integral nas escolas — modelos institucionais contemporâneos aplicáveis às redes públicas.",
        topicos: [
          "Educação para a diversidade de gênero",
          "Equidade de gênero, classe e território",
          "Proteção integral e enfrentamento de violências",
          "Articulação entre escola, família e rede de proteção",
        ],
      },
      {
        numero: "VII",
        titulo: "Gestão institucional da inclusão na rede e indicadores de equidade",
        cargaHoraria: "8h",
        descricao: "Gestão institucional da inclusão na rede — indicadores institucionais, planejamento e protocolos de monitoramento da equidade educacional.",
        topicos: [
          "Gestão institucional da inclusão na rede pública",
          "Indicadores institucionais de equidade educacional",
          "Planejamento institucional da inclusão",
          "Cultura institucional da inclusão na rede",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROGIR de inclusão e equidade",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inclusão e equidade para a sua rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PROGIR",
          "Plano de aplicação da matriz na rede de origem",
          "Encerramento e construção de comunidade de inclusão e equidade",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PROGIR",
    tituloHtml: `O que a instituição <em>leva</em> do PROGIR`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Política institucional da inclusão estruturada na rede pública.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>AEE consolidado como instância pedagógica estratégica.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Práticas pedagógicas inclusivas implantadas na sala de aula comum.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Educação para as relações étnico-raciais institucionalizada na rede.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores de equidade educacional.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de inclusão e equidade construída para a rede.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PROGIR uma referência",
    tituloHtml: `O que torna o PROGIR <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade das redes brasileiras",
        descricao: "Estruturado a partir da prática real das escolas e redes públicas brasileiras, com leitura crítica de modelos contemporâneos consolidados.",
      },
      {
        titulo: "Coordenação com trajetória em inclusão e equidade",
        descricao: "Coordenação científica e docentes com vivência aplicada em educação inclusiva, educação especial, AEE e educação para a diversidade nas redes públicas.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de inclusão e equidade construída para a rede do participante.",
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
    titulo: "Curadoria técnica em inclusão, equidade e garantia de direitos",
    tituloHtml: `Curadoria técnica em <em>inclusão, equidade e garantia de direitos</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PROGIR articula gestores educacionais, especialistas em política da inclusão, AEE, práticas pedagógicas inclusivas, educação especial, educação para as relações étnico-raciais e diversidade — apoiando secretarias e redes na construção institucional da escola inclusiva e equitativa.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Política da inclusão e gestão institucional",
        axisBadge: "Política da inclusão",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em política da inclusão educacional, secretarias estaduais e municipais e formação executiva de quadros de educação inclusiva.",
        eixo: "Política e gestão da inclusão",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · AEE e práticas pedagógicas inclusivas",
        axisBadge: "AEE e práticas inclusivas",
        nome: "Nome em validação institucional",
        credencial: "Atuação em Atendimento Educacional Especializado, práticas pedagógicas inclusivas e formação docente para a inclusão nas redes públicas.",
        eixo: "AEE e práticas inclusivas",
        modulos: "II · III · IV",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Marco institucional da educação inclusiva",
        axisBadge: "Marco institucional",
        nome: "Especialista convidado",
        credencial: "Marco legal da educação inclusiva, Lei 13.146/2015 e Política Nacional de Educação Especial na Perspectiva Inclusiva.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · AEE contemporâneo",
        axisBadge: "AEE contemporâneo",
        nome: "Especialista convidada",
        credencial: "Atendimento Educacional Especializado contemporâneo, sala de recursos multifuncionais e articulação com a sala comum.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · DUA e práticas inclusivas",
        axisBadge: "Práticas inclusivas",
        nome: "Especialista convidado",
        credencial: "Desenho universal para a aprendizagem (DUA), adaptações curriculares e práticas pedagógicas inclusivas na sala de aula comum.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Educação especial e TEA",
        axisBadge: "Educação especial",
        nome: "Especialista convidada",
        credencial: "Educação especial contemporânea, transtornos do espectro autista (TEA), altas habilidades/superdotação e articulação intersetorial.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Relações étnico-raciais",
        axisBadge: "Relações étnico-raciais",
        nome: "Especialista convidado",
        credencial: "Educação para as relações étnico-raciais, Lei 10.639/2003, história e cultura afro-brasileira e indígena no currículo.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Diversidade de gênero e equidade",
        axisBadge: "Gênero e equidade",
        nome: "Especialista convidada",
        credencial: "Educação para a diversidade de gênero, equidade de gênero, classe e território nas escolas públicas brasileiras.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Proteção integral e rede de proteção",
        axisBadge: "Proteção integral",
        nome: "Especialista convidado",
        credencial: "Proteção integral, ECA aplicado à escola, enfrentamento de violências e articulação com a rede de proteção da criança e do adolescente.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Gestão institucional da inclusão",
        axisBadge: "Gestão da inclusão",
        nome: "Especialista convidada",
        credencial: "Gestão institucional da inclusão na rede pública, indicadores institucionais de equidade educacional e cultura institucional da inclusão.",
        modulos: "VII · VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos da inclusão" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PROGIR é organizada por competências da inclusão educacional, da educação especial, do AEE e da educação para a diversidade — podendo variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PROGIR",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PROGIR é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PROGIR — marco institucional, AEE, práticas inclusivas, educação especial, relações étnico-raciais, diversidade de gênero, gestão institucional da inclusão e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato/proposta?programa=progir&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade da rede e o perfil das equipes executivas e pedagógicas.</p>
    <a class="cta" href="/contato/proposta?programa=progir&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato/proposta?programa=progir&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PROGIR",
    tituloHtml: `Próximos módulos do <em>PROGIR</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/educacao-inclusiva.1920.webp`,
      dataLabel: { dias: "16–17", mesAno: "Jul · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Marco institucional da educação inclusiva e LBI (Lei 13.146/2015)",
      binding: "Porta de entrada · Módulo I do PROGIR",
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
        bgImg: `${IMG}/educacao-inclusiva.1920.webp`,
        dataLabel: { dias: "06", mesAno: "Ago · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "AEE contemporâneo e sala de recursos multifuncionais",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/educacao-inclusiva.1920.webp`,
        dataLabel: { dias: "03", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Educação especial contemporânea: TEA e altas habilidades",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/educacao-inclusiva.1920.webp`,
        dataLabel: { dias: "08–09", mesAno: "Out · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Educação para as relações étnico-raciais (Lei 10.639/2003)",
        metaHtml: "Módulo <strong>V</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PROGIR é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias de educação ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PROGIR", href: "/agenda?programa=progir", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato/proposta?programa=progir&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PROGIR?",
        resposta: "Sim. O PROGIR é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Marco institucional da educação inclusiva) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PROGIR cobre a Lei Brasileira de Inclusão (Lei 13.146/2015) e a Lei 10.639/2003?",
        resposta: "Sim. O Módulo I é estruturado integralmente sobre a Lei Brasileira de Inclusão e o marco contemporâneo da educação inclusiva. O Módulo V aprofunda a Lei 10.639/2003 e as Diretrizes Curriculares Nacionais para a Educação das Relações Étnico-Raciais, com aplicação prática para o currículo da rede.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PROGIR pode ser entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil das equipes executivas e pedagógicas. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PROGIR. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PROGIR</em> para a sua rede.",
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
      "Política institucional da inclusão estruturada",
      "AEE consolidado como instância pedagógica",
      "Práticas pedagógicas inclusivas implantadas",
      "Matriz aplicada de inclusão e equidade",
      "Certificação institucional NTC",
    ],
  },
};
