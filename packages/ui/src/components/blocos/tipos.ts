export type FundoBloco = "osso" | "pergaminho" | "oxford";

export interface ClassesFundo {
  fundo: string;
  texto: string;
  textoSuave: string;
  borda: string;
}

const FUNDO: Record<FundoBloco, ClassesFundo> = {
  osso: {
    fundo: "bg-osso",
    texto: "text-grafite",
    textoSuave: "text-grafite-suave",
    borda: "border-linha-sutil",
  },
  pergaminho: {
    fundo: "bg-pergaminho",
    texto: "text-grafite",
    textoSuave: "text-grafite-suave",
    borda: "border-linha-sutil",
  },
  oxford: {
    fundo: "bg-oxford",
    texto: "text-osso",
    textoSuave: "text-osso/80",
    borda: "border-osso/20",
  },
};

export function fundoPorTipo(fundo: FundoBloco): ClassesFundo {
  return FUNDO[fundo];
}

export type { Area, Modalidade } from "../heroes/tipos";
export { acentoPorArea, rotuloArea, rotuloModalidade, formatarData, formatarPeriodo } from "../heroes/tipos";
