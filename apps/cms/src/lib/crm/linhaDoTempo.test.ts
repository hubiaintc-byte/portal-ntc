import { describe, expect, it } from "vitest";
import type { DocumentoComercial, EventoComercial, Lead } from "@ntc/types";

import { entradasDoDocumento, entradasDoEvento, entradasDoLead } from "./linhaDoTempo";

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

const evento = {
  id: 10,
  lead: 7,
  cliente: 3,
  titulo: "Curso de Gestão Escolar",
  dataInicio: "2026-10-01T00:00:00.000Z",
  status: "agendado",
  contratoEmpenho: {},
  linksInscricao: [],
  createdAt: "2026-09-17T00:00:00.000Z",
  updatedAt: "2026-09-17T00:00:00.000Z",
} as unknown as EventoComercial;

const baseEvento = { usuarioId: 5 };

describe("entradasDoEvento", () => {
  it("create gera 'Evento agendado · <titulo>' com cliente/lead/referência", () => {
    const itens = entradasDoEvento({ ...baseEvento, operation: "create", doc: evento });
    expect(itens).toEqual([
      expect.objectContaining({
        clienteId: 3,
        leadId: 7,
        tipo: "evento",
        titulo: "Evento agendado · Curso de Gestão Escolar",
        referencia: { colecao: "eventos-comerciais", id: "10" },
        usuarioId: 5,
      }),
    ]);
  });

  it("create sem cliente não gera nada", () => {
    expect(
      entradasDoEvento({ ...baseEvento, operation: "create", doc: { ...evento, cliente: null } as unknown as EventoComercial }),
    ).toEqual([]);
  });

  it("contrato/empenho preenchido (tipo + número) gera 'Contrato/empenho registrado · Empenho 2026NE000123'", () => {
    const itens = entradasDoEvento({
      ...baseEvento,
      operation: "update",
      doc: { ...evento, contratoEmpenho: { tipo: "empenho", numero: "2026NE000123" } },
      previousDoc: evento,
    });
    expect(itens).toEqual([expect.objectContaining({ tipo: "evento", titulo: "Contrato/empenho registrado · Empenho 2026NE000123" })]);
  });

  it("contrato/empenho só com tipo (sem número) omite o número", () => {
    const itens = entradasDoEvento({
      ...baseEvento,
      operation: "update",
      doc: { ...evento, contratoEmpenho: { tipo: "empenho" } },
      previousDoc: evento,
    });
    expect(itens).toEqual([expect.objectContaining({ titulo: "Contrato/empenho registrado · Empenho" })]);
  });

  it("contrato/empenho preenchido sem tipo nem número (só data/valor) omite os dois", () => {
    const itens = entradasDoEvento({
      ...baseEvento,
      operation: "update",
      doc: { ...evento, contratoEmpenho: { data: "2026-09-20", valor: 1000 } },
      previousDoc: evento,
    });
    expect(itens).toEqual([expect.objectContaining({ titulo: "Contrato/empenho registrado" })]);
  });

  it("contrato/empenho que já estava preenchido não gera item de novo", () => {
    const cheio: EventoComercial = { ...evento, contratoEmpenho: { tipo: "empenho", numero: "2026NE000123" } };
    expect(entradasDoEvento({ ...baseEvento, operation: "update", doc: cheio, previousDoc: cheio })).toEqual([]);
  });

  it("links de inscrição mudando de quantidade gera 'Links de inscrição atualizados (N)'", () => {
    const itens = entradasDoEvento({
      ...baseEvento,
      operation: "update",
      doc: {
        ...evento,
        linksInscricao: [
          { rotulo: "Turma A", url: "https://x.com/a" },
          { rotulo: "Turma B", url: "https://x.com/b" },
        ],
      },
      previousDoc: evento,
    });
    expect(itens).toEqual([expect.objectContaining({ tipo: "evento", titulo: "Links de inscrição atualizados (2)" })]);
  });

  it("status agendado → realizado", () => {
    const itens = entradasDoEvento({ ...baseEvento, operation: "update", doc: { ...evento, status: "realizado" }, previousDoc: evento });
    expect(itens).toEqual([expect.objectContaining({ titulo: "Evento realizado · Curso de Gestão Escolar" })]);
  });

  it("status agendado → cancelado", () => {
    const itens = entradasDoEvento({ ...baseEvento, operation: "update", doc: { ...evento, status: "cancelado" }, previousDoc: evento });
    expect(itens).toEqual([expect.objectContaining({ titulo: "Evento cancelado · Curso de Gestão Escolar" })]);
  });

  it("update sem mudança relevante não gera nada", () => {
    expect(entradasDoEvento({ ...baseEvento, operation: "update", doc: { ...evento, observacoes: "x" }, previousDoc: evento })).toEqual([]);
  });

  it("update sem previousDoc (defensivo) não gera nada", () => {
    expect(entradasDoEvento({ ...baseEvento, operation: "update", doc: evento })).toEqual([]);
  });
});

const documento = {
  id: 20,
  filename: "proposta-sme-2026.pdf",
  descricao: "Proposta comercial enviada",
  evento: 10,
  createdAt: "2026-09-17T00:00:00.000Z",
  updatedAt: "2026-09-17T00:00:00.000Z",
} as unknown as DocumentoComercial;

describe("entradasDoDocumento", () => {
  it("create com cliente resolvido (documento anexado a um evento) gera 'Documento anexado · <filename>'", () => {
    const itens = entradasDoDocumento({ operation: "create", doc: documento, clienteId: 3, leadId: 7, usuarioId: 5 });
    expect(itens).toEqual([
      expect.objectContaining({
        clienteId: 3,
        leadId: 7,
        tipo: "documento",
        titulo: "Documento anexado · proposta-sme-2026.pdf",
        detalhe: "Proposta comercial enviada",
        referencia: { colecao: "documentos-comerciais", id: "20" },
        usuarioId: 5,
      }),
    ]);
  });

  it("sem cliente resolvido (documento sem evento, ex. PDF de proposta) não gera nada", () => {
    expect(
      entradasDoDocumento({
        operation: "create",
        doc: { ...documento, evento: null } as unknown as DocumentoComercial,
        clienteId: null,
        usuarioId: 5,
      }),
    ).toEqual([]);
  });
});
