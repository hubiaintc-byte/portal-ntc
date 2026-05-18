# Pacote de Prompts Iniciais para o Claude Code
## Portal Grupo NTC · Sprint F · v1

**Versão:** 1.0 · 15 de maio de 2026
**Companheiro de:** documentos 10 a 14.
**Função:** sequência operacional de prompts para o usuário colar no Claude Code, sessão por sessão, da preparação do ambiente até o lançamento da v1.

---

## Como usar este documento

**Antes da primeira sessão.** Crie um novo repositório no GitHub chamado `portal-grupo-ntc`. Clone localmente. Copie os arquivos `docs/10_DAB...md`, `docs/11_Schema...md`, `docs/12_Inventario...md`, `docs/13_Mapa...md` para a pasta `docs/` do repositório. Renomeie `14_CLAUDE_md_Operacional_v1.md` para `CLAUDE.md` e mova para a raiz. Inicie o Claude Code na raiz do repositório com `claude`.

**Durante as sessões.** Cole o prompt da sessão correspondente como primeira mensagem. O Claude Code lerá automaticamente o `CLAUDE.md` e tratará todas as instruções permanentes como contrato.

**Entre sessões.** Faça commit e push do trabalho. Abra um PR para revisão se for janela de release.

**Sessão típica:** 60 a 90 minutos. Não tente comprimir múltiplas sessões em uma só — perde-se qualidade no checkpoint visual.

---

## Janela A — Fundação

### Sessão 1 — Scaffold do monorepo

```
Vamos começar a Sprint F do Portal Grupo NTC.

Leia primeiro os documentos de governança nesta ordem:
1. docs/10_DAB_Backend_Enxuto_GrupoNTC_v1.md (foco: seções 3, 4, 13)
2. docs/14_CLAUDE_md_Operacional_v1.md (já carregado como CLAUDE.md)

Sua tarefa nesta sessão:

1. Scaffolde o monorepo conforme a estrutura definida na Seção 13 do CLAUDE.md:
   - Turborepo com pnpm workspaces
   - apps/web (Next.js 15 App Router, TS strict, Tailwind 4)
   - apps/cms (Payload 3 com adapter Postgres)
   - packages/ui (placeholder com tokens.ts)
   - packages/lib (placeholder)
   - packages/types (placeholder)

2. Configure os arquivos de base:
   - package.json raiz com workspaces
   - turbo.json com pipeline (dev, build, lint, typecheck, test)
   - tsconfig.base.json compartilhado
   - .eslintrc, .prettierrc
   - .env.example com todas as variáveis listadas na Seção 15 do CLAUDE.md
   - .gitignore adequado
   - .github/workflows/ci.yml com lint + typecheck + build em todo PR

3. Configure os comandos canônicos (Seção 14 do CLAUDE.md) no package.json raiz.

4. NÃO crie ainda componentes, páginas, ou conteúdo do Payload — apenas a fundação.

Antes de codar, exponha o plano (Seção 8 do CLAUDE.md). Aguarde minha aprovação verbal para começar.

Ao final da sessão, faça checkpoint:
- pnpm install funciona
- pnpm dev sobe Next.js + Payload em portas distintas
- pnpm lint e pnpm typecheck passam

Commit final: "chore: scaffold inicial do monorepo (turborepo + pnpm + next + payload)"
```

---

### Sessão 2 — Tokens Soberana e configuração do design system

```
Continuando Sprint F do Portal Grupo NTC.

Leia:
1. docs/12_Inventario_Componentes_Editoriais_v1.md (foco: Seção 2 — Tokens Soberana)
2. Os SVGs em docs/prototipos/img/logos/ (ou na pasta onde os logos foram colocados)
3. docs/prototipos/02_Prototipo_Home_GrupoNTC_v2_5.html (referência visual)

Sua tarefa nesta sessão:

1. Em packages/ui/src/tokens.ts, materialize o objeto `tokens` exatamente como aparece na Seção 2 do Inventário.

2. Configure tailwind.config.ts em apps/web para consumir os tokens (cores, fonts, spacing). Use o plugin oficial do Tailwind 4 com tokens via CSS variables.

3. Configure next/font em apps/web/app/fonts.ts:
   - Cormorant Garamond (weights 400, 500, 600, 700 — italic 400 e 500)
   - Barlow (weights 300, 400, 500, 600, 700)
   - Subsets: latin, latin-ext
   - display: swap
   - Variables CSS: --font-titulo, --font-corpo

4. Crie apps/web/app/globals.css com:
   - Reset moderno (modern-normalize ou similar)
   - CSS variables dos tokens
   - Body base: font-corpo, color grafite, bg osso
   - Headings: font-titulo
   - Focus visible: outline 2px Oxford, outline-offset 2px

5. Coloque os logos SVG em apps/web/public/logos/ e ajuste paths.

6. Crie um arquivo apps/web/app/layout.tsx mínimo (Server Component) com:
   - <html lang="pt-BR">
   - Aplicação das fontes
   - Metadata base (Organization JSON-LD virá em sessão posterior)

7. Crie uma page.tsx de teste em apps/web/app/page.tsx que apenas renderiza um H1 Cormorant + um parágrafo Barlow para validar que os tokens estão aplicados.

Checkpoint visual: pnpm dev abre localhost, vejo o H1 em Cormorant e o parágrafo em Barlow com paleta correta. Screenshot.

NÃO crie ainda componentes do Inventário — apenas os tokens e a base tipográfica.

Aguarde aprovação do plano antes de codar.

Commit: "feat(design-system): tokens Soberana 2026 e tipografia base"
```

---

### Sessão 3 — Setup do Payload CMS com banco

```
Continuando Sprint F.

Leia:
1. docs/11_Schema_Payload_CMS_v1.md por completo
2. docs/10_DAB Seção 10 (segurança administrativa)

Pré-requisitos confirmados (me confirme antes de começar):
- Banco Neon Postgres SP criado (DATABASE_URI no .env.local)
- PAYLOAD_SECRET gerado e no .env.local
- Conta R2 com bucket ntc-portal-media e credenciais no .env.local

Sua tarefa:

1. Configure apps/cms/src/payload.config.ts exatamente como no doc 11, Seção 2.
2. Crie packages/types e configure a geração automática (output em packages/types/payload-types.ts).
3. Crie a coleção Users com:
   - Campo `perfil` (select: super-admin, editor-institucional, editor-eventos, atendimento-comercial)
   - Auth nativa do Payload
4. Crie a coleção Media com upload para R2 (S3 storage adapter).
5. Crie os arquivos de access control em apps/cms/src/access/ exatamente como no doc 11, Seção 16.
6. Crie os hooks reutilizáveis em apps/cms/src/hooks/ (autoSlug, revalidatePage) — doc 11, Seção 17.
7. Crie apps/cms/src/shared/types.ts e apps/cms/src/shared/lexical-config.ts — doc 11, Seção 3.
8. Crie apps/cms/src/shared/seoFields.ts — doc 11, Seção 17.
9. NÃO crie ainda as coleções editoriais (Areas, Programas, Eventos etc.) — sessão 4.
10. Suba o Payload via pnpm dev:cms, acesse /admin, faça primeiro registro (super-admin).
11. Habilite 2FA no admin (plugin ou middleware).

Checkpoint:
- /admin acessível com 2FA
- Posso fazer login e ver collections Users e Media
- Upload de imagem teste funciona e arquivo aparece no R2

Aguarde aprovação do plano.

Commit: "feat(cms): setup base do Payload com auth, media e access control"
```

---

### Sessão 4 — Coleções editoriais (Áreas, Programas, Eventos, Especialistas, Conteúdos, Clientes)

```
Continuando Sprint F.

Leia doc 11 (Seções 4 a 10 — coleções editoriais).

Sua tarefa:

1. Crie as 6 coleções editoriais em apps/cms/src/collections/, exatamente como no doc 11:
   - Areas.ts (Seção 4)
   - Programas.ts (Seção 5)
   - Modulos.ts (Seção 6)
   - Eventos.ts (Seção 7)
   - Especialistas.ts (Seção 8)
   - Conteudos.ts (Seção 9)
   - Clientes.ts (Seção 10)

2. Registre todas em apps/cms/src/payload.config.ts.

3. Gere types do Payload: pnpm payload:generate.

4. Crie o seed mínimo em apps/cms/src/seed/seed.ts (doc 11, Seção 18).

5. Execute o seed contra o banco staging: pnpm payload:seed. Isso deve criar as 3 Áreas e 15 Programas em rascunho.

6. No admin, valide:
   - As 3 Áreas estão lá com campos do schema
   - Os 15 Programas estão em rascunho, filtráveis por área
   - Posso editar um programa-piloto (ex.: PROGE) e salvá-lo

Checkpoint:
- Admin mostra as 6 collections editoriais + Leads (sessão 5) + AuditLog
- Seed populou 3 Áreas + 15 Programas
- Posso editar e publicar uma Área

Commit: "feat(cms): coleções editoriais (Areas, Programas, Modulos, Eventos, Especialistas, Conteudos, Clientes)"
```

---

### Sessão 5 — Coleção Leads, AuditLog, e globais Home/Rodape

```
Continuando Sprint F.

Leia doc 11 (Seções 11, 12, 13, 14 — Leads, AuditLog, Home, Rodape).

Sua tarefa:

1. Crie apps/cms/src/collections/Leads.ts (doc 11, Seção 11) com:
   - Discriminator por tipo
   - Campos condicionais por tipo
   - Grupo origem
   - Grupo consentimentoLgpd
   - Grupo sincronizacaoCrm
   - Hook beforeChange gerando identificacao
2. Crie apps/cms/src/collections/AuditLog.ts (doc 11, Seção 12).
3. Crie apps/cms/src/globals/Home.ts (doc 11, Seção 13).
4. Crie apps/cms/src/globals/Rodape.ts (doc 11, Seção 14).
5. Registre tudo no payload.config.ts.
6. Crie os Blocks reutilizáveis em apps/cms/src/blocks/index.ts (doc 11, Seção 15).
7. Regenere types: pnpm payload:generate.

Checkpoint:
- Admin mostra grupo "Comercial" com Leads.
- Admin mostra grupo "Páginas Singleton" com Home e Rodape.
- Posso criar Lead manual de teste no admin com todos os campos visíveis.
- Posso editar Home e Rodape como singletons.

Commit: "feat(cms): coleções Leads e AuditLog, globais Home e Rodape, blocks editoriais"
```

---

### Sessão 6 — Componentes base do design system (parte 1 — primitives e navegação)

```
Continuando Sprint F.

Leia doc 12 (Seções 3 e 4 — Layout Primitives e Navegação).

Sua tarefa:

1. Em packages/ui/src/components/, crie:
   - layout/Container.tsx (doc 12, 3.1)
   - layout/Secao.tsx (doc 12, 3.2)
   - layout/Grade.tsx (doc 12, 3.3)
   - navegacao/NavegacaoSoberana.tsx (doc 12, 4.1) — Client Component
   - navegacao/MenuMobileDrawer.tsx (doc 12, 4.3)
   - navegacao/Breadcrumbs.tsx (doc 12, 4.2) — Server Component, gera JSON-LD
2. Exporte tudo em packages/ui/src/index.ts.
3. NÃO use bibliotecas de UI externas. Tudo em Tailwind + tokens.
4. Use a referência visual de docs/prototipos/02_Prototipo_Home_GrupoNTC_v2_5.html para o header.
5. Para menu mobile: drawer slide-from-right, fechamento por X e por overlay click.

Crie uma página de visualização em apps/web/app/_design-system/page.tsx (não-listada no sitemap) que monta NavegacaoSoberana + Breadcrumbs de exemplo + Container com Lorem para visualizar os primitives.

Checkpoint visual:
- /\_design-system mostra navegação completa
- Menu mobile abre e fecha
- Logo aparece, links têm hover discreto
- Comparei com o protótipo HTML — paridade visual aceitável

Commit: "feat(ui): primitives de layout e navegação Soberana"
```

---

## Janela B — Páginas institucionais e eventos

### Sessão 7 — Hero family e cards

```
Continuando Sprint F.

Leia doc 12 (Seções 5, 6 — Hero family e Cards).

Sua tarefa:

1. Em packages/ui/src/components/heroes/, crie:
   - HeroInstitucional.tsx
   - HeroArea.tsx
   - HeroPrograma.tsx
   - HeroEvento.tsx
   - HeroConteudo.tsx

2. Em packages/ui/src/components/cards/, crie:
   - CardPrograma.tsx (com variantes editorial e compacto)
   - CardEvento.tsx
   - CardEspecialista.tsx (foto 20:23, modos regular/expandido/cerimonial)
   - CardConteudo.tsx
   - CardCliente.tsx

3. Para cada componente, importe a interface do doc 12 e mantenha props idênticas.

4. Cards usam <ImagemSoberana> (que será criado na sessão 8) ou next/image direto por enquanto.

5. Atualize /_design-system para mostrar uma amostra de cada hero e cada card.

Checkpoint visual:
- Todos os heroes renderizam com dados mock no /_design-system
- Cards mostram variações
- Tipografia Soberana aplicada
- Sem efeitos vibrantes

Commit: "feat(ui): hero family e cards editoriais"
```

---

### Sessão 8 — Blocos editoriais, listings, utilitários e helpers

```
Continuando Sprint F.

Leia doc 12 (Seções 7, 8, 10, 12 — Blocos, Listings, Utilitários, Helpers).

Sua tarefa:

1. Em packages/ui/src/components/blocos/, crie todos os blocos do doc 12, Seção 7.
2. Em packages/ui/src/components/listings/, crie GradeProgramas, GradeEventos, GradeEspecialistas, ListaModulos, FiltrosAgenda (Client).
3. Em packages/ui/src/components/utils/, crie Eyebrow, TituloSecao, LinkEditorial, Selo.
4. Em packages/ui/src/components/helpers/, crie ImagemSoberana, montaMetadataSoberana (lib, não componente), JsonLd, Revelar.
5. Atualize /_design-system com amostras de cada bloco e listing.

Checkpoint visual:
- /_design-system tem agora ~25 componentes catalogados
- Cada bloco respeita tokens Soberana
- BlocoFaq tem acordeão funcional
- FiltrosAgenda emite onChange

Commit: "feat(ui): blocos editoriais, listings e utilitários"
```

---

### Sessão 9 — Rodapé, formulários e LGPD

```
Continuando Sprint F.

Leia doc 12 (Seções 9 e 11 — Formulários e Rodapé) + doc 10 Seção 7 (contratos de API) e Seção 8 (arquitetura comum dos formulários).

Sua tarefa:

1. Em packages/ui/src/components/forms/, crie FormularioSoberano + campos atômicos (CampoTexto, CampoEmail, CampoTelefone, CampoSelect, CampoSelectMulti, CampoTextarea, CampoNumber, CampoUrl, CampoUpload, CampoCheckbox).
2. Crie BotaoSoberano (doc 12, 9.3) com todas as variantes.
3. Crie RodapeSoberano puxando dados de Global Rodape via fetch ao Payload.
4. Crie BannerCookies (doc 12, 12.3) — Client Component, persiste em cookie.
5. Implemente as 4 rotas POST em apps/web/app/api/forms/:
   - proposta/route.ts
   - contato/route.ts
   - newsletter/route.ts
   - candidatura-especialista/route.ts
6. Cada rota: validação Zod → persistência no Payload via SDK → envio RD Station (background) → e-mail interno + confirmação (Resend) → retorno JSON.
7. Crie packages/lib/integracoes/rdstation.ts e packages/lib/integracoes/resend.ts.
8. Templates de e-mail React Email em apps/web/emails/.

Checkpoint:
- Submit de cada um dos 4 formulários cria Lead no admin
- E-mails de confirmação chegam (testar com e-mail real próprio)
- E-mails internos chegam para a caixa configurada
- Banner LGPD aparece em primeira visita

Commit: "feat(formularios): 4 formulários institucionais com LGPD, RD Station e Resend"
```

---

### Sessão 10 — Páginas institucionais (Home, O Grupo, Áreas)

```
Continuando Sprint F.

Leia doc 13 (Mapa Página-a-Página) seções 2 e 3.

Sua tarefa:

1. Crie apps/web/app/layout.tsx definitivo com:
   - NavegacaoSoberana fetch dos dados de menu (hardcoded ou de global)
   - RodapeSoberano
   - BannerCookies
   - JsonLd Organization global
   - Metadata base

2. Crie:
   - apps/web/app/page.tsx (Home) — doc 13, 2.1
   - apps/web/app/o-grupo/page.tsx — doc 13, 2.2
   - apps/web/app/o-grupo/corpo-docente/page.tsx — doc 13, 2.3
   - apps/web/app/solucoes-estrategicas/page.tsx — doc 13, 3.1
   - apps/web/app/solucoes-estrategicas/[area]/page.tsx — doc 13, 3.2 (com generateStaticParams)

3. Cada página: SSG com revalidate 3600s, dados do Payload via fetch ao próprio backend.

4. Para áreas, configurar generateStaticParams com os 3 slugs fixos.

Checkpoint visual:
- Home navega completa em staging
- O Grupo, Corpo Docente, Soluções Estratégicas e as 3 áreas renderizam
- Screenshots desktop + mobile de cada uma
- Comparação com protótipos (02, 08, 25): apontar discrepâncias e corrigir antes do commit

Commit: "feat(paginas): home, o-grupo, corpo-docente, soluções estratégicas e 3 áreas"
```

---

### Sessão 11 — Páginas de Programa (template + 15 instâncias)

```
Continuando Sprint F.

Leia doc 13 Seção 4 + skill ntc-grupo:ntc-folder-programa (template-matriz Folder_EDUTEC_NTC_2026.html).

Sua tarefa:

1. Crie apps/web/app/programas/page.tsx (lista) — doc 13, 4.1.
2. Crie apps/web/app/programas/[slug]/page.tsx (template) — doc 13, 4.2.
3. Use generateStaticParams para carregar todos os slugs publicados.
4. Implemente a ordem canônica de 15 blocos da seção 4.2.
5. JSON-LD Course completo.
6. Trate state de rascunho como notFound.

A equipe editorial vai cadastrar o conteúdo dos 15 programas em paralelo. Você deve testar a página com 1 ou 2 programas-piloto já cadastrados (PROGE e PROSUS+).

Checkpoint visual:
- /programas mostra os 15 programas agrupados por área
- /programas/proge renderiza o template completo com dados reais
- /programas/prosus-plus renderiza idem
- Comparação com template-matriz da skill: paridade aceitável

Commit: "feat(programas): lista de programas e template de programa individual"
```

---

### Sessão 12 — Páginas de Evento (template + agenda + filtros)

```
Continuando Sprint F.

Leia doc 13 Seção 5 + doc 12 Seção 8 (FiltrosAgenda).

Sua tarefa:

1. Crie apps/web/app/agenda/page.tsx (doc 13, 5.1) com FiltrosAgenda Client.
2. Crie as listas filtradas (doc 13, 5.2):
   - app/eventos/online/page.tsx
   - app/eventos/presenciais/page.tsx
   - app/eventos/programa/[slug]/page.tsx
   - app/eventos/area/[slug]/page.tsx
3. Crie app/eventos/passados/page.tsx (doc 13, 5.3).
4. Crie app/eventos/[slug]/page.tsx (doc 13, 5.4) com ordem canônica de blocos.
5. ISR 300s para todas as listas e detalhes; on-demand revalidate disparado pelo hook do Payload afterChange.
6. JSON-LD Event completo em página individual.
7. Botão "Inscrever-se" linka para linkInscricaoExterna com tracking de clique.

A equipe vai cadastrar 10-15 eventos em paralelo.

Checkpoint visual:
- Agenda com filtros funcionais (modalidade, área, programa, mês)
- Cada evento cadastrado renderiza com template completo
- Estado vazio elegante quando filtro retorna nada
- Comparação com protótipos 03 e 04 e 09

Commit: "feat(eventos): agenda, listas filtradas, eventos passados e template de evento"
```

---

### Sessão 13 — Conteúdos, EventOn, Contato e legais

```
Continuando Sprint F.

Leia doc 13 Seções 6, 7, 8, 9.

Sua tarefa:

1. Conteúdos (doc 13, 6.1, 6.2, 6.3):
   - app/conteudos/page.tsx (lista)
   - app/conteudos/[categoria]/page.tsx (lista por categoria)
   - app/conteudos/[categoria]/[slug]/page.tsx (detalhe)
2. EventOn institucional (doc 13, 7.1, 7.2):
   - app/eventon/page.tsx + 4 subpáginas placeholder
3. Contato (doc 13, 8.1 a 8.4):
   - app/contato/page.tsx
   - app/contato/proposta/page.tsx (com query params)
   - app/contato/candidatura-especialista/page.tsx
4. Páginas legais (doc 13, 9):
   - app/politica-de-privacidade/page.tsx (texto fixo, versão 2026-05-01)
   - app/termos-de-uso/page.tsx
   - app/lgpd/solicitar-exclusao/page.tsx (form simples)
   - app/politica-de-cookies/page.tsx

Checkpoint:
- Todos os 4 formulários ativos e gravando Leads
- Conteúdos navegáveis (mesmo com 1-2 mocks)
- Páginas legais visíveis e linkadas do rodapé

Commit: "feat(paginas): conteúdos, eventon, contato e páginas legais"
```

---

## Janela C — Polimento e lançamento

### Sessão 14 — SEO técnico, sitemap, robots, JSON-LD

```
Leia doc 13 Seção 11 + doc 10 Seção 12.

Tarefa:

1. app/sitemap.ts — sitemap dinâmico cobrindo todas as rotas listadas no doc 13.
2. app/robots.ts — conforme doc 13, 11.2.
3. app/layout.tsx — JSON-LD Organization (doc 13, 11.3) embedado via <JsonLd>.
4. Em cada página, gere metadata via montaMetadataSoberana, com fallbacks adequados.
5. Adicione meta tags Twitter Card summary_large_image globalmente.
6. Adicione link rel="canonical" via Next metadata.

Checkpoint:
- /sitemap.xml retorna XML válido com 50+ URLs
- /robots.txt retorna conforme.
- Cada página tem JSON-LD inspecionável.
- Validar via https://validator.schema.org.

Commit: "feat(seo): sitemap dinâmico, robots, JSON-LD, metadata enriquecida"
```

---

### Sessão 15 — Performance, acessibilidade, testes

```
Tarefa:

1. Rode Lighthouse em mobile e desktop para Home, página de programa, página de evento. Anote scores.
2. Otimize:
   - Imagens com <ImagemSoberana> em todas as instâncias.
   - sizes explícito.
   - priority no hero de cada página.
   - dynamic import em FiltrosAgenda e MenuMobileDrawer se ainda não estiverem.
3. Auditoria de acessibilidade com axe-core em CI:
   - npx @axe-core/cli http://localhost:3000 - relatório
   - Corrigir TODOS os violations critical e serious
4. Testes Vitest unitários para:
   - lib/integracoes/rdstation (mock fetch)
   - lib/integracoes/resend (mock SDK)
   - validação Zod dos formulários
5. Testes Playwright e2e para:
   - Submit do form de proposta cria Lead
   - Submit do form de contato cria Lead
   - Navegação Home → Programa → Evento

Checkpoint:
- Lighthouse: 95+ em todas as quatro métricas (Performance, Acessibilidade, SEO, Best Practices)
- axe-core: 0 violations critical
- CI verde com todos os testes

Commit: "chore: performance + a11y + testes unitários e e2e"
```

---

### Sessão 16 — Headers de segurança, observabilidade, monitoramento

```
Leia doc 10 Seções 10 e 11.

Tarefa:

1. apps/web/middleware.ts com headers de segurança (CSP, HSTS, X-Frame-Options etc.) — doc 10, 10.4.
2. Configurar Sentry em apps/web e apps/cms.
3. Endpoint apps/web/app/api/health/route.ts retornando status de banco/R2/RD Station.
4. Adicionar Vercel Analytics ou Plausible.
5. Validar SPF/DKIM/DMARC do domínio para Resend.

Checkpoint:
- securityheaders.com nota A ou A+.
- Sentry recebe erro de teste.
- /api/health responde JSON correto.

Commit: "feat(seguranca): headers de segurança, Sentry, health endpoint, analytics"
```

---

### Sessão 17 — Smoke test institucional e ajustes finais

```
Esta sessão é dirigida — não é codificação livre.

Eu (Instituto NTC) vou conduzir teste com 6-8 usuários representativos navegando o staging. Você (Claude Code) ficará em standby para corrigir bugs encontrados ao vivo.

Lista de cenários a testar:
1. Secretário de Educação entra pela home, navega até NTC Educação, clica em programa PROGE, solicita proposta.
2. Gestor intermediário entra pela /agenda, filtra por presencial e Educação, abre evento, clica em "Inscreva-se" (deve abrir aba externa).
3. Servidor público entra pela busca, abre /eventos/[slug], inscreve-se no link externo.
4. Imprensa entra por /contato, envia mensagem de assunto "imprensa".
5. Candidato a docente envia candidatura com PDF.
6. Navegação por teclado completa.
7. Mobile: todos os fluxos acima.

Para cada bug encontrado:
- Você prioriza (P0/P1/P2)
- Corrige P0s na hora
- Documenta P1/P2 para depois

Commit por bug: "fix: <descrição>"
```

---

### Sessão 18 — Deploy de produção

```
Esta sessão exige decisões humanas. Você executa após cada confirmação.

1. Confirme que todas as variáveis de ambiente PROD estão na Vercel:
   - DATABASE_URI apontando para ntc_prod
   - PAYLOAD_SECRET de produção
   - R2 com bucket ntc-prod-media
   - RDSTATION_TOKEN
   - RESEND_API_KEY
   - SENTRY_DSN
   - REVALIDATE_SECRET (novo, gerado)

2. Configure DNS na Cloudflare:
   - gruponctc.org.br → Vercel (A/CNAME)
   - media.gruponctc.org.br → R2
   - Manter MX existente (e-mail institucional)

3. Crie tag v1.0.0 no GitHub:
   git tag -a v1.0.0 -m "Portal Grupo NTC v1 Enxuto Premium"
   git push origin v1.0.0

4. Confirme que o GitHub Action de deploy disparou para Vercel produção.

5. Aguarde build (~3-5 min).

6. Smoke test em gruponctc.org.br:
   - Home carrega
   - Página de programa carrega
   - Página de evento carrega
   - Formulário submete e Lead chega
   - Lighthouse mantém scores verdes

7. Anuncie publicamente apenas após smoke test verde.

Commit final: "release: v1.0.0 — Portal Grupo NTC v1 Enxuto Premium"
Tag: v1.0.0
```

---

## Cadência pós-lançamento

A partir da v1.0.0 publicada:

- **Cadastro editorial autônomo** pela equipe — eventos novos publicados em ≤5 segundos.
- **Janela de manutenção evolutiva** semanal (sextas, 2h).
- **Bug fixes** em qualquer dia, em hotfix branch.
- **Próxima releases (v1.1, v1.2)** com features menores conforme demanda editorial.
- **v2** será iniciada quando OTT própria estiver pronta — novo pacote-briefing será emitido.

---

## Prompts emergenciais

Em incidentes, use prompts diretos:

```
INCIDENTE: <descrição curta>
URL afetada: <url>
Sintoma: <o que está acontecendo>
Console: <erros do navegador / logs do servidor>

Investigue, proponha causa-raiz, NÃO codifique solução sem minha confirmação.
```

```
URGENTE: Lead não está chegando no RD Station.

Verifique:
1. Logs do Sentry para erro de integração
2. Coleção Leads no Payload — campo sincronizacaoCrm.erroUltimaTentativa
3. Status do RD Station via dashboard deles

Reporte diagnóstico antes de mexer em código.
```

---

**Fim do documento.**
*Prompts Iniciais Claude Code · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
