import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const LIDERA: ConteudoPrograma = {
  sigla: "LIDERA",
  siglaCss: "LIDERA",
  siglaExibida: "LIDERA",
  slug: "lidera",
  nomeCompleto: "Liderança, Direção Estratégica e Resultados na Administração",
  vertical: "gestao-publica",
  verticalRotulo: "NTC Gestão Pública",
  breadcrumb: { current: "LIDERA" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Liderança, Direção Estratégica e Resultados na <em>Administração Pública</em>`,
    sub: "Capacitação executiva para gestores, secretários e lideranças com responsabilidade direta sobre a direção institucional — articulando liderança pública contemporânea, decisão estratégica baseada em evidências e cultura de performance verificável.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=lidera", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=lidera&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Gestão Pública", valorSub: "Liderança e Direção Estratégica" },
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
    titulo: "Um programa estratégico para a direção institucional da Administração Pública brasileira.",
    tituloHtml: `Um programa estratégico para a <em>direção institucional</em> da Administração Pública brasileira.`,
    corpoHtml: `<p class="lede-block">O LIDERA articula liderança pública contemporânea, direção estratégica, governança de resultados e cultura de performance em um arco formativo de 8 módulos e 64 horas, dimensionado para gestores que ocupam — ou são preparados para ocupar — posições de direção na Administração.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a direção institucional — secretários, secretários-adjuntos, superintendentes, diretores e coordenadores de áreas estratégicas — que precisam de <strong>repertório executivo atualizado</strong>, <strong>metodologia aplicada à decisão pública</strong> e <strong>protocolos institucionais</strong> que conversem com a complexidade real da gestão pública brasileira contemporânea.</p>
<p>O LIDERA não é um curso de liderança comportamental nem um programa genérico de gestão. É um programa de direção estratégica aplicada — articulando visão institucional, decisão baseada em evidências, gestão de pessoas, performance e articulação política em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de liderança e direção</strong>, construída pelos próprios participantes para sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A Administração Pública brasileira opera em ambiente de complexidade crescente — multiplicidade de stakeholders, ciclos políticos curtos, pressão social por resultados verificáveis e regulação cada vez mais densa. Cargos de direção exigem hoje uma combinação rara de visão estratégica, capacidade técnica e habilidade institucional.</p>
<p>A maioria das instituições convive simultaneamente com três pressões: rotatividade de quadros estratégicos, decisões cada vez mais complexas com janelas mais curtas e expectativa social por performance mensurável. Programas de capacitação que tratam liderança como tema comportamental abstrato perdem o ponto.</p>
<p>O LIDERA responde a essa pressão construindo capacidade institucional avançada: lideranças que dirigem com método, instituições que operam com cultura de performance documentada e quadros estratégicos preparados para sustentar a continuidade institucional para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências genéricas de liderança. <strong>É a arquitetura institucional da direção pública como instrumento de governança</strong> — articulando visão estratégica, decisão baseada em evidências, gestão de pessoas, performance e articulação política em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de liderança e direção estratégica na Administração Pública — articulando visão institucional, decisão baseada em evidências, gestão de pessoas e cultura de performance verificável aplicadas à rotina das posições de direção.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O LIDERA é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a direção institucional:</p>`,
    chips: [
      "Secretários e secretários-adjuntos",
      "Superintendentes e diretores executivos",
      "Chefes de gabinete",
      "Coordenadores e gerentes estratégicos",
      "Cargos de direção e assessoramento (DAS · CC)",
      "Equipes de planejamento estratégico",
      "Lideranças em formação na Administração",
      "Quadros sucessórios institucionais",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Liderança pública contemporânea",
        descricao: "Fundamentos contemporâneos de liderança aplicada ao setor público, modelos de direção institucional e referenciais consolidados para a tomada de posição em cargos estratégicos.",
      },
      {
        titulo: "Direção estratégica e decisão",
        descricao: "Construção da visão institucional, metodologias de decisão baseada em evidências, planejamento estratégico aplicado e articulação entre direção, áreas técnicas e equipes.",
      },
      {
        titulo: "Performance e cultura de resultados",
        descricao: "Indicadores estratégicos institucionais, painéis de governança de resultados, accountability pública e modelos de monitoramento aplicáveis à Administração.",
      },
      {
        titulo: "Aplicação institucional",
        descricao: "Construção da matriz aplicada de liderança e direção, articulação política e técnica, gestão de pessoas e formação de equipes de alta performance.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O LIDERA é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Liderança pública contemporânea: fundamentos e modelos de direção",
        descricao: "Fundamentos contemporâneos de liderança aplicada à Administração Pública, com leitura crítica de modelos consolidados e referenciais brasileiros e internacionais relevantes para cargos de direção.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Direção estratégica e construção da visão institucional",
        descricao: "Construção da visão institucional como instrumento de direção pública — articulando diagnóstico, prioridades e arquitetura de implementação.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Decisão baseada em evidências e governança de resultados",
        descricao: "Metodologias de decisão baseada em evidências aplicadas à rotina do cargo de direção — articulando dados, contexto e responsabilidade institucional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Gestão de pessoas, cultura organizacional e equipes de alta performance",
        descricao: "Construção e direção de equipes de alta performance no setor público, com foco em cultura organizacional, gestão de talentos e formação de quadros sucessórios.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Performance institucional: indicadores, painéis e accountability",
        descricao: "Construção de sistemas institucionais de performance — indicadores estratégicos, painéis de governança e accountability aplicáveis à direção pública.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Comunicação estratégica e articulação política-institucional",
        descricao: "Comunicação executiva, posicionamento institucional e articulação com stakeholders relevantes para o exercício do cargo de direção pública.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Liderança em cenários de complexidade e gestão de crises",
        descricao: "Direção em ambientes de complexidade e gestão de crises institucionais — protocolos, decisão sob pressão e proteção da continuidade institucional.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz LIDERA",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de liderança e direção institucional para a sua instituição de origem.",
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
        titulo: "Liderança pública contemporânea: fundamentos e modelos de direção",
        cargaHoraria: "8h",
        descricao: "Fundamentos contemporâneos de liderança aplicada à Administração Pública, com leitura crítica de modelos consolidados e referenciais brasileiros e internacionais relevantes para cargos de direção.",
        topicos: [
          "Modelos contemporâneos de liderança pública",
          "Diferenças entre liderança política, técnica e institucional",
          "Repertório executivo do cargo de direção",
          "Autoconhecimento de estilo de direção e pontos de atenção",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Direção estratégica e construção da visão institucional",
        cargaHoraria: "8h",
        descricao: "Construção da visão institucional como instrumento de direção pública — articulando diagnóstico, prioridades e arquitetura de implementação.",
        topicos: [
          "Diagnóstico institucional rápido e dirigido",
          "Construção de visão estratégica para o cargo",
          "Definição de prioridades sob restrição orçamentária",
          "Articulação entre visão, planejamento e execução",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Decisão baseada em evidências e governança de resultados",
        cargaHoraria: "8h",
        descricao: "Metodologias de decisão baseada em evidências aplicadas à rotina do cargo de direção — articulando dados, contexto e responsabilidade institucional.",
        topicos: [
          "Metodologias de decisão pública contemporânea",
          "Uso de evidências, dados e indicadores na decisão",
          "Governança de resultados e modelos de monitoramento",
          "Decisão em ambientes de incerteza e janelas curtas",
        ],
      },
      {
        numero: "IV",
        titulo: "Gestão de pessoas, cultura organizacional e equipes de alta performance",
        cargaHoraria: "8h",
        descricao: "Construção e direção de equipes de alta performance no setor público, com foco em cultura organizacional, gestão de talentos e formação de quadros sucessórios.",
        topicos: [
          "Diagnóstico e construção de equipes estratégicas",
          "Cultura organizacional aplicada à Administração Pública",
          "Gestão de talentos, sucessão e desenvolvimento de equipes",
          "Liderança de equipes em ambientes públicos complexos",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Performance institucional: indicadores, painéis e accountability",
        cargaHoraria: "8h",
        descricao: "Construção de sistemas institucionais de performance — indicadores estratégicos, painéis de governança e accountability aplicáveis à direção pública.",
        topicos: [
          "Indicadores estratégicos aplicáveis ao cargo de direção",
          "Painéis institucionais de governança e acompanhamento",
          "Accountability pública e prestação de contas",
          "Cultura de performance e mensuração de impacto",
        ],
      },
      {
        numero: "VI",
        titulo: "Comunicação estratégica e articulação política-institucional",
        cargaHoraria: "8h",
        descricao: "Comunicação executiva, posicionamento institucional e articulação com stakeholders relevantes para o exercício do cargo de direção pública.",
        topicos: [
          "Comunicação executiva aplicada à direção pública",
          "Posicionamento institucional e gestão da imagem do órgão",
          "Articulação com Legislativo, Judiciário e órgãos de controle",
          "Relacionamento com a imprensa e a sociedade civil",
        ],
      },
      {
        numero: "VII",
        titulo: "Liderança em cenários de complexidade e gestão de crises",
        cargaHoraria: "8h",
        descricao: "Direção em ambientes de complexidade e gestão de crises institucionais — protocolos, decisão sob pressão e proteção da continuidade institucional.",
        topicos: [
          "Mapeamento institucional de cenários de complexidade",
          "Protocolos de gestão de crises públicas",
          "Decisão sob pressão e janelas críticas",
          "Proteção da continuidade institucional e da imagem do órgão",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz LIDERA",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de liderança e direção institucional para a sua instituição de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional de direção",
          "Plano de aplicação da matriz na rotina do cargo",
          "Encerramento e construção de comunidade de lideranças",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do LIDERA",
    tituloHtml: `O que a instituição <em>leva</em> do LIDERA`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Capacidade institucional de direção estratégica fortalecida nos quadros de comando.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Tomada de decisão pública estruturada em evidências, dados e responsabilidade institucional.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Cultura de performance e accountability instalada nas áreas estratégicas.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Equipes de alta performance estruturadas e quadros sucessórios mapeados.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Painel institucional de indicadores estratégicos da área de direção.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de liderança e direção institucional para a instituição.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o LIDERA uma referência",
    tituloHtml: `O que torna o LIDERA <em>uma referência</em>`,
    itens: [
      {
        titulo: "Liderança aplicada à realidade brasileira",
        descricao: "Programa estruturado a partir da prática real da Administração Pública brasileira, sem importação acrítica de modelos estrangeiros.",
      },
      {
        titulo: "Coordenação com trajetória executiva",
        descricao: "Coordenação científica e docentes com vivência aplicada em cargos de direção federais, estaduais e municipais.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de liderança e direção construída para a instituição do participante.",
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
    titulo: "Lideranças e especialistas para a alta gestão pública",
    tituloHtml: `Lideranças e especialistas para a <em>alta gestão pública</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O LIDERA articula gestores públicos, especialistas em liderança, governança, estratégia, comunicação, pessoas, inovação e resultados institucionais para apoiar dirigentes e equipes na tomada de decisão e na condução de organizações públicas.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-gestao-publica.1920.webp`,
        imgAlt: "Coordenação científica · Liderança pública e direção estratégica",
        axisBadge: "Liderança e alta gestão",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em alta gestão pública, direção de órgãos federais e estaduais e formação executiva de dirigentes do Estado brasileiro.",
        eixo: "Direção estratégica institucional",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Governança executiva e performance institucional",
        axisBadge: "Governança executiva",
        nome: "Nome em validação institucional",
        credencial: "Atuação em escolas de governo, planejamento estratégico institucional e desenho de programas executivos para quadros públicos.",
        eixo: "Performance e resultados",
        modulos: "III · V",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Gestor público convidado · Liderança pública e direção estratégica",
        axisBadge: "Liderança pública",
        nome: "Gestor público convidado",
        credencial: "Liderança pública contemporânea, modelos de direção aplicados ao Estado brasileiro e formação de dirigentes para a alta gestão.",
        modulos: "I · II",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Governança executiva e tomada de decisão",
        axisBadge: "Governança executiva",
        nome: "Especialista convidada",
        credencial: "Decisão baseada em evidências, governança de resultados e modelos de articulação executiva em órgãos públicos.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Gestão de pessoas e equipes de alta performance",
        axisBadge: "Gestão de pessoas",
        nome: "Especialista convidado",
        credencial: "Cultura organizacional, equipes de alta performance e formação de quadros sucessórios na Administração Pública.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Planejamento, metas e resultados institucionais",
        axisBadge: "Planejamento e resultados",
        nome: "Especialista convidada",
        credencial: "Planejamento estratégico institucional, indicadores executivos, painéis de governança e modelos de prestação de contas pública.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Comunicação institucional e gestão de crise",
        axisBadge: "Comunicação e crise",
        nome: "Especialista convidado",
        credencial: "Comunicação executiva, posicionamento institucional, articulação política e gestão de crise pública aplicadas à direção.",
        modulos: "VI · VII",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Inovação, transformação digital e inteligência institucional",
        axisBadge: "Inovação e transformação",
        nome: "Especialista convidada",
        credencial: "Inovação institucional, transformação digital, dados e inteligência aplicada à direção pública e à modernização de órgãos.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Cultura organizacional e alta performance",
        axisBadge: "Cultura e alta performance",
        nome: "Especialista convidado",
        credencial: "Cultura organizacional aplicada ao serviço público, modelos de alta performance e formação de equipes estratégicas de direção.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Gestão de conflitos e negociação pública",
        axisBadge: "Negociação pública",
        nome: "Especialista convidada",
        credencial: "Negociação institucional, gestão de conflitos, articulação política e diálogo com órgãos de controle, Legislativo e sociedade.",
        modulos: "VI · VII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos executivos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do LIDERA é organizada por competências executivas e pode variar conforme o perfil da turma, os desafios institucionais do órgão contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o LIDERA",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O LIDERA é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para órgãos públicos, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do LIDERA — liderança pública, direção estratégica, decisão por evidências, gestão de pessoas, performance, comunicação, gestão de crises e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=lidera&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil dos quadros de direção.</p>
    <a class="cta" href="/contato?programa=lidera&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=lidera&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do LIDERA",
    tituloHtml: `Próximos módulos do <em>LIDERA</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-gestao-publica.1920.webp`,
      dataLabel: { dias: "28–29", mesAno: "Mai · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário executivo · NTC Gestão Pública",
      titulo: "Liderança pública contemporânea — fundamentos e modelos de direção",
      binding: "Porta de entrada · Módulo I do LIDERA",
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
        dataLabel: { dias: "17", mesAno: "Jun · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Direção estratégica e construção da visão institucional",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "23", mesAno: "Jul · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Equipes de alta performance no setor público",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-gestao-publica.1920.webp`,
        dataLabel: { dias: "02–03", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Decisão baseada em evidências e governança de resultados",
        metaHtml: "Módulo <strong>III</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do LIDERA é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para órgãos públicos ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do LIDERA", href: "/agenda?programa=lidera", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=lidera&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do LIDERA?",
        resposta: "Sim. O LIDERA é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Liderança pública contemporânea) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O LIDERA é indicado para lideranças em formação?",
        resposta: "Sim. O programa é dimensionado tanto para quem já ocupa cargos de direção quanto para quadros em formação — coordenadores e gerentes estratégicos sendo preparados para posições de comando. Para mapeamento sucessório institucional, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O LIDERA pode ser entregue exclusivamente à instituição contratante (secretaria, autarquia, fundação, órgão público), em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade institucional e o perfil dos quadros de direção. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha LIDERA. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>LIDERA</em> para a sua instituição.",
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
      "Capacidade de direção estratégica",
      "Decisão baseada em evidências",
      "Painel de indicadores estratégicos",
      "Matriz aplicada de liderança",
      "Certificação institucional NTC",
    ],
  },
};
