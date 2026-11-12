import { describe, expect, it } from "vitest";

import {
  consolidado,
  corpAlerts,
  validarCusto,
  validarPagamento,
  type ContaFin,
  type CustoFin,
  type EventoFin,
  type LivroFinanceiro,
  type PagamentoFin,
} from "@ntc/lib";

import { dadosDoPagamento, formPagamento, pagarIntegral } from "../eventos/dadosLancamentos";
import { celulasAging } from "../receber/dadosReceber";
import {
  agingPagar,
  algumFiltroPagar,
  aplicarFiltrosPagar,
  competenciaDoCusto,
  csvPagar,
  dadosDaDespesaCorp,
  descricaoDespesaCorpSalva,
  desvioDespesaCorp,
  despesasCorporativas,
  estruturaCompartilhada,
  FILTROS_PAGAR_INICIAIS,
  formDespesaCorp,
  fornecedoresCorporativos,
  linhasDespesasCorporativas,
  linhasPagar,
  recortePagar,
  seriePagar,
  totaisDespesasCorporativas,
  totaisPagar,
  type FiltrosPagar,
} from "./dadosPagar";

const HOJE = "2026-07-15";
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

function custo(p: Partial<CustoFin> = {}): CustoFin {
  return {
    id: "20",
    eventoId: "1",
    tipoLancamento: "Evento",
    centroCusto: "OPE",
    compartilhada: false,
    origemLancamento: "",
    fase: "Execução",
    categoria: "Palestrantes",
    subcategoria: "",
    descricao: "Cachê",
    fornecedor: "Ana Lima",
    documento: "",
    natureza: "Direto",
    comportamento: "Fixo",
    driver: "",
    unidade: "",
    qtde: 1,
    valorUnitPrev: 20_000_00,
    valorRealizado: 18_000_00,
    competencia: "2026-08",
    dataPrevista: "",
    criterioApropriacao: "",
    observacao: "",
    ...p,
  };
}

function pag(p: Partial<PagamentoFin> = {}): PagamentoFin {
  return {
    id: "70",
    custoId: "20",
    eventoId: "1",
    documento: "NF 12",
    vencimento: "2026-07-10",
    valor: 10_000_00,
    dataPagamento: "",
    valorPago: 0,
    contaId: "",
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
    saldoInicial: 0,
    dataSaldoInicial: "2026-01-01",
    ativa: true,
    observacao: "",
    ...p,
  };
}

const aluguel = custo({
  id: "21",
  eventoId: "",
  tipoLancamento: "Corporativa",
  centroCusto: "EST",
  compartilhada: true,
  fase: "",
  categoria: "Ocupação e utilidades",
  descricao: "Aluguel e condomínio da sede · jul/2026",
  fornecedor: "Imobiliária Centro",
  natureza: "Indireto",
  valorUnitPrev: 12_000_00,
  valorRealizado: 12_000_00,
  competencia: "2026-07",
  periodicidade: "Mensal",
});

const software = custo({
  id: "22",
  eventoId: "",
  tipoLancamento: "Corporativa",
  centroCusto: "TEC",
  fase: "",
  categoria: "Tecnologia e assinaturas",
  descricao: "Licenças",
  fornecedor: "",
  valorUnitPrev: 3_000_00,
  valorRealizado: 0,
  competencia: "2026-06",
});

const livro: LivroFinanceiro = {
  ...vazio,
  eventos: [ev()],
  custos: [custo(), aluguel, software],
  pagamentos: [
    pag({ id: "70", vencimento: "2026-07-10" }),
    pag({
      id: "71",
      vencimento: "2026-09-20",
      valor: 8_000_00,
      valorPago: 3_000_00,
      dataPagamento: "2026-07-01",
      contaId: "5",
      documento: "NF 13",
    }),
    pag({
      id: "72",
      custoId: "21",
      eventoId: "",
      documento: "Boleto jul",
      vencimento: "2026-08-05",
      valor: 12_000_00,
    }),
  ],
  contas: [conta()],
};

const filtros = (p: Partial<FiltrosPagar> = {}): FiltrosPagar => ({
  ...FILTROS_PAGAR_INICIAIS,
  ...p,
});

describe("linhasPagar", () => {
  it("ordena por vencimento e junta eventos e corporativo", () => {
    expect(linhasPagar(livro, filtros(), HOJE).map((l) => l.p.id)).toEqual(["70", "72", "71"]);
  });

  it("escopo, centro e período (pelo vencimento)", () => {
    expect(linhasPagar(livro, filtros({ escopo: "corporativo" }), HOJE).map((l) => l.p.id)).toEqual(
      ["72"],
    );
    expect(linhasPagar(livro, filtros({ escopo: "eventos" }), HOJE).map((l) => l.p.id)).toEqual([
      "70",
      "71",
    ]);
    expect(linhasPagar(livro, filtros({ centro: "EST" }), HOJE).map((l) => l.p.id)).toEqual(["72"]);
    // Período literal: o evento (início em ago/26) e os três vencimentos caem no 3º tri.
    expect(linhasPagar(livro, filtros({ periodo: "2026-Q3" }), HOJE).map((l) => l.p.id)).toEqual([
      "70",
      "72",
      "71",
    ]);
    expect(linhasPagar(livro, filtros({ periodo: "2027" }), HOJE)).toEqual([]);
  });

  it("situação: aberto, vencido, parcial, quitado e retenção (nenhum)", () => {
    const ids = (s: FiltrosPagar["situacao"]) =>
      linhasPagar(livro, filtros({ situacao: s }), HOJE).map((l) => l.p.id);
    expect(ids("aberto")).toEqual(["70", "72", "71"]);
    expect(ids("vencido")).toEqual(["70"]);
    expect(ids("parcial")).toEqual(["71"]);
    expect(ids("quitado")).toEqual([]);
    expect(ids("retencao")).toEqual([]);
  });

  it("a busca vale só para o título, sem tirar os títulos de evento (desvio do protótipo)", () => {
    expect(linhasPagar(livro, filtros({ q: "nf 13" }), HOJE).map((l) => l.p.id)).toEqual(["71"]);
    expect(linhasPagar(livro, filtros({ q: "imobiliaria" }), HOJE).map((l) => l.p.id)).toEqual([
      "72",
    ]);
    expect(linhasPagar(livro, filtros({ q: "cache" }), HOJE).map((l) => l.p.id)).toEqual([
      "70",
      "71",
    ]);
  });
});

describe("totais, aging e série", () => {
  it("KPIs de despesa e obrigação, com o selo sem título", () => {
    const f = filtros();
    const sc = recortePagar(livro, f);
    const t = totaisPagar(livro, sc, linhasPagar(livro, f, HOJE, sc));
    expect(t).toEqual({
      lancamentos: 3,
      incorrido: 30_000_00,
      orcado: 35_000_00,
      obrigacoes: 30_000_00,
      pago: 3_000_00,
      saldo: 27_000_00,
      // cachê: 18 mil realizado − 18 mil programado = 0; aluguel 12 − 12 = 0; licenças 0
      semTitulo: 0,
    });
  });

  it("realizado sem título entra em sem título; a busca não mexe nos custos", () => {
    const l2: LivroFinanceiro = {
      ...livro,
      pagamentos: livro.pagamentos.filter((p) => p.id !== "72"),
    };
    const f = filtros({ q: "nf 12" });
    const sc = recortePagar(l2, f);
    const t = totaisPagar(l2, sc, linhasPagar(l2, f, HOJE, sc));
    expect(t.incorrido).toBe(30_000_00);
    expect(t.semTitulo).toBe(12_000_00);
    expect(t.obrigacoes).toBe(10_000_00);
  });

  it("aging e série sobre o saldo", () => {
    const linhas = linhasPagar(livro, filtros(), HOJE);
    const ag = agingPagar(linhas, HOJE);
    expect(ag.vencido).toBe(10_000_00);
    expect(ag.d30).toBe(12_000_00);
    expect(ag.d90).toBe(5_000_00);
    const s = seriePagar(linhas);
    expect(s.labels).toEqual(["jul/26", "ago/26", "set/26"]);
    expect(s.series[0]!.valores).toEqual([10_000_00, 12_000_00, 5_000_00]);
  });

  it("competência do custo", () => {
    expect(competenciaDoCusto(aluguel)).toBe("jul/26");
    expect(competenciaDoCusto({ competencia: "", dataPrevista: "" })).toBe("—");
    expect(competenciaDoCusto({ competencia: "", dataPrevista: "2026-03-10" })).toBe("mar/26");
  });
});

describe("CSV", () => {
  it("13 colunas, BOM, ; e valores em reais", () => {
    const csv = csvPagar(linhasPagar(livro, filtros({ escopo: "corporativo" }), HOJE));
    expect(
      csv.startsWith("﻿ID;Título;Despesa;Fornecedor;Origem;Centro de custo;Compartilhada;"),
    ).toBe(true);
    const [, linha] = csv.slice(1).split("\n");
    expect(linha).toBe(
      "72;Boleto jul;Aluguel e condomínio da sede · jul/2026;Imobiliária Centro;CORPORATIVO;EST;Sim;2026-07;05/08/2026;12000,00;0,00;12000,00;Programado",
    );
  });
});

describe("filtros", () => {
  it("algum filtro e filtros recebidos", () => {
    expect(algumFiltroPagar(FILTROS_PAGAR_INICIAIS)).toBe(false);
    expect(algumFiltroPagar(filtros({ centro: "EST" }))).toBe(true);
    expect(aplicarFiltrosPagar(FILTROS_PAGAR_INICIAIS, { escopo: "corporativo" }).escopo).toBe(
      "corporativo",
    );
  });
});

describe("estrutura compartilhada", () => {
  it("só as compartilhadas do recorte, com o total", () => {
    const e = estruturaCompartilhada(recortePagar(livro, filtros()));
    expect(e.linhas.map((c) => c.id)).toEqual(["21"]);
    expect(e.quantidade).toBe(1);
    expect(e.incorrido).toBe(12_000_00);
    expect(
      estruturaCompartilhada(recortePagar(livro, filtros({ escopo: "eventos" }))).quantidade,
    ).toBe(0);
  });

  it("no máximo 12, competência mais recente primeiro; total de todas", () => {
    const muitas = Array.from({ length: 14 }, (_, i) =>
      custo({
        ...aluguel,
        id: String(100 + i),
        competencia: `2026-${String((i % 12) + 1).padStart(2, "0")}`,
        valorRealizado: 1_00,
      }),
    );
    const e = estruturaCompartilhada({ custos: muitas });
    expect(e.linhas).toHaveLength(12);
    expect(e.linhas[0]!.competencia).toBe("2026-12");
    expect(e.quantidade).toBe(14);
    expect(e.incorrido).toBe(14_00);
  });
});

describe("despesas corporativas (R12)", () => {
  it("todas as sem evento, inclusive as previstas sem título, competência mais recente primeiro", () => {
    const l = linhasDespesasCorporativas(livro, filtros());
    expect(l.map((x) => x.c.id)).toEqual(["21", "22"]);
    expect(l[1]!.f.status).toBe("Previsto");
    expect(totaisDespesasCorporativas(l)).toEqual({
      previsto: 15_000_00,
      realizado: 12_000_00,
      pago: 0,
      aPagar: 12_000_00,
    });
  });

  it("segue o recorte: escopo, centro, período (competência) e busca", () => {
    const ids = (f: Partial<FiltrosPagar>) =>
      linhasDespesasCorporativas(livro, filtros(f)).map((x) => x.c.id);
    expect(ids({ escopo: "eventos" })).toEqual([]);
    expect(ids({ centro: "TEC" })).toEqual(["22"]);
    expect(ids({ periodo: "2026-Q2" })).toEqual(["22"]);
    expect(ids({ periodo: "2026-Q3" })).toEqual(["21"]);
    expect(ids({ q: "licen" })).toEqual(["22"]);
  });

  it("despesasCorporativas e fornecedores", () => {
    expect(despesasCorporativas(livro).map((c) => c.id)).toEqual(["21", "22"]);
    expect(fornecedoresCorporativos(livro)).toEqual(["Imobiliária Centro"]);
  });
});

describe("despesa corporativa: formulário", () => {
  it("defaults do openCustoCorpDrawer", () => {
    const f = formDespesaCorp(null, HOJE);
    expect(f).toMatchObject({
      centroCusto: "ADM",
      compartilhada: false,
      competencia: "2026-07",
      periodicidade: "Mensal",
      comportamento: "Fixo",
      qtde: "1",
      criterioApropriacao: "",
    });
    expect(desvioDespesaCorp(f)).toBeNull();
  });

  it("grava corporativa, sem fase, subcategoria = categoria, competência AAAA-MM, periodicidade só rótulo", () => {
    const f = {
      ...formDespesaCorp(null, HOJE),
      descricao: "Aluguel",
      categoria: "Ocupação e utilidades",
      centroCusto: "EST",
      compartilhada: true,
      valorUnitPrev: 12_000_00,
      valorRealizado: 12_500_00,
      qtde: "",
    };
    const d = dadosDaDespesaCorp(f, null);
    expect(d).toMatchObject({
      eventoId: "",
      tipoLancamento: "Corporativa",
      fase: "",
      compartilhada: true,
      subcategoria: "Ocupação e utilidades",
      natureza: "Indireto",
      driver: "Dias",
      unidade: "mês",
      qtde: 1,
      competencia: "2026-07",
      periodicidade: "Mensal",
    });
    expect(validarCusto(d, livro, null)).toEqual({ ok: true });
    expect(desvioDespesaCorp(f)).toBe(500_00);
    expect(descricaoDespesaCorpSalva("30", d)).toBe("30 · Aluguel · R$ 12.500,00");
  });

  it("editar preserva o que o formulário não mostra", () => {
    const f = formDespesaCorp({ ...aluguel, driver: "Escala", unidade: "verba" }, HOJE);
    expect(f.competencia).toBe("2026-07");
    const d = dadosDaDespesaCorp(f, { ...aluguel, driver: "Escala", unidade: "verba" });
    expect(d.driver).toBe("Escala");
    expect(d.unidade).toBe("verba");
    expect(d.competencia).toBe("2026-07");
  });

  it("competência vazia é recusada pela validação corporativa", () => {
    const d = dadosDaDespesaCorp(
      {
        ...formDespesaCorp(null, HOJE),
        descricao: "X",
        categoria: "Despesas bancárias",
        competencia: "",
      },
      null,
    );
    expect(validarCusto(d, vazio, null)).toMatchObject({ ok: false, campo: "competencia" });
  });
});

describe("fluxo: despesa compartilhada → título → baixa", () => {
  it("aparece na estrutura compartilhada, nas pendências corporativas e quita", () => {
    // 1. A despesa corporativa compartilhada (EST).
    const d = dadosDaDespesaCorp(
      {
        ...formDespesaCorp(null, HOJE),
        descricao: "Aluguel e condomínio da sede · jul/2026",
        categoria: "Ocupação e utilidades",
        centroCusto: "EST",
        compartilhada: true,
        valorUnitPrev: 12_000_00,
        valorRealizado: 12_000_00,
      },
      null,
    );
    expect(validarCusto(d, vazio, null)).toEqual({ ok: true });
    const c: CustoFin = { ...d, id: "40" };
    let l: LivroFinanceiro = { ...vazio, custos: [c], contas: [conta()] };

    // Sem título: entra no "sem título" e na lista de despesas corporativas.
    const sc0 = recortePagar(l, filtros());
    expect(totaisPagar(l, sc0, []).semTitulo).toBe(12_000_00);
    expect(linhasDespesasCorporativas(l, filtros()).map((x) => x.c.id)).toEqual(["40"]);
    expect(estruturaCompartilhada(sc0).linhas.map((x) => x.id)).toEqual(["40"]);
    const alerta = corpAlerts(l, HOJE).find((a) => a.severidade === "A validar");
    expect(alerta?.titulo).toBe("Despesas de estrutura compartilhada sem critério de rateio");
    expect(alerta?.valor).toBe(12_000_00);

    // 2. O título corporativo (Registrar título → Despesa corporativa).
    const custos = despesasCorporativas(l);
    let f = formPagamento({
      pagamento: null,
      custoId: "40",
      custos,
      livro: l,
      modo: "editar",
      hoje: HOJE,
    });
    f = { ...f, vencimento: "2026-07-20", documento: "Boleto jul" };
    expect(validarPagamento(dadosDoPagamento(f), l, null)).toEqual({ ok: true });
    const p: PagamentoFin = { ...dadosDoPagamento(f), id: "80", eventoId: "" };
    l = { ...l, pagamentos: [p] };
    let linhas = linhasPagar(l, filtros(), HOJE);
    expect(linhas.map((x) => x.p.id)).toEqual(["80"]);
    expect(totaisPagar(l, recortePagar(l, filtros()), linhas)).toMatchObject({
      obrigacoes: 12_000_00,
      saldo: 12_000_00,
      semTitulo: 0,
    });

    // 3. A baixa (Baixar → Pagar valor integral do título).
    let fb = formPagamento({ pagamento: p, custos, livro: l, modo: "baixar", hoje: HOJE });
    fb = pagarIntegral(fb, HOJE);
    expect(validarPagamento(dadosDoPagamento(fb), l, "80")).toEqual({ ok: true });
    l = { ...l, pagamentos: [{ ...p, ...dadosDoPagamento(fb) }] };
    linhas = linhasPagar(l, filtros(), HOJE);
    expect(linhas[0]!.x.status).toBe("Pago");
    expect(linhasPagar(l, filtros({ situacao: "aberto" }), HOJE)).toEqual([]);
    expect(
      consolidado(
        {
          periodo: "all",
          vertical: "all",
          modalidade: "all",
          status: "all",
          tipo: "all",
          escopo: "corporativo",
          centro: "all",
        },
        l,
        HOJE,
      ).pago,
    ).toBe(12_000_00);
    // A pendência de rateio continua: pagar não cria critério.
    expect(corpAlerts(l, HOJE).some((a) => a.severidade === "A validar")).toBe(true);
  });
});

describe("livro vazio", () => {
  it("zeros, listas vazias e sem NaN", () => {
    const f = filtros();
    const sc = recortePagar(vazio, f);
    const linhas = linhasPagar(vazio, f, HOJE, sc);
    expect(linhas).toEqual([]);
    expect(totaisPagar(vazio, sc, linhas)).toEqual({
      lancamentos: 0,
      incorrido: 0,
      orcado: 0,
      obrigacoes: 0,
      pago: 0,
      saldo: 0,
      semTitulo: 0,
    });
    expect(celulasAging(agingPagar(linhas, HOJE)).every((c) => c.largura === "0.0%")).toBe(true);
    expect(seriePagar(linhas).labels).toEqual([]);
    expect(estruturaCompartilhada(sc)).toEqual({ linhas: [], quantidade: 0, incorrido: 0 });
    expect(linhasDespesasCorporativas(vazio, f)).toEqual([]);
    expect(totaisDespesasCorporativas([])).toEqual({
      previsto: 0,
      realizado: 0,
      pago: 0,
      aPagar: 0,
    });
  });
});
