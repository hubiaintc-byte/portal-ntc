# Importar PDF com extração e revisão editável — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O botão "Importar PDF" do Painel Admin extrai todos os campos do folder, cria o rascunho preenchido (incl. palestrantes) e abre a tela de detalhe em modo de edição completa para revisão e publicação.

**Architecture:** Parser determinístico por template em `apps/cms/src/lib/importacaoPdf/` (unpdf → texto por página → `DadosFolderEvento` → campos Payload com Lexical). Server Action `importarEventoPdf` ampliada devolve relatório. `DetalheEvento` ganha edição de todos os campos; `salvarCamposEvento` grava o conjunto completo em draft.

**Tech Stack:** Next 15 / Payload 3.18 / TypeScript strict / Vitest / unpdf.

## Global Constraints

- TypeScript strict, sem `any` (CLAUDE.md §4.4). Payload types de `@ntc/types`.
- Naming: componentes PascalCase PT, funções camelCase PT p/ conceitos editoriais (§4.2).
- Sem novas UI libs; única dependência nova aprovada: `unpdf` (spec, decisão 4).
- Import nunca falha por seção ausente — campo vazio + relatório (spec §1).
- Edições sempre em draft (`draft: true`); publicar é ação separada existente.
- Fixtures de teste = texto extraído **pelo unpdf** dos 5 folders reais da raiz (não usar outro extrator — whitespace difere).
- Spec: `docs/superpowers/specs/2026-07-09-importar-pdf-revisao-design.md`.

---

### Task 1: Infra — Vitest no apps/cms, unpdf e fixtures reais

**Files:**
- Modify: `apps/cms/package.json` (deps + script test)
- Create: `apps/cms/vitest.config.ts`
- Create: `apps/cms/src/lib/importacaoPdf/__fixtures__/{edutec-m01,edutec-m02,edutec-m04,proge-m01,proge-m03}.json`

**Interfaces:**
- Produces: fixtures JSON no formato `{ "arquivo": string, "paginas": string[] }`.

- [ ] **Step 1:** `pnpm --filter @ntc/cms add unpdf` e `pnpm --filter @ntc/cms add -D vitest`.
- [ ] **Step 2:** Criar `apps/cms/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

- [ ] **Step 3:** Em `apps/cms/package.json`, adicionar script `"test": "vitest run"`.
- [ ] **Step 4:** Gerar fixtures com o próprio unpdf (rodar na raiz do repo):

```bash
node --input-type=module -e '
import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";
const alvos = [
  ["Folder · Módulo 01 EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação · Instituto NTC do Brasil · 2026 - Nova Data.pdf", "edutec-m01"],
  ["Folder · Módulo 02 EDUTEC · Fluência Digital Docente e Práticas Pedagógicas Inovadoras · Instituto NTC do Brasil · 2026 - Nova Data (1).pdf", "edutec-m02"],
  ["Folder · Módulo 04 EDUTEC · Currículo e Computação_ Integrando a BNCC à Prática Pedagógica · Instituto NTC do Brasil · 2026 - Nova Data.pdf", "edutec-m04"],
  ["Folder · Módulo 01 PROGE · Gestão Escolar em Transformação_ Resultados, Recursos e Governança Democrática · Instituto NTC do Brasil · 2026 - Nova Data.pdf", "proge-m01"],
  ["Folder · Módulo 03 PROGE · Coordenação Pedagógica Estratégica_ Mentoria, Recomposição e Gestão da Aprendizagem · Instituto NTC do Brasil · 2026 - Nova Data.pdf", "proge-m03"],
];
for (const [arquivo, slug] of alvos) {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(arquivo)));
  const { text } = await extractText(pdf, { mergePages: false });
  await writeFile(
    `apps/cms/src/lib/importacaoPdf/__fixtures__/${slug}.json`,
    JSON.stringify({ arquivo, paginas: text }, null, 2),
  );
  console.log(slug, text.length, "páginas");
}'
```

Expected: 5 arquivos JSON, cada um com 13 páginas.
- [ ] **Step 5:** `pnpm --filter @ntc/cms test` → "no test files found" (ok). Commit: `chore(cms): adiciona vitest, unpdf e fixtures de folders para o parser`.

---

### Task 2: `extrairTextoPdf` + builders Lexical

**Files:**
- Create: `apps/cms/src/lib/importacaoPdf/extrairTextoPdf.ts`
- Create: `apps/cms/src/lib/lexicalBuilders.ts`
- Test: `apps/cms/src/lib/lexicalBuilders.test.ts`

**Interfaces:**
- Produces: `extrairTextoPdf(dados: Uint8Array): Promise<string[]>`;
  `paragrafosParaLexical(paragrafos: string[])`, `textoParaLexical(texto: string)`,
  `sessoesParaLexical(sessoes: { titulo: string; itens: string[] }[])` — retornam a árvore `{ root: {...} }` (mesmo shape do `richTextFromTexto` de `seedCorpoDocente.ts`).

- [ ] **Step 1:** Teste dos builders (parágrafo simples, lista, sessão com heading + lista; texto vazio → root com um parágrafo vazio).
- [ ] **Step 2:** RED: `pnpm --filter @ntc/cms test` falha (módulo inexistente).
- [ ] **Step 3:** Implementar `lexicalBuilders.ts` (nós `root/paragraph/heading/list/listitem/text` com `version: 1`, shape idêntico ao dos seeds) e `extrairTextoPdf.ts`:

```ts
import { extractText, getDocumentProxy } from "unpdf";

/** Extrai o texto de cada página do PDF (ordem do documento). */
export async function extrairTextoPdf(dados: Uint8Array): Promise<string[]> {
  const pdf = await getDocumentProxy(dados);
  const { text } = await extractText(pdf, { mergePages: false });
  return text;
}
```

- [ ] **Step 4:** GREEN. Commit: `feat(cms): extração de texto de PDF e builders Lexical para importação`.

---

### Task 3: Parser — utilidades e capa

**Files:**
- Create: `apps/cms/src/lib/importacaoPdf/parsearFolderEvento.ts`
- Test: `apps/cms/src/lib/importacaoPdf/parsearFolderEvento.test.ts`

**Interfaces (produz, usadas nas Tasks 4–7):**

```ts
export interface PalestranteFolder { nome: string; linhaTitulacao: string; minicurriculo: string }
export interface ItemProgramacaoFolder { horario: string; titulo: string; descricao: string | null; nomePalestrante: string | null }
export interface DiferencialFolder { titulo: string; descricao: string }
export interface SessaoConteudoFolder { titulo: string; itens: string[] }
export interface DadosFolderEvento {
  nome: string | null; eyebrow: string | null;
  modalidade: "online" | "presencial" | "hibrido" | null;
  resumo: string | null; dataInicioISO: string | null; cargaHoraria: string | null;
  sobre: string[]; publicoAlvo: string[]; objetivo: string[];
  diferenciais: DiferencialFolder[]; palestrantes: PalestranteFolder[];
  programacao: ItemProgramacaoFolder[]; sessoesConteudo: SessaoConteudoFolder[];
  valor: string | null; replayDisponivel: boolean; prazoReplay: string | null;
  plataforma: string | null;
}
export function parsearFolderEvento(paginas: string[]): DadosFolderEvento
```

Utilidades internas (exportadas para teste):

```ts
/** "C A R G A  H O R Á R I A" | "D AT A" → chave "CARGAHORARIA" | "DATA" (sem acentos/espaços/símbolos). */
export function chaveDeLinha(linha: string): string
/** true se a linha não tem minúsculas (candidata a marcador). */
export function ehLinhaMarcador(linha: string): boolean
/** "15 de Junho de 2026" → "2026-06-15" (null se não reconhecer). */
export function dataPtParaISO(texto: string): string | null
/** Acha o índice da página cujo topo contém a chave (ex.: "PROGRAMACAODETALHADA"). */
export function encontrarPagina(paginas: string[], chave: string): number
```

- [ ] **Step 1:** Testes com a fixture `edutec-m01.json`: `chaveDeLinha("D AT A  D O  E V E N T O") === "DATADOEVENTO"`; `dataPtParaISO("15 de Junho de 2026") === "2026-06-15"`; capa → `modalidade === "online"`, `nome === "Cultura Digital, Educação Midiática e Transformação da Educação"`, `dataInicioISO === "2026-06-15"`, `cargaHoraria === "08 horas"`, `eyebrow` contém "EDUTEC" e "MÓDULO 01", `resumo` começa com "Fundamentos, repertórios". Repetir asserts de modalidade/data nas outras 4 fixtures (todas online, datas próprias).
- [ ] **Step 2:** RED.
- [ ] **Step 3:** Implementar: capa = página 1; linhas normalizadas; modalidade por regex no texto integral da capa (`/h[ií]brid/i` → hibrido; `/on-?line/i` → online; `/presencial/i` → presencial; senão null). `nome` = linhas entre a linha de modalidade (1ª linha) e o primeiro marcador, unidas com espaço. `DATA` → linha seguinte; `CARGAHORARIA` → linha seguinte. `eyebrow` = linha-marcador cuja chave contém `TRILHA` ou `MODULO`, desespaçada para exibição (reconstruir com `·`). `resumo` = primeira linha não-marcador após o eyebrow (agregando continuações até ponto final). Demais campos desta task devolvem vazio/null.
- [ ] **Step 4:** GREEN. Commit: `feat(cms): parser de folder — utilidades e capa (nome, modalidade, data, carga)`.

---

### Task 4: Parser — seções de texto (sobre, objetivo/público, diferenciais, sessões)

**Files:**
- Modify: `apps/cms/src/lib/importacaoPdf/parsearFolderEvento.ts`
- Test: idem Task 3.

- [ ] **Step 1:** Testes (fixture edutec-m01): `sobre[0]` começa com "ste módulo aborda" OU "Este módulo aborda" (tratar drop-cap: se o 1º parágrafo começa com letra isolada na linha anterior, recolar); `publicoAlvo.length > 0`; `objetivo[0]` contém "Compreender os fundamentos"; `diferenciais.length >= 5` e cada um com `descricao` terminando em "."; `sessoesConteudo.length === 4` com `itens.length >= 5` cada.
- [ ] **Step 2:** RED.
- [ ] **Step 3:** Implementar:
  - `SOBREESTEMODULO`: parágrafos da página (linhas até próximo marcador, agrupadas por sentença; recolar drop-cap "E\nste módulo…" → "Este módulo…").
  - `OBJETIVOPUBLICOFORMATO`: dentro da página, submarcadores `OBJETIVO` → parágrafo seguinte até próximo marcador; `PUBLICO`/`PUBLICOALVO` idem.
  - `DESTAQUESDIFERENCIAIS`: após a linha "Destaques formativos" (ou primeiro marcador da lista), agrupar linhas em sentenças (quebra em "."); cada sentença vira `{ titulo: "", descricao: sentença }`.
  - `OQUEVOCEAPRENDERA` (2 páginas): submarcador `SESSAO01..NN` → título = linhas seguintes até a linha "com …"; itens = textos após cada número isolado (`/^\d{2}$/`).
- [ ] **Step 4:** GREEN em todas as 5 fixtures. Commit: `feat(cms): parser de folder — sobre, objetivo, público, diferenciais e sessões`.

---

### Task 5: Parser — programação, palestrantes, valor, replay, plataforma

**Files/Test:** idem Task 4.

- [ ] **Step 1:** Testes (edutec-m01): `programacao.length === 4`, primeiro item `{ horario: "08h00 – 10h00", titulo: /Cultura digital e os novos paradigmas/, nomePalestrante: "Roberta Aquino" }`; `palestrantes.length === 3` com nomes `["Roberta Aquino", "Mariana Ochs", "Karla Priscilla"]`, `linhaTitulacao` contendo "UNICAMP" para a primeira e `minicurriculo.length > 100`; `valor === "R$ 1.470"`; `replayDisponivel === true`; `prazoReplay` contém "7 dias"; `plataforma === "EventON NTC"`. Asserts de contagem>0 nas demais fixtures.
- [ ] **Step 2:** RED.
- [ ] **Step 3:** Implementar:
  - `PROGRAMACAODETALHADA`: varrer linhas; item inicia em `/^\d{2}h\d{2}\s*[–-]\s*\d{2}h\d{2}$/` (ignorar a linha-resumo com "·"); pular a linha-marcador de categoria (`PALESTRA01` etc.); título = linhas até a linha `/^com\s/i`; `nomePalestrante` = trecho de "com " até o primeiro "·"; descrição = linhas seguintes (bullets "·") até o próximo horário.
  - `CONHECANOSSOSPALESTRANTES`: após as 2 linhas de subtítulo, alternância nome (linha curta em caixa mista, sem "·" e sem ponto final) → linhas em CAPS = `linhaTitulacao` (concatenar até voltar caixa mista) → parágrafo = `minicurriculo` até o próximo nome.
  - `INVESTIMENTOPORPARTICIPANTE`: primeira linha `/^[\d.,]+$/` após o marcador → `valor = "R$ " + linha`.
  - `REPLAY` (página `AGENDAAMBIENTEVIRTUAL…`): linhas após o marcador `REPLAY` até o próximo marcador → `prazoReplay` = junção ("Por até 7 dias após a realização do evento"), `replayDisponivel = true` se achou.
  - `PLATAFORMAEVENTONNTC` presente → `plataforma = "EventON NTC"`.
- [ ] **Step 4:** GREEN nas 5 fixtures. Commit: `feat(cms): parser de folder — programação, palestrantes, valor e replay`.

---

### Task 6: `montarCamposEvento`

**Files:**
- Create: `apps/cms/src/lib/importacaoPdf/montarCamposEvento.ts`
- Test: `apps/cms/src/lib/importacaoPdf/montarCamposEvento.test.ts`

**Interfaces:**
- Consumes: `DadosFolderEvento`, builders da Task 2.
- Produces:

```ts
export interface CamposEventoImportado {
  data: Record<string, unknown>;        // pronto p/ payload.create/update em eventos
  preenchidos: string[];                // rótulos PT dos campos com valor
  vazios: string[];                     // rótulos PT dos campos sem valor
}
export function montarCamposEvento(dados: DadosFolderEvento): CamposEventoImportado
```

- [ ] **Step 1:** Testes: com o parse da fixture edutec-m01, `data.modalidade === "online"`, `data.dataInicio === "2026-06-15"`, `data.valor === "R$ 1.470"`, `data.replayDisponivel === true`, `data.prazoReplay` presente, `data.local` com `nomeLocal === "EventON NTC"`, `data.programacaoDetalhada` com 4 itens `{ horario, titulo, descricao }` (descricao inclui "com Fulano" quando houver), `data.diferenciais` não vazio, richTexts (`publicoAlvo`, `objetivos`, `conteudoProgramatico`) com `root.children.length > 0`, `data.resumo.length <= 280`; `vazios` inclui "FAQ". Com `DadosFolderEvento` totalmente nulo → `data` só com chaves seguras e `vazios` listando tudo.
- [ ] **Step 2:** RED.
- [ ] **Step 3:** Implementar mapeamento (objetivos = `objetivo` + `sobre` como parágrafos; conteúdo programático = `sessoesParaLexical`; campo sem dado é OMITIDO de `data` e entra em `vazios`).
- [ ] **Step 4:** GREEN. Commit: `feat(cms): montagem dos campos Payload a partir do folder parseado`.

---

### Task 7: Palestrantes (casar/criar) + `criarEventoDePdf` ampliado

**Files:**
- Create: `apps/cms/src/lib/importacaoPdf/casarOuCriarPalestrantes.ts`
- Test: `apps/cms/src/lib/importacaoPdf/casarOuCriarPalestrantes.test.ts`
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts` (`criarEventoDePdf`, `ResultadoImportacao`)
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (repassar relatório)

**Interfaces:**

```ts
// casarOuCriarPalestrantes.ts — payload tipado estruturalmente p/ permitir mock no teste
export interface PayloadPalestrantes {
  find(args: { collection: "especialistas"; limit: number; depth: 0; overrideAccess: true }): Promise<{ docs: { id: string | number; nome: string }[] }>;
  create(args: { collection: "especialistas"; data: Record<string, unknown>; overrideAccess: true }): Promise<{ id: string | number }>;
}
export interface ResultadoPalestrantes { ids: (string | number)[]; vinculados: string[]; criados: string[]; pendentes: string[] }
export function normalizarNome(nome: string): string   // minúsculo, sem acentos, espaços colapsados
export function mapearTitulacao(linha: string): "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao"
export async function casarOuCriarPalestrantes(payload: PayloadPalestrantes, palestrantes: PalestranteFolder[]): Promise<ResultadoPalestrantes>

// painelCmsEscrita.ts
export interface RelatorioImportacao { preenchidos: string[]; vazios: string[]; palestrantesVinculados: string[]; palestrantesCriados: string[]; avisos: string[] }
export interface ResultadoImportacao extends ResultadoEscrita { eventoId?: string; nome?: string; relatorio?: RelatorioImportacao }
```

- [ ] **Step 1:** Testes com mock: nome existente (com acento/caixa diferente) → vinculado, não criado; desconhecido → `create` chamado com `ocultarDoSite: true`, `titulacao` mapeada da linha ("DOUTORA EM CIÊNCIAS · UNICAMP" → "doutorado"; "PÓS-DOUTORADO" → "pos-doutorado"; "MESTRE EM X" → "mestrado"; sem pista → "especializacao"), `instituicao` = trecho após primeiro "·" da linha (fallback `"[instituição a confirmar]"`), `curriculoCurto` = Lexical do minicurrículo; `create` que lança → entra em `pendentes`, não explode.
- [ ] **Step 2:** RED. **Step 3:** Implementar. **Step 4:** GREEN.
- [ ] **Step 5:** `criarEventoDePdf`: após upload do media (código atual), `extrairTextoPdf` → texto vazio/erro ⇒ fluxo atual + `avisos: ["Não foi possível ler o texto do PDF…"]`; senão `parsearFolderEvento` → `montarCamposEvento` → `casarOuCriarPalestrantes(payload, dados.palestrantes)` → `payload.create` do evento draft com `{ ...camposMontados.data, nome: dados.nome ?? nomeProvisorio, folderPdf: media.id, palestrantes: ids, _status: "draft" }`. Try/catch no parse inteiro: falha ⇒ fallback ao create atual + aviso (spec §6). Montar `relatorio`.
- [ ] **Step 6:** `pnpm --filter @ntc/cms typecheck` + testes GREEN. Commit: `feat(cms): importação de PDF preenche evento completo com palestrantes e relatório`.

---

### Task 8: Leitura — `EventoCmsDetalhe` estendido p/ edição

**Files:**
- Modify: `apps/cms/src/lib/cms/lexical.ts` (novo `lexicalParaTexto`)
- Modify: `apps/cms/src/lib/cms/painelCms.ts` (`EventoCmsDetalhe` + `obterEventoCms`)
- Test: `apps/cms/src/lib/cms/lexical.test.ts`

**Interfaces:**

```ts
// lexical.ts
export function lexicalParaTexto(doc: unknown): string  // parágrafos → linhas \n; listitems → "- item"; headings → linha própria

// painelCms.ts — acréscimos em EventoCmsDetalhe
modalidadeValor: string | null;   // "online" | "presencial" | "hibrido" (bruto p/ select)
dataFimISO: string | null;
localNome: string | null; localEndereco: string | null; localCidade: string | null; localEstado: string | null;
publicoAlvoTexto: string; objetivosTexto: string; conteudoProgramaticoTexto: string;
programacaoDetalhada: { horario: string; titulo: string; descricao: string }[];
diferenciais: { titulo: string; descricao: string }[];
faqEditavel: { pergunta: string; respostaTexto: string }[];
replayDisponivel: boolean; prazoReplay: string | null;
```

- [ ] **Step 1:** Teste de `lexicalParaTexto` (parágrafos, lista, heading, doc null → "").
- [ ] **Step 2:** RED → implementar → GREEN.
- [ ] **Step 3:** Estender `obterEventoCms` populando os novos campos (mesma query; mapear `local.*`, arrays com defaults `[]`). `pnpm --filter @ntc/cms typecheck` limpo. Commit: `feat(cms): detalhe de evento expõe todos os campos editáveis ao painel`.

---

### Task 9: Escrita — `salvarCamposEvento` completo

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts` (`CamposTextoEvento` → `CamposEventoCompletos`)
- Modify: `apps/cms/src/app/(painel)/acoes.ts` (`salvarEvento` repassa o tipo novo)

**Interfaces:**

```ts
export interface CamposEventoCompletos {
  nome: string; dataInicio: string; dataFim: string; resumo: string;
  modalidade: string; cargaHoraria: string; valor: string; linkInscricaoExterna: string;
  localNome: string; localEndereco: string; localCidade: string; localEstado: string;
  replayDisponivel: boolean; prazoReplay: string;
  publicoAlvoTexto: string; objetivosTexto: string; conteudoProgramaticoTexto: string;
  programacaoDetalhada: { horario: string; titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; respostaTexto: string }[];
}
export async function salvarCamposEvento(id: string, campos: CamposEventoCompletos): Promise<ResultadoEscrita>
```

- [ ] **Step 1:** Implementar conversões: `*Texto` → `textoParaLexical` (linhas iniciadas com "- " viram lista; demais, parágrafos); strings vazias → `null` no Payload; `dataFim`/`prazoReplay` vazios omitidos; `faq.respostaTexto` → Lexical. Sempre `draft: true`.
- [ ] **Step 2:** `salvarEvento` em `acoes.ts` muda a assinatura para `CamposEventoCompletos`. `typecheck` limpo (o `DetalheEvento` quebra até a Task 10 — fazer as duas no mesmo commit se necessário; alternativa: commit conjunto no fim da Task 10). Commit junto com Task 10.

---

### Task 10: UI — `DetalheEvento` edição completa + modal com "Revisar evento"

**Files:**
- Modify: `apps/cms/src/app/(painel)/DetalheEvento.tsx`
- Modify: `apps/cms/src/app/(painel)/ModalImportarPdf.tsx`
- Modify: `apps/cms/src/app/(painel)/TelaEventos.tsx`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx`
- Modify: `apps/cms/src/app/(painel)/painel.css` (se precisar de grid p/ linhas de lista)

**Interfaces:**
- `DetalheEvento` ganha prop `edicaoInicial?: boolean` (default false).
- `ModalImportarPdf` ganha prop `onImportado: (eventoId: string) => void` e exibe `relatorio` (preenchidos/vazios/palestrantes criados/avisos) na fase sucesso + botão `"Revisar evento"`.
- `TelaEventos` ganha prop `onAbrirImportado: (id: string) => void` e repassa ao modal.
- `ShellCms`: `abrirEvento(id, emEdicao = false)` guarda `eventoEmEdicao` e passa `edicaoInicial` ao `DetalheEvento`; `TelaEventos` recebe `onAbrirImportado={(id) => abrirEvento(id, true)}`.

- [ ] **Step 1:** `DetalheEvento`: estado de edição inicializa de `edicaoInicial`; formulário de edição em seções espelhando a leitura:
  - *Identidade:* nome, eyebrow(ro), resumo (textarea, maxLength 280);
  - *Agenda:* dataInicio/dataFim (`type="date"`), modalidade (`<select>` online/presencial/hibrido), carga horária, replay (checkbox + prazo);
  - *Local:* nome, endereço, cidade, UF (maxLength 2);
  - *Inscrição:* valor, link externo;
  - *Textos:* público-alvo, objetivos, conteúdo programático (textareas com hint "uma linha por parágrafo; use '- ' para itens de lista");
  - *Programação:* linhas `{horario, titulo, descricao}` com botões "Adicionar sessão"/"Remover";
  - *Diferenciais* e *FAQ:* idem (titulo+descricao / pergunta+resposta).
  Todos `<label htmlFor>` (WCAG §10). Salvar → `salvarEvento(id, camposCompletos)`.
- [ ] **Step 2:** `ModalImportarPdf`: fase sucesso lista `relatorio.preenchidos.length` campos ok, chips/linhas para `vazios`, `palestrantesCriados` ("criado oculto"), `avisos`; botões "Revisar evento" (→ `onImportado(eventoId)` e fecha) e "Concluir".
- [ ] **Step 3:** Wiring `TelaEventos`/`ShellCms` conforme Interfaces.
- [ ] **Step 4:** `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms lint && pnpm --filter @ntc/cms test` limpos. Commit (Tasks 9+10): `feat(cms): revisão editável completa do evento importado no painel`.

---

### Task 11: Verificação final e checkpoint

- [ ] **Step 1:** `pnpm build` (monorepo) sem erros.
- [ ] **Step 2:** `pnpm dev:cms` + importar um folder real pelo painel local; conferir: campos preenchidos, palestrantes vinculados/criados ocultos, tela abre em edição, salvar e publicar funcionam (publicar pode ficar para o PO).
- [ ] **Step 3:** Deixar servidor no ar e entregar ao PO para validação visual (memória `feedback_validacao_visual`). Não declarar pronto antes disso.
- [ ] **Step 4:** Push (deploy automático do CMS na Vercel) **somente após aprovação visual do PO**.
