"use client";

import type { AlertaFin } from "@ntc/lib";

import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { moeda } from "../ui/formato";
import { ItemAlerta, ResumoAlertas, type Alerta } from "./Alertas";
import { ComposicaoFases, Legenda, LinhaFunil } from "./BlocosVisao";
import type { VisaoExecutiva } from "./dadosVisao";

interface AnaliseVisaoProps {
  v: VisaoExecutiva;
  /** Destino de cada alerta, ou `undefined` se não for link. */
  destinoDe: (a: Alerta) => (() => void) | undefined;
  /** "Ver todas" das pendências e alertas (abre a gaveta). */
  aoVerTodos: () => void;
}

/**
 * Seção "Análise" da Visão Executiva: Receita × Custo × Resultado, Do contrato
 * ao caixa, Evolução mensal do caixa, Composição dos custos, Orçado ×
 * Realizado e Pendências e alertas (`Views.dashboard` do protótipo).
 */
export function AnaliseVisao({ v, destinoDe, aoVerTodos }: AnaliseVisaoProps) {
  const { tot } = v.carteira;
  const alerts: AlertaFin[] = v.carteira.alerts;
  return (
    <>
      <div className="section-title">
        <h2>Análise</h2>
        <span className="st-line" />
      </div>
      <div className="grid g-main">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Receita × Custo × Resultado</h3>
              <div className="ch-sub">Por vertical · o evento é economicamente viável?</div>
            </div>
            <div className="ch-right">
              <Legenda
                itens={[
                  ["Receita faturada", C.azul],
                  ["Custo realizado", C.vermelho2],
                  ["Resultado", C.verde],
                ]}
              />
            </div>
          </div>
          <div className="card-body">
            <Grafico
              tipo="barras"
              dados={v.graficos.vertical}
              cores={[C.azul, C.vermelho2, C.verde]}
              rotulo="Receita faturada, custo realizado e resultado por vertical"
            />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Do contrato ao caixa</h3>
              <div className="ch-sub">Faturado × Recebido · Realizado × Pago</div>
            </div>
          </div>
          <div className="card-body">
            <div className="funnel">
              <LinhaFunil
                rotulo="Receita contratada"
                valor={tot.contratada}
                max={tot.contratada}
                cor={C.azul3}
              />
              <LinhaFunil
                rotulo="Faturada"
                valor={tot.faturada}
                max={tot.contratada}
                cor={C.azul2}
                nota={`${moeda(tot.aFaturar)} a faturar`}
              />
              <LinhaFunil
                rotulo="Recebida"
                valor={tot.recebida}
                max={tot.contratada}
                cor={C.azul}
                nota={`${moeda(tot.aReceber)} a receber`}
              />
              <div style={{ height: 1, background: "var(--line-soft)", margin: "2px 0" }} />
              <LinhaFunil
                rotulo="Custo orçado"
                valor={tot.orcado}
                max={v.baseFunilCusto}
                cor="#D9C3BF"
              />
              <LinhaFunil
                rotulo="Realizado"
                valor={tot.realizado}
                max={v.baseFunilCusto}
                cor={C.vermelho2}
              />
              <LinhaFunil
                rotulo="Pago"
                valor={tot.pago}
                max={v.baseFunilCusto}
                cor={C.vermelho}
                nota={`${moeda(tot.aPagar)} a pagar`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid g-main" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Evolução mensal do caixa</h3>
              <div className="ch-sub">
                Quando entra e quando sai o caixa? · por data de faturamento, recebimento e
                pagamento
              </div>
            </div>
            <div className="ch-right">
              <Legenda
                itens={[
                  ["Faturado", C.azul3],
                  ["Recebido", C.azul],
                  ["Pago", C.vermelho, true],
                ]}
              />
            </div>
          </div>
          <div className="card-body">
            <Grafico
              tipo="combo"
              dados={v.graficos.caixa}
              cores={[C.azul3, C.azul, C.vermelho]}
              rotulo="Evolução mensal de faturamento, recebimento e pagamento"
            />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Composição dos custos</h3>
              <div className="ch-sub">Custo realizado por fase · onde está o custo?</div>
            </div>
          </div>
          <div className="card-body">
            <ComposicaoFases serie={v.graficos.fases} />
          </div>
        </div>
      </div>

      <div className="grid g-main" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Orçado × Realizado</h3>
              <div className="ch-sub">
                Por categoria de custo (maiores volumes) · o orçamento está sendo cumprido?
              </div>
            </div>
            <div className="ch-right">
              <Legenda
                itens={[
                  ["Orçado", C.azul3],
                  ["Realizado", C.azul],
                ]}
              />
            </div>
          </div>
          <div className="card-body">
            <Grafico
              tipo="barrasHorizontais"
              dados={v.graficos.categorias}
              cores={[C.azul3, C.azul]}
              larguraMaxBarra={14}
              altura={300}
              rotulo="Orçado versus realizado por categoria"
            />
          </div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head">
            <div>
              <h3>Pendências e alertas</h3>
              <div className="ch-sub">{alerts.length} ocorrência(s) no recorte</div>
            </div>
            <div className="ch-right">
              {alerts.length > 6 && (
                <button type="button" className="linkbtn" onClick={aoVerTodos}>
                  Ver todas <Icone nome="arrowR" tamanho="xs" />
                </button>
              )}
            </div>
          </div>
          <div style={{ padding: "10px 22px 12px" }} className="asum">
            <ResumoAlertas alertas={alerts} />
          </div>
          <div className="alist">
            {alerts.length ? (
              alerts
                .slice(0, 6)
                .map((a, i) => <ItemAlerta key={i} alerta={a} aoAbrir={destinoDe(a)} />)
            ) : (
              <div className="empty" style={{ padding: 28 }}>
                <p>Nenhuma pendência no recorte.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
