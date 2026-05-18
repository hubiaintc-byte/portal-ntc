# Mapa Página-a-Página
## Portal Grupo NTC · v1 Enxuto Premium · Sprint F

**Versão:** 1.0 · 15 de maio de 2026
**Companheiro de:** `10_DAB`, `11_Schema_Payload_CMS`, `12_Inventario_Componentes_Editoriais`
**Função:** mapa canônico de rotas Next.js. Define para cada rota: fonte de dados, modo de renderização, componentes que a compõem, HTML de referência, metadados SEO, schema.org JSON-LD, e regras de breadcrumb.

---

## Sumário

1. Convenções gerais
2. Rotas raiz e institucionais
3. Soluções Estratégicas
4. Programas
5. Capacitação e Desenvolvimento (Agenda + Eventos)
6. Conteúdos
7. EventOn (institucional v1)
8. Contato e formulários
9. LGPD e páginas legais
10. Páginas técnicas e do sistema
11. Sitemap e SEO global
12. Resumo das estratégias de renderização

---

## 1. Convenções gerais

Cada rota deste mapa segue um cartão padrão com os campos:

- **Rota Next.js** (caminho do arquivo em `app/`)
- **URL pública**
- **Renderização** (SSG · ISR longo · ISR curto · SSR)
- **Fonte de dados** (Payload coleção/global)
- **Componentes** (do inventário 12)
- **HTML de referência** (protótipo aprovado)
- **Metadados** (title, description, OG)
- **Schema.org JSON-LD**
- **Breadcrumb**
- **Estado vazio** (quando aplicável)

Padrões transversais:

**Linguagem.** Português brasileiro (`<html lang="pt-BR">`).
**Canônica.** Toda página declara `<link rel="canonical">`.
**OG default.** Imagem fallback `og-default.jpg` (paleta Soberana, logo NTC).
**Twitter card.** `summary_large_image`.
**Schema base.** Organization no `<head>` global, EducationalOrganization no rodapé.
**Breadcrumb obrigatório.** Em toda rota não-raiz, renderizado abaixo do header.

---

## 2. Rotas raiz e institucionais

### 2.1. Home

- **Rota Next.js:** `app/page.tsx`
- **URL:** `/`
- **Renderização:** SSG com revalidate 3600s + on-demand revalidate via webhook do global `Home`.
- **Fonte de dados:** Global `Home` + últimos 6 Eventos com `inscricaoAberta=true` (query Payload).
- **Componentes (ordem):** `<NavegacaoSoberana>` → `<HeroInstitucional>` → `<BlocoNumeros>` (números de impacto) → `<Secao>` com `<GradeProgramas variante="editorial" agruparPorArea>` (visão geral das 3 áreas) → `<GradeEventos>` (agenda destaque) → `<BlocoCitacao>` (opcional) → `<GradeEspecialistas modo="regular">` (especialistas destaque, opcional) → `<BlocoCtaInstitucional variante="oxford">` → `<RodapeSoberano>`.
- **HTML de referência:** `02_Prototipo_Home_GrupoNTC_v2_5.html`.
- **Metadados:** title `Grupo NTC — Núcleo de Tecnologia e Conhecimento`; description `Inteligência institucional aplicada à formação e ao desenvolvimento de capacidades públicas. Educação · Gestão Pública · Saúde.`; OG image padrão.
- **JSON-LD:** `Organization` + `EducationalOrganization` + `WebSite` com `SearchAction`.
- **Breadcrumb:** ausente (raiz).

### 2.2. O Grupo NTC

- **Rota:** `app/o-grupo/page.tsx`
- **URL:** `/o-grupo`
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** Global `OGrupo` (se separado) ou campos institucionais do `Home`. Decisão de implementação: criar global `OGrupo` para isolar.
- **Componentes:** `<HeroInstitucional>` → `<BlocoTexto>` (apresentação) → `<BlocoTexto>` (trajetória) → `<BlocoTexto>` (posicionamento) → `<BlocoNumeros>` → `<BlocoTexto>` (metodologia) → `<GradeEspecialistas modo="expandido">` → `<GradeClientes>` → `<BlocoCtaInstitucional>`.
- **HTML referência:** `08_Pagina_O_Grupo_NTC_v2.html`.
- **Metadados:** title `O Grupo NTC · Inteligência institucional aplicada`; description editorial.
- **JSON-LD:** `AboutPage` + `Organization` detalhada.
- **Breadcrumb:** Home › O Grupo.

### 2.3. Corpo Docente

- **Rota:** `app/o-grupo/corpo-docente/page.tsx`
- **URL:** `/o-grupo/corpo-docente`
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** coleção `Especialistas` (todos os publicados).
- **Componentes:** `<HeroInstitucional>` (titulo "Corpo Docente") → `<GradeEspecialistas modo="cerimonial" vert={null}>`.
- **HTML referência:** `25_Pagina_Corpo_Docente_v2.html`.
- **Breadcrumb:** Home › O Grupo › Corpo Docente.

---

## 3. Soluções Estratégicas

### 3.1. Visão geral das soluções

- **Rota:** `app/solucoes-estrategicas/page.tsx`
- **URL:** `/solucoes-estrategicas`
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** 3 Áreas + texto editorial fixo.
- **Componentes:** `<HeroInstitucional>` → `<BlocoTexto>` (lógica das soluções) → 3× `<BlocoAreaPreview>` (componente novo? — não, compor com `<Grade colunas={3}>` + `<CardArea>` editorial) → `<BlocoCtaInstitucional>` (contratação institucional).
- **Breadcrumb:** Home › Soluções Estratégicas.

### 3.2. Páginas de área (3 instâncias)

- **Rota:** `app/solucoes-estrategicas/[area]/page.tsx` com `generateStaticParams` retornando `['ntc-educacao', 'ntc-gestao-publica', 'ntc-saude']`.
- **URLs:** `/solucoes-estrategicas/ntc-educacao`, `/ntc-gestao-publica`, `/ntc-saude`.
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** coleção `Areas` (1 doc) + Programas filtrados por área.
- **Componentes:** `<HeroArea area={area}>` → `<BlocoTexto>` (posicionamento) → `<BlocoNumeros>` (números da área) → `<GradeProgramas filtroAtivo={area}>` → `<BlocoCitacao>` (opcional) → `<BlocoCtaInstitucional variante={area-acento}>`.
- **HTML referência:** padrão derivado do Portfolio_Institucional + páginas de programa.
- **Metadados:** title `${area.nome} · Grupo NTC`; OG `area.imagemHero`.
- **JSON-LD:** `CollectionPage` + lista de Programas.
- **Breadcrumb:** Home › Soluções Estratégicas › `{area.nome}`.

### 3.3. Soluções in-company, sob medida, modalidades, contratação institucional

- **Rotas:** `app/solucoes-estrategicas/in-company/page.tsx`, `/sob-medida`, `/modalidades`, `/contratacao-institucional`.
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** páginas editoriais simples — recomendação: criar coleção `Paginas` opcional OU manter como conteúdo fixo no código (mais simples para v1). **Decisão para v1: conteúdo fixo no código + 4 globais simples se houver edição prevista.**
- **Componentes:** `<HeroInstitucional>` → `<BlocoTexto>` × N → `<BlocoCtaInstitucional>`.

---

## 4. Programas

### 4.1. Listagem de todos os programas

- **Rota:** `app/programas/page.tsx`
- **URL:** `/programas`
- **Renderização:** SSG revalidate 3600s.
- **Fonte:** coleção `Programas` (todos publicados).
- **Componentes:** `<HeroInstitucional>` (titulo "Programas Estratégicos") → `<FiltrosArea>` (Client) → `<GradeProgramas agruparPorArea variante="editorial">`.
- **Breadcrumb:** Home › Programas.

### 4.2. Página individual do programa (15 instâncias)

- **Rota:** `app/programas/[slug]/page.tsx`
- **URL:** `/programas/proge`, `/programas/edutec`, ..., `/programas/sigs`.
- **Renderização:** SSG com `generateStaticParams` carregando todos os slugs publicados; revalidate 3600s + on-demand via webhook.
- **Fonte:** coleção `Programas` (1 doc pelo slug) + Módulos relacionados + Eventos relacionados + Especialistas.
- **Componentes (ordem canônica):**
  1. `<HeroPrograma>`
  2. `<BlocoTexto eyebrow="Visão Geral" titulo="..." corpo={visaoGeral}>`
  3. `<BlocoTexto eyebrow="Problema endereçado" corpo={problema}>` (se houver)
  4. `<BlocoTexto eyebrow="Objetivo" corpo={objetivo}>`
  5. `<BlocoTexto eyebrow="Público-alvo" corpo={publicoAlvo}>`
  6. `<Secao><Grade colunas={3}>` com array de `eixosTematicos` em `<BlocoTexto>` compactos
  7. `<ListaModulos modulos={modulos} variante="completa">`
  8. `<BlocoNumeros>` (resultados esperados, se houver dados quantitativos)
  9. `<Secao><Grade colunas={2}>` para `diferenciais`
  10. `<GradeEspecialistas modo="regular">` para coordenação científica
  11. `<GradeEspecialistas modo="expandido">` para docentes
  12. `<Secao>` para modalidades de entrega (in-company, turma aberta etc.)
  13. `<BlocoFaq itens={faq}>`
  14. `<GradeProgramas programas={programasRelacionados} variante="compacto">`
  15. `<BlocoCtaInstitucional variante={area-acento} rotuloCta="Solicitar proposta">` linkando para `/contato/proposta?programa={slug}`
- **HTML referência:** template-matriz `Folder_EDUTEC_NTC_2026.html` da skill `ntc-grupo:ntc-folder-programa`.
- **Metadados:** title `${sigla} · ${nomeCompleto} · Grupo NTC`; description = primeira linha de visão geral; OG = `imagemCapa`.
- **JSON-LD:** `Course` (schema.org) com propriedades `provider`, `educationalLevel`, `timeRequired`, `coursePrerequisites`, `aggregateRating` opcional.
- **Breadcrumb:** Home › Programas › `{nomeCompleto}`.
- **Estado de rascunho:** se `_status='draft'`, retornar `notFound()`.

---

## 5. Capacitação e Desenvolvimento (Agenda + Eventos)

### 5.1. Agenda geral

- **Rota:** `app/agenda/page.tsx`
- **URL:** `/agenda`
- **Renderização:** ISR revalidate 300s (5 min).
- **Fonte:** coleção `Eventos` filtrada por `dataInicio >= hoje` e `_status='published'`, ordenada cronologicamente.
- **Componentes:** `<HeroInstitucional>` (compacto, titulo "Agenda") → `<FiltrosAgenda>` (Client) → `<GradeEventos agruparPorMes ordenacao="cronologica">`.
- **HTML referência:** `09_Pagina_Agenda_v1.html`.
- **Breadcrumb:** Home › Capacitação e Desenvolvimento › Agenda.
- **Estado vazio:** `<BlocoTexto>` editorial: "Não há eventos com inscrições abertas no momento. Inscreva-se em nossa newsletter para receber novas convocações."

### 5.2. Listas filtradas (Online, Presencial, Por programa, Por área)

- **Rotas:**
  - `app/eventos/online/page.tsx` → `/eventos/online`
  - `app/eventos/presenciais/page.tsx` → `/eventos/presenciais`
  - `app/eventos/programa/[slug]/page.tsx` → `/eventos/programa/{slug}`
  - `app/eventos/area/[slug]/page.tsx` → `/eventos/area/{slug}`
- **Renderização:** ISR 300s.
- **Fonte:** query Payload com filtros específicos.
- **Componentes:** mesmo padrão da Agenda, sem `<FiltrosAgenda>` (filtro já implícito na rota).

### 5.3. Eventos passados

- **Rota:** `app/eventos/passados/page.tsx` → `/eventos/passados`
- **Renderização:** ISR 3600s (raramente muda).
- **Fonte:** eventos com `dataInicio < hoje`, ordenados por mais recente primeiro, paginados (12 por página).
- **Componentes:** Hero compacto → `<GradeEventos variante="passado">` (cartão com selo "Encerrado" + link para replay se houver).

### 5.4. Página individual do evento

- **Rota:** `app/eventos/[slug]/page.tsx`
- **URL:** `/eventos/seminario-prosus-brasilia`, etc.
- **Renderização:** ISR 300s + on-demand revalidate via webhook (Eventos.afterChange hook).
- **Fonte:** coleção `Eventos` (1 doc por slug) + Especialistas + Programa.
- **Componentes (ordem canônica):**
  1. `<HeroEvento>`
  2. `<BlocoMetadados>` (data, local, modalidade, carga horária, programa de origem) — compor com `<Grade colunas={4}>`
  3. `<BlocoTexto eyebrow="Resumo" corpo={resumo}>`
  4. `<BlocoTexto eyebrow="Público-alvo" corpo={publicoAlvo}>`
  5. `<BlocoTexto eyebrow="Objetivos" corpo={objetivos}>`
  6. `<BlocoTexto eyebrow="Conteúdo programático" corpo={conteudoProgramatico}>`
  7. `<BlocoProgramacao itens={programacaoDetalhada}>`
  8. `<GradeEspecialistas modo="regular" especialistas={palestrantes}>`
  9. `<Secao>` para `diferenciais` em `<Grade colunas={2}>`
  10. **Bloco de inscrição** (componente local `<BlocoInscricaoEvento>`) — se `inscricaoAberta` e `linkInscricaoExterna`, mostra `<BotaoSoberano variante="primario" href={linkInscricaoExterna} externo>`; se fechada, mostra mensagem "Inscrições encerradas" + CTA para newsletter
  11. `<BlocoFaq itens={faq}>`
  12. `<GradeEventos eventos={eventosRelacionados} variante="compacto">`
  13. `<BlocoCtaInstitucional>` (programa de origem ou CTA institucional)
- **HTML referência:** `03_Pagina_Evento_PROSUS_Brasilia_v2.html`, `04_Pagina_Evento_EDUTEC_M01_Online_v1.html`.
- **Metadados:** title `${nome} · ${dataInicio formatada} · Grupo NTC`; OG `imagemCapa`.
- **JSON-LD:** `Event` (schema.org) com `name`, `startDate`, `endDate`, `eventAttendanceMode`, `eventStatus`, `location` (online ou física), `organizer`, `performer` (palestrantes), `offers` (com `price`, `availability`, `url=linkInscricaoExterna`).
- **Breadcrumb:** Home › Capacitação e Desenvolvimento › Agenda › `{nome}`.

---

## 6. Conteúdos

### 6.1. Lista de conteúdos

- **Rota:** `app/conteudos/page.tsx` → `/conteudos`
- **Renderização:** ISR 600s.
- **Fonte:** coleção `Conteudos` ordenada por `dataPublicacao` desc, paginação 12 por página.
- **Componentes:** `<HeroInstitucional>` → `<FiltrosConteudo>` (categoria + área) → `<Grade colunas={3}>` com `<CardConteudo>`.

### 6.2. Listas por categoria

- **Rotas:** `app/conteudos/[categoria]/page.tsx` com `generateStaticParams` para `['artigos', 'insights', 'publicacoes', 'materiais-para-download', 'noticias']`.
- **Renderização:** ISR 600s.

### 6.3. Conteúdo individual

- **Rota:** `app/conteudos/[categoria]/[slug]/page.tsx`
- **URL:** `/conteudos/artigos/financiamento-do-sus-em-2026`
- **Renderização:** SSG revalidate 3600s + on-demand.
- **Componentes:** `<HeroConteudo>` → `<BlocoTexto largura="texto" corpo={corpo}>` → `<BlocoAssinaturaAutor>` (compor com `<CardEspecialista variante=...>`) → `<GradeConteudos relacionados>`.
- **JSON-LD:** `Article` ou `BlogPosting`.

---

## 7. EventOn (institucional v1)

Como o ciclo de inscrição/participação está externalizado em plataforma terceira na v1, a "página EventOn" do site é institucional — apresenta o que é, como funciona, e direciona para a plataforma terceira.

### 7.1. EventOn institucional

- **Rota:** `app/eventon/page.tsx` → `/eventon`
- **Renderização:** SSG revalidate 3600s.
- **Componentes:** `<HeroInstitucional>` → `<BlocoTexto>` (apresentação) → `<BlocoNumeros>` → `<BlocoCtaInstitucional>` apontando para `eventon.gruponctc.org.br` ou plataforma terceira.

### 7.2. Demais rotas EventOn (v1)

- `/eventon/replay` — placeholder editorial até v2.
- `/eventon/certificados` — placeholder + link para validação manual.
- `/eventon/acesso` — placeholder + redireciona para plataforma terceira.
- `/eventon/suporte` — formulário simples ou link para WhatsApp institucional.

Comportamento: páginas anunciam "Em v1, o ciclo do participante é operado pela plataforma [X]. Em v2, integramos nativamente à infraestrutura própria do Grupo NTC." (texto editorial discreto, não autodepreciativo.)

---

## 8. Contato e formulários

### 8.1. Página de Contato

- **Rota:** `app/contato/page.tsx` → `/contato`
- **Renderização:** SSG revalidate 3600s (estática) + form Client.
- **Componentes:** `<HeroInstitucional>` compacto → `<Secao><Grade colunas={2}>` com `<BlocoTexto>` (contatos institucionais à esquerda) e `<FormularioSoberano tipo="contato">` (à direita).
- **Form:** `<CampoTexto nome>`, `<CampoEmail>`, `<CampoTelefone>`, `<CampoTexto instituicao>`, `<CampoSelect assunto>`, `<CampoTextarea mensagem>`, `<CampoCheckbox consentimentoLgpd>`, `<BotaoSoberano type="submit">`.
- **Submit:** `POST /api/forms/contato`.

### 8.2. Solicitar Proposta

- **Rota:** `app/contato/proposta/page.tsx` → `/contato/proposta`
- **Query params:** `?programa={slug}&modalidade={tipo}` (pré-preenche o form quando vier da página de programa).
- **Renderização:** SSG revalidate 3600s + form Client.
- **Form:** mesmos campos comuns + `<CampoSelect programa>` (com query param default) + `<CampoSelect modalidade>` + `<CampoSelect esfera>` + `<CampoNumber participantesEstimados>` + `<CampoTextarea mensagem>` + `<CampoCheckbox consentimentoLgpd>`.
- **Submit:** `POST /api/forms/proposta`.

### 8.3. Candidatura de Especialista

- **Rota:** `app/contato/candidatura-especialista/page.tsx` → `/contato/candidatura-especialista`
- **Form:** comuns + `<CampoSelect titulacao>` + `<CampoSelectMulti linhasAtuacao>` (das 3 áreas) + `<CampoTextarea apresentacao>` + `<CampoUrl linkLattes>` + `<CampoUrl linkLinkedin>` + `<CampoUpload curriculo aceita="application/pdf" maxMb={10}>` + `<CampoCheckbox consentimentoLgpd>`.
- **Submit:** `POST /api/forms/candidatura-especialista`.

### 8.4. Newsletter (sem rota própria — componente embutido)

- **Componente:** `<FormularioNewsletter>` embutido no `<RodapeSoberano>` e em página dedicada `/newsletter` (opcional, simples).
- **Form:** `<CampoEmail>`, `<CampoTexto nome>`, `<CampoSelectMulti areasInteresse>`, `<CampoCheckbox consentimentoLgpd>`.
- **Submit:** `POST /api/forms/newsletter`.

### 8.5. Estado de sucesso (todos os formulários)

Após submit OK, o `<FormularioSoberano>` substitui o form por bloco editorial:
- Eyebrow "Solicitação recebida"
- Título em Cormorant: "Obrigado, ${nome}."
- Texto: "Recebemos sua mensagem. Em até ${X} horas úteis, um(a) consultor(a) institucional entrará em contato."
- CTA secundário: "Enquanto isso, conheça nosso ${próximo programa ou conteúdo relevante}."

---

## 9. LGPD e páginas legais

### 9.1. Política de Privacidade

- **Rota:** `app/politica-de-privacidade/page.tsx` → `/politica-de-privacidade`
- **Renderização:** SSG revalidate 86400 (1 dia).
- **Fonte:** texto fixo no código (revisado pelo DPO). Versão do documento marcada (`<meta name="document-version" content="2026-05-01">`).

### 9.2. Termos de Uso

- **Rota:** `app/termos-de-uso/page.tsx` → `/termos-de-uso`

### 9.3. LGPD — Solicitar Exclusão

- **Rota:** `app/lgpd/solicitar-exclusao/page.tsx` → `/lgpd/solicitar-exclusao`
- **Form simples:** e-mail + descrição da solicitação + aceite explícito.
- **Submit:** `POST /api/forms/exclusao-lgpd` → grava em coleção dedicada `SolicitacoesLgpd` ou marca Lead existente com flag, dispara e-mail para `dpo@`.

### 9.4. Cookies — Política

- **Rota:** `app/politica-de-cookies/page.tsx` → `/politica-de-cookies`
- Linkada do banner `<BannerCookies>`.

---

## 10. Páginas técnicas e do sistema

### 10.1. `app/not-found.tsx` (404)

- Editorial premium: Cormorant grande "Não encontramos o que procura." + texto "Talvez tenha sido movido. Você pode voltar à página inicial ou explorar nossos programas." + dois CTAs.

### 10.2. `app/error.tsx` (500 client)

- Mensagem editorial discreta + opção de reload.

### 10.3. `app/api/health/route.ts`

- GET retornando `{ ok: true, banco: 'ok', media: 'ok', crm: { ultimaSincronizacao: timestamp } }`. Não autenticado mas com IP whitelist via middleware se necessário.

### 10.4. `app/api/revalidate/route.ts`

- POST autenticado pelo header `X-Revalidate-Secret`. Chama `revalidatePath()` do Next.js. Disparado pelo Payload `afterChange` hook.

### 10.5. `app/api/forms/[tipo]/route.ts`

- POST handlers dos 4 formulários (proposta, contato, newsletter, candidatura-especialista).

### 10.6. `app/admin/[[...slug]]/page.tsx`

- Roteia para o admin do Payload.

---

## 11. Sitemap e SEO global

### 11.1. `app/sitemap.ts`

Sitemap dinâmico Next.js. Inclui:
- Home, O Grupo, Corpo Docente, Soluções Estratégicas, todas as 3 áreas, todas as páginas de programa publicadas, Programas (lista), Agenda, Eventos online/presenciais, todos os eventos publicados (não passados há mais de 1 ano), Conteúdos (lista) e todos os conteúdos publicados, EventOn institucional, Contato e variantes.
- Exclui: `/admin`, `/api`, páginas de status interno.

### 11.2. `app/robots.ts`

```typescript
{
  rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
  sitemap: 'https://gruponctc.org.br/sitemap.xml',
}
```

### 11.3. `app/layout.tsx` — JSON-LD global

`Organization` schema com nome, logo, endereço, redes sociais, telefone, e-mail, NAIC do setor educacional.

---

## 12. Resumo das estratégias de renderização

| Rota / Padrão | Renderização | Revalidate | Justificativa |
|---|---|---|---|
| `/` (Home) | SSG | 3600s + on-demand | Mudança editorial pontual |
| `/o-grupo*` | SSG | 3600s | Conteúdo institucional estável |
| `/solucoes-estrategicas*` | SSG | 3600s | Conteúdo institucional |
| `/programas` | SSG | 3600s | Lista de 15 fixos |
| `/programas/[slug]` | SSG | 3600s + on-demand | Edição editorial sob demanda |
| `/agenda` | ISR | 300s | Cadência de eventos novos |
| `/eventos/*` (listas) | ISR | 300s | Mesmo motivo |
| `/eventos/[slug]` | ISR | 300s + on-demand | Edição de evento até a véspera |
| `/eventos/passados` | ISR | 3600s | Raramente muda |
| `/conteudos*` | ISR | 600s | Publicação editorial frequente |
| `/eventon*` | SSG | 3600s | Páginas institucionais |
| `/contato*` | SSG estática + form Client | — | Form é Client interativo |
| `/politica-*`, `/termos-*` | SSG | 86400s | Mudança rara |
| `/api/*` | SSR (Route Handler) | — | Dinâmico por natureza |
| `/admin*` | SSR (Payload) | — | Autenticado |

---

**Fim do documento.**
*Mapa Página-a-Página · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
