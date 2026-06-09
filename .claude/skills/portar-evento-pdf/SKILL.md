---
name: portar-evento-pdf
description: Use quando o usuário pedir para transformar um PDF/folder de evento em uma página de evento no site (rota /agenda/[slug]) — ex.: "porta esse folder pra um evento", "cria a página desse evento", "transforma esse PDF de evento em página", ou der um PDF de evento e pedir a página. Cobre detecção de modalidade (presencial/híbrido/online) e escolha do protótipo certo. Para portar páginas que NÃO são eventos, use portar-prototipo.
---

# Portar PDF/Folder de Evento → Página de Evento

Especialização da skill `portar-prototipo` para o fluxo **PDF de evento → rota `/agenda/[slug]`**. A rota já existe e suporta 3 modalidades via `evento.formato`. O trabalho é: ler o PDF, **achar o protótipo dedicado**, detectar a modalidade, e cadastrar o evento no padrão certo.

## A FALHA QUE ESTA SKILL EVITA (leia primeiro)

O erro caro: **portar a partir do PDF + um protótipo de OUTRO evento**, em vez do protótipo dedicado daquele evento. Sintomas: classes erradas (`event-*` do AGIP vs `evt-*` do EDUTEC), estrutura errada (tabela vs timeline), dados errados (data/preço do folder superados pelo protótipo). Resultado: página inteira refeita.

**Regra de ouro (memory `feedback_prototipo_dedicado_em_feito`):** a fonte de verdade é o **protótipo HTML dedicado**, não o PDF. O PDF dá os TEXTOS; o protótipo dá o DESIGN e a ORDEM das seções e os DADOS factuais (data, preço).

## Fluxo (7 passos)

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

### 6. Cadastrar como evento ESTÁTICO (não CMS)
Adicionar `eventoXxx: EventoOnline|EventoPresencial|EventoHibrido` em `conteudoEventos.ts` + registrar em `EVENTOS_AGENDA["slug"]`. **Não** mexer no CMS (memory `feedback_cms_apenas_quando_pedido`) salvo pedido explícito. Conteúdo do PDF sem lugar no protótipo → seção extra no MESMO estilo (não inventar design; ex.: "questões formativas" do EDUTEC).

### 7. Validar + checkpoint visual humano
`pnpm typecheck && pnpm lint && pnpm build`. `pnpm --filter @ntc/web exec next dev --port 3000` (NÃO `pnpm dev`). Curl `/agenda/<slug>` = 200; conferir que outro evento (ex. `prosus-brasilia`) não regrediu. **Validação visual é humana** contra o protótipo (memory `feedback_validacao_visual`).

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
- "Vou cadastrar no CMS" → só se pedido; padrão é estático.
- "Modalidade é óbvia" → confirme pela presença/ausência de endereço e EventON.

## Memórias aplicáveis

[[feedback_prototipo_dedicado_em_feito]] · [[feedback_porta_html_fidelidade]] · [[feedback_cms_apenas_quando_pedido]] · [[feedback_validacao_visual]] · [[feedback_css_url_absoluto]] · [[project_porta_html]] · [[feedback_build_pega_a_rota_interna]]
