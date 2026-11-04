# PWA "Painel NTC" com aviso de lead novo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o painel admin (`apps/cms`) instalável como app ("Painel NTC") no computador e no celular, com aviso Web Push genérico a cada lead novo que chega pelo site.

**Architecture:** O manifest é servido pela metadata route do Next (`app/(painel)/manifest.ts`), e um service worker estático em `apps/cms/public/sw.js` recebe os pushes e serve a página "Sem conexão" quando a navegação falha. Os aparelhos inscritos ficam numa coleção nova, `inscricoes-aviso`. Um hook `afterChange` de `leads` envia o aviso por `web-push`. Esse hook roda também no processo do `apps/web`, porque é lá que os formulários gravam o lead. As regras puras (decidir se avisa, montar o aviso, achar o destino) moram em `@ntc/lib`.

**Tech Stack:** Next 16 App Router, Payload 3.90, `web-push` (autorizada pelo PO), Vitest (`environment: node`).

**Spec:** `docs/superpowers/specs/2026-10-30-pwa-painel-design.md`

## Global Constraints

- Nome do app: `"Painel NTC"` (`name` e `short_name`). `theme_color` e `background_color`: `#11365E`. `display: "standalone"`, `start_url: "/"`, `scope: "/"`, `lang: "pt-BR"`.
- Título do aviso: `"Novo lead · Proposta"`, `"Novo lead · Contato"`, `"Novo lead · Newsletter"` ou `"Novo lead · Candidatura"`. Corpo fixo: `"Chegou pelo site. Toque para abrir o painel."` **Nenhum** dado do lead (nome, e-mail, telefone, instituição, mensagem) entra no payload do push. Só entram `title`, `body`, `url` e `tag`.
- Avisa só quando `operation === "create"` **e** `origemEntrada === "site"`.
- Destino: `tipo === "proposta"` → `/crm?lead=<id>`; qualquer outro → `/`.
- Envs novas, nos dois projetos (web e cms): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:contato@institutontc.com.br`). Sem chave pública e privada, o recurso fica desligado em silêncio: o botão não aparece e o hook não envia.
- CSP de `apps/cms/next.config.ts`: nenhuma origem nova. O service worker **nunca** cacheia resposta autenticada; só `/offline.html` e os ícones.
- A escrita do lead não pode falhar nem esperar por causa do push. O hook não faz `await` do envio, e o `.catch` loga `[avisoLead]`.
- Módulos alcançados pelos hooks de `Leads.ts` usam **imports relativos** ou `@ntc/*`, nunca `@/…`. O `apps/web` carrega `@ntc/cms/payload.config`, e lá `@/` aponta para o web (veja `lib/crm/casamento.ts`, que segue essa regra).
- Coleção nova exige `payload:push:schema`, que é passo do PO (fora deste plano). Conferir o diff: só criação, nenhum `DROP` nem `DISABLE ROW LEVEL SECURITY`, e a tabela nova com RLS ligado.
- Commits em português, Conventional Commits, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Antes de qualquer `pnpm build`, parar o dev server (o `.next` é compartilhado).

## Review Focus

1. **Endpoint expirado (404/410 do serviço de push):** a inscrição é apagada e os outros aparelhos continuam recebendo. Teste na Task 3.
2. **Mesmo aparelho ativando duas vezes, ou trocando de usuário:** um endpoint é único. Ativar de novo reaproveita a inscrição e passa a apontar para o usuário atual, sem erro de unique. Teste na Task 4.
3. **Chaves VAPID ausentes num dos projetos:** o lead grava normalmente, nada é enviado e não sai exceção. Teste na Task 3.
4. **Usuário removido na tela Usuários:** as inscrições dele somem antes do delete do usuário, para não deixar aviso indo para quem perdeu o acesso. Teste na Task 4.
5. **`?lead=` com id inválido ou sem a tela de Leads:** o painel abre normal, sem modal e sem erro visível. Teste na Task 6.

---

### Task 1: Regras puras do aviso em `@ntc/lib`

**Files:**
- Create: `packages/lib/src/avisos/avisoLead.ts`
- Create: `packages/lib/src/avisos/avisoLead.test.ts`
- Modify: `packages/lib/src/index.ts` (export)

**Interfaces:**
- Produces:
  - `interface AvisoPush { title: string; body: string; url: string; tag: string }`
  - `deveAvisarLead(p: { operation: "create" | "update"; origemEntrada?: string | null }): boolean`
  - `montarAvisoLead(lead: { id: string | number; tipo?: string | null }): AvisoPush`
  - `ROTULO_TIPO_LEAD: Record<"proposta" | "contato" | "newsletter" | "candidatura", string>` (`"Proposta"`, `"Contato"`, `"Newsletter"`, `"Candidatura"`)

- [ ] **Step 1: Escrever os testes que falham**

```ts
describe("deveAvisarLead", () => {
  it("avisa na criação vinda do site", () => expect(deveAvisarLead({ operation: "create", origemEntrada: "site" })).toBe(true));
  it("não avisa lead manual", () => expect(deveAvisarLead({ operation: "create", origemEntrada: "manual" })).toBe(false));
  it("não avisa update", () => expect(deveAvisarLead({ operation: "update", origemEntrada: "site" })).toBe(false));
  it("não avisa sem origem", () => expect(deveAvisarLead({ operation: "create", origemEntrada: null })).toBe(false));
});
describe("montarAvisoLead", () => {
  it("proposta vai para o lead no CRM", () =>
    expect(montarAvisoLead({ id: 42, tipo: "proposta" })).toEqual({
      title: "Novo lead · Proposta", body: "Chegou pelo site. Toque para abrir o painel.",
      url: "/crm?lead=42", tag: "lead-proposta",
    }));
  it("newsletter vai para a raiz", () => expect(montarAvisoLead({ id: 7, tipo: "newsletter" }).url).toBe("/"));
  it("tipo desconhecido vira 'Novo lead' e raiz", () =>
    expect(montarAvisoLead({ id: 1, tipo: "xyz" })).toMatchObject({ title: "Novo lead", url: "/", tag: "lead" }));
  it("só tem as quatro chaves (sem dado pessoal)", () =>
    expect(Object.keys(montarAvisoLead({ id: 1, tipo: "contato" })).sort()).toEqual(["body", "tag", "title", "url"]));
});
```

- [ ] **Step 2: Rodar e ver falhar.** Run: `pnpm --filter @ntc/lib test -- avisoLead`. Expected: FAIL (módulo inexistente).
- [ ] **Step 3: Implementar `avisoLead.ts`** com as assinaturas acima e exportar em `index.ts`. O id entra na URL via `encodeURIComponent(String(id))`.
- [ ] **Step 4: Rodar e ver passar.** Mesmo comando. Expected: PASS.
- [ ] **Step 5: Commit** `feat(avisos): regras puras do aviso de lead novo`

### Task 2: Coleção `inscricoes-aviso`

**Files:**
- Create: `apps/cms/src/collections/InscricoesAviso.ts`
- Create: `apps/cms/src/collections/InscricoesAviso.access.test.ts`
- Modify: `apps/cms/src/payload.config.ts` (registrar logo depois de `Passkeys`)
- Regenerate: `packages/types/src/payload-types.ts` (`pnpm --filter @ntc/cms payload:generate`; formatar, porque o `payload run` gera sem formatação)

**Interfaces:**
- Produces: coleção slug `inscricoes-aviso`, com os campos:
  - `usuario` (relationship `users`, required, index);
  - `endpoint` (text, required, unique);
  - `p256dh` (text, required);
  - `auth` (text, required);
  - `aparelho` (text, opcional: user-agent resumido).

  Tipo gerado `InscricoesAviso` (se o Payload pluralizar errado, ajustar com `typescript.interface: "InscricaoAviso"`, como foi feito em `DocumentoComercial`).

- [ ] **Step 1: Teste de access que falha.** Para `read`, `create`, `update` e `delete`, com usuário administrador e com usuário comum, todos devolvem `false`. Escrita e leitura só pela Local API com `overrideAccess`. Seguir o formato de `Leads.access.test.ts`.
- [ ] **Step 2: Rodar.** Run: `pnpm --filter @ntc/cms test -- InscricoesAviso`. Expected: FAIL.
- [ ] **Step 3: Criar a coleção**, com cabeçalho no estilo de `Passkeys.ts` e `admin.group: "Sistema"`, e registrar em `payload.config.ts`.
- [ ] **Step 4: Rodar teste e `payload:generate`.** Expected: PASS; o diff em `packages/types` traz só o tipo novo.
- [ ] **Step 5: Commit** `feat(avisos): coleção inscricoes-aviso para os aparelhos inscritos`

### Task 3: Envio do push e hook em `leads`

**Files:**
- Modify: `apps/cms/package.json` (dependência `web-push` e `@types/web-push` em dev; `pnpm install`)
- Create: `apps/cms/src/lib/avisos/enviarAviso.ts`
- Create: `apps/cms/src/lib/avisos/enviarAviso.test.ts`
- Create: `apps/cms/src/lib/avisos/avisarLeadNovo.ts` (o hook)
- Modify: `apps/cms/src/collections/Leads.ts:206` (`afterChange: [casarClienteDoLead, registrarLeadNaLinhaDoTempo, avisarLeadNovo]`)
- Modify: `apps/cms/next.config.ts` e `apps/web/next.config.ts` (`"web-push"` em `serverExternalPackages`)

**Interfaces:**
- Consumes: `deveAvisarLead`, `montarAvisoLead`, `AvisoPush` (Task 1); coleção `inscricoes-aviso` (Task 2).
- Produces:
  - `configVapid(env?: NodeJS.ProcessEnv): { publica: string; privada: string; assunto: string } | null` (`null` se faltar a pública ou a privada; assunto default `mailto:contato@institutontc.com.br`).
  - `enviarAvisoATodos(payload: Payload, aviso: AvisoPush, deps?: { enviar?: EnviarFn; vapid?: ReturnType<typeof configVapid> }): Promise<{ enviados: number; removidos: number }>`, em que `type EnviarFn = (inscricao: { endpoint: string; keys: { p256dh: string; auth: string } }, corpo: string) => Promise<unknown>`. O default de `enviar` usa `webpush.sendNotification` com `setVapidDetails`.
  - Hook `avisarLeadNovo: CollectionAfterChangeHook`. Quando `deveAvisarLead({ operation, origemEntrada: doc.origemEntrada })`, chama `void enviarAvisoATodos(req.payload, montarAvisoLead(doc)).catch(e => console.error("[avisoLead]", e))` e devolve `doc`. Só imports relativos ou `@ntc/*` (Global Constraints).

- [ ] **Step 1: Testes que falham** (`enviarAviso.test.ts`, com um `payload` falso contendo `find` e `delete` em `vi.fn`):
  - `configVapid` devolve `null` sem `VAPID_PRIVATE_KEY`.
  - `enviarAvisoATodos` com `vapid: null` não chama `find` e devolve `{ enviados: 0, removidos: 0 }`.
  - Com 3 inscrições, em que `enviar` rejeita a segunda com `{ statusCode: 410 }`: resolve `{ enviados: 2, removidos: 1 }` e chama `delete` com o id da segunda.
  - Erro `{ statusCode: 500 }` não apaga e não rejeita (conta como não enviado).
  - O corpo passado a `enviar` é `JSON.stringify(aviso)`.
- [ ] **Step 2: Rodar.** Run: `pnpm --filter @ntc/cms test -- enviarAviso`. Expected: FAIL.
- [ ] **Step 3: Implementar** `enviarAviso.ts` e `avisarLeadNovo.ts`. Buscar todas as inscrições com `find({ collection: "inscricoes-aviso", limit: 1000, depth: 0, overrideAccess: true })` e enviar com `Promise.allSettled`. Status 404 ou 410 → `delete` por id.
- [ ] **Step 4: Rodar os testes do cms inteiros.** Run: `pnpm --filter @ntc/cms test`. Expected: PASS, sem regressão.
- [ ] **Step 5: Commit** `feat(avisos): envia web push a cada lead novo do site`

### Task 4: Server Actions de inscrição, "Sair" e remoção de usuário

**Files:**
- Create: `apps/cms/src/lib/cms/inscricoesAviso.ts` (server-only)
- Create: `apps/cms/src/lib/cms/inscricoesAviso.test.ts`
- Modify: `apps/cms/src/app/(painel)/acoesAuth.ts` (3 actions novas, junto das de passkey)
- Modify: `apps/cms/src/lib/cms/painelCmsUsuarios.ts:281` (apagar as inscrições do alvo antes de `p.delete` do usuário)

**Interfaces:**
- Produces:
  - `salvarInscricao(usuarioId: string, i: { endpoint: string; p256dh: string; auth: string; aparelho?: string }): Promise<ResultadoEscrita>`: upsert por `endpoint`. Se já existe, faz `update` com o `usuario` e as chaves novas; se não, `create`. Recusa endpoint que não seja `https://`, ou campos vazios, com a mensagem `"Não foi possível ativar os avisos neste aparelho."`.
  - `removerInscricao(usuarioId: string, endpoint: string): Promise<ResultadoEscrita>`: apaga só se o dono for o `usuarioId`. Endpoint inexistente devolve `ok`.
  - `removerInscricoesDoUsuario(p: Payload, usuarioId: string): Promise<void>`.
  - Actions em `acoesAuth.ts`, todas exigindo `obterUsuarioCms()`, com a mensagem `"Sessão expirada. Entre novamente."` sem sessão:
    - `ativarAvisosCms(i)`;
    - `desativarAvisosCms(endpoint: string)`;
    - `chaveAvisosCms(): Promise<string | null>` (devolve `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, ou `null` se `configVapid()` for `null`).

- [ ] **Step 1: Testes que falham:**
  - O mesmo endpoint salvo duas vezes por usuários diferentes resulta num único `update`, para o segundo usuário.
  - Endpoint `http://` é recusado.
  - `removerInscricao` com outro dono não apaga.
  - `removerUsuario` chama `delete` em `inscricoes-aviso` (where `usuario` = alvo) antes do `delete` em `users`. Estender o teste existente de `painelCmsUsuarios`, se houver; senão, criar no arquivo novo.
  - Cada action sem sessão devolve o erro de sessão (padrão de `acoesCrm.test.ts`).
- [ ] **Step 2: Rodar.** Run: `pnpm --filter @ntc/cms test -- inscricoesAviso painelCmsUsuarios`. Expected: FAIL.
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: Rodar.** Mesmo comando. Expected: PASS.
- [ ] **Step 5: Commit** `feat(avisos): ativar e desativar avisos por aparelho`

### Task 5: Manifest, ícones, service worker e tela "Sem conexão"

**Files:**
- Create: `apps/cms/src/app/(painel)/manifest.ts` (`MetadataRoute.Manifest`, valores das Global Constraints; ícones 192, 512 e 512 `maskable`)
- Create: `apps/cms/public/icones/` com PNGs copiados de `arquivos-fonte/marca-ntc-pacote-oficial/11_Avatar_Favicon/Tamanhos/`:
  - `icone-180.png` (apple-touch);
  - `icone-192.png`, gerado a partir do 512 se não existir no kit;
  - `icone-512.png`;
  - `icone-maskable-512.png` (versão com fundo Oxford e margem de segurança de 10%).

  Use `sips` (macOS) para redimensionar; nenhuma dependência nova.
- Create: `apps/cms/public/sw.js`
- Create: `apps/cms/public/offline.html` (autossuficiente: CSS inline, fundo `#11365E`, texto em Pergaminho `#F4EFE6`, "Sem conexão" em fonte serif do sistema e um botão "Tentar de novo" que recarrega)
- Create: `apps/cms/src/app/(painel)/RegistrarServiceWorker.tsx` (client: `navigator.serviceWorker.register("/sw.js", { scope: "/" })` no `useEffect`, só se `"serviceWorker" in navigator`)
- Modify: `apps/cms/src/app/(painel)/layout.tsx`:
  - `metadata.appleWebApp = { capable: true, title: "Painel NTC", statusBarStyle: "default" }`;
  - ícone apple `/icones/icone-180.png`;
  - `export const viewport = { themeColor: "#11365E" }`;
  - montar `<RegistrarServiceWorker />`.
- Modify: `apps/cms/next.config.ts` (cabeçalhos para `/sw.js`: `Cache-Control: no-cache` e `Service-Worker-Allowed: /`)

**Interfaces:**
- Produces: o `sw.js` trata três eventos.
  - `install`: cacheia `["/offline.html", "/icones/icone-192.png"]` num cache versionado `painel-ntc-v1`, depois `skipWaiting`.
  - `activate`: apaga caches de outra versão e chama `clients.claim()`.
  - `fetch`: **só** para `request.mode === "navigate"`. Tenta a rede; se der erro, responde com o `/offline.html` do cache. Nenhuma outra requisição é interceptada.
  - `push`: lê `event.data.json()` como `AvisoPush` e chama `showNotification(title, { body, tag, icon: "/icones/icone-192.png", badge: "/icones/icone-192.png", data: { url } })`.
  - `notificationclick`: fecha o aviso e foca a janela do app já aberta (navegando para `data.url`) ou abre `clients.openWindow(data.url)`.

- [ ] **Step 1:** Criar os arquivos e copiar os ícones.
- [ ] **Step 2: Verificar.** Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`. Expected: 0 erros.
- [ ] **Step 3: Verificar no dev.** Com `pnpm dev:cms`, `curl -s localhost:3001/manifest.webmanifest` traz `"name":"Painel NTC"`. `curl -sI localhost:3001/sw.js` traz `200` e `Service-Worker-Allowed: /`.
- [ ] **Step 4: Commit** `feat(painel): manifest, ícones e service worker do app Painel NTC`

### Task 6: Interface — ativar avisos, orientação de instalação, Sair e `?lead=`

**Files:**
- Create: `apps/cms/src/app/(painel)/AvisosDoAparelho.tsx` (client)
- Create: `apps/cms/src/app/(painel)/OrientacaoInstalacao.tsx` (client)
- Create: `apps/cms/src/lib/avisos/navegador.ts` (client helpers)
- Modify: `apps/cms/src/app/(painel)/TelaConfiguracoes.tsx` (seção Minha conta: os dois componentes, abaixo dos passkeys)
- Modify: `apps/cms/src/app/(painel)/entrar/page.tsx` (`<OrientacaoInstalacao />` abaixo do formulário)
- Modify: `apps/cms/src/app/(painel)/shell/ShellPainel.tsx:97` (o form de Sair ganha um `onSubmit` que espera `desinscreverEsteAparelho()`, com tempo-limite de 2 s, antes de deixar a action `sair` seguir)
- Modify: `apps/cms/src/app/(painel)/crm/page.tsx` (lê `searchParams.lead` e passa `leadInicial?: string` ao `ShellCrm`)
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (prop `leadInicial`; num `useEffect` de montagem, se `capacidades.verLeads && leadInicial`, chama `abrirLead(leadInicial)` e depois remove `?lead=` da URL com `history.replaceState`)

**Interfaces:**
- Consumes: `ativarAvisosCms`, `desativarAvisosCms`, `chaveAvisosCms` (Task 4); `/sw.js` (Task 5).
- Produces (`navegador.ts`):
  - `suportaAvisos(): boolean` (`serviceWorker`, `PushManager` e `Notification` presentes);
  - `estaInstalado(): boolean` (`matchMedia("(display-mode: standalone)")` ou `navigator.standalone`);
  - `plataforma(): "ios" | "android" | "desktop"`;
  - `inscreverEsteAparelho(chavePublica: string): Promise<PushSubscriptionJSON>`;
  - `desinscreverEsteAparelho(): Promise<string | null>` (devolve o endpoint removido e chama `desativarAvisosCms`);
  - `base64UrlParaUint8Array(s: string): Uint8Array`.
- Textos:
  - `AvisosDoAparelho`:
    - estados `"Ativar avisos neste aparelho"`, `"Desativar avisos neste aparelho"` e `"Ativando…"`;
    - permissão negada: `"Os avisos estão bloqueados nas configurações do navegador para este site."`;
    - iOS fora do app instalado: `"No iPhone, instale o Painel NTC na Tela de Início para receber avisos."`;
    - não renderiza nada se `chaveAvisosCms()` devolver `null` ou se `suportaAvisos()` for falso fora do iOS.
  - `OrientacaoInstalacao` não renderiza se `estaInstalado()`. Por plataforma:
    - iOS: `"No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início."`;
    - Android: `"No Chrome, abra o menu e toque em Instalar app."`;
    - desktop: `"No Chrome ou no Edge, clique no ícone de instalar na barra de endereço."`.
- Estilo: classes `pcms-*` existentes de `painel.css`. Nenhum componente visual novo além desses dois blocos de texto e botão, que o spec aprova.

- [ ] **Step 1: Teste que falha** em `apps/cms/src/lib/avisos/navegador.test.ts`. `base64UrlParaUint8Array("AQID")` → `[1,2,3]`, e `"-_8"` → `[251, 255]`. É a única parte pura testável no ambiente `node`.
- [ ] **Step 2: Teste que falha** para o `?lead=` (Review Focus 5). Extrair `leadInicialDaUrl(valor: string | string[] | undefined): string | undefined` para `apps/cms/src/lib/cms/leadInicial.ts`:
  - devolve o id se for um inteiro positivo;
  - devolve `undefined` para array, vazio, `"abc"` e `"0"`.

  Testar esses cinco casos.
- [ ] **Step 3: Rodar.** Run: `pnpm --filter @ntc/cms test -- navegador leadInicial`. Expected: FAIL.
- [ ] **Step 4: Implementar** os helpers e os componentes, e ligar `crm/page.tsx`, `ShellCrm`, `ShellPainel`, `TelaConfiguracoes` e `entrar/page.tsx`.
- [ ] **Step 5: Rodar os gates do cms.** Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint`. Expected: verde.
- [ ] **Step 6: Commit** `feat(painel): ativar avisos, orientação de instalação e abrir lead pelo aviso`

### Task 7: Envs, documentação e gates finais

**Files:**
- Modify: `.env.example` (as três VAPID, com comentário: "Gerar uma vez com `pnpm dlx web-push generate-vapid-keys`; mesmas chaves no web e no cms")
- Modify: `CLAUDE.md` (entrada **v3.9** no histórico; §15 com as envs; §19.1, coleções 22 → 23 e `inscricoes-aviso` na lista; §19.2, bullet do app; §19.3, item novo com a ordem do PO: (1) `payload:push:schema` com diff conferido e a tabela com RLS, (2) chaves VAPID nos dois projetos da Vercel, (3) deploy, (4) checkpoint do spec §9)

- [ ] **Step 1:** Editar os arquivos.
- [ ] **Step 2: Gates do monorepo, com o dev parado.** Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build --force`. Expected: lint 0 erros, typecheck 5/5, testes verdes, build das 2 tasks green. Em seguida apagar `apps/*/.next`.
- [ ] **Step 3: Conferir a resolução no web.** O log do build do `@ntc/web` não acusa `Module not found: web-push`.
- [ ] **Step 4: Commit** `docs: registra o app Painel NTC e os avisos de lead no CLAUDE.md (v3.9)`

**Não faz parte deste plano (é do PO):** `payload:push:schema`, as chaves na Vercel, o deploy e o checkpoint do spec §9. Até o push de schema, o hook vai falhar ao buscar as inscrições. Isso só gera log `[avisoLead]` e não afeta o lead gravado.
