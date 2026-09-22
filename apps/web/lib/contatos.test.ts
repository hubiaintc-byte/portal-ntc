import { beforeEach, describe, expect, it, vi } from "vitest";

const findGlobal = vi.fn();

vi.mock("./payloadClient", () => ({ obterPayload: async () => ({ findGlobal }) }));

import { CONTATOS_FALLBACK, carregarContatos } from "./contatos";

// Corpo em bloco (não retorno implícito): findGlobal.mockReset() devolve o
// próprio mock (é encadeável); um `() => findGlobal.mockReset()` faz o
// beforeEach devolver esse mock, e o runner do Vitest 4 trata um valor de
// hook que é uma função como cleanup e o invoca de novo depois do teste —
// disparando uma 2ª chamada não tratada do mock corrente (ex.: o rejeitado
// do teste "banco falha", virando unhandled rejection e derrubando o teste
// mesmo com o catch correto no código). Ver vitest-dev/vitest#10845.
beforeEach(() => {
  findGlobal.mockReset();
});

describe("carregarContatos", () => {
  it("devolve os valores do CMS com os hrefs derivados", async () => {
    findGlobal.mockResolvedValue({
      telefoneInstitucional: "(11) 4002-8922",
      whatsappInstitucional: "(11) 91234-5678",
      emailInstitucional: "novo@institutontc.com.br",
    });
    const c = await carregarContatos();
    expect(c.telefone).toBe("(11) 4002-8922");
    expect(c.telefoneHref).toBe("tel:+551140028922");
    expect(c.whatsappHref).toBe("https://wa.me/5511912345678");
    expect(c.emailInstitucional).toBe("novo@institutontc.com.br");
  });

  it("cai no fallback campo a campo quando o CMS vem parcial", async () => {
    findGlobal.mockResolvedValue({ telefoneInstitucional: "(11) 4002-8922" });
    const c = await carregarContatos();
    expect(c.telefone).toBe("(11) 4002-8922");
    expect(c.emailDpo).toBe(CONTATOS_FALLBACK.emailDpo);
    expect(c.endereco).toBe(CONTATOS_FALLBACK.endereco);
  });

  it("devolve o fallback inteiro — sem lançar — quando o banco falha", async () => {
    findGlobal.mockRejectedValue(new Error("connection refused"));
    await expect(carregarContatos()).resolves.toEqual(CONTATOS_FALLBACK);
  });

  it("devolve o fallback quando o global ainda não existe", async () => {
    findGlobal.mockResolvedValue(null);
    expect(await carregarContatos()).toEqual(CONTATOS_FALLBACK);
  });

  it("o fallback traz os valores que hoje estão no site", () => {
    expect(CONTATOS_FALLBACK.telefone).toBe("(63) 3212-1199");
    expect(CONTATOS_FALLBACK.whatsapp).toBe("(63) 98444-4040");
    expect(CONTATOS_FALLBACK.emailInstitucional).toBe("contato@institutontc.com.br");
    expect(CONTATOS_FALLBACK.verticais).toHaveLength(3);
  });
});
