"use client";

import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro, HelperText, Label } from "./primitives";

interface OpcaoSelectMulti {
  label: string;
  value: string;
}

interface CampoSelectMultiProps extends CampoBaseProps {
  opcoes: OpcaoSelectMulti[];
}

export function CampoSelectMulti({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  className,
  opcoes,
}: CampoSelectMultiProps) {
  const { valores, erros, tocados, setCampo, marcarTocado } = useFormulario();
  const selecionados = Array.isArray(valores[nome]) ? (valores[nome] as string[]) : [];
  const erroAtivo = tocados[nome] ? erros[nome] : undefined;
  const helperId = helper ? `${nome}-helper` : undefined;
  const erroId = erroAtivo ? `${nome}-erro` : undefined;
  const describedBy = [helperId, erroId].filter(Boolean).join(" ") || undefined;

  const toggle = (value: string) => {
    const novo = selecionados.includes(value)
      ? selecionados.filter((v) => v !== value)
      : [...selecionados, value];
    setCampo(nome, novo);
    marcarTocado(nome);
  };

  return (
    <div className={className}>
      <Label htmlFor={`${nome}-grupo`} obrigatorio={obrigatorio}>
        {rotulo}
      </Label>
      <div
        id={`${nome}-grupo`}
        role="group"
        aria-invalid={erroAtivo ? "true" : undefined}
        aria-describedby={describedBy}
        className="flex flex-wrap gap-2 pt-1"
      >
        {opcoes.map((o) => {
          const ativo = selecionados.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              disabled={desabilitado}
              aria-pressed={ativo}
              onClick={() => toggle(o.value)}
              className={[
                "rounded-full border px-4 py-1.5 font-corpo text-pequeno transition-colors",
                "uppercase tracking-[0.12em]",
                ativo
                  ? "border-oxford bg-oxford text-pergaminho"
                  : "border-linha-sutil bg-transparent text-oxford hover:border-oxford",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {helper ? <HelperText id={`${nome}-helper`}>{helper}</HelperText> : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
    </div>
  );
}
