# Correção de navegação interna — Portal Grupo NTC

**Data:** 2026-06-02
**Origem:** pente-fino de navegação entre páginas do site.

## Contexto

Uma varredura cruzou os links emitidos pelas páginas contra as rotas que existem
de fato no App Router. A espinha dorsal é sólida (todos os 8 route groups usam o
mesmo `HeaderHome` + `FooterHome`; as 17 rotas estáticas e 4 dinâmicas existem).
Foram encontrados 3 problemas de comunicação entre páginas.

**Princípio condutor:** não tocar em páginas/conteúdo aprovados (CLAUDE.md §5.6).
Todas as mudanças ficam confinadas a `next.config.ts` e a dois componentes de
navegação: `HeaderHome.tsx` e `RoteadorFormularios.tsx`. Os ~18 arquivos de
conteúdo de programa (`conteudoXXX.ts`) e as páginas aprovadas ficam **intocados**.

## Problema 1 (GRAVE) — `/contato/proposta` → 404

### Sintoma
Os 101 CTAs "Solicitar proposta" / "Solicitar folder" dos 15 programas apontam para
`/contato/proposta?programa=<slug>[&assunto=<x>][&modalidade=<y>]`. A rota
`/contato/proposta` **não existe** (só existe `/contato`), resultando em 404. É o
principal CTA de conversão do site.

Além disso, o `RoteadorFormularios` (sistema de abas de `/contato`) hoje lê apenas
`?evento`/`?evento_url` e o hash `#tab-proposta`; ignora `?programa`, `?assunto` e
`?modalidade`.

### Solução

**1a. Redirect em `next.config.ts`.** Adicionar `async redirects()`:

```ts
async redirects() {
  return [
    {
      source: "/contato/proposta",
      destination: "/contato",
      permanent: false, // 307 — preserva a query string
    },
  ];
}
```

Os 101 links nos arquivos de conteúdo ficam **intocados**. O navegador cai em
`/contato` com a query (`?programa=...&assunto=...&modalidade=...`) preservada.

Nota: `next.config.ts` já tem `experimental.typedRoutes: true`. O redirect não
conflita com isso; os links problemáticos são strings em dados de conteúdo e tags
`<a>` em strings HTML, que não passam por checagem de tipo de rota.

**1b. Pré-preenchimento em `RoteadorFormularios.tsx`.** Estender o `useEffect` de
mount (hoje em ~linha 176-212, que já lê `?evento`/`?evento_url`) para também
tratar os params vindos dos programas:

- `?programa=<slug>` → `ativarTab("proposta")` + pré-selecionar `<select name="programa">`.
- `?modalidade=<x>` → pré-selecionar `<select name="modalidade">`.
- `?assunto=<x>` → registrar o pedido na observação/mensagem da aba proposta.

Após aplicar, limpar a query da URL via `history.replaceState` (mesmo padrão já
usado para `?evento`), preservando o hash da aba.

#### Mapeamentos de valor (slug do link → value do select)

Os `value` dos selects **não casam 1:1** com os slugs dos links. Mapeamentos
explícitos necessários:

**Programa** — os links usam slug minúsculo; o select usa sigla MAIÚSCULA
(`OPTIONS_PROGRAMA_PROP` em `conteudoContato.ts`):

| slug do link | value no select |
|---|---|
| `edutec`, `pear`, `pei`, `proge`, `progir`, `egide`, `vivaescola`, `pinei`, `futura` | `EDUTEC`, `PEAR`, `PEI`, `PROGE`, `PROGIR`, `EGIDE`, `VIVAESCOLA`, `PINEI`, `FUTURA` |
| `agip`, `lidera`, `siga` | `AGIP`, `LIDERA`, `SIGA` |
| `sigs`, `proaps`, `prosus` | `SIGS`, `PROAPS`, `PROSUS` |

Na prática, `slug.toUpperCase()` cobre todos os 15 casos (confirmar `proaps`→`PROAPS`
e `prosus`→`PROSUS`, que batem; o label exibe "PROAPS+"/"PROSUS+" mas o value é
sem o `+`). Se a sigla normalizada não existir entre as options, não selecionar
nada (deixar no placeholder).

**Modalidade** — os links usam `incompany`, `sob-medida`, `trilha`; o select
(`OPTIONS_MODALIDADE`) tem valores diferentes:

| modalidade do link | value no select |
|---|---|
| `sob-medida` | `sob-medida` (casa direto) |
| `trilha` | `trilha` (casa direto) |
| `incompany` | `incompany-presencial` (default — o select não tem `incompany` puro; tem presencial/online/híbrido) |

Se a modalidade não casar, não selecionar nada.

**Assunto** — os links usam `folder`, `detalhes`, `inscricao`. **Não há campo
"assunto"** no formulário de proposta. Tratamento: pré-preencher a observação/
mensagem da aba proposta com um texto curto conforme o assunto (ex.: `assunto=folder`
→ "Solicito o folder do programa <X>."). Texto exato a definir na implementação,
respeitando que conteúdo institucional não deve ser inventado livremente
(CLAUDE.md §5.3) — usar texto funcional e neutro.

### Resultado esperado
Vindo de `/programas/agip`, o usuário chega em `/contato` com a aba **Proposta**
aberta e AGIP pré-selecionado. Zero 404.

## Problema 2 (médio) — 4 âncoras mortas no mega-menu

### Sintoma
O bloco "Modalidades de Contratação" do `HeaderHome` aponta para
`/solucoes#in-company`, `#turmas-fechadas`, `#sob-medida`, `#trilhas`. Em `/solucoes`
só existem os ids `modalidades`, `por-area`, `processo`, `contratacao-institucional`,
`faq`. As 4 âncoras não existem → o link leva à página mas não rola.

### Solução
Em `HeaderHome.tsx`, trocar as 4 âncoras inexistentes para `/solucoes#modalidades`
(seção que existe e lista as modalidades). `#contratacao-institucional` já está
correto e fica como está. Só edita o `HeaderHome`.

## Problema 3 (baixo) — `/agenda` órfã

### Sintoma
A rota `/agenda` existe e funciona, mas o link "Agenda Geral NTC" no mega-menu
(desktop ~linha 355) e no drawer mobile (~linha 475) aponta para `#capacitacao` —
âncora que só existe na home. A rota real `/agenda` nunca é alcançada pelo menu, e
o link só funciona quando o usuário já está na home.

### Solução
Em `HeaderHome.tsx`, apontar o link "Agenda Geral NTC" (desktop + mobile) para
`/agenda`. Só edita o `HeaderHome`.

### Backlog (fora deste escopo)
- `/capacitacao` também é órfã (sem entrada na navegação). Decidir a porta de
  entrada em sessão futura — não tratado aqui.
- Os demais anchors de capacitação no mega-menu (`#eventos-abertos`, `#eventon`,
  `#capacitacao` em "Próximas turmas"/"Eventos passados") continuam apontando para
  seções da home; só funcionam a partir da home. Não tratados neste plano (decisão:
  apenas "Agenda Geral NTC" → `/agenda`).

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `apps/web/next.config.ts` | + `async redirects()` (P1a) |
| `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx` | estender useEffect de mount: ler `?programa`/`?modalidade`/`?assunto` (P1b) |
| `apps/web/app/(home)/HeaderHome.tsx` | 4 âncoras → `#modalidades` (P2); "Agenda Geral NTC" → `/agenda` (P3, desktop + mobile) |

Nenhum arquivo de conteúdo de programa, nenhuma página aprovada.

## Verificação (CLAUDE.md §6 e §11)

- `pnpm typecheck` e `pnpm build` sem erros.
- `pnpm dev` + teste manual dos fluxos:
  - Clicar "Solicitar proposta" / "Solicitar folder" em um programa (ex.: AGIP) →
    conferir que cai em `/contato`, aba Proposta aberta, programa pré-selecionado,
    e (para folder) observação pré-preenchida.
  - Mega-menu "Modalidades de Contratação" → conferir rolagem para a seção
    modalidades de `/solucoes`.
  - Mega-menu "Agenda Geral NTC" (desktop e mobile) → conferir que abre `/agenda`.
- **Validação visual é feita pelo usuário** (servidor deixado no ar para aprovação
  humana), conforme preferência registrada — não por screenshot automatizado.

## Riscos

- O mapeamento `slug.toUpperCase()` depende de os 15 values do select continuarem
  sendo as siglas em maiúsculas. Mitigação: fallback "não selecionar" quando não
  casar; verificar `OPTIONS_PROGRAMA_PROP` na implementação.
- `?assunto` não tem campo dedicado: a observação pré-preenchida é uma
  aproximação. Não inventar texto institucional — usar texto funcional neutro.
