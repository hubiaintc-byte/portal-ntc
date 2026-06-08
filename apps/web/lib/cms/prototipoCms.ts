import "server-only";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura de dados reais para o protótipo de CMS Soberana (/prototipo-cms).
 *
 * SOMENTE LEITURA. Usa a Local API do Payload (mesma de payloadClient.ts) para
 * listar Eventos e Especialistas direto do Postgres, incluindo rascunhos —
 * porque o CMS mostra o status (publicado/rascunho). Não escreve nada, não
 * toca uploads, não altera schema. server-only para nunca vazar ao browser.
 *
 * Mapeia o schema real (apps/cms/src/collections/Eventos.ts e
 * Especialistas.ts) para tipos enxutos que as telas do protótipo consomem.
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
    };
    const nome = doc.nome ?? "(sem nome)";
    return {
      id: String(doc.id),
      nome,
      iniciais: iniciaisDe(nome),
      titulacao: doc.titulacao ?? "—",
      instituicao: doc.instituicao ?? "—",
      vertical: doc.vertical ?? null,
      temFoto: typeof doc.foto === "object" && doc.foto !== null,
    };
  });
}
