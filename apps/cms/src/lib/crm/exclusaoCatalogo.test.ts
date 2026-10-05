import { describe, expect, it, vi } from "vitest";

import {
  bloquearModuloComDependentes,
  bloquearProgramaComDependentes,
  contarDependentesModulo,
  contarDependentesPrograma,
} from "./exclusaoCatalogo";

function payloadComContagens(por: Record<string, number>) {
  const count = vi.fn(async ({ collection }: { collection: string }) => ({ totalDocs: por[collection] ?? 0 }));
  return { count };
}

type Hook = (args: Record<string, unknown>) => Promise<void>;

describe("contarDependentesPrograma", () => {
  it("conta as cinco coleções com o where certo", async () => {
    const payload = payloadComContagens({ modulos: 2, propostas: 1, leads: 0, eventos: 3, especialistas: 1 });
    const d = await contarDependentesPrograma(payload as never, 7);
    expect(d).toEqual({ modulos: 2, propostas: 1, leads: 0, eventos: 3, especialistas: 1 });
    expect(payload.count).toHaveBeenCalledWith(expect.objectContaining({ collection: "modulos", where: { programa: { equals: 7 } } }));
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "especialistas", where: { programasRelacionados: { equals: 7 } } }),
    );
    // Em leads, `programa` mora no grupo `detalhesProposta` — o caminho na raiz
    // dá QueryError e derrubava a abertura do detalhe do programa.
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "leads", where: { "detalhesProposta.programa": { equals: 7 } } }),
    );
  });
});

describe("contarDependentesModulo", () => {
  it("proposta conta por modulos OU modulosDetalhados.modulo", async () => {
    const payload = payloadComContagens({ propostas: 1, "eventos-comerciais": 2 });
    expect(await contarDependentesModulo(payload as never, 9)).toEqual({ propostas: 1, eventosComerciais: 2 });
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "propostas",
        where: { or: [{ modulos: { equals: 9 } }, { "modulosDetalhados.modulo": { equals: 9 } }] },
      }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "eventos-comerciais", where: { moduloCatalogo: { equals: 9 } } }),
    );
  });
});

describe("hooks beforeDelete", () => {
  it("programa sem dependentes passa", async () => {
    const payload = payloadComContagens({});
    await expect((bloquearProgramaComDependentes as unknown as Hook)({ id: 1, req: { payload } })).resolves.toBeUndefined();
  });
  it("programa com módulo falha fechado com a mensagem da regra", async () => {
    const payload = payloadComContagens({ modulos: 1 });
    await expect((bloquearProgramaComDependentes as unknown as Hook)({ id: 1, req: { payload } })).rejects.toThrow(
      "Vinculado a 1 módulo — exclua ou desvincule antes.",
    );
  });
  it("módulo usado em proposta falha fechado", async () => {
    const payload = payloadComContagens({ propostas: 1 });
    await expect((bloquearModuloComDependentes as unknown as Hook)({ id: 1, req: { payload } })).rejects.toThrow(
      "Usado em 1 proposta — não pode ser excluído.",
    );
  });
});
