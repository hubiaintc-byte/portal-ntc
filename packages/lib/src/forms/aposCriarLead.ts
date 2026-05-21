import type { LeadTipo } from "../tipos";

/**
 * Hook pós-criação de Lead — no-op nesta sessão.
 *
 * A Sprint F.4 deixa este hook como placeholder estruturado: rotas
 * /api/forms/* chamam `aposCriarLead(tipo, lead)` em fire-and-forget
 * depois de persistir o Lead no Payload. A sessão futura de e-mail
 * (Resend + React Email) substitui o corpo desta função por
 * `enviarConfirmacaoUsuario` + `enviarNotificacaoInterna`.
 *
 * Regra DAB §9 preservada: persistência do Lead precede o hook, e
 * exceções aqui não derrubam a rota (Lead nunca se perde).
 */
export interface LeadCriado {
  id: string | number;
  email: string;
  nome: string;
}

export async function aposCriarLead(tipo: LeadTipo, lead: LeadCriado): Promise<void> {
  console.info("[lead.criado]", {
    tipo,
    leadId: lead.id,
    email: lead.email,
    nome: lead.nome,
    timestamp: new Date().toISOString(),
  });
}
