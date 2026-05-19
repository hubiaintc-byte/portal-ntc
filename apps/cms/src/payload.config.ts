import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";

import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const bucket = process.env.SUPABASE_BUCKET || "ntc-portal-media";

/**
 * Configuração mínima do Payload 3 para a Sprint F · Janela A.
 *
 * Banco: Supabase Postgres SP via pooler PgBouncer (porta 6543).
 * Mídia: Supabase Storage via endpoint S3-compatible — adapter genérico
 * @payloadcms/storage-s3 facilita troca de provedor no futuro (DAB §3).
 *
 * Coleções editoriais (Area, Programa, Evento, Especialista, Conteudo,
 * Cliente, Lead) e Globals (Home, Rodape) entram nas próximas janelas
 * conforme docs/11_Schema_Payload_CMS_v1.md.
 */
export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
      },
      fields: [],
    },
    Media,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
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
