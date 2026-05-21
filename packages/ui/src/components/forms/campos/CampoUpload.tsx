"use client";

import { useRef } from "react";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, Label } from "./primitives";

interface CampoUploadProps extends CampoBaseProps {
  aceita?: string;
  maxMb?: number;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CampoUpload({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  className,
  aceita = "application/pdf",
  maxMb = 10,
}: CampoUploadProps) {
  const { valores, erros, tocados, setCampo, marcarTocado } = useFormulario();
  const inputRef = useRef<HTMLInputElement>(null);
  const arquivo = valores[nome] instanceof File ? (valores[nome] as File) : undefined;
  const erroAtivo = tocados[nome] ? erros[nome] : undefined;
  const helperId = helper ? `${nome}-helper` : undefined;
  const erroId = erroAtivo ? `${nome}-erro` : undefined;
  const describedBy = [helperId, erroId].filter(Boolean).join(" ") || undefined;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    marcarTocado(nome);
    if (!f) {
      setCampo(nome, undefined);
      return;
    }
    const mimeOk = aceita.split(",").map((s) => s.trim()).some((m) => f.type === m || m === "*/*");
    if (!mimeOk) {
      setCampo(nome, undefined);
      if (inputRef.current) inputRef.current.value = "";
      alert(`Tipo de arquivo inválido. Aceitamos: ${aceita}`);
      return;
    }
    const limite = maxMb * 1024 * 1024;
    if (f.size > limite) {
      setCampo(nome, undefined);
      if (inputRef.current) inputRef.current.value = "";
      alert(`Arquivo maior que o limite de ${maxMb} MB.`);
      return;
    }
    setCampo(nome, f);
  };

  return (
    <div className={className}>
      <Label htmlFor={nome} obrigatorio={obrigatorio}>
        {rotulo}
      </Label>
      <input
        ref={inputRef}
        id={nome}
        name={nome}
        type="file"
        accept={aceita}
        disabled={desabilitado}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={onChange}
        className="block w-full font-corpo text-pequeno text-grafite file:mr-4 file:cursor-pointer file:border file:border-oxford file:bg-transparent file:px-4 file:py-2 file:font-corpo file:uppercase file:tracking-[0.12em] file:text-oxford hover:file:bg-oxford hover:file:text-pergaminho"
      />
      {arquivo ? (
        <p className="mt-2 font-corpo text-pequeno text-grafite-suave">
          {arquivo.name} · {formatarTamanho(arquivo.size)}
        </p>
      ) : null}
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
