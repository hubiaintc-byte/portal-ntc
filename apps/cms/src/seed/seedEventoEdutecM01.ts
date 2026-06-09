/**
 * Seed do evento EDUTEC Módulo 01 no CMS — registro de índice.
 *
 * A PÁGINA continua servida do estático (conteudoEventos.ts). Este registro
 * existe para: (a) listar o evento no admin/índice; (b) permitir editar capa,
 * data e folder PDF (override por slug — apps/web/lib/cms/overrideEventoOnline).
 * Idempotente por slug.
 *
 * Execução: pnpm payload:seed:edutec
 */
import { getPayload } from "payload";

import config from "../payload.config";

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const slug = "edutec-m01-2026";

  // Relacionamentos por chave natural.
  const programaRes = await payload.find({
    collection: "programas",
    where: { sigla: { equals: "EDUTEC" } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  const areaRes = await payload.find({
    collection: "areas",
    where: { sigla: { equals: "educacao" } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  // imagemCapa é required: usa uma media existente como capa inicial.
  const capaRes = await payload.find({
    collection: "media",
    where: { filename: { contains: "area-educacao" } },
    limit: 1,
    overrideAccess: true,
  });

  const programaId = programaRes.docs[0]?.id;
  const areaId = areaRes.docs[0]?.id;
  const capaId = capaRes.docs[0]?.id;

  if (!areaId) {
    throw new Error("[seed:edutec] Área 'edu' não encontrada — rode o seed base antes.");
  }
  if (!capaId) {
    throw new Error(
      "[seed:edutec] Nenhuma media 'area-educacao' encontrada — rode os seeds de imagem antes.",
    );
  }

  const data = {
    slug,
    nome: "Cultura Digital, Educação Midiática e Transformação da Educação",
    eyebrow: "Seminário · NTC Educação",
    area: areaId,
    ...(programaId ? { programa: programaId } : {}),
    imagemCapa: capaId,
    dataInicio: "2026-06-15",
    modalidade: "online",
    cargaHoraria: "8 horas",
    resumo:
      "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    inscricaoAberta: true,
  } as never;

  const existing = await payload.find({
    collection: "eventos",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });

  if (existing.docs.length > 0) {
    const id = existing.docs[0]!.id;
    await payload.update({ collection: "eventos", id, data, overrideAccess: true, draft: true });
    payload.logger.info(`[seed:edutec] Evento atualizado: ${slug} (id=${id}).`);
  } else {
    const created = await payload.create({
      collection: "eventos",
      data,
      overrideAccess: true,
      draft: true,
    });
    payload.logger.info(`[seed:edutec] Evento criado: ${slug} (id=${created.id}).`);
  }

  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:edutec] Falha:", err);
  process.exit(1);
});
