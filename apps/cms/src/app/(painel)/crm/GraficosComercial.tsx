import type { FaixaEstagioOportunidade } from "@/lib/cms/kpisComercial";

/**
 * Gráficos SVG do Painel Comercial (sem biblioteca — decisão do spec de
 * 17/07). A legenda com contagens é o equivalente textual obrigatório.
 *
 * O funil P0 tem 10 faixas até Ganha, e a paleta da marca tem 4 acentos: dar
 * uma cor categórica a cada estágio exigiria inventar tokens (CLAUDE.md §5.2).
 * Como o funil é ordinal, e não categórico, a codificação correta é uma rampa
 * de um só matiz — Oxford, do mais claro (início do funil) ao cheio (fim) —,
 * aplicada por opacidade sobre o próprio token, sem cor nova.
 */

const COR_FUNIL = "#11365E";

/** Opacidade da faixa pela posição na sequência recebida (início claro → fim cheio). */
const opacidadeDe = (indice: number, total: number): number =>
  total <= 1 ? 1 : 0.35 + (0.65 * indice) / (total - 1);

/** Donut de oportunidades abertas por estágio, com legenda de contagens. */
export function DonutEstagios({ faixas }: { faixas: FaixaEstagioOportunidade[] }) {
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
        aria-label={`Oportunidades abertas por estágio: ${faixas
          .map((f) => `${f.rotulo} ${f.quantidade}`)
          .join(", ")}`}
      >
        {faixas.map((f, i) => {
          const fracao = f.quantidade / total;
          const arco = fracao * CIRCUNF;
          const offset = -acumulado * CIRCUNF;
          acumulado += fracao;
          return (
            <circle
              key={f.estagio}
              cx="60"
              cy="60"
              r={RAIO}
              fill="none"
              stroke={COR_FUNIL}
              strokeOpacity={opacidadeDe(i, faixas.length)}
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
        {faixas.map((f, i) => (
          <li key={f.estagio}>
            <span
              className="pcms-grafico__cor"
              style={{ background: COR_FUNIL, opacity: opacidadeDe(i, faixas.length) }}
              aria-hidden
            />
            {f.rotulo}
            <b>{f.quantidade}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontais do funil (todos os estágios até Ganha, na ordem do funil). */
export function FunilBarras({ faixas }: { faixas: FaixaEstagioOportunidade[] }) {
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
          <g key={f.estagio}>
            <text x={LARGURA_ROTULO - 8} y={y + 19} textAnchor="end" className="pcms-grafico__eixo">
              {f.rotulo}
            </text>
            <rect
              x={LARGURA_ROTULO}
              y={y + 7}
              width={Math.max(largura, f.quantidade > 0 ? 4 : 0)}
              height={16}
              rx="3"
              fill={COR_FUNIL}
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
