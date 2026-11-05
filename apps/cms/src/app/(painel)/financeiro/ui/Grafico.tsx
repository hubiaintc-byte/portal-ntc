"use client";

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
  type TooltipItem,
} from "chart.js";
import { useEffect, useRef } from "react";

import { formatarReais, type SerieGrafico } from "@ntc/lib";

import { compacto, porcentagem, resumoGrafico, valorFinito } from "./formato";

export { resumoGrafico };

/**
 * Gráfico do módulo Financeiro (spec §4.3): um componente fino sobre o
 * Chart.js 4.4.0 que reproduz a camada `Charts` do protótipo FIN-05 —
 * `bars` (vertical e horizontal), `combo` (barras + linha) e `doughnut` —,
 * com as mesmas cores (`C`), fontes, eixos, ticks compactos ("1,2 mi",
 * "350 mil") e tooltip em reais. Trocar a visualização de um bloco é trocar
 * `tipo` aqui; os dados vêm prontos das séries de `@ntc/lib`
 * (`SerieGrafico`, valores em centavos).
 *
 * Acessibilidade (spec §5): o canvas é `role="img"` com `aria-label` =
 * `rotulo` + o resumo textual de todos os números.
 */

Chart.register(
  BarController,
  LineController,
  DoughnutController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

/** Paleta `C` do protótipo (camada de visualização). */
export const CORES_GRAFICO = {
  azul: "#1A4372",
  azul2: "#6F8DB3",
  azul3: "#B7C7DC",
  azul4: "#DCE4EE",
  verde: "#37661C",
  verde2: "#8FAE7B",
  vermelho: "#8E2A1C",
  vermelho2: "#C98A80",
  grafite: "#3A4050",
  prata: "#A8ACB6",
  dourado: "#B8952E",
  tinta: "#14202E",
} as const;

const C = CORES_GRAFICO;

/** `PHASE_COLORS` do protótipo: cor de cada fase na rosca de custos. */
export const CORES_FASE: Record<string, string> = {
  "Pré-evento": C.azul3,
  Execução: C.azul,
  "Pós-evento": C.azul2,
  "Estrutura compartilhada": C.prata,
};

/** Cores na falta de `cores`: a sequência mais usada no protótipo (receita, custo, resultado). */
const PADRAO_BARRAS = [C.azul, C.vermelho2, C.verde, C.dourado, C.azul2];
const PADRAO_COMBO_BARRAS = [C.azul3, C.azul];
const PADRAO_COMBO_LINHAS = [C.vermelho, C.dourado];

export type TipoGrafico = "barras" | "barrasHorizontais" | "combo" | "rosca";

interface GraficoProps {
  tipo: TipoGrafico;
  dados: SerieGrafico;
  /** Altura em px; sem ela, a do `.chart-box` (260). */
  altura?: number;
  /** Nome do gráfico para leitor de tela (o resumo dos números é acrescentado). */
  rotulo: string;
  /**
   * Cores, como em cada chamada `Charts.*` do protótipo: uma por série
   * (barras, combo — na ordem de `dados.series`) ou uma por rótulo (rosca).
   * Sem elas: a sequência padrão; na rosca, `CORES_FASE` pelo rótulo.
   */
  cores?: readonly string[];
  /** `money` do protótipo: `false` para contagens (eixo e tooltip sem R$). Padrão `true`. */
  dinheiro?: boolean;
  /** `stacked` do protótipo (barras). */
  empilhado?: boolean;
  /** `maxBar` do protótipo (espessura máxima da barra). Padrão 34. */
  larguraMaxBarra?: number;
}

interface Entrada {
  tipo: TipoGrafico;
  dados: SerieGrafico;
  cores?: readonly string[];
  dinheiro: boolean;
  empilhado: boolean;
  larguraMaxBarra: number;
}

type Config = ChartConfiguration<"bar" | "line" | "doughnut", number[], string>;

function montarConfig(e: Entrada): Config {
  const { tipo, dados, cores, dinheiro } = e;
  const dica = (v: number) => formatarReais(valorFinito(v));

  if (tipo === "rosca") {
    const valores = (dados.series[0]?.valores ?? []).map(valorFinito);
    const total = valores.reduce((a, b) => a + b, 0);
    const corDe = (rot: string, i: number) =>
      cores?.[i] ?? CORES_FASE[rot] ?? PADRAO_BARRAS[i % PADRAO_BARRAS.length]!;
    return {
      type: "doughnut",
      data: {
        labels: dados.labels,
        datasets: [
          {
            data: valores,
            backgroundColor: dados.labels.map(corDe),
            borderColor: "#FFFFFF",
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          tooltip: {
            callbacks: {
              label: (c: TooltipItem<"doughnut">) =>
                ` ${c.label}: ${dica(c.parsed)} · ${porcentagem(total ? c.parsed / total : 0)}`,
            },
          },
        },
      },
    } as Config;
  }

  if (tipo === "combo") {
    const barras = dados.series.filter((s) => s.tipo !== "linha");
    const linhas = dados.series.filter((s) => s.tipo === "linha");
    const corSerie = (nome: string, padrao: string) => {
      const i = dados.series.findIndex((s) => s.nome === nome);
      return cores?.[i] ?? padrao;
    };
    return {
      type: "bar",
      data: {
        labels: dados.labels,
        datasets: [
          ...barras.map((s, i) => {
            const cor = corSerie(s.nome, PADRAO_COMBO_BARRAS[i % PADRAO_COMBO_BARRAS.length]!);
            return {
              type: "bar" as const,
              label: s.nome,
              data: s.valores.map(valorFinito),
              borderRadius: 2,
              maxBarThickness: 22,
              categoryPercentage: 0.7,
              barPercentage: 0.9,
              backgroundColor: cor,
              order: 2,
            };
          }),
          ...linhas.map((s, i) => {
            const cor = corSerie(s.nome, PADRAO_COMBO_LINHAS[i % PADRAO_COMBO_LINHAS.length]!);
            return {
              type: "line" as const,
              label: s.nome,
              data: s.valores.map(valorFinito),
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
              borderColor: cor,
              backgroundColor: cor,
              order: 1,
              borderDash: [],
            };
          }),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            callbacks: { label: (c: TooltipItem<"bar">) => ` ${c.dataset.label}: ${dica(c.parsed.y)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { color: "rgba(168,172,182,.5)" } },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(168,172,182,.2)" },
            border: { display: false },
            ticks: { callback: (v: string | number) => compacto(Number(v)), maxTicksLimit: 6 },
          },
        },
      },
    } as Config;
  }

  const horizontal = tipo === "barrasHorizontais";
  const { empilhado, larguraMaxBarra } = e;
  const eixoCategoria = horizontal ? "y" : "x";
  const eixoValor = horizontal ? "x" : "y";
  return {
    type: "bar",
    data: {
      labels: dados.labels,
      datasets: dados.series.map((s, i) => {
        const cor = cores?.[i] ?? PADRAO_BARRAS[i % PADRAO_BARRAS.length]!;
        return {
          label: s.nome,
          data: s.valores.map(valorFinito),
          borderRadius: 2,
          maxBarThickness: larguraMaxBarra,
          categoryPercentage: 0.72,
          barPercentage: 0.86,
          backgroundColor: cor,
          borderColor: cor,
        };
      }),
    },
    options: {
      indexAxis: eixoCategoria,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        tooltip: dinheiro
          ? {
              callbacks: {
                label: (c: TooltipItem<"bar">) =>
                  ` ${c.dataset.label}: ${dica(horizontal ? c.parsed.x : c.parsed.y)}`,
              },
            }
          : {},
      },
      scales: {
        [eixoCategoria]: {
          stacked: empilhado,
          grid: { display: false },
          border: { color: "rgba(168,172,182,.5)" },
          ticks: { autoSkip: false, maxRotation: 0, font: { size: 11.5 } },
        },
        [eixoValor]: {
          stacked: empilhado,
          beginAtZero: true,
          grid: { color: "rgba(168,172,182,.2)" },
          border: { display: false },
          ticks: {
            callback: (v: string | number) => (dinheiro ? compacto(Number(v)) : v),
            maxTicksLimit: 6,
          },
        },
      },
    },
  } as Config;
}

/** `Chart.defaults` do protótipo; a família vem da fonte já resolvida do `.fin05`. */
function aplicarPadroes(familia: string) {
  Chart.defaults.font.family = familia || "'Barlow', 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#3A4050";
  Chart.defaults.borderColor = "rgba(168,172,182,.28)";
  if (Chart.defaults.animation) Chart.defaults.animation.duration = 500;
  Chart.defaults.plugins.legend.display = false;
  Object.assign(Chart.defaults.plugins.tooltip, {
    backgroundColor: "#0B1726",
    titleColor: "#F2F0EA",
    bodyColor: "#F2F0EA",
    padding: 10,
    cornerRadius: 3,
    titleFont: { weight: "600" },
    boxPadding: 4,
    usePointStyle: true,
  });
}

export function Grafico({
  tipo,
  dados,
  altura,
  rotulo,
  cores,
  dinheiro = true,
  empilhado = false,
  larguraMaxBarra = 34,
}: GraficoProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  // O gráfico só é refeito quando o conteúdo muda, não a cada render do pai
  // (que costuma recriar `dados` e `cores` com a mesma informação).
  const assinatura = JSON.stringify({ tipo, dados, cores, dinheiro, empilhado, larguraMaxBarra });

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    aplicarPadroes(getComputedStyle(el).fontFamily);
    const grafico = new Chart(el, montarConfig(JSON.parse(assinatura) as Entrada));
    return () => grafico.destroy();
  }, [assinatura]);

  const descricao = `${rotulo}. ${resumoGrafico(dados, dinheiro)}`;
  return (
    <div className="chart-box" style={altura ? { height: altura } : undefined}>
      <canvas ref={canvas} role="img" aria-label={descricao}>
        {descricao}
      </canvas>
    </div>
  );
}
