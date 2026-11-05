import type { LivroFinanceiro } from "./tipos";

export type Periodo = "all" | `${number}` | `${number}-Q${1 | 2 | 3 | 4}`;

const ISO = /^(\d{4})-\d{2}-\d{2}/;

function anosDoLivro(valor: unknown, anos: Set<number>): void {
  if (typeof valor === "string") {
    const m = ISO.exec(valor);
    if (m) anos.add(Number(m[1]));
  } else if (Array.isArray(valor)) {
    for (const v of valor) anosDoLivro(v, anos);
  } else if (valor && typeof valor === "object") {
    for (const v of Object.values(valor)) anosDoLivro(v, anos);
  }
}

/**
 * Períodos para o seletor: "Todo o período" e, para o ano de `hoje` ±1 e para
 * todo ano que aparece em alguma data do livro, o ano e seus 4 trimestres.
 */
export function periodosDisponiveis(
  livro: LivroFinanceiro,
  hoje: string,
): { valor: Periodo; rotulo: string }[] {
  const anos = new Set<number>();
  const anoHoje = Number(hoje.slice(0, 4));
  anos.add(anoHoje - 1);
  anos.add(anoHoje);
  anos.add(anoHoje + 1);
  anosDoLivro(livro, anos);
  const out: { valor: Periodo; rotulo: string }[] = [{ valor: "all", rotulo: "Todo o período" }];
  for (const ano of [...anos].sort((a, b) => a - b)) {
    out.push({ valor: `${ano}`, rotulo: `Ano ${ano}` });
    for (const q of [1, 2, 3, 4] as const) {
      out.push({ valor: `${ano}-Q${q}`, rotulo: `${q}º trimestre ${ano}` });
    }
  }
  return out;
}

/** Mesma regra do protótipo: "all" aceita tudo; sem data, fora; ano e trimestre por prefixo. */
export function inPeriod(dataISO: string | undefined, periodo: Periodo): boolean {
  if (!periodo || periodo === "all") return true;
  if (!dataISO) return false;
  const ano = dataISO.slice(0, 4);
  const mes = Number(dataISO.slice(5, 7));
  const [anoPeriodo, q] = periodo.split("-");
  if (ano !== anoPeriodo) return false;
  if (!q) return true;
  return Math.ceil(mes / 3) === Number(q.slice(1));
}
