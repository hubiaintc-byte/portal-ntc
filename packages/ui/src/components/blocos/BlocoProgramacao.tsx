import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";

export interface ItemProgramacao {
  horario: string;
  titulo: string;
  descricao?: string;
  palestrantes?: { nome: string; href?: string }[];
}

export interface BlocoProgramacaoProps {
  titulo?: string;
  itens: ItemProgramacao[];
}

export function BlocoProgramacao({ titulo, itens }: BlocoProgramacaoProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="editorial">
        {titulo && (
          <h2 className="font-titulo text-h2 text-balance text-oxford">{titulo}</h2>
        )}
        <ol className={`flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil ${titulo ? "mt-10" : ""}`}>
          {itens.map((item, i) => (
            <li key={`${item.horario}-${i}`} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-10">
              <p className="font-titulo text-h4 tabular-nums text-dourado">{item.horario}</p>
              <div>
                <h3 className="font-titulo text-h4 text-oxford">{item.titulo}</h3>
                {item.descricao && (
                  <p className="mt-2 font-corpo text-corpo text-grafite text-pretty">{item.descricao}</p>
                )}
                {item.palestrantes && item.palestrantes.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-corpo text-pequeno text-grafite-suave">
                    {item.palestrantes.map((p) =>
                      p.href ? (
                        <li key={p.nome}>
                          <Link
                            href={p.href as Route}
                            className="uppercase tracking-[0.18em] underline-offset-4 hover:text-oxford hover:underline"
                          >
                            {p.nome}
                          </Link>
                        </li>
                      ) : (
                        <li key={p.nome} className="uppercase tracking-[0.18em]">
                          {p.nome}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
