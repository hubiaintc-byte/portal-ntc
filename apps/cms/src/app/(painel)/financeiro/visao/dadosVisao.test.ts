import { describe, expect, it } from "vitest";

import type { EventoFin, FaturamentoFin, LivroFinanceiro, ReceitaFin } from "@ntc/lib";

import {
  algumFiltro,
  FILTROS_VISAO_INICIAIS,
  larguraFunil,
  montarVisaoExecutiva,
  razao,
  recentEvents,
} from "./dadosVisao";

const vazio: LivroFinanceiro = {
  eventos: [],
  receitas: [],
  faturamentos: [],
  custos: [],
  pagamentos: [],
  contas: [],
};
const hoje = "2026-07-15";

const semNaN = (v: unknown): boolean =>
  JSON.stringify(v, (_, x) => (typeof x === "number" && !Number.isFinite(x) ? "NaN!" : x)).indexOf(
    "NaN!",
  ) < 0;

function evento(id: string, p: Partial<EventoFin> = {}): EventoFin {
  return {
    id,
    nome: `Evento ${id}`,
    vertical: "Educação",
    tipo: "Evento aberto",
    modalidade: "Presencial",
    programa: "",
    modulo: "",
    cliente: "",
    cidade: "",
    uf: "",
    local: "",
    dataInicio: "2026-07-10",
    dataFim: "2026-07-10",
    cargaHoraria: 8,
    responsavel: "",
    status: "Em execução",
    qtdPrevista: 0,
    capacidade: 0,
    efetivos: 0,
    pagantesPrev: 0,
    cortesiasPrev: 0,
    refCrm: "",
    refContratual: "",
    observacoes: "",
    origem: "financeiro",
    eventoComercialId: null,
    cadastroPendente: false,
    canceladoNoCrm: false,
    camposDoCrm: [],
    ...p,
  };
}

function receita(id: string, eventoId: string, cliente: string, valorUnit: number): ReceitaFin {
  return {
    id,
    eventoId,
    tipoLancamento: eventoId ? "Evento" : "Corporativa",
    centroCusto: "OPE",
    cliente,
    segmento: "",
    origem: "",
    tipoReceita: "Valor global",
    etapa: "",
    qtde: 1,
    valorUnit,
    desconto: 0,
    pagantes: 0,
    cortesias: 0,
    statusEconomico: "Contratada",
    criterioReconhecimento: "",
    etapas: [],
    competencia: "",
    referencia: "",
    observacao: "",
  };
}

function faturamento(
  id: string,
  receitaId: string,
  eventoId: string,
  valor: number,
  vencimento: string,
): FaturamentoFin {
  return {
    id,
    receitaId,
    eventoId,
    parcela: "1/1",
    nf: `NF-${id}`,
    dataFaturamento: "2026-06-01",
    valorFaturado: valor,
    vencimento,
    retencaoTributaria: 0,
    retencaoContratual: 0,
    retencaoContratualLiberada: 0,
    dataRecebimento: "",
    valorRecebido: 0,
    contaId: "",
    quitado: false,
    observacao: "",
  };
}

describe("Visão Executiva — derivações", () => {
  it("livro vazio não produz NaN", () => {
    const v = montarVisaoExecutiva(vazio, FILTROS_VISAO_INICIAIS, hoje);
    expect(semNaN(v)).toBe(true);
    expect(v.carteira.rows).toHaveLength(0);
    expect(v.geral.projetado).toBe(0);
    expect(v.geral.movimentacaoLiquida).toBe(0);
    expect(v.vencidoReceber).toBe(0);
    expect(v.nClientes).toBe(0);
    expect(v.porStatus.map((s) => s.status)).toEqual([
      "Planejado",
      "Em preparação",
      "Em execução",
      "Realizado",
      "Encerrado",
    ]);
    expect(v.porStatus.every((s) => s.n === 0 && s.fracao === 0)).toBe(true);
    expect(v.graficos.vertical.labels).toEqual([]);
    expect(v.graficos.caixa.labels).toEqual([]);
    expect(v.baseFunilCusto).toBe(0);
    expect(razao(0, 0)).toBeNull();
    expect(larguraFunil(0, 0)).toBe(0);
  });

  it("consolidado lê só o período; carteira e faixa de status seguem os filtros", () => {
    const livro: LivroFinanceiro = {
      ...vazio,
      eventos: [
        evento("EV-1", { vertical: "Educação", status: "Em execução" }),
        evento("EV-2", { vertical: "Saúde", status: "Planejado" }),
      ],
      receitas: [
        receita("RC-1", "EV-1", "Prefeitura de Palmas", 100_000),
        receita("RC-2", "EV-2", "Secretaria de Saúde", 50_000),
        receita("RC-3", "", "Patrocinador", 7_000),
      ],
    };
    const v = montarVisaoExecutiva(
      livro,
      { ...FILTROS_VISAO_INICIAIS, vertical: "Educação", status: "Planejado" },
      hoje,
    );
    // Carteira: Educação + Planejado = nenhum evento.
    expect(v.carteira.rows).toHaveLength(0);
    // K ignora vertical e status: soma os dois eventos e a corporativa.
    expect(v.geral.contratada).toBe(157_000);
    // KC: só corporativo.
    expect(v.corporativo.contratada).toBe(7_000);
    // Faixa de status: recorte sem o filtro de status (só Educação).
    expect(v.porStatus.find((s) => s.status === "Em execução")).toEqual({
      status: "Em execução",
      n: 1,
      fracao: 1,
    });
    expect(v.porStatus.find((s) => s.status === "Planejado")?.n).toBe(0);
  });

  it("selos de vencido, receitas e clientes do recorte", () => {
    const livro: LivroFinanceiro = {
      ...vazio,
      eventos: [evento("EV-1")],
      receitas: [
        receita("RC-1", "EV-1", "Prefeitura de Palmas", 100_000),
        receita("RC-2", "EV-1", "PREFEITURA DE PALMÁS", 10_000),
        receita("RC-3", "", "Patrocinador", 7_000),
      ],
      faturamentos: [faturamento("F1", "RC-1", "EV-1", 60_000, "2026-07-01")],
    };
    const v = montarVisaoExecutiva(livro, FILTROS_VISAO_INICIAIS, hoje);
    expect(v.vencidoReceber).toBe(60_000);
    expect(v.vencidoPagar).toBe(0);
    expect(v.nReceitas).toBe(2);
    expect(v.nClientes).toBe(1);
    expect(algumFiltro(FILTROS_VISAO_INICIAIS)).toBe(false);
    expect(algumFiltro({ ...FILTROS_VISAO_INICIAIS, tipo: "Módulo" })).toBe(true);
  });

  it("eventos recentes pela distância da data de início a hoje, sem data no fim", () => {
    const evs = [
      evento("A", { dataInicio: "2026-01-01" }),
      evento("B", { dataInicio: "" }),
      evento("C", { dataInicio: "2026-07-20" }),
      evento("D", { dataInicio: "2026-07-01" }),
    ];
    expect(recentEvents(evs, hoje).map((e) => e.id)).toEqual(["C", "D", "A", "B"]);
  });
});
