/**
 * Catálogo de telas do Painel Admin e regras puras de acesso por tela.
 * Cada pessoa tem `administrador` (acesso total) ou uma lista de telas.
 * A ordem de `TELAS` é a ordem do menu.
 */

export type ModuloPainel = "site" | "crm";

export type TelaPainel =
  | "site.painel"
  | "site.palestrantes"
  | "site.corpo-docente"
  | "site.eventos"
  | "site.conteudos"
  | "site.home"
  | "site.contatos"
  | "crm.dashboard"
  | "crm.leads"
  | "crm.clientes"
  | "crm.propostas"
  | "crm.envios"
  | "crm.programas"
  | "crm.modulos"
  | "crm.produtos";

export const TELAS: readonly { id: TelaPainel; modulo: ModuloPainel; rotulo: string }[] = [
  { id: "site.painel", modulo: "site", rotulo: "Painel" },
  { id: "site.palestrantes", modulo: "site", rotulo: "Palestrantes" },
  { id: "site.corpo-docente", modulo: "site", rotulo: "Corpo Docente" },
  { id: "site.eventos", modulo: "site", rotulo: "Eventos" },
  { id: "site.conteudos", modulo: "site", rotulo: "Conteúdos" },
  { id: "site.home", modulo: "site", rotulo: "Home" },
  { id: "site.contatos", modulo: "site", rotulo: "Contatos do site" },
  { id: "crm.dashboard", modulo: "crm", rotulo: "Dashboard" },
  { id: "crm.leads", modulo: "crm", rotulo: "Leads" },
  { id: "crm.clientes", modulo: "crm", rotulo: "Clientes" },
  { id: "crm.propostas", modulo: "crm", rotulo: "Propostas" },
  { id: "crm.envios", modulo: "crm", rotulo: "Envios" },
  { id: "crm.programas", modulo: "crm", rotulo: "Programas" },
  { id: "crm.modulos", modulo: "crm", rotulo: "Módulos" },
  { id: "crm.produtos", modulo: "crm", rotulo: "Produtos / Eventos" },
];

/** Quem vê dados de lead (o quadro e a lista de Leads). */
export const TELAS_LEADS: readonly TelaPainel[] = ["crm.dashboard", "crm.leads"];

export interface AcessoPainel {
  administrador: boolean;
  telas: readonly TelaPainel[];
}

const IDS_CONHECIDOS: ReadonlySet<string> = new Set(TELAS.map((t) => t.id));

/** Normaliza o que veio do banco: ids desconhecidos e repetidos são descartados. */
export function acessoDoUsuario(
  u: { administrador?: boolean | null; telas?: readonly string[] | null } | null | undefined,
): AcessoPainel {
  const vistos = new Set<string>();
  const telas: TelaPainel[] = [];
  for (const id of u?.telas ?? []) {
    if (IDS_CONHECIDOS.has(id) && !vistos.has(id)) {
      vistos.add(id);
      telas.push(id as TelaPainel);
    }
  }
  return { administrador: u?.administrador === true, telas };
}

export function temTela(acesso: AcessoPainel | null | undefined, telas: readonly TelaPainel[]): boolean {
  if (!acesso) return false;
  if (acesso.administrador) return true;
  return telas.some((t) => acesso.telas.includes(t));
}

export function telasDoModulo(acesso: AcessoPainel, modulo: ModuloPainel): TelaPainel[] {
  return TELAS.filter((t) => t.modulo === modulo && (acesso.administrador || acesso.telas.includes(t.id))).map(
    (t) => t.id,
  );
}

/**
 * O que a interface deixa o usuário FAZER. Esconder o botão é só conforto:
 * a guarda da Server Action continua sendo a barreira real.
 */
export interface CapacidadesPainel {
  editarEventos: boolean;
  editarPalestrantes: boolean;
  editarCorpoDocente: boolean;
  /** Bloco Corpo Docente no formulário do palestrante: exige as duas telas. */
  editarCardCorpoDocente: boolean;
  editarHome: boolean;
  editarConteudos: boolean;
  editarContatos: boolean;
  editarCatalogo: boolean;
  usarCrm: boolean;
  verLeads: boolean;
  /** Agendar, contrato/empenho, links, realizado e cancelar no acervo de eventos do cliente (§3.8). */
  acompanharEventos: boolean;
  gerirUsuarios: boolean;
}

const TELAS_CRM: readonly TelaPainel[] = TELAS.filter((t) => t.modulo === "crm").map((t) => t.id);

export function capacidadesDoAcesso(acesso: AcessoPainel): CapacidadesPainel {
  return {
    editarEventos: temTela(acesso, ["site.eventos"]),
    editarPalestrantes: temTela(acesso, ["site.palestrantes"]),
    editarCorpoDocente: temTela(acesso, ["site.corpo-docente"]),
    editarCardCorpoDocente: temTela(acesso, ["site.palestrantes"]) && temTela(acesso, ["site.corpo-docente"]),
    editarHome: temTela(acesso, ["site.home"]),
    editarConteudos: temTela(acesso, ["site.conteudos"]),
    editarContatos: temTela(acesso, ["site.contatos"]),
    editarCatalogo: temTela(acesso, ["crm.programas", "crm.modulos"]),
    usarCrm: temTela(acesso, TELAS_CRM),
    verLeads: temTela(acesso, TELAS_LEADS),
    acompanharEventos: temTela(acesso, [...TELAS_LEADS, "crm.clientes"]),
    gerirUsuarios: acesso.administrador,
  };
}
