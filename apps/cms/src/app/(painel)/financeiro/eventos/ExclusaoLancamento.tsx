"use client";

import { useState } from "react";

import type { excluirCustoFinAcao } from "../../acoesFinanceiro";
import { Confirmacao } from "../ui/Confirmacao";
import type { MostrarToast } from "../ui/Toasts";

type ResultadoFin = Awaited<ReturnType<typeof excluirCustoFinAcao>>;

/**
 * `deleteFlow(kind, id, label, fn)` do protótipo: confirma, exclui e avisa
 * ("Custo excluído(a)"); recusa do servidor vira "Exclusão bloqueada".
 */
export function ExclusaoLancamento({
  tipo,
  rotulo,
  excluir,
  avisar,
  aoFechar,
}: {
  /** "custo", "faturamento", "pagamento" (o `kind` do protótipo). */
  tipo: string;
  /** "id · descrição". */
  rotulo: string;
  excluir: () => Promise<ResultadoFin>;
  avisar: MostrarToast;
  aoFechar: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const confirmar = async () => {
    setOcupado(true);
    try {
      const res = await excluir();
      aoFechar();
      if (res.ok) avisar(`${tipo[0]!.toUpperCase()}${tipo.slice(1)} excluído(a)`, rotulo);
      else avisar("Exclusão bloqueada", res.erro, "erro");
    } catch {
      aoFechar();
      avisar("Não foi possível excluir", "Tente de novo.", "erro");
    } finally {
      setOcupado(false);
    }
  };
  return (
    <Confirmacao
      titulo={`Excluir ${tipo}?`}
      perigo
      rotuloConfirmar="Excluir"
      ocupado={ocupado}
      aoConfirmar={() => void confirmar()}
      aoFechar={aoFechar}
    >
      <b>{rotulo}</b>
      <br />
      <br />
      Esta ação remove o lançamento e recalcula os indicadores.
    </Confirmacao>
  );
}
