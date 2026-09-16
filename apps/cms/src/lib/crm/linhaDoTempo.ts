import type { CollectionAfterChangeHook, PayloadRequest, RequiredDataFromCollectionSlug } from "payload";

import {
  ehEstagioLead,
  montarItemLinhaDoTempo,
  rotuloDoEstagio,
  tituloPerda,
  tituloTransicao,
  type EntradaLinhaDoTempo,
} from "@ntc/lib";
import type { Lead } from "@ntc/types";

/**
 * Linha do tempo do cliente (spec 2026-09-15 §5.5). Um único ponto de escrita:
 * `registrarNaLinhaDoTempo`, sempre com `req` para entrar na mesma transação
 * do Payload da escrita que a originou. A decisão do QUE registrar fica em
 * funções puras (`entradasDoLead` aqui; as de proposta/e-mail/evento chegam
 * nas Sessões 2–4 no mesmo arquivo).
 */

type LinhaDoTempoData = RequiredDataFromCollectionSlug<"linha-do-tempo">;

export async function registrarNaLinhaDoTempo(
  req: PayloadRequest,
  entrada: EntradaLinhaDoTempo,
): Promise<void> {
  const item = montarItemLinhaDoTempo(entrada);
  if (item === null) return;
  const data: LinhaDoTempoData = {
    cliente: item.cliente,
    lead: item.lead,
    tipo: item.tipo as LinhaDoTempoData["tipo"],
    titulo: item.titulo,
    detalhe: item.detalhe,
    referencia: item.referencia ?? undefined,
    usuario: item.usuario,
    em: item.em,
  };
  await req.payload.create({ collection: "linha-do-tempo", data, req });
}

const idRel = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "") return Number.isFinite(Number(v)) ? Number(v) : null;
  if (v && typeof v === "object" && "id" in v) return idRel((v as { id: unknown }).id);
  return null;
};

const DETALHE_CASAMENTO: Record<string, string> = {
  cnpj: "Vinculado ao cliente por CNPJ",
  dominio: "Vinculado ao cliente por domínio do e-mail",
  nome: "Vinculado ao cliente por nome do órgão",
  criado: "Cliente criado a partir do lead",
};

export interface ParametrosEntradasDoLead {
  operation: "create" | "update";
  doc: Lead;
  previousDoc?: Lead;
  usuarioId: number | null;
  /** Motivo do casamento automático (Task 7), ou null quando a escrita veio da UI. */
  casamentoAutomatico: string | null;
}

/** Pura: decide quais itens uma escrita em `leads` gera. */
export function entradasDoLead(p: ParametrosEntradasDoLead): EntradaLinhaDoTempo[] {
  const clienteId = idRel(p.doc.cliente);
  if (clienteId === null) return [];
  const leadId = p.doc.id;
  const referencia = { colecao: "leads", id: String(leadId) };
  const comum = { clienteId, leadId, usuarioId: p.usuarioId, referencia };

  if (p.operation === "create") {
    return [{ ...comum, tipo: "lead", titulo: p.doc.origemEntrada === "manual" ? "Lead criado manualmente" : "Lead recebido pelo site" }];
  }

  const antes = p.previousDoc;
  const itens: EntradaLinhaDoTempo[] = [];
  const clienteAntes = antes ? idRel(antes.cliente) : null;

  if (clienteAntes !== clienteId) {
    if (p.casamentoAutomatico !== null) {
      itens.push({
        ...comum,
        tipo: "lead",
        titulo: p.doc.origemEntrada === "manual" ? "Lead criado manualmente" : "Lead recebido pelo site",
        detalhe: DETALHE_CASAMENTO[p.casamentoAutomatico] ?? null,
      });
    } else {
      itens.push({ ...comum, tipo: "vinculo", titulo: "Lead vinculado a este cliente" });
    }
  }

  const estagioAntes = antes && ehEstagioLead(antes.estagio) ? antes.estagio : null;
  const estagioAgora = ehEstagioLead(p.doc.estagio) ? p.doc.estagio : null;
  if (estagioAgora !== null && estagioAntes !== estagioAgora) {
    itens.push({ ...comum, tipo: "transicao", titulo: tituloTransicao(estagioAntes, estagioAgora) });
  }

  const perdidoAntes = antes?.perdido === true;
  const perdidoAgora = p.doc.perdido === true;
  if (!perdidoAntes && perdidoAgora) {
    itens.push({ ...comum, tipo: "perda", titulo: tituloPerda(p.doc.motivoPerda ?? "outro"), detalhe: p.doc.detalhePerda ?? null });
  } else if (perdidoAntes && !perdidoAgora) {
    itens.push({ ...comum, tipo: "reabertura", titulo: `Reaberto em ${rotuloDoEstagio(p.doc.estagio ?? "lead")}` });
  }

  return itens;
}

/** Hook `afterChange` de `leads`. Só grava; a decisão é de `entradasDoLead`. */
export const registrarLeadNaLinhaDoTempo: CollectionAfterChangeHook<Lead> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (doc.tipo !== "proposta") return doc;
  const usuarioId = req.user?.collection === "users" ? Number(req.user.id) : null;
  const casamentoAutomatico =
    typeof context?.casamentoAutomatico === "string" ? context.casamentoAutomatico : null;
  const entradas = entradasDoLead({ operation, doc, previousDoc, usuarioId, casamentoAutomatico });
  for (const entrada of entradas) {
    await registrarNaLinhaDoTempo(req, entrada);
  }
  return doc;
};
