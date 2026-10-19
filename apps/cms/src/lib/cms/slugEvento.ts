import slugify from "slugify";

/**
 * O marcador "rascunho" distingue o slug gerado por "Novo evento" de um slug
 * que o editor escolheu e que só começa parecido (ex.: "novo-evento-sp").
 */
export const PREFIXO_SLUG_PROVISORIO = "novo-evento-rascunho-";
const PADRAO_SLUG_PROVISORIO = /^novo-evento-rascunho-[0-9a-z]+$/;
export const NOME_EVENTO_EM_BRANCO = "Novo evento";

/** Mesma normalização do hook `autoSlug` da coleção. */
function normalizar(texto: string): string {
  return slugify(texto, { lower: true, strict: true, locale: "pt" });
}

export function slugProvisorio(agora: Date = new Date()): string {
  return PREFIXO_SLUG_PROVISORIO + agora.getTime().toString(36);
}

export function ehSlugProvisorio(slug: string): boolean {
  return PADRAO_SLUG_PROVISORIO.test(slug);
}

/**
 * Slug a gravar no salvar. Digitado diferente do atual (e não vazio) vale como
 * escolha do editor. Caso contrário, só um slug provisório é regerado do nome;
 * slug definitivo nunca muda sozinho (a URL pública já pode estar circulando).
 */
export function slugParaSalvar(p: { slugDigitado: string; slugAtual: string; nome: string }): string {
  const digitado = p.slugDigitado.trim();
  if (digitado.length > 0 && digitado !== p.slugAtual) {
    const normalizado = normalizar(digitado);
    if (normalizado.length > 0) return normalizado;
  }
  if (ehSlugProvisorio(p.slugAtual) && p.nome.trim() !== NOME_EVENTO_EM_BRANCO) {
    const doNome = normalizar(p.nome);
    if (doNome.length > 0) return doNome;
  }
  return p.slugAtual;
}
