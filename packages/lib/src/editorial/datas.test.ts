import { describe, expect, it } from "vitest";

import { formatarDataBR } from "./datas";

describe("formatarDataBR", () => {
  it("formata o datetime UTC do Payload sem deslocar o dia", () => {
    // 01/10 à meia-noite UTC é 30/09 21h em America/Sao_Paulo: o corte por
    // string é o que impede a lista do painel de mostrar o dia anterior.
    expect(formatarDataBR("2026-10-01T00:00:00.000Z")).toBe("01/10/2026");
  });

  it("aceita a data pura, sem parte de hora", () => {
    expect(formatarDataBR("2026-03-09")).toBe("09/03/2026");
  });

  it("devolve a entrada intacta quando não é uma data ISO", () => {
    expect(formatarDataBR("")).toBe("");
    expect(formatarDataBR("sem data")).toBe("sem data");
  });
});
