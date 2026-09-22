# Conteúdos editoriais no painel e no site — design

**Data:** 22 de setembro de 2026
**Estado:** aprovado com o PO em 17 e 22/09/2026 (brainstorming)
**Branch de implementação:** `feat/cms-conteudos-editoriais`
**Spec irmã:** `2026-09-22-contatos-institucionais-design.md` — mesma branch, **um único** `payload:push:schema` para as duas.

## 1. Problema

A coleção `conteudos` existe no Payload desde a modelagem inicial (doc 11 §9) e **nunca foi usada**: não há tela no Painel Admin para criá-la ou editá-la, e o site não a lê.

A página `/conteudos` (porta literal do protótipo `28_Pagina_Conteudos_v1.html`) mostra **9 cards estáticos** marcados "Em preparação editorial · Previsto 2026", mais 3 destaques com foto que repetem os três primeiros. Nenhum deles tem texto — são títulos e uma frase de descrição, escritos no protótipo como promessa de linha editorial. O link de cada card é "Em breve", sem destino.

Não existe página de leitura de um conteúdo. O doc 13 §"Conteúdos" prevê `/conteudos/[categoria]/[slug]`, mas **não há protótipo HTML aprovado** para ela (a numeração dos protótipos pula de 28 para 30).

Publicar notícia e artigo hoje exige mexer em código.

## 2. Escopo

**Entra:** tela de Conteúdos no Painel Admin (criar, editar, publicar, despublicar, excluir); ajuste do modelo da coleção; página de leitura nova no site; `/conteudos` passando a ler do CMS; importação dos 9 cards estáticos como rascunho.

**Não entra:** imagens no meio do corpo do texto (a imagem de destaque existe; ilustração inline fica para depois); editor WYSIWYG; comentários; newsletter de disparo (o formulário de newsletter da página continua como está); busca server-side (a busca da biblioteca continua client-side, como no protótipo).

## 3. Decisões tomadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Alcance | Painel + biblioteca + **página de leitura** | Publicar sem ter onde ler não entrega valor. |
| Categorias | As 5 do protótipo + Notícia | O protótipo é a fonte visual canônica (§18); a lista do doc 11 foi modelada antes dele existir. |
| Editor do corpo | Textarea com **Markdown leve + pré-visualização** | Entrega subtítulo/ênfase/link/citação sem dependência nova (§5.4); grava no Lexical do Payload, então migrar para WYSIWYG depois não exige converter conteúdo. |
| Página de leitura | Desenhada em código, no idioma do protótipo 28 | É página de leitura, de estrutura conhecida; os tokens e componentes do 28 resolvem a estética; o checkpoint visual (§6) cobre o risco. |
| Os 9 cards estáticos | Importados como **rascunho** | Viram lista de trabalho no painel em vez de sumirem. |
| Rascunho no site | Só com o checkbox **"Anunciar no site como em preparação"** | Mantém o site como está hoje sem expor artigo em escrita. |
| Autoria | Especialistas **e/ou** assinatura institucional | Cobre notícia institucional e artigo assinado. |
| Nome no painel | "Conteúdos" | O site já chama assim no menu e na rota; a biblioteca guarda estudo e webinar, não só notícia. |

## 4. Modelo de dados

### 4.1. Coleção `conteudos` (ajustes)

`CONTEUDO_CATEGORIA` em `apps/cms/src/shared/types.ts` passa de
`artigo · insight · publicacao · material-download · noticia`
para:

```ts
export const CONTEUDO_CATEGORIA = [
  "artigo",
  "estudo",
  "nota-tecnica",
  "webinar",
  "material",
  "noticia",
] as const;
```

Campos novos:

| Campo | Tipo | Regra |
|---|---|---|
| `assinatura` | `text` | Assinatura institucional (ex.: "Curadoria NTC Saúde"). Exigida **ao publicar** quando `autor` está vazio — a validação mora no painel, não no Payload, porque rascunho e seed precisam poder gravar parcial. |
| `destaque` | `checkbox` | Entra na seção Destaques de `/conteudos` (máximo 3, os mais recentes). |
| `anunciarEmPreparacao` | `checkbox` | Rascunho aparece no site como "Em preparação editorial". Ignorado quando publicado. |
| `tempoLeituraMin` | `number` | Derivado no `beforeChange` a partir do corpo, ~200 palavras/min, mínimo 1. Não editável. |
| `linkExterno` | `text` | URL opcional (webinar gravado, material hospedado fora). Validada como `http(s)://`. |

Campos alterados:

- `imagemDestaque` deixa de ser `required` — notícia curta e rascunho "em preparação" não têm foto. **Isto é mudança de schema** (ver §8).
- `anexoDownload` passa a ser condicionado a `categoria === "material" || categoria === "estudo"`.

Mantidos como estão: `titulo`, `slug` (com `autoSlug`), `area`, `lide`, `corpo`, `autor`, `dataPublicacao`, `conteudosRelacionados`, `seoFields`, `versions.drafts`, `access` (`editorInstitucional`).

Hook novo: `afterChange` com `revalidatePage` para `/conteudos` e para a página de leitura do documento.

### 4.2. Vertical

A vertical **não** ganha campo próprio: vem de `area` (relação com `areas`). Conteúdo sem área é "Transversal" no site.

### 4.3. Seed dos 9 rascunhos

`pnpm --filter @ntc/cms conteudos:seed-em-preparacao` cria, se não existirem (chave: `slug`):

| Slug | Categoria | Área | Destaque |
|---|---|---|---|
| `cinco-anos-de-lei-14133` | estudo | Gestão Pública | sim |
| `recomposicao-da-aprendizagem` | artigo | Educação | sim |
| `previne-brasil-2026` | webinar | Saúde | sim |
| `ia-generativa-no-setor-publico` | nota-tecnica | — (transversal) | não |
| `educacao-integral-em-escala` | estudo | Educação | não |
| `direcao-estrategica-na-administracao-publica` | webinar | Gestão Pública | não |
| `direcao-institucional-em-saude-publica` | estudo | Saúde | não |
| `governanca-de-dados-no-setor-publico` | webinar | — (transversal) | não |
| `primeira-infancia-e-educacao-infantil` | material | Educação | não |

Todos com `_status: "draft"`, `anunciarEmPreparacao: true`, `lide` = a descrição do card (nos 3 destacados, a descrição longa da seção Destaques), `assinatura` = o texto de autoria do card ("Curadoria NTC Gestão Pública", "Direção Científica NTC", "Equipe Técnica NTC Saúde"…), `corpo` vazio e `dataPublicacao` = data do seed. Os títulos, lides e assinaturas saem **literalmente** de `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts` (§5.3: não inventar texto institucional).

A `area` é resolvida por slug na coleção `areas`; se a área não existir no banco, o rascunho é criado **sem** área (vira Transversal no site) e o seed avisa no console — não cria área nenhuma por conta própria.

## 5. Editor de texto (Markdown leve ↔ Lexical)

Duas funções puras novas, com testes de ida e volta, ao lado das que já existem (`textoParaLexical`, `lexicalParaTexto`, `lexicalToHtml`):

- `markdownParaLexical(texto: string): SerializedEditorState`
- `lexicalParaMarkdown(doc: unknown): string`

Sintaxe suportada (sete elementos, nada além):

| Escrita | Vira |
|---|---|
| `## Subtítulo` | heading nível 2 |
| `### Subtítulo menor` | heading nível 3 |
| `**negrito**` | texto com `format: bold` |
| `*itálico*` | texto com `format: italic` |
| `[texto](https://…)` | link |
| `> citação` | quote |
| `- item` / `1. item` | lista não ordenada / ordenada |

Linha em branco separa parágrafos. Qualquer outra sintaxe de Markdown é tratada como texto literal — não há fallback silencioso que perca conteúdo.

### 5.1. Renderização do corpo: função nova, não reaproveitada

O `lexicalToHtml` que já existe (em duas cópias, `apps/cms/src/lib/cms/lexical.ts` e `apps/web/lib/cms/lexical.ts`) **não serve** para o corpo de um artigo: ele achata o documento em HTML **inline**, juntando parágrafos, headings e itens de lista com `<br>`. Foi desenhado para campos curtos de evento e de especialista, e é usado por eles hoje.

Entra então uma função **nova**, `lexicalParaHtmlEditorial(doc): string`, em `packages/lib`, que serializa em blocos de verdade: `<h2>`/`<h3>`, `<p>`, `<ul>`/`<ol>` com `<li>`, `<blockquote>`, `<a href rel="noopener">`, `<strong>`, `<em>`. Escapa `<`, `>` e `&` do texto antes de montar as tags e só emite `href` com `http(s)://` ou `mailto:` — o corpo é renderizado com `dangerouslySetInnerHTML`, então a sanitização é da função, não do chamador.

As duas cópias de `lexicalToHtml` **ficam como estão**; nenhum chamador atual muda. O painel usa a função nova na pré-visualização, e o site na página de leitura — uma implementação só, nos dois lados.

### 5.2. Feature de citação no editor do campo

`lexicalRestrictiveFeatures` (`apps/cms/src/shared/lexical-config.ts`) não inclui citação, e ele vale para **todas** as coleções editoriais. Em vez de mexer no global, o campo `corpo` de `conteudos` ganha `editor` próprio: `lexicalEditor({ features: () => [...lexicalRestrictiveFeatures, BlockquoteFeature()] })` — `BlockquoteFeature` existe em `@payloadcms/richtext-lexical@3.18.0` (verificado). Nenhuma outra coleção muda de comportamento.

## 6. Painel Admin (módulo Site)

### 6.1. Navegação

Item **Conteúdos** no grupo Editorial de `ShellCms`, entre Eventos e Home. Ícone linear de documento (peso 1.5, §3). Breadcrumb "Editorial · Conteúdos". `TelaId` ganha `"conteudos"`.

### 6.2. `TelaConteudos` (lista)

Anatomia de `TelaEventos`: busca por título, filtro por categoria e por situação (rascunho · publicado · em preparação), colunas **título · categoria · vertical · data · situação**. Botão **"Novo conteúdo"** habilitado — é o primeiro "criar do zero" fora do CRM (backlog §19.3 item 9); o padrão de formulário vem de `FormCliente`/`CamposCrm`.

### 6.3. `DetalheConteudo` (criar e editar)

Um componente só, como `DetalheEvento`.

- **Cabeçalho:** título, selo de situação, botões Salvar rascunho · Publicar · Despublicar · Excluir (com confirmação).
- **Coluna principal:** Título; Lide (até 280 com contador); **Corpo** — textarea à esquerda e pré-visualização renderizada à direita (`.pcms-rich`), com a linha de ajuda listando a sintaxe do §5.
- **Coluna lateral:** Categoria; Vertical (área); Data de publicação; Autores (`SeletorPalestrantes` reaproveitado) e/ou Assinatura; Imagem de destaque (`CampoUpload`); Anexo (só material/estudo); Link externo; `Destaque` ☐; `Anunciar como "em preparação"` ☐ (só visível em rascunho); Slug (gerado do título, editável); SEO (título e descrição).

### 6.4. Server Actions

Em `acoes.ts`, no padrão atual (`{ ok, erro }`): `listarConteudos`, `carregarConteudo`, `salvarConteudo`, `publicarConteudo`, `despublicarConteudo`, `excluirConteudo`. Leitura em `painelCms.ts`, escrita em `painelCmsEscrita.ts`. Perfis: `super-admin` e `editor-institucional` (`editorInstitucional`); `editor-eventos` vê a lista e não edita.

### 6.5. Dashboard

`TelaDashboard` ganha "Conteúdos publicados" ao lado das contagens de Eventos e Palestrantes. Uma linha, não um bloco novo.

## 7. Site (`apps/web`)

### 7.1. Leitura

`apps/web/lib/conteudos.ts`, via `obterPayload()` (Local API, padrão dos formulários), com `cache()` do React:

- `listarConteudosPublicados()` — publicados **mais** rascunhos com `anunciarEmPreparacao`, por `dataPublicacao` desc.
- `listarDestaques()` — até 3 com `destaque`, mais recentes primeiro.
- `carregarConteudo(categoriaUrl, slug)` — só publicado; rascunho devolve `null`.
- `listarRelacionados(doc)` — os de `conteudosRelacionados`, ou os 3 mais recentes da mesma área.

Falha de banco não quebra página: lista vazia, log no servidor.

### 7.2. `/conteudos` (página existente)

As seções **Destaques** e **Biblioteca** passam a receber os cards do CMS por props. `CARDS_BIBLIOTECA` e `DESTAQUES` saem de `conteudoConteudos.ts`. **O HTML e o CSS dos cards não mudam** — muda a fonte dos dados (§5.6: a mudança é declarada e pedida).

- Card publicado: link para a página de leitura, data real no lugar de "Previsto · 2026", sem o selo "Em preparação".
- Card em preparação: idêntico ao de hoje.
- Vertical do card vem de `area` (Transversal quando vazia); `FILTROS_TIPO` ganha "Notícias".
- Métricas do topo, manifesto, tese, tipos editoriais, verticais, newsletter, FAQ e CTA final continuam estáticos.
- `revalidate` passa de 3600 para **600** (doc 13: `/conteudos*` ISR 600s).

### 7.3. `/conteudos/[categoria]/[slug]` (nova)

No mesmo route group `(conteudos)` — herda CSS, header, footer e `InteracoesScroll` do layout.

- Segmento de categoria no plural: `artigos`, `estudos`, `notas-tecnicas`, `webinars`, `materiais`, `noticias`. O mapeamento categoria ↔ segmento é função pura testada.
- `generateStaticParams` a partir dos publicados, `dynamicParams: true`, `revalidate = 600`. Slug inexistente ou rascunho → `notFound()`.

Estrutura:

1. Breadcrumb (Grupo NTC › Conteúdos › Categoria) e hero editorial: eyebrow "Vertical · Categoria", título, lide, linha de meta (assinatura ou autores · data · X min de leitura), imagem de destaque — ou a imagem padrão da vertical quando não houver.
2. Corpo em coluna de leitura (~68ch), Cormorant nos subtítulos e Barlow no texto, renderizado por `lexicalParaHtmlEditorial`.
3. Bloco de anexo ou link externo, quando houver ("Baixar material" / "Assistir ao webinar").
4. Assinatura: card de especialista com link para o corpo docente, ou o texto da assinatura institucional.
5. "Leia também" com os relacionados.
6. CTA final de 3 pontes, igual ao de `/conteudos`.

`metadata` com título e descrição do SEO, `openGraph` com a imagem de destaque, JSON-LD `Article`. Server Component puro — nenhum JS novo. Imagem via `next/image` com `sizes` explícito (§11). Landmarks e skip-link vêm do layout (§10).

## 8. Schema — `payload:push:schema`

Manual, do PO, com o dev parado, **junto com a spec irmã de contatos** (um push só).

**Esperado em `conteudos`:**
- Colunas novas: `assinatura`, `destaque`, `anunciar_em_preparacao`, `tempo_leitura_min`, `link_externo` (e as equivalentes na tabela de versões `_conteudos_v`).
- `imagem_destaque_id`: `DROP NOT NULL`. Tirar `required: true` **é** mudança de banco — o adapter drizzle 3.18 emite `NOT NULL` para todo campo obrigatório (lição da Sessão 4 do CRM, `@payloadcms/drizzle@3.18.0/dist/schema/traverseFields.js:718-719`).
- `enum_conteudos_categoria` recriado com os 6 valores novos (`SET DATA TYPE text` → `DROP TYPE` → `CREATE TYPE` → `USING`). A tabela está vazia; se não estiver, `UPDATE conteudos SET categoria = NULL;` antes.

**Qualquer `DROP` fora desta lista é `N`** e volta para o agente. Depois: `payload:generate` e `git status` limpo.

## 9. Erros

- Salvar e publicar devolvem `{ ok, erro }` legível no `AvisoForm`. Slug duplicado → "Já existe um conteúdo com este endereço".
- Publicar sem título, lide, corpo ou categoria é barrado no painel antes de chamar o Payload.
- Falha de revalidação não impede a publicação — o hook loga (comportamento atual).
- No site: falha de banco → lista vazia e log; slug inexistente ou rascunho → 404.

## 10. Testes (Vitest, TDD)

- Ida e volta `markdownParaLexical` / `lexicalParaMarkdown` nos sete elementos, e sintaxe não suportada preservada como texto.
- `lexicalParaHtmlEditorial` em `packages/lib`: blocos (h2/h3, p, ul/ol, blockquote), escape de `<`/`>`/`&` e recusa de `href` que não seja `http(s):`/`mailto:`.
- Tempo de leitura.
- Mapeamento categoria ↔ segmento da URL e área ↔ vertical.
- Regras do que entra no site: publicado sempre; rascunho só com `anunciarEmPreparacao`; destaques no máximo 3.
- Server Actions com o Payload mockado (padrão `painelCmsEscrita`), incluindo o gate de perfil.
- Seed idempotente.

Sem Playwright novo.

## 11. Entrega

Branch `feat/cms-conteudos-editoriais`, commits pequenos em português (§7.2). `payload:generate` rodado. `pnpm lint`, `typecheck`, `test` e `build` verdes com o dev parado.

**Checkpoint visual (§6), com o dev no ar:**
1. Painel → Conteúdos: os 9 rascunhos aparecem com situação "Em preparação".
2. Novo conteúdo: título, lide, corpo com `##`, `**negrito**`, link e lista; a pré-visualização acompanha; salvar rascunho.
3. Publicar: situação muda; `/conteudos` mostra o card com data real e link.
4. Abrir a página de leitura: hero, corpo formatado, assinatura, "Leia também", CTA.
5. Um rascunho com "Anunciar em preparação" desmarcado **não** aparece no site.
6. Despublicar: o card sai do site; a URL responde 404.
7. Desktop 1440 e mobile 375 da biblioteca e da página de leitura, comparados com `28_Pagina_Conteudos_v1.html`.

Divergências são reportadas ao PO antes de declarar a sessão concluída.
