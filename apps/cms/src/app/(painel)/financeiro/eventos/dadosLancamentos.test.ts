import { describe, expect, it } from "vitest";

import {
  eventMetrics,
  validarConta,
  validarCusto,
  validarFaturamento,
  validarPagamento,
  type ContaFin,
  type CustoFin,
  type EventoFin,
  type FaturamentoFin,
  type LivroFinanceiro,
  type PagamentoFin,
  type ReceitaFin,
} from "@ntc/lib";

import {
  aoEscolherCusto,
  calculosCusto,
  calculosFaturamento,
  categoriasPriorizadas,
  classeDesvio,
  comSinal,
  contasComExtras,
  contasSelecionaveis,
  dadosDaConta,
  dadosDoCusto,
  dadosDoFaturamento,
  dadosDoPagamento,
  descricaoCustoSalvo,
  descricaoFaturamentoSalvo,
  descricaoPagamentoSalvo,
  formConta,
  formCusto,
  formFaturamento,
  formPagamento,
  fracaoPaga,
  gruposFaturamento,
  gruposPagamentos,
  infoCusto,
  mostraCriterioApropriacao,
  nomeConta,
  opcoesCategoria,
  opcoesCustos,
  pagarIntegral,
  preencherRecebido,
  receitasFaturaveis,
  resumoFaturamento,
  resumoPagamentos,
  rotuloConta,
  saldoAFaturar,
  situacaoParcela,
  situacaoTitulo,
  subDescricaoCusto,
  tabelaCustos,
  validadeAoMudarRetencaoContratual,
} from "./dadosLancamentos";

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

function cus(p: Partial<CustoFin> = {}): CustoFin {
  return {
    id: "20",
    eventoId: "1",
    tipoLancamento: "Evento",
    centroCusto: "OPE",
    compartilhada: false,
    origemLancamento: "",
    fase: "Execução",
    categoria: "Espaço Físico",
    subcategoria: "Locação",
    descricao: "Auditório",
    fornecedor: "Centro de Convenções",
    documento: "",
    natureza: "Direto",
    comportamento: "Fixo",
    driver: "",
    unidade: "diária",
    qtde: 2,
    valorUnitPrev: 5_000_00,
    valorRealizado: 0,
    competencia: "2026-08",
    dataPrevista: "2026-08-10",
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

describe("livro vazio", () => {
  it("abas sem lançamentos: zeros e listas vazias, sem NaN", () => {
    const e = ev();
    const m = eventMetrics(e, vazio, HOJE);
    const t = tabelaCustos(m, { busca: "", fase: "all", status: "all" });
    expect(t.grupos).toEqual([]);
    expect(t.totais).toEqual({ previsto: 0, realizado: 0, desvio: 0, pago: 0 });
    expect(resumoFaturamento(vazio, "1", HOJE)).toEqual({
      retTrib: 0,
      retContr: 0,
      retTotal: 0,
      aLiberar: 0,
      exigivel: 0,
      vencidos: 0,
    });
    expect(resumoPagamentos(vazio, "1", m, HOJE)).toEqual({
      nRealizados: 0,
      vencidoSaldo: 0,
      nVencidos: 0,
      semTitulo: 0,
      totalTitulos: 0,
    });
    expect(gruposFaturamento(m, HOJE, "", false)).toEqual([]);
    expect(gruposPagamentos(m, HOJE, "", false)).toEqual([]);
    expect(comSinal(m.desvio)).toBe("—");
  });
});

describe("custos", () => {
  it("formulário novo: OPE, Direto/A validar, un, 1, competência = fim do evento (gravada AAAA-MM)", () => {
    const f = formCusto(ev(), null);
    expect(f).toMatchObject({
      centroCusto: "OPE",
      natureza: "Direto",
      comportamento: "A validar",
      unidade: "un",
      qtde: "1",
      competencia: "2026-08",
      dataPrevista: "2026-08-10",
    });
    const d = dadosDoCusto(
      { ...f, fase: "Execução", categoria: "Espaço Físico", descricao: "Auditório" },
      ev(),
      null,
    );
    expect(d).toMatchObject({
      eventoId: "1",
      tipoLancamento: "Evento",
      centroCusto: "OPE",
      competencia: "2026-08",
      qtde: 1,
    });
    expect(validarCusto(d, vazio, null)).toEqual({ ok: true });
  });

  it("editar mostra a competência AAAA-MM como data e preserva compartilhada/origem/periodicidade", () => {
    const c = cus({ compartilhada: true, origemLancamento: "Manual", periodicidade: "Mensal" });
    const f = formCusto(ev(), c);
    expect(f.competencia).toBe("2026-08");
    expect(dadosDoCusto(f, ev(), c)).toMatchObject({
      compartilhada: true,
      origemLancamento: "Manual",
      periodicidade: "Mensal",
      competencia: "2026-08",
    });
  });

  it("calculados: previsto, desvio só com realizado, status automático", () => {
    const f = formCusto(ev(), cus());
    expect(calculosCusto(f, ev(), null, vazio)).toEqual({
      previsto: 10_000_00,
      desvio: null,
      status: "Previsto",
    });
    const r = calculosCusto({ ...f, valorRealizado: 12_000_00 }, ev(), null, vazio);
    expect(r).toEqual({ previsto: 10_000_00, desvio: 2_000_00, status: "Realizado" });
    const livro = { ...vazio, custos: [cus()], pagamentos: [pag({ valorPago: 5_000_00 })] };
    expect(calculosCusto({ ...f, valorRealizado: 12_000_00 }, ev(), cus(), livro).status).toBe(
      "Pago parcialmente",
    );
  });

  it("critério de apropriação só em estrutura compartilhada ou indireto", () => {
    expect(mostraCriterioApropriacao({ fase: "Execução", natureza: "Direto" })).toBe(false);
    expect(mostraCriterioApropriacao({ fase: "Estrutura compartilhada", natureza: "Direto" })).toBe(
      true,
    );
    expect(mostraCriterioApropriacao({ fase: "Execução", natureza: "Indireto" })).toBe(true);
  });

  it("categorias: priorizadas da modalidade, comuns, outras", () => {
    const g = opcoesCategoria("Presencial");
    expect(g.map((x) => x.grupo)).toEqual([
      "Priorizadas · Presencial",
      "Comuns a todas as modalidades",
      "Outras categorias",
    ]);
    expect(g[0]!.opcoes).toContain("Espaço Físico");
    expect(g[2]!.opcoes).toContain("Estúdio");
    expect(opcoesCategoria("Híbrido").map((x) => x.grupo)).toEqual([
      "Priorizadas · Híbrido",
      "Comuns a todas as modalidades",
    ]);
  });

  it("tabela por fase, filtros, faixa de categorias e textos", () => {
    const e = ev();
    const livro = {
      ...vazio,
      custos: [
        cus(),
        cus({
          id: "21",
          fase: "Pré-evento",
          categoria: "Criação e Design",
          descricao: "Peças",
          fornecedor: "",
          valorRealizado: 1_500_00,
          qtde: 1,
          valorUnitPrev: 1_000_00,
        }),
      ],
    };
    const m = eventMetrics(e, livro, HOJE);
    const t = tabelaCustos(m, { busca: "", fase: "all", status: "all" });
    expect(t.grupos.map((g) => g.fase)).toEqual(["Pré-evento", "Execução"]);
    expect(t.totais).toEqual({ previsto: 11_000_00, realizado: 1_500_00, desvio: 500_00, pago: 0 });
    expect(
      tabelaCustos(m, { busca: "", fase: "all", status: "Realizado" }).linhas.map((x) => x.c.id),
    ).toEqual(["21"]);
    expect(
      tabelaCustos(m, { busca: "auditorio", fase: "all", status: "all" }).linhas.map((x) => x.c.id),
    ).toEqual(["20"]);
    const prio = categoriasPriorizadas(e, m);
    expect(prio.categorias.find((c) => c.nome === "Espaço Físico")?.lancada).toBe(true);
    expect(prio.semLancamento).toBe(prio.categorias.length - 1);
    expect(subDescricaoCusto(cus())).toBe("Espaço Físico · Locação · Direto · Fixo");
    expect(subDescricaoCusto(cus({ subcategoria: "Auditório" }))).toBe(
      "Espaço Físico · Direto · Fixo",
    );
    expect(comSinal(500_00)).toBe("+R$ 500,00");
    expect(comSinal(-500_00)).toBe("−R$ 500,00");
    expect(classeDesvio(1)).toBe("neg");
    expect(classeDesvio(-1)).toBe("pos");
    expect(fracaoPaga({ pago: 0, realizado: 0 })).toBeNull();
    expect(fracaoPaga({ pago: 30, realizado: 20 })).toBe(1);
    expect(descricaoCustoSalvo("20", dadosDoCusto(formCusto(e, cus()), e, cus()))).toBe(
      "20 · Auditório · previsto R$ 10.000,00",
    );
  });
});

describe("pagamentos: orçado → realizado → título → baixa parcial → baixa total, com conta criada na hora", () => {
  it("percorre o fluxo com as validações do servidor", () => {
    const e = ev();
    let livro: LivroFinanceiro = { ...vazio, eventos: [e], custos: [cus()] };

    // Título sobre custo só orçado: sugestão = previsto; programar pode, baixar não.
    let f = formPagamento({
      pagamento: null,
      custoId: "20",
      custos: livro.custos,
      livro,
      modo: "editar",
      hoje: HOJE,
    });
    expect(f.valor).toBe(10_000_00);
    expect(infoCusto(livro.custos, livro, "20")).toEqual({
      fornecedor: "Centro de Convenções",
      previsto: 10_000_00,
      realizado: 0,
      pago: 0,
    });
    const semRealizado = validarPagamento(
      dadosDoPagamento({
        ...f,
        vencimento: "2026-08-20",
        valorPago: 1_000_00,
        dataPagamento: HOJE,
      }),
      livro,
      null,
    );
    expect(semRealizado).toEqual({
      ok: false,
      erro: "Registre o valor realizado do custo antes da baixa (CUSTO REALIZADO ≠ PAGO)",
      campo: "valorPago",
    });

    // Realiza o custo.
    livro = { ...livro, custos: [cus({ valorRealizado: 9_000_00 })] };
    f = formPagamento({
      pagamento: null,
      custoId: "20",
      custos: livro.custos,
      livro,
      modo: "editar",
      hoje: HOJE,
    });
    expect(f.valor).toBe(9_000_00);
    // Sem conta nenhuma: a primeira ativa é "" e a baixa pede conta.
    expect(f.contaId).toBe("");
    const semConta = validarPagamento(
      dadosDoPagamento({
        ...f,
        vencimento: "2026-08-20",
        valorPago: 4_000_00,
        dataPagamento: HOJE,
      }),
      livro,
      null,
    );
    expect(semConta).toMatchObject({ ok: false, campo: "contaId" });

    // "Nova conta" criada na gaveta: entra antes do livro revalidado e já vale.
    const nova = { ...dadosDaConta(formConta(null, HOJE)), nome: "Caixa", id: "9" };
    expect(validarConta(nova)).toEqual({ ok: true });
    const contas = contasComExtras(livro.contas, [nova]);
    const livroComConta = { ...livro, contas };
    const parcial = dadosDoPagamento({
      ...f,
      contaId: "9",
      vencimento: "2026-08-20",
      valorPago: 4_000_00,
      dataPagamento: HOJE,
    });
    expect(validarPagamento(parcial, livroComConta, null)).toEqual({ ok: true });
    expect(descricaoPagamentoSalvo("70", parcial)).toBe(
      "70 · título R$ 9.000,00 · pago R$ 4.000,00",
    );

    // Baixa parcial gravada; depois a baixa total pelo "Pagar valor integral".
    livro = { ...livroComConta, pagamentos: [{ ...parcial, id: "70", eventoId: "1" }] };
    const baixa = formPagamento({
      pagamento: livro.pagamentos[0]!,
      custos: livro.custos,
      livro,
      modo: "baixar",
      hoje: HOJE,
    });
    expect(baixa.dataPagamento).toBe(HOJE); // já tinha data: fica a gravada
    const total = pagarIntegral(baixa, HOJE);
    expect(total.valorPago).toBe(9_000_00);
    expect(validarPagamento(dadosDoPagamento(total), livro, "70")).toEqual({ ok: true });
    livro = { ...livro, pagamentos: [{ ...livro.pagamentos[0]!, valorPago: 9_000_00 }] };
    const m = eventMetrics(e, livro, HOJE);
    expect(m.cf[0]!.f.status).toBe("Pago");
    expect(gruposPagamentos(m, HOJE, "", true)).toEqual([]);
    expect(situacaoTitulo(gruposPagamentos(m, HOJE, "", false)[0]!.titulos[0]!.x)).toBe("Pago");
  });

  it("baixa sem data começa hoje; sugestão desconta o já programado", () => {
    const livro = {
      ...vazio,
      custos: [cus({ valorRealizado: 9_000_00 })],
      pagamentos: [pag({ valor: 3_000_00 })],
    };
    expect(
      aoEscolherCusto(
        formPagamento({ pagamento: null, custos: livro.custos, livro, modo: "editar", hoje: HOJE }),
        "20",
        livro.custos,
        livro,
      ).valor,
    ).toBe(6_000_00);
    const b = formPagamento({
      pagamento: livro.pagamentos[0]!,
      custos: livro.custos,
      livro,
      modo: "baixar",
      hoje: HOJE,
    });
    expect(b.dataPagamento).toBe(HOJE);
  });

  it("resumo: vencido sem baixa, sem título, total de títulos", () => {
    const e = ev();
    const livro = {
      ...vazio,
      custos: [cus({ valorRealizado: 9_000_00 })],
      pagamentos: [pag({ valor: 3_000_00 })],
    };
    const m = eventMetrics(e, livro, HOJE);
    expect(resumoPagamentos(livro, "1", m, HOJE)).toEqual({
      nRealizados: 1,
      vencidoSaldo: 3_000_00,
      nVencidos: 1,
      semTitulo: 1,
      totalTitulos: 3_000_00,
    });
    expect(situacaoTitulo({ vencido: true, status: "Programado" })).toBe("Vencido");
  });

  it("select de custo: por fase no evento, por categoria corporativa; grupos vazios saem", () => {
    const cs = [cus(), cus({ id: "22", fase: "Pós-evento" })];
    expect(opcoesCustos(cs, false)).toEqual([
      { grupo: "Execução", opcoes: ["20"] },
      { grupo: "Pós-evento", opcoes: ["22"] },
    ]);
    const corp = [cus({ id: "30", eventoId: "", fase: "", categoria: "Despesas bancárias" })];
    expect(opcoesCustos(corp, true)).toEqual([{ grupo: "Despesas bancárias", opcoes: ["30"] }]);
  });
});

describe("faturamento e recebimento", () => {
  it("faturamento novo com uma receita: escolhe, sugere o saldo e numera a parcela", () => {
    const livro = { ...vazio, receitas: [rec()], faturamentos: [fat()] };
    const recs = receitasFaturaveis(livro, "1");
    const f = formFaturamento({
      faturamento: null,
      receitas: recs,
      livro,
      modo: "editar",
      hoje: HOJE,
    });
    expect(f).toMatchObject({
      receitaId: "10",
      valorFaturado: 60_000_00,
      parcela: "Parcela 2",
      dataFaturamento: HOJE,
    });
    expect(saldoAFaturar(recs, livro, "10", null)).toEqual({
      contratado: 100_000_00,
      jaFaturado: 40_000_00,
      saldo: 60_000_00,
    });
    expect(saldoAFaturar(recs, livro, "10", "50")?.saldo).toBe(100_000_00);
    expect(receitasFaturaveis({ receitas: [rec({ statusEconomico: "Prevista" })] }, "1")).toEqual(
      [],
    );
  });

  it("faturar → receber com retenção contratual: 'a liberar' aparece", () => {
    const e = ev();
    const c = conta();
    let livro: LivroFinanceiro = { ...vazio, eventos: [e], receitas: [rec()], contas: [c] };
    const recs = receitasFaturaveis(livro, "1");
    const f = formFaturamento({
      faturamento: null,
      receitas: recs,
      livro,
      modo: "editar",
      hoje: HOJE,
    });
    const d = dadosDoFaturamento({
      ...f,
      valorFaturado: 50_000_00,
      vencimento: "2026-08-01",
      retencaoContratual: 5_000_00,
    });
    expect(validarFaturamento(d, livro, null)).toEqual({ ok: true });
    livro = { ...livro, faturamentos: [{ ...d, id: "50", eventoId: "1" }] };

    // Receber: data de hoje, "Recebido líquido de retenções".
    const r = formFaturamento({
      faturamento: livro.faturamentos[0]!,
      receitas: recs,
      livro,
      modo: "receber",
      hoje: HOJE,
    });
    expect(r.dataRecebimento).toBe(HOJE);
    expect(r.contaId).toBe("5");
    const liq = preencherRecebido(r, "liq", HOJE);
    expect(liq.valorRecebido).toBe(45_000_00);
    expect(calculosFaturamento(liq)).toEqual({
      liquido: 45_000_00,
      aReceber: 0,
      emAberto: 5_000_00,
      diferenca: null,
    });
    expect(validarFaturamento(dadosDoFaturamento(liq), livro, "50")).toEqual({ ok: true });
    expect(descricaoFaturamentoSalvo(dadosDoFaturamento(liq))).toBe(
      "Parcela 1 · faturado R$ 50.000,00 · recebido R$ 45.000,00",
    );

    livro = { ...livro, faturamentos: [{ ...dadosDoFaturamento(liq), id: "50", eventoId: "1" }] };
    const res = resumoFaturamento(livro, "1", HOJE);
    expect(res).toMatchObject({
      retContr: 5_000_00,
      retTotal: 5_000_00,
      aLiberar: 5_000_00,
      exigivel: 0,
    });
    const m = eventMetrics(e, livro, HOJE);
    const g = gruposFaturamento(m, HOJE, "", false);
    expect(g[0]!.parcelas[0]!.x.aLiberar).toBe(5_000_00);
    expect(situacaoParcela(g[0]!.parcelas[0]!.x)).toBe("Recebida");
    // "Somente com saldo": a parcela tem 5 mil em aberto e a receita ainda tem saldo a faturar.
    expect(gruposFaturamento(m, HOJE, "", true)[0]!.parcelas).toHaveLength(1);
    expect(nomeConta(livro.contas, "5")).toBe("Conta movimento");
  });

  it("parcela liquidada: diferença de conciliação = recebido − líquido", () => {
    const f = formFaturamento({
      faturamento: fat({ valorRecebido: 39_000_00, quitado: true }),
      receitas: [rec()],
      livro: vazio,
      modo: "editar",
      hoje: HOJE,
    });
    expect(calculosFaturamento(f).diferenca).toBe(-1_000_00);
    expect(preencherRecebido(f, "bruto", HOJE).valorRecebido).toBe(40_000_00);
  });

  it("vencida tem precedência na situação; busca por NF", () => {
    expect(situacaoParcela({ vencido: true, status: "Faturada" })).toBe("Vencida");
    const e = ev();
    const livro = { ...vazio, receitas: [rec()], faturamentos: [fat({ nf: "NF-778" })] };
    const m = eventMetrics(e, livro, HOJE);
    expect(gruposFaturamento(m, HOJE, "778", false)).toHaveLength(1);
    expect(gruposFaturamento(m, HOJE, "inexistente", false)).toHaveLength(0);
  });
});

describe("contas", () => {
  it("select: só ativas, mais a já escolhida; rótulo com banco", () => {
    const cs = [conta(), conta({ id: "6", nome: "Antiga", banco: "", ativa: false })];
    expect(contasSelecionaveis(cs, "").map((c) => c.id)).toEqual(["5"]);
    expect(contasSelecionaveis(cs, "6").map((c) => c.id)).toEqual(["5", "6"]);
    expect(rotuloConta(cs[0]!)).toBe("Conta movimento · Banco do Brasil");
    expect(rotuloConta(cs[1]!)).toBe("Antiga");
    expect(nomeConta(cs, "99")).toBe("—");
  });

  it("conta criada na hora entra no fim; conta editada substitui pelo id", () => {
    const cs = [conta()];
    expect(contasComExtras(cs, [conta({ id: "9", nome: "Nova" })]).map((c) => c.id)).toEqual([
      "5",
      "9",
    ]);
    expect(contasComExtras(cs, [conta({ nome: "Renomeada" })])[0]!.nome).toBe("Renomeada");
  });

  it("nova conta: 1º de janeiro do ano, ativa; saldo inicial negativo é aceito", () => {
    const f = formConta(null, HOJE);
    expect(f).toMatchObject({
      tipo: "Conta corrente",
      dataSaldoInicial: "2026-01-01",
      ativa: true,
      saldoInicial: 0,
    });
    expect(
      validarConta(dadosDaConta({ ...f, nome: "Cheque especial", saldoInicial: -1_500_00 })),
    ).toEqual({ ok: true });
    expect(validarConta(dadosDaConta(f))).toEqual({
      ok: false,
      erro: "Informe o nome da conta.",
      campo: "nome",
    });
  });
});

describe("validadeAoMudarRetencaoContratual", () => {
  const invalida = { retencaoContratualLiberada: true, valorFaturado: true };
  it("retenção contratual zerada (o campo \"já liberada\" some) limpa a validade dele, e só dele", () => {
    expect(validadeAoMudarRetencaoContratual(invalida, 0)).toEqual({ retencaoContratualLiberada: false, valorFaturado: true });
    expect(validadeAoMudarRetencaoContratual(invalida, null)).toEqual({ retencaoContratualLiberada: false, valorFaturado: true });
  });
  it("com retenção contratual positiva a validade fica como está", () => {
    expect(validadeAoMudarRetencaoContratual(invalida, 5000)).toBe(invalida);
  });
});
