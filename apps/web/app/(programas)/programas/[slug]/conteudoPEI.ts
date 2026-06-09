import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const PEI: ConteudoPrograma = {
  sigla: "PEI",
  siglaCss: "PEI",
  siglaExibida: "PEI",
  slug: "pei",
  nomeCompleto: "Educação Integral e Escola em Tempo Integral nas Redes Públicas",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "PEI" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8",   lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Educação Integral e <em>Escola em Tempo Integral</em> nas Redes Públicas`,
    sub: "Capacitação executiva para secretarias e equipes pedagógicas na implantação e gestão da educação integral — articulando jornada ampliada, currículo integral, componentes diversificados, articulação intersetorial e financiamento federal do Programa Escola em Tempo Integral (Lei 14.640/2023).",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=pei", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=pei&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Educação Integral e Tempo Integral" },
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
    titulo: "Um programa estratégico para a educação integral nas redes públicas brasileiras.",
    tituloHtml: `Um programa estratégico para a <em>educação integral</em> nas redes públicas brasileiras.`,
    corpoHtml: `<p class="lede-block">O PEI articula política institucional de educação integral, arquitetura curricular da jornada ampliada, componentes diversificados, articulação intersetorial e financiamento federal do Programa Escola em Tempo Integral em um arco formativo de 8 módulos e 64 horas, dimensionado para secretarias estaduais e municipais de educação, coordenadores de programas, diretores de escolas integrais e equipes técnicas das redes.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre a implantação e a gestão da educação integral — secretários e secretários-adjuntos de educação, superintendentes pedagógicos, coordenadores do Programa Escola em Tempo Integral, diretores escolares, equipes técnicas de currículo e financiamento — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada à expansão da jornada ampliada</strong> e <strong>protocolos institucionais</strong> compatíveis com a Lei 14.640/2023 e com a realidade das redes públicas brasileiras.</p>
<p>O PEI não é um curso genérico de currículo nem uma trilha de gestão escolar isolada. É um programa de fortalecimento institucional da educação integral — articulando jornada ampliada, currículo integral, componentes diversificados, articulação territorial e financiamento federal em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de educação integral</strong>, construída pelos próprios participantes para a sua rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A educação integral brasileira opera hoje em ambiente de expansão acelerada — Lei 14.640/2023 (Programa Escola em Tempo Integral), Plano Nacional de Educação, expectativa social por jornada ampliada como instrumento de equidade educacional e exigência de articulação intersetorial. Secretarias estaduais e municipais precisam articular respostas estruturadas, defensáveis e sustentáveis ao longo do tempo.</p>
<p>A maioria das redes convive simultaneamente com três pressões: ausência de política institucional de educação integral estruturada, fragilidade da articulação curricular entre base comum e componentes diversificados, e ausência de protocolos institucionais que articulem escola, território e setores parceiros. Iniciativas pontuais, sem arquitetura institucional, não respondem ao desafio.</p>
<p>O PEI responde a essa pressão construindo capacidade institucional avançada: redes com política de educação integral estruturada, escolas com currículo integral implementado e equipes capazes de sustentar a continuidade institucional do tempo integral para além de ciclos políticos e de transições federativas.</p>`,
    destaqueHtml: `O que está em jogo não é a simples ampliação da jornada escolar. <strong>É a arquitetura institucional da educação integral como instrumento de governança pedagógica</strong> — articulando jornada, currículo, componentes diversificados, território e financiamento em um sistema coerente, defensável e replicável nas redes públicas brasileiras.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de implantação e gestão da educação integral nas redes públicas brasileiras — articulando política institucional, jornada ampliada, currículo integral, componentes diversificados, articulação intersetorial e financiamento federal do Programa Escola em Tempo Integral aplicados à rotina das secretarias e das escolas.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O PEI é dimensionado para profissionais com responsabilidade direta — ou em formação — sobre a educação integral das redes:</p>`,
    chips: [
      "Secretários e secretários-adjuntos de educação",
      "Coordenadores do Programa Escola em Tempo Integral",
      "Superintendentes e diretores pedagógicos",
      "Diretores e coordenadores de escolas integrais",
      "Equipes técnicas de currículo e formação",
      "Articuladores intersetoriais e gestores de território",
      "Equipes de planejamento e financiamento educacional",
      "Quadros sucessórios das áreas de educação integral",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Política e arquitetura institucional da educação integral",
        descricao: "Marco legal contemporâneo da educação integral, Programa Escola em Tempo Integral (Lei 14.640/2023), arquitetura institucional da rede e referenciais consolidados.",
      },
      {
        titulo: "Jornada ampliada, currículo integral e componentes diversificados",
        descricao: "Arquitetura curricular da jornada ampliada, integração entre base comum e componentes diversificados, modelos pedagógicos da educação integral.",
      },
      {
        titulo: "Articulação intersetorial e território educativo",
        descricao: "Articulação entre escola, comunidade e equipamentos públicos do território, parcerias intersetoriais e protocolos institucionais de cogestão territorial.",
      },
      {
        titulo: "Gestão, financiamento e aplicação institucional",
        descricao: "Gestão da escola integral, financiamento federal do PETI, indicadores institucionais e construção da matriz aplicada de educação integral para a rede.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 8 módulos",
    tituloHtml: `Estrutura modular · <em>8 módulos</em>`,
    intro: "O PEI é composto por 8 módulos sequenciais de 8 horas cada, totalizando 64 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Marco institucional da educação integral e Programa Escola em Tempo Integral (Lei 14.640/2023)",
        descricao: "Marco institucional contemporâneo da educação integral no Brasil — referenciais legais, Programa Escola em Tempo Integral e arquitetura federativa.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Expansão de escolas em tempo integral nas redes públicas brasileiras",
        descricao: "Modelos institucionais de expansão de escolas em tempo integral nas redes — planejamento, priorização e arquitetura de implantação contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Arquitetura curricular da educação integral: base comum e diversificados",
        descricao: "Arquitetura curricular da educação integral — articulação entre base nacional comum, componentes diversificados e itinerários formativos.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "IV",
        titulo: "Componentes diversificados e modelos pedagógicos da jornada ampliada",
        descricao: "Modelos pedagógicos contemporâneos da jornada ampliada — componentes diversificados aplicados à realidade das redes públicas brasileiras.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "V",
        titulo: "Articulação intersetorial e território educativo da educação integral",
        descricao: "Articulação intersetorial e território educativo — protocolos institucionais entre escola, comunidade e equipamentos públicos do território.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Gestão da escola em tempo integral: diretor, equipe e cotidiano",
        descricao: "Gestão da escola em tempo integral — direção, coordenação pedagógica, equipe ampliada e cotidiano institucional da escola integral.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VII",
        titulo: "Financiamento federal do PETI, indicadores e prestação de contas",
        descricao: "Financiamento federal contemporâneo do PETI — articulação com PDDE, transferências, indicadores institucionais e prestação de contas pública.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PEI de educação integral",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de educação integral para a sua rede de origem.",
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
        titulo: "Marco institucional da educação integral e Programa Escola em Tempo Integral (Lei 14.640/2023)",
        cargaHoraria: "8h",
        descricao: "Marco institucional contemporâneo da educação integral no Brasil — referenciais legais, Programa Escola em Tempo Integral e arquitetura federativa.",
        topicos: [
          "Lei 14.640/2023 e Programa Escola em Tempo Integral",
          "Plano Nacional de Educação e meta de educação integral",
          "Referenciais institucionais brasileiros e internacionais",
          "Arquitetura federativa da educação integral",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Expansão de escolas em tempo integral nas redes públicas brasileiras",
        cargaHoraria: "8h",
        descricao: "Modelos institucionais de expansão de escolas em tempo integral nas redes — planejamento, priorização e arquitetura de implantação contemporânea.",
        topicos: [
          "Modelos contemporâneos de expansão do tempo integral",
          "Critérios de priorização de unidades nas redes",
          "Arquitetura física e infraestrutura escolar mínima",
          "Indicadores de cobertura e de qualidade da expansão",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Arquitetura curricular da educação integral: base comum e diversificados",
        cargaHoraria: "8h",
        descricao: "Arquitetura curricular da educação integral — articulação entre base nacional comum, componentes diversificados e itinerários formativos.",
        topicos: [
          "Articulação BNCC e jornada ampliada",
          "Componentes diversificados na escola integral",
          "Itinerários formativos e protagonismo do estudante",
          "Indicadores pedagógicos do currículo integral",
        ],
      },
      {
        numero: "IV",
        titulo: "Componentes diversificados e modelos pedagógicos da jornada ampliada",
        cargaHoraria: "8h",
        descricao: "Modelos pedagógicos contemporâneos da jornada ampliada — componentes diversificados aplicados à realidade das redes públicas brasileiras.",
        topicos: [
          "Modelos pedagógicos de componentes diversificados",
          "Cultura, esporte, ciências, projeto de vida na escola integral",
          "Articulação entre componentes e práticas docentes",
          "Indicadores de qualidade dos componentes diversificados",
        ],
        ctaInscricao: true,
      },
      {
        numero: "V",
        titulo: "Articulação intersetorial e território educativo da educação integral",
        cargaHoraria: "8h",
        descricao: "Articulação intersetorial e território educativo — protocolos institucionais entre escola, comunidade e equipamentos públicos do território.",
        topicos: [
          "Conceito de território educativo contemporâneo",
          "Articulação entre escola, comunidade e equipamentos públicos",
          "Parcerias intersetoriais: cultura, esporte, assistência, saúde",
          "Modelos institucionais de cogestão territorial",
        ],
      },
      {
        numero: "VI",
        titulo: "Gestão da escola em tempo integral: diretor, equipe e cotidiano",
        cargaHoraria: "8h",
        descricao: "Gestão da escola em tempo integral — direção, coordenação pedagógica, equipe ampliada e cotidiano institucional da escola integral.",
        topicos: [
          "Direção escolar especializada para escola integral",
          "Coordenação pedagógica do tempo integral",
          "Equipe ampliada e formação dos profissionais",
          "Cotidiano institucional e indicadores de processo",
        ],
      },
      {
        numero: "VII",
        titulo: "Financiamento federal do PETI, indicadores e prestação de contas",
        cargaHoraria: "8h",
        descricao: "Financiamento federal contemporâneo do PETI — articulação com PDDE, transferências, indicadores institucionais e prestação de contas pública.",
        topicos: [
          "Modelo de financiamento federal do PETI",
          "Articulação com PDDE e demais transferências",
          "Indicadores institucionais do tempo integral",
          "Prestação de contas pública e instrumentos de transparência",
        ],
      },
      {
        numero: "VIII",
        titulo: "Aplicação institucional e construção da matriz PEI de educação integral",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de educação integral para a sua rede de origem.",
        topicos: [
          "Síntese articulada dos sete módulos anteriores",
          "Construção orientada da matriz institucional do PEI",
          "Plano de aplicação da matriz na rede de origem",
          "Encerramento e construção de comunidade de educação integral",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do PEI",
    tituloHtml: `O que a instituição <em>leva</em> do PEI`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Política institucional de educação integral estruturada na rede.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Expansão das escolas em tempo integral planejada e priorizada.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Arquitetura curricular da educação integral articulada à BNCC.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Articulação intersetorial e território educativo institucionalizados.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Modelo de financiamento federal do PETI implantado na rede.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de educação integral construída para a secretaria.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o PEI uma referência",
    tituloHtml: `O que torna o PEI <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade das redes brasileiras",
        descricao: "Estruturado a partir da prática real das secretarias estaduais e municipais que implantam educação integral no Brasil contemporâneo.",
      },
      {
        titulo: "Coordenação com trajetória executiva na educação integral",
        descricao: "Coordenação científica e docentes com vivência aplicada em secretarias, MEC, organismos especializados e redes que conduziram a expansão do tempo integral.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de educação integral construída para a rede do participante.",
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
    titulo: "Curadoria técnica em educação integral e tempo integral",
    tituloHtml: `Curadoria técnica em <em>educação integral e tempo integral</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O PEI articula gestores educacionais, especialistas em política e arquitetura institucional da educação integral, currículo da jornada ampliada, articulação intersetorial e financiamento do PETI — apoiando secretarias e redes na implantação qualificada da escola integral.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Política e gestão da educação integral",
        axisBadge: "Política da educação integral",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em política e gestão da educação integral, secretarias estaduais e municipais e formação executiva de quadros das redes públicas.",
        eixo: "Política e gestão da educação integral",
        modulos: "I · II · VIII",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Currículo integral e componentes diversificados",
        axisBadge: "Currículo integral",
        nome: "Nome em validação institucional",
        credencial: "Atuação em currículo integral, articulação BNCC e jornada ampliada, modelos pedagógicos da educação integral brasileira.",
        eixo: "Currículo e jornada ampliada",
        modulos: "III · IV",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo executivo",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Marco institucional da educação integral",
        axisBadge: "Marco institucional",
        nome: "Especialista convidado",
        credencial: "Marco legal da educação integral, Lei 14.640/2023 e arquitetura federativa do Programa Escola em Tempo Integral.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidada · Expansão e infraestrutura escolar",
        axisBadge: "Expansão da rede integral",
        nome: "Especialista convidada",
        credencial: "Modelos contemporâneos de expansão do tempo integral, priorização de unidades e infraestrutura escolar mínima.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidado · Currículo integral e BNCC",
        axisBadge: "Currículo integral",
        nome: "Especialista convidado",
        credencial: "Arquitetura curricular da educação integral, articulação BNCC, base comum e componentes diversificados.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Componentes diversificados",
        axisBadge: "Componentes diversificados",
        nome: "Especialista convidada",
        credencial: "Modelos pedagógicos dos componentes diversificados aplicados à jornada ampliada nas redes públicas.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidado · Território educativo e intersetorialidade",
        axisBadge: "Território educativo",
        nome: "Especialista convidado",
        credencial: "Conceito de território educativo, articulação intersetorial entre escola, comunidade e equipamentos públicos.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Gestão da escola integral",
        axisBadge: "Gestão da escola integral",
        nome: "Especialista convidada",
        credencial: "Direção, coordenação pedagógica, equipe ampliada e cotidiano institucional da escola em tempo integral.",
        modulos: "VI",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Financiamento e indicadores do PETI",
        axisBadge: "Financiamento e indicadores",
        nome: "Especialista convidado",
        credencial: "Financiamento federal do PETI, articulação com PDDE, indicadores institucionais e prestação de contas pública.",
        modulos: "VII",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Cultura institucional da educação integral",
        axisBadge: "Cultura institucional",
        nome: "Especialista convidada",
        credencial: "Construção de cultura institucional da educação integral, formação de equipes estratégicas e implantação de matrizes de gestão.",
        modulos: "VIII",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos da integral" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "8",   lbl: "Módulos cobertos" },
      { num: "64h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do PEI é organizada por competências da educação integral e pode variar conforme o perfil da turma, os desafios institucionais da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o PEI",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O PEI é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 8 módulos · 64 horas</h4>
    <p>Acesso integral à arquitetura formativa do PEI — marco institucional, expansão, currículo integral, componentes diversificados, território educativo, gestão da escola integral, financiamento do PETI e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=pei&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <a class="cta" href="/contato?programa=pei&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=pei&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do PEI",
    tituloHtml: `Próximos módulos do <em>PEI</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "25–26", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário pedagógico · NTC Educação",
      titulo: "Marco institucional da educação integral e PETI (Lei 14.640/2023)",
      binding: "Porta de entrada · Módulo I do PEI",
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
        dataLabel: { dias: "23", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Online",
        titulo: "Expansão de escolas em tempo integral: priorização e infraestrutura",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "19", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Híbrido · DF",
        titulo: "Componentes diversificados e modelos pedagógicos da jornada ampliada",
        metaHtml: "Módulo <strong>IV</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "24–25", mesAno: "Set · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Financiamento federal do PETI, articulação com PDDE e prestação de contas",
        metaHtml: "Módulo <strong>VII</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do PEI é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias de educação ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do PEI", href: "/agenda?programa=pei", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=pei&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do PEI?",
        resposta: "Sim. O PEI é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 8 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Marco institucional da educação integral) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O PEI cobre a Lei 14.640/2023 e o Programa Escola em Tempo Integral?",
        resposta: "Sim. O Módulo I é estruturado integralmente sobre a Lei 14.640/2023 e o Programa Escola em Tempo Integral, com aplicação prática para secretarias estaduais e municipais que conduzem a expansão do tempo integral. Módulo VII aprofunda o financiamento federal.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O PEI pode ser entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil dos quadros executivos e pedagógicos. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 8 módulos, recebe a certificação consolidada da trilha PEI. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>PEI</em> para a sua rede.",
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
      "Política de educação integral estruturada",
      "Arquitetura curricular da jornada ampliada",
      "Modelo de financiamento PETI institucionalizado",
      "Matriz aplicada de educação integral",
      "Certificação institucional NTC",
    ],
  },
};
