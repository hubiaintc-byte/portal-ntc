import { Grade } from "../layout/Grade";
import { CardPrograma } from "../cards/CardPrograma";
import { rotuloArea, type Area } from "../heroes/tipos";
import type { ProgramaItem } from "./tipos";

export interface GradeProgramasProps {
  programas: ProgramaItem[];
  agruparPorArea?: boolean;
  variante?: "editorial" | "compacto";
  filtroAtivo?: "todos" | Area;
}

const ORDEM_AREAS: Area[] = ["educacao", "gestao-publica", "saude"];

export function GradeProgramas({
  programas,
  agruparPorArea = true,
  variante = "editorial",
  filtroAtivo = "todos",
}: GradeProgramasProps) {
  const filtrados =
    filtroAtivo === "todos" ? programas : programas.filter((p) => p.area === filtroAtivo);

  if (!agruparPorArea) {
    return (
      <Grade colunas={3} gap="medio">
        {filtrados.map((p) => (
          <CardPrograma
            key={p.sigla}
            sigla={p.sigla}
            nomeCompleto={p.nomeCompleto}
            eyebrow={p.eyebrow}
            imagem={p.imagem}
            area={p.area}
            resumoVisaoGeral={p.resumoVisaoGeral}
            href={p.href}
            variante={variante}
          />
        ))}
      </Grade>
    );
  }

  const grupos = ORDEM_AREAS.map((area) => ({
    area,
    itens: filtrados.filter((p) => p.area === area),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="flex flex-col gap-16">
      {grupos.map((g) => (
        <section key={g.area}>
          <h3 className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
            {rotuloArea(g.area)}
          </h3>
          <Grade colunas={3} gap="medio" className="mt-6">
            {g.itens.map((p) => (
              <CardPrograma
                key={p.sigla}
                sigla={p.sigla}
                nomeCompleto={p.nomeCompleto}
                eyebrow={p.eyebrow}
                imagem={p.imagem}
                area={p.area}
                resumoVisaoGeral={p.resumoVisaoGeral}
                href={p.href}
                variante={variante}
              />
            ))}
          </Grade>
        </section>
      ))}
    </div>
  );
}
