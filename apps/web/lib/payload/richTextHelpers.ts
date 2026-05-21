/**
 * Helpers para tratar campos Rich Text Lexical do Payload no front.
 *
 * O Lexical do CMS é restritivo (paragraph, heading, list, link, bold,
 * italic, underline) — então a extração de texto puro percorre apenas
 * esses tipos. Nodes desconhecidos são ignorados sem quebrar.
 */

interface NoTexto {
  type: "text";
  text?: string;
}

interface NoContainer {
  type: string;
  children?: NoLexical[];
}

type NoLexical = NoTexto | NoContainer;

function ehTexto(n: NoLexical): n is NoTexto {
  return n.type === "text" && typeof (n as NoTexto).text === "string";
}

function ehContainer(n: NoLexical): n is NoContainer {
  return Array.isArray((n as NoContainer).children);
}

function coletarTexto(no: NoLexical): string {
  if (ehTexto(no)) return no.text ?? "";
  if (ehContainer(no) && no.children) {
    return no.children.map(coletarTexto).join("");
  }
  return "";
}

/**
 * Devolve um resumo textual do richText cortado em `limite` caracteres.
 * Retorna `undefined` se o conteúdo for inválido, vazio ou se a extração
 * resultar em string vazia.
 */
export function extrairResumoDeRichText(
  conteudo: unknown,
  limite = 240,
): string | undefined {
  if (
    typeof conteudo !== "object" ||
    conteudo === null ||
    !("root" in (conteudo as Record<string, unknown>))
  ) {
    return undefined;
  }
  const root = (conteudo as { root: NoLexical }).root;
  const texto = coletarTexto(root).replace(/\s+/g, " ").trim();
  if (!texto) return undefined;
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite - 1).trim()}…`;
}
