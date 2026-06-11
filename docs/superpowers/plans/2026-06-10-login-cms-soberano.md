# Login do CMS Soberano + mudança para apps/cms — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover o CMS Soberano de `apps/web` (`/prototipo-cms`) para a raiz do `apps/cms` e protegê-lo com login via auth do Payload (collection Users, cookie `payload-token`).

**Architecture:** O route group `(soberano)` no app cms ganha layout raiz próprio (paralelo ao `(payload)` do admin). As libs `prototipoCms*` movem com imports intactos — o alias `@/*` aponta para `src/*` nos dois apps. Auth: Server Action `entrar` chama `payload.login()` (Local API) e grava o JWT no cookie httpOnly; páginas e Server Actions validam com `payload.auth()`.

**Tech Stack:** Next.js 15 App Router, Payload 3.18 Local API, React 19 (`useActionState`), CSS dedicado `pcms-*`.

**Spec:** `docs/superpowers/specs/2026-06-10-login-cms-soberano-design.md`

**Contexto fixo:**
- Worktree: `/Users/joao/Documents/portal-ntc-cms` (branch `feat/cms-soberana`). **Todos os comandos rodam daí.**
- Sem testes unitários: o padrão do projeto (CLAUDE.md §6 + memória do usuário) é `pnpm typecheck`/`pnpm build` + checklist manual com servidor no ar para aprovação humana. Não criar arquivos de teste.
- Se qualquer comando `payload`/`next dev` do app cms perguntar sobre push de schema com DATA LOSS → responder **N** e avisar o usuário.
- Commits em português, Conventional Commits, sem emoji, sem push.

---

### Task 1: Infra Local API no apps/cms

**Files:**
- Create: `apps/cms/src/lib/payloadClient.ts`
- Modify: `apps/cms/next.config.ts`
- Modify: `apps/cms/package.json` (via pnpm)

- [ ] **Step 1: Adicionar dependência `server-only`**

```bash
pnpm --filter @ntc/cms add server-only
```

(As libs que vamos copiar na Task 2 fazem `import "server-only"`; o app web resolve por hoisting, o cms declara explícito.)

- [ ] **Step 2: Criar `apps/cms/src/lib/payloadClient.ts`**

```ts
import { cache } from "react";
import { getPayload, type Payload } from "payload";

import config from "@payload-config";

/**
 * Cliente Payload server-only do app cms — espelho de
 * apps/web/lib/payloadClient.ts, mas importando a config local via alias
 * @payload-config. Instancia o Payload uma vez por request via cache().
 *
 * Nunca importe este módulo em Client Component.
 */
export const obterPayload = cache(async (): Promise<Payload> => {
  return getPayload({ config });
});
```

- [ ] **Step 3: Subir o bodySizeLimit das Server Actions no cms**

Em `apps/cms/next.config.ts`, trocar o objeto de config por:

```ts
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
    // Server Actions do CMS Soberano recebem uploads (capa, folder PDF).
    // Folders "Nova Data" de 2026 chegam a 14 MB; 20 MB dá folga. A coleção
    // Media (Payload) valida o mimeType. Espelho do apps/web/next.config.ts.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default withPayload(nextConfig);
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/payloadClient.ts apps/cms/next.config.ts apps/cms/package.json pnpm-lock.yaml
git commit -m "feat(cms): cliente Local API e bodySizeLimit para o CMS Soberano"
```

---

### Task 2: Copiar as libs do protótipo para o cms

**Files:**
- Create: `apps/cms/src/lib/cms/lexical.ts` (cópia verbatim de `apps/web/lib/cms/lexical.ts`)
- Create: `apps/cms/src/lib/cms/prototipoCms.ts` (cópia verbatim)
- Create: `apps/cms/src/lib/cms/prototipoCmsEscrita.ts` (cópia verbatim)

Os imports internos (`@/lib/payloadClient`, `@/lib/cms/lexical`) resolvem sem edição: o alias `@/*` do cms aponta para `./src/*` e os caminhos espelham os do web. **Não editar o conteúdo.** O `lexical.ts` continua existindo no web (é usado por `eventos.ts` e `corpoDocente.ts` do site); a cópia evita mexer em arquivos que a `main` também toca.

- [ ] **Step 1: Copiar os três arquivos**

```bash
mkdir -p apps/cms/src/lib/cms
cp apps/web/lib/cms/lexical.ts apps/cms/src/lib/cms/lexical.ts
cp apps/web/lib/cms/prototipoCms.ts apps/cms/src/lib/cms/prototipoCms.ts
cp apps/web/lib/cms/prototipoCmsEscrita.ts apps/cms/src/lib/cms/prototipoCmsEscrita.ts
```

- [ ] **Step 2: Anotar a cópia no cabeçalho do lexical.ts copiado**

Em `apps/cms/src/lib/cms/lexical.ts`, adicionar ao comentário do topo (dentro do bloco `/** ... */` existente, antes do fechamento):

```
 * Cópia de apps/web/lib/cms/lexical.ts (o site continua com a dele —
 * eventos.ts e corpoDocente.ts). Mudanças de serialização: replicar nos dois.
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/lib/cms
git commit -m "feat(cms): libs de leitura e escrita do CMS Soberano (vindas do web)"
```

---

### Task 3: Rota raiz `(soberano)` no app cms

**Files:**
- Create: `apps/cms/src/app/(soberano)/layout.tsx`
- Create: `apps/cms/src/app/(soberano)/prototipo-cms.css` (cópia de `apps/web/app/prototipo-cms.css`)
- Create: `apps/cms/src/app/(soberano)/page.tsx` + 11 arquivos de componente/action (cópias de `apps/web/app/(prototipo-cms)/prototipo-cms/`)

- [ ] **Step 1: Copiar CSS e componentes**

```bash
mkdir -p "apps/cms/src/app/(soberano)"
cp apps/web/app/prototipo-cms.css "apps/cms/src/app/(soberano)/prototipo-cms.css"
cp "apps/web/app/(prototipo-cms)/prototipo-cms/"*.tsx "apps/web/app/(prototipo-cms)/prototipo-cms/"*.ts "apps/cms/src/app/(soberano)/"
```

(Não copiar o `layout.tsx` antigo do route group web — o novo é criado no Step 3.)

- [ ] **Step 2: Ajustar revalidatePath e metadata nas cópias**

```bash
sed -i '' 's|revalidatePath("/prototipo-cms")|revalidatePath("/")|g' "apps/cms/src/app/(soberano)/acoes.ts"
```

Em `apps/cms/src/app/(soberano)/page.tsx`, remover o bloco `export const metadata ...` e o import de `Metadata` (a metadata vai para o layout no Step 3). Manter `export const dynamic = "force-dynamic";`.

- [ ] **Step 3: Criar o layout raiz do grupo**

`apps/cms/src/app/(soberano)/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { barlow, cormorant } from "../fonts";

import "./prototipo-cms.css";

export const metadata: Metadata = {
  title: "CMS Soberano · Grupo NTC",
  robots: { index: false, follow: false },
};

/**
 * Layout raiz do route group (soberano) — o CMS Soberano na raiz do app cms
 * (rotas / e /entrar). O grupo (payload) tem seu próprio layout raiz
 * (RootLayout do Payload em /admin e /api); os dois não se sobrepõem.
 * Fontes Soberana via next/font (src/app/fonts.ts), expostas como
 * --font-titulo/--font-corpo — as mesmas vars que o prototipo-cms.css usa.
 */
export default function SoberanoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Conferir que nenhum import quebrou**

Run: `pnpm --filter @ntc/cms typecheck`
Expected: sem erros (os imports `@/lib/cms/prototipoCms` e `./acoes` resolvem igual ao web).

- [ ] **Step 5: Subir o dev e conferir a rota**

Run: `pnpm dev:cms` (porta 3001; se perguntar push de schema com DATA LOSS → **N**)
Abrir `http://localhost:3001/` — o painel Soberano deve renderizar com dados reais, fontes e CSS corretos. `http://localhost:3001/admin` continua abrindo o admin Payload. Derrubar o dev depois.

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(soberano)"
git commit -m "feat(cms): CMS Soberano na raiz do app cms (rota /)"
```

---

### Task 4: Remover o protótipo do apps/web

**Files:**
- Delete: `apps/web/app/(prototipo-cms)/` (diretório inteiro)
- Delete: `apps/web/app/prototipo-cms.css`
- Delete: `apps/web/lib/cms/prototipoCms.ts`, `apps/web/lib/cms/prototipoCmsEscrita.ts`
- Modify: `apps/web/app/layout.tsx` (linhas ~103–106)

- [ ] **Step 1: Remover arquivos**

```bash
git rm -r "apps/web/app/(prototipo-cms)" apps/web/app/prototipo-cms.css \
  apps/web/lib/cms/prototipoCms.ts apps/web/lib/cms/prototipoCmsEscrita.ts
```

- [ ] **Step 2: Remover o import do CSS no root layout do web**

Em `apps/web/app/layout.tsx` (por volta da linha 103), remover o bloco de comentário que começa com `// CSS do protótipo de CMS Soberana (rota /prototipo-cms). PROTÓTIPO VISUAL` e a linha `import "./prototipo-cms.css";`. Ler o arquivo antes para pegar o bloco exato.

- [ ] **Step 3: Conferir que o web não referencia mais nada do protótipo**

Run: `grep -rn "prototipo" apps/web --include="*.ts*" | grep -v node_modules | grep -v .next`
Expected: nenhuma linha.

- [ ] **Step 4: Build do web**

Run: `pnpm --filter @ntc/web build`
Expected: build OK (o build pega `<Link>`/rotas quebradas que o typecheck não pega).

- [ ] **Step 5: Commit**

```bash
git add -A apps/web
git commit -m "chore(web): remove o prototipo de CMS (movido para apps/cms)"
```

---

### Task 5: Sessões de 14 dias na collection Users

**Files:**
- Modify: `apps/cms/src/collections/Users.ts:26` (`auth: true`)

- [ ] **Step 1: Trocar `auth: true` por config com tokenExpiration**

```ts
  auth: {
    // Sessões do CMS Soberano e do admin Payload valem 14 dias. O cookie do
    // login Soberano é de sessão por padrão; "Manter sessão iniciada" o
    // persiste pelos 14 dias. Interim até a 2FA da Janela C (CLAUDE.md §17).
    tokenExpiration: 60 * 60 * 24 * 14,
  },
```

(Só config de auth — não muda schema, não dispara migração.)

- [ ] **Step 2: Typecheck e commit**

Run: `pnpm --filter @ntc/cms typecheck` → sem erros.

```bash
git add apps/cms/src/collections/Users.ts
git commit -m "feat(cms): sessao de 14 dias nos Users (interim ate a 2FA)"
```

---

### Task 6: Núcleo de autenticação + actions entrar/sair

**Files:**
- Create: `apps/cms/src/lib/cms/autenticacao.ts`
- Create: `apps/cms/src/app/(soberano)/acoesAuth.ts`

- [ ] **Step 1: Criar `apps/cms/src/lib/cms/autenticacao.ts`**

```ts
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Sessão do CMS Soberano — validada contra o JWT do Payload (collection
 * Users). O cookie é o mesmo do admin (/admin): uma sessão só para os dois.
 */

export const COOKIE_SESSAO = "payload-token";

export interface UsuarioCms {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

/** Lê o cookie e valida com o Payload. null = sem sessão válida/expirada. */
export async function obterUsuarioCms(): Promise<UsuarioCms | null> {
  const jarra = await cookies();
  const token = jarra.get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    const payload = await obterPayload();
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    });
    if (!user || user.collection !== "users") return null;
    return {
      id: String(user.id),
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    };
  } catch {
    return null;
  }
}

/** Guarda de página: sem sessão, redireciona para /entrar. */
export async function exigirUsuarioCms(): Promise<UsuarioCms> {
  const usuario = await obterUsuarioCms();
  if (!usuario) redirect("/entrar");
  return usuario;
}
```

- [ ] **Step 2: Criar `apps/cms/src/app/(soberano)/acoesAuth.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_SESSAO } from "@/lib/cms/autenticacao";
import { obterPayload } from "@/lib/payloadClient";

const QUATORZE_DIAS_S = 60 * 60 * 24 * 14;

export interface EstadoLogin {
  erro: string;
}

/**
 * Server Action do formulário de login (/entrar). Autentica na collection
 * Users via Local API e grava o JWT no cookie httpOnly — o mesmo cookie que
 * o admin Payload usa. Falha retorna mensagem genérica (não revela qual
 * campo errou). O lockout de 5 tentativas é o default do Payload.
 */
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
    // 401 = credencial inválida/lockout (APIError do Payload). Qualquer outra
    // coisa (banco fora etc.) recebe mensagem neutra, sem vazar detalhe.
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
    // Sem "manter sessão": cookie de sessão (morre ao fechar o navegador).
    ...(manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}

/** Encerra a sessão (apaga o cookie) e volta ao login. */
export async function sair(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/entrar");
}
```

Nota: o `redirect()` fica FORA do try/catch — ele lança `NEXT_REDIRECT` por design e não pode ser engolido.

- [ ] **Step 3: Typecheck e commit**

Run: `pnpm --filter @ntc/cms typecheck` → sem erros (se `user.nome`/`user.perfil` acusarem tipo, conferir que `packages/types/src/payload-types.ts` está atualizado — NÃO rodar generate sem avisar o usuário).

```bash
git add apps/cms/src/lib/cms/autenticacao.ts "apps/cms/src/app/(soberano)/acoesAuth.ts"
git commit -m "feat(cms): nucleo de autenticacao do CMS Soberano via Payload"
```

---

### Task 7: Tela de login /entrar (layout split B)

**Files:**
- Create: `apps/cms/src/app/(soberano)/entrar/page.tsx`
- Create: `apps/cms/src/app/(soberano)/entrar/FormLogin.tsx`
- Modify: `apps/cms/src/app/(soberano)/prototipo-cms.css` (append)

- [ ] **Step 1: Criar `entrar/page.tsx`**

```tsx
import { redirect } from "next/navigation";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";

import { FormLogin } from "./FormLogin";

export const dynamic = "force-dynamic";

/**
 * /entrar — login do CMS Soberano. Layout split institucional (opção B
 * aprovada): painel Oxford com a assinatura da marca à esquerda, formulário
 * sobre osso à direita. Quem já tem sessão válida vai direto para /.
 */
export default async function EntrarPage() {
  if (await obterUsuarioCms()) redirect("/");

  return (
    <main className="pcms-login">
      <section className="pcms-login__marca" aria-hidden="true">
        {/* Logo NTC — mesmo SVG da sidebar do painel. */}
        <svg className="pcms-login__logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="20" width="14" height="40" rx="2" fill="#B5995A" />
          <text
            x="44"
            y="54"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="34"
            fontWeight="600"
            fill="#F4EFE6"
          >
            N
          </text>
        </svg>
        <div>
          <p className="pcms-login__lema">
            Inteligência institucional.
            <br />
            <em>Impacto real.</em>
          </p>
          <span className="pcms-login__filete" />
          <p className="pcms-login__eyebrow">Portal Grupo NTC · CMS Soberano</p>
        </div>
        <p className="pcms-login__rodape">Instituto NTC do Brasil · 2026</p>
      </section>
      <section className="pcms-login__painel">
        <FormLogin />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Criar `entrar/FormLogin.tsx`**

```tsx
"use client";

import { useActionState } from "react";

import { entrar, type EstadoLogin } from "../acoesAuth";

/** Formulário de login — invoca a Server Action `entrar` com estado de erro. */
export function FormLogin() {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(entrar, null);

  return (
    <form className="pcms-login__form" action={agir}>
      <h1 className="pcms-login__titulo">Acesso restrito</h1>
      <p className="pcms-login__subtitulo">Entre com as credenciais da equipe editorial.</p>

      <label className="pcms-login__label" htmlFor="login-email">
        E-mail
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        className="pcms-login__campo"
        autoComplete="email"
        required
      />

      <label className="pcms-login__label" htmlFor="login-senha">
        Senha
      </label>
      <input
        id="login-senha"
        name="senha"
        type="password"
        className="pcms-login__campo"
        autoComplete="current-password"
        required
      />

      <label className="pcms-login__manter">
        <input type="checkbox" name="manter" />
        Manter sessão iniciada
      </label>

      {estado?.erro ? (
        <p className="pcms-login__erro" role="alert">
          {estado.erro}
        </p>
      ) : null}

      <button type="submit" className="pcms-login__entrar" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Append do CSS de login em `prototipo-cms.css`**

Adicionar ao FINAL do arquivo:

```css
/* ===== Login (/entrar) — split institucional (opção B) ================== */
/* Tokens repetidos: .pcms-login vive fora de .pcms-root (espelho do bloco
 * de tokens do topo do arquivo). */
.pcms-login {
  --pcms-oxford: #11365e;
  --pcms-oxford-escuro: #0b2545;
  --pcms-dourado: #b5995a;
  --pcms-pergaminho: #f4efe6;
  --pcms-osso: #fbf8f2;
  --pcms-grafite: #2b2b2b;
  --pcms-grafite-suave: #5a5a5a;
  --pcms-linha: #d9d2c4;
  --pcms-erro: #9a1b1b;

  display: grid;
  grid-template-columns: 46% 54%;
  min-height: 100vh;
  background: var(--pcms-osso);
  color: var(--pcms-grafite);
  font-family: var(--font-corpo), "Barlow", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.pcms-login__marca {
  background: var(--pcms-oxford-escuro);
  color: var(--pcms-pergaminho);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 44px;
}

.pcms-login__logo {
  width: 56px;
  height: 56px;
}

.pcms-login__lema {
  font-family: var(--font-titulo), "Cormorant Garamond", Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 500;
  line-height: 1.18;
  margin: 0;
}

.pcms-login__lema em {
  color: var(--pcms-dourado);
}

.pcms-login__filete {
  display: block;
  width: 44px;
  height: 1px;
  background: var(--pcms-dourado);
  margin: 22px 0;
}

.pcms-login__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.7;
  margin: 0;
}

.pcms-login__rodape {
  font-size: 0.72rem;
  opacity: 0.45;
  margin: 0;
}

.pcms-login__painel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.pcms-login__form {
  width: min(380px, 100%);
}

.pcms-login__titulo {
  font-family: var(--font-titulo), "Cormorant Garamond", Georgia, serif;
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--pcms-oxford);
  margin: 0 0 4px;
}

.pcms-login__subtitulo {
  font-size: 0.9rem;
  color: var(--pcms-grafite-suave);
  margin: 0 0 28px;
}

.pcms-login__label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pcms-grafite-suave);
  margin: 0 0 6px;
}

.pcms-login__campo {
  display: block;
  width: 100%;
  background: #fff;
  border: 1px solid var(--pcms-linha);
  border-radius: 0;
  padding: 12px;
  font: inherit;
  font-size: 0.95rem;
  color: var(--pcms-grafite);
  margin-bottom: 18px;
}

.pcms-login__campo:focus-visible {
  outline: 2px solid var(--pcms-oxford);
  outline-offset: 1px;
}

.pcms-login__manter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--pcms-grafite-suave);
  margin: 2px 0 22px;
}

.pcms-login__manter input {
  accent-color: var(--pcms-oxford);
}

.pcms-login__erro {
  background: rgba(154, 27, 27, 0.08);
  border-left: 3px solid var(--pcms-erro);
  color: var(--pcms-erro);
  font-size: 0.85rem;
  padding: 10px 12px;
  margin: 0 0 18px;
}

.pcms-login__entrar {
  width: 100%;
  background: var(--pcms-oxford);
  color: var(--pcms-pergaminho);
  border: 0;
  border-radius: 0;
  padding: 14px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
}

.pcms-login__entrar:hover {
  background: var(--pcms-oxford-escuro);
}

.pcms-login__entrar:focus-visible {
  outline: 2px solid var(--pcms-dourado);
  outline-offset: 2px;
}

.pcms-login__entrar:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Mobile: painel Oxford vira cabeçalho compacto (logo + eyebrow). */
@media (max-width: 768px) {
  .pcms-login {
    grid-template-columns: 1fr;
    min-height: 100svh;
  }

  .pcms-login__marca {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 20px 22px;
  }

  .pcms-login__logo {
    width: 40px;
    height: 40px;
  }

  .pcms-login__lema,
  .pcms-login__filete,
  .pcms-login__rodape {
    display: none;
  }

  .pcms-login__painel {
    align-items: flex-start;
    padding: 36px 22px;
  }
}
```

- [ ] **Step 4: Typecheck e commit**

Run: `pnpm --filter @ntc/cms typecheck` → sem erros.

```bash
git add "apps/cms/src/app/(soberano)/entrar" "apps/cms/src/app/(soberano)/prototipo-cms.css"
git commit -m "feat(cms): tela de login /entrar com layout split institucional"
```

---

### Task 8: Guardas — página raiz, sidebar com usuário real + Sair, actions

**Files:**
- Modify: `apps/cms/src/app/(soberano)/page.tsx`
- Modify: `apps/cms/src/app/(soberano)/ShellCms.tsx`
- Modify: `apps/cms/src/app/(soberano)/acoes.ts`
- Modify: `apps/cms/src/app/(soberano)/prototipo-cms.css` (append `.pcms-sair`)

- [ ] **Step 1: Guarda + usuário na página raiz**

Em `apps/cms/src/app/(soberano)/page.tsx`:

1. Adicionar import: `import { exigirUsuarioCms } from "@/lib/cms/autenticacao";`
2. Primeira linha do corpo da função: `const usuario = await exigirUsuarioCms();`
3. Passar ao shell: `<ShellCms usuario={usuario} eventos={...} ...>`.

- [ ] **Step 2: ShellCms — prop usuario e botão Sair**

Em `apps/cms/src/app/(soberano)/ShellCms.tsx`:

1. Adicionar import: `import { sair } from "./acoesAuth";`
2. Na interface `ShellCmsProps`, adicionar:

```ts
  /** Usuário autenticado (rodapé da sidebar). */
  usuario: { nome: string; email: string };
```

3. Na assinatura: `export function ShellCms({ usuario, eventos, ... })`.
4. Adicionar helper acima do componente:

```ts
/** Iniciais para o avatar da sidebar ("Maria Souza" → "MS"). */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "NT";
}
```

5. Substituir o bloco `pcms-sidebar__foot` (hoje hardcoded "Equipe NTC") por:

```tsx
        <div className="pcms-sidebar__foot">
          <div className="pcms-avatar-mini">{iniciais(usuario.nome)}</div>
          <div>
            <strong>{usuario.nome}</strong>
            <span>{usuario.email}</span>
          </div>
          <form action={sair} className="pcms-sair__form">
            <button type="submit" className="pcms-sair" aria-label="Sair da sessão" title="Sair">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4H5v16h4" />
                <path d="m14 8 4 4-4 4" />
                <path d="M18 12H9" />
              </svg>
            </button>
          </form>
        </div>
```

- [ ] **Step 3: CSS do botão Sair**

Append em `prototipo-cms.css`:

```css
/* ===== Sair (rodapé da sidebar) ========================================= */
.pcms-sair__form {
  margin-left: auto;
  flex-shrink: 0;
}

.pcms-sair {
  background: none;
  border: 1px solid rgba(244, 239, 230, 0.25);
  border-radius: 0;
  color: var(--pcms-pergaminho);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pcms-sair svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pcms-sair:hover {
  border-color: var(--pcms-dourado);
  color: var(--pcms-dourado);
}

.pcms-sair:focus-visible {
  outline: 2px solid var(--pcms-dourado);
  outline-offset: 2px;
}
```

Conferir que `.pcms-sidebar__foot` é flex (é — tem avatar + texto lado a lado); se o texto estourar, adicionar `min-width: 0` no `div` do texto e `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` no `span`.

- [ ] **Step 4: Guarda em todas as Server Actions**

Substituir o conteúdo de `apps/cms/src/app/(soberano)/acoes.ts` por (mesma estrutura atual + guarda no topo de cada action):

```ts
"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterEventoCms,
  obterPalestranteCms,
  type EventoCmsDetalhe,
  type PalestranteCmsDetalhe,
} from "@/lib/cms/prototipoCms";
import {
  definirOcultarPalestrante,
  despublicarEvento,
  enviarMidiaEvento,
  publicarEvento,
  salvarCamposEvento,
  salvarEventosHome,
  vincularPalestrantesEvento,
  type ResultadoEscrita,
} from "@/lib/cms/prototipoCmsEscrita";

/**
 * Server Actions do CMS Soberano. Toda action valida a sessão (cookie
 * payload-token) ANTES de tocar a Local API — Server Actions são endpoints
 * públicos; sem a guarda, qualquer um com a URL escreveria no banco.
 */

const ERRO_SESSAO = "Sessão expirada. Entre novamente.";

const RECUSADO: ResultadoEscrita = { ok: false, erro: ERRO_SESSAO };

export async function carregarEvento(id: string): Promise<EventoCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterEventoCms(id);
}

export async function carregarPalestrante(id: string): Promise<PalestranteCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterPalestranteCms(id);
}

/** Salva nome/data/resumo de um evento e retorna o detalhe atualizado. */
export async function salvarEvento(
  id: string,
  campos: { nome: string; dataInicio: string; resumo: string },
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = await salvarCamposEvento(id, campos);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Faz upload de capa ou folder PDF (via FormData) e devolve o detalhe
 * atualizado. O File chega no campo "arquivo" do FormData.
 */
export async function enviarMidia(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { resultado: { ok: false, erro: "Nenhum arquivo selecionado." }, evento: null };
  }
  const resultado = await enviarMidiaEvento(id, campo, arquivo);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Publica ou despublica o evento e devolve o detalhe atualizado. */
export async function alternarPublicacaoEvento(
  id: string,
  publicar: boolean,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = publicar ? await publicarEvento(id) : await despublicarEvento(id);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Vincula os palestrantes (ids) ao evento e devolve o detalhe atualizado. */
export async function salvarPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = await vincularPalestrantesEvento(id, idsEspecialistas);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Salva os eventos em destaque na Home. */
export async function salvarEventosDestaqueHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await salvarEventosHome(idsEventos);
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/**
 * Mostra/oculta um palestrante no site público e devolve o detalhe atualizado.
 * O afterChange da coleção Especialistas revalida o Corpo Docente sozinho.
 */
export async function alternarOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, palestrante: null };
  const resultado = await definirOcultarPalestrante(id, oculto);
  if (resultado.ok) revalidatePath("/");
  const palestrante = resultado.ok ? await obterPalestranteCms(id) : null;
  return { resultado, palestrante };
}
```

- [ ] **Step 5: Typecheck e commit**

Run: `pnpm --filter @ntc/cms typecheck` → sem erros.

```bash
git add "apps/cms/src/app/(soberano)" 
git commit -m "feat(cms): exige sessao no painel e em todas as Server Actions"
```

---

### Task 9: Verificação final

- [ ] **Step 1: Build completo do monorepo**

Run: `pnpm build`
Expected: web + cms buildam sem erros.

- [ ] **Step 2: Checklist manual com `pnpm dev:cms` no ar (porta 3001)**

| # | Cenário | Esperado |
|---|---|---|
| 1 | `http://localhost:3001/` sem cookie | redirect para `/entrar` |
| 2 | Login com senha errada | faixa "E-mail ou senha incorretos.", continua em `/entrar` |
| 3 | Login correto (`contato@institutontc.com.br`) | entra no painel; rodapé da sidebar mostra nome/e-mail reais |
| 4 | Editar nome de evento + salvar | funciona como antes |
| 5 | Botão Sair | volta para `/entrar`; voltar para `/` redireciona de novo |
| 6 | `http://localhost:3001/entrar` logado | redireciona para `/` |
| 7 | `http://localhost:3001/admin` | admin Payload segue funcionando; login feito no Soberano vale no admin |
| 8 | Apagar o cookie no DevTools e clicar "Salvar" num evento | mensagem "Sessão expirada. Entre novamente." |
| 9 | `http://localhost:3000` (site) | home renderiza normal; `/prototipo-cms` agora dá 404 |

- [ ] **Step 3: Checkpoint visual (desktop 1440 + mobile 375)**

Comparar `/entrar` com o mockup B aprovado (`.superpowers/brainstorm/27384-1781121636/content/login-layout.html` no repo principal). **Deixar o servidor no ar e pedir aprovação do usuário** — não declarar pronto sem o OK visual dele.
