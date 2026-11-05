"use client";

import type { ReactNode } from "react";

import { phaseDonut, serieReceitaXCusto, type Centavos } from "@ntc/lib";

import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone, type NomeIcone } from "../ui/Icone";
import { ValorGrande } from "../ui/Kpi";
import { ChipVertical, SeloStatus } from "../ui/Selo";
import { moeda } from "../ui/formato";
import { ItemAlerta } from "../visao/Alertas";
import { ComposicaoFases, HeroResultado, Legenda } from "../visao/BlocosVisao";
import type { PropsAbaEvento } from "./AreaEvento";
import { fatosDoEvento, operacaoDoEvento, percentualDe, type MiniKpi } from "./dadosArea";

/** `flowStep(label, v, sub, arrow, ic)` do protótipo. */
export function PassoFluxo({
  rotulo,
  valor,
  sub,
  seta = true,
  icone,
}: {
  rotulo: string;
  valor: Centavos;
  sub: ReactNode;
  seta?: boolean;
  icone: NomeIcone;
}) {
  return (
    <div className="flow-step">
      <div className="fs-l">
        <Icone nome={icone} tamanho="xs" />
        {rotulo}
      </div>
      <div className="fs-v">
        <ValorGrande valor={valor} />
      </div>
      <div className="fs-s">{sub}</div>
      {seta && (
        <span className="fs-arrow" aria-hidden="true">
          <Icone nome="chevR" />
        </span>
      )}
    </div>
  );
}

/** `miniKpi(l, v, s, cls)` do protótipo. */
export function MiniKpis({ itens, colunas }: { itens: readonly MiniKpi[]; colunas?: number }) {
  return (
    <div
      className="mini-kpis"
      style={colunas ? { gridTemplateColumns: `repeat(${colunas},minmax(0,1fr))` } : undefined}
    >
      {itens.map(([l, v, s, cls]) => (
        <div key={l}>
          <div className="ml">{l}</div>
          <div className={`mv num${cls ? ` ${cls}` : ""}`}>{v}</div>
          {s && <div className="ms">{s}</div>}
        </div>
      ))}
    </div>
  );
}

/** Título de seção do protótipo (`.section-title`). */
export function TituloSecao({ titulo, nota }: { titulo: string; nota?: string }) {
  return (
    <div className="section-title">
      <h2>{titulo}</h2>
      <span className="st-line" />
      {nota && <span className="st-note">{nota}</span>}
    </div>
  );
}

/** Aba Visão geral (`wsOverview` do protótipo). */
export function AbaVisaoGeral({
  evento: ev,
  m,
  alertas,
  livro,
  aoTrocarAba,
  aoVerPendencias,
}: PropsAbaEvento) {
  const fatos = fatosDoEvento(ev, m);
  const op = operacaoDoEvento(ev, m);

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="facts">
          {fatos.map((f) => (
            <div className="fact" key={f.rotulo}>
              <div className="fl">{f.rotulo}</div>
              <div className="fv">
                {f.tipo === "vertical" ? (
                  <ChipVertical vertical={f.texto} />
                ) : f.tipo === "status" ? (
                  <SeloStatus status={f.texto} tipo="operacional" />
                ) : f.tipo === "numero" ? (
                  <span className="num">{f.texto}</span>
                ) : (
                  f.texto
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <HeroResultado tot={m} escopo="do evento" />

      <TituloSecao
        titulo="Receita"
        nota={m.prevista ? `${moeda(m.prevista)} em receita prevista (não contratada)` : undefined}
      />
      <div className="card">
        <div className="flow">
          <PassoFluxo
            rotulo="Contratada"
            valor={m.contratada}
            sub={`${m.nReceitas} receita(s)`}
            icone="file"
          />
          <PassoFluxo
            rotulo="Faturada"
            valor={m.faturada}
            sub={`${percentualDe(m.faturada, m.contratada)} do contratado · ${moeda(m.aFaturar)} a faturar`}
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
            sub="faturado − recebido"
            seta={false}
            icone="clock"
          />
        </div>
      </div>

      <TituloSecao titulo="Custos" nota={`${m.nCustos} lançamento(s)`} />
      <div className="card">
        <div className="flow">
          <PassoFluxo rotulo="Orçado" valor={m.orcado} sub="valor total previsto" icone="doc" />
          <PassoFluxo
            rotulo="Realizado"
            valor={m.realizado}
            sub={`${percentualDe(m.realizado, m.orcado)} do orçado`}
            icone="out"
          />
          <PassoFluxo
            rotulo="Pago"
            valor={m.pago}
            sub={`${percentualDe(m.pago, m.realizado)} do realizado`}
            icone="wallet"
          />
          <PassoFluxo
            rotulo="A pagar"
            valor={m.aPagar}
            sub="realizado − pago"
            seta={false}
            icone="clock"
          />
        </div>
      </div>

      {op.length > 0 && (
        <>
          <TituloSecao titulo="Operação" />
          <div className="card">
            <MiniKpis itens={op} colunas={Math.min(op.length, 5)} />
          </div>
        </>
      )}

      <div
        className="grid g-3"
        style={{
          marginTop: 16,
          gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr) minmax(0,1fr)",
        }}
      >
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Receita × Custo</h3>
              <div className="ch-sub">Competência e caixa lado a lado</div>
            </div>
          </div>
          <div className="card-body">
            <Grafico
              tipo="barras"
              dados={serieReceitaXCusto(m)}
              altura={220}
              rotulo="Receita versus custo do evento"
              cores={[C.azul, C.vermelho2]}
              larguraMaxBarra={26}
            />
            <Legenda
              itens={[
                ["Receita", C.azul],
                ["Custo", C.vermelho2],
              ]}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Custos por fase</h3>
              <div className="ch-sub">Custo realizado</div>
            </div>
          </div>
          <div className="card-body">
            <ComposicaoFases serie={phaseDonut(livro, [ev.id])} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Pendências</h3>
              <div className="ch-sub">{alertas.length} ocorrência(s)</div>
            </div>
          </div>
          <div className="alist">
            {alertas.length ? (
              alertas
                .slice(0, 5)
                .map((a, i) => (
                  <ItemAlerta
                    key={i}
                    alerta={a}
                    mostrarEvento={false}
                    aoAbrir={() => aoTrocarAba(a.aba)}
                  />
                ))
            ) : (
              <div className="empty" style={{ padding: 26 }}>
                <div
                  className="e-icon"
                  style={{ background: "var(--verde-50)", color: "var(--verde)" }}
                >
                  <Icone nome="check" />
                </div>
                <p>Sem pendências para este evento.</p>
              </div>
            )}
            {alertas.length > 5 && (
              <div style={{ padding: "10px 22px", borderTop: "1px solid var(--line-soft)" }}>
                <button type="button" className="linkbtn" onClick={aoVerPendencias}>
                  Ver todas ({alertas.length}) <Icone nome="arrowR" tamanho="xs" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
