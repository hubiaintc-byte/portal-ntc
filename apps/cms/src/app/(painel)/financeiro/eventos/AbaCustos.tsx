"use client";

import { useState } from "react";

import { LISTAS_FIN, type CustoFin } from "@ntc/lib";

import { excluirCustoFinAcao } from "../../acoesFinanceiro";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { Selo, SeloStatus } from "../ui/Selo";
import { inteiro, moeda, porcentagem } from "../ui/formato";
import type { PropsAbaEvento } from "./AreaEvento";
import { MiniKpis } from "./AbaVisaoGeral";
import { percentualDe } from "./dadosArea";
import {
  categoriasPriorizadas,
  classeDesvio,
  comSinal,
  fracaoPaga,
  itensAcima,
  subDescricaoCusto,
  tabelaCustos,
} from "./dadosLancamentos";
import { ExclusaoLancamento } from "./ExclusaoLancamento";
import { FiltroSelect } from "./FiltroSelect";
import { BuscaAba } from "./AbaReceitas";
import { IconeModalidade } from "./SelosEvento";

/** Aba Custos (`wsCustos` do protótipo). Filtros e busca moram na área (`UI.ws`). */
export function AbaCustos({
  evento: ev,
  m,
  capacidades,
  avisar,
  buscas,
  aoBuscar,
  aoAbrirCusto,
  aoAbrirPagamento,
}: PropsAbaEvento) {
  const busca = buscas.cus ?? "";
  const fase = buscas.fase ?? "all";
  const status = buscas.cstatus ?? "all";
  const tabela = tabelaCustos(m, { busca, fase, status });
  const prio = categoriasPriorizadas(ev, m);
  const acima = itensAcima(m);

  const [menu, setMenu] = useState<{ ancora: HTMLElement; c: CustoFin } | null>(null);
  const [excluindo, setExcluindo] = useState<CustoFin | null>(null);

  const itensMenu = (c: CustoFin): EntradaMenu[] => {
    const itens: EntradaMenu[] = [
      {
        rotulo: "Registrar pagamento",
        icone: "wallet",
        acao: () => aoAbrirPagamento(null, { custoId: c.id }),
      },
      { rotulo: "Editar custo", icone: "edit", acao: () => aoAbrirCusto(c) },
    ];
    if (capacidades.excluirFinanceiro)
      itens.push("-", {
        rotulo: "Excluir custo",
        icone: "trash",
        perigo: true,
        acao: () => setExcluindo(c),
      });
    return itens;
  };

  const adicionar = (
    <button type="button" className="btn btn-primary" onClick={() => aoAbrirCusto(null)}>
      <Icone nome="plus" tamanho="sm" />
      Adicionar custo
    </button>
  );

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <MiniKpis
          itens={[
            ["Custo orçado", moeda(m.orcado), `${m.nCustos} lançamento(s)`],
            [
              "Custo realizado",
              moeda(m.realizado),
              `${percentualDe(m.realizado, m.orcado)} do orçado`,
            ],
            [
              "Desvio (itens realizados)",
              comSinal(m.desvio),
              acima ? `${acima} item(ns) acima do previsto` : "realizado − previsto",
              classeDesvio(m.desvio),
            ],
            ["Saldo a pagar", moeda(m.aPagar), `pago ${moeda(m.pago)}`],
          ]}
        />
      </div>

      <div
        className="card"
        style={{
          marginBottom: 16,
          padding: "14px 18px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--azul)" }}>
          <IconeModalidade modalidade={ev.modalidade} />
          <b style={{ color: "var(--tinta)" }}>{ev.modalidade}</b>
        </div>
        <div style={{ flex: 1, minWidth: 260, fontSize: 13, color: "var(--grafite)" }}>
          Categorias priorizadas para esta modalidade:{" "}
          {prio.categorias.map((c) => (
            <span key={c.nome} style={{ display: "inline-block", margin: "2px 2px 2px 0" }}>
              <Selo cor={c.lancada ? "azul" : "outline"} icone={c.lancada ? "check" : undefined}>
                {c.nome}
              </Selo>
            </span>
          ))}
          {prio.semLancamento > 0 && (
            <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
              {prio.semLancamento} categoria(s) usual(is) ainda sem lançamento — apoio de taxonomia;
              nenhum custo é gerado automaticamente.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <BuscaAba
            valor={busca}
            aoMudar={(v) => aoBuscar("cus", v)}
            placeholder="Buscar descrição, categoria, fornecedor…"
          />
          <FiltroSelect
            id="cFase"
            rotulo="Fase"
            valor={fase}
            todos="Todas as fases"
            opcoes={LISTAS_FIN.fases}
            aoMudar={(v) => aoBuscar("fase", v)}
          />
          <FiltroSelect
            id="cStatus"
            rotulo="Status"
            valor={status}
            todos="Todos os status"
            opcoes={LISTAS_FIN.statusCusto}
            aoMudar={(v) => aoBuscar("cstatus", v)}
          />
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => aoAbrirCusto(null)}
          >
            <Icone nome="plus" tamanho="sm" />
            Adicionar custo
          </button>
        </div>

        {m.cf.length === 0 ? (
          <div className="empty">
            <div className="e-icon">
              <Icone nome="out" />
            </div>
            <h4>Evento sem orçamento de custos</h4>
            <p>
              Registre os custos previstos por fase e categoria. O valor realizado e os pagamentos
              podem ser lançados depois.
            </p>
            {adicionar}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <caption className="sr-only">Custos do evento por fase</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Descrição</th>
                  <th scope="col">Fornecedor</th>
                  <th scope="col" className="r">
                    Previsto
                  </th>
                  <th scope="col" className="r">
                    Realizado
                  </th>
                  <th scope="col" className="r">
                    Desvio
                  </th>
                  <th scope="col">Pago</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabela.grupos.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty" style={{ padding: 20 }}>
                        <p>Nenhum custo corresponde aos filtros.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tabela.grupos.map((g) => [
                    <tr key={`g-${g.fase}`} className="group-row">
                      <td colSpan={3}>
                        <span className="strong">{g.fase}</span>{" "}
                        <span className="muted" style={{ fontSize: 12 }}>
                          · {g.itens.length} lançamento(s)
                        </span>
                      </td>
                      <td className="r num strong">{moeda(g.previsto)}</td>
                      <td className="r num strong">{moeda(g.realizado)}</td>
                      <td colSpan={4} />
                    </tr>,
                    ...g.itens.map(({ c, f }) => {
                      const fr = fracaoPaga(f);
                      return (
                        <tr key={c.id}>
                          <td className="idc">{c.id}</td>
                          <td>
                            <div className="strong">{c.descricao}</div>
                            <div className="sub">{subDescricaoCusto(c)}</div>
                          </td>
                          <td>
                            {c.fornecedor || (
                              <Selo cor="azul" icone="alert">
                                Não informado
                              </Selo>
                            )}
                          </td>
                          <td className="r">
                            <div className="num">{moeda(f.previsto)}</div>
                            <div className="sub num" style={{ minWidth: 0 }}>
                              {inteiro(c.qtde)} {c.unidade || ""} × {moeda(c.valorUnitPrev)}
                            </div>
                          </td>
                          <td className="r num strong">{moeda(f.realizado)}</td>
                          <td className={`r num ${classeDesvio(f.desvio)}`}>
                            {f.realizado ? comSinal(f.desvio) : <span className="muted">—</span>}
                          </td>
                          <td>
                            <div className="minibar">
                              <div
                                className="bar verde"
                                role="img"
                                aria-label={`Pago ${fr === null ? "—" : porcentagem(fr, 0)} do realizado`}
                              >
                                <i style={{ width: `${(fr ?? 0) * 100}%` }} />
                              </div>
                              <span>{fr === null ? "—" : porcentagem(fr, 0)}</span>
                            </div>
                          </td>
                          <td>
                            <SeloStatus status={f.status} tipo="financeiro" />
                          </td>
                          <td className="actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon sm"
                              aria-label={`Ações de ${c.id}`}
                              aria-haspopup="menu"
                              onClick={(e) => setMenu({ ancora: e.currentTarget, c })}
                            >
                              <Icone nome="more" />
                            </button>
                          </td>
                        </tr>
                      );
                    }),
                  ])
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total ({tabela.linhas.length} lançamento(s))</td>
                  <td className="r num">{moeda(tabela.totais.previsto)}</td>
                  <td className="r num">{moeda(tabela.totais.realizado)}</td>
                  <td className="r num">{moeda(tabela.totais.desvio)}</td>
                  <td className="num">{moeda(tabela.totais.pago)}</td>
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
          rotulo={`Ações de ${menu.c.id}`}
          itens={itensMenu(menu.c)}
          aoFechar={() => setMenu(null)}
        />
      )}

      {excluindo && (
        <ExclusaoLancamento
          tipo="custo"
          rotulo={`${excluindo.id} · ${excluindo.descricao}`}
          excluir={() => excluirCustoFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}
