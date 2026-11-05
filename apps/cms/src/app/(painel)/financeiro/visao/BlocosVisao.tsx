"use client";

import type { Centavos, SerieGrafico, TotaisCarteira } from "@ntc/lib";

import { CORES_FASE, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { Barra, ValorGrande } from "../ui/Kpi";
import { Dica } from "../ui/Selo";
import { moeda, porcentagem } from "../ui/formato";
import { larguraFunil } from "./dadosVisao";

/** Blocos de apresentação da Visão Executiva, transcritos do protótipo FIN-05. */

/** `legend(items)`: `[rótulo, cor, linha?]`. */
export function Legenda({ itens }: { itens: readonly (readonly [string, string, boolean?])[] }) {
  return (
    <div className="legend">
      {itens.map(([rotulo, cor, linha]) => (
        <span key={rotulo}>
          <i className={linha ? "line" : undefined} style={{ background: cor }} />
          {rotulo}
        </span>
      ))}
    </div>
  );
}

/** `barFoot(ratio, txt, cls)`: barra ÷, percentual sem casas (ou "—") e o texto. */
export function RodapeBarra({
  razao,
  texto,
  cor,
}: {
  razao: number | null;
  texto: string;
  cor?: "verde" | "grafite";
}) {
  const pct = porcentagem(razao, 0);
  return (
    <>
      <Barra fracao={razao ?? 0} cor={cor} rotulo={`${pct} ${texto}`} />
      <span>{pct}</span>
      <span className="muted">{texto}</span>
    </>
  );
}

interface LinhaFunilProps {
  rotulo: string;
  valor: Centavos;
  max: Centavos;
  cor: string;
  nota?: string;
}

/** `funnelRow(label, v, max, color, note)`. */
export function LinhaFunil({ rotulo, valor, max, cor, nota }: LinhaFunilProps) {
  return (
    <div className="funnel-row">
      <div className="fr-top">
        <span className="frl">{rotulo}</span>
        <span className="frv num">{moeda(valor)}</span>
      </div>
      <div className="fr-bar">
        <i style={{ width: `${larguraFunil(valor, max).toFixed(1)}%`, background: cor }} />
      </div>
      {nota && <div className="fr-note">{nota}</div>}
    </div>
  );
}

/**
 * `resultHero(tot)` da carteira, **sem** a célula "Comissões comerciais"
 * (fora da Fase 1): Resultado previsto, Movimentação financeira e Desvio do
 * orçamento.
 */
export function HeroResultado({ tot }: { tot: TotaisCarteira }) {
  const res = tot.resultadoRealizado;
  return (
    <section className="hero" aria-label="Resultado">
      <div>
        <div className="h-label">
          <Icone nome="scale" tamanho="sm" /> Resultado da carteira
        </div>
        <div className={`h-value${res < 0 ? " neg" : ""}`}>
          <ValorGrande valor={res} />
        </div>
        <div className="h-formula">Receita reconhecida − custos e despesas do período</div>
        <div className="h-filete" />
      </div>
      <div className="hero-cells tres">
        <div>
          <div className="hc-l">
            Resultado previsto{" "}
            <Dica texto="Receitas contratadas menos custos e despesas previstos. É o que foi assumido, não o que foi executado." />
          </div>
          <div className={`hc-v${tot.resultadoPrevisto < 0 ? " neg" : ""}`}>
            {moeda(tot.resultadoPrevisto)}
          </div>
          <div className="hc-s">contratado − previsto</div>
        </div>
        <div>
          <div className="hc-l">
            Movimentação financeira{" "}
            <Dica texto="Recebimentos menos pagamentos do período. Disponibilidade financeira não é resultado." />
          </div>
          <div className={`hc-v${tot.movimentacao < 0 ? " neg" : ""}`}>
            {moeda(tot.movimentacao)}
          </div>
          <div className="hc-s">recebido − pago</div>
        </div>
        <div>
          <div className="hc-l">
            Desvio do orçamento{" "}
            <Dica texto="Valor realizado menos valor previsto, apurado sobre os lançamentos já realizados. Negativo significa abaixo do previsto." />
          </div>
          <div className={`hc-v ${tot.desvio > 0 ? "neg" : "pos"}`}>
            {tot.desvio > 0 ? "+" : ""}
            {moeda(tot.desvio)}
          </div>
          <div className="hc-s">
            {tot.desvio > 0
              ? "acima do previsto"
              : tot.desvio < 0
                ? "abaixo do previsto"
                : "itens realizados"}
          </div>
        </div>
      </div>
    </section>
  );
}

/** `phaseDonut(el, groups)`: rosca + participação de cada fase e o total realizado. */
export function ComposicaoFases({ serie }: { serie: SerieGrafico }) {
  const valores = serie.series[0]?.valores ?? [];
  const total = valores.reduce((a, b) => a + b, 0);
  if (!total) {
    return (
      <div className="empty" style={{ padding: 30 }}>
        <p>Sem custos realizados no recorte.</p>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)",
        gap: 16,
        alignItems: "center",
      }}
    >
      <Grafico
        tipo="rosca"
        dados={serie}
        altura={200}
        rotulo="Composição do custo realizado por fase"
      />
      <div>
        {serie.labels.map((fase, i) => (
          <div className="cline" key={fase}>
            <span className="cl">
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: CORES_FASE[fase],
                  display: "inline-block",
                }}
              />
              {fase}
            </span>
            <span className="cv num">{porcentagem((valores[i] ?? 0) / total, 0)}</span>
          </div>
        ))}
        <div className="cline total">
          <span className="cl">Total realizado</span>
          <span className="cv num">{moeda(total)}</span>
        </div>
      </div>
    </div>
  );
}
