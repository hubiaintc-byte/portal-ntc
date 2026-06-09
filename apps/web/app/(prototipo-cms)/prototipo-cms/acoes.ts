"use server";

import { revalidatePath } from "next/cache";

import {
  obterEventoCms,
  obterPalestranteCms,
  type EventoCmsDetalhe,
  type PalestranteCmsDetalhe,
} from "@/lib/cms/prototipoCms";
import {
  definirOcultarPalestrante,
  despublicarEvento,
  enviarMidiaEvento,
  publicarEvento,
  salvarCamposEvento,
  salvarEventosHome,
  vincularPalestrantesEvento,
  type ResultadoEscrita,
} from "@/lib/cms/prototipoCmsEscrita";

/**
 * Server Actions do detalhe do protótipo de CMS.
 *
 * Leitura (carregar) e escrita (salvar/enviar) rodam no servidor via Local
 * API do Payload. O casco é client-side e invoca estas actions.
 */

export async function carregarEvento(id: string): Promise<EventoCmsDetalhe | null> {
  return obterEventoCms(id);
}

export async function carregarPalestrante(id: string): Promise<PalestranteCmsDetalhe | null> {
  return obterPalestranteCms(id);
}

/** Salva nome/data/resumo de um evento e retorna o detalhe atualizado. */
export async function salvarEvento(
  id: string,
  campos: { nome: string; dataInicio: string; resumo: string },
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  const resultado = await salvarCamposEvento(id, campos);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Faz upload de capa ou folder PDF (via FormData) e devolve o detalhe
 * atualizado. O File chega no campo "arquivo" do FormData.
 */
export async function enviarMidia(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { resultado: { ok: false, erro: "Nenhum arquivo selecionado." }, evento: null };
  }
  const resultado = await enviarMidiaEvento(id, campo, arquivo);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Publica ou despublica o evento e devolve o detalhe atualizado. */
export async function alternarPublicacaoEvento(
  id: string,
  publicar: boolean,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  const resultado = publicar ? await publicarEvento(id) : await despublicarEvento(id);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Vincula os palestrantes (ids) ao evento e devolve o detalhe atualizado. */
export async function salvarPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  const resultado = await vincularPalestrantesEvento(id, idsEspecialistas);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Salva os eventos em destaque na Home. */
export async function salvarEventosDestaqueHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  const resultado = await salvarEventosHome(idsEventos);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  return resultado;
}

/**
 * Mostra/oculta um palestrante no site público e devolve o detalhe atualizado.
 * O afterChange da coleção Especialistas revalida o Corpo Docente sozinho.
 */
export async function alternarOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }> {
  const resultado = await definirOcultarPalestrante(id, oculto);
  if (resultado.ok) revalidatePath("/prototipo-cms");
  const palestrante = resultado.ok ? await obterPalestranteCms(id) : null;
  return { resultado, palestrante };
}
