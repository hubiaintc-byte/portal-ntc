import { beforeEach, describe, expect, it, vi } from "vitest";

// `route.ts` faz `import { revalidatePath } from "next/cache"` estaticamente,
// então a factory deste mock roda ANTES de `const revalidatePath = vi.fn()`
// executar (TDZ: "Cannot access 'revalidatePath' before initialization") —
// interação normal entre semântica de módulos ES e o hoisting do `vi.mock`
// do Vitest, não um bug do framework. O teste-irmão em
// painelCmsEscrita.contatos.test.ts escapa dessa ordem com a forma ingênua
// porque `obterPayload()` só é invocado de forma preguiçosa, dentro de um
// corpo assíncrono — a referência à const nunca é avaliada antes dela
// existir. vi.hoisted() é a forma documentada de expor a variável à factory
// hoistada quando o import estático força essa ordem.
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
