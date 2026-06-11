# Responsividade mobile do portal — design

**Data:** 11 de junho de 2026
**Status:** aprovado em conversa (abordagem C — híbrida)
**Origem:** usuário relatou barra branca lateral no iPhone (Safari), elementos mal otimizados para mobile e desejo de animações de scroll reais.

## Problema

1. **Overflow horizontal:** no celular o site não preenche a tela — sobra uma barra branca lateral, sintoma clássico de elementos mais largos que o viewport. Suspeitos já mapeados nos 13 arquivos de CSS portado (~850 KB):
   - `home-prototipo.css:1666` — `.curadoria-selo::after` com `right: -120px; bottom: -120px` e 320px de diâmetro, sem proteção mobile.
   - `agenda-prototipo.css:1664` — `.agenda-pagination-item` com `flex: 1 1 280px; min-width: 240px` (4 itens = 1120px).
   - `evento-prototipo.css:1451,2141`, `modulo-prototipo.css`, `programas-prototipo.css:1515` — sidebar fixa `380px` (protegida em @1099px, mas aperta na faixa tablet).
   - `o-grupo-prototipo.css:1190` — `.nav-group__item.is-active::after` com `right: -10px` sem media query.
2. **Animações de scroll inexistentes:** `InteracoesScroll.tsx` revela todos os `.fade-in` de uma vez no mount. O IntersectionObserver foi removido no passado por risco de elementos ficarem invisíveis quando o IO não disparava.
3. **Elementos mal otimizados em mobile:** tipografia, grids, espaçamentos e alvos de toque a revisar em 375/412px.

## Decisões de design

### Frente 1 — Overflow horizontal (abordagem híbrida)

1. **Rede de segurança global:** `overflow-x: clip` em `html` e `body` no `globals.css` (`clip` em vez de `hidden` — não cria contexto de scroll nem quebra `position: sticky` no iOS). Protege contra conteúdo futuro do CMS (títulos longos etc.).
2. **Diagnóstico automatizado:** script Playwright que visita todas as rotas públicas em viewport 375×812 e lista todo elemento com `scrollWidth`/`getBoundingClientRect` além do viewport (rodado **antes** da trava global, para enxergar os ofensores).
3. **Correção cirúrgica:** corrigir cada ofensor real no CSS portado correspondente, via media queries — sem alterar o desktop, sem tocar em tokens visuais.

### Frente 2 — Animações de scroll

Reescrever `InteracoesScroll.tsx` (montado em todos os route groups) com IntersectionObserver e quatro camadas de segurança:

1. **Estado escondido só com JS confirmado:** script inline `beforeInteractive` no layout raiz adiciona classe `anim-scroll` ao `<html>`. As regras `.fade-in { opacity: 0; ... }` dos 13 CSS portados passam a ser `html.anim-scroll .fade-in { ... }` (edição mecânica por script). Sem JS, a página nasce 100% visível. Em `home-prototipo.css`, restaurar o estado base escondido (hoje neutralizado com `opacity: 1`).
2. **Acima da dobra aparece imediato:** elementos já visíveis no load são revelados no mount, sem esperar scroll.
3. **Fallbacks de plataforma:** sem suporte a IO ou com `prefers-reduced-motion` → revelar tudo direto.
4. **Cronômetro de segurança:** qualquer `.fade-in` não revelado após ~4s recebe `is-visible` à força. Nenhum elemento pode ficar invisível permanentemente.

Parâmetros do observer: `rootMargin: '0px 0px -10% 0px'`, `threshold: 0`, `unobserve` após revelar (anima uma vez só).

### Frente 3 — Otimização de elementos mobile

Com o diagnóstico da Frente 1 + revisão visual em 375/412px de todas as rotas públicas: corrigir tipografia que estoura, grids que não colapsam, paginação/subnavs apertadas e alvos de toque < 44px. Correções por media query nos CSS portados, mantendo fidelidade ao desktop aprovado.

## Rotas públicas no escopo

Home, /agenda, /agenda/[slug] (3 modalidades: online, presencial, híbrido), /programas e template de programa, /o-grupo, /corpo-docente, /conteudos, /solucoes, verticais, /contato e institucionais (políticas, termos, mapa do site).

## O que NÃO muda

- Nenhum token visual (cores, fontes, raios, sombras) — apenas media queries e correções de largura.
- Nenhum layout desktop aprovado.
- Nada no CMS/Payload nem na branch `feat/cms-soberana`.

## Validação

- `pnpm build` limpo.
- Script de diagnóstico re-rodado após as correções: zero elementos além do viewport em 375px em todas as rotas.
- Servidor `pnpm dev` deixado no ar ao final para o usuário validar no iPhone real (preferência registrada: validação visual é humana). Screenshots 375px como apoio.

## Riscos

- A edição mecânica dos 13 CSS (prefixo `html.anim-scroll`) precisa cobrir todas as variantes de seletor `.fade-in` (ex.: `.secao .fade-in`, `.fade-in.is-visible`); o script de substituição será conferido por diff.
- `overflow-x: clip` tem suporte a partir do Safari 16 (2022); versões anteriores ignoram a regra e caem nas correções cirúrgicas — comportamento atual, sem regressão.
- Sidebar 380px na faixa tablet: ajuste deve preservar o layout em desktop ≥ 1100px.
