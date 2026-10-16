import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";


const emDev = process.env.NODE_ENV !== "production";

/** Cabeçalhos de segurança comuns (auditoria de 07/10/2026). */
function cabecalhosSeguranca(csp: string[], molduraPermitida: "DENY" | "SAMEORIGIN") {
  return [
    { key: "Content-Security-Policy", value: csp.join("; ") },
    { key: "X-Frame-Options", value: molduraPermitida },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ];
}

/**
 * CSP do painel: nada de terceiros além das imagens do Supabase Storage
 * (capas, fotos). Ninguém pode emoldurar o painel (clickjacking). A rota de
 * diagnóstico do documento da proposta acrescenta a própria CSP, mais
 * restrita — as duas valem juntas.
 */
const cspPainel = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self'${emDev ? " ws: wss:" : ""}`,
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(emDev ? [] : ["upgrade-insecure-requests"]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosSeguranca(cspPainel, "DENY") }];
  },
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
