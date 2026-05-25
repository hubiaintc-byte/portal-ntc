// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /CAPACITACAO
//  Porta de 27_Pagina_Capacitacao_v1.html (linhas 1619-2403 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs / Discriminantes -----------------

export type VerticalCapacitacao = "edu" | "gov" | "sau";
export type TipoVsBlock = "cap" | "sol";
export type CaminhoTipo = "participante" | "instituicao";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  classe?: string;
  arrow?: boolean;
}

// ----------------- Interfaces das seções -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export interface MetricaCap {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}

export interface SubnavLink {
  texto: string;
  href: string;
  cmsLink: string;
}

export interface PilarCap {
  num: string;
  titulo: string;
  descricao: string;
  rule: string;
}

// ----------------- HERO -----------------

export const heroCrumbs: CrumbItem[] = [
  { texto: "Grupo NTC", href: "/" },
  { texto: "Capacitação institucional", current: true },
];

export const heroEyebrow = "Ecossistema formativo · 2026";

export const heroH1 = `Capacitação institucional <span class="accent">de alto nível</span><br>para a administração pública brasileira.`;

export const heroSub =
  "O Grupo NTC estrutura programas, eventos e jornadas formativas para órgãos públicos, redes de ensino, sistemas de saúde e equipes de gestão — combinando curadoria científica, excelência docente, tecnologia própria e segurança institucional em cada entrega.";

export const heroQuicklinks: LinkInterno[] = [
  { texto: "Verticais", href: "#verticais", track: "hero_quicklink", cmsLink: "quicklink-verticais" },
  { texto: "Modalidades", href: "#modalidades", track: "hero_quicklink", cmsLink: "quicklink-modalidades" },
  { texto: "Formatos", href: "#formatos", track: "hero_quicklink", cmsLink: "quicklink-formatos" },
  { texto: "Curadoria", href: "#curadoria", track: "hero_quicklink", cmsLink: "quicklink-curadoria" },
  { texto: "Agenda", href: "#proximos", track: "hero_quicklink", cmsLink: "quicklink-agenda" },
];

// ----------------- MÉTRICAS (5) -----------------

export const metricasCapacitacao: MetricaCap[] = [
  {
    num: "20+",
    lbl: "Anos de história",
    detail: "Capacitação contínua de quadros da administração pública",
  },
  {
    num: "15",
    lbl: "Programas estratégicos",
    detail: "9 Educação · 3 Gestão Pública · 3 Saúde",
  },
  {
    num: "500+",
    lbl: "Eventos realizados",
    detail: "300+ presenciais · 200+ online · híbridos",
  },
  {
    num: "400 mil+",
    lbl: "Agentes formados",
    detail: "Servidores, dirigentes e equipes técnicas atendidos",
  },
  {
    num: "Alta",
    numClasseExtra: "cm-num--word",
    lbl: "Satisfação",
    detail: "Avaliações consistentes em eventos presenciais, online e híbridos",
  },
];

// ----------------- SUBNAV -----------------

export const subnavLabel = "Nesta página";

export const subnavLinks: SubnavLink[] = [
  { texto: "Verticais", href: "#verticais", cmsLink: "subnav-verticais" },
  { texto: "Modalidades", href: "#modalidades", cmsLink: "subnav-modalidades" },
  { texto: "Formatos", href: "#formatos", cmsLink: "subnav-formatos" },
  { texto: "Curadoria", href: "#curadoria", cmsLink: "subnav-curadoria" },
  { texto: "EventOn", href: "#eventon", cmsLink: "subnav-eventon" },
  { texto: "Agenda", href: "#proximos", cmsLink: "subnav-agenda" },
];

// ----------------- MANIFESTO -----------------

export const manifestoEyebrow = "Como pensamos a capacitação institucional";
export const manifestoH2 = `Não é treinamento. É <em>formação de Estado</em>.`;
export const manifestoLede =
  "Para a NTC, capacitar servidores não é apenas transmitir conteúdo. É fortalecer a capacidade do Estado de planejar, decidir, contratar, executar, avaliar e entregar políticas públicas com consistência técnica.";
export const manifestoP =
  "Por isso a NTC não opera treinamentos avulsos. Estruturamos <strong>programas estratégicos</strong> — linhas formativas longas, conectadas à doutrina, ao direito vigente e aos desafios concretos das redes, dos órgãos e dos territórios — entregues em modalidades, formatos e eixos articulados pela mesma curadoria científica.";
export const manifestoMarker = "Ecossistema formativo NTC · 2026";

// ----------------- PILARES (3) -----------------

export const pilaresEyebrow = "Como entregamos";
export const pilaresH2 = `Conteúdo, curadoria <em>e entrega institucional</em>.`;
export const pilaresIntro =
  "A formação NTC combina programas estratégicos, especialistas reconhecidos e operação orientada à realidade dos órgãos públicos brasileiros.";

export const pilaresCapacitacao: PilarCap[] = [
  {
    num: "I",
    titulo: "Programas estratégicos",
    descricao:
      "Linhas formativas longas, articuladas à doutrina, ao direito vigente e aos desafios reais das redes, dos órgãos e dos territórios.",
    rule: "15 programas · 3 verticais",
  },
  {
    num: "II",
    titulo: "Curadoria científica",
    descricao:
      "Rede curada de especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional.",
    rule: "Critério editorial · não catálogo",
  },
  {
    num: "III",
    titulo: "Entrega institucional",
    descricao:
      "Operação executiva orientada ao servidor público — turmas dedicadas, EventOn, materiais editoriais, certificação e relatórios ao contratante.",
    rule: "Plataforma própria · segurança institucional",
  },
];
