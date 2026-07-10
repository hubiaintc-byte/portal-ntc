/**
 * Reset de senha do admin via Local API — uso operacional, sem e-mail.
 *
 * Uso (a senha NUNCA passa pela conversa/histórico do Claude):
 *   NOVA_SENHA='sua-senha-forte' EMAIL_ADMIN='contato@institutontc.com.br' \
 *     pnpm payload run src/seed/resetSenhaAdmin.ts
 *
 * EMAIL_ADMIN é opcional (default: contato@institutontc.com.br).
 * Dica: prefixe o comando com um espaço para não ficar no histórico do shell.
 */
import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const senha = process.env.NOVA_SENHA;
  const email = process.env.EMAIL_ADMIN ?? "contato@institutontc.com.br";
  if (!senha || senha.length < 12) {
    console.error("Defina NOVA_SENHA com pelo menos 12 caracteres.");
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  const usuario = res.docs[0];
  if (!usuario) {
    console.error(`Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  await payload.update({
    collection: "users",
    id: usuario.id,
    data: { password: senha },
    overrideAccess: true,
  });
  console.log(`Senha redefinida para ${email}. Faça login em /entrar.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FALHOU:", e instanceof Error ? e.message : e);
  process.exit(1);
});
