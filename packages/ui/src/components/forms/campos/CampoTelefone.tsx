"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, INPUT_BASE_CLASSES, Label } from "./primitives";

/**
 * Máscara BR `(xx) xxxxx-xxxx` aplicada onChange. Aceita 8 ou 9 dígitos
 * no número (fixo ou celular). Mantém apenas dígitos no `valores[nome]`.
 */
function formatarTelefoneBR(digitos: string): string {
  const d = digitos.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length === 0 ? "" : `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function CampoTelefone({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  placeholder = "(11) 91234-5678",
  className,
}: CampoBaseProps) {
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
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatarTelefoneBR(valor)}
        disabled={desabilitado}
        placeholder={placeholder}
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        onChange={(e) => setCampo(nome, e.target.value.replace(/\D/g, ""))}
        onBlur={() => marcarTocado(nome)}
        className={INPUT_BASE_CLASSES}
      />
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
