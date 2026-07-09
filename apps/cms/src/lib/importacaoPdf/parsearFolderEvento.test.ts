import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  chaveDeLinha,
  dataPtParaISO,
  ehLinhaMarcador,
  encontrarPagina,
  parsearFolderEvento,
} from "./parsearFolderEvento";

function fixture(slug: string): string[] {
  const bruto = readFileSync(join(__dirname, "__fixtures__", `${slug}.json`), "utf8");
  return (JSON.parse(bruto) as { paginas: string[] }).paginas;
}

const TODAS = ["edutec-m01", "edutec-m02", "edutec-m04", "proge-m01", "proge-m03"] as const;

describe("utilidades", () => {
  it("chaveDeLinha normaliza caps espaçadas com kerning irregular", () => {
    expect(chaveDeLinha("D A T A")).toBe("DATA");
    expect(chaveDeLinha("D AT A  D O  E V E N T O")).toBe("DATADOEVENTO");
    expect(chaveDeLinha("C A R G A H O R Á R I A")).toBe("CARGAHORARIA");
    expect(chaveDeLinha("P R O G R A M A Ç Ã O D E T A L H A D A")).toBe("PROGRAMACAODETALHADA");
  });

  it("ehLinhaMarcador exige ausência de minúsculas", () => {
    expect(ehLinhaMarcador("D A T A")).toBe(true);
    expect(ehLinhaMarcador("15 de Junho de 2026")).toBe(false);
    expect(ehLinhaMarcador("")).toBe(false);
  });

  it("dataPtParaISO converte datas por extenso", () => {
    expect(dataPtParaISO("15 de Junho de 2026")).toBe("2026-06-15");
    expect(dataPtParaISO("3 de março de 2027")).toBe("2027-03-03");
    expect(dataPtParaISO("sem data aqui")).toBeNull();
  });

  it("encontrarPagina localiza seção pelo topo da página", () => {
    const paginas = fixture("edutec-m01");
    expect(encontrarPagina(paginas, "PROGRAMACAODETALHADA")).toBe(6);
    expect(encontrarPagina(paginas, "SECAOINEXISTENTE")).toBe(-1);
  });
});

describe("capa (edutec-m01)", () => {
  const dados = parsearFolderEvento(fixture("edutec-m01"));

  it("extrai modalidade, nome, data e carga horária", () => {
    expect(dados.modalidade).toBe("online");
    expect(dados.nome).toBe("Cultura Digital, Educação Midiática e Transformação da Educação");
    expect(dados.dataInicioISO).toBe("2026-06-15");
    expect(dados.cargaHoraria).toBe("08 horas");
  });

  it("reconstrói eyebrow e resumo da linha mesclada", () => {
    expect(dados.eyebrow).toContain("EDUTEC");
    expect(dados.eyebrow).toContain("MÓDULO 01");
    expect(dados.resumo).toMatch(/^Fundamentos, repertórios/);
    expect(dados.resumo).toMatch(/\.$/);
  });
});

describe("seções de texto (edutec-m01)", () => {
  const dados = parsearFolderEvento(fixture("edutec-m01"));

  it("sobre: recola o drop-cap e agrupa parágrafos", () => {
    expect(dados.sobre.length).toBeGreaterThan(0);
    expect(dados.sobre[0]).toMatch(/^Este módulo aborda/);
  });

  it("objetivo e público sem os subtítulos do template", () => {
    expect(dados.objetivo.some((o) => o.includes("Compreender os fundamentos"))).toBe(true);
    expect(dados.objetivo.some((o) => /Por que este módulo/i.test(o))).toBe(false);
    expect(dados.publicoAlvo.length).toBeGreaterThan(3);
    expect(dados.publicoAlvo).toContain("Secretários e dirigentes de educação");
  });

  it("diferenciais como sentenças", () => {
    expect(dados.diferenciais.length).toBeGreaterThanOrEqual(5);
    for (const d of dados.diferenciais) expect(d.descricao.trim().length).toBeGreaterThan(10);
  });

  it("sessões de conteúdo com título e itens", () => {
    expect(dados.sessoesConteudo).toHaveLength(4);
    for (const s of dados.sessoesConteudo) {
      expect(s.titulo.length).toBeGreaterThan(0);
      expect(s.itens.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("programação, palestrantes, valor e replay (edutec-m01)", () => {
  const dados = parsearFolderEvento(fixture("edutec-m01"));

  it("programação com 4 sessões e horários", () => {
    expect(dados.programacao).toHaveLength(4);
    expect(dados.programacao[0].horario).toBe("08h00 – 10h00");
    expect(dados.programacao[0].titulo).toMatch(/Cultura digital e os novos paradigmas/);
    expect(dados.programacao[0].nomePalestrante).toBe("Roberta Aquino");
  });

  it("palestrantes com nome, titulação e minicurrículo", () => {
    // A ordem do texto extraído segue as colunas do PDF, não a ordem visual.
    expect(dados.palestrantes.map((p) => p.nome).sort()).toEqual(
      ["Roberta Aquino", "Mariana Ochs", "Karla Priscilla"].sort(),
    );
    expect(dados.palestrantes[0].linhaTitulacao).toContain("UNICAMP");
    expect(dados.palestrantes[0].minicurriculo.length).toBeGreaterThan(100);
  });

  it("valor, replay e plataforma", () => {
    expect(dados.valor).toBe("R$ 1.470");
    expect(dados.replayDisponivel).toBe(true);
    expect(dados.prazoReplay).toContain("7 dias");
    expect(dados.plataforma).toBe("EventON NTC");
  });
});

describe("todas as fixtures", () => {
  for (const slug of TODAS) {
    it(`${slug}: campos essenciais presentes`, () => {
      const dados = parsearFolderEvento(fixture(slug));
      expect(dados.modalidade).toBe("online");
      expect(dados.nome).toBeTruthy();
      expect(dados.dataInicioISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dados.cargaHoraria).toBeTruthy();
      expect(dados.resumo).toBeTruthy();
      expect(dados.palestrantes.length).toBeGreaterThan(0);
      expect(dados.programacao.length).toBeGreaterThan(0);
      expect(dados.sessoesConteudo.length).toBeGreaterThan(0);
      expect(dados.diferenciais.length).toBeGreaterThan(0);
      expect(dados.valor).toMatch(/^R\$ /);
    });
  }

  it("páginas vazias produzem dados nulos sem lançar", () => {
    const dados = parsearFolderEvento(["", "", ""]);
    expect(dados.nome).toBeNull();
    expect(dados.modalidade).toBeNull();
    expect(dados.palestrantes).toHaveLength(0);
    expect(dados.programacao).toHaveLength(0);
  });

  it("entrada sem páginas produz dados nulos sem lançar", () => {
    const dados = parsearFolderEvento([]);
    expect(dados.nome).toBeNull();
    expect(dados.valor).toBeNull();
  });
});
