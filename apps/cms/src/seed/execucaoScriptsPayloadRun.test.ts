import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Sob Payload 3.90 o `payload run` espera só o import do script e chama
 * `process.exit(0)` em seguida: um `void main()` de topo sai 0 sem rodar.
 * Os scripts abaixo precisam do `await main()` de topo.
 */
const SCRIPTS = ["migrarPermissoesPorTela.ts", "importarProgramas.ts"];

describe("scripts executados por payload run", () => {
  it.each(SCRIPTS)("%s espera main() no topo", (arquivo) => {
    const fonte = readFileSync(join(__dirname, arquivo), "utf8");
    expect(fonte).not.toMatch(/^\s*void main\(/m);
    expect(fonte).toMatch(/^\s*await main\(\);/m);
  });
});
