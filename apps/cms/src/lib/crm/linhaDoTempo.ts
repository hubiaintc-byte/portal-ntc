import type { CollectionAfterChangeHook, PayloadRequest, RequiredDataFromCollectionSlug } from "payload";

import {
  ehEstagioLead,
  montarItemLinhaDoTempo,
  rotuloDoEstagio,
  TIPOS_CONTRATO,
  tituloPerda,
  tituloTransicao,
  type EntradaLinhaDoTempo,
} from "@ntc/lib";
import type { DocumentoComercial, EventoComercial, Lead } from "@ntc/types";

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
    // Lead casado/criado automaticamente na própria criação (Task 7):
    // `casarClienteDoLead` já fez um `update` aninhado que passou por este
    // mesmo hook com `operation: "update"` e escreveu o item "lead" com o
    // detalhe do casamento. Sem este corte, o `afterChange` externo do
    // `create` (que já vê `doc.cliente` preenchido) duplicaria o item.
    if (p.casamentoAutomatico !== null) return [];
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
  // Lido de `context` (o argumento do hook, que o Payload passa como
  // `req.context` no momento da chamada) e também de `req.context`
  // diretamente — dois pontos de leitura para o mesmo valor, porque a
  // `update` aninhada de `casarClienteDoLead` (Task 7) grava o motivo nos
  // dois lugares e este hook não deve depender de qual dos dois o Payload
  // de fato repassa em cada versão/caminho de chamada.
  const casamentoAutomatico =
    (typeof context?.casamentoAutomatico === "string" ? context.casamentoAutomatico : null) ??
    (typeof req.context?.casamentoAutomatico === "string" ? req.context.casamentoAutomatico : null);
  const entradas = entradasDoLead({ operation, doc, previousDoc, usuarioId, casamentoAutomatico });
  for (const entrada of entradas) {
    await registrarNaLinhaDoTempo(req, entrada);
  }
  return doc;
};

type ContratoEmpenho = NonNullable<EventoComercial["contratoEmpenho"]>;

/** Vazio = nenhum dos campos do grupo foi preenchido ainda. */
function contratoEmpenhoVazio(c: ContratoEmpenho | undefined | null): boolean {
  if (!c) return true;
  return c.tipo == null && !c.numero?.trim() && c.data == null && c.valor == null && c.arquivo == null;
}

function tituloContratoRegistrado(c: ContratoEmpenho | undefined | null): string {
  const rotuloTipo = c?.tipo ? (TIPOS_CONTRATO.find((t) => t.value === c.tipo)?.label ?? c.tipo) : null;
  const numero = c?.numero?.trim() || null;
  const partes = [rotuloTipo, numero].filter((s): s is string => s !== null);
  return partes.length > 0 ? `Contrato/empenho registrado · ${partes.join(" ")}` : "Contrato/empenho registrado";
}

type LinksInscricao = EventoComercial["linksInscricao"];

/** Serializa rótulo+url (não só a contagem) para detectar qualquer mudança na lista de links. */
function serializarLinksInscricao(links: LinksInscricao): string {
  return (links ?? []).map((l) => `${l.rotulo} ${l.url}`).join("\n");
}

export interface ParametrosEntradasDoEvento {
  operation: "create" | "update";
  doc: EventoComercial;
  previousDoc?: EventoComercial;
  usuarioId: number | null;
}

/** Pura: decide quais itens uma escrita em `eventos-comerciais` gera. */
export function entradasDoEvento(p: ParametrosEntradasDoEvento): EntradaLinhaDoTempo[] {
  const clienteId = idRel(p.doc.cliente);
  if (clienteId === null) return [];
  const leadId = idRel(p.doc.lead);
  const referencia = { colecao: "eventos-comerciais", id: String(p.doc.id) };
  const comum = { clienteId, leadId, usuarioId: p.usuarioId, referencia };

  if (p.operation === "create") {
    return [{ ...comum, tipo: "evento", titulo: `Evento agendado · ${p.doc.titulo}` }];
  }

  const antes = p.previousDoc;
  if (!antes) return [];
  const itens: EntradaLinhaDoTempo[] = [];

  if (contratoEmpenhoVazio(antes.contratoEmpenho) && !contratoEmpenhoVazio(p.doc.contratoEmpenho)) {
    itens.push({ ...comum, tipo: "evento", titulo: tituloContratoRegistrado(p.doc.contratoEmpenho) });
  }

  // Serializa rótulo+url em vez de comparar só a contagem — editar um link
  // existente (ex.: corrigir uma URL errada) não muda o tamanho da lista e
  // por isso não gerava item nenhum na linha do tempo.
  if (serializarLinksInscricao(antes.linksInscricao) !== serializarLinksInscricao(p.doc.linksInscricao)) {
    const numLinksAgora = p.doc.linksInscricao?.length ?? 0;
    itens.push({ ...comum, tipo: "evento", titulo: `Links de inscrição atualizados (${numLinksAgora})` });
  }

  if (antes.status !== p.doc.status) {
    if (p.doc.status === "realizado") {
      itens.push({ ...comum, tipo: "evento", titulo: `Evento realizado · ${p.doc.titulo}` });
    } else if (p.doc.status === "cancelado") {
      itens.push({ ...comum, tipo: "evento", titulo: `Evento cancelado · ${p.doc.titulo}` });
    }
  }

  return itens;
}

/** Hook `afterChange` de `eventos-comerciais`. Só grava; a decisão é de `entradasDoEvento`. */
export const registrarEventoNaLinhaDoTempo: CollectionAfterChangeHook<EventoComercial> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const usuarioId = req.user?.collection === "users" ? Number(req.user.id) : null;
  const entradas = entradasDoEvento({ operation, doc, previousDoc, usuarioId });
  for (const entrada of entradas) {
    await registrarNaLinhaDoTempo(req, entrada);
  }
  return doc;
};

export interface ParametrosEntradasDoDocumento {
  operation: "create" | "delete";
  doc: DocumentoComercial;
  /** Já resolvido pelo hook a partir do evento (o documento não sabe o cliente sozinho). */
  clienteId: number | null;
  leadId?: number | null;
  usuarioId: number | null;
}

/** Pura: decide quais itens uma escrita/remoção em `documentos-comerciais` gera. */
export function entradasDoDocumento(p: ParametrosEntradasDoDocumento): EntradaLinhaDoTempo[] {
  if (p.clienteId === null) return [];
  const referencia = { colecao: "documentos-comerciais", id: String(p.doc.id) };
  const verbo = p.operation === "create" ? "anexado" : "removido";
  return [
    {
      clienteId: p.clienteId,
      leadId: p.leadId ?? null,
      tipo: "documento",
      titulo: `Documento ${verbo} · ${p.doc.filename ?? ""}`,
      detalhe: p.doc.descricao ?? null,
      referencia,
      usuarioId: p.usuarioId,
    },
  ];
}

/**
 * Hook `afterChange` de `documentos-comerciais`, só na criação — a remoção
 * é registrada pela escrita que a provoca (Task 3), porque `afterDelete`
 * não tem o cliente à mão sem outra consulta. Documentos sem `evento` (ex.:
 * o PDF de proposta gerado pela Fase B2) não têm cliente para amarrar e não
 * geram item nenhum — sem fetch nenhum nesse caso.
 */
export const registrarDocumentoNaLinhaDoTempo: CollectionAfterChangeHook<DocumentoComercial> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return doc;
  const eventoId = idRel(doc.evento);
  if (eventoId === null) return doc;
  const usuarioId = req.user?.collection === "users" ? Number(req.user.id) : null;
  const evento = await req.payload.findByID({ collection: "eventos-comerciais", id: eventoId, depth: 0, req });
  const clienteId = idRel(evento.cliente);
  const leadId = idRel(evento.lead);
  const entradas = entradasDoDocumento({ operation: "create", doc, clienteId, leadId, usuarioId });
  for (const entrada of entradas) {
    await registrarNaLinhaDoTempo(req, entrada);
  }
  return doc;
};
