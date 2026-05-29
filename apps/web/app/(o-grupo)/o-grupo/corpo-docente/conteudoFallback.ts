/**
 * Barrel agregador dos valores literais de conteudoCorpoDocente.ts em um
 * objeto único (`conteudoFallback`), no mesmo shape que o adapter do
 * loader CMS retorna. Usado pelo page.tsx quando o fetch do Payload falha.
 *
 * Não altera o arquivo conteudoCorpoDocente.ts — apenas re-exporta.
 */

import {
  CARDS_AXIS_SAUDE,
  CARDS_EXPERTS,
  CARDS_FEATURED,
  CREDENCIAMENTO,
  CREDIBILIDADE,
  CTA_FINAL,
  FAQ,
  HERO,
  MANIFESTO,
  METRICAS,
  STICKY_CTA,
  type CardAxis,
  type CardExpert,
  type CardFeatured,
  type FaqItem,
  type Metrica,
} from "./conteudoCorpoDocente";

export interface ConteudoCorpoDocente {
  HERO: typeof HERO;
  METRICAS: Metrica[];
  MANIFESTO: typeof MANIFESTO;
  CARDS_FEATURED: CardFeatured[];
  CARDS_EXPERTS: CardExpert[];
  CARDS_AXIS_SAUDE: CardAxis[];
  CREDIBILIDADE: typeof CREDIBILIDADE;
  CREDENCIAMENTO: typeof CREDENCIAMENTO;
  FAQ: FaqItem[];
  CTA_FINAL: typeof CTA_FINAL;
  STICKY_CTA: typeof STICKY_CTA;
}

export const conteudoFallback: ConteudoCorpoDocente = {
  HERO,
  METRICAS,
  MANIFESTO,
  CARDS_FEATURED,
  CARDS_EXPERTS,
  CARDS_AXIS_SAUDE,
  CREDIBILIDADE,
  CREDENCIAMENTO,
  FAQ,
  CTA_FINAL,
  STICKY_CTA,
};
