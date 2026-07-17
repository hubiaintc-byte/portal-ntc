import { cache } from "react";

import type { EventoOnline } from "@/app/(capacitacao)/agenda/[slug]/conteudoEventos";

import { obterPayload } from "../payloadClient";
import { derivarDatasEvento } from "./derivarDatasEvento";

/**
 * Override de evento ONLINE via CMS. A página renderiza o evento estático
 * (conteúdo validado); o CMS casa por slug e sobrescreve SÓ capa, data e o
 * folder PDF. Sem registro / sem campo / CMS fora do ar → retorna null
 * (a página usa o estático intacto — fallback silencioso).
 */

interface OverrideEvento {
  coverUrl?: string;
  dataInicioISO?: string;
  folderUrl?: string;
  /** Mapa nome-normalizado → URL da foto, vindo da coleção `especialistas`. */
  fotosPalestrantes?: Record<string, string>;
}

type UploadComUrl = { url?: string | null } | string | number | null | undefined;

function urlDoUpload(v: UploadComUrl): string | undefined {
  if (v && typeof v === "object" && "url" in v && v.url) return v.url;
  return undefined;
}

/** Normaliza nome para casar palestrante do estático com especialista do CMS. */
function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase();
}

export async function buscarOverride(slug: string): Promise<OverrideEvento | null> {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "eventos",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });
    const doc = res.docs[0] as
      | { imagemCapa?: UploadComUrl; dataInicio?: string; folderPdf?: UploadComUrl }
      | undefined;
    if (!doc) return null;
    return {
      coverUrl: urlDoUpload(doc.imagemCapa),
      dataInicioISO: doc.dataInicio,
      folderUrl: urlDoUpload(doc.folderPdf),
      fotosPalestrantes: await buscarFotosPalestrantes(),
    };
  } catch (err) {
    console.error("[agenda] buscarOverride falhou, usando estático:", err);
    return null;
  }
}

/**
 * Mapa nome-normalizado → URL da foto de cada especialista cadastrado com foto.
 * Lido via Local API (a URL do Storage é derivada em runtime; não persiste em
 * coluna). Usado pelo override online para casar palestrantes do estático com
 * fotos reais do CMS por nome. Falha → mapa vazio (estático intacto).
 *
 * cache() do React: home/agenda chamam buscarOverride uma vez POR evento; sem
 * o cache, cada revalidação fazia N varreduras completas de especialistas.
 * select limita as colunas — o mapa só precisa de nome/foto/ocultarDoSite.
 */
const buscarFotosPalestrantes = cache(async (): Promise<Record<string, string>> => {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "especialistas",
      limit: 500,
      depth: 1,
      select: { nome: true, foto: true, ocultarDoSite: true },
      overrideAccess: true,
    });
    const mapa: Record<string, string> = {};
    for (const esp of res.docs as Array<{
      nome?: string;
      foto?: UploadComUrl;
      ocultarDoSite?: boolean | null;
    }>) {
      // Oculto no CMS → não injeta foto; o palestrante volta ao estático.
      if (esp.ocultarDoSite) continue;
      const url = urlDoUpload(esp.foto);
      if (esp.nome && url) {
        mapa[normalizarNome(esp.nome)] = url;
      }
    }
    return mapa;
  } catch (err) {
    console.error("[agenda] buscarFotosPalestrantes falhou:", err);
    return {};
  }
});

export function aplicarOverrideOnline(
  evento: EventoOnline,
  ovr: OverrideEvento,
): EventoOnline {
  let e = evento;

  // 1) Capa → hero bg + sidebar cover
  if (ovr.coverUrl) {
    e = {
      ...e,
      heroOnline: e.heroOnline ? { ...e.heroOnline, bgUrl: ovr.coverUrl } : e.heroOnline,
      sidebarOnline: e.sidebarOnline
        ? { ...e.sidebarOnline, coverImg: ovr.coverUrl }
        : e.sidebarOnline,
    };
  }

  // 2) Data → deriva e sobrescreve todos os formatos
  if (ovr.dataInicioISO) {
    const d = derivarDatasEvento(ovr.dataInicioISO);
    e = {
      ...e,
      dataEvento: d.dataEvento,
      metasOnline: e.metasOnline?.map((m) =>
        m.label === "Quando" ? { ...m, value: d.metaValue, valueSub: d.metaSub } : m,
      ),
      programacaoOnline: e.programacaoOnline
        ? { ...e.programacaoOnline, headDayHtml: d.timelineDiaHtml }
        : e.programacaoOnline,
      sidebarOnline: e.sidebarOnline
        ? {
            ...e.sidebarOnline,
            rows: e.sidebarOnline.rows.map((r) =>
              r.label === "Quando" ? { ...r, value: d.sidebarValue } : r,
            ),
            countdown: {
              ...e.sidebarOnline.countdown,
              dateText: d.countdownDateText,
              deadline: d.deadlineISO,
            },
          }
        : e.sidebarOnline,
      agendaIcs: {
        ...e.agendaIcs,
        startISO: d.icsStart,
        endISO: d.icsEnd,
      },
    };
  }

  // 3) Folder PDF → href do CTA "Baixar folder" (cmsLink contém "folder").
  //    Sem PDF, o layout esconde o CTA (href placeholder).
  if (ovr.folderUrl && e.heroOnline) {
    const folderUrl = ovr.folderUrl;
    e = {
      ...e,
      heroOnline: {
        ...e.heroOnline,
        ctas: e.heroOnline.ctas.map((c) =>
          /folder/i.test(c.cmsLink ?? "") ? { ...c, href: folderUrl } : c,
        ),
      },
    };
  }

  // 4) Fotos dos palestrantes → casa por nome com especialistas do CMS.
  //    Preenche só quando o estático está sem foto e há match (não sobrescreve
  //    foto já definida na porta).
  const fotos = ovr.fotosPalestrantes;
  if (fotos && e.palestrantesOnline) {
    e = {
      ...e,
      palestrantesOnline: {
        ...e.palestrantesOnline,
        palestrantes: e.palestrantesOnline.palestrantes.map((p) => {
          if (p.foto) return p;
          const url = fotos[normalizarNome(p.nome)];
          return url ? { ...p, foto: url } : p;
        }),
      },
    };
  }

  return e;
}
