"use client";

import { useState } from "react";

import { nomeCentro, type ReceitaFin } from "@ntc/lib";

import { excluirReceitaFinAcao } from "../../acoesFinanceiro";
import { ExclusaoLancamento } from "../eventos/ExclusaoLancamento";
import { Icone } from "../ui/Icone";
import { SeloStatus } from "../ui/Selo";
import { Tabela, type ColunaTabela } from "../ui/Tabela";
import type { MostrarToast } from "../ui/Toasts";
import { moeda } from "../ui/formato";
import {
  competenciaCurta,
  totaisReceitasCorporativas,
  type LinhaReceitaCorp,
} from "./dadosReceber";

/**
 * "Receitas corporativas" de Receber (Ruling R12; o protótipo não tinha esta
 * lista): as receitas sem evento, inclusive previstas e ainda não faturadas,
 * com Editar (gaveta da receita corporativa, com Histórico) e Excluir só
 * para administrador. Receita com faturamento é recusada pelo servidor com a
 * mensagem do protótipo ("Esta receita possui N faturamento(s)…").
 */

interface TabelaReceitasCorporativasProps {
  linhas: LinhaReceitaCorp[];
  podeExcluir: boolean;
  aoEditar: (r: ReceitaFin) => void;
  avisar: MostrarToast;
}

export function TabelaReceitasCorporativas({
  linhas,
  podeExcluir,
  aoEditar,
  avisar,
}: TabelaReceitasCorporativasProps) {
  const [excluindo, setExcluindo] = useState<ReceitaFin | null>(null);
  const t = totaisReceitasCorporativas(linhas);

  const colunas: ColunaTabela<LinhaReceitaCorp>[] = [
    {
      id: "id",
      titulo: "ID",
      className: "idc",
      celula: ({ r }) => r.id,
      rodape: "Total do recorte",
    },
    {
      id: "cliente",
      titulo: "Cliente / origem",
      celula: ({ r }) => (
        <>
          <div className="strong">{r.cliente}</div>
          <div className="sub">
            {r.origem}
            {r.referencia ? ` · ${r.referencia}` : ""}
          </div>
        </>
      ),
    },
    {
      id: "centro",
      titulo: "Centro de custo",
      celula: ({ r }) => (
        <>
          {r.centroCusto}
          <div className="sub">{nomeCentro(r.centroCusto)}</div>
        </>
      ),
    },
    {
      id: "tipo",
      titulo: "Tipo de receita",
      celula: ({ r }) => (
        <>
          {r.tipoReceita}
          <div className="sub">comp. {competenciaCurta(r.competencia)}</div>
        </>
      ),
    },
    {
      id: "status",
      titulo: "Situação",
      celula: ({ m }) => <SeloStatus status={m.status} tipo="financeiro" />,
    },
    {
      id: "valor",
      titulo: "Contratado",
      alinhar: "dir",
      className: "num",
      celula: ({ m }) => moeda(m.valor),
      rodape: <span className="num">{moeda(t.valor)}</span>,
    },
    {
      id: "faturado",
      titulo: "Faturado",
      alinhar: "dir",
      className: "num",
      celula: ({ m }) => moeda(m.faturado),
      rodape: <span className="num">{moeda(t.faturado)}</span>,
    },
    {
      id: "aFaturar",
      titulo: "A faturar",
      alinhar: "dir",
      className: "num strong",
      celula: ({ m }) => moeda(m.aFaturar),
      rodape: <span className="num">{moeda(t.aFaturar)}</span>,
    },
    {
      id: "acoes",
      titulo: <span className="sr-only">Ações</span>,
      className: "actions",
      celula: ({ r }) => (
        <>
          <button
            type="button"
            className="btn btn-ghost btn-icon sm"
            aria-label={`Editar ${r.id}`}
            onClick={() => aoEditar(r)}
          >
            <Icone nome="edit" />
          </button>
          {podeExcluir && (
            <button
              type="button"
              className="btn btn-ghost btn-icon sm"
              aria-label={`Excluir ${r.id}`}
              onClick={() => setExcluindo(r)}
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
          <h3 style={{ fontSize: 18 }}>Receitas corporativas</h3>
          <div className="ch-sub">{linhas.length} receita(s) · sem evento vinculado</div>
        </div>
      </div>
      <Tabela
        colunas={colunas}
        linhas={linhas}
        chave={({ r }) => r.id}
        rotulo="Receitas corporativas no recorte"
        vazio={
          <div className="empty" style={{ padding: 26 }}>
            <p>Nenhuma receita corporativa neste recorte.</p>
          </div>
        }
      />
      {excluindo && (
        <ExclusaoLancamento
          tipo="receita"
          rotulo={`${excluindo.id} · ${excluindo.cliente}`}
          excluir={() => excluirReceitaFinAcao(excluindo.id)}
          avisar={avisar}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </div>
  );
}
