"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, INPUT_BASE_CLASSES, Label } from "./primitives";

interface CampoNumberProps extends CampoBaseProps {
  min?: number;
  max?: number;
  step?: number;
}

export function CampoNumber({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  placeholder,
  className,
  min,
  max,
  step,
}: CampoNumberProps) {
  const { valores, erros, tocados, setCampo, marcarTocado } = useFormulario();
  const valor = valores[nome];
  const valorString =
    typeof valor === "number" ? String(valor) : typeof valor === "string" ? valor : "";
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
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={valorString}
        disabled={desabilitado}
        placeholder={placeholder}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const v = e.target.value;
          setCampo(nome, v === "" ? "" : Number(v));
        }}
        onBlur={() => marcarTocado(nome)}
        className={INPUT_BASE_CLASSES}
      />
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
