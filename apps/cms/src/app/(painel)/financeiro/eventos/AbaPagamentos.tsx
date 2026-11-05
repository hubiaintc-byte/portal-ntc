"use client";

import { useState } from "react";

import type { PagamentoFin } from "@ntc/lib";

import { excluirPagamentoFinAcao } from "../../acoesFinanceiro";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { SeloStatus } from "../ui/Selo";
import { dataCurta, moeda } from "../ui/formato";
import type { PropsAbaEvento } from "./AreaEvento";
import { BuscaAba } from "./AbaReceitas";
import { PassoFluxo } from "./AbaVisaoGeral";
import { percentualDe } from "./dadosArea";
import { gruposPagamentos, resumoPagamentos, situacaoTitulo } from "./dadosLancamentos";
import { ExclusaoLancamento } from "./ExclusaoLancamento";

/** Aba Pagamentos (`wsPagamentos` do protótipo). "Somente com saldo" é o mesmo filtro da aba Faturamento. */
export function AbaPagamentos({
  evento: ev,
  m,
  livro,
  hojeISO,
  capacidades,
  avisar,
  aoTrocarAba,
  buscas,
  aoBuscar,
  aoAbrirPagamento,
}: PropsAbaEvento) {
  const busca = buscas.pag ?? "";
  const soSaldo = buscas.soSaldo === "1";
  const grupos = gruposPagamentos(m, hojeISO, busca, soSaldo);
  const resumo = resumoPagamentos(livro, ev.id, m, hojeISO);

  const [menu, setMenu] = useState<{ ancora: HTMLElement; p: PagamentoFin } | null>(null);
  const [excluindo, setExcluindo] = useState<PagamentoFin | null>(null);

  const itensMenu = (p: PagamentoFin): EntradaMenu[] => {
    const itens: EntradaMenu[] = [
      {
        rotulo: "Registrar baixa",
        icone: "check",
        acao: () => aoAbrirPagamento(p, { modo: "baixar" }),
      },
      { rotulo: "Editar título", icone: "edit", acao: () => aoAbrirPagamento(p) },
    ];
    if (capacidades.excluirFinanceiro)
      itens.push("-", {
        rotulo: "Excluir pagamento",
        icone: "trash",
        perigo: true,
        acao: () => setExcluindo(p),
      });
    return itens;
  };

  const sub = (rotulo: string, valor: number) => (
    <>
      <div className="sub" style={{ margin: 0 }}>
        {rotulo}
      </div>
      <span className="num strong">{moeda(valor)}</span>
    </>
  );

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flow">
          <PassoFluxo
            rotulo="Custo realizado"
            valor={m.realizado}
            sub={`${resumo.nRealizados} custo(s) incorrido(s)`}
            icone="out"
          />
          <PassoFluxo
            rotulo="Pago"
            valor={m.pago}
            sub={`${percentualDe(m.pago, m.realizado)} do realizado`}
            icone="wallet"
          />
          <PassoFluxo
            rotulo="Saldo a pagar"
            valor={m.aPagar}
            sub="realizado − pago"
            icone="clock"
          />
          <PassoFluxo
            rotulo="Vencido sem baixa"
            valor={resumo.vencidoSaldo}
            sub={
              resumo.nVencidos ? (
                <span className="neg">{resumo.nVencidos} título(s)</span>
              ) : (
                "nenhum título vencido"
              )
            }
            seta={false}
            icone="alert"
          />
        </div>
      </div>

      {resumo.semTitulo > 0 && (
        <div className="ctx-note" style={{ marginBottom: 16 }}>
          <Icone nome="info" tamanho="sm" />
          <div>
            {resumo.semTitulo} custo(s) realizado(s) ainda sem título programado para todo o valor.
            Use <b>+ Pagamento</b> no custo para programar ou baixar.
          </div>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <BuscaAba
            valor={busca}
            aoMudar={(v) => aoBuscar("pag", v)}
            placeholder="Buscar fornecedor, documento, custo…"
          />
          <label
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
              color: "var(--grafite)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={soSaldo}
              onChange={(e) => aoBuscar("soSaldo", e.target.checked ? "1" : "")}
            />{" "}
            Somente com saldo
          </label>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={m.nCustos === 0}
            onClick={() => aoAbrirPagamento(null)}
          >
            <Icone nome="plus" tamanho="sm" />
            Registrar pagamento
          </button>
        </div>

        {grupos.length === 0 ? (
          <div className="empty">
            <div className="e-icon">
              <Icone nome="wallet" />
            </div>
            <h4>{m.nCustos ? "Nenhum custo realizado ou pagamento" : "Evento sem custos"}</h4>
            <p>
              Pagamentos são vinculados a lançamentos de custo (ID_LANCAMENTO_CUSTO). Custo
              realizado ≠ pago.
            </p>
            {!m.nCustos && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => aoTrocarAba("custos")}
              >
                Ir para Custos
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <caption className="sr-only">Títulos e baixas do evento por custo</caption>
              <thead>
                <tr>
                  <th scope="col">Custo / título</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Vencimento</th>
                  <th scope="col" className="r">
                    Valor do título
                  </th>
                  <th scope="col">Pagamento</th>
                  <th scope="col" className="r">
                    Valor pago
                  </th>
                  <th scope="col" className="r">
                    Saldo
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(({ c, f, titulos }) => [
                  <tr key={`c-${c.id}`} className="group-row">
                    <td colSpan={3}>
                      <div className="strong">{c.descricao}</div>
                      <div className="sub">
                        {c.id} · {c.fornecedor || "Fornecedor não informado"} · {c.fase}
                      </div>
                    </td>
                    <td className="r">{sub("realizado", f.realizado)}</td>
                    <td />
                    <td className="r">{sub("pago", f.pago)}</td>
                    <td className="r">{sub("a pagar", f.aPagar)}</td>
                    <td>
                      <SeloStatus status={f.status} tipo="financeiro" />
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        aria-label={`Pagamento de ${c.id}`}
                        onClick={() => aoAbrirPagamento(null, { custoId: c.id })}
                      >
                        <Icone nome="plus" tamanho="xs" />
                        Pagamento
                      </button>
                    </td>
                  </tr>,
                  ...titulos.map(({ p, x }) => (
                    <tr key={p.id} className="child-row">
                      <td>
                        <span className="idc">{p.id}</span>
                      </td>
                      <td>{p.documento || "—"}</td>
                      <td className={`num${x.vencido ? " neg" : ""}`}>{dataCurta(p.vencimento)}</td>
                      <td className="r num">{moeda(p.valor)}</td>
                      <td className="num">{dataCurta(p.dataPagamento)}</td>
                      <td className="r num">{moeda(p.valorPago)}</td>
                      <td className="r num strong">{moeda(x.saldo)}</td>
                      <td>
                        <SeloStatus status={situacaoTitulo(x)} tipo="financeiro" />
                      </td>
                      <td className="actions">
                        {x.saldo > 0 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ opacity: 1 }}
                            aria-label={`Baixar ${p.id}`}
                            onClick={() => aoAbrirPagamento(p, { modo: "baixar" })}
                          >
                            <Icone nome="check" tamanho="xs" />
                            Baixar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon sm"
                          aria-label={`Ações de ${p.id}`}
                          aria-haspopup="menu"
                          onClick={(e) => setMenu({ ancora: e.currentTarget, p })}
                        >
                          <Icone nome="more" />
                        </button>
                      </td>
                    </tr>
                  )),
                  ...(titulos.length === 0
                    ? [
                        <tr key={`v-${c.id}`} className="child-row">
                          <td colSpan={9} className="muted">
                            Nenhum título programado — saldo integral a pagar.
                          </td>
                        </tr>,
                      ]
                    : []),
                ])}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total do evento</td>
                  <td className="r num">{moeda(resumo.totalTitulos)}</td>
                  <td />
                  <td className="r num">{moeda(m.pago)}</td>
                  <td className="r num">{moeda(m.aPagar)}</td>
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
          rotulo={`Ações de ${menu.p.id}`}
          itens={itensMenu(menu.p)}
          aoFechar={() => setMenu(null)}
        />
      )}

      {excluindo && (
        <ExclusaoLancamento
          tipo="pagamento"
          rotulo={`${excluindo.id} · ${excluindo.documento}`}
          excluir={() => excluirPagamentoFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}
