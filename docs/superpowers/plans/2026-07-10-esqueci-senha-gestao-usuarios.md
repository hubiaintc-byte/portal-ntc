# Esqueci a senha + Gestão de usuários — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recuperação de senha por e-mail no `/entrar`, tela de gestão de usuários (super-admin), troca da própria senha e notificação de lead — tudo via Resend.

**Architecture:** Adapter oficial `@payloadcms/email-resend` no `payload.config` (fallback console sem chave). Fluxos de token usam `payload.forgotPassword`/`resetPassword` nativos. Tela Usuários segue o padrão das demais telas do painel (Server Actions + Local API, guarda server-side). Notificação de lead via REST do Resend direto em `packages/lib` (sem acoplar o pacote ao Payload).

**Tech Stack:** Payload 3.18 / Next 15 / Vitest / Resend.

## Global Constraints

- TS strict, sem `any`; tsconfig com `noUncheckedIndexedAccess` (usar acesso seguro).
- Dependência nova única: `@payloadcms/email-resend@3.18.0` (spec, decisão 3).
- Resposta do "esqueci a senha" SEMPRE genérica (sem enumeração de usuários).
- Toda Server Action de usuários valida sessão + `perfil === "super-admin"` server-side.
- Senha nova: mínimo 12 caracteres + confirmação igual.
- Sem `RESEND_API_KEY`, tudo degrada para log no console (dev testável).
- Remetente/destino via envs: `EMAIL_REMETENTE` (default `Painel NTC <nao-responda@institutontc.com.br>`), `LEADS_EMAIL_DESTINO` (default `contato@institutontc.com.br`).
- Spec: `docs/superpowers/specs/2026-07-10-esqueci-senha-gestao-usuarios-design.md`.

---

### Task 1: Adapter Resend + envs

**Files:**
- Modify: `apps/cms/package.json` (dep `@payloadcms/email-resend@3.18.0`)
- Modify: `apps/cms/src/payload.config.ts` (bloco `email:` condicional)
- Modify: `.env.example` (3 envs novas)

**Interfaces:**
- Produces: e-mail ativo no Payload quando `RESEND_API_KEY` presente; helper `remetentePadrao()` não é necessário — adapter recebe from/nome parseados da env.

- [ ] **Step 1:** `pnpm --filter @ntc/cms add @payloadcms/email-resend@3.18.0`.
- [ ] **Step 2:** No `payload.config.ts`:

```ts
import { resendAdapter } from "@payloadcms/email-resend";

// EMAIL_REMETENTE: 'Nome <email@dominio>' — parse simples.
const remetente = process.env.EMAIL_REMETENTE ?? "Painel NTC <nao-responda@institutontc.com.br>";
const mRemetente = remetente.match(/^(.*)<([^>]+)>\s*$/);

export default buildConfig({
  // ... config existente ...
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: mRemetente?.[2]?.trim() ?? remetente,
          defaultFromName: mRemetente?.[1]?.trim() ?? "Painel NTC",
        }),
      }
    : {}),
});
```

- [ ] **Step 3:** `.env.example`: adicionar `RESEND_API_KEY=`, `EMAIL_REMETENTE="Painel NTC <nao-responda@institutontc.com.br>"`, `LEADS_EMAIL_DESTINO=contato@institutontc.com.br`.
- [ ] **Step 4:** `pnpm --filter @ntc/cms typecheck` limpo (sem chave, config idêntica). Commit: `feat(cms): adapter Resend condicional no payload.config`.

---

### Task 2: Templates de e-mail + config forgotPassword na coleção Users

**Files:**
- Create: `apps/cms/src/lib/emailsCms.ts`
- Test: `apps/cms/src/lib/emailsCms.test.ts`
- Modify: `apps/cms/src/collections/Users.ts` (`auth.forgotPassword`)

**Interfaces:**
- Produces:

```ts
export function urlRedefinir(token: string, novoUsuario?: boolean): string
// `${PAYLOAD_PUBLIC_SERVER_URL}/entrar/redefinir?token=…` (+ `&novo=1`)
export function emailRecuperacaoHtml(args: { nome: string; token: string }): string
export function emailBoasVindasHtml(args: { nome: string; token: string }): string
export function emailLeadHtml(args: { tipo: string; nome: string; email: string; instituicao?: string }): string
// Todos: HTML inline simples (tabela, Oxford #11365E), texto PT, link absoluto.
```

- [ ] **Step 1:** Teste: `urlRedefinir("abc")` contém `/entrar/redefinir?token=abc`; com `novoUsuario` contém `&novo=1`; `emailRecuperacaoHtml` contém o link e o nome; `emailBoasVindasHtml` contém "definir sua senha"; `emailLeadHtml` contém tipo/nome/email.
- [ ] **Step 2:** RED → implementar → GREEN.
- [ ] **Step 3:** `Users.ts`:

```ts
auth: {
  tokenExpiration: 60 * 60 * 24 * 14,
  forgotPassword: {
    // 24h — cobre reset e boas-vindas (validade única por coleção; spec §3).
    expiration: 1000 * 60 * 60 * 24,
    generateEmailSubject: () => "Redefinição de senha — Painel Admin NTC",
    generateEmailHTML: (args) =>
      emailRecuperacaoHtml({
        nome: (args?.user as { nome?: string })?.nome ?? "",
        token: args?.token ?? "",
      }),
  },
},
```

- [ ] **Step 4:** typecheck + testes GREEN. Commit: `feat(cms): templates de e-mail PT e forgotPassword customizado em Users`.

---

### Task 3: Páginas /entrar/recuperar e /entrar/redefinir

**Files:**
- Create: `apps/cms/src/app/(painel)/entrar/recuperar/page.tsx` (+ client form)
- Create: `apps/cms/src/app/(painel)/entrar/redefinir/page.tsx` (+ client form)
- Create: `apps/cms/src/lib/validarNovaSenha.ts`
- Test: `apps/cms/src/lib/validarNovaSenha.test.ts`
- Modify: `apps/cms/src/app/(painel)/acoesAuth.ts` (2 actions novas)
- Modify: `apps/cms/src/app/(painel)/entrar/page.tsx` (link "Esqueci minha senha")

**Interfaces:**
- Produces:

```ts
// validarNovaSenha.ts (puro, testável)
export function validarNovaSenha(senha: string, confirmacao: string): string | null
// null = ok; senão mensagem PT ("mínimo 12 caracteres" / "senhas não conferem")

// acoesAuth.ts
export async function solicitarRecuperacao(_a: EstadoLogin | null, fd: FormData): Promise<EstadoLogin>
// SEMPRE { ok: "Se o e-mail estiver cadastrado, você receberá o link em instantes." } — erros só no console
export async function redefinirSenha(_a: EstadoLogin | null, fd: FormData): Promise<EstadoLogin>
// lê token/senha/confirmacao; validarNovaSenha; payload.resetPassword; grava cookie (mesmos flags do entrar); redirect("/")
```

(`EstadoLogin` ganha campo opcional `ok?: string`.)

- [ ] **Step 1:** Teste `validarNovaSenha`: curta ⇒ mensagem; divergente ⇒ mensagem; válida ⇒ null. RED → implementar → GREEN.
- [ ] **Step 2:** Actions: `solicitarRecuperacao` chama `payload.forgotPassword({ collection: "users", data: { email }, req: undefined })` em try/catch (catch: `console.error`), retorna sempre a mensagem genérica. `redefinirSenha` chama `payload.resetPassword({ collection: "users", data: { token, password }, overrideAccess: true })`; token inválido ⇒ `{ erro: "Link inválido ou expirado. Solicite um novo." }`; sucesso grava `payload-token` (httpOnly/lax/secure em prod, cookie de sessão) e `redirect("/")`.
- [ ] **Step 3:** Páginas com o mesmo visual/classes do `/entrar` existente (copiar estrutura do form de login): recuperar = campo e-mail + botão "Enviar link"; redefinir = 2 campos password + botão; `?novo=1` troca título para "Bem-vindo(a) — defina sua senha". Labels associados (WCAG §10). Link no `/entrar` abaixo do botão.
- [ ] **Step 4:** typecheck + `pnpm --filter @ntc/cms build` OK. Commit: `feat(cms): fluxo esqueci minha senha no /entrar`.

---

### Task 4: Server layer da gestão de usuários

**Files:**
- Create: `apps/cms/src/lib/cms/painelCmsUsuarios.ts`
- Test: `apps/cms/src/lib/cms/painelCmsUsuarios.test.ts`
- Modify: `apps/cms/src/lib/cms/autenticacao.ts` (`exigirSuperAdmin`)
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (actions de usuários)

**Interfaces:**
- Produces:

```ts
// painelCmsUsuarios.ts — núcleo testável recebe a superfície mínima mockável
export interface UsuarioCmsResumo { id: string; nome: string; email: string; perfil: string; atualizadoEm: string }
export interface PayloadUsuarios {
  find(args: { collection: "users"; limit: number; depth: 0; sort: string; overrideAccess: true }): Promise<{ docs: { id: string | number; nome: string; email: string; perfil: string; updatedAt: string }[] }>;
  create(args: { collection: "users"; data: Record<string, unknown>; overrideAccess: true }): Promise<{ id: string | number }>;
  update(args: { collection: "users"; id: string | number; data: Record<string, unknown>; overrideAccess: true }): Promise<unknown>;
  delete(args: { collection: "users"; id: string | number; overrideAccess: true }): Promise<unknown>;
  forgotPassword(args: { collection: "users"; data: { email: string }; disableEmail: true }): Promise<string | null | undefined>;
  sendEmail(args: { to: string; subject: string; html: string }): Promise<unknown>;
}
export function gerarSenhaAleatoria(): string  // 24 chars, [A-Za-z0-9!@#$%], crypto.randomInt
export async function listarUsuarios(p: PayloadUsuarios): Promise<UsuarioCmsResumo[]>
export async function criarUsuario(p: PayloadUsuarios, dados: { nome: string; email: string; perfil: string }): Promise<ResultadoEscrita>
// create c/ gerarSenhaAleatoria() → forgotPassword(disableEmail) → sendEmail(emailBoasVindasHtml). E-mail duplicado ⇒ erro claro. Falha SÓ no sendEmail ⇒ ok com aviso no erro? NÃO: ok:true e console.error (usuário existe; admin pode reenviar depois via "esqueci a senha").
export async function editarUsuario(p: PayloadUsuarios, id: string, dados: { nome: string; perfil: string }): Promise<ResultadoEscrita>
export async function removerUsuario(p: PayloadUsuarios, id: string, idSolicitante: string): Promise<ResultadoEscrita>
// bloqueia id === idSolicitante ("você não pode remover a si mesmo") e último super-admin (find + contagem de perfil==="super-admin")

// autenticacao.ts
export async function exigirSuperAdmin(): Promise<UsuarioCms>  // obterUsuarioCms + perfil !== "super-admin" ⇒ redirect("/")
```

- Actions em `acoes.ts` (todas com `exigirSuperAdmin` — exceto nenhuma): `carregarUsuarios()`, `criarUsuarioCms(dados)`, `editarUsuarioCms(id, dados)`, `removerUsuarioCms(id)` — cada uma monta o `PayloadUsuarios` real via `obterPayload()` (adapter com lambdas, mesmo padrão do `casarOuCriarPalestrantes`) e devolve `{ resultado, usuarios }` relistados.

- [ ] **Step 1:** Testes com mock (padrão do `casarOuCriarPalestrantes.test.ts`): senha aleatória tem 24 chars e varia entre chamadas; `criarUsuario` chama create com `perfil` e senha, depois forgotPassword `disableEmail: true`, depois sendEmail com HTML contendo o token; e-mail duplicado (create lança com mensagem contendo "email") ⇒ erro "Já existe usuário com este e-mail."; `removerUsuario` bloqueia self e último super-admin; `editarUsuario` atualiza nome/perfil.
- [ ] **Step 2:** RED → implementar → GREEN.
- [ ] **Step 3:** `exigirSuperAdmin` + actions em `acoes.ts`. typecheck limpo.
- [ ] **Step 4:** Commit: `feat(cms): camada de gestão de usuários com convite por e-mail`.

---

### Task 5: TelaUsuarios + sidebar

**Files:**
- Create: `apps/cms/src/app/(painel)/TelaUsuarios.tsx`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx` (TelaId + NAV_SISTEMA + render + prop perfil)
- Modify: `apps/cms/src/app/(painel)/page.tsx` (carregar usuários iniciais se super-admin)
- Modify: `apps/cms/src/app/(painel)/painel.css` (reuso máximo; adicionar só o que faltar)

**Interfaces:**
- Consumes: actions da Task 4; `UsuarioCmsResumo`.
- Produces: `<TelaUsuarios usuarios={UsuarioCmsResumo[]} usuarioAtualId={string} />` — client component autossuficiente (estado local + transitions chamando as actions).

- [ ] **Step 1:** `ShellCms`: `TelaId` ganha `"usuarios"`; `NAV_SISTEMA` ganha `{ id: "usuarios", rotulo: "Usuários", icone: Ico.usuarios }` (ícone linear de pessoas, peso 1.5) filtrado por `usuario.perfil === "super-admin"`; render da tela.
- [ ] **Step 2:** `TelaUsuarios`: tabela (nome, e-mail, perfil, atualizado em) no padrão da TelaLeads; botão "Novo usuário" abre form inline (nome, e-mail, select perfil com os 4 valores da coleção); linhas com "Editar" (form inline nome/perfil) e "Remover" (confirm via `pcms-modal` simples ou `window.confirm`? usar estado de confirmação inline — sem window.confirm). Mensagens de erro/sucesso nos padrões `pcms-upload__erro` / texto ok.
- [ ] **Step 3:** `page.tsx`: se `usuario.perfil === "super-admin"`, `listarUsuarios` no server e passa ao shell.
- [ ] **Step 4:** typecheck + build OK. Commit: `feat(cms): tela Usuários no painel (listar, criar com convite, editar, remover)`.

---

### Task 6: Minha conta — trocar a própria senha

**Files:**
- Modify: `apps/cms/src/app/(painel)/acoesAuth.ts` (`trocarMinhaSenha`)
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx` (item no menu do usuário → painel inline "Alterar senha")

**Interfaces:**

```ts
export async function trocarMinhaSenha(_a: EstadoLogin | null, fd: FormData): Promise<EstadoLogin>
// lê senhaAtual/senha/confirmacao; obterUsuarioCms(); payload.login({email, password: senhaAtual}) valida a atual (catch ⇒ "Senha atual incorreta.");
// validarNovaSenha; payload.update({collection:"users", id, data:{password: senha}, overrideAccess: true}); { ok: "Senha alterada." }
```

- [ ] **Step 1:** Implementar action + form (2 campos + atual) no dropdown/menu do usuário do shell (onde hoje há "Sair" — form colapsável).
- [ ] **Step 2:** typecheck + build. Commit: `feat(cms): alterar a própria senha no menu do usuário`.

---

### Task 7: Notificação de lead via Resend REST

**Files:**
- Modify: `packages/lib/src/forms/aposCriarLead.ts`
- Test: `packages/lib/src/forms/aposCriarLead.test.ts` (criar; verificar se packages/lib tem vitest — se não, adicionar devDep + script test como na Task 1 do plano anterior)

**Interfaces:**

```ts
// mantém a assinatura pública: aposCriarLead(tipo, lead)
// internamente: sem RESEND_API_KEY ⇒ console.info (comportamento atual);
// com chave ⇒ POST https://api.resend.com/emails { from: EMAIL_REMETENTE, to: LEADS_EMAIL_DESTINO, subject: `Novo lead (${tipo}): ${nome}`, html }
// injeção p/ teste: export async function aposCriarLeadCom(fetchFn: typeof fetch, tipo, lead)
```

- [ ] **Step 1:** Teste com `fetchFn` mock: com env setada chama a URL do Resend com Authorization Bearer e body contendo o e-mail do lead; sem env não chama fetch. Falha do fetch ⇒ não lança (console.error).
- [ ] **Step 2:** RED → implementar → GREEN (envs via `vi.stubEnv`). Commit: `feat(forms): notificação interna de novo lead via Resend`.

---

### Task 8: Verificação final e checkpoint

- [ ] **Step 1:** `pnpm --filter @ntc/cms test` + `pnpm lint` (escopo dos arquivos tocados) + `pnpm typecheck` + `pnpm build` — tudo limpo.
- [ ] **Step 2:** Dev local: fluxo esqueci-a-senha completo com e-mail logado no console (copiar o link do log e concluir o reset); criar usuário de teste pela tela (convite no console), editar, remover; trocar a própria senha e relogar. Remover usuário de teste ao final.
- [ ] **Step 3:** Servidor no ar para validação visual do PO (memória `feedback_validacao_visual`).
- [ ] **Step 4:** Quando o PO entregar `RESEND_API_KEY`: setar nas envs Vercel (projetos cms E web) via API + `.env` locais (PO cola os valores), redeploy, e um teste real de envio. Push só com aprovação visual do PO.
