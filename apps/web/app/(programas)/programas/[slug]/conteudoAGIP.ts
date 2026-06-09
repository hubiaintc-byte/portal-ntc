import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const AGIP: ConteudoPrograma = {
  sigla: "AGIP",
  siglaCss: "AGIP",
  siglaExibida: "AGIP",
  slug: "agip",
  nomeCompleto: "Programa Avançado de Governança, Integridade e Performance nas Contratações Públicas",
  vertical: "gestao-publica",
  verticalRotulo: "NTC Gestão Pública",
  breadcrumb: { current: "AGIP" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa Avançado de Governança, Integridade e Performance nas <em>Contratações Públicas</em>`,
    sub: "Capacitação executiva avançada para a aplicação madura da Lei 14.133, articulando integridade institucional, governança de riscos e performance contratual baseada em indicadores.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=agip", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=agip&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Gestão Pública", valorSub: "Contratações Públicas" },
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
    titulo: "Um programa estratégico para a nova arquitetura das contratações públicas brasileiras.",
    tituloHtml: `Um programa estratégico para a <em>nova arquitetura</em> das contratações públicas brasileiras.`,
    corpoHtml: `<p class="lede-block">O AGIP articula aplicação madura da Lei 14.133/2021, integridade institucional, governança de riscos e performance contratual em um arco formativo de 8 módulos e 64 horas, dimensionado para gestores e equipes que vivem operacionalmente as contratações públicas.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre as contratações da instituição — pregoeiros, procuradores, gestores de compras, áreas de compliance e controle interno — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada</strong> e <strong>protocolos institucionais</strong> que conversem com a realidade brasileira pós-Lei 14.133.</p>
<p>O AGIP não é um curso operacional sobre como conduzir um pregão. É um programa de governança contratual — articulando jurídico, planejamento, execução, controle e performance em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de governança das contratações</strong>, construída pelos próprios participantes para sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>As contratações públicas brasileiras movimentam centenas de bilhões de reais por ano e operam em ambiente jurídico recente — com a <strong>Lei 14.133/2021</strong> ainda em consolidação interpretativa.</p>
<p>A maioria das instituições convive simultaneamente com três pressões: jurisprudência em construção, riscos institucionais multidimensionais e expectativa crescente de performance verificável. Programas de capacitação que tratam contratações como tema operacional estreito perdem o ponto.</p>
<p>O AGIP responde a essa pressão construindo capacidade institucional avançada: gestores que dominam a aplicação madura da Lei 14.133, instituições que operam com sistema de integridade documentado e contratações que entregam performance verificável.</p>`,
    destaqueHtml: `O que está em jogo não é o domínio operacional de procedimentos isolados. <strong>É a arquitetura institucional da contratação como instrumento de governança pública</strong> — articulando jurídico, planejamento, execução, controle, integridade e performance em um sistema coerente, defensável e mensurável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada nas contratações públicas — articulando aplicação madura da Lei 14.133, sistemas de integridade aplicada, governança de riscos e performance contratual baseada em indicadores institucionais.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O AGIP é dimensionado para profissionais com responsabilidade direta sobre as contratações da instituição:</p>`,
    chips: [
      "Pregoeiros e equipes de licitação",
      "Procuradores e advogados públicos",
      "Diretores de compras e suprimentos",
      "Gestores de contratos administrativos",
      "Compliance e controle interno",
      "Auditores e ouvidores públicos",
      "Equipes de planejamento de aquisições",
      "Lideranças de áreas de licitação",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Aplicação madura da Lei 14.133",
        descricao: "Fundamentos jurídicos atualizados, jurisprudência consolidada, planejamento, modalidades, procedimentos e seleção do fornecedor sob a nova lei.",
      },
      {
        titulo: "Integridade e mitigação de riscos",
        descricao: "Sistemas de integridade institucional, identificação e documentação de riscos, protocolos de mitigação aplicáveis às etapas críticas da contratação.",
      },
      {
        titulo: "Performance e indicadores",
        descricao: "Indicadores de performance contratual, metodologias de monitoramento, governança de resultados e painéis institucionais de acompanhamento.",
      },
      {
        titulo: "Aplicação institucional",
        descricao: "Construção da matriz aplicada de governança das contratações, articulação institucional entre planejamento, jurídico, execução e controle.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O AGIP é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Fundamentos jurídicos atualizados da Lei 14.133/2021",
        descricao: "Atualização jurídica fundamentada para profissionais que aplicam a Lei 14.133 na prática institucional, com leitura crítica de jurisprudência consolidada e interpretações em construção.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "II",
        titulo: "Planejamento e governança da contratação",
        descricao: "Articulação institucional do planejamento das contratações como instrumento de governança pública.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "III",
        titulo: "Modalidades, procedimentos e seleção do fornecedor",
        descricao: "Aplicação operacional avançada das modalidades de licitação e procedimentos auxiliares sob a Lei 14.133.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "IV",
        titulo: "Riscos institucionais e protocolos de mitigação",
        descricao: "Identificação, documentação e mitigação de riscos institucionais nas etapas críticas do processo de contratação.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Integridade aplicada às contratações",
        descricao: "Sistemas de integridade institucional aplicados ao planejamento, à seleção e à execução das contratações.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "VI",
        titulo: "Performance contratual: indicadores e governança de resultados",
        descricao: "Indicadores de performance aplicáveis à gestão contratual e construção de painéis institucionais de acompanhamento.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Tecnologia, dados e transformação das contratações",
        descricao: "Instrumentos tecnológicos e dados aplicados às contratações públicas como suporte à decisão institucional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz AGIP",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de governança das contratações para sua instituição de origem.",
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
        titulo: "Fundamentos jurídicos atualizados da Lei 14.133/2021",
        cargaHoraria: "8h",
        descricao: "Atualização jurídica fundamentada para profissionais que aplicam a Lei 14.133 na prática institucional, com leitura crítica de jurisprudência consolidada e interpretações em construção.",
        topicos: [
          "Marco regulatório atual e jurisprudência consolidada",
          "Princípios da nova lei e sua aplicação prática",
          "Comparação com regimes anteriores e dispositivos críticos",
          "Pontos de atenção interpretativa em consolidação",
        ],
      },
      {
        numero: "II",
        titulo: "Planejamento e governança da contratação",
        cargaHoraria: "8h",
        descricao: "Articulação institucional do planejamento das contratações como instrumento de governança pública.",
        topicos: [
          "Plano Anual de Contratações como instrumento estratégico",
          "Estudos técnicos preliminares e termo de referência maduro",
          "Análise de risco no planejamento da contratação",
          "Articulação entre planejamento, orçamento e execução",
        ],
      },
      {
        numero: "III",
        titulo: "Modalidades, procedimentos e seleção do fornecedor",
        cargaHoraria: "8h",
        descricao: "Aplicação operacional avançada das modalidades de licitação e procedimentos auxiliares sob a Lei 14.133.",
        topicos: [
          "Pregão eletrônico e presencial: aplicação consolidada",
          "Concorrência, concurso e leilão sob a nova lei",
          "Diálogo competitivo e procedimentos auxiliares",
          "Critérios de julgamento e habilitação avançada",
        ],
        ctaInscricao: true,
      },
      {
        numero: "IV",
        titulo: "Riscos institucionais e protocolos de mitigação",
        cargaHoraria: "8h",
        descricao: "Identificação, documentação e mitigação de riscos institucionais nas etapas críticas do processo de contratação.",
        topicos: [
          "Matriz de riscos aplicada às contratações públicas",
          "Riscos jurídicos, operacionais, financeiros e reputacionais",
          "Protocolos de mitigação por etapa do processo",
          "Documentação institucional dos riscos identificados",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Integridade aplicada às contratações",
        cargaHoraria: "8h",
        descricao: "Sistemas de integridade institucional aplicados ao planejamento, à seleção e à execução das contratações.",
        topicos: [
          "Sistemas de integridade institucional aplicada",
          "Compliance público em contratações",
          "Conflito de interesses e códigos de conduta",
          "Articulação com o controle interno e auditoria",
        ],
        ctaInscricao: true,
      },
      {
        numero: "VI",
        titulo: "Performance contratual: indicadores e governança de resultados",
        cargaHoraria: "8h",
        descricao: "Indicadores de performance aplicáveis à gestão contratual e construção de painéis institucionais de acompanhamento.",
        topicos: [
          "Indicadores de performance contratual aplicáveis",
          "Metodologias de monitoramento e governança",
          "Painéis institucionais de acompanhamento",
          "Modelos de pagamento por resultado",
        ],
      },
      {
        numero: "VII",
        titulo: "Tecnologia, dados e transformação das contratações",
        cargaHoraria: "8h",
        descricao: "Instrumentos tecnológicos e dados aplicados às contratações públicas como suporte à decisão institucional.",
        topicos: [
          "Sistemas de compras governamentais e plataformas oficiais",
          "Dados abertos, transparência e accountability",
          "Inteligência artificial aplicada às contratações",
          "Transformação digital institucional do processo",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz AGIP",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de governança das contratações para sua instituição de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional",
          "Plano de aplicação da matriz na rotina da instituição",
          "Encerramento e construção de comunidade institucional",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do AGIP",
    tituloHtml: `O que a instituição <em>leva</em> do AGIP`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Aplicação madura da Lei 14.133 em casos reais da instituição contratante.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Protocolo institucional documentado de mitigação de riscos contratuais.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Sistema de integridade aplicado às etapas críticas das contratações.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Painel institucional de indicadores de performance contratual.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Matriz aplicada de governança das contratações para a instituição.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Articulação institucional entre planejamento, jurídico, execução e controle.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o AGIP uma referência",
    tituloHtml: `O que torna o AGIP <em>uma referência</em>`,
    itens: [
      {
        titulo: "Conteúdo aplicado à realidade brasileira",
        descricao: "Programa estruturado a partir da prática institucional pós-Lei 14.133, com leitura crítica de jurisprudência consolidada.",
      },
      {
        titulo: "Especialistas com atuação pública",
        descricao: "Coordenação científica e docentes com trajetória aplicada em contratações federais e estaduais.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de governança das contratações da instituição participante.",
      },
      {
        titulo: "Flexibilidade contratual",
        descricao: "Trilha completa, módulos avulsos, in company ou solução sob medida — adequando-se ao planejamento institucional.",
      },
      {
        titulo: "Plataforma EventON NTC",
        descricao: "Módulos online com transmissão ao vivo, replay protegido e suporte técnico dedicado.",
      },
      {
        titulo: "Certificação institucional",
        descricao: "Certificado validável emitido pelo Instituto NTC do Brasil, com modular ou consolidado da trilha completa.",
      },
    ],
  },
  docentes: {
    eyebrow: "Autoridade técnica",
    titulo: "Notáveis em contratações públicas, governança e controle",
    tituloHtml: `Notáveis em <em>contratações públicas</em>, governança e controle`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O AGIP reúne autoridades, juristas, especialistas em controle, professores, gestores e profissionais de referência nacional para apoiar a aplicação madura da Lei 14.133/2021, com visão estratégica, segurança jurídica e performance institucional.</p>`,
    coordenacaoMarker: "Notáveis convidados",
    coordenacao: [
      {
        tag: "Notável convidado",
        imgSrc: `${IMG}/autoridade-contratacoes.1920.webp`,
        imgAlt: "Autoridade convidada · Lei 14.133/2021 e jurisprudência aplicada",
        axisBadge: "Lei 14.133 · Jurisprudência",
        nome: "Autoridade em validação institucional",
        credencial: "Trajetória reconhecida em direito administrativo, contratações públicas e construção interpretativa da Lei 14.133/2021 em órgãos federais e tribunais superiores.",
        eixo: "Regime jurídico e segurança decisória",
        modulos: "I · III · VIII",
      },
      {
        tag: "Notável convidado",
        imgSrc: `${IMG}/autoridade-gestao-publica.1920.webp`,
        imgAlt: "Autoridade convidada · Controle externo e tribunais de contas",
        axisBadge: "Controle externo",
        nome: "Autoridade em validação institucional",
        credencial: "Atuação consolidada em controle externo, tribunais de contas e responsabilização administrativa, com foco na contratação pública como instrumento de governança.",
        eixo: "Controle externo e responsabilização",
        modulos: "IV · V · VI",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo de atuação",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Jurista convidado · Direito administrativo e Lei 14.133/2021",
        axisBadge: "Direito público",
        nome: "Jurista convidado",
        credencial: "Direito administrativo aplicado, regime jurídico da Lei 14.133/2021 e segurança decisória em atos de gestão e contratações.",
        modulos: "I · III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Governança e planejamento das contratações",
        axisBadge: "Governança e planejamento",
        nome: "Especialista convidada",
        credencial: "Plano Anual de Contratações, estudos técnicos preliminares, termo de referência e articulação institucional do planejamento.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Representante de órgão de controle · Tribunais de contas e auditoria governamental",
        axisBadge: "Controle externo",
        nome: "Representante de órgão de controle",
        credencial: "Tribunais de contas, controladorias internas e auditoria governamental aplicadas às etapas críticas da contratação pública.",
        modulos: "IV · V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Integridade, riscos e compliance público",
        axisBadge: "Integridade e compliance",
        nome: "Especialista convidado",
        credencial: "Sistemas de integridade institucional, compliance público, matrizes de risco e protocolos de mitigação aplicáveis a contratações.",
        modulos: "IV · V",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Gestor público convidado · Gestão e fiscalização contratual",
        axisBadge: "Gestão contratual",
        nome: "Gestor público convidado",
        credencial: "Gestão e fiscalização contratual, pesquisa de preços, formulação de termos de referência e administração de fornecedores no setor público.",
        modulos: "II · VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Pregão, concorrência e contratação direta",
        axisBadge: "Modalidades de licitação",
        nome: "Especialista convidada",
        credencial: "Pregão eletrônico, concorrência, credenciamento, diálogo competitivo e regimes de contratação direta sob a Lei 14.133/2021.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Performance contratual e governança de resultados",
        axisBadge: "Performance e indicadores",
        nome: "Especialista convidado",
        credencial: "Indicadores de performance contratual, painéis institucionais de monitoramento e modelos de pagamento orientados a resultado.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Professor convidado · Jurisprudência aplicada e segurança decisória",
        axisBadge: "Jurisprudência aplicada",
        nome: "Professor convidado",
        credencial: "Leitura crítica da jurisprudência consolidada e em construção, com foco em segurança decisória nas etapas críticas da contratação.",
        modulos: "I · VII",
      },
    ],
    counters: [
      { num: "8",      lbl: "Eixos de curadoria" },
      { num: "2",      lbl: "Notáveis em destaque" },
      { num: "8",      lbl: "Módulos cobertos" },
      { num: "14.133", lbl: "Lei de referência" },
    ],
    nota: "A composição docente do AGIP pode variar por edição, formato, localidade e disponibilidade dos especialistas convidados, preservando a curadoria técnica e os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o AGIP",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O AGIP é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para órgãos públicos, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do AGIP — fundamentos jurídicos, governança, integridade, performance e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=agip&modalidade=trilha">Solicitar proposta da trilha →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Módulo avulso</span>
    <h4>Qualquer módulo individual</h4>
    <p>Inscrição em módulos específicos conforme necessidade do participante ou da instituição. Pode-se iniciar pela trilha em qualquer módulo aberto e progredir conforme calendário.</p>
    <a class="cta" href="#modulos-abertos">Ver módulos abertos →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">In company</span>
    <h4>Turma fechada para a instituição</h4>
    <p>Programa entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional.</p>
    <a class="cta" href="/contato?programa=agip&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=agip&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do AGIP",
    tituloHtml: `Próximos módulos do <em>AGIP</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-gestao-publica.1920.webp`,
      dataLabel: { dias: "4 encontros", mesAno: "Jun – Jul · 2026" },
      modalidade: "Híbrido · São Paulo",
      eyebrow: "Oficina executiva · NTC Gestão Pública",
      titulo: "Integridade e performance nas contratações públicas — fundamentos avançados",
      binding: "Trilha integrada · Módulos III + IV + V do AGIP",
      metas: [
        "<strong>24h</strong> · 4 encontros",
        "Híbrido · presencial em São Paulo + online ao vivo",
        "Replay protegido <strong>· EventOn NTC</strong>",
      ],
      ctaPrimario: "Inscrever-se",
      ctaSecundario: "Ver detalhes",
    },
    miniStack: [
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "06", mesAno: "Ago · 2026" },
        eyebrow: "Seminário · Online",
        titulo: "Aplicação madura da Lei 14.133 — jurisprudência e prática",
        metaHtml: "Módulo <strong>I</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "22", mesAno: "Ago · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Performance contratual aplicada e construção de painéis",
        metaHtml: "Módulo <strong>VI</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "10–11", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Planejamento e governança da contratação pública",
        metaHtml: "Módulo <strong>II</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do AGIP é atualizada conforme a edição e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para órgãos públicos ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do AGIP", href: "/agenda?programa=agip", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=agip&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do AGIP?",
        resposta: "Sim. O AGIP é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Fundamentos jurídicos) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O AGIP pode ser entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade institucional. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "A trilha completa precisa ser cursada em sequência?",
        resposta: "Não obrigatoriamente. O participante pode cursar os módulos conforme a agenda permitir, dentro de um período de 18 meses. Para a certificação consolidada da trilha, basta concluir os 8 módulos com presença mínima em cada um.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha AGIP. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>AGIP</em> para a sua instituição.",
    corpo: "Solicite proposta institucional para sua secretaria, autarquia ou órgão público — trilha completa, módulos avulsos, in company ou solução sob medida.",
  },
  sidebar: {
    titulo: "Programa estratégico",
    rows: [
      { rotulo: "Vertical",     valor: "NTC Gestão Pública" },
      { rotulo: "Estrutura",    valor: "8 módulos · 64h" },
      { rotulo: "Eixos",        valor: "4 eixos formativos" },
      { rotulo: "Modalidades",  valor: "Online · Presencial · Híbrido · In company" },
      { rotulo: "Status",       valor: "Módulos abertos" },
    ],
    entregasTitulo: "O programa entrega",
    entregas: [
      "8 módulos formativos sequenciais",
      "Aplicação madura da Lei 14.133",
      "Sistema de integridade aplicada",
      "Painel de indicadores de performance",
      "Matriz aplicada de governança",
      "Certificação institucional NTC",
    ],
  },
};
