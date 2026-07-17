# Portal Admin Unificado — Módulo CRM (Fase A)

**Data:** 15/07/2026 · **Status:** aprovado em brainstorming · **Origem:** protótipo `NTC_Comercial_Premium.html` (v3.0, 4.478 linhas)

## Objetivo

Unificar o CRM comercial (protótipo HTML standalone com IndexedDB) e o Painel Admin do CMS num único portal admin em `apps/cms`, com seletor de módulo **Site | CRM** no topo da sidebar, mesma identidade visual e mesmo login (JWT Payload).

## Decisões de brainstorming

1. **Persistência:** Supabase/Payload desde já. Nada de IndexedDB no produto final — o protótipo vira referência funcional/visual.
2. **Dados a preservar do CRM atual:** programas, eventos, módulos e oportunidades (via export JSON do próprio CRM, tela "Backup e Sync").
3. **Catálogo único:** oportunidades apontam para as coleções editoriais existentes (`programas`, `modulos`, `eventos`). Campos comerciais entram nelas em grupo próprio que o site ignora. Sem catálogo duplicado.
4. **Identidade visual:** base Soberana 2026 intocada (Oxford `#11365E`, dourado `#B5995A`, radius 0, Cormorant Garamond + Barlow) + padrões úteis do CRM re-tokenizados como extensão oficial do `painel.css` (KPI cards, selos semânticos, tabela densa com zebra, toasts). O navy/gold próprios do protótipo (`#0E2A47`/`#B68B40`, radius 10px) **não** entram.
5. **Arquitetura:** uma rota por módulo com casco compartilhado (abordagem B).
6. **Sem Chart.js na Fase A** (dependência nova exige aprovação §5.4; dashboard usa KPIs + barras CSS).
7. **Leads migra do módulo Site para o módulo CRM.**

## Fases do projeto (visão geral)

- **Fase A (esta spec):** casco unificado + coleções core (clientes-crm, contatos-crm, oportunidades) + telas CRUD + Painel Comercial + importador JSON.
- **Fase B:** Propostas — wizard, motor de geração HTML A4, textos-padrão, versionamento, biblioteca/ativos visuais.
- **Fase C:** Financeiro — contratos, empenhos, NFs, recebimentos, comissões — + follow-ups, envios, condições.
- **Fase D:** gestão de usuários e permissões por módulo/página.

## Arquitetura (Fase A)

### Casco compartilhado

- Novo `apps/cms/src/app/(painel)/shell/ShellPainel.tsx` (client component): sidebar (marca + seletor de módulo + grupos de nav + rodapé de usuário/logout) + topbar (breadcrumb + busca) + área de conteúdo. Markup e classes `pcms-*` extraídos 1:1 de `ShellCms.tsx` — zero mudança visual no módulo Site.
- Props: módulo ativo (`"site" | "crm"`), grupos de navegação (`{ rotulo, itens: { id, rotulo, icone } }[]`), tela ativa, callback `onIrPara`, breadcrumb, usuário.
- Seletor de módulo: controle segmentado **Site | CRM** logo abaixo da marca, estilo Soberana (retangular, indicador dourado). Navegação por `<Link>` real: Site → `/`, CRM → `/crm`.

### Rotas

- `/` — módulo Site. `ShellCms` refatorado para consumir `ShellPainel`, mantendo estado de telas e comportamento atuais. Telas: Painel, Palestrantes, Eventos, Home, Configurações. O grupo "Comercial" (Leads) sai daqui.
- `/crm` — rota nova no route group `(painel)`. `page.tsx` server (`force-dynamic`) chama `exigirUsuarioCms()`, carrega **só** dados comerciais via Local API e renderiza `ShellCrm` (client), mesmo padrão SPA-de-telas-por-estado.

### Navegação do CRM (Fase A)

- **Comercial:** Painel Comercial · Leads · Clientes · Contatos · Oportunidades

## Modelagem de dados

### Coleções novas (3)

**`clientes-crm`** (label "Clientes (CRM)") — conta comercial; distinta da coleção `clientes` existente (vitrine do site):
orgao (text, req), sigla (text), tipo (select), municipio (text), uf (select), esfera (select), area (select), cnpj (text), dirigente (text), cargoDirigente (text), email (email), origem (select), potencial (number, R$), status (select), responsavel (rel → users), proximaAcao (text), clienteSite (rel → clientes, opcional — liga ao showcase quando virar case).

**`contatos-crm`** — nome (req), cliente (rel → clientes-crm, req), cargo, setor, email, whatsapp, principal (checkbox), decisor (checkbox).

**`oportunidades`** — codigo (text), cliente (rel → clientes-crm, req), programa (rel → programas), modulos (rel → modulos, hasMany), eventos (rel → eventos, hasMany), uf (select), origem (select), quantidade (number), valor (number, R$), probabilidade (number, %), status (select), dataAbertura (date), followup (date), responsavel (rel → users). Pipeline ponderado (valor × probabilidade) é derivado na tela, não persistido.

### Extensões no catálogo existente (grupo `comercial`, colapsado, ignorado pelo site)

- **`modulos`:** tituloComercial (text), valor (number, R$), replay (text), certificacao (text).
- **`eventos`:** codigoComercial (text), valor (number, R$), vagas (number).
- **`programas`:** sem mudança (conteúdo editorial já cobre o que o CRM tinha).

### Enums

Listas controladas (status, origem, esfera, UF, tipo...) em `packages/lib/src/crm/listas.ts`, espelhando as `LIST` do protótipo (apenas as usadas pelas entidades da Fase A).

### Cuidados de schema

Alteração de banco com `push: false`, sem sessão paralela ativa, diff de collections antes de aplicar (regra estabelecida do projeto).

## Telas (Fase A)

Mesmo padrão das telas atuais do painel (pagehead → toolbar → tabela `pcms-tabela` com linha clicável → detalhe em tela cheia), com dados por props do server e Server Actions para escrita.

- **Painel Comercial** (`TelaPainelComercial`): 4 KPIs (oportunidades abertas, valor em negociação, pipeline ponderado, leads novos) + lista de follow-ups vencendo nos próximos 7 dias. Sem Chart.js — barras simples em CSS onde couber.
- **Leads** (`TelaLeads`/`DetalheLead`): movidas do módulo Site, sem mudança funcional.
- **Clientes, Contatos, Oportunidades:** listagem + detalhe + **criar e editar de verdade** (primeiro fluxo de criação do painel; o padrão de formulário nasce aqui e depois serve ao backlog §19.3 "Novo evento"). Excluir não entra na Fase A.
- Escrita via `acoesCrm.ts` (Server Actions) + `painelCrmEscrita.ts`; leitura via `painelCrm.ts` (`server-only`), espelhando o padrão `painelCms*` existente.

## Importador

Script `pnpm crm:importar <arquivo.json>` (Payload Local API via `payload run`):

1. Lê o JSON exportado pelo CRM atual (tela "Backup e Sync" → Exportar).
2. **Catálogo:** casa programas por sigla, módulos por programa+número, eventos por código/nome. Cria os que faltam; preenche o grupo `comercial`; **não sobrescreve** conteúdo editorial existente.
3. **Comercial:** cria clientes-crm, contatos-crm e oportunidades, resolvendo referências.
4. `--dry-run` relata o que faria sem escrever (invocar como `pnpm crm:importar -- --dry-run arquivo.json`, pois pnpm engole flags sem `--`).
5. Idempotente: reexecutar não duplica (casa por chaves naturais: sigla, código, órgão+CNPJ).

## Autenticação e segurança

- Login único existente (cookie `payload-token`, JWT Payload). `/crm` protegida por `exigirUsuarioCms()`.
- Fase A: todo usuário logado acessa os dois módulos. Permissão por módulo é Fase D.
- Toda Server Action de escrita do CRM revalida sessão (`obterUsuarioCms()`) antes de tocar a Local API.

## Tratamento de erros

Falha de leitura do banco em `/crm/page.tsx` cai para listas vazias + flag `erroLeitura` (mesmo padrão do `page.tsx` atual). Server Actions devolvem `{ ok, erro }` neutros como as atuais.

## Testes

- **Vitest:** mapeamento do importador (casamento por sigla/código, resolução de refs, idempotência via dry-run) e cálculos (pipeline ponderado, agregação de KPIs).
- **Checkpoint visual:** servidor no ar ao final para validação humana (módulo Site idêntico ao atual; módulo CRM nas 5 telas; desktop 1440 + mobile 375).

## Fora de escopo (Fase A)

- Propostas, versões, envios, follow-ups como entidade, condições, biblioteca, ativos, textos-padrão, financeiro completo (Fases B/C).
- Permissões por módulo/perfil (Fase D).
- Chart.js / gráficos ricos.
- Exclusão de registros pelas telas.
- Notificações, AuditLog, tela de Configurações funcional (backlog §19 segue valendo).

## Git

Branch `feat/crm-modulo`, commits pequenos em português (Conventional Commits), **sem push** até ordem explícita.
