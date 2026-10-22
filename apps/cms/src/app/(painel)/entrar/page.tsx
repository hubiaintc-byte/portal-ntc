import { redirect } from "next/navigation";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import { destinoDepoisDoLogin } from "@/lib/cms/navegacao";

import { FormLogin } from "./FormLogin";

export const dynamic = "force-dynamic";

/**
 * /entrar — login do Painel Admin. Layout split institucional (opção B
 * aprovada): painel Oxford com a assinatura da marca à esquerda, formulário
 * sobre osso à direita. Quem já tem sessão válida vai direto ao destino
 * dela (`destinoDepoisDoLogin`: /crm se só tem telas do CRM, senão /).
 */
export default async function EntrarPage() {
  const usuario = await obterUsuarioCms();
  if (usuario) redirect(destinoDepoisDoLogin(usuario.acesso));

  return (
    <main className="pcms-login">
      <section className="pcms-login__marca" aria-hidden="true">
        {/* Lockup oficial — variante para fundo escuro (mesma do rodapé do site). */}
        <img src="/logo-ntc.svg" alt="" className="pcms-login__logo" />
        <div>
          <p className="pcms-login__lema">
            Inteligência institucional.
            <br />
            <em>Impacto real.</em>
          </p>
          <span className="pcms-login__filete" />
          <p className="pcms-login__eyebrow">Portal Grupo NTC · Painel Admin</p>
        </div>
        <p className="pcms-login__rodape">Instituto NTC do Brasil · 2026</p>
      </section>
      <section className="pcms-login__painel">
        <FormLogin />
      </section>
    </main>
  );
}
