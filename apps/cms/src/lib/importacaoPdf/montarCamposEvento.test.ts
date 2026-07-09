import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { derivarPrazoReplay, montarCamposEvento } from "./montarCamposEvento";
import { parsearFolderEvento, type DadosFolderEvento } from "./parsearFolderEvento";

function dadosDaFixture(slug: string): DadosFolderEvento {
  const bruto = readFileSync(join(__dirname, "__fixtures__", `${slug}.json`), "utf8");
  return parsearFolderEvento((JSON.parse(bruto) as { paginas: string[] }).paginas);
}

const DADOS_VAZIOS: DadosFolderEvento = {
  nome: null,
  eyebrow: null,
  modalidade: null,
  resumo: null,
  dataInicioISO: null,
  cargaHoraria: null,
  sobre: [],
  publicoAlvo: [],
  objetivo: [],
  diferenciais: [],
  palestrantes: [],
  programacao: [],
  sessoesConteudo: [],
  valor: null,
  replayDisponivel: false,
  prazoReplay: null,
  plataforma: null,
};

interface DocLexical {
  root: { children: unknown[] };
}

describe("montarCamposEvento (edutec-m01)", () => {
  const { data, preenchidos, vazios } = montarCamposEvento(dadosDaFixture("edutec-m01"));

  it("mapeia campos simples", () => {
    expect(data.modalidade).toBe("online");
    expect(data.dataInicio).toBe("2026-06-15");
    expect(data.valor).toBe("R$ 1.470");
    expect(data.replayDisponivel).toBe(true);
    // "Por até 7 dias após o evento" ⇒ data-limite = início + 7 dias (campo date).
    expect(data.prazoReplay).toBe("2026-06-22");
    expect((data.local as { nomeLocal: string }).nomeLocal).toBe("EventON NTC");
    expect((data.resumo as string).length).toBeLessThanOrEqual(280);
  });

  it("gera richTexts com conteúdo", () => {
    for (const chave of ["publicoAlvo", "objetivos", "conteudoProgramatico"] as const) {
      const doc = data[chave] as DocLexical;
      expect(doc.root.children.length).toBeGreaterThan(0);
    }
  });

  it("programação carrega o palestrante na descrição", () => {
    const programacao = data.programacaoDetalhada as { horario: string; descricao: string }[];
    expect(programacao).toHaveLength(4);
    expect(programacao[0]?.descricao).toMatch(/^com Roberta Aquino/);
  });

  it("relatório separa preenchidos de vazios", () => {
    expect(preenchidos).toContain("Modalidade");
    expect(preenchidos).toContain("Programação detalhada");
    expect(vazios).toContain("FAQ");
    expect(vazios).toContain("Capa do evento");
  });
});

describe("derivarPrazoReplay", () => {
  it("soma N dias à data de início", () => {
    expect(derivarPrazoReplay("Por até 7 dias Após a realização do evento", "2026-06-15")).toBe(
      "2026-06-22",
    );
  });

  it("sem número de dias ou sem data ⇒ null", () => {
    expect(derivarPrazoReplay("replay disponível", "2026-06-15")).toBeNull();
    expect(derivarPrazoReplay("Por até 7 dias", null)).toBeNull();
    expect(derivarPrazoReplay(null, "2026-06-15")).toBeNull();
  });
});

describe("montarCamposEvento com dados nulos", () => {
  const { data, preenchidos, vazios } = montarCamposEvento(DADOS_VAZIOS);

  it("omite todas as chaves sem valor", () => {
    expect(Object.keys(data)).toHaveLength(0);
    expect(preenchidos).toHaveLength(0);
    expect(vazios).toContain("Nome");
    expect(vazios).toContain("Modalidade");
    expect(vazios).toContain("Programação detalhada");
  });
});
