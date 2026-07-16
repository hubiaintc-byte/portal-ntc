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
  eventosPorNome: new Map([["seminario-edutec", "30"]]),
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
});
