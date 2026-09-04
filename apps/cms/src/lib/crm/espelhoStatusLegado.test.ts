import { describe, expect, it } from "vitest";

import { calcularStatusLegadoEspelhado } from "./espelhoStatusLegado";

describe("calcularStatusLegadoEspelhado", () => {
  it("atualização parcial que envia só situação respeita o estágio já persistido", () => {
    // Bug original: sem originalDoc, o código caía no default "mapeada" e
    // devolvia "em-qualificacao" em vez de refletir a negociação em curso.
    expect(
      calcularStatusLegadoEspelhado(
        { situacao: "ativa" },
        { estagio: "negociacao-tramitacao", situacao: "ativa" },
      ),
    ).toBe("em-negociacao");
  });

  it("atualização parcial que envia só estágio respeita a situação já persistida", () => {
    // Bug original: sem originalDoc, o default "ativa" mascarava a situação
    // real "adiada-nurturing" e devolvia "em-qualificacao" em vez de "cancelada".
    expect(
      calcularStatusLegadoEspelhado({ estagio: "qualificada" }, { situacao: "adiada-nurturing" }),
    ).toBe("cancelada");
  });

  it("criação com os dois campos ignora o originalDoc (que ainda não existe)", () => {
    expect(
      calcularStatusLegadoEspelhado({ estagio: "mapeada", situacao: "ativa" }, undefined),
    ).toBe("em-qualificacao");
  });

  it("escrita que não toca estágio nem situação, em nenhuma das fontes, devolve null", () => {
    expect(calcularStatusLegadoEspelhado({}, {})).toBeNull();
  });

  it("situação encerrando o funil (perdida) prevalece mesmo com estágio avançado no originalDoc", () => {
    expect(
      calcularStatusLegadoEspelhado(
        { situacao: "perdida" },
        { estagio: "negociacao-tramitacao", situacao: "ativa" },
      ),
    ).toBe("perdida");
  });

  it("o valor do data tem prioridade sobre o originalDoc quando os dois vêm preenchidos", () => {
    expect(
      calcularStatusLegadoEspelhado(
        { estagio: "ganha", situacao: "ativa" },
        { estagio: "mapeada", situacao: "ativa" },
      ),
    ).toBe("contratada");
  });
});
