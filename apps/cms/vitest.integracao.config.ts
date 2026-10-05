import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Vitest de integração — bate no banco e no site de verdade.
 *
 * Diferença para o `vitest.config.ts`: aqui `@payload-config` resolve para a
 * config REAL (Postgres/S3), não para o stub. É o que permite exercitar
 * `salvarConteudoCms`/`publicarConteudoCms` de verdade, em vez de reimplementar
 * o que elas fazem. O stub de `server-only` continua, porque esses módulos são
 * server-only do Next e fora do runtime dele o especificador não resolve.
 *
 * Não roda no `pnpm test` normal: exige banco e `pnpm dev` no ar.
 *   pnpm --filter @ntc/cms test:integracao
 */
export default defineConfig({
  test: {
    include: ["src/**/*.integracao.test.ts"],
    environment: "node",
    setupFiles: ["./src/lib/testes/carregar-env.ts"],
    // Escreve no banco: sequencial e sem timeout curto.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/lib/testes/server-only-stub.ts", import.meta.url)),
      // O Next resolve este especificador por alias próprio; fora dele,
      // apontamos para a config real — é o que liga o teste ao Postgres.
      "@payload-config": fileURLToPath(new URL("./src/payload.config.ts", import.meta.url)),
    },
  },
});
