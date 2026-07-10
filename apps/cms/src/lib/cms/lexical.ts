/**
 * Lexical → HTML restritivo (compartilhado: corpo-docente + eventos).
 *
 * Serializa um documento Lexical para HTML inline, suportando apenas
 * <strong>, <em>, <span class="accent"> e <br>. Outras formatações são
 * ignoradas (compatível com lexicalRestrictiveFeatures aplicado em
 * payload.config.ts).
 *
 * Server-only — usado pelos adapters de CMS.
 *
 * Cópia de apps/web/lib/cms/lexical.ts (o site continua com a dele —
 * eventos.ts e corpoDocente.ts). Mudanças de serialização: replicar nos dois.
 */

export function lexicalToHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  // Blocos (parágrafos, headings, itens de lista) separados por <br> — sem
  // separador, documentos multi-bloco (import de PDF) viram texto colado.
  return root.children
    .map(blocoParaHtml)
    .filter((b) => b.length > 0)
    .join("<br>");
}

function blocoParaHtml(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "list" && Array.isArray(n.children)) {
    return n.children
      .map(serializarNode)
      .filter((item) => item.length > 0)
      .join("<br>");
  }
  return serializarNode(node);
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

/**
 * Lexical → texto plano para o editor do Painel Admin: parágrafos e headings
 * viram linhas, itens de lista viram "- item". Reconvertido no salvar por
 * textoParaLexical (lexicalBuilders) — formatações inline se perdem, troca
 * aceita no design da revisão editável (spec 2026-07-09 §4).
 */
export function lexicalParaTexto(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  return root.children
    .map((n) => blocoParaTexto(n))
    .filter((l) => l.length > 0)
    .join("\n");
}

function blocoParaTexto(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "list" && Array.isArray(n.children)) {
    return n.children.map((item) => `- ${textoDeNode(item)}`.trimEnd()).join("\n");
  }
  return textoDeNode(n);
}

function textoDeNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text") return String(n.text ?? "");
  if (n.type === "linebreak") return " ";
  if (Array.isArray(n.children)) return n.children.map(textoDeNode).join("");
  return "";
}
