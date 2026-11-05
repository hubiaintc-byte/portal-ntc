"use client";

import type { ReactNode } from "react";

import { Icone, type NomeIcone } from "../ui/Icone";
import { Dica } from "../ui/Selo";

/**
 * Campos do `FormEngine` do protótipo FIN-05 usados pelo wizard de evento:
 * `.fld.s{n}[.invalid] > label (+ .req * / .opt (opcional) / info) + controle
 * + .help + .err[role=alert]`. O id do controle é `f_<campo>` (como no
 * protótipo), o que deixa o wizard achar e focar o campo com erro.
 */

export interface PropsFld {
  campo: string;
  rotulo: string;
  span?: 1 | 2 | 3 | 4;
  obrigatorio?: boolean;
  opcional?: boolean;
  dica?: string;
  ajuda?: ReactNode;
  erro?: string;
}

function Fld({
  campo,
  rotulo,
  span,
  obrigatorio,
  opcional,
  dica,
  ajuda,
  erro,
  children,
}: PropsFld & { children: ReactNode }) {
  const id = `f_${campo}`;
  return (
    <div className={`fld${span ? ` s${span}` : ""}${erro ? " invalid" : ""}`} data-f={campo}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio ? (
          <span className="req" aria-hidden="true">
            *
          </span>
        ) : (
          opcional && <span className="opt">(opcional)</span>
        )}
        {dica && <Dica texto={dica} />}
      </label>
      {children}
      {ajuda ? <div className="help">{ajuda}</div> : null}
      {erro && (
        <div className="err" role="alert" id={`${id}_err`}>
          {erro}
        </div>
      )}
    </div>
  );
}

const descr = (campo: string, erro?: string) => (erro ? `f_${campo}_err` : undefined);

interface PropsTexto extends PropsFld {
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  tipo?: "text" | "number" | "date";
  /** Opções do `datalist` (tipo datalist do protótipo). */
  sugestoes?: readonly string[];
}

export function CampoTexto({
  valor,
  aoMudar,
  placeholder,
  tipo = "text",
  sugestoes,
  ...fld
}: PropsTexto) {
  const id = `f_${fld.campo}`;
  return (
    <Fld {...fld}>
      <input
        id={id}
        type={tipo}
        inputMode={tipo === "number" ? "numeric" : undefined}
        min={tipo === "number" ? 0 : undefined}
        step={tipo === "number" ? 1 : undefined}
        autoComplete="off"
        list={sugestoes ? `${id}_dl` : undefined}
        value={valor}
        placeholder={placeholder}
        aria-invalid={fld.erro ? true : undefined}
        aria-describedby={descr(fld.campo, fld.erro)}
        aria-required={fld.obrigatorio || undefined}
        onChange={(e) => aoMudar(e.target.value)}
      />
      {sugestoes && (
        <datalist id={`${id}_dl`}>
          {sugestoes.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
    </Fld>
  );
}

export function CampoAreaTexto({
  valor,
  aoMudar,
  placeholder,
  ...fld
}: Omit<PropsTexto, "tipo" | "sugestoes">) {
  return (
    <Fld {...fld}>
      <textarea
        id={`f_${fld.campo}`}
        value={valor}
        placeholder={placeholder}
        aria-invalid={fld.erro ? true : undefined}
        aria-describedby={descr(fld.campo, fld.erro)}
        onChange={(e) => aoMudar(e.target.value)}
      />
    </Fld>
  );
}

interface PropsSelect extends PropsFld {
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly string[];
  placeholder?: string;
}

export function CampoSelect({
  valor,
  aoMudar,
  opcoes,
  placeholder = "Selecione…",
  ...fld
}: PropsSelect) {
  return (
    <Fld {...fld}>
      <select
        id={`f_${fld.campo}`}
        value={valor}
        aria-invalid={fld.erro ? true : undefined}
        aria-describedby={descr(fld.campo, fld.erro)}
        aria-required={fld.obrigatorio || undefined}
        onChange={(e) => aoMudar(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Fld>
  );
}

export interface OpcaoChip {
  valor: string;
  rotulo: string;
  /** Classe de vertical (`dot v-edu`…), ou */
  classeVertical?: string;
  /** ícone antes do rótulo. */
  icone?: NomeIcone;
}

interface PropsChips extends PropsFld {
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly OpcaoChip[];
}

/**
 * `chips` do protótipo: `.chips-choice[role=radiogroup] > button[role=radio]`.
 * O `label for` aponta para o primeiro chip (`f_<campo>`), para o foco do
 * erro cair nele. Setas movem a escolha, como num grupo de rádio.
 */
export function CampoChips({ valor, aoMudar, opcoes, ...fld }: PropsChips) {
  const mover = (i: number, delta: number, alvo: HTMLElement) => {
    const j = (i + delta + opcoes.length) % opcoes.length;
    const o = opcoes[j];
    if (!o) return;
    aoMudar(o.valor);
    const irmaos = alvo.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    irmaos?.[j]?.focus();
  };
  // Valor vazio ou fora da lista (legado): o primeiro chip é a parada do Tab.
  const selecionado = opcoes.some((o) => o.valor === valor);
  return (
    <Fld {...fld}>
      <div
        className="chips-choice"
        role="radiogroup"
        aria-label={fld.rotulo}
        aria-describedby={descr(fld.campo, fld.erro)}
      >
        {opcoes.map((o, i) => {
          const on = o.valor === valor;
          return (
            <button
              key={o.valor}
              id={i === 0 ? `f_${fld.campo}` : undefined}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (!selecionado && i === 0) ? 0 : -1}
              className={on ? "on" : undefined}
              onClick={() => aoMudar(o.valor)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  mover(i, 1, e.currentTarget);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  mover(i, -1, e.currentTarget);
                }
              }}
            >
              {o.classeVertical ? (
                <span className={`dot ${o.classeVertical}`} />
              ) : (
                o.icone && <Icone nome={o.icone} tamanho="sm" />
              )}
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </Fld>
  );
}

/**
 * Campo que o CRM já preencheu (spec §3.2): o valor aparece só leitura, com
 * a indicação de que se edita no CRM. Mesmo `.fld`, com o valor num
 * `input readOnly` (navegável e lido pelo leitor de tela).
 */
export function CampoDoCrm({ valor, ...fld }: PropsFld & { valor: string }) {
  return (
    <Fld {...fld} obrigatorio={false} opcional={false} ajuda="Editar no CRM">
      <input
        id={`f_${fld.campo}`}
        type="text"
        readOnly
        value={valor}
        aria-invalid={fld.erro ? true : undefined}
        aria-describedby={descr(fld.campo, fld.erro)}
      />
    </Fld>
  );
}

/** `{ note }` do protótipo: `.ctx-note(.gold)` com ícone. */
export function Nota({
  icone = "info",
  dourada,
  children,
}: {
  icone?: NomeIcone;
  dourada?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`ctx-note${dourada ? " gold" : ""}`}>
      <Icone nome={icone} tamanho="sm" />
      <div>{children}</div>
    </div>
  );
}

/** `{ group }` do protótipo. */
export function Grupo({ titulo }: { titulo: string }) {
  return (
    <div className="fgroup">
      <span>{titulo}</span>
    </div>
  );
}
