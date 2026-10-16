import type { CorpoDocente } from "@ntc/types";

export type CardGlobal = NonNullable<CorpoDocente["cards"]>[number];
export type FormatoCard = "featured" | "expert";

export interface TextosCard {
  tag: string;
  axisBadge: string;
  credencialCard: string;
  /** Só featured. */
  metaAtuacao: string;
  metaEixos: string;
  /** Só expert. */
  programasTexto: string;
  programasStrong: string;
  sufixoPrograma: string;
  ctaHref: string;
  ctaRotulo: string;
}

export interface CardDesejado {
  formato: FormatoCard;
  textos: TextosCard;
}

export const TEXTOS_CARD_VAZIOS: TextosCard = {
  tag: "",
  axisBadge: "",
  credencialCard: "",
  metaAtuacao: "",
  metaEixos: "",
  programasTexto: "",
  programasStrong: "",
  sufixoPrograma: "",
  ctaHref: "",
  ctaRotulo: "",
};

export class ListaDesatualizadaError extends Error {
  constructor(mensagem = "A lista de cards mudou. Recarregue a página e tente de novo.") {
    super(mensagem);
    this.name = "ListaDesatualizadaError";
  }
}

export function idEspecialistaDoCard(card: CardGlobal): string | null {
  const e = card.especialista;
  if (e === null || e === undefined) return null;
  return String(typeof e === "object" ? e.id : e);
}

const vazioParaNulo = (v: string): string | null => (v === "" ? null : v);

function textoDe(v: string | null | undefined): string {
  return v ?? "";
}

export function cardDoEspecialista(cards: CardGlobal[], especialistaId: string): CardDesejado | null {
  const card = cards.find(
    (c) => c.formato !== "axis" && idEspecialistaDoCard(c) === especialistaId,
  );
  if (!card || card.formato === "axis") return null;
  return {
    formato: card.formato,
    textos: {
      tag: textoDe(card.tag),
      axisBadge: textoDe(card.axisBadge),
      credencialCard: textoDe(card.credencialCard),
      metaAtuacao: textoDe(card.metaAtuacao),
      metaEixos: textoDe(card.metaEixos),
      programasTexto: textoDe(card.programasTexto),
      programasStrong: textoDe(card.programasStrong),
      sufixoPrograma: textoDe(card.sufixoPrograma),
      ctaHref: textoDe(card.ctaHref),
      ctaRotulo: textoDe(card.ctaRotulo),
    },
  };
}

/** Grava o especialista sempre como id numérico (nunca objeto populado). */
function comEspecialistaNumerico(card: CardGlobal): CardGlobal {
  const id = idEspecialistaDoCard(card);
  if (id === null || typeof card.especialista === "number") return card;
  return { ...card, especialista: Number(id) };
}

function montarCard(
  base: CardGlobal | undefined,
  especialistaId: string,
  desejo: CardDesejado,
): CardGlobal {
  const t = desejo.textos;
  const featured = desejo.formato === "featured";
  return {
    ...base,
    formato: desejo.formato,
    especialista: Number(especialistaId),
    tag: vazioParaNulo(t.tag),
    axisBadge: vazioParaNulo(t.axisBadge),
    credencialCard: vazioParaNulo(t.credencialCard),
    metaAtuacao: featured ? vazioParaNulo(t.metaAtuacao) : null,
    metaEixos: featured ? vazioParaNulo(t.metaEixos) : null,
    programasTexto: featured ? null : vazioParaNulo(t.programasTexto),
    programasStrong: featured ? null : vazioParaNulo(t.programasStrong),
    sufixoPrograma: featured ? null : vazioParaNulo(t.sufixoPrograma),
    ctaHref: vazioParaNulo(t.ctaHref),
    ctaRotulo: vazioParaNulo(t.ctaRotulo),
  };
}

export function aplicarCardDe(
  cards: CardGlobal[],
  especialistaId: string,
  desejo: CardDesejado | null,
): CardGlobal[] {
  const ehDele = (c: CardGlobal) =>
    c.formato !== "axis" && idEspecialistaDoCard(c) === especialistaId;
  const existe = cards.some(ehDele);

  if (desejo === null) {
    return cards.filter((c) => !ehDele(c)).map(comEspecialistaNumerico);
  }
  if (!existe) {
    return [...cards.map(comEspecialistaNumerico), montarCard(undefined, especialistaId, desejo)];
  }
  return cards.map((c) =>
    ehDele(c) ? montarCard(c, especialistaId, desejo) : comEspecialistaNumerico(c),
  );
}

export function reordenarCards(cards: CardGlobal[], idsNaOrdem: string[]): CardGlobal[] {
  const pessoas = cards.filter((c) => c.formato !== "axis");
  const porId = new Map<string, CardGlobal>();
  for (const c of pessoas) {
    const id = idEspecialistaDoCard(c);
    if (id === null || porId.has(id)) throw new ListaDesatualizadaError();
    porId.set(id, c);
  }
  const vistos = new Set<string>();
  for (const id of idsNaOrdem) {
    if (!porId.has(id) || vistos.has(id)) throw new ListaDesatualizadaError();
    vistos.add(id);
  }
  if (vistos.size !== porId.size) throw new ListaDesatualizadaError();

  let i = 0;
  return cards.map((c) => {
    if (c.formato === "axis") return c;
    const proximo = porId.get(idsNaOrdem[i++] ?? "");
    if (!proximo) throw new ListaDesatualizadaError();
    return comEspecialistaNumerico(proximo);
  });
}
