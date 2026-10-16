import { describe, expect, it } from "vitest";

import { ehSlugProvisorio, slugParaSalvar, slugProvisorio } from "./slugEvento";

describe("slugParaSalvar", () => {
  it("provisório + digitado igual ao atual: gera a partir do nome", () => {
    const atual = slugProvisorio(new Date(1000));
    expect(
      slugParaSalvar({ slugDigitado: atual, slugAtual: atual, nome: "Seminário de Gestão Escolar" }),
    ).toBe("seminario-de-gestao-escolar");
  });

  it("provisório + nome ainda 'Novo evento': mantém o provisório", () => {
    const atual = slugProvisorio(new Date(1000));
    expect(slugParaSalvar({ slugDigitado: atual, slugAtual: atual, nome: "Novo evento" })).toBe(atual);
  });

  it("slug definitivo + digitado igual + nome mudou: mantém o definitivo", () => {
    expect(
      slugParaSalvar({ slugDigitado: "seminario-x", slugAtual: "seminario-x", nome: "Outro nome" }),
    ).toBe("seminario-x");
  });

  it("digitado diferente do atual: normaliza o digitado", () => {
    expect(
      slugParaSalvar({ slugDigitado: "Meu Evento SP", slugAtual: "seminario-x", nome: "Qualquer" }),
    ).toBe("meu-evento-sp");
  });

  it("digitado vazio segue a regra de 'igual ao atual'", () => {
    expect(slugParaSalvar({ slugDigitado: "  ", slugAtual: "seminario-x", nome: "Outro" })).toBe("seminario-x");
    const prov = slugProvisorio(new Date(5));
    expect(slugParaSalvar({ slugDigitado: "", slugAtual: prov, nome: "Jornada Nova" })).toBe("jornada-nova");
  });
});

describe("slugProvisorio", () => {
  it("datas diferentes dão valores diferentes, ambos provisórios", () => {
    const a = slugProvisorio(new Date(1_000_000));
    const b = slugProvisorio(new Date(2_000_000));
    expect(a).not.toBe(b);
    expect(ehSlugProvisorio(a)).toBe(true);
    expect(ehSlugProvisorio(b)).toBe(true);
    expect(ehSlugProvisorio("seminario-x")).toBe(false);
  });
});
