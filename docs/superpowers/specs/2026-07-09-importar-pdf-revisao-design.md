# Importar PDF de evento com extração automática e revisão editável

**Data:** 09/07/2026 · **Status:** aprovado pelo PO · **Escopo:** Painel Admin (`apps/cms`)

## Problema

O botão "Importar PDF" do Painel Admin hoje só anexa o folder a um rascunho de
evento com nome provisório — a extração dos campos é feita fora do sistema
(porta manual via Claude no chat). A tela `DetalheEvento` só permite editar
nome, data e resumo; o restante é somente leitura.

## Fluxo aprovado

Importar PDF → o sistema lê o folder e preenche todos os campos → tela de
revisão com tudo preenchido e **editável** → Publicar → página no ar em
`/agenda/[slug]` (o site já renderiza eventos 100% CMS quando o slug não tem
versão estática).

## Decisões do PO (09/07/2026)

1. **Extração por parser de template, sem IA** — código determinístico
   calibrado no layout dos folders "Nova Data" do Instituto. Sem custo por uso.
2. **Palestrantes: vincular existentes + criar novos** — casamento por nome
   normalizado; desconhecidos são criados com `ocultarDoSite: true`.
3. **Revisão na própria tela `DetalheEvento`** (Opção A) — o modo de edição
   passa a cobrir todos os campos; nada de wizard dedicado.
4. **Dependência nova aprovada:** `unpdf` (extração de texto de PDF em Node,
   base pdf.js) — somente em `apps/cms`.

## Arquitetura

### 1. Parser — `apps/cms/src/lib/importacaoPdf/`

| Arquivo | Responsabilidade |
| --- | --- |
| `extrairTextoPdf.ts` | Buffer do PDF → `string[]` (texto por página), via `unpdf`. |
| `parsearFolderEvento.ts` | Páginas → `DadosFolderEvento` (objeto tipado, tudo opcional). |
| `montarCamposEvento.ts` | `DadosFolderEvento` → campos da coleção `eventos` do Payload, incluindo builders de richText Lexical (`paragrafosParaLexical`, `listaParaLexical`). |

O parser localiza seções pelos títulos em maiúsculas espaçadas do template
(normalizando `D A T A` → `DATA`):

| Marcador no folder | Campo(s) extraído(s) |
| --- | --- |
| Capa (pág. 1) | `nome` (linhas de título), modalidade por palavra-chave ("Seminário On-Line ao Vivo" → `online`; "Híbrido" → `hibrido`; "Presencial" → `presencial`), `eyebrow` ("TRILHA EDUTEC · MÓDULO 01 · 2026"), `resumo` (frase-síntese da capa) |
| `DATA` | `dataInicio` (pt-BR "15 de Junho de 2026" → ISO) |
| `CARGA HORÁRIA` | `cargaHoraria` |
| `SOBRE ESTE MÓDULO` | `objetivos` (richText) |
| `OBJETIVO · PÚBLICO · FORMATO` | `publicoAlvo` (richText), complementa objetivos/formato |
| `DESTAQUES · DIFERENCIAIS` | `diferenciais[]` (título + descrição) |
| `CONHEÇA NOSSOS PALESTRANTES` | palestrantes: nome, linha de titulação/instituição, minicurrículo |
| `PROGRAMAÇÃO DETALHADA` | `programacaoDetalhada[]`: horário (`08h00 – 10h00`), título, descrição, nome do palestrante (linha "com Fulano · …") |
| `O QUE VOCÊ APRENDERÁ` | `conteudoProgramatico` (richText: sessões + perguntas numeradas) |
| `REPLAY` / `AGENDA · AMBIENTE VIRTUAL` | `replayDisponivel`, `prazoReplay`, plataforma (EventON) |
| `INVESTIMENTO` | `valor` |

**Regra de resiliência:** seção ausente ⇒ campo vazio (aparece vazio na
revisão). O import **nunca** falha por seção faltante. PDF sem texto
extraível (só imagem) ⇒ comportamento atual (rascunho vazio) + aviso no modal.

### 2. Palestrantes

- Normalização de nome (minúsculas, sem acentos, espaços colapsados) para
  casar com `especialistas` existentes via Local API.
- Não encontrado ⇒ `payload.create` em `especialistas` com
  `ocultarDoSite: true` e campos obrigatórios derivados do PDF (nome,
  titulação/instituição da linha em caps, `curriculoCurto` do minicurrículo).
- Todos os ids (existentes + criados) são vinculados em
  `eventos.palestrantes`.

### 3. Server Action `importarEventoPdf` (ampliada)

Upload do media (inalterado) → extrair texto → parsear → criar rascunho com
todos os campos + palestrantes → retornar `{ ok, eventoId, nome, relatorio }`,
onde `relatorio` lista campos preenchidos e campos vazios.

### 4. UI

- **`ModalImportarPdf`**: a fase de sucesso mostra o relatório da extração e o
  botão **"Revisar evento"**, que abre o `DetalheEvento` do rascunho criado
  **já em modo de edição** (callback `onImportado(eventoId)` para o pai).
- **`DetalheEvento`**: o modo de edição passa a cobrir todos os campos:
  - meta: modalidade (select), `dataInicio`/`dataFim`, local (nome, endereço,
    cidade, UF), carga horária, valor, link de inscrição, replay;
  - textos: resumo, público-alvo, objetivos, conteúdo programático —
    textareas; conversão para Lexical em parágrafos/listas no salvar;
  - listas: programação detalhada, diferenciais e FAQ com editores de
    linha (adicionar/remover/editar);
  - palestrantes: continua no `SeletorPalestrantes` existente.
- `salvarEvento`/`salvarCamposEvento` ampliados para o conjunto completo,
  sempre em draft (`project_cms_edicao_salva_no_rascunho`); **Publicar**
  existente fecha o fluxo e o `afterChange` revalida `/agenda` +
  `/agenda/:slug`.

### 5. Testes

- Vitest no parser com fixtures = texto extraído dos 5 folders reais da raiz
  do repo, versionado como `.json` de páginas em
  `apps/cms/src/lib/importacaoPdf/__fixtures__/` (os PDFs não entram no git).
- Casos: modalidade, data ISO, carga horária, valor, contagem/horários da
  programação, nomes dos palestrantes, diferenciais, resiliência (página
  faltando ⇒ campo vazio, texto vazio ⇒ `null`).

### 6. Tratamento de erros

| Falha | Comportamento |
| --- | --- |
| PDF sem texto (escaneado) | Rascunho como hoje + aviso "não foi possível ler o texto; preencha manualmente". |
| Seção não encontrada | Campo vazio, listado no relatório do modal. |
| Erro ao criar especialista | Não bloqueia o evento; palestrante entra no relatório como pendente. |
| Falha total do parse | Fallback ao fluxo atual (rascunho + folder anexado). |

## Fora de escopo

- 2FA do admin (pendência própria, decisão do PO de 09/07).
- Botões "Novo evento"/"Novo palestrante" manuais (backlog §19.2 item 3).
- Notificação Resend, anti-spam (backlog itens 4–5).
- Folders fora do template "Nova Data" — extração parcial é aceitável; a tela
  de revisão é a rede de segurança.

## Riscos

- Mudança de layout dos folders quebra seções específicas do parser —
  mitigado pela regra de resiliência + revisão humana obrigatória no fluxo.
- Campos obrigatórios de `especialistas` que o PDF não fornece: preencher com
  o disponível; se a validação recusar, cair no relatório como pendente.
