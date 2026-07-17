import { describe, expect, it } from "vitest";

import { planejarImportacao, type ExistentesNoBanco, type ExportCrmLegado } from "./importadorCrm";

const dados: ExportCrmLegado = {
  versao: "3.0",
  tabelas: {
    clientes: [
      { id: "CLI-001", orgao: "SEDUC Tocantins", sigla: "SEDUC-TO", uf: "TO", esfera: "Estadual",
        area: "Educação", status: "Em negociação", potencial: 250000, responsavel: "USR-003" },
    ],
    contatos: [
      { id: "CON-001", nome: "Maria Silva", cliente: "CLI-001", cargo: "Superintendente",
        email: "maria@seduc.to.gov.br", principal: true, decisor: true },
    ],
    programas: [{ id: "PRG-001", sigla: "EDUTEC", nome: "Educação Digital" }],
    modulos: [
      { id: "MOD-001", programa: "PRG-001", numero: 1, titulo: "Cultura Digital",
        titulo_comercial: "Módulo 01 · Cultura Digital", valor: 39000 },
    ],
    produtos: [{ id: "PRD-001", codigo: "EVT-01", nome: "Seminário EDUTEC", valor: 490 }],
    oportunidades: [
      { id: "OPO-001", codigo: "OPO-2026-001", cliente: "CLI-001", programa: "PRG-001",
        modulos: ["MOD-001"], produtos: ["PRD-001"], uf: "TO", origem: "Indicação",
        qtd: 120, valor: 120000, prob: 60, status: "Em negociação",
        data_abertura: "2026-06-01", followup: "2026-07-20", responsavel: "USR-003" },
    ],
    usuarios: [{ id: "USR-003", nome: "Comercial NTC", email: "comercial1@institutontc.com.br" }],
  },
};

const existentes: ExistentesNoBanco = {
  programasPorSigla: new Map([["edutec", "10"]]),
  modulosPorChave: new Map([["10#1", { id: "20", comercialVazio: true }]]),
  eventosPorNome: new Map([["seminario-edutec", { id: "30", comercialVazio: true }]]),
  clientesPorChave: new Map(),
  contatosPorChave: new Set(),
  oportunidadesPorCodigo: new Set(),
  usuariosPorEmail: new Map([["comercial1@institutontc.com.br", "2"]]),
};

describe("planejarImportacao", () => {
  it("cria cliente/contato/oportunidade resolvendo catálogo, status e responsável", () => {
    const plano = planejarImportacao(dados, existentes);
    expect(plano.criarClientes).toHaveLength(1);
    expect(plano.criarClientes[0]?.data.status).toBe("em-negociacao");
    expect(plano.criarClientes[0]?.data.responsavel).toBe("2");
    expect(plano.criarContatos).toHaveLength(1);
    expect(plano.criarOportunidades).toHaveLength(1);
    expect(plano.criarOportunidades[0]?.data.programa).toBe("10");
    expect(plano.criarOportunidades[0]?.data.modulos).toEqual(["20"]);
    expect(plano.criarOportunidades[0]?.data.eventos).toEqual(["30"]);
    expect(plano.atualizarModulos).toEqual([
      { id: "20", comercial: { tituloComercial: "Módulo 01 · Cultura Digital", valor: 39000, replay: null, certificacao: null } },
    ]);
    expect(plano.atualizarEventos).toEqual([{ id: "30", comercial: { codigo: "EVT-01", valor: 490 } }]);
  });

  it("é idempotente: nada a criar quando as chaves já existem", () => {
    const jaImportado: ExistentesNoBanco = {
      ...existentes,
      clientesPorChave: new Map([["seduc-tocantins#TO", "50"]]),
      contatosPorChave: new Set(["50#maria-silva"]),
      oportunidadesPorCodigo: new Set(["OPO-2026-001"]),
      modulosPorChave: new Map([["10#1", { id: "20", comercialVazio: false }]]),
    };
    const plano = planejarImportacao(dados, jaImportado);
    expect(plano.criarClientes).toHaveLength(0);
    expect(plano.criarContatos).toHaveLength(0);
    expect(plano.criarOportunidades).toHaveLength(0);
    expect(plano.atualizarModulos).toHaveLength(0);
  });

  it("gera avisos para refs e valores não resolvidos", () => {
    const semCatalogo: ExistentesNoBanco = { ...existentes, programasPorSigla: new Map(), modulosPorChave: new Map(), eventosPorNome: new Map(), usuariosPorEmail: new Map() };
    const plano = planejarImportacao(dados, semCatalogo);
    expect(plano.avisos.length).toBeGreaterThan(0);
    expect(plano.criarOportunidades[0]?.data.programa).toBeNull();
  });

  it("deduplica cliente com a mesma chave natural dentro do lote (1 criado + aviso)", () => {
    const comDuplicado: ExportCrmLegado = {
      ...dados,
      tabelas: {
        ...dados.tabelas,
        clientes: [
          ...(dados.tabelas?.clientes ?? []),
          { id: "CLI-099", orgao: "SEDUC Tocantins", uf: "TO", status: "Prospect" },
        ],
      },
    };
    const plano = planejarImportacao(comDuplicado, existentes);
    expect(plano.criarClientes).toHaveLength(1);
    expect(plano.criarClientes[0]?.idLegado).toBe("CLI-001");
    expect(plano.avisos.some((a) => a.includes("CLI-099") && a.includes("duplicado no lote"))).toBe(true);
    expect(plano.resumo.ignorados).toBe(1);
  });

  it("deduplica contato de cliente novo dentro do lote (1 criado)", () => {
    const comDuplicado: ExportCrmLegado = {
      ...dados,
      tabelas: {
        ...dados.tabelas,
        contatos: [
          ...(dados.tabelas?.contatos ?? []),
          { id: "CON-099", nome: "Maria Silva", cliente: "CLI-001", cargo: "Assessora" },
        ],
      },
    };
    const plano = planejarImportacao(comDuplicado, existentes);
    expect(plano.criarContatos).toHaveLength(1);
    expect(plano.criarContatos[0]?.idLegado).toBe("CON-001");
    expect(plano.avisos.some((a) => a.includes("CON-099") && a.includes("duplicado no lote"))).toBe(true);
  });

  it("emite o aviso de responsável não resolvido UMA vez para vários registros com o mesmo e-mail", () => {
    const semUsuarios: ExistentesNoBanco = { ...existentes, usuariosPorEmail: new Map() };
    const comDoisRegistros: ExportCrmLegado = {
      ...dados,
      tabelas: {
        ...dados.tabelas,
        clientes: [
          ...(dados.tabelas?.clientes ?? []),
          { id: "CLI-002", orgao: "SEDUC Pará", uf: "PA", status: "Prospect", responsavel: "USR-003" },
        ],
      },
    };
    const plano = planejarImportacao(comDoisRegistros, semUsuarios);
    const avisosResponsavel = plano.avisos.filter((a) =>
      a.includes('responsável com e-mail "comercial1@institutontc.com.br" não encontrado'),
    );
    expect(avisosResponsavel).toHaveLength(1);
    expect(plano.criarClientes.every((c) => c.data.responsavel === null)).toBe(true);
  });

  it("não sobrescreve comercial de evento já preenchido (aviso + atualizarEventos vazio)", () => {
    const eventoPreenchido: ExistentesNoBanco = {
      ...existentes,
      eventosPorNome: new Map([["seminario-edutec", { id: "30", comercialVazio: false }]]),
    };
    const plano = planejarImportacao(dados, eventoPreenchido);
    expect(plano.atualizarEventos).toHaveLength(0);
    expect(plano.avisos.some((a) => a.includes('"Seminário EDUTEC"') && a.includes("já possui dados comerciais"))).toBe(true);
    // O evento ainda resolve como ref da oportunidade (guard vale só para a atualização comercial).
    expect(plano.criarOportunidades[0]?.data.eventos).toEqual(["30"]);
  });

  it("pula oportunidade com cliente não resolvido, com aviso nomeando o código", () => {
    const semCliente: ExportCrmLegado = {
      ...dados,
      tabelas: { ...dados.tabelas, clientes: [] },
    };
    const plano = planejarImportacao(semCliente, existentes);
    expect(plano.criarOportunidades).toHaveLength(0);
    expect(plano.avisos.some((a) => a.includes('Oportunidade "OPO-2026-001"') && a.includes("não resolvido"))).toBe(true);
  });
});
