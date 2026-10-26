import { describe, expect, it } from "vitest";

import { derivarDatasEvento } from "./derivarDatasEvento";

describe("derivarDatasEvento · um dia", () => {
  const d = derivarDatasEvento("2026-11-04T00:00:00.000Z");

  it("mantém os formatos de um dia só", () => {
    expect(d.metaValue).toBe("04 · Novembro");
    expect(d.metaSub).toBe("2026 · Quarta-feira");
    expect(d.sidebarValue).toBe("04 · Nov · 2026");
    expect(d.dataEvento).toBe("4 de novembro de 2026");
    expect(d.cardDia).toBe("04");
    expect(d.cardDiaFim).toBeUndefined();
    expect(d.icsEnd).toBe("20261104T180000");
  });

  it("data de fim igual à de início conta como um dia", () => {
    const igual = derivarDatasEvento("2026-11-04T00:00:00.000Z", "2026-11-04T18:00:00.000Z");
    expect(igual.cardDiaFim).toBeUndefined();
    expect(igual.metaValue).toBe("04 · Novembro");
  });
});

describe("derivarDatasEvento · mais de um dia", () => {
  it("dois dias no mesmo mês (PROGE M03, 12 e 13/11)", () => {
    const d = derivarDatasEvento("2026-11-12T00:00:00.000Z", "2026-11-13T00:00:00.000Z");
    expect(d.metaValue).toBe("12 e 13 · Novembro");
    expect(d.metaSub).toBe("2026 · Quinta-feira e Sexta-feira");
    expect(d.timelineDiaHtml).toBe("12 e 13 de <em>Novembro</em> · Quinta-feira e Sexta-feira");
    expect(d.sidebarValue).toBe("12–13 · Nov · 2026");
    expect(d.dataEvento).toBe("12 e 13 de novembro de 2026");
    expect(d.cardDia).toBe("12");
    expect(d.cardDiaFim).toBe("13");
    expect(d.cardMesAno).toBe("Nov · 2026");
    expect(d.icsStart).toBe("20261112T080000");
    expect(d.icsEnd).toBe("20261113T180000");
  });

  it("três dias usa 'a'", () => {
    const d = derivarDatasEvento("2026-06-18T09:00:00.000Z", "2026-06-20T18:00:00.000Z");
    expect(d.metaValue).toBe("18 a 20 · Junho");
    expect(d.dataEvento).toBe("18 a 20 de junho de 2026");
    expect(d.metaSub).toBe("2026 · Quinta-feira a Sábado");
  });

  it("virada de mês", () => {
    const d = derivarDatasEvento("2026-09-30T00:00:00.000Z", "2026-10-01T00:00:00.000Z");
    expect(d.metaValue).toBe("30 · Setembro – 01 · Outubro");
    expect(d.sidebarValue).toBe("30 · Set – 01 · Out · 2026");
    expect(d.dataEvento).toBe("30 de setembro a 1 de outubro de 2026");
    expect(d.cardMesAno).toBe("Set – Out · 2026");
  });

  it("inscrições continuam fechando às 8h do primeiro dia", () => {
    const d = derivarDatasEvento("2026-11-12T00:00:00.000Z", "2026-11-13T00:00:00.000Z");
    expect(d.deadlineISO).toBe("2026-11-12T08:00:00-03:00");
    expect(d.countdownDateText).toBe("Até 12 de Novembro de 2026, às 8h");
  });
});
