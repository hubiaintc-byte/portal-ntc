"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Icone } from "./Icone";

/**
 * Gaveta lateral do protótipo FIN-05 (`Overlay.open({ kind: 'drawer' })`):
 * `.overlay` + `.drawer` com `.ov-head` (eyebrow, título, sub, Fechar),
 * `.ov-body` e `.ov-foot`. Foco como no `ModalLead` e no protótipo: ao abrir
 * vai para o primeiro campo do corpo (ou `[data-autofocus]`, ou o Fechar);
 * Tab fica preso na gaveta; Esc e clique no fundo fecham; ao fechar, o foco
 * volta a quem abriu. Gavetas empilhadas (ex.: "Nova conta" dentro do
 * recebimento) respondem só a de cima.
 *
 * A gaveta é montada aberta: quem usa renderiza `{aberta && <Gaveta …/>}` e
 * desmonta no `aoFechar`. Precisa estar dentro de `.fin05` (os estilos).
 */

const FOCAVEIS = 'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
const PRIMEIRO_CAMPO = ".ov-body input, .ov-body select, .ov-body textarea, [data-autofocus]";

/** Pilha das gavetas abertas: Esc e Tab valem só para a do topo. */
const pilha: symbol[] = [];

interface GavetaProps {
  titulo: string;
  /** Linha pequena acima do título (`oh-eyebrow`), ex.: "RC-0003 · Receita". */
  eyebrow?: ReactNode;
  /** Linha abaixo do título (`oh-sub`). */
  sub?: ReactNode;
  aoFechar: () => void;
  /** Conteúdo do `.ov-foot`; sem ele, a gaveta não tem rodapé. */
  rodape?: ReactNode;
  children: ReactNode;
}

export function Gaveta({ titulo, eyebrow, sub, aoFechar, rodape, children }: GavetaProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const [visivel, setVisivel] = useState(false);
  const idTitulo = useId();
  // O handler de teclado lê a versão atual de `aoFechar` sem reinscrever.
  const aoFecharRef = useRef(aoFechar);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

  useEffect(() => {
    const eu = Symbol("gaveta");
    pilha.push(eu);
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Um quadro para a transição `.show` (translateX) rodar, como no protótipo.
    const quadro = requestAnimationFrame(() => setVisivel(true));
    const foco = window.setTimeout(() => {
      const alvo = caixa.current?.querySelector<HTMLElement>(PRIMEIRO_CAMPO) ?? fechar.current;
      alvo?.focus();
    }, 280);

    function teclar(e: KeyboardEvent) {
      if (pilha[pilha.length - 1] !== eu) return;
      if (e.key === "Escape") {
        e.preventDefault();
        aoFecharRef.current();
        return;
      }
      if (e.key !== "Tab" || !caixa.current) return;
      const focaveis = Array.from(caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
        (x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null,
      );
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0]!;
      const ultimo = focaveis[focaveis.length - 1]!;
      const ativo = document.activeElement;
      if (e.shiftKey && (ativo === primeiro || !caixa.current.contains(ativo))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (ativo === ultimo || !caixa.current.contains(ativo))) {
        e.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", teclar);

    return () => {
      cancelAnimationFrame(quadro);
      window.clearTimeout(foco);
      document.removeEventListener("keydown", teclar);
      const i = pilha.indexOf(eu);
      if (i >= 0) pilha.splice(i, 1);
      anterior?.focus();
    };
  }, []);

  return (
    <>
      <div className={`overlay${visivel ? " show" : ""}`} onClick={aoFechar} aria-hidden="true" />
      <div
        ref={caixa}
        className={`drawer${visivel ? " show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        <div className="ov-head">
          <div>
            {eyebrow && <div className="oh-eyebrow">{eyebrow}</div>}
            <h3 id={idTitulo}>{titulo}</h3>
            {sub && <div className="oh-sub">{sub}</div>}
          </div>
          <button ref={fechar} type="button" className="btn btn-ghost btn-icon" aria-label="Fechar" onClick={aoFechar}>
            <Icone nome="x" />
          </button>
        </div>
        <div className="ov-body">{children}</div>
        {rodape !== undefined && <div className="ov-foot">{rodape}</div>}
      </div>
    </>
  );
}
