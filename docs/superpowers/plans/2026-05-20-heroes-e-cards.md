# Heroes e Cards editoriais — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar as 5 famílias de Hero (§5 do Inventário) e as 5 famílias de Card (§6) como componentes server-rendered em `@ntc/ui`, com checkpoint visual em `/design-system`.

**Architecture:** Componentes RSC em `packages/ui/src/components/{heroes,cards}/`. Tipo `Area` e helpers (`acentoPorArea`, `rotuloArea`, `formatarData`, `formatarPeriodo`) compartilhados via `heroes/tipos.ts` (re-export em `cards/tipos.ts`). Imagens usam `next/image` (refactor futuro para `<ImagemSoberana>` na sessão 8). Links/cards clicáveis usam `next/link`. `@ntc/ui` ganha `next` como peerDependency. Checkpoint visual em `apps/web/app/design-system/page.tsx` com SVG placeholders inline determinísticos.

**Tech Stack:** TypeScript strict · Next.js 15 App Router · React 19 RSC · Tailwind CSS 4 (tokens em `globals.css` do app) · pnpm + Turborepo.

**Spec:** `docs/superpowers/specs/2026-05-20-heroes-e-cards-design.md`

---

## File Structure

### Criar

| Arquivo | Responsabilidade |
|---|---|
| `packages/ui/src/components/heroes/tipos.ts` | Tipo `Area`, `ImagemRef`, `Cta`, helpers `acentoPorArea`, `rotuloArea`, `formatarData`, `formatarPeriodo` |
| `packages/ui/src/components/heroes/HeroInstitucional.tsx` | Hero da Home / O Grupo (altura editorial/completa, CTAs) |
| `packages/ui/src/components/heroes/HeroArea.tsx` | Hero das verticais (lockup vertical + filete cromático) |
| `packages/ui/src/components/heroes/HeroPrograma.tsx` | Hero dos 15 programas (sigla + nome + metadados) |
| `packages/ui/src/components/heroes/HeroEvento.tsx` | Hero de cada evento (data, modalidade, local, CTA inscrição) |
| `packages/ui/src/components/heroes/HeroConteudo.tsx` | Hero de artigos/insights (categoria, lide, autor, meta) |
| `packages/ui/src/components/cards/tipos.ts` | Re-export de `Area` e helpers; sem novos tipos próprios |
| `packages/ui/src/components/cards/CardPrograma.tsx` | Card de programa, variantes `editorial`/`compacto` |
| `packages/ui/src/components/cards/CardEvento.tsx` | Card de evento (tag modalidade + CTA condicional) |
| `packages/ui/src/components/cards/CardEspecialista.tsx` | Card de especialista, variantes `regular`/`expandido`/`cerimonial`, foto 20:23 |
| `packages/ui/src/components/cards/CardConteudo.tsx` | Card de artigo/insight |
| `packages/ui/src/components/cards/CardCliente.tsx` | Card de cliente, variantes `mosaico`/`lista` |

### Modificar

| Arquivo | Mudança |
|---|---|
| `packages/ui/package.json` | adicionar `next: ^15.0.0` em `peerDependencies` e `devDependencies` |
| `packages/ui/src/index.ts` | exportar 10 componentes + tipos + helpers |
| `apps/web/app/design-system/page.tsx` | adicionar seções "Hero family" e "Cards editoriais" com dados mock e SVG placeholders inline |

### Testes

Esta sessão não inclui testes unitários — é a primeira entrega visual da camada UI do design system; o checkpoint é validação humana (preferência registrada na memória `feedback_validacao_visual`). Vitest/Playwright entram em sessão futura após a camada ficar estável.

---

## Task 1: Adicionar Next como peerDep de @ntc/ui

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Editar package.json**

Substituir o bloco `peerDependencies` e adicionar `next` em `devDependencies`. Estado final:

```json
{
  "name": "@ntc/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./tokens": "./src/tokens.ts"
  },
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .turbo node_modules"
  },
  "peerDependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "next": "^15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Reinstalar workspace**

Run: `pnpm install`
Expected: instalação completa, sem warnings de peerDeps faltantes para `@ntc/ui`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore(ui): adiciona next como peerDep de @ntc/ui"
```

---

## Task 2: Tipos compartilhados e helpers (heroes/tipos.ts)

**Files:**
- Create: `packages/ui/src/components/heroes/tipos.ts`

- [ ] **Step 1: Criar arquivo de tipos**

Conteúdo completo:

```typescript
export type Area = "educacao" | "gestao-publica" | "saude";

export type Modalidade = "online" | "presencial" | "hibrido";

export interface ImagemRef {
  src: string;
  alt: string;
}

export interface CtaHero {
  rotulo: string;
  href: string;
  variante: "primario" | "secundario";
}

export interface AcentoArea {
  texto: string;
  fundo: string;
  borda: string;
  bg10: string;
}

const ACENTO: Record<Area, AcentoArea> = {
  educacao: {
    texto: "text-oxford",
    fundo: "bg-oxford",
    borda: "border-oxford",
    bg10: "bg-oxford/10",
  },
  "gestao-publica": {
    texto: "text-cardeal",
    fundo: "bg-cardeal",
    borda: "border-cardeal",
    bg10: "bg-cardeal/10",
  },
  saude: {
    texto: "text-oliva",
    fundo: "bg-oliva",
    borda: "border-oliva",
    bg10: "bg-oliva/10",
  },
};

const ROTULO: Record<Area, string> = {
  educacao: "NTC Educação",
  "gestao-publica": "NTC Gestão Pública",
  saude: "NTC Saúde",
};

const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

export function acentoPorArea(area: Area): AcentoArea {
  return ACENTO[area];
}

export function rotuloArea(area: Area): string {
  return ROTULO[area];
}

export function rotuloModalidade(modalidade: Modalidade): string {
  return ROTULO_MODALIDADE[modalidade];
}

function paraDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

export function formatarData(d: Date | string, formato: "curto" | "longo" = "longo"): string {
  const data = paraDate(d);
  const opts: Intl.DateTimeFormatOptions =
    formato === "curto"
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { day: "2-digit", month: "long", year: "numeric" };
  return new Intl.DateTimeFormat("pt-BR", opts).format(data);
}

export function formatarPeriodo(
  inicio: Date | string,
  fim?: Date | string,
  formato: "curto" | "longo" = "longo",
): string {
  if (!fim) return formatarData(inicio, formato);
  const i = paraDate(inicio);
  const f = paraDate(fim);
  if (
    i.getFullYear() === f.getFullYear() &&
    i.getMonth() === f.getMonth() &&
    i.getDate() === f.getDate()
  ) {
    return formatarData(i, formato);
  }
  if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
    const dias = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
    const restante = new Intl.DateTimeFormat("pt-BR", {
      month: formato === "curto" ? "short" : "long",
      year: "numeric",
    });
    return `${dias.format(i)}–${dias.format(f)} de ${restante.format(i)}`;
  }
  return `${formatarData(i, formato)} – ${formatarData(f, formato)}`;
}
```

- [ ] **Step 2: Verificar tipo (rápido)**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/tipos.ts
git commit -m "feat(ui): tipos e helpers compartilhados de hero (Area, formatarData, acentoPorArea)"
```

---

## Task 3: HeroInstitucional

**Files:**
- Create: `packages/ui/src/components/heroes/HeroInstitucional.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { CtaHero, ImagemRef } from "./tipos";

export interface HeroInstitucionalProps {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  imagem: ImagemRef;
  ctas?: CtaHero[];
  altura?: "completa" | "editorial";
}

const alturaClasse: Record<NonNullable<HeroInstitucionalProps["altura"]>, string> = {
  editorial: "min-h-[75vh]",
  completa: "min-h-[100vh]",
};

const ctaClasse: Record<CtaHero["variante"], string> = {
  primario:
    "inline-flex items-center justify-center bg-oxford px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-oxford-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
  secundario:
    "inline-flex items-center justify-center border border-osso px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-osso hover:text-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
};

export function HeroInstitucional({
  eyebrow,
  titulo,
  subtitulo,
  imagem,
  ctas,
  altura = "editorial",
}: HeroInstitucionalProps) {
  return (
    <section className={`relative w-full overflow-hidden bg-oxford text-osso ${alturaClasse[altura]}`}>
      <Image
        src={imagem.src}
        alt={imagem.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-oxford/40 via-oxford/60 to-oxford" aria-hidden />
      <div className="relative flex h-full min-h-inherit items-end pb-[var(--spacing-secao-vertical)] pt-[calc(var(--spacing-secao-vertical)*0.75)]">
        <Container variante="amplo">
          {eyebrow && (
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 max-w-[22ch] font-titulo text-h1 text-balance text-osso">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-6 max-w-[52ch] font-corpo text-corpo text-osso/85 text-pretty">
              {subtitulo}
            </p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4">
              {ctas.map((cta) => (
                <Link key={cta.href + cta.rotulo} href={cta.href} className={ctaClasse[cta.variante]}>
                  {cta.rotulo}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/HeroInstitucional.tsx
git commit -m "feat(ui): HeroInstitucional (alturas editorial/completa, CTAs Soberana)"
```

---

## Task 4: HeroArea

**Files:**
- Create: `packages/ui/src/components/heroes/HeroArea.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import { Container } from "../layout/Container";
import type { Area, ImagemRef } from "./tipos";
import { rotuloArea } from "./tipos";

export interface HeroAreaProps {
  area: Area;
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  imagem: ImagemRef;
  corAcento: string;
}

export function HeroArea({ area, eyebrow, titulo, subtitulo, imagem, corAcento }: HeroAreaProps) {
  return (
    <section className="relative w-full overflow-hidden bg-pergaminho text-grafite">
      <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative flex items-center py-[var(--spacing-secao-vertical)]">
          <Container variante="editorial">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="block h-px w-16"
                style={{ backgroundColor: corAcento }}
              />
              <span
                className="font-corpo text-eyebrow uppercase tracking-[0.22em]"
                style={{ color: corAcento }}
              >
                {rotuloArea(area)}
              </span>
            </div>
            {eyebrow && (
              <p className="mt-8 font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-4 max-w-[18ch] font-titulo text-h1 text-balance text-oxford">
              {titulo}
            </h1>
            {subtitulo && (
              <p className="mt-6 max-w-[48ch] font-corpo text-corpo text-grafite text-pretty">
                {subtitulo}
              </p>
            )}
          </Container>
        </div>
        <div className="relative min-h-[40vh] lg:min-h-full">
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{ backgroundColor: corAcento }}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/HeroArea.tsx
git commit -m "feat(ui): HeroArea com lockup vertical e filete cromático"
```

---

## Task 5: HeroPrograma

**Files:**
- Create: `packages/ui/src/components/heroes/HeroPrograma.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, rotuloArea } from "./tipos";

export interface HeroProgramaProps {
  sigla: string;
  nomeCompleto: string;
  eyebrow?: string;
  imagem: ImagemRef;
  area: Area;
  cargaHorariaTotal: string;
  modulosQuantidade?: number;
  ctaPrincipal?: { rotulo: string; href: string };
}

export function HeroPrograma({
  sigla,
  nomeCompleto,
  eyebrow,
  imagem,
  area,
  cargaHorariaTotal,
  modulosQuantidade,
  ctaPrincipal,
}: HeroProgramaProps) {
  const acento = acentoPorArea(area);
  return (
    <section className="relative w-full bg-osso text-grafite">
      <div className="relative grid min-h-[70vh] grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative flex items-center py-[var(--spacing-secao-vertical)]">
          <Container variante="editorial">
            {eyebrow && (
              <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${acento.texto}`}>
                {eyebrow}
              </p>
            )}
            <p className={`mt-6 font-corpo text-eyebrow uppercase tracking-[0.22em] ${acento.texto}`}>
              {rotuloArea(area)}
            </p>
            <h1
              className="mt-4 font-titulo font-medium text-oxford"
              style={{ letterSpacing: "0.04em", fontSize: "clamp(3.5rem, 8vw, 6.5rem)", lineHeight: 0.95 }}
            >
              {sigla}
            </h1>
            <p className="mt-4 max-w-[28ch] font-titulo text-h3 text-balance text-grafite">
              {nomeCompleto}
            </p>
            {ctaPrincipal && (
              <Link
                href={ctaPrincipal.href}
                className="mt-10 inline-flex items-center bg-oxford px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-oxford-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
              >
                {ctaPrincipal.rotulo} →
              </Link>
            )}
          </Container>
        </div>
        <div className="relative min-h-[40vh] lg:min-h-full">
          {/* TODO sessão de logos: substituir por <LockupPrograma sigla={sigla} /> quando o conjunto de SVGs estiver pronto. Até lá, imagem editorial do programa. */}
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className={`border-t border-linha-sutil ${acento.bg10}`}>
        <Container variante="amplo">
          <dl className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
            <div>
              <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                Carga horária
              </dt>
              <dd className="mt-2 font-titulo text-h4 text-oxford">{cargaHorariaTotal}</dd>
            </div>
            {typeof modulosQuantidade === "number" && (
              <div>
                <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                  Módulos
                </dt>
                <dd className="mt-2 font-titulo text-h4 text-oxford">{modulosQuantidade}</dd>
              </div>
            )}
            <div>
              <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                Vertical
              </dt>
              <dd className="mt-2 font-titulo text-h4 text-oxford">{rotuloArea(area)}</dd>
            </div>
          </dl>
        </Container>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/HeroPrograma.tsx
git commit -m "feat(ui): HeroPrograma com sigla editorial e faixa de metadados"
```

---

## Task 6: HeroEvento

**Files:**
- Create: `packages/ui/src/components/heroes/HeroEvento.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { Area, ImagemRef, Modalidade } from "./tipos";
import { acentoPorArea, formatarPeriodo, rotuloModalidade } from "./tipos";

export interface HeroEventoProps {
  nome: string;
  eyebrow?: string;
  imagem: ImagemRef;
  dataInicio: Date | string;
  dataFim?: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string; nomeLocal?: string };
  programa?: { sigla: string; href: string };
  area: Area;
  ctaInscricao?: { rotulo: string; href: string; externo: boolean };
}

export function HeroEvento({
  nome,
  eyebrow,
  imagem,
  dataInicio,
  dataFim,
  modalidade,
  local,
  programa,
  area,
  ctaInscricao,
}: HeroEventoProps) {
  const acento = acentoPorArea(area);
  return (
    <section className="relative w-full overflow-hidden bg-oxford text-osso">
      <Image
        src={imagem.src}
        alt={imagem.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-oxford via-oxford/85 to-oxford/55" aria-hidden />
      <div className="relative py-[var(--spacing-secao-vertical)]">
        <Container variante="amplo">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full bg-osso/10 px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso ring-1 ring-inset ring-osso/30`}
            >
              {rotuloModalidade(modalidade)}
            </span>
            {programa && (
              <Link
                href={programa.href}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso ring-1 ring-inset ring-osso/30 transition-colors hover:bg-osso/10 ${acento.texto}`}
              >
                Programa {programa.sigla}
              </Link>
            )}
          </div>
          {eyebrow && (
            <p className="mt-8 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-4 max-w-[24ch] font-titulo text-h1 text-balance text-osso">
            {nome}
          </h1>
          <p className="mt-8 font-titulo text-h3 text-dourado">
            {formatarPeriodo(dataInicio, dataFim, "longo")}
          </p>
          {local && (
            <p className="mt-2 font-corpo text-corpo text-osso/85">
              {local.nomeLocal ? `${local.nomeLocal} · ` : ""}
              {local.cidade}/{local.estado}
            </p>
          )}
          {ctaInscricao && (
            <Link
              href={ctaInscricao.href}
              target={ctaInscricao.externo ? "_blank" : undefined}
              rel={ctaInscricao.externo ? "noopener noreferrer" : undefined}
              className="mt-10 inline-flex items-center bg-dourado px-7 py-3 font-corpo text-corpo text-oxford transition-colors hover:bg-osso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-osso"
            >
              {ctaInscricao.rotulo} →
            </Link>
          )}
        </Container>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/HeroEvento.tsx
git commit -m "feat(ui): HeroEvento com modalidade, período e CTA inscrição"
```

---

## Task 7: HeroConteudo

**Files:**
- Create: `packages/ui/src/components/heroes/HeroConteudo.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import { Container } from "../layout/Container";
import type { ImagemRef } from "./tipos";
import { formatarData } from "./tipos";

export interface HeroConteudoProps {
  categoria: string;
  titulo: string;
  lide: string;
  imagem: ImagemRef;
  autor?: { nome: string; titulacao: string };
  dataPublicacao: Date | string;
  tempoLeitura?: string;
}

export function HeroConteudo({
  categoria,
  titulo,
  lide,
  imagem,
  autor,
  dataPublicacao,
  tempoLeitura,
}: HeroConteudoProps) {
  return (
    <section className="w-full bg-pergaminho text-grafite">
      <Container variante="texto" as="article">
        <div className="py-[var(--spacing-secao-vertical)]">
          <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {categoria}
          </p>
          <h1 className="mt-6 font-titulo text-h1 text-balance text-oxford">{titulo}</h1>
          <p className="mt-8 font-titulo text-h4 leading-relaxed text-grafite text-pretty">
            {lide}
          </p>
          <dl className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-linha-sutil pt-6 font-corpo text-pequeno text-grafite-suave">
            {autor && (
              <div>
                <dt className="sr-only">Autor</dt>
                <dd className="text-grafite">
                  <span className="font-titulo text-corpo text-oxford">{autor.nome}</span>
                  <span className="ml-2 uppercase tracking-[0.18em] text-grafite-suave">
                    {autor.titulacao}
                  </span>
                </dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Publicado em</dt>
              <dd>{formatarData(dataPublicacao, "longo")}</dd>
            </div>
            {tempoLeitura && (
              <div>
                <dt className="sr-only">Tempo de leitura</dt>
                <dd>{tempoLeitura}</dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
      <div className="relative aspect-[16/7] w-full">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/heroes/HeroConteudo.tsx
git commit -m "feat(ui): HeroConteudo com lide editorial e meta de autoria"
```

---

## Task 8: cards/tipos.ts (re-export)

**Files:**
- Create: `packages/ui/src/components/cards/tipos.ts`

- [ ] **Step 1: Re-exportar tipos/helpers de heroes**

```typescript
export type { Area, ImagemRef, Modalidade } from "../heroes/tipos";
export {
  acentoPorArea,
  rotuloArea,
  rotuloModalidade,
  formatarData,
  formatarPeriodo,
} from "../heroes/tipos";
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/cards/tipos.ts
git commit -m "feat(ui): re-export tipos compartilhados em cards/tipos.ts"
```

---

## Task 9: CardPrograma

**Files:**
- Create: `packages/ui/src/components/cards/CardPrograma.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, rotuloArea } from "./tipos";

export interface CardProgramaProps {
  sigla: string;
  nomeCompleto: string;
  eyebrow?: string;
  imagem: ImagemRef;
  area: Area;
  resumoVisaoGeral?: string;
  href: string;
  variante?: "editorial" | "compacto";
}

export function CardPrograma({
  sigla,
  nomeCompleto,
  eyebrow,
  imagem,
  area,
  resumoVisaoGeral,
  href,
  variante = "editorial",
}: CardProgramaProps) {
  const acento = acentoPorArea(area);

  if (variante === "compacto") {
    return (
      <Link
        href={href}
        className={`group flex h-full flex-col justify-between border border-linha-sutil bg-osso p-6 transition-colors hover:${acento.borda} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado`}
      >
        <div>
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {rotuloArea(area)}
          </p>
          <h3 className="mt-4 font-titulo text-h3 text-oxford">{sigla}</h3>
          <p className="mt-2 font-corpo text-corpo text-grafite">{nomeCompleto}</p>
        </div>
        <span className="mt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
          Conhecer →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pergaminho">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-7">
        {eyebrow && (
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {eyebrow}
          </p>
        )}
        <h3 className="mt-3 font-titulo text-h3 text-oxford">{sigla}</h3>
        <p className="mt-2 font-corpo text-corpo text-grafite">{nomeCompleto}</p>
        {resumoVisaoGeral && (
          <p className="mt-4 line-clamp-3 font-corpo text-pequeno text-grafite-suave text-pretty">
            {resumoVisaoGeral}
          </p>
        )}
        <span className="mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
          Conhecer o programa →
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/cards/CardPrograma.tsx
git commit -m "feat(ui): CardPrograma (variantes editorial e compacto)"
```

---

## Task 10: CardEvento

**Files:**
- Create: `packages/ui/src/components/cards/CardEvento.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef, Modalidade } from "./tipos";
import { acentoPorArea, formatarData, rotuloModalidade } from "./tipos";

export interface CardEventoProps {
  nome: string;
  eyebrow?: string;
  imagem: ImagemRef;
  dataInicio: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string };
  programa?: { sigla: string };
  area: Area;
  inscricaoAberta: boolean;
  href: string;
}

export function CardEvento({
  nome,
  eyebrow,
  imagem,
  dataInicio,
  modalidade,
  local,
  programa,
  area,
  inscricaoAberta,
  href,
}: CardEventoProps) {
  const acento = acentoPorArea(area);
  const rotulo = inscricaoAberta ? "Inscrever-se →" : "Detalhes →";
  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pergaminho">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-oxford/90 px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso">
          {rotuloModalidade(modalidade)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7">
        {(eyebrow || programa) && (
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {eyebrow ?? (programa ? `Programa ${programa.sigla}` : "")}
          </p>
        )}
        <p className="mt-3 font-titulo text-h4 text-oxford">{formatarData(dataInicio, "longo")}</p>
        <h3 className="mt-2 font-titulo text-h3 text-balance text-grafite">{nome}</h3>
        {local && (
          <p className="mt-3 font-corpo text-pequeno text-grafite-suave">
            {local.cidade}/{local.estado}
          </p>
        )}
        <span
          className={`mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] ${
            inscricaoAberta ? "text-cardeal" : "text-oxford"
          }`}
        >
          {rotulo}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/cards/CardEvento.tsx
git commit -m "feat(ui): CardEvento com tag de modalidade e CTA condicional"
```

---

## Task 11: CardEspecialista

**Files:**
- Create: `packages/ui/src/components/cards/CardEspecialista.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export interface CardEspecialistaProps {
  nome: string;
  titulacao: string;
  instituicao: string;
  cargoAtual?: string;
  foto: { src: string; alt: string };
  href?: string;
  variante?: "regular" | "expandido" | "cerimonial";
}

function Envoltorio({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado`}
      >
        {children}
      </Link>
    );
  }
  return <article className={className}>{children}</article>;
}

export function CardEspecialista({
  nome,
  titulacao,
  instituicao,
  cargoAtual,
  foto,
  href,
  variante = "regular",
}: CardEspecialistaProps) {
  if (variante === "cerimonial") {
    return (
      <Envoltorio
        href={href}
        className="group flex h-full flex-col items-center border border-dourado bg-pergaminho p-8 text-center transition-colors hover:border-oxford"
      >
        <div className="relative aspect-[20/23] w-full max-w-[14rem] overflow-hidden bg-osso">
          <Image src={foto.src} alt={foto.alt} fill sizes="14rem" className="object-cover" />
        </div>
        <h3 className="mt-6 font-titulo text-h3 text-oxford">{nome}</h3>
        <span
          aria-hidden
          className="mt-3 inline-block h-px w-12 bg-dourado"
        />
        <p className="mt-3 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
          {titulacao}
        </p>
        <p className="mt-2 font-corpo text-corpo text-grafite">{instituicao}</p>
        {cargoAtual && (
          <p className="mt-1 font-corpo text-pequeno text-grafite-suave">{cargoAtual}</p>
        )}
      </Envoltorio>
    );
  }

  return (
    <Envoltorio
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford"
    >
      <div className="relative aspect-[20/23] w-full overflow-hidden bg-pergaminho">
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-titulo text-h4 text-oxford">{nome}</h3>
        <p className="mt-1 font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          {titulacao}
        </p>
        <p className="mt-3 font-corpo text-pequeno text-grafite">{instituicao}</p>
        {variante === "expandido" && cargoAtual && (
          <p className="mt-3 font-corpo text-pequeno text-grafite-suave text-pretty">
            {cargoAtual}
          </p>
        )}
      </div>
    </Envoltorio>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/cards/CardEspecialista.tsx
git commit -m "feat(ui): CardEspecialista 20:23 (regular/expandido/cerimonial)"
```

---

## Task 12: CardConteudo

**Files:**
- Create: `packages/ui/src/components/cards/CardConteudo.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, formatarData } from "./tipos";

export interface CardConteudoProps {
  titulo: string;
  lide: string;
  categoria: string;
  imagem: ImagemRef;
  area?: Area;
  dataPublicacao: Date | string;
  tempoLeitura?: string;
  href: string;
}

export function CardConteudo({
  titulo,
  lide,
  categoria,
  imagem,
  area,
  dataPublicacao,
  tempoLeitura,
  href,
}: CardConteudoProps) {
  const acentoTexto = area ? acentoPorArea(area).texto : "text-cardeal";
  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-pergaminho">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acentoTexto}`}>
          {categoria}
        </p>
        <h3 className="mt-3 font-titulo text-h3 text-balance text-oxford">{titulo}</h3>
        <p className="mt-3 line-clamp-3 font-corpo text-corpo text-grafite text-pretty">{lide}</p>
        <p className="mt-auto pt-6 font-corpo text-pequeno text-grafite-suave">
          {formatarData(dataPublicacao, "longo")}
          {tempoLeitura ? ` · ${tempoLeitura}` : ""}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/cards/CardConteudo.tsx
git commit -m "feat(ui): CardConteudo (artigo/insight)"
```

---

## Task 13: CardCliente

**Files:**
- Create: `packages/ui/src/components/cards/CardCliente.tsx`

- [ ] **Step 1: Implementar componente**

```tsx
import Image from "next/image";

export interface CardClienteProps {
  nome: string;
  logo: { src: string; alt: string };
  esfera?: string;
  estado?: string;
  variante?: "mosaico" | "lista";
}

export function CardCliente({
  nome,
  logo,
  esfera,
  estado,
  variante = "mosaico",
}: CardClienteProps) {
  if (variante === "lista") {
    return (
      <article className="flex items-center gap-6 border border-linha-sutil bg-osso p-5">
        <div className="relative h-14 w-24 shrink-0 bg-pergaminho">
          <Image
            src={logo.src}
            alt={logo.alt}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        </div>
        <div>
          <h3 className="font-titulo text-h4 text-oxford">{nome}</h3>
          {(esfera || estado) && (
            <p className="mt-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
              {[esfera, estado].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-28 items-center justify-center border border-linha-sutil bg-pergaminho p-5">
      <div className="relative h-full w-full">
        <Image
          src={logo.src}
          alt={logo.alt || nome}
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
          className="object-contain"
        />
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @ntc/ui typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/cards/CardCliente.tsx
git commit -m "feat(ui): CardCliente (mosaico e lista)"
```

---

## Task 14: Exportar tudo no index do pacote

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Adicionar exports ao final do arquivo**

Após o último export atual, anexar (deixar os exports anteriores intactos):

```typescript

// Tipos e helpers compartilhados — doc 12 §5/§6
export type { Area, Modalidade, ImagemRef, CtaHero, AcentoArea } from "./components/heroes/tipos";
export {
  acentoPorArea,
  rotuloArea,
  rotuloModalidade,
  formatarData,
  formatarPeriodo,
} from "./components/heroes/tipos";

// Hero family — doc 12 §5
export { HeroInstitucional } from "./components/heroes/HeroInstitucional";
export type { HeroInstitucionalProps } from "./components/heroes/HeroInstitucional";

export { HeroArea } from "./components/heroes/HeroArea";
export type { HeroAreaProps } from "./components/heroes/HeroArea";

export { HeroPrograma } from "./components/heroes/HeroPrograma";
export type { HeroProgramaProps } from "./components/heroes/HeroPrograma";

export { HeroEvento } from "./components/heroes/HeroEvento";
export type { HeroEventoProps } from "./components/heroes/HeroEvento";

export { HeroConteudo } from "./components/heroes/HeroConteudo";
export type { HeroConteudoProps } from "./components/heroes/HeroConteudo";

// Cards editoriais — doc 12 §6
export { CardPrograma } from "./components/cards/CardPrograma";
export type { CardProgramaProps } from "./components/cards/CardPrograma";

export { CardEvento } from "./components/cards/CardEvento";
export type { CardEventoProps } from "./components/cards/CardEvento";

export { CardEspecialista } from "./components/cards/CardEspecialista";
export type { CardEspecialistaProps } from "./components/cards/CardEspecialista";

export { CardConteudo } from "./components/cards/CardConteudo";
export type { CardConteudoProps } from "./components/cards/CardConteudo";

export { CardCliente } from "./components/cards/CardCliente";
export type { CardClienteProps } from "./components/cards/CardCliente";
```

- [ ] **Step 2: Typecheck em todo o monorepo**

Run: `pnpm typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): exporta hero family, cards e helpers em @ntc/ui"
```

---

## Task 15: Adicionar amostras no /design-system

**Files:**
- Modify: `apps/web/app/design-system/page.tsx`
- Modify: `apps/web/next.config.ts` (se necessário para data: URIs)

- [ ] **Step 1: Verificar config do next/image**

Read: `apps/web/next.config.ts`

Se a config atual **não** permite `dangerouslyAllowSVG` ou `remotePatterns` para `data:`, precisamos passar `unoptimized` nas imagens placeholder. Em vez de mexer no `next.config.ts`, vamos usar **fotos públicas via `picsum.photos`** (placeholder estável, sem ruído de configuração) com `remotePatterns`.

Edit em `apps/web/next.config.ts` — adicionar bloco `images.remotePatterns` se não existir:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
};

export default nextConfig;
```

> Se o `next.config.ts` já tiver outras chaves, preserve-as e apenas adicione/mescle a chave `images.remotePatterns`.

- [ ] **Step 2: Reescrever a página `/design-system` com novas seções**

Substituir o conteúdo de `apps/web/app/design-system/page.tsx` por (mantendo as seções existentes de layout/navegação **e** adicionando heroes/cards):

```tsx
import type { Metadata } from "next";

import {
  Breadcrumbs,
  CardCliente,
  CardConteudo,
  CardEspecialista,
  CardEvento,
  CardPrograma,
  Container,
  Grade,
  HeroArea,
  HeroConteudo,
  HeroEvento,
  HeroInstitucional,
  HeroPrograma,
  type ItemMenu,
  NavegacaoSoberana,
  Secao,
  tokens,
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

const IMG = {
  institucional: "https://picsum.photos/seed/ntc-institucional/1920/1080",
  educacao: "https://picsum.photos/seed/ntc-educacao/1600/1000",
  gestao: "https://picsum.photos/seed/ntc-gestao/1600/1000",
  saude: "https://picsum.photos/seed/ntc-saude/1600/1000",
  programa: "https://picsum.photos/seed/ntc-programa/1200/900",
  evento: "https://picsum.photos/seed/ntc-evento/1600/1000",
  conteudo: "https://picsum.photos/seed/ntc-conteudo/1600/700",
  conteudo2: "https://picsum.photos/seed/ntc-conteudo2/1600/900",
  especialista1: "https://picsum.photos/seed/ntc-pessoa1/600/690",
  especialista2: "https://picsum.photos/seed/ntc-pessoa2/600/690",
  especialista3: "https://picsum.photos/seed/ntc-pessoa3/600/690",
  cliente1: "https://picsum.photos/seed/ntc-logo1/240/120",
  cliente2: "https://picsum.photos/seed/ntc-logo2/240/120",
  cliente3: "https://picsum.photos/seed/ntc-logo3/240/120",
  cliente4: "https://picsum.photos/seed/ntc-logo4/240/120",
};

export default function DesignSystemPage() {
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS}
        ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato" }}
        ctaSecundario={{ rotulo: "Área do Participante", href: "/eventon/area" }}
      />

      <main id="conteudo">
        <Secao fundo="osso" vertical="compacto">
          <Container variante="amplo">
            <Breadcrumbs
              itens={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Design System", href: "/design-system" },
                { rotulo: "Heroes e Cards" },
              ]}
            />
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
              Sandbox interna · não-listada no sitemap
            </p>
            <h1 className="mt-4 text-h1 text-balance">
              Heroes e Cards <em className="text-cardeal">Soberana</em>
            </h1>
            <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-pretty">
              Checkpoint visual da sessão 7 do Sprint F. Cinco famílias de hero (Inventário §5)
              e cinco famílias de card (§6), todos com dados mock.
            </p>
          </Container>
        </Secao>

        {/* ============ HERO FAMILY ============ */}
        <Secao fundo="pergaminho" vertical="compacto">
          <Container variante="amplo">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
              Hero family — §5 do Inventário
            </p>
            <h2 className="mt-3 text-h2 text-oxford">Cinco variantes canônicas</h2>
          </Container>
        </Secao>

        <HeroInstitucional
          eyebrow="Instituto NTC do Brasil"
          titulo="Inteligência institucional. Impacto real."
          subtitulo="Formação de capacidades públicas em educação, gestão e saúde — com método editorial, currículos próprios e corpo docente sênior."
          imagem={{ src: IMG.institucional, alt: "Cenário institucional NTC" }}
          ctas={[
            { rotulo: "Conhecer o Grupo", href: "/grupo", variante: "primario" },
            { rotulo: "Falar com a equipe", href: "/contato", variante: "secundario" },
          ]}
        />

        <HeroArea
          area="educacao"
          eyebrow="Vertical de Educação"
          titulo="Redes públicas que aprendem com método."
          subtitulo="Programas para secretarias estaduais e municipais com foco em alfabetização, educação integral e digitalização do ensino."
          imagem={{ src: IMG.educacao, alt: "Sala de aula pública" }}
          corAcento={tokens.cores.oxford}
        />

        <HeroArea
          area="gestao-publica"
          eyebrow="Vertical de Gestão Pública"
          titulo="Direção estratégica para o serviço público."
          subtitulo="Liderança, contratações, integridade e modernização para administrações públicas comprometidas com resultado."
          imagem={{ src: IMG.gestao, alt: "Cenário institucional" }}
          corAcento={tokens.cores.cardeal}
        />

        <HeroPrograma
          sigla="EDUTEC"
          nomeCompleto="Educação Digital de Alta Performance"
          eyebrow="Programa"
          imagem={{ src: IMG.programa, alt: "Imagem editorial do programa" }}
          area="educacao"
          cargaHorariaTotal="180 horas"
          modulosQuantidade={6}
          ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato?programa=edutec" }}
        />

        <HeroEvento
          nome="Encontro PROSUS+ Brasília 2026"
          eyebrow="Capacitação · Saúde"
          imagem={{ src: IMG.evento, alt: "Auditório do evento" }}
          dataInicio="2026-08-12"
          dataFim="2026-08-14"
          modalidade="presencial"
          local={{ cidade: "Brasília", estado: "DF", nomeLocal: "Centro Internacional de Convenções" }}
          programa={{ sigla: "PROSUS+", href: "/programas/prosus" }}
          area="saude"
          ctaInscricao={{ rotulo: "Inscrever-se", href: "/eventon/prosus-brasilia-2026", externo: false }}
        />

        <HeroConteudo
          categoria="Insights · Gestão Pública"
          titulo="A nova fronteira da liderança no Estado brasileiro"
          lide="Por que a próxima década exigirá um modelo de direção pública mais analítica, mais ética e mais editorial — e como o Grupo NTC vem formando esses quadros."
          imagem={{ src: IMG.conteudo, alt: "Cenário editorial" }}
          autor={{ nome: "Profa. Dra. M. Andrade", titulacao: "Diretora editorial" }}
          dataPublicacao="2026-04-12"
          tempoLeitura="9 min de leitura"
        />

        {/* ============ CARDS EDITORIAIS ============ */}
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
              Cards editoriais — §6 do Inventário
            </p>
            <h2 className="mt-3 text-h2 text-oxford">CardPrograma</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Variantes editorial (com imagem) e compacto (texto + tag de área).
            </p>
            <Grade colunas={3} gap="medio" className="mt-12">
              <CardPrograma
                sigla="EDUTEC"
                nomeCompleto="Educação Digital de Alta Performance"
                eyebrow="Programa NTC Educação"
                imagem={{ src: IMG.programa, alt: "Imagem editorial do EDUTEC" }}
                area="educacao"
                resumoVisaoGeral="Trilha de 180h para secretarias de educação que querem profissionalizar a integração de tecnologia ao currículo."
                href="/programas/edutec"
                variante="editorial"
              />
              <CardPrograma
                sigla="LIDERA"
                nomeCompleto="Direção Estratégica no Setor Público"
                eyebrow="Programa NTC Gestão Pública"
                imagem={{ src: IMG.gestao, alt: "Imagem editorial do LIDERA" }}
                area="gestao-publica"
                resumoVisaoGeral="Formação de direção para gestores em transição de carreira para o alto escalão do Estado."
                href="/programas/lidera"
                variante="editorial"
              />
              <CardPrograma
                sigla="PROSUS+"
                nomeCompleto="Governança no SUS"
                area="saude"
                imagem={{ src: IMG.saude, alt: "" }}
                href="/programas/prosus"
                variante="compacto"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardEvento</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              CTA muda conforme `inscricaoAberta`.
            </p>
            <Grade colunas={2} gap="medio" className="mt-12">
              <CardEvento
                nome="Encontro PROSUS+ Brasília 2026"
                eyebrow="Programa PROSUS+"
                imagem={{ src: IMG.evento, alt: "Auditório do evento" }}
                dataInicio="2026-08-12"
                modalidade="presencial"
                local={{ cidade: "Brasília", estado: "DF" }}
                programa={{ sigla: "PROSUS+" }}
                area="saude"
                inscricaoAberta
                href="/eventos/prosus-brasilia-2026"
              />
              <CardEvento
                nome="EDUTEC · Módulo 1 Online"
                imagem={{ src: IMG.educacao, alt: "Cenário do evento online" }}
                dataInicio="2026-03-08"
                modalidade="online"
                programa={{ sigla: "EDUTEC" }}
                area="educacao"
                inscricaoAberta={false}
                href="/eventos/edutec-m01"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardEspecialista</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Foto 20:23. Variantes regular, expandido e cerimonial.
            </p>
            <Grade colunas={3} gap="medio" className="mt-12">
              <CardEspecialista
                nome="Profa. Dra. Maria Andrade"
                titulacao="PhD em Educação"
                instituicao="USP · NTC Educação"
                foto={{ src: IMG.especialista1, alt: "Retrato editorial" }}
                href="/corpo-docente/maria-andrade"
                variante="regular"
              />
              <CardEspecialista
                nome="Prof. Dr. João Soares"
                titulacao="Doutor em Administração Pública"
                instituicao="FGV · NTC Gestão Pública"
                cargoAtual="Ex-secretário estadual de fazenda; consultor sênior do Banco Mundial em modernização de gestão pública."
                foto={{ src: IMG.especialista2, alt: "Retrato editorial" }}
                href="/corpo-docente/joao-soares"
                variante="expandido"
              />
              <CardEspecialista
                nome="Profa. Dra. Helena Lima"
                titulacao="PhD em Saúde Coletiva"
                instituicao="Fiocruz · NTC Saúde"
                cargoAtual="Diretora editorial do programa PROSUS+"
                foto={{ src: IMG.especialista3, alt: "Retrato editorial" }}
                href="/corpo-docente/helena-lima"
                variante="cerimonial"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardConteudo</h2>
            <Grade colunas={2} gap="medio" className="mt-12">
              <CardConteudo
                titulo="A nova fronteira da liderança no Estado brasileiro"
                lide="Por que a próxima década exigirá um modelo de direção pública mais analítica, mais ética e mais editorial."
                categoria="Insights · Gestão Pública"
                imagem={{ src: IMG.conteudo2, alt: "" }}
                area="gestao-publica"
                dataPublicacao="2026-04-12"
                tempoLeitura="9 min de leitura"
                href="/conteudos/liderança-estado"
              />
              <CardConteudo
                titulo="Alfabetização: o gargalo silencioso da educação brasileira"
                lide="Dados do PEAR mostram que redes com método estruturado dobram o rendimento ao fim do 2º ano."
                categoria="Insights · Educação"
                imagem={{ src: IMG.educacao, alt: "" }}
                area="educacao"
                dataPublicacao="2026-03-20"
                tempoLeitura="7 min de leitura"
                href="/conteudos/alfabetizacao-gargalo"
              />
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <h2 className="text-h2 text-oxford">CardCliente</h2>
            <p className="mt-3 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
              Mosaico (logo central) e lista (logo + nome + esfera/estado).
            </p>
            <Grade colunas={4} gap="medio" className="mt-12">
              <CardCliente
                nome="Secretaria de Educação de Goiás"
                logo={{ src: IMG.cliente1, alt: "SEDUC-GO" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Secretaria de Saúde da Bahia"
                logo={{ src: IMG.cliente2, alt: "SESAB" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Tribunal de Contas do Estado do Ceará"
                logo={{ src: IMG.cliente3, alt: "TCE-CE" }}
                variante="mosaico"
              />
              <CardCliente
                nome="Prefeitura de Recife"
                logo={{ src: IMG.cliente4, alt: "PCR" }}
                variante="mosaico"
              />
            </Grade>
            <Grade colunas={2} gap="medio" className="mt-10">
              <CardCliente
                nome="Secretaria de Educação de Goiás"
                logo={{ src: IMG.cliente1, alt: "SEDUC-GO" }}
                esfera="Estadual"
                estado="GO"
                variante="lista"
              />
              <CardCliente
                nome="Prefeitura de Recife"
                logo={{ src: IMG.cliente4, alt: "PCR" }}
                esfera="Municipal"
                estado="PE"
                variante="lista"
              />
            </Grade>
          </Container>
        </Secao>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Rodar lint, typecheck e build**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: tudo passa. Se Tailwind reclamar de classes dinâmicas (`hover:${acento.borda}` em `CardPrograma`), pré-computamos a classe inteira — voltar em `CardPrograma.tsx` e trocar a interpolação por um mapa estático antes de prosseguir.

> **Nota:** Tailwind 4 com JIT não enxerga `hover:${acento.borda}`. Já está mitigado nos componentes — a maior parte usa `${acento.texto}`/`${acento.fundo}` que entram inteiros no className. Apenas o `CardPrograma` compacto tem `hover:${acento.borda}` no template. Se o build apontar warning de classe não encontrada, substituir por `hover:border-oxford` (todas as 3 áreas) — o hover branding fica via `texto` apenas.

Caso necessário, corrigir `CardPrograma.tsx` linha do compacto:
```diff
- className={`group flex h-full flex-col justify-between border border-linha-sutil bg-osso p-6 transition-colors hover:${acento.borda} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado`}
+ className="group flex h-full flex-col justify-between border border-linha-sutil bg-osso p-6 transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
```

- [ ] **Step 4: Commit final (squash dos componentes + design system se preferir, ou commit separado)**

```bash
git add apps/web/app/design-system/page.tsx apps/web/next.config.ts
git commit -m "feat(design-system): amostras de heroes e cards no /design-system"
```

---

## Task 16: Checkpoint visual + validação humana

**Files:** nenhum (validação)

- [ ] **Step 1: Subir dev server**

Run: `pnpm dev:web` (em background)
Expected: servidor escutando em http://localhost:3000

- [ ] **Step 2: Abrir `/design-system`**

Pedir ao usuário para abrir `http://localhost:3000/design-system` e:
- conferir que os 5 heroes renderizam em sequência
- conferir todas as variantes de card
- conferir tipografia (Cormorant nos títulos/siglas/datas em destaque; Barlow no corpo)
- conferir ausência de gradientes vibrantes e ausência de border-radius em cards
- conferir pílulas/tags em `rounded-full`

- [ ] **Step 3: Aguardar aprovação humana**

Sem prosseguir antes da confirmação verbal/textual. Em caso de discrepância, voltar à task do componente afetado e ajustar.

- [ ] **Step 4: Encerrar servidor após aprovação**

Encerrar o processo `pnpm dev:web` em background.

- [ ] **Step 5: Commit consolidador (se houve ajustes de revisão visual)**

Caso a sequência de commits Task 3–15 não pareça coesa, criar tag visual:
```bash
git log --oneline -20
```

Se já estiver bom, nada a fazer.

---

## Self-review checklist (executado pelo planejador)

- ✅ **Spec coverage**: cada componente do §5/§6 do spec tem uma task (3–7 heroes, 9–13 cards), tipos compartilhados na Task 2, exports na Task 14, checkpoint visual na Task 15, validação humana na Task 16.
- ✅ **Placeholders**: nenhum "TBD"/"TODO" nas implementações exceto o TODO comentado em `HeroPrograma` sobre lockup do programa (justificado no spec §6).
- ✅ **Type consistency**: `Area`, `Modalidade`, `ImagemRef`, `CtaHero` são definidos na Task 2 e reutilizados em todas as tasks subsequentes; helpers `acentoPorArea`, `rotuloArea`, `rotuloModalidade`, `formatarData`, `formatarPeriodo` são referenciados com os nomes exatos da Task 2.
- ✅ **No phantom refs**: nenhum import a componente fora do escopo (`<BotaoSoberano>`, `<ImagemSoberana>`) — usamos `<a>`/`<Link>` estilizado e `next/image`.
- ✅ **TDD não se aplica** (entrega visual; testes em sessão futura conforme §2.2 do spec).
- ✅ **Commits frequentes**: 1 commit por componente; granularidade adequada.

