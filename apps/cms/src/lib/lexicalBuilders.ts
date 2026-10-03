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
