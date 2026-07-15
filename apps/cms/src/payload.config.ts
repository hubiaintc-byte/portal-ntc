import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { pt } from "@payloadcms/translations/languages/pt";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Areas } from "./collections/Areas";
import { AuditLog } from "./collections/AuditLog";
import { ClientesCrm } from "./collections/ClientesCrm";
import { Clientes } from "./collections/Clientes";
import { ContatosCrm } from "./collections/ContatosCrm";
import { Conteudos } from "./collections/Conteudos";
import { Especialistas } from "./collections/Especialistas";
import { Eventos } from "./collections/Eventos";
import { Leads } from "./collections/Leads";
import { Media } from "./collections/Media";
import { Modulos } from "./collections/Modulos";
import { Oportunidades } from "./collections/Oportunidades";
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
// EMAIL_REMETENTE no formato 'Nome <email@dominio>'. Sem RESEND_API_KEY o
// Payload mantém o comportamento default (e-mail logado no console) — dev
// continua testável e nada quebra em prod até a chave existir.
const remetente = process.env.EMAIL_REMETENTE ?? "Painel NTC <nao-responda@institutontc.com.br>";
const mRemetente = remetente.match(/^(.*)<([^>]+)>\s*$/);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: mRemetente?.[2]?.trim() ?? remetente,
          defaultFromName: mRemetente?.[1]?.trim() ?? "Painel NTC",
        }),
      }
    : {}),
  // A UI do admin Payload foi removida — o painel próprio em / (route group
  // (painel)) é o único admin. `user` continua definindo a collection de
  // autenticação usada por payload.login()/payload.auth().
  admin: {
    user: Users.slug,
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
    ClientesCrm,
    ContatosCrm,
    Oportunidades,
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
    // push desabilitado: o dev-mode do drizzle re-puxa o schema do banco
    // remoto a cada request do Next (segundos por página) e um push
    // acidental pode descartar dados. Migrações de schema são manuais.
    push: false,
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
