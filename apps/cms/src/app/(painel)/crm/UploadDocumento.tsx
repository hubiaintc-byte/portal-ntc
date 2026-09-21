"use client";

import { useId, useRef, useState, useTransition } from "react";

import { subirDocumentoEventoCrm } from "../acoesCrm";

interface UploadDocumentoProps {
  eventoId: string;
  onEnviado: () => void;
}

/** Envia um novo documento comercial para o evento — mesmo idioma de CampoUpload.tsx (classes pcms-upload*). */
export function UploadDocumento({ eventoId, onEnviado }: UploadDocumentoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const idArquivo = useId();
  const idDescricao = useId();
  const [descricao, setDescricao] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);
    setErro(null);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) {
      setErro("Selecione um arquivo.");
      return;
    }
    setErro(null);
    const fd = new FormData();
    fd.append("arquivo", arquivo);

    iniciar(async () => {
      const r = await subirDocumentoEventoCrm(eventoId, descricao, fd);
      if (r.ok) {
        setDescricao("");
        setNomeArquivo(null);
        if (inputRef.current) inputRef.current.value = "";
        onEnviado();
      } else {
        setErro(r.erro ?? "Falha no upload.");
      }
    });
  }

  return (
    <form className="pcms-upload" onSubmit={enviar}>
      <span className="pcms-det-meta__rot">Novo documento</span>
      <p className="pcms-upload__atual">{nomeArquivo ?? "Nenhum arquivo escolhido"}</p>
      <input
        ref={inputRef}
        id={idArquivo}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
        className="pcms-upload__input"
        onChange={aoEscolher}
        disabled={enviando}
        aria-label="Arquivo do documento"
      />
      <small>até 20 MB.</small>
      <button
        type="button"
        className="pcms-btn pcms-btn--ghost"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
      >
        {enviando ? "Enviando…" : "Escolher arquivo"}
      </button>
      <div className="pcms-field pcms-field--curto">
        <label htmlFor={idDescricao}>Descrição (opcional)</label>
        <input
          id={idDescricao}
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={enviando}
        />
      </div>
      <button type="submit" className="pcms-btn pcms-btn--ghost pcms-btn--mini" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar"}
      </button>
      {erro && <p className="pcms-upload__erro">{erro}</p>}
    </form>
  );
}
