import { describe, expect, it } from "vitest";

import { InscricoesAviso } from "./InscricoesAviso";

/**
 * As inscrições de aviso (endpoint + chaves do aparelho) são credenciais de
 * envio: nada de REST, nem para administrador. Leitura e escrita só pela
 * Local API com `overrideAccess`.
 */
const usuarios = {
  administrador: { administrador: true },
  comum: { telas: ["crm.leads"] },
};

describe("InscricoesAviso.access", () => {
  for (const operacao of ["read", "create", "update", "delete"] as const) {
    for (const [nome, user] of Object.entries(usuarios)) {
      it(`${operacao} nega ${nome}`, () => {
        const fn = InscricoesAviso.access?.[operacao];
        if (typeof fn !== "function") throw new Error(`access.${operacao} ausente`);
        expect(fn({ req: { user } } as never)).toBe(false);
      });
    }
  }
});
