import { ValidationError } from "payload";
import { describe, expect, it } from "vitest";

import { ehErroSlugDuplicado } from "./erroSlugDuplicado";

/** O formato que o adapter drizzle 3.90 lança para um 23505 (handleUpsertError). */
const unicidade = (path: string) =>
  new ValidationError({
    collection: "eventos",
    errors: [{ message: "Value must be unique", path }],
  });

describe("ehErroSlugDuplicado", () => {
  it("reconhece a ValidationError de unicidade no campo slug", () => {
    expect(ehErroSlugDuplicado(unicidade("slug"))).toBe(true);
  });

  it("ignora ValidationError de outro campo", () => {
    expect(ehErroSlugDuplicado(unicidade("email"))).toBe(false);
  });

  it("ignora erro genérico, mesmo com texto parecido", () => {
    expect(ehErroSlugDuplicado(new Error("O seguinte campo está inválido: Slug"))).toBe(false);
    expect(ehErroSlugDuplicado("slug")).toBe(false);
    expect(ehErroSlugDuplicado(null)).toBe(false);
  });
});
