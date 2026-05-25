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
