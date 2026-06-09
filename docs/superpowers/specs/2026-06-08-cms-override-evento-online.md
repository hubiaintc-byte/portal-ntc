# CMS Override de Evento Online (capa, data, folder PDF) + registro no CMS — Design

**Data:** 2026-06-08
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano

---

## 1. Contexto e objetivo

O evento online EDUTEC M01 está cadastrado como **estático** em `conteudoEventos.ts` (todos os textos validados, layout `EventoOnlineLayout`). O usuário quer:

1. **Editar pelo CMS apenas 3 campos voláteis:** imagem de capa, data, e um PDF de folder (baixado no botão "Baixar folder"). O resto do conteúdo continua estático.
2. **Criar um registro no CMS para todo evento portado** (título, programa/módulo, modalidade, data, área, resumo) — o CMS vira o índice real de eventos, mesmo sem servir o conteúdo da página.
3. Esse fluxo (criar registro no CMS) passa a fazer parte da porta de PDF→evento (skill `portar-evento-pdf`).

**Modelo:** conteúdo da página = estático (fonte única). CMS casa por **slug** e sobrescreve **só** capa/data/folder. Demais metadados no CMS são informativos (admin/índice).

## 2. Decisões fixadas (do brainstorm)

- **Data:** um campo único `dataInicio` (date) no CMS → o código deriva TODOS os formatos exibidos (meta-bar, timeline, sidebar, countdown, ICS).
- **Coleção:** reusar a coleção `Eventos` existente (não criar coleção de overrides).
- **Folder PDF:** nova coleção de upload `Folders` que aceita `application/pdf` (a coleção `Media` só aceita imagens). Campo `folderPdf` (upload→folders) em `Eventos`.
- **Botão "Baixar folder" sem PDF no CMS:** **some** (não renderiza no hero nem no subnav). Com PDF → aparece e baixa o arquivo.
- **Schema/DB:** aplicar o schema (push) **agora, coordenando** — antes do push, garantir que a sessão `feat/cms-soberana` não está com dev server/push ativo no mesmo banco. `postgresAdapter` está com push automático (sem `push:` explícito).
- **Storage do PDF:** o plugin `s3Storage` é configurado por coleção (`collections: { media: {...} }`). A coleção `Folders` precisa de entrada própria lá (prefix `folders`, `disableLocalStorage: true` como a Media) para o PDF ir ao Supabase Storage.
- **Padrão de seed já existe:** `seedHomeV3.ts` já cria 6 Eventos via `payload run`; seguir o mesmo padrão idempotente (`pnpm payload run src/seed/...`).
- **Criação do registro:** programática (seed/script), não manual.
- **Precedência:** CMS sobrescreve só capa/data/folder; conteúdo da página é sempre o estático.
- **Escopo:** apenas eventos **online** (a estrutura `*Online`/`EventoOnlineLayout` é para online).
- **Fallback:** CMS fora do ar / sem registro / sem campo → usa o estático puro, sem quebrar.

## 3. Arquitetura de arquivos

```
apps/cms/src/
├── collections/
│   ├── Eventos.ts            ← EDITAR: + campo folderPdf (upload→folders)
│   ├── Folders.ts            ← NOVO: coleção upload, mimeTypes application/pdf
│   └── Media.ts              ← inalterado (só imagens)
├── payload.config.ts         ← EDITAR: registrar Folders
└── seed/
    └── seedEventoEdutecM01.ts ← NOVO: cria/atualiza o registro EDUTEC no CMS (idempotente por slug)

apps/web/
├── lib/cms/
│   ├── overrideEvento.ts      ← NOVO: buscarOverride(slug) → { coverUrl?, dataInicio?, folderUrl? }
│   └── derivarDatas.ts        ← NOVO: ISO → formatos pt-BR (meta/timeline/sidebar/ics/deadline)
└── app/(capacitacao)/agenda/[slug]/
    └── page.tsx               ← EDITAR: aplica override no evento online antes de renderizar
```

## 4. Coleção `Folders` (novo)

Espelha `Media` mas para PDFs:
- `slug: "folders"`, `upload: { mimeTypes: ["application/pdf"], staticDir/handler conforme o padrão da Media }`.
- Campo `alt`/`titulo` opcional para acessibilidade/admin.
- Storage: mesmo adapter S3/Supabase da Media (o projeto usa Supabase Storage). Conferir se o plugin de storage cobre a coleção nova (provável ajuste no `payload.config.ts`).

Campo em `Eventos.ts` (aba "Data, Local e Modalidade" ou "Inscrição"):
```ts
{ name: "folderPdf", type: "upload", relationTo: "folders", required: false,
  admin: { description: "PDF do folder do evento, baixado no botão 'Baixar folder' da página." } }
```

## 5. Derivação de data (`derivarDatas.ts`)

Entrada: ISO `"2026-06-15"` (+ fuso `America/Sao_Paulo`). Saída:
```ts
interface DatasDerivadas {
  metaValue: string;     // "15 · Junho"
  metaSub: string;       // "2026 · Segunda-feira"
  timelineDiaHtml: string; // "15 de <em>Junho</em> · Segunda-feira"
  sidebarValue: string;  // "15 · Jun · 2026"
  dataEvento: string;    // "15 de junho de 2026"
  deadlineISO: string;   // countdown = fim do dia do evento: "2026-06-15T23:59:59-03:00"
  countdownDateText: string; // "Até 15 de Junho de 2026"
  icsStart: string;      // "20260615T080000" (mantém horário 08h do estático)
  icsEnd: string;        // "20260615T180000" (mantém 18h)
  icsFilename: string;   // "<slug>.ics"
}
```
- Meses e dias da semana em pt-BR via tabela literal (não depender de locale do runtime — `noUncheckedIndexedAccess`).
- Horários (08h/18h) **não** vêm do CMS nesta v1; mantém os do estático. (Se o usuário quiser editar horário depois, é outro campo.)

## 6. Override (`overrideEvento.ts` + `page.tsx`)

`buscarOverride(slug)`:
- `payload.find({ collection: "eventos", where: { slug: { equals: slug } }, limit: 1, depth: 1 })`.
- Retorna `{ coverUrl?: string; dataInicioISO?: string; folderUrl?: string }` ou `null`. Try/catch → `null` (fallback).

`aplicarOverrideOnline(eventoEstatico: EventoOnline, override): EventoOnline`:
- Se `coverUrl`: sobrescreve `sidebarOnline.coverImg` e o `backgroundImage` do hero (o hero bg é inline no layout — passar via campo `heroBgUrl?` no tipo OU sobrescrever `heroOnline` com um campo de imagem; decisão de plano: adicionar `heroOnline.bgUrl?` opcional, default = caminho estático).
- Se `dataInicioISO`: deriva via `derivarDatas` e sobrescreve `dataEvento`, `metasOnline` (item "Quando"), `programacaoOnline.headDayHtml`, `sidebarOnline.rows` (item "Quando"), `sidebarOnline.countdown`, `agendaIcs`.
- Se `folderUrl`: sobrescreve o href do CTA "Baixar folder" (hero ctas[1] e subnav folder) e marca presença; se ausente → conforme decisão do botão.

`page.tsx`: no caso `online`, `const ovr = await buscarOverride(slug); evento = ovr ? aplicarOverrideOnline(evento, ovr) : evento;`.

## 7. Seed programático (`seedEventoEdutecM01.ts`)

- Idempotente: procura `eventos` por slug `edutec-m01-2026`; se existe, update; senão create.
- Popula metadados informativos do estático: `nome`, `programa` (rel EDUTEC), `area` (edu), `modalidade: "online"`, `dataInicio` (2026-06-15), `cargaHoraria`, `resumo`, `slug`. **Não** popula capa/folder (o usuário sobe no admin).
- Rodar via comando pnpm (ex.: `pnpm payload:seed:edutec` ou script ts-node). Conferir o padrão de seed existente (`seedHomeV3.ts`).
- **Atenção (memory `feedback_db_push_paralelo`):** não rodar `db:push` com sessão paralela ativa. O seed é insert de dados, não migração de schema — mas o campo novo `folderPdf` + coleção `Folders` exigem migração/push do schema. Coordenar: aplicar schema quando seguro, ou `push: false` + migration manual.

## 8. Atualização da skill `portar-evento-pdf`

Adicionar passo 6.5 (após cadastrar o estático, antes de validar):
> **Criar o registro no CMS** (script idempotente por slug) com os metadados principais: título, programa/módulo, modalidade (online/presencial/híbrido), data, área, resumo. O conteúdo da página continua estático; o CMS é índice + overrides de capa/data/folder.

(Editar a skill segue o Iron Law da `writing-skills` — testar antes. Por ora, registrar a intenção; a edição da skill é tarefa à parte com seu próprio baseline.)

## 9. Coordenação com `feat/cms-soberana`

A sessão paralela mexe SÓ em `apps/web/app/(prototipo-cms)/` (telas mock `DetalheEvento.tsx`/`TelaEventos.tsx`) — **não** toca `collections/Eventos.ts`, `payload.config.ts`, nem `lib/cms/`. Sem colisão. Stage explícito por path; nunca `git add .`.

## 10. Validação

1. `pnpm typecheck && pnpm lint && pnpm build`.
2. Schema: coleção `Folders` + campo `folderPdf` aplicados (push/migration coordenado).
3. Seed roda e cria o registro EDUTEC no CMS (idempotente — rodar 2× não duplica).
4. Admin: subir capa + data + folder PDF no registro; página reflete os 3 overrides.
5. Sem registro/sem campo → página cai no estático (testar removendo override).
6. `/agenda/edutec-m01-2026` = 200; `prosus-brasilia` (presencial) sem regressão.
7. Checkpoint visual humano: capa do CMS aparece no hero+sidebar; data derivada correta em todos os lugares; "Baixar folder" baixa o PDF.

## 11. Riscos

- **Schema push com sessão paralela** → coordenar; preferir migration a `db:push` automático.
- **Storage de PDF** (Supabase) pode precisar de config no plugin para a coleção `Folders`.
- **Hero bg é inline** no layout → exige campo `bgUrl?` no tipo para o override alcançar.
- **Data derivada pt-BR** sem depender de locale → tabela literal de meses/dias.
- **`fetchEvento` antigo** (adapter completo) coexiste; este override é caminho separado e mais simples. Não remover o adapter, mas garantir que o online use o override, não o `adaptarEvento` completo.

## 12. Fora de escopo

- Editar textos/horário/seções pelo CMS (continuam estáticos).
- Eventos presencial/híbrido (só online nesta v1).
- Migrar TODO o conteúdo para o CMS.

## 13. Próximos passos

1. Plano detalhado (`superpowers:writing-plans`).
2. Execução por subagentes.
3. Checkpoint visual humano.
4. (Tarefa à parte) atualizar skill `portar-evento-pdf` com o passo de criar registro no CMS, via writing-skills.
