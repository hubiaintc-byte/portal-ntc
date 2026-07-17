# Reestilização do Painel Admin (idiom do CRM legado) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Painel inteiro (Site + CRM) adota o idiom visual do CRM legado — cards arredondados com sombra, KPIs com borda esquerda colorida, menu em pílula, logo real + seletor droplist, bloco do usuário na sidebar e 2 gráficos SVG no Painel Comercial.

**Architecture:** Evolução in-place do `painel.css` (mesmas classes `pcms-*`, sem tema paralelo). Novo client component `SeletorModulo` no casco compartilhado `ShellPainel`. Gráficos como componentes React de render puro (SVG inline, sem lib, sem estado) alimentados por agregações puras testadas em `kpisComercial.ts`.

**Tech Stack:** Next 15 App Router / React 19 / CSS literal do painel (`painel.css`) / Vitest.

**Spec:** `docs/superpowers/specs/2026-07-17-reestilizacao-painel-admin-design.md`.

## Global Constraints

- TS strict, sem `any`; `noUncheckedIndexedAccess` (acesso seguro a índices).
- **Nenhuma dependência nova** (gráficos = SVG próprio; Chart.js do legado NÃO entra).
- **Nenhuma cor nova**: só valores já presentes em `painel.css`/marca — Oxford `#11365E`, Oxford-escuro `#0b2545`, Dourado `#B5995A`, Pergaminho `#F4EFE6`, Osso `#fbf8f2`, Grafite `#2b2b2b`/`#5a5a5a`, Linha/Areia `#d9d2c4`, Cardeal `#8e2b27`, Oliva `#5C6B3B` (acento de marca), Sucesso `#3f6b3f`, Erro `#9a1b1b`.
- Exceção deliberada ao CLAUDE.md §3 (registrada no spec): o painel admin usa cantos arredondados e sombras; o site público NÃO é tocado.
- Commits em português, Conventional Commits, sem emojis. Sem push.
- Acessibilidade WCAG AA: foco visível, padrão menu-button no seletor, equivalente textual nos gráficos.
- Paleta do donut validada (CVD-safe na ordem fixa abaixo; contraste do Dourado/Areia < 3:1 exige legenda com contagens — ela é obrigatória, não decorativa).

---

### Task 1: Tokens e idiom base no `painel.css`

**Files:**
- Modify: `apps/cms/src/app/(painel)/painel.css`

**Interfaces:**
- Produces: vars `--pcms-radius` (8px), `--pcms-radius-controle` (6px), `--pcms-sombra` — usadas pelas Tasks 2, 3 e 5.

- [ ] **Step 1: Adicionar tokens** no bloco `.pcms-root` (após a linha `--pcms-cardeal: #8e2b27;`, ~linha 24) e no bloco espelho `.pcms-login` (após `--pcms-sucesso: #3f6b3f;`, ~linha 1450):

```css
  --pcms-radius: 8px;
  --pcms-radius-controle: 6px;
  --pcms-sombra: 0 1px 2px rgba(17, 54, 94, 0.06), 0 4px 14px rgba(17, 54, 94, 0.08);
```

- [ ] **Step 2: KPIs com borda esquerda colorida.** No bloco `.pcms-metrica` (~linha 433): garantir `background: #fff; border: 1px solid var(--pcms-linha); border-radius: var(--pcms-radius); box-shadow: var(--pcms-sombra);` e **substituir** o acento atual de `border-top` por borda esquerda:

```css
.pcms-metrica {
  border-left: 3px solid var(--pcms-dourado);
}
```

Nos variants `data-vertical` (~linhas 439–446), trocar `border-top-color` por `border-left-color`, **mantendo a cor que cada variant já usa hoje** (ex.: `gestao-publica` → `var(--pcms-cardeal)`).

- [ ] **Step 3: Cards e superfícies.** Aplicar `border-radius: var(--pcms-radius); box-shadow: var(--pcms-sombra);` aos blocos existentes `.pcms-config-card`, `.pcms-det-card` (se existir), e à `.pcms-tabela` (com `overflow: hidden` para o raio valer nos cantos; manter demais declarações). `.pcms-vazio` ganha `border-radius: var(--pcms-radius);`.

- [ ] **Step 4: Menu em pílula.** Nos blocos `.pcms-nav__item` / `:hover` / `--ativo` (~linhas 116–148): adicionar `border-radius: var(--pcms-radius-controle); margin: 0 10px 2px;` ao item; no `--ativo`, **substituir** o `box-shadow: inset 3px 0 0 var(--pcms-dourado)` por fundo translúcido de pílula:

```css
.pcms-nav__item--ativo {
  background: rgba(244, 239, 230, 0.12);
  color: var(--pcms-dourado);
}
```

(manter o restante das declarações existentes; `:focus-visible` continua com outline visível).

- [ ] **Step 5: Controles.** `.pcms-btn` (e variants `--ghost`, `--mini`): adicionar `border-radius: var(--pcms-radius-controle);`. Cores do primário: se o `.pcms-btn` já for dourado hoje, **não mexer nas cores** (só o raio). Se não for, definir `background: var(--pcms-dourado); color: var(--pcms-oxford-escuro);` e hover com overlay de cor existente (sem cor nova):

```css
.pcms-btn:hover:not(:disabled) {
  box-shadow: inset 0 0 0 999px rgba(17, 54, 94, 0.08);
}
```

Inputs: nos blocos de input existentes (`.pcms-field input/select/textarea` do `CamposCrm`, `.pcms-search input`, inputs do login), `border-radius: var(--pcms-radius-controle);`.

- [ ] **Step 6: Verificar e commitar**

Run: `pnpm --filter @ntc/cms build`
Expected: build verde.

```bash
git add "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(painel): tokens de raio e sombra e idiom de cards do CRM legado"
```

---

### Task 2: Logo real na placa + `SeletorModulo` droplist

**Files:**
- Create: `apps/cms/src/app/(painel)/shell/SeletorModulo.tsx`
- Modify: `apps/cms/src/app/(painel)/shell/ShellPainel.tsx`
- Modify: `apps/cms/src/app/(painel)/painel.css`

**Interfaces:**
- Consumes: type `ModuloPainel` exportado de `./ShellPainel` (import type — sem ciclo em runtime); vars da Task 1.
- Produces: `export function SeletorModulo({ modulo }: { modulo: ModuloPainel })`.

- [ ] **Step 1: Criar `SeletorModulo.tsx`** (código completo):

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { ModuloPainel } from "./ShellPainel";

interface OpcaoModulo {
  id: ModuloPainel;
  rotulo: string;
  descricao: string;
  href: string;
}

const OPCOES: OpcaoModulo[] = [
  { id: "site", rotulo: "Site", descricao: "Conteúdo editorial", href: "/" },
  { id: "crm", rotulo: "CRM", descricao: "Comercial", href: "/crm" },
];

/** Droplist de módulo (workspace switcher) da sidebar do painel. */
export function SeletorModulo({ modulo }: { modulo: ModuloPainel }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const atual = OPCOES.find((o) => o.id === modulo);
  if (!atual) return null;

  return (
    <div className="pcms-seletor" ref={raiz}>
      <button
        type="button"
        className="pcms-seletor__botao"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="pcms-seletor__textos">
          <span className="pcms-seletor__modulo">{atual.rotulo}</span>
          <span className="pcms-seletor__desc">{atual.descricao}</span>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="pcms-seletor__seta">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {aberto && (
        <div className="pcms-seletor__menu" role="menu" aria-label="Trocar de módulo">
          {OPCOES.map((o) => (
            <Link
              key={o.id}
              role="menuitem"
              href={o.href}
              className={`pcms-seletor__opcao${o.id === modulo ? " pcms-seletor__opcao--ativa" : ""}`}
              aria-current={o.id === modulo ? "page" : undefined}
              onClick={() => setAberto(false)}
            >
              <span className="pcms-seletor__modulo">{o.rotulo}</span>
              <span className="pcms-seletor__desc">{o.descricao}</span>
              {o.id === modulo && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="pcms-seletor__check">
                  <path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Trocar a marca no `ShellPainel.tsx`.** Substituir o bloco `pcms-sidebar__brand` inteiro (SVG "N" inline + wordmark, linhas ~62–87) e o bloco `.pcms-modulos` (linhas ~89–100) por:

```tsx
        <div className="pcms-sidebar__brand">
          <span className="pcms-sidebar__placa">
            {/* Logo institucional completa; a placa clara garante contraste da barra Oxford. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ntc.svg" alt="Grupo NTC" className="pcms-sidebar__logo" />
          </span>
          <span className="pcms-sidebar__painel-rotulo">Painel Admin</span>
        </div>

        <SeletorModulo modulo={modulo} />
```

Adicionar o import `import { SeletorModulo } from "./SeletorModulo";` (grupo de relativos). Nota: `<img>` segue o padrão já usado no painel (3 warnings pré-existentes de `<img>` no lint são aceitos); NÃO usar `next/image` aqui (asset estático pequeno).

- [ ] **Step 3: CSS.** Em `painel.css`, **remover** os blocos `.pcms-modulos*` (~linhas 1803–1832) e **substituir** os blocos `.pcms-sidebar__brand`, `.pcms-sidebar__logo` e `.pcms-sidebar__wordmark*` por:

```css
.pcms-sidebar__brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 16px 14px;
}

.pcms-sidebar__placa {
  display: block;
  background: var(--pcms-pergaminho);
  border-radius: var(--pcms-radius);
  padding: 10px 14px;
}

.pcms-sidebar__logo {
  display: block;
  width: 100%;
  height: auto;
  max-height: 56px;
}

.pcms-sidebar__painel-rotulo {
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--pcms-dourado);
  padding-left: 2px;
}

.pcms-seletor {
  position: relative;
  margin: 0 16px 18px;
}

.pcms-seletor__botao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  background: rgba(244, 239, 230, 0.08);
  border: 1px solid rgba(244, 239, 230, 0.2);
  border-radius: var(--pcms-radius-controle);
  color: var(--pcms-pergaminho);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.pcms-seletor__botao:hover {
  background: rgba(244, 239, 230, 0.14);
}

.pcms-seletor__botao:focus-visible {
  outline: 2px solid var(--pcms-dourado);
  outline-offset: 2px;
}

.pcms-seletor__textos {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pcms-seletor__modulo {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pcms-seletor__desc {
  font-size: 11px;
  color: rgba(244, 239, 230, 0.65);
}

.pcms-seletor__seta {
  width: 16px;
  height: 16px;
  flex: none;
}

.pcms-seletor__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid var(--pcms-linha);
  border-radius: var(--pcms-radius);
  box-shadow: var(--pcms-sombra);
  padding: 4px;
}

.pcms-seletor__opcao {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 8px;
  padding: 8px 10px;
  border-radius: var(--pcms-radius-controle);
  color: var(--pcms-grafite);
  text-decoration: none;
}

.pcms-seletor__opcao .pcms-seletor__modulo {
  color: var(--pcms-oxford);
}

.pcms-seletor__opcao .pcms-seletor__desc {
  color: var(--pcms-grafite-suave);
  grid-column: 1;
}

.pcms-seletor__opcao:hover {
  background: var(--pcms-osso);
}

.pcms-seletor__opcao:focus-visible {
  outline: 2px solid var(--pcms-oxford);
  outline-offset: -2px;
}

.pcms-seletor__opcao--ativa .pcms-seletor__modulo {
  color: var(--pcms-dourado);
}

.pcms-seletor__check {
  width: 16px;
  height: 16px;
  color: var(--pcms-dourado);
  grid-row: span 2;
}
```

(Se `--pcms-osso`/`--pcms-grafite-suave` tiverem nomes ligeiramente diferentes no `:root` do `.pcms-root`, usar os nomes reais do arquivo — os valores são `#fbf8f2` e `#5a5a5a`.)

- [ ] **Step 4: Verificar e commitar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms build`
Expected: verdes.

```bash
git add "apps/cms/src/app/(painel)/shell/SeletorModulo.tsx" "apps/cms/src/app/(painel)/shell/ShellPainel.tsx" "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(painel): logo institucional na placa e seletor de modulo em droplist"
```

---

### Task 3: Bloco do usuário na sidebar (nome + perfil + Sair)

**Files:**
- Modify: `apps/cms/src/app/(painel)/shell/ShellPainel.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (prop `usuario` ganha `perfil`)
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx` (passar `perfil` — o objeto vem de `obterUsuarioCms`, que já tem `perfil`)

**Interfaces:**
- Consumes: `ShellPainelProps.usuario` atual `{ nome, email }`; `sair` de `../acoesAuth` (já importado).
- Produces: `ShellPainelProps.usuario: { nome: string; email: string; perfil: string }`. `ShellCms` já recebe `perfil` no seu prop e passa `usuario` inteiro — sem mudança lá (tipagem estrutural cobre).

- [ ] **Step 1: Tipos.** Em `ShellPainel.tsx`, mudar o prop para `usuario: { nome: string; email: string; perfil: string }`. Em `ShellCrm.tsx`, idem no prop local. Em `crm/page.tsx`, incluir `perfil` no objeto `usuario` passado ao `ShellCrm` (vem de `obterUsuarioCms`).

- [ ] **Step 2: Markup.** Substituir o bloco `pcms-sidebar__foot` (linhas ~122–137) — o bloco sobe visualmente para logo abaixo do `SeletorModulo` no JSX (mover o `<div className="pcms-sidebar__usuario">` para entre `<SeletorModulo …/>` e `<nav …>`):

```tsx
        <div className="pcms-sidebar__usuario">
          <div className="pcms-avatar-mini">{iniciais(usuario.nome)}</div>
          <div className="pcms-sidebar__usuario-info">
            <strong>{usuario.nome}</strong>
            <span className="pcms-sidebar__perfil">{usuario.perfil.replace(/-/g, " ")}</span>
          </div>
          <form action={sair} className="pcms-sair__form">
            <button type="submit" className="pcms-sair" aria-label="Sair da sessão" title="Sair">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4H5v16h4" />
                <path d="m14 8 4 4-4 4" />
                <path d="M18 12H9" />
              </svg>
              Sair
            </button>
          </form>
        </div>
```

Remover o antigo `pcms-sidebar__foot` do fim da sidebar.

- [ ] **Step 3: CSS.** Em `painel.css`, substituir os blocos `.pcms-sidebar__foot*` por:

```css
.pcms-sidebar__usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 16px;
  padding: 10px 12px;
  background: rgba(244, 239, 230, 0.06);
  border-radius: var(--pcms-radius);
}

.pcms-sidebar__usuario-info {
  min-width: 0;
  flex: 1;
}

.pcms-sidebar__usuario-info strong {
  display: block;
  font-size: 13px;
  color: var(--pcms-pergaminho);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pcms-sidebar__perfil {
  display: block;
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pcms-dourado);
}

.pcms-sair {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
}
```

Manter as demais declarações existentes de `.pcms-sair`/`.pcms-avatar-mini` (cores, svg). Se `.pcms-avatar-mini` for quadrado, adicionar `border-radius: 50%;`.

- [ ] **Step 4: Verificar e commitar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms build`
Expected: verdes.

```bash
git add "apps/cms/src/app/(painel)/shell/ShellPainel.tsx" "apps/cms/src/app/(painel)/crm/ShellCrm.tsx" "apps/cms/src/app/(painel)/crm/page.tsx" "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(painel): bloco do usuario com perfil e sair na sidebar"
```

---

### Task 4: Agregações dos gráficos em `kpisComercial` (TDD)

**Files:**
- Modify: `apps/cms/src/lib/cms/kpisComercial.ts`
- Test: `apps/cms/src/lib/cms/kpisComercial.test.ts` (já existe — adicionar describe novo)

**Interfaces:**
- Consumes: `OportunidadeCrmResumo` (campo `status` é o slug, ex. `"em-qualificacao"`); `STATUS_OPORTUNIDADE` (`OpcaoLista[] {label, value}`) e `STATUS_OPORTUNIDADE_FECHADA` de `@ntc/lib`.
- Produces (Task 5 depende):

```ts
export interface FaixaStatusOportunidade {
  status: string;   // slug ("em-qualificacao")
  rotulo: string;   // label ("Em qualificação")
  quantidade: number;
}
/** Abertas por status, ordem fixa de STATUS_OPORTUNIDADE, só quantidade > 0. */
export function abertasPorStatus(oportunidades: OportunidadeCrmResumo[]): FaixaStatusOportunidade[];
/** Funil: TODOS os status abertos na ordem fixa, incluindo zerados. */
export function funilOportunidades(oportunidades: OportunidadeCrmResumo[]): FaixaStatusOportunidade[];
```

- [ ] **Step 1: Escrever os testes (RED).** Acrescentar em `kpisComercial.test.ts` (usar o helper/fixture de oportunidade que o arquivo já tem; se não houver, criar um `fabricarOportunidade(parcial)` local):

```ts
describe("abertasPorStatus / funilOportunidades", () => {
  const ops = [
    fabricarOportunidade({ status: "em-negociacao" }),
    fabricarOportunidade({ status: "em-qualificacao" }),
    fabricarOportunidade({ status: "em-negociacao" }),
    fabricarOportunidade({ status: "contratada" }), // fechada: fora
  ];

  it("conta abertas por status na ordem fixa da lista, omitindo zerados", () => {
    expect(abertasPorStatus(ops)).toEqual([
      { status: "em-qualificacao", rotulo: "Em qualificação", quantidade: 1 },
      { status: "em-negociacao", rotulo: "Em negociação", quantidade: 2 },
    ]);
  });

  it("funil traz todos os status abertos, incluindo zerados, na ordem do funil", () => {
    const funil = funilOportunidades(ops);
    expect(funil.map((f) => f.status)).toEqual([
      "em-qualificacao",
      "apresentacao-institucional",
      "proposta-enviada",
      "em-negociacao",
      "aprovada",
    ]);
    expect(funil.find((f) => f.status === "proposta-enviada")?.quantidade).toBe(0);
  });

  it("com lista vazia, abertasPorStatus é vazio e funil é todo zerado", () => {
    expect(abertasPorStatus([])).toEqual([]);
    expect(funilOportunidades([]).every((f) => f.quantidade === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- kpisComercial`
Expected: FAIL — `abertasPorStatus is not a function` (ou import inexistente).

- [ ] **Step 3: Implementar** em `kpisComercial.ts` (import muda para `import { STATUS_OPORTUNIDADE, STATUS_OPORTUNIDADE_FECHADA } from "@ntc/lib";`):

```ts
export interface FaixaStatusOportunidade {
  status: string;
  rotulo: string;
  quantidade: number;
}

const STATUS_ABERTOS = STATUS_OPORTUNIDADE.filter(
  (s) => !STATUS_OPORTUNIDADE_FECHADA.includes(s.value),
);

function contarPorStatus(oportunidades: OportunidadeCrmResumo[]): FaixaStatusOportunidade[] {
  return STATUS_ABERTOS.map((s) => ({
    status: s.value,
    rotulo: s.label,
    quantidade: oportunidades.filter((o) => o.status === s.value).length,
  }));
}

/** Abertas por status na ordem fixa da lista, omitindo status zerados. */
export function abertasPorStatus(
  oportunidades: OportunidadeCrmResumo[],
): FaixaStatusOportunidade[] {
  return contarPorStatus(oportunidades).filter((f) => f.quantidade > 0);
}

/** Funil completo: todos os status abertos na ordem, incluindo zerados. */
export function funilOportunidades(
  oportunidades: OportunidadeCrmResumo[],
): FaixaStatusOportunidade[] {
  return contarPorStatus(oportunidades);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- kpisComercial`
Expected: PASS (suite inteira do arquivo).

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/kpisComercial.ts apps/cms/src/lib/cms/kpisComercial.test.ts
git commit -m "feat(crm): agregacoes de oportunidades por status para os graficos do painel"
```

---

### Task 5: `GraficosComercial` (donut + funil SVG) + integração

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/GraficosComercial.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/TelaPainelComercial.tsx`
- Modify: `apps/cms/src/app/(painel)/painel.css`

**Interfaces:**
- Consumes: `FaixaStatusOportunidade`, `abertasPorStatus`, `funilOportunidades` (Task 4); vars CSS (Task 1).
- Produces: `export function DonutStatus({ faixas }: { faixas: FaixaStatusOportunidade[] })` e `export function FunilBarras({ faixas }: { faixas: FaixaStatusOportunidade[] })`.

- [ ] **Step 1: Criar `GraficosComercial.tsx`** (código completo; componentes de render puro — sem hooks, sem estado):

```tsx
import type { FaixaStatusOportunidade } from "@/lib/cms/kpisComercial";

/**
 * Gráficos SVG do Painel Comercial (sem biblioteca — decisão do spec de
 * 17/07). Cores por status em ordem fixa, validadas para CVD; a legenda com
 * contagens é o equivalente textual obrigatório (contraste do dourado/areia
 * sobre branco fica abaixo de 3:1).
 */

const COR_POR_STATUS: Record<string, string> = {
  "em-qualificacao": "#11365E",
  "apresentacao-institucional": "#B5995A",
  "proposta-enviada": "#5C6B3B",
  "em-negociacao": "#8E2B27",
  aprovada: "#D9D2C4",
};

const COR_FALLBACK = "#5a5a5a";

const corDe = (status: string): string => COR_POR_STATUS[status] ?? COR_FALLBACK;

/** Donut de oportunidades abertas por status, com legenda de contagens. */
export function DonutStatus({ faixas }: { faixas: FaixaStatusOportunidade[] }) {
  const total = faixas.reduce((soma, f) => soma + f.quantidade, 0);
  if (total === 0) {
    return <p className="pcms-grafico__vazio">Nenhuma oportunidade aberta registrada.</p>;
  }

  const RAIO = 42;
  const CIRCUNF = 2 * Math.PI * RAIO;
  let acumulado = 0;

  return (
    <div className="pcms-grafico pcms-grafico--donut">
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Oportunidades abertas por status: ${faixas
          .map((f) => `${f.rotulo} ${f.quantidade}`)
          .join(", ")}`}
      >
        {faixas.map((f) => {
          const fracao = f.quantidade / total;
          const arco = fracao * CIRCUNF;
          const offset = -acumulado * CIRCUNF;
          acumulado += fracao;
          return (
            <circle
              key={f.status}
              cx="60"
              cy="60"
              r={RAIO}
              fill="none"
              stroke={corDe(f.status)}
              strokeWidth="16"
              strokeDasharray={`${Math.max(arco - 2, 0.5)} ${CIRCUNF - Math.max(arco - 2, 0.5)}`}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            >
              <title>{`${f.rotulo}: ${f.quantidade}`}</title>
            </circle>
          );
        })}
        <text x="60" y="57" textAnchor="middle" className="pcms-grafico__total">
          {total}
        </text>
        <text x="60" y="72" textAnchor="middle" className="pcms-grafico__total-rotulo">
          abertas
        </text>
      </svg>
      <ul className="pcms-grafico__legenda">
        {faixas.map((f) => (
          <li key={f.status}>
            <span className="pcms-grafico__cor" style={{ background: corDe(f.status) }} aria-hidden />
            {f.rotulo}
            <b>{f.quantidade}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontais do funil (todos os status abertos, ordem fixa). */
export function FunilBarras({ faixas }: { faixas: FaixaStatusOportunidade[] }) {
  const maximo = Math.max(...faixas.map((f) => f.quantidade), 1);
  const ALTURA_LINHA = 30;
  const LARGURA = 320;
  const LARGURA_ROTULO = 150;

  return (
    <svg
      className="pcms-grafico pcms-grafico--funil"
      viewBox={`0 0 ${LARGURA} ${faixas.length * ALTURA_LINHA}`}
      role="img"
      aria-label={`Funil de oportunidades: ${faixas
        .map((f) => `${f.rotulo} ${f.quantidade}`)
        .join(", ")}`}
    >
      {faixas.map((f, i) => {
        const largura = ((LARGURA - LARGURA_ROTULO - 30) * f.quantidade) / maximo;
        const y = i * ALTURA_LINHA;
        return (
          <g key={f.status}>
            <text x={LARGURA_ROTULO - 8} y={y + 19} textAnchor="end" className="pcms-grafico__eixo">
              {f.rotulo}
            </text>
            <rect
              x={LARGURA_ROTULO}
              y={y + 7}
              width={Math.max(largura, f.quantidade > 0 ? 4 : 0)}
              height={16}
              rx="3"
              fill="#11365E"
            >
              <title>{`${f.rotulo}: ${f.quantidade}`}</title>
            </rect>
            <text
              x={LARGURA_ROTULO + Math.max(largura, f.quantidade > 0 ? 4 : 0) + 6}
              y={y + 19}
              className="pcms-grafico__valor"
            >
              {f.quantidade}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Integrar na `TelaPainelComercial.tsx`.** Imports novos:

```ts
import { abertasPorStatus, funilOportunidades } from "@/lib/cms/kpisComercial";
import { DonutStatus, FunilBarras } from "./GraficosComercial";
```

No corpo, após `const followups = …`:

```ts
  const porStatus = abertasPorStatus(oportunidades);
  const funil = funilOportunidades(oportunidades);
```

E no JSX, entre o fechamento de `</div>` de `.pcms-metricas` e o `<h2 …>Follow-ups…`:

```tsx
      <div className="pcms-graficos">
        <section className="pcms-chart-box">
          <h2>Oportunidades por status</h2>
          <DonutStatus faixas={porStatus} />
        </section>
        <section className="pcms-chart-box">
          <h2>Funil de oportunidades</h2>
          <FunilBarras faixas={funil} />
        </section>
      </div>
```

- [ ] **Step 3: CSS** (adicionar em `painel.css`, perto dos blocos de métrica):

```css
.pcms-graficos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  margin: 18px 0 26px;
}

@media (max-width: 980px) {
  .pcms-graficos {
    grid-template-columns: 1fr;
  }
}

.pcms-chart-box {
  background: #fff;
  border: 1px solid var(--pcms-linha);
  border-radius: var(--pcms-radius);
  box-shadow: var(--pcms-sombra);
  padding: 16px 18px;
}

.pcms-chart-box h2 {
  font-family: var(--pcms-serif, Georgia, serif);
  font-size: 17px;
  color: var(--pcms-oxford);
  margin: 0 0 12px;
}

.pcms-grafico--donut {
  display: flex;
  align-items: center;
  gap: 18px;
}

.pcms-grafico--donut svg {
  width: 150px;
  height: 150px;
  flex: none;
}

.pcms-grafico__total {
  font-size: 22px;
  font-weight: 600;
  fill: var(--pcms-oxford);
}

.pcms-grafico__total-rotulo {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  fill: var(--pcms-grafite-suave);
}

.pcms-grafico__legenda {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  color: var(--pcms-grafite);
}

.pcms-grafico__legenda li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pcms-grafico__legenda b {
  margin-left: auto;
  color: var(--pcms-oxford);
}

.pcms-grafico__cor {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  border: 1px solid rgba(43, 43, 43, 0.2);
  flex: none;
}

.pcms-grafico--funil {
  width: 100%;
  height: auto;
}

.pcms-grafico__eixo {
  font-size: 10.5px;
  fill: var(--pcms-grafite-suave);
}

.pcms-grafico__valor {
  font-size: 11px;
  font-weight: 600;
  fill: var(--pcms-oxford);
}

.pcms-grafico__vazio {
  color: var(--pcms-grafite-suave);
  font-size: 13px;
  margin: 8px 0;
}
```

(Ajustar `var(--pcms-serif, …)` para a var de serifa que o arquivo já usa nos `h1`/`h2` — reusar o `font-family` existente do `.pcms-pagehead h1`.)

- [ ] **Step 4: Verificar e commitar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms build`
Expected: verdes (testes da Task 4 continuam passando).

```bash
git add "apps/cms/src/app/(painel)/crm/GraficosComercial.tsx" "apps/cms/src/app/(painel)/crm/TelaPainelComercial.tsx" "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(crm): graficos svg de status e funil no painel comercial"
```

---

### Task 6: Verificação final e checkpoint visual

- [ ] **Step 1:** `pnpm typecheck && pnpm test && pnpm lint && pnpm build` na raiz — tudo verde (warnings pré-existentes de `<img>` são aceitos).
- [ ] **Step 2:** Subir `pnpm dev:cms` e conferir manualmente em `http://localhost:3001`: login (visual intacto), módulo Site (dashboard, palestrantes — cards/menu novos), módulo CRM (dashboard com KPIs + 2 gráficos, telas de clientes/oportunidades), seletor droplist (mouse + teclado: Tab, Enter, Esc), bloco do usuário (nome/perfil/Sair).
- [ ] **Step 3:** Servidor no ar para validação visual do PO (memória `feedback_validacao_visual`) — NÃO declarar concluído sem o aceite humano.
