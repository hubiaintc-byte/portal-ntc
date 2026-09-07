# Migração P0 — Processo Comercial B2G no CRM do Portal Grupo NTC
## O que mudou no protótipo (v3.0 → v3.3 P0) e como levar isso para o Payload · v1

**Versão:** 1.1 · 4 de setembro de 2026
**Base:** diff verificado linha a linha entre `NTC_Comercial_Premium.html` (v3.0, 4.478 linhas) e `NTC_Comercial_Premium_v3.3_P0_CHECKPOINT.html` (4.907 linhas), somado ao estado real do CRM em `apps/cms` lido em código; a partir da v1.1, também o **Manual Operacional NTC-COM-CRM-01 v1.0 FINAL** conferido contra o mesmo código (§4.0).

### Histórico de revisões

- **v1.1 — 04/09/2026** — conferência do Manual Operacional NTC-COM-CRM-01 v1.0 FINAL contra o código do protótipo: as regras duras batem, 7 divergências registradas (§4.0). As de sistema foram distribuídas nas sessões H1 e H7; as de texto/captura viraram a **Sessão H8** (reedição do manual em v1.1). Decisão #2 do PO passa de "definir" para "ratificar" — o manual já firma o *Accountable*. Autenticação sai da lista de pendências do P0: o portal já usa e-mail + senha e o 2FA está em andamento na Janela C.
- **v1.0 — 03/09/2026** — versão original.
**Companheiro de:** `docs/16_Roadmap_CMS_CRM_v1.md` (mesmo formato — Janela → Sessão → prompt pronto pra colar). Este documento **acrescenta a Janela H** ao roadmap; não substitui nenhuma das existentes.
**Precedência:** `CLAUDE.md` continua acima deste documento. Nenhuma coleção nova aqui descrita deve ser criada sem aprovação explícita do PO (`CLAUDE.md` §5.1).

---

## 0. Sumário executivo

O protótipo `NTC_Comercial_Premium_v3.3_P0_CHECKPOINT.html` não é uma nova versão do CRM: é a **v3.0 intacta mais uma camada nova acoplada no fim do arquivo** (bloco `P0_SETUP`, 415 linhas). O diff é de 18 linhas removidas contra 447 adicionadas — nada de P1 foi reescrito.

Essa camada troca o eixo do sistema. O CRM v3.0 registra *o que aconteceu* (status livre, editável, sem consequência). O P0 transforma o funil em **processo governado**: 11 estágios com portas de entrada verificáveis, qualificação formal versionada com score e hard gates, contratação com instrumentos, handoff obrigatório para Operações antes de declarar uma oportunidade Ganha, histórico imutável de transições e trilha de auditoria.

Em uma frase: **deixa de ser possível "marcar como Ganha" — passa a ser preciso comprovar.**

Consequência prática para o portal: o modelo de dados de `oportunidades` no Payload muda, cinco entidades novas aparecem, um perfil de usuário novo aparece (Operações) e há uma migração de dados dos registros existentes que **não é totalmente automatizável** — parte exige revisão humana da direção.

---

## 1. O que mudou no protótipo

### 1.1. Modelo do funil: um campo `status` vira dois campos ortogonais

O v3.0 tinha um único `status` com 8 valores misturando posição no funil e desfecho ("Em negociação" e "Perdida" no mesmo enum). O P0 separa:

| Eixo | Campo | Valores |
|---|---|---|
| Posição no funil | `estagio` | Mapeada · Prospecção / Relacionamento · Demanda Identificada · Qualificada · Diagnóstico Realizado · Solução em Construção · Proposta em Elaboração · Proposta Enviada · Negociação / Tramitação · Contratação em Formalização · Ganha |
| Desfecho | `situacao` | Ativa · Perdida · Adiada / Nurturing |

- O `status` antigo **não foi removido** — segue no schema marcado `/* status legado: DEPRECATE FUTURE */` e é preenchido automaticamente pela função `p0LegacyStatus(estagio, situacao)` a cada save, para que o dashboard e os gráficos da v3.0 continuem funcionando sem regressão.
- As colunas da lista de Oportunidades mudaram: saíram `qtd`, `prob` e `status`; entraram `estagio` e `situacao`.

### 1.2. Cinco entidades novas (mais duas de sistema)

`DB_VERSION` subiu de 3 para 5 e o array `STORES` ganhou seis nomes.

| Entidade | Função | Campos-chave |
|---|---|---|
| `avaliacoes_qualificacao` | Qualificação COM-04, versionada por oportunidade | 9 notas 0–3 · `score_total` (0–27, computado) · `faixa` (Forte ≥18 / Intermediário ≥10 / Fraco) · 7 hard gates · `resultado` · `justificativa` · `proximo_passo` · `vigente` |
| `contratacao` | Agregador 1:1 com a oportunidade | `status` (Em formalização / Formalizada / Cancelada) · `formalizada_em` · `formalizada_por` · `proposta_final` · `observacao_formalizacao` |
| `instrumentos_formalizacao` | Documentos que sustentam a contratação | `tipo` (Contrato / Empenho / Termo / Aditivo / Substituição / Documento equivalente) · `numero` · `data` · `valor` · `status` (Vigente / Substituído / Anulado) · `link` |
| `handoff` | Passagem Comercial → Operações | escopo · valores · cronograma · contatos · entregáveis · especialistas · tecnologia · relatórios · certificados · riscos · pendências · `status_handoff` · `data_aceite` · `usuario_aceite` |
| `historico_estagio` | Trilha imutável de transições | `estagio_anterior` · `estagio_novo` · `data_hora` · `usuario` · `motivo` |
| `p0_auditlog` | Trilha de auditoria do P0 | `ts` · `usuario` · `entidade` · `acao` · `antes` · `depois` |

As duas últimas são **system-only e append-only**: a constante `P0_SYSTEM_ONLY` as remove das permissões de escrita e exclusão de **todos** os perfis, inclusive Administrador.

**As 9 dimensões da qualificação:** necessidade · aderência · prioridade · timing · caminho de contratação · stakeholders · orçamento/capacidade · risco (régua invertida) · valor estratégico.

**Os 7 hard gates** (cada um `Sim` / `Não` / `Em validação`): ausência total de aderência · risco jurídico/compliance impeditivo · condição comercial inviável · incapacidade estrutural insanável · demanda inexistente · requisito não atendível · violação de integridade.

### 1.3. Regras de negócio executáveis (o coração do P0)

Um guard central (`p0Guard`) foi ancorado no save genérico do CRM, e um `p0CanDelete` no delete genérico. As regras:

**Porta do estágio "Qualificada"** — dez condições, todas verificadas: existe avaliação `vigente`; ela está `Concluída`; as 9 notas estão preenchidas; o score foi calculado; os 7 hard gates foram avaliados; nenhum está `Sim`; nenhum está `Em validação`; o `resultado` é `Qualificada`; há justificativa; há próximo passo.

**Porta do estágio "Ganha"** — a contratação vinculada precisa estar `Formalizada` **e** o handoff precisa estar `Aceito` com `data_aceite` e `usuario_aceite` preenchidos. Não existe caminho automático para Ganha.

**Formalizar uma contratação** — exige perfil autorizado (hoje: Administrador, como stand-in do papel *Accountable* de GOV-04, marcado `[VALIDAR]` no próprio código), data e responsável preenchidos, e **ao menos um instrumento de formalização vinculado**.

**Aceitar um handoff** — só Operações ou Administrador; exige data, usuário, responsável de Operações e contratação já `Formalizada`.

**Cardinalidades** — uma contratação por oportunidade; um handoff por contratação; uma avaliação `vigente` por oportunidade.

**Integridade de exclusão** (`p0CanDelete`) — bloqueia apagar: contratação com instrumentos ou handoff; instrumento vinculado a contratação formalizada (usar status `Anulado`/`Substituído`); handoff aceito; avaliação concluída ou histórica (usar status `Cancelada`); oportunidade com qualquer dependente P0.

### 1.4. RBAC: perfil novo e separação de funções

Perfil **Operações** criado (`USR-007`, `operacoes@institutontc.com.br`). A separação é deliberada e é a espinha do controle:

| Perfil | Ganha o quê no P0 | Ação especial |
|---|---|---|
| Administrador | tudo (respeitando GOV-04 no negócio) | **formaliza** |
| Comercial | avaliações, contratação, instrumentos, handoff (prepara) | **não** formaliza, **não** aceita handoff |
| Revisor | avaliações | validação técnica |
| Financeiro | instrumentos de formalização | — |
| **Operações** | handoff | **aceita/rejeita handoff** |
| Consulta | — | — |
| (sistema) | histórico de estágio · audit log | append-only |

Quem vende não formaliza e não dá o aceite de entrega. É o que impede a oportunidade de virar Ganha por vontade do vendedor.

### 1.5. Migração de dados com revisão humana obrigatória

`migrateP0()` roda no boot, é idempotente (pula quem já tem `estagio`) e converte o status legado. O ponto importante: **cinco dos oito status antigos são ambíguos** e o registro migrado fica marcado `migracao_pendente_revisao = true` com uma flag `[VALIDAR COM A DIREÇÃO]`. Existe até uma função de fila (`p0FilaRevisaoMigracao`) para listar o que precisa de revisão.

| Status v3.0 | → Estágio | → Situação | Revisão? | Motivo |
|---|---|---|---|---|
| Em qualificação | Demanda Identificada | Ativa | **sim** | confirmar se já havia avaliação |
| Apresentação institucional | Prospecção / Relacionamento | Ativa | não | — |
| Proposta enviada | Proposta Enviada | Ativa | não | — |
| Em negociação | Negociação / Tramitação | Ativa | não | — |
| Aprovada | Contratação em Formalização | Ativa | **sim** | aceite ≠ Ganha |
| Contratada | Contratação em Formalização | Ativa | **sim** | Ganha só com handoff aceito |
| Perdida | Mapeada | Perdida | **sim** | estágio anterior desconhecido — `Mapeada` é fallback técnico, **não** verdade histórica |
| Cancelada | Mapeada | Perdida | **sim** | pode ser Perdida, Adiada ou cancelamento administrativo |

### 1.6. Camada jurídica

- `seedNeutralizeEDUTEC()` substitui o texto de segurança jurídica de dois registros da biblioteca (`BIB-EDUTEC-PROG-V1`, `BIB-EDUTEC-M01-V1`) por uma redação neutra que **não presume a modalidade de contratação** — atribui ao órgão contratante a definição da hipótese legal.
- `p0ScanJuridico()` varre `biblioteca` e `textos_padrao` procurando "art. 74/75", "inexigibilidade", "dispensa", "contratação direta". **Só reporta no audit log** — não altera nada fora do escopo declarado.

### 1.7. Navegação e correções incidentais

- Novo grupo de menu **"Processo Comercial B2G (P0)"**, inserido como 2º grupo: Qualificação (COM-04) · Contratações · Instrumentos · Handoff · Histórico de Estágio.
- Rótulos de versão atualizados para "v3.3 P0 QA" e "v3.3 P0 (CHECKPOINT)".
- Fix incidental: o regex de `slug` estava com os combining marks escritos literalmente e passou a usar o escape `\u0300-\u036f` (a mesma correção cabe em `slugDeRotulo()`, em `packages/lib/src/crm/listas.ts`, que tem o mesmo padrão literal).

---

## 2. Distância entre o protótipo e o CRM do portal

O protótipo é um HTML único sobre IndexedDB. O portal é Payload 3 sobre Postgres (Supabase). O que se traduz e o que muda de forma:

| Item do P0 | Estado hoje em `apps/cms` | Como traduzir |
|---|---|---|
| Enums do funil | `STATUS_OPORTUNIDADE` em `packages/lib/src/crm/listas.ts` (8 valores, slugificados) | novos `ESTAGIO_OPORTUNIDADE` e `SITUACAO_OPORTUNIDADE` no mesmo arquivo, via helper `opcoes()`; `STATUS_OPORTUNIDADE` fica como legado |
| `estagio` / `situacao` | não existem — `Oportunidades.ts` tem só `status` | dois campos `select` novos + `status` mantido preenchido por hook |
| Guard central `p0Guard` | não existe | hooks `beforeChange`/`beforeValidate` por coleção (Payload não tem "save genérico" — cada regra vai na sua coleção) |
| `p0CanDelete` | não existe; `delete` de oportunidades já é `superAdmin` | `access.delete` + hook `beforeDelete` com as checagens de dependência |
| Transação atômica da avaliação vigente | IndexedDB `transaction()` | `req.transactionID` do Payload (Postgres) — mais simples e mais seguro que no protótipo |
| `p0_auditlog` | **já existe equivalente**: coleção `audit-log`, append-only por access control (`create/update/delete` = `false`), registrada no config e **sem nenhum hook escrevendo** | **não criar coleção nova** — usar `audit-log` via Local API e fechar de vez a Sessão E3 do roadmap |
| Perfil Operações | perfis atuais: `super-admin`, `editor-institucional`, `editor-eventos`, `atendimento-comercial` | novo valor `operacoes` no campo `perfil` de `Users.ts` + novo access helper |
| Papel "Accountable" (formaliza) | não existe | decisão do PO — hoje o stand-in do protótipo é "Administrador" e está marcado `[VALIDAR]` |
| Neutralização jurídica EDUTEC | a Biblioteca Comercial **ainda não existe** no portal (Sessão D2, não iniciada). O texto com presunção de modalidade está no **site público** (`apps/web/.../conteudoOGrupo.ts`, `conteudoCapacitacao.ts`, `conteudoSIGS/PROSUS/PROAPS.ts`) | **fora do escopo de código**: é decisão editorial/jurídica do PO (`CLAUDE.md` §5.3). Este documento apenas registra os arquivos onde o texto está |
| Menu "Processo Comercial B2G" | `ShellCrm.tsx` tem 2 grupos (`NAV_OPERACAO`, `NAV_CATALOGO`) | 3º grupo, mesmo padrão |
| Migração de status | importador legado (`importadorCrm.ts`) grava `status` slugificado | script de migração dedicado + coluna de revisão pendente |

**Coleções após a Janela H:** 18 → 23 (`avaliacoes-qualificacao`, `historico-estagio`, `contratacao`, `instrumentos-formalizacao`, `handoff`).

---

## 3. Decisões do PO antes de abrir a primeira sessão

Estas **não são tarefas de código**. Sem elas, a sessão correspondente para no meio.

| # | Decisão | Bloqueia | Por que não pode ser decidida por um agente |
|---|---|---|---|
| 1 | Fornecer a especificação `NTC_CRM_EspecificacaoTecnica_P0_v1.0_RELEASE` (citada no protótipo, **não está no repositório**) e colocá-la em `docs/` | H1 em diante | é a fonte de verdade do P0; o protótipo é a implementação, não a spec |
| 2 | **Ratificar** o *Accountable* que formaliza (GOV-04). O protótipo chutou "Administrador" e marcou `[VALIDAR]`; o **manual §26/§38 já firma** "Administrador no P0", separando permissão de sistema de competência institucional. Falta o aval formal da Direção | H4 | define RBAC de um ato com efeito contratual |
| 3 | Confirmar se o perfil **Operações** entra agora ou se o aceite de handoff fica com super-admin na v1 | H5 | cria perfil de usuário novo no portal |
| 4 | Revisar a fila de migração (as ~5 categorias de status ambíguos) oportunidade por oportunidade | H1 (encerramento) | é verdade histórica do negócio, não dado derivável |
| 5 | Decidir se oportunidade **nunca mais** pode ser excluída (ver risco R1 em §6) | H6 | política de dados, não implementação |
| 6 | Encaminhar ao jurídico a varredura de presunção de modalidade no **site público** (arquivos listados em §2) | nada de código | conteúdo institucional aprovado (`CLAUDE.md` §5.3) |
| 7 | Confirmar se as 9 dimensões, os 7 hard gates e os cortes de faixa (18 / 10) são os oficiais | H2 | régua de decisão comercial |

**Autenticação não é decisão pendente aqui.** O manual marca o acesso como `[VALIDAR COM TI/DESENVOLVIMENTO]` porque no protótipo se entra por seleção de usuário, sem senha. No portal isso já está resolvido — e-mail + senha com sessão do Payload — e o 2FA está em andamento na **Janela C · Sessão C1** (`docs/16`). A pendência é da Janela C, não da H; o que a Janela H herda é só a obrigação de corrigir o texto do manual (§4.0, M8).

---

## 4. Janela H — Processo Comercial B2G (P0)

**Onde entra na ordem do `docs/16`:** depois da Janela C (segurança, bloqueador de go-live) e **antes** das Janelas F e G. Razão: a Janela F (Financeiro) modela Contratos e Empenhos, e o P0 já define `contratacao` + `instrumentos_formalizacao` — fazer F antes significa modelar duas vezes e depois reconciliar. A Janela D (D2 Biblioteca, D3 Condições) é independente e pode ser intercalada.

Cada sessão abaixo é de 60–90 minutos (`CLAUDE.md` §6), tem critério de aceite verificável e termina com `pnpm --filter @ntc/cms typecheck` + `test` + checkpoint visual humano.

---

### 4.0. O Manual Operacional NTC-COM-CRM-01 é o critério de aceite desta Janela

O **Manual Operacional do NTC Comercial Premium** (documento `NTC-COM-CRM-01`, v1.0 FINAL, 48 seções, 13 capturas, Set/2026) documenta o processo P0 na linguagem de quem opera. Ele foi conferido contra o código do protótipo em 04/09/2026 — não por amostragem, mas regra a regra.

**Resultado da conferência:** o manual é fiel ao protótipo nas regras duras. Batem exatamente: os 11 estágios e sua ordem; as 3 situações e a separação estágio × situação; as 9 dimensões com notas inteiras 0–3 e a validação estrita; o score 0–27 e as faixas nos cortes 18 e 10; os 7 hard gates com os três estados e `Em validação` bloqueando igual a `Sim`; **as 10 condições de "Qualificada"**, cujas mensagens de bloqueio no §18 são literalmente as strings do código; a regra de formalização; a regra de aceite do handoff; a regra de "Ganha"; a tabela de RBAC do §6 (incluindo `delete: []` para todo perfil que não é Administrador e a linha "(sistema)" append-only); os 6 grupos de menu na ordem; os campos obrigatórios de Clientes e Contatos; e as listas de status de envio, tipos de instrumento e estados/resultados da avaliação.

**Consequência prática:** os §§18, 26, 28, 29 e 34 do manual são a bateria de testes das sessões H3, H4, H5 e H6. Implementar a Janela H é fazer o Painel Admin se comportar como esse manual descreve — inclusive nas mensagens de erro, que a equipe será treinada a reconhecer.

**Ressalva de escopo:** o manual descreve o **protótipo**, não o Painel Admin. Antes da Janela H, quase nada dele se aplica ao que a equipe abre hoje em `/crm` (ver §2). Enquanto H não fechar, ele não deve circular como "manual do CRM" sem o carimbo de sistema-base — ver risco R8 em §6.

#### Divergências registradas (conferência de 04/09/2026)

| # | Divergência | Natureza | Onde se resolve |
|---|---|---|---|
| M1 | **A migração não aparece no manual.** `migrateP0` marca `migracao_pendente_revisao` em 5 dos 8 status antigos, e para *Perdida*/*Cancelada* grava `Mapeada` — que o próprio código chama de "fallback técnico, NÃO verdade histórica". O manual §11 ensina o oposto ("Mapeada = oportunidade identificada, ainda sem trabalho ativo"), e a fila de revisão (`p0FilaRevisaoMigracao`) existe só no console, sem tela. Quem seguir o manual lê oportunidade perdida migrada como oportunidade nova no topo do funil | sistema + texto | **H1** (flag e motivo) ✅ concluído 04/09/2026 — **H7** (tela da fila), **H8** (seção nova no manual) seguem pendentes |
| M2 | **O Dashboard não mostra os 11 estágios.** O gráfico "Funil de Oportunidades" estava com os 6 status legados *hardcoded* e lia o espelho `status`. O §33 do manual lista como limitação apenas o "aging detalhado" — não avisa que o painel estava num eixo diferente do funil que o próprio manual ensina | sistema + texto | **H1** (dashboard migrado para estagio/situacao) ✅ concluído 04/09/2026 — **H8** (§33) |
| M3 | **A Figura 4 é captura da v3.0 e a legenda afirma o contrário.** A legenda diz "as colunas «Estágio» e «Situação» aparecem separadas"; a imagem mostra `QTD. EST. · VALOR · PROB. · STATUS` com valores legados — que são os `listCols` da v3.0 | captura | **H8** |
| M4 | **§10 sub-declara os campos obrigatórios da Oportunidade.** Cita só "Cliente é obrigatório"; no sistema também são obrigatórios **Programa, UF, Origem da demanda, Data de abertura e Responsável comercial** | texto | **H8** (e **H1** define os `required` de fato no Payload) |
| M5 | **§16, redação.** Diz que um hard gate "Sim" bloqueia concluir a avaliação; o sistema não impede concluir — bloqueia o **estágio** Qualificada. O §18 está correto | texto | **H8** |
| M6 | **§30 promete "por quem" e o histórico migrado mostra "—".** As linhas de migração gravam `usuario: 'migracao'`, que não resolve para nenhum usuário cadastrado (visível na própria Figura 10) | sistema | **H1** ✅ concluído 04/09/2026 |
| M7 | **O campo `status` legado continua sendo gravado por trás e o manual não menciona.** Quem exportar os dados encontra dois campos representando a mesma coisa | texto | **H8**; some quando o espelho for removido (sessão própria pós-H7) |
| M8 | **Autenticação.** O manual descreve acesso por seleção de usuário sem senha e marca `[VALIDAR COM TI/DESENVOLVIMENTO]`. No portal já é e-mail + senha, com 2FA em andamento na Janela C | texto | **H8** (o trabalho de código é da Janela C) |

#### Lacunas do manual em relação ao que o portal já tem

Não são erros do manual — ele documenta o protótipo, e o protótipo não tem essas telas. Mas a reedição (H8) precisa cobri-las, senão o manual sai incompleto para quem usa o Painel Admin:

- **Leads** é uma tela real do grupo Operação Comercial do portal e não existe no manual.
- **Geração do PDF da proposta** (Fase B2, botão "Gerar PDF", documento salvo e vinculado à proposta) não é descrita — o §20 fala apenas em "Links (HTML/PDF/pasta)".
- **Condições** é tela funcional no protótipo e casca "Em breve" no portal até a Sessão D3.
- **Biblioteca Comercial** (§21) e **Financeiro** (§32) descrevem grupos inteiros que só existirão depois das Janelas D2 e F.

---

### Sessão H1 — Fundação: estágio, situação, histórico e migração ✅ concluída (04/09/2026)

- **Objetivo:** `oportunidades` passa a ter `estagio` + `situacao`, com histórico imutável de transições, sem quebrar nenhuma tela existente.
- **Escopo:**
  - `packages/lib/src/crm/listas.ts`: `ESTAGIO_OPORTUNIDADE` (11), `SITUACAO_OPORTUNIDADE` (3), e `estagioLegado()` (espelho `p0LegacyStatus`).
  - `apps/cms/src/collections/Oportunidades.ts`: campos `estagio` (required), `situacao` (required, default Ativa), `migracaoPendenteRevisao` (checkbox) e `migracaoFlag` (text); `status` mantido, marcado como legado na `admin.description`, preenchido em `beforeChange`.
  - Nova coleção `HistoricoEstagio.ts` — append-only por access (`create` só via Local API interna, `update`/`delete` = `false`), gravada em hook `afterChange` quando `estagio` muda.
  - UI: `TelaOportunidades.tsx` (colunas), `FormOportunidade.tsx` (dois selects no lugar de um), `DetalheOportunidade.tsx` (selo + timeline do histórico), `seloStatus.ts` (mapa de selo por estágio/situação).
  - `GraficosComercial.tsx` e `TelaPainelComercial.tsx` seguem lendo `status` (espelho) — **não** mexer nesta sessão.
  - Script `scripts/migrar-oportunidades-p0.ts` com `DRY_RUN=1` por padrão, aplicando a tabela de §1.5 e marcando revisão pendente.
  - **Divergência M1 (metade de sistema):** a oportunidade migrada precisa ser legível como migrada na própria tela — `migracaoPendenteRevisao` visível no detalhe e na lista (selo), e `migracaoFlag` exibida com o texto `[VALIDAR COM A DIREÇÃO]` do script. `Mapeada` vindo de *Perdida*/*Cancelada* é fallback técnico e não pode aparecer como estágio comum.
  - **Divergência M6:** o histórico gerado pela migração não pode sair sem autor. Gravar o ator num campo de texto próprio (ex.: `atorSistema: "migração automática"`) em vez de um `relationship` para um usuário inexistente — no protótipo, `usuario: 'migracao'` não resolve e a coluna aparece vazia.
- **Pré-requisito:** decisão #1 do PO.
- **Critério de aceite:** `pnpm payload:push:schema` aplicado com o dev parado e diff revisado (respondendo `N` a DATA LOSS); dry-run do script listando 100% das oportunidades com destino e flag; nenhuma tela do CRM quebrada; histórico gravado ao trocar estágio pela UI; toda linha de histórico — inclusive a da migração — exibe um autor legível (M6); oportunidade migrada de *Perdida*/*Cancelada* aparece marcada como pendente de revisão (M1).
- **Prompt:**
  ```
  Vamos abrir a Janela H (P0 — Processo Comercial B2G) do CRM. Sessão H1: fundação do modelo.

  Leia primeiro:
  1. docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md §1.1, §1.5, §2 e a Sessão H1 em §4
  2. apps/cms/src/collections/Oportunidades.ts e packages/lib/src/crm/listas.ts
  3. apps/cms/src/app/(painel)/crm/{TelaOportunidades,FormOportunidade,DetalheOportunidade}.tsx e seloStatus.ts

  Escopo desta sessão: só estágio + situação + histórico de estágio + script de migração
  com dry-run. NÃO implemente ainda os gates de Qualificada/Ganha (H3/H5) nem as coleções
  de contratação (H4). Mantenha o campo status preenchido como espelho legado para não
  quebrar o Dashboard e os gráficos. Exponha o plano antes de codar (CLAUDE.md §8) e me
  chame antes de rodar payload:push:schema.
  ```
- **Entregue:** branch `feat/crm-janela-h1-funil-p0`, **ainda não mergeada na `main`**; execução via `subagent-driven-development` — 7 tasks do plano (as tasks 3, 4 e 5 num dispatch único) + 2 rodadas de correção pós-revisão na task do modelo de dados. Dois `payload:push:schema` aplicados no banco de desenvolvimento sem prompt de DATA LOSS, `payload:generate` rodado depois de cada um. `pnpm lint`, `typecheck`, `test` e `build` verdes no monorepo inteiro (138 testes no cms, 25 em `@ntc/lib`). As divergências **M1** e **M6** de §4.0 têm sua parte de sistema resolvida aqui: `migracaoPendenteRevisao`/`migracaoFlag` tornam a oportunidade migrada legível como migrada na própria tela, e o histórico de migração grava um ator legível (`atorSistema: "migração automática"`) em vez do `usuario: 'migracao'` que não resolvia no protótipo — a parte de tela da M1 (fila de revisão como tela de trabalho da Direção) continua pendente para a **H7**.
- **Pendências que ficaram:** o checkpoint visual humano (`CLAUDE.md` §6) ainda não foi feito. O banco de desenvolvimento tem zero oportunidades — o dry-run do script de migração reportou 0 registros, então nunca foi exercitado contra dado real; a primeira execução com dado de verdade será sem ensaio e exige backup antes (§5). A fila de revisão de migração (`migracaoPendenteRevisao`) segue sem tela própria, só filtro/coluna na listagem — vira tela de trabalho na **H7**. O campo `status` legado continua sendo gravado como espelho até a H7 migrar Dashboard e gráficos; nesta sessão eles não foram tocados (M2, sem mudança aqui). **Atualização pós-H1 (onda de decisões do PO):** Dashboard e gráficos foram antecipados da H7 — `kpisComercial.ts`, `TelaPainelComercial.tsx` e `GraficosComercial.tsx` já leem estágio + situação, porque o espelho legado devolvia ao pipeline aberto os negócios migrados de *Contratada*. O espelho segue gravado; o que caiu foi a leitura dele.

---

### Sessão H2 — Qualificação COM-04 (avaliações versionadas) ✅ concluída (07/09/2026)

- **Objetivo:** registrar a qualificação formal, com score, faixa e hard gates.
- **Escopo:** coleção `avaliacoes-qualificacao` (campos de §1.2); validação estrita das notas (inteiros 0–3, nada de string ou decimal); `scoreTotal` e `faixa` derivados em hook `beforeChange` (persistidos para permitir ordenação/filtro, ao contrário do protótipo que computa na tela); unicidade da avaliação `vigente` por oportunidade dentro da transação do Payload (`req.transactionID`); `concluidaEm` preenchida automaticamente ao concluir; tela + formulário no padrão `FormOportunidade`/`CamposCrm`.
- **Fora do escopo:** o gate que bloqueia o estágio Qualificada (é H3).
- **Pré-requisito:** H1 + decisão #7.
- **Critério de aceite:** teste unitário do score (0, 27, incompleto → `null`) e da faixa nos cortes 18 e 10; teste de que salvar uma segunda avaliação `vigente` desmarca a anterior **na mesma transação**; nota `2.5` ou `"3 "` rejeitada.
- **Entregue:** branch `feat/crm-janela-h2-h3-qualificacao`, **ainda não mergeada na `main`**; execução via `subagent-driven-development`. Regras puras em `packages/lib/src/crm/qualificacao.ts` (16 testes) — 9 dimensões, 7 hard gates, notas inteiras 0–3, score 0–27, faixa nos cortes 18/10 e `avaliacaoPermiteQualificada` com as 10 condições e mensagens do §18. Coleção `avaliacoes-qualificacao` (`apps/cms/src/collections/AvaliacoesQualificacao.ts`, 20ª coleção do Payload): validação estrita das notas, `scoreTotal`/`faixa`/`concluidaEm` derivados e persistidos em hook `beforeChange` (`apps/cms/src/lib/crm/derivadosAvaliacao.ts`), única avaliação `vigente` por oportunidade mantida em hook `afterChange` dentro da mesma transação. Escrita e leitura ligadas à Local API (`painelCrmEscrita.ts`/`painelCrm.ts`), tela e formulário (`TelaQualificacao.tsx`/`FormAvaliacao.tsx`) com as 9 dimensões, os 7 hard gates e o score ao vivo mostrado como apoio à decisão — nunca decidindo por ela (§15 do manual). Avaliação parcial pode ser salva com `statusAvaliacao` "Em preenchimento"; completude só é exigida ao salvar como "Concluída".
- **Pendência que ficou:** `pnpm payload:push:schema` **não foi rodado** — a tabela `avaliacoes_qualificacao` ainda não existe no banco de desenvolvimento, então a coleção nunca foi exercitada contra dado real. Precisa de um humano (dev parado, diff revisado, `N` a qualquer DATA LOSS, `payload:generate` depois).

---

### Sessão H3 — Porta do estágio "Qualificada" ✅ concluída (07/09/2026)

- **Objetivo:** impedir a promoção a Qualificada sem avaliação compatível.
- **Escopo:** hook `beforeChange` em `oportunidades` reproduzindo as dez condições de §1.3, cada uma com mensagem de erro específica (o protótipo já traz os textos prontos — reaproveitar literalmente, são bons); a UI mostra o erro no formulário, não um toast genérico.
- **Pré-requisito:** H2.
- **Critério de aceite:** um teste por condição de bloqueio (10 testes), mais o caminho feliz. As mensagens devem ser **as mesmas do §18 do Manual Operacional** — a equipe é treinada nelas, e um texto diferente vira chamado de suporte. Fixar isso num teste que compara as strings.
- **Entregue:** branch `feat/crm-janela-h2-h3-qualificacao` (mesma da H2), **ainda não mergeada na `main`**. `apps/cms/src/lib/crm/gateQualificada.ts` (`decisaoGateQualificada`, `erroDoGateQualificada`, `ErroGateQualificada`) busca a avaliação vigente da oportunidade e aplica a regra pura `avaliacaoPermiteQualificada` (H2); um hook `beforeChange` em `Oportunidades.ts`, posicionado antes de `espelharStatusLegado`, recusa a promoção ao estágio Qualificada — inclusive já criar a oportunidade nesse estágio — sem avaliação vigente que sustente. O erro de negócio chega íntegro ao formulário do painel em vez do erro genérico da Local API. 9 testes cobrindo as condições de bloqueio e o caminho feliz.
- **Pendências que ficaram:** o checkpoint visual humano (`CLAUDE.md` §6) ainda não foi feito — não foi possível criar uma oportunidade, tentar movê-la para Qualificada sem avaliação e confirmar visualmente a mensagem do §18 no formulário, nem o caminho feliz depois de uma avaliação completa; isso depende também do `payload:push:schema` da H2 (a tabela `avaliacoes_qualificacao` ainda não existe no banco). A garantia de vigência única (H2) vale só dentro da transação do Payload — não há índice único parcial no Postgres, então duas escritas genuinamente concorrentes ainda poderiam persistir duas avaliações `vigente` para a mesma oportunidade; risco aceito por decisão, não resolvido nesta sessão.

---

### Sessão H4 — Contratação e Instrumentos de Formalização

- **Objetivo:** a contratação vira entidade própria, com lastro documental.
- **Escopo:** coleções `contratacao` (1:1 com oportunidade, validada em hook) e `instrumentos-formalizacao`; regra de `Formalizada` (perfil autorizado + data + responsável + ≥1 instrumento); auditoria do ato de formalizar em `audit-log`; telas.
- **Pré-requisito:** decisão #2 (quem formaliza).
- **Critério de aceite:** o checklist do **§26 do Manual Operacional** passa item a item — formalização recusada em cada uma das quatro condições faltantes, com as mensagens do manual; segunda contratação para a mesma oportunidade recusada; registro correspondente em `audit-log`.
- **Nota de arquitetura:** esta sessão define o vocabulário que a **Janela F (Financeiro)** vai consumir. Empenho aparece aqui como *tipo de instrumento*; se a Janela F precisar de empenho como entidade financeira própria (valor empenhado, saldo, liquidação), a relação é `instrumento ↔ empenho`, não duplicação. Registrar a decisão antes de abrir F.

---

### Sessão H5 — Handoff Comercial → Operações e a porta de "Ganha"

- **Objetivo:** fechar o ciclo — nenhuma oportunidade vira Ganha sem entrega aceita.
- **Escopo:** perfil `operacoes` em `Users.ts` + access helper; coleção `handoff` (um por contratação); regra de aceite (perfil, data, usuário, responsável de Operações, contratação formalizada); gate de `Ganha` no hook de `oportunidades`; tela de handoff com visão de checklist.
- **Pré-requisito:** H4 + decisão #3.
- **Critério de aceite:** os checklists do **§28 e do §29 do Manual Operacional** passam — perfil comercial recebe erro ao tentar aceitar handoff; `Ganha` recusada sem contratação formalizada e sem handoff aceito; `Ganha` aceita no caminho completo.

---

### Sessão H6 — Integridade de exclusão e auditoria (fecha a Sessão E3)

- **Objetivo:** ligar de vez o `audit-log` (que existe e nunca foi escrito) e proteger a integridade referencial.
- **Escopo:** hooks de auditoria (`afterChange`, `afterDelete`, login) gravando em `audit-log` com usuário/ação/entidade/entidadeId/metadata/ip; `beforeDelete` implementando as regras de §1.3 nas cinco coleções; `historico-estagio` e `audit-log` inacessíveis para escrita/exclusão via UI por access control.
- **Pré-requisito:** H5 + decisão #5.
- **Nota:** esta sessão **substitui a Sessão E3** do `docs/16` — não executar as duas.
- **Critério de aceite:** tentativa de exclusão bloqueada em cada uma das cinco regras; `audit-log` populado após um ciclo completo (criar oportunidade → qualificar → contratar → handoff → Ganha). A tabela de bloqueios do **§34 do Manual Operacional** é a lista esperada: cada linha dela deve corresponder a um bloqueio real, com a mensagem descrita.

---

### Sessão H7 — Navegação, dashboard e encerramento da migração

- **Objetivo:** a fila de revisão de migração vira tela de trabalho da Direção, e o P0 recebe o checkpoint visual completo. A navegação e o dashboard, que dão nome original a esta sessão, já foram antecipados — o 3º grupo de menu "Processo Comercial B2G (P0)" foi criado na **H2**, e `GraficosComercial.tsx`/`TelaPainelComercial.tsx` já leem `estagio`/`situacao` desde logo depois da **H1** (ver "Atualização pós-H1" na Sessão H1 abaixo).
- **Escopo:** tela/filtro da **fila de revisão de migração** (`migracaoPendenteRevisao = true`) para a Direção despachar — hoje a informação só aparece como selo em `TelaOportunidades.tsx`/`DetalheOportunidade.tsx`, sem tela de trabalho própria nem ação de confirmar o estágio; ao entrar nesta sessão, conferir que o grupo "Processo Comercial B2G (P0)" já recebeu os itens de menu das sessões H4/H5 (Contratação, Handoff), que devem ter chegado por conta própria em cada sessão.
  - **Divergência M2:** ✅ **resolvida na parte de sistema já na H1** — o funil do Dashboard agrega por `estagio`, com `situacao` como filtro (Ativa por padrão), e exclui do gráfico o que estiver pendente de revisão de migração, para não criar um pico artificial em `Mapeada`. Só falta a parte de texto (§33 do manual, escopo da **H8**).
  - **Divergência M1 (a outra metade):** ainda pendente — a fila de revisão deixa de ser função de console e vira tela de trabalho da direção — lista, filtro, e a ação de confirmar o estágio (que limpa `migracaoPendenteRevisao` e grava o motivo no histórico).
- **Pré-requisito:** H1–H6 + decisão #4 em andamento.
- **Critério de aceite:** checkpoint visual (`CLAUDE.md` §6) desktop 1440 + mobile 375 do CRM inteiro, incluindo confirmar visualmente o funil do Dashboard com os 11 estágios (M2, já implementado desde a H1) e o grupo "Processo Comercial B2G (P0)" completo; fila de revisão zerada ou com pendências explicitamente aceitas pelo PO.
- **Só depois disso** o campo `status` legado pode ser considerado para remoção — **em sessão separada**, nunca junto com esta.

---

### Sessão H8 — Reedição do Manual Operacional (v1.1) e recaptura das telas

Única sessão da Janela que **não é de código**. Ela existe porque, terminada a H7, o manual v1.0 passa a descrever um sistema que existe de verdade — e nesse momento as divergências de texto e as capturas do protótipo viram erro visível para quem opera.

- **Objetivo:** reemitir o `NTC-COM-CRM-01` como v1.1, tendo o **Painel Admin** como sistema-base em vez do protótipo.
- **Escopo — correções de texto (§4.0):**
  - **M3** — refazer a Figura 4: a atual é captura da v3.0 e a legenda afirma que mostra Estágio e Situação separados, o que a imagem não mostra.
  - **M4** — §10: declarar todos os obrigatórios da Oportunidade (Cliente, Programa, UF, Origem, Data de abertura, Responsável comercial), conforme o que a H1 tornou `required` no Payload.
  - **M5** — §16: hard gate "Sim" não impede concluir a avaliação; impede o **estágio** Qualificada.
  - **M7** — mencionar o campo `status` legado enquanto o espelho existir, ou remover a menção se a sessão de limpeza pós-H7 já tiver rodado.
  - **M8** — §5, §7 e §42 (FAQ): o acesso é por e-mail e senha, com sessão do Painel Admin; retirar o `[VALIDAR COM TI/DESENVOLVIMENTO]` e registrar o 2FA como pendência da Janela C, no estado em que estiver na data da reedição.
  - **§6 (RBAC)** — reescrever com os perfis reais do Payload definidos em H5, e não com os 6 perfis do protótipo.
- **Escopo — seções novas:**
  - **Migração (M1)** — o que significa uma oportunidade marcada como pendente de revisão, por que `Mapeada` vindo de *Perdida*/*Cancelada* não é verdade histórica, e como a direção despacha a fila na tela criada em H7. Sem isso, o §11 continua ensinando a leitura errada.
  - **§33 (M2)** — o funil do Dashboard passa a ser o de 11 estágios; explicar o filtro de situação e a exclusão dos pendentes de revisão.
  - **Leads** — tela do portal que o manual nunca teve.
  - **§20** — a geração e o arquivamento do PDF da proposta (Fase B2).
  - **§21 Biblioteca Comercial e §32 Financeiro** — marcar explicitamente como **não implementados** até as Janelas D2 e F, em vez de descritos como existentes.
- **Escopo — capturas:** refazer as 13 figuras no Painel Admin, com dados genéricos, seguindo a regra que o próprio manual fixa no §45 (telas reais, sem dado sensível).
- **Pré-requisito:** H7 concluída. Antes disso a reedição erraria de novo, porque as telas ainda não existem.
- **Critério de aceite:** o QA do §47 do manual roda inteiro sobre o Painel Admin, não sobre o protótipo; o §43 (controle de versão) registra a v1.1 com o novo sistema-base; nenhuma das 8 divergências de §4.0 sobrevive.
- **Estimativa:** 1 sessão, mais o tempo de captura.

---

## 5. Manual de migração de dados

Ordem obrigatória. Cada passo depende do anterior.

**Um push só.** A estratégia em duas fases (aplicar os campos do funil como nullable e torná-los `required` depois da migração) deixou de ser necessária: o script identifica o que falta migrar pela **ausência de linha em `historico-estagio`**, e sobrescreve `estagio`/`situacao` mesmo quando o `defaultValue` do push já os tiver preenchido. Os dois campos entram `required` com `defaultValue` no mesmo push dos demais.

1. **Backup do banco antes de qualquer coisa.** Supabase → snapshot manual. Sem isso, não comece.
2. **Conferir os cinco campos obrigatórios da oportunidade** — `programa`, `uf`, `origem`, `dataAbertura` e `responsavel` passaram a ser `required` (decisão do PO · Manual Operacional NTC-COM-CRM-01) e **não têm `defaultValue`**. Listar as oportunidades sem qualquer um deles e completá-las **antes** do push; se sobrar alguma incompleta, o push falha ao criar a coluna `NOT NULL`. A falha é desejada — é a alternativa a preencher um dado comercial no chute —, mas custa uma janela de manutenção se for descoberta na hora. Vale para dev e, principalmente, para produção (passo 9).
3. **Parar o `pnpm dev`.** `payload:push:schema` com dev rodando corrompe o `.next` compartilhado e o schema. Regra do projeto, já custou uma sessão.
4. **Diffar o schema** antes de aplicar (`CLAUDE.md` §14). Responder **N** a qualquer prompt de `DATA LOSS` — os campos novos são aditivos; se aparecer perda de dados, tem algo errado no diff, não no banco.
5. **Aplicar `pnpm payload:push:schema`** — push único, com `estagio`/`situacao` já `required`.
6. **Migrar imediatamente após o push, sem usar o painel entre os dois.** Primeiro em dry-run: `pnpm --filter @ntc/cms crm:migrar-p0` (arquivo `apps/cms/src/seed/migrarOportunidadesP0.ts`; dry-run é o padrão, sem env var). A saída lista cada oportunidade, o status de origem, o destino e a flag de revisão, e fecha com o total de oportunidades no banco e quantas foram percorridas — conferir esse total contra o banco. Depois de verdade: `CRM_MIGRACAO_APLICAR=1 pnpm --filter @ntc/cms crm:migrar-p0` (env var em vez de flag porque o pnpm engole flags sem `--`). **Por que não abrir o painel no meio:** `estagio`/`situacao` têm `defaultValue`, então o push preenche toda a base com `mapeada`/`ativa` e a verdade fica só no `status` legado; uma única edição pela interface reescreve esse `status` a partir do estágio default (hook `espelharStatusLegado`) e a posição real de funil daquela oportunidade se perde — o script não tem mais de onde recuperá-la.
7. **Conferir o resultado:** nenhuma oportunidade sem `estagio`; um `historico-estagio` por oportunidade migrada, com `usuario` nulo, `atorSistema: "migração automática"` e o motivo citando o status de origem; a contagem de migradas + puladas fechando com o total do banco.
8. **Despachar a fila de revisão com a direção** (decisão #4). Enquanto `migracaoPendenteRevisao` for `true`, o registro **não é verdade histórica** — em particular, `Mapeada` para os Perdida/Cancelada é fallback técnico, e tratá-lo como dado real distorce qualquer relatório de funil.
9. **Repetir em produção** (Vercel/Supabase de produção) na mesma ordem, do backup ao passo 7, com a conferência dos cinco campos obrigatórios (passo 2) feita sobre a base real de produção.

**Idempotência:** o script pula quem **já tem linha em `historico-estagio`** — não quem tem `estagio` preenchido, que o `defaultValue` do push preenche em todo mundo e faria o script pular a base inteira relatando sucesso. Pode rodar duas vezes sem duplicar histórico, e é auto-recuperável: se morrer entre o update da oportunidade e o create do histórico, a re-execução refaz os dois. Confira isso no dry-run antes de confiar.

---

## 6. Riscos e armadilhas

**R1 — Oportunidade fica indelével depois da migração.** O script cria um `historico-estagio` para cada oportunidade, e a regra de integridade bloqueia excluir oportunidade com dependentes. Resultado: **nenhuma oportunidade poderá mais ser apagada pela interface, nem as criadas por engano.** Pode ser intencional (append-only é a filosofia do P0), mas precisa ser decisão consciente (decisão #5). Alternativa: exclusão lógica (`arquivada = true`) reservada a super-admin, com registro em `audit-log`.

**R2 — O espelho legado é dívida com prazo.** Manter `status` preenchido evita regressão em H1, mas dois campos representando a mesma coisa divergem com o tempo. O plano acima já isola a remoção em uma sessão própria, depois de H7. Não deixar indefinido.

**R3 — `Mapeada` como fallback de Perdida/Cancelada polui relatório.** Qualquer gráfico de funil que agregue por estágio vai mostrar um pico artificial em `Mapeada`. Enquanto a fila de revisão não zerar, filtrar `migracaoPendenteRevisao` nos relatórios.

**R4 — "Aprovada" e "Contratada" viram o mesmo estágio.** Os dois status antigos colapsam em `Contratação em Formalização`, e a informação que os distinguia se perde. Se essa distinção importa para o histórico, capturá-la antes da migração (o `motivo` do histórico registra o status de origem — é o que salva o dado).

**R5 — Perfil Operações sem gente dentro.** Criar o perfil sem designar quem o ocupa trava o funil: nada chega a `Ganha` porque ninguém pode aceitar handoff. Decisão #3 precisa vir com **nome de pessoa**, não só com o "sim".

**R6 — Hard gate `Em validação` bloqueia igual a `Sim`.** É proposital (não se qualifica com pendência jurídica aberta), mas na prática significa que uma oportunidade fica parada até o jurídico responder. A operação precisa saber disso antes, ou vai reportar como bug.

**R8 — O manual circulando antes da Janela H.** O `NTC-COM-CRM-01` está aprovado para uso interno e descreve o protótipo. Se for distribuído hoje como "manual do CRM", a equipe abre `/crm` e não encontra qualificação, contratação, handoff, histórico nem os 11 estágios — e conclui que o sistema está quebrado, não que o manual está adiantado. Enquanto H não fechar, ele só deve circular com o sistema-base explícito no cabeçalho (v3.3 P0, protótipo) ou como documento de especificação, não de operação.

**R7 — O protótipo roda tudo no cliente; o portal não.** Toda regra de §1.3 precisa viver em hook de servidor no Payload. Validação só no formulário React é contornável pela Local API e pela REST — não é controle, é conveniência de UI.

---

## 7. O que este documento não cobre

- A especificação P0 original (decisão #1) — só a implementação observada no protótipo e o Manual Operacional `NTC-COM-CRM-01` v1.0 conferido contra ele (§4.0).
- A Janela F (Financeiro) — apenas registra a fronteira com H4.
- A Biblioteca Comercial (Sessão D2) — pré-requisito de conteúdo para a neutralização jurídica no CRM.
- O texto jurídico do site público — mapeado em §2, encaminhamento é do PO com o jurídico.
- Migração de UI do protótipo para o portal pixel a pixel: o CRM do portal tem design próprio (`CLAUDE.md` §3, com a exceção do idiom do painel admin). O que se porta do protótipo é **modelo e regra**, não CSS.

---

**Fim do documento.**
*Portal Grupo NTC · docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md · v1.1 · 4 de setembro de 2026 · Instituto NTC do Brasil*
