# Roadmap — CMS e CRM do Portal Grupo NTC
## Do estado atual ao go-live · v1

**Versão:** 1.0 · 27 de agosto de 2026

> **Nota (16/09/2026):** as Janelas/Sessões deste documento que tratam do CRM (Janela H inteira no `docs/17`; Sessões D2 e E3 e Janelas F e G no `docs/16`) foram **substituídas** pelo spec `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md`. O texto abaixo é mantido como histórico e não deve ser executado.

**Base:** estado real verificado em código e `pnpm dev` local em 26-27/08/2026 (ver `CLAUDE.md` §19, v1.6.1).
**Companheiro de:** `docs/15_Prompts_Iniciais_Claude_Code_v1.md` (mesmo formato — Janela → Sessão → prompt pronto pra colar).
**Função:** organizar o backlog do CMS/CRM em sessões executáveis, na ordem que faz sentido por dependência, para retomar a produção sem precisar reconstruir o contexto do zero a cada vez.

---

## Como usar este documento

Cada **Janela** é um bloco temático. Cada **Sessão** é uma unidade de 60–90 minutos (padrão do projeto, `CLAUDE.md` §6) com objetivo único. Antes de abrir uma sessão, confira a coluna "Pré-requisito" — algumas dependem de uma ação sua (provisionar uma chave, decidir um escopo) que não é código e trava a sessão até resolvida.

Cole o prompt da sessão como primeira mensagem no Claude Code. Ele vai ler o `CLAUDE.md` automaticamente; o prompt só aponta o alvo e o recorte.

Ordem recomendada — por que essa e não outra:

1. **Janela C (Segurança)** vem primeiro porque bloqueia o go-live e é independente de tudo o mais.
2. **Janela D (CRM B2 — motor de propostas)** vem em seguida porque é o maior valor de negócio parado hoje: o registro de propostas já existe (Fase B1), só falta gerar o documento.
3. **Janela E (Painel Admin)** é importante mas não bloqueia nada — pode ser intercalada.
4. **Janelas F e G (Financeiro e Permissões)** dependem de B2 estar fechado (contratos nascem de propostas aceitas) e ficam por último.

---

## Painel de decisões pendentes do PO (fora de sessão de código)

Estas ações **não são tarefas do Claude Code** — são provisionamento/decisão humana. Sem elas, a sessão de código correspondente fica pela metade (o código funciona, mas degrada para log/stub em produção).

| # | Ação | Bloqueia | Quem faz |
|---|---|---|---|
| 1 | Provisionar `RESEND_API_KEY` e setar nas envs da Vercel (projetos **cms** e **web**) + `.env` locais | Notificação de lead, convites de usuário, recuperação de senha — hoje tudo degrada pra log no console | PO |
| 2 | Provisionar conta hCaptcha (`HCAPTCHA_SITE_KEY`/`HCAPTCHA_SECRET`) | Janela C — Sessão 2 (anti-spam) | PO |
| 3 | Decidir e provisionar o store de rate-limit (ex.: Upstash Redis, ou alternativa) | Janela C — Sessão 2 (anti-spam) | PO |
| 4 | Confirmar escopo do Financeiro (Contratos/Empenhos/NFs/Recebimentos/Comissões — quais entram na v1 do CRM vs. ficam pra depois) | Janela F | PO |
| 5 | Decidir o que fazer com os 5 PDFs "Folder · Módulo..." soltos na raiz (2 de PROGE ainda sem evento no site) | Housekeeping, não bloqueia código | PO |

---

## Janela C — Segurança e go-live

Bloqueador declarado no `CLAUDE.md` §17.8. Sem 2FA e sem anti-spam real, o portal não deveria receber tráfego público de verdade.

### Sessão C1 — 2º fator do admin ✅ entregue via passkey/WebAuthn (07/09/2026)

- **Entregue, mas NÃO como TOTP.** O escopo original desta sessão (TOTP com `otplib`, QR code, campo de secret em `Users.ts`) foi **descartado** — em 02/09 o PO optou por **passkey/WebAuthn** no lugar, que é mais forte (resistente a phishing, sem segredo compartilhado) e não depende de plugin. Spec: `docs/superpowers/specs/2026-09-02-passkey-2fa-design.md`. Plano: `docs/superpowers/plans/2026-09-02-passkey-2fa-implementation.md`. Mergeado na `main` (CLAUDE.md v1.9).
- **O que existe hoje:** 20ª coleção `passkeys`; senha continua sendo o 1º fator; quem cadastra passkey passa a confirmar com ele (Touch ID/Windows Hello/chave física) antes da sessão abrir — inclusive no fluxo "esqueci minha senha"; autogestão em Configurações → Minha conta; remoção pelo super-admin na tela Usuários (cobre dispositivo perdido).
- **Diferença importante em relação ao plano original:** é **opcional por usuário** (quem não cadastra segue só com senha), então **não fecha sozinho o "2FA obrigatório" do DAB §10.1**. Tornar obrigatório é decisão do PO — quando for, o enforço é pequeno (barrar login sem passkey cadastrado).
- **Pendente:** checkpoint visual humano (§6). A seção "Segurança e acesso" da tela Configurações continua "Demonstrativo" — a parte real de passkeys mora em "Minha conta".

### Sessão C2 — Anti-spam real

- **Objetivo:** `verificarHcaptcha` e `checarRateLimit` deixam de ser stub.
- **Escopo:** siteverify real do hCaptcha; store de rate-limit persistente; **incluir `/entrar/recuperar` no rate-limit** (hoje nada impede e-mail-bombing do admin conhecido — risco real, não teórico).
- **Pré-requisito:** #2 e #3 do painel de decisões acima (chaves hCaptcha + store de rate-limit provisionados).
- **Estimativa:** 1 sessão.
- **Prompt:**
  ```
  Vamos ativar o anti-spam real dos formulários (hoje é stub controlado por flag).

  Leia primeiro:
  1. CLAUDE.md §19.5 (regra ao mexer em formulários — infra já existe, não reinventar)
  2. packages/lib/src/forms/hcaptcha.ts e rateLimit.ts
  3. apps/cms/src/app/(painel)/../entrar/recuperar (fluxo de recuperação de senha, hoje sem rate-limit)

  [HCAPTCHA_SITE_KEY/SECRET e o store de rate-limit já devem estar provisionados —
  confirme comigo antes de começar se não estiverem.]

  Implemente o siteverify real e o rate-limit persistente, cobrindo TODOS os endpoints
  de formulário público incluindo /entrar/recuperar.
  ```

---

## Janela D — CRM Fase B2 (motor de propostas)

A Fase B1 (registro/versionamento de propostas) está pronta e mergeada. Falta o que a torna útil de verdade: gerar o documento.

### Sessão D1 — Motor A4/PDF de proposta ✅ concluída (29/08/2026)

- **Entregue:** fatia vertical — capa + 3 seções (Identificação, Quadro Comercial, Condições Comerciais), tokens visuais do site (não a paleta do CRM legado), Playwright (dev local reaproveita o Chromium da raiz do monorepo; produção via `@sparticuz/chromium` na Vercel). PDF é gerado e salvo vinculado à proposta (campo `pdfGerado`, coleção dedicada `documentos-comerciais`, leitura restrita a usuário autenticado) — não é só download sob demanda. Plano: `docs/superpowers/plans/2026-08-29-crm-fase-b2-motor-pdf-propostas.md`. Branch `feat/crm-fase-b2-motor-pdf` mergeada na `main` (15 commits — 5 tasks do plano + 2 rounds de fix pós-revisão final whole-branch).
- **Não entregue nesta sessão (fica para D2):** as ~15 seções descritivas restantes do documento completo do legado (histórico institucional, metodologia etc.) — a Biblioteca Comercial (D2) é pré-requisito de conteúdo para elas.
- **Pendência de infraestrutura antes do go-live com dados reais de cliente (CLAUDE.md §19.3 item 4):** `documentos-comerciais` ainda cai no bucket público `ntc-portal-media` (compartilhado com `media`) até o PO criar um bucket privado no Supabase Storage e configurar `SUPABASE_BUCKET_PRIVADO` (`.env.example`). Mitigado com nome de arquivo não-adivinhável, mas não é `read`-privado de fato até o bucket existir.
- **Outras pendências levantadas na revisão final, não bloqueadoras:** `maxDuration` da função serverless não configurado (cold start do Chromium pode estourar o timeout padrão da Vercel — validar em deploy real); mismatch de versão do Node exigida por `@sparticuz/chromium` vs. o `engines` do repo (decisão de runtime da Vercel, não de código); fontes do cabeçalho/rodapé do PDF (não o corpo) seguem em fallback.

### Sessão D2 — Biblioteca Comercial + Textos-Padrão

- **Objetivo:** conteúdo institucional versionado ("Biblioteca-first") que o motor de proposta consome — textos padronizados, cláusulas, blocos reutilizáveis.
- **Escopo:** nova coleção(ões) no Payload; tela no grupo Catálogo Institucional ou um novo grupo "Biblioteca Comercial" (§19.3 item 11).
- **Pré-requisito:** D1 concluída (o motor precisa existir pra Biblioteca ter função).
- **Estimativa:** 1–2 sessões.

### Sessão D3 — Tela Condições

- **Objetivo:** fechar a última casca "Em breve" do grupo Operação Comercial.
- **Escopo:** entidade + tela de condições comerciais (pagamento, prazos, garantias) que a proposta referencia.
- **Pré-requisito:** nenhum, mas faz mais sentido depois de D1 (a proposta já precisa consumir Condições no PDF).
- **Estimativa:** 1 sessão.

### Sessão D4 — Orientações EventON

- **Objetivo:** módulo de orientações operacionais ligado ao evento/proposta (escopo do CRM legado ainda não replicado).
- **Pré-requisito:** avaliar se ainda é necessário — confirmar com o PO se esse recorte do legado segue relevante antes de codar (pode ter sido substituído por outro fluxo).
- **Estimativa:** a definir após confirmação de escopo.

---

## Janela E — Painel Admin: criação e configuração

Não bloqueia go-live, mas destrava produtividade do dia a dia da equipe.

### Sessão E1 — Criar conteúdo novo fora do CRM

- **Objetivo:** habilitar "Novo evento" e "Novo palestrante" no painel (hoje desabilitados).
- **Escopo:** replicar o padrão já usado no CRM (`FormCliente`/`FormOportunidade` + `CamposCrm`) pras coleções `eventos` e `especialistas`.
- **Pré-requisito:** nenhum.
- **Estimativa:** 1–2 sessões (um formulário de criação por entidade).
- **Prompt:**
  ```
  Vamos habilitar a criação de novo conteúdo pelo Painel Admin fora do CRM.

  Leia primeiro:
  1. O padrão de criação já usado no CRM: apps/cms/src/app/(painel)/crm/FormCliente.tsx
     e FormOportunidade.tsx + o componente CamposCrm
  2. apps/cms/src/app/(painel)/TelaEventos.tsx e TelaPalestrantes.tsx (botões hoje desabilitados)

  Comece por "Novo evento". Replique o padrão de formulário do CRM adaptado pra
  coleção eventos. Exponha o plano antes de codar (CLAUDE.md §8).
  ```

### Sessão E2 — Tela de Configurações real

- **Objetivo:** as seções "Segurança e acesso", "Integrações" e "Notificações" deixam de ser "Demonstrativo" e passam a persistir.
- **Escopo:** depende do que a Janela C já implementou (2FA real muda o que essa tela mostra). Fazer **depois** de C1.
- **Pré-requisito:** C1 concluída (2FA real) — senão a seção de Segurança fica pela metade de novo.
- **Estimativa:** 1 sessão.

### Sessão E3 — AuditLog

- **Objetivo:** a coleção `audit-log` já existe e está registrada no `payload.config.ts`, mas nenhum hook escreve nela — zero rastro de auditoria hoje.
- **Escopo:** hooks `afterChange`/`afterLogin` nas coleções editoriais + operacionais que gravam em `audit-log` (usuário, ação, entidade, metadata, ip).
- **Pré-requisito:** nenhum.
- **Estimativa:** 1 sessão.
- **Prompt:**
  ```
  Vamos ligar o AuditLog — a coleção existe (apps/cms/src/collections/AuditLog.ts,
  registrada no payload.config.ts) mas nenhum hook escreve nela hoje.

  Leia primeiro apps/cms/src/collections/AuditLog.ts e o payload.config.ts (lista de
  collections). Implemente hooks afterChange (criar/atualizar/publicar/despublicar/
  deletar) e um hook de login/logout, gravando usuário/ação/entidade/entidadeId/
  descricao/metadata/ip. Decida comigo se cobrimos todas as coleções editoriais de
  uma vez ou começamos por um subconjunto.
  ```

---

## Janela F — CRM Fase C (Financeiro)

Não iniciada. Contratos, Empenhos, NFs, Recebimentos, Comissões.

- **Pré-requisito:** decisão #4 do painel de decisões (escopo confirmado) + Janela D concluída (contratos nascem de propostas aceitas).
- **Estimativa:** a modelar depois da confirmação de escopo — provavelmente 4–6 sessões dado o tamanho (5 entidades novas + regras de negócio).
- Não escrever prompt de sessão ainda — falta a decisão de escopo pra não desperdiçar uma sessão modelando errado.

## Janela G — CRM Fase D (permissões por módulo)

Não iniciada. Inclui os grupos de menu "Biblioteca Comercial" e "Financeiro" que ainda não existem.

- **Pré-requisito:** Janelas D e F concluídas (não faz sentido desenhar permissões pra módulos que não existem ainda).
- **Estimativa:** 2–3 sessões.

---

## Janela H — Processo Comercial B2G (P0)

Acrescentada em 03/09/2026, a partir do protótipo `NTC_Comercial_Premium_v3.3_P0_CHECKPOINT.html`. Transforma o funil em processo governado: 11 estágios + situação, qualificação COM-04 versionada com score e hard gates, contratação com instrumentos, handoff obrigatório para Operações antes de "Ganha", histórico imutável e auditoria.

- **Documento próprio:** `docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md` — o que mudou no protótipo, a distância até o Payload, 7 sessões (H1–H7) com prompts, manual de migração de dados e riscos.
- **Ordem:** depois da Janela C, **antes** das Janelas F e G (a Janela F modela Contratos/Empenhos e o P0 já define `contratacao`/`instrumentos-formalizacao` — fazer F antes obriga a modelar duas vezes). A Janela D é independente e pode ser intercalada.
- **A Sessão H6 substitui a Sessão E3** deste roadmap (AuditLog) — não executar as duas.
- **Sessões:** **H1 (fundação: estágio/situação/histórico/migração) ✅ concluída (04/09/2026)** · **H2 (qualificação COM-04) ✅ concluída (07/09/2026)** · **H3 (porta de "Qualificada") ✅ concluída (07/09/2026)** · H4 (contratação e instrumentos) · H5 (handoff e porta de "Ganha") · H6 (integridade e auditoria) · H7 (navegação, dashboard, fila de revisão) · **H8** (reedição do Manual Operacional em v1.1 — única sessão sem código).
- **Critério de aceite da Janela:** o **Manual Operacional NTC-COM-CRM-01 v1.0** (aprovado para uso interno) foi conferido contra o código em 04/09/2026 e é fiel ao protótipo nas regras duras — seus §§18, 26, 28, 29 e 34 são a bateria de testes de H3–H6. As 8 divergências encontradas estão em `docs/17` §4.0, distribuídas em H1, H7 e H8. **Atenção:** o manual descreve o protótipo, não o Painel Admin — não circular como "manual do CRM" antes de H7 (risco R8).
- **Pré-requisito:** 7 decisões do PO listadas em `docs/17` §3, sendo a primeira fornecer a especificação `NTC_CRM_EspecificacaoTecnica_P0_v1.0_RELEASE`, que é citada no protótipo mas não está no repositório. A Sessão H4 depende especificamente da decisão #2 (ratificar o *Accountable* que formaliza), ainda pendente.

### Sessão H1 — Fundação: estágio, situação, histórico e migração ✅ concluída (04/09/2026)

- **Entregue:** `oportunidades` ganhou os campos `estagio` (11 estágios), `situacao` (3 valores), `migracaoPendenteRevisao` e `migracaoFlag`; `status` legado mantido, agora derivado por hook `beforeChange`; coleção nova `historico-estagio` (append-only por access control, gravada em hook `afterChange`); regras puras em `packages/lib/src/crm/funil.ts`; telas de Oportunidades (lista, formulário, detalhe com linha do tempo e aviso de estágio provisório); script `pnpm --filter @ntc/cms crm:migrar-p0` (dry-run por padrão, `CRM_MIGRACAO_APLICAR=1` para aplicar); importador do CRM legado gravando o funil novo. Detalhes completos, incluindo as divergências M1/M6 resolvidas em parte de sistema, em `docs/17` §4 (Sessão H1). Branch `feat/crm-janela-h1-funil-p0` — **ainda não mergeada na `main`** (execução via `subagent-driven-development` — 7 tasks do plano + 2 rounds de fix pós-revisão na task do modelo de dados).
- **Não entregue nesta sessão (fica para sessões seguintes da Janela H):** os gates de "Qualificada"/"Ganha" (H3/H5), as coleções de qualificação/contratação/handoff (H2/H4/H5), a tela da fila de revisão de migração (H7).
- **Pendências que ficaram:** checkpoint visual humano (`CLAUDE.md` §6) ainda não feito; banco de desenvolvimento com zero oportunidades — o dry-run do script de migração não teve dado real para exercitar, a primeira execução real será sem ensaio e exige backup antes; fila de revisão de migração ainda só filtro/coluna na listagem, sem tela própria (H7). **Atualização pós-H1:** Dashboard e gráficos foram antecipados da H7 e já leem `estagio`/`situacao` — o espelho `status` segue gravado, só a leitura mudou (M2 de `docs/17` §4.0 resolvida na parte de sistema).

---

### Sessões H2 e H3 — Qualificação COM-04 e a porta de "Qualificada" ✅ concluídas (07/09/2026)

- **Entregue:** coleção nova `avaliacoes-qualificacao` (20ª coleção do Payload) — 9 dimensões com nota inteira 0–3 e validação estrita, 7 hard gates de três estados, score 0–27 e faixa nos cortes 18/10 derivados e persistidos em hook `beforeChange`, `concluidaEm` automática, uma única avaliação `vigente` por oportunidade mantida em hook `afterChange` dentro da mesma transação do Payload; regras puras em `packages/lib/src/crm/qualificacao.ts` (16 testes), incluindo `avaliacaoPermiteQualificada` com as 10 condições e as mensagens literais do §18 do Manual Operacional; tela e formulário de Qualificação (`TelaQualificacao.tsx`/`FormAvaliacao.tsx`, 9 dimensões, 7 hard gates, score ao vivo como apoio à decisão — nunca decidindo por ela, §15 do manual) num terceiro grupo de menu "Processo Comercial B2G (P0)" em `ShellCrm.tsx`; avaliação parcial gravável em "Em preenchimento", completude só exigida ao concluir; gate do estágio Qualificada (`gateQualificada.ts`) em hook `beforeChange` de `oportunidades`, recusando a promoção — inclusive já criar a oportunidade em Qualificada — sem avaliação vigente que sustente, com a mensagem exata do §18 chegando ao formulário do painel em vez de um erro genérico. Detalhes completos em `docs/17` §4 (Sessões H2 e H3). Branch `feat/crm-janela-h2-h3-qualificacao` — **ainda não mergeada na `main`** (execução via `subagent-driven-development` — 4 tasks do plano).
- **Não entregue nestas sessões (fica para sessões seguintes da Janela H):** contratação e instrumentos (H4), handoff e a porta de "Ganha" (H5), integridade de exclusão e auditoria (H6), a tela da fila de revisão de migração (H7).
- **Pendências que ficaram:** `pnpm payload:push:schema` **não foi rodado** — a tabela `avaliacoes_qualificacao` ainda não existe no banco de desenvolvimento, então a coleção nunca foi exercitada contra dado real; falta um humano parar o dev, revisar o diff, responder `N` a qualquer DATA LOSS e rodar `payload:generate` depois. O checkpoint visual humano (`CLAUDE.md` §6) ainda não foi feito. A garantia de vigência única vale só dentro da transação do Payload — não há índice único parcial no Postgres, então duas escritas genuinamente concorrentes ainda poderiam persistir duas avaliações `vigente` para a mesma oportunidade (risco aceito por decisão). A Sessão H4 depende da ratificação do *Accountable* pelo PO (decisão #2 de `docs/17` §3).

---

## Housekeeping (não é produção, mas está pendente)

Registrado para não esquecer, não bloqueia nenhuma Janela acima:

- 9 branches locais 100% mergeadas na `main` (auditoria de 26/08) — candidatas a `git branch -d`, ficou bloqueado pelo classificador de permissão na sessão anterior.
- 5 PDFs "Folder · Módulo..." soltos na raiz — decisão #5 do painel acima.
- `feito/12_Pagina_Contato_v1.html` (não commitada) vs. `12_Pagina_Contato_v1.html` da raiz (já commitada) — nunca foi comparado; checar diff antes de decidir qual fica.
- `arquivos-fonte/` (movida e commitada em 27/08) ainda ocupa espaço em disco localmente — pode ser apagada da working tree quando o usuário quiser, o histórico do git preserva.

---

**Fim do roadmap.**
*Portal Grupo NTC · docs/16_Roadmap_CMS_CRM_v1.md · v1.0 · 27 de agosto de 2026 · Instituto NTC do Brasil*
