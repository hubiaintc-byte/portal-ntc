import { redirect } from "next/navigation";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";

import { FormRedefinir } from "./FormRedefinir";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ token?: string; novo?: string }>;
}

/**
 * /entrar/redefinir?token=… — define a senha nova (reset ou boas-vindas de
 * usuário recém-criado, quando `novo=1`).
 */
export default async function RedefinirPage({ searchParams }: PageProps) {
  if (await obterUsuarioCms()) redirect("/");
  const { token, novo } = await searchParams;

  return (
    <main className="pcms-login">
      <section className="pcms-login__marca" aria-hidden="true">
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
        <FormRedefinir token={token ?? ""} boasVindas={novo === "1"} />
      </section>
    </main>
  );
}
