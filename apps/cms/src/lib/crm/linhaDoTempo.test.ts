import { describe, expect, it } from "vitest";
import type { Lead } from "@ntc/types";

import { entradasDoLead } from "./linhaDoTempo";

const lead = {
  id: 7,
  tipo: "proposta",
  nome: "Ana",
  email: "ana@x.gov.br",
  instituicao: "SME",
  estagio: "lead",
  perdido: false,
  cliente: 3,
  origemEntrada: "site",
  consentimentoLgpd: { aceito: true },
  createdAt: "2026-09-16T00:00:00.000Z",
  updatedAt: "2026-09-16T00:00:00.000Z",
} as unknown as Lead;

const base = { usuarioId: 5, casamentoAutomatico: null };

describe("entradasDoLead", () => {
  it("lead manual criado já com cliente gera item 'lead'", () => {
    const itens = entradasDoLead({ ...base, operation: "create", doc: { ...lead, origemEntrada: "manual" } });
    expect(itens).toEqual([
      expect.objectContaining({ clienteId: 3, leadId: 7, tipo: "lead", titulo: "Lead criado manualmente", usuarioId: 5 }),
    ]);
  });

  it("lead do site criado sem cliente não gera nada (o casamento vem depois)", () => {
    expect(entradasDoLead({ ...base, operation: "create", doc: { ...lead, cliente: null } })).toEqual([]);
  });

  it("create com casamentoAutomatico não gera nada (fix round 1: o update aninhado do casamento já escreveu o item, com o detalhe — gerar de novo aqui duplicaria)", () => {
    expect(
      entradasDoLead({ usuarioId: 5, casamentoAutomatico: "dominio", operation: "create", doc: lead }),
    ).toEqual([]);
  });

  it("vínculo feito pelo casamento automático gera 'lead' com o motivo", () => {
    const itens = entradasDoLead({
      ...base,
      usuarioId: null,
      casamentoAutomatico: "dominio",
      operation: "update",
      doc: lead,
      previousDoc: { ...lead, cliente: null },
    });
    expect(itens).toEqual([
      expect.objectContaining({ tipo: "lead", titulo: "Lead recebido pelo site", detalhe: "Vinculado ao cliente por domínio do e-mail" }),
    ]);
  });

  it("cliente criado a partir do lead diz isso no detalhe", () => {
    const itens = entradasDoLead({
      ...base, usuarioId: null, casamentoAutomatico: "criado", operation: "update", doc: lead, previousDoc: { ...lead, cliente: null },
    });
    expect(itens[0]).toMatchObject({ detalhe: "Cliente criado a partir do lead" });
  });

  it("troca manual de cliente gera 'vinculo'", () => {
    const itens = entradasDoLead({ ...base, operation: "update", doc: { ...lead, cliente: 9 }, previousDoc: lead });
    expect(itens).toEqual([expect.objectContaining({ clienteId: 9, tipo: "vinculo", titulo: "Lead vinculado a este cliente" })]);
  });

  it("mudança de estágio gera 'transicao' com o título de→para", () => {
    const itens = entradasDoLead({ ...base, operation: "update", doc: { ...lead, estagio: "em-contato" }, previousDoc: { ...lead, estagio: "oportunidade" } });
    expect(itens).toEqual([expect.objectContaining({ tipo: "transicao", titulo: "Oportunidade → Em contato", referencia: { colecao: "leads", id: "7" } })]);
  });

  it("perda e reabertura", () => {
    const perda = entradasDoLead({ ...base, operation: "update", doc: { ...lead, perdido: true, motivoPerda: "recusou", detalhePerda: "preço" }, previousDoc: lead });
    expect(perda).toEqual([expect.objectContaining({ tipo: "perda", titulo: "Marcado como perdido · Recusou a proposta", detalhe: "preço" })]);
    const reab = entradasDoLead({ ...base, operation: "update", doc: lead, previousDoc: { ...lead, perdido: true } });
    expect(reab).toEqual([expect.objectContaining({ tipo: "reabertura", titulo: "Reaberto em Lead" })]);
  });

  it("update sem mudança relevante não gera nada", () => {
    expect(entradasDoLead({ ...base, operation: "update", doc: { ...lead, observacoes: "x" }, previousDoc: lead })).toEqual([]);
  });

  it("lead sem cliente nunca gera item (a linha do tempo é do cliente)", () => {
    expect(entradasDoLead({ ...base, operation: "update", doc: { ...lead, cliente: null, estagio: "em-contato" }, previousDoc: { ...lead, cliente: null } })).toEqual([]);
  });
});
