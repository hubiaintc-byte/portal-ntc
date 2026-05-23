# Blocos editoriais, listings, utilitários e helpers — design

**Sprint:** F · Sessão 8 (Janela B · checkpoint visual de componentes editoriais)
**Data:** 2026-05-20
**Status:** aprovado — pronto para plano de implementação
**Fontes canônicas:**
- `docs/12_Inventario_Componentes_Editoriais_v1.md` §7 (Blocos editoriais), §8 (Listings e grids), §10 (Utilitários tipográficos), §12 (Helpers e widgets sistêmicos)
- `docs/CLAUDE.md` §3 (Identidade Soberana 2026), §4.1 (stack), §5 (política anti-improvisação), §6 (checkpoints visuais)
- Spec da sessão anterior: `docs/superpowers/specs/2026-05-20-heroes-e-cards-design.md`

---

## 1. Objetivo

Entregar a camada média do design system Soberana 2026: blocos editoriais composíveis, listings e grids especializados, utilitários tipográficos e helpers sistêmicos. Esta sessão fecha o conjunto de componentes "átomos + moléculas" antes da Janela B começar a montar páginas reais (sessão 10 em diante).

Ao fim desta sessão `@ntc/ui` exporta ~30 componentes; `@ntc/lib` ganha o helper de SEO; `/design-system` se reorganiza em sub-rotas navegáveis.

## 2. Escopo

### 2.1. Entra

**Blocos editoriais** (`packages/ui/src/components/blocos/`):
- `tipos.ts` — `FundoBloco`, helpers `fundoPorTipo`, re-export de `Vert`/`acentoPorArea`
- `BlocoNumeros.tsx`
- `BlocoCitacao.tsx` (variantes `discreta`/`cerimonial`)
- `BlocoTexto.tsx` (consome `<RenderizadorLexical>`)
- `BlocoCtaInstitucional.tsx` (variantes `oxford`/`cardeal`/`oliva`/`neutro`)
- `BlocoImagemLegenda.tsx`
- `BlocoFaq.tsx` (envolve `FaqAcordeao`)
- `FaqAcordeao.tsx` (`"use client"`)
- `BlocoProgramacao.tsx`

**Listings** (`packages/ui/src/components/listings/`):
- `tipos.ts` — `ProgramaItem`, `EventoItem`, `EspecialistaItem`, `ModuloItem`, `FiltroEstado`
- `GradeProgramas.tsx` (suporta agrupamento por área)
- `GradeEventos.tsx` (suporta agrupamento por mês + estado vazio editorial)
- `GradeEspecialistas.tsx` (3 modos; grade 4 colunas conforme skill `ntc-palestrantes`)
- `ListaModulos.tsx` (variantes `completa`/`sumario`)
- `FiltrosAgenda.tsx` (`"use client"`, controlado via `onChange`)

**Utilitários tipográficos** (`packages/ui/src/components/utilitarios/`):
- `Eyebrow.tsx`
- `TituloSecao.tsx`
- `LinkEditorial.tsx`
- `Selo.tsx`

**Helpers e widgets sistêmicos** (`packages/ui/src/components/helpers/`):
- `ImagemSoberana.tsx` — wrapper de `next/image` com `proporcao`
- `JsonLd.tsx`
- `Revelar.tsx` (`"use client"`, respeita `prefers-reduced-motion`)
- `richtext/tipos.ts` — `RichTextContent` derivado do `payload-types`
- `richtext/RenderizadorLexical.tsx` — serializer node-a-node de Lexical → JSX tipográfico

**Helper de SEO** (`packages/lib/src/seo/`):
- `montaMetadataSoberana.ts` — função pura `(input) => Metadata`

**`packages/ui/src/index.ts`** — exporta todos os novos componentes + tipos.

**`apps/web/app/design-system/`** reorganizado em sub-rotas:
- `page.tsx` — índice navegável
- `heroes-e-cards/page.tsx` — move conteúdo atual
- `blocos/page.tsx`
- `listings/page.tsx`
- `utilitarios/page.tsx`
- `helpers/page.tsx`

### 2.2. Não entra

- Formulários (§9 do Inventário) — sessão 9.
- Rodapé `<RodapeSoberano>`, `<AssinaturaInstitucional>`, `<BarraInstitucional>` (§11) — sessão 9.
- `<BannerCookies>` (§12.3) — sessão 9 (junto com formulários e LGPD).
- Refactor de Heroes/Cards para consumir `<ImagemSoberana>` em vez de `next/image` direto — pode entrar como Task pequena no fim da sessão, **opcional**; se ficar fora desta sessão, vira follow-up.
- Páginas reais (`/`, `/o-grupo`, `/programas/[slug]`) — sessão 10+.
- Testes unitários (Vitest) ou e2e (Playwright) — sessão 15.

## 3. Decisões de design

### 3.1. Tipo `RichTextContent` derivado do payload-types

Vamos importar o tipo gerado pelo Payload (em `packages/types/src/payload-types.ts`, ex.: campo `Area.posicionamento`) em `helpers/richtext/tipos.ts`:

```typescript
import type { Area } from "@ntc/types";
export type RichTextContent = NonNullable<Area["posicionamento"]>;
```

Garante alinhamento perfeito com o CMS real. Quando `pnpm payload:generate` rodar, o tipo segue.

### 3.2. RenderizadorLexical — escopo de nodes

O `lexical-config.ts` em `apps/cms/src/shared/lexical-config.ts` define um conjunto restritivo de features ativas: `Paragraph`, `Heading h2/h3/h4`, `Bold`, `Italic`, `Underline`, `Link`, `OrderedList`, `UnorderedList`. Vamos cobrir esses nodes explicitamente. Para nodes não suportados, logar `console.warn` em dev e fazer skip (não derrubar a página).

Mapeamento canônico:

| Lexical node | JSX renderizado |
|---|---|
| `root` | `<>{children}</>` |
| `paragraph` | `<p className="font-corpo text-corpo text-grafite text-pretty">` |
| `heading h2` | `<h2 className="font-titulo text-h2 text-oxford">` |
| `heading h3` | `<h3 className="font-titulo text-h3 text-oxford">` |
| `heading h4` | `<h4 className="font-titulo text-h4 text-oxford">` |
| `list ul` | `<ul className="ml-6 list-disc font-corpo text-corpo">` |
| `list ol` | `<ol className="ml-6 list-decimal font-corpo text-corpo">` |
| `listitem` | `<li>` |
| `link` | `<LinkEditorial href={node.fields.url} externo={node.fields.newTab}>` |
| `text` com format bitmask | `<strong>` (1), `<em>` (2), `<u>` (8). Sem mistura visual além disso. |
| `linebreak` | `<br />` |

### 3.3. FiltrosAgenda controlado

Match com interface canônica do §8.5: recebe `estadoInicial?`, `programasDisponiveis`, e `onChange(filtros: FiltroEstado) => void`. Estado interno via `useState`; `useEffect` dispara `onChange` quando estado muda. **Não toca `next/navigation`** — a página de Agenda (sessão 12) decide se sincroniza com URL search params.

### 3.4. Revelar com prefers-reduced-motion

Client Component que:
1. Renderiza children já visíveis no SSR (`opacity-100`).
2. No client, se `prefers-reduced-motion: no-preference`, troca para `opacity-0 translate-y-2`, instala `IntersectionObserver`, e quando entra na viewport, volta para `opacity-100 translate-y-0` em 400ms ease-out.
3. Se `prefers-reduced-motion: reduce`, **não** anima — children ficam visíveis direto.

Implementação por classes Tailwind alternadas via `useState`. Sem inline `style={}`. Animação CSS via `transition-[opacity,transform] duration-[400ms] ease-out`. Sem hydration mismatch (server e primeiro paint do client têm o mesmo HTML: `opacity-100`).

### 3.5. ImagemSoberana

Wrapper de `next/image` com mapeamento `proporcao` → `aspect-*`:

| `proporcao` | classe |
|---|---|
| `1:1` | `aspect-square` |
| `4:3` | `aspect-[4/3]` |
| `3:2` | `aspect-[3/2]` |
| `16:9` | `aspect-video` |
| `20:23` | `aspect-[20/23]` |

Default `proporcao = "16:9"`. Wrapper aplica `relative w-full overflow-hidden bg-pergaminho`, e a `<Image>` interna usa `fill`. Prop `prioridade?` mapeia para `priority`.

**Decisão de escopo:** Heroes/Cards da sessão 7 continuam usando `next/image` direto nesta sessão. Refactor para `<ImagemSoberana>` é Task opcional ao fim da sessão. Se incluída, é um commit isolado.

### 3.6. JsonLd

Componente trivial que renderiza `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} />`. Não escapa conteúdo (assume schema confiável vindo de páginas/blocos do projeto).

### 3.7. /design-system reorganizado em sub-rotas

Cinco páginas filhas (`heroes-e-cards`, `blocos`, `listings`, `utilitarios`, `helpers`). Página índice é uma lista de cards-link curtos com nome e descrição da categoria. Cada sub-rota carrega só seu próprio conjunto.

Conteúdo atual de `/design-system/page.tsx` (Heroes + Cards) é movido para `/design-system/heroes-e-cards/page.tsx` sem mudanças funcionais. Breadcrumbs nas sub-rotas referenciam `/design-system` como pai.

### 3.8. Acessibilidade

- `FaqAcordeao`: pares `<button aria-expanded aria-controls>` + `<div role="region" aria-labelledby>` por item. Teclado: Enter/Space alternam.
- `FiltrosAgenda`: cada filtro é `<button>` ou `<select>` semântico. Estado visual sinaliza filtro ativo (não só cor — também borda mais espessa).
- `Revelar`: `aria-hidden` nunca aplicado (children sempre acessíveis ao leitor de tela).
- `LinkEditorial externo={true}`: `target="_blank" rel="noopener noreferrer"` + ícone indicador.

### 3.9. Sem `style={}` inline

Aplicado a todos os componentes desta sessão. A única exceção justificada (em HeroArea, sessão 7) é cor vinda de prop string em runtime — não temos casos assim nos blocos desta sessão.

## 4. Contratos de componente

Reproduzo as interfaces canônicas do Inventário §7, §8, §10, §12 para referência de revisão. Implementação preserva nomes e tipos literais.

### 4.1. Blocos (§7)

```typescript
interface BlocoNumerosProps {
  titulo?: string;
  numeros: { valor: string; rotulo: string }[]; // max 4
  fundo?: "osso" | "pergaminho" | "oxford";
  vert?: Area;
}

interface BlocoCitacaoProps {
  citacao: string;
  autoria: string;
  cargo?: string;
  variante?: "discreta" | "cerimonial"; // default discreta
}

interface BlocoTextoProps {
  titulo?: string;
  eyebrow?: string;
  corpo: RichTextContent;
  largura?: "editorial" | "texto";
}

interface BlocoCtaInstitucionalProps {
  titulo: string;
  descricao?: string;
  rotuloCta: string;
  linkCta: string;
  variante?: "oxford" | "cardeal" | "oliva" | "neutro"; // default oxford
  imagem?: { src: string; alt: string };
}

interface BlocoImagemLegendaProps {
  imagem: { src: string; alt: string };
  legenda?: string;
  credito?: string;
  proporcao?: "16:9" | "4:3" | "3:2" | "20:23";
  largura?: "editorial" | "amplo";
}

interface BlocoFaqProps {
  titulo?: string;
  itens: { pergunta: string; resposta: RichTextContent }[];
  variante?: "acordeao" | "expandido"; // default acordeao
}

interface BlocoProgramacaoProps {
  titulo?: string;
  itens: {
    horario: string;
    titulo: string;
    descricao?: string;
    palestrantes?: { nome: string; href?: string }[];
  }[];
}
```

BlocoFaq emite JSON-LD `FAQPage` via `<JsonLd>` (composição interna).

### 4.2. Listings (§8)

```typescript
interface ProgramaItem {
  sigla: string;
  nomeCompleto: string;
  area: Area;
  resumoVisaoGeral?: string;
  imagem: { src: string; alt: string };
  href: string;
  eyebrow?: string;
}

interface EventoItem {
  nome: string;
  imagem: { src: string; alt: string };
  dataInicio: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string };
  programa?: { sigla: string };
  area: Area;
  inscricaoAberta: boolean;
  href: string;
  eyebrow?: string;
}

interface EspecialistaItem {
  nome: string;
  titulacao: string;
  instituicao: string;
  cargoAtual?: string;
  foto: { src: string; alt: string };
  href?: string;
}

interface ModuloItem {
  numero: number;
  titulo: string;
  ementa: RichTextContent;
  cargaHoraria?: string;
  eventosVinculados?: { nome: string; href: string }[];
}

interface GradeProgramasProps {
  programas: ProgramaItem[];
  agruparPorArea?: boolean; // default true
  variante?: "editorial" | "compacto";
  filtroAtivo?: "todos" | Area;
}

interface GradeEventosProps {
  eventos: EventoItem[];
  agruparPorMes?: boolean; // default true
  ordenacao?: "cronologica" | "destaque";
  vazio?: React.ReactNode;
}

interface GradeEspecialistasProps {
  especialistas: EspecialistaItem[];
  modo?: "regular" | "expandido" | "cerimonial";
  vert?: Area;
}

interface ListaModulosProps {
  modulos: ModuloItem[];
  variante?: "completa" | "sumario";
}

interface FiltroEstado {
  modalidade: "todos" | Modalidade;
  area: "todos" | Area;
  programa?: string;
  mes?: string; // 'YYYY-MM'
}

interface FiltrosAgendaProps {
  programasDisponiveis: { sigla: string; nomeCompleto: string }[];
  estadoInicial?: Partial<FiltroEstado>;
  onChange: (filtros: FiltroEstado) => void;
}
```

### 4.3. Utilitários (§10)

```typescript
interface EyebrowProps {
  children: React.ReactNode;
  vert?: Area;
  variante?: "padrao" | "dourado";
}

interface TituloSecaoProps {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  alinhamento?: "esquerda" | "centro"; // default esquerda
  vert?: Area;
}

interface LinkEditorialProps {
  href: string;
  externo?: boolean;
  variante?: "padrao" | "inverso";
  children: React.ReactNode;
}

interface SeloProps {
  variante: "dourado" | "oxford" | "neutro" | "cardeal" | "oliva";
  children: React.ReactNode;
  tamanho?: "pequeno" | "medio";
}
```

### 4.4. Helpers (§12)

```typescript
interface ImagemSoberanaProps {
  src: string;
  alt: string;
  proporcao?: "16:9" | "4:3" | "3:2" | "20:23" | "1:1"; // default 16:9
  prioridade?: boolean;
  sizes?: string;
  className?: string;
}

interface JsonLdProps {
  schema: object;
}

interface RevelarProps {
  children: React.ReactNode;
  delay?: number; // ms, 0..600
}

export function montaMetadataSoberana(input: {
  titulo: string;
  descricao: string;
  imagemOg?: string;
  tipo?: "website" | "article" | "event";
}): Metadata;
```

## 5. Checkpoint visual

### 5.1. Estrutura final

```
/design-system            → índice navegável (cards-link)
/design-system/heroes-e-cards   → conteúdo atual movido
/design-system/blocos           → 7 blocos com mock data + Rich Text de demonstração
/design-system/listings         → 5 listings (Programas, Eventos, Especialistas, Módulos, Filtros)
/design-system/utilitarios      → 4 utilitários
/design-system/helpers          → ImagemSoberana ×5 proporções, JsonLd inspecionável, Revelar live
```

### 5.2. Critérios de aprovação

- Todas as 6 sub-rotas renderizam sem erro.
- BlocoFaq tem acordeão funcional (clique alterna estado).
- FiltrosAgenda chama `onChange` em cada interação (a página de DS exibe o estado atual em JSON).
- Revelar dispara animação ao rolar (e respeita `prefers-reduced-motion`).
- ImagemSoberana mostra 5 proporções com placeholders.
- Tipografia Soberana aplicada em todos.
- Sem bordas arredondadas em estruturas; pílulas/selos em `rounded-full`.
- Aprovação humana via `pnpm dev:web` ([[feedback_validacao_visual]]).

## 6. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Renderizador Lexical incompleto para conteúdo real do CMS | Cobrir nodes mais comuns; warning em dev + skip para nodes não suportados; iterar quando aparecer caso real. |
| 20 componentes num único PR difícil de revisar | Commits granulares (1 por componente). Reviews em lotes por categoria (blocos / listings / utilitários / helpers / design-system). |
| Revelar causando hydration mismatch | Server e primeiro paint do client renderizam children com `opacity-100`. Estado de "animar" só ativa após `useEffect` no client. |
| FiltrosAgenda re-renderizando demais por causa do `useEffect → onChange` | Comparar estado anterior antes de chamar `onChange`; usar `useMemo` para `FiltroEstado` derivado. |
| BlocoCtaInstitucional com 4 variantes cromáticas + imagem opcional vira matriz combinatória | Mapa de classes por variante (igual ao padrão de HeroInstitucional). Imagem opcional via prop `imagem?`. |
| Sub-rotas de `/design-system` aumentam build do web | Todas em `robots: { index: false }`, fora do sitemap. Tree-shaking remove componentes não usados nas rotas reais. |

## 7. Checks de aceitação

- [ ] `pnpm typecheck` passa em todos os workspaces
- [ ] `pnpm lint` passa
- [ ] `pnpm build` passa em `apps/web`
- [ ] Todas as 6 sub-rotas de `/design-system/*` renderizam sem warnings
- [ ] Usuário valida visualmente todos os componentes ([[feedback_validacao_visual]])
- [ ] Commit final do plano criado (ou commits granulares por componente, alinhado com o padrão da sessão 7)

---

*Spec gerada em 2026-05-20, Sprint F, Janela B.*
