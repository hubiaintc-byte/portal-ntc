# CMS Eventos — Sessão 3 (Portar Evento ao CMS, foco em palestrantes) — Design

**Data:** 2026-06-01
**Status:** aprovado pelo usuário (brainstorming) — pendente revisão do spec escrito
**Origem:** continuação da migração Corpo Docente (sessões 1-2). A nota da sessão 2 dizia "migrar palestrantes de Programas/Eventos para Especialistas"; o brainstorming revelou que **não há palestrantes reais para migrar** — Programas e Eventos contêm apenas papéis genéricos ("Jurista convidado") e temas ("Financiamento federal"), não pessoas. O objetivo real do usuário: **ao montar um evento no admin, selecionar os palestrantes (Especialistas reais) e vê-los renderizados como cards de pessoa na página do evento.**

---

## 1. Objetivo

Permitir que a equipe editorial **crie/edite um Evento inteiramente pelo admin do CMS**, incluindo **selecionar os palestrantes** a partir da coleção `Especialistas` (os 49 já cadastrados nas sessões 1-2). A página pública do evento (`/agenda/[slug]`) passa a consumir o CMS, renderizando os palestrantes selecionados como o card `.speaker-detail-card` que o layout do evento já possui — com foto, nome, papel e credencial **reais** vindos do cadastro de Especialistas.

Decisão do usuário (Abordagem B do brainstorming): portar o **Evento inteiro** ao CMS, não só a seção de palestrantes. Isso realiza o fluxo completo de admin.

## 2. Estado atual (descoberto no brainstorming)

- **Página do evento é 100% estática local.** `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` lê de `EVENTOS_AGENDA` (objeto em `conteudoEventos.ts`). Não consome o CMS. Único evento existente: **PROSUS+ Brasília** (`slug: "prosus-brasilia"`, formato `presencial`).
- **A seção de palestrantes já existe visualmente.** `EventoPresencialLayout.tsx` (~linha 203) renderiza `.speaker-detail-card` a partir de `evento.palestrantes.palestrantes[]` (tipo `Palestrante { foto, role, nome, credenciais }`). Hoje preenchido com temas, não pessoas.
- **A coleção `Eventos.ts` do CMS já é rica** (~242 linhas, ~90% do shape). Já tem: hero (nome/eyebrow/programa/area/imagemCapa), datas, modalidade, local, cargaHoraria, resumo, publicoAlvo, objetivos, conteudoProgramatico, programacaoDetalhada (com `palestrante` relationTo especialistas), **`palestrantes` (relationTo especialistas, hasMany)**, diferenciais, inscrição, valor, vagas, replay, certificado, eventosRelacionados, faq. Está **vazia** (sem registros).
- **Especialistas já têm os campos necessários para o card:** `foto`, `nome`, `instituicao`, `curriculoCurto`, `tipo`, `titulacao`.

## 3. Decisões do usuário (do brainstorming)

1. **Card visual:** manter o `.speaker-detail-card` do evento (não trazer o `.expert-card` do corpo-docente). Só muda a **fonte dos dados**.
2. **Seleção:** feita **no admin**, via campo `palestrantes` (relationTo especialistas) da coleção Eventos. Não é vínculo hardcoded.
3. **Mapeamento do card** (Especialista → Palestrante):
   - `foto` ← foto do Especialista (Supabase)
   - `role` ← `instituicao` (ex: "Ex-presidente do INEP")
   - `nome` ← `nome`
   - `credenciais` ← `curriculoCurto` (texto extraído do richText)
4. **Escopo:** portar o Evento inteiro ao CMS (Abordagem B).

## 4. Arquitetura

Replica o padrão validado no Corpo Docente (sessões 1-2):

```
Admin CMS (coleção Eventos)
   │  equipe cria o evento e seleciona palestrantes (relationTo: especialistas)
   ▼
seedEventos.ts  ──upsert idempotente por slug──▶  coleção Eventos populada (PROSUS+ Brasília)
   │
   ▼
apps/web/lib/cms/eventos.ts  (loader + adapter)
   │  CMS Evento → tipo Evento local (mesmo shape de EVENTOS_AGENDA)
   │  resolve palestrantes[] → SecaoPalestrantes.palestrantes (foto/role/nome/cred reais)
   ▼
page.tsx do evento  ──async + try/catch──▶  CMS, com FALLBACK para EVENTOS_AGENDA estático
   │
   ▼
EventoPresencialLayout (INALTERADO) renderiza .speaker-detail-card
```

**Princípios:**
- **Schema:** a coleção `Eventos.ts` já cobre ~90%. Expectativa de **zero ou mínima mudança de schema** (a confirmar campo a campo no plano). Se faltar campo de "chrome de seção" (eyebrow/h2/intro/nota de cada seção), preferir derivar no adapter a poluir o admin.
- **Divisão de responsabilidade:** conteúdo **editável** (textos de seção, palestrantes, programação, FAQ, datas, valor) vai ao CMS; **estrutura de layout** (navLinks, metas visuais, crumb, sidebar, ctaFinal, agendaIcs, eyebrows/labels) o adapter deriva ou mantém constante. O admin só mostra o que faz sentido editar.
- **Fallback:** se o fetch ao CMS falhar, a página cai no `EVENTOS_AGENDA[slug]` estático atual. Nada quebra. (Padrão da sessão 2; ver memória `feedback_db_push_paralelo` — seed roda com `push: false`.)
- **Layout intacto:** `EventoPresencialLayout` não muda — recebe o mesmo tipo `Evento` de sempre.

## 5. Modelagem do adapter (CMS Evento → tipo `Evento` local)

`apps/web/lib/cms/eventos.ts` recebe o doc do CMS (com `depth` suficiente para popular a relação `palestrantes` e suas `foto`) e devolve o tipo `Evento` que `EventoPresencialLayout` consome.

| Campo do tipo local | Origem |
|---|---|
| `slug, titulo, subtitulo, dataEvento, area, formato` | CMS (campos diretos) |
| `palestrantes.palestrantes[]` | **CMS relação `palestrantes`** → cada Especialista vira `{ foto: url, role: instituicao, nome, credenciais: textoDeCurriculoCurto }` |
| `palestrantes.{eyebrow,h2,intro,nota}` | **constante no adapter** (chrome de seção — texto fixo do protótipo) |
| `visaoGeral, publico, objetivos, conteudoProgramatico, programacao, diferenciais, faq, investimento, local` | CMS (richText/arrays) + eyebrow/h2 derivados no adapter |
| `crumb, metas, navLinks, sidebar, ctaFinal, relatedEvents, agendaIcs` | **derivados/locais** (estrutura de layout; `agendaIcs` derivado de dataInicio/fim/local) |

- **Extração de texto do richText:** `curriculoCurto` e demais richText do CMS são convertidos a string/HTML pelo mesmo helper já usado no corpo-docente (ou equivalente em `lib/cms`).
- **Resolução de foto:** a URL pública vem do campo Media do Especialista (Supabase Storage), igual ao corpo-docente.
- **Ordem dos palestrantes:** respeita a ordem do array `palestrantes` definida no admin.

## 6. Seed (`apps/cms/src/seed/seedEventos.ts`)

- Mesmo padrão de `seedCorpoDocente.ts`: **upsert idempotente por `slug`**.
- Popula **o evento PROSUS+ Brasília** (único existente), a partir do conteúdo de `conteudoEventos.ts` (porta literal — fidelidade 100% ao protótipo, ver memória `feedback_porta_html_fidelidade`).
- A relação `palestrantes` é criada com uma **seleção inicial** (mínima ou definida pelo usuário). Como a curadoria é do usuário via admin, o seed garante que o registro exista; o usuário ajusta a seleção depois. **Seed não inventa quem é palestrante** (CLAUDE.md §5.3).
- **Proteção de dados editoriais:** seguindo o ajuste feito em `seedCorpoDocente` (commit `9c22770`), campos que a equipe edita no admin (notadamente a seleção de `palestrantes` e a `foto`/conteúdo) devem ser aplicados de forma que o re-seed não sobrescreva curadoria humana. Padrão: campos estruturais no update; seleção de palestrantes apenas na criação (ou via flag), a confirmar no plano.

## 7. Página com fallback (`page.tsx`)

- `page.tsx` vira `async`: busca o evento no CMS por slug dentro de `try/catch`.
  - Sucesso → adapta (Seção 5) e renderiza `EventoPresencialLayout`.
  - Falha (CMS fora, slug ausente no CMS) → usa `EVENTOS_AGENDA[slug]` estático atual.
- `generateStaticParams` une slugs do CMS + estáticos (sem duplicar).
- `revalidate = 3600` mantido (ISR).
- `EventoPresencialLayout` e os demais layouts (`hibrido`/`online`, ainda em notFound) **inalterados**.

## 8. Decomposição em sub-sessões (implementação)

Por ser grande, a **implementação** divide-se (o spec cobre tudo; cada sub-sessão tem seu plano):

- **Sessão 3a (núcleo do pedido):** verificação de schema + `seedEventos` (PROSUS+) + adapter `lib/cms/eventos.ts` + `page.tsx` lendo do CMS com fallback, com foco em **palestrantes reais renderizando** no `.speaker-detail-card`. Seções não-palestrante podem usar valores do adapter/estáticos no início.
- **Sessão 3b:** migrar as demais seções de conteúdo (programação, FAQ, investimento, objetivos etc.) para serem 100% editáveis no admin, refinando o adapter.

Entrega 3a já permite: criar/editar evento no admin **e selecionar palestrantes que aparecem como cards reais** na página.

## 9. Verificação

- **Idempotência do seed:** rodar 2×; 2ª execução só `atualiza`, sem `cria`, sem sobrescrever seleção humana.
- **Build + curl:** `/agenda/prosus-brasilia` HTTP 200; seção palestrantes mostra fotos via Supabase, nomes/roles/credenciais reais dos Especialistas selecionados; sem `fetch CMS falhou` no log.
- **Fallback:** simular CMS indisponível → página ainda renderiza (estático).
- **Validação visual humana** (memória `feedback_validacao_visual`): servidor no ar, usuário confirma cards de palestrante e fidelidade ao protótipo `03_Pagina_Evento_PROSUS_Brasilia_v3.html`.
- **Admin:** confirmar que selecionar/reordenar palestrantes no admin reflete na página após revalidação.
- **Lint/typecheck/build** do monorepo: PASS (erro pré-existente `triple-slash-reference` em `next-env.d.ts` não conta).

## 10. Fora de escopo

- Layouts `hibrido`/`online` de evento (seguem em notFound até serem portados).
- Migrar docentes dos 15 Programas (papéis genéricos; decisão editorial futura, não há dados reais).
- Portar o protótipo novo de Evento AGIP (`05_Pagina_Evento_AGIP_SP_Hibrido_v1.html`, não rastreado) — trabalho separado.
- Substituir fotos placeholder por reais (responsabilidade editorial via admin; proteção já implementada no commit `9c22770`).
- Inscrição nativa / OTT / integrações de pagamento.

## 11. Rollback

Sem task dedicada — implícito no padrão Git (sub-sessões em branch/worktree isolada → revert se necessário). O fallback estático garante que, mesmo com o CMS quebrado, a página nunca fica fora do ar.

---

*Spec gerado pelo fluxo brainstorming. Próxima etapa: revisão humana do spec → writing-plans (começando pela sessão 3a).*
