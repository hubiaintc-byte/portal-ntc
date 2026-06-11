import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
    // Server Actions do Painel Admin recebem uploads (capa, folder PDF).
    // Folders "Nova Data" de 2026 chegam a 14 MB; 20 MB dá folga. A coleção
    // Media (Payload) valida o mimeType. Espelho do apps/web/next.config.ts.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // A UI do admin Payload foi removida; quem ainda tem /admin no favorito
  // cai no login do painel.
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: "/entrar",
        permanent: false,
      },
    ];
  },
};

export default withPayload(nextConfig);
