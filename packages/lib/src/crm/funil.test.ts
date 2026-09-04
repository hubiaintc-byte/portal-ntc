import { describe, expect, it } from "vitest";

import {
  ESTAGIO_OPORTUNIDADE,
  SITUACAO_OPORTUNIDADE,
  estagioLegado,
  planejarMigracaoOportunidade,
} from "./funil";

describe("listas do funil P0", () => {
  it("tem os 11 estágios na ordem do manual §11", () => {
    expect(ESTAGIO_OPORTUNIDADE.map((o) => o.value)).toEqual([
      "mapeada",
      "prospeccao-relacionamento",
      "demanda-identificada",
      "qualificada",
      "diagnostico-realizado",
      "solucao-em-construcao",
      "proposta-em-elaboracao",
      "proposta-enviada",
      "negociacao-tramitacao",
      "contratacao-em-formalizacao",
      "ganha",
    ]);
  });

  it("tem as 3 situações", () => {
    expect(SITUACAO_OPORTUNIDADE.map((o) => o.value)).toEqual([
      "ativa",
      "perdida",
      "adiada-nurturing",
    ]);
  });
});

describe("estagioLegado — espelho do campo status", () => {
  it("situação encerra o funil independentemente do estágio", () => {
    expect(estagioLegado("negociacao-tramitacao", "perdida")).toBe("perdida");
    expect(estagioLegado("qualificada", "adiada-nurturing")).toBe("cancelada");
  });

  it("mapeia os estágios com equivalente legado", () => {
    expect(estagioLegado("ganha", "ativa")).toBe("contratada");
    expect(estagioLegado("contratacao-em-formalizacao", "ativa")).toBe("aprovada");
    expect(estagioLegado("negociacao-tramitacao", "ativa")).toBe("em-negociacao");
    expect(estagioLegado("proposta-enviada", "ativa")).toBe("proposta-enviada");
    expect(estagioLegado("prospeccao-relacionamento", "ativa")).toBe("apresentacao-institucional");
  });

  it("cai em em-qualificacao para os estágios sem equivalente legado", () => {
    for (const estagio of [
      "mapeada",
      "demanda-identificada",
      "qualificada",
      "diagnostico-realizado",
      "solucao-em-construcao",
      "proposta-em-elaboracao",
    ]) {
      expect(estagioLegado(estagio, "ativa")).toBe("em-qualificacao");
    }
  });
});

describe("planejarMigracaoOportunidade — docs/17 §1.5", () => {
  it("converte os status inequívocos sem marcar revisão", () => {
    expect(planejarMigracaoOportunidade("apresentacao-institucional")).toEqual({
      estagio: "prospeccao-relacionamento",
      situacao: "ativa",
      revisao: false,
      flag: "",
    });
    expect(planejarMigracaoOportunidade("proposta-enviada")).toMatchObject({
      estagio: "proposta-enviada",
      revisao: false,
    });
    expect(planejarMigracaoOportunidade("em-negociacao")).toMatchObject({
      estagio: "negociacao-tramitacao",
      revisao: false,
    });
  });

  it("marca revisão nos status ambíguos, com flag explicando o porquê", () => {
    for (const status of ["em-qualificacao", "aprovada", "contratada", "perdida", "cancelada"]) {
      const plano = planejarMigracaoOportunidade(status);
      expect(plano.revisao).toBe(true);
      expect(plano.flag).toContain("[VALIDAR COM A DIREÇÃO]");
    }
  });

  it("Perdida e Cancelada viram situação Perdida com Mapeada como fallback técnico", () => {
    expect(planejarMigracaoOportunidade("perdida")).toMatchObject({
      estagio: "mapeada",
      situacao: "perdida",
      revisao: true,
    });
    expect(planejarMigracaoOportunidade("cancelada")).toMatchObject({
      estagio: "mapeada",
      situacao: "perdida",
      revisao: true,
    });
  });

  it("status desconhecido ou ausente não trava a migração — vai para revisão", () => {
    expect(planejarMigracaoOportunidade(null)).toMatchObject({ revisao: true });
    expect(planejarMigracaoOportunidade("valor-que-nao-existe")).toMatchObject({ revisao: true });
  });

  it("estagioLegado desfaz planejarMigracaoOportunidade nos casos sem ambiguidade", () => {
    for (const status of ["apresentacao-institucional", "proposta-enviada", "em-negociacao"]) {
      const plano = planejarMigracaoOportunidade(status);
      expect(estagioLegado(plano.estagio, plano.situacao)).toBe(status);
    }
  });
});
