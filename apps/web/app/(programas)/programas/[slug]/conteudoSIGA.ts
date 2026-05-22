import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const SIGA: ConteudoPrograma = {
  sigla: "SIGA",
  siglaCss: "SIGA",
  siglaExibida: "SIGA",
  slug: "siga",
  nomeCompleto: "Programa de Soluções Inteligentes de Governança e Administração",
  vertical: "gestao-publica",
  verticalRotulo: "NTC Gestão Pública",
  breadcrumb: { current: "SIGA" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Soluções Inteligentes de <em>Governança e Administração</em>`,
    sub: "Capacitação executiva para gestores administrativos, equipes de planejamento, processos, governança digital e controle interno — articulando boa administração pública, modernização operacional, governança de dados e cultura de performance institucional.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=siga", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=siga&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Gestão Pública", valorSub: "Governança e Administração" },
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
    titulo: "Um programa estratégico para a boa administração pública apoiada em inteligência institucional.",
    tituloHtml: `Um programa estratégico para a <em>boa administração pública</em> apoiada em inteligência institucional.`,
    corpoHtml: `<p class="lede-block">O SIGA articula fundamentos da boa administração pública, planejamento e execução, governança de processos, controle interno e inteligência institucional em um arco formativo de 8 módulos e 64 horas, dimensionado para equipes administrativas que sustentam a operação do Estado.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre o funcionamento administrativo da instituição — secretários administrativos, diretores de planejamento e orçamento, coordenadores de processos, áreas de tecnologia da informação e equipes de controle interno — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada de modernização</strong> e <strong>protocolos institucionais</strong> que articulem boa administração e camada digital sem rupturas operacionais.</p>
<p>O SIGA não é um curso operacional sobre procedimentos administrativos isolados, nem um programa genérico de transformação digital. É um programa de governança e administração integrada — articulando planejamento, processos, controle, dados, sistemas e resultados em uma arquitetura institucional coerente. A entrega final é uma <strong>matriz aplicada de soluções inteligentes para a administração</strong>, construída pelos próprios participantes para sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio administrativo contemporâneo",
    tituloHtml: `O desafio administrativo <em>contemporâneo</em>`,
    corpoHtml: `<p>A Administração Pública brasileira opera em ambiente híbrido: processos administrativos clássicos convivem com sistemas digitais, bases de dados fragmentadas e expectativa crescente de modernização. A camada operacional do Estado precisa funcionar com previsibilidade jurídica, eficiência operacional e inteligência institucional aplicada.</p>
<p>A maioria das instituições convive simultaneamente com três pressões: heterogeneidade tecnológica das áreas administrativas, baixa integração entre planejamento, execução e controle, e demanda social por modernização sem perda de continuidade. Programas que tratam administração pública como tema apenas burocrático — ou apenas tecnológico — perdem o ponto.</p>
<p>O SIGA responde a essa pressão construindo capacidade institucional avançada: equipes administrativas que operam com método, instituições que articulam governança e dados, e áreas-meio preparadas para sustentar a operação do Estado com integridade técnica e camada digital aplicada.</p>`,
    destaqueHtml: `O que está em jogo não é o domínio operacional de procedimentos administrativos isolados nem a adoção avulsa de novas tecnologias. <strong>É a arquitetura institucional da administração pública como sistema inteligente</strong> — articulando planejamento, processos, controle, dados, governança digital e resultados em uma operação coerente, defensável e mensurável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de governança e administração inteligente — articulando boa administração pública, modernização de processos, governança de dados, controle interno e cultura de performance aplicadas à rotina das áreas-meio que sustentam a operação do Estado.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O SIGA é dimensionado para profissionais com responsabilidade direta sobre o funcionamento administrativo e a inteligência institucional do órgão:</p>`,
    chips: [
      "Secretários administrativos e adjuntos",
      "Diretores de administração, planejamento e orçamento",
      "Coordenadores de processos e modernização",
      "Gestores de TI e governança digital",
      "Equipes de controle interno e auditoria",
      "Gestores de RH, finanças e logística pública",
      "Equipes de planejamento institucional",
      "Cargos de direção e assessoramento administrativo",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Boa administração e arquitetura institucional",
        descricao: "Fundamentos atualizados da boa administração pública, organização institucional, ciclo administrativo e princípios de eficiência, legalidade e accountability aplicados ao Estado contemporâneo.",
      },
      {
        titulo: "Planejamento, orçamento e execução",
        descricao: "Planejamento institucional, ciclo orçamentário, execução administrativa, articulação entre PPA/LDO/LOA e instrumentos de programação de áreas-meio na Administração Pública.",
      },
      {
        titulo: "Processos, controle e fiscalização",
        descricao: "Gestão de processos administrativos, modernização operacional, controle interno, accountability e instrumentos de fiscalização aplicados às rotinas da área-meio.",
      },
      {
        titulo: "Inteligência institucional e governança digital",
        descricao: "Governança de dados, sistemas e interoperabilidade, transformação digital aplicada, indicadores administrativos, painéis institucionais e construção da matriz SIGA.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O SIGA é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Fundamentos da boa administração pública e arquitetura institucional",
        descricao: "Fundamentos contemporâneos da boa administração pública e arquitetura institucional brasileira — princípios da Administração, organização dos órgãos públicos e ciclo administrativo aplicado.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Planejamento estratégico, orçamento e ciclo administrativo",
        descricao: "Articulação institucional entre planejamento estratégico, ciclo orçamentário e execução administrativa, com foco em integração entre PPA, LDO, LOA e instrumentos operacionais.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Gestão de processos administrativos e modernização operacional",
        descricao: "Mapeamento, desenho e modernização de processos administrativos críticos da área-meio, com instrumentos aplicáveis à realidade institucional brasileira.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "IV",
        titulo: "Governança de dados, sistemas e interoperabilidade institucional",
        descricao: "Governança institucional de dados, sistemas administrativos e interoperabilidade aplicada à operação do Estado, com foco em integração e segurança da informação pública.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Fiscalização, controle interno e accountability administrativa",
        descricao: "Controle interno aplicado às rotinas administrativas, fiscalização, auditoria e accountability institucional na operação da área-meio.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Transformação digital aplicada à administração pública",
        descricao: "Transformação digital institucional sem rupturas operacionais — articulação entre processos clássicos, sistemas digitais e cultura administrativa contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Indicadores administrativos, performance e gestão por resultados",
        descricao: "Construção de sistemas institucionais de indicadores administrativos, painéis de governança e gestão por resultados aplicáveis às áreas-meio.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz SIGA",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de soluções inteligentes de governança e administração para a sua instituição de origem.",
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
        titulo: "Fundamentos da boa administração pública e arquitetura institucional",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos da boa administração pública e arquitetura institucional brasileira — princípios da Administração, organização dos órgãos públicos e ciclo administrativo aplicado.",
        topicos: [
          "Princípios da Administração Pública e Constituição Federal de 1988",
          "Organização institucional dos órgãos da Administração Direta e Indireta",
          "Ciclo administrativo e articulação entre meio e fim na operação pública",
          "Marco regulatório atualizado da gestão administrativa brasileira",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Planejamento estratégico, orçamento e ciclo administrativo",
        cargaHoraria: "8h",
        descricao: "Articulação institucional entre planejamento estratégico, ciclo orçamentário e execução administrativa, com foco em integração entre PPA, LDO, LOA e instrumentos operacionais.",
        topicos: [
          "Planejamento estratégico institucional aplicado a áreas-meio",
          "Ciclo orçamentário público: PPA, LDO, LOA e execução",
          "Articulação entre planejamento, orçamento e processo administrativo",
          "Instrumentos de programação e acompanhamento orçamentário",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Gestão de processos administrativos e modernização operacional",
        cargaHoraria: "8h",
        descricao: "Mapeamento, desenho e modernização de processos administrativos críticos da área-meio, com instrumentos aplicáveis à realidade institucional brasileira.",
        topicos: [
          "Mapeamento e desenho de processos administrativos",
          "Modernização operacional e redução de etapas redundantes",
          "Gestão documental e fluxos digitais aplicados",
          "Padronização institucional e melhoria contínua",
        ],
        ctaInscricao: true,
      },
      {
        numero: "IV",
        titulo: "Governança de dados, sistemas e interoperabilidade institucional",
        cargaHoraria: "8h",
        descricao: "Governança institucional de dados, sistemas administrativos e interoperabilidade aplicada à operação do Estado, com foco em integração e segurança da informação pública.",
        topicos: [
          "Arquitetura institucional de dados na Administração",
          "Sistemas administrativos e interoperabilidade",
          "LGPD aplicada ao setor público e segurança da informação",
          "Dados abertos e transparência institucional",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Fiscalização, controle interno e accountability administrativa",
        cargaHoraria: "8h",
        descricao: "Controle interno aplicado às rotinas administrativas, fiscalização, auditoria e accountability institucional na operação da área-meio.",
        topicos: [
          "Sistemas de controle interno aplicado à Administração",
          "Fiscalização administrativa e auditoria governamental",
          "Accountability institucional e prestação de contas",
          "Articulação com tribunais de contas e órgãos de controle externo",
        ],
      },
      {
        numero: "VI",
        titulo: "Transformação digital aplicada à administração pública",
        cargaHoraria: "8h",
        descricao: "Transformação digital institucional sem rupturas operacionais — articulação entre processos clássicos, sistemas digitais e cultura administrativa contemporânea.",
        topicos: [
          "Estratégias de transformação digital aplicada ao setor público",
          "Governo digital, serviços públicos digitais e cidadão",
          "Inteligência artificial aplicada à Administração Pública",
          "Cultura digital institucional e gestão da mudança",
        ],
      },
      {
        numero: "VII",
        titulo: "Indicadores administrativos, performance e gestão por resultados",
        cargaHoraria: "8h",
        descricao: "Construção de sistemas institucionais de indicadores administrativos, painéis de governança e gestão por resultados aplicáveis às áreas-meio.",
        topicos: [
          "Indicadores administrativos aplicáveis à Administração Pública",
          "Painéis institucionais de performance e monitoramento",
          "Gestão por resultados e cultura de mensuração",
          "Modelos de incentivo institucional vinculados a desempenho",
        ],
        ctaInscricao: true,
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz SIGA",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de soluções inteligentes de governança e administração para a sua instituição de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional administrativa",
          "Plano de aplicação da matriz na rotina das áreas-meio",
          "Encerramento e construção de comunidade de gestores administrativos",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do SIGA",
    tituloHtml: `O que a instituição <em>leva</em> do SIGA`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Capacidade institucional de gestão administrativa fortalecida nas áreas-meio do órgão.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Processos administrativos críticos mapeados, modernizados e documentados.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Articulação integrada entre planejamento, orçamento e execução administrativa.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Governança institucional de dados e sistemas administrativos aplicada.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores administrativos e performance da área-meio.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de soluções inteligentes de governança e administração para a instituição.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o SIGA uma referência",
    tituloHtml: `O que torna o SIGA <em>uma referência</em>`,
    itens: [
      {
        titulo: "Administração aplicada à realidade brasileira",
        descricao: "Programa estruturado a partir da prática real das áreas-meio da Administração Pública brasileira, articulando dimensão jurídica, operacional e tecnológica.",
      },
      {
        titulo: "Equilíbrio entre governança e tecnologia",
        descricao: "Conteúdo articula boa administração clássica e camada digital sem reduzir o programa a tema burocrático ou a curso técnico de TI.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de soluções inteligentes de governança e administração para a instituição participante.",
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
    titulo: "Inteligência administrativa e autoridade institucional",
    tituloHtml: `Inteligência administrativa e <em>autoridade institucional</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O SIGA articula gestores administrativos, especialistas em planejamento, processos, governança digital, dados, controle interno e modernização institucional para apoiar áreas-meio na operação inteligente da Administração Pública brasileira.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-gestao-publica.1920.webp`,
        imgAlt: "Coordenação científica · Administração pública e arquitetura institucional",
        axisBadge: "Administração e instituições",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em direção de áreas administrativas, planejamento institucional e modernização operacional em órgãos federais e estaduais.",
        eixo: "Boa administração pública",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Curadoria convidada · Governança digital e inteligência institucional",
        axisBadge: "Governança digital",
        nome: "Nome em validação institucional",
        credencial: "Atuação em governo digital, governança de dados, interoperabilidade de sistemas e transformação institucional aplicada ao setor público.",
        eixo: "Dados, sistemas e transformação",
        modulos: "IV · VI",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo de atuação",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Gestor público convidado · Administração pública e arquitetura institucional",
        axisBadge: "Administração pública",
        nome: "Gestor público convidado",
        credencial: "Boa administração pública, arquitetura institucional dos órgãos brasileiros e fundamentos do ciclo administrativo aplicado.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Planejamento e orçamento público",
        axisBadge: "Planejamento e orçamento",
        nome: "Especialista convidada",
        credencial: "Planejamento estratégico institucional, ciclo orçamentário público, articulação entre PPA, LDO, LOA e execução administrativa.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Processos administrativos e modernização operacional",
        axisBadge: "Processos e modernização",
        nome: "Especialista convidado",
        credencial: "Mapeamento e desenho de processos administrativos, modernização operacional e gestão documental aplicada à Administração Pública.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Governança digital, dados e interoperabilidade",
        axisBadge: "Dados e interoperabilidade",
        nome: "Especialista convidada",
        credencial: "Governança institucional de dados, arquitetura de sistemas administrativos, interoperabilidade e LGPD aplicada ao setor público.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Representante de órgão de controle · Controle interno e accountability administrativa",
        axisBadge: "Controle interno",
        nome: "Representante de órgão de controle",
        credencial: "Sistemas de controle interno, fiscalização administrativa, auditoria governamental e articulação com tribunais de contas.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidado · Transformação digital aplicada ao setor público",
        axisBadge: "Transformação digital",
        nome: "Especialista convidado",
        credencial: "Estratégias de governo digital, serviços públicos digitais, IA aplicada à Administração e gestão da mudança institucional.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidada · Indicadores administrativos e gestão por resultados",
        axisBadge: "Indicadores e performance",
        nome: "Especialista convidada",
        credencial: "Indicadores administrativos, painéis institucionais de performance e modelos de gestão por resultados aplicáveis à Administração.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Sistemas administrativos e arquitetura institucional digital",
        axisBadge: "Sistemas e arquitetura",
        nome: "Especialista convidado",
        credencial: "Arquitetura institucional de sistemas administrativos, integração entre plataformas oficiais e modernização da infraestrutura digital pública.",
        modulos: "IV · VI",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos de curadoria" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do SIGA é organizada por competências de governança administrativa e inteligência institucional, e pode variar conforme o perfil da turma, os desafios institucionais do órgão contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o SIGA",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O SIGA é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para órgãos públicos, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do SIGA — boa administração, planejamento e orçamento, processos, governança de dados, controle interno, transformação digital, indicadores e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato/proposta?programa=siga&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. Conteúdo customizável para a realidade administrativa e o perfil das áreas-meio.</p>
    <a class="cta" href="/contato/proposta?programa=siga&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato/proposta?programa=siga&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do SIGA",
    tituloHtml: `Próximos módulos do <em>SIGA</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-gestao-publica.1920.webp`,
      dataLabel: { dias: "10–11", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Curso executivo · NTC Gestão Pública",
      titulo: "Governança de dados, sistemas e interoperabilidade institucional",
      binding: "Módulo IV do SIGA · Inteligência institucional",
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
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "21", mesAno: "Mai · 2026" },
        eyebrow: "Seminário · Online",
        titulo: "Fundamentos da boa administração pública e arquitetura institucional",
        metaHtml: "Módulo <strong>I</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "15", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Híbrido · DF",
        titulo: "Gestão de processos administrativos e modernização operacional",
        metaHtml: "Módulo <strong>III</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "19", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Indicadores administrativos e gestão por resultados",
        metaHtml: "Módulo <strong>VII</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do SIGA é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para órgãos públicos ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do SIGA", href: "/agenda?programa=siga", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato/proposta?programa=siga&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do SIGA?",
        resposta: "Sim. O SIGA é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Fundamentos da boa administração pública) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O SIGA é indicado para áreas de TI e governança digital?",
        resposta: "Sim. O programa articula governança administrativa clássica e camada digital — é apropriado para gestores de TI, governança digital, dados e modernização institucional, sem reduzir o conteúdo a tema técnico ou puramente burocrático. Para áreas focadas exclusivamente em direção estratégica, recomenda-se o LIDERA; para contratações públicas, o AGIP.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O SIGA pode ser entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade administrativa do órgão e o perfil das áreas-meio. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha SIGA. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>SIGA</em> para a sua instituição.",
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
      "Boa administração pública aplicada",
      "Processos administrativos modernizados",
      "Governança de dados e sistemas",
      "Matriz aplicada de soluções inteligentes",
      "Certificação institucional NTC",
    ],
  },
};
