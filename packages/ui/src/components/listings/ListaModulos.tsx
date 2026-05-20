import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { ModuloItem } from "./tipos";

export interface ListaModulosProps {
  modulos: ModuloItem[];
  variante?: "completa" | "sumario";
}

export function ListaModulos({ modulos, variante = "completa" }: ListaModulosProps) {
  if (variante === "sumario") {
    return (
      <Container variante="editorial">
        <ol className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
          {modulos.map((m) => (
            <li key={m.numero} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <span className="font-titulo text-h3 tabular-nums text-dourado">
                M{String(m.numero).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-titulo text-h4 text-oxford">{m.titulo}</h3>
                {m.cargaHoraria && (
                  <p className="mt-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                    {m.cargaHoraria}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    );
  }

  return (
    <Container variante="editorial">
      <ol className="flex flex-col gap-12">
        {modulos.map((m) => (
          <li key={m.numero} className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
            <div className="sm:sticky sm:top-24 sm:self-start">
              <span className="font-titulo text-h2 tabular-nums text-dourado">
                M{String(m.numero).padStart(2, "0")}
              </span>
              {m.cargaHoraria && (
                <p className="mt-2 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {m.cargaHoraria}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-titulo text-h3 text-oxford">{m.titulo}</h3>
              <div className="mt-4">
                <RenderizadorLexical content={m.ementa} />
              </div>
              {m.eventosVinculados && m.eventosVinculados.length > 0 && (
                <div className="mt-6 border-l-2 border-linha-sutil pl-4">
                  <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                    Eventos vinculados
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 font-corpo text-corpo">
                    {m.eventosVinculados.map((ev) => (
                      <li key={ev.href}>
                        <Link
                          href={ev.href as Route}
                          className="text-oxford underline-offset-4 hover:underline"
                        >
                          {ev.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Container>
  );
}
