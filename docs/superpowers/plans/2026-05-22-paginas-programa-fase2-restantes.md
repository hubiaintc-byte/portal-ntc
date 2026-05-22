# Páginas de Programa — Fase 2 (14 programas restantes) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar os 14 programas restantes (EDUTEC, PEAR, PEI, PROGIR, PROGE, EGIDE, VIVAESCOLA, PINEI, FUTURA, AGIP, SIGA, SIGS, PROAPS+, PROSUS+) seguindo o template do LIDERA já aprovado. Cada programa vira um `conteudo<SIGLA>.ts` registrado em `conteudoIndex.ts`, com extração 1:1 do HTML.

**Architecture:** Andaime, CSS, Client Components e `page.tsx` da Fase 1 já cobrem todas as seções do tipo `ConteudoPrograma`. A Fase 2 é puramente conteúdo — cada programa gera **um arquivo novo** + duas linhas alteradas no índice. Checkpoint visual humano a cada 3 programas, para detectar cedo qualquer divergência.

**Tech Stack:** TypeScript strict. Sem testes automatizados nesta fase (porta de conteúdo estático — validação é visual humana, conforme `feedback_validacao_visual`).

**Spec:** `docs/superpowers/specs/2026-05-22-paginas-programa-design.md` §10 (Fase 2).
**Plano da Fase 1 (referência):** `docs/superpowers/plans/2026-05-22-paginas-programa-fase1-lidera.md`.
**Template canônico:** `apps/web/app/(programas)/programas/[slug]/conteudoLIDERA.ts` (576 linhas com TODOS os campos do tipo `ConteudoPrograma` preenchidos).

---

## Pré-requisitos (todos confirmados pela Fase 1)

- 15 protótipos HTML em `/Users/joao/Documents/portal-ntc/` (incluindo AGIP movido do Downloads).
- Tipo `ConteudoPrograma` em `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts` cobre 100% das seções editoriais do LIDERA.
- `page.tsx` da rota dinâmica renderiza todas as seções condicionalmente; campos opcionais (`objetivoGeral`, `detalhamento`, `diferenciais`, `ctaFinal`, `sidebar`, `tituloHtml`, `intro`) são honrados.
- `programas-prototipo.css` aplica cromatismo por `data-programa="SIGLA"` — `LIDERA`, `EDUTEC`, `SIGS`, `PROAPS+`, `PROSUS+` etc. já têm seletores no CSS (linha ~2549–2675 do CSS).

## Lições da Fase 1 (aplicar a cada programa)

Ver memória `feedback_porta_html_fidelidade.md`. Resumo:

1. **Ler o `<main>` inteiro do HTML antes de modelar** — não inferir a partir de um trecho.
2. **Cada `<article class="prog-section">` vira um campo do tipo**, mesmo sem `id=`.
3. **Modificadores CSS importam** — `.featured`, `.is-active`, `.prog-nav-inner`, `.aberto`/`.breve`, etc.
4. **Títulos com `<em>` viram `tituloHtml`** — render via `dangerouslySetInnerHTML`. Renderização já está pronta em `page.tsx`.
5. **Chips, tabelas, accordeões, cards de evento têm markup específico** — não tentar achatar em `corpoHtml` genérico se há campo dedicado no tipo.
6. **Imagens** — usar caminho absoluto `/img/fotos/_optimized/...`. Antes de cada programa, **conferir que as imagens referenciadas pelo HTML existem em `apps/web/public/img/fotos/_optimized/`**. Lista canônica de imagens de programa: `area-{vertical}.1920.webp`, `area-{vertical}-premium.1920.webp`, `expert-01..04.1920.webp`, `autoridade-{vertical}.1920.webp`.

## Sequência canônica dos programas (mapa)

| # | HTML | Sigla | siglaCss | Slug | Vertical | verticalRotulo | data-programa |
|---|---|---|---|---|---|---|---|
| 1 | 16_..._EDUTEC | EDUTEC | EDUTEC | edutec | educacao | NTC Educação | EDUTEC |
| 2 | 15_..._PEAR | PEAR | PEAR | pear | educacao | NTC Educação | PEAR |
| 3 | 19_..._PEI | PEI | PEI | pei | educacao | NTC Educação | PEI |
| 4 | 21_..._PROGIR | PROGIR | PROGIR | progir | educacao | NTC Educação | PROGIR |
| 5 | 20_..._PROGE | PROGE | PROGE | proge | educacao | NTC Educação | PROGE |
| 6 | 13_..._EGIDE | EGIDE | EGIDE | egide | educacao | NTC Educação | EGIDE |
| 7 | 23_..._VIVAESCOLA | VIVAESCOLA | VIVAESCOLA | vivaescola | educacao | NTC Educação | VIVAESCOLA |
| 8 | 22_..._PINEI | PINEI | PINEI | pinei | educacao | NTC Educação | PINEI |
| 9 | 24_..._FUTURA | FUTURA | FUTURA | futura | educacao | NTC Educação | FUTURA |
| 10 | 06_..._AGIP | AGIP | AGIP | agip | gestao-publica | NTC Gestão Pública | AGIP |
| 11 | 11_..._SIGA | SIGA | SIGA | siga | gestao-publica | NTC Gestão Pública | SIGA |
| 12 | 14_..._SIGS | SIGS | SIGS | sigs | saude | NTC Saúde | SIGS |
| 13 | 17_..._PROAPS | PROAPS+ | PROAPS+ | proaps | saude | NTC Saúde | PROAPS+ |
| 14 | 18_..._PROSUS | PROSUS+ | PROSUS+ | prosus | saude | NTC Saúde | PROSUS+ |

Notas:
- `siglaExibida` = `siglaCss` em todos os casos (PROAPS+/PROSUS+ mantêm o `+`).
- Slug não tem `+`: PROAPS+ → `proaps`, PROSUS+ → `prosus`.
- `data-programa` mantém o `+` em PROAPS+/PROSUS+ (casa com o CSS).

---

## Procedimento padrão (aplica-se a cada programa)

Para cada programa P em uma task, o procedimento é o mesmo:

**Step P.1 — Conferir imagens necessárias**

Antes de escrever o conteúdo, abrir o HTML do programa e listar todos os `url('./img/fotos/_optimized/...')` referenciados (hero, sidebar, faculty, eventos, relacionados). Conferir que cada uma existe em `apps/web/public/img/fotos/_optimized/`. Comando exemplo:

```bash
grep -oE "\./img/fotos/_optimized/[^'\")\s]+" /Users/joao/Documents/portal-ntc/<arquivo-html> | sort -u
```

Para cada caminho que retornar, verificar existência em `apps/web/public/img/fotos/_optimized/`. Se faltar imagem, **abortar e perguntar ao usuário** — não inventar imagem alternativa.

**Step P.2 — Ler o `<main>` do HTML inteiro**

Localizar `<main id="main" class="program-page" data-programa="...">` e `</main>` (geralmente entre as linhas ~3050 e ~4090). Ler em chunks com Read (offset/limit), 200–300 linhas por vez.

**Step P.3 — Criar `conteudo<SIGLA>.ts`**

Path: `apps/web/app/(programas)/programas/[slug]/conteudo<SIGLA>.ts`. Estrutura espelhada do LIDERA. Campos obrigatórios:

```ts
import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const SIGLA: ConteudoPrograma = {
  sigla: "SIGLA",
  siglaCss: "SIGLA",          // exata, com "+" se houver
  siglaExibida: "SIGLA",      // idem
  slug: "sigla",              // minúsculo, sem "+"
  nomeCompleto: "<texto literal do hero>",
  vertical: "...",            // "educacao" | "gestao-publica" | "saude"
  verticalRotulo: "...",      // NTC Educação | NTC Gestão Pública | NTC Saúde
  breadcrumb: { current: "SIGLA" },
  hero: {
    bgSrc: `${IMG}/area-<vertical>.1920.webp`,  // confirmar no HTML qual arquivo
    eyebrow: "Programa Estratégico",
    stats: [ /* 3 itens — extrair do .prog-hero-stat do HTML */ ],
    tituloHtml: `<texto literal do h1, com <em> se houver>`,
    sub: "<texto literal do .prog-hero-sub>",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=<slug>", variante: "gold" },
      { rotulo: "Solicitar folder",   href: "/contato/proposta?programa=<slug>&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    /* 5 itens — extrair dos .prog-meta-item (label/value/value-sub) */
  ],
  navAnchors: [
    { href: "#visao-geral",     rotulo: "Visão geral" },
    { href: "#problema",        rotulo: "Problema" },
    { href: "#publico",         rotulo: "Público" },
    { href: "#eixos",           rotulo: "Eixos" },
    { href: "#modulos",         rotulo: "Módulos" },
    { href: "#resultados",      rotulo: "Resultados" },
    { href: "#docentes",        rotulo: "Corpo docente" },
    { href: "#modalidades",     rotulo: "Modalidades" },
    { href: "#modulos-abertos", rotulo: "Módulos abertos" },
    { href: "#faq",             rotulo: "FAQ" },
  ],
  visaoGeral:    { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "..." },
  problema:      { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "...", destaqueHtml: "..." /* se houver .problem-block */ },
  objetivoGeral: { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "..." } /* se o HTML tiver a seção sem âncora "Objetivo geral" */,
  publico:       { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "...", chips: [ /* itens das .audience-chips, se houver */ ] },
  eixos:         { eyebrow: "...", titulo: "...", tituloHtml: "...", itens: [ /* { titulo, descricao } por .axis-card */ ] },
  modulos:       { eyebrow: "...", titulo: "...", tituloHtml: "...", intro: "...", itens: [ /* { numero, titulo, cargaHoraria, statusRotulo, statusTipo } por linha da .modules-table */ ] },
  detalhamento:  { eyebrow: "...", titulo: "...", intro: "...", itens: [ /* { numero, titulo, cargaHoraria, descricao, topicos: string[], ctaInscricao? } por .module-detail-item */ ] } /* se o HTML tiver a seção Detalhamento */,
  resultados:    { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "..." /* .results-grid se houver */ },
  diferenciais:  { eyebrow: "...", titulo: "...", tituloHtml: "...", itens: [ /* { titulo, descricao } por .diff-item */ ] } /* se o HTML tiver a seção Diferenciais */,
  docentes:      { /* DocentesRich: eyebrow, titulo, tituloHtml, pill, introHtml, coordenacaoMarker, coordenacao[], especialistasMarker, especialistas[], counters[], nota, ctaPrimario, ctaSecundario */ },
  modalidades:   { eyebrow: "...", titulo: "...", tituloHtml: "...", corpoHtml: "..." /* tem .modes-grid com 4 .mode-card-prog e CTA "Solicitar proposta da..." em cada — preservar todo o HTML literalmente em corpoHtml */ },
  modulosAbertos: { /* ModulosAbertosRich: eyebrow, titulo, tituloHtml, corpoHtml, feature?, miniStack?, microcopy, bottomCtas */ },
  faq:           { eyebrow: "...", titulo: "...", tituloHtml: "...", itens: [ /* { pergunta, resposta } por .faq-item */ ] },
  ctaFinal:      { eyebrow: "...", tituloHtml: "...", corpo: "..." } /* se o HTML tiver o #contato final */,
  sidebar:       { titulo: "...", rows: [ /* 5 rows */ ], entregasTitulo: "...", entregas: [ /* 6 entregas */ ] } /* se o HTML tiver .prog-sidebar */,
};
```

Regras de extração:
- Texto inline com `<em>` ou `<strong>` em campo `*Html` → preservar tag literal.
- Campos plain string (`titulo`, `pergunta`, `descricao`) → sem HTML.
- Placeholders editoriais óbvios (fotos de docentes não confirmadas) → `[texto a definir pela equipe editorial]`.
- **Nunca inventar texto.** Se um campo do tipo não existir no HTML do programa, omitir (campos opcionais) ou usar `""`.

**Step P.4 — Registrar no `conteudoIndex.ts`**

Adicionar 2 linhas:

```ts
import { SIGLA } from "./conteudoSIGLA";
// ...
export const PROGRAMAS: Record<string, ConteudoPrograma> = {
  [LIDERA.slug]: LIDERA,
  [SIGLA.slug]: SIGLA,   // ← adicionar aqui
};
```

Manter a ordem de import e o spread em ordem alfabética por sigla para facilitar diff visual.

**Step P.5 — Typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -5
```
Expected: clean.

---

## Task 1 — Educação · primeiro lote (EDUTEC, PEAR, PEI)

**Files (criados):**
- `apps/web/app/(programas)/programas/[slug]/conteudoEDUTEC.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPEAR.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPEI.ts`

**File (modificado):**
- `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

Aplicar Steps P.1–P.5 para cada um dos 3 programas, na ordem: EDUTEC, PEAR, PEI.

HTMLs canônicos:
- EDUTEC → `/Users/joao/Documents/portal-ntc/16_Pagina_Programa_EDUTEC_v1.html`
- PEAR → `/Users/joao/Documents/portal-ntc/15_Pagina_Programa_PEAR_v1.html`
- PEI → `/Users/joao/Documents/portal-ntc/19_Pagina_Programa_PEI_v1.html`

Para todos: `vertical: "educacao"`, `verticalRotulo: "NTC Educação"`, hero bg provavelmente `area-educacao.1920.webp` ou `area-educacao-premium.1920.webp` (confirmar no HTML).

- [ ] **Step 1.1 — Portar EDUTEC**

Aplicar P.1–P.4. Após salvar o arquivo, rodar P.5 (typecheck).

- [ ] **Step 1.2 — Portar PEAR**

Aplicar P.1–P.4. Após salvar o arquivo, rodar P.5 (typecheck).

- [ ] **Step 1.3 — Portar PEI**

Aplicar P.1–P.4. Após salvar o arquivo, rodar P.5 (typecheck).

- [ ] **Step 1.4 — Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -20
```
Expected: build OK, 4 rotas estáticas listadas (`/programas/lidera`, `/programas/edutec`, `/programas/pear`, `/programas/pei`).

- [ ] **Step 1.5 — Commit (4 arquivos)**

```bash
cd /Users/joao/Documents/portal-ntc
git add "apps/web/app/(programas)/programas/[slug]/conteudoEDUTEC.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPEAR.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPEI.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts"
git commit -m "$(cat <<'EOF'
feat(programas): porta EDUTEC, PEAR e PEI

Extração 1:1 dos HTMLs 16_..._EDUTEC, 15_..._PEAR e 19_..._PEI.
Vertical NTC Educação (3 de 9 programas portados nesta task).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 1.6 — Checkpoint visual humano**

Mensagem ao usuário:
> "Lote 1 portado (EDUTEC, PEAR, PEI). Servidor dev no ar.
>
> Verifique cada uma destas URLs (desktop 1440 + mobile 375):
> - http://localhost:3000/programas/edutec
> - http://localhost:3000/programas/pear
> - http://localhost:3000/programas/pei
>
> Compare cada uma com o HTML correspondente em `file://`:
> - `16_Pagina_Programa_EDUTEC_v1.html`
> - `15_Pagina_Programa_PEAR_v1.html`
> - `19_Pagina_Programa_PEI_v1.html`
>
> Conferir: hero, meta-bar, sticky nav, todas as ~16 seções, tabela de módulos com status, accordion detalhamento, diferenciais, faculty-prime completo, layout de eventos em módulos abertos, CTA final, sidebar comercial. Mega-menu navegando para a rota correta.
>
> Reporte discrepâncias antes de prosseguir para o Lote 2."

**Não avançar sem aprovação humana explícita** (CLAUDE.md §6 + `feedback_validacao_visual`).

---

## Task 2 — Educação · segundo lote (PROGIR, PROGE, EGIDE)

**Files (criados):**
- `apps/web/app/(programas)/programas/[slug]/conteudoPROGIR.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPROGE.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoEGIDE.ts`

**File (modificado):**
- `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

HTMLs canônicos:
- PROGIR → `/Users/joao/Documents/portal-ntc/21_Pagina_Programa_PROGIR_v1.html`
- PROGE → `/Users/joao/Documents/portal-ntc/20_Pagina_Programa_PROGE_v1.html`
- EGIDE → `/Users/joao/Documents/portal-ntc/13_Pagina_Programa_EGIDE_v1.html`

Para todos: `vertical: "educacao"`, `verticalRotulo: "NTC Educação"`.

- [ ] **Step 2.1 — Portar PROGIR**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 2.2 — Portar PROGE**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 2.3 — Portar EGIDE**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 2.4 — Build**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -20
```
Expected: 7 rotas estáticas (LIDERA + 6 da Educação portados).

- [ ] **Step 2.5 — Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add "apps/web/app/(programas)/programas/[slug]/conteudoPROGIR.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPROGE.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoEGIDE.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts"
git commit -m "$(cat <<'EOF'
feat(programas): porta PROGIR, PROGE e EGIDE

Extração 1:1 dos HTMLs 21_..._PROGIR, 20_..._PROGE e 13_..._EGIDE.
Vertical NTC Educação (6 de 9 programas portados).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2.6 — Checkpoint visual humano**

Mensagem ao usuário:
> "Lote 2 portado (PROGIR, PROGE, EGIDE). Verifique:
> - http://localhost:3000/programas/progir
> - http://localhost:3000/programas/proge
> - http://localhost:3000/programas/egide
>
> HTMLs de referência: 21_, 20_, 13_.
>
> Reporte discrepâncias antes do Lote 3."

Aguardar aprovação humana.

---

## Task 3 — Educação · terceiro lote (VIVAESCOLA, PINEI, FUTURA)

**Files (criados):**
- `apps/web/app/(programas)/programas/[slug]/conteudoVIVAESCOLA.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPINEI.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoFUTURA.ts`

**File (modificado):**
- `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

HTMLs canônicos:
- VIVAESCOLA → `/Users/joao/Documents/portal-ntc/23_Pagina_Programa_VIVAESCOLA_v1.html`
- PINEI → `/Users/joao/Documents/portal-ntc/22_Pagina_Programa_PINEI_v1.html`
- FUTURA → `/Users/joao/Documents/portal-ntc/24_Pagina_Programa_FUTURA_v1.html`

Para todos: `vertical: "educacao"`, `verticalRotulo: "NTC Educação"`. Com este lote, todos os 9 programas da Educação ficam portados — verificar que cada um agora calcula `calcularRelacionados()` corretamente (deve retornar até 4 programas irmãos da Educação).

- [ ] **Step 3.1 — Portar VIVAESCOLA**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 3.2 — Portar PINEI**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 3.3 — Portar FUTURA**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 3.4 — Build**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -20
```
Expected: 10 rotas estáticas (LIDERA + 9 Educação).

- [ ] **Step 3.5 — Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add "apps/web/app/(programas)/programas/[slug]/conteudoVIVAESCOLA.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPINEI.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoFUTURA.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts"
git commit -m "$(cat <<'EOF'
feat(programas): porta VIVAESCOLA, PINEI e FUTURA

Extração 1:1 dos HTMLs 23_..._VIVAESCOLA, 22_..._PINEI e
24_..._FUTURA. Conclui os 9 programas da vertical NTC Educação.

Programas relacionados agora populados em todas as páginas de
Educação (até 4 irmãos por programa, calculados em build-time).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3.6 — Checkpoint visual humano**

Mensagem ao usuário:
> "Lote 3 portado (VIVAESCOLA, PINEI, FUTURA). Educação 9/9 completa.
>
> Verifique:
> - http://localhost:3000/programas/vivaescola
> - http://localhost:3000/programas/pinei
> - http://localhost:3000/programas/futura
>
> HTMLs de referência: 23_, 22_, 24_.
>
> Conferir também: na seção 'Programas relacionados' de qualquer página de Educação (ex: /programas/edutec), agora devem aparecer até 4 cards de irmãos da mesma vertical (não vazio como antes).
>
> Reporte discrepâncias antes do Lote 4 (Gestão Pública)."

Aguardar aprovação humana.

---

## Task 4 — Gestão Pública · 2 programas restantes (AGIP, SIGA)

**Files (criados):**
- `apps/web/app/(programas)/programas/[slug]/conteudoAGIP.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoSIGA.ts`

**File (modificado):**
- `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

HTMLs canônicos:
- AGIP → `/Users/joao/Documents/portal-ntc/06_Pagina_Programa_AGIP_v1.html`
- SIGA → `/Users/joao/Documents/portal-ntc/11_Pagina_Programa_SIGA_v1.html`

Para ambos: `vertical: "gestao-publica"`, `verticalRotulo: "NTC Gestão Pública"`. Após esta task, todos os 3 programas da Gestão Pública (LIDERA + AGIP + SIGA) ficam portados — `calcularRelacionados` da Gestão Pública passa a retornar 2 irmãos em qualquer página da vertical.

- [ ] **Step 4.1 — Portar AGIP**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 4.2 — Portar SIGA**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 4.3 — Build**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -20
```
Expected: 12 rotas estáticas.

- [ ] **Step 4.4 — Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add "apps/web/app/(programas)/programas/[slug]/conteudoAGIP.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoSIGA.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts"
git commit -m "$(cat <<'EOF'
feat(programas): porta AGIP e SIGA

Extração 1:1 dos HTMLs 06_..._AGIP e 11_..._SIGA. Conclui os 3
programas da vertical NTC Gestão Pública (com LIDERA).

Programas relacionados agora populados em /programas/lidera
(retorna AGIP e SIGA).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4.5 — Checkpoint visual humano**

Mensagem ao usuário:
> "Lote 4 portado (AGIP, SIGA). Gestão Pública 3/3 completa.
>
> Verifique:
> - http://localhost:3000/programas/agip
> - http://localhost:3000/programas/siga
> - http://localhost:3000/programas/lidera (relacionados agora preenchidos)
>
> HTMLs de referência: 06_, 11_.
>
> Reporte discrepâncias antes do Lote 5 (Saúde)."

Aguardar aprovação humana.

---

## Task 5 — Saúde · 3 programas (SIGS, PROAPS+, PROSUS+)

**Files (criados):**
- `apps/web/app/(programas)/programas/[slug]/conteudoSIGS.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPROAPS.ts`
- `apps/web/app/(programas)/programas/[slug]/conteudoPROSUS.ts`

**File (modificado):**
- `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

HTMLs canônicos:
- SIGS → `/Users/joao/Documents/portal-ntc/14_Pagina_Programa_SIGS_v1.html`
- PROAPS → `/Users/joao/Documents/portal-ntc/17_Pagina_Programa_PROAPS_v1.html`
- PROSUS → `/Users/joao/Documents/portal-ntc/18_Pagina_Programa_PROSUS_v1.html`

Atenção especial:
- PROAPS+ e PROSUS+ — preservar o `+` em `sigla`, `siglaCss`, `siglaExibida` e `data-programa`. Slug fica `proaps` e `prosus` sem `+`.
- Para todos: `vertical: "saude"`, `verticalRotulo: "NTC Saúde"`. Hero bg provavelmente `area-saude.1920.webp` ou `area-saude-premium2.1920.webp`.

- [ ] **Step 5.1 — Portar SIGS**

Aplicar P.1–P.4. Typecheck.

- [ ] **Step 5.2 — Portar PROAPS+**

Aplicar P.1–P.4. Atentar: `sigla: "PROAPS+", siglaCss: "PROAPS+", siglaExibida: "PROAPS+", slug: "proaps"`. Typecheck.

- [ ] **Step 5.3 — Portar PROSUS+**

Aplicar P.1–P.4. Atentar: `sigla: "PROSUS+", siglaCss: "PROSUS+", siglaExibida: "PROSUS+", slug: "prosus"`. Typecheck.

- [ ] **Step 5.4 — Build**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -20
```
Expected: 15 rotas estáticas — todos os programas portados.

- [ ] **Step 5.5 — Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add "apps/web/app/(programas)/programas/[slug]/conteudoSIGS.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPROAPS.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoPROSUS.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts"
git commit -m "$(cat <<'EOF'
feat(programas): porta SIGS, PROAPS+ e PROSUS+

Extração 1:1 dos HTMLs 14_..._SIGS, 17_..._PROAPS e 18_..._PROSUS.
Conclui os 3 programas da vertical NTC Saúde.

Com este commit, todos os 15 programas do portfólio Grupo NTC
têm porta literal própria. Slugs PROAPS+/PROSUS+ mantêm o "+"
em data-programa para casar com o cromatismo CSS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5.6 — Checkpoint visual humano**

Mensagem ao usuário:
> "Lote 5 portado (SIGS, PROAPS+, PROSUS+). Saúde 3/3 completa. **Todos os 15 programas portados.**
>
> Verifique:
> - http://localhost:3000/programas/sigs
> - http://localhost:3000/programas/proaps
> - http://localhost:3000/programas/prosus
>
> HTMLs de referência: 14_, 17_, 18_.
>
> Conferir cromatismo: PROAPS+ e PROSUS+ devem usar o data-programa com '+' literal (inspect element no `<main>`). Reporte discrepâncias antes do Polish."

Aguardar aprovação humana.

---

## Task 6 — Polish global (smoke test dos 15 programas)

**Files modificados:** nenhum (somente verificação).

- [ ] **Step 6.1 — Build de produção completo**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "Tasks:|Failed|/programas/" | tail -25
```
Expected: 15 rotas estáticas em `/programas/[slug]`, build OK.

- [ ] **Step 6.2 — Lint e typecheck globais**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -8
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -8
```
Expected: lint sem warnings novos (apenas os 8 pré-existentes de `<img>`), typecheck clean.

- [ ] **Step 6.3 — Smoke test programático dos 15 slugs**

```bash
for slug in edutec pear pei progir proge egide vivaescola pinei futura agip lidera siga sigs proaps prosus; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/programas/$slug")
  echo "/$slug → HTTP $status"
done
```
Expected: 15 linhas com `HTTP 200`. Se algum retornar 404 ou 500, parar e investigar.

- [ ] **Step 6.4 — Conferir cromatismo dos 15 data-programa**

```bash
for slug in edutec pear pei progir proge egide vivaescola pinei futura agip lidera siga sigs proaps prosus; do
  dp=$(curl -s "http://localhost:3000/programas/$slug" | grep -oE 'data-programa="[^"]+"' | head -1)
  echo "/$slug → $dp"
done
```
Expected: cada programa retorna seu `data-programa` próprio. PROAPS+/PROSUS+ devem retornar com o `+` no atributo.

- [ ] **Step 6.5 — Smoke test do mega-menu**

Manual: abrir http://localhost:3000, hover no item "Programas" do header, clicar em **um item de cada vertical** (ex: EDUTEC, AGIP, SIGS), confirmar que cada um carrega a página correta. Também testar o drawer mobile.

- [ ] **Step 6.6 — Checkpoint visual humano final**

Mensagem ao usuário:
> "Fase 2 concluída. 15 programas portados, build OK, smoke test verde.
>
> Recomendo um passeio aleatório por 4–5 programas (idealmente um de cada vertical) e mais um teste do mega-menu na home, antes de declarar a porta dos programas pronta.
>
> Após aprovação, posso ajudar com o próximo passo (ex: ajustes editoriais, JSON-LD Course, integração com Payload, ou outra página)."

Aguardar aprovação humana.

---

## Encerramento

Após a Task 6 com aprovação:
- 15 commits novos no histórico (5 commits de portagem + nenhum esperado no Polish, exceto se algum smoke flag um bug).
- 15 rotas `/programas/[slug]` ativas, todas SSG com revalidate 3600.
- Próximos planos prováveis: JSON-LD Course (Mapa §4.2), página de listagem `/programas` (se o escopo mudar), integração Payload, ou portagem de outras rotas (`/agenda`, `/eventos`, `/conteudos`, `/contato`).
