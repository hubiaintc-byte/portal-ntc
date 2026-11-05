/**
 * Loader das páginas de programa (`/programas/[slug]`) a partir do CMS.
 *
 * Lê `programas` (só publicados — nunca `draft: true`), os `modulos` do
 * programa (por `programa`, ordenados por `numero`) e os `eventos`
 * publicados ligados a ele, e entrega o `ConteudoPrograma` que a página
 * aprovada já renderiza, via `camposParaPagina`/`montarExtrasEventos`
 * (`@ntc/lib`).
 *
 * Vínculo evento → módulo: a coleção `eventos` não tem campo de módulo; o
 * vínculo mora em `modulos.eventosVinculados`. O número do módulo de cada
 * evento sai daí. Entram os eventos publicados com `programa` igual OU
 * listados em `eventosVinculados` de um módulo do programa.
 *
 * Datas do evento: mesma convenção de `derivarDatasEvento` — o dia é o
 * `YYYY-MM-DD` dos 10 primeiros caracteres do ISO gravado.
 *
 * Falha do banco propaga (o Next mantém a última versão gerada); programa
 * inexistente ou só em rascunho → `null` (a página responde 404).
 *
 * Server-only — não importe no client.
 */

import { cache } from "react";

import {
  camposParaPagina,
  montarExtrasEventos,
  paginaVazia,
  type CamposPaginaPrograma,
  type ConteudoPrograma,
  type EventoDoPrograma,
  type ModuloPrograma,
  type RelacionadoPrograma,
  type Vertical,
} from "@ntc/lib";
import type {
  Area,
  Evento as EventoCMS,
  Media,
  Modulo as ModuloCMS,
  Programa as ProgramaCMS,
} from "@ntc/types/payload-types";

import { imagemOtimizada, type LarguraImagem } from "@/lib/imagemOtimizada";
import { obterPayload } from "../payloadClient";

const SO_PUBLICADO = { _status: { equals: "published" as const } };
const MAX_RELACIONADOS = 3;

// ============================================================
// Conversões puras
// ============================================================

/** URL da media (se populada) vence o caminho legado em `public/img`. */
function imagem(midia: number | Media | null | undefined, caminho: string | null | undefined, largura: LarguraImagem): string {
  if (typeof midia === "object" && midia !== null && midia.url) return imagemOtimizada(midia.url, largura);
  return caminho ?? "";
}

function verticalDe(area: ProgramaCMS["area"]): Vertical {
  const sigla = typeof area === "object" && area !== null ? (area as Area).sigla : undefined;
  if (sigla === "saude" || sigla === "gestao-publica" || sigla === "educacao") return sigla;
  return "educacao";
}

function textos(lista: { texto?: string | null }[] | null | undefined): string[] {
  return (lista ?? []).map((i) => i.texto ?? "").filter((t) => t !== "");
}

function moduloParaCampos(m: ModuloCMS): ModuloPrograma {
  return {
    numero: m.numero,
    titulo: m.titulo,
    descricao: m.ementa,
    topicos: textos(m.topicos),
    cargaHoraria: m.cargaHoraria ?? "",
  };
}

export function docParaCampos(doc: ProgramaCMS, modulos: ModuloCMS[]): CamposPaginaPrograma {
  const pg = doc.pagina ?? {};
  const vazia = paginaVazia();
  const dc = pg.docentes ?? {};

  return {
    sigla: doc.sigla,
    slug: doc.slug,
    nomeCompleto: doc.nomeCompleto,
    vertical: verticalDe(doc.area),
    cargaHorariaTotal: doc.cargaHorariaTotal ?? "",
    visaoGeral: doc.visaoGeral,
    problema: doc.problema ?? null,
    objetivo: doc.objetivo ?? null,
    publicoAlvo: doc.publicoAlvo ?? null,
    eixos: (doc.eixosTematicos ?? []).map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    resultados: (doc.resultadosEsperados ?? []).map((r) => r.resultado),
    diferenciais: (doc.diferenciais ?? []).map((d) => ({ titulo: d.titulo, descricao: d.descricao ?? "" })),
    faq: (doc.faq ?? []).map((f) => ({ pergunta: f.pergunta, resposta: f.resposta })),
    modulos: [...modulos].sort((a, b) => a.numero - b.numero).map(moduloParaCampos),
    pagina: {
      identidadeVisual: pg.identidadeVisual ?? vazia.identidadeVisual,
      heroTitulo: pg.heroTitulo ?? "",
      heroSubtitulo: pg.heroSubtitulo ?? "",
      heroImagem: imagem(pg.heroImagem, pg.heroImagemCaminho, 1920),
      barraDados: (pg.barraDados ?? []).map((b) => ({
        rotulo: b.rotulo ?? "",
        valor: b.valor ?? "",
        valorSub: b.valorSub ?? "",
      })),
      visaoGeralTitulo: pg.visaoGeralTitulo ?? "",
      problemaTitulo: pg.problemaTitulo ?? "",
      problemaDestaque: pg.problemaDestaque ?? "",
      publicoChips: textos(pg.publicoChips),
      docentes: {
        titulo: dc.titulo ?? "",
        intro: dc.intro ?? "",
        coordenacaoMarcador: dc.coordenacaoMarcador ?? "",
        especialistasMarcador: dc.especialistasMarcador ?? "",
        contadores: (dc.contadores ?? []).map((c) => ({ num: c.num ?? "", lbl: c.lbl ?? "" })),
        nota: dc.nota ?? "",
        coordenacao: (dc.coordenacao ?? []).map((d) => ({
          tag: d.tag ?? "",
          imgSrc: imagem(d.imagem, d.imagemCaminho, 640),
          imgAlt: d.imagemAlt ?? "",
          eixoBadge: d.eixoBadge ?? "",
          nome: d.nome ?? "",
          credencial: d.credencial ?? "",
          eixo: d.eixo ?? "",
          modulos: d.modulos ?? "",
        })),
        especialistas: (dc.especialistas ?? []).map((d) => ({
          imgSrc: imagem(d.imagem, d.imagemCaminho, 640),
          imgAlt: d.imagemAlt ?? "",
          eixoBadge: d.eixoBadge ?? "",
          nome: d.nome ?? "",
          credencial: d.credencial ?? "",
          modulos: d.modulos ?? "",
        })),
      },
      modalidadesIntro: pg.modalidadesIntro ?? "",
      modalidadesCards: (pg.modalidadesCards ?? []).map((c) => ({
        destaque: c.destaque ?? false,
        tag: c.tag ?? "",
        titulo: c.titulo ?? "",
        descricao: c.descricao ?? "",
        ctaRotulo: c.ctaRotulo ?? "",
        ctaHref: c.ctaHref ?? "",
      })),
      modulosAbertosMicrocopy: pg.modulosAbertosMicrocopy ?? "",
      chamadaFinalTitulo: pg.chamadaFinalTitulo ?? "",
      chamadaFinalTexto: pg.chamadaFinalTexto ?? "",
      resumoLateral: (pg.resumoLateral ?? []).map((r) => ({ rotulo: r.rotulo ?? "", valor: r.valor ?? "" })),
      entregas: textos(pg.entregas),
      cartao: {
        nome: pg.cartao?.nome ?? "",
        tagline: pg.cartao?.tagline ?? "",
        meta: pg.cartao?.meta ?? "",
        imagem: imagem(pg.cartao?.imagem, pg.cartao?.imagemCaminho, 640),
        ordem: pg.cartao?.ordem ?? null,
      },
    },
  };
}

/** Mesma regra da versão estática: mesma vertente, outro slug, até 3, na ordem da lista. */
export function relacionadosDe(slug: string, todos: CamposPaginaPrograma[]): RelacionadoPrograma[] {
  const atual = todos.find((c) => c.slug === slug);
  if (!atual) return [];
  return todos
    .filter((c) => c.vertical === atual.vertical && c.slug !== slug)
    .slice(0, MAX_RELACIONADOS)
    .map((c) => ({ slug: c.slug, sigla: c.sigla, nomeCurto: c.nomeCompleto, descritor: c.sigla }));
}

const ROTULO_MODALIDADE: Record<EventoCMS["modalidade"], string> = {
  online: "Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

function eventoParaPrograma(e: EventoCMS, numeroPorEvento: Map<number, number>): EventoDoPrograma {
  const capa = typeof e.imagemCapa === "object" && e.imagemCapa !== null ? e.imagemCapa.url : null;
  return {
    slug: e.slug,
    titulo: e.nome,
    dataInicio: e.dataInicio.slice(0, 10),
    dataFim: e.dataFim ? e.dataFim.slice(0, 10) : null,
    modalidade: ROTULO_MODALIDADE[e.modalidade] ?? e.modalidade,
    capaUrl: capa ? imagemOtimizada(capa, 1200) : null,
    moduloNumero: numeroPorEvento.get(e.id) ?? null,
  };
}

function idDe(ref: number | { id: number }): number {
  return typeof ref === "object" ? ref.id : ref;
}

// ============================================================
// Loaders
// ============================================================

export const buscarProgramaPublicado = cache(async (slug: string): Promise<ConteudoPrograma | null> => {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "programas",
    where: { and: [{ slug: { equals: slug } }, SO_PUBLICADO] },
    depth: 1,
    limit: 1,
  });
  const doc = res.docs[0];
  if (!doc) return null;

  const mods = await payload.find({
    collection: "modulos",
    where: { programa: { equals: doc.id } },
    sort: "numero",
    depth: 0,
    limit: 100,
  });

  const numeroPorEvento = new Map<number, number>();
  for (const m of mods.docs) {
    for (const ev of m.eventosVinculados ?? []) numeroPorEvento.set(idDe(ev), m.numero);
  }
  const vinculados = [...numeroPorEvento.keys()];

  const evs = await payload.find({
    collection: "eventos",
    where: {
      and: [
        SO_PUBLICADO,
        {
          or: [
            { programa: { equals: doc.id } },
            ...(vinculados.length > 0 ? [{ id: { in: vinculados } }] : []),
          ],
        },
      ],
    },
    depth: 1,
    limit: 100,
  });

  const campos = docParaCampos(doc, mods.docs);
  const extras = montarExtrasEventos(
    evs.docs.map((e) => eventoParaPrograma(e, numeroPorEvento)),
    new Date(),
    { vertical: campos.vertical, imagemVertente: campos.pagina.heroImagem },
  );
  return camposParaPagina(campos, extras);
});

/** Programas publicados, ordenados por `pagina.cartao.ordem` (vazios no fim) e depois sigla. */
export const listarProgramasPublicados = cache(async (): Promise<CamposPaginaPrograma[]> => {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "programas",
    where: SO_PUBLICADO,
    depth: 1,
    limit: 100,
  });
  const ids = res.docs.map((d) => d.id);
  const mods =
    ids.length > 0
      ? await payload.find({
          collection: "modulos",
          where: { programa: { in: ids } },
          sort: "numero",
          depth: 0,
          limit: 2000,
        })
      : { docs: [] as ModuloCMS[] };

  const porPrograma = new Map<number, ModuloCMS[]>();
  for (const m of mods.docs) {
    const id = idDe(m.programa);
    porPrograma.set(id, [...(porPrograma.get(id) ?? []), m]);
  }

  return res.docs
    .map((d) => docParaCampos(d, porPrograma.get(d.id) ?? []))
    .sort((a, b) => {
      const oa = a.pagina.cartao.ordem;
      const ob = b.pagina.cartao.ordem;
      if (oa !== ob) {
        if (oa === null) return 1;
        if (ob === null) return -1;
        return oa - ob;
      }
      return a.sigla.localeCompare(b.sigla);
    });
});
