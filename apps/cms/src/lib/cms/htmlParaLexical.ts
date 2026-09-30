/**
 * HTML → Lexical (conversor de importação editorial).
 *
 * Converte o HTML estático que hoje vive embutido nos arquivos
 * `conteudo<SIGLA>.ts` de `apps/web/app/(programas)/programas/[slug]/` —
 * campos como `corpoHtml` — no formato richText (Lexical) que o Payload
 * grava. Usado pelo importador da Task 2; nada aqui toca o banco nem
 * importa Payload — função pura, sem I/O.
 *
 * Direção oposta de `lexical.ts` (Lexical → HTML), que mora ao lado.
 *
 * Sem dependência nova (CLAUDE.md §5.4): nenhum parser de HTML de
 * terceiros. O "parser" é uma varredura por regex sobre um subconjunto
 * fechado de tags — suficiente porque a fonte é HTML estático, escrito à
 * mão pela própria equipe, não HTML arbitrário de terceiros.
 *
 * Subconjunto suportado: `p`, `strong`/`b`, `em`/`i`, `br`, `ul`, `ol`,
 * `li`. Qualquer outra tag é desembrulhada — o conteúdo permanece, a tag
 * some — e o nome dela (em minúsculas) entra em `tagsIgnoradas` uma única
 * vez, na ordem em que foi encontrada. Isso cobre o caso real dos
 * `corpoHtml` dos programas: `<div class="results-grid">`/`<span
 * class="r-num">` ao redor de conteúdo que deve ser preservado.
 */

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

export interface ResultadoConversao {
  doc: DocumentoLexical;
  tagsIgnoradas: string[];
}

interface NoTextoLexical {
  type: "text";
  format: number;
  mode: "normal";
  style: "";
  text: string;
  version: 1;
  detail: 0;
}

const TAGS_SUPORTADAS = new Set(["p", "strong", "b", "em", "i", "br", "ul", "ol", "li"]);

// Entidades nomeadas que aparecem nos arquivos de conteúdo dos programas,
// mais o caminho numérico (&#NNN;) tratado à parte em decodificarEntidades.
const ENTIDADES_NOMEADAS: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  nbsp: " ",
  atilde: "ã",
  ccedil: "ç",
  eacute: "é",
  aacute: "á",
  oacute: "ó",
  ecirc: "ê",
  ocirc: "ô",
  uacute: "ú",
  iacute: "í",
  agrave: "à",
  otilde: "õ",
};

function decodificarEntidades(texto: string): string {
  return texto.replace(/&(#\d+|[a-zA-Z]+);/g, (bruto, codigo: string) => {
    if (codigo.startsWith("#")) {
      const codigoPonto = Number(codigo.slice(1));
      return Number.isFinite(codigoPonto) ? String.fromCharCode(codigoPonto) : bruto;
    }
    return ENTIDADES_NOMEADAS[codigo] ?? bruto;
  });
}

function noTexto(texto: string, format: number): NoTextoLexical {
  return { type: "text", format, mode: "normal", style: "", text: texto, version: 1, detail: 0 };
}

function noParagrafo(children: unknown[]): unknown {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: children.length > 0 ? children : [noTexto("", 0)],
  };
}

function noListItem(children: unknown[], indice: number): unknown {
  return {
    type: "listitem",
    value: indice,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children,
  };
}

function noLista(itensHtml: string[], ordenada: boolean): unknown {
  return {
    type: "list",
    listType: ordenada ? "number" : "bullet",
    tag: ordenada ? "ol" : "ul",
    start: 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: itensHtml.map((itemHtml, i) => noListItem(parseInline(itemHtml), i + 1)),
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
      children: children.length > 0 ? children : [noParagrafo([])],
    },
  };
}

/**
 * Remove tags fora do subconjunto suportado, preservando o conteúdo
 * interno; registra o nome de cada uma (uma vez, na primeira ocorrência)
 * em `ignoradas`. Abertura e fechamento são varridos e removidos à parte
 * — não precisam ser balanceados para isso funcionar.
 */
function removerTagsDesconhecidas(html: string, ignoradas: Set<string>): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, nomeTag: string) => {
    const nome = nomeTag.toLowerCase();
    if (TAGS_SUPORTADAS.has(nome)) return match;
    ignoradas.add(nome);
    return "";
  });
}

/**
 * Converte o conteúdo inline (texto + strong/b/em/i/br) de um bloco em
 * nós text/linebreak Lexical. `format` do nó de texto: 0 normal, 1
 * negrito, 2 itálico, 3 negrito+itálico (bitfield do Lexical).
 */
function parseInline(html: string): unknown[] {
  const nodes: unknown[] = [];
  const tokenRegex = /<(\/)?(strong|b|em|i|br)\b[^>]*?>/gi;
  let negrito = 0;
  let italico = 0;
  let ultimoIndex = 0;
  let match: RegExpExecArray | null;

  const empurrarTexto = (bruto: string) => {
    const texto = decodificarEntidades(bruto);
    if (texto.length === 0) return;
    const format = (negrito > 0 ? 1 : 0) | (italico > 0 ? 2 : 0);
    nodes.push(noTexto(texto, format));
  };

  while ((match = tokenRegex.exec(html))) {
    empurrarTexto(html.slice(ultimoIndex, match.index));
    const fechando = Boolean(match[1]);
    const tag = (match[2] ?? "").toLowerCase();
    if (tag === "br") {
      nodes.push({ type: "linebreak", version: 1 });
    } else if (tag === "strong" || tag === "b") {
      negrito = fechando ? Math.max(0, negrito - 1) : negrito + 1;
    } else {
      italico = fechando ? Math.max(0, italico - 1) : italico + 1;
    }
    ultimoIndex = tokenRegex.lastIndex;
  }
  empurrarTexto(html.slice(ultimoIndex));

  return nodes;
}

function extrairItensLista(conteudoLista: string): string[] {
  const itens: string[] = [];
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(conteudoLista))) {
    itens.push(match[1] ?? "");
  }
  return itens;
}

/**
 * Varre blocos de topo (`p`, `ul`, `ol`) e monta os nós Lexical
 * correspondentes; texto solto entre blocos (sobra de uma tag
 * desembrulhada que não deixou um `<p>` por perto) vira parágrafo à
 * parte, se não for só espaço em branco.
 */
function paraBlocos(html: string): unknown[] {
  const children: unknown[] = [];
  const blocoRegex = /<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let ultimoIndex = 0;
  let match: RegExpExecArray | null;

  const empurrarTextoSolto = (bruto: string) => {
    const texto = bruto.trim();
    if (texto.length === 0) return;
    children.push(noParagrafo(parseInline(texto)));
  };

  while ((match = blocoRegex.exec(html))) {
    empurrarTextoSolto(html.slice(ultimoIndex, match.index));
    const tag = (match[1] ?? "").toLowerCase();
    const conteudo = match[2] ?? "";
    if (tag === "p") {
      children.push(noParagrafo(parseInline(conteudo)));
    } else {
      children.push(noLista(extrairItensLista(conteudo), tag === "ol"));
    }
    ultimoIndex = blocoRegex.lastIndex;
  }
  empurrarTextoSolto(html.slice(ultimoIndex));

  return children;
}

/** Converte HTML do subconjunto suportado (ver cabeçalho do arquivo) em richText Lexical. */
export function htmlParaLexical(html: string): ResultadoConversao {
  const ignoradas = new Set<string>();
  const htmlLimpo = removerTagsDesconhecidas(html, ignoradas);
  const children = paraBlocos(htmlLimpo);
  return { doc: documento(children), tagsIgnoradas: Array.from(ignoradas) };
}

/** Embrulha texto puro (sem markup) num único parágrafo Lexical. */
export function textoParaLexical(texto: string): DocumentoLexical {
  return documento([noParagrafo([noTexto(texto, 0)])]);
}

/**
 * Extrai o texto de cada `<div class="result-card">...<p>texto</p>...</div>`
 * de um `results-grid`, descartando o número (`<span class="r-num">`) —
 * padrão usado nos `corpoHtml` dos 15 programas para a seção de resultados.
 */
export function extrairCartoesDeResultado(html: string): string[] {
  const cartoes: string[] = [];
  const cartaoRegex = /<div class="result-card">([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;
  while ((match = cartaoRegex.exec(html))) {
    const paragrafo = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(match[1] ?? "");
    if (!paragrafo) continue;
    cartoes.push(decodificarEntidades((paragrafo[1] ?? "").replace(/<[^>]+>/g, "")).trim());
  }
  return cartoes;
}

/** Junta o corpo (HTML, convertido como htmlParaLexical) com uma lista de itens em texto puro, como um único documento. */
export function listaParaLexical(corpoHtml: string, itens: string[]): ResultadoConversao {
  const { doc, tagsIgnoradas } = htmlParaLexical(corpoHtml);
  if (itens.length > 0) {
    doc.root.children.push(noLista(itens, false));
  }
  return { doc, tagsIgnoradas };
}
