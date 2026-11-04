// Regras puras do aviso de lead novo (web push). Nenhum dado pessoal do lead
// entra no payload: só título, corpo fixo, destino e tag.

export interface AvisoPush {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export const ROTULO_TIPO_LEAD: Record<
  "proposta" | "contato" | "newsletter" | "candidatura",
  string
> = {
  proposta: "Proposta",
  contato: "Contato",
  newsletter: "Newsletter",
  candidatura: "Candidatura",
};

const CORPO_AVISO = "Chegou pelo site. Toque para abrir o painel.";

function tipoConhecido(
  tipo?: string | null,
): tipo is keyof typeof ROTULO_TIPO_LEAD {
  return typeof tipo === "string" && Object.hasOwn(ROTULO_TIPO_LEAD, tipo);
}

export function deveAvisarLead(p: {
  operation: "create" | "update";
  origemEntrada?: string | null;
}): boolean {
  return p.operation === "create" && p.origemEntrada === "site";
}

export function montarAvisoLead(lead: {
  id: string | number;
  tipo?: string | null;
}): AvisoPush {
  if (!tipoConhecido(lead.tipo)) {
    return { title: "Novo lead", body: CORPO_AVISO, url: "/", tag: "lead" };
  }
  return {
    title: `Novo lead · ${ROTULO_TIPO_LEAD[lead.tipo]}`,
    body: CORPO_AVISO,
    url:
      lead.tipo === "proposta"
        ? `/crm?lead=${encodeURIComponent(String(lead.id))}`
        : "/",
    tag: `lead-${lead.tipo}`,
  };
}
