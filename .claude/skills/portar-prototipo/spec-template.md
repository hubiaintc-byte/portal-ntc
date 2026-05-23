# Página {{NOME}} — Design (porta do HTML)

**Data:** {{DATA_ISO}}
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `{{HTML_FILE}}` (`{{LINHAS_HTML}} linhas`) para a rota `{{ROTA}}` no route group `({{ROUTE_GROUP}})`. Segue a estratégia "porta do HTML" já consolidada no projeto (CSS literal extraído + `page.tsx` server + `conteudo{{NOME}}.ts` local + Client Components mínimos para interatividade).

{{CONTEXTO_ADICIONAL}}

## 2. Documentos de referência

- `{{HTML_FILE}}` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota dentro do route group.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual (esta porta usa classes literais do HTML, não componentes do inventário).
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- {{REFERENCIAS_ADICIONAIS}}

## 3. Arquitetura de arquivos

```
apps/web/app/
├── ({{ROUTE_GROUP}})/{{ROTA_PATH}}/
│   ├── page.tsx                       ← server component, JSX literal das seções
│   ├── conteudo{{NOME}}.ts            ← textos, tipos, dados estáticos
{{CLIENT_COMPONENTS_TREE}}
└── {{SLUG}}-prototipo.css             ← CSS literal dos blocos <style> do HTML
```

Importado pelo root `apps/web/app/layout.tsx`.

**Decisões fixadas:**

- Rota: `{{ROTA}}`.
- Layout do route group `({{ROUTE_GROUP}})` reaproveita Header + Footer existentes.
- `revalidate = 3600` no `page.tsx`.
{{DECISOES_EXTRAS}}

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">` do HTML):

{{SECOES_SERVER}}

Fora do `<main>` (auxiliares):

{{AUXILIARES_FORA_DO_MAIN}}

## 5. Estrutura do `conteudo{{NOME}}.ts`

Tipos e exports:

{{TIPOS_E_EXPORTS}}

## 6. Client components

{{CLIENT_COMPONENTS_DETALHE}}

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas {{LINHAS_STYLE}}), copiado sem adaptação. Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, etc.) vêm de `home-prototipo.css` — não duplicar.

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`).

Classes principais incluídas:

{{LISTA_CLASSES_CSS}}

## 8. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm next dev --port 3000` levantado (NÃO `pnpm dev` — turbo não propaga logs dos sub-processos).
4. Página servida em `http://localhost:3000{{ROTA}}`.
5. **Validação visual feita pelo usuário** comparando lado a lado com `{{HTML_FILE}}` aberto no navegador. Nenhum screenshot automatizado.
6. Smoke functional checklist:

{{SMOKE_CHECKLIST}}

## 9. Riscos e mitigações

{{RISCOS}}

## 10. Fora de escopo

{{FORA_DE_ESCOPO}}

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (estrutura → CSS → conteúdo → server JSX → Client Components → validação).
3. Typecheck + lint + dev server.
4. Checkpoint visual humano.
5. Commit final + atualização de memória se surgirem aprendizados novos.
