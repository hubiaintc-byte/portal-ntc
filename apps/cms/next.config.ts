import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Motor de PDF (CRM Fase B2): pacotes com binário nativo — o bundler/
  // tracer do Next não deve tentar empacotá-los, só deixá-los externos.
  // Chave estável do Next 15 (não é `experimental.serverComponentsExternalPackages`).
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium", "playwright"],
  // Next 16: saiu de `experimental` para o topo da config.
  reactCompiler: false,
  // Next 16: sem isto o `next dev` cria/reescreve um AGENTS.md em apps/cms.
  // As instruções para agentes deste repositório vivem no CLAUDE.md da raiz.
  agentRules: false,
  experimental: {
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
