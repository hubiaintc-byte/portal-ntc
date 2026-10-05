# CRM — Gestão do catálogo: Programas e Módulos

**Data:** 05/10/2026 · **Status:** rascunho para revisão do PO
**Escopo:** módulo CRM do Painel Admin, grupo "Catálogo Institucional" — telas Programas e Módulos.

## 0. Contexto e objetivo

Hoje `TelaProgramas` e `TelaModulos` são tabelas read-only, sem busca nem filtro (15 programas, 112 módulos). O subtítulo de Programas diz "edição no módulo Site", **o que não é verdade**: o módulo Site não tem tela de programas nem de módulos, e desde a remoção do admin nativo do Payload (11/06) essas duas coleções só são editáveis por script.

**Objetivo (decisão do PO, 05/10):** gerir o **catálogo comercial** — criar, editar, publicar e excluir programas e módulos que alimentam o wizard de proposta e o pré-preenchimento do documento da proposta (Sessão 2). **O site não muda:** `/programas/[slug]` continua lendo `conteudo<SIGLA>.ts` (dívida da fonte duplicada, aceita em 30/09 — CLAUDE.md §19.3 item 14). Um programa criado aqui **não ganha página pública**.

**Propostas já criadas não mudam** com nenhuma edição feita aqui — o conteúdo é congelado na proposta desde a Sessão 2; "Restaurar padrão" segue sendo o caminho para trazer o texto novo.

## 1. Decisões do PO

| # | Decisão |
|---|---------|
| 1 | Objetivo é só o catálogo comercial; site intocado. |
| 2 | Só os campos que o CRM usa são editáveis (§3). Os demais ficam no banco como estão, sem tela. |
| 3 | `programas` com rascunho + botão "Publicar" (padrão de eventos do módulo Site). `modulos` não tem versões — salvar vale na hora. |
| 4 | Exclusão de programa e módulo, **bloqueada quando há dependentes** (padrão "Apagar cliente" da Sessão 4). |

## 2. Listas com filtros

Filtragem no cliente (volume pequeno), padrão de `TelaLeadsCrm`/`TelaClientes`. Estado dos filtros local à tela.

**Programas**
- Busca por sigla ou nome completo (sem acento, sem caixa).
- Filtro por área (lista de `areas`) e por situação: *Publicado* · *Rascunho* (nunca publicado) · *Alterações não publicadas* (publicado, com rascunho mais novo).
- Colunas: Sigla · Nome · Área · Situação (selo) · Nº de módulos (contagem real de `modulos`, não `modulosQuantidade`).
- Botão **Novo programa**. Clique na linha abre o detalhe.
- Subtítulo novo: "Programas do catálogo comercial — alimentam o wizard e o documento da proposta. O site não lê daqui."

**Módulos**
- Busca por título ou título comercial.
- Filtro por programa.
- Colunas atuais mantidas (Nº · Título · Programa · Valor ref. · Replay · Certificação).
- Botão **Novo módulo**. Clique na linha abre o detalhe.

Estado vazio com filtro ativo: "Nenhum resultado para os filtros." com botão "Limpar filtros".

## 3. Detalhe do programa

Tela cheia dentro do `ShellCrm` (mesmo mecanismo de `DetalheCliente`/`DetalheProposta`), com "← Programas" para voltar. Blocos:

**Identificação** — `sigla` (obrigatória, única), `nomeCompleto`, `area` (select de `areas`), `cargaHorariaTotal` (texto, ex. "64 horas").

**Textos** — `visaoGeral`, `problema`, `objetivo`, `publicoAlvo`, `metodologia`. Cada um é um `<textarea>` com a `BarraFormatacao` dos Conteúdos (Markdown leve), convertido na escrita por `markdownParaLexical` e na leitura por `lexicalParaMarkdown` (`apps/cms/src/lib/markdownLexical.ts`). Diferente do round-trip em texto puro da proposta, **preserva negrito, itálico, listas, subtítulos e links**. Rótulos na tela seguem os da proposta (ex. "Problema" aparece como "Contexto (problema)").

**Listas** — `eixosTematicos` (título + descrição), `diferenciais` (título + descrição opcional), `resultadosEsperados` (texto). Adicionar, remover, mover para cima/baixo (botões, não arraste — acessível por teclado).

**Módulos do programa** — lista read-only (nº, título, carga horária) com link para o detalhe de cada um e botão "Novo módulo neste programa" (abre o form com o programa preenchido).

**Rodapé de ações** — `Salvar rascunho` · `Publicar` · `Excluir programa` (zona de risco, §6).

### 3.1. Rascunho e publicação

- **Salvar rascunho** grava com `draft: true`. Exige só **sigla e nome completo** — a sigla para o rascunho ser encontrável, o nome porque o `slug` (único) é derivado dele pelo hook `autoSlug`.
- **Publicar** valida, antes de qualquer escrita, os campos exigidos pela publicação: sigla, nome completo, área, carga horária total e visão geral não-vazia. Falha lista os campos faltantes. Sucesso grava `_status: "published"`.
- Selo de situação no cabeçalho: *Rascunho* · *Publicado* · *Alterações não publicadas*.
- **Programa novo nasce rascunho.** Aviso fixo na tela enquanto não publicado: "Rascunho não aparece no wizard de proposta."
- Ao abrir o detalhe, a leitura é `draft: true` (mostra a última edição).

### 3.2. Wizard de proposta passa a listar só publicados

Hoje `obterCatalogoCrm` lê `programas` com `draft: true` e sem filtro de status — rascunhos aparecem no wizard, mas `criarProposta` lê a versão publicada (`findByID` sem `draft`). Com a criação pelo painel isso deixa de ser teórico. **Mudança:** `obterCatalogoCrm` filtra `programas` por `_status = published` e lê sem `draft` (versão publicada); os `modulos` do catálogo ficam restritos aos de programas publicados. O detalhe de propostas já existentes continua mostrando o programa vinculado mesmo que ele volte a rascunho.

### 3.3. Imagem de capa opcional — sem push de schema

`programas.imagemCapa` deixa de ser `required` (o CRM não usa imagem; exigir upload para criar um programa seria atrito sem propósito). **Isto NÃO exige `payload:push:schema`** (corrigido em 05/10, ao escrever o plano): `programas` tem `versions.drafts`, e o adapter drizzle já não emite `NOT NULL` para coleção com rascunho — verificado por `psql`: `imagem_capa_id`, `area_id`, `carga_horaria_total`, `visao_geral`, `nome_completo`, `sigla` e `slug` estão todos `is_nullable = YES`. A mudança é só de validação do Payload (que roda na publicação; ao salvar rascunho o Payload pula a validação de obrigatórios — `skipValidation` em `create.js`/`update.js` do Payload 3.18). `payload:generate` roda na branch (o tipo `Programa.imagemCapa` passa a opcional).

## 4. Detalhe do módulo

Tela cheia no `ShellCrm`, "← Módulos". Campos:

- `programa` (select de todos os programas, rascunho incluso, com sigla), `numero` (inteiro ≥ 1), `titulo`, `ementa` (textarea + `BarraFormatacao`, mesma conversão do §3), `cargaHoraria` (texto).
- Grupo **Dados comerciais**: `tituloComercial`, `valor` (R$, ≥ 0), `replay`, `certificacao`.
- Fora do escopo: `eventosVinculados`.

Regras:
- **Unicidade de `(programa, numero)`**: recusada se outro módulo do mesmo programa já usa o número ("Já existe o módulo 3 em EDUTEC."). Não há índice único no banco — a verificação é na escrita, mesma limitação de concorrência aceita em outros pontos do CRM.
- Obrigatórios: programa, número, título, ementa (o schema já exige).
- Salvar vale na hora (sem versões).
- **`modulosQuantidade`** do programa é recalculado (contagem real) na mesma transação ao criar, excluir ou trocar o programa de um módulo — para os dois programas, no caso da troca. Onde gravar depende da situação do programa: se está *Publicado* sem rascunho pendente, grava publicado; se está *Rascunho* ou com *Alterações não publicadas*, grava no rascunho — para não publicar por tabela o que o PO ainda está editando. *(regra pura testada)*

Aviso fixo no detalhe: "Editar um módulo não altera propostas já criadas."

## 5. Arquitetura

**Regras puras** — `packages/lib/src/crm/catalogo.ts`, com testes:
- `filtrarProgramas(lista, filtros)`, `filtrarModulos(lista, filtros)` (normalização sem acento/caixa).
- `situacaoPrograma({ _status, temRascunhoMaisNovo })` → `"rascunho" | "publicado" | "alteracoes-pendentes"`.
- `faltasParaPublicar(programa)` → lista de rótulos dos campos faltantes.
- `numeroDeModuloEmUso(modulos, programaId, numero, ignorarId?)`.
- `bloqueiosExclusaoPrograma(contagens)` / `bloqueiosExclusaoModulo(contagens)` → lista de motivos legíveis (vazia = pode excluir).

**Leitura** — arquivo novo `apps/cms/src/lib/cms/catalogoCrm.ts`: `listarProgramasCrm` e `listarModulosCrm` saem de `painelCrm.ts` para ele e ganham os campos de filtro e situação; novos `carregarProgramaCatalogo(id)` e `carregarModuloCatalogo(id)` (Lexical → Markdown, contagem de dependentes para o estado do botão Excluir).

**Escrita** — arquivo novo `apps/cms/src/lib/cms/catalogoCrmEscrita.ts` (o `painelCrmEscrita.ts` já passa de 1.800 linhas) + Server Actions num arquivo novo `app/(painel)/acoesCatalogo.ts` (gate de sessão como as demais): `salvarProgramaCrm` (cria/atualiza rascunho), `publicarProgramaCrm`, `excluirProgramaCrm`, `salvarModuloCrm`, `excluirModuloCrm`. Toda escrita composta via `executarEmTransacao`.

**Hooks** — `apps/cms/src/lib/crm/exclusaoCatalogo.ts`: `beforeDelete` em `programas` e `modulos` repetindo a regra do §6, falha fechado mesmo se a UI for contornada (padrão `bloquearClienteComDependentes`).

**Telas** — `TelaProgramas.tsx`, `TelaModulos.tsx` (filtros), novos `DetalheProgramaCatalogo.tsx`, `DetalheModuloCatalogo.tsx`, e um `EditorListaCatalogo.tsx` para as três listas do programa se a repetição justificar. `ShellCrm` ganha os dois estados de detalhe. Componentes do painel (`pcms-*`), sem dependência nova; o painel segue a exceção visual já registrada (cantos/sombras), não a Soberana do site.

## 6. Exclusão

Padrão "Apagar cliente": botão desabilitado com a explicação dos bloqueios; quando liberado, confirmação em dois cliques (sem `window.confirm`); `beforeDelete` repete a regra no servidor.

**Programa — bloqueado se houver:** módulos (`modulos.programa`), propostas (`propostas.programa`), leads (`leads.programa`), eventos do site (`eventos` → programa) ou especialistas vinculados (`especialistas` → programas). Mensagem lista cada contagem ("3 módulos, 1 proposta"). Referências em `areas` e em `programasRelacionados` de outros programas são removidas pelo próprio banco (tabelas `_rels`) e **não** bloqueiam. Excluir um programa apaga também as versões dele.

**Módulo — bloqueado se houver:** propostas com o módulo em `modulos` ou em `modulosDetalhados.modulo`, ou eventos comerciais com `moduloCatalogo`. É o que evita o gatilho do fail-safe da Sessão 2 (tabela por módulo desaparecendo do PDF por módulo apagado do catálogo). Ao excluir, `modulosQuantidade` do programa é recalculado (§4).

Exclusões **não** gravam na linha do tempo (catálogo não pertence a cliente) nem no `audit-log` (sem escrita até hoje — fora do escopo).

## 7. Erros

- Toda Server Action devolve `{ ok: false, erro }` com mensagem em português; nada de erro genérico para validação conhecida (sigla duplicada, número em uso, faltas para publicar, bloqueios de exclusão).
- Conversão Markdown: Markdown fora do subconjunto vira texto literal (comportamento atual de `markdownParaLexical`), sem perda silenciosa de conteúdo.
- **Round-trip do conteúdo importado:** o conteúdo dos 15 programas veio de `htmlParaLexical`. Se algum nó não for representável em Markdown (ex. negrito+itálico juntos — `inlineParaMarkdown` mantém só o negrito), a tela avisa por campo antes de salvar, no mesmo espírito do aviso de negrito da proposta. O teste do §8 mede se isso ocorre no instantâneo real.

## 8. Testes

- `catalogo.test.ts` em `@ntc/lib`: filtros, situação, faltas para publicar, unicidade de número, bloqueios.
- Round-trip `lexicalParaMarkdown` → `markdownParaLexical` sobre os textos de `apps/cms/src/seed/assets/programas.json` convertidos por `htmlParaLexical`: o resultado deve ser equivalente ao original (mesmo texto e mesmos formatos), ou o teste enumera exatamente os campos com perda — o que decide se o aviso do §7 aparece na prática.
- Hooks `beforeDelete` de `programas` e `modulos` (com dependente → recusa; sem → passa).
- Gate de sessão das 5 Server Actions novas (fecha, para elas, o padrão da dívida nº 8 da Sessão 4).
- `obterCatalogoCrm` não devolve programa em rascunho.
- Telas: sem teste de componente (suíte em `node`); cobertura pelo checkpoint visual.

## 9. Checkpoint visual (PO)

1. Programas: buscar "edu", filtrar por área e por situação; Módulos: filtrar por programa.
2. Novo programa → salvar rascunho → aparece com selo *Rascunho*; wizard de proposta **não** o lista.
3. Tentar publicar sem visão geral → lista de faltas; preencher → publicar → aparece no wizard.
4. Editar a visão geral de um programa importado: negrito aparece como `**…**`, salvar, reabrir — negrito mantido.
5. Editar um publicado → selo *Alterações não publicadas*; proposta nova ainda pré-preenche com o texto publicado; publicar → proposta nova usa o texto novo; proposta antiga inalterada.
6. Novo módulo no programa novo com número repetido → recusa; com número livre → salva; `Nº de módulos` atualiza.
7. Excluir módulo usado em proposta → desabilitado com explicação; excluir o módulo novo → some.
8. Excluir programa com módulos → desabilitado; excluir o módulo, depois o programa → some.
9. Desktop 1440 e mobile 375 das quatro telas.

## 10. Fora do escopo

Imagem de capa, lockup, SEO, FAQ, modalidades de entrega, contratação institucional, programas relacionados, coordenação científica e docentes do programa; `eventosVinculados` do módulo; qualquer efeito no site (`apps/web`); arquivar; auditoria; permissões por perfil (segue item 11 de §19.3); reordenar módulos por arraste; escrita na linha do tempo.
