/**
 * Conteúdo da página /eventon — porta literal de 27_Pagina_EventOn_v1.html
 * (<main id="main">, linhas 817-1419, e sticky CTA, linhas 1421-1425).
 *
 * Textos copiados sem rephrasing. Campos terminados em `Html` carregam
 * tags inline do protótipo (<strong>, <em>, <br>, <span>) e são renderizados
 * com dangerouslySetInnerHTML.
 *
 * Hrefs: os do protótipo (./NN_Pagina_X.html) foram trocados pelas rotas
 * reais — tabela em docs/superpowers/specs/2026-10-23-pagina-eventon-design.md §3.2.
 */

export interface LinkEventOn {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  /** Classes do <a>; ausente = link simples. */
  classe?: string;
  /** Acrescenta `<span class="btn-arrow">→</span>` depois do texto. */
  seta?: boolean;
}

export interface CabecalhoSecao {
  eyebrow: string;
  tituloHtml: string;
  intro: string;
}

/* ---------------------------------------------------------------- HERO */

export const heroEventOn = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Capacitação", href: "/capacitacao" },
  ] satisfies LinkEventOn[],
  crumbAtual: "Plataforma EventOn",
  eyebrow: "Plataforma do Grupo NTC · Edição 2026",
  tituloHtml:
    'EventOn<span class="accent">.</span><br>Acesso, replay, certificado e suporte — em um só ambiente.',
  subHtml:
    'A Plataforma EventOn é o ambiente digital institucional do <strong style="color: var(--pergaminho);">Instituto NTC do Brasil</strong> para eventos online, presenciais e híbridos. Reúne acesso ao vivo, replay restrito, materiais de apoio, certificação digital validável e suporte humano ao participante em uma única jornada.',
  ctas: [
    {
      texto: "Acessar Área do Participante",
      href: "#area-participante",
      cmsLink: "area-participante",
      track: "hero_cta_acessar",
      classe: "btn btn--gold",
      seta: true,
    },
    {
      texto: "Falar com suporte",
      href: "#suporte",
      cmsLink: "eventon-suporte",
      track: "hero_cta_suporte",
      classe: "btn btn--ghost-light",
    },
  ] satisfies LinkEventOn[],
  quicklinks: [
    { texto: "Recursos", href: "#recursos", track: "hero_quicklink_recursos" },
    { texto: "Tour visual", href: "#tour", track: "hero_quicklink_tour" },
    { texto: "Como funciona", href: "#como-funciona", track: "hero_quicklink_processo" },
    { texto: "Suporte", href: "#suporte", track: "hero_quicklink_suporte" },
    { texto: "Área do Participante", href: "#area-participante", track: "hero_quicklink_participante" },
  ] satisfies LinkEventOn[],
};

/* ------------------------------------------------------------ MÉTRICAS */

export interface MetricaEventOn {
  num: string;
  rotulo: string;
  detalhe: string;
}

export const metricasEventOn: MetricaEventOn[] = [
  {
    num: "Centenas",
    rotulo: "Eventos realizados",
    detalhe:
      "Encontros presenciais, online e híbridos entregues pela Plataforma EventOn nas três áreas estratégicas do Grupo NTC.",
  },
  {
    num: "Milhares",
    rotulo: "Agentes públicos alcançados",
    detalhe:
      "Servidores federais, estaduais e municipais participantes dos eventos hospedados na Plataforma.",
  },
  {
    num: "Alta",
    rotulo: "Satisfação dos participantes",
    detalhe:
      "Avaliação consistentemente positiva da experiência dos participantes na Plataforma EventOn.",
  },
  {
    num: "6",
    rotulo: "Funcionalidades essenciais",
    detalhe:
      "Acesso ao vivo · replay restrito · certificação digital · materiais · Área do Participante · suporte humano.",
  },
];

/* -------------------------------------------------------------- SUBNAV */

export const subnavEventOn: LinkEventOn[] = [
  { texto: "Recursos", href: "#recursos", track: "subnav_recursos" },
  { texto: "Como funciona", href: "#como-funciona", track: "subnav_como_funciona" },
  { texto: "Suporte", href: "#suporte", track: "subnav_suporte" },
  { texto: "Área do Participante", href: "#area-participante", track: "subnav_area_participante" },
  { texto: "FAQ", href: "#faq", track: "subnav_faq" },
];

/* ----------------------------------------------------------- MANIFESTO */

export const manifestoEventOn = {
  marcador: "Sobre a Plataforma EventOn",
  tituloHtml:
    "Uma experiência digital desenhada para a <em>formação institucional pública</em>.",
  lede: "A EventOn organiza a jornada do participante antes, durante e após cada evento.",
  paragrafos: [
    "Do recebimento das credenciais à validação do certificado, a Plataforma centraliza os principais pontos de contato entre o Grupo NTC, os docentes, os participantes e as instituições contratantes — em um ambiente institucional próprio, sem expor a experiência do participante a plataformas públicas dispersas.",
    "Operada pelo Instituto NTC do Brasil, a Plataforma foi desenhada para a realidade institucional brasileira: formação de servidores, registro de presença, certificação validável e atendimento humano dedicado a cada etapa.",
  ],
};

/* ------------------------------------------------------------ RECURSOS */

export interface RecursoEventOn {
  num: string;
  /** innerHTML do <svg viewBox="0 0 48 48"> do protótipo. */
  iconeSvgInner: string;
  titulo: string;
  texto: string;
  meta: string;
}

export const recursosEventOn: CabecalhoSecao & { itens: RecursoEventOn[] } = {
  eyebrow: "Recursos da Plataforma",
  tituloHtml:
    "Seis funcionalidades essenciais que entregam a <em>experiência institucional</em>",
  intro:
    "Tudo no mesmo ambiente — o participante acessa o evento, baixa materiais e emite o certificado sem alternar entre plataformas externas.",
  itens: [
    {
      num: "Funcionalidade 01",
      iconeSvgInner:
        '<circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3" fill="currentColor"/><path d="M8 24c0-8.8 7.2-16 16-16M40 24c0 8.8-7.2 16-16 16"/>',
      titulo: "Acesso ao vivo",
      texto:
        "Sala protegida de transmissão com login institucional, controle de presença, interação com docentes e moderação editorial das perguntas dos participantes.",
      meta: "Transmissão ao vivo · controle de presença",
    },
    {
      num: "Funcionalidade 02",
      iconeSvgInner:
        '<rect x="6" y="10" width="36" height="26" rx="3"/><path d="M20 18l10 6-10 6V18z" fill="currentColor"/>',
      titulo: "Replay restrito",
      texto:
        "Conteúdo gravado disponível em prazo determinado para inscritos, com controle de acesso, restrição de compartilhamento, rastreamento individual e controle de visualizações.",
      meta: "Replay com prazo · acesso rastreado",
    },
    {
      num: "Funcionalidade 03",
      iconeSvgInner:
        '<rect x="8" y="6" width="32" height="36" rx="2"/><path d="M14 16h20M14 24h20M14 32h12"/><circle cx="34" cy="34" r="4" fill="currentColor"/>',
      titulo: "Certificação digital",
      texto:
        "Certificado em PDF institucional com código de validação e QR Code, emitido após o cumprimento dos requisitos do evento (presença mínima e conclusão dos módulos quando previstos).",
      meta: "QR Code validável · PDF institucional",
    },
    {
      num: "Funcionalidade 04",
      iconeSvgInner:
        '<path d="M10 8h22l8 8v24a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2z"/><path d="M30 8v10h10M16 26h16M16 32h16M16 20h8"/>',
      titulo: "Materiais de apoio",
      texto:
        "Slides, apostilas, normativos, leituras complementares e cases institucionais disponibilizados em formato PDF/Word para download direto na Área do Participante.",
      meta: "Slides · apostilas · normativos",
    },
    {
      num: "Funcionalidade 05",
      iconeSvgInner:
        '<circle cx="24" cy="16" r="7"/><path d="M10 40c0-8 6.3-14 14-14s14 6 14 14"/><circle cx="38" cy="14" r="3" fill="currentColor"/>',
      titulo: "Área do Participante",
      texto:
        "Hub individual com histórico de eventos, certificados emitidos, materiais baixados, próximas inscrições e gestão dos dados pessoais pelo próprio participante, conforme a LGPD.",
      meta: "Login institucional · histórico individual",
    },
    {
      num: "Funcionalidade 06",
      iconeSvgInner:
        '<path d="M6 12h36v22a2 2 0 01-2 2H22l-8 6v-6H8a2 2 0 01-2-2V12z"/><path d="M16 22h16M16 28h10"/>',
      titulo: "Suporte dedicado",
      texto:
        "Atendimento humano, direto e orientado à solução — pelo painel da Plataforma, e-mail e WhatsApp institucional — durante e após cada evento.",
      meta: "Suporte humano · painel + e-mail + WhatsApp",
    },
  ],
};

/* ---------------------------------------------------------------- TOUR */

export interface TelaEventOn {
  tag: string;
  titulo: string;
  texto: string;
  rodape: string;
}

export const tourEventOn: CabecalhoSecao & { telas: [TelaEventOn, TelaEventOn, TelaEventOn] } = {
  eyebrow: "Tour visual",
  tituloHtml: "Três <em>telas representativas</em> da Plataforma EventOn",
  intro:
    "Três telas ilustrativas da experiência. Interface completa apresentada no acesso institucional. Identidade visual Soberana 2026.",
  telas: [
    {
      tag: "Tela 01 · Sala de transmissão",
      titulo: "Acesso ao evento ao vivo",
      texto:
        "Player de vídeo institucional, chat moderado pelos coordenadores e painel de presença individual em tempo real.",
      rodape: "Sala protegida com login institucional",
    },
    {
      tag: "Tela 02 · Área do Participante",
      titulo: "Painel individual do servidor",
      texto:
        "Sidebar de navegação com histórico, certificados, próximas inscrições, materiais e dados pessoais. Cards de eventos com barra de progresso.",
      rodape: "Login institucional com CPF e senha",
    },
    {
      tag: "Tela 03 · Certificado digital",
      titulo: "Validação por QR Code institucional",
      texto:
        "PDF institucional do Instituto NTC do Brasil com código de validação e QR Code que direciona para a página pública de autenticação.",
      rodape: "Página pública de autenticação institucional",
    },
  ],
};

/* ------------------------------------------------------- COMO FUNCIONA */

export interface PassoEventOn {
  titulo: string;
  texto: string;
  prazo: string;
}

export const processoEventOn: CabecalhoSecao & { passos: PassoEventOn[] } = {
  eyebrow: "Como funciona",
  tituloHtml: "Quatro passos do <em>participante</em>",
  intro: "Da inscrição ao certificado, sem precisar sair do ambiente da Plataforma EventOn.",
  passos: [
    {
      titulo: "Credenciais",
      texto:
        "Após inscrição no evento (individual ou em grupo), o participante recebe e-mail institucional com login, senha e link de acesso à Plataforma EventOn.",
      prazo: "Prazo · até 24h após confirmação",
    },
    {
      titulo: "Acesso ao evento",
      texto:
        "Login institucional na sala de transmissão ao vivo, com controle de presença automático e chat moderado para interação com docentes e curadoria.",
      prazo: "Disponível · 30min antes do evento",
    },
    {
      titulo: "Conteúdo e materiais",
      texto:
        "Replay disponível em prazo determinado para inscritos, materiais de apoio (slides, apostilas, normativos) prontos para download na Área do Participante.",
      prazo: "Replay · 7 a 30 dias após evento",
    },
    {
      titulo: "Certificado",
      texto:
        "Cumpridos os requisitos (presença mínima, conclusão dos módulos), emissão automática do certificado digital validável por QR Code institucional.",
      prazo: "Emissão · até 5 dias úteis após evento",
    },
  ],
};

/* ------------------------------------------------------------ PARALLAX */

export const parallaxEventOn = {
  eyebrow: "Um ambiente, todos os recursos",
  tituloHtml:
    "O participante <strong>não navega entre plataformas</strong> — acessa o evento, baixa materiais, emite certificado e fala com suporte no mesmo ambiente da Plataforma EventOn.",
};

/* ------------------------------------------------------------- VITRINE */

export interface CardVerticalEventOn {
  vertical: string;
  eyebrow: string;
  titulo: string;
  texto: string;
  metaHtml: string;
  link: LinkEventOn;
}

export const vitrineEventOn: CabecalhoSecao & { cards: CardVerticalEventOn[] } = {
  eyebrow: "Aplicações por área estratégica",
  tituloHtml: "A mesma plataforma, <em>aplicada às áreas estratégicas do Grupo NTC</em>.",
  intro:
    "Educação, Gestão Pública, Contratações Públicas e Saúde contam com agendas, trilhas e formatos próprios operados no ambiente EventOn.",
  cards: [
    {
      vertical: "educacao",
      eyebrow: "NTC Educação",
      titulo: "Educação",
      texto:
        "Seminários, oficinas e cursos executivos sobre alfabetização, gestão escolar, educação digital, primeira infância, ensino médio e políticas educacionais.",
      metaHtml: "9 programas · <strong>PEAR · EDUTEC · PROGE · PEI · EGIDE</strong>",
      link: {
        texto: "Conhecer NTC Educação",
        href: "/solucoes-estrategicas/educacao",
        cmsLink: "vertical-edu",
        track: "eo_vitrine_edu",
      },
    },
    {
      vertical: "gestao-publica",
      eyebrow: "NTC Gestão Pública",
      titulo: "Gestão Pública",
      texto:
        "Jornadas executivas em liderança institucional, governança, modernização administrativa e direção estratégica do Estado brasileiro.",
      metaHtml: "3 programas · <strong>LIDERA · SIGA · AGIP</strong>",
      link: {
        texto: "Conhecer NTC Gestão Pública",
        href: "/solucoes-estrategicas/gestao-publica",
        cmsLink: "vertical-gov",
        track: "eo_vitrine_gov",
      },
    },
    {
      vertical: "contratacoes",
      eyebrow: "Núcleo Contratações · Frente NTC GP",
      titulo: "Contratações Públicas",
      texto:
        "Capacitação técnica em Lei 14.133/2021, licitações, contratos administrativos, controle externo, concessões, PPPs, obras e gestão contratual.",
      metaHtml: "Programa · <strong>AGIP</strong> · Núcleo Contratações",
      link: {
        texto: "Conhecer AGIP · Núcleo Contratações",
        href: "/programas/agip",
        cmsLink: "programa-AGIP",
        track: "eo_vitrine_cp",
      },
    },
    {
      vertical: "saude",
      eyebrow: "NTC Saúde",
      titulo: "Saúde",
      texto:
        "Formações em governança do SUS, atenção primária, redes de cuidado, saúde digital, financiamento e direção institucional em saúde pública.",
      metaHtml: "3 programas · <strong>SIGS · PROAPS+ · PROSUS+</strong>",
      link: {
        texto: "Conhecer NTC Saúde",
        href: "/solucoes-estrategicas/saude",
        cmsLink: "vertical-sau",
        track: "eo_vitrine_sau",
      },
    },
  ],
};

/* ------------------------------------------------------------- SUPORTE */

export interface CanalEventOn {
  titulo: string;
  textoHtml: string;
  sla: string;
}

export const suporteEventOn = {
  eyebrow: "Suporte ao participante",
  tituloHtml: "Atendimento humano, <em>direto e orientado à solução</em>.",
  texto:
    "O suporte ao participante da Plataforma EventOn é prestado por equipe dedicada do Instituto NTC do Brasil — com encaminhamento direto à área responsável e acompanhamento até a resolução. Disponível durante a transmissão ao vivo e nas horas posteriores ao encerramento de cada evento.",
  canais: [
    {
      titulo: "Painel da Plataforma",
      textoHtml:
        "Botão de \"Suporte\" disponível em todas as telas após o login institucional do participante.",
      sla: "Resposta · em minutos durante o evento",
    },
    {
      titulo: "E-mail institucional",
      textoHtml:
        '<strong style="color: var(--pergaminho);">suporte@institutontc.com.br</strong> · canal escrito com registro.',
      sla: "Retorno · até 4h úteis",
    },
    {
      titulo: "WhatsApp institucional",
      textoHtml:
        '<strong style="color: var(--pergaminho);">(63) 98444-4040</strong> · canal direto da equipe NTC.',
      sla: "Resposta rápida · horário comercial",
    },
    {
      titulo: "Atendimento institucional (órgãos)",
      textoHtml:
        "Equipe comercial dedicada a coordenadores de turmas in company e fechadas.",
      sla: "Encaminhamento · prioritário",
    },
  ] satisfies CanalEventOn[],
};

/* ------------------------------------------------- ÁREA DO PARTICIPANTE */

// TODO: trocar pelo link da Área do Participante na plataforma EventOn,
// quando o PO informar. Até lá aponta para o /contato (aba Atendimento).
const HREF_ACESSO = "/contato?categoria=area-participante#tab-atendimento";

export const areaEventOn = {
  eyebrow: "Área do Participante",
  tituloHtml: "Seu histórico institucional, <em>em um só lugar</em>.",
  paragrafos: [
    "Login institucional com CPF e senha cadastrada. A Área do Participante reúne o histórico completo de eventos, certificados emitidos, materiais baixados, próximas inscrições e dados pessoais (com gestão LGPD pelo próprio participante).",
    "O acesso é dedicado a quem participou de pelo menos um evento na Plataforma EventOn. Para primeira inscrição, a Área do Participante é criada automaticamente após a confirmação.",
  ],
  acoes: [
    {
      texto: "Acessar Área do Participante",
      href: HREF_ACESSO,
      cmsLink: "acesso-area-participante",
      track: "eo_area_acesso",
      classe: "btn btn--gold",
      seta: true,
    },
  ] satisfies LinkEventOn[],
  aside: {
    eyebrow: "O que você encontra na Área",
    titulo: "Hub institucional do participante",
    itens: [
      "Histórico completo de eventos com data, formato e carga horária",
      "Certificados emitidos · download em PDF + página pública de validação",
      "Materiais de apoio · slides, apostilas, normativos por evento",
      "Próximas inscrições · agenda confirmada e em formação",
      "Replays disponíveis dentro do prazo institucional",
      "Acesso, atualização e solicitações dos dados pessoais pelo próprio participante, conforme a LGPD",
      "Canal direto com a equipe de suporte da Plataforma",
    ],
  },
};

/* ----------------------------------------------------------------- FAQ */

export interface ItemFaqEventOn {
  id: string;
  pergunta: string;
  respostaHtml: string;
  abertoInicial?: boolean;
}

export const faqEventOn = {
  eyebrow: "Dúvidas frequentes",
  tituloHtml: "Perguntas <em>frequentes</em>",
  itens: [
    {
      id: "faq-1",
      abertoInicial: true,
      pergunta: "Como recebo o acesso à Plataforma EventOn?",
      respostaHtml:
        "<p>Após a confirmação da inscrição (individual ou em grupo institucional), você recebe em até <strong>24 horas</strong> um e-mail institucional com login (CPF), senha provisória e link de acesso à Plataforma EventOn. A primeira entrada solicita a troca da senha provisória por uma definitiva escolhida por você.</p><p>Para turmas in company, o coordenador da instituição contratante recebe as credenciais consolidadas para distribuição interna.</p>",
    },
    {
      id: "faq-2",
      pergunta: "Por quanto tempo o replay fica disponível?",
      respostaHtml:
        "<p>O prazo de disponibilidade do replay varia conforme o evento — em geral entre <strong>7 e 30 dias após o encerramento</strong>. O prazo específico é informado no e-mail de confirmação da inscrição e na própria Plataforma.</p><p>O replay é protegido contra cópia, rastreado por acesso individual e exclusivo aos inscritos. Não há liberação pública após o evento.</p>",
    },
    {
      id: "faq-3",
      pergunta: "Como funciona a emissão do certificado?",
      respostaHtml:
        "<p>O certificado é emitido automaticamente em até <strong>5 dias úteis</strong> após o encerramento do evento, desde que cumpridos os requisitos (presença mínima na transmissão ao vivo ou conclusão do replay + módulos avaliativos quando previstos).</p><p>O documento é entregue em PDF institucional do Instituto NTC do Brasil, com código de validação e QR Code que direcionam para a página pública de autenticação, e fica disponível para download na Área do Participante.</p>",
    },
    {
      id: "faq-4",
      pergunta: "O certificado é validável por terceiros?",
      respostaHtml:
        "<p>Sim. O código QR impresso no certificado direciona para uma página pública de validação institucional do Grupo NTC, onde qualquer pessoa pode confirmar a autenticidade do documento — nome do participante, evento, carga horária, data e número de registro.</p><p>Esse mecanismo atende requisitos institucionais comuns em órgãos públicos para validação de certificados em progressões funcionais e processos seletivos internos.</p>",
    },
    {
      id: "faq-5",
      pergunta: "Esqueci minha senha. Como recupero o acesso?",
      respostaHtml:
        "<p>Na tela de login da Plataforma EventOn, clique em \"Esqueci minha senha\" e informe o CPF cadastrado. Você receberá um e-mail institucional com instrução de redefinição em até <strong>15 minutos</strong>.</p><p>Se o e-mail cadastrado não estiver mais ativo, entre em contato com o suporte por WhatsApp ou e-mail (<strong>suporte@institutontc.com.br</strong>) para atendimento personalizado.</p>",
    },
    {
      id: "faq-6",
      pergunta: "Posso baixar os materiais antes do evento?",
      respostaHtml:
        "<p>Os materiais são disponibilizados na Área do Participante <strong>conforme o cronograma editorial do evento</strong>. Materiais preparatórios costumam estar disponíveis 24-48 horas antes; materiais complementares e cases ficam liberados durante e após o evento.</p><p>Em formações in company e turmas fechadas, o cronograma de liberação pode ser customizado conforme combinado com a instituição contratante.</p>",
    },
    {
      id: "faq-7",
      pergunta: "Como funciona o suporte ao participante?",
      respostaHtml:
        "<p>O suporte da Plataforma EventOn é <strong>humano, direto e orientado à solução</strong>, prestado pela equipe dedicada do Instituto NTC do Brasil. Durante eventos ao vivo há equipe de plantão para responder dúvidas em minutos pelo painel da Plataforma.</p><p>Em horário comercial, o atendimento humano segue disponível pelo painel, e-mail (<strong>suporte@institutontc.com.br</strong>) e WhatsApp institucional <strong>(63) 98444-4040</strong>.</p>",
    },
    {
      id: "faq-8",
      pergunta: "Como meus dados pessoais são tratados (LGPD)?",
      respostaHtml:
        "<p>Os dados pessoais cadastrados na Plataforma EventOn são tratados conforme a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018), com finalidade declarada (inscrição, certificação, suporte), retenção pelo período necessário ao vínculo institucional e nunca compartilhados com terceiros sem consentimento explícito.</p><p>Na Área do Participante, o próprio participante realiza o acesso, a atualização e as solicitações relacionadas aos seus dados pessoais (exportação ou exclusão), conforme a LGPD. O Encarregado de Dados (DPO) do Instituto NTC do Brasil é <strong>dpo@institutontc.com.br</strong>.</p>",
    },
  ] satisfies ItemFaqEventOn[],
};

/* ----------------------------------------------------------- CTA FINAL */

export const ctaFinalEventOn = {
  eyebrow: "Próximo passo institucional",
  tituloHtml: "Acesse a Plataforma EventOn <em>ou conheça a agenda</em>.",
  texto:
    "Já tem evento confirmado? Acesse direto a Área do Participante. Quer conhecer a agenda completa do Grupo NTC ou contratar uma turma in company para a sua instituição? Os caminhos estão a um clique.",
  acoes: [
    {
      texto: "Acessar Área do Participante",
      href: "#area-participante",
      cmsLink: "area-participante",
      track: "eo_cta_final_area",
      classe: "btn btn--gold",
      seta: true,
    },
    {
      texto: "Ver Agenda Geral NTC",
      href: "/agenda",
      cmsLink: "agenda-completa",
      track: "eo_cta_final_agenda",
      classe: "btn btn--ghost-light",
    },
    {
      texto: "Contratação institucional",
      href: "/solucoes",
      cmsLink: "pagina-solucoes",
      track: "eo_cta_final_solucoes",
      classe: "btn btn--ghost-light",
    },
  ] satisfies LinkEventOn[],
};

/* ---------------------------------------------------------- STICKY CTA */

export const stickyCtaEventOn: LinkEventOn = {
  texto: "Acessar Área do Participante",
  href: "#area-participante",
  cmsLink: "sticky-cta-area-participante",
  track: "sticky_cta_area_participante",
  classe: "btn btn--gold",
  seta: true,
};
