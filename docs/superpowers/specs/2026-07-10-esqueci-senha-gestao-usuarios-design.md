# Esqueci a senha + Gestão de usuários no Painel Admin

**Data:** 10/07/2026 · **Status:** aprovado pelo PO · **Escopo:** `apps/cms`

## Problema

O login do painel (`/entrar`) não tem recuperação de senha (o PO ficou sem
acesso hoje — reset foi feito por script). Não há como criar/gerenciar
usuários pelo painel ("Novo usuário" não existe; Users só via script/DB), nem
trocar a própria senha.

## Decisões do PO (10/07/2026)

1. **E-mail via Resend** — conta a criar pelo PO; domínio
   `institutontc.com.br` verificado via DNS na Locaweb; `RESEND_API_KEY` nas
   envs (local + Vercel). Destrava também a notificação de Leads (backlog
   §19.2 item 4, incluída aqui).
2. **Gestão de usuários completa**: listar, criar (com e-mail de boas-vindas
   para definir a própria senha), editar nome/perfil, remover, trocar a
   própria senha.
3. **Dependência nova aprovada:** `@payloadcms/email-resend` (adapter oficial,
   mesma versão da família 3.18).
4. Remetente: `Painel NTC <nao-responda@institutontc.com.br>` (confirmar na
   verificação do domínio; configurável via env `EMAIL_REMETENTE`).

## Arquitetura

### 1. Transporte de e-mail

- `payload.config.ts`: `email: resendAdapter({ apiKey, defaultFromAddress,
  defaultFromName })` — ativo apenas quando `RESEND_API_KEY` presente; sem a
  chave, comportamento atual (log no console) permanece, e o fluxo continua
  testável em dev.
- Templates PT customizados em `Users.auth.forgotPassword.generateEmailHTML/
  generateEmailSubject` — link aponta para
  `${PAYLOAD_PUBLIC_SERVER_URL}/entrar/redefinir?token=…`.

### 2. Esqueci a senha (público)

- `/entrar`: link "Esqueci minha senha".
- `/entrar/recuperar`: form com e-mail → Server Action `solicitarRecuperacao`
  → `payload.forgotPassword({ collection: "users", data: { email } })`.
  Resposta SEMPRE genérica ("Se o e-mail estiver cadastrado, você receberá o
  link") — sem enumeração de usuários. Erros de envio logados, não expostos.
- `/entrar/redefinir?token=…`: form nova senha (2×, mínimo 12 caracteres,
  confirmação igual) → Server Action `redefinirSenha` →
  `payload.resetPassword({ collection: "users", data: { token, password } })`
  → grava o cookie `payload-token` retornado (mesmos flags do login) →
  redirect `/`. Token inválido/expirado ⇒ mensagem com link para pedir outro.
- Validade do token: 1h (default do Payload).

### 3. Tela Usuários (só super-admin)

- Item "Usuários" na sidebar do `ShellCms`, renderizado apenas quando
  `usuario.perfil === "super-admin"`; TODAS as Server Actions revalidam
  sessão + perfil server-side (`exigirSuperAdmin`).
- **Listar**: nome, e-mail, perfil, updatedAt (via Local API).
- **Criar**: nome, e-mail, perfil → `payload.create` com senha aleatória
  forte (nunca exibida) → `payload.forgotPassword({ disableEmail: true })`
  gera token → e-mail de boas-vindas customizado com link
  `/entrar/redefinir?token=…&novo=1` ("defina sua senha"; a página mostra
  título de boas-vindas quando `novo=1`). Validade do token de boas-vindas:
  24h (`auth.forgotPassword.expiration`)*.
  *Payload usa uma validade única por coleção — fica 24h para ambos os
  fluxos (aceito; supera o default de 1h do reset sem custo de segurança
  relevante para um painel interno).
- **Editar**: nome e perfil.
- **Remover**: com confirmação; bloqueado remover a si mesmo e o último
  super-admin (verificação server-side por contagem).
- E-mail duplicado na criação ⇒ mensagem clara.

### 4. Minha conta (todos os perfis)

- No menu do usuário do shell: "Alterar senha" (senha atual + nova 2×).
- Server Action valida a senha atual via `payload.login` antes do update
  (o update do próprio registro já é permitido pelo access da coleção).

### 5. Notificação de Lead (backlog §19.2 item 4)

- `aposCriarLead` passa a enviar e-mail interno via `payload.sendEmail` para
  `LEADS_EMAIL_DESTINO` (env; default `contato@institutontc.com.br`) com os
  campos principais do lead. Falha de envio: log, não bloqueia o submit
  (comportamento já documentado em CLAUDE.md §16).

## Envs novas

```
RESEND_API_KEY=re_...
EMAIL_REMETENTE="Painel NTC <nao-responda@institutontc.com.br>"
LEADS_EMAIL_DESTINO=contato@institutontc.com.br
```

Local (`apps/cms/.env`, raiz) + Vercel (projetos cms e web — o hook de lead
roda no web). Sem a chave, tudo degrada para log em console.

## Fora de escopo

- 2FA (pendência própria, Janela C).
- Tela de Configurações geral (segue demonstrativa).
- Anti-spam de formulários (hCaptcha/rate-limit — backlog item 5).
- Desativar usuário (lockout) — remover atende a v1.

## Testes

- Vitest: geração de senha aleatória, validação de nova senha (força/
  confirmação), guarda `exigirSuperAdmin` (mock), template de e-mail contém
  link com token, bloqueios de remoção (self/último super-admin) com Local
  API mockada.
- E2E manual no checkpoint: fluxo completo em dev com e-mail logado no
  console (sem chave) e, com a chave do PO, um envio real de ponta a ponta.

## Riscos

- Domínio não verificado no Resend ⇒ envios falham: o painel mostra a
  resposta genérica mesmo assim (usuário não fica preso em erro), e o log
  aponta a causa.
- Deliverability de `nao-responda@` para caixas Google/Outlook: Resend cuida
  de SPF/DKIM na verificação do domínio.
