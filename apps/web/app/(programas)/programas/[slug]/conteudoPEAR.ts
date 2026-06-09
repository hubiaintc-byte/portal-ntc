import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PEAR: ConteudoPrograma = {
  sigla: "PEAR",
  siglaCss: "PEAR",
  siglaExibida: "PEAR",
  slug: "pear",
  nomeCompleto: "Excelência em Aprendizagem e Resultados",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "PEAR" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Excelência em Aprendizagem e <em>Resultados</em>`,
    sub: "Capacitação executiva para redes públicas de educação — articulando alfabetização na idade certa, recomposição de aprendizagens, currículo, avaliação institucional, formação continuada e governança de resultados em sistemas estaduais e municipais de ensino.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=pear", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=pear&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Aprendizagem e Resultados" },
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
    titulo: "Um programa estratégico para a excelência institucional das redes públicas de educação.",
    tituloHtml: `Um programa estratégico para a <em>excelência institucional</em> das redes públicas de educação.`,
    corpoHtml: `<p class="lede-block">O PEAR articula alfabetização, recomposição de aprendizagens, currículo, avaliação institucional, formação continuada e governança de resultados em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias estaduais e municipais de educação, equipes pedagógicas e quadros executivos das redes.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre o desempenho da rede — secretários e secretários-adjuntos de educação, superintendentes pedagógicos, coordenadores regionais, diretores escolares, formadores e equipes técnicas de currículo, avaliação e formação — que precisam de <strong>repertório técnico-pedagógico atualizado</strong>, <strong>metodologia aplicada à recomposição de aprendizagens</strong> e <strong>protocolos institucionais</strong> compatíveis com a complexidade real da educação básica brasileira.</p>
<p>O PEAR não é um curso de gestão escolar genérico nem uma trilha de formação pedagógica isolada. É um programa de excelência institucional aplicada — articulando alfabetização na idade certa, recomposição de aprendizagens pós-pandemia, currículo, avaliação e formação em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de excelência e resultados</strong>, construída pelos próprios participantes para sua rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A educação básica brasileira opera hoje sob pressão crescente — defasagem de aprendizagens pós-pandemia, metas do Compromisso Nacional Criança Alfabetizada, avaliações em larga escala (Saeb, SAEB·Alfa, avaliações estaduais), exigências do PNE e expectativa social por equidade. Secretarias estaduais e municipais precisam articular respostas estruturadas, mensuráveis e replicáveis.</p>
<p>A maioria das redes convive simultaneamente com três pressões: defasagem de alfabetização na idade certa, ausência de sistema integrado de avaliação institucional e ausência de protocolos de formação continuada conectados ao currículo. Programas de capacitação fragmentados, sem articulação institucional, não resolvem o desafio.</p>
<p>O PEAR responde a essa pressão construindo capacidade institucional avançada: redes com alfabetização na idade certa estruturada, sistema de avaliação institucional articulado e equipes preparadas para sustentar a continuidade pedagógica para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências pedagógicas isoladas. <strong>É a arquitetura institucional da excelência educacional como instrumento de governança</strong> — articulando alfabetização, recomposição, currículo, avaliação, formação e resultados em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de excelência em aprendizagem e resultados na educação básica — articulando alfabetização, recomposição, currículo, avaliação institucional, formação continuada e governança de resultados aplicados à rotina das secretarias e dos quadros executivos das redes.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PEAR é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a excelência da rede:</p>`,
    chips: [
      "Secretários e secretários-adjuntos de educação",
      "Superintendentes e diretores pedagógicos",
      "Coordenadores regionais e técnicos de rede",
      "Diretores escolares e supervisores",
      "Formadores e equipes de formação continuada",
      "Equipes de currículo, avaliação e dados",
      "Gestores de programas estaduais e municipais",
      "Quadros sucessórios das secretarias",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Alfabetização e recomposição de aprendizagens",
        descricao: "Alfabetização na idade certa, ciência da leitura aplicada, recomposição de aprendizagens pós-pandemia e referenciais consolidados do Compromisso Nacional Criança Alfabetizada.",
      },
      {
        titulo: "Currículo, avaliação e dados educacionais",
        descricao: "Currículo aplicado à BNCC, avaliações em larga escala (Saeb · SAEB·Alfa · estaduais), avaliação institucional, indicadores e dados educacionais aplicados à decisão pedagógica.",
      },
      {
        titulo: "Formação continuada e gestão pedagógica",
        descricao: "Formação continuada de professores, supervisão pedagógica, gestão escolar e modelos de articulação entre rede, escola e sala de aula.",
      },
      {
        titulo: "Aplicação institucional e governança de resultados",
        descricao: "Construção da matriz aplicada de excelência, governança de resultados, articulação política-institucional e formação de equipes estratégicas das redes.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PEAR é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Alfabetização na idade certa: ciência da leitura aplicada às redes públicas",
        descricao: "Fundamentos contemporâneos da alfabetização na idade certa, articulando ciência da leitura aplicada e referenciais consolidados nas redes públicas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Recomposição de aprendizagens e enfrentamento da defasagem pós-pandemia",
        descricao: "Recomposição de aprendizagens como prioridade institucional pós-pandemia — articulando diagnóstico, intervenção, formação e monitoramento.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Currículo da rede, BNCC aplicada e materiais didáticos institucionais",
        descricao: "Currículo da rede aplicado à BNCC, articulado a materiais didáticos institucionais e ao planejamento pedagógico da rede.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Avaliação institucional: Saeb, avaliações estaduais e municipais",
        descricao: "Avaliação institucional contemporânea — articulando Saeb, avaliações estaduais e municipais como instrumento de decisão pedagógica da rede.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Indicadores educacionais e painéis estratégicos da rede",
        descricao: "Indicadores educacionais e painéis estratégicos da rede — construção e uso institucional de instrumentos de governança pedagógica.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Formação continuada de professores: modelos institucionais",
        descricao: "Formação continuada de professores como instrumento institucional — modelos aplicáveis às redes contemporâneas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Gestão pedagógica, supervisão e direção escolar de alta performance",
        descricao: "Gestão pedagógica e direção escolar de alta performance — supervisão, acompanhamento e articulação institucional aplicada.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PEAR de excelência e resultados",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de excelência e resultados para a sua rede de origem.",
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
        titulo: "Alfabetização na idade certa: ciência da leitura aplicada às redes públicas",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos da alfabetização na idade certa, articulando ciência da leitura aplicada e referenciais consolidados nas redes públicas brasileiras.",
        topicos: [
          "Ciência da leitura aplicada à alfabetização brasileira",
          "Referenciais nacionais e estaduais consolidados",
          "Compromisso Nacional Criança Alfabetizada na prática",
          "Protocolos institucionais de alfabetização nas redes",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Recomposição de aprendizagens e enfrentamento da defasagem pós-pandemia",
        cargaHoraria: "8h",
        descricao: "Recomposição de aprendizagens como prioridade institucional pós-pandemia — articulando diagnóstico, intervenção, formação e monitoramento.",
        topicos: [
          "Diagnóstico institucional de defasagens de aprendizagem",
          "Modelos contemporâneos de recomposição articulada",
          "Articulação entre rede, escola e sala de aula",
          "Indicadores de monitoramento da recomposição",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Currículo da rede, BNCC aplicada e materiais didáticos institucionais",
        cargaHoraria: "8h",
        descricao: "Currículo da rede aplicado à BNCC, articulado a materiais didáticos institucionais e ao planejamento pedagógico da rede.",
        topicos: [
          "BNCC aplicada ao currículo da rede pública",
          "Currículo, materiais didáticos e planejamento articulados",
          "Articulação entre rede, escola e prática docente",
          "Protocolos institucionais de implantação curricular",
        ],
      },
      {
        numero: "IV",
        titulo: "Avaliação institucional: Saeb, avaliações estaduais e municipais",
        cargaHoraria: "8h",
        descricao: "Avaliação institucional contemporânea — articulando Saeb, avaliações estaduais e municipais como instrumento de decisão pedagógica da rede.",
        topicos: [
          "Saeb e avaliação em larga escala no Brasil",
          "Avaliações estaduais e municipais aplicadas",
          "Avaliação institucional e indicadores pedagógicos",
          "Uso pedagógico dos resultados de avaliação",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Indicadores educacionais e painéis estratégicos da rede",
        cargaHoraria: "8h",
        descricao: "Indicadores educacionais e painéis estratégicos da rede — construção e uso institucional de instrumentos de governança pedagógica.",
        topicos: [
          "Indicadores estratégicos da rede pública de ensino",
          "Painéis institucionais de governança pedagógica",
          "Cultura de mensuração e accountability educacional",
          "Uso institucional dos indicadores pela rede",
        ],
      },
      {
        numero: "VI",
        titulo: "Formação continuada de professores: modelos institucionais",
        cargaHoraria: "8h",
        descricao: "Formação continuada de professores como instrumento institucional — modelos aplicáveis às redes contemporâneas brasileiras.",
        topicos: [
          "Modelos contemporâneos de formação continuada",
          "Articulação entre formação, currículo e prática docente",
          "Trilhas formativas institucionais aplicáveis às redes",
          "Monitoramento de impacto da formação continuada",
        ],
      },
      {
        numero: "VII",
        titulo: "Gestão pedagógica, supervisão e direção escolar de alta performance",
        cargaHoraria: "8h",
        descricao: "Gestão pedagógica e direção escolar de alta performance — supervisão, acompanhamento e articulação institucional aplicada.",
        topicos: [
          "Direção escolar de alta performance no setor público",
          "Supervisão pedagógica e acompanhamento institucional",
          "Articulação entre rede, regional, escola e sala",
          "Cultura institucional de excelência pedagógica",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PEAR de excelência e resultados",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de excelência e resultados para a sua rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PEAR",
          "Plano de aplicação da matriz na rede de origem",
          "Encerramento e construção de comunidade de excelência",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PEAR",
    tituloHtml: `O que a instituição <em>leva</em> do PEAR`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Alfabetização na idade certa estruturada na rede pública.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Recomposição de aprendizagens pós-pandemia institucionalizada.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Currículo da rede articulado à BNCC e a materiais didáticos institucionais.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Sistema integrado de avaliação institucional implantado.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores educacionais estratégicos.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de excelência e resultados construída para a rede.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PEAR uma referência",
    tituloHtml: `O que torna o PEAR <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade da educação básica brasileira",
        descricao: "Estruturado a partir da prática real das redes públicas brasileiras, com leitura crítica de modelos contemporâneos consolidados.",
      },
      {
        titulo: "Coordenação com trajetória executiva em educação",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias estaduais e municipais, MEC e organismos de avaliação educacional.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de excelência e resultados construída para a rede do participante.",
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
    titulo: "Curadoria técnica para a excelência das redes públicas",
    tituloHtml: `Curadoria técnica para a <em>excelência das redes públicas</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PEAR articula gestores educacionais, especialistas em alfabetização, currículo, avaliação, formação continuada e governança de resultados para apoiar redes e equipes na construção institucional da excelência pedagógica.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Alfabetização e excelência institucional",
        axisBadge: "Alfabetização institucional",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em secretarias estaduais e municipais de educação, MEC e formação executiva de quadros das redes públicas brasileiras.",
        eixo: "Alfabetização e excelência",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Currículo, avaliação e dados educacionais",
        axisBadge: "Currículo e avaliação",
        nome: "Nome em validação institucional",
        credencial: "Atuação em currículo aplicado à BNCC, avaliações em larga escala e indicadores institucionais aplicados à educação básica.",
        eixo: "Currículo, avaliação e dados",
        modulos: "III · IV",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Alfabetização e ciência da leitura",
        axisBadge: "Alfabetização",
        nome: "Especialista convidado",
        credencial: "Ciência da leitura aplicada à alfabetização brasileira, referenciais nacionais e protocolos institucionais para as redes públicas.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Recomposição de aprendizagens",
        axisBadge: "Recomposição",
        nome: "Especialista convidada",
        credencial: "Recomposição de aprendizagens pós-pandemia, modelos institucionais e protocolos aplicáveis às redes estaduais e municipais.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Currículo e BNCC aplicada",
        axisBadge: "Currículo e BNCC",
        nome: "Especialista convidado",
        credencial: "Currículo aplicado à BNCC, articulação entre rede, escola e sala de aula, materiais didáticos institucionais e planejamento pedagógico.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Avaliação institucional e Saeb",
        axisBadge: "Avaliação institucional",
        nome: "Especialista convidada",
        credencial: "Avaliações em larga escala (Saeb · estaduais · municipais), avaliação institucional e uso pedagógico dos resultados aplicado à rede.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Indicadores e painéis educacionais",
        axisBadge: "Indicadores e painéis",
        nome: "Especialista convidado",
        credencial: "Indicadores estratégicos da rede, painéis institucionais de governança pedagógica e modelos de monitoramento da educação básica.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Formação continuada de professores",
        axisBadge: "Formação continuada",
        nome: "Especialista convidada",
        credencial: "Formação continuada de professores, modelos institucionais e trilhas formativas aplicadas às redes públicas brasileiras.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Gestão pedagógica e direção escolar",
        axisBadge: "Direção escolar",
        nome: "Especialista convidado",
        credencial: "Direção escolar de alta performance no setor público, supervisão pedagógica e articulação entre rede, regional e escola.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Governança educacional e cultura institucional",
        axisBadge: "Governança educacional",
        nome: "Especialista convidada",
        credencial: "Governança de resultados na educação básica, formação de equipes estratégicas e construção de cultura institucional de excelência.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos pedagógicos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PEAR é organizada por competências pedagógicas e institucionais da educação básica e pode variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PEAR",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PEAR é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PEAR — alfabetização, recomposição, currículo, avaliação, indicadores, formação continuada, direção escolar e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=pear&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil dos quadros executivos da rede.</p>
    <a class="cta" href="/contato?programa=pear&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=pear&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PEAR",
    tituloHtml: `Próximos módulos do <em>PEAR</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "03–04", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Alfabetização na idade certa — ciência da leitura aplicada às redes",
      binding: "Porta de entrada · Módulo I do PEAR",
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
        dataLabel: { dias: "12", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Recomposição de aprendizagens pós-pandemia nas redes públicas",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "13", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Avaliação institucional: Saeb, avaliações estaduais e municipais",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "09–10", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Currículo da rede, BNCC aplicada e materiais didáticos institucionais",
        metaHtml: "Módulo <strong>III</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PEAR é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias de educação ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PEAR", href: "/agenda?programa=pear", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=pear&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PEAR?",
        resposta: "Sim. O PEAR é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Alfabetização na idade certa) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PEAR é indicado para redes municipais menores?",
        resposta: "Sim. O programa é dimensionado para secretarias estaduais e municipais de qualquer porte, com módulos aplicáveis à realidade das pequenas, médias e grandes redes. Para contratação institucional dedicada ao perfil do município, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PEAR pode ser entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil dos quadros executivos. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PEAR. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PEAR</em> para a sua rede.",
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
      "Alfabetização na idade certa estruturada",
      "Recomposição de aprendizagens institucionalizada",
      "Sistema integrado de avaliação da rede",
      "Matriz aplicada de excelência e resultados",
      "Certificação institucional NTC",
    ],
  },
};
