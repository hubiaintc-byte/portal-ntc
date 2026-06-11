# Responsividade Mobile — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o overflow horizontal (barra branca lateral) no mobile, reintroduzir animações de fade-in ao rolar com 4 camadas de segurança, e otimizar elementos mal dimensionados em 375/412px.

**Architecture:** Abordagem híbrida — diagnóstico automatizado via Playwright em viewport mobile + correções cirúrgicas nos CSS portados + trava global `overflow-x: clip`. Animações via IntersectionObserver guardadas pela classe `html.anim-scroll` (adicionada por script inline antes do primeiro paint), de modo que sem JS a página nasce 100% visível.

**Tech Stack:** Next.js 15 App Router, CSS literal portado (13 arquivos em `apps/web/app/*.css`), Playwright (a instalar como devDependency), pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-06-11-responsividade-mobile-design.md`

---

## Fatos do codebase que o executor precisa saber

1. **Cascata global única.** O layout raiz `apps/web/app/layout.tsx` importa TODOS os 13 CSS portados (linhas 16–102, ordem: home → o-grupo → verticais → programas → corpo-docente → institucional → contato → agenda → solucoes → conteudos → capacitacao → evento → modulo). Regras `.fade-in` de um arquivo valem para todas as páginas.
2. **Regras `.fade-in` escondidas (opacity: 0) existem em 10 arquivos**, todas em linha única começando em coluna 0:
   - `apps/web/app/institucional-prototipo.css:295`
   - `apps/web/app/modulo-prototipo.css:1327`
   - `apps/web/app/solucoes-prototipo.css:1001`
   - `apps/web/app/capacitacao-prototipo.css:1286`
   - `apps/web/app/programas-prototipo.css:1305`
   - `apps/web/app/agenda-prototipo.css:1327`
   - `apps/web/app/conteudos-prototipo.css:1240`
   - `apps/web/app/evento-prototipo.css:1327`
   - `apps/web/app/corpo-docente-prototipo.css:1255`
   - `apps/web/app/contato-prototipo.css:932`
3. **`home-prototipo.css` (~linha 1363) neutraliza** `.fade-in, .fade-in.is-visible { opacity: 1; transform: none; }` com um comentário explicando a remoção do IO. Esse bloco será substituído (Task 7).
4. **`InteracoesScroll.tsx`** vive em `apps/web/app/(home)/InteracoesScroll.tsx` e é importado pelos layouts de todos os route groups. Hoje revela tudo no mount. Ele NÃO re-executa em navegação SPA dentro do mesmo route group (layouts persistem) — a nova versão corrige isso com `usePathname`.
5. **Rotas públicas e slugs reais** (para o script de diagnóstico):
   `/`, `/agenda`, `/agenda/prosus-brasilia` (presencial), `/agenda/edutec-m01-2026` (online), `/capacitacao`, `/conteudos`, `/contato`, `/lgpd`, `/mapa-do-site`, `/politica-de-cookies`, `/politica-de-privacidade`, `/termos-de-uso`, `/o-grupo`, `/o-grupo/corpo-docente`, `/programas/edutec`, `/programas/edutec/modulos/m01`, `/solucoes`, `/solucoes-estrategicas/educacao`, `/solucoes-estrategicas/gestao-publica`, `/solucoes-estrategicas/saude`.
6. **Servidor de desenvolvimento:** use `pnpm dev:web` (APENAS o Next, porta 3000). NÃO rode o Payload em paralelo (memória do projeto: risco de db push concorrente). As páginas têm fallback estático quando o CMS não responde.
7. **Não commitar `.DS_Store`** (está modificado no working tree). Sempre `git add` com caminhos explícitos.
8. **Commits em português**, Conventional Commits, sem emojis (CLAUDE.md §7.2).

---

### Task 1: Instalar Playwright e criar o script de diagnóstico mobile

**Files:**
- Modify: `package.json` (raiz — devDependency via pnpm)
- Create: `scripts/diagnostico-mobile.mjs`

- [ ] **Step 1: Instalar Playwright na raiz do workspace**

```bash
cd /Users/joao/Documents/portal-ntc
pnpm add -D -w playwright
pnpm exec playwright install chromium
```

Expected: `playwright` em `devDependencies` do `package.json` raiz; chromium baixado sem erro.

- [ ] **Step 2: Criar `scripts/diagnostico-mobile.mjs`**

```js
/**
 * Diagnóstico de responsividade mobile do portal.
 *
 * Modos (flags combináveis):
 *   node scripts/diagnostico-mobile.mjs                 → relatório de overflow horizontal
 *   node scripts/diagnostico-mobile.mjs --estrito       → exit 1 se houver qualquer ofensor
 *   node scripts/diagnostico-mobile.mjs --animacoes     → valida fade-in ao rolar (nada invisível)
 *   node scripts/diagnostico-mobile.mjs --screenshots   → captura fullPage de cada rota
 *
 * Requer o site no ar (pnpm dev:web). BASE_URL sobrepõe http://localhost:3000.
 * Saída em /tmp/diagnostico-mobile/.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SAIDA = "/tmp/diagnostico-mobile";

const ROTAS = [
  "/",
  "/agenda",
  "/agenda/prosus-brasilia",
  "/agenda/edutec-m01-2026",
  "/capacitacao",
  "/conteudos",
  "/contato",
  "/lgpd",
  "/mapa-do-site",
  "/politica-de-cookies",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/o-grupo",
  "/o-grupo/corpo-docente",
  "/programas/edutec",
  "/programas/edutec/modulos/m01",
  "/solucoes",
  "/solucoes-estrategicas/educacao",
  "/solucoes-estrategicas/gestao-publica",
  "/solucoes-estrategicas/saude",
];

const VIEWPORTS = [
  { nome: "iphone-375", width: 375, height: 812 },
  { nome: "android-412", width: 412, height: 915 },
];

const flags = new Set(process.argv.slice(2));
mkdirSync(SAIDA, { recursive: true });

/** Coleta elementos que vazam horizontalmente do viewport. */
async function coletarOfensores(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const ofensores = [];
    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > vw + 1 || rect.left < -1) {
        const classes = el.className && typeof el.className === "string"
          ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
          : "";
        ofensores.push({
          seletor: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + classes,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          largura: Math.round(rect.width),
        });
      }
    }
    return {
      larguraDocumento: document.documentElement.scrollWidth,
      larguraViewport: vw,
      ofensores: ofensores.slice(0, 40),
    };
  });
}

/** Rola até o fim e verifica se algum .fade-in ficou invisível. */
async function validarAnimacoes(page) {
  const temGuarda = await page.evaluate(() =>
    document.documentElement.classList.contains("anim-scroll"),
  );
  // Rola em passos de meia tela até o fim, dando tempo ao IntersectionObserver.
  await page.evaluate(async () => {
    const passo = window.innerHeight / 2;
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y <= total; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1000);
  const invisiveis = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".fade-in"))
      .filter((el) => {
        const visivelNoLayout = el.getClientRects().length > 0;
        return visivelNoLayout && !el.classList.contains("is-visible");
      })
      .map((el) => el.tagName.toLowerCase() + "." + String(el.className).trim().split(/\s+/).slice(0, 3).join(".")),
  );
  return { temGuarda, invisiveis };
}

const navegador = await chromium.launch();
let totalOfensores = 0;
let totalInvisiveis = 0;
const relatorio = [];

for (const vp of VIEWPORTS) {
  const contexto = await navegador.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await contexto.newPage();

  for (const rota of ROTAS) {
    await page.goto(BASE + rota, { waitUntil: "networkidle", timeout: 30000 });
    const linha = { viewport: vp.nome, rota };

    const overflow = await coletarOfensores(page);
    linha.overflow = overflow;
    if (overflow.ofensores.length > 0) {
      totalOfensores += overflow.ofensores.length;
      console.log(`\n✗ ${vp.nome} ${rota} — doc ${overflow.larguraDocumento}px > viewport ${overflow.larguraViewport}px`);
      for (const o of overflow.ofensores) {
        console.log(`   ${o.seletor}  left:${o.left} right:${o.right} largura:${o.largura}`);
      }
    } else {
      console.log(`✓ ${vp.nome} ${rota}`);
    }

    if (flags.has("--animacoes")) {
      const anim = await validarAnimacoes(page);
      linha.animacoes = anim;
      if (anim.invisiveis.length > 0) {
        totalInvisiveis += anim.invisiveis.length;
        console.log(`   ✗ fade-in invisíveis após rolar: ${anim.invisiveis.join(", ")}`);
      }
    }

    if (flags.has("--screenshots")) {
      const nome = `${vp.nome}${rota.replaceAll("/", "_") || "_home"}.png`;
      await page.screenshot({ path: `${SAIDA}/${nome}`, fullPage: true });
    }

    relatorio.push(linha);
  }
  await contexto.close();
}

await navegador.close();
writeFileSync(`${SAIDA}/relatorio.json`, JSON.stringify(relatorio, null, 2));
console.log(`\nRelatório: ${SAIDA}/relatorio.json — ${totalOfensores} ofensor(es) de overflow, ${totalInvisiveis} fade-in invisível(is).`);

if (flags.has("--estrito") && (totalOfensores > 0 || totalInvisiveis > 0)) {
  process.exit(1);
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/diagnostico-mobile.mjs
git commit -m "chore(scripts): diagnostico de overflow e animacoes mobile via playwright"
```

---

### Task 2: Rodar o diagnóstico baseline (esperado: ofensores encontrados)

**Files:** nenhum (só execução)

- [ ] **Step 1: Subir o servidor web em background**

```bash
cd /Users/joao/Documents/portal-ntc
pnpm dev:web
```

Rodar em background; aguardar `Ready` no log (até ~60s). NÃO subir o Payload.

- [ ] **Step 2: Rodar o diagnóstico e guardar o baseline**

```bash
node scripts/diagnostico-mobile.mjs | tee /tmp/diagnostico-mobile/baseline.txt
```

Expected: FAIL lógico — lista de ofensores (este é o "teste vermelho" da auditoria). Suspeitos prováveis: `.curadoria-selo` (home), `.agenda-pagination-item` (/agenda), seta `.nav-group__item.is-active::after` (/o-grupo). Anotar TODOS os ofensores por rota — eles definem o trabalho da Task 3.

---

### Task 3: Correções cirúrgicas de overflow nos CSS portados

**Files:**
- Modify: `apps/web/app/home-prototipo.css` (`.curadoria-selo::after`, linha ~1666)
- Modify: `apps/web/app/agenda-prototipo.css` (`.agenda-pagination-item`, linha ~1664)
- Modify: `apps/web/app/o-grupo-prototipo.css` (`.nav-group__item.is-active::after`, linha ~1190)
- Modify: demais arquivos apontados pelo baseline da Task 2

Regra geral: corrigir SEMPRE dentro de `@media (max-width: ...)` para não alterar o desktop aprovado (§5.6 do CLAUDE.md). Não inventar valores fora dos tokens. Aplicar as correções abaixo APENAS se o ofensor correspondente apareceu no baseline (evidência antes de mexer); ofensores novos seguem o mesmo padrão.

- [ ] **Step 1: Círculo decorativo da home (`.curadoria-selo::after` tem `right: -120px; bottom: -120px; width: 320px`)**

Adicionar ao final do bloco de media queries existente do componente em `home-prototipo.css` (procurar `@media (max-width: 899px)` próximo de `.curadoria-selo`):

```css
@media (max-width: 899px) {
  /* O brilho decorativo vaza 120px para fora do selo e estoura o viewport. */
  .curadoria-selo::after { display: none; }
}
```

- [ ] **Step 2: Paginação da agenda (`flex: 1 1 280px; min-width: 240px` — 4 itens = 1120px)**

Em `agenda-prototipo.css`, junto às media queries existentes da paginação:

```css
@media (max-width: 599px) {
  .agenda-pagination { flex-wrap: wrap; }
  .agenda-pagination-item { flex: 1 1 100%; min-width: 0; max-width: none; }
}
```

- [ ] **Step 3: Seta ativa da nav do O Grupo (`right: -10px`, sem media query)**

Em `o-grupo-prototipo.css`:

```css
@media (max-width: 599px) {
  .nav-group__item.is-active::after { display: none; }
}
```

- [ ] **Step 4: Corrigir os demais ofensores do baseline**

Para cada ofensor restante no `baseline.txt`: localizar a regra no CSS correspondente (`grep -n "<classe>" apps/web/app/*.css`), entender a causa (largura fixa, posicionamento negativo, `min-width`, `white-space: nowrap` sem container rolável) e corrigir com media query mobile. Padrões aceitos: `display: none` para decorativos; `min-width: 0` + `flex-wrap: wrap` para flex; `grid-template-columns: 1fr` para grids; `overflow-x: auto` com `scrollbar-width: thin` para navs horizontais (padrão já usado no projeto).

- [ ] **Step 5: Re-rodar o diagnóstico até zerar**

```bash
node scripts/diagnostico-mobile.mjs --estrito
```

Expected: exit 0, `0 ofensor(es) de overflow`. Se ainda houver, voltar ao Step 4.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/*.css
git commit -m "fix(mobile): elimina overflow horizontal nos CSS portados em viewports moveis"
```

---

### Task 4: Trava global `overflow-x: clip`

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Adicionar a trava após as regras de `html` existentes**

Em `globals.css`, localizar o bloco `html { ... }` existente e adicionar logo abaixo:

```css
/*
 * Rede de segurança contra overflow horizontal em mobile: conteúdo
 * futuro vindo do CMS (títulos longos, tabelas) não pode reabrir a
 * "barra branca lateral". `clip` em vez de `hidden`: não cria contexto
 * de rolagem nem quebra position: sticky no iOS (Safari ≥ 16).
 */
html,
body {
  overflow-x: clip;
}
```

- [ ] **Step 2: Re-rodar o diagnóstico**

```bash
node scripts/diagnostico-mobile.mjs --estrito
```

Expected: exit 0. (O detector usa `getBoundingClientRect`, que continua enxergando elementos vazados mesmo com `clip` — a trava não mascara o diagnóstico.)

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "fix(mobile): trava global overflow-x clip como rede de seguranca"
```

---

### Task 5: Script inline `anim-scroll` no layout raiz

**Files:**
- Modify: `apps/web/app/layout.tsx` (componente `RootLayout`, final do arquivo)

- [ ] **Step 1: Adicionar o script inline como primeiro filho do `<body>`**

No `RootLayout`, antes do skip-link:

```tsx
<body>
  <script
    // Marca que o JS está ativo ANTES do primeiro paint: as regras
    // .fade-in escondidas (opacity: 0) só valem sob html.anim-scroll.
    // Usuários com prefers-reduced-motion nunca recebem o estado escondido.
    dangerouslySetInnerHTML={{
      __html:
        "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim-scroll')}}catch(e){}",
    }}
  />
  <a href="#main" className="skip-link">
```

- [ ] **Step 2: Verificar no navegador**

Com `pnpm dev:web` no ar:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:3000');
  console.log(await p.evaluate(() => document.documentElement.className));
  await b.close();
})();
"
```

Expected: a saída contém `anim-scroll` (junto das classes de fonte).

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat(animacoes): classe anim-scroll via script inline antes do primeiro paint"
```

---

### Task 6: Guardar as regras `.fade-in` dos 10 CSS com `html.anim-scroll`

**Files:**
- Modify: os 10 CSS listados em "Fatos do codebase" item 2

A guarda muda a especificidade: base escondida `html.anim-scroll .fade-in` = (0,2,1). O reveal `.fade-in.is-visible` sem guarda = (0,2,0) PERDERIA para a base. Por isso o reveal também é guardado (vira (0,3,1)) — e a Task 7 cria um reveal global de reforço.

- [ ] **Step 1: Inspecionar os padrões exatos antes do sed**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web
grep -n "^\.fade-in" app/*.css
grep -n "fade-in.is-visible" app/*.css
```

Anotar todas as variantes (a base é `.fade-in { opacity: 0;` em linha única; reveals são `.fade-in.is-visible {` em coluna 0). Linhas INDENTADAS dentro de `@media (prefers-reduced-motion: reduce)` que setam `opacity: 1` NÃO devem ser tocadas (são fallbacks de reveal; a guarda JS já cobre reduced-motion).

- [ ] **Step 2: Aplicar a guarda via sed (exceto home-prototipo.css, tratado na Task 7)**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web/app
for f in institucional modulo solucoes capacitacao programas agenda conteudos evento corpo-docente contato; do
  sed -i '' -E 's/^\.fade-in \{ opacity: 0;/html.anim-scroll .fade-in { opacity: 0;/' "$f-prototipo.css"
  sed -i '' -E 's/^\.fade-in\.is-visible/html.anim-scroll .fade-in.is-visible/' "$f-prototipo.css"
done
```

- [ ] **Step 3: Verificar por grep e diff**

```bash
grep -n "^\.fade-in" app/*.css        # esperado: só home-prototipo.css (fallback intencional)
grep -cn "html.anim-scroll .fade-in" app/*.css | grep -v ":0"
git diff --stat apps/web/app
git diff apps/web/app | head -100
```

Expected: 10 arquivos alterados, cada um com a base e o reveal guardados; nenhuma outra linha tocada. Se alguma variante escapou do sed (ex.: formatação diferente), guardar manualmente com `Edit`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/institucional-prototipo.css apps/web/app/modulo-prototipo.css apps/web/app/solucoes-prototipo.css apps/web/app/capacitacao-prototipo.css apps/web/app/programas-prototipo.css apps/web/app/agenda-prototipo.css apps/web/app/conteudos-prototipo.css apps/web/app/evento-prototipo.css apps/web/app/corpo-docente-prototipo.css apps/web/app/contato-prototipo.css
git commit -m "feat(animacoes): estado escondido do fade-in passa a exigir html.anim-scroll"
```

---

### Task 7: Substituir a neutralização do fade-in na home pelo fallback documentado

**Files:**
- Modify: `apps/web/app/home-prototipo.css` (~linhas 1354–1364)

- [ ] **Step 1: Substituir o bloco neutralizado**

Localizar o bloco (comentário "fade-in foi neutralizado no port" + regra `.fade-in,\n.fade-in.is-visible { opacity: 1; transform: none; }`) e substituir por:

```css
/*
 * .fade-in: o estado-base escondido (opacity: 0) vive nos demais
 * *-prototipo.css, guardado por html.anim-scroll (classe adicionada por
 * script inline no layout raiz ANTES do primeiro paint, exceto com
 * prefers-reduced-motion). Sem JS a página nasce 100% visível (regra
 * abaixo). O reveal guardado tem especificidade (0,3,1) e vence
 * qualquer base escondida (0,2,1), independente da ordem de import.
 * Animação ao rolar: InteracoesScroll.tsx (IntersectionObserver).
 */
.fade-in { opacity: 1; transform: none; }
html.anim-scroll .fade-in.is-visible { opacity: 1; transform: none; }
```

- [ ] **Step 2: Verificação rápida no navegador (estado intermediário esperado)**

Com o dev server no ar, abrir `http://localhost:3000` e rolar: neste ponto o `InteracoesScroll` antigo ainda revela tudo no mount — a página deve continuar 100% visível (nada pode sumir). Conferir também `/agenda` e `/o-grupo`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/home-prototipo.css
git commit -m "feat(animacoes): home passa a usar fallback sem JS + reveal guardado de reforco"
```

---

### Task 8: Reescrever `InteracoesScroll` com IntersectionObserver

**Files:**
- Modify: `apps/web/app/(home)/InteracoesScroll.tsx` (substituição completa)

- [ ] **Step 1: Substituir o conteúdo do arquivo**

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TEMPO_SEGURANCA_MS = 4000;
const MARGEM_DISPARO = "0px 0px -10% 0px";

/**
 * `InteracoesScroll` — fade-in ao rolar, com 4 camadas de segurança
 * para nunca deixar conteúdo invisível (motivo da remoção do IO em
 * versões anteriores):
 *
 * 1. O estado escondido (opacity: 0) só existe sob `html.anim-scroll`,
 *    classe adicionada por script inline no layout raiz. Sem JS, a
 *    página nasce visível.
 * 2. Elementos já no viewport ao carregar revelam imediatamente (o IO
 *    dispara o callback inicial para alvos já intersectando).
 * 3. Sem suporte a IO ou com prefers-reduced-motion → revela tudo.
 * 4. Cronômetro: se após 4s NENHUM fade-in foi revelado (IO mudo),
 *    revela tudo à força.
 *
 * Re-executa a cada navegação (usePathname) porque os layouts de route
 * group persistem em navegação SPA; um MutationObserver cobre conteúdo
 * que entra depois (filtros client-side, dados do CMS).
 */
export function InteracoesScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const buscarAlvos = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(".fade-in:not(.is-visible)"),
      );

    const revelarTudo = () => {
      buscarAlvos().forEach((el) => el.classList.add("is-visible"));
    };

    const guardaAtiva = document.documentElement.classList.contains("anim-scroll");
    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!guardaAtiva || reduzMovimento || typeof IntersectionObserver === "undefined") {
      revelarTudo();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observador.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: MARGEM_DISPARO, threshold: 0 },
    );

    buscarAlvos().forEach((el) => observador.observe(el));

    const mutacoes = new MutationObserver(() => {
      buscarAlvos().forEach((el) => observador.observe(el));
    });
    mutacoes.observe(document.body, { childList: true, subtree: true });

    const cronometro = window.setTimeout(() => {
      const algumRevelado = document.querySelector(".fade-in.is-visible") !== null;
      if (!algumRevelado) revelarTudo();
    }, TEMPO_SEGURANCA_MS);

    return () => {
      observador.disconnect();
      mutacoes.disconnect();
      window.clearTimeout(cronometro);
    };
  }, [pathname]);

  return null;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(home)/InteracoesScroll.tsx"
git commit -m "feat(animacoes): fade-in ao rolar com IntersectionObserver e 4 camadas de seguranca"
```

---

### Task 9: Validar as animações de ponta a ponta

**Files:** nenhum (só execução)

- [ ] **Step 1: Rodar o diagnóstico com validação de animações**

```bash
node scripts/diagnostico-mobile.mjs --animacoes --estrito
```

Expected: exit 0 — zero overflow E zero `.fade-in` invisível após rolar, em todas as 20 rotas × 2 viewports. O log de cada rota deve mostrar `temGuarda: true` no relatório (`/tmp/diagnostico-mobile/relatorio.json`).

- [ ] **Step 2: Validar navegação SPA manualmente via Playwright**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 375, height: 812 } });
  await p.goto('http://localhost:3000/agenda', { waitUntil: 'networkidle' });
  await p.click('a[href=\"/agenda/prosus-brasilia\"]');
  await p.waitForURL('**/agenda/prosus-brasilia');
  await p.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  await p.waitForTimeout(800);
  const invisiveis = await p.evaluate(() =>
    document.querySelectorAll('.fade-in:not(.is-visible)').length,
  );
  console.log('fade-in invisíveis após navegação SPA:', invisiveis);
  await b.close();
})();
"
```

Expected: `fade-in invisíveis após navegação SPA: 0`. Se o seletor do link não existir na listagem, ajustar para um link real da página de agenda (inspecionar com `p.content()`).

- [ ] **Step 3: Se algo falhar**, usar a skill superpowers:systematic-debugging antes de mexer no código — a causa provável é regra CSS que escapou da guarda (Task 6 Step 3) ou seletor de reveal com especificidade menor que a base.

---

### Task 10: Otimizações de elementos mobile (375/412px)

**Files:**
- Modify: CSS portados conforme achados (sempre via media query)

- [ ] **Step 1: Capturar screenshots de todas as rotas**

```bash
node scripts/diagnostico-mobile.mjs --screenshots
```

Expected: PNGs fullPage em `/tmp/diagnostico-mobile/` (20 rotas × 2 viewports).

- [ ] **Step 2: Revisar cada screenshot com a ferramenta Read**

Procurar, por rota: tipografia estourando o container ou quebrando feio (títulos Cormorant longos), grids que não colapsaram, subnavs/abas espremidas, cards com padding desproporcional, botões/links com alvo de toque < 44px de altura, imagens distorcidas. Listar achados num arquivo de trabalho `/tmp/diagnostico-mobile/achados.md` no formato `rota → classe → problema → correção proposta`.

- [ ] **Step 3: Aplicar as correções**

Para cada achado: media query no CSS portado correspondente, usando os tokens existentes (`var(--space-*)`, `var(--font-*)`). Não alterar nada fora de `@media (max-width: ...)`. Para alvos de toque pequenos, aumentar `padding`/`min-height` para ≥ 44px (WCAG, CLAUDE.md §10).

- [ ] **Step 4: Re-validar**

```bash
node scripts/diagnostico-mobile.mjs --animacoes --estrito
node scripts/diagnostico-mobile.mjs --screenshots
```

Expected: exit 0; screenshots novos sem os problemas listados em `achados.md`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/*.css
git commit -m "fix(mobile): otimiza tipografia, grids e alvos de toque em viewports moveis"
```

---

### Task 11: Verificação final e entrega para validação humana

**Files:** nenhum (só execução)

- [ ] **Step 1: Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build
```

Expected: build sem erros (atenção: o build pega `<a>` para rota interna que o typecheck não pega — memória do projeto).

- [ ] **Step 2: Diagnóstico final completo**

```bash
node scripts/diagnostico-mobile.mjs --animacoes --estrito
```

Expected: exit 0 em todas as rotas e viewports.

- [ ] **Step 3: Deixar o servidor no ar e entregar para validação**

Garantir que `pnpm dev:web` continua rodando. NÃO declarar a sessão concluída: apresentar o resumo (o que mudou, ofensores corrigidos, screenshots disponíveis em `/tmp/diagnostico-mobile/`) e pedir que o usuário valide no iPhone real (preferência registrada: validação visual é humana, não screenshot automatizado). Aguardar o OK do usuário.

---

## Notas de execução

- **Ordem importa:** Tasks 5→6→7→8 formam a migração das animações; entre a 6 e a 8 o site fica num estado intermediário em que o `InteracoesScroll` antigo (reveal no mount) continua funcionando — nenhum estado intermediário deixa conteúdo invisível.
- **Se o dev server cair** durante as tasks, religar com `pnpm dev:web` antes de qualquer diagnóstico.
- **Páginas aprovadas (§5.6):** todas as alterações de CSS devem ser cirúrgicas e dentro de media queries mobile; o desktop não pode mudar nem 1px. Em dúvida sobre um achado da Task 10, registrar no resumo em vez de corrigir por conta própria.
- **Branch:** trabalhar na `main` local (padrão das sessões anteriores deste projeto); commits pequenos por task; sem push (usuário decide).
