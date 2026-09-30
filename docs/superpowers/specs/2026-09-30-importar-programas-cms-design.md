# Importar o conteúdo editorial dos 15 programas para o CMS · Design

**Data:** 30 de setembro de 2026
**Status:** aprovado com o PO em 30/09 (blocos 1 e 2)
**Precedência:** `CLAUDE.md` > este spec.

## 0. Por que existe

A Sessão 2 do CRM (documento de proposta com 21 seções) precisa de nove seções que descrevem o programa: apresentação, contexto, objetivos, público-alvo, eixos, módulos, resultados, diferenciais e corpo docente. O PO decidiu em 30/09 que esse conteúdo vem do CMS, **porque programa e módulo são o mesmo ativo** que o site já publica.

O levantamento mostrou que o CMS **não tem esse conteúdo**. Estado verificado por `psql` em 30/09:

| Verificação | Resultado |
|---|---|
| `programas` | 15 registros, todos `_status = draft` |
| `programas.visaoGeral` | preenchido nos 15 |
| `programas.problema` / `objetivo` / `publicoAlvo` | **vazios nos 15** |
| `programas_eixos_tematicos` / `_resultados_esperados` / `_diferenciais` | **0 linhas** |
| `modulos` | **0 linhas** |
| `especialistas` | 63 registros |

O conteúdo real existe em `apps/web/app/(programas)/programas/[slug]/conteudo<SIGLA>.ts` — 15 arquivos de ~576 linhas, mais `modulos/[modulo]/conteudoModulos.ts` (797 linhas). É a política "porta do HTML" (`CLAUDE.md` §5.3): conteúdo copiado 1:1 do protótipo, sem CMS. Os registros vazios do CMS vieram de `seed/programasShell.ts`, que criou só as cascas.

**Publicar os 15 como estão não resolve nada** — publicaria 15 páginas vazias e não daria uma frase ao documento de proposta. Daí este sub-projeto.

## 1. Escopo

**Entra:** um script que lê o conteúdo estático dos 15 programas e grava o **subconjunto editorial** nas coleções `programas` e `modulos` do Payload, publicando o resultado.

**Não entra (decisão do PO, 30/09):** o site continua lendo os arquivos estáticos. As 15 páginas de `/programas/[slug]` não são tocadas (`CLAUDE.md` §5.6). Também não entram no CMS os campos que só a página usa: `hero`, `metaBar`, `navAnchors`, `detalhamento`, `modalidades`, `modulosAbertos`, `ctaFinal`, `sidebar`, `breadcrumb`.

**Dívida aceita e registrada:** o mesmo texto passa a existir em dois lugares — os `conteudo*.ts` (que o site lê) e o CMS (que o documento de proposta lê). Podem divergir. O PO escolheu essa opção conscientemente, preferindo não mexer em página aprovada agora. Fechar a divergência (site lendo do CMS) fica como trabalho futuro, sem data.

## 2. Mapeamento

Por programa, de `ConteudoPrograma` (`conteudoIndex.ts`) para a coleção `programas`:

| Origem (estático) | Destino (CMS) | Forma |
|---|---|---|
| `visaoGeral.corpoHtml` | `visaoGeral` | richText |
| `problema.corpoHtml` | `problema` | richText |
| `objetivoGeral.corpoHtml` | `objetivo` | richText |
| `publico.corpoHtml` + `publico.chips[]` | `publicoAlvo` | richText (corpo + lista) |
| `eixos.itens[]` | `eixosTematicos[]` | `{ titulo, descricao }` |
| `resultados.corpoHtml` (cartões) | `resultadosEsperados[]` | `{ resultado }` |
| `diferenciais.itens[]` | `diferenciais[]` | `{ titulo, descricao }` |
| `faq.itens[]` | `faq[]` | `{ pergunta, resposta }` |

Por módulo. A origem é **`detalhamento.itens[]`**, não `modulos.itens[]`: os dois trazem os mesmos `numero`, `titulo`, `cargaHoraria` e `descricao`, mas só o `detalhamento` tem `topicos[]`, que é a ementa detalhada. `modulos.itens[]` acrescenta apenas `statusRotulo`/`statusTipo`, que são de apresentação e ficam de fora. Quando um programa não tiver `detalhamento`, o import cai para `modulos.itens[]` e grava a ementa só com a descrição, relatando a ausência.

| Origem | Destino | Observação |
|---|---|---|
| `numero` | `numero` | **romano no estático** ("I", "II", "VIII"); convertido para inteiro |
| `titulo` | `titulo` | |
| `descricao` + `topicos[]` | `ementa` | richText: parágrafo da descrição + lista dos tópicos |
| `cargaHoraria` | `cargaHoraria` | text ("8h") |
| — | `programa` | relação com o programa importado |

Numeral romano fora de I–XX é erro relatado, não um palpite.

`modulos.comercial` (`tituloComercial`, `valor`, `replay`, `certificacao`) **não é preenchido** pelo import: é dado comercial que o PO cadastra no painel. O documento de proposta lê o valor da própria proposta, não do módulo.

**`modulosQuantidade`** passa a ser a contagem de módulos importados do programa. **`cargaHorariaTotal`** não é tocado: hoje está `"A definir"` nos 15 e é string de exibição — somar `"8h"` × 8 seria inventar formato. Fica para o PO preencher no painel, e o relatório final lista quem ainda está em `"A definir"`.

### 2.1. Conversão HTML → Lexical

Os campos de corpo no estático são **strings de HTML**, não texto puro: `<p>`, `<em>`, `<strong>`, além de marcação de apresentação (`<p class="lede-block">`, `<div class="results-grid">` com `<div class="result-card">`).

- O conversor aceita o subconjunto `p`, `em`, `strong`, `br`, `ul`/`ol`/`li` e ignora o resto, preservando o texto que está dentro.
- `resultados.corpoHtml` é caso à parte: os cartões `.result-card` são **extraídos** e viram itens de `resultadosEsperados[]`, não um bloco de richText. O número do cartão (`.r-num`) é descartado — a ordem do array o substitui.
- Classes de apresentação são descartadas; o CMS não as usa.
- Se aparecer uma tag fora do subconjunto, o script **relata** o programa e a tag, e não silencia.

### 2.2. Docentes

`docentes` no estático são nomes em texto; no CMS, `coordenacaoCientifica` e `docentes` são relações com `especialistas` (63 cadastrados). O script **casa por nome normalizado** (sem acento, caixa baixa, espaços colapsados) e:

- vincula quando há correspondência exata e única;
- **não vincula** e reporta quando não há correspondência ou há mais de uma.

Nenhum especialista é criado pelo import. A lista de não casados vai no relatório final, para o PO resolver à mão.

## 3. Como roda

Dois passos, para que `apps/cms` não passe a depender de `apps/web` em runtime (o monorepo não comporta: `apps/cms/tsconfig.json` resolve só `@/*`, `@ntc/lib` e `@ntc/types`).

1. **Gerador de instantâneo** — importa os 15 `conteudo*.ts` e emite `apps/cms/src/seed/assets/programas.json`. O JSON é **versionado em git**: o diff mostra o que mudou, e a importação deixa de depender da árvore do site.
2. **Script de import** — `apps/cms/src/seed/importarProgramas.ts`, rodado por `pnpm --filter @ntc/cms programas:importar`, lendo o JSON e gravando pela Local API.

Segue o precedente de `seed/seedContatos.ts`, que já copia para o CMS o que está escrito no site, de forma idempotente.

**Idempotência:** a chave é `sigla`. Programa que já existe é atualizado; que não existe é criado. Módulo é identificado por `(programa, numero)`. Rodar de novo depois de corrigir um `conteudo*.ts` não duplica nada.

**Dry-run por padrão:** sem `PROGRAMAS_IMPORTAR_APLICAR=1` o script só imprime o que faria, como o antigo `crm:migrar-p0`.

### 3.1. Publicação — e por que não é opcional

`programas` tem `versions: { drafts: true }`, e o gerador do PDF lê com `payload.findByID` **sem** `draft: true`, ou seja, a versão publicada. Se os programas ficarem em rascunho, o documento de proposta continuaria lendo a versão vazia mesmo depois do import.

**Decisão:** o script grava com `_status: "published"`. A alternativa — o gerador ler rascunho — foi recusada: colocaria num documento contratual um texto ainda em edição.

Publicar aqui **não muda o site**: as 15 páginas seguem lendo os arquivos estáticos.

## 4. Erros e relatório

O script **falha fechado** e relata em vez de adivinhar. Ao fim imprime, por programa:

- campos importados e campos ausentes na origem;
- tags HTML fora do subconjunto suportado;
- docentes que não casaram com nenhum especialista, ou casaram com mais de um;
- módulos criados e atualizados.

Sigla presente no estático que não existe em `programas` (ou o contrário) é erro relatado, não criação silenciosa — a lista canônica dos 15 é de `seed/programasShell.ts` e não deve mudar por acidente.

## 5. Testes

- **Puro, com Vitest, sem banco:** o mapeamento `ConteudoPrograma` → forma do Payload; o conversor HTML→Lexical (incluindo a extração dos cartões de resultados e a tag fora do subconjunto); a normalização de nome para casar docentes.
- **Contra o banco:** o dry-run, que imprime o plano de escrita sem aplicar.
- Telas: não há tela nesta entrega. O checkpoint visual é conferir, no painel, um programa importado (EDUTEC) com as seções preenchidas.

## 6. Fora do escopo

Site passar a ler do CMS; campos de apresentação (`hero`, `sidebar`, `detalhamento`, `modalidades`, `modulosAbertos`, `ctaFinal`); dados comerciais do módulo; criar especialista que não exista; qualquer mudança nas páginas de `/programas/[slug]`.

---

## Apêndice — decisões já tomadas para a Sessão 2 (sub-projeto seguinte)

Registradas aqui para que o brainstorming da Sessão 2 comece delas, não do zero. **Não são escopo deste spec.**

1. **21 seções**, conforme `" MODELO PROPOSTA.html"` (com espaço no início do nome, na raiz do repo, não versionado). É a **fonte única**; o `Proposta_CRM_Campos_e_Modelo.docx` foi descartado pelo PO em 23/09.
2. **Texto institucional fixo** (EventON, Certificação e Replay, Cancelamento, Proteção de Conteúdo, Fundamentação Legal, Fechamento) vira **campo na própria proposta**, pré-preenchido na criação a partir de um padrão versionado em código. Cada proposta guarda o texto que foi de fato enviado. Isso **é mudança de schema** — seis campos novos em `propostas`, mais `metodologia` em `programas`.
3. **As seções variam pela modalidade, automaticamente.** Online traz EventON e Replay. O texto das seções presenciais **não existe**; a Sessão 2 entrega **só online**, e proposta presencial/híbrida gera o documento sem essas seções, avisando na tela.
4. **Paleta: a do modelo, à risca** — `--navy:#0E2A47`, `--gold:#B68B40`, `--offwhite:#F5EDD8`. Diverge da Soberana (`#11365E`/`#B5995A`/`#F4EFE6`), que não aparece nenhuma vez no modelo. É **exceção deliberada ao §3 do CLAUDE.md**, na mesma linha da exceção já aceita para o painel admin, e deve ser registrada no CLAUDE.md quando a Sessão 2 entrar.
5. **Cabeçalho corrido:** o modelo usa `@page { @top-left { content: … } }`. Chromium **não implementa** margin boxes de paged media — isso não renderiza no Playwright. O cabeçalho vai pelo `headerTemplate`, que `gerarPdfDeHtml` já usa.
6. **"Dirigente" no PDF:** mantém o contato principal do cliente sob esse rótulo (o campo `dirigente` morreu na Sessão 1).
7. **Escopo da Sessão 2:** documento + fluxo numa sessão só — wizard aberto do modal já preenchido, "Criar proposta" na aba Ações (move o card para *Proposta em produção*) e o KPI "Valor em negociação" somando `valorLiquido` da proposta vigente.
