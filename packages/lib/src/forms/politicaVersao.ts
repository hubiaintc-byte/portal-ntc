/**
 * Versão canônica da Política de Privacidade vigente, lida do ambiente.
 *
 * Fonte de verdade: variável `POLITICA_VERSAO` no `.env`. Atualizar a versão
 * sempre que o texto da política mudar (CLAUDE.md §12).
 *
 * Fallback `'2026-05-21'` garante boot local sem `.env`, mas em produção
 * a variável deve estar setada.
 */
export const POLITICA_VERSAO_ATUAL: string =
  process.env.POLITICA_VERSAO ?? "2026-05-21";
