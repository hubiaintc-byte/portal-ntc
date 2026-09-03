# Passkey (WebAuthn) como 2º Fator — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar passkey (WebAuthn — Touch ID, Windows Hello, chaves físicas) como segundo fator opcional no login do Painel Admin (`apps/cms`), substituindo o plano de 2FA via TOTP que nunca foi implementado (CLAUDE.md §17.8).

**Architecture:** Senha continua sendo o primeiro fator (`payload.login()`, inalterado). Quando o usuário tem passkey cadastrado, em vez de abrir a sessão na hora, o servidor devolve um token de ponte **cifrado** (JWE via `jose`, não apenas assinado — um JWT comum vazaria a sessão real pro navegador) contendo a sessão pendente; só depois da cerimônia WebAuthn (`navigator.credentials.get()`) verificada é que o cookie `payload-token` real é setado. Cadastro (enrollment) e remoção seguem o padrão de Server Actions já usado no projeto (`obterUsuarioCms()` → Local API → `ResultadoEscrita`).

**Tech Stack:** Next.js 15 Server Actions + `useActionState`, Payload CMS 3 Local API, `@simplewebauthn/server`/`@simplewebauthn/browser` (v14.0.0, verificado nesta sessão), `jose` (5.9.6, já resolvido no workspace via `payload`), Vitest com o padrão hoisted `vi.mock("@/lib/payloadClient", ...)`.

**Spec:** `docs/superpowers/specs/2026-09-02-passkey-2fa-design.md`

## Global Constraints

- TypeScript strict, sem `any` (CLAUDE.md §4.4).
- Nomenclatura: conceitos de negócio/editoriais em português (`entrar`, `cadastrarPasskey`, `apelido`); nomes técnicos do WebAuthn ficam como a lib usa (`credentialId`, `publicKey`, `counter`, `transports`) — CLAUDE.md §4.2.
- Toda Server Action começa validando `obterUsuarioCms()` (ou a checagem de super-admin equivalente) ANTES de tocar a Local API — padrão de `acoesCrm.ts`/`acoes.ts`, não inventar variação.
- Retorno de escrita segue o formato `ResultadoEscrita` (`{ ok: boolean; erro?: string }`) de `@/lib/cms/painelCmsEscrita`, ou o formato `EstadoLogin` já existente (`{ erro?: string; ok?: string }`) quando a action alimenta um `useActionState` de formulário — nunca inventar um terceiro formato.
- `passkeys` é uma coleção nova, mas **não existe migração automática**: `pnpm payload:push:schema` é MANUAL, rodado pelo PO com o dev parado, diff revisado, `N` em qualquer prompt de DATA LOSS (CLAUDE.md §14). Nenhuma task deste plano roda esse comando.
- Dependências novas já aprovadas nesta sessão (CLAUDE.md §5.4): `@simplewebauthn/server@14.0.0`, `@simplewebauthn/browser@14.0.0`. `jose@5.9.6` deve ser declarada explicitamente em `apps/cms/package.json` (hoje é só transitiva via `payload`) — mesmo cuidado do achado corrigido na revisão final da Fase B2 com `playwright-core` (nunca depender de hoisting silencioso).
- Acessibilidade: botões de ação são `<button type="button">` reais, nunca `<div onClick>` (CLAUDE.md §10).
- Este projeto **não tem nenhum `.test.tsx`** — componentes React não são testados via Vitest aqui (só lógica em `.ts`). Não introduza o primeiro sem necessidade; siga o padrão: lógica pura/Local API em `.ts` com teste, Server Actions e componentes React sem teste automatizado (verificação é `pnpm typecheck` + checkpoint visual manual, CLAUDE.md §6).
- Commits: Conventional Commits, português, sem emoji (CLAUDE.md §7.2), terminando com:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

---

### Task 1: Coleção `Passkeys`

**Files:**
- Create: `apps/cms/src/collections/Passkeys.ts`
- Modify: `apps/cms/src/payload.config.ts` (import + registro no array `collections`)

**Interfaces:**
- Produces: coleção Payload `passkeys`, campos `usuario` (relationship→users), `apelido`, `credentialId`, `publicKey`, `counter`, `transports`, `ultimoUsoEm`. Nenhuma task depende do *tipo* desta coleção diretamente (as tasks seguintes usam a Local API via `obterPayload()` com `collection: "passkeys"`, sem importar tipos gerados que ainda não existem antes do primeiro `payload:generate`).

- [ ] **Step 1: Criar a coleção**

```ts
// apps/cms/src/collections/Passkeys.ts
import type { CollectionConfig } from "payload";

import { superAdmin } from "../access/superAdmin";

/**
 * Credenciais WebAuthn (passkeys) — 2º fator opcional do login do painel
 * (spec 2026-09-02, substitui o plano de 2FA via TOTP de CLAUDE.md §17.8).
 * Um usuário pode ter várias (um por dispositivo). Leitura/remoção: dono
 * OU super-admin (a tela Usuários permite ao super-admin remover o passkey
 * de qualquer usuário — caso de dispositivo perdido). Escrita real
 * acontece só via Local API com overrideAccess, a partir das Server
 * Actions de apps/cms/src/app/(painel)/acoesAuth.ts e acoes.ts — os
 * campos create/update ficam fechados aqui como defesa em profundidade,
 * não como o único controle.
 */
export const Passkeys: CollectionConfig = {
  slug: "passkeys",
  labels: { singular: "Passkey", plural: "Passkeys" },
  admin: {
    useAsTitle: "apelido",
    defaultColumns: ["usuario", "apelido", "ultimoUsoEm"],
    group: "Sistema",
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as { perfil?: string }).perfil === "super-admin") return true;
      return { usuario: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if ((req.user as { perfil?: string }).perfil === "super-admin") return true;
      return { usuario: { equals: req.user.id } };
    },
    create: () => false,
    update: () => false,
  },
  fields: [
    { name: "usuario", type: "relationship", relationTo: "users", required: true },
    {
      name: "apelido",
      type: "text",
      required: true,
      admin: { description: 'Nome livre pra identificar o dispositivo — ex.: "MacBook do Jotta".' },
    },
    { name: "credentialId", type: "text", required: true, unique: true },
    { name: "publicKey", type: "text", required: true },
    { name: "counter", type: "number", required: true, defaultValue: 0 },
    { name: "transports", type: "text", hasMany: true },
    { name: "ultimoUsoEm", type: "date" },
  ],
};
```

- [ ] **Step 2: Registrar em `payload.config.ts`**

Adicione o import em ordem alfabética junto aos demais (`apps/cms/src/payload.config.ts`, perto da linha `import { Oportunidades } from "./collections/Oportunidades";`):

```ts
import { Passkeys } from "./collections/Passkeys";
```

E no array `collections: [...]`, logo após `Users,` (ela é uma extensão direta da autenticação):

```ts
  collections: [
    Users,
    Passkeys,
    Media,
    ...
```

- [ ] **Step 3: Verificar**

```bash
pnpm --filter @ntc/cms typecheck
```
Esperado: limpo, sem erros — a coleção ainda não é usada por nenhum código, só precisa compilar.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/collections/Passkeys.ts apps/cms/src/payload.config.ts
git commit -m "$(cat <<'EOF'
feat(cms): adiciona coleção Passkeys para 2º fator via WebAuthn

Schema-only — nenhum código ainda escreve nela. pnpm payload:push:schema
continua manual (CLAUDE.md §14), fica para o PO rodar antes desta feature
funcionar de ponta a ponta.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Tokens efêmeros (`rp.ts` + `tokens.ts`)

**Files:**
- Create: `apps/cms/src/lib/passkeys/rp.ts`
- Create: `apps/cms/src/lib/passkeys/tokens.ts`
- Test: `apps/cms/src/lib/passkeys/tokens.test.ts`
- Modify: `apps/cms/package.json` (adiciona `jose` explícito)

**Interfaces:**
- Produces:
  - `obterConfigRp(): { rpID: string; rpName: string; origin: string }` — de `rp.ts`.
  - `cifrarTokenPonte(claims: ClaimsPonte): Promise<string>` e `decifrarTokenPonte(token: string): Promise<ClaimsPonte | null>` — de `tokens.ts`, onde `ClaimsPonte = { userId: string; sessaoReal: string; challenge: string; manter: boolean }`.
  - `assinarTokenDesafio(claims: ClaimsDesafio): Promise<string>` e `verificarTokenDesafio(token: string): Promise<ClaimsDesafio | null>` — de `tokens.ts`, onde `ClaimsDesafio = { userId: string; challenge: string }`.
- Consumes: `process.env.PAYLOAD_SECRET` (já existe, mesmo segredo que o Payload usa pra assinar seus próprios JWTs — confirmado em `node_modules/payload/dist/auth/jwt.js`, que usa `jose`'s `SignJWT` com `HS256`).

**Por que dois tipos de token:** o token de ponte (login) carrega a sessão real do usuário — precisa ser **cifrado** (JWE), porque um JWT só assinado (JWS) tem o payload em base64url legível por qualquer um com o token, inclusive o navegador do próprio usuário ANTES de confirmar o passkey. O token de desafio (cadastro) não carrega nada secreto — só precisa de integridade (o servidor precisa confirmar que foi ele quem emitiu aquele `challenge`), então um JWS simples basta.

- [ ] **Step 1: Adicionar `jose` como dependência direta**

Em `apps/cms/package.json`, no bloco `"dependencies"`, adicione em ordem alfabética (já está resolvida em `5.9.6` no workspace via `payload`, veja `pnpm-lock.yaml` — declarar explícito evita depender de hoisting):

```json
"jose": "5.9.6",
```

Rode `pnpm install` na raiz do monorepo depois de editar.

- [ ] **Step 2: `rp.ts`**

```ts
// apps/cms/src/lib/passkeys/rp.ts
import "server-only";

/**
 * Configuração de Relying Party do WebAuthn — deriva de
 * PAYLOAD_PUBLIC_SERVER_URL (já existe, nenhuma env var nova). rpID
 * precisa ser exatamente o hostname (sem porta, sem protocolo) — o
 * WebAuthn valida isso rigorosamente contra o domínio real do navegador.
 */
export interface ConfigRp {
  rpID: string;
  rpName: string;
  origin: string;
}

export function obterConfigRp(): ConfigRp {
  const url = new URL(process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001");
  return {
    rpID: url.hostname,
    rpName: "Painel Admin NTC",
    origin: url.origin,
  };
}
```

- [ ] **Step 3: escrever o teste que falha primeiro — `tokens.test.ts`**

```ts
// apps/cms/src/lib/passkeys/tokens.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("tokens de ponte (login) — cifrados", () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = "segredo-de-teste-bem-longo-0123456789";
  });

  it("cifra e decifra as claims corretamente", async () => {
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const claims = {
      userId: "42",
      sessaoReal: "jwt.da.sessao.real",
      challenge: "abc123",
      manter: true,
    };
    const token = await cifrarTokenPonte(claims);
    const decifradas = await decifrarTokenPonte(token);
    expect(decifradas).toEqual(claims);
  });

  it("um JWT comum (jose.decodeJwt) não consegue ler as claims do token de ponte", async () => {
    const { cifrarTokenPonte } = await import("./tokens");
    const { decodeJwt } = await import("jose");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "segredo-nao-pode-vazar",
      challenge: "abc123",
      manter: false,
    });
    expect(() => decodeJwt(token)).toThrow();
  });

  it("token expirado devolve null, não lança", async () => {
    vi.useFakeTimers();
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "x",
      challenge: "y",
      manter: false,
    });
    vi.setSystemTime(Date.now() + 6 * 60 * 1000); // +6min, token de ponte expira em 5min
    const resultado = await decifrarTokenPonte(token);
    expect(resultado).toBeNull();
    vi.useRealTimers();
  });

  it("token adulterado devolve null, não lança", async () => {
    const { cifrarTokenPonte, decifrarTokenPonte } = await import("./tokens");
    const token = await cifrarTokenPonte({
      userId: "42",
      sessaoReal: "x",
      challenge: "y",
      manter: false,
    });
    const adulterado = token.slice(0, -4) + "XXXX";
    expect(await decifrarTokenPonte(adulterado)).toBeNull();
  });
});

describe("tokens de desafio (cadastro) — assinados", () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = "segredo-de-teste-bem-longo-0123456789";
  });

  it("assina e verifica as claims corretamente", async () => {
    const { assinarTokenDesafio, verificarTokenDesafio } = await import("./tokens");
    const claims = { userId: "42", challenge: "desafio-abc" };
    const token = await assinarTokenDesafio(claims);
    expect(await verificarTokenDesafio(token)).toEqual(claims);
  });

  it("token de desafio expirado devolve null", async () => {
    vi.useFakeTimers();
    const { assinarTokenDesafio, verificarTokenDesafio } = await import("./tokens");
    const token = await assinarTokenDesafio({ userId: "42", challenge: "y" });
    vi.setSystemTime(Date.now() + 6 * 60 * 1000);
    expect(await verificarTokenDesafio(token)).toBeNull();
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
```

- [ ] **Step 4: rodar e confirmar que falha**

```bash
cd apps/cms && npx vitest run src/lib/passkeys/tokens.test.ts
```
Esperado: FALHA — `Cannot find module './tokens'` (o arquivo ainda não existe).

- [ ] **Step 5: implementar `tokens.ts`**

```ts
// apps/cms/src/lib/passkeys/tokens.ts
import "server-only";

import { createHash } from "node:crypto";

import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT } from "jose";

/**
 * Duas chaves simétricas de 32 bytes derivadas de PAYLOAD_SECRET via
 * SHA-256 com contexto diferente cada uma (substitui HKDF — jose@5.9.6
 * não exporta hkdf; SHA-256 com sufixo de contexto dá a mesma separação
 * de domínio para este caso de uso). Nunca reusar a mesma chave para JWE
 * e JWS — são propósitos diferentes.
 */
function chave(contexto: string): Uint8Array {
  const segredo = process.env.PAYLOAD_SECRET ?? "";
  return createHash("sha256").update(`${segredo}:${contexto}`).digest();
}

const CHAVE_PONTE = () => chave("passkey-ponte-jwe");
const CHAVE_DESAFIO = () => chave("passkey-desafio-jws");

export interface ClaimsPonte {
  userId: string;
  sessaoReal: string;
  challenge: string;
  manter: boolean;
}

/** Token de ponte do login — CIFRADO (JWE), carrega a sessão real. 5 min. */
export async function cifrarTokenPonte(claims: ClaimsPonte): Promise<string> {
  return new EncryptJWT({ ...claims })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .encrypt(CHAVE_PONTE());
}

/** null em qualquer falha (expirado, adulterado, malformado) — nunca lança. */
export async function decifrarTokenPonte(token: string): Promise<ClaimsPonte | null> {
  try {
    const { payload } = await jwtDecrypt(token, CHAVE_PONTE());
    return {
      userId: String(payload.userId),
      sessaoReal: String(payload.sessaoReal),
      challenge: String(payload.challenge),
      manter: Boolean(payload.manter),
    };
  } catch (e) {
    console.error("[decifrarTokenPonte]", e);
    return null;
  }
}

export interface ClaimsDesafio {
  userId: string;
  challenge: string;
}

/** Token de desafio do cadastro — só ASSINADO (JWS), nada secreto dentro. 5 min. */
export async function assinarTokenDesafio(claims: ClaimsDesafio): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(CHAVE_DESAFIO());
}

export async function verificarTokenDesafio(token: string): Promise<ClaimsDesafio | null> {
  try {
    const { payload } = await jwtVerify(token, CHAVE_DESAFIO());
    return { userId: String(payload.userId), challenge: String(payload.challenge) };
  } catch (e) {
    console.error("[verificarTokenDesafio]", e);
    return null;
  }
}
```

- [ ] **Step 6: rodar e confirmar que passa**

```bash
cd apps/cms && npx vitest run src/lib/passkeys/tokens.test.ts
```
Esperado: 6/6 passando.

- [ ] **Step 7: typecheck completo**

```bash
pnpm --filter @ntc/cms typecheck
```

- [ ] **Step 8: Commit**

```bash
git add apps/cms/package.json pnpm-lock.yaml apps/cms/src/lib/passkeys/rp.ts apps/cms/src/lib/passkeys/tokens.ts apps/cms/src/lib/passkeys/tokens.test.ts
git commit -m "$(cat <<'EOF'
feat(cms): tokens efêmeros cifrados/assinados para o fluxo de passkey

rp.ts deriva RP ID/origin do WebAuthn de PAYLOAD_PUBLIC_SERVER_URL (sem
env var nova). tokens.ts declara jose como dependência direta (já
resolvida via payload, evita hoisting silencioso) e implementa os dois
tipos de token do design: ponte cifrada (JWE) pro login, desafio
assinado (JWS) pro cadastro — ver spec 2026-09-02 §Fluxo de login sobre
por que um JWT comum vazaria a sessão real.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Wrapper puro do WebAuthn (`webauthn.ts`)

**Files:**
- Create: `apps/cms/src/lib/passkeys/webauthn.ts`
- Test: `apps/cms/src/lib/passkeys/webauthn.test.ts`
- Modify: `apps/cms/package.json` (adiciona `@simplewebauthn/server` e `@simplewebauthn/browser`)

**Interfaces:**
- Consumes: `obterConfigRp()` de `./rp` (Task 2).
- Produces (todas em `apps/cms/src/lib/passkeys/webauthn.ts`, **sem nenhuma dependência de Payload/Local API** — só embrulha `@simplewebauthn/server`, recebe tudo por parâmetro):
  ```ts
  export interface CredencialParaOpcoes {
    credentialId: string; // base64url, o campo "id" do WebAuthnCredential
    transports: string[];
  }

  export async function montarOpcoesRegistro(params: {
    usuarioId: string;
    emailUsuario: string;
    nomeUsuario: string;
    credenciaisExistentes: CredencialParaOpcoes[];
  }): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; challenge: string }>;

  export interface RegistroVerificado {
    credentialId: string;
    publicKeyBase64: string;
    counter: number;
    transports: string[];
  }
  export async function conferirRegistro(params: {
    resposta: RegistrationResponseJSON;
    challenge: string;
  }): Promise<RegistroVerificado | null>;

  export async function montarOpcoesAutenticacao(params: {
    credenciaisPermitidas: CredencialParaOpcoes[];
  }): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string }>;

  export async function conferirAutenticacao(params: {
    resposta: AuthenticationResponseJSON;
    challenge: string;
    credentialIdEsperado: string;
    publicKeyBase64: string;
    counterAtual: number;
  }): Promise<{ novoContador: number } | null>;
  ```
  Os tipos `PublicKeyCredentialCreationOptionsJSON`, `RegistrationResponseJSON`, `PublicKeyCredentialRequestOptionsJSON`, `AuthenticationResponseJSON` vêm de `@simplewebauthn/server` (re-exportados de `@simplewebauthn/server/esm/types/index.d.ts` — importe direto de `"@simplewebauthn/server"`, o pacote já re-exporta).

- [ ] **Step 1: Adicionar as duas dependências**

Em `apps/cms/package.json`, bloco `"dependencies"`, ordem alfabética:

```json
"@simplewebauthn/browser": "14.0.0",
"@simplewebauthn/server": "14.0.0",
```

(`@simplewebauthn/browser` só é usado no client em Tasks 6/7, mas declarar as duas juntas aqui evita um segundo `pnpm install` — versão confirmada nesta sessão via `npm view`, ambas publicadas em `14.0.0`.) Rode `pnpm install` na raiz depois de editar.

- [ ] **Step 2: escrever o teste que falha primeiro — `webauthn.test.ts`**

```ts
// apps/cms/src/lib/passkeys/webauthn.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./rp", () => ({
  obterConfigRp: () => ({
    rpID: "localhost",
    rpName: "Painel Admin NTC",
    origin: "http://localhost:3001",
  }),
}));

describe("montarOpcoesRegistro", () => {
  it("gera opções com o usuário e exclui credenciais já cadastradas", async () => {
    const { montarOpcoesRegistro } = await import("./webauthn");
    const { opcoes, challenge } = await montarOpcoesRegistro({
      usuarioId: "42",
      emailUsuario: "contato@institutontc.com.br",
      nomeUsuario: "Jotta",
      credenciaisExistentes: [{ credentialId: "cred-existente", transports: ["internal"] }],
    });
    expect(opcoes.rp.id).toBe("localhost");
    expect(opcoes.rp.name).toBe("Painel Admin NTC");
    expect(opcoes.user.name).toBe("contato@institutontc.com.br");
    expect(opcoes.excludeCredentials).toEqual([{ id: "cred-existente", transports: ["internal"] }]);
    expect(opcoes.challenge).toBe(challenge);
    expect(typeof challenge).toBe("string");
    expect(challenge.length).toBeGreaterThan(10);
  });
});

describe("montarOpcoesAutenticacao", () => {
  it("gera opções restritas às credenciais permitidas", async () => {
    const { montarOpcoesAutenticacao } = await import("./webauthn");
    const { opcoes, challenge } = await montarOpcoesAutenticacao({
      credenciaisPermitidas: [{ credentialId: "cred-1", transports: ["internal", "hybrid"] }],
    });
    expect(opcoes.rpId).toBe("localhost");
    expect(opcoes.allowCredentials).toEqual([{ id: "cred-1", transports: ["internal", "hybrid"] }]);
    expect(opcoes.challenge).toBe(challenge);
  });
});

describe("conferirRegistro", () => {
  beforeEach(() => {
    vi.doMock("@simplewebauthn/server", async () => {
      const real = await vi.importActual<typeof import("@simplewebauthn/server")>(
        "@simplewebauthn/server",
      );
      return { ...real, verifyRegistrationResponse: vi.fn() };
    });
  });

  it("devolve null quando a verificação falha (verified: false)", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyRegistrationResponse).mockResolvedValue({
      verified: false,
    } as Awaited<ReturnType<typeof modulo.verifyRegistrationResponse>>);
    const { conferirRegistro } = await import("./webauthn");
    const resultado = await conferirRegistro({
      resposta: {} as Parameters<typeof conferirRegistro>[0]["resposta"],
      challenge: "abc",
    });
    expect(resultado).toBeNull();
  });

  it("extrai credentialId/publicKey/counter/transports quando verificado", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyRegistrationResponse).mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: "novo-credential-id",
          publicKey: new Uint8Array([1, 2, 3, 4]),
          counter: 0,
          transports: ["internal"],
        },
      },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyRegistrationResponse>>);
    const { conferirRegistro } = await import("./webauthn");
    const resultado = await conferirRegistro({
      resposta: {} as Parameters<typeof conferirRegistro>[0]["resposta"],
      challenge: "abc",
    });
    expect(resultado).toEqual({
      credentialId: "novo-credential-id",
      publicKeyBase64: Buffer.from([1, 2, 3, 4]).toString("base64"),
      counter: 0,
      transports: ["internal"],
    });
  });
});

describe("conferirAutenticacao", () => {
  beforeEach(() => {
    vi.doMock("@simplewebauthn/server", async () => {
      const real = await vi.importActual<typeof import("@simplewebauthn/server")>(
        "@simplewebauthn/server",
      );
      return { ...real, verifyAuthenticationResponse: vi.fn() };
    });
  });

  it("devolve null quando o contador não avança (indício de clonagem)", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 5 },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyAuthenticationResponse>>);
    const { conferirAutenticacao } = await import("./webauthn");
    const resultado = await conferirAutenticacao({
      resposta: {} as Parameters<typeof conferirAutenticacao>[0]["resposta"],
      challenge: "abc",
      credentialIdEsperado: "cred-1",
      publicKeyBase64: Buffer.from([1, 2, 3]).toString("base64"),
      counterAtual: 5, // igual ao newCounter -> não avançou -> rejeita
    });
    expect(resultado).toBeNull();
  });

  it("devolve o novo contador quando avançou e verificou", async () => {
    vi.resetModules();
    const modulo = await import("@simplewebauthn/server");
    vi.mocked(modulo.verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 6 },
    } as unknown as Awaited<ReturnType<typeof modulo.verifyAuthenticationResponse>>);
    const { conferirAutenticacao } = await import("./webauthn");
    const resultado = await conferirAutenticacao({
      resposta: {} as Parameters<typeof conferirAutenticacao>[0]["resposta"],
      challenge: "abc",
      credentialIdEsperado: "cred-1",
      publicKeyBase64: Buffer.from([1, 2, 3]).toString("base64"),
      counterAtual: 5,
    });
    expect(resultado).toEqual({ novoContador: 6 });
  });
});
```

- [ ] **Step 3: rodar e confirmar que falha**

```bash
cd apps/cms && npx vitest run src/lib/passkeys/webauthn.test.ts
```
Esperado: FALHA — `Cannot find module './webauthn'`.

- [ ] **Step 4: implementar `webauthn.ts`**

```ts
// apps/cms/src/lib/passkeys/webauthn.ts
import "server-only";

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { obterConfigRp } from "./rp";

/**
 * Wrapper puro sobre @simplewebauthn/server — SEM nenhuma dependência de
 * Payload/Local API. Quem chama (lib/cms/painelPasskeys.ts) resolve as
 * credenciais existentes e persiste o resultado; este módulo só fala o
 * protocolo WebAuthn.
 */

export interface CredencialParaOpcoes {
  credentialId: string;
  transports: string[];
}

export async function montarOpcoesRegistro(params: {
  usuarioId: string;
  emailUsuario: string;
  nomeUsuario: string;
  credenciaisExistentes: CredencialParaOpcoes[];
}): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; challenge: string }> {
  const { rpID, rpName } = obterConfigRp();
  const opcoes = await generateRegistrationOptions({
    rpID,
    rpName,
    userID: new TextEncoder().encode(params.usuarioId),
    userName: params.emailUsuario,
    userDisplayName: params.nomeUsuario,
    attestationType: "none",
    excludeCredentials: params.credenciaisExistentes.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
  return { opcoes, challenge: opcoes.challenge };
}

export interface RegistroVerificado {
  credentialId: string;
  publicKeyBase64: string;
  counter: number;
  transports: string[];
}

export async function conferirRegistro(params: {
  resposta: RegistrationResponseJSON;
  challenge: string;
}): Promise<RegistroVerificado | null> {
  const { rpID, origin } = obterConfigRp();
  const verificacao = await verifyRegistrationResponse({
    response: params.resposta,
    expectedChallenge: params.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  if (!verificacao.verified || !verificacao.registrationInfo) return null;
  const { credential } = verificacao.registrationInfo;
  return {
    credentialId: credential.id,
    publicKeyBase64: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    transports: credential.transports ?? [],
  };
}

export async function montarOpcoesAutenticacao(params: {
  credenciaisPermitidas: CredencialParaOpcoes[];
}): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string }> {
  const { rpID } = obterConfigRp();
  const opcoes = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: params.credenciaisPermitidas.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    })),
  });
  return { opcoes, challenge: opcoes.challenge };
}

export async function conferirAutenticacao(params: {
  resposta: AuthenticationResponseJSON;
  challenge: string;
  credentialIdEsperado: string;
  publicKeyBase64: string;
  counterAtual: number;
}): Promise<{ novoContador: number } | null> {
  const { rpID, origin } = obterConfigRp();
  const verificacao = await verifyAuthenticationResponse({
    response: params.resposta,
    expectedChallenge: params.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: params.credentialIdEsperado,
      publicKey: new Uint8Array(Buffer.from(params.publicKeyBase64, "base64")),
      counter: params.counterAtual,
    },
  });
  if (!verificacao.verified) return null;
  const { newCounter } = verificacao.authenticationInfo;
  // Contador não avançou (ou retrocedeu) = indício de credencial clonada/replay.
  if (newCounter <= params.counterAtual) {
    console.error("[conferirAutenticacao] contador não avançou — possível clonagem", {
      credentialId: params.credentialIdEsperado,
      counterAtual: params.counterAtual,
      newCounter,
    });
    return null;
  }
  return { novoContador: newCounter };
}
```

- [ ] **Step 5: rodar e confirmar que passa**

```bash
cd apps/cms && npx vitest run src/lib/passkeys/webauthn.test.ts
```
Esperado: 6/6 passando.

- [ ] **Step 6: typecheck completo**

```bash
pnpm --filter @ntc/cms typecheck
```

- [ ] **Step 7: Commit**

```bash
git add apps/cms/package.json pnpm-lock.yaml apps/cms/src/lib/passkeys/webauthn.ts apps/cms/src/lib/passkeys/webauthn.test.ts
git commit -m "$(cat <<'EOF'
feat(cms): wrapper puro sobre @simplewebauthn/server

Módulo sem dependência de Payload — monta/confere opções de registro e
autenticação via a lib real (v14.0.0, confirmada nesta sessão), recebe
credenciais existentes/permitidas por parâmetro. Contador que não avança
é tratado como indício de clonagem e rejeitado com log.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Orquestração com a Local API (`painelPasskeys.ts`)

**Files:**
- Create: `apps/cms/src/lib/cms/painelPasskeys.ts`
- Test: `apps/cms/src/lib/cms/painelPasskeys.test.ts`

**Interfaces:**
- Consumes: tudo de `@/lib/passkeys/webauthn` (Task 3) e `@/lib/passkeys/tokens` (Task 2); `ResultadoEscrita` de `./painelCmsEscrita`; `obterPayload` de `@/lib/payloadClient`.
- Produces:
  ```ts
  export interface PasskeyResumo {
    id: string;
    apelido: string;
    criadoEm: string;
    ultimoUsoEm: string | null;
  }

  export async function listarPasskeysDoUsuario(usuarioId: string): Promise<PasskeyResumo[]>;

  export async function prepararCadastroPasskey(
    usuarioId: string,
    emailUsuario: string,
    nomeUsuario: string,
  ): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string }>;

  export async function confirmarCadastroPasskey(
    usuarioId: string,
    resposta: RegistrationResponseJSON,
    tokenDesafio: string,
    apelido: string,
  ): Promise<ResultadoEscrita>;

  export async function removerPasskey(
    passkeyId: string,
    usuarioIdChamador: string,
    chamadorEhSuperAdmin: boolean,
  ): Promise<ResultadoEscrita>;

  export async function prepararLoginPasskey(
    usuarioId: string,
  ): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string } | null>; // null = sem passkeys cadastrados

  export async function confirmarLoginPasskey(
    usuarioId: string,
    resposta: AuthenticationResponseJSON,
    challenge: string,
  ): Promise<boolean>; // true = autenticado, atualiza counter/ultimoUsoEm
  ```
  `Task 5` consome exatamente essas seis funções — não chama `@simplewebauthn/server` nem `obterPayload()` diretamente para nada relacionado a passkey.

- [ ] **Step 1: escrever o teste que falha primeiro**

```ts
// apps/cms/src/lib/cms/painelPasskeys.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const montarOpcoesRegistroMock = vi.fn();
const conferirRegistroMock = vi.fn();
const montarOpcoesAutenticacaoMock = vi.fn();
const conferirAutenticacaoMock = vi.fn();
vi.mock("@/lib/passkeys/webauthn", () => ({
  montarOpcoesRegistro: montarOpcoesRegistroMock,
  conferirRegistro: conferirRegistroMock,
  montarOpcoesAutenticacao: montarOpcoesAutenticacaoMock,
  conferirAutenticacao: conferirAutenticacaoMock,
}));

const assinarTokenDesafioMock = vi.fn();
const verificarTokenDesafioMock = vi.fn();
vi.mock("@/lib/passkeys/tokens", () => ({
  assinarTokenDesafio: assinarTokenDesafioMock,
  verificarTokenDesafio: verificarTokenDesafioMock,
}));

const {
  listarPasskeysDoUsuario,
  prepararCadastroPasskey,
  confirmarCadastroPasskey,
  removerPasskey,
  prepararLoginPasskey,
  confirmarLoginPasskey,
} = await import("./painelPasskeys");

function montarPayloadFalso(overrides: Record<string, unknown> = {}) {
  const payloadFalso = {
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    findByID: vi.fn(),
    ...overrides,
  };
  obterPayloadMock.mockResolvedValue(payloadFalso);
  return payloadFalso;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("listarPasskeysDoUsuario", () => {
  it("mapeia os documentos pro resumo público (sem credentialId/publicKey)", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 7,
            apelido: "MacBook do Jotta",
            createdAt: "2026-09-01T10:00:00.000Z",
            ultimoUsoEm: null,
          },
        ],
      }),
    });
    const resultado = await listarPasskeysDoUsuario("42");
    expect(resultado).toEqual([
      { id: "7", apelido: "MacBook do Jotta", criadoEm: "2026-09-01T10:00:00.000Z", ultimoUsoEm: null },
    ]);
  });
});

describe("prepararCadastroPasskey / confirmarCadastroPasskey", () => {
  it("prepara opções excluindo credenciais já existentes e devolve token de desafio", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({ docs: [{ credentialId: "cred-1", transports: ["internal"] }] }),
    });
    montarOpcoesRegistroMock.mockResolvedValue({
      opcoes: { challenge: "novo-desafio" },
      challenge: "novo-desafio",
    });
    assinarTokenDesafioMock.mockResolvedValue("token-assinado");

    const resultado = await prepararCadastroPasskey("42", "contato@institutontc.com.br", "Jotta");

    expect(montarOpcoesRegistroMock).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: "42",
        credenciaisExistentes: [{ credentialId: "cred-1", transports: ["internal"] }],
      }),
    );
    expect(resultado).toEqual({ opcoes: { challenge: "novo-desafio" }, tokenDesafio: "token-assinado" });
  });

  it("confirmarCadastroPasskey rejeita token de desafio inválido sem chamar a Local API", async () => {
    verificarTokenDesafioMock.mockResolvedValue(null);
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-invalido",
      "Apelido",
    );

    expect(resultado.ok).toBe(false);
    expect(payloadFalso.create).not.toHaveBeenCalled();
  });

  it("confirmarCadastroPasskey rejeita quando o userId do token não bate com o usuário atual", async () => {
    verificarTokenDesafioMock.mockResolvedValue({ userId: "outro-usuario", challenge: "abc" });
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-de-outro-usuario",
      "Apelido",
    );

    expect(resultado.ok).toBe(false);
    expect(payloadFalso.create).not.toHaveBeenCalled();
  });

  it("confirmarCadastroPasskey salva a credencial verificada vinculada ao usuário", async () => {
    verificarTokenDesafioMock.mockResolvedValue({ userId: "42", challenge: "abc" });
    conferirRegistroMock.mockResolvedValue({
      credentialId: "novo-cred",
      publicKeyBase64: "base64==",
      counter: 0,
      transports: ["internal"],
    });
    const payloadFalso = montarPayloadFalso();

    const resultado = await confirmarCadastroPasskey(
      "42",
      {} as Parameters<typeof confirmarCadastroPasskey>[1],
      "token-valido",
      "MacBook do Jotta",
    );

    expect(resultado.ok).toBe(true);
    expect(payloadFalso.create).toHaveBeenCalledWith({
      collection: "passkeys",
      data: {
        usuario: "42",
        apelido: "MacBook do Jotta",
        credentialId: "novo-cred",
        publicKey: "base64==",
        counter: 0,
        transports: ["internal"],
      },
      overrideAccess: true,
    });
  });
});

describe("removerPasskey", () => {
  it("dono remove o próprio passkey", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "42", false);
    expect(resultado.ok).toBe(true);
    expect(payloadFalso.delete).toHaveBeenCalledWith({
      collection: "passkeys",
      id: "7",
      overrideAccess: true,
    });
  });

  it("não-dono e não-super-admin não consegue remover", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "99", false);
    expect(resultado.ok).toBe(false);
    expect(payloadFalso.delete).not.toHaveBeenCalled();
  });

  it("super-admin remove o passkey de qualquer usuário", async () => {
    const payloadFalso = montarPayloadFalso({
      findByID: vi.fn().mockResolvedValue({ id: 7, usuario: "42" }),
    });
    const resultado = await removerPasskey("7", "99", true);
    expect(resultado.ok).toBe(true);
    expect(payloadFalso.delete).toHaveBeenCalled();
  });
});

describe("prepararLoginPasskey", () => {
  it("devolve null quando o usuário não tem nenhum passkey", async () => {
    montarPayloadFalso({ find: vi.fn().mockResolvedValue({ docs: [] }) });
    expect(await prepararLoginPasskey("42")).toBeNull();
  });

  it("monta opções restritas às credenciais do usuário quando ele tem passkey", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({ docs: [{ credentialId: "cred-1", transports: ["internal"] }] }),
    });
    montarOpcoesAutenticacaoMock.mockResolvedValue({
      opcoes: { challenge: "desafio-login" },
      challenge: "desafio-login",
    });
    const resultado = await prepararLoginPasskey("42");
    expect(resultado).toEqual({ opcoes: { challenge: "desafio-login" }, challenge: "desafio-login" });
  });
});

describe("confirmarLoginPasskey", () => {
  it("false quando a credencial não é encontrada", async () => {
    montarPayloadFalso({ find: vi.fn().mockResolvedValue({ docs: [] }) });
    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-inexistente" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );
    expect(ok).toBe(false);
  });

  it("true e atualiza counter/ultimoUsoEm quando a verificação passa", async () => {
    const payloadFalso = montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 7, credentialId: "cred-1", publicKey: "b64", counter: 5, transports: [] }],
      }),
    });
    conferirAutenticacaoMock.mockResolvedValue({ novoContador: 6 });

    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-1" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );

    expect(ok).toBe(true);
    expect(payloadFalso.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "passkeys",
        id: 7,
        data: expect.objectContaining({ counter: 6 }),
        overrideAccess: true,
      }),
    );
  });

  it("false quando conferirAutenticacao rejeita (ex.: contador não avançou)", async () => {
    montarPayloadFalso({
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 7, credentialId: "cred-1", publicKey: "b64", counter: 5, transports: [] }],
      }),
    });
    conferirAutenticacaoMock.mockResolvedValue(null);

    const ok = await confirmarLoginPasskey(
      "42",
      { id: "cred-1" } as Parameters<typeof confirmarLoginPasskey>[1],
      "desafio",
    );
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: rodar e confirmar que falha**

```bash
cd apps/cms && npx vitest run src/lib/cms/painelPasskeys.test.ts
```
Esperado: FALHA — `Cannot find module './painelPasskeys'`.

- [ ] **Step 3: implementar `painelPasskeys.ts`**

```ts
// apps/cms/src/lib/cms/painelPasskeys.ts
import "server-only";

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import {
  conferirAutenticacao,
  conferirRegistro,
  montarOpcoesAutenticacao,
  montarOpcoesRegistro,
} from "@/lib/passkeys/webauthn";
import { assinarTokenDesafio, verificarTokenDesafio } from "@/lib/passkeys/tokens";
import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

const ERRO_GENERICO = "Não foi possível completar a operação. Tente novamente.";

interface PasskeyDoc {
  id: string | number;
  usuario: string | number | { id: string | number };
  apelido: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[] | null;
  createdAt: string;
  ultimoUsoEm: string | null;
}

async function buscarPasskeysDoUsuario(usuarioId: string): Promise<PasskeyDoc[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "passkeys",
    where: { usuario: { equals: usuarioId } },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });
  return res.docs as unknown as PasskeyDoc[];
}

export interface PasskeyResumo {
  id: string;
  apelido: string;
  criadoEm: string;
  ultimoUsoEm: string | null;
}

export async function listarPasskeysDoUsuario(usuarioId: string): Promise<PasskeyResumo[]> {
  const docs = await buscarPasskeysDoUsuario(usuarioId);
  return docs.map((d) => ({
    id: String(d.id),
    apelido: d.apelido,
    criadoEm: d.createdAt,
    ultimoUsoEm: d.ultimoUsoEm,
  }));
}

export async function prepararCadastroPasskey(
  usuarioId: string,
  emailUsuario: string,
  nomeUsuario: string,
): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string }> {
  const existentes = await buscarPasskeysDoUsuario(usuarioId);
  const { opcoes, challenge } = await montarOpcoesRegistro({
    usuarioId,
    emailUsuario,
    nomeUsuario,
    credenciaisExistentes: existentes.map((d) => ({
      credentialId: d.credentialId,
      transports: d.transports ?? [],
    })),
  });
  const tokenDesafio = await assinarTokenDesafio({ userId: usuarioId, challenge });
  return { opcoes, tokenDesafio };
}

export async function confirmarCadastroPasskey(
  usuarioId: string,
  resposta: RegistrationResponseJSON,
  tokenDesafio: string,
  apelido: string,
): Promise<ResultadoEscrita> {
  const claims = await verificarTokenDesafio(tokenDesafio);
  if (!claims || claims.userId !== usuarioId) {
    return { ok: false, erro: "Desafio de cadastro expirado ou inválido. Tente novamente." };
  }
  try {
    const verificado = await conferirRegistro({ resposta, challenge: claims.challenge });
    if (!verificado) return { ok: false, erro: "Não foi possível verificar o passkey." };

    const payload = await obterPayload();
    await payload.create({
      collection: "passkeys",
      data: {
        usuario: usuarioId,
        apelido,
        credentialId: verificado.credentialId,
        publicKey: verificado.publicKeyBase64,
        counter: verificado.counter,
        transports: verificado.transports,
      },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    console.error("[confirmarCadastroPasskey]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerPasskey(
  passkeyId: string,
  usuarioIdChamador: string,
  chamadorEhSuperAdmin: boolean,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const doc = (await payload.findByID({
      collection: "passkeys",
      id: passkeyId,
      overrideAccess: true,
    })) as unknown as PasskeyDoc;
    const donoId = typeof doc.usuario === "object" ? String(doc.usuario.id) : String(doc.usuario);
    if (!chamadorEhSuperAdmin && donoId !== usuarioIdChamador) {
      return { ok: false, erro: "Você não tem permissão para remover este passkey." };
    }
    await payload.delete({ collection: "passkeys", id: passkeyId, overrideAccess: true });
    return { ok: true };
  } catch (e) {
    console.error("[removerPasskey]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function prepararLoginPasskey(
  usuarioId: string,
): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string } | null> {
  const docs = await buscarPasskeysDoUsuario(usuarioId);
  if (docs.length === 0) return null;
  return montarOpcoesAutenticacao({
    credenciaisPermitidas: docs.map((d) => ({
      credentialId: d.credentialId,
      transports: d.transports ?? [],
    })),
  });
}

export async function confirmarLoginPasskey(
  usuarioId: string,
  resposta: AuthenticationResponseJSON,
  challenge: string,
): Promise<boolean> {
  try {
    const docs = await buscarPasskeysDoUsuario(usuarioId);
    const doc = docs.find((d) => d.credentialId === resposta.id);
    if (!doc) return false;

    const verificado = await conferirAutenticacao({
      resposta,
      challenge,
      credentialIdEsperado: doc.credentialId,
      publicKeyBase64: doc.publicKey,
      counterAtual: doc.counter,
    });
    if (!verificado) return false;

    const payload = await obterPayload();
    await payload.update({
      collection: "passkeys",
      id: doc.id,
      data: { counter: verificado.novoContador, ultimoUsoEm: new Date().toISOString() },
      overrideAccess: true,
    });
    return true;
  } catch (e) {
    console.error("[confirmarLoginPasskey]", e);
    return false;
  }
}
```

- [ ] **Step 4: rodar e confirmar que passa**

```bash
cd apps/cms && npx vitest run src/lib/cms/painelPasskeys.test.ts
```
Esperado: 14/14 passando.

- [ ] **Step 5: typecheck completo**

```bash
pnpm --filter @ntc/cms typecheck
```

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/lib/cms/painelPasskeys.ts apps/cms/src/lib/cms/painelPasskeys.test.ts
git commit -m "$(cat <<'EOF'
feat(cms): orquestração de passkeys sobre a Local API

Compõe webauthn.ts + tokens.ts com a coleção passkeys: listar, preparar
e confirmar cadastro (valida o token de desafio ANTES de qualquer
verificação WebAuthn), remover (dono ou super-admin), preparar e
confirmar login (atualiza counter/ultimoUsoEm em caso de sucesso).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Server Actions — login com 2º fator e autogestão

**Files:**
- Modify: `apps/cms/src/app/(painel)/acoesAuth.ts` (função `entrar` + novas actions)

**Interfaces:**
- Consumes: as seis funções de `@/lib/cms/painelPasskeys` (Task 4); `obterUsuarioCms`/`COOKIE_SESSAO` de `@/lib/cms/autenticacao` (já existe); `EstadoLogin` (já existe, será estendida).
- Produces:
  ```ts
  export interface EstadoLogin {
    erro?: string;
    ok?: string;
    precisaPasskey?: {
      tokenPendente: string;
      opcoesAutenticacao: PublicKeyCredentialRequestOptionsJSON;
    };
  }

  export async function verificarAutenticacaoPasskey(
    tokenPendente: string,
    resposta: AuthenticationResponseJSON,
  ): Promise<{ erro?: string }>; // sucesso: chama redirect("/"), nunca retorna

  export async function obterOpcoesCadastroPasskeyCms(): Promise<
    { ok: true; opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string } | { ok: false; erro: string }
  >;

  export async function verificarCadastroPasskeyCms(
    resposta: RegistrationResponseJSON,
    tokenDesafio: string,
    apelido: string,
  ): Promise<ResultadoEscrita>;

  export async function listarMinhasPasskeysCms(): Promise<PasskeyResumo[]>;

  export async function removerPasskeyProprioCms(passkeyId: string): Promise<ResultadoEscrita>;
  ```
  Task 6 (UI de login e de Configurações) consome exatamente essas assinaturas.

- [ ] **Step 1: ler o arquivo atual por completo**

```bash
cat "apps/cms/src/app/(painel)/acoesAuth.ts"
```

Confirme que a função `entrar` ainda começa exatamente como no trecho abaixo antes de editar — se o anchor não bater, PARE e reporte (o arquivo pode ter mudado desde que este plano foi escrito):

```ts
export async function entrar(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const manter = formData.get("manter") === "on";
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  let token: string | undefined;
  try {
    const payload = await obterPayload();
    ({ token } = await payload.login({
      collection: "users",
      data: { email, password: senha },
    }));
  } catch (e) {
    const status = (e as { status?: number }).status;
    return status === 401
      ? { erro: "E-mail ou senha incorretos." }
      : { erro: "Não foi possível entrar. Tente novamente." };
  }
  if (!token) return { erro: "Não foi possível entrar. Tente novamente." };

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}
```

- [ ] **Step 2: adicionar os novos imports no topo do arquivo**

Logo abaixo dos imports existentes:

```ts
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import {
  confirmarCadastroPasskey,
  confirmarLoginPasskey,
  listarPasskeysDoUsuario,
  prepararCadastroPasskey,
  prepararLoginPasskey,
  removerPasskey,
  type PasskeyResumo,
} from "@/lib/cms/painelPasskeys";
import { cifrarTokenPonte, decifrarTokenPonte } from "@/lib/passkeys/tokens";
```

(`PublicKeyCredentialCreationOptionsJSON`/`PublicKeyCredentialRequestOptionsJSON` são os mesmos tipos que `@simplewebauthn/server` já usa internamente em `generateRegistrationOptions`/`generateAuthenticationOptions` — importar direto aqui em vez de inferir via `Awaited<ReturnType<...>>` mantém as assinaturas legíveis.)

- [ ] **Step 3: estender `EstadoLogin`**

Troque a interface atual:

```ts
export interface EstadoLogin {
  erro?: string;
  ok?: string;
}
```

por:

```ts
export interface EstadoLogin {
  erro?: string;
  ok?: string;
  /** Presente quando a senha bateu mas o usuário tem passkey — 2º fator pendente. */
  precisaPasskey?: {
    tokenPendente: string;
    opcoesAutenticacao: PublicKeyCredentialRequestOptionsJSON;
  };
}
```

- [ ] **Step 4: reescrever `entrar` para checar passkey antes de abrir a sessão**

Substitua o corpo da função (mantendo a assinatura) por:

```ts
export async function entrar(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const manter = formData.get("manter") === "on";
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  let token: string | undefined;
  let usuarioId: string | undefined;
  try {
    const payload = await obterPayload();
    const resultado = await payload.login({
      collection: "users",
      data: { email, password: senha },
    });
    token = resultado.token;
    usuarioId = resultado.user ? String(resultado.user.id) : undefined;
  } catch (e) {
    const status = (e as { status?: number }).status;
    return status === 401
      ? { erro: "E-mail ou senha incorretos." }
      : { erro: "Não foi possível entrar. Tente novamente." };
  }
  if (!token || !usuarioId) return { erro: "Não foi possível entrar. Tente novamente." };

  const pendente = await prepararLoginPasskey(usuarioId);
  if (pendente) {
    const tokenPendente = await cifrarTokenPonte({
      userId: usuarioId,
      sessaoReal: token,
      challenge: pendente.challenge,
      manter,
    });
    return { precisaPasskey: { tokenPendente, opcoesAutenticacao: pendente.opcoes } };
  }

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}
```

- [ ] **Step 5: adicionar `verificarAutenticacaoPasskey`**

Logo após a função `entrar`:

```ts
/** Completa o login depois da senha, confirmando o 2º fator (passkey). */
export async function verificarAutenticacaoPasskey(
  tokenPendente: string,
  resposta: AuthenticationResponseJSON,
): Promise<{ erro?: string }> {
  const claims = await decifrarTokenPonte(tokenPendente);
  if (!claims) return { erro: "Sessão de login expirada. Entre novamente." };

  const ok = await confirmarLoginPasskey(claims.userId, resposta, claims.challenge);
  if (!ok) return { erro: "Não foi possível confirmar o passkey. Tente novamente." };

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, claims.sessaoReal, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(claims.manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}
```

- [ ] **Step 6: adicionar as actions de autogestão (cadastro/lista/remoção do próprio usuário)**

No final do arquivo:

```ts
/** Opções pra cadastrar um novo passkey — exige sessão ativa. */
export async function obterOpcoesCadastroPasskeyCms(): Promise<
  | { ok: true; opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string }
  | { ok: false; erro: string }
> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  const { opcoes, tokenDesafio } = await prepararCadastroPasskey(usuario.id, usuario.email, usuario.nome);
  return { ok: true, opcoes, tokenDesafio };
}

export async function verificarCadastroPasskeyCms(
  resposta: RegistrationResponseJSON,
  tokenDesafio: string,
  apelido: string,
): Promise<ReturnType<typeof confirmarCadastroPasskey>> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  return confirmarCadastroPasskey(usuario.id, resposta, tokenDesafio, apelido);
}

export async function listarMinhasPasskeysCms(): Promise<PasskeyResumo[]> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return [];
  return listarPasskeysDoUsuario(usuario.id);
}

export async function removerPasskeyProprioCms(
  passkeyId: string,
): Promise<ReturnType<typeof removerPasskey>> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  return removerPasskey(passkeyId, usuario.id, false);
}
```

- [ ] **Step 7: typecheck**

```bash
pnpm --filter @ntc/cms typecheck
```
Esperado: limpo. Se o tipo inline de `opcoesAutenticacao`/`opcoes` no Step 3/6 (o `Awaited<ReturnType<...>>` aninhado) não compilar de primeira, simplifique extraindo um tipo nomeado exportado por `painelPasskeys.ts` em vez do tipo inferido — não force um `as any`.

- [ ] **Step 8: Commit**

```bash
git add "apps/cms/src/app/(painel)/acoesAuth.ts"
git commit -m "$(cat <<'EOF'
feat(cms): login com 2º fator via passkey + autogestão

entrar() agora consulta se o usuário tem passkey ANTES de abrir a
sessão — sem passkey, comportamento idêntico ao de hoje. Com passkey,
devolve um token de ponte cifrado em vez do cookie; o cookie real só é
setado em verificarAutenticacaoPasskey(), depois da cerimônia WebAuthn
confirmada. Novas actions de autogestão (cadastrar/listar/remover o
próprio passkey) seguem o padrão obterUsuarioCms() já usado no arquivo.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: UI — confirmação no login e autogestão em Configurações

**Files:**
- Create: `apps/cms/src/app/(painel)/entrar/ConfirmarPasskey.tsx`
- Modify: `apps/cms/src/app/(painel)/entrar/FormLogin.tsx`
- Modify: `apps/cms/src/app/(painel)/TelaConfiguracoes.tsx`

**Interfaces:**
- Consumes: `verificarAutenticacaoPasskey`, `obterOpcoesCadastroPasskeyCms`, `verificarCadastroPasskeyCms`, `listarMinhasPasskeysCms`, `removerPasskeyProprioCms` de `../acoesAuth` (Task 5); `startAuthentication`, `startRegistration`, `browserSupportsWebAuthn` de `@simplewebauthn/browser`.

- [ ] **Step 1: criar `ConfirmarPasskey.tsx`**

```tsx
// apps/cms/src/app/(painel)/entrar/ConfirmarPasskey.tsx
"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";

import { verificarAutenticacaoPasskey, type EstadoLogin } from "../acoesAuth";

interface ConfirmarPasskeyProps {
  precisaPasskey: NonNullable<EstadoLogin["precisaPasskey"]>;
}

/**
 * Segunda etapa do login — aparece só quando `entrar()` já validou a
 * senha e o usuário tem passkey cadastrado. A cerimônia do navegador
 * (Touch ID etc.) só dispara com um clique explícito do usuário, não
 * automaticamente ao montar (mais previsível entre navegadores).
 */
export function ConfirmarPasskey({ precisaPasskey }: ConfirmarPasskeyProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  async function confirmar() {
    setErro(null);
    setConfirmando(true);
    try {
      const resposta = await startAuthentication({ optionsJSON: precisaPasskey.opcoesAutenticacao });
      const resultado = await verificarAutenticacaoPasskey(precisaPasskey.tokenPendente, resposta);
      if (resultado.erro) setErro(resultado.erro);
      // sucesso: verificarAutenticacaoPasskey já chama redirect("/") no servidor.
    } catch {
      setErro("Não foi possível confirmar com o passkey. Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="pcms-login__form">
      <h1 className="pcms-login__titulo">Confirme sua identidade</h1>
      <p className="pcms-login__subtitulo">Use o passkey cadastrado neste dispositivo (Touch ID, Windows Hello etc.).</p>
      {erro ? (
        <p className="pcms-login__erro" role="alert">
          {erro}
        </p>
      ) : null}
      <button type="button" className="pcms-login__entrar" onClick={confirmar} disabled={confirmando}>
        {confirmando ? "Confirmando…" : "Confirmar com passkey"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: editar `FormLogin.tsx` para renderizar a segunda etapa**

Leia o arquivo atual primeiro para confirmar que o corpo ainda bate com o trecho abaixo. Substitua:

```tsx
export function FormLogin() {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(entrar, null);

  return (
    <form className="pcms-login__form" action={agir}>
```

por:

```tsx
export function FormLogin() {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(entrar, null);

  if (estado?.precisaPasskey) {
    return <ConfirmarPasskey precisaPasskey={estado.precisaPasskey} />;
  }

  return (
    <form className="pcms-login__form" action={agir}>
```

E adicione o import no topo do arquivo, junto aos demais:

```tsx
import { ConfirmarPasskey } from "./ConfirmarPasskey";
```

- [ ] **Step 3: adicionar a seção "Passkeys" em `TelaConfiguracoes.tsx`**

Primeiro, amplie a prop `usuario` pra incluir `id` (o chamador em `ShellCms.tsx` já passa um objeto com `id` — não precisa mudar o call site, só o tipo):

```tsx
interface TelaConfiguracoesProps {
  usuario: { id: string; nome: string; email: string };
}
```

Adicione os imports no topo:

```tsx
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";

import {
  listarMinhasPasskeysCms,
  obterOpcoesCadastroPasskeyCms,
  removerPasskeyProprioCms,
  verificarCadastroPasskeyCms,
} from "./acoesAuth";
```

Adicione, dentro do componente `TelaConfiguracoes` (junto aos outros `useState`), o estado da nova seção:

```tsx
const [passkeys, setPasskeys] = useState<
  { id: string; apelido: string; criadoEm: string; ultimoUsoEm: string | null }[]
>([]);
const [carregandoPasskeys, setCarregandoPasskeys] = useState(true);
const [cadastrandoPasskey, setCadastrandoPasskey] = useState(false);
const [erroPasskey, setErroPasskey] = useState<string | null>(null);
const suportaWebAuthn = typeof window !== "undefined" && browserSupportsWebAuthn();

useEffect(() => {
  listarMinhasPasskeysCms()
    .then(setPasskeys)
    .finally(() => setCarregandoPasskeys(false));
}, []);

async function cadastrarPasskey() {
  const apelido = window.prompt("Como quer chamar este dispositivo? (ex.: MacBook do Jotta)");
  if (!apelido) return;
  setErroPasskey(null);
  setCadastrandoPasskey(true);
  try {
    const preparo = await obterOpcoesCadastroPasskeyCms();
    if (!preparo.ok) {
      setErroPasskey(preparo.erro);
      return;
    }
    const resposta = await startRegistration({ optionsJSON: preparo.opcoes });
    const resultado = await verificarCadastroPasskeyCms(resposta, preparo.tokenDesafio, apelido);
    if (!resultado.ok) {
      setErroPasskey(resultado.erro ?? "Não foi possível cadastrar o passkey.");
      return;
    }
    setPasskeys(await listarMinhasPasskeysCms());
  } catch {
    setErroPasskey("Não foi possível cadastrar o passkey. Tente novamente.");
  } finally {
    setCadastrandoPasskey(false);
  }
}

async function removerPasskeyProprio(id: string) {
  const resultado = await removerPasskeyProprioCms(id);
  if (resultado.ok) setPasskeys(await listarMinhasPasskeysCms());
}
```

(Adicione `useEffect` ao import de `"react"` no topo do arquivo, junto de `useRef`, `useState`, `useTransition`.)

E, dentro do JSX, logo depois do `</form>` de "Minha conta" mas ainda dentro do mesmo `<section className="pcms-config-card pcms-config-card--ativa">`, adicione:

```tsx
<hr className="pcms-editor__hr" />
<h4>Passkeys</h4>
<p>Segundo fator de login neste painel — opcional, um por dispositivo.</p>
{!suportaWebAuthn ? (
  <p className="pcms-form-aviso">Este navegador não tem suporte a passkeys.</p>
) : (
  <>
    {erroPasskey ? (
      <p className="pcms-login__erro" role="alert">
        {erroPasskey}
      </p>
    ) : null}
    {carregandoPasskeys ? (
      <p>Carregando…</p>
    ) : passkeys.length === 0 ? (
      <p>Nenhum passkey cadastrado ainda.</p>
    ) : (
      <ul className="pcms-lista-simples">
        {passkeys.map((p) => (
          <li key={p.id}>
            <span>
              <strong>{p.apelido}</strong> · cadastrado em {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
              {p.ultimoUsoEm ? ` · usado em ${new Date(p.ultimoUsoEm).toLocaleDateString("pt-BR")}` : ""}
            </span>
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              onClick={() => removerPasskeyProprio(p.id)}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    )}
    <button type="button" className="pcms-btn" onClick={cadastrarPasskey} disabled={cadastrandoPasskey}>
      {cadastrandoPasskey ? "Cadastrando…" : "Adicionar passkey"}
    </button>
  </>
)}
```

Se a classe `pcms-lista-simples` não existir no CSS do painel (`painel.css`), use `<ul style={{ listStyle: "none", padding: 0 }}>` com cada `<li>` em `display:flex; justify-content:space-between; align-items:center; gap:8px` inline, em vez de inventar uma classe nova sem verificar — confirme grep-ando `painel.css` antes de decidir.

- [ ] **Step 4: typecheck**

```bash
pnpm --filter @ntc/cms typecheck
```

- [ ] **Step 5: rodar a suíte completa (garantir que nada quebrou)**

```bash
pnpm --filter @ntc/cms test
```
Esperado: todos os testes existentes + os das Tasks 2-4 passando.

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/entrar/ConfirmarPasskey.tsx" "apps/cms/src/app/(painel)/entrar/FormLogin.tsx" "apps/cms/src/app/(painel)/TelaConfiguracoes.tsx"
git commit -m "$(cat <<'EOF'
feat(cms): UI de confirmação de passkey no login e autogestão em Configurações

/entrar mostra uma segunda etapa quando a senha bate e o usuário tem
passkey — cerimônia WebAuthn só dispara com clique explícito. Em
Configurações → Minha conta, seção nova pra listar, cadastrar e remover
os próprios passkeys. Sem teste automatizado (componentes React não são
testados neste projeto) — checkpoint visual manual, CLAUDE.md §6.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: UI — remoção pelo super-admin na tela Usuários

**Files:**
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (novas actions)
- Modify: `apps/cms/src/app/(painel)/TelaUsuarios.tsx`

**Interfaces:**
- Consumes: `listarPasskeysDoUsuario`, `removerPasskey` de `@/lib/cms/painelPasskeys` (Task 4).
- Produces:
  ```ts
  export async function listarPasskeysDeUsuarioCms(usuarioId: string): Promise<PasskeyResumo[]>;
  export async function removerPasskeyAdminCms(passkeyId: string): Promise<ResultadoEscrita>;
  ```

- [ ] **Step 1: adicionar as duas actions em `acoes.ts`**

Adicione os imports no topo (junto aos já existentes de `@/lib/cms/painelCmsEscrita`/`painelCmsUsuarios`):

```ts
import { listarPasskeysDoUsuario, removerPasskey, type PasskeyResumo } from "@/lib/cms/painelPasskeys";
```

E, próximo das outras actions super-admin-only (`removerUsuarioCms` etc.):

```ts
export async function listarPasskeysDeUsuarioCms(usuarioId: string): Promise<PasskeyResumo[]> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") return [];
  return listarPasskeysDoUsuario(usuarioId);
}

export async function removerPasskeyAdminCms(passkeyId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") {
    return { ok: false, erro: "Você não tem permissão para esta ação." };
  }
  return removerPasskey(passkeyId, usuario.id, true);
}
```

- [ ] **Step 2: editar `TelaUsuarios.tsx`**

Adicione o import:

```tsx
import { listarPasskeysDeUsuarioCms, removerPasskeyAdminCms } from "./acoes";
```

Adicione estado (junto aos outros `useState` do componente):

```tsx
const [expandido, setExpandido] = useState<string | null>(null);
const [passkeysPorUsuario, setPasskeysPorUsuario] = useState<
  Record<string, { id: string; apelido: string; criadoEm: string; ultimoUsoEm: string | null }[]>
>({});

async function alternarExpandido(usuarioId: string) {
  if (expandido === usuarioId) {
    setExpandido(null);
    return;
  }
  setExpandido(usuarioId);
  if (!passkeysPorUsuario[usuarioId]) {
    const lista = await listarPasskeysDeUsuarioCms(usuarioId);
    setPasskeysPorUsuario((atual) => ({ ...atual, [usuarioId]: lista }));
  }
}

async function removerPasskeyDeUsuario(usuarioId: string, passkeyId: string) {
  const resultado = await removerPasskeyAdminCms(passkeyId);
  if (resultado.ok) {
    const lista = await listarPasskeysDeUsuarioCms(usuarioId);
    setPasskeysPorUsuario((atual) => ({ ...atual, [usuarioId]: lista }));
  }
}
```

No corpo da tabela, dentro de `<div className="pcms-home-row__acoes">` (a mesma célula de ações de cada linha), adicione um botão de alternância antes do botão "Remover" existente:

```tsx
<button
  type="button"
  className="pcms-btn pcms-btn--ghost pcms-btn--mini"
  onClick={() => alternarExpandido(u.id)}
>
  {expandido === u.id ? "Ocultar passkeys" : "Passkeys"}
</button>
```

E logo depois do `</tr>` de cada linha `u` (ainda dentro do `.map`), condicionalmente:

```tsx
{expandido === u.id && (
  <tr>
    <td colSpan={5}>
      {!passkeysPorUsuario[u.id] ? (
        <p>Carregando…</p>
      ) : passkeysPorUsuario[u.id].length === 0 ? (
        <p>Nenhum passkey cadastrado.</p>
      ) : (
        <ul className="pcms-lista-simples">
          {passkeysPorUsuario[u.id].map((p) => (
            <li key={p.id}>
              <span>
                <strong>{p.apelido}</strong> · cadastrado em{" "}
                {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
              </span>
              <button
                type="button"
                className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                onClick={() => removerPasskeyDeUsuario(u.id, p.id)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </td>
  </tr>
)}
```

Se `pcms-lista-simples` não existir (mesma ressalva da Task 6), use o mesmo fallback inline em vez de inventar CSS novo sem checar.

- [ ] **Step 3: typecheck**

```bash
pnpm --filter @ntc/cms typecheck
```

- [ ] **Step 4: suíte completa**

```bash
pnpm --filter @ntc/cms test
```

- [ ] **Step 5: Commit**

```bash
git add "apps/cms/src/app/(painel)/acoes.ts" "apps/cms/src/app/(painel)/TelaUsuarios.tsx"
git commit -m "$(cat <<'EOF'
feat(cms): super-admin remove passkey de qualquer usuário

Tela Usuários ganha uma seção expansível por linha listando os
passkeys do usuário, com remoção — cobre o caso de dispositivo
perdido sem precisar de script manual (mesma proteção super-admin já
usada por removerUsuarioCms).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Depois de todas as tasks

1. `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms test` limpo.
2. **Manual, fica pro PO** (nenhuma task automatiza isso): `pnpm payload:push:schema` com o dev parado, diff revisado, `N` em qualquer prompt de DATA LOSS (CLAUDE.md §14) — sem isso a coleção `passkeys` não existe no banco e o cadastro falha.
3. Checkpoint visual manual (CLAUDE.md §6): cadastrar um passkey de verdade em Configurações → Minha conta (Touch ID do Mac), fazer logout, logar de novo e confirmar que a segunda etapa aparece e funciona; testar remoção do próprio passkey; testar remoção pelo super-admin na tela Usuários; confirmar que um usuário sem passkey continua logando normalmente sem nenhuma tela nova aparecer.
