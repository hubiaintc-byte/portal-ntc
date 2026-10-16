/**
 * Fotos e capas do CMS ficam no Supabase Storage no tamanho em que foram
 * enviadas — PNGs de 1 a 4 MB (auditoria de 07/10/2026: home com 6 MB,
 * corpo docente com 14 MB). Esta função troca a URL pela do otimizador do
 * Next (`/_next/image`), que redimensiona e entrega webp, sem mudar o markup
 * nem o CSS das páginas — serve tanto para `<img src>` quanto para
 * `background-image`. URLs que não são do Supabase (as de `/img`, já
 * otimizadas) passam intactas.
 */

/** Larguras aceitas pelo otimizador (subconjunto dos `deviceSizes` padrão do Next). */
export type LarguraImagem = 640 | 828 | 1080 | 1200 | 1920;

const SUPABASE_STORAGE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//;

export function imagemOtimizada(src: string, largura: LarguraImagem): string {
  if (!SUPABASE_STORAGE.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${largura}&q=75`;
}
