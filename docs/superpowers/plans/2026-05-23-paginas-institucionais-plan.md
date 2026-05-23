# Páginas Institucionais — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente os 5 protótipos HTML institucionais (Política de Privacidade, Termos de Uso, Política de Cookies, LGPD, Mapa do Site) para rotas reais do Next.js no monorepo, com paridade visual 100% aos HTMLs aprovados.

**Architecture:** Route group `apps/web/app/(institucional)/` reaproveitando `HeaderHome` + `FooterHome` da Home v3. Um único `institucional-prototipo.css` literalmente extraído do `<style>` inline (idêntico nos 5 protótipos), importado no `apps/web/app/layout.tsx` (padrão de carregamento de CSS do projeto). Cada página é Server Component com `<main>` traduzido literal do protótipo correspondente; sem extração de subcomponentes, sem CMS, sem `conteudoXxx.ts`. Texto institucional hard-coded no JSX.

**Tech Stack:** Next.js 15 App Router, React Server Components, TypeScript strict, Tailwind 4 (não usado nos `<main>` portados, que rodam só com CSS literal), pnpm + Turbo. Sem novas dependências.

**Spec:** `docs/superpowers/specs/2026-05-22-paginas-institucionais-design.md`.

**Decisões locais herdadas:**

- Memória `project_porta_html.md` — padrão CSS literal + route group + header/footer dedicados.
- Memória `feedback_cms_apenas_quando_pedido.md` — não modelar CMS, texto fica no JSX.
- Memória `feedback_porta_html_fidelidade.md` — 100% fidelidade ao protótipo, ler `<main>` inteiro antes de portar.
- Memória `feedback_validacao_visual.md` — checkpoint visual fica para o usuário fazer no navegador, não automatizar screenshot.
- CLAUDE.md §3 (sistema visual), §4 (stack), §5 (anti-improvisação), §6 (checkpoints).

**Tabela de reescrita de hrefs** (aplicada em todos os `<a>` dos `<main>`):

| HREF no protótipo | Substituição |
|-------------------|--------------|
| `./02_Prototipo_Home_GrupoNTC_v2_6.html` | `/` |
| `./02_Prototipo_Home_GrupoNTC_v2_6.html#conteudos` | `/#conteudos` |
| `./08_Pagina_O_Grupo_NTC_v3.html` | `/o-grupo` |
| `./25_Pagina_Corpo_Docente_v1.html` | `/o-grupo/corpo-docente` |
| `./07_Pagina_Vertical_NTC_Educacao_v1.html` | `/solucoes-estrategicas/ntc-educacao` |
| `./07_Pagina_Vertical_NTC_GestaoPublica_v1.html` | `/solucoes-estrategicas/ntc-gestao-publica` |
| `./07_Pagina_Vertical_NTC_Saude_v1.html` | `/solucoes-estrategicas/ntc-saude` |
| `./XX_Pagina_Programa_<SIGLA>_v1.html` | `/programas/<sigla-minúscula>` |
| `./30_Pagina_Privacidade_v1.html` | `/politica-de-privacidade` |
| `./31_Pagina_Termos_v1.html` | `/termos-de-uso` |
| `./32_Pagina_Cookies_v1.html` | `/politica-de-cookies` |
| `./33_Pagina_LGPD_v1.html` | `/lgpd` |
| `./34_Pagina_MapaDoSite_v1.html` | `/mapa-do-site` |
| `./09_Pagina_Agenda_v2.html` (+ âncoras) | `#` (rota não portada) |
| `./12_Pagina_Contato_v1.html` (+ âncoras) | `#` (rota não portada) |
| `./26_Pagina_Solucoes_v1.html` (+ âncoras) | `#` (rota não portada) |
| `./27_Pagina_EventOn_v1.html` | `#` (rota não portada) |
| `./28_Pagina_EventOn_Detalhe_v1.html` | `#` (rota não portada) |
| `./29_Pagina_Area_Participante_v1.html` | `#` (rota não portada) |
| `./03_Pagina_Evento_PROSUS_Brasilia_v3.html` | `#` (rota não portada) |
| `./04_Pagina_Evento_EDUTEC_M01_Online_v2.html` | `#` (rota não portada) |
| `./05_Pagina_Evento_AGIP_SP_Hibrido_v1.html` | `#` (rota não portada) |
| `mailto:*`, `tel:*`, links externos `https://*` | preservar literal |

**Regras gerais de tradução HTML → JSX (aplicar em todas as portas):**

- `class=` → `className=`
- `for=` → `htmlFor=`
- `style="prop: valor; prop2: valor2"` → `style={{ prop: 'valor', prop2: 'valor2' }}` (camelCase)
- `<!-- ... -->` → `{/* ... */}` quando útil para navegação; remover comentários puramente decorativos do tipo `===========`
- `<svg>` inline: preservar atributos com hífen via JSX (`viewBox`, `strokeLinecap`, `strokeLinejoin`, `strokeWidth`, `fill`, `stroke`, `aria-hidden`)
- `data-*`, `aria-*`, `data-cms-link` permanecem como string literais no JSX
- Entidades HTML: usar caractere Unicode direto no JSX (ex.: `·`, `—`, `→`, `&` apenas se necessário codificar para JSX como `{"&"}`)
- `<a>` interno: usar `<Link href="...">` do `next/link` quando aponta para rota Next portada; manter `<a href="#">` para rotas não portadas (sem prefetch desnecessário)
- Não declarar `"use client"` em nenhum page.tsx do plano

---

## File Structure

Arquivos a criar:

- `apps/web/app/institucional-prototipo.css` — CSS literal extraído do `<style>` de qualquer um dos 5 protótipos (são idênticos; usar o do 30 como fonte canônica)
- `apps/web/app/(institucional)/layout.tsx` — Server Component, monta HeaderHome + children + FooterHome
- `apps/web/app/(institucional)/politica-de-privacidade/page.tsx`
- `apps/web/app/(institucional)/termos-de-uso/page.tsx`
- `apps/web/app/(institucional)/politica-de-cookies/page.tsx`
- `apps/web/app/(institucional)/lgpd/page.tsx`
- `apps/web/app/(institucional)/mapa-do-site/page.tsx`

Arquivos a modificar:

- `apps/web/app/layout.tsx` — adicionar `import "./institucional-prototipo.css";` no bloco de imports de CSS portados

Total: 7 arquivos novos, 1 modificado.

---

## Task 1: Extrair CSS literal compartilhado para `institucional-prototipo.css`

**Files:**
- Create: `apps/web/app/institucional-prototipo.css`

**Verificação prévia** (já feita durante o brainstorming, registrada aqui para o executor confirmar):

```bash
diff <(sed -n '50,346p' 30_Pagina_Privacidade_v1.html) \
     <(sed -n '50,346p' 31_Pagina_Termos_v1.html)
# Esperado: saída vazia (0 linhas)

diff <(sed -n '50,346p' 30_Pagina_Privacidade_v1.html) \
     <(sed -n '50,346p' 33_Pagina_LGPD_v1.html)
# Esperado: saída vazia (0 linhas)

diff <(sed -n '50,346p' 30_Pagina_Privacidade_v1.html) \
     <(sed -n '50,346p' 34_Pagina_MapaDoSite_v1.html)
# Esperado: saída vazia (0 linhas)
```

Se algum diff produzir saída diferente de vazia, parar e reportar — significa que o pressuposto da spec mudou.

- [ ] **Step 1: Confirmar os diffs**

Rodar os 3 comandos `diff` acima na raiz do repositório. Esperado: 3 saídas vazias.

- [ ] **Step 2: Verificar o protótipo completo do bloco `<style>`**

```bash
sed -n '50,346p' 30_Pagina_Privacidade_v1.html | wc -l
# Esperado: 297 linhas
```

Confirmar que linhas 50 e 346 são respectivamente `<style>` e `</style>` (ou a abertura/fechamento esperados):

```bash
sed -n '50p;346p' 30_Pagina_Privacidade_v1.html
# Esperado:
#   <style>
#   </style>
```

- [ ] **Step 3: Criar `apps/web/app/institucional-prototipo.css`**

Conteúdo: copiar **byte-a-byte** as linhas **51 a 345** do `30_Pagina_Privacidade_v1.html` (i.e., o conteúdo interno do `<style>...</style>`, sem incluir as próprias tags `<style>` e `</style>`).

Inserir no topo do arquivo, antes do `:root`, um comentário CSS curto (1 linha) identificando origem:

```css
/* CSS literal extraído de 30_Pagina_Privacidade_v1.html linhas 51-345.
   Idêntico nos protótipos 30, 31, 32, 33 e 34 (verificado por diff). */
```

Não fazer nenhuma alteração no conteúdo CSS — preservar exatamente comentários, espaços, ordem de regras.

- [ ] **Step 4: Validar sintaxe CSS via build**

Não há lint CSS isolado no projeto. A validação acontece via `pnpm build` na Task 8. Aqui, apenas conferir que o arquivo abre sem erro:

```bash
wc -l apps/web/app/institucional-prototipo.css
# Esperado: ~297 linhas (295 do <style> + ~2 do comentário de cabeçalho)

head -5 apps/web/app/institucional-prototipo.css
# Esperado: ver o comentário + :root { ou tokens
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/institucional-prototipo.css
git commit -m "$(cat <<'EOF'
feat(institucional): extrai CSS literal compartilhado das 5 páginas

Bloco <style> idêntico nos protótipos 30 (Privacidade), 31 (Termos),
32 (Cookies), 33 (LGPD) e 34 (Mapa do Site) — verificado por diff
byte-a-byte. Extraído de 30_Pagina_Privacidade_v1.html (linhas 51-345)
para apps/web/app/institucional-prototipo.css.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar o CSS no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx` — adicionar 1 import + comentário

- [ ] **Step 1: Localizar o ponto exato de inserção**

Abrir `apps/web/app/layout.tsx`. O bloco de imports de CSS portado termina na linha do `import "./corpo-docente-prototipo.css";` (linha 44 na revisão atual). O novo import vai imediatamente abaixo, antes do bloco de docstring/`metadata`.

- [ ] **Step 2: Inserir o import**

Adicionar logo após `import "./corpo-docente-prototipo.css";`:

```ts
// CSS das 5 páginas institucionais (/politica-de-privacidade,
// /termos-de-uso, /politica-de-cookies, /lgpd, /mapa-do-site).
// Portado literal de 30_Pagina_Privacidade_v1.html (linhas 51-345).
// Os 5 HTMLs institucionais compartilham o MESMO <style> — diff
// byte-a-byte confirmou. Tokens base e regras de header/footer/btn
// já vêm de home-prototipo.css.
import "./institucional-prototipo.css";
```

- [ ] **Step 3: Verificar que o arquivo continua válido**

```bash
pnpm --filter web typecheck
# Esperado: sem erros (o import de CSS não é tipado, mas o tsc valida o resto)
```

Se houver erro, reverter e investigar.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(institucional): importa institucional-prototipo.css no root layout

Padrão idêntico ao dos demais CSSs portados (home, o-grupo, programas,
verticais, corpo-docente). Necessário para que as 5 páginas do route
group (institucional) carreguem o CSS via Next 15, que não serve CSS
por path do route group.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar layout do route group `(institucional)`

**Files:**
- Create: `apps/web/app/(institucional)/layout.tsx`

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo:

```tsx
import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";

/**
 * Layout das 5 páginas institucionais:
 *   /politica-de-privacidade
 *   /termos-de-uso
 *   /politica-de-cookies
 *   /lgpd
 *   /mapa-do-site
 *
 * Portadas literalmente dos protótipos 30, 31, 32, 33 e 34. Os 5
 * compartilham o mesmo header, o mesmo footer e o mesmo bloco <style>
 * inline — todos consolidados em apps/web/app/institucional-prototipo.css
 * (importado no root layout) e nos componentes `HeaderHome`/`FooterHome`
 * do route group (home).
 */
export default function LayoutInstitucional({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
    </>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

```bash
pnpm --filter web typecheck
# Esperado: sem erros
```

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(institucional)/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): adiciona layout do route group institucional

Reaproveita HeaderHome e FooterHome do (home), mesmo padrão de
(o-grupo)/layout.tsx, (programas)/layout.tsx e (vertical)/layout.tsx.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Portar `/politica-de-privacidade` (protótipo 30)

**Files:**
- Create: `apps/web/app/(institucional)/politica-de-privacidade/page.tsx`

**Origem:** `30_Pagina_Privacidade_v1.html` linhas 512–769 (`<main id="main">...</main>`).

- [ ] **Step 1: Ler o `<main>` completo do protótipo**

```bash
sed -n '512,769p' 30_Pagina_Privacidade_v1.html
```

Capturar mentalmente todas as seções: hero-page, legal-subnav, legal-shell (com legal-aside + legal-content), 12 sections numeradas (controlador, escopo, dados-coletados, finalidades, compartilhamento, transferencia, retencao, seguranca, direitos, encarregado, incidentes, alteracoes), dpo-card, legal-cta-final.

- [ ] **Step 2: Criar o page.tsx**

Estrutura do arquivo:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade · Grupo NTC",
  description:
    "Política de Privacidade do Instituto NTC do Brasil · LGPD · Lei 13.709/2018 · canais oficiais do Encarregado (DPO), direitos do titular, bases legais e governança institucional do Grupo NTC.",
  alternates: { canonical: "https://www.grupontc.com.br/politica-de-privacidade" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Política de Privacidade · Grupo NTC",
    description:
      "Tratamento de dados pessoais no Grupo NTC: bases legais, direitos do titular, DPO e governança institucional.",
    url: "https://www.grupontc.com.br/politica-de-privacidade",
    images: [
      {
        url: "https://www.grupontc.com.br/img/og/og-institucional.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Privacidade · Grupo NTC",
    description:
      "Tratamento de dados pessoais no Grupo NTC: bases legais, direitos do titular, DPO e governança institucional.",
  },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main id="main">
      {/* JSX traduzido literal das linhas 512–769 do protótipo 30. */}
    </main>
  );
}
```

A partir daí, traduzir o conteúdo completo do `<main>` para JSX dentro do `return`. Regras:

- Toda string `class="..."` → `className="..."`.
- Atributo `style="..."` inline → objeto JSX em camelCase (ex.: `style={{ color: 'var(--pergaminho)' }}`).
- Comentários decorativos HTML do tipo `<!-- ========================== HERO ========================== -->` → preservar como comentários JSX `{/* HERO INSTITUCIONAL */}` (curtos, sem o `==========`).
- `<a href="./XX_Pagina_Yyy.html">` interno → `<Link href="/rota">` conforme tabela §6.1 da spec.
- `<a href="mailto:...">` ou `<a href="tel:...">` ou âncoras locais (`#secao`) → `<a href="...">` (não trocar por `<Link>`).
- `data-cms-link="..."` → manter como string literal.
- `<svg>` do ícone DPO (linhas 713–715): preservar exatamente, atenção aos atributos `viewBox`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2.2"`, `strokeLinecap="round"`, `strokeLinejoin="round"`. Em JSX, os atributos hifenizados viram camelCase.
- Marcador `data-cms-link="legal-privacidade"` aparece **apenas em comentário** no HTML (linha 36), não em elemento. Não precisa preservar.
- Tabela `class="legal-table"` (3 colunas Categoria/Exemplos/Ponto de coleta + 5 linhas; depois outra de Finalidade/Base legal LGPD com 7 linhas): copiar célula por célula, preservando `<strong>` e `<code>`.
- Lista ordenada `<ol class="numbered">` com 10 itens dos direitos do titular: preservar `<strong>` em cada item.

Links internos a traduzir nesta página (encontrados nas linhas 519, 521, 665, 765):

| Linha origem | href HTML | href JSX |
|--------------|-----------|----------|
| 519 | `./02_Prototipo_Home_GrupoNTC_v2_6.html` | `/` (usar `<Link>`) |
| 521 | `./34_Pagina_MapaDoSite_v1.html` | `/mapa-do-site` (usar `<Link>`) |
| 665 | `./32_Pagina_Cookies_v1.html` | `/politica-de-cookies` (usar `<Link>`) |
| 765 | `./33_Pagina_LGPD_v1.html#exercicio-direitos` | `/lgpd#exercicio-direitos` (usar `<Link>`) |

`<a href="mailto:dpo@institutontc.com.br">` (várias ocorrências) → manter `<a>` literal.

Âncoras internas `#controlador`, `#escopo`, etc. → `<a href="#controlador">` literal.

- [ ] **Step 3: Verificar typecheck**

```bash
pnpm --filter web typecheck
# Esperado: sem erros
```

- [ ] **Step 4: Verificar lint**

```bash
pnpm --filter web lint
# Esperado: sem erros nem warnings novos
```

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(institucional)/politica-de-privacidade/page.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): porta /politica-de-privacidade (protótipo 30)

JSX literal do <main> de 30_Pagina_Privacidade_v1.html (linhas
512-769). Metadata espelha o <head> do protótipo. Links internos
reescritos para rotas Next quando portadas; href="#" para rotas não
portadas (Agenda, Contato, Soluções, EventOn, Área do Participante).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Portar `/termos-de-uso` (protótipo 31)

**Files:**
- Create: `apps/web/app/(institucional)/termos-de-uso/page.tsx`

**Origem:** `31_Pagina_Termos_v1.html` linhas 512–717.

- [ ] **Step 1: Ler o `<main>` completo do protótipo**

```bash
sed -n '512,717p' 31_Pagina_Termos_v1.html
```

- [ ] **Step 2: Criar o page.tsx**

Estrutura igual à Task 4, com metadata adaptada:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso · Grupo NTC",
  description:
    "Termos de Uso dos Canais Digitais do Grupo NTC · sítios institucionais, Plataforma EventOn e Área do Participante · regras de acesso, propriedade intelectual, certificação, contratos institucionais e foro.",
  alternates: { canonical: "https://www.grupontc.com.br/termos-de-uso" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Termos de Uso · Grupo NTC",
    description:
      "Regras de uso dos canais digitais, da Plataforma EventOn e dos eventos formativos do Grupo NTC.",
    url: "https://www.grupontc.com.br/termos-de-uso",
    images: [
      {
        url: "https://www.grupontc.com.br/img/og/og-institucional.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Termos de Uso · Grupo NTC",
    description:
      "Regras de uso dos canais digitais, da Plataforma EventOn e dos eventos formativos do Grupo NTC.",
  },
};

export default function TermosDeUsoPage() {
  return (
    <main id="main">
      {/* JSX traduzido literal das linhas 512–717 do protótipo 31. */}
    </main>
  );
}
```

Traduzir o `<main>` completo aplicando as regras gerais. Identificar e reescrever todos os `<a href="./XX_..._.html">` conforme tabela §6.1.

- [ ] **Step 3: Auditar links internos do `<main>`**

```bash
grep -n 'href="\./' 31_Pagina_Termos_v1.html | sed -n '/^5[12][0-9]\|^6[0-9]\{2\}\|^71[0-7]/p'
```

Para cada match, decidir pela tabela §6.1 da spec se vira `<Link href="/rota">` (rota portada), `<a href="#">` (não portada), ou âncora interna `<a href="#secao">`.

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter web typecheck && pnpm --filter web lint
```

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(institucional)/termos-de-uso/page.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): porta /termos-de-uso (protótipo 31)

JSX literal do <main> de 31_Pagina_Termos_v1.html (linhas 512-717).
Metadata espelha o <head> do protótipo. Links internos reescritos
conforme tabela de hrefs do plano.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Portar `/politica-de-cookies` (protótipo 32)

**Files:**
- Create: `apps/web/app/(institucional)/politica-de-cookies/page.tsx`

**Origem:** `32_Pagina_Cookies_v1.html` linhas 512–725.

- [ ] **Step 1: Ler o `<main>` completo do protótipo**

```bash
sed -n '512,725p' 32_Pagina_Cookies_v1.html
```

- [ ] **Step 2: Criar o page.tsx**

Estrutura igual à Task 4, com metadata adaptada (extrair título, description, canonical, og, twitter das linhas 6–24 do protótipo 32):

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies · Grupo NTC",
  // description, og, twitter — copiar do <head> do protótipo 32.
  alternates: { canonical: "https://www.grupontc.com.br/politica-de-cookies" },
  // ...
};

export default function PoliticaDeCookiesPage() {
  return (
    <main id="main">
      {/* JSX traduzido literal das linhas 512–725 do protótipo 32. */}
    </main>
  );
}
```

Antes de implementar, ler `sed -n '1,30p' 32_Pagina_Cookies_v1.html` para extrair os metadados exatos (title, description, og:title, og:description, twitter:title, twitter:description).

Traduzir o `<main>` completo aplicando regras gerais. Esta página tem tabelas de categorias de cookies (essenciais, performance, marketing) — atenção às tabelas `.legal-table`.

- [ ] **Step 3: Typecheck + lint**

```bash
pnpm --filter web typecheck && pnpm --filter web lint
```

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(institucional)/politica-de-cookies/page.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): porta /politica-de-cookies (protótipo 32)

JSX literal do <main> de 32_Pagina_Cookies_v1.html (linhas 512-725).
Esta página é apenas o texto da política; o banner funcional de
consentimento (CLAUDE.md §12) é trabalho separado.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Portar `/lgpd` (protótipo 33)

**Files:**
- Create: `apps/web/app/(institucional)/lgpd/page.tsx`

**Origem:** `33_Pagina_LGPD_v1.html` linhas 512–721.

- [ ] **Step 1: Ler o `<main>` completo + metadata**

```bash
sed -n '1,30p' 33_Pagina_LGPD_v1.html   # head para metadata
sed -n '512,721p' 33_Pagina_LGPD_v1.html
```

- [ ] **Step 2: Criar o page.tsx**

Mesma estrutura das tasks anteriores. Metadata: title "LGPD · Grupo NTC", canonical `/lgpd`.

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LGPD · Grupo NTC",
  description: /* copiar do <head> */,
  alternates: { canonical: "https://www.grupontc.com.br/lgpd" },
  openGraph: { /* copiar */ },
  twitter: { /* copiar */ },
};

export default function LgpdPage() {
  return (
    <main id="main">
      {/* JSX traduzido literal das linhas 512–721 do protótipo 33. */}
    </main>
  );
}
```

Atenção especial: a página tem âncora `#exercicio-direitos` (referenciada pela `/politica-de-privacidade` na CTA final). Garantir que essa âncora exista no JSX traduzido (provavelmente um `<section id="exercicio-direitos">` no protótipo).

Links internos a traduzir nesta página (encontrados nas linhas 697–700):

| Linha origem | href HTML | href JSX |
|--------------|-----------|----------|
| 697 | `./30_Pagina_Privacidade_v1.html` | `/politica-de-privacidade` |
| 698 | `./32_Pagina_Cookies_v1.html` | `/politica-de-cookies` |
| 699 | `./31_Pagina_Termos_v1.html` | `/termos-de-uso` |
| 700 | `./34_Pagina_MapaDoSite_v1.html` | `/mapa-do-site` |

- [ ] **Step 3: Typecheck + lint**

```bash
pnpm --filter web typecheck && pnpm --filter web lint
```

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(institucional)/lgpd/page.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): porta /lgpd (protótipo 33)

JSX literal do <main> de 33_Pagina_LGPD_v1.html (linhas 512-721).
Mantém âncora #exercicio-direitos referenciada pela Política de
Privacidade.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Portar `/mapa-do-site` (protótipo 34)

**Files:**
- Create: `apps/web/app/(institucional)/mapa-do-site/page.tsx`

**Origem:** `34_Pagina_MapaDoSite_v1.html` linhas 512–756.

Esta página é a **mais densa em links** — é literalmente um índice de todas as rotas. Cada `<a>` precisa ser auditado individualmente pela tabela §6.1.

- [ ] **Step 1: Ler o `<main>` completo + metadata**

```bash
sed -n '1,30p' 34_Pagina_MapaDoSite_v1.html
sed -n '512,756p' 34_Pagina_MapaDoSite_v1.html
```

- [ ] **Step 2: Auditar todos os links do `<main>`**

```bash
grep -n 'href="' 34_Pagina_MapaDoSite_v1.html | awk -F: '$1 >= 512 && $1 <= 756 {print}'
```

Para cada match, classificar:

- ✅ portada (home, o-grupo, corpo-docente, programas/[slug], solucoes-estrategicas/[area], institucional/[5 páginas]) → `<Link href="/rota">`
- ⏳ não portada (agenda, eventos individuais, contato, soluções comerciais, EventOn, área do participante) → `<a href="#">`
- mailto → `<a href="mailto:...">`

Listar a contagem final no resumo da sessão.

- [ ] **Step 3: Criar o page.tsx**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mapa do Site · Grupo NTC",
  description: /* copiar do <head> */,
  alternates: { canonical: "https://www.grupontc.com.br/mapa-do-site" },
  openGraph: { /* copiar */ },
  twitter: { /* copiar */ },
};

export default function MapaDoSitePage() {
  return (
    <main id="main">
      {/* JSX traduzido literal das linhas 512–756 do protótipo 34. */}
    </main>
  );
}
```

Estrutura do `<main>`:

- hero-page com breadcrumb, eyebrow, h1, subtitle, hero-meta
- legal-subnav com 5 âncoras (institucional, verticais, programas, capacitacao, comercial)
- legal-shell com legal-aside (sumário de 6 itens) + legal-content
- 6 sections numeradas: institucional (3 links), verticais (3 links), programas (15 links), capacitacao (7 links), comercial (8 links), governanca (8 links — incluindo mailto e auto-referência `aria-current="page"`)
- legal-cta-final com 2 botões (contato + agenda — ambos `href="#"` por enquanto)

**Atenção:** o link de auto-referência na linha 734 (`<a href="./34_Pagina_MapaDoSite_v1.html" aria-current="page">`) vira `<Link href="/mapa-do-site" aria-current="page">` — preservar o atributo `aria-current`.

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter web typecheck && pnpm --filter web lint
```

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(institucional)/mapa-do-site/page.tsx"
git commit -m "$(cat <<'EOF'
feat(institucional): porta /mapa-do-site (protótipo 34)

JSX literal do <main> de 34_Pagina_MapaDoSite_v1.html (linhas 512-756).
Índice de todas as páginas-mãe do portal — links classificados em
rotas portadas (Link do next/link) e rotas pendentes (href="#" + comentário).
A contagem final de links portados vs pendentes vai no resumo da sessão.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Validação técnica integrada

**Files:** nenhum modificado, só verificações.

- [ ] **Step 1: Typecheck completo do monorepo**

```bash
pnpm typecheck
# Esperado: sem erros em nenhum pacote
```

- [ ] **Step 2: Lint completo do monorepo**

```bash
pnpm lint
# Esperado: sem erros nem warnings novos
```

- [ ] **Step 3: Build de produção**

```bash
pnpm build
# Esperado: build bem-sucedido; logs devem mencionar as 5 novas rotas:
#   ○ /politica-de-privacidade
#   ○ /termos-de-uso
#   ○ /politica-de-cookies
#   ○ /lgpd
#   ○ /mapa-do-site
```

Se o build falhar, identificar a página culpada pelo log e voltar à task correspondente. Não usar `// @ts-ignore` nem suprimir warnings — corrigir o root cause (CLAUDE.md §5.7).

- [ ] **Step 4: Smoke test em dev**

```bash
pnpm dev:web
# Aguardar até "ready in Xms" + "Local: http://localhost:3000"
```

Em outro terminal, verificar HTTP 200 em todas as 5 rotas:

```bash
for r in politica-de-privacidade termos-de-uso politica-de-cookies lgpd mapa-do-site; do
  printf "%-25s " "$r"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/$r"
done
# Esperado: 5 linhas com "200"
```

- [ ] **Step 5: Não commitar — task de verificação somente**

Se algo falhou, voltar atrás e corrigir nas tasks correspondentes. Se tudo passou, seguir para a Task 10.

---

## Task 10: Checkpoint visual com o usuário

**Files:** nenhum.

Esta task **não tem código**. É um checkpoint humano conforme CLAUDE.md §6 e memória `feedback_validacao_visual.md`.

- [ ] **Step 1: Manter o `pnpm dev:web` rodando**

Servidor já deve estar no ar pela Task 9. Se não estiver:

```bash
pnpm dev:web
```

- [ ] **Step 2: Apresentar as 5 URLs ao usuário**

Mensagem ao usuário:

```
As 5 páginas institucionais estão prontas para revisão visual:

- http://localhost:3000/politica-de-privacidade  → comparar com 30_Pagina_Privacidade_v1.html
- http://localhost:3000/termos-de-uso            → comparar com 31_Pagina_Termos_v1.html
- http://localhost:3000/politica-de-cookies      → comparar com 32_Pagina_Cookies_v1.html
- http://localhost:3000/lgpd                     → comparar com 33_Pagina_LGPD_v1.html
- http://localhost:3000/mapa-do-site             → comparar com 34_Pagina_MapaDoSite_v1.html

Abra cada uma em paralelo com o HTML original e me aponte qualquer
diferença visual (espaçamento, hierarquia, cor, fonte, ícones). Não
declarei "pronto" — aguardo seu OK por página antes de fechar a
sessão.
```

- [ ] **Step 3: Aguardar feedback humano**

Não declarar conclusão até o usuário aprovar explicitamente cada URL ou listar correções pendentes. Se houver correções, voltar à task correspondente (4–8), aplicar, repetir o checkpoint visual para aquela página.

- [ ] **Step 4: Resumo da sessão**

Quando o usuário aprovar tudo, escrever resumo em até 10 linhas:
- O que foi feito (5 páginas portadas + 1 CSS + 1 layout + import).
- Quantos links de `/mapa-do-site` apontam para rotas reais vs `href="#"` (com a lista dos protótipos pendentes: 03, 04, 05, 09, 12, 26, 27, 28, 29).
- Pendências para próximas sessões: porta de Agenda, Contato, Soluções, EventOn, Área do Participante; banner funcional de cookies (CLAUDE.md §12) ainda fora de escopo.
- Próximo passo sugerido pelo usuário.

---

## Critérios de aceitação (resumo)

- [x] Spec aprovada (`docs/superpowers/specs/2026-05-22-paginas-institucionais-design.md`).
- [ ] CSS `institucional-prototipo.css` criado e idêntico ao `<style>` de qualquer um dos 5 protótipos.
- [ ] CSS importado em `apps/web/app/layout.tsx`.
- [ ] Layout `(institucional)/layout.tsx` reaproveita HeaderHome + FooterHome.
- [ ] 5 `page.tsx` criados, cada um com `<main>` literal + metadata.
- [ ] `pnpm typecheck` passa.
- [ ] `pnpm lint` passa.
- [ ] `pnpm build` passa.
- [ ] As 5 rotas respondem 200 em `pnpm dev:web`.
- [ ] Usuário aprovou visualmente cada uma das 5 páginas.

---

## Notas de execução

- **Não usar `// @ts-ignore` nem suprimir lint.** Se algo não compila, corrigir a causa.
- **Não pular o checkpoint visual.** O servidor fica no ar; o usuário aprova; só então a sessão fecha.
- **Não criar `conteudoXxx.ts` para essas 5 páginas.** O usuário explicitou texto literal hard-coded no JSX durante o brainstorming.
- **Não tocar em `BannerCookies` nem em outras páginas existentes.**
- **Commits pequenos por task** — 1 commit por arquivo principal, conforme o template de cada task acima.
