# Heroes e Cards editoriais — design

**Sprint:** F · Sessão 7 (Janela A · checkpoint visual de componentes editoriais)
**Data:** 2026-05-20
**Status:** aprovado — pronto para plano de implementação
**Fontes canônicas:**
- `docs/12_Inventario_Componentes_Editoriais_v1.md` §5 (Hero family) e §6 (Cards editoriais)
- `docs/CLAUDE.md` §3 (Identidade Soberana 2026), §5 (política anti-improvisação), §6 (checkpoints visuais)

---

## 1. Objetivo

Entregar as cinco famílias de Hero e as cinco famílias de Card especificadas no Inventário §5–§6 como componentes de `@ntc/ui`, com props idênticas às interfaces canônicas, prontas para serem consumidas pelas páginas reais (Home, Áreas, Programas, Eventos, Conteúdos) nas sessões seguintes do Sprint F.

Esta sessão **não** entrega `<ImagemSoberana>` — ele será criado na sessão 8. As imagens deste lote usam `next/image` diretamente, e o refactor para `<ImagemSoberana>` será mecânico (mesmo contrato de `{ src, alt }`).

## 2. Escopo

### 2.1. Entra

- `packages/ui/src/components/heroes/{HeroInstitucional,HeroArea,HeroPrograma,HeroEvento,HeroConteudo}.tsx`
- `packages/ui/src/components/heroes/tipos.ts` — tipos compartilhados de Hero
- `packages/ui/src/components/cards/{CardPrograma,CardEvento,CardEspecialista,CardConteudo,CardCliente}.tsx`
- `packages/ui/src/components/cards/tipos.ts` — tipos e helpers compartilhados de Card
- `packages/ui/package.json` — adicionar `next` em `peerDependencies` (^15.0.0)
- `packages/ui/src/index.ts` — exportar os 10 componentes e seus tipos
- `apps/web/app/design-system/page.tsx` — adicionar seções "Hero family" e "Cards editoriais" como checkpoint visual

### 2.2. Não entra

- `<ImagemSoberana>` (sessão 8)
- `<BotaoSoberano>` (sessão 9 — formulários). Os CTAs nos Heroes desta sessão usam `<a>` estilizado, com TODO claro para refactor.
- Páginas reais (`/educacao`, `/programas/[slug]` etc.) — apenas a página `/design-system` é atualizada.
- Storybook, testes unitários ou Playwright — fora do escopo desta janela.
- Lockups SVG por programa (placeholder textual com TODO).

## 3. Decisões de design

### 3.1. Acoplamento com Next.js

`@ntc/ui` passa a depender de `next` (peerDependency ^15.0.0) por uso direto de `next/link` e `next/image`. Aceitável: a única consumidora prevista do design system é `apps/web` (Next.js). Caso surja consumidor não-Next (Storybook standalone, e-mail templates), refatora-se a camada de Link/Image via prop de injeção.

### 3.2. Server Components por padrão

Nenhum dos 10 componentes precisa de estado de cliente nesta sessão (sem carousel, sem dropdown, sem animação interativa). Todos são RSC.

### 3.3. Tipo `Area` compartilhado

```typescript
export type Area = 'educacao' | 'gestao-publica' | 'saude';
```

Exportado de `heroes/tipos.ts` e reaproveitado em `cards/tipos.ts` via re-export. Quatro helpers:

- `acentoPorArea(area: Area): { texto: string; fundo: string; borda: string }` — devolve classes Tailwind do acento por área (oxford / cardeal / oliva).
- `rotuloArea(area: Area): string` — `"NTC Educação" | "NTC Gestão Pública" | "NTC Saúde"`.
- `formatarData(d: Date | string, formato: 'curto' | 'longo'): string` — wrapper de `Intl.DateTimeFormat('pt-BR')` para datas em pt-BR sem dependência externa.
- `formatarPeriodo(inicio, fim?): string` — usado em `HeroEvento` quando há `dataFim`.

### 3.4. Imagem mock no /design-system

`apps/web/app/design-system/page.tsx` injeta SVG inline data-uri determinísticos como placeholder. Um helper local `placeholderSvg(area, label)` gera um retângulo Oxford com filete na cor da área e a label em Cormorant. Nenhum fetch externo, nenhum arquivo em `public/`.

### 3.5. Conformidade Soberana

- Sem `border-radius` em estruturas. Pílulas/selos (`Eyebrow`, tag de modalidade, tag de área) usam `rounded-full`.
- Cormorant (`font-titulo`) para títulos de Hero, sigla de Programa, data destacada em Card, lide em Hero de Conteúdo.
- Barlow (`font-corpo`) para corpo, meta, eyebrows uppercase com letterspacing.
- Sem gradientes vibrantes. `HeroArea` usa um filete cromático (1px) na cor da área sobre fundo Oxford ou Pergaminho.
- Espaçamento generoso: heroes têm `min-h-[75vh]` no modo editorial e padding vertical em `var(--spacing-secao-vertical)`.

## 4. Contratos de componente (referência ao Inventário §5–§6)

Props idênticas às interfaces canônicas do Inventário. Reproduzidas aqui só por conveniência da revisão.

### 4.1. Heroes (§5)

| Componente | Interface canônica |
|---|---|
| `<HeroInstitucional>` | `eyebrow?, titulo, subtitulo?, imagem{src,alt}, ctas?[{rotulo,href,variante}], altura?:'completa'\|'editorial'` |
| `<HeroArea>` | `area, eyebrow?, titulo, subtitulo?, imagem, corAcento` |
| `<HeroPrograma>` | `sigla, nomeCompleto, eyebrow?, imagem, area, cargaHorariaTotal, modulosQuantidade?, ctaPrincipal?` |
| `<HeroEvento>` | `nome, eyebrow?, imagem, dataInicio, dataFim?, modalidade, local?, programa?, area, ctaInscricao?` |
| `<HeroConteudo>` | `categoria, titulo, lide, imagem, autor?, dataPublicacao, tempoLeitura?` |

Comportamentos canônicos (do Inventário):

- **HeroInstitucional**: altura default `editorial` = 75vh. `completa` = 100vh. CTAs lado a lado, `primario` em Oxford sólido, `secundario` em borda Oxford.
- **HeroArea**: lockup vertical da área no topo (texto "NTC Educação" / etc. em letterspacing editorial); filete cromático horizontal de 1px na `corAcento`; tipografia ampla; fundo Pergaminho.
- **HeroPrograma**: sigla em Cormorant com `letter-spacing` editorial (~0.04em), nome completo abaixo, "lockup do programa" à direita (placeholder textual com TODO claro), faixa de metadados (carga horária · módulos · modalidade implícita) abaixo da fold em Barlow uppercase.
- **HeroEvento**: data formatada via `formatarData`, intervalo via `formatarPeriodo` quando há `dataFim`. Tag de modalidade Soberana ("Online" / "Presencial" / "Híbrido") como pílula. Local condicional (cidade · estado · nomeLocal opcional). `ctaInscricao.externo` adiciona `target="_blank" rel="noopener noreferrer"`.
- **HeroConteudo**: categoria como eyebrow; título em Cormorant; lide em Barlow tamanho ampliado; meta linha com autor (nome · titulação) · data · tempo de leitura.

### 4.2. Cards (§6)

| Componente | Interface canônica |
|---|---|
| `<CardPrograma>` | `sigla, nomeCompleto, eyebrow?, imagem, area, resumoVisaoGeral?, href, variante?:'editorial'\|'compacto'` |
| `<CardEvento>` | `nome, eyebrow?, imagem, dataInicio, modalidade, local?, programa?, area, inscricaoAberta, href` |
| `<CardEspecialista>` | `nome, titulacao, instituicao, cargoAtual?, foto{src,alt}, href?, variante?:'regular'\|'expandido'\|'cerimonial'` |
| `<CardConteudo>` | `titulo, lide, categoria, imagem, area?, dataPublicacao, tempoLeitura?, href` |
| `<CardCliente>` | `nome, logo{src,alt}, esfera?, estado?, variante?:'mosaico'\|'lista'` |

Comportamentos canônicos (do Inventário):

- **CardPrograma editorial**: `next/image` no topo (4:3), sigla em Cormorant, nome completo, resumo de até ~2 linhas, link "Conhecer o programa →" em Barlow. Card inteiro clicável (via `next/link` wrapping).
- **CardPrograma compacto**: sem imagem, sigla + nome + tag de área. Mesma área clicável.
- **CardEvento**: tag de modalidade no canto superior direito, data em Cormorant destaque, local opcional, sigla do programa opcional, CTA "Inscrever-se →" se `inscricaoAberta`, senão "Detalhes →".
- **CardEspecialista**: foto sempre 20:23 (`aspect-[20/23]`); `regular` = foto + nome + titulação + instituição; `expandido` = mesmo + `cargoAtual` em destaque; `cerimonial` = card centralizado, fundo Pergaminho, selo dourado abaixo do nome.
- **CardConteudo**: imagem topo 16:9, categoria eyebrow, título em Cormorant, lide curta, meta `data · tempoLeitura`.
- **CardCliente mosaico**: logo central em retângulo Pergaminho com altura fixa; nome só em sr-only/alt.
- **CardCliente lista**: logo à esquerda, nome + esfera + estado à direita em Barlow.

## 5. Checkpoint visual

A página `/design-system` ganha duas novas seções no fim:

1. **Hero family** — uma amostra de cada um dos 5 heroes em sequência (cada hero ocupa sua altura natural). Dados mock vêm de constantes no topo do arquivo. SVG inline para imagens.
2. **Cards editoriais** — uma `<Secao>` por família com `<Grade>` mostrando variantes:
   - `CardPrograma` — 3 colunas: editorial × 2 + compacto × 1
   - `CardEvento` — 2 colunas: aberto + fechado
   - `CardEspecialista` — 3 colunas: regular + expandido + cerimonial
   - `CardConteudo` — 2 colunas, 2 amostras
   - `CardCliente` — mosaico (4 colunas) e lista (2 colunas) em duas grades

Critérios de aprovação visual:

- Todos os 5 heroes renderizam sem erro com dados mock.
- Todas as variantes de card aparecem.
- Cormorant nos títulos e siglas; Barlow no corpo.
- Sem efeitos vibrantes, sem bordas arredondadas em estruturas.
- Tags/pílulas (modalidade, área) com `rounded-full`.
- Aprovação humana via servidor `pnpm dev:web` (memória `feedback_validacao_visual`).

## 6. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Próxima sessão (ImagemSoberana) precisar mudar muitos arquivos | Contrato `{src, alt}` igual ao do Inventário — refactor mecânico |
| Lockup de programa ainda não existe como SVG | Placeholder textual com sigla em Cormorant + TODO comentado |
| `next` como peerDep limita consumidores futuros | Documentado no §3.1; refatorável via injeção de Link/Image |
| Cards clicáveis vs. CTAs internos (acessibilidade — nested anchor) | Card inteiro é `<Link>`. CTAs internos são `<span>` estilizados como link, sem `<a>` aninhado |
| Tempo da sessão excede 90min | Implementação dividida em duas tarefas paralelizáveis (heroes / cards) |

## 7. Checks de aceitação

- [ ] `pnpm typecheck` passa em `@ntc/ui` e `apps/web`
- [ ] `pnpm lint` passa
- [ ] `pnpm build` passa em `apps/web`
- [ ] `/design-system` renderiza no `pnpm dev:web` sem warnings de console
- [ ] Usuário valida visualmente os 10 componentes (memória `feedback_validacao_visual`)
- [ ] Commit `feat(ui): hero family e cards editoriais` criado

---

*Spec gerada em 2026-05-20, Sprint F, Janela A.*
