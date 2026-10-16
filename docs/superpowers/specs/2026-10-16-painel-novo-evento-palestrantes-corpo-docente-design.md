# Painel Admin — Novo evento, gestão de palestrantes e Corpo Docente

**Data:** 16/10/2026 · **Status:** rascunho para aprovação do PO
**Módulo:** Painel Admin → módulo Site (`apps/cms/src/app/(painel)/`)

## 1. Por que

O PO perguntou o que dava para criar e editar no painel do site e descobriu três lacunas:

1. **"Novo evento" está desabilitado** (`TelaEventos.tsx`, `disabled title="Em breve"`). Hoje todo evento nasce pelo **Importar PDF**, que já cria um rascunho preenchido a partir do folder. Falta o caminho de quando **não há PDF**.
2. **Palestrante não tem formulário.** O detalhe (`DetalhePalestrante.tsx`) só lê e alterna "Ocultar do site". Os 63 palestrantes vieram de script (import do HTML). Não dá para criar nenhum nem corrigir foto ou currículo pelo painel.
3. **O Corpo Docente não é gerido pelo painel.** O PO achava que era. A página `/o-grupo/corpo-docente` lê o Global `corpo-docente`, cujo campo `cards` é uma **lista ordenada** em que cada card aponta para um especialista. Essa lista só foi montada por script, e não existe tela para ela. Hoje são **49 cards (4 `featured` + 45 `expert`), nenhum especialista repetido**. Um palestrante criado no painel nunca chegaria à página.

**Sucesso:** o PO cadastra um palestrante novo pelo painel, com foto e currículo, coloca a pessoa no Corpo Docente na posição que quiser, e ela aparece no site, nos filtros certos, sem ninguém rodar script. Também cria um evento do zero quando não tem folder.

## 2. Objetivos

- **G1.** Habilitar "Novo evento": cria um evento em rascunho e abre direto no formulário de edição que já existe (`DetalheEvento`, modo edição).
- **G2.** Habilitar "Novo palestrante" e tornar o detalhe do palestrante **editável**, num formulário único para criar e editar.
- **G3.** No formulário do palestrante, um bloco **"Corpo Docente"** para colocar ou tirar a pessoa da página, escolher o tipo do card e editar os textos do card.
- **G4.** Uma tela nova **"Corpo Docente"** no menu do módulo Site para **ver e reordenar** os cards (e abrir o palestrante de cada um).

## 3. Não objetivos

- Excluir palestrante. Não foi pedido. Quem não deve aparecer continua usando "Ocultar do site".
- Editar o resto do Global `corpo-docente` (hero, quicklinks, FAQ, textos da página). Só os `cards`.
- Cards `axis` (eixos de Saúde sem pessoa). Foram removidos da página e o adapter do site já os ignora. A tela não os cria nem os mostra, mas **preserva** os que existirem no Global ao salvar.
- Rascunho e publicação para palestrante e Corpo Docente (ver §4.1).
- Mudar o site (`apps/web`). O adapter `apps/web/lib/cms/corpoDocente.ts` já lê tudo o que este trabalho grava.
- Duplicar evento, criar evento a partir de modelo.

## 4. Decisões do PO

### 4.1. Salvar já manda para o site (palestrante e Corpo Docente)

Decisão do PO em 16/10: **sem rascunho** para palestrante e cards. Salvar grava a versão publicada (`_status: "published"`), e o site atualiza pela revalidação que já existe (`revalidatePage(["/o-grupo/corpo-docente"])` no `afterChange` de `especialistas` e do Global). É o mesmo comportamento atual de "Ocultar do site" (`definirOcultarPalestrante`).

Consequências que o builder precisa respeitar:

- Gravar **publicado** dispara a validação de `required` do Payload. O formulário tem que exigir no cliente o que a coleção exige (nome, foto, titulação, instituição, currículo curto) e mostrar o erro do servidor se ainda assim falhar.
- Especialistas que a importação de PDF cria em rascunho (`casarOuCriarPalestrantes`) podem estar sem foto ou sem currículo. Salvá-los pelo formulário novo os publica, o que só é possível depois de completar os obrigatórios. **Isso é esperado.** Nenhum desses aparece no site enquanto estiver oculto ou fora de um card.
- **Evento continua com rascunho e Publicar**, como hoje. O "Novo evento" segue o modelo do evento, não o do palestrante.

### 4.2. Corpo Docente: bloco no palestrante + tela de ordem

Decisão do PO em 16/10:

- **No formulário do palestrante**, o bloco "Corpo Docente" tem:
  - a chave **"Aparece no Corpo Docente"**, que cria ou remove o card dele no Global;
  - o tipo do card, **Destaque** (`featured`) ou **Card comum** (`expert`);
  - os textos do card, que **dependem do tipo** (ver §5.3).
- **A tela "Corpo Docente"** lista os cards na ordem da página, mostrando foto, nome, tipo e o selo "Oculto do site" quando for o caso, com setas ↑/↓ para reordenar e "Salvar ordem". Clicar no nome abre o palestrante. É o mesmo padrão de `TelaHome.tsx` (curadoria da Home).
- **Card novo entra no fim da lista.** O PO reordena na tela Corpo Docente.

## 5. O que construir

### 5.1. Novo evento (G1)

- Habilitar o botão em `TelaEventos.tsx`.
- Server Action nova (`criarEventoEmBranco`, em `acoes.ts`, com a escrita em `painelCmsEscrita.ts`) que cria o evento **com `draft: true`**, para pular os `required`, com nome provisório "Novo evento" e mais nada. Mesmo padrão de `criarEventoDePdf` sem a parte do PDF.
- Ao criar, abrir o evento direto em edição (`abrirEvento(id, true)` no `ShellCms`, o mesmo usado depois do Importar PDF).
- Sem mudança de schema.

**Endereço do evento (slug). Decisão do agente, para o PO conferir.** `eventos.slug` é `required` + `unique`, e `autoSlug("nome")` só preenche quando está vazio. Criado com o nome "Novo evento", o slug ficaria `novo-evento` para sempre: o segundo "Novo evento" falharia na unicidade, e o evento iria ao ar em `/agenda/novo-evento`. Hoje o formulário do evento não mostra o slug. Resolução:
- O evento em branco nasce com **slug provisório único** (`novo-evento-<sufixo curto>`).
- O formulário de edição do evento ganha o campo **"Endereço (slug)"**, como o de Conteúdos já tem (`DetalheConteudo.tsx`). Ele vale também para os importados por PDF, que hoje herdam o slug do nome do arquivo.
- Ao salvar, **enquanto o slug ainda for o provisório** (começar com `novo-evento-`), ele é recalculado a partir do nome. Assim o PO não precisa mexer nele no caso comum.
- Slug repetido devolve uma mensagem legível ("Já existe um evento com este endereço"), no padrão de `salvarConteudoCms`.
- Mudar o slug de evento **já publicado** muda a URL pública. O campo mostra essa dica.

### 5.2. Formulário do palestrante (G2)

Um formulário só, para **"Novo palestrante"** (botão em `TelaPalestrantes.tsx`) e para **"Editar"** no `DetalhePalestrante` (que continua com a visão de leitura e ganha o modo edição, como o `DetalheEvento`).

Campos, todos da coleção `especialistas` (sem campo novo, **sem `payload:push:schema`**):

| Grupo | Campo | Obrigatório | Controle |
|---|---|---|---|
| Identidade | `nome` | sim | texto (o `slug` é gerado pelo hook `autoSlug`) |
| | `foto` | sim | upload (reusar `CampoUpload`); aviso de proporção 20:23 |
| | `titulacao` | sim | select de `TITULACAO_DOCENTE` |
| | `instituicao` | sim | texto |
| | `cargoAtual` | não | texto |
| Currículo | `curriculoCurto` | sim | Markdown leve → Lexical (`markdownLexical.ts`, o mesmo do catálogo, que preserva negrito) |
| | `curriculoCompleto` | não | idem |
| Links | `linkLattes`, `linkLinkedin` | não | texto (URL) |
| Filtros do Corpo Docente | `vertical` | não* | select |
| | `tipo` | não* | select |
| | `frente` | não | select (só "contratações") |
| | `formacao` | não | select |
| | `atuacao` | não | múltipla escolha |
| | `linhasAtuacao` | não | múltipla escolha das `areas` |
| | `programasRelacionados` | não | múltipla escolha dos `programas` |
| Visibilidade | `ocultarDoSite` | — | a chave que já existe |

\* O adapter do site cai para `gestao-publica`/`consultor` quando `vertical`/`tipo` estão vazios. Então o formulário mostra uma dica nesses dois campos: "usado nos filtros do Corpo Docente; vazio cai em Gestão Pública/Consultor". Rótulos legíveis para os valores (`gestao-publica` → "Gestão Pública" etc.).

Regras:
- Salvar grava publicado (§4.1). Os campos de Markdown só são reenviados se mudaram, mesma regra do catálogo (v3.4), para não degradar o Lexical importado. O aviso de perda de formatação por campo (`idaEVoltaPreserva`) também é reaproveitado.
- O upload de foto cria um `media` e aponta `foto` para ele. `CampoUpload` hoje está preso a `eventoId`, então palestrante precisa de uma variante, como Conteúdos já tem (`enviarMidiaConteudo`). No "Novo palestrante" ainda não existe id, e a foto sobe antes, junto com a criação. No modo edição, gravar a foto respeita o mesmo publicado.
- Depois de criar, o palestrante aparece no `SeletorPalestrantes` dos eventos. Conferir que a lista do seletor inclui o recém-criado.

### 5.3. Bloco "Corpo Docente" no palestrante (G3)

Lê e escreve o item de `cards` do Global `corpo-docente` cujo `especialista` é este palestrante (regra: **no máximo um card por especialista**, que hoje vale nos 49).

| Campo do card | Destaque (`featured`) | Card comum (`expert`) |
|---|---|---|
| `tag` (etiqueta, ex. "Autoridade convidada") | ✓ | ✓ |
| `axisBadge` (selo da foto) | ✓ | ✓ |
| `credencialCard` (parágrafo de credencial) | ✓ | ✓ |
| `metaAtuacao`, `metaEixos` | ✓ | — |
| `programasTexto`, `programasStrong`, `sufixoPrograma` | — | ✓ |
| `ctaHref`, `ctaRotulo` | ✓ | ✓ (rótulo vazio = "Consultar disponibilidade") |

- Ligar a chave cria o card **no fim da lista**. Desligar remove o card (com confirmação em dois cliques, sem `window.confirm`, padrão do painel). Trocar o tipo mantém os campos comuns e a posição.
- Os campos que aceitam `<strong>` no valor (`metaAtuacao`, `metaEixos`, conforme a descrição do Global) ficam como texto com essa dica, sem editor novo.
- Se o palestrante está **oculto do site**, o bloco mostra o aviso "não aparece na página enquanto estiver oculto". O adapter já pula, e nada muda na escrita.
- O bloco salva junto com o resto do formulário (um botão "Salvar"). Escrita do especialista + escrita do Global numa transação (`executarEmTransacao`, `apps/cms/src/lib/crm/transacao.ts`).

### 5.4. Tela "Corpo Docente" (G4)

- Item novo no menu do módulo Site (`ShellCms.tsx`, `TelaId` novo), entre Palestrantes e Eventos.
- Lista os cards `featured`/`expert` na ordem do Global, com foto, nome, tipo, selo "Oculto do site" e setas ↑/↓. "Salvar ordem" grava. Clicar abre o `DetalhePalestrante`.
- Sem adicionar nem remover nesta tela (isso é no palestrante, §4.2). Um texto curto aponta para lá: "Para incluir alguém, abra o palestrante".

### 5.5. Escrita no Global `corpo-docente`

- O Global tem `versions: { drafts: true }`. Toda escrita lê o Global (`draft: true`, para pegar a versão mais recente), troca **só** o array `cards` e grava com `_status: "published"`. Hero, quicklinks e o resto vão intactos. Cards `axis` que existirem são mantidos onde estão.
- **Estado real do Global (conferido por `psql` em 16/10):** a linha principal está com `_status = draft`, e a última versão é de 01/06/2026, antes de o admin nativo do Payload ser removido (11/06). Ninguém edita o Global desde então, e o site lê a linha principal normalmente. Então partir da versão mais recente (`draft: true`) não publica nenhuma edição pendente de ninguém. **Decisão do agente:** ler com `draft: true` e gravar publicado, como descrito acima.
- **Gravar publicado valida o Global inteiro**: hero, `quicklinks` (minRows 1), `metricas`/`archCards` (minRows 4), `camadas` (minRows 5), `nota` etc. Ninguém confirmou que o Global atual passa nessa validação. **A primeira tarefa do plano é verificar isso contra o banco real**: um `update` dentro de uma transação revertida, ou a validação do Payload sem gravar. Se falhar, o agente para e relata ao PO o que falta, antes de construir as telas, em vez de entregar um "Salvar" que sempre erra. Se a mensagem de falha chegar ao PO numa escrita de card, tem que dizer que o problema está no Global, não no que ele editou.
- `minRows: 1` no `cards`: remover o último card falha no Payload. A mensagem precisa chegar legível ao PO ("o Corpo Docente precisa de ao menos um nome").
- Regras puras (montar o array novo: incluir, remover, trocar tipo, reordenar, achar o card de um especialista) num módulo puro com testes, no padrão do `packages/lib/src/crm/*`. O lugar exato (`@ntc/lib` ou `apps/cms/src/lib/cms/`) fica com o builder.

## 6. Restrições

- §5.1 do CLAUDE.md: não criar componente de design system novo sem aprovação. Reaproveitar o que o painel já tem (`CampoUpload`, `pcms-*`, padrão de setas do `TelaHome`, modo edição do `DetalheEvento`, `EditorListaCatalogo`/editor Markdown do catálogo). O painel admin segue o idiom dele (v1.5), não a Soberana do site.
- §5.3: nenhum texto institucional inventado. Dicas e mensagens de interface, sim; conteúdo de card, não.
- Server Actions validam a sessão (`obterUsuarioCms`), como as existentes.
- Sem dependência nova. Sem mudança de schema (confirmar com `payload:generate` sem diff).
- WCAG AA: labels associados, foco visível, confirmação acessível.

## 7. Fica com o builder

- Nome de arquivos e componentes internos (ex.: `FormPalestrante.tsx`), e a divisão entre `acoes.ts`/`painelCmsEscrita.ts`/`painelCms.ts`.
- Como o tipo de leitura `PalestranteCmsDetalhe` cresce para carregar os campos editáveis e o card.
- Rótulos legíveis dos selects.
- Testes: regras puras de cards e as Server Actions novas (gate de sessão, publicado, preservação de campos do Global). As telas não têm teste de componente (a suíte roda em `node`), e a cobertura delas é o checkpoint visual.

## 8. Checkpoint visual (do PO, com o dev no ar)

1. Eventos → **Novo evento** → abre em edição, salvar rascunho, aparece na lista como Rascunho.
2. Palestrantes → **Novo palestrante** sem foto → recusa. Com tudo → salva, aparece na lista e no seletor de palestrantes de um evento.
3. Editar um palestrante existente (trocar a foto, mexer no currículo com negrito) → salvar → reabrir, negrito mantido → `/o-grupo/corpo-docente` mostra a foto nova.
4. No palestrante novo, ligar **"Aparece no Corpo Docente"**, tipo Card comum, preencher os textos → salvar → ele aparece no fim da página, no filtro da vertical escolhida.
5. **Corpo Docente** → subir o novo para o topo → Salvar ordem → página reflete.
6. Trocar para Destaque → aparece entre os destaques. Desligar a chave → some da página.
7. Ocultar do site um nome que está no Corpo Docente → some da página, e a tela Corpo Docente mostra o selo.
8. Desktop 1440 e mobile 375 das telas novas.
