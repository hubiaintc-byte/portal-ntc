import slugify from "slugify";

/**
 * Endereço (slug) de um programa a partir da sigla — o mesmo dos 15
 * programas que já estão no ar (`/programas/<sigla>`): minúsculas, sem
 * acento e sem pontuação, então "PROSUS+" vira "prosus" (conferido contra o
 * instantâneo `paginas-programas.json` no teste).
 *
 * Só vale na CRIAÇÃO (R28): slug de programa existente nunca muda, porque a
 * URL pública já pode estar circulando.
 *
 * Não confundir com `slugDoPrograma` de `seed/programasShell.ts` ("+" →
 * "-plus"), que não corresponde aos slugs gravados.
 */
export function slugDaSigla(sigla: string): string {
  return slugify(sigla.trim(), { lower: true, strict: true, locale: "pt" });
}

export const ERRO_SLUG_PROGRAMA_REPETIDO = "Já existe um programa com este endereço (sigla).";
