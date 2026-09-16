import { describe, expect, it } from "vitest";

import {
  casarCliente,
  dominioDoEmail,
  ehDominioInstitucional,
  normalizarNome,
  type ClienteCandidato,
} from "./casamento-cliente";

const candidatos: ClienteCandidato[] = [
  {
    id: "1",
    orgao: "Secretaria Municipal de Educação de Campinas",
    sigla: "SME Campinas",
    cnpj: "51.885.242/0001-40",
    email: "gabinete@campinas.sp.gov.br",
    emailsContatos: ["ana@campinas.sp.gov.br"],
  },
  {
    id: "2",
    orgao: "Tribunal de Contas do Estado",
    sigla: "TCE-SP",
    cnpj: null,
    email: null,
    emailsContatos: ["joao@tce.sp.gov.br"],
  },
  {
    id: "3",
    orgao: "Consultoria Particular",
    sigla: null,
    cnpj: null,
    email: "contato@gmail.com",
    emailsContatos: [],
  },
];

describe("normalizarNome", () => {
  it("remove acento, caixa, pontuação e espaços repetidos", () => {
    expect(normalizarNome("  Secretaria   Municipal de Educação — Campinas! ")).toBe(
      "secretaria municipal de educacao campinas",
    );
  });
});

describe("dominioDoEmail / ehDominioInstitucional", () => {
  it("extrai o domínio em minúsculas", () => {
    expect(dominioDoEmail("Ana@Campinas.SP.GOV.BR")).toBe("campinas.sp.gov.br");
    expect(dominioDoEmail("sem-arroba")).toBeNull();
    expect(dominioDoEmail(null)).toBeNull();
  });

  it("reconhece sufixos institucionais e recusa provedores públicos", () => {
    expect(ehDominioInstitucional("campinas.sp.gov.br")).toBe(true);
    expect(ehDominioInstitucional("tce.sp.gov.br")).toBe(true);
    expect(ehDominioInstitucional("camara.leg.br")).toBe(true);
    expect(ehDominioInstitucional("ufmg.edu.br")).toBe(true);
    expect(ehDominioInstitucional("gmail.com")).toBe(false);
    expect(ehDominioInstitucional("empresa.com.br")).toBe(false);
  });
});

describe("casarCliente", () => {
  it("casa por CNPJ ignorando máscara", () => {
    expect(
      casarCliente({ instituicao: "outro nome", email: null, cnpj: "51885242000140" }, candidatos),
    ).toEqual({ clienteId: "1", por: "cnpj" });
  });

  it("casa por domínio institucional do e-mail do cliente", () => {
    expect(
      casarCliente({ instituicao: null, email: "novo@campinas.sp.gov.br", cnpj: null }, candidatos),
    ).toEqual({ clienteId: "1", por: "dominio" });
  });

  it("casa por domínio institucional de um contato", () => {
    expect(
      casarCliente({ instituicao: null, email: "maria@tce.sp.gov.br", cnpj: null }, candidatos),
    ).toEqual({ clienteId: "2", por: "dominio" });
  });

  it("nunca casa por domínio de provedor público", () => {
    expect(
      casarCliente({ instituicao: null, email: "fulano@gmail.com", cnpj: null }, candidatos),
    ).toBeNull();
  });

  it("casa por nome normalizado do órgão ou pela sigla", () => {
    expect(
      casarCliente(
        { instituicao: "secretaria municipal de educacao de campinas", email: null, cnpj: null },
        candidatos,
      ),
    ).toEqual({ clienteId: "1", por: "nome" });
    expect(casarCliente({ instituicao: "tce-sp", email: null, cnpj: null }, candidatos)).toEqual({
      clienteId: "2",
      por: "nome",
    });
  });

  it("CNPJ vence domínio, domínio vence nome", () => {
    expect(
      casarCliente(
        { instituicao: "Tribunal de Contas do Estado", email: "x@campinas.sp.gov.br", cnpj: null },
        candidatos,
      ),
    ).toEqual({ clienteId: "1", por: "dominio" });
  });

  it("devolve null sem candidato compatível", () => {
    expect(
      casarCliente({ instituicao: "Prefeitura de Sorocaba", email: "a@sorocaba.sp.gov.br", cnpj: null }, candidatos),
    ).toBeNull();
    expect(casarCliente({ instituicao: null, email: null, cnpj: null }, candidatos)).toBeNull();
  });
});
