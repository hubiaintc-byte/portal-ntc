"use client";

import type { ReactNode } from "react";

import { serieOrcadoRealizado, type Centavos } from "@ntc/lib";

import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { Dica } from "../ui/Selo";
import { inteiro, moeda, porcentagem } from "../ui/formato";
import { HeroResultado, Legenda } from "../visao/BlocosVisao";
import type { PropsAbaEvento } from "./AreaEvento";
import { TituloSecao } from "./AbaVisaoGeral";
import { ehAberto, fracoesParticipantes, indicadoresParticipante } from "./dadosArea";

/**
 * Aba Resultado (`wsResultado` do protótipo), sem o que é de comissão (Fase 2):
 * a linha "(−) Comissões comerciais" do demonstrativo, "— operacionais"/
 * "— comissões" e "Comissões no resultado" da composição e o indicador
 * "Comissão por participante". As ajudas perderam a menção a comissões.
 */

interface LinhaProps {
  rotulo: string;
  valor?: Centavos;
  total?: boolean;
  dica?: string;
  /** `signed`: negativo em vermelho. */
  comSinal?: boolean;
  /** Conteúdo pronto no lugar do valor (`raw`). */
  bruto?: ReactNode;
}

/** `line(l, v, opts)` do protótipo. */
function Linha({ rotulo, valor = 0, total, dica, comSinal, bruto }: LinhaProps) {
  return (
    <div className={`cline${total ? " total" : ""}`}>
      <span className="cl">
        {rotulo}
        {dica && <Dica texto={dica} />}
      </span>
      <span className="cv">
        {bruto ?? (
          <span className={`num${comSinal && valor < 0 ? " neg" : ""}`}>{moeda(valor)}</span>
        )}
      </span>
    </div>
  );
}

/** `demoTable(m.demo)` sem a linha de comissões: Previsto · Realizado · Caixa. */
function Demonstrativo({
  receita,
  custo,
  resultado,
}: {
  receita: readonly Centavos[];
  custo: readonly Centavos[];
  resultado: readonly Centavos[];
}) {
  const cols = ["Previsto", "Realizado", "Caixa"];
  const linha = (rotulo: string, vals: readonly Centavos[], total: boolean, dica?: string) => (
    <tr className={total ? "demo-total" : undefined}>
      <td className={total ? "strong" : undefined}>
        {rotulo}
        {dica && <Dica texto={dica} />}
      </td>
      {vals.map((v, i) => (
        <td key={i} className={`r num${total ? (v < 0 ? " strong neg" : " strong") : ""}`}>
          {moeda(v, false)}
        </td>
      ))}
    </tr>
  );
  return (
    <div className="table-wrap">
      <table className="t demo">
        <thead>
          <tr>
            <th scope="col">Composição do resultado do evento</th>
            {cols.map((c) => (
              <th scope="col" key={c} className="r">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linha(
            "Receitas do evento",
            receita,
            false,
            "Previsto: receita contratada. Realizado: receita reconhecida no período. Caixa: valor recebido.",
          )}
          {linha(
            "(−) Custos e despesas operacionais",
            custo,
            false,
            "Todos os custos e despesas do período.",
          )}
          {linha("(=) Resultado do evento", resultado, true)}
        </tbody>
      </table>
    </div>
  );
}

export function AbaResultado({ evento: ev, m, livro }: PropsAbaEvento) {
  const cats = serieOrcadoRealizado(livro, [ev.id]);
  const fr = fracoesParticipantes(m);
  const desvio = m.desvio;

  return (
    <>
      <HeroResultado tot={m} escopo="do evento" />

      <TituloSecao titulo="Demonstrativo do resultado" nota="receitas − custos" />
      <div className="card" style={{ marginBottom: 16 }}>
        <Demonstrativo receita={m.demo.receita} custo={m.demo.custo} resultado={m.demo.resultado} />
        <div className="demo-leg">
          <span>
            <b>Previsto</b> — o que foi contratado e planejado.
          </span>
          <span>
            <b>Realizado</b> — o que foi reconhecido no período.
          </span>
          <span>
            <b>Caixa</b> — o que foi recebido e pago neste evento.
          </span>
        </div>
        <div className="ctx-note gold" style={{ margin: "14px 18px 18px" }}>
          <Icone nome="info" tamanho="sm" />
          <div>
            O demonstrativo considera apenas o que está lançado <b>neste evento</b>. Não inclui
            despesas corporativas, estrutura compartilhada, tributos sobre o resultado nem retenções
            — esses elementos são apurados na visão da instituição, em Resultado e Orçamento.
            Resultado positivo não significa dinheiro em caixa.
          </div>
        </div>
      </div>

      <TituloSecao titulo="Como o resultado se forma" />
      <div className="compose">
        <div className="cbox">
          <h4>
            <span className="cb-mark" style={{ background: "var(--azul)" }} />
            Receitas
          </h4>
          <Linha
            rotulo="Contratada"
            valor={m.contratada}
            dica="Valor dos contratos e inscrições confirmados, mesmo que ainda não faturados ou recebidos."
          />
          <Linha
            rotulo="Reconhecida no período"
            valor={m.reconhecida}
            dica="Parcela da receita que já pertence ao resultado: etapas concluídas ou execução declarada."
          />
          <Linha
            rotulo="Faturada"
            valor={m.faturada}
            dica="Valor dos documentos de cobrança emitidos."
          />
          <Linha rotulo="Recebida" valor={m.recebida} dica="Valor efetivamente recebido." />
          <Linha rotulo="A faturar" valor={m.aFaturar} dica="Contratada menos faturada." />
          <Linha rotulo="A receber" valor={m.aReceber} total dica="Faturada menos recebida." />
          {m.prevista > 0 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              + {moeda(m.prevista)} em receita prevista, ainda não contratada
            </div>
          )}
        </div>
        <div className="cbox">
          <h4>
            <span className="cb-mark" style={{ background: "var(--vermelho)" }} />
            Custos e despesas
          </h4>
          <Linha rotulo="Previsto" valor={m.orcado} dica="Plano de custos do evento." />
          <Linha
            rotulo="Realizado (total)"
            valor={m.realizado}
            dica="Custos e despesas incorridos, independentemente de pagamento."
          />
          <Linha rotulo="Pago" valor={m.pago} dica="Saída de caixa efetiva." />
          <Linha rotulo="Diretos" valor={m.direto} />
          <Linha rotulo="A pagar" valor={m.aPagar} total dica="Realizado menos pago." />
        </div>
        <div className="cbox">
          <h4>
            <span className="cb-mark" style={{ background: "var(--noite)" }} />
            Resultado
          </h4>
          <div className="eq" style={{ margin: "10px 0 6px" }}>
            <span>Reconhecida</span>
            <span className="op">−</span>
            <span>Realizado</span>
            <span className="op">=</span>
            <b className={`num${m.resultadoRealizado < 0 ? " neg" : ""}`}>
              {moeda(m.resultadoRealizado, false)}
            </b>
          </div>
          <Linha rotulo="Resultado do evento" valor={m.resultadoRealizado} comSinal />
          <Linha
            rotulo="Resultado previsto"
            valor={m.resultadoPrevisto}
            comSinal
            dica="Contratada menos previsto."
          />
          <Linha
            rotulo="Desvio previsto × realizado"
            dica="Realizado menos previsto, nos itens já realizados."
            bruto={
              <span className={`num${desvio > 0 ? " neg" : desvio < 0 ? " pos" : ""}`}>
                {desvio > 0 ? "+" : ""}
                {moeda(desvio)}
              </span>
            }
          />
          <Linha
            rotulo="Movimentação financeira"
            valor={m.movimentacao}
            comSinal
            total
            dica="Recebido menos pago. Não é resultado."
          />
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: 16 }}>
        <div className="cbox">
          <h4>
            <Icone nome="users" tamanho="sm" /> Indicadores por participante
          </h4>
          <div className="muted" style={{ fontSize: 12.5, margin: "4px 0 8px" }}>
            Apenas os indicadores que podem ser calculados com o que está lançado.
          </div>
          {indicadoresParticipante(m).map((i) => (
            <div key={i.rotulo}>
              <div className="cline">
                <span className="cl">
                  {i.rotulo}
                  {i.dica && <Dica texto={i.dica} />}
                </span>
                <span className="cv">
                  {i.valor != null ? (
                    <span className="num">{moeda(i.valor)}</span>
                  ) : (
                    <span className="muted">{i.naoAplicavel ? "Não aplicável" : "—"}</span>
                  )}
                </span>
              </div>
              {i.base && (
                <div className="muted" style={{ fontSize: 11.5, margin: "-6px 0 6px" }}>
                  {i.base}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="cbox">
          <h4>
            <Icone nome="ticket" tamanho="sm" /> Pagantes e cortesias
          </h4>
          <div className="muted" style={{ fontSize: 12.5, margin: "4px 0 8px" }}>
            Cortesia não é custo negativo nem simples desconto: é participante sem receita
            associada.
          </div>
          {m.participantes ? (
            <>
              <div
                role="img"
                aria-label={`Pagantes ${porcentagem(fr.pagantes)}, cortesias ${porcentagem(fr.cortesias)}`}
                style={{
                  display: "flex",
                  height: 14,
                  borderRadius: 2,
                  overflow: "hidden",
                  margin: "10px 0 6px",
                  border: "1px solid var(--line-soft)",
                }}
              >
                <i style={{ width: `${fr.pagantes * 100}%`, background: "var(--azul)" }} />
                <i style={{ width: `${fr.cortesias * 100}%`, background: "var(--dourado)" }} />
              </div>
              <Legenda
                itens={[
                  [`Pagantes · ${inteiro(m.pagantes)}`, C.azul],
                  [`Cortesias · ${inteiro(m.cortesias)}`, C.dourado],
                ]}
              />
              <div style={{ marginTop: 10 }}>
                <Linha
                  rotulo="Participantes totais"
                  bruto={<span className="num">{inteiro(m.participantes)}</span>}
                />
                <Linha
                  rotulo="Cortesias sobre o total"
                  bruto={<span className="num">{porcentagem(fr.cortesias)}</span>}
                />
                {ev.capacidade > 0 && (
                  <Linha
                    rotulo="Participantes / capacidade"
                    bruto={
                      <span className="num">
                        {inteiro(m.participantes)} de {inteiro(ev.capacidade)}
                      </span>
                    }
                  />
                )}
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: 22 }}>
              <p>
                {ehAberto(ev)
                  ? "Sem pagantes/cortesias registrados nas receitas."
                  : "Não aplicável a este tipo de operação (receita por valor global)."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h3>Orçado × Realizado por categoria</h3>
            <div className="ch-sub">Onde o orçamento foi (ou não) cumprido</div>
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
          {cats.labels.length ? (
            <Grafico
              tipo="barrasHorizontais"
              dados={cats}
              altura={Math.max(200, cats.labels.length * 34 + 40)}
              rotulo="Orçado versus realizado por categoria"
              cores={[C.azul3, C.azul]}
              larguraMaxBarra={12}
            />
          ) : (
            <div className="empty" style={{ padding: 30 }}>
              <p>Sem custos registrados.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
