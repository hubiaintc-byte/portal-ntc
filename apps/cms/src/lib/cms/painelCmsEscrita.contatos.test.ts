import { beforeEach, describe, expect, it, vi } from "vitest";

const updateGlobal = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ updateGlobal }) }));
vi.stubGlobal("fetch", fetchMock);

import { salvarContatosCms, type CamposContatos } from "./painelCmsEscrita";

const campos: CamposContatos = {
  telefoneInstitucional: "(63) 3212-1199",
  whatsappInstitucional: "(63) 98444-4040",
  emailInstitucional: "contato@institutontc.com.br",
  emailImprensa: "imprensa@institutontc.com.br",
  emailParcerias: "",
  emailDpo: "dpo@institutontc.com.br",
  emailSuporte: "suporte@institutontc.com.br",
  emailEventos: "eventosonline@institutontc.com.br",
  enderecoCompleto: "SCS Quadra 9, Bloco C — Brasília/DF",
  razaoSocial: "Instituto NTC do Brasil",
  cnpj: "00.000.000/0001-00",
  verticais: [
    { vertical: "educacao", email: "educacao@institutontc.com.br", opcaoTelefone: "opção 1" },
  ],
};

beforeEach(() => {
  updateGlobal.mockReset();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true });
});

describe("salvarContatosCms", () => {
  it("grava no global rodape", async () => {
    updateGlobal.mockResolvedValue({});
    const r = await salvarContatosCms(campos);
    expect(r.ok).toBe(true);
    expect(updateGlobal.mock.calls[0]![0]).toMatchObject({ slug: "rodape" });
  });

  it("recusa e-mail com formato inválido sem tocar no banco", async () => {
    const r = await salvarContatosCms({ ...campos, emailDpo: "dpo(arroba)ntc" });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/e-mail/i);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("aceita e-mail opcional em branco", async () => {
    updateGlobal.mockResolvedValue({});
    const r = await salvarContatosCms({ ...campos, emailParcerias: "" });
    expect(r.ok).toBe(true);
  });

  it("recusa telefone sem DDD", async () => {
    const r = await salvarContatosCms({ ...campos, telefoneInstitucional: "32121199" });
    expect(r.ok).toBe(false);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("recusa endereço vazio", async () => {
    const r = await salvarContatosCms({ ...campos, enderecoCompleto: "  " });
    expect(r.ok).toBe(false);
  });

  it("salva mesmo quando a revalidação do site falha", async () => {
    updateGlobal.mockResolvedValue({});
    fetchMock.mockRejectedValue(new Error("front fora do ar"));
    const r = await salvarContatosCms(campos);
    expect(r.ok).toBe(true);
    expect(r.aviso).toMatch(/pode levar/i);
  });
});
