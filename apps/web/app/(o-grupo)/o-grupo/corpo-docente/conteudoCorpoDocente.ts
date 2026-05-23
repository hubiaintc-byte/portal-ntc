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
  iconePath: string;
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

export const CARDS_FEATURED: CardFeatured[] = [];
export const CARDS_EXPERTS: CardExpert[] = [];
export const CARDS_AXIS_SAUDE: CardAxis[] = [];

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
