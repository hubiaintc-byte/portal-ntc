import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const FUTURA: ConteudoPrograma = {
  sigla: "FUTURA",
  siglaCss: "FUTURA",
  siglaExibida: "FUTURA",
  slug: "futura",
  nomeCompleto: "Programa de Educação para o Futuro",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "FUTURA" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "4",   lbl: "Módulos formativos" },
      { num: "32h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Educação para o <em>Futuro</em>`,
    sub: "Capacitação executiva para secretarias estaduais e coordenadorias de ensino médio — articulando implementação do Novo Ensino Médio, itinerários formativos, projeto de vida, mundo do trabalho e empregabilidade juvenil nas redes públicas brasileiras.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=futura", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=futura&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Ensino Médio e Empregabilidade" },
    { rotulo: "Estrutura",     valor: "4 módulos",        valorSub: "8 horas por módulo" },
    { rotulo: "Carga horária", valor: "32 horas",         valorSub: "Total do programa" },
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
    titulo: "Um programa estratégico para o Novo Ensino Médio e o futuro da juventude brasileira.",
    tituloHtml: `Um programa estratégico para o <em>Novo Ensino Médio</em> e o futuro da juventude brasileira.`,
    corpoHtml: `<p class="lede-block">O FUTURA articula implementação do Novo Ensino Médio, itinerários formativos, projeto de vida, mundo do trabalho e empregabilidade juvenil em um arco formativo de 4 módulos e 32 horas, dimensionado para secretarias estaduais de educação e coordenadorias responsáveis pela última etapa da educação básica.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre o ensino médio — secretários e secretários-adjuntos estaduais, coordenadorias de ensino médio, diretores e coordenadores pedagógicos de escolas de ensino médio, equipes de itinerários e projeto de vida, e articulação com sistema S e mundo do trabalho — que precisam de <strong>repertório atualizado</strong>, <strong>metodologia aplicada</strong> e <strong>protocolos institucionais</strong> compatíveis com a realidade da etapa mais sensível da educação básica brasileira.</p>
<p>O FUTURA não é um curso operacional sobre BNCC do Ensino Médio nem uma trilha técnica sobre orientação profissional. É um programa de implementação institucional — articulando marco regulatório, itinerários, projeto de vida e mundo do trabalho em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de educação para o futuro</strong>, construída pelos próprios participantes para sua rede estadual de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>O ensino médio brasileiro vive a etapa mais sensível de sua história contemporânea: implementação do Novo Ensino Médio (Lei 13.415/2017 e legislação subsequente), exigência de itinerários formativos, projeto de vida obrigatório, expectativa social por empregabilidade da juventude e enfrentamento da evasão. Secretarias estaduais precisam articular respostas institucionais à altura.</p>
<p>A maioria das redes estaduais convive simultaneamente com três pressões: implementação ainda em consolidação dos itinerários formativos, articulação frágil entre escola e mundo do trabalho, e necessidade de transformar projeto de vida em prática pedagógica institucional. Programas de capacitação genéricos não respondem ao desafio específico do ensino médio.</p>
<p>O FUTURA responde a essa pressão construindo capacidade institucional avançada: redes estaduais com Novo Ensino Médio implementado com método, itinerários consolidados na prática institucional, projeto de vida estruturado e articulação documentada com mundo do trabalho.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências pedagógicas pontuais sobre o ensino médio. <strong>É a arquitetura institucional da educação para o futuro como instrumento de garantia da última etapa</strong> — articulando marco regulatório, itinerários, projeto de vida e mundo do trabalho em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de implementação do Novo Ensino Médio nas redes estaduais — articulando marco regulatório, itinerários formativos, projeto de vida e mundo do trabalho aplicados à rotina das secretarias estaduais de educação e das escolas que ofertam a última etapa.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O FUTURA é dimensionado para profissionais com responsabilidade direta sobre o ensino médio nas redes públicas estaduais:</p>`,
    chips: [
      "Secretarias estaduais de educação",
      "Coordenadorias de ensino médio",
      "Diretores de escolas de ensino médio",
      "Coordenadores pedagógicos do ensino médio",
      "Equipes de itinerários e projeto de vida",
      "Articulação com sistema S e instituições profissionalizantes",
      "Equipes de currículo e avaliação do ensino médio",
      "Equipes de articulação com mundo do trabalho",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Novo Ensino Médio e arquitetura institucional",
        descricao: "Marco regulatório do Novo Ensino Médio (Lei 13.415/2017 e legislação subsequente), BNCC do Ensino Médio, organização curricular e implementação institucional na rede estadual.",
      },
      {
        titulo: "Itinerários formativos e projeto de vida",
        descricao: "Construção e organização de itinerários formativos, projeto de vida como componente curricular, articulação entre formação geral básica e parte flexível.",
      },
      {
        titulo: "Mundo do trabalho e empregabilidade juvenil",
        descricao: "Articulação com mundo do trabalho, formação profissional e tecnológica, empregabilidade da juventude e parcerias com sistema S e instituições profissionalizantes.",
      },
      {
        titulo: "Aplicação institucional na rede estadual",
        descricao: "Construção da matriz aplicada de educação para o futuro, governança da implementação, articulação com escolas e formação de equipes estratégicas do ensino médio.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 4 módulos",
    tituloHtml: `Estrutura modular · <em>4 módulos</em>`,
    intro: "O FUTURA é composto por 4 módulos sequenciais de 8 horas cada, totalizando 32 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Novo Ensino Médio: marco regulatório e implementação na rede estadual",
        descricao: "Marco regulatório consolidado do Novo Ensino Médio — Lei 13.415/2017, legislação subsequente e BNCC do Ensino Médio aplicados à implementação institucional nas redes estaduais brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Itinerários formativos e projeto de vida como componente curricular",
        descricao: "Itinerários formativos como peça central do Novo Ensino Médio e projeto de vida como componente curricular institucional — articulação entre formação geral básica e parte flexível.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Mundo do trabalho, empregabilidade juvenil e formação técnica",
        descricao: "Articulação institucional com mundo do trabalho — formação técnica e profissional, empregabilidade juvenil e parcerias estratégicas com sistema S e instituições profissionalizantes.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "IV",
        titulo: "Aplicação institucional e construção da matriz FUTURA",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de educação para o futuro para a sua rede estadual de origem.",
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
        titulo: "Novo Ensino Médio: marco regulatório e implementação na rede estadual",
        cargaHoraria: "8h",
        descricao: "Marco regulatório consolidado do Novo Ensino Médio — Lei 13.415/2017, legislação subsequente e BNCC do Ensino Médio aplicados à implementação institucional nas redes estaduais brasileiras.",
        topicos: [
          "Lei 13.415/2017 e legislação subsequente do Novo Ensino Médio",
          "BNCC do Ensino Médio: formação geral básica",
          "Organização curricular institucional da etapa",
          "Implementação na rede estadual: protocolos aplicáveis",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Itinerários formativos e projeto de vida como componente curricular",
        cargaHoraria: "8h",
        descricao: "Itinerários formativos como peça central do Novo Ensino Médio e projeto de vida como componente curricular institucional — articulação entre formação geral básica e parte flexível.",
        topicos: [
          "Construção institucional de itinerários formativos",
          "Projeto de vida como componente curricular",
          "Articulação entre formação geral básica e parte flexível",
          "Implantação dos itinerários na rede estadual",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Mundo do trabalho, empregabilidade juvenil e formação técnica",
        cargaHoraria: "8h",
        descricao: "Articulação institucional com mundo do trabalho — formação técnica e profissional, empregabilidade juvenil e parcerias estratégicas com sistema S e instituições profissionalizantes.",
        topicos: [
          "Mundo do trabalho e empregabilidade da juventude",
          "Formação técnica e profissional aplicada ao ensino médio",
          "Parcerias com sistema S e instituições profissionalizantes",
          "Indicadores institucionais de transição escola-trabalho",
        ],
        ctaInscricao: true,
      },
      {
        numero: "IV",
        titulo: "Aplicação institucional e construção da matriz FUTURA",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de educação para o futuro para a sua rede estadual de origem.",
        topicos: [
          "Síntese articulada dos três módulos anteriores",
          "Construção orientada da matriz institucional do FUTURA",
          "Plano de aplicação da matriz na rede estadual",
          "Encerramento e construção de comunidade do ensino médio",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do FUTURA",
    tituloHtml: `O que a instituição <em>leva</em> do FUTURA`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Novo Ensino Médio implementado com método na rede estadual.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Itinerários formativos consolidados na prática institucional da rede.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Projeto de vida estruturado como componente curricular efetivo.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Articulação institucional documentada com mundo do trabalho.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Parcerias com sistema S e instituições profissionalizantes ativadas.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de educação para o futuro construída para a rede estadual.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o FUTURA uma referência",
    tituloHtml: `O que torna o FUTURA <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade do Novo Ensino Médio",
        descricao: "Estruturado a partir da prática real das redes estaduais brasileiras, com leitura crítica do marco regulatório consolidado e em consolidação.",
      },
      {
        titulo: "Coordenação com trajetória executiva em ensino médio",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias estaduais, conselhos estaduais de educação e instituições de referência em ensino médio.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de educação para o futuro construída para a rede estadual do participante.",
      },
      {
        titulo: "Trilha enxuta e executiva",
        descricao: "4 módulos · 32 horas — dimensionado para gestores com agenda intensa, com formato compatível com a rotina das secretarias estaduais.",
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
    titulo: "Curadoria técnica para o Novo Ensino Médio",
    tituloHtml: `Curadoria técnica para o <em>Novo Ensino Médio</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O FUTURA articula gestores educacionais, especialistas em ensino médio, itinerários formativos, projeto de vida, mundo do trabalho e empregabilidade juvenil para apoiar redes estaduais na implementação institucional do Novo Ensino Médio brasileiro.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Novo Ensino Médio e implementação institucional",
        axisBadge: "Novo Ensino Médio",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em secretarias estaduais de educação, conselhos estaduais e implementação do Novo Ensino Médio em redes públicas brasileiras.",
        eixo: "Marco regulatório e implementação",
        modulos: "I · II · IV",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Empregabilidade juvenil e mundo do trabalho",
        axisBadge: "Mundo do trabalho",
        nome: "Nome em validação institucional",
        credencial: "Atuação em empregabilidade juvenil, formação técnica e profissional, parcerias com sistema S e articulação institucional com o mundo do trabalho.",
        eixo: "Trabalho e empregabilidade",
        modulos: "III",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo de atuação",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Jurista convidado · Marco regulatório do Novo Ensino Médio",
        axisBadge: "Marco regulatório",
        nome: "Jurista convidado",
        credencial: "Lei 13.415/2017 e legislação subsequente do Novo Ensino Médio, jurisprudência aplicada à educação e segurança institucional da etapa.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · BNCC do Ensino Médio e currículo da etapa",
        axisBadge: "BNCC do Ensino Médio",
        nome: "Especialista convidada",
        credencial: "BNCC do Ensino Médio, formação geral básica, organização curricular institucional e implantação nas redes estaduais brasileiras.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Itinerários formativos e parte flexível",
        axisBadge: "Itinerários formativos",
        nome: "Especialista convidado",
        credencial: "Construção institucional de itinerários formativos, parte flexível do Novo Ensino Médio e modelos contemporâneos aplicáveis às redes estaduais.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Projeto de vida como componente curricular",
        axisBadge: "Projeto de vida",
        nome: "Especialista convidada",
        credencial: "Projeto de vida como componente curricular institucional, formação de educadores e implementação na escola pública brasileira.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Formação técnica e profissional",
        axisBadge: "Formação técnica",
        nome: "Especialista convidado",
        credencial: "Formação técnica e profissional integrada ao Novo Ensino Médio, articulação com sistema S e instituições profissionalizantes.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Empregabilidade juvenil e mundo do trabalho",
        axisBadge: "Empregabilidade juvenil",
        nome: "Especialista convidada",
        credencial: "Empregabilidade da juventude brasileira, transição escola-trabalho e indicadores institucionais de inserção produtiva.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Gestor público convidado · Implementação na rede estadual",
        axisBadge: "Implementação estadual",
        nome: "Gestor público convidado",
        credencial: "Direção institucional de redes estaduais, implementação do Novo Ensino Médio e governança pública aplicada à última etapa da educação básica.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Juventude, cultura e diálogo geracional",
        axisBadge: "Juventude e cultura",
        nome: "Especialista convidada",
        credencial: "Juventudes contemporâneas brasileiras, cultura juvenil, diálogo geracional e estratégias institucionais de engajamento com adolescentes.",
        modulos: "II",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos pedagógicos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "4",   lbl: "Módulos cobertos" },
      { num: "32h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do FUTURA é organizada por competências do ensino médio contemporâneo e pode variar conforme o perfil da turma, os desafios da rede estadual contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o FUTURA",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O FUTURA é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias estaduais de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 4 módulos · 32 horas</h4>
    <p>Acesso integral à arquitetura formativa do FUTURA — Novo Ensino Médio, itinerários e projeto de vida, mundo do trabalho e construção da matriz institucional. Certificação consolidada da trilha, em formato enxuto e executivo.</p>
    <a class="cta" href="/contato?programa=futura&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da secretaria estadual. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a secretaria estadual</h4>
    <p>Programa entregue exclusivamente à secretaria estadual de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional da rede e o perfil das equipes do ensino médio.</p>
    <a class="cta" href="/contato?programa=futura&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=futura&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do FUTURA",
    tituloHtml: `Próximos módulos do <em>FUTURA</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "24–25", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário executivo · NTC Educação",
      titulo: "Novo Ensino Médio — marco regulatório e implementação na rede estadual",
      binding: "Porta de entrada · Módulo I do FUTURA",
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
        dataLabel: { dias: "18", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Itinerários formativos e projeto de vida como componente curricular",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "21", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Mundo do trabalho, empregabilidade juvenil e formação técnica",
        metaHtml: "Módulo <strong>III</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "22–23", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Projeto de vida na prática institucional da escola pública",
        metaHtml: "Módulo <strong>II</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do FUTURA é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias estaduais ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do FUTURA", href: "/agenda?programa=futura", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=futura&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do FUTURA?",
        resposta: "Sim. O FUTURA é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 4 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Novo Ensino Médio: marco regulatório) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O FUTURA é indicado para redes que ainda estão implementando o Novo Ensino Médio?",
        resposta: "Sim. O programa é dimensionado especialmente para redes em qualquer fase da implementação — desde redes que estão iniciando até redes que precisam aprimorar a oferta de itinerários e projeto de vida. Para mapeamento dedicado ao estágio da rede estadual, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O FUTURA pode ser entregue exclusivamente à secretaria estadual de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil das equipes do ensino médio. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 4 módulos, recebe a certificação consolidada da trilha FUTURA. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>FUTURA</em> para a sua rede estadual.",
    corpo: "Solicite proposta institucional para sua secretaria estadual de educação — trilha completa, módulos avulsos, in company ou solução sob medida.",
  },
  sidebar: {
    titulo: "Programa estratégico",
    rows: [
      { rotulo: "Vertical",     valor: "NTC Educação" },
      { rotulo: "Estrutura",    valor: "4 módulos · 32h" },
      { rotulo: "Eixos",        valor: "4 eixos formativos" },
      { rotulo: "Modalidades",  valor: "Online · Presencial · Híbrido · In company" },
      { rotulo: "Status",       valor: "Módulos abertos" },
    ],
    entregasTitulo: "O programa entrega",
    entregas: [
      "4 módulos formativos sequenciais",
      "Novo Ensino Médio implementado com método",
      "Itinerários formativos consolidados",
      "Projeto de vida como componente curricular",
      "Matriz aplicada de educação para o futuro",
      "Certificação institucional NTC",
    ],
  },
};
