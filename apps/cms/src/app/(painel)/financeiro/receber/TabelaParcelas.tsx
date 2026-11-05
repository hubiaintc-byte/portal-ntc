"use client";

import { nomeCentro, type LivroFinanceiro, type ReceitaFin } from "@ntc/lib";

import type { IrParaFin } from "../ShellFinanceiro";
import { nomeConta, situacaoParcela } from "../eventos/dadosLancamentos";
import { Icone } from "../ui/Icone";
import { Selo, SeloStatus } from "../ui/Selo";
import { dataCurta, moeda } from "../ui/formato";
import { documentoParcela, type LinhaReceber, type TotaisReceber } from "./dadosReceber";

/**
 * Tabela "Parcelas a receber" de Receber (`Views.receber`): documento, origem
 * (evento — atalho para a área dele só com a tela Eventos — ou "Corporativo",
 * mais o centro de custo), vencimento/emissão, bruto, retenções, líquido,
 * recebido (data · conta), a receber (+ conciliação) e situação; "Receber"
 * e editar por linha; "Exportar CSV".
 */

interface TabelaParcelasProps {
  linhas: LinhaReceber[];
  totais: TotaisReceber;
  livro: LivroFinanceiro;
  temEventos: boolean;
  irPara: IrParaFin;
  aoAbrir: (l: LinhaReceber, modo: "editar" | "receber") => void;
  aoExportar: () => void;
}

export function TabelaParcelas({
  linhas,
  totais,
  livro,
  temEventos,
  irPara,
  aoAbrir,
  aoExportar,
}: TabelaParcelasProps) {
  const origem = (r: ReceitaFin) => {
    if (!r.eventoId) return <Selo>Corporativo</Selo>;
    const ev = livro.eventos.find((e) => e.id === r.eventoId);
    if (!ev) return r.eventoId;
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
          <h3 style={{ fontSize: 18 }}>Parcelas a receber</h3>
          <div className="ch-sub">{linhas.length} parcela(s) · origem única dos recebimentos</div>
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
          <caption className="sr-only">Parcelas a receber no recorte</caption>
          <thead>
            <tr>
              <th scope="col">Parcela / documento</th>
              <th scope="col">Origem</th>
              <th scope="col">Vencimento</th>
              <th scope="col" className="r">
                Bruto
              </th>
              <th scope="col" className="r">
                Ret. trib.
              </th>
              <th scope="col" className="r">
                Ret. contr.
              </th>
              <th scope="col" className="r">
                Líquido esp.
              </th>
              <th scope="col" className="r">
                Recebido
              </th>
              <th scope="col" className="r">
                A receber
              </th>
              <th scope="col">Situação</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.length ? (
              linhas.map((l) => {
                const { f, x, r } = l;
                return (
                  <tr key={f.id}>
                    <td>
                      <div className="strong">{documentoParcela(f)}</div>
                      <div className="sub">
                        {f.id} · {r.cliente}
                        {f.parcela && f.nf ? ` · ${f.parcela}` : ""}
                      </div>
                    </td>
                    <td>
                      {origem(r)}
                      <div className="sub">{nomeCentro(r.centroCusto)}</div>
                    </td>
                    <td className={`num${x.vencido ? " neg" : ""}`}>
                      {dataCurta(f.vencimento)}
                      <div className="sub">emit. {dataCurta(f.dataFaturamento)}</div>
                    </td>
                    <td className="r num">{moeda(x.bruto)}</td>
                    <td className="r num">
                      {x.retTrib ? (
                        <span title="Retenção tributária — não é inadimplência">
                          {moeda(x.retTrib)}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="r num">
                      {x.retContr ? (
                        <>
                          <span title="Garantia contratual — liberação prevista em contrato">
                            {moeda(x.retContr)}
                          </span>
                          {x.aLiberar > 0 && (
                            <div className="sub">a liberar {moeda(x.aLiberar)}</div>
                          )}
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="r num">{moeda(x.liquido)}</td>
                    <td className="r num">
                      {x.recebido ? (
                        <>
                          {moeda(x.recebido)}
                          <div className="sub">
                            {dataCurta(f.dataRecebimento)} · {nomeConta(livro.contas, f.contaId)}
                          </div>
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="r num strong">
                      {moeda(x.exigivel)}
                      {x.diferenca !== 0 && (
                        <div className="sub neg">concil. {moeda(x.diferenca, false)}</div>
                      )}
                    </td>
                    <td>
                      <SeloStatus status={situacaoParcela(x)} tipo="financeiro" />
                    </td>
                    <td className="actions">
                      {x.exigivel > 0 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ opacity: 1 }}
                          aria-label={`Receber ${f.id}`}
                          onClick={() => aoAbrir(l, "receber")}
                        >
                          <Icone nome="inn" tamanho="xs" />
                          Receber
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon sm"
                        aria-label={`Editar ${f.id}`}
                        onClick={() => aoAbrir(l, "editar")}
                      >
                        <Icone nome="edit" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11}>
                  <div className="empty" style={{ padding: 26 }}>
                    <p>Nenhuma parcela neste recorte.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {linhas.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3}>Total do recorte</td>
                <td className="r num">{moeda(totais.bruto)}</td>
                <td className="r num">{moeda(totais.retTrib)}</td>
                <td className="r num">{moeda(totais.retContr)}</td>
                <td className="r num">{moeda(totais.liquido)}</td>
                <td className="r num">{moeda(totais.recebido)}</td>
                <td className="r num">{moeda(totais.exigivel)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
