# CRM Fase B1 — Propostas (registro)

**Data:** 22/07/2026 · **Status:** aprovado em brainstorming · **Origem:** protótipo `NTC_Comercial_Premium.html` (motor de propostas legado) · **Precede:** Fase B2 (motor A4/PDF + Biblioteca Comercial)

## Objetivo

Implementar o registro de **propostas comerciais** no módulo CRM (`/crm`): modelagem, wizard de criação com cálculo ao vivo, versionamento completo e registro de envios. Destrava 3 das 4 cascas "Em breve" do menu do CRM: **Propostas · Versões · Envios** (Condições segue casca).

Esta é a **Fase B1**. O motor de geração de documento A4/PDF e o subsistema de conteúdo institucional versionado (Biblioteca Comercial + Textos-Padrão) ficam para a **Fase B2** — são a parte mais pesada e interdependente do motor legado, e não bloqueiam o valor de registrar propostas já.

## Decisões de brainstorming

1. **Recorte:** modelagem + telas CRUD, **sem** motor A4/PDF. Propostas ficam registráveis no sistema já; o documento é gerado numa fase posterior.
2. **Versionamento:** completo. Código-base + número de versão; "Nova versão" clona a vigente com motivo, marca a anterior como *Substituída*, escreve entrada na coleção `versoes`. A tela Versões passa a funcionar.
3. **Envios:** incluídos. Registro **manual do fato** (não disparo real): data, canal, destinatário, status, observações. A tela Envios passa a funcionar.
4. **Wizard/cálculo:** cálculo ao vivo no cliente (Client Component reativo — exceção aprovada ao padrão Server-Action de `CamposCrm`). A fórmula é uma função pura compartilhada entre cliente (resumo ao vivo) e servidor (grava os derivados).

## Modelagem de dados

Três coleções novas, seguindo o padrão de `apps/cms/src/collections/Oportunidades.ts` (access `atendimentoComercial` para read/create/update, `superAdmin` para delete; `typescript.interface`; `admin.group: "CRM"`). Registradas em `apps/cms/src/payload.config.ts`.

### `propostas` (interface `Proposta`)

Espelha o objeto legado. Derivados são **persistidos** ao salvar (fonte única = os inputs; ver Cálculo).

**Identificação e estado:**
- `codigoBase` (text) — `NTC-PROP-{ano}-{siglaPrograma}-{uf}-{siglaCliente}`
- `codigo` (text, unique) — `{codigoBase}-v01`
- `versao` (number, default 1)
- `oportunidade` (relationship → oportunidades, opcional)
- `cliente` (relationship → clientes-crm, required)
- `programa` (relationship → programas)
- `tipo` (select, `TIPOS_PROPOSTA`)
- `status` (select, `STATUS_PROPOSTA`, default `rascunho`)

**Itens:**
- `modulos` (relationship → modulos, hasMany)
- `eventos` (relationship → eventos, hasMany) — os "Produtos/Eventos" do legado

**Quantitativos e valores:**
- `valorUnitario` (number, min 0)
- `qtdPagantes` (number, min 0)
- `cortesias` (number, min 0)
- `percDesconto` (number, min 0, max 100)
- `valorBruto` (number) — derivado persistido
- `desconto` (number) — derivado persistido
- `valorLiquido` (number) — derivado persistido

**Condições e responsáveis:**
- `modalidade` (text)
- `replay` (text)
- `condPagto` (text)
- `condEspecificas` (textarea)
- `observacoes` (textarea)
- `elaborador` (relationship → users)
- `aprovador` (relationship → users)
- `validadeDias` (number, default 30)
- `dataCriacao` (date)
- `validade` (date)
- `motivoRevisao` (text)
- `substitui` (text) — código da versão anterior que esta substitui

### `versoes` (interface `VersaoProposta`)

Trilha de versionamento (uma entrada por nova versão gerada):
- `codBase` (text)
- `nVersao` (number)
- `proposta` (relationship → propostas)
- `data` (date)
- `substitui` (text) — código da versão substituída
- `motivo` (text)
- `sintese` (text)
- `statusAnterior` (text)
- `vigente` (checkbox)

### `envios` (interface `EnvioProposta`)

Registro de fato do envio de uma proposta:
- `proposta` (relationship → propostas, required)
- `data` (date)
- `canal` (select, `CANAIS_ENVIO`)
- `destinatarios` (text)
- `status` (select, `STATUS_ENVIO`)
- `observacoes` (textarea)

### Listas controladas

Novas listas em `packages/lib/src/crm/listas.ts` (mesmo helper `opcoes()`/`slugDeRotulo`):

- `TIPOS_PROPOSTA`: Programa Completo · Módulo Avulso · Produto/Evento Avulso · Customizada
- `STATUS_PROPOSTA`: Rascunho · Enviada · Em análise · Aprovada · Recusada · Substituída · Expirada
- `CANAIS_ENVIO`: E-mail · WhatsApp · Ofício · Presencial · Outro
- `STATUS_ENVIO`: Enviada · Recebida · Em análise · Respondida

### Código-base

Gerado **no servidor** (na Server Action), nunca no cliente:

```
codigoBase = `NTC-PROP-${ano}-${siglaPrograma}-${uf}-${siglaCliente}`
```

- `ano` de `new Date()` no servidor.
- `siglaCliente` = sigla/órgão do cliente sanitizado (`[^A-Z0-9]` removido, upper).
- Colisão de `codigoBase` existente → nova versão daquele conjunto (v02, v03...), não novo registro base.

## Arquitetura de leitura/escrita

Espelha o padrão da Fase A — sem invenção.

### Leitura — `apps/cms/src/lib/cms/painelCrm.ts` (`server-only`)

- `carregarPropostas()` — lista, **só a versão vigente** de cada `codigoBase`, com cliente/programa/status resolvidos.
- `carregarProposta(id)` — detalhe com itens (módulos/eventos), envios e responsáveis resolvidos.
- `versoesDeProposta(codBase)` / `todasVersoes()` — histórico.
- `enviosDeProposta(propId)` / `todosEnvios()` — envios.

### Escrita — `apps/cms/src/lib/cms/painelCrmEscrita.ts`

- `criarProposta(dados)` — gera código-base + versão 1, calcula e grava derivados, cria o registro.
- `atualizarProposta(id, dados)` — recalcula e regrava derivados.
- `criarVersaoProposta(codBase, motivo)` — clona a vigente → nova versão (`vXX`); marca a anterior `Substituída`; escreve entrada em `versoes` (vigente = true na nova, false na anterior).
- `registrarEnvio(propId, dados)` — cria entrada em `envios`.

### Server Actions — `apps/cms/src/app/(painel)/acoesCrm.ts`

Wrappers que revalidam sessão (`obterUsuarioCms()`) e devolvem `{ ok, erro }` neutros, como as ações de cliente/oportunidade existentes.

### Cálculo derivado (fonte única)

Função pura em `packages/lib/src/crm/` (ex.: `calcularValoresProposta`):

```
entrada: { valorUnitario, qtdPagantes, cortesias, percDesconto }
saída:   { valorBruto, desconto, valorLiquido, acessosTotais }

valorBruto    = valorUnitario * qtdPagantes
desconto      = valorBruto * (percDesconto / 100)
valorLiquido  = valorBruto - desconto
acessosTotais = qtdPagantes + cortesias
```

Usada **nos dois lados**: no cliente para o resumo ao vivo do wizard e no servidor para gravar os derivados. Testável em Vitest.

## Telas

Mesmo padrão SPA-de-telas das telas atuais do CRM (`TelaOportunidades` + `FormOportunidade` + `CamposCrm` + `DetalheOportunidade`), em `apps/cms/src/app/(painel)/crm/`.

### Propostas — `TelaPropostas` + `DetalheProposta`

- Lista `pcms-tabela` agrupada por `codigoBase`, exibindo **só a versão vigente** de cada (badge de versão + selo de status). Linha clicável → detalhe.
- Detalhe: KPIs (valor bruto · desconto · valor líquido · acessos totais) + dados gerais + itens contemplados + condições comerciais + registro de envios. Ações: **Editar**, **Nova versão** (pede motivo), **Registrar envio**. Sem "Visualizar HTML / Gerar PDF" (Fase B2).

### Wizard de criação — `FormProposta` (Client Component)

Exceção reativa aprovada ao padrão `CamposCrm`. Blocos:

1. **Identificação** — oportunidade (opcional, pré-preenche), cliente, programa, tipo, modalidade, validade (dias).
2. **Módulos contemplados** — checkboxes filtrados pelo programa selecionado.
3. **Produtos/Eventos** — checkboxes de eventos do programa.
4. **Quantitativos e valores** — valor unitário, pagantes, cortesias, desconto% + **resumo ao vivo** (usa `calcularValoresProposta`).
5. **Condições e responsáveis** — replay, condição de pagamento, condições específicas, observações, elaborador, aprovador.

Selecionar uma oportunidade pré-preenche cliente/programa/módulos/quantidade/modalidade (como no legado). "Gerar Proposta" chama `criarProposta`.

### Versões — `TelaVersoes`

Histórico por `codigoBase` (versão, criada, valor líquido, status, motivo) → abre a proposta daquela versão. Substitui a casca "Em breve".

### Envios — `TelaEnvios`

Lista consolidada de todos os envios; o registro por proposta vem do detalhe da proposta. Substitui a casca "Em breve".

### Menu

As 3 entradas hoje em `TelaEmBreve` no `ShellCrm` (Propostas, Versões, Envios) passam a apontar para as telas reais. **Condições** continua casca "Em breve".

## Testes

- **Vitest:**
  - `calcularValoresProposta` — bruto/desconto/líquido/acessos; bordas: 0 pagantes, desconto 100%, cortesias sem pagantes.
  - Geração do código-base — sanitização de sigla, colisão de base → v02.
  - Transição "nova versão" — anterior vira Substituída, entrada criada em `versoes`, vigência correta.
- **Checkpoint visual:** servidor no ar ao final para validação humana (aprovação do PO), desktop 1440 + mobile 375, nas telas Propostas / Detalhe / Wizard / Versões / Envios. Sem screenshot automatizado (regra do projeto).

## Cuidados de schema

Alteração de banco com `push: false` (regra do projeto — nunca db:push com sessão paralela). As 3 coleções novas entram no `payload.config.ts`; schema sincronizado com `pnpm payload:push:schema` sem dev rodando, pelo PO, no momento certo. Diff de collections antes de aplicar.

## Fora de escopo (Fase B1) → Fase B2

- Motor de geração A4/PDF e os 4 templates premium (Programa Completo · Módulo Avulso · Produto/Evento Avulso · Customizada).
- Biblioteca Comercial (conteúdo institucional versionado) + resolução "Biblioteca-first" + registro da versão de conteúdo usada na proposta.
- Textos-Padrão (blocos aplicados automaticamente pelo motor).
- Condições (entidade/tela dedicada) — casca "Em breve" mantida.
- Orientações EventON (documento complementar para online/híbrido).
- Exclusão de propostas pelas telas.

## Git

Branch `feat/crm-fase-b1`, commits pequenos em português (Conventional Commits), **sem push** até ordem explícita.
