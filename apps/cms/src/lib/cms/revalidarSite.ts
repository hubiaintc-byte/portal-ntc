import "server-only";

import type { Payload } from "payload";

/**
 * Pedidos de revalidação ao site (`POST /api/revalidate`, mesmo padrão de
 * `revalidarLayoutDoSite`) para o que o painel muda nos programas: a página
 * do programa, a lista `/programas`, a vertente, o menu do topo (presente em
 * todo layout) e o mapa do site.
 *
 * Melhor esforço: nada aqui lança. Quem chama transforma `false` em aviso —
 * o dado já está salvo, e o ISR acaba pegando a mudança sozinho.
 */

export interface PedidoRevalidacao {
  path: string;
  escopo?: "layout";
}

/** Segmentos de `/solucoes-estrategicas/[area]` no site — a `sigla` da área. */
const VERTENTES_DO_SITE: ReadonlySet<string> = new Set(["educacao", "gestao-publica", "saude"]);

export const AVISO_REVALIDACAO_SITE = "Salvo, mas a atualização no site pode levar alguns minutos.";

export function caminhosDoPrograma(p: {
  slug: string | null | undefined;
  areaSigla: string | null | undefined;
}): PedidoRevalidacao[] {
  const pedidos: PedidoRevalidacao[] = [];
  if (p.slug) pedidos.push({ path: `/programas/${p.slug}` });
  pedidos.push({ path: "/programas" });
  if (p.areaSigla && VERTENTES_DO_SITE.has(p.areaSigla)) {
    pedidos.push({ path: `/solucoes-estrategicas/${p.areaSigla}` });
  }
  pedidos.push({ path: "/", escopo: "layout" }, { path: "/mapa-do-site" });
  return pedidos;
}

function semRepetir(pedidos: PedidoRevalidacao[]): PedidoRevalidacao[] {
  const vistos = new Set<string>();
  return pedidos.filter((p) => {
    const chave = `${p.path}|${p.escopo ?? ""}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** `true` só se todos os pedidos voltaram ok. */
export async function pedirRevalidacao(pedidos: PedidoRevalidacao[]): Promise<boolean> {
  const frontUrl = process.env.PAYLOAD_PUBLIC_FRONT_URL ?? "http://localhost:3000";
  const secret = process.env.REVALIDATE_SECRET ?? "";
  const resultados = await Promise.all(
    pedidos.map(async (pedido) => {
      try {
        const resposta = await fetch(`${frontUrl}/api/revalidate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Revalidate-Secret": secret },
          body: JSON.stringify(pedido),
        });
        return resposta.ok;
      } catch (e) {
        console.error(`[revalidarSite] Falha ao revalidar ${pedido.path}.`, e);
        return false;
      }
    }),
  );
  return resultados.every(Boolean);
}

function idDe(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return null;
}

/** Slug e sigla da área de um programa (linha principal, como o site lê). */
export async function lerSlugEArea(
  payload: Pick<Payload, "findByID">,
  id: string | number,
): Promise<{ slug: string | null; areaSigla: string | null }> {
  const p = await payload.findByID({ collection: "programas", id, depth: 1, draft: false });
  const area = p.area && typeof p.area === "object" ? p.area.sigla : null;
  return { slug: p.slug ?? null, areaSigla: area ?? null };
}

/** Tudo o que mostra os programas dados. Ler o programa falhar também vira `false`. */
export async function revalidarProgramas(
  payload: Pick<Payload, "findByID">,
  ids: readonly (string | number)[],
): Promise<boolean> {
  try {
    const dados = await Promise.all([...new Set(ids.map(String))].map((id) => lerSlugEArea(payload, id)));
    return await pedirRevalidacao(semRepetir(dados.flatMap(caminhosDoPrograma)));
  } catch (e) {
    console.error("[revalidarSite] Falha ao ler o programa para revalidar.", e);
    return false;
  }
}

/**
 * Evento publicado/despublicado: a página do programa dele (bloco Módulos
 * abertos e selo dos módulos), pelo campo `programa` do evento e pelos
 * módulos que o listam em `eventosVinculados`. Sem programa nenhum, `true`.
 */
export async function revalidarProgramasDoEvento(
  payload: Pick<Payload, "findByID" | "find">,
  eventoId: string,
): Promise<boolean> {
  try {
    const [evento, modulos] = await Promise.all([
      payload.findByID({ collection: "eventos", id: eventoId, depth: 0, draft: true }),
      payload.find({
        collection: "modulos",
        where: { eventosVinculados: { equals: eventoId } },
        depth: 0,
        limit: 50,
        select: { programa: true },
      }),
    ]);
    const ids = [idDe(evento.programa), ...modulos.docs.map((m) => idDe(m.programa))].filter(
      (x): x is string => x !== null,
    );
    if (ids.length === 0) return true;
    const dados = await Promise.all([...new Set(ids)].map((id) => lerSlugEArea(payload, id)));
    const paginas = dados.filter((d) => d.slug).map((d) => ({ path: `/programas/${d.slug}` }));
    return await pedirRevalidacao(semRepetir(paginas));
  } catch (e) {
    console.error("[revalidarSite] Falha ao ler o evento para revalidar o programa.", e);
    return false;
  }
}
