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
 * CSP do site. Origens externas usadas de fato: Turnstile (script, iframe e
 * siteverify do widget), o mapa do Google em /contato (iframe) e o Supabase
 * Storage (imagens e folders do CMS). `'unsafe-inline'` em script fica até
 * haver nonce — o Next injeta scripts inline de hidratação.
 */
const cspSite = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com${emDev ? " ws: wss:" : ""}`,
  "frame-src https://challenges.cloudflare.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(emDev ? [] : ["upgrade-insecure-requests"]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosSeguranca(cspSite, "SAMEORIGIN") }];
  },
  reactStrictMode: true,
  transpilePackages: ["@ntc/ui", "@ntc/lib", "@ntc/types"],
  // Payload 3 + Next 15: estes pacotes server-only devem ficar fora do
  // bundle do webpack (resolvidos via require() no runtime do Node).
  // Sem isto, `sharp` quebra a fase "Collecting page data" ao importar
  // o payload.config em route handlers.
  serverExternalPackages: ["sharp", "payload", "@payloadcms/db-postgres", "@payloadcms/next"],
  // Next 15.5: saiu de `experimental` para o topo da config.
  typedRoutes: true,
  experimental: {
    // Server Actions do protótipo CMS recebem uploads (capa, folder PDF). O
    // default de 1 MB estoura com fotos de capa; os folders "Nova Data" de
    // 2026 chegam a 14 MB, então 20 MB dá folga. A coleção Media (Payload)
    // valida o mimeType.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      // Supabase Storage público (qualquer projeto *.supabase.co/storage/v1/object/public/*).
      // O bucket é resolvido em runtime pelo generateFileURL do storage-s3.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async redirects() {
    return [
      {
        // CTAs dos programas apontam para /contato/proposta?programa=...
        // Rota não existe; cai em /contato preservando a query (307).
        source: "/contato/proposta",
        destination: "/contato",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
