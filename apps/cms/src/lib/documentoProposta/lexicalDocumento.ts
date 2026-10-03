/**
 * Lexical → HTML *por bloco*, para o documento da proposta.
 *
 * `lexicalToHtml` (@/lib/cms/lexical) é inline: junta os blocos de topo com
 * `<br>`, o que basta para as linhas curtas do site, mas o modelo aprovado do
 * documento (docs/prototipos/proposta-modelo-v1.html) imprime parágrafos,
 * subtítulos e listas de verdade — e o CSS do documento estiliza `p`, `h3`,
 * `ul` e `ol`. Este conversor percorre só os blocos de topo e delega o
 * conteúdo *inline* de cada um a `lexicalToHtml`, para que as regras de
 * `<strong>`/`<em>` continuem num lugar só. `lexicalToHtml` não teve a
 * serialização alterada (só ganhou a opção `escapar`, default desligada): ela
 * é compartilhada com corpo-docente e eventos.
 *
 * Contrato que importa: documento ausente, vazio ou cujos blocos todos saem
 * vazios devolve `""` — nunca `<p></p>`. A montagem do documento
 * (`montarSecoes`) decide a omissão de cada seção pelo corpo vazio depois de
 * `trim()`, e um `<p></p>` passaria por "preenchido", imprimindo um título com
 * nada embaixo num documento que vai ao cliente.
 *
 * Escape: `&`, `<` e `>` do texto são escapados via `lexicalToHtml(doc,
 * { escapar: true })` — o escape acontece no nó de texto, antes de
 * `<strong>`/`<em>`, então não há dupla-escapagem nem tag corrompida. O
 * documento é contratual e o PO digita esses textos em campo livre: um
 * "Prazo < 30 dias" não pode quebrar o layout da proposta que vai ao cliente.
 * Os outros chamadores de `lexicalToHtml` (corpo-docente, eventos) não passam
 * a opção e continuam com a saída de hoje.
 */

import { lexicalToHtml } from "@/lib/cms/lexical";

export function lexicalDocumentoParaHtml(doc: unknown): string {
  const blocos = blocosDeTopo(doc);
  if (!blocos) return "";
  return blocos
    .map(blocoParaHtml)
    .filter((b) => b.length > 0)
    .join("");
}

function blocosDeTopo(doc: unknown): unknown[] | null {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return null;
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!root || !Array.isArray(root.children)) return null;
  return root.children;
}

function blocoParaHtml(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;

  if (n.type === "list") {
    const tag = n.listType === "number" ? "ol" : "ul";
    const itens = (Array.isArray(n.children) ? n.children : [])
      .map((item) => inline(item))
      .filter((i) => !emBranco(i))
      .map((i) => `<li>${i}</li>`)
      .join("");
    return itens ? `<${tag}>${itens}</${tag}>` : "";
  }

  const conteudo = inline(node);
  if (emBranco(conteudo)) return "";
  // Headings do editor restritivo são h2–h4; no documento o nível h2 pertence
  // ao título da seção, então todo heading do corpo entra como h3 (o modelo
  // só tem esse nível dentro das seções).
  if (n.type === "heading") return `<h3>${conteudo}</h3>`;
  // Parágrafo e qualquer bloco não previsto: o texto nunca se perde.
  return `<p>${conteudo}</p>`;
}

/**
 * Inline sem conteúdo de verdade. Não basta `!conteudo`: um parágrafo com um
 * espaço digitado sai `" "` e um com soft break (shift+Enter) sai `"<br>"` —
 * os dois são estados reais do editor e virariam `<p> </p>`/`<p><br></p>`,
 * que `temCorpo` (montar.ts) conta como preenchido. A seção fantasma
 * imprimiria o título sem corpo e, por a numeração ser posicional,
 * deslocaria o número de todas as seções seguintes.
 */
function emBranco(inlineHtml: string): boolean {
  return inlineHtml.replace(/<br>/g, "").trim().length === 0;
}

/** Conteúdo inline de um único nó, reusando a serialização compartilhada. */
function inline(node: unknown): string {
  return lexicalToHtml({ root: { children: [node] } }, { escapar: true });
}
