"use client";

import { useMemo, useState } from "react";

import { LISTAS_FIN, periodosDisponiveis, type AlertaCorporativo } from "@ntc/lib";

import { navFinVisivel, type TelaFinId } from "@/lib/cms/navegacao";

import type { PropsTelaFin } from "../ShellFinanceiro";
import { Icone } from "../ui/Icone";
import { Kpi } from "../ui/Kpi";
import { Selo } from "../ui/Selo";
import { inteiro, moeda, porcentagem, tipoCurto } from "../ui/formato";
import { GavetaAlertas, ItemAlerta, ResumoAlertas, type Alerta } from "./Alertas";
import { AnaliseVisao } from "./AnaliseVisao";
import { WizardEvento } from "../eventos/WizardEvento";
import { HeroResultado, RodapeBarra } from "./BlocosVisao";
import { CarteiraEventos } from "./CarteiraEventos";
import {
  algumFiltro,
  FILTROS_VISAO_INICIAIS,
  montarVisaoExecutiva,
  razao,
  type FiltrosVisao,
} from "./dadosVisao";

/**
 * Visão Executiva (`Views.dashboard` do protótipo FIN-05, mapa §1.1), na
 * ordem do protótipo. Fora da Fase 1: o bloco "Comissões comerciais" e a
 * célula de comissões do `resultHero`. Links para Eventos, Receber e Pagar só
 * aparecem para quem tem a tela; alerta corporativo com destino "resultado"
 * (tela da Fase 2) aparece sem link.
 */

type ChaveFiltro = keyof FiltrosVisao;

interface DefFiltro {
  chave: ChaveFiltro;
  cap: string;
  todos: string;
  opcoes: readonly (readonly [string, string])[];
}

interface TelaVisaoExecutivaProps extends PropsTelaFin {
  /** Filtros guardados no casco (o `UI.dash` do protótipo vale para a sessão, não só para a tela). */
  filtros: FiltrosVisao;
  aoMudarFiltros: (f: FiltrosVisao) => void;
}

export function TelaVisaoExecutiva({
  livro,
  hojeISO,
  acesso,
  irPara,
  filtros,
  aoMudarFiltros,
}: TelaVisaoExecutivaProps) {
  const [gaveta, setGaveta] = useState<"alertas" | "corporativas" | null>(null);
  const [novoEvento, setNovoEvento] = useState(false);

  const telas = navFinVisivel(acesso);
  const tem = (t: TelaFinId) => telas.includes(t);

  const v = useMemo(() => montarVisaoExecutiva(livro, filtros, hojeISO), [livro, filtros, hojeISO]);
  const { carteira, geral: K, eventos: KE, corporativo: KC, pendenciasCorporativas: corpAl } = v;
  const { tot, rows, alerts } = carteira;

  // `FILTER_DEFS` do protótipo; o período vem do livro (`periodosDisponiveis`).
  const defs: DefFiltro[] = [
    {
      chave: "periodo",
      cap: "Período",
      todos: "Todo o período",
      opcoes: periodosDisponiveis(livro, hojeISO)
        .filter((p) => p.valor !== "all")
        .map((p) => [p.valor, p.rotulo] as const),
    },
    {
      chave: "vertical",
      cap: "Vertical",
      todos: "Todas as verticais",
      opcoes: LISTAS_FIN.verticais.map((x) => [x, x] as const),
    },
    {
      chave: "modalidade",
      cap: "Modalidade",
      todos: "Todas as modalidades",
      opcoes: LISTAS_FIN.modalidades.map((x) => [x, x] as const),
    },
    {
      chave: "status",
      cap: "Status",
      todos: "Todos os status",
      opcoes: LISTAS_FIN.statusOperacional.map((x) => [x, x] as const),
    },
    {
      chave: "tipo",
      cap: "Tipo de operação",
      todos: "Todos os tipos",
      opcoes: LISTAS_FIN.tiposOperacao.map((x) => [x, tipoCurto(x)] as const),
    },
  ];

  const mudarFiltro = (chave: ChaveFiltro, valor: string) =>
    aoMudarFiltros({ ...filtros, [chave]: valor } as FiltrosVisao);
  const limpar = () => aoMudarFiltros(FILTROS_VISAO_INICIAIS);

  /** Para onde leva cada alerta (o `go` do protótipo), ou nada se a pessoa não tem a tela. */
  const destinoDe = (a: Alerta): (() => void) | undefined => {
    if ("corporativo" in a) {
      const destino = (a as AlertaCorporativo).destino;
      if (destino === "resultado" || !tem(destino)) return undefined;
      return () => irPara(destino);
    }
    if (!tem("eventos")) return undefined;
    return () => irPara("eventos", { eventoId: a.eventoId, aba: a.aba });
  };

  const abrirEventosPorStatus = (status: string) =>
    irPara("eventos", { filtros: { ...filtros, status } });

  return (
    <>
      <div className="page-head">
        <div className="ph-text">
          <div className="eyebrow">Ambiente 01 · Leitura da Diretoria</div>
          <h1 className="page-title">Visão Executiva</h1>
          <div className="page-sub">
            Posição econômica e financeira do Grupo NTC: eventos, projetos e operação corporativa.
          </div>
        </div>
        {tem("eventos") && (
          <div className="ph-actions">
            <button type="button" className="btn btn-secondary" onClick={() => irPara("eventos")}>
              <Icone nome="calendar" tamanho="sm" />
              Ver eventos
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setNovoEvento(true)}>
              <Icone nome="plus" tamanho="sm" />
              Novo evento
            </button>
          </div>
        )}
      </div>

      <div className="filterbar">
        <span className="fb-label">
          <Icone nome="filter" tamanho="xs" /> Filtros
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
                onChange={(e) => mudarFiltro(d.chave, e.target.value)}
              >
                <option value="all">{d.todos}</option>
                {d.opcoes.map(([val, rot]) => (
                  <option key={val} value={val}>
                    {rot}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <span className="fb-spacer" />
        <span className="muted" style={{ fontSize: 12.5 }}>
          <b className="num" style={{ color: "var(--tinta)" }}>
            {rows.length}
          </b>{" "}
          evento(s) no recorte
        </span>
        {algumFiltro(filtros) && (
          <button type="button" className="btn btn-ghost btn-sm fb-clear" onClick={limpar}>
            <Icone nome="x" tamanho="xs" />
            Limpar
          </button>
        )}
      </div>

      <div className="section-title">
        <h2>Posição consolidada</h2>
        <span className="st-line" />
        <span className="st-note">eventos e corporativo · três leituras distintas</span>
      </div>
      <div className="persp" style={{ marginBottom: 16 }}>
        <div className="persp-card p1">
          <div className="persp-k">Compromisso</div>
          <div className="persp-t">Resultado projetado</div>
          <div className={`persp-v${K.projetado < 0 ? " neg" : ""}`}>
            {moeda(K.projetado, false)}
          </div>
          <div className="persp-f">
            Receita contratada menos custo orçado. Mede o que foi assumido, não o que foi executado.
          </div>
        </div>
        <div className="persp-card p2">
          <div className="persp-k">Competência</div>
          <div className="persp-t">Resultado econômico</div>
          <div className={`persp-v${K.economico < 0 ? " neg" : ""}`}>
            {moeda(K.economico, false)}
          </div>
          <div className="persp-f">
            Receita reconhecida menos despesa incorrida no período. Independe de faturamento e de
            caixa.
          </div>
        </div>
        <div className="persp-card p3">
          <div className="persp-k">Disponibilidade</div>
          <div className="persp-t">Movimentação líquida de caixa</div>
          <div className={`persp-v${K.movimentacaoLiquida < 0 ? " neg" : ""}`}>
            {moeda(K.movimentacaoLiquida, false)}
          </div>
          <div className="persp-f">
            Entradas menos saídas. Saldo atual de {moeda(K.saldoAtual, false)} em{" "}
            {inteiro(K.nContas)} conta(s). Lucro não é caixa.
          </div>
        </div>
      </div>

      <div className="card kpi-group" style={{ marginBottom: 16 }}>
        <div className="kg-title">
          <div className="kg-name">Eventos × corporativo</div>
          <div className="kg-desc">
            Resultado econômico por origem
            <br />
            sem rateio de estrutura compartilhada
          </div>
        </div>
        <div className="kg-cells">
          <Kpi
            rotulo="Eventos e projetos"
            valor={KE.economico}
            rodape={<span className="muted">{moeda(KE.reconhecida, false)} reconhecida</span>}
            dica="Receita reconhecida menos despesa incorrida dos lançamentos vinculados a eventos."
          />
          <Kpi
            rotulo="Operação corporativa"
            valor={KC.economico}
            rodape={<span className="muted">{moeda(KC.incorrido, false)} incorrida</span>}
            destaque={KC.economico < 0 ? "vermelho" : undefined}
            dica="Receitas e despesas sem evento, apropriadas por centro de custo."
          />
          <Kpi
            rotulo="Valor a receber"
            valor={K.exigivel}
            rodape={
              K.aLiberar > 0 ? (
                <Selo cor="dourado">{moeda(K.aLiberar)} em retenção contratual</Selo>
              ) : (
                <span className="muted">líquido esperado − recebido</span>
              )
            }
            destaque="azul"
            dica="Valor que pode ser cobrado hoje, já descontadas as retenções. Retenção não é inadimplência."
          />
          <Kpi
            rotulo="Valor a pagar"
            valor={K.aPagar}
            rodape={<span className="muted">incorrido − pago</span>}
            destaque="vermelho"
            dica="Custos e despesas já incorridos e ainda não pagos, de eventos e da operação corporativa."
          />
        </div>
      </div>

      {corpAl.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head" style={{ paddingBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: 18 }}>Pendências corporativas</h3>
              <div className="ch-sub">Fora do escopo de evento</div>
            </div>
            <div className="ch-right">
              <ResumoAlertas alertas={corpAl} />
            </div>
          </div>
          <div className="alist">
            {corpAl.slice(0, 6).map((a, i) => (
              <ItemAlerta key={i} alerta={a} mostrarEvento={false} aoAbrir={destinoDe(a)} />
            ))}
          </div>
          {corpAl.length > 6 && (
            <div className="card-body" style={{ paddingTop: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setGaveta("corporativas")}
              >
                Ver todas as {corpAl.length} pendências corporativas
              </button>
            </div>
          )}
        </div>
      )}

      <div className="section-title">
        <h2>Carteira de eventos e projetos</h2>
        <span className="st-line" />
        <span className="st-note">{rows.length} operação(ões) no recorte</span>
      </div>
      {rows.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="e-icon">
              <Icone nome="filter" />
            </div>
            <h4>Nenhum evento neste recorte</h4>
            <p>Ajuste os filtros para visualizar a carteira.</p>
            <button type="button" className="btn btn-secondary" onClick={limpar}>
              Limpar filtros
            </button>
          </div>
        </div>
      ) : (
        <>
          <HeroResultado tot={tot} />

          <div className="section-title">
            <h2>Receita e custos</h2>
            <span className="st-line" />
            <span className="st-note">Contratado ≠ Faturado ≠ Recebido · Realizado ≠ Pago</span>
          </div>
          <div className="card kpi-group">
            <div className="kg-title">
              <div className="kg-name" style={{ color: "var(--azul)" }}>
                Receita
              </div>
              <div className="kg-desc">
                {inteiro(v.nReceitas)} receitas · {inteiro(v.nClientes)} clientes/órgãos
              </div>
            </div>
            <div className="kg-cells">
              <Kpi
                rotulo="Receita contratada"
                valor={tot.contratada}
                rodape={
                  <span className="muted">
                    {tot.prevista > 0
                      ? `+ ${moeda(tot.prevista)} prevista, não contratada`
                      : "contratos e inscrições confirmados"}
                  </span>
                }
                dica="Valor dos contratos e inscrições confirmados, ainda que não tenham sido faturados ou recebidos. Receitas apenas previstas não entram."
              />
              <Kpi
                rotulo="Receita faturada"
                valor={tot.faturada}
                rodape={
                  <RodapeBarra razao={razao(tot.faturada, tot.contratada)} texto="do contratado" />
                }
                dica="Valor dos documentos de cobrança já emitidos. Faturar não significa receber."
              />
              <Kpi
                rotulo="Receita recebida"
                valor={tot.recebida}
                rodape={
                  <RodapeBarra
                    razao={razao(tot.recebida, tot.faturada)}
                    texto="do faturado"
                    cor="verde"
                  />
                }
                dica="Valor efetivamente recebido, confirmado em conta."
              />
              <Kpi
                rotulo="Saldo a receber"
                valor={tot.aReceber}
                rodape={
                  v.vencidoReceber > 0 ? (
                    <Selo cor="vermelho" icone="alert">
                      {moeda(v.vencidoReceber)} vencido
                    </Selo>
                  ) : (
                    <span className="muted">faturado − recebido</span>
                  )
                }
                destaque="azul"
                dica="Faturado menos recebido."
              />
            </div>
          </div>
          <div className="card kpi-group">
            <div className="kg-title">
              <div className="kg-name" style={{ color: "var(--vermelho)" }}>
                Custos
              </div>
              <div className="kg-desc">Previsto → realizado → pago</div>
            </div>
            <div className="kg-cells">
              <Kpi
                rotulo="Custo orçado"
                valor={tot.orcado}
                rodape={
                  <span className="muted">
                    {tot.orcado
                      ? `${porcentagem(razao(tot.realizado, tot.orcado), 0)} já realizado`
                      : "sem orçamento"}
                  </span>
                }
                dica="Plano de custos e despesas do período."
              />
              <Kpi
                rotulo="Custo realizado"
                valor={tot.realizado}
                rodape={
                  <RodapeBarra
                    razao={razao(tot.realizado, tot.orcado)}
                    texto="do orçado"
                    cor="grafite"
                  />
                }
                dica="Custos e despesas incorridos, independentemente de pagamento."
              />
              <Kpi
                rotulo="Valor pago"
                valor={tot.pago}
                rodape={
                  <RodapeBarra
                    razao={razao(tot.pago, tot.realizado)}
                    texto="do realizado"
                    cor="verde"
                  />
                }
                dica="Saída de caixa efetiva."
              />
              <Kpi
                rotulo="Saldo a pagar"
                valor={tot.aPagar}
                rodape={
                  v.vencidoPagar > 0 ? (
                    <Selo cor="vermelho" icone="alert">
                      {moeda(v.vencidoPagar)} vencido
                    </Selo>
                  ) : (
                    <span className="muted">realizado − pago</span>
                  )
                }
                destaque="vermelho"
                dica="Custos e despesas já incorridos e ainda não pagos."
              />
            </div>
          </div>

          <AnaliseVisao v={v} destinoDe={destinoDe} aoVerTodos={() => setGaveta("alertas")} />

          <CarteiraEventos
            v={v}
            temEventos={tem("eventos")}
            irPara={irPara}
            abrirEventosPorStatus={abrirEventosPorStatus}
          />
        </>
      )}

      {gaveta === "alertas" && (
        <GavetaAlertas alertas={alerts} destinoDe={destinoDe} aoFechar={() => setGaveta(null)} />
      )}
      {gaveta === "corporativas" && (
        <GavetaAlertas
          alertas={corpAl}
          titulo="Pendências corporativas"
          destinoDe={destinoDe}
          aoFechar={() => setGaveta(null)}
        />
      )}
      {novoEvento && (
        <WizardEvento
          evento={null}
          aoFechar={() => setNovoEvento(false)}
          aoSalvar={(id) => {
            setNovoEvento(false);
            // Como no protótipo: o evento criado abre na área dele.
            irPara("eventos", { eventoId: id, aba: "visao" });
          }}
        />
      )}
    </>
  );
}
