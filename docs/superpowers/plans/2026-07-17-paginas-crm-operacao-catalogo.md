# Páginas do CRM (Operação Comercial + Catálogo Institucional) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Reorganizar o menu do módulo `/crm` em dois grupos (Operação Comercial · Catálogo Institucional) e criar todas as telas: rename do Dashboard, listas read-only reais (Follow-ups, Programas, Módulos, Produtos/Eventos) e cascas "Em breve" (Propostas, Versões, Envios, Condições).

**Architecture:** Leitores read-only novos em `painelCrm.ts` (padrão Local API já existente) + função pura de follow-ups em `kpisComercial.ts` (TDD). Novas telas são Client Components que recebem dados por prop do `ShellCrm`, alimentado pelo Server Component `page.tsx`. Sem escrita, sem coleção nova, sem push de schema.

**Tech Stack:** Next 15 App Router / React 19 / Payload 3 Local API / Vitest / CSS `pcms-*`.

**Spec:** `docs/superpowers/specs/2026-07-17-paginas-crm-operacao-catalogo-design.md`.

## Global Constraints

- TS strict, sem `any`; `noUncheckedIndexedAccess` (acesso seguro).
- **Nenhuma coleção nova, nenhuma escrita, nenhum `payload:push:schema`.** Só leitura via Local API.
- Nomes das telas EXATOS do modelo: Dashboard Executivo · Clientes · Contatos · Oportunidades · Propostas · Versões · Envios · Follow-ups · Condições (grupo **Operação Comercial**, com **Leads** como 2ª entrada); Programas · Módulos · Produtos / Eventos (grupo **Catálogo Institucional**).
- Ícones lineares funcionais peso 1.5 (CLAUDE.md §3), classe `pcms-nav__ico`.
- Fontes de dado confirmadas: Módulos `comercial{ tituloComercial, valor:number, replay, certificacao }`; Eventos `comercial{ codigo, valor:number }`; Programa **sem** grupo comercial (`sigla`, `nomeCompleto`, `area:number|Area` com `Area.nome`); Follow-ups derivados de oportunidades; Condições **sem fonte** → casca "Em breve".
- Commits em português, Conventional Commits, sem emojis. Sem push.
- Não rodar `pnpm build` com o dev server ativo (memória do projeto). Gates por pacote: `pnpm --filter @ntc/cms typecheck|test|lint|build`.

---

### Task 1: `todosFollowups` em kpisComercial (TDD)

**Files:**
- Modify: `apps/cms/src/lib/cms/kpisComercial.ts`
- Test: `apps/cms/src/lib/cms/kpisComercial.test.ts`

**Interfaces:**
- Consumes: `OportunidadeCrmResumo` (tem `followupISO: string | null`, `status: string`); `STATUS_OPORTUNIDADE_FECHADA` (já importado no arquivo); helper `aberta(o)` já existe no módulo.
- Produces (Task 4 consome): `export function todosFollowups(oportunidades: OportunidadeCrmResumo[]): OportunidadeCrmResumo[]` — TODAS as oportunidades abertas com `followupISO != null`, ordenadas por data ascendente (vencidos/mais próximos primeiro). Diferente de `followupsProximos` (que corta em 7 dias).

- [ ] **Step 1: Escrever o teste (RED).** Acrescentar em `kpisComercial.test.ts`. O factory existente no arquivo é `const opp = (extra: Partial<OportunidadeCrmResumo>): OportunidadeCrmResumo => ({...})` — usar `opp`:

```ts
describe("todosFollowups", () => {
  it("retorna abertas com followup, ordem ascendente, sem limite de 7 dias, excluindo fechadas", () => {
    const ops = [
      opp({ status: "em-negociacao", followupISO: "2026-09-01" }),
      opp({ status: "em-qualificacao", followupISO: "2026-07-20" }),
      opp({ status: "em-negociacao", followupISO: null }),      // sem followup: fora
      opp({ status: "contratada", followupISO: "2026-07-25" }), // fechada: fora
    ];
    expect(todosFollowups(ops).map((o) => o.followupISO)).toEqual(["2026-07-20", "2026-09-01"]);
  });

  it("lista vazia devolve vazio", () => {
    expect(todosFollowups([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm --filter @ntc/cms test -- kpisComercial`
Expected: FAIL — `todosFollowups is not a function`.

- [ ] **Step 3: Implementar** em `kpisComercial.ts` (após `followupsProximos`):

```ts
/** Todas as oportunidades abertas com follow-up marcado, mais próximas primeiro. */
export function todosFollowups(
  oportunidades: OportunidadeCrmResumo[],
): OportunidadeCrmResumo[] {
  return oportunidades
    .filter((o) => aberta(o) && o.followupISO !== null)
    .sort((a, b) => (a.followupISO ?? "").localeCompare(b.followupISO ?? ""));
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm --filter @ntc/cms test -- kpisComercial`
Expected: PASS (suite inteira do arquivo verde).

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/kpisComercial.ts apps/cms/src/lib/cms/kpisComercial.test.ts
git commit -m "feat(crm): funcao todosFollowups para a tela de follow-ups"
```

---

### Task 2: Leitores de catálogo em painelCrm

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrm.ts`

**Interfaces:**
- Consumes: `obterPayload` (já importado); tipos gerados `Programa`, `Modulo`, `Evento` de `@ntc/types` (adicionar ao import de tipos no topo); helpers `idRel`/`campoRel` já existentes.
- Produces (Tasks 4/5 consomem):

```ts
export interface ProgramaCrmResumo { id: string; sigla: string; nome: string; area: string | null; }
export interface ModuloCrmResumo { id: string; numero: number; titulo: string; tituloComercial: string | null; programaSigla: string | null; valor: number | null; replay: string | null; certificacao: string | null; }
export interface ProdutoCrmResumo { id: string; nome: string; codigo: string | null; valor: number | null; }
export function listarProgramasCrm(): Promise<ProgramaCrmResumo[]>;
export function listarModulosCrm(): Promise<ModuloCrmResumo[]>;
export function listarProdutosCrm(): Promise<ProdutoCrmResumo[]>;
```

- [ ] **Step 1: Ampliar o import de tipos** no topo do arquivo:

```ts
import type { ClienteCrm, ContatoCrm, Evento, Modulo, Oportunidade, Programa } from "@ntc/types";
```

- [ ] **Step 2: Adicionar as interfaces** (junto das demais `*Resumo`, antes das funções `listar*`):

```ts
export interface ProgramaCrmResumo {
  id: string;
  sigla: string;
  nome: string;
  area: string | null;
}

export interface ModuloCrmResumo {
  id: string;
  numero: number;
  titulo: string;
  tituloComercial: string | null;
  programaSigla: string | null;
  valor: number | null;
  replay: string | null;
  certificacao: string | null;
}

export interface ProdutoCrmResumo {
  id: string;
  nome: string;
  codigo: string | null;
  valor: number | null;
}
```

- [ ] **Step 3: Adicionar os leitores** (após `obterCatalogoCrm`, seguindo o padrão `draft: true` do catálogo). `Programa.area` é relationship (`number | Area`); com `depth: 1` vem populado, extrair `area.nome` via `campoRel(doc.area, "nome")`. `Modulo.programa` idem (`campoRel(doc.programa, "sigla")`). `comercial` é grupo opcional — acesso seguro com `?.`:

```ts
export async function listarProgramasCrm(): Promise<ProgramaCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "programas", depth: 1, limit: 100, draft: true, sort: "sigla" });
  return res.docs.map((p: Programa) => ({
    id: String(p.id),
    sigla: p.sigla ?? "",
    nome: p.nomeCompleto ?? "",
    area: campoRel(p.area, "nome"),
  }));
}

export async function listarModulosCrm(): Promise<ModuloCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "modulos", depth: 1, limit: 500, draft: true, sort: "numero" });
  return res.docs.map((m: Modulo) => ({
    id: String(m.id),
    numero: m.numero,
    titulo: m.titulo,
    tituloComercial: m.comercial?.tituloComercial ?? null,
    programaSigla: campoRel(m.programa, "sigla"),
    valor: m.comercial?.valor ?? null,
    replay: m.comercial?.replay ?? null,
    certificacao: m.comercial?.certificacao ?? null,
  }));
}

export async function listarProdutosCrm(): Promise<ProdutoCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "eventos", depth: 0, limit: 500, draft: true, sort: "nome" });
  return res.docs.map((e: Evento) => ({
    id: String(e.id),
    nome: e.nome,
    codigo: e.comercial?.codigo ?? null,
    valor: e.comercial?.valor ?? null,
  }));
}
```

- [ ] **Step 4: Verificar**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: verde (sem erro de tipo nos acessos a `comercial`/`area`).

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrm.ts
git commit -m "feat(crm): leitores read-only de programas, modulos e produtos"
```

---

### Task 3: Componentes de tela (TelaEmBreve + 4 listas)

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/TelaEmBreve.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaFollowups.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaProgramas.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaModulos.tsx`
- Create: `apps/cms/src/app/(painel)/crm/TelaProdutos.tsx`

**Interfaces:**
- Consumes: `ProgramaCrmResumo`/`ModuloCrmResumo`/`ProdutoCrmResumo` (Task 2), `OportunidadeCrmResumo` (existente), `formatarMoedaBRL`, `STATUS_OPORTUNIDADE`, `rotuloDeLista`/`seloDeOportunidade` (padrão da `TelaPainelComercial`).
- Produces (Task 4 monta): `TelaEmBreve`, `TelaFollowups`, `TelaProgramas`, `TelaModulos`, `TelaProdutos`.

- [ ] **Step 1: `TelaEmBreve.tsx`** (placeholder reutilizável; segue o cabeçalho `pcms-pagehead` e o selo `pcms-selo--atencao` já existentes):

```tsx
"use client";

interface TelaEmBreveProps {
  eyebrow: string;
  titulo: string;
  descricao: string;
}

/** Placeholder navegável para telas da Fase B (Propostas/Versões/Envios/Condições). */
export function TelaEmBreve({ eyebrow, titulo, descricao }: TelaEmBreveProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">{eyebrow}</p>
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </div>
      <div className="pcms-vazio">
        <span className="pcms-selo pcms-selo--atencao">Em breve</span>
        <p>Esta área faz parte da Fase B do CRM e será liberada em uma próxima entrega.</p>
      </div>
    </>
  );
}
```

- [ ] **Step 2: `TelaFollowups.tsx`** (lista real; reaproveita o idiom da tabela de follow-ups da `TelaPainelComercial`, incluindo `pcms-linha-click` clicável para abrir a oportunidade):

```tsx
"use client";

import type { OportunidadeCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";
import { STATUS_OPORTUNIDADE } from "@ntc/lib";

import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface TelaFollowupsProps {
  followups: OportunidadeCrmResumo[];
  onAbrirOportunidade: (id: string) => void;
}

export function TelaFollowups({ followups, onAbrirOportunidade }: TelaFollowupsProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Follow-ups</h1>
          <p>Todas as oportunidades abertas com follow-up agendado, das mais próximas às futuras.</p>
        </div>
      </div>

      {followups.length === 0 ? (
        <div className="pcms-vazio">Nenhum follow-up agendado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Follow-up</th>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((o) => (
              <tr
                key={o.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                aria-label={`Abrir oportunidade ${o.codigo}`}
                onClick={() => onAbrirOportunidade(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrirOportunidade(o.id);
                  }
                }}
              >
                <td>{o.followupISO?.split("-").reverse().join("/") ?? "—"}</td>
                <td>{o.codigo}</td>
                <td>{o.clienteNome}</td>
                <td>{o.programaSigla ?? "—"}</td>
                <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                <td>
                  <span className={seloDeOportunidade(o.status)}>
                    {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 3: `TelaProgramas.tsx`** (lista sigla/nome/área, sem coluna comercial):

```tsx
"use client";

import type { ProgramaCrmResumo } from "@/lib/cms/painelCrm";

interface TelaProgramasProps {
  programas: ProgramaCrmResumo[];
}

export function TelaProgramas({ programas }: TelaProgramasProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Programas</h1>
          <p>Programas do catálogo institucional (edição no módulo Site).</p>
        </div>
      </div>

      {programas.length === 0 ? (
        <div className="pcms-vazio">Nenhum programa cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome</th>
              <th>Área</th>
            </tr>
          </thead>
          <tbody>
            {programas.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.sigla}</strong></td>
                <td>{p.nome}</td>
                <td>{p.area ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 4: `TelaModulos.tsx`** (destaca campos comerciais):

```tsx
"use client";

import type { ModuloCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaModulosProps {
  modulos: ModuloCrmResumo[];
}

export function TelaModulos({ modulos }: TelaModulosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Módulos</h1>
          <p>Módulos do catálogo com seus dados comerciais de referência.</p>
        </div>
      </div>

      {modulos.length === 0 ? (
        <div className="pcms-vazio">Nenhum módulo cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Título</th>
              <th>Programa</th>
              <th>Valor ref.</th>
              <th>Replay</th>
              <th>Certificação</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((m) => (
              <tr key={m.id}>
                <td>{m.numero}</td>
                <td><strong>{m.tituloComercial ?? m.titulo}</strong></td>
                <td>{m.programaSigla ?? "—"}</td>
                <td>{m.valor !== null ? formatarMoedaBRL(m.valor) : "—"}</td>
                <td>{m.replay ?? "—"}</td>
                <td>{m.certificacao ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 5: `TelaProdutos.tsx`** (código comercial + valor):

```tsx
"use client";

import type { ProdutoCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaProdutosProps {
  produtos: ProdutoCrmResumo[];
}

export function TelaProdutos({ produtos }: TelaProdutosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Produtos / Eventos</h1>
          <p>Produtos comerciais e eventos do catálogo, com código e valor de referência.</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="pcms-vazio">Nenhum produto cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th>Valor ref.</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nome}</strong></td>
                <td>{p.codigo ?? "—"}</td>
                <td>{p.valor !== null ? formatarMoedaBRL(p.valor) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: verde. (Confirmar que `./seloStatus` exporta `rotuloDeLista` e `seloDeOportunidade` — a `TelaPainelComercial` já os importa de lá.)

- [ ] **Step 7: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm/TelaEmBreve.tsx" "apps/cms/src/app/(painel)/crm/TelaFollowups.tsx" "apps/cms/src/app/(painel)/crm/TelaProgramas.tsx" "apps/cms/src/app/(painel)/crm/TelaModulos.tsx" "apps/cms/src/app/(painel)/crm/TelaProdutos.tsx"
git commit -m "feat(crm): telas de follow-ups, catalogo e placeholder em breve"
```

---

### Task 4: Menu em 2 grupos + integração das telas no ShellCrm

**Files:**
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`

**Interfaces:**
- Consumes: telas da Task 3; `todosFollowups` (Task 1); tipos `ProgramaCrmResumo`/`ModuloCrmResumo`/`ProdutoCrmResumo` (Task 2); `GrupoNav` (existente).
- Produces (Task 5 alimenta): `ShellCrmProps` ganha `programas: ProgramaCrmResumo[]`, `modulos: ModuloCrmResumo[]`, `produtos: ProdutoCrmResumo[]`.

- [ ] **Step 1: Imports.** Adicionar em `ShellCrm.tsx`:

```ts
import { todosFollowups } from "@/lib/cms/kpisComercial";
import type { ProgramaCrmResumo, ModuloCrmResumo, ProdutoCrmResumo } from "@/lib/cms/painelCrm";
import { TelaEmBreve } from "./TelaEmBreve";
import { TelaFollowups } from "./TelaFollowups";
import { TelaProgramas } from "./TelaProgramas";
import { TelaModulos } from "./TelaModulos";
import { TelaProdutos } from "./TelaProdutos";
```

(mesclar os `type` no import já existente de `painelCrm` se preferir; manter a ordem de imports do repo: libs → `@/lib` → relativos.)

- [ ] **Step 2: Props.** Estender `ShellCrmProps` com:

```ts
  programas: ProgramaCrmResumo[];
  modulos: ModuloCrmResumo[];
  produtos: ProdutoCrmResumo[];
```

e recebê-los no destructuring da função.

- [ ] **Step 3: `TelaCrmId` e `CRUMB`.** Substituir o type e o CRUMB por (ordem = ordem do menu):

```ts
type TelaCrmId =
  | "painel" | "leads" | "clientes" | "contatos" | "oportunidades"
  | "propostas" | "versoes" | "envios" | "followups" | "condicoes"
  | "programas" | "modulos" | "produtos";

const CRUMB: Record<TelaCrmId, string> = {
  painel: "CRM · Dashboard Executivo",
  leads: "CRM · Leads",
  clientes: "CRM · Clientes",
  contatos: "CRM · Contatos",
  oportunidades: "CRM · Oportunidades",
  propostas: "CRM · Propostas",
  versoes: "CRM · Versões",
  envios: "CRM · Envios",
  followups: "CRM · Follow-ups",
  condicoes: "CRM · Condições",
  programas: "CRM · Programas",
  modulos: "CRM · Módulos",
  produtos: "CRM · Produtos / Eventos",
};
```

- [ ] **Step 4: Ícones novos.** Acrescentar ao objeto `Ico` (SVG lineares peso 1.5, `pcms-nav__ico`). Reutiliza `Ico.painel` para dashboard, `Ico.oportunidades` (losango) para nada novo. Adicionar:

```tsx
  propostas: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h9l3 3v17H6z" /><path d="M14 2v4h4" /><path d="M9 12h6M9 16h6" />
    </svg>
  ),
  versoes: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />
    </svg>
  ),
  envios: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3z" /><path d="m3 6 9 7 9-7" />
    </svg>
  ),
  followups: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" />
    </svg>
  ),
  condicoes: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" />
    </svg>
  ),
  programas: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2 8l10 5 10-5z" /><path d="m6 10.5 6 3 6-3" />
    </svg>
  ),
  modulos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" /><rect x="3" y="10" width="18" height="4" /><rect x="3" y="16" width="18" height="4" />
    </svg>
  ),
  produtos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M12 12 3 7M12 12l9-5M12 12v10" />
    </svg>
  ),
```

- [ ] **Step 5: Grupos do menu.** Substituir a `const NAV_COMERCIAL` e a montagem de `grupos` por dois arrays e dois grupos:

```tsx
const NAV_OPERACAO: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "painel", rotulo: "Dashboard Executivo", icone: Ico.painel },
  { id: "leads", rotulo: "Leads", icone: Ico.leads },
  { id: "clientes", rotulo: "Clientes", icone: Ico.clientes },
  { id: "contatos", rotulo: "Contatos", icone: Ico.contatos },
  { id: "oportunidades", rotulo: "Oportunidades", icone: Ico.oportunidades },
  { id: "propostas", rotulo: "Propostas", icone: Ico.propostas },
  { id: "versoes", rotulo: "Versões", icone: Ico.versoes },
  { id: "envios", rotulo: "Envios", icone: Ico.envios },
  { id: "followups", rotulo: "Follow-ups", icone: Ico.followups },
  { id: "condicoes", rotulo: "Condições", icone: Ico.condicoes },
];

const NAV_CATALOGO: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "programas", rotulo: "Programas", icone: Ico.programas },
  { id: "modulos", rotulo: "Módulos", icone: Ico.modulos },
  { id: "produtos", rotulo: "Produtos / Eventos", icone: Ico.produtos },
];
```

e dentro do componente:

```tsx
  const grupos: GrupoNav[] = [
    { rotulo: "Operação Comercial", itens: NAV_OPERACAO },
    { rotulo: "Catálogo Institucional", itens: NAV_CATALOGO },
  ];
```

- [ ] **Step 6: Renderização das telas.** No bloco final (o `<>…</>` do `else`, onde estão os `tela === "..."`), acrescentar após os existentes:

```tsx
          {tela === "followups" && (
            <TelaFollowups
              followups={todosFollowups(oportunidades)}
              onAbrirOportunidade={abrirOportunidade}
            />
          )}
          {tela === "programas" && <TelaProgramas programas={programas} />}
          {tela === "modulos" && <TelaModulos modulos={modulos} />}
          {tela === "produtos" && <TelaProdutos produtos={produtos} />}
          {tela === "propostas" && (
            <TelaEmBreve eyebrow="Operação Comercial" titulo="Propostas"
              descricao="Geração e gestão de propostas comerciais." />
          )}
          {tela === "versoes" && (
            <TelaEmBreve eyebrow="Operação Comercial" titulo="Versões"
              descricao="Histórico de versões das propostas." />
          )}
          {tela === "envios" && (
            <TelaEmBreve eyebrow="Operação Comercial" titulo="Envios"
              descricao="Registro de envios de propostas aos clientes." />
          )}
          {tela === "condicoes" && (
            <TelaEmBreve eyebrow="Operação Comercial" titulo="Condições"
              descricao="Condições comerciais padrão e específicas." />
          )}
```

- [ ] **Step 7: Verificar**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: verde (o `switch` de telas é exaustivo pelos `&&`; nenhuma `TelaCrmId` fica sem branch — as 4 cascas + 4 listas + 5 existentes cobrem as 13).

- [ ] **Step 8: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm/ShellCrm.tsx"
git commit -m "feat(crm): menu em dois grupos e telas de operacao e catalogo"
```

---

### Task 5: page.tsx busca catálogos e passa ao ShellCrm

**Files:**
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx`

**Interfaces:**
- Consumes: `listarProgramasCrm`/`listarModulosCrm`/`listarProdutosCrm` + tipos (Task 2); props novas do `ShellCrm` (Task 4).

- [ ] **Step 1: Imports.** Adicionar ao import de `painelCrm`:

```ts
  listarProgramasCrm,
  listarModulosCrm,
  listarProdutosCrm,
  type ProgramaCrmResumo,
  type ModuloCrmResumo,
  type ProdutoCrmResumo,
```

- [ ] **Step 2: Estados iniciais** (junto dos demais `let`):

```ts
  let programas: ProgramaCrmResumo[] = [];
  let modulos: ModuloCrmResumo[] = [];
  let produtos: ProdutoCrmResumo[] = [];
```

- [ ] **Step 3: Buscar em paralelo.** Estender o `Promise.all` (adicionar as 3 chamadas ao array e à desestruturação, na mesma ordem):

```ts
    [clientes, contatos, oportunidades, leads, catalogo, usuarios, programas, modulos, produtos] =
      await Promise.all([
        listarClientesCrm(),
        listarContatosCrm(),
        listarOportunidadesCrm(),
        listarLeadsCms(),
        obterCatalogoCrm(),
        listarUsuariosCms(),
        listarProgramasCrm(),
        listarModulosCrm(),
        listarProdutosCrm(),
      ]);
```

- [ ] **Step 4: Passar ao ShellCrm.** Adicionar as props no JSX:

```tsx
      programas={programas}
      modulos={modulos}
      produtos={produtos}
```

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test`
Expected: verde (94+ testes, incluindo o novo `todosFollowups`).

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm/page.tsx"
git commit -m "feat(crm): carrega catalogos comerciais na rota /crm"
```

---

### Task 6: Verificação final e checkpoint

- [ ] **Step 1:** Garantir que NÃO há dev server ativo, então rodar na raiz: `pnpm typecheck && pnpm test && pnpm lint && pnpm build` — tudo verde (warnings pré-existentes de `<img>` aceitos).
- [ ] **Step 2:** `rm -rf apps/cms/.next && pnpm dev:cms`; navegar `http://localhost:3001/crm` (após login): os dois grupos aparecem; Dashboard Executivo funciona; Follow-ups, Programas, Módulos, Produtos/Eventos listam dados reais (ou estado vazio honesto); Propostas/Versões/Envios/Condições mostram "Em breve".
- [ ] **Step 3:** Servidor no ar para validação visual do PO (memória `feedback_validacao_visual`) — não declarar concluído sem o aceite humano.
