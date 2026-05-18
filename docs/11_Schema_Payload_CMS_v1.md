# Schema Payload CMS — Portal Grupo NTC
## Documento técnico de modelagem · v1 Enxuto Premium · Sprint F

**Versão:** 1.0 · 15 de maio de 2026
**Companheiro de:** `10_DAB_Backend_Enxuto_GrupoNTC_v1.md`
**Destino:** ser copiado/adaptado pela Claude Code no diretório `apps/cms/src/collections` e `apps/cms/src/globals` do monorepo.

---

## Sumário

1. Princípios de Modelagem
2. Configuração base (`payload.config.ts`)
3. Tipos e enums compartilhados (`shared/types.ts`)
4. Coleção `Areas`
5. Coleção `Programas`
6. Coleção `Modulos`
7. Coleção `Eventos`
8. Coleção `Especialistas`
9. Coleção `Conteudos`
10. Coleção `Clientes`
11. Coleção `Leads`
12. Coleção `AuditLog`
13. Global `Home`
14. Global `Rodape`
15. Blocks editoriais reutilizáveis
16. Access Control reutilizável
17. Hooks reutilizáveis
18. Seed mínimo

---

## 1. Princípios de Modelagem

Cada coleção segue cinco regras que protegem a integridade editorial.

**1.1. Slugs estáveis e legíveis.** Toda coleção pública tem campo `slug` único, derivado automaticamente do título, mas editável manualmente. Usado em URLs (`/programas/proge`, `/eventos/seminario-prosus-brasilia`).

**1.2. Versionamento e draft/publish.** Toda coleção pública tem `versions: { drafts: true }` habilitado. Editor produz, revisor aprova, sistema publica. Histórico preservado.

**1.3. Campos editoriais protegidos.** Campos canônicos (nome, sigla, data, modalidade) são `required` e validados. Campos livres (descrição, mensagem) são `richText` com Lexical configurado restritivamente — sem cores, sem fontes, sem alinhamentos exóticos.

**1.4. Relacionamentos explícitos.** `relationship` typed do Payload, com `hasMany` quando aplicável e `relationTo` explícito. Nunca strings soltas referenciando IDs.

**1.5. SEO embutido.** Toda coleção pública tem um `group` chamado `seo` com `titulo`, `descricao` e `imagemOg`. Renderizado automaticamente pelo helper `<MetadataSoberana>` no front.

---

## 2. Configuração Base

`apps/cms/src/payload.config.ts`

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

import { Areas } from './collections/Areas'
import { Programas } from './collections/Programas'
import { Modulos } from './collections/Modulos'
import { Eventos } from './collections/Eventos'
import { Especialistas } from './collections/Especialistas'
import { Conteudos } from './collections/Conteudos'
import { Clientes } from './collections/Clientes'
import { Leads } from './collections/Leads'
import { AuditLog } from './collections/AuditLog'
import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { Home } from './globals/Home'
import { Rodape } from './globals/Rodape'

import { lexicalRestrictiveConfig } from './shared/lexical-config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' · Admin Grupo NTC',
      favicon: '/favicon-ntc.svg',
      ogImage: '/og-admin.jpg',
    },
    components: {
      graphics: {
        Logo: '/components/admin/LogoNTC',
        Icon: '/components/admin/IconNTC',
      },
    },
  },
  editor: lexicalEditor(lexicalRestrictiveConfig),
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
  globals: [Home, Rodape],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.R2_BUCKET!,
      config: {
        endpoint: process.env.R2_ENDPOINT!,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        region: 'auto',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, '../../web/types/payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
})
```

---

## 3. Tipos e Enums Compartilhados

`apps/cms/src/shared/types.ts`

```typescript
export const AREA_SIGLAS = ['educacao', 'gestao-publica', 'saude'] as const
export type AreaSigla = typeof AREA_SIGLAS[number]

export const MODALIDADE_EVENTO = [
  'online',
  'presencial',
  'hibrido',
] as const
export type ModalidadeEvento = typeof MODALIDADE_EVENTO[number]

export const ESFERA_INSTITUCIONAL = [
  'municipal',
  'estadual',
  'federal',
  'privada',
  'terceiro-setor',
] as const

export const LEAD_TIPO = [
  'proposta',
  'contato',
  'newsletter',
  'candidatura',
] as const

export const LEAD_STATUS = [
  'novo',
  'em-atendimento',
  'qualificado',
  'descartado',
  'convertido',
] as const

export const TITULACAO_DOCENTE = [
  'doutorado',
  'pos-doutorado',
  'mestrado',
  'especializacao',
  'graduacao',
] as const

export const CONTEUDO_CATEGORIA = [
  'artigo',
  'insight',
  'publicacao',
  'material-download',
  'noticia',
] as const
```

`apps/cms/src/shared/lexical-config.ts`

```typescript
import {
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  UnderlineFeature,
  UnorderedListFeature,
  OrderedListFeature,
  ParagraphFeature,
} from '@payloadcms/richtext-lexical'

export const lexicalRestrictiveConfig = {
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    LinkFeature({ enabledCollections: [] }),
    UnorderedListFeature(),
    OrderedListFeature(),
  ],
}
```

Observação: o lexical default do Payload é mais permissivo (cores, fontes, alinhamento). A restrição acima garante que o editor não consegue romper a tipografia Soberana 2026.

---

## 4. Coleção `Areas`

Três instâncias fixas: Educação, Gestão Pública, Saúde. Não permite criação livre.

`apps/cms/src/collections/Areas.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { AREA_SIGLAS } from '../shared/types'
import { authenticated } from '../access/authenticated'
import { editorInstitucional } from '../access/editorInstitucional'
import { seoFields } from '../shared/seoFields'

export const Areas: CollectionConfig = {
  slug: 'areas',
  labels: { singular: 'Área Estratégica', plural: 'Áreas Estratégicas' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'sigla', 'updatedAt'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: () => false, // 3 fixas — nunca apaga
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      name: 'sigla',
      type: 'select',
      options: AREA_SIGLAS.map((s) => ({ label: s, value: s })),
      required: true,
      unique: true,
      admin: { description: 'Identificador interno da área.' },
    },
    { name: 'nome', type: 'text', required: true, label: 'Nome da Área' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow (texto sobrescrito ao título)',
    },
    { name: 'tituloHero', type: 'text', required: true },
    { name: 'subtituloHero', type: 'textarea', required: true },
    { name: 'imagemHero', type: 'upload', relationTo: 'media', required: true },
    { name: 'corAcento', type: 'text', required: true, defaultValue: '#11365E' },
    {
      name: 'posicionamento',
      type: 'richText',
      required: true,
      label: 'Posicionamento editorial da área',
    },
    {
      name: 'numerosImpacto',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'valor', type: 'text', required: true },
        { name: 'rotulo', type: 'text', required: true },
      ],
    },
    {
      name: 'programasDestacados',
      type: 'relationship',
      relationTo: 'programas',
      hasMany: true,
      admin: { description: 'Programas exibidos em destaque na página da área.' },
    },
    ...seoFields,
  ],
}
```

---

## 5. Coleção `Programas`

Quinze instâncias previstas. Schema rico — espelha o template editorial do folder de programa.

`apps/cms/src/collections/Programas.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'
import { autoSlug } from '../hooks/autoSlug'
import { seoFields } from '../shared/seoFields'

export const Programas: CollectionConfig = {
  slug: 'programas',
  labels: { singular: 'Programa Estratégico', plural: 'Programas Estratégicos' },
  admin: {
    useAsTitle: 'nomeCompleto',
    defaultColumns: ['sigla', 'nomeCompleto', 'area', '_status'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: {
    beforeChange: [autoSlug('nomeCompleto')],
  },
  fields: [
    // Identificação
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identificação',
          fields: [
            {
              name: 'sigla',
              type: 'text',
              required: true,
              unique: true,
              admin: { description: 'Ex.: PROGE, EDUTEC, PROSUS+' },
            },
            { name: 'nomeCompleto', type: 'text', required: true },
            { name: 'eyebrow', type: 'text', label: 'Eyebrow editorial' },
            {
              name: 'area',
              type: 'relationship',
              relationTo: 'areas',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: { position: 'sidebar' },
            },
            {
              name: 'imagemCapa',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'lockupSvg',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Lockup SVG vertical do programa.' },
            },
          ],
        },
        {
          label: 'Visão Geral',
          fields: [
            { name: 'cargaHorariaTotal', type: 'text', required: true },
            { name: 'modulosQuantidade', type: 'number' },
            { name: 'visaoGeral', type: 'richText', required: true },
            { name: 'problema', type: 'richText' },
            { name: 'objetivo', type: 'richText' },
            { name: 'publicoAlvo', type: 'richText' },
          ],
        },
        {
          label: 'Eixos e Resultados',
          fields: [
            {
              name: 'eixosTematicos',
              type: 'array',
              fields: [
                { name: 'titulo', type: 'text', required: true },
                { name: 'descricao', type: 'textarea', required: true },
              ],
            },
            {
              name: 'resultadosEsperados',
              type: 'array',
              fields: [
                { name: 'resultado', type: 'textarea', required: true },
              ],
            },
            {
              name: 'diferenciais',
              type: 'array',
              fields: [
                { name: 'titulo', type: 'text', required: true },
                { name: 'descricao', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Coordenação e Docentes',
          fields: [
            {
              name: 'coordenacaoCientifica',
              type: 'relationship',
              relationTo: 'especialistas',
              hasMany: true,
            },
            {
              name: 'docentes',
              type: 'relationship',
              relationTo: 'especialistas',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Modalidades',
          fields: [
            {
              name: 'modalidadesEntrega',
              type: 'array',
              fields: [
                {
                  name: 'tipo',
                  type: 'select',
                  options: ['in-company', 'turma-aberta', 'sob-medida', 'hibrida'],
                  required: true,
                },
                { name: 'descricao', type: 'textarea' },
              ],
            },
            {
              name: 'contratacaoInstitucional',
              type: 'group',
              fields: [
                { name: 'disponivel', type: 'checkbox', defaultValue: true },
                { name: 'observacoes', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'FAQ e Relacionados',
          fields: [
            {
              name: 'faq',
              type: 'array',
              fields: [
                { name: 'pergunta', type: 'text', required: true },
                { name: 'resposta', type: 'richText', required: true },
              ],
            },
            {
              name: 'programasRelacionados',
              type: 'relationship',
              relationTo: 'programas',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
          ],
        },
      ],
    },
    ...seoFields,
  ],
}
```

---

## 6. Coleção `Modulos`

Unidade interna de programa. Sem página pública.

`apps/cms/src/collections/Modulos.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'

export const Modulos: CollectionConfig = {
  slug: 'modulos',
  labels: { singular: 'Módulo', plural: 'Módulos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['numero', 'titulo', 'programa', 'cargaHoraria'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  fields: [
    {
      name: 'programa',
      type: 'relationship',
      relationTo: 'programas',
      required: true,
    },
    { name: 'numero', type: 'number', required: true, min: 1 },
    { name: 'titulo', type: 'text', required: true },
    { name: 'ementa', type: 'richText', required: true },
    { name: 'cargaHoraria', type: 'text' },
    {
      name: 'eventosVinculados',
      type: 'relationship',
      relationTo: 'eventos',
      hasMany: true,
      admin: { description: 'Eventos abertos que derivam deste módulo.' },
    },
  ],
}
```

---

## 7. Coleção `Eventos`

Coração operacional do portal. Esta é a coleção que a equipe mais cadastra.

`apps/cms/src/collections/Eventos.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorEventos } from '../access/editorEventos'
import { autoSlug } from '../hooks/autoSlug'
import { revalidatePage } from '../hooks/revalidatePage'
import { MODALIDADE_EVENTO } from '../shared/types'
import { seoFields } from '../shared/seoFields'

export const Eventos: CollectionConfig = {
  slug: 'eventos',
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'dataInicio', 'modalidade', '_status'],
    group: 'Editorial',
    listSearchableFields: ['nome', 'slug', 'cidade'],
  },
  access: {
    read: () => true,
    create: editorEventos,
    update: editorEventos,
    delete: editorEventos,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeChange: [autoSlug('nome')],
    afterChange: [revalidatePage(['/agenda', '/eventos/:slug'])],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identificação',
          fields: [
            { name: 'nome', type: 'text', required: true },
            { name: 'eyebrow', type: 'text' },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: { position: 'sidebar' },
            },
            {
              name: 'programa',
              type: 'relationship',
              relationTo: 'programas',
              admin: { description: 'Programa do qual o evento deriva (opcional).' },
            },
            {
              name: 'area',
              type: 'relationship',
              relationTo: 'areas',
              required: true,
            },
            {
              name: 'imagemCapa',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          label: 'Data, Local e Modalidade',
          fields: [
            { name: 'dataInicio', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'dataFim', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'fusoHorario', type: 'text', defaultValue: 'America/Sao_Paulo' },
            {
              name: 'modalidade',
              type: 'select',
              options: MODALIDADE_EVENTO.map((m) => ({ label: m, value: m })),
              required: true,
            },
            {
              name: 'local',
              type: 'group',
              admin: {
                condition: (data) => data.modalidade !== 'online',
              },
              fields: [
                { name: 'nomeLocal', type: 'text' },
                { name: 'endereco', type: 'text' },
                { name: 'cidade', type: 'text' },
                { name: 'estado', type: 'text', maxLength: 2 },
              ],
            },
            { name: 'cargaHoraria', type: 'text', required: true },
          ],
        },
        {
          label: 'Conteúdo Editorial',
          fields: [
            { name: 'resumo', type: 'textarea', required: true, maxLength: 280 },
            { name: 'publicoAlvo', type: 'richText' },
            { name: 'objetivos', type: 'richText' },
            { name: 'conteudoProgramatico', type: 'richText' },
            {
              name: 'programacaoDetalhada',
              type: 'array',
              fields: [
                { name: 'horario', type: 'text', required: true },
                { name: 'titulo', type: 'text', required: true },
                { name: 'descricao', type: 'textarea' },
                {
                  name: 'palestrante',
                  type: 'relationship',
                  relationTo: 'especialistas',
                  hasMany: true,
                },
              ],
            },
            {
              name: 'palestrantes',
              type: 'relationship',
              relationTo: 'especialistas',
              hasMany: true,
            },
            { name: 'diferenciais', type: 'array', fields: [{ name: 'titulo', type: 'text' }, { name: 'descricao', type: 'textarea' }] },
          ],
        },
        {
          label: 'Inscrição',
          fields: [
            {
              name: 'inscricaoAberta',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'linkInscricaoExterna',
              type: 'text',
              admin: {
                description: 'URL da plataforma terceira de inscrição (v1).',
              },
            },
            {
              name: 'plataformaTerceira',
              type: 'select',
              options: ['sympla', 'even3', 'eventbrite', 'webinar-atual', 'outra'],
              admin: {
                description: 'Plataforma que processa a inscrição (provisório v1).',
              },
            },
            { name: 'valor', type: 'text', admin: { description: 'Ex.: "Gratuito" · "R$ 480" · "Sob proposta"' } },
            { name: 'vagasLimitadas', type: 'checkbox', defaultValue: false },
            { name: 'totalVagas', type: 'number', admin: { condition: (d) => d.vagasLimitadas } },
            // Reservado para v2 — OTT própria
            {
              name: 'inscricaoNativa',
              type: 'group',
              admin: {
                description: '[Reservado v2 — OTT própria] Ativado quando plataforma própria estiver pronta.',
                hidden: true,
              },
              fields: [
                { name: 'ativa', type: 'checkbox', defaultValue: false },
                { name: 'idEventoOTT', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Pós-evento',
          fields: [
            { name: 'replayDisponivel', type: 'checkbox' },
            { name: 'linkReplay', type: 'text', admin: { condition: (d) => d.replayDisponivel } },
            { name: 'prazoReplay', type: 'date', admin: { condition: (d) => d.replayDisponivel } },
            { name: 'certificadoEmitido', type: 'checkbox' },
            { name: 'observacoesCertificado', type: 'textarea' },
          ],
        },
        {
          label: 'Relacionados e FAQ',
          fields: [
            {
              name: 'eventosRelacionados',
              type: 'relationship',
              relationTo: 'eventos',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
            {
              name: 'faq',
              type: 'array',
              fields: [
                { name: 'pergunta', type: 'text', required: true },
                { name: 'resposta', type: 'richText', required: true },
              ],
            },
          ],
        },
      ],
    },
    ...seoFields,
  ],
}
```

---

## 8. Coleção `Especialistas`

`apps/cms/src/collections/Especialistas.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'
import { autoSlug } from '../hooks/autoSlug'
import { TITULACAO_DOCENTE } from '../shared/types'

export const Especialistas: CollectionConfig = {
  slug: 'especialistas',
  labels: { singular: 'Especialista', plural: 'Especialistas' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'titulacao', 'instituicao'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true },
  hooks: { beforeChange: [autoSlug('nome')] },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'foto', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Proporção 20:23 — conforme skill ntc-palestrantes.' } },
    {
      name: 'titulacao',
      type: 'select',
      options: TITULACAO_DOCENTE.map((t) => ({ label: t, value: t })),
      required: true,
    },
    { name: 'instituicao', type: 'text', required: true },
    { name: 'cargoAtual', type: 'text' },
    { name: 'curriculoCurto', type: 'richText', required: true, admin: { description: '3 a 5 linhas — destaque editorial.' } },
    { name: 'curriculoCompleto', type: 'richText' },
    { name: 'linkLattes', type: 'text' },
    { name: 'linkLinkedin', type: 'text' },
    {
      name: 'linhasAtuacao',
      type: 'relationship',
      relationTo: 'areas',
      hasMany: true,
    },
    // Reservado para v2
    {
      name: 'apresentacaoOTT',
      type: 'group',
      admin: { description: '[Reservado v2 — perfil público na OTT própria]', hidden: true },
      fields: [
        { name: 'ativo', type: 'checkbox', defaultValue: false },
        { name: 'biografiaEstendida', type: 'richText' },
      ],
    },
  ],
}
```

---

## 9. Coleção `Conteudos`

Artigos, insights, publicações, notícias, materiais para download.

`apps/cms/src/collections/Conteudos.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'
import { autoSlug } from '../hooks/autoSlug'
import { seoFields } from '../shared/seoFields'
import { CONTEUDO_CATEGORIA } from '../shared/types'

export const Conteudos: CollectionConfig = {
  slug: 'conteudos',
  labels: { singular: 'Conteúdo', plural: 'Conteúdos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'area', 'dataPublicacao', '_status'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { beforeChange: [autoSlug('titulo')] },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    {
      name: 'categoria',
      type: 'select',
      options: CONTEUDO_CATEGORIA.map((c) => ({ label: c, value: c })),
      required: true,
    },
    { name: 'area', type: 'relationship', relationTo: 'areas' },
    { name: 'lide', type: 'textarea', required: true, maxLength: 280 },
    { name: 'imagemDestaque', type: 'upload', relationTo: 'media', required: true },
    { name: 'corpo', type: 'richText', required: true },
    {
      name: 'autor',
      type: 'relationship',
      relationTo: 'especialistas',
      hasMany: true,
    },
    { name: 'dataPublicacao', type: 'date', required: true, defaultValue: () => new Date() },
    {
      name: 'anexoDownload',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (d) => d.categoria === 'material-download' || d.categoria === 'publicacao' },
    },
    {
      name: 'conteudosRelacionados',
      type: 'relationship',
      relationTo: 'conteudos',
      hasMany: true,
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
    },
    ...seoFields,
  ],
}
```

---

## 10. Coleção `Clientes`

Instituições atendidas para vitrine de credibilidade.

`apps/cms/src/collections/Clientes.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'
import { ESFERA_INSTITUCIONAL } from '../shared/types'

export const Clientes: CollectionConfig = {
  slug: 'clientes',
  labels: { singular: 'Cliente / Instituição', plural: 'Clientes / Instituições' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'esfera', 'estado'],
    group: 'Editorial',
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'esfera',
      type: 'select',
      options: ESFERA_INSTITUCIONAL.map((e) => ({ label: e, value: e })),
      required: true,
    },
    { name: 'estado', type: 'text', maxLength: 2 },
    { name: 'cidade', type: 'text' },
    {
      name: 'areasAtendidas',
      type: 'relationship',
      relationTo: 'areas',
      hasMany: true,
    },
    { name: 'descricaoBreve', type: 'textarea' },
    { name: 'destaqueHome', type: 'checkbox', defaultValue: false },
    { name: 'ordem', type: 'number', defaultValue: 100 },
  ],
}
```

---

## 11. Coleção `Leads`

Persiste todos os submits dos quatro formulários. Discriminator por `tipo`.

`apps/cms/src/collections/Leads.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { atendimentoComercial } from '../access/atendimentoComercial'
import { LEAD_TIPO, LEAD_STATUS, ESFERA_INSTITUCIONAL } from '../shared/types'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'identificacao',
    defaultColumns: ['identificacao', 'tipo', 'status', 'createdAt'],
    group: 'Comercial',
    listSearchableFields: ['email', 'nome', 'instituicao'],
  },
  access: {
    read: atendimentoComercial,
    create: () => true, // submissão pública via API com rate limit
    update: atendimentoComercial,
    delete: atendimentoComercial,
  },
  fields: [
    {
      name: 'tipo',
      type: 'select',
      options: LEAD_TIPO.map((t) => ({ label: t, value: t })),
      required: true,
      admin: { readOnly: true },
    },
    { name: 'identificacao', type: 'text', admin: { hidden: true } }, // virtual via hook
    {
      name: 'status',
      type: 'select',
      options: LEAD_STATUS.map((s) => ({ label: s, value: s })),
      defaultValue: 'novo',
      required: true,
    },
    { name: 'observacoesInternas', type: 'textarea' },
    // Campos comuns
    { name: 'nome', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'telefone', type: 'text' },
    { name: 'cargo', type: 'text' },
    { name: 'instituicao', type: 'text' },
    {
      name: 'esfera',
      type: 'select',
      options: ESFERA_INSTITUCIONAL.map((e) => ({ label: e, value: e })),
    },
    // Campos específicos por tipo
    {
      name: 'detalhesProposta',
      type: 'group',
      admin: { condition: (d) => d.tipo === 'proposta' },
      fields: [
        { name: 'programa', type: 'relationship', relationTo: 'programas' },
        {
          name: 'modalidade',
          type: 'select',
          options: ['in-company', 'turma-aberta', 'sob-medida', 'proposta-livre'],
        },
        { name: 'participantesEstimados', type: 'number' },
        { name: 'mensagem', type: 'textarea' },
      ],
    },
    {
      name: 'detalhesContato',
      type: 'group',
      admin: { condition: (d) => d.tipo === 'contato' },
      fields: [
        {
          name: 'assunto',
          type: 'select',
          options: ['imprensa', 'parcerias', 'fornecedor', 'duvida-institucional', 'outro'],
        },
        { name: 'mensagem', type: 'textarea' },
      ],
    },
    {
      name: 'detalhesNewsletter',
      type: 'group',
      admin: { condition: (d) => d.tipo === 'newsletter' },
      fields: [
        { name: 'areasInteresse', type: 'relationship', relationTo: 'areas', hasMany: true },
      ],
    },
    {
      name: 'detalhesCandidatura',
      type: 'group',
      admin: { condition: (d) => d.tipo === 'candidatura' },
      fields: [
        { name: 'titulacao', type: 'text' },
        { name: 'linhasAtuacao', type: 'relationship', relationTo: 'areas', hasMany: true },
        { name: 'apresentacao', type: 'textarea' },
        { name: 'linkLattes', type: 'text' },
        { name: 'linkLinkedin', type: 'text' },
        { name: 'curriculo', type: 'upload', relationTo: 'media' },
      ],
    },
    // Origem
    {
      name: 'origem',
      type: 'group',
      fields: [
        { name: 'paginaSubmissao', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        { name: 'utmTerm', type: 'text' },
        { name: 'utmContent', type: 'text' },
      ],
    },
    // LGPD
    {
      name: 'consentimentoLgpd',
      type: 'group',
      fields: [
        { name: 'aceito', type: 'checkbox', required: true },
        { name: 'timestamp', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'politicaVersao', type: 'text' },
        { name: 'ipSubmissao', type: 'text' },
      ],
    },
    // Sincronização CRM
    {
      name: 'sincronizacaoCrm',
      type: 'group',
      admin: { description: 'Status da integração com RD Station.' },
      fields: [
        { name: 'pendente', type: 'checkbox', defaultValue: true },
        { name: 'tentativas', type: 'number', defaultValue: 0 },
        { name: 'ultimaTentativa', type: 'date' },
        { name: 'erroUltimaTentativa', type: 'textarea' },
        { name: 'idConversaoRd', type: 'text' },
      ],
    },
    // Payload bruto (auditoria)
    { name: 'payloadBruto', type: 'json', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // gera identificação editorial: "Nome · Instituição · Tipo"
        data.identificacao = `${data.nome} · ${data.instituicao || '—'} · ${data.tipo}`
        return data
      },
    ],
  },
}
```

---

## 12. Coleção `AuditLog`

Registro de ações administrativas. Read-only para a maioria dos perfis.

`apps/cms/src/collections/AuditLog.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { superAdmin } from '../access/superAdmin'

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Log de Auditoria', plural: 'Logs de Auditoria' },
  admin: {
    useAsTitle: 'descricao',
    defaultColumns: ['createdAt', 'usuario', 'acao', 'entidade'],
    group: 'Sistema',
  },
  access: {
    read: superAdmin,
    create: () => false, // somente via hook interno
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'usuario', type: 'relationship', relationTo: 'users' },
    { name: 'acao', type: 'select', options: ['criar', 'atualizar', 'publicar', 'despublicar', 'deletar', 'login', 'logout'] },
    { name: 'entidade', type: 'text' },
    { name: 'entidadeId', type: 'text' },
    { name: 'descricao', type: 'text' },
    { name: 'metadata', type: 'json' },
    { name: 'ip', type: 'text' },
  ],
}
```

---

## 13. Global `Home`

`apps/cms/src/globals/Home.ts`

```typescript
import type { GlobalConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home (Página Inicial)',
  admin: { group: 'Páginas Singleton' },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'titulo', type: 'text', required: true },
        { name: 'subtitulo', type: 'textarea' },
        { name: 'imagem', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'ctas',
          type: 'array',
          maxRows: 2,
          fields: [
            { name: 'rotulo', type: 'text', required: true },
            { name: 'link', type: 'text', required: true },
            { name: 'variante', type: 'select', options: ['primario', 'secundario'] },
          ],
        },
      ],
    },
    {
      name: 'destaquesEditoriais',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'titulo', type: 'text', required: true },
        { name: 'resumo', type: 'textarea', required: true },
        { name: 'imagem', type: 'upload', relationTo: 'media', required: true },
        { name: 'link', type: 'text', required: true },
        { name: 'eyebrow', type: 'text' },
      ],
    },
    {
      name: 'areasEmFoco',
      type: 'relationship',
      relationTo: 'areas',
      hasMany: true,
      maxRows: 3,
    },
    {
      name: 'eventosAgendaDestaque',
      type: 'relationship',
      relationTo: 'eventos',
      hasMany: true,
      maxRows: 6,
      admin: { description: 'Eventos exibidos na seção de agenda da Home.' },
    },
    {
      name: 'numerosImpacto',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'valor', type: 'text', required: true },
        { name: 'rotulo', type: 'text', required: true },
      ],
    },
    {
      name: 'clientesDestaque',
      type: 'relationship',
      relationTo: 'clientes',
      hasMany: true,
    },
    {
      name: 'ctaInstitucional',
      type: 'group',
      fields: [
        { name: 'titulo', type: 'text' },
        { name: 'descricao', type: 'textarea' },
        { name: 'rotuloCta', type: 'text' },
        { name: 'linkCta', type: 'text' },
      ],
    },
  ],
}
```

---

## 14. Global `Rodape`

`apps/cms/src/globals/Rodape.ts`

```typescript
import type { GlobalConfig } from 'payload'
import { editorInstitucional } from '../access/editorInstitucional'

export const Rodape: GlobalConfig = {
  slug: 'rodape',
  label: 'Rodapé Institucional',
  admin: { group: 'Páginas Singleton' },
  access: { read: () => true, update: editorInstitucional },
  fields: [
    { name: 'assinaturaInstitucional', type: 'text', defaultValue: 'Inteligência institucional. Impacto real.' },
    { name: 'enderecoCompleto', type: 'textarea' },
    { name: 'emailInstitucional', type: 'email', required: true },
    { name: 'emailImprensa', type: 'email' },
    { name: 'emailParcerias', type: 'email' },
    { name: 'emailDpo', type: 'email' },
    { name: 'telefoneInstitucional', type: 'text' },
    { name: 'whatsappInstitucional', type: 'text' },
    {
      name: 'redesSociais',
      type: 'array',
      fields: [
        { name: 'rede', type: 'select', options: ['linkedin', 'instagram', 'youtube', 'facebook', 'x', 'tiktok'] },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'linksLegais',
      type: 'array',
      fields: [
        { name: 'rotulo', type: 'text', required: true },
        { name: 'link', type: 'text', required: true },
      ],
      defaultValue: [
        { rotulo: 'Política de Privacidade', link: '/politica-de-privacidade' },
        { rotulo: 'Termos de Uso', link: '/termos-de-uso' },
        { rotulo: 'LGPD — Solicitar Exclusão', link: '/lgpd/solicitar-exclusao' },
      ],
    },
    { name: 'cnpj', type: 'text' },
    { name: 'razaoSocial', type: 'text' },
  ],
}
```

---

## 15. Blocks Editoriais Reutilizáveis

Para páginas que precisem de composição editorial controlada (sem comprometer identidade), criam-se Blocks reutilizáveis.

`apps/cms/src/blocks/index.ts`

```typescript
import type { Block } from 'payload'

export const blocoTexto: Block = {
  slug: 'blocoTexto',
  labels: { singular: 'Bloco · Texto', plural: 'Blocos · Texto' },
  fields: [
    { name: 'titulo', type: 'text' },
    { name: 'corpo', type: 'richText', required: true },
  ],
}

export const blocoCitacao: Block = {
  slug: 'blocoCitacao',
  labels: { singular: 'Bloco · Citação', plural: 'Blocos · Citação' },
  fields: [
    { name: 'citacao', type: 'textarea', required: true },
    { name: 'autoria', type: 'text', required: true },
  ],
}

export const blocoImagemLegenda: Block = {
  slug: 'blocoImagemLegenda',
  labels: { singular: 'Bloco · Imagem com Legenda', plural: 'Blocos · Imagem com Legenda' },
  fields: [
    { name: 'imagem', type: 'upload', relationTo: 'media', required: true },
    { name: 'legenda', type: 'text' },
    { name: 'credito', type: 'text' },
  ],
}

export const blocoNumeros: Block = {
  slug: 'blocoNumeros',
  labels: { singular: 'Bloco · Números', plural: 'Blocos · Números' },
  fields: [
    { name: 'titulo', type: 'text' },
    {
      name: 'numeros',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'valor', type: 'text', required: true },
        { name: 'rotulo', type: 'text', required: true },
      ],
    },
  ],
}

export const blocoCtaInstitucional: Block = {
  slug: 'blocoCtaInstitucional',
  labels: { singular: 'Bloco · CTA Institucional', plural: 'Blocos · CTA Institucional' },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'descricao', type: 'textarea' },
    { name: 'rotuloCta', type: 'text', required: true },
    { name: 'linkCta', type: 'text', required: true },
    { name: 'variante', type: 'select', options: ['oxford', 'cardeal', 'oliva', 'neutro'] },
  ],
}
```

---

## 16. Access Control Reutilizável

`apps/cms/src/access/*.ts`

```typescript
// authenticated.ts
export const authenticated = ({ req }: any) => Boolean(req.user)

// superAdmin.ts
export const superAdmin = ({ req }: any) => req.user?.perfil === 'super-admin'

// editorInstitucional.ts
export const editorInstitucional = ({ req }: any) =>
  ['super-admin', 'editor-institucional'].includes(req.user?.perfil)

// editorEventos.ts
export const editorEventos = ({ req }: any) =>
  ['super-admin', 'editor-institucional', 'editor-eventos'].includes(req.user?.perfil)

// atendimentoComercial.ts
export const atendimentoComercial = ({ req }: any) =>
  ['super-admin', 'atendimento-comercial'].includes(req.user?.perfil)
```

---

## 17. Hooks Reutilizáveis

`apps/cms/src/hooks/autoSlug.ts`

```typescript
import slugify from 'slugify'
import type { FieldHook } from 'payload'

export const autoSlug = (sourceField: string): FieldHook => async ({ data, originalDoc, value }) => {
  if (value) return value
  const source = data?.[sourceField] || originalDoc?.[sourceField]
  if (!source) return value
  return slugify(source, { lower: true, strict: true, locale: 'pt' })
}
```

`apps/cms/src/hooks/revalidatePage.ts`

```typescript
import type { CollectionAfterChangeHook } from 'payload'

export const revalidatePage =
  (paths: string[]): CollectionAfterChangeHook =>
  async ({ doc }) => {
    if (process.env.NODE_ENV !== 'production') return doc
    const interpolatedPaths = paths.map((p) => p.replace(':slug', doc.slug))
    for (const path of interpolatedPaths) {
      try {
        await fetch(`${process.env.PAYLOAD_PUBLIC_FRONT_URL}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Revalidate-Secret': process.env.REVALIDATE_SECRET!,
          },
          body: JSON.stringify({ path }),
        })
      } catch (e) {
        console.error(`Falha ao revalidar ${path}`, e)
      }
    }
    return doc
  }
```

`apps/cms/src/shared/seoFields.ts`

```typescript
import type { Field } from 'payload'

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: { description: 'Campos opcionais — quando vazios, sistema usa fallback editorial.' },
    fields: [
      { name: 'tituloSeo', type: 'text', maxLength: 60 },
      { name: 'descricaoSeo', type: 'textarea', maxLength: 160 },
      { name: 'imagemOg', type: 'upload', relationTo: 'media' },
    ],
  },
]
```

---

## 18. Seed Mínimo

Para que o staging suba já com as três Áreas e os 15 Programas em rascunho, gera-se um arquivo de seed executado uma única vez.

`apps/cms/src/seed/seed.ts`

```typescript
import { getPayload } from 'payload'
import config from '../payload.config'

const PROGRAMAS = [
  { sigla: 'PROGE', nomeCompleto: 'Programa de Gestão Estratégica', area: 'educacao' },
  { sigla: 'EDUTEC', nomeCompleto: 'Educação e Tecnologia', area: 'educacao' },
  { sigla: 'PEAR', nomeCompleto: 'Programa de Educação e Aprendizagem em Rede', area: 'educacao' },
  { sigla: 'PEI', nomeCompleto: 'Programa de Educação Inclusiva', area: 'educacao' },
  { sigla: 'PROGIR', nomeCompleto: 'Gestão e Inovação em Resultados', area: 'educacao' },
  { sigla: 'EGIDE', nomeCompleto: 'Excelência em Gestão e Inovação para Diretores Escolares', area: 'educacao' },
  { sigla: 'PINEI', nomeCompleto: 'Inovação na Educação Infantil', area: 'educacao' },
  { sigla: 'VIVAESCOLA', nomeCompleto: 'Bem-Estar e Cultura Positiva na Escola', area: 'educacao' },
  { sigla: 'FUTURA', nomeCompleto: 'Educação para o Futuro', area: 'educacao' },
  { sigla: 'SIGA', nomeCompleto: 'Soluções Inteligentes de Governança e Administração', area: 'gestao-publica' },
  { sigla: 'AGIP', nomeCompleto: 'Governança, Integridade e Performance nas Contratações Públicas', area: 'gestao-publica' },
  { sigla: 'LIDERA', nomeCompleto: 'Liderança, Direção Estratégica e Resultados na Administração', area: 'gestao-publica' },
  { sigla: 'PROSUS+', nomeCompleto: 'Governança, Financiamento e Performance no SUS', area: 'saude' },
  { sigla: 'PROAPS+', nomeCompleto: 'Alta Performance na Atenção Primária e Redes de Cuidado', area: 'saude' },
  { sigla: 'SIGS', nomeCompleto: 'Saúde Inteligente, Governança Digital, IA e Transformação do SUS', area: 'saude' },
]

const main = async () => {
  const payload = await getPayload({ config })

  // 1. Áreas
  const areas = await Promise.all(
    ['educacao', 'gestao-publica', 'saude'].map((sigla) =>
      payload.create({
        collection: 'areas',
        data: {
          sigla,
          nome: { educacao: 'NTC Educação', 'gestao-publica': 'NTC Gestão Pública', saude: 'NTC Saúde' }[sigla]!,
          slug: sigla,
          tituloHero: '',
          subtituloHero: '',
          corAcento: { educacao: '#11365E', 'gestao-publica': '#8E2B27', saude: '#5C6B3B' }[sigla]!,
          _status: 'draft',
        } as any,
      }),
    ),
  )

  const areaMap = Object.fromEntries(areas.map((a: any) => [a.sigla, a.id]))

  // 2. Programas (em rascunho)
  for (const p of PROGRAMAS) {
    await payload.create({
      collection: 'programas',
      data: {
        sigla: p.sigla,
        nomeCompleto: p.nomeCompleto,
        slug: p.sigla.toLowerCase().replace('+', '-plus'),
        area: areaMap[p.area],
        cargaHorariaTotal: 'A definir',
        visaoGeral: { root: { type: 'root', children: [] } },
        _status: 'draft',
      } as any,
    })
  }

  console.log('Seed concluído.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

Execução:
```bash
pnpm tsx apps/cms/src/seed/seed.ts
```

---

**Fim do documento.**
*Schema Payload CMS · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
