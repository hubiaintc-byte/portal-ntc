"use client";

import { useId, useRef } from "react";

import { BarraFormatacao, aplicarNoTextarea, atalhoDaTecla } from "../BarraFormatacao";

interface CampoMarkdownProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  linhas?: number;
  /** O conteúdo gravado tem formatação que o editor não representa — salvar este campo a perderia. */
  avisoPerda?: boolean;
  /** Marcação leve de uma linha (títulos, destaques): barra só com negrito e itálico. */
  soEnfase?: boolean;
  /** Linha de ajuda sob o campo. */
  dica?: string;
}

/** Texto rico do catálogo editado como Markdown leve, com a mesma barra dos Conteúdos. */
export function CampoMarkdown({ rotulo, valor, onMudar, linhas = 6, avisoPerda, soEnfase, dica }: CampoMarkdownProps) {
  const id = useId();
  const idDica = `${id}-dica`;
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="pcms-field">
      <label htmlFor={id}>{rotulo}</label>
      {avisoPerda && (
        <p className="pcms-aviso" role="note">
          Este texto tem formatação que o editor não representa (ex.: negrito e itálico juntos). Se você alterar e salvar este campo, essa formatação se perde.
        </p>
      )}
      <BarraFormatacao textareaRef={ref} valor={valor} onMudar={onMudar} soEnfase={soEnfase} />
      <textarea
        id={id}
        ref={ref}
        rows={linhas}
        aria-describedby={dica ? idDica : undefined}
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        onKeyDown={(e) => {
          const acao = atalhoDaTecla(e);
          if (!acao) return;
          e.preventDefault();
          aplicarNoTextarea(ref.current, valor, acao, onMudar);
        }}
      />
      {dica && (
        <p id={idDica} className="pcms-editor__hint">
          {dica}
        </p>
      )}
    </div>
  );
}
