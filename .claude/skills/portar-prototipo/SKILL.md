---
name: portar-prototipo
description: Acelera o brainstorming de porta de protótipo HTML para página Next.js neste projeto. Pula perguntas redundantes (padrão "porta do HTML" já estabelecido), inclui inline as memórias relevantes, e vai direto para 2-3 perguntas específicas + design proposto. Use quando o usuário pedir "vamos portar a página X", "refazer/portar o protótipo Y", ou digitar /portar-prototipo.
---

# Portar Protótipo HTML — Skill do Projeto Portal NTC

Esta skill substitui o brainstorming genérico de `superpowers:brainstorming` **só para portas de protótipo HTML neste repositório**. O padrão arquitetural já está consolidado (5 páginas portadas até agora: Home v3, O Grupo, 3 verticais, 15 programas, Corpo Docente, 4 institucionais). Não há mais decisões abertas — só execução com 2-3 parâmetros específicos da página em questão.

## Quando NÃO usar

- Trabalho que não é porta de HTML: use `superpowers:brainstorming` normal.
- Refactor de página já portada que precisa repensar arquitetura: use `superpowers:brainstorming` normal.
- Bug fix em página existente: vai direto, sem skill.

## Fluxo desta skill

Em vez do brainstorming de 8 passos, esta skill segue 5:

1. **Confirmar o HTML alvo** (1 pergunta — qual arquivo `.html` na raiz do repo).
2. **Confirmar a rota destino e route group** (1 pergunta com sugestão automática baseada no nome do HTML).
3. **Inventariar interatividade** (lendo o `<script>` do HTML — sem pergunta, é decisão técnica).
4. **Apresentar design** (estrutura de arquivos + lista de client components necessários) em **uma única mensagem**, aguardar OK.
5. **Escrever spec** em `docs/superpowers/specs/YYYY-MM-DD-pagina-<slug>-design.md` usando o template em `spec-template.md` (mesma pasta desta skill).

Depois do spec aprovado pelo usuário: invocar `superpowers:writing-plans` normalmente.

## Contexto fixo — não perguntar

O usuário NÃO deve ser interrogado sobre nada disto. Essas são decisões já tomadas no projeto:

### Stack e convenções
- Next.js 15 App Router, TypeScript strict, RSC por padrão.
- CSS literal sem Tailwind para classes do protótipo (`.docentes-*`, `.prog-*` etc.). Tailwind apenas em utilidades genéricas.
- Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, `--pergaminho`, `--font-serif`, `--font-cond`, `--font-sans`, `--space-*`, `--t-*`, `--shadow-*`) vêm de `home-prototipo.css`. Não duplicar.
- Naming: PascalCase pt-BR para componentes (`<HeroPrograma>`), camelCase pt-BR para conceitos editoriais, inglês só para conceitos técnicos puros.

### Estratégia "porta do HTML" (memory `project_porta_html.md`)
- CSS literal extraído dos blocos `<style>` do HTML, salvo em `apps/web/app/<slug>-prototipo.css`, importado pelo root `layout.tsx`.
- Textos em arquivo local `conteudo<Nome>.ts` na pasta da página (NÃO no CMS — memory `feedback_cms_apenas_quando_pedido.md`).
- `page.tsx` server component renderiza JSX literal das seções do `<main>` do protótipo.
- Client components apenas para interatividade que o protótipo já tem (sticky, accordion, filterbar, observer, etc.).
- Header/Footer reaproveitados do route group correspondente (`(home)`, `(o-grupo)`, etc.).

### Fidelidade 100% (memory `feedback_porta_html_fidelidade.md`)
- Ler o `<main>` inteiro antes de modelar o tipo do conteúdo.
- Preservar tags inline (`<strong>`, `<em>`, `<br>`, `<a>`) literais nas strings — renderizar com `dangerouslySetInnerHTML`.
- Re-ler cards/items um a um para garantir todos os campos `data-*`.
- Não rephrasing de textos. Não "melhorias" silenciosas. Não inventar valores em selects (memory: PERPAGE_OPTIONS=96 inventado deu errado).
- Validação visual é feita pelo usuário humano (memory `feedback_validacao_visual.md`), não por screenshot automatizado. Servidor fica no ar para comparação lado a lado com o HTML do protótipo.

### Gotchas conhecidos
- **URLs em CSS portado**: substituir `url('./img/...')` por `url('/img/...')` (memory `feedback_css_url_absoluto.md`). Next quebra com caminho relativo.
- **Listagens com pipeline de filtros** (Corpo Docente, futuras agenda/conteúdos): seguir `project_listagem_client_filtros.md` — Client Component renderiza grade inteira; featured ficam fora do filtro; URL-sync via `window.history.replaceState`; coordenação via Context Provider local com pattern de nonce.
- **`noUnusedLocals: true`**: se criar arquivo "andaime" (parte 1 sem JSX, parte 2 com JSX), usar bloco `/* Reservas para Task N */` de `void X;` para imports/helpers que serão consumidos depois.
- **`noUncheckedIndexedAccess: true`**: split de strings com `.split(",")[0]` precisa de `?? ""` ou guard.
- **SVG com primitivas não-`<path>`** (axis cards no Corpo Docente): guardar `iconeSvgInner: string` com innerHTML completo do `<svg>` e renderizar com `dangerouslySetInnerHTML` no `<svg>`. Não tentar abstrair só `path d`.
- **Hrefs internos do protótipo** (`./12_Pagina_Contato_v1.html#tab-proposta` etc.): manter literal com comentário `// TODO: rota X ainda não criada` apontando para a rota futura. Não inventar rotas.

### Checkpoint visual (não negociável)
- Ao final da implementação: subir `pnpm next dev --port 3000` (NÃO `pnpm dev` — turbo não propaga logs dos sub-processos, dificulta debug).
- Curl `http://localhost:3000/<rota>` deve retornar 200.
- Pedir ao usuário para abrir lado a lado o protótipo HTML local e a página renderizada, comparar e aprovar.

### Estrutura de commits
- Conventional Commits em português, prefixo do escopo (`feat(corpo-docente): ...`, `fix(corpo-docente): ...`, `refactor(corpo-docente): ...`).
- Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
- Não commitar arquivos deletados/untracked não relacionados que aparecem no `git status` (são de outras sessões).
- Stage explícito por path: nada de `git add .` ou `git add -A`.

## As 3 perguntas obrigatórias

Faça **uma de cada vez**, espere resposta, então passe para a próxima.

### Pergunta 1 — Qual o protótipo HTML alvo?

Listar com `ls /Users/joao/Documents/portal-ntc/*_Pagina_*.html /Users/joao/Documents/portal-ntc/*_Prototipo_*.html 2>/dev/null` antes de perguntar. Apresentar opções via AskUserQuestion se houver ambiguidade, ou confirmar o caminho diretamente se o usuário já disse o nome.

### Pergunta 2 — Rota destino e route group

Inferir do nome do HTML (`12_Pagina_Contato_v1.html` → `/contato`, route group `(institucional)` ou `(site)` dependendo do que já existe; `25_Pagina_Corpo_Docente_v1.html` → `/o-grupo/corpo-docente`, route group `(o-grupo)`). Validar com `ls apps/web/app/` para ver route groups disponíveis. Se óbvio, confirmar; se ambíguo, perguntar.

### Pergunta 3 — Interatividade do protótipo

Ler os blocos `<script>` do HTML (`grep -n "^[[:space:]]*<script\|^[[:space:]]*</script" <arquivo>`). Identificar IIFEs com interatividade (filterbar, accordion, sticky, observer, scroll handlers, form validation, captcha, etc.). Listar para o usuário e confirmar quais portar **agora** vs. **depois** (alguns podem entrar em sessão futura — ex.: hCaptcha pode ficar para depois se a API ainda não está configurada).

## Apresentar o design — uma única mensagem

Estrutura do design (template):

```
## Design — Página <Nome>

### Estrutura de arquivos
- apps/web/app/<slug>-prototipo.css (CSS literal, ~N linhas)
- apps/web/app/(<route-group>)/<rota>/page.tsx (server)
- apps/web/app/(<route-group>)/<rota>/conteudo<Nome>.ts (textos + tipos)
- apps/web/app/(<route-group>)/<rota>/<ClientComp1>.tsx
- apps/web/app/(<route-group>)/<rota>/<ClientComp2>.tsx
- (...)

### Seções server-side (do <main>)
Lista numerada das N seções na ordem do HTML, indicando quais usam dangerouslySetInnerHTML e quais delegam para client components.

### Client components necessários
Para cada interatividade do protótipo: nome do componente, props, side effects.

### Decisões fixadas
- revalidate: 3600
- Header/Footer: route group <X>
- Hrefs internos placeholder: rota Y / Z ainda não existe → marcar TODO

### Validação
- pnpm typecheck / lint / build (devem passar)
- pnpm next dev na porta 3000
- Checkpoint visual humano lado a lado com prototipo HTML
```

Encerrar com: "OK com este design?". Se sim → escrever spec. Se não → ajustar e re-apresentar.

## Spec template

Usar `.claude/skills/portar-prototipo/spec-template.md` como base. Substituir os placeholders `{{NOME}}`, `{{SLUG}}`, `{{ROTA}}`, `{{ROUTE_GROUP}}`, `{{HTML_FILE}}`, `{{DATA_ISO}}` etc.

Salvar em `docs/superpowers/specs/YYYY-MM-DD-pagina-<slug>-design.md` e commitar com mensagem:

```
docs(spec): adiciona design da porta da página <Nome>

<resumo de 2-3 linhas: o que a página é, route group, interatividade principal>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Pedir review humano. Após OK do usuário, invocar `superpowers:writing-plans`.

## O que esta skill NÃO faz

- Não escreve o plano (writing-plans cuida).
- Não executa (subagent-driven-development cuida).
- Não substitui o brainstorming para tarefas que não são porta de HTML.
- Não cria novos componentes do design system fora do que o protótipo manda (CLAUDE.md §5.1 — autorização explícita).
