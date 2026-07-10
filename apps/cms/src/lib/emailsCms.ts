/**
 * Templates de e-mail transacional do Painel Admin (recuperação de senha,
 * boas-vindas de novo usuário, notificação de lead). HTML inline simples —
 * sem framework de e-mail, paleta Oxford, texto em português.
 */

const OXFORD = "#11365E";
const PERGAMINHO = "#F4EFE6";

/** Link absoluto para a página de redefinição, com token do Payload. */
export function urlRedefinir(token: string, novoUsuario = false): string {
  const base = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001";
  return `${base}/entrar/redefinir?token=${encodeURIComponent(token)}${novoUsuario ? "&novo=1" : ""}`;
}

function moldura(titulo: string, corpoHtml: string): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:${PERGAMINHO};font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-top:4px solid ${OXFORD};">
      <tr><td style="padding:28px 32px 8px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${OXFORD};">Grupo NTC · Painel Admin</p>
        <h1 style="margin:0;font-size:20px;color:${OXFORD};">${titulo}</h1>
      </td></tr>
      <tr><td style="padding:8px 32px 28px;font-size:14px;line-height:1.6;">${corpoHtml}</td></tr>
      <tr><td style="padding:14px 32px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;">
        Instituto NTC do Brasil · Inteligência institucional. Impacto real.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function botao(href: string, rotulo: string): string {
  return `<p style="margin:20px 0;"><a href="${href}" style="background:${OXFORD};color:#ffffff;text-decoration:none;padding:12px 22px;font-size:14px;display:inline-block;">${rotulo}</a></p>
  <p style="font-size:12px;color:#6b7280;">Se o botão não funcionar, copie e cole este endereço no navegador:<br>${href}</p>`;
}

export function emailRecuperacaoHtml(args: { nome: string; token: string }): string {
  const link = urlRedefinir(args.token);
  return moldura(
    "Redefinição de senha",
    `<p>Olá${args.nome ? `, ${args.nome}` : ""}.</p>
     <p>Recebemos um pedido para redefinir a senha do seu acesso ao Painel Admin NTC. O link abaixo vale por 24 horas.</p>
     ${botao(link, "Redefinir minha senha")}
     <p>Se você não pediu a redefinição, ignore este e-mail — sua senha continua a mesma.</p>`,
  );
}

export function emailBoasVindasHtml(args: { nome: string; token: string }): string {
  const link = urlRedefinir(args.token, true);
  return moldura(
    "Bem-vindo(a) ao Painel Admin NTC",
    `<p>Olá${args.nome ? `, ${args.nome}` : ""}.</p>
     <p>Uma conta foi criada para você no Painel Admin do Grupo NTC. Para começar, use o link abaixo para definir sua senha (válido por 24 horas).</p>
     ${botao(link, "Definir minha senha")}
     <p>Depois é só entrar em <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001"}/entrar" style="color:${OXFORD};">/entrar</a> com seu e-mail e a senha escolhida.</p>`,
  );
}

export function emailLeadHtml(args: {
  tipo: string;
  nome: string;
  email: string;
  instituicao?: string;
}): string {
  return moldura(
    `Novo lead: ${args.tipo}`,
    `<p>Um novo lead chegou pelo site.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.8;">
       <tr><td style="color:#6b7280;padding-right:16px;">Tipo</td><td><strong>${args.tipo}</strong></td></tr>
       <tr><td style="color:#6b7280;padding-right:16px;">Nome</td><td>${args.nome}</td></tr>
       <tr><td style="color:#6b7280;padding-right:16px;">E-mail</td><td>${args.email}</td></tr>
       ${args.instituicao ? `<tr><td style="color:#6b7280;padding-right:16px;">Instituição</td><td>${args.instituicao}</td></tr>` : ""}
     </table>
     <p style="margin-top:20px;">Detalhes completos na tela de Leads do Painel Admin.</p>`,
  );
}
