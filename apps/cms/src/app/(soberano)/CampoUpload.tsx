"use client";

import { useRef, useState, useTransition } from "react";

import type { EventoCmsDetalhe } from "@/lib/cms/prototipoCms";

import { enviarMidia } from "./acoes";

interface CampoUploadProps {
  eventoId: string;
  campo: "imagemCapa" | "folderPdf";
  rotulo: string;
  accept: string;
  /** Resumo do arquivo atual (ex. "Capa vinculada" ou nome do PDF). */
  atual: string;
  onAtualizado: (evento: EventoCmsDetalhe) => void;
}

/** Campo de upload (capa ou PDF) — envia via Server Action e atualiza o pai. */
export function CampoUpload({ eventoId, campo, rotulo, accept, atual, onAtualizado }: CampoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);
    setErro(null);

    const fd = new FormData();
    fd.append("arquivo", file);

    iniciar(async () => {
      const { resultado, evento } = await enviarMidia(eventoId, campo, fd);
      if (resultado.ok && evento) {
        onAtualizado(evento);
      } else {
        setErro(resultado.erro ?? "Falha no upload.");
        setNomeArquivo(null);
      }
    });
  }

  return (
    <div className="pcms-upload">
      <span className="pcms-det-meta__rot">{rotulo}</span>
      <p className="pcms-upload__atual">{nomeArquivo ?? atual}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="pcms-upload__input"
        onChange={aoEscolher}
        disabled={enviando}
        aria-label={`Enviar ${rotulo}`}
      />
      <button
        type="button"
        className="pcms-btn pcms-btn--ghost"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
      >
        {enviando ? "Enviando…" : "Escolher arquivo"}
      </button>
      {erro && <p className="pcms-upload__erro">{erro}</p>}
    </div>
  );
}
