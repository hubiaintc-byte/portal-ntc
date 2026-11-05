"use client";

import { useState, type ReactNode } from "react";

import { paraCentavos, type Centavos } from "@ntc/lib";

import { textoDeCentavos } from "./formato";

export { textoDeCentavos };

/**
 * Campo de valor em reais do protótipo FIN-05 (`type: 'money'` do
 * `FormEngine`): `.fld > label + .money > input` com "R$" à esquerda,
 * alinhado à direita, teclado decimal, "0,00" de exemplo. O texto digitado
 * vira centavos por `paraCentavos` ("1.234,56", "1234,5", "R$ 10"); ao sair
 * do campo o valor é reescrito no formato brasileiro, como no protótipo.
 *
 * Diferença deliberada do protótipo: lá, texto inválido virava 0 em
 * silêncio (`parseNum`); aqui ele é recusado — `aoMudar(null)` e a mensagem
 * no campo — para "abc" ou "1,2,3" nunca virarem R$ 0,00 sem aviso.
 */

const ERRO_FORMATO = "Valor inválido. Use o formato 1.234,56.";

interface CampoDinheiroProps {
  /** `id` do input; o `label` aponta para ele. */
  id: string;
  rotulo: string;
  /** Valor em centavos; `null` = vazio/inválido. */
  valor: Centavos | null;
  /** Chamado a cada digitação: centavos, ou `null` se vazio ou inválido. */
  aoMudar: (valor: Centavos | null) => void;
  /** Erro do campo vindo da validação (`ErroValidacao.campo`). */
  erro?: string | null;
  /** Asterisco vermelho (`.req`). */
  obrigatorio?: boolean;
  /** "(opcional)" (`.opt`). */
  opcional?: boolean;
  /** Texto de ajuda abaixo (`.help`). */
  ajuda?: ReactNode;
  /** Largura na grade `.form` de 6 colunas (`.s1`…`.s4`; sem = linha inteira). */
  span?: 1 | 2 | 3 | 4;
  desabilitado?: boolean;
}

export function CampoDinheiro({
  id,
  rotulo,
  valor,
  aoMudar,
  erro,
  obrigatorio,
  opcional,
  ajuda,
  span,
  desabilitado,
}: CampoDinheiroProps) {
  const [texto, setTexto] = useState(() => textoDeCentavos(valor));
  const [invalido, setInvalido] = useState(false);
  // O valor de fora mudou sem passar por aqui (ex.: "Usar saldo"): reescreve.
  const [ultimoValor, setUltimoValor] = useState(valor);
  if (valor !== ultimoValor) {
    setUltimoValor(valor);
    if (valor !== (texto.trim() ? paraCentavos(texto) : null)) {
      setTexto(textoDeCentavos(valor));
      setInvalido(false);
    }
  }

  function digitar(t: string) {
    setTexto(t);
    if (!t.trim()) {
      setInvalido(false);
      setUltimoValor(null);
      aoMudar(null);
      return;
    }
    const c = paraCentavos(t);
    setInvalido(c === null);
    setUltimoValor(c);
    aoMudar(c);
  }

  function sair() {
    const c = texto.trim() ? paraCentavos(texto) : null;
    if (c !== null) setTexto(textoDeCentavos(c));
  }

  const mensagem = invalido ? ERRO_FORMATO : (erro ?? "");
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const classe = ["fld", span ? `s${span}` : "", mensagem ? "invalid" : ""].filter(Boolean).join(" ");

  return (
    <div className={classe} data-f={id}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio ? (
          <>
            {" "}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        ) : opcional ? (
          <>
            {" "}
            <span className="opt">(opcional)</span>
          </>
        ) : null}
      </label>
      <div className="money">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={texto}
          disabled={desabilitado}
          required={obrigatorio}
          aria-invalid={mensagem ? true : undefined}
          aria-describedby={[ajuda ? idAjuda : "", idErro].filter(Boolean).join(" ")}
          onChange={(e) => digitar(e.target.value)}
          onBlur={sair}
        />
      </div>
      {ajuda && (
        <div className="help" id={idAjuda}>
          {ajuda}
        </div>
      )}
      <div className="err" role="alert" id={idErro}>
        {mensagem}
      </div>
    </div>
  );
}
