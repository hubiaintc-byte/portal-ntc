/**
 * @ntc/ui — design system mínimo.
 *
 * Após o pivot "porta do HTML" (memory/project_porta_html.md), as
 * páginas portadas (/, /o-grupo, /o-grupo/corpo-docente,
 * /solucoes-estrategicas/[area]) renderizam markup literal do
 * protótipo com CSS próprio. Os componentes do design system
 * sistêmico (heroes, cards, listings, blocos, navegação, forms etc.)
 * foram removidos em 22/05/2026.
 *
 * Resta apenas o que toda rota consome:
 * - BannerCookies (banner LGPD sticky-bottom, root layout)
 * - DialogoPolitica (modal de política, usado por BannerCookies se preciso)
 * - tokens (paleta Soberana 2026)
 */

export { tokens } from "./tokens";
export type { Tokens, CorSoberana, EscalaTipografica } from "./tokens";

export { BannerCookies } from "./components/helpers/BannerCookies";
export { DialogoPolitica } from "./components/helpers/DialogoPolitica";
