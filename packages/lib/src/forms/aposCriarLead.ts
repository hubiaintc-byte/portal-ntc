import type { LeadTipo } from "../tipos";

/**
 * Hook pós-criação de Lead — notificação interna via Resend REST.
 *
 * Rotas /api/forms/* chamam `aposCriarLead(tipo, lead)` em fire-and-forget
 * depois de persistir o Lead no Payload. Regra DAB §9 preservada: a
 * persistência do Lead precede o hook, e exceções aqui nunca derrubam a
 * rota (Lead nunca se perde) — falha de rede loga `console.error` e a
 * função resolve normalmente.
 *
 * Sem `RESEND_API_KEY` ou sem `LEADS_EMAIL_DESTINO` o comportamento cai
 * para o log estruturado original (placeholder), sem chamar `fetch`.
 *
 * Chama a API REST do Resend diretamente via `fetch` — sem SDK — para
 * manter `@ntc/lib` livre de dependências extras (o adapter de e-mail do
 * Payload, em apps/cms/src/payload.config.ts, é uma integração separada).
 */
export interface LeadCriado {
  id: string | number;
  email: string;
  nome: string;
}

const REMETENTE_PADRAO = "Painel NTC <nao-responda@institutontc.com.br>";
const URL_RESEND = "https://api.resend.com/emails";

function logLeadCriado(tipo: LeadTipo, lead: LeadCriado): void {
  console.info("[lead.criado]", {
    tipo,
    leadId: lead.id,
    email: lead.email,
    nome: lead.nome,
    timestamp: new Date().toISOString(),
  });
}

function notificacaoLeadHtml(tipo: LeadTipo, lead: LeadCriado): string {
  return `<!doctype html><html lang="pt-BR"><body style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <p>Novo lead recebido pelo site (${tipo}).</p>
  <ul>
    <li><strong>Nome:</strong> ${lead.nome}</li>
    <li><strong>E-mail:</strong> ${lead.email}</li>
    <li><strong>ID:</strong> ${lead.id}</li>
  </ul>
</body></html>`;
}

/**
 * Versão testável do hook: recebe a implementação de `fetch` por injeção
 * para que os testes possam mocká-la sem depender de rede real.
 */
export async function aposCriarLeadCom(
  fetchFn: typeof fetch,
  tipo: LeadTipo,
  lead: LeadCriado,
): Promise<void> {
  const chaveResend = process.env.RESEND_API_KEY;
  const destino = process.env.LEADS_EMAIL_DESTINO;

  if (!chaveResend || !destino) {
    logLeadCriado(tipo, lead);
    return;
  }

  const remetente = process.env.EMAIL_REMETENTE ?? REMETENTE_PADRAO;

  try {
    await fetchFn(URL_RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chaveResend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: destino,
        subject: `Novo lead (${tipo}): ${lead.nome}`,
        html: notificacaoLeadHtml(tipo, lead),
      }),
    });
  } catch (erro) {
    console.error("[lead.criado] falha ao notificar via Resend", erro);
  }
}

export async function aposCriarLead(tipo: LeadTipo, lead: LeadCriado): Promise<void> {
  return aposCriarLeadCom(fetch, tipo, lead);
}
