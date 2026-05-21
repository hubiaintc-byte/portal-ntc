import type { ReactNode } from "react";

/**
 * Primitivos visuais compartilhados pelos campos atômicos (doc 12 §9.2).
 * Server-safe (sem hooks). Estética Soberana: label uppercase Barlow,
 * erro inline em vermelho-erro, helper text discreto, asterisco dourado.
 */

interface LabelProps {
  htmlFor: string;
  obrigatorio?: boolean;
  children: ReactNode;
}

export function Label({ htmlFor, obrigatorio, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-corpo text-eyebrow uppercase tracking-[0.18em] text-oxford"
    >
      {children}
      {obrigatorio ? <Asterisco /> : null}
    </label>
  );
}

export function Asterisco() {
  return (
    <span aria-hidden="true" className="ml-1 text-dourado">
      *
    </span>
  );
}

interface HelperTextProps {
  id: string;
  children: ReactNode;
}

export function HelperText({ id, children }: HelperTextProps) {
  return (
    <p id={id} className="mt-2 font-corpo text-pequeno text-grafite-suave">
      {children}
    </p>
  );
}

interface ErroProps {
  id: string;
  children: ReactNode;
}

export function Erro({ id, children }: ErroProps) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 font-corpo text-pequeno text-vermelho-erro"
    >
      {children}
    </p>
  );
}

export const INPUT_BASE_CLASSES =
  "w-full bg-transparent border-0 border-b border-linha-sutil py-2 font-corpo text-corpo text-grafite outline-none transition-colors focus:border-oxford focus:ring-0 disabled:opacity-60 placeholder:text-grafite-suave";
