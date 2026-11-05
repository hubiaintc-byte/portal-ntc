import { describe, expect, it } from "vitest";

import {
  consolidado,
  resumoSaldosPorConta,
  validarFaturamento,
  validarReceita,
  type ContaFin,
  type EventoFin,
  type FaturamentoFin,
  type LivroFinanceiro,
  type PagamentoFin,
  type ReceitaFin,
} from "@ntc/lib";

import {
  agingReceber,
  algumFiltroReceber,
  aplicarFiltrosReceber,
  celulasAging,
  competenciaCurta,
  clientesCorporativos,
  contaComSituacao,
  contextoDaParcela,
  csvReceber,
  dadosDaReceitaCorp,
  descricaoReceitaCorpSalva,
  eventosParaFaturar,
  FILTROS_RECEBER_INICIAIS,
  formReceitaCorp,
  linhasReceber,
  linhasReceitasCorporativas,
  listaContas,
  receitasCorporativasContratadas,
  serieReceber,
  totaisReceber,
  totaisReceitasCorporativas,
  type FiltrosReceber,
} from "./dadosReceber";

const HOJE = "2026-07-15";
/** Como a página faz: saldos sobre o livro inteiro, contas do livro da tela. */
const contasDe = (l: LivroFinanceiro) => listaContas(l.contas, resumoSaldosPorConta(l));
const vazio: LivroFinanceiro = {
  eventos: [],
  receitas: [],
  faturamentos: [],
  custos: [],
  pagamentos: [],
  contas: [],
};

function ev(p: Partial<EventoFin> = {}): EventoFin {
  return {
    id: "1",
    nome: "Seminário",
    vertical: "Educação",
    tipo: "In Company / Projeto B2G",
    modalidade: "Presencial",
    programa: "PROGE",
    modulo: "",
    cliente: "Prefeitura de Recife",
    cidade: "Recife",
    uf: "PE",
    local: "Auditório",
    dataInicio: "2026-08-10",
    dataFim: "2026-08-12",
    cargaHoraria: 24,
    responsavel: "",
    status: "Planejado",
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

function rec(p: Partial<ReceitaFin> = {}): ReceitaFin {
  return {
    id: "10",
    eventoId: "1",
    tipoLancamento: "Evento",
    centroCusto: "OPE",
    cliente: "Prefeitura de Recife",
    segmento: "Municipal - Capital",
    origem: "Contrato B2G",
    tipoReceita: "Valor global",
    etapa: "",
    qtde: 1,
    valorUnit: 100_000_00,
    desconto: 0,
    pagantes: 0,
    cortesias: 0,
    statusEconomico: "Contratada",
    criterioReconhecimento: "",
    etapas: [],
    competencia: "",
    referencia: "",
    observacao: "",
    ...p,
  };
}

function fat(p: Partial<FaturamentoFin> = {}): FaturamentoFin {
  return {
    id: "50",
    receitaId: "10",
    eventoId: "1",
    parcela: "Parcela 1",
    nf: "",
    dataFaturamento: "2026-07-01",
    valorFaturado: 40_000_00,
    vencimento: "2026-07-30",
    retencaoTributaria: 0,
    retencaoContratual: 0,
    retencaoContratualLiberada: 0,
    dataRecebimento: "",
    valorRecebido: 0,
    contaId: "",
    quitado: false,
    observacao: "",
    ...p,
  };
}

function conta(p: Partial<ContaFin> = {}): ContaFin {
  return {
    id: "5",
    nome: "Conta movimento",
    tipo: "Conta corrente",
    banco: "Banco do Brasil",
    agencia: "",
    numero: "",
    saldoInicial: 10_000_00,
    dataSaldoInicial: "2026-01-01",
    ativa: true,
    observacao: "",
    ...p,
  };
}

const corp = rec({
  id: "11",
  eventoId: "",
  tipoLancamento: "Corporativa",
  centroCusto: "DIR",
  cliente: "Fundação Gama",
  origem: "Consultoria institucional",
  segmento: "Privado/Outro",
  valorUnit: 30_000_00,
  competencia: "2026-07",
});

const livro: LivroFinanceiro = {
  ...vazio,
  eventos: [ev()],
  receitas: [rec(), corp],
  faturamentos: [
    fat({ id: "50", vencimento: "2026-07-10", nf: "NF 101", retencaoTributaria: 2_000_00 }),
    fat({
      id: "51",
      vencimento: "2026-09-20",
      retencaoContratual: 4_000_00,
      valorFaturado: 40_000_00,
    }),
    fat({
      id: "52",
      receitaId: "11",
      eventoId: "",
      parcela: "Única",
      vencimento: "2026-08-01",
      valorFaturado: 30_000_00,
      valorRecebido: 10_000_00,
      dataRecebimento: "2026-07-05",
      contaId: "5",
    }),
  ],
  contas: [conta()],
};

const filtros = (p: Partial<FiltrosReceber> = {}): FiltrosReceber => ({
  ...FILTROS_RECEBER_INICIAIS,
  ...p,
});

describe("linhasReceber", () => {
  it("ordena por vencimento e junta eventos e corporativo", () => {
    expect(linhasReceber(livro, filtros(), HOJE).map((l) => l.f.id)).toEqual(["50", "52", "51"]);
  });

  it("escopo e centro de custo", () => {
    expect(
      linhasReceber(livro, filtros({ escopo: "corporativo" }), HOJE).map((l) => l.f.id),
    ).toEqual(["52"]);
    expect(linhasReceber(livro, filtros({ escopo: "eventos" }), HOJE).map((l) => l.f.id)).toEqual([
      "50",
      "51",
    ]);
    expect(linhasReceber(livro, filtros({ centro: "DIR" }), HOJE).map((l) => l.f.id)).toEqual([
      "52",
    ]);
  });

  it("situação: vencido, parcial, retenção, quitado", () => {
    const ids = (s: FiltrosReceber["situacao"]) =>
      linhasReceber(livro, filtros({ situacao: s }), HOJE).map((l) => l.f.id);
    expect(ids("vencido")).toEqual(["50"]);
    expect(ids("parcial")).toEqual(["52"]);
    expect(ids("retencao")).toEqual(["50", "51"]);
    expect(ids("quitado")).toEqual([]);
    expect(ids("aberto")).toEqual(["50", "52", "51"]);
  });

  it("período pela data de vencimento (o evento entra pela data de início)", () => {
    expect(linhasReceber(livro, filtros({ periodo: "2026-Q3" }), HOJE).map((l) => l.f.id)).toEqual([
      "50",
      "52",
      "51",
    ]);
    expect(linhasReceber(livro, filtros({ periodo: "2027" }), HOJE)).toEqual([]);
  });

  it("busca por NF não tira as parcelas de evento do recorte", () => {
    expect(linhasReceber(livro, filtros({ q: "nf 101" }), HOJE).map((l) => l.f.id)).toEqual(["50"]);
    expect(linhasReceber(livro, filtros({ q: "fundacao" }), HOJE).map((l) => l.f.id)).toEqual([
      "52",
    ]);
  });
});

describe("totais, aging e série", () => {
  const linhas = linhasReceber(livro, filtros(), HOJE);

  it("totais dos KPIs", () => {
    const t = totaisReceber(linhas);
    expect(t.bruto).toBe(110_000_00);
    expect(t.retTrib).toBe(2_000_00);
    expect(t.retContr).toBe(4_000_00);
    expect(t.liquido).toBe(104_000_00);
    expect(t.recebido).toBe(10_000_00);
    expect(t.exigivel).toBe(94_000_00);
    expect(t.aLiberar).toBe(4_000_00);
  });

  it("aging sobre o exigível", () => {
    const a = agingReceber(linhas, HOJE);
    expect(a.vencido).toBe(38_000_00);
    expect(a.d30).toBe(20_000_00);
    expect(a.d90).toBe(36_000_00);
    const c = celulasAging(a);
    expect(c.map((x) => x.rotulo)).toEqual([
      "Vencido",
      "Até 30 dias",
      "31–60 dias",
      "61–90 dias",
      "Acima de 90",
    ]);
    expect(c[0]!.neg).toBe(true);
    expect(c[1]!.largura).toBe("21.3%");
  });

  it("série por mês de vencimento", () => {
    const s = serieReceber(linhas);
    expect(s.labels).toEqual(["jul/26", "ago/26", "set/26"]);
    expect(s.series[0]!.valores).toEqual([38_000_00, 20_000_00, 36_000_00]);
  });

  it("livro vazio não produz NaN", () => {
    const l = linhasReceber(vazio, filtros(), HOJE);
    expect(l).toEqual([]);
    expect(Object.values(totaisReceber(l)).every((v) => v === 0)).toBe(true);
    const c = celulasAging(agingReceber(l, HOJE));
    expect(c.every((x) => x.largura === "0.0%" && x.valor === 0)).toBe(true);
    expect(serieReceber(l).labels).toEqual([]);
    const k = contasDe(vazio);
    expect(k).toEqual({ linhas: [], saldoInicial: 0, saldoAtual: 0 });
  });
});

describe("CSV", () => {
  it("BOM, ponto e vírgula, valores em reais e origem CORPORATIVO", () => {
    const csv = csvReceber(linhasReceber(livro, filtros({ escopo: "corporativo" }), HOJE));
    expect(csv.startsWith("﻿ID;Documento;Cliente;Origem;Centro de custo;")).toBe(true);
    const [, linha] = csv.slice(1).split("\n");
    expect(linha).toBe(
      "52;Única;Fundação Gama;CORPORATIVO;DIR;01/07/2026;01/08/2026;30000,00;0,00;0,00;30000,00;10000,00;20000,00;0,00;0,00;Recebida parcialmente",
    );
  });
});

describe("filtros", () => {
  it("algum filtro e filtros recebidos", () => {
    expect(algumFiltroReceber(FILTROS_RECEBER_INICIAIS)).toBe(false);
    expect(algumFiltroReceber(filtros({ q: "x" }))).toBe(true);
    const f = aplicarFiltrosReceber(FILTROS_RECEBER_INICIAIS, { situacao: "vencido", outro: "x" });
    expect(f).toEqual(filtros({ situacao: "vencido" }));
    expect(aplicarFiltrosReceber(FILTROS_RECEBER_INICIAIS, undefined)).toBe(
      FILTROS_RECEBER_INICIAIS,
    );
  });
});

describe("receita corporativa", () => {
  it("valores iniciais do protótipo e gravação sem evento, competência em mês", () => {
    const f = formReceitaCorp(null, HOJE);
    expect(f).toMatchObject({
      origem: "Consultoria institucional",
      centroCusto: "ADM",
      competencia: "2026-07-01",
      statusEconomico: "Contratada",
      segmento: "Privado/Outro",
      tipoReceita: "Valor global",
      criterioReconhecimento: "Integral no encerramento",
    });
    const d = dadosDaReceitaCorp(
      { ...f, cliente: "Fundação Gama", centroCusto: "DIR", valorUnit: 30_000_00 },
      null,
    );
    expect(d).toMatchObject({
      eventoId: "",
      tipoLancamento: "Corporativa",
      qtde: 1,
      competencia: "2026-07",
    });
    expect(validarReceita(d, vazio, null).ok).toBe(true);
    expect(descricaoReceitaCorpSalva("12", d)).toBe("12 · Fundação Gama · R$ 30.000,00");
  });

  it("sem competência a validação recusa no campo", () => {
    const d = dadosDaReceitaCorp(
      { ...formReceitaCorp(null, HOJE), cliente: "X", competencia: "" },
      null,
    );
    const v = validarReceita(d, vazio, null);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.campo).toBe("competencia");
  });

  it("editar reabre com a competência como data e preserva o que não está no formulário", () => {
    const f = formReceitaCorp(corp, HOJE);
    expect(f.competencia).toBe("2026-07-01");
    const d = dadosDaReceitaCorp(f, { ...corp, etapa: "E1", desconto: 100 });
    expect(d).toMatchObject({ etapa: "E1", desconto: 100, competencia: "2026-07" });
  });

  it("corporativa → faturar → receber: entra em Receber e na operação corporativa", () => {
    const r = {
      ...dadosDaReceitaCorp(
        {
          ...formReceitaCorp(null, HOJE),
          cliente: "Gama",
          centroCusto: "DIR",
          valorUnit: 50_000_00,
        },
        null,
      ),
      id: "90",
    };
    const l1: LivroFinanceiro = { ...vazio, receitas: [r], contas: [conta()] };
    expect(receitasCorporativasContratadas(l1).map((x) => x.id)).toEqual(["90"]);
    const fNova = {
      receitaId: "90",
      parcela: "Única",
      nf: "NF 9",
      dataFaturamento: "2026-07-10",
      valorFaturado: 50_000_00,
      vencimento: "2026-07-20",
      retencaoTributaria: 0,
      retencaoContratual: 0,
      retencaoContratualLiberada: 0,
      dataRecebimento: "2026-07-15",
      valorRecebido: 50_000_00,
      contaId: "5",
      quitado: false,
      observacao: "",
    };
    expect(validarFaturamento(fNova, l1, null).ok).toBe(true);
    const l2: LivroFinanceiro = { ...l1, faturamentos: [{ ...fNova, id: "91", eventoId: "" }] };
    const linhas = linhasReceber(l2, filtros(), HOJE);
    expect(linhas).toHaveLength(1);
    expect(linhas[0]!.x.status).toBe("Recebida");
    expect(contextoDaParcela(l2, r).contexto).toEqual({
      id: "",
      nome: "Receita corporativa · Gama",
    });
    const c = consolidado(
      {
        periodo: "all",
        vertical: "all",
        modalidade: "all",
        status: "all",
        tipo: "all",
        escopo: "corporativo",
        centro: "all",
      },
      l2,
      HOJE,
    );
    expect(c.recebida).toBe(50_000_00);
    expect(contasDe(l2).saldoAtual).toBe(60_000_00);
  });

  it("clientes corporativos e contexto de parcela de evento", () => {
    expect(clientesCorporativos(livro)).toEqual(["Fundação Gama"]);
    expect(contextoDaParcela(livro, rec())).toEqual({ contexto: { id: "1", nome: "Seminário" } });
    expect(eventosParaFaturar([ev({ id: "10" }), ev({ id: "2" })]).map((e) => e.id)).toEqual([
      "2",
      "10",
    ]);
  });
});

describe("contas", () => {
  it("lista com saldo derivado e rodapé consolidado", () => {
    const pag: PagamentoFin = {
      id: "70",
      custoId: "20",
      eventoId: "1",
      documento: "",
      vencimento: "",
      valor: 1_000_00,
      dataPagamento: "2026-07-02",
      valorPago: 1_000_00,
      contaId: "5",
      observacao: "",
    };
    const completo: LivroFinanceiro = {
      ...livro,
      pagamentos: [pag],
      contas: [conta(), conta({ id: "6", saldoInicial: 0, ativa: false })],
    };
    const k = contasDe(completo);
    expect(k.linhas.map((x) => x.saldo)).toEqual([19_000_00, 0]);
    expect(k.linhas[0]!.movimentos).toBe(2);
    expect(k.linhas[0]!.saidas).toBe(1_000_00);
    expect(k.saldoInicial).toBe(10_000_00);
    expect(k.saldoAtual).toBe(19_000_00);
    // Quem só tem Receber recebe o livro sem pagamentos, mas o saldo vem do livro inteiro.
    const recortado: LivroFinanceiro = { ...completo, custos: [], pagamentos: [] };
    const r = listaContas(recortado.contas, resumoSaldosPorConta(completo));
    expect(r.linhas.map((x) => x.saldo)).toEqual([19_000_00, 0]);
    expect(r.saldoAtual).toBe(19_000_00);
  });

  it("conta ainda sem saldo do servidor fica com o saldo inicial", () => {
    const k = listaContas([conta({ id: "9", saldoInicial: 7_00 })], []);
    expect(k.linhas[0]).toMatchObject({ movimentos: 0, entradas: 0, saidas: 0, saldo: 7_00 });
    expect(k.saldoAtual).toBe(7_00);
  });

  it("inativar mantém os demais dados", () => {
    expect(contaComSituacao(conta(), false)).toEqual({
      nome: "Conta movimento",
      tipo: "Conta corrente",
      banco: "Banco do Brasil",
      agencia: "",
      numero: "",
      saldoInicial: 10_000_00,
      dataSaldoInicial: "2026-01-01",
      ativa: false,
      observacao: "",
    });
  });
});

describe("receitas corporativas (lista)", () => {
  const prevista = rec({
    id: "12",
    eventoId: "",
    tipoLancamento: "Corporativa",
    centroCusto: "ADM",
    cliente: "Banco Alfa",
    origem: "Receita financeira",
    statusEconomico: "Prevista",
    valorUnit: 5_000_00,
    competencia: "2026-03",
  });
  const l: LivroFinanceiro = { ...livro, receitas: [...livro.receitas, prevista] };
  const ids = (p: Partial<FiltrosReceber> = {}) =>
    linhasReceitasCorporativas(l, filtros(p)).map((x) => x.r.id);

  it("só receitas sem evento, inclusive previstas, competência mais recente primeiro", () => {
    expect(ids()).toEqual(["11", "12"]);
    const [gama, alfa] = linhasReceitasCorporativas(l, filtros());
    expect(gama!.m).toMatchObject({ valor: 30_000_00, faturado: 30_000_00, aFaturar: 0 });
    expect(alfa!.m).toMatchObject({ status: "Prevista", faturado: 0, aFaturar: 0 });
  });

  it("segue o Recorte: escopo, centro, período pela competência e busca", () => {
    expect(ids({ escopo: "eventos" })).toEqual([]);
    expect(ids({ escopo: "corporativo" })).toEqual(["11", "12"]);
    expect(ids({ centro: "ADM" })).toEqual(["12"]);
    expect(ids({ periodo: "2026-Q1" })).toEqual(["12"]);
    expect(ids({ periodo: "2026-Q3" })).toEqual(["11"]);
    expect(ids({ q: "financeira" })).toEqual(["12"]);
    expect(ids({ situacao: "vencido" })).toEqual(["11", "12"]);
  });

  it("totais, competência curta e livro vazio", () => {
    expect(totaisReceitasCorporativas(linhasReceitasCorporativas(l, filtros()))).toEqual({
      valor: 35_000_00,
      faturado: 30_000_00,
      aFaturar: 0,
    });
    expect(competenciaCurta("2026-03")).toBe("03/2026");
    expect(competenciaCurta("")).toBe("—");
    expect(linhasReceitasCorporativas(vazio, filtros())).toEqual([]);
    expect(totaisReceitasCorporativas([])).toEqual({ valor: 0, faturado: 0, aFaturar: 0 });
  });
});
