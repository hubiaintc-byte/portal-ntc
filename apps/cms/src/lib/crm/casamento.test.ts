import { describe, expect, it, vi } from "vitest";
import type { ClienteCrm, Lead } from "@ntc/types";

import { candidatoDeCliente, casarClienteDoLead, dadosDoClienteNovo } from "./casamento";

const cliente = {
  id: 3,
  orgao: "Secretaria Municipal de Educação",
  sigla: "SME",
  cnpj: null,
  email: "sme@cidade.sp.gov.br",
  contatos: [{ nome: "Ana", email: "ana@cidade.sp.gov.br", principal: true }],
  createdAt: "",
  updatedAt: "",
} as unknown as ClienteCrm;

const lead = {
  id: 7,
  tipo: "proposta",
  nome: "Bruno",
  email: "bruno@cidade.sp.gov.br",
  telefone: "11 99999-0000",
  cargo: "Diretor",
  instituicao: "Secretaria Municipal de Educação",
  esfera: "municipal",
  cliente: null,
  origemEntrada: "site",
  createdAt: "",
  updatedAt: "",
} as unknown as Lead;

describe("candidatoDeCliente", () => {
  it("achata o cliente com os e-mails dos contatos", () => {
    expect(candidatoDeCliente(cliente)).toEqual({
      id: "3",
      orgao: "Secretaria Municipal de Educação",
      sigla: "SME",
      cnpj: null,
      email: "sme@cidade.sp.gov.br",
      emailsContatos: ["ana@cidade.sp.gov.br"],
    });
  });
});

describe("dadosDoClienteNovo", () => {
  it("cria o cliente a partir do lead com a pessoa como contato principal", () => {
    expect(dadosDoClienteNovo(lead)).toEqual({
      orgao: "Secretaria Municipal de Educação",
      esfera: "municipal",
      email: null,
      origem: "lead-site",
      contatos: [
        { nome: "Bruno", cargo: "Diretor", setor: null, email: "bruno@cidade.sp.gov.br", whatsapp: "11 99999-0000", principal: true, decisor: false },
      ],
    });
  });

  it("sem instituição usa o nome da pessoa como órgão provisório", () => {
    expect(dadosDoClienteNovo({ ...lead, instituicao: null } as Lead).orgao).toBe("Bruno (órgão a confirmar)");
  });

  it("esfera sem correspondência no CRM (privada, terceiro-setor) vira null", () => {
    expect(dadosDoClienteNovo({ ...lead, esfera: "privada" } as Lead).esfera).toBeNull();
  });
});

function montarReq(clientes: ClienteCrm[]) {
  const find = vi.fn(async () => ({ docs: clientes }));
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 42, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  return { req: { payload: { find, create, update } }, find, create, update };
}

describe("casarClienteDoLead", () => {
  it("vincula ao cliente existente por domínio e marca o motivo", async () => {
    const { req, update, create } = montarReq([cliente]);
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    const saida = await hook({ doc: lead, operation: "create", req });
    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        id: 7,
        data: { cliente: 3, clienteCasadoPor: "dominio" },
        context: { casamentoAutomatico: "dominio" },
      }),
    );
    expect(saida).toMatchObject({ cliente: 3, clienteCasadoPor: "dominio" });
  });

  it("cria o cliente quando nada casa", async () => {
    const { req, update, create } = montarReq([]);
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    await hook({ doc: lead, operation: "create", req });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ collection: "clientes-crm" }));
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { cliente: 42, clienteCasadoPor: "criado" }, context: { casamentoAutomatico: "criado" } }),
    );
  });

  it("não age em update, em lead de outro tipo nem em lead já vinculado", async () => {
    const hook = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    const a = montarReq([cliente]);
    await hook({ doc: lead, operation: "update", req: a.req });
    const b = montarReq([cliente]);
    await hook({ doc: { ...lead, tipo: "contato" }, operation: "create", req: b.req });
    const c = montarReq([cliente]);
    await hook({ doc: { ...lead, cliente: 3 }, operation: "create", req: c.req });
    expect(a.find).not.toHaveBeenCalled();
    expect(b.find).not.toHaveBeenCalled();
    expect(c.find).not.toHaveBeenCalled();
  });
});
