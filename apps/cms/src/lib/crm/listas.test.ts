import { describe, expect, it } from "vitest";

import { slugDeRotulo, STATUS_CLIENTE_CRM, STATUS_OPORTUNIDADE, UFS } from "@ntc/lib";

describe("listas do CRM", () => {
  it("slugDeRotulo normaliza acentos, espaços e pontuação", () => {
    expect(slugDeRotulo("Em qualificação")).toBe("em-qualificacao");
    expect(slugDeRotulo("Apresentação institucional")).toBe("apresentacao-institucional");
    expect(slugDeRotulo("Cliente ativo")).toBe("cliente-ativo");
    expect(slugDeRotulo("À vista após NF · 15 dias")).toBe("a-vista-apos-nf-15-dias");
  });

  it("listas têm os valores do CRM legado", () => {
    expect(UFS).toHaveLength(27);
    expect(STATUS_CLIENTE_CRM.map((o) => o.value)).toContain("prospect");
    expect(STATUS_OPORTUNIDADE.map((o) => o.value)).toContain("proposta-enviada");
  });
});
