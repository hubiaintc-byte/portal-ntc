/**
 * Marcação leve dos textos de página de programa: `**negrito**` e `*itálico*`.
 * Escapa `& < >` (aspas não, para bater com o texto original) e só deixa
 * passar <strong>/<em>.
 */

export function escaparTexto(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function marcacaoParaHtml(texto: string): string {
  return escaparTexto(texto)
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
}

const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
};

export function htmlInlineParaMarcacao(html: string): {
  texto: string;
  tagsDesconhecidas: string[];
} {
  const desconhecidas = new Set<string>();
  const comMarcas = html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (_m, _fecha: string, nome: string) => {
    const tag = nome.toLowerCase();
    if (tag === "strong") return "**";
    if (tag === "em") return "*";
    desconhecidas.add(tag);
    return "";
  });
  const texto = comMarcas.replace(/&(amp|lt|gt|quot|#39);/g, (_m, c: string) => ENTIDADES[c] ?? _m);
  return { texto, tagsDesconhecidas: Array.from(desconhecidas) };
}
