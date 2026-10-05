/**
 * Regras puras do catálogo comercial — programas e módulos geridos pelo CRM
 * (spec 2026-10-05-crm-catalogo-programas-modulos). Sem I/O.
 */
import { normalizarNome } from "./casamento-cliente";

export type SituacaoPrograma = "rascunho" | "publicado" | "alteracoes-pendentes";

export const SITUACOES_PROGRAMA: readonly { value: SituacaoPrograma; label: string }[] = [
  { value: "publicado", label: "Publicado" },
  { value: "rascunho", label: "Rascunho" },
  { value: "alteracoes-pendentes", label: "Alterações não publicadas" },
];

export function rotuloSituacaoPrograma(s: SituacaoPrograma): string {
  return SITUACOES_PROGRAMA.find((x) => x.value === s)?.label ?? s;
}

/**
 * `statusPrincipal` é o `_status` lido SEM `draft` (linha principal — fica
 * "draft" só enquanto o programa nunca foi publicado); `statusUltimaVersao`
 * é o `_status` lido COM `draft: true` (última versão salva).
 */
export function situacaoPrograma(
  statusPrincipal: string | null | undefined,
  statusUltimaVersao: string | null | undefined,
): SituacaoPrograma {
  if (statusPrincipal !== "published") return "rascunho";
  return statusUltimaVersao === "draft" ? "alteracoes-pendentes" : "publicado";
}

/** Os cinco textos do programa que alimentam a proposta, com o rótulo usado na tela. */
export const CAMPOS_TEXTO_PROGRAMA = [
  { chave: "visaoGeral", rotulo: "Visão geral (apresentação)" },
  { chave: "problema", rotulo: "Contexto (problema)" },
  { chave: "objetivo", rotulo: "Objetivos" },
  { chave: "publicoAlvo", rotulo: "Público-alvo" },
  { chave: "metodologia", rotulo: "Metodologia" },
] as const;

export type CampoTextoPrograma = (typeof CAMPOS_TEXTO_PROGRAMA)[number]["chave"];

export interface ItemTituloDescricao {
  titulo: string;
  descricao: string;
}

export interface FiltroProgramas {
  busca: string;
  areaId: string;
  situacao: SituacaoPrograma | "";
}

export interface ProgramaFiltravel {
  sigla: string;
  nome: string;
  areaId: string | null;
  situacao: SituacaoPrograma;
}

export function filtrarProgramas<T extends ProgramaFiltravel>(lista: readonly T[], f: FiltroProgramas): T[] {
  const termo = normalizarNome(f.busca);
  return lista.filter(
    (p) =>
      (f.areaId === "" || p.areaId === f.areaId) &&
      (f.situacao === "" || p.situacao === f.situacao) &&
      (termo === "" || normalizarNome(`${p.sigla} ${p.nome}`).includes(termo)),
  );
}

export interface FiltroModulos {
  busca: string;
  programaId: string;
}

export interface ModuloFiltravel {
  titulo: string;
  tituloComercial: string | null;
  programaId: string | null;
}

export function filtrarModulos<T extends ModuloFiltravel>(lista: readonly T[], f: FiltroModulos): T[] {
  const termo = normalizarNome(f.busca);
  return lista.filter(
    (m) =>
      (f.programaId === "" || m.programaId === f.programaId) &&
      (termo === "" || normalizarNome(`${m.titulo} ${m.tituloComercial ?? ""}`).includes(termo)),
  );
}

const vazio = (v: string) => v.trim() === "";

/** Sigla para o rascunho ser encontrável; nome porque o slug (único) deriva dele (`autoSlug`). */
export function faltasParaRascunho(p: { sigla: string; nomeCompleto: string }): string[] {
  const faltas: string[] = [];
  if (vazio(p.sigla)) faltas.push("Sigla");
  if (vazio(p.nomeCompleto)) faltas.push("Nome completo");
  return faltas;
}

export interface ProgramaParaPublicar {
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  /** Markdown da visão geral. */
  visaoGeral: string;
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
}

/** O que o schema do Payload exige na publicação, em rótulos da tela. Listas já devem vir sem itens vazios. */
export function faltasParaPublicar(p: ProgramaParaPublicar): string[] {
  const faltas = faltasParaRascunho(p);
  if (vazio(p.areaId)) faltas.push("Área");
  if (vazio(p.cargaHorariaTotal)) faltas.push("Carga horária total");
  if (vazio(p.visaoGeral)) faltas.push("Visão geral");
  p.eixos.forEach((e, i) => {
    if (vazio(e.titulo)) faltas.push(`Eixo ${i + 1}: título`);
    if (vazio(e.descricao)) faltas.push(`Eixo ${i + 1}: descrição`);
  });
  p.diferenciais.forEach((d, i) => {
    if (vazio(d.titulo)) faltas.push(`Diferencial ${i + 1}: título`);
  });
  p.resultados.forEach((r, i) => {
    if (vazio(r)) faltas.push(`Resultado ${i + 1}: texto`);
  });
  return faltas;
}

/** Item acrescentado e deixado em branco não é dado — some antes de gravar. */
export function semItensVazios(itens: readonly ItemTituloDescricao[]): ItemTituloDescricao[] {
  return itens.filter((i) => !(vazio(i.titulo) && vazio(i.descricao)));
}

export function semResultadosVazios(r: readonly string[]): string[] {
  return r.filter((x) => !vazio(x));
}

export function lerNumeroModulo(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 ? n : null;
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

export interface DependentesPrograma {
  modulos: number;
  propostas: number;
  leads: number;
  eventos: number;
  especialistas: number;
}

export function podeExcluirPrograma(d: DependentesPrograma): { ok: true } | { ok: false; motivo: string } {
  const partes = [
    d.modulos > 0 ? plural(d.modulos, "módulo", "módulos") : null,
    d.propostas > 0 ? plural(d.propostas, "proposta", "propostas") : null,
    d.leads > 0 ? plural(d.leads, "lead", "leads") : null,
    d.eventos > 0 ? plural(d.eventos, "evento do site", "eventos do site") : null,
    d.especialistas > 0 ? plural(d.especialistas, "especialista", "especialistas") : null,
  ].filter((p): p is string => p !== null);
  if (partes.length === 0) return { ok: true };
  return { ok: false, motivo: `Vinculado a ${juntar(partes)} — exclua ou desvincule antes.` };
}

export interface DependentesModulo {
  propostas: number;
  eventosComerciais: number;
}

export function podeExcluirModulo(d: DependentesModulo): { ok: true } | { ok: false; motivo: string } {
  const partes = [
    d.propostas > 0 ? plural(d.propostas, "proposta", "propostas") : null,
    d.eventosComerciais > 0 ? plural(d.eventosComerciais, "evento comercial", "eventos comerciais") : null,
  ].filter((p): p is string => p !== null);
  if (partes.length === 0) return { ok: true };
  return { ok: false, motivo: `Usado em ${juntar(partes)} — não pode ser excluído.` };
}

/**
 * `modulosQuantidade` grava publicado só quando o programa não tem rascunho
 * em curso — senão a escrita publicaria por tabela o que o PO ainda edita.
 */
export function quantidadeModulosVaiPublicado(s: SituacaoPrograma): boolean {
  return s === "publicado";
}
