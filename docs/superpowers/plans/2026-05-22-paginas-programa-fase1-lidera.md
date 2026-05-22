# Páginas de Programa — Fase 1 (Andaime + LIDERA) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o andaime do route group `(programas)` (layout, CSS, page.tsx, Client Components, índice de conteúdo) e portar **LIDERA** como programa de referência, validado por checkpoint visual humano. Os demais 14 programas serão portados em planos separados (Fase 2).

**Architecture:** Route group novo espelhando `(vertical)` — reuso de HeaderHome/FooterHome/InteracoesScroll, CSS literal importado no root, Client Components mínimos (sticky nav + FAQ), fallback estático sem CMS. `data-programa` no `<main>` ativa o cromatismo via CSS por programa.

**Tech Stack:** Next.js 15 App Router, React Server Components, TypeScript strict, CSS literal (sem Tailwind para classes `.prog-*`), `next/link`. Sem Vitest nesta fase (porta literal de conteúdo estático; validação é visual e humana — ver `feedback_validacao_visual` em CLAUDE.md).

**Spec:** `docs/superpowers/specs/2026-05-22-paginas-programa-design.md`.

---

## Pré-requisitos

- Node + pnpm já instalados; `pnpm dev` funcional.
- Branch atual `main`. Todas as commits são feitas diretamente em `main` (consistente com os 43 commits locais já existentes).
- Imagens das verticais já presentes em `apps/web/public/img/fotos/_optimized/area-*.1920.webp`.

---

## Task 0 — Pré-checagens e preparativos

**Files:** nenhum modificado. Apenas verificações e cópia de arquivo de protótipo.

- [ ] **Step 0.1 — Confirmar HTMLs de programa no diretório do portal**

Run:
```bash
ls /Users/joao/Documents/portal-ntc/*_Pagina_Programa_*.html | wc -l
```
Expected: `14` (LIDERA, SIGA, EGIDE, SIGS, PEAR, EDUTEC, PROAPS, PROSUS, PEI, PROGE, PROGIR, PINEI, VIVAESCOLA, FUTURA). AGIP está em `/Users/joao/Downloads/`.

- [ ] **Step 0.2 — Copiar HTML do AGIP para o portal (preparar Fase 2)**

Run:
```bash
cp /Users/joao/Downloads/06_Pagina_Programa_AGIP_v1.html /Users/joao/Documents/portal-ntc/
ls /Users/joao/Documents/portal-ntc/06_Pagina_Programa_AGIP_v1.html
```
Expected: o arquivo aparece em `/Users/joao/Documents/portal-ntc/`.

- [ ] **Step 0.3 — Confirmar imagens da vertical Gestão Pública**

Run:
```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/area-gestao-publica.1920.webp
```
Expected: o arquivo existe. (LIDERA usa essa imagem; se faltar, abortar e pedir ao usuário.)

- [ ] **Step 0.4 — Commit do AGIP**

```bash
git add 06_Pagina_Programa_AGIP_v1.html
git commit -m "$(cat <<'EOF'
chore(prototipos): adiciona HTML do programa AGIP

Move do Downloads para o repositório para alinhar com os outros 14
protótipos de programa.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 1 — Extrair CSS do protótipo LIDERA

**Files:**
- Create: `apps/web/app/programas-prototipo.css`

O CSS dos 15 protótipos é idêntico; usamos LIDERA como fonte canônica. Conteúdo a extrair: bloco `<style>` do `10_Pagina_Programa_LIDERA_v1.html` (linhas ~135–2.831, inclusive — todo o conteúdo entre `<style>` e `</style>`, exceto a `:root { --color-... }` que já vem de `home-prototipo.css`).

- [ ] **Step 1.1 — Localizar limites do `<style>` no HTML do LIDERA**

Run:
```bash
grep -n "^<style>\|^</style>" /Users/joao/Documents/portal-ntc/10_Pagina_Programa_LIDERA_v1.html
```
Expected: duas linhas — `<style>` em ~133 e `</style>` em ~2833 (aproximado).

- [ ] **Step 1.2 — Criar `apps/web/app/programas-prototipo.css`**

Conteúdo do arquivo:

```css
/*
 * apps/web/app/programas-prototipo.css
 *
 * CSS literal das páginas individuais de programa, portado do
 * `<style>` de 10_Pagina_Programa_LIDERA_v1.html. Os 15 HTMLs de
 * programa compartilham este CSS; a variação cromática/imagens
 * por programa vem de seletores `.program-page[data-programa="SIGLA"]`.
 *
 * Tokens base e regras de header/footer/btn vêm de
 * `home-prototipo.css`. Aqui só carregamos as regras específicas
 * das páginas de programa (.prog-hero, .prog-meta-bar, .prog-nav,
 * .prog-layout, .prog-section, .related-events-section, etc.).
 *
 * Não escrevemos CSS adicional fora deste arquivo nem inline —
 * qualquer ajuste precisa passar pela equipe editorial e pelo
 * protótipo HTML correspondente (CLAUDE.md §5.2).
 */

/* COPIAR AQUI todo o conteúdo entre <style> e </style> do
   10_Pagina_Programa_LIDERA_v1.html, EXCETO o bloco :root { ... }
   inicial que define --color-* e já existe em home-prototipo.css. */
```

Forma de extração: ler o HTML do LIDERA das linhas exatas identificadas no passo 1.1 e copiar o conteúdo literal entre `<style>` e `</style>`, removendo apenas o bloco `:root { --color-... }` inicial (esses tokens já existem). **Não alterar mais nada** — nem ordem, nem espaçamento, nem comentários.

- [ ] **Step 1.3 — Importar no root layout**

Modify: `apps/web/app/layout.tsx:31`

Adicionar logo após a linha 31 (`import "./verticais-prototipo.css";`):

```ts
// CSS das páginas individuais de programa (/programas/[slug]).
// Portado literal de 10_Pagina_Programa_LIDERA_v1.html. Os 15 HTMLs
// de programa usam o MESMO CSS — variações cromáticas vêm de
// .program-page[data-programa="LIDERA|EDUTEC|SIGS|..."].
import "./programas-prototipo.css";
```

- [ ] **Step 1.4 — Verificar build**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck`
Expected: sem erros novos. (CSS não tem typecheck; o `import` no `layout.tsx` precisa ser sintaticamente válido.)

- [ ] **Step 1.5 — Commit**

```bash
git add apps/web/app/programas-prototipo.css apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(programas): extrai CSS literal dos 15 programas

Porta o <style> do 10_Pagina_Programa_LIDERA_v1.html para
apps/web/app/programas-prototipo.css. Os 15 HTMLs de programa usam
o MESMO CSS — variação cromática vem de seletores
.program-page[data-programa="SIGLA"].

Importado no root layout depois de verticais-prototipo.css.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 — Tipo `ConteudoPrograma` e índice

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

- [ ] **Step 2.1 — Criar diretório e índice**

Run:
```bash
mkdir -p /Users/joao/Documents/portal-ntc/apps/web/app/\(programas\)/programas/\[slug\]
```

Create: `apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts`

```ts
/**
 * Tipo `ConteudoPrograma` e índice agregador dos 15 programas.
 *
 * Cada programa tem seu próprio arquivo `conteudo<SIGLA>.ts` com o
 * objeto literal exportado. Este índice apenas registra todos eles
 * em `PROGRAMAS` para consumo pela rota dinâmica.
 *
 * Política da porta do HTML: conteúdo é cópia 1:1 dos protótipos
 * (CLAUDE.md §5.3). Sem CMS nesta versão.
 */

export type Vertical = "educacao" | "gestao-publica" | "saude";

export interface CtaPrograma {
  rotulo: string;
  href: string;
  variante?: "gold" | "ghost-light";
}

export interface StatHero {
  num: string;
  lbl: string;
}

export interface MetaItem {
  rotulo: string;
  valor: string;
}

export interface EixoTematico {
  titulo: string;
  descricao: string;
}

export interface Modulo {
  numero: string;
  titulo: string;
  descricao: string;
  cargaHoraria?: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface RelacionadoPrograma {
  slug: string;
  sigla: string;
  nomeCurto: string;
  descritor: string;
}

export interface NavAnchor {
  href: string;
  rotulo: string;
}

export interface BlocoEditorial {
  eyebrow: string;
  titulo: string;
  corpoHtml: string;
}

export interface ConteudoPrograma {
  sigla: string;
  siglaCss: string;
  siglaExibida: string;
  slug: string;
  nomeCompleto: string;
  vertical: Vertical;
  verticalRotulo: string;
  breadcrumb: { current: string };
  hero: {
    bgSrc: string;
    eyebrow: string;
    stats: StatHero[];
    tituloHtml: string;
    sub: string;
    ctas: CtaPrograma[];
  };
  metaBar: MetaItem[];
  navAnchors: NavAnchor[];
  visaoGeral: BlocoEditorial;
  problema: BlocoEditorial;
  publico: BlocoEditorial;
  eixos: { eyebrow: string; titulo: string; itens: EixoTematico[] };
  modulos: { eyebrow: string; titulo: string; itens: Modulo[] };
  resultados: BlocoEditorial;
  docentes: { eyebrow: string; titulo: string; descricaoHtml?: string };
  modalidades: BlocoEditorial;
  modulosAbertos: BlocoEditorial;
  faq: { eyebrow: string; titulo: string; itens: FaqItem[] };
}

import { LIDERA } from "./conteudoLIDERA";

export const PROGRAMAS: Record<string, ConteudoPrograma> = {
  [LIDERA.slug]: LIDERA,
};

export const SLUGS_VALIDOS: string[] = Object.keys(PROGRAMAS);

export function calcularRelacionados(slugAtual: string): RelacionadoPrograma[] {
  const atual = PROGRAMAS[slugAtual];
  if (!atual) return [];
  return Object.values(PROGRAMAS)
    .filter((p) => p.vertical === atual.vertical && p.slug !== slugAtual)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      sigla: p.siglaExibida,
      nomeCurto: p.nomeCompleto,
      descritor: p.breadcrumb.current,
    }));
}
```

Observação: este arquivo importa `LIDERA` de `./conteudoLIDERA.ts` — o build vai falhar até a Task 3 criar esse módulo. Isso é intencional (TDD-light: erro de import explícito).

- [ ] **Step 2.2 — Verificar que typecheck falha como esperado**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20`
Expected: erro `Cannot find module './conteudoLIDERA'` ou similar.

- [ ] **Step 2.3 — Commit (parcial, com import quebrado intencionalmente)**

Não commitar ainda — vamos commitar junto com a Task 3 quando o módulo `conteudoLIDERA` existir e o typecheck voltar a passar.

---

## Task 3 — Conteúdo do LIDERA (`conteudoLIDERA.ts`)

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/conteudoLIDERA.ts`

- [ ] **Step 3.1 — Ler trechos canônicos do HTML do LIDERA**

Run:
```bash
# Hero
sed -n '3070,3100p' /Users/joao/Documents/portal-ntc/10_Pagina_Programa_LIDERA_v1.html
# Meta-bar
sed -n '3098,3132p' /Users/joao/Documents/portal-ntc/10_Pagina_Programa_LIDERA_v1.html
# Nav
sed -n '3131,3152p' /Users/joao/Documents/portal-ntc/10_Pagina_Programa_LIDERA_v1.html
# Layout principal (seções de conteúdo)
sed -n '3153,4000p' /Users/joao/Documents/portal-ntc/10_Pagina_Programa_LIDERA_v1.html
```
Expected: trechos com hero, meta, nav e todas as seções (visão-geral até FAQ).

- [ ] **Step 3.2 — Criar `conteudoLIDERA.ts` com extração 1:1 do HTML**

Create: `apps/web/app/(programas)/programas/[slug]/conteudoLIDERA.ts`

Estrutura geral (preencher cada campo com o texto literal extraído no passo 3.1):

```ts
import type { ConteudoPrograma } from "./conteudoIndex";

const IMG = "/img/fotos/_optimized";

export const LIDERA: ConteudoPrograma = {
  sigla: "LIDERA",
  siglaCss: "LIDERA",
  siglaExibida: "LIDERA",
  slug: "lidera",
  nomeCompleto: "Liderança, Direção Estratégica e Resultados na Administração",
  vertical: "gestao-publica",
  verticalRotulo: "NTC Gestão Pública",
  breadcrumb: { current: "LIDERA" },
  hero: {
    bgSrc: `${IMG}/area-gestao-publica.1920.webp`,
    eyebrow: "Programa Estratégico",
    stats: [
      { num: "8", lbl: "Módulos formativos" },
      { num: "64h", lbl: "Carga horária total" },
      { num: "4", lbl: "Eixos temáticos" },
    ],
    tituloHtml: "<!-- TÍTULO H1 COMPLETO DO HERO DO HTML -->",
    sub: "<!-- SUBTÍTULO COMPLETO DO HERO DO HTML -->",
    ctas: [
      { rotulo: "Solicitar proposta", href: "/contato/proposta?programa=lidera", variante: "gold" },
      { rotulo: "Solicitar folder", href: "/contato/proposta?programa=lidera&assunto=folder", variante: "ghost-light" },
    ],
  },
  metaBar: [
    { rotulo: "<!-- ROTULO 1 -->", valor: "<!-- VALOR 1 -->" },
    { rotulo: "<!-- ROTULO 2 -->", valor: "<!-- VALOR 2 -->" },
    { rotulo: "<!-- ROTULO 3 -->", valor: "<!-- VALOR 3 -->" },
    { rotulo: "<!-- ROTULO 4 -->", valor: "<!-- VALOR 4 -->" },
    { rotulo: "<!-- ROTULO 5 -->", valor: "<!-- VALOR 5 -->" },
  ],
  navAnchors: [
    { href: "#visao-geral", rotulo: "Visão geral" },
    { href: "#problema", rotulo: "Problema" },
    { href: "#publico", rotulo: "Público" },
    { href: "#eixos", rotulo: "Eixos" },
    { href: "#modulos", rotulo: "Módulos" },
    { href: "#resultados", rotulo: "Resultados" },
    { href: "#docentes", rotulo: "Corpo docente" },
    { href: "#modalidades", rotulo: "Modalidades" },
    { href: "#modulos-abertos", rotulo: "Módulos abertos" },
    { href: "#faq", rotulo: "FAQ" },
  ],
  visaoGeral: {
    eyebrow: "<!-- EYEBROW DA SEÇÃO -->",
    titulo: "<!-- TÍTULO DA SEÇÃO -->",
    corpoHtml: "<!-- HTML LITERAL DO CORPO (parágrafos, <em>, <strong>) -->",
  },
  problema: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    corpoHtml: "<!-- ... -->",
  },
  publico: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    corpoHtml: "<!-- ... -->",
  },
  eixos: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    itens: [
      { titulo: "<!-- ... -->", descricao: "<!-- ... -->" },
      // ... (replicar para cada eixo do HTML)
    ],
  },
  modulos: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    itens: [
      { numero: "01", titulo: "<!-- ... -->", descricao: "<!-- ... -->", cargaHoraria: "<!-- ... -->" },
      // ... (replicar para cada módulo, geralmente 8)
    ],
  },
  resultados: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    corpoHtml: "<!-- ... -->",
  },
  docentes: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    descricaoHtml: "<!-- intro do bloco; grade de fotos = [texto a definir pela equipe editorial] -->",
  },
  modalidades: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    corpoHtml: "<!-- ... -->",
  },
  modulosAbertos: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    corpoHtml: "<!-- ... -->",
  },
  faq: {
    eyebrow: "<!-- ... -->",
    titulo: "<!-- ... -->",
    itens: [
      { pergunta: "<!-- ... -->", resposta: "<!-- ... -->" },
      // ... (replicar para cada item do FAQ)
    ],
  },
};
```

**Regra de extração:** todos os marcadores `<!-- ... -->` acima devem ser substituídos pelo texto **literal** do HTML do LIDERA (linhas indicadas no passo 3.1). Onde o HTML usa tags inline (`<em>`, `<strong>`, `<br>`), preservar dentro de `corpoHtml`. Onde o HTML mostra placeholder editorial (fotos sem URL real, dados não confirmados), usar `[texto a definir pela equipe editorial]`.

- [ ] **Step 3.3 — Verificar typecheck**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20`
Expected: sem erros relacionados a `conteudoIndex` / `conteudoLIDERA`. (Pode haver erros em `page.tsx` — ainda não criada.)

- [ ] **Step 3.4 — Commit (índice + LIDERA juntos)**

```bash
git add "apps/web/app/(programas)/programas/[slug]/conteudoIndex.ts" \
        "apps/web/app/(programas)/programas/[slug]/conteudoLIDERA.ts"
git commit -m "$(cat <<'EOF'
feat(programas): adiciona índice de conteúdo e LIDERA literal

ConteudoPrograma e conteudoIndex.ts agregam os 15 programas (por
ora só LIDERA). conteudoLIDERA.ts traz extração 1:1 do HTML
10_Pagina_Programa_LIDERA_v1.html.

Placeholders editoriais marcados como [texto a definir pela equipe
editorial] (CLAUDE.md §5.3).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 — Client Components (NavBarAncoras + FaqAcordeao)

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/NavBarAncoras.tsx`
- Create: `apps/web/app/(programas)/programas/[slug]/FaqAcordeao.tsx`

São cópias adaptadas dos da vertical, com prop `slug` no Nav para os CTAs.

- [ ] **Step 4.1 — Criar `NavBarAncoras.tsx`**

Create: `apps/web/app/(programas)/programas/[slug]/NavBarAncoras.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

import type { NavAnchor } from "./conteudoIndex";

/**
 * `NavBarAncoras` — sticky nav abaixo do header com âncoras
 * internas + dois CTAs ("Solicitar proposta", "Solicitar folder").
 * Reproduz `.prog-nav` dos 15 HTMLs de programa.
 *
 * Scrollspy via IntersectionObserver: o link da seção mais visível
 * recebe `.is-active`. Padrão espelhado de NavBarInternaSticky
 * (vertical) e NavBarAncoras (o-grupo).
 */

interface Props {
  anchors: NavAnchor[];
  slug: string;
}

export function NavBarAncoras({ anchors, slug }: Props) {
  const [ativo, setAtivo] = useState<string>(
    anchors[0]?.href.replace(/^#/, "") ?? "",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ids = anchors.map((a) => a.href.replace(/^#/, ""));
    const alvos = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (alvos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visiveis[0]) setAtivo(visiveis[0].target.id);
      },
      {
        rootMargin: "-160px 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    alvos.forEach((alvo) => observer.observe(alvo));
    return () => observer.disconnect();
  }, [anchors]);

  const rolarPara = (id: string) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="prog-nav" aria-label="Navegação interna do programa">
      <div className="container">
        <div className="prog-nav-anchors" role="tablist">
          {anchors.map((a) => {
            const id = a.href.replace(/^#/, "");
            return (
              <a
                key={id}
                className={`prog-nav-link${ativo === id ? " is-active" : ""}`}
                href={a.href}
                onClick={(e) => {
                  e.preventDefault();
                  rolarPara(id);
                }}
              >
                {a.rotulo}
              </a>
            );
          })}
        </div>
        <div className="prog-nav-actions">
          <a
            className="prog-nav-action primary"
            href={`/contato/proposta?programa=${slug}`}
          >
            Solicitar proposta
          </a>
          <a
            className="prog-nav-action"
            href={`/contato/proposta?programa=${slug}&assunto=folder`}
          >
            Solicitar folder
          </a>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4.2 — Criar `FaqAcordeao.tsx`**

Create: `apps/web/app/(programas)/programas/[slug]/FaqAcordeao.tsx`

```tsx
"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoIndex";

/**
 * `FaqAcordeao` — acordeão da seção FAQ. Reproduz `.faq-item` dos
 * 15 HTMLs de programa. Apenas um item aberto por vez; aria-expanded
 * atualizado para a11y.
 */
export function FaqAcordeao({ itens }: { itens: FaqItem[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {itens.map((item, idx) => {
        const isAberto = aberto === idx;
        return (
          <div key={idx} className={`faq-item${isAberto ? " is-open" : ""}`}>
            <button
              type="button"
              className="faq-question"
              aria-expanded={isAberto}
              onClick={() => setAberto(isAberto ? null : idx)}
            >
              {item.pergunta}
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">{item.resposta}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4.3 — Verificar typecheck**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20`
Expected: sem erros nos dois arquivos novos.

- [ ] **Step 4.4 — Commit**

```bash
git add "apps/web/app/(programas)/programas/[slug]/NavBarAncoras.tsx" \
        "apps/web/app/(programas)/programas/[slug]/FaqAcordeao.tsx"
git commit -m "$(cat <<'EOF'
feat(programas): adiciona NavBarAncoras e FaqAcordeao

Client Components mínimos para a rota /programas/[slug]:
- NavBarAncoras: sticky nav com scrollspy e 2 CTAs (proposta/folder)
- FaqAcordeao: acordeão com 1 item aberto por vez

Padrão espelhado dos componentes da vertical.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — Layout do route group `(programas)`

**Files:**
- Create: `apps/web/app/(programas)/layout.tsx`

- [ ] **Step 5.1 — Criar layout**

Create: `apps/web/app/(programas)/layout.tsx`

```tsx
import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas individuais de programa (/programas/[slug]).
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (vertical)/layout.tsx e (o-grupo)/layout.tsx.
 *
 * CSS específico (.prog-hero, .prog-nav, .prog-section etc.) vem
 * de programas-prototipo.css, importado no root layout.
 */
export default function ProgramasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
```

- [ ] **Step 5.2 — Verificar typecheck**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10`
Expected: sem erros.

- [ ] **Step 5.3 — Commit**

```bash
git add "apps/web/app/(programas)/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(programas): layout do route group reaproveita Home v3

Header + footer + InteracoesScroll vêm de (home)/, mesmo padrão
adotado por (vertical) e (o-grupo).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 — `page.tsx` da rota `/programas/[slug]`

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/page.tsx`

Esta é a tarefa central. O `page.tsx` reproduz literalmente as ~13 seções do HTML do LIDERA usando o objeto `ConteudoPrograma`.

- [ ] **Step 6.1 — Criar `page.tsx`**

Create: `apps/web/app/(programas)/programas/[slug]/page.tsx`

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PROGRAMAS,
  SLUGS_VALIDOS,
  calcularRelacionados,
} from "./conteudoIndex";
import { NavBarAncoras } from "./NavBarAncoras";
import { FaqAcordeao } from "./FaqAcordeao";

/**
 * Página `/programas/[slug]` — porta literal das ~13 seções dos
 * 15 protótipos `*_Pagina_Programa_*.html`.
 *
 * Conteúdo: `PROGRAMAS[slug]` (conteudoIndex.ts) com textos
 * extraídos 1:1 do HTML. Cromático: `<main className="program-page"
 * data-programa={siglaCss}>` ativa os seletores específicos do CSS
 * portado em programas-prototipo.css.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  return SLUGS_VALIDOS.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function primeiraFrase(html: string): string {
  const texto = stripHtml(html);
  const ponto = texto.indexOf(". ");
  return ponto > 0 ? texto.slice(0, ponto + 1) : texto;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PROGRAMAS[slug];
  if (!p) return { title: "Programa · Grupo NTC" };
  return {
    title: `${p.siglaExibida} · ${p.nomeCompleto}`,
    description: primeiraFrase(p.visaoGeral.corpoHtml),
    openGraph: {
      title: `${p.siglaExibida} · ${p.nomeCompleto}`,
      description: primeiraFrase(p.visaoGeral.corpoHtml),
      images: [{ url: p.hero.bgSrc }],
    },
  };
}

function classeCta(variante?: string): string {
  switch (variante) {
    case "gold":
      return "btn btn--gold";
    case "ghost-light":
    default:
      return "btn btn--ghost-light";
  }
}

// TODO: JSON-LD Course (Mapa §4.2) — exige dados estruturados
// (provider URL, timeRequired ISO 8601) ainda não presentes nos
// protótipos. Adicionar quando o catálogo editorial for confirmado.

export default async function ProgramaPage({ params }: Props) {
  const { slug } = await params;
  const p = PROGRAMAS[slug];
  if (!p) notFound();

  const relacionados = calcularRelacionados(slug);

  return (
    <main id="main" className="program-page" data-programa={p.siglaCss}>
      {/* ============= BREADCRUMB ============= */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            <li>
              <Link href="/">Grupo NTC</Link>
            </li>
            <li className="sep">/</li>
            <li>
              <Link href="/#solucoes">Soluções Estratégicas</Link>
            </li>
            <li className="sep">/</li>
            <li>
              <Link href={`/solucoes-estrategicas/${p.vertical}`}>
                {p.verticalRotulo}
              </Link>
            </li>
            <li className="sep">/</li>
            <li className="current">{p.breadcrumb.current}</li>
          </ol>
        </div>
      </nav>

      {/* ============= HERO ============= */}
      <section className="prog-hero" aria-label={`${p.siglaExibida} · ${p.nomeCompleto}`}>
        <div
          className="prog-hero-bg"
          style={{ backgroundImage: `url('${p.hero.bgSrc}')` }}
          aria-hidden="true"
        />
        <div className="container prog-hero-content fade-in">
          <div className="prog-hero-mark">
            <p className="prog-hero-eyebrow">{p.hero.eyebrow}</p>
            <h2 className="prog-hero-sigla">{p.siglaExibida}</h2>
            <div className="prog-hero-stats">
              {p.hero.stats.map((s, i) => (
                <div key={i} className="prog-hero-stat">
                  <span className="num">{s.num}</span>
                  <span className="lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="prog-hero-text">
            <span className="prog-hero-vert">{p.verticalRotulo}</span>
            <h1 dangerouslySetInnerHTML={{ __html: p.hero.tituloHtml }} />
            <p className="prog-hero-sub">{p.hero.sub}</p>
            <div className="prog-hero-ctas">
              {p.hero.ctas.map((c, i) => (
                <a key={i} className={classeCta(c.variante)} href={c.href}>
                  {c.rotulo}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============= META-BAR ============= */}
      <section className="prog-meta-bar" aria-label="Informações principais do programa">
        <div className="container">
          <div className="prog-meta-grid fade-in">
            {p.metaBar.map((m, i) => (
              <div key={i} className="prog-meta-item">
                <span className="prog-meta-rotulo">{m.rotulo}</span>
                <span className="prog-meta-valor">{m.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= NAV STICKY ============= */}
      <NavBarAncoras anchors={p.navAnchors} slug={p.slug} />

      {/* ============= LAYOUT PRINCIPAL ============= */}
      <section className="prog-layout">
        <div className="container">
          <div className="prog-layout-grid">
            <div className="prog-main">
              <article className="prog-section fade-in" id="visao-geral">
                <p className="prog-section-eyebrow">{p.visaoGeral.eyebrow}</p>
                <h2>{p.visaoGeral.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.visaoGeral.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="problema">
                <p className="prog-section-eyebrow">{p.problema.eyebrow}</p>
                <h2>{p.problema.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.problema.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="publico">
                <p className="prog-section-eyebrow">{p.publico.eyebrow}</p>
                <h2>{p.publico.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.publico.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="eixos">
                <p className="prog-section-eyebrow">{p.eixos.eyebrow}</p>
                <h2>{p.eixos.titulo}</h2>
                <div className="prog-eixos-grid">
                  {p.eixos.itens.map((e, i) => (
                    <div key={i} className="prog-eixo-card">
                      <h3>{e.titulo}</h3>
                      <p>{e.descricao}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="prog-section fade-in" id="modulos">
                <p className="prog-section-eyebrow">{p.modulos.eyebrow}</p>
                <h2>{p.modulos.titulo}</h2>
                <ol className="prog-modulos-lista">
                  {p.modulos.itens.map((m, i) => (
                    <li key={i} className="prog-modulo-card">
                      <span className="prog-modulo-numero">{m.numero}</span>
                      <div className="prog-modulo-conteudo">
                        <h3>{m.titulo}</h3>
                        <p>{m.descricao}</p>
                        {m.cargaHoraria ? (
                          <span className="prog-modulo-carga">{m.cargaHoraria}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="prog-section fade-in" id="resultados">
                <p className="prog-section-eyebrow">{p.resultados.eyebrow}</p>
                <h2>{p.resultados.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.resultados.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="docentes">
                <p className="prog-section-eyebrow">{p.docentes.eyebrow}</p>
                <h2>{p.docentes.titulo}</h2>
                {p.docentes.descricaoHtml ? (
                  <div
                    className="prog-section-corpo"
                    dangerouslySetInnerHTML={{ __html: p.docentes.descricaoHtml }}
                  />
                ) : null}
              </article>

              <article className="prog-section fade-in" id="modalidades">
                <p className="prog-section-eyebrow">{p.modalidades.eyebrow}</p>
                <h2>{p.modalidades.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.modalidades.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="modulos-abertos">
                <p className="prog-section-eyebrow">{p.modulosAbertos.eyebrow}</p>
                <h2>{p.modulosAbertos.titulo}</h2>
                <div
                  className="prog-section-corpo"
                  dangerouslySetInnerHTML={{ __html: p.modulosAbertos.corpoHtml }}
                />
              </article>

              <article className="prog-section fade-in" id="faq">
                <p className="prog-section-eyebrow">{p.faq.eyebrow}</p>
                <h2>{p.faq.titulo}</h2>
                <FaqAcordeao itens={p.faq.itens} />
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ============= PROGRAMAS RELACIONADOS ============= */}
      {relacionados.length > 0 ? (
        <section
          className="related-events-section"
          aria-label={`Outros programas da ${p.verticalRotulo}`}
        >
          <div className="container">
            <h2 className="related-events-titulo">
              Outros programas da {p.verticalRotulo}
            </h2>
            <div className="related-events-grid">
              {relacionados.map((r) => (
                <Link
                  key={r.slug}
                  href={`/programas/${r.slug}`}
                  className="related-event-card"
                >
                  <h3>{r.sigla}</h3>
                  <p>{r.nomeCurto}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
```

- [ ] **Step 6.2 — Verificar typecheck**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20`
Expected: sem erros.

- [ ] **Step 6.3 — Verificar lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -20`
Expected: sem warnings novos.

- [ ] **Step 6.4 — Commit**

```bash
git add "apps/web/app/(programas)/programas/[slug]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(programas): page.tsx renderiza todas as seções do programa

Server component que reproduz a porta literal de
10_Pagina_Programa_LIDERA_v1.html: breadcrumb, hero, meta-bar,
nav sticky, 10 seções (visão-geral até FAQ) e programas
relacionados (calculado pela vertical).

generateStaticParams + revalidate 3600s + notFound() em slug
inválido. Metadata derivada do conteúdo. TODO de JSON-LD anotado.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 — Atualizar mega-menu "Programas" do HeaderHome

**Files:**
- Modify: `apps/web/app/(home)/HeaderHome.tsx`

Substituir 15 `href="#programas"` por `<Link href="/programas/{slug}">`. **Apenas LIDERA tem página real nesta fase** — os outros 14 retornam 404 controlado (intencional; corrigido na Fase 2).

- [ ] **Step 7.1 — Mapear linhas e fazer 15 edits específicos**

Cada substituição é da forma:

```diff
- <a href="#programas">
-   <strong>EDUTEC</strong>
-   <span>Educação Digital, ...</span>
- </a>
+ <Link href="/programas/edutec">
+   <strong>EDUTEC</strong>
+   <span>Educação Digital, ...</span>
+ </Link>
```

**Mapa sigla → slug** (todos minúsculos, sem `+`):

| Sigla | Slug |
|---|---|
| EDUTEC | `edutec` |
| PEAR | `pear` |
| PEI | `pei` |
| PROGIR | `progir` |
| PROGE | `proge` |
| EGIDE | `egide` |
| VIVAESCOLA | `vivaescola` |
| PINEI | `pinei` |
| FUTURA | `futura` |
| AGIP | `agip` |
| LIDERA | `lidera` |
| SIGA | `siga` |
| SIGS | `sigs` |
| PROAPS+ | `proaps` |
| PROSUS+ | `prosus` |

Aplicar 15 Edits no arquivo. Cada um troca o bloco `<a href="#programas">` + fechamento `</a>` pelo `<Link href="/programas/{slug}">` + `</Link>`, mantendo `<strong>` e `<span>` intactos.

- [ ] **Step 7.2 — Verificar typecheck**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10`
Expected: sem erros. `Link` já está importado no `HeaderHome.tsx` (o mega-menu Soluções já usa).

- [ ] **Step 7.3 — Verificar lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -10`
Expected: sem warnings novos.

- [ ] **Step 7.4 — Commit**

```bash
git add "apps/web/app/(home)/HeaderHome.tsx"
git commit -m "$(cat <<'EOF'
feat(home): mega-menu Programas aponta para /programas/[slug]

Substitui placeholders href=#programas pelos 15 slugs reais. Nesta
fase apenas /programas/lidera responde com página completa — os
outros 14 são 404 controlado até a Fase 2 da portagem.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 — Build + smoke test do LIDERA

**Files:** nenhum modificado. Validação final.

- [ ] **Step 8.1 — Build de produção**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -30`
Expected: build OK, sem erros. Saída lista `/programas/lidera` entre as rotas geradas estaticamente.

- [ ] **Step 8.2 — Subir dev server**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm dev` (em background ou em terminal separado — **não usar `db:push` em paralelo**, conforme `feedback_db_push_paralelo`).

- [ ] **Step 8.3 — Smoke test visual (humano)**

**Ação do agente:** parar e pedir validação humana.

Mensagem ao usuário:
> "Andaime e LIDERA implementados. Servidor de dev no ar em http://localhost:3000.
>
> Por favor verifique:
> 1. `http://localhost:3000/programas/lidera` carrega completo (todas as 10 seções + breadcrumb + hero + meta-bar + FAQ funcional + programas relacionados).
> 2. Mega-menu "Programas" do header navega para `/programas/lidera` corretamente.
> 3. Os outros 14 itens do mega-menu retornam 404 (esperado nesta fase).
> 4. Comparação com `10_Pagina_Programa_LIDERA_v1.html` (aberto no navegador via `file://`) — desktop 1440 + mobile 375.
>
> Reporte qualquer discrepância visual ou de comportamento antes da Fase 2."

**Não avançar para a Fase 2 sem aprovação humana explícita** (CLAUDE.md §6 + `feedback_validacao_visual`).

- [ ] **Step 8.4 — Após aprovação humana, fechar a Fase 1**

Nenhum commit adicional necessário (todos os commits anteriores já estão registrados). A Fase 2 (14 programas restantes) entrará num plano próprio.

---

## Encerramento

Após a Task 8 com aprovação humana:
- Anunciar fim da Fase 1.
- Sugerir próximo plano: `2026-05-22-paginas-programa-fase2-restantes.md` — portagem dos 14 programas restantes, com checkpoint visual a cada 3.
