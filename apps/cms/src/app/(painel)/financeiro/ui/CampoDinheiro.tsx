"use client";

import { useState, type ReactNode } from "react";

import type { Centavos } from "@ntc/lib";

import {
  ERRO_FORMATO_DINHEIRO,
  lerCampoDinheiro,
  textoAoSairDinheiro,
  textoDeCentavos,
} from "./formato";
import { Dica } from "./Selo";

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
 * no campo — para "abc" ou "1,2,3" nunca virarem R$ 0,00 sem aviso. A
 * mensagem só aparece ao sair do campo (digitando "1.234,56" o texto passa
 * por "1." e "1.234,", que não são valores) e some assim que o texto volta a
 * ser um valor; enquanto não é, `aoMudar(null)`.
 */

const ERRO_FORMATO = ERRO_FORMATO_DINHEIRO;

interface CampoDinheiroProps {
  /** `id` do input; o `label` aponta para ele. */
  id: string;
  rotulo: string;
  /** Valor em centavos; `null` = vazio/inválido. */
  valor: Centavos | null;
  /** Chamado a cada digitação: centavos, ou `null` se vazio ou inválido. */
  aoMudar: (valor: Centavos | null) => void;
  /**
   * Validade do texto a cada digitação (`false` = não é valor; vazio vale).
   * O formulário a guarda com `comValidade` e recusa o envio pelo
   * `primeiroDinheiroInvalido` (ver `formato.ts`) — `aoMudar(null)` sozinho
   * não distingue vazio de inválido.
   */
  aoMudarValidade?: (valido: boolean) => void;
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
  /** Ícone de informação no rótulo (`tip` do protótipo). */
  dica?: string;
  /** Aceita valor negativo ("-1.234,56"): só o saldo inicial de conta. */
  comSinal?: boolean;
}

export function CampoDinheiro({
  id,
  rotulo,
  valor,
  aoMudar,
  aoMudarValidade,
  erro,
  obrigatorio,
  opcional,
  ajuda,
  span,
  desabilitado,
  dica,
  comSinal = false,
}: CampoDinheiroProps) {
  const [texto, setTexto] = useState(() => textoDeCentavos(valor));
  const [invalido, setInvalido] = useState(false);
  // O valor de fora mudou sem passar por aqui (ex.: "Usar saldo"): reescreve.
  const [ultimoValor, setUltimoValor] = useState(valor);
  if (valor !== ultimoValor) {
    setUltimoValor(valor);
    if (valor !== lerCampoDinheiro(texto, comSinal).valor) {
      setTexto(textoDeCentavos(valor));
      setInvalido(false);
      // Sem `aoMudarValidade` aqui (é render): quem muda o valor por fora
      // marca a validade do campo como válida junto.
    }
  }

  function digitar(t: string) {
    setTexto(t);
    const { valor: c, valido } = lerCampoDinheiro(t, comSinal);
    // Só limpa o aviso aqui; quem acende é o `sair`.
    if (valido) setInvalido(false);
    setUltimoValor(c);
    aoMudar(c);
    aoMudarValidade?.(valido);
  }

  function sair() {
    setInvalido(!lerCampoDinheiro(texto, comSinal).valido);
    setTexto(textoAoSairDinheiro(texto, comSinal));
  }

  const mensagem = invalido ? ERRO_FORMATO : (erro ?? "");
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const classe = ["fld", span ? `s${span}` : "", mensagem ? "invalid" : ""]
    .filter(Boolean)
    .join(" ");

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
        {dica && <Dica texto={dica} />}
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
          aria-describedby={
            [ajuda ? idAjuda : "", mensagem ? idErro : ""].filter(Boolean).join(" ") || undefined
          }
          onChange={(e) => digitar(e.target.value)}
          onBlur={sair}
        />
      </div>
      {ajuda && (
        <div className="help" id={idAjuda}>
          {ajuda}
        </div>
      )}
      {mensagem && (
        <div className="err" role="alert" id={idErro}>
          {mensagem}
        </div>
      )}
    </div>
  );
}
