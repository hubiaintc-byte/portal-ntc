import type { FaixaStatusOportunidade } from "@/lib/cms/kpisComercial";

/**
 * Gráficos SVG do Painel Comercial (sem biblioteca — decisão do spec de
 * 17/07). Cores por status em ordem fixa, validadas para CVD; a legenda com
 * contagens é o equivalente textual obrigatório (contraste do dourado/areia
 * sobre branco fica abaixo de 3:1).
 */

const COR_POR_STATUS: Record<string, string> = {
  "em-qualificacao": "#11365E",
  "apresentacao-institucional": "#B5995A",
  "proposta-enviada": "#5C6B3B",
  "em-negociacao": "#8E2B27",
  aprovada: "#D9D2C4",
};

const COR_FALLBACK = "#5a5a5a";

const corDe = (status: string): string => COR_POR_STATUS[status] ?? COR_FALLBACK;

/** Donut de oportunidades abertas por status, com legenda de contagens. */
export function DonutStatus({ faixas }: { faixas: FaixaStatusOportunidade[] }) {
  const total = faixas.reduce((soma, f) => soma + f.quantidade, 0);
  if (total === 0) {
    return <p className="pcms-grafico__vazio">Nenhuma oportunidade aberta registrada.</p>;
  }

  const RAIO = 42;
  const CIRCUNF = 2 * Math.PI * RAIO;
  let acumulado = 0;

  return (
    <div className="pcms-grafico pcms-grafico--donut">
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Oportunidades abertas por status: ${faixas
          .map((f) => `${f.rotulo} ${f.quantidade}`)
          .join(", ")}`}
      >
        {faixas.map((f) => {
          const fracao = f.quantidade / total;
          const arco = fracao * CIRCUNF;
          const offset = -acumulado * CIRCUNF;
          acumulado += fracao;
          return (
            <circle
              key={f.status}
              cx="60"
              cy="60"
              r={RAIO}
              fill="none"
              stroke={corDe(f.status)}
              strokeWidth="16"
              strokeDasharray={`${Math.max(arco - 2, 0.5)} ${CIRCUNF - Math.max(arco - 2, 0.5)}`}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            >
              <title>{`${f.rotulo}: ${f.quantidade}`}</title>
            </circle>
          );
        })}
        <text x="60" y="57" textAnchor="middle" className="pcms-grafico__total">
          {total}
        </text>
        <text x="60" y="72" textAnchor="middle" className="pcms-grafico__total-rotulo">
          abertas
        </text>
      </svg>
      <ul className="pcms-grafico__legenda">
        {faixas.map((f) => (
          <li key={f.status}>
            <span className="pcms-grafico__cor" style={{ background: corDe(f.status) }} aria-hidden />
            {f.rotulo}
            <b>{f.quantidade}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontais do funil (todos os status abertos, ordem fixa). */
export function FunilBarras({ faixas }: { faixas: FaixaStatusOportunidade[] }) {
  const maximo = Math.max(...faixas.map((f) => f.quantidade), 1);
  const ALTURA_LINHA = 30;
  const LARGURA = 320;
  const LARGURA_ROTULO = 150;

  return (
    <svg
      className="pcms-grafico pcms-grafico--funil"
      viewBox={`0 0 ${LARGURA} ${faixas.length * ALTURA_LINHA}`}
      role="img"
      aria-label={`Funil de oportunidades: ${faixas
        .map((f) => `${f.rotulo} ${f.quantidade}`)
        .join(", ")}`}
    >
      {faixas.map((f, i) => {
        const largura = ((LARGURA - LARGURA_ROTULO - 30) * f.quantidade) / maximo;
        const y = i * ALTURA_LINHA;
        return (
          <g key={f.status}>
            <text x={LARGURA_ROTULO - 8} y={y + 19} textAnchor="end" className="pcms-grafico__eixo">
              {f.rotulo}
            </text>
            <rect
              x={LARGURA_ROTULO}
              y={y + 7}
              width={Math.max(largura, f.quantidade > 0 ? 4 : 0)}
              height={16}
              rx="3"
              fill="#11365E"
            >
              <title>{`${f.rotulo}: ${f.quantidade}`}</title>
            </rect>
            <text
              x={LARGURA_ROTULO + Math.max(largura, f.quantidade > 0 ? 4 : 0) + 6}
              y={y + 19}
              className="pcms-grafico__valor"
            >
              {f.quantidade}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
