# Programas lidos do CMS — design

**Data:** 05/11/2026 · **Status:** decisões do PO incorporadas (05/11) — aguardando aprovação do documento
**Etapa 1 de 2.** A etapa 2 (motor que lê o PDF do folder e preenche o programa) terá spec própria, a partir do guia do Anexo A.

## 1. Intenção

Pediram ao PO para importar o PDF de um programa novo e o site criar a página sozinho, como já acontece com eventos. Hoje isso é impossível: as 15 páginas `/programas/[slug]` leem arquivos fixos no código (`apps/web/app/(programas)/programas/[slug]/conteudo<SIGLA>.ts`), e programa novo exige editar código e fazer deploy.

Esta etapa faz o site ler os programas do CMS. Depois dela, um programa criado e publicado no painel ganha página no ar sem deploy. Isso é o pré-requisito do motor de PDF.

De quebra fecha a dívida aceita em 30/09 (v3.2): o mesmo texto vive no site (`conteudo*.ts`) e no CMS (`programas`/`modulos`, que alimentam a proposta comercial) e pode divergir. Depois desta etapa há uma fonte só.

## 2. Objetivos

1. `/programas/[slug]` lê da coleção `programas` (só a versão **publicada**), pela Local API, no mesmo padrão de `apps/web/lib/cms/eventos.ts` (`fetchEvento` → adaptador para o tipo que a página já usa).
2. Programa publicado no painel aparece no site sem deploy; publicar revalida a página do programa e as que listam programas.
3. Os 15 programas atuais entram no CMS com o conteúdo de hoje, **1:1**: as 15 páginas ficam visualmente idênticas antes e depois.
4. As telas Programas e Módulos saem do CRM e passam para o módulo **Site** do painel, ganhando os campos novos da página.
5. Programa novo herda a identidade visual (cor secundária, textura do hero) da sua **vertente**; o painel permite ajustar.
6. Programa novo aparece nas **listas e menus** do site que apontam para programas (índice `/programas`, `/solucoes-estrategicas/[area]`, menu do topo, Home, mapa do site), sem deploy.
7. O bloco **Módulos abertos** e o selo de status de cada módulo vêm dos **eventos cadastrados e ativos** do programa, não de texto digitado.
8. Entregar ao PO o **guia de estrutura do folder** (Anexo A), para os PDFs já serem produzidos no padrão que o motor vai ler.

## 3. Não-objetivos

- O motor de importação do PDF (etapa 2).
- Páginas de módulo (`/programas/[slug]/modulos/[modulo]`, hoje só EDUTEC, em `conteudoModulos.ts`): ficam estáticas como estão.
- Redesenho de qualquer seção da página. A página aprovada não muda (CLAUDE.md §5.6); só a origem dos dados.
- Seções novas na página para "Propósito" e "Metodologia" do folder.
- Vincular docentes reais (`especialistas`) aos programas — os docentes das páginas hoje são texto + foto genérica e continuam assim.

## 4. Anti-objetivos (falha mesmo que "funcione")

- Qualquer diferença visível em uma das 15 páginas, ou nas listas e menus de programas, depois da virada — **exceto** o bloco Módulos abertos e os selos de status dos módulos, que passam a refletir os eventos reais por decisão do PO (§5).
- Perder ou sobrescrever em silêncio edição feita no Catálogo do CRM depois de 30/09.
- Quebrar a proposta comercial: o pré-preenchimento lê `programas.visaoGeral/problema/objetivo/publicoAlvo/metodologia`, `eixosTematicos`, `diferenciais`, `resultadosEsperados` e os `modulos`. Esses campos não mudam de nome nem de formato.
- `payload:push:schema` com `DROP` ou `DISABLE ROW LEVEL SECURITY` (ver §7).
- Site fora do ar se o CMS falhar numa leitura.

## 5. Decisões do PO (05/11)

- **Fonte única no CMS.** O site passa a ler programas do CMS.
- **Catálogo sai do CRM.** Duas telas para os mesmos registros confundem e dobram manutenção. O CRM continua *escolhendo* programa e módulos na proposta, no lead e no evento, sem tela de Catálogo.
- **Identidade de programa novo:** identificar a vertente (Educação, Gestão Pública, Saúde) e herdar a dos programas semelhantes; o PDF pode trazer identidade própria, então o painel permite ajustar.
- **O PDF de entrada é o folder comercial enviado aos clientes**, no padrão do folder-matriz (skill `ntc-folder-programa`, matriz EDUTEC v10). Nada de documento paralelo só para o site. O que o folder não tem (FAQ, chamada final, barra lateral, âncoras) é completado no painel.
- **Listas e menus:** programa novo tem que aparecer em todas as listas e menus do site que apontam para programas.
- **Módulos abertos:** vêm dos eventos cadastrados e ativos.
- **Um botão Publicar só.** Publicar põe a página no ar **e** libera o programa para proposta, lead e evento no CRM (um estado só, o `_status` do Payload). Para publicar passa a valer o mínimo que a página precisa, além do mínimo que a proposta já exige.

## 6. Como fica

### 6.1 Modelo de dados

A página usa o tipo `ConteudoPrograma` (`conteudoIndex.ts`, 25 blocos). Parte já tem campo em `programas` desde o import de 30/09; o resto é novo.

| Bloco da página | Hoje no CMS | Nesta etapa |
|---|---|---|
| sigla, nomeCompleto, slug, vertical | `sigla`, `nomeCompleto`, `slug`, `area` | reusar; vertente vem de `area` |
| siglaCss, siglaExibida, breadcrumb | — | campos novos (identidade/exibição) |
| hero (eyebrow, título, subtítulo, stats, CTAs, imagem de fundo) | `eyebrow`, `imagemCapa` parcial | campos novos |
| metaBar | `cargaHorariaTotal`, `modulosQuantidade` parcial | campo novo (lista rótulo/valor) |
| navAnchors | — | campo novo ou derivado (decisão do builder: derivar das seções presentes se der resultado idêntico) |
| visaoGeral, problema, objetivoGeral, publico | `visaoGeral`, `problema`, `objetivo`, `publicoAlvo` (Lexical) | reusar; eyebrow/título de cada bloco em campos novos |
| eixos, resultados, diferenciais | `eixosTematicos`, `resultadosEsperados`, `diferenciais` | reusar; cabeçalhos em campos novos |
| modulos, detalhamento | coleção `modulos` (`numero`, `titulo`, `ementa`, `cargaHoraria`) | reusar; tópicos, status e cabeçalho em campos novos |
| docentes (rico: coordenação, especialistas, contadores, nota) | `coordenacaoCientifica`/`docentes` (relação, vazias) | campo novo com o bloco como está hoje (texto + imagem); as relações ficam intocadas |
| modalidades, faq, ctaFinal, sidebar | `modalidadesEntrega`, `faq` parciais | campos novos (ou reaproveitar `faq` se o round-trip for 1:1) |
| modulosAbertos, status de cada módulo | — | **derivado** dos eventos (§6.6); só os textos fixos do bloco (eyebrow, título, intro, rótulo de CTA) viram campo |

Regras:
- **Nenhum campo novo `required`** (o adapter drizzle emite `NOT NULL`; v3.1). Programa sem um bloco simplesmente não mostra a seção, como a página já faz com os opcionais.
- Campos que já alimentam a proposta não são renomeados nem trocam de tipo.
- Onde a página usa HTML pronto (`corpoHtml`, `tituloHtml`, `metaHtml`), o builder escolhe o formato de armazenamento (Lexical ou texto com marcação leve, como o editor do Catálogo). O critério é um só: **o HTML renderizado sai idêntico ao de hoje**.
- **Campos que o import de 30/09 juntou** (chamada do builder, não do PO): `publicoAlvo` guarda o parágrafo **e** os chips do público (`listaParaLexical(publicoHtml, publicoChips)`), e a `ementa` de cada módulo guarda a descrição **e** os tópicos. A página mostra essas partes separadas. Decisão: **guardar as partes separadas** (parágrafo, chips; descrição, tópicos) e fazer o pré-preenchimento da proposta **montar** o mesmo texto que monta hoje a partir delas. Nada de "desmontar" texto na hora de renderizar (quebra na primeira edição) nem de duas cópias no CMS. O critério de não quebrar a proposta vira: o conteúdo pré-preenchido de uma proposta nova sai idêntico ao de hoje (teste com os 15). Se a troca de formato de `publicoAlvo`/`ementa` exigir migração de coluna, ela entra no script de carga, sem `DROP`.
- Imagens (hero, fundos dos eventos, fotos de docentes) hoje são caminhos em `apps/web/public/img`. Para os 15 o builder pode manter caminho de texto; programa novo precisa poder subir imagem pela `media`. As duas formas convivem.

### 6.2 Identidade visual

Hoje `<main data-programa={siglaCss}>` aciona 1 a 5 regras por programa em `apps/web/app/programas-prototipo.css` (cor secundária, textura do hero, moldura da marca).

- Os 15 mantêm o `siglaCss` deles e o CSS atual, intocado.
- Campo novo **"Identidade visual"** no programa: "Padrão da vertente" (default) ou um dos 15 estilos existentes.
- "Padrão da vertente" ganha um bloco de CSS por vertente (`data-vertical`), copiado de um programa representativo de cada vertente — o builder propõe qual, o PO confirma no checkpoint. Nenhuma cor nova é inventada (§3, §5.2).
- Ajuste fino de cor a partir do PDF fica para a etapa 2.

### 6.3 Leitura no site

- Loader `apps/web/lib/cms/programas.ts`: `fetchPrograma(slug)` (publicado, `depth` suficiente para `modulos` e imagens) + adaptador `CMS → ConteudoPrograma`. `page.tsx` troca só a origem (`PROGRAMAS[slug]` → loader); o JSX não muda.
- `generateStaticParams` passa a vir do CMS; `dynamicParams` ligado para programa novo funcionar sem build. `revalidate` como hoje.
- `calcularRelacionados` passa a ler do CMS (mesma regra: mesma vertente, até 3).
- **Falha de leitura:** o site não cai. Durante a transição o builder pode manter os `conteudo*.ts` como fallback; eles são **apagados no fim desta etapa**, depois da conferência 1:1, quando o fallback vira "página não encontrada" para slug inexistente e erro tratado para falha de banco. Outras partes do site que hoje importam `PROGRAMAS` (procurar por `conteudoIndex`) também passam a ler do CMS.
- Publicar/despublicar no painel chama `/api/revalidate` para `/programas/[slug]` e para as listagens que mostram programas.

### 6.3b Listas e menus

Hoje as listas que apontam para programas são escritas à mão, sem ler `PROGRAMAS`: o índice `(vertical)/programas/page.tsx`, `(vertical)/solucoes-estrategicas/[area]/` (`page.tsx` e `conteudoFallback.ts`), `(home)/HeaderHome.tsx`, `(home)/conteudoFallback.ts` e `(institucional)/mapa-do-site/page.tsx` (o builder confirma a lista completa procurando links `/programas/<slug>`). Todas passam a ler os programas publicados do CMS.

- Para o card de cada lista, os textos que hoje são só da lista (descritor curto, ordem de exibição) viram campos do programa, carregados 1:1 dos valores atuais.
- Programa novo entra no fim da sua vertente, a menos que o painel defina outra ordem.
- Critério de aceite: com os 15, as listas e menus saem idênticos aos de hoje (mesma comparação do §6.4).
- Publicar ou despublicar programa revalida essas páginas também.

### 6.4 Carga dos 15 programas

Script no padrão de `seed/importarProgramas.ts` (dry-run por padrão, variável para aplicar, casa por `sigla`, nunca cria duplicado, `await main()` de topo — `void main()` sai 0 sem rodar sob `payload run` 3.90):

1. **Antes de escrever, comparar** o que está no CMS com o que sai dos `conteudo*.ts` nos campos que já existem. Qualquer diferença (edição feita no Catálogo do CRM depois de 30/09) vai para um relatório e **não é sobrescrita** sem decisão do PO.
2. Preencher os campos novos a partir dos `conteudo*.ts`.
3. Publicar.
4. Idempotente: rodar duas vezes dá o mesmo banco.

**Conferência 1:1** (critério de aceite): para cada um dos 15 slugs, o HTML do `<main>` renderizado com a fonte estática e com a fonte CMS é comparado, **fora** o bloco Módulos abertos e os selos de status (que mudam de propósito); diferença zero, ou cada diferença explicada e aceita pelo PO. O mesmo vale para as listas e menus do §6.3b. Mais o checkpoint visual humano (§6 do CLAUDE.md), desktop 1440 e mobile 375.

### 6.5 Painel

- Telas **Programas** e **Módulos** (hoje `apps/cms/src/app/(painel)/crm/TelaProgramas.tsx`, `TelaModulos.tsx`, `DetalheProgramaCatalogo.tsx`, `DetalheModuloCatalogo.tsx`, `EditorListaCatalogo.tsx`, ações em `acoesCatalogo.ts`) passam para o módulo Site. Mantêm o que já fazem (busca, filtros, rascunho/publicar, selos, exclusão bloqueada por dependentes, aviso de perda de formatação) e ganham os blocos novos, agrupados na ordem da página.
- A tela **Produtos/Eventos** (read-only) do grupo Catálogo sai junto — a edição de eventos já está no módulo Site.
- O grupo "Catálogo Institucional" some do menu do CRM.
- **Permissões** (`apps/cms/src/lib/cms/telas.ts`): as telas Programas e Módulos aparecem no grupo Site. Quem tem acesso hoje continua tendo. Trocar os ids gravados (`crm.programas` → `site.programas`) muda o enum `enum_users_telas` e exige migração dos `users_telas`; a chamada do builder é **manter os ids gravados** e mudar só `modulo`/ordem no `TELAS`, a menos que isso fique confuso no código — se for trocar, migração no padrão de `permissoes:migrar`, rodada uma vez. `crm.produtos` sai do menu; se retirar o valor do enum exigir `DROP`, mantê-lo e só escondê-lo.
- A regra "selects do CRM listam só programas publicados" (v3.4) continua.
- **Publicar** (§5): a lista de faltas do botão Publicar passa a incluir o mínimo da página — no mínimo vertente, sigla, nome, dados do topo (hero), visão geral e módulos; o builder propõe a lista exata a partir dos blocos que a página não consegue omitir sem ficar quebrada, e o PO confirma no checkpoint. Os 15 atuais precisam passar nesse mínimo depois da carga.

### 6.6 Módulos abertos a partir dos eventos

`eventos` tem `programa` (relação com `programas`), `dataInicio`/`dataFim` e `_status`.

- O bloco Módulos abertos (evento em destaque + cards menores) mostra os eventos **publicados** do programa que estão **ativos**. Definição proposta: `dataFim` (ou `dataInicio`, se não houver fim) hoje ou no futuro; encerramento de inscrições pode usar o que `apps/web/lib/eventos/encerramentoInscricoes.ts` já calcula. O builder confirma a regra com o PO se houver dúvida.
- Destaque = o próximo a acontecer; os demais em ordem de data. Card leva para `/agenda/<slug>`.
- **Sem evento ativo:** o bloco não aparece (a página já omite blocos vazios) — não se inventa texto.
- **Selo do módulo** ("aberto"/"em breve"): "aberto" quando há evento ativo ligado àquele módulo; senão, sem selo. O vínculo evento↔módulo existe (`modulos.eventosVinculados` e/ou o módulo do evento); o builder escolhe a fonte e documenta.
- Imagem do card: a capa do evento; sem capa, a imagem de fundo da vertente usada hoje.
- Evento publicado ou despublicado revalida a página do programa dele (hoje revalida a Home e a agenda).

## 7. Restrições

- Mesmo banco em dev e produção. `payload:push:schema` é **do PO**, dev parado, diff lido antes: esperado só criação de colunas/tabelas dos campos novos (+ o drift recorrente conhecido). **Qualquer `DROP` ou `DISABLE ROW LEVEL SECURITY` é `N`.** Tabelas novas nascem com RLS (`manterRlsLigado` nunca sai). Antes: `git worktree list` e conferir se outra branch já pushou schema (regra da v1.9).
- Ordem de virada: push de schema → script de carga (dry-run, relatório de divergências, aplicar) → conferência 1:1 → deploy do site lendo do CMS. Código que lê os campos novos não pode ir a produção antes do push (o site cairia no erro de coluna inexistente, como em 03/10).
- Sem dependência nova. Sem componente novo de UI pública (§5.1).
- Gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (dev parado — o build corrompe o `.next` do dev).

## 8. Deixado para o builder

- Formato exato dos campos novos e agrupamento nas abas do Payload.
- Se `navAnchors` é campo ou derivado.
- Fallback de transição e momento de apagar os `conteudo*.ts` (desde que apagados nesta etapa).
- Quebra das telas do painel (os detalhes de programa já são grandes).
- Testes: adaptador `CMS → ConteudoPrograma` com os 15 como fixtures; script de carga (dry-run, divergência, idempotência); access das telas movidas.

---

## Anexo A — Guia de estrutura do folder de programa (para o PO e quem produz os PDFs)

O motor da etapa 2 vai ler o folder comercial no padrão da matriz EDUTEC v10 (skill `ntc-folder-programa`). Para isso funcionar, todo folder precisa seguir as **seções e títulos abaixo, nesta ordem**. O número de páginas pode variar (o EDUTEC tem 16, por causa do corpo docente); o que não pode variar é a sequência e o título de cada seção.

### Regras que valem para o PDF inteiro

1. **Texto tem que ser texto.** Nada de título ou parágrafo virado imagem ou curva. Exportar do HTML pelo navegador (como a skill já faz) atende; PDF "achatado" ou escaneado não é lido.
2. **Títulos de seção exatamente como na tabela** (a "chave" da coluna 2). O motor acha cada seção pelo título.
3. **Cabeçalho de página** igual em todas: sigla · nome curto · "NTC <Vertente> · <ano>".
4. **Números com unidade**: "80h", "10 Módulos", "8 horas".
5. Módulos numerados com dois dígitos ("01", "02"…), sempre na sequência.

### Seções

| # | Seção (título-chave) | O que precisa ter | Vai para o site em |
|---|---|---|---|
| 1 | **Capa** | Vertente ("NTC Educação" / "NTC Gestão Pública" / "NTC Saúde"); sigla; nome completo; parágrafo de posicionamento; 4 números (módulos, carga horária, modalidade, perfis atendidos); tags temáticas | Hero, barra de dados, vertente |
| 2 | **Apresentação do Programa** | Citação de abertura (entre aspas); 3 a 5 parágrafos | Visão geral |
| 3 | **Contexto e Desafio** | Pergunta-título ("Por que … precisa do <SIGLA>?"); parágrafo de abertura; 6 desafios numerados 01–06, cada um com título e descrição | Problema |
| 4 | **Propósito do Programa** | Título; parágrafo; 4 frentes numeradas 01–04 com título e descrição; frase de fechamento | CMS (sem seção no site hoje) |
| 5 | **Público-Alvo** | Pergunta-título ("Para quem é o <SIGLA>?"); parágrafo; perfis, cada um com nome e descrição | Público |
| 6 | **Objetivos e Competências** | Subseções **Objetivo Geral** (1 parágrafo), **Objetivos Específicos** (lista), **Capacidades Institucionais Fortalecidas** (lista) | Objetivo geral |
| 7 | **Arquitetura Formativa** | Números (módulos, horas, horas por módulo, eixos); **Eixos**: "Eixo I…", título, faixa de módulos ("Módulos 1–3"); **Modalidades de Realização** (Online ao Vivo, Presencial, Híbrido, cada uma com descrição); nota de contratação flexível | Eixos, modalidades, barra de dados |
| 8 | **Arquitetura de Módulos** (Parte I, Parte II…) | Para cada módulo: número (01…), título, subtítulo de uma linha, **Eixos Temáticos** (lista de tópicos), **Resultados Esperados** (lista). Carga horária do módulo no cabeçalho da parte ou no módulo | Módulos, detalhamento |
| 9 | **Quem ensina** (Time Acadêmico) | Parágrafo; contadores (docentes, coordenação…); **Coordenação Científica**: nome, papel, minicurrículo de 1–2 linhas; depois **Especialistas e Palestrantes** com nome, papel e minicurrículo | Docentes |
| 10 | **Metodologia NTC** | Título; parágrafo; passos numerados ("PASSO 01"…) com título e descrição | CMS (`metodologia`, usado na proposta comercial) |
| 11 | **Resultados Esperados** | Pergunta-título ("O que muda com o <SIGLA>?"); parágrafo; **Para os Profissionais** e **Para a Rede/Instituição**, cada item com título e descrição | Resultados |
| 12 | **Por que o Grupo NTC** | Diferenciais, cada um com título e descrição; **Formas de Realização** (trilha completa, por eixo, módulo avulso…) | Diferenciais, modalidades |
| 13 | **Contracapa** | Fixa (citação, contatos institucionais). O motor ignora | — |

### O que o folder não traz e será completado no painel depois do import

FAQ · chamada final da página · barra lateral (resumo e entregas) · imagens de fundo do site (se as do folder não servirem) · ajuste da identidade visual.

### Pendente de confirmação

A matriz foi desenhada para a linha NTC Educação. Antes de produzir folders de Gestão Pública e Saúde, confirmar se seguem a mesma sequência (o guia acima assume que sim).
