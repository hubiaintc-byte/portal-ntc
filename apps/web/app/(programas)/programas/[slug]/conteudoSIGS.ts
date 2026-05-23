import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const SIGS: ConteudoPrograma = {
  sigla: "SIGS",
  siglaCss: "SIGS",
  siglaExibida: "SIGS",
  slug: "sigs",
  nomeCompleto: "Sistema Integrado de Gestão em Saúde",
  vertical: "saude",
  verticalRotulo: "NTC Saúde",
  breadcrumb: { current: "SIGS" },
  hero: {
    bgSrc: `${IMG}/area-saude.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Sistema Integrado de Gestão em <em>Saúde Pública</em>`,
    sub: "Capacitação executiva para a governança integrada do Sistema Único de Saúde — articulando planejamento regional, pactuação interfederativa, financiamento, indicadores de rede e gestão estratégica das secretarias estaduais e municipais.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=sigs", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=sigs&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Saúde",          valorSub: "Gestão Integrada do SUS" },
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
    titulo: "Um programa estratégico para a governança integrada do Sistema Único de Saúde.",
    tituloHtml: `Um programa estratégico para a <em>governança integrada</em> do Sistema Único de Saúde.`,
    corpoHtml: `<p class="lede-block">O SIGS articula planejamento regional, pactuação interfederativa, financiamento, indicadores de rede e gestão estratégica em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias estaduais e municipais de saúde, gestores de redes regionais e quadros executivos do SUS.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a gestão do SUS — secretários e secretários-adjuntos de saúde, superintendentes, diretores de planejamento, coordenadores regionais e equipes técnicas de planejamento e regulação — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada à pactuação interfederativa</strong> e <strong>protocolos institucionais</strong> compatíveis com a complexidade real da gestão da saúde pública brasileira.</p>
<p>O SIGS não é um curso de gestão hospitalar nem um programa genérico de gestão pública aplicada à saúde. É um programa de governança integrada do SUS — articulando planejamento regional, pactuação CIB/CIT, financiamento tripartite, redes de atenção e indicadores de impacto em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de gestão integrada do SUS</strong>, construída pelos próprios participantes para sua instituição de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A gestão do SUS brasileiro opera em ambiente de complexidade crescente — pactuação interfederativa, sub-financiamento crônico, regionalização incompleta, redes de atenção fragmentadas, judicialização da saúde e expectativa social por resultados verificáveis. Cargos estratégicos do SUS exigem hoje uma combinação rara de visão sistêmica, capacidade técnica e habilidade política-institucional.</p>
<p>A maioria das secretarias convive simultaneamente com três pressões: ausência de planejamento regional articulado, fragilidade da pactuação interfederativa em CIB/CIT e ausência de painéis institucionais que conectem indicadores de rede, financiamento e prestação de contas pública. Programas de capacitação que tratam gestão em saúde de forma genérica perdem o ponto.</p>
<p>O SIGS responde a essa pressão construindo capacidade institucional avançada: secretarias com planejamento regional articulado, equipes preparadas para pactuação interfederativa qualificada e gestores capazes de sustentar a continuidade institucional do SUS para além de ciclos políticos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de competências genéricas de administração em saúde. <strong>É a arquitetura institucional da gestão integrada do SUS como instrumento de governança</strong> — articulando planejamento, pactuação, financiamento, redes e indicadores em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de gestão integrada do SUS — articulando planejamento regional, pactuação interfederativa, financiamento tripartite, redes de atenção e indicadores de impacto aplicados à rotina das secretarias e dos quadros executivos do SUS.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O SIGS é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a gestão do SUS:</p>`,
    chips: [
      "Secretários e secretários-adjuntos de saúde",
      "Superintendentes e diretores de planejamento em saúde",
      "Coordenadores regionais e gestores de redes",
      "Equipes técnicas de planejamento e regulação",
      "Quadros das CIBs, CIRs e da CIT",
      "Gestores de fundos municipais e estaduais de saúde",
      "Equipes de monitoramento e indicadores",
      "Quadros sucessórios das secretarias",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Governança do SUS e planejamento regional",
        descricao: "Marco constitucional e legal do SUS, planejamento regional integrado (PRI), regionalização, redes de atenção e arquitetura institucional do sistema.",
      },
      {
        titulo: "Pactuação interfederativa e CIB/CIR/CIT",
        descricao: "Comissões intergestores, pactuação interfederativa qualificada, instrumentos de governança CIB/CIR/CIT e articulação tripartite do SUS.",
      },
      {
        titulo: "Financiamento, indicadores e prestação de contas",
        descricao: "Financiamento tripartite, fundo a fundo, blocos de financiamento, indicadores institucionais e modelos de prestação de contas pública.",
      },
      {
        titulo: "Aplicação institucional e gestão estratégica",
        descricao: "Construção da matriz aplicada de gestão integrada, articulação política-institucional, gestão de pessoas e formação de equipes estratégicas do SUS.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O SIGS é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Marco institucional do SUS e arquitetura da gestão integrada",
        descricao: "Fundamentos institucionais do SUS contemporâneo e arquitetura constitucional, legal e operacional da gestão integrada do sistema.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Planejamento regional integrado (PRI) e governança das redes de atenção",
        descricao: "Planejamento regional integrado como instrumento central da gestão estratégica do SUS — articulando rede, território e governança.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Pactuação interfederativa: CIB, CIR e CIT na prática",
        descricao: "Pactuação interfederativa qualificada como instrumento de governança do SUS — protocolos práticos para CIB, CIR e CIT.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Financiamento tripartite, fundo a fundo e blocos de financiamento",
        descricao: "Financiamento do SUS na prática institucional — articulando fundo a fundo, blocos de financiamento, planejamento orçamentário e prestação de contas.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Indicadores institucionais e painéis estratégicos do SUS",
        descricao: "Indicadores institucionais do SUS — articulando indicadores de rede, monitoramento e painéis estratégicos da gestão integrada.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Regulação, judicialização e segurança jurídica do gestor de saúde",
        descricao: "Regulação em saúde, judicialização contemporânea e segurança jurídica do gestor — protocolos institucionais aplicáveis.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Gestão estratégica, articulação política e comunicação institucional em saúde",
        descricao: "Gestão estratégica, comunicação institucional e articulação política da secretaria de saúde — protocolos aplicáveis à direção do SUS.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz SIGS de gestão integrada",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão integrada do SUS para a sua instituição de origem.",
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
        titulo: "Marco institucional do SUS e arquitetura da gestão integrada",
        cargaHoraria: "8h",
        descricao: "Fundamentos institucionais do SUS contemporâneo e arquitetura constitucional, legal e operacional da gestão integrada do sistema.",
        topicos: [
          "Marco constitucional do SUS (CF 1988 · Leis 8.080 e 8.142)",
          "Diretrizes institucionais contemporâneas do SUS",
          "Arquitetura tripartite do sistema (União · Estados · Municípios)",
          "Modelos institucionais da gestão integrada",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Planejamento regional integrado (PRI) e governança das redes de atenção",
        cargaHoraria: "8h",
        descricao: "Planejamento regional integrado como instrumento central da gestão estratégica do SUS — articulando rede, território e governança.",
        topicos: [
          "Marco do PRI no SUS contemporâneo",
          "Regionalização e redes de atenção à saúde",
          "Mapas estratégicos da rede de atenção regional",
          "Articulação entre planejamento regional e municipal",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Pactuação interfederativa: CIB, CIR e CIT na prática",
        cargaHoraria: "8h",
        descricao: "Pactuação interfederativa qualificada como instrumento de governança do SUS — protocolos práticos para CIB, CIR e CIT.",
        topicos: [
          "Marco da pactuação interfederativa no SUS",
          "Comissões intergestores e protocolos institucionais",
          "Pautas estratégicas das CIBs, CIRs e CIT",
          "Construção de pactuação técnica e política qualificada",
        ],
      },
      {
        numero: "IV",
        titulo: "Financiamento tripartite, fundo a fundo e blocos de financiamento",
        cargaHoraria: "8h",
        descricao: "Financiamento do SUS na prática institucional — articulando fundo a fundo, blocos de financiamento, planejamento orçamentário e prestação de contas.",
        topicos: [
          "Modelo de financiamento tripartite do SUS",
          "Fundo a fundo e blocos de financiamento contemporâneos",
          "Planejamento orçamentário e plano de saúde",
          "Prestação de contas pública e instrumentos de transparência",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Indicadores institucionais e painéis estratégicos do SUS",
        cargaHoraria: "8h",
        descricao: "Indicadores institucionais do SUS — articulando indicadores de rede, monitoramento e painéis estratégicos da gestão integrada.",
        topicos: [
          "Indicadores estratégicos do SUS contemporâneo",
          "Painéis institucionais de governança em saúde",
          "Monitoramento de redes de atenção e regulação",
          "Cultura de mensuração e prestação de contas",
        ],
      },
      {
        numero: "VI",
        titulo: "Regulação, judicialização e segurança jurídica do gestor de saúde",
        cargaHoraria: "8h",
        descricao: "Regulação em saúde, judicialização contemporânea e segurança jurídica do gestor — protocolos institucionais aplicáveis.",
        topicos: [
          "Marco regulatório do SUS contemporâneo",
          "Judicialização da saúde: leitura institucional",
          "Articulação com Ministério Público e Poder Judiciário",
          "Segurança jurídica do gestor de saúde pública",
        ],
      },
      {
        numero: "VII",
        titulo: "Gestão estratégica, articulação política e comunicação institucional em saúde",
        cargaHoraria: "8h",
        descricao: "Gestão estratégica, comunicação institucional e articulação política da secretaria de saúde — protocolos aplicáveis à direção do SUS.",
        topicos: [
          "Direção estratégica da secretaria de saúde",
          "Articulação política-institucional do gestor do SUS",
          "Comunicação institucional aplicada à saúde pública",
          "Gestão de pessoas e equipes estratégicas do SUS",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz SIGS de gestão integrada",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de gestão integrada do SUS para a sua instituição de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do SIGS",
          "Plano de aplicação da matriz na secretaria de origem",
          "Encerramento e construção de comunidade de gestão integrada",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do SIGS",
    tituloHtml: `O que a instituição <em>leva</em> do SIGS`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Planejamento regional integrado estruturado e articulado às redes de atenção.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Pactuação interfederativa qualificada e protocolos institucionais para CIB/CIR/CIT.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Modelo de financiamento tripartite e fundo a fundo institucionalizado.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Painel institucional de indicadores estratégicos do SUS implantado.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Cultura institucional de prestação de contas e accountability instalada.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de gestão integrada do SUS construída para a secretaria.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o SIGS uma referência",
    tituloHtml: `O que torna o SIGS <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade do SUS brasileiro",
        descricao: "Estruturado a partir da prática real da gestão do SUS, sem importação acrítica de modelos privados ou de sistemas estrangeiros.",
      },
      {
        titulo: "Coordenação com trajetória executiva no SUS",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias estaduais e municipais de saúde, CONASS, CONASEMS e instâncias tripartites.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de gestão integrada construída para a instituição do participante.",
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
    titulo: "Curadoria técnica para a gestão integrada do SUS",
    tituloHtml: `Curadoria técnica para a <em>gestão integrada do SUS</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O SIGS articula gestores do SUS, especialistas em planejamento regional, financiamento, pactuação interfederativa, redes de atenção e indicadores institucionais para apoiar secretarias e equipes na governança qualificada do sistema.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-saude.1920.webp`,
        imgAlt: "Coordenação científica · Gestão integrada e governança do SUS",
        axisBadge: "Governança do SUS",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em secretarias estaduais e municipais de saúde, CONASS/CONASEMS e formação executiva de quadros do SUS.",
        eixo: "Governança e planejamento do SUS",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Pactuação interfederativa e financiamento",
        axisBadge: "Pactuação e financiamento",
        nome: "Nome em validação institucional",
        credencial: "Atuação em pactuação interfederativa, financiamento tripartite e instrumentos de governança CIB/CIR/CIT.",
        eixo: "Pactuação interfederativa e financiamento",
        modulos: "III · IV",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Marco institucional do SUS",
        axisBadge: "Marco do SUS",
        nome: "Especialista convidado",
        credencial: "Marco constitucional e legal do SUS, arquitetura institucional do sistema e referenciais contemporâneos da gestão pública em saúde.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Planejamento regional integrado",
        axisBadge: "Planejamento regional",
        nome: "Especialista convidada",
        credencial: "Planejamento regional integrado (PRI), regionalização e governança das redes de atenção à saúde no SUS contemporâneo.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Pactuação interfederativa",
        axisBadge: "Pactuação CIB/CIR/CIT",
        nome: "Especialista convidado",
        credencial: "Pactuação interfederativa no SUS, atuação em comissões intergestores e protocolos institucionais de governança tripartite.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Financiamento do SUS",
        axisBadge: "Financiamento do SUS",
        nome: "Especialista convidada",
        credencial: "Financiamento tripartite do SUS, fundo a fundo, blocos de financiamento e planejamento orçamentário aplicado à saúde pública.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Indicadores e painéis estratégicos",
        axisBadge: "Indicadores e painéis",
        nome: "Especialista convidado",
        credencial: "Indicadores estratégicos do SUS, painéis institucionais de governança e modelos de monitoramento de redes de atenção.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Regulação e judicialização da saúde",
        axisBadge: "Regulação e judicialização",
        nome: "Especialista convidada",
        credencial: "Regulação em saúde, judicialização da saúde, segurança jurídica do gestor e articulação com Ministério Público e Judiciário.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Direção estratégica em saúde pública",
        axisBadge: "Direção estratégica",
        nome: "Especialista convidado",
        credencial: "Direção estratégica de secretarias de saúde, articulação política-institucional e comunicação institucional aplicada à saúde pública.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Aplicação institucional e cultura SUS",
        axisBadge: "Aplicação institucional",
        nome: "Especialista convidada",
        credencial: "Construção de cultura institucional integrada do SUS, formação de equipes estratégicas e implantação de matrizes de gestão.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos do SUS" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do SIGS é organizada por competências da gestão integrada do SUS e pode variar conforme o perfil da turma, os desafios institucionais do órgão contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o SIGS",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O SIGS é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias e órgãos do SUS, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do SIGS — marco do SUS, planejamento regional, pactuação interfederativa, financiamento, indicadores, regulação, direção estratégica e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato/proposta?programa=sigs&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de saúde, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil dos quadros executivos do SUS.</p>
    <a class="cta" href="/contato/proposta?programa=sigs&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato/proposta?programa=sigs&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do SIGS",
    tituloHtml: `Próximos módulos do <em>SIGS</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-saude.1920.webp`,
      dataLabel: { dias: "18–19", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário executivo · NTC Saúde",
      titulo: "Marco institucional do SUS e arquitetura da gestão integrada",
      binding: "Porta de entrada · Módulo I do SIGS",
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
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "15", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Planejamento regional integrado (PRI) no SUS",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "27", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Financiamento tripartite e fundo a fundo do SUS",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-saude.1920.webp`,
        dataLabel: { dias: "22–23", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Pactuação interfederativa: CIB, CIR e CIT na prática",
        metaHtml: "Módulo <strong>III</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do SIGS é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias do SUS ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do SIGS", href: "/agenda?programa=sigs", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato/proposta?programa=sigs&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do SIGS?",
        resposta: "Sim. O SIGS é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Marco institucional do SUS) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O SIGS é indicado para municípios pequenos do SUS?",
        resposta: "Sim. O programa é dimensionado para secretarias estaduais e municipais de qualquer porte, com módulos aplicáveis à realidade das pequenas, médias e grandes secretarias. Para contratação institucional dedicada ao perfil do município ou consórcio, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O SIGS pode ser entregue exclusivamente à secretaria estadual, municipal ou ao consórcio público de saúde, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade do território e o perfil dos quadros executivos. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há modalidades de contratação compatíveis com o SUS?",
        resposta: "Sim. Atendemos órgãos do SUS por dispensa, inexigibilidade, Lei 14.133, convênio, contrato de programa e demais modalidades compatíveis com a realidade da saúde pública. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha SIGS. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>SIGS</em> para a sua secretaria.",
    corpo: "Solicite proposta institucional para sua secretaria estadual, municipal ou consórcio público de saúde — trilha completa, módulos avulsos, in company ou solução sob medida.",
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
      "Planejamento regional integrado",
      "Pactuação interfederativa qualificada",
      "Painel institucional de indicadores do SUS",
      "Matriz aplicada de gestão integrada",
      "Certificação institucional NTC",
    ],
  },
};
