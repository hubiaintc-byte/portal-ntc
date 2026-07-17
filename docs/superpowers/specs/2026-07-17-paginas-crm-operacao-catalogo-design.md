# Páginas do CRM — Operação Comercial + Catálogo Institucional — Design

**Data:** 17/07/2026 · **Status:** aprovado pelo PO (conversa de 17/07)
**Origem:** o PO pediu para criar todas as páginas do CRM com os nomes do modelo `NTC_Comercial_Premium.html`, começando pelos grupos **Operação Comercial** e **Catálogo Institucional** ("depois fazemos o resto" — Biblioteca Comercial e Financeiro).

## Contexto

O módulo `/crm` (`ShellCrm.tsx`) hoje tem um grupo único "Comercial" com 5 telas funcionais: Painel Comercial, Leads, Clientes, Contatos, Oportunidades. O modelo organiza o menu em grupos; os dois primeiros são:

- **Operação Comercial:** Dashboard Executivo · Clientes / Órgãos · Contatos · Oportunidades · Propostas · Versões · Envios · Follow-ups · Condições
- **Catálogo Institucional:** Programas · Módulos · Produtos / Eventos

## Decisões do PO

1. **Profundidade:** casca navegável primeiro. Telas com dados existentes nascem funcionais read-only; telas que exigem coleção nova (Fase B) nascem como placeholder "Em breve" navegável.
2. **Catálogo:** listar read-only destacando os campos do grupo `comercial`; edição continua no módulo Site.
3. **Leads:** mantido como primeira entrada de Operação Comercial (o modelo é anterior à captação de leads do site).
4. **Dashboard Executivo:** é a tela atual "Painel Comercial" renomeada — NÃO criar tela duplicada.
5. **Produtos / Eventos:** fonte é a coleção `eventos` (grupo `comercial`).

## Fontes de dados (confirmadas no schema)

- **Módulos** (`modulos.comercial`): `tituloComercial`, `valor`, `replay`, `certificacao`.
- **Produtos/Eventos** (`eventos.comercial`): `codigo`, `valor`.
- **Programas**: NÃO tem grupo `comercial` → lista sigla · nome · área (índice de referência, sem coluna comercial).
- **Follow-ups**: derivado das oportunidades (campo `followupISO`), sem coleção nova.
- **Condições Comerciais**: NÃO há coleção nem lista modelada → entra como casca "Em breve" (Fase B), junto de Propostas/Versões/Envios.

## Telas — três tipos

### A. Rename (nenhuma tela nova)
- `painel` → rótulo **"Dashboard Executivo"**; segue sendo `TelaPainelComercial` (KPIs + gráficos + follow-ups). Só muda rótulo do menu e o `CRUMB`.

### B. Funcionais read-only (dados reais via Local API, padrão `painelCrm.ts`)
- **Follow-ups** (`TelaFollowups`): todas as oportunidades abertas com `followupISO` != null, ordenadas por data (vencidos primeiro), com código · cliente · programa · valor · status · data. Reusa a leitura de oportunidades que o `page.tsx` já faz — sem novo leitor de I/O; a filtragem/ordenação é função pura em `kpisComercial.ts` (`todosFollowups(oportunidades)`).
- **Programas** (`TelaProgramas`): lista sigla · nome · área. Novo leitor `listarProgramasCrm()` em `painelCrm.ts`.
- **Módulos** (`TelaModulos`): lista título · programa · valor de referência · replay · certificação (campos de `comercial`). Novo leitor `listarModulosCrm()`.
- **Produtos/Eventos** (`TelaProdutos`): lista nome · código comercial · valor de referência. Novo leitor `listarProdutosCrm()`.

Cada leitor devolve um `*Resumo` tipado (mesmo idiom dos resumos existentes); estado vazio honesto ("Nenhum registro cadastrado.").

### C. Casca "Em breve" (placeholder navegável — Fase B)
- **Propostas · Versões · Envios · Condições**: um componente reutilizável `TelaEmBreve` (props `titulo`, `descricao`), com o cabeçalho de tela padrão e um card de estado usando o selo `pcms-selo--atencao` "Em breve" (mesmo idiom do botão "Novo evento" desabilitado). Sem dados, sem I/O.

## Componentes e arquivos

Novos, em `apps/cms/src/app/(painel)/crm/`:
- `TelaFollowups.tsx`, `TelaProgramas.tsx`, `TelaModulos.tsx`, `TelaProdutos.tsx` (Client Components, recebem dados por prop).
- `TelaEmBreve.tsx` (reutilizável).

Modificados:
- `ShellCrm.tsx`: `grupos` passa a ter 2 `GrupoNav` (Operação Comercial, Catálogo Institucional); `TelaCrmId` e `CRUMB` ampliados; novos ícones lineares peso-1.5 (§3) para Dashboard, Propostas, Versões, Envios, Follow-ups, Condições, Programas, Módulos, Produtos. Novas props com os dados dos catálogos. Renderização das novas telas no bloco de conteúdo.
- `crm/page.tsx`: busca também programas/módulos/produtos comerciais (novos leitores) e passa ao `ShellCrm`.
- `painelCrm.ts`: interfaces `ProgramaCrmResumo`/`ModuloCrmResumo`/`ProdutoCrmResumo` + `listarProgramasCrm`/`listarModulosCrm`/`listarProdutosCrm`.
- `kpisComercial.ts`: função pura `todosFollowups(oportunidades)` + teste (TDD).

## Menu resultante (Operação Comercial · Catálogo Institucional)

```
Operação Comercial      Catálogo Institucional
  Dashboard Executivo     Programas
  Leads                   Módulos
  Clientes                Produtos / Eventos
  Contatos
  Oportunidades
  Propostas   (Em breve)
  Versões     (Em breve)
  Envios      (Em breve)
  Follow-ups
  Condições   (Em breve)
```

## Fora de escopo

- CRUD de Propostas/Versões/Envios/Condições, wizard e gerador de proposta A4 (Fase B).
- Grupos Biblioteca Comercial e Financeiro ("o resto").
- Edição dos campos comerciais pelo CRM (edição segue no módulo Site).
- Coleções novas ou `payload:push:schema`.

## Verificação

- Gates: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`.
- Checkpoint visual humano: servidor no ar; PO navega os dois grupos, confere as listas reais (Programas/Módulos/Produtos/Follow-ups) e as cascas "Em breve". Sem screenshot automatizado (memória `feedback_validacao_visual`).
- Regra operacional: não rodar build com o dev server ativo (memória `feedback_build_corrompe_dev_next`).
