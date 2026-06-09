import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PINEI: ConteudoPrograma = {
  sigla: "PINEI",
  siglaCss: "PINEI",
  siglaExibida: "PINEI",
  slug: "pinei",
  nomeCompleto: "Programa de Inovação na Educação Infantil",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "PINEI" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "6",   lbl: "Módulos formativos" },
      { num: "48h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Inovação na <em>Educação Infantil</em>`,
    sub: "Capacitação executiva para secretarias e coordenadorias da primeira infância — articulando ciência do desenvolvimento, currículo da BNCC da Educação Infantil, brincar como linguagem, formação de equipes pedagógicas e articulação com famílias, saúde e assistência em creches e pré-escolas da rede pública.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=pinei", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=pinei&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Primeira Infância e Educação Infantil" },
    { rotulo: "Estrutura",     valor: "6 módulos",        valorSub: "8 horas por módulo" },
    { rotulo: "Carga horária", valor: "48 horas",         valorSub: "Total do programa" },
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
    titulo: "Um programa estratégico para a primeira infância nas redes públicas de educação.",
    tituloHtml: `Um programa estratégico para a <em>primeira infância</em> nas redes públicas de educação.`,
    corpoHtml: `<p class="lede-block">O PINEI articula ciência do desenvolvimento, currículo da BNCC da Educação Infantil, brincar como linguagem, formação de equipes pedagógicas e articulação com famílias e rede de proteção em um arco formativo de 6 módulos e 48 horas, dimensionado para secretarias municipais de educação e coordenadorias da primeira infância.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre creches e pré-escolas — secretários e secretários-adjuntos municipais, coordenadores de educação infantil, diretores de unidades, coordenadores pedagógicos, formadores e equipes intersetoriais — que precisam de <strong>repertório técnico-pedagógico atualizado</strong>, <strong>metodologia aplicada ao desenvolvimento integral</strong> e <strong>protocolos institucionais</strong> compatíveis com o direito à educação infantil de qualidade no Brasil.</p>
<p>O PINEI não é um curso de pedagogia infantil genérico nem uma trilha técnica desconectada da gestão. É um programa de inovação institucional aplicada à primeira infância — articulando ciência do desenvolvimento, currículo, brincar, equipes pedagógicas, famílias e rede de proteção em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de inovação na educação infantil</strong>, construída pelos próprios participantes para sua rede municipal de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A primeira infância é o período mais decisivo do desenvolvimento humano — e também o mais sensível à qualidade da oferta institucional. As redes municipais brasileiras operam sob pressão: ampliação da cobertura na pré-escola (universalização constitucional), expansão da oferta em creches (meta do PNE), articulação intersetorial exigida pelo Marco Legal da Primeira Infância e expectativa social por equidade desde o nascimento.</p>
<p>A maioria das redes convive simultaneamente com três pressões: heterogeneidade da formação dos profissionais que atuam com bebês e crianças, dificuldade de articulação entre Educação, Saúde e Assistência Social, e ausência de protocolos institucionais que conectem ciência do desenvolvimento, currículo e prática cotidiana. Programas isolados de formação pedagógica, sem articulação institucional, não respondem à complexidade da etapa.</p>
<p>O PINEI responde a essa pressão construindo capacidade institucional avançada: redes municipais com educação infantil estruturada, equipes pedagógicas formadas para o desenvolvimento integral e articulação intersetorial documentada com saúde, assistência e proteção.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de boas práticas pedagógicas isoladas. <strong>É a arquitetura institucional da educação infantil como direito garantido</strong> — articulando ciência do desenvolvimento, currículo, brincar, equipes, famílias e rede de proteção em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de inovação na educação infantil — articulando ciência do desenvolvimento, currículo da BNCC da Educação Infantil, brincar como linguagem, formação de equipes pedagógicas e articulação com famílias e rede de proteção aplicados à rotina das redes municipais de educação.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PINEI é dimensionado para profissionais com responsabilidade direta sobre creches, pré-escolas e a rede de proteção à primeira infância:</p>`,
    chips: [
      "Secretários e secretários-adjuntos municipais de educação",
      "Coordenadorias de Educação Infantil",
      "Diretores de creches e pré-escolas",
      "Coordenadores pedagógicos da Educação Infantil",
      "Equipes de formação continuada",
      "Equipes intersetoriais (saúde · assistência)",
      "Conselhos municipais de educação",
      "Profissionais da rede de proteção à primeira infância",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Ciência da primeira infância e marco legal",
        descricao: "Ciência do desenvolvimento na primeira infância, BNCC da Educação Infantil, Marco Legal da Primeira Infância (Lei 13.257/2016) e direito à educação infantil de qualidade.",
      },
      {
        titulo: "Currículo, brincar e desenvolvimento integral",
        descricao: "Currículo da Educação Infantil, organização do tempo e do espaço pedagógico, brincar como linguagem e campos de experiências para bebês e crianças pequenas.",
      },
      {
        titulo: "Equipes pedagógicas, famílias e comunidade",
        descricao: "Formação e supervisão de equipes que atuam com bebês e crianças, articulação com famílias, conselhos escolares e participação da comunidade na unidade.",
      },
      {
        titulo: "Gestão da rede e rede de proteção",
        descricao: "Construção da matriz aplicada de inovação na educação infantil, gestão da rede municipal, articulação intersetorial com saúde e assistência social.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 6 módulos",
    tituloHtml: `Estrutura modular · <em>6 módulos</em>`,
    intro: "O PINEI é composto por 6 módulos sequenciais de 8 horas cada, totalizando 48 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Marco legal, ciência da primeira infância e BNCC da Educação Infantil",
        descricao: "Fundamentos contemporâneos da educação infantil articulados ao Marco Legal da Primeira Infância (Lei 13.257/2016), à BNCC da Educação Infantil e à ciência do desenvolvimento de bebês e crianças.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Currículo da Educação Infantil: organização do tempo e do espaço pedagógico",
        descricao: "Organização institucional do currículo, do tempo e do espaço pedagógico em creches e pré-escolas, articulando campos de experiências, rotina e ambientes educadores.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Brincar, linguagens e desenvolvimento integral de bebês e crianças",
        descricao: "O brincar como linguagem central do desenvolvimento integral — articulando linguagens, interações e práticas pedagógicas em creches e pré-escolas da rede pública.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "IV",
        titulo: "Formação de equipes pedagógicas e coordenação na Educação Infantil",
        descricao: "Formação institucional de equipes que atuam com bebês e crianças — supervisão pedagógica, coordenação e cultura institucional da rede municipal.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "V",
        titulo: "Articulação com famílias, comunidade e rede de proteção à primeira infância",
        descricao: "Articulação institucional com famílias, conselhos e rede intersetorial de proteção — Educação, Saúde, Assistência Social e órgãos do Sistema de Garantia de Direitos.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Aplicação institucional e construção da matriz PINEI de inovação",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inovação na educação infantil para a sua rede municipal de origem.",
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
        titulo: "Marco legal, ciência da primeira infância e BNCC da Educação Infantil",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos da educação infantil articulados ao Marco Legal da Primeira Infância (Lei 13.257/2016), à BNCC da Educação Infantil e à ciência do desenvolvimento de bebês e crianças.",
        topicos: [
          "Marco Legal da Primeira Infância e Constituição de 1988",
          "BNCC da Educação Infantil aplicada às redes municipais",
          "Ciência do desenvolvimento de bebês e crianças pequenas",
          "Direito à educação infantil de qualidade no Brasil",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Currículo da Educação Infantil: organização do tempo e do espaço pedagógico",
        cargaHoraria: "8h",
        descricao: "Organização institucional do currículo, do tempo e do espaço pedagógico em creches e pré-escolas, articulando campos de experiências, rotina e ambientes educadores.",
        topicos: [
          "Campos de experiências e organização curricular",
          "Rotina, tempo e ambientes educadores na unidade",
          "Documentação pedagógica e registro do desenvolvimento",
          "Planejamento institucional da rede municipal",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Brincar, linguagens e desenvolvimento integral de bebês e crianças",
        cargaHoraria: "8h",
        descricao: "O brincar como linguagem central do desenvolvimento integral — articulando linguagens, interações e práticas pedagógicas em creches e pré-escolas da rede pública.",
        topicos: [
          "Brincar como linguagem e direito da infância",
          "Linguagens e interações na Educação Infantil",
          "Práticas pedagógicas com bebês e crianças pequenas",
          "Desenvolvimento integral e qualidade da oferta",
        ],
        ctaInscricao: true,
      },
      {
        numero: "IV",
        titulo: "Formação de equipes pedagógicas e coordenação na Educação Infantil",
        cargaHoraria: "8h",
        descricao: "Formação institucional de equipes que atuam com bebês e crianças — supervisão pedagógica, coordenação e cultura institucional da rede municipal.",
        topicos: [
          "Formação inicial e continuada de professoras e professores",
          "Supervisão e coordenação pedagógica em creches e pré-escolas",
          "Cultura institucional da rede municipal de educação infantil",
          "Equipes multiprofissionais e atuação intersetorial",
        ],
      },
      {
        numero: "V",
        titulo: "Articulação com famílias, comunidade e rede de proteção à primeira infância",
        cargaHoraria: "8h",
        descricao: "Articulação institucional com famílias, conselhos e rede intersetorial de proteção — Educação, Saúde, Assistência Social e órgãos do Sistema de Garantia de Direitos.",
        topicos: [
          "Articulação institucional com famílias e responsáveis",
          "Conselhos escolares e participação comunitária",
          "Articulação intersetorial: Saúde, Assistência e Educação",
          "Sistema de Garantia de Direitos e rede de proteção",
        ],
      },
      {
        numero: "VI",
        titulo: "Aplicação institucional e construção da matriz PINEI de inovação",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de inovação na educação infantil para a sua rede municipal de origem.",
        topicos: [
          "Síntese articulada dos cinco módulos anteriores",
          "Construção orientada da matriz institucional do PINEI",
          "Plano de aplicação da matriz na rede municipal",
          "Encerramento e construção de comunidade da primeira infância",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PINEI",
    tituloHtml: `O que a instituição <em>leva</em> do PINEI`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Educação infantil estruturada institucionalmente na rede municipal.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Currículo da Educação Infantil aplicado e ambientes pedagógicos qualificados.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Brincar consolidado como linguagem central do desenvolvimento integral.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Equipes pedagógicas formadas para a atuação com bebês e crianças.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Articulação intersetorial documentada com saúde, assistência e proteção.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de inovação na educação infantil construída para a rede municipal.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PINEI uma referência",
    tituloHtml: `O que torna o PINEI <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade da Educação Infantil brasileira",
        descricao: "Estruturado a partir da prática real das redes municipais brasileiras, articulando ciência da primeira infância e marco legal nacional.",
      },
      {
        titulo: "Coordenação com trajetória em primeira infância",
        descricao: "Coordenação científica e docentes com vivência aplicada em redes municipais, conselhos de educação e instituições de referência em Educação Infantil.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de inovação na educação infantil construída para a rede municipal do participante.",
      },
      {
        titulo: "Articulação intersetorial estruturada",
        descricao: "Conexão explícita entre Educação Infantil, Saúde, Assistência Social e Sistema de Garantia de Direitos — abordagem integral à primeira infância.",
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
    titulo: "Curadoria técnica para a educação infantil de qualidade",
    tituloHtml: `Curadoria técnica para a <em>educação infantil de qualidade</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PINEI articula gestores municipais de educação, especialistas em primeira infância, currículo da Educação Infantil, formação de equipes pedagógicas e articulação intersetorial para apoiar redes e equipes na construção institucional da inovação na educação infantil.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Primeira infância e Educação Infantil institucional",
        axisBadge: "Primeira infância",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em redes municipais de educação infantil, conselhos de educação e formação executiva de quadros da primeira infância brasileira.",
        eixo: "Primeira infância e marco legal",
        modulos: "I · IV · VI",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Currículo da Educação Infantil e desenvolvimento integral",
        axisBadge: "Currículo e desenvolvimento",
        nome: "Nome em validação institucional",
        credencial: "Atuação em currículo da BNCC da Educação Infantil, campos de experiências e práticas pedagógicas com bebês e crianças pequenas.",
        eixo: "Currículo e desenvolvimento integral",
        modulos: "II · III",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo de atuação",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidada · Marco Legal da Primeira Infância e BNCC",
        axisBadge: "Marco legal e BNCC",
        nome: "Especialista convidada",
        credencial: "Marco Legal da Primeira Infância (Lei 13.257/2016), BNCC da Educação Infantil e direito à educação aplicado às redes municipais.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Currículo e organização do tempo e espaço pedagógico",
        axisBadge: "Currículo e ambientes",
        nome: "Especialista convidada",
        credencial: "Currículo da Educação Infantil, organização do tempo, do espaço pedagógico e documentação na rotina de creches e pré-escolas.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Brincar, linguagens e desenvolvimento integral",
        axisBadge: "Brincar e linguagens",
        nome: "Especialista convidado",
        credencial: "O brincar como linguagem, campos de experiências e práticas pedagógicas com bebês e crianças pequenas em creches e pré-escolas.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Formação e supervisão de equipes pedagógicas",
        axisBadge: "Formação de equipes",
        nome: "Especialista convidada",
        credencial: "Formação continuada de professoras e professores da Educação Infantil, supervisão pedagógica e cultura institucional da rede municipal.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Articulação com famílias e participação comunitária",
        axisBadge: "Famílias e comunidade",
        nome: "Especialista convidado",
        credencial: "Articulação com famílias, conselhos escolares, participação comunitária e diálogo institucional na Educação Infantil.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Articulação intersetorial e Sistema de Garantia de Direitos",
        axisBadge: "Articulação intersetorial",
        nome: "Especialista convidada",
        credencial: "Articulação intersetorial entre Educação, Saúde, Assistência Social e Sistema de Garantia de Direitos aplicada à primeira infância.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Gestor público convidado · Gestão da rede municipal de educação infantil",
        axisBadge: "Gestão da rede municipal",
        nome: "Gestor público convidado",
        credencial: "Direção de redes municipais de educação infantil, planejamento institucional e governança pública aplicada à primeira infância.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Indicadores institucionais da Educação Infantil",
        axisBadge: "Indicadores institucionais",
        nome: "Especialista convidada",
        credencial: "Indicadores institucionais de cobertura, qualidade e equidade na Educação Infantil — aplicação à gestão da rede municipal.",
        modulos: "VI",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos pedagógicos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "6",   lbl: "Módulos cobertos" },
      { num: "48h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PINEI é organizada por competências pedagógicas e institucionais da educação infantil e pode variar conforme o perfil da turma, os desafios da rede municipal contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PINEI",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PINEI é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias municipais de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 6 módulos · 48 horas</h4>
    <p>Acesso integral à arquitetura formativa do PINEI — marco legal e BNCC infantil, currículo, brincar, formação de equipes, articulação com famílias e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=pinei&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da secretaria municipal. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a secretaria municipal</h4>
    <p>Programa entregue exclusivamente à secretaria municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade da rede e o perfil das equipes da Educação Infantil.</p>
    <a class="cta" href="/contato?programa=pinei&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=pinei&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PINEI",
    tituloHtml: `Próximos módulos do <em>PINEI</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "10–11", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Marco Legal da Primeira Infância e BNCC da Educação Infantil aplicada",
      binding: "Porta de entrada · Módulo I do PINEI",
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
        titulo: "Currículo da Educação Infantil: tempo, espaço e ambientes pedagógicos",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "14", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Brincar, linguagens e desenvolvimento integral de bebês e crianças",
        metaHtml: "Módulo <strong>III</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "17–18", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Formação de equipes pedagógicas e coordenação na rede municipal",
        metaHtml: "Módulo <strong>IV</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PINEI é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias municipais ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PINEI", href: "/agenda?programa=pinei", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=pinei&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PINEI?",
        resposta: "Sim. O PINEI é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 6 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Marco legal e BNCC da Educação Infantil) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PINEI é indicado para municípios de qualquer porte?",
        resposta: "Sim. O programa é dimensionado para redes municipais de qualquer porte, com módulos aplicáveis à realidade das pequenas, médias e grandes redes de Educação Infantil. Para mapeamento dedicado ao perfil do município e à articulação intersetorial local, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PINEI pode ser entregue exclusivamente à secretaria municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil das equipes da Educação Infantil. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 6 módulos, recebe a certificação consolidada da trilha PINEI. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PINEI</em> para a sua rede municipal.",
    corpo: "Solicite proposta institucional para sua secretaria municipal de educação — trilha completa, módulos avulsos, in company ou solução sob medida.",
  },
  sidebar: {
    titulo: "Programa estratégico",
    rows: [
      { rotulo: "Vertical",     valor: "NTC Educação" },
      { rotulo: "Estrutura",    valor: "6 módulos · 48h" },
      { rotulo: "Eixos",        valor: "4 eixos formativos" },
      { rotulo: "Modalidades",  valor: "Online · Presencial · Híbrido · In company" },
      { rotulo: "Status",       valor: "Módulos abertos" },
    ],
    entregasTitulo: "O programa entrega",
    entregas: [
      "6 módulos formativos sequenciais",
      "Marco Legal e BNCC infantil aplicados",
      "Currículo e ambientes pedagógicos qualificados",
      "Equipes formadas para bebês e crianças",
      "Matriz aplicada de inovação na Educação Infantil",
      "Certificação institucional NTC",
    ],
  },
};
