import { ESTAGIO_OPORTUNIDADE } from "@ntc/lib";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";

/**
 * Cálculos puros do Painel Comercial (sem I/O — testável e usável no client).
 * Pipeline ponderado = Σ valor × probabilidade das oportunidades abertas.
 *
 * Tudo aqui lê o modelo novo (estágio + situação), nunca o campo `status`
 * legado. O espelho legado colapsa estágios distintos no mesmo valor: uma
 * oportunidade migrada de "Contratada" cai em `contratacao-em-formalizacao`
 * com situação `ativa`, que o espelho traduz de volta para "aprovada" — status
 * que não é fechado. Lendo o espelho, negócio já ganho reentrava no pipeline
 * aberto e inflava valor em negociação e pipeline ponderado.
 */

export interface KpisComercial {
  oportunidadesAbertas: number;
  valorEmNegociacao: number;
  pipelinePonderado: number;
  leadsNovos: number;
}

/**
 * Estágios que saem do pipeline aberto. `ganha` é desfecho; `contratacao-em-
 * formalizacao` saiu da negociação — o preço está fechado e o que resta é
 * instrumento e handoff, então contá-lo como pipeline superestima o que ainda
 * está em disputa. É exatamente onde aterrissam os "Contratada" e "Aprovada"
 * legados na migração P0 (docs/17 §1.5).
 */
const ESTAGIOS_FORA_DO_PIPELINE = ["ganha", "contratacao-em-formalizacao"];

/** Aberta = em negociação de fato: ativa e ainda dentro do pipeline. */
const aberta = (o: OportunidadeCrmResumo): boolean =>
  o.situacao === "ativa" && !ESTAGIOS_FORA_DO_PIPELINE.includes(o.estagio);

/**
 * Critério mais largo que `aberta`: um negócio em formalização não é pipeline,
 * mas ainda precisa de acompanhamento (instrumento a assinar, empenho a sair).
 * Some da lista só quando é ganho ou deixa de estar ativo.
 */
const emAcompanhamento = (o: OportunidadeCrmResumo): boolean =>
  o.situacao === "ativa" && o.estagio !== "ganha";

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

/** Oportunidades em acompanhamento com follow-up entre hoje e hoje+dias, mais próximas primeiro. */
export function followupsProximos(
  oportunidades: OportunidadeCrmResumo[],
  hojeISO: string,
  dias = 7,
): OportunidadeCrmResumo[] {
  const limite = new Date(`${hojeISO}T12:00:00`);
  limite.setDate(limite.getDate() + dias);
  const limiteISO = limite.toISOString().slice(0, 10);
  return oportunidades
    .filter(
      (o) =>
        emAcompanhamento(o) &&
        o.followupISO !== null &&
        o.followupISO >= hojeISO &&
        o.followupISO <= limiteISO,
    )
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}

/** Todas as oportunidades em acompanhamento com follow-up marcado, mais próximas primeiro. */
export function todosFollowups(
  oportunidades: OportunidadeCrmResumo[],
): OportunidadeCrmResumo[] {
  return oportunidades
    .filter((o) => emAcompanhamento(o) && o.followupISO !== null)
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export interface FaixaEstagioOportunidade {
  estagio: string;
  rotulo: string;
  quantidade: number;
}

/**
 * O funil é o caminho até a venda: `ganha` é a saída, não uma faixa dele.
 * `contratacao-em-formalizacao` continua no gráfico — é etapa do processo,
 * mesmo não sendo pipeline em negociação.
 */
const ESTAGIOS_DO_FUNIL = ESTAGIO_OPORTUNIDADE.filter((e) => e.value !== "ganha");

function contarPorEstagio(oportunidades: OportunidadeCrmResumo[]): FaixaEstagioOportunidade[] {
  const ativas = oportunidades.filter((o) => o.situacao === "ativa");
  return ESTAGIOS_DO_FUNIL.map((e) => ({
    estagio: e.value,
    rotulo: e.label,
    quantidade: ativas.filter((o) => o.estagio === e.value).length,
  }));
}

/** Ativas por estágio na ordem do funil, omitindo estágios zerados. */
export function abertasPorEstagio(
  oportunidades: OportunidadeCrmResumo[],
): FaixaEstagioOportunidade[] {
  return contarPorEstagio(oportunidades).filter((f) => f.quantidade > 0);
}

/** Funil completo: os 10 estágios anteriores a Ganha na ordem, incluindo zerados. */
export function funilOportunidades(
  oportunidades: OportunidadeCrmResumo[],
): FaixaEstagioOportunidade[] {
  return contarPorEstagio(oportunidades);
}
