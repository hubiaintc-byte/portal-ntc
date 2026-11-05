"use client";

import { useMemo, useState } from "react";

import { LISTAS_FIN, periodosDisponiveis, type FaturamentoFin, type ReceitaFin } from "@ntc/lib";

import { navFinVisivel } from "@/lib/cms/navegacao";
import { temTela } from "@/lib/cms/telas";

import type { PropsTelaFin } from "../ShellFinanceiro";
import { BuscaAba } from "../eventos/AbaReceitas";
import { GavetaFaturamento } from "../eventos/GavetaFaturamento";
import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { Kpi } from "../ui/Kpi";
import { Selo, TagValidar } from "../ui/Selo";
import { moeda } from "../ui/formato";
import { RodapeBarra } from "../visao/BlocosVisao";
import { razao } from "../visao/dadosVisao";
import { ContasFinanceiras } from "./ContasFinanceiras";
import { EscolhaFaturamento } from "./EscolhaFaturamento";
import { GavetaReceitaCorporativa } from "./GavetaReceitaCorporativa";
import { TabelaParcelas } from "./TabelaParcelas";
import {
  agingReceber,
  algumFiltroReceber,
  celulasAging,
  contextoDaParcela,
  csvReceber,
  FILTROS_RECEBER_INICIAIS,
  linhasReceber,
  NOME_CSV_RECEBER,
  OPCOES_ESCOPO,
  OPCOES_SITUACAO_RECEBER,
  receitasCorporativasContratadas,
  serieReceber,
  totaisReceber,
  type FiltrosReceber,
  type LinhaReceber,
} from "./dadosReceber";

/**
 * Receber (`Views.receber` do protótipo FIN-05, mapa §1.4): contas a receber
 * de eventos e da operação corporativa, com as sete grandezas do recebível.
 * Fora da Fase 1: o aviso de fechamento de competência. Mais a lista simples
 * de contas financeiras (spec §3.4). Só lê receitas e faturamentos: quem só
 * tem Receber recebe o livro sem custos nem pagamentos.
 */

interface TelaReceberProps extends PropsTelaFin {
  /** Filtros guardados no casco (o `UI.fin` do protótipo vale para a sessão). */
  filtros: FiltrosReceber;
  aoMudarFiltros: (f: FiltrosReceber) => void;
}

type GavetaFat = {
  f: FaturamentoFin | null;
  modo: "editar" | "receber";
  contexto: { id: string; nome: string };
  receitas?: ReceitaFin[];
};

type ChaveSelect = "periodo" | "escopo" | "centro" | "situacao";

export function TelaReceber({
  livro,
  hojeISO,
  capacidades,
  acesso,
  irPara,
  avisar,
  filtros,
  aoMudarFiltros,
}: TelaReceberProps) {
  const [novaReceita, setNovaReceita] = useState(false);
  const [escolha, setEscolha] = useState(false);
  const [fat, setFat] = useState<GavetaFat | null>(null);
  // Remonta a busca ao "Limpar" (o campo guarda o texto digitado).
  const [limpezas, setLimpezas] = useState(0);

  const temEventos = navFinVisivel(acesso).includes("eventos");

  const linhas = useMemo(() => linhasReceber(livro, filtros, hojeISO), [livro, filtros, hojeISO]);
  const t = totaisReceber(linhas);
  const ag = agingReceber(linhas, hojeISO);
  const serie = serieReceber(linhas);
  const corp = receitasCorporativasContratadas(livro);

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

  const mudar = (p: Partial<FiltrosReceber>) => aoMudarFiltros({ ...filtros, ...p });
  const limpar = () => {
    aoMudarFiltros(FILTROS_RECEBER_INICIAIS);
    setLimpezas((x) => x + 1);
  };

  /** `abrirFatrec(id, mode)`: o evento da receita ou o corporativo. */
  const abrirParcela = (l: LinhaReceber, modo: "editar" | "receber") =>
    setFat({ f: l.f, modo, ...contextoDaParcela(livro, l.r) });

  const exportarCsv = () => {
    const blob = new Blob([csvReceber(linhas)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = NOME_CSV_RECEBER;
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
          <div className="eyebrow">Ambiente 03 · Ciclo de recebimento</div>
          <h1 className="page-title">Receber</h1>
          <div className="page-sub">
            Faturamento, retenções, recebimentos parciais e o valor que pode ser cobrado hoje — de
            eventos e da operação corporativa.
          </div>
        </div>
        <div className="ph-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setNovaReceita(true)}>
            <Icone nome="plus" tamanho="sm" />
            Receita corporativa
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setEscolha(true)}>
            <Icone nome="receipt" tamanho="sm" />
            Registrar faturamento
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
                onChange={(e) => mudar({ [d.chave]: e.target.value } as Partial<FiltrosReceber>)}
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
        {algumFiltroReceber(filtros) && (
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
          placeholder="Buscar NF, parcela, cliente…"
        />
      </div>

      <div className="card kpi-group">
        <div className="kg-title">
          <div className="kg-name" style={{ color: "var(--azul)" }}>
            Recebível
          </div>
          <div className="kg-desc">
            {linhas.length} parcela(s) no recorte
            <br />
            Bruto → retenções → líquido esperado
          </div>
        </div>
        <div className="kg-cells">
          <Kpi
            rotulo="Valor bruto faturado"
            valor={t.bruto}
            rodape={<span className="muted">documento fiscal emitido</span>}
            dica="Valor total faturado, antes de qualquer retenção."
          />
          <Kpi
            rotulo="Retenção tributária"
            valor={t.retTrib}
            rodape={
              <span className="muted">
                <TagValidar texto="VALIDAR COM CONTABILIDADE" />
              </span>
            }
            dica="Retido pelo contratante e recolhido a órgão arrecadador. Não é inadimplência nem despesa do projeto."
          />
          <Kpi
            rotulo="Retenção contratual"
            valor={t.retContr}
            rodape={
              t.aLiberar > 0 ? (
                <Selo cor="dourado">{moeda(t.aLiberar)} a liberar</Selo>
              ) : (
                <span className="muted">garantia contratual</span>
              )
            }
            dica="Garantia retida pelo contratante com liberação prevista em contrato. Não é inadimplência."
          />
          <Kpi
            rotulo="Líquido esperado"
            valor={t.liquido}
            rodape={<span className="muted">bruto − retenções</span>}
            destaque="azul"
            dica="LÍQUIDO ESPERADO = BRUTO − RETENÇÃO TRIBUTÁRIA − RETENÇÃO CONTRATUAL"
          />
        </div>
      </div>
      <div className="card kpi-group">
        <div className="kg-title">
          <div className="kg-name" style={{ color: "var(--verde)" }}>
            Realização
          </div>
          <div className="kg-desc">
            Recebido → a receber
            <br />
            Faturar não é receber
          </div>
        </div>
        <div className="kg-cells">
          <Kpi
            rotulo="Recebido"
            valor={t.recebido}
            rodape={
              <RodapeBarra
                razao={razao(t.recebido, t.liquido)}
                texto="do líquido esperado"
                cor="verde"
              />
            }
            dica="Entrada de caixa efetivamente confirmada."
          />
          <Kpi
            rotulo="Valor a receber"
            valor={t.exigivel}
            rodape={
              ag.vencido > 0 ? (
                <Selo cor="vermelho" icone="alert">
                  {moeda(ag.vencido)} vencido
                </Selo>
              ) : (
                <span className="muted">cobrável hoje</span>
              )
            }
            destaque="azul"
            dica="Líquido esperado menos recebido. Não inclui as retenções, que não são cobráveis do contratante."
          />
          <Kpi
            rotulo="Retenção contratual a liberar"
            valor={t.aLiberar}
            rodape={<span className="muted">não é inadimplência</span>}
            dica="Valor retido como garantia, com liberação futura prevista em contrato."
          />
          <Kpi
            rotulo="Diferença de conciliação"
            valor={t.diferenca}
            rodape={
              t.diferenca !== 0 ? (
                <span className="neg">parcelas liquidadas com divergência</span>
              ) : (
                <span className="muted">sem divergências</span>
              )
            }
            destaque={t.diferenca !== 0 ? "vermelho" : undefined}
            dica="Diferença entre o recebido e o líquido esperado em parcelas marcadas como liquidadas."
          />
        </div>
      </div>

      <div className="section-title">
        <h2>Composição por vencimento</h2>
        <span className="st-line" />
        <span className="st-note">sobre o valor a receber</span>
      </div>
      <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
        <div className="aging">
          {celulasAging(ag).map((c) => (
            <div className="ag-cell" key={c.rotulo}>
              <div className="ag-l">{c.rotulo}</div>
              <div className={`ag-v num${c.neg ? " neg" : ""}`}>{moeda(c.valor, false)}</div>
              <div className="ag-bar azul" aria-hidden="true">
                <i style={{ width: c.largura }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <h3>Valor a receber por mês de vencimento</h3>
            <div className="ch-sub">Já descontadas as retenções</div>
          </div>
        </div>
        <div className="card-body">
          {serie.labels.length ? (
            <Grafico
              tipo="barras"
              dados={serie}
              altura={220}
              rotulo="Valor a receber por mês de vencimento"
              cores={[C.azul]}
            />
          ) : (
            <div className="chart-box short">
              <div className="empty" style={{ padding: 26 }}>
                <p>Nada a receber neste recorte.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TabelaParcelas
        linhas={linhas}
        totais={t}
        livro={livro}
        temEventos={temEventos}
        irPara={irPara}
        aoAbrir={abrirParcela}
        aoExportar={exportarCsv}
      />

      <div className="ctx-note gold" style={{ marginTop: 16 }}>
        <Icone nome="scale" tamanho="sm" />
        <div>
          <b>Retenção não é inadimplência.</b> A retenção tributária é recolhida pelo contratante a
          órgão arrecadador; a retenção contratual é garantia com liberação prevista. Nenhuma das
          duas reduz a receita reconhecida nem é classificada automaticamente como perda, despesa ou
          atraso. Tratamento definitivo: <TagValidar texto="VALIDAR COM CONTABILIDADE" />{" "}
          <TagValidar texto="VALIDAR COM JURÍDICO" />.
        </div>
      </div>

      <ContasFinanceiras
        livro={livro}
        hojeISO={hojeISO}
        podeExcluir={capacidades.excluirFinanceiro}
        saldoSemPagamentos={!temTela(acesso, ["fin.visao-executiva", "fin.eventos", "fin.pagar"])}
        avisar={avisar}
      />

      {novaReceita && (
        <GavetaReceitaCorporativa
          receita={null}
          livro={livro}
          hojeISO={hojeISO}
          aoSalvo={(titulo, descricao) => {
            setNovaReceita(false);
            avisar(titulo, descricao);
          }}
          aoFechar={() => setNovaReceita(false)}
        />
      )}

      {escolha && (
        <EscolhaFaturamento
          eventos={temEventos ? livro.eventos : null}
          temCorporativa={corp.length > 0}
          aoEscolherEvento={(eventoId) => {
            setEscolha(false);
            irPara("eventos", { eventoId, aba: "faturamento" });
          }}
          aoEscolherCorporativo={() => {
            setEscolha(false);
            setFat({
              f: null,
              modo: "editar",
              contexto: { id: "", nome: "Receita corporativa" },
              receitas: corp,
            });
          }}
          aoFechar={() => setEscolha(false)}
        />
      )}

      {fat && (
        <GavetaFaturamento
          faturamento={fat.f}
          modo={fat.modo}
          contexto={fat.contexto}
          receitas={fat.receitas}
          livro={livro}
          hojeISO={hojeISO}
          acesso={acesso}
          avisar={avisar}
          aoSalvo={(titulo, descricao) => {
            setFat(null);
            avisar(titulo, descricao);
          }}
          aoFechar={() => setFat(null)}
        />
      )}
    </>
  );
}
