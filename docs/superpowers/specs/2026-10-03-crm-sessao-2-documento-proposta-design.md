# CRM — Sessão 2 (Documento da proposta) · Design

**Data:** 3 de outubro de 2026
**Status:** aprovado com o PO em 03/10 (blocos 1, 2 e 3)
**Spec-mãe:** `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` §8
**Antecede:** `docs/superpowers/specs/2026-09-30-importar-programas-cms-design.md` — o apêndice daquele spec registrou as primeiras decisões desta sessão; este documento as substitui e detalha.
**Precedência:** `CLAUDE.md` > spec-mãe > este spec.

## 0. Escopo, e o que saiu dele

**Entra:** o documento de proposta passa de **capa + 3 seções** para **capa + Resumo Executivo + 21 seções numeradas**, fiel ao modelo `" MODELO PROPOSTA.html"`.

**Não entra (decisão do PO, 03/10):** o fluxo — wizard chamado do modal já preenchido, "Criar proposta" na aba Ações, KPI "Valor em negociação" somando `valorLiquido`. Virou a **Sessão 3**, com spec próprio (`2026-10-03-crm-sessao-3-fluxo-proposta-design.md`).

**Renumeração que isso provoca:** o spec-mãe §8 chamava de Sessão 3 o e-mail. Com o fluxo ocupando a 3 e a Sessão 4 (Evento) já entregue em 21/09, a ordem passa a ser: **2 Documento · 3 Fluxo · 4 Evento (entregue) · 5 E-mail · 6 Automações**.

### 0.1. A fonte

`" MODELO PROPOSTA.html"` — **atenção ao espaço no início do nome**, exige aspas no shell. Hoje em `/Users/joao/Documents/portal-ntc-conteudos/`, não versionado. É `NTC-PROP-2026-EDUTEC-TO-SEMEDPALMAS-v01`, 151 KB. **Fonte única**: o `Proposta_CRM_Campos_e_Modelo.docx` foi descartado pelo PO em 23/09 e não deve ser consultado nem conciliado.

**Antes de implementar, copiar o modelo para dentro do repositório e versioná-lo** (sugestão: `docs/prototipos/proposta-modelo-v1.html`, sem o espaço no nome). Um documento contratual não pode depender de um arquivo solto fora do controle de versão, num worktree que pode sumir.

## 1. Origem de cada seção

| # | Seção | Origem |
|---|---|---|
| — | **Capa** | gerada |
| — | **Resumo Executivo** | gerado |
| 3 | Dados de Identificação | proposta |
| 4 | Apresentação Executiva | **composta**: abertura gerada + `programas.visaoGeral` |
| 5 | Contexto e Justificativa | `programas.problema` |
| 6 | Objeto da Proposta | **gerada** |
| 7 | Objetivos | `programas.objetivo` |
| 8 | Público-alvo | `programas.publicoAlvo` |
| 9 | Arquitetura da Solução | `programas.eixosTematicos` |
| 10 | Módulos Contratados | `modulos` selecionados (título + ementa) |
| 11 | Metodologia | `programas.metodologia` — **campo novo** |
| 12 | Corpo Docente e Curadoria | `programas.coordenacaoCientifica`/`docentes` |
| 13 | Diferenciais NTC | `programas.diferenciais` |
| 14 | Resultados Esperados | `programas.resultadosEsperados` |
| 15 | Quadro Comercial | **gerada** |
| 16 | Condições Comerciais | proposta + prosa institucional |
| 17 | Condições de Participação · EventON | prosa institucional |
| 18 | Certificação e Replay | prosa institucional |
| 19 | Cancelamento, Substituição e Reagendamento | prosa institucional |
| 20 | Proteção de Conteúdo e Direitos Autorais | prosa institucional |
| 21 | Fundamentação Legal e Segurança Jurídica | prosa institucional |
| 22 | Próximos Passos | prosa institucional |
| 23 | Fechamento Institucional | prosa institucional |

Oito das nove seções que vêm do CMS já têm conteúdo desde o import de 30/09 (v3.2). A nona, Metodologia, ganha campo nesta sessão.

### 1.1. Corpo Docente nasce vazia

O import de 30/09 **não vinculou especialistas a programas** — a origem só tem rótulos genéricos ("Especialista convidado"), e criar especialista falso foi recusado (spec de 30/09 §2.2). O vínculo é manual do PO.

**Decisão:** sem docente vinculado, a seção 12 **não entra no documento** e a numeração se fecha sem buraco. O gerador registra no relatório de geração que ela foi omitida e por quê. A alternativa — imprimir a seção vazia — foi recusada: um documento contratual com um título e nada embaixo é pior que a ausência.

### 1.2. Seções que o programa não tem

Mesmo depois do import, um programa pode ter um campo vazio. **Mesma regra da 12:** seção sem conteúdo é omitida, não impressa vazia, e sai no relatório. O PO vê o que faltou antes de enviar.

## 2. O que a capa e o Resumo Executivo precisam

Tudo deriva de campos existentes, exceto onde indicado.

**Capa:** título fixo · **subtítulo gerado** (§2.1) · programa (sigla + nome) · órgão do cliente · sigla · UF/município · **Dirigente** = contato principal do cliente (o campo `dirigente` morreu na Sessão 1; decisão do PO mantida) · modalidade · carga horária (soma dos módulos) · participantes (`qtdPagantes` + `cortesias`) · emissão (`createdAt`) · validade (`createdAt` + `validadeDias`) · código.

**Resumo Executivo:** objeto · investimento líquido · valor por inscrição (`valorLiquido ÷ qtdPagantes`) · desconto · replay · cortesias · escopo · modalidade · carga horária · pagantes · valor de tabela (`valorUnitario`).

### 2.1. Subtítulo gerado

Montado do tipo e da contagem de módulos, nunca digitado: `programa-completo` → "Trilha Completa · <SIGLA>"; vários módulos → "Combo de <N por extenso> Módulos · <SIGLA>"; um módulo → "Módulo Avulso · <SIGLA>". Decisão do PO em 03/10: campo livre foi recusado para o subtítulo nunca desencontrar do conteúdo.

## 3. Quadro Comercial

A fórmula atual (`calcularValoresProposta`) já reproduz o modelo: `valorUnitario` é o valor de tabela, `valorBruto = valorUnitario × qtdPagantes`, `desconto = bruto × percDesconto`, `valorLiquido = bruto − desconto`. Conferido contra o modelo: 1.470 × 1.800 = 2.646.000; 35,4% = 935.874; líquido 1.710.126. **Nenhum campo novo.**

**Tabela por módulo — pagantes e cortesias divididos igualmente** (decisão do PO, 03/10): cada linha recebe `qtdPagantes ÷ nº de módulos` e `cortesias ÷ nº de módulos`; a coluna "Valor unit." é `valorLiquido ÷ qtdPagantes` e o subtotal é esse valor × pagantes da linha.

**Divisão não exata:** o formulário **recusa** salvar quando `qtdPagantes` ou `cortesias` não é múltiplo do número de módulos, com mensagem dizendo o múltiplo esperado. Falha cedo e visível, em vez de uma tabela com resto escondido. Quantitativos realmente diferentes por módulo ficam fora desta sessão (exigiriam um array na proposta).

## 4. Modelo de dados

### 4.1. Campos novos em `propostas` — **exige `payload:push:schema`**

**Sete campos `richText`** de prosa institucional, um por seção 17–23: `textoEventon`, `textoCertificacaoReplay`, `textoCancelamento`, `textoProtecaoConteudo`, `textoFundamentacaoLegal`, `textoProximosPassos`, `textoFechamento`.

**`secoesExtras`** — array, cada item com `titulo` (text, obrigatório), `corpo` (richText, obrigatório) e `posicao` (select, obrigatório): `antes-quadro-comercial` · `apos-condicoes-comerciais` · `fim` (antes do Fechamento). Zero, uma ou várias. Atende o pedido do PO de acrescentar parágrafo ou seção de observação sem reabrir o código.

**`observacoes` continua interna** e fora do PDF. Era tentador reaproveitá-lo; foi recusado porque hoje guarda anotação da equipe, e passar a imprimi-lo publicaria para o cliente o que foi escrito para dentro.

### 4.2. Campo novo em `programas` — mesmo push

`metodologia` (richText). Fica vazio nos 15 até alguém preencher; pela regra de §1.2, a seção 11 é omitida enquanto isso.

### 4.3. Como os 7 textos nascem preenchidos

Um módulo versionado em `packages/lib/src/crm/` exporta uma função pura que recebe o contexto da proposta (órgão, sigla, modalidade, replay, nº de módulos, programa) e devolve os 7 textos **já interpolados**. Na criação da proposta eles são copiados para os campos dela. Daí em diante são texto comum, editável; cada proposta guarda o que foi de fato enviado.

**Limitação conhecida:** trocar o cliente de uma proposta já criada deixa os textos com o nome do cliente anterior. Mitigação: botão **"Restaurar textos padrão"** no detalhe da proposta, que recalcula os 7 a partir do estado atual e **avisa que sobrescreve edições manuais** antes de aplicar.

**CLAUDE.md §5.3:** esses textos são conteúdo institucional. O texto-base vem do modelo aprovado pelo PO, transcrito — nada é redigido pelo agente.

## 5. Motor do documento

**Cabeçalho e rodapé corridos:** pelo `headerTemplate`/`footerTemplate` do Playwright, que `gerarPdfDeHtml` já usa. O `@page { @top-left { content: … } }` do modelo é **descartado** — Chromium não implementa margin boxes de paged media. Conteúdo a replicar: "Instituto NTC do Brasil · <SIGLA>" à esquerda, código à direita, validade/emissão no rodapé esquerdo, "Página N de M" à direita.

**Fontes:** Cormorant Garamond e Barlow já estão embutidas em base64 por `fontsEmbutidas.ts`. O `<link>` para Google Fonts do modelo é **descartado** — em serverless falharia em silêncio e o PDF sairia com fonte de sistema.

**Paleta: a do modelo, à risca** — `--navy:#0E2A47`, `--navy-exec:#1E4474`, `--gold:#B68B40`, `--gold-light:#D6B070`, `--offwhite:#F5EDD8`, `--bg-suave:#FBF9F2`, `--ink:#3A3A3A`, `--ink-mid:#6B6B6B`, `--acento:#1E5B7B`, `--acento-claro:#3B8AB0`. Nenhuma é da paleta Soberana (Oxford `#11365E`, Dourado `#B5995A`, Pergaminho `#F4EFE6`), que não aparece uma vez no modelo. **Exceção deliberada ao §3 do CLAUDE.md**, decidida pelo PO em 23/09, na mesma linha da exceção já aceita para o painel admin — **registrar no CLAUDE.md quando esta sessão entrar**. Os tokens ficam isolados num módulo só, para a exceção ser auditável num lugar.

### 5.1. Estrutura de arquivos

Hoje `html.ts` tem 203 linhas e 3 seções numa função. Com 23 seções vira ilegível. Quebra por responsabilidade:

- `documentoProposta/tokens.ts` — paleta do modelo e CSS base (a exceção ao §3, isolada).
- `documentoProposta/capa.ts` — capa e Resumo Executivo, os dois blocos de layout próprio.
- `documentoProposta/secoes/institucional.ts` — as 7 de prosa.
- `documentoProposta/secoes/programa.ts` — as 9 do CMS.
- `documentoProposta/secoes/comercial.ts` — Objeto, Quadro Comercial, Condições.
- `documentoProposta/montar.ts` — ordena, **numera** e intercala as seções extras na posição escolhida.
- `dados.ts` cresce para carregar programa, módulos e os textos da proposta; segue sendo a única porta de leitura.

**Numeração computada, nunca escrita:** o número de cada seção sai da posição final na lista, depois de omitir as vazias e intercalar as extras.

## 6. Modalidade

O modelo é de evento **online**. As seções de modalidade presencial **não existem** — nem no modelo, nem no CMS, nem no código.

**Decisão do PO (17/09, mantida):** esta sessão entrega **só online**. Proposta `presencial` ou `híbrida` gera o documento **sem** as seções de EventON, e a tela avisa que o texto presencial ainda não foi redigido. Nada é inventado (§5.3). O texto presencial entra numa sessão curta quando o PO o escrever.

## 7. Testes

- **Puro, sem Playwright:** a montagem e a numeração (dada uma lista de seções e extras, sai a ordem e os números); o subtítulo gerado; a divisão por módulo do Quadro Comercial, incluindo a recusa de divisão não exata; a interpolação dos 7 textos padrão; a omissão de seção vazia.
- **Contra o banco:** nenhum teste automatizado novo; a verificação é o checkpoint visual.
- **O PDF em si continua sem teste automatizado**, como hoje.

## 8. Riscos e pendências

1. **`payload:push:schema` obrigatório** — 8 campos novos (7 em `propostas`, 1 em `programas`) mais a tabela do array `secoesExtras`. Manual, do PO, dev parado (§14 do CLAUDE.md). Nenhum `DROP` esperado; qualquer `DROP` no diff é `N` e volta para o agente.
2. **`maxDuration` na Vercel** — o documento vai de 3 para 23 seções e o Chromium serverless tem limite de tempo. Nunca foi configurado (§19.3 item 8); vira pendência explícita desta sessão, a validar em deploy real antes de propostas verdadeiras.
3. **Versionar o modelo** (§0.1) antes de implementar.
4. **Corpo Docente omitida** até o vínculo manual programa↔especialista (§1.1).
5. **Fonte duplicada** — o conteúdo dos programas vive nos `conteudo*.ts` do site e no CMS, e pode divergir (dívida aceita em 30/09). O documento lê o CMS.

## 9. Fora do escopo

O fluxo (Sessão 3); e-mail (Sessão 5); quantitativos diferentes por módulo; seções presenciais; sumário/índice do documento; assinatura eletrônica; versionamento visual do PDF (o versionamento de proposta já existe desde a Fase B1).
