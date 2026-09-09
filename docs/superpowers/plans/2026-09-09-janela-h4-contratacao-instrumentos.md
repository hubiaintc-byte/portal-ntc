# Janela H · Sessão H4 — Contratação e Instrumentos de Formalização

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a contratação deixa de ser um campo de status na oportunidade e vira entidade própria com lastro documental — e o ato de formalizar passa a exigir perfil autorizado, data, responsável e ao menos um instrumento vinculado, com registro auditável.

**Architecture:** as regras vivem em funções puras em `packages/lib/src/crm/contratacao.ts`, testadas sem banco — mesmo padrão de `crm/funil.ts` (H1) e `crm/qualificacao.ts` (H2). Duas coleções novas: `contratacao` (1:1 com a oportunidade, com `unique` no relacionamento) e `instrumentos-formalizacao`. A porta da formalização entra como `beforeChange` em `contratacao`, no mesmo formato do gate de "Qualificada" da H3: uma função pura decide *se* esta escrita é a transição para `Formalizada` e contra qual id, e uma ponte fina consulta a Local API. O registro em `audit-log` sai em `afterChange`, na mesma transação, por um helper que a H6 vai estender em vez de refazer.

**Tech Stack:** TypeScript strict · Payload CMS 3 (postgres adapter, Local API) · Next.js 15 App Router (Server Actions) · Vitest · pnpm workspaces + Turbo.

**Spec:** `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` — §1.2 (as entidades), §1.3 (as regras e as cardinalidades), §4 Sessão H4. **Fonte normativa do método:** Manual Operacional `NTC-COM-CRM-01` v1.0 FINAL — §26 (o checklist da formalização) e §38 (o papel *Accountable*). **Fonte visual e das strings:** protótipo `NTC_Comercial_Premium_v3.3_P0_CHECKPOINT.html`, linhas 4606-4620 (as regras) e 4766-4795 (o schema das duas entidades).

## Global Constraints

- **TypeScript strict. Sem `any`, sem `unknown` quando há tipo conhecido, sem `@ts-ignore`, sem `eslint-disable`, sem `as` que force um tipo mentindo** (`CLAUDE.md` §4.1, §4.4, §5.7).
- **Nomes em português** para conceitos comerciais NTC; componentes `PascalCase.tsx`; imports absolutos `@/` dentro do app (`CLAUDE.md` §4.2, §4.3).
- **Commits em português, Conventional Commits, sem emojis, com acentuação correta** (`CLAUDE.md` §7.2).
- **`pnpm payload:push:schema` é manual**: dev parado, diff revisado, `N` em qualquer `DATA LOSS`. Nenhum agente roda sozinho — o plano marca onde parar.
- **Nunca rodar `pnpm build` com o dev server no ar** — o `.next` é compartilhado. O sintoma é um `ENOENT` em `.next/server/app/.../page.js.nft.json` no *collecting build traces*, com as páginas todas geradas antes dele.
- **As mensagens de bloqueio são contratuais.** Os textos do §26 do manual são exatamente as strings do protótipo; a equipe será treinada neles. Reproduzir verbatim, **inclusive os nomes de campo em snake_case dentro da mensagem** (`formalizada_em, formalizada_por`) — é o que a H2 já fez com `(status_avaliacao)` no §18.
- **Escrita passa o usuário da sessão para a Local API.** Padrão estabelecido na H1 (`obterUsuarioAutenticado()` → `payload.create/update({ user })`); toda escrita nova segue.
- **Formalizar não é derivação.** Nenhum hook move status para `Formalizada` sozinho, e nada preenche `formalizadaEm`/`formalizadaPor` automaticamente: o ato é decisão registrada de quem tem o papel, como o `resultado` da avaliação na H2.

### Decisões desta sessão, já tomadas — não relitigar

1. **Quem formaliza:** `super-admin`. A decisão #2 de `docs/17` §3 foi ratificada em 09/09/2026; o Manual §26/§38 já firmava "Administrador no P0" e `super-admin` é o perfil equivalente no portal. `atendimento-comercial` prepara a contratação e vincula instrumentos, mas apanha na transição. **Nenhum perfil novo nesta sessão** — o de Operações é da H5.
2. **Divergência deliberada do protótipo, uma só:** a mensagem de perfil do protótipo termina com `[VALIDAR COM A DIREÇÃO/JURÍDICO]`. Esse sufixo é marcador de desenvolvimento de uma decisão que agora está ratificada — **sai**. A mensagem fica `"Formalização bloqueada: apenas perfil autorizado (Accountable/GOV-04) pode formalizar."` A Task 6 registra isso como item novo para a reedição do manual (H8).
3. **Evidência documental é URL, não upload.** Num contrato B2G o instrumento autêntico vive no sistema do órgão (SEI, processo administrativo, Diário Oficial); o portal aponta para ele. Sem storage novo, sem retenção LGPD nova. Anexo é escopo da Janela F, se o Financeiro precisar.
4. **Auditoria:** a H4 grava **só o ato de formalizar**, por um helper `registrarAuditoria()` próprio e testado. A H6 estende esse helper para as demais entidades. `"formalizar"` entra no enum `acao` do `audit-log` — aditivo, no mesmo push que as duas tabelas novas exigem.
5. **Nenhuma interação com o estágio da oportunidade.** Criar ou formalizar uma contratação **não** move a oportunidade para "Contratação em Formalização", e a criação da contratação **não** é gateada pelo estágio. O protótipo não tem essa regra, e no P0 estágio é decisão registrada, não derivação.
6. **Fora de escopo, por decisão:** `beforeDelete` e a integridade de exclusão do §1.3 são da **H6** (junto com a decisão #5 do PO); a porta de "Ganha" e o handoff são da **H5**. Nesta janela uma contratação formalizada ainda pode ser apagada por super-admin.
7. **Empenho aqui é *tipo de instrumento*, não entidade financeira.** Se a Janela F precisar de empenho com valor empenhado, saldo e liquidação, a relação é `instrumento ↔ empenho`, nunca duplicação. A Task 6 registra a decisão em `docs/17`; nada de código nesta sessão.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `packages/lib/src/crm/contratacao.ts` **(criar)** | Listas, `ContratacaoP0`, `contratacaoPermiteFormalizar` — as três condições do §26 — e a mensagem da cardinalidade 1:1. Puro. |
| `packages/lib/src/crm/contratacao.test.ts` **(criar)** | Um caso por condição de bloqueio. |
| `packages/lib/src/index.ts` **(modificar)** | Reexports. |
| `apps/cms/src/lib/crm/auditoria.ts` **(criar)** | `registrarAuditoria()` e `ipDeCabecalhos()` — a única escrita no `audit-log`. |
| `apps/cms/src/lib/crm/auditoria.test.ts` **(criar)** | Testes do helper com Local API mockada. |
| `apps/cms/src/collections/AuditLog.ts` **(modificar)** | `"formalizar"` no enum `acao`. |
| `apps/cms/src/collections/Contratacao.ts` **(criar)** | A coleção agregadora, 1:1 com a oportunidade. |
| `apps/cms/src/collections/InstrumentosFormalizacao.ts` **(criar)** | Os documentos que sustentam a contratação. |
| `apps/cms/src/lib/crm/unicidadeContratacao.ts` **(criar)** | Filtro e consulta da cardinalidade 1:1. Ponte fina. |
| `apps/cms/src/lib/crm/unicidadeContratacao.test.ts` **(criar)** | Testes do filtro e da consulta. |
| `apps/cms/src/lib/crm/formalizacao.ts` **(criar)** | `decisaoPortaFormalizacao` (pura), `erroDaPortaFormalizacao` (ponte) e `ErroRegraContratacao`. |
| `apps/cms/src/lib/crm/formalizacao.test.ts` **(criar)** | Testes da decisão e da ponte. |
| `apps/cms/src/payload.config.ts` **(modificar)** | Registra as duas coleções. |
| `apps/cms/src/lib/cms/painelCrm.ts` **(modificar)** | `ContratacaoResumo`, `ContratacaoDetalhe`, `InstrumentoResumo`, `listarContratacoesCrm`, `obterContratacaoCrm`. |
| `apps/cms/src/lib/cms/painelCrmEscrita.ts` **(modificar)** | `DadosContratacao`, `DadosInstrumento`, `criarContratacao`, `atualizarContratacao`, `criarInstrumento`, `atualizarInstrumento`; captura de `ErroRegraContratacao`. |
| `apps/cms/src/lib/cms/painelCrmEscrita.contratacao.test.ts` **(criar)** | Testes da escrita das duas entidades. |
| `apps/cms/src/app/(painel)/acoesCrm.ts` **(modificar)** | Server Actions da contratação e do instrumento. |
| `apps/cms/src/app/(painel)/crm/TelaContratacao.tsx` **(criar)** | Lista de contratações. |
| `apps/cms/src/app/(painel)/crm/DetalheContratacao.tsx` **(criar)** | Detalhe com o bloco de instrumentos e o botão de formalizar. |
| `apps/cms/src/app/(painel)/crm/FormContratacao.tsx` **(criar)** | Formulário de criação/edição da contratação. |
| `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` **(modificar)** | `TelaCrmId` ganha `"contratacao"`; item no grupo P0. |
| `apps/cms/src/app/(painel)/crm/seloStatus.ts` **(modificar)** | `seloDeContratacao`, `seloDeInstrumento`. |
| `apps/cms/src/app/(painel)/crm/page.tsx` **(modificar)** | Carrega a lista e passa ao `ShellCrm`. |

---

### Task 1: Regras puras da contratação (`@ntc/lib`)

**Files:**
- Create: `packages/lib/src/crm/contratacao.ts`
- Create: `packages/lib/src/crm/contratacao.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Consumes: `opcoes`, `OpcaoLista` de `./listas`.
- Produces:
  - `STATUS_CONTRATACAO`, `TIPO_INSTRUMENTO`, `STATUS_INSTRUMENTO: OpcaoLista[]`
  - `MSG_CONTRATACAO_DUPLICADA: string`
  - `interface ContratacaoP0` e `interface ContextoFormalizacao`
  - `relacaoPreenchida(v: ContratacaoP0["formalizadaPor"]): boolean`
  - `contratacaoPermiteFormalizar(c: ContratacaoP0 | null, ctx: ContextoFormalizacao): string | null`

- [ ] **Step 1: Escrever o teste que falha**

Criar `packages/lib/src/crm/contratacao.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  MSG_CONTRATACAO_DUPLICADA,
  STATUS_CONTRATACAO,
  STATUS_INSTRUMENTO,
  TIPO_INSTRUMENTO,
  contratacaoPermiteFormalizar,
  relacaoPreenchida,
  type ContratacaoP0,
} from "./contratacao";

/** Contratação que cumpre as três condições do §26 — base dos casos negativos. */
function contratacaoPronta(): ContratacaoP0 {
  return {
    status: "formalizada",
    formalizadaEm: "2026-09-15",
    formalizadaPor: 4,
  };
}

const CONTEXTO_OK = { perfilAutorizado: true, instrumentosVinculados: 1 };

describe("listas do P0", () => {
  it("tem os três status de contratação do manual", () => {
    expect(STATUS_CONTRATACAO.map((o) => o.value)).toEqual([
      "em-formalizacao",
      "formalizada",
      "cancelada",
    ]);
  });

  it("tem os seis tipos de instrumento do manual", () => {
    expect(TIPO_INSTRUMENTO.map((o) => o.value)).toEqual([
      "contrato",
      "empenho",
      "termo",
      "aditivo",
      "substituicao",
      "documento-equivalente",
    ]);
  });

  it("tem os três status de instrumento do manual", () => {
    expect(STATUS_INSTRUMENTO.map((o) => o.value)).toEqual(["vigente", "substituido", "anulado"]);
  });
});

describe("relacaoPreenchida", () => {
  it("aceita id cru e relação populada", () => {
    expect(relacaoPreenchida(4)).toBe(true);
    expect(relacaoPreenchida("4")).toBe(true);
    expect(relacaoPreenchida({ id: 4 })).toBe(true);
  });

  it("recusa vazio em qualquer das formas", () => {
    expect(relacaoPreenchida(null)).toBe(false);
    expect(relacaoPreenchida(undefined)).toBe(false);
    expect(relacaoPreenchida("")).toBe(false);
    expect(relacaoPreenchida("   ")).toBe(false);
    expect(relacaoPreenchida({ id: null })).toBe(false);
  });
});

describe("contratacaoPermiteFormalizar — as três condições do manual §26", () => {
  it("libera quando perfil, data, responsável e instrumento estão presentes", () => {
    expect(contratacaoPermiteFormalizar(contratacaoPronta(), CONTEXTO_OK)).toBeNull();
  });

  it("bloqueia quando a contratação não existe", () => {
    expect(contratacaoPermiteFormalizar(null, CONTEXTO_OK)).toBe(
      "Formalização bloqueada: contratação não encontrada.",
    );
  });

  it("bloqueia perfil não autorizado antes de olhar o resto", () => {
    expect(
      contratacaoPermiteFormalizar(
        { status: "formalizada" },
        { perfilAutorizado: false, instrumentosVinculados: 0 },
      ),
    ).toBe(
      "Formalização bloqueada: apenas perfil autorizado (Accountable/GOV-04) pode formalizar.",
    );
  });

  it("bloqueia sem data de formalização", () => {
    const c = { ...contratacaoPronta(), formalizadaEm: "   " };
    expect(contratacaoPermiteFormalizar(c, CONTEXTO_OK)).toBe(
      "Formalização bloqueada: exige data de formalização e responsável (formalizada_em, formalizada_por).",
    );
  });

  it("bloqueia sem responsável", () => {
    const c = { ...contratacaoPronta(), formalizadaPor: null };
    expect(contratacaoPermiteFormalizar(c, CONTEXTO_OK)).toBe(
      "Formalização bloqueada: exige data de formalização e responsável (formalizada_em, formalizada_por).",
    );
  });

  it("aceita a data vinda como Date do adapter", () => {
    const c = { ...contratacaoPronta(), formalizadaEm: new Date("2026-09-15T03:00:00.000Z") };
    expect(contratacaoPermiteFormalizar(c, CONTEXTO_OK)).toBeNull();
  });

  it("bloqueia sem nenhum instrumento vinculado", () => {
    expect(
      contratacaoPermiteFormalizar(contratacaoPronta(), {
        perfilAutorizado: true,
        instrumentosVinculados: 0,
      }),
    ).toBe("Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.");
  });
});

describe("cardinalidade 1:1", () => {
  it("tem a mensagem contratual do manual", () => {
    expect(MSG_CONTRATACAO_DUPLICADA).toBe(
      "Já existe uma contratação vinculada a esta oportunidade. O modelo P0 permite apenas uma contratação agregadora por oportunidade.",
    );
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/lib test`
Expected: FAIL — `Failed to resolve import "./contratacao"`.

- [ ] **Step 3: Implementar**

Criar `packages/lib/src/crm/contratacao.ts`:

```ts
/**
 * Contratação e instrumentos de formalização — P0 (docs/17 §1.2 e §1.3;
 * Manual NTC-COM-CRM-01 §26 e §38). Puro, sem I/O: as mesmas regras servem
 * ao hook da coleção e ao resumo da tela.
 *
 * As mensagens de bloqueio são contratuais: a equipe é treinada nelas e o
 * §26 do manual as reproduz palavra por palavra — inclusive os nomes de
 * campo em snake_case que aparecem dentro do texto. Não reescrever.
 */

import { opcoes, type OpcaoLista } from "./listas";

export const STATUS_CONTRATACAO: OpcaoLista[] = opcoes([
  "Em formalização",
  "Formalizada",
  "Cancelada",
]);

/** Os seis tipos do §1.2. "Empenho" aqui é tipo de instrumento, não entidade financeira. */
export const TIPO_INSTRUMENTO: OpcaoLista[] = opcoes([
  "Contrato",
  "Empenho",
  "Termo",
  "Aditivo",
  "Substituição",
  "Documento equivalente",
]);

export const STATUS_INSTRUMENTO: OpcaoLista[] = opcoes(["Vigente", "Substituído", "Anulado"]);

/** Cardinalidade 1:1 Oportunidade × Contratação (QA-11 do protótipo, §26 do manual). */
export const MSG_CONTRATACAO_DUPLICADA =
  "Já existe uma contratação vinculada a esta oportunidade. O modelo P0 permite apenas uma contratação agregadora por oportunidade.";

/** Forma mínima da contratação que as regras leem — a coleção tem mais campos. */
export interface ContratacaoP0 {
  status?: string | null;
  formalizadaEm?: string | Date | null;
  formalizadaPor?: number | string | { id?: number | string | null } | null;
  [campo: string]: unknown;
}

/** O que só o mundo com I/O sabe: quem escreve e quantos instrumentos já existem. */
export interface ContextoFormalizacao {
  perfilAutorizado: boolean;
  instrumentosVinculados: number;
}

/** Relacionamento preenchido, aceitando id cru ou a relação populada (`depth > 0`). */
export function relacaoPreenchida(v: ContratacaoP0["formalizadaPor"]): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "object") return v.id !== null && v.id !== undefined;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

/**
 * Data preenchida. Aceita `Date` além de string ISO porque o adapter pode
 * devolver qualquer das duas formas — foi o que quase recarimbou a data de
 * conclusão da avaliação na H2.
 */
const dataPreenchida = (v: unknown): boolean =>
  (typeof v === "string" && v.trim().length > 0) || v instanceof Date;

/**
 * As três condições do §26 para o ato de formalizar, na ordem em que o manual
 * as lista. Devolve a mensagem da PRIMEIRA que falhar, ou `null` quando todas
 * passam.
 *
 * Não decide se a escrita É a transição para Formalizada — isso é
 * `decisaoPortaFormalizacao`, do lado do hook, que conhece `data`/`originalDoc`.
 */
export function contratacaoPermiteFormalizar(
  contratacao: ContratacaoP0 | null,
  contexto: ContextoFormalizacao,
): string | null {
  if (contratacao === null) return "Formalização bloqueada: contratação não encontrada.";
  if (!contexto.perfilAutorizado) {
    return "Formalização bloqueada: apenas perfil autorizado (Accountable/GOV-04) pode formalizar.";
  }
  if (!dataPreenchida(contratacao.formalizadaEm) || !relacaoPreenchida(contratacao.formalizadaPor)) {
    return "Formalização bloqueada: exige data de formalização e responsável (formalizada_em, formalizada_por).";
  }
  if (contexto.instrumentosVinculados < 1) {
    return "Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.";
  }
  return null;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/lib test`
Expected: PASS — 11 testes em `contratacao.test.ts`.

- [ ] **Step 5: Exportar no índice**

Em `packages/lib/src/index.ts`, um bloco novo logo depois do bloco de `./crm/qualificacao`:

```ts
export {
  STATUS_CONTRATACAO,
  TIPO_INSTRUMENTO,
  STATUS_INSTRUMENTO,
  MSG_CONTRATACAO_DUPLICADA,
  relacaoPreenchida,
  contratacaoPermiteFormalizar,
  type ContratacaoP0,
  type ContextoFormalizacao,
} from "./crm/contratacao";
```

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @ntc/lib typecheck && pnpm --filter @ntc/lib lint`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add packages/lib/src/crm/contratacao.ts packages/lib/src/crm/contratacao.test.ts packages/lib/src/index.ts
git commit -m "feat(crm): adiciona as regras puras da contratação e da formalização"
```

---

### Task 2: Helper de auditoria

**Files:**
- Create: `apps/cms/src/lib/crm/auditoria.ts`
- Create: `apps/cms/src/lib/crm/auditoria.test.ts`
- Modify: `apps/cms/src/collections/AuditLog.ts`

**Interfaces:**
- Consumes: nada de `@ntc/lib`; só tipos do `payload`.
- Produces:
  - `type AcaoAuditada`
  - `interface RegistroAuditoria { acao; entidade; entidadeId; descricao; metadata? }`
  - `ipDeCabecalhos(headers): string | null`
  - `registrarAuditoria(payload, registro, req?): Promise<void>`

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/auditoria.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { ipDeCabecalhos, registrarAuditoria } from "./auditoria";

function payloadFalso() {
  const create = vi.fn().mockResolvedValue({ id: 1 });
  return { payload: { create } as never, create };
}

const REGISTRO = {
  acao: "formalizar" as const,
  entidade: "contratacao",
  entidadeId: 7,
  descricao: "Contratação CTR-7 formalizada",
};

describe("ipDeCabecalhos", () => {
  it("lê o primeiro IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(ipDeCabecalhos(headers)).toBe("203.0.113.9");
  });

  it("cai para x-real-ip quando não há x-forwarded-for", () => {
    expect(ipDeCabecalhos(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("devolve null sem cabeçalhos", () => {
    expect(ipDeCabecalhos(undefined)).toBeNull();
    expect(ipDeCabecalhos(new Headers())).toBeNull();
  });
});

describe("registrarAuditoria", () => {
  it("grava na coleção audit-log com overrideAccess", async () => {
    const { payload, create } = payloadFalso();
    await registrarAuditoria(payload, REGISTRO);
    const args = create.mock.calls[0]![0] as {
      collection: string;
      overrideAccess: boolean;
      data: Record<string, unknown>;
    };
    expect(args.collection).toBe("audit-log");
    expect(args.overrideAccess).toBe(true);
    expect(args.data).toMatchObject({
      acao: "formalizar",
      entidade: "contratacao",
      entidadeId: "7",
      descricao: "Contratação CTR-7 formalizada",
    });
  });

  it("repassa req para entrar na mesma transação e tira usuário e IP dele", async () => {
    const { payload, create } = payloadFalso();
    const req = {
      user: { id: 4 },
      headers: new Headers({ "x-forwarded-for": "203.0.113.9" }),
    } as never;
    await registrarAuditoria(payload, REGISTRO, req);
    const args = create.mock.calls[0]![0] as { req: unknown; data: Record<string, unknown> };
    expect(args.req).toBe(req);
    expect(args.data).toMatchObject({ usuario: 4, ip: "203.0.113.9" });
  });

  it("não inventa usuário quando a requisição não tem um", async () => {
    const { payload, create } = payloadFalso();
    await registrarAuditoria(payload, REGISTRO, { headers: new Headers() } as never);
    const args = create.mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(args.data.usuario).toBeNull();
    expect(args.data.ip).toBeNull();
  });

  it("propaga a falha em vez de engolir — ato auditável falha fechado", async () => {
    const create = vi.fn().mockRejectedValue(new Error("banco fora"));
    await expect(registrarAuditoria({ create } as never, REGISTRO)).rejects.toThrow("banco fora");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- auditoria`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar**

Criar `apps/cms/src/lib/crm/auditoria.ts`:

```ts
/**
 * Escrita do log de auditoria (`audit-log`, doc 11 §12). A coleção nega
 * `create` a todo perfil por access control — o registro nasce só aqui,
 * dentro de um hook, com `overrideAccess: true`.
 *
 * A Sessão H4 chama isto de um ponto só: o ato de formalizar uma contratação.
 * A Sessão H6 (integridade e auditoria) estende este helper para as demais
 * entidades e para `afterDelete`/login, em vez de escrever outro.
 *
 * **Falha fechado, de propósito.** O erro não é engolido: como a escrita
 * acontece dentro da transação do Payload (`req` repassado), uma falha aqui
 * desfaz o ato junto. Formalização é ato com efeito contratual — melhor não
 * acontecer do que acontecer sem rastro.
 */

import type { Payload, PayloadRequest } from "payload";

export type AcaoAuditada =
  | "criar"
  | "atualizar"
  | "publicar"
  | "despublicar"
  | "deletar"
  | "login"
  | "logout"
  | "formalizar";

export interface RegistroAuditoria {
  acao: AcaoAuditada;
  /** Slug da coleção, como o usuário a conhece. */
  entidade: string;
  entidadeId: number | string;
  descricao: string;
  metadata?: Record<string, unknown>;
}

/** Forma mínima dos cabeçalhos que a extração de IP lê. */
interface CabecalhosLegiveis {
  get(nome: string): string | null;
}

/**
 * IP de quem escreve. `x-forwarded-for` pode trazer a cadeia inteira de
 * proxies — o primeiro item é o cliente. `x-real-ip` é o fallback.
 */
export function ipDeCabecalhos(headers: CabecalhosLegiveis | undefined | null): string | null {
  if (!headers) return null;
  const encaminhado = headers.get("x-forwarded-for");
  if (encaminhado !== null && encaminhado.trim().length > 0) {
    return encaminhado.split(",")[0]!.trim();
  }
  const real = headers.get("x-real-ip");
  return real !== null && real.trim().length > 0 ? real.trim() : null;
}

const idDoUsuario = (req: PayloadRequest | undefined): number | string | null => {
  const id = req?.user?.id;
  return id === undefined ? null : id;
};

/** Grava uma linha no `audit-log`. `req` mantém a escrita na mesma transação. */
export async function registrarAuditoria(
  payload: Payload,
  registro: RegistroAuditoria,
  req?: PayloadRequest,
): Promise<void> {
  await payload.create({
    collection: "audit-log",
    overrideAccess: true,
    data: {
      usuario: idDoUsuario(req),
      acao: registro.acao,
      entidade: registro.entidade,
      entidadeId: String(registro.entidadeId),
      descricao: registro.descricao,
      metadata: registro.metadata ?? null,
      ip: ipDeCabecalhos(req?.headers),
    },
    req,
  });
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- auditoria`
Expected: PASS — 7 testes.

- [ ] **Step 5: Acrescentar `"formalizar"` ao enum**

Em `apps/cms/src/collections/AuditLog.ts`, na lista de `options` do campo `acao`, acrescentar `"formalizar"` ao final do array:

```ts
      options: [
        "criar",
        "atualizar",
        "publicar",
        "despublicar",
        "deletar",
        "login",
        "logout",
        "formalizar",
      ].map((a) => ({ label: a, value: a })),
```

E atualizar o docblock da coleção: onde hoje diz "A escrita acontece exclusivamente via hooks internos (ainda a desenvolver em janelas posteriores)", passar a dizer que a escrita acontece por `registrarAuditoria()` (`lib/crm/auditoria.ts`), que a Sessão H4 liga para o ato de formalizar e a H6 estende para as demais entidades.

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: verde.

- [ ] **Step 7: Commit**

```bash
git add apps/cms/src/lib/crm/auditoria.ts apps/cms/src/lib/crm/auditoria.test.ts apps/cms/src/collections/AuditLog.ts
git commit -m "feat(cms): liga o log de auditoria com um helper reutilizável"
```

---

### Task 3: Coleções `contratacao` e `instrumentos-formalizacao`

**Files:**
- Create: `apps/cms/src/lib/crm/unicidadeContratacao.ts`
- Create: `apps/cms/src/lib/crm/unicidadeContratacao.test.ts`
- Create: `apps/cms/src/collections/Contratacao.ts`
- Create: `apps/cms/src/collections/InstrumentosFormalizacao.ts`
- Modify: `apps/cms/src/payload.config.ts`

**Interfaces:**
- Consumes: `STATUS_CONTRATACAO`, `TIPO_INSTRUMENTO`, `STATUS_INSTRUMENTO`, `MSG_CONTRATACAO_DUPLICADA` (Task 1); `atendimentoComercial` e `superAdmin` de `../access/`.
- Produces:
  - `idDaRelacao(v): number | string | null`
  - `filtroOutraContratacao(oportunidadeId, contratacaoId): Where`
  - `existeOutraContratacao(payload, oportunidadeId, contratacaoId, req?): Promise<boolean>`
  - Coleções `contratacao` (interface TS `Contratacao`) e `instrumentos-formalizacao` (interface TS `InstrumentoFormalizacao`).

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/unicidadeContratacao.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import { existeOutraContratacao, filtroOutraContratacao, idDaRelacao } from "./unicidadeContratacao";

function payloadCom(totalDocs: number) {
  const count = vi.fn().mockResolvedValue({ totalDocs });
  return { payload: { count } as never, count };
}

describe("idDaRelacao", () => {
  it("aceita id cru e relação populada", () => {
    expect(idDaRelacao(7)).toBe(7);
    expect(idDaRelacao("7")).toBe("7");
    expect(idDaRelacao({ id: 7 })).toBe(7);
  });

  it("devolve null quando não há id", () => {
    expect(idDaRelacao(null)).toBeNull();
    expect(idDaRelacao(undefined)).toBeNull();
    expect(idDaRelacao({ id: null })).toBeNull();
  });
});

describe("filtroOutraContratacao", () => {
  it("filtra pela oportunidade e exclui a própria contratação", () => {
    expect(filtroOutraContratacao(7, 3)).toEqual({
      and: [{ oportunidade: { equals: 7 } }, { id: { not_equals: 3 } }],
    });
  });

  it("sem id próprio (criação), filtra só pela oportunidade", () => {
    expect(filtroOutraContratacao(7, undefined)).toEqual({
      and: [{ oportunidade: { equals: 7 } }],
    });
  });
});

describe("existeOutraContratacao", () => {
  it("é verdadeiro quando a oportunidade já tem contratação", async () => {
    const { payload } = payloadCom(1);
    expect(await existeOutraContratacao(payload, 7, undefined)).toBe(true);
  });

  it("é falso quando não há nenhuma", async () => {
    const { payload } = payloadCom(0);
    expect(await existeOutraContratacao(payload, 7, undefined)).toBe(false);
  });

  it("consulta a coleção certa com o filtro da oportunidade", async () => {
    const { payload, count } = payloadCom(0);
    await existeOutraContratacao(payload, 7, 3);
    const args = count.mock.calls[0]![0] as { collection: string; where: unknown };
    expect(args.collection).toBe("contratacao");
    expect(args.where).toEqual({
      and: [{ oportunidade: { equals: 7 } }, { id: { not_equals: 3 } }],
    });
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- unicidadeContratacao`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar a ponte da unicidade**

Criar `apps/cms/src/lib/crm/unicidadeContratacao.ts`:

```ts
/**
 * Cardinalidade 1:1 Oportunidade × Contratação (docs/17 §1.3; Manual §26,
 * QA-11 do protótipo). Ponte fina no formato de `vigenciaAvaliacao.ts`: o
 * filtro é função pura, testável sem banco; a consulta repassa `req` para
 * enxergar a mesma transação do Payload.
 *
 * O relacionamento `oportunidade` também é `unique` na coleção, o que põe a
 * garantia no Postgres. Esta consulta existe para a mensagem: a constraint
 * recusaria a escrita com um erro de banco, e o §26 exige um texto específico.
 */

import type { Payload, PayloadRequest, Where } from "payload";

/** Id de um relacionamento, aceitando a relação populada (`depth > 0`) ou só o id. */
export function idDaRelacao(
  v: number | string | { id?: number | string | null } | null | undefined,
): number | string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") return v.id ?? null;
  return v;
}

/**
 * Filtro das OUTRAS contratações da mesma oportunidade. Na criação não há id
 * próprio a excluir — qualquer contratação existente já viola a cardinalidade.
 */
export function filtroOutraContratacao(
  oportunidadeId: number | string,
  contratacaoId: number | string | undefined,
): Where {
  const clausulas: Where[] = [{ oportunidade: { equals: oportunidadeId } }];
  if (contratacaoId !== undefined) clausulas.push({ id: { not_equals: contratacaoId } });
  return { and: clausulas };
}

export async function existeOutraContratacao(
  payload: Payload,
  oportunidadeId: number | string,
  contratacaoId: number | string | undefined,
  req?: PayloadRequest,
): Promise<boolean> {
  const { totalDocs } = await payload.count({
    collection: "contratacao",
    where: filtroOutraContratacao(oportunidadeId, contratacaoId),
    req,
  });
  return totalDocs > 0;
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- unicidadeContratacao`
Expected: PASS — 7 testes.

- [ ] **Step 5: Criar a coleção `contratacao`**

Criar `apps/cms/src/collections/Contratacao.ts`:

```ts
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import { APIError } from "payload";

import { MSG_CONTRATACAO_DUPLICADA, STATUS_CONTRATACAO } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { existeOutraContratacao, idDaRelacao } from "../lib/crm/unicidadeContratacao";

/**
 * Cardinalidade 1:1 com a oportunidade. A constraint `unique` do campo é a
 * garantia real; este hook existe para o usuário receber o texto do §26 em
 * vez de um erro de banco. `req` repassado mantém a leitura na transação.
 */
const recusarContratacaoDuplicada: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const oportunidadeId = idDaRelacao(data.oportunidade ?? originalDoc?.oportunidade);
  if (oportunidadeId === null) return data;
  const proprioId = idDaRelacao(originalDoc?.id) ?? undefined;
  if (await existeOutraContratacao(req.payload, oportunidadeId, proprioId, req)) {
    throw new APIError(MSG_CONTRATACAO_DUPLICADA, 400);
  }
  return data;
};

/**
 * Contratação (P0) — docs/17 §1.2, Manual §26. Agregador 1:1 da oportunidade:
 * é o que os instrumentos de formalização sustentam e o que a porta de "Ganha"
 * (Sessão H5) vai exigir formalizado.
 *
 * A integridade de exclusão do §1.3 (não apagar contratação com instrumentos
 * ou handoff) é escopo da Sessão H6 — aqui `delete` segue liberado ao
 * super-admin.
 */
export const Contratacao: CollectionConfig = {
  slug: "contratacao",
  labels: { singular: "Contratação", plural: "Contratações" },
  typescript: { interface: "Contratacao" },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["oportunidade", "status", "formalizadaEm", "formalizadaPor"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [recusarContratacaoDuplicada],
  },
  fields: [
    {
      name: "oportunidade",
      type: "relationship",
      relationTo: "oportunidades",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Uma contratação por oportunidade (docs/17 §1.3)." },
    },
    { name: "propostaFinal", type: "relationship", relationTo: "propostas" },
    {
      name: "status",
      type: "select",
      options: STATUS_CONTRATACAO,
      required: true,
      defaultValue: "em-formalizacao",
    },
    {
      name: "formalizadaEm",
      type: "date",
      admin: { description: "Obrigatória para formalizar (Manual §26)." },
    },
    {
      name: "formalizadaPor",
      type: "relationship",
      relationTo: "users",
      admin: { description: "Responsável pelo ato. Obrigatório para formalizar (Manual §26)." },
    },
    {
      name: "observacaoFormalizacao",
      type: "textarea",
      admin: { description: "Registro auditável do ato de formalizar." },
    },
    { name: "responsavel", type: "relationship", relationTo: "users", required: true },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 6: Criar a coleção `instrumentos-formalizacao`**

Criar `apps/cms/src/collections/InstrumentosFormalizacao.ts`:

```ts
import type { CollectionConfig } from "payload";

import { STATUS_INSTRUMENTO, TIPO_INSTRUMENTO } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Instrumentos de Formalização (P0) — docs/17 §1.2. São os documentos que
 * sustentam a contratação: sem ao menos um vinculado, o §26 não deixa
 * formalizar.
 *
 * `link` é referência ao documento no sistema do órgão (SEI, processo
 * administrativo, Diário Oficial), não upload: num contrato B2G o instrumento
 * autêntico vive lá, e uma cópia no portal envelheceria contra o original.
 *
 * "Empenho" aqui é um TIPO de instrumento. Se a Janela F precisar de empenho
 * como entidade financeira (valor empenhado, saldo, liquidação), a relação é
 * `instrumento ↔ empenho`, nunca duplicação — decisão a registrar antes de F.
 */
export const InstrumentosFormalizacao: CollectionConfig = {
  slug: "instrumentos-formalizacao",
  labels: { singular: "Instrumento de Formalização", plural: "Instrumentos de Formalização" },
  typescript: { interface: "InstrumentoFormalizacao" },
  admin: {
    useAsTitle: "numero",
    defaultColumns: ["contratacao", "tipo", "numero", "data", "valor", "status"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    {
      name: "contratacao",
      type: "relationship",
      relationTo: "contratacao",
      required: true,
      index: true,
    },
    { name: "tipo", type: "select", options: TIPO_INSTRUMENTO, required: true },
    { name: "numero", type: "text" },
    { name: "data", type: "date" },
    { name: "valor", type: "number", min: 0 },
    {
      name: "status",
      type: "select",
      options: STATUS_INSTRUMENTO,
      defaultValue: "vigente",
      admin: {
        description: "Substituído/Anulado preservam o histórico em vez de apagar o instrumento.",
      },
    },
    {
      name: "link",
      type: "text",
      admin: { description: "Referência/evidência documental (URL no sistema do órgão)." },
    },
    { name: "observacoes", type: "textarea" },
  ],
};
```

- [ ] **Step 7: Registrar no config**

Em `apps/cms/src/payload.config.ts`, os imports junto dos demais (ordem alfabética: `Contratacao` depois de `ContatosCrm`; `InstrumentosFormalizacao` depois de `Especialistas`) e os dois itens no array `collections`, logo depois de `AvaliacoesQualificacao`:

```ts
import { Contratacao } from "./collections/Contratacao";
import { InstrumentosFormalizacao } from "./collections/InstrumentosFormalizacao";
```

```ts
    AvaliacoesQualificacao,
    Contratacao,
    InstrumentosFormalizacao,
```

- [ ] **Step 8: Verificar tipos e testes**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms lint`
Expected: verde.

Run: `pnpm --filter @ntc/cms typecheck`
Expected: acusa `"contratacao"` e `"instrumentos-formalizacao"` fora de `CollectionSlug` até a geração de tipos — **esperado, e não é seu para consertar**. Não contornar com `as`, `@ts-ignore` nem editando `payload-types.ts` à mão. Qualquer OUTRO erro é regressão. Relate a lista literal de erros que sobrou.

- [ ] **Step 9: PARE — sincronização de schema é do coordenador**

Não execute. O coordenador roda `pnpm payload:generate` (que lê a config e não escreve no banco) para destravar o typecheck, e o `pnpm payload:push:schema` fica para o humano na Task 6.

- [ ] **Step 10: Commit**

Commite os cinco arquivos desta task; `packages/types/src/payload-types.ts` é commitado à parte pelo coordenador.

```bash
git add apps/cms/src/collections/Contratacao.ts apps/cms/src/collections/InstrumentosFormalizacao.ts \
  apps/cms/src/lib/crm/unicidadeContratacao.ts apps/cms/src/lib/crm/unicidadeContratacao.test.ts \
  apps/cms/src/payload.config.ts
git commit -m "feat(crm): adiciona as coleções de contratação e instrumentos de formalização"
```

---

### Task 4: A porta da formalização (Manual §26)

**Files:**
- Create: `apps/cms/src/lib/crm/formalizacao.ts`
- Create: `apps/cms/src/lib/crm/formalizacao.test.ts`
- Modify: `apps/cms/src/collections/Contratacao.ts`

**Interfaces:**
- Consumes: `contratacaoPermiteFormalizar`, `ContratacaoP0` (Task 1); `registrarAuditoria` (Task 2); `idDaRelacao` (Task 3).
- Produces:
  - `class ErroRegraContratacao extends APIError` (status 400)
  - `interface CamposPortaFormalizacao`, `interface DecisaoPortaFormalizacao`
  - `decisaoPortaFormalizacao(data, originalDoc): DecisaoPortaFormalizacao`
  - `contarInstrumentos(payload, contratacaoId, req?): Promise<number>`
  - `erroDaPortaFormalizacao(payload, contratacao, contratacaoId, perfilAutorizado, req?): Promise<string | null>`
  - `ehSuperAdmin(user): boolean` exportado de `apps/cms/src/access/superAdmin.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/crm/formalizacao.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import {
  contarInstrumentos,
  decisaoPortaFormalizacao,
  erroDaPortaFormalizacao,
} from "./formalizacao";

function payloadCom(totalDocs: number) {
  const count = vi.fn().mockResolvedValue({ totalDocs });
  return { payload: { count } as never, count };
}

const CONTRATACAO_PRONTA = {
  status: "formalizada",
  formalizadaEm: "2026-09-15",
  formalizadaPor: 4,
};

describe("decisaoPortaFormalizacao", () => {
  it("aciona a porta ao transicionar para formalizada", () => {
    expect(
      decisaoPortaFormalizacao({ status: "formalizada" }, { status: "em-formalizacao", id: 3 }),
    ).toEqual({ precisaPorta: true, contratacaoId: 3 });
  });

  it("aciona a porta ao criar já formalizada, sem id a consultar", () => {
    expect(decisaoPortaFormalizacao({ status: "formalizada" }, undefined)).toEqual({
      precisaPorta: true,
      contratacaoId: undefined,
    });
  });

  it("não aciona ao editar uma contratação que já era formalizada", () => {
    expect(
      decisaoPortaFormalizacao(
        { status: "formalizada", observacoes: "ajuste" },
        { status: "formalizada", id: 3 },
      ).precisaPorta,
    ).toBe(false);
  });

  it("não aciona ao ir para qualquer outro status", () => {
    expect(
      decisaoPortaFormalizacao({ status: "cancelada" }, { status: "em-formalizacao", id: 3 })
        .precisaPorta,
    ).toBe(false);
  });

  it("não aciona ao criar em formalização", () => {
    expect(decisaoPortaFormalizacao({ status: "em-formalizacao" }, undefined).precisaPorta).toBe(
      false,
    );
  });
});

describe("contarInstrumentos", () => {
  it("conta os instrumentos vinculados àquela contratação", async () => {
    const { payload, count } = payloadCom(2);
    expect(await contarInstrumentos(payload, 3)).toBe(2);
    const args = count.mock.calls[0]![0] as { collection: string; where: unknown };
    expect(args.collection).toBe("instrumentos-formalizacao");
    expect(args.where).toEqual({ contratacao: { equals: 3 } });
  });

  it("é zero quando a contratação ainda não tem id (criação)", async () => {
    const { payload, count } = payloadCom(9);
    expect(await contarInstrumentos(payload, undefined)).toBe(0);
    expect(count).not.toHaveBeenCalled();
  });
});

describe("erroDaPortaFormalizacao", () => {
  it("libera quando perfil, data, responsável e instrumento estão presentes", async () => {
    const { payload } = payloadCom(1);
    expect(await erroDaPortaFormalizacao(payload, CONTRATACAO_PRONTA, 3, true)).toBeNull();
  });

  it("bloqueia perfil não autorizado sem nem consultar instrumentos", async () => {
    const { payload, count } = payloadCom(1);
    expect(await erroDaPortaFormalizacao(payload, CONTRATACAO_PRONTA, 3, false)).toBe(
      "Formalização bloqueada: apenas perfil autorizado (Accountable/GOV-04) pode formalizar.",
    );
    expect(count).not.toHaveBeenCalled();
  });

  it("bloqueia quando não há instrumento vinculado", async () => {
    const { payload } = payloadCom(0);
    expect(await erroDaPortaFormalizacao(payload, CONTRATACAO_PRONTA, 3, true)).toBe(
      "Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.",
    );
  });

  it("bloqueia a criação já formalizada, que não tem como ter instrumento", async () => {
    const { payload } = payloadCom(0);
    expect(await erroDaPortaFormalizacao(payload, CONTRATACAO_PRONTA, undefined, true)).toBe(
      "Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.",
    );
  });

  it("bloqueia sem data e responsável", async () => {
    const { payload } = payloadCom(1);
    expect(
      await erroDaPortaFormalizacao(payload, { status: "formalizada" }, 3, true),
    ).toBe(
      "Formalização bloqueada: exige data de formalização e responsável (formalizada_em, formalizada_por).",
    );
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- formalizacao`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar a ponte e o erro tipado**

Criar `apps/cms/src/lib/crm/formalizacao.ts`:

```ts
/**
 * A porta da formalização (Sessão H4 · docs/17 §1.3 · Manual NTC-COM-CRM-01
 * §26). Mesmo formato do gate de "Qualificada" da H3: a decisão de SE esta
 * escrita é a transição para `Formalizada` é função pura, testável sem
 * mockar a Local API; a ponte consulta o que só o banco sabe (quantos
 * instrumentos existem) e devolve o veredito da regra pura de `@ntc/lib`.
 *
 * As mensagens são contratuais (§26) e vêm inteiras de `@ntc/lib`.
 */

import { APIError } from "payload";
import type { Payload, PayloadRequest } from "payload";

import { contratacaoPermiteFormalizar, type ContratacaoP0 } from "@ntc/lib";

import { idDaRelacao } from "./unicidadeContratacao";

/**
 * Erro de negócio das regras da contratação — distinto de uma falha genérica
 * de escrita. A camada de escrita (`painelCrmEscrita.ts`) o reconhece pelo
 * tipo e repassa a mensagem íntegra ao usuário.
 *
 * Estende o `APIError` do Payload com status 400: a recusa é regra de negócio,
 * não falha do servidor — sem isso uma escrita via REST ou GraphQL devolveria
 * 500. Mesma decisão de `ErroGateQualificada` na H3.
 */
export class ErroRegraContratacao extends APIError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ErroRegraContratacao";
  }
}

/** Forma mínima do `data`/`originalDoc` do hook que a decisão lê. */
export interface CamposPortaFormalizacao {
  status?: string | null;
  id?: number | string | null;
}

export interface DecisaoPortaFormalizacao {
  /** true quando esta escrita está transicionando o status PARA "formalizada". */
  precisaPorta: boolean;
  /**
   * Id da contratação a consultar. `undefined` na criação — não há id, logo
   * não pode haver instrumento vinculado, e a porta bloqueia por essa via.
   */
  contratacaoId: number | string | undefined;
}

/**
 * Só age na transição PARA "formalizada". Editar uma contratação que já era
 * formalizada (trocar uma observação) não reabre a porta; ir para qualquer
 * outro status também não. Na criação `originalDoc` não existe, então
 * `originalDoc?.status` é `undefined` (`!== "formalizada"`) e uma contratação
 * criada DIRETO como Formalizada também passa pela porta.
 */
export function decisaoPortaFormalizacao(
  data: CamposPortaFormalizacao | null | undefined,
  originalDoc: CamposPortaFormalizacao | null | undefined,
): DecisaoPortaFormalizacao {
  const precisaPorta = originalDoc?.status !== "formalizada" && data?.status === "formalizada";
  if (!precisaPorta) return { precisaPorta: false, contratacaoId: undefined };
  return { precisaPorta: true, contratacaoId: idDaRelacao(originalDoc?.id) ?? undefined };
}

/** Instrumentos vinculados. Sem id de contratação não há o que contar: zero. */
export async function contarInstrumentos(
  payload: Payload,
  contratacaoId: number | string | undefined,
  req?: PayloadRequest,
): Promise<number> {
  if (contratacaoId === undefined) return 0;
  const { totalDocs } = await payload.count({
    collection: "instrumentos-formalizacao",
    where: { contratacao: { equals: contratacaoId } },
    req,
  });
  return totalDocs;
}

/**
 * Mensagem do §26, ou `null` quando o ato pode acontecer. O perfil é checado
 * antes da consulta ao banco — não há por que contar instrumentos de quem não
 * pode formalizar de todo jeito.
 */
export async function erroDaPortaFormalizacao(
  payload: Payload,
  contratacao: ContratacaoP0 | null,
  contratacaoId: number | string | undefined,
  perfilAutorizado: boolean,
  req?: PayloadRequest,
): Promise<string | null> {
  if (!perfilAutorizado) {
    return contratacaoPermiteFormalizar(contratacao, {
      perfilAutorizado: false,
      instrumentosVinculados: 0,
    });
  }
  const instrumentosVinculados = await contarInstrumentos(payload, contratacaoId, req);
  return contratacaoPermiteFormalizar(contratacao, { perfilAutorizado: true, instrumentosVinculados });
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- formalizacao`
Expected: PASS — 12 testes.

- [ ] **Step 5: Exportar o predicado de perfil**

Em `apps/cms/src/access/superAdmin.ts`, promover o `isSuperAdmin` privado a exportado, em português, mantendo os dois usos existentes:

```ts
/** Predicado puro do perfil — usado também fora de `Access`, nos hooks do P0. */
export const ehSuperAdmin = (user: User | null | undefined): boolean =>
  user?.perfil === "super-admin";
```

Trocar as duas referências a `isSuperAdmin` em `superAdmin` e `superAdminField` por `ehSuperAdmin` e remover a const antiga.

- [ ] **Step 6: Ligar a porta e a auditoria em `Contratacao.ts`**

Em `apps/cms/src/collections/Contratacao.ts`:

Acrescentar aos imports:

```ts
import type { CollectionAfterChangeHook } from "payload";

import { registrarAuditoria } from "../lib/crm/auditoria";
import { ehSuperAdmin } from "../access/superAdmin";
import { decisaoPortaFormalizacao, erroDaPortaFormalizacao, ErroRegraContratacao } from "../lib/crm/formalizacao";
import type { ContratacaoP0 } from "@ntc/lib";
```

Acrescentar o hook, **antes** de `recusarContratacaoDuplicada` na lista `beforeChange` — uma formalização recusada não deve nem chegar a consultar a cardinalidade:

```ts
/** Estreita o `data` do hook (tipo genérico do Payload) para a forma que a regra pura lê. */
const comoContratacaoP0 = (dados: Record<string, unknown> | null | undefined): ContratacaoP0 | null =>
  dados ?? null;

/**
 * Porta do §26. Invólucro fino: a decisão de SE esta escrita é a transição
 * para Formalizada é pura (`decisaoPortaFormalizacao`), e a consulta do que
 * só o banco sabe fica em `erroDaPortaFormalizacao`. `req.user` decide o
 * perfil: `atendimento-comercial` prepara a contratação, mas só `super-admin`
 * formaliza (decisão #2 de docs/17 §3, ratificada em 09/09/2026).
 */
const recusarFormalizacaoSemLastro: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const { precisaPorta, contratacaoId } = decisaoPortaFormalizacao(data, originalDoc);
  if (!precisaPorta) return data;
  const erro = await erroDaPortaFormalizacao(
    req.payload,
    comoContratacaoP0({ ...originalDoc, ...data }),
    contratacaoId,
    ehSuperAdmin(req.user),
    req,
  );
  if (erro !== null) throw new ErroRegraContratacao(erro);
  return data;
};
```

```ts
  hooks: {
    beforeChange: [recusarFormalizacaoSemLastro, recusarContratacaoDuplicada],
    afterChange: [auditarFormalizacao],
  },
```

E o `afterChange` que registra o ato — só quando ele de fato aconteceu:

```ts
/**
 * Registra o ato de formalizar no `audit-log`, na MESMA transação (`req`
 * repassado). Em `afterChange` e não em `beforeChange` porque o que se audita
 * é o ato consumado; se a auditoria falhar, a transação inteira desfaz — e uma
 * formalização sem rastro é pior do que uma formalização que não aconteceu.
 */
const auditarFormalizacao: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (previousDoc?.status === "formalizada" || doc.status !== "formalizada") return doc;
  await registrarAuditoria(
    req.payload,
    {
      acao: "formalizar",
      entidade: "contratacao",
      entidadeId: doc.id,
      descricao: `Contratação ${doc.id} formalizada`,
      metadata: {
        oportunidade: doc.oportunidade,
        formalizadaEm: doc.formalizadaEm,
        formalizadaPor: doc.formalizadaPor,
      },
    },
    req,
  );
  return doc;
};
```

- [ ] **Step 7: Fazer a mensagem chegar à tela**

Em `apps/cms/src/lib/cms/painelCrmEscrita.ts`, aplicar a `criarContratacao`/`atualizarContratacao` (Task 5) o mesmo tratamento que `criarOportunidade`/`atualizarOportunidade` já dão a `ErroGateQualificada`: capturar `ErroRegraContratacao` e devolver `{ ok: false, erro: mensagem }` em vez do `ERRO_GENERICO`, que esconderia justamente o que o usuário precisa ler. Qualquer outro erro segue genérico.

**Nota de ordem:** as funções de escrita nascem na Task 5. Se você está executando a Task 4 antes dela, deixe este Step para a Task 5 e registre isso no seu relatório — não crie um `painelCrmEscrita.ts` pela metade aqui.

- [ ] **Step 8: Verificar**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: verde.

- [ ] **Step 9: Commit**

```bash
git add apps/cms/src/lib/crm/formalizacao.ts apps/cms/src/lib/crm/formalizacao.test.ts \
  apps/cms/src/collections/Contratacao.ts apps/cms/src/access/superAdmin.ts
git commit -m "feat(crm): exige perfil, data, responsável e instrumento para formalizar"
```

---

### Task 5: Escrita, leitura e telas da contratação

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts`
- Create: `apps/cms/src/lib/cms/painelCrmEscrita.contratacao.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCrm.ts`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts`
- Create: `apps/cms/src/app/(painel)/crm/TelaContratacao.tsx`
- Create: `apps/cms/src/app/(painel)/crm/FormContratacao.tsx`
- Create: `apps/cms/src/app/(painel)/crm/DetalheContratacao.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`
- Modify: `apps/cms/src/app/(painel)/crm/seloStatus.ts`
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx`

**Interfaces:**
- Consumes: Tasks 1-4; `obterUsuarioAutenticado()` de `@/lib/cms/autenticacao`.
- Produces:
  - `interface DadosContratacao` — `oportunidade`, `propostaFinal`, `status`, `formalizadaEm`, `formalizadaPor`, `observacaoFormalizacao`, `responsavel`, `observacoes`, todos `string`
  - `interface DadosInstrumento` — `contratacao`, `tipo`, `numero`, `data`, `valor`, `status`, `link`, `observacoes`, todos `string`
  - `criarContratacao(dados, usuario)`, `atualizarContratacao(id, dados, usuario)`, `criarInstrumento(dados, usuario)`, `atualizarInstrumento(id, dados, usuario)` → `ResultadoEscrita`
  - `ContratacaoResumo`, `ContratacaoDetalhe`, `InstrumentoResumo`, `listarContratacoesCrm()`, `obterContratacaoCrm(id)`
  - Server Actions `salvarContratacaoCrm`, `carregarContratacaoCrm`, `salvarInstrumentoCrm`
  - `seloDeContratacao(status)`, `seloDeInstrumento(status)`
  - `TelaCrmId` ganha `"contratacao"`

- [ ] **Step 1: Escrever o teste que falha**

Criar `apps/cms/src/lib/cms/painelCrmEscrita.contratacao.test.ts`, no padrão exato de `painelCrmEscrita.avaliacao.test.ts` (leia-o antes — em especial como ele monta o `usuarioFalso` a partir de `Parameters<typeof ...>[1]`, que é o que satisfaz `UsuarioAutenticado` sem inventar campos):

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarContratacao, atualizarContratacao, criarInstrumento } = await import(
  "./painelCrmEscrita"
);
const { ErroRegraContratacao } = await import("@/lib/crm/formalizacao");

type UsuarioAutenticado = Parameters<typeof criarContratacao>[1];

const usuarioFalso: NonNullable<UsuarioAutenticado> = {
  id: 5,
  collection: "users",
  nome: "Ana Diretora",
  perfil: "super-admin",
  email: "ana@institutontc.com.br",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const dadosBase = {
  oportunidade: "7",
  propostaFinal: "2",
  status: "em-formalizacao",
  formalizadaEm: "",
  formalizadaPor: "",
  observacaoFormalizacao: "",
  responsavel: "5",
  observacoes: "",
};

const instrumentoBase = {
  contratacao: "3",
  tipo: "contrato",
  numero: "CT 12/2026",
  data: "2026-09-15",
  valor: "104400",
  status: "vigente",
  link: "https://sei.exemplo.gov.br/processo/123",
  observacoes: "",
};

function montarPayloadFalso() {
  const criados: Record<string, unknown>[] = [];
  const opcoes: Record<string, unknown>[] = [];
  obterPayloadMock.mockResolvedValue({
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      criados.push(args.data);
      opcoes.push(args as unknown as Record<string, unknown>);
      return { id: 1, ...args.data };
    }),
    update: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockResolvedValue({ docs: [] }),
  });
  return { criados, opcoes };
}

afterEach(() => vi.clearAllMocks());

describe("criarContratacao", () => {
  it("converte relacionamentos de texto para número", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarContratacao(dadosBase, usuarioFalso);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ oportunidade: 7, propostaFinal: 2, responsavel: 5 });
  });

  it("propaga o usuário da sessão para a Local API", async () => {
    const { opcoes } = montarPayloadFalso();
    await criarContratacao(dadosBase, usuarioFalso);
    expect(opcoes[0]).toMatchObject({ user: usuarioFalso });
  });

  it("recusa sem oportunidade, antes de tocar a Local API", async () => {
    montarPayloadFalso();
    const r = await criarContratacao({ ...dadosBase, oportunidade: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione a oportunidade." });
  });

  it("recusa sem responsável", async () => {
    montarPayloadFalso();
    const r = await criarContratacao({ ...dadosBase, responsavel: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione o responsável." });
  });
});

describe("atualizarContratacao", () => {
  it("repassa a mensagem íntegra do §26 em vez do erro genérico", async () => {
    obterPayloadMock.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn(),
      update: vi
        .fn()
        .mockRejectedValue(
          new ErroRegraContratacao(
            "Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.",
          ),
        ),
    });
    const r = await atualizarContratacao("3", { ...dadosBase, status: "formalizada" }, usuarioFalso);
    expect(r).toEqual({
      ok: false,
      erro: "Formalização bloqueada: exige ao menos um instrumento de formalização vinculado.",
    });
  });

  it("mantém genérico qualquer outro erro", async () => {
    obterPayloadMock.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn(),
      update: vi.fn().mockRejectedValue(new Error("conexão perdida")),
    });
    const r = await atualizarContratacao("3", dadosBase, usuarioFalso);
    expect(r.ok).toBe(false);
    expect(r.erro).not.toContain("conexão perdida");
  });
});

describe("criarInstrumento", () => {
  it("converte contratação e valor para número", async () => {
    const { criados } = montarPayloadFalso();
    const r = await criarInstrumento(instrumentoBase, usuarioFalso);
    expect(r.ok).toBe(true);
    expect(criados[0]).toMatchObject({ contratacao: 3, valor: 104400, tipo: "contrato" });
  });

  it("recusa sem contratação", async () => {
    montarPayloadFalso();
    const r = await criarInstrumento({ ...instrumentoBase, contratacao: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione a contratação." });
  });

  it("recusa sem tipo", async () => {
    montarPayloadFalso();
    const r = await criarInstrumento({ ...instrumentoBase, tipo: "" }, usuarioFalso);
    expect(r).toEqual({ ok: false, erro: "Selecione o tipo do instrumento." });
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.contratacao`
Expected: FAIL — `criarContratacao` não existe.

- [ ] **Step 3: Implementar a escrita**

Em `apps/cms/src/lib/cms/painelCrmEscrita.ts`, seguindo o formato das entidades vizinhas (`DadosAvaliacao`/`criarAvaliacao` é o modelo mais próximo): as duas interfaces com todos os campos como `string`, mappers que convertem relacionamentos e valor com os helpers já existentes no arquivo, validação **antes** de `obterPayload()`, e `user` repassado. Mensagens: `"Selecione a oportunidade."`, `"Selecione o responsável."`, `"Selecione a contratação."`, `"Selecione o tipo do instrumento."`.

As quatro funções capturam `ErroRegraContratacao` e devolvem `{ ok: false, erro: mensagem }`; qualquer outro erro segue `ERRO_GENERICO`. É o Step 7 da Task 4, executado aqui.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `pnpm --filter @ntc/cms test -- painelCrmEscrita.contratacao`
Expected: PASS — 9 testes.

- [ ] **Step 5: Leitura e Server Actions**

Em `painelCrm.ts`:
- `InstrumentoResumo`: `id`, `tipo`, `numero`, `dataISO`, `valor`, `status`, `link`.
- `ContratacaoResumo`: `id`, `oportunidadeId`, `oportunidadeCodigo`, `status`, `formalizadaEmISO`, `formalizadaPorNome`, `responsavelNome`, `instrumentosVinculados`.
- `ContratacaoDetalhe extends ContratacaoResumo`: `propostaFinalId`, `propostaFinalCodigo`, `formalizadaPorId`, `responsavelId`, `observacaoFormalizacao`, `observacoes`, `instrumentos: InstrumentoResumo[]`.
- `listarContratacoesCrm()` ordenando `-createdAt`; `obterContratacaoCrm(id)` carregando os instrumentos vinculados numa segunda consulta filtrada por `contratacao equals id`, ordenada por `data`.

Em `acoesCrm.ts`: `carregarContratacaoCrm(id)`, `salvarContratacaoCrm(id, dados)` e `salvarInstrumentoCrm(id, dados)` — sessão validada antes de qualquer leitura ou escrita, com `obterUsuarioAutenticado()` repassado à camada de escrita, exatamente como as ações da avaliação fazem.

- [ ] **Step 6: Telas**

`TelaContratacao.tsx` no padrão de `TelaQualificacao.tsx`: cabeçalho com eyebrow "Processo Comercial B2G", tabela com oportunidade, status, data de formalização, responsável e a contagem de instrumentos; botão "Nova contratação".

`FormContratacao.tsx` no padrão de `FormAvaliacao.tsx`: identificação (oportunidade, proposta final, responsável) e o bloco de formalização (status, data, responsável pelo ato, observação). O select de responsável pelo ato **default para o usuário da sessão** quando ele é super-admin — conveniência de preenchimento, não derivação: o campo continua explícito e editável.

`DetalheContratacao.tsx` no padrão de `DetalheProposta.tsx`: cabeçalho com o selo do status, os dados da contratação, e o **bloco de instrumentos** — tabela dos vinculados e um formulário inline para adicionar (tipo, número, data, valor, status, link). O botão "Formalizar" fica ao lado do bloco, e quando a escrita volta com erro a mensagem do §26 aparece **no formulário**, não em toast genérico. Mostre, ao lado do botão, o que ainda falta segundo `contratacaoPermiteFormalizar` — é a mesma regra pura, rodando no cliente como resumo ao vivo, do jeito que `FormAvaliacao` mostra o score.

Em `seloStatus.ts`: `seloDeContratacao` (em-formalizacao → atencao, formalizada → ok, cancelada → erro) e `seloDeInstrumento` (vigente → ok, substituido → atencao, anulado → erro).

Em `ShellCrm.tsx`: `TelaCrmId` ganha `"contratacao"`; entrada nova em `NAV_P0`, depois de "Qualificação (COM-04)":

```tsx
  { id: "contratacao", rotulo: "Contratação", icone: Ico.contratacao },
```

com o ícone `contratacao` acrescentado ao objeto `Ico` no estilo linear dos existentes, e a entrada `contratacao: "CRM · Contratação"` no `CRUMB`. Em `page.tsx`, carregue `listarContratacoesCrm()` junto das demais listas e passe ao `ShellCrm`.

- [ ] **Step 7: Verificar tudo**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add apps/cms/src packages
git commit -m "feat(crm): telas, escrita e leitura da contratação e dos instrumentos"
```

---

### Task 6: Fechamento da sessão

- [ ] **Step 1: Suíte completa**

Run: `pnpm lint && pnpm typecheck && pnpm test`

- [ ] **Step 2: Build**

Com o dev server **parado**: `pnpm build`. Depois: `rm -rf apps/cms/.next apps/web/.next`.

- [ ] **Step 3: PARE — push de schema (humano)**

Não execute. Peça ao humano: dev parado, `pnpm payload:push:schema` com o diff revisado (duas tabelas novas — `contratacao` e `instrumentos_formalizacao` —, o `unique` em `contratacao.oportunidade` e o valor `formalizar` acrescentado ao enum de `audit_log.acao`; tudo aditivo), `N` em qualquer `DATA LOSS`, e `pnpm payload:generate` depois.

- [ ] **Step 4: Checkpoint visual (humano)**

Suba `pnpm dev:cms` e peça a aprovação. O roteiro que importa: criar uma contratação para uma oportunidade; tentar formalizá-la **logada como atendimento comercial** e ver a mensagem de perfil; tentar de novo como super-admin **sem instrumento** e ver a mensagem de instrumento; vincular um instrumento, preencher data e responsável, formalizar e ver passar; tentar criar uma **segunda** contratação para a mesma oportunidade e ver a mensagem de cardinalidade; e conferir a linha nova em `audit-log` com ação `formalizar`.

- [ ] **Step 5: Documentação**

`CLAUDE.md` §19 (coleções 22 → 24, o que passa a funcionar, backlog item 12) e a entrada nova no histórico de revisões. `docs/17`: marcar a Sessão H4 concluída no formato das H1/H2/H3; marcar a **decisão #2 da tabela §3 como ratificada em 09/09/2026** (`super-admin` formaliza); e acrescentar ao escopo da **H8** dois itens de texto novos: (a) a mensagem de perfil do §26 perdeu o sufixo `[VALIDAR COM A DIREÇÃO/JURÍDICO]`, que o manual precisa refletir; (b) registrar que a evidência do instrumento é referência ao sistema do órgão, não anexo no portal. Registrar também, em `docs/17` §4 na nota de arquitetura da H4, que a relação com a Janela F é `instrumento ↔ empenho` e não duplicação — decisão a ratificar antes de abrir F.

Registre o que ficou: a integridade de exclusão (não apagar contratação com instrumentos) é da H6; a porta de "Ganha" e o handoff são da H5, que também depende da decisão #3 do PO.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md docs/16_Roadmap_CMS_CRM_v1.md docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md
git commit -m "docs: registra a conclusão da Sessão H4 (contratação e instrumentos)"
```

---

## Cobertura da spec

| Requisito (docs/17 §1.2, §1.3, §4 H4 · Manual §26, §38) | Onde |
|---|---|
| Coleção `contratacao` com os campos do §1.2 | Task 3 |
| Coleção `instrumentos-formalizacao` com os campos do §1.2 | Task 3 |
| Cardinalidade 1:1 oportunidade × contratação, com a mensagem do manual | Task 1 (mensagem), Task 3 (`unique` + hook) |
| Formalizar exige perfil autorizado (GOV-04 → `super-admin`) | Task 1 (regra), Task 4 (hook lê `req.user`) |
| Formalizar exige data e responsável | Task 1, Task 4 |
| Formalizar exige ≥1 instrumento vinculado | Task 1 (regra), Task 4 (`contarInstrumentos`) |
| Formalização nunca automática | Task 4 (a porta só age na transição; nada deriva o status) |
| Auditoria do ato de formalizar em `audit-log` | Task 2 (helper), Task 4 (`afterChange`) |
| Mensagens do §26 verbatim, visíveis no formulário | Task 1 (strings + testes), Task 4 (erro tipado), Task 5 (repasse à tela) |
| Telas de contratação e instrumentos, no grupo P0 | Task 5 |
| Checklist do §26 passa item a item | Task 6, Step 4 (checkpoint humano) |

**Fora do escopo:** handoff e a porta de "Ganha" (H5); integridade de exclusão e a auditoria das demais entidades (H6); a fila de revisão de migração (H7); a reedição do manual (H8); empenho como entidade financeira (Janela F).

---

## Antes de começar

- **Estado do repositório na abertura:** `main` em `5381c52` ou adiante, com H1, H2 e H3 mergeadas e o `payload:push:schema` das tabelas `avaliacoes_qualificacao` e `tentativas_acesso` já executado (confirmado em 09/09/2026). `main` está à frente do `origin` e não foi pushada.
- **Pendência herdada, não desta sessão:** o checkpoint visual humano da qualificação (H2/H3) ainda não foi feito.
- **Herança que esta sessão usa sem reimplementar:** o formato de ponte fina + decisão pura dos hooks (`gateQualificada.ts`, `vigenciaAvaliacao.ts`); `ErroGateQualificada` como modelo do erro de negócio com status 400; o padrão de propagação do usuário para a Local API; `atendimentoComercial` e `superAdmin` em `apps/cms/src/access/`.
- **Armadilha conhecida:** um hook `beforeChange` de coleção recebe o `data` já mesclado com o documento persistido (o `beforeValidate` de campo faz o merge antes). Ainda assim, esta sessão lê `{ ...originalDoc, ...data }` explicitamente na porta da formalização — não depender de detalhe interno de versão foi a conclusão da revisão final da H2/H3.
- **Duas assunções do plano já conferidas no fonte, não relitigar:** (a) `unique: true` num relacionamento **simples** vira índice único de verdade no Postgres — `@payloadcms/drizzle/dist/schema/traverseFields.js:47-74` inclui `relationship` no ramo de unique/index e só o pula quando `hasMany === true` ou `relationTo` é array, que não é o caso de `contratacao.oportunidade`; (b) `payload.count` aceita `where` e `req` e devolve `{ totalDocs }` (`payload/dist/collections/operations/local/count.d.ts`).

---

*Portal Grupo NTC · plano da Sessão H4 · 9 de setembro de 2026 · Instituto NTC do Brasil*
