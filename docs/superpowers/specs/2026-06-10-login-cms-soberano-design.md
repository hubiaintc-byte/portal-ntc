# Login do CMS Soberano + mudança para apps/cms — Design

**Data:** 10/06/2026 · **Branch:** `feat/cms-soberana`

## Objetivo

Preparar o CMS Soberano (`/prototipo-cms`) para uso real: movê-lo do `apps/web`
para o `apps/cms` (antecipando a separação em dois projetos Vercel — site e
CMS) e protegê-lo com tela de login usando o Payload como motor de auth
(collection Users, JWT no cookie `payload-token`).

## Decisões tomadas

- **Acesso:** qualquer usuário válido da collection Users entra (sem mapa de
  perfis por enquanto — hoje há 1 super-admin em staging).
- **Escopo v1:** login + botão Sair + checkbox "Manter sessão iniciada".
  **Fora:** recuperação de senha, 2FA (Janela C), gestão de usuários.
- **Layout aprovado:** split institucional (opção B dos mockups) — painel
  Oxford à esquerda com assinatura da marca, formulário à direita sobre osso.
- **Rota:** CMS Soberano na **raiz `/`** do app cms (dev: `localhost:3001/`);
  login em `/entrar`. Admin do Payload continua em `/admin` como motor.
- **Sessão:** `tokenExpiration` dos Users sobe para 14 dias (era 2h, padrão).
  Checkbox desmarcado → cookie de sessão (morre ao fechar o navegador);
  marcado → cookie persistente de 14 dias. Trade-off aceito: tokens do admin
  Payload também valem 14 dias — revisitar quando a 2FA entrar.

## Fase 1 — Mover o CMS Soberano para apps/cms

| De (apps/web) | Para (apps/cms) |
|---|---|
| `app/(prototipo-cms)/prototipo-cms/*` (Shell, Telas, Detalhes, acoes.ts, page.tsx) | `src/app/(soberano)/` — `page.tsx` na raiz do grupo |
| `app/(prototipo-cms)/layout.tsx` | `src/app/(soberano)/layout.tsx` — **layout raiz** próprio (html/body), aplica fontes de `src/app/fonts.ts` (mesmas vars `--font-titulo`/`--font-corpo`) e importa o CSS |
| `app/prototipo-cms.css` | `src/app/(soberano)/prototipo-cms.css` (classes `pcms-` intactas) |
| `lib/cms/prototipoCms.ts`, `lib/cms/prototipoCmsEscrita.ts` | `src/lib/` do cms — `obterPayload` vira import local da config |
| `lib/cms/lexical.ts` (`lexicalToHtml`) | move junto se só o protótipo usa; senão, copia mínima no cms |

- A rota `/prototipo-cms` deixa de existir no `apps/web` (sem redirect — uso interno).
- Imports `@/...` reescritos para o alias do tsconfig do cms.
- Nada de schema/banco muda na Fase 1.

## Fase 2 — Autenticação

### Núcleo (`apps/cms/src/lib/autenticacaoCms.ts`, server-only)

- `obterUsuarioCms()` — lê `payload-token` via `cookies()`, valida com
  `payload.auth({ headers })`, retorna `{ id, nome, email, perfil } | null`.
- `exigirUsuarioCms()` — redirect para `/entrar` se nulo.
- `entrar(formData)` — Server Action: `payload.login({ collection: "users" })`;
  sucesso grava cookie httpOnly (`secure` em produção, `sameSite: "lax"`,
  `maxAge` 14d se "manter sessão", senão cookie de sessão) e redireciona
  para `/`; falha retorna erro genérico "E-mail ou senha incorretos".
- `sair()` — apaga o cookie e redireciona para `/entrar`.

### Pontos de proteção

1. **Página `/`** — `exigirUsuarioCms()` no topo; nome/e-mail reais do usuário
   descem ao `ShellCms` (substituem o "Equipe NTC" hardcoded do rodapé da
   sidebar).
2. **Página `/entrar`** — se já há sessão válida, redireciona para `/`.
3. **Toda Server Action** de `acoes.ts` (leitura de detalhe e escrita) começa
   com a guarda: usuário nulo → `{ ok: false, erro: "Sessão expirada. Entre
   novamente." }` sem executar. O `overrideAccess: true` interno de
   `prototipoCmsEscrita.ts` permanece, mas só é alcançável após a guarda.

### Tela de login (`/entrar`)

- `page.tsx` (Server Component) + `FormLogin.tsx` (Client Component) +
  classes `pcms-login-*` no CSS dedicado.
- **Esquerda (46%, Oxford `#0b2545`):** logo NTC da sidebar, assinatura
  "Inteligência institucional. *Impacto real.*" em Cormorant (itálico dourado),
  filete dourado, eyebrow "Portal Grupo NTC · CMS Soberano", rodapé
  "Instituto NTC do Brasil · 2026".
- **Direita (54%, osso `#FBF8F2`):** "Acesso restrito" (Cormorant Oxford),
  campos E-mail e Senha (labels uppercase Barlow), checkbox "Manter sessão
  iniciada", botão "Entrar" Oxford. Erro em faixa `--pcms-erro` acima do
  botão; estado de envio "Entrando…" com botão desabilitado.
- **Mobile ≤768px:** empilha — painel Oxford vira cabeçalho compacto.
- **A11y:** labels associados, `:focus` visível, landmark `<main>`,
  autocomplete `email`/`current-password`, border-radius 0.

### Botão Sair

No `pcms-sidebar__foot`, ao lado do bloco do usuário: botão "Sair" com ícone
linear peso 1.5 (padrão do shell), chama `sair()`.

### Ganhos de graça

- `maxLoginAttempts` default do Payload (5 tentativas → lockout) já cobre
  força bruta básica.
- Cookie compartilhado com o admin do Payload (mesmo host): uma sessão só.

## Erros e estados

- Banco indisponível no login → mesma faixa de erro, mensagem "Não foi
  possível entrar. Tente novamente." (sem vazar detalhe).
- Sessão expira no meio do uso → próxima action retorna "Sessão expirada";
  casco mostra a mensagem; recarregar leva ao `/entrar`.

## Verificação

1. `pnpm build` (monorepo) sem erros.
2. Manual com servidor no ar (aprovação do usuário, não screenshot):
   `localhost:3001/` sem sessão → redirect `/entrar`; senha errada → erro;
   login ok → painel com nome real; Sair → volta ao login; action sem cookie
   recusa; admin `/admin` continua funcionando.
3. Checkpoint visual desktop 1440 + mobile 375 contra o mockup B aprovado.
