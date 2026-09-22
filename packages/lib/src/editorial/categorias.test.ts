import { describe, expect, it } from "vitest";

import {
  CONTEUDO_CATEGORIA,
  SEGMENTOS_CATEGORIA,
  categoriaParaSegmento,
  rotuloCategoria,
  segmentoParaCategoria,
} from "./categorias";

describe("categorias de conteúdo", () => {
  it("tem as 5 do protótipo mais notícia", () => {
    expect(CONTEUDO_CATEGORIA).toEqual([
      "artigo",
      "estudo",
      "nota-tecnica",
      "webinar",
      "material",
      "noticia",
    ]);
  });

  it("dá rótulo legível a cada categoria", () => {
    expect(rotuloCategoria("nota-tecnica")).toBe("Nota técnica");
    expect(rotuloCategoria("material")).toBe("Material");
    expect(rotuloCategoria("noticia")).toBe("Notícia");
  });

  it("converte categoria em segmento plural de URL", () => {
    expect(categoriaParaSegmento("artigo")).toBe("artigos");
    expect(categoriaParaSegmento("nota-tecnica")).toBe("notas-tecnicas");
    expect(categoriaParaSegmento("material")).toBe("materiais");
    expect(categoriaParaSegmento("noticia")).toBe("noticias");
  });

  it("volta do segmento para a categoria", () => {
    for (const c of CONTEUDO_CATEGORIA) {
      expect(segmentoParaCategoria(categoriaParaSegmento(c))).toBe(c);
    }
  });

  it("devolve null para segmento desconhecido", () => {
    expect(segmentoParaCategoria("podcasts")).toBeNull();
    expect(segmentoParaCategoria("")).toBeNull();
  });

  it("expõe a lista de segmentos para o generateStaticParams", () => {
    expect(SEGMENTOS_CATEGORIA).toHaveLength(CONTEUDO_CATEGORIA.length);
    expect(SEGMENTOS_CATEGORIA).toContain("webinars");
  });
});
