// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /CONTEUDOS
//  Porta de 28_Pagina_Conteudos_v1.html (linhas 1551-2295 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs -----------------

export type VerticalConteudo = "edu" | "gov" | "sau" | "trans";

export type TipoConteudo = "artigo" | "estudo" | "nota" | "webinar" | "material";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  classe?: string;
  arrow?: boolean;
}

// ----------------- HERO -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export const HERO_CONTEUDOS = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Conteúdos institucionais", current: true },
  ] as CrumbItem[],
  eyebrow: "Biblioteca editorial · 2026",
  tituloHtml:
    'A inteligência <span class="accent">institucional</span><br>do Grupo NTC, em circulação.',
  sub:
    "Artigos, estudos, notas técnicas, webinars e materiais didáticos produzidos pela curadoria científica das três verticais NTC — para servidores, dirigentes, juristas, pesquisadores e equipes técnicas da administração pública brasileira.",
  quicklinks: [
    { texto: "Destaques", href: "#destaques", cmsLink: "quicklink-destaques", track: "hero_quicklink" },
    { texto: "Biblioteca", href: "#biblioteca", cmsLink: "quicklink-biblioteca", track: "hero_quicklink" },
    { texto: "Tipos", href: "#tipos", cmsLink: "quicklink-tipos", track: "hero_quicklink" },
    { texto: "Verticais", href: "#verticais", cmsLink: "quicklink-verticais", track: "hero_quicklink" },
    { texto: "Newsletter", href: "#newsletter", cmsLink: "quicklink-newsletter", track: "hero_quicklink" },
  ] as LinkInterno[],
};

// ----------------- MÉTRICAS EDITORIAIS (5) -----------------

export interface MetricaConteudo {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}

export const METRICAS_CONTEUDO: MetricaConteudo[] = [
  {
    num: "Editorial",
    numClasseExtra: "cm-num--word",
    lbl: "Produção editorial",
    detail: "Acervo institucional acumulado pelo Instituto NTC do Brasil",
  },
  {
    num: "Em expansão",
    numClasseExtra: "cm-num--word",
    lbl: "Acervo em expansão",
    detail:
      "Artigos, estudos, notas técnicas, webinars e materiais editoriais",
  },
  {
    num: "Replays",
    numClasseExtra: "cm-num--word",
    lbl: "Webinars e replays",
    detail: "Conteúdos audiovisuais disponíveis conforme política editorial",
  },
  {
    num: "3",
    lbl: "Verticais editoriais",
    detail: "Educação · Gestão Pública · Saúde · temas transversais",
  },
  {
    num: "Progressivo",
    numClasseExtra: "cm-num--word",
    lbl: "Acesso progressivo",
    detail:
      "Parte do acervo aberta ao público, com materiais exclusivos via EventOn",
  },
];

// ----------------- SUBNAV -----------------

export interface SubnavLink {
  texto: string;
  href: string;
  cmsLink: string;
}

export const SUBNAV_LABEL = "Nesta página";

export const SUBNAV_LINKS: SubnavLink[] = [
  { texto: "Destaques", href: "#destaques", cmsLink: "subnav-destaques" },
  { texto: "Biblioteca", href: "#biblioteca", cmsLink: "subnav-biblioteca" },
  { texto: "Tipos editoriais", href: "#tipos", cmsLink: "subnav-tipos" },
  { texto: "Verticais", href: "#verticais", cmsLink: "subnav-verticais" },
  { texto: "Newsletter", href: "#newsletter", cmsLink: "subnav-newsletter" },
  { texto: "FAQ", href: "#faq", cmsLink: "subnav-faq" },
];

// ----------------- MANIFESTO EDITORIAL -----------------

export const MANIFESTO_CONTEUDOS = {
  eyebrow: "Por que publicamos",
  tituloHtml: "Não é blog. É <em>publicação institucional</em>.",
  lede:
    "A NTC publica conteúdos não como ação promocional isolada, mas como extensão de sua curadoria científica: leituras técnicas confiáveis, produzidas com rigor editorial e orientadas aos desafios concretos da administração pública brasileira.",
  paragrafo:
    "Cada conteúdo é atribuído a uma frente editorial do Instituto — Curadoria, Direção Científica ou Equipes Técnicas das verticais — e passa por revisão técnica antes da publicação. Webinars geram materiais derivados. Estudos viram notas técnicas. Notas técnicas viram artigos. É um ecossistema editorial vivo, atravessado pelos mesmos critérios que orientam os programas formativos.",
  marker: "Biblioteca editorial NTC · 2026",
};

// ----------------- TESE EDITORIAL (3 pilares) -----------------

export interface PilarTese {
  num: string;
  titulo: string;
  descricao: string;
  rule: string;
}

export const TESE_HEAD = {
  eyebrow: "Como produzimos",
  tituloHtml: "Inteligência institucional <em>em circulação</em>.",
  descricao:
    "O conteúdo NTC nasce do mesmo lugar dos programas: pesquisa aplicada, posição técnica fundamentada e formação continuada. É a inteligência técnica da NTC traduzida em texto, áudio e vídeo.",
};

export const TESE_PILARES: PilarTese[] = [
  {
    num: "I",
    titulo: "Pesquisa aplicada",
    descricao:
      "Estudos com leitura empírica da administração pública brasileira — políticas, redes, sistemas e indicadores — não exercícios acadêmicos desconectados do real.",
    rule: "Estudos · notas técnicas · diagnósticos",
  },
  {
    num: "II",
    titulo: "Posição técnica",
    descricao:
      "Artigos e notas autorais que tomam posição sobre temas em discussão — Lei 14.133/2021, financiamento da APS, alfabetização baseada em evidências, IA e setor público — com fundamentação jurídica e técnica clara.",
    rule: "Artigos · notas autorais · pareceres editoriais",
  },
  {
    num: "III",
    titulo: "Formação continuada",
    descricao:
      "Webinars abertos, materiais didáticos e guias práticos — derivados dos programas estratégicos — para servidores e equipes que precisam aplicar a teoria ao cotidiano da gestão pública.",
    rule: "Webinars · guias · kits didáticos",
  },
];

// ----------------- 3 DESTAQUES EDITORIAIS -----------------

export interface CardDestaque {
  vert: VerticalConteudo;
  imagemUrl: string;
  tipoTag: string;
  prep: string;
  eyebrow: string;
  titulo: string;
  descricao: string;
  meta: [string, string, string];
  soonTag: { texto: string; cmsLink: string };
}

export const DESTAQUES_HEAD = {
  eyebrow: "Destaques editoriais",
  tituloHtml: "Próximas publicações editoriais <em>em preparação</em>.",
  intro:
    "Uma prévia da linha editorial que está sendo finalizada pela curadoria NTC para os próximos meses — um estudo, um artigo e um webinar, escolhidos pela aderência ao momento institucional brasileiro. Avisaremos pelo Boletim NTC quando cada publicação estiver disponível.",
};

export const DESTAQUES: CardDestaque[] = [
  {
    vert: "gov",
    imagemUrl: "/img/fotos/_optimized/conteudo-01.1920.webp",
    tipoTag: "Estudo",
    prep: "Em preparação editorial",
    eyebrow: "NTC Gestão Pública · Contratações",
    titulo:
      "Cinco anos de Lei 14.133: o que mudou, o que não mudou e o que segue em disputa nas redes.",
    descricao:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações no cotidiano dos órgãos públicos, com diagnóstico do que efetivamente se transformou na prática administrativa, dos riscos que persistem e das frentes em disputa interpretativa entre TCU, AGU e tribunais.",
    meta: ["Previsto · 2026", "Estudo · formato longo", "Curadoria NTC Gestão Pública"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-estudo-14133" },
  },
  {
    vert: "edu",
    imagemUrl: "/img/fotos/_optimized/conteudo-02.1920.webp",
    tipoTag: "Artigo",
    prep: "Em preparação editorial",
    eyebrow: "NTC Educação · Alfabetização",
    titulo:
      "Recomposição da aprendizagem nos anos iniciais: o que os dados da rede pública estão dizendo.",
    descricao:
      "Artigo editorial sobre o estado atual da alfabetização na idade certa no Brasil pós-pandemia, com leitura crítica dos resultados das principais avaliações e proposições técnicas para gestores municipais e estaduais que estão organizando seus planos de recomposição.",
    meta: ["Previsto · 2026", "Artigo editorial", "Direção Científica NTC"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-artigo-alfabetizacao" },
  },
  {
    vert: "sau",
    imagemUrl: "/img/fotos/_optimized/conteudo-03.1920.webp",
    tipoTag: "Webinar",
    prep: "Em preparação editorial",
    eyebrow: "NTC Saúde · Atenção Primária",
    titulo:
      "Previne Brasil 2026: o financiamento da APS e o que muda para os municípios.",
    descricao:
      "Webinar executivo sobre a arquitetura atual do financiamento da Atenção Primária à Saúde no Brasil, os efeitos das mudanças recentes do programa Previne Brasil sobre a operação das equipes de Saúde da Família e os caminhos de planejamento para a gestão municipal.",
    meta: ["Previsto · 2026", "Webinar executivo", "Equipe Técnica NTC Saúde"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-webinar-previne" },
  },
];

// ----------------- BIBLIOTECA (9 cards filtráveis) -----------------

export interface OpcaoTab {
  value: "all" | VerticalConteudo;
  label: string;
}

export interface OpcaoTipo {
  value: "all" | TipoConteudo;
  label: string;
}

export interface CardBiblioteca {
  vert: VerticalConteudo;
  tipo: TipoConteudo;
  search: string;
  verticalLabel: string;
  tipoLabel: string;
  prep: string;
  titulo: string;
  descricao: string;
  meta: [string, string];
  authorPrefix: string;
  authorBold: string;
  linkSoon: { texto: string; cmsLink: string };
}

export const BIBLIOTECA_HEAD = {
  eyebrow: "Biblioteca editorial",
  tituloHtml: "O acervo editorial <em>filtrável</em> do Grupo NTC.",
  intro:
    "Use a busca e os filtros para encontrar conteúdos por palavra-chave, vertical formativa ou tipo editorial. A biblioteca apresenta a linha editorial em construção pela curadoria — cada conteúdo será disponibilizado a partir do momento em que estiver finalizado.",
  note:
    "Acervo em construção · conteúdos sendo finalizados pela curadoria editorial",
};

export const TABS_VERTICAL: OpcaoTab[] = [
  { value: "all", label: "Todos" },
  { value: "edu", label: "Educação" },
  { value: "gov", label: "Gestão Pública" },
  { value: "sau", label: "Saúde" },
  { value: "trans", label: "Transversais" },
];

export const FILTROS_TIPO: OpcaoTipo[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "estudo", label: "Estudos" },
  { value: "artigo", label: "Artigos" },
  { value: "nota", label: "Notas técnicas" },
  { value: "webinar", label: "Webinars" },
  { value: "material", label: "Materiais" },
];

export const BIBLIOTECA_SEARCH_PLACEHOLDER =
  "Buscar por título, tema ou palavra-chave...";

export const CARDS_BIBLIOTECA: CardBiblioteca[] = [
  {
    vert: "gov",
    tipo: "estudo",
    search: "14133 contratacoes lei licitacoes governo",
    verticalLabel: "NTC Gestão Pública",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo: "Cinco anos de Lei 14.133: o que mudou nas redes.",
    descricao:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações nos órgãos públicos brasileiros, com diagnóstico, riscos e frentes em disputa.",
    meta: ["Previsto · 2026", "Formato longo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Gestão Pública",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-14133" },
  },
  {
    vert: "edu",
    tipo: "artigo",
    search: "alfabetizacao educacao recomposicao pear",
    verticalLabel: "NTC Educação",
    tipoLabel: "Artigo",
    prep: "Em preparação editorial",
    titulo: "Recomposição da aprendizagem: o que os dados estão dizendo.",
    descricao:
      "Leitura crítica dos resultados de avaliações nacionais e proposições técnicas para redes que estão organizando seus planos de recomposição.",
    meta: ["Previsto · 2026", "Artigo editorial"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-artigo-alfabetizacao" },
  },
  {
    vert: "sau",
    tipo: "webinar",
    search: "previne brasil aps atencao primaria financiamento sus",
    verticalLabel: "NTC Saúde",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo: "Previne Brasil 2026: financiamento da APS e o que muda.",
    descricao:
      "Webinar executivo sobre a arquitetura atual do financiamento da APS e os caminhos de planejamento municipal.",
    meta: ["Previsto · 2026", "Webinar executivo"],
    authorPrefix: "Equipe",
    authorBold: "NTC Saúde",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-previne" },
  },
  {
    vert: "trans",
    tipo: "nota",
    search: "ia inteligencia artificial dados governanca digital",
    verticalLabel: "Transversal",
    tipoLabel: "Nota técnica",
    prep: "Em preparação editorial",
    titulo: "IA generativa no setor público: limites e oportunidades.",
    descricao:
      "Nota técnica sobre o estado atual da incorporação de inteligência artificial generativa pelos órgãos da administração pública brasileira, com leitura crítica de riscos.",
    meta: ["Previsto · 2026", "Nota técnica"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-nota-ia" },
  },
  {
    vert: "edu",
    tipo: "estudo",
    search: "educacao integral pei tempo integral",
    verticalLabel: "NTC Educação",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo:
      "Educação integral em escala: leitura institucional da Lei 14.640/2023.",
    descricao:
      "Estudo sobre a implementação da política de educação em tempo integral nas redes públicas brasileiras após a sanção da Lei 14.640/2023.",
    meta: ["Previsto · 2026", "Estudo longo"],
    authorPrefix: "Equipe",
    authorBold: "NTC Educação",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-pei" },
  },
  {
    vert: "gov",
    tipo: "webinar",
    search: "lidera direcao estrategica governo gestao publica",
    verticalLabel: "NTC Gestão Pública",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo: "A direção estratégica na administração pública contemporânea.",
    descricao:
      "Webinar executivo sobre direção institucional, articulação federativa e leitura de cenário para dirigentes da administração pública brasileira.",
    meta: ["Previsto · 2026", "Webinar executivo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Gestão Pública",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-lidera" },
  },
  {
    vert: "sau",
    tipo: "estudo",
    search: "prosus alta gestao sus diretor estadual municipal",
    verticalLabel: "NTC Saúde",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo: "Direção institucional em saúde pública: o estado da arte.",
    descricao:
      "Estudo sobre o desenho da direção institucional do SUS no Brasil — competências, governança, articulação federativa e gargalos de capacidade técnica.",
    meta: ["Previsto · 2026", "Estudo longo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Saúde",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-prosus" },
  },
  {
    vert: "trans",
    tipo: "webinar",
    search: "dados governanca lgpd transversal politicas publicas",
    verticalLabel: "Transversal",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo:
      "Governança de dados no setor público: LGPD e a operação cotidiana.",
    descricao:
      "Webinar transversal sobre a aplicação da LGPD na rotina das três áreas — Educação, Gestão Pública e Saúde — com foco em dilemas concretos da operação.",
    meta: ["Previsto · 2026", "Webinar transversal"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-lgpd" },
  },
  {
    vert: "edu",
    tipo: "material",
    search: "primeira infancia pinei educacao infantil creche bncc",
    verticalLabel: "NTC Educação",
    tipoLabel: "Material didático",
    prep: "Em preparação editorial",
    titulo:
      "Primeira infância e educação infantil: kit de planejamento de rede.",
    descricao:
      "Material didático para gestores municipais — fluxos, indicadores, modelos e referências para o planejamento da política de creches e pré-escolas.",
    meta: ["Previsto · 2026", "Kit institucional"],
    authorPrefix: "Equipe",
    authorBold: "NTC Educação",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-material-pinei" },
  },
];

export const BIBLIOTECA_EMPTY =
  "Nenhum conteúdo encontrado com os filtros atuais. Limpe a busca ou troque a aba para ampliar a seleção.";

export const BIBLIOTECA_FOOTER = {
  nota:
    "Cadastre-se no Boletim NTC para ser avisado quando cada conteúdo for publicado",
  cta: {
    texto: "Receber por e-mail quando publicarmos",
    href: "#newsletter",
    cmsLink: "cta-newsletter",
    track: "cont_cta_newsletter",
    arrow: true,
    classe: "btn btn--primary",
  } as LinkInterno,
};

// ----------------- 5 TIPOS EDITORIAIS -----------------

export interface TipoEditorial {
  num: string;
  titulo: string;
  descricao: string;
  tag: string;
}

export const TIPOS_HEAD = {
  eyebrow: "Tipos editoriais institucionais",
  tituloHtml: "Cinco formatos para <em>cada momento</em> da operação pública.",
  intro:
    "A biblioteca NTC se organiza em cinco formatos editoriais complementares. Cada um responde a um tipo distinto de pergunta institucional — do diagnóstico estruturado ao apoio operacional cotidiano.",
};

export const TIPOS_EDITORIAIS: TipoEditorial[] = [
  {
    num: "01",
    titulo: "Artigos",
    descricao:
      "Posições técnicas autorais sobre temas em discussão. Texto editorial fundamentado, leitura média de 12 a 25 minutos, autoria institucional.",
    tag: "Posição · análise · leitura",
  },
  {
    num: "02",
    titulo: "Estudos",
    descricao:
      "Pesquisas longas com leitura empírica da administração pública — diagnósticos de campo, séries históricas, leitura de indicadores. PDF de 30 a 80 páginas.",
    tag: "Diagnóstico · pesquisa · profundidade",
  },
  {
    num: "03",
    titulo: "Notas técnicas",
    descricao:
      "Pareceres editoriais curtos sobre temas pontuais — uma decisão de tribunal, uma alteração legal, um novo programa federal. Foco em utilidade decisória.",
    tag: "Parecer · decisório · objetividade",
  },
  {
    num: "04",
    titulo: "Webinars",
    descricao:
      "Encontros formativos abertos, com transmissão pelo EventOn, materiais editoriais sincronizados e replay disponível para os inscritos pelos prazos previstos.",
    tag: "Ao vivo · replay · formação",
  },
  {
    num: "05",
    titulo: "Materiais didáticos",
    descricao:
      "Kits operacionais — checklists, fluxos, modelos e roteiros — para apoiar a aplicação cotidiana de políticas, normas e procedimentos pela equipe técnica.",
    tag: "Operacional · prático · download",
  },
];

// ----------------- CURADORIA POR VERTICAL (3) -----------------

export interface VertCard {
  vert: "edu" | "gov" | "sau";
  bandMark: string;
  bandNum: string;
  titulo: string;
  descricao: string;
  listaHtml: string[];
  link: LinkInterno;
}

export const VERTICAIS_HEAD = {
  eyebrow: "Curadoria editorial por vertical",
  tituloHtml: "Três trilhas editoriais, <em>uma só doutrina</em>.",
  intro:
    "Cada vertical formativa do Grupo NTC opera também como linha editorial — com equipe técnica dedicada à produção de conteúdo, calendário próprio de publicação e diálogo direto com os programas estratégicos.",
};

export const VERT_CARDS: VertCard[] = [
  {
    vert: "edu",
    bandMark: "NTC Educação",
    bandNum: "01",
    titulo: "Educação pública em circulação",
    descricao:
      "Acervo dedicado à formação institucional de redes de ensino — alfabetização, gestão escolar, inclusão, educação integral, educação digital e primeira infância.",
    listaHtml: [
      "<strong>3</strong> conteúdos em preparação editorial",
      "<strong>9</strong> programas estratégicos relacionados",
      "<strong>Equipe Técnica NTC Educação</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "cont_vert_click",
    },
  },
  {
    vert: "gov",
    bandMark: "NTC Gestão Pública",
    bandNum: "02",
    titulo: "Direção e governança em pauta",
    descricao:
      "Acervo dedicado à alta gestão da administração pública brasileira — Lei 14.133/2021, direção estratégica, governança institucional e sistemas administrativos.",
    listaHtml: [
      "<strong>2</strong> conteúdos em preparação editorial",
      "<strong>3</strong> programas estratégicos relacionados",
      "<strong>Curadoria NTC Gestão Pública</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "cont_vert_click",
    },
  },
  {
    vert: "sau",
    bandMark: "NTC Saúde",
    bandNum: "03",
    titulo: "Inteligência institucional para o SUS",
    descricao:
      "Acervo dedicado ao Sistema Único de Saúde — atenção primária resolutiva, redes territoriais, gestão integrada e direção institucional da saúde pública.",
    listaHtml: [
      "<strong>2</strong> conteúdos em preparação editorial",
      "<strong>3</strong> programas estratégicos relacionados",
      "<strong>Equipe Técnica NTC Saúde</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "cont_vert_click",
    },
  },
];

// ----------------- NEWSLETTER -----------------

export const NEWSLETTER_TEXT = {
  eyebrow: "Boletim NTC",
  tituloHtml:
    "Receba a inteligência <em>editorial</em> da NTC<br>direto na sua caixa.",
  paragrafosHtml: [
    "O <strong>Boletim NTC</strong> é a curadoria mensal da Direção Científica do Instituto — uma seleção comentada dos conteúdos mais relevantes do período, organizada por vertical formativa. Sem rastreio de comportamento, sem ofertas comerciais, sem ruído.",
    "Você escolhe se quer receber tudo ou apenas a vertical que interessa ao seu cenário institucional — e pode descadastrar a qualquer momento pelo link no rodapé de cada edição.",
  ],
  pills: [
    "Curadoria mensal",
    "Sem rastreio",
    "Por vertical",
    "Descadastro livre",
  ],
};

export const NEWSLETTER_FORM = {
  labels: {
    nome: "Nome completo",
    email: "E-mail institucional",
    vertical: "Vertical de interesse",
    orgao: "Órgão ou instituição",
  },
  placeholders: {
    nome: "Como prefere ser chamado(a)",
    email: "nome@orgao.gov.br",
    orgao: "Município, estado, autarquia...",
  },
  verticais: [
    { value: "todas", label: "Todas as verticais" },
    { value: "educacao", label: "NTC Educação" },
    { value: "gestao", label: "NTC Gestão Pública" },
    { value: "saude", label: "NTC Saúde" },
    { value: "transversal", label: "Apenas transversais" },
  ],
  consentHtml:
    'Concordo em receber o Boletim NTC e autorizo o tratamento dos meus dados para essa finalidade, nos termos da <a href="/lgpd" data-cms-link="legal-lgpd">Política de Privacidade · LGPD</a> do Instituto NTC do Brasil. Posso descadastrar a qualquer momento.',
  botaoTexto: "Assinar o Boletim NTC",
  msgOk:
    "Inscrição realizada. Confirme no e-mail que enviaremos a seguir.",
  msgErr: "Verifique os campos obrigatórios.",
};

// ----------------- FAQ (8 itens) -----------------

export interface ItemFaq {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export const FAQ_HEAD = {
  eyebrow: "Perguntas frequentes",
  tituloHtml: "O que <em>perguntam</em> sobre os Conteúdos NTC.",
  intro:
    "Reunimos oito perguntas frequentes sobre o acervo editorial — política de acesso, licenciamento, certificação, replays, contribuições externas e privacidade.",
};

export const FAQ_CONTEUDOS: ItemFaq[] = [
  {
    id: "cont-faq-1",
    pergunta: "Os conteúdos são abertos ao público?",
    respostaHtml:
      '<p>Sim. Parte do acervo editorial do Grupo NTC — artigos, notas técnicas, estudos e materiais didáticos — será disponibilizada ao público sem login obrigatório, conforme a política editorial de publicação.</p><p>Webinars com replay e alguns materiais didáticos exclusivos podem exigir cadastro no <a href="/o-grupo#eventon" data-cms-link="eventon-home">EventOn</a> — sem cobrança e apenas para identificação do servidor, em coerência com a Área do Participante.</p>',
  },
  {
    id: "cont-faq-2",
    pergunta: "Posso citar os conteúdos NTC em meus trabalhos?",
    respostaHtml:
      '<p>Sim, e ficamos honrados quando isso acontece. Os conteúdos podem ser citados com atribuição à frente editorial responsável (Curadoria, Direção Científica ou Equipe Técnica da vertical correspondente), título completo, ano de publicação e URL.</p><p>A reprodução integral, adaptação, incorporação em materiais comerciais ou uso institucional em larga escala depende de autorização prévia do Instituto NTC do Brasil. Para esses casos, entre em contato pelo <a href="/contato" data-cms-link="atendimento-licenciamento">canal de atendimento institucional</a>.</p>',
  },
  {
    id: "cont-faq-3",
    pergunta: "Webinars geram certificado?",
    respostaHtml:
      '<p>Webinars abertos publicados na biblioteca, em formato editorial, não geram certificado de horas — são publicação institucional de acesso livre.</p><p>Já os <strong>eventos abertos da Agenda</strong> (turmas regulares com data, ementa e inscrição) geram certificado oficial NTC pela plataforma EventOn. Veja a <a href="/agenda" data-cms-link="agenda-completa">Agenda Geral</a> para os eventos certificáveis.</p>',
  },
  {
    id: "cont-faq-4",
    pergunta: "Os replays ficam disponíveis para sempre?",
    respostaHtml:
      "<p>Os replays de webinars abertos publicados na biblioteca ficam disponíveis pelo período declarado em cada card — geralmente entre 6 e 24 meses após a transmissão original.</p><p>Conteúdos retirados de circulação por desatualização técnica ou jurídica permanecem catalogados internamente, mas deixam de estar acessíveis publicamente para evitar a circulação de informação obsoleta na administração pública.</p>",
  },
  {
    id: "cont-faq-5",
    pergunta: "Quem escreve os conteúdos? Por que autoria institucional?",
    respostaHtml:
      "<p>Os conteúdos são produzidos por três frentes editoriais do Instituto NTC do Brasil: a <strong>Curadoria</strong> (linha editorial geral e Gestão Pública), a <strong>Direção Científica</strong> (transversal e temas estratégicos) e as <strong>Equipes Técnicas</strong> das três verticais (Educação, Gestão Pública e Saúde).</p><p>A autoria institucional é uma escolha editorial: cada conteúdo passa por revisão técnica coletiva antes de ser publicado e expressa a posição da frente editorial, não a opinião individual de quem o redigiu. Quando há contribuição autoral de um especialista externo, a co-autoria é declarada no início do texto.</p>",
  },
  {
    id: "cont-faq-6",
    pergunta: "É possível propor um tema para a biblioteca?",
    respostaHtml:
      '<p>Sim. Servidores, dirigentes, pesquisadores e equipes técnicas das três áreas podem propor temas pelo <a href="/contato" data-cms-link="atendimento-editorial">canal de atendimento institucional</a>, indicando o tipo desejado (artigo, estudo, nota técnica ou webinar) e o problema institucional concreto que motiva a sugestão.</p><p>A curadoria editorial avalia a proposta e responde se entra ou não no planejamento editorial — sempre com explicação técnica, mesmo nos casos negativos.</p>',
  },
  {
    id: "cont-faq-7",
    pergunta: "Os conteúdos têm versão em outros idiomas?",
    respostaHtml:
      "<p>A biblioteca NTC publica em português brasileiro. Alguns estudos transversais relevantes ao debate latino-americano podem ser publicados também em espanhol — sempre indicado no card do conteúdo.</p><p>Não traduzimos por demanda automática para outras línguas. Em contratações institucionais dedicadas, pode haver versão localizada conforme o público da formação.</p>",
  },
  {
    id: "cont-faq-8",
    pergunta: "A NTC respeita a LGPD nos cadastros da biblioteca?",
    respostaHtml:
      '<p>Sim. O Instituto NTC do Brasil é controlador dos dados pessoais coletados pelo Boletim NTC e pelos cadastros do EventOn, sob a Lei 13.709/2018 (LGPD). Os dados são tratados exclusivamente para a finalidade da comunicação editorial e do acesso aos conteúdos, e não são compartilhados com terceiros para fins comerciais.</p><p>Você pode solicitar acesso, retificação ou exclusão dos seus dados a qualquer momento pelo encarregado de dados (DPO) indicado na <a href="/lgpd" data-cms-link="legal-lgpd">Política de Privacidade · LGPD</a>.</p>',
  },
];

// ----------------- CTA FINAL (3 pontes) -----------------

export interface PonteCta {
  ponte: "agenda" | "solucoes" | "docentes";
  eyebrow: string;
  titulo: string;
  descricao: string;
  link: LinkInterno;
}

export const CTA_FINAL_HEAD = {
  eyebrow: "Próximo passo",
  tituloHtml: "Depois da leitura, vem o <em>encontro</em>.",
  intro:
    "Os Conteúdos são a entrada editorial do Grupo NTC — a partir deles, você pode aprofundar pela Agenda formativa, contratar uma formação institucional dedicada ou conhecer quem efetivamente assina a curadoria.",
};

export const CTA_FINAL_PONTES: PonteCta[] = [
  {
    ponte: "agenda",
    eyebrow: "Agenda formativa",
    titulo: "Ir para os eventos abertos",
    descricao:
      "Inscrição em turmas regulares — online, híbridas e presenciais — com certificado oficial NTC e replay no EventOn.",
    link: {
      texto: "Ver Agenda Geral",
      href: "/agenda",
      cmsLink: "agenda-completa",
      track: "cont_cta_agenda",
    },
  },
  {
    ponte: "solucoes",
    eyebrow: "Contratação institucional",
    titulo: "Conhecer Soluções dedicadas",
    descricao:
      "In company, turmas fechadas, sob medida e trilhas — para órgãos que precisam de formação institucional dedicada.",
    link: {
      texto: "Ir para Soluções",
      href: "/solucoes",
      cmsLink: "pagina-solucoes",
      track: "cont_cta_solucoes",
    },
  },
  {
    ponte: "docentes",
    eyebrow: "Curadoria científica",
    titulo: "Conhecer o corpo docente",
    descricao:
      "Especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional articulados pela curadoria NTC.",
    link: {
      texto: "Conhecer o corpo docente",
      href: "/o-grupo/corpo-docente",
      cmsLink: "pagina-corpo-docente",
      track: "cont_cta_docentes",
    },
  },
];

// ----------------- STICKY CTA MOBILE -----------------

export const STICKY_CTA_CONTEUDOS = {
  cta: {
    texto: "Assinar Boletim NTC",
    href: "#newsletter",
    cmsLink: "cta-newsletter-sticky",
    track: "cont_sticky_cta",
    arrow: true,
    classe: "btn btn--gold",
  } as LinkInterno,
};
