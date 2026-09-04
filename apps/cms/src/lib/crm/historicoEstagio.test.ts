import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { montarTransicaoEstagio } from "./historicoEstagio";

describe("montarTransicaoEstagio", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("monta a transição quando o estágio muda", () => {
    expect(
      montarTransicaoEstagio({
        oportunidadeId: "7",
        anterior: "mapeada",
        novo: "demanda-identificada",
        usuarioId: 3,
      }),
    ).toEqual({
      oportunidade: 7,
      estagioAnterior: "mapeada",
      estagioNovo: "demanda-identificada",
      dataHora: "2026-09-04T12:00:00.000Z",
      usuario: 3,
      atorSistema: null,
      motivo: null,
    });
  });

  it("devolve null quando o estágio não mudou", () => {
    expect(
      montarTransicaoEstagio({ oportunidadeId: 7, anterior: "qualificada", novo: "qualificada" }),
    ).toBeNull();
  });

  it("devolve null quando não há estágio novo", () => {
    expect(montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: null })).toBeNull();
  });

  it("registra a primeira atribuição de estágio com anterior nulo", () => {
    expect(
      montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: "mapeada" }),
    ).toMatchObject({ estagioAnterior: null, estagioNovo: "mapeada" });
  });

  // Divergência M6 (docs/17 §4.0): no protótipo a migração grava usuario:'migracao',
  // que não resolve para nenhum usuário e deixa a coluna vazia na tela.
  it("toda transição tem autor legível — usuário ou ator de sistema", () => {
    const daMigracao = montarTransicaoEstagio({
      oportunidadeId: 7,
      anterior: null,
      novo: "mapeada",
      atorSistema: "migração automática",
      motivo: "Migração P0 do status legado \"perdida\"",
    });
    expect(daMigracao).toMatchObject({
      usuario: null,
      atorSistema: "migração automática",
      motivo: 'Migração P0 do status legado "perdida"',
    });

    const semAutor = montarTransicaoEstagio({ oportunidadeId: 7, anterior: null, novo: "mapeada" });
    expect(semAutor?.atorSistema).toBe("sistema");
  });
});
