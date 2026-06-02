import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ntc/ui", "@ntc/lib", "@ntc/types"],
  // Payload 3 + Next 15: estes pacotes server-only devem ficar fora do
  // bundle do webpack (resolvidos via require() no runtime do Node).
  // Sem isto, `sharp` quebra a fase "Collecting page data" ao importar
  // o payload.config em route handlers.
  serverExternalPackages: ["sharp", "payload", "@payloadcms/db-postgres", "@payloadcms/next"],
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
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
