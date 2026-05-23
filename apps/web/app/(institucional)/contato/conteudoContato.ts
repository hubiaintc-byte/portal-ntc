/**
 * Conteúdo editorial da página /contato.
 *
 * Porta literal de 12_Pagina_Contato_v1.html. Não rephrasing — qualquer
 * mudança de copy deve passar pela equipe editorial.
 *
 * Campos com sufixo "Html" contêm tags inline (<strong>, <em>, <br>, <a>)
 * e devem ser renderizados com dangerouslySetInnerHTML.
 */

/* ============================================================
 * HERO
 * ============================================================ */

export const HERO = {
  breadcrumbHomeLabel: "Grupo NTC",
  breadcrumbHomeHref: "/",
  breadcrumbCurrent: "Contato",
  eyebrow: "Canais institucionais · Atendimento dedicado",
  tituloAntes: "Fale com quem ",
  tituloAccent: "decide",
  tituloDepois: " os rumos da formação institucional.",
  lede:
    "Atendimento humano, institucional e direcionado à natureza da sua demanda. Escolha o canal mais adequado para proposta institucional, inscrição de equipes ou grupos institucionais, imprensa ou atendimento geral — nossa equipe retorna em horário comercial.",
  quicklinks: [
    { href: "#tab-atendimento", label: "Atendimento geral", cmsLink: "rota-atendimento-geral" },
    { href: "#tab-proposta", label: "Proposta institucional", cmsLink: "rota-proposta-institucional" },
    { href: "#tab-equipe", label: "Equipe ou grupo institucional", cmsLink: "rota-inscricao-equipe" },
    { href: "#tab-imprensa", label: "Imprensa", cmsLink: "rota-imprensa" },
    { href: "#canais-diretos", label: "Canais diretos", cmsLink: "rota-canais-diretos" },
  ] as const,
};

/* ============================================================
 * ROTEADOR — TABS
 * ============================================================ */

export type TabId = "atendimento" | "proposta" | "equipe" | "imprensa";

export interface TabConfig {
  id: TabId;
  numero: string;
  titulo: string;
  descricao: string;
  ctaFooter: string;
  cmsLink: string;
}

export const TABS: readonly TabConfig[] = [
  {
    id: "atendimento",
    numero: "01 · Geral",
    titulo: "Atendimento geral",
    descricao: "Dúvidas, sugestões, parcerias e articulação institucional.",
    ctaFooter: "Falar com a NTC",
    cmsLink: "rota-atendimento-geral",
  },
  {
    id: "proposta",
    numero: "02 · Proposta",
    titulo: "Contratar formação",
    descricao:
      "Programas in company, turmas fechadas e soluções sob medida para órgãos e instituições.",
    ctaFooter: "Solicitar proposta",
    cmsLink: "rota-proposta-institucional",
  },
  {
    id: "equipe",
    numero: "03 · Equipe ou grupo",
    titulo: "Inscrever equipe ou grupo institucional",
    descricao:
      "De 3 participantes a inscrições em lote acima de mil, com faturamento institucional.",
    ctaFooter: "Inscrição em grupo",
    cmsLink: "rota-inscricao-equipe",
  },
  {
    id: "imprensa",
    numero: "04 · Imprensa",
    titulo: "Imprensa e parcerias",
    descricao:
      "Jornalistas, assessorias e entidades parceiras com demandas editoriais e de pauta.",
    ctaFooter: "Falar com a AssCom",
    cmsLink: "rota-imprensa",
  },
] as const;

/* ============================================================
 * FORMS — ASIDES
 * O markup dos forms (fields) fica inline no RoteadorFormularios.tsx
 * porque cada um tem layout próprio. Aqui só os textos do aside.
 * ============================================================ */

export interface FormAsideConfig {
  tab: TabId;
  formId: string;
  cmsLink: string;
  endpoint: string;
  aside: {
    eyebrow: string;
    titulo: string;
    descricaoHtml: string;
    bulletsHtml: readonly string[];
    rodapeHtml: string;
  };
}

export const FORMS_ASIDES: readonly FormAsideConfig[] = [
  {
    tab: "atendimento",
    formId: "form-contato-atendimento",
    cmsLink: "submit-atendimento-geral",
    endpoint: "/api/contato/atendimento",
    aside: {
      eyebrow: "Canal · Atendimento geral",
      titulo: "Fale com a NTC",
      descricaoHtml:
        "Canal aberto para dúvidas, sugestões, parcerias e qualquer demanda que não se encaixe nos canais especializados.",
      bulletsHtml: [
        "Retorno em até <strong>1 dia útil</strong>",
        "Atendimento humano direcionado",
        "Encaminhamento interno conforme o tema",
        "Confidencialidade institucional",
      ],
      rodapeHtml: "Prefere e-mail? <strong>contato@institutontc.com.br</strong>",
    },
  },
  {
    tab: "proposta",
    formId: "form-contato-proposta",
    cmsLink: "submit-proposta-institucional",
    endpoint: "/api/contato/proposta",
    aside: {
      eyebrow: "Canal · Proposta institucional",
      titulo: "Contratar formação para a sua instituição",
      descricaoHtml:
        "Para órgãos públicos, redes de ensino, sistemas de saúde e organizações que buscam programas <strong>in company</strong>, turmas fechadas, soluções sob medida ou trilhas estruturadas.",
      bulletsHtml: [
        "Diagnóstico institucional inicial",
        "Proposta técnica e comercial em até 5 dias úteis",
        "Documentação para Lei 14.133, dispensa e convênios",
        "Coordenação científica dedicada por vertical",
        "Faturamento por empenho, NF, convênio ou pactuação",
      ],
      rodapeHtml: "Atendimento comercial · <strong>(63) 3212-1199</strong>",
    },
  },
  {
    tab: "equipe",
    formId: "form-contato-equipe",
    cmsLink: "submit-inscricao-equipe",
    endpoint: "/api/contato/equipe",
    aside: {
      eyebrow: "Canal · Equipe ou grupo institucional",
      titulo: "Inscrever equipe ou grupo institucional",
      descricaoHtml:
        "Atendimento único para inscrições coletivas — de equipes pequenas a partir de <strong>3 participantes</strong> até inscrições em lote acima de mil participantes, com faturamento institucional.",
      bulletsHtml: [
        "Condições especiais a partir de 3 inscrições",
        "Faturamento por empenho, NF, convênio ou centralizado",
        "Reserva de vagas garantida em até 48h",
        "Coordenação dedicada para cadastros e certificação",
        "Inscrição em lote por planilha (acima de 50 participantes)",
        "Material de divulgação interna sob demanda",
      ],
      // TODO: rota /agenda ainda não criada — manter href literal do protótipo
      rodapeHtml:
        "Inscrições individuais? Acesse a <strong><a href=\"./09_Pagina_Agenda_v2.html\" style=\"color: var(--dourado-soft);\">Agenda Geral NTC →</a></strong>",
    },
  },
  {
    tab: "imprensa",
    formId: "form-contato-imprensa",
    cmsLink: "submit-imprensa",
    endpoint: "/api/contato/imprensa",
    aside: {
      eyebrow: "Canal · Imprensa e relações institucionais",
      titulo: "Pautas, entrevistas e parcerias editoriais",
      descricaoHtml:
        "Canal dedicado a jornalistas, veículos, assessorias e entidades parceiras. Acesso a porta-vozes, especialistas das três verticais, dados consolidados e materiais editoriais.",
      bulletsHtml: [
        "Retorno em até <strong>4 horas úteis</strong>",
        "Coordenação científica e porta-vozes oficiais",
        "Releases, banco de imagens e logos",
        "Dados consolidados das três verticais",
        "Sala de imprensa por solicitação",
      ],
      rodapeHtml: "Apoio direto · <strong>imprensa@institutontc.com.br</strong>",
    },
  },
] as const;

/* ============================================================
 * SELECT OPTIONS
 * ============================================================ */

export interface SelectOption {
  value: string;
  label: string;
}

export const OPTIONS_ASSUNTO_ATENDIMENTO: readonly SelectOption[] = [
  { value: "duvida-geral", label: "Dúvida geral sobre o Grupo NTC" },
  { value: "parceria", label: "Proposta de parceria institucional" },
  { value: "sugestao", label: "Sugestão editorial ou de pauta" },
  { value: "articulacao", label: "Articulação com a coordenação" },
  { value: "participante", label: "Suporte a participante (acesso · certificado · replay)" },
  { value: "outros", label: "Outros" },
];

export const OPTIONS_NATUREZA_JURIDICA: readonly SelectOption[] = [
  { value: "municipal", label: "Poder público municipal" },
  { value: "estadual", label: "Poder público estadual" },
  { value: "federal", label: "Poder público federal" },
  { value: "judiciario", label: "Poder Judiciário" },
  { value: "legislativo", label: "Poder Legislativo / Tribunais de Contas" },
  { value: "autarquia", label: "Autarquia · Fundação · Empresa pública" },
  { value: "terceiro-setor", label: "Terceiro setor · OS · OSC" },
  { value: "privada", label: "Iniciativa privada" },
  { value: "outros", label: "Outros" },
];

export const OPTIONS_VERTICAL_PROP: readonly SelectOption[] = [
  { value: "educacao", label: "NTC Educação · 9 programas" },
  { value: "gestao-publica", label: "NTC Gestão Pública · 3 programas" },
  { value: "saude", label: "NTC Saúde · 3 programas" },
  { value: "multivertical", label: "Trilha multivertical · combinação" },
  { value: "indefinido", label: "Ainda em definição" },
];

export interface OptgroupConfig {
  grupo: string;
  opcoes: readonly SelectOption[];
}

export const OPTIONS_PROGRAMA_PROP: readonly OptgroupConfig[] = [
  {
    grupo: "NTC Educação",
    opcoes: [
      { value: "EDUTEC", label: "EDUTEC — Educação digital, inovação e tecnologias" },
      { value: "PEAR", label: "PEAR — Alfabetização e recomposição" },
      { value: "PEI", label: "PEI — Educação integral" },
      { value: "PROGE", label: "PROGE — Gestão escolar e coordenação pedagógica" },
      { value: "PROGIR", label: "PROGIR — Inclusão com resultado" },
      { value: "EGIDE", label: "EGIDE — IA, dados e governança digital" },
      { value: "VIVAESCOLA", label: "VIVAESCOLA — Convivência e proteção integral" },
      { value: "PINEI", label: "PINEI — Primeira infância" },
      { value: "FUTURA", label: "FUTURA — Ensino médio" },
    ],
  },
  {
    grupo: "NTC Gestão Pública",
    opcoes: [
      { value: "AGIP", label: "AGIP — Contratações públicas" },
      { value: "LIDERA", label: "LIDERA — Liderança e direção estratégica" },
      { value: "SIGA", label: "SIGA — Governança e administração" },
    ],
  },
  {
    grupo: "NTC Saúde",
    opcoes: [
      { value: "SIGS", label: "SIGS — Governança digital e IA do SUS" },
      { value: "PROAPS", label: "PROAPS+ — Atenção primária" },
      { value: "PROSUS", label: "PROSUS+ — Governança e financiamento do SUS" },
    ],
  },
];

export const OPTION_PROGRAMA_CUSTOMIZADO: SelectOption = {
  value: "customizado",
  label: "Solução totalmente customizada",
};

export const OPTIONS_MODALIDADE: readonly SelectOption[] = [
  { value: "incompany-presencial", label: "In company presencial" },
  { value: "incompany-online", label: "In company online" },
  { value: "incompany-hibrido", label: "In company híbrido" },
  { value: "turma-fechada", label: "Turma fechada" },
  { value: "sob-medida", label: "Solução sob medida" },
  { value: "trilha", label: "Trilha / jornada formativa" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_PARTICIPANTES: readonly SelectOption[] = [
  { value: "ate-25", label: "Até 25" },
  { value: "26-50", label: "26 a 50" },
  { value: "51-100", label: "51 a 100" },
  { value: "101-200", label: "101 a 200" },
  { value: "201-500", label: "201 a 500" },
  { value: "500+", label: "Acima de 500" },
];

export const OPTIONS_PRAZO: readonly SelectOption[] = [
  { value: "ate-30", label: "Até 30 dias" },
  { value: "2-3-meses", label: "2 a 3 meses" },
  { value: "4-6-meses", label: "4 a 6 meses" },
  { value: "semestre", label: "Próximo semestre" },
  { value: "ano", label: "Próximo ano fiscal" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_ORCAMENTO: readonly SelectOption[] = [
  { value: "ate-50k", label: "Até R$ 50 mil" },
  { value: "50-150k", label: "R$ 50 mil a R$ 150 mil" },
  { value: "150-500k", label: "R$ 150 mil a R$ 500 mil" },
  { value: "500k-1m", label: "R$ 500 mil a R$ 1 milhão" },
  { value: "1m+", label: "Acima de R$ 1 milhão" },
  { value: "depende", label: "Depende da proposta" },
];

export const OPTIONS_INSCRITOS_EQUIPE: readonly SelectOption[] = [
  { value: "3-5", label: "3 a 5 participantes" },
  { value: "6-10", label: "6 a 10 participantes" },
  { value: "11-20", label: "11 a 20 participantes" },
  { value: "21-50", label: "21 a 50 participantes" },
  { value: "51-100", label: "51 a 100 participantes" },
  { value: "101-500", label: "101 a 500 participantes" },
  { value: "501-1000", label: "501 a 1.000 participantes" },
  { value: "acima-1000", label: "Acima de 1.000 participantes" },
];

/** Valores de OPTIONS_INSCRITOS_EQUIPE que ativam o bloco de inscrição em lote. */
export const BULK_INSCRITOS_RANGES: ReadonlySet<string> = new Set([
  "51-100",
  "101-500",
  "501-1000",
  "acima-1000",
]);

export const OPTIONS_FATURAMENTO: readonly SelectOption[] = [
  { value: "empenho", label: "Empenho (órgão público)" },
  { value: "nf-centralizada", label: "Nota fiscal centralizada (instituição privada)" },
  { value: "boleto-institucional", label: "Boleto institucional" },
  { value: "pagamento-individual", label: "Pagamento individual com indicação coletiva" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_TIPO_IMPRENSA: readonly SelectOption[] = [
  { value: "entrevista", label: "Entrevista com porta-voz / coordenação" },
  { value: "especialista", label: "Indicação de especialista por área" },
  { value: "dados", label: "Dados consolidados / estatísticas" },
  { value: "release", label: "Solicitação de release / material editorial" },
  { value: "imagens", label: "Banco de imagens e logos" },
  { value: "parceria", label: "Parceria de mídia / cobertura conjunta" },
  { value: "outros", label: "Outros" },
];

/* ============================================================
 * CANAIS DIRETOS + SEDE
 * ============================================================ */

export interface ChannelCard {
  data: string;
  destaque: boolean;
  iconeChar: string;
  label: string;
  valor: string;
  nota: string;
  acaoHref: string;
  acaoTexto: string;
  acaoCmsLink: string;
  acaoTarget?: "_blank";
  acaoCrimson?: boolean;
}

export const CHANNELS: readonly ChannelCard[] = [
  {
    data: "email",
    destaque: false,
    iconeChar: "@",
    label: "E-mail institucional",
    valor: "contato@institutontc.com.br",
    nota: "Atendimento geral · resposta em até 1 dia útil",
    acaoHref: "mailto:contato@institutontc.com.br",
    acaoTexto: "Enviar",
    acaoCmsLink: "mailto-contato",
  },
  {
    data: "comercial",
    destaque: true,
    iconeChar: "☎",
    label: "Atendimento comercial",
    valor: "(63) 3212-1199",
    nota: "Propostas institucionais e contratação por órgão público",
    acaoHref: "tel:+556332121199",
    acaoTexto: "Ligar",
    acaoCmsLink: "tel-comercial",
  },
  {
    data: "whatsapp",
    destaque: true,
    iconeChar: "W",
    label: "WhatsApp comercial",
    valor: "(63) 98444-4040",
    nota: "Mensagens · seg–sex · 8h às 18h",
    acaoHref: "https://wa.me/5563984444040",
    acaoTexto: "Conversar",
    acaoCmsLink: "whatsapp-comercial",
    acaoTarget: "_blank",
  },
  {
    data: "imprensa",
    destaque: false,
    iconeChar: "¶",
    label: "Imprensa e AssCom",
    valor: "imprensa@institutontc.com.br",
    nota: "Pauta · entrevista · dados consolidados",
    acaoHref: "mailto:imprensa@institutontc.com.br",
    acaoTexto: "Falar com AssCom",
    acaoCmsLink: "mailto-imprensa",
    acaoCrimson: true,
  },
  {
    data: "suporte",
    destaque: false,
    iconeChar: "⚙",
    label: "Suporte EventOn (participante)",
    valor: "suporte@eventon.institutontc.com.br",
    nota: "Acesso · certificado · replay · materiais",
    acaoHref: "mailto:suporte@eventon.institutontc.com.br",
    acaoTexto: "Acionar suporte",
    acaoCmsLink: "mailto-suporte",
  },
];

export const HQ = {
  cidade: "Brasília · DF",
  enderecoHtml:
    "<strong>Instituto NTC do Brasil</strong><br>SCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001<br>Asa Sul · CEP 70308-200 · Brasília – DF<br>(63) 3212-1199 · contato@institutontc.com.br",
  mapaIframeSrc:
    "https://www.google.com/maps?q=Setor%20Comercial%20Sul%2C%20Quadra%209%2C%20Bloco%20C%2C%20Ed.%20Parque%20Cidade%20Corporate%2C%20Bras%C3%ADlia%20-%20DF&output=embed",
  mapaIframeTitle: "Localização da sede do Instituto NTC do Brasil em Brasília — DF",
  mapsBotaoHref:
    "https://www.google.com/maps/search/?api=1&query=SCS+Quadra+9+Bloco+C+Ed+Parque+Cidade+Corporate+Asa+Sul+Brasília",
};

/* ============================================================
 * VERTICAIS (seção 5)
 * ============================================================ */

export interface VerticalCard {
  vertical: "educacao" | "gestao-publica" | "saude";
  eyebrow: string;
  titulo: string;
  lede: string;
  programas: string;
  canaisHtml: string;
  /** TODO: rotas das verticais não portadas — manter href do protótipo */
  conhecerHref: string;
  conhecerCmsLink: string;
  propostaCmsLink: string;
}

export const VERTICAIS: readonly VerticalCard[] = [
  {
    vertical: "educacao",
    eyebrow: "NTC Educação",
    titulo: "Coordenação NTC Educação",
    lede:
      "Secretarias de Educação, redes municipais e estaduais, escolas e fundações — alfabetização, gestão escolar, educação digital, inclusão e ensino integral.",
    programas: "EDUTEC · PEAR · PEI · PROGE · PROGIR · EGIDE · VIVAESCOLA · PINEI · FUTURA",
    canaisHtml: "educacao@institutontc.com.br<br>(63) 3212-1199 · opção 1",
    // TODO: rota /educacao (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_Educacao_v1.html",
    conhecerCmsLink: "vertical-edu",
    propostaCmsLink: "proposta-edu",
  },
  {
    vertical: "gestao-publica",
    eyebrow: "NTC Gestão Pública",
    titulo: "Coordenação NTC Gestão Pública",
    lede:
      "Executivo, Judiciário, Legislativo, Tribunais de Contas e estatais — contratações públicas, governança, integridade e liderança institucional.",
    programas: "AGIP · LIDERA · SIGA",
    canaisHtml: "gestaopublica@institutontc.com.br<br>(63) 3212-1199 · opção 2",
    // TODO: rota /gestao-publica (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_GestaoPublica_v1.html",
    conhecerCmsLink: "vertical-gov",
    propostaCmsLink: "proposta-gov",
  },
  {
    vertical: "saude",
    eyebrow: "NTC Saúde",
    titulo: "Coordenação NTC Saúde",
    lede:
      "Secretarias de Saúde, hospitais públicos, redes do SUS e consórcios — atenção primária, governança digital, financiamento e gestão integrada.",
    programas: "SIGS · PROAPS+ · PROSUS+",
    canaisHtml: "saude@institutontc.com.br<br>(63) 3212-1199 · opção 3",
    // TODO: rota /saude (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_Saude_v1.html",
    conhecerCmsLink: "vertical-sau",
    propostaCmsLink: "proposta-sau",
  },
];

/* ============================================================
 * SLA BAR (seção 6)
 * ============================================================ */

export interface SlaCell {
  numero: string;
  label: string;
  nota: string;
}

export const SLAS: readonly SlaCell[] = [
  {
    numero: "1 dia útil",
    label: "Atendimento geral",
    nota:
      "Resposta inicial em horário comercial para qualquer mensagem enviada pelos canais oficiais.",
  },
  {
    numero: "5 dias úteis",
    label: "Proposta institucional",
    nota: "Diagnóstico inicial e envio da proposta técnica e comercial estruturada.",
  },
  {
    numero: "48 horas",
    label: "Inscrição em grupo",
    nota: "Reserva de vagas, termo de contratação e orientação sobre faturamento.",
  },
  {
    numero: "4 horas úteis",
    label: "Imprensa",
    nota: "Retorno prioritário para deadlines editoriais, com indicação de porta-voz.",
  },
];

export const SLA_HORARIOS = {
  comercialHtml:
    "<strong style=\"color: var(--dourado-soft);\">Horário comercial:</strong> segunda a sexta · 8h às 18h (horário de Brasília)",
  suporteHtml:
    "<strong style=\"color: var(--dourado-soft);\">Suporte EventOn:</strong> seg–sex · 8h–20h · sáb 8h–13h (durante eventos ao vivo)",
};

/* ============================================================
 * FAQ (seção 7)
 * ============================================================ */

export interface FaqItem {
  id: string;
  pergunta: string;
  respostaHtml: string;
  abertaPorDefault?: boolean;
}

export const FAQS: readonly FaqItem[] = [
  {
    id: "faq-prazo-proposta",
    pergunta: "Qual é o prazo para receber uma proposta institucional?",
    respostaHtml:
      "Até <strong>5 dias úteis</strong> após o envio do formulário de proposta. Em demandas urgentes vinculadas a ciclo orçamentário ou agenda de governo, o prazo pode ser antecipado mediante contato comercial direto.",
    abertaPorDefault: true,
  },
  {
    id: "faq-lei-14133",
    pergunta:
      "O Grupo NTC atende contratação por dispensa, inexigibilidade ou Lei 14.133?",
    respostaHtml:
      "Sim. Emitimos a documentação necessária para contratações por <strong>Lei 14.133/2021</strong> (dispensa, inexigibilidade, pregão, credenciamento), adesão a atas de registro de preços, convênios e pactuação interfederativa no SUS. Atendemos os três Poderes, Tribunais de Contas, autarquias, estatais e fundações públicas.",
  },
  {
    id: "faq-equipes-pequenas",
    pergunta: "É possível inscrever equipes pequenas com condições especiais?",
    respostaHtml:
      "Sim. A partir de <strong>3 inscrições</strong>, sua instituição já acessa o canal de Inscrição em Grupo, com condição comercial diferenciada, faturamento institucional (empenho, NF ou boleto) e reserva de vagas garantida em até 48 horas.",
  },
  {
    id: "faq-formatos",
    pergunta: "Quais formatos de capacitação estão disponíveis?",
    respostaHtml:
      "Cinco formatos: <strong>in company</strong> (presencial, online ou híbrido), <strong>turma fechada</strong>, <strong>solução sob medida</strong>, <strong>trilhas e jornadas</strong> e <strong>contratação institucional integrada</strong> — combinação de múltiplas frentes para órgãos públicos.",
  },
  {
    id: "faq-certificado",
    pergunta: "O participante recebe certificado? Qual a validade?",
    respostaHtml:
      "Sim. Cada participante recebe certificado do Instituto NTC do Brasil com carga horária, código único e QR code de autenticação. Os certificados têm validade nacional e podem ser usados em progressão funcional, editais e RH institucional. Emissão em até 5 dias úteis após a conclusão.",
  },
  {
    id: "faq-replay",
    pergunta: "Como funciona o acesso ao replay e aos materiais de apoio?",
    respostaHtml:
      "Replay disponível na <strong>Área do Participante (EventOn)</strong> em até 48 horas após o evento. Acesso por 90 dias (ou prazo definido por evento) a replay, slides, ementa e bibliografia. Em contratações in company, os prazos são acordados em contrato.",
  },
  {
    id: "faq-reuniao",
    pergunta: "Posso solicitar uma reunião antes de enviar a proposta?",
    respostaHtml:
      "Sim. Podemos agendar reunião presencial na sede em Brasília, virtual ou na sede da sua instituição. Use o canal de <a href=\"#tab-proposta\">Proposta institucional</a> indicando \"Solicito reunião prévia\" no campo de contexto, ou acione diretamente o (63) 3212-1199.",
  },
  {
    id: "faq-dados",
    pergunta: "Como meus dados pessoais e institucionais são tratados?",
    respostaHtml:
      "O tratamento segue a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018). Coletamos apenas o necessário para atender sua solicitação, sob base legal definida, e não compartilhamos com terceiros para fins comerciais. Para exercer seus direitos como titular, escreva ao nosso DPO em <strong>dpo@institutontc.com.br</strong>.",
  },
];

/* ============================================================
 * LGPD (seção 8)
 * ============================================================ */

export const LGPD = {
  eyebrow: "Tratamento de dados · LGPD",
  titulo:
    "Seus dados são tratados com a mesma seriedade do nosso compromisso institucional.",
  paragrafosHtml: [
    "O Instituto NTC do Brasil é controlador dos dados pessoais coletados nos formulários institucionais desta página. O tratamento segue a Lei Geral de Proteção de Dados (Lei 13.709/2018) e princípios de finalidade, adequação, necessidade, transparência, segurança e responsabilização.",
    "Para exercer seus direitos como titular (acesso, correção, anonimização, portabilidade, eliminação), acione nosso encarregado de proteção de dados pelo e-mail <strong style=\"color: var(--dourado-soft);\">dpo@institutontc.com.br</strong>.",
  ],
  ctaPrivacidadeHref: "/politica-de-privacidade",
  ctaPrivacidadeTexto: "Política de Privacidade completa",
  cells: [
    {
      titulo: "Finalidade",
      texto:
        "Atendimento da demanda institucional informada, elaboração de proposta comercial, processamento de inscrição ou resposta editorial.",
    },
    {
      titulo: "Base legal",
      texto:
        "Procedimentos preliminares ao contrato (art. 7º, V), legítimo interesse institucional (art. 7º, IX) ou consentimento expresso (art. 7º, I), conforme o canal.",
    },
    {
      titulo: "Retenção",
      texto:
        "Período proporcional ao ciclo de relacionamento institucional, com revisão periódica e descarte após o cumprimento da finalidade.",
    },
    {
      titulo: "Compartilhamento",
      texto:
        "Não há compartilhamento com terceiros para fins comerciais. Apenas com prestadores essenciais (e-mail, hospedagem) sob contrato de confidencialidade.",
    },
  ],
};

/* ============================================================
 * CTA FINAL (seção 9)
 * ============================================================ */

export interface CtaFinalAction {
  href: string;
  texto: string;
  variant: "gold" | "ghost-light";
  cmsLink: string;
  comArrow: boolean;
}

export const CTA_FINAL = {
  eyebrow: "Pronto para começar?",
  tituloHtml:
    "Vamos transformar a formação da sua instituição em <em>impacto institucional real</em>.",
  paragrafo:
    "Use o canal mais adequado à sua demanda — a equipe do Instituto NTC do Brasil retorna em horário comercial com a coordenação técnica e comercial dedicada à sua vertical.",
  acoes: [
    {
      href: "#tab-proposta",
      texto: "Solicitar proposta institucional",
      variant: "gold" as const,
      cmsLink: "cta-final-proposta",
      comArrow: true,
    },
    {
      href: "#tab-equipe",
      texto: "Inscrever minha equipe",
      variant: "ghost-light" as const,
      cmsLink: "cta-final-equipe",
      comArrow: false,
    },
    {
      href: "mailto:contato@institutontc.com.br",
      texto: "Escrever para contato@institutontc.com.br",
      variant: "ghost-light" as const,
      cmsLink: "cta-final-email",
      comArrow: false,
    },
  ] satisfies CtaFinalAction[],
};
