import { redirect } from "next/navigation";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";

import { FormLogin } from "./FormLogin";

export const dynamic = "force-dynamic";

/**
 * /entrar — login do CMS Soberano. Layout split institucional (opção B
 * aprovada): painel Oxford com a assinatura da marca à esquerda, formulário
 * sobre osso à direita. Quem já tem sessão válida vai direto para /.
 */
export default async function EntrarPage() {
  if (await obterUsuarioCms()) redirect("/");

  return (
    <main className="pcms-login">
      <section className="pcms-login__marca" aria-hidden="true">
        {/* Logo NTC — mesmo SVG da sidebar do painel. */}
        <svg className="pcms-login__logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="20" width="14" height="40" rx="2" fill="#B5995A" />
          <text
            x="44"
            y="54"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="34"
            fontWeight="600"
            fill="#F4EFE6"
          >
            N
          </text>
        </svg>
        <div>
          <p className="pcms-login__lema">
            Inteligência institucional.
            <br />
            <em>Impacto real.</em>
          </p>
          <span className="pcms-login__filete" />
          <p className="pcms-login__eyebrow">Portal Grupo NTC · CMS Soberano</p>
        </div>
        <p className="pcms-login__rodape">Instituto NTC do Brasil · 2026</p>
      </section>
      <section className="pcms-login__painel">
        <FormLogin />
      </section>
    </main>
  );
}
