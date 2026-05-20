import { Container } from "../layout/Container";
import type { Area, FundoBloco } from "./tipos";
import { acentoPorArea, fundoPorTipo } from "./tipos";

export interface BlocoNumerosProps {
  titulo?: string;
  numeros: { valor: string; rotulo: string }[];
  fundo?: FundoBloco;
  vert?: Area;
}

export function BlocoNumeros({
  titulo,
  numeros,
  fundo = "osso",
  vert,
}: BlocoNumerosProps) {
  const classesFundo = fundoPorTipo(fundo);
  const acento = vert ? acentoPorArea(vert) : null;
  const numerosLimitados = numeros.slice(0, 4);
  const colunas =
    numerosLimitados.length === 1
      ? "grid-cols-1"
      : numerosLimitados.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : numerosLimitados.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <section className={`${classesFundo.fundo} ${classesFundo.texto} py-[var(--spacing-bloco-vertical)]`}>
      <Container variante="amplo">
        {titulo && (
          <h2 className={`font-titulo text-h2 ${fundo === "oxford" ? "text-osso" : "text-oxford"}`}>
            {titulo}
          </h2>
        )}
        <dl className={`mt-10 grid ${colunas} gap-10`}>
          {numerosLimitados.map((n) => (
            <div key={n.rotulo} className="flex flex-col">
              <dt
                className={`font-titulo font-medium leading-none ${
                  fundo === "oxford" ? "text-dourado" : acento ? acento.texto : "text-oxford"
                } text-[clamp(3rem,6vw,5rem)]`}
              >
                {n.valor}
              </dt>
              <dd
                className={`mt-3 font-corpo text-eyebrow uppercase tracking-[0.18em] ${classesFundo.textoSuave}`}
              >
                {n.rotulo}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
