/**
 * Partes puras do conferidor 1:1 das páginas de programa
 * (`scripts/conferir-paginas-programas.mjs`): extrai o `<main>`, tira o que
 * muda de propósito na virada para o CMS, normaliza e compara.
 *
 * Sem imports: o script `.mjs` importa este arquivo direto pelo Node
 * (remoção de tipos nativa, Node >= 22.18).
 */

/** Conteúdo de `<main …>…</main>` (a página inteira se não houver `<main>`). */
export function extrairMain(html: string): string {
  const ini = html.search(/<main[\s>]/i);
  if (ini === -1) return html;
  const abre = html.indexOf(">", ini);
  const fim = html.lastIndexOf("</main>");
  if (abre === -1 || fim === -1 || fim < abre) return html;
  return html.slice(abre + 1, fim);
}

/**
 * Remove o elemento que abre em `inicio` (índice de um `<tag …>`) até o fecho
 * correspondente, contando aninhamento da mesma tag. Sem fecho → até o fim.
 */
function fimDoElemento(html: string, inicio: number, tag: string): number {
  const re = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, "gi");
  re.lastIndex = inicio;
  let nivel = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const autoFechada = m[0].endsWith("/>");
    if (m[1] === "/") nivel -= 1;
    else if (!autoFechada) nivel += 1;
    if (nivel === 0) return re.lastIndex;
  }
  return html.length;
}

/** Tira a seção `#modulos-abertos` (muda de propósito: vem dos eventos). */
export function removerSecaoModulosAbertos(html: string): string {
  let saida = html;
  for (;;) {
    const m = /<(article|section|div)\b[^>]*\bid="modulos-abertos"[^>]*>/i.exec(saida);
    if (!m) return saida;
    saida =
      saida.slice(0, m.index) +
      saida.slice(fimDoElemento(saida, m.index, (m[1] ?? "").toLowerCase()));
  }
}

/** Tira os selos de status de módulo (`m-status`) e a marca `pc-flag` dos cartões. */
export function removerSelos(html: string): string {
  return html
    .replace(/<span\b[^>]*class="[^"]*\bm-status\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<span\b[^>]*class="[^"]*\bpc-flag\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, "");
}

/** Espaços: colapsa sequências e remove os que ficam entre tags. */
export function normalizarEspacos(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

/** `<main>` → sem a seção e os selos que mudam de propósito → normalizado. */
export function prepararParaConferencia(html: string): string {
  return normalizarEspacos(removerSelos(removerSecaoModulosAbertos(extrairMain(html))));
}

/** Uma "linha" por tag/texto, para o diff apontar o trecho. */
export function emLinhas(normalizado: string): string[] {
  return normalizado
    .replace(/></g, ">\n<")
    .replace(/>([^<\n])/g, ">\n$1")
    .replace(/([^>\n])</g, "$1\n<")
    .split("\n")
    .filter((l) => l !== "");
}

export interface LinhaDiff {
  tipo: "-" | "+";
  texto: string;
}

/** Diff por linhas (LCS). `-` só no ANTES, `+` só no DEPOIS. */
export function diffLinhas(antes: string[], depois: string[]): LinhaDiff[] {
  const n = antes.length;
  const m = depois.length;
  // Tabela achatada (n+1)x(m+1); `tab[i*(m+1)+j]` = tamanho da maior subsequência comum.
  const largura = m + 1;
  const tab = new Uint32Array((n + 1) * largura);
  const at = (i: number, j: number): number => tab[i * largura + j] ?? 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      tab[i * largura + j] =
        antes[i] === depois[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  const saida: LinhaDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (antes[i] === depois[j]) {
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      saida.push({ tipo: "-", texto: antes[i++] ?? "" });
    } else {
      saida.push({ tipo: "+", texto: depois[j++] ?? "" });
    }
  }
  while (i < n) saida.push({ tipo: "-", texto: antes[i++] ?? "" });
  while (j < m) saida.push({ tipo: "+", texto: depois[j++] ?? "" });
  return saida;
}

/** Compara duas páginas já baixadas; lista vazia = sem diferença. */
export function compararPaginas(htmlAntes: string, htmlDepois: string): LinhaDiff[] {
  const a = prepararParaConferencia(htmlAntes);
  const b = prepararParaConferencia(htmlDepois);
  if (a === b) return [];
  return diffLinhas(emLinhas(a), emLinhas(b));
}
