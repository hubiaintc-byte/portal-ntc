# CRM — Sessão 3 (Fluxo da proposta) · Design

**Data:** 3 de outubro de 2026
**Status:** **rascunho — não brainstormado com o PO.** Escrito a pedido ("já escreva a sessão 3 com o fluxo") a partir do escopo que já estava documentado em `CLAUDE.md` §19.3 item 4 e no spec-mãe §8. As decisões abertas estão marcadas **[A DECIDIR]** e precisam do PO antes do plano.
**Spec-mãe:** `docs/superpowers/specs/2026-09-15-crm-fluxo-comercial-kanban-design.md` §8
**Depende de:** `2026-10-03-crm-sessao-2-documento-proposta-design.md` (Sessão 2 — documento)
**Precedência:** `CLAUDE.md` > spec-mãe > este spec.

## 0. Por que existe, e a renumeração

Em 03/10 o PO separou a Sessão 2 em duas: o **documento** fica na 2, o **fluxo** vem para cá. Com a Sessão 4 (Evento) já entregue em 21/09, a ordem passa a ser: **2 Documento · 3 Fluxo · 4 Evento (entregue) · 5 E-mail · 6 Automações** — o e-mail, que o spec-mãe §8 chamava de Sessão 3, desce para a 5.

**Depende da Sessão 2** para o botão "Criar proposta" levar a um documento que vale a pena gerar, mas o código não se sobrepõe: a 2 mexe no gerador de PDF, a 3 mexe em telas e KPI. Podem ser implementadas na ordem inversa se necessário.

## 1. O que entra

### 1.1. Wizard chamado do modal, já preenchido

Hoje "Nova proposta" só existe na tela Propostas, e o usuário escolhe lead e cliente do zero — mesmo tendo acabado de sair do card daquele lead.

Passa a existir **"Criar proposta"** na aba Ações do `ModalLead` (a aba que a Sessão 4 abriu). Ao acionar, o wizard abre com **lead, cliente e programa já preenchidos** a partir do lead: o lead é o próprio, o cliente é `lead.cliente`, e o programa vem de `lead.detalhesProposta.programa` quando o lead informou um.

`FormProposta` já tem a lógica de pré-preenchimento a partir do lead (`onMudar` do select de Lead preenche cliente e programa) — o que falta é abrir o formulário com esses valores já postos, sem passar pelo select.

**Lead sem cliente vinculado:** o botão aparece desabilitado, com a explicação de que a proposta exige cliente — mesmo padrão já usado em "Agendar evento" na Sessão 4.

### 1.2. "Criar proposta" move o card

Ao salvar a proposta criada por esse caminho, o lead vai para o estágio **`proposta-em-producao`**, e a transição entra na linha do tempo do cliente pelo helper único `registrarNaLinhaDoTempo`.

Segue o padrão da Sessão 4: a escrita composta (criar proposta + mover lead) roda em **uma transação** via `executarEmTransacao`, e o pré-requisito é **aviso, nunca porta** — o card continua arrastável (spec-mãe §5.2).

**[A DECIDIR]** Criar proposta pela tela Propostas (sem passar pelo modal) também move o card? A proposta carrega `lead`, então é possível. Mover sempre é mais coerente; mover só pelo modal é mais previsível.

### 1.3. Versões e Envios no detalhe da proposta

`DetalheProposta` hoje mostra a contagem de envios, mas não lista nem versões nem envios. A leitura já existe: `versoesDeProposta(codBase)` em `painelCrm.ts` e `PropostaDetalhe.envios`.

Passa a ter dois blocos: **Versões** (código, nº, data, valor líquido, status, motivo — com a vigente destacada) e **Envios** (data, canal, destinatários, status, observações). Ambos read-only nesta sessão; registrar envio já existe e continua onde está.

### 1.4. KPI "Valor em negociação"

Hoje soma `lead.valorEstimado` (`kpisComercial.ts:23`), um palpite digitado à mão. Passa a somar o **`valorLiquido` da proposta vigente** de cada lead ativo.

**[A DECIDIR]** O que fazer com lead ativo **sem** proposta: cair para `valorEstimado` (soma mista, nunca subestima, mas mistura duas unidades de confiança) ou contar zero (só dinheiro com proposta de verdade, KPI cai no dia da virada e precisa ser explicado). Minha leitura preferencial é a primeira, com o KPI exibindo a composição ("R$ X em propostas · R$ Y estimado"), mas é decisão do PO.

## 2. O que não entra

Enviar a proposta por e-mail e "Marcar aceita" (Sessão 5); edição de versão pela tela de Versões; gerar PDF (já existe desde a Fase B2 e ganha as 23 seções na Sessão 2); qualquer mudança no documento.

## 3. Modelo de dados

**Nenhum campo novo. Nenhum `payload:push:schema`.** Tudo que esta sessão precisa já existe: `propostas.lead`, `propostas.valorLiquido`, `propostas.vigente`, `leads.estagio`, e a leitura de versões e envios.

## 4. Código

- `packages/lib/src/crm/` — regra pura nova para a composição do KPI (soma de propostas vigentes + fallback), com testes.
- `apps/cms/src/lib/cms/kpisComercial.ts` — passa a receber as propostas vigentes.
- `apps/cms/src/lib/cms/painelCrm.ts` — `LeadCrmDetalhe` ganha o que o botão precisa saber (se já há proposta, e qual).
- `apps/cms/src/lib/cms/painelCrmEscrita.ts` — `criarPropostaDoLead`, compondo criação + transição em `executarEmTransacao`.
- `apps/cms/src/app/(painel)/acoesCrm.ts` — a Server Action correspondente, com `obterUsuarioAutenticado` antes de qualquer Local API e `revalidatePath("/crm")` no sucesso.
- `apps/cms/src/app/(painel)/crm/AbaAcoes.tsx` — o botão.
- `apps/cms/src/app/(painel)/crm/DetalheProposta.tsx` — os dois blocos.
- `ShellCrm.tsx` — abrir o wizard a partir do modal, com os valores iniciais.

## 5. Testes

Puros, com Vitest: a composição do KPI (com e sem proposta, vigente versus substituída); a decisão de habilitar o botão (lead sem cliente, lead que já tem proposta). Escrita: `criarPropostaDoLead` com mocks, provando que cria e move na mesma transação, e que falha fechado sem cliente. Telas: checkpoint visual.

## 6. Pendências antes do plano

1. **Brainstormar este spec com o PO** — ele foi escrito a partir do escopo documentado, não de conversa.
2. Resolver os dois **[A DECIDIR]**: mover o card quando a proposta nasce fora do modal (§1.2); comportamento do KPI para lead sem proposta (§1.4).
3. Confirmar que a Sessão 2 entrou, ou aceitar implementar na ordem inversa (§0).
