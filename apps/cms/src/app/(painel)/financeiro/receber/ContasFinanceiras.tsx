"use client";

import { useState } from "react";

import type { ContaFin, LivroFinanceiro, SaldoContaResumo } from "@ntc/lib";

import { excluirContaFinAcao, salvarContaFinAcao } from "../../acoesFinanceiro";
import { ExclusaoLancamento } from "../eventos/ExclusaoLancamento";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { Selo } from "../ui/Selo";
import type { MostrarToast } from "../ui/Toasts";
import { inteiro, moeda } from "../ui/formato";
import { contaComSituacao, listaContas } from "./dadosReceber";
import { GavetaConta } from "./GavetaConta";

/**
 * "Contas financeiras" de Receber: o cadastro mínimo da Fase 1 (spec §3.4).
 * A tabela é a da Administração do protótipo (`sec === 'contas'`), com o
 * saldo derivado de `saldosPorConta`; o menu da linha acrescenta inativar/
 * reativar e, só para administrador, excluir (conta usada é recusada pelo
 * servidor: "Inative-a em vez de excluí-la").
 */

interface ContasFinanceirasProps {
  livro: LivroFinanceiro;
  hojeISO: string;
  /** Administrador: pode excluir. */
  podeExcluir: boolean;
  /** Saldos do servidor, sobre o livro inteiro (`PropsTelaFin.saldosContas`). */
  saldosContas: SaldoContaResumo[];
  avisar: MostrarToast;
}

export function ContasFinanceiras({
  livro,
  hojeISO,
  podeExcluir,
  saldosContas,
  avisar,
}: ContasFinanceirasProps) {
  const { linhas, saldoInicial, saldoAtual } = listaContas(livro.contas, saldosContas);
  const [gaveta, setGaveta] = useState<{ conta: ContaFin | null } | null>(null);
  const [menu, setMenu] = useState<{ ancora: HTMLElement; c: ContaFin } | null>(null);
  const [excluindo, setExcluindo] = useState<ContaFin | null>(null);

  // Um inativar/reativar por vez: o menu fecha e reabre antes de o servidor responder.
  const [alterando, setAlterando] = useState(false);
  const alternarSituacao = async (c: ContaFin) => {
    if (alterando) return;
    setAlterando(true);
    const ativa = c.ativa === false;
    try {
      const res = await salvarContaFinAcao(c.id, contaComSituacao(c, ativa));
      if (res.ok) avisar(ativa ? "Conta reativada" : "Conta inativada", `${c.id} · ${c.nome}`);
      else avisar("Não foi possível alterar a conta", res.erro, "erro");
    } catch {
      avisar("Não foi possível alterar a conta", "Tente de novo.", "erro");
    } finally {
      setAlterando(false);
    }
  };

  const itensMenu = (c: ContaFin): EntradaMenu[] => {
    const itens: EntradaMenu[] = [
      { rotulo: "Editar conta", icone: "edit", acao: () => setGaveta({ conta: c }) },
      c.ativa === false
        ? { rotulo: "Reativar conta", icone: "check", acao: () => void alternarSituacao(c) }
        : { rotulo: "Inativar conta", icone: "x", acao: () => void alternarSituacao(c) },
    ];
    if (podeExcluir)
      itens.push("-", {
        rotulo: "Excluir conta",
        icone: "trash",
        perigo: true,
        acao: () => setExcluindo(c),
      });
    return itens;
  };

  return (
    <>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h3>Contas financeiras</h3>
            <div className="ch-sub">
              {livro.contas.length} conta(s) · o saldo é sempre derivado das movimentações
            </div>
          </div>
          <div className="ch-right">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setGaveta({ conta: null })}
            >
              <Icone nome="plus" tamanho="sm" />
              Nova conta
            </button>
          </div>
        </div>
        {linhas.length === 0 ? (
          <div className="empty" style={{ padding: 26 }}>
            <p>Nenhuma conta cadastrada.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <caption className="sr-only">Contas financeiras e saldos</caption>
              <thead>
                <tr>
                  <th scope="col">Conta</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Instituição</th>
                  <th scope="col" className="r">
                    Saldo inicial
                  </th>
                  <th scope="col" className="r">
                    Movimentações
                  </th>
                  <th scope="col" className="r">
                    Saldo atual
                  </th>
                  <th scope="col">Situação</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((a) => (
                  <tr key={a.conta.id}>
                    <td className="strong">
                      {a.conta.nome}
                      <div className="sub">{a.conta.id}</div>
                    </td>
                    <td>{a.conta.tipo}</td>
                    <td className="dim">
                      {a.conta.banco || "—"}
                      {a.conta.numero ? ` · ${a.conta.numero}` : ""}
                    </td>
                    <td className="r num">{moeda(a.conta.saldoInicial, false)}</td>
                    <td className="r num">{inteiro(a.movimentos)}</td>
                    <td className={`r num strong${a.saldo < 0 ? " neg" : ""}`}>
                      {moeda(a.saldo, false)}
                    </td>
                    <td>
                      {a.conta.ativa === false ? (
                        <Selo>Inativa</Selo>
                      ) : (
                        <Selo cor="verde">Ativa</Selo>
                      )}
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon sm"
                        aria-label={`Ações de ${a.conta.nome}`}
                        aria-haspopup="menu"
                        onClick={(e) => setMenu({ ancora: e.currentTarget, c: a.conta })}
                      >
                        <Icone nome="more" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Saldo consolidado</td>
                  <td className="r num">{moeda(saldoInicial, false)}</td>
                  <td />
                  <td className="r num">{moeda(saldoAtual, false)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {menu && (
        <MenuContexto
          ancora={menu.ancora}
          rotulo={`Ações de ${menu.c.nome}`}
          itens={itensMenu(menu.c)}
          aoFechar={() => setMenu(null)}
        />
      )}

      {gaveta && (
        <GavetaConta
          conta={gaveta.conta}
          hojeISO={hojeISO}
          aoCriar={(_conta, aviso) => {
            setGaveta(null);
            avisar(aviso.titulo, aviso.descricao);
          }}
          aoFechar={() => setGaveta(null)}
        />
      )}

      {excluindo && (
        <ExclusaoLancamento
          tipo="conta"
          rotulo={`${excluindo.id} · ${excluindo.nome}`}
          excluir={() => excluirContaFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}
