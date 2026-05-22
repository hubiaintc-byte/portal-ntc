/**
 * Ícones SVG dos 6 eixos técnicos da NTC Saúde, extraídos literal
 * de 07_Pagina_Vertical_NTC_Saude_v1.html (linhas 2598–2698).
 *
 * Mapeados por id no conteudoFallback.ts da Saúde (campo
 * `autoridade.cards[].iconId`). A página seleciona o ícone pelo id.
 *
 * Server Component sem hooks. Cada SVG segue o mesmo padrão visual:
 * viewBox 64x64, fill none, stroke currentColor, stroke-width 2.
 */

const ICONES: Record<string, React.ReactElement> = {
  doc: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="10" y="14" width="44" height="36" rx="2" />
      <path d="M10 22h44" />
      <path d="M22 32h8M22 38h20M22 44h14" />
      <circle cx="46" cy="34" r="3" />
    </svg>
  ),
  saude: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 56s-18-10-18-26a18 18 0 1 1 36 0c0 16-18 26-18 26z" />
      <path d="M32 16v18M23 25h18" />
    </svg>
  ),
  rede: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="16" cy="16" r="6" />
      <circle cx="48" cy="16" r="6" />
      <circle cx="32" cy="48" r="6" />
      <path d="M22 16h20M19 22l11 22M45 22L34 44" />
    </svg>
  ),
  graf: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 50h44" />
      <rect x="14" y="34" width="8" height="16" />
      <rect x="28" y="24" width="8" height="26" />
      <rect x="42" y="14" width="8" height="36" />
      <path d="M10 16l8-4 6 4 8-2 6 4 8-4 6 2" />
    </svg>
  ),
  pessoa: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="22" r="8" />
      <path d="M16 52v-4a10 10 0 0 1 10-10h12a10 10 0 0 1 10 10v4" />
      <path d="M12 28l6 4M52 28l-6 4" />
    </svg>
  ),
  escudo: (
    <svg
      className="eac-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 8l20 8v14c0 14-10 22-20 26-10-4-20-12-20-26V16l20-8z" />
      <path d="M24 32l6 6 12-12" />
    </svg>
  ),
};

export function IconeEixo({ id }: { id: string }) {
  return ICONES[id] ?? null;
}
