"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, INPUT_BASE_CLASSES, Label } from "./primitives";

interface OpcaoSelect {
  label: string;
  value: string;
}

interface CampoSelectProps extends CampoBaseProps {
  opcoes: OpcaoSelect[];
}

export function CampoSelect({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  placeholder = "Selecione…",
  className,
  opcoes,
}: CampoSelectProps) {
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
      <select
        id={nome}
        name={nome}
        value={valor}
        disabled={desabilitado}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={(e) => setCampo(nome, e.target.value)}
        onBlur={() => marcarTocado(nome)}
        className={`${INPUT_BASE_CLASSES} appearance-none bg-[length:0.6rem_0.6rem] bg-[right_0.25rem_center] bg-no-repeat pr-6`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%2311365E' stroke-width='1.5'><path d='M1 1l5 5 5-5'/></svg>\")",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
