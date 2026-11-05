import { describe, expect, it } from "vitest";

import { identificacaoDaLinha, nomeAcessivelAcao } from "./rotuloImagemPrograma";

describe("nome acessível dos botões de imagem por linha", () => {
  it("identifica a linha pelo nome do docente; sem nome, pela posição", () => {
    expect(identificacaoDaLinha("Coordenação", " Ana Lima ", 0)).toBe("Coordenação Ana Lima");
    expect(identificacaoDaLinha("Especialista", "  ", 2)).toBe("Especialista, linha 3");
  });
  it("o nome do botão começa pelo texto visível e diz a linha", () => {
    expect(nomeAcessivelAcao("Enviar imagem", "Especialista, linha 3")).toBe("Enviar imagem — Especialista, linha 3");
  });
});
