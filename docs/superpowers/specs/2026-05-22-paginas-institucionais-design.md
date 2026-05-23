# Páginas institucionais — porta dos protótipos HTML

**Data:** 22/05/2026
**Sprint:** F · Janela B
**Autor:** sessão guiada com Claude Code
**Status:** spec aprovada · pendente plano de implementação

## 1. Escopo

Portar 5 páginas institucionais avulsas do portal Grupo NTC, partindo dos protótipos HTML aprovados na raiz do repositório:

| # | Protótipo | Rota Next | Slug canonical |
|---|-----------|-----------|----------------|
| 30 | `30_Pagina_Privacidade_v1.html` | `/politica-de-privacidade` | declarado no `<link rel="canonical">` |
| 31 | `31_Pagina_Termos_v1.html` | `/termos-de-uso` | idem |
| 32 | `32_Pagina_Cookies_v1.html` | `/politica-de-cookies` | idem |
| 33 | `33_Pagina_LGPD_v1.html` | `/lgpd` | idem |
| 34 | `34_Pagina_MapaDoSite_v1.html` | `/mapa-do-site` | idem |

As 5 são páginas-folha: não dependem de coleções do CMS, não têm filtros, não compartilham conteúdo dinâmico com outras rotas. Conteúdo institucional sob revisão do DPO (privacidade, termos, cookies, LGPD) ou navegacional (mapa do site) — em qualquer caso, texto estático.

## 2. Não-escopo

- Não modela Globals/Collections no Payload CMS. Memória `feedback_cms_apenas_quando_pedido.md` orienta a manter conteúdo literal no JSX em portas de HTML, expandindo o CMS só quando o usuário pedir.
- Não toca no banner de cookies funcional (LGPD §12 do CLAUDE.md). Apenas a página estática `/politica-de-cookies`.
- Não revisa juridicamente o conteúdo. O texto sai do protótipo. Revisão DPO é workflow editorial externo.
- Não altera rotas existentes (home, o-grupo, programas, verticais, corpo-docente).
- Não modela CRM, formulários ou integrações.

## 3. Padrão de referência

Adota o padrão "porta do HTML" já validado (memória `project_porta_html.md`):

- CSS literal extraído do `<style>` inline do protótipo para `apps/web/app/<grupo>-prototipo.css`.
- Route group próprio em `apps/web/app/(<grupo>)/` com `layout.tsx` que importa o CSS e reaproveita `HeaderHome` + `FooterHome` da Home.
- `page.tsx` Server Component com o `<main>` traduzido para JSX, sem extração de componentes nem mocks.
- Texto institucional hard-coded no JSX, como em Home v3, programas e corpo-docente.

## 4. Inventário do que muda entre os 5 protótipos

Diff byte-a-byte das linhas 50–346 (`<style>`) dos 5 protótipos: **0 linhas de diferença**. Diff do `<header>` (354–466): apenas hrefs que apontam para HTMLs antigos — mesma estrutura, mesma navegação, mesmos mega-menus. Diff do `<footer>`: idêntico. O `<main>` é a única zona com conteúdo distinto entre as 5.

Consequência arquitetural: **um único CSS** e **um único `layout.tsx`** servem as 5 páginas.

## 5. Arquitetura

```
apps/web/app/
├── institucional-prototipo.css           ← novo · CSS literal extraído do <style> de qualquer um dos 5 protótipos (são idênticos)
└── (institucional)/                      ← novo route group
    ├── layout.tsx                        ← novo · importa o CSS, monta HeaderHome + skip-link + {children} + FooterHome
    ├── politica-de-privacidade/
    │   └── page.tsx                      ← <main> do protótipo 30 + metadata
    ├── termos-de-uso/
    │   └── page.tsx                      ← <main> do protótipo 31 + metadata
    ├── politica-de-cookies/
    │   └── page.tsx                      ← <main> do protótipo 32 + metadata
    ├── lgpd/
    │   └── page.tsx                      ← <main> do protótipo 33 + metadata
    └── mapa-do-site/
        └── page.tsx                      ← <main> do protótipo 34 + metadata
```

Espelha exatamente o que `(o-grupo)/layout.tsx`, `(programas)/layout.tsx` e `(vertical)/layout.tsx` já fazem hoje. Nenhum novo conceito.

### 5.1. `institucional-prototipo.css`

Conteúdo: cópia byte-a-byte do bloco `<style>` (linhas 50–346) do protótipo 30 — qualquer um serve, são idênticos. Mantém:

- `:root` com tokens Soberana 2026 (oxford, cardeal, oliva, dourado, pergaminho, espaçamentos, sombras, container-max, header-h).
- Reset + tipografia (Cormorant Garamond, Barlow, Barlow Condensed).
- `.skip-link`, `.container`, `.btn` e variantes.
- Header sticky `.site-header`, `.nav-primary`, `.mega`, `.mega-col`, `.mega-list`, mobile drawer.
- Footer `.site-footer`.
- Classes específicas das páginas institucionais (hero compacto, sumário lateral, blocos de cláusulas, etc.).

Duplicação aparente com `home-prototipo.css` é deliberada: cada route group mantém seu CSS para evitar regressões cruzadas, padrão consolidado em `o-grupo-prototipo.css`, `programas-prototipo.css`, `verticais-prototipo.css` e `corpo-docente-prototipo.css`.

### 5.2. `(institucional)/layout.tsx`

```tsx
import type { ReactNode } from "react";
import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import "../institucional-prototipo.css";

export default function LayoutInstitucional({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">Pular para conteúdo principal</a>
      <HeaderHome />
      {children}
      <FooterHome />
    </>
  );
}
```

Padrão idêntico a `(o-grupo)/layout.tsx`. Sem variações.

### 5.3. Estrutura de cada `page.tsx`

Server Component. Estrutura genérica:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "<title do protótipo>",
  description: "<meta description do protótipo>",
  alternates: { canonical: "<canonical do protótipo>" },
  openGraph: { /* og:* do protótipo */ },
  twitter: { /* twitter:* do protótipo */ },
};

export default function PaginaXxx() {
  return (
    <main id="main">
      {/* JSX traduzido literal do <main>...</main> do protótipo */}
    </main>
  );
}
```

Sem hooks. Sem `"use client"`. Sem extração de subcomponentes nessa primeira porta.

## 6. Tradução HTML → JSX

Regras aplicadas durante a porta (mesmas usadas nas portas anteriores):

- `class=` → `className=`
- `for=` → `htmlFor=`
- atributos `style="..."` inline → objeto `style={{ ... }}` quando preservados; preferir mover para classe quando possível, mas **só se não introduzir desvio visual**.
- Comentários HTML `<!-- ... -->` → comentários JSX `{/* ... */}` quando ajudam navegação; remover comentários puramente decorativos do tipo "============".
- `<svg>` inline preservado byte-a-byte.
- `<a href="./XX_Pagina_Yyy.html">` → reescrever conforme tabela §6.1. Manter `data-cms-link` original como atributo HTML simples (`data-cms-link="..."`) — não é prop React reservada, atravessa o JSX literal.
- Entidades HTML (`&nbsp;`, `&mdash;`, `&middot;`, `&ndash;`) → preservar como literal no JSX usando `{" "}` apenas quando o JSX não aceita a entidade direta; preferir o caractere Unicode embutido.

### 6.1. Reescrita de hrefs

Tabela de mapeamento aplicada a todos os `<a href>` encontrados nos `<main>` das 5 páginas:

| HREF no protótipo | Substituição |
|-------------------|--------------|
| `./02_Prototipo_Home_GrupoNTC_v2_6.html` | `/` |
| `./02_Prototipo_Home_GrupoNTC_v2_6.html#conteudos` | `/#conteudos` (placeholder até porta da seção) |
| `./08_Pagina_O_Grupo_NTC_v3.html` | `/o-grupo` |
| `./25_Pagina_Corpo_Docente_v1.html` | `/o-grupo/corpo-docente` |
| `./07_Pagina_Vertical_NTC_Educacao_v1.html` | `/solucoes-estrategicas/ntc-educacao` |
| `./07_Pagina_Vertical_NTC_GestaoPublica_v1.html` | `/solucoes-estrategicas/ntc-gestao-publica` |
| `./07_Pagina_Vertical_NTC_Saude_v1.html` | `/solucoes-estrategicas/ntc-saude` |
| `./XX_Pagina_Programa_<SIGLA>_v1.html` | `/programas/<slug-da-sigla-em-minúsculas>` (mesmo padrão de `conteudoIndex.ts` em `(programas)/programas/[slug]/`) |
| `./30_Pagina_Privacidade_v1.html` | `/politica-de-privacidade` |
| `./31_Pagina_Termos_v1.html` | `/termos-de-uso` |
| `./32_Pagina_Cookies_v1.html` | `/politica-de-cookies` |
| `./33_Pagina_LGPD_v1.html` | `/lgpd` |
| `./34_Pagina_MapaDoSite_v1.html` | `/mapa-do-site` |
| `./09_Pagina_Agenda_v2.html` (+ âncoras) | `href="#"` (rota não portada) |
| `./12_Pagina_Contato_v1.html` (+ âncoras) | `href="#"` (rota não portada) |
| `./26_Pagina_Solucoes_v1.html` (+ âncoras) | `href="#"` (rota não portada) |
| `./27_Pagina_EventOn_v1.html` | `href="#"` (rota não portada) |
| `./28_Pagina_EventOn_Detalhe_v1.html` | `href="#"` (rota não portada) |
| `./29_Pagina_Area_Participante_v1.html` | `href="#"` (rota não portada) |
| `mailto:*`, `tel:*`, links externos `https://*` | preservar literal |

**Decisão sobre `href="#"`:** mantém a string `#`, preserva `data-cms-link`, e adiciona comentário JSX `{/* rota não portada: protótipo 09_Agenda */}` na linha imediatamente acima. A skill `superpowers:verification-before-completion` exige listar essas pendências no resumo da sessão para acompanhamento. Não usar `<Link>` do Next nesses casos — `<a>` simples basta, evita prefetch desnecessário em rota inexistente.

**Decisão sobre `<Link>` vs `<a>`:** este primeiro passe usa `<a>` em todos os links internos, mantendo paridade textual com o protótipo. A conversão para `<Link>` é trabalho de outra sessão (todas as 5 portas anteriores também usam `<a>` direto, conferido em `corpo-docente/page.tsx`).

## 7. Página por página

### 7.1. `/politica-de-privacidade` (protótipo 30)

- `<main>` linhas 512–769 do `30_Pagina_Privacidade_v1.html`.
- Conteúdo: hero compacto + sumário lateral + cláusulas numeradas (bases legais LGPD, direitos do titular, DPO, governança).
- Metadata: title "Política de Privacidade · Grupo NTC", canonical `https://www.grupontc.com.br/politica-de-privacidade`.
- Marcador `data-cms-link="legal-privacidade"` preservado no `<main>` ou raiz da página conforme protótipo.

### 7.2. `/termos-de-uso` (protótipo 31)

- `<main>` linhas 512–717.
- Conteúdo: regras de acesso, propriedade intelectual, EventOn, certificação, foro.
- Metadata: title "Termos de Uso · Grupo NTC", canonical `/termos-de-uso`.
- `data-cms-link="legal-termos"`.

### 7.3. `/politica-de-cookies` (protótipo 32)

- `<main>` linhas 512–725.
- Conteúdo: categorias de cookies (essenciais, performance, marketing), tabela de cookies, como gerenciar consentimento.
- Metadata: title "Política de Cookies · Grupo NTC", canonical `/politica-de-cookies`.
- `data-cms-link="legal-cookies"`.
- **Importante:** esta página é apenas o texto. O banner de cookies funcional (CLAUDE.md §12) é trabalho separado.

### 7.4. `/lgpd` (protótipo 33)

- `<main>` linhas 512–721.
- Conteúdo: visão geral da LGPD aplicada ao Grupo NTC, canais do DPO, formulário/instruções de direitos do titular.
- Metadata: title "LGPD · Grupo NTC", canonical `/lgpd`.
- `data-cms-link="legal-lgpd"`.
- Eventual formulário de direitos do titular: porta como HTML estático nesta sessão; integração com Resend/coleção `Lead` fica fora de escopo.

### 7.5. `/mapa-do-site` (protótipo 34)

- `<main>` linhas 512–756.
- Conteúdo: índice navegacional de **todas** as rotas do portal, agrupadas por seção.
- Metadata: title "Mapa do Site · Grupo NTC", canonical `/mapa-do-site`.
- **Auditoria de hrefs obrigatória:** ler cada `<a>` do `<main>` e classificar em (a) rota portada → reescrever pela tabela §6.1, (b) rota não portada → `href="#"` + comentário JSX indicando protótipo de origem. Total esperado: dezenas de links. O resumo da sessão deve listar quantos linkam para rotas reais vs quantos ficam pendentes.

## 8. Acessibilidade

Já garantido pelo protótipo (validado em portas anteriores):

- `<main id="main">` presente.
- `.skip-link` injetado pelo `layout.tsx` do route group.
- `<h1>` único por página (no hero de cada uma).
- Landmarks `<header>`, `<nav>`, `<main>`, `<footer>` herdados de HeaderHome/FooterHome e do `<main>` de cada page.
- `:focus-visible` com outline dourado (token CSS).
- Contraste tokens Soberana 2026 já auditado em sprints anteriores.

Sem trabalho adicional de a11y nesta sessão.

## 9. Performance

- Server Components puros → SSG por padrão. Sem revalidação (conteúdo institucional muda raramente, mas pode-se adicionar `export const revalidate = 3600` se desejável; por padrão, deixar SSG estático completo).
- Sem imagens novas (protótipos institucionais não usam imagens de hero, apenas o logo do header).
- Fontes já carregadas via `next/font` no layout raiz.
- LCP ≤ 1.8s P75 mobile esperado, dado que são páginas só-texto.

## 10. Validação visual (checkpoint)

Conforme memória `feedback_validacao_visual.md`:

1. Subir `pnpm dev` (preferir não rodar em background se outra sessão já roda; checar antes — memória `feedback_db_push_paralelo.md` é sobre Payload, mas o princípio de não duplicar processo vale).
2. Listar as 5 URLs:
   - `http://localhost:3000/politica-de-privacidade`
   - `http://localhost:3000/termos-de-uso`
   - `http://localhost:3000/politica-de-cookies`
   - `http://localhost:3000/lgpd`
   - `http://localhost:3000/mapa-do-site`
3. Usuário abre uma a uma, compara com o protótipo HTML correspondente aberto em paralelo, aponta divergências.
4. Claude não declara "pronto" antes do OK explícito do usuário em cada uma.

## 11. Critérios de aceitação

- [ ] `apps/web/app/institucional-prototipo.css` existe com o `<style>` inline literal extraído de qualquer um dos 5 protótipos.
- [ ] `apps/web/app/(institucional)/layout.tsx` importa o CSS, monta HeaderHome + FooterHome + skip-link.
- [ ] 5 `page.tsx` criados com `<main>` literal do protótipo correspondente + metadata.
- [ ] Todos os hrefs internos do `<main>` reescritos pela tabela §6.1.
- [ ] `pnpm typecheck` passa.
- [ ] `pnpm lint` passa.
- [ ] `pnpm build` passa.
- [ ] As 5 rotas abrem no `pnpm dev` e renderizam com paridade visual ao protótipo (validação humana).
- [ ] Resumo da sessão lista quantos links em `/mapa-do-site` viraram `href="#"` por dependerem de rotas ainda não portadas.

## 12. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Algum bloco CSS específico da página institucional colidir com classes do `home-prototipo.css` (carregado no header/footer compartilhado) | Baixa | Os 5 protótipos rodam standalone com o mesmo CSS. Se houver colisão, isolar dentro do route group via classe-pai (`.pagina-institucional .classe`). Decisão durante implementação. |
| `<main>` de Mapa do Site tiver muito mais conteúdo do que parece e exceder limite razoável de tamanho de page.tsx | Média | Permitido extrair para `conteudoMapaDoSite.ts` se passar de ~600 linhas. Não é objetivo do plano fazer isso preventivamente. |
| Algum link interno apontar para anchor (`#secao`) em página não portada | Média | Tratar como rota não portada (`href="#"` + comentário JSX), preservando `data-cms-link`. |
| Conteúdo jurídico estar desatualizado em relação à versão aprovada pelo DPO | Alta para go-live; baixa para esta sessão | Fora do escopo desta porta. Versão portada espelha o protótipo aprovado em 14/05/2026. Atualização editorial é workflow separado. |

## 13. Próximo passo

Invocar `superpowers:writing-plans` para detalhar a implementação em tarefas executáveis.
