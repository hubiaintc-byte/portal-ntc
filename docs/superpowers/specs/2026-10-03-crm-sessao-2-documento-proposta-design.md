# CRM — Sessão 2 (Documento da proposta) · Design

**Data:** 3 de outubro de 2026 · **revisado no mesmo dia** (ver §0.2)
**Status:** aprovado com o PO em 03/10
**Spec-mãe:** `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` §8
**Antecede:** `docs/superpowers/specs/2026-09-30-importar-programas-cms-design.md` — o apêndice daquele spec registrou as primeiras decisões desta sessão; este documento as substitui.
**Precedência:** `CLAUDE.md` > spec-mãe > este spec.

## 0. Escopo

**Entra:** o documento de proposta passa de **capa + 3 seções** para **capa + Resumo Executivo + 21 seções numeradas**, fiel ao modelo; e **todo o conteúdo textual passa a viver dentro da proposta**, pré-preenchido na criação e editável ali.

**Não entra:** o fluxo — wizard chamado do modal, "Criar proposta" na aba Ações, KPI somando `valorLiquido`. É a **Sessão 3** (`2026-10-03-crm-sessao-3-fluxo-proposta-design.md`).

**Renumeração:** com o fluxo na 3 e a Sessão 4 (Evento) já entregue, a ordem é **2 Documento · 3 Fluxo · 4 Evento (entregue) · 5 E-mail · 6 Automações**.

### 0.1. A fonte

`" MODELO PROPOSTA.html"` — com espaço no início do nome, hoje em `/Users/joao/Documents/portal-ntc-conteudos/`, não versionado. **Fonte única**; o `.docx` foi descartado em 23/09. **Copiar para `docs/prototipos/proposta-modelo-v1.html` e versionar antes de implementar** — um documento contratual não pode depender de arquivo solto fora do controle de versão.

### 0.2. A revisão de 03/10 — a proposta passa a ser autossuficiente

A primeira versão deste spec previa que só as 7 seções de prosa institucional desceriam para a proposta; as 9 do programa seriam lidas do CMS na hora de gerar.

**O PO decidiu o contrário:** **todas** as seções de conteúdo descem para a proposta na criação e ficam editáveis ali. O raciocínio é o mesmo que já valia para as cláusulas — proposta é documento contratual, e o que importa é congelar o que foi enviado àquele cliente.

Consequências aceitas:
- Mudar um programa no CMS **não** atualiza propostas já criadas. É o comportamento correto para um contrato, e torna o documento auditável.
- O formulário da proposta cresce muito (§5.1).
- O conteúdo importado para o CMS em 30/09 continua essencial: é a **fonte do pré-preenchimento**.

## 1. Origem de cada seção

| # | Seção | Pré-preenchida de | Vive em |
|---|---|---|---|
| — | Capa | — | gerada |
| — | Resumo Executivo | — | gerado |
| 3 | Dados de Identificação | — | campos da proposta |
| 4 | Apresentação Executiva | `programas.visaoGeral` | **campo da proposta** |
| 5 | Contexto e Justificativa | `programas.problema` | **campo da proposta** |
| 6 | Objeto da Proposta | — | gerada |
| 7 | Objetivos | `programas.objetivo` | **campo da proposta** |
| 8 | Público-alvo | `programas.publicoAlvo` | **campo da proposta** |
| 9 | Arquitetura da Solução | `programas.eixosTematicos` | **lista na proposta** |
| 10 | Módulos Contratados | `modulos` escolhidos | **lista na proposta** |
| 11 | Metodologia | `programas.metodologia` (campo novo) | **campo da proposta** |
| 12 | Corpo Docente e Curadoria | `especialistas` + entrada livre | **lista na proposta** |
| 13 | Diferenciais NTC | `programas.diferenciais` | **lista na proposta** |
| 14 | Resultados Esperados | `programas.resultadosEsperados` | **lista na proposta** |
| 15 | Quadro Comercial | — | gerada |
| 16 | Condições Comerciais | campos + prosa | campos + **campo da proposta** |
| 17–23 | EventON · Certificação e Replay · Cancelamento · Proteção de Conteúdo · Fundamentação Legal · Próximos Passos · Fechamento | modelo versionado | **campos da proposta** |

Três seções seguem **geradas** e nunca editáveis, porque são cálculo e não redação: Objeto, Quadro Comercial e a parte de dados das Condições Comerciais.

### 1.1. Seção vazia é omitida

Seção cujo conteúdo ficou vazio **não entra no documento**, a numeração se fecha sem buraco, e a omissão sai no relatório de geração. Vale para qualquer uma — inclusive Corpo Docente, que nasce vazia se ninguém preencher. Imprimir um título com nada embaixo, num documento que vai ao cliente, é pior que a ausência.

## 2. Capa e Resumo Executivo

Derivam de campos existentes. **Capa:** título fixo · subtítulo gerado (§2.1) · programa · órgão · sigla · UF/município · **Dirigente** = contato principal do cliente · modalidade · carga horária · participantes · emissão · validade · código. **Resumo Executivo:** objeto · investimento líquido · valor por inscrição · desconto · replay · cortesias · escopo · modalidade · carga horária · pagantes · valor de tabela.

### 2.1. Subtítulo gerado

Do tipo e da contagem de módulos, nunca digitado: `programa-completo` → "Trilha Completa · <SIGLA>"; vários → "Combo de <N por extenso> Módulos · <SIGLA>"; um → "Módulo Avulso · <SIGLA>"; nenhum → "<SIGLA>".

## 3. Quadro Comercial

A fórmula atual já reproduz o modelo: `valorUnitario` é a tabela, `valorBruto = valorUnitario × qtdPagantes`, `desconto = bruto × percDesconto`, `valorLiquido = bruto − desconto`. Conferido: 1.470 × 1.800 = 2.646.000; 35,4% = 935.874; líquido 1.710.126. **Nenhum campo novo.**

**Tabela por módulo:** `qtdPagantes` e `cortesias` divididos igualmente pelo número de módulos; "Valor unit." é `valorLiquido ÷ qtdPagantes`; subtotal é esse valor × pagantes da linha.

**Divisão não exata:** o formulário **recusa** salvar, dizendo o múltiplo esperado. Quantitativos realmente diferentes por módulo ficam fora desta sessão.

## 4. Modelo de dados — **exige `payload:push:schema`**

### 4.1. Campos de texto em `propostas` (12 `richText`)

Sete institucionais: `textoEventon`, `textoCertificacaoReplay`, `textoCancelamento`, `textoProtecaoConteudo`, `textoFundamentacaoLegal`, `textoProximosPassos`, `textoFechamento`.

Cinco do programa: `textoApresentacao`, `textoContexto`, `textoObjetivos`, `textoPublicoAlvo`, `textoMetodologia`.

### 4.2. Listas em `propostas` (5 arrays)

- `eixos[]` — `{ titulo, descricao }`
- `diferenciais[]` — `{ titulo, descricao }`
- `resultados[]` — `{ texto }`
- `docentes[]` — `{ especialista (relationship, opcional), nome, credencial, eixo }`. O seletor busca entre os cadastrados e preenche `nome`/`credencial` da ficha; **entrada livre é permitida** para quem ainda não está na base (o modelo traz "Especialista convidado", que não é pessoa cadastrada). Decisão do PO em 03/10.
- `modulosDetalhados[]` — `{ modulo (relationship), tituloExibido, ementa (richText) }`. Preenchido ao marcar o módulo no wizard, com título e ementa do catálogo; **acrescentar um módulo depois copia a ementa naquele momento; desmarcar remove a entrada.**
- `secoesExtras[]` — `{ titulo, corpo (richText), posicao }`, com `posicao` em `antes-quadro-comercial` · `apos-condicoes-comerciais` · `fim`. Atende o pedido de acrescentar observação sem reabrir o código.

Nenhum campo é `required` — `required: true` faz o adapter emitir `NOT NULL` (lição da Sessão 4, CLAUDE.md v3.1) e propostas antigas não têm nada disso.

`observacoes` **continua interna** e fora do PDF.

### 4.3. Campo em `programas`

`metodologia` (richText) — a fonte do pré-preenchimento da seção 11. Nasce vazio nos 15; enquanto estiver, a seção é omitida (§1.1).

### 4.4. Como tudo nasce preenchido

Na criação da proposta, uma função compõe o conteúdo inicial:

- **as 7 institucionais** de um módulo versionado em `packages/lib/src/crm/`, que recebe o contexto (órgão, sigla, modalidade, replay, nº de módulos, programa) e devolve os textos **já interpolados**, transcritos do modelo;
- **as 5 do programa**, copiando o documento Lexical do `programas` escolhido;
- **as 3 listas** (`eixos`, `diferenciais`, `resultados`), copiando os arrays do programa;
- **`modulosDetalhados`**, dos módulos marcados;
- **`docentes`**, dos especialistas vinculados ao programa — hoje nenhum, então nasce vazia e o PO preenche.

Daí em diante é conteúdo da proposta. **Cada proposta guarda o que foi de fato enviado.**

### 4.5. Restaurar padrão

Botão **"Restaurar conteúdo padrão"** no detalhe, **por seção e para todas**, recalculando a partir do estado atual (programa vinculado, cliente, módulos). Avisa que **sobrescreve as edições manuais** antes de aplicar, com confirmação em dois cliques.

Isso também resolve a limitação de trocar o cliente ou o programa depois de criada a proposta: o texto antigo não se atualiza sozinho, mas restaurar é um clique.

## 5. Telas

### 5.1. O formulário cresce, e precisa de organização

São ~18 blocos editáveis. Enfiá-los em sequência no `FormProposta` atual torna a tela inutilizável.

**Desenho:** o wizard de criação **não** mostra o conteúdo — segue pedindo lead, cliente, programa, tipo, módulos, valores e condições, como hoje. O conteúdo nasce preenchido e é editado **no detalhe da proposta**, num bloco "Conteúdo do documento" com uma seção por vez (acordeão `<details>` nativo, como `EventosDoCliente` da Sessão 4), cada uma com seu "Restaurar padrão".

Separar assim mantém a criação rápida e põe a edição de texto onde ela de fato acontece: revisando a proposta antes de enviar.

### 5.2. Editor

`CampoArea` (texto) nesta sessão. Editor richText no painel é escopo da Sessão 5 — o conteúdo é armazenado como richText para não exigir migração quando ele chegar.

## 6. Motor do documento

**Cabeçalho e rodapé:** `headerTemplate`/`footerTemplate` do Playwright, que `gerarPdfDeHtml` já usa. O `@page { @top-* }` do modelo é **descartado** — Chromium não implementa margin boxes de paged media.

**Fontes:** já embutidas em base64 por `fontsEmbutidas.ts`. O `<link>` para Google Fonts do modelo é **descartado** — em serverless falharia em silêncio.

**Paleta: a do modelo, à risca** — `--navy:#0E2A47`, `--navy-exec:#1E4474`, `--gold:#B68B40`, `--gold-light:#D6B070`, `--offwhite:#F5EDD8`, `--bg-suave:#FBF9F2`, `--ink:#3A3A3A`, `--ink-mid:#6B6B6B`, `--acento:#1E5B7B`, `--acento-claro:#3B8AB0`. Nenhuma é da Soberana. **Exceção deliberada ao §3 do CLAUDE.md**, isolada num módulo só para ser auditável, **a registrar no CLAUDE.md** quando a sessão entrar.

**Numeração computada:** o número sai da posição final, depois de omitir as vazias e intercalar as extras. A numeração começa em **3** — capa e Resumo Executivo não são numerados, como no modelo.

## 7. Modalidade

O modelo é de evento **online**; as seções presenciais não existem em lugar nenhum. Esta sessão entrega **só online**: proposta presencial ou híbrida gera o documento **sem** a seção de EventON, e a tela avisa que o texto presencial ainda não foi redigido. Nada é inventado (§5.3).

## 8. Testes

Puros, com Vitest: montagem e numeração (omissão, extras, âncora ausente); subtítulo gerado; divisão por módulo e a recusa de divisão inexata; interpolação dos 7 textos; composição do conteúdo inicial a partir do programa; restauração por seção. Escrita: com mocks, provando que criar grava todo o conteúdo e que restaurar sobrescreve só o alvo. O PDF em si continua sem teste automatizado — a verificação é o checkpoint visual.

## 9. Riscos e pendências

1. **`payload:push:schema` obrigatório** — 12 campos de texto, 5 arrays (cada um vira tabela) e `programas.metodologia`. Manual, do PO, dev parado. Nenhum `DROP` esperado; qualquer `DROP` no diff é `N` e volta para o agente.
2. **`maxDuration` na Vercel** — o documento vai de 3 para 23 seções; o Chromium serverless tem limite de tempo. Nunca configurado (§19.3 item 8); validar em deploy real.
3. **Versionar o modelo** (§0.1) antes de implementar.
4. **A sessão dobrou de tamanho** com a decisão de §0.2 — é a maior desde a Sessão 1 do kanban.
5. **Propostas criadas antes desta sessão** ficam com todos os campos novos vazios e, pela regra de §1.1, gerariam um documento quase sem conteúdo. Hoje há **1 proposta** no banco, de teste. **Decisão:** não há migração; a proposta de teste é recriada.

## 10. Fora do escopo

O fluxo (Sessão 3); e-mail (Sessão 5); editor richText no painel (Sessão 5); quantitativos diferentes por módulo; seções presenciais; sumário/índice; assinatura eletrônica.
