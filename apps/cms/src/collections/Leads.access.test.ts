import { describe, expect, it } from "vitest";

import { Leads } from "./Leads";

/**
 * O `create` de `leads` era público (formulários do site via REST). Desde a
 * Sessão 1 do kanban os campos do CRM e os hooks de casamento/linha do tempo
 * ficam alcançáveis pelo create, então ele passou a exigir tela de Leads. Os
 * handlers do site continuam funcionando porque usam a Local API com
 * `overrideAccess: true` (padrão), que não consulta esta regra.
 */
function create(
  user: { administrador?: boolean; telas?: string[] } | null,
): boolean | Promise<boolean> | object {
  const fn = Leads.access?.create;
  if (typeof fn !== "function") throw new Error("Leads.access.create ausente");
  return fn({ req: { user } } as never);
}

describe("Leads.access.create", () => {
  it("nega anônimo (REST público não cria mais lead)", () => {
    expect(create(null)).toBe(false);
  });

  it("nega quem não tem Leads/Dashboard", () => {
    expect(create({ telas: ["site.eventos"] })).toBe(false);
    expect(create({ telas: ["crm.clientes"] })).toBe(false);
  });

  it("permite quem tem Leads ou Dashboard e o administrador", () => {
    expect(create({ telas: ["crm.leads"] })).toBe(true);
    expect(create({ telas: ["crm.dashboard"] })).toBe(true);
    expect(create({ administrador: true })).toBe(true);
  });
});
