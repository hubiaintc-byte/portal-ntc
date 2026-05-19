/**
 * Tokens visuais do Design System Soberana 2026 — Grupo NTC.
 *
 * Fonte única de verdade do sistema visual (CLAUDE.md §3, §5.2).
 * Valores literais da Seção 2 do Inventário de Componentes Editoriais
 * (docs/12_Inventario_Componentes_Editoriais_v1.md).
 *
 * Regra absoluta: estruturas (cards, blocos, containers) usam border-radius 0.
 * Apenas selos/pílulas em pílula. Imagens com raio 2px no máximo.
 */
export const tokens = {
  cores: {
    oxford: "#11365E", // dominante institucional 60
    oxfordEscuro: "#0B2545",
    oxfordClaro: "#1E4E8C",
    cardeal: "#8E2B27", // acento Gestão Pública
    oliva: "#5C6B3B", // acento Saúde
    dourado: "#B5995A", // selo, eventON, refinamento
    pergaminho: "#F4EFE6", // fundo editorial claro
    osso: "#FBF8F2", // base de página
    grafite: "#2B2B2B", // texto principal
    grafiteSuave: "#5A5A5A", // texto secundário
    linhaSutil: "#D9D2C4", // divisores
    vermelhoErro: "#9A1B1B", // estados de erro em formulário
    verdeSucesso: "#3F6B3F", // confirmação editorial
  },
  fontes: {
    titulo: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    corpo: '"Barlow", system-ui, -apple-system, sans-serif',
  },
  escala: {
    h1: "clamp(2.75rem, 5vw, 4.5rem)",
    h2: "clamp(2rem, 3.5vw, 3rem)",
    h3: "clamp(1.5rem, 2.5vw, 2rem)",
    h4: "1.25rem",
    corpo: "1.0625rem",
    pequeno: "0.875rem",
    eyebrow: "0.75rem",
  },
  espacamento: {
    secaoVertical: "clamp(4rem, 8vw, 7rem)",
    blocoVertical: "clamp(2rem, 4vw, 3.5rem)",
    container: "min(92ch, 92vw)",
    margemEditorial: "clamp(1.25rem, 4vw, 3rem)",
  },
  raios: {
    nenhum: "0", // estrutural — nunca arredonda
    foto: "2px", // imagens institucionais (sutil)
    selo: "999px", // pílulas pequenas
  },
  transicoes: {
    discreta: "250ms ease-out",
    institucional: "400ms ease-out",
  },
} as const;

export type Tokens = typeof tokens;
export type CorSoberana = keyof typeof tokens.cores;
export type EscalaTipografica = keyof typeof tokens.escala;
