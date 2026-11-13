import { describe, expect, it } from "vitest";

import { imagemOpenGraph } from "./imagemOpenGraph";

const BASE = "https://www.institutontc.com.br";

describe("imagemOpenGraph", () => {
  it("caminho do site vira URL absoluta", () => {
    expect(imagemOpenGraph("/img/programas/edutec.webp", BASE)).toBe(
      "https://www.institutontc.com.br/img/programas/edutec.webp",
    );
  });
  it("URL do otimizador volta à imagem original (absoluta)", () => {
    const original = "https://abc.supabase.co/storage/v1/object/public/ntc-portal-media/x.png";
    expect(imagemOpenGraph(`/_next/image?url=${encodeURIComponent(original)}&w=1920&q=75`, BASE)).toBe(original);
  });
  it("URL já absoluta passa intacta; base com barra no fim não dobra", () => {
    expect(imagemOpenGraph("https://cdn.test/a.jpg", BASE)).toBe("https://cdn.test/a.jpg");
    expect(imagemOpenGraph("/img/a.webp", `${BASE}/`)).toBe(`${BASE}/img/a.webp`);
  });
  it("sem imagem → null", () => {
    expect(imagemOpenGraph("", BASE)).toBeNull();
  });
});
