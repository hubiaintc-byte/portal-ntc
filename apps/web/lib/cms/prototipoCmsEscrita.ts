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
