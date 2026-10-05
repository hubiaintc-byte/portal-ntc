import type { SituacaoConteudo } from "@/lib/cms/painelCms";

/**
 * Rótulos e classes dos selos de um conteúdo editorial.
 *
 * Mora fora das telas porque a lista (`TelaConteudos`) e o detalhe
 * (`DetalheConteudo`) mostram o mesmo estado do mesmo documento: com dois
 * mapas, "Rascunho" acabou pintado no detalhe e transparente na lista (a
 * classe `pcms-selo` sozinha não declara cor nem fundo).
 *
 * `import type` da leitura server-only é apagado na compilação, então este
 * módulo continua importável por Client Component.
 */

export const ROTULO_SITUACAO: Record<SituacaoConteudo, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  "em-preparacao": "Em preparação",
};

/** "em-preparacao" não tem modificador próprio no painel.css — usa o selo informativo. */
export const CLASSE_SITUACAO: Record<SituacaoConteudo, string> = {
  publicado: "pcms-selo pcms-selo--publicado",
  rascunho: "pcms-selo pcms-selo--rascunho",
  "em-preparacao": "pcms-selo pcms-selo--info",
};

/** Selo "Destaque" — pílula cerimonial (Dourado), usada na lista. */
export const CLASSE_DESTAQUE = "pcms-selo pcms-selo--destaque";
