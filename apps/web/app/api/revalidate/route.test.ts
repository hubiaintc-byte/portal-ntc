import { beforeEach, describe, expect, it, vi } from "vitest";

// "next/cache" é um pacote externalizado (node_modules), não um arquivo do
// projeto transformado pelo Vite — o mock não tolera a referência ingênua a
// uma const de fora da factory (TDZ: "Cannot access 'revalidatePath' before
// initialization"), diferente do padrão usado para módulos locais (ex.:
// "@/lib/payloadClient" em painelCmsEscrita.contatos.test.ts). vi.hoisted()
// é a forma correta e documentada de expor a variável à factory hoistada.
const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { POST } from "./route";

function requisicao(body: unknown, segredo = "segredo-de-teste"): Request {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Revalidate-Secret": segredo },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  revalidatePath.mockReset();
  process.env.REVALIDATE_SECRET = "segredo-de-teste";
});

describe("POST /api/revalidate", () => {
  it("revalida um caminho como antes", async () => {
    const res = await POST(requisicao({ path: "/conteudos" }));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/conteudos");
  });

  it('com escopo "layout" revalida o site inteiro', async () => {
    const res = await POST(requisicao({ path: "/", escopo: "layout" }));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("recusa sem o segredo", async () => {
    const res = await POST(requisicao({ path: "/", escopo: "layout" }, "errado"));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("recusa escopo desconhecido", async () => {
    const res = await POST(requisicao({ path: "/", escopo: "tudo" }));
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
