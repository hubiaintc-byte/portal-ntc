import { describe, expect, it } from "vitest";

import { LIMITES_FORM, schemaContato, schemaNewsletter, schemaProposta } from "./schemas";

const lgpd = { aceito: true as const, politicaVersao: "v1" };
const origem = { pagina: "/contato" };

const contatoValido = {
  nome: "Ana Souza",
  email: "ana@prefeitura.sp.gov.br",
  telefone: "61999990000",
  assunto: "imprensa",
  mensagem: "Gostaria de saber mais sobre os programas.",
  origem,
  consentimentoLgpd: lgpd,
};

describe("limites dos formulários públicos", () => {
  it("aceita um envio normal", () => {
    expect(schemaContato.safeParse(contatoValido).success).toBe(true);
  });

  it("aceita a mensagem no limite e recusa acima dele", () => {
    const noLimite = { ...contatoValido, mensagem: "a".repeat(LIMITES_FORM.mensagem) };
    const acima = { ...contatoValido, mensagem: "a".repeat(LIMITES_FORM.mensagem + 1) };
    expect(schemaContato.safeParse(noLimite).success).toBe(true);
    const r = schemaContato.safeParse(acima);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(`Máximo de ${LIMITES_FORM.mensagem} caracteres`);
  });

  it("limita nome, campos curtos e a origem", () => {
    expect(schemaContato.safeParse({ ...contatoValido, nome: "a".repeat(LIMITES_FORM.nome + 1) }).success).toBe(false);
    expect(schemaContato.safeParse({ ...contatoValido, cargo: "a".repeat(LIMITES_FORM.curto + 1) }).success).toBe(false);
  });

  it("trunca a origem vinda do navegador em vez de recusar o envio", () => {
    const r = schemaContato.safeParse({
      ...contatoValido,
      origem: { pagina: "/x", referrer: "https://google.com/?q=" + "a".repeat(3000), utm_source: "b".repeat(500) },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.origem.referrer).toHaveLength(1000);
      expect(r.data.origem.utm_source).toHaveLength(200);
    }
  });

  it("limita listas da newsletter", () => {
    const base = { nome: "Ana", email: "ana@x.gov.br", origem, consentimentoLgpd: lgpd };
    expect(schemaNewsletter.safeParse({ ...base, areasInteresse: ["1", "2"] }).success).toBe(true);
    expect(
      schemaNewsletter.safeParse({ ...base, areasInteresse: Array.from({ length: 21 }, (_, i) => String(i)) }).success,
    ).toBe(false);
  });

  it("limita a mensagem da proposta", () => {
    const proposta = {
      ...contatoValido,
      modalidade: schemaProposta.shape.modalidade.options[0],
      esfera: schemaProposta.shape.esfera.options[0],
      cargo: "Secretária",
      instituicao: "SME",
      mensagem: "a".repeat(LIMITES_FORM.mensagem + 1),
    };
    expect(schemaProposta.safeParse(proposta).success).toBe(false);
  });
});
