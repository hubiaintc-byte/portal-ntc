import type { CollectionAfterChangeHook } from "payload";

/**
 * Dispara revalidação on-demand das páginas afetadas no front Next.js
 * após a publicação de um documento no admin (doc 11 §17 · DAB §6
 * On-Demand Revalidation).
 *
 * Em desenvolvimento (NODE_ENV !== production), é no-op — o ISR não está
 * em uso e o restart manual do dev server basta. Em produção, faz POST
 * autenticado ao endpoint /api/revalidate do front-end com o caminho
 * interpolado a partir do slug do documento.
 *
 * Falhas de rede são logadas mas não bloqueiam o save: a estratégia é
 * "publicação primeiro, revalidação melhor-esforço" — a próxima request
 * ao ISR vai revalidar naturalmente em ≤300s.
 */
export const revalidatePage =
  (paths: string[]): CollectionAfterChangeHook =>
  async ({ doc }) => {
    if (process.env.NODE_ENV !== "production") return doc;

    const slug = typeof doc?.slug === "string" ? doc.slug : "";
    const interpolatedPaths = paths.map((p) => p.replace(":slug", slug));

    const frontUrl = process.env.PAYLOAD_PUBLIC_FRONT_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!frontUrl || !secret) {
      console.warn("[revalidatePage] PAYLOAD_PUBLIC_FRONT_URL ou REVALIDATE_SECRET ausentes.");
      return doc;
    }

    await Promise.allSettled(
      interpolatedPaths.map(async (path) => {
        try {
          await fetch(`${frontUrl}/api/revalidate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Revalidate-Secret": secret,
            },
            body: JSON.stringify({ path }),
          });
        } catch (e) {
          console.error(`[revalidatePage] Falha ao revalidar ${path}`, e);
        }
      }),
    );

    return doc;
  };
