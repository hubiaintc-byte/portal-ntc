import { describe, expect, it, vi } from "vitest";
import type { ClienteCrm, Lead } from "@ntc/types";

import { candidatoDeCliente, casarClienteDoLead, dadosDoClienteNovo } from "./casamento";
import { registrarLeadNaLinhaDoTempo } from "./linhaDoTempo";

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
  // `context: {}` porque `casarClienteDoLead` grava o motivo do casamento em
  // `req.context` (fix round 1) antes do `update` aninhado — no Payload real
  // `req.context` nunca é `undefined` (campo obrigatório de `PayloadRequest`).
  return { req: { context: {}, payload: { find, create, update } }, find, create, update };
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

/**
 * Fix round 1 (achado Critical da revisão): `casarClienteDoLead` faz um
 * `update` aninhado do próprio lead, que — no Payload real — roda de novo o
 * `afterChange` inteiro de `leads` na mesma transação, incluindo
 * `registrarLeadNaLinhaDoTempo`. Sem o corte em `entradasDoLead`, o segundo
 * hook do `afterChange` EXTERNO do `create` (que já vê `doc.cliente`
 * preenchido, porque `casarClienteDoLead` devolveu o doc atualizado) gerava
 * um segundo item genérico, duplicando o que o `update` aninhado já
 * escreveu com o detalhe do casamento. Os testes acima stubam
 * `req.payload` na fronteira da função e não pegavam isso — este teste
 * encadeia as duas funções de verdade, como o Payload faria.
 */
describe("casarClienteDoLead + registrarLeadNaLinhaDoTempo encadeados — sem duplicata na linha do tempo", () => {
  it("o create do lead casado por domínio escreve um único item na linha do tempo, com o detalhe do casamento", async () => {
    const timelineCreate = vi.fn(async (args: { data: Record<string, unknown> }) => ({ id: 99, ...args.data }));
    const clienteCreate = vi.fn();
    const clienteFind = vi.fn(async () => ({ docs: [cliente] }));

    const req = {
      context: {} as Record<string, unknown>,
      user: null as null,
      payload: {
        find: clienteFind,
        create: vi.fn(async (args: { collection: string; data: Record<string, unknown> }) =>
          args.collection === "linha-do-tempo" ? timelineCreate(args) : clienteCreate(args),
        ),
        update: vi.fn(
          async ({ data, context }: { data: Record<string, unknown>; context?: Record<string, unknown> }) => {
            const atualizado = { ...lead, ...data } as Lead;
            // Simula o Payload real: o `update` aninhado roda o próprio
            // `afterChange` de `leads`, na mesma transação, ANTES de
            // devolver o controle para o segundo hook do `create` externo.
            await (
              registrarLeadNaLinhaDoTempo as unknown as (args: Record<string, unknown>) => Promise<Lead>
            )({ doc: atualizado, previousDoc: lead, operation: "update", req, context });
            return atualizado;
          },
        ),
      },
    };

    const hookCasamento = casarClienteDoLead as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    const saida = await hookCasamento({ doc: lead, operation: "create", req });

    // Segundo hook do `afterChange` externo do `create`, na mesma ordem de
    // Leads.ts: `[casarClienteDoLead, registrarLeadNaLinhaDoTempo]`.
    const hookTimeline = registrarLeadNaLinhaDoTempo as unknown as (args: Record<string, unknown>) => Promise<Lead>;
    await hookTimeline({ doc: saida, previousDoc: undefined, operation: "create", req, context: req.context });

    expect(timelineCreate).toHaveBeenCalledTimes(1);
    expect(timelineCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "linha-do-tempo",
        data: expect.objectContaining({
          tipo: "lead",
          titulo: "Lead recebido pelo site",
          detalhe: "Vinculado ao cliente por domínio do e-mail",
        }),
      }),
    );
  });
});
