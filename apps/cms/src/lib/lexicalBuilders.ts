/**
 * Builders de richText Lexical para escrita via Local API — usados pela
 * importação de PDF e pelo salvar do Painel Admin. Mesmo shape dos seeds
 * (seedCorpoDocente.richTextFromTexto): nós root/paragraph/heading/list/
 * listitem/text com version: 1.
 */

export interface NoTextoLexical {
  type: "text";
  format: number;
  mode: "normal";
  style: "";
  text: string;
  version: 1;
  detail: 0;
}

export interface NoBlocoLexical {
  type: string;
  format: "";
  indent: 0;
  version: 1;
  direction: "ltr";
  children: unknown[];
  [extra: string]: unknown;
}

export interface DocumentoLexical {
  root: {
    type: "root";
    format: "";
    indent: 0;
    version: 1;
    direction: "ltr";
    children: unknown[];
  };
}

function noTexto(texto: string): NoTextoLexical {
  return { type: "text", format: 0, mode: "normal", style: "", text: texto, version: 1, detail: 0 };
}

function noParagrafo(texto: string): NoBlocoLexical {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [noTexto(texto)],
  };
}

function noHeading(texto: string): NoBlocoLexical {
  return {
    type: "heading",
    tag: "h3",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [noTexto(texto)],
  };
}

function noLista(itens: string[]): NoBlocoLexical {
  return {
    type: "list",
    listType: "bullet",
    tag: "ul",
    start: 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: itens.map((item, i) => ({
      type: "listitem",
      value: i + 1,
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [noTexto(item)],
    })),
  };
}

function documento(children: unknown[]): DocumentoLexical {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: children.length > 0 ? children : [noParagrafo("")],
    },
  };
}

/** Cada string vira um parágrafo. */
export function paragrafosParaLexical(paragrafos: string[]): DocumentoLexical {
  return documento(paragrafos.filter((p) => p.trim().length > 0).map((p) => noParagrafo(p.trim())));
}

/**
 * Núcleo de conversão linha a linha. Com `subtitulos`, uma linha iniciada
 * por "## " vira heading h3; sem ela, "## " é texto comum de parágrafo.
 */
function converterLinhas(texto: string, subtitulos: boolean): DocumentoLexical {
  const linhas = texto.split("\n").map((l) => l.trim());
  const children: unknown[] = [];
  let itensLista: string[] = [];

  function fecharLista() {
    if (itensLista.length > 0) {
      children.push(noLista(itensLista));
      itensLista = [];
    }
  }

  for (const linha of linhas) {
    if (linha.startsWith("- ")) {
      itensLista.push(linha.slice(2).trim());
      continue;
    }
    fecharLista();
    if (linha.length === 0) continue;
    if (subtitulos && linha.startsWith("## ")) {
      children.push(noHeading(linha.slice(3).trim()));
    } else {
      children.push(noParagrafo(linha));
    }
  }
  fecharLista();
  return documento(children);
}

/**
 * Texto livre do editor → Lexical: linhas viram parágrafos; sequências de
 * linhas iniciadas com "- " viram lista com marcadores.
 */
export function textoParaLexical(texto: string): DocumentoLexical {
  return converterLinhas(texto, false);
}

/**
 * Como `textoParaLexical`, mas reconhecendo a convenção dos textos
 * institucionais da proposta (`packages/lib/src/crm/textosProposta.ts`):
 * uma linha iniciada por "## " é um subtítulo e vira heading h3. Função
 * separada de propósito — `textoParaLexical` serve a importação de PDF e ao
 * salvar do painel, onde "## " é texto literal do editor.
 */
export function textoComSubtitulosParaLexical(texto: string): DocumentoLexical {
  return converterLinhas(texto, true);
}

/** Sessões (título + itens) → heading h3 seguido de lista, por sessão. */
export function sessoesParaLexical(
  sessoes: { titulo: string; itens: string[] }[],
): DocumentoLexical {
  const children: unknown[] = [];
  for (const sessao of sessoes) {
    if (sessao.titulo.trim().length > 0) children.push(noHeading(sessao.titulo.trim()));
    const itens = sessao.itens.filter((i) => i.trim().length > 0);
    if (itens.length > 0) children.push(noLista(itens));
  }
  return documento(children);
}

/* ------------------------------------------------------------------------ *
 * Caminho de volta: Lexical -> texto puro editável
 * ------------------------------------------------------------------------ */

/** Blocos de topo de um documento Lexical; `[]` para documento ausente/inválido. */
function blocosDeTopo(documento: unknown): unknown[] {
  if (documento === null || typeof documento !== "object" || !("root" in documento)) return [];
  const root = (documento as { root?: { children?: unknown[] } }).root;
  return Array.isArray(root?.children) ? root.children : [];
}

/** Texto corrido de um nó, descendo nos filhos. Formatação inline se perde. */
function textoInline(no: unknown): string {
  if (no === null || typeof no !== "object") return "";
  const n = no as Record<string, unknown>;
  if (n.type === "text") return String(n.text ?? "");
  // Mesma escolha de `lexicalParaTexto` (lib/cms/lexical.ts): soft break vira
  // espaço, nunca "\n" — uma quebra dentro do parágrafo não pode virar
  // parágrafo novo ao reconverter.
  if (n.type === "linebreak") return " ";
  if (Array.isArray(n.children)) return n.children.map(textoInline).join("");
  return "";
}

/** Um bloco de topo como uma ou mais linhas de texto puro. */
function blocoParaTextoComSubtitulos(no: unknown): string {
  if (no === null || typeof no !== "object") return "";
  const n = no as Record<string, unknown>;
  if (n.type === "list") {
    // Itens em linhas CONSECUTIVAS: uma linha em branco entre eles faria
    // `converterLinhas` fechar a lista e abrir outra.
    return (Array.isArray(n.children) ? n.children : [])
      .map((item) => textoInline(item).trim())
      .filter((t) => t.length > 0)
      .map((t) => `- ${t}`)
      .join("\n");
  }
  const texto = textoInline(no).trim();
  if (texto.length === 0) return "";
  return n.type === "heading" ? `## ${texto}` : texto;
}

/**
 * Inverso fiel de `textoComSubtitulosParaLexical`, para a tela editar o
 * conteúdo do documento da proposta como texto puro (Task 13 da Sessão 2):
 *
 * - parágrafo vira uma linha, e os blocos são separados por LINHA EM BRANCO;
 * - item de lista vira uma linha `- item`, itens em linhas consecutivas;
 * - heading (`h3` dos subtítulos) vira uma linha `## Subtítulo`.
 *
 * Reconverter a saída com `textoComSubtitulosParaLexical` devolve o mesmo
 * documento, bloco a bloco — é o que mantém o ciclo editar → salvar → editar
 * sem corromper o texto. O que NÃO sobrevive é a formatação inline
 * (negrito/itálico) e o nó de tabela/bloco não previsto: mesma troca aceita
 * por `lexicalParaTexto` no editor de eventos.
 */
export function lexicalParaTextoComSubtitulos(documento: unknown): string {
  return blocosDeTopo(documento)
    .map(blocoParaTextoComSubtitulos)
    .filter((b) => b.length > 0)
    .join("\n\n");
}

/**
 * O documento Lexical tem algo que o texto puro NÃO carrega — isto é, algo que
 * `lexicalParaTextoComSubtitulos` + `textoComSubtitulosParaLexical` não
 * devolvem igual? Hoje:
 *
 * - nó de texto com `format` ≠ 0 (negrito, itálico, sublinhado…);
 * - lista numerada (`listType: "number"`), que volta como lista com marcadores;
 * - heading de nível diferente de h3, que volta como h3 (a convenção "## ");
 * - `linebreak`, que volta como espaço.
 *
 * Serve para a tela avisar, ANTES de alguém salvar, que salvar aquela seção
 * remove os destaques — o conteúdo importado dos 15 programas (v3.2) tem
 * dezenas de `<strong>` convertidos em `format: 1`. Editor com formatação é
 * escopo da Sessão 5 (spec §5.2); aqui só se avisa.
 */
export function temFormatacaoPerdidaNoTextoPuro(documento: unknown): boolean {
  return blocosDeTopo(documento).some((bloco) => blocoPerdeFormatacao(bloco));
}

function blocoPerdeFormatacao(no: unknown): boolean {
  if (no === null || typeof no !== "object") return false;
  const n = no as Record<string, unknown>;
  if (n.type === "list" && n.listType === "number") return true;
  if (n.type === "heading" && typeof n.tag === "string" && n.tag !== "h3") return true;
  return noPerdeFormatacao(n);
}

function noPerdeFormatacao(no: unknown): boolean {
  if (no === null || typeof no !== "object") return false;
  const n = no as Record<string, unknown>;
  if (n.type === "linebreak") return true;
  if (n.type === "text" && Number(n.format ?? 0) !== 0) return true;
  return Array.isArray(n.children) && n.children.some((f) => noPerdeFormatacao(f));
}
