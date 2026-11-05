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
