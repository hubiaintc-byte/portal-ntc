/**
 * Formatação compartilhada do documento da proposta. Puro, sem server-only.
 * `html.ts` ainda guarda cópias de `esc`/moeda/data até a Task 10 compor o
 * documento final e passar a importar daqui.
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

/** Data ISO em dd/mm/aaaa (UTC); null/inválida devolve string vazia. */
export function formatarDataDocumentoOpcional(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
