"use client";

import { useState } from "react";

import { cronogramaFaturamento, type FaturamentoFin } from "@ntc/lib";

import { excluirFaturamentoFinAcao } from "../../acoesFinanceiro";
import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { SeloStatus, TagValidar } from "../ui/Selo";
import { dataCurta, moeda } from "../ui/formato";
import { Legenda } from "../visao/BlocosVisao";
import type { PropsAbaEvento } from "./AreaEvento";
import { BuscaAba } from "./AbaReceitas";
import { PassoFluxo } from "./AbaVisaoGeral";
import { percentualDe } from "./dadosArea";
import {
  gruposFaturamento,
  nomeConta,
  receitasFaturaveis,
  resumoFaturamento,
  situacaoParcela,
} from "./dadosLancamentos";
import { ExclusaoLancamento } from "./ExclusaoLancamento";

/** Aba Faturamento e recebimentos (`wsFaturamento` do protótipo). */
export function AbaFaturamento({
  evento: ev,
  m,
  livro,
  hojeISO,
  capacidades,
  avisar,
  aoTrocarAba,
  buscas,
  aoBuscar,
  aoAbrirFaturamento,
}: PropsAbaEvento) {
  const busca = buscas.fat ?? "";
  const soSaldo = buscas.soSaldo === "1";
  const contratadas = receitasFaturaveis(livro, ev.id);
  const resumo = resumoFaturamento(livro, ev.id, hojeISO);
  const grupos = gruposFaturamento(m, hojeISO, busca, soSaldo);
  const cronograma = cronogramaFaturamento(livro, ev.id);

  const [menu, setMenu] = useState<{ ancora: HTMLElement; p: FaturamentoFin } | null>(null);
  const [excluindo, setExcluindo] = useState<FaturamentoFin | null>(null);

  const itensMenu = (p: FaturamentoFin): EntradaMenu[] => {
    const itens: EntradaMenu[] = [
      {
        rotulo: "Registrar recebimento",
        icone: "inn",
        acao: () => aoAbrirFaturamento(p, { modo: "receber" }),
      },
      { rotulo: "Editar faturamento", icone: "edit", acao: () => aoAbrirFaturamento(p) },
    ];
    if (capacidades.excluirFinanceiro)
      itens.push("-", {
        rotulo: "Excluir faturamento",
        icone: "trash",
        perigo: true,
        acao: () => setExcluindo(p),
      });
    return itens;
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flow">
          <PassoFluxo
            rotulo="Contratada"
            valor={m.contratada}
            sub={`${contratadas.length} receita(s) contratada(s)`}
            icone="file"
          />
          <PassoFluxo
            rotulo="Faturada"
            valor={m.faturada}
            sub={`${moeda(m.aFaturar)} a faturar`}
            icone="receipt"
          />
          <PassoFluxo
            rotulo="Recebida"
            valor={m.recebida}
            sub={`${percentualDe(m.recebida, m.faturada)} do faturado`}
            icone="inn"
          />
          <PassoFluxo
            rotulo="A receber"
            valor={m.aReceber}
            sub={
              resumo.vencidos ? (
                <span className="neg">{resumo.vencidos} parcela(s) vencida(s)</span>
              ) : (
                "faturado − recebido"
              )
            }
            seta={false}
            icone="clock"
          />
        </div>
      </div>

      {resumo.retTotal > 0 && (
        <div className="ctx-note gold" style={{ marginBottom: 16 }}>
          <Icone nome="scale" tamanho="sm" />
          <div>
            <b>Retenções registradas: {moeda(resumo.retTotal)}</b> — tributária{" "}
            {moeda(resumo.retTrib, false)} · contratual {moeda(resumo.retContr, false)}
            {resumo.aLiberar > 0 ? ` (a liberar ${moeda(resumo.aLiberar)})` : ""}. Retenção{" "}
            <b>não é inadimplência</b> e não é, por si, custo do evento: reduz o líquido esperado.
            Valor que pode ser cobrado hoje: <b>{moeda(resumo.exigivel, false)}</b>. O faturado em
            aberto continua sendo faturado menos recebido; o tratamento tributário permanece{" "}
            <TagValidar texto="VALIDAR COM CONTABILIDADE" />.
          </div>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <BuscaAba
            valor={busca}
            aoMudar={(v) => aoBuscar("fat", v)}
            placeholder="Buscar cliente, NF, parcela…"
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
            disabled={contratadas.length === 0}
            onClick={() => aoAbrirFaturamento(null)}
          >
            <Icone nome="plus" tamanho="sm" />
            Registrar faturamento
          </button>
        </div>

        {contratadas.length === 0 ? (
          <div className="empty">
            <div className="e-icon">
              <Icone nome="receipt" />
            </div>
            <h4>Nenhuma receita contratada</h4>
            <p>
              O faturamento é vinculado a uma receita contratada (ID_RECEITA). Registre ou contrate
              uma receita primeiro.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => aoTrocarAba("receitas")}
            >
              Ir para Receitas
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <caption className="sr-only">
                Faturamentos e recebimentos do evento por receita
              </caption>
              <thead>
                <tr>
                  <th scope="col">Receita / parcela</th>
                  <th scope="col">Vencimento</th>
                  <th scope="col" className="r">
                    Faturado
                  </th>
                  <th scope="col" className="r">
                    Ret. trib.
                  </th>
                  <th scope="col" className="r">
                    Ret. contr.
                  </th>
                  <th scope="col" className="r">
                    Líquido esperado
                  </th>
                  <th scope="col" className="r">
                    Recebido
                  </th>
                  <th scope="col" className="r">
                    A receber
                  </th>
                  <th scope="col" className="r">
                    Faturado em aberto
                  </th>
                  <th scope="col">Situação</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(({ r, f, parcelas }) => [
                  <tr key={`r-${r.id}`} className="group-row">
                    <td colSpan={2}>
                      <div className="strong">{r.cliente}</div>
                      <div className="sub">
                        {r.id} · {r.tipoReceita}
                        {r.etapa ? ` · ${r.etapa}` : ""} · contratado {moeda(f.valor)}
                        {f.aFaturar > 0 && (
                          <>
                            {" "}
                            · <b style={{ color: "#7A5E0F" }}>{moeda(f.aFaturar)} a faturar</b>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="r num strong">{moeda(f.faturado)}</td>
                    <td />
                    <td />
                    <td />
                    <td className="r num strong">{moeda(f.recebido)}</td>
                    <td className="r num strong">{moeda(f.exigivel)}</td>
                    <td className="r num strong">{moeda(f.aReceber)}</td>
                    <td>
                      <SeloStatus status={f.status} tipo="financeiro" />
                    </td>
                    <td className="actions">
                      {f.aFaturar > 0 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          aria-label={`Faturar ${r.id}`}
                          onClick={() => aoAbrirFaturamento(null, { receitaId: r.id })}
                        >
                          <Icone nome="plus" tamanho="xs" />
                          Faturar
                        </button>
                      )}
                    </td>
                  </tr>,
                  ...parcelas.map(({ p, x }) => (
                    <tr key={p.id} className="child-row">
                      <td>
                        <div className="strong" style={{ fontWeight: 500 }}>
                          {p.parcela}
                        </div>
                        <div className="sub">
                          {p.nf || "sem NF"} · {p.id} · emit. {dataCurta(p.dataFaturamento)}
                        </div>
                      </td>
                      <td className={`num${x.vencido ? " neg" : ""}`}>{dataCurta(p.vencimento)}</td>
                      <td className="r num">{moeda(p.valorFaturado)}</td>
                      <td className="r num">
                        {x.retTrib ? (
                          <span title="Retenção tributária — tratamento a validar com Contabilidade. Não é inadimplência.">
                            {moeda(x.retTrib)}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="r num">
                        {x.retContr ? (
                          <span title="Retenção contratual (garantia) — liberação prevista em contrato. Não é inadimplência.">
                            {moeda(x.retContr)}
                            {x.aLiberar > 0 && (
                              <div className="sub">a liberar {moeda(x.aLiberar)}</div>
                            )}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="r num">{moeda(x.liquido)}</td>
                      <td className="r num">
                        {p.valorRecebido ? (
                          <>
                            {moeda(p.valorRecebido)}
                            <div className="sub">
                              {dataCurta(p.dataRecebimento)} · {nomeConta(livro.contas, p.contaId)}
                            </div>
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="r num">
                        {moeda(x.exigivel)}
                        {x.diferenca !== 0 && (
                          <div className="sub neg">concil. {moeda(x.diferenca, false)}</div>
                        )}
                      </td>
                      <td className="r num strong">{moeda(x.saldo)}</td>
                      <td>
                        <SeloStatus status={situacaoParcela(x)} tipo="financeiro" />
                      </td>
                      <td className="actions">
                        {x.exigivel > 0 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ opacity: 1 }}
                            aria-label={`Receber ${p.id}`}
                            onClick={() => aoAbrirFaturamento(p, { modo: "receber" })}
                          >
                            <Icone nome="inn" tamanho="xs" />
                            Receber
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
                  ...(parcelas.length === 0
                    ? [
                        <tr key={`v-${r.id}`} className="child-row">
                          <td colSpan={11} className="muted">
                            {soSaldo
                              ? "Sem parcelas com saldo — resta faturar."
                              : "Nenhum faturamento registrado para esta receita."}
                          </td>
                        </tr>,
                      ]
                    : []),
                ])}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total do evento</td>
                  <td className="r num">{moeda(m.faturada)}</td>
                  <td className="r num">{moeda(resumo.retTrib)}</td>
                  <td className="r num">{moeda(resumo.retContr)}</td>
                  <td className="r num">{moeda(m.faturada - resumo.retTotal)}</td>
                  <td className="r num">{moeda(m.recebida)}</td>
                  <td className="r num">{moeda(resumo.exigivel)}</td>
                  <td className="r num">{moeda(m.aReceber)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h3>Cronograma de recebimentos</h3>
            <div className="ch-sub">Faturado × recebido por mês</div>
          </div>
          <div className="ch-right">
            <Legenda
              itens={[
                ["Faturado", C.azul3],
                ["Recebido", C.azul],
              ]}
            />
          </div>
        </div>
        <div className="card-body">
          {cronograma.labels.length ? (
            <Grafico
              tipo="barras"
              dados={cronograma}
              altura={220}
              rotulo="Cronograma de faturamento e recebimento"
              cores={[C.azul3, C.azul]}
              larguraMaxBarra={28}
            />
          ) : (
            <div className="chart-box short">
              <div className="empty" style={{ padding: 30 }}>
                <p>Sem faturamentos registrados.</p>
              </div>
            </div>
          )}
        </div>
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
          tipo="faturamento"
          rotulo={`${excluindo.id} · ${excluindo.nf || excluindo.parcela}`}
          excluir={() => excluirFaturamentoFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}
