# Blocos, Listings, Utilitários e Helpers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar 20 componentes da camada média do design system Soberana 2026 (Inventário §7, §8, §10, §12) + helper de SEO em `@ntc/lib`, com checkpoint visual em `/design-system` reorganizado em sub-rotas.

**Architecture:** RSC por padrão em `packages/ui/src/components/{blocos,listings,utilitarios,helpers}/`. Três client components isolados (`FaqAcordeao`, `FiltrosAgenda`, `Revelar`). `RichTextContent` derivado do `payload-types` + `RenderizadorLexical` cobrindo os 8 nodes do `lexical-config.ts`. Helper de SEO puro em `@ntc/lib/seo/`. Cada categoria ganha sub-rota em `/design-system/<categoria>` com dados mock.

**Tech Stack:** TypeScript strict · Next.js 15 App Router · React 19 RSC · Tailwind CSS 4 · pnpm + Turborepo · `@payloadcms/richtext-lexical` (apenas tipos).

**Spec:** `docs/superpowers/specs/2026-05-20-blocos-listings-utilitarios-helpers-design.md`

---

## File Structure

### Criar

| Arquivo | Responsabilidade |
|---|---|
| `packages/ui/src/components/blocos/tipos.ts` | `FundoBloco`, helpers `fundoPorTipo`, re-export `Area`/`acentoPorArea`/`rotuloArea` |
| `packages/ui/src/components/blocos/BlocoNumeros.tsx` | Bloco de números de impacto (max 4) |
| `packages/ui/src/components/blocos/BlocoCitacao.tsx` | Citação discreta/cerimonial |
| `packages/ui/src/components/blocos/BlocoTexto.tsx` | Wrapper de Rich Text |
| `packages/ui/src/components/blocos/BlocoCtaInstitucional.tsx` | CTA cromático (4 variantes) |
| `packages/ui/src/components/blocos/BlocoImagemLegenda.tsx` | Figura editorial com legenda e crédito |
| `packages/ui/src/components/blocos/BlocoFaq.tsx` | FAQ Server + injeta JSON-LD |
| `packages/ui/src/components/blocos/FaqAcordeao.tsx` | Acordeão client (estado, teclado) |
| `packages/ui/src/components/blocos/BlocoProgramacao.tsx` | Timeline editorial de evento |
| `packages/ui/src/components/listings/tipos.ts` | `ProgramaItem`, `EventoItem`, `EspecialistaItem`, `ModuloItem`, `FiltroEstado` |
| `packages/ui/src/components/listings/GradeProgramas.tsx` | Grid de CardPrograma (com agrupamento) |
| `packages/ui/src/components/listings/GradeEventos.tsx` | Grid de CardEvento (com agrupamento por mês) |
| `packages/ui/src/components/listings/GradeEspecialistas.tsx` | Grid de CardEspecialista (4 cols) |
| `packages/ui/src/components/listings/ListaModulos.tsx` | Lista numerada de módulos |
| `packages/ui/src/components/listings/FiltrosAgenda.tsx` | Filtros client controlados |
| `packages/ui/src/components/utilitarios/Eyebrow.tsx` | Eyebrow tipográfico |
| `packages/ui/src/components/utilitarios/TituloSecao.tsx` | Header de seção com eyebrow/título/subtítulo |
| `packages/ui/src/components/utilitarios/LinkEditorial.tsx` | Link com underline editorial e indicador externo |
| `packages/ui/src/components/utilitarios/Selo.tsx` | Pílula colorida |
| `packages/ui/src/components/helpers/ImagemSoberana.tsx` | Wrapper de `next/image` com `proporcao` |
| `packages/ui/src/components/helpers/JsonLd.tsx` | Injeção de schema.org JSON-LD |
| `packages/ui/src/components/helpers/Revelar.tsx` | Fade-in client com `prefers-reduced-motion` |
| `packages/ui/src/components/helpers/richtext/tipos.ts` | `RichTextContent` derivado do payload-types |
| `packages/ui/src/components/helpers/richtext/RenderizadorLexical.tsx` | Serializer Lexical → JSX |
| `packages/lib/src/seo/montaMetadataSoberana.ts` | Função pura `(input) => Metadata` |
| `apps/web/app/design-system/heroes-e-cards/page.tsx` | Conteúdo atual de `/design-system` movido |
| `apps/web/app/design-system/blocos/page.tsx` | Showcase de blocos |
| `apps/web/app/design-system/listings/page.tsx` | Showcase de listings |
| `apps/web/app/design-system/utilitarios/page.tsx` | Showcase de utilitários |
| `apps/web/app/design-system/helpers/page.tsx` | Showcase de helpers |
| `apps/web/app/design-system/_mocks/lexical.ts` | Documento Lexical realista para showcase de BlocoTexto/Faq/ListaModulos |

### Modificar

| Arquivo | Mudança |
|---|---|
| `packages/ui/src/index.ts` | Exportar todos os novos componentes/tipos/helpers |
| `packages/lib/src/index.ts` | Exportar `montaMetadataSoberana` |
| `apps/web/app/design-system/page.tsx` | Reescrever como índice navegável (move conteúdo para `heroes-e-cards/`) |

### Testes

Não há testes unitários nesta sessão — segue padrão estabelecido na sessão 7 (validação visual humana). Vitest entra na sessão 15.

---

## Task 1: Tipos compartilhados de blocos

**Files:**
- Create: `packages/ui/src/components/blocos/tipos.ts`

- [ ] **Step 1: Criar arquivo de tipos**

```typescript
export type FundoBloco = "osso" | "pergaminho" | "oxford";

export interface ClassesFundo {
  fundo: string;
  texto: string;
  textoSuave: string;
  borda: string;
}

const FUNDO: Record<FundoBloco, ClassesFundo> = {
  osso: {
    fundo: "bg-osso",
    texto: "text-grafite",
    textoSuave: "text-grafite-suave",
    borda: "border-linha-sutil",
  },
  pergaminho: {
    fundo: "bg-pergaminho",
    texto: "text-grafite",
    textoSuave: "text-grafite-suave",
    borda: "border-linha-sutil",
  },
  oxford: {
    fundo: "bg-oxford",
    texto: "text-osso",
    textoSuave: "text-osso/80",
    borda: "border-osso/20",
  },
};

export function fundoPorTipo(fundo: FundoBloco): ClassesFundo {
  return FUNDO[fundo];
}

export type { Area, Modalidade } from "../heroes/tipos";
export { acentoPorArea, rotuloArea, rotuloModalidade, formatarData, formatarPeriodo } from "../heroes/tipos";
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/blocos/tipos.ts
git commit -m "feat(ui): tipos compartilhados de blocos (FundoBloco, fundoPorTipo)"
```

---

## Task 2: RichTextContent + RenderizadorLexical

**Files:**
- Create: `packages/ui/src/components/helpers/richtext/tipos.ts`
- Create: `packages/ui/src/components/helpers/richtext/RenderizadorLexical.tsx`

- [ ] **Step 1: Criar tipos derivados do payload-types**

`packages/ui/src/components/helpers/richtext/tipos.ts`:

```typescript
import type { Area } from "@ntc/types";

/**
 * Tipo do conteúdo Rich Text Lexical conforme gerado pelo Payload.
 *
 * Derivado do campo `posicionamento` da coleção Areas — qualquer campo
 * Rich Text gerado pelo Payload tem a mesma estrutura raiz, pois o
 * lexical-config.ts restritivo é compartilhado entre coleções.
 */
export type RichTextContent = NonNullable<Area["posicionamento"]>;

export type LexicalNode = RichTextContent["root"]["children"][number];
```

- [ ] **Step 2: Criar renderizador**

`packages/ui/src/components/helpers/richtext/RenderizadorLexical.tsx`:

```tsx
import type { ReactNode } from "react";
import { LinkEditorial } from "../../utilitarios/LinkEditorial";
import type { RichTextContent } from "./tipos";

export interface RenderizadorLexicalProps {
  content: RichTextContent;
}

interface BaseNode {
  type: string;
  version: number;
  [k: string]: unknown;
}

interface TextNode extends BaseNode {
  type: "text";
  text: string;
  format: number;
}

interface LinkFieldsLexical {
  url?: string;
  newTab?: boolean;
  linkType?: "custom" | "internal";
}

interface LinkNode extends BaseNode {
  type: "link";
  fields: LinkFieldsLexical;
  children: BaseNode[];
}

interface ElementNode extends BaseNode {
  children: BaseNode[];
}

const FMT_BOLD = 1;
const FMT_ITALIC = 2;
const FMT_UNDERLINE = 8;

function renderTexto(no: TextNode): ReactNode {
  let conteudo: ReactNode = no.text;
  if ((no.format & FMT_UNDERLINE) !== 0) conteudo = <u>{conteudo}</u>;
  if ((no.format & FMT_ITALIC) !== 0) conteudo = <em>{conteudo}</em>;
  if ((no.format & FMT_BOLD) !== 0) conteudo = <strong>{conteudo}</strong>;
  return conteudo;
}

function renderFilhos(nos: BaseNode[]): ReactNode[] {
  return nos.map((no, i) => <NoLexical key={i} no={no} />);
}

function NoLexical({ no }: { no: BaseNode }): ReactNode {
  switch (no.type) {
    case "text":
      return renderTexto(no as TextNode);
    case "linebreak":
      return <br />;
    case "paragraph": {
      const filhos = renderFilhos((no as ElementNode).children);
      return <p className="font-corpo text-corpo text-grafite text-pretty">{filhos}</p>;
    }
    case "heading": {
      const tag = (no as ElementNode & { tag: string }).tag;
      const filhos = renderFilhos((no as ElementNode).children);
      if (tag === "h2") return <h2 className="font-titulo text-h2 text-oxford">{filhos}</h2>;
      if (tag === "h3") return <h3 className="font-titulo text-h3 text-oxford">{filhos}</h3>;
      if (tag === "h4") return <h4 className="font-titulo text-h4 text-oxford">{filhos}</h4>;
      return <>{filhos}</>;
    }
    case "list": {
      const listTag = (no as ElementNode & { tag: string; listType?: string }).tag;
      const filhos = renderFilhos((no as ElementNode).children);
      if (listTag === "ol")
        return <ol className="ml-6 list-decimal font-corpo text-corpo text-grafite space-y-2">{filhos}</ol>;
      return <ul className="ml-6 list-disc font-corpo text-corpo text-grafite space-y-2">{filhos}</ul>;
    }
    case "listitem": {
      const filhos = renderFilhos((no as ElementNode).children);
      return <li>{filhos}</li>;
    }
    case "link": {
      const link = no as LinkNode;
      const url = link.fields?.url ?? "#";
      const externo = link.fields?.newTab === true || link.fields?.linkType === "custom";
      const filhos = renderFilhos(link.children);
      return (
        <LinkEditorial href={url} externo={externo}>
          {filhos}
        </LinkEditorial>
      );
    }
    default:
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[RenderizadorLexical] node type não suportado: ${no.type}`);
      }
      return null;
  }
}

export function RenderizadorLexical({ content }: RenderizadorLexicalProps) {
  const filhos = renderFilhos(content.root.children as BaseNode[]);
  return <div className="prose-soberana flex flex-col gap-6">{filhos}</div>;
}
```

> **Nota:** o `LinkEditorial` é criado na Task 18. Esta dependência cruzada não bloqueia typecheck na criação do arquivo, mas o renderizador só compila depois que LinkEditorial existe. Implementer pode criar `LinkEditorial` antes do typecheck final desta task — alternativa: implementer cria stub vazio do LinkEditorial primeiro, ou roda esta task após Task 18.

**Decisão:** o implementer dispatcher (subagent-driven-development) deve executar Task 18 (LinkEditorial) **antes** desta Task 2.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros (após LinkEditorial existir).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/helpers/richtext/tipos.ts packages/ui/src/components/helpers/richtext/RenderizadorLexical.tsx
git commit -m "feat(ui): RenderizadorLexical mapeia nodes Lexical em JSX Soberano"
```

---

## Task 3: ImagemSoberana

**Files:**
- Create: `packages/ui/src/components/helpers/ImagemSoberana.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";

export type ProporcaoImagem = "1:1" | "4:3" | "3:2" | "16:9" | "20:23";

export interface ImagemSoberanaProps {
  src: string;
  alt: string;
  proporcao?: ProporcaoImagem;
  prioridade?: boolean;
  sizes?: string;
  className?: string;
}

const ASPECT: Record<ProporcaoImagem, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "20:23": "aspect-[20/23]",
};

export function ImagemSoberana({
  src,
  alt,
  proporcao = "16:9",
  prioridade = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
}: ImagemSoberanaProps) {
  const classes = ["relative w-full overflow-hidden bg-pergaminho", ASPECT[proporcao], className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <Image src={src} alt={alt} fill priority={prioridade} sizes={sizes} className="object-cover" />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

```bash
git add packages/ui/src/components/helpers/ImagemSoberana.tsx
git commit -m "feat(ui): ImagemSoberana wrapper de next/image com proporção"
```

---

## Task 4: JsonLd

**Files:**
- Create: `packages/ui/src/components/helpers/JsonLd.tsx`

- [ ] **Step 1: Implementar**

```tsx
export interface JsonLdProps {
  schema: object;
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // schema vem de páginas/blocos do projeto, fonte confiável
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/helpers/JsonLd.tsx
git commit -m "feat(ui): JsonLd para schema.org"
```

---

## Task 5: Revelar (client, prefers-reduced-motion)

**Files:**
- Create: `packages/ui/src/components/helpers/Revelar.tsx`

- [ ] **Step 1: Implementar**

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface RevelarProps {
  children: ReactNode;
  delay?: number;
}

export function Revelar({ children, delay = 0 }: RevelarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animar, setAnimar] = useState(false);
  const [revelado, setRevelado] = useState(true);

  useEffect(() => {
    const reduzMovimento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) return;

    setAnimar(true);
    setRevelado(false);

    const no = ref.current;
    if (!no) return;

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            const t = window.setTimeout(() => setRevelado(true), delay);
            obs.disconnect();
            return () => window.clearTimeout(t);
          }
        }
        return;
      },
      { threshold: 0.15 },
    );
    obs.observe(no);
    return () => obs.disconnect();
  }, [delay]);

  const classes = animar
    ? `transition-[opacity,transform] duration-[400ms] ease-out ${
        revelado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`
    : "";

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/helpers/Revelar.tsx
git commit -m "feat(ui): Revelar com IntersectionObserver e prefers-reduced-motion"
```

---

## Task 6: montaMetadataSoberana em @ntc/lib

**Files:**
- Create: `packages/lib/src/seo/montaMetadataSoberana.ts`
- Modify: `packages/lib/src/index.ts`

- [ ] **Step 1: Adicionar `next` como peerDep de @ntc/lib (caso ainda não tenha)**

Verifique `packages/lib/package.json`. Se não tiver `next` em peerDeps, adicione:

```json
"peerDependencies": {
  "next": "^15.0.0"
},
"devDependencies": {
  "next": "^15.0.0",
  "typescript": "^5.7.2"
}
```

Run: `pnpm install`

- [ ] **Step 2: Implementar helper**

`packages/lib/src/seo/montaMetadataSoberana.ts`:

```typescript
import type { Metadata } from "next";

export interface MetadataSoberanaInput {
  titulo: string;
  descricao: string;
  imagemOg?: string;
  tipo?: "website" | "article" | "event";
}

const DEFAULT_OG = "/og-default.jpg";
const SUFIXO_INSTITUCIONAL = "Grupo NTC";

export function montaMetadataSoberana(input: MetadataSoberanaInput): Metadata {
  const tituloCompleto = input.titulo.includes(SUFIXO_INSTITUCIONAL)
    ? input.titulo
    : `${input.titulo} — ${SUFIXO_INSTITUCIONAL}`;
  const imagem = input.imagemOg ?? DEFAULT_OG;
  const tipoOg = input.tipo === "event" ? "article" : (input.tipo ?? "website");

  return {
    title: tituloCompleto,
    description: input.descricao,
    openGraph: {
      title: tituloCompleto,
      description: input.descricao,
      type: tipoOg,
      images: [{ url: imagem }],
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: input.descricao,
      images: [imagem],
    },
  };
}
```

- [ ] **Step 3: Exportar de @ntc/lib**

`packages/lib/src/index.ts`:

```typescript
export {
  montaMetadataSoberana,
  type MetadataSoberanaInput,
} from "./seo/montaMetadataSoberana";
```

- [ ] **Step 4: Typecheck e commit**

```bash
pnpm typecheck
git add packages/lib/package.json packages/lib/src/seo/montaMetadataSoberana.ts packages/lib/src/index.ts pnpm-lock.yaml
git commit -m "feat(lib): montaMetadataSoberana com fallbacks editoriais"
```

---

## Task 7: BlocoNumeros

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoNumeros.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Container } from "../layout/Container";
import type { Area, FundoBloco } from "./tipos";
import { acentoPorArea, fundoPorTipo } from "./tipos";

export interface BlocoNumerosProps {
  titulo?: string;
  numeros: { valor: string; rotulo: string }[];
  fundo?: FundoBloco;
  vert?: Area;
}

export function BlocoNumeros({
  titulo,
  numeros,
  fundo = "osso",
  vert,
}: BlocoNumerosProps) {
  const classesFundo = fundoPorTipo(fundo);
  const acento = vert ? acentoPorArea(vert) : null;
  const numerosLimitados = numeros.slice(0, 4);
  const colunas =
    numerosLimitados.length === 1
      ? "grid-cols-1"
      : numerosLimitados.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : numerosLimitados.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <section className={`${classesFundo.fundo} ${classesFundo.texto} py-[var(--spacing-bloco-vertical)]`}>
      <Container variante="amplo">
        {titulo && (
          <h2 className={`font-titulo text-h2 ${fundo === "oxford" ? "text-osso" : "text-oxford"}`}>
            {titulo}
          </h2>
        )}
        <dl className={`mt-10 grid ${colunas} gap-10`}>
          {numerosLimitados.map((n) => (
            <div key={n.rotulo} className="flex flex-col">
              <dt
                className={`font-titulo font-medium leading-none ${
                  fundo === "oxford" ? "text-dourado" : acento ? acento.texto : "text-oxford"
                } text-[clamp(3rem,6vw,5rem)]`}
              >
                {n.valor}
              </dt>
              <dd
                className={`mt-3 font-corpo text-eyebrow uppercase tracking-[0.18em] ${classesFundo.textoSuave}`}
              >
                {n.rotulo}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoNumeros.tsx
git commit -m "feat(ui): BlocoNumeros (até 4 valores em Cormorant)"
```

---

## Task 8: BlocoCitacao

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoCitacao.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Container } from "../layout/Container";

export interface BlocoCitacaoProps {
  citacao: string;
  autoria: string;
  cargo?: string;
  variante?: "discreta" | "cerimonial";
}

export function BlocoCitacao({
  citacao,
  autoria,
  cargo,
  variante = "discreta",
}: BlocoCitacaoProps) {
  if (variante === "cerimonial") {
    return (
      <section className="bg-pergaminho py-[var(--spacing-secao-vertical)]">
        <Container variante="texto">
          <figure className="flex flex-col items-center text-center">
            <span aria-hidden className="block h-px w-16 bg-dourado" />
            <blockquote className="mt-8 font-titulo text-h2 italic text-balance text-oxford">
              <span aria-hidden>“</span>
              {citacao}
              <span aria-hidden>”</span>
            </blockquote>
            <figcaption className="mt-8 font-corpo">
              <span className="block font-titulo text-h4 text-oxford">{autoria}</span>
              {cargo && (
                <span className="mt-1 block text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
                  {cargo}
                </span>
              )}
            </figcaption>
          </figure>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="texto">
        <figure className="border-l-2 border-dourado pl-6">
          <blockquote className="font-titulo text-h3 italic text-grafite">
            {citacao}
          </blockquote>
          <figcaption className="mt-4 font-corpo text-pequeno">
            <span className="font-titulo text-corpo text-oxford">{autoria}</span>
            {cargo && (
              <span className="ml-2 uppercase tracking-[0.18em] text-grafite-suave">
                {cargo}
              </span>
            )}
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoCitacao.tsx
git commit -m "feat(ui): BlocoCitacao (variantes discreta e cerimonial)"
```

---

## Task 9: BlocoTexto

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoTexto.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Container } from "../layout/Container";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { RichTextContent } from "../helpers/richtext/tipos";

export interface BlocoTextoProps {
  titulo?: string;
  eyebrow?: string;
  corpo: RichTextContent;
  largura?: "editorial" | "texto";
}

export function BlocoTexto({
  titulo,
  eyebrow,
  corpo,
  largura = "texto",
}: BlocoTextoProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante={largura}>
        {eyebrow && (
          <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {eyebrow}
          </p>
        )}
        {titulo && (
          <h2 className={`font-titulo text-h2 text-balance text-oxford ${eyebrow ? "mt-4" : ""}`}>
            {titulo}
          </h2>
        )}
        <div className={titulo || eyebrow ? "mt-8" : ""}>
          <RenderizadorLexical content={corpo} />
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoTexto.tsx
git commit -m "feat(ui): BlocoTexto (wrapper de Rich Text)"
```

---

## Task 10: BlocoCtaInstitucional

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoCtaInstitucional.tsx`

- [ ] **Step 1: Implementar**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";

export type VarianteCta = "oxford" | "cardeal" | "oliva" | "neutro";

export interface BlocoCtaInstitucionalProps {
  titulo: string;
  descricao?: string;
  rotuloCta: string;
  linkCta: string;
  variante?: VarianteCta;
  imagem?: { src: string; alt: string };
}

const PALETA: Record<
  VarianteCta,
  { fundo: string; texto: string; textoSuave: string; botao: string; botaoHover: string }
> = {
  oxford: {
    fundo: "bg-oxford",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-dourado text-oxford",
    botaoHover: "hover:bg-osso",
  },
  cardeal: {
    fundo: "bg-cardeal",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-osso text-cardeal",
    botaoHover: "hover:bg-dourado hover:text-oxford",
  },
  oliva: {
    fundo: "bg-oliva",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-osso text-oliva",
    botaoHover: "hover:bg-dourado hover:text-oxford",
  },
  neutro: {
    fundo: "bg-pergaminho",
    texto: "text-oxford",
    textoSuave: "text-grafite",
    botao: "bg-oxford text-osso",
    botaoHover: "hover:bg-oxford-escuro",
  },
};

export function BlocoCtaInstitucional({
  titulo,
  descricao,
  rotuloCta,
  linkCta,
  variante = "oxford",
  imagem,
}: BlocoCtaInstitucionalProps) {
  const p = PALETA[variante];
  return (
    <section className={`${p.fundo} ${p.texto} py-[var(--spacing-secao-vertical)]`}>
      <Container variante="amplo">
        <div className={`grid gap-10 ${imagem ? "lg:grid-cols-[1.2fr_1fr] lg:items-center" : ""}`}>
          <div>
            <h2 className="font-titulo text-h2 text-balance">{titulo}</h2>
            {descricao && (
              <p className={`mt-6 max-w-[52ch] font-corpo text-corpo text-pretty ${p.textoSuave}`}>
                {descricao}
              </p>
            )}
            <Link
              href={linkCta as Route}
              className={`mt-10 inline-flex items-center px-7 py-3 font-corpo text-corpo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${p.botao} ${p.botaoHover}`}
            >
              {rotuloCta} →
            </Link>
          </div>
          {imagem && (
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={imagem.src}
                alt={imagem.alt}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoCtaInstitucional.tsx
git commit -m "feat(ui): BlocoCtaInstitucional (4 variantes cromáticas)"
```

---

## Task 11: BlocoImagemLegenda

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoImagemLegenda.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Container } from "../layout/Container";
import { ImagemSoberana, type ProporcaoImagem } from "../helpers/ImagemSoberana";

export interface BlocoImagemLegendaProps {
  imagem: { src: string; alt: string };
  legenda?: string;
  credito?: string;
  proporcao?: ProporcaoImagem;
  largura?: "editorial" | "amplo";
}

export function BlocoImagemLegenda({
  imagem,
  legenda,
  credito,
  proporcao = "16:9",
  largura = "editorial",
}: BlocoImagemLegendaProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante={largura}>
        <figure>
          <ImagemSoberana
            src={imagem.src}
            alt={imagem.alt}
            proporcao={proporcao}
            sizes="(min-width: 1024px) 80vw, 100vw"
          />
          {(legenda || credito) && (
            <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-l-2 border-linha-sutil pl-4 font-corpo">
              {legenda && (
                <span className="text-corpo text-grafite text-pretty">{legenda}</span>
              )}
              {credito && (
                <span className="text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {credito}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoImagemLegenda.tsx
git commit -m "feat(ui): BlocoImagemLegenda (5 proporções, com crédito)"
```

---

## Task 12: FaqAcordeao (client)

**Files:**
- Create: `packages/ui/src/components/blocos/FaqAcordeao.tsx`

- [ ] **Step 1: Implementar**

```tsx
"use client";

import { useId, useState, type ReactNode } from "react";

export interface FaqItem {
  pergunta: string;
  resposta: ReactNode;
}

export interface FaqAcordeaoProps {
  itens: FaqItem[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [aberto, setAberto] = useState<number | null>(null);
  const baseId = useId();

  return (
    <ul className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
      {itens.map((item, i) => {
        const expandido = aberto === i;
        const idBotao = `${baseId}-faq-botao-${i}`;
        const idPainel = `${baseId}-faq-painel-${i}`;
        return (
          <li key={item.pergunta}>
            <button
              id={idBotao}
              type="button"
              aria-expanded={expandido}
              aria-controls={idPainel}
              onClick={() => setAberto(expandido ? null : i)}
              className="flex w-full items-baseline justify-between gap-6 py-6 text-left font-titulo text-h4 text-oxford transition-colors hover:text-cardeal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
            >
              <span>{item.pergunta}</span>
              <span aria-hidden className="font-corpo text-h3 text-grafite-suave">
                {expandido ? "−" : "+"}
              </span>
            </button>
            <div
              id={idPainel}
              role="region"
              aria-labelledby={idBotao}
              hidden={!expandido}
              className="pb-6"
            >
              {item.resposta}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/FaqAcordeao.tsx
git commit -m "feat(ui): FaqAcordeao (client, teclado + aria-expanded)"
```

---

## Task 13: BlocoFaq (composição + JSON-LD)

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoFaq.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Container } from "../layout/Container";
import { JsonLd } from "../helpers/JsonLd";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { RichTextContent } from "../helpers/richtext/tipos";
import { FaqAcordeao } from "./FaqAcordeao";

export interface BlocoFaqProps {
  titulo?: string;
  itens: { pergunta: string; resposta: RichTextContent }[];
  variante?: "acordeao" | "expandido";
}

function textoPlainoDe(corpo: RichTextContent): string {
  const partes: string[] = [];
  const walk = (no: { type?: string; text?: string; children?: unknown }) => {
    if (no.type === "text" && typeof no.text === "string") {
      partes.push(no.text);
      return;
    }
    if (Array.isArray(no.children)) {
      for (const f of no.children) walk(f as { type?: string; text?: string; children?: unknown });
    }
  };
  walk(corpo.root as unknown as { type?: string; text?: string; children?: unknown });
  return partes.join(" ").trim();
}

export function BlocoFaq({ titulo, itens, variante = "acordeao" }: BlocoFaqProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: itens.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: textoPlainoDe(item.resposta),
      },
    })),
  };

  const itensRenderizados = itens.map((item) => ({
    pergunta: item.pergunta,
    resposta: <RenderizadorLexical content={item.resposta} />,
  }));

  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="editorial">
        {titulo && (
          <h2 className="font-titulo text-h2 text-balance text-oxford">{titulo}</h2>
        )}
        <div className={titulo ? "mt-10" : ""}>
          {variante === "acordeao" ? (
            <FaqAcordeao itens={itensRenderizados} />
          ) : (
            <dl className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
              {itens.map((item) => (
                <div key={item.pergunta} className="py-8">
                  <dt className="font-titulo text-h4 text-oxford">{item.pergunta}</dt>
                  <dd className="mt-4">
                    <RenderizadorLexical content={item.resposta} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
      <JsonLd schema={schema} />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoFaq.tsx
git commit -m "feat(ui): BlocoFaq com JSON-LD FAQPage e variantes acordeão/expandido"
```

---

## Task 14: BlocoProgramacao

**Files:**
- Create: `packages/ui/src/components/blocos/BlocoProgramacao.tsx`

- [ ] **Step 1: Implementar**

```tsx
import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";

export interface ItemProgramacao {
  horario: string;
  titulo: string;
  descricao?: string;
  palestrantes?: { nome: string; href?: string }[];
}

export interface BlocoProgramacaoProps {
  titulo?: string;
  itens: ItemProgramacao[];
}

export function BlocoProgramacao({ titulo, itens }: BlocoProgramacaoProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="editorial">
        {titulo && (
          <h2 className="font-titulo text-h2 text-balance text-oxford">{titulo}</h2>
        )}
        <ol className={`flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil ${titulo ? "mt-10" : ""}`}>
          {itens.map((item, i) => (
            <li key={`${item.horario}-${i}`} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-10">
              <p className="font-titulo text-h4 tabular-nums text-dourado">{item.horario}</p>
              <div>
                <h3 className="font-titulo text-h4 text-oxford">{item.titulo}</h3>
                {item.descricao && (
                  <p className="mt-2 font-corpo text-corpo text-grafite text-pretty">{item.descricao}</p>
                )}
                {item.palestrantes && item.palestrantes.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-corpo text-pequeno text-grafite-suave">
                    {item.palestrantes.map((p) =>
                      p.href ? (
                        <li key={p.nome}>
                          <Link
                            href={p.href as Route}
                            className="uppercase tracking-[0.18em] underline-offset-4 hover:text-oxford hover:underline"
                          >
                            {p.nome}
                          </Link>
                        </li>
                      ) : (
                        <li key={p.nome} className="uppercase tracking-[0.18em]">
                          {p.nome}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/blocos/BlocoProgramacao.tsx
git commit -m "feat(ui): BlocoProgramacao (timeline editorial de evento)"
```

---

## Task 15: Tipos de listings

**Files:**
- Create: `packages/ui/src/components/listings/tipos.ts`

- [ ] **Step 1: Implementar**

```typescript
import type { Area, Modalidade } from "../heroes/tipos";
import type { RichTextContent } from "../helpers/richtext/tipos";

export interface ProgramaItem {
  sigla: string;
  nomeCompleto: string;
  area: Area;
  resumoVisaoGeral?: string;
  imagem?: { src: string; alt: string };
  href: string;
  eyebrow?: string;
}

export interface EventoItem {
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

export interface EspecialistaItem {
  nome: string;
  titulacao: string;
  instituicao: string;
  cargoAtual?: string;
  foto: { src: string; alt: string };
  href?: string;
}

export interface ModuloItem {
  numero: number;
  titulo: string;
  ementa: RichTextContent;
  cargaHoraria?: string;
  eventosVinculados?: { nome: string; href: string }[];
}

export interface FiltroEstado {
  modalidade: "todos" | Modalidade;
  area: "todos" | Area;
  programa?: string;
  mes?: string;
}

export const FILTRO_INICIAL: FiltroEstado = {
  modalidade: "todos",
  area: "todos",
};
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/listings/tipos.ts
git commit -m "feat(ui): tipos de listings (ProgramaItem, EventoItem, FiltroEstado)"
```

---

## Task 16: GradeProgramas

**Files:**
- Create: `packages/ui/src/components/listings/GradeProgramas.tsx`

- [ ] **Step 1: Implementar**

```tsx
import { Grade } from "../layout/Grade";
import { CardPrograma } from "../cards/CardPrograma";
import { rotuloArea, type Area } from "../heroes/tipos";
import type { ProgramaItem } from "./tipos";

export interface GradeProgramasProps {
  programas: ProgramaItem[];
  agruparPorArea?: boolean;
  variante?: "editorial" | "compacto";
  filtroAtivo?: "todos" | Area;
}

const ORDEM_AREAS: Area[] = ["educacao", "gestao-publica", "saude"];

export function GradeProgramas({
  programas,
  agruparPorArea = true,
  variante = "editorial",
  filtroAtivo = "todos",
}: GradeProgramasProps) {
  const filtrados =
    filtroAtivo === "todos" ? programas : programas.filter((p) => p.area === filtroAtivo);

  if (!agruparPorArea) {
    return (
      <Grade colunas={3} gap="medio">
        {filtrados.map((p) => (
          <CardPrograma
            key={p.sigla}
            sigla={p.sigla}
            nomeCompleto={p.nomeCompleto}
            eyebrow={p.eyebrow}
            imagem={p.imagem}
            area={p.area}
            resumoVisaoGeral={p.resumoVisaoGeral}
            href={p.href}
            variante={variante}
          />
        ))}
      </Grade>
    );
  }

  const grupos = ORDEM_AREAS.map((area) => ({
    area,
    itens: filtrados.filter((p) => p.area === area),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="flex flex-col gap-16">
      {grupos.map((g) => (
        <section key={g.area}>
          <h3 className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
            {rotuloArea(g.area)}
          </h3>
          <Grade colunas={3} gap="medio" className="mt-6">
            {g.itens.map((p) => (
              <CardPrograma
                key={p.sigla}
                sigla={p.sigla}
                nomeCompleto={p.nomeCompleto}
                eyebrow={p.eyebrow}
                imagem={p.imagem}
                area={p.area}
                resumoVisaoGeral={p.resumoVisaoGeral}
                href={p.href}
                variante={variante}
              />
            ))}
          </Grade>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/listings/GradeProgramas.tsx
git commit -m "feat(ui): GradeProgramas (com agrupamento por área e filtro)"
```

---

## Task 17: GradeEventos, GradeEspecialistas, ListaModulos

**Files:**
- Create: `packages/ui/src/components/listings/GradeEventos.tsx`
- Create: `packages/ui/src/components/listings/GradeEspecialistas.tsx`
- Create: `packages/ui/src/components/listings/ListaModulos.tsx`

- [ ] **Step 1: GradeEventos**

```tsx
import { Grade } from "../layout/Grade";
import { CardEvento } from "../cards/CardEvento";
import { formatarData } from "../heroes/tipos";
import type { EventoItem } from "./tipos";
import type { ReactNode } from "react";

export interface GradeEventosProps {
  eventos: EventoItem[];
  agruparPorMes?: boolean;
  ordenacao?: "cronologica" | "destaque";
  vazio?: ReactNode;
}

function paraDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function chaveMes(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split("-");
  if (!ano || !mes) return chave;
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const fmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
  return fmt.format(data);
}

export function GradeEventos({
  eventos,
  agruparPorMes = true,
  ordenacao = "cronologica",
  vazio,
}: GradeEventosProps) {
  if (eventos.length === 0 && vazio) return <>{vazio}</>;

  const ordenados = [...eventos].sort((a, b) => {
    if (ordenacao === "destaque") {
      return (b.inscricaoAberta ? 1 : 0) - (a.inscricaoAberta ? 1 : 0);
    }
    return paraDate(a.dataInicio).getTime() - paraDate(b.dataInicio).getTime();
  });

  const cartao = (e: EventoItem) => (
    <CardEvento
      key={e.href}
      nome={e.nome}
      eyebrow={e.eyebrow}
      imagem={e.imagem}
      dataInicio={e.dataInicio}
      modalidade={e.modalidade}
      local={e.local}
      programa={e.programa}
      area={e.area}
      inscricaoAberta={e.inscricaoAberta}
      href={e.href}
    />
  );

  if (!agruparPorMes) {
    return (
      <Grade colunas={3} gap="medio">
        {ordenados.map(cartao)}
      </Grade>
    );
  }

  const grupos = new Map<string, EventoItem[]>();
  for (const e of ordenados) {
    const chave = chaveMes(paraDate(e.dataInicio));
    const lista = grupos.get(chave) ?? [];
    lista.push(e);
    grupos.set(chave, lista);
  }

  return (
    <div className="flex flex-col gap-16">
      {[...grupos.entries()].map(([chave, lista]) => (
        <section key={chave}>
          <h3 className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {rotuloMes(chave)}
          </h3>
          <Grade colunas={3} gap="medio" className="mt-6">
            {lista.map(cartao)}
          </Grade>
        </section>
      ))}
    </div>
  );
}

void formatarData; // referenciado caso seja necessário em iterações futuras
```

> A linha `void formatarData;` no fim é técnica para manter o import disponível sem warning de unused; remova se o linter reclamar e re-importe quando precisar.

> **Correção:** remova a linha `void formatarData;` E remova `formatarData` do import. O componente não usa.

- [ ] **Step 2: GradeEspecialistas**

```tsx
import { Grade } from "../layout/Grade";
import { CardEspecialista } from "../cards/CardEspecialista";
import { type Area } from "../heroes/tipos";
import type { EspecialistaItem } from "./tipos";

export interface GradeEspecialistasProps {
  especialistas: EspecialistaItem[];
  modo?: "regular" | "expandido" | "cerimonial";
  vert?: Area;
}

export function GradeEspecialistas({
  especialistas,
  modo = "regular",
}: GradeEspecialistasProps) {
  return (
    <Grade colunas={4} gap="medio">
      {especialistas.map((e) => (
        <CardEspecialista
          key={e.nome}
          nome={e.nome}
          titulacao={e.titulacao}
          instituicao={e.instituicao}
          cargoAtual={e.cargoAtual}
          foto={e.foto}
          href={e.href}
          variante={modo}
        />
      ))}
    </Grade>
  );
}
```

- [ ] **Step 3: ListaModulos**

```tsx
import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { ModuloItem } from "./tipos";

export interface ListaModulosProps {
  modulos: ModuloItem[];
  variante?: "completa" | "sumario";
}

export function ListaModulos({ modulos, variante = "completa" }: ListaModulosProps) {
  if (variante === "sumario") {
    return (
      <Container variante="editorial">
        <ol className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
          {modulos.map((m) => (
            <li key={m.numero} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <span className="font-titulo text-h3 tabular-nums text-dourado">
                M{String(m.numero).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-titulo text-h4 text-oxford">{m.titulo}</h3>
                {m.cargaHoraria && (
                  <p className="mt-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                    {m.cargaHoraria}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    );
  }

  return (
    <Container variante="editorial">
      <ol className="flex flex-col gap-12">
        {modulos.map((m) => (
          <li key={m.numero} className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
            <div className="sm:sticky sm:top-24 sm:self-start">
              <span className="font-titulo text-h2 tabular-nums text-dourado">
                M{String(m.numero).padStart(2, "0")}
              </span>
              {m.cargaHoraria && (
                <p className="mt-2 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {m.cargaHoraria}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-titulo text-h3 text-oxford">{m.titulo}</h3>
              <div className="mt-4">
                <RenderizadorLexical content={m.ementa} />
              </div>
              {m.eventosVinculados && m.eventosVinculados.length > 0 && (
                <div className="mt-6 border-l-2 border-linha-sutil pl-4">
                  <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                    Eventos vinculados
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 font-corpo text-corpo">
                    {m.eventosVinculados.map((ev) => (
                      <li key={ev.href}>
                        <Link
                          href={ev.href as Route}
                          className="text-oxford underline-offset-4 hover:underline"
                        >
                          {ev.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Container>
  );
}
```

- [ ] **Step 4: Typecheck e commits separados**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/listings/GradeEventos.tsx
git commit -m "feat(ui): GradeEventos (agrupamento por mês e ordenação)"
git add packages/ui/src/components/listings/GradeEspecialistas.tsx
git commit -m "feat(ui): GradeEspecialistas (3 modos, grade 4 colunas)"
git add packages/ui/src/components/listings/ListaModulos.tsx
git commit -m "feat(ui): ListaModulos (variantes completa e sumário)"
```

---

## Task 18: LinkEditorial (utilitário — deve preceder Task 2)

**Files:**
- Create: `packages/ui/src/components/utilitarios/LinkEditorial.tsx`

> **Ordem de execução:** esta task DEVE ser executada antes da Task 2 (RenderizadorLexical) porque o renderizador importa LinkEditorial.

- [ ] **Step 1: Implementar**

```tsx
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

export interface LinkEditorialProps {
  href: string;
  externo?: boolean;
  variante?: "padrao" | "inverso";
  children: ReactNode;
}

const PALETA: Record<NonNullable<LinkEditorialProps["variante"]>, string> = {
  padrao:
    "text-oxford decoration-dourado underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
  inverso:
    "text-osso decoration-dourado underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
};

export function LinkEditorial({
  href,
  externo = false,
  variante = "padrao",
  children,
}: LinkEditorialProps) {
  const classes = `inline underline transition-colors ${PALETA[variante]}`;
  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
        <span aria-hidden className="ml-1 text-pequeno">↗</span>
      </a>
    );
  }
  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/utilitarios/LinkEditorial.tsx
git commit -m "feat(ui): LinkEditorial com indicador externo e variantes"
```

---

## Task 19: Eyebrow, TituloSecao, Selo

**Files:**
- Create: `packages/ui/src/components/utilitarios/Eyebrow.tsx`
- Create: `packages/ui/src/components/utilitarios/TituloSecao.tsx`
- Create: `packages/ui/src/components/utilitarios/Selo.tsx`

- [ ] **Step 1: Eyebrow**

```tsx
import type { ReactNode } from "react";
import { acentoPorArea, type Area } from "../heroes/tipos";

export interface EyebrowProps {
  children: ReactNode;
  vert?: Area;
  variante?: "padrao" | "dourado";
}

export function Eyebrow({ children, vert, variante = "padrao" }: EyebrowProps) {
  const cor =
    variante === "dourado"
      ? "text-dourado"
      : vert
        ? acentoPorArea(vert).texto
        : "text-grafite-suave";
  return (
    <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${cor}`}>
      {children}
    </p>
  );
}
```

- [ ] **Step 2: TituloSecao**

```tsx
import { acentoPorArea, type Area } from "../heroes/tipos";

export interface TituloSecaoProps {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  alinhamento?: "esquerda" | "centro";
  vert?: Area;
}

export function TituloSecao({
  eyebrow,
  titulo,
  subtitulo,
  alinhamento = "esquerda",
  vert,
}: TituloSecaoProps) {
  const cor = vert ? acentoPorArea(vert).texto : "text-cardeal";
  const align = alinhamento === "centro" ? "text-center mx-auto" : "text-left";
  return (
    <header className={`max-w-[60ch] ${align}`}>
      {eyebrow && (
        <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${cor}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-titulo text-h2 text-balance text-oxford ${eyebrow ? "mt-3" : ""}`}>
        {titulo}
      </h2>
      {subtitulo && (
        <p className="mt-4 font-corpo text-corpo text-grafite-suave text-pretty">{subtitulo}</p>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Selo**

```tsx
import type { ReactNode } from "react";

export type VarianteSelo = "dourado" | "oxford" | "neutro" | "cardeal" | "oliva";

export interface SeloProps {
  variante: VarianteSelo;
  children: ReactNode;
  tamanho?: "pequeno" | "medio";
}

const PALETA: Record<VarianteSelo, string> = {
  dourado: "bg-dourado text-oxford",
  oxford: "bg-oxford text-osso",
  neutro: "bg-pergaminho text-grafite ring-1 ring-inset ring-linha-sutil",
  cardeal: "bg-cardeal text-osso",
  oliva: "bg-oliva text-osso",
};

const TAMANHO: Record<NonNullable<SeloProps["tamanho"]>, string> = {
  pequeno: "px-2.5 py-0.5 text-eyebrow",
  medio: "px-3 py-1 text-pequeno",
};

export function Selo({ variante, children, tamanho = "pequeno" }: SeloProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-corpo uppercase tracking-[0.18em] ${PALETA[variante]} ${TAMANHO[tamanho]}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Typecheck e commits**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/utilitarios/Eyebrow.tsx
git commit -m "feat(ui): Eyebrow tipográfico (padrão/dourado, com vert)"
git add packages/ui/src/components/utilitarios/TituloSecao.tsx
git commit -m "feat(ui): TituloSecao (header de seção editorial)"
git add packages/ui/src/components/utilitarios/Selo.tsx
git commit -m "feat(ui): Selo (pílula, 5 variantes cromáticas)"
```

---

## Task 20: FiltrosAgenda (client controlado)

**Files:**
- Create: `packages/ui/src/components/listings/FiltrosAgenda.tsx`

- [ ] **Step 1: Implementar**

```tsx
"use client";

import { useEffect, useId, useState } from "react";
import type { Area, Modalidade } from "../heroes/tipos";
import { rotuloArea, rotuloModalidade } from "../heroes/tipos";
import { FILTRO_INICIAL, type FiltroEstado } from "./tipos";

export interface FiltrosAgendaProps {
  programasDisponiveis: { sigla: string; nomeCompleto: string }[];
  estadoInicial?: Partial<FiltroEstado>;
  onChange: (filtros: FiltroEstado) => void;
}

const MODALIDADES: ("todos" | Modalidade)[] = ["todos", "online", "presencial", "hibrido"];
const AREAS: ("todos" | Area)[] = ["todos", "educacao", "gestao-publica", "saude"];

function rotuloModalidadeOuTodos(m: "todos" | Modalidade): string {
  return m === "todos" ? "Todas" : rotuloModalidade(m);
}

function rotuloAreaOuTodos(a: "todos" | Area): string {
  return a === "todos" ? "Todas as áreas" : rotuloArea(a);
}

export function FiltrosAgenda({
  programasDisponiveis,
  estadoInicial,
  onChange,
}: FiltrosAgendaProps) {
  const [estado, setEstado] = useState<FiltroEstado>({ ...FILTRO_INICIAL, ...estadoInicial });
  const baseId = useId();

  useEffect(() => {
    onChange(estado);
    // onChange é prop estável vinda do consumidor; deliberadamente fora das deps para evitar loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <form
      role="search"
      aria-label="Filtros da agenda"
      className="grid gap-6 border-y border-linha-sutil bg-osso py-8 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          Modalidade
        </legend>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => {
            const ativo = estado.modalidade === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={ativo}
                onClick={() => setEstado((s) => ({ ...s, modalidade: m }))}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${
                  ativo
                    ? "bg-oxford text-osso"
                    : "bg-pergaminho text-grafite hover:bg-linha-sutil"
                }`}
              >
                {rotuloModalidadeOuTodos(m)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          Área
        </legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => {
            const ativo = estado.area === a;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={ativo}
                onClick={() => setEstado((s) => ({ ...s, area: a }))}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${
                  ativo
                    ? "bg-oxford text-osso"
                    : "bg-pergaminho text-grafite hover:bg-linha-sutil"
                }`}
              >
                {rotuloAreaOuTodos(a)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor={`${baseId}-programa`}
          className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave"
        >
          Programa
        </label>
        <select
          id={`${baseId}-programa`}
          value={estado.programa ?? ""}
          onChange={(e) =>
            setEstado((s) => ({ ...s, programa: e.target.value === "" ? undefined : e.target.value }))
          }
          className="w-full border border-linha-sutil bg-osso px-3 py-2 font-corpo text-corpo text-grafite focus:border-oxford focus:outline-none"
        >
          <option value="">Todos os programas</option>
          {programasDisponiveis.map((p) => (
            <option key={p.sigla} value={p.sigla}>
              {p.sigla} — {p.nomeCompleto}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor={`${baseId}-mes`}
          className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave"
        >
          Mês
        </label>
        <input
          id={`${baseId}-mes`}
          type="month"
          value={estado.mes ?? ""}
          onChange={(e) =>
            setEstado((s) => ({ ...s, mes: e.target.value === "" ? undefined : e.target.value }))
          }
          className="w-full border border-linha-sutil bg-osso px-3 py-2 font-corpo text-corpo text-grafite focus:border-oxford focus:outline-none"
        />
      </fieldset>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/ui typecheck
git add packages/ui/src/components/listings/FiltrosAgenda.tsx
git commit -m "feat(ui): FiltrosAgenda controlado com modalidade/área/programa/mês"
```

---

## Task 21: Exportar tudo no @ntc/ui index

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Anexar exports**

Ao final de `packages/ui/src/index.ts` (mantendo tudo que já existe):

```typescript

// Blocos editoriais — doc 12 §7
export type { FundoBloco, ClassesFundo } from "./components/blocos/tipos";
export { fundoPorTipo } from "./components/blocos/tipos";

export { BlocoNumeros } from "./components/blocos/BlocoNumeros";
export type { BlocoNumerosProps } from "./components/blocos/BlocoNumeros";

export { BlocoCitacao } from "./components/blocos/BlocoCitacao";
export type { BlocoCitacaoProps } from "./components/blocos/BlocoCitacao";

export { BlocoTexto } from "./components/blocos/BlocoTexto";
export type { BlocoTextoProps } from "./components/blocos/BlocoTexto";

export { BlocoCtaInstitucional } from "./components/blocos/BlocoCtaInstitucional";
export type { BlocoCtaInstitucionalProps, VarianteCta } from "./components/blocos/BlocoCtaInstitucional";

export { BlocoImagemLegenda } from "./components/blocos/BlocoImagemLegenda";
export type { BlocoImagemLegendaProps } from "./components/blocos/BlocoImagemLegenda";

export { BlocoFaq } from "./components/blocos/BlocoFaq";
export type { BlocoFaqProps } from "./components/blocos/BlocoFaq";

export { FaqAcordeao } from "./components/blocos/FaqAcordeao";
export type { FaqAcordeaoProps, FaqItem } from "./components/blocos/FaqAcordeao";

export { BlocoProgramacao } from "./components/blocos/BlocoProgramacao";
export type { BlocoProgramacaoProps, ItemProgramacao } from "./components/blocos/BlocoProgramacao";

// Listings — doc 12 §8
export type {
  ProgramaItem,
  EventoItem,
  EspecialistaItem,
  ModuloItem,
  FiltroEstado,
} from "./components/listings/tipos";
export { FILTRO_INICIAL } from "./components/listings/tipos";

export { GradeProgramas } from "./components/listings/GradeProgramas";
export type { GradeProgramasProps } from "./components/listings/GradeProgramas";

export { GradeEventos } from "./components/listings/GradeEventos";
export type { GradeEventosProps } from "./components/listings/GradeEventos";

export { GradeEspecialistas } from "./components/listings/GradeEspecialistas";
export type { GradeEspecialistasProps } from "./components/listings/GradeEspecialistas";

export { ListaModulos } from "./components/listings/ListaModulos";
export type { ListaModulosProps } from "./components/listings/ListaModulos";

export { FiltrosAgenda } from "./components/listings/FiltrosAgenda";
export type { FiltrosAgendaProps } from "./components/listings/FiltrosAgenda";

// Utilitários — doc 12 §10
export { Eyebrow } from "./components/utilitarios/Eyebrow";
export type { EyebrowProps } from "./components/utilitarios/Eyebrow";

export { TituloSecao } from "./components/utilitarios/TituloSecao";
export type { TituloSecaoProps } from "./components/utilitarios/TituloSecao";

export { LinkEditorial } from "./components/utilitarios/LinkEditorial";
export type { LinkEditorialProps } from "./components/utilitarios/LinkEditorial";

export { Selo } from "./components/utilitarios/Selo";
export type { SeloProps, VarianteSelo } from "./components/utilitarios/Selo";

// Helpers sistêmicos — doc 12 §12
export { ImagemSoberana } from "./components/helpers/ImagemSoberana";
export type { ImagemSoberanaProps, ProporcaoImagem } from "./components/helpers/ImagemSoberana";

export { JsonLd } from "./components/helpers/JsonLd";
export type { JsonLdProps } from "./components/helpers/JsonLd";

export { Revelar } from "./components/helpers/Revelar";
export type { RevelarProps } from "./components/helpers/Revelar";

export { RenderizadorLexical } from "./components/helpers/richtext/RenderizadorLexical";
export type { RenderizadorLexicalProps } from "./components/helpers/richtext/RenderizadorLexical";
export type { RichTextContent, LexicalNode } from "./components/helpers/richtext/tipos";
```

- [ ] **Step 2: Typecheck completo do monorepo**

Run: `pnpm typecheck`
Expected: 5/5 pacotes ok.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): exporta blocos, listings, utilitários e helpers"
```

---

## Task 22: Mock Lexical para showcase

**Files:**
- Create: `apps/web/app/design-system/_mocks/lexical.ts`

- [ ] **Step 1: Criar documento Lexical realista**

```typescript
import type { RichTextContent } from "@ntc/ui";

export const LEXICAL_DEMO: RichTextContent = {
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            version: 1,
            text: "O Grupo NTC opera em ",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
          {
            type: "text",
            version: 1,
            text: "três verticais",
            format: 1,
            detail: 0,
            mode: "normal",
            style: "",
          },
          {
            type: "text",
            version: 1,
            text: " — Educação, Gestão Pública e Saúde — com método editorial e currículos próprios.",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
      {
        type: "heading",
        version: 1,
        tag: "h3",
        direction: "ltr",
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            version: 1,
            text: "Princípios editoriais",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
      {
        type: "list",
        version: 1,
        tag: "ul",
        listType: "bullet",
        start: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [
          {
            type: "listitem",
            version: 1,
            value: 1,
            direction: "ltr",
            format: "",
            indent: 0,
            children: [
              {
                type: "text",
                version: 1,
                text: "Currículos derivados de governança real, não de modismo.",
                format: 0,
                detail: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
          {
            type: "listitem",
            version: 1,
            value: 2,
            direction: "ltr",
            format: "",
            indent: 0,
            children: [
              {
                type: "text",
                version: 1,
                text: "Corpo docente sênior com experiência operacional pública.",
                format: 0,
                detail: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            version: 1,
            text: "Saiba mais sobre o método em ",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
          {
            type: "link",
            version: 1,
            fields: { url: "/o-grupo", linkType: "custom", newTab: false },
            direction: "ltr",
            format: "",
            indent: 0,
            children: [
              {
                type: "text",
                version: 1,
                text: "nossa página institucional",
                format: 0,
                detail: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
          {
            type: "text",
            version: 1,
            text: ".",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
} as RichTextContent;
```

> **Atenção:** se `RichTextContent` (vindo de `Area["posicionamento"]`) tiver shape diferente ao typecheck, **ajuste o objeto** para casar com a estrutura real. O type assertion `as RichTextContent` no fim absorve pequenas divergências de tipos auxiliares.

- [ ] **Step 2: Typecheck e commit**

```bash
pnpm --filter @ntc/web typecheck
git add apps/web/app/design-system/_mocks/lexical.ts
git commit -m "chore(design-system): mock Lexical para showcase de Rich Text"
```

---

## Task 23: Mover heroes-e-cards para subrota

**Files:**
- Create: `apps/web/app/design-system/heroes-e-cards/page.tsx`
- Modify: `apps/web/app/design-system/page.tsx` (será reescrito na Task 28)

- [ ] **Step 1: Mover conteúdo**

Copie o conteúdo atual de `apps/web/app/design-system/page.tsx` para `apps/web/app/design-system/heroes-e-cards/page.tsx`. Mantenha o `Metadata`, mas atualize:
- `title: "Heroes e Cards — Design System"`
- O `Breadcrumbs` deve apontar `/design-system` como pai.

Mudanças no conteúdo movido:
- `{ rotulo: "Design System", href: "/design-system" }` → mantém
- `{ rotulo: "Heroes e Cards" }` → último item sem `href`

> Deixe `apps/web/app/design-system/page.tsx` intacta por ora — a Task 28 a reescreve.

- [ ] **Step 2: Typecheck, build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/heroes-e-cards/page.tsx
git commit -m "feat(design-system): move heroes e cards para /design-system/heroes-e-cards"
```

---

## Task 24: Página de blocos

**Files:**
- Create: `apps/web/app/design-system/blocos/page.tsx`

- [ ] **Step 1: Implementar showcase**

```tsx
import type { Metadata } from "next";
import type { Route } from "next";

import {
  BlocoCitacao,
  BlocoCtaInstitucional,
  BlocoFaq,
  BlocoImagemLegenda,
  BlocoNumeros,
  BlocoProgramacao,
  BlocoTexto,
  Breadcrumbs,
  Container,
  Secao,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

export const metadata: Metadata = {
  title: "Blocos editoriais — Design System",
  robots: { index: false, follow: false },
};

const IMG = {
  cta: "https://picsum.photos/seed/ntc-bloco-cta/1200/900",
  legenda: "https://picsum.photos/seed/ntc-bloco-legenda/1600/900",
};

const r = (p: string): Route => p as Route;

export default function PaginaBlocos() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Blocos editoriais" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="compacto">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Blocos editoriais</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §7 do Inventário. Unidades composíveis dentro de páginas. Aceitam tema cromático
            via vert.
          </p>
        </Container>
      </Secao>

      <BlocoNumeros
        titulo="Impacto institucional 2025"
        numeros={[
          { valor: "27", rotulo: "Estados atendidos" },
          { valor: "180+", rotulo: "Municípios" },
          { valor: "12.4k", rotulo: "Profissionais formados" },
          { valor: "98%", rotulo: "Aprovação" },
        ]}
        fundo="oxford"
      />

      <BlocoCitacao
        citacao="A inteligência institucional não nasce de planilhas — nasce de quadros públicos que sabem ler o seu tempo."
        autoria="Prof. Dr. João Soares"
        cargo="Diretor editorial, NTC Gestão Pública"
        variante="cerimonial"
      />

      <BlocoCitacao
        citacao="O método NTC junta governança e pedagogia num lugar só."
        autoria="Profa. Dra. Maria Andrade"
        cargo="USP · NTC Educação"
        variante="discreta"
      />

      <BlocoTexto
        eyebrow="Posicionamento institucional"
        titulo="O método Soberano"
        corpo={LEXICAL_DEMO}
      />

      <BlocoCtaInstitucional
        variante="oxford"
        titulo="Pronto para começar uma conversa?"
        descricao="Equipes públicas que buscam formação editorial de alto nível encontram no Grupo NTC um parceiro de longo prazo."
        rotuloCta="Solicitar proposta"
        linkCta={r("/contato")}
        imagem={{ src: IMG.cta, alt: "Cenário institucional" }}
      />

      <BlocoCtaInstitucional
        variante="cardeal"
        titulo="Variante cardeal"
        descricao="Para chamadas de Gestão Pública com tom mais grave."
        rotuloCta="Conhecer LIDERA"
        linkCta={r("/programas/lidera")}
      />

      <BlocoCtaInstitucional
        variante="oliva"
        titulo="Variante oliva"
        descricao="Para chamadas de Saúde."
        rotuloCta="Conhecer PROSUS+"
        linkCta={r("/programas/prosus")}
      />

      <BlocoCtaInstitucional
        variante="neutro"
        titulo="Variante neutra"
        descricao="Sobre Pergaminho — para CTAs internos ou de conteúdo."
        rotuloCta="Ler artigos"
        linkCta={r("/conteudos")}
      />

      <BlocoImagemLegenda
        imagem={{ src: IMG.legenda, alt: "Auditório institucional" }}
        legenda="Encontro nacional de gestores em Brasília, 2025."
        credito="Foto: Acervo Instituto NTC"
        proporcao="16:9"
      />

      <BlocoFaq
        titulo="Perguntas frequentes"
        itens={[
          { pergunta: "Como contratar um programa?", resposta: LEXICAL_DEMO },
          { pergunta: "Quem é o público-alvo?", resposta: LEXICAL_DEMO },
          { pergunta: "Há certificação?", resposta: LEXICAL_DEMO },
        ]}
        variante="acordeao"
      />

      <BlocoProgramacao
        titulo="Programação · dia 12 de agosto"
        itens={[
          {
            horario: "09:00",
            titulo: "Abertura institucional",
            descricao: "Boas-vindas e contexto da edição 2026.",
            palestrantes: [{ nome: "Profa. Helena Lima", href: r("/corpo-docente/helena-lima") }],
          },
          {
            horario: "10:30",
            titulo: "Painel 1 · Governança no SUS",
            descricao: "Atenção primária, regionalização e contratualização.",
            palestrantes: [
              { nome: "Prof. João Soares" },
              { nome: "Profa. Helena Lima", href: r("/corpo-docente/helena-lima") },
            ],
          },
          { horario: "14:00", titulo: "Estudo de caso · Pernambuco" },
        ]}
      />
    </main>
  );
}
```

- [ ] **Step 2: Typecheck, build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/blocos/page.tsx
git commit -m "feat(design-system): showcase de blocos editoriais"
```

---

## Task 25: Página de listings

**Files:**
- Create: `apps/web/app/design-system/listings/page.tsx`

- [ ] **Step 1: Implementar showcase**

```tsx
"use client";

import { useState } from "react";
import type { Route } from "next";

import {
  Breadcrumbs,
  Container,
  FILTRO_INICIAL,
  FiltrosAgenda,
  GradeEspecialistas,
  GradeEventos,
  GradeProgramas,
  ListaModulos,
  Secao,
  type FiltroEstado,
  type EspecialistaItem,
  type EventoItem,
  type ProgramaItem,
  type ModuloItem,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

const r = (p: string): Route => p as Route;

const IMG = {
  prog1: "https://picsum.photos/seed/ntc-prog-edutec/1200/900",
  prog2: "https://picsum.photos/seed/ntc-prog-lidera/1200/900",
  prog3: "https://picsum.photos/seed/ntc-prog-prosus/1200/900",
  evento1: "https://picsum.photos/seed/ntc-ev-prosus/1600/1000",
  evento2: "https://picsum.photos/seed/ntc-ev-edutec/1600/1000",
  evento3: "https://picsum.photos/seed/ntc-ev-lidera/1600/1000",
  pessoa1: "https://picsum.photos/seed/ntc-p-1/600/690",
  pessoa2: "https://picsum.photos/seed/ntc-p-2/600/690",
  pessoa3: "https://picsum.photos/seed/ntc-p-3/600/690",
  pessoa4: "https://picsum.photos/seed/ntc-p-4/600/690",
};

const PROGRAMAS: ProgramaItem[] = [
  {
    sigla: "EDUTEC",
    nomeCompleto: "Educação Digital de Alta Performance",
    area: "educacao",
    resumoVisaoGeral: "Tecnologia aplicada ao currículo da rede pública.",
    imagem: { src: IMG.prog1, alt: "EDUTEC" },
    href: r("/programas/edutec"),
    eyebrow: "Programa NTC Educação",
  },
  {
    sigla: "PEAR",
    nomeCompleto: "Alfabetização de Alta Performance",
    area: "educacao",
    resumoVisaoGeral: "Método estruturado de alfabetização para os anos iniciais.",
    imagem: { src: IMG.prog1, alt: "PEAR" },
    href: r("/programas/pear"),
  },
  {
    sigla: "LIDERA",
    nomeCompleto: "Direção Estratégica no Setor Público",
    area: "gestao-publica",
    resumoVisaoGeral: "Formação de direção para gestores em transição.",
    imagem: { src: IMG.prog2, alt: "LIDERA" },
    href: r("/programas/lidera"),
  },
  {
    sigla: "PROSUS+",
    nomeCompleto: "Governança no SUS",
    area: "saude",
    resumoVisaoGeral: "Atenção primária, regionalização e contratualização.",
    imagem: { src: IMG.prog3, alt: "PROSUS+" },
    href: r("/programas/prosus"),
  },
];

const EVENTOS: EventoItem[] = [
  {
    nome: "Encontro PROSUS+ Brasília 2026",
    eyebrow: "Programa PROSUS+",
    imagem: { src: IMG.evento1, alt: "Auditório" },
    dataInicio: "2026-08-12",
    modalidade: "presencial",
    local: { cidade: "Brasília", estado: "DF" },
    programa: { sigla: "PROSUS+" },
    area: "saude",
    inscricaoAberta: true,
    href: r("/eventos/prosus-brasilia-2026"),
  },
  {
    nome: "EDUTEC · Módulo 1 Online",
    imagem: { src: IMG.evento2, alt: "Aula online" },
    dataInicio: "2026-03-08",
    modalidade: "online",
    programa: { sigla: "EDUTEC" },
    area: "educacao",
    inscricaoAberta: false,
    href: r("/eventos/edutec-m01"),
  },
  {
    nome: "LIDERA · Imersão Recife",
    imagem: { src: IMG.evento3, alt: "Encontro presencial" },
    dataInicio: "2026-09-22",
    modalidade: "hibrido",
    local: { cidade: "Recife", estado: "PE" },
    programa: { sigla: "LIDERA" },
    area: "gestao-publica",
    inscricaoAberta: true,
    href: r("/eventos/lidera-recife"),
  },
];

const ESPECIALISTAS: EspecialistaItem[] = [
  {
    nome: "Profa. Dra. Maria Andrade",
    titulacao: "PhD em Educação",
    instituicao: "USP · NTC Educação",
    foto: { src: IMG.pessoa1, alt: "Retrato editorial" },
    href: r("/corpo-docente/maria-andrade"),
  },
  {
    nome: "Prof. Dr. João Soares",
    titulacao: "Doutor em Administração Pública",
    instituicao: "FGV · NTC Gestão Pública",
    cargoAtual: "Diretor editorial",
    foto: { src: IMG.pessoa2, alt: "Retrato editorial" },
    href: r("/corpo-docente/joao-soares"),
  },
  {
    nome: "Profa. Dra. Helena Lima",
    titulacao: "PhD em Saúde Coletiva",
    instituicao: "Fiocruz · NTC Saúde",
    foto: { src: IMG.pessoa3, alt: "Retrato editorial" },
    href: r("/corpo-docente/helena-lima"),
  },
  {
    nome: "Prof. Carlos Mendes",
    titulacao: "Mestre em Políticas Públicas",
    instituicao: "ENAP",
    foto: { src: IMG.pessoa4, alt: "Retrato editorial" },
  },
];

const MODULOS: ModuloItem[] = [
  { numero: 1, titulo: "Fundamentos", ementa: LEXICAL_DEMO, cargaHoraria: "30h" },
  { numero: 2, titulo: "Métodos", ementa: LEXICAL_DEMO, cargaHoraria: "30h" },
  {
    numero: 3,
    titulo: "Aplicação em rede",
    ementa: LEXICAL_DEMO,
    cargaHoraria: "60h",
    eventosVinculados: [{ nome: "Imersão Recife", href: r("/eventos/lidera-recife") }],
  },
];

export default function PaginaListings() {
  const [filtros, setFiltros] = useState<FiltroEstado>(FILTRO_INICIAL);

  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Listings e grids" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="compacto">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Listings e grids</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §8 do Inventário. Composições de cards para Programas, Eventos, Especialistas
            e Módulos, mais o painel de filtros da Agenda.
          </p>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeProgramas (agrupada por área)</h2>
          <div className="mt-10">
            <GradeProgramas programas={PROGRAMAS} agruparPorArea variante="editorial" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeEventos (agrupada por mês)</h2>
          <div className="mt-10">
            <GradeEventos eventos={EVENTOS} agruparPorMes ordenacao="cronologica" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">GradeEspecialistas (modo expandido)</h2>
          <div className="mt-10">
            <GradeEspecialistas especialistas={ESPECIALISTAS} modo="expandido" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">ListaModulos (variante completa)</h2>
          <div className="mt-10">
            <ListaModulos modulos={MODULOS} variante="completa" />
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h2 text-oxford">FiltrosAgenda (controlado)</h2>
          <div className="mt-10">
            <FiltrosAgenda
              programasDisponiveis={[
                { sigla: "EDUTEC", nomeCompleto: "Educação Digital" },
                { sigla: "LIDERA", nomeCompleto: "Direção Estratégica" },
                { sigla: "PROSUS+", nomeCompleto: "Governança no SUS" },
              ]}
              onChange={setFiltros}
            />
          </div>
          <pre className="mt-6 overflow-x-auto bg-pergaminho p-4 font-corpo text-pequeno text-grafite">
            {JSON.stringify(filtros, null, 2)}
          </pre>
        </Container>
      </Secao>
    </main>
  );
}
```

> **Nota:** página inteira é `"use client"` por causa do `useState` para mostrar o estado dos filtros. Os componentes RSC dentro dela continuam funcionando — `"use client"` é "boundary entry", não corrompe nada.

- [ ] **Step 2: Build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/listings/page.tsx
git commit -m "feat(design-system): showcase de listings com FiltrosAgenda interativo"
```

---

## Task 26: Página de utilitários

**Files:**
- Create: `apps/web/app/design-system/utilitarios/page.tsx`

- [ ] **Step 1: Implementar**

```tsx
import type { Metadata } from "next";

import {
  Breadcrumbs,
  Container,
  Eyebrow,
  LinkEditorial,
  Secao,
  Selo,
  TituloSecao,
} from "@ntc/ui";

export const metadata: Metadata = {
  title: "Utilitários — Design System",
  robots: { index: false, follow: false },
};

export default function PaginaUtilitarios() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Utilitários" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Utilitários tipográficos</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §10 do Inventário. Eyebrow, TituloSecao, LinkEditorial, Selo.
          </p>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">Eyebrow</h2>
          <div className="mt-6 flex flex-col gap-4">
            <Eyebrow>Padrão · cinza editorial</Eyebrow>
            <Eyebrow variante="dourado">Variante dourada</Eyebrow>
            <Eyebrow vert="educacao">Vert · Educação (Oxford)</Eyebrow>
            <Eyebrow vert="gestao-publica">Vert · Gestão Pública (Cardeal)</Eyebrow>
            <Eyebrow vert="saude">Vert · Saúde (Oliva)</Eyebrow>
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">TituloSecao</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <TituloSecao
              eyebrow="Esquerda · padrão"
              titulo="Inteligência institucional"
              subtitulo="Subtítulo opcional em corpo editorial, no máximo 60 caracteres por linha."
            />
            <TituloSecao
              eyebrow="Centro · Saúde"
              titulo="Governança no SUS"
              subtitulo="Subtítulo alinhado ao centro."
              alinhamento="centro"
              vert="saude"
            />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">LinkEditorial</h2>
          <div className="mt-6 flex flex-col gap-3 font-corpo text-corpo text-grafite">
            <p>
              Link interno padrão:{" "}
              <LinkEditorial href="/o-grupo">Conheça o Grupo NTC</LinkEditorial>.
            </p>
            <p>
              Link externo:{" "}
              <LinkEditorial href="https://www.gov.br" externo>
                Portal Gov.br
              </LinkEditorial>
              .
            </p>
          </div>
          <div className="mt-10 bg-oxford p-8">
            <p className="font-corpo text-corpo text-osso">
              Link inverso sobre fundo Oxford:{" "}
              <LinkEditorial href="/o-grupo" variante="inverso">
                Conheça o Grupo NTC
              </LinkEditorial>
              .
            </p>
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">Selo</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Pílulas para tags, modalidades, status.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Selo variante="dourado">Dourado</Selo>
            <Selo variante="oxford">Oxford</Selo>
            <Selo variante="cardeal">Cardeal</Selo>
            <Selo variante="oliva">Oliva</Selo>
            <Selo variante="neutro">Neutro</Selo>
            <Selo variante="oxford" tamanho="medio">
              Tamanho médio
            </Selo>
          </div>
        </Container>
      </Secao>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck, build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/utilitarios/page.tsx
git commit -m "feat(design-system): showcase de utilitários (Eyebrow, TituloSecao, LinkEditorial, Selo)"
```

---

## Task 27: Página de helpers

**Files:**
- Create: `apps/web/app/design-system/helpers/page.tsx`

- [ ] **Step 1: Implementar**

```tsx
import type { Metadata } from "next";

import {
  Breadcrumbs,
  Container,
  ImagemSoberana,
  JsonLd,
  Revelar,
  RenderizadorLexical,
  Secao,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

export const metadata: Metadata = {
  title: "Helpers — Design System",
  robots: { index: false, follow: false },
};

const IMG = "https://picsum.photos/seed/ntc-helper-img/1600/1000";

const SCHEMA_EXEMPLO = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Instituto NTC do Brasil",
  url: "https://gruponctc.org.br",
};

export default function PaginaHelpers() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Helpers" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Helpers sistêmicos</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §12 do Inventário. ImagemSoberana, JsonLd, Revelar, RenderizadorLexical.
          </p>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">ImagemSoberana — 5 proporções</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {(["1:1", "4:3", "3:2", "16:9", "20:23"] as const).map((p) => (
              <div key={p}>
                <ImagemSoberana
                  src={IMG}
                  alt={`Proporção ${p}`}
                  proporcao={p}
                  sizes="(min-width: 1024px) 18vw, 50vw"
                />
                <p className="mt-2 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {p}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">RenderizadorLexical</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Documento Lexical realista renderizado em JSX Soberano.
          </p>
          <div className="mt-8 border-t border-linha-sutil pt-8">
            <RenderizadorLexical content={LEXICAL_DEMO} />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">Revelar — role para ativar</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Os blocos abaixo entram com fade-in + slide-up de 400ms quando entram na viewport
            (respeita prefers-reduced-motion).
          </p>
          <div className="mt-12 flex flex-col gap-12">
            {[0, 100, 200, 300].map((d) => (
              <Revelar key={d} delay={d}>
                <div className="border border-linha-sutil bg-osso p-8">
                  <p className="font-titulo text-h3 text-oxford">Bloco com delay {d}ms</p>
                  <p className="mt-2 font-corpo text-corpo text-grafite">
                    Entrei na viewport e o IntersectionObserver disparou.
                  </p>
                </div>
              </Revelar>
            ))}
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">JsonLd</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Injeta &lt;script type="application/ld+json"&gt; com o schema abaixo. Inspecione
            o HTML para conferir.
          </p>
          <pre className="mt-6 overflow-x-auto bg-pergaminho p-4 font-corpo text-pequeno text-grafite">
            {JSON.stringify(SCHEMA_EXEMPLO, null, 2)}
          </pre>
          <JsonLd schema={SCHEMA_EXEMPLO} />
        </Container>
      </Secao>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck, build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/helpers/page.tsx
git commit -m "feat(design-system): showcase de helpers (ImagemSoberana, Revelar, RenderizadorLexical, JsonLd)"
```

---

## Task 28: Índice navegável de /design-system

**Files:**
- Modify: `apps/web/app/design-system/page.tsx`

- [ ] **Step 1: Reescrever página índice**

Conteúdo final (substitui tudo o que estava lá):

```tsx
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import {
  Container,
  type ItemMenu,
  NavegacaoSoberana,
  Secao,
} from "@ntc/ui";

export const metadata: Metadata = {
  title: "Design System — sandbox interno",
  robots: { index: false, follow: false },
};

const ROTAS: ItemMenu[] = [
  { rotulo: "Grupo NTC", href: "/grupo" },
  {
    rotulo: "Programas",
    filhos: [
      { rotulo: "EDUTEC", href: "/programas/edutec", descricao: "Educação Digital" },
      { rotulo: "PEAR", href: "/programas/pear", descricao: "Alfabetização" },
      { rotulo: "PROSUS+", href: "/programas/prosus", descricao: "Governança no SUS" },
    ],
  },
  {
    rotulo: "Capacitação",
    filhos: [
      { rotulo: "Agenda Geral NTC", href: "/capacitacao", descricao: "Eventos abertos" },
      { rotulo: "EventOn", href: "/eventon", descricao: "Plataforma de acesso e replay" },
    ],
  },
  {
    rotulo: "Soluções",
    filhos: [
      { rotulo: "NTC Educação", href: "/educacao", descricao: "Redes públicas de ensino" },
      { rotulo: "NTC Gestão Pública", href: "/gestao-publica", descricao: "Administração" },
      { rotulo: "NTC Saúde", href: "/saude", descricao: "SUS" },
    ],
  },
  { rotulo: "Conteúdos", href: "/conteudos" },
  { rotulo: "Contato", href: "/contato" },
];

const SECOES: { slug: string; titulo: string; descricao: string }[] = [
  {
    slug: "heroes-e-cards",
    titulo: "Heroes e Cards",
    descricao:
      "5 famílias de Hero (institucional, área, programa, evento, conteúdo) e 5 famílias de Card. §5 e §6 do Inventário.",
  },
  {
    slug: "blocos",
    titulo: "Blocos editoriais",
    descricao:
      "Unidades composíveis dentro de páginas — números, citações, texto Lexical, CTAs cromáticos, imagem com legenda, FAQ, programação. §7.",
  },
  {
    slug: "listings",
    titulo: "Listings e grids",
    descricao:
      "GradeProgramas, GradeEventos, GradeEspecialistas, ListaModulos e FiltrosAgenda. §8.",
  },
  {
    slug: "utilitarios",
    titulo: "Utilitários tipográficos",
    descricao:
      "Eyebrow, TituloSecao, LinkEditorial e Selo. §10.",
  },
  {
    slug: "helpers",
    titulo: "Helpers sistêmicos",
    descricao:
      "ImagemSoberana, JsonLd, Revelar, RenderizadorLexical. §12.",
  },
];

export default function DesignSystemIndex() {
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS}
        ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato" }}
        ctaSecundario={{ rotulo: "Área do Participante", href: "/eventon/area" }}
      />

      <main id="conteudo">
        <Secao fundo="osso" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
              Sandbox interna · não-listada no sitemap
            </p>
            <h1 className="mt-4 font-titulo text-h1 text-balance text-oxford">
              Design System <em className="text-cardeal">Soberana 2026</em>
            </h1>
            <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
              Catálogo navegável dos componentes do `@ntc/ui`. Cada categoria abre uma
              página com amostras, variantes e dados mock para validação visual.
            </p>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SECOES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/design-system/${s.slug}` as Route}
                    className="group flex h-full flex-col border border-linha-sutil bg-osso p-8 transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    <h2 className="font-titulo text-h3 text-oxford">{s.titulo}</h2>
                    <p className="mt-3 font-corpo text-corpo text-grafite text-pretty">
                      {s.descricao}
                    </p>
                    <span className="mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
                      Abrir →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Secao>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Typecheck, build e commit**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
git add apps/web/app/design-system/page.tsx
git commit -m "feat(design-system): /design-system vira índice navegável"
```

---

## Task 29: Lint + typecheck + build final

**Files:** nenhum

- [ ] **Step 1: Rodar checks completos**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: tudo passa. Warnings pré-existentes em `apps/cms` sobre `<img>` em `IconNTC.tsx`/`LogoNTC.tsx` são esperados — não introduzir novos.

- [ ] **Step 2: Se houver falhas, corrigir e re-commitar**

Não criar commit de "fix" se não houver erros novos. Se houver, criar commit isolado por arquivo afetado, prefixo `fix(ui)`/`fix(design-system)`.

---

## Task 30: Checkpoint visual + handoff

**Files:** nenhum

- [ ] **Step 1: Subir dev server**

Run: `pnpm dev:web` (background)
Expected: http://localhost:3000

- [ ] **Step 2: Validar visualmente**

Abrir e conferir:
- http://localhost:3000/design-system — índice com 5 cards-link
- http://localhost:3000/design-system/heroes-e-cards — conteúdo movido, igual à sessão 7
- http://localhost:3000/design-system/blocos — 7 blocos com variantes
- http://localhost:3000/design-system/listings — listings + FiltrosAgenda com JSON ao vivo
- http://localhost:3000/design-system/utilitarios — 4 utilitários com variantes
- http://localhost:3000/design-system/helpers — 5 proporções de imagem, Lexical render, Revelar ativando ao rolar, JsonLd no HTML

- [ ] **Step 3: Aguardar aprovação humana**

Não prosseguir antes de confirmação verbal/textual.

- [ ] **Step 4: Encerrar dev server após aprovação**

---

## Self-review

### Spec coverage

- [x] §7.1 BlocoNumeros → Task 7
- [x] §7.2 BlocoCitacao → Task 8
- [x] §7.3 BlocoTexto → Task 9
- [x] §7.4 BlocoCtaInstitucional → Task 10
- [x] §7.5 BlocoImagemLegenda → Task 11
- [x] §7.6 BlocoFaq + FaqAcordeao → Tasks 12, 13
- [x] §7.7 BlocoProgramacao → Task 14
- [x] §8.1 GradeProgramas → Task 16
- [x] §8.2 GradeEventos → Task 17
- [x] §8.3 GradeEspecialistas → Task 17
- [x] §8.4 ListaModulos → Task 17
- [x] §8.5 FiltrosAgenda → Task 20
- [x] §10.1 Eyebrow → Task 19
- [x] §10.2 TituloSecao → Task 19
- [x] §10.3 LinkEditorial → Task 18
- [x] §10.4 Selo → Task 19
- [x] §12.1 ImagemSoberana → Task 3
- [x] §12.2 montaMetadataSoberana → Task 6
- [x] §12.4 JsonLd → Task 4
- [x] §12.5 Revelar → Task 5
- [x] RenderizadorLexical (decisão 3.2) → Task 2
- [x] /design-system reorganizado → Tasks 23–28

### Placeholder scan

Nenhum "TBD" / "implement later" / "similar to". Cada task tem código completo. As únicas notas auxiliares são:
- Task 2 explica dependência cruzada com Task 18 (LinkEditorial) e exige ordenação.
- Task 17 tem nota técnica sobre remover `void formatarData` que aparece como sugestão preventiva — o implementer pode simplesmente não incluir essa linha.
- Task 22 (mock Lexical) prevê `as RichTextContent` para absorver pequenas divergências do tipo inferido — não é placeholder, é uma decisão consciente.

### Type consistency

- `Area` / `Modalidade` / `ImagemRef` / helpers (`acentoPorArea`, `rotuloArea`, `rotuloModalidade`, `formatarData`, `formatarPeriodo`) vêm de `heroes/tipos.ts` — referenciados nessa exata grafia em Tasks 1, 7, 15, 17, 19, 20.
- `RichTextContent` definido na Task 2 e usado em Tasks 9, 13, 15, 17 (na ementa de ModuloItem), 22, 27 (mock).
- `FundoBloco` definido na Task 1, usado em Task 7.
- `ProporcaoImagem` definido na Task 3, reutilizado em Task 11.
- `FiltroEstado` + `FILTRO_INICIAL` definidos na Task 15, usados em Task 20 e Task 25.
- Exports na Task 21 cobrem todos os nomes acima.

### Ordem de execução recomendada

Dependências cruzadas (relevante para subagent-driven-development):

1. Task 1 (blocos/tipos)
2. Task 3 (ImagemSoberana — usado em Task 11)
3. Task 4 (JsonLd — usado em Task 13)
4. Task 5 (Revelar — independente)
5. Task 6 (montaMetadataSoberana — independente)
6. Task 18 (LinkEditorial — usado em Task 2)
7. Task 2 (Renderizador Lexical — usado em Tasks 9, 13, 17)
8. Tasks 7–14 (blocos restantes)
9. Task 15 (listings/tipos)
10. Tasks 16, 17 (grades sem filtros)
11. Tasks 19 (Eyebrow/TituloSecao/Selo)
12. Task 20 (FiltrosAgenda)
13. Task 21 (exports)
14. Task 22 (mock Lexical — usado em Tasks 24, 25, 27)
15. Task 23 (move heroes-e-cards)
16. Tasks 24, 25, 26, 27 (sub-rotas DS)
17. Task 28 (índice DS)
18. Task 29 (lint/typecheck/build)
19. Task 30 (checkpoint visual)
