import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Os testes de integração batem em Postgres e no site no ar; rodam
    // pelo `test:integracao`, com config própria. Sem esta exclusão o
    // `pnpm test` os coletaria (o nome termina em `.test.ts`) e eles
    // falhariam contra o stub de @payload-config.
    exclude: ["**/node_modules/**", "src/**/*.integracao.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // painelCrmEscrita.ts (e outras libs server-only) importam "server-only"
      // por efeito colateral; o pacote real explode fora do runtime do React
      // Server Components. Stub vazio deixa o import inofensivo no Vitest.
      "server-only": fileURLToPath(new URL("./src/lib/testes/server-only-stub.ts", import.meta.url)),
      // payloadClient.ts importa "@payload-config" (payload.config.ts real,
      // que conecta Postgres/S3 via buildConfig) só para repassar a
      // getPayload(); os testes puros nunca chamam obterPayload(), então um
      // stub vazio evita I/O e dependência de env vars no Vitest.
      "@payload-config": fileURLToPath(new URL("./src/lib/testes/payload-config-stub.ts", import.meta.url)),
    },
  },
});
