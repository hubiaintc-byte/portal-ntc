/** Serialização de documentos Lexical (parágrafos) para o HTML das páginas de programa. */

interface NoGenerico {
  type?: string;
  text?: string;
  format?: number | string;
  children?: unknown[];
}

function escaparTexto(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function filhosDaRaiz(doc: unknown): NoGenerico[] {
  if (typeof doc !== "object" || doc === null) return [];
  const raiz = (doc as { root?: { children?: unknown } }).root;
  return Array.isArray(raiz?.children) ? (raiz.children as NoGenerico[]) : [];
}

function formatoDe(no: NoGenerico): number {
  return typeof no.format === "number" ? no.format : 0;
}

function textoDoNo(no: NoGenerico, marcar: boolean): string {
  if (no.type === "linebreak") return marcar ? "<br>" : "\n";
  if (no.type !== "text") return "";
  const bruto = no.text ?? "";
  if (!marcar) return bruto;
  let html = escaparTexto(bruto);
  const f = formatoDe(no);
  if (f & 2) html = `<em>${html}</em>`;
  if (f & 1) html = `<strong>${html}</strong>`;
  return html;
}

function paragrafos(doc: unknown): NoGenerico[] {
  return filhosDaRaiz(doc).filter((n) => n.type === "paragraph");
}

export function paragrafosParaHtml(doc: unknown, opcoes?: { classePrimeiro?: string }): string {
  return paragrafos(doc)
    .map((p, i) => {
      const interno = ((p.children ?? []) as NoGenerico[]).map((n) => textoDoNo(n, true)).join("");
      const classe = i === 0 && opcoes?.classePrimeiro ? ` class="${opcoes.classePrimeiro}"` : "";
      return `<p${classe}>${interno}</p>`;
    })
    .join("");
}

export function textoDoLexical(doc: unknown): string {
  return paragrafos(doc)
    .map((p) => ((p.children ?? []) as NoGenerico[]).map((n) => textoDoNo(n, false)).join(""))
    .join("\n\n");
}
