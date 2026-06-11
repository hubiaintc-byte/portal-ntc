import "server-only";

import { obterPayload } from "@/lib/payloadClient";
import { lexicalToHtml } from "@/lib/cms/lexical";

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

export type StatusCms = "publicado" | "rascunho" | "agendado";

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

/** Deriva o status legível: rascunho via _status do Payload; agendado se a data é futura. */
function statusEvento(doc: { _status?: string; dataInicio?: string | null }): StatusCms {
  if (doc._status !== "published") return "rascunho";
  if (doc.dataInicio) {
    const inicio = new Date(doc.dataInicio).getTime();
    if (!Number.isNaN(inicio) && inicio > nowSeguro()) return "agendado";
  }
  return "publicado";
}

/** `Date.now()` não está disponível em alguns contextos de build; isola o uso. */
function nowSeguro(): number {
  return new Date().getTime();
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
      data: doc.dataInicio ? FMT_DATA.format(new Date(doc.dataInicio)) : "—",
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
    _status?: string;
  };

  const modalidade = d.modalidade ?? "";
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
    data: d.dataInicio ? FMT_DATA.format(new Date(d.dataInicio)) : "—",
    local: montarLocal(d.local, modalidade),
    modalidade: modalidade ? modalidade.charAt(0).toUpperCase() + modalidade.slice(1) : "—",
    cargaHoraria: d.cargaHoraria ?? null,
    capaUrl: urlDeMidia(d.imagemCapa),
    capaNome: nomeDeMidia(d.imagemCapa),
    folderPdfNome: nomeDeMidia(d.folderPdf),
    dataInicioISO: d.dataInicio ? new Date(d.dataInicio).toISOString().slice(0, 10) : null,
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
