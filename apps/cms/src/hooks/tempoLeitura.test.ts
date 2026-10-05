import { describe, expect, it } from "vitest";

import { derivarTempoLeitura } from "./tempoLeitura";

function docComTexto(texto: string): unknown {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: texto, format: 0 }],
        },
      ],
    },
  };
}

describe("derivarTempoLeitura", () => {
  it("grava o tempo calculado a partir do corpo", async () => {
    const data = { corpo: docComTexto("palavra ".repeat(600)) };
    const saida = await derivarTempoLeitura({ data } as never);
    expect(saida.tempoLeituraMin).toBe(3);
  });

  it("devolve 1 quando o corpo está vazio", async () => {
    const saida = await derivarTempoLeitura({ data: { corpo: null } } as never);
    expect(saida.tempoLeituraMin).toBe(1);
  });

  it("não descarta os demais campos do data", async () => {
    const data = { titulo: "Um título", corpo: docComTexto("curto") };
    const saida = await derivarTempoLeitura({ data } as never);
    expect(saida.titulo).toBe("Um título");
  });
});
