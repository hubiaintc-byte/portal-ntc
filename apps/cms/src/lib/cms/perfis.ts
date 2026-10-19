/**
 * Quem pode o quê no Painel Admin. As Server Actions e as rotas do painel
 * escrevem pela Local API, que ignora o `access` das coleções — então cada
 * action precisa conferir o perfil por conta própria, com o mesmo conjunto
 * que a coleção declara (ver `src/access/*`).
 */

export type PerfilPainel = "super-admin" | "editor-institucional" | "editor-eventos" | "atendimento-comercial";

/** CRM comercial (leads, clientes, propostas, eventos comerciais) — spec §5.6. */
export const PERFIS_CRM: readonly PerfilPainel[] = ["super-admin", "atendimento-comercial"];

/**
 * Catálogo (Programas e Módulos), editado dentro do CRM: o comercial monta
 * proposta com ele e o institucional cuida do conteúdo (decisão do PO, 07/10/2026).
 */
export const PERFIS_CATALOGO: readonly PerfilPainel[] = ["super-admin", "atendimento-comercial", "editor-institucional"];

/** Eventos do site — mesmo conjunto de `access/editorEventos`. */
export const PERFIS_EVENTOS: readonly PerfilPainel[] = ["super-admin", "editor-institucional", "editor-eventos"];

/** Especialistas e Home — mesmo conjunto de `access/editorInstitucional`. */
export const PERFIS_INSTITUCIONAL: readonly PerfilPainel[] = ["super-admin", "editor-institucional"];

export function temPerfil(perfil: string | null | undefined, permitidos: readonly PerfilPainel[]): boolean {
  return typeof perfil === "string" && (permitidos as readonly string[]).includes(perfil);
}

/**
 * Conteúdos editoriais e contatos institucionais do rodapé — o conjunto que
 * `barrarNaoEditorial` (em `(painel)/acoes.ts`) confere. Hoje coincide com
 * `PERFIS_INSTITUCIONAL`, mas é outra guarda, então fica com nome próprio.
 */
export const PERFIS_EDITORIAIS: readonly PerfilPainel[] = ["super-admin", "editor-institucional"];

/** Gestão de usuários e passkeys alheios (tela Usuários). */
export const PERFIS_GESTAO_USUARIOS: readonly PerfilPainel[] = ["super-admin"];

/**
 * O que a interface do painel deixa o usuário FAZER (escrever). Cada flag
 * espelha, sem regra nova, a guarda da Server Action correspondente:
 *
 * - `editarEventos`      → salvarEvento, enviarMidia, alternarPublicacaoEvento,
 *                          salvarPalestrantesEvento, importarEventoPdf,
 *                          criarEventoEmBranco (PERFIS_EVENTOS)
 * - `editarPalestrantes` → salvarPalestrante, alternarOcultarPalestrante
 *                          (PERFIS_INSTITUCIONAL)
 * - `editarCorpoDocente` → salvarOrdemCorpoDocente (PERFIS_INSTITUCIONAL)
 * - `editarHome`         → salvarEventosDestaqueHome (PERFIS_INSTITUCIONAL)
 * - `editarConteudos`    → salvar/publicar/despublicar/excluirConteudo,
 *                          enviarMidiaConteudo (barrarNaoEditorial)
 * - `editarContatos`     → salvarContatos (barrarNaoEditorial)
 * - `editarCatalogo`     → salvar/excluir Programa e Módulo (PERFIS_CATALOGO)
 * - `usarCrm`            → actions de `acoesCrm.ts` (PERFIS_CRM)
 * - `gerirUsuarios`      → actions de usuários/passkeys alheios (super-admin)
 *
 * Esconder o botão é só conforto: a guarda da action continua sendo a
 * barreira real. Calculado no servidor (page.tsx) e passado por prop — é o
 * ponto único que uma futura matriz de permissões configurável substitui.
 */
export interface CapacidadesPainel {
  editarEventos: boolean;
  editarPalestrantes: boolean;
  editarCorpoDocente: boolean;
  editarHome: boolean;
  editarConteudos: boolean;
  editarContatos: boolean;
  editarCatalogo: boolean;
  usarCrm: boolean;
  gerirUsuarios: boolean;
}

export function capacidadesDoPerfil(perfil: string | null | undefined): CapacidadesPainel {
  return {
    editarEventos: temPerfil(perfil, PERFIS_EVENTOS),
    editarPalestrantes: temPerfil(perfil, PERFIS_INSTITUCIONAL),
    editarCorpoDocente: temPerfil(perfil, PERFIS_INSTITUCIONAL),
    editarHome: temPerfil(perfil, PERFIS_INSTITUCIONAL),
    editarConteudos: temPerfil(perfil, PERFIS_EDITORIAIS),
    editarContatos: temPerfil(perfil, PERFIS_EDITORIAIS),
    editarCatalogo: temPerfil(perfil, PERFIS_CATALOGO),
    usarCrm: temPerfil(perfil, PERFIS_CRM),
    gerirUsuarios: temPerfil(perfil, PERFIS_GESTAO_USUARIOS),
  };
}
