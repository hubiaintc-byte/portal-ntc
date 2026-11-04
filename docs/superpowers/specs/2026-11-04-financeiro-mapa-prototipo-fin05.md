# Mapa do protótipo NTC FIN-05 v0.2.2 (Financeiro)

Fonte: `docs/prototipos/financeiro-fin05-v0.2.2.html` (cópia versionada de `NTC_FIN05_Web_v0.2.2 (2).html`). O arquivo tem 2 `<script>`: o 1º é o Chart.js 4.4.0 embutido (ignorar); o 2º (offset ~268454) é o app, ~6.000 linhas. Para reler: extrair o 2º script e procurar os nomes citados aqui.

Camadas do app (nesta ordem no arquivo):
`PARAMS` (listas) → `buildSeed()` (dados fictícios) → `Repo` (repositório em memória, interface Promise) → `Rules` (fórmulas puras) → `Service` (validação `req(...)` + gravação) → UI (`renderShell`, `Router`, `Views.*`, drawers `open*Drawer`). `window.NTC_FIN05 = { Repo, Rules, Service, UI, PARAMS }`.

**Dinheiro:** tudo em **centavos inteiros** (`CENTS=100`, `toCents`, `parseCents`). O seed é convertido no fim de `buildSeed()` via `MONEY_FIELDS`. `Rules.integridade` confere que nenhum valor gravado é fracionário.

**Frase-guia (cabeçalho de `Rules`):** CONTRATADO ≠ FATURADO · FATURADO ≠ RECEBIDO · CUSTO REALIZADO ≠ PAGO · RECEITA ≠ ENTRADA DE CAIXA · CUSTO/DESPESA ≠ SAÍDA DE CAIXA. Cada fato econômico e cada movimentação existem **uma única vez** ("livro financeiro único").

**Margem:** não existe indicador de margem. A seção "Sobre" diz: "Indicadores de margem — retirados da interface operacional por decisão da Diretoria (v0.2.1)". Não construir margem %.

---

## 1. Telas (sidebar `renderShell`, nesta ordem)

Grupo "Ambientes":
1. **Visão Executiva** `#/visao-geral` → `Views.dashboard`
2. **Eventos e Projetos** `#/eventos` → `Views.events`; `#/eventos/:id/:tab` → `Views.workspace`
3. **Receber** `#/receber` → `Views.receber`
4. **Pagar** `#/pagar` → `Views.pagar`
5. **Comissões** `#/comissoes` → `Views.comissoes`
6. **Caixa** `#/caixa` → `Views.caixa`
7. **Resultado e Orçamento** `#/resultado/:tab` → `Views.resultado`
8. **Relatórios** `#/relatorios/:id` → `Views.reports`

Grupo "Governança":
9. **Administração** `#/administracao` → `Views.config`

Fora das telas: a topbar tem busca global de eventos (`bindGlobalSearch`, Ctrl/Cmd+K, até 7 resultados, Enter abre o evento) e o selo "Dados fictícios". As pendências abrem num drawer (`openAlertsDrawer`).

Tipos de gráfico (`Charts`): `bars` (agrupado; opção `horizontal`), `combo` (barras + linha) e `doughnut`. O "funil" é HTML (`funnelRow`), não Chart.js.

### 1.1 Visão Executiva (`Views.dashboard`)

Filtros (`UI.dash`): período, vertical, modalidade, status, tipo. Ações: "Ver eventos" e "Novo evento" (`openEventWizard`).

Agregados usados:
- `P = Rules.portfolio(F)` → só eventos (`tot`, `rows`, `alerts`).
- `K = Rules.consolidado({periodo})` → eventos **e** corporativo. Recebe só o período; ignora vertical, modalidade, status e tipo.
- `KE = consolidado({...F, escopo:'eventos'})`.
- `KC = consolidado({periodo, escopo:'corporativo'})`.
- `corpAl = Rules.corpAlerts(db)`.

Seções, de cima para baixo:
1. **Posição consolidada**: 3 cartões (`persp-card`).
   - Resultado projetado `K.projetado` = contratada − orçado.
   - Resultado econômico `K.economico` = reconhecida − incorrido no período.
   - Movimentação líquida de caixa `K.movimentacaoLiquida`, com "saldo atual `K.saldoAtual` em N conta(s)".
2. **Eventos × corporativo** (4 KPIs):
   - Eventos e projetos `KE.economico` (+ reconhecida).
   - Operação corporativa `KC.economico` (+ incorrido).
   - Valor a receber `K.exigivel` (+ selo "retenção contratual" `K.aLiberar`).
   - Valor a pagar `K.aPagar`.
3. **Comissões comerciais**, só se `K.nComissoes>0`: Previsto, Devido, Pago e A pagar (`K.comissao*`); botão "Abrir comissões".
4. **Pendências corporativas**: lista `corpAl` (6 itens + "ver todas").
5. **Carteira de eventos e projetos** (somente `tot` do portfolio):
   - `resultHero(tot)`: resultado = `resultadoRealizado` (reconhecida − realizado). Células: Resultado previsto, Comissões comerciais (`comissaoDevida`/`comissaoSaldo`), Movimentação financeira (`movimentacao` = recebida − pago), Desvio do orçamento (`desvio` = realizado − previsto dos itens realizados).
   - Grupo **Receita**: Receita contratada (+ prevista), Receita faturada (barra ÷ contratada), Receita recebida (barra ÷ faturada), Saldo a receber (`aReceber` + selo de vencido somado dos alertas 'Vencido' da aba faturamento).
   - Grupo **Custos**: Custo orçado, Custo realizado (÷ orçado), Valor pago (÷ realizado), Saldo a pagar (+ vencido).
6. **Análise**:
   - "Receita × Custo × Resultado" por vertical, `bars`: faturada, realizado, `resultado` (= faturada − realizado, a "leitura histórica").
   - "Do contrato ao caixa", funil HTML: contratada → faturada → recebida; orçado → realizado → pago.
   - "Evolução mensal do caixa", `combo` (`cashSeries`): barras faturado (por `dataFaturamento`) e recebido (`dataRecebimento`); linha pago (`dataPagamento`). Só eventos.
   - "Composição dos custos" por fase, `doughnut` (`phaseDonut`, custo realizado).
   - "Orçado × Realizado" por categoria, `bars` horizontal, top 8 por previsto. Usa os `custos` dos eventos, **não** a entidade `orcamentos`.
   - "Pendências e alertas": 6 itens + drawer.
7. **Carteira de eventos**:
   - Faixa de status com contagem por `statusOperacional`; clicar leva a Eventos filtrado.
   - "Eventos recentes": 6, ordenados pela distância de hoje (`recentEvents`).

### 1.2 Eventos, lista (`Views.events`)

- Abas por vertical (com contagem).
- Busca (`matchEvent`: id, nome, programa, módulo, cliente, cidade, uf, vertical, tipo).
- Filtros: status, modalidade, período (por `dataInicio`) e tipo.
- Ordenação: data ↓/↑, nome, ID, status.
- Visualização em Cards ou Lista.
- Cada evento mostra um ponto de alerta com a contagem de alertas Vencido/Pendente.
- Menu do evento (`eventMenu`): Abrir, Editar cadastro (`openEventWizard`), Excluir (`deleteEventFlow`, que **cascateia** pagamentos, custos, fatrec e receitas — `Service.deleteEvento`).
- **Wizard em 4 etapas** (`eventSchemas`, `STEP_FIELDS`):
  1. Identificação: nome, vertical, tipo, programa, módulo.
  2. Execução: modalidade, cidade, uf, local, datas, carga horária, status, responsável.
  3. Operação: cliente, qtdPrevista, capacidade, efetivos, pagantesPrev, cortesiasPrev, total calculado.
  4. Referências: refCrm, refContratual, observações, resumo.
- Campos condicionais:
  - programa/módulo ficam ocultos em Evento aberto/avulso;
  - local fica oculto em Online;
  - cliente fica oculto em Evento aberto (ali o cliente fica em cada receita);
  - efetivos só aparecem em Em execução/Realizado/Encerrado;
  - pagantes/cortesias previstos só em aberto/avulso.
- Ao salvar: online zera `local`; aberto zera `cliente`; quem não é aberto/avulso zera pagantesPrev/cortesiasPrev.
- Notas: `TIPO_NOTES`, `modalidadeNote` (categorias priorizadas pela modalidade).

### 1.3 Workspace do evento (`Views.workspace`, `WS_TABS`)

Cabeçalho:
- id · refCrm, nome, vertical, tipo, modalidade, período, programa·módulo, badge de status.
- Botões: Editar, ⋯ (pendências, excluir).
- **Lançar ▾**: Receita, Custo, Faturamento, Pagamento, Comissão comercial.

Abas (com contagens):

1. **Visão geral** (`wsOverview`):
   - Fatos do cadastro (12 itens).
   - `resultHero(m)`.
   - Fluxo de receita: contratada → faturada → recebida → a receber.
   - Fluxo de custos: orçado → realizado → pago → a pagar.
   - Mini-KPIs de operação: previstos/capacidade, efetivos (% do previsto), pagantes, cortesias, participantes.
   - Gráficos: `bars` Receita × Custo em 3 pares (contratado/orçado, faturado/realizado, recebido/pago); `doughnut` por fase.
   - Pendências do evento (5).
2. **Receitas** (`wsReceitas`):
   - Mini-KPIs: contratada, prevista, pagantes·cortesias (aberto) ou faturada (B2G), nº de órgãos.
   - Tabela: ID, cliente/segmento, tipo, [aberto: inscrições×valor, desconto, pag·cort | B2G: etapa], valor contratado, reconhecido, status.
   - Ações: Adicionar receita (`openReceitaDrawer`); **"Etapas e reconhecimento"** (`openEtapasDrawer`, só fora do modo aberto). Por linha: Registrar faturamento, Editar, Excluir.
   - Gráficos `bars`: receita contratada por segmento (`segChart`) e pagantes/cortesias por órgão (`pcChart`).
3. **Custos** (`wsCustos`):
   - Mini-KPIs: orçado, realizado, desvio (itens realizados), saldo a pagar.
   - Faixa de "categorias priorizadas para a modalidade" com as que ainda não têm lançamento.
   - Filtros: fase, status (`statusCusto`), busca.
   - Tabela agrupada por fase: ID, descrição, fornecedor, previsto, realizado, desvio, pago, status.
   - Ações: Adicionar custo; por linha Registrar pagamento, Editar, Excluir.
4. **Comissões** (`wsComissoes`): mini-KPIs (previstas, devidas, pago, a pagar), `comissoesTable` e "Adicionar comissão".
5. **Faturamento e recebimentos** (`wsFaturamento`):
   - Fluxo: contratada → faturada → recebida → a receber (com nº de parcelas vencidas).
   - Nota dourada de retenções (tributária, contratual, a liberar).
   - Busca e "Somente com saldo".
   - Tabela: receita/parcela, vencimento, faturado, ret. trib., ret. contr., líquido esperado, recebido, a receber, faturado em aberto, situação.
   - Ações: Registrar faturamento; por linha Registrar recebimento (`mode:'receber'`), Editar, Excluir.
   - Gráfico `bars` "Cronograma de faturamento e recebimento" (`frChart`).
6. **Pagamentos** (`wsPagamentos`):
   - Mini-KPIs: realizado, pago, saldo a pagar, vencido sem baixa.
   - Tabela: custo/título, documento, vencimento, valor do título, pagamento, valor pago, saldo, status.
   - Ações: Registrar pagamento; por linha Registrar baixa (`mode:'baixar'`), Editar, Excluir.
7. **Resultado** (`wsResultado`):
   - `resultHero`.
   - `demoTable(m.demo)`: Previsto/Realizado/Caixa × Receitas, (−) operacionais, (−) comissões, (=) resultado.
   - "Como o resultado se forma" em 3 caixas: Receitas, Custos (operacionais vs comissões, diretos) e Resultado (reconhecida − realizado, previsto, desvio, movimentação).
   - Indicadores por participante: custo/participante, receita/pagante, receita/participante, comissão/participante.
   - Pagantes × cortesias: barra, % de cortesias, participantes/capacidade.
   - `bars` horizontal: orçado × realizado por categoria.

### 1.4 Receber (`Views.receber`)

- Filtros `FIN_KEYS`: período (por vencimento, ou data de faturamento se não houver), **escopo** (eventos/corporativo), **centro de custo**, situação (`aberto`/`vencido`/`parcial`/`quitado`/`retencao`), busca.
- Ações: "Receita corporativa" (`openReceitaCorpDrawer`) e "Registrar faturamento" (`openFaturamentoEscolha`: escolher evento — que manda para a lista de eventos — ou corporativo).
- KPIs, grupo Recebível: bruto faturado, retenção tributária [VALIDAR COM CONTABILIDADE], retenção contratual (+ a liberar), líquido esperado.
- KPIs, grupo Realização: recebido (÷ líquido), valor a receber (`exigivel` + vencido), retenção contratual a liberar, diferença de conciliação.
- **Aging** (`aging`/`agingStrip`) sobre o exigível: vencido, ≤30, 31–60, 61–90, >90 dias.
- Gráfico `bars`: exigível por mês de vencimento.
- Tabela de parcelas: documento, origem (`origemLabel`: link do evento ou "Corporativo" + centro), vencimento/emissão, bruto, retenções, líquido, recebido (data · conta), a receber (+ conciliação), situação.
- Ações por linha: "Receber" (`abrirFatrec(id,'receber')`) e editar. Exporta CSV.
- Nota final: "Retenção não é inadimplência".

### 1.5 Pagar (`Views.pagar`)

- Filtros `PAG_KEYS`: período (por vencimento), escopo, centro, situação, busca.
- Ações: "Despesa corporativa" (`openCustoCorpDrawer`) e "Registrar título" (`openTituloEscolha`).
- KPIs:
  - Despesa incorrida (÷ orçado).
  - Obrigações registradas (soma de `pagamentos.valor`) + selo "sem título" = Σ max(0, realizado − programado).
  - Pago (÷ obrigações).
  - Valor a pagar (+ vencido).
- Aging e `bars` de obrigações por mês de vencimento.
- Tabela de títulos: título/despesa, origem/centro (+ "compartilhada"), competência, vencimento, valor, pago (data), saldo, conta, status. Ações "Baixar" e editar. Exporta CSV.
- Bloco **Estrutura compartilhada**: custos `compartilhada`, 12 mais recentes, com a nota "nenhum rateio".
- As comissões aparecem aqui como títulos comuns, porque são custos.

### 1.6 Comissões (`Views.comissoes`) — Fase 2

- Filtros `COM_KEYS`: período (competência), vertical, situação (prevista/devida/parcial/paga/vencida), busca.
- KPIs: previsto (+ ainda não devido), devido (÷ previsto), pago (÷ devido), a pagar (+ vencido).
- `bars` horizontal por vendedor (devido × pago) e tabela-resumo por vendedor.
- `comissoesTable` + CSV.
- Menu da comissão (`comissaoMenu`): Editar; "Reconhecer como devida"; Programar/Registrar pagamento (`openPagamentoDrawer`); Excluir.

### 1.7 Caixa (`Views.caixa`) — Fase 2

- Cartões por conta (`saldosPorConta`: saldo inicial, entradas, saídas, saldo) + cartão de saldo consolidado.
- **Projeção 30/60/90 dias** (`projecaoCaixa`); os vencidos ficam de fora e são informados à parte.
- `combo`: movimentação do mês (barra) + saldo acumulado (linha).
- Aviso de movimentações não classificadas.
- Extrato unificado (`Rules.extrato`) com filtros conta, período, tipoMov e busca; colunas data, movimentação, conta, origem, entrada, saída; CSV.
- Ações: Nova conta (`openContaDrawer`) e Transferência/avulso (`openMovimentoDrawer`).

### 1.8 Resultado e Orçamento (`Views.resultado`, `RES_TABS`) — Fase 2

1. **Perspectivas** (`resPerspectivas`): 3 cartões; `demoTable(c.demo)` consolidado; caixa do período (saldo inicial → final); tabela "Resultado econômico por origem" (eventos, corporativo, "das quais: estrutura compartilhada"); fluxos contratada → reconhecida → faturada → recebida e orçado → incorrido → obrigações → pago; aviso do valor reconhecido por critério provisório.
2. **Competência mensal** (`resCompetencia`): exercício + filtros; `combo` com reconhecida/incorrida (barras) e caixa (linha); tabela mensal com fechamento; CSV.
3. **Consolidação por programa** (`resConsolidacao`): agrupa eventos por `ev.programa`; colunas contratada, reconhecida, incorrido, econômico, recebida, caixa; CSV.
4. **Orçamento** (`resOrcamento`):
   - Filtros: exercício, mês, centro, natureza (`tipoOrc`).
   - KPIs: orçado, realizado, desvio, receitas − despesas.
   - `bars` mensal orçado × realizado.
   - Tabela de linhas com % de execução; "Nova linha orçamentária" (`openOrcamentoDrawer`).
5. **Fechamento mensal** (`resFechamento`):
   - KPIs do exercício.
   - Grade de competências; clicar abre `openFechamentoDialog` (Fechar/Reabrir).
   - Tabela congelado × atual × divergência.

### 1.9 Relatórios (`Views.reports`, `REPORTS`, `REP_RENDER`) — Fase 2

- Filtros de carteira: período, vertical, modalidade, status, tipo. Os relatórios corporativos não usam filtros. Exporta CSV.
- Resultado: por evento, por vertical, por tipo de operação, comparativo entre períodos (seletores Período A/B, `UI.rep.pa`/`pb`).
- Receita e caixa: receita por período, faturamentos (`fatList`), recebimentos, contas a receber.
- Custos: por categoria, por fase, pagamentos (`payList`), contas a pagar.
- Operação: eventos por modalidade, Online × Presencial.
- Comercial: comissões por vendedor, comissões por evento.
- Corporativo: despesas por centro, por categoria, receita reconhecida por competência, estrutura compartilhada.

### 1.10 Administração (`Views.config`, `CFG_SECTIONS`) — Fase 2

As listas são PARAMS; "locked" = somente leitura. As não travadas aceitam item **só na sessão** (`UI.sessionParams`).

- **Estrutura:** Verticais, Tipos de operação, Modalidades (travadas); Programas por vertical.
- **Status:** operacional, receita, custo, alerta (travadas).
- **Custos:**
  - Categorias e subcategorias: tabela com afinidade online/presencial e uso na base.
  - Fases, Naturezas, Comportamentos (travadas).
  - Fatores de custo e Unidades.
- **Receitas:** Segmentos, Origens, Tipos de receita (travada).
- **Financeiro corporativo:**
  - **Contas financeiras**: CRUD; saldo derivado.
  - **Centros de custo**: só leitura, com contagens.
  - Categorias corporativas, Origens de receita corporativa.
  - Critérios de reconhecimento (travada).
- **Sistema:**
  - **Integridade do livro** (`Rules.integridade`).
  - **Fórmulas e pendências** (tabelas `F` e `PEND`).
  - **Sobre**, com "Restaurar dados fictícios".

---

## 2. Entidades (`buildSeed` → `db`)

Prefixos de id (`Repo` `PREFIX`): EV, RC, FR, CU, PG, CT, MV, OR, FC. Relações (comentário "FIN-05 §7.1"):
- evento 1:N receita 1:N fatrec;
- evento 1:N custo 1:N pagamento;
- receita e custo podem existir **sem evento** (corporativos), sempre com centro de custo;
- comissão = custo especial;
- fatrec/pagamento/movimento → conta.

### eventos (`ev()` base + campos do wizard)

- `id`, `nome`
- `vertical` ∈ verticais
- `tipo` ∈ tiposOperacao
- `modalidade` ∈ modalidades
- `programa` (∈ `PARAMS.programas[vertical]`), `modulo` (texto livre: "Módulos 01 a 03", "Trilha customizada (3 etapas)")
- `cliente`, `cidade`, `uf` ∈ ufs, `local`
- `dataInicio`, `dataFim`, `cargaHoraria`
- `responsavel` (datalist `PARAMS.responsaveis`)
- `status` ∈ statusOperacional
- `qtdPrevista`, `capacidade`, `efetivos`, `pagantesPrev`, `cortesiasPrev`
- `refCrm` ("ID da oportunidade"), `refContratual`, `observacoes`

### receitas (`b.rec`, `recCorp`)

- `id`, `eventoId` ('' = corporativa)
- `tipoLancamento` 'Evento' | 'Corporativa'
- `centroCusto` (cod), `cliente`
- `segmento` ∈ segmentos
- `origem` ∈ origensReceita (evento) ou origensReceitaCorp (corp)
- `tipoReceita` ∈ tiposReceita
- `etapa` (texto), `qtde`, `valorUnit`, `desconto`, `pagantes`, `cortesias`
- `statusEconomico` ∈ {'Prevista','Contratada'} (gravado; os demais status são derivados)
- `criterioReconhecimento` ∈ criteriosReconhecimento
- `etapas[]` = {nome, base 'valor'|'percentual', valor, percentual, concluida, dataConclusao}
- `competencia` (data; obrigatória na corporativa), `referencia`, `observacao`

### fatrec (faturamento + recebimento na MESMA linha) (`b.fat`, `fatCorp`)

- `id`, `receitaId`, `eventoId` (copiado da receita no save)
- `parcela`, `nf`, `dataFaturamento`, `valorFaturado`, `vencimento`
- `retencaoTributaria`, `retencaoContratual`, `retencaoContratualLiberada`
- `dataRecebimento`, `valorRecebido` (acumulado), `contaId`
- `quitado` (bool "Parcela liquidada"), `observacao`

**Não existe entidade "recebimento" separada**: o recebimento é um campo do fatrec, e cada parcela tem um único valor recebido acumulado. Recebimentos parciais = editar o acumulado.

### custos (`b.cost`, `custoCorp`, `comissao`)

- `id`, `eventoId`, `tipoLancamento`, `centroCusto`
- `compartilhada` (bool)
- `origemLancamento` ('' | 'Comissão')
- `fase` ∈ fases (vazio no corporativo)
- `categoria` (∈ `PARAMS.categorias[].nome` no evento; ∈ categoriasCorporativas no corp), `subcategoria`, `descricao`
- `fornecedor`, `documento`
- `natureza` ∈ naturezas, `comportamento` ∈ comportamentos, `driver` ∈ drivers, `unidade` ∈ unidades
- `qtde`, `valorUnitPrev`, `valorRealizado`
- `competencia` (data), `dataPrevista`
- `periodicidade` ∈ periodicidades (só corp; **rótulo apenas**, não gera recorrência)
- `criterioApropriacao`, `observacao`
- Atributos de comissão, só em comissões: `vendedor`, `referenciaComercial`, `modalidadeComissao` ∈ modalidadesComissao, `baseComissao` ∈ basesComissao, `baseValor`, `percentual`, `ajuste`, `ajusteMotivo`, `condicaoAquisicao` ∈ condicoesAquisicao, `devida` (bool), `dataAquisicao`.

### pagamentos (título + baixa na mesma linha)

- `id`, `custoId`, `eventoId` (copiado do custo)
- `documento`, `vencimento`, `valor` (valor do título)
- `dataPagamento`, `valorPago` (acumulado), `contaId`, `observacao`

### contas

- `id`, `nome`, `tipo` ∈ tiposConta, `banco`, `agencia`, `numero`
- `saldoInicial`, `dataSaldoInicial`, `ativa`, `observacao`

### movimentos

- `id`, `data`, `tipo` ∈ {'Transferência','Ajuste/avulso'} (tiposMovimento também lista Recebimento/Pagamento, mas esses vêm de fatrec/pagamentos)
- `contaId`, `contaDestinoId`
- `valor` (avulso é assinado: + entrada, − saída)
- `descricao`, `categoria`, `centroCusto`, `classificado` (bool), `observacao`

### orcamentos

- `id`, `exercicio`, `mes` 'AAAA-MM', `centroCusto`
- `categoria` (texto: corporativas, 'Custos de eventos e projetos', 'Receita institucional', 'Receita financeira', 'Receita de eventos e projetos', origensReceitaCorp)
- `eventoId` (opcional = projeto), `tipo` 'Despesa'|'Receita', `valorOrcado`, `observacao`
- O seed gera uma linha OPE por evento (custo previsto e receita contratada do próprio evento).

### fechamentos

- `id`, `competencia` 'AAAA-MM'
- `status` ∈ {Aberto, Em fechamento, Fechado, Reaberto}
- `dataFechamento`, `responsavel`
- `congelado` (snapshot de `apuracaoMes`), `observacao`
- O seed tem 2026 (jan–jun fechados, jul–set em fechamento) e 2027 aberto.

### Não persistidos (constantes)

- `PARAMS.centrosCusto` {cod,nome}: DIR, ADM, COM, OPE, TEC, MKT, EST.
- `vendedores`: datalist; **não há cadastro de vendedor**, é texto livre.
- `responsaveis`.
- `FORNECEDORES`: só seed; fornecedor é texto livre/datalist.

### Listas de `PARAMS`

- verticais: Educação, Gestão Pública, Saúde
- tiposOperacao: Evento aberto, In Company / Projeto B2G, Programa, Módulo, Evento avulso
- modalidades: Online ao vivo, Presencial, Híbrido (`modalidadeKeys` → on/pr)
- statusOperacional: Planejado, Em preparação, Em execução, Realizado, Encerrado
- statusReceita (derivado): Prevista, Contratada, Faturada parcialmente, Faturada, Recebida parcialmente, Recebida
- statusCusto (derivado): Previsto, Realizado, Pago parcialmente, Pago
- statusAlerta: OK, Atenção, Pendente, Vencido, A validar
- naturezas: Direto, Indireto
- comportamentos: Fixo, Variável, Semivariável, A validar
- fases: Pré-evento, Execução, Pós-evento, Estrutura compartilhada
- segmentos: Estadual, Municipal - Capital, Municipal - Interior, Câmaras, Estaduais Independentes, Federais e Outros, Privado/Outro
- origensReceita: Inscrição (evento aberto), Contrato B2G, Adesão/Termo, Outra
- tiposReceita: Inscrição, Valor global, Faturamento por etapa, Faturamento por módulo
- drivers (20): Carga horária … Receita
- unidades (12): un, dia, diária, hora, participante, especialista, trecho, refeição, kit, mês, serviço, verba
- programas por vertical (15 siglas NTC)
- categoriasCorporativas (8), origensReceitaCorp (5)
- tiposConta: Conta corrente, Aplicação financeira, Caixa interno
- tiposRetencao: Tributária, Contratual
- periodicidades: Única, Mensal, Bimestral, Trimestral, Anual
- criteriosReconhecimento: Execução declarada (provisório), Por etapa/módulo concluído, Integral no encerramento
- categorias de custo (23, com subcategorias e afinidade `mod`), inclusive 'Comissões comerciais' (`CAT_COMISSAO`)
- modalidadesComissao: Valor fixo, Percentual
- basesComissao: Valor informado, Receita contratada, reconhecida, faturada, recebida
- condicoesAquisicao: Não definida, Na contratação, No faturamento, No recebimento, Na conclusão da execução, Definida manualmente
- `Rules.PERIODOS`: all, 2026, 2026-Q1..Q4, 2027 (**fixo no código**)

---

## 3. Regras de negócio

### 3.1 Fórmulas (`Rules`)

**Receita (`receitaFin`):**
- `valorBruto` = qtde × valorUnit.
- `valorReceita` = max(0, bruto − desconto).
- `isContratada` = statusEconomico ≠ 'Prevista'.
- Contratado = valor se for contratada.
- faturado/recebido = Σ dos fatrec.
- aFaturar = max(0, valor − faturado); aReceber = faturado − recebido.
- Status derivado: Prevista → Contratada (sem faturamento) → Faturada parcialmente/Faturada (sem recebimento) → Recebida (recebido ≥ faturado ≥ valor) → senão Recebida parcialmente.

**Parcela (`fatrecFin`), as "sete grandezas":**
- bruto
- `liquido` = bruto − retTrib − retContr
- `exigivel` = max(0, liquido − recebido) — "valor a receber"
- `aLiberar` = max(0, retContr − retContrLiberada)
- `diferenca` = recebido − liquido, só se `quitado`
- `saldo` = bruto − recebido
- Status: Liquidada (quitado) | Recebida (recebido ≥ líquido) | Recebida parcialmente | Faturada.
- `vencido` = exigível > 0 e vencimento < hoje e **recebido === 0** (parcial nunca conta como vencido).

**Custo (`custoFin`):**
- previsto = qtde × valorUnitPrev.
- realizado = `valorRealizado` (digitado).
- pago = Σ valorPago; programado = Σ valor.
- aPagar = realizado − pago.
- desvio = realizado − previsto (se realizado > 0); `acima` = realizado > previsto.
- Status: Previsto (realizado 0), Realizado, Pago parcialmente, Pago.

**Título (`pagamentoFin`):**
- saldo = valor − valorPago.
- Status: Pago | Pago parcialmente | Programado.
- vencido = saldo > 0 e vencimento < hoje.

**Evento (`eventMetrics`):**
- contratada, prevista, faturada, recebida, orcado, realizado, pago, direto/indireto.
- pagantes, cortesias e participantes vêm **das receitas contratadas** (não do cadastro).
- `resultado` = faturada − realizado (legado, usado no gráfico por vertical).
- `resultadoPrevisto` = contratada − orcado.
- **`resultadoRealizado` = reconhecida − realizado** (o número principal).
- `movimentacao` = recebida − pago.
- `desvio` = realizado − previsto dos itens já realizados; `desvioTotal`; `execucaoOrcamento`.
- Unitários: custoPorParticipante (base = participantes, ou `ev.efetivos` como fallback); receitaPorPagante; receitaPorParticipante.
- Comissões: comissaoPrevista/Devida/Paga/Saldo; custoOperacional* = total − comissão.
- `demo` = `demonstrativo([contratada, reconhecida, recebida], [orcado, realizado, pago], [comPrev, comDevida, comPaga])`. Comissão é linha própria **dentro** do custo total: operacional = total − comissão; `confere`.

**Reconhecimento (`reconhecimentoReceita`, "PROVISÓRIO"):**
1. Com etapas (valor/percentual > 0): reconhece cada etapa **concluída** pelo seu valor (ou % × total), no mês de `dataConclusao`.
2. Corporativa (sem evento): total no mês de `competencia`. Provisório se o critério for "Execução declarada".
3. "Integral no encerramento": total no mês de `dataFim` **só** se o status for `Encerrado`.
4. Senão ("Execução declarada (provisório)"): total no mês de dataFim se o status for Realizado/Encerrado **ou** dataFim ≤ hoje.

Competência do custo (`custoCompetencia`) = mês de `competencia` (ou `dataPrevista`).

### 3.2 Consolidado (`escopo` + `consolidado`)

- `escopo(filter)`: filtra eventos por `matchEvent`, depois receitas e custos por escopo (all/eventos/corporativo) e por centro de custo; fatrec e pagamentos seguem a receita/custo.
- **Projetado** = contratada − orcado (sem recorte de período nesses dois).
- **Econômico** = Σ `recMes` − Σ `cusMes` dos meses no período (competência).
- **Caixa**: entradas − saídas a partir de `extrato` (recebimentos por `dataRecebimento`, pagamentos por `dataPagamento`, movimentos avulsos; **transferências excluídas**). Com escopo ativo, os movimentos avulsos/transferências **não** entram (`escopoAtivo`).
- `saldoAtual` = Σ saldoInicial das contas + Σ extrato.
- `saldoInicial` do período = saldo de tudo que está fora do período (implementação aproximada).
- `exigivel`, `aLiberar`, `obrigacoes` (Σ título), `aPagar` = realizado − pago.
- Comissões no recorte: `comissaoIncorrida` (devida, competência no período) e `comissaoPagaPeriodo`.
- `demo` consolidado = [contratada, reconhecida, entradas] / [orcado, incorrido, saídas] / [comPrev, comIncorrida, comPagaPeriodo].

### 3.3 Caixa, orçamento, fechamento

- **Caixa:** `extrato` (fontes únicas: fatrec, pagamentos, movimentos; uma transferência vira 2 linhas S/E). `saldosPorConta`. `projecaoCaixa(d)` = saldo atual + exigível a vencer em [hoje, hoje+d] − saldo de títulos a vencer no mesmo intervalo; vencidos ficam à parte.
- **Orçamento (`orcamentoLinhas`):**
  - Linha de despesa, realizado = Σ `valorRealizado` dos custos com competência no mês. Com eventoId, os custos do evento; sem, os custos corporativos do mesmo centro **e** categoria.
  - Linha de receita, realizado = reconhecido no mês (por evento, ou corporativo por centro).
  - desvio e execução.
- **Fechamento:**
  - `fecharCompetencia`: grava `congelado = apuracaoMes`, status Fechado.
  - `reabrirCompetencia`: exige motivo; status Reaberto.
  - **Não bloqueia lançamentos.** `avisoCompetencia` dá advertência nos drawers **corporativos** (receita/despesa). Os drawers de evento não mostram o aviso.
  - `congelarFechamentosIniciais` congela os meses fechados do seed no carregamento.

### 3.4 Comissões (`comissaoFin`, `Service.saveComissao`)

- Previsto:
  - Valor fixo: `valorUnitPrev`.
  - Percentual: round(base × % / 100). A base vem de `Rules.baseComissao`, **recalculada do evento** na hora de salvar (contratada/reconhecida/faturada/recebida), ou é o "Valor informado".
- Apurado = previsto + ajuste (ajuste ≠ 0 exige justificativa; apurado ≥ 0).
- Devido = `valorRealizado` = apurado **somente quando `devida`**. Se não for devida, `valorRealizado` = 0, então a comissão não entra no realizado nem em contas a pagar.
- Status: Prevista, Devida, Paga parcialmente, Paga.
- Gravada como custo: categoria 'Comissões comerciais', `origemLancamento` 'Comissão', centro 'COM', natureza Direto, Variável, driver Receita, qtde 1, `fornecedor` = vendedor.
- Regras: nenhum % padrão, nenhuma geração automática, condição de aquisição opcional.

### 3.5 Validações `req(...)` (Service)

**`validateEvento`:**
- nome, vertical, tipo, modalidade obrigatórios.
- programa se tipo for Programa/Módulo; módulo se Módulo.
- cliente se In Company/B2G ("Em In Company/B2G o cliente/órgão principal é obrigatório.").
- datas obrigatórias, e "A data final não pode ser anterior à inicial."
- cargaHoraria > 0.
- local se não for Online.
- responsável, status.
- "Participantes previstos excedem a capacidade." (se houver capacidade).
- quantidades ≥ 0.

**`saveReceita`:**
- Sem evento exige tipoLancamento 'Corporativa'.
- **centroCusto obrigatório**.
- Corporativa exige origem e competência.
- cliente, segmento, tipoReceita obrigatórios.
- qtde > 0, valorUnit > 0, 0 ≤ desconto ≤ bruto, pagantes/cortesias ≥ 0.
- Na edição: não volta para Prevista com faturamento; valor não pode ficar abaixo do já faturado.
- `deleteReceita` é bloqueado se houver fatrec.

**`saveFatrec`:**
- receita existente e contratada ("Apenas receitas contratadas podem ser faturadas.").
- parcela, dataFaturamento, valorFaturado > 0, vencimento ≥ faturamento.
- Faturado ≤ saldo a faturar da receita.
- Retenções ≥ 0 e soma ≤ faturado; liberada ≤ retida.
- 0 ≤ recebido ≤ faturado.
- Recebido > 0 exige dataRecebimento **e `contaId` existente** ("toda entrada de caixa tem conta").
- dataRecebimento exige recebido > 0.

**`saveCusto`:**
- Sem evento exige 'Corporativa'.
- **centroCusto obrigatório**.
- Corporativa exige competência; evento exige fase.
- categoria, descrição, qtde > 0, unitário ≥ 0, realizado ≥ 0.
- Na edição: realizado ≥ já pago.
- `deleteCusto` é bloqueado se houver pagamentos.

**`savePagamento`:**
- custo, vencimento, valor > 0.
- valor ≤ (realizado, ou previsto se ainda não realizado) − outros títulos programados.
- 0 ≤ pago ≤ valor.
- Pago > 0 exige realizado > 0 ("Registre o valor realizado do custo antes da baixa (CUSTO REALIZADO ≠ PAGO)").
- Total pago ≤ realizado.
- dataPagamento e **conta existente** obrigatórias.

**`saveComissao`:**
- evento, vendedor, forma, competência.
- No percentual: base, 0 < % ≤ 100, base > 0 ("A base de cálculo escolhida está zerada…").
- No fixo: valor > 0.
- Ajuste: justificativa e não negativo.
- Na edição: com algo pago não volta para prevista e o apurado não fica abaixo do pago; o programado não pode passar do novo limite.
- `deleteComissao` é bloqueado se houver títulos.

**Demais:**
- `saveConta`: nome, tipo, saldo inteiro, data. `deleteConta` é bloqueado se houver movimentações ("Inative-a").
- `saveMovimento`:
  - data, tipo, conta, descrição.
  - Transferência: valor > 0, destino ≠ origem, e não pode deixar a origem negativa (`permitirNegativo` é escape).
  - Avulso: valor ≠ 0 e sem destino.
- `saveOrcamento`: campos obrigatórios e **duplicidade bloqueada** (exercício+mês+centro+categoria+evento+tipo).

### 3.6 Alertas e integridade

**`eventAlerts`** (sem limites financeiros; severidade Vencido > Pendente > Atenção > A validar):
- recebimento vencido; parcela parcialmente recebida;
- retenção tributária (A validar);
- retenção contratual a liberar; diferença de conciliação;
- contratada não faturada (só com status Em execução/Realizado/Encerrado);
- pagamentos vencidos; custos realizados com saldo;
- custo acima do previsto;
- comissão vencida / devida não paga / paga parcialmente / prevista não reconhecida;
- custo sem fornecedor/categoria;
- evento sem custos (exceto Encerrado); evento sem receita (exceto Planejado).

**`corpAlerts`:**
- recebimento corporativo vencido, retenção a liberar, conciliação;
- obrigações corporativas vencidas ou em aberto;
- movimentos não classificados;
- **despesas compartilhadas sem critério de rateio** (A validar);
- competências em fechamento.

**`Rules.integridade`:** ids duplicados; órfãos (receita/custo → evento, fatrec → receita, pagamento → custo, conta, transferência); sem centro de custo; NF+valor duplicado; movimento de caixa duplicado; checagens de comissão (sem vendedor, pago > devido, título > valor, prevista com pagamento, coerência categoria↔origem, devida sem valor, soma única); faturado > contratado; pago > realizado; efeito zero das transferências; centavos inteiros.

### 3.7 Rateio da estrutura compartilhada

**Não existe rateio.**
- `custos.compartilhada=true` (seed: aluguel, energia, internet, software no centro EST/TEC) fica no centro de origem.
- Aparece só no resultado corporativo, identificado à parte.
- Nunca entra no custo de evento.
- A fase "Estrutura compartilhada" e o campo `criterioApropriacao` existem; o placeholder é "[CRITÉRIO DE APROPRIAÇÃO A VALIDAR COM CONTABILIDADE/DIREÇÃO]".

---

## 4. Dependências da Fase 1 em entidades/telas da Fase 2

### 4.1 Visão Executiva, KPI por KPI

| KPI / gráfico | Lê |
|---|---|
| Resultado projetado (K) | receitas (contratadas) e custos previstos — eventos **e corporativos** |
| Resultado econômico (K) | receitas (+ etapas, `eventos.status/dataFim` para reconhecimento), custos.valorRealizado/competência — eventos e corporativos |
| Movimentação líquida de caixa + "saldo atual em N contas" | fatrec (recebidos), pagamentos (pagos), **movimentos**, **contas.saldoInicial** |
| Eventos × corporativo: Eventos e projetos | receitas/custos de eventos |
| Eventos × corporativo: Operação corporativa | **receitas/custos corporativos** (centro de custo) |
| Valor a receber (`K.exigivel`, `aLiberar`) | fatrec (retenções) — eventos + corporativos |
| Valor a pagar (`K.aPagar`) | custos realizados − pagamentos — eventos + corporativos |
| Bloco Comissões (Previsto/Devido/Pago/A pagar) | **custos de comissão** + pagamentos |
| Pendências corporativas | fatrec/pagamentos corporativos, **movimentos.classificado**, **custos.compartilhada**, **fechamentos** |
| resultHero (resultado, previsto, comissões, movimentação, desvio) | receitas, fatrec, custos, pagamentos, comissões — só eventos. "Desvio do orçamento" usa custo previsto, **não** a entidade orçamento |
| KPIs Receita (contratada/faturada/recebida/saldo + vencido) | receitas, fatrec |
| KPIs Custos (orçado/realizado/pago/saldo + vencido) | custos, pagamentos |
| Receita × Custo × Resultado por vertical | fatrec.faturado, custos.realizado |
| Do contrato ao caixa | receitas, fatrec, custos, pagamentos |
| Evolução mensal do caixa | fatrec (datas de faturamento e recebimento), pagamentos (dataPagamento) — só eventos, sem contas |
| Composição dos custos por fase | custos.fase |
| Orçado × Realizado por categoria | custos (previsto/realizado) — **não lê `orcamentos`** |
| Pendências e alertas | `eventAlerts`, inclusive alertas de comissão |
| Carteira por status / eventos recentes | eventos.status, dataInicio |

Conclusão sobre a Visão Executiva:
- Ela **não** depende de `orcamentos`.
- Depende de **contas + movimentos** (cartão de caixa/saldo).
- Depende de **lançamentos corporativos** (K, KC, valor a receber/pagar).
- Depende de **comissões** (bloco, alertas, demonstrativo).
- Depende de **fechamentos** (pendências corporativas).
- Para a Fase 1, as opções são: (a) tirar ou ocultar esses blocos até a Fase 2; ou (b) já modelar contas, comissões e corporativo mesmo com telas mínimas.

### 4.2 Receber / Pagar / Workspace

- **Conta financeira é obrigatória** para registrar qualquer recebimento (`saveFatrec`) ou baixa (`savePagamento`). As telas de criação/edição de conta ficam em Caixa e Administração (Fase 2). A Fase 1 precisa de pelo menos um cadastro mínimo de contas (ou seed) e do select `contaOpts`.
- **Centro de custo é obrigatório** em toda receita e custo (`saveReceita`/`saveCusto`).
  - É uma lista fixa em `PARAMS.centrosCusto`, mostrada em Administração somente leitura.
  - Os filtros "centro" de Receber/Pagar dependem dela.
  - **Bug do protótipo:** `openReceitaDrawer`/`openCustoDrawer` (evento) **não têm o campo `centroCusto` nem default**. Criar receita ou custo novo num evento pelo drawer cai em "Informe o centro de custo…". Só o seed tem 'OPE'. No rebuild: default 'OPE' para evento (e 'COM' para comissão, como já faz `saveComissao`).
- **Botões "Receita corporativa" (Receber) e "Despesa corporativa" (Pagar)** e filtro **escopo**: o corporativo faz parte da Fase 1 dessas telas. Dependem de `categoriasCorporativas`, `origensReceitaCorp`, `criteriosReconhecimento`, `periodicidades`, centros e do aviso de fechamento (`avisoFech` → `fechamentos`, Fase 2).
- **Pagar mostra comissões** como títulos (custo categoria 'Comissões comerciais'), e o drawer de pagamento serve a elas também. A edição da comissão (`openComissaoDrawer`) é Fase 2, mas está no menu "Lançar" e na aba Comissões do workspace. É preciso decidir se a aba entra na Fase 1.
- **Bloco "Estrutura compartilhada"** em Pagar lê `custos.compartilhada` (corporativo).
- **Workspace › Receitas › "Etapas e reconhecimento"** (`openEtapasDrawer`) é necessário para o resultado reconhecido de B2G. Está na Fase 1, no próprio workspace.
- O reconhecimento depende de **`eventos.status`** (Realizado/Encerrado) e de **`dataFim`**. O resultado do evento (`resultadoRealizado`) depende dele.
- **Categorias de custo** (`PARAMS.categorias`, com afinidade por modalidade) e as listas fase, natureza, comportamento, driver e unidade vêm de PARAMS. A edição fica em Administração (Fase 2); na Fase 1 bastam constantes.
- **Período** é a lista fixa `Rules.PERIODOS` (2026/2027). No rebuild, gerar dinamicamente.

---

## 5. Campos do evento no protótipo × evento comercial do CRM

O CRM tem: título, dataInicio, dataFim, modalidade, local, módulo do catálogo, lead, cliente, status agendado/realizado/cancelado, contrato/empenho, links.

Campos que **faltam no CRM**:
- **vertical** (Educação/Gestão Pública/Saúde). Pode ser derivável da área do programa do módulo, mas evento sem módulo não tem.
- **tipo de operação** (Evento aberto, In Company/B2G, Programa, Módulo, Evento avulso). Muda o formulário de receita (inscrições × valor global/etapas), a obrigatoriedade de cliente e as cortesias.
- **programa** (sigla) separado de **módulo** em texto livre ("Módulos 01 e 03", "Trilha customizada"). O CRM tem só um módulo do catálogo; o tipo Programa (vários módulos) não cabe num único módulo.
- **status operacional** de 5 valores (Planejado, Em preparação, Em execução, Realizado, Encerrado) contra 3 do CRM:
  - não há "Encerrado", que é necessário para o critério "Integral no encerramento" e para os alertas;
  - não há "Em execução", usado nos alertas e em `efetivos`;
  - o protótipo não tem "Cancelado".
- **cidade** e **uf** (o CRM tem só `local`).
- **cargaHoraria** (obrigatória no protótipo; existe no catálogo `modulos`, mas não no evento).
- **responsavel** (função; o CRM tem responsável no lead, não no evento).
- **qtdPrevista**, **capacidade**, **efetivos** (participantes).
- **pagantesPrev**, **cortesiasPrev**.
- **refCrm** (no portal vira o próprio vínculo lead/evento — dispensável).
- **refContratual** (o CRM tem contrato/empenho com número → mapeável).
- **observacoes** (o CRM tem `observacoes`).
- **cliente** do protótipo é texto livre, e no evento aberto cada receita tem o próprio cliente/órgão (texto + segmento). No CRM, cliente é relação com `clientes-crm`. Decidir se a receita aponta para `clientes-crm` (hoje é texto + `segmento`).

---

## 6. Pendências e marcadores no próprio protótipo

Tabela `PEND` (Administração › Fórmulas e pendências):
1. Política de comissionamento (percentuais, bases, condição) — VALIDAR COM A DIREÇÃO
2. Tributos e retenções (regime, compensação) — VALIDAR COM CONTABILIDADE · JURÍDICO
3. Apropriação/rateio da estrutura compartilhada — CRITÉRIO A VALIDAR
4. Lista definitiva de categorias e fatores de custo — BASELINE A LEVANTAR
5. Valores, faixas de desconto, parâmetros econômicos — BASELINE A LEVANTAR · DIREÇÃO
6. Papéis de governança / alçadas — VALIDAR COM A DIREÇÃO (GOV-03/GOV-04)
7. Chaves de integração com o CRM — VALIDAR COM A DIREÇÃO
8. Critério de reconhecimento de receita (provisório) — VALIDAR COM CONTABILIDADE
9. Política de fechamento mensal (bloqueio ou advertência) — VALIDAR COM CONTABILIDADE
10. Tratamento contábil da retenção contratual — CONTABILIDADE · JURÍDICO
11. Política de conciliação bancária e diferenças de recebimento — VALIDAR COM A DIREÇÃO

Marcadores espalhados (`VALIDAR(...)`, `[A VALIDAR]`, "provisório"):
- Taxonomia de custos: comentário "[BASELINE A LEVANTAR] (FIN-05 §9.1)"; tip do campo categoria; seção Categorias.
- Desconto: tip "[BASELINE A LEVANTAR · VALIDAR COM A DIREÇÃO]".
- Retenção tributária: "[VALIDAR COM CONTABILIDADE]" e "[VALIDAR COM JURÍDICO]" no form, no KPI de Receber e no alerta 'A validar'.
- `comportamentos` inclui o valor 'A validar' (é o default de custo novo de evento).
- `criterioApropriacao` placeholder: "[CRITÉRIO DE APROPRIAÇÃO A VALIDAR COM CONTABILIDADE/DIREÇÃO]".
- Compartilhada: "A VALIDAR · DIRETORIA" (drawer corp, centros, Pagar, Perspectivas).
- Fechamento: "política definitiva [A VALIDAR]" e "A VALIDAR · CONTABILIDADE".
- Critérios de reconhecimento: lista "PROVISÓRIOS — [VALIDAR COM CONTABILIDADE]"; `CRIT_PROVISORIO`; aviso de valor reconhecido por critério provisório.
- Status operacional: "A lista definitiva ainda depende de validação operacional".
- Categorias corporativas: "Taxonomia provisória — [BASELINE A LEVANTAR]".
- Condição de aquisição de comissão: "Sem definição da Diretoria, nenhuma condição é imposta".
- O fechamento é "simulado — não constitui encerramento contábil".
- "Sobre": persistência, backend, API, autenticação e CRM **não implementados**.

Outros pontos que o builder deve saber:
- Sem persistência; recarregar restaura o seed.
- `todayISO()` usa a data real.
- Parâmetros adicionados em Administração valem só na sessão.
- `periodicidade` não gera lançamentos recorrentes (o seed cria 12 meses à mão).
- Bug do `centroCusto` ausente nos drawers de evento (ver §4.2).
- `vencido` de parcela exige recebido === 0 (parcial vencido não alerta como vencido).
- `consolidado` da Visão Executiva ignora os filtros vertical/modalidade/status/tipo; só o período vale.
- Os vínculos `eventoId` de fatrec/pagamentos são **copiados** da receita/custo no save (desnormalizados).
