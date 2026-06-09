import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const VIVAESCOLA: ConteudoPrograma = {
  sigla: "VIVAESCOLA",
  siglaCss: "VIVAESCOLA",
  siglaExibida: "VIVAESCOLA",
  slug: "vivaescola",
  nomeCompleto: "Programa de Bem-Estar e Cultura Positiva na Escola",
  vertical: "educacao",
  verticalRotulo: "NTC Educação",
  breadcrumb: { current: "VIVAESCOLA" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "6",   lbl: "Módulos formativos" },
      { num: "48h", lbl: "Carga horária total" },
      { num: "4",   lbl: "Eixos temáticos" },
    ],
    tituloHtml: `Programa de Bem-Estar e <em>Cultura Positiva</em> na Escola`,
    sub: "Capacitação executiva para redes públicas de educação — articulando cultura escolar, convivência democrática, saúde mental, permanência, prevenção da evasão e proteção integral em uma agenda institucional contemporânea de bem-estar escolar.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato?programa=vivaescola", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato?programa=vivaescola&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "Vertical",      valor: "NTC Educação",     valorSub: "Bem-Estar e Cultura Escolar" },
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
    titulo: "Um programa estratégico para o bem-estar e a cultura positiva nas redes públicas.",
    tituloHtml: `Um programa estratégico para o <em>bem-estar e a cultura positiva</em> nas redes públicas.`,
    corpoHtml: `<p class="lede-block">O VIVAESCOLA articula cultura escolar, convivência democrática, saúde mental, permanência, prevenção da evasão e proteção integral em um arco formativo de 6 módulos e 48 horas, dimensionado para secretarias de educação e equipes que sustentam o clima institucional das escolas públicas brasileiras.</p>
<p>O programa foi estruturado para profissionais com responsabilidade direta sobre o clima escolar e o bem-estar de estudantes e profissionais — secretários e secretários-adjuntos de educação, coordenadores de assistência ao estudante, diretores escolares, coordenadores pedagógicos, equipes multiprofissionais (psicólogos, assistentes sociais), conselhos tutelares e equipes intersetoriais — que precisam de <strong>repertório técnico atualizado</strong>, <strong>metodologia aplicada à convivência e à proteção</strong> e <strong>protocolos institucionais</strong> compatíveis com a complexidade real da escola brasileira contemporânea.</p>
<p>O VIVAESCOLA não é um curso de assistência ao estudante nem uma trilha isolada de saúde mental escolar. É um programa de cultura escolar institucional aplicada — articulando convivência democrática, saúde mental, permanência, proteção integral e clima escolar em uma arquitetura institucional integrada. A entrega final é uma <strong>matriz aplicada de bem-estar e cultura escolar</strong>, construída pelos próprios participantes para sua rede de origem.</p>`,
  },
  problema: {
    eyebrow: "Problema público que enfrentamos",
    titulo: "O desafio institucional contemporâneo",
    tituloHtml: `O desafio institucional <em>contemporâneo</em>`,
    corpoHtml: `<p>A escola brasileira opera hoje sob pressão crescente: aumento de casos de violência e sofrimento psíquico de estudantes e profissionais, exigências da Lei 14.819/2024 sobre saúde mental escolar, taxas persistentes de evasão e expectativa social por uma cultura escolar inclusiva, democrática e protetiva. Secretarias estaduais e municipais precisam articular respostas estruturadas e intersetoriais.</p>
<p>A maioria das redes convive simultaneamente com três pressões: aumento de casos que demandam articulação com a rede de proteção, fragilidade da cultura escolar de convivência e ausência de protocolos institucionais que conectem clima escolar, saúde mental e permanência. Programas isolados de assistência ao estudante, sem articulação institucional, não respondem ao desafio.</p>
<p>O VIVAESCOLA responde a essa pressão construindo capacidade institucional avançada: redes com cultura escolar positiva instalada, protocolos documentados de saúde mental e prevenção da evasão, e equipes preparadas para articulação intersetorial com saúde, assistência social e Sistema de Garantia de Direitos.</p>`,
    destaqueHtml: `O que está em jogo não é a aquisição de boas práticas pontuais de convivência. <strong>É a arquitetura institucional do bem-estar escolar como direito e responsabilidade da rede</strong> — articulando cultura escolar, convivência, saúde mental, permanência e proteção integral em um sistema coerente, defensável e replicável.`,
  },
  objetivoGeral: {
    eyebrow: "Objetivo geral",
    titulo: "O que o programa entrega",
    tituloHtml: `O que o programa <em>entrega</em>`,
    corpoHtml: `<p class="lede-block">Desenvolver capacidade institucional avançada de bem-estar e cultura positiva na escola — articulando convivência democrática, saúde mental, permanência, prevenção da evasão e proteção integral aplicados à rotina das secretarias de educação, das equipes escolares e da rede intersetorial.</p>`,
  },
  publico: {
    eyebrow: "Para quem",
    titulo: "Público-alvo",
    corpoHtml: `<p>O VIVAESCOLA é dimensionado para profissionais com responsabilidade direta sobre o clima escolar, o bem-estar e a proteção integral nas redes públicas:</p>`,
    chips: [
      "Secretarias estaduais e municipais de educação",
      "Coordenadorias de assistência ao estudante",
      "Diretores e coordenadores pedagógicos",
      "Equipes multiprofissionais (psicologia · serviço social)",
      "Conselhos tutelares e órgãos de proteção",
      "Articulação com saúde e assistência social",
      "Coordenadores de programas de permanência",
      "Equipes de formação continuada",
    ],
  },
  eixos: {
    eyebrow: "Eixos formativos",
    titulo: "Quatro eixos estruturantes",
    tituloHtml: `Quatro <em>eixos estruturantes</em>`,
    itens: [
      {
        titulo: "Cultura escolar e clima institucional",
        descricao: "Cultura escolar contemporânea, clima institucional positivo, convivência democrática, mediação de conflitos e justiça restaurativa aplicadas à escola pública.",
      },
      {
        titulo: "Saúde mental e bem-estar escolar",
        descricao: "Saúde mental de estudantes e profissionais, Lei 14.819/2024, programas institucionais de bem-estar e equipes multiprofissionais aplicadas à rede.",
      },
      {
        titulo: "Permanência, vínculos e prevenção da evasão",
        descricao: "Construção institucional de vínculos, indicadores de pertencimento, prevenção da evasão escolar e estratégias de busca ativa nas redes públicas.",
      },
      {
        titulo: "Proteção integral e articulação intersetorial",
        descricao: "Construção da matriz aplicada de bem-estar, ECA aplicado à escola, Sistema de Garantia de Direitos e articulação institucional entre Educação, Saúde e Assistência.",
      },
    ],
  },
  modulos: {
    eyebrow: "Arquitetura formativa",
    titulo: "Estrutura modular · 6 módulos",
    tituloHtml: `Estrutura modular · <em>6 módulos</em>`,
    intro: "O VIVAESCOLA é composto por 6 módulos sequenciais de 8 horas cada, totalizando 48 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    itens: [
      {
        numero: "I",
        titulo: "Cultura escolar contemporânea e clima institucional positivo",
        descricao: "Cultura escolar contemporânea como ativo institucional — articulando clima, sentido de pertencimento, vínculos e ambiente educativo de qualidade na escola pública brasileira.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "II",
        titulo: "Convivência democrática, mediação de conflitos e justiça restaurativa",
        descricao: "Convivência democrática, mediação institucional de conflitos e práticas restaurativas aplicadas à escola pública contemporânea.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "III",
        titulo: "Saúde mental escolar: estudantes, profissionais e Lei 14.819/2024",
        descricao: "Saúde mental escolar contemporânea — Lei 14.819/2024, política nacional, equipes multiprofissionais e protocolos institucionais aplicados a estudantes e profissionais.",
        cargaHoraria: "8h",
        statusRotulo: "Inscrições abertas",
        statusTipo: "aberto",
      },
      {
        numero: "IV",
        titulo: "Permanência, vínculos e prevenção da evasão escolar",
        descricao: "Permanência escolar institucional — construção de vínculos, indicadores de pertencimento e estratégias intersetoriais de prevenção da evasão.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "V",
        titulo: "Proteção integral, ECA aplicado à escola e rede intersetorial",
        descricao: "Proteção integral como compromisso da escola — ECA aplicado, articulação com Sistema de Garantia de Direitos, conselho tutelar e rede intersetorial.",
        cargaHoraria: "8h",
        statusRotulo: "Em breve",
        statusTipo: "breve",
      },
      {
        numero: "VI",
        titulo: "Aplicação institucional e construção da matriz VIVAESCOLA",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de bem-estar e cultura escolar para a sua rede de origem.",
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
        titulo: "Cultura escolar contemporânea e clima institucional positivo",
        cargaHoraria: "8h",
        descricao: "Cultura escolar contemporânea como ativo institucional — articulando clima, sentido de pertencimento, vínculos e ambiente educativo de qualidade na escola pública brasileira.",
        topicos: [
          "Cultura escolar e clima institucional positivo",
          "Diagnóstico institucional do clima escolar",
          "Pertencimento, vínculos e ambiente educativo",
          "Indicadores de clima da escola pública",
        ],
        ctaInscricao: true,
      },
      {
        numero: "II",
        titulo: "Convivência democrática, mediação de conflitos e justiça restaurativa",
        cargaHoraria: "8h",
        descricao: "Convivência democrática, mediação institucional de conflitos e práticas restaurativas aplicadas à escola pública contemporânea.",
        topicos: [
          "Convivência democrática na escola pública",
          "Mediação institucional de conflitos",
          "Justiça restaurativa aplicada à escola",
          "Práticas restaurativas como cultura institucional",
        ],
        ctaInscricao: true,
      },
      {
        numero: "III",
        titulo: "Saúde mental escolar: estudantes, profissionais e Lei 14.819/2024",
        cargaHoraria: "8h",
        descricao: "Saúde mental escolar contemporânea — Lei 14.819/2024, política nacional, equipes multiprofissionais e protocolos institucionais aplicados a estudantes e profissionais.",
        topicos: [
          "Lei 14.819/2024 e política nacional de saúde mental escolar",
          "Bem-estar de estudantes e profissionais da educação",
          "Equipes multiprofissionais (psicólogos e assistentes sociais)",
          "Protocolos institucionais de cuidado e encaminhamento",
        ],
        ctaInscricao: true,
      },
      {
        numero: "IV",
        titulo: "Permanência, vínculos e prevenção da evasão escolar",
        cargaHoraria: "8h",
        descricao: "Permanência escolar institucional — construção de vínculos, indicadores de pertencimento e estratégias intersetoriais de prevenção da evasão.",
        topicos: [
          "Construção institucional de vínculos e pertencimento",
          "Indicadores de permanência e busca ativa escolar",
          "Programas institucionais de prevenção da evasão",
          "Articulação intersetorial de proteção da trajetória escolar",
        ],
      },
      {
        numero: "V",
        titulo: "Proteção integral, ECA aplicado à escola e rede intersetorial",
        cargaHoraria: "8h",
        descricao: "Proteção integral como compromisso da escola — ECA aplicado, articulação com Sistema de Garantia de Direitos, conselho tutelar e rede intersetorial.",
        topicos: [
          "ECA aplicado à escola pública brasileira",
          "Sistema de Garantia de Direitos e conselho tutelar",
          "Articulação institucional com Saúde e Assistência Social",
          "Protocolos institucionais de proteção integral",
        ],
      },
      {
        numero: "VI",
        titulo: "Aplicação institucional e construção da matriz VIVAESCOLA",
        cargaHoraria: "8h",
        descricao: "Sessão aplicada de fechamento — construção, com cada participante, da matriz de bem-estar e cultura escolar para a sua rede de origem.",
        topicos: [
          "Síntese articulada dos cinco módulos anteriores",
          "Construção orientada da matriz institucional do VIVAESCOLA",
          "Plano de aplicação da matriz na rede de origem",
          "Encerramento e construção de comunidade de bem-estar escolar",
        ],
      },
    ],
  },
  resultados: {
    eyebrow: "Resultados esperados",
    titulo: "O que a instituição leva do VIVAESCOLA",
    tituloHtml: `O que a instituição <em>leva</em> do VIVAESCOLA`,
    corpoHtml: `<div class="results-grid">
  <div class="result-card"><span class="r-num">01</span><p>Cultura escolar positiva institucionalizada na rede pública.</p></div>
  <div class="result-card"><span class="r-num">02</span><p>Protocolos de convivência democrática e mediação de conflitos documentados.</p></div>
  <div class="result-card"><span class="r-num">03</span><p>Política institucional de saúde mental escolar implantada na rede.</p></div>
  <div class="result-card"><span class="r-num">04</span><p>Estratégia institucional de permanência e prevenção da evasão estruturada.</p></div>
  <div class="result-card"><span class="r-num">05</span><p>Rede intersetorial de proteção integral articulada à rotina escolar.</p></div>
  <div class="result-card"><span class="r-num">06</span><p>Matriz aplicada de bem-estar e cultura escolar construída para a rede.</p></div>
</div>`,
  },
  diferenciais: {
    eyebrow: "Diferenciais",
    titulo: "O que torna o VIVAESCOLA uma referência",
    tituloHtml: `O que torna o VIVAESCOLA <em>uma referência</em>`,
    itens: [
      {
        titulo: "Programa aplicado à realidade da escola pública brasileira",
        descricao: "Estruturado a partir da prática real das redes brasileiras, articulando clima escolar, saúde mental e proteção integral de forma institucional.",
      },
      {
        titulo: "Coordenação com trajetória em bem-estar escolar",
        descricao: "Coordenação científica e docentes com vivência aplicada em programas de convivência, saúde mental escolar e articulação intersetorial.",
      },
      {
        titulo: "Construção de matriz aplicada",
        descricao: "O programa entrega artefato institucional concreto — matriz de bem-estar e cultura escolar construída para a rede do participante.",
      },
      {
        titulo: "Articulação intersetorial estruturada",
        descricao: "Conexão explícita com Saúde, Assistência Social, conselho tutelar e Sistema de Garantia de Direitos — abordagem integral à proteção do estudante.",
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
    titulo: "Curadoria técnica para o bem-estar escolar institucional",
    tituloHtml: `Curadoria técnica para o <em>bem-estar escolar institucional</em>`,
    pill: "Curadoria científica · Em estruturação contínua",
    introHtml: `<p class="faculty-prime-intro">O VIVAESCOLA articula gestores educacionais, especialistas em cultura escolar, saúde mental, convivência democrática, permanência e proteção integral para apoiar redes e equipes na construção institucional do bem-estar escolar contemporâneo.</p>`,
    coordenacaoMarker: "Coordenação e curadoria",
    coordenacao: [
      {
        tag: "Coordenação científica",
        imgSrc: `${IMG}/autoridade-educacao.1920.webp`,
        imgAlt: "Coordenação científica · Cultura escolar e bem-estar institucional",
        axisBadge: "Cultura escolar",
        nome: "Curadoria em confirmação",
        credencial: "Trajetória aplicada em programas de cultura escolar, clima institucional e formação de quadros executivos em redes estaduais e municipais.",
        eixo: "Cultura escolar e clima",
        modulos: "I · II · VI",
      },
      {
        tag: "Curadoria convidada",
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Curadoria convidada · Saúde mental escolar e proteção integral",
        axisBadge: "Saúde mental e proteção",
        nome: "Nome em validação institucional",
        credencial: "Atuação em saúde mental escolar (Lei 14.819/2024), articulação intersetorial com Saúde e Assistência e protocolos de proteção integral.",
        eixo: "Saúde mental e proteção",
        modulos: "III · V",
      },
    ],
    especialistasMarker: "Especialistas convidados · Por eixo de atuação",
    especialistas: [
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Especialista convidada · Cultura escolar e clima institucional",
        axisBadge: "Cultura e clima escolar",
        nome: "Especialista convidada",
        credencial: "Cultura escolar contemporânea, diagnóstico de clima institucional e construção de ambientes educativos positivos nas redes públicas.",
        modulos: "I",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Convivência democrática e justiça restaurativa",
        axisBadge: "Convivência democrática",
        nome: "Especialista convidado",
        credencial: "Convivência democrática na escola, mediação institucional de conflitos e práticas de justiça restaurativa aplicadas à rede pública.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Saúde mental escolar e Lei 14.819/2024",
        axisBadge: "Saúde mental escolar",
        nome: "Especialista convidada",
        credencial: "Saúde mental escolar institucional, Lei 14.819/2024, programas de bem-estar de estudantes e profissionais e equipes multiprofissionais.",
        modulos: "III",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidado · Permanência escolar e prevenção da evasão",
        axisBadge: "Permanência e evasão",
        nome: "Especialista convidado",
        credencial: "Permanência escolar institucional, busca ativa, construção de vínculos e programas de prevenção da evasão nas redes públicas.",
        modulos: "IV",
      },
      {
        imgSrc: `${IMG}/expert-03.1920.webp`,
        imgAlt: "Representante de órgão de proteção · ECA e Sistema de Garantia de Direitos",
        axisBadge: "Proteção integral",
        nome: "Representante de órgão de proteção",
        credencial: "Atuação no Sistema de Garantia de Direitos, conselho tutelar e protocolos institucionais de proteção integral à criança e ao adolescente.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-04.1920.webp`,
        imgAlt: "Especialista convidada · Articulação intersetorial entre Educação, Saúde e Assistência",
        axisBadge: "Articulação intersetorial",
        nome: "Especialista convidada",
        credencial: "Articulação institucional entre Educação, Saúde, Assistência Social e rede intersetorial de proteção e cuidado à comunidade escolar.",
        modulos: "V",
      },
      {
        imgSrc: `${IMG}/expert-01.1920.webp`,
        imgAlt: "Especialista convidado · Mediação de conflitos e práticas restaurativas",
        axisBadge: "Mediação de conflitos",
        nome: "Especialista convidado",
        credencial: "Mediação escolar de conflitos, círculos restaurativos, práticas de diálogo e cultura institucional de não violência nas redes públicas.",
        modulos: "II",
      },
      {
        imgSrc: `${IMG}/expert-02.1920.webp`,
        imgAlt: "Especialista convidada · Bem-estar de profissionais da educação",
        axisBadge: "Bem-estar profissional",
        nome: "Especialista convidada",
        credencial: "Bem-estar de professoras, professores e equipes escolares, qualidade do trabalho docente e cultura institucional de cuidado mútuo.",
        modulos: "III",
      },
    ],
    counters: [
      { num: "8",   lbl: "Eixos pedagógicos" },
      { num: "2",   lbl: "Coordenação e curadoria" },
      { num: "6",   lbl: "Módulos cobertos" },
      { num: "48h", lbl: "De formação executiva" },
    ],
    nota: "A curadoria docente do VIVAESCOLA é organizada por competências de cultura escolar, saúde mental, convivência e proteção integral e pode variar conforme o perfil da turma, os desafios da rede contratante e os módulos priorizados, preservando os eixos estruturantes do programa.",
    ctaPrimario: "Conhecer o corpo docente completo",
    ctaSecundario: "Solicitar proposta institucional para o VIVAESCOLA",
  },
  modalidades: {
    eyebrow: "Como contratar",
    titulo: "Modalidades de entrega",
    tituloHtml: `Modalidades de <em>entrega</em>`,
    corpoHtml: `<p>O VIVAESCOLA é flexível em sua contratação — o conteúdo pode ser adquirido como trilha completa, módulo avulso, in company para secretarias de educação, ou solução sob medida.</p>
<div class="modes-grid">
  <article class="mode-card-prog featured">
    <span class="tag">Trilha completa · Recomendado</span>
    <h4>Os 6 módulos · 48 horas</h4>
    <p>Acesso integral à arquitetura formativa do VIVAESCOLA — cultura escolar, convivência democrática, saúde mental escolar, permanência, proteção integral e construção da matriz institucional. Certificação consolidada da trilha.</p>
    <a class="cta" href="/contato?programa=vivaescola&modalidade=trilha">Solicitar proposta da trilha →</a>
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
    <p>Programa entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional e o perfil das equipes de bem-estar escolar.</p>
    <a class="cta" href="/contato?programa=vivaescola&modalidade=incompany">Solicitar proposta in company →</a>
  </article>
  <article class="mode-card-prog">
    <span class="tag">Sob medida</span>
    <h4>Customização profunda</h4>
    <p>Customização avançada da trilha — ementas, módulos, cargas horárias, formato e linguagem ajustados a uma necessidade institucional específica. Inclui consultoria de adaptação institucional.</p>
    <a class="cta" href="/contato?programa=vivaescola&modalidade=sob-medida">Solicitar proposta sob medida →</a>
  </article>
</div>`,
  },
  modulosAbertos: {
    eyebrow: "Próximas oportunidades",
    titulo: "Próximos módulos do VIVAESCOLA",
    tituloHtml: `Próximos módulos do <em>VIVAESCOLA</em>`,
    corpoHtml: `<p>A agenda pode reunir módulos avulsos, turmas da trilha completa, encontros online ao vivo, formações presenciais e soluções híbridas vinculadas ao programa.</p>`,
    feature: {
      badge: "Próximo módulo · Em destaque",
      bgImg: `${IMG}/area-educacao.1920.webp`,
      dataLabel: { dias: "17–18", mesAno: "Jun · 2026" },
      modalidade: "Online ao vivo + replay",
      eyebrow: "Seminário institucional · NTC Educação",
      titulo: "Saúde mental escolar — Lei 14.819/2024 aplicada à rotina das redes",
      binding: "Módulo III do VIVAESCOLA · Bem-estar institucional",
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
        dataLabel: { dias: "19", mesAno: "Mai · 2026" },
        eyebrow: "Seminário · Online",
        titulo: "Cultura escolar contemporânea e clima institucional positivo",
        metaHtml: "Módulo <strong>I</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "23", mesAno: "Jul · 2026" },
        eyebrow: "Oficina · Híbrido · DF",
        titulo: "Convivência democrática e justiça restaurativa na escola",
        metaHtml: "Módulo <strong>II</strong> · 8h · 1 dia",
        ctaRotulo: "Solicitar inscrição",
      },
      {
        bgImg: `${IMG}/area-educacao.1920.webp`,
        dataLabel: { dias: "26–27", mesAno: "Ago · 2026" },
        eyebrow: "Curso executivo · Online",
        titulo: "Permanência, vínculos e prevenção da evasão escolar",
        metaHtml: "Módulo <strong>IV</strong> · 12h · 2 tardes",
        ctaRotulo: "Solicitar inscrição",
      },
    ],
    microcopy: "A composição da agenda do VIVAESCOLA é atualizada conforme a edição, o perfil da turma e a demanda institucional. O programa pode ser cursado como trilha completa, módulos avulsos, turmas in company para secretarias de educação ou solução sob medida.",
    bottomCtas: [
      { rotulo: "Ver agenda completa do VIVAESCOLA", href: "/agenda?programa=vivaescola", primario: true },
      { rotulo: "Solicitar inscrição institucional", href: "/contato?programa=vivaescola&assunto=inscricao", primario: false },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ",
    itens: [
      {
        pergunta: "Posso cursar apenas alguns módulos do VIVAESCOLA?",
        resposta: "Sim. O VIVAESCOLA é estruturado para permitir contratação modular — qualquer módulo pode ser cursado individualmente. Quem cursa todos os 6 módulos recebe certificação consolidada da trilha completa.",
      },
      {
        pergunta: "Os módulos têm pré-requisitos?",
        resposta: "Não. Cada módulo é autossuficiente, embora a sequência completa entregue uma arquitetura institucional integrada. Recomendamos o Módulo I (Cultura escolar e clima institucional) como porta de entrada para quem vai cursar a trilha completa.",
      },
      {
        pergunta: "O VIVAESCOLA é indicado para escolas com equipes multiprofissionais reduzidas?",
        resposta: "Sim. O programa é dimensionado para redes de qualquer porte, com módulos aplicáveis à realidade das pequenas, médias e grandes redes. Para articulação intersetorial dedicada ao perfil do município e à rede de proteção local, recomenda-se a contratação in company.",
      },
      {
        pergunta: "Como funciona a contratação in company?",
        resposta: "O VIVAESCOLA pode ser entregue exclusivamente à secretaria estadual ou municipal de educação, em formato presencial, online ou híbrido. O conteúdo pode ser customizado para a realidade da rede e o perfil das equipes de bem-estar escolar. Solicite proposta institucional pelo botão lateral.",
      },
      {
        pergunta: "Há desconto para órgãos públicos e secretarias?",
        resposta: "Sim. Para inscrição institucional (3 ou mais participantes), oferecemos condição comercial dedicada com desconto institucional. Para órgãos públicos, emitimos nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      },
      {
        pergunta: "Como é emitida a certificação?",
        resposta: "Cada módulo concluído gera um certificado institucional próprio. Quando o participante completa os 6 módulos, recebe a certificação consolidada da trilha VIVAESCOLA. Todos os certificados são validáveis publicamente via código QR.",
      },
    ],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve o <em>VIVAESCOLA</em> para a sua rede.",
    corpo: "Solicite proposta institucional para sua secretaria estadual ou municipal de educação — trilha completa, módulos avulsos, in company ou solução sob medida.",
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
      "Cultura escolar positiva instalada",
      "Política de saúde mental escolar implantada",
      "Estratégia de permanência e prevenção da evasão",
      "Matriz aplicada de bem-estar e cultura escolar",
      "Certificação institucional NTC",
    ],
  },
};
