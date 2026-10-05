/**
 * Categorias editoriais do portal.
 *
 * A lista segue os 5 filtros do protótipo aprovado
 * (28_Pagina_Conteudos_v1.html) mais "notícia" — o que o site já mostra
 * como tipo editorial, não a lista do doc 11, modelada antes do protótipo.
 * O segmento plural é o que vai na URL: /conteudos/notas-tecnicas/<slug>.
 */

export const CONTEUDO_CATEGORIA = [
  "artigo",
  "estudo",
  "nota-tecnica",
  "webinar",
  "material",
  "noticia",
] as const;

export type ConteudoCategoria = (typeof CONTEUDO_CATEGORIA)[number];

const ROTULOS: Record<ConteudoCategoria, string> = {
  artigo: "Artigo",
  estudo: "Estudo",
  "nota-tecnica": "Nota técnica",
  webinar: "Webinar",
  material: "Material",
  noticia: "Notícia",
};

const SEGMENTOS: Record<ConteudoCategoria, string> = {
  artigo: "artigos",
  estudo: "estudos",
  "nota-tecnica": "notas-tecnicas",
  webinar: "webinars",
  material: "materiais",
  noticia: "noticias",
};

export function rotuloCategoria(categoria: ConteudoCategoria): string {
  return ROTULOS[categoria];
}

export function categoriaParaSegmento(categoria: ConteudoCategoria): string {
  return SEGMENTOS[categoria];
}

export const SEGMENTOS_CATEGORIA: readonly string[] = CONTEUDO_CATEGORIA.map((c) => SEGMENTOS[c]);

export function segmentoParaCategoria(segmento: string): ConteudoCategoria | null {
  const achado = CONTEUDO_CATEGORIA.find((c) => SEGMENTOS[c] === segmento);
  return achado ?? null;
}
