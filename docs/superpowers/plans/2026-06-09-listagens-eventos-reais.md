# Listagens de eventos reais (Home + Agenda) — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans.

**Goal:** Home e Agenda exibem só os 5 eventos reais (EDUTEC M01/M02/M04 + PROGE M01/M03), derivados de `EVENTOS_AGENDA` via adapters. PROSUS sai das listagens (rota intacta).

**Tech:** Next.js 15 RSC, TS strict.

---

## Contexto
- Branch `feat/evento-online-edutec-m01`. Stage por path. Sessão paralela cms-soberana (não tocar prototipo-cms/).
- Shapes: Home usa `EventoCard`/`EventoCardSecundario` (`(home)/conteudoFallback.ts`); Agenda usa `CartaoEvento` (`agenda/conteudoAgenda.ts`); eventos reais = `EVENTOS_AGENDA` (`agenda/[slug]/conteudoEventos.ts`).
- Tipos agenda: AreaSlug "edu", ProgramaSlug "EDUTEC"/"PROGE", FormatoEvento "seminario", ModalidadeEvento "online", TabSlug "abertas", DataBloco {tipo:"single";dia;mesAno}.

---

### Task 1: `CardEvento` + bloco `card` nos 5 eventos + EVENTOS_LISTAGEM

**File:** `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1:** Adicionar a interface `CardEvento` antes de `EventoBase` (linha ~384):

```ts
export interface CardEvento {
  programaSlug: "EDUTEC" | "PROGE";
  formato: "seminario" | "oficina" | "curso";
  cidade: string;            // "" para online
  valorReais: number;        // 1470
  deadlineIso: string;       // "2026-06-15"
  keywords: string;
  flags: string[];
  imagemUrl: string;
  modalidadeLabel: string;   // "Online ao vivo + replay"
  formatoLabel: string;      // "Seminário"
  coordenacaoNomes: string;
  metaEssenciais: [string, string]; // ["8h · 1 dia", "Plataforma EventOn"]
  precoIndividualLabel: string;     // "R$ 1.470"
  precoEquipesLabel: string;        // "Sob consulta"
  destaqueHome: boolean;
  diaDataBloco: string;      // "15" — dia p/ DataBloco single
  mesAnoDataBloco: string;   // "Jun · 2026"
}
```

- [ ] **Step 2:** Adicionar `card?: CardEvento;` em `EventoBase` (campo opcional, junto aos demais).

- [ ] **Step 3:** Preencher `card` nos 5 eventos online (dentro de cada constante, ex. logo após `area`). Valores:

EDUTEC M01 (`edutec-m01-2026`):
```ts
  card: {
    programaSlug: "EDUTEC", formato: "seminario", cidade: "",
    valorReais: 1470, deadlineIso: "2026-06-15",
    keywords: "cultura digital educacao midiatica transformacao fluencia letramento",
    flags: ["destaque_editorial"], imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay", formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Roberta Aquino, Karla Priscilla e Mariana Ochs",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470", precoEquipesLabel: "Sob consulta",
    destaqueHome: true, diaDataBloco: "15", mesAnoDataBloco: "Jun · 2026",
  },
```
EDUTEC M02 (`edutec-m02-2026`): igual, `deadlineIso:"2026-06-16"`, `keywords:"fluencia digital docente praticas pedagogicas inovadoras tecnologia"`, `coordenacaoNomes:"NTC Educação · Roberta Aquino, Rebecca Rios e Bruno Reis"`, `destaqueHome:true`, `diaDataBloco:"16"`.
EDUTEC M04 (`edutec-m04-2026`): `deadlineIso:"2026-06-17"`, `keywords:"curriculo computacao bncc pensamento computacional pratica pedagogica"`, `coordenacaoNomes:"NTC Educação · Débora Garofalo, Roberta Aquino e Karla Priscilla"`, `destaqueHome:true`, `diaDataBloco:"17"`.
PROGE M01 (`proge-m01-2026`): `programaSlug:"PROGE"`, `deadlineIso:"2026-06-22"`, `keywords:"gestao escolar resultados recursos governanca democratica direcao"`, `coordenacaoNomes:"NTC Educação · Pedro Lino, Marialba Glória, Maria Sílvia Bacila e Marli Regina Fernandes"`, `destaqueHome:false`, `diaDataBloco:"22"`.
PROGE M03 (`proge-m03-2026`): `programaSlug:"PROGE"`, `deadlineIso:"2026-06-23"`, `keywords:"coordenacao pedagogica mentoria recomposicao gestao aprendizagem"`, `coordenacaoNomes:"NTC Educação · Andréa Patapoff, Maria Sílvia Bacila, Vasco Moretto e Maria Inês Fini"`, `destaqueHome:false`, `diaDataBloco:"23"`.

(Todos: `programaSlug` conforme, `formato:"seminario"`, `cidade:""`, `valorReais:1470`, `flags:["destaque_editorial"]`, `imagemUrl` mesma, labels iguais ao M01, `mesAnoDataBloco:"Jun · 2026"`.)

- [ ] **Step 4:** Adicionar export após `EVENTOS_AGENDA`:
```ts
export const EVENTOS_LISTAGEM = [
  "edutec-m01-2026", "edutec-m02-2026", "edutec-m04-2026",
  "proge-m01-2026", "proge-m03-2026",
] as const;
```

- [ ] **Step 5:** `pnpm typecheck` → PASS. Commit.

---

### Task 2: Adapters `adaptarParaCard.ts`

**File (novo):** `apps/web/lib/eventos/adaptarParaCard.ts`

- [ ] **Step 1:** Criar com 3 funções puras. Importa tipos de card de ambas as páginas + `Evento` de conteudoEventos. Cada função lê `evento.card` (se ausente → lança/retorna defaults). Estrutura:

```ts
import type { EventoCard, EventoCardSecundario } from "@/app/(home)/conteudoFallback";
import type { CartaoEvento } from "@/app/(capacitacao)/agenda/conteudoAgenda";
import type { Evento } from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";

function areaLabel(a: "edu" | "gov" | "sau"): string {
  return a === "edu" ? "NTC Educação" : a === "gov" ? "NTC Gestão Pública" : "NTC Saúde";
}

export function paraCardHomePrincipal(e: Evento): EventoCard | null {
  if (!e.card) return null;
  const c = e.card;
  return {
    area: e.area,
    destaque: c.flags.includes("destaque_editorial"),
    statusTag: { rotulo: "Inscrições abertas", tipo: "open" },
    imagemSrc: c.imagemUrl,
    data: { variante: "range", diasInicio: c.diaDataBloco, diasFim: c.diaDataBloco, monYr: c.mesAnoDataBloco },
    modalidade: { texto: c.modalidadeLabel },
    programLink: `${c.formatoLabel} · ${areaLabel(e.area)}`,
    titulo: e.titulo,
    coordenacao: { label: "Coordenação", nomes: c.coordenacaoNomes },
    meta: { ch: c.metaEssenciais[0], local: c.metaEssenciais[1] },
    programaBinding: { sigla: c.programaSlug, href: `/programas/${c.programaSlug.toLowerCase()}` },
    precoIndividual: c.precoIndividualLabel,
    precoInstitucional: c.precoEquipesLabel,
    ctas: {
      principal: { rotulo: "Inscrever-se", href: `/agenda/${e.slug}` },
      detalhes: { rotulo: "Ver detalhes", href: `/agenda/${e.slug}` },
      grupo: { rotulo: "Proposta para grupo", href: `/contato?evento=${encodeURIComponent(e.titulo)}` },
    },
  };
}

export function paraCardHomeSecundario(e: Evento): EventoCardSecundario | null {
  if (!e.card) return null;
  const c = e.card;
  return {
    area: e.area,
    imagemSrc: c.imagemUrl,
    data: { variante: "range", diasInicio: c.diaDataBloco, diasFim: c.diaDataBloco, monYr: c.mesAnoDataBloco },
    programa: `${c.formatoLabel} · ${areaLabel(e.area)}`,
    titulo: e.titulo,
    bindingSigla: c.programaSlug,
    metaCompleto: `${c.modalidadeLabel} · ${c.metaEssenciais[0]} · ${c.precoIndividualLabel}`,
    preco: c.precoIndividualLabel,
    ctaRotulo: "Ver detalhes",
    ctaHref: `/agenda/${e.slug}`,
  };
}

export function paraCartaoAgenda(e: Evento, ordem: number): CartaoEvento | null {
  if (!e.card) return null;
  const c = e.card;
  const mesIso = c.deadlineIso.slice(0, 7); // aproximação; data do evento ~ mesmo mês
  return {
    ordem,
    area: e.area,
    programa: c.programaSlug,
    formato: c.formato,
    modalidade: "online",
    cidade: "",
    mes: "2026-06",
    cargaHorariaHoras: 8,
    valorReais: c.valorReais,
    dataIso: c.deadlineIso, // dia do evento; deadline = mesmo dia nesta v1
    deadlineIso: c.deadlineIso,
    tab: "abertas",
    flags: c.flags as never,
    keywords: c.keywords,
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: c.imagemUrl,
    dataBloco: { tipo: "single", dia: c.diaDataBloco, mesAno: c.mesAnoDataBloco },
    modalidadeLabel: c.modalidadeLabel,
    formatoLabel: c.formatoLabel,
    areaLabel: areaLabel(e.area),
    tituloHtml: e.titulo,
    coordenacaoNomes: c.coordenacaoNomes,
    metaEssenciais: c.metaEssenciais,
    precoIndividualLabel: c.precoIndividualLabel,
    precoEquipesLabel: c.precoEquipesLabel,
    programaBinding: { sigla: c.programaSlug, href: `/programas/${c.programaSlug.toLowerCase()}`, cmsLink: `programa-${c.programaSlug}` },
    ctaInscrever: { texto: "Inscrever-se", href: `/agenda/${e.slug}`, cmsLink: `inscricao-${e.slug}`, track: "cta_inscrever" },
    linkDetalhes: { texto: "Ver detalhes", href: `/agenda/${e.slug}`, cmsLink: `detalhes-${e.slug}`, track: "event_card_detail" },
    linkInscreverEquipe: { texto: "Inscrever equipe", href: `/contato?evento=${encodeURIComponent(e.titulo)}`, cmsLink: `proposta-grupo-${e.slug}`, track: "cta_proposta_grupo" },
  };
}
```

> Ajustar nomes de campos exatos conferindo `EventoCard`/`EventoCardSecundario`/`CartaoEvento`/`DataBloco`/`LinkInterno` reais — corrigir qualquer divergência que o typecheck apontar (ex.: campo `mes` formato, `flags` tipo). Os tipos são a fonte da verdade.

- [ ] **Step 2:** `pnpm typecheck`. Corrigir divergências de shape. Commit.

---

### Task 3: Ligar Home + Agenda aos eventos reais

**Files:** `apps/web/app/(home)/page.tsx`, `apps/web/app/(capacitacao)/agenda/page.tsx`

- [ ] **Step 1 — Home:** em `page.tsx`, construir as listas reais a partir de `EVENTOS_LISTAGEM` + `EVENTOS_AGENDA`:

```ts
import { EVENTOS_AGENDA, EVENTOS_LISTAGEM } from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";
import { paraCardHomePrincipal, paraCardHomeSecundario } from "@/lib/eventos/adaptarParaCard";
// ...
const eventosReais = EVENTOS_LISTAGEM.map((s) => EVENTOS_AGENDA[s]).filter(Boolean);
const principais = eventosReais.filter((e) => e!.card?.destaqueHome).map((e) => paraCardHomePrincipal(e!)).filter(Boolean);
const secundarios = eventosReais.filter((e) => !e!.card?.destaqueHome).map((e) => paraCardHomeSecundario(e!)).filter(Boolean);
```
Trocar `f.eventosPrincipais.map(...)` por `principais.map(...)` e `f.eventosSecundarios.map(...)` por `secundarios.map(...)`. Manter cabeçalhos/textos de `f.eventosSecao`/`eventosSecundariosCabecalho`/`eventosFooter`.

- [ ] **Step 2 — Agenda:** em `agenda/page.tsx`, trocar `EVENTOS` (mockado) por adaptados:

```ts
import { EVENTOS_AGENDA, EVENTOS_LISTAGEM } from "./[slug]/conteudoEventos";
import { paraCartaoAgenda } from "@/lib/eventos/adaptarParaCard";
// ...
const eventosReais = EVENTOS_LISTAGEM
  .map((s) => EVENTOS_AGENDA[s])
  .filter(Boolean)
  .map((e, i) => paraCartaoAgenda(e!, i + 1))
  .filter(Boolean) as CartaoEvento[];
// <PipelineAgenda eventos={eventosReais} />
```
Remover o import de `EVENTOS` se ficar não usado (noUnusedLocals).

- [ ] **Step 3 — Limpar mockados:** remover os arrays `eventosPrincipais`/`eventosSecundarios` de `conteudoFallback.ts` (manter interfaces + demais campos do FALLBACK_HOME; se a home não referenciar mais, ok) e o array `EVENTOS` de `conteudoAgenda.ts` (manter tipos + filtros). Atenção: se `FALLBACK_HOME` exigir esses campos no tipo, manter como `[]` ou remover do tipo. Ajustar para typecheck passar.

- [ ] **Step 4:** `pnpm typecheck && pnpm lint && pnpm --filter @ntc/web build`. Commit.

---

### Task 4: Validação

- [ ] `pnpm --filter @ntc/web build` PASS.
- [ ] dev server; `/` 200 e `/agenda` 200.
- [ ] Home HTML: contém "Fluência Digital"/"Computação"/"Gestão Escolar"/"Coordenação Pedagógica" e os títulos EDUTEC; NÃO contém "PEAR"/"AGIP"/"LIDERA"/"PROAPS"/"Governança... SUS" (mockados/PROSUS sumiram dos cards).
- [ ] Agenda HTML: os 5 títulos reais; sem mockados.
- [ ] `/agenda/prosus-brasilia` ainda 200.
- [ ] Checkpoint visual humano.

## Self-review
- Adapter automático de EVENTOS_AGENDA ✓ (Task 2). Bloco card ✓ (Task 1). PROSUS fora das listas, rota intacta ✓ (EVENTOS_LISTAGEM exclui). Home 3+2 cronológico ✓ (destaqueHome). Agenda 5 + filtros ✓. CTAs → /agenda/slug ✓. Tipos: CardEvento campos consistentes Task1↔2↔3. Shapes de card exatos: validar contra tipos reais no typecheck (Task 2 Step 2 / Task 3 Step 3).
