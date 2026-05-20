import { acentoPorArea, type Area } from "../heroes/tipos";

export interface TituloSecaoProps {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  alinhamento?: "esquerda" | "centro";
  vert?: Area;
}

export function TituloSecao({
  eyebrow,
  titulo,
  subtitulo,
  alinhamento = "esquerda",
  vert,
}: TituloSecaoProps) {
  const cor = vert ? acentoPorArea(vert).texto : "text-cardeal";
  const align = alinhamento === "centro" ? "text-center mx-auto" : "text-left";
  return (
    <header className={`max-w-[60ch] ${align}`}>
      {eyebrow && (
        <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${cor}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-titulo text-h2 text-balance text-oxford ${eyebrow ? "mt-3" : ""}`}>
        {titulo}
      </h2>
      {subtitulo && (
        <p className="mt-4 font-corpo text-corpo text-grafite-suave text-pretty">{subtitulo}</p>
      )}
    </header>
  );
}
