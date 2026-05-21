"use client";

import { useState, type ReactNode } from "react";

import { DialogoPolitica } from "../../helpers/DialogoPolitica";
import { useFormulario } from "../contexto";
import type { CampoBaseProps } from "../tipos";
import { Erro } from "./primitives";

interface CampoCheckboxProps extends Omit<CampoBaseProps, "rotulo"> {
  rotulo: ReactNode;
  linkPolitica?: string;
  rotuloPolitica?: string;
}

export function CampoCheckbox({
  nome,
  rotulo,
  helper,
  obrigatorio,
  desabilitado,
  className,
  linkPolitica,
  rotuloPolitica = "Política de Privacidade",
}: CampoCheckboxProps) {
  const { valores, erros, tocados, setCampo, marcarTocado } = useFormulario();
  const marcado = valores[nome] === true;
  const erroAtivo = tocados[nome] ? erros[nome] : undefined;
  const erroId = erroAtivo ? `${nome}-erro` : undefined;
  const helperId = helper ? `${nome}-helper` : undefined;
  const describedBy = [helperId, erroId].filter(Boolean).join(" ") || undefined;
  const [dialogoAberto, setDialogoAberto] = useState(false);

  return (
    <div className={className}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          id={nome}
          name={nome}
          type="checkbox"
          checked={marcado}
          disabled={desabilitado}
          aria-invalid={erroAtivo ? "true" : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            setCampo(nome, e.target.checked);
            marcarTocado(nome);
          }}
          className="mt-1 size-4 shrink-0 border-linha-sutil text-oxford focus:ring-oxford"
        />
        <span className="font-corpo text-pequeno text-grafite">
          {rotulo}
          {obrigatorio ? <span className="ml-1 text-dourado">*</span> : null}
          {linkPolitica ? (
            <>
              {" "}
              <button
                type="button"
                className="underline decoration-oxford underline-offset-2 hover:text-cardeal"
                onClick={(e) => {
                  e.preventDefault();
                  setDialogoAberto(true);
                }}
              >
                {rotuloPolitica}
              </button>
            </>
          ) : null}
        </span>
      </label>
      {helper ? (
        <p id={`${nome}-helper`} className="mt-2 font-corpo text-pequeno text-grafite-suave">
          {helper}
        </p>
      ) : null}
      {erroAtivo ? <Erro id={`${nome}-erro`}>{erroAtivo}</Erro> : null}
      {linkPolitica ? (
        <DialogoPolitica
          aberto={dialogoAberto}
          href={linkPolitica}
          titulo={rotuloPolitica}
          onClose={() => setDialogoAberto(false)}
        />
      ) : null}
    </div>
  );
}
