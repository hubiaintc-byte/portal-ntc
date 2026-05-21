"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, INPUT_BASE_CLASSES, Label } from "./primitives";

interface CampoTextoProps extends CampoBaseProps {
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  maxLength?: number;
}

export function CampoTexto({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  placeholder,
  className,
  type = "text",
  autoComplete,
  maxLength,
}: CampoTextoProps) {
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
      <input
        id={nome}
        name={nome}
        type={type}
        autoComplete={autoComplete}
        value={valor}
        disabled={desabilitado}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={(e) => setCampo(nome, e.target.value)}
        onBlur={() => marcarTocado(nome)}
        className={INPUT_BASE_CLASSES}
      />
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
