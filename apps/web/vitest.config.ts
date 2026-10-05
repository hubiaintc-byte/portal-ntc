import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["**/*.test.ts"], environment: "node" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // payloadClient.ts importa "@ntc/cms/payload.config" (o payload.config.ts
      // real da cms, que conecta Postgres/S3 via buildConfig) só para repassar
      // a getPayload(); os testes puros mockam "./payloadClient" diretamente
      // (vi.mock) e nunca deveriam avaliar essa cadeia — o stub evita I/O e
      // dependência de env vars caso um teste futuro esqueça o mock.
      "@ntc/cms/payload.config": fileURLToPath(
        new URL("./lib/testes/payload-config-stub.ts", import.meta.url),
      ),
      // Módulos server-only (ex.: storeRateLimit.ts) importam "server-only"
      // por efeito colateral; o pacote real explode fora do runtime do React
      // Server Components. Stub vazio deixa o import inofensivo no Vitest.
      "server-only": fileURLToPath(new URL("./lib/testes/server-only-stub.ts", import.meta.url)),
    },
  },
});
