import type { ReactNode } from "react";

/**
 * Contrato compartilhado da família de formulários institucionais
 * (doc 12 §9). Toda a estética e a11y dos campos atômicos derivam destes
 * tipos. Campos custom seguem a mesma assinatura para se plugar ao
 * `<FormularioSoberano>` via Context.
 */

export interface FormularioContextValue {
  valores: Record<string, unknown>;
  erros: Record<string, string | undefined>;
  tocados: Record<string, boolean>;
  enviando: boolean;
  setCampo: (nome: string, valor: unknown) => void;
  marcarTocado: (nome: string) => void;
}

export interface CampoBaseProps {
  nome: string;
  rotulo: string;
  helper?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
  placeholder?: string;
  className?: string;
}

export interface FormularioSucesso {
  ok: true;
  leadId: string | number;
  message: string;
}

export interface FormularioErroValidacao {
  ok: false;
  message: string;
  erros?: Record<string, string>;
}

export type FormularioResposta = FormularioSucesso | FormularioErroValidacao;

export interface EstadoSucessoProps {
  resposta: FormularioSucesso;
  reiniciar?: () => void;
  children?: ReactNode;
}
