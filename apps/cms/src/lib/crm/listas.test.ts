import { describe, expect, it } from "vitest";

import { slugDeRotulo, UFS } from "@ntc/lib";

describe("listas do CRM", () => {
  it("slugDeRotulo normaliza acentos, espaços e pontuação", () => {
    expect(slugDeRotulo("Em qualificação")).toBe("em-qualificacao");
    expect(slugDeRotulo("Apresentação institucional")).toBe("apresentacao-institucional");
    expect(slugDeRotulo("Cliente ativo")).toBe("cliente-ativo");
    expect(slugDeRotulo("À vista após NF · 15 dias")).toBe("a-vista-apos-nf-15-dias");
  });

  it("UFS tem as 27 unidades federativas", () => {
    expect(UFS).toHaveLength(27);
  });
});
