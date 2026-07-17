"use client";

import { useId } from "react";

import type { OpcaoLista } from "@ntc/lib";

/** Campos de formulário do módulo CRM — mesmo visual dos campos do editor de evento. */

interface CampoTextoProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  tipo?: "text" | "email";
  obrigatorio?: boolean;
  curto?: boolean;
}

export function CampoTexto({ rotulo, valor, onMudar, tipo = "text", obrigatorio, curto }: CampoTextoProps) {
  const id = useId();
  return (
    <div className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        type={tipo}
        value={valor}
        required={obrigatorio}
        onChange={(e) => onMudar(e.target.value)}
      />
    </div>
  );
}

interface CampoSenhaProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  obrigatorio?: boolean;
  minimo?: number;
  curto?: boolean;
  desabilitado?: boolean;
}

export function CampoSenha({
  rotulo,
  valor,
  onMudar,
  autoComplete,
  obrigatorio,
  minimo,
  curto,
  desabilitado,
}: CampoSenhaProps) {
  const id = useId();
  return (
    <div className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        type="password"
        autoComplete={autoComplete}
        value={valor}
        required={obrigatorio}
        minLength={minimo}
        disabled={desabilitado}
        onChange={(e) => onMudar(e.target.value)}
      />
    </div>
  );
}

interface CampoSelectProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  opcoes: OpcaoLista[];
  curto?: boolean;
}

export function CampoSelect({ rotulo, valor, onMudar, opcoes, curto }: CampoSelectProps) {
  const id = useId();
  return (
    <div className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <select id={id} value={valor} onChange={(e) => onMudar(e.target.value)}>
        <option value="">—</option>
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CampoNumeroProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
  curto?: boolean;
}

export function CampoNumero({ rotulo, valor, onMudar, curto }: CampoNumeroProps) {
  const id = useId();
  return (
    <div className={`pcms-field${curto ? " pcms-field--curto" : ""}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type="text" inputMode="decimal" value={valor} onChange={(e) => onMudar(e.target.value)} />
    </div>
  );
}

interface CampoDataProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
}

export function CampoData({ rotulo, valor, onMudar }: CampoDataProps) {
  const id = useId();
  return (
    <div className="pcms-field pcms-field--curto">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} type="date" value={valor} onChange={(e) => onMudar(e.target.value)} />
    </div>
  );
}

interface CampoCheckProps {
  rotulo: string;
  marcado: boolean;
  onMudar: (v: boolean) => void;
}

export function CampoCheck({ rotulo, marcado, onMudar }: CampoCheckProps) {
  const id = useId();
  return (
    <div className="pcms-field pcms-field--check">
      <label htmlFor={id}>
        <input id={id} type="checkbox" checked={marcado} onChange={(e) => onMudar(e.target.checked)} />
        {rotulo}
      </label>
    </div>
  );
}

interface CampoAreaProps {
  rotulo: string;
  valor: string;
  onMudar: (v: string) => void;
}

export function CampoArea({ rotulo, valor, onMudar }: CampoAreaProps) {
  const id = useId();
  return (
    <div className="pcms-field">
      <label htmlFor={id}>{rotulo}</label>
      <textarea id={id} rows={3} value={valor} onChange={(e) => onMudar(e.target.value)} />
    </div>
  );
}

export function AvisoForm({ erro }: { erro: string | null }) {
  if (erro === null) return null;
  return (
    <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">
      {erro}
    </p>
  );
}

interface BarraFormProps {
  titulo: string;
  salvando: boolean;
  onCancelar: () => void;
  eyebrow?: string;
}

export function BarraForm({ titulo, salvando, onCancelar, eyebrow = "Comercial" }: BarraFormProps) {
  return (
    <div className="pcms-pagehead">
      <div>
        <p className="pcms-pagehead__eyebrow">{eyebrow}</p>
        <h1>{titulo}</h1>
      </div>
      <div className="pcms-pagehead__acoes">
        <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="pcms-btn" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
