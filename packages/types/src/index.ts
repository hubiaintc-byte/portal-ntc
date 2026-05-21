/**
 * @ntc/types — tipos compartilhados do Portal Grupo NTC.
 *
 * Re-exporta os tipos gerados pelo Payload CMS (`payload-types.ts`),
 * que cobrem coleções (Users, Media, Areas, Programas, ...) e globals
 * (Home, Rodape). O arquivo `payload-types.ts` é gerado por
 * `pnpm payload:generate` e versionado neste pacote para que o web
 * e o lib possam importar via `@ntc/types` sem dependência cíclica.
 *
 * Tipos de domínio editorial adicionais (contratos de API dos
 * formulários, helpers de UTM etc.) podem ser exportados aqui ao lado.
 */

export * from "./payload-types";
export type { RodapeData, RedeSocial, ItemRedeSocial, ItemLinkLegal } from "./rodape";
