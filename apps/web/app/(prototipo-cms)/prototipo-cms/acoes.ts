"use server";

import {
  obterEventoCms,
  obterPalestranteCms,
  type EventoCmsDetalhe,
  type PalestranteCmsDetalhe,
} from "@/lib/cms/prototipoCms";

/**
 * Server Actions de LEITURA para o detalhe do protótipo de CMS.
 *
 * O casco é client-side (navegação por estado), mas as buscas de detalhe
 * rodam no servidor via Local API do Payload. Estas actions são o ponto de
 * entrada: o client as invoca ao clicar numa linha. Somente leitura — não
 * escrevem nada. (Server Actions também atendem GET-like reads no protótipo.)
 */

export async function carregarEvento(id: string): Promise<EventoCmsDetalhe | null> {
  return obterEventoCms(id);
}

export async function carregarPalestrante(id: string): Promise<PalestranteCmsDetalhe | null> {
  return obterPalestranteCms(id);
}
