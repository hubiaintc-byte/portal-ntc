import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PROGE: ConteudoPrograma = {
  sigla: "PROGE",
  siglaCss: "PROGE",
  siglaExibida: "PROGE",
  slug: "proge",
  nomeCompleto: "Programa de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "PROGE" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Gestão Escolar, Coordenação Pedagógica e <em>Direção de Alta Performance</em>`,
    sub: "Capacitação executiva para diretores, coordenadores e equipes pedagógicas das escolas públicas brasileiras — articulando direção escolar contemporânea, coordenação pedagógica qualificada, gestão democrática, projeto político-pedagógico e cultura institucional de alta performance.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=proge", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=proge&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Gestão Escolar e Direção" },
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
    titulo: "Um programa estratégico para a direção escolar nas redes públicas brasileiras.",
    tituloHtml: `Um programa estratégico para a <em>direção escolar</em> nas redes públicas brasileiras.`,
    corpoHtml: `<p class="lede-block">O PROGE articula direção escolar contemporânea, coordenação pedagógica qualificada, gestão democrática, projeto político-pedagógico, indicadores institucionais da escola e cultura de alta performance em um arco formativo de 8 módulos e 64 horas, dimensionado para diretores escolares, coordenadores pedagógicos, supervisores e equipes gestoras das escolas públicas brasileiras.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a gestão da escola pública — diretores escolares, vice-diretores, coordenadores pedagógicos, orientadores educacionais, supervisores e equipes ampliadas de gestão escolar — que precisam de <strong>repertório técnico-pedagógico atualizado</strong>, <strong>metodologia aplicada à direção escolar de alta performance</strong> e <strong>protocolos institucionais</strong> compatíveis com a Lei de Diretrizes e Bases da Educação e com a realidade da rede pública brasileira contemporânea.</p>
<p>O PROGE não é um curso genérico de administração escolar nem uma trilha de formação isolada. É um programa de fortalecimento institucional da direção escolar — articulando liderança pedagógica, coordenação, gestão democrática, projeto político-pedagógico e indicadores em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de gestão escolar e direção de alta performance</strong>, construída pelos próprios participantes para a sua escola ou rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A escola pública brasileira opera hoje sob pressão crescente — defasagem de aprendizagens pós-pandemia, judicialização escolar, exigência de gestão democrática efetiva, pressão por resultados em avaliações em larga escala e expectativa social por inovação institucional. Diretores e coordenadores precisam articular respostas estruturadas, pedagogicamente sustentadas e replicáveis.</p>
<p>A maioria das escolas convive simultaneamente com três pressões: ausência de formação institucional consistente para a função diretiva, fragilidade da coordenação pedagógica como instância estratégica e ausência de protocolos institucionais que articulem direção, coordenação e prática docente. Programas de capacitação fragmentados não respondem ao desafio.</p>
<p>O PROGE responde a essa pressão construindo capacidade institucional avançada: escolas com direção qualificada, coordenação pedagógica como instância estratégica e equipes preparadas para sustentar a continuidade institucional da excelência pedagógica para além de gestões individuais.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências administrativas isoladas. <strong>É a arquitetura institucional da direção escolar como instrumento de governança pedagógica</strong> — articulando liderança, coordenação, gestão democrática, PPP, indicadores e cultura escolar em um sistema coerente, replicável e adequado à realidade das escolas públicas brasileiras.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de gestão escolar e direção de alta performance nas escolas públicas brasileiras — articulando direção contemporânea, coordenação pedagógica qualificada, gestão democrática, projeto político-pedagógico, indicadores institucionais e cultura de excelência aplicados à rotina das escolas e das redes.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PROGE é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a gestão da escola pública:</p>`,
    chips: [
      "Diretores e vice-diretores escolares",
      "Coordenadores pedagógicos das escolas",
      "Supervisores e orientadores educacionais",
      "Equipes ampliadas de gestão escolar",
      "Coordenadores regionais e técnicos pedagógicos",
      "Formadores e equipes de formação de gestores",
      "Quadros sucessórios da direção escolar",
      "Candidatos à direção escolar em formação",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Direção escolar contemporânea",
        descricao: "Fundamentos contemporâneos da direção escolar, modelos institucionais de liderança pedagógica e referenciais consolidados para a função diretiva no Brasil.",
      },
      {
        titulo: "Coordenação pedagógica como instância estratégica",
        descricao: "Coordenação pedagógica qualificada, articulação entre direção, coordenação e prática docente, supervisão e acompanhamento institucional.",
      },
      {
        titulo: "Gestão democrática e projeto político-pedagógico",
        descricao: "Gestão democrática efetiva, conselhos escolares, projeto político-pedagógico (PPP) como instrumento institucional, autonomia escolar e gestão financeira.",
      },
      {
        titulo: "Indicadores, cultura institucional e aplicação",
        descricao: "Indicadores institucionais da escola, cultura escolar de alta performance, articulação entre escola e rede e construção da matriz aplicada de gestão escolar.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PROGE é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Direção escolar contemporânea: fundamentos e modelos institucionais",
        descricao: "Fundamentos contemporâneos da direção escolar, modelos institucionais de liderança e referenciais consolidados para a função diretiva nas redes públicas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Liderança pedagógica do diretor e direção de alta performance",
        descricao: "Liderança pedagógica do diretor como núcleo da função diretiva — articulando visão, prática, equipe e resultados de aprendizagem.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Coordenação pedagógica como instância estratégica da escola",
        descricao: "Coordenação pedagógica como instância estratégica da escola — articulando supervisão, formação continuada e qualidade do trabalho docente.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Supervisão pedagógica e acompanhamento institucional do trabalho docente",
        descricao: "Supervisão pedagógica e acompanhamento institucional do trabalho docente — protocolos contemporâneos aplicáveis às escolas públicas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Gestão democrática efetiva e conselhos escolares",
        descricao: "Gestão democrática efetiva — conselhos escolares, participação da comunidade e modelos institucionais aplicáveis às redes brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Projeto político-pedagógico como instrumento institucional",
        descricao: "Projeto político-pedagógico como instrumento institucional — construção, monitoramento e atualização do PPP da escola contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Autonomia escolar, gestão financeira e indicadores institucionais",
        descricao: "Autonomia escolar, gestão financeira e indicadores institucionais — protocolos para a sustentação financeira e gerencial da escola contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROGE de gestão escolar",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão escolar para a sua escola ou rede de origem.",
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
        titulo: "Direção escolar contemporânea: fundamentos e modelos institucionais",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos da direção escolar, modelos institucionais de liderança e referenciais consolidados para a função diretiva nas redes públicas brasileiras.",
        topicos: [
          "Modelos contemporâneos de direção escolar",
          "Função diretiva: dimensão pedagógica, administrativa e institucional",
          "Referenciais brasileiros e internacionais consolidados",
          "Repertório executivo do diretor escolar contemporâneo",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Liderança pedagógica do diretor e direção de alta performance",
        cargaHoraria: "8h",
        descricao: "Liderança pedagógica do diretor como núcleo da função diretiva — articulando visão, prática, equipe e resultados de aprendizagem.",
        topicos: [
          "Liderança pedagógica contemporânea aplicada à escola",
          "Articulação entre direção, equipe e prática docente",
          "Modelos de direção de alta performance",
          "Gestão de pessoas e clima institucional na escola",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Coordenação pedagógica como instância estratégica da escola",
        cargaHoraria: "8h",
        descricao: "Coordenação pedagógica como instância estratégica da escola — articulando supervisão, formação continuada e qualidade do trabalho docente.",
        topicos: [
          "Coordenação pedagógica contemporânea",
          "Articulação coordenação-direção-docência",
          "Formação continuada em serviço na escola",
          "Indicadores de qualidade do trabalho de coordenação",
        ],
      },
      {
        numero: "IV",
        titulo: "Supervisão pedagógica e acompanhamento institucional do trabalho docente",
        cargaHoraria: "8h",
        descricao: "Supervisão pedagógica e acompanhamento institucional do trabalho docente — protocolos contemporâneos aplicáveis às escolas públicas brasileiras.",
        topicos: [
          "Modelos contemporâneos de supervisão pedagógica",
          "Observação de aula e devolutiva formativa",
          "Articulação entre supervisão e formação continuada",
          "Indicadores de qualidade do trabalho docente",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Gestão democrática efetiva e conselhos escolares",
        cargaHoraria: "8h",
        descricao: "Gestão democrática efetiva — conselhos escolares, participação da comunidade e modelos institucionais aplicáveis às redes brasileiras.",
        topicos: [
          "Marco da gestão democrática no Brasil contemporâneo",
          "Conselhos escolares: composição e atribuições",
          "Participação efetiva da comunidade escolar",
          "Indicadores institucionais da gestão democrática",
        ],
      },
      {
        numero: "VI",
        titulo: "Projeto político-pedagógico como instrumento institucional",
        cargaHoraria: "8h",
        descricao: "Projeto político-pedagógico como instrumento institucional — construção, monitoramento e atualização do PPP da escola contemporânea.",
        topicos: [
          "PPP: instrumento institucional e identidade da escola",
          "Construção participativa do PPP contemporâneo",
          "Monitoramento e atualização institucional do PPP",
          "Articulação entre PPP, currículo e prática docente",
        ],
      },
      {
        numero: "VII",
        titulo: "Autonomia escolar, gestão financeira e indicadores institucionais",
        cargaHoraria: "8h",
        descricao: "Autonomia escolar, gestão financeira e indicadores institucionais — protocolos para a sustentação financeira e gerencial da escola contemporânea.",
        topicos: [
          "Autonomia escolar no Brasil contemporâneo",
          "Gestão financeira da escola: PDDE e demais transferências",
          "Indicadores institucionais da escola pública",
          "Prestação de contas pública da escola",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PROGE de gestão escolar",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão escolar para a sua escola ou rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PROGE",
          "Plano de aplicação da matriz na escola ou rede",
          "Encerramento e construção de comunidade de gestores escolares",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PROGE",
    tituloHtml: `O que a instituição <em>leva</em> do PROGE`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Direção escolar contemporânea estruturada e qualificada.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Coordenação pedagógica fortalecida como instância estratégica.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Gestão democrática efetiva e conselhos escolares atuantes.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Projeto político-pedagógico institucional consolidado.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel de indicadores institucionais da escola implantado.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de gestão escolar construída para a escola.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PROGE uma referência",
    tituloHtml: `O que torna o PROGE <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade das escolas públicas brasileiras",
        descricao: "Estruturado a partir da prática real das escolas e redes brasileiras, sem importação acrítica de modelos privados ou estrangeiros.",
      },
      {
        titulo: "Coordenação com trajetória executiva em direção escolar",
        descricao: "Coordenação científica e docentes com vivência aplicada em direção escolar, secretarias de educação e formação executiva de gestores escolares.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de gestão escolar construída para a escola do participante.",
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
    titulo: "Curadoria técnica em direção escolar e coordenação pedagógica",
    tituloHtml: `Curadoria técnica em <em>direção escolar e coordenação pedagógica</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PROGE articula gestores educacionais, especialistas em direção escolar contemporânea, coordenação pedagógica, gestão democrática, PPP e indicadores institucionais da escola — apoiando diretores, coordenadores e equipes na construção institucional da excelência escolar.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Direção escolar e liderança pedagógica",
        axisBadge: "Direção escolar",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em direção escolar, gestão de redes, secretarias estaduais e municipais e formação executiva de diretores das escolas públicas brasileiras.",
        eixo: "Direção e liderança escolar",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Coordenação pedagógica e supervisão",
        axisBadge: "Coordenação pedagógica",
        nome: "Nome em validação institucional",
        credencial: "Atuação em coordenação pedagógica, supervisão escolar, formação continuada em serviço e articulação coordenação-direção-docência.",
        eixo: "Coordenação pedagógica e supervisão",
        modulos: "III · IV",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Direção escolar contemporânea",
        axisBadge: "Direção escolar",
        nome: "Especialista convidado",
        credencial: "Modelos contemporâneos de direção escolar, função diretiva e referenciais brasileiros e internacionais aplicáveis às redes.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Liderança pedagógica e alta performance",
        axisBadge: "Liderança pedagógica",
        nome: "Especialista convidada",
        credencial: "Liderança pedagógica do diretor, modelos de alta performance e gestão de pessoas na escola pública brasileira.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Coordenação pedagógica",
        axisBadge: "Coordenação pedagógica",
        nome: "Especialista convidado",
        credencial: "Coordenação pedagógica como instância estratégica, articulação coordenação-direção-docência e formação continuada em serviço.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Supervisão pedagógica e observação de aula",
        axisBadge: "Supervisão pedagógica",
        nome: "Especialista convidada",
        credencial: "Supervisão pedagógica contemporânea, observação de aula, devolutiva formativa e acompanhamento institucional do trabalho docente.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Gestão democrática e conselhos escolares",
        axisBadge: "Gestão democrática",
        nome: "Especialista convidado",
        credencial: "Gestão democrática efetiva, conselhos escolares e participação da comunidade nas escolas públicas brasileiras.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Projeto político-pedagógico",
        axisBadge: "PPP institucional",
        nome: "Especialista convidada",
        credencial: "Projeto político-pedagógico como instrumento institucional, construção participativa e monitoramento contemporâneo nas escolas.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Autonomia escolar e PDDE",
        axisBadge: "Autonomia escolar",
        nome: "Especialista convidado",
        credencial: "Autonomia escolar, gestão financeira da escola, PDDE e prestação de contas pública das escolas públicas brasileiras.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Cultura institucional da escola",
        axisBadge: "Cultura institucional",
        nome: "Especialista convidada",
        credencial: "Construção de cultura institucional de alta performance na escola pública e formação de equipes estratégicas escolares.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos da gestão escolar" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PROGE é organizada por competências da direção e da coordenação escolar e pode variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PROGE",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PROGE é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para escolas, secretarias ou redes, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PROGE — direção escolar contemporânea, liderança pedagógica, coordenação, supervisão, gestão democrática, PPP, autonomia escolar e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=proge&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da rede. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para escola, secretaria ou rede</h4>
    <p>Programa entregue exclusivamente à instituição contratante — escola, secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade da rede e o perfil dos profissionais.</p>
    <a class="cta" href="/contato?programa=proge&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=proge&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PROGE",
    tituloHtml: `Próximos módulos do <em>PROGE</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "02–03", mesAno: "Jul · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Direção escolar contemporânea — fundamentos e modelos institucionais",
      binding: "Porta de entrada · Módulo I do PROGE",
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
        dataLabel: { dias: "29", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Liderança pedagógica do diretor e direção de alta performance",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "27", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Supervisão pedagógica e observação de aula nas redes públicas",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "01–02", mesAno: "Out · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Projeto político-pedagógico como instrumento institucional",
        metaHtml: "Módulo <strong>VI</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PROGE é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para escolas e secretarias ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PROGE", href: "/agenda?programa=proge", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=proge&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PROGE?",
        resposta: "Sim. O PROGE é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Direção escolar contemporânea) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "Qual a diferença entre PROGE e PEAR?",
        resposta: "O PEAR opera no nível da rede — política da rede, alfabetização, recomposição, avaliação institucional, indicadores da rede. O PROGE opera no nível da escola — direção escolar, coordenação pedagógica, gestão democrática, PPP, indicadores da escola. São complementares: PEAR é para secretarias e políticas, PROGE é para diretores e coordenadores.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PROGE pode ser entregue exclusivamente à escola, secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil dos profissionais. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PROGE. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PROGE</em> para a sua escola ou rede.",
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
      "Direção escolar contemporânea qualificada",
      "Coordenação pedagógica estratégica",
      "PPP institucional consolidado",
      "Matriz aplicada de gestão escolar",
      "Certificação institucional NTC",
    ],
  },
};
