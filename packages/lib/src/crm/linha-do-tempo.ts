/**
 * Linha do tempo do cliente (spec 2026-09-15 §3.7 e §5.5). Pura: monta o
 * documento que o helper do Payload grava. Todo item pertence a um cliente;
 * `lead` é opcional (itens do próprio cliente, como nota manual, não têm lead).
 */

import { MOTIVOS_PERDA, rotuloDoEstagio } from "./estagios";
import type { OpcaoLista } from "./listas";

export const TIPOS_LINHA_DO_TEMPO: OpcaoLista[] = [
  { label: "Lead", value: "lead" },
  { label: "Transição de estágio", value: "transicao" },
  { label: "Perda", value: "perda" },
  { label: "Reabertura", value: "reabertura" },
  { label: "E-mail", value: "email" },
  { label: "Proposta", value: "proposta" },
  { label: "Evento", value: "evento" },
  { label: "Documento", value: "documento" },
  { label: "Vínculo com cliente", value: "vinculo" },
  { label: "Nota", value: "nota" },
];

export type TipoLinhaDoTempo =
  | "lead"
  | "transicao"
  | "perda"
  | "reabertura"
  | "email"
  | "proposta"
  | "evento"
  | "documento"
  | "vinculo"
  | "nota";

export interface ReferenciaLinhaDoTempo {
  colecao: string;
  id: string;
}

export interface ItemLinhaDoTempo {
  cliente: number;
  lead: number | null;
  tipo: TipoLinhaDoTempo;
  titulo: string;
  detalhe: string | null;
  referencia: ReferenciaLinhaDoTempo | null;
  usuario: number | null;
  em: string;
}

export interface EntradaLinhaDoTempo {
  clienteId: number | string | null | undefined;
  leadId?: number | string | null;
  tipo: TipoLinhaDoTempo;
  titulo: string;
  detalhe?: string | null;
  referencia?: ReferenciaLinhaDoTempo | null;
  usuarioId?: number | string | null;
  /** Injetável para teste; default `new Date()`. */
  agora?: Date;
}

const numeroOuNulo = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function montarItemLinhaDoTempo(e: EntradaLinhaDoTempo): ItemLinhaDoTempo | null {
  const cliente = numeroOuNulo(e.clienteId);
  if (cliente === null) return null;
  const titulo = e.titulo.trim();
  if (titulo === "") return null;
  return {
    cliente,
    lead: numeroOuNulo(e.leadId),
    tipo: e.tipo,
    titulo,
    detalhe: e.detalhe?.trim() ? e.detalhe.trim() : null,
    referencia: e.referencia ?? null,
    usuario: numeroOuNulo(e.usuarioId),
    em: (e.agora ?? new Date()).toISOString(),
  };
}

export function tituloTransicao(de: string | null, para: string): string {
  if (de === null) return `Entrou em ${rotuloDoEstagio(para)}`;
  return `${rotuloDoEstagio(de)} → ${rotuloDoEstagio(para)}`;
}

export function tituloPerda(motivo: string): string {
  const rotulo = MOTIVOS_PERDA.find((m) => m.value === motivo)?.label ?? motivo;
  return `Marcado como perdido · ${rotulo}`;
}
