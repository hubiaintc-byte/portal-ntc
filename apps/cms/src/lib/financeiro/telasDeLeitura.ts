import { TELAS_FIN, type TelaPainel } from "../cms/telas";

/**
 * Quem lê o quê no Financeiro (ruling R16): fonte única do `read` das
 * coleções `fin-*` na REST, do recorte do livro por tela
 * (`recortarLivroPorTela`) e da guarda do histórico. Receitas/faturamentos
 * pedem Visão Executiva, Eventos ou Receber; custos/pagamentos, Visão
 * Executiva, Eventos ou Pagar; eventos e contas, qualquer tela `fin.*`.
 * O administrador passa sempre (`temTela`).
 */

export const SLUGS_FIN = [
  "fin-eventos",
  "fin-receitas",
  "fin-faturamentos",
  "fin-custos",
  "fin-pagamentos",
  "fin-contas",
] as const;
export type SlugFin = (typeof SLUGS_FIN)[number];

export function ehSlugFin(slug: unknown): slug is SlugFin {
  return typeof slug === "string" && (SLUGS_FIN as readonly string[]).includes(slug);
}

const TELAS_RECEBER: readonly TelaPainel[] = ["fin.visao-executiva", "fin.eventos", "fin.receber"];
const TELAS_PAGAR: readonly TelaPainel[] = ["fin.visao-executiva", "fin.eventos", "fin.pagar"];

export const TELAS_LEITURA_FIN: Readonly<Record<SlugFin, readonly TelaPainel[]>> = {
  "fin-eventos": TELAS_FIN,
  "fin-contas": TELAS_FIN,
  "fin-receitas": TELAS_RECEBER,
  "fin-faturamentos": TELAS_RECEBER,
  "fin-custos": TELAS_PAGAR,
  "fin-pagamentos": TELAS_PAGAR,
};

/** Tela exigida para o lançamento corporativo (sem evento), como na escrita (`podeCorporativo`). */
const TELA_CORPORATIVA: Readonly<Partial<Record<SlugFin, TelaPainel>>> = {
  "fin-receitas": "fin.receber",
  "fin-faturamentos": "fin.receber",
  "fin-custos": "fin.pagar",
  "fin-pagamentos": "fin.pagar",
};

/** Se o slug distingue lançamento corporativo (receitas, faturamentos, custos, pagamentos). */
export function temCorporativo(slug: SlugFin): boolean {
  return TELA_CORPORATIVA[slug] !== undefined;
}

/** Telas que abrem o histórico de um registro: as de leitura, ou só a dedicada se corporativo. */
export function telasDoHistoricoFin(slug: SlugFin, corporativo: boolean): readonly TelaPainel[] {
  const dedicada = TELA_CORPORATIVA[slug];
  return corporativo && dedicada ? [dedicada] : TELAS_LEITURA_FIN[slug];
}
