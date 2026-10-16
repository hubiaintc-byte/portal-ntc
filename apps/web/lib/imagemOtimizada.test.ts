import { describe, expect, it } from "vitest";

import { imagemOtimizada } from "./imagemOtimizada";

describe("imagemOtimizada", () => {
  const capa = "https://irekejunwknguzdfszyi.supabase.co/storage/v1/object/public/ntc-portal-media/media/m01 capa.png";

  it("passa a imagem do Supabase pelo otimizador do Next", () => {
    expect(imagemOtimizada(capa, 828)).toBe(`/_next/image?url=${encodeURIComponent(capa)}&w=828&q=75`);
  });

  it("não mexe em imagem local nem em URL vazia ou de outro host", () => {
    expect(imagemOtimizada("/img/fotos/_optimized/area-educacao.1920.webp", 640)).toBe(
      "/img/fotos/_optimized/area-educacao.1920.webp",
    );
    expect(imagemOtimizada("", 640)).toBe("");
    expect(imagemOtimizada("https://exemplo.com/a.png", 640)).toBe("https://exemplo.com/a.png");
  });
});
