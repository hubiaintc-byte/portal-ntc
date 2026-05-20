import { Grade } from "../layout/Grade";
import { CardEvento } from "../cards/CardEvento";
import type { EventoItem } from "./tipos";
import type { ReactNode } from "react";

export interface GradeEventosProps {
  eventos: EventoItem[];
  agruparPorMes?: boolean;
  ordenacao?: "cronologica" | "destaque";
  vazio?: ReactNode;
}

function paraDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function chaveMes(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split("-");
  if (!ano || !mes) return chave;
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const fmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
  return fmt.format(data);
}

export function GradeEventos({
  eventos,
  agruparPorMes = true,
  ordenacao = "cronologica",
  vazio,
}: GradeEventosProps) {
  if (eventos.length === 0 && vazio) return <>{vazio}</>;

  const ordenados = [...eventos].sort((a, b) => {
    if (ordenacao === "destaque") {
      return (b.inscricaoAberta ? 1 : 0) - (a.inscricaoAberta ? 1 : 0);
    }
    return paraDate(a.dataInicio).getTime() - paraDate(b.dataInicio).getTime();
  });

  const cartao = (e: EventoItem) => (
    <CardEvento
      key={e.href}
      nome={e.nome}
      eyebrow={e.eyebrow}
      imagem={e.imagem}
      dataInicio={e.dataInicio}
      modalidade={e.modalidade}
      local={e.local}
      programa={e.programa}
      area={e.area}
      inscricaoAberta={e.inscricaoAberta}
      href={e.href}
    />
  );

  if (!agruparPorMes) {
    return (
      <Grade colunas={3} gap="medio">
        {ordenados.map(cartao)}
      </Grade>
    );
  }

  const grupos = new Map<string, EventoItem[]>();
  for (const e of ordenados) {
    const chave = chaveMes(paraDate(e.dataInicio));
    const lista = grupos.get(chave) ?? [];
    lista.push(e);
    grupos.set(chave, lista);
  }

  return (
    <div className="flex flex-col gap-16">
      {[...grupos.entries()].map(([chave, lista]) => (
        <section key={chave}>
          <h3 className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {rotuloMes(chave)}
          </h3>
          <Grade colunas={3} gap="medio" className="mt-6">
            {lista.map(cartao)}
          </Grade>
        </section>
      ))}
    </div>
  );
}
