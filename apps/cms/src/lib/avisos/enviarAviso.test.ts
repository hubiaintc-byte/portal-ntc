import { describe, expect, it, vi } from "vitest";

import type { Payload } from "payload";

import type { AvisoPush } from "@ntc/lib";

import { configVapid, enviarAvisoATodos } from "./enviarAviso";

const aviso: AvisoPush = { title: "t", body: "b", url: "/", tag: "x" };
const vapid = { publica: "pub", privada: "priv", assunto: "mailto:a@b.c" };

function inscricao(id: number) {
  return { id, endpoint: `https://push/${id}`, p256dh: `p${id}`, auth: `a${id}` };
}

function payloadFalso(docs: ReturnType<typeof inscricao>[]) {
  const find = vi.fn().mockResolvedValue({ docs });
  const del = vi.fn().mockResolvedValue({});
  return { payload: { find, delete: del } as unknown as Payload, find, del };
}

describe("configVapid", () => {
  it("devolve null sem a chave privada", () => {
    expect(configVapid({ NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub" })).toBeNull();
  });
  it("devolve null sem a chave pública", () => {
    expect(configVapid({ VAPID_PRIVATE_KEY: "priv" })).toBeNull();
  });
  it("usa o assunto default", () => {
    expect(
      configVapid({ NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub", VAPID_PRIVATE_KEY: "priv" }),
    ).toEqual({ publica: "pub", privada: "priv", assunto: "mailto:contato@institutontc.com.br" });
  });
});

describe("enviarAvisoATodos", () => {
  it("sem VAPID não consulta nada", async () => {
    const { payload, find } = payloadFalso([]);
    const r = await enviarAvisoATodos(payload, aviso, { vapid: null });
    expect(r).toEqual({ enviados: 0, removidos: 0 });
    expect(find).not.toHaveBeenCalled();
  });

  it("remove inscrição expirada (410) e conta os enviados", async () => {
    const { payload, del } = payloadFalso([inscricao(1), inscricao(2), inscricao(3)]);
    const enviar = vi.fn(async (i: { endpoint: string }) => {
      if (i.endpoint === "https://push/2") throw { statusCode: 410 };
    });
    const r = await enviarAvisoATodos(payload, aviso, { enviar, vapid });
    expect(r).toEqual({ enviados: 2, removidos: 1 });
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(expect.objectContaining({ collection: "inscricoes-aviso", id: 2 }));
  });

  it("erro 500 não apaga nem rejeita", async () => {
    const { payload, del } = payloadFalso([inscricao(1)]);
    const enviar = vi.fn().mockRejectedValue({ statusCode: 500 });
    const espiao = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await enviarAvisoATodos(payload, aviso, { enviar, vapid });
    expect(r).toEqual({ enviados: 0, removidos: 0 });
    expect(del).not.toHaveBeenCalled();
    expect(espiao).toHaveBeenCalledTimes(1);
    expect(espiao.mock.calls[0]).toContain(500);
    expect(JSON.stringify(espiao.mock.calls)).not.toContain("https://push/1");
    espiao.mockRestore();
  });

  it("envia o aviso serializado", async () => {
    const { payload } = payloadFalso([inscricao(1)]);
    const enviar = vi.fn().mockResolvedValue({});
    await enviarAvisoATodos(payload, aviso, { enviar, vapid });
    expect(enviar).toHaveBeenCalledWith(
      { endpoint: "https://push/1", keys: { p256dh: "p1", auth: "a1" } },
      JSON.stringify(aviso),
    );
  });
});
