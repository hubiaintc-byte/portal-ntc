/**
 * Lexical → HTML de blocos, para o corpo editorial de um conteúdo.
 *
 * Diferente de `lexicalToHtml` (apps/cms e apps/web), que achata tudo em
 * HTML inline separado por <br> e serve para campos curtos de evento e de
 * especialista: aqui a estrutura importa — h2/h3, parágrafos, listas,
 * citações e links.
 *
 * O resultado é injetado com dangerouslySetInnerHTML, então a sanitização
 * mora AQUI: todo texto é escapado e só passam hrefs http(s) e mailto.
 */

const TAGS_HEADING = new Set(["h2", "h3", "h4"]);

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Só http, https e mailto. Qualquer outro esquema devolve null. */
function hrefSeguro(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const limpo = url.trim();
  if (!/^(https?:\/\/|mailto:)/i.test(limpo)) return null;
  return escapar(limpo);
}

function aplicarFormato(texto: string, format: number): string {
  let html = texto;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  return html;
}

/** Serializa os filhos inline de um bloco (texto, link, quebra de linha). */
function inline(nodes: unknown[]): string {
  return nodes.map(serializarInline).join("");
}

function serializarInline(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;

  if (n.type === "linebreak") return "<br>";

  if (n.type === "text") {
    return aplicarFormato(escapar(String(n.text ?? "")), Number(n.format ?? 0));
  }

  if (n.type === "link") {
    const filhos = Array.isArray(n.children) ? inline(n.children) : "";
    const campos = (n.fields ?? {}) as { url?: unknown; newTab?: unknown };
    const href = hrefSeguro(campos.url);
    if (!href) return filhos;
    const alvo = campos.newTab ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener"';
    return `<a href="${href}"${alvo}>${filhos}</a>`;
  }

  if (Array.isArray(n.children)) return inline(n.children);
  return "";
}

function serializarBloco(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const filhos = Array.isArray(n.children) ? n.children : [];

  if (n.type === "list") {
    const tag = n.listType === "number" ? "ol" : "ul";
    const itens = filhos
      .map((item) => {
        const conteudo = inline(
          Array.isArray((item as Record<string, unknown>)?.children)
            ? ((item as Record<string, unknown>).children as unknown[])
            : [],
        );
        return conteudo.length > 0 ? `<li>${conteudo}</li>` : "";
      })
      .join("");
    return itens.length > 0 ? `<${tag}>${itens}</${tag}>` : "";
  }

  const conteudo = inline(filhos);
  if (conteudo.length === 0) return "";

  if (n.type === "heading") {
    const tag = typeof n.tag === "string" && TAGS_HEADING.has(n.tag) ? n.tag : "h3";
    return `<${tag}>${conteudo}</${tag}>`;
  }

  if (n.type === "quote") return `<blockquote>${conteudo}</blockquote>`;

  return `<p>${conteudo}</p>`;
}

export function lexicalParaHtmlEditorial(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!Array.isArray(root?.children)) return "";
  return root.children.map(serializarBloco).join("");
}
