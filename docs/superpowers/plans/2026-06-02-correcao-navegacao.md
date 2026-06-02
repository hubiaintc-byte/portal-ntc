# Correção de Navegação Interna — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar os links quebrados de navegação do Portal NTC — o 404 dos CTAs de proposta (P1, grave), 4 âncoras mortas no mega-menu (P2) e a rota `/agenda` órfã (P3) — sem tocar em páginas/conteúdo aprovados.

**Architecture:** Todas as mudanças ficam confinadas a 3 arquivos de infraestrutura/navegação: `next.config.ts` (redirect que preserva query), `RoteadorFormularios.tsx` (lê params na chegada e pré-preenche a aba proposta) e `HeaderHome.tsx` (corrige hrefs de âncora). Os 101 links de CTA nos arquivos `conteudoXXX.ts` ficam intocados — o redirect resolve o destino em runtime.

**Tech Stack:** Next.js 15 App Router, React Server/Client Components, TypeScript strict. Verificação por `pnpm typecheck` + `pnpm build` + teste manual no navegador (CLAUDE.md §6 — sem suíte de testes de DOM neste fluxo; a validação visual é feita pelo usuário).

**Spec:** `docs/superpowers/specs/2026-06-02-correcao-navegacao-design.md`

---

## File Structure

| Arquivo | Responsabilidade | Mudança |
|---|---|---|
| `apps/web/next.config.ts` | Config Next | + `async redirects()` (P1a) |
| `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx` | Roteador de abas do form de contato (Client Component) | estender useEffect de mount: ler `?programa`/`?modalidade`/`?assunto`, abrir aba proposta, pré-preencher (P1b) |
| `apps/web/app/(home)/HeaderHome.tsx` | Header/mega-menu global | 4 âncoras → `#modalidades` (P2); "Agenda Geral NTC" → `/agenda` desktop+mobile (P3) |

Nenhum arquivo de conteúdo de programa, nenhuma página aprovada.

---

## Task 1: Redirect `/contato/proposta` → `/contato` (P1a)

Resolve o 404 dos 101 CTAs sem editar nenhum link. O redirect 307 (`permanent: false`) preserva a query string automaticamente.

**Files:**
- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Adicionar `async redirects()` ao nextConfig**

No arquivo `apps/web/next.config.ts`, dentro do objeto `nextConfig`, adicionar a função `redirects` logo após a propriedade `images` (antes do fechamento `};`):

```ts
  async redirects() {
    return [
      {
        // CTAs dos programas apontam para /contato/proposta?programa=...
        // Rota não existe; cai em /contato preservando a query (307).
        source: "/contato/proposta",
        destination: "/contato",
        permanent: false,
      },
    ];
  },
```

O resultado final do arquivo deve ter `images: { ... }` seguido de `async redirects() { ... }` dentro de `const nextConfig: NextConfig = { ... }`.

- [ ] **Step 2: Verificar typecheck**

Run: `pnpm typecheck`
Expected: PASS (sem erros). `redirects` é parte do tipo `NextConfig`.

- [ ] **Step 3: Verificar o redirect no dev server**

Run: `pnpm dev:web` (deixar rodando em background) e em outro terminal:
`curl -sI "http://localhost:3000/contato/proposta?programa=agip" | grep -i "location\|HTTP"`
Expected: status `307` e header `location: /contato?programa=agip` (a query é preservada).

- [ ] **Step 4: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "fix(navegacao): redirect /contato/proposta para /contato preservando query

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Pré-preencher a aba Proposta a partir da query (P1b)

Depois do redirect, `/contato` recebe `?programa=<slug>[&modalidade=<x>][&assunto=<y>]`. Estender o `useEffect` de mount do `RoteadorFormularios` para abrir a aba proposta e pré-selecionar os campos.

**Files:**
- Modify: `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx`

**Contexto do código existente (não reescrever, só estender):**
- O `useEffect` de mount está em ~linhas 176-212. Hoje ele lê `window.location.hash` (mapa `TAB_HASH_MAP`) e `?evento`/`?evento_url`, e ao final limpa a query com `history.replaceState`.
- `ativarTab(id, { scroll, prefillVerticalKey })` já existe (linha 160) e sabe abrir a aba proposta + rolar.
- Os selects da aba proposta têm ids estáveis: `#prop-programa` (name="programa"), `#prop-modalidade` (name="modalidade"). O textarea de contexto é `#prop-contexto` (name="contexto").
- Os `value` das options de programa são as SIGLAS em maiúsculas (`AGIP`, `EDUTEC`, ...) — ver `OPTIONS_PROGRAMA_PROP` em `conteudoContato.ts`. Os links usam slug minúsculo.

- [ ] **Step 1: Adicionar mapas de tradução slug→value como constantes de módulo**

No bloco de constantes (após `const TAB_HASH_MAP = {...}` em ~linha 44), adicionar:

```ts
// Modalidades vindas dos CTAs de programa → value do <select name="modalidade">.
// O select tem incompany-presencial/online/hibrido; o link manda só "incompany".
const MODALIDADE_LINK_PARA_SELECT: Record<string, string> = {
  incompany: "incompany-presencial",
  "sob-medida": "sob-medida",
  trilha: "trilha",
};

// Assuntos vindos dos CTAs → texto funcional pré-preenchido no contexto.
// Texto neutro/funcional (não inventar conteúdo institucional — CLAUDE.md §5.3).
const ASSUNTO_LINK_PARA_TEXTO: Record<string, string> = {
  folder: "Gostaria de receber o folder do programa.",
  detalhes: "Gostaria de receber mais detalhes sobre o programa.",
  inscricao: "Tenho interesse em inscrição para este programa.",
};
```

- [ ] **Step 2: Adicionar helper de pré-preenchimento de select por id**

Logo após o `prefillVertical` (que termina em ~linha 158, dentro do componente `RoteadorFormularios`), adicionar um `useCallback` análogo que preenche um select pelo `id` (em vez de ref), com o mesmo destaque visual dourado:

```ts
  const prefillSelectPorId = useCallback((id: string, value: string) => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLSelectElement)) return;
    const has = Array.from(el.options).some((o) => o.value === value);
    if (!has) return;
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    const wrap = el.closest<HTMLElement>(".form-field");
    if (wrap) {
      wrap.style.transition = "box-shadow 320ms";
      wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
      setTimeout(() => {
        wrap.style.boxShadow = "";
      }, 1400);
    }
  }, []);
```

- [ ] **Step 3: Estender o useEffect de mount para tratar `?programa`/`?modalidade`/`?assunto`**

Dentro do `useEffect` de mount (o que começa em ~linha 177), no bloco `if (window.location.search) { const params = new URLSearchParams(...) ... }`, ADICIONAR — após o tratamento de `evento`/`eventoUrl` e ANTES do `history.replaceState` final — o seguinte bloco:

```ts
      const programa = params.get("programa");
      const modalidade = params.get("modalidade");
      const assunto = params.get("assunto");

      if (programa || modalidade || assunto) {
        ativarTab("proposta", { scroll: true });

        // setTimeout(0): o painel proposta só monta os campos após o setState da aba.
        setTimeout(() => {
          if (programa) {
            prefillSelectPorId("prop-programa", programa.toUpperCase());
          }
          if (modalidade) {
            const value = MODALIDADE_LINK_PARA_SELECT[modalidade];
            if (value) prefillSelectPorId("prop-modalidade", value);
          }
          if (assunto) {
            const texto = ASSUNTO_LINK_PARA_TEXTO[assunto];
            const ctx = document.getElementById("prop-contexto");
            if (texto && ctx instanceof HTMLTextAreaElement && !ctx.value.trim()) {
              ctx.value = texto;
            }
          }
        }, 0);
      }
```

Nota: o `history.replaceState` que já existe ao final do bloco continua válido — ele limpa a query e mantém `pathname + hash`. Como `ativarTab("proposta")` não altera o hash da URL, considerar (opcional) ajustar o `clean` para incluir `#tab-proposta`; NÃO obrigatório — a aba já está ativa via estado React.

- [ ] **Step 4: Atualizar o array de dependências do useEffect**

O `useEffect` de mount hoje declara `[ativarTab]` como deps. Adicionar `prefillSelectPorId`:

Trocar `}, [ativarTab]);` (o do effect de mount, ~linha 212) por:

```ts
  }, [ativarTab, prefillSelectPorId]);
```

(Não confundir com o segundo useEffect — o de `a[href^="#tab-"]` em ~linha 233 — que permanece com `[ativarTab]`.)

- [ ] **Step 5: Verificar typecheck e lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS. Sem `any`, sem novos warnings. `prefillSelectPorId` e os mapas estão tipados.

- [ ] **Step 6: Teste manual no navegador**

Com `pnpm dev` rodando, abrir:
`http://localhost:3000/contato?programa=agip&assunto=folder`
Expected:
- A aba "Solicitar proposta" abre automaticamente e a página rola até o form.
- O `<select>` "Programa de interesse" mostra **AGIP** selecionado (com flash dourado).
- O textarea de contexto mostra "Gostaria de receber o folder do programa." (se vazio).

Abrir também `http://localhost:3000/contato?programa=edutec&modalidade=incompany`
Expected: aba proposta aberta, programa EDUTEC, modalidade "In company presencial".

- [ ] **Step 7: Teste manual do fluxo real (via redirect)**

Com o dev server rodando, navegar para `http://localhost:3000/programas/agip`, clicar no CTA "Solicitar proposta".
Expected: cai em `/contato` (redirect 307), aba Proposta aberta com AGIP selecionado.

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/RoteadorFormularios.tsx
git commit -m "feat(contato): abre aba proposta e pre-preenche programa/modalidade/assunto via query

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Corrigir âncoras mortas e link de Agenda no mega-menu (P2 + P3)

Duas correções no mesmo arquivo (`HeaderHome.tsx`), commitadas juntas por serem ajustes de href no mesmo componente.

**Files:**
- Modify: `apps/web/app/(home)/HeaderHome.tsx`

**Contexto:** As âncoras-alvo reais em `/solucoes` são `modalidades`, `por-area`, `processo`, `contratacao-institucional`, `faq`. O link "Agenda Geral NTC" (desktop ~linha 355, mobile ~linha 475) aponta hoje para `#capacitacao` (âncora só existe na home). A rota real `/agenda` existe.

- [ ] **Step 1: Apontar as 4 âncoras de modalidade para `#modalidades` (P2)**

No bloco "Modalidades de Contratação" do mega-menu Soluções, trocar os 4 hrefs que não existem. Aplicar estas substituições exatas:

- `href="/solucoes#in-company"` → `href="/solucoes#modalidades"`
- `href="/solucoes#turmas-fechadas"` → `href="/solucoes#modalidades"`
- `href="/solucoes#sob-medida"` → `href="/solucoes#modalidades"`
- `href="/solucoes#trilhas"` → `href="/solucoes#modalidades"`

(Localizar com `grep -n 'solucoes#in-company\|solucoes#turmas-fechadas\|solucoes#sob-medida\|solucoes#trilhas' HeaderHome.tsx`.) O `href="/solucoes#contratacao-institucional"` já está correto — NÃO mexer.

- [ ] **Step 2: Apontar "Agenda Geral NTC" para `/agenda` (P3) — desktop**

No mega-menu desktop (coluna "Agenda e formatos", ~linha 355), o link "Agenda Geral NTC" usa `href="#capacitacao"`. Trocar SÓ esse para `href="/agenda"`. O bloco-alvo é:

```tsx
                    <a href="#capacitacao">
                      <strong>Agenda Geral NTC</strong>
                      <span>Todos os eventos abertos no calendário</span>
                    </a>
```
para
```tsx
                    <a href="/agenda">
                      <strong>Agenda Geral NTC</strong>
                      <span>Todos os eventos abertos no calendário</span>
                    </a>
```
ATENÇÃO: há outros `href="#capacitacao"` no arquivo ("Próximas turmas", "Eventos passados") — NÃO trocar esses. Identificar pelo texto `Agenda Geral NTC` adjacente.

- [ ] **Step 3: Apontar "Agenda Geral NTC" para `/agenda` (P3) — mobile drawer**

No drawer mobile (~linha 475), o link é:
```tsx
            <a href="#capacitacao"><strong>Agenda Geral NTC</strong><span>Todos os eventos abertos</span></a>
```
Trocar para:
```tsx
            <a href="/agenda"><strong>Agenda Geral NTC</strong><span>Todos os eventos abertos</span></a>
```
(Identificar pelo texto `Agenda Geral NTC`. Os demais `#capacitacao` do drawer permanecem.)

- [ ] **Step 4: Verificar typecheck (typedRoutes)**

Run: `pnpm typecheck`
Expected: PASS. `next.config.ts` tem `experimental.typedRoutes: true`; `/agenda` é rota válida, então `href="/agenda"` passa. Se esses hrefs forem `<a>` puro (não `<Link>`), typedRoutes não os checa — confirmar que ainda compila.

- [ ] **Step 5: Verificar que não sobrou âncora-alvo quebrada**

Run: `grep -n 'solucoes#in-company\|solucoes#turmas-fechadas\|solucoes#sob-medida\|solucoes#trilhas' apps/web/app/\(home\)/HeaderHome.tsx`
Expected: nenhum resultado (saída vazia).

- [ ] **Step 6: Teste manual no navegador**

Com `pnpm dev` rodando, a partir de uma página que NÃO seja a home (ex.: `/contato`):
- Abrir o mega-menu "Soluções" → clicar nas 4 modalidades → conferir que navega para `/solucoes` e rola até a seção de modalidades.
- Abrir o mega-menu "Capacitação" → clicar "Agenda Geral NTC" → conferir que abre `/agenda`.
- Repetir o teste de "Agenda Geral NTC" no menu mobile (viewport 375px).

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(home\)/HeaderHome.tsx
git commit -m "fix(navegacao): corrige ancoras de modalidade para #modalidades e Agenda Geral para /agenda

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Verificação final e checkpoint visual (CLAUDE.md §6)

**Files:** nenhum (verificação).

- [ ] **Step 1: Build de produção**

Run: `pnpm build`
Expected: PASS, sem erros. As rotas `/contato` e `/agenda` aparecem no output; o redirect `/contato/proposta` é listado como redirect.

- [ ] **Step 2: Checkpoint visual (validação humana)**

Deixar `pnpm dev` no ar e pedir ao usuário a validação visual (desktop 1440 + mobile 375) dos 3 fluxos:
1. CTA "Solicitar proposta" de um programa → `/contato` com aba proposta + programa preenchido.
2. Mega-menu modalidades → `/solucoes#modalidades`.
3. Mega-menu "Agenda Geral NTC" → `/agenda`.

NÃO declarar "pronto" sem a aprovação visual do usuário (preferência registrada: validação visual é do usuário, não por screenshot automatizado).

- [ ] **Step 3: Resumo da sessão**

Resumir em até 10 linhas: o que foi feito (P1/P2/P3), o que ficou pendente (backlog: `/capacitacao` órfã; demais anchors `#capacitacao`/`#eventos-abertos` do mega-menu que só funcionam na home), próximos passos sugeridos.

---

## Backlog documentado (fora deste plano)

- **`/capacitacao` órfã:** rota existe, sem entrada na navegação. Decidir porta de entrada em sessão futura.
- **Demais anchors de capacitação no mega-menu** (`#eventos-abertos`, `#eventon`, `#capacitacao` de "Próximas turmas"/"Eventos passados"): apontam para seções da home; só funcionam a partir dela. Decisão atual foi corrigir apenas "Agenda Geral NTC".
