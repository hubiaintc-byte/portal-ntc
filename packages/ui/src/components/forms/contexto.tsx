"use client";

import { createContext, useContext } from "react";

import type { FormularioContextValue } from "./tipos";

/**
 * Context do `<FormularioSoberano>` consumido por todos os campos atômicos
 * (`CampoTexto`, `CampoEmail`, etc.). O orquestrador é o único produtor;
 * os campos só leem.
 */
export const FormularioContexto = createContext<FormularioContextValue | null>(null);

export function useFormulario(): FormularioContextValue {
  const ctx = useContext(FormularioContexto);
  if (!ctx) {
    throw new Error(
      "Campo de formulário usado fora de <FormularioSoberano>. Verifique a árvore de componentes.",
    );
  }
  return ctx;
}
