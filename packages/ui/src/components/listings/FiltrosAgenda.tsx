"use client";

import { useEffect, useId, useState } from "react";
import type { Area, Modalidade } from "../heroes/tipos";
import { rotuloArea, rotuloModalidade } from "../heroes/tipos";
import { FILTRO_INICIAL, type FiltroEstado } from "./tipos";

export interface FiltrosAgendaProps {
  programasDisponiveis: { sigla: string; nomeCompleto: string }[];
  estadoInicial?: Partial<FiltroEstado>;
  onChange: (filtros: FiltroEstado) => void;
}

const MODALIDADES: ("todos" | Modalidade)[] = ["todos", "online", "presencial", "hibrido"];
const AREAS: ("todos" | Area)[] = ["todos", "educacao", "gestao-publica", "saude"];

function rotuloModalidadeOuTodos(m: "todos" | Modalidade): string {
  return m === "todos" ? "Todas" : rotuloModalidade(m);
}

function rotuloAreaOuTodos(a: "todos" | Area): string {
  return a === "todos" ? "Todas as áreas" : rotuloArea(a);
}

export function FiltrosAgenda({
  programasDisponiveis,
  estadoInicial,
  onChange,
}: FiltrosAgendaProps) {
  const [estado, setEstado] = useState<FiltroEstado>({ ...FILTRO_INICIAL, ...estadoInicial });
  const baseId = useId();

  useEffect(() => {
    onChange(estado);
    // onChange é prop estável vinda do consumidor; deliberadamente fora das deps para evitar loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <form
      role="search"
      aria-label="Filtros da agenda"
      className="grid gap-6 border-y border-linha-sutil bg-osso py-8 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          Modalidade
        </legend>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => {
            const ativo = estado.modalidade === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={ativo}
                onClick={() => setEstado((s) => ({ ...s, modalidade: m }))}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${
                  ativo
                    ? "bg-oxford text-osso"
                    : "bg-pergaminho text-grafite hover:bg-linha-sutil"
                }`}
              >
                {rotuloModalidadeOuTodos(m)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          Área
        </legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => {
            const ativo = estado.area === a;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={ativo}
                onClick={() => setEstado((s) => ({ ...s, area: a }))}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${
                  ativo
                    ? "bg-oxford text-osso"
                    : "bg-pergaminho text-grafite hover:bg-linha-sutil"
                }`}
              >
                {rotuloAreaOuTodos(a)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor={`${baseId}-programa`}
          className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave"
        >
          Programa
        </label>
        <select
          id={`${baseId}-programa`}
          value={estado.programa ?? ""}
          onChange={(e) =>
            setEstado((s) => ({ ...s, programa: e.target.value === "" ? undefined : e.target.value }))
          }
          className="w-full border border-linha-sutil bg-osso px-3 py-2 font-corpo text-corpo text-grafite focus:border-oxford focus:outline-none"
        >
          <option value="">Todos os programas</option>
          {programasDisponiveis.map((p) => (
            <option key={p.sigla} value={p.sigla}>
              {p.sigla} — {p.nomeCompleto}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor={`${baseId}-mes`}
          className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave"
        >
          Mês
        </label>
        <input
          id={`${baseId}-mes`}
          type="month"
          value={estado.mes ?? ""}
          onChange={(e) =>
            setEstado((s) => ({ ...s, mes: e.target.value === "" ? undefined : e.target.value }))
          }
          className="w-full border border-linha-sutil bg-osso px-3 py-2 font-corpo text-corpo text-grafite focus:border-oxford focus:outline-none"
        />
      </fieldset>
    </form>
  );
}
