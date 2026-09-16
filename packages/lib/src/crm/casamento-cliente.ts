/**
 * Casamento automático lead → cliente (spec 2026-09-15 §5.1). Pura: recebe o
 * lead e a lista de candidatos já carregada; o hook do Payload faz a busca e
 * a escrita. Ordem de tentativa: CNPJ → domínio institucional → nome/sigla.
 */

export interface LeadParaCasar {
  instituicao: string | null;
  email: string | null;
  cnpj: string | null;
}

export interface ClienteCandidato {
  id: string;
  orgao: string;
  sigla: string | null;
  cnpj: string | null;
  email: string | null;
  emailsContatos: string[];
}

export type MotivoCasamento = "cnpj" | "dominio" | "nome";

export interface ResultadoCasamento {
  clienteId: string;
  por: MotivoCasamento;
}

const SUFIXOS_INSTITUCIONAIS = [".gov.br", ".leg.br", ".jus.br", ".mp.br", ".edu.br", ".org.br"];
const PROVEDORES_PUBLICOS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "outlook.com.br",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "live.com",
  "bol.com.br",
  "uol.com.br",
  "terra.com.br",
]);

export function normalizarNome(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function somenteDigitos(v: string | null): string {
  return (v ?? "").replace(/\D/g, "");
}

export function dominioDoEmail(email: string | null): string | null {
  if (!email) return null;
  const arroba = email.lastIndexOf("@");
  if (arroba < 0 || arroba === email.length - 1) return null;
  return email.slice(arroba + 1).trim().toLowerCase();
}

export function ehDominioInstitucional(dominio: string): boolean {
  const d = dominio.toLowerCase();
  if (PROVEDORES_PUBLICOS.has(d)) return false;
  return SUFIXOS_INSTITUCIONAIS.some((sufixo) => d.endsWith(sufixo));
}

function dominiosDoCandidato(c: ClienteCandidato): string[] {
  return [c.email, ...c.emailsContatos]
    .map(dominioDoEmail)
    .filter((d): d is string => d !== null);
}

export function casarCliente(
  lead: LeadParaCasar,
  candidatos: ClienteCandidato[],
): ResultadoCasamento | null {
  const cnpj = somenteDigitos(lead.cnpj);
  if (cnpj.length === 14) {
    const porCnpj = candidatos.find((c) => somenteDigitos(c.cnpj) === cnpj);
    if (porCnpj) return { clienteId: porCnpj.id, por: "cnpj" };
  }

  const dominio = dominioDoEmail(lead.email);
  if (dominio !== null && ehDominioInstitucional(dominio)) {
    const porDominio = candidatos.find((c) => dominiosDoCandidato(c).includes(dominio));
    if (porDominio) return { clienteId: porDominio.id, por: "dominio" };
  }

  const nome = lead.instituicao ? normalizarNome(lead.instituicao) : "";
  if (nome !== "") {
    const porNome = candidatos.find(
      (c) =>
        normalizarNome(c.orgao) === nome || (c.sigla !== null && normalizarNome(c.sigla) === nome),
    );
    if (porNome) return { clienteId: porNome.id, por: "nome" };
  }

  return null;
}
