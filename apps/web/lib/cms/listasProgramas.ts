/**
 * Listas e menus de programas do site a partir do CMS: grades das páginas
 * de vertente (`/solucoes-estrategicas/[area]`), índice `/programas`, menu
 * "Programas" do cabeçalho (`HeaderHome`) e mapa do site.
 *
 * Fonte: os programas publicados (`listarProgramasPublicadosComId`), com os
 * textos de `pagina.cartao` e a ordem `cartao.ordem` → sigla (programa sem
 * ordem vai para o fim da sua vertente). "Módulos abertos" do cartão
 * (`flagAberto`) sai dos eventos: há evento publicado e ativo do programa
 * (pelo campo `programa` do evento ou por `eventosVinculados` de um módulo).
 *
 * Falha de leitura (ou nenhum programa publicado) LANÇA, como a página do
 * programa: com ISR a página já gerada continua no ar com a última versão
 * boa; não há mais cartão estático de reserva (removido na virada do
 * catálogo para o CMS). As listas curadas (drawer mobile com 6, Home
 * "evidência", `/capacitacao`) não passam por aqui.
 *
 * Server-only — não importe no client (o `HeaderHome` recebe por prop).
 */

import { cache } from "react";

import { eventoAtivo, numeroPorExtenso, type CamposPaginaPrograma, type Vertical } from "@ntc/lib";

import type { FallbackVertical } from "@/app/(vertical)/solucoes-estrategicas/[area]/conteudoFallback";
import { obterPayload } from "../payloadClient";
import { listarProgramasPublicadosComId } from "./programas";

export interface CartaoPrograma {
  sigla: string;
  slug: string;
  nome: string;
  tagline: string;
  meta: string;
  imagemSrc: string;
  flagAberto: boolean;
  vertical: Vertical;
  descricaoMenu: string;
  descricaoMapa: string;
}

export interface ListasProgramas {
  /** Todos, na ordem do cartão. */
  cartoes: CartaoPrograma[];
  porVertical: Record<Vertical, CartaoPrograma[]>;
  total: number;
}

/** Item do menu do cabeçalho (o que o client component precisa). */
export interface ItemMenuPrograma {
  sigla: string;
  slug: string;
  descricao: string;
}

export interface MenuProgramas {
  porVertical: Record<Vertical, ItemMenuPrograma[]>;
  /** `null` quando a leitura falhou (menu vazio, contagem desconhecida). */
  total: number | null;
}

// ============================================================
// Puras
// ============================================================

export function cartaoDoPrograma(c: CamposPaginaPrograma, flagAberto = false): CartaoPrograma {
  const k = c.pagina.cartao;
  return {
    sigla: c.sigla,
    slug: c.slug,
    nome: k.nome,
    tagline: k.tagline,
    meta: k.meta,
    imagemSrc: k.imagem,
    flagAberto,
    vertical: c.vertical,
    descricaoMenu: k.descricaoMenu,
    descricaoMapa: k.descricaoMapa,
  };
}

/** Agrupa por vertente mantendo a ordem recebida. */
export function montarListas(cartoes: CartaoPrograma[]): ListasProgramas {
  const porVertical: Record<Vertical, CartaoPrograma[]> = {
    educacao: [],
    "gestao-publica": [],
    saude: [],
  };
  for (const c of cartoes) porVertical[c.vertical].push(c);
  return { cartoes, porVertical, total: cartoes.length };
}

export function menuDasListas(l: ListasProgramas): MenuProgramas {
  const item = (c: CartaoPrograma): ItemMenuPrograma => ({
    sigla: c.sigla,
    slug: c.slug,
    descricao: c.descricaoMenu,
  });
  return {
    porVertical: {
      educacao: l.porVertical.educacao.map(item),
      "gestao-publica": l.porVertical["gestao-publica"].map(item),
      saude: l.porVertical.saude.map(item),
    },
    total: l.total,
  };
}

function programas(n: number): string {
  return n === 1 ? "programa" : "programas";
}

/** "Nove programas …" → contagem por extenso no início do texto. */
export function trocarContagemExtenso(texto: string, n: number): string {
  return texto.replace(/^\S+ programas?\b/, `${numeroPorExtenso(n)} ${programas(n)}`);
}

/** "os 9 programas" → contagem em dígitos onde já era dígito. */
export function trocarContagem(texto: string, n: number): string {
  return texto.replace(/\b\d+ programas?\b/g, `${n} ${programas(n)}`);
}

type CartoesVertente<V> = V extends { programas: infer P }
  ? Omit<V, "programas"> & { programas: Omit<P, "cards"> & { cards: CartaoPrograma[] } }
  : never;

export type VertenteComProgramas = CartoesVertente<FallbackVertical>;

/**
 * Fallback da vertente com os cartões e as contagens de títulos e rótulos
 * recalculados (título da grade, botão do topo, metadado "Portfólio", CTA
 * "Ver todos os N"). A prosa (sub, lede, FAQ) fica como está.
 */
export function vertenteComProgramas(
  v: FallbackVertical,
  cartoes: CartaoPrograma[],
  total: number,
): VertenteComProgramas {
  const n = cartoes.length;
  return {
    ...v,
    hero: {
      ...v.hero,
      ctas: v.hero.ctas.map((c) => ({ ...c, rotulo: trocarContagem(c.rotulo, n) })),
    },
    metadados: v.metadados.map((m) => ({ ...m, value: trocarContagem(m.value, n) })),
    programas: {
      ...v.programas,
      tituloHtml: trocarContagemExtenso(v.programas.tituloHtml, n),
      cards: cartoes,
      ctaPrimario: {
        ...v.programas.ctaPrimario,
        rotulo: trocarContagem(v.programas.ctaPrimario.rotulo, total),
      },
    },
  } as VertenteComProgramas;
}

/** Ids dos programas com evento ativo (direto ou pelo vínculo de um módulo). */
export function programasComEventoAtivo(
  eventos: { id: number; programa: number | null; dataInicio: string; dataFim: string | null }[],
  modulos: { programa: number; eventos: number[] }[],
  agora: Date,
): Set<number> {
  const programasDoEvento = new Map<number, Set<number>>();
  for (const m of modulos) {
    for (const ev of m.eventos) {
      programasDoEvento.set(ev, (programasDoEvento.get(ev) ?? new Set()).add(m.programa));
    }
  }
  const ativos = new Set<number>();
  for (const e of eventos) {
    const ativo = eventoAtivo(
      {
        slug: "",
        titulo: "",
        dataInicio: e.dataInicio.slice(0, 10),
        dataFim: e.dataFim ? e.dataFim.slice(0, 10) : null,
        modalidade: "",
        capaUrl: null,
        moduloNumero: null,
      },
      agora,
    );
    if (!ativo) continue;
    if (e.programa !== null) ativos.add(e.programa);
    for (const p of programasDoEvento.get(e.id) ?? []) ativos.add(p);
  }
  return ativos;
}

// ============================================================
// Loader
// ============================================================

function idDe(ref: number | { id: number } | null | undefined): number | null {
  if (ref === null || ref === undefined) return null;
  return typeof ref === "object" ? ref.id : ref;
}

export async function carregarListasProgramas(agora: Date = new Date()): Promise<ListasProgramas> {
  const publicados = await listarProgramasPublicadosComId();
  if (publicados.length === 0) {
    throw new Error("[listasProgramas] Nenhum programa publicado no CMS.");
  }

  const ids = publicados.map((p) => p.id);
  const vinculados = [...new Set(publicados.flatMap((p) => p.eventosVinculados))];
  const payload = await obterPayload();
  const evs = await payload.find({
    collection: "eventos",
    where: {
      and: [
        { _status: { equals: "published" } },
        {
          or: [
            { programa: { in: ids } },
            ...(vinculados.length > 0 ? [{ id: { in: vinculados } }] : []),
          ],
        },
      ],
    },
    depth: 0,
    limit: 500,
    // Mais recentes primeiro: o histórico não empurra os ativos para fora do limite.
    sort: "-dataInicio",
  });
  const ativos = programasComEventoAtivo(
    evs.docs.map((e) => ({
      id: e.id,
      programa: idDe(e.programa),
      dataInicio: e.dataInicio,
      dataFim: e.dataFim ?? null,
    })),
    publicados.map((p) => ({ programa: p.id, eventos: p.eventosVinculados })),
    agora,
  );
  return montarListas(publicados.map((p) => cartaoDoPrograma(p.campos, ativos.has(p.id))));
}

/** Uma leitura por request (layout e página compartilham). */
export const obterListasProgramas = cache(
  (): Promise<ListasProgramas> => carregarListasProgramas(),
);

/** Menu sem programas e sem contagem: o que o cabeçalho mostra se o CMS falhar. */
export const MENU_PROGRAMAS_VAZIO: MenuProgramas = {
  porVertical: { educacao: [], "gestao-publica": [], saude: [] },
  total: null,
};

/**
 * Menu do cabeçalho de TODO layout do site. Diferente das listas (que
 * lançam, R20), o menu tolera falha (R26): um erro de leitura do CMS — ou
 * nenhum programa publicado — não pode derrubar o prerender de toda página,
 * o build do CI (sem banco) nem o 404 de slug desconhecido. Loga e devolve
 * o menu vazio; "Ver todos os programas" continua levando a `/programas`.
 */
export async function obterMenuProgramas(): Promise<MenuProgramas> {
  try {
    return menuDasListas(await obterListasProgramas());
  } catch (erro) {
    console.error("[menuProgramas] Falha ao ler os programas do CMS; menu vazio.", erro);
    return MENU_PROGRAMAS_VAZIO;
  }
}
