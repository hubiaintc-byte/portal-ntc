import { describe, expect, it } from "vitest";

import {
  eventAlerts,
  eventMetrics,
  validarEtapas,
  validarReceita,
  type EventoFin,
  type FaturamentoFin,
  type LivroFinanceiro,
  type ReceitaFin,
} from "@ntc/lib";

import {
  ABAS_EVENTO,
  alternarConclusao,
  etapaComValorInvalido,
  buscaCasa,
  calculosReceita,
  camposDetalhesReceita,
  clientesSugeridos,
  contagensAbas,
  dadosDaReceita,
  descricaoReceitaSalva,
  etapasParaSalvar,
  fatosDoEvento,
  formReceita,
  fracoesParticipantes,
  indicadoresParticipante,
  linhasReceitas,
  localDoEvento,
  novaEtapa,
  operacaoDoEvento,
  percentualDe,
  receitasContratadas,
  reconhecidoComEtapas,
  resumoReceitas,
  somasEtapas,
  temVencido,
} from "./dadosArea";

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
    modulo: "Módulos 01 a 03",
    cliente: "Prefeitura de Recife",
    cidade: "Recife",
    uf: "PE",
    local: "Auditório",
    dataInicio: "2026-08-10",
    dataFim: "2026-08-12",
    cargaHoraria: 24,
    responsavel: "Departamento Financeiro",
    status: "Planejado",
    qtdPrevista: 0,
    capacidade: 0,
    efetivos: 0,
    pagantesPrev: 0,
    cortesiasPrev: 0,
    refCrm: "",
    refContratual: "CT-12/2026",
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
    parcela: "1/1",
    nf: "",
    dataFaturamento: "2026-07-01",
    valorFaturado: 10_000_00,
    vencimento: "2026-07-05",
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

describe("abas e cabeçalho", () => {
  it("abas na ordem do protótipo, sem Comissões", () => {
    expect(ABAS_EVENTO.map((a) => a.rotulo)).toEqual([
      "Visão geral",
      "Receitas",
      "Custos",
      "Faturamento e recebimentos",
      "Pagamentos",
      "Resultado",
    ]);
  });

  it("contagens por aba e o '!' de vencido", () => {
    const e = ev();
    const livro = { ...vazio, eventos: [e], receitas: [rec()], faturamentos: [fat()] };
    const m = eventMetrics(e, livro, HOJE);
    expect(contagensAbas(e, livro, m)).toEqual({
      receitas: 1,
      custos: 0,
      faturamento: 1,
      pagamentos: 0,
    });
    expect(temVencido(eventAlerts(e, livro, HOJE, m))).toBe(true);
    expect(temVencido([])).toBe(false);
  });
});

describe("visão geral", () => {
  it("livro vazio: fatos, operação e percentuais sem NaN", () => {
    const e = ev({ cargaHoraria: 0 });
    const m = eventMetrics(e, vazio, HOJE);
    const fatos = fatosDoEvento(e, m);
    expect(fatos).toHaveLength(11);
    expect(fatos.map((f) => f.rotulo)).not.toContain("Referência CRM");
    expect(fatos.find((f) => f.rotulo === "Carga horária")?.texto).toBe("0 h");
    expect(fatos.every((f) => !/NaN|Infinity/.test(f.texto))).toBe(true);
    expect(operacaoDoEvento(e, m)).toEqual([]);
    expect(percentualDe(0, 0)).toBe("—");
    expect(percentualDe(1, 4)).toBe("25%");
  });

  it("evento aberto: cliente múltiplo e pagantes/cortesias mesmo zerados", () => {
    const e = ev({ tipo: "Evento aberto", cliente: "" });
    const livro = {
      ...vazio,
      eventos: [e],
      receitas: [rec({ cliente: "TCE B" }), rec({ id: "11", cliente: "tce b" })],
    };
    const m = eventMetrics(e, livro, HOJE);
    expect(fatosDoEvento(e, m).find((f) => f.rotulo === "Cliente / órgão")?.texto).toBe(
      "Múltiplos · 1 órgão(s)",
    );
    expect(operacaoDoEvento(e, m).map((x) => x[0])).toEqual(["Pagantes", "Cortesias"]);
  });

  it("local: online e sem cidade não deixam '/' solto", () => {
    expect(localDoEvento({ modalidade: "Online ao vivo", local: "", cidade: "", uf: "" })).toBe(
      "Online",
    );
    expect(localDoEvento({ modalidade: "Presencial", local: "", cidade: "Recife", uf: "PE" })).toBe(
      "— · Recife/PE",
    );
  });

  it("efetivos só em execução/realizado/encerrado, com % do previsto", () => {
    const e = ev({ status: "Realizado", efetivos: 30, qtdPrevista: 40, capacidade: 50 });
    const op = operacaoDoEvento(e, eventMetrics(e, vazio, HOJE));
    expect(op[0]).toEqual(["Previstos", "40", "capacidade 50"]);
    expect(op[1]).toEqual(["Efetivos", "30", "75% do previsto"]);
  });
});

describe("receitas", () => {
  it("busca por termos, sem acento", () => {
    expect(buscaCasa("", "x")).toBe(true);
    expect(buscaCasa("recife munic", "Prefeitura de Recife", "Municipal - Capital")).toBe(true);
    expect(buscaCasa("sao", "São Paulo")).toBe(true);
    expect(buscaCasa("tce", "Prefeitura")).toBe(false);
  });

  it("linhas com reconhecida e etapas; resumo do rodapé", () => {
    const e = ev();
    const r = rec({
      etapas: [
        {
          nome: "M1",
          base: "valor",
          valor: 40_000_00,
          percentual: 0,
          concluida: true,
          dataConclusao: "2026-07-01",
        },
        {
          nome: "M2",
          base: "percentual",
          valor: 0,
          percentual: 60,
          concluida: false,
          dataConclusao: "",
        },
      ],
    });
    const livro = {
      ...vazio,
      eventos: [e],
      receitas: [r, rec({ id: "11", statusEconomico: "Prevista", desconto: 5_00 })],
    };
    const m = eventMetrics(e, livro, HOJE);
    const [l] = linhasReceitas(m, livro, HOJE, "10");
    expect(l?.reconhecida).toBe(40_000_00);
    expect([l?.etapasConcluidas, l?.etapasTotal]).toEqual([1, 2]);
    expect(resumoReceitas(m, livro, HOJE)).toEqual({
      nContratadas: 1,
      orgaos: 1,
      descontoContratado: 0,
      reconhecidaTotal: 40_000_00,
    });
    expect(receitasContratadas(m).map((x) => x.id)).toEqual(["10"]);
  });

  it("clientes sugeridos únicos e ordenados", () => {
    expect(
      clientesSugeridos({
        ...vazio,
        receitas: [rec({ cliente: "B" }), rec({ cliente: "A" }), rec({ cliente: "B" })],
      }),
    ).toEqual(["A", "B"]);
  });
});

describe("gaveta de receita", () => {
  it("B2G nova herda cliente, módulo e referência do evento; centro OPE", () => {
    const f = formReceita(ev(), null);
    expect(f).toMatchObject({
      cliente: "Prefeitura de Recife",
      etapa: "Módulos 01 a 03",
      referencia: "CT-12/2026",
      centroCusto: "OPE",
      qtde: "1",
      tipoReceita: "Valor global",
      origem: "Contrato B2G",
    });
  });

  it("evento aberto nova: cliente livre, Inscrição, OPE", () => {
    const f = formReceita(ev({ tipo: "Evento aberto" }), null);
    expect(f).toMatchObject({
      cliente: "",
      origem: "Inscrição (evento aberto)",
      tipoReceita: "Inscrição",
      qtde: "",
      centroCusto: "OPE",
    });
  });

  it("dados: B2G grava qtde 1; aberto usa as inscrições; vazios viram 0; mantém etapas ao editar", () => {
    const b2g = ev();
    const f = {
      ...formReceita(b2g, null),
      segmento: "Estadual",
      valorUnit: 50_000_00,
      qtde: "7",
      pagantes: "",
    };
    const d = dadosDaReceita(f, b2g, null);
    expect(d).toMatchObject({
      eventoId: "1",
      tipoLancamento: "Evento",
      qtde: 1,
      pagantes: 0,
      centroCusto: "OPE",
      etapas: [],
    });
    expect(validarReceita(d, vazio, null)).toEqual({ ok: true });

    const aberto = ev({ tipo: "Evento aberto" });
    const fa = {
      ...formReceita(aberto, null),
      cliente: "TCE",
      segmento: "Estadual",
      qtde: "10",
      valorUnit: 300_00,
      desconto: 200_00,
      pagantes: "10",
      cortesias: "2",
    };
    expect(calculosReceita(fa, aberto)).toEqual({
      bruto: 3_000_00,
      contratado: 2_800_00,
      participantes: 12,
    });
    expect(descricaoReceitaSalva("12", dadosDaReceita(fa, aberto, null))).toBe(
      "12 · TCE · R$ 2.800,00",
    );

    const r = rec({
      etapas: [
        { nome: "M1", base: "valor", valor: 1, percentual: 0, concluida: false, dataConclusao: "" },
      ],
      criterioReconhecimento: "Integral no encerramento",
    });
    const de = dadosDaReceita(formReceita(b2g, r), b2g, r);
    expect(de.etapas).toHaveLength(1);
    expect(de.criterioReconhecimento).toBe("Integral no encerramento");
  });

  it("validação imediata devolve o campo (que pode estar em Mais detalhes)", () => {
    const b2g = ev();
    const d = dadosDaReceita(
      { ...formReceita(b2g, null), segmento: "Estadual", valorUnit: 100_00, desconto: 200_00 },
      b2g,
      null,
    );
    const v = validarReceita(d, vazio, null);
    expect(v).toMatchObject({ ok: false, campo: "desconto" });
    expect(camposDetalhesReceita(b2g)).toContain("desconto");
    expect(camposDetalhesReceita(ev({ tipo: "Evento aberto" }))).not.toContain("desconto");
    // Centro vazio em lançamento de evento cai no OPE (spec §3.7), como no servidor.
    expect(validarReceita({ ...d, desconto: 0, centroCusto: "" }, vazio, null)).toEqual({
      ok: true,
    });
  });
});

describe("gaveta de etapas", () => {
  it("somas, divergência e concluir/reabrir", () => {
    const a = { ...novaEtapa(0), nome: "M1", valor: 30_00 };
    const b = { ...novaEtapa(1), nome: "M2", base: "percentual" as const, percentual: 50 };
    expect(somasEtapas([a, b], 100_00)).toEqual({ soma: 80_00, concluido: 0, diverge: true });
    const ac = alternarConclusao(a, HOJE);
    expect([ac.concluida, ac.dataConclusao]).toEqual([true, HOJE]);
    expect(somasEtapas([ac, b], 100_00).concluido).toBe(30_00);
    const reaberta = alternarConclusao(ac, HOJE);
    expect(reaberta.concluida).toBe(false);
  });

  it("limpa como o protótipo: sem nome sai, base zera o outro valor, aberta sem data", () => {
    const limpa = etapasParaSalvar(
      [
        {
          ...novaEtapa(0),
          nome: "  M1 ",
          valor: 30_00,
          percentual: 10,
          concluida: true,
          dataConclusao: "",
        },
        { ...novaEtapa(1), nome: "", valor: 99 },
        {
          ...novaEtapa(2),
          nome: "M2",
          base: "percentual",
          valor: 5,
          percentual: 40,
          dataConclusao: "2026-01-01",
        },
      ],
      HOJE,
    );
    expect(limpa).toEqual([
      {
        nome: "M1",
        base: "valor",
        valor: 30_00,
        percentual: 0,
        concluida: true,
        dataConclusao: HOJE,
      },
      {
        nome: "M2",
        base: "percentual",
        valor: 0,
        percentual: 40,
        concluida: false,
        dataConclusao: "",
      },
    ]);
    expect(validarEtapas(rec(), limpa)).toEqual({ ok: true });
  });

  it("concluir uma de duas etapas muda o reconhecido", () => {
    const e = ev();
    const r = rec();
    const livro = { ...vazio, eventos: [e], receitas: [r] };
    const etapas = etapasParaSalvar(
      [
        {
          ...novaEtapa(0),
          nome: "M1",
          valor: 40_000_00,
          concluida: true,
          dataConclusao: "2026-07-01",
        },
        { ...novaEtapa(1), nome: "M2", valor: 60_000_00 },
      ],
      HOJE,
    );
    expect(reconhecidoComEtapas(r, etapas, livro, HOJE)).toBe(40_000_00);
    // Sem etapas e evento ainda não executado: nada reconhecido.
    expect(reconhecidoComEtapas(r, [], livro, HOJE)).toBe(0);
  });
});

describe("resultado", () => {
  it("livro vazio: indicadores sem NaN e frações zeradas", () => {
    const m = eventMetrics(ev(), vazio, HOJE);
    const ind = indicadoresParticipante(m);
    expect(ind.map((i) => i.rotulo)).toEqual([
      "Custo por participante",
      "Receita média por pagante",
      "Receita média por participante total",
    ]);
    expect(ind.every((i) => i.valor === null)).toBe(true);
    expect(fracoesParticipantes(m)).toEqual({ pagantes: 0, cortesias: 0 });
  });

  it("com pagantes e cortesias", () => {
    const e = ev({ tipo: "Evento aberto" });
    const livro = {
      ...vazio,
      eventos: [e],
      receitas: [rec({ qtde: 10, valorUnit: 300_00, pagantes: 9, cortesias: 3 })],
    };
    const m = eventMetrics(e, livro, HOJE);
    expect(fracoesParticipantes(m)).toEqual({ pagantes: 0.75, cortesias: 0.25 });
    const ind = indicadoresParticipante(m);
    expect(ind[1]).toMatchObject({
      valor: Math.round(3_000_00 / 9),
      base: "Receita contratada ÷ 9 pagantes",
    });
  });
});

describe("valor de etapa inválido", () => {
  it("recusa a etapa gravável com texto que não é valor; ignora sem nome e percentual", () => {
    const ok = { ...novaEtapa(0), nome: "M1", textoValor: "1.000,00" };
    const vazia = { ...novaEtapa(1), nome: "M2", textoValor: "" };
    const semNome = { ...novaEtapa(2), nome: " ", textoValor: "abc" };
    const pct = { ...novaEtapa(3), nome: "M3", base: "percentual" as const, textoValor: "abc" };
    expect(etapaComValorInvalido([ok, vazia, semNome, pct])).toBeNull();
    const ruim = { ...novaEtapa(4), nome: "M4", textoValor: "1,2,3" };
    expect(etapaComValorInvalido([ok, ruim])).toBe(4);
  });
});
