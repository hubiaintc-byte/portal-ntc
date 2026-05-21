"use client";

import { useState, type ReactNode } from "react";

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
      {dialogoAberto && linkPolitica ? (
        <DialogoPolitica
          href={linkPolitica}
          titulo={rotuloPolitica}
          onClose={() => setDialogoAberto(false)}
        />
      ) : null}
    </div>
  );
}

interface DialogoPoliticaInlineProps {
  href: string;
  titulo: string;
  onClose: () => void;
}

function DialogoPolitica({ href, titulo, onClose }: DialogoPoliticaInlineProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-politica-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-grafite/40 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="max-w-lg bg-osso p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="dialogo-politica-titulo" className="text-h3 font-titulo text-oxford">
          {titulo}
        </h3>
        <p className="mt-4 font-corpo text-corpo text-grafite">
          O Instituto NTC do Brasil trata seus dados pessoais com base na Lei Geral de Proteção de
          Dados (LGPD). Ao prosseguir, você consente com o uso dos dados informados exclusivamente
          para responder à sua solicitação institucional.
        </p>
        <p className="mt-4 font-corpo text-corpo text-grafite">
          Você pode solicitar exclusão, acesso ou correção dos seus dados a qualquer tempo.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-oxford px-6 py-3 font-corpo uppercase tracking-[0.12em] text-oxford hover:bg-oxford hover:text-pergaminho"
          >
            Ler política completa
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 bg-oxford px-6 py-3 font-corpo uppercase tracking-[0.12em] text-pergaminho hover:bg-oxford-claro"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
