/**
 * Formatação compartilhada do documento da proposta. Puro, sem server-only.
 * Fonte única: capa, resumo executivo, seções e o cabeçalho/rodapé do PDF
 * importam daqui — `html.ts` não guarda mais cópia de `esc`/moeda/data.
 */

export function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Moeda com 2 casas sempre: documento contratual não arredonda para reais. */
export function formatarMoedaDocumento(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(valor) ? valor : 0);
}

export function formatarInteiroDocumento(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Number.isFinite(n) ? n : 0);
}

/** "35,4%" — uma casa decimal só quando há fração; "10%" para inteiros. */
export function formatarPercentualDocumento(p: number): string {
  const v = Number.isFinite(p) ? p : 0;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)}%`;
}

/**
 * Horas do total dos módulos, lidas de `cargaHorariaTotalModulos`
 * ("24h · 3 módulos · 8h por módulo" → 24). Devolve null quando o campo NÃO
 * começa por um número de horas — é o caso de "3 módulos", que `dados.ts`
 * produz quando as cargas dos módulos são heterogêneas ("8h" e "16h") ou
 * compostas ("16h · 2 dias"): aí não existe total a afirmar.
 *
 * Fonte única das três leituras do campo (Arquitetura da Solução, capa e
 * Resumo Executivo, Objeto da Proposta). Quem chama **omite** o rótulo quando
 * vem null, em vez de cair para o texto inteiro: imprimir "Carga Horária
 * Total: 3 módulos" num documento contratual afirma o que o dado não diz.
 */
export function horasDoTotalDosModulos(carga: string): number | null {
  const bruto = /^(\d+)\s*h\b/.exec(carga.trim())?.[1];
  if (!bruto) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** "24h" — a forma curta que o `.box` do modelo imprime; "" sem total legível. */
export function cargaHorariaTotalCurta(carga: string): string {
  const horas = horasDoTotalDosModulos(carga);
  return horas === null ? "" : `${horas}h`;
}

/** O texto completo do campo ("24h · 3 módulos · 8h por módulo") quando ele
 * realmente começa por horas; "" quando é só contagem de módulos. */
export function cargaHorariaTotalLegivel(carga: string): string {
  return horasDoTotalDosModulos(carga) === null ? "" : carga.trim();
}

/** Data ISO em dd/mm/aaaa (UTC); null/inválida devolve string vazia. */
export function formatarDataDocumentoOpcional(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
