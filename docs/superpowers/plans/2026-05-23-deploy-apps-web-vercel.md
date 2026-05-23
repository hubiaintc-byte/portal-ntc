# Primeiro Deploy do apps/web na Vercel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar o código do `apps/web` para o primeiro deploy manual no painel Vercel, em `https://institutontc.com.br`, com páginas portadas estáticas funcionando e formulários temporariamente retornando 503.

**Architecture:** O `apps/web` já tem todas as páginas v1 portadas como rotas estáticas (SSG/ISR), sem chamadas Payload em runtime para render. As 4 rotas `/api/forms/*` que dependem de Payload são "stubadas" para retornar 503 via um helper único. Favicon e metadata Open Graph são adicionados para o link compartilhável renderizar com identidade visual.

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript strict · pnpm workspaces · Turbo · Tailwind 4 · monorepo `apps/web` + `apps/cms` + `packages/{ui,lib,types}`.

**Spec:** `docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md`

---

## File Structure

**Files modificados:**
- `apps/web/app/api/forms/contato/route.ts` — substituir POST handler por stub 503
- `apps/web/app/api/forms/proposta/route.ts` — substituir POST handler por stub 503
- `apps/web/app/api/forms/candidatura-especialista/route.ts` — substituir POST handler por stub 503
- `apps/web/app/api/forms/newsletter/route.ts` — substituir POST handler por stub 503
- `apps/web/app/layout.tsx` — adicionar `openGraph` e `twitter` na `metadata`

**Files criados:**
- `apps/web/lib/respostaFormsOff.ts` — helper único que retorna 503 com mensagem padronizada
- `apps/web/app/icon.svg` — favicon (copiado de `apps/cms/public/favicon.svg`)
- `apps/web/public/og-default.jpg` — print 1200×630 da hero da home (capturado durante validação)

**Files preservados sem modificação (mas não importados em runtime):**
- `apps/web/lib/payloadClient.ts` — fica órfão até a reativação dos forms; remover seria mexer mais arquivos e dificultar reverter
- `apps/web/lib/respostaForm.ts` — pode ser usado por outros código no futuro

---

## Task 1: Criar helper `respostaFormsOff`

**Files:**
- Create: `apps/web/lib/respostaFormsOff.ts`

- [ ] **Step 1: Criar o helper**

Conteúdo do arquivo `apps/web/lib/respostaFormsOff.ts`:

```ts
import { NextResponse } from "next/server";

/**
 * Resposta padronizada para as 4 rotas `/api/forms/*` enquanto o
 * Payload/CMS não está implantado em produção (sessão de deploy
 * 2026-05-23). Mantém o contrato `FormularioResposta` consumido
 * pelo `<FormularioSoberano>` em @ntc/ui, mas com `ok: false`.
 *
 * Quando o CMS subir, deletar este helper e restaurar os handlers
 * originais que chamam `obterPayload()` (ver `lib/payloadClient.ts`).
 */
export function respostaFormsOff() {
  return NextResponse.json(
    {
      ok: false,
      message: "Formulários temporariamente indisponíveis. Em breve voltam ao ar.",
    },
    { status: 503 },
  );
}
```

- [ ] **Step 2: Confirmar que o arquivo foi escrito**

Run: `ls -la /Users/joao/Documents/portal-ntc/apps/web/lib/respostaFormsOff.ts`
Expected: arquivo listado, tamanho ~700-900 bytes.

- [ ] **Step 3: Type-check do pacote web**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS (sem erros). Se algum erro de tipo aparecer no arquivo novo, corrigir antes de seguir.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/lib/respostaFormsOff.ts
git commit -m "feat(forms): adiciona respostaFormsOff helper para stub 503"
```

---

## Task 2: Stubar rota `/api/forms/contato`

**Files:**
- Modify: `apps/web/app/api/forms/contato/route.ts` (substituir conteúdo inteiro)

- [ ] **Step 1: Substituir conteúdo do route handler**

Sobrescrever o arquivo `apps/web/app/api/forms/contato/route.ts` com:

```ts
import { respostaFormsOff } from "@/lib/respostaFormsOff";

/**
 * POST /api/forms/contato
 *
 * Endpoint stubado para o primeiro deploy (2026-05-23). O Payload/CMS
 * ainda não está implantado em produção; este handler retorna 503
 * com mensagem clara até a sessão de reativação dos formulários.
 *
 * Spec: docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md
 */
export function POST() {
  return respostaFormsOff();
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web lint`
Expected: PASS (zero warnings ESLint no arquivo). Se houver warning de import ordering, ajustar manualmente.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/api/forms/contato/route.ts
git commit -m "feat(deploy): stuba POST /api/forms/contato para retornar 503"
```

---

## Task 3: Stubar rota `/api/forms/proposta`

**Files:**
- Modify: `apps/web/app/api/forms/proposta/route.ts` (substituir conteúdo inteiro)

- [ ] **Step 1: Substituir conteúdo do route handler**

Sobrescrever o arquivo `apps/web/app/api/forms/proposta/route.ts` com:

```ts
import { respostaFormsOff } from "@/lib/respostaFormsOff";

/**
 * POST /api/forms/proposta
 *
 * Endpoint stubado para o primeiro deploy (2026-05-23). O Payload/CMS
 * ainda não está implantado em produção; este handler retorna 503
 * com mensagem clara até a sessão de reativação dos formulários.
 *
 * Spec: docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md
 */
export function POST() {
  return respostaFormsOff();
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/api/forms/proposta/route.ts
git commit -m "feat(deploy): stuba POST /api/forms/proposta para retornar 503"
```

---

## Task 4: Stubar rota `/api/forms/candidatura-especialista`

**Files:**
- Modify: `apps/web/app/api/forms/candidatura-especialista/route.ts` (substituir conteúdo inteiro)

- [ ] **Step 1: Substituir conteúdo do route handler**

Sobrescrever o arquivo `apps/web/app/api/forms/candidatura-especialista/route.ts` com:

```ts
import { respostaFormsOff } from "@/lib/respostaFormsOff";

/**
 * POST /api/forms/candidatura-especialista
 *
 * Endpoint stubado para o primeiro deploy (2026-05-23). O Payload/CMS
 * ainda não está implantado em produção; este handler retorna 503
 * com mensagem clara até a sessão de reativação dos formulários.
 *
 * Spec: docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md
 */
export function POST() {
  return respostaFormsOff();
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/api/forms/candidatura-especialista/route.ts
git commit -m "feat(deploy): stuba POST /api/forms/candidatura-especialista para 503"
```

---

## Task 5: Stubar rota `/api/forms/newsletter`

**Files:**
- Modify: `apps/web/app/api/forms/newsletter/route.ts` (substituir conteúdo inteiro)

- [ ] **Step 1: Substituir conteúdo do route handler**

Sobrescrever o arquivo `apps/web/app/api/forms/newsletter/route.ts` com:

```ts
import { respostaFormsOff } from "@/lib/respostaFormsOff";

/**
 * POST /api/forms/newsletter
 *
 * Endpoint stubado para o primeiro deploy (2026-05-23). O Payload/CMS
 * ainda não está implantado em produção; este handler retorna 503
 * com mensagem clara até a sessão de reativação dos formulários.
 *
 * Spec: docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md
 */
export function POST() {
  return respostaFormsOff();
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/api/forms/newsletter/route.ts
git commit -m "feat(deploy): stuba POST /api/forms/newsletter para retornar 503"
```

---

## Task 6: Adicionar favicon ao `apps/web`

**Files:**
- Create: `apps/web/app/icon.svg` (copiado de `apps/cms/public/favicon.svg`)

- [ ] **Step 1: Copiar o SVG**

Run:
```bash
cp /Users/joao/Documents/portal-ntc/apps/cms/public/favicon.svg /Users/joao/Documents/portal-ntc/apps/web/app/icon.svg
```

Expected: comando sai com código 0 (sem output).

- [ ] **Step 2: Confirmar arquivo presente**

Run: `ls -la /Users/joao/Documents/portal-ntc/apps/web/app/icon.svg`
Expected: arquivo listado, tamanho equivalente ao do `favicon.svg` original (~4-5 KB).

- [ ] **Step 3: Confirmar conteúdo idêntico**

Run: `diff /Users/joao/Documents/portal-ntc/apps/cms/public/favicon.svg /Users/joao/Documents/portal-ntc/apps/web/app/icon.svg`
Expected: sem output (arquivos idênticos).

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/icon.svg
git commit -m "feat(web): adiciona favicon (icon.svg) usando lockup do admin"
```

---

## Task 7: Adicionar metadata Open Graph + Twitter no `app/layout.tsx`

**Files:**
- Modify: `apps/web/app/layout.tsx` — substituir o export `metadata` (sem mexer em mais nada do arquivo)

- [ ] **Step 1: Localizar o bloco `metadata` atual**

O bloco atual está no `apps/web/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: {
    default: "Portal Grupo NTC",
    template: "%s · Grupo NTC",
  },
  description: "Inteligência institucional. Impacto real.",
  metadataBase: new URL(process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000"),
};
```

- [ ] **Step 2: Substituir pelo novo bloco com OG e Twitter**

Usar `Edit` para substituir EXATAMENTE o bloco acima por:

```ts
export const metadata: Metadata = {
  title: {
    default: "Portal Grupo NTC",
    template: "%s · Grupo NTC",
  },
  description: "Inteligência institucional. Impacto real.",
  metadataBase: new URL(process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Grupo NTC",
    locale: "pt_BR",
    url: "/",
    title: "Portal Grupo NTC · Inteligência institucional. Impacto real.",
    description:
      "O novo padrão da formação institucional para a Administração Pública brasileira.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Grupo NTC — Inteligência institucional. Impacto real.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Grupo NTC",
    description:
      "Inteligência institucional. Impacto real. Grupo NTC — formação para a Administração Pública brasileira.",
    images: ["/og-default.jpg"],
  },
};
```

- [ ] **Step 3: Type-check**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web typecheck`
Expected: PASS. (Se aparecer erro de tipo em `openGraph` ou `twitter`, verificar se `import type { Metadata } from "next"` está presente — ele já deveria estar.)

- [ ] **Step 4: Lint**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/app/layout.tsx
git commit -m "feat(web): adiciona metadata Open Graph e Twitter no layout raiz"
```

---

## Task 8: Validar build local replicando o comando do Vercel

**Files:** nenhum (validação de build sem mudanças)

- [ ] **Step 1: Limpar artefatos de build anteriores**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && rm -rf apps/web/.next apps/web/.turbo
```

Expected: comando sai com código 0.

- [ ] **Step 2: Sanity check do lockfile**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm install --frozen-lockfile`
Expected: instalação completa, "Done in Xs". Se quebrar com mismatch de lockfile, é um problema a resolver antes do deploy.

- [ ] **Step 3: Rodar o build idêntico ao do Vercel**

Run: `cd /Users/joao/Documents/portal-ntc && pnpm turbo run build --filter=@ntc/web...`
Expected: build verde de `@ntc/ui`, `@ntc/lib`, `@ntc/types` (workspace deps) e `@ntc/web`. Tabela final do Turbo com `Tasks: N successful, N total` e nada FAILED.

Se quebrar por causa do `@ntc/cms` (que é devDep e tem `payload`, `sharp`, `db-postgres`):
- Plano B: remover `"@ntc/cms": "workspace:*"` de `apps/web/package.json` → `devDependencies`, deletar `apps/web/lib/payloadClient.ts`, rodar `pnpm install --frozen-lockfile=false`, commitar com `chore(deploy): remove devDep @ntc/cms do apps/web para deploy v1`.
- Aplicar o Plano B somente se este step quebrar.

- [ ] **Step 4: Confirmar que `.next` foi gerado**

Run: `ls /Users/joao/Documents/portal-ntc/apps/web/.next/`
Expected: pasta com `build-manifest.json`, `server/`, `static/`, etc.

---

## Task 9: Subir servidor preview e capturar OG image (com validação humana)

**Files:**
- Create: `apps/web/public/og-default.jpg` (captura manual de tela)

- [ ] **Step 1: Subir o preview**

Run em background:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web preview
```

Expected: log "▲ Next.js 15.1.3" + "- Local: http://localhost:3000". Servidor fica no ar.

- [ ] **Step 2: Abrir a home no browser**

Abrir `http://localhost:3000/` no navegador. Confirmar que:
- O slider hero da home v3 renderiza
- O favicon (lockup NTC tricolor) aparece na aba do browser
- Não há erro 5xx visível

Se algo estiver quebrado visualmente, parar e investigar antes de seguir. CLAUDE.md §6 (Checkpoints visuais obrigatórios) aplica aqui.

- [ ] **Step 3: Capturar OG image (humano executa)**

**Esta captura precisa de validação humana antes de seguir (memória do projeto: validação visual é humana, não automatizada).**

Instruções para o humano (pedir aprovação no chat):
1. Abrir DevTools → Toggle Device Toolbar → Responsive Mode
2. Setar viewport exato em **1200 × 630** pixels
3. Recarregar a página para o slider hero acomodar nesse viewport
4. Aguardar o primeiro slide ficar estável (alguns segundos)
5. Capturar screenshot do viewport (Cmd+Shift+P → "Capture screenshot" no DevTools, OU print do sistema com região 1200×630)
6. Salvar como `apps/web/public/og-default.jpg` (JPG; qualidade ~85%)

Pausar a execução e pedir confirmação do humano:

> "Servidor preview está em http://localhost:3000. Por favor:
> 1. Capture um screenshot da hero da home no viewport 1200×630
> 2. Salve em `apps/web/public/og-default.jpg`
> 3. Confirme aqui quando estiver pronto, e me diga se aprova visualmente o frame capturado."

Aguardar resposta humana antes de seguir para o Step 4.

- [ ] **Step 4: Confirmar OG image presente e válida**

Run: `ls -la /Users/joao/Documents/portal-ntc/apps/web/public/og-default.jpg && file /Users/joao/Documents/portal-ntc/apps/web/public/og-default.jpg`
Expected: arquivo listado; `file` reporta "JPEG image data" + dimensão "1200x630".

Se a dimensão não bater com 1200×630, pedir ao humano para refazer a captura.

- [ ] **Step 5: Derrubar o servidor preview**

Encerrar o processo de preview (Ctrl+C no terminal onde foi lançado, OU `kill` no PID se rodou em background).

- [ ] **Step 6: Commit**

```bash
cd /Users/joao/Documents/portal-ntc
git add apps/web/public/og-default.jpg
git commit -m "feat(web): adiciona og-default.jpg (print da hero da home 1200x630)"
```

---

## Task 10: Smoke test final pós-build

**Files:** nenhum (validação)

- [ ] **Step 1: Subir o preview novamente para validar tudo junto**

Run em background:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm --filter=@ntc/web preview
```

Expected: servidor no ar em `http://localhost:3000`.

- [ ] **Step 2: Validar páginas principais retornam 200**

Run, com o servidor no ar:
```bash
for path in / /o-grupo /o-grupo/corpo-docente /solucoes-estrategicas/educacao /solucoes-estrategicas/gestao-publica /solucoes-estrategicas/saude /programas/lidera /politica-de-privacidade /termos-de-uso /politica-de-cookies /lgpd /mapa-do-site /contato; do
  echo -n "$path → "
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path"
done
```

Expected: todas as rotas retornam `200`. Se alguma retornar 5xx, parar e investigar.

- [ ] **Step 3: Validar que `/api/forms/*` retornam 503**

Run:
```bash
for endpoint in contato proposta candidatura-especialista newsletter; do
  echo -n "/api/forms/$endpoint → "
  curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{}' "http://localhost:3000/api/forms/$endpoint"
done
```

Expected: as 4 rotas retornam `503`.

- [ ] **Step 4: Confirmar body do 503 com mensagem amigável**

Run:
```bash
curl -s -X POST -H "Content-Type: application/json" -d '{}' http://localhost:3000/api/forms/contato
```

Expected: JSON `{"ok":false,"message":"Formulários temporariamente indisponíveis. Em breve voltam ao ar."}`.

- [ ] **Step 5: Confirmar meta tags OG no view-source da home**

Run:
```bash
curl -s http://localhost:3000/ | grep -E 'og:(title|description|image|url|type)|twitter:card' | head -20
```

Expected: linhas contendo `og:title`, `og:description`, `og:image` (apontando para `og-default.jpg`), `og:url`, `og:type`, `twitter:card`.

- [ ] **Step 6: Confirmar favicon servido**

Run:
```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/icon.svg
```

Expected: `200 image/svg+xml` (ou similar). Next pode também servir em `/icon` sem extensão — se 404 em `/icon.svg`, testar `/icon`.

- [ ] **Step 7: Derrubar o preview**

Encerrar o processo (Ctrl+C ou kill).

- [ ] **Step 8: Aprovação humana final**

Pausar e pedir aprovação:

> "Smoke test local passou: 12 páginas em 200, 4 endpoints de form em 503, meta tags OG presentes, favicon servido. Pronto para você fazer o deploy manual no painel da Vercel. Quer revisar algo antes?"

Aguardar resposta humana.

---

## Task 11: Push para origin/main

**Files:** nenhum (operação git)

- [ ] **Step 1: Conferir branch e commits ahead**

Run: `cd /Users/joao/Documents/portal-ntc && git status && git log --oneline origin/main..HEAD`
Expected: branch `main`, vários commits ahead de origin (commits novos das tasks 1-9 + os 3 commits que já estavam ahead antes da sessão).

- [ ] **Step 2: Pedir confirmação humana antes do push**

> "Estes commits vão para `origin/main`:
> [listar commits]
> Posso fazer `git push origin main`?"

Aguardar resposta humana. **Não fazer push sem confirmação** (ação visível externamente, blast radius médio).

- [ ] **Step 3: Push**

Após confirmação:

```bash
cd /Users/joao/Documents/portal-ntc && git push origin main
```

Expected: push aceito, "Branch 'main' set up to track 'origin/main'." ou "Updating XXX..YYY".

---

## Task 12: Checklist de deploy manual no painel Vercel (humano executa)

**Files:** nenhum (operação no painel Vercel; Claude não tem CLI)

Esta task **não é executada pelo Claude** — é o checklist que o humano segue no painel da Vercel após o código estar no GitHub. Claude apenas confirma cada step quando o humano reportar.

- [ ] **Step 1: Project Settings → General**

Aplicar no painel Vercel:
- Framework Preset: **Next.js**
- Root Directory: `apps/web`
- Node.js Version: **22.x**

- [ ] **Step 2: Project Settings → Build & Development Settings**

- Install Command: `cd ../.. && pnpm install --frozen-lockfile`
- Build Command: `cd ../.. && pnpm turbo run build --filter=@ntc/web...`
- Output Directory: `.next` (default)

- [ ] **Step 3: Environment Variables**

Adicionar em scope **Production**:
- `PAYLOAD_PUBLIC_FRONT_URL` = `https://institutontc.com.br`

- [ ] **Step 4: Trigger primeiro deploy**

Deployments → Redeploy (no commit mais recente de main) ou aguardar deploy automático do push (Task 11).
Expected: build verde no painel; URL provisória `<projeto>.vercel.app` acessível.

- [ ] **Step 5: Smoke test na URL provisória**

Repetir o checklist da Task 10 (steps 2, 3, 4, 5, 6) usando a URL `*.vercel.app` no lugar de `localhost:3000`.

Se algum step falhar, parar e investigar antes de mexer com domínio.

- [ ] **Step 6: Project Settings → Domains**

- Adicionar `institutontc.com.br` como **Primary Domain**
- Adicionar `www.institutontc.com.br` com **Redirect to** `institutontc.com.br` (308)

Painel mostra os registros DNS necessários — anotar.

- [ ] **Step 7: Configurar DNS no registrar do domínio**

No painel do registrar (Registro.br ou onde estiver hospedado o `institutontc.com.br`):
- Apex (`@` ou vazio): `A` record para o IP que o Vercel indicou (geralmente `76.76.21.21`)
- `www`: `CNAME` para `cname.vercel-dns.com`

OU, alternativamente, delegar os nameservers do domínio para `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.

- [ ] **Step 8: Aguardar propagação + SSL**

Vercel emite Let's Encrypt automaticamente após o DNS propagar. Propagação típica: <10 min, pode levar até 4h.

Validar:
```bash
curl -sI https://institutontc.com.br | head -5
```

Expected: `HTTP/2 200`, header `server` indicando Vercel, cadeado de SSL no browser.

- [ ] **Step 9: Smoke test final no domínio**

Repetir o checklist da Task 10 (steps 2-6) usando `https://institutontc.com.br`.

- [ ] **Step 10: Resumo da sessão**

Confirmar critérios de sucesso do spec (`docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md` → seção "Critério de sucesso"):
- [ ] Home v3 retorna 200
- [ ] Páginas portadas todas 200
- [ ] Favicon na aba do browser
- [ ] `curl -sI` confirma servidor Vercel
- [ ] view-source mostra `og:image`, `og:title`, `og:url` apontando para `https://institutontc.com.br/og-default.jpg`
- [ ] SSL Let's Encrypt válido
- [ ] `/api/forms/*` retornam 503 com mensagem

---

## Notas finais

**Follow-ups (não fazer hoje):**
1. Reativar `/api/forms/*` quando o CMS subir — remover stub, restaurar handlers originais
2. Habilitar RLS no Supabase nas 75 tabelas em `public.*` antes de qualquer uso da `ANON_KEY` no client
3. Substituir `og-default.jpg` por arte institucional oficial 1200×630 quando a equipe editorial entregar
4. Migrar Vercel para tier Pro antes do go-live formal (DAB §17 item 2)
5. Subir `apps/cms` em sessão própria, com 2FA do admin (DAB §17 item 8)
6. Decidir destino do domínio `gruponctc.org.br` mencionado no CLAUDE.md §17 item 1

**Plano B (se Task 8 quebrar por causa do `@ntc/cms` no install):**
- Remover `"@ntc/cms": "workspace:*"` do `apps/web/package.json` (em `devDependencies`)
- Deletar `apps/web/lib/payloadClient.ts`
- Rodar `pnpm install` para regenerar lockfile
- Commit: `chore(deploy): remove devDep @ntc/cms do apps/web para deploy v1`
- Re-rodar Task 8 do começo

**Reversão (se precisar reverter este deploy):**
- `git revert <hash>` dos commits das tasks 1-7 reverte forms para o estado original
- `og-default.jpg` e `icon.svg` podem ficar (não causam regressão)
- Limpar env var `PAYLOAD_PUBLIC_FRONT_URL` no Vercel se quiser que o `metadataBase` volte ao default localhost
