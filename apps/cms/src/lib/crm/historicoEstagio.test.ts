import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ehEstagioOportunidade, lerEstagioOuNulo, montarTransicaoEstagio } from "./historicoEstagio";

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

describe("ehEstagioOportunidade", () => {
  it("aceita um slug válido da lista de estágios", () => {
    expect(ehEstagioOportunidade("negociacao-tramitacao")).toBe(true);
  });

  it("rejeita uma string que não é um estágio conhecido", () => {
    expect(ehEstagioOportunidade("estagio-inventado")).toBe(false);
  });

  it("rejeita valores que não são string", () => {
    expect(ehEstagioOportunidade(null)).toBe(false);
    expect(ehEstagioOportunidade(undefined)).toBe(false);
    expect(ehEstagioOportunidade(42)).toBe(false);
  });
});

describe("lerEstagioOuNulo", () => {
  it("devolve o próprio valor quando é um estágio válido", () => {
    expect(lerEstagioOuNulo("qualificada")).toBe("qualificada");
  });

  it("devolve null para uma string fora da lista de estágios, em vez de propagá-la", () => {
    expect(lerEstagioOuNulo("estagio-que-nao-existe")).toBeNull();
  });

  it("devolve null quando o valor está ausente", () => {
    expect(lerEstagioOuNulo(undefined)).toBeNull();
    expect(lerEstagioOuNulo(null)).toBeNull();
  });

  it("um estágio corrompido no `previousDoc` não bloqueia nem contamina a transição", () => {
    // Simula o que o hook faz: lê doc/previousDoc pela guard antes de montar a
    // transição. Um valor fora da lista em `previousDoc.estagio` (dado
    // corrompido ou desatualizado) vira `null` — a transição para um estágio
    // novo válido sai registrada como se fosse a primeira atribuição, nunca
    // com a string inválida propagada para `estagioAnterior`.
    expect(
      montarTransicaoEstagio({
        oportunidadeId: 7,
        anterior: lerEstagioOuNulo("lixo-no-banco"),
        novo: lerEstagioOuNulo("mapeada"),
      }),
    ).toMatchObject({ estagioAnterior: null, estagioNovo: "mapeada" });
  });

  it("um estágio corrompido no `doc.estagio` (novo) é tratado como ausente — sem transição", () => {
    expect(
      montarTransicaoEstagio({
        oportunidadeId: 7,
        anterior: lerEstagioOuNulo("negociacao-tramitacao"),
        novo: lerEstagioOuNulo("lixo-no-banco"),
      }),
    ).toBeNull();
  });
});
