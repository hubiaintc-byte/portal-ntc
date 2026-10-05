import { describe, expect, it } from "vitest";

import {
  faltasParaPublicar,
  faltasParaRascunho,
  filtrarModulos,
  filtrarProgramas,
  lerNumeroModulo,
  podeExcluirModulo,
  podeExcluirPrograma,
  quantidadeModulosVaiPublicado,
  rotuloSituacaoPrograma,
  semItensVazios,
  semResultadosVazios,
  situacaoPrograma,
  type ProgramaParaPublicar,
} from "./catalogo";

describe("situacaoPrograma", () => {
  it("nunca publicado é rascunho, qualquer que seja a última versão", () => {
    expect(situacaoPrograma("draft", "draft")).toBe("rascunho");
    expect(situacaoPrograma(undefined, undefined)).toBe("rascunho");
  });
  it("publicado com última versão rascunho tem alterações pendentes", () => {
    expect(situacaoPrograma("published", "draft")).toBe("alteracoes-pendentes");
  });
  it("publicado com última versão publicada é publicado", () => {
    expect(situacaoPrograma("published", "published")).toBe("publicado");
  });
  it("rótulos legíveis", () => {
    expect(rotuloSituacaoPrograma("alteracoes-pendentes")).toBe("Alterações não publicadas");
  });
});

describe("filtrarProgramas", () => {
  const lista = [
    { sigla: "EDUTEC", nome: "Educação Conectada", areaId: "1", situacao: "publicado" as const },
    { sigla: "PROSUS+", nome: "Saúde Pública", areaId: "3", situacao: "rascunho" as const },
  ];
  it("busca sem acento e sem caixa em sigla e nome", () => {
    expect(filtrarProgramas(lista, { busca: "educacao", areaId: "", situacao: "" })).toHaveLength(1);
    expect(filtrarProgramas(lista, { busca: "prosus", areaId: "", situacao: "" })[0]!.sigla).toBe("PROSUS+");
  });
  it("filtra por área e situação", () => {
    expect(filtrarProgramas(lista, { busca: "", areaId: "3", situacao: "" })).toHaveLength(1);
    expect(filtrarProgramas(lista, { busca: "", areaId: "", situacao: "publicado" })[0]!.sigla).toBe("EDUTEC");
  });
  it("filtros vazios devolvem tudo", () => {
    expect(filtrarProgramas(lista, { busca: "  ", areaId: "", situacao: "" })).toHaveLength(2);
  });
});

describe("filtrarModulos", () => {
  const lista = [
    { titulo: "Gestão escolar", tituloComercial: "Seminário de Gestão", programaId: "1" },
    { titulo: "Avaliação", tituloComercial: null, programaId: "2" },
  ];
  it("busca no título e no título comercial", () => {
    expect(filtrarModulos(lista, { busca: "seminario", programaId: "" })).toHaveLength(1);
    expect(filtrarModulos(lista, { busca: "AVALIA", programaId: "" })).toHaveLength(1);
  });
  it("filtra por programa", () => {
    expect(filtrarModulos(lista, { busca: "", programaId: "2" })[0]!.titulo).toBe("Avaliação");
  });
});

describe("faltas", () => {
  const completo: ProgramaParaPublicar = {
    sigla: "X",
    nomeCompleto: "Programa X",
    areaId: "1",
    cargaHorariaTotal: "64 horas",
    visaoGeral: "Texto.",
    eixos: [{ titulo: "E1", descricao: "D1" }],
    diferenciais: [{ titulo: "Dif", descricao: "" }],
    resultados: ["R1"],
  };
  it("rascunho exige sigla e nome", () => {
    expect(faltasParaRascunho({ sigla: " ", nomeCompleto: "" })).toEqual(["Sigla", "Nome completo"]);
    expect(faltasParaRascunho({ sigla: "X", nomeCompleto: "Y" })).toEqual([]);
  });
  it("publicação completa não tem faltas (descrição do diferencial é opcional)", () => {
    expect(faltasParaPublicar(completo)).toEqual([]);
  });
  it("publicação lista campos e itens incompletos", () => {
    expect(
      faltasParaPublicar({
        ...completo,
        areaId: "",
        cargaHorariaTotal: "",
        visaoGeral: "  ",
        eixos: [{ titulo: "E1", descricao: "" }],
        diferenciais: [{ titulo: "", descricao: "algo" }],
        resultados: [""],
      }),
    ).toEqual([
      "Área",
      "Carga horária total",
      "Visão geral",
      "Eixo 1: descrição",
      "Diferencial 1: título",
      "Resultado 1: texto",
    ]);
  });
});

describe("limpeza de listas", () => {
  it("descarta só itens totalmente vazios", () => {
    expect(
      semItensVazios([
        { titulo: " ", descricao: "" },
        { titulo: "A", descricao: "" },
      ]),
    ).toEqual([{ titulo: "A", descricao: "" }]);
    expect(semResultadosVazios(["", " x "])).toEqual([" x "]);
  });
});

describe("lerNumeroModulo", () => {
  it("aceita inteiro ≥ 1", () => {
    expect(lerNumeroModulo(" 3 ")).toBe(3);
  });
  it("recusa zero, negativo, decimal e texto", () => {
    for (const v of ["0", "-1", "2.5", "2,5", "", "três"]) expect(lerNumeroModulo(v)).toBeNull();
  });
});

describe("exclusão", () => {
  it("programa sem dependentes pode", () => {
    expect(podeExcluirPrograma({ modulos: 0, propostas: 0, leads: 0, eventos: 0, especialistas: 0 })).toEqual({ ok: true });
  });
  it("programa lista só os dependentes que existem, com plural certo", () => {
    expect(podeExcluirPrograma({ modulos: 3, propostas: 1, leads: 0, eventos: 0, especialistas: 0 })).toEqual({
      ok: false,
      motivo: "Vinculado a 3 módulos e 1 proposta — exclua ou desvincule antes.",
    });
    expect(podeExcluirPrograma({ modulos: 0, propostas: 0, leads: 2, eventos: 1, especialistas: 1 })).toEqual({
      ok: false,
      motivo: "Vinculado a 2 leads, 1 evento do site e 1 especialista — exclua ou desvincule antes.",
    });
  });
  it("módulo usado em proposta ou evento comercial não pode", () => {
    expect(podeExcluirModulo({ propostas: 0, eventosComerciais: 0 })).toEqual({ ok: true });
    expect(podeExcluirModulo({ propostas: 2, eventosComerciais: 1 })).toEqual({
      ok: false,
      motivo: "Usado em 2 propostas e 1 evento comercial — não pode ser excluído.",
    });
  });
});

describe("quantidadeModulosVaiPublicado", () => {
  it("só grava publicado quando o programa está publicado sem pendência", () => {
    expect(quantidadeModulosVaiPublicado("publicado")).toBe(true);
    expect(quantidadeModulosVaiPublicado("rascunho")).toBe(false);
    expect(quantidadeModulosVaiPublicado("alteracoes-pendentes")).toBe(false);
  });
});
