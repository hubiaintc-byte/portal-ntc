import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checarRateLimit, LIMITE_PADRAO, type StoreRateLimit } from "./rateLimit";

function storeFalso(contagem: number) {
  const registros: { rota: string; ip: string }[] = [];
  const limpezas: { rota: string; ip: string; antesDe: Date }[] = [];
  const store: StoreRateLimit = {
    contarDesde: vi.fn().mockResolvedValue(contagem),
    registrar: vi.fn(async (rota, ip) => {
      registros.push({ rota, ip });
    }),
    limparAntesDe: vi.fn(async (rota, ip, antesDe) => {
      limpezas.push({ rota, ip, antesDe });
    }),
  };
  return { store, registros, limpezas };
}

describe("checarRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T12:00:00.000Z"));
    process.env.RATELIMIT_ENABLED = "true";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.RATELIMIT_ENABLED;
  });

  it("desligado por flag: libera sem tocar no store", async () => {
    process.env.RATELIMIT_ENABLED = "false";
    const { store } = storeFalso(999);
    expect(await checarRateLimit("1.2.3.4", "/api/forms/contato", store)).toEqual({ ok: true });
    expect(store.contarDesde).not.toHaveBeenCalled();
    expect(store.registrar).not.toHaveBeenCalled();
  });

  it("abaixo do limite: libera e registra a tentativa", async () => {
    const { store, registros } = storeFalso(LIMITE_PADRAO.maxTentativas - 1);
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(true);
    expect(registros).toEqual([{ rota: "/api/forms/contato", ip: "1.2.3.4" }]);
  });

  it("no limite: bloqueia, devolve retryAfter e NÃO registra", async () => {
    const { store, registros } = storeFalso(LIMITE_PADRAO.maxTentativas);
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSegundos).toBe(LIMITE_PADRAO.janelaSegundos);
    expect(registros).toEqual([]);
  });

  it("conta a partir do início da janela, não do epoch", async () => {
    const { store } = storeFalso(0);
    await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    const desde = vi.mocked(store.contarDesde).mock.calls[0]?.[2] as Date;
    expect(desde.toISOString()).toBe("2026-09-07T11:50:00.000Z"); // 12:00 menos 600s
  });

  it("limpa registros anteriores à janela (retenção curta, LGPD)", async () => {
    const { store, limpezas } = storeFalso(0);
    await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(limpezas).toHaveLength(1);
    expect(limpezas[0]?.antesDe.toISOString()).toBe("2026-09-07T11:50:00.000Z");
  });

  it("respeita limite customizado por rota", async () => {
    const { store } = storeFalso(3);
    const r = await checarRateLimit("1.2.3.4", "/entrar/recuperar", store, {
      maxTentativas: 3,
      janelaSegundos: 900,
    });
    expect(r).toEqual({ ok: false, retryAfterSegundos: 900 });
  });

  it("falha do store NÃO vira bypass: bloqueia e loga", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const store: StoreRateLimit = {
      contarDesde: vi.fn().mockRejectedValue(new Error("banco fora")),
      registrar: vi.fn(),
      limparAntesDe: vi.fn(),
    };
    const r = await checarRateLimit("1.2.3.4", "/api/forms/contato", store);
    expect(r.ok).toBe(false);
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });
});
