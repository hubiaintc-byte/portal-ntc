import { custoPrevisto } from "./custos";
import { formatarReais } from "./dinheiro";
import { isContratada, valorBruto, valorReceita } from "./receitas";
import type { Centavos, ContaFin, CustoFin, EtapaReceita, EventoFin, FaturamentoFin, LivroFinanceiro, PagamentoFin, ReceitaFin } from "./tipos";

/**
 * Validações dos lançamentos, portadas de `Service.validateEvento`/`save*`/`delete*`
 * do protótipo FIN-05 v0.2.2 (mapa §3.5). O `throw ValidationError(msg, field)` do
 * protótipo virou o retorno `{ ok: false, erro, campo }`; a primeira regra violada
 * vence, na ordem do protótipo. Mensagens literais. Comissão, movimento,
 * orçamento e fechamento não foram portados.
 *
 * As funções recebem o `livro` relido pelo chamador (dentro da transação, na
 * Server Action) — nunca o da tela.
 */

export type ResultadoValidacao = { ok: true } | { ok: false; erro: string; campo: string };

const OK: ResultadoValidacao = { ok: true };
const falha = (erro: string, campo: string): ResultadoValidacao => ({ ok: false, erro, campo });
const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: T[], f: (x: T) => number): number => xs.reduce((a, x) => a + n(f(x)), 0);
const vazio = (s: unknown): boolean => !s || !String(s).trim();

/** `fmtBRL` do protótipo: zero vira "—" e negativo usa o sinal "−". */
function reais(c: Centavos): string {
  if (Math.abs(c) < 0.5) return "—";
  const s = formatarReais(c);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

/** Roda as regras em ordem e devolve a primeira violação. */
function primeira(regras: Array<() => ResultadoValidacao>): ResultadoValidacao {
  for (const r of regras) {
    const x = r();
    if (!x.ok) return x;
  }
  return OK;
}
const req = (cond: unknown, erro: string, campo: string): ResultadoValidacao => (cond ? OK : falha(erro, campo));

/** Centro de custo do lançamento de evento nasce "OPE" (spec §3.7). */
export function comDefaultsDeLancamento<T extends { eventoId: string; centroCusto: string }>(d: T): T {
  return d.eventoId && !d.centroCusto ? { ...d, centroCusto: "OPE" } : d;
}

// ---------------------------------------------------------------- evento

export type DadosEventoFin = Omit<EventoFin, "id" | "refCrm" | "origem" | "eventoComercialId" | "cadastroPendente" | "canceladoNoCrm">;

/**
 * Recebe o evento já com os campos do CRM aplicados (valor do CRM vence;
 * `dataFim`/`modalidade` vazios no CRM usam o do financeiro, que o wizard exige
 * — spec §3.2). Por isso exige os dois sempre.
 */
export function validarEvento(d: DadosEventoFin): ResultadoValidacao {
  const campos: Array<keyof DadosEventoFin> = ["qtdPrevista", "capacidade", "efetivos", "pagantesPrev", "cortesiasPrev"];
  return primeira([
    () => req(!vazio(d.nome), "Informe o nome do evento.", "nome"),
    () => req(d.vertical, "Selecione a vertical.", "vertical"),
    () => req(d.tipo, "Selecione o tipo de operação.", "tipo"),
    () => req(d.modalidade, "Selecione a modalidade.", "modalidade"),
    () => (d.tipo === "Programa" || d.tipo === "Módulo" ? req(d.programa, "Informe o programa.", "programa") : OK),
    () => (d.tipo === "Módulo" ? req(d.modulo, "Informe o módulo.", "modulo") : OK),
    () => (d.tipo === "In Company / Projeto B2G" ? req(d.cliente, "Em In Company/B2G o cliente/órgão principal é obrigatório.", "cliente") : OK),
    () => req(d.dataInicio, "Informe a data inicial.", "dataInicio"),
    () => req(d.dataFim, "Informe a data final.", "dataFim"),
    () => req(d.dataFim >= d.dataInicio, "A data final não pode ser anterior à inicial.", "dataFim"),
    () => req(n(d.cargaHoraria) > 0, "Informe a carga horária.", "cargaHoraria"),
    () => (d.modalidade !== "Online ao vivo" ? req(d.local, "Informe o local (presencial/híbrido).", "local") : OK),
    () => req(d.responsavel, "Informe o responsável.", "responsavel"),
    () => req(d.status, "Informe o status operacional.", "status"),
    () => (n(d.capacidade) > 0 ? req(n(d.qtdPrevista) <= n(d.capacidade), "Participantes previstos excedem a capacidade.", "qtdPrevista") : OK),
    () => primeira(campos.map((k) => () => req(n(d[k]) >= 0, "Valor não pode ser negativo.", k))),
  ]);
}

// --------------------------------------------------------------- receita

export type DadosReceitaFin = Omit<ReceitaFin, "id">;

export function validarReceita(dados: DadosReceitaFin, livro: LivroFinanceiro, idAtual: string | null): ResultadoValidacao {
  const d = comDefaultsDeLancamento(dados);
  const corp = !d.eventoId;
  return primeira([
    () => req(d.eventoId || d.tipoLancamento === "Corporativa", "Lançamento sem evento: marque-o como receita corporativa.", "eventoId"),
    () => req(d.centroCusto, "Informe o centro de custo (obrigatório em todo lançamento).", "centroCusto"),
    () => (corp ? req(d.origem, "Selecione a origem da receita corporativa.", "origem") : OK),
    () => (corp ? req(d.competencia, "Informe a competência econômica da receita corporativa.", "competencia") : OK),
    () => req(!vazio(d.cliente), "Informe o cliente/órgão.", "cliente"),
    () => req(d.segmento, "Selecione o segmento.", "segmento"),
    () => req(d.tipoReceita, "Selecione o tipo de receita.", "tipoReceita"),
    () => req(n(d.qtde) > 0, "Quantidade deve ser maior que zero.", "qtde"),
    () => req(n(d.valorUnit) > 0, "Informe o valor.", "valorUnit"),
    () => req(n(d.desconto) >= 0 && n(d.desconto) <= valorBruto(d as ReceitaFin), "Desconto inválido (entre zero e o valor bruto).", "desconto"),
    () => req(n(d.pagantes) >= 0 && n(d.cortesias) >= 0, "Pagantes e cortesias não podem ser negativos.", "pagantes"),
    () => {
      if (!idAtual) return OK;
      const frs = livro.faturamentos.filter((f) => f.receitaId === idAtual);
      const faturado = soma(frs, (f) => f.valorFaturado);
      return primeira([
        () => req(!(d.statusEconomico === "Prevista" && frs.length), 'Receita com faturamento não pode voltar para "Prevista".', "statusEconomico"),
        () => req(valorReceita(d as ReceitaFin) >= faturado, `Valor contratado não pode ser inferior ao já faturado (${reais(faturado)}).`, "valorUnit"),
      ]);
    },
  ]);
}

/**
 * O protótipo não valida as etapas ao salvar (a divergência da soma é só um
 * aviso na tela; nomes em branco são descartados). Aqui só se recusa o que as
 * caixas da tela já impediam por `min`/`max`, que o servidor não pode presumir.
 */
export function validarEtapas(_receita: ReceitaFin | DadosReceitaFin, etapas: EtapaReceita[]): ResultadoValidacao {
  for (const e of etapas) {
    if (n(e.valor) < 0) return falha("O valor da etapa não pode ser negativo.", "etapas");
    if (n(e.percentual) < 0 || n(e.percentual) > 100) return falha("O percentual da etapa deve estar entre 0 e 100.", "etapas");
  }
  return OK;
}

export function podeExcluirReceita(id: string, livro: LivroFinanceiro): ResultadoValidacao {
  const k = livro.faturamentos.filter((f) => f.receitaId === id).length;
  return req(k === 0, `Esta receita possui ${k} faturamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.`, "");
}

// ----------------------------------------------------------- faturamento

export type DadosFaturamentoFin = Omit<FaturamentoFin, "id" | "eventoId">;

export function validarFaturamento(d: DadosFaturamentoFin, livro: LivroFinanceiro, idAtual: string | null): ResultadoValidacao {
  const r = livro.receitas.find((x) => x.id === d.receitaId);
  if (!r) return falha("Selecione a receita vinculada.", "receitaId");
  const outros = soma(livro.faturamentos.filter((f) => f.receitaId === r.id && f.id !== idAtual), (f) => f.valorFaturado);
  const limite = valorReceita(r) - outros;
  const rt = n(d.retencaoTributaria);
  const rc = n(d.retencaoContratual);
  return primeira([
    () => req(isContratada(r), "Apenas receitas contratadas podem ser faturadas.", "receitaId"),
    () => req(!vazio(d.parcela), "Informe a parcela/etapa.", "parcela"),
    () => req(d.dataFaturamento, "Informe a data de faturamento.", "dataFaturamento"),
    () => req(n(d.valorFaturado) > 0, "Informe o valor faturado.", "valorFaturado"),
    () => req(d.vencimento, "Informe o vencimento.", "vencimento"),
    () => req(d.vencimento >= d.dataFaturamento, "O vencimento não pode ser anterior ao faturamento.", "vencimento"),
    () => req(n(d.valorFaturado) <= limite, `Faturamento excede o saldo a faturar da receita (${reais(limite)}).`, "valorFaturado"),
    () => req(rt >= 0 && rc >= 0, "Retenção não pode ser negativa.", "retencaoTributaria"),
    () => req(rt + rc <= n(d.valorFaturado), "A soma das retenções não pode exceder o valor faturado.", "retencaoTributaria"),
    () => req(n(d.retencaoContratualLiberada) >= 0 && n(d.retencaoContratualLiberada) <= rc, "Retenção contratual liberada não pode exceder a retida.", "retencaoContratualLiberada"),
    () => req(n(d.valorRecebido) >= 0 && n(d.valorRecebido) <= n(d.valorFaturado), "Valor recebido não pode exceder o faturado.", "valorRecebido"),
    () =>
      n(d.valorRecebido) > 0
        ? primeira([
            () => req(d.dataRecebimento, "Informe a data de recebimento.", "dataRecebimento"),
            () => req(d.contaId, "Informe a conta financeira creditada (toda entrada de caixa tem conta).", "contaId"),
            () => req(livro.contas.some((c) => c.id === d.contaId), "Conta financeira inexistente.", "contaId"),
          ])
        : OK,
    () => (d.dataRecebimento ? req(n(d.valorRecebido) > 0, "Informe o valor recebido.", "valorRecebido") : OK),
  ]);
}

// ----------------------------------------------------------------- custo

export type DadosCustoFin = Omit<CustoFin, "id">;

export function validarCusto(dados: DadosCustoFin, livro: LivroFinanceiro, idAtual: string | null): ResultadoValidacao {
  const d = comDefaultsDeLancamento(dados);
  const corp = !d.eventoId;
  return primeira([
    () => req(d.eventoId || d.tipoLancamento === "Corporativa", "Lançamento sem evento: marque-o como despesa corporativa.", "eventoId"),
    () => req(d.centroCusto, "Informe o centro de custo (obrigatório em todo lançamento).", "centroCusto"),
    () => (corp ? req(d.competencia, "Informe a competência econômica da despesa corporativa.", "competencia") : OK),
    () => (!corp ? req(d.fase, "Selecione a fase.", "fase") : OK),
    () => req(d.categoria, "Selecione a categoria.", "categoria"),
    () => req(!vazio(d.descricao), "Informe a descrição.", "descricao"),
    () => req(n(d.qtde) > 0, "Quantidade deve ser maior que zero.", "qtde"),
    () => req(n(d.valorUnitPrev) >= 0, "Valor unitário inválido.", "valorUnitPrev"),
    () => req(n(d.valorRealizado) >= 0, "Valor realizado inválido.", "valorRealizado"),
    () => {
      if (!idAtual) return OK;
      const pago = soma(livro.pagamentos.filter((p) => p.custoId === idAtual), (p) => p.valorPago);
      return req(n(d.valorRealizado) >= pago, `Valor realizado não pode ser inferior ao já pago (${reais(pago)}).`, "valorRealizado");
    },
  ]);
}

export function podeExcluirCusto(id: string, livro: LivroFinanceiro): ResultadoValidacao {
  const k = livro.pagamentos.filter((p) => p.custoId === id).length;
  return req(k === 0, `Este custo possui ${k} pagamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.`, "");
}

// ------------------------------------------------------------- pagamento

export type DadosPagamentoFin = Omit<PagamentoFin, "id" | "eventoId">;

export function validarPagamento(d: DadosPagamentoFin, livro: LivroFinanceiro, idAtual: string | null): ResultadoValidacao {
  const c = livro.custos.find((x) => x.id === d.custoId);
  if (!c) return falha("Selecione o custo vinculado.", "custoId");
  const outros = livro.pagamentos.filter((p) => p.custoId === c.id && p.id !== idAtual);
  const realizado = n(c.valorRealizado);
  const base = realizado > 0 ? realizado : custoPrevisto(c);
  const saldo = base - soma(outros, (p) => p.valor);
  return primeira([
    () => req(d.vencimento, "Informe o vencimento.", "vencimento"),
    () => req(n(d.valor) > 0, "Informe o valor do título.", "valor"),
    () => req(n(d.valor) <= saldo, `Valor programado excede o saldo do custo (${reais(saldo)}).`, "valor"),
    () => req(n(d.valorPago) >= 0 && n(d.valorPago) <= n(d.valor), "Valor pago não pode exceder o valor do título.", "valorPago"),
    () =>
      n(d.valorPago) > 0
        ? primeira([
            () => req(realizado > 0, "Registre o valor realizado do custo antes da baixa (CUSTO REALIZADO ≠ PAGO)", "valorPago"),
            () => req(n(d.valorPago) + soma(outros, (p) => p.valorPago) <= realizado, "Total pago excederia o custo realizado.", "valorPago"),
            () => req(d.dataPagamento, "Informe a data de pagamento.", "dataPagamento"),
            () => req(d.contaId, "Informe a conta financeira debitada (toda saída de caixa tem conta).", "contaId"),
            () => req(livro.contas.some((x) => x.id === d.contaId), "Conta financeira inexistente.", "contaId"),
          ])
        : OK,
    () => (d.dataPagamento ? req(n(d.valorPago) > 0, "Informe o valor pago.", "valorPago") : OK),
  ]);
}

// ----------------------------------------------------------------- conta

export type DadosContaFin = Omit<ContaFin, "id">;

export function validarConta(d: DadosContaFin): ResultadoValidacao {
  return primeira([
    () => req(!vazio(d.nome), "Informe o nome da conta.", "nome"),
    () => req(d.tipo, "Selecione o tipo de conta.", "tipo"),
    () => req(Number.isInteger(n(d.saldoInicial)), "Saldo inicial inválido.", "saldoInicial"),
    () => req(d.dataSaldoInicial, "Informe a data do saldo inicial.", "dataSaldoInicial"),
  ]);
}

/** Movimentos não existem na Fase 1: só faturamentos e pagamentos usam a conta. */
export function podeExcluirConta(id: string, livro: LivroFinanceiro): ResultadoValidacao {
  const k = livro.faturamentos.filter((f) => f.contaId === id).length + livro.pagamentos.filter((p) => p.contaId === id).length;
  return req(k === 0, `Esta conta possui ${k} movimentação(ões) vinculada(s). Inative-a em vez de excluí-la.`, "");
}

