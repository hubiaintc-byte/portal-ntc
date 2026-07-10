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
 * Estrutura plana para os adapters de evento: parágrafos viram texto corrido
 * e itens de lista/headings viram itens (na ordem do documento). Texto puro,
 * sem tags — os layouts renderizam esses campos escapados (chips, <li>).
 */
export interface BlocosLexical {
  paragrafos: string[];
  itens: string[];
}

export function lexicalParaBlocos(doc: unknown): BlocosLexical {
  const blocos: BlocosLexical = { paragrafos: [], itens: [] };
  if (!doc || typeof doc !== "object" || !("root" in doc)) return blocos;
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return blocos;

  for (const node of root.children) {
    if (!node || typeof node !== "object") continue;
    const n = node as Record<string, unknown>;
    if (n.type === "list" && Array.isArray(n.children)) {
      for (const item of n.children) {
        const texto = textoDeNode(item).trim();
        if (texto.length > 0) blocos.itens.push(texto);
      }
      continue;
    }
    const texto = textoDeNode(node).trim();
    if (texto.length === 0) continue;
    // Headings (títulos de sessão do import) listam melhor como itens.
    if (n.type === "heading") blocos.itens.push(texto);
    else blocos.paragrafos.push(texto);
  }
  return blocos;
}

function textoDeNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text") return String(n.text ?? "");
  if (n.type === "linebreak") return " ";
  if (Array.isArray(n.children)) return n.children.map(textoDeNode).join("");
  return "";
}
