import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
    // Server Actions do CMS Soberano recebem uploads (capa, folder PDF).
    // Folders "Nova Data" de 2026 chegam a 14 MB; 20 MB dá folga. A coleção
    // Media (Payload) valida o mimeType. Espelho do apps/web/next.config.ts.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default withPayload(nextConfig);
