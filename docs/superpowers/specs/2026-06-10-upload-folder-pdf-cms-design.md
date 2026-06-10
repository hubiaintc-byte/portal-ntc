# Upload de folder PDF funcionando no novo CMS — Design

**Data:** 10/06/2026 · **Branch:** `feat/cms-soberana` (worktree `portal-ntc-cms`)

## Problema

O CampoUpload "Folder (PDF)" do prototipo-cms sobe o arquivo, mas o site nunca
mostra o PDF no botão "Baixar folder". Duas causas:

1. `enviarMidiaEvento` vincula a Media ao evento com `draft: true`
   (`apps/web/lib/cms/prototipoCmsEscrita.ts`). O site lê a versão publicada
   (`overrideEventoOnline.ts` na main), então o vínculo fica preso no rascunho.
2. `bodySizeLimit: "12mb"` (`apps/web/next.config.ts`) — o folder novo do
   PROGE M03 tem 14 MB e falha no envio da Server Action.

O botão Publicar/Despublicar e o selo de status JÁ existem no DetalheEvento
(`alternarPublicacaoEvento`) — não precisam ser criados.

## Decisões (validadas com o usuário)

- Upload de capa/folder grava **direto no registro publicado**, preservando o
  `_status` atual — mesmo padrão de `definirOcultarPalestrante` (commit
  d5e8249). Efeito colateral aceito: edições de texto pendentes no rascunho
  são publicadas junto (o botão Publicar dá controle sobre isso).
- `bodySizeLimit` sobe para `"20mb"`.
- Seed one-off vincula os 5 PDFs "Nova Data" (EDUTEC M01/M02/M04,
  PROGE M01/M03) aos eventos `online` correspondentes, com `--dry-run`.

## Mudanças

1. `apps/web/lib/cms/prototipoCmsEscrita.ts` — `enviarMidiaEvento` lê o
   `_status` atual (findByID com `draft: true`) e grava `{ [campo]: media.id,
   _status }` sem `draft: true`.
2. `apps/web/next.config.ts` — `bodySizeLimit: "20mb"`.
3. `apps/cms/src/seed/seedFoldersEventos.ts` — lê uma pasta, casa arquivos
   `Folder · Módulo NN <PROGRAMA> ….pdf` com slugs `<programa>-mNN-2026`,
   cria a Media e vincula `folderPdf` preservando `_status`. Reporta slugs
   sem evento no CMS em vez de criar eventos.

## Verificação

Site local com os 5 eventos: botão "Baixar folder" servindo a URL do Supabase
Storage do PDF novo. Validação visual humana (servidor fica no ar).
