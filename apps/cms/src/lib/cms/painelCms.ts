import "server-only";

import { obterPayload } from "@/lib/payloadClient";
import { lexicalParaTexto, lexicalToHtml } from "@/lib/cms/lexical";

/**
 * Leitura de dados reais para o Painel Admin (rota /).
 *
 * SOMENTE LEITURA. Usa a Local API do Payload (mesma de payloadClient.ts) para
 * listar Eventos e Especialistas direto do Postgres, incluindo rascunhos —
 * porque o CMS mostra o status (publicado/rascunho). Não escreve nada, não
 * toca uploads, não altera schema. server-only para nunca vazar ao browser.
 *
 * Mapeia o schema real (apps/cms/src/collections/Eventos.ts e
 * Especialistas.ts) para tipos enxutos que as telas do painel consomem.
 */

export type StatusCms = "publicado" | "rascunho";

/**
 * Converte "YYYY-MM-DD" em Date no meio-dia local, evitando o shift de
 * timezone que `new Date("YYYY-MM-DD")` causa (interpreta como UTC 00:00,
 * o que em Brasília vira o dia anterior).
 */
function parseDateLocal(iso: string): Date {
  // O banco retorna "YYYY-MM-DDTHH:mm:ss.sssZ" ou "YYYY-MM-DD".
  // Extrai apenas os 10 primeiros caracteres para evitar shift de timezone UTC.
  const ymd = iso.slice(0, 10); // "YYYY-MM-DD"
  const [yStr, mStr, dStr] = ymd.split("-");
  return new Date(Number(yStr ?? 2026), (Number(mStr ?? 1) - 1), Number(dStr ?? 1), 12, 0, 0);
}

export interface EventoCmsResumo {
  id: string;
  titulo: string;
  programa: string | null;
  data: string;
  local: string;
  modalidade: string;
  status: StatusCms;
}

export interface PalestranteCmsResumo {
  id: string;
  nome: string;
  iniciais: string;
  titulacao: string;
  instituicao: string;
  vertical: string | null;
  temFoto: boolean;
  /** URL da foto vinculada (miniatura na listagem), ou null se sem foto. */
  fotoUrl: string | null;
  /** true → especialista não aparece em nenhuma página pública do site. */
  ocultarDoSite: boolean;
}

// ---- Tipos de detalhe (tela cheia, somente leitura) --------------------

export interface EventoCmsDetalhe extends EventoCmsResumo {
  eyebrow: string | null;
  area: string | null;
  cargaHoraria: string | null;
  capaUrl: string | null;
  /** Capa: nome de exibição (filename da Media) para o painel de edição. */
  capaNome: string | null;
  /** Folder PDF: nome de exibição, ou null se não houver. */
  folderPdfNome: string | null;
  /** Data de início em ISO (yyyy-mm-dd) para o input type=date do editor. */
  dataInicioISO: string | null;
  resumo: string | null;
  /** HTML já convertido do Lexical (lib/cms/lexical.ts). */
  publicoAlvoHtml: string;
  objetivosHtml: string;
  conteudoProgramaticoHtml: string;
  valor: string | null;
  inscricaoAberta: boolean;
  linkInscricao: string | null;
  palestrantes: { id: string; nome: string; iniciais: string; titulacao: string }[];
  faq: { pergunta: string; respostaHtml: string }[];
  // ---- valores brutos/planos para o modo de edição completa ----
  /** Valor bruto do select ("online" | "presencial" | "hibrido"), ou null. */
  modalidadeValor: string | null;
  dataFimISO: string | null;
  localNome: string | null;
  localEndereco: string | null;
  localCidade: string | null;
  localEstado: string | null;
  /** Textos planos dos richTexts (linhas; itens de lista com "- "). */
  publicoAlvoTexto: string;
  objetivosTexto: string;
  conteudoProgramaticoTexto: string;
  programacaoDetalhada: { horario: string; titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  faqEditavel: { pergunta: string; respostaTexto: string }[];
  replayDisponivel: boolean;
  prazoReplay: string | null;
}

// ---- Leads (somente leitura, doc 11 §11) -------------------------------

export type LeadTipoCms = "proposta" | "contato" | "newsletter" | "candidatura";

export interface LeadCmsResumo {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  tipo: LeadTipoCms;
  status: string;
  /** Data de entrada formatada pt-BR. */
  data: string;
  /** ISO de createdAt, para ordenação/uso futuro. */
  dataISO: string;
}

export interface LeadCmsDetalhe extends LeadCmsResumo {
  telefone: string | null;
  cargo: string | null;
  esfera: string | null;
  observacoesInternas: string | null;
  /** Pares rótulo→valor específicos do tipo (proposta/contato/newsletter/candidatura). */
  detalhes: { rotulo: string; valor: string }[];
  origem: { rotulo: string; valor: string }[];
  consentimento: {
    aceito: boolean;
    timestamp: string | null;
    politicaVersao: string | null;
    ipSubmissao: string | null;
  };
  /** Currículo anexado (só candidatura), nome + URL, ou null. */
  curriculo: { nome: string; url: string } | null;
}

export interface PalestranteCmsDetalhe extends PalestranteCmsResumo {
  cargoAtual: string | null;
  curriculoCurtoHtml: string;
  curriculoCompletoHtml: string;
  linkLattes: string | null;
  linkLinkedin: string | null;
  linhasAtuacao: string[];
  tipo: string | null;
}

const FMT_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const FMT_DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function iniciaisDe(nome: string): string {
  const partes = nome
    .replace(/^(Dr|Dra|Prof|Profa|Sr|Sra)\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

/** Deriva o status legível: publicado ou rascunho, conforme _status do Payload. */
function statusEvento(doc: { _status?: string }): StatusCms {
  return doc._status === "published" ? "publicado" : "rascunho";
}

function montarLocal(local: unknown, modalidade: string): string {
  if (modalidade === "online") return "Transmissão online";
  const g = (local ?? {}) as { cidade?: string; estado?: string; nomeLocal?: string };
  const cidadeUf = [g.cidade, g.estado].filter(Boolean).join(" · ");
  return cidadeUf || g.nomeLocal || "Local a definir";
}

export async function listarEventosCms(): Promise<EventoCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "eventos",
    depth: 1,
    limit: 100,
    draft: true,
    sort: "-dataInicio",
  });

  return res.docs.map((d) => {
    const doc = d as unknown as {
      id: string | number;
      nome?: string;
      dataInicio?: string | null;
      modalidade?: string;
      local?: unknown;
      programa?: unknown;
      _status?: string;
    };
    const programa =
      typeof doc.programa === "object" && doc.programa !== null
        ? ((doc.programa as { sigla?: string; nome?: string }).sigla ??
          (doc.programa as { nome?: string }).nome ??
          null)
        : null;
    const modalidade = doc.modalidade ?? "";
    return {
      id: String(doc.id),
      titulo: doc.nome ?? "(sem título)",
      programa,
      data: doc.dataInicio ? FMT_DATA.format(parseDateLocal(doc.dataInicio)) : "—",
      local: montarLocal(doc.local, modalidade),
      modalidade: modalidade ? modalidade.charAt(0).toUpperCase() + modalidade.slice(1) : "—",
      status: statusEvento(doc),
    };
  });
}

export async function listarPalestrantesCms(): Promise<PalestranteCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "especialistas",
    depth: 1,
    limit: 200,
    draft: true,
    sort: "nome",
  });

  return res.docs.map((d) => {
    const doc = d as unknown as {
      id: string | number;
      nome?: string;
      titulacao?: string;
      instituicao?: string;
      vertical?: string | null;
      foto?: unknown;
      ocultarDoSite?: boolean | null;
    };
    const nome = doc.nome ?? "(sem nome)";
    const fotoUrl = urlDeMidia(doc.foto);
    return {
      id: String(doc.id),
      nome,
      iniciais: iniciaisDe(nome),
      titulacao: doc.titulacao ?? "—",
      instituicao: doc.instituicao ?? "—",
      vertical: doc.vertical ?? null,
      temFoto: Boolean(fotoUrl),
      fotoUrl,
      ocultarDoSite: Boolean(doc.ocultarDoSite),
    };
  });
}

// ============================================================
// Detalhe (somente leitura, depth: 2 para resolver relações)
// ============================================================

/** URL de um upload de Media resolvido (depth>=1); "" se não resolvido. */
function urlDeMidia(m: unknown): string | null {
  if (typeof m === "object" && m !== null) {
    const url = (m as { url?: string }).url;
    return url ?? null;
  }
  return null;
}

/** Nome de exibição de uma Media resolvida (filename), ou null. */
function nomeDeMidia(m: unknown): string | null {
  if (typeof m === "object" && m !== null) {
    const obj = m as { filename?: string; alt?: string };
    return obj.filename ?? obj.alt ?? null;
  }
  return null;
}

/** Nome de uma relação resolvida (ex. area, programa) por uma chave preferida. */
function nomeDeRelacao(rel: unknown, chave: "nome" | "sigla" | "titulo" = "nome"): string | null {
  if (typeof rel === "object" && rel !== null) {
    const obj = rel as Record<string, unknown>;
    const v = obj[chave] ?? obj.nome ?? obj.titulo;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export async function obterEventoCms(id: string): Promise<EventoCmsDetalhe | null> {
  const payload = await obterPayload();
  const doc = (await payload
    .findByID({ collection: "eventos", id, depth: 2, draft: true })
    .catch(() => null)) as Record<string, unknown> | null;
  if (!doc) return null;

  const d = doc as unknown as {
    id: string | number;
    nome?: string;
    eyebrow?: string;
    dataInicio?: string | null;
    modalidade?: string;
    local?: unknown;
    programa?: unknown;
    area?: unknown;
    cargaHoraria?: string;
    imagemCapa?: unknown;
    folderPdf?: unknown;
    resumo?: string;
    publicoAlvo?: unknown;
    objetivos?: unknown;
    conteudoProgramatico?: unknown;
    valor?: string;
    inscricaoAberta?: boolean;
    linkInscricaoExterna?: string;
    palestrantes?: unknown[];
    faq?: { pergunta?: string; resposta?: unknown }[];
    dataFim?: string | null;
    programacaoDetalhada?: { horario?: string; titulo?: string; descricao?: string }[];
    diferenciais?: { titulo?: string; descricao?: string }[];
    replayDisponivel?: boolean;
    prazoReplay?: string;
    _status?: string;
  };

  const modalidade = d.modalidade ?? "";
  const grupoLocal = (d.local ?? {}) as {
    nomeLocal?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  const palestrantes = (d.palestrantes ?? [])
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .map((p) => {
      const nome = (p.nome as string) ?? "(sem nome)";
      return {
        id: String(p.id),
        nome,
        iniciais: iniciaisDe(nome),
        titulacao: (p.titulacao as string) ?? "—",
      };
    });

  return {
    id: String(d.id),
    titulo: d.nome ?? "(sem título)",
    eyebrow: d.eyebrow ?? null,
    programa: nomeDeRelacao(d.programa, "sigla"),
    area: nomeDeRelacao(d.area),
    data: d.dataInicio ? FMT_DATA.format(parseDateLocal(d.dataInicio)) : "—",
    local: montarLocal(d.local, modalidade),
    modalidade: modalidade ? modalidade.charAt(0).toUpperCase() + modalidade.slice(1) : "—",
    cargaHoraria: d.cargaHoraria ?? null,
    capaUrl: urlDeMidia(d.imagemCapa),
    capaNome: nomeDeMidia(d.imagemCapa),
    folderPdfNome: nomeDeMidia(d.folderPdf),
    dataInicioISO: d.dataInicio ? d.dataInicio.slice(0, 10) : null,
    resumo: d.resumo ?? null,
    publicoAlvoHtml: lexicalToHtml(d.publicoAlvo),
    objetivosHtml: lexicalToHtml(d.objetivos),
    conteudoProgramaticoHtml: lexicalToHtml(d.conteudoProgramatico),
    valor: d.valor ?? null,
    inscricaoAberta: Boolean(d.inscricaoAberta),
    linkInscricao: d.linkInscricaoExterna ?? null,
    palestrantes,
    faq: (d.faq ?? [])
      .filter((f) => f?.pergunta)
      .map((f) => ({ pergunta: f.pergunta as string, respostaHtml: lexicalToHtml(f.resposta) })),
    status: statusEvento(d),
    modalidadeValor: d.modalidade ?? null,
    dataFimISO: d.dataFim ? d.dataFim.slice(0, 10) : null,
    localNome: grupoLocal.nomeLocal ?? null,
    localEndereco: grupoLocal.endereco ?? null,
    localCidade: grupoLocal.cidade ?? null,
    localEstado: grupoLocal.estado ?? null,
    publicoAlvoTexto: lexicalParaTexto(d.publicoAlvo),
    objetivosTexto: lexicalParaTexto(d.objetivos),
    conteudoProgramaticoTexto: lexicalParaTexto(d.conteudoProgramatico),
    programacaoDetalhada: (d.programacaoDetalhada ?? []).map((p) => ({
      horario: p.horario ?? "",
      titulo: p.titulo ?? "",
      descricao: p.descricao ?? "",
    })),
    diferenciais: (d.diferenciais ?? []).map((df) => ({
      titulo: df.titulo ?? "",
      descricao: df.descricao ?? "",
    })),
    faqEditavel: (d.faq ?? [])
      .filter((f) => f?.pergunta)
      .map((f) => ({ pergunta: f.pergunta as string, respostaTexto: lexicalParaTexto(f.resposta) })),
    replayDisponivel: Boolean(d.replayDisponivel),
    // Campo date no schema — mantém só o ISO yyyy-mm-dd para o input type=date.
    prazoReplay: d.prazoReplay ? d.prazoReplay.slice(0, 10) : null,
  };
}

/** Ids dos eventos atualmente em destaque na Home (Global home). */
export async function obterEventosHomeIds(): Promise<string[]> {
  const payload = await obterPayload();
  const home = (await payload
    .findGlobal({ slug: "home", depth: 0, draft: true })
    .catch(() => null)) as { eventosAgendaDestaque?: unknown[] } | null;
  const lista = home?.eventosAgendaDestaque ?? [];
  return lista
    .map((e) => (typeof e === "object" && e !== null ? (e as { id?: unknown }).id : e))
    .filter((v): v is string | number => v !== null && v !== undefined)
    .map((v) => String(v));
}

export async function obterPalestranteCms(id: string): Promise<PalestranteCmsDetalhe | null> {
  const payload = await obterPayload();
  const doc = (await payload
    .findByID({ collection: "especialistas", id, depth: 2, draft: true })
    .catch(() => null)) as Record<string, unknown> | null;
  if (!doc) return null;

  const d = doc as unknown as {
    id: string | number;
    nome?: string;
    titulacao?: string;
    instituicao?: string;
    cargoAtual?: string;
    vertical?: string | null;
    tipo?: string;
    foto?: unknown;
    ocultarDoSite?: boolean | null;
    curriculoCurto?: unknown;
    curriculoCompleto?: unknown;
    linkLattes?: string;
    linkLinkedin?: string;
    linhasAtuacao?: unknown[];
  };

  const nome = d.nome ?? "(sem nome)";
  const fotoUrl = urlDeMidia(d.foto);
  const linhasAtuacao = (d.linhasAtuacao ?? [])
    .map((a) => nomeDeRelacao(a))
    .filter((s): s is string => Boolean(s));

  return {
    id: String(d.id),
    nome,
    iniciais: iniciaisDe(nome),
    titulacao: d.titulacao ?? "—",
    instituicao: d.instituicao ?? "—",
    cargoAtual: d.cargoAtual ?? null,
    vertical: d.vertical ?? null,
    tipo: d.tipo ?? null,
    temFoto: Boolean(fotoUrl),
    fotoUrl,
    ocultarDoSite: Boolean(d.ocultarDoSite),
    curriculoCurtoHtml: lexicalToHtml(d.curriculoCurto),
    curriculoCompletoHtml: lexicalToHtml(d.curriculoCompleto),
    linkLattes: d.linkLattes ?? null,
    linkLinkedin: d.linkLinkedin ?? null,
    linhasAtuacao,
  };
}

// ============================================================
// Leads (somente leitura — triagem comercial no painel)
// ============================================================

const TIPOS_VALIDOS: LeadTipoCms[] = ["proposta", "contato", "newsletter", "candidatura"];

function normalizarTipo(t: unknown): LeadTipoCms {
  return TIPOS_VALIDOS.includes(t as LeadTipoCms) ? (t as LeadTipoCms) : "contato";
}

/** Acrescenta um par rótulo→valor à lista quando o valor existe e não é vazio. */
function adicionarPar(
  lista: { rotulo: string; valor: string }[],
  rotulo: string,
  valor: unknown,
): void {
  if (valor === null || valor === undefined) return;
  const s = typeof valor === "string" ? valor : String(valor);
  if (s.trim() === "") return;
  lista.push({ rotulo, valor: s });
}

/** Nomes de uma relação hasMany resolvida (ex. áreas de interesse), juntos por vírgula. */
function nomesDeRelacoes(rels: unknown): string {
  if (!Array.isArray(rels)) return "";
  return rels
    .map((r) => nomeDeRelacao(r))
    .filter((s): s is string => Boolean(s))
    .join(", ");
}

export async function listarLeadsCms(): Promise<LeadCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "leads",
    depth: 0,
    limit: 300,
    sort: "-createdAt",
  });

  return res.docs.map((d) => {
    const doc = d as unknown as {
      id: string | number;
      nome?: string;
      email?: string;
      instituicao?: string;
      tipo?: string;
      status?: string;
      createdAt?: string;
    };
    return {
      id: String(doc.id),
      nome: doc.nome ?? "—",
      email: doc.email ?? "—",
      instituicao: doc.instituicao || "—",
      tipo: normalizarTipo(doc.tipo),
      status: doc.status ?? "novo",
      data: doc.createdAt ? FMT_DATA.format(new Date(doc.createdAt)) : "—",
      dataISO: doc.createdAt ?? "",
    };
  });
}

export async function obterLeadCms(id: string): Promise<LeadCmsDetalhe | null> {
  const payload = await obterPayload();
  const doc = (await payload
    .findByID({ collection: "leads", id, depth: 1 })
    .catch(() => null)) as Record<string, unknown> | null;
  if (!doc) return null;

  const d = doc as unknown as {
    id: string | number;
    nome?: string;
    email?: string;
    telefone?: string;
    cargo?: string;
    instituicao?: string;
    esfera?: string;
    tipo?: string;
    status?: string;
    observacoesInternas?: string;
    createdAt?: string;
    detalhesProposta?: {
      programa?: unknown;
      modalidade?: string;
      participantesEstimados?: number;
      mensagem?: string;
    };
    detalhesContato?: { assunto?: string; mensagem?: string };
    detalhesNewsletter?: { areasInteresse?: unknown };
    detalhesCandidatura?: {
      titulacao?: string;
      linhasAtuacao?: unknown;
      apresentacao?: string;
      linkLattes?: string;
      linkLinkedin?: string;
      curriculo?: unknown;
    };
    origem?: Record<string, unknown>;
    consentimentoLgpd?: {
      aceito?: boolean;
      timestamp?: string;
      politicaVersao?: string;
      ipSubmissao?: string;
    };
  };

  const tipo = normalizarTipo(d.tipo);

  const detalhes: { rotulo: string; valor: string }[] = [];
  if (tipo === "proposta" && d.detalhesProposta) {
    const p = d.detalhesProposta;
    adicionarPar(detalhes, "Programa", nomeDeRelacao(p.programa, "sigla"));
    adicionarPar(detalhes, "Modalidade", p.modalidade);
    adicionarPar(detalhes, "Participantes estimados", p.participantesEstimados);
    adicionarPar(detalhes, "Mensagem", p.mensagem);
  } else if (tipo === "contato" && d.detalhesContato) {
    adicionarPar(detalhes, "Assunto", d.detalhesContato.assunto);
    adicionarPar(detalhes, "Mensagem", d.detalhesContato.mensagem);
  } else if (tipo === "newsletter" && d.detalhesNewsletter) {
    adicionarPar(detalhes, "Áreas de interesse", nomesDeRelacoes(d.detalhesNewsletter.areasInteresse));
  } else if (tipo === "candidatura" && d.detalhesCandidatura) {
    const c = d.detalhesCandidatura;
    adicionarPar(detalhes, "Titulação", c.titulacao);
    adicionarPar(detalhes, "Linhas de atuação", nomesDeRelacoes(c.linhasAtuacao));
    adicionarPar(detalhes, "Apresentação", c.apresentacao);
    adicionarPar(detalhes, "Lattes", c.linkLattes);
    adicionarPar(detalhes, "LinkedIn", c.linkLinkedin);
  }

  const origem: { rotulo: string; valor: string }[] = [];
  const og = d.origem ?? {};
  adicionarPar(origem, "Página", og.paginaSubmissao);
  adicionarPar(origem, "Referrer", og.referrer);
  adicionarPar(origem, "utm_source", og.utmSource);
  adicionarPar(origem, "utm_medium", og.utmMedium);
  adicionarPar(origem, "utm_campaign", og.utmCampaign);
  adicionarPar(origem, "utm_term", og.utmTerm);
  adicionarPar(origem, "utm_content", og.utmContent);

  const cv = d.detalhesCandidatura?.curriculo;
  const curriculo =
    typeof cv === "object" && cv !== null && (cv as { url?: string }).url
      ? {
          nome: nomeDeMidia(cv) ?? "Currículo",
          url: (cv as { url: string }).url,
        }
      : null;

  const cons = d.consentimentoLgpd ?? {};

  return {
    id: String(d.id),
    nome: d.nome ?? "—",
    email: d.email ?? "—",
    instituicao: d.instituicao || "—",
    tipo,
    status: d.status ?? "novo",
    data: d.createdAt ? FMT_DATA_HORA.format(new Date(d.createdAt)) : "—",
    dataISO: d.createdAt ?? "",
    telefone: d.telefone ?? null,
    cargo: d.cargo ?? null,
    esfera: d.esfera ?? null,
    observacoesInternas: d.observacoesInternas ?? null,
    detalhes,
    origem,
    consentimento: {
      aceito: Boolean(cons.aceito),
      timestamp: cons.timestamp ? FMT_DATA_HORA.format(new Date(cons.timestamp)) : null,
      politicaVersao: cons.politicaVersao ?? null,
      ipSubmissao: cons.ipSubmissao ?? null,
    },
    curriculo,
  };
}
