import { afterEach, describe, expect, it, vi } from "vitest";

import { aposCriarLeadCom } from "./aposCriarLead";

const leadExemplo = { id: 1, email: "fulano@exemplo.br", nome: "Fulano de Tal" };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("aposCriarLeadCom", () => {
  it("sem RESEND_API_KEY não chama fetch", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn();

    await aposCriarLeadCom(fetchMock, "contato", leadExemplo);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });

  it("sem LEADS_EMAIL_DESTINO não chama fetch mesmo com RESEND_API_KEY setada", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn();

    await aposCriarLeadCom(fetchMock, "contato", leadExemplo);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });

  it("com envs setadas chama a URL do Resend com Authorization Bearer e body contendo o e-mail do lead", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    vi.stubEnv("LEADS_EMAIL_DESTINO", "leads@institutontc.com.br");
    vi.stubEnv("EMAIL_REMETENTE", "Painel NTC <nao-responda@institutontc.com.br>");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);

    await aposCriarLeadCom(fetchMock, "proposta", leadExemplo);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer re_teste_123",
      "Content-Type": "application/json",
    });

    const body = JSON.parse(init.body as string) as {
      from: string;
      to: string;
      subject: string;
      html: string;
    };
    expect(body.from).toBe("Painel NTC <nao-responda@institutontc.com.br>");
    expect(body.to).toBe("leads@institutontc.com.br");
    expect(body.subject).toBe(`Novo lead (proposta): ${leadExemplo.nome}`);
    expect(body.html).toContain(leadExemplo.email);
  });

  it("usa o remetente padrão quando EMAIL_REMETENTE não está definida", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    vi.stubEnv("LEADS_EMAIL_DESTINO", "leads@institutontc.com.br");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);

    await aposCriarLeadCom(fetchMock, "newsletter", leadExemplo);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { from: string };
    expect(body.from).toBe("Painel NTC <nao-responda@institutontc.com.br>");
  });

  it("falha do fetch não lança e loga console.error", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    vi.stubEnv("LEADS_EMAIL_DESTINO", "leads@institutontc.com.br");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(aposCriarLeadCom(fetchMock, "candidatura", leadExemplo)).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
