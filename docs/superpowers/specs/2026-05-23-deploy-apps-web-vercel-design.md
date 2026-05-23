---
data: 2026-05-23
topico: primeiro deploy do apps/web na Vercel
status: aprovado pelo usuário (brainstorming)
escopo: apps/web (Next.js 15) — apps/cms fica de fora desta sessão
---

# Spec — Primeiro deploy do `apps/web` na Vercel

## Objetivo

Subir o `apps/web` no domínio `institutontc.com.br` hoje, servindo as
páginas portadas (home, /o-grupo, /o-grupo/corpo-docente, verticais,
programas, 5 institucionais, /contato). O `apps/cms` **não** sobe nesta
sessão. Formulários ficam desligados temporariamente (retornam 503).

## Contexto da decisão

- O `apps/web` já tem 100% das páginas v1 portadas como **estáticas com
  `revalidate`**. Conteúdo vem de `conteudoFallback.ts` /
  `conteudoXxx.ts`, não do Payload — então o deploy funciona sem banco.
- As 4 rotas `/api/forms/*` (`contato`, `proposta`,
  `candidatura-especialista`, `newsletter`) são as únicas dependências
  de Payload em runtime. Sem elas funcionando, o deploy não precisa de
  Postgres nem das credenciais Supabase.
- O `next.config.ts` já marca `payload`, `@payloadcms/db-postgres`,
  `@payloadcms/next` e `sharp` como `serverExternalPackages` — esses
  módulos ficam fora do bundle webpack e são resolvidos via `require()`
  no runtime Node.
- O banco de staging (`portal-ntc-staging`, ref `irekejunwknguzdfszyi`)
  já tem o schema Payload completo (75 tabelas, incluindo `leads` com 1
  linha de teste). Não há migration nem seed pendente para este deploy.
- Deploy operado manualmente via **painel da Vercel** (sem CLI). Claude
  prepara o código; usuário configura o painel.

## Decisões fechadas no brainstorming

| Item | Decisão |
|---|---|
| Domínio canonical | `institutontc.com.br` (apex). `www.institutontc.com.br` → 308 redirect para apex. |
| Tier Vercel | Free (hoje). DAB §17 item 2 prevê Pro antes do go-live formal. |
| Env vars no Vercel | Apenas `PAYLOAD_PUBLIC_FRONT_URL=https://institutontc.com.br` (Production scope). |
| Forms | `/api/forms/*` retornam 503 com mensagem "Formulários temporariamente indisponíveis. Em breve.". |
| Favicon | Copiar `apps/cms/public/favicon.svg` → `apps/web/app/icon.svg` (convenção Next). |
| OG image | Print da hero da home com viewport 1200×630, salvo em `apps/web/public/og-default.jpg`. Validação humana antes de commitar. |
| Deploy | Manual via painel Vercel (usuário). Claude entrega código pronto + checklist de configuração do painel. |

## Arquitetura do build no Vercel

Settings que o usuário aplica no painel:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command:** `cd ../.. && pnpm turbo run build --filter=@ntc/web...`
- **Output Directory:** `.next` (default)
- **Node version:** 22.x (`engines` da raiz já fixa)
- **Environment Variables (Production):**
  - `PAYLOAD_PUBLIC_FRONT_URL` = `https://institutontc.com.br`

O `...` no filtro do Turbo força build das dependências de workspace
(`@ntc/ui`, `@ntc/lib`, `@ntc/types`) antes do web. O `@ntc/cms` é
devDep do web e o `pnpm install` vai resolvê-lo no Vercel, mas como
nenhum código em runtime importa o `payload.config`, ele não infla o
bundle final — só o tempo de install.

## Páginas que sobem

Todas portadas, todas estáticas (SSG/ISR), zero chamada Payload em
runtime:

- `/` (home v3)
- `/o-grupo`
- `/o-grupo/corpo-docente`
- `/solucoes-estrategicas/[area]` (educacao, gestao-publica, saude)
- `/programas/[slug]` (15 programas)
- `/politica-de-privacidade`
- `/termos-de-uso`
- `/politica-de-cookies`
- `/lgpd`
- `/mapa-do-site`
- `/contato` (formulários **renderizam**, mas o submit retorna 503)

## Mudanças no código

### 1. Stub das rotas `/api/forms/*`

Criar `apps/web/lib/respostaFormsOff.ts`:

```ts
export function respostaFormsOff(): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      erro:
        "Formulários temporariamente indisponíveis. Em breve voltam ao ar.",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

Em cada uma das 4 rotas (`apps/web/app/api/forms/contato/route.ts`,
`.../proposta/route.ts`, `.../candidatura-especialista/route.ts`,
`.../newsletter/route.ts`):

- Remover todos os imports exceto o de `respostaFormsOff`
- Substituir o corpo do `POST` por `return respostaFormsOff();`

`apps/web/lib/payloadClient.ts` permanece no projeto **sem ser
importado por ninguém** — fica como ponto de reativação futuro.

### 2. Favicon

```
cp apps/cms/public/favicon.svg apps/web/app/icon.svg
```

O Next 15 detecta `app/icon.svg` e emite `<link rel="icon">`
automaticamente. Sem alteração de `app/layout.tsx` necessária para isso.

### 3. OG image + metadata

a) Capturar print da hero da home em viewport 1200×630 px e salvar em
   `apps/web/public/og-default.jpg`. Procedimento (no Bloco B de
   validação local):
   - `pnpm dev:web`
   - Abrir `http://localhost:3000/` com viewport 1200×630 (DevTools →
     Responsive Mode)
   - Capturar screenshot do viewport, salvar como JPG
   - **Usuário valida visualmente** antes de seguir (memória: validação
     visual é humana)

b) Atualizar `apps/web/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: {
    default: "Portal Grupo NTC",
    template: "%s · Grupo NTC",
  },
  description: "Inteligência institucional. Impacto real.",
  metadataBase: new URL(
    process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000"
  ),
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

## Validação local (antes do deploy)

Replicar exatamente o que o Vercel vai rodar:

```bash
pnpm install --frozen-lockfile
pnpm turbo run build --filter=@ntc/web...
pnpm --filter=@ntc/web preview
```

Navegar no browser local em `http://localhost:3000` e validar:

- Home renderiza com slider hero
- `/o-grupo` e `/o-grupo/corpo-docente` renderizam
- Pelo menos 1 `/programas/[slug]` (ex.: `/programas/lidera`) renderiza
- Pelo menos 1 `/solucoes-estrategicas/[area]` (ex.:
  `/solucoes-estrategicas/educacao`) renderiza
- 5 institucionais renderizam
- `/contato` renderiza; submit do form mostra mensagem de
  "temporariamente indisponível" (503 no Network do DevTools)
- Favicon aparece na aba do browser
- `view-source` da home mostra meta tags `og:image`, `og:title`,
  `twitter:card`

Se o build local quebrar, **investigar antes de prosseguir**. Não
suprimir warnings nem usar `--no-verify`.

## Fluxo no painel Vercel (executado pelo usuário)

1. Logar no painel `vercel.com`
2. Project Settings → Build & Development Settings → aplicar as
   configurações acima (Root, Install Command, Build Command, Node 22)
3. Project Settings → Environment Variables → adicionar
   `PAYLOAD_PUBLIC_FRONT_URL=https://institutontc.com.br` (Production)
4. Deployments → Redeploy (ou push para `main` se houver integração
   GitHub)
5. Aguardar build verde. Abrir URL provisória `*.vercel.app` e re-fazer
   o smoke test do checklist de validação local
6. Project Settings → Domains:
   - Adicionar `institutontc.com.br` (apex) como **primário**
   - Adicionar `www.institutontc.com.br` configurado para redirect 308
     → apex
   - Vercel mostra registros DNS necessários
7. No registrar do domínio (Registro.br ou onde estiver):
   - Apex: `A` record para o IP que o Vercel indicar (geralmente
     `76.76.21.21`)
   - www: `CNAME` para `cname.vercel-dns.com`
   - **OU** delegar nameservers para Vercel (mais simples)
8. Aguardar propagação DNS + emissão Let's Encrypt (Vercel automatiza)
9. Validar `https://institutontc.com.br` com SSL ✓

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Build do Vercel quebra por causa do workspace pnpm | Bloco B de validação local replica exatamente o comando do Vercel |
| `@ntc/cms` (devDep) infla o install no Vercel além do aceitável | Plano B: remover `@ntc/cms` do `devDependencies` do `apps/web/package.json` e deletar `lib/payloadClient.ts`. Documentado como contingência. |
| OG image renderiza com proporção errada | Captura manual com viewport 1200×630 + validação humana antes de commitar |
| DNS demora a propagar | URL provisória `*.vercel.app` já valida tudo; domínio é trabalho paralelo |
| Forms aparentando funcionar e quebrando no submit | 503 retorna JSON claro; comportamento intencional v1 documentado neste spec |
| Falta de imagens em `public/` referenciadas pelas páginas | Bloco B de validação local detecta antes do deploy |

## Follow-ups (registrar; não fazer hoje)

1. **Reativar `/api/forms/*`** — quando o CMS estiver pronto. Decidir
   se mantém `@ntc/cms` como devDep do web ou se passa a usar o
   `@supabase/supabase-js` direto via service-role para gravar em
   `public.leads`.
2. **Habilitar RLS no Supabase** — 75 tabelas em `public.*` estão hoje
   sem Row Level Security. PII de leads (nome, email, telefone) não
   protegidos se a `ANON_KEY` for exposta no client. Habilitar com
   políticas adequadas antes de qualquer uso da API Supabase no client.
3. **OG image oficial** — substituir o print da hero por arte
   institucional 1200×630 (lockup + tagline em fundo Oxford `#11365E`)
   produzida pela equipe editorial.
4. **Tier Pro Vercel** — antes do go-live formal (DAB §17 item 2).
5. **Subir `apps/cms`** — deploy separado, em sessão própria, com 2FA
   do admin (DAB §17 item 8) e env vars completas de Supabase + Resend.
6. **`gruponctc.org.br`** — se o domínio do Grupo NTC for registrado
   futuramente, decidir se vira o canonical (com `institutontc.com.br`
   redirecionando) ou se vive em paralelo. CLAUDE.md §17 item 1 ainda
   menciona `gruponctc.org.br`.

## Critério de sucesso

Deploy está concluído quando:

- `https://institutontc.com.br` retorna 200 com a home v3 renderizada
- Páginas portadas (home, /o-grupo, /o-grupo/corpo-docente,
  /solucoes-estrategicas/[area] × 3, /programas/[slug] × 15, 5
  institucionais, /contato) retornam 200
- Favicon aparece na aba
- `curl -sI https://institutontc.com.br | grep -i 'content-type\|server'`
  confirma servidor Vercel e content-type text/html
- `view-source` mostra meta tags `og:image`, `og:title`, `og:url`
  apontando para `https://institutontc.com.br/og-default.jpg`
- SSL Let's Encrypt válido (cadeado no browser)
- Submit em qualquer `/api/forms/*` retorna 503 com mensagem clara
