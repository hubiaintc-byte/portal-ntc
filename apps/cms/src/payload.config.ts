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
import { Clientes } from "./collections/Clientes";
import { Conteudos } from "./collections/Conteudos";
import { Especialistas } from "./collections/Especialistas";
import { Eventos } from "./collections/Eventos";
import { Media } from "./collections/Media";
import { Modulos } from "./collections/Modulos";
import { Programas } from "./collections/Programas";
import { Users } from "./collections/Users";
import { lexicalRestrictiveFeatures } from "./shared/lexical-config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const bucket = process.env.SUPABASE_BUCKET || "ntc-portal-media";

/**
 * Configuração do Payload 3 — Portal Grupo NTC · Sprint F · Janela A.
 *
 * Banco: Supabase Postgres SP (sa-east-1) via pooler PgBouncer porta 6543.
 * Mídia: Supabase Storage via endpoint S3-compatible.
 * Editor: Lexical restritivo (sem cores/fontes editáveis pelo editor).
 *
 * Coleções editoriais (Area, Programa, Modulo, Evento, Especialista, Conteudo,
 * Cliente, Lead, AuditLog) e Globals (Home, Rodape) entram nas próximas
 * janelas conforme docs/11_Schema_Payload_CMS_v1.md (Seções 4-14).
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
  ],
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
