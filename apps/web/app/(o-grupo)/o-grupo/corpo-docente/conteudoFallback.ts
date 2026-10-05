/**
 * Barrel agregador dos valores literais de conteudoCorpoDocente.ts em um
 * objeto único (`conteudoFallback`), no mesmo shape que o adapter do
 * loader CMS retorna. Usado pelo page.tsx quando o fetch do Payload falha.
 *
 * Não altera o arquivo conteudoCorpoDocente.ts — apenas re-exporta.
 *
 * O bloco de FAQ traz o e-mail do DPO, que sai do global de contatos —
 * por isso o barrel é montado por função. `conteudoFallback` continua
 * exportado, com os contatos literais, para quem só precisa dos textos
 * (lib/cms/corpoDocente.ts lê `HERO.crumb`).
 */

import { CONTATOS_FALLBACK, type Contatos } from "@/lib/contatos";

import {
  CARDS_AXIS_SAUDE,
  CARDS_EXPERTS,
  CARDS_FEATURED,
  CREDENCIAMENTO,
  CREDIBILIDADE,
  CTA_FINAL,
  HERO,
  MANIFESTO,
  METRICAS,
  STICKY_CTA,
  montarFaq,
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

export function montarConteudoFallback(c: Contatos): ConteudoCorpoDocente {
  return {
    HERO,
    METRICAS,
    MANIFESTO,
    CARDS_FEATURED,
    CARDS_EXPERTS,
    CARDS_AXIS_SAUDE,
    CREDIBILIDADE,
    CREDENCIAMENTO,
    FAQ: montarFaq(c),
    CTA_FINAL,
    STICKY_CTA,
  };
}

export const conteudoFallback: ConteudoCorpoDocente = montarConteudoFallback(CONTATOS_FALLBACK);
