# Reestilização do Painel Admin — idiom do CRM legado — Design

**Data:** 17/07/2026 · **Status:** aprovado pelo PO (conversa de 17/07)
**Origem:** checkpoint visual da branch `feat/crm-modulo`. O PO considerou o seletor Site|CRM atual feio e prefere o estilo visual do CRM legado (`NTC_Comercial_Premium.html`, imagem de referência: dashboard "Comercial Premium V3.0").

## Decisões do PO

1. **Escopo:** o idiom do legado vale para o **painel inteiro** (módulos Site e CRM — casco compartilhado `ShellPainel` e telas). O site público não é tocado.
2. **Elementos adotados:** cards/KPIs do legado; menu com hover arredondado; bloco do usuário na sidebar; gráficos no Painel Comercial.
3. **Seletor Site|CRM:** droplist de workspace no bloco da marca, com a logo real.

> **Exceção deliberada ao CLAUDE.md §3:** o painel admin passa a usar cantos arredondados e sombras (idiom do legado). A regra `border-radius: 0` continua valendo integralmente para o site público. Decisão do PO em 17/07/2026.

## 1. Marca + seletor (sidebar do `ShellPainel`)

- **Logo real** `apps/cms/public/logo-ntc.svg` no topo da sidebar, sobre uma **placa clara** (fundo pergaminho, raio 8px, padding interno) — a barra Oxford da logo desaparece sobre o fundo navy sem a placa. Substitui o SVG "N" simplificado inline.
- **`SeletorModulo`** (novo client component em `(painel)/shell/`): botão que mostra o módulo atual — rótulo + descrição curta ("Site · Conteúdo editorial" / "CRM · Comercial") — e abre um menu com as duas opções, marcando a ativa. Navegação continua via `Link` para `/` e `/crm`.
  - Acessibilidade: padrão menu-button (`aria-expanded`, `aria-haspopup`, fecha com Esc e clique fora, foco visível, setas opcionais). `aria-current="page"` na opção ativa.
  - As abas coladas atuais (`.pcms-modulos`) são removidas.

## 2. Idiom visual (evolução in-place do `painel.css`)

Mesmas classes `pcms-*`; sem tema paralelo. Paleta Soberana inalterada (Oxford `#11365E`, Pergaminho `#F4EFE6`, Dourado `#B5995A`, tons já existentes no arquivo) — **nenhuma cor nova**, exceto reuso dos acentos já definidos (`--pcms-sucesso`, `--pcms-erro`).

- **Tokens novos** no `:root` do painel (`.pcms-root` e espelho do `.pcms-login`): `--pcms-radius: 8px` (cards/KPIs/placas), `--pcms-radius-controle: 6px` (inputs/botões/pílulas), `--pcms-sombra` (sombra suave de duas camadas, tipo `0 1px 2px rgba(17,54,94,.06), 0 4px 14px rgba(17,54,94,.08)`).
- **Cards e chart-boxes:** fundo branco, borda 1px na cor de linha existente, raio e sombra dos tokens.
- **KPIs** (`.pcms-metrica` e equivalentes do CRM): card branco com **borda esquerda 3px** colorida — dourado (default), Oxford, `--pcms-sucesso`, cardeal — como no legado.
- **Menu da sidebar:** hover e item ativo em **pílula arredondada** (raio de controle, fundo translúcido claro sobre o navy, texto/dourado no ativo). Ícones existentes mantidos.
- **Bloco do usuário** na sidebar, abaixo do seletor: iniciais em avatar redondo, nome, **perfil em caps** (ex. SUPER-ADMIN) e link "Sair". `ShellPainel` já recebe `usuario { nome, email }` — adicionar `perfil` ao prop (disponível em `obterUsuarioCms`) e a ação de logout já existente no painel. O bloco de avatar atual do rodapé da sidebar é substituído/movido para cá.
- **CTA primário** (ex. "Nova oportunidade", "Publicar"): estilo do legado — fundo dourado, texto escuro, raio de controle, hover levemente mais escuro. Botões secundários ganham o raio de controle.
- **Inputs/selects/formulários** (`CamposCrm`, forms do painel): raio de controle e foco com anel Oxford (mantendo contraste WCAG AA).

## 3. Gráficos no Painel Comercial (`/crm`)

Dois chart-boxes novos abaixo dos KPIs:

1. **Donut "Oportunidades por etapa"** — proporção de oportunidades abertas por etapa, legenda lateral com contagens.
2. **Barras horizontais "Funil de oportunidades"** — contagem por etapa na ordem do funil (como o "Funil de Oportunidades" do legado).

- **Implementação: SVG próprio em React Server Components — sem biblioteca de gráficos** (o legado usa Chart.js via CDN; lib nova violaria a stack aprovada e é desnecessária para donut + barras). Sem JS no cliente.
- Dados: agregação server-side sobre `listarOportunidadesCrm()` (campo `etapa`), no módulo `painelCrm`/cálculos já existentes de KPIs.
- Cores das fatias/barras: sequência derivada da paleta existente (Oxford, Dourado, tons já presentes no CSS) — sem cores novas fora do arquivo.
- Acessibilidade: título visível por box, tabela ou lista textual equivalente (visualmente oculta ou a própria legenda com contagens) para leitores de tela; estado vazio honesto ("Nenhuma oportunidade registrada") em vez de gráfico zerado.

## Fora de escopo

- Gráficos de Propostas (não existem até a Fase B).
- Qualquer mudança no site público ou nos protótipos.
- Novas dependências.

## Verificação

- Gates de sempre: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`.
- Checkpoint visual **humano**: servidor dev no ar, PO valida login, módulo Site, módulo CRM (dashboard com gráficos), seletor e bloco do usuário (memória `feedback_validacao_visual`).
