# Documento de Arquitetura Técnica do Backend (DAB)
## Portal Grupo NTC · v1 Enxuto Premium · Sprint F

**Versão:** 1.1 · 19 de maio de 2026
**Cliente:** Instituto NTC do Brasil
**Marca:** Grupo NTC — Núcleo de Tecnologia e Conhecimento
**Verticais:** NTC Educação · NTC Gestão Pública · NTC Saúde
**Documento-origem:** `01_Concepcao_Estrategica_Portal_GrupoNTC_v1.md`
**Status editorial:** Versão de execução para Sprint F dirigida por Claude Code

### Histórico de revisões

- **v1.1 — 19 de maio de 2026** — substituições no stack de backend, decididas no início da Sprint F:
  - **Banco** Neon Postgres SP → **Supabase Postgres SP** (`sa-east-1`).
  - **Mídia** Cloudflare R2 → **Supabase Storage** via endpoint S3-compatible.
  - **CRM externo (RD Station)** removido. A coleção `Lead` no Payload passa a ser a fonte única de leads; notificação ativa continua via Resend (e-mail interno + confirmação ao usuário) e dashboard no admin.
  - **Hospedagem** continua Vercel; tier alvo é Pro (Web + CMS unificados, sem split de deploy).
  - Princípio de soberania de dados em São Paulo (§2.6) preservado: Supabase projeto em `sa-east-1`.
- **v1.0 — 15 de maio de 2026** — versão original de execução para Sprint F.

---

## Sumário

1. Sumário Executivo
2. Princípios Norteadores
3. Stack Tecnológica
4. Topologia de Deploy e Infraestrutura
5. Modelo de Dados (Alto Nível)
6. Estratégia de Renderização
7. Contratos de API dos Formulários
8. Arquitetura Comum dos Formulários
9. Integrações Externas v1
10. Segurança, Autenticação Administrativa e LGPD
11. Observabilidade e Logs
12. Performance e SEO Técnico
13. CI/CD, Ambientes e Branching
14. Plano de Release da Sprint F
15. Roadmap de Evolução — v1 → v2 (OTT própria)
16. Premissas, Restrições e Pontos de Atenção
17. Glossário Técnico

---

## 1. Sumário Executivo

Este documento estabelece a arquitetura técnica do backend do Portal Grupo NTC em sua versão 1 enxuta premium. A versão 1 nasce sob duas restrições estratégicas explícitas. A primeira é temporal — o Grupo NTC precisa do portal no ar em janela de 4 a 6 semanas para começar a publicar as informações editoriais dos eventos. A segunda é operacional — o ciclo de inscrição, controle de presença, replay e certificação será operado, nesta fase, por uma plataforma terceira em negociação, com integração leve via link externo configurável por evento. A versão 2, prevista para quando a OTT proprietária do Grupo NTC estiver pronta, absorverá nativamente o ciclo do participante. Toda decisão deste documento é tomada para preservar essa evolução sem retrabalho.

A arquitetura adotada é **headless premium em Next.js + Payload CMS**, com renderização híbrida (estática, ISR e SSR conforme a página), banco PostgreSQL gerenciado pelo Supabase em região São Paulo, mídia em Supabase Storage (endpoint S3-compatible), formulários institucionais persistidos no banco próprio como coleção `Lead` (sem CRM externo na v1), e-mail transacional via Resend (ou Amazon SES como alternativa). O front-end replica com fidelidade absoluta os protótipos HTML já aprovados — paleta Soberana 2026, tipografia Cormorant Garamond e Barlow, hierarquia 60·15·10·5, ausência de gradientes e bordas arredondadas em estruturas. O CMS é tratado como ferramenta de produtividade editorial restrita: o editor preenche schemas controlados, nunca rompe identidade visual.

O resultado entregue por este DAB é um portal que parece extensão institucional do Grupo NTC, não plataforma genérica. Edição autônoma da equipe sem janela de manutenção técnica para cadastros do dia a dia. Performance edge global com Core Web Vitals em verde. Caminho técnico desobstruído para a versão 2 com OTT.

---

## 2. Princípios Norteadores

A arquitetura segue oito princípios não negociáveis. Eles funcionam como filtro de decisão em qualquer ponto ambíguo do desenvolvimento.

**2.1. Separação rigorosa entre conteúdo editorial e serviços de negócio.** O CMS guarda o que é editorial — programas, eventos, áreas, docentes, conteúdos — e também a coleção `Lead` (registro estruturado de formulários institucionais), com fronteiras claras entre as duas. Os disparos de e-mail e eventuais webhooks para serviços externos são serviços de negócio, expostos por rotas dedicadas da camada de aplicação. Misturar conteúdo editorial com pipelines transacionais no mesmo modelo é o vício clássico de portais WordPress que esta arquitetura recusa.

**2.2. Componente é fonte única de verdade visual.** Todo bloco aprovado nos protótipos vira componente React tipado. O CMS preenche dados; nunca preenche layout. Não há "campos de HTML livre" disponíveis para o editor. Editores produtivos, identidade preservada.

**2.3. Renderização adequada ao perfil de cada página.** Páginas institucionais e de programa em SSG/ISR longo (1 hora ou mais), agenda e eventos em ISR curto (5 a 15 minutos), formulários e qualquer rota administrativa em SSR. Não se renderiza dinamicamente o que pode ser estático. Velocidade é estética.

**2.4. Schema controlado, liberdade editorial limitada.** O editor pode trocar texto, imagem, datas, links — não pode trocar tipografia, cor, espaçamento, ordem de blocos canônicos. Tokens visuais são constantes do código.

**2.5. LGPD by design em todo formulário.** Consentimento explícito antes do submit, finalidade declarada, registro de aceite com timestamp e IP, política de privacidade linkada, prazo de retenção visível, rota de exclusão para o titular. Não há formulário no portal sem essas seis garantias.

**2.6. Soberania de dados em São Paulo.** Banco e mídia em região brasileira. Front-end pode rodar no edge global (Vercel), mas dados pessoais e operacionais ficam sob jurisdição BR. Argumento institucional decisivo para interlocução com Administração Pública.

**2.7. Arquitetura preparada para v2 com OTT.** Cada decisão é validada contra a pergunta: "Quando a OTT entrar, isso vira gargalo?" Schema do CMS já prevê campos de futura sincronização com a plataforma de eventos própria; estrutura de Eventos já contempla `linkInscricaoExterna` hoje e `inscricaoNativa` amanhã, sem migração disruptiva.

**2.8. IA executora orientada, não autônoma.** O Claude Code recebe instruções denominadas, mapas, schemas e prompts ancorados. Não improvisa modelagem nem cria componentes novos sem autorização explícita. O CLAUDE.md operacional é fonte de verdade durante toda execução.

---

## 3. Stack Tecnológica

A stack adotada é minimalista e premiada por maturidade. Não há experimentalismo. Cada peça é escolhida por aderência ao problema, por base instalada de profissionais qualificados no Brasil e por compatibilidade com o roadmap v2.

**Camada de aplicação (front-end e API).** Next.js 15 com App Router, em TypeScript 5.4 ou superior, modo strict ativado. React 19. Renderização híbrida via React Server Components onde fizer sentido, Client Components quando houver interatividade. Tailwind CSS 4 com tokens da paleta Soberana 2026 definidos em `theme.config.ts`. Fontes auto-hospedadas via `next/font` (Cormorant Garamond e Barlow, com `font-display: swap`). Lint com ESLint 9 e formatação com Prettier 3. Testes unitários com Vitest, testes de integração com Playwright nos fluxos críticos.

**Camada de CMS.** Payload CMS 3 LTS, em modo self-hosted no mesmo monorepo do front-end (app dedicado `apps/cms`), expondo admin em `/admin` e API REST/GraphQL em `/api`. Adapter PostgreSQL oficial (`@payloadcms/db-postgres`). Editor rich text com **Lexical** (default do Payload 3), com config restritivo (apenas headings, bold, italic, links, listas — sem cores nem fontes customizadas pelo editor). Storage adapter para Supabase Storage via `@payloadcms/storage-s3` apontando ao endpoint S3-compatible do Supabase (`https://<ref>.storage.supabase.co/storage/v1/s3`).

**Camada de persistência.** PostgreSQL 17 gerenciado pelo Supabase. Região: `sa-east-1` (São Paulo). Conexão via pooler PgBouncer (porta 6543) em modo Transaction para compatibilidade com workloads serverless do Next.js/Payload. Backup diário automático com retenção de 7 dias no plano Free e 30 dias no Pro. Branching de banco disponível no Pro para deploys de PR (futura adoção).

**Camada de mídia.** Supabase Storage via endpoint S3-compatible (`/storage/v1/s3`). Bucket único `ntc-portal-media` com pastas semânticas (`/eventos`, `/programas`, `/docentes`, `/conteudos`, `/institucional`). Acesso server-side via `@payloadcms/storage-s3` no Payload — o adapter genérico preserva a portabilidade do conteúdo caso o provedor seja trocado no futuro. CDN nativa do Supabase. Domínio customizado `media.gruponctc.org.br` previsto para a Janela C.

**Camada de e-mail.** Resend como provedor primário (DX excelente, templates React Email, dashboard editorial), Amazon SES como alternativa caso o volume mensal supere 50 mil envios. Domínio de envio: `nao-responda@gruponctc.org.br` para transacional, `contato@gruponctc.org.br` para respostas humanas. Templates da Janela B: confirmação ao usuário e **notificação interna à equipe NTC com link direto ao Lead no admin** (substitui o papel antes ocupado pela esteira RD Station).

**Camada de gestão de leads.** Sem CRM externo na v1. A coleção `Lead` no Payload é a fonte única de leads — todos os submits dos formulários institucionais persistem ali com `tipo`, `status` (novo · em-atendimento · qualificado · descartado · convertido), origem (UTMs, página, referrer), consentimento LGPD e payload bruto. O admin do Payload oferece filtros, exportação CSV e dashboard editorial. Integração com RD Station ou outro CRM pode ser plugada no futuro via webhook do `afterChange` da coleção — sem refatoração disruptiva.

**Camada de observabilidade.** Sentry para captura de erros (front e back), com source maps habilitados em produção. Logs estruturados em JSON via Pino no servidor. Vercel Analytics ou Plausible (auto-hospedado) para web analytics em compliance LGPD por padrão.

**Camada de hospedagem.** Vercel Pro para front (`apps/web`) e CMS (`apps/cms`) — dois deploys separados a partir do mesmo monorepo, com timeouts de 60s nas funções (necessário para o boot do admin do Payload, que excede o limite de 10s do tier Free). Estratégia possível em ambiente de avaliação: Vercel Free para `apps/web` enquanto o tráfego não exige Pro, com CMS em Render Starter; promover para Pro unificado quando o portal estiver em produção.

**Repositório e CI/CD.** GitHub privado, GitHub Actions para pipeline de testes, lint e build em todo PR. Deploy automático para staging em todo merge na branch `develop`, deploy manual para produção a partir de tags `v*.*.*` na branch `main`.

---

## 4. Topologia de Deploy e Infraestrutura

A topologia é deliberadamente simples — três blocos lógicos, conexões explícitas. Toda complexidade que não justifica seu custo de manutenção foi excluída.

**Bloco 1 — Aplicação.** Vercel Pro hospeda dois projetos a partir do mesmo monorepo: `apps/web` (Next.js front-end + API routes públicas) e `apps/cms` (Payload com admin em `/admin` e API REST/GraphQL em `/api`). Edge runtime para rotas estáticas e ISR, Node runtime para rotas dinâmicas que falam com banco. Variáveis de ambiente segregadas por ambiente (Preview, Development, Production). Domínio principal `gruponctc.org.br` apontando para o web em produção; `staging.gruponctc.org.br` para staging; `admin.gruponctc.org.br` (ou `cms.gruponctc.org.br`) apontando para o deploy do CMS.

**Bloco 2 — Banco.** Supabase Postgres 17 na região `sa-east-1` (São Paulo). Dois projetos: `portal-ntc-staging` e (futuramente) `portal-ntc-prod`. Connection pooling habilitado via PgBouncer Transaction mode (porta 6543) — essencial para o modelo serverless da Vercel. Schema gerenciado por Payload (sem migrations manuais — Payload gera; histórico mantido em `apps/cms/src/migrations` quando necessário).

**Bloco 3 — Mídia.** Supabase Storage bucket `ntc-portal-media` (público para leitura, escrita restrita ao service-role do CMS). Acesso via endpoint S3-compatible em `https://<ref>.storage.supabase.co/storage/v1/s3`. Limite de 50 MB por arquivo, mimetypes restritos (imagens, PDF, MP4/WebM). Política de cache 1 ano para assets versionados (hash no nome). Domínio customizado `media.gruponctc.org.br` previsto para Janela C.

**Conexões.** Aplicação → Banco via connection string TLS no pooler (variável `DATABASE_URI`). Aplicação → Storage via S3 SDK assinando contra Supabase (variáveis `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_BUCKET`). Aplicação → Resend via SDK (variável `RESEND_API_KEY`).

**DNS.** Cloudflare gerenciando o DNS de `gruponctc.org.br`, com registros A/CNAME para Vercel (web e cms), CNAME para `media.gruponctc.org.br` apontando para Supabase Storage, MX apontando para provedor de e-mail institucional já existente (Google Workspace ou Microsoft 365), TXT para SPF/DKIM/DMARC do Resend.

**Domínios complementares (opcionais).** `eventon.gruponctc.org.br` reservado para a plataforma terceira de eventos durante v1, e para a OTT própria na v2. `admin.gruponctc.org.br` (CNAME para Vercel) como alternativa ao acesso `/admin` da raiz, caso se queira ocultar a presença do admin do domínio principal.

---

## 5. Modelo de Dados (Alto Nível)

O modelo de dados é detalhado em sua totalidade no documento companheiro `11_Schema_Payload_CMS_v1.md`, com blocos TypeScript prontos para colar. Aqui consolido apenas a visão de alto nível e as relações entre entidades.

O portal opera com **oito coleções** e **dois globals**. Coleções são entidades com múltiplas instâncias; globals são singletons editáveis.

**Coleções.** `Area` (3 instâncias fixas: Educação, Gestão Pública, Saúde). `Programa` (15 instâncias, vinculadas a uma Área). `Modulo` (vários, vinculados a um Programa — sem página própria, apresentado dentro da página do Programa). `Evento` (N instâncias, vinculado opcionalmente a um Programa, com campos de modalidade, data, link de inscrição externa). `Especialista` (docentes e palestrantes; relacionamento many-to-many com Programa e Evento). `Conteudo` (artigos, insights, publicações; com taxonomia de área e categoria). `Cliente` (instituições atendidas para vitrine de credibilidade). `Lead` (persistência dos quatro formulários, com discriminator `tipo`).

**Globals.** `Home` (campos editoriais da home: hero, destaques, agenda em destaque, áreas em foco, CTA institucional). `Rodape` (informações institucionais, contatos, links legais, redes sociais).

**Relações principais.** Programa pertence a Area (many-to-one). Modulo pertence a Programa (many-to-one). Evento pertence opcionalmente a Programa (many-to-one) e a Area (many-to-one, derivado ou direto). Evento referencia Especialistas (many-to-many). Programa referencia Especialistas (many-to-many). Conteudo pertence a uma Area opcional. Lead referencia opcionalmente um Programa (quando vier de form de proposta de programa) ou Evento.

**Princípio de extensão para v2.** A coleção Evento já prevê campos `linkInscricaoExterna` (URL), `plataformaTerceira` (select com opções a expandir) e um bloco reservado `inscricaoNativa` (group desabilitado em v1, ativado quando OTT entrar). A coleção Especialista já prevê `apresentacaoOTT` para futuro perfil público na plataforma própria. Nenhuma migração disruptiva será necessária.

---

## 6. Estratégia de Renderização

Cada rota do portal recebe o modo de renderização adequado ao seu perfil de atualização e ao seu peso no funil. A regra mestre: não se renderiza dinamicamente o que pode ser estático.

**SSG (Static Site Generation) com revalidate longo (3600s, 1h).** Páginas institucionais que mudam raramente: Home, O Grupo, Soluções Estratégicas (e sub-páginas de área), página de cada Programa, página de cada Especialista, Conteúdos (lista e detalhe), Contato, Política de Privacidade, Termos de Uso.

**ISR (Incremental Static Regeneration) com revalidate curto (300s, 5 minutos).** Páginas com cadência operacional: Agenda geral, listas filtradas de Eventos (online, presencial, por programa, por área), página individual de cada Evento.

**SSR (Server-Side Rendering).** Páginas e rotas com interação dinâmica autenticada: `/admin` (Payload nativo), futuras rotas da Área do Participante na v2.

**On-Demand Revalidation.** Webhook do Payload dispara revalidação imediata da página correspondente quando o editor publica/atualiza um Evento ou Programa. Reduz a latência editorial a zero — publicado, no ar em até 5 segundos.

**Estratégia de imagens.** `next/image` em todas as imagens, com componente `<ImagemSoberana>` wrapper aplicando configurações padrão (loading, sizes, quality 85, placeholder blur). Supabase Storage como source. Otimização automática pela Vercel Image Optimization.

---

## 7. Contratos de API dos Formulários

Cada formulário institucional expõe uma rota POST dedicada sob `/api/forms/*`. Contrato comum: payload JSON com campos do formulário + metadados (origem, campanha, timestamp, consentimento LGPD). Resposta JSON com `{ ok: boolean, leadId: string, message: string }`.

**7.1. `POST /api/forms/proposta`** — Solicitação de Proposta / Interesse em Programa.

Request body (TS):
```typescript
{
  programaId?: string;        // ID Payload do programa, opcional
  areaId?: string;            // ID Payload da área, opcional
  modalidade: 'in-company' | 'turma-aberta' | 'sob-medida' | 'proposta-livre';
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  instituicao: string;
  esfera: 'municipal' | 'estadual' | 'federal' | 'privada' | 'terceiro-setor';
  participantesEstimados?: number;
  mensagem: string;
  origem: { utm_source?: string; utm_medium?: string; utm_campaign?: string; pagina: string; };
  consentimentoLgpd: { aceito: true; timestamp: string; politicaVersao: string; };
}
```

Pipeline server-side: validação Zod estrita → persistência em `leads` (Payload collection) com `tipo: 'proposta'`, `status: 'novo'`, origem (UTMs, página, referrer) e consentimento LGPD → e-mail de notificação interna para `contato@gruponctc.org.br` com template editorial e **link direto ao Lead no admin** (`{PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/leads/{id}`) → e-mail de confirmação para o solicitante com template editorial → retorno `{ ok: true }`.

**7.2. `POST /api/forms/contato`** — Contato Institucional Geral.

Request body: nome, email, telefone, instituicao, assunto (select: imprensa, parcerias, fornecedor, duvida-institucional, outro), mensagem, origem, consentimentoLgpd.

Pipeline: validação → persistência em `leads` (`tipo: 'contato'`, com `assunto` no payload) → e-mail interno roteado conforme assunto (imprensa → `imprensa@`, parcerias → `parcerias@`, demais → `contato@`) com link ao Lead no admin → confirmação ao usuário → retorno.

**7.3. `POST /api/forms/newsletter`** — Cadastro de Newsletter.

Request body: nome, email, areasInteresse (array), origem, consentimentoLgpd.

Pipeline: validação → persistência em `leads` (`tipo: 'newsletter'`, com `areasInteresse`) → e-mail de boas-vindas → retorno. A lista de inscritos vive no admin do Payload; export CSV disponível para uso em campanhas pontuais via Resend Audiences ou similar quando necessário.

**7.4. `POST /api/forms/candidatura-especialista`** — Candidatura de Especialista/Docente.

Request body: nome, email, telefone, titulacao, instituicao, linhasAtuacao (array de áreas), apresentacao (texto), linkLattes, linkLinkedin, anexoCurriculo (upload), origem, consentimentoLgpd.

Pipeline: validação → upload do currículo no Supabase Storage (pasta `candidaturas/`) → persistência da Lead (`tipo: 'candidatura'`) com referência ao arquivo via Media collection → e-mail interno para `corpo-docente@gruponctc.org.br` com link do anexo e link ao Lead no admin → confirmação ao candidato → retorno.

**Endpoint de exclusão LGPD.** `POST /api/forms/exclusao-lgpd` recebe e-mail e dispara fluxo interno de remoção (não é exclusão automática — toda solicitação passa por DPO designado por questão de auditoria).

---

## 8. Arquitetura Comum dos Formulários

Cada formulário do portal compartilha o mesmo esqueleto técnico e visual. Variam os campos; não variam as garantias.

**Camada de UI.** Componente React `<FormularioSoberano>` com props que descrevem os campos. Tipografia Barlow para labels e inputs, Cormorant Garamond para títulos editoriais do formulário. Erros de validação inline em cor `--vermelho-erro` (definido no design system). Loading state com indicador editorial discreto (não spinner genérico). Estado de sucesso premium: substituição do formulário por bloco editorial de confirmação com tipografia cerimonial e CTA secundário (ex.: "Conheça o programa PROGE enquanto aguarda nossa resposta").

**Camada de validação.** Zod schema espelhando o contrato da API. Validação client-side imediata (libera o submit apenas com tudo válido) + revalidação server-side obrigatória.

**Camada de persistência.** Coleção `Lead` em Payload com discriminator `tipo` (proposta | contato | newsletter | candidatura) e payload bruto em campo JSON para auditoria. Cada Lead recebe `status` (novo | em-atendimento | qualificado | descartado | convertido) editável no admin, com campos opcionais de `responsavel` (relação com `users`) e `notasInternas` (texto). Sem CRM externo — a coleção `Lead` é a fonte única.

**Camada de notificação interna.** E-mail HTML editorial enviado via Resend para destinatário interno apropriado (`contato@`, `imprensa@`, `parcerias@`, `corpo-docente@` conforme tipo e assunto), com prévia dos dados, **link direto para o Lead no admin** (`{PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/leads/{id}`), origem, UTMs e consentimento LGPD registrado. Esta camada substitui o papel antes ocupado pela integração externa de CRM (notificação ativa garante que nenhum lead fique invisível até a equipe abrir o admin).

**Camada de notificação ao usuário.** E-mail de confirmação com template editorial premium — header com lockup do Grupo NTC, corpo em Cormorant Garamond e Barlow, mensagem institucional ("Recebemos sua solicitação. Em até X horas úteis, um de nossos consultores institucionais entrará em contato."), assinatura institucional, rodapé com links legais.

**Camada de captura de origem.** Em todo formulário, o componente captura automaticamente: URL atual da página, UTMs (de query string e do cookie de primeira visita), referrer, timestamp. Esses dados são gravados no Lead para análise editorial e funcionam como base para a régua de qualificação manual da equipe NTC no admin.

**Camada LGPD.** Checkbox obrigatório ("Li e concordo com a Política de Privacidade") com link aberto em modal. Versão da política referenciada no payload (`politicaVersao: "2026-05-01"`). Timestamp e IP do aceite registrados.

**Camada de proteção.** Rate limit por IP (5 submits / hora / endpoint) via middleware. hCaptcha invisível em todos os formulários (chave armazenada em env). Sanitização de inputs contra XSS pelo próprio React + escapagem extra em e-mails.

---

## 9. Integrações Externas v1

A v1 opera com integrações estritamente necessárias. Sem CRM externo — a coleção `Lead` no Payload é a fonte única. Toda integração de e-mail tem fallback gracioso: se o envio falhar, o lead **nunca se perde** — já está persistido no banco com `status: 'novo'`, e job de retry processa pendências.

**9.1. Resend (e-mail transacional).** Templates React Email em `/emails/*.tsx`. Quatro templates de confirmação ao usuário: `ConfirmacaoProposta`, `ConfirmacaoContato`, `BoasVindasNewsletter`, `ConfirmacaoCandidatura`. Quatro templates de notificação interna: `NotificacaoInternaProposta`, `NotificacaoInternaContato`, `NotificacaoInternaNewsletter`, `NotificacaoInternaCandidatura` — cada um com prévia dos dados, link ao Lead no admin, UTMs e aceite LGPD. Domínio verificado `gruponctc.org.br` com SPF/DKIM/DMARC. Disparo em background (`waitUntil` da Vercel) para não bloquear a resposta ao usuário.

**9.2. Plataforma terceira de eventos (provisória).** Sem integração ativa. Apenas campo `linkInscricaoExterna` no Evento. Botão "Inscreva-se" no front faz `<a href={evento.linkInscricaoExterna} target="_blank">` com tracking de clique via analytics. Quando a plataforma for definida, abre-se issue para integração específica.

**9.3. Analytics.** Vercel Analytics (incluído no Pro) para Core Web Vitals e tráfego básico, sem cookies. Plausible (auto-hospedado ou SaaS) para tráfego detalhado em compliance LGPD por padrão. Eventos personalizados: clique em "Inscreva-se" (com `eventoSlug`), submit de cada formulário (com `formularioTipo`), download de material editorial.

**9.4. hCaptcha.** Captcha invisível em todos os formulários. Free tier suficiente para o volume previsto.

**9.5. Extensibilidade futura (CRM).** Se a equipe decidir plugar um CRM externo (RD Station, HubSpot, Pipedrive) no futuro, o ponto de integração é um hook `afterChange` na coleção `Lead` que dispara webhook autenticado para o serviço. O contrato `Lead` foi desenhado para essa extensibilidade — sem necessidade de refatorar formulários ou rotas de API.

---

## 10. Segurança, Autenticação Administrativa e LGPD

A segurança do portal cobre quatro frentes: acesso administrativo, dados em trânsito e em repouso, exposição pública e LGPD.

**10.1. Acesso administrativo.** Payload Admin em `/admin` (ou `admin.gruponctc.org.br`) com autenticação nativa. **2FA obrigatório** para todos os usuários (TOTP via plugin Payload ou middleware). Quatro perfis de acesso: `super-admin` (acesso total, 1-2 pessoas), `editor-institucional` (Programas, Áreas, Conteúdos, Especialistas, Globals), `editor-eventos` (Eventos, Módulos), `atendimento-comercial` (acesso somente Leads). Logs de todas as ações administrativas em coleção `AuditLog` (timestamp, usuário, ação, entidade afetada).

**10.2. Dados em trânsito.** HTTPS obrigatório (HSTS habilitado), TLS 1.3, certificados gerenciados pela Vercel/Cloudflare.

**10.3. Dados em repouso.** Banco com encriptação at-rest nativa do provedor. Variáveis de ambiente nunca em código — sempre em Vercel Environment Variables com escopo restrito. Senhas administrativas com hash Argon2 (default Payload).

**10.3.1. Isolamento da Data API do Supabase.** O Supabase expõe automaticamente todas as tabelas do schema `public` via PostgREST/GraphQL com a chave `anon`. Como o Payload tem autorização própria (collections, access functions, JWT do Payload) e o front-end nunca fala diretamente com o Supabase, **o schema `public` é removido da lista de "Exposed schemas"** em Settings → API → Data API. Só os schemas `graphql_public` e `storage` permanecem expostos (necessários para Storage assinado e endpoints públicos de imagem). Adicionalmente, **RLS deny-all (sem políticas)** é habilitado em todas as tabelas do schema `public` como defesa em profundidade — o Payload usa o role `postgres` na connection string, que bypassa RLS, então a aplicação continua funcionando normalmente; a `anon key` bate em parede ao tentar ler ou modificar qualquer linha. Validado em 19/05/2026 com `INSERT` anônimo na tabela `users` retornando `42501 / new row violates row-level security policy`.

**10.4. Exposição pública.** Headers de segurança via middleware Next.js: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritivo.

**10.5. LGPD by design.** Banner de cookies com consentimento granular (categorias: essencial, analytics, marketing — apenas essencial é pré-marcado). Política de Privacidade detalhada em `/politica-de-privacidade` com versão e data. Termos de Uso em `/termos-de-uso`. Página `/lgpd/solicitar-exclusao` com formulário e fluxo manual auditável. DPO institucional designado e e-mail `dpo@gruponctc.org.br` publicado no rodapé. Retenção padrão dos Leads: 24 meses (configurável por tipo). Job mensal de purga de Leads vencidos com aceite explícito do DPO.

---

## 11. Observabilidade e Logs

A observabilidade é desenhada para que problemas sejam diagnosticados em minutos, não em horas.

**11.1. Captura de erros.** Sentry integrado ao Next.js (front + server) com source maps em produção. Alerta por e-mail para `tech@gruponctc.org.br` (ou equivalente) em qualquer erro com `level: error`. Agrupamento por fingerprint nativo. Liberação de release a cada deploy.

**11.2. Logs estruturados.** Pino no servidor, em JSON, com níveis (debug, info, warn, error). Logs de Vercel Functions visíveis no dashboard. Logs administrativos do Payload (`AuditLog`) em banco.

**11.3. Monitoramento de saúde.** Endpoint `/api/health` retornando status do banco e do Supabase Storage. Uptime monitorado por UptimeRobot ou Better Stack (free tier).

**11.4. Métricas editoriais.** Vercel Analytics + Plausible respondem por tráfego, conversão, top pages, tempo médio. Dashboard administrativo no Payload com widgets: total de leads por tipo, leads por origem, leads por status, eventos publicados, próximos eventos.

---

## 12. Performance e SEO Técnico

A performance é tratada como requisito editorial, não como tarefa de otimização tardia. Velocidade é parte da estética.

**12.1. Core Web Vitals — metas.** LCP ≤ 1.8s, CLS ≤ 0.05, INP ≤ 200ms em P75 mobile. Auditoria via Lighthouse e PageSpeed Insights antes de cada deploy de produção.

**12.2. Estratégia de bundle.** Componentes em modo Server Components por padrão; Client Components apenas onde há interação. `dynamic()` para módulos pesados que entram fora da fold. Análise de bundle com `@next/bundle-analyzer` antes de cada release.

**12.3. Estratégia de imagens.** Imagens em Supabase Storage, servidas via Vercel Image Optimization. Formatos modernos (AVIF, WebP) com fallback. `sizes` explícito em todo componente. Lazy load default; eager apenas no hero da página.

**12.4. Fontes.** Cormorant Garamond e Barlow servidas auto-hospedadas via `next/font` com subsets latin e latin-ext, `display: swap`, preload das variantes usadas above-the-fold. Fallback stack premium (`Georgia, 'Times New Roman', serif` para Cormorant; `system-ui, sans-serif` para Barlow).

**12.5. Cache.** ISR com revalidate adequado por rota (Seção 6). Headers `Cache-Control` explícitos em assets. Stale-while-revalidate na CDN.

**12.6. SEO técnico.** `sitemap.xml` dinâmico gerado por rota Next.js. `robots.txt` permitindo indexação total exceto `/admin` e `/api`. Metadados Open Graph e Twitter Cards completos em toda página. JSON-LD `Organization`, `EducationalOrganization`, `Event`, `Course`, `Person` conforme o tipo de página. Breadcrumbs com schema. URLs canônicas explícitas.

**12.7. Acessibilidade.** WCAG 2.1 AA. Contraste mínimo 4.5:1 em corpo, 3:1 em títulos grandes (já garantido pela paleta Soberana). Navegação completa por teclado. Skip-links. `aria-label` nos elementos interativos sem texto visível. Testes com `axe-core` em CI.

---

## 13. CI/CD, Ambientes e Branching

Pipeline minimalista, três ambientes, fluxo Git trunk-based modificado.

**13.1. Branches.** `main` (produção, deploy manual por tag), `develop` (staging, deploy automático), feature branches efêmeras (`feat/...`, `fix/...`).

**13.2. Pipeline CI (GitHub Actions).** Em todo PR: lint, type-check (`tsc --noEmit`), testes unitários (Vitest), testes de integração nas rotas de formulário (Playwright headless), build de produção, análise de bundle. Falha em qualquer etapa bloqueia o merge.

**13.3. Ambientes.**

- **Development.** Local. `.env` aponta para projeto Supabase `portal-ntc-staging` (compartilhado com staging) e bucket `ntc-portal-media`.
- **Preview.** Cada PR gera deploy automático Vercel com URL `*.vercel.app`. Banco compartilhado com staging.
- **Staging.** `staging.gruponctc.org.br`. Deploy automático em merge na `develop`. Projeto Supabase `portal-ntc-staging`. Bucket `ntc-portal-media`.
- **Production.** `gruponctc.org.br`. Deploy manual via tag `v*.*.*`. Projeto Supabase `portal-ntc-prod` (criar na Janela C). Bucket `ntc-portal-media` (mesmo nome no projeto prod).

**13.4. Migrações de schema.** Payload gera automaticamente. Em staging, aplica imediatamente. Em produção, executa em janela aprovada manualmente. Histórico versionado em `apps/cms/src/migrations` quando o Payload exigir migrations explícitas (modelos com transformações de dados, alterações destrutivas).

**13.5. Rollback.** Vercel permite rollback instantâneo para qualquer deploy anterior. Banco com PITR (Point-in-Time Recovery) habilitado pelo Supabase, 7 dias no plano Free e 28 dias no Pro.

---

## 14. Plano de Release da Sprint F

A Sprint F é dividida em três janelas operacionais. Cada janela tem entregas concretas, critérios de aceite e demos.

**Janela A — Fundação (semanas 1–2).** Scaffold do monorepo Turborepo. Setup do Payload com banco Supabase Postgres `portal-ntc-staging` (sa-east-1) e Supabase Storage (bucket `ntc-portal-media`). Setup do Next.js com Tailwind, fontes e tokens da paleta Soberana. Tematização do admin do Payload com cores e logo NTC. Criação das 8 coleções e 2 globals no schema (sem dados ainda). Componentes base do design system: `<HeroInstitucional>`, `<CardEvento>`, `<CardPrograma>`, `<BlocoNumeros>`, `<RodapeSoberano>`, `<NavegacaoSoberana>`, `<FormularioSoberano>`. Deploy staging funcional, admin acessível com 2FA. **Critério de aceite:** equipe editorial consegue logar no admin e cadastrar um programa-piloto.

**Janela B — Páginas institucionais e eventos (semanas 3–4).** Portagem dos HTMLs aprovados para componentes React: Home, O Grupo, Soluções Estratégicas, 3 páginas de Área, template de Programa carregando do CMS, template de Evento carregando do CMS, página Agenda com filtros, página Conteúdos, página Contato. Implementação dos 4 formulários institucionais com pipeline completo (persistência na coleção `Lead` → e-mail interno via Resend com link ao Lead no admin → confirmação ao usuário). Cadastro editorial dos 15 programas + 10–15 eventos iniciais pela equipe. **Critério de aceite:** o portal navega completo em staging, formulários gravam Leads, notificação interna por e-mail funciona, equipe NTC gerencia leads no admin.

**Janela C — Polimento, LGPD e lançamento (semanas 5–6).** SEO técnico (sitemap, schema.org, OG tags) finalizado. Páginas Política de Privacidade, Termos de Uso, LGPD/Exclusão publicadas. Banner de cookies. Headers de segurança. Auditoria Lighthouse (alvo: 95+ em todas as quatro métricas). Testes de carga leves. Domínio em produção, DNS migrado, deploy de produção. Smoke test institucional com 6–8 usuários representativos. **Critério de aceite:** portal no ar em `gruponctc.org.br`, com Core Web Vitals em verde e 4 formulários operantes.

**Cadência editorial pós-lançamento.** A partir da v1.0 publicada, eventos novos são cadastrados pela equipe editorial autonomamente, com publicação ao vivo em até 5 segundos (on-demand revalidate). Conteúdos editoriais (artigos, insights) seguem ritmo definido pela equipe.

---

## 15. Roadmap de Evolução — v1 → v2 (OTT própria)

Esta é a seção que torna o DAB premium: cada decisão da v1 é validada contra a v2.

**15.1. O que muda quando a OTT do Grupo NTC estiver pronta.** A OTT absorve o ciclo do participante: inscrição nativa (sem redirecionamento para plataforma terceira), gestão de presença, replay protegido, certificação automatizada com QR Code, área do participante com histórico, eventuais transmissões ao vivo embedadas.

**15.2. O que NÃO muda.** Stack, deploy, design system, schema editorial dos Programas/Áreas/Eventos/Especialistas/Conteúdos. Continuam intactos. A v2 é estritamente **aditiva**.

**15.3. Pontos de extensão já previstos no schema v1.**

- `Evento.linkInscricaoExterna` → torna-se opcional. Novo campo `Evento.inscricaoNativaAtiva: boolean`. Quando true, página de Evento mostra fluxo de inscrição interno.
- `Evento.plataformaTerceira` → fica como histórico; novos eventos usam OTT própria.
- Nova coleção `Inscricao` (participante × evento, com status, presença, replay assistido, certificado emitido).
- Nova coleção `Participante` (usuário final autenticado com Magic Link).
- Nova rota `/area-participante/*` em SSR autenticado.
- Nova rota `/certificado/[codigo]` em SSG com validação pública.
- `Especialista.apresentacaoOTT` → ativada como página premium do docente na plataforma.

**15.4. Estimativa de esforço v2.** 12 a 16 semanas adicionais (assumindo OTT como serviço próprio já em operação). Maior bloco: integração OTT ↔ portal (sincronização de eventos, participantes, presença).

**15.5. Decisões que se tomarão no momento da v2 (não agora).** Modelo de cobrança (gateway próprio integrado vs. mantido externo), arquitetura da OTT (proprietária integral ou white-label sobre Mux/Cloudflare Stream), modelo de SSO entre portal e OTT.

---

## 16. Premissas, Restrições e Pontos de Atenção

**16.1. Premissas operacionais.**

- O usuário (Instituto NTC) conduz a execução técnica dirigindo Claude Code em sessões guiadas pelo pacote-briefing.
- A equipe editorial do Grupo NTC participa ativamente do cadastro inicial (15 programas, áreas, eventos iniciais) durante a Sprint F.
- A plataforma terceira de eventos permanece operante e fornece o link de inscrição até a v2.
- Domínio `gruponctc.org.br` está sob controle do Grupo NTC ou pode ser apontado para Vercel/Cloudflare durante a janela C.
- E-mails institucionais (`@gruponctc.org.br`) seguem operando no provedor atual (Google Workspace ou similar); o portal apenas envia transacionais via Resend com SPF/DKIM autorizados.

**16.2. Restrições.**

- Sem checkout próprio na v1.
- Sem área do participante na v1.
- Sem geração de certificado na v1.
- Sem player de vídeo integrado na v1.
- Sem app mobile na v1.

**16.3. Pontos de atenção operacionais.**

- Conta Resend precisa ser provisionada com domínio verificado (SPF, DKIM, DMARC) antes da Janela B.
- Projeto Supabase `portal-ntc-staging` em `sa-east-1` provisionado na Janela A. Projeto `portal-ntc-prod` a criar na Janela C, antes do go-live.
- Bucket `ntc-portal-media` e credenciais S3-compat configuradas na Janela A.
- Vercel Pro com domínio configurado antes da Janela C (durante a Janela A o desenvolvimento ocorre local; staging pode rodar em Vercel Free enquanto não houver volume).
- Acordo com plataforma terceira de eventos deve incluir possibilidade de tracking de origem (UTMs) para fechar funil de conversão.

**16.4. Riscos identificados e mitigação.**

- **Risco:** equipe editorial precisa abrir o admin do Payload diariamente para gerir leads (sem CRM externo). **Mitigação:** notificação ativa por e-mail interno via Resend a cada submit, com link direto ao Lead no admin; widget no dashboard editorial mostrando contagem de leads com `status: 'novo'`.
- **Risco:** projeto Supabase Free pausar após 7 dias sem atividade (afeta staging em períodos de baixa atividade de desenvolvimento). **Mitigação:** upgrade para Pro antes do go-live; durante desenvolvimento, recurso `restore_project` do MCP retoma o projeto em segundos.
- **Risco:** equipe editorial não conseguir cadastrar 15 programas na janela B. **Mitigação:** lançar com 6–8 programas-âncora publicados e os demais com status `rascunho` visíveis apenas para preview interno.
- **Risco:** Claude Code improvisar componentes fora do design system. **Mitigação:** CLAUDE.md operacional com lista de não-fazer explícita + revisão visual obrigatória ao final de cada sessão.

---

## 17. Glossário Técnico

**App Router.** Sistema de rotas do Next.js 13+ baseado em pastas `/app`. Default para projetos novos.

**CMS Headless.** Sistema de gestão de conteúdo desacoplado do front-end. O conteúdo é exposto via API, e o front consome como cliente.

**Coleção (Payload).** Tipo de conteúdo com múltiplas instâncias (ex.: Programas, Eventos).

**Global (Payload).** Tipo de conteúdo singleton, único (ex.: Home, Rodapé).

**ISR (Incremental Static Regeneration).** Página gerada estaticamente, com revalidação automática após um intervalo. Combina velocidade do estático com frescor do dinâmico.

**Lead.** Registro de contato gerado por formulário institucional. Persiste no banco para auditoria + segue para CRM.

**Magic Link.** Autenticação por link enviado por e-mail, sem senha. Padrão da v2 para participantes.

**On-demand revalidation.** Disparo manual ou via webhook que força regeneração da página estática imediatamente.

**OTT (Over-The-Top).** Plataforma própria de transmissão e gestão de eventos, prevista para v2 do Grupo NTC.

**RSC (React Server Components).** Componentes renderizados no servidor por padrão no App Router. Reduzem bundle do cliente.

**Soberania de dados.** Garantia de que dados pessoais e operacionais residem em jurisdição definida (no caso, São Paulo / Brasil).

**SSG (Static Site Generation).** Geração estática no build. Velocidade máxima, atualização requer rebuild ou ISR.

**SSR (Server-Side Rendering).** Renderização no servidor a cada request. Necessário para conteúdo autenticado ou personalizado.

**Token Soberano.** Constante visual do design system Grupo NTC (cor, tipografia, espaçamento). Não editável pelo CMS.

---

**Fim do documento.**
*Documento de Arquitetura Técnica do Backend (DAB) · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
