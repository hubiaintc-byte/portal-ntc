"use client";

import { useState } from "react";

import { nomeCentro, type CustoFin } from "@ntc/lib";

import { excluirCustoFinAcao } from "../../acoesFinanceiro";
import { ExclusaoLancamento } from "../eventos/ExclusaoLancamento";
import { Icone } from "../ui/Icone";
import { SeloStatus } from "../ui/Selo";
import { Tabela, type ColunaTabela } from "../ui/Tabela";
import type { MostrarToast } from "../ui/Toasts";
import { moeda } from "../ui/formato";
import {
  competenciaDoCusto,
  totaisDespesasCorporativas,
  type LinhaDespesaCorp,
} from "./dadosPagar";

/**
 * "Despesas corporativas" de Pagar (Ruling R12; o protótipo não tinha esta
 * lista): as despesas sem evento, inclusive previstas e ainda sem título,
 * com Editar (gaveta da despesa corporativa, com Histórico) e Excluir só
 * para administrador. Despesa com título é recusada pelo servidor com a
 * mensagem do protótipo ("Este custo possui N pagamento(s) vinculado(s)…").
 */

interface TabelaDespesasCorporativasProps {
  linhas: LinhaDespesaCorp[];
  podeExcluir: boolean;
  aoEditar: (c: CustoFin) => void;
  avisar: MostrarToast;
}

export function TabelaDespesasCorporativas({
  linhas,
  podeExcluir,
  aoEditar,
  avisar,
}: TabelaDespesasCorporativasProps) {
  const [excluindo, setExcluindo] = useState<CustoFin | null>(null);
  const t = totaisDespesasCorporativas(linhas);

  const colunas: ColunaTabela<LinhaDespesaCorp>[] = [
    {
      id: "id",
      titulo: "ID",
      className: "idc",
      celula: ({ c }) => c.id,
      rodape: "Total do recorte",
    },
    {
      id: "despesa",
      titulo: "Despesa",
      celula: ({ c }) => (
        <>
          <div className="strong">{c.descricao}</div>
          <div className="sub">
            {c.categoria}
            {c.fornecedor ? ` · ${c.fornecedor}` : ""}
          </div>
        </>
      ),
    },
    {
      id: "centro",
      titulo: "Centro de custo",
      celula: ({ c }) => (
        <>
          {c.centroCusto}
          <div className="sub">
            {nomeCentro(c.centroCusto)}
            {c.compartilhada && (
              <>
                {" · "}
                <b style={{ color: "#7A5E0F" }}>compartilhada</b>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      id: "competencia",
      titulo: "Competência",
      className: "num",
      celula: ({ c }) => competenciaDoCusto(c),
    },
    {
      id: "status",
      titulo: "Status",
      celula: ({ f }) => <SeloStatus status={f.status} tipo="financeiro" />,
    },
    {
      id: "previsto",
      titulo: "Previsto",
      alinhar: "dir",
      className: "num",
      celula: ({ f }) => moeda(f.previsto),
      rodape: <span className="num">{moeda(t.previsto)}</span>,
    },
    {
      id: "realizado",
      titulo: "Realizado",
      alinhar: "dir",
      className: "num",
      celula: ({ f }) => moeda(f.realizado),
      rodape: <span className="num">{moeda(t.realizado)}</span>,
    },
    {
      id: "pago",
      titulo: "Pago",
      alinhar: "dir",
      className: "num",
      celula: ({ f }) => moeda(f.pago),
      rodape: <span className="num">{moeda(t.pago)}</span>,
    },
    {
      id: "aPagar",
      titulo: "A pagar",
      alinhar: "dir",
      className: "num strong",
      celula: ({ f }) => moeda(f.aPagar),
      rodape: <span className="num">{moeda(t.aPagar)}</span>,
    },
    {
      id: "acoes",
      titulo: <span className="sr-only">Ações</span>,
      className: "actions",
      celula: ({ c }) => (
        <>
          <button
            type="button"
            className="btn btn-ghost btn-icon sm"
            aria-label={`Editar ${c.id}`}
            onClick={() => aoEditar(c)}
          >
            <Icone nome="edit" />
          </button>
          {podeExcluir && (
            <button
              type="button"
              className="btn btn-ghost btn-icon sm"
              aria-label={`Excluir ${c.id}`}
              onClick={() => setExcluindo(c)}
            >
              <Icone nome="trash" />
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head" style={{ paddingBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 18 }}>Despesas corporativas</h3>
          <div className="ch-sub">{linhas.length} despesa(s) · sem evento vinculado</div>
        </div>
      </div>
      <Tabela
        colunas={colunas}
        linhas={linhas}
        chave={({ c }) => c.id}
        rotulo="Despesas corporativas no recorte"
        vazio={
          <div className="empty" style={{ padding: 26 }}>
            <p>Nenhuma despesa corporativa neste recorte.</p>
          </div>
        }
      />
      {excluindo && (
        <ExclusaoLancamento
          tipo="custo"
          rotulo={`${excluindo.id} · ${excluindo.descricao}`}
          excluir={() => excluirCustoFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </div>
  );
}
