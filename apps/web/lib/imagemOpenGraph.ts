/**
 * Imagem do Open Graph sempre em URL absoluta (os robôs de compartilhamento
 * não resolvem caminho relativo de forma confiável). A imagem do topo do
 * programa chega como caminho do site (`/img/…`) ou como URL do otimizador
 * do Next (`/_next/image?url=<original>&w=…`, ver `imagemOtimizada`): esta
 * volta à imagem original, já absoluta (Supabase Storage); o caminho do
 * site é resolvido contra a URL pública do site.
 */
export function imagemOpenGraph(src: string, base: string): string | null {
  if (src === "") return null;
  if (src.startsWith("/_next/image?")) {
    const original = new URLSearchParams(src.slice("/_next/image?".length)).get("url");
    if (original) return imagemOpenGraph(original, base);
  }
  return new URL(src, base).toString();
}

/** A mesma base do `metadataBase` do layout raiz. */
export function urlPublicaDoSite(): string {
  return process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000";
}
