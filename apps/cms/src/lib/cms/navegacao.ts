/**
 * Navegação do Painel Admin por tela: que itens de menu cada pessoa vê, em
 * que tela ela começa e para onde vai depois do login. Regras puras — sem
 * `server-only`, os cascos client (`ShellCms`, `ShellCrm`) usam as mesmas.
 */

import { telasDoModulo, type AcessoPainel, type TelaPainel } from "./telas";

/** Ids de navegação do módulo Site (`ShellCms`). `config` e `usuarios` não são caixinhas. */
export type TelaIdSite =
  | "dashboard"
  | "palestrantes"
  | "corpo-docente"
  | "eventos"
  | "conteudos"
  | "home"
  | "config"
  | "usuarios";

/** Ids de navegação do módulo CRM (`ShellCrm`). */
export type TelaCrmId =
  | "painel"
  | "leads"
  | "clientes"
  | "propostas"
  | "envios"
  | "programas"
  | "modulos"
  | "produtos";

/** Itens editoriais do menu do Site, na ordem do menu. `site.contatos` não tem item: é uma seção de Configurações. */
export const NAV_SITE: readonly { id: TelaIdSite; tela: TelaPainel }[] = [
  { id: "dashboard", tela: "site.painel" },
  { id: "palestrantes", tela: "site.palestrantes" },
  { id: "corpo-docente", tela: "site.corpo-docente" },
  { id: "eventos", tela: "site.eventos" },
  { id: "conteudos", tela: "site.conteudos" },
  { id: "home", tela: "site.home" },
];

/** Itens do menu do CRM, na ordem do menu. */
export const NAV_CRM: readonly { id: TelaCrmId; tela: TelaPainel }[] = [
  { id: "painel", tela: "crm.dashboard" },
  { id: "leads", tela: "crm.leads" },
  { id: "clientes", tela: "crm.clientes" },
  { id: "propostas", tela: "crm.propostas" },
  { id: "envios", tela: "crm.envios" },
  { id: "programas", tela: "crm.programas" },
  { id: "modulos", tela: "crm.modulos" },
  { id: "produtos", tela: "crm.produtos" },
];

function visiveis<T>(acesso: AcessoPainel, nav: readonly { id: T; tela: TelaPainel }[]): T[] {
  return nav.filter((i) => acesso.administrador || acesso.telas.includes(i.tela)).map((i) => i.id);
}

/** Itens editoriais do menu do Site que esta pessoa vê. */
export function navSiteVisivel(acesso: AcessoPainel): TelaIdSite[] {
  return visiveis(acesso, NAV_SITE);
}

/** Itens do menu do CRM que esta pessoa vê. */
export function navCrmVisivel(acesso: AcessoPainel): TelaCrmId[] {
  return visiveis(acesso, NAV_CRM);
}

/** O seletor mostra o CRM só com ao menos uma tela `crm.*`. O Site aparece sempre (Minha conta mora lá). */
export function mostraModuloCrm(acesso: AcessoPainel): boolean {
  return telasDoModulo(acesso, "crm").length > 0;
}

/** Primeira tela do Site marcada, na ordem do menu; sem nenhuma, Configurações → Minha conta. */
export function telaInicialSite(acesso: AcessoPainel): TelaIdSite {
  return navSiteVisivel(acesso)[0] ?? "config";
}

/**
 * Primeira tela do CRM marcada, na ordem do menu. Sem nenhuma, devolve a
 * primeira do menu — a página /crm já redireciona antes disso.
 */
export function telaInicialCrm(acesso: AcessoPainel): TelaCrmId {
  return navCrmVisivel(acesso)[0] ?? NAV_CRM[0]!.id;
}

/** Para onde o login leva: /crm se a pessoa só tem telas do CRM; senão o Site (inclusive sem tela nenhuma). */
export function destinoDepoisDoLogin(acesso: AcessoPainel): "/" | "/crm" {
  const temSite = telasDoModulo(acesso, "site").length > 0;
  return !temSite && mostraModuloCrm(acesso) ? "/crm" : "/";
}
