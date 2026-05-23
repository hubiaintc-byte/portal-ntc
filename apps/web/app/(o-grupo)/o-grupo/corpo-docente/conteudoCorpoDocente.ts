/**
 * Conteúdo literal portado de 25_Pagina_Corpo_Docente_v1.html.
 *
 * Textos institucionais, métricas, manifesto, lista de cards docentes
 * (featured + experts + axis-saúde), labels da filterbar, FAQ, CTAs.
 *
 * Padrão "porta do HTML" (memory/project_porta_html.md): textos ficam
 * neste arquivo local; CMS só entra quando explicitamente solicitado.
 */

/* ============================================================
   TIPOS
   ============================================================ */

export type Vertical = "educacao" | "gestao-publica" | "saude";
export type Tipo =
  | "autoridade"
  | "palestrante"
  | "doutrinador"
  | "consultor"
  | "pesquisador";
// "" = sem frente; preserva data-frente="" do HTML para a pipeline de filtro
// (matchTab faz `card.frente === "contratacoes"`).
export type Frente = "" | "contratacoes";
export type TabId =
  | "todos"
  | "educacao"
  | "gestao-publica"
  | "contratacoes"
  | "saude";

export interface SelectOption {
  value: string;
  label: string;
}

export type Quicklink =
  | { tipo: "anchor"; rotulo: string; href: string }
  | { tipo: "tab"; rotulo: string; vertShortcut: TabId };

/**
 * Campos compartilhados pelas duas formas de card "humano"
 * (featured + expert). Espelha os atributos data-* exigidos pela
 * pipeline de filtros do FilterBarDocentes.
 */
export interface CardDataset {
  vertical: Vertical;
  area: string;
  tipo: Tipo;
  frente: Frente;
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
  nome: string;
  imagemSrc: string;
  imagemAlt: string;
  axisBadge: string;
}

export interface CardFeatured extends CardDataset {
  tag: string;
  credencial: string;
  metaAtuacao: string;
  metaEixos: string;
  ctaHref: string;
  ctaRotulo: string;
}

export interface CardExpert extends CardDataset {
  tipoTag: string;
  nomeExibido: string;
  credencial: string;
  programasTexto: string;
  programasStrong: string;
  sufixoPrograma?: string;
  ctaHref: string;
  ctaRotulo: string;
}

export interface CardAxis {
  vertical: "saude";
  area: string;
  tipo: Tipo;
  frente: Frente;
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
  nome: string;
  /**
   * innerHTML completo do <svg class="eac-icon"> do card.
   * Pode conter <path>, <circle>, <rect>, <line>, <polygon>, etc.
   * O renderer usa dangerouslySetInnerHTML no <svg> para suportar
   * qualquer combinação de primitivas SVG (Frente 02 tem <circle>,
   * Frente 03 tem <rect>, demais usam só <path>).
   */
  iconeSvgInner: string;
  axisTag: string;
  titulo: string;
  credencial: string;
  programasTexto: string;
  programasStrong: string;
  ctaHref: string;
  ctaRotulo: string;
  styleAccent: string;
  styleAccentDark: string;
}

/* ============================================================
   HERO + MÉTRICAS + MANIFESTO
   ============================================================ */

export const HERO: {
  crumb: {
    home: { rotulo: string; href: string };
    parent: { rotulo: string; href: string };
    current: string;
  };
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  quicklinks: Quicklink[];
} = {
  crumb: {
    home: { rotulo: "Grupo NTC", href: "/" },
    parent: { rotulo: "O Grupo", href: "/o-grupo" }, // ajustado vs HTML que apontava para /capacitacao
    current: "Corpo Docente",
  },
  eyebrow: "Curadoria nacional · Instituto NTC do Brasil · Edição 2026",
  titulo:
    'Corpo Docente <span class="accent">do Grupo NTC</span>.<br>Autoridades, pesquisadores, gestores, doutrinadores e palestrantes que sustentam nossos programas.',
  subtitulo:
    'Uma curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação. <em style="color: var(--pergaminho); font-style: italic;">Contratações Públicas integra a NTC Gestão Pública como núcleo técnico especializado.</em>',
  quicklinks: [
    { tipo: "anchor", rotulo: "Ver toda a curadoria", href: "#especialistas" },
    { tipo: "tab", rotulo: "Educação", vertShortcut: "educacao" },
    { tipo: "tab", rotulo: "Gestão Pública", vertShortcut: "gestao-publica" },
    { tipo: "tab", rotulo: "Contratações Públicas", vertShortcut: "contratacoes" },
    { tipo: "tab", rotulo: "Saúde", vertShortcut: "saude" },
    { tipo: "anchor", rotulo: "Credenciar especialista", href: "#credenciamento" },
  ],
};

export interface Metrica {
  classe: "is-edu" | "is-gov" | "is-cpr" | "is-sau";
  sublabel: string;
  num: string;
  label: string;
  detalhe: string;
}

export const METRICAS: Metrica[] = [
  {
    classe: "is-edu",
    sublabel: "NTC Educação",
    num: "60",
    label: "Especialistas e referências técnicas",
    detalhe:
      "Alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
  },
  {
    classe: "is-gov",
    sublabel: "NTC Gestão Pública",
    num: "31",
    label: "Autoridades e especialistas",
    detalhe:
      "Ministros, pensadores, juristas, gestores públicos, conferencistas nacionais e referências em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
  },
  {
    classe: "is-cpr",
    sublabel: "Núcleo Contratações Públicas · Frente da NTC Gestão Pública",
    num: "31",
    label: "Autoridades, doutrinadores e especialistas",
    detalhe:
      "Núcleo técnico especializado com foco em Lei 14.133/2021, licitações, contratos, controle externo, TCU, concessões, PPPs, obras públicas, infraestrutura, compliance e gestão contratual.",
  },
  {
    classe: "is-sau",
    sublabel: "NTC Saúde",
    num: "5",
    label: "Frentes técnicas em Saúde Pública",
    detalhe:
      "Governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde — curadoria especializada em composição estratégica.",
  },
];

export interface ArchCard {
  area: "educacao" | "gestao-publica" | "contratacoes" | "saude";
  eyebrow: string;
  titulo: string;
  descricao: string;
  selo: string;
}

export interface Camada {
  num: string;
  titulo: string;
  descricao: string;
}

export const MANIFESTO: {
  marker: string;
  titulo: string;
  lede: string;
  archCards: ArchCard[];
  camadas: Camada[];
  callout: { titulo: string; descricao: string };
  nota: string;
} = {
  marker: "Arquitetura da curadoria",
  titulo:
    "Uma rede nacional de especialistas, organizada por <em>área, programa e demanda institucional</em>.",
  lede: "O Corpo Docente do Grupo NTC não é uma lista fixa de professores. É uma curadoria técnica, científica e institucional, mobilizada conforme o eixo formativo, o programa, o perfil da instituição contratante e os objetivos de cada entrega.",
  archCards: [
    {
      area: "educacao",
      eyebrow: "NTC Educação · Área estratégica",
      titulo: "Educação",
      descricao:
        "Especialistas em alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
      selo: "60 especialistas e referências técnicas",
    },
    {
      area: "gestao-publica",
      eyebrow: "NTC Gestão Pública · Área estratégica",
      titulo: "Gestão Pública",
      descricao:
        "Autoridades, pensadores, juristas, gestores públicos e conferencistas nacionais em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
      selo: "31 autoridades e especialistas",
    },
    {
      area: "contratacoes",
      eyebrow: "Frente especializada da NTC Gestão Pública",
      titulo: "Contratações Públicas",
      descricao:
        "Núcleo técnico especializado da NTC Gestão Pública, reunindo autoridades, doutrinadores, ministros, auditores, juristas e especialistas em Lei 14.133/2021, licitações, contratos, controle externo, concessões, PPPs, obras e gestão contratual.",
      selo: "Núcleo especializado · 31 nomes",
    },
    {
      area: "saude",
      eyebrow: "NTC Saúde · Área estratégica",
      titulo: "Saúde",
      descricao:
        "Curadoria especializada em governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde.",
      selo: "5 frentes técnicas em Saúde Pública",
    },
  ],
  camadas: [
    {
      num: "01",
      titulo: "Autoridades de referência",
      descricao:
        "Ministros, conselheiros, dirigentes, ex-presidentes de órgãos e lideranças de alta projeção.",
    },
    {
      num: "02",
      titulo: "Palestrantes e pensadores",
      descricao:
        "Nomes ligados à liderança, ética, comportamento, comunicação, cultura institucional e alta performance.",
    },
    {
      num: "03",
      titulo: "Doutrinadores e técnicos",
      descricao:
        "Juristas, autores, professores, pareceristas, auditores e especialistas setoriais.",
    },
    {
      num: "04",
      titulo: "Consultores sêniores",
      descricao:
        "Profissionais com experiência aplicada em redes públicas, órgãos, secretarias e tribunais.",
    },
    {
      num: "05",
      titulo: "Pesquisadores e coordenação científica",
      descricao:
        "Perfis acadêmicos, coordenadores científicos e especialistas em metodologia e produção técnica.",
    },
  ],
  callout: {
    titulo: "Por que Contratações Públicas aparece separada?",
    descricao:
      "Contratações Públicas integra a NTC Gestão Pública, mas possui núcleo próprio de curadoria em razão de sua densidade técnica, volume de especialistas, relevância jurídica e importância programática no AGIP. Por isso, aparece como frente destacada — sem ser tratada como uma quarta vertical institucional.",
  },
  nota: "A composição docente é definida <strong>caso a caso</strong>, conforme programa, eixo, formato, perfil da instituição contratante e objetivo da formação. O Instituto NTC do Brasil não opera com corpo docente fixo permanente.",
};

/* ============================================================
   FILTERBAR — LABELS E OPÇÕES
   (TAB_LABELS, AREA_LABELS, TIPO_LABELS vêm do JS do protótipo
   linhas ~3272-3322; PROGRAMAS_OPTIONS, FORMACAO_OPTIONS,
   ATUACAO_OPTIONS vêm dos <select> do HTML)
   ============================================================ */

export const TAB_LABELS: Record<TabId, string> = {
  "todos": "Todos",
  "educacao": "Educação",
  "gestao-publica": "Gestão Pública",
  "contratacoes": "Contratações Públicas",
  "saude": "Saúde",
};

export const AREA_LABELS: Record<string, string> = {
  // Educação · 8 eixos
  "alfabetizacao": "Alfabetização, leitura e letramento",
  "gestao-escolar": "Gestão escolar e coordenação pedagógica",
  "educacao-digital": "Educação digital, IA e inovação",
  "educacao-integral": "Educação integral",
  "primeira-infancia": "Primeira infância e educação infantil",
  "inclusao-equidade": "Inclusão, equidade e convivência",
  "ensino-medio": "Ensino médio, juventudes e futuro",
  "avaliacao-politicas": "Avaliação e políticas educacionais",
  // Gestão Pública · 8 eixos
  "lideranca-publica": "Liderança pública",
  "governanca-integridade": "Governança e integridade",
  "direito-administrativo": "Direito administrativo",
  "politicas-publicas": "Políticas públicas",
  "escolas-governo": "Escolas de governo",
  "transformacao-digital-estado": "Transformação digital do Estado",
  "gestao-institucional": "Gestão institucional",
  "cultura-organizacional": "Cultura organizacional e alta gestão",
  // Contratações · 8 eixos
  "lei-14133": "Lei 14.133/2021",
  "licitacoes-contratos": "Licitações e contratos",
  "pregao-contratacao-direta": "Pregão e contratação direta",
  "gestao-fiscalizacao-contratual": "Gestão e fiscalização contratual",
  "controle-externo-tcu": "Controle externo e TCU",
  "obras-publicas": "Obras públicas",
  "concessoes-ppps": "Concessões, PPPs e infraestrutura",
  "compliance-contratacoes": "Compliance nas contratações",
  // Saúde · 5 frentes
  "governanca-sus": "Frente 01 · Gestão do SUS e governança",
  "aps": "Frente 02 · Atenção primária e redes",
  "saude-digital": "Frente 03 · Saúde digital, dados e IA",
  "planejamento-financiamento-saude": "Frente 04 · Planejamento e financiamento",
  "regulacao-compliance-saude": "Frente 05 · Regulação e compliance",
};

export const TIPO_LABELS: Record<Tipo, string> = {
  "autoridade": "Autoridade de referência",
  "palestrante": "Palestrante / pensador nacional",
  "doutrinador": "Especialista técnico / doutrinador",
  "consultor": "Consultor sênior",
  "pesquisador": "Pesquisador / coordenação científica",
};

// Extraído do <select id="filter-programa">. Ordem e optgroups preservados
// conforme HTML linhas 1883-1903:
// NTC Educação (9): EDUTEC, PEAR, PEI, PROGE, PROGIR, EGIDE, VIVAESCOLA, PINEI, FUTURA
// NTC Gestão Pública (3): AGIP, LIDERA, SIGA
// NTC Saúde (3): SIGS, PROAPS+, PROSUS+ (value puro, label com sufixo "+")
export interface ProgramaOption {
  value: string;
  label: string;
  group?: string;
}

export const PROGRAMAS_OPTIONS: ProgramaOption[] = [
  { value: "EDUTEC", label: "EDUTEC", group: "NTC Educação" },
  { value: "PEAR", label: "PEAR", group: "NTC Educação" },
  { value: "PEI", label: "PEI", group: "NTC Educação" },
  { value: "PROGE", label: "PROGE", group: "NTC Educação" },
  { value: "PROGIR", label: "PROGIR", group: "NTC Educação" },
  { value: "EGIDE", label: "EGIDE", group: "NTC Educação" },
  { value: "VIVAESCOLA", label: "VIVAESCOLA", group: "NTC Educação" },
  { value: "PINEI", label: "PINEI", group: "NTC Educação" },
  { value: "FUTURA", label: "FUTURA", group: "NTC Educação" },
  { value: "AGIP", label: "AGIP", group: "NTC Gestão Pública" },
  { value: "LIDERA", label: "LIDERA", group: "NTC Gestão Pública" },
  { value: "SIGA", label: "SIGA", group: "NTC Gestão Pública" },
  { value: "SIGS", label: "SIGS", group: "NTC Saúde" },
  { value: "PROAPS", label: "PROAPS+", group: "NTC Saúde" },
  { value: "PROSUS", label: "PROSUS+", group: "NTC Saúde" },
];

export const FORMACAO_OPTIONS: SelectOption[] = [
  { value: "doutorado", label: "Doutorado/Pós-doutorado" },
  { value: "mestrado", label: "Mestrado" },
  { value: "especializacao", label: "Especialização/MBA" },
  { value: "graduacao-experiencia", label: "Graduação + experiência sênior" },
];

export const ATUACAO_OPTIONS: SelectOption[] = [
  { value: "universidade", label: "Universidade pública" },
  { value: "gestao-publica", label: "Gestão pública executiva" },
  { value: "controle", label: "Órgãos de controle" },
  { value: "judiciario", label: "Judiciário/MP" },
  { value: "multilateral", label: "Organismos multilaterais" },
  { value: "terceiro-setor", label: "Terceiro setor" },
  { value: "consultoria", label: "Consultoria privada" },
];

export const SORT_OPTIONS: SelectOption[] = [
  { value: "editorial", label: "Editorial (curadoria primeiro)" },
  { value: "alfa", label: "Alfabética (A–Z)" },
  { value: "alfa-desc", label: "Alfabética (Z–A)" },
  { value: "programa", label: "Por programa" },
  { value: "area", label: "Por área formativa" },
];

export const PERPAGE_OPTIONS: number[] = [12, 24, 48];

/* ============================================================
   CARDS — Task 5 preenche os 3 arrays abaixo
   ============================================================ */

export const CARDS_FEATURED: CardFeatured[] = [
  {
    vertical: "gestao-publica",
    area: "lideranca-publica",
    tipo: "autoridade",
    frente: "",
    programas: "LIDERA,SIGA",
    formacao: "doutorado",
    atuacao: "judiciario",
    cmsLink: "perfil-luiz-fux",
    nome: "Min. Luiz Fux",
    imagemSrc: "./img/fotos/_optimized/autoridade-gestao-publica.1920.webp",
    imagemAlt:
      "Min. Luiz Fux · Direito constitucional, jurisdição superior e governança pública",
    axisBadge: "Gestão Pública · Direito constitucional",
    tag: "Autoridade convidada",
    credencial:
      "Ministro do Supremo Tribunal Federal. Autoridade em direito constitucional, jurisdição superior, governança pública e liderança institucional do Estado.",
    metaAtuacao: "Atuação · <strong>Supremo Tribunal Federal</strong>",
    metaEixos: "Eixos relacionados · <strong>LIDERA · SIGA</strong>",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "governanca-integridade",
    tipo: "autoridade",
    frente: "",
    programas: "SIGA,LIDERA,AGIP",
    formacao: "doutorado",
    atuacao: "controle",
    cmsLink: "perfil-vital-do-rego",
    nome: "Min. Vital do Rêgo Filho",
    imagemSrc: "./img/fotos/_optimized/autoridade-tcu.1920.webp",
    imagemAlt:
      "Min. Vital do Rêgo Filho · Presidente do Tribunal de Contas da União, controle externo e governança pública",
    axisBadge: "Gestão Pública · Controle e governança",
    tag: "Autoridade convidada",
    credencial:
      "Ministro e atual Presidente do Tribunal de Contas da União. Referência em controle externo, governança pública, contas públicas e modernização institucional do Estado brasileiro.",
    metaAtuacao:
      "Atuação · <strong>Tribunal de Contas da União · Presidência</strong>",
    metaEixos: "Eixos relacionados · <strong>SIGA · LIDERA · AGIP</strong>",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "lei-14133",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-jorge-jacoby",
    nome: "Jorge Jacoby Fernandes",
    imagemSrc: "./img/fotos/_optimized/autoridade-contratacoes.1920.webp",
    imagemAlt:
      "Jorge Jacoby Fernandes · Doutrinador de referência nacional em licitações e contratos administrativos",
    axisBadge: "Contratações · Doutrina nacional",
    tag: "Doutrinador de referência nacional",
    credencial:
      "Doutrinador de referência nacional em licitações, contratos administrativos, contratação direta, controle e capacitação de agentes públicos.",
    metaAtuacao:
      "Atuação · <strong>Licitações · contratos · controle · capacitação pública</strong>",
    metaEixos:
      "Eixo relacionado · <strong>AGIP</strong> · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "autoridade",
    frente: "",
    programas: "PROGE,PEAR,FUTURA,EDUTEC",
    formacao: "doutorado",
    atuacao: "gestao-publica,universidade",
    cmsLink: "perfil-maria-ines-fini",
    nome: "Maria Inês Fini",
    imagemSrc: "./img/fotos/_optimized/autoridade-educacao.1920.webp",
    imagemAlt:
      "Maria Inês Fini · Coordenadora científica da curadoria educacional, avaliação educacional e ENEM",
    axisBadge: "Educação · Avaliação e políticas públicas",
    tag: "Coordenação científica · Educação",
    credencial:
      "Coordenadora científica da curadoria educacional do Grupo NTC. Referência nacional em avaliação educacional, ENEM, políticas públicas e formação de redes públicas de ensino.",
    metaAtuacao:
      "Atuação · <strong>Avaliação educacional · políticas públicas · redes de ensino</strong>",
    metaEixos:
      "Eixos relacionados · <strong>PROGE · PEAR · FUTURA · EDUTEC</strong>",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
];

export const CARDS_EXPERTS: CardExpert[] = [
  // ============================================================
  // NTC EDUCAÇÃO · 16 cards
  // ============================================================
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "autoridade",
    frente: "",
    programas: "EDUTEC,PROGE",
    formacao: "doutorado",
    atuacao: "gestao-publica,universidade",
    cmsLink: "perfil-maria-helena-guimaraes-castro",
    nome: "Maria Helena Guimarães Castro",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt:
      "Maria Helena Guimarães Castro · Políticas públicas, avaliação em larga escala e gestão de redes",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Autoridade",
    nomeExibido: "Maria Helena Guimarães Castro",
    credencial:
      "Ex-presidente do INEP. Políticas públicas em educação, avaliação em larga escala e gestão de redes educacionais brasileiras.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "EDUTEC · PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "autoridade",
    frente: "",
    programas: "PROGE,PEAR",
    formacao: "doutorado",
    atuacao: "gestao-publica",
    cmsLink: "perfil-cesar-callegari",
    nome: "Cesar Callegari",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Cesar Callegari · Política educacional e financiamento",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Autoridade",
    nomeExibido: "Cesar Callegari",
    credencial:
      "Política educacional, financiamento da educação, CNE, regulamentação e arquitetura federativa da educação brasileira.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "PROGE · PEAR",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "gestao-escolar",
    tipo: "autoridade",
    frente: "",
    programas: "PROGE",
    formacao: "doutorado",
    atuacao: "gestao-publica,universidade",
    cmsLink: "perfil-ivan-claudio-siqueira",
    nome: "Ivan Cláudio Pereira Siqueira",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Ivan Cláudio Pereira Siqueira · Gestão de redes públicas",
    axisBadge: "Gestão escolar",
    tipoTag: "Autoridade",
    nomeExibido: "Ivan Cláudio Pereira Siqueira",
    credencial:
      "Gestão de redes públicas de ensino, secretarias estaduais e municipais, articulação entre sistemas e qualidade da educação básica.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "ensino-medio",
    tipo: "autoridade",
    frente: "",
    programas: "FUTURA",
    formacao: "doutorado",
    atuacao: "gestao-publica,terceiro-setor",
    cmsLink: "perfil-mozart-neves-ramos",
    nome: "Mozart Neves Ramos",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Mozart Neves Ramos · Ensino médio e itinerários formativos",
    axisBadge: "Ensino médio e juventudes",
    tipoTag: "Autoridade",
    nomeExibido: "Mozart Neves Ramos",
    credencial:
      "Ensino médio, itinerários formativos, projeto de vida, juventudes e desenho de políticas para a etapa final da educação básica.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "FUTURA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "autoridade",
    frente: "",
    programas: "PROGE,FUTURA",
    formacao: "doutorado",
    atuacao: "universidade,gestao-publica",
    cmsLink: "perfil-guiomar-namo-mello",
    nome: "Guiomar Namo de Mello",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt:
      "Guiomar Namo de Mello · Políticas educacionais e qualidade da educação básica",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Autoridade",
    nomeExibido: "Guiomar Namo de Mello",
    credencial:
      "Referência histórica em políticas educacionais. Currículo, formação de professores e qualidade da educação básica nas redes públicas.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "PROGE · FUTURA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "alfabetizacao",
    tipo: "doutrinador",
    frente: "",
    programas: "PEAR",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-telma-weisz",
    nome: "Telma Weisz",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Telma Weisz · Alfabetização e construção do conhecimento",
    axisBadge: "Alfabetização e letramento",
    tipoTag: "Doutrinadora",
    nomeExibido: "Telma Weisz",
    credencial:
      "Alfabetização, construção do conhecimento, didática da língua materna e formação de professores em redes municipais e estaduais.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PEAR",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "doutrinador",
    frente: "",
    programas: "PROGE,PEAR",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-cipriano-luckesi",
    nome: "Cipriano Carlos Luckesi",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Cipriano Carlos Luckesi · Avaliação da aprendizagem",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Doutrinador",
    nomeExibido: "Cipriano Carlos Luckesi",
    credencial:
      "Avaliação da aprendizagem, didática, formação docente e produção doutrinária de referência sobre avaliação escolar no Brasil.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "PROGE · PEAR",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "gestao-escolar",
    tipo: "doutrinador",
    frente: "",
    programas: "PROGE",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-celso-vasconcellos",
    nome: "Celso Vasconcellos",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Celso Vasconcellos · Gestão pedagógica e currículo",
    axisBadge: "Gestão escolar",
    tipoTag: "Doutrinador",
    nomeExibido: "Celso Vasconcellos",
    credencial:
      "Gestão pedagógica, planejamento, projeto político-pedagógico, currículo e coordenação pedagógica em redes públicas.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "educacao-digital",
    tipo: "doutrinador",
    frente: "",
    programas: "EDUTEC,EGIDE",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-jose-moran",
    nome: "José Moran",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "José Moran · Educação, tecnologia e inovação",
    axisBadge: "Educação digital e IA",
    tipoTag: "Doutrinador",
    nomeExibido: "José Moran",
    credencial:
      "Educação, tecnologia e inovação, metodologias ativas, ensino híbrido e transformação digital de instituições educacionais.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "EDUTEC · EGIDE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "primeira-infancia",
    tipo: "doutrinador",
    frente: "",
    programas: "PINEI",
    formacao: "doutorado",
    atuacao: "universidade,terceiro-setor",
    cmsLink: "perfil-regina-scarpa",
    nome: "Regina Scarpa",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Regina Scarpa · Primeira infância e educação infantil",
    axisBadge: "Primeira infância",
    tipoTag: "Doutrinadora",
    nomeExibido: "Regina Scarpa",
    credencial:
      "Primeira infância, educação infantil, currículo, brincar, formação de professoras e gestão da rede de educação infantil.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PINEI",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "doutrinador",
    frente: "",
    programas: "PROGE",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-naercio-aquino",
    nome: "Naércio Aquino Menezes Filho",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Naércio Aquino Menezes Filho · Economia da educação",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Doutrinador",
    nomeExibido: "Naércio Aquino Menezes Filho",
    credencial:
      "Economia da educação, avaliação de políticas educacionais, evidências em educação e impacto de programas em redes públicas.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "educacao-integral",
    tipo: "consultor",
    frente: "",
    programas: "PEI,PROGE",
    formacao: "mestrado",
    atuacao: "gestao-publica,consultoria",
    cmsLink: "perfil-sandra-bozza",
    nome: "Sandra Bozza",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Sandra Bozza · Educação integral e gestão escolar",
    axisBadge: "Educação integral",
    tipoTag: "Consultora",
    nomeExibido: "Sandra Bozza",
    credencial:
      "Educação integral, gestão escolar, jornada ampliada, formação de equipes escolares e implementação de políticas curriculares em redes.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "PEI · PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "alfabetizacao",
    tipo: "consultor",
    frente: "",
    programas: "PEAR",
    formacao: "mestrado",
    atuacao: "consultoria,gestao-publica",
    cmsLink: "perfil-jane-haddad",
    nome: "Jane Haddad",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Jane Haddad · Alfabetização e recomposição",
    axisBadge: "Alfabetização e letramento",
    tipoTag: "Consultora",
    nomeExibido: "Jane Haddad",
    credencial:
      "Alfabetização de alta performance, recomposição da aprendizagem, formação de alfabetizadoras e implementação em redes municipais.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PEAR",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "avaliacao-politicas",
    tipo: "pesquisador",
    frente: "",
    programas: "PROGE",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-vasco-moretto",
    nome: "Vasco Moretto",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Vasco Moretto · Avaliação e prática docente",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Pesquisador",
    nomeExibido: "Vasco Moretto",
    credencial:
      "Avaliação da aprendizagem, prática docente, didática e formação de professores em redes públicas brasileiras.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PROGE",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "educacao-digital",
    tipo: "pesquisador",
    frente: "",
    programas: "EDUTEC",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-heloisa-dupas",
    nome: "Heloísa Dupas Penteado",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Heloísa Dupas Penteado · Mídia-educação e linguagens",
    axisBadge: "Educação digital e IA",
    tipoTag: "Pesquisadora",
    nomeExibido: "Heloísa Dupas Penteado",
    credencial:
      "Mídia-educação, linguagens, cultura digital, formação de professores para a sala de aula conectada e estudos contemporâneos da comunicação escolar.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "EDUTEC",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "educacao",
    area: "inclusao-equidade",
    tipo: "consultor",
    frente: "",
    programas: "PROGIR,VIVAESCOLA",
    formacao: "mestrado",
    atuacao: "terceiro-setor,gestao-publica",
    cmsLink: "perfil-inclusao-progir",
    nome: "Curadoria em inclusão e proteção integral",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Curadoria em inclusão, equidade e proteção integral",
    axisBadge: "Inclusão e convivência",
    tipoTag: "Curadoria especializada",
    nomeExibido: "Curadoria especializada · Inclusão e convivência",
    credencial:
      "Educação especial, AEE, DUA, Lei Brasileira de Inclusão, proteção integral, prevenção da evasão e clima escolar — composição docente conforme objeto institucional.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "PROGIR · VIVAESCOLA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta",
    ctaRotulo: "Solicitar composição",
  },

  // ============================================================
  // NTC GESTÃO PÚBLICA · 14 cards (sem Contratações)
  // ============================================================
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "autoridade",
    frente: "",
    programas: "LIDERA,SIGA",
    formacao: "doutorado",
    atuacao: "gestao-publica,multilateral",
    cmsLink: "perfil-claudia-costin",
    nome: "Cláudia Costin",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Cláudia Costin · Gestão e políticas públicas",
    axisBadge: "Políticas públicas",
    tipoTag: "Autoridade",
    nomeExibido: "Cláudia Costin",
    credencial:
      "Gestão e políticas públicas, reforma administrativa, ensino e cooperação internacional aplicada ao Estado brasileiro.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "LIDERA · SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "cultura-organizacional",
    tipo: "palestrante",
    frente: "",
    programas: "LIDERA",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-leandro-karnal",
    nome: "Leandro Karnal",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Leandro Karnal · Liderança e pensamento estratégico",
    axisBadge: "Cultura organizacional",
    tipoTag: "Palestrante nacional",
    nomeExibido: "Leandro Karnal",
    credencial:
      "Liderança e pensamento estratégico, história, ética, cultura institucional e formação de quadros executivos públicos.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "LIDERA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "cultura-organizacional",
    tipo: "palestrante",
    frente: "",
    programas: "LIDERA",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-clovis-de-barros",
    nome: "Clóvis de Barros Filho",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Clóvis de Barros Filho · Ética e gestão pública",
    axisBadge: "Cultura organizacional",
    tipoTag: "Palestrante nacional",
    nomeExibido: "Clóvis de Barros Filho",
    credencial:
      "Ética, gestão pública, filosofia aplicada à liderança, comunicação institucional e formação de cultura organizacional no setor público.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "LIDERA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "lideranca-publica",
    tipo: "palestrante",
    frente: "",
    programas: "LIDERA",
    formacao: "especializacao",
    atuacao: "consultoria",
    cmsLink: "perfil-eduardo-shinyashiki",
    nome: "Eduardo Shinyashiki",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Eduardo Shinyashiki · Liderança e alta performance",
    axisBadge: "Liderança pública",
    tipoTag: "Palestrante nacional",
    nomeExibido: "Eduardo Shinyashiki",
    credencial:
      "Liderança e alta performance, desenvolvimento humano, gestão de pessoas, comunicação e cultura de resultados aplicada à administração pública.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "LIDERA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "cultura-organizacional",
    tipo: "palestrante",
    frente: "",
    programas: "LIDERA",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-betania-tanure",
    nome: "Betania Tanure",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Betania Tanure · Liderança e cultura",
    axisBadge: "Cultura organizacional",
    tipoTag: "Palestrante",
    nomeExibido: "Betania Tanure",
    credencial:
      "Liderança, cultura organizacional, gestão de pessoas e alta performance em organizações públicas e privadas.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "LIDERA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "transformacao-digital-estado",
    tipo: "doutrinador",
    frente: "",
    programas: "AGIP,SIGA",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-fabricio-mota",
    nome: "Fabrício Mota",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Fabrício Mota · LGPD, Direito Digital e proteção de dados",
    axisBadge: "Transformação digital do Estado",
    tipoTag: "Especialista convidado",
    nomeExibido: "Fabrício Mota",
    credencial:
      "Especialista em LGPD, Direito Digital e proteção de dados. Governança de dados e regulação tecnológica aplicada ao setor público.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "AGIP · SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "governanca-integridade",
    tipo: "doutrinador",
    frente: "",
    programas: "LIDERA,SIGA",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-humberto-falcao-martins",
    nome: "Humberto Falcão Martins",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Humberto Falcão Martins · Governança pública",
    axisBadge: "Governança e integridade",
    tipoTag: "Doutrinador",
    nomeExibido: "Humberto Falcão Martins",
    credencial:
      "Governança pública, gestão por resultados, indicadores, reforma do Estado e modernização administrativa do setor público brasileiro.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "LIDERA · SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "gestao-institucional",
    tipo: "doutrinador",
    frente: "",
    programas: "SIGA",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-caio-marini",
    nome: "Caio Marini",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Caio Marini · Gestão estratégica do Estado",
    axisBadge: "Gestão institucional",
    tipoTag: "Doutrinador",
    nomeExibido: "Caio Marini",
    credencial:
      "Gestão estratégica do Estado, planejamento, governança e modelos de gestão pública contemporânea.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "doutrinador",
    frente: "",
    programas: "SIGA",
    formacao: "doutorado",
    atuacao: "universidade,multilateral",
    cmsLink: "perfil-ricardo-paes-de-barros",
    nome: "Ricardo Paes de Barros",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Ricardo Paes de Barros · Políticas públicas",
    axisBadge: "Políticas públicas",
    tipoTag: "Doutrinador",
    nomeExibido: "Ricardo Paes de Barros",
    credencial:
      "Avaliação de políticas públicas, desigualdade, economia social aplicada e desenho de programas governamentais baseados em evidências.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "doutrinador",
    frente: "",
    programas: "SIGA",
    formacao: "doutorado",
    atuacao: "universidade,gestao-publica",
    cmsLink: "perfil-regina-pacheco",
    nome: "Regina Silvia Pacheco",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Regina Silvia Pacheco · Administração pública",
    axisBadge: "Políticas públicas",
    tipoTag: "Doutrinadora",
    nomeExibido: "Regina Silvia Pacheco",
    credencial:
      "Administração pública, carreiras de Estado, formação de quadros executivos, ENAP e governança da função pública.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "doutrinador",
    frente: "",
    programas: "SIGA,LIDERA",
    formacao: "doutorado",
    atuacao: "universidade,gestao-publica",
    cmsLink: "perfil-francisco-gaetani",
    nome: "Francisco Gaetani",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Francisco Gaetani · Reforma do Estado",
    axisBadge: "Políticas públicas",
    tipoTag: "Doutrinador",
    nomeExibido: "Francisco Gaetani",
    credencial:
      "Reforma do Estado, capacidade estatal, governança pública e modernização da máquina administrativa brasileira.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "SIGA · LIDERA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "doutrinador",
    frente: "",
    programas: "SIGA",
    formacao: "doutorado",
    atuacao: "universidade",
    cmsLink: "perfil-fernando-abrucio",
    nome: "Fernando Abrucio",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Fernando Abrucio · Federalismo e políticas públicas",
    axisBadge: "Políticas públicas",
    tipoTag: "Doutrinador",
    nomeExibido: "Fernando Abrucio",
    credencial:
      "Federalismo, relações intergovernamentais, políticas públicas comparadas, accountability e formação de carreiras públicas.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "governanca-integridade",
    tipo: "autoridade",
    frente: "",
    programas: "SIGA,AGIP",
    formacao: "doutorado",
    atuacao: "controle",
    cmsLink: "perfil-bruno-dantas",
    nome: "Min. Bruno Dantas",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt:
      "Min. Bruno Dantas · Controle, governança e modernização da Administração Pública",
    axisBadge: "Governança e integridade",
    tipoTag: "Autoridade convidada",
    nomeExibido: "Min. Bruno Dantas",
    credencial:
      "Ministro do Tribunal de Contas da União. Referência em controle, governança e modernização da Administração Pública brasileira.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "SIGA · AGIP",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "politicas-publicas",
    tipo: "autoridade",
    frente: "",
    programas: "LIDERA,SIGA",
    formacao: "especializacao",
    atuacao: "gestao-publica",
    cmsLink: "perfil-hugo-leal",
    nome: "Hugo Leal",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt:
      "Hugo Leal · Liderança pública, regulação setorial e economia do mar",
    axisBadge: "Políticas públicas",
    tipoTag: "Autoridade convidada",
    nomeExibido: "Hugo Leal",
    credencial:
      "Liderança pública com trajetória parlamentar. Energia, óleo, gás, regulação setorial e economia do mar aplicada à formulação de políticas públicas.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "LIDERA · SIGA",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-gov#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },

  // ============================================================
  // NÚCLEO CONTRATAÇÕES PÚBLICAS · 15 cards
  // ============================================================
  {
    vertical: "gestao-publica",
    area: "lei-14133",
    tipo: "autoridade",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-marcal-justen-filho",
    nome: "Marçal Justen Filho",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt:
      "Marçal Justen Filho · Doutrina nacional em licitações, contratos administrativos e Lei 14.133/2021",
    axisBadge: "Lei 14.133/2021",
    tipoTag: "Autoridade",
    nomeExibido: "Marçal Justen Filho",
    credencial:
      "Jurista, parecerista e professor. Autoridade nacional em licitações, contratos administrativos e Lei 14.133/2021.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "lei-14133",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-abduch-santos",
    nome: "José Anacleto Abduch Santos",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt:
      "José Anacleto Abduch Santos · Contratações e governança",
    axisBadge: "Lei 14.133/2021",
    tipoTag: "Doutrinador",
    nomeExibido: "José Anacleto Abduch Santos",
    credencial:
      "Contratações públicas, governança das licitações, planejamento e implementação da Lei 14.133/2021 em órgãos estaduais e municipais.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "licitacoes-contratos",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-ronny-charles",
    nome: "Ronny Charles Lopes de Torres",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt:
      "Ronny Charles Lopes de Torres · Nova Lei de Licitações",
    axisBadge: "Licitações e contratos",
    tipoTag: "Doutrinador",
    nomeExibido: "Ronny Charles L. de Torres",
    credencial:
      "Nova Lei de Licitações e Contratos, autor de obras-referência, jurisprudência aplicada e formação intensiva de agentes públicos.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "compliance-contratacoes",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-tatiana-camarao",
    nome: "Tatiana Camarão",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Tatiana Camarão · Contratações e compliance",
    axisBadge: "Compliance nas contratações",
    tipoTag: "Doutrinadora",
    nomeExibido: "Tatiana Camarão",
    credencial:
      "Contratações públicas e compliance, integridade nas licitações, programas de integridade institucional e Lei Anticorrupção aplicada.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "gestao-fiscalizacao-contratual",
    tipo: "consultor",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "especializacao",
    atuacao: "gestao-publica,consultoria",
    cmsLink: "perfil-rafael-jardim",
    nome: "Rafael Jardim Cavalcante",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Rafael Jardim Cavalcante · Gestão de contratos",
    axisBadge: "Gestão contratual",
    tipoTag: "Consultor",
    nomeExibido: "Rafael Jardim Cavalcante",
    credencial:
      "Gestão e fiscalização de contratos administrativos, agentes de contratação, sanções e responsabilização contratual.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "controle-externo-tcu",
    tipo: "autoridade",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "judiciario,universidade",
    cmsLink: "perfil-jesse-torres",
    nome: "Jessé Torres Pereira Júnior",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt:
      "Jessé Torres Pereira Júnior · Direito administrativo e controle",
    axisBadge: "Controle externo e TCU",
    tipoTag: "Autoridade",
    nomeExibido: "Jessé Torres Pereira Júnior",
    credencial:
      "Direito administrativo, controle externo das contratações, jurisprudência consolidada e formação de quadros do controle.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "controle-externo-tcu",
    tipo: "autoridade",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "controle",
    cmsLink: "perfil-benjamin-zymler",
    nome: "Benjamin Zymler",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Benjamin Zymler · Controle externo",
    axisBadge: "Controle externo e TCU",
    tipoTag: "Autoridade",
    nomeExibido: "Benjamin Zymler",
    credencial:
      "Controle externo, Tribunal de Contas da União, jurisprudência aplicada às contratações públicas e accountability institucional.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "controle-externo-tcu",
    tipo: "autoridade",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "controle,universidade",
    cmsLink: "perfil-weder-oliveira",
    nome: "Weder de Oliveira",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Weder de Oliveira · Finanças públicas e controle",
    axisBadge: "Controle externo e TCU",
    tipoTag: "Autoridade",
    nomeExibido: "Weder de Oliveira",
    credencial:
      "Finanças públicas, controle externo, gasto público responsável e governança orçamentária aplicada à execução de contratos.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "licitacoes-contratos",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-joel-niebuhr",
    nome: "Joel de Menezes Niebuhr",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Joel de Menezes Niebuhr · Licitações e contratos",
    axisBadge: "Licitações e contratos",
    tipoTag: "Doutrinador",
    nomeExibido: "Joel de Menezes Niebuhr",
    credencial:
      "Licitações e contratos administrativos, pregão eletrônico, atos da contratação, contratação direta e doutrina aplicada à Lei 14.133/2021.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "concessoes-ppps",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-flavio-amaral-garcia",
    nome: "Flávio Amaral Garcia",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Flávio Amaral Garcia · Direito administrativo",
    axisBadge: "Concessões, PPPs e infraestrutura",
    tipoTag: "Doutrinador",
    nomeExibido: "Flávio Amaral Garcia",
    credencial:
      "Direito administrativo, contratos complexos, regulação setorial e desenho de projetos de concessão e parceria público-privada.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "compliance-contratacoes",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-cristiana-fortini",
    nome: "Cristiana Fortini",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Cristiana Fortini · Contratações e integridade",
    axisBadge: "Compliance nas contratações",
    tipoTag: "Doutrinadora",
    nomeExibido: "Cristiana Fortini",
    credencial:
      "Contratações públicas, integridade institucional, prevenção à corrupção, governança das licitações e responsabilização de agentes.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "concessoes-ppps",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-vera-monteiro",
    nome: "Vera Monteiro",
    imagemSrc: "./img/fotos/_optimized/expert-04.1920.webp",
    imagemAlt: "Vera Monteiro · Concessões e parcerias",
    axisBadge: "Concessões, PPPs e infraestrutura",
    tipoTag: "Doutrinadora",
    nomeExibido: "Vera Monteiro",
    credencial:
      "Concessões, parcerias público-privadas, regulação setorial, infraestrutura e contratos administrativos complexos.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "lei-14133",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-mauricio-zockun",
    nome: "Maurício Zockun",
    imagemSrc: "./img/fotos/_optimized/expert-01.1920.webp",
    imagemAlt: "Maurício Zockun · Direito administrativo aplicado",
    axisBadge: "Lei 14.133/2021",
    tipoTag: "Doutrinador",
    nomeExibido: "Maurício Zockun",
    credencial:
      "Direito administrativo aplicado, regime jurídico das contratações, pareceres técnicos e formação de quadros do controle e da advocacia pública.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "controle-externo-tcu",
    tipo: "autoridade",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "controle,universidade",
    cmsLink: "perfil-lucas-furtado",
    nome: "Lucas Furtado",
    imagemSrc: "./img/fotos/_optimized/expert-02.1920.webp",
    imagemAlt: "Lucas Furtado · Controle e responsabilização",
    axisBadge: "Controle externo e TCU",
    tipoTag: "Autoridade",
    nomeExibido: "Lucas Furtado",
    credencial:
      "Controle e responsabilização, jurisprudência do TCU, governança das contratações e accountability do Estado.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
  {
    vertical: "gestao-publica",
    area: "obras-publicas",
    tipo: "doutrinador",
    frente: "contratacoes",
    programas: "AGIP",
    formacao: "doutorado",
    atuacao: "universidade,consultoria",
    cmsLink: "perfil-fernando-vernalha",
    nome: "Fernando Vernalha Guimarães",
    imagemSrc: "./img/fotos/_optimized/expert-03.1920.webp",
    imagemAlt: "Fernando Vernalha Guimarães · Infraestrutura e contratos",
    axisBadge: "Obras públicas",
    tipoTag: "Doutrinador",
    nomeExibido: "Fernando Vernalha Guimarães",
    credencial:
      "Infraestrutura, contratos públicos, obras complexas, regulação setorial e judicialização aplicada às contratações estratégicas.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "AGIP",
    sufixoPrograma: " · Núcleo Contratações",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-cp#tab-proposta",
    ctaRotulo: "Consultar disponibilidade",
  },
];

export const CARDS_AXIS_SAUDE: CardAxis[] = [
  {
    vertical: "saude",
    area: "governanca-sus",
    tipo: "autoridade",
    frente: "",
    programas: "SIGS,PROSUS",
    formacao: "",
    atuacao: "",
    cmsLink: "frente-01-governanca-sus",
    nome: "Frente 01 · Gestão do SUS e governança",
    iconeSvgInner: `<path d="M32 8L8 20v18c0 14 11 22 24 26 13-4 24-12 24-26V20L32 8z"/>
              <path d="M32 24v18M24 32l8 8 8-8"/>`,
    axisTag: "Frente 01 · Saúde",
    titulo: "Gestão do SUS e governança",
    credencial:
      "Lideranças com trajetória em secretarias, conselhos, órgãos reguladores e estruturas decisórias da saúde pública. Curadoria em composição estratégica conforme objeto da contratação.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "SIGS · PROSUS+",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-saude#tab-proposta",
    ctaRotulo: "Solicitar caderno docente",
    styleAccent: "var(--oliva)",
    styleAccentDark: "#2B3E12",
  },
  {
    vertical: "saude",
    area: "aps",
    tipo: "autoridade",
    frente: "",
    programas: "PROAPS",
    formacao: "",
    atuacao: "",
    cmsLink: "frente-02-aps",
    nome: "Frente 02 · Atenção primária e redes de cuidado",
    iconeSvgInner: `<circle cx="32" cy="32" r="20"/>
              <path d="M32 18v14l10 6M18 22l-4-4M46 22l4-4M14 50l4-4M50 46l-4-4"/>`,
    axisTag: "Frente 02 · Saúde",
    titulo: "Atenção primária e redes de cuidado",
    credencial:
      "Especialistas em APS, ESF, resolutividade, coordenação de redes, modelos assistenciais integrados e implementação territorial da Política Nacional de Atenção Básica.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "PROAPS+",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-saude#tab-proposta",
    ctaRotulo: "Solicitar caderno docente",
    styleAccent: "var(--oliva)",
    styleAccentDark: "#2B3E12",
  },
  {
    vertical: "saude",
    area: "saude-digital",
    tipo: "autoridade",
    frente: "",
    programas: "SIGS",
    formacao: "",
    atuacao: "",
    cmsLink: "frente-03-saude-digital",
    nome: "Frente 03 · Saúde digital, dados e IA",
    iconeSvgInner: `<rect x="10" y="14" width="44" height="30" rx="3"/>
              <path d="M22 50h20M28 44v6M36 44v6M18 24h10M18 32h6M30 28h18"/>`,
    axisTag: "Frente 03 · Saúde",
    titulo: "Saúde digital, dados e IA",
    credencial:
      "Profissionais com atuação em transformação digital do SUS, interoperabilidade, prontuário eletrônico, telessaúde, dados clínicos e inteligência artificial aplicada.",
    programasTexto: "Eixo relacionado · ",
    programasStrong: "SIGS",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-saude#tab-proposta",
    ctaRotulo: "Solicitar caderno docente",
    styleAccent: "var(--oliva)",
    styleAccentDark: "#2B3E12",
  },
  {
    vertical: "saude",
    area: "planejamento-financiamento-saude",
    tipo: "autoridade",
    frente: "",
    programas: "SIGS,PROSUS",
    formacao: "",
    atuacao: "",
    cmsLink: "frente-04-planejamento-financiamento",
    nome: "Frente 04 · Planejamento, financiamento e performance",
    iconeSvgInner: `<path d="M8 50h48M14 42v8M24 32v18M34 24v26M44 36v14M54 14v36"/>`,
    axisTag: "Frente 04 · Saúde",
    titulo: "Planejamento, financiamento e performance",
    credencial:
      "Referências em Plano de Saúde, PAS, RAG, SIOPS, financiamento público da saúde, sustentabilidade do sistema, indicadores e capacidade institucional de decisão.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "SIGS · PROSUS+",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-saude#tab-proposta",
    ctaRotulo: "Solicitar caderno docente",
    styleAccent: "var(--oliva)",
    styleAccentDark: "#2B3E12",
  },
  {
    vertical: "saude",
    area: "regulacao-compliance-saude",
    tipo: "autoridade",
    frente: "",
    programas: "SIGS,PROSUS",
    formacao: "",
    atuacao: "",
    cmsLink: "frente-05-regulacao-compliance",
    nome: "Frente 05 · Regulação, controle, compliance e qualidade",
    iconeSvgInner: `<path d="M32 8L10 18v16c0 14 10 22 22 24 12-2 22-10 22-24V18L32 8z"/>
              <path d="M24 32l6 6 12-12"/>`,
    axisTag: "Frente 05 · Saúde",
    titulo: "Regulação, controle, compliance e qualidade",
    credencial:
      "Regulação assistencial, auditoria SUS, compliance público, segurança do paciente, qualidade assistencial e controle interno do sistema de saúde.",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "SIGS · PROSUS+",
    ctaHref:
      "./12_Pagina_Contato_v1.html?categoria=curadoria-saude#tab-proposta",
    ctaRotulo: "Solicitar caderno docente",
    styleAccent: "var(--oliva)",
    styleAccentDark: "#2B3E12",
  },
];

/* ============================================================
   CONTADORES INSTITUCIONAIS + NOTAS EDITORIAIS
   ============================================================ */

export interface Contador {
  num: string;
  label: string;
  asterisco?: boolean;
  sufixoOuro?: string;
}

export const CONTADORES: Contador[] = [
  { num: "22", label: "Eixos formativos" },
  { num: "122", sufixoOuro: "+", label: "Referências institucionais", asterisco: true },
  { num: "15", label: "Programas estratégicos" },
  { num: "3", label: "Áreas estratégicas + Núcleo Contratações" },
];

export const NOTAS = {
  indicador122: {
    rotulo: "* Sobre o indicador \"122+ Referências institucionais\"",
    texto:
      'O número reúne <strong>especialistas, autoridades, doutrinadores, consultores e referências técnicas</strong> mapeadas na curadoria institucional do Instituto NTC do Brasil — 31 em NTC Gestão Pública, 31 no Núcleo Contratações Públicas, 60 em NTC Educação e curadoria especializada em frentes técnicas na NTC Saúde — com <strong>composição operacional definida conforme programa, eixo, formato e contratação</strong>. Não representa corpo docente fixo nem disponibilidade contínua de todos os nomes simultaneamente.',
  },
  selecaoOperacional:
    'Os perfis acima representam uma <strong>seleção operacional da curadoria do Grupo NTC</strong>, atualizada continuamente conforme o portfólio institucional. Cada turma, programa ou jornada in company recebe uma composição docente específica, calibrada conforme o eixo temático, o perfil dos participantes e os resultados esperados pela instituição contratante.',
};

/* ============================================================
   CREDIBILIDADE
   ============================================================ */

export const CREDIBILIDADE: {
  eyebrow: string;
  titulo: string;
  lede: string;
  items: { num: string; label: string; detalhe: string }[];
  rodape: string;
} = {
  eyebrow: "Duas décadas de trajetória nacional",
  titulo:
    "A curadoria docente do Grupo NTC é respaldada por <em>mais de 20 anos</em> de atuação nacional.",
  lede: "Centenas de eventos realizados e milhares de agentes públicos capacitados em formações presenciais, on-line e híbridas. Essa trajetória sustenta a seleção de especialistas, a composição de programas e a entrega de soluções sob medida para instituições públicas brasileiras.",
  items: [
    {
      num: "20+",
      label: "Anos de atuação nacional",
      detalhe:
        "Trajetória institucional ininterrupta de formação de quadros públicos brasileiros — Instituto NTC do Brasil.",
    },
    {
      num: "500+",
      label: "Eventos realizados",
      detalhe:
        "300+ encontros presenciais e 200+ online — seminários, jornadas, oficinas, cursos executivos, simpósios e congressos.",
    },
    {
      num: "400 mil+",
      label: "Agentes capacitados",
      detalhe:
        "Servidores federais, estaduais e municipais formados em todas as áreas estratégicas do Grupo NTC.",
    },
    {
      num: "98%",
      label: "Índice de satisfação",
      detalhe:
        "Avaliação positiva consolidada de participantes em eventos abertos e formações in company.",
    },
  ],
  rodape:
    'Atuação junto a · <strong style="color: var(--dourado-soft);">Órgãos federais · Governos estaduais · Municípios · Secretarias · Redes públicas · Sistema de Saúde · Órgãos de controle · Legislativo · Autarquias e fundações</strong>',
};

/* ============================================================
   CREDENCIAMENTO
   ============================================================ */

export interface CtaBtn {
  rotulo: string;
  href: string;
  variante: "gold" | "ghost-light" | "ghost" | "outline" | "secondary";
}

export const CREDENCIAMENTO: {
  eyebrow: string;
  titulo: string;
  descricao: string;
  lista: string[];
  ctas: CtaBtn[];
  aside: {
    eyebrow: string;
    titulo: string;
    intro: string;
    checklist: string[];
    nota: string;
  };
} = {
  eyebrow: "Credenciamento de especialistas",
  titulo:
    "Você é pesquisador, gestor ou formador e quer integrar o <em>corpo docente</em> do Grupo NTC?",
  descricao:
    "O Grupo NTC mantém um processo contínuo de credenciamento de especialistas para os 22 eixos formativos das três verticais. A curadoria científica avalia currículo, trajetória institucional, produção acadêmica e experiência aplicada antes de qualquer convite operacional.",
  lista: [
    "Atuação por programa ou eixo — você indica os territórios onde tem autoridade técnica comprovada.",
    "Modalidades de atuação: docente convidado, consultor sênior, pesquisador associado ou curadoria de referência.",
    "Cadastro institucional preserva LGPD desde o primeiro contato. Você controla seus dados.",
    "Sem exclusividade — você pode atuar no Grupo NTC e em outras frentes acadêmicas e institucionais simultaneamente.",
  ],
  ctas: [
    {
      rotulo: "Enviar cadastro de especialista",
      // TODO: rota /contato ainda não criada — converti href HTML
      // (./12_Pagina_Contato_v1.html?categoria=credenciamento#tab-atendimento)
      href: "/contato?categoria=credenciamento#tab-atendimento",
      variante: "gold",
    },
    {
      rotulo: "Conversar com a curadoria",
      // TODO: rota /contato ainda não criada — converti href HTML
      // (./12_Pagina_Contato_v1.html#tab-atendimento)
      href: "/contato#tab-atendimento",
      variante: "secondary",
    },
  ],
  aside: {
    eyebrow: "O que precisa estar pronto",
    titulo: "Material institucional mínimo",
    intro:
      "Para acelerar o processo de avaliação pela curadoria científica, tenha em mãos antes de enviar:",
    checklist: [
      "Currículo Lattes atualizado",
      "Áreas de atuação e eixos do Grupo NTC",
      "3 publicações ou produções relevantes",
      "2 referências institucionais",
      "Experiência aplicada em rede pública",
      "Disponibilidade e expectativa de honorários",
    ],
    nota: "A análise inicial dura até 10 dias úteis. Em caso de adequação, a curadoria agenda uma conversa de alinhamento institucional antes do credenciamento formal.",
  },
};

/* ============================================================
   FAQ — sem campo `open` (estado vive no FaqAcordeao client)
   ============================================================ */

export interface FaqItem {
  id: string;
  titulo: string;
  parags: string[];
}

export const FAQ: FaqItem[] = [
  {
    id: "faq-1",
    titulo: "Por que Contratações Públicas aparece separada de Gestão Pública?",
    parags: [
      "Contratações Públicas <strong>integra a área NTC Gestão Pública</strong>, mas possui núcleo próprio de curadoria em razão de sua densidade técnica, volume de especialistas, relevância jurídica e importância programática no AGIP. Por isso, a página apresenta essa frente separadamente — <strong>sem tratá-la como uma quarta vertical institucional</strong>.",
      "A arquitetura-mãe do Grupo NTC permanece composta por três áreas estratégicas: Educação, Gestão Pública e Saúde. Contratações Públicas é uma frente especializada da NTC Gestão Pública.",
    ],
  },
  {
    id: "faq-2",
    titulo: "A composição docente é fixa?",
    parags: [
      "Não. A composição docente é definida <strong>conforme programa, eixo, formato, perfil da instituição contratante e objetivo da formação</strong>. O Grupo NTC trabalha com uma rede de autoridades, especialistas e consultores mobilizados de forma estratégica para cada entrega.",
      "Cada turma fechada, in company ou jornada executiva recebe uma equipe operacional dimensionada caso a caso, com nomes reais e currículos completos apresentados em proposta formal.",
    ],
  },
  {
    id: "faq-3",
    titulo: "Como o Grupo NTC seleciona os especialistas?",
    parags: [
      "A curadoria científica é orientada por três critérios cumulativos: <strong>autoridade técnica comprovada</strong> (produção acadêmica, atuação em rede, publicações), <strong>experiência aplicada</strong> em políticas públicas brasileiras (gestão de Estado, controle, redes públicas, organismos multilaterais) e <strong>capacidade pedagógica</strong> de formação de quadros executivos. Cada eixo formativo tem critérios específicos validados pelo conselho científico do Grupo.",
      "A curadoria é dinâmica — os especialistas são convocados por programa, eixo e demanda institucional, sem corpo docente fixo permanente.",
    ],
  },
  {
    id: "faq-4-camadas",
    titulo: "Quais são as 5 camadas de curadoria do Grupo NTC?",
    parags: [
      "<strong>1 · Autoridades de referência</strong>: ministros, conselheiros, ex-presidentes de órgãos nacionais, autoridades de Estado, grandes nomes institucionais e lideranças de alta projeção.",
      "<strong>2 · Palestrantes e pensadores nacionais</strong>: nomes voltados à liderança, ética, comportamento, cultura institucional, comunicação, propósito e alta performance pública.",
      "<strong>3 · Especialistas técnicos e doutrinadores</strong>: juristas, professores, autores, pareceristas, auditores, especialistas setoriais e referências técnicas de cada campo.",
      "<strong>4 · Consultores sêniores</strong>: profissionais com atuação prática em redes públicas, órgãos, secretarias, tribunais, sistemas de saúde, escolas de governo e projetos institucionais.",
      "<strong>5 · Pesquisadores associados e coordenação científica</strong>: perfis acadêmicos, pesquisadores, coordenadores científicos, especialistas em metodologia, produção técnica e curadoria pedagógica.",
    ],
  },
  {
    id: "faq-4",
    titulo:
      "Posso escolher os especialistas que vão atuar na turma in company da minha instituição?",
    parags: [
      "Sim, parcialmente. Em contratações in company, a curadoria do Grupo NTC apresenta uma <strong>composição docente sugerida</strong> calibrada para a instituição contratante, o eixo formativo e os resultados esperados. A instituição pode validar essa composição, sugerir substituições por especialistas equivalentes da curadoria ou indicar nomes complementares — desde que estes passem pela validação científica do Grupo.",
      "Não há cobrança adicional por escolha de docentes da curadoria — a calibragem da equipe está incluída no escopo da contratação institucional.",
    ],
  },
  {
    id: "faq-5",
    titulo: "Como me cadastrar para integrar o corpo docente do Grupo NTC?",
    parags: [
      "O credenciamento ocorre em três passos: <strong>(1)</strong> envio do cadastro institucional com currículo Lattes, áreas de atuação e referências; <strong>(2)</strong> análise pela curadoria científica em até 10 dias úteis; <strong>(3)</strong> conversa de alinhamento institucional caso haja adequação aos eixos formativos. Após o credenciamento formal, o especialista entra no banco da curadoria e pode ser convocado por programa ou demanda institucional.",
      "O cadastro é feito pelo canal de credenciamento desta página ou pelo formulário institucional da página de Contato.",
    ],
  },
  {
    id: "faq-6",
    titulo: "O Grupo NTC remunera os especialistas convidados? Há exclusividade?",
    parags: [
      "Sim — toda atuação docente no Grupo NTC é remunerada conforme tabela institucional, escopo da contratação (in company · turma fechada · sob medida) e tipo de vínculo (curadoria · convidado · consultor · pesquisador). Os valores são acordados em contrato individual antes da entrega.",
      "Não há cláusula de exclusividade. O especialista pode atuar no Grupo NTC e em outras frentes acadêmicas, consultivas ou institucionais simultaneamente, desde que não haja conflito de interesse explícito com um programa em curso.",
    ],
  },
  {
    id: "faq-7",
    titulo:
      "Como funciona a propriedade intelectual de materiais produzidos pelos especialistas?",
    parags: [
      "Materiais didáticos, slides, apostilas, mentorias e atividades produzidos especificamente para um programa do Grupo NTC ficam regulados por contrato individual. Em regra: o Grupo NTC licencia o material para uso no programa, evento ou jornada contratada; o especialista preserva os direitos autorais para uso em sua atuação independente (publicações próprias, cursos próprios, atuação acadêmica).",
      "Quando há produção autoral (livros, capítulos, artigos), os créditos seguem o padrão acadêmico, com menção institucional do Grupo NTC quando o material for fruto da atuação contratada.",
    ],
  },
  {
    id: "faq-8",
    titulo: "Como o Grupo NTC trata os dados pessoais dos especialistas (LGPD)?",
    parags: [
      "O cadastro institucional do especialista é tratado conforme a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018). Os dados são coletados apenas para a finalidade declarada (avaliação pela curadoria + composição operacional de turmas), retidos pelo período necessário ao vínculo contratual ou enquanto o especialista mantiver interesse em ser considerado, e nunca compartilhados com terceiros sem consentimento explícito.",
      "O Encarregado de Dados (DPO) do Grupo NTC é <strong>dpo@institutontc.com.br</strong> · qualquer especialista pode solicitar acesso, correção ou exclusão dos próprios dados a qualquer tempo.",
    ],
  },
];

/* ============================================================
   CTA FINAL
   ============================================================ */

export const CTA_FINAL: {
  eyebrow: string;
  titulo: string;
  descricao: string;
  ctaPrincipal: CtaBtn;
  ctaSecundario: CtaBtn;
  separadorAreas: string;
  ctasArea: { rotulo: string; href: string }[];
} = {
  eyebrow: "Composição docente sob medida",
  titulo: "Monte a equipe de especialistas <em>para a sua instituição</em>.",
  descricao:
    "Solicite uma composição docente alinhada ao seu programa, eixo formativo, perfil dos participantes e objetivos institucionais. A curadoria científica do Grupo NTC dimensiona a equipe operacional ideal para cada entrega — turma fechada, in company, jornada executiva ou solução sob medida.",
  ctaPrincipal: {
    rotulo: "Solicitar composição docente para minha instituição",
    // TODO: rota /contato ainda não criada — converti href HTML
    // (./12_Pagina_Contato_v1.html?categoria=composicao-docente#tab-proposta)
    href: "/contato?categoria=composicao-docente#tab-proposta",
    variante: "gold",
  },
  ctaSecundario: {
    rotulo: "Agendar conversa com a curadoria",
    // TODO: rota /contato ainda não criada — converti href HTML
    // (./12_Pagina_Contato_v1.html#tab-atendimento)
    href: "/contato#tab-atendimento",
    variante: "ghost-light",
  },
  separadorAreas: "— Solicitação direta por área estratégica —",
  ctasArea: [
    {
      rotulo: "Curadoria para rede de ensino",
      // TODO: rota /contato ainda não criada
      href: "/contato?categoria=curadoria-edu#tab-proposta",
    },
    {
      rotulo: "Curadoria para lideranças públicas",
      // TODO: rota /contato ainda não criada
      href: "/contato?categoria=curadoria-gov#tab-proposta",
    },
    {
      rotulo: "Especialistas em Lei 14.133/2021",
      // TODO: rota /contato ainda não criada
      href: "/contato?categoria=curadoria-cp#tab-proposta",
    },
    {
      rotulo: "Curadoria para equipes do SUS",
      // TODO: rota /contato ainda não criada
      href: "/contato?categoria=curadoria-saude#tab-proposta",
    },
  ],
};

/* ============================================================
   STICKY CTA MOBILE
   ============================================================ */

export const STICKY_CTA = {
  rotulo: "Solicitar proposta institucional",
  // TODO: rota /contato ainda não criada
  href: "/contato#tab-proposta",
};
