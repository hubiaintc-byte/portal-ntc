# CMS Override de Evento Online — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir editar capa, data e folder PDF de um evento online pelo CMS (sobrescrevendo o evento estático por slug), e criar o registro EDUTEC no CMS com metadados principais.

**Architecture:** A página continua lendo o evento estático (`conteudoEventos.ts`). Antes de renderizar online, busca no CMS por slug e aplica 3 overrides: capa, data (deriva formatos pt-BR), folder PDF (href do botão "Baixar folder"; some se ausente). Registro no CMS criado por seed idempotente. `Media` já aceita PDF — sem coleção nova.

**Tech Stack:** Next.js 15 (RSC), TypeScript strict, Payload CMS 3 (Postgres/Supabase), seed via `payload run`.

---

## Contexto crítico (ler antes)

- **Branch:** `feat/evento-online-edutec-m01`. NÃO trocar. Sessão paralela `feat/cms-soberana` mexe SÓ em `apps/web/app/(prototipo-cms)/` — não toca `collections/Eventos.ts`, `payload.config.ts`, `lib/cms/`. Stage explícito por path; nunca `git add .`/`-A`.
- **`Media` já aceita `application/pdf`** (mimeTypes em `collections/Media.ts`). NÃO criar coleção `Folders`. O folder PDF é upload→`media`.
- **Schema push:** `postgresAdapter` sem `push:` explícito = push automático em dev. Adicionar 1 campo `folderPdf` (upload, vira FK/coluna) muda o schema. Antes de subir o CMS para o seed, checar a porta 3001 (Task 5). Autonomia total: aplicar sem pedir OK.
- **`imagemCapa` é `required: true`** na coleção. O seed precisa resolver uma imagem placeholder existente (ex.: `area-educacao...`) OU o create falha. Decisão: o seed resolve a media `area-educacao` por filename como capa inicial (usuário troca depois).
- **URL de upload:** `(upload as Media).url` (padrão em `lib/cms/eventos.ts:75`).
- **Override só para online** nesta v1.

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `apps/cms/src/collections/Eventos.ts` | + campo `folderPdf` (upload→media). | Modify |
| `apps/cms/src/seed/seedEventoEdutecM01.ts` | Cria/atualiza o registro EDUTEC no CMS (idempotente por slug). | Create |
| `apps/cms/package.json` + raiz `package.json` | script `payload:seed:edutec`. | Modify |
| `apps/web/lib/cms/derivarDatasEvento.ts` | ISO → formatos pt-BR (meta/timeline/sidebar/ics/deadline). | Create |
| `apps/web/lib/cms/overrideEventoOnline.ts` | `buscarOverride(slug)` + `aplicarOverrideOnline(evento, ovr)`. | Create |
| `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` | `HeroOnline.bgUrl?` opcional (p/ override de capa alcançar o hero). | Modify |
| `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx` | hero bg lê `bgUrl` se houver; "Baixar folder" some sem href real. | Modify |
| `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` | aplica override no caso online. | Modify |

**Ordem:** derivarDatas (puro, testável) → override lib → tipo bgUrl + layout → page wiring → CMS campo + seed + push + run. Cada task commita.

---

### Task 1: `derivarDatasEvento.ts` (função pura, com teste)

**Files:**
- Create: `apps/web/lib/cms/derivarDatasEvento.ts`
- Create: `apps/web/lib/cms/derivarDatasEvento.test.ts`

- [ ] **Step 1: Teste primeiro**

Criar `apps/web/lib/cms/derivarDatasEvento.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { derivarDatasEvento } from "./derivarDatasEvento";

describe("derivarDatasEvento", () => {
  it("deriva formatos pt-BR para 15 de junho de 2026 (segunda)", () => {
    const d = derivarDatasEvento("2026-06-15");
    expect(d.metaValue).toBe("15 · Junho");
    expect(d.metaSub).toBe("2026 · Segunda-feira");
    expect(d.timelineDiaHtml).toBe("15 de <em>Junho</em> · Segunda-feira");
    expect(d.sidebarValue).toBe("15 · Jun · 2026");
    expect(d.dataEvento).toBe("15 de junho de 2026");
    expect(d.deadlineISO).toBe("2026-06-15T23:59:59-03:00");
    expect(d.countdownDateText).toBe("Até 15 de Junho de 2026");
    expect(d.icsStart).toBe("20260615T080000");
    expect(d.icsEnd).toBe("20260615T180000");
  });

  it("aceita ISO com hora e ignora o horário (usa 08h-18h fixos)", () => {
    const d = derivarDatasEvento("2026-06-15T09:30:00-03:00");
    expect(d.icsStart).toBe("20260615T080000");
    expect(d.metaValue).toBe("15 · Junho");
  });

  it("formata dezembro e domingo corretamente", () => {
    const d = derivarDatasEvento("2026-12-06"); // domingo
    expect(d.metaValue).toBe("06 · Dezembro");
    expect(d.metaSub).toBe("2026 · Domingo");
    expect(d.sidebarValue).toBe("06 · Dez · 2026");
  });
});
```

- [ ] **Step 2: Rodar o teste — falha (função não existe)**

Run: `pnpm --filter @ntc/web exec vitest run lib/cms/derivarDatasEvento.test.ts`
Expected: FAIL (módulo não encontrado).

- [ ] **Step 3: Implementar**

Criar `apps/web/lib/cms/derivarDatasEvento.ts`:

```ts
/**
 * Deriva todos os formatos de data exibidos numa página de evento online a
 * partir de uma data ISO (campo dataInicio do CMS). Não depende do locale do
 * runtime — usa tabelas literais pt-BR (noUncheckedIndexedAccess seguro).
 *
 * Horários do evento (08h–18h) são fixos nesta v1 (não vêm do CMS).
 */

export interface DatasDerivadasEvento {
  metaValue: string; // "15 · Junho"
  metaSub: string; // "2026 · Segunda-feira"
  timelineDiaHtml: string; // "15 de <em>Junho</em> · Segunda-feira"
  sidebarValue: string; // "15 · Jun · 2026"
  dataEvento: string; // "15 de junho de 2026"
  deadlineISO: string; // "2026-06-15T23:59:59-03:00"
  countdownDateText: string; // "Até 15 de Junho de 2026"
  icsStart: string; // "20260615T080000"
  icsEnd: string; // "20260615T180000"
}

const MESES_LONGOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;
const MESES_CURTOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;
// getUTCDay(): 0=domingo ... 6=sábado
const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
] as const;

export function derivarDatasEvento(iso: string): DatasDerivadasEvento {
  // Extrai Y-M-D do ISO sem depender de fuso (pega os 10 primeiros chars).
  const ymd = iso.slice(0, 10);
  const [aStr, mStr, dStr] = ymd.split("-");
  const ano = aStr ?? "2026";
  const mesIdx = (Number(mStr ?? "1") - 1 + 12) % 12;
  const diaNum = Number(dStr ?? "1");
  const dia2 = String(diaNum).padStart(2, "0");

  // Dia da semana via Date UTC (meio-dia evita drift de fuso).
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  const diaSemana = DIAS_SEMANA[dow] ?? "Segunda-feira";

  const mesLongo = MESES_LONGOS[mesIdx] ?? "Junho";
  const mesCurto = MESES_CURTOS[mesIdx] ?? "Jun";
  const mesMinusculo = mesLongo.toLowerCase();
  const compactaIcs = `${ano}${mStr?.padStart(2, "0") ?? "06"}${dia2}`;

  return {
    metaValue: `${dia2} · ${mesLongo}`,
    metaSub: `${ano} · ${diaSemana}`,
    timelineDiaHtml: `${dia2} de <em>${mesLongo}</em> · ${diaSemana}`,
    sidebarValue: `${dia2} · ${mesCurto} · ${ano}`,
    dataEvento: `${diaNum} de ${mesMinusculo} de ${ano}`,
    deadlineISO: `${ymd}T23:59:59-03:00`,
    countdownDateText: `Até ${dia2} de ${mesLongo} de ${ano}`,
    icsStart: `${compactaIcs}T080000`,
    icsEnd: `${compactaIcs}T180000`,
  };
}
```

- [ ] **Step 4: Rodar o teste — passa**

Run: `pnpm --filter @ntc/web exec vitest run lib/cms/derivarDatasEvento.test.ts`
Expected: PASS (3 testes).

> Nota: `dataEvento` usa `diaNum` sem zero à esquerda ("15 de junho"), enquanto os demais usam `dia2` ("15 ·"). Confere com o estático atual (`"15 de junho de 2026"`). Para dia <10, `dataEvento` fica "6 de dezembro" e meta "06 · Dezembro" — coerente com o padrão do projeto.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/cms/derivarDatasEvento.ts apps/web/lib/cms/derivarDatasEvento.test.ts
git commit -m "$(cat <<'EOF'
feat(cms): adiciona derivarDatasEvento (ISO -> formatos pt-BR do evento)

Deriva meta-bar, timeline, sidebar, countdown e ICS a partir de uma data ISO,
sem depender de locale do runtime. Com testes.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `overrideEventoOnline.ts` (busca CMS + aplica override)

**Files:**
- Create: `apps/web/lib/cms/overrideEventoOnline.ts`

> Sem teste unitário (depende do Payload/IO); validado no build + smoke (Task 6). A função pura de derivação já é testada na Task 1.

- [ ] **Step 1: Implementar**

Criar `apps/web/lib/cms/overrideEventoOnline.ts`:

```ts
import type { EventoOnline } from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";

import { obterPayload } from "../payloadClient";
import { derivarDatasEvento } from "./derivarDatasEvento";

/**
 * Override de evento ONLINE via CMS. A página renderiza o evento estático
 * (conteúdo validado); o CMS casa por slug e sobrescreve SÓ capa, data e o
 * folder PDF. Sem registro / sem campo / CMS fora do ar → retorna o evento
 * estático intacto (fallback silencioso).
 */

interface OverrideEvento {
  coverUrl?: string;
  dataInicioISO?: string;
  folderUrl?: string;
}

type UploadComUrl = { url?: string | null } | string | number | null | undefined;

function urlDoUpload(v: UploadComUrl): string | undefined {
  if (v && typeof v === "object" && "url" in v && v.url) return v.url;
  return undefined;
}

export async function buscarOverride(slug: string): Promise<OverrideEvento | null> {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "eventos",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });
    const doc = res.docs[0] as
      | { imagemCapa?: UploadComUrl; dataInicio?: string; folderPdf?: UploadComUrl }
      | undefined;
    if (!doc) return null;
    return {
      coverUrl: urlDoUpload(doc.imagemCapa),
      dataInicioISO: doc.dataInicio,
      folderUrl: urlDoUpload(doc.folderPdf),
    };
  } catch (err) {
    console.error("[agenda] buscarOverride falhou, usando estático:", err);
    return null;
  }
}

export function aplicarOverrideOnline(
  evento: EventoOnline,
  ovr: OverrideEvento,
): EventoOnline {
  let e = evento;

  // 1) Capa → hero bg + sidebar cover
  if (ovr.coverUrl) {
    e = {
      ...e,
      heroOnline: e.heroOnline ? { ...e.heroOnline, bgUrl: ovr.coverUrl } : e.heroOnline,
      sidebarOnline: e.sidebarOnline
        ? { ...e.sidebarOnline, coverImg: ovr.coverUrl }
        : e.sidebarOnline,
    };
  }

  // 2) Data → deriva e sobrescreve todos os formatos
  if (ovr.dataInicioISO) {
    const d = derivarDatasEvento(ovr.dataInicioISO);
    e = {
      ...e,
      dataEvento: d.dataEvento,
      metasOnline: e.metasOnline?.map((m) =>
        m.label === "Quando" ? { ...m, value: d.metaValue, valueSub: d.metaSub } : m,
      ),
      programacaoOnline: e.programacaoOnline
        ? { ...e.programacaoOnline, headDayHtml: d.timelineDiaHtml }
        : e.programacaoOnline,
      sidebarOnline: e.sidebarOnline
        ? {
            ...e.sidebarOnline,
            rows: e.sidebarOnline.rows.map((r) =>
              r.label === "Quando" ? { ...r, value: d.sidebarValue } : r,
            ),
            countdown: {
              ...e.sidebarOnline.countdown,
              dateText: d.countdownDateText,
              deadline: d.deadlineISO,
            },
          }
        : e.sidebarOnline,
      agendaIcs: {
        ...e.agendaIcs,
        startISO: d.icsStart,
        endISO: d.icsEnd,
      },
    };
  }

  // 3) Folder PDF → href do CTA "Baixar folder" (hero cta[1]); sem PDF não mexe
  //    (o layout esconde o CTA quando href === "#" — Task 4).
  if (ovr.folderUrl && e.heroOnline) {
    e = {
      ...e,
      heroOnline: {
        ...e.heroOnline,
        ctas: e.heroOnline.ctas.map((c) =>
          c.cmsLink === "folder-EDUTEC-M01" || /folder/i.test(c.cmsLink ?? "")
            ? { ...c, href: ovr.folderUrl! }
            : c,
        ),
      },
    };
  }

  return e;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (usa `heroOnline.bgUrl` — adicionado na Task 3; rodar Task 3 antes se acusar. Se falhar só por `bgUrl`, seguir para Task 3 e voltar). 

> Para evitar ordem-dependência, **a Task 3 (tipo bgUrl) deve ser feita junto/antes do typecheck final**. Commit desta task pode ocorrer após Task 3. Se preferir, comitar Task 2+3 juntas.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/cms/overrideEventoOnline.ts
git commit -m "$(cat <<'EOF'
feat(cms): adiciona override de evento online (capa/data/folder por slug)

buscarOverride le o registro do CMS; aplicarOverrideOnline sobrescreve capa,
data (derivada) e href do folder no evento estatico. Fallback silencioso.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `HeroOnline.bgUrl?` + layout (hero bg dinâmico + folder some sem href)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx`

- [ ] **Step 1: Adicionar `bgUrl?` ao tipo `HeroOnline`**

Em `conteudoEventos.ts`, localizar `export interface HeroOnline {` e adicionar o campo opcional:

```ts
export interface HeroOnline {
  tags: HeroOnlineTag[];
  h1Html: string;
  sub: string;
  bgUrl?: string;
  programBinding: { texto: string; href: string; cmsLink?: string; nomePrograma: string };
  ctas: LinkInterno[];
}
```

- [ ] **Step 2: Hero bg lê `bgUrl` (fallback p/ a imagem estática)**

Em `EventoOnlineLayout.tsx`, localizar o `.evt-hero-bg` (hoje com `backgroundImage` fixo `area-educacao`). Trocar para usar `hero.bgUrl` quando houver:

```tsx
          <div
            className="evt-hero-bg"
            style={{
              backgroundImage: `url('${hero.bgUrl ?? "/img/fotos/_optimized/area-educacao.1920.webp"}')`,
            }}
            aria-hidden="true"
          />
```

- [ ] **Step 3: "Baixar folder" some quando href é placeholder**

Ainda no hero ctas do layout, o CTA de folder tem `href: "#"` no estático. Filtrar para não renderizar CTAs de folder sem href real. Localizar o `.evt-hero-ctas` map e trocar por uma versão que pula o folder placeholder:

```tsx
            <div className="evt-hero-ctas">
              {hero.ctas
                .filter((cta) => {
                  const ehFolder = /folder/i.test(cta.cmsLink ?? "");
                  return !ehFolder || (cta.href !== "#" && cta.href !== "");
                })
                .map((cta, i) => (
                  <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                    {cta.texto}
                    {cta.arrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
            </div>
```

> O subnav "Baixar folder" vem de `folderCta` (hero ctas[1]); quando filtrado, o `EventoSubnav` recebe `folderHref` "#". O subnav já trata `folderHref="#"` exibindo o botão inerte — manter como está (não é regressão; o protótipo também tem o botão). O CTA do HERO é o que some. (Escopo: esconder o do hero é suficiente para "some sem PDF"; o do subnav é ação fixa do template.)

- [ ] **Step 4: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS. (Agora a Task 2 também compila, pois `bgUrl` existe.)

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts" "apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): hero bg dinamico via bgUrl e esconde 'Baixar folder' sem PDF

HeroOnline.bgUrl opcional permite o override de capa alcancar o hero; o CTA de
folder do hero some quando o href e placeholder (sem PDF no CMS).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Wiring do override no `page.tsx`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`

- [ ] **Step 1: Importar o override**

Após os imports existentes, adicionar:

```ts
import { aplicarOverrideOnline, buscarOverride } from "@/lib/cms/overrideEventoOnline";
```

- [ ] **Step 2: Aplicar override no caso online**

Localizar o `switch (evento.formato)`. Trocar o caso online para aplicar override antes de renderizar:

```ts
    case "online": {
      const ovr = await buscarOverride(slug);
      const eventoFinal = ovr ? aplicarOverrideOnline(evento, ovr) : evento;
      return <EventoOnlineLayout evento={eventoFinal} />;
    }
```

> `evento` no caso online já está estreitado para `EventoOnline` pelo switch. O `slug` está disponível (vem de `await params`).

- [ ] **Step 3: Typecheck + build**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): aplica override do CMS no evento online (capa/data/folder)

Busca por slug no CMS e sobrescreve capa, data e folder antes de renderizar.
Sem registro -> estatico puro (fallback).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Campo `folderPdf` em `Eventos` + seed EDUTEC + schema push + run

**Files:**
- Modify: `apps/cms/src/collections/Eventos.ts`
- Create: `apps/cms/src/seed/seedEventoEdutecM01.ts`
- Modify: `apps/cms/package.json`, `package.json`

- [ ] **Step 1: Adicionar campo `folderPdf` à coleção `Eventos`**

Em `apps/cms/src/collections/Eventos.ts`, na aba "Inscrição" (perto de `linkInscricaoExterna`) OU na aba "Pós-evento", adicionar:

```ts
{
  name: "folderPdf",
  type: "upload",
  relationTo: "media",
  required: false,
  admin: {
    description:
      "PDF do folder do evento. Quando preenchido, o botão 'Baixar folder' da página passa a baixar este arquivo.",
  },
},
```

(`media` já aceita `application/pdf` — confirmado em `collections/Media.ts`.)

- [ ] **Step 2: Criar o seed idempotente do EDUTEC**

Criar `apps/cms/src/seed/seedEventoEdutecM01.ts` (espelha o padrão de `seedHomeV3.ts`):

```ts
/**
 * Seed do evento EDUTEC Módulo 01 no CMS — registro de índice.
 *
 * A PÁGINA continua servida do estático (conteudoEventos.ts). Este registro
 * existe para: (a) listar o evento no admin/índice; (b) permitir editar capa,
 * data e folder PDF (override por slug). Idempotente por slug.
 *
 * Execução: pnpm payload:seed:edutec
 */
import { getPayload } from "payload";

import config from "../payload.config";

async function run() {
  const payload = await getPayload({ config });

  const slug = "edutec-m01-2026";

  // Resolve relacionamentos por chave natural.
  const programaRes = await payload.find({
    collection: "programas",
    where: { sigla: { equals: "EDUTEC" } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  const areaRes = await payload.find({
    collection: "areas",
    where: { sigla: { equals: "edu" } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  // imagemCapa é required: usa uma media existente como capa inicial.
  const capaRes = await payload.find({
    collection: "media",
    where: { filename: { contains: "area-educacao" } },
    limit: 1,
    overrideAccess: true,
  });

  const programaId = programaRes.docs[0]?.id;
  const areaId = areaRes.docs[0]?.id;
  const capaId = capaRes.docs[0]?.id;

  if (!areaId) throw new Error("[seed:edutec] Área 'edu' não encontrada — rode o seed base antes.");
  if (!capaId) throw new Error("[seed:edutec] Nenhuma media 'area-educacao' encontrada — rode os seeds de imagem antes.");

  const data = {
    slug,
    nome: "Cultura Digital, Educação Midiática e Transformação da Educação",
    eyebrow: "Seminário · NTC Educação",
    area: areaId,
    ...(programaId ? { programa: programaId } : {}),
    imagemCapa: capaId,
    dataInicio: "2026-06-15",
    modalidade: "online" as const,
    cargaHoraria: "8 horas",
    resumo:
      "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    inscricaoAberta: true,
  } as never;

  const existing = await payload.find({
    collection: "eventos",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });

  if (existing.docs.length > 0) {
    const id = existing.docs[0]!.id;
    await payload.update({ collection: "eventos", id, data, overrideAccess: true, draft: true });
    payload.logger.info(`[seed:edutec] Evento atualizado: ${slug} (id=${id}).`);
  } else {
    const created = await payload.create({ collection: "eventos", data, overrideAccess: true, draft: true });
    payload.logger.info(`[seed:edutec] Evento criado: ${slug} (id=${created.id}).`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Adicionar os scripts de seed**

Em `apps/cms/package.json`, ao lado de `payload:seed:home-v3`, adicionar:

```json
    "payload:seed:edutec": "pnpm payload run src/seed/seedEventoEdutecM01.ts",
```

Na raiz `package.json`, ao lado de `payload:seed:home-v3`, adicionar:

```json
    "payload:seed:edutec": "pnpm --filter @ntc/cms payload:seed:edutec",
```

- [ ] **Step 4: Typecheck (web + cms) e regenerar tipos do Payload**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm payload:generate`
Expected: regenera `payload-types.ts` incluindo `folderPdf` em Eventos. (Se falhar por DB, o generate de tipos não precisa do banco — mas se exigir, seguir para o push no Step 5.)

- [ ] **Step 5: Aplicar schema (push) — coordenado, autônomo**

O push acontece quando o servidor do Payload sobe. Antes, checar se a porta 3001 (CMS) está ocupada pela sessão paralela:

```bash
cd /Users/joao/Documents/portal-ntc
if lsof -ti tcp:3001 >/dev/null 2>&1; then
  echo "CMS ja rodando na 3001 (outra sessao). Vou usar a instancia existente para o seed."
else
  echo "3001 livre. O seed sobe o Payload e aplica o schema (push) automaticamente."
fi
```

- [ ] **Step 6: Rodar o seed (aplica schema + cria registro)**

Run: `pnpm payload:seed:edutec`
Expected: log `[seed:edutec] Evento criado: edutec-m01-2026 (id=...)` (ou "atualizado"). O push do schema (coluna `folder_pdf_id`) ocorre na inicialização do Payload run. Se o push pedir confirmação interativa, responder de forma a aplicar (autonomia total). Rodar 2× para confirmar idempotência (segunda vez = "atualizado", sem erro).

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/collections/Eventos.ts apps/cms/src/seed/seedEventoEdutecM01.ts apps/cms/package.json package.json
# payload-types.ts é versionado em packages/types/src — adicionar se mudou:
git add packages/types/src/payload-types.ts 2>/dev/null || true
git commit -m "$(cat <<'EOF'
feat(cms): campo folderPdf em Eventos + seed do registro EDUTEC M01

Adiciona upload de folder PDF (relationTo media, que ja aceita pdf) e um seed
idempotente que cria o registro EDUTEC no CMS (titulo, programa, modalidade
online, data, area, resumo) para indice e override de capa/data/folder.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Validação

**Files:** nenhum.

- [ ] **Step 1: Suite de qualidade**

Run: `pnpm typecheck && pnpm lint && pnpm --filter @ntc/web exec vitest run lib/cms/derivarDatasEvento.test.ts`
Expected: typecheck/lint PASS; 3 testes PASS.

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: PASS; `/agenda/edutec-m01-2026` gerado.

- [ ] **Step 3: Dev server + smoke**

Run (bg): `pnpm --filter @ntc/web exec next dev --port 3000`
Após responder:
```bash
cd /Users/joao/Documents/portal-ntc
for i in $(seq 1 30); do c=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 http://localhost:3000/agenda/edutec-m01-2026 2>/dev/null); [ "$c" = "200" ] && { echo "ok ${i}"; break; }; done
curl -sS -o /dev/null -w "edutec: %{http_code}\n" --max-time 20 http://localhost:3000/agenda/edutec-m01-2026
```
Expected: 200. A página deve refletir a data do CMS (2026-06-15 → "15 · Junho") OU, se o seed gravou a mesma data do estático, permanecer consistente. Conferir no HTML que a capa do CMS (URL do Supabase) aparece no hero/sidebar quando houver registro.

- [ ] **Step 4: Teste de override real (manual via admin — registrar instrução)**

Resumir para o usuário: abrir o admin do CMS, no evento `edutec-m01-2026`, trocar `imagemCapa`, `dataInicio` e subir um `folderPdf`; recarregar a página e ver capa nova, data derivada nos formatos e o botão "Baixar folder" baixando o PDF. Sem `folderPdf` → botão some.

- [ ] **Step 5: Encerrar dev server e resumir**

Encerrar dev server. Resumo da sessão (≤10 linhas).

---

## Self-Review

**1. Spec coverage:**
- Editar capa/data/folder pelo CMS → Task 2 (override) + Task 5 (campo folderPdf). ✓
- Data: 1 campo, derivo formatos → Task 1 (derivar) + Task 2 (aplica). ✓
- Reusar coleção Eventos → Task 5 (sem Folders; Media já aceita PDF). ✓
- Botão folder some sem PDF → Task 3 (filtro CTA hero). ✓
- Registro no CMS com metadados → Task 5 (seed). ✓
- Criação programática (seed) → Task 5. ✓
- Casa por slug, CMS só sobrescreve 3 campos → Task 2 (aplicarOverrideOnline só toca capa/data/folder). ✓
- Fallback estático → Task 2 (buscarOverride try/catch → null; page usa estático). ✓
- Só online → Task 4 (override só no case online). ✓
- Schema push coordenado → Task 5 Step 5. ✓

**2. Placeholder scan:** sem TBD. Código completo em cada step. Teste real (não "escreva testes").

**3. Type consistency:**
- `DatasDerivadasEvento` (Task 1) consumido em Task 2 com os mesmos campos. ✓
- `OverrideEvento {coverUrl?,dataInicioISO?,folderUrl?}` def Task 2, usado Task 2/4. ✓
- `HeroOnline.bgUrl?` def Task 3, usado Task 2 (aplicarOverride) e Task 3 (layout). ✓
- `buscarOverride`/`aplicarOverrideOnline` nomes idênticos Task 2↔4. ✓
- Seed usa shape de `eventos` igual ao seedHomeV3 (slug/nome/area/programa/imagemCapa/dataInicio/modalidade/cargaHoraria/resumo/inscricaoAberta). ✓
- `imagemCapa` required tratado (resolve media area-educacao). ✓

Consistente. Pronto.
