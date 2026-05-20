export type Area = "educacao" | "gestao-publica" | "saude";

export type Modalidade = "online" | "presencial" | "hibrido";

export interface ImagemRef {
  src: string;
  alt: string;
}

export interface CtaHero {
  rotulo: string;
  href: string;
  variante: "primario" | "secundario";
}

export interface AcentoArea {
  texto: string;
  fundo: string;
  borda: string;
  bg10: string;
}

const ACENTO: Record<Area, AcentoArea> = {
  educacao: {
    texto: "text-oxford",
    fundo: "bg-oxford",
    borda: "border-oxford",
    bg10: "bg-oxford/10",
  },
  "gestao-publica": {
    texto: "text-cardeal",
    fundo: "bg-cardeal",
    borda: "border-cardeal",
    bg10: "bg-cardeal/10",
  },
  saude: {
    texto: "text-oliva",
    fundo: "bg-oliva",
    borda: "border-oliva",
    bg10: "bg-oliva/10",
  },
};

const ROTULO: Record<Area, string> = {
  educacao: "NTC Educação",
  "gestao-publica": "NTC Gestão Pública",
  saude: "NTC Saúde",
};

const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrido: "Híbrido",
};

export function acentoPorArea(area: Area): AcentoArea {
  return ACENTO[area];
}

export function rotuloArea(area: Area): string {
  return ROTULO[area];
}

export function rotuloModalidade(modalidade: Modalidade): string {
  return ROTULO_MODALIDADE[modalidade];
}

function paraDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

export function formatarData(d: Date | string, formato: "curto" | "longo" = "longo"): string {
  const data = paraDate(d);
  const opts: Intl.DateTimeFormatOptions =
    formato === "curto"
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { day: "2-digit", month: "long", year: "numeric" };
  return new Intl.DateTimeFormat("pt-BR", opts).format(data);
}

export function formatarPeriodo(
  inicio: Date | string,
  fim?: Date | string,
  formato: "curto" | "longo" = "longo",
): string {
  if (!fim) return formatarData(inicio, formato);
  const i = paraDate(inicio);
  const f = paraDate(fim);
  if (
    i.getFullYear() === f.getFullYear() &&
    i.getMonth() === f.getMonth() &&
    i.getDate() === f.getDate()
  ) {
    return formatarData(i, formato);
  }
  if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
    const dias = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
    const restante = new Intl.DateTimeFormat("pt-BR", {
      month: formato === "curto" ? "short" : "long",
      year: "numeric",
    });
    return `${dias.format(i)}–${dias.format(f)} de ${restante.format(i)}`;
  }
  return `${formatarData(i, formato)} – ${formatarData(f, formato)}`;
}
