# CMS Eventos — Template genérico (Sessão 3a) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a página `/agenda/[slug]` renderizar QUALQUER evento cadastrado no CMS (coleção `eventos`), pela estrutura do template existente — de modo que criar um evento no admin vire uma página automaticamente, com seções de campo vazio ocultadas e fallback para o conteúdo estático atual.

**Architecture:** Replica o padrão do Corpo Docente (sessões 1-2): um loader+adapter (`apps/web/lib/cms/eventos.ts`) lê o evento do CMS via Payload Local API, adapta para o tipo `Evento` que `EventoPresencialLayout` já consome (preenchendo "chrome" de layout com constantes/derivações e ocultando seções sem dado), e a `page.tsx` passa a buscar do CMS com fallback para `EVENTOS_AGENDA` estático. Sem seed de conteúdo — o usuário abastece cada evento pelo admin.

**Tech Stack:** Payload CMS 3.18 (Postgres/Supabase), Next.js 15 App Router (ISR), TypeScript strict, Payload Local API.

**Spec:** `docs/superpowers/specs/2026-06-01-cms-eventos-palestrantes-design.md`

---

## Contexto verificado (não re-investigar)

- **Coleção `eventos`** já existe e está no admin (`apps/cms/src/collections/Eventos.ts`, `group: Editorial`, 47 campos). 3 eventos cadastrados (`agip-sp-junho-2026` híbrido, `pear-online-maio-2026`, `prosus-mais-brasilia-2026-junho`), todos `_status: draft`, em sua maioria com campos ricos vazios (`palestrantes:0`, `programacaoDetalhada:0`, `faq:0`).
- **Tipo local** `Evento` em `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`. Discriminado por `formato: "presencial"|"hibrido"|"online"`. `EVENTOS_AGENDA` tem só `"prosus-brasilia"`.
- **page.tsx** (`apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`): hoje lê de `EVENTOS_AGENDA`; só renderiza `presencial` (híbrido/online → `notFound()`). `export const revalidate = 3600`.
- **Layout** `EventoPresencialLayout.tsx` consome o tipo `Evento` e renderiza `.speaker-detail-card` a partir de `evento.palestrantes.palestrantes[]` (`{foto, role, nome, credenciais}`).
- **payloadClient** do web: `obterPayload()` em `apps/web/lib/payloadClient.ts`.
- **lexicalToHtml**: helper de richText→HTML existe em `apps/web/lib/cms/corpoDocente.ts` (linhas ~356+); será extraído para reuso.
- **Tipos Payload** gerados em `packages/types/src/payload-types.ts` (`Evento`, `Especialista`, `Media` com `.url`).
- **Foto do Especialista**: `urlDaFoto` usa `(foto as Media).url` (URL pública Supabase). Mapeamento card: `role`←`instituicao`, `nome`←`nome`, `credenciais`←`curriculoCurto`(texto).
- **Híbrido**: o AGIP é `hibrido`. `EventoHibrido` e `EventoPresencial` compartilham `local`. Esta 3a usa `EventoPresencialLayout` para ambos `presencial` e `hibrido` (mesmo layout; `online` permanece fora).

---

## File Structure

- **Create:** `apps/web/lib/cms/lexical.ts` — helper `lexicalToHtml` extraído de `corpoDocente.ts` para reuso (DRY).
- **Modify:** `apps/web/lib/cms/corpoDocente.ts` — passa a importar `lexicalToHtml` de `./lexical` (remove a cópia local).
- **Create:** `apps/web/lib/cms/eventos.ts` — loader `fetchEvento(slug)` + adapter `adaptarEvento(cms)` → tipo `Evento`. Constantes de "chrome" de seção. Ocultação de seções vazias.
- **Modify:** `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` — `async`: busca no CMS com fallback `EVENTOS_AGENDA`; `generateStaticParams` une slugs CMS+estáticos; roteia `hibrido` para `EventoPresencialLayout`.
- **Modify:** `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx` — guards para ocultar seções cujo conteúdo veio vazio do adapter (somente onde ainda não houver guard).
- **Modify:** `apps/cms/src/collections/Eventos.ts` — corrige `revalidatePage` para o path correto da rota (`/agenda/:slug`, não `/eventos/:slug`).

**Princípio:** o adapter isola TODO o conhecimento "shape CMS → shape local". O layout só ganha guards de render. A page só troca a fonte de dados. Cada arquivo tem uma responsabilidade.

---

## Task 1: Extrair `lexicalToHtml` para módulo reutilizável

**Files:**
- Create: `apps/web/lib/cms/lexical.ts`
- Modify: `apps/web/lib/cms/corpoDocente.ts`

- [ ] **Step 1: Criar `apps/web/lib/cms/lexical.ts`**

Copiar as funções `lexicalToHtml`, `serializarNode`, `aplicarFormato` de `corpoDocente.ts` (linhas ~356-390) para o novo arquivo, exportando `lexicalToHtml`:

```typescript
/**
 * Converte um documento richText Lexical (Payload) para HTML simples.
 * Suporta paragraph, heading, linebreak, text com bold/italic.
 * Extraído de corpoDocente.ts para reuso (corpo-docente + eventos).
 */
export function lexicalToHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  return root.children.map(serializarNode).join("");
}

function serializarNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const tipo = n.type;
  if (tipo === "linebreak") return "<br>";
  if (tipo === "text") return aplicarFormato(String(n.text ?? ""), Number(n.format ?? 0));
  if (tipo === "paragraph" || tipo === "heading") {
    const children = Array.isArray(n.children) ? n.children.map(serializarNode).join("") : "";
    return children;
  }
  if (Array.isArray(n.children)) return n.children.map(serializarNode).join("");
  return "";
}

function aplicarFormato(texto: string, format: number): string {
  let html = texto;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  return html;
}
```

- [ ] **Step 2: Substituir a cópia local em `corpoDocente.ts`**

Remover as 3 funções (`lexicalToHtml`, `serializarNode`, `aplicarFormato`) de `corpoDocente.ts` e adicionar no topo de imports:

```typescript
import { lexicalToHtml } from "./lexical";
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/web typecheck`
Expected: PASS (corpoDocente.ts continua usando `lexicalToHtml`, agora importado).

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/cms/lexical.ts apps/web/lib/cms/corpoDocente.ts
git commit -m "refactor(cms): extrai lexicalToHtml para lib/cms/lexical (reuso eventos)"
```

---

## Task 2: Criar o adapter `eventos.ts` — esqueleto + campos diretos

**Files:**
- Create: `apps/web/lib/cms/eventos.ts`

- [ ] **Step 1: Criar o arquivo com loader + adapter mínimo (campos diretos)**

```typescript
/**
 * Loader + adapter da coleção Eventos.
 *
 * fetchEvento(slug) lê 1 evento do CMS via Payload Local API (depth=2 para
 * popular palestrantes → foto). adaptarEvento transforma o doc do CMS no
 * tipo `Evento` local que EventoPresencialLayout consome.
 *
 * Seções sem dado no CMS são marcadas para ocultação (campos com `_vazio`).
 * "Chrome" de layout (eyebrows, navLinks, crumb) vem de constantes locais.
 *
 * Server-only.
 */
import type { Evento as EventoCMS, Especialista, Media } from "@ntc/types/payload-types";

import { obterPayload } from "../payloadClient";
import { lexicalToHtml } from "./lexical";
import type {
  Evento,
  Palestrante,
} from "../../app/(capacitacao)/agenda/[slug]/conteudoEventos";

export async function fetchEvento(slug: string): Promise<Evento | null> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "eventos",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  });
  const doc = res.docs[0] as EventoCMS | undefined;
  if (!doc) return null;
  return adaptarEvento(doc);
}

function urlDaFoto(foto: unknown): string {
  if (typeof foto === "object" && foto !== null) return (foto as Media).url ?? "";
  return "";
}

function adaptarPalestrantes(doc: EventoCMS): Palestrante[] {
  const rel = Array.isArray(doc.palestrantes) ? doc.palestrantes : [];
  return rel
    .map((p): Palestrante | null => {
      if (typeof p !== "object" || p === null) return null;
      const esp = p as Especialista;
      return {
        foto: urlDaFoto(esp.foto),
        role: esp.instituicao ?? "",
        nome: esp.nome ?? "",
        credenciais: lexicalToHtml(esp.curriculoCurto),
      };
    })
    .filter((p): p is Palestrante => p !== null);
}
```

- [ ] **Step 2: Typecheck (vai falhar — adaptarEvento ainda não existe)**

Run: `pnpm --filter @ntc/web typecheck`
Expected: FAIL — `adaptarEvento` referenciado em `fetchEvento` mas não definido. Confirma que o arquivo está sendo checado.

- [ ] **Step 3: Commit do esqueleto (após Task 3 completar adaptarEvento)** — NÃO commitar ainda; seguir para Task 3.

---

## Task 3: Implementar `adaptarEvento` — mapeamento completo com ocultação de vazios

**Files:**
- Modify: `apps/web/lib/cms/eventos.ts`

- [ ] **Step 1: Adicionar constantes de chrome + helper de "seção vazia"**

Adicionar em `eventos.ts` (acima de `fetchEvento`):

```typescript
// Chrome de layout que não vem do CMS (texto fixo do template editorial).
const CHROME = {
  palestrantesEyebrow: "Quem conduz",
  palestrantesH2: "Palestrantes",
  palestrantesIntro: "",
  palestrantesNota: "",
} as const;

// Converte richText → HTML; "" quando vazio.
function htmlOuVazio(doc: unknown): string {
  return lexicalToHtml(doc);
}

// Marca de seção vazia: o layout oculta quando string vazia / array vazio.
function temConteudo(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
```

- [ ] **Step 2: Implementar `adaptarEvento`**

Adicionar a função. Mapeia campos do CMS para o tipo `Evento`, derivando chrome e marcando seções vazias. (Campos do tipo local que não existem no CMS — `crumb`, `metas`, `navLinks`, `sidebar`, `relatedEvents`, `agendaIcs` — recebem valores derivados/mínimos; seções de conteúdo vazias ficam com arrays/strings vazios para o layout ocultar.)

```typescript
function adaptarEvento(doc: EventoCMS): Evento {
  const formato = doc.modalidade === "online" ? "online" : doc.modalidade === "hibrido" ? "hibrido" : "presencial";

  const palestrantesArr = adaptarPalestrantes(doc);

  const base = {
    slug: doc.slug ?? "",
    titulo: doc.nome ?? "",
    subtitulo: doc.resumo ?? "",
    formato,
    dataEvento: doc.dataInicio ?? "",
    area: (doc.area ?? "educacao") as Evento["area"],
    crumb: [],
    hero: {
      eyebrow: doc.eyebrow ?? "",
      titulo: doc.nome ?? "",
      subtitulo: doc.resumo ?? "",
    } as Evento["hero"],
    metas: [],
    navLinks: [],
    visaoGeral: {
      eyebrow: "Visão geral",
      h2: "Sobre o evento",
      corpoHtml: htmlOuVazio(doc.publicoAlvo),
    } as Evento["visaoGeral"],
    publico: { eyebrow: "Público", h2: "Para quem é", corpoHtml: htmlOuVazio(doc.publicoAlvo) } as Evento["publico"],
    objetivos: { eyebrow: "Objetivos", h2: "O que você alcança", corpoHtml: htmlOuVazio(doc.objetivos) } as Evento["objetivos"],
    conteudoProgramatico: { eyebrow: "Conteúdo", h2: "Conteúdo programático", corpoHtml: htmlOuVazio(doc.conteudoProgramatico) } as Evento["conteudoProgramatico"],
    programacao: { eyebrow: "Programação", h2: "Programação", intro: "", dias: [] } as unknown as Evento["programacao"],
    palestrantes: {
      eyebrow: CHROME.palestrantesEyebrow,
      h2: CHROME.palestrantesH2,
      intro: CHROME.palestrantesIntro,
      palestrantes: palestrantesArr,
      nota: CHROME.palestrantesNota,
    },
    diferenciais: {
      eyebrow: "Diferenciais",
      h2: "Diferenciais",
      diferenciais: (Array.isArray(doc.diferenciais) ? doc.diferenciais : []).map((d, i) => ({
        num: String(i + 1).padStart(2, "0"),
        titulo: (d as { titulo?: string }).titulo ?? "",
        descricao: (d as { descricao?: string }).descricao ?? "",
      })),
    } as Evento["diferenciais"],
    replayCert: { eyebrow: "", h2: "", cards: [] } as unknown as Evento["replayCert"],
    investimento: { eyebrow: "Investimento", h2: "Investimento", corpoHtml: "" } as unknown as Evento["investimento"],
    faq: {
      eyebrow: "FAQ",
      h2: "Perguntas frequentes",
      itens: (Array.isArray(doc.faq) ? doc.faq : []).map((f, i) => ({
        id: `faq-${i}`,
        pergunta: (f as { pergunta?: string }).pergunta ?? "",
        respostaHtml: htmlOuVazio((f as { resposta?: unknown }).resposta),
      })),
    } as unknown as Evento["faq"],
    ctaFinal: { eyebrow: "", h2: "", corpoHtml: "", ctas: [] } as unknown as Evento["ctaFinal"],
    sidebar: {} as Evento["sidebar"],
    relatedEvents: { eyebrow: "", h2: "", intro: "", cards: [], footerCtas: [] } as unknown as Evento["relatedEvents"],
    agendaIcs: {
      titulo: doc.nome ?? "",
      descricao: doc.resumo ?? "",
      location: [doc.local?.nomeLocal, doc.local?.cidade, doc.local?.estado].filter(Boolean).join(", "),
      startISO: doc.dataInicio ?? "",
      endISO: doc.dataFim ?? doc.dataInicio ?? "",
      filename: `${doc.slug ?? "evento"}.ics`,
    },
  };

  if (formato === "online") {
    return { ...base, formato: "online" } as Evento;
  }
  return {
    ...base,
    formato,
    local: {
      eyebrow: "Local",
      h2: "Onde acontece",
      venueInfo: {
        titulo: doc.local?.nomeLocal ?? "",
        enderecoLinhas: [doc.local?.endereco, [doc.local?.cidade, doc.local?.estado].filter(Boolean).join(" · ")].filter(Boolean) as string[],
        meta: "",
        hospedagemHtml: "",
      },
      mapLabel: "",
      pinLabel: "",
    },
  } as Evento;
}
```

> **Nota ao implementador:** os `as ... ` e `as unknown as ...` existem porque o tipo local é rico e o CMS preenche um subconjunto. Ao executar, confira contra os tipos reais de `conteudoEventos.ts` (interfaces `SecaoVisaoGeral`, `SecaoProgramacao`, etc.) e ajuste nomes de propriedade (`corpoHtml` vs `intro` vs `dias`) para casar EXATAMENTE — typecheck vai apontar divergências. Não invente propriedades; use as que o tipo declara.

- [ ] **Step 3: Typecheck e ajustar propriedades**

Run: `pnpm --filter @ntc/web typecheck`
Expected: pode falhar apontando nomes de propriedade que não batem (ex: `itens` vs `faqs`). Corrigir cada um lendo a interface real em `conteudoEventos.ts`. Repetir até PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/cms/eventos.ts
git commit -m "feat(cms): adapter eventos.ts — CMS Evento para tipo local (palestrantes + campos)"
```

---

## Task 4: Guards de ocultação no `EventoPresencialLayout`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx`

- [ ] **Step 1: Localizar as seções que renderizam conteúdo opcional**

Run: `grep -n 'event-section\|palestrantes\|programacao\|faq\|diferenciais\|replayCert\|relatedEvents' "apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx"`

Expected: ver os `<article className="event-section...">` de cada seção.

- [ ] **Step 2: Adicionar guard de render por seção vazia**

Para CADA seção cujo dado pode vir vazio do CMS, envolver o `<article>` num curto-circuito. Exemplo para palestrantes (repetir o padrão para programacao.dias, faq.itens, diferenciais.diferenciais, relatedEvents.cards, replayCert.cards):

```tsx
{evento.palestrantes.palestrantes.length > 0 && (
  <article className="event-section fade-in" id="palestrantes">
    {/* ...conteúdo existente... */}
  </article>
)}
```

Para seções baseadas em richText (`corpoHtml`), o guard é `evento.visaoGeral.corpoHtml && ( ... )`.

> **Nota:** só adicionar guard onde NÃO existir. Algumas seções podem já ter conteúdo sempre presente (hero, agendaIcs) — não envolver essas. Preservar todo o markup interno intacto (fidelidade ao protótipo).

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx"
git commit -m "feat(eventos): oculta seções sem conteúdo no layout do evento"
```

---

## Task 5: `page.tsx` lê do CMS com fallback + roteia híbrido

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`

- [ ] **Step 1: Importar o loader e ajustar `EventoPage`**

Adicionar import:
```typescript
import { fetchEvento } from "@/lib/cms/eventos";
```

Substituir o corpo de `EventoPage`:

```typescript
export default async function EventoPage({ params }: PageProps) {
  const { slug } = await params;

  const evento =
    (await fetchEvento(slug).catch((err) => {
      console.error("[agenda] fetch CMS falhou, usando fallback:", err);
      return null;
    })) ?? EVENTOS_AGENDA[slug];

  if (!evento) notFound();

  switch (evento.formato) {
    case "presencial":
    case "hibrido":
      return <EventoPresencialLayout evento={evento} />;
    case "online":
      notFound();
  }
}
```

- [ ] **Step 2: `generateStaticParams` une slugs CMS + estáticos**

Substituir a função por uma versão async que busca slugs do CMS e mescla com os estáticos (dedup):

```typescript
export async function generateStaticParams() {
  const estaticos = Object.keys(EVENTOS_AGENDA);
  try {
    const { obterPayload } = await import("@/lib/payloadClient");
    const payload = await obterPayload();
    const res = await payload.find({ collection: "eventos", limit: 100, depth: 0 });
    const doCms = res.docs.map((d) => (d as { slug?: string }).slug).filter((s): s is string => !!s);
    return Array.from(new Set([...estaticos, ...doCms])).map((slug) => ({ slug }));
  } catch {
    return estaticos.map((slug) => ({ slug }));
  }
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm --filter @ntc/web typecheck && pnpm --filter @ntc/web exec eslint "app/(capacitacao)/agenda/[slug]/page.tsx"`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/page.tsx"
git commit -m "feat(eventos): page /agenda/[slug] lê do CMS com fallback estático"
```

---

## Task 6: Corrigir path de revalidação da coleção Eventos

**Files:**
- Modify: `apps/cms/src/collections/Eventos.ts`

- [ ] **Step 1: Localizar o hook**

Run: `grep -n "revalidatePage\|afterChange" apps/cms/src/collections/Eventos.ts`
Expected: `afterChange: [revalidatePage(["/agenda", "/eventos/:slug"])]` (linha ~33).

- [ ] **Step 2: Corrigir os paths**

A rota real do evento é `/agenda/:slug` (não `/eventos/:slug`). Substituir:

```typescript
    afterChange: [revalidatePage(["/agenda", "/agenda/:slug"])],
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/Eventos.ts
git commit -m "fix(cms): revalidatePage do Evento aponta para /agenda/:slug"
```

---

## Task 7: Verificação end-to-end (build + render real)

**Files:** (sem alterações — verificação)

- [ ] **Step 1: Publicar 1 evento no CMS para teste**

Com o CMS local no ar, no admin: abrir o evento `prosus-mais-brasilia-2026-junho`, selecionar 1-2 palestrantes (qualquer Especialista, para testar o card) e clicar "Publicar alterações". (Ou via script `payload.update` com `_status: published`.)

- [ ] **Step 2: Build da web**

Run: `pnpm --filter @ntc/web build 2>&1 | tail -20`
Expected: PASS. A rota `/agenda/[slug]` aparece; `generateStaticParams` inclui os slugs do CMS (prosus-mais-brasilia-2026-junho, etc.).

- [ ] **Step 3: Subir dev e curl do evento publicado**

Run (background): `pnpm --filter @ntc/web dev`
Aguardar "Ready in". Depois:
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/agenda/prosus-mais-brasilia-2026-junho
curl -s http://localhost:3000/agenda/prosus-mais-brasilia-2026-junho > /tmp/ev.html
echo "titulo do CMS presente: $(grep -c 'Governança, financiamento' /tmp/ev.html)"
echo "palestrantes (fotos supabase): $(grep -oc 'supabase.co.*media' /tmp/ev.html)"
echo "fetch CMS falhou no log? (não deve haver)"
```
Expected: HTTP 200; título vindo do CMS; se selecionou palestrantes, fotos via Supabase; sem "fetch CMS falhou".

- [ ] **Step 4: Verificar ocultação de seção vazia**

No HTML do evento (que tem programacao/faq vazios no CMS), confirmar que essas seções NÃO aparecem:
```bash
echo "seção programação (deve estar ausente se vazia): $(grep -c 'id=\"programacao\"' /tmp/ev.html)"
```
Expected: `0` para seções sem dado.

- [ ] **Step 5: Verificar fallback do PROSUS estático antigo**

```bash
curl -s -o /dev/null -w "prosus-brasilia (estático) HTTP %{http_code}\n" http://localhost:3000/agenda/prosus-brasilia
```
Expected: HTTP 200 (continua servido pelo fallback `EVENTOS_AGENDA`).

- [ ] **Step 6: Sem commit** (verificação).

---

## Task 8: Verificação visual humana

**Files:** (sem alterações)

- [ ] **Step 1: Apresentar ao usuário** (memória `feedback_validacao_visual`)

Deixar dev no ar. Mensagem:

```
🔍 Sanity check — template de Evento via CMS

Servidor: http://localhost:3000/agenda/prosus-mais-brasilia-2026-junho

Confirmar:
- O evento publicado no admin renderiza pela estrutura do template
- Palestrantes selecionados no admin aparecem como cards (foto/nome/role/credencial)
- Seções sem conteúdo no CMS estão ocultas (não aparecem vazias)
- Criar/editar no admin + publicar → reflete na página

Teste do fluxo: criar um evento NOVO no admin, publicar, e abrir /agenda/<novo-slug>.
```

Aguardar aprovação humana.

- [ ] **Step 2: Após aprovação, parar dev. Sem commit.**

---

## Task 9: Lint + typecheck + build final

**Files:** (sem alterações)

- [ ] **Step 1:** `pnpm --filter @ntc/cms lint` — PASS (erro pré-existente `next-env.d.ts` não conta).
- [ ] **Step 2:** `pnpm --filter @ntc/web lint` — PASS.
- [ ] **Step 3:** `pnpm typecheck` — 5/5 PASS.
- [ ] **Step 4:** `pnpm build` — PASS.
- [ ] **Step 5: Resumo final** ao usuário: template de evento via CMS pronto; criar evento no admin = página automática; próximos passos (popular AGIP/PEAR, cadastrar especialistas de Saúde para PROSUS, sessão 3b para campos avançados de layout no CMS).

---

## Self-Review

**1. Cobertura do spec:**
- §4 Arquitetura (loader+adapter+page+fallback) → Tasks 2/3/5.
- §5 Mapeamento do adapter (palestrantes role=instituicao, cred=curriculoCurto) → Task 3 `adaptarPalestrantes`.
- §5.1 Escopo final (3 eventos genéricos, palestrantes no admin, sem seed) → page genérica (Task 5), sem task de seed.
- Ocultar seções vazias (decisão do usuário) → Task 4.
- Revalidação (CMS local → prod via `pnpm revalidar`) → path corrigido na Task 6; fluxo já existe.

**2. Placeholders:** as `as unknown as` na Task 3 são marcadas com nota explícita ao implementador para casar com os tipos reais — não são TODOs vagos, são pontos de ajuste guiados por typecheck.

**3. Consistência de tipos:** `Evento`, `Palestrante` importados de `conteudoEventos.ts`; `fetchEvento`/`adaptarEvento`/`adaptarPalestrantes` consistentes entre Tasks 2-3-5; `lexicalToHtml` (Task 1) usado na Task 3.

**4. Risco conhecido:** o build (`generateStaticParams` + páginas) conecta ao banco no momento do build — em produção (Vercel) já validado que funciona (env vars OK). Em dev local, exige `.env`.

---

*Plano gerado pelo fluxo brainstorming → writing-plans. Escopo: sessão 3a (template genérico). Sessão 3b (campos de layout avançados editáveis: hero/sidebar/metas/relacionados) fica para depois.*
