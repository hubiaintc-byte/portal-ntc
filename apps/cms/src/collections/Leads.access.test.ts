import { describe, expect, it } from "vitest";

import { Leads } from "./Leads";

/**
 * O `create` de `leads` era público (formulários do site via REST). Desde a
 * Sessão 1 do kanban os campos do CRM e os hooks de casamento/linha do tempo
 * ficam alcançáveis pelo create, então ele passou a exigir perfil do CRM. Os
 * handlers do site continuam funcionando porque usam a Local API com
 * `overrideAccess: true` (padrão), que não consulta esta regra.
 */
function create(user: { perfil: string } | null): boolean | Promise<boolean> | object {
  const fn = Leads.access?.create;
  if (typeof fn !== "function") throw new Error("Leads.access.create ausente");
  return fn({ req: { user } } as never);
}

describe("Leads.access.create", () => {
  it("nega anônimo (REST público não cria mais lead)", () => {
    expect(create(null)).toBe(false);
  });

  it("nega perfis fora do CRM", () => {
    expect(create({ perfil: "editor-institucional" })).toBe(false);
    expect(create({ perfil: "editor-eventos" })).toBe(false);
  });

  it("permite atendimento-comercial e super-admin", () => {
    expect(create({ perfil: "atendimento-comercial" })).toBe(true);
    expect(create({ perfil: "super-admin" })).toBe(true);
  });
});
