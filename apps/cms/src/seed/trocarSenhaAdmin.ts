/**
 * Troca a senha de um usuário do painel via Local API (default: admin).
 *
 * Uso — rode em um TERMINAL SEPARADO (fora de sessões de chat/CI) para a
 * senha não ficar registrada em transcript; prefixe com espaço para não ir
 * ao histórico do shell (zsh: setopt HIST_IGNORE_SPACE):
 *
 *    cd apps/cms && NOVA_SENHA='sua-senha-forte' pnpm payload run src/seed/trocarSenhaAdmin.ts
 *
 * Opcional: ADMIN_EMAIL=outro@dominio para trocar de outro usuário.
 * Observação: o JWT de sessões já abertas continua válido até expirar; a
 * senha nova vale para os próximos logins.
 */
import { getPayload } from "payload";

import config from "../payload.config";

const email = (process.env.ADMIN_EMAIL ?? "contato@institutontc.com.br").toLowerCase();
const senha = process.env.NOVA_SENHA;

if (!senha || senha.length < 12) {
  console.error("Defina NOVA_SENHA com pelo menos 12 caracteres.");
  process.exit(1);
}

const payload = await getPayload({ config });
const res = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
  depth: 0,
});
const usuario = res.docs[0];
if (!usuario) {
  console.error(`Usuário ${email} não encontrado.`);
  process.exit(1);
}

await payload.update({ collection: "users", id: usuario.id, data: { password: senha } });
console.log(`Senha de ${email} atualizada com sucesso.`);
process.exit(0);
