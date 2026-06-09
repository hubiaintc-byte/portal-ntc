# Listagens de eventos reais (Home + Agenda) — Design

**Data:** 2026-06-09
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano

---

## 1. Objetivo

Remover os eventos **mockados** da Home e da Agenda institucional e exibir apenas os **5 eventos reais** cadastrados (EDUTEC M01/M02/M04 + PROGE M01/M03), via **adapter automático** a partde `EVENTOS_AGENDA` (fonte única).

## 2. Decisões fixadas (brainstorm)

- **Adapter automático:** Home e Agenda derivam os cards de `EVENTOS_AGENDA`. Adicionar/editar evento = um lugar só.
- **PROSUS:** removido **só das listagens**. A rota `/agenda/prosus-brasilia`, a constante `eventoProsusBrasilia` e o `EventoPresencialLayout` permanecem (uso futuro). Os adapters de listagem simplesmente **não incluem** o PROSUS (filtram por slugs dos 5, ou por um flag).
- **Home — 5 eventos:** 3 cards grandes (cronológico: EDUTEC M01 15/06, M02 16/06, M04 17/06) + 2 menores (PROGE M01 22/06, M03 23/06).
- **Agenda:** os 5 eventos, com filtros (tab/área/programa/modalidade/busca) preservados.
- **Metadados de card:** bloco `card?` opcional adicionado a cada evento (fonte única; sem inferência frágil para preço/keywords/deadline).
- **CTAs:** apontam para `/agenda/<slug>` (rotas reais), não mais `#`.

## 3. Arquitetura

```
apps/web/
├── app/(capacitacao)/agenda/[slug]/conteudoEventos.ts
│     + interface CardEvento (metadados de listagem)
│     + campo card?: CardEvento em EventoBase
│     + preencher card nos 5 eventos (M01/M02/M04/PROGE M01/M03)
│     + EVENTOS_LISTAGEM: ordem curada dos 5 slugs (exclui prosus)
├── lib/eventos/adaptarParaCard.ts (NOVO)
│     paraCardHomePrincipal(evento) → EventoCard
│     paraCardHomeSecundario(evento) → EventoCardSecundario
│     paraCartaoAgenda(evento, ordem) → CartaoEvento
├── app/(home)/page.tsx
│     eventosPrincipais/eventosSecundarios ← derivados dos 5 reais
├── app/(home)/conteudoFallback.ts
│     remover arrays eventosPrincipais/eventosSecundarios mockados
│     (manter interfaces EventoCard/EventoCardSecundario — os adapters as produzem)
├── app/(capacitacao)/agenda/page.tsx
│     <PipelineAgenda eventos={EVENTOS_REAIS_ADAPTADOS} />
└── app/(capacitacao)/agenda/conteudoAgenda.ts
      remover array EVENTOS mockado (manter tipos CartaoEvento + filtros)
```

## 4. `interface CardEvento` (bloco de metadados de listagem)

Adicionado a `EventoBase` como `card?: CardEvento`. Contém o que NÃO dá para derivar do evento:

```ts
export interface CardEvento {
  // Para filtros/busca da agenda
  programaSlug: string;        // "EDUTEC" | "PROGE" (sigla; casa com ProgramaSlug)
  formato: "seminario" | "oficina" | "curso" | "congresso"; // formato editorial do card
  cidade?: string;             // "" para online
  valorReais: number;          // 1470 (numérico p/ filtro de preço)
  deadlineIso: string;         // YYYY-MM-DD (prazo inscrição)
  keywords: string;            // termos de busca
  flags?: string[];            // ["destaque_editorial"] etc.
  // Rótulos de exibição
  imagemUrl: string;           // capa do card (pode = sidebarOnline.coverImg)
  modalidadeLabel: string;     // "Online ao vivo + replay"
  formatoLabel: string;        // "Seminário"
  coordenacaoNomes: string;    // nomes dos palestrantes/coordenação
  metaEssenciais: [string, string]; // ["8h · 1 dia", "Plataforma EventOn"]
  precoIndividualLabel: string;// "R$ 1.470"
  precoEquipesLabel: string;   // "Sob consulta"
  destaqueHome?: boolean;      // entra nos cards grandes da home
}
```

O adapter deriva o resto do próprio evento: `slug`, `titulo`, `area`, `dataEvento`→bloco de data (parse de "16 de junho de 2026"), `programBinding`, `eventon` (modalidade online).

## 5. Adapters (`adaptarParaCard.ts`)

Três funções puras. Cada uma recebe um `Evento` (com `card` preenchido) e devolve o shape esperado pela página. Derivação de data: helper que converte `dataEvento` / `dataIso` do card em `DataBloco`/`data.variante`. CTAs: `href: /agenda/<slug>` e `/contato?evento=...` (do próprio evento). Se `card` ausente → o adapter retorna `null` (evento não entra na listagem) — defensivo.

`EVENTOS_LISTAGEM` em `conteudoEventos.ts`: array ordenado dos 5 slugs reais (sem prosus), curado:
```ts
export const EVENTOS_LISTAGEM = [
  "edutec-m01-2026", "edutec-m02-2026", "edutec-m04-2026",
  "proge-m01-2026", "proge-m03-2026",
] as const;
```
Home principais = os 3 com `card.destaqueHome` (M01/M02/M04); secundários = os 2 restantes. Agenda = todos os 5 na ordem de `EVENTOS_LISTAGEM`.

## 6. Validação

1. `pnpm typecheck && pnpm lint && pnpm --filter @ntc/web build`.
2. Smoke: `/` (home) 200, `/agenda` 200.
3. Home: aparecem exatamente os 5 (3 grandes EDUTEC, 2 menores PROGE); **nenhum** mockado (PEAR/AGIP/LIDERA/PROAPS/PROSUS sumiram). CTAs dos cards → `/agenda/<slug>`.
4. Agenda: grade com os 5; filtros funcionam; sem mockados.
5. Rota `/agenda/prosus-brasilia` ainda 200 (não removida).
6. Checkpoint visual humano.

## 7. Riscos

- **Parse de `dataEvento`** ("16 de junho de 2026" → dia/mês): usar tabela pt-BR (já existe `derivarDatasEvento`? reaproveitar se servir, ou parse simples). Cuidado com `noUncheckedIndexedAccess`.
- **Filtros da agenda** dependem de `programa`/`area`/`modalidade`/`tab` no `CartaoEvento`: o adapter deve preencher todos a partir do evento + `card`. `tab` = "abertas" (todos abertos hoje).
- **Remover arrays mockados** sem quebrar imports: conferir que `conteudoFallback`/`conteudoAgenda` não exportam mais os arrays, mas mantêm tipos e demais conteúdos. Ajustar imports em `page.tsx`.
- **`EventoCard` precisa de `coordenacao`/`programaBinding`**: derivar de `palestrantesOnline`/`programBinding` do evento.

## 8. Fora de escopo

- Editar conteúdo dos eventos (já feito).
- CMS para listagens (continua estático/derivado).
- Mexer no `EventoPresencialLayout`/PROSUS além de tirá-lo da lista.
- Paginação/novos filtros na agenda.

## 9. Próximos passos

1. Plano (`writing-plans`).
2. Execução.
3. Checkpoint visual humano.
