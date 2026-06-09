import "server-only";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Escrita de eventos para o protótipo de CMS Soberana — via Local API do
 * Payload (mesmo motor do admin). Edita campos de texto e faz upload de capa
 * e folder PDF, que passam pela coleção Media (variantes Sharp + Supabase
 * Storage + registro), preservando o serviço de upload existente.
 *
 * server-only: nunca vaza ao browser. Escopo restrito: nome/data/resumo +
 * imagemCapa/folderPdf. Não toca schema, não apaga nada.
 */

export interface ResultadoEscrita {
  ok: boolean;
  erro?: string;
}

export interface CamposTextoEvento {
  nome: string;
  dataInicio: string;
  resumo: string;
}

export async function salvarCamposEvento(
  id: string,
  campos: CamposTextoEvento,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: {
        nome: campos.nome,
        dataInicio: campos.dataInicio,
        resumo: campos.resumo,
      },
      // draft: true mantém o documento no mesmo estado de publicação (rascunho
      // continua rascunho); não força publish.
      draft: true,
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao salvar." };
  }
}

/**
 * Publica o evento: promove o rascunho atual a publicado (_status: published,
 * sem draft:true). Faz a versão editada/com capa nova ir ao ar no site.
 */
export async function publicarEvento(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: { _status: "published" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao publicar." };
  }
}

/**
 * Vincula a lista de palestrantes (ids de especialistas) ao evento. Substitui
 * a lista atual do campo `palestrantes`. draft:true mantém o estado de
 * publicação (não força publish).
 */
export async function vincularPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    // O campo `palestrantes` é relação por id numérico; converte os ids string.
    const ids = idsEspecialistas.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
    await payload.update({
      collection: "eventos",
      id,
      data: { palestrantes: ids },
      draft: true,
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao vincular palestrantes." };
  }
}

/**
 * Define os eventos em destaque na Home (Global home → eventosAgendaDestaque).
 * Recebe ids string; converte para number (relação por id).
 */
export async function salvarEventosHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const ids = idsEventos.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
    await payload.updateGlobal({
      slug: "home",
      data: { eventosAgendaDestaque: ids },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao salvar eventos da Home." };
  }
}

/** Despublica o evento (volta a rascunho): some do site público. */
export async function despublicarEvento(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: { _status: "draft" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao despublicar." };
  }
}

/**
 * Define se um especialista fica oculto do site público (campo
 * `ocultarDoSite`). Oculto → não aparece no Corpo Docente nem como palestrante
 * de eventos. Usado para tirar do ar quem ainda está com foto genérica, sem
 * precisar deletar o cadastro.
 *
 * A coleção tem drafts habilitados e 47 dos 63 especialistas estão em
 * rascunho. draft:true preserva o estado de publicação (não publica um
 * rascunho sem querer só por alternar a visibilidade) — alinhado com o
 * padrão de salvarCamposEvento.
 */
export async function definirOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "especialistas",
      id,
      data: { ocultarDoSite: oculto },
      draft: true,
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao atualizar visibilidade." };
  }
}

/**
 * Recebe um File do client (via FormData), cria um registro Media pela Local
 * API (gera variantes + sobe ao Supabase Storage) e aponta o campo do evento
 * (`imagemCapa` ou `folderPdf`) para a nova Media.
 */
export async function enviarMidiaEvento(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  arquivo: File,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const media = await payload.create({
      collection: "media",
      data: {
        alt: arquivo.name,
      },
      file: {
        data: buffer,
        name: arquivo.name,
        mimetype: arquivo.type,
        size: arquivo.size,
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: "eventos",
      id,
      data: { [campo]: media.id },
      draft: true,
      overrideAccess: true,
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro no upload." };
  }
}
