# Programas lidos do CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O site passa a montar `/programas/[slug]` (e as listas e menus de programas) a partir da coleção `programas` do CMS. As 15 páginas ficam idênticas, programa novo publicado no painel ganha página sem deploy, e o Catálogo sai do CRM para o módulo Site.

**Architecture:** A página aprovada (`page.tsx`) continua recebendo um `ConteudoPrograma` e não muda de JSX. Quem muda é a origem: um adaptador puro em `@ntc/lib` (`camposParaPagina`) monta o `ConteudoPrograma` a partir dos campos do CMS. O que é igual nos 15 programas (rótulos, eyebrows, âncoras, CTAs) vira **molde** no adaptador, com `{SIGLA}`/`{slug}`/contagens interpoladas; o que varia vira **campo** no CMS. A fidelidade é provada por um teste de ida e volta puro: `camposParaPagina(paginaParaCampos(estatico)) == estatico` para os 15, sem banco.

**Tech Stack:** Next.js 15 (web) / 16 (cms), Payload 3.90.2 + Postgres, Vitest, TypeScript strict, Node ≥ 22.18.

**Spec:** `docs/superpowers/specs/2026-11-05-programas-lidos-do-cms-design.md` (ler inteiro antes da Task 1).

## Global Constraints

- Nenhum campo novo `required: true` (vira `NOT NULL` no drizzle — CLAUDE.md v3.1).
- Campos que a proposta já lê não mudam de nome nem de tipo: `programas.visaoGeral/problema/objetivo/publicoAlvo/metodologia`, `eixosTematicos`, `diferenciais`, `resultadosEsperados`, `modulos.ementa`.
- `payload:push:schema` é do PO, dev parado, diff lido antes; qualquer `DROP` ou `DISABLE ROW LEVEL SECURITY` é `N`; `manterRlsLigado` nunca sai.
- Scripts `payload run`: `await main()` de topo, nunca `void main()` (sai 0 sem rodar sob 3.90).
- `payload run` regenera `packages/types/src/payload-types.ts` sem formatar: depois de rodar script, `git checkout packages/types` se o diff não for intencional.
- Sem dependência nova. Sem componente novo na UI pública (CLAUDE.md §5.1).
- Todo texto do painel que vai a `dangerouslySetInnerHTML` é escapado; só `<strong>`/`<em>` passam (marcação leve `**x**`/`*x*`).
- Link digitado no painel só aceita `/`, `#`, `http(s)://`, `mailto:` (reusar `ctaHrefPermitido` de `apps/cms/src/lib/cms/cardsCorpoDocente.ts`, movendo-o para `@ntc/lib` se o site precisar).
- `pnpm build` só com o dev parado (o build corrompe o `.next` do dev); apagar os `.next` depois.
- Commits em português, Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Texto do painel com `<`, `&`, `*` solto ou `<script>`** → aparece literal na página, nunca vira HTML. Teste em Task 2 (`marcacaoParaHtml`).
2. **Programa sem nenhum evento ativo, ou com evento sem `dataFim`** → bloco Módulos abertos omitido / data de início usada; nada quebra. Testes em Task 7.
3. **Programa em rascunho ou slug inexistente** → 404 no site, nunca a versão rascunho. Teste em Task 6.
4. **Evento que termina hoje** (fuso de Brasília) → ainda conta como ativo. Teste em Task 7.
5. **Programa novo publicado só com o mínimo** (sem docentes, sem cards de modalidade, sem FAQ) → a página renderiza sem essas seções, sem erro. Teste em Task 4 (adaptador com campos mínimos) e Task 10 (lista de faltas do Publicar).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `packages/lib/src/programas/tipos.ts` (novo) | `ConteudoPrograma` e subtipos, movidos de `conteudoIndex.ts`; `CamposPaginaPrograma`, `PaginaPrograma`, `ModuloPrograma` |
| `packages/lib/src/programas/marcacaoLeve.ts` (novo) | `marcacaoParaHtml`, `htmlInlineParaMarcacao` |
| `packages/lib/src/programas/paragrafos.ts` (novo) | `paragrafosParaHtml`, `textoDoLexical` — Lexical → `<p>` da página |
| `packages/lib/src/programas/molde.ts` (novo) | constantes do molde e interpolação |
| `packages/lib/src/programas/paginaPrograma.ts` (novo) | `camposParaPagina` (o adaptador) |
| `packages/lib/src/programas/modulosAbertos.ts` (novo) | `montarModulosAbertos`, `statusDosModulos` a partir de eventos |
| `packages/lib/src/programas/romanos.ts` (novo) | `inteiroParaRomano` (I–XX) |
| `scripts/gerar-instantaneo-paginas-programas.mjs` (novo) | emite `apps/cms/src/seed/assets/paginas-programas.json` |
| `apps/cms/src/lib/cms/importacaoProgramas/paginaParaCampos.ts` (novo) | estático → `CamposPaginaPrograma` (usado pela carga e pelo teste de ida e volta) |
| `apps/cms/src/lib/cms/importacaoProgramas/comporTextos.ts` (novo) | `comporProblema`, `comporPublicoAlvo`, `comporEmenta` para a proposta |
| `apps/cms/src/seed/carregarPaginasProgramas.ts` (novo) | script de carga dos 15 |
| `apps/cms/src/collections/Programas.ts`, `Modulos.ts` | aba "Página do site", `topicos` |
| `apps/web/lib/cms/programas.ts` (novo) | loader: Payload → `CamposPaginaPrograma` → `ConteudoPrograma` |
| `apps/web/app/(programas)/programas/[slug]/page.tsx` | troca só a origem dos dados |
| `apps/cms/src/app/(painel)/TelaProgramas.tsx` etc. | telas movidas de `crm/` |

---

### Task 1: Instantâneo das páginas e tipos em `@ntc/lib`

**Files:**
- Create: `packages/lib/src/programas/tipos.ts`
- Modify: `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts` (tipos viram re-export de `@ntc/lib`)
- Modify: `packages/lib/src/index.ts` (exportar `./programas/*`)
- Create: `scripts/gerar-instantaneo-paginas-programas.mjs`
- Create: `apps/cms/src/seed/assets/paginas-programas.json` (gerado, versionado)
- Modify: `package.json` raiz (script `programas:instantaneo-paginas`)

**Interfaces:**
- Produces: `ConteudoPrograma` (e `Vertical`, `Modulo`, `DocentesRich`, `ModulosAbertosRich`, `EventoFeature`, `EventoMini`, `CoordenacaoDocente`, `EspecialistaDocente` … — os mesmos nomes de hoje) exportados de `@ntc/lib`. O JSON tem a forma `{ geradoEm: string; programas: ConteudoPrograma[] }`, na ordem de `PROGRAMAS`.

- [ ] **Step 1:** Mover as interfaces de `conteudoIndex.ts` (linhas 12–212) para `packages/lib/src/programas/tipos.ts` sem alterar nomes nem campos; em `conteudoIndex.ts` deixar `export type { … } from "@ntc/lib"` com os mesmos nomes.
- [ ] **Step 2:** `pnpm typecheck` — Expected: 5/5 verdes (nada muda de comportamento).
- [ ] **Step 3:** Escrever `scripts/gerar-instantaneo-paginas-programas.mjs` no padrão de `scripts/gerar-instantaneo-programas.mjs` (mesma guarda de versão do Node; importar **cada** `conteudo<SIGLA>.ts` direto, não o índice — o índice tem imports sem extensão que o Node não resolve). Grava o JSON com `JSON.stringify(…, null, 2)`.
- [ ] **Step 4:** `pnpm programas:instantaneo-paginas` — Expected: arquivo com 15 programas; `node -e` confirmando `programas.length === 15` e `programas.map(p=>p.modulos.itens.length)` = 8,8,8,4,8,8,8,6,8,8,8,8,8,8,6 na ordem AGIP…VIVAESCOLA.
- [ ] **Step 5:** Commit `chore(programas): instantâneo das 15 páginas e tipos em @ntc/lib`.

### Task 2: Marcação leve, parágrafos e romanos (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/programas/marcacaoLeve.ts`, `paragrafos.ts`, `romanos.ts` + `.test.ts` de cada

**Interfaces:**
- Produces:
  - `marcacaoParaHtml(texto: string): string` — escapa `&`, `<`, `>` (aspas **não**, para bater com o texto original), depois `**x**`→`<strong>x</strong>`, `*x*`→`<em>x</em>`. Asterisco sem par fica literal.
  - `htmlInlineParaMarcacao(html: string): { texto: string; tagsDesconhecidas: string[] }` — inverso; decodifica `&amp; &lt; &gt; &quot; &#39;`; qualquer tag além de `strong`/`em` vai para `tagsDesconhecidas` (texto interno preservado).
  - `paragrafosParaHtml(doc: unknown, opcoes?: { classePrimeiro?: string }): string` — um `<p>` por nó `paragraph` do Lexical, `class="…"` só no primeiro quando pedido; texto com `format & 1` → `<strong>`, `format & 2` → `<em>`; texto escapado como em `marcacaoParaHtml`; nós de lista ignorados; documento vazio/nulo → `""`.
  - `textoDoLexical(doc: unknown): string` — texto puro de todos os parágrafos, unidos por `\n\n`.
  - `inteiroParaRomano(n: number): string` — 1..20; fora disso lança `RangeError`.

- [ ] **Step 1: testes**
  - `marcacaoParaHtml("Leve o *EDUTEC* para a sua rede.")` → `"Leve o <em>EDUTEC</em> para a sua rede."`
  - `marcacaoParaHtml("**Lei 14.133/2021** em vigor")` → `"<strong>Lei 14.133/2021</strong> em vigor"`
  - `marcacaoParaHtml("<script>alert(1)</script> & 5 * 3")` → `"&lt;script&gt;alert(1)&lt;/script&gt; &amp; 5 * 3"` (Review Focus 1)
  - `htmlInlineParaMarcacao("Estrutura modular · <em>8 módulos</em>").texto` → `"Estrutura modular · *8 módulos*"`; com `<a href>` → `tagsDesconhecidas: ["a"]`
  - **Ida e volta nos 15:** para toda string do `paginas-programas.json` cujo nome de campo termina em `Html` e só contém `strong`/`em` (títulos, `metaHtml`, `destaqueHtml`), `marcacaoParaHtml(htmlInlineParaMarcacao(x).texto) === x`. O teste lê o JSON de `apps/cms/src/seed/assets/` por caminho relativo ao arquivo de teste.
  - `paragrafosParaHtml` com um documento Lexical de 2 parágrafos (o segundo com um texto `format: 1`) e `classePrimeiro: "lede-block"` → `'<p class="lede-block">A</p><p>B <strong>C</strong></p>'`.
  - `inteiroParaRomano(4)` → `"IV"`, `(8)` → `"VIII"`, `(0)` lança.
- [ ] **Step 2:** `pnpm --filter @ntc/lib test -- programas` — Expected: FAIL (módulos não existem).
- [ ] **Step 3:** Implementar as cinco funções.
- [ ] **Step 4:** `pnpm --filter @ntc/lib test -- programas` — Expected: PASS. Se a ida e volta falhar só por entidade (`&` cru no original vs `&amp;`), parar e relatar ao coordenador com o exemplo — não normalizar em silêncio.
- [ ] **Step 5:** Commit `feat(programas): marcação leve e serialização de parágrafos para a página`.

### Task 3: Schema — aba "Página do site" e `topicos` do módulo

**Files:**
- Modify: `apps/cms/src/collections/Programas.ts`, `apps/cms/src/collections/Modulos.ts`
- Modify: `packages/types/src/payload-types.ts` (via `pnpm --filter @ntc/cms payload:generate`)
- Test: `apps/cms/src/collections/Programas.pagina.test.ts`

**Interfaces:**
- Produces (todos opcionais, dentro de um `group` `pagina` numa aba nova "Página do site" de `programas`):
  - `identidadeVisual`: select, opções `vertente` + `AGIP EDUTEC EGIDE FUTURA LIDERA PEAR PEI PINEI PROAPS PROGE PROGIR PROSUS SIGA SIGS VIVAESCOLA`, default `vertente`
  - `heroTitulo` (text, marcação leve), `heroSubtitulo` (textarea), `heroImagem` (upload `media`), `heroImagemCaminho` (text — caminho em `/img/…`, usado pelos 15)
  - `barraDados[]` {`rotulo`, `valor`, `valorSub`}
  - `visaoGeralTitulo`, `problemaTitulo`, `problemaDestaque` (text, marcação leve)
  - `publicoChips[]` {`texto`}
  - `docentes` (group): `titulo`, `intro` (marcação), `coordenacaoMarcador`, `especialistasMarcador`, `contadores[]` {`num`,`lbl`}, `nota`, `coordenacao[]` {`tag`,`imagem` (upload),`imagemCaminho`,`imagemAlt`,`eixoBadge`,`nome`,`credencial`,`eixo`,`modulos`}, `especialistas[]` {`imagem`,`imagemCaminho`,`imagemAlt`,`eixoBadge`,`nome`,`credencial`,`modulos`}
  - `modalidadesIntro` (textarea), `modalidadesCards[]` {`destaque` checkbox, `tag`, `titulo`, `descricao`, `ctaRotulo`, `ctaHref`}
  - `modulosAbertosMicrocopy` (textarea)
  - `chamadaFinalTitulo` (marcação), `chamadaFinalTexto` (textarea)
  - `resumoLateral[]` {`rotulo`,`valor`}, `entregas[]` {`texto`}
  - `cartao` (group, para listas e menus — Task 9): `nome`, `tagline`, `meta`, `imagem` (upload), `imagemCaminho`, `ordem` (number)
- `modulos`: `topicos[]` {`texto`} (opcional).

- [ ] **Step 1: teste** — `Programas.pagina.test.ts`: percorre `Programas.fields` e `Modulos.fields` e afirma que nenhum campo dentro de `pagina`, nem `topicos`, tem `required: true`; e que `pagina.identidadeVisual.defaultValue === "vertente"`.
- [ ] **Step 2:** rodar — Expected: FAIL.
- [ ] **Step 3:** Adicionar os campos; aplicar `ctaHrefPermitido` como `validate` de `modalidadesCards.ctaHref`.
- [ ] **Step 4:** `pnpm --filter @ntc/cms test -- Programas.pagina` PASS; `pnpm --filter @ntc/cms payload:generate`; `pnpm typecheck` verde.
- [ ] **Step 5:** Commit `feat(cms): campos da página do programa e tópicos do módulo`.
- [ ] **Step 6: PARADA DO PO — `payload:push:schema`.** Relatar ao coordenador: diff esperado = tabelas de array novas (`programas_pagina_*`, `modulos_topicos`, e as `_v` correspondentes de `programas`, que tem drafts), colunas `pagina_*`/`cartao_*` em `programas` e `_programas_v`, enum da `identidadeVisual`, mais o drift recorrente. As Tasks 4, 5, 7 e 8 não dependem do banco e seguem; a Task 6 (dry-run) espera o push.

### Task 4: Adaptador `camposParaPagina` + ida e volta dos 15

**Files:**
- Create: `packages/lib/src/programas/molde.ts`, `paginaPrograma.ts` (+ `paginaPrograma.test.ts` com o caso mínimo)
- Create: `apps/cms/src/lib/cms/importacaoProgramas/paginaParaCampos.ts`
- Test: `apps/cms/src/lib/cms/importacaoProgramas/paginaParaCampos.test.ts` (a ida e volta)

**Interfaces:**
- Consumes: Task 1 (tipos, JSON), Task 2 (funções).
- Produces (em `tipos.ts`):
```ts
export interface ModuloPrograma { numero: number; titulo: string; descricao: unknown /* Lexical */; topicos: string[]; cargaHoraria: string; }
export interface CamposPaginaPrograma {
  sigla: string; slug: string; nomeCompleto: string; vertical: Vertical;
  cargaHorariaTotal: string;            // "64 horas"
  visaoGeral: unknown; problema: unknown; objetivo: unknown | null; publicoAlvo: unknown; // Lexical, só a parte da página
  eixos: { titulo: string; descricao: string }[];
  resultados: string[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: unknown }[];
  modulos: ModuloPrograma[];            // ordenados por numero
  pagina: PaginaPrograma;               // espelha o group `pagina` da Task 3, com imagens já resolvidas para URL (`heroImagem: string`, `imgSrc: string`) e listas achatadas (`publicoChips: string[]`, `entregas: string[]`)
}
export interface ExtrasEventos { modulosAbertos: Pick<ModulosAbertosRich, "feature" | "miniStack">; status: Map<number, { rotulo: string; tipo: "aberto" | "breve" }>; }
```
  - `camposParaPagina(c: CamposPaginaPrograma, extras: ExtrasEventos): ConteudoPrograma` em `paginaPrograma.ts`.
  - `paginaParaCampos(p: ConteudoPrograma): { campos: CamposPaginaPrograma; avisos: string[] }` em `paginaParaCampos.ts` (cms) — usa `htmlParaLexical` do cms para os corpos, `htmlInlineParaMarcacao` para títulos, `extrairCartoesDeResultado` para `resultados`, `romanoParaInteiro` para `numero`.

Regras do adaptador (o molde vem da análise dos 15, feita em 05/11):
- **Molde (constante nos 15, depois de trocar sigla/slug/nome):** `hero.eyebrow`, `hero.ctas` (2, hrefs com `{slug}`), `hero.stats[].lbl`, `navAnchors` (10), todos os `eyebrow`, os títulos de `objetivoGeral`/`publico`/`eixos`/`resultados`/`diferenciais`/`modalidades`/`modulosAbertos` (com `{SIGLA}`), `detalhamento.eyebrow/titulo/intro`, `docentes.eyebrow/pill/ctaPrimario/ctaSecundario`, `modulosAbertos.corpoHtml/bottomCtas/feature.badge/ctaPrimario/ctaSecundario/miniStack[].ctaRotulo`, `faq.eyebrow/titulo`, `ctaFinal.eyebrow`, `sidebar.titulo/entregasTitulo`, `detalhamento.itens[].ctaInscricao = true`. Copiar os valores exatos do JSON para `molde.ts`.
- **Derivados:** `siglaExibida = sigla = breadcrumb.current = c.sigla`; `siglaCss` = `pagina.identidadeVisual` se não for `vertente`, senão a sigla do programa-modelo da vertente (Task 8); `verticalRotulo` = `NTC Educação`/`NTC Gestão Pública`/`NTC Saúde`; `hero.stats` = [nº de módulos, carga em `"64h"` a partir de `"64 horas"`, nº de eixos]; `modulos.titulo/tituloHtml/intro` por nº de módulos, horas por módulo e total; todo `titulo` = `tituloHtml` sem tags; `numero` romano; `modulos.itens[].descricao` = `textoDoLexical(m.descricao)`; `faq.resposta` = `textoDoLexical`.
- **HTML dos corpos:** `visaoGeral` = `paragrafosParaHtml(…, { classePrimeiro: "lede-block" })`; `objetivoGeral` idem; `problema`/`publico` sem classe; `resultados.corpoHtml` = `<div class="results-grid">` + um `<div class="result-card"><span class="r-num">01</span><p>texto</p></div>` por item; `modalidades.corpoHtml` = `<p>intro</p><div class="modes-grid">` + `<article class="mode-card-prog[ featured]"><span class="tag">…</span><h4>…</h4><p>…</p><a class="cta" href="…">…</a></article>` por card + `</div>` — copiar a indentação/quebras exatas do JSON (o teste compara string).
- **Opcionais:** sem `docentes.coordenacao` e `especialistas` → `docentes` só com os campos de cabeçalho; sem `modalidadesCards` → só o `<p>`; sem `detalhamento` itens → `detalhamento` omitido; sem `ctaFinal`/`sidebar` preenchidos → omitidos; `objetivo` nulo → `objetivoGeral` omitido.

- [ ] **Step 1: teste de ida e volta (cms)** — para cada `p` do JSON: `const extras = { modulosAbertos: { feature: p.modulosAbertos.feature, miniStack: p.modulosAbertos.miniStack }, status: mapa de p.modulos.itens }`; `expect(camposParaPagina(paginaParaCampos(p).campos, extras)).toEqual(p)` e `expect(paginaParaCampos(p).avisos).toEqual([])`. Um `it` por slug, para o relatório apontar qual programa diverge.
- [ ] **Step 2: teste mínimo (lib)** — `camposParaPagina` com `pagina` vazia (arrays vazios, strings vazias), 1 módulo, sem objetivo, extras vazios: não lança; `docentes.coordenacao` e `especialistas` vazios; `objetivoGeral` `undefined`; `ctaFinal` e `sidebar` `undefined` (Review Focus 5).
- [ ] **Step 3:** rodar — FAIL.
- [ ] **Step 4:** Implementar `molde.ts`, `camposParaPagina`, `paginaParaCampos`.
- [ ] **Step 5:** rodar — PASS nos 15 e no mínimo. Se um campo listado como molde divergir num programa, ele vira campo em `pagina` (atualizar Task 3 e relatar), nunca um `if` por sigla.
- [ ] **Step 6:** Commit `feat(programas): adaptador da página a partir dos campos do CMS`.

### Task 5: Textos da proposta montados a partir das partes

**Files:**
- Create: `apps/cms/src/lib/cms/importacaoProgramas/comporTextos.ts` + `.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts` (`textosDoPrograma` ~l.337; ementa em ~l.441 e ~l.530)
- Modify: o leitor do programa usado nessas funções, para trazer `pagina.problemaDestaque`, `pagina.publicoChips` e `modulos.topicos`

**Interfaces:**
- Produces: `comporProblema(problema: unknown, destaque: string): unknown`, `comporPublicoAlvo(publico: unknown, chips: string[]): unknown`, `comporEmenta(descricao: unknown, topicos: string[]): unknown` — devolvem Lexical.

- [ ] **Step 1: teste** — para cada programa de `seed/assets/programas.json` (o instantâneo de 30/09) e seu par em `paginas-programas.json`: `comporPublicoAlvo(campos.publicoAlvo, campos.pagina.publicoChips)` `toEqual` `mapearPrograma(p30).campos.publicoAlvo`; idem `comporProblema` vs `.problema` e `comporEmenta` vs cada `modulos[i].ementa`. Isto prova que a proposta nova sai igual à de hoje.
- [ ] **Step 2:** rodar — FAIL.
- [ ] **Step 3:** Implementar (ler `mapear.ts` e `scripts/gerar-instantaneo-programas.mjs` para ver como o destaque entrou no `problema` em 30/09). Trocar em `painelCrmEscrita.ts` `programa.problema` → `comporProblema(…)`, `programa.publicoAlvo` → `comporPublicoAlvo(…)`, `m.ementa` → `comporEmenta(…)`. Programa sem as partes novas (antes da carga) → `compor*` devolve o documento original intacto.
- [ ] **Step 4:** `pnpm --filter @ntc/cms test` — PASS, inclusive os testes de proposta existentes.
- [ ] **Step 5:** Commit `refactor(crm): proposta monta problema, público e ementa a partir das partes`.

### Task 6: Script de carga dos 15 programas

**Files:**
- Create: `apps/cms/src/seed/carregarPaginasProgramas.ts`, `apps/cms/src/lib/cms/importacaoProgramas/planejarCargaPaginas.ts` + `.test.ts`
- Modify: `apps/cms/package.json` (script `programas:carregar-paginas`), `apps/cms/src/seed/execucaoScriptsPayloadRun.test.ts` (incluir o script novo na guarda de `void main()`)

**Interfaces:**
- Consumes: `paginaParaCampos` (Task 4).
- Produces: `planejarCargaPaginas(atual: { sigla: string; visaoGeral: unknown; problema: unknown; objetivo: unknown; publicoAlvo: unknown; eixos; resultados; diferenciais; faq; modulos: { numero: number; ementa: unknown }[] } | null, estatico: ConteudoPrograma): { acao: "atualizar" | "divergente" | "sem-programa"; divergencias: string[]; dados: … }`.

Regras:
- Casar por `sigla` (PROAPS+ e PROSUS+ com `+`); nunca criar programa.
- **Divergência** = um campo que já existe no CMS cujo HTML (`lexicalParaHtmlEditorial` dos dois lados, ou igualdade de texto nos arrays) difere do que o estático produz **composto** (Task 5). Campo divergente **não** é escrito; o programa sai como `divergente` com a lista, e o script termina com código ≠ 0 se houver qualquer divergente.
- Sem divergência: grava os campos da página, divide `problema`/`publicoAlvo`/`ementa` (parte da página + `problemaDestaque`/`publicoChips`/`topicos`), grava `pagina.identidadeVisual = siglaCss` do estático, `cartao.*` (Task 9 preenche o instantâneo; até lá vazio) e publica (`_status: "published"`).
- Dry-run por padrão; `PROGRAMAS_CARREGAR_APLICAR=1` aplica. `await main()` de topo.
- Idempotente: segunda execução não encontra nada a mudar (relatório "sem mudanças").

- [ ] **Step 1: testes de `planejarCargaPaginas`** — (a) atual igual ao estático composto → `atualizar`, `divergencias: []`; (b) `visaoGeral` do atual com uma palavra trocada → `divergente`, `divergencias: ["visaoGeral"]`; (c) `atual = null` → `sem-programa`; (d) aplicar o plano ao atual e planejar de novo → nenhum campo a mudar.
- [ ] **Step 2:** rodar — FAIL. **Step 3:** implementar planejador e script. **Step 4:** PASS.
- [ ] **Step 5:** Depois do push do PO (Task 3, Step 6): `pnpm --filter @ntc/cms programas:carregar-paginas` (dry-run) — Expected: 15 linhas, 0 `sem-programa`. **Divergentes vão ao PO antes de aplicar**; aplicar só com ordem dele. Depois de aplicar, rodar de novo: "sem mudanças" nos 15. `git checkout packages/types` se o `payload run` mexeu nos tipos.
- [ ] **Step 6:** Commit `feat(seed): carga das páginas dos 15 programas no CMS`.

### Task 7: Módulos abertos a partir dos eventos

**Files:**
- Create: `packages/lib/src/programas/modulosAbertos.ts` + `.test.ts`

**Interfaces:**
- Produces:
```ts
export interface EventoDoPrograma { slug: string; titulo: string; dataInicio: string; dataFim: string | null; modalidade: string; capaUrl: string | null; moduloNumero: number | null; }
export function eventoAtivo(e: EventoDoPrograma, agora: Date): boolean;
export function montarExtrasEventos(eventos: EventoDoPrograma[], agora: Date, contexto: { vertical: Vertical; imagemVertente: string }): ExtrasEventos;
```
- Regras: ativo = `dataFim ?? dataInicio` ≥ hoje no fuso `America/Sao_Paulo` (comparar datas `YYYY-MM-DD`); destaque = o ativo mais próximo; `miniStack` = os demais ativos por data, no máximo 3 (os 15 mostram 3); `dataLabel` = `{ dias: "19–20", mesAno: "Jun · 2026" }` no formato do JSON (dia único → `"19"`); imagem = `capaUrl ?? imagemVertente`; o CTA leva a `/agenda/<slug>`; `status` = `{ rotulo: "Inscrições abertas", tipo: "aberto" }` para todo `moduloNumero` com evento ativo; módulo sem evento ativo **não** entra no mapa (sem selo). Sem evento ativo → `feature: undefined`, `miniStack: []`, e o adaptador omite a seção inteira (ajustar `camposParaPagina`: `modulosAbertos` só existe se houver `feature`; tornar o campo opcional no tipo e conferir que `page.tsx` já trata a ausência — se não tratar, o único ajuste permitido no JSX é o guarda `p.modulosAbertos && …`).
- Campos de texto do feature/mini que hoje não existem no evento (`binding`, `metas`, `eyebrow`, `metaHtml`) — montar a partir de modalidade/datas/carga; o formato exato é chamada do implementer, mostrado ao PO no checkpoint.

- [ ] **Step 1: testes** — evento que termina hoje às 23h de Brasília com `agora` = hoje 22h UTC-3 → ativo (Review Focus 4); evento de ontem → inativo; `dataFim: null` e `dataInicio` amanhã → ativo (Review Focus 2); 0 eventos → `feature` undefined e `status` vazio; 5 ativos → destaque = o mais cedo, `miniStack.length === 3`; `dias` de `2026-06-19`..`2026-06-20` → `"19–20"`, `mesAno` → `"Jun · 2026"`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(programas): módulos abertos e selo dos módulos a partir dos eventos`.

### Task 8: Site lê do CMS (página do programa + identidade da vertente)

**Files:**
- Create: `apps/web/lib/cms/programas.ts` + `programas.test.ts`
- Modify: `apps/web/app/(programas)/programas/[slug]/page.tsx` (origem dos dados, `generateStaticParams`, `dynamicParams = true`, `generateMetadata`, `calcularRelacionados`)
- Modify: `apps/web/app/programas-prototipo.css` (bloco por vertente)
- Modify: `apps/web/app/api/revalidate/route.ts` só se precisar aceitar os paths novos

**Interfaces:**
- Consumes: Tasks 4 e 7.
- Produces: `buscarProgramaPublicado(slug: string): Promise<ConteudoPrograma | null>`, `listarProgramasPublicados(): Promise<CamposPaginaPrograma[]>` (ordem `cartao.ordem`, depois sigla), `docParaCampos(doc: Programa, modulos: Modulo[]): CamposPaginaPrograma` (puro), `relacionadosDe(slug: string, todos: CamposPaginaPrograma[]): RelacionadoPrograma[]` (mesma regra de hoje: mesma vertente, outro slug, até 3, na ordem da lista).

Regras:
- Ler com a Local API, `_status = published` (nunca `draft: true`), `depth` 1 para `area`, `media` e `modulos` (buscar `modulos` por `programa` à parte, ordenados por `numero`). Eventos: publicados com `programa` igual, convertidos para `EventoDoPrograma`.
- Imagem: `heroImagem` (media) tem prioridade sobre `heroImagemCaminho`; mesma regra para docentes e cartão.
- `programa-modelo` da vertente (identidade "vertente"): Educação → `EDUTEC`, Gestão Pública → `AGIP`, Saúde → `PROSUS` (chamada do coordenador; o PO confirma no checkpoint). Implementação: `siglaCss` recebe a sigla do modelo, então o CSS existente já aplica — **sem CSS novo**. Se o PO escolher outro modelo, muda só a tabela.
- `page.tsx`: única mudança é a origem (`PROGRAMAS[slug]` → `await buscarProgramaPublicado(slug)`, `notFound()` se `null`) e os helpers; o JSX fica igual.
- Falha do banco: o loader **lança** (Next mantém a última versão gerada por ISR; não mascarar como 404).

- [ ] **Step 1: testes (`programas.test.ts`, Payload simulado como nos testes de `lib/cms/eventos`)** — rascunho não é devolvido (`buscarProgramaPublicado` consulta com `_status: { equals: "published" }`) (Review Focus 3); slug desconhecido → `null`; `docParaCampos` de um doc com `heroImagem` media e `heroImagemCaminho` → usa a URL da media; `relacionadosDe` com 4 da mesma vertente → 3, sem o próprio.
- [ ] **Step 2:** FAIL. **Step 3:** implementar loader e trocar `page.tsx`. **Step 4:** PASS; `pnpm typecheck` verde.
- [ ] **Step 5:** Commit `feat(web): página do programa lida do CMS`.

### Task 9: Listas e menus lidos do CMS

**Files:**
- Modify: `apps/web/app/(home)/HeaderHome.tsx`, `apps/web/app/(home)/conteudoFallback.ts`, `apps/web/app/(vertical)/programas/page.tsx`, `apps/web/app/(vertical)/solucoes-estrategicas/[area]/{page.tsx,conteudoFallback.ts}`, `apps/web/app/(institucional)/mapa-do-site/page.tsx`, e o que mais o Step 1 achar
- Modify: `scripts/gerar-instantaneo-paginas-programas.mjs` (inclui os cartões), `paginaParaCampos.ts`/carga (grava `cartao.*`)

**Interfaces:**
- Consumes: `listarProgramasPublicados` (Task 8).
- Produces: `cartaoDoPrograma(c: CamposPaginaPrograma): { sigla: string; slug: string; nome: string; tagline: string; meta: string; imagemSrc: string; flagAberto: boolean; vertical: Vertical }`.

Regras:
- Step 1 obrigatório: `grep -rn '/programas/' apps/web/app apps/web/components` e listar ao coordenador cada lista/menu achado, com os campos que cada uma mostra. Os textos de cartão (`nome`, `tagline`, `meta`, imagem, ordem) vêm hoje dos arquivos de fallback e **não** são iguais aos da página (ex.: cartão do EDUTEC diz "10 módulos · 80h", a página diz 8 módulos) — copiar 1:1 para `cartao.*`, sem corrigir, e listar essas divergências no relatório para o PO.
- Contagens em título ("Nove programas estratégicos", "Três programas…", "Ver todos os 15 programas") passam a ser calculadas, por extenso como hoje.
- `flagAberto` passa a vir dos eventos (há evento ativo do programa), coerente com a decisão do PO para Módulos abertos — **apontar ao PO no checkpoint como mudança visível**.
- Programa novo entra no fim da sua vertente quando `cartao.ordem` estiver vazio.

- [ ] **Step 1:** inventário (acima) — relatar antes de codar.
- [ ] **Step 2: teste** — `cartaoDoPrograma` com `cartao.ordem` vazio ordena no fim; contagem por extenso de 3 → "Três", 9 → "Nove", 15 → "Quinze" (reusar helper se existir).
- [ ] **Step 3:** FAIL. **Step 4:** implementar e trocar cada lista. **Step 5:** PASS; `pnpm typecheck`.
- [ ] **Step 6:** Commit `feat(web): listas e menus de programas lidos do CMS`.

### Task 10: Painel — Catálogo no módulo Site, campos novos, Publicar e revalidação

**Files:**
- Move: `apps/cms/src/app/(painel)/crm/{TelaProgramas,TelaModulos,DetalheProgramaCatalogo,DetalheModuloCatalogo,EditorListaCatalogo}.tsx` → `apps/cms/src/app/(painel)/`
- Modify: `(painel)/ShellCms.tsx`, `(painel)/page.tsx` (carregar dados só com a tela permitida), `(painel)/crm/ShellCrm.tsx` e `crm/page.tsx` (tirar o grupo Catálogo e a tela Produtos/Eventos), `lib/cms/telas.ts`, `acoesCatalogo.ts`, `lib/cms/catalogoCrm.ts`, `lib/cms/catalogoCrmEscrita.ts`, `packages/lib/src/crm/catalogo.ts` (faltas para publicar)
- Test: `acoesCatalogo.test.ts`, `packages/lib/src/crm/catalogo.test.ts`, `lib/cms/telas.test.ts` (ou onde as telas são testadas)

Regras:
- **Permissões:** manter os ids gravados `crm.programas`/`crm.modulos` (sem mudar o enum); em `TELAS` passar `modulo: "site"` e posicioná-las depois de "Eventos". `crm.produtos` sai do menu; o valor fica no tipo/enum (não dropar) e `capacidadesDoAcesso` deixa de oferecê-lo.
- **Detalhe do programa** ganha a aba/blocos "Página do site" na ordem da página: identidade visual, topo, barra de dados, visão geral (título), problema (título, destaque), público (chips), docentes, modalidades (cards), módulos abertos (microcopy), chamada final, resumo lateral, cartão. Campos de marcação leve com o mesmo editor de Markdown leve que o Catálogo já usa; o aviso de perda de formatação continua. **Detalhe do módulo** ganha `topicos` (lista).
- **Publicar** (`faltasParaPublicar` em `packages/lib/src/crm/catalogo.ts`, ou o nome que lá existir): além do mínimo atual, exige `area`, `pagina.heroTitulo`, `pagina.heroSubtitulo`, imagem do topo (media ou caminho), `visaoGeral`, ≥ 1 módulo, `cartao.nome`, `cartao.tagline`. Mensagens no padrão das existentes.
- **Revalidação:** salvar-publicado/publicar/excluir programa e salvar/excluir módulo pedem ao site (`POST /api/revalidate`, padrão de `revalidarLayoutDoSite` em `painelCmsEscrita.ts`) os paths `/programas/<slug>`, `/programas`, `/solucoes-estrategicas/<area>`, `/` (escopo layout, por causa do menu) e `/mapa-do-site`. Publicar/despublicar **evento** com `programa` revalida `/programas/<slug do programa>`. Falha de revalidação vira aviso, nunca erro.

- [ ] **Step 1: testes** — `faltasParaPublicar` de um programa só com o mínimo antigo devolve as faltas novas, com as mensagens exatas escolhidas; com tudo → `[]`; os 15 do JSON mapeados por `paginaParaCampos` → `[]`. Telas: `TELAS.find(t=>t.id==="crm.programas").modulo === "site"`; `crm.produtos` fora do menu. Ação de publicar chama a revalidação com `/programas/edutec` (fetch simulado).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `pnpm --filter @ntc/cms test` e `lint` — PASS, 0 erros.
- [ ] **Step 5:** Commit `feat(painel): catálogo de programas no módulo Site com os campos da página`.

### Task 11: Conferência 1:1, remoção dos arquivos estáticos e documentação

**Files:**
- Create: `scripts/conferir-paginas-programas.mjs`
- Delete: `apps/web/app/(programas)/programas/[slug]/conteudo{AGIP,…,VIVAESCOLA}.ts` (15), o objeto `PROGRAMAS`/`SLUGS_VALIDOS`/`calcularRelacionados` de `conteudoIndex.ts` (fica só o re-export de tipos), e os cartões duplicados dos fallbacks já trocados na Task 9
- Modify: `CLAUDE.md` (entrada v4.0 no histórico, §19.1/§19.2/§19.3)

- [ ] **Step 1:** Escrever o conferidor: recebe duas URLs-base (`ANTES` = produção, ainda estática; `DEPOIS` = `http://localhost:3000` lendo do CMS), baixa `/programas/<slug>` dos 15 e as páginas de lista da Task 9, extrai `<main>…</main>`, remove a seção `#modulos-abertos` e os selos de status de módulo (e o `flagAberto` dos cartões), normaliza espaços e imprime o diff por página. Saída 0 só com 15+N páginas sem diferença.
- [ ] **Step 2:** Com o dev do web no ar e o banco carregado: rodar — Expected: zero diferença. Cada diferença restante vai ao coordenador com o trecho; nada é "aceito" sem o PO.
- [ ] **Step 3:** Apagar os arquivos estáticos; `grep -rn "conteudoIndex\|PROGRAMAS\b" apps/web` só encontra o re-export de tipos.
- [ ] **Step 4:** Gates com o dev parado: `pnpm lint` (0 erros), `pnpm typecheck` (5/5), `pnpm test`, `pnpm build --force`; apagar os `.next`. Rodar o conferidor de novo depois de subir o dev — zero diferença.
- [ ] **Step 5:** Atualizar `CLAUDE.md`: v4.0 com o que mudou, a ordem do PO (push → carga dry-run → divergências → aplicar → conferência → deploy; **código não vai a produção antes do push e da carga**, senão o site perde as páginas de programa), as chamadas tomadas (modelos de vertente EDUTEC/AGIP/PROSUS, `flagAberto` por eventos, ids de tela mantidos, formato do feature de eventos) e as divergências de cartão listadas na Task 9.
- [ ] **Step 6:** Commit `chore(programas): remove o conteúdo estático das páginas de programa e documenta a virada`.
- [ ] **Step 7: Checkpoint do PO** — roteiro: (1) as 15 páginas e as listas em desktop 1440 / mobile 375; (2) Módulos abertos e selos com eventos reais; (3) Site → Programas → criar programa novo de Saúde em rascunho → não aparece no site; preencher o mínimo → Publicar → página no ar sem deploy, no fim da lista da vertente, com a identidade da vertente; (4) editar o título do topo de um programa publicado → site atualiza; (5) CRM → menu sem Catálogo; nova proposta continua listando os programas e sai com o mesmo conteúdo pré-preenchido de antes.
