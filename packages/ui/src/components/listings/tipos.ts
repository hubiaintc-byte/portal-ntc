import type { Area, Modalidade } from "../heroes/tipos";
import type { RichTextContent } from "../helpers/richtext/tipos";

export interface ProgramaItem {
  sigla: string;
  nomeCompleto: string;
  area: Area;
  resumoVisaoGeral?: string;
  imagem?: { src: string; alt: string };
  href: string;
  eyebrow?: string;
}

export interface EventoItem {
  nome: string;
  imagem: { src: string; alt: string };
  dataInicio: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string };
  programa?: { sigla: string };
  area: Area;
  inscricaoAberta: boolean;
  href: string;
  eyebrow?: string;
}

export interface EspecialistaItem {
  nome: string;
  titulacao: string;
  instituicao: string;
  cargoAtual?: string;
  foto: { src: string; alt: string };
  href?: string;
}

export interface ModuloItem {
  numero: number;
  titulo: string;
  ementa: RichTextContent;
  cargaHoraria?: string;
  eventosVinculados?: { nome: string; href: string }[];
}

export interface FiltroEstado {
  modalidade: "todos" | Modalidade;
  area: "todos" | Area;
  programa?: string;
  mes?: string;
}

export const FILTRO_INICIAL: FiltroEstado = {
  modalidade: "todos",
  area: "todos",
};
