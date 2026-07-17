import { STATUS_OPORTUNIDADE, STATUS_OPORTUNIDADE_FECHADA } from "@ntc/lib";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";

/**
 * Cálculos puros do Painel Comercial (sem I/O — testável e usável no client).
 * Pipeline ponderado = Σ valor × probabilidade das oportunidades abertas.
 */

export interface KpisComercial {
  oportunidadesAbertas: number;
  valorEmNegociacao: number;
  pipelinePonderado: number;
  leadsNovos: number;
}

const aberta = (o: OportunidadeCrmResumo): boolean =>
  !STATUS_OPORTUNIDADE_FECHADA.includes(o.status);

export function calcularKpisComercial(
  oportunidades: OportunidadeCrmResumo[],
  leads: LeadCmsResumo[],
): KpisComercial {
  const abertas = oportunidades.filter(aberta);
  return {
    oportunidadesAbertas: abertas.length,
    valorEmNegociacao: abertas.reduce((soma, o) => soma + (o.valor ?? 0), 0),
    pipelinePonderado: abertas.reduce(
      (soma, o) => soma + ((o.valor ?? 0) * (o.probabilidade ?? 0)) / 100,
      0,
    ),
    leadsNovos: leads.filter((l) => l.status === "novo").length,
  };
}

/** Oportunidades abertas com follow-up entre hoje e hoje+dias, mais próximas primeiro. */
export function followupsProximos(
  oportunidades: OportunidadeCrmResumo[],
  hojeISO: string,
  dias = 7,
): OportunidadeCrmResumo[] {
  const limite = new Date(`${hojeISO}T12:00:00`);
  limite.setDate(limite.getDate() + dias);
  const limiteISO = limite.toISOString().slice(0, 10);
  return oportunidades
    .filter((o) => aberta(o) && o.followupISO !== null && o.followupISO >= hojeISO && o.followupISO <= limiteISO)
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}

/** Todas as oportunidades abertas com follow-up marcado, mais próximas primeiro. */
export function todosFollowups(
  oportunidades: OportunidadeCrmResumo[],
): OportunidadeCrmResumo[] {
  return oportunidades
    .filter((o) => aberta(o) && o.followupISO !== null)
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export interface FaixaStatusOportunidade {
  status: string;
  rotulo: string;
  quantidade: number;
}

const STATUS_ABERTOS = STATUS_OPORTUNIDADE.filter(
  (s) => !STATUS_OPORTUNIDADE_FECHADA.includes(s.value),
);

function contarPorStatus(oportunidades: OportunidadeCrmResumo[]): FaixaStatusOportunidade[] {
  return STATUS_ABERTOS.map((s) => ({
    status: s.value,
    rotulo: s.label,
    quantidade: oportunidades.filter((o) => o.status === s.value).length,
  }));
}

/** Abertas por status na ordem fixa da lista, omitindo status zerados. */
export function abertasPorStatus(
  oportunidades: OportunidadeCrmResumo[],
): FaixaStatusOportunidade[] {
  return contarPorStatus(oportunidades).filter((f) => f.quantidade > 0);
}

/** Funil completo: todos os status abertos na ordem, incluindo zerados. */
export function funilOportunidades(
  oportunidades: OportunidadeCrmResumo[],
): FaixaStatusOportunidade[] {
  return contarPorStatus(oportunidades);
}
