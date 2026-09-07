# Anti-spam real (Sessão C2) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar `verificarHcaptcha` e `checarRateLimit` do estado de stub e proteger de verdade os 4 endpoints públicos de formulário **e** o `/entrar/recuperar` do Painel Admin, que hoje não tem nada impedindo e-mail-bombing do endereço de admin conhecido.

**Architecture:** Captcha via **Cloudflare Turnstile** (siteverify server-side + widget no front, que hoje **não existe** — os handlers já leem um token que ninguém envia). Rate limit por (IP, rota) persistido no **Postgres do Supabase que já existe**, através de uma coleção Payload nova (`tentativas-acesso`), com a lógica de decisão pura em `@ntc/lib` recebendo um store injetado — mesmo padrão de superfície mínima mockável já usado por `PayloadUsuarios` em `painelCmsUsuarios.ts`.

**Tech Stack:** Next.js 15 (Route Handlers + Server Actions), Payload CMS 3 Local API, Vitest. **Nenhuma dependência nova** — Turnstile é `fetch` puro e o store é Payload.

**Spec:** não há spec dedicada. As fontes são `docs/16_Roadmap_CMS_CRM_v1.md` §"Sessão C2", `CLAUDE.md` §19.3 item 3 e §19.5, mais as três decisões do PO tomadas em 07/09/2026 e registradas abaixo.

## Decisões do PO (07/09/2026) — já tomadas, não reabrir

1. **Cloudflare Turnstile**, não hCaptcha. Nada de captcha havia sido implementado, então a troca sai barata agora: renomear `HCAPTCHA_*` → `TURNSTILE_*`/`CAPTCHA_ENABLED` e `verificarHcaptcha` → `verificarCaptcha`. Motivo: grátis e ilimitado, quase sempre invisível pro usuário, melhor privacidade.
2. **Store do rate limit: Postgres do Supabase** (via coleção Payload), não Upstash. Motivo: zero fornecedor novo, zero credencial nova, e o volume de formulário público é baixo o bastante para Postgres dar conta com folga.
3. **Credenciais do Turnstile ainda NÃO existem.** Entregar tudo implementado e testado com `CAPTCHA_ENABLED=false`, exatamente como o projeto já fez com `RESEND_API_KEY`. O PO liga a flag depois sem tocar em código.

## Global Constraints

- TypeScript strict, sem `any`, sem `unknown` quando há tipo conhecido (CLAUDE.md §4.4).
- **Não reinventar a infra de forms** (CLAUDE.md §19.5): schemas Zod em `packages/lib/src/forms/schemas.ts`, helpers de resposta em `apps/web/lib/respostaForm.ts` (`respostaErro`, `respostaValidacao`, `respostaRateLimit`), `extrairOrigem`/`aposCriarLead` em `packages/lib/src/forms/`. Os 4 handlers **já chamam** os dois stubs nos lugares certos — esta sessão troca a implementação, não a arquitetura de chamada.
- Nomenclatura: português para conceito de negócio, inglês só para termo técnico puro (CLAUDE.md §4.2).
- **Nenhuma dependência nova** (CLAUDE.md §5.4). Turnstile é `fetch`; o store é Payload.
- `pnpm payload:push:schema` é **manual, do PO**, dev parado, `N` em qualquer DATA LOSS (CLAUDE.md §14). **Nenhuma task deste plano roda esse comando.** Ver o aviso sobre branches paralelas no fim deste documento.
- LGPD (CLAUDE.md §12): o rate limit grava **IP**, que é dado pessoal. A coleção nova precisa de retenção curta e limpeza automática — está no escopo da Task 2, não é opcional.
- Falha do provedor de captcha **não pode virar bypass**: se o siteverify não responder, a verificação falha fechada (rejeita), nunca aberta.
- Acessibilidade (CLAUDE.md §10): o widget do Turnstile não pode quebrar navegação por teclado nem submeter sem feedback visível de erro.
- Commits: Conventional Commits, português, sem emoji, terminando com:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  ```

## Estado atual verificado em código (07/09/2026)

Confirmado nesta sessão, não presumir diferente sem reconferir:

- `packages/lib/src/forms/hcaptcha.ts` — stub. Com `HCAPTCHA_ENABLED=true` e sem token, **retorna `false`** (falha fechada, correto), mas nunca chama provedor nenhum.
- `packages/lib/src/forms/rateLimit.ts` — stub. Com `RATELIMIT_ENABLED=true`, **retorna `{ ok: true }` sempre** (falha aberta — não protege nada).
- Os 4 handlers já chamam ambos, na ordem certa (captcha → validação Zod → rate limit): `apps/web/app/api/forms/{newsletter,contato,proposta,candidatura-especialista}/route.ts`.
- **O front não envia token nenhum.** `grep` por `hcaptchaToken` em `apps/web` fora de `app/api/` não retorna nada. Ligar a flag hoje quebraria os 4 formulários. Fechar essa lacuna é a Task 5.
- Pontos de submit no front: `apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx` (newsletter) e `apps/web/app/(institucional)/contato/enviarLead.ts` (contato + proposta, usado pelo `RoteadorFormularios`).
- `/api/forms/candidatura-especialista` **não tem chamador no front** — nenhum componente aponta pra ele. Ver Task 5, passo 4.
- `solicitarRecuperacao` (`apps/cms/src/app/(painel)/acoesAuth.ts:143`) **não tem rate limit nenhum** e não lê IP.
- `@ntc/lib` depende só de `zod`, mas já faz I/O de rede (`aposCriarLead.ts` chama a REST do Resend via `fetch`) — então `fetch` pro Turnstile é consistente. O que ele **não** tem é acesso a banco: daí o store injetado.

---

### Task 1: Coleção `tentativas-acesso`

**Files:**
- Create: `apps/cms/src/collections/TentativasAcesso.ts`
- Modify: `apps/cms/src/payload.config.ts` (import + registro no array `collections`)

**Interfaces:**
- Produces: coleção Payload `tentativas-acesso` com os campos `rota` (text) e `ip` (text). `createdAt` é automático do Payload e é o campo pelo qual a janela de tempo é calculada. Nenhuma task importa tipo gerado desta coleção — as demais falam com ela via Local API por slug.

- [ ] **Step 1: Criar a coleção**

```ts
// apps/cms/src/collections/TentativasAcesso.ts
import type { CollectionConfig } from "payload";

import { superAdmin } from "../access/superAdmin";

/**
 * Registro efêmero de tentativas por (IP, rota) — lastro do rate limit
 * (Sessão C2). Não é log de auditoria: linhas velhas são apagadas pelo
 * próprio fluxo de checagem, e o dado só existe dentro da janela.
 *
 * LGPD (CLAUDE.md §12): guarda IP, que é dado pessoal. Retenção curta e
 * limpeza automática são requisito, não otimização — quem mexer aqui
 * precisa manter as duas.
 *
 * Escrita e leitura acontecem só pela Local API, a partir das rotas de
 * formulário e da action de recuperação de senha. `access` fica fechado
 * como defesa em profundidade (mesma postura de AuditLog).
 */
export const TentativasAcesso: CollectionConfig = {
  slug: "tentativas-acesso",
  labels: { singular: "Tentativa de Acesso", plural: "Tentativas de Acesso" },
  admin: {
    useAsTitle: "rota",
    defaultColumns: ["rota", "ip", "createdAt"],
    group: "Sistema",
    description: "Lastro efêmero do rate limit. Linhas se apagam sozinhas fora da janela.",
  },
  access: {
    read: superAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  indexes: [{ fields: ["rota", "ip", "createdAt"] }],
  fields: [
    { name: "rota", type: "text", required: true, index: true },
    { name: "ip", type: "text", required: true, index: true },
  ],
};
```

Se o Payload 3.18 recusar a chave `indexes` no `CollectionConfig` (a API de índice composto mudou entre versões), **remova só o bloco `indexes`** e mantenha os `index: true` por campo — os dois campos indexados individualmente já resolvem a consulta. Não invente outra forma de índice.

- [ ] **Step 2: Registrar em `payload.config.ts`**

Adicione o import junto aos demais, em ordem alfabética:

```ts
import { TentativasAcesso } from "./collections/TentativasAcesso";
```

E no array `collections: [...]`, imediatamente antes de `AuditLog` (as duas são coleções de sistema):

```ts
    TentativasAcesso,
    AuditLog,
  ],
```

- [ ] **Step 3: Verificar**

```bash
pnpm --filter @ntc/cms typecheck
```
Esperado: limpo.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/TentativasAcesso.ts apps/cms/src/payload.config.ts
git commit -m "$(cat <<'EOF'
feat(cms): coleção tentativas-acesso como lastro do rate limit

Schema-only. pnpm payload:push:schema segue manual (CLAUDE.md §14).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Núcleo do rate limit em `@ntc/lib`

**Files:**
- Modify: `packages/lib/src/forms/rateLimit.ts` (substitui o stub)
- Create: `packages/lib/src/forms/rateLimit.test.ts`
- Modify: `packages/lib/src/index.ts` (exportar os tipos novos)

**Interfaces:**
- Produces:
  ```ts
  export interface ResultadoRateLimit {   // já existe, NÃO mudar a forma
    ok: boolean;
    retryAfterSegundos?: number;
  }

  export interface LimiteRota {
    maxTentativas: number;
    janelaSegundos: number;
  }

  /** Superfície mínima do store — cada app injeta a sua (padrão PayloadUsuarios). */
  export interface StoreRateLimit {
    contarDesde(rota: string, ip: string, desde: Date): Promise<number>;
    registrar(rota: string, ip: string): Promise<void>;
    limparAntesDe(rota: string, ip: string, antesDe: Date): Promise<void>;
  }

  export const LIMITE_PADRAO: LimiteRota;        // 5 tentativas / 600s
  export const LIMITE_RECUPERACAO: LimiteRota;   // 3 tentativas / 900s

  export async function checarRateLimit(
    ip: string,
    rota: string,
    store: StoreRateLimit,
    limite?: LimiteRota,
  ): Promise<ResultadoRateLimit>;
  ```
- Consome: nada além do store injetado. **Sem I/O direto, sem `Date.now()` fora de `new Date()`** — os testes usam fake timers.

**Mudança de contrato:** `checarRateLimit` ganha o 3º parâmetro `store` (obrigatório) e o 4º `limite` (opcional). Os 4 handlers são atualizados na Task 4.

- [ ] **Step 1: Escrever o teste que falha primeiro**

```ts
// packages/lib/src/forms/rateLimit.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checarRateLimit, LIMITE_PADRAO, type StoreRateLimit } from "./rateLimit";

function storeFalso(contagem: number) {
  const registros: { rota: string; ip: string }[] = [];
  const limpezas: { rota: string; ip: string; antesDe: Date }[] = [];
  const store: StoreRateLimit = {
    contarDesde: vi.fn().mockResolvedValue(contagem),
    registrar: vi.fn(async (rota, ip) => {
      registros.push({ rota, ip });
    }),
    limparAntesDe: vi.fn(async (rota, ip, antesDe) => {
      limpezas.push({ rota, ip, antesDe });
    }),
  };
  return { store, registros, limpezas };
}

describe("checarRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T12:00:00.000Z"));
    process.env.RATELIMIT_ENABLED = "true";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.RATELIMIT_ENABLED;
  });

  it("desligado por flag: libera sem tocar no store", async () => {
    process.env.RATELIMIT_ENABLED = "false";
    const { store } = storeFalso(999);
    expect(await checarRateLimit("1.2.3.4", "/api/forms/contato", store)).toEqual({ ok: true });
    expect(store.contarDesde).not.toHaveBeenCalled();
    expect(store.registrar).not.toHaveBeenCalled();
  });

  it("abaixo do limite: libera e registra a tentativa", async () => {
    const { store, registros } = storeFalso(LIMITE_PADRAO.maxTentativas - 1);
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(true);
    expect(registros).toEqual([{ rota: "/api/forms/contato", ip: "1.2.3.4" }]);
  });

  it("no limite: bloqueia, devolve retryAfter e NÃO registra", async () => {
    const { store, registros } = storeFalso(LIMITE_PADRAO.maxTentativas);
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSegundos).toBe(LIMITE_PADRAO.janelaSegundos);
    expect(registros).toEqual([]);
  });

  it("conta a partir do início da janela, não do epoch", async () => {
    const { store } = storeFalso(0);
    await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    const desde = vi.mocked(store.contarDesde).mock.calls[0]?.[2] as Date;
    expect(desde.toISOString()).toBe("2026-09-07T11:50:00.000Z"); // 12:00 menos 600s
  });

  it("limpa registros anteriores à janela (retenção curta, LGPD)", async () => {
    const { store, limpezas } = storeFalso(0);
    await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(limpezas).toHaveLength(1);
    expect(limpezas[0]?.antesDe.toISOString()).toBe("2026-09-07T11:50:00.000Z");
  });

  it("respeita limite customizado por rota", async () => {
    const { store } = storeFalso(3);
    const r = await checarRateLimit("1.2.3.4", "/entrar/recuperar", store, {
      maxTentativas: 3,
      janelaSegundos: 900,
    });
    expect(r).toEqual({ ok: false, retryAfterSegundos: 900 });
  });

  it("falha do store NÃO vira bypass: bloqueia e loga", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const store: StoreRateLimit = {
      contarDesde: vi.fn().mockRejectedValue(new Error("banco fora")),
      registrar: vi.fn(),
      limparAntesDe: vi.fn(),
    };
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd packages/lib && npx vitest run src/forms/rateLimit.test.ts
```
Esperado: FALHA — `checarRateLimit` ainda tem a assinatura antiga (2 parâmetros) e não exporta `LIMITE_PADRAO`/`StoreRateLimit`.

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/forms/rateLimit.ts
/**
 * Rate limit por (IP, rota) — decisão pura, store injetado.
 *
 * O store real vive em cada app (só eles alcançam a Local API do
 * Payload); aqui fica a regra: contar as tentativas da janela, decidir,
 * registrar a atual e apagar o que saiu da janela. Mesma ideia de
 * superfície mínima mockável de `PayloadUsuarios` em painelCmsUsuarios.ts.
 *
 * Falha fechada: se o store quebrar, a requisição é BLOQUEADA. Tratar
 * erro de banco como "pode passar" transformaria uma indisponibilidade
 * em porta aberta.
 */
export interface ResultadoRateLimit {
  ok: boolean;
  retryAfterSegundos?: number;
}

export interface LimiteRota {
  maxTentativas: number;
  janelaSegundos: number;
}

export interface StoreRateLimit {
  contarDesde(rota: string, ip: string, desde: Date): Promise<number>;
  registrar(rota: string, ip: string): Promise<void>;
  limparAntesDe(rota: string, ip: string, antesDe: Date): Promise<void>;
}

/** Formulários públicos: 5 envios por IP a cada 10 minutos. */
export const LIMITE_PADRAO: LimiteRota = { maxTentativas: 5, janelaSegundos: 600 };

/**
 * Recuperação de senha: mais apertado. O endereço do admin é conhecido e
 * cada tentativa dispara um e-mail — 3 por IP a cada 15 minutos.
 */
export const LIMITE_RECUPERACAO: LimiteRota = { maxTentativas: 3, janelaSegundos: 900 };

export async function checarRateLimit(
  ip: string,
  rota: string,
  store: StoreRateLimit,
  limite: LimiteRota = LIMITE_PADRAO,
): Promise<ResultadoRateLimit> {
  if (process.env.RATELIMIT_ENABLED !== "true") return { ok: true };

  const inicioJanela = new Date(Date.now() - limite.janelaSegundos * 1000);
  try {
    await store.limparAntesDe(rota, ip, inicioJanela);
    const tentativas = await store.contarDesde(rota, ip, inicioJanela);
    if (tentativas >= limite.maxTentativas) {
      return { ok: false, retryAfterSegundos: limite.janelaSegundos };
    }
    await store.registrar(rota, ip);
    return { ok: true };
  } catch (e) {
    console.error("[checarRateLimit]", e);
    return { ok: false, retryAfterSegundos: limite.janelaSegundos };
  }
}
```

- [ ] **Step 4: Exportar os tipos novos**

Em `packages/lib/src/index.ts`, troque a linha de export do rate limit por:

```ts
export {
  checarRateLimit,
  LIMITE_PADRAO,
  LIMITE_RECUPERACAO,
  type LimiteRota,
  type ResultadoRateLimit,
  type StoreRateLimit,
} from "./forms/rateLimit";
```

- [ ] **Step 5: Rodar e confirmar que passa**

```bash
cd packages/lib && npx vitest run src/forms/rateLimit.test.ts
```
Esperado: 7/7 passando.

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/forms/rateLimit.ts packages/lib/src/forms/rateLimit.test.ts packages/lib/src/index.ts
git commit -m "$(cat <<'EOF'
feat(lib): rate limit real com store injetado e falha fechada

Substitui o stub que devolvia ok:true mesmo com a flag ligada. A regra
(janela, contagem, limpeza) fica pura e testável; o store fica a cargo
de cada app. Erro de store bloqueia em vez de liberar.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Verificação real do Turnstile em `@ntc/lib`

**Files:**
- Create: `packages/lib/src/forms/captcha.ts`
- Create: `packages/lib/src/forms/captcha.test.ts`
- Delete: `packages/lib/src/forms/hcaptcha.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Produces: `verificarCaptcha(token: string | undefined, ip?: string): Promise<boolean>`.
- Substitui: `verificarHcaptcha`, que deixa de existir. Os 4 handlers são atualizados na Task 4.

- [ ] **Step 1: Escrever o teste que falha primeiro**

```ts
// packages/lib/src/forms/captcha.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verificarCaptcha } from "./captcha";

describe("verificarCaptcha", () => {
  beforeEach(() => {
    process.env.CAPTCHA_ENABLED = "true";
    process.env.TURNSTILE_SECRET = "segredo-de-teste";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CAPTCHA_ENABLED;
    delete process.env.TURNSTILE_SECRET;
  });

  it("desligado por flag: libera sem chamar o provedor", async () => {
    process.env.CAPTCHA_ENABLED = "false";
    const f = vi.spyOn(globalThis, "fetch");
    expect(await verificarCaptcha(undefined)).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it("ligado sem token: rejeita sem chamar o provedor", async () => {
    const f = vi.spyOn(globalThis, "fetch");
    expect(await verificarCaptcha(undefined)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("ligado sem TURNSTILE_SECRET: rejeita e loga (falha fechada)", async () => {
    delete process.env.TURNSTILE_SECRET;
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verificarCaptcha("token-qualquer")).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });

  it("provedor aprova: retorna true e envia secret + response", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    expect(await verificarCaptcha("tok-123", "9.9.9.9")).toBe(true);
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const corpo = init.body as URLSearchParams;
    expect(corpo.get("secret")).toBe("segredo-de-teste");
    expect(corpo.get("response")).toBe("tok-123");
    expect(corpo.get("remoteip")).toBe("9.9.9.9");
  });

  it("provedor reprova: retorna false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
        status: 200,
      }),
    );
    expect(await verificarCaptcha("tok-ruim")).toBe(false);
  });

  it("provedor fora do ar: rejeita e loga, nunca libera", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("timeout"));
    expect(await verificarCaptcha("tok-123")).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });

  it("resposta HTTP não-2xx: rejeita", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("erro", { status: 500 }));
    expect(await verificarCaptcha("tok-123")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

```bash
cd packages/lib && npx vitest run src/forms/captcha.test.ts
```
Esperado: FALHA — `Cannot find module './captcha'`.

- [ ] **Step 3: Implementar**

```ts
// packages/lib/src/forms/captcha.ts
/**
 * Verificação de captcha via Cloudflare Turnstile (decisão do PO em
 * 07/09/2026 — substitui o hCaptcha que só existia no nome).
 *
 * Falha fechada em todos os caminhos de erro: sem token, sem secret,
 * provedor fora do ar ou resposta inesperada ⇒ rejeita. Tratar
 * indisponibilidade do provedor como "pode passar" abriria o formulário
 * justamente quando não dá pra verificar nada.
 *
 * Com `CAPTCHA_ENABLED` diferente de "true" a verificação é pulada — é
 * o estado de entrega desta sessão, até o PO provisionar as chaves.
 */
const URL_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface RespostaSiteverify {
  success?: boolean;
}

export async function verificarCaptcha(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  if (process.env.CAPTCHA_ENABLED !== "true") return true;
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.error("[verificarCaptcha] CAPTCHA_ENABLED=true mas TURNSTILE_SECRET não está definida");
    return false;
  }

  const corpo = new URLSearchParams({ secret, response: token });
  if (ip) corpo.set("remoteip", ip);

  try {
    const res = await fetch(URL_SITEVERIFY, { method: "POST", body: corpo });
    if (!res.ok) {
      console.error("[verificarCaptcha] siteverify respondeu", res.status);
      return false;
    }
    const dados = (await res.json()) as RespostaSiteverify;
    return dados.success === true;
  } catch (e) {
    console.error("[verificarCaptcha]", e);
    return false;
  }
}
```

- [ ] **Step 4: Remover o stub antigo e ajustar o barrel**

```bash
git rm packages/lib/src/forms/hcaptcha.ts
```

Em `packages/lib/src/index.ts`, troque a linha do hcaptcha por:

```ts
export { verificarCaptcha } from "./forms/captcha";
```

- [ ] **Step 5: Rodar e confirmar que passa**

```bash
cd packages/lib && npx vitest run src/forms/captcha.test.ts
```
Esperado: 7/7 passando. `pnpm --filter @ntc/lib typecheck` também deve estar limpo — os 4 handlers ainda importam `verificarHcaptcha` e vão quebrar o typecheck do **app web** até a Task 4; isso é esperado e se resolve lá.

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/forms/captcha.ts packages/lib/src/forms/captcha.test.ts packages/lib/src/index.ts
git commit -m "$(cat <<'EOF'
feat(lib): verificação real de captcha via Cloudflare Turnstile

Substitui o stub hcaptcha.ts, que nunca chamou provedor nenhum. Falha
fechada em todo caminho de erro — sem token, sem secret, provedor fora
do ar ou resposta inesperada rejeitam a requisição.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Ligar os 4 handlers ao store e ao captcha novo

**Files:**
- Create: `apps/web/lib/storeRateLimit.ts`
- Modify: `apps/web/app/api/forms/newsletter/route.ts`
- Modify: `apps/web/app/api/forms/contato/route.ts`
- Modify: `apps/web/app/api/forms/proposta/route.ts`
- Modify: `apps/web/app/api/forms/candidatura-especialista/route.ts`

**Sem teste nesta task — verificado, não é desleixo:** `apps/web` **não tem Vitest** (sem `vitest.config.*`, sem script `test` no `package.json`, zero testes hoje). Montar um harness inteiro pra cobrir um adapter de 30 linhas seria escopo indevido nesta sessão. O adapter é **idêntico** ao do app cms, que tem harness e **é testado na Task 6** — a mesma implementação fica coberta lá. Verificação aqui é `typecheck` + `build`.

**Interfaces:**
- Consome: `StoreRateLimit`, `checarRateLimit`, `verificarCaptcha` de `@ntc/lib` (Tasks 2 e 3); `obterPayload` de `@/lib/payloadClient`.
- Produces: `criarStoreRateLimit(): StoreRateLimit` — adapter Payload do app web.

- [ ] **Step 1: Implementar o adapter**

```ts
// apps/web/lib/storeRateLimit.ts
import "server-only";

import type { StoreRateLimit } from "@ntc/lib";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Store do rate limit apoiado na coleção `tentativas-acesso` (Payload).
 * A regra fica em @ntc/lib; aqui só entra o acesso ao banco, que só os
 * apps alcançam.
 */
export function criarStoreRateLimit(): StoreRateLimit {
  const filtro = (rota: string, ip: string) => [
    { rota: { equals: rota } },
    { ip: { equals: ip } },
  ];

  return {
    async contarDesde(rota, ip, desde) {
      const payload = await obterPayload();
      const res = await payload.find({
        collection: "tentativas-acesso",
        where: { and: [...filtro(rota, ip), { createdAt: { greater_than: desde.toISOString() } }] },
        limit: 0,
        depth: 0,
        overrideAccess: true,
      });
      return res.totalDocs;
    },

    async registrar(rota, ip) {
      const payload = await obterPayload();
      await payload.create({
        collection: "tentativas-acesso",
        data: { rota, ip },
        overrideAccess: true,
      });
    },

    async limparAntesDe(rota, ip, antesDe) {
      const payload = await obterPayload();
      await payload.delete({
        collection: "tentativas-acesso",
        where: { and: [...filtro(rota, ip), { createdAt: { less_than: antesDe.toISOString() } }] },
        overrideAccess: true,
      });
    },
  };
}
```

- [ ] **Step 2: Atualizar os 4 handlers**

Em **cada um** dos 4 arquivos (`newsletter`, `contato`, `proposta`, `candidatura-especialista`), faça exatamente três trocas. Leia o arquivo antes; os nomes de rota mudam entre eles.

1. No import de `@ntc/lib`, troque `verificarHcaptcha` por `verificarCaptcha`.
2. Adicione o import do adapter:
   ```ts
   import { criarStoreRateLimit } from "@/lib/storeRateLimit";
   ```
3. O bloco do captcha hoje é:
   ```ts
   const captchaOk = await verificarHcaptcha(captchaToken);
   if (!captchaOk) return respostaErro("Falha na verificação de captcha.", 400);
   ```
   Vira (note que o IP passa a ser extraído **antes** do captcha, porque o siteverify usa `remoteip`):
   ```ts
   const xff = req.headers.get("x-forwarded-for") ?? "";
   const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";

   const captchaOk = await verificarCaptcha(captchaToken, ip);
   if (!captchaOk) return respostaErro("Falha na verificação de captcha.", 400);
   ```
4. O bloco do rate limit hoje é (a linha do `ip` já existe lá embaixo — **remova a duplicata**, o `ip` agora vem do passo 3):
   ```ts
   const xff = req.headers.get("x-forwarded-for") ?? "";
   const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
   const limit = await checarRateLimit(ip, "/api/forms/XXX");
   if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);
   ```
   Vira:
   ```ts
   const limit = await checarRateLimit(ip, "/api/forms/XXX", criarStoreRateLimit());
   if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);
   ```
   Mantenha o literal da rota exatamente como já está em cada arquivo.

- [ ] **Step 3: Verificar**

```bash
pnpm --filter @ntc/web typecheck && pnpm --filter @ntc/lib test
```
Esperado: typecheck limpo (agora que `verificarHcaptcha` não é importado em lugar nenhum) e a suíte do lib passando.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/storeRateLimit.ts apps/web/app/api/forms
git commit -m "$(cat <<'EOF'
feat(web): liga os 4 formulários ao captcha real e ao rate limit persistente

Adapter do store sobre a coleção tentativas-acesso e troca de
verificarHcaptcha por verificarCaptcha. O IP passa a ser extraído antes
do captcha, porque o siteverify do Turnstile usa remoteip.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Widget do Turnstile no front

**Files:**
- Create: `packages/ui/src/components/helpers/CampoTurnstile.tsx`
- Modify: `packages/ui/src/index.ts` (exportar o componente)
- Modify: `apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx`
- Modify: `apps/web/app/(institucional)/contato/enviarLead.ts`

**Interfaces:**
- Produces: `<CampoTurnstile />` — renderiza o widget quando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` existe, e nada quando não existe (estado de entrega desta sessão).
- O Turnstile injeta sozinho, dentro do `<form>`, um input escondido chamado `cf-turnstile-response` com o token. É de lá que o submit lê o valor — não é preciso estado em React.

**Sem teste automatizado nesta task:** o projeto não tem nenhum `.test.tsx` e componentes React não são testados aqui (mesma convenção das telas do painel). Verificação é typecheck + checkpoint visual.

- [ ] **Step 1: Criar o componente em `@ntc/ui`**

Componentes compartilhados entre route groups moram em `packages/ui` — precedente direto: `BannerCookies`, também client component, exportado por `packages/ui/src/index.ts` e usado no root layout. Siga esse padrão; **não** crie pasta de componentes dentro de `apps/web`.

Depois de criar o arquivo, exporte-o no barrel (`packages/ui/src/index.ts`), junto dos demais:

```ts
export { CampoTurnstile } from "./components/helpers/CampoTurnstile";
```


```tsx
// packages/ui/src/components/helpers/CampoTurnstile.tsx
"use client";

import Script from "next/script";

/**
 * Widget do Cloudflare Turnstile. O script injeta um input escondido
 * `cf-turnstile-response` dentro do <form> que envolve este componente —
 * o submit lê o token de lá.
 *
 * Sem `NEXT_PUBLIC_TURNSTILE_SITE_KEY` o componente não renderiza nada:
 * é o estado de entrega desta sessão (chaves ainda não provisionadas) e
 * também o comportamento certo em dev local.
 */
export function CampoTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-language="pt-br" />
    </>
  );
}
```

- [ ] **Step 2: `NewsletterForm.tsx`**

Leia o arquivo. Adicione o import:

```tsx
import { CampoTurnstile } from "@ntc/ui";
```

Renderize `<CampoTurnstile />` dentro do `<form>`, imediatamente antes do botão de submit. E, no handler de submit, antes do `fetch("/api/forms/newsletter", …)`, leia o token do form e inclua no corpo enviado:

```tsx
const turnstileToken =
  (e.currentTarget.elements.namedItem("cf-turnstile-response") as HTMLInputElement | null)?.value ?? "";
```

Adicione `hcaptchaToken: turnstileToken` ao objeto que hoje vai no `body` do fetch. **Mantenha o nome de campo `hcaptchaToken`** — é o que os 4 handlers já leem (`body.hcaptchaToken`); renomear isso obrigaria a mexer nos handlers de novo sem ganho nenhum. Deixe um comentário curto explicando que o nome é histórico.

(Se o handler de submit não tiver o evento à mão nesse ponto, pegue o form por `ref` ou por `document.querySelector` do próprio form — não invente um estado global.)

- [ ] **Step 3: `enviarLead.ts` (contato + proposta)**

Este módulo já tem o helper `valor(form, name)` que lê campos do form. Use-o: em cada função que monta o corpo do POST, adicione

```ts
hcaptchaToken: valor(form, "cf-turnstile-response"),
```

ao objeto enviado. São **4 pontos de envio** neste arquivo (linhas ~92, ~120, ~136 e ~172 no estado de 07/09) — confira todos com `grep -n "endpoint:" apps/web/app/\(institucional\)/contato/enviarLead.ts` e trate cada um.

E renderize `<CampoTurnstile />` dentro do formulário do `RoteadorFormularios.tsx`, antes do botão de submit (o roteador tem 4 abas, mas um único `<form>` por aba — coloque em cada um).

- [ ] **Step 4: `/api/forms/candidatura-especialista` — decidir, não adivinhar**

Esse endpoint **não tem chamador no front** (confirmado por `grep` em 07/09). Não invente um formulário para ele. Verifique se ainda faz sentido existir:

```bash
grep -rn "candidatura" --include="*.tsx" --include="*.ts" apps/web/ | grep -v "app/api/"
```

Se continuar sem chamador, **pare e reporte ao controlador** — a decisão (manter o endpoint protegido mas órfão, ou remover) é do PO, não sua. O endpoint já foi atualizado na Task 4 e fica protegido de qualquer forma; isto aqui é só sinalizar a pendência, não resolver.

- [ ] **Step 5: Verificar**

```bash
pnpm --filter @ntc/web typecheck
pnpm --filter @ntc/web build
```
Esperado: os dois limpos. O `build` importa aqui porque pega `<a>` para rota interna e outros deslizes que o typecheck deixa passar (CLAUDE.md, memória do projeto). **Pare o dev server antes do build** — o `.next` é compartilhado e um build com dev ativo corrompe o servidor.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/helpers/CampoTurnstile.tsx packages/ui/src/index.ts "apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx" "apps/web/app/(institucional)/contato"
git commit -m "$(cat <<'EOF'
feat(web): widget do Turnstile nos formulários públicos

Fecha a lacuna que impedia ligar o captcha: os handlers já liam um token
que nenhum formulário enviava. Sem NEXT_PUBLIC_TURNSTILE_SITE_KEY o
widget não renderiza, que é o estado de entrega desta sessão.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Rate limit no `/entrar/recuperar`

**Files:**
- Create: `apps/cms/src/lib/storeRateLimit.ts`
- Modify: `apps/cms/src/app/(painel)/acoesAuth.ts` (função `solicitarRecuperacao`)
- Create: `apps/cms/src/lib/storeRateLimit.test.ts`

**Interfaces:**
- Consome: `checarRateLimit`, `LIMITE_RECUPERACAO`, `StoreRateLimit` de `@ntc/lib`.
- Produces: `criarStoreRateLimit()` no app cms — **cópia literal** do adapter da Task 4, trocando só o import do `payloadClient` (o do cms é `@/lib/payloadClient` também, mas resolve para outro arquivo). Duplicar 30 linhas aqui é deliberado: os dois apps têm clientes Payload distintos e `@ntc/lib` não alcança banco. Não crie um pacote novo só pra isso.

**Por que esta task existe:** hoje qualquer um pode disparar `solicitarRecuperacao` em loop contra `contato@institutontc.com.br` (endereço conhecido, está no CLAUDE.md) e encher a caixa de e-mail do admin. É o risco que o roadmap chama de "real, não teórico".

- [ ] **Step 1: Teste do adapter (espelho do da Task 4)**

Crie `apps/cms/src/lib/storeRateLimit.test.ts` com **exatamente os mesmos 3 casos** do teste da Task 4 (`contarDesde`, `registrar`, `limparAntesDe`), trocando o caminho do import de `./storeRateLimit` e usando o padrão de mock hoisted já estabelecido no cms:

```ts
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));
const { criarStoreRateLimit } = await import("./storeRateLimit");
```

Rode e confirme que falha antes de implementar.

- [ ] **Step 2: Implementar o adapter**

Copie `apps/web/lib/storeRateLimit.ts` da Task 4 para `apps/cms/src/lib/storeRateLimit.ts` sem alteração — os imports (`server-only`, `@ntc/lib`, `@/lib/payloadClient`) resolvem igual nos dois apps.

- [ ] **Step 3: Ligar em `solicitarRecuperacao`**

O corpo hoje é:

```ts
export async function solicitarRecuperacao(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { erro: "Informe o e-mail." };
  try {
    const payload = await obterPayload();
    await payload.forgotPassword({ collection: "users", data: { email } });
  } catch (e) {
    console.error("[recuperar-senha] falha ao gerar/enviar token:", e);
  }
  return { ok: MENSAGEM_RECUPERACAO };
}
```

Vira:

```ts
export async function solicitarRecuperacao(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { erro: "Informe o e-mail." };

  // Sem isto, o endereço de admin (conhecido) pode ser bombardeado de
  // e-mails de recuperação por qualquer um, em loop.
  const cabecalhos = await headers();
  const xff = cabecalhos.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || cabecalhos.get("x-real-ip") || "0.0.0.0";
  const limite = await checarRateLimit(ip, "/entrar/recuperar", criarStoreRateLimit(), LIMITE_RECUPERACAO);
  if (!limite.ok) {
    // Mensagem genérica de propósito: não revela se o e-mail existe nem
    // que houve bloqueio por IP (spec 2026-07-10 §2).
    return { ok: MENSAGEM_RECUPERACAO };
  }

  try {
    const payload = await obterPayload();
    await payload.forgotPassword({ collection: "users", data: { email } });
  } catch (e) {
    console.error("[recuperar-senha] falha ao gerar/enviar token:", e);
  }
  return { ok: MENSAGEM_RECUPERACAO };
}
```

Adicione os imports necessários no topo do arquivo: `headers` de `next/headers` (junto do `cookies` que já vem de lá), `checarRateLimit` e `LIMITE_RECUPERACAO` de `@ntc/lib`, e `criarStoreRateLimit` de `@/lib/storeRateLimit`.

**Repare na escolha de comportamento:** ao bloquear, a action devolve a **mesma mensagem de sucesso genérica**, não um erro. Revelar "você foi bloqueado" entregaria ao atacante o sinal de que ele acertou um endereço válido e de que existe limite. Não troque isso por uma mensagem de erro sem discutir.

- [ ] **Step 4: Verificar**

```bash
cd apps/cms && npx vitest run src/lib/storeRateLimit.test.ts
cd ../.. && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test
```
Esperado: 3/3 no adapter, typecheck limpo, suíte do cms passando.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/storeRateLimit.ts apps/cms/src/lib/storeRateLimit.test.ts "apps/cms/src/app/(painel)/acoesAuth.ts"
git commit -m "$(cat <<'EOF'
feat(cms): rate limit no fluxo de recuperação de senha

Sem isso, o endereço de admin (público no CLAUDE.md) podia ser
bombardeado de e-mails de recuperação em loop. Ao bloquear, devolve a
mesma mensagem genérica de sucesso — sinalizar o bloqueio entregaria ao
atacante que o endereço existe.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Env vars e documentação

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md` (§15 e §19.3 item 3)

- [ ] **Step 1: `.env.example`**

Remova as linhas do hCaptcha e ponha no lugar:

```
# ---- Anti-spam ------------------------------------------------------------
# Cloudflare Turnstile. Enquanto CAPTCHA_ENABLED != "true" a verificação é
# pulada e o widget não renderiza — estado de entrega da Sessão C2, até as
# chaves serem provisionadas. Site key é pública (vai pro bundle do front).
CAPTCHA_ENABLED=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET=

# Rate limit por (IP, rota), lastreado na coleção tentativas-acesso do
# Payload (Postgres do Supabase — sem serviço externo).
RATELIMIT_ENABLED=false
```

- [ ] **Step 2: `CLAUDE.md` §15**

Na lista de variáveis obrigatórias, troque o bloco `# Captcha` (`HCAPTCHA_SITE_KEY`/`HCAPTCHA_SECRET`) pelo mesmo conteúdo do passo 1.

- [ ] **Step 3: `CLAUDE.md` §19.3 item 3**

Reescreva o item 3 do backlog para refletir o estado real após esta sessão. Conteúdo obrigatório: implementação real entregue (Turnstile + rate limit em Postgres via coleção `tentativas-acesso`); `/entrar/recuperar` coberto; **as duas flags entregues desligadas**, esperando o PO criar a conta Turnstile e setar `NEXT_PUBLIC_TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET` (locais e na Vercel, projetos **web e cms**) e então virar `CAPTCHA_ENABLED=true` e `RATELIMIT_ENABLED=true`; e a pendência do `payload:push:schema` da coleção nova. Registre também que `/api/forms/candidatura-especialista` segue sem chamador no front (achado da Task 5).

- [ ] **Step 4: Verificar e commitar**

```bash
pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/web typecheck
```

```bash
git add .env.example CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: registra o anti-spam real e as env vars do Turnstile

CAPTCHA_ENABLED e RATELIMIT_ENABLED entregues desligadas — o PO liga
depois de provisionar a conta, sem tocar em código (mesmo padrão do
RESEND_API_KEY).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Depois de todas as tasks

1. `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/web typecheck` limpos; `pnpm --filter @ntc/cms test` e `pnpm --filter @ntc/lib test` passando; `pnpm --filter @ntc/web build` limpo (com o dev server **parado**).

2. **`pnpm payload:push:schema` — manual, do PO.** A coleção `tentativas-acesso` não existe no banco até isso rodar. Dev parado, diff revisado, `N` em qualquer prompt de DATA LOSS (CLAUDE.md §14).

   ⚠️ **Antes de rodar, cheque se existe outra feature branch viva com coleção nova** (`git branch -vv`). O push reconcilia o banco com o código *da branch atual* e **dropa** qualquer tabela que ela não conheça — foi exatamente assim que a Sessão do passkey derrubou a `historico_estagio` da branch irmã em 04/09. Se houver divergência: mergear as branches num estado único e rodar **um** push de lá.

3. **Checkpoint visual (CLAUDE.md §6)**, com as flags ainda desligadas: os 4 formulários continuam enviando normalmente e o `/entrar/recuperar` segue funcionando. Nada pode ter regredido para o usuário final.

4. **Teste real do anti-spam** só é possível depois que o PO provisionar o Turnstile. Roteiro pra esse momento: ligar as duas flags em local, submeter um formulário (widget deve aparecer e o envio passar), submeter 6 vezes seguidas (a 6ª deve ser barrada com `retryAfter`), e disparar `/entrar/recuperar` 4 vezes (a 4ª deve devolver a mensagem genérica sem enviar e-mail).
