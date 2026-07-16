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

  it("com RESEND_API_KEY setada e LEADS_EMAIL_DESTINO ausente, chama fetch com o destino padrão", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);

    await aposCriarLeadCom(fetchMock, "contato", leadExemplo);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { to: string };
    expect(body.to).toBe("contato@institutontc.com.br");
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

  it("resposta 4xx/5xx do Resend não lança e loga console.error com status e corpo", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    vi.stubEnv("LEADS_EMAIL_DESTINO", "leads@institutontc.com.br");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: () => Promise.resolve('{"message":"domínio não verificado"}'),
    } as Response);

    await expect(aposCriarLeadCom(fetchMock, "contato", leadExemplo)).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    const [, chamada] = errorSpy.mock.calls[0] as [string, { status: number; corpo: string }];
    expect(chamada.status).toBe(422);
    expect(chamada.corpo).toContain("domínio não verificado");
    errorSpy.mockRestore();
  });

  it("escapa HTML no nome e no e-mail do lead dentro do body do e-mail", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_teste_123");
    vi.stubEnv("LEADS_EMAIL_DESTINO", "leads@institutontc.com.br");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    const leadMalicioso = {
      id: 2,
      email: "atacante@exemplo.br",
      nome: '<img src=x onerror=alert(1)> & "Fulano" \'Malicioso\'',
    };

    await aposCriarLeadCom(fetchMock, "contato", leadMalicioso);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { html: string; subject: string };

    expect(body.html).not.toContain("<img src=x onerror=alert(1)>");
    expect(body.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(body.html).toContain("&amp;");
    expect(body.html).toContain("&quot;Fulano&quot;");
    expect(body.html).toContain("&#39;Malicioso&#39;");

    // O subject mantém o formato literal do brief — não é renderizado como HTML.
    expect(body.subject).toBe(`Novo lead (contato): ${leadMalicioso.nome}`);
  });
});
