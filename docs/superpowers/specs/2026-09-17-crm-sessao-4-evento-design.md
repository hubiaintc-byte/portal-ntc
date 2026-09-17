# CRM — Sessão 4 (Evento comercial) · Adendo de design

**Data:** 17 de setembro de 2026
**Status:** aprovado em conversa com o PO (seções 1–4)
**Spec-mãe:** `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` (§3.4 `eventos-comerciais`, §3.8 `documentos-comerciais`, §4.4 modal, §4.5 cliente, §5.3 ações, §5.5 linha do tempo, §5.6 exclusão). Este adendo só registra o que a **inversão de ordem** (Sessão 4 antes das Sessões 2 e 3) muda e o que o spec deixava em aberto. Onde não diz nada, vale o spec-mãe.
**Precedência:** `CLAUDE.md` > spec-mãe > este adendo.

## 0. Por que a Sessão 4 vem antes

O PO aguarda o modelo de proposta que a Sessão 2 precisa; o evento não depende dele. A Sessão 3 (e-mail) também fica depois. Consequências, decididas em 17/09:

| # | Decisão |
|---|---|
| 1 | A **aba Ações** do modal nasce nesta sessão só com as ações de evento; "Criar proposta" (S2) e as ações de e-mail (S3) entram na mesma aba depois. |
| 2 | **Links de inscrição são só cadastro** (rótulo + URL, obtidos na plataforma externa e digitados). O botão "Enviar links de inscrição" e o e-mail são da Sessão 3. Salvar links **não** move o card; o PO arrasta para "Links enviados" quando mandar por fora. |
| 3 | As **regras de exclusão do spec §5.6** entram aqui (era o previsto). |
| 4 | **Sem `push:schema`**: o modelo já existe desde a Sessão 1. `eventos-comerciais.lead` passa de obrigatório para opcional só na validação do Payload (o adapter não emite `NOT NULL` para `required`, comprovado no push de 17/09). |

## 1. Aba Ações e o evento no modal

| Botão | Aparece quando | Faz | Move o card para |
|---|---|---|---|
| Agendar evento | lead ativo (não perdido) e sem evento `agendado` | formulário inline: título, data início/fim, modalidade, local, módulo do catálogo (opcional), observações → cria `eventos-comerciais` (`lead`, `cliente` do lead) | `evento-agendado` |
| Registrar contrato/empenho | há evento `agendado` | grupo `contratoEmpenho`: tipo, número, data, valor, arquivo (upload em `documentos-comerciais` com `evento` preenchido) | `contrato-recebido` |
| Links de inscrição | há evento `agendado` | lista editável rótulo + URL (adicionar/remover; URL validada http/https) | — |
| Marcar realizado | há evento `agendado` | `evento.status = realizado` | `evento-realizado` |
| Cancelar evento | há evento `agendado` | `evento.status = cancelado`; card **não** move | — |

- A aba mostra o **evento corrente** (o mais recente com `status = agendado`; se não há, o mais recente de qualquer status) com título, datas, modalidade, status, contrato registrado ou não, nº de links, nº de documentos; cada botão mostra o que já foi feito.
- Um lead pode ter mais de um evento: "Agendar evento" reaparece quando o corrente está `realizado`/`cancelado`; os anteriores ficam listados, só leitura.
- Cada ação que move o card grava **evento + lead na mesma transação** (helper `executarEmTransacao`, §4). Os pré-requisitos são avisos, nunca portas (spec §5.2): o card continua arrastável.
- Linha do tempo (tipo `evento`): "Evento agendado · <título>", "Contrato/empenho registrado · <tipo nº>", "Links de inscrição atualizados (N)", "Evento realizado", "Evento cancelado"; tipo `documento`: "Documento anexado · <nome>", "Documento removido · <nome>".

## 2. Eventos e documentos na página do cliente

O bloco Eventos de `DetalheCliente` vira o acervo: um card por evento (título, datas, modalidade, status, lead de origem — clique abre o modal), do mais recente ao mais antigo, com filtro todos / agendados / realizados / cancelados. Cada card expande para: contrato/empenho (tipo, número, data, valor, link para baixar o arquivo), links de inscrição (rótulo → URL, nova aba) e **documentos** — upload direto (arquivo + descrição) gravado em `documentos-comerciais` com `evento` e `descricao`, lista com nome, descrição, data, tamanho, baixar e remover. Sem tela própria de eventos (spec §4.1).

## 3. Exclusão e integridade (spec §5.6, detalhado)

- **Apagar lead** — botão no fim da aba Dados do modal. Se o lead tem evento, proposta ou envio de e-mail: confirmação dupla (digitar o nome do contato). Ao apagar: eventos, propostas e envios ficam com `lead` nulo (visíveis pelo cliente); a linha do tempo do cliente ganha um item `lead` "Lead apagado · <nome> (<órgão informado>, estava em <estágio>)"; os itens antigos ficam (o `lead` deles fica nulo). O Payload não apaga em cascata: a Server Action limpa os vínculos antes do `delete`.
- **Apagar cliente** — botão no detalhe, habilitado só sem leads e sem eventos (desabilitado explica "Tem N negócios e M eventos — apague ou revincule antes"). Ao apagar, a linha do tempo do cliente é apagada junto (única cascata), na mesma transação. Hook `beforeDelete` em `clientes-crm` repete a regra e falha fechado.
- **Apagar evento** — não existe; cancela-se. Documento do evento pode ser removido.
- Perfis: `super-admin` e `atendimento-comercial`.

## 4. Código

- `packages/lib/src/crm/eventos.ts` — `ACOES_EVENTO`, `acoesDeEvento(lead, eventoCorrente)`, `estagioDaAcaoEvento(acao)`, `eventoCorrente(eventos)`, `urlValida(url)`. `packages/lib/src/crm/exclusao.ts` — `podeApagarCliente({ numLeads, numEventos })`, `exigeConfirmacaoDupla({ numEventos, numPropostas, numEnvios })`, `tituloLeadApagado(...)`. Testes Vitest.
- `apps/cms/src/lib/crm/transacao.ts` — `executarEmTransacao(payload, usuario, fn)`: cria `req` com o usuário (`createLocalReq`), abre a transação (`initTransaction`), executa `fn(req)`, `commitTransaction`/`killTransaction`. Usado por todas as escritas compostas desta sessão e por `criarLeadManual` (fecha a dívida da Sessão 1).
- `apps/cms/src/lib/crm/linhaDoTempo.ts` — `entradasDoEvento` e `entradasDoDocumento` (puras) + hooks `registrarEventoNaLinhaDoTempo` / `registrarDocumentoNaLinhaDoTempo`; `apps/cms/src/lib/crm/exclusaoCliente.ts` — hook `beforeDelete` de `clientes-crm`.
- Escrita (`painelCrmEscrita.ts`): `agendarEvento`, `registrarContratoEmpenho`, `salvarLinksInscricao`, `marcarEventoRealizado`, `cancelarEvento`, `subirDocumentoEvento`, `removerDocumentoEvento`, `apagarLead`, `apagarCliente`. Actions correspondentes em `acoesCrm.ts` (sessão antes de tudo; upload via `FormData` como `enviarMidia`).
- Leitura (`painelCrm.ts`): `EventoComercialResumo` += `dataFimISO`, `clienteId`, `leadNome`, `contrato` (tipo, numero, dataISO, valor, arquivo {nome, url}) | null, `links[]`, `documentos[]` ({id, nome, descricao, url, tamanho, criadoEmISO}), `observacoes`; `LeadCrmDetalhe.eventos`; `ClienteCrmDetalhe.eventos` com o mesmo detalhe.
- Telas: `AbaAcoes.tsx`, `FormEvento.tsx`, `FormContrato.tsx`, `EditorLinks.tsx`, `EventosDoCliente.tsx`, `UploadDocumento.tsx`; `ModalLead` ganha a aba e o botão Apagar lead; `DetalheCliente` usa `EventosDoCliente` e ganha Apagar cliente. CSS no bloco CRM Kanban.
- Testes: regras puras, escrita (mocks), hooks. Telas no checkpoint visual. `pnpm lint/typecheck/test/build` verdes.

## 5. Fora do escopo

E-mail de links (S3), "Criar proposta" (S2), inscrição de participantes (externa), Dashboard por evento, apagar evento.
