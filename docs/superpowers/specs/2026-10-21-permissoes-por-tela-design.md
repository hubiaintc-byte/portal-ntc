# Permissões por tela, escolhidas por pessoa — Painel Admin

**Data:** 21/10/2026 · **Status:** desenho combinado com o PO em 20–22/10; revisado por um leitor-construtor em 21/10 (duas perguntas respondidas pelo PO, §3.7 e §3.8)
**Base de código:** branch `fix/painel-botoes-por-perfil` (`aa24ac5`), que introduziu `capacidadesDoPerfil` em `apps/cms/src/lib/cms/perfis.ts`.

## 1. Intenção

Hoje o painel tem **4 perfis fixos no código** (`super-admin`, `atendimento-comercial`, `editor-institucional`, `editor-eventos` — `lib/cms/perfis.ts`, `src/access/*`). O problema, nas palavras do PO, **não é ter poucos perfis, é não ter liberdade de escolher quem vê o quê**. Exemplo concreto dado por ele: uma pessoa do comercial ou da secretaria deve ter acesso **apenas** às telas de leads e de propostas — e nelas trabalhar normalmente.

O resultado esperado: o administrador abre o cadastro de uma pessoa na tela **Usuários** e marca, uma a uma, as telas do painel que ela acessa. O que não está marcado some do menu **e** é recusado pelo servidor.

## 2. O que o PO decidiu

1. **A unidade de permissão é a tela** — cada item do menu do painel (módulo Site e módulo CRM) é uma caixinha.
2. **Marcação por pessoa**, no cadastro do usuário. Grupos/perfis reutilizáveis ficam para depois ("a princípio").
3. **Tudo ou nada por tela:** quem tem a tela vê e mexe em tudo nela (sem nível "só ver").
4. **Todos os registros:** quem tem Leads vê todos os leads, não só os atribuídos a si (sem permissão por registro).
5. No exemplo da secretaria, "acesso a leads" significa **as duas** telas: o Dashboard (quadro kanban) e a lista Leads — e, por isso, cada uma é uma caixinha separada, marcadas juntas.

## 3. O que o PO aprovou como proposta do agente (lista apresentada em 21/10, aceita com "pode escrever")

1. **Administrador:** uma caixinha "Administrador (acesso total)" no cadastro. Só administradores veem a tela **Usuários** e marcam as telas dos outros. **O sistema nunca fica sem administrador** e **ninguém tira o próprio acesso de administrador**. A conta atual (`contato@institutontc.com.br`, hoje `super-admin`) vira administradora na migração.
2. **"Minha conta"** (trocar a própria senha, passkeys próprios) fica sempre disponível para todos, independente das telas.
3. **Dados de apoio dentro de uma tela liberada:** quem tem Propostas consegue, dentro do formulário da proposta, escolher lead, cliente e programa — vendo só o necessário para preencher —, mesmo sem as telas Clientes ou Catálogo.
4. **Ações de risco seguem a tela:** quem tem Leads pode apagar lead; quem tem Clientes pode apagar cliente; quem tem Programas pode excluir programa — com as confirmações que já existem.
5. **Os 4 perfis fixos deixam de existir.** Hoje há **um** usuário no banco (verificado em 19/10), então a virada não afeta ninguém além dele.
6. **O servidor é a trava real:** Server Actions, rotas do painel e a REST do Payload conferem as telas do usuário — o menu escondido é só conforto.
7. **Leads sem Clientes (respondido pelo PO em 22/10, depois da revisão):** quem tem Dashboard ou Leads pode **criar cliente novo** ao cadastrar um lead ("Ou criar cliente novo (órgão)" em `crm/FormLead.tsx`) e **trocar/vincular o cliente** de um lead ("Trocar cliente…" no modal), mas **não** edita dados nem contatos do cliente — isso continua só na tela Clientes. Exceção explícita à regra "escrita só pela tela que edita a coleção" (§7): Dashboard/Leads escrevem em `clientes-crm` **apenas** para criar e vincular.
8. **Clientes sem Dashboard/Leads (respondido pelo PO em 22/10):** o detalhe do cliente mostra a lista de negócios **só com o mínimo** (nome do contato e estágio), **sem abrir o modal do lead** (que traz a mensagem original e os dados pessoais de quem entrou em contato). As ações de evento comercial (agendar, contrato/empenho, links, realizado, cancelar, documentos) ficam disponíveis **no acervo de eventos do cliente** (`EventosDoCliente`), para quem tem Clientes — sem passar pelo modal.

## 4. Lista de telas (as caixinhas)

| Módulo | Tela (rótulo do menu) | Observação |
|---|---|---|
| Site | Painel | dashboard do módulo Site (só contagens, sem dado pessoal desde `41150b7`) |
| Site | Palestrantes | inclui criar/editar palestrante, foto, "Ocultar do site" |
| Site | Corpo Docente | ordem dos cards; também o bloco "Corpo Docente" dentro do formulário do palestrante (ver §7) |
| Site | Eventos | inclui Novo evento, Importar PDF, mídia, palestrantes do evento, publicar |
| Site | Conteúdos | |
| Site | Home | destaques da Home |
| Site | Contatos do site | a seção de contatos/rodapé que hoje fica em Configurações |
| CRM | Dashboard | quadro kanban e KPIs |
| CRM | Leads | lista; o modal do lead (abas Dados, Histórico, **Ações** — evento comercial) vale para Dashboard **ou** Leads |
| CRM | Clientes | detalhe do cliente, contatos, acervo de eventos e documentos, apagar cliente |
| CRM | Propostas | wizard, detalhe, conteúdo do documento, versões, registro de envio, **Gerar PDF** |
| CRM | Envios | lista de envios |
| CRM | Programas | catálogo — inclui criar/editar/publicar/excluir programa |
| CRM | Módulos | catálogo — inclui criar/editar/excluir módulo |
| CRM | Produtos / Eventos | hoje só leitura |
| Sistema | Usuários | **não é caixinha** — só administrador |
| Sistema | Configurações → Minha conta | **não é caixinha** — sempre disponível |

Os identificadores técnicos (ex.: `site.eventos`, `crm.leads`) são decisão do construtor; a lista acima é a fonte. Uma tela nova no futuro entra nesta lista e passa a ser uma caixinha nova (permissão nova continua exigindo código — isso é aceito).

## 5. Comportamento

- **Menu:** mostra só as telas marcadas. O seletor de módulo (Site | CRM) só mostra o módulo que tiver ao menos uma tela marcada.
- **Depois do login:** a pessoa cai na primeira tela marcada (ordem do menu). Sem nenhuma tela marcada, cai em "Minha conta", com um aviso de que ainda não tem telas liberadas.
- **Acesso direto a uma tela não marcada** (URL, Server Action chamada à mão, REST): recusado no servidor, com a mesma mensagem genérica de hoje ("Sessão expirada ou sem permissão para esta ação.").
- **Mudança de permissão vale na próxima requisição**, sem precisar sair e entrar de novo (o usuário é relido do banco a cada request pelo Payload; as sessões de banco já existem desde 19/10).
- **Tela Usuários:** o formulário de criar/editar usuário troca o select "Perfil" pela caixinha **Administrador** e a lista de telas agrupada por módulo (Site · CRM). Marcar Administrador torna as caixinhas irrelevantes (acesso total) — mostrá-las desabilitadas/marcadas é decisão de interface do construtor.
- **Travas:** o servidor recusa (a) remover o último administrador, (b) desmarcar Administrador na própria conta, (c) remover a si mesmo (já existe).

## 6. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- O administrador escolhe, por pessoa, quais telas ela acessa.
- Toda verificação de permissão do painel passa a ler as telas do usuário, num ponto central.
- Comportamento atual preservado para a única conta existente (administradora).

**Não-objetivos (decididos, ficam de fora)**
- Grupos ou perfis reutilizáveis ("Secretaria" com telas pré-marcadas) — pode vir depois, por cima deste modelo.
- Nível "só ver" por tela.
- Permissão por registro (só os leads atribuídos a mim) e por campo.
- Mexer no que o **site público** mostra ou na REST anônima (`access/leituraPublica.ts` fica como está).

**Anti-objetivos (se acontecer, falhou mesmo funcionando)**
- O painel ficar **sem administrador** ou o administrador se trancar fora.
- A tela esconder algo que o **servidor ainda permite** (o inverso — servidor recusar o que a tela mostra — também é defeito, mas menos grave).
- Uma pessoa com uma tela ganhar acesso a **dados pessoais de outra tela** por carga de página (lição de 19/10: o painel do Site mandava 300 leads ao navegador de qualquer perfil). Cada página só carrega os dados das telas permitidas, mais os dados de apoio mínimos da §3.3.
- Perder dado na migração do banco.

## 7. Restrições e contexto que o construtor precisa saber

- **Banco único dev+produção** (Supabase, pooler 6543). Mudança de schema é `payload:push:schema`, passo **manual do PO**, com diff lido antes (CLAUDE.md §14). **O drizzle-kit 0.31 desligaria o RLS das 126 tabelas sem perguntar** se a marca `manterRlsLigado` (`lib/cms/compatibilidadeSchema.ts`) sair — nunca removê-la; conferir que o diff não tem `DISABLE ROW LEVEL SECURITY`. Leitura segura no banco: `BEGIN READ ONLY; …; COMMIT;`, nunca `SET` solto.
- **Migração em duas etapas** (para nunca haver `DROP` junto com a criação): primeiro **acrescentar** os campos novos em `users` (administrador + telas) e gravar a conta atual como administradora; só depois, em outro push, remover o campo `perfil` (que gera `DROP COLUMN` e prompt de perda de dados). Entre as duas etapas o código não lê mais `perfil`.
- **Onde o perfil é conferido hoje** (tudo isso passa a ler as telas):
  - `lib/cms/perfis.ts` (`PERFIS_*`, `temPerfil`, `capacidadesDoPerfil`) e `lib/cms/autenticacao.ts` (`obterUsuarioCmsComPerfil`, `obterUsuarioAutenticadoComPerfil`, `exigirPerfil`, `exigirSuperAdmin`);
  - Server Actions em `app/(painel)/acoes.ts`, `acoesCrm.ts`, `acoesCatalogo.ts`, `acoesAuth.ts` (as de usuário/passkey de terceiros), e `lib/cms/painelCmsUsuarios.ts`;
  - páginas `app/(painel)/page.tsx`, `crm/page.tsx` e a rota `crm/propostas/[id]/documento/route.ts`;
  - `access` das coleções/globals: `src/access/{atendimentoComercial,editorInstitucional,editorEventos,editorCatalogo,superAdmin}.ts` e o `update` de `collections/Users.ts` e `superAdminField`;
  - `shared/user-shape.ts` / `PerfilAdmin` em `shared/types.ts`.
- **Mapeamento tela → o que ela libera** é trabalho do construtor, com uma regra: **a escrita numa coleção é liberada por uma tela que a edita**, e a leitura de apoio (§3.3) é liberada por qualquer tela que precise dela para funcionar. Exemplos já claros: `leads` ← Dashboard ou Leads; `eventos-comerciais`/`linha-do-tempo` (nota) ← Dashboard, Leads ou Clientes; `clientes-crm` ← Clientes (escrita) e leitura de apoio para Dashboard/Leads/Propostas; `propostas`/`versoes-proposta`/`envios-proposta`/PDF ← Propostas; `documentos-comerciais` ← Clientes e Propostas; `programas`/`modulos` ← Programas/Módulos (escrita), leitura de apoio para Propostas/Leads/Dashboard; `eventos` (site) ← Eventos; `especialistas` ← Palestrantes; global `corpo-docente` ← Corpo Docente; global `home` ← Home; `conteudos` ← Conteúdos; global `rodape` ← Contatos do site; `users`/passkeys de terceiros ← Administrador.
- **Coleções sem tela (decisão do agente):** `areas`, `clientes` (vitrine do site), global `o-grupo`, `modelos-email`, `audit-log` e `tentativas-acesso` não aparecem em nenhuma das telas da §4 — ficam **só para o administrador** (escrita; a leitura pública da REST segue `access/leituraPublica.ts`).
- **Formulário do palestrante:** ele hoje grava também o card do Corpo Docente (v3.7). Decisão do agente: o bloco "Corpo Docente" dentro do formulário só aparece (e só é aceito pelo servidor) para quem tem **Palestrantes e Corpo Docente**.
- **`/crm` hoje carrega 10 leituras de uma vez** para todas as telas; com permissões por tela, a página precisa carregar só os conjuntos das telas permitidas (e os dados de apoio mínimos). Isto é parte do escopo, por causa do anti-objetivo de vazamento.
- A branch `fix/painel-botoes-por-perfil` já esconde os controles de escrita a partir de `capacidadesDoPerfil(perfil)`; o caminho natural é essa função passar a receber o usuário (administrador + telas) em vez do perfil, e as flags virarem "tem a tela X".
- Convenções do repositório: CLAUDE.md (§4 código, §5 anti-improvisação, §10 acessibilidade, §12 LGPD). Testes em Vitest/node (sem testing-library).

## 8. Como saber que deu certo

- Tabela de testes unitários: para cada tela, um usuário só com ela consegue o que a tela faz e é recusado no resto (Server Actions e `access` das coleções).
- Teste de ponta a ponta com **contas temporárias** no banco (exige autorização do PO a cada rodada, porque o banco é de produção; apagar ao fim): a "secretaria" (Dashboard + Leads + Propostas) navega, cria proposta e gera PDF; não vê Clientes, Catálogo nem módulo Site; recebe recusa ao chamar uma action de outra tela; o HTML das páginas não traz dado de telas não permitidas.
- Travas de administrador exercitadas: último administrador, desmarcar a si mesmo.
- A conta do PO continua com acesso total depois das duas etapas de migração.

## 9. Deixado ao construtor

- Nomes técnicos das telas, forma de armazenar (ex.: `select` com `hasMany` em `users`), nome do campo de administrador.
- Interface exata da lista de caixinhas na tela Usuários (agrupamento, "marcar todas do módulo").
- Ordem de implementação e quebra em commits, desde que a migração siga as duas etapas.
- Se `capacidadesDoPerfil` é renomeada/reaproveitada.
