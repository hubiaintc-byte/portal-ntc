/**
 * Conteúdo de fallback das 3 páginas de vertical — textos literais
 * aprovados de 07_Pagina_Vertical_NTC_*.html.
 *
 * Os 3 HTMLs têm a mesma arquitetura de 13 seções; muda apenas
 * texto, imagens, paleta cromática e dados (programas,
 * especialistas, eventos, FAQ). Usamos um objeto `FALLBACK_VERTICAIS`
 * chaveado por slug.
 *
 * Política da sessão "porta do HTML": textos = HTML aprovado.
 * Toda mudança deve passar pela equipe editorial e pela atualização
 * dos protótipos HTML (CLAUDE.md §5.3).
 */

const IMG = "/img/fotos/_optimized";

// =============================================================
// Tipos compartilhados
// =============================================================

export type VerticalSlug = "educacao" | "gestao-publica" | "saude";

export interface CtaItem {
  rotulo: string;
  href: string;
  variante: "gold" | "ghost-light" | "secondary-vert";
}

export interface MetaItem {
  label: string;
  value: string;
  valueSub: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface NavAction {
  rotulo: string;
  primary?: boolean;
  href?: string;
}

export interface AreaCardItem {
  num: string;
  titulo: string;
  texto: string;
  programaSigla: string;
}

export interface ProgramaCardItem {
  sigla: string;
  imagemSrc: string;
  flagAberto?: boolean;
  nome: string;
  tagline: string;
  meta: string;
}

export interface ExpertCard {
  imagemSrc: string;
  imagemAlt: string;
  axisBadge: string;
  titulo: string;
  credencial: string;
  programa: string;
}

export interface ExpertFeaturedCard extends ExpertCard {
  tag: string;
  metaEixo: string;
  metaPrograma: string;
}

export interface AxisCard {
  /** Identificador visual do ícone SVG (renderizado por componente icones.tsx local). */
  iconId: string;
  axisTag: string;
  titulo: string;
  credencial: string;
  programa: string;
}

export interface ExpertsCounter {
  num: string;
  label: string;
}

export interface EventoCard {
  imagemSrc: string;
  data:
    | { variante: "single"; day: string; monYr: string }
    | { variante: "range"; days: string; monYr: string }
    | { variante: "multi"; count: string; period: string };
  programLine: string;
  titulo: string;
  bindingSigla: string;
  metaCompleto: string; // contém <strong>preço</strong> embutido
  cta: { rotulo: string; href: string };
}

export interface SolutionItem {
  titulo: string;
  texto: string;
}

export interface ContentCard {
  imagemSrc: string;
  imagemAlt: string;
  categoria: string;
  titulo: string;
  resumo: string;
  meta1: string;
  meta2: string;
  featured?: boolean;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

// =============================================================
// Conteúdo · NTC EDUCAÇÃO
// =============================================================

const EDUCACAO = {
  slug: "educacao" as VerticalSlug,
  breadcrumb: { current: "NTC Educação" },
  hero: {
    bgSrc: `${IMG}/area-educacao.1920.webp`,
    eyebrow: "Vertical Estratégica · Grupo NTC",
    tituloHtml: "NTC <em>Educação</em>",
    tagline:
      "Inteligência institucional aplicada à formação docente, gestão escolar e transformação das redes públicas de ensino brasileiras.",
    sub: "Nove programas estratégicos articulando alfabetização, educação digital, gestão escolar, educação integral, inclusão, primeira infância, ensino médio e governança digital — desenhados para secretarias estaduais e municipais, redes de ensino e instituições educacionais.",
    ctas: [
      { rotulo: "Conhecer os 9 programas", href: "#programas-edu", variante: "gold" },
      { rotulo: "Ver eventos abertos da área", href: "#eventos-edu", variante: "ghost-light" },
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
  metadados: [
    { label: "Portfólio", value: "9 programas", valueSub: "Estratégicos" },
    { label: "Áreas de atuação", value: "9 frentes", valueSub: "Da alfabetização à IA educacional" },
    { label: "Modalidades", value: "Online · Presencial · Híbrido", valueSub: "In company sob medida" },
    { label: "Atendimento", value: "Nacional", valueSub: "Secretarias · Redes · Instituições" },
  ] satisfies MetaItem[],
  navLinks: [
    { href: "#visao-geral", label: "Visão geral" },
    { href: "#areas", label: "Áreas" },
    { href: "#programas-edu", label: "Programas" },
    { href: "#especialistas", label: "Especialistas" },
    { href: "#eventos-edu", label: "Eventos abertos" },
    { href: "#solucoes-inst", label: "Soluções" },
    { href: "#conteudos", label: "Conteúdos" },
    { href: "#faq", label: "FAQ" },
  ] satisfies NavLink[],
  navActions: [
    { rotulo: "Solicitar proposta", primary: true, href: "#contato" },
    { rotulo: "Baixar portfólio" },
  ] satisfies NavAction[],
  visaoGeral: {
    eyebrow: "Visão geral",
    tituloHtml: "A vertical estratégica do Grupo NTC dedicada à <em>educação pública brasileira</em>.",
    lede: "A NTC Educação articula 9 programas estratégicos em torno dos desafios contemporâneos das redes públicas de ensino — da alfabetização à transformação digital, da primeira infância ao ensino médio.",
    paragrafos: [
      'A NTC Educação é a maior das três verticais do Grupo NTC, com <strong>arquitetura formativa orientada à realidade brasileira</strong>: secretarias estaduais e municipais de educação, redes públicas, escolas e instituições que vivem o cotidiano da educação pública.',
      'A vertical não opera como uma plataforma de cursos avulsos. Cada programa é uma <strong>solução institucional estruturada</strong> — com identidade própria, ementas definidas, coordenação científica dedicada e arquitetura modular flexível. Os programas podem ser contratados como trilhas completas, módulos avulsos, soluções in company ou customizações sob medida.',
      'A coerência editorial é a marca da NTC Educação: do tom premium institucional ao rigor técnico aplicado, todos os programas dialogam entre si na construção de uma <strong>agenda nacional para a educação pública contemporânea</strong>.',
    ],
  },
  areas: {
    eyebrow: "Frentes de atuação",
    tituloHtml: "Nove <em>áreas formativas</em> articuladas",
    intro:
      "Cada uma das 9 frentes da NTC Educação corresponde a um programa estratégico — abordando uma dimensão específica do desafio educacional brasileiro contemporâneo.",
    cards: [
      { num: "01", titulo: "Alfabetização e currículo", texto: "Recomposição da aprendizagem, alfabetização de alta performance e estratégias institucionais de currículo aplicadas às redes públicas.", programaSigla: "PEAR" },
      { num: "02", titulo: "Gestão escolar", texto: "Coordenação pedagógica, gestão escolar orientada a resultados e arquitetura institucional das redes de ensino brasileiras.", programaSigla: "PROGE" },
      { num: "03", titulo: "Educação digital", texto: "Cultura digital, educação midiática, curadoria pedagógica de recursos e transformação institucional das redes para o século 21.", programaSigla: "EDUTEC" },
      { num: "04", titulo: "Educação integral", texto: "Gestão, currículo e resultados em jornada ampliada — articulando proteção integral, formação humana e desempenho institucional.", programaSigla: "PEI" },
      { num: "05", titulo: "Inclusão educacional", texto: "Gestão da inclusão com resultado, atendimento educacional especializado e arquitetura institucional para redes inclusivas.", programaSigla: "PROGIR" },
      { num: "06", titulo: "Primeira infância", texto: "Educação infantil, primeira infância integrada e desenvolvimento humano em redes públicas brasileiras.", programaSigla: "PINEI" },
      { num: "07", titulo: "Convivência e bem-estar", texto: "Permanência, convivência, bem-estar e proteção integral nas redes — agenda institucional de cultura escolar contemporânea.", programaSigla: "VIVAESCOLA" },
      { num: "08", titulo: "Ensino médio", texto: "Itinerários de futuro, empregabilidade, educação para o desenvolvimento e protagonismo juvenil no novo ensino médio.", programaSigla: "FUTURA" },
      { num: "09", titulo: "IA e governança digital", texto: "Inteligência artificial, dados e governança da transformação digital aplicada à educação pública e à gestão das redes.", programaSigla: "EGIDE" },
    ] satisfies AreaCardItem[],
  },
  programas: {
    eyebrow: "Portfólio estratégico",
    tituloHtml: "Nove programas estratégicos · <em>NTC Educação</em>",
    intro:
      "Cada programa é uma solução estruturada em módulos, com identidade própria, coordenação científica e linha editorial específica. Pode ser contratado como trilha completa, módulos avulsos ou solução institucional sob medida.",
    cards: [
      { sigla: "EDUTEC", imagemSrc: `${IMG}/area-educacao.1920.webp`, flagAberto: true, nome: "Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino", tagline: "Cultura digital, educação midiática e transformação institucional para o século 21.", meta: "10 módulos · 80h" },
      { sigla: "PEAR", imagemSrc: `${IMG}/area-educacao.1920.webp`, flagAberto: true, nome: "Programa Estratégico de Alfabetização de Alta Performance e Recomposição da Aprendizagem", tagline: "Recompor a aprendizagem com método e velocidade nas redes públicas de ensino.", meta: "8 módulos · 64h" },
      { sigla: "PEI", imagemSrc: `${IMG}/educacao-inclusiva.1920.webp`, nome: "Programa Estratégico de Educação Integral — Gestão, Currículo e Resultados", tagline: "Educação integral aplicada — gestão, currículo e resultados em jornada ampliada.", meta: "9 módulos · 72h" },
      { sigla: "PROGIR", imagemSrc: `${IMG}/educacao-inclusiva.1920.webp`, nome: "Programa de Gestão da Inclusão com Resultado na Educação", tagline: "Gestão da inclusão com resultado — atendimento especializado e redes inclusivas.", meta: "8 módulos · 64h" },
      { sigla: "PROGE", imagemSrc: `${IMG}/area-educacao.1920.webp`, flagAberto: true, nome: "Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Resultados", tagline: "Gestão escolar e coordenação pedagógica orientadas a resultados mensuráveis.", meta: "10 módulos · 80h" },
      { sigla: "EGIDE", imagemSrc: `${IMG}/area-educacao.1920.webp`, nome: "Programa Executivo de IA, Dados e Governança da Transformação Digital na Educação", tagline: "Inteligência artificial e governança digital aplicadas à gestão das redes públicas.", meta: "8 módulos · 64h" },
      { sigla: "VIVAESCOLA", imagemSrc: `${IMG}/educacao-inclusiva.1920.webp`, nome: "Programa Estratégico de Convivência, Permanência, Bem-Estar e Proteção Integral na Educação", tagline: "Cultura escolar contemporânea — convivência, permanência e proteção integral.", meta: "6 módulos · 48h" },
      { sigla: "PINEI", imagemSrc: `${IMG}/educacao-inclusiva.1920.webp`, nome: "Programa Integrado de Primeira Infância e Educação Infantil", tagline: "Primeira infância e educação infantil articuladas em rede pública.", meta: "6 módulos · 48h" },
      { sigla: "FUTURA", imagemSrc: `${IMG}/area-educacao.1920.webp`, nome: "Programa Estratégico de Ensino Médio, Itinerários de Futuro, Empregabilidade e Educação para o Desenvolvimento", tagline: "Ensino médio com itinerários, empregabilidade e protagonismo juvenil.", meta: "4 módulos · 32h" },
    ] satisfies ProgramaCardItem[],
    ctaPrimario: { rotulo: "Ver todos os 15 programas do Grupo NTC", href: "/" },
    ctaSecundario: { rotulo: "Solicitar proposta institucional", href: "#contato" },
  },
  // NTC Educação usa variante de curadoria com cards de pessoas (8 eixos formativos)
  autoridade: {
    tipo: "experts" as const,
    pillTexto: "Curadoria científica · Em estruturação contínua",
    eyebrow: "Corpo docente de referência",
    tituloHtml:
      "Especialistas que conectam <em>política pública, gestão educacional e prática de rede</em>",
    intro:
      "A NTC Educação articula pesquisadores, gestores, consultores, formadores e especialistas com atuação em redes públicas de ensino — da alfabetização à inteligência artificial educacional, da primeira infância ao ensino médio.",
    marker: "Especialistas convidados · Por eixo formativo",
    cards: [
      { imagemSrc: `${IMG}/expert-02.1920.webp`, imagemAlt: "Especialista convidada · Alfabetização e recomposição das aprendizagens", axisBadge: "Alfabetização", titulo: "Especialista convidada", credencial: "Alfabetização de alta performance, recomposição das aprendizagens e estratégias institucionais de currículo aplicadas a redes públicas.", programa: "PEAR" },
      { imagemSrc: `${IMG}/expert-03.1920.webp`, imagemAlt: "Especialista convidado · Gestão escolar e liderança educacional", axisBadge: "Gestão escolar", titulo: "Especialista convidado", credencial: "Coordenação pedagógica, gestão escolar orientada a resultados e formação de lideranças educacionais nas redes brasileiras.", programa: "PROGE" },
      { imagemSrc: `${IMG}/expert-04.1920.webp`, imagemAlt: "Especialista convidado · Educação digital, inovação e IA aplicada", axisBadge: "Educação digital e IA", titulo: "Especialista convidado", credencial: "Cultura digital, educação midiática, inteligência artificial aplicada à educação e curadoria pedagógica de recursos digitais.", programa: "EDUTEC · EGIDE" },
      { imagemSrc: `${IMG}/expert-01.1920.webp`, imagemAlt: "Especialista convidada · Educação integral em rede pública", axisBadge: "Educação integral", titulo: "Especialista convidada", credencial: "Gestão, currículo e resultados em jornada ampliada, articulando proteção integral, formação humana e desempenho institucional.", programa: "PEI" },
      { imagemSrc: `${IMG}/expert-02.1920.webp`, imagemAlt: "Especialista convidada · Primeira infância e educação infantil", axisBadge: "Primeira infância", titulo: "Especialista convidada", credencial: "Educação infantil, primeira infância integrada e desenvolvimento humano em redes públicas brasileiras.", programa: "PINEI" },
      { imagemSrc: `${IMG}/expert-03.1920.webp`, imagemAlt: "Especialista convidado · Inclusão educacional e equidade", axisBadge: "Inclusão e equidade", titulo: "Especialista convidado", credencial: "Gestão da inclusão com resultado, atendimento educacional especializado e arquitetura institucional para redes inclusivas.", programa: "PROGIR · VIVAESCOLA" },
      { imagemSrc: `${IMG}/expert-04.1920.webp`, imagemAlt: "Especialista convidada · Ensino médio e juventudes", axisBadge: "Ensino médio e juventudes", titulo: "Especialista convidada", credencial: "Itinerários de futuro, empregabilidade, educação para o desenvolvimento e protagonismo juvenil no novo ensino médio.", programa: "FUTURA" },
      { imagemSrc: `${IMG}/expert-01.1920.webp`, imagemAlt: "Especialista convidado · Avaliação, currículo e políticas públicas", axisBadge: "Avaliação e políticas", titulo: "Especialista convidado", credencial: "Avaliação educacional, desenho curricular, políticas públicas de educação e articulação interfederativa de redes de ensino.", programa: "PROGE · PEAR" },
    ] satisfies ExpertCard[],
    counters: [
      { num: "8", label: "Eixos formativos" },
      { num: "+", label: "Especialistas convidados" },
      { num: "9", label: "Programas relacionados" },
      { num: "Nacional", label: "Cobertura editorial" },
    ] satisfies ExpertsCounter[],
    nota:
      "A curadoria científica da NTC Educação é atualizada continuamente, com especialistas convidados conforme os programas, eixos temáticos e demandas institucionais de cada secretaria, rede ou instituição educacional.",
    ctas: [
      { rotulo: "Conhecer o corpo docente completo", href: "#contato", variante: "gold" },
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "secondary-vert" },
    ] satisfies CtaItem[],
  },
  eventos: {
    eyebrow: "Capacitação · Inscrições abertas",
    tituloHtml: "Eventos abertos da <em>NTC Educação</em>",
    intro:
      "Edições operacionais dos programas estratégicos da vertical com inscrições ativas — disponíveis para inscrição individual, equipe ou contratação institucional.",
    cards: [
      { imagemSrc: `${IMG}/area-educacao.1920.webp`, data: { variante: "single", day: "27", monYr: "Mai · 2026" }, programLine: "Seminário · NTC Educação", titulo: "Cultura Digital, Educação Midiática e Transformação da Educação", bindingSigla: "EDUTEC", metaCompleto: "Online · 8h · 1 dia <strong>Sob consulta</strong>", cta: { rotulo: "Ver detalhes", href: "#" } },
      { imagemSrc: `${IMG}/area-educacao.1920.webp`, data: { variante: "range", days: "22–23", monYr: "Mai · 2026" }, programLine: "Seminário · NTC Educação", titulo: "Alfabetização de Alta Performance: estratégias para recomposição", bindingSigla: "PEAR", metaCompleto: "Online · 16h · 2 dias <strong>R$ 1.490</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
      { imagemSrc: `${IMG}/area-educacao.1920.webp`, data: { variante: "single", day: "25", monYr: "Jun · 2026" }, programLine: "Curso Executivo · NTC Educação", titulo: "Coordenação pedagógica orientada a resultados na rede pública", bindingSigla: "PROGE", metaCompleto: "Online · 20h · 3 dias <strong>R$ 1.690</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
    ] satisfies EventoCard[],
    ctaAgenda: { rotulo: "Ver agenda completa de Educação", href: "/" },
  },
  solucoes: {
    eyebrow: "Contratação institucional",
    tituloHtml: "Soluções para <em>secretarias, redes e instituições</em>",
    intro:
      "Além dos eventos abertos e dos programas com inscrição individual, a NTC Educação oferece soluções dedicadas para órgãos públicos — turmas fechadas, programas in company, trilhas customizadas e soluções sob medida.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
    ] satisfies CtaItem[],
    items: [
      { titulo: "Turmas fechadas in company", texto: "Programa entregue exclusivamente à secretaria contratante, em formato presencial, online ou híbrido. Conteúdo customizável para a realidade institucional da rede." },
      { titulo: "Trilhas customizadas", texto: "Sequências formativas curadas combinando módulos de diferentes programas — adequados a uma necessidade específica da rede ou da instituição." },
      { titulo: "Soluções sob medida", texto: "Customização profunda de ementas, módulos, cargas horárias e formato — para atender uma demanda institucional específica que não cabe nos programas standards." },
      { titulo: "Atendimento dedicado", texto: "Equipe comercial dedicada a secretarias, redes e instituições — apoio à formalização de contratação pública, empenho e nota fiscal direta no CNPJ do órgão." },
    ] satisfies SolutionItem[],
  },
  conteudos: {
    eyebrow: "Produção editorial",
    tituloHtml: "Conteúdos da <em>NTC Educação</em>",
    intro:
      "Análises, publicações e estudos da vertical sobre os desafios contemporâneos da educação pública brasileira.",
    cards: [
      { imagemSrc: `${IMG}/conteudo-01.1920.webp`, imagemAlt: "Análise editorial NTC Educação", categoria: "Análise · NTC Educação", titulo: "Recomposição da aprendizagem nas redes públicas: leituras e caminhos institucionais", resumo: "Diagnóstico estruturado dos gaps de capacidade e os caminhos institucionais para enfrentar a herança pedagógica do período pandêmico nas redes estaduais e municipais.", meta1: "Tempo de leitura", meta2: "Próxima publicação", featured: true },
      { imagemSrc: `${IMG}/conteudo-02.1920.webp`, imagemAlt: "Insight editorial", categoria: "Insight · NTC Educação", titulo: "Cultura digital aplicada à escola pública contemporânea", resumo: "Caminhos institucionais para integrar cultura digital ao currículo das redes.", meta1: "Análise", meta2: "Em curadoria" },
      { imagemSrc: `${IMG}/conteudo-03.1920.webp`, imagemAlt: "Publicação editorial", categoria: "Publicação · NTC Educação", titulo: "Educação integral em rede pública: agenda 2026", resumo: "Estudo sobre articulação entre jornada ampliada e gestão escolar.", meta1: "Estudo técnico", meta2: "Em desenvolvimento" },
    ] satisfies ContentCard[],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ · NTC Educação",
    items: [
      { pergunta: "Como uma secretaria contrata a NTC Educação?", resposta: "Para órgãos públicos (secretarias estaduais, municipais, autarquias e fundações), oferecemos contratação institucional dedicada com nota fiscal direta no CNPJ do órgão. Aceitamos empenho e demais modalidades previstas em lei. A equipe comercial NTC apoia o trâmite. Solicite proposta institucional pelo botão lateral." },
      { pergunta: "Posso contratar apenas um programa, ou preciso adquirir o portfólio completo?", resposta: "Os 9 programas são independentes e podem ser contratados separadamente. Cada programa tem sua própria arquitetura modular flexível — pode-se contratar a trilha completa de um programa, módulos avulsos ou solução sob medida que combine elementos de diferentes programas." },
      { pergunta: "Quais modalidades de entrega estão disponíveis?", resposta: "Os programas são entregues em modalidades online (via plataforma EventON NTC), presencial (em capitais estratégicas), híbrida (combinando ambos), in company (na sede da instituição contratante) ou sob medida. A escolha depende do programa, do volume de participantes e da preferência institucional." },
      { pergunta: "Como funciona a customização de programas para minha rede?", resposta: "A customização é feita em duas camadas: ajustes editoriais (linguagem, casos aplicados, ênfases temáticas) e ajustes estruturais (cargas horárias, sequência modular, formato). A coordenação científica da NTC Educação faz a curadoria técnica para garantir que a customização preserve a integridade pedagógica do programa." },
      { pergunta: "A NTC Educação atende redes municipais pequenas?", resposta: "Sim. A vertical atende secretarias e redes de todos os portes — estaduais, municipais grandes (capitais), médias e pequenas. Para municípios pequenos, frequentemente articulamos consórcios de redes vizinhas ou modalidades online com escala estadual para reduzir custo institucional. Solicite proposta para sua realidade." },
      { pergunta: "Os participantes recebem certificado?", resposta: "Sim. Cada módulo e cada programa entregam certificação institucional emitida pelo Instituto NTC do Brasil, validável publicamente via código QR. Para a trilha completa de um programa, é emitida certificação consolidada após a conclusão de todos os módulos." },
    ] satisfies FaqItem[],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve a <em>NTC Educação</em> para sua secretaria, rede ou instituição.",
    sub: "Solicite proposta institucional para os programas estratégicos de Educação · trilhas completas, módulos avulsos, in company ou solução sob medida.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
      { rotulo: "Ver eventos abertos", href: "#eventos-edu", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
};

// =============================================================
// Conteúdo · NTC GESTÃO PÚBLICA
// =============================================================

const GESTAO_PUBLICA = {
  slug: "gestao-publica" as VerticalSlug,
  breadcrumb: { current: "NTC Gestão Pública" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica-premium.1920.webp`,
    eyebrow: "Vertical Estratégica · Grupo NTC",
    tituloHtml: "NTC <em>Gestão Pública</em>",
    tagline:
      "Inteligência institucional aplicada à modernização da administração pública, à profissionalização das contratações e ao desenvolvimento da alta liderança no setor público brasileiro.",
    sub: "Três programas estratégicos articulando a Lei 14.133/2021, a governança de instituições públicas e o aprimoramento da liderança e do desempenho do servidor — desenhados para órgãos da administração direta e indireta, agências reguladoras, autarquias, fundações e empresas estatais.",
    ctas: [
      { rotulo: "Conhecer os 3 programas", href: "#programas-gov", variante: "gold" },
      { rotulo: "Ver eventos abertos da área", href: "#eventos-gov", variante: "ghost-light" },
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
  metadados: [
    { label: "Portfólio", value: "3 programas", valueSub: "Estratégicos" },
    { label: "Áreas de atuação", value: "3 frentes", valueSub: "Contratações · Liderança · Gestão de instituições" },
    { label: "Modalidades", value: "Online · Presencial · Híbrido", valueSub: "In company sob medida" },
    { label: "Atendimento", value: "Nacional", valueSub: "União · Estados · Municípios · Autarquias" },
  ] satisfies MetaItem[],
  navLinks: [
    { href: "#visao-geral", label: "Visão geral" },
    { href: "#areas", label: "Áreas" },
    { href: "#programas-gov", label: "Programas" },
    { href: "#especialistas", label: "Especialistas" },
    { href: "#eventos-gov", label: "Eventos abertos" },
    { href: "#solucoes-inst", label: "Soluções" },
    { href: "#conteudos", label: "Conteúdos" },
    { href: "#faq", label: "FAQ" },
  ] satisfies NavLink[],
  navActions: [
    { rotulo: "Solicitar proposta", primary: true, href: "#contato" },
    { rotulo: "Baixar portfólio" },
  ] satisfies NavAction[],
  visaoGeral: {
    eyebrow: "Visão geral",
    tituloHtml: "A vertical estratégica do Grupo NTC dedicada à <em>administração pública brasileira</em>.",
    lede: "A NTC Gestão Pública articula três programas estratégicos em torno dos desafios contemporâneos do Estado brasileiro — da profissionalização das contratações públicas à modernização institucional, do desempenho gerencial à formação da alta liderança do setor público.",
    paragrafos: [
      'A NTC Gestão Pública é a vertical do Grupo NTC dedicada à <strong>capacitação técnica e estratégica de quem decide no setor público</strong>: gestores, pregoeiros, agentes de contratação, controladores, dirigentes, procuradores, secretários e equipes de instituições da administração direta e indireta — União, estados, municípios, autarquias, fundações, agências reguladoras e empresas estatais.',
      'A vertical não opera como uma plataforma de cursos avulsos. Cada programa é uma <strong>solução institucional estruturada</strong> — com identidade própria, ementas alinhadas à legislação vigente, coordenação científica dedicada e arquitetura modular flexível. Os programas podem ser contratados como trilhas completas, módulos avulsos, soluções in company ou customizações sob medida para a realidade do órgão.',
      'O rigor técnico e a segurança jurídica são a marca da NTC Gestão Pública: todos os programas dialogam entre si na construção de uma <strong>agenda nacional para a modernização do Estado brasileiro</strong>, ancorada na Lei 14.133/2021, na governança pública contemporânea e no compromisso com a integridade e a eficiência da administração.',
    ],
  },
  areas: {
    eyebrow: "Frentes de atuação",
    tituloHtml: "Três <em>áreas formativas</em> articuladas",
    intro:
      "Cada uma das três frentes da NTC Gestão Pública corresponde a um programa estratégico — abordando uma dimensão específica do desafio contemporâneo da administração pública brasileira.",
    cards: [
      { num: "01", titulo: "Contratações públicas", texto: "Profissionalização da nova Lei de Licitações e Contratos (Lei 14.133/2021), atuação dos agentes de contratação, planejamento, fiscalização, governança e segurança jurídica em todo o ciclo de aquisições do Estado.", programaSigla: "AGIP" },
      { num: "02", titulo: "Liderança e alta gestão pública", texto: "Desenvolvimento da liderança no setor público, formação executiva de dirigentes, secretários e gestores estratégicos — articulando visão de Estado, capacidade decisória e desempenho institucional.", programaSigla: "LIDERA" },
      { num: "03", titulo: "Gestão institucional do setor público", texto: "Modernização e gestão integrada de instituições públicas — planejamento, governança, processos, indicadores e cultura organizacional aplicada à realidade da administração direta e indireta.", programaSigla: "SIGA" },
    ] satisfies AreaCardItem[],
  },
  programas: {
    eyebrow: "Portfólio estratégico",
    tituloHtml: "Três programas estratégicos · <em>NTC Gestão Pública</em>",
    intro:
      "Cada programa é uma solução estruturada em módulos, com identidade própria, coordenação científica e linha editorial específica. Pode ser contratado como trilha completa, módulos avulsos ou solução institucional sob medida para o órgão público.",
    cards: [
      { sigla: "AGIP", imagemSrc: `${IMG}/area-gestao-publica-premium.1920.webp`, flagAberto: true, nome: "Programa de Aprimoramento da Gestão Integral em Procedimentos Públicos · Lei 14.133/2021", tagline: "Profissionalização técnica e jurídica das contratações públicas — do planejamento à fiscalização contratual.", meta: "10 módulos · 80h" },
      { sigla: "LIDERA", imagemSrc: `${IMG}/autoridade-gestao-publica.1920.webp`, flagAberto: true, nome: "Programa Executivo de Liderança, Alta Gestão e Desenvolvimento Estratégico no Setor Público", tagline: "Formação executiva da alta liderança pública — visão de Estado, capacidade decisória e desempenho institucional.", meta: "8 módulos · 64h" },
      { sigla: "SIGA", imagemSrc: `${IMG}/plenario-publico.1920.webp`, nome: "Sistema Integrado de Gestão da Administração Pública · Planejamento, Governança e Desempenho Institucional", tagline: "Modernização institucional aplicada — gestão integrada, processos, indicadores e cultura organizacional do setor público.", meta: "8 módulos · 64h" },
    ] satisfies ProgramaCardItem[],
    ctaPrimario: { rotulo: "Ver todos os 15 programas do Grupo NTC", href: "/" },
    ctaSecundario: { rotulo: "Solicitar proposta institucional", href: "#contato" },
  },
  autoridade: {
    tipo: "experts-featured" as const,
    pillTexto: "Curadoria científica · Em estruturação contínua",
    eyebrow: "Autoridade técnica",
    tituloHtml: "Autoridade técnica para os grandes desafios da <em>Administração Pública</em>",
    intro:
      "A NTC Gestão Pública reúne ministros, conselheiros, juristas, gestores públicos e especialistas em controle, contratações, liderança e governança institucional, compondo uma curadoria de alto nível para órgãos e entidades públicas brasileiras.",
    markerFeatured: "Nomes em destaque",
    featured: [
      { imagemSrc: `${IMG}/autoridade-gestao-publica.1920.webp`, imagemAlt: "Especialista de referência em liderança institucional pública", axisBadge: "Liderança institucional", tag: "Curadoria de referência", titulo: "Autoridade em validação institucional", credencial: "Trajetória aplicada em alta gestão pública, direção de órgãos da União e formação executiva de dirigentes do Estado brasileiro.", metaEixo: "Liderança e alta gestão", metaPrograma: "LIDERA · SIGA", programa: "LIDERA · SIGA" },
      { imagemSrc: `${IMG}/autoridade-contratacoes.1920.webp`, imagemAlt: "Especialista de referência em contratações públicas e Lei 14.133/2021", axisBadge: "Contratações públicas", tag: "Curadoria de referência", titulo: "Autoridade em validação institucional", credencial: "Atuação consolidada em controle, contratações públicas e aplicação da Lei 14.133/2021 em órgãos federais e tribunais de contas.", metaEixo: "Controle externo e contratações", metaPrograma: "AGIP", programa: "AGIP" },
    ] satisfies ExpertFeaturedCard[],
    markerGrid: "Especialistas convidados · Por eixo de atuação",
    cards: [
      { imagemSrc: `${IMG}/expert-02.1920.webp`, imagemAlt: "Especialista convidado · Contratações públicas e Lei 14.133/2021", axisBadge: "Contratações públicas", titulo: "Especialista convidado", credencial: "Lei 14.133/2021 aplicada, planejamento, fiscalização e gestão contratual em órgãos da administração direta.", programa: "AGIP" },
      { imagemSrc: `${IMG}/expert-03.1920.webp`, imagemAlt: "Especialista convidada · Controle externo e tribunais de contas", axisBadge: "Controle externo", titulo: "Especialista convidada", credencial: "Atuação em tribunais de contas, controladorias internas e auditoria governamental aplicada ao setor público.", programa: "AGIP · SIGA" },
      { imagemSrc: `${IMG}/expert-04.1920.webp`, imagemAlt: "Especialista convidado · Governança, integridade e accountability", axisBadge: "Governança e integridade", titulo: "Especialista convidado", credencial: "Governança pública, integridade institucional, accountability e compliance aplicados a órgãos federais e estaduais.", programa: "SIGA" },
      { imagemSrc: `${IMG}/expert-01.1920.webp`, imagemAlt: "Especialista convidado · Direito público e jurisprudência aplicada", axisBadge: "Direito público", titulo: "Especialista convidado", credencial: "Direito administrativo, jurisprudência aplicada à Lei 14.133/2021 e segurança jurídica em contratações e atos de gestão.", programa: "AGIP" },
      { imagemSrc: `${IMG}/expert-02.1920.webp`, imagemAlt: "Especialista convidada · Planejamento, fiscalização e gestão contratual", axisBadge: "Gestão contratual", titulo: "Especialista convidada", credencial: "Planejamento da contratação, formulação de termos de referência, fiscalização contratual e gestão de fornecedores no setor público.", programa: "AGIP" },
      { imagemSrc: `${IMG}/expert-03.1920.webp`, imagemAlt: "Especialista convidado · Formação de servidores e escolas de governo", axisBadge: "Escolas de governo", titulo: "Especialista convidado", credencial: "Coordenação de escolas de governo, desenho curricular de formação de servidores e desenvolvimento de quadros estratégicos.", programa: "LIDERA · SIGA" },
      { imagemSrc: `${IMG}/expert-04.1920.webp`, imagemAlt: "Especialista convidada · Transformação digital e inovação no setor público", axisBadge: "Transformação digital", titulo: "Especialista convidada", credencial: "Inovação institucional, governo digital, dados e modernização operacional aplicada à administração pública brasileira.", programa: "SIGA" },
      { imagemSrc: `${IMG}/expert-01.1920.webp`, imagemAlt: "Especialista convidado · Planejamento estratégico e gestão de instituições", axisBadge: "Gestão institucional", titulo: "Especialista convidado", credencial: "Planejamento estratégico, indicadores institucionais, cultura organizacional e modernização de instituições públicas.", programa: "SIGA · LIDERA" },
    ] satisfies ExpertCard[],
    counters: [
      { num: "8", label: "Eixos de curadoria" },
      { num: "+", label: "Especialistas convidados" },
      { num: "3", label: "Programas relacionados" },
      { num: "14.133", label: "Lei de referência" },
    ] satisfies ExpertsCounter[],
    nota:
      "A curadoria científica da NTC Gestão Pública é atualizada continuamente, com especialistas convidados conforme os programas, eixos temáticos e demandas institucionais de cada órgão público, autarquia ou entidade da administração.",
    ctas: [
      { rotulo: "Conhecer o corpo docente completo", href: "#contato", variante: "gold" },
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "secondary-vert" },
    ] satisfies CtaItem[],
  },
  eventos: {
    eyebrow: "Capacitação · Inscrições abertas",
    tituloHtml: "Eventos abertos da <em>NTC Gestão Pública</em>",
    intro:
      "Edições operacionais dos programas estratégicos da vertical com inscrições ativas — disponíveis para inscrição individual de servidores, equipe técnica ou contratação institucional do órgão.",
    cards: [
      { imagemSrc: `${IMG}/area-gestao-publica-premium.1920.webp`, data: { variante: "multi", count: "4 encontros", period: "Jun – Jul · 2026" }, programLine: "Jornada Híbrida · NTC Gestão Pública", titulo: "Lei 14.133/2021 aplicada: do planejamento à fiscalização contratual", bindingSigla: "AGIP", metaCompleto: "Híbrido · 24h · 4 quintas <strong>R$ 2.490</strong>", cta: { rotulo: "Ver detalhes", href: "#" } },
      { imagemSrc: `${IMG}/autoridade-gestao-publica.1920.webp`, data: { variante: "range", days: "28–29", monYr: "Mai · 2026" }, programLine: "Curso Executivo · NTC Gestão Pública", titulo: "Liderança Pública de Alto Desempenho: visão de Estado e capacidade decisória", bindingSigla: "LIDERA", metaCompleto: "Online · 12h · 2 tardes <strong>R$ 1.690</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
      { imagemSrc: `${IMG}/plenario-publico.1920.webp`, data: { variante: "single", day: "18", monYr: "Jun · 2026" }, programLine: "Seminário · NTC Gestão Pública", titulo: "Governança institucional aplicada ao setor público brasileiro", bindingSigla: "SIGA", metaCompleto: "Online · 8h · 1 dia <strong>R$ 990</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
    ] satisfies EventoCard[],
    ctaAgenda: { rotulo: "Ver agenda completa de Gestão Pública", href: "/" },
  },
  solucoes: {
    eyebrow: "Contratação institucional",
    tituloHtml: "Soluções para <em>órgãos, autarquias e instituições do setor público</em>",
    intro:
      "Além dos eventos abertos e dos programas com inscrição individual, a NTC Gestão Pública oferece soluções dedicadas para a administração pública — turmas fechadas in company, trilhas customizadas, soluções sob medida e atendimento institucional especializado para União, estados, municípios, autarquias, fundações, agências reguladoras e empresas estatais.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
    ] satisfies CtaItem[],
    items: [
      { titulo: "Turmas fechadas in company", texto: "Programa entregue exclusivamente ao órgão contratante, em formato presencial, online ou híbrido. Conteúdo customizável à realidade institucional, à legislação local e às prioridades estratégicas da administração." },
      { titulo: "Trilhas customizadas", texto: "Sequências formativas curadas combinando módulos de diferentes programas — desenhadas para uma necessidade específica do órgão, da carreira ou do nível hierárquico atendido." },
      { titulo: "Soluções sob medida", texto: "Customização profunda de ementas, módulos, cargas horárias e formato — para atender uma demanda institucional específica que não cabe nos programas standards, com aderência total à realidade jurídica e operacional do órgão." },
      { titulo: "Atendimento dedicado", texto: "Equipe comercial dedicada a órgãos públicos — apoio à formalização da contratação direta ou por licitação (Lei 14.133/2021), elaboração de termo de referência, empenho e nota fiscal direta no CNPJ do órgão." },
    ] satisfies SolutionItem[],
  },
  conteudos: {
    eyebrow: "Produção editorial",
    tituloHtml: "Conteúdos da <em>NTC Gestão Pública</em>",
    intro:
      "Análises, publicações e estudos da vertical sobre os desafios contemporâneos da administração pública brasileira — contratações, liderança e modernização institucional.",
    cards: [
      { imagemSrc: `${IMG}/conteudo-01.1920.webp`, imagemAlt: "Análise editorial NTC Gestão Pública", categoria: "Análise · NTC Gestão Pública", titulo: "Lei 14.133/2021 três anos depois: leituras institucionais e caminhos de profissionalização", resumo: "Diagnóstico estruturado dos desafios reais enfrentados por órgãos da administração direta e indireta na implementação da nova Lei de Licitações — e os caminhos institucionais para profissionalizar o agente de contratação e mitigar o passivo jurídico.", meta1: "Tempo de leitura", meta2: "Próxima publicação", featured: true },
      { imagemSrc: `${IMG}/conteudo-02.1920.webp`, imagemAlt: "Insight editorial", categoria: "Insight · NTC Gestão Pública", titulo: "Liderança pública contemporânea: o que muda na alta gestão do Estado", resumo: "Caminhos institucionais para formar dirigentes capazes de articular visão estratégica, decisão e desempenho na administração.", meta1: "Análise", meta2: "Em curadoria" },
      { imagemSrc: `${IMG}/conteudo-03.1920.webp`, imagemAlt: "Publicação editorial", categoria: "Publicação · NTC Gestão Pública", titulo: "Governança institucional do setor público: agenda 2026", resumo: "Estudo sobre articulação entre planejamento, indicadores e cultura organizacional em instituições do Estado brasileiro.", meta1: "Estudo técnico", meta2: "Em desenvolvimento" },
    ] satisfies ContentCard[],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ · NTC Gestão Pública",
    items: [
      { pergunta: "Como um órgão público contrata a NTC Gestão Pública?", resposta: "Para órgãos da administração direta e indireta (União, estados, municípios, autarquias, fundações, agências reguladoras e empresas estatais), oferecemos contratação institucional dedicada com nota fiscal direta no CNPJ do órgão. Atuamos por inexigibilidade, dispensa ou licitação conforme a hipótese aplicável da Lei 14.133/2021, e a equipe comercial NTC apoia a elaboração do termo de referência, o empenho e o trâmite completo. Solicite proposta institucional pelo botão lateral." },
      { pergunta: "Posso contratar apenas um programa, ou preciso adquirir o portfólio completo?", resposta: "Os três programas são independentes e podem ser contratados separadamente. Cada programa tem sua própria arquitetura modular flexível — pode-se contratar a trilha completa, módulos avulsos ou solução sob medida que combine elementos do AGIP, LIDERA e SIGA conforme a necessidade institucional do órgão." },
      { pergunta: "Quais modalidades de entrega estão disponíveis?", resposta: "Os programas são entregues em modalidades online (via plataforma EventOn NTC), presencial (em capitais estratégicas), híbrida (combinando ambos), in company (na sede do órgão contratante) ou sob medida. A escolha depende do programa, do volume de servidores atendidos e da preferência institucional." },
      { pergunta: "Como funciona a customização de programas para meu órgão?", resposta: "A customização é feita em duas camadas: ajustes editoriais (linguagem, casos aplicados, ênfases temáticas, legislação local correlata) e ajustes estruturais (cargas horárias, sequência modular, formato). A coordenação científica da NTC Gestão Pública faz a curadoria técnica para garantir que a customização preserve a integridade jurídica e técnica do programa." },
      { pergunta: "A NTC Gestão Pública atende municípios pequenos e órgãos de menor porte?", resposta: "Sim. A vertical atende órgãos de todos os portes — União, estados, capitais, municípios médios e pequenos, autarquias e empresas estatais. Para municípios pequenos, frequentemente articulamos consórcios públicos ou modalidades online com escala regional para reduzir o custo institucional preservando a qualidade da formação. Solicite proposta para a realidade do seu órgão." },
      { pergunta: "Os servidores e dirigentes recebem certificado?", resposta: "Sim. Cada módulo e cada programa entregam certificação institucional emitida pelo Instituto NTC do Brasil, validável publicamente via código QR e adequada à comprovação de capacitação para fins de progressão funcional, designação como agente de contratação ou exigências da legislação aplicável. Para a trilha completa de um programa, é emitida certificação consolidada após a conclusão de todos os módulos." },
    ] satisfies FaqItem[],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve a <em>NTC Gestão Pública</em> para seu órgão, autarquia ou instituição do setor público.",
    sub: "Solicite proposta institucional para os programas estratégicos da vertical · trilhas completas, módulos avulsos, in company ou solução sob medida — com aderência à Lei 14.133/2021 e à realidade institucional do órgão.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
      { rotulo: "Ver eventos abertos", href: "#eventos-gov", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
};

// =============================================================
// Conteúdo · NTC SAÚDE (autoridade tem variante "axis" — eixos sem fotos)
// =============================================================

const SAUDE = {
  slug: "saude" as VerticalSlug,
  breadcrumb: { current: "NTC Saúde" },
  hero: {
    bgSrc: `${IMG}/area-saude-premium2.1920.webp`,
    eyebrow: "Vertical Estratégica · Grupo NTC",
    tituloHtml: "NTC <em>Saúde</em>",
    tagline:
      "Inteligência institucional aplicada ao Sistema Único de Saúde, à atenção primária e à gestão das redes assistenciais públicas brasileiras.",
    sub: "Três programas estratégicos articulando a gestão integrada do SUS, o fortalecimento da atenção primária e a profissionalização da liderança em saúde pública — desenhados para secretarias estaduais e municipais de saúde, hospitais públicos, redes assistenciais, consórcios intermunicipais e instituições do setor.",
    ctas: [
      { rotulo: "Conhecer os 3 programas", href: "#programas-sau", variante: "gold" },
      { rotulo: "Ver eventos abertos da área", href: "#eventos-sau", variante: "ghost-light" },
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
  metadados: [
    { label: "Portfólio", value: "3 programas", valueSub: "Estratégicos" },
    { label: "Áreas de atuação", value: "3 frentes", valueSub: "Gestão do SUS · Atenção primária · Liderança em saúde" },
    { label: "Modalidades", value: "Online · Presencial · Híbrido", valueSub: "In company sob medida" },
    { label: "Atendimento", value: "Nacional", valueSub: "Secretarias · Hospitais · Consórcios · Redes" },
  ] satisfies MetaItem[],
  navLinks: [
    { href: "#visao-geral", label: "Visão geral" },
    { href: "#areas", label: "Áreas" },
    { href: "#programas-sau", label: "Programas" },
    { href: "#especialistas", label: "Especialistas" },
    { href: "#eventos-sau", label: "Eventos abertos" },
    { href: "#solucoes-inst", label: "Soluções" },
    { href: "#conteudos", label: "Conteúdos" },
    { href: "#faq", label: "FAQ" },
  ] satisfies NavLink[],
  navActions: [
    { rotulo: "Solicitar proposta", primary: true, href: "#contato" },
    { rotulo: "Baixar portfólio" },
  ] satisfies NavAction[],
  visaoGeral: {
    eyebrow: "Visão geral",
    tituloHtml: "A vertical estratégica do Grupo NTC dedicada à <em>saúde pública brasileira</em>.",
    lede: "A NTC Saúde articula três programas estratégicos em torno dos desafios contemporâneos do Sistema Único de Saúde — da gestão integrada do SUS ao fortalecimento da atenção primária, da liderança das redes assistenciais à profissionalização da gestão hospitalar pública.",
    paragrafos: [
      'A NTC Saúde é a vertical do Grupo NTC dedicada à <strong>capacitação técnica e estratégica de quem opera o SUS</strong>: secretários, gestores, dirigentes de hospitais públicos, coordenadores de atenção primária, equipes de auditoria, regulação e vigilância, e quadros executivos de consórcios intermunicipais de saúde e instituições filantrópicas conveniadas.',
      'A vertical não opera como uma plataforma de cursos avulsos. Cada programa é uma <strong>solução institucional estruturada</strong> — com identidade própria, ementas alinhadas à legislação sanitária e às pactuações do SUS, coordenação científica dedicada e arquitetura modular flexível. Os programas podem ser contratados como trilhas completas, módulos avulsos, soluções in company ou customizações sob medida para a realidade da rede assistencial.',
      'O rigor técnico, o compromisso com a saúde pública e a aderência ao SUS são a marca da NTC Saúde: todos os programas dialogam entre si na construção de uma <strong>agenda nacional para a gestão contemporânea da saúde pública brasileira</strong>, ancorada na universalidade, na integralidade e na equidade.',
    ],
  },
  areas: {
    eyebrow: "Frentes de atuação",
    tituloHtml: "Três <em>áreas formativas</em> articuladas",
    intro:
      "Cada uma das três frentes da NTC Saúde corresponde a um programa estratégico — abordando uma dimensão específica do desafio contemporâneo do Sistema Único de Saúde e da gestão da saúde pública brasileira.",
    cards: [
      { num: "01", titulo: "Gestão integrada do SUS", texto: "Sistema integrado de gestão da saúde pública — planejamento, regulação, financiamento, regionalização, pactuação interfederativa e governança das redes assistenciais do SUS.", programaSigla: "SIGS" },
      { num: "02", titulo: "Atenção primária e redes de saúde", texto: "Fortalecimento da atenção primária como ordenadora do cuidado, qualificação das equipes de saúde da família e integração das redes de atenção em sistemas locais robustos e resolutivos.", programaSigla: "PROAPS+" },
      { num: "03", titulo: "Liderança e alta gestão em saúde pública", texto: "Formação executiva de dirigentes, secretários municipais e estaduais, diretores hospitalares e quadros estratégicos do SUS — articulando visão sistêmica, capacidade decisória e desempenho institucional.", programaSigla: "PROSUS+" },
    ] satisfies AreaCardItem[],
  },
  programas: {
    eyebrow: "Portfólio estratégico",
    tituloHtml: "Três programas estratégicos · <em>NTC Saúde</em>",
    intro:
      "Cada programa é uma solução estruturada em módulos, com identidade própria, coordenação científica e linha editorial específica. Pode ser contratado como trilha completa, módulos avulsos ou solução institucional sob medida para a realidade da rede de saúde.",
    cards: [
      { sigla: "SIGS", imagemSrc: `${IMG}/area-saude-premium2.1920.webp`, flagAberto: true, nome: "Sistema Integrado de Gestão da Saúde Pública · Planejamento, Regulação e Governança do SUS", tagline: "Gestão integrada do SUS — planejamento, regulação, financiamento e governança das redes assistenciais.", meta: "10 módulos · 80h" },
      { sigla: "PROAPS+", imagemSrc: `${IMG}/autoridade-saude.1920.webp`, flagAberto: true, nome: "Programa Avançado de Fortalecimento da Atenção Primária à Saúde e Redes Assistenciais", tagline: "Atenção primária como ordenadora do cuidado e integração das redes de atenção à saúde.", meta: "9 módulos · 72h" },
      { sigla: "PROSUS+", imagemSrc: `${IMG}/area-saude-premium2.1920.webp`, flagAberto: true, nome: "Programa Executivo de Liderança, Alta Gestão e Desenvolvimento Estratégico em Saúde Pública", tagline: "Formação executiva da alta liderança do SUS — visão sistêmica, capacidade decisória e desempenho institucional.", meta: "8 módulos · 64h" },
    ] satisfies ProgramaCardItem[],
    ctaPrimario: { rotulo: "Ver todos os 15 programas do Grupo NTC", href: "/" },
    ctaSecundario: { rotulo: "Solicitar proposta institucional", href: "#contato" },
  },
  autoridade: {
    tipo: "axis" as const,
    pillTexto: "Curadoria em estruturação",
    eyebrow: "Autoridade técnica",
    tituloHtml: "Curadoria técnica em <em>saúde pública e gestão do SUS</em>",
    intro:
      "A NTC Saúde está estruturando uma curadoria especializada para apoiar gestores, equipes técnicas e instituições públicas nos desafios de governança, atenção primária, redes assistenciais, planejamento, regulação e gestão integrada do Sistema Único de Saúde.",
    marker: "Eixos técnicos · Curadoria por área de atuação",
    cards: [
      { iconId: "doc", axisTag: "Eixo 01", titulo: "Governança e gestão do SUS", credencial: "Pactuação interfederativa, financiamento, regulação e governança das três esferas do Sistema Único de Saúde.", programa: "SIGS" },
      { iconId: "saude", axisTag: "Eixo 02", titulo: "Atenção primária à saúde", credencial: "Fortalecimento da APS como ordenadora do cuidado, qualificação das equipes de saúde da família e território.", programa: "PROAPS+" },
      { iconId: "rede", axisTag: "Eixo 03", titulo: "Redes assistenciais e regulação", credencial: "Integração das redes de atenção à saúde, regulação assistencial, centrais reguladoras e itinerários de cuidado.", programa: "SIGS · PROAPS+" },
      { iconId: "graf", axisTag: "Eixo 04", titulo: "Planejamento, financiamento e indicadores", credencial: "Planejamento estratégico em saúde pública, financiamento tripartite, indicadores institucionais e monitoramento de desempenho.", programa: "SIGS · PROSUS+" },
      { iconId: "pessoa", axisTag: "Eixo 05", titulo: "Liderança e gestão de equipes em saúde", credencial: "Formação de dirigentes, secretários, diretores hospitalares e quadros estratégicos do SUS — visão sistêmica e capacidade decisória.", programa: "PROSUS+" },
      { iconId: "escudo", axisTag: "Eixo 06", titulo: "Controle, compliance e qualidade na saúde pública", credencial: "Controle interno, auditoria do SUS, compliance assistencial, segurança do paciente e qualidade dos serviços de saúde pública.", programa: "SIGS · PROSUS+" },
    ] satisfies AxisCard[],
    counters: [
      { num: "6", label: "Eixos técnicos" },
      { num: "3", label: "Programas relacionados" },
      { num: "SUS", label: "Sistema de referência" },
      { num: "2026", label: "Curadoria em formação" },
    ] satisfies ExpertsCounter[],
    nota:
      "A curadoria técnica da NTC Saúde é atualizada de forma contínua, conforme a consolidação dos programas, temas prioritários e demandas institucionais vinculadas à gestão pública da saúde. Especialistas convidados integram a curadoria por eixo, conforme o escopo de cada órgão, rede ou instituição.",
    ctas: [
      { rotulo: "Solicitar proposta para formação em saúde pública", href: "#contato", variante: "gold" },
      { rotulo: "Receber atualizações da curadoria", href: "#contato", variante: "secondary-vert" },
    ] satisfies CtaItem[],
  },
  eventos: {
    eyebrow: "Capacitação · Inscrições abertas",
    tituloHtml: "Eventos abertos da <em>NTC Saúde</em>",
    intro:
      "Edições operacionais dos programas estratégicos da vertical com inscrições ativas — disponíveis para inscrição individual de profissionais e gestores, equipe técnica ou contratação institucional pelo órgão de saúde.",
    cards: [
      { imagemSrc: `${IMG}/area-saude-premium2.1920.webp`, data: { variante: "range", days: "05–07", monYr: "Jun · 2026" }, programLine: "Simpósio Presencial · NTC Saúde", titulo: "Liderança e Alta Gestão em Saúde Pública: agenda contemporânea do SUS", bindingSigla: "PROSUS+", metaCompleto: "Brasília · 20h · 3 dias <strong>R$ 2.890</strong>", cta: { rotulo: "Ver detalhes", href: "#" } },
      { imagemSrc: `${IMG}/autoridade-saude.1920.webp`, data: { variante: "range", days: "02–03", monYr: "Jul · 2026" }, programLine: "Seminário Online · NTC Saúde", titulo: "Atenção Primária como Ordenadora do Cuidado nas Redes de Saúde", bindingSigla: "PROAPS+", metaCompleto: "Online · 16h · 2 dias <strong>R$ 1.490</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
      { imagemSrc: `${IMG}/area-saude-premium2.1920.webp`, data: { variante: "single", day: "11", monYr: "Jun · 2026" }, programLine: "Curso Executivo · NTC Saúde", titulo: "Regulação, Pactuação Interfederativa e Governança das Redes do SUS", bindingSigla: "SIGS", metaCompleto: "Online · 8h · 1 dia <strong>R$ 990</strong>", cta: { rotulo: "Inscrever-se", href: "#contato" } },
    ] satisfies EventoCard[],
    ctaAgenda: { rotulo: "Ver agenda completa de Saúde", href: "/" },
  },
  solucoes: {
    eyebrow: "Contratação institucional",
    tituloHtml: "Soluções para <em>secretarias de saúde, hospitais e redes assistenciais</em>",
    intro:
      "Além dos eventos abertos e dos programas com inscrição individual, a NTC Saúde oferece soluções dedicadas a órgãos do SUS e instituições conveniadas — turmas fechadas in company, trilhas customizadas, soluções sob medida e atendimento institucional especializado para secretarias estaduais e municipais de saúde, hospitais públicos, fundações, consórcios intermunicipais e organizações sociais de saúde.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
    ] satisfies CtaItem[],
    items: [
      { titulo: "Turmas fechadas in company", texto: "Programa entregue exclusivamente à secretaria, hospital ou rede contratante, em formato presencial, online ou híbrido. Conteúdo customizável à realidade epidemiológica, à pactuação local e aos indicadores prioritários da rede." },
      { titulo: "Trilhas customizadas", texto: "Sequências formativas curadas combinando módulos de diferentes programas — desenhadas para uma necessidade específica da rede assistencial, do hospital ou da equipe técnica atendida." },
      { titulo: "Soluções sob medida", texto: "Customização profunda de ementas, módulos, cargas horárias e formato — para atender uma demanda institucional específica do SUS que não cabe nos programas standards, com aderência total às pactuações e à legislação sanitária aplicável." },
      { titulo: "Atendimento dedicado", texto: "Equipe comercial dedicada a órgãos do SUS — apoio à formalização da contratação pública (Lei 14.133/2021 e legislação correlata), elaboração de termo de referência, empenho, convênio e nota fiscal direta no CNPJ do órgão." },
    ] satisfies SolutionItem[],
  },
  conteudos: {
    eyebrow: "Produção editorial",
    tituloHtml: "Conteúdos da <em>NTC Saúde</em>",
    intro:
      "Análises, publicações e estudos da vertical sobre os desafios contemporâneos do Sistema Único de Saúde e da gestão da saúde pública brasileira.",
    cards: [
      { imagemSrc: `${IMG}/conteudo-01.1920.webp`, imagemAlt: "Análise editorial NTC Saúde", categoria: "Análise · NTC Saúde", titulo: "Gestão integrada do SUS pós-pandemia: leituras e caminhos institucionais", resumo: "Diagnóstico estruturado dos gargalos de gestão, regulação e financiamento que emergiram com a pandemia, e os caminhos institucionais para fortalecer a governança das redes assistenciais públicas brasileiras.", meta1: "Tempo de leitura", meta2: "Próxima publicação", featured: true },
      { imagemSrc: `${IMG}/conteudo-02.1920.webp`, imagemAlt: "Insight editorial", categoria: "Insight · NTC Saúde", titulo: "Atenção primária resolutiva: a porta de entrada que ordena o cuidado", resumo: "Caminhos institucionais para fortalecer a atenção primária como ordenadora das redes de atenção à saúde.", meta1: "Análise", meta2: "Em curadoria" },
      { imagemSrc: `${IMG}/conteudo-03.1920.webp`, imagemAlt: "Publicação editorial", categoria: "Publicação · NTC Saúde", titulo: "Liderança em saúde pública: agenda 2026 para o SUS", resumo: "Estudo sobre formação executiva da alta gestão do SUS e desempenho institucional das secretarias.", meta1: "Estudo técnico", meta2: "Em desenvolvimento" },
    ] satisfies ContentCard[],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "FAQ · NTC Saúde",
    items: [
      { pergunta: "Como uma secretaria de saúde ou hospital público contrata a NTC Saúde?", resposta: "Para órgãos do SUS e instituições conveniadas (secretarias estaduais e municipais de saúde, hospitais públicos, fundações, consórcios intermunicipais, organizações sociais de saúde, autarquias e empresas estatais do setor), oferecemos contratação institucional dedicada com nota fiscal direta no CNPJ do órgão. Atuamos por inexigibilidade, dispensa, convênio ou licitação conforme a hipótese aplicável da Lei 14.133/2021 e legislação correlata. A equipe comercial NTC apoia o trâmite. Solicite proposta institucional pelo botão lateral." },
      { pergunta: "Posso contratar apenas um programa, ou preciso adquirir o portfólio completo?", resposta: "Os três programas são independentes e podem ser contratados separadamente. Cada programa tem sua própria arquitetura modular flexível — pode-se contratar a trilha completa, módulos avulsos ou solução sob medida que combine elementos do SIGS, PROAPS+ e PROSUS+ conforme a necessidade da rede de saúde." },
      { pergunta: "Quais modalidades de entrega estão disponíveis?", resposta: "Os programas são entregues em modalidades online (via plataforma EventOn NTC), presencial (em capitais estratégicas), híbrida (combinando ambos), in company (na sede do órgão ou da instituição de saúde contratante) ou sob medida. A escolha depende do programa, do volume de profissionais atendidos e da realidade operacional da rede." },
      { pergunta: "Como funciona a customização de programas para minha rede de saúde?", resposta: "A customização é feita em duas camadas: ajustes editoriais (linguagem, casos aplicados, perfil epidemiológico local, ênfases temáticas) e ajustes estruturais (cargas horárias, sequência modular, formato). A coordenação científica da NTC Saúde faz a curadoria técnica para garantir que a customização preserve a aderência ao SUS e a integridade técnica e ética do programa." },
      { pergunta: "A NTC Saúde atende municípios pequenos e regiões de saúde com menor estrutura?", resposta: "Sim. A vertical atende redes e instituições de todos os portes — estados, capitais, municípios médios e pequenos, hospitais regionais e unidades de atenção primária. Para municípios pequenos, frequentemente articulamos consórcios intermunicipais de saúde ou modalidades online com escala regional para reduzir o custo institucional preservando a qualidade técnica da formação. Solicite proposta para a realidade da sua rede." },
      { pergunta: "Os profissionais e gestores recebem certificado?", resposta: "Sim. Cada módulo e cada programa entregam certificação institucional emitida pelo Instituto NTC do Brasil, validável publicamente via código QR e adequada à comprovação de capacitação para fins de progressão funcional, ocupação de cargos de direção, comissões técnicas, conselhos e exigências da legislação aplicável. Para a trilha completa de um programa, é emitida certificação consolidada após a conclusão de todos os módulos." },
    ] satisfies FaqItem[],
  },
  ctaFinal: {
    eyebrow: "Próximo passo",
    tituloHtml: "Leve a <em>NTC Saúde</em> para sua secretaria, hospital ou rede assistencial.",
    sub: "Solicite proposta institucional para os programas estratégicos da vertical · trilhas completas, módulos avulsos, in company ou solução sob medida — com aderência ao SUS, à pactuação local e à realidade epidemiológica da sua rede.",
    ctas: [
      { rotulo: "Solicitar proposta institucional", href: "#contato", variante: "gold" },
      { rotulo: "Baixar portfólio da vertical", href: "#", variante: "ghost-light" },
      { rotulo: "Ver eventos abertos", href: "#eventos-sau", variante: "ghost-light" },
    ] satisfies CtaItem[],
  },
};

// =============================================================
// Exporta o mapa chaveado por slug
// =============================================================

export type FallbackVertical = typeof EDUCACAO | typeof GESTAO_PUBLICA | typeof SAUDE;

export const FALLBACK_VERTICAIS: Record<VerticalSlug, FallbackVertical> = {
  educacao: EDUCACAO,
  "gestao-publica": GESTAO_PUBLICA,
  saude: SAUDE,
};
