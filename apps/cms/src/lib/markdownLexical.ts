import type { DocumentoLexical } from "./lexicalBuilders";

/**
 * Markdown leve ↔ Lexical, para o editor de corpo do Painel Admin.
 *
 * Sete elementos, nada além: ## e ### (heading), **negrito**, *itálico*,
 * [texto](url), > citação, "- " e "1. " (listas). Qualquer outra sintaxe
 * de Markdown é texto literal — não há fallback silencioso que perca o
 * que foi digitado.
 *
 * O formato gravado continua sendo o Lexical do Payload, então trocar
 * este editor por um WYSIWYG depois não exige converter conteúdo.
 */

const FORMATO_BOLD = 1;
const FORMATO_ITALIC = 2;

interface NoTexto {
  type: "text";
  format: number;
  mode: "normal";
  style: "";
  text: string;
  version: 1;
  detail: 0;
}

interface NoLink {
  type: "link";
  format: "";
  indent: 0;
  version: 1;
  direction: "ltr";
  fields: { url: string; newTab: boolean; linkType: "custom" };
  children: NoTexto[];
}

type NoInline = NoTexto | NoLink;

function noTexto(text: string, format = 0): NoTexto {
  return { type: "text", format, mode: "normal", style: "", text, version: 1, detail: 0 };
}

function bloco(type: string, children: unknown[], extra: Record<string, unknown> = {}) {
  return { type, format: "", indent: 0, version: 1, direction: "ltr", children, ...extra };
}

/* ---------- Markdown → Lexical ---------- */

/**
 * Quebra uma linha em nós inline. Um regex único varre link, negrito e
 * itálico na ordem em que aparecem; o que sobra entre eles é texto puro.
 */
function inlineParaNos(linha: string): NoInline[] {
  const nos: NoInline[] = [];
  const padrao = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;

  while ((m = padrao.exec(linha)) !== null) {
    if (m.index > ultimo) nos.push(noTexto(linha.slice(ultimo, m.index)));
    if (m[1] !== undefined) {
      nos.push({
        type: "link",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        fields: { url: m[2]!, newTab: false, linkType: "custom" },
        children: [noTexto(m[1])],
      });
    } else if (m[3] !== undefined) {
      nos.push(noTexto(m[3], FORMATO_BOLD));
    } else if (m[4] !== undefined) {
      nos.push(noTexto(m[4], FORMATO_ITALIC));
    }
    ultimo = m.index + m[0].length;
  }

  if (ultimo < linha.length) nos.push(noTexto(linha.slice(ultimo)));
  return nos.length > 0 ? nos : [noTexto("")];
}

function itemDeLista(linha: string): { tipo: "bullet" | "number"; texto: string } | null {
  if (linha.startsWith("- ")) return { tipo: "bullet", texto: linha.slice(2).trim() };
  const ordenada = /^(\d+)\.\s+(.*)$/.exec(linha);
  if (ordenada) return { tipo: "number", texto: ordenada[2]!.trim() };
  return null;
}

export function markdownParaLexical(md: string): DocumentoLexical {
  const linhas = md.replace(/\r\n/g, "\n").split("\n");
  const children: unknown[] = [];

  let itens: string[] = [];
  let tipoLista: "bullet" | "number" | null = null;

  function fecharLista() {
    if (itens.length > 0 && tipoLista) {
      children.push(
        bloco(
          "list",
          itens.map((t, i) => bloco("listitem", inlineParaNos(t), { value: i + 1 })),
          { listType: tipoLista, tag: tipoLista === "number" ? "ol" : "ul", start: 1 },
        ),
      );
    }
    itens = [];
    tipoLista = null;
  }

  for (const bruta of linhas) {
    const linha = bruta.trim();

    const item = itemDeLista(linha);
    if (item) {
      if (tipoLista && tipoLista !== item.tipo) fecharLista();
      tipoLista = item.tipo;
      itens.push(item.texto);
      continue;
    }
    fecharLista();

    if (linha.length === 0) continue;

    if (linha.startsWith("### ")) {
      children.push(bloco("heading", inlineParaNos(linha.slice(4).trim()), { tag: "h3" }));
    } else if (linha.startsWith("## ")) {
      children.push(bloco("heading", inlineParaNos(linha.slice(3).trim()), { tag: "h2" }));
    } else if (linha.startsWith("> ")) {
      children.push(bloco("quote", inlineParaNos(linha.slice(2).trim())));
    } else {
      children.push(bloco("paragraph", inlineParaNos(linha)));
    }
  }
  fecharLista();

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: children.length > 0 ? [...children] : [bloco("paragraph", [noTexto("")])],
    },
  };
}

/* ---------- Lexical → Markdown ---------- */

function inlineParaMarkdown(nodes: unknown[]): string {
  return nodes
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const n = node as Record<string, unknown>;

      if (n.type === "link") {
        const filhos = Array.isArray(n.children) ? inlineParaMarkdown(n.children) : "";
        const url = (n.fields as { url?: string } | undefined)?.url ?? "";
        return `[${filhos}](${url})`;
      }
      if (n.type === "text") {
        const texto = String(n.text ?? "");
        const format = Number(n.format ?? 0);
        if (format & FORMATO_BOLD) return `**${texto}**`;
        if (format & FORMATO_ITALIC) return `*${texto}*`;
        return texto;
      }
      if (Array.isArray(n.children)) return inlineParaMarkdown(n.children);
      return "";
    })
    .join("");
}

export function lexicalParaMarkdown(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!Array.isArray(root?.children)) return "";

  const blocos = root.children
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const n = node as Record<string, unknown>;
      const filhos = Array.isArray(n.children) ? n.children : [];

      if (n.type === "list") {
        const ordenada = n.listType === "number";
        return filhos
          .map((item, i) => {
            const conteudo = inlineParaMarkdown(
              Array.isArray((item as Record<string, unknown>)?.children)
                ? ((item as Record<string, unknown>).children as unknown[])
                : [],
            );
            return ordenada ? `${i + 1}. ${conteudo}` : `- ${conteudo}`;
          })
          .join("\n");
      }

      const conteudo = inlineParaMarkdown(filhos);
      if (conteudo.length === 0) return "";
      if (n.type === "heading") return n.tag === "h2" ? `## ${conteudo}` : `### ${conteudo}`;
      if (n.type === "quote") return `> ${conteudo}`;
      return conteudo;
    })
    .filter((b) => b.length > 0);

  return blocos.join("\n\n");
}
