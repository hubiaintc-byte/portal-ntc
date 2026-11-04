# Módulo Financeiro — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terceiro módulo do Painel Admin (`/financeiro`) com Visão Executiva, Eventos e Projetos, Receber e Pagar, portado fielmente do protótipo FIN-05 v0.2.2 e gravando de verdade no Payload.

**Architecture:** As fórmulas do protótipo (`Rules`) e as validações (`Service.req`) viram funções puras em `packages/lib/src/financeiro/`, provadas por um teste de paridade contra o próprio protótipo rodando no Chromium. Seis coleções `fin-*` no Payload guardam os lançamentos (centavos inteiros, status nunca gravado), com auditoria em `audit-log` na mesma transação. A página `/financeiro` lê o livro inteiro uma vez no servidor; as telas cliente calculam tudo com as funções puras e escrevem por Server Actions guardadas por tela.

**Tech Stack:** Next.js 16 App Router (cms), Payload 3.90.2 + Postgres, TypeScript strict, Vitest, Playwright (só no script de fixture), Chart.js 4.4.0 (dependência nova aprovada pelo PO, só no módulo financeiro).

**Spec:** `docs/superpowers/specs/2026-11-04-modulo-financeiro-fase-1-design.md` — leia inteiro. Anexo: `docs/superpowers/specs/2026-11-04-financeiro-mapa-prototipo-fin05.md` (o "mapa"). Protótipo: `docs/prototipos/financeiro-fin05-v0.2.2.html` — o app é o **2º** `<script>` (o 1º é o Chart.js); `PARAMS` ~linha 8, `buildSeed` ~137, `Repo` ~829, `Rules` ~870, `Service` ~1545, `Charts` ~2238, `renderShell` ~2376, `Views` ~2510 (linhas contadas dentro do script). Para ler: `python3 -I -c "import re;s=open('docs/prototipos/financeiro-fin05-v0.2.2.html').read();print(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)[-1])" > /tmp/fin05-app.js` e abrir o arquivo.

## Global Constraints

- **Fonte de verdade:** o protótipo. O que o spec/plano não muda, segue o protótipo — rótulos, ordem de seções, textos de ajuda, mensagens de erro (copiar **literalmente**, inclusive acentos e os marcadores `[A VALIDAR]`, `[VALIDAR COM CONTABILIDADE]`, `BASELINE A LEVANTAR`, "provisório").
- **Fora da Fase 1 (não portar):** tudo de comissão (`isComissao`, `comissao*`, aba/bloco/linha/indicador/títulos de comissão), `movimentos`, `orcamentos`, `fechamentos` (inclusive `avisoCompetencia` e alertas de competência), margem %, busca global Ctrl/Cmd+K, selo "Dados fictícios", "Restaurar dados fictícios", telas Comissões/Caixa/Resultado e Orçamento/Relatórios/Administração.
- **Dinheiro:** sempre centavos inteiros (`number` inteiro). Formatação `R$ 1.234,56` só na borda (UI/CSV).
- **Status derivados** (receita, parcela, custo, título, alertas) **nunca** são gravados.
- **Nomes:** funções portadas mantêm o nome do protótipo (`portfolio`, `consolidado`, `eventMetrics`, `receitaFin`…) para rastreabilidade; o resto segue CLAUDE.md §4.2 (português). Entidades: `eventos`, `receitas`, `faturamentos` (= `fatrec` do protótipo), `custos`, `pagamentos`, `contas`.
- **Exclusão só para administrador** (coleções `delete: administrador`; actions com `obterAdministradorAutenticado`). Regras de bloqueio do protótipo: receita com faturamento, custo com título e conta usada não se excluem.
- **Auditoria:** toda criação/alteração/exclusão em `fin-*` grava em `audit-log` na mesma transação; falha do log faz a escrita falhar.
- **Permissões:** telas `fin.visao-executiva`, `fin.eventos`, `fin.receber`, `fin.pagar`. Recusa de action: `"Sessão expirada ou sem permissão para esta ação."`.
- **Chart.js 4.4.0** só em `apps/cms` e só importado por arquivos de `app/(painel)/financeiro/`. Nenhuma outra dependência nova.
- **Visual:** paleta e tipografia do protótipo confinadas em `app/(painel)/financeiro/financeiro.css`, escopadas sob `.fin05`. Fontes via `next/font` (nada de `<link>` Google Fonts).
- **Banco:** nenhum seed fictício em banco real. Nenhum `required: true` fora do obrigatório-na-criação. `payload:push:schema` é do PO (Task 18), nunca do agente.
- **Gates:** `pnpm lint` 0 erros, `pnpm typecheck`, `pnpm test`, `pnpm build` com o dev **parado**. Commits em português, Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Data de hoje:** `hojeISO` = data civil em `America/Sao_Paulo` (`AAAA-MM-DD`), calculada no servidor e passada às telas; nenhuma função pura chama `new Date()` — recebem `hoje`.

## Review Focus

1. **Livro vazio (o módulo começa do zero):** Visão Executiva, Eventos, Receber e Pagar sem nenhum lançamento devem mostrar zeros e "—" nas razões (÷ 0), sem `NaN`, `Infinity` ou gráfico quebrado. → teste `livro vazio não produz NaN` na Task 5 e na Task 4.
2. **Valor digitado em reais brasileiros:** "1.234,56", "1234,5", "1234" e "R$ 10" viram 123456, 123450, 123400, 1000; "abc" e "1,2,3" são recusados. → teste de `paraCentavos` na Task 2.
3. **Virada do dia:** às 22h de Brasília (01h UTC do dia seguinte) "hoje" ainda é o dia de Brasília — parcela que vence hoje não aparece vencida. → teste de `hojeEmSaoPaulo` na Task 2.
4. **Validação contra dado velho:** duas abas faturam a mesma receita; a segunda gravação tem de ser recusada por exceder o saldo a faturar relido **dentro da transação**, não pelo livro que a tela tinha. → teste na Task 10.
5. **Evento do CRM incompleto ou cancelado:** evento comercial sem `dataFim`/`modalidade` usa o valor do financeiro (e o wizard os exige); evento cancelado no CRM continua somando, com `canceladoNoCrm: true`. → testes na Task 9.

---

## Estrutura de arquivos

```
packages/lib/src/financeiro/
  tipos.ts            entidades, LivroFinanceiro, tipos de saída
  listas.ts           PARAMS do protótipo (constantes) + rótulos de centro
  dinheiro.ts         paraCentavos, formatarReais, hojeEmSaoPaulo, mesDe
  periodos.ts         periodosDisponiveis, inPeriod
  receitas.ts         valorBruto, valorReceita, receitaFin, faturamentoFin (=fatrecFin), retTrib, retContr
  custos.ts           custoPrevisto, custoFin, pagamentoFin
  reconhecimento.ts   reconhecimentoReceita, receitaReconhecida, custoCompetencia
  eventos.ts          matchEvent, eventMetrics, eventAlerts, portfolio, demonstrativo
  consolidado.ts      escopo, consolidado, extrato, saldoGeral, saldosPorConta, corpAlerts
  agregados.ts        aging, series dos gráficos (cashSeries, phaseDonut, por vertical, por categoria, segmento, frChart)
  validacao.ts        validarEvento, validarReceita, validarEtapas, validarFaturamento, validarCusto, validarPagamento, validarConta, podeExcluir*
  csv.ts              gerarCsv
  index.ts            reexporta (e packages/lib/src/index.ts reexporta `./financeiro`)
  __fixtures__/paridade-fin05.json
  *.test.ts
scripts/financeiro/gerar-paridade-fin05.mjs
apps/cms/src/collections/financeiro/{FinEventos,FinReceitas,FinFaturamentos,FinCustos,FinPagamentos,FinContas}.ts
apps/cms/src/lib/financeiro/{auditoria,exclusao,leitura,escrita}.ts (+ testes)
apps/cms/src/app/(painel)/acoesFinanceiro.ts (+ teste)
apps/cms/src/app/(painel)/financeiro/
  layout.tsx, page.tsx, ShellFinanceiro.tsx, financeiro.css
  ui/        Grafico.tsx, Gaveta.tsx, Kpi.tsx, Tabela.tsx, Selo.tsx, CampoDinheiro.tsx, Historico.tsx (primitivas)
  visao/     TelaVisaoExecutiva.tsx
  eventos/   TelaEventos.tsx, WizardEvento.tsx, AreaEvento.tsx, aba*.tsx, GavetaReceita.tsx, GavetaEtapas.tsx, GavetaFaturamento.tsx, GavetaCusto.tsx, GavetaPagamento.tsx
  receber/   TelaReceber.tsx, GavetaReceitaCorporativa.tsx, GavetaConta.tsx
  pagar/     TelaPagar.tsx, GavetaDespesaCorporativa.tsx
```

---

### Task 1: Fixture de paridade gerado do protótipo

**Files:**
- Create: `scripts/financeiro/gerar-paridade-fin05.mjs`
- Create: `packages/lib/src/financeiro/__fixtures__/paridade-fin05.json` (gerado, commitado)

**Interfaces:**
- Produces: JSON `{ hoje: "2026-07-15", geradoDe: "financeiro-fin05-v0.2.2.html", db: { eventos, receitas, faturamentos, custos, pagamentos, contas }, saidas: {...} }` — `db` com os nomes de entidade do portal (`fatrec` → `faturamentos`), valores em centavos como o protótipo já guarda.

- [ ] **Step 1: Escrever o script** com `playwright` (já é devDependency da raiz): `chromium.launch()`, `page.clock.setFixedTime(new Date("2026-07-15T12:00:00-03:00"))` **antes** do `goto` do `file://` do protótipo; no `page.evaluate`, com `const { Repo, Rules } = window.NTC_FIN05; const db = Repo.snapshot();`:
  - remover do `db` os custos com `Rules.isComissao(c)` e os pagamentos deles; zerar `db.movimentos`, `db.orcamentos`, `db.fechamentos` (fora da Fase 1 — os dois lados calculam sem eles);
  - montar `saidas`: por receita `receitaFin(r)` e `reconhecimentoReceita(r)`; por parcela `fatrecFin(f)`; por custo `custoFin(c)`; por título `pagamentoFin(p)`; por evento `eventMetrics(ev)` e `eventAlerts(ev)`; para cada período de `Rules.PERIODOS`: `consolidado({periodo})`, `consolidado({periodo, escopo:'eventos'})`, `consolidado({periodo, escopo:'corporativo'})` e `portfolio({periodo, vertical:'all', modalidade:'all', status:'all', tipo:'all'})`; mais `saldosPorConta()`, `extrato()`, `corpAlerts(db)`. Conferir no `/tmp/fin05-app.js` a assinatura real de cada uma antes (algumas leem o `db` global por `Repo.snapshot()` — por isso a mutação vem antes). Se `aging`/`cashSeries`/`phaseDonut` forem alcançáveis no escopo do script, incluí-los também; se estiverem em closure, não.
  - gravar o JSON formatado (2 espaços) no caminho acima.
- [ ] **Step 2: Rodar** `pnpm exec playwright install chromium` (se ainda não houver) e `node scripts/financeiro/gerar-paridade-fin05.mjs` — Expected: imprime contagens (eventos, receitas, faturamentos, custos, pagamentos, contas) e o arquivo existe; `grep -c '"Comissões comerciais"' packages/lib/src/financeiro/__fixtures__/paridade-fin05.json` → `0` em `db.custos`.
- [ ] **Step 3: Commit** `chore(financeiro): fixture de paridade gerado do protótipo FIN-05`

### Task 2: Tipos, listas, dinheiro e períodos

**Files:**
- Create: `packages/lib/src/financeiro/{tipos,listas,dinheiro,periodos,index}.ts`, `dinheiro.test.ts`, `periodos.test.ts`, `listas.test.ts`
- Modify: `packages/lib/src/index.ts` (export `* from "./financeiro"`)

**Interfaces:**
- Produces (`tipos.ts`): `type Centavos = number`; `type StatusOperacional = "Planejado"|"Em preparação"|"Em execução"|"Realizado"|"Encerrado"`; interfaces `EventoFin`, `ReceitaFin` (com `etapas: EtapaReceita[]`), `EtapaReceita`, `FaturamentoFin`, `CustoFin`, `PagamentoFin`, `ContaFin` — **campos com os mesmos nomes do mapa §2** (ex.: `eventoId`, `receitaId`, `custoId`, `contaId`, `valorUnit`, `retencaoTributaria`…), ids como `string`, sem os campos de comissão. `EventoFin` ganha `origem: "crm"|"financeiro"`, `eventoComercialId: string|null`, `cadastroPendente: boolean`, `canceladoNoCrm: boolean`. `interface LivroFinanceiro { eventos; receitas; faturamentos; custos; pagamentos; contas }` (arrays).
- Produces (`listas.ts`): `LISTAS_FIN` com todas as listas de `PARAMS` do protótipo (copiar literalmente, inclusive `categorias` com subcategorias e `mod`, **removendo** 'Comissões comerciais', `modalidadesComissao`, `basesComissao`, `condicoesAquisicao`, `vendedores`); `nomeCentro(cod: string): string`.
- Produces (`dinheiro.ts`): `paraCentavos(texto: string): Centavos | null`; `formatarReais(c: Centavos): string`; `hojeEmSaoPaulo(agora: Date): string`; `mesDe(dataISO: string): string` (`AAAA-MM`).
- Produces (`periodos.ts`): `type Periodo = "all" | \`${number}\` | \`${number}-Q${1|2|3|4}\``; `periodosDisponiveis(livro: LivroFinanceiro, hoje: string): { valor: Periodo; rotulo: string }[]` (ano de hoje e ±1, mais todo ano que aparecer em datas do livro; cada ano com seus 4 trimestres; rótulos como os de `Rules.PERIODOS`); `inPeriod(dataISO: string|undefined, periodo: Periodo): boolean` (mesma regra do protótipo).

- [ ] **Step 1: Testes que falham**
```ts
test("paraCentavos lê reais brasileiros", () => {
  expect(paraCentavos("1.234,56")).toBe(123456);
  expect(paraCentavos("1234,5")).toBe(123450);
  expect(paraCentavos("1234")).toBe(123400);
  expect(paraCentavos("R$ 10")).toBe(1000);
  expect(paraCentavos("abc")).toBeNull();
  expect(paraCentavos("1,2,3")).toBeNull();
});
test("formatarReais", () => expect(formatarReais(123456)).toBe("R$ 1.234,56"));
test("hoje é o dia de Brasília às 22h", () =>
  expect(hojeEmSaoPaulo(new Date("2026-07-16T01:00:00Z"))).toBe("2026-07-15"));
test("períodos cobrem o ano de hoje e os anos do livro", () => {
  const v = periodosDisponiveis(livroCom({ competencia: "2028-02-01" }), "2026-07-15").map((p) => p.valor);
  expect(v).toEqual(expect.arrayContaining(["all", "2025", "2026", "2026-Q3", "2027", "2028", "2028-Q1"]));
});
test("listas não trazem comissão", () =>
  expect(LISTAS_FIN.categorias.map((c) => c.nome)).not.toContain("Comissões comerciais"));
```
  (`livroCom` = helper local do teste que monta um `LivroFinanceiro` mínimo.) Mais um teste de `inPeriod` para `"2026-Q3"` com `2026-07-01` (true) e `2026-10-01` (false).
- [ ] **Step 2: Rodar** `pnpm --filter @ntc/lib test financeiro` — Expected: FAIL (módulos inexistentes).
- [ ] **Step 3: Implementar** os quatro arquivos. `hojeEmSaoPaulo` com `Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" })`.
- [ ] **Step 4: Rodar** de novo — Expected: PASS. `pnpm --filter @ntc/lib typecheck` limpo.
- [ ] **Step 5: Commit** `feat(financeiro): tipos, listas e utilitários de dinheiro e período`

### Task 3: Receitas, parcelas, custos e títulos

**Files:**
- Create: `packages/lib/src/financeiro/{receitas,custos}.ts`, `receitas.test.ts`, `custos.test.ts`, `paridade.test.ts` (helper `carregarFixture()` + blocos por área)

**Interfaces:**
- Consumes: Task 2.
- Produces: `valorBruto(r)`, `valorReceita(r)`, `isContratada(r)`, `receitaFin(r: ReceitaFin, livro: LivroFinanceiro): MetricasReceita`, `faturamentoFin(f: FaturamentoFin, hoje: string): MetricasParcela`, `retTrib(f)`, `retContr(f)`, `custoPrevisto(c)`, `custoFin(c: CustoFin, livro): MetricasCusto`, `pagamentoFin(p: PagamentoFin, hoje: string): MetricasTitulo`. Os tipos `Metricas*` têm exatamente as chaves que o protótipo devolve (mapa §3.1), menos as de comissão.

- [ ] **Step 1: Teste de paridade que falha:** para cada item do fixture, `expect(receitaFin(r, livro)).toMatchObject(saidas.receitaFin[r.id])` (idem `faturamentoFin`↔`fatrecFin`, `custoFin`, `pagamentoFin`), com `livro = fixture.db`, `hoje = fixture.hoje`. Mais testes nomeados das regras que o seed pode não cobrir: `parcela parcialmente recebida nunca é vencida` (recebido 1, exigível > 0, vencimento ontem → `vencido === false`); `desvio só com realizado > 0`; `status de receita Prevista quando statusEconomico é Prevista`.
- [ ] **Step 2: Rodar** `pnpm --filter @ntc/lib test financeiro` — FAIL.
- [ ] **Step 3: Portar** de `Rules` (trechos "Receita (03)" em diante), trocando o `db` implícito por `livro` e `todayISO()` por `hoje`.
- [ ] **Step 4: Rodar** — PASS.
- [ ] **Step 5: Commit** `feat(financeiro): regras de receita, parcela, custo e título com paridade`

### Task 4: Reconhecimento, evento e carteira

**Files:**
- Create: `packages/lib/src/financeiro/{reconhecimento,eventos}.ts`, `reconhecimento.test.ts`, `eventos.test.ts`; Modify: `paridade.test.ts`

**Interfaces:**
- Consumes: Task 3.
- Produces: `reconhecimentoReceita(r, livro, hoje): { total: Centavos; porMes: Record<string, Centavos>; provisorio: boolean }` (forma exata = a do protótipo); `receitaReconhecida(r, livro, hoje, periodo?)`; `custoCompetencia(c): string`; `matchEvent(ev, filtro: FiltroCarteira): boolean` (`FiltroCarteira = { periodo; vertical; modalidade; status; tipo; q? }`, `"all"` = sem filtro); `eventMetrics(ev, livro, hoje): MetricasEvento`; `eventAlerts(ev, livro, hoje): AlertaFin[]` (`AlertaFin = { severidade: "Vencido"|"Pendente"|"Atenção"|"A validar"; texto: string; aba?: string; ref?: string }` — mesmos textos do protótipo); `portfolio(filtro, livro, hoje): { tot: MetricasEvento; rows: {...}[]; alerts: AlertaFin[] }`; `demonstrativo(receitas: [Centavos,Centavos,Centavos], custos: [Centavos,Centavos,Centavos]): Demonstrativo` (sem a linha de comissões).

- [ ] **Step 1: Testes que falham:** paridade de `reconhecimentoReceita`, `eventMetrics` (`toMatchObject`, chaves de comissão ausentes do nosso lado), `eventAlerts` (comparar a lista do fixture **filtrada** sem os alertas de comissão) e `portfolio` para cada período. Nomeados: `Integral no encerramento só reconhece com status Encerrado`; `evento cancelado no CRM soma igual` (`canceladoNoCrm: true` não muda `eventMetrics`); `livro vazio não produz NaN` (`portfolio` sobre livro vazio: todo número `=== 0`, nenhum `NaN`).
- [ ] **Step 2: Rodar** — FAIL.
- [ ] **Step 3: Portar** de `Rules` (`reconhecimentoReceita`, `eventMetrics`, `eventAlerts`, `portfolio`, `demonstrativo`, `matchEvent`), removendo comissões.
- [ ] **Step 4: Rodar** — PASS.
- [ ] **Step 5: Commit** `feat(financeiro): reconhecimento, métricas e alertas de evento com paridade`

### Task 5: Consolidado, caixa, alertas corporativos e agregados de gráfico

**Files:**
- Create: `packages/lib/src/financeiro/{consolidado,agregados,csv}.ts`, `consolidado.test.ts`, `agregados.test.ts`, `csv.test.ts`; Modify: `paridade.test.ts`

**Interfaces:**
- Consumes: Tasks 3–4.
- Produces: `escopo(filtro: FiltroFin, livro)` (`FiltroFin = FiltroCarteira & { escopo: "all"|"eventos"|"corporativo"; centro: string }`); `consolidado(filtro, livro, hoje): Consolidado` (chaves do protótipo — `projetado`, `economico`, `movimentacaoLiquida`, `saldoAtual`, `nContas`, `exigivel`, `aLiberar`, `obrigacoes`, `aPagar`, `demo`… — sem comissões); `extrato(livro): LinhaExtrato[]` (só parcelas recebidas e títulos pagos); `saldoGeral(livro)`; `saldosPorConta(livro)`; `corpAlerts(livro, hoje): AlertaFin[]` (sem movimentos não classificados e sem competências); `aging(itens: { vencimento: string; valor: Centavos }[], hoje): { vencido; ate30; de31a60; de61a90; acima90 }`; séries para os gráficos da Visão Executiva, da área do evento, de Receber e de Pagar com nome e forma do protótipo (`cashSeries`, `phaseDonut`, por vertical, orçado×realizado top 8, por segmento, pagantes×cortesias por órgão, cronograma de faturamento, exigível e obrigações por mês de vencimento) devolvendo `SerieGrafico = { labels: string[]; series: { nome: string; valores: number[]; tipo?: "barra"|"linha" }[] }`; `gerarCsv(colunas: { titulo: string; valor: (l: T) => string|number }[], linhas: T[]): string` (separador `;`, BOM UTF-8, como o CSV do protótipo — conferir lá).

- [ ] **Step 1: Testes que falham:** paridade de `consolidado` (os 3 escopos × períodos), `saldosPorConta`, `extrato`, `corpAlerts` (fixture filtrado sem itens de movimentos/competência). Nomeados: `livro vazio não produz NaN` (consolidado e todas as séries sobre livro vazio); `aging separa vencido e faixas` (vencimentos hoje−1, hoje+10, +45, +75, +120); `CSV escapa ponto e vírgula e aspas`.
- [ ] **Step 2: Rodar** — FAIL.
- [ ] **Step 3: Portar** de `Rules` e, para `aging`/séries, das funções de `Views`/`Charts` citadas no mapa §1.1–1.5.
- [ ] **Step 4: Rodar** — PASS.
- [ ] **Step 5: Commit** `feat(financeiro): consolidado, caixa, alertas corporativos e séries dos gráficos`

### Task 6: Validações com as mensagens do protótipo

**Files:**
- Create: `packages/lib/src/financeiro/validacao.ts`, `validacao.test.ts`

**Interfaces:**
- Consumes: Tasks 2–3 (para saldo a faturar, já pago etc.).
- Produces: `type ResultadoValidacao = { ok: true } | { ok: false; erro: string; campo: string }`; `validarEvento(d: DadosEventoFin)`, `validarReceita(d: DadosReceitaFin, livro, idAtual: string|null)`, `validarEtapas(receita, etapas)`, `validarFaturamento(d: DadosFaturamentoFin, livro, idAtual)`, `validarCusto(d: DadosCustoFin, livro, idAtual)`, `validarPagamento(d: DadosPagamentoFin, livro, idAtual)`, `validarConta(d: DadosContaFin)`, `podeExcluirReceita(id, livro)`, `podeExcluirCusto(id, livro)`, `podeExcluirConta(id, livro)` — todas `=> ResultadoValidacao`. `Dados*` = campos editáveis do formulário (mesmos nomes de `tipos.ts`), em centavos. `DadosReceitaFin.centroCusto` e `DadosCustoFin.centroCusto` têm default `"OPE"` quando `eventoId` está preenchido e o campo veio vazio (correção do defeito do protótipo, spec §3.7) — aplicar o default **antes** de validar, numa função `comDefaultsDeLancamento(d)` exportada.

- [ ] **Step 1: Testes que falham:** um teste por `req(...)` de `validateEvento`, `saveReceita`, `saveFatrec`, `saveCusto`, `savePagamento`, `saveConta` e dos bloqueios de exclusão (mapa §3.5), cada um com a **mensagem literal** do protótipo e o `campo`. Exemplos:
```ts
expect(validarEvento({ ...eventoOk, dataFim: "2026-01-01", dataInicio: "2026-02-01" }))
  .toEqual({ ok: false, erro: "A data final não pode ser anterior à inicial.", campo: "dataFim" });
expect(validarPagamento({ ...tituloOk, valorPago: 100 }, livroComCustoSemRealizado, null).erro)
  .toBe("Registre o valor realizado do custo antes da baixa (CUSTO REALIZADO ≠ PAGO)");
expect(comDefaultsDeLancamento({ eventoId: "7", centroCusto: "" }).centroCusto).toBe("OPE");
```
  (Copiar as demais mensagens de `Service` no `/tmp/fin05-app.js`; as acima já estão no mapa e devem bater com o fonte — se divergirem, vale o fonte.) Validações de comissão e de movimento: não portar.
- [ ] **Step 2: Rodar** — FAIL.
- [ ] **Step 3: Portar** de `Service.validate*`/`save*`, transformando o `throw ValidationError` em retorno.
- [ ] **Step 4: Rodar** — PASS.
- [ ] **Step 5: Commit** `feat(financeiro): validações dos lançamentos com as mensagens do protótipo`

### Task 7: Telas, navegação e seletor de módulo

**Files:**
- Modify: `apps/cms/src/lib/cms/telas.ts`, `telas.test.ts`, `navegacao.ts`, `navegacao.test.ts`, `app/(painel)/shell/ShellPainel.tsx`, `shell/SeletorModulo.tsx`, `app/(painel)/ShellCms.tsx`, `app/(painel)/crm/ShellCrm.tsx`, os pontos que usam `destinoDepoisDoLogin` (conferir com `grep -rn destinoDepoisDoLogin apps/cms/src`)

**Interfaces:**
- Produces: `ModuloPainel = "site" | "crm" | "financeiro"` (em `telas.ts` **e** no `ShellPainel.tsx` — hoje o tipo está duplicado; o do shell passa a importar o de `telas.ts`); 4 telas novas no fim de `TELAS`: `{ id: "fin.visao-executiva", modulo: "financeiro", rotulo: "Visão Executiva" }`, `"fin.eventos"` "Eventos e Projetos", `"fin.receber"` "Receber", `"fin.pagar"` "Pagar"; `TELAS_FIN: readonly TelaPainel[]`; `CapacidadesPainel` ganha `usarFinanceiro: boolean` e `excluirFinanceiro: boolean` (= administrador); `navegacao.ts`: `TelaFinId = "visao" | "eventos" | "receber" | "pagar"`, `NAV_FIN`, `navFinVisivel`, `mostraModuloFinanceiro(acesso)`, `telaInicialFin(acesso)`, e `destinoDepoisDoLogin` passa a devolver `"/" | "/crm" | "/financeiro"` (sem tela do Site: CRM se tiver, senão Financeiro se tiver, senão `/`); `ShellPainel`/`SeletorModulo` ganham a prop `mostrarFinanceiro: boolean` e a opção `{ id: "financeiro", rotulo: "Financeiro", descricao: "Gestão financeira", href: "/financeiro" }`.

- [ ] **Step 1: Testes que falham:** `telasDoModulo(acesso com fin.receber, "financeiro")` → `["fin.receber"]`; `destinoDepoisDoLogin({ administrador: false, telas: ["fin.pagar"] })` → `"/financeiro"`; com `["crm.leads","fin.pagar"]` → `"/crm"`; `capacidadesDoAcesso(admin).excluirFinanceiro === true` e de não-admin com todas as telas `fin.*` → `false`; `telaInicialFin` respeita a ordem do menu.
- [ ] **Step 2: Rodar** `pnpm --filter @ntc/cms test telas navegacao` — FAIL.
- [ ] **Step 3: Implementar**; passar `mostrarFinanceiro={mostraModuloFinanceiro(acesso)}` no `ShellCms` e no `ShellCrm`. A tela Usuários já lista `TELAS` (as caixinhas novas aparecem sozinhas — conferir que o agrupamento por módulo mostra "Financeiro").
- [ ] **Step 4: Rodar** testes + `pnpm --filter @ntc/cms typecheck` — PASS.
- [ ] **Step 5: Commit** `feat(painel): módulo Financeiro no seletor e quatro telas de permissão`

### Task 8: Coleções `fin-*`, auditoria e bloqueio no CRM

**Files:**
- Create: `apps/cms/src/collections/financeiro/{FinEventos,FinReceitas,FinFaturamentos,FinCustos,FinPagamentos,FinContas}.ts`, `apps/cms/src/lib/financeiro/{auditoria,exclusao}.ts`, `auditoria.test.ts`, `exclusao.test.ts`, `collections/financeiro/access.test.ts`
- Modify: `apps/cms/src/payload.config.ts` (registrar), `collections/EventosComerciais.ts` (`hooks.beforeDelete: [bloquearEventoComFinanceiro]`), `packages/types/src/payload-types.ts` (via `payload:generate`)

**Interfaces:**
- Consumes: Task 7 (`TELAS_FIN`, `acessoPorTela`, `administrador`).
- Produces: slugs `fin-eventos`, `fin-receitas`, `fin-faturamentos`, `fin-custos`, `fin-pagamentos`, `fin-contas`, campos = `tipos.ts` (Task 2) menos os derivados, com relationships: `fin-eventos.eventoComercial → eventos-comerciais` (opcional, `unique: true`, `index: true`); `fin-receitas.evento → fin-eventos` (opcional); `fin-faturamentos.receita → fin-receitas` (obrigatório); `fin-custos.evento → fin-eventos` (opcional); `fin-pagamentos.custo → fin-custos` (obrigatório); `conta → fin-contas` (opcional) em faturamentos e pagamentos; `fin-receitas.etapas` como `array`. Listas fechadas (`vertical`, `tipo`, `status`, `modalidade`, `uf`, `centroCusto`, `segmento`, `tipoReceita`, `statusEconomico`, `criterioReconhecimento`, `fase`, `natureza`, `comportamento`, `driver`, `unidade`, `periodicidade`, `tipo` da conta) gravadas como **`text` validado contra `LISTAS_FIN`** — não `select` — para a Administração da Fase 2 poder editar listas sem alterar enum (spec §3.4). Campos de dinheiro: `number` com `validate` de inteiro ≥ 0 (exceto onde o protótipo aceita negativo — nenhum na Fase 1). `required: true` **só** em `fin-faturamentos.receita`, `fin-pagamentos.custo` e `fin-contas.nome` (obrigatórios desde a criação); todo o resto opcional no schema — inclusive `fin-eventos.nome`, que no evento ligado ao CRM vem do CRM — e a obrigatoriedade fica nas validações da Task 6 (spec §4.2, lição do `NOT NULL`).
  - Access: `read` → `acessoPorTela(TELAS_FIN)` em todas; `create`/`update`: `fin-eventos` → `["fin.eventos"]`; `fin-receitas`/`fin-faturamentos` → `["fin.eventos","fin.receber"]`; `fin-custos`/`fin-pagamentos` → `["fin.eventos","fin.pagar"]`; `fin-contas` → `["fin.receber","fin.pagar"]`; `delete` → `administrador` em todas. `admin.hidden: true` não importa (admin nativo não existe).
  - `registrarAuditoriaFin` (`afterChange` e `afterDelete` das 6): grava `audit-log` com `req` (mesma transação) e `overrideAccess: true`: `usuario` = `req.user?.id`, `acao` `"criar"|"atualizar"|"deletar"`, `entidade` = slug, `entidadeId` = `String(doc.id)`, `descricao` = `"<Rótulo singular> <código> criado|alterado|excluído"` (código = `codigoFin(slug, id)`, ex. `RC-0003`, prefixos do protótipo EV/RC/FR/CU/PG/CT), `metadata` = na atualização `{ mudancas: { [campo]: { antes, depois } } }` só dos campos que mudaram (ignorar `updatedAt`/`createdAt`, comparar por `JSON.stringify`), na criação `{ registro: doc }`, na exclusão `{ registro: doc }`. Não grava nada se `mudancas` ficar vazio. Erro na escrita do log **propaga**.
  - `codigoFin(slug: string, id: string|number): string` exportado de `auditoria.ts` (usado também pela UI).
  - `bloquearEventoComFinanceiro` (`beforeDelete` de `eventos-comerciais`): se existe `fin-eventos` com `eventoComercial = id` **e** com receita ou custo, lança `APIError("Este evento tem lançamentos no Financeiro e não pode ser apagado.", 400)`; consulta falhando ⇒ lança (falha fechado), no padrão de `lib/crm/exclusaoCliente.ts`.

- [ ] **Step 1: Testes que falham:** (a) access: não-admin com `fin.receber` não tem `delete` em `fin-receitas`; com `fin.pagar` não cria `fin-receitas`; admin pode tudo; (b) auditoria (payload simulado, no padrão dos testes de `lib/crm`): atualização que muda só `valorUnit` grava `metadata.mudancas` com só `valorUnit`; atualização sem mudança não grava; falha do `create` do log rejeita o hook; `codigoFin("fin-receitas", 3) === "RC-0003"`; (c) bloqueio: evento com `fin-eventos` + receita → lança com a mensagem; sem lançamentos → passa; consulta que falha → lança.
- [ ] **Step 2: Rodar** — FAIL.
- [ ] **Step 3: Implementar e registrar**; rodar `pnpm --filter @ntc/cms payload:generate` (o script **não** toca o banco) e `git checkout`-ar nada além de reverter formatação se o arquivo sair sem formatar (CLAUDE.md v3.7: rodar o formatador do repo sobre `payload-types.ts`).
- [ ] **Step 4: Rodar** testes + typecheck — PASS. **Não** rodar `payload:push:schema`.
- [ ] **Step 5: Commit** `feat(financeiro): coleções do financeiro com auditoria e bloqueio de exclusão no CRM`

### Task 9: Leitura do livro

**Files:**
- Create: `apps/cms/src/lib/financeiro/leitura.ts`, `leitura.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 8.
- Produces: `lerLivroFinanceiro(req?: PayloadRequest): Promise<LivroFinanceiro>` (`server-only`; com `req`, lê dentro da transação dele — usado pela Task 10; lê as 6 coleções com `pagination: false`, `depth: 0`, e `eventos-comerciais` com `depth: 1` e `select` mínimo: `titulo`, `dataInicio`, `dataFim`, `modalidade`, `local`, `cliente` (só `orgao`), `status`, `contratoEmpenho.numero`, `moduloCatalogo` (id)); `mesclarEventos(fin: FinEventoDoc[], crm: EventoComercialDoc[]): EventoFin[]` (pura, exportada para teste); `lerHistoricoFin(slug: string, id: string): Promise<ItemHistorico[]>` (`ItemHistorico = { quando: string; quem: string; acao: string; mudancas: { campo: string; antes: unknown; depois: unknown }[] }`, mais recente primeiro, nome do usuário resolvido).
  - Regras de `mesclarEventos` (spec §3.2): evento com CRM → `origem "crm"`, `id` = id do `fin-eventos`, campos do CRM vencem quando preenchidos (modalidade mapeada `presencial`→"Presencial", `online`→"Online ao vivo", `hibrido`→"Híbrido"; datas cortadas em `AAAA-MM-DD`; `cliente` = `orgao`), vazio no CRM ⇒ valor do `fin-eventos`; `refContratual` vazio ⇒ `contratoEmpenho.numero`; `canceladoNoCrm = status === "cancelado"`. Evento comercial **sem** `fin-eventos` → `EventoFin` com `id = "crm-<idComercial>"`, `cadastroPendente: true`, campos do CRM e o resto vazio. Evento só do financeiro → `origem "financeiro"`.
  - Datas e ids de relacionamento normalizados para `string`; dinheiro já vem em centavos.
  - `recortarLivroPorTela(livro: LivroFinanceiro, acesso: AcessoPainel): LivroFinanceiro` (pura): com `fin.visao-executiva` ou `fin.eventos` (ou administrador) devolve tudo; senão só `fin.receber` ⇒ `custos` e `pagamentos` vazios; só `fin.pagar` ⇒ `receitas` e `faturamentos` vazios; `eventos` e `contas` sempre (apoio mínimo: rótulo de origem e selects — regra da v3.8 de não mandar ao navegador dado de tela não marcada).

- [ ] **Step 1: Testes que falham** (sobre `mesclarEventos` e um `lerLivroFinanceiro` com payload simulado): `evento do CRM sem dataFim usa a do financeiro`; `modalidade online do CRM vira "Online ao vivo"`; `evento cancelado no CRM fica com canceladoNoCrm`; `evento comercial sem cadastro financeiro aparece pendente com id crm-<id>`; `refContratual cai no número do contrato`; `faturamento referencia receita por id string`; `quem só tem fin.receber não recebe custos nem pagamentos`; `quem só tem fin.pagar não recebe receitas nem faturamentos`.
- [ ] **Step 2: Rodar** — FAIL. **Step 3: Implementar.** **Step 4: Rodar** — PASS.
- [ ] **Step 5: Commit** `feat(financeiro): leitura do livro com eventos do CRM mesclados`

### Task 10: Escrita e Server Actions

**Files:**
- Create: `apps/cms/src/lib/financeiro/escrita.ts`, `escrita.test.ts`, `apps/cms/src/app/(painel)/acoesFinanceiro.ts`, `acoesFinanceiro.test.ts`

**Interfaces:**
- Consumes: Tasks 6, 8, 9, `executarEmTransacao`, guardas de `autenticacao.ts`.
- Produces (`escrita.ts`, todas `(…, usuario: UsuarioAutenticado) => Promise<ResultadoFin>`, `ResultadoFin = { ok: true; id: string } | { ok: false; erro: string; campo?: string }`): `salvarEventoFin(id: string|null, dados: DadosEventoFin)` (id `"crm-<n>"` ⇒ cria o `fin-eventos` ligado ao comercial `n`); `salvarReceitaFin(id, dados)`; `salvarEtapasFin(receitaId, etapas)`; `salvarFaturamentoFin(id, dados)`; `salvarCustoFin(id, dados)`; `salvarPagamentoFin(id, dados)`; `salvarContaFin(id, dados)`; `excluirEventoFin(id)`, `excluirReceitaFin(id)`, `excluirFaturamentoFin(id)`, `excluirCustoFin(id)`, `excluirPagamentoFin(id)`, `excluirContaFin(id)`.
  - Cada escrita roda em `executarEmTransacao`: **relê o livro dentro da transação** (`lerLivroFinanceiro(req)`), aplica `comDefaultsDeLancamento`, valida com a Task 6 contra esse livro, só então grava (validar **antes** de escrever — comentário de `transacao.ts`). Evento ligado ao CRM: nunca escreve em `eventos-comerciais`; campos que o CRM já preenche não são gravados no `fin-eventos`.
  - `excluirEventoFin`: evento do financeiro ⇒ cascata pagamentos → custos → faturamentos → receitas → evento; ligado ao CRM ⇒ só se sem receitas/custos, senão `{ ok:false, erro: "Este evento tem lançamentos; exclua-os antes de remover o cadastro financeiro." }`.
- Produces (`acoesFinanceiro.ts`, `"use server"`): uma action por função acima com sufixo `Fin` → `…Acao` (ex. `salvarReceitaFinAcao`), guardas: evento → `["fin.eventos"]`; receita/etapas/faturamento → `["fin.eventos","fin.receber"]`; custo/pagamento → `["fin.eventos","fin.pagar"]`; conta → `["fin.receber","fin.pagar"]`; **toda exclusão** → `obterAdministradorAutenticado()`. Mais `carregarHistoricoFinAcao(slug, id)` (qualquer tela `fin.*`; `slug` validado contra os 6). Sucesso ⇒ `revalidatePath("/financeiro")`. Recusa ⇒ `{ ok:false, erro: "Sessão expirada ou sem permissão para esta ação." }`. Receita/custo **corporativos** (sem evento) exigem `fin.receber`/`fin.pagar` respectivamente (quem só tem `fin.eventos` não cria lançamento corporativo).
- [ ] **Step 1: Testes que falham:** (escrita, payload simulado) `segundo faturamento acima do saldo é recusado com o livro relido na transação` (livro inicial com saldo 100; outro faturamento de 80 inserido no "banco" antes; faturar 50 → erro de saldo do protótipo, nada gravado); `receita de evento sem centro grava OPE`; `excluir receita com faturamento é recusado com a mensagem do protótipo`; `excluir evento do financeiro cascateia na ordem`; `excluir evento ligado ao CRM com lançamento é recusado`; `evento crm-12 cria fin-eventos ligado ao 12 e não escreve em eventos-comerciais`. (actions) `excluir exige administrador` (usuário com todas as telas fin, não admin → recusa); `receita corporativa exige fin.receber`; `carregarHistoricoFinAcao recusa slug fora dos seis`.
- [ ] **Step 2: Rodar** — FAIL. **Step 3: Implementar.** **Step 4: Rodar** — PASS + typecheck.
- [ ] **Step 5: Commit** `feat(financeiro): escrita transacional e server actions do financeiro`

### Task 11: Casco `/financeiro`, CSS, fontes, gráfico e primitivas

**Files:**
- Create: `app/(painel)/financeiro/{layout.tsx,page.tsx,ShellFinanceiro.tsx,financeiro.css}`, `financeiro/ui/{Grafico,Gaveta,Kpi,Tabela,Selo,CampoDinheiro,Historico}.tsx`
- Modify: `apps/cms/src/app/fonts.ts` (Barlow Condensed), `apps/cms/package.json` (`chart.js@4.4.0`)

**Interfaces:**
- Consumes: Tasks 5, 7, 9, 10.
- Produces: `page.tsx` (Server Component, `dynamic = "force-dynamic"`): `exigirUsuarioCms()`, `redirect("/")` se `!mostraModuloFinanceiro(acesso)`, `recortarLivroPorTela(await lerLivroFinanceiro(), acesso)` (em `try`, erro ⇒ livro vazio + `erroLeitura`), `hojeISO = hojeEmSaoPaulo(new Date())`, renderiza `<ShellFinanceiro usuario acesso capacidades livro hojeISO erroLeitura />`. `ShellFinanceiro` (client): estado da tela como `ShellCrm` (`telaInicialFin`), grupo de menu "Ambientes" com os itens visíveis de `NAV_FIN`, `<ShellPainel modulo="financeiro" …>`, conteúdo dentro de `<div className="fin05">`; navegação interna da área do evento por estado (`{ tela: "eventos", eventoId, aba }`). `Grafico` (client): props `{ tipo: "barras"|"barrasHorizontais"|"combo"|"rosca"; dados: SerieGrafico; altura?: number; rotulo: string }`, registra só `BarController, LineController, DoughnutController, BarElement, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend` e reproduz cores, fontes, eixos e tooltip do `Charts` do protótipo (valores em reais via `formatarReais`); `destroy()` no unmount; `role="img"` + `aria-label` = `rotulo` + resumo textual dos números (spec §5). `Gaveta`: drawer lateral com título, foco preso, Esc fecha, devolve o foco a quem abriu (padrão do `ModalLead`), markup/classes do drawer do protótipo. `CampoDinheiro`: input texto que usa `paraCentavos` e mostra o erro do campo. `Historico`: chama `carregarHistoricoFinAcao` ao abrir e lista `ItemHistorico`.
  - `financeiro.css`: o `<style>` inteiro do protótipo, aninhado sob `.fin05 { … }` (CSS nesting nativo), com `:root`/`html`/`body` trocados por `.fin05`; regras da sidebar/topbar do protótipo **removidas** (a moldura é a do painel); `--serif`, `--sans`, `--cond` apontando para as variáveis do `next/font` (`var(--font-titulo)`, `var(--font-corpo)`, `var(--font-cond)`). `layout.tsx` só importa o CSS e aplica a variável da Barlow Condensed.
- [ ] **Step 1:** `pnpm --filter @ntc/cms add chart.js@4.4.0`; adicionar `barlowCondensed` em `fonts.ts` (pesos usados no protótipo — conferir os `font-weight` com `--cond`).
- [ ] **Step 2:** Implementar os arquivos com as quatro telas como placeholders vazios (`[em construção]` só nesta task).
- [ ] **Step 3: Verificar:** `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint` limpos; com o dev no ar, `/financeiro` logado como administrador abre com o seletor mostrando Financeiro e os 4 itens; usuário sem `fin.*` é levado a `/`. Parar o dev e rodar `pnpm --filter @ntc/cms build` — green.
- [ ] **Step 4: Commit** `feat(financeiro): casco do módulo com estilos do protótipo, Chart.js e primitivas`

### Task 12: Visão Executiva

**Files:** Create: `financeiro/visao/TelaVisaoExecutiva.tsx` (+ subcomponentes no mesmo diretório, se ajudar)

**Interfaces:** Consumes: `portfolio`, `consolidado`, `corpAlerts`, séries (Task 5), `Grafico`, `Kpi` (Task 11). Props `{ livro; hojeISO; capacidades; acesso; irPara(tela, extra?) }`.

- [ ] **Step 1: Portar `Views.dashboard`** (mapa §1.1) seção a seção, na ordem: filtros (período de `periodosDisponiveis`, vertical, modalidade, status, tipo — o consolidado usa **só** o período, como no protótipo); Posição consolidada (3 cartões); Eventos × corporativo (4 KPIs); Pendências corporativas; Carteira (resultHero **sem** a célula de comissões; grupos Receita e Custos com as barras ÷); Análise (5 gráficos + Pendências e alertas com a gaveta de todas); Carteira de eventos (faixa por status operacional, que leva a Eventos filtrado; Eventos recentes). **Sem** o bloco Comissões. "Novo evento" abre o `WizardEvento` (Task 13) — até lá, o botão fica, ligado na Task 13. Links para Eventos/Receber/Pagar só aparecem se a pessoa tem a tela.
- [ ] **Step 2: Verificar:** typecheck/lint limpos; com o dev no ar e **sem nenhum lançamento**, a tela abre sem erro no console, com zeros e "—" (Review Focus 1).
- [ ] **Step 3: Commit** `feat(financeiro): Visão Executiva`

### Task 13: Eventos — lista e wizard

**Files:** Create: `financeiro/eventos/{TelaEventos,WizardEvento}.tsx`

**Interfaces:** Consumes: `matchEvent`, `eventAlerts`, `validarEvento` (validação no cliente para feedback imediato; a action valida de novo), `salvarEventoFinAcao`, `excluirEventoFinAcao`, `LISTAS_FIN`. Produces: `WizardEvento` props `{ evento: EventoFin | null; aoSalvar(id: string): void; aoFechar(): void }`.

- [ ] **Step 1: Portar `Views.events`** (mapa §1.2): abas por vertical, busca, filtros, ordenação, Cards/Lista, ponto de alerta; selos **"CRM"/"Financeiro"** de origem, **"Cadastro financeiro pendente"** (abre o wizard) e **"Cancelado no CRM"**. Menu do evento: Abrir, Editar cadastro, Excluir (só com `capacidades.excluirFinanceiro`).
- [ ] **Step 2: Portar o wizard de 4 etapas** (`eventSchemas`, `STEP_FIELDS`, campos condicionais e zeragens ao salvar). Para evento do CRM: nome, datas, modalidade, local e cliente aparecem **só leitura** com a nota "Editar no CRM" quando o CRM os tem; vazios no CRM ficam editáveis (spec §3.2). Programa = `LISTAS_FIN.programas[vertical]`. Ligar o "Novo evento" da Visão Executiva.
- [ ] **Step 3: Verificar** com o dev no ar: criar evento próprio (aberto, online) → aparece na lista com selo Financeiro; completar o cadastro de um evento do CRM → selo pendente some; tentar data final < inicial → mensagem do protótipo no campo.
- [ ] **Step 4: Commit** `feat(financeiro): lista de eventos e wizard de cadastro`

### Task 14: Área do evento — Visão geral, Receitas e Resultado

**Files:** Create: `financeiro/eventos/{AreaEvento,AbaVisaoGeral,AbaReceitas,AbaResultado,GavetaReceita,GavetaEtapas}.tsx`

**Interfaces:** Consumes: `eventMetrics`, `receitaFin`, `reconhecimentoReceita`, `demonstrativo`, séries, `validarReceita`, `validarEtapas`, `salvarReceitaFinAcao`, `salvarEtapasFinAcao`, `excluirReceitaFinAcao`, `Historico`. Produces: `AreaEvento` props `{ evento: EventoFin; livro; hojeISO; capacidades; aba: AbaEvento; aoTrocarAba; aoVoltar }`, `AbaEvento = "visao"|"receitas"|"custos"|"faturamento"|"pagamentos"|"resultado"`.

- [ ] **Step 1: Portar o cabeçalho** de `Views.workspace` (Editar, ⋯, **Lançar ▾ sem "Comissão comercial"**) e as abas na ordem do protótipo **sem** Comissões; as abas Custos/Faturamento/Pagamentos ficam vazias até a Task 15.
- [ ] **Step 2: Portar `wsOverview`, `wsReceitas` (com `openReceitaDrawer` e `openEtapasDrawer`) e `wsResultado`** (demonstrativo sem a linha de comissões; indicadores por participante sem comissão/participante). Gaveta de receita com campo **Centro de custo** (default OPE) e o bloco Histórico ao editar.
- [ ] **Step 3: Verificar** com o dev no ar: lançar receita B2G com 2 etapas, concluir uma → reconhecido e Resultado mudam; excluir receita sem faturamento como admin; como não-admin, botão Excluir não aparece; histórico mostra a criação e a alteração.
- [ ] **Step 4: Commit** `feat(financeiro): área do evento com visão geral, receitas e resultado`

### Task 15: Área do evento — Custos, Faturamento e recebimentos, Pagamentos

**Files:** Create: `financeiro/eventos/{AbaCustos,AbaFaturamento,AbaPagamentos,GavetaCusto,GavetaFaturamento,GavetaPagamento}.tsx`; `financeiro/receber/GavetaConta.tsx` (usada aqui e na Task 16)

**Interfaces:** Consumes: `custoFin`, `faturamentoFin`, `pagamentoFin`, validações, actions de custo/faturamento/pagamento/conta, `saldosPorConta`. Produces: `GavetaFaturamento` props `{ faturamento: FaturamentoFin|null; receitaId?: string; modo: "editar"|"receber" }`, `GavetaPagamento` `{ pagamento: PagamentoFin|null; custoId?: string; modo: "editar"|"baixar" }`, `GavetaConta` `{ aoCriar(conta: ContaFin): void }` — reutilizadas pelas Tasks 16–17.

- [ ] **Step 1: Portar `wsCustos`, `wsFaturamento`, `wsPagamentos`** (mapa §1.3, itens 3, 5 e 6) com as gavetas. Selects de conta com o atalho **"Nova conta"** abrindo `GavetaConta` (nome, tipo, banco, agência, número, saldo inicial, data do saldo inicial, ativa, observação; `validarConta`); só contas ativas no select. Custo do evento com Centro de custo default OPE.
- [ ] **Step 2: Verificar** com o dev no ar: custo orçado → realizado → título → baixa parcial → baixa total, com a conta criada na hora; tentar baixa sem realizado → mensagem "CUSTO REALIZADO ≠ PAGO"; faturar → receber com retenção contratual → "a liberar" aparece.
- [ ] **Step 3: Commit** `feat(financeiro): custos, faturamento e pagamentos na área do evento`

### Task 16: Receber

**Files:** Create: `financeiro/receber/{TelaReceber,GavetaReceitaCorporativa}.tsx`

**Interfaces:** Consumes: `escopo`, `faturamentoFin`, `aging`, séries, `gerarCsv`, `GavetaFaturamento`, `GavetaConta`, `salvarReceitaFinAcao`.

- [ ] **Step 1: Portar `Views.receber`** (mapa §1.4): filtros (período, escopo, centro, situação, busca), "Receita corporativa" (`openReceitaCorpDrawer`), "Registrar faturamento" (escolher evento → abre o evento na aba Faturamento; ou corporativo), KPIs Recebível e Realização (com os marcadores `[VALIDAR COM CONTABILIDADE]`), aging, gráfico, tabela de parcelas com "Receber"/editar, exportar CSV (`gerarCsv`, colunas da tabela), nota "Retenção não é inadimplência". Mais uma seção **"Contas financeiras"** simples (lista nome/tipo/saldo de `saldosPorConta` + "Nova conta"; editar/inativar; excluir só admin) — decisão do spec §3.4 para a Fase 1.
- [ ] **Step 2: Verificar** com o dev no ar: receita corporativa (Consultoria institucional, DIR) → faturar → receber; aparece em Receber com origem "Corporativo · Diretoria" e na Visão Executiva em "Operação corporativa"; CSV abre no Excel com acentos corretos.
- [ ] **Step 3: Commit** `feat(financeiro): tela Receber com receita corporativa e contas`

### Task 17: Pagar

**Files:** Create: `financeiro/pagar/{TelaPagar,GavetaDespesaCorporativa}.tsx`

**Interfaces:** Consumes: `escopo`, `pagamentoFin`, `custoFin`, `aging`, séries, `gerarCsv`, `GavetaPagamento`, `GavetaConta`, `salvarCustoFinAcao`.

- [ ] **Step 1: Portar `Views.pagar`** (mapa §1.5): filtros, "Despesa corporativa" (`openCustoCorpDrawer`, com periodicidade só rótulo e o placeholder de `criterioApropriacao`), "Registrar título", KPIs (incorrida, obrigações + selo "sem título", pago, a pagar), aging, gráfico, tabela de títulos com Baixar/editar, CSV, bloco **Estrutura compartilhada** com a nota de "nenhum rateio". Sem títulos de comissão (não existem na Fase 1).
- [ ] **Step 2: Verificar** com o dev no ar: despesa corporativa compartilhada (aluguel, EST) → título → baixa; aparece no bloco Estrutura compartilhada e nas Pendências corporativas da Visão Executiva ("sem critério de rateio · A validar").
- [ ] **Step 3: Commit** `feat(financeiro): tela Pagar com despesa corporativa e estrutura compartilhada`

### Task 18: Documentação, gates e entrega ao PO

**Files:** Modify: `CLAUDE.md` (nova entrada **v3.9** no histórico + §19.1 coleções/painel + §19.3 item novo com o roteiro abaixo), `.env.example` (nada novo — conferir)

- [ ] **Step 1: Gates com o dev parado:** `pnpm lint` (0 erros), `pnpm typecheck`, `pnpm test`, `pnpm build --force` — anotar números (testes por pacote, warnings) e apagar os `.next` depois.
- [ ] **Step 2: Escrever a v3.9** no padrão das anteriores: o que entrega, decisões do PO (lançamentos próprios, eventos do CRM + próprios, fases, Chart.js, exclusão só admin, histórico desde já), decisões do agente (lista do spec, marcadas), dívidas, verificação, e a **pendência bloqueante do PO**: `payload:push:schema` (dev parado; antes, `git worktree list` e confirmar que nenhuma outra branch viva já pushou schema — regra da v1.9); diff esperado **só com criações**: tabelas `fin_eventos`, `fin_receitas`, `fin_receitas_etapas`, `fin_faturamentos`, `fin_custos`, `fin_pagamentos`, `fin_contas`, colunas/FKs `*_id` delas, entradas em `payload_locked_documents_rels`, **4 valores novos em `enum_users_telas`**, mais o drift recorrente já conhecido (`SET DEFAULT`, índices de nome truncado); **qualquer `DROP TABLE`/`DROP COLUMN`/`DISABLE ROW LEVEL SECURITY` é `N`**; depois conferir por `psql` (com `BEGIN READ ONLY`) que as 7 tabelas novas estão com RLS ligado. Roteiro de checkpoint visual do PO lado a lado com o protótipo (desktop 1440 / mobile 375): os passos de verificação das Tasks 12–17, mais dar a um usuário só `fin.receber` e conferir que ele não vê Pagar nem o botão Excluir.
- [ ] **Step 3: Commit** `docs: registra o módulo Financeiro fase 1 no CLAUDE.md (v3.9)`
