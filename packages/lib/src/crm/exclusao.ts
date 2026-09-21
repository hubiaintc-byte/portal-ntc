/** Regras de exclusão do CRM (spec-mãe §5.6 · adendo §3). Puras. */
import { rotuloDoEstagio } from "./estagios";

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

export function podeApagarCliente(d: {
  numLeads: number;
  numEventos: number;
  numPropostas: number;
}): { ok: true } | { ok: false; motivo: string } {
  if (d.numLeads === 0 && d.numEventos === 0 && d.numPropostas === 0) return { ok: true };
  return {
    ok: false,
    motivo: `Tem ${plural(d.numLeads, "negócio", "negócios")}, ${plural(d.numEventos, "evento", "eventos")} e ${plural(d.numPropostas, "proposta", "propostas")} — apague ou revincule antes.`,
  };
}

export function exigeConfirmacaoDupla(d: { numEventos: number; numPropostas: number; numEnvios: number }): boolean {
  return d.numEventos + d.numPropostas + d.numEnvios > 0;
}

export function tituloLeadApagado(d: { nome: string; instituicao: string | null; estagio: string }): string {
  const orgao = d.instituicao ? `${d.instituicao}, ` : "";
  return `Lead apagado · ${d.nome} (${orgao}estava em ${rotuloDoEstagio(d.estagio)})`;
}
