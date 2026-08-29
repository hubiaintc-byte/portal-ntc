# Roadmap — CMS e CRM do Portal Grupo NTC
## Do estado atual ao go-live · v1

**Versão:** 1.0 · 27 de agosto de 2026
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

### Sessão C1 — 2FA do admin (TOTP)

- **Objetivo:** exigir segundo fator (TOTP) no login de super-admin.
- **Escopo:** campo TOTP em `Users.ts` (secret + habilitado), fluxo de setup (QR code) em Configurações → Segurança, verificação no login (`/entrar`) via middleware custom com `otplib` — não há plugin oficial mantido pro Payload 3 (confirmado em 19/05/2026, `CLAUDE.md` §17.8). Trocar o toggle "Demonstrativo" da tela Configurações por um que persiste de verdade.
- **Fora do escopo:** 2FA obrigatório pra todo usuário (só super-admin por ora, conforme §17.8) — se quiser estender, é decisão à parte.
- **Pré-requisito:** nenhum — pode começar já.
- **Estimativa:** 1–2 sessões (setup + verificação + UI).
- **Prompt:**
  ```
  Vamos implementar 2FA (TOTP) no login do Painel Admin.

  Leia primeiro:
  1. CLAUDE.md §5.8 (zona sensível — não desabilite 2FA nem rotacione secrets sem ordem) e §17.8 (contexto: sem plugin oficial pro Payload 3, via middleware custom com otplib)
  2. apps/cms/src/collections/Users.ts
  3. A seção "Segurança e acesso" em TelaConfiguracoes.tsx (hoje é "Demonstrativo" — toggle sem persistência)

  Escopo desta sessão: TOTP obrigatório só para super-admin. Campo de secret em Users,
  fluxo de setup com QR code em Configurações, verificação no /entrar. Antes de codar,
  exponha o plano (§8) e as decisões técnicas que precisam da minha confirmação.
  ```

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

### Sessão D1 — Motor A4/PDF de proposta

- **Objetivo:** gerar o PDF formatado a partir do registro já existente em `propostas`/`versoes-proposta`.
- **Escopo:** motor de geração (avaliar lib de PDF compatível com a stack — decisão técnica a expor antes de codar, §5.4 proíbe libs fora da stack aprovada sem perguntar), 4 templates conforme o CRM legado.
- **Referência:** `NTC_Comercial_Premium.html` (raiz do repo) é a fonte de design do CRM legado — layout e conteúdo dos documentos.
- **Pré-requisito:** nenhum técnico; útil ter o `NTC_Comercial_Premium.html` como referência à mão.
- **Estimativa:** 2–3 sessões (é o maior bloco do roadmap).
- **Prompt:**
  ```
  Vamos implementar o motor de geração de PDF das propostas do CRM (Fase B2).

  Leia primeiro:
  1. docs/superpowers/specs/2026-07-22-crm-fase-b1-propostas-design.md (o que a B1 já entregou)
  2. apps/cms/src/collections/Propostas.ts, VersoesProposta.ts
  3. NTC_Comercial_Premium.html (raiz) — referência de design dos 4 templates do CRM legado

  Escopo: gerar o documento A4 formatado a partir de uma versão de proposta existente,
  com os 4 templates do legado. Antes de codar, proponha a lib de geração de PDF
  (fora da stack aprovada — precisa da minha aprovação, CLAUDE.md §5.4) e exponha o plano.
  ```

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

## Housekeeping (não é produção, mas está pendente)

Registrado para não esquecer, não bloqueia nenhuma Janela acima:

- 9 branches locais 100% mergeadas na `main` (auditoria de 26/08) — candidatas a `git branch -d`, ficou bloqueado pelo classificador de permissão na sessão anterior.
- 5 PDFs "Folder · Módulo..." soltos na raiz — decisão #5 do painel acima.
- `feito/12_Pagina_Contato_v1.html` (não commitada) vs. `12_Pagina_Contato_v1.html` da raiz (já commitada) — nunca foi comparado; checar diff antes de decidir qual fica.
- `arquivos-fonte/` (movida e commitada em 27/08) ainda ocupa espaço em disco localmente — pode ser apagada da working tree quando o usuário quiser, o histórico do git preserva.

---

**Fim do roadmap.**
*Portal Grupo NTC · docs/16_Roadmap_CMS_CRM_v1.md · v1.0 · 27 de agosto de 2026 · Instituto NTC do Brasil*
