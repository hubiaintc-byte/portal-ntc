"use client";

import { nomeCentro, type LivroFinanceiro, type PagamentoFin } from "@ntc/lib";

import type { IrParaFin } from "../ShellFinanceiro";
import { nomeConta } from "../eventos/dadosLancamentos";
import { Icone } from "../ui/Icone";
import { Selo, SeloStatus } from "../ui/Selo";
import { dataCurta, moeda } from "../ui/formato";
import { competenciaDoCusto, type LinhaPagar, type TotaisPagar } from "./dadosPagar";

/**
 * Tabela "Títulos a pagar" de Pagar (`Views.pagar`): título/despesa, origem
 * (evento — atalho para a área dele só com a tela Eventos — ou "Corporativo",
 * mais o centro de custo e "compartilhada"), competência, vencimento, valor
 * do título, pago (data), saldo, conta e status; "Baixar" e editar por
 * linha; "Exportar CSV".
 */

interface TabelaTitulosProps {
  linhas: LinhaPagar[];
  totais: TotaisPagar;
  livro: LivroFinanceiro;
  temEventos: boolean;
  irPara: IrParaFin;
  aoAbrir: (p: PagamentoFin, modo: "editar" | "baixar") => void;
  aoExportar: () => void;
}

export function TabelaTitulos({
  linhas,
  totais,
  livro,
  temEventos,
  irPara,
  aoAbrir,
  aoExportar,
}: TabelaTitulosProps) {
  const origem = (p: PagamentoFin) => {
    if (!p.eventoId) return <Selo>Corporativo</Selo>;
    const ev = livro.eventos.find((e) => e.id === p.eventoId);
    if (!ev) return p.eventoId;
    return (
      <>
        {temEventos ? (
          <button
            type="button"
            className="linkbtn lnk"
            onClick={() => irPara("eventos", { eventoId: ev.id })}
          >
            {ev.id}
          </button>
        ) : (
          <span className="strong">{ev.id}</span>
        )}{" "}
        <span className="sub">{ev.nome}</span>
      </>
    );
  };

  return (
    <div className="card">
      <div className="card-head" style={{ paddingBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 18 }}>Títulos a pagar</h3>
          <div className="ch-sub">{linhas.length} título(s) · origem única dos pagamentos</div>
        </div>
        <div className="ch-right">
          <button type="button" className="btn btn-secondary btn-sm" onClick={aoExportar}>
            <Icone nome="download" tamanho="sm" />
            Exportar CSV
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <caption className="sr-only">Títulos a pagar no recorte</caption>
          <thead>
            <tr>
              <th scope="col">Título / despesa</th>
              <th scope="col">Origem</th>
              <th scope="col">Competência</th>
              <th scope="col">Vencimento</th>
              <th scope="col" className="r">
                Valor do título
              </th>
              <th scope="col" className="r">
                Pago
              </th>
              <th scope="col" className="r">
                Saldo
              </th>
              <th scope="col">Conta</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.length ? (
              linhas.map(({ p, x, c }) => (
                <tr key={p.id}>
                  <td>
                    <div className="strong">{p.documento || p.id}</div>
                    <div className="sub">
                      {c.descricao}
                      {c.fornecedor ? ` · ${c.fornecedor}` : ""}
                    </div>
                  </td>
                  <td>
                    {origem(p)}
                    <div className="sub">
                      {nomeCentro(c.centroCusto)}
                      {c.compartilhada && (
                        <>
                          {" · "}
                          <b style={{ color: "#7A5E0F" }}>compartilhada</b>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="num">{c.competencia ? competenciaDoCusto(c) : "—"}</td>
                  <td className={`num${x.vencido ? " neg" : ""}`}>{dataCurta(p.vencimento)}</td>
                  <td className="r num">{moeda(p.valor)}</td>
                  <td className="r num">
                    {p.valorPago ? (
                      <>
                        {moeda(p.valorPago)}
                        <div className="sub">{dataCurta(p.dataPagamento)}</div>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="r num strong">{moeda(x.saldo)}</td>
                  <td className="sub">
                    {p.valorPago ? (
                      nomeConta(livro.contas, p.contaId)
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <SeloStatus status={x.vencido ? "Vencida" : x.status} tipo="financeiro" />
                  </td>
                  <td className="actions">
                    {x.saldo > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ opacity: 1 }}
                        aria-label={`Baixar ${p.id}`}
                        onClick={() => aoAbrir(p, "baixar")}
                      >
                        <Icone nome="out" tamanho="xs" />
                        Baixar
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon sm"
                      aria-label={`Editar ${p.id}`}
                      onClick={() => aoAbrir(p, "editar")}
                    >
                      <Icone nome="edit" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>
                  <div className="empty" style={{ padding: 26 }}>
                    <p>Nenhum título neste recorte.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {linhas.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4}>Total do recorte</td>
                <td className="r num">{moeda(totais.obrigacoes)}</td>
                <td className="r num">{moeda(totais.pago)}</td>
                <td className="r num">{moeda(totais.saldo)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
