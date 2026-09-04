# Janela H · Sessão H1 — Fundação do funil P0 (estágio, situação, histórico e migração)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a coleção `oportunidades` passa a ter os 11 estágios do funil P0 e as 3 situações como campos ortogonais, com histórico imutável de transições e migração revisável dos registros existentes, sem quebrar nenhuma tela do CRM que hoje lê `status`.

**Architecture:** as regras são **funções puras em `packages/lib/src/crm/funil.ts`** (listas, espelho legado e tabela de migração), testadas com Vitest sem banco — mesmo padrão de `crm/propostas.ts`. O Payload consome essas funções em dois hooks finos na coleção `oportunidades`: um `beforeChange` que mantém o campo `status` legado preenchido (para o Dashboard e os gráficos não regredirem antes da Sessão H7) e um `afterChange` que grava a transição na coleção nova `historico-estagio`, append-only por access control. A migração dos registros existentes é um script `payload run` com `DRY_RUN` ligado por padrão, e os casos ambíguos ficam marcados para revisão humana em vez de consolidados como verdade histórica.

**Tech Stack:** TypeScript strict · Payload CMS 3 (postgres adapter, Local API) · Next.js 15 App Router (Server Actions) · Vitest · pnpm workspaces + Turbo.

**Spec:** `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` — §1.1 (modelo do funil), §1.5 (tabela de migração), §2 (distância até o Payload), §4.0 (divergências M1 e M6 do Manual Operacional), Sessão H1 em §4, §5 (manual de migração de dados), §6 (riscos R1–R4).

## Global Constraints

- **TypeScript strict em todo o monorepo. Sem `any`, sem `unknown` quando há tipo conhecido** (`CLAUDE.md` §4.1, §4.4).
- **Nomes em português** para conceitos editoriais/comerciais NTC; inglês só para conceito técnico puro (`CLAUDE.md` §4.2).
- **Componentes `PascalCase.tsx`, utilitários `kebab-case.ts`/`camelCase.ts`, imports absolutos via `@/`** (`CLAUDE.md` §4.2, §4.3).
- **Commits em português, Conventional Commits adaptado, sem emojis** (`CLAUDE.md` §7.2). Exemplo: `feat(crm): adiciona estágio e situação à oportunidade`.
- **Nunca desabilitar check de CI**: sem `// @ts-ignore` e sem `// eslint-disable` sem justificativa declarada ao usuário (`CLAUDE.md` §5.7).
- **`pnpm payload:push:schema` é MANUAL**: dev parado, diff revisado antes, responder `N` a qualquer prompt de `DATA LOSS` (`CLAUDE.md` §14). Nenhum agente roda esse comando sozinho — o plano marca onde parar e chamar o usuário.
- **Nunca rodar `pnpm build` com o dev server no ar** — o `.next` é compartilhado e corrompe (memória do projeto). Parar o dev antes de qualquer build.
- **O campo `status` legado NÃO é removido nesta sessão.** Ele continua sendo gravado como espelho até a Sessão H7 migrar o Dashboard. Remover é sessão própria, posterior.
- **`estagio` e `situacao` nascem nullable.** Só viram `required` depois que a migração rodar (Task 6) — do contrário o push do schema falha nas linhas existentes (`docs/17` §5, passo 4).
- **Valores de select são slugs**, gerados por `opcoes()`/`slugDeRotulo()` de `packages/lib/src/crm/listas.ts`. Nunca gravar o rótulo com acento no banco.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `packages/lib/src/crm/funil.ts` **(criar)** | Listas `ESTAGIO_OPORTUNIDADE`/`SITUACAO_OPORTUNIDADE`, espelho `estagioLegado()` e tabela de migração `planejarMigracaoOportunidade()`. Puro, sem I/O. |
| `packages/lib/src/crm/funil.test.ts` **(criar)** | Testes das três funções acima, incluindo a propriedade de ida-e-volta da migração. |
| `packages/lib/src/index.ts` **(modificar)** | Reexporta o que `apps/cms` consome. |
| `apps/cms/src/lib/crm/historicoEstagio.ts` **(criar)** | `montarTransicaoEstagio()` — decide se há transição e monta o documento. Puro. |
| `apps/cms/src/lib/crm/historicoEstagio.test.ts` **(criar)** | Testes da regra de transição, incluindo a divergência M6 (autor legível). |
| `apps/cms/src/collections/HistoricoEstagio.ts` **(criar)** | Coleção append-only das transições. |
| `apps/cms/src/collections/Oportunidades.ts` **(modificar)** | Campos novos + os dois hooks finos. |
| `apps/cms/src/payload.config.ts` **(modificar)** | Registra a coleção nova. |
| `apps/cms/src/lib/cms/painelCrmEscrita.ts` **(modificar)** | `DadosOportunidade` ganha `estagio`/`situacao`; o mapper grava os dois. |
| `apps/cms/src/lib/cms/painelCrmEscrita.estagio.test.ts` **(criar)** | Prova que a escrita persiste estágio e situação. |
| `apps/cms/src/lib/cms/painelCrm.ts` **(modificar)** | Resumo/detalhe expõem estágio, situação e as marcas de migração; `listarHistoricoEstagio()`. |
| `apps/cms/src/app/(painel)/acoesCrm.ts` **(modificar)** | Server Action `carregarHistoricoOportunidade`. |
| `apps/cms/src/app/(painel)/crm/seloStatus.ts` **(modificar)** | Selos por estágio e por situação. |
| `apps/cms/src/app/(painel)/crm/TelaOportunidades.tsx` **(modificar)** | Colunas Estágio e Situação + marca de revisão pendente. |
| `apps/cms/src/app/(painel)/crm/FormOportunidade.tsx` **(modificar)** | Dois selects no lugar de um. |
| `apps/cms/src/app/(painel)/crm/DetalheOportunidade.tsx` **(modificar)** | Selos, aviso de migração pendente e linha do tempo do histórico. |
| `apps/cms/src/seed/migrarOportunidadesP0.ts` **(criar)** | Runner da migração, `DRY_RUN` por padrão. |
| `apps/cms/package.json` **(modificar)** | Script `crm:migrar-p0`. |
| `apps/cms/src/lib/crm/importadorCrm.ts` **(modificar)** | Importador legado passa a gravar estágio e situação. |

---

### Task 1: Listas do funil e regras puras (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/funil.ts`
- Create: `packages/lib/src/crm/funil.test.ts`
- Modify: `packages/lib/src/index.ts` (bloco de reexports do CRM, hoje nas linhas 55–74)

**Interfaces:**
- Consumes: `opcoes`, `OpcaoLista` de `./listas` (já existem).
- Produces:
  - `ESTAGIO_OPORTUNIDADE: OpcaoLista[]` — 11 estágios, na ordem do manual §11.
  - `SITUACAO_OPORTUNIDADE: OpcaoLista[]` — 3 situações.
  - `estagioLegado(estagio: string, situacao: string): string` — devolve o slug do `status` legado.
  - `planejarMigracaoOportunidade(statusLegado: string | null): PlanoMigracaoP0`
  - `interface PlanoMigracaoP0 { estagio: string; situacao: string; revisao: boolean; flag: string }`

- [ ] **Step 1: Escrever o teste que falha**

Criar `packages/lib/src/crm/funil.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  ESTAGIO_OPORTUNIDADE,
  SITUACAO_OPORTUNIDADE,
  estagioLegado,
  planejarMigracaoOportunidade,
} from "./funil";

describe("listas do funil P0", () => {
  it("tem os 11 estágios na ordem do manual §11", () => {
    expect(ESTAGIO_OPORTUNIDADE.map((o) => o.value)).toEqual([
      "mapeada",
      "prospeccao-relacionamento",
      "demanda-identificada",
      "qualificada",
      "diagnostico-realizado",
      "solucao-em-construcao",
      "proposta-em-elaboracao",
      "proposta-enviada",
      "negociacao-tramitacao",
      "contratacao-em-formalizacao",
      "ganha",
    ]);
  });

  it("tem as 3 situações", () => {
    expect(SITUACAO_OPORTUNIDADE.map((o) => o.value)).toEqual([
      "ativa",
      "perdida",
      "adiada-nurturing",
    ]);
  });
});

describe("estagioLegado — espelho do campo status", () => {
  it("situação encerra o funil independentemente do estágio", () => {
    expect(estagioLegado("negociacao-tramitacao", "perdida")).toBe("perdida");
    expect(estagioLegado("qualificada", "adiada-nurturing")).toBe("cancelada");
  });

  it("mapeia os estágios com equivalente legado", () => {
    expect(estagioLegado("ganha", "ativa")).toBe("contratada");
    expect(estagioLegado("contratacao-em-formalizacao", "ativa")).toBe("aprovada");
    expect(estagioLegado("negociacao-tramitacao", "ativa")).toBe("em-negociacao");
    expect(estagioLegado("proposta-enviada", "ativa")).toBe("proposta-enviada");
    expect(estagioLegado("prospeccao-relacionamento", "ativa")).toBe("apresentacao-institucional");
  });

  it("cai em em-qualificacao para os estágios sem equivalente legado", () => {
    for (const estagio of [
      "mapeada",
      "demanda-identificada",
      "qualificada",
      "diagnostico-realizado",
      "solucao-em-construcao",
      "proposta-em-elaboracao",
    ]) {
      expect(estagioLegado(estagio, "ativa")).toBe("em-qualificacao");
    }
  });
});

describe("planejarMigracaoOportunidade — docs/17 §1.5", () => {
  it("converte os status inequívocos sem marcar revisão", () => {
    expect(planejarMigracaoOportunidade("apresentacao-institucional")).toEqual({
      estagio: "prospeccao-relacionamento",
      situacao: "ativa",
      revisao: false,
      flag: "",
    });
    expect(planejarMigracaoOportunidade("proposta-enviada")).toMatchObject({
      estagio: "proposta-enviada",
      revisao: false,
    });
    expect(planejarMigracaoOportunidade("em-negociacao")).toMatchObject({
      estagio: "negociacao-tramitacao",
      revisao: false,
    });
  });

  it("marca revisão nos status ambíguos, com flag explicando o porquê", () => {
    for (const status of ["em-qualificacao", "aprovada", "contratada", "perdida", "cancelada"]) {
      const plano = planejarMigracaoOportunidade(status);
      expect(plano.revisao).toBe(true);
      expect(plano.flag).toContain("[VALIDAR COM A DIREÇÃO]");
    }
  });

  it("Perdida e Cancelada viram situação Perdida com Mapeada como fallback técnico", () => {
    expect(planejarMigracaoOportunidade("perdida")).toMatchObject({
      estagio: "mapeada",
      situacao: "perdida",
      revisao: true,
    });
    expect(planejarMigracaoOportunidade("cancelada")).toMatchObject({
      estagio: "mapeada",
      situacao: "perdida",
      revisao: true,
    });
  });

  it("status desconhecido ou ausente não trava a migração — vai para revisão", () => {
    expect(planejarMigracaoOportunidade(null)).toMatchObject({ revisao: true });
    expect(planejarMigracaoOportunidade("valor-que-nao-existe")).toMatchObject({ revisao: true });
  });

  it("estagioLegado desfaz planejarMigracaoOportunidade nos casos sem ambiguidade", () => {
    for (const status of ["apresentacao-institucional", "proposta-enviada", "em-negociacao"]) {
      const plano = planejarMigracaoOportunidade(status);
      expect(estagioLegado(plano.estagio, plano.situacao)).toBe(status);
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/lib test`
Expected: FAIL — `Failed to resolve import "./funil"`.

- [ ] **Step 3: Implementar**

Criar `packages/lib/src/crm/funil.ts`:

```ts
/**
 * Funil comercial P0 — 11 estágios (posição) × 3 situações (condição), espelho
 * do campo `status` legado e tabela de migração. Espelha o módulo P0_SETUP do
 * protótipo NTC_Comercial_Premium v3.3 P0. Puro, sem I/O: usado no cliente
 * (selects), no servidor (hooks do Payload) e no script de migração.
 *
 * Fonte: docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md §1.1 e §1.5.
 */

import { opcoes, type OpcaoLista } from "./listas";

export const ESTAGIO_OPORTUNIDADE: OpcaoLista[] = opcoes([
  "Mapeada",
  "Prospecção / Relacionamento",
  "Demanda Identificada",
  "Qualificada",
  "Diagnóstico Realizado",
  "Solução em Construção",
  "Proposta em Elaboração",
  "Proposta Enviada",
  "Negociação / Tramitação",
  "Contratação em Formalização",
  "Ganha",
]);

export const SITUACAO_OPORTUNIDADE: OpcaoLista[] = opcoes(["Ativa", "Perdida", "Adiada / Nurturing"]);

/** Estágios com equivalente direto no enum legado STATUS_OPORTUNIDADE. */
const LEGADO_POR_ESTAGIO: Record<string, string> = {
  ganha: "contratada",
  "contratacao-em-formalizacao": "aprovada",
  "negociacao-tramitacao": "em-negociacao",
  "proposta-enviada": "proposta-enviada",
  "prospeccao-relacionamento": "apresentacao-institucional",
};

/**
 * Preenche o campo `status` legado a partir do par estágio+situação, para o
 * Dashboard e os gráficos continuarem funcionando até a Sessão H7 migrá-los.
 *
 * "Adiada / Nurturing" vira `cancelada` porque é o único valor legado que tira
 * a oportunidade do funil ativo sem registrá-la como perda (ver
 * STATUS_OPORTUNIDADE_FECHADA em ./listas). É perda de informação consciente e
 * temporária — o espelho inteiro morre quando o campo legado for removido.
 */
export function estagioLegado(estagio: string, situacao: string): string {
  if (situacao === "perdida") return "perdida";
  if (situacao === "adiada-nurturing") return "cancelada";
  return LEGADO_POR_ESTAGIO[estagio] ?? "em-qualificacao";
}

export interface PlanoMigracaoP0 {
  estagio: string;
  situacao: string;
  /** true ⇒ o destino é provisório e exige confirmação humana antes de virar verdade histórica. */
  revisao: boolean;
  flag: string;
}

const FALLBACK_PERDIDA = "[VALIDAR COM A DIREÇÃO] estágio anterior desconhecido — Mapeada é fallback técnico, NÃO verdade histórica";

const TABELA_MIGRACAO: Record<string, PlanoMigracaoP0> = {
  "em-qualificacao": {
    estagio: "demanda-identificada",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] confirmar se já havia avaliação de qualificação",
  },
  "apresentacao-institucional": {
    estagio: "prospeccao-relacionamento",
    situacao: "ativa",
    revisao: false,
    flag: "",
  },
  "proposta-enviada": { estagio: "proposta-enviada", situacao: "ativa", revisao: false, flag: "" },
  "em-negociacao": { estagio: "negociacao-tramitacao", situacao: "ativa", revisao: false, flag: "" },
  aprovada: {
    estagio: "contratacao-em-formalizacao",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] aceite do cliente não é Ganha",
  },
  contratada: {
    estagio: "contratacao-em-formalizacao",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] Ganha exige contratação formalizada e handoff aceito",
  },
  perdida: { estagio: "mapeada", situacao: "perdida", revisao: true, flag: FALLBACK_PERDIDA },
  cancelada: {
    estagio: "mapeada",
    situacao: "perdida",
    revisao: true,
    flag: `${FALLBACK_PERDIDA}; Cancelada pode ser Perdida, Adiada/Nurturing ou cancelamento administrativo`,
  },
};

/** Converte o `status` legado no par estágio+situação, marcando o que precisa de revisão humana. */
export function planejarMigracaoOportunidade(statusLegado: string | null): PlanoMigracaoP0 {
  if (statusLegado === null) {
    return {
      estagio: "mapeada",
      situacao: "ativa",
      revisao: true,
      flag: "[VALIDAR COM A DIREÇÃO] oportunidade sem status legado",
    };
  }
  return (
    TABELA_MIGRACAO[statusLegado] ?? {
      estagio: "mapeada",
      situacao: "ativa",
      revisao: true,
      flag: `[VALIDAR COM A DIREÇÃO] status legado desconhecido: ${statusLegado}`,
    }
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/lib test`
Expected: PASS — 8 testes verdes em `funil.test.ts`.

- [ ] **Step 5: Exportar no índice do pacote**

Em `packages/lib/src/index.ts`, logo após o bloco `} from "./crm/listas";`:

```ts
export {
  ESTAGIO_OPORTUNIDADE,
  SITUACAO_OPORTUNIDADE,
  estagioLegado,
  planejarMigracaoOportunidade,
  type PlanoMigracaoP0,
} from "./crm/funil";
```

- [ ] **Step 6: Verificar tipos e lint**

Run: `pnpm --filter @ntc/lib typecheck && pnpm --filter @ntc/lib lint`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add packages/lib/src/crm/funil.ts packages/lib/src/crm/funil.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): adiciona estagios, situacoes e tabela de migracao do funil P0"
```

---

### Task 2: Coleção `historico-estagio` e campos novos na oportunidade

**Files:**
- Create: `apps/cms/src/lib/crm/historicoEstagio.ts`
- Create: `apps/cms/src/lib/crm/historicoEstagio.test.ts`
- Create: `apps/cms/src/collections/HistoricoEstagio.ts`
- Modify: `apps/cms/src/collections/Oportunidades.ts`
- Modify: `apps/cms/src/payload.config.ts:13-34` (imports) e `:87-106` (array `collections`)

**Interfaces:**
- Consumes: `ESTAGIO_OPORTUNIDADE`, `SITUACAO_OPORTUNIDADE`, `estagioLegado` (Task 1); `atendimentoComercial`, `superAdmin` de `../access/`.
- Produces:
  - `montarTransicaoEstagio(e: EntradaTransicaoEstagio): TransicaoEstagio | null`
  - `interface EntradaTransicaoEstagio { oportunidadeId: number | string; anterior: string | null; novo: string | null; usuarioId?: number | string | null; atorSistema?: string | null; motivo?: string | null }`
  - `interface TransicaoEstagio { oportunidade: number; estagioAnterior: string | null; estagioNovo: string; dataHora: string; usuario: number | null; atorSistema: string | null; motivo: string | null }`
  - Coleção `historico-estagio` (interface TS gerada: `HistoricoEstagio`).
  - Campos novos em `oportunidades`: `estagio`, `situacao`, `migracaoPendenteRevisao`, `migracaoFlag`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/historicoEstagio.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { montarTransicaoEstagio } from "./historicoEstagio";

describe("montarTransicaoEstagio", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("monta a transição quando o estágio muda", () => {
    expect(
      montarTransicaoEstagio({
        oportunidadeId: "7",
        anterior: "mapeada",
        novo: "demanda-identificada",
        usuarioId: 3,
      }),
    ).toEqual({
      oportunidade: 7,
      estagioAnterior: "mapeada",
      estagioNovo: "demanda-identificada",
      dataHora: "2026-09-04T12:00:00.000Z",
      usuario: 3,
      atorSistema: null,
      motivo: null,
    });
  });

  it("devolve null quando o estágio não mudou", () => {
    expect(
      montarTransicaoEstagio({ oportunidadeId: 7, anterior: "qualificada", novo: "qualificada" }),
    ).toBeNull();
  });

  it("devolve null quando não há estágio novo", () => {
    expect(montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: null })).toBeNull();
  });

  it("registra a primeira atribuição de estágio com anterior nulo", () => {
    expect(
      montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: "mapeada" }),
    ).toMatchObject({ estagioAnterior: null, estagioNovo: "mapeada" });
  });

  // Divergência M6 (docs/17 §4.0): no protótipo a migração grava usuario:'migracao',
  // que não resolve para nenhum usuário e deixa a coluna vazia na tela.
  it("toda transição tem autor legível — usuário ou ator de sistema", () => {
    const daMigracao = montarTransicaoEstagio({
      oportunidadeId: 7,
      anterior: null,
      novo: "mapeada",
      atorSistema: "migração automática",
      motivo: "Migração P0 do status legado \"perdida\"",
    });
    expect(daMigracao).toMatchObject({
      usuario: null,
      atorSistema: "migração automática",
      motivo: 'Migração P0 do status legado "perdida"',
    });

    const semAutor = montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: "mapeada" });
    expect(semAutor?.atorSistema).toBe("sistema");
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/cms test`
Expected: FAIL — `Failed to resolve import "./historicoEstagio"`.

- [ ] **Step 3: Implementar a regra pura**

Criar `apps/cms/src/lib/crm/historicoEstagio.ts`:

```ts
/**
 * Regra de registro do histórico de estágio (docs/17 §1.2 e §4.0 · M6).
 * Pura: o hook da coleção só decide persistir o que esta função montar.
 */

export interface EntradaTransicaoEstagio {
  oportunidadeId: number | string;
  anterior: string | null;
  novo: string | null;
  usuarioId?: number | string | null;
  atorSistema?: string | null;
  motivo?: string | null;
}

export interface TransicaoEstagio {
  oportunidade: number;
  estagioAnterior: string | null;
  estagioNovo: string;
  dataHora: string;
  usuario: number | null;
  atorSistema: string | null;
  motivo: string | null;
}

const numeroOuNulo = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Devolve o documento da transição, ou null quando não há transição a registrar
 * (estágio ausente ou inalterado). Toda transição sai com autor legível: o
 * usuário da sessão quando existe, senão um ator de sistema nomeado — nunca
 * uma referência a um usuário inexistente, que a tela renderizaria como "—".
 */
export function montarTransicaoEstagio(e: EntradaTransicaoEstagio): TransicaoEstagio | null {
  if (e.novo === null || e.novo === e.anterior) return null;
  const usuario = numeroOuNulo(e.usuarioId);
  const oportunidade = numeroOuNulo(e.oportunidadeId);
  if (oportunidade === null) return null;
  return {
    oportunidade,
    estagioAnterior: e.anterior,
    estagioNovo: e.novo,
    dataHora: new Date().toISOString(),
    usuario,
    atorSistema: usuario === null ? (e.atorSistema ?? "sistema") : (e.atorSistema ?? null),
    motivo: e.motivo ?? null,
  };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms test`
Expected: PASS — 5 testes verdes em `historicoEstagio.test.ts`.

- [ ] **Step 5: Criar a coleção append-only**

Criar `apps/cms/src/collections/HistoricoEstagio.ts`:

```ts
import type { CollectionConfig } from "payload";

import { ESTAGIO_OPORTUNIDADE } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";

/**
 * Histórico de estágio — trilha imutável das transições do funil
 * (docs/17 §1.2 · manual NTC-COM-CRM-01 §30).
 *
 * Append-only: create/update/delete negados para TODO perfil, inclusive
 * super-admin. A escrita acontece só pela Local API interna (hook da coleção
 * oportunidades e script de migração), que roda com overrideAccess padrão.
 */
export const HistoricoEstagio: CollectionConfig = {
  slug: "historico-estagio",
  labels: { singular: "Transição de Estágio", plural: "Histórico de Estágio" },
  typescript: { interface: "HistoricoEstagio" },
  admin: {
    useAsTitle: "estagioNovo",
    defaultColumns: ["oportunidade", "estagioAnterior", "estagioNovo", "dataHora"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "oportunidade",
      type: "relationship",
      relationTo: "oportunidades",
      required: true,
      index: true,
    },
    { name: "estagioAnterior", type: "select", options: ESTAGIO_OPORTUNIDADE },
    { name: "estagioNovo", type: "select", options: ESTAGIO_OPORTUNIDADE, required: true },
    { name: "dataHora", type: "date", required: true },
    { name: "usuario", type: "relationship", relationTo: "users" },
    {
      name: "atorSistema",
      type: "text",
      admin: {
        description: "Preenchido quando a transição não veio de um usuário (migração, importador).",
      },
    },
    { name: "motivo", type: "textarea" },
  ],
};
```

- [ ] **Step 6: Adicionar os campos e os hooks em `Oportunidades.ts`**

Trocar o import do topo e acrescentar os hooks. O arquivo passa a começar assim:

```ts
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from "payload";

import {
  ESTAGIO_OPORTUNIDADE,
  ORIGENS_CRM,
  SITUACAO_OPORTUNIDADE,
  STATUS_OPORTUNIDADE,
  UFS,
  estagioLegado,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { montarTransicaoEstagio } from "../lib/crm/historicoEstagio";

/**
 * Mantém o campo `status` legado preenchido a partir de estagio+situacao. O
 * Dashboard e os gráficos ainda leem `status` — a migração deles é a Sessão H7,
 * e só depois dela o campo pode ser removido (docs/17, Global Constraints).
 */
const espelharStatusLegado: CollectionBeforeChangeHook = ({ data }) => {
  const estagio = typeof data?.estagio === "string" ? data.estagio : null;
  const situacao = typeof data?.situacao === "string" ? data.situacao : null;
  if (estagio === null && situacao === null) return data;
  return { ...data, status: estagioLegado(estagio ?? "mapeada", situacao ?? "ativa") };
};

/** Grava a transição no histórico append-only sempre que o estágio muda. */
const registrarTransicaoEstagio: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const transicao = montarTransicaoEstagio({
    oportunidadeId: doc.id,
    anterior: typeof previousDoc?.estagio === "string" ? previousDoc.estagio : null,
    novo: typeof doc.estagio === "string" ? doc.estagio : null,
    usuarioId: req.user?.collection === "users" ? req.user.id : null,
  });
  if (transicao === null) return doc;
  // `req` vai junto para a escrita entrar na mesma transação do Payload.
  await req.payload.create({ collection: "historico-estagio", data: transicao, req });
  return doc;
};
```

Registrar os hooks logo depois do bloco `access` da coleção:

```ts
  hooks: {
    beforeChange: [espelharStatusLegado],
    afterChange: [registrarTransicaoEstagio],
  },
```

E acrescentar os campos novos **logo depois** do campo `status` existente (que ganha uma descrição marcando-o como legado):

```ts
    {
      name: "status",
      type: "select",
      options: STATUS_OPORTUNIDADE,
      defaultValue: "em-qualificacao",
      admin: {
        description:
          "Campo legado, preenchido automaticamente a partir de Estágio e Situação. Não editar: será removido depois da Sessão H7.",
        readOnly: true,
      },
    },
    {
      name: "estagio",
      type: "select",
      options: ESTAGIO_OPORTUNIDADE,
      defaultValue: "mapeada",
      admin: { description: "Posição no funil comercial (manual NTC-COM-CRM-01 §11)." },
    },
    {
      name: "situacao",
      type: "select",
      options: SITUACAO_OPORTUNIDADE,
      defaultValue: "ativa",
      admin: { description: "Condição da oportunidade — independente do estágio (§12)." },
    },
    {
      name: "migracaoPendenteRevisao",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Estágio atribuído pela migração automática e ainda não confirmado pela Direção. Enquanto marcado, o estágio é provisório e não é verdade histórica.",
      },
    },
    {
      name: "migracaoFlag",
      type: "text",
      admin: {
        readOnly: true,
        description: "O que a Direção precisa confirmar nesta oportunidade migrada.",
      },
    },
```

> **Atenção:** `estagio` e `situacao` ficam **sem `required`** nesta task. A obrigatoriedade entra na Task 6, depois que a migração preencher as linhas existentes.

- [ ] **Step 7: Registrar a coleção no config**

Em `apps/cms/src/payload.config.ts`, adicionar o import em ordem alfabética junto aos demais:

```ts
import { HistoricoEstagio } from "./collections/HistoricoEstagio";
```

e o item no array `collections`, logo depois de `Oportunidades`:

```ts
    Oportunidades,
    HistoricoEstagio,
```

- [ ] **Step 8: Verificar tipos**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: sem erros. Se `payload-types.ts` reclamar de `historico-estagio` inexistente, isso é esperado até o Step 9.

- [ ] **Step 9: PARE — sincronização de schema é do usuário**

Este passo **não é executado por um agente** (`CLAUDE.md` §14 e docs/17 §5). Peça ao usuário:

1. parar o `pnpm dev`;
2. rodar `pnpm payload:push:schema`, revisar o diff — devem aparecer a tabela `historico_estagio` e as colunas `estagio`, `situacao`, `migracao_pendente_revisao`, `migracao_flag` em `oportunidades`, todas nullable;
3. responder **N** a qualquer prompt de `DATA LOSS` e avisar se ele aparecer;
4. rodar `pnpm payload:generate` para regenerar `packages/types/src/payload-types.ts`.

- [ ] **Step 10: Confirmar os tipos gerados**

Run: `grep -n "historico-estagio\|migracaoPendenteRevisao" packages/types/src/payload-types.ts | head`
Expected: a coleção e os campos aparecem no arquivo gerado.

- [ ] **Step 11: Rodar a suíte inteira do cms**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck`
Expected: PASS, sem regressão nos testes existentes de propostas/versões/PDF.

- [ ] **Step 12: Commit**

```bash
git add apps/cms/src/lib/crm/historicoEstagio.ts apps/cms/src/lib/crm/historicoEstagio.test.ts \
  apps/cms/src/collections/HistoricoEstagio.ts apps/cms/src/collections/Oportunidades.ts \
  apps/cms/src/payload.config.ts packages/types/src/payload-types.ts
git commit -m "feat(crm): adiciona historico de estagio append-only e campos de funil na oportunidade"
```

---

### Task 3: A escrita do painel grava estágio e situação

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts` (interface `DadosOportunidade` e função `dadosOportunidade`)
- Create: `apps/cms/src/lib/cms/painelCrmEscrita.estagio.test.ts`

**Interfaces:**
- Consumes: `montarTransicaoEstagio` **não** é chamado aqui — quem grava histórico é o hook `afterChange` da coleção (Task 2), para cobrir também importador e scripts.
- Produces: `DadosOportunidade` ganha `estagio: string` e `situacao: string`. `criarOportunidade` e `atualizarOportunidade` mantêm a assinatura `(dados) => Promise<ResultadoEscrita>` e `(id, dados) => Promise<ResultadoEscrita>`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/cms/painelCrmEscrita.estagio.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Mesmo padrão de painelCrmEscrita.versao.test.ts: a Local API é mockada por
 * completo, então a regra é exercitada sem banco.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarOportunidade, atualizarOportunidade } = await import("./painelCrmEscrita");

const dadosBase = {
  cliente: "3",
  programa: "2",
  modulos: [],
  eventos: [],
  uf: "SP",
  origem: "indicacao",
  quantidade: "80",
  modalidade: "Online",
  valor: "104400",
  probabilidade: "70",
  estagio: "demanda-identificada",
  situacao: "ativa",
  dataAbertura: "2026-09-01",
  dataPrevFechamento: "",
  proximaAcao: "Enviar proposta",
  followup: "2026-09-10",
  responsavel: "1",
  observacoes: "",
};

function montarPayloadFalso() {
  const criados: Record<string, unknown>[] = [];
  const atualizados: Record<string, unknown>[] = [];
  obterPayloadMock.mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      criados.push(data);
      return { id: 1, ...data };
    }),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      atualizados.push(data);
      return { id: 1, ...data };
    }),
  });
  return { criados, atualizados };
}

afterEach(() => vi.clearAllMocks());

describe("escrita da oportunidade — estágio e situação", () => {
  it("persiste estágio e situação ao criar", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarOportunidade(dadosBase);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ estagio: "demanda-identificada", situacao: "ativa" });
  });

  it("aplica os defaults do funil quando o formulário vem vazio", async () => {
    const { criados } = montarPayloadFalso();
    await criarOportunidade({ ...dadosBase, estagio: "", situacao: "" });
    expect(criados[0]).toMatchObject({ estagio: "mapeada", situacao: "ativa" });
  });

  it("persiste estágio e situação ao atualizar", async () => {
    const { atualizados } = montarPayloadFalso();
    await atualizarOportunidade("7", { ...dadosBase, estagio: "ganha", situacao: "ativa" });
    expect(atualizados[0]).toMatchObject({ estagio: "ganha", situacao: "ativa" });
  });

  it("recusa a gravação sem cliente, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarOportunidade({ ...dadosBase, cliente: "" });
    expect(r).toEqual({ ok: false, erro: "Selecione o cliente." });
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.estagio`
Expected: FAIL — o objeto gravado não tem `estagio`/`situacao` (e o TypeScript acusa as propriedades desconhecidas em `dadosBase`).

- [ ] **Step 3: Implementar**

Em `apps/cms/src/lib/cms/painelCrmEscrita.ts`, na interface `DadosOportunidade`, trocar a linha `status: string;` por:

```ts
  estagio: string;
  situacao: string;
```

E na função `dadosOportunidade`, trocar a linha do `status` por:

```ts
    // `status` legado NÃO é montado aqui: o hook beforeChange da coleção
    // oportunidades o deriva de estagio+situacao (fonte única).
    estagio: (ouNulo(dados.estagio) ?? "mapeada") as OportunidadeData["estagio"],
    situacao: (ouNulo(dados.situacao) ?? "ativa") as OportunidadeData["situacao"],
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.estagio`
Expected: PASS — 4 testes.

- [ ] **Step 5: Rodar a suíte inteira e o typecheck**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck`
Expected: o typecheck aponta os consumidores de `DadosOportunidade` que ainda mandam `status` — `FormOportunidade.tsx` é corrigido na Task 5. Se o typecheck falhar **só** lá, siga; qualquer outro erro é regressão e precisa ser resolvido agora.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrmEscrita.ts apps/cms/src/lib/cms/painelCrmEscrita.estagio.test.ts
git commit -m "feat(crm): grava estagio e situacao na escrita da oportunidade"
```

---

### Task 4: A leitura do painel expõe funil, marcas de migração e histórico

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrm.ts` (`OportunidadeCrmResumo` ~:63, `mapearOportunidadeResumo` ~:243, fim do arquivo para a função nova)
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`

**Interfaces:**
- Consumes: coleção `historico-estagio` (Task 2).
- Produces:
  - `OportunidadeCrmResumo` ganha `estagio: string`, `situacao: string`, `migracaoPendenteRevisao: boolean`, `migracaoFlag: string | null`.
  - `interface TransicaoEstagioResumo { id: string; estagioAnterior: string | null; estagioNovo: string; dataHoraISO: string | null; autor: string }`
  - `listarHistoricoEstagio(oportunidadeId: string): Promise<TransicaoEstagioResumo[]>`
  - Server Action `carregarHistoricoOportunidade(id: string): Promise<TransicaoEstagioResumo[]>`

- [ ] **Step 1: Estender o tipo e o mapper**

Em `apps/cms/src/lib/cms/painelCrm.ts`, acrescentar à interface `OportunidadeCrmResumo`, logo depois de `status: string;`:

```ts
  estagio: string;
  situacao: string;
  migracaoPendenteRevisao: boolean;
  migracaoFlag: string | null;
```

e ao final do objeto devolvido por `mapearOportunidadeResumo`:

```ts
    estagio: doc.estagio ?? "mapeada",
    situacao: doc.situacao ?? "ativa",
    migracaoPendenteRevisao: doc.migracaoPendenteRevisao === true,
    migracaoFlag: doc.migracaoFlag ?? null,
```

- [ ] **Step 2: Adicionar a leitura do histórico**

Ao final de `apps/cms/src/lib/cms/painelCrm.ts`:

```ts
export interface TransicaoEstagioResumo {
  id: string;
  estagioAnterior: string | null;
  estagioNovo: string;
  dataHoraISO: string | null;
  /** Nome do usuário, ou o ator de sistema quando a transição foi automática. */
  autor: string;
}

/** Histórico de estágio de uma oportunidade, do mais recente para o mais antigo. */
export async function listarHistoricoEstagio(
  oportunidadeId: string,
): Promise<TransicaoEstagioResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "historico-estagio",
    where: { oportunidade: { equals: oportunidadeId } },
    depth: 1,
    limit: 200,
    sort: "-dataHora",
  });
  return res.docs.map((doc) => ({
    id: String(doc.id),
    estagioAnterior: doc.estagioAnterior ?? null,
    estagioNovo: doc.estagioNovo,
    dataHoraISO: typeof doc.dataHora === "string" ? doc.dataHora : null,
    autor: campoRel(doc.usuario, "nome") ?? doc.atorSistema ?? "sistema",
  }));
}
```

- [ ] **Step 3: Expor pela Server Action**

Em `apps/cms/src/app/(painel)/acoesCrm.ts`, acrescentar `listarHistoricoEstagio` e `type TransicaoEstagioResumo` ao import de `@/lib/cms/painelCrm` e, junto das demais actions de leitura:

```ts
export async function carregarHistoricoOportunidade(
  id: string,
): Promise<TransicaoEstagioResumo[]> {
  // Server Action é endpoint público: sessão antes de qualquer leitura.
  if (!(await obterUsuarioCms())) return [];
  return listarHistoricoEstagio(id);
}
```

- [ ] **Step 4: Verificar tipos**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: os únicos erros restantes são os consumidores de UI da Task 5.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/painelCrm.ts "apps/cms/src/app/(painel)/acoesCrm.ts"
git commit -m "feat(crm): expoe funil, marcas de migracao e historico na leitura do painel"
```

---

### Task 5: Telas do CRM passam a operar estágio e situação

**Files:**
- Modify: `apps/cms/src/app/(painel)/crm/seloStatus.ts`
- Modify: `apps/cms/src/app/(painel)/crm/TelaOportunidades.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/FormOportunidade.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/DetalheOportunidade.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx:245-250` (função `abrirOportunidade`) e `:365-370` (uso de `<DetalheOportunidade>`)

**Interfaces:**
- Consumes: `ESTAGIO_OPORTUNIDADE`, `SITUACAO_OPORTUNIDADE` (Task 1); `OportunidadeCrmResumo` estendido e `TransicaoEstagioResumo` (Task 4); `carregarHistoricoOportunidade` (Task 4).
- Produces: `seloDeEstagio(estagio: string): string`, `seloDeSituacao(situacao: string): string`; `<DetalheOportunidade>` ganha a prop `historico: TransicaoEstagioResumo[]`.

- [ ] **Step 1: Selos por estágio e situação**

Em `apps/cms/src/app/(painel)/crm/seloStatus.ts`, acrescentar (mantendo `SELO_OPORTUNIDADE` e `seloDeOportunidade`, que o Dashboard ainda usa até a Sessão H7):

```ts
/** Estágio: neutro no início do funil, atenção na negociação, ok em Ganha. */
const SELO_ESTAGIO: Record<string, string> = {
  mapeada: "info",
  "prospeccao-relacionamento": "info",
  "demanda-identificada": "info",
  qualificada: "info",
  "diagnostico-realizado": "info",
  "solucao-em-construcao": "info",
  "proposta-em-elaboracao": "info",
  "proposta-enviada": "info",
  "negociacao-tramitacao": "atencao",
  "contratacao-em-formalizacao": "atencao",
  ganha: "ok",
};

const SELO_SITUACAO: Record<string, string> = {
  ativa: "ok",
  perdida: "erro",
  "adiada-nurturing": "atencao",
};

export const seloDeEstagio = (estagio: string): string =>
  `pcms-selo pcms-selo--${SELO_ESTAGIO[estagio] ?? "info"}`;

export const seloDeSituacao = (situacao: string): string =>
  `pcms-selo pcms-selo--${SELO_SITUACAO[situacao] ?? "info"}`;
```

- [ ] **Step 2: Colunas da listagem**

Em `TelaOportunidades.tsx`: trocar o import `STATUS_OPORTUNIDADE` por `ESTAGIO_OPORTUNIDADE, SITUACAO_OPORTUNIDADE` e o import de selos por `rotuloDeLista, seloDeEstagio, seloDeSituacao`. No `<thead>`, substituir a coluna `<th>Status</th>` por duas:

```tsx
              <th>Estágio</th>
              <th>Situação</th>
```

e, na linha da tabela, substituir a célula do status por:

```tsx
                <td>
                  <span className={seloDeEstagio(o.estagio)}>
                    {rotuloDeLista(ESTAGIO_OPORTUNIDADE, o.estagio)}
                  </span>
                  {o.migracaoPendenteRevisao ? (
                    <span className="pcms-selo pcms-selo--atencao" title={o.migracaoFlag ?? ""}>
                      revisar migração
                    </span>
                  ) : null}
                </td>
                <td>
                  <span className={seloDeSituacao(o.situacao)}>
                    {rotuloDeLista(SITUACAO_OPORTUNIDADE, o.situacao)}
                  </span>
                </td>
```

- [ ] **Step 3: Dois selects no formulário**

Em `FormOportunidade.tsx`: trocar `STATUS_OPORTUNIDADE` por `ESTAGIO_OPORTUNIDADE, SITUACAO_OPORTUNIDADE` no import de `@ntc/lib`; no `useState`, trocar a linha `status: inicial?.status ?? "em-qualificacao",` por:

```ts
    estagio: inicial?.estagio ?? "mapeada",
    situacao: inicial?.situacao ?? "ativa",
```

e trocar o `<CampoSelect rotulo="Status" ... />` por:

```tsx
        <CampoSelect
          rotulo="Estágio (posição no funil)"
          valor={dados.estagio}
          onMudar={m("estagio")}
          opcoes={ESTAGIO_OPORTUNIDADE}
        />
        <CampoSelect
          rotulo="Situação"
          valor={dados.situacao}
          onMudar={m("situacao")}
          opcoes={SITUACAO_OPORTUNIDADE}
        />
```

- [ ] **Step 4: Detalhe com aviso de migração e linha do tempo**

Em `DetalheOportunidade.tsx`: acrescentar `historico` às props e importar o que falta.

```tsx
import { ESTAGIO_OPORTUNIDADE, ORIGENS_CRM, SITUACAO_OPORTUNIDADE } from "@ntc/lib";

import type { OportunidadeCrmDetalhe, TransicaoEstagioResumo } from "@/lib/cms/painelCrm";

import { rotuloDeLista, seloDeEstagio, seloDeSituacao } from "./seloStatus";

interface DetalheOportunidadeProps {
  oportunidade: OportunidadeCrmDetalhe;
  historico: TransicaoEstagioResumo[];
  onVoltar: () => void;
  onEditar: () => void;
}
```

Acrescentar duas linhas ao array `dados`, logo depois de `{ rotulo: "Cliente", ... }`:

```tsx
    { rotulo: "Estágio", valor: rotuloDeLista(ESTAGIO_OPORTUNIDADE, o.estagio) },
    { rotulo: "Situação", valor: rotuloDeLista(SITUACAO_OPORTUNIDADE, o.situacao) },
```

E, no corpo da tela, antes do bloco de dados, o aviso de migração pendente e, depois dele, a linha do tempo:

```tsx
      {o.migracaoPendenteRevisao ? (
        <p className="pcms-editor__hint">
          <strong>Estágio provisório.</strong> Esta oportunidade veio da migração automática e ainda
          não foi confirmada pela Direção. {o.migracaoFlag ?? ""}
        </p>
      ) : null}
```

```tsx
      <div className="pcms-editor__head--sub">Histórico de estágio</div>
      {historico.length === 0 ? (
        <p className="pcms-editor__hint">Nenhuma transição registrada.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Quando</th>
              <th>De</th>
              <th>Para</th>
              <th>Quem</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((t) => (
              <tr key={t.id}>
                <td>{formatarDataBR(t.dataHoraISO)}</td>
                <td>
                  {t.estagioAnterior === null
                    ? "—"
                    : rotuloDeLista(ESTAGIO_OPORTUNIDADE, t.estagioAnterior)}
                </td>
                <td>
                  <span className={seloDeEstagio(t.estagioNovo)}>
                    {rotuloDeLista(ESTAGIO_OPORTUNIDADE, t.estagioNovo)}
                  </span>
                </td>
                <td>{t.autor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
```

Substituir também o selo de status no cabeçalho da tela (hoje `seloDeOportunidade(o.status)`) por dois selos — estágio e situação — usando `seloDeEstagio(o.estagio)` e `seloDeSituacao(o.situacao)`.

- [ ] **Step 5: Ligar no casco**

Em `ShellCrm.tsx`, acrescentar `carregarHistoricoOportunidade` e `type TransicaoEstagioResumo` aos imports, um estado e a carga conjunta:

```tsx
  const [historicoOportunidade, setHistoricoOportunidade] = useState<TransicaoEstagioResumo[]>([]);

  function abrirOportunidade(id: string) {
    iniciarCarga(async () => {
      const [det, historico] = await Promise.all([
        carregarOportunidadeCrm(id),
        carregarHistoricoOportunidade(id),
      ]);
      if (det) {
        setOportunidadeDet(det);
        setHistoricoOportunidade(historico);
      }
    });
  }
```

e passar a prop nova:

```tsx
        <DetalheOportunidade
          oportunidade={oportunidadeDet}
          historico={historicoOportunidade}
          onVoltar={fecharTudo}
          onEditar={() => setFormAberto({ entidade: "oportunidade", inicial: oportunidadeDet })}
        />
```

- [ ] **Step 6: Verificar tipos, lint e testes**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint && pnpm --filter @ntc/cms test`
Expected: tudo verde — a esta altura não deve restar nenhum consumidor de `DadosOportunidade.status`.

- [ ] **Step 7: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm"
git commit -m "feat(crm): telas de oportunidade passam a operar estagio, situacao e historico"
```

---

### Task 6: Script de migração dos registros existentes

**Files:**
- Create: `apps/cms/src/seed/migrarOportunidadesP0.ts`
- Modify: `apps/cms/package.json` (bloco `scripts`, junto de `crm:importar` na linha 29)
- Modify: `apps/cms/src/collections/Oportunidades.ts` (só no Step 7, para tornar os campos obrigatórios)

**Interfaces:**
- Consumes: `planejarMigracaoOportunidade` (Task 1), `montarTransicaoEstagio` (Task 2).
- Produces: comando `pnpm --filter @ntc/cms crm:migrar-p0`, dry-run por padrão.

- [ ] **Step 1: Escrever o script**

Criar `apps/cms/src/seed/migrarOportunidadesP0.ts`:

```ts
/**
 * Migra as oportunidades existentes para o funil P0 — docs/17 §1.5 e §5.
 *
 * Uso:
 *   pnpm --filter @ntc/cms crm:migrar-p0                              # dry-run: só relata
 *   CRM_MIGRACAO_APLICAR=1 pnpm --filter @ntc/cms crm:migrar-p0       # grava
 *
 * Env var em vez de flag porque o pnpm engole flags sem `--` (mesma decisão
 * de crm:importar). Idempotente: pula quem já tem `estagio` preenchido.
 *
 * Os casos ambíguos NÃO são consolidados como verdade histórica: saem com
 * migracaoPendenteRevisao = true e a flag explicando o que a Direção precisa
 * confirmar. "Mapeada" vindo de Perdida/Cancelada é fallback técnico.
 */
import { planejarMigracaoOportunidade } from "@ntc/lib";
import { getPayload } from "payload";

import { montarTransicaoEstagio } from "../lib/crm/historicoEstagio";
import config from "../payload.config";

const APLICAR = process.env.CRM_MIGRACAO_APLICAR === "1";

const payload = await getPayload({ config });

const res = await payload.find({
  collection: "oportunidades",
  limit: 1000,
  depth: 0,
  sort: "codigo",
});

let migradas = 0;
let pendentes = 0;
let puladas = 0;

for (const doc of res.docs) {
  if (typeof doc.estagio === "string" && doc.estagio.length > 0) {
    puladas += 1;
    continue;
  }
  const plano = planejarMigracaoOportunidade(doc.status ?? null);
  const linha = `${doc.codigo}: ${doc.status ?? "(sem status)"} -> ${plano.estagio} / ${plano.situacao}`;
  console.log(plano.revisao ? `${linha}  [REVISAR] ${plano.flag}` : linha);
  migradas += 1;
  if (plano.revisao) pendentes += 1;

  if (!APLICAR) continue;

  await payload.update({
    collection: "oportunidades",
    id: doc.id,
    data: {
      estagio: plano.estagio,
      situacao: plano.situacao,
      migracaoPendenteRevisao: plano.revisao,
      migracaoFlag: plano.revisao ? plano.flag : null,
    },
  });

  // O hook afterChange da coleção só registra transição quando o estágio muda
  // e não conhece o motivo da migração; a linha de origem é gravada aqui, com
  // ator de sistema legível (divergência M6 de docs/17 §4.0).
  const transicao = montarTransicaoEstagio({
    oportunidadeId: doc.id,
    anterior: null,
    novo: plano.estagio,
    atorSistema: "migração automática",
    motivo: `Migração P0 do status legado "${doc.status ?? "(sem status)"}". ${plano.flag}`.trim(),
  });
  if (transicao !== null) {
    await payload.create({ collection: "historico-estagio", data: transicao });
  }
}

console.log(
  `\n${APLICAR ? "APLICADO" : "DRY-RUN"} · ${migradas} oportunidade(s) migrada(s), ` +
    `${pendentes} pendente(s) de revisão humana, ${puladas} já migrada(s) e pulada(s).`,
);
if (!APLICAR) console.log("Nada foi gravado. Rode com CRM_MIGRACAO_APLICAR=1 para aplicar.");
process.exit(0);
```

- [ ] **Step 2: Registrar o comando**

Em `apps/cms/package.json`, logo depois da linha `"crm:importar": ...`:

```json
    "crm:migrar-p0": "pnpm payload run src/seed/migrarOportunidadesP0.ts",
```

- [ ] **Step 3: Verificar tipos**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: sem erros.

- [ ] **Step 4: PARE — backup e dry-run são do usuário**

Peça ao usuário, nesta ordem (docs/17 §5):

1. **snapshot do banco no Supabase** antes de qualquer coisa;
2. `pnpm --filter @ntc/cms crm:migrar-p0` (dry-run) e **conferir a saída inteira**: toda oportunidade aparece, com destino e flag; o total bate com o que existe no banco;
3. só então `CRM_MIGRACAO_APLICAR=1 pnpm --filter @ntc/cms crm:migrar-p0`.

Não siga para o Step 5 sem a confirmação de que a migração foi aplicada.

- [ ] **Step 5: Conferir o resultado no banco**

Peça ao usuário para abrir o Painel Admin em `/crm` → Oportunidades e confirmar: toda linha tem Estágio e Situação preenchidos; as que vieram de *Perdida*/*Cancelada* aparecem com a marca "revisar migração"; o detalhe de uma delas mostra a linha do histórico com autor "migração automática".

- [ ] **Step 6: Commit do script**

```bash
git add apps/cms/src/seed/migrarOportunidadesP0.ts apps/cms/package.json
git commit -m "feat(crm): adiciona script de migracao das oportunidades para o funil P0"
```

- [ ] **Step 7: Tornar estágio e situação obrigatórios**

Só agora, com todas as linhas preenchidas. Em `apps/cms/src/collections/Oportunidades.ts`, acrescentar `required: true` aos campos `estagio` e `situacao`:

```ts
    {
      name: "estagio",
      type: "select",
      options: ESTAGIO_OPORTUNIDADE,
      required: true,
      defaultValue: "mapeada",
      admin: { description: "Posição no funil comercial (manual NTC-COM-CRM-01 §11)." },
    },
    {
      name: "situacao",
      type: "select",
      options: SITUACAO_OPORTUNIDADE,
      required: true,
      defaultValue: "ativa",
      admin: { description: "Condição da oportunidade — independente do estágio (§12)." },
    },
```

- [ ] **Step 8: PARE — segundo push de schema é do usuário**

Peça: dev parado, `pnpm payload:push:schema`, revisar o diff (as duas colunas viram `NOT NULL`), **N** em qualquer `DATA LOSS`, depois `pnpm payload:generate`.

Se o push acusar linhas nulas, a migração não cobriu tudo — **não force**: volte ao Step 4 e investigue quais oportunidades ficaram de fora.

- [ ] **Step 9: Commit**

```bash
git add apps/cms/src/collections/Oportunidades.ts packages/types/src/payload-types.ts
git commit -m "feat(crm): torna estagio e situacao obrigatorios apos a migracao"
```

---

### Task 7: Importador do CRM legado grava o funil novo

**Files:**
- Modify: `apps/cms/src/lib/crm/importadorCrm.ts:469` (montagem do `data` da oportunidade)
- Modify: `apps/cms/src/lib/crm/importadorCrm.test.ts`
- Modify: `apps/cms/src/seed/importarCrm.ts` (bloco que cria oportunidades)

**Interfaces:**
- Consumes: `planejarMigracaoOportunidade` (Task 1).
- Produces: os itens de `plano.criarOportunidades` passam a carregar `estagio`, `situacao`, `migracaoPendenteRevisao` e `migracaoFlag` no lugar de `status`.

- [ ] **Step 1: Escrever o teste que falha**

Em `apps/cms/src/lib/crm/importadorCrm.test.ts`, acrescentar dentro do `describe` existente:

```ts
  it("traduz o status legado do export para estágio e situação do funil P0", () => {
    const plano = planejarImportacao(dados, existentes);
    const oportunidade = plano.criarOportunidades[0];
    expect(oportunidade.data).toMatchObject({
      estagio: "negociacao-tramitacao",
      situacao: "ativa",
      migracaoPendenteRevisao: false,
      migracaoFlag: null,
    });
  });

  it("marca revisão quando o status legado é ambíguo", () => {
    const ambiguo: ExportCrmLegado = {
      ...dados,
      tabelas: {
        ...dados.tabelas,
        oportunidades: [{ ...dados.tabelas.oportunidades[0], status: "Contratada" }],
      },
    };
    const plano = planejarImportacao(ambiguo, existentes);
    expect(plano.criarOportunidades[0].data).toMatchObject({
      estagio: "contratacao-em-formalizacao",
      migracaoPendenteRevisao: true,
    });
    expect(plano.criarOportunidades[0].data.migracaoFlag).toContain("[VALIDAR COM A DIREÇÃO]");
  });
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- importadorCrm`
Expected: FAIL — o `data` ainda traz `status` e não tem `estagio`.

- [ ] **Step 3: Implementar**

Em `importadorCrm.ts`, importar `planejarMigracaoOportunidade` de `@ntc/lib` e trocar a linha do `status` (hoje `status: slugValidado(texto(registro, "status"), STATUS_OPORTUNIDADE, avisos, contexto),`) por:

```ts
      // O funil P0 é a fonte; `status` legado é derivado pelo hook da coleção.
      ...(() => {
        const plano = planejarMigracaoOportunidade(
          slugValidado(texto(registro, "status"), STATUS_OPORTUNIDADE, avisos, contexto),
        );
        return {
          estagio: plano.estagio,
          situacao: plano.situacao,
          migracaoPendenteRevisao: plano.revisao,
          migracaoFlag: plano.revisao ? plano.flag : null,
        };
      })(),
```

Em `apps/cms/src/seed/importarCrm.ts`, no `data` do `create` de oportunidades, trocar `status: item.data.status as StatusOportunidade,` por:

```ts
      estagio: item.data.estagio as EstagioOportunidade,
      situacao: item.data.situacao as SituacaoOportunidade,
      migracaoPendenteRevisao: item.data.migracaoPendenteRevisao,
      migracaoFlag: item.data.migracaoFlag,
```

e declarar os aliases de tipo junto dos que já existem no topo do arquivo:

```ts
type EstagioOportunidade = RequiredDataFromCollectionSlug<"oportunidades">["estagio"];
type SituacaoOportunidade = RequiredDataFromCollectionSlug<"oportunidades">["situacao"];
```

(remover o alias `StatusOportunidade` se ele ficar sem uso — lint acusa).

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- importadorCrm`
Expected: PASS, incluindo os testes que já existiam no arquivo.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/crm/importadorCrm.ts apps/cms/src/lib/crm/importadorCrm.test.ts apps/cms/src/seed/importarCrm.ts
git commit -m "feat(crm): importador legado passa a gravar estagio e situacao"
```

---

### Task 8: Fechamento da sessão

**Files:**
- Modify: `CLAUDE.md` (§19.1 contagem de coleções e §19.2/§19.3)
- Modify: `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` (marcar H1 concluída)
- Modify: `docs/16_Roadmap_CMS_CRM_v1.md` (bloco da Janela H)

- [ ] **Step 1: Suíte completa**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: tudo verde no monorepo inteiro.

- [ ] **Step 2: Build de produção**

Com o `pnpm dev` **parado** (o `.next` é compartilhado e o build o corrompe):

Run: `pnpm build`
Expected: build sem erros. Depois: `rm -rf apps/cms/.next` antes de subir o dev de novo.

- [ ] **Step 3: Checkpoint visual (humano)**

Subir `pnpm dev`, abrir `/crm` e pedir a aprovação do usuário (`CLAUDE.md` §6, validação visual é humana, não screenshot automatizado): lista de Oportunidades com as colunas Estágio e Situação; formulário com os dois selects; detalhe com selos, histórico e — numa oportunidade migrada de Perdida — o aviso de estágio provisório; Dashboard e gráficos **sem regressão** (continuam lendo o espelho legado).

- [ ] **Step 4: Atualizar a documentação de governança**

- `CLAUDE.md` §19.1: coleções sobem de 18 para 19 (`historico-estagio`); §19.2 ganha uma linha sobre a fundação do funil P0; §19.3 registra que a Janela H começou.
- `docs/17` §4: marcar **Sessão H1 ✅ concluída** com a data, o que entrou e o que ficou (fila de revisão sem tela até H7).
- `docs/16`: mesma marcação no bloco da Janela H.

- [ ] **Step 5: Commit final**

```bash
git add CLAUDE.md docs/16_Roadmap_CMS_CRM_v1.md docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md
git commit -m "docs: registra a conclusao da Sessao H1 (fundacao do funil P0)"
```

---

## Cobertura da spec

| Requisito da Sessão H1 (docs/17 §4) | Onde |
|---|---|
| `ESTAGIO_OPORTUNIDADE` (11), `SITUACAO_OPORTUNIDADE` (3), espelho legado | Task 1 |
| Campos `estagio`, `situacao`, `migracaoPendenteRevisao`, `migracaoFlag` | Task 2 (nullable) + Task 6 (required) |
| `status` mantido, marcado como legado, preenchido em `beforeChange` | Task 2, Step 6 |
| Coleção `historico-estagio` append-only, gravada em `afterChange` | Task 2 |
| **M1** — oportunidade migrada legível como migrada na tela | Task 2 (campos), Task 5 (lista e detalhe), Task 6 (script) |
| **M6** — toda transição com autor legível | Task 2 (regra + teste), Task 6 (ator "migração automática") |
| **M4** — obrigatórios reais da oportunidade | Task 6, Step 7 |
| UI: lista, formulário, detalhe, selos | Task 5 |
| `GraficosComercial`/`TelaPainelComercial` intocados nesta sessão | garantido pelo espelho legado (Task 2) e verificado no Step 3 da Task 8 |
| Script de migração com dry-run e fila de revisão | Task 6 |
| Importador gravando o funil novo | Task 7 |
| Ordem do §5 (backup → dev parado → diff → push nullable → dry-run → aplicar → required) | Task 2 Step 9, Task 6 Steps 4 e 8 |

**Fora do escopo desta sessão, por decisão da spec:** gates de "Qualificada" e "Ganha" (H3/H5), coleções de qualificação/contratação/handoff (H2/H4/H5), tela da fila de revisão e funil do Dashboard por estágio (H7), remoção do campo legado (sessão própria pós-H7).

---

## Planos seguintes da Janela H

Esta sessão é a fundação; cada bloco abaixo vira um plano próprio, escrito quando o anterior estiver mergeado — o modelo de dados de um influencia o teste do outro, e planejar tudo agora envelheceria antes de ser executado.

| Plano | Sessões | Entrega |
|---|---|---|
| 2 | H2 + H3 | Coleção `avaliacoes-qualificacao` (9 dimensões, score, 7 hard gates, unicidade transacional da vigente) e a porta do estágio "Qualificada" com as 10 condições do manual §18 |
| 3 | H4 + H5 | `contratacao`, `instrumentos-formalizacao`, `handoff`, perfil `operacoes` e a porta de "Ganha" (manual §§26, 28, 29) |
| 4 | H6 + H7 | Integridade de exclusão, `audit-log` finalmente escrito, grupo de menu novo, funil do Dashboard por estágio e tela da fila de revisão de migração |
| 5 | H8 | Reedição do Manual Operacional em v1.1 e recaptura das telas (documentação, sem código) |

**Pré-requisitos que continuam com o PO** (docs/17 §3): a especificação `NTC_CRM_EspecificacaoTecnica_P0_v1.0_RELEASE` (decisão #1, bloqueia esta sessão), a ratificação do *Accountable* (#2, plano 3), o perfil Operações (#3, plano 3), a revisão da fila de migração (#4, encerramento desta sessão), a política de exclusão (#5, plano 4) e a régua COM-04 (#7, plano 2).

---

*Portal Grupo NTC · plano da Sessão H1 · 4 de setembro de 2026 · Instituto NTC do Brasil*
