import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { pt } from "@payloadcms/translations/languages/pt";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Areas } from "./collections/Areas";
import { AuditLog } from "./collections/AuditLog";
import { Clientes } from "./collections/Clientes";
import { Conteudos } from "./collections/Conteudos";
import { Especialistas } from "./collections/Especialistas";
import { Eventos } from "./collections/Eventos";
import { Leads } from "./collections/Leads";
import { Media } from "./collections/Media";
import { Modulos } from "./collections/Modulos";
import { Programas } from "./collections/Programas";
import { Users } from "./collections/Users";
import { CorpoDocente } from "./globals/CorpoDocente";
import { Home } from "./globals/Home";
import { OGrupo } from "./globals/OGrupo";
import { Rodape } from "./globals/Rodape";
import { lexicalRestrictiveFeatures } from "./shared/lexical-config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const bucket = process.env.SUPABASE_BUCKET || "ntc-portal-media";

/**
 * Configuração do Payload 3 — Portal Grupo NTC · Sprint F.
 *
 * Banco: Supabase Postgres SP (sa-east-1) via pooler PgBouncer porta 6543.
 * Mídia: Supabase Storage via endpoint S3-compatible.
 * Editor: Lexical restritivo (sem cores/fontes editáveis pelo editor).
 *
 * Coleções editoriais (Area, Programa, Modulo, Evento, Especialista, Conteudo,
 * Cliente) e operacionais (Lead, AuditLog) + Globals (Home, Rodape) conforme
 * docs/11_Schema_Payload_CMS_v1.md §§4-14.
 */
export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: " · Admin Grupo NTC",
      icons: [
        {
          rel: "icon",
          type: "image/svg+xml",
          url: "/favicon.svg",
        },
      ],
    },
    components: {
      graphics: {
        Logo: "@/components/admin/LogoNTC#LogoNTC",
        Icon: "@/components/admin/IconNTC#IconNTC",
      },
      // Injeta as fontes Soberana auto-hospedadas (Cormorant + Barlow) via
      // next/font, substituindo o @import do Google que ficava em custom.scss
      // (CLAUDE.md §3/§11 — auto-hospedadas, sem ping externo).
      providers: ["@/components/admin/FonteProvider#FonteProvider"],
    },
  },
  i18n: {
    fallbackLanguage: "pt",
    supportedLanguages: { pt, en },
  },
  collections: [
    Users,
    Media,
    Areas,
    Programas,
    Modulos,
    Eventos,
    Especialistas,
    Conteudos,
    Clientes,
    Leads,
    AuditLog,
  ],
  globals: [Home, OGrupo, CorpoDocente, Rodape],
  editor: lexicalEditor({ features: () => lexicalRestrictiveFeatures }),
  sharp,
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "../../../packages/types/src/payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, "generated-schema.graphql"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
          // disableLocalStorage: os arquivos vivem SÓ no Supabase Storage,
          // não há cópia em apps/cms/media/. Sem isto, o admin tenta servir
          // as variantes do disco local (que não existem) e responde 500
          // em GET /api/media/file/X-400x460.png — embora o upload ao
          // Supabase tenha sido bem-sucedido. Com isto, admin e front usam
          // a URL pública via generateFileURL.
          disableLocalStorage: true,
          // disablePayloadAccessControl: o Payload deixa de servir
          // /api/media/file/X e o front consome a URL pública do
          // Supabase Storage direto. O bucket ntc-portal-media é
          // público para leitura.
          disablePayloadAccessControl: true,
          // generateFileURL: o adapter padrão devolve a URL do
          // endpoint S3 (.../storage/v1/s3/...) que requer assinatura.
          // O Supabase expõe um endpoint público em
          // .../storage/v1/object/public/<bucket>/<path> — usamos esse
          // para que <Image src> funcione no front sem assinar.
          generateFileURL: ({ filename, prefix }) => {
            const supabaseUrl = process.env.SUPABASE_URL ?? "";
            const bucketName = process.env.SUPABASE_BUCKET || "ntc-portal-media";
            const fullPath = prefix ? `${prefix}/${filename}` : filename;
            return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fullPath}`;
          },
        },
      },
      bucket,
      config: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT || "",
        region: process.env.SUPABASE_S3_REGION || "sa-east-1",
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || "",
        },
        forcePathStyle: true,
      },
    }),
  ],
});
