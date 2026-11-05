import { describe, expect, it } from "vitest";
import {
  comDefaultsDeLancamento,
  podeExcluirConta,
  podeExcluirCusto,
  podeExcluirReceita,
  validarConta,
  validarCusto,
  validarEtapas,
  validarEvento,
  validarFaturamento,
  validarPagamento,
  validarReceita,
  type DadosContaFin,
  type DadosCustoFin,
  type DadosEventoFin,
  type DadosFaturamentoFin,
  type DadosPagamentoFin,
  type DadosReceitaFin,
} from "./validacao";
import type { ContaFin, CustoFin, FaturamentoFin, LivroFinanceiro, PagamentoFin, ReceitaFin } from "./tipos";

const livroVazio = (p: Partial<LivroFinanceiro> = {}): LivroFinanceiro => ({
  eventos: [], receitas: [], faturamentos: [], custos: [], pagamentos: [], contas: [], ...p,
});
const falha = (erro: string, campo: string) => ({ ok: false, erro, campo });

const eventoOk: DadosEventoFin = {
  nome: "Seminário", vertical: "Educação", tipo: "Evento aberto", modalidade: "Online ao vivo",
  programa: "", modulo: "", cliente: "", cidade: "", uf: "", local: "", dataInicio: "2026-02-01",
  dataFim: "2026-02-02", cargaHoraria: 8, responsavel: "Fulano", status: "Planejado", qtdPrevista: 10,
  capacidade: 20, efetivos: 0, pagantesPrev: 0, cortesiasPrev: 0, refContratual: "", observacoes: "",
};

describe("validarEvento", () => {
  it("aceita o evento completo", () => expect(validarEvento(eventoOk)).toEqual({ ok: true }));
  const casos: [string, Partial<DadosEventoFin>, string, string][] = [
    ["nome", { nome: "  " }, "Informe o nome do evento.", "nome"],
    ["vertical", { vertical: "" }, "Selecione a vertical.", "vertical"],
    ["tipo", { tipo: "" }, "Selecione o tipo de operação.", "tipo"],
    ["modalidade", { modalidade: "" }, "Selecione a modalidade.", "modalidade"],
    ["programa", { tipo: "Programa", programa: "" }, "Informe o programa.", "programa"],
    ["programa (módulo)", { tipo: "Módulo", programa: "", modulo: "M1" }, "Informe o programa.", "programa"],
    ["módulo", { tipo: "Módulo", programa: "AGIP", modulo: "" }, "Informe o módulo.", "modulo"],
    ["cliente B2G", { tipo: "In Company / Projeto B2G", cliente: "" }, "Em In Company/B2G o cliente/órgão principal é obrigatório.", "cliente"],
    ["dataInicio", { dataInicio: "" }, "Informe a data inicial.", "dataInicio"],
    ["dataFim", { dataFim: "" }, "Informe a data final.", "dataFim"],
    ["datas invertidas", { dataInicio: "2026-02-01", dataFim: "2026-01-01" }, "A data final não pode ser anterior à inicial.", "dataFim"],
    ["carga", { cargaHoraria: 0 }, "Informe a carga horária.", "cargaHoraria"],
    ["local", { modalidade: "Presencial", local: "" }, "Informe o local (presencial/híbrido).", "local"],
    ["responsável", { responsavel: "" }, "Informe o responsável.", "responsavel"],
    ["status", { status: "" as never }, "Informe o status operacional.", "status"],
    ["capacidade", { qtdPrevista: 21, capacidade: 20 }, "Participantes previstos excedem a capacidade.", "qtdPrevista"],
    ["negativo", { efetivos: -1 }, "Valor não pode ser negativo.", "efetivos"],
    ["negativo pagantesPrev", { pagantesPrev: -1 }, "Valor não pode ser negativo.", "pagantesPrev"],
  ];
  it.each(casos)("%s", (_n, over, erro, campo) => {
    expect(validarEvento({ ...eventoOk, ...over })).toEqual(falha(erro, campo));
  });
  it("sem capacidade informada não compara previstos", () => {
    expect(validarEvento({ ...eventoOk, capacidade: 0, qtdPrevista: 999 })).toEqual({ ok: true });
  });
  it("evento do CRM sem modalidade/dataFim é recusado até o wizard completar", () => {
    expect(validarEvento({ ...eventoOk, modalidade: "" }).ok).toBe(false);
    expect(validarEvento({ ...eventoOk, dataFim: "" }).ok).toBe(false);
  });
  it("exemplo do brief", () => {
    expect(validarEvento({ ...eventoOk, dataFim: "2026-01-01", dataInicio: "2026-02-01" }))
      .toEqual({ ok: false, erro: "A data final não pode ser anterior à inicial.", campo: "dataFim" });
  });
});

const receitaOk: DadosReceitaFin = {
  eventoId: "E1", tipoLancamento: "Evento", centroCusto: "OPE", cliente: "Prefeitura", segmento: "Estadual",
  origem: "Inscrição", tipoReceita: "Inscrição", etapa: "", qtde: 10, valorUnit: 1000, desconto: 0, pagantes: 10,
  cortesias: 0, statusEconomico: "Contratada", criterioReconhecimento: "", etapas: [], competencia: "",
  referencia: "", observacao: "",
};
const rec = (p: Partial<ReceitaFin> = {}): ReceitaFin => ({ ...receitaOk, id: "R1", ...p }) as ReceitaFin;
const fat = (p: Partial<FaturamentoFin> = {}): FaturamentoFin => ({ id: "F1", receitaId: "R1", eventoId: "E1", valorFaturado: 4000, valorRecebido: 0, ...p }) as FaturamentoFin;

describe("comDefaultsDeLancamento", () => {
  it("OPE quando há evento e o centro veio vazio", () => {
    expect(comDefaultsDeLancamento({ eventoId: "7", centroCusto: "" }).centroCusto).toBe("OPE");
  });
  it("não mexe quando preenchido ou sem evento", () => {
    expect(comDefaultsDeLancamento({ eventoId: "7", centroCusto: "COM" }).centroCusto).toBe("COM");
    expect(comDefaultsDeLancamento({ eventoId: "", centroCusto: "" }).centroCusto).toBe("");
  });
});

describe("validarReceita", () => {
  const v = (d: Partial<DadosReceitaFin>, livro = livroVazio(), id: string | null = null) => validarReceita({ ...receitaOk, ...d }, livro, id);
  it("aceita receita completa", () => expect(v({})).toEqual({ ok: true }));
  it("evento vazio e não corporativa", () => expect(v({ eventoId: "" })).toEqual(falha("Lançamento sem evento: marque-o como receita corporativa.", "eventoId")));
  it("centro de custo nasce OPE com evento", () => expect(v({ centroCusto: "" })).toEqual({ ok: true }));
  it("centro de custo obrigatório sem evento", () =>
    expect(v({ eventoId: "", tipoLancamento: "Corporativa", centroCusto: "", origem: "x", competencia: "2026-01" }))
      .toEqual(falha("Informe o centro de custo (obrigatório em todo lançamento).", "centroCusto")));
  it("corporativa exige origem", () =>
    expect(v({ eventoId: "", tipoLancamento: "Corporativa", origem: "" })).toEqual(falha("Selecione a origem da receita corporativa.", "origem")));
  it("corporativa exige competência", () =>
    expect(v({ eventoId: "", tipoLancamento: "Corporativa", competencia: "" })).toEqual(falha("Informe a competência econômica da receita corporativa.", "competencia")));
  it("cliente", () => expect(v({ cliente: " " })).toEqual(falha("Informe o cliente/órgão.", "cliente")));
  it("segmento", () => expect(v({ segmento: "" })).toEqual(falha("Selecione o segmento.", "segmento")));
  it("tipoReceita", () => expect(v({ tipoReceita: "" })).toEqual(falha("Selecione o tipo de receita.", "tipoReceita")));
  it("qtde", () => expect(v({ qtde: 0 })).toEqual(falha("Quantidade deve ser maior que zero.", "qtde")));
  it("valorUnit", () => expect(v({ valorUnit: 0 })).toEqual(falha("Informe o valor.", "valorUnit")));
  it("desconto acima do bruto", () => expect(v({ desconto: 10001 })).toEqual(falha("Desconto inválido (entre zero e o valor bruto).", "desconto")));
  it("desconto negativo", () => expect(v({ desconto: -1 })).toEqual(falha("Desconto inválido (entre zero e o valor bruto).", "desconto")));
  it("pagantes negativos", () => expect(v({ pagantes: -1 })).toEqual(falha("Pagantes e cortesias não podem ser negativos.", "pagantes")));
  it("cortesias negativas", () => expect(v({ cortesias: -1 })).toEqual(falha("Pagantes e cortesias não podem ser negativos.", "pagantes")));
  it("com faturamento não volta para Prevista (só na edição)", () => {
    const livro = livroVazio({ faturamentos: [fat()] });
    expect(v({ statusEconomico: "Prevista" }, livro, "R1")).toEqual(falha('Receita com faturamento não pode voltar para "Prevista".', "statusEconomico"));
    expect(v({ statusEconomico: "Prevista" }, livro, null)).toEqual({ ok: true });
  });
  it("valor não pode ficar abaixo do faturado", () => {
    const livro = livroVazio({ faturamentos: [fat({ valorFaturado: 6000 }), fat({ id: "F2", valorFaturado: 2000 })] });
    expect(v({ qtde: 7, valorUnit: 1000 }, livro, "R1")).toEqual(falha("Valor contratado não pode ser inferior ao já faturado (R$ 80,00).", "valorUnit"));
    expect(v({ qtde: 8, valorUnit: 1000 }, livro, "R1")).toEqual({ ok: true });
  });
});

describe("validarEtapas", () => {
  const e = (p = {}) => ({ nome: "Etapa 1", base: "valor" as const, valor: 100, percentual: 0, concluida: false, dataConclusao: "", ...p });
  it("aceita etapas coerentes e lista vazia", () => {
    expect(validarEtapas(rec(), [e(), e({ base: "percentual", valor: 0, percentual: 50 })])).toEqual({ ok: true });
    expect(validarEtapas(rec(), [])).toEqual({ ok: true });
  });
  it("não bloqueia soma divergente (o protótipo só avisa)", () => {
    expect(validarEtapas(rec(), [e({ valor: 999999 })])).toEqual({ ok: true });
  });
  it("recusa o que as caixas do protótipo já impediam (min/max)", () => {
    expect(validarEtapas(rec(), [e({ valor: -1 })]).ok).toBe(false);
    expect(validarEtapas(rec(), [e({ base: "percentual", percentual: 101 })]).ok).toBe(false);
  });
});

const dadosFat: DadosFaturamentoFin = {
  receitaId: "R1", parcela: "Etapa 1", nf: "", dataFaturamento: "2026-03-01", valorFaturado: 4000, vencimento: "2026-03-31",
  retencaoTributaria: 0, retencaoContratual: 0, retencaoContratualLiberada: 0, dataRecebimento: "", valorRecebido: 0,
  contaId: "", observacao: "",
};
const conta = (p: Partial<ContaFin> = {}): ContaFin => ({ id: "CT1", nome: "Itaú", tipo: "Conta corrente", saldoInicial: 0, dataSaldoInicial: "2026-01-01", ativa: true, ...p }) as ContaFin;

describe("validarFaturamento", () => {
  const livro = (p: Partial<LivroFinanceiro> = {}) => livroVazio({ receitas: [rec()], contas: [conta()], ...p });
  const v = (d: Partial<DadosFaturamentoFin>, l = livro(), id: string | null = null) => validarFaturamento({ ...dadosFat, ...d }, l, id);
  it("aceita faturamento completo", () => expect(v({})).toEqual({ ok: true }));
  it("receita inexistente", () => expect(v({ receitaId: "XX" })).toEqual(falha("Selecione a receita vinculada.", "receitaId")));
  it("receita prevista", () =>
    expect(v({}, livro({ receitas: [rec({ statusEconomico: "Prevista" })] }))).toEqual(falha("Apenas receitas contratadas podem ser faturadas.", "receitaId")));
  it("parcela", () => expect(v({ parcela: " " })).toEqual(falha("Informe a parcela/etapa.", "parcela")));
  it("dataFaturamento", () => expect(v({ dataFaturamento: "" })).toEqual(falha("Informe a data de faturamento.", "dataFaturamento")));
  it("valorFaturado", () => expect(v({ valorFaturado: 0 })).toEqual(falha("Informe o valor faturado.", "valorFaturado")));
  it("vencimento", () => expect(v({ vencimento: "" })).toEqual(falha("Informe o vencimento.", "vencimento")));
  it("vencimento antes do faturamento", () => expect(v({ vencimento: "2026-02-01" })).toEqual(falha("O vencimento não pode ser anterior ao faturamento.", "vencimento")));
  it("excede saldo a faturar, descontando os outros e ignorando o próprio", () => {
    const l = livro({ faturamentos: [fat({ id: "F1", valorFaturado: 6000 }), fat({ id: "F2", valorFaturado: 3000 })] });
    expect(v({ valorFaturado: 7001 }, l, "F1")).toEqual(falha("Faturamento excede o saldo a faturar da receita (R$ 70,00).", "valorFaturado"));
    expect(v({ valorFaturado: 7000 }, l, "F1")).toEqual({ ok: true });
    expect(v({ valorFaturado: 1001 }, l, null).ok).toBe(false); // novo: sobram só 10,00-9,00=1000
  });
  it("saldo zero imprime travessão como o protótipo", () => {
    const l = livro({ faturamentos: [fat({ valorFaturado: 10000 })] });
    expect(v({ valorFaturado: 1 }, l, null)).toEqual(falha("Faturamento excede o saldo a faturar da receita (—).", "valorFaturado"));
  });
  it("retenção negativa", () => expect(v({ retencaoTributaria: -1 })).toEqual(falha("Retenção não pode ser negativa.", "retencaoTributaria")));
  it("retenção contratual negativa", () => expect(v({ retencaoContratual: -1 })).toEqual(falha("Retenção não pode ser negativa.", "retencaoTributaria")));
  it("soma das retenções", () => expect(v({ retencaoTributaria: 3000, retencaoContratual: 1001 })).toEqual(falha("A soma das retenções não pode exceder o valor faturado.", "retencaoTributaria")));
  it("liberada acima da retida", () => expect(v({ retencaoContratual: 100, retencaoContratualLiberada: 101 })).toEqual(falha("Retenção contratual liberada não pode exceder a retida.", "retencaoContratualLiberada")));
  it("recebido acima do faturado", () => expect(v({ valorRecebido: 4001 })).toEqual(falha("Valor recebido não pode exceder o faturado.", "valorRecebido")));
  it("recebido exige data", () => expect(v({ valorRecebido: 100 })).toEqual(falha("Informe a data de recebimento.", "dataRecebimento")));
  it("recebido exige conta", () => expect(v({ valorRecebido: 100, dataRecebimento: "2026-04-01" })).toEqual(falha("Informe a conta financeira creditada (toda entrada de caixa tem conta).", "contaId")));
  it("conta inexistente", () => expect(v({ valorRecebido: 100, dataRecebimento: "2026-04-01", contaId: "ZZ" })).toEqual(falha("Conta financeira inexistente.", "contaId")));
  it("recebimento completo é aceito", () => expect(v({ valorRecebido: 100, dataRecebimento: "2026-04-01", contaId: "CT1" })).toEqual({ ok: true }));
  it("data de recebimento sem valor", () => expect(v({ dataRecebimento: "2026-04-01" })).toEqual(falha("Informe o valor recebido.", "valorRecebido")));
});

const custoOk: DadosCustoFin = {
  eventoId: "E1", tipoLancamento: "Evento", centroCusto: "OPE", compartilhada: false, origemLancamento: "", fase: "Pré-evento",
  categoria: "Palestrantes", subcategoria: "", descricao: "Cachê", fornecedor: "", documento: "", natureza: "Direto",
  comportamento: "Fixo", driver: "", unidade: "", qtde: 1, valorUnitPrev: 1000, valorRealizado: 0, competencia: "",
  dataPrevista: "", criterioApropriacao: "", observacao: "",
};
const cus = (p: Partial<CustoFin> = {}): CustoFin => ({ ...custoOk, id: "C1", ...p }) as CustoFin;
const pag = (p: Partial<PagamentoFin> = {}): PagamentoFin => ({ id: "P1", custoId: "C1", eventoId: "E1", valor: 500, valorPago: 0, ...p }) as PagamentoFin;

describe("validarCusto", () => {
  const v = (d: Partial<DadosCustoFin>, l = livroVazio(), id: string | null = null) => validarCusto({ ...custoOk, ...d }, l, id);
  it("aceita custo completo", () => expect(v({})).toEqual({ ok: true }));
  it("sem evento e não corporativa", () => expect(v({ eventoId: "" })).toEqual(falha("Lançamento sem evento: marque-o como despesa corporativa.", "eventoId")));
  it("centro de custo OPE por default no evento", () => expect(v({ centroCusto: "" })).toEqual({ ok: true }));
  it("centro obrigatório sem evento", () =>
    expect(v({ eventoId: "", tipoLancamento: "Corporativa", centroCusto: "", competencia: "2026-01" })).toEqual(falha("Informe o centro de custo (obrigatório em todo lançamento).", "centroCusto")));
  it("corporativa exige competência", () =>
    expect(v({ eventoId: "", tipoLancamento: "Corporativa", competencia: "" })).toEqual(falha("Informe a competência econômica da despesa corporativa.", "competencia")));
  it("evento exige fase", () => expect(v({ fase: "" })).toEqual(falha("Selecione a fase.", "fase")));
  it("corporativa dispensa fase", () => expect(v({ eventoId: "", tipoLancamento: "Corporativa", fase: "", competencia: "2026-01", centroCusto: "ADM" })).toEqual({ ok: true }));
  it("categoria", () => expect(v({ categoria: "" })).toEqual(falha("Selecione a categoria.", "categoria")));
  it("descrição", () => expect(v({ descricao: " " })).toEqual(falha("Informe a descrição.", "descricao")));
  it("qtde", () => expect(v({ qtde: 0 })).toEqual(falha("Quantidade deve ser maior que zero.", "qtde")));
  it("valorUnitPrev", () => expect(v({ valorUnitPrev: -1 })).toEqual(falha("Valor unitário inválido.", "valorUnitPrev")));
  it("valorRealizado", () => expect(v({ valorRealizado: -1 })).toEqual(falha("Valor realizado inválido.", "valorRealizado")));
  it("realizado abaixo do já pago (só na edição)", () => {
    const l = livroVazio({ pagamentos: [pag({ valorPago: 300 }), pag({ id: "P2", valorPago: 200 })] });
    expect(v({ valorRealizado: 499 }, l, "C1")).toEqual(falha("Valor realizado não pode ser inferior ao já pago (R$ 5,00).", "valorRealizado"));
    expect(v({ valorRealizado: 500 }, l, "C1")).toEqual({ ok: true });
    expect(v({ valorRealizado: 499 }, l, null)).toEqual({ ok: true });
  });
});

const dadosPag: DadosPagamentoFin = {
  custoId: "C1", documento: "", vencimento: "2026-05-01", valor: 500, dataPagamento: "", valorPago: 0, contaId: "", observacao: "",
};

describe("validarPagamento", () => {
  const livro = (c: Partial<CustoFin> = {}, extra: Partial<LivroFinanceiro> = {}) => livroVazio({ custos: [cus({ valorRealizado: 1000, ...c })], contas: [conta()], ...extra });
  const v = (d: Partial<DadosPagamentoFin>, l = livro(), id: string | null = null) => validarPagamento({ ...dadosPag, ...d }, l, id);
  it("aceita título completo", () => expect(v({})).toEqual({ ok: true }));
  it("custo inexistente", () => expect(v({ custoId: "ZZ" })).toEqual(falha("Selecione o custo vinculado.", "custoId")));
  it("vencimento", () => expect(v({ vencimento: "" })).toEqual(falha("Informe o vencimento.", "vencimento")));
  it("valor", () => expect(v({ valor: 0 })).toEqual(falha("Informe o valor do título.", "valor")));
  it("excede saldo (base = realizado)", () => {
    const l = livro({}, { pagamentos: [pag({ valor: 600 })] });
    expect(v({ valor: 401 }, l)).toEqual(falha("Valor programado excede o saldo do custo (R$ 4,00).", "valor"));
    expect(v({ valor: 400 }, l)).toEqual({ ok: true });
  });
  it("base = previsto quando não há realizado; ignora o próprio título", () => {
    const l = livro({ valorRealizado: 0, qtde: 2, valorUnitPrev: 250 }, { pagamentos: [pag({ valor: 500 })] });
    expect(v({ valor: 1 }, l, null)).toEqual(falha("Valor programado excede o saldo do custo (—).", "valor"));
    expect(v({ valor: 500 }, l, "P1")).toEqual({ ok: true });
  });
  it("pago acima do título", () => expect(v({ valorPago: 501 })).toEqual(falha("Valor pago não pode exceder o valor do título.", "valorPago")));
  it("pago negativo", () => expect(v({ valorPago: -1 })).toEqual(falha("Valor pago não pode exceder o valor do título.", "valorPago")));
  it("baixa sem realizado (exemplo do brief)", () => {
    const l = livro({ valorRealizado: 0 });
    expect(v({ valorPago: 100 }, l)).toEqual(falha("Registre o valor realizado do custo antes da baixa (CUSTO REALIZADO ≠ PAGO)", "valorPago"));
  });
  it("total pago acima do realizado", () => {
    const l = livro({ valorRealizado: 600 }, { pagamentos: [pag({ valor: 100, valorPago: 400 })] });
    expect(v({ valor: 500, valorPago: 201, dataPagamento: "2026-05-02", contaId: "CT1" }, l)).toEqual(falha("Total pago excederia o custo realizado.", "valorPago"));
  });
  it("baixa exige data", () => expect(v({ valorPago: 100 })).toEqual(falha("Informe a data de pagamento.", "dataPagamento")));
  it("baixa exige conta", () => expect(v({ valorPago: 100, dataPagamento: "2026-05-02" })).toEqual(falha("Informe a conta financeira debitada (toda saída de caixa tem conta).", "contaId")));
  it("conta inexistente", () => expect(v({ valorPago: 100, dataPagamento: "2026-05-02", contaId: "ZZ" })).toEqual(falha("Conta financeira inexistente.", "contaId")));
  it("baixa completa", () => expect(v({ valorPago: 100, dataPagamento: "2026-05-02", contaId: "CT1" })).toEqual({ ok: true }));
  it("data sem valor pago", () => expect(v({ dataPagamento: "2026-05-02" })).toEqual(falha("Informe o valor pago.", "valorPago")));
});

const dadosConta: DadosContaFin = { nome: "Itaú", tipo: "Conta corrente", banco: "", agencia: "", numero: "", saldoInicial: 0, dataSaldoInicial: "2026-01-01", ativa: true, observacao: "" };

describe("validarConta", () => {
  it("aceita", () => expect(validarConta(dadosConta)).toEqual({ ok: true }));
  it("nome", () => expect(validarConta({ ...dadosConta, nome: " " })).toEqual(falha("Informe o nome da conta.", "nome")));
  it("tipo", () => expect(validarConta({ ...dadosConta, tipo: "" })).toEqual(falha("Selecione o tipo de conta.", "tipo")));
  it("saldo inicial não inteiro", () => expect(validarConta({ ...dadosConta, saldoInicial: 10.5 })).toEqual(falha("Saldo inicial inválido.", "saldoInicial")));
  it("saldo negativo é permitido", () => expect(validarConta({ ...dadosConta, saldoInicial: -500 })).toEqual({ ok: true }));
  it("data", () => expect(validarConta({ ...dadosConta, dataSaldoInicial: "" })).toEqual(falha("Informe a data do saldo inicial.", "dataSaldoInicial")));
});

describe("bloqueios de exclusão", () => {
  it("receita com faturamentos", () => {
    const l = livroVazio({ faturamentos: [fat(), fat({ id: "F2" })] });
    expect(podeExcluirReceita("R1", l)).toEqual(falha("Esta receita possui 2 faturamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.", ""));
    expect(podeExcluirReceita("R9", l)).toEqual({ ok: true });
  });
  it("custo com pagamentos", () => {
    const l = livroVazio({ pagamentos: [pag()] });
    expect(podeExcluirCusto("C1", l)).toEqual(falha("Este custo possui 1 pagamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.", ""));
    expect(podeExcluirCusto("C9", l)).toEqual({ ok: true });
  });
  it("conta usada em faturamento ou pagamento", () => {
    const l = livroVazio({ faturamentos: [fat({ contaId: "CT1" })], pagamentos: [pag({ contaId: "CT1" })] });
    expect(podeExcluirConta("CT1", l)).toEqual(falha("Esta conta possui 2 movimentação(ões) vinculada(s). Inative-a em vez de excluí-la.", ""));
    expect(podeExcluirConta("CT2", l)).toEqual({ ok: true });
  });
});
