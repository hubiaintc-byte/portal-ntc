import { describe, expect, it } from "vitest";

import paginas from "@/seed/assets/paginas-programas.json";

import { slugDaSigla } from "./slugPrograma";

describe("slugDaSigla", () => {
  it("reproduz o slug dos 15 programas que estão no ar", () => {
    const lista = (paginas as { programas: { sigla: string; slug: string }[] }).programas;
    expect(lista).toHaveLength(15);
    for (const p of lista) expect(slugDaSigla(p.sigla)).toBe(p.slug);
  });

  it("minúsculas, sem acento, sem pontuação e sem espaços nas pontas", () => {
    expect(slugDaSigla(" PROSUS+ ")).toBe("prosus");
    expect(slugDaSigla("ÉGIDE")).toBe("egide");
  });
});
