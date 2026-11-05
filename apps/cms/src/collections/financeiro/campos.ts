import type { Field } from "payload";

import { LISTAS_FIN } from "@ntc/lib";

import { acessoPorTela, administrador } from "../../access/porTela";
import { registrarAuditoriaFin, registrarExclusaoFin } from "../../lib/financeiro/auditoria";
import { TELAS_FIN, type TelaPainel } from "../../lib/cms/telas";

/**
 * Peças comuns das coleções `fin-*`. Listas fechadas são gravadas como `text`
 * validado (e não `select`) para a Administração da Fase 2 editar as listas
 * sem alterar enum no banco (spec §3.4). Nenhum campo é `required` além dos
 * três obrigatórios desde a criação — `required` emite `NOT NULL` (lição da
 * Sessão 4); a obrigatoriedade mora nas validações das Server Actions.
 */

const vazio = (v: unknown): boolean => v === null || v === undefined || v === "";

/** Dinheiro: centavos inteiros, não negativos (nenhum valor negativo na Fase 1). */
export function validarCentavos(v: unknown): true | string {
  if (vazio(v)) return true;
  return typeof v === "number" && Number.isInteger(v) && v >= 0
    ? true
    : "Valor em centavos inteiros, não negativo.";
}

/** Quantidades e contagens: inteiro ≥ 0. */
export function validarInteiro(v: unknown): true | string {
  if (vazio(v)) return true;
  return typeof v === "number" && Number.isInteger(v) && v >= 0
    ? true
    : "Informe um número inteiro não negativo.";
}

/** Número ≥ 0 (aceita fração: quantidade de diárias, horas, percentual). */
export function validarNaoNegativo(v: unknown): true | string {
  if (vazio(v)) return true;
  return typeof v === "number" && Number.isFinite(v) && v >= 0
    ? true
    : "Valor não pode ser negativo.";
}

/** Texto que, preenchido, precisa ser um dos valores da lista. */
export function validarNaLista(lista: readonly string[]) {
  return (v: unknown): true | string =>
    vazio(v) || (typeof v === "string" && lista.includes(v))
      ? true
      : "Valor fora da lista permitida.";
}

/** Data civil `AAAA-MM-DD` (texto, sem fuso — como no protótipo). */
export function validarData(v: unknown): true | string {
  return vazio(v) || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v))
    ? true
    : "Data no formato AAAA-MM-DD.";
}

/** Competência `AAAA-MM`. */
export function validarCompetencia(v: unknown): true | string {
  return vazio(v) || (typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v))
    ? true
    : "Competência no formato AAAA-MM.";
}

export const CENTROS_CUSTO: readonly string[] = LISTAS_FIN.centrosCusto.map((c) => c.cod);
export const TIPOS_LANCAMENTO: readonly string[] = ["Evento", "Corporativa"];

export const texto = (name: string): Field => ({ name, type: "text" });
export const textoLongo = (name: string): Field => ({ name, type: "textarea" });
export const lista = (name: string, valores: readonly string[]): Field => ({
  name,
  type: "text",
  validate: validarNaLista(valores),
});
export const data = (name: string): Field => ({ name, type: "text", validate: validarData });
export const competencia = (name: string): Field => ({
  name,
  type: "text",
  validate: validarCompetencia,
});
export const centavos = (name: string): Field => ({
  name,
  type: "number",
  validate: validarCentavos,
});
export const inteiro = (name: string): Field => ({
  name,
  type: "number",
  validate: validarInteiro,
});
export const naoNegativo = (name: string): Field => ({
  name,
  type: "number",
  validate: validarNaoNegativo,
});

/** Access comum: leitura por qualquer tela `fin.*`, escrita pelas telas dadas, exclusão só administrador. */
export function acessoFin(escrita: readonly TelaPainel[]) {
  return {
    read: acessoPorTela(TELAS_FIN),
    create: acessoPorTela(escrita),
    update: acessoPorTela(escrita),
    delete: administrador,
  };
}

/** Auditoria em `audit-log`, na mesma transação. */
export const hooksAuditoriaFin = {
  afterChange: [registrarAuditoriaFin],
  afterDelete: [registrarExclusaoFin],
};
