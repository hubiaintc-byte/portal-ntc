import "server-only";

import { rotuloCategoria, type ConteudoCategoria } from "@ntc/lib";

import { obterPayload } from "@/lib/payloadClient";
import { lexicalParaTexto, lexicalToHtml } from "@/lib/cms/lexical";
import { lexicalParaMarkdown } from "@/lib/markdownLexical";

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
  /** Data de entrada formatada pt-BR. */
  data: string;
  /** ISO de createdAt, para ordenação/uso futuro. */
  dataISO: string;
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
      createdAt?: string;
    };
    return {
      id: String(doc.id),
      nome: doc.nome ?? "—",
      email: doc.email ?? "—",
      instituicao: doc.instituicao || "—",
      tipo: normalizarTipo(doc.tipo),
      data: doc.createdAt ? FMT_DATA.format(new Date(doc.createdAt)) : "—",
      dataISO: doc.createdAt ?? "",
    };
  });
}

// ============================================================
// Conteúdos editoriais (leitura para lista e detalhe do painel)
// ============================================================

export type SituacaoConteudo = "publicado" | "rascunho" | "em-preparacao";

export interface ConteudoCmsResumo {
  id: string;
  titulo: string;
  categoria: ConteudoCategoria;
  categoriaRotulo: string;
  /** Nome da área vinculada, ou "Transversal" quando o conteúdo não tem área. */
  vertical: string;
  dataISO: string | null;
  situacao: SituacaoConteudo;
  destaque: boolean;
}

export interface ConteudoCmsDetalhe extends ConteudoCmsResumo {
  slug: string;
  lide: string;
  /** Corpo já convertido de Lexical para Markdown leve, pronto para o textarea do editor. */
  corpoMarkdown: string;
  assinatura: string;
  autorIds: string[];
  areaId: string | null;
  imagemDestaqueUrl: string | null;
  imagemDestaqueId: string | null;
  anexoId: string | null;
  anexoNome: string | null;
  linkExterno: string;
  anunciarEmPreparacao: boolean;
  seoTitulo: string;
  seoDescricao: string;
}

interface DocConteudo {
  id: string | number;
  titulo?: string;
  slug?: string;
  categoria?: string;
  area?: unknown;
  lide?: string;
  corpo?: unknown;
  assinatura?: string | null;
  autor?: unknown[];
  dataPublicacao?: string | null;
  destaque?: boolean | null;
  anunciarEmPreparacao?: boolean | null;
  imagemDestaque?: unknown;
  anexoDownload?: unknown;
  linkExterno?: string | null;
  seo?: { tituloSeo?: string | null; descricaoSeo?: string | null } | null;
  _status?: string;
}

/** Deriva a situação editorial: publicado, rascunho, ou rascunho "em preparação" anunciado no site. */
function situacaoDoConteudo(doc: DocConteudo): SituacaoConteudo {
  if (doc._status === "published") return "publicado";
  return doc.anunciarEmPreparacao ? "em-preparacao" : "rascunho";
}

/** Nome da área resolvida (depth: 1), ou "Transversal" quando o conteúdo não tem área. */
function verticalDoConteudo(area: unknown): string {
  return nomeDeRelacao(area) ?? "Transversal";
}

/** Id de uma relação que pode vir crua (número/string) ou resolvida ({ id }) conforme o depth. */
function idDaRelacao(valor: unknown): string | null {
  if (typeof valor === "number" || typeof valor === "string") return String(valor);
  if (typeof valor === "object" && valor !== null && "id" in valor) {
    return String((valor as { id: string | number }).id);
  }
  return null;
}

function resumoDeConteudo(doc: DocConteudo): ConteudoCmsResumo {
  const categoria = (doc.categoria ?? "artigo") as ConteudoCategoria;
  return {
    id: String(doc.id),
    titulo: doc.titulo ?? "(sem título)",
    categoria,
    categoriaRotulo: rotuloCategoria(categoria),
    vertical: verticalDoConteudo(doc.area),
    dataISO: doc.dataPublicacao ?? null,
    situacao: situacaoDoConteudo(doc),
    destaque: Boolean(doc.destaque),
  };
}

/**
 * Lista os conteúdos para o painel. Falha de banco degrada para lista vazia,
 * logada — mesma defesa do lado do site (`apps/web/lib/conteudos.ts`).
 *
 * Não é zelo genérico: esta leitura é a única do painel cujas colunas ainda
 * não existem no banco de desenvolvimento (o `payload:push:schema` desta
 * branch é a Task 16, manual, do PO). Sem o catch, a rejeição sobe pelo
 * `Promise.all` da rota e derruba Palestrantes, Eventos, Home e o Dashboard
 * junto — a janela de código-novo/banco-velho vira painel inteiro vazio em
 * vez de uma tela degradada.
 */
export async function listarConteudosCms(): Promise<ConteudoCmsResumo[]> {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "conteudos",
      depth: 1,
      limit: 200,
      draft: true,
      sort: "-dataPublicacao",
    });
    return res.docs.map((d) => resumoDeConteudo(d as unknown as DocConteudo));
  } catch (erro) {
    console.error("[painelCms] Falha ao listar conteúdos.", erro);
    return [];
  }
}

export async function obterConteudoCms(id: string): Promise<ConteudoCmsDetalhe | null> {
  const payload = await obterPayload();
  const doc = (await payload
    .findByID({ collection: "conteudos", id, depth: 1, draft: true })
    .catch(() => null)) as DocConteudo | null;
  if (!doc) return null;

  return {
    ...resumoDeConteudo(doc),
    slug: doc.slug ?? "",
    lide: doc.lide ?? "",
    corpoMarkdown: lexicalParaMarkdown(doc.corpo),
    assinatura: doc.assinatura ?? "",
    autorIds: (doc.autor ?? []).map(idDaRelacao).filter((v): v is string => v !== null),
    areaId: idDaRelacao(doc.area),
    imagemDestaqueUrl: urlDeMidia(doc.imagemDestaque),
    imagemDestaqueId: idDaRelacao(doc.imagemDestaque),
    anexoId: idDaRelacao(doc.anexoDownload),
    anexoNome: nomeDeMidia(doc.anexoDownload),
    linkExterno: doc.linkExterno ?? "",
    anunciarEmPreparacao: Boolean(doc.anunciarEmPreparacao),
    seoTitulo: doc.seo?.tituloSeo ?? "",
    seoDescricao: doc.seo?.descricaoSeo ?? "",
  };
}

/** Áreas para o select de vertical do formulário de conteúdo. */
export async function listarAreasCms(): Promise<{ id: string; nome: string }[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "areas", limit: 50, sort: "nome" });
  return res.docs.map((d) => {
    const doc = d as unknown as { id: string | number; nome?: string };
    return { id: String(doc.id), nome: doc.nome ?? "(sem nome)" };
  });
}

