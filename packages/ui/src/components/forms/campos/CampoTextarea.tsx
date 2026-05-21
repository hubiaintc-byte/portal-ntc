"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, INPUT_BASE_CLASSES, Label } from "./primitives";

interface CampoTextareaProps extends CampoBaseProps {
  linhas?: number;
  maxLength?: number;
}

export function CampoTextarea({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  placeholder,
  className,
  linhas = 5,
  maxLength,
}: CampoTextareaProps) {
  const { valores, erros, tocados, setCampo, marcarTocado } = useFormulario();
  const valor = typeof valores[nome] === "string" ? (valores[nome] as string) : "";
  const erroAtivo = tocados[nome] ? erros[nome] : undefined;
  const helperId = helper ? `${nome}-helper` : undefined;
  const erroId = erroAtivo ? `${nome}-erro` : undefined;
  const describedBy = [helperId, erroId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <Label htmlFor={nome} obrigatorio={obrigatorio}>
        {rotulo}
      </Label>
      <textarea
        id={nome}
        name={nome}
        rows={linhas}
        value={valor}
        disabled={desabilitado}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={(e) => setCampo(nome, e.target.value)}
        onBlur={() => marcarTocado(nome)}
        className={`${INPUT_BASE_CLASSES} resize-vertical`}
      />
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
