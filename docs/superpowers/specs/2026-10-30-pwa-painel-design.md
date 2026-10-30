# PWA do Painel Admin ("Painel NTC") e aviso de lead novo — design

**Data:** 30/10/2026 · **Origem:** brainstorming com o PO na mesma data.

## 1. Intenção

A equipe quer abrir o painel admin (`admin.institutontc.com.br`, app `apps/cms`) com mais facilidade e **fora do navegador do dia a dia**: um app instalável, com ícone e janela próprios, no computador e no celular. Junto com isso, o app avisa no aparelho quando chega um lead novo.

Sucesso, para o PO: a pessoa instala o "Painel NTC", abre pelo ícone, trabalha como sempre e recebe no celular o aviso de que chegou lead.

## 2. Objetivos

1. **Instalável** como PWA no Chrome/Edge (desktop), Chrome (Android) e Safari (iPhone, via "Adicionar à Tela de Início"). Abre em janela própria (`display: standalone`), sem barra nem abas do navegador.
2. **Mesmo painel por dentro.** Mesmo login, mesma senha, mesma passkey e mesmas permissões por tela (v3.8). Nenhuma tela muda de comportamento.
3. **Aviso de lead novo** (Web Push) em todo aparelho que ativou os avisos, para os leads de **todos os tipos** que chegam pelo site.
4. **Tela "Sem conexão"** no lugar do erro do navegador quando não há rede.

## 3. Não-objetivos

- Funcionar offline. O painel depende do banco, e nenhuma tela é cacheada para uso sem rede.
- App nas lojas (App Store/Play Store) ou empacotamento nativo.
- PWA do site público (`apps/web`).
- Outros avisos além de lead novo: proposta aceita, evento e similares ficam para depois.
- Preferência por pessoa de quais tipos de lead avisar. Hoje vale tudo ou nada, por aparelho.

## 4. Anti-objetivos (falharia mesmo "funcionando")

- **Dado pessoal no aviso.** Nome, e-mail, telefone, instituição e mensagem do lead nunca aparecem na notificação. O aviso aparece na tela bloqueada e chega a quem não tem a tela de Leads. Desde a v3.8, quem não tem Leads não pode ver dado de lead, e há a LGPD (§12).
- **Afrouxar a segurança do painel.** Nenhuma origem de terceiro entra na CSP (`apps/cms/next.config.ts`). O service worker não pode cachear resposta autenticada (HTML de tela, Server Action, `/api/*`), porque isso vazaria dado entre sessões e serviria tela velha a quem perdeu permissão.
- **O envio do aviso atrasar ou derrubar a gravação do lead.** O formulário do site responde como hoje. Falha de push é só registrada.
- **Quebrar a passkey.** WebAuthn amarra a credencial ao hostname. O app instalado precisa rodar no domínio canônico `admin.institutontc.com.br`, nunca no alias `.vercel.app` (v1.9).

## 5. Decisões do PO

- PWA para **computador e celular**.
- Nome sob o ícone: **"Painel NTC"**.
- O aviso vai para **todo mundo que instalar o app e ativar os avisos**, sem filtro por tela.
- Avisa em **todos os tipos de lead**: proposta, contato e newsletter. Candidatura também, se voltar a existir (hoje não há rota que crie; foi removida na v3.6).
- Dependência nova **`web-push`** autorizada (§5.4).

## 6. Decisões do agente (marcadas para o PO conferir)

- **O aviso é genérico.** Título "Novo lead · Proposta" (ou Contato, Newsletter, Candidatura). Corpo fixo: "Chegou pelo site. Toque para abrir o painel." Sem nenhum dado do lead. O PO não contestou quando isso foi proposto.
- **Lead criado à mão no CRM não avisa.** Só avisa quando `origemEntrada === "site"` e na **criação** (`operation === "create"`). Quem cria à mão já sabe que o lead existe.
- **Ativação por aparelho, em Configurações → Minha conta.** Botão "Ativar avisos neste aparelho", que vira "Desativar avisos neste aparelho" depois de ligado. Navegador e celular exigem que a pessoa clique e aceite, então a ativação não pode ser automática.
- **"Sair" desinscreve o aparelho atual.** Assim um aparelho compartilhado não segue recebendo avisos depois do logout.
- **Tocar no aviso:**
  - Lead `tipo = proposta` → abre `/crm?lead=<id>`, e o painel abre o `ModalLead` daquele lead.
  - Contato e newsletter → abrem `/`. Esses tipos não têm tela no painel desde a Sessão 1.
  - Quem não tem a tela de Leads e cai em `/crm?lead=` vê o painel normal, sem o modal. O servidor já recusa a leitura (`carregarLeadCrm` exige a tela).
  - Sem sessão, o fluxo de login normal assume.
- **Orientação de instalação.** Texto curto com o passo a passo por plataforma em Configurações → Minha conta, ao lado do botão de avisos, e também na tela `/entrar`. O texto some quando o app já está rodando instalado (`display-mode: standalone`). O do iPhone é o mais importante: lá não existe botão automático, e o aviso **só funciona depois de instalado** (regra da Apple, iOS 16.4+).
- **Ícone:** o kit oficial `arquivos-fonte/marca-ntc-pacote-oficial/11_Avatar_Favicon/` (`NTC_Limpa_Icone_App.svg` e PNGs 180/512/1024), copiado para `apps/cms/public/`. Para o ícone `maskable`, o builder escolhe a variante com margem de segurança (ou gera uma com fundo Oxford). Nada de arte nova.
- **Cores do manifest:** `theme_color` e `background_color` Oxford `#11365E` (tokens §3).

## 7. Restrições

- **Stack:** Next 16 App Router no `apps/cms`, Payload 3.90. O manifest sai por `app/manifest.ts` (metadata route do Next). O service worker é um arquivo estático em `apps/cms/public/sw.js`, servido com o escopo `/`, e não usa biblioteca de PWA (next-pwa, Serwist e similares não foram autorizados).
- **CSP:** a atual já cobre o necessário (o worker cai em `default-src 'self'`, e a inscrição de push não passa pelo `connect-src` da página). Se algum cabeçalho precisar mudar, só vale para `'self'`. O `Permissions-Policy` atual não bloqueia notificações; mantê-lo assim.
- **Onde o lead nasce:** os handlers `apps/web/app/api/forms/*` criam o lead pela Local API com a config do cms, então os hooks de `leads` rodam **no processo do `apps/web`**. O envio do push mora num hook `afterChange` de `Leads.ts` (junto de `casarClienteDoLead`/`registrarLeadNaLinhaDoTempo`), **não** nos handlers (regra §19.5: não replicar lógica de lead no handler). Por isso as chaves VAPID e a `web-push` precisam estar disponíveis nos **dois** projetos da Vercel (web e cms).
- **Não bloquear:** o hook dispara o envio sem `await` no caminho do lead (fire-and-forget com `.catch` que loga), ou com `await` e tempo-limite curto; o builder escolhe. A escrita do lead não pode falhar por causa do push.
- **Banco:** coleção nova (ex.: `inscricoes-aviso`) com `usuario` (relação com `users`), `endpoint` (único), `chaves` (`p256dh`, `auth`) e `userAgent`/rótulo do aparelho para identificação. **Isso exige `payload:push:schema`, passo manual do PO:**
  - rodar com o dev parado;
  - conferir o diff antes;
  - esperado: só a criação da tabela e dos índices, mais o drift recorrente já conhecido;
  - **nenhum `DROP` e nenhum `DISABLE ROW LEVEL SECURITY`** (`manterRlsLigado` nunca sai);
  - conferir que a tabela nova nasce **com RLS ligado**, como as demais (v3.6).
- **Access da coleção:** ninguém lê ou escreve pela REST. Escrita e leitura só pelas Server Actions do painel (o usuário logado inscreve ou remove **o próprio** aparelho) e pelo hook (lê todas para enviar). Seguir o padrão de `passkeys`.
- **Limpeza:** quando o serviço de push responde 404/410 para um endpoint, a inscrição é apagada. Usuário removido na tela Usuários leva junto as inscrições dele.
- **Variáveis novas** em `.env.example` e §15 do CLAUDE.md:
  - `VAPID_PUBLIC_KEY` (ou `NEXT_PUBLIC_VAPID_PUBLIC_KEY`);
  - `VAPID_PRIVATE_KEY`;
  - `VAPID_SUBJECT` (`mailto:contato@institutontc.com.br`).

  Sem as chaves, o recurso degrada em silêncio, como o Resend sem `RESEND_API_KEY`: o botão de ativar não aparece e o hook não envia. As chaves são geradas uma vez; o PO as coloca na Vercel.
- **Gates:** `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` verdes, com o dev parado antes do build. As regras puras (montar o conteúdo do aviso, decidir se avisa, URL de destino) têm testes. Atualizar o CLAUDE.md com uma entrada nova no histórico e §19.

- **Ordem de entrada em produção (decisão do agente):** o banco é o mesmo de dev e prod. Primeiro o `payload:push:schema`, que só cria tabela e por isso não afeta o código que está no ar. Depois as chaves na Vercel. Por último o deploy. Assim o código novo nunca roda sem a tabela.
- **Dependência:** `web-push` entra no `apps/cms`. Como o hook roda também no processo do `apps/web`, o builder confere que o pacote resolve no build do web (e, se for preciso, o declara em `serverExternalPackages`).

## 8. Deixado para o builder

- Nome exato da coleção e dos arquivos; onde ficam as regras puras (sugestão: `packages/lib/src/avisos/` para o puro e `apps/cms/src/lib/avisos/` para o adapter).
- Estratégia de atualização do service worker (`skipWaiting`/`clients.claim`) e a página "Sem conexão" (estática, em `public/`, cacheada pelo worker e servida só em falha de navegação).
- Como o `ShellCrm` lê `?lead=` (prop vinda do `crm/page.tsx` via `searchParams`), respeitando a tela.
- Texto exato das orientações de instalação, sem inventar conteúdo institucional.
- Agrupar avisos em rajada (ex.: `tag` por tipo) é opcional.

## 9. Checkpoint do PO (depois do push de schema e das chaves na Vercel)

1. No Chrome do computador, instalar o "Painel NTC" e conferir ícone, nome e janela própria.
2. Fazer login com passkey dentro do app.
3. Ativar os avisos e enviar um formulário de proposta em `/contato`: o aviso chega, e tocar nele abre o lead.
4. Repetir no Android e no iPhone (instalado pela Tela de Início).
5. Enviar uma newsletter: o aviso chega e abre o painel.
6. Desativar os avisos; depois ativar e "Sair": nos dois casos o aviso para de chegar.
7. Desligar a rede: aparece a tela "Sem conexão".
8. Conferir o aviso na tela bloqueada: não mostra nenhum dado pessoal.
