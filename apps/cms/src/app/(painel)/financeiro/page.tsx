import { redirect } from "next/navigation";

import { hojeEmSaoPaulo, resumoSaldosPorConta, type LivroFinanceiro, type SaldoContaResumo } from "@ntc/lib";

import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { mostraModuloFinanceiro } from "@/lib/cms/navegacao";
import { capacidadesDoAcesso } from "@/lib/cms/telas";
import { lerLivroFinanceiro, recortarLivroPorTela } from "@/lib/financeiro/leitura";

import { ShellFinanceiro } from "./ShellFinanceiro";

export const dynamic = "force-dynamic";

const LIVRO_VAZIO: LivroFinanceiro = {
  eventos: [],
  receitas: [],
  faturamentos: [],
  custos: [],
  pagamentos: [],
  contas: [],
};

/**
 * Rota /financeiro — módulo Financeiro do Portal Admin (spec §3). Server
 * Component: lê o livro inteiro e entrega só o recorte das telas da pessoa
 * (`recortarLivroPorTela`). Banco indisponível ⇒ livro vazio + erroLeitura
 * (mesmo padrão de / e /crm). Sem nenhuma tela `fin.*`, volta ao Site.
 * O saldo das contas (`saldosContas`) é calculado aqui, sobre o livro
 * INTEIRO e antes do recorte: quem tem Receber sem Pagar (ou o contrário)
 * recebe só os números por conta, nunca os lançamentos que não pode ver.
 * "Hoje" é a data civil de Brasília, calculada aqui e passada às telas
 * (nenhuma regra pura chama `new Date()`).
 */
export default async function PainelFinanceiroPage() {
  const usuario = await exigirUsuarioCms();
  const { acesso } = usuario;
  if (!mostraModuloFinanceiro(acesso)) redirect("/");

  const capacidades = capacidadesDoAcesso(acesso);

  let livro: LivroFinanceiro = LIVRO_VAZIO;
  let saldosContas: SaldoContaResumo[] = [];
  let erroLeitura = false;
  try {
    const completo = await lerLivroFinanceiro();
    saldosContas = resumoSaldosPorConta(completo);
    livro = recortarLivroPorTela(completo, acesso);
  } catch (e) {
    console.error("[PainelFinanceiroPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  const hojeISO = hojeEmSaoPaulo(new Date());

  return (
    <ShellFinanceiro
      usuario={usuario}
      acesso={acesso}
      capacidades={capacidades}
      livro={livro}
      saldosContas={saldosContas}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
