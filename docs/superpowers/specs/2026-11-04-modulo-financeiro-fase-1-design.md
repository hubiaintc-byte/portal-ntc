# Módulo Financeiro do Painel — Fase 1 (design)

**Data:** 04/11/2026 · **Branch:** `feat/financeiro-fase-1` (worktree `portal-ntc-financeiro`, a partir da `main` em `924e7b7`)
**Fonte visual e de regras:** `docs/prototipos/financeiro-fin05-v0.2.2.html` (protótipo NTC FIN-05 v0.2.2, homologação, dados fictícios)
**Anexo obrigatório:** `docs/superpowers/specs/2026-11-04-financeiro-mapa-prototipo-fin05.md` — mapa tela a tela, entidade a entidade e regra a regra do protótipo, com os nomes das funções (`Rules.*`, `Service.*`, `Views.*`) para achar cada coisa no HTML. Este documento diz **o que muda** em relação ao protótipo; o que ele não mencionar segue o protótipo.

Marcação: **[PO]** = decidido pelo PO nesta conversa · **[agente]** = decisão do agente, vetável pelo PO na leitura deste documento.

---

## 1. Intenção

O Instituto controla receitas, custos, faturamento, recebimentos e pagamentos em planilhas. O protótipo FIN-05 foi desenhado e **validado por quem vai usar** **[PO]**; a tarefa é transformá-lo num terceiro módulo do Painel Admin, ao lado de Site e CRM, gravando de verdade.

A tela que importa é a **Visão Executiva** **[PO]**: a diretoria abre e vê a posição consolidada (projetado, econômico, caixa), a carteira de eventos e projetos e a análise. O conteúdo dela já está aprovado; o que pode mudar no caminho é **só a forma de mostrar** — trocar um tipo de gráfico, rearranjar uma visualização **[PO]**. Por isso a escolha técnica privilegia gráficos baratos de trocar (§4.3).

Sucesso da Fase 1: a equipe para de usar a planilha para eventos, contas a receber e contas a pagar, e a Visão Executiva mostra números que batem com o que foi lançado.

## 2. Escopo

### 2.1 Fase 1 (este documento) **[PO]**
1. **Visão Executiva**
2. **Eventos e Projetos** — lista e área de trabalho do evento
3. **Receber**
4. **Pagar**

Mais o mínimo que essas quatro exigem e que no protótipo mora em telas da Fase 2 (§3.4): cadastro de **contas financeiras**, listas de **centros de custo/categorias/origens** e **lançamentos corporativos** (sem evento).

### 2.2 Fase 2 (mapeada, fora deste documento) **[PO]**
Comissões (tela e tudo de comissão — ver §3.5), Caixa (extrato, transferências/avulsos, projeção 30/60/90, gráfico de saldo), Resultado e Orçamento (perspectivas, competência mensal, consolidação por programa, orçamento, fechamento mensal), Relatórios (os 20, com CSV), Administração (listas editáveis, contas, centros de custo, integridade do livro, fórmulas e pendências). Detalhe de cada uma: §1.6–1.10 do anexo. A Fase 2 terá spec própria; a Fase 1 deve deixar o modelo de dados pronto para ela não exigir migração destrutiva (§4.2).

### 2.3 Não-objetivos
- **Importar planilhas.** Começa do zero **[PO]**. Nenhum seed fictício em banco real (o seed do protótipo só existe como fixture de teste — §6).
- **Margem %.** Retirada por decisão da Diretoria no próprio protótipo (v0.2.1). Não construir.
- **Rateio** da estrutura compartilhada, **lançamento recorrente** automático (o campo periodicidade é só informativo), **bloqueio por fechamento** — iguais ao protótipo, ou seja, inexistentes.
- **Inventar regra** para os 11 itens da lista `PEND` do protótipo (política de comissão, tributos e retenções, critério de reconhecimento, conciliação etc.) nem para os marcadores `[A VALIDAR]`. Eles continuam visíveis como provisórios, exatamente como no protótipo (CLAUDE.md §5.3).
- Busca global Ctrl/Cmd+K do protótipo **[agente]** — fica para a Fase 2.

### 2.4 Anti-objetivos (falharia mesmo "funcionando")
- Visão Executiva com números que não fecham com Receber/Pagar/Eventos, ou que somam a mesma coisa duas vezes (o protótipo é um "livro único": cada fato econômico e cada movimentação existem uma vez — frase-guia no cabeçalho de `Rules`).
- Status de receita/custo/parcela/título digitado à mão. Status é **sempre derivado** dos valores.
- Arredondar dinheiro. Tudo em **centavos inteiros**, como no protótipo.
- Telas que "parecem" o protótipo mas trocam seções, rótulos ou ordem. A porta é fiel (memória do projeto: porta do HTML exige fidelidade 100%).

## 3. Decisões de produto

### 3.1 Lançamentos próprios **[PO]**
O financeiro tem os próprios lançamentos (receitas, faturamentos/parcelas, custos, títulos/pagamentos), feitos pela equipe. Não deriva números do CRM (proposta, valor estimado, contrato/empenho não viram receita sozinhos).

### 3.2 Eventos: os do CRM, mais os criados no financeiro **[PO]**
Os eventos comerciais do CRM aparecem no financeiro e são os mesmos eventos — lançamento de evento aponta para eles. **Além disso, o financeiro pode criar o próprio evento** (botão "Novo evento", wizard de 4 etapas do protótipo), sem ligação com o CRM — é o caminho para evento aberto de inscrição paga e qualquer outro que não nasceu de um lead (no CRM todo evento nasce de lead e exige cliente, por isso o financeiro não cria evento comercial). Evento criado no financeiro **não** é ligado à agenda do site na Fase 1 **[agente]**. Também existem lançamentos **sem evento** (corporativos: despesa administrativa, aluguel, consultoria institucional, patrocínio…) **[PO]**, sempre com centro de custo, como no protótipo.

Os campos que o evento do protótipo tem e o CRM não tem (vertical, tipo de operação, programa/módulo em texto, cidade/UF, carga horária, responsável, participantes previstos, capacidade, efetivos, pagantes e cortesias previstos, status operacional, referência contratual, observações — lista completa no §5 do anexo) ficam **do lado financeiro**, no registro `fin-eventos`, que tem ligação **opcional** (única quando existe) com o evento comercial **[agente]**. São editados no financeiro (Editar cadastro do evento). O CRM não ganha campos nem telas.

- **Status operacional** (Planejado, Em preparação, Em execução, Realizado, Encerrado) é do financeiro e convive com o status do CRM (agendado/realizado/cancelado) **[agente]**. As regras de reconhecimento de receita leem o operacional, como no protótipo.
- Campos que o CRM já tem: título (= nome), datas, modalidade, local, cliente, módulo do catálogo. **[agente]** Para evento ligado ao CRM, o financeiro **lê** esses do CRM e não os duplica (no wizard aparecem só leitura, com "editar no CRM"); para evento próprio do financeiro, eles são gravados em `fin-eventos`, e o cliente é texto livre como no protótipo.
- **Evento cancelado no CRM** **[agente]**: continua na lista e **continua contando** nos totais, com selo "Cancelado no CRM". Motivo: os lançamentos já feitos são fatos (um custo pago não deixa de ter sido pago), e tirar o evento dos totais faria a Visão Executiva divergir de Receber e Pagar (anti-objetivo §2.4). Quem quiser encerrá-lo financeiramente usa o status operacional.
- `refCrm` do protótipo some (o vínculo é o próprio relacionamento). `refContratual` pré-preenche com o número do contrato/empenho do CRM quando houver, editável **[agente]**.
- Programa: sigla escolhida de `PARAMS.programas[vertical]` (as 15 siglas, iguais às do catálogo); módulo continua texto livre como no protótipo ("Módulos 01 a 03") **[agente]**.
- Evento ligado ao CRM: o valor do CRM vence quando preenchido; campo vazio no CRM (ex.: modalidade, data final) usa o valor gravado no financeiro, que o wizard pede **[agente]**. Modalidade: `presencial`→Presencial, `online`→Online ao vivo, `hibrido`→Híbrido.
- Cliente da receita: no evento aberto cada receita tem seu órgão e segmento em **texto livre**, como no protótipo; nos demais tipos a receita herda o cliente do evento **[agente]**.

### 3.3 Visual
- Moldura do painel (sidebar, seletor de módulo, bloco do usuário) compartilhada; o seletor passa a **Site | CRM | Financeiro** **[agente]**.
- Conteúdo das telas fiel ao protótipo, **com a paleta e a tipografia dele** (azul `#1A4372`, pergaminho `#F2F0EA`, dourado `#B8952E`, verde `#37661C`, vermelho `#8E2A1C`; Cormorant Garamond + Barlow + Barlow Condensed) **[agente]**. É uma exceção ao §3 do CLAUDE.md do mesmo tipo da paleta do PDF da proposta (v3.3): fonte de verdade visual é o protótipo aprovado (§18). Confinar os tokens num único arquivo do módulo, auditável.
- Barlow Condensed é peso/família a mais: servir via `next/font` como as demais, sem CDN (o protótipo usa Google Fonts por `<link>` — não copiar).

### 3.4 O que a Fase 1 "empresta" da Fase 2 **[agente]**
| Precisa | Por quê | Na Fase 1 |
|---|---|---|
| **Contas financeiras** | Todo recebimento (`saveFatrec`) e toda baixa (`savePagamento`) exige `contaId`; o cartão de caixa da Visão Executiva lê saldo inicial + movimentos | Cadastro mínimo (nome, tipo ∈ Conta corrente/Aplicação financeira/Caixa interno, saldo inicial, data do saldo inicial, ativa), acessível por um "Nova conta" dentro do formulário de recebimento/baixa e por uma lista simples na tela Receber/Pagar. A tela Caixa completa é Fase 2 |
| **Caixa sem movimentos** | No protótipo o caixa (`extrato`) vem direto das parcelas recebidas (`dataRecebimento`/`valorRecebido`/`contaId`) e dos títulos pagos (`dataPagamento`/`valorPago`/`contaId`); a entidade `movimentos` guarda **só** transferências e lançamentos avulsos | Nenhuma coleção de movimentos na Fase 1: saldo = saldo inicial das contas + recebidos − pagos. Transferência e avulso (e a coleção) são Fase 2 — logo, na Fase 1 não existe "movimento não classificado" |
| **Centros de custo, categorias, subcategorias, origens, segmentos, tipos de receita, critérios de reconhecimento, fases, naturezas, comportamentos, verticais, tipos de operação, UFs** | Obrigatórios nos formulários | Listas fixas no código, **copiadas de `PARAMS`** do protótipo, sem edição. A Administração da Fase 2 as torna editáveis (por isso o modelo grava o **valor**, não o índice) |
| **Lançamentos corporativos** | Receber e Pagar já os têm (botões "Receita corporativa"/"Despesa corporativa", filtros de escopo e centro, bloco Estrutura compartilhada) | Entram inteiros |

### 3.5 Comissões ficam fora da Fase 1 **[PO]**
No protótipo comissão é um custo especial (`origemLancamento: 'Comissão'`). Na Fase 1 **não** há: aba Comissões no evento, opção "Comissão comercial" no menu Lançar, bloco "Comissões comerciais" na Visão Executiva, célula "Comissões comerciais" do `resultHero`, linha "(−) comissões" do demonstrativo, indicador comissão/participante, títulos de comissão no Pagar. O modelo de custo deve aceitar os campos de comissão depois sem migração destrutiva (campos opcionais na Fase 2).

### 3.6 Fechamento e orçamento
A Visão Executiva **não** lê a entidade `orcamentos` (o "orçado" vem do custo previsto dos eventos) — confirmado no anexo §1.1. Fechamento é Fase 2; na Fase 1 a Visão Executiva e Receber/Pagar **omitem** o que lê `fechamentos` (pendências de competência não fechada e o `avisoCompetencia`) **[agente]**.

### 3.7 Defeito do protótipo a corrigir **[agente]**
Os formulários de receita e custo **dentro do evento** não têm centro de custo nem default, e o `Service` exige — criar lançamento num evento falha. No portal: centro de custo do lançamento de evento nasce **OPE** (editável).

## 4. Como é feito

### 4.1 Onde mora
- Rota `/financeiro` no route group `(painel)`, no padrão de `/crm` (casco próprio dentro do `ShellPainel`).
- `ModuloPainel` ganha `"financeiro"`; `lib/cms/telas.ts` ganha **4 telas** **[agente]**: `fin.visao-executiva`, `fin.eventos`, `fin.receber`, `fin.pagar`, marcadas por pessoa na tela Usuários como as demais (v3.8). Contas financeiras: quem tem `fin.receber` **ou** `fin.pagar` lê e cria.
- Cada página carrega só os dados das telas permitidas (regra da v3.8). Toda Server Action confere a tela (`exigirTela`); o `access` das coleções vem de `acessoPorTela`; mensagem de recusa padrão.
- Visão Executiva exige `fin.visao-executiva`; ela lê tudo do financeiro (é consolidado) — quem a tem vê os totais mesmo sem as outras telas, mas os links para Eventos/Receber/Pagar só aparecem para quem as tem.
- Ler os eventos comerciais a partir do financeiro (lista de eventos, escolher evento num lançamento) é permitido a quem tem `fin.eventos`, `fin.receber` ou `fin.pagar` **sem** dar acesso às telas do CRM — leitura mínima (título, datas, modalidade, local, cliente id+nome, módulo, status) **[agente]**.

### 4.2 Dados (Payload, coleções novas) **[agente]**
Espelhar as entidades do protótipo (anexo §2), slugs com prefixo `fin-`:
- `fin-eventos` — relationship **opcional** e `unique` com `eventos-comerciais` + campos do §3.2 (inclusive os que só o evento próprio usa: nome, datas, modalidade, local, cliente em texto). Evento comercial sem `fin-eventos` aparece na lista com "cadastro financeiro pendente".
- `fin-receitas` (evento opcional; sem evento ⇒ corporativa, centro obrigatório), `fin-faturamentos` (as parcelas/`fatrec`: faturado, retenções, recebido, conta, datas), `fin-custos`, `fin-pagamentos` (título e baixa na mesma linha, como no protótipo), `fin-contas`. (`movimentos`, `orcamentos`, `fechamentos` são Fase 2.)
- **Não copiar `eventoId` para faturamento/pagamento** (o protótipo duplica); derivar pela receita/custo. **[agente]**
- Dinheiro em centavos inteiros (`number` inteiro validado). Status derivados **não** são gravados — calculados na leitura.
- Nenhum campo `required: true` que não seja obrigatório desde a criação (lição da Sessão 4: `required` emite `NOT NULL`).
- **Exclusão só para administrador** **[PO]** — em toda coleção `fin-*` (`delete: administrador`) e nas Server Actions (`exigirAdministrador`); quem não é administrador não vê o botão. As regras de exclusão são as do protótipo: receita com faturamento, custo com título e conta usada por recebimento/pagamento **não** se excluem (mensagens do `Service`; conta: "Inative-a"); excluir parcela ou título é livre. Excluir evento: o próprio do financeiro cascateia como `Service.deleteEvento` (pagamentos, custos, faturamentos, receitas), em `executarEmTransacao`; o ligado ao CRM só remove o registro financeiro, e só sem lançamentos — o evento comercial nunca é apagado pelo financeiro **[agente]**. Evento apagado no CRM: §8.1.
- **Histórico de alterações desde a Fase 1** **[PO]** — toda criação, alteração e exclusão em coleção `fin-*` grava na coleção `audit-log` que já existe (hoje vazia): usuário, ação, entidade, id e, em `metadata`, os campos que mudaram com valor antes e depois. Gravado por hook `afterChange`/`afterDelete` na **mesma transação** (`req`), falhando fechado (se o log falhar, a escrita falha). Recebimento parcial e baixa parcial continuam sobrescrevendo o acumulado como no protótipo — o histórico é o que guarda cada passo. Cada lançamento ganha um "Histórico" no formulário (quem lançou, quem alterou o quê, quando), visível a quem tem a tela **[agente]**; a leitura passa pela Server Action com `exigirTela`, sem abrir o `access.read` do `audit-log` (segue administrador).
- **Exige `payload:push:schema`** (passo manual do PO, dev parado): só criações. Valem as regras da v3.6 e da v3.8 — o diff **não pode** ter `DROP TABLE`/`DROP COLUMN`/`DISABLE ROW LEVEL SECURITY`; `manterRlsLigado` nunca sai; e **a branch de permissões por tela e qualquer outra que já tenha pushado schema precisam estar na `main` antes** (regra da v1.9 — conferir `git worktree list` e o estado do banco). As tabelas novas nascem sem RLS se a marca falhar: conferir depois.

### 4.3 Regras e gráficos
- As fórmulas do protótipo (`Rules`: `portfolio`, `consolidado`, `reconhecimentoReceita`, `resultadoRealizado`, `aging`, `cashSeries`, status derivados, `exigivel`, `aLiberar`, etc.) viram **funções puras em `packages/lib/src/financeiro/`**, portadas fielmente, com testes. As validações `req(...)` do `Service` viram as validações das Server Actions, **com as mesmas mensagens**.
- **Chart.js 4 aprovado pelo PO** (dependência nova, §5.4), **só no módulo financeiro**, num componente cliente fino por tipo (`bars`, `bars` horizontal, `combo`, `doughnut`) configurado como no protótipo (`Charts`). O funil é HTML, como no protótipo. Objetivo: trocar a visualização de um bloco da Visão Executiva = trocar o tipo/config num lugar só.
- Lista de períodos: gerada a partir dos dados e do ano corrente, não fixa em 2026/2027 como `Rules.PERIODOS` **[agente]**.

### 4.4 Telas — diferenças em relação ao protótipo
Tudo do anexo §1.1–1.5, menos:
- **Visão Executiva:** sem bloco Comissões, sem a célula de comissões do `resultHero`, sem pendências de fechamento/movimentos não classificados (§3.4, §3.6). "Novo evento" abre o wizard (§3.2).
- **Eventos (lista):** "Novo evento" cria evento próprio do financeiro; "Excluir" só para administrador, com a regra do §4.2; selo de origem (CRM / financeiro) e selo "Cancelado no CRM" **[agente]**. Eventos do CRM ainda sem registro financeiro aparecem na lista com selo "cadastro financeiro pendente" e abrem o formulário para completar **[agente]**.
- **Área do evento:** 6 abas (sem Comissões); menu Lançar sem Comissão; demonstrativo sem a linha de comissões.
- **Receber / Pagar:** inteiros, incluindo corporativo, aging, gráficos, CSV; Pagar sem títulos de comissão; formulários de recebimento/baixa com "Nova conta".
- Selo "Dados fictícios" e "Restaurar dados fictícios" do protótipo **não** existem.

## 5. Restrições
- Stack e convenções do CLAUDE.md (§4): TypeScript strict, RSC por padrão, nomes em português, sem `any`.
- Acessibilidade WCAG 2.1 AA (§10): os gráficos precisam de alternativa textual (tabela ou resumo) — o protótipo já tem as tabelas ao lado da maioria; onde não tiver, `aria-label` com o resumo dos números.
- Gates: `pnpm lint` 0 erros, `typecheck`, `test`, `build` (com o dev **parado** — memória do projeto).
- Checkpoint visual é do PO (§6 do CLAUDE.md + memória: validação humana), lado a lado com o protótipo, desktop 1440 e mobile 375.

## 6. Verificação
- **Teste de paridade com o protótipo:** o `buildSeed()` do protótipo vira fixture de teste; as funções portadas, rodadas sobre ele, devem dar os **mesmos números** que o protótipo mostra na Visão Executiva, em Receber e em Pagar (com comissões e fechamento excluídos dos dois lados). É a prova de que a porta das regras é fiel.
- Testes das validações (mensagens iguais às do protótipo) e do gate de tela das Server Actions.
- Checkpoint do PO: lançar um evento real do CRM com receita, parcela, recebimento, custo e pagamento; uma despesa corporativa; conferir a Visão Executiva.

## 7. Deixado para quem constrói
Quebra em arquivos/componentes, nomes internos, organização dos testes, como o casco do financeiro reaproveita o do CRM, formato exato do selo de "cadastro pendente", ordem das tasks do plano.

## 8. Decisões da revisão do builder

### 8.1 Evento apagado no CRM **[agente]**
O CRM não tem tela que apague evento comercial (`delete: administrador`, nenhuma Server Action chama; `apagarLead` só desvincula; `apagarCliente` já é bloqueado com evento). O único caminho é um administrador pela API. Decisão: hook `beforeDelete` em `eventos-comerciais` que **recusa** apagar enquanto houver registro financeiro com lançamentos (padrão de `bloquearClienteComDependentes`, falha fechado). É um hook a mais na coleção do CRM, sem mudar campos nem telas do CRM.

### 8.2 Respondidas pelo PO (04/11/2026)
1. **Novo evento:** o financeiro pode criar o próprio evento → §3.2, §4.2.
2. **Excluir:** só administrador → §4.2.
3. **Histórico:** gravar desde a Fase 1 → §4.2.

### 8.3 Decidida pelo agente, sem resposta do PO
- Evento cancelado no CRM continua contando, com selo → §3.2.
