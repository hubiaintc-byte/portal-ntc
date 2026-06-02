/**
 * Lexical → HTML restritivo (compartilhado: corpo-docente + eventos).
 *
 * Serializa um documento Lexical para HTML inline, suportando apenas
 * <strong>, <em>, <span class="accent"> e <br>. Outras formatações são
 * ignoradas (compatível com lexicalRestrictiveFeatures aplicado em
 * payload.config.ts).
 *
 * Server-only — usado pelos adapters de CMS.
 */

export function lexicalToHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  return root.children.map(serializarNode).join("");
}

function serializarNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const tipo = n.type;

  if (tipo === "linebreak") return "<br>";
  if (tipo === "text") return aplicarFormato(String(n.text ?? ""), Number(n.format ?? 0));

  if (tipo === "paragraph" || tipo === "heading") {
    const children = Array.isArray(n.children) ? n.children.map(serializarNode).join("") : "";
    return children;
  }

  if (Array.isArray(n.children)) return n.children.map(serializarNode).join("");
  return "";
}

function aplicarFormato(texto: string, format: number): string {
  // Lexical format bitfield: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
  let html = texto;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  return html;
}
