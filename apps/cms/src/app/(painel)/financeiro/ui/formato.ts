import { formatarReais, paraCentavos, type Centavos, type SerieGrafico } from "@ntc/lib";

/**
 * Formatação pura das primitivas do Financeiro (sem React, testável no
 * Vitest em `node`): ticks e resumo dos gráficos e a exibição do campo de
 * dinheiro, transcritos do protótipo FIN-05.
 */

const NUM_INT = new Intl.NumberFormat("pt-BR");
const NUM = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const valorFinito = (v: number): number => (Number.isFinite(v) ? v : 0);

/** `Charts.compact` do protótipo: centavos → "1,2 mi" / "350 mil" / "800". */
export function compacto(centavos: number): string {
  const v = valorFinito(Number(centavos || 0)) / 100;
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (a >= 1e3) return `${(v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return v.toLocaleString("pt-BR");
}

/** `fmtPct(v, casas)` do protótipo (padrão 1 casa); `null` ou não finito (÷ 0) ⇒ "—". */
export function porcentagem(f: number | null, casas = 1): string {
  if (f === null || !Number.isFinite(f)) return "—";
  return `${(f * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

/**
 * `fmtBRL(v, { dash })` do protótipo: centavos → "R$ 1.234,56", negativo com
 * "−" na frente. Sem valor ⇒ "—"; zero ⇒ "—", a menos que `traco` seja
 * `false` (o `{ dash: false }` do protótipo, que mostra "R$ 0,00").
 */
export function moeda(c: Centavos | null | undefined, traco = true): string {
  if (c === null || c === undefined || !Number.isFinite(c)) return "—";
  if (c === 0 && traco) return "—";
  const s = formatarReais(Math.abs(c));
  return c < 0 ? `−${s}` : s;
}

/** `fmtNum` do protótipo: inteiro com milhar pt-BR; não finito ⇒ "—". */
export function inteiro(v: number): string {
  return Number.isFinite(v) ? NUM_INT.format(v) : "—";
}

/** `fmtDate`: `AAAA-MM-DD` → `DD/MM/AAAA`; vazio ⇒ "—". */
export function dataCurta(iso: string | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** `fmtRange(a, b)` do protótipo: "05–07/08/2026" no mesmo mês, senão "dd/mm/aaaa – dd/mm/aaaa". */
export function intervaloDatas(a: string | undefined, b: string | undefined): string {
  if (!a) return "—";
  if (!b || a === b) return dataCurta(a);
  const [ya, ma, da] = a.split("-");
  const [yb, mb, db] = b.split("-");
  if (ya === yb && ma === mb) return `${da}–${db}/${mb}/${yb}`;
  return `${dataCurta(a)} – ${dataCurta(b)}`;
}

/** `tipoShort` do protótipo: rótulo curto do tipo de operação. */
export function tipoCurto(tipo: string): string {
  return tipo === "In Company / Projeto B2G" ? "In Company / B2G" : tipo;
}

/** Resumo textual dos números de um gráfico, para o `aria-label` (spec §5). */
export function resumoGrafico(dados: SerieGrafico, dinheiro = true): string {
  const fmt = (v: number) =>
    dinheiro ? formatarReais(valorFinito(v)) : NUM_INT.format(valorFinito(v));
  if (dados.labels.length === 0 || dados.series.length === 0) return "sem dados no recorte";
  return dados.labels
    .map((rot, i) => {
      const partes = dados.series.map((s) =>
        dados.series.length === 1 ? fmt(s.valores[i] ?? 0) : `${s.nome} ${fmt(s.valores[i] ?? 0)}`,
      );
      return `${rot}: ${partes.join(", ")}`;
    })
    .join("; ");
}

/** Exibição no campo de dinheiro: centavos → "1.234,56"; zero/vazio → "" (`_num.format` do protótipo). */
export function textoDeCentavos(c: Centavos | null): string {
  return c ? NUM.format(c / 100) : "";
}

/** Leitura do texto do campo de dinheiro: vazio é válido (sem valor); texto que não é real brasileiro é inválido. */
export interface LeituraDinheiro {
  valor: Centavos | null;
  valido: boolean;
}

/**
 * `comSinal`: aceita "-" (ou "−") na frente — só o saldo inicial de conta, que
 * pode nascer negativo (Ruling R9). Sem ele, o sinal é recusado.
 */
export function lerCampoDinheiro(texto: string, comSinal = false): LeituraDinheiro {
  const t = texto.trim();
  if (!t) return { valor: null, valido: true };
  const neg = comSinal && /^[-−]/.test(t);
  const valor = paraCentavos(neg ? t.replace(/^[-−]\s*/, "") : t);
  if (valor === null) return { valor: null, valido: false };
  return { valor: neg && valor ? -valor : valor, valido: true };
}

/** Texto do campo ao sair: válido e preenchido vira "1.234,56"; senão fica como digitado (para corrigir). */
export function textoAoSairDinheiro(texto: string, comSinal = false): string {
  const { valor } = lerCampoDinheiro(texto, comSinal);
  return valor === null ? texto : textoDeCentavos(valor);
}

/** Mensagem do campo de dinheiro com texto que não é valor (Review Focus 2). */
export const ERRO_FORMATO_DINHEIRO = "Valor inválido. Use o formato 1.234,56.";

/**
 * Validade dos campos de dinheiro de um formulário: `campo → inválido`. O
 * `CampoDinheiro` entrega `null` tanto para vazio quanto para inválido; o
 * formulário guarda isto (via `aoMudarValidade`) para recusar o envio em vez
 * de gravar R$ 0,00. Padrão das gavetas do Financeiro:
 *
 *   const [validade, setValidade] = useState<ValidadeDinheiro>({});
 *   <CampoDinheiro … aoMudarValidade={(ok) => setValidade((v) => comValidade(v, "desconto", ok))} />
 *   // no salvar, antes de validar o resto:
 *   const inv = primeiroDinheiroInvalido(validade, ["valorUnit", "desconto"]);
 *   if (inv) return mostrarErro(inv, ERRO_FORMATO_DINHEIRO);
 */
export type ValidadeDinheiro = Readonly<Record<string, boolean>>;

export function comValidade(v: ValidadeDinheiro, campo: string, valido: boolean): ValidadeDinheiro {
  if (valido === !v[campo]) return v;
  return { ...v, [campo]: !valido };
}

/** Primeiro campo inválido na ordem do formulário (os fora da ordem vêm depois); `null` se todos valem. */
export function primeiroDinheiroInvalido(
  v: ValidadeDinheiro,
  ordem: readonly string[],
): string | null {
  const invalidos = Object.keys(v).filter((k) => v[k]);
  return ordem.find((k) => invalidos.includes(k)) ?? invalidos[0] ?? null;
}
