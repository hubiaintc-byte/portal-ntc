import { describe, expect, it } from "vitest";

import { eventoAtivo, montarExtrasEventos, type EventoDoPrograma } from "./modulosAbertos";

const contexto = { vertical: "educacao" as const, imagemVertente: "/img/fotos/_optimized/area-educacao.1920.webp" };

function evento(sobre: Partial<EventoDoPrograma> = {}): EventoDoPrograma {
  return {
    slug: "ev",
    titulo: "Evento",
    dataInicio: "2026-06-19",
    dataFim: "2026-06-20",
    modalidade: "Online ao vivo",
    capaUrl: null,
    moduloNumero: null,
    ...sobre,
  };
}

describe("eventoAtivo", () => {
  it("evento que termina hoje fica ativo às 22h de Brasília", () => {
    // 22h UTC-3 de 19/06 = 01h UTC de 20/06
    const agora = new Date("2026-06-20T01:00:00Z");
    expect(eventoAtivo(evento({ dataInicio: "2026-06-19", dataFim: "2026-06-19" }), agora)).toBe(true);
  });
  it("evento de ontem é inativo", () => {
    const agora = new Date("2026-06-20T15:00:00Z");
    expect(eventoAtivo(evento({ dataInicio: "2026-06-19", dataFim: "2026-06-19" }), agora)).toBe(false);
  });
  it("sem dataFim e começando amanhã é ativo", () => {
    const agora = new Date("2026-06-19T15:00:00Z");
    expect(eventoAtivo(evento({ dataInicio: "2026-06-20", dataFim: null }), agora)).toBe(true);
  });
});

describe("montarExtrasEventos", () => {
  const agora = new Date("2026-06-01T15:00:00Z");

  it("sem eventos: sem feature, miniStack vazio e status vazio", () => {
    const r = montarExtrasEventos([], agora, contexto);
    expect(r.modulosAbertos.feature).toBeUndefined();
    expect(r.modulosAbertos.miniStack).toEqual([]);
    expect(r.status.size).toBe(0);
  });

  it("só inativos: sem feature", () => {
    const r = montarExtrasEventos([evento({ dataInicio: "2026-05-01", dataFim: "2026-05-02" })], agora, contexto);
    expect(r.modulosAbertos.feature).toBeUndefined();
  });

  it("5 ativos: destaque é o mais cedo e miniStack tem 3", () => {
    const evs = [5, 3, 1, 4, 2].map((d) => evento({ slug: `e${d}`, titulo: `E${d}`, dataInicio: `2026-07-0${d}`, dataFim: null }));
    const r = montarExtrasEventos(evs, agora, contexto);
    expect(r.modulosAbertos.feature?.titulo).toBe("E1");
    expect(r.modulosAbertos.feature?.ctaHref).toBe("/agenda/e1");
    expect(r.modulosAbertos.miniStack?.map((m) => m.titulo)).toEqual(["E2", "E3", "E4"]);
  });

  it("dataLabel: intervalo no mesmo mês e dia único", () => {
    const r = montarExtrasEventos(
      [evento({ dataInicio: "2026-06-19", dataFim: "2026-06-20" }), evento({ slug: "b", dataInicio: "2026-07-06", dataFim: null })],
      agora,
      contexto,
    );
    expect(r.modulosAbertos.feature?.dataLabel).toEqual({ dias: "19–20", mesAno: "Jun · 2026" });
    expect(r.modulosAbertos.miniStack?.[0]?.dataLabel).toEqual({ dias: "06", mesAno: "Jul · 2026" });
  });

  it("imagem: capa do evento ou imagem da vertente", () => {
    const r = montarExtrasEventos(
      [evento({ capaUrl: "/capa.webp" }), evento({ slug: "b", dataInicio: "2026-07-01", dataFim: null })],
      agora,
      contexto,
    );
    expect(r.modulosAbertos.feature?.bgImg).toBe("/capa.webp");
    expect(r.modulosAbertos.miniStack?.[0]?.bgImg).toBe(contexto.imagemVertente);
  });

  it("status: selo aberto só para módulos com evento ativo", () => {
    const r = montarExtrasEventos(
      [
        evento({ moduloNumero: 1 }),
        evento({ slug: "velho", moduloNumero: 2, dataInicio: "2026-01-01", dataFim: null }),
      ],
      agora,
      contexto,
    );
    expect(r.status.get(1)).toEqual({ rotulo: "Inscrições abertas", tipo: "aberto" });
    expect(r.status.has(2)).toBe(false);
  });

  it("escapa HTML vindo do evento nos campos de HTML", () => {
    const r = montarExtrasEventos(
      [evento({ modalidade: "<img src=x onerror=1>", moduloNumero: 3 })],
      agora,
      contexto,
    );
    const f = r.modulosAbertos.feature!;
    expect(f.metas.join("")).not.toContain("<img");
    expect(f.binding).not.toContain("<img");
    expect(f.binding).toContain("III");
  });
});
