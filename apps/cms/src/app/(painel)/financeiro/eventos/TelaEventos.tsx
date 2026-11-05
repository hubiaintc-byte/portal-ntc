"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LISTAS_FIN, periodosDisponiveis, type EventoFin } from "@ntc/lib";

import { excluirEventoFinAcao } from "../../acoesFinanceiro";
import type { PropsTelaFin } from "../ShellFinanceiro";
import { Confirmacao } from "../ui/Confirmacao";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { CLASSE_VERTICAL, ChipVertical, SeloStatus } from "../ui/Selo";
import { Tabela, type ColunaTabela } from "../ui/Tabela";
import { useToasts } from "../ui/Toasts";
import { intervaloDatas, tipoCurto } from "../ui/formato";
import {
  algumFiltroEventos,
  alternarOrdem,
  dependentesDoEvento,
  exclusaoBloqueada,
  limparFiltrosEventos,
  listarEventos,
  MSG_EVENTO_CRM_COM_LANCAMENTOS,
  ORDENACOES,
  type ChaveFiltroEventos,
  type EstadoListaEventos,
} from "./dadosEventos";
import {
  CartaoEvento,
  IconeModalidade,
  PontoAlerta,
  SelosSituacaoCrm,
  SeloOrigem,
  textoLocal,
} from "./SelosEvento";
import { WizardEvento } from "./WizardEvento";

/**
 * Eventos e Projetos, lista (`Views.events` do protótipo FIN-05, mapa §1.2):
 * abas por vertical com contagem, busca, filtros, ordenação, Cards/Lista e o
 * ponto de alerta. Do portal (spec §3.2, §4.4): selos de origem
 * "CRM"/"Financeiro", "Cadastro financeiro pendente" (o evento do CRM sem
 * registro financeiro abre o wizard) e "Cancelado no CRM". Excluir só com
 * `capacidades.excluirFinanceiro`.
 */

interface TelaEventosProps extends PropsTelaFin {
  /** Estado da lista guardado no casco (o `UI.events` do protótipo vale para a sessão). */
  lista: EstadoListaEventos;
  aoMudarLista: (s: EstadoListaEventos) => void;
}

interface DefFiltro {
  chave: ChaveFiltroEventos;
  cap: string;
  todos: string;
  opcoes: readonly (readonly [string, string])[];
}

export function TelaEventos({
  livro,
  hojeISO,
  capacidades,
  irPara,
  lista: S,
  aoMudarLista,
}: TelaEventosProps) {
  const [wizard, setWizard] = useState<{ evento: EventoFin | null } | null>(null);
  const [menu, setMenu] = useState<{ ancora: HTMLElement; evento: EventoFin } | null>(null);
  const [excluindo, setExcluindo] = useState<EventoFin | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const { toasts, mostrar } = useToasts();

  // Busca com o atraso do protótipo (220 ms) antes de refiltrar.
  const [busca, setBusca] = useState(S.q);
  const estadoRef = useRef(S);
  useEffect(() => {
    estadoRef.current = S;
  }, [S]);
  useEffect(() => {
    if (busca === estadoRef.current.q) return;
    const t = window.setTimeout(() => aoMudarLista({ ...estadoRef.current, q: busca }), 220);
    return () => window.clearTimeout(t);
  }, [busca, aoMudarLista]);

  const { lista, porVertical, alertas } = useMemo(
    () => listarEventos(livro, S, hojeISO),
    [livro, S, hojeISO],
  );
  const [sk, sd] = S.sort.split("-");

  const mudar = (p: Partial<EstadoListaEventos>) => aoMudarLista({ ...S, ...p });
  const limpar = () => {
    setBusca("");
    aoMudarLista(limparFiltrosEventos(S));
  };

  const defs: DefFiltro[] = [
    {
      chave: "status",
      cap: "Status",
      todos: "Todos os status",
      opcoes: LISTAS_FIN.statusOperacional.map((x) => [x, x] as const),
    },
    {
      chave: "modalidade",
      cap: "Modalidade",
      todos: "Todas as modalidades",
      opcoes: LISTAS_FIN.modalidades.map((x) => [x, x] as const),
    },
    {
      chave: "periodo",
      cap: "Período",
      todos: "Todo o período",
      opcoes: periodosDisponiveis(livro, hojeISO)
        .filter((p) => p.valor !== "all")
        .map((p) => [p.valor, p.rotulo] as const),
    },
    {
      chave: "tipo",
      cap: "Tipo de operação",
      todos: "Todos os tipos",
      opcoes: LISTAS_FIN.tiposOperacao.map((x) => [x, tipoCurto(x)] as const),
    },
  ];

  /** Clique no evento: o do CRM sem cadastro financeiro abre o wizard; os outros, a área do evento. */
  const abrir = (e: EventoFin) => {
    if (e.cadastroPendente) setWizard({ evento: e });
    else irPara("eventos", { eventoId: e.id, aba: "visao" });
  };
  const novo = () => setWizard({ evento: null });

  const aoSalvarWizard = (id: string) => {
    const antes = wizard?.evento ?? null;
    setWizard(null);
    if (antes === null) {
      // Evento novo: o protótipo leva direto à área do evento criado.
      irPara("eventos", { eventoId: id, aba: "visao" });
      return;
    }
    mostrar("Cadastro atualizado", `${id} · ${antes.nome}`);
  };

  const pedirExclusao = (e: EventoFin) => {
    if (exclusaoBloqueada(e, livro)) {
      mostrar("Exclusão bloqueada", MSG_EVENTO_CRM_COM_LANCAMENTOS, "erro");
      return;
    }
    setExcluindo(e);
  };

  const excluir = async () => {
    if (!excluindo) return;
    const e = excluindo;
    setOcupado(true);
    try {
      const r = await excluirEventoFinAcao(e.id);
      if (r.ok) {
        setExcluindo(null);
        mostrar("Evento excluído", `${e.id} · ${e.nome}`);
      } else {
        setExcluindo(null);
        mostrar("Não foi possível excluir", r.erro, "erro");
      }
    } catch {
      setExcluindo(null);
      mostrar("Não foi possível excluir", "Tente de novo.", "erro");
    } finally {
      setOcupado(false);
    }
  };

  const itensMenu = (e: EventoFin): EntradaMenu[] => {
    const itens: EntradaMenu[] = [
      { rotulo: "Abrir evento", icone: "arrowR", acao: () => abrir(e) },
      { rotulo: "Editar cadastro", icone: "edit", acao: () => setWizard({ evento: e }) },
    ];
    // Pendente do CRM não tem cadastro financeiro a excluir.
    if (capacidades.excluirFinanceiro && !e.cadastroPendente) {
      itens.push("-", {
        rotulo: "Excluir evento",
        icone: "trash",
        perigo: true,
        acao: () => pedirExclusao(e),
      });
    }
    return itens;
  };

  const cabecalhoOrdenavel = (k: string, rotulo: string) => (
    <button
      type="button"
      className="linkbtn"
      style={{ color: "inherit", font: "inherit", letterSpacing: "inherit" }}
      aria-label={`Ordenar por ${rotulo}`}
      onClick={() => mudar({ sort: alternarOrdem(S.sort, k) })}
    >
      {rotulo}
      {sk === k && (
        <span
          style={{ display: "inline-flex", transform: sd === "asc" ? "rotate(180deg)" : "none" }}
        >
          <Icone nome="chevD" tamanho="xs" />
        </span>
      )}
    </button>
  );

  const colunas: ColunaTabela<EventoFin>[] = [
    { id: "id", titulo: cabecalhoOrdenavel("id", "ID"), className: "idc", celula: (e) => e.id },
    {
      id: "nome",
      titulo: cabecalhoOrdenavel("nome", "Evento"),
      celula: (e) => (
        <>
          <div className="strong">{e.nome}</div>
          <div className="sub">
            {[e.programa, e.modulo].filter(Boolean).join(" · ") || textoLocal(e)}
          </div>
        </>
      ),
    },
    {
      id: "vertical",
      titulo: "Vertical",
      celula: (e) => (e.vertical ? <ChipVertical vertical={e.vertical} /> : "—"),
    },
    {
      id: "data",
      titulo: cabecalhoOrdenavel("data", "Data"),
      celula: (e) => (
        <span className="num" style={{ whiteSpace: "nowrap" }}>
          {intervaloDatas(e.dataInicio, e.dataFim)}
        </span>
      ),
    },
    {
      id: "modalidade",
      titulo: "Modalidade",
      celula: (e) => (
        <span
          style={{ display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}
        >
          <IconeModalidade modalidade={e.modalidade} />
          {e.modalidade || "—"}
        </span>
      ),
    },
    {
      id: "tipo",
      titulo: "Tipo",
      celula: (e) => (
        <span className="dim" style={{ whiteSpace: "nowrap" }}>
          {tipoCurto(e.tipo) || "—"}
        </span>
      ),
    },
    {
      id: "status",
      titulo: cabecalhoOrdenavel("status", "Status"),
      celula: (e) => (
        <span className="selos-linha">
          <SeloStatus status={e.status} tipo="operacional" /> <SeloOrigem evento={e} />{" "}
          <SelosSituacaoCrm evento={e} /> <PontoAlerta alertas={alertas[e.id]} />
        </span>
      ),
    },
    {
      id: "acoes",
      titulo: <span className="sr-only">Ações</span>,
      alinhar: "dir",
      className: "actions",
      celula: (e) => (
        <button
          type="button"
          className="btn btn-ghost btn-icon sm"
          aria-label={`Ações do evento ${e.id}`}
          aria-haspopup="menu"
          aria-expanded={menu?.evento.id === e.id}
          onClick={(ev) => {
            ev.stopPropagation();
            const ancora = ev.currentTarget;
            setMenu((m) => (m?.evento.id === e.id ? null : { ancora, evento: e }));
          }}
          onKeyDown={(ev) => ev.stopPropagation()}
        >
          <Icone nome="more" />
        </button>
      ),
    },
  ];

  const abas: [string, string][] = [
    ["all", "Todos"],
    ...LISTAS_FIN.verticais.map((v) => [v, v] as [string, string]),
  ];
  const filtrado = algumFiltroEventos(S);

  return (
    <>
      <div className="page-head">
        <div className="ph-text">
          <div className="eyebrow">Portfólio</div>
          <h1 className="page-title">Eventos</h1>
          <div className="page-sub">Gerencie e acompanhe os eventos da NTC.</div>
        </div>
        <div className="ph-actions">
          <button type="button" className="btn btn-primary" onClick={novo}>
            <Icone nome="plus" tamanho="sm" />
            Novo evento
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div className="seg" role="tablist" aria-label="Vertical">
          {abas.map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={S.vertical === v}
              className={S.vertical === v ? "on" : undefined}
              onClick={() => mudar({ vertical: v })}
            >
              {v !== "all" ? (
                <span
                  className={`vchip ${CLASSE_VERTICAL[v] ?? ""}`}
                  style={{ fontWeight: "inherit", color: "inherit" }}
                >
                  {l}
                </span>
              ) : (
                l
              )}{" "}
              <span className="muted num" style={{ fontSize: 12 }}>
                {porVertical[v] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="filterbar">
        <div className="search-in">
          <Icone nome="search" tamanho="sm" />
          <input
            type="search"
            placeholder="Buscar por nome, ID, programa, órgão, cidade…"
            value={busca}
            aria-label="Buscar eventos"
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {defs.map((d) => {
          const valor = S[d.chave] || "all";
          return (
            <div className="fsel" key={d.chave}>
              <span className="fcap">{d.cap}</span>
              <select
                className={valor !== "all" ? "set" : undefined}
                aria-label={d.cap}
                value={valor}
                onChange={(e) =>
                  mudar({ [d.chave]: e.target.value } as Partial<EstadoListaEventos>)
                }
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
        {filtrado && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={limpar}>
            <Icone nome="x" tamanho="xs" />
            Limpar
          </button>
        )}
        <span className="fb-spacer" />
        <span className="muted" style={{ fontSize: 12.5 }}>
          <b className="num" style={{ color: "var(--tinta)" }}>
            {lista.length}
          </b>{" "}
          evento(s)
        </span>
        <div className="fsel">
          <span className="fcap">Ordenar</span>
          <select
            aria-label="Ordenar"
            value={S.sort}
            onChange={(e) => mudar({ sort: e.target.value })}
          >
            {/* Ordem atual vinda do cabeçalho da Lista (ex.: "nome-desc") que não está no select. */}
            {!ORDENACOES.some(([v]) => v === S.sort) && <option value={S.sort}>—</option>}
            {ORDENACOES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="seg" role="group" aria-label="Visualização">
          <button
            type="button"
            className={S.view === "cards" ? "on" : undefined}
            aria-pressed={S.view === "cards"}
            onClick={() => mudar({ view: "cards" })}
          >
            <Icone nome="cards" tamanho="sm" />
            Cards
          </button>
          <button
            type="button"
            className={S.view === "lista" ? "on" : undefined}
            aria-pressed={S.view === "lista"}
            onClick={() => mudar({ view: "lista" })}
          >
            <Icone nome="list" tamanho="sm" />
            Lista
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="e-icon">
              <Icone nome="search" />
            </div>
            <h4>Nenhum evento encontrado</h4>
            <p>Revise a busca e os filtros, ou cadastre um novo evento.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button type="button" className="btn btn-secondary" onClick={limpar}>
                Limpar filtros
              </button>
              <button type="button" className="btn btn-primary" onClick={novo}>
                <Icone nome="plus" tamanho="sm" />
                Novo evento
              </button>
            </div>
          </div>
        </div>
      ) : S.view === "cards" ? (
        <div className="ev-grid">
          {lista.map((e) => (
            <CartaoEvento key={e.id} evento={e} alertas={alertas[e.id]} aoAbrir={() => abrir(e)} />
          ))}
          <button type="button" className="ev-card new-card" onClick={novo}>
            <Icone nome="plus" />
            <div style={{ fontWeight: 600, marginTop: 8 }}>Novo evento</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              Cadastro em 4 etapas
            </div>
          </button>
        </div>
      ) : (
        <div className="card">
          <Tabela
            colunas={colunas}
            linhas={lista}
            chave={(e) => e.id}
            rotulo="Eventos"
            aoClicarLinha={abrir}
          />
        </div>
      )}

      {menu && (
        <MenuContexto
          ancora={menu.ancora}
          rotulo={`Ações do evento ${menu.evento.id}`}
          itens={itensMenu(menu.evento)}
          aoFechar={() => setMenu(null)}
        />
      )}

      {wizard && (
        <WizardEvento
          evento={wizard.evento}
          aoSalvar={aoSalvarWizard}
          aoFechar={() => setWizard(null)}
        />
      )}

      {excluindo && (
        <ExclusaoEvento
          evento={excluindo}
          dependentes={dependentesDoEvento(livro, excluindo.id)}
          ocupado={ocupado}
          aoConfirmar={() => void excluir()}
          aoFechar={() => setExcluindo(null)}
        />
      )}

      {toasts}
    </>
  );
}

interface ExclusaoEventoProps {
  evento: EventoFin;
  dependentes: ReturnType<typeof dependentesDoEvento>;
  ocupado: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

/** `deleteEventFlow` do protótipo, sem a nota de "protótipo sem persistência". */
function ExclusaoEvento({
  evento: ev,
  dependentes: d,
  ocupado,
  aoConfirmar,
  aoFechar,
}: ExclusaoEventoProps) {
  return (
    <Confirmacao
      titulo="Excluir evento?"
      perigo
      rotuloConfirmar="Excluir evento"
      ocupado={ocupado}
      aoConfirmar={aoConfirmar}
      aoFechar={aoFechar}
    >
      <b>
        {ev.id} · {ev.nome}
      </b>
      <br />
      <br />
      {d.total ? (
        <>
          Serão excluídos também os lançamentos vinculados por <b>ID_EVENTO</b>: {d.receitas}{" "}
          receita(s), {d.faturamentos} faturamento(s)/recebimento(s), {d.custos} custo(s) e{" "}
          {d.pagamentos} pagamento(s).
        </>
      ) : (
        "O evento não possui lançamentos vinculados."
      )}
    </Confirmacao>
  );
}
