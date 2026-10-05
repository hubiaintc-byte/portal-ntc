import { describe, expect, it } from "vitest";

import { aplicarAcaoMarkdown } from "./markdown-acoes";

/** Atalho: aplica a ação sobre um texto marcando a seleção com `|`. */
function aplicar(marcado: string, acao: Parameters<typeof aplicarAcaoMarkdown>[1]) {
  const inicio = marcado.indexOf("|");
  const fim = marcado.lastIndexOf("|") - 1;
  const texto = marcado.replace(/\|/g, "");
  const saida = aplicarAcaoMarkdown({ texto, inicio, fim }, acao);
  return {
    ...saida,
    marcado:
      saida.inicio === saida.fim
        ? saida.texto.slice(0, saida.inicio) + "|" + saida.texto.slice(saida.inicio)
        : saida.texto.slice(0, saida.inicio) +
          "|" +
          saida.texto.slice(saida.inicio, saida.fim) +
          "|" +
          saida.texto.slice(saida.fim),
  };
}

describe("aplicarAcaoMarkdown — inline", () => {
  it("envolve a seleção em negrito e mantém o texto selecionado", () => {
    const r = aplicar("O |Instituto| cresceu.", "negrito");
    expect(r.texto).toBe("O **Instituto** cresceu.");
    expect(r.marcado).toBe("O **|Instituto|** cresceu.");
  });

  it("tira o negrito quando a seleção já está envolvida", () => {
    const r = aplicar("O **|Instituto|** cresceu.", "negrito");
    expect(r.texto).toBe("O Instituto cresceu.");
    expect(r.marcado).toBe("O |Instituto| cresceu.");
  });

  it("sem seleção, insere os marcadores com o cursor no meio", () => {
    const r = aplicar("Escreva ||aqui.", "negrito");
    expect(r.texto).toBe("Escreva ****aqui.");
    expect(r.marcado).toBe("Escreva **|**aqui.");
  });

  it("itálico não confunde o asterisco de um negrito vizinho", () => {
    const r = aplicar("O **|Instituto|** cresceu.", "italico");
    expect(r.texto).toBe("O ***Instituto*** cresceu.");
  });

  it("tira o itálico quando a seleção já está em itálico", () => {
    const r = aplicar("O *|Instituto|* cresceu.", "italico");
    expect(r.texto).toBe("O Instituto cresceu.");
  });

  it("aceita seleção que começa no meio de uma palavra", () => {
    const r = aplicar("Insti|tuto| NTC", "negrito");
    expect(r.texto).toBe("Insti**tuto** NTC");
  });
});

describe("aplicarAcaoMarkdown — bloco", () => {
  it("transforma a linha do cursor em H2", () => {
    const r = aplicar("Uma se|ção", "h2");
    expect(r.texto).toBe("## Uma seção");
  });

  it("tira o H2 quando a linha já é H2", () => {
    const r = aplicar("## Uma se|ção", "h2");
    expect(r.texto).toBe("Uma seção");
  });

  it("troca H2 por citação em vez de empilhar os marcadores", () => {
    const r = aplicar("## Uma se|ção", "citacao");
    expect(r.texto).toBe("> Uma seção");
  });

  it("aplica a lista a todas as linhas que a seleção toca", () => {
    const r = aplicar("pri|meiro\nsegundo\nterc|eiro", "lista");
    expect(r.texto).toBe("- primeiro\n- segundo\n- terceiro");
  });

  it("tira a lista só quando todas as linhas tocadas já são item", () => {
    const r = aplicar("- pri|meiro\n- seg|undo", "lista");
    expect(r.texto).toBe("primeiro\nsegundo");
  });

  it("numera em sequência as linhas tocadas", () => {
    const r = aplicar("pri|meiro\nsegundo\nterc|eiro", "numerada");
    expect(r.texto).toBe("1. primeiro\n2. segundo\n3. terceiro");
  });

  it("tira a numeração qualquer que seja o número de partida", () => {
    const r = aplicar("5. pri|meiro\n6. seg|undo", "numerada");
    expect(r.texto).toBe("primeiro\nsegundo");
  });

  it("ignora linha em branco ao aplicar bloco a várias linhas", () => {
    const r = aplicar("pri|meiro\n\nterc|eiro", "lista");
    expect(r.texto).toBe("- primeiro\n\n- terceiro");
  });

  it("não mexe nas linhas fora da seleção", () => {
    const r = aplicar("antes\npri|mei|ro\ndepois", "h3");
    expect(r.texto).toBe("antes\n### primeiro\ndepois");
  });
});

describe("aplicarAcaoMarkdown — link", () => {
  it("envolve a seleção e deixa o cursor depois de https://", () => {
    const r = aplicar("O |Instituto| publicou.", "link");
    expect(r.texto).toBe("O [Instituto](https://) publicou.");
    expect(r.marcado).toBe("O [Instituto](https://|) publicou.");
  });

  it("sem seleção, insere o esqueleto com o cursor na URL", () => {
    const r = aplicar("Veja ||isto.", "link");
    expect(r.texto).toBe("Veja [](https://)isto.");
    expect(r.marcado).toBe("Veja [](https://|)isto.");
  });
});
