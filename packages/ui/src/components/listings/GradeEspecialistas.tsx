import { Grade } from "../layout/Grade";
import { CardEspecialista } from "../cards/CardEspecialista";
import { type Area } from "../heroes/tipos";
import type { EspecialistaItem } from "./tipos";

export interface GradeEspecialistasProps {
  especialistas: EspecialistaItem[];
  modo?: "regular" | "expandido" | "cerimonial";
  vert?: Area;
}

export function GradeEspecialistas({
  especialistas,
  modo = "regular",
}: GradeEspecialistasProps) {
  return (
    <Grade colunas={4} gap="medio">
      {especialistas.map((e) => (
        <CardEspecialista
          key={e.nome}
          nome={e.nome}
          titulacao={e.titulacao}
          instituicao={e.instituicao}
          cargoAtual={e.cargoAtual}
          foto={e.foto}
          href={e.href}
          variante={modo}
        />
      ))}
    </Grade>
  );
}
