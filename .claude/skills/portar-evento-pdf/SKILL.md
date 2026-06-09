---
name: portar-evento-pdf
description: Use quando o usuário pedir para transformar um PDF/folder de evento em uma página de evento no site (rota /agenda/[slug]) — ex.: "porta esse folder pra um evento", "cria a página desse evento", "transforma esse PDF de evento em página", ou der um PDF de evento e pedir a página. Cobre detecção de modalidade (presencial/híbrido/online) e escolha do protótipo certo. Para portar páginas que NÃO são eventos, use portar-prototipo.
---

# Portar PDF/Folder de Evento → Página de Evento

Especialização da skill `portar-prototipo` para o fluxo **PDF de evento → rota `/agenda/[slug]`**. A rota já existe e suporta 3 modalidades via `evento.formato`. O trabalho é: ler o PDF, **achar o protótipo dedicado**, detectar a modalidade, e cadastrar o evento no padrão certo.

## A FALHA QUE ESTA SKILL EVITA (leia primeiro)

O erro caro: **portar a partir do PDF + um protótipo de OUTRO evento**, em vez do protótipo dedicado daquele evento. Sintomas: classes erradas (`event-*` do AGIP vs `evt-*` do EDUTEC), estrutura errada (tabela vs timeline), dados errados (data/preço do folder superados pelo protótipo). Resultado: página inteira refeita.

**Regra de ouro (memory `feedback_prototipo_dedicado_em_feito`):** a fonte de verdade é o **protótipo HTML dedicado**, não o PDF. O PDF dá os TEXTOS; o protótipo dá o DESIGN e a ORDEM das seções e os DADOS factuais (data, preço).

## Fluxo (8 passos)

### 1. Ler o PDF inteiro
`pdftotext -layout "<arquivo>.pdf" -`. Se faltar `pdftotext`: `brew install poppler` (com OK do usuário). Para layout visual, leitura por páginas via Read.

### 2. ACHAR o protótipo dedicado ANTES de qualquer coisa
```bash
ls feito/*Evento*<sigla>* feito/*<sigla>*Evento* 2>/dev/null
grep -rl "<sigla-ou-tema>" feito/ 2>/dev/null
```
Se existir um `feito/NN_Pagina_Evento_<X>_v*.html` → **ele manda**. Se NÃO existir protótipo dedicado, PARE e pergunte ao usuário qual protótipo seguir (não improvise a partir de outro evento).

### 3. Detectar a modalidade pelo protótipo/PDF
Pistas no protótipo (`<main data-evento>`, selos do hero, meta-bar) e no PDF:

| Modalidade | Sinais | Layout | Tem seção Local? |
|---|---|---|---|
| **online** | "ao vivo", "EventON", "plataforma", sem endereço | `EventoOnlineLayout` (classes `evt-*`, timeline, `#eventon`) | Não |
| **presencial** | endereço/cidade/sede, "presencial" | `EventoPresencialLayout` (classes `event-*`) | Sim (`#local`) |
| **híbrido** | "presencial + online", 2 públicos, EventON E endereço | `EventoPresencialLayout` (tem `local`; + seções online) | Sim |

`page.tsx` roteia por `evento.formato`. Presencial e híbrido **compartilham** `EventoPresencialLayout`. Online usa `EventoOnlineLayout`.

### 4. Mapear o `<main>` do protótipo seção a seção
Ler o `<main>` LITERAL inteiro (memory `feedback_porta_html_fidelidade`). Listar TODAS as classes/seções na ordem. Conferir quais classes CSS já existem em `apps/web/app/evento-prototipo.css` e quais faltam (extração cirúrgica, sem duplicar).

### 5. Reaproveitar a infra de evento (NÃO criar do zero)
Em `apps/web/app/(capacitacao)/agenda/[slug]/` já existem e são genéricos:
- `EventoSubnav` (`.evt-nav` + scroll-spy), `AgendaDropdown` (Google/Outlook/Apple/ICS), `FaqEvento` (`.faq-item`), `CountdownSidebar` (countdown).
- Tipos e eventos em `conteudoEventos.ts`; layouts `EventoPresencialLayout`/`EventoOnlineLayout`.

Os 4 client components já usam classes `evt-*` — costumam ser **reaproveitáveis sem mudança**.

### 6. Cadastrar o CONTEÚDO como evento ESTÁTICO
Adicionar `eventoXxx: EventoOnline|EventoPresencial|EventoHibrido` em `conteudoEventos.ts` + registrar em `EVENTOS_AGENDA["slug"]`. O conteúdo da página vem SEMPRE do estático (textos validados); o CMS é índice + override de capa/data/folder (passo 7). Conteúdo do PDF sem lugar no protótipo → seção extra no MESMO estilo (não inventar design; ex.: "questões formativas" do EDUTEC).

### 7. Criar o REGISTRO no CMS (sempre, via seed idempotente)
Todo evento portado ganha um registro na coleção `eventos` do Payload — para listar no admin/índice e permitir editar **capa, data e folder PDF** (override por slug). É um seed programático idempotente, espelho de `apps/cms/src/seed/seedEventoEdutecM01.ts`:
- `payload.find({collection:"eventos", where:{slug:{equals}}})` → update se existe, create senão.
- Campos: `slug`, `nome`, `eyebrow`, `area` (resolver por sigla — **área de educação = `"educacao"`, NÃO `"edu"`**; ver `AREA_SIGLAS` em `apps/cms/src/shared/types.ts`), `programa` (resolver por `sigla`), `imagemCapa` (required → resolver uma media existente por filename, ex. `area-educacao`), `dataInicio` (ISO), `modalidade` (online/presencial/hibrido), `cargaHoraria`, `resumo`, `inscricaoAberta`.
- Adicionar script em `apps/cms/package.json` e raiz `package.json` (`payload:seed:<slug>`), espelhando `payload:seed:edutec`.
- Rodar: `pnpm payload:seed:<slug>` (sobe Payload efêmero, aplica schema se mudou, cria registro). Rodar 2× confirma idempotência ("atualizado").
- **Schema push:** se você adicionou campo novo à coleção, o push é automático ao subir o Payload. Antes, checar `lsof -ti tcp:3001` — se a sessão CMS está rodando, há risco de colisão de schema ([[feedback_db_push_paralelo]]); rodar mesmo assim falha limpo, não corrompe.

> O conteúdo da página NÃO vem do CMS. `page.tsx`: se há estático online para o slug, ELE é a fonte e `buscarOverride` sobrescreve só capa/data/folder. NÃO deixar o `fetchEvento`/`adaptarEvento` completo "ganhar" do estático — ele devolve um EventoOnline sem as seções `*Online` e a página renderiza vazia. Ver [[project_infra_evento_agenda]].

### 8. Validar + checkpoint visual humano
`pnpm typecheck && pnpm lint && pnpm --filter @ntc/web build` (buildar SÓ o web isola de erros do `@ntc/cms` causados por sessão CMS paralela). `pnpm --filter @ntc/web exec next dev --port 3000` (NÃO `pnpm dev`; 1ª req pode levar ~3min por schema pull). Curl `/agenda/<slug>` = 200; conferir que outro evento (ex. `prosus-brasilia`) não regrediu, e que a capa do CMS aparece no hero/sidebar (URL `storage/v1/object/public`). **Validação visual é humana** contra o protótipo (memory `feedback_validacao_visual`).

## Decisões que SEMPRE pergunto ao usuário

- **Conflito PDF × protótipo em dados** (data, preço): qual vence? (default: protótipo, mas confirmar — nesta sessão o usuário quis a data do PDF.)
- **Dados sensíveis** (preço, dados bancários): o que vai para a página pública? Dados bancários NUNCA na página (os protótipos proíbem); ficam para proposta/checkout.
- **Fotos de palestrantes**: quase sempre o usuário sobe depois → `foto: ""` + `// TODO`.

## Depois do mapeamento

Escrever spec em `docs/superpowers/specs/` (template em `portar-prototipo/spec-template.md`), pedir OK, então `superpowers:writing-plans` e executar. O CSS de evento se estende por extração determinística por faixa de linhas do protótipo, pulando classes já presentes.

## Red flags — PARE

- "Vou portar a partir do folder + o protótipo do outro evento" → ache o protótipo DESTE evento primeiro.
- "Não achei protótipo dedicado, vou usar o genérico" → pergunte ao usuário.
- "A data/preço do PDF deve valer" → confirme; protótipo costuma ser mais novo.
- "O conteúdo da página vem do CMS" → NÃO. Conteúdo = estático; CMS = índice + override de capa/data/folder.
- "Pulo o registro no CMS" → NÃO. Todo evento portado ganha registro no CMS (passo 7), via seed idempotente.
- "Área de educação é sigla `edu`" → é `educacao` (ver `AREA_SIGLAS`); `edu` quebra o enum no seed.
- "Modalidade é óbvia" → confirme pela presença/ausência de endereço e EventON.

## Memórias aplicáveis

[[feedback_prototipo_dedicado_em_feito]] · [[feedback_porta_html_fidelidade]] · [[project_infra_evento_agenda]] · [[feedback_validacao_visual]] · [[feedback_css_url_absoluto]] · [[project_porta_html]] · [[feedback_build_pega_a_rota_interna]] · [[feedback_db_push_paralelo]] · [[feedback_autonomia_total_execucao]]
