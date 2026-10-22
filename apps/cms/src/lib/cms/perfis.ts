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

export { capacidadesDoAcesso } from "./telas";
export type { CapacidadesPainel } from "./telas";
