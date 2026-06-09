/**
 * Seed dos eventos online no CMS — registros de índice.
 *
 * A PÁGINA continua servida do estático (conteudoEventos.ts). Estes registros
 * existem para: (a) listar os eventos no admin/índice; (b) permitir editar capa,
 * data e folder PDF (override por slug — apps/web/lib/cms/overrideEventoOnline).
 * Idempotente por slug. Parametrizado — adicione novos eventos ao array EVENTOS.
 *
 * Execução: pnpm payload:seed:eventos-online
 */
import { getPayload } from "payload";

import config from "../payload.config";

interface EventoSeed {
  slug: string;
  nome: string;
  eyebrow: string;
  programaSigla: string;
  dataInicio: string; // ISO YYYY-MM-DD
  cargaHoraria: string;
  resumo: string;
}

const EVENTOS: EventoSeed[] = [
  {
    slug: "edutec-m01-2026",
    nome: "Cultura Digital, Educação Midiática e Transformação da Educação",
    eyebrow: "Seminário · NTC Educação",
    programaSigla: "EDUTEC",
    dataInicio: "2026-06-15",
    cargaHoraria: "8 horas",
    resumo:
      "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
  },
  {
    slug: "edutec-m02-2026",
    nome: "Fluência Digital Docente e Práticas Pedagógicas Inovadoras",
    eyebrow: "Seminário · NTC Educação",
    programaSigla: "EDUTEC",
    dataInicio: "2026-06-16",
    cargaHoraria: "8 horas",
    resumo:
      "Formação prática e contemporânea para qualificar o uso pedagógico das tecnologias e ampliar o repertório metodológico dos educadores.",
  },
  {
    slug: "edutec-m04-2026",
    nome: "Currículo e Computação: Integrando a BNCC à Prática Pedagógica",
    eyebrow: "Seminário · NTC Educação",
    programaSigla: "EDUTEC",
    dataInicio: "2026-06-17",
    cargaHoraria: "8 horas",
    resumo:
      "Integração do pensamento computacional e das competências da BNCC à prática pedagógica das redes públicas de ensino.",
  },
  {
    slug: "proge-m01-2026",
    nome: "Gestão Escolar em Transformação: Resultados, Recursos e Governança Democrática",
    eyebrow: "Seminário · NTC Educação",
    programaSigla: "PROGE",
    dataInicio: "2026-06-22",
    cargaHoraria: "8 horas",
    resumo:
      "Gestão escolar orientada a resultados, recursos e governança democrática para diretores e equipes gestoras da educação pública.",
  },
  {
    slug: "proge-m03-2026",
    nome: "Coordenação Pedagógica Estratégica: Mentoria, Recomposição e Gestão da Aprendizagem",
    eyebrow: "Seminário · NTC Educação",
    programaSigla: "PROGE",
    dataInicio: "2026-06-23",
    cargaHoraria: "8 horas",
    resumo:
      "Coordenação pedagógica estratégica com foco em mentoria docente, recomposição das aprendizagens e gestão de resultados.",
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  // Área de educação (sigla "educacao", NÃO "edu") — required na coleção.
  const areaRes = await payload.find({
    collection: "areas",
    where: { sigla: { equals: "educacao" } },
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  const areaId = areaRes.docs[0]?.id;
  if (!areaId) {
    throw new Error("[seed:eventos-online] Área 'educacao' não encontrada — rode o seed base antes.");
  }

  // Capa inicial (imagemCapa é required): usa uma media existente.
  const capaRes = await payload.find({
    collection: "media",
    where: { filename: { contains: "area-educacao" } },
    limit: 1,
    overrideAccess: true,
  });
  const capaId = capaRes.docs[0]?.id;
  if (!capaId) {
    throw new Error(
      "[seed:eventos-online] Nenhuma media 'area-educacao' encontrada — rode os seeds de imagem antes.",
    );
  }

  for (const ev of EVENTOS) {
    const programaRes = await payload.find({
      collection: "programas",
      where: { sigla: { equals: ev.programaSigla } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    const programaId = programaRes.docs[0]?.id;

    const data = {
      slug: ev.slug,
      nome: ev.nome,
      eyebrow: ev.eyebrow,
      area: areaId,
      ...(programaId ? { programa: programaId } : {}),
      imagemCapa: capaId,
      dataInicio: ev.dataInicio,
      modalidade: "online",
      cargaHoraria: ev.cargaHoraria,
      resumo: ev.resumo,
      inscricaoAberta: true,
    } as never;

    const existing = await payload.find({
      collection: "eventos",
      where: { slug: { equals: ev.slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });

    if (existing.docs.length > 0) {
      const id = existing.docs[0]!.id;
      await payload.update({ collection: "eventos", id, data, overrideAccess: true, draft: true });
      payload.logger.info(`[seed:eventos-online] Evento atualizado: ${ev.slug} (id=${id}).`);
    } else {
      const created = await payload.create({
        collection: "eventos",
        data,
        overrideAccess: true,
        draft: true,
      });
      payload.logger.info(`[seed:eventos-online] Evento criado: ${ev.slug} (id=${created.id}).`);
    }
  }

  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:eventos-online] Falha:", err);
  process.exit(1);
});
