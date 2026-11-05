"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { LISTAS_FIN, periodosDisponiveis, type CustoFin, type PagamentoFin } from "@ntc/lib";

import { navFinVisivel } from "@/lib/cms/navegacao";

import type { PropsTelaFin } from "../ShellFinanceiro";
import { BuscaAba } from "../eventos/AbaReceitas";
import { GavetaPagamento } from "../eventos/GavetaPagamento";
import { EscolhaFaturamento, type TextosEscolhaOrigem } from "../receber/EscolhaFaturamento";
import { celulasAging, OPCOES_ESCOPO, OPCOES_SITUACAO_RECEBER } from "../receber/dadosReceber";
import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { Kpi } from "../ui/Kpi";
import { Selo } from "../ui/Selo";
import { moeda, porcentagem } from "../ui/formato";
import { RodapeBarra } from "../visao/BlocosVisao";
import { razao } from "../visao/dadosVisao";
import { EstruturaCompartilhada } from "./EstruturaCompartilhada";
import { GavetaDespesaCorporativa } from "./GavetaDespesaCorporativa";
import { TabelaDespesasCorporativas } from "./TabelaDespesasCorporativas";
import { TabelaTitulos } from "./TabelaTitulos";
import {
  agingPagar,
  algumFiltroPagar,
  csvPagar,
  despesasCorporativas,
  estruturaCompartilhada,
  FILTROS_PAGAR_INICIAIS,
  linhasDespesasCorporativas,
  linhasPagar,
  NOME_CSV_PAGAR,
  recortePagar,
  seriePagar,
  totaisPagar,
  type FiltrosPagar,
} from "./dadosPagar";

/**
 * Pagar (`Views.pagar` do protótipo FIN-05, mapa §1.5): obrigações
 * assumidas, baixas parciais e saldo devedor, de eventos e da estrutura
 * corporativa. Fora da Fase 1: títulos de comissão. Mais a lista
 * "Despesas corporativas" (Ruling R12). Só lê custos, pagamentos, eventos e
 * contas: quem só tem Pagar recebe o livro sem receitas nem faturamentos.
 * Não mostra saldo de conta (só o nome da conta debitada), então não usa
 * `saldosContas`.
 */

interface TelaPagarProps extends PropsTelaFin {
  /** Filtros guardados no casco (o `UI.pag` do protótipo vale para a sessão). */
  filtros: FiltrosPagar;
  /** Setter do casco: atualização funcional, para a busca atrasada não desfazer um select. */
  aoMudarFiltros: Dispatch<SetStateAction<FiltrosPagar>>;
}

type GavetaTitulo = {
  p: PagamentoFin | null;
  modo: "editar" | "baixar";
  contexto: { id: string; nome: string };
  custos?: CustoFin[];
};

type ChaveSelect = "periodo" | "escopo" | "centro" | "situacao";

/** `openTituloEscolha` do protótipo; o passo do evento é do portal (como em Receber). */
const TEXTOS_ESCOLHA_TITULO: TextosEscolhaOrigem = {
  eyebrow: "Novo título a pagar",
  titulo: "Qual é a origem da despesa?",
  eventoDescricao: "Programar pagamento de um custo da carteira",
  corporativoRotulo: "Despesa corporativa",
  corporativoDescricao: "Programar pagamento de despesa sem evento",
  corporativoVazio: "Nenhuma despesa corporativa registrada",
  eventoAjuda: "Abre o evento na aba Pagamentos.",
  eventoBotao: "Abrir pagamentos do evento",
};

const CONTEXTO_CORPORATIVO = { id: "", nome: "Despesa corporativa" };

export function TelaPagar({
  livro,
  hojeISO,
  capacidades,
  acesso,
  irPara,
  avisar,
  filtros,
  aoMudarFiltros,
}: TelaPagarProps) {
  // Gaveta da despesa corporativa: `c: null` = nova.
  const [despesa, setDespesa] = useState<{ c: CustoFin | null } | null>(null);
  const [escolha, setEscolha] = useState(false);
  const [titulo, setTitulo] = useState<GavetaTitulo | null>(null);
  // Remonta a busca ao "Limpar" (o campo guarda o texto digitado).
  const [limpezas, setLimpezas] = useState(0);

  const temEventos = navFinVisivel(acesso).includes("eventos");

  const sc = useMemo(() => recortePagar(livro, filtros), [livro, filtros]);
  const linhas = useMemo(
    () => linhasPagar(livro, filtros, hojeISO, sc),
    [livro, filtros, hojeISO, sc],
  );
  const t = totaisPagar(livro, sc, linhas);
  const ag = agingPagar(linhas, hojeISO);
  const serie = seriePagar(linhas);
  const compart = estruturaCompartilhada(sc);
  const corp = despesasCorporativas(livro);
  const despesasCorp = useMemo(() => linhasDespesasCorporativas(livro, filtros), [livro, filtros]);

  const defs: {
    chave: ChaveSelect;
    cap: string;
    todos: string;
    opcoes: readonly (readonly [string, string])[];
  }[] = [
    {
      chave: "periodo",
      cap: "Período",
      todos: "Todo o período",
      opcoes: periodosDisponiveis(livro, hojeISO)
        .filter((p) => p.valor !== "all")
        .map((p) => [p.valor, p.rotulo] as const),
    },
    { chave: "escopo", cap: "Escopo", todos: "Eventos e corporativo", opcoes: OPCOES_ESCOPO },
    {
      chave: "centro",
      cap: "Centro de custo",
      todos: "Todos os centros",
      opcoes: LISTAS_FIN.centrosCusto.map((c) => [c.cod, `${c.cod} · ${c.nome}`] as const),
    },
    {
      chave: "situacao",
      cap: "Situação",
      todos: "Todas as situações",
      opcoes: OPCOES_SITUACAO_RECEBER,
    },
  ];

  const mudar = (p: Partial<FiltrosPagar>) => aoMudarFiltros((s) => ({ ...s, ...p }));
  const limpar = () => {
    aoMudarFiltros(FILTROS_PAGAR_INICIAIS);
    setLimpezas((x) => x + 1);
  };

  /** `abrirPagamento(id, mode)`: o evento do título, ou o corporativo com as despesas sem evento. */
  const abrirTitulo = (p: PagamentoFin, modo: "editar" | "baixar") => {
    if (p.eventoId) {
      const ev = livro.eventos.find((e) => e.id === p.eventoId);
      setTitulo({ p, modo, contexto: { id: p.eventoId, nome: ev?.nome ?? p.eventoId } });
    } else setTitulo({ p, modo, contexto: CONTEXTO_CORPORATIVO, custos: corp });
  };

  const exportarCsv = () => {
    const blob = new Blob([csvPagar(linhas)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = NOME_CSV_PAGAR;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    avisar("Exportação gerada", `${linhas.length} linha(s)`);
  };

  return (
    <>
      <div className="page-head">
        <div className="ph-text">
          <div className="eyebrow">Ambiente 04 · Ciclo de pagamento</div>
          <h1 className="page-title">Pagar</h1>
          <div className="page-sub">
            Obrigações assumidas, baixas parciais e saldo devedor — de eventos e da estrutura
            corporativa.
          </div>
        </div>
        <div className="ph-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDespesa({ c: null })}
          >
            <Icone nome="plus" tamanho="sm" />
            Despesa corporativa
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setEscolha(true)}>
            <Icone nome="receipt" tamanho="sm" />
            Registrar título
          </button>
        </div>
      </div>

      <div className="filterbar">
        <span className="fb-label">
          <Icone nome="filter" tamanho="xs" /> Recorte
        </span>
        {defs.map((d) => {
          const valor = filtros[d.chave] || "all";
          return (
            <div className="fsel" key={d.chave}>
              <span className="fcap">{d.cap}</span>
              <select
                className={valor !== "all" ? "set" : undefined}
                aria-label={d.cap}
                value={valor}
                onChange={(e) => mudar({ [d.chave]: e.target.value } as Partial<FiltrosPagar>)}
              >
                <option value="all">{d.todos}</option>
                {d.opcoes.map(([v, rot]) => (
                  <option key={v} value={v}>
                    {rot}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        {algumFiltroPagar(filtros) && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={limpar}>
            <Icone nome="x" tamanho="xs" />
            Limpar
          </button>
        )}
        <span className="fb-spacer" />
        <BuscaAba
          key={limpezas}
          valor={filtros.q}
          aoMudar={(q) => mudar({ q })}
          placeholder="Buscar título, fornecedor, descrição…"
        />
      </div>

      <div className="ctx-note" style={{ marginBottom: 16 }}>
        <Icone nome="info" tamanho="sm" />
        <div>
          <b>A obrigação existe antes do pagamento.</b> A despesa é reconhecida pela competência em
          que foi incorrida; o título registra a obrigação a vencer; o pagamento é a saída de caixa.
          Os três momentos são distintos e nenhum deles é derivado automaticamente do outro.
        </div>
      </div>

      <div className="card kpi-group">
        <div className="kg-title">
          <div className="kg-name" style={{ color: "var(--vermelho)" }}>
            Despesa e obrigação
          </div>
          <div className="kg-desc">
            {t.lancamentos} lançamento(s) · {linhas.length} título(s)
          </div>
        </div>
        <div className="kg-cells">
          <Kpi
            rotulo="Despesa incorrida"
            valor={t.incorrido}
            rodape={
              <span className="muted">
                {t.orcado
                  ? `${porcentagem(razao(t.incorrido, t.orcado), 0)} do orçado`
                  : "competência econômica"}
              </span>
            }
            dica="Custo/despesa reconhecido por competência. Não é saída de caixa."
          />
          <Kpi
            rotulo="Obrigações registradas"
            valor={t.obrigacoes}
            rodape={
              t.semTitulo > 0 ? (
                <Selo cor="dourado">{moeda(t.semTitulo)} sem título</Selo>
              ) : (
                <span className="muted">títulos emitidos</span>
              )
            }
            dica="Soma dos títulos a pagar registrados. Despesa incorrida sem título é obrigação ainda não formalizada."
          />
          <Kpi
            rotulo="Pago"
            valor={t.pago}
            rodape={
              <RodapeBarra razao={razao(t.pago, t.obrigacoes)} texto="das obrigações" cor="verde" />
            }
            dica="Saída de caixa efetiva."
          />
          <Kpi
            rotulo="Valor a pagar"
            valor={t.saldo}
            rodape={
              ag.vencido > 0 ? (
                <Selo cor="vermelho" icone="alert">
                  {moeda(ag.vencido)} vencido
                </Selo>
              ) : (
                <span className="muted">títulos em aberto</span>
              )
            }
            destaque="vermelho"
            dica="Soma dos saldos dos títulos (valor do título − valor pago)."
          />
        </div>
      </div>

      <div className="section-title">
        <h2>Composição por vencimento</h2>
        <span className="st-line" />
        <span className="st-note">sobre o valor a pagar</span>
      </div>
      <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
        <div className="aging">
          {celulasAging(ag).map((c) => (
            <div className="ag-cell" key={c.rotulo}>
              <div className="ag-l">{c.rotulo}</div>
              <div className={`ag-v num${c.neg ? " neg" : ""}`}>{moeda(c.valor, false)}</div>
              <div className="ag-bar vermelho" aria-hidden="true">
                <i style={{ width: c.largura }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <h3>Obrigações por mês de vencimento</h3>
            <div className="ch-sub">Saldo devedor dos títulos em aberto</div>
          </div>
        </div>
        <div className="card-body">
          {serie.labels.length ? (
            <Grafico
              tipo="barras"
              dados={serie}
              altura={220}
              rotulo="Obrigações por mês de vencimento"
              cores={[C.vermelho]}
            />
          ) : (
            <div className="chart-box short">
              <div className="empty" style={{ padding: 26 }}>
                <p>Nenhum saldo a pagar no recorte.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TabelaTitulos
        linhas={linhas}
        totais={t}
        livro={livro}
        temEventos={temEventos}
        irPara={irPara}
        aoAbrir={abrirTitulo}
        aoExportar={exportarCsv}
      />

      <EstruturaCompartilhada dados={compart} />

      {filtros.escopo !== "eventos" && (
        <TabelaDespesasCorporativas
          linhas={despesasCorp}
          podeExcluir={capacidades.excluirFinanceiro}
          aoEditar={(c) => setDespesa({ c })}
          avisar={avisar}
        />
      )}

      {despesa && (
        <GavetaDespesaCorporativa
          custo={despesa.c}
          livro={livro}
          hojeISO={hojeISO}
          aoSalvo={(tit, descricao) => {
            setDespesa(null);
            avisar(tit, descricao);
          }}
          aoFechar={() => setDespesa(null)}
        />
      )}

      {escolha && (
        <EscolhaFaturamento
          textos={TEXTOS_ESCOLHA_TITULO}
          eventos={temEventos ? livro.eventos : null}
          temCorporativa={corp.length > 0}
          aoEscolherEvento={(eventoId) => {
            setEscolha(false);
            irPara("eventos", { eventoId, aba: "pagamentos" });
          }}
          aoEscolherCorporativo={() => {
            setEscolha(false);
            setTitulo({ p: null, modo: "editar", contexto: CONTEXTO_CORPORATIVO, custos: corp });
          }}
          aoFechar={() => setEscolha(false)}
        />
      )}

      {titulo && (
        <GavetaPagamento
          pagamento={titulo.p}
          modo={titulo.modo}
          contexto={titulo.contexto}
          custos={titulo.custos}
          livro={livro}
          hojeISO={hojeISO}
          acesso={acesso}
          avisar={avisar}
          aoSalvo={(tit, descricao) => {
            setTitulo(null);
            avisar(tit, descricao);
          }}
          aoFechar={() => setTitulo(null)}
        />
      )}
    </>
  );
}
