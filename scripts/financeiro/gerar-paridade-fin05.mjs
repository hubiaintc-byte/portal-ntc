// Gera a fixture de paridade do módulo Financeiro a partir do protótipo FIN-05 v0.2.2.
// Uso: node scripts/financeiro/gerar-paridade-fin05.mjs
// Roda o protótipo num Chromium com o relógio fixo em 15/07/2026 (America/Sao_Paulo)
// e grava db + saídas das regras em packages/lib/src/financeiro/__fixtures__/paridade-fin05.json.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const html = resolve(raiz, "docs/prototipos/financeiro-fin05-v0.2.2.html");
const saida = resolve(raiz, "packages/lib/src/financeiro/__fixtures__/paridade-fin05.json");

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage({ timezoneId: "America/Sao_Paulo" });
  await pagina.clock.setFixedTime(new Date("2026-07-15T12:00:00-03:00"));
  await pagina.goto(pathToFileURL(html).href);
  await pagina.waitForFunction(() => !!window.NTC_FIN05);

  const fixture = await pagina.evaluate(() => {
    const { Repo, Rules } = window.NTC_FIN05;
    const db = Repo.snapshot();

    // Fora da Fase 1: comissões, movimentos, orçamentos e fechamentos.
    const idsComissao = new Set(db.custos.filter((c) => Rules.isComissao(c)).map((c) => c.id));
    db.custos = db.custos.filter((c) => !idsComissao.has(c.id));
    db.pagamentos = db.pagamentos.filter((p) => !idsComissao.has(p.custoId));
    db.movimentos = [];
    db.orcamentos = [];
    db.fechamentos = [];

    // Casos vencidos sintéticos: o seed não tem título vencido sem baixa nenhuma.
    // Entram no db vivo antes de qualquer saída, para o próprio protótipo calcular.
    const sinteticos = [];
    const clonar = (o) => JSON.parse(JSON.stringify(o));
    const recEvento = db.receitas.find((r) => r.id === "RC-0013"); // evento, a faturar 48.000,00
    const recCorpBase = db.receitas.find((r) => !r.eventoId && Rules.isContratada(r));
    const cusEventoBase = db.custos.find((c) => c.eventoId && c.valorRealizado > 0);
    const cusCorpBase = db.custos.find((c) => !c.eventoId && c.valorRealizado > 0);
    const novoFat = (id, r, valor, nf) => ({
      id, receitaId: r.id, eventoId: r.eventoId || "", parcela: "Sintética", nf,
      dataFaturamento: "2026-05-20", valorFaturado: valor, vencimento: "2026-06-30",
      retencaoTributaria: 0, retencaoContratual: 0, retencaoContratualLiberada: 0,
      dataRecebimento: "", valorRecebido: 0, contaId: "CT-0001", quitado: false, observacao: "",
    });
    const novoPag = (id, c, valor, doc) => ({
      id, custoId: c.id, eventoId: c.eventoId || "", documento: doc, vencimento: "2026-06-30",
      valor, dataPagamento: "", valorPago: 0, contaId: "CT-0001", observacao: "",
    });
    // (a) faturamento de evento vencido, nada recebido (dentro do saldo a faturar de RC-0013)
    db.fatrec.push(novoFat("FR-SINT-01", recEvento, 1000000, "NF-SINT-01"));
    sinteticos.push({ id: "FR-SINT-01", entidade: "faturamentos", motivo: "evento: exigível > 0, vencimento 2026-06-30 < hoje, nada recebido" });
    // (c) receita corporativa sintética (as do seed já estão 100% faturadas) + faturamento vencido
    const recCorp = { ...clonar(recCorpBase), id: "RC-SINT-01", qtde: 1, valorUnit: 500000, desconto: 0, etapas: [] };
    db.receitas.push(recCorp);
    db.fatrec.push(novoFat("FR-SINT-02", recCorp, 500000, "NF-SINT-02"));
    sinteticos.push({ id: "RC-SINT-01", entidade: "receitas", motivo: "receita corporativa (sem evento) clonada de " + recCorpBase.id + ", valor 5.000,00, para sustentar o faturamento corporativo vencido" });
    sinteticos.push({ id: "FR-SINT-02", entidade: "faturamentos", motivo: "corporativo: exigível > 0, vencimento 2026-06-30 < hoje, nada recebido" });
    // (b) título de evento vencido, nada pago (custo sintético com realizado, sem outros títulos)
    const cusEv = { ...clonar(cusEventoBase), id: "CU-SINT-01", valorRealizado: 300000 };
    db.custos.push(cusEv);
    db.pagamentos.push(novoPag("PG-SINT-01", cusEv, 300000, "TIT-SINT-01"));
    sinteticos.push({ id: "CU-SINT-01", entidade: "custos", motivo: "custo de evento clonado de " + cusEventoBase.id + ", realizado 3.000,00, para sustentar o título vencido" });
    sinteticos.push({ id: "PG-SINT-01", entidade: "pagamentos", motivo: "evento: saldo > 0, vencimento 2026-06-30 < hoje, nada pago" });
    // (c) título corporativo vencido
    const cusCorp = { ...clonar(cusCorpBase), id: "CU-SINT-02", valorRealizado: 200000 };
    db.custos.push(cusCorp);
    db.pagamentos.push(novoPag("PG-SINT-02", cusCorp, 200000, "TIT-SINT-02"));
    sinteticos.push({ id: "CU-SINT-02", entidade: "custos", motivo: "custo corporativo clonado de " + cusCorpBase.id + ", realizado 2.000,00, para sustentar o título vencido" });
    sinteticos.push({ id: "PG-SINT-02", entidade: "pagamentos", motivo: "corporativo: saldo > 0, vencimento 2026-06-30 < hoje, nada pago" });

    const copia = (o) => JSON.parse(JSON.stringify(o));
    const semRefs = (m) => {
      const { rf, cf, sc, db: _db, ...resto } = m;
      return copia(resto);
    };
    const porId = (lista, f) => Object.fromEntries(lista.map((x) => [x.id, f(x)]));

    const receitaFin = porId(db.receitas, (r) => {
      const { parcelas, ...resto } = Rules.receitaFin(r, db);
      return { ...copia(resto), parcelasIds: parcelas.map((p) => p.id) };
    });
    const reconhecimentoReceita = porId(db.receitas, (r) => copia(Rules.reconhecimentoReceita(r, db)));
    const fatrecFin = porId(db.fatrec, (f) => copia(Rules.fatrecFin(f)));
    const custoFin = porId(db.custos, (c) => {
      const { pagamentos, ...resto } = Rules.custoFin(c, db);
      return { ...copia(resto), pagamentosIds: pagamentos.map((p) => p.id) };
    });
    const pagamentoFin = porId(db.pagamentos, (p) => copia(Rules.pagamentoFin(p)));
    const eventMetrics = porId(db.eventos, (ev) => semRefs(Rules.eventMetrics(ev, db)));
    const eventAlerts = porId(db.eventos, (ev) =>
      copia(Rules.eventAlerts(ev, db, Rules.eventMetrics(ev, db))),
    );

    const consolidado = {}, consolidadoEventos = {}, consolidadoCorporativo = {}, portfolio = {};
    for (const { id: periodo } of Rules.PERIODOS) {
      consolidado[periodo] = semRefs(Rules.consolidado({ periodo }));
      consolidadoEventos[periodo] = semRefs(Rules.consolidado({ periodo, escopo: "eventos" }));
      consolidadoCorporativo[periodo] = semRefs(Rules.consolidado({ periodo, escopo: "corporativo" }));
      const p = Rules.portfolio({ periodo, vertical: "all", modalidade: "all", status: "all", tipo: "all" });
      portfolio[periodo] = {
        tot: copia(p.tot),
        alerts: copia(p.alerts),
        evIds: [...p.evIds],
        rows: p.rows.map((x) => ({ id: x.ev.id, m: semRefs(x.m) })),
      };
    }

    // Funções de topo do script do protótipo (escopo global), se alcançáveis.
    const alcance = {
      aging: typeof window.aging === "function",
      cashSeries: typeof window.cashSeries === "function",
      phaseDonut: typeof window.phaseDonut === "function",
      groupCosts: typeof window.groupCosts === "function",
    };
    const extras = {};
    if (alcance.cashSeries) {
      extras.cashSeries = {
        todos: copia(window.cashSeries(db, new Set(db.eventos.map((e) => e.id)))),
        porEvento: porId(db.eventos, (ev) => copia(window.cashSeries(db, new Set([ev.id])))),
      };
    }
    if (alcance.aging) {
      extras.agingReceber = copia(
        window.aging(
          db.fatrec.map((f) => ({ vencimento: f.vencimento, v: Rules.fatrecFin(f).exigivel })),
          (x) => x.v,
        ),
      );
      extras.agingPagar = copia(
        window.aging(
          db.pagamentos.map((p) => ({ vencimento: p.vencimento, v: Rules.pagamentoFin(p).saldo })),
          (x) => x.v,
        ),
      );
    }
    if (alcance.groupCosts) {
      extras.groupCostsFase = copia(window.groupCosts(db, new Set(db.eventos.map((e) => e.id)), "fase"));
    }

    return {
      hoje: Rules.todayISO(),
      geradoDe: "financeiro-fin05-v0.2.2.html",
      sinteticos,
      db: {
        eventos: copia(db.eventos),
        receitas: copia(db.receitas),
        faturamentos: copia(db.fatrec),
        custos: copia(db.custos),
        pagamentos: copia(db.pagamentos),
        contas: copia(db.contas),
      },
      saidas: {
        receitaFin, reconhecimentoReceita, fatrecFin, custoFin, pagamentoFin,
        eventMetrics, eventAlerts,
        consolidado, consolidadoEventos, consolidadoCorporativo, portfolio,
        saldosPorConta: copia(Rules.saldosPorConta(db).map((s) => ({
          contaId: s.conta.id, entradas: s.entradas, saidas: s.saidas, saldo: s.saldo,
          movimentosIds: s.movimentos.map((m) => m.id),
        }))),
        extrato: copia(Rules.extrato(db)),
        corpAlerts: copia(Rules.corpAlerts(db)),
        ...extras,
      },
      alcance,
    };
  });

  if (fixture.hoje !== "2026-07-15") throw new Error(`Relógio fora do esperado: ${fixture.hoje}`);
  mkdirSync(dirname(saida), { recursive: true });
  writeFileSync(saida, JSON.stringify(fixture, null, 2) + "\n");
  const c = fixture.db;
  console.log(
    `eventos=${c.eventos.length} receitas=${c.receitas.length} faturamentos=${c.faturamentos.length} ` +
      `custos=${c.custos.length} pagamentos=${c.pagamentos.length} contas=${c.contas.length}`,
  );
  console.log("alcance:", JSON.stringify(fixture.alcance));
  console.log("escrito:", saida);
} finally {
  await navegador.close();
}
