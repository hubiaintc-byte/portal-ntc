import { describe, expect, it } from "vitest";

import { numeroOuNulo } from "./painelCrmEscrita";

describe("numeroOuNulo", () => {
  it("converte string de formulário em número ou null", () => {
    expect(numeroOuNulo("140000")).toBe(140000);
    expect(numeroOuNulo("75,5")).toBe(75.5);
    expect(numeroOuNulo("")).toBeNull();
    expect(numeroOuNulo("abc")).toBeNull();
  });
});
