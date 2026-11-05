"use client";

import { useMemo, useState } from "react";

import {
  eventAlerts,
  eventMetrics,
  type AlertaFin,
  type EventoFin,
  type MetricasEvento,
  type ReceitaFin,
} from "@ntc/lib";

import { excluirEventoFinAcao } from "../../acoesFinanceiro";
import type { AbaEvento, PropsTelaFin } from "../ShellFinanceiro";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { ChipVertical, CLASSE_VERTICAL, SeloStatus } from "../ui/Selo";
import { intervaloDatas, tipoCurto } from "../ui/formato";
import { GavetaAlertas } from "../visao/Alertas";
import { AbaReceitas } from "./AbaReceitas";
import { AbaResultado } from "./AbaResultado";
import { AbaVisaoGeral } from "./AbaVisaoGeral";
import { ABAS_EVENTO, contagensAbas, programaModulo, temVencido } from "./dadosArea";
import {
  dependentesDoEvento,
  exclusaoBloqueada,
  MSG_EVENTO_CRM_COM_LANCAMENTOS,
} from "./dadosEventos";
import { GavetaEtapas } from "./GavetaEtapas";
import { GavetaReceita } from "./GavetaReceita";
import { IconeModalidade, SeloOrigem, SelosSituacaoCrm } from "./SelosEvento";
import { ExclusaoEvento } from "./TelaEventos";
import { WizardEvento } from "./WizardEvento";

/**
 * Área do evento (`Views.workspace` do protótipo FIN-05, mapa §1.3):
 * cabeçalho com Editar, ⋯ e "Lançar ▾" (sem "Comissão comercial") e as abas na
 * ordem do protótipo, sem Comissões (Fase 2). Esta task porta Visão geral,
 * Receitas e Resultado; Custos, Faturamento e Pagamentos vêm na Task 15 —
 * cada aba recebe `PropsAbaEvento`.
 */

export interface AreaEventoProps extends PropsTelaFin {
  evento: EventoFin;
  aba: AbaEvento;
  aoTrocarAba: (aba: AbaEvento) => void;
  aoVoltar: () => void;
}

/** O que toda aba da área recebe (as da Task 15 também). */
export interface PropsAbaEvento extends PropsTelaFin {
  evento: EventoFin;
  m: MetricasEvento;
  alertas: AlertaFin[];
  aoTrocarAba: (aba: AbaEvento) => void;
  /** Busca da toolbar de cada aba (`UI.ws.q` do protótipo): sobrevive à troca de aba. */
  buscas: Record<string, string>;
  aoBuscar: (chave: string, valor: string) => void;
  /** Abre a gaveta de receita (nova com `null`). */
  aoAbrirReceita: (r: ReceitaFin | null) => void;
  aoAbrirEtapas: (r: ReceitaFin) => void;
  aoVerPendencias: () => void;
}

type Menu = { tipo: "mais" | "lancar"; ancora: HTMLElement };

export function AreaEvento(props: AreaEventoProps) {
  const { evento: ev, livro, hojeISO, capacidades, aba, aoTrocarAba, aoVoltar, avisar } = props;
  const m = useMemo(() => eventMetrics(ev, livro, hojeISO), [ev, livro, hojeISO]);
  const alertas = useMemo(() => eventAlerts(ev, livro, hojeISO, m), [ev, livro, hojeISO, m]);
  const contagens = contagensAbas(ev, livro, m);

  const [menu, setMenu] = useState<Menu | null>(null);
  const [wizard, setWizard] = useState(false);
  const [pendencias, setPendencias] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [receita, setReceita] = useState<{ r: ReceitaFin | null } | null>(null);
  const [etapas, setEtapas] = useState<ReceitaFin | null>(null);
  const [buscas, setBuscas] = useState<Record<string, string>>({});

  const prog = programaModulo(ev);

  const pedirExclusao = () => {
    if (exclusaoBloqueada(ev, livro)) {
      avisar("Exclusão bloqueada", MSG_EVENTO_CRM_COM_LANCAMENTOS, "erro");
      return;
    }
    setExcluindo(true);
  };

  const excluir = async () => {
    setOcupado(true);
    try {
      const r = await excluirEventoFinAcao(ev.id);
      setExcluindo(false);
      if (r.ok) {
        avisar("Evento excluído", `${ev.id} · ${ev.nome}`);
        aoVoltar();
      } else avisar("Não foi possível excluir", r.erro, "erro");
    } catch {
      setExcluindo(false);
      avisar("Não foi possível excluir", "Tente de novo.", "erro");
    } finally {
      setOcupado(false);
    }
  };

  const itensMais: EntradaMenu[] = [
    { rotulo: "Editar cadastro", icone: "edit", acao: () => setWizard(true) },
    { rotulo: "Ver pendências do evento", icone: "alert", acao: () => setPendencias(true) },
  ];
  if (capacidades.excluirFinanceiro)
    itensMais.push("-", {
      rotulo: "Excluir evento",
      icone: "trash",
      perigo: true,
      acao: pedirExclusao,
    });

  // Custo, Faturamento e Pagamento levam à aba até a Task 15 trazer as gavetas.
  const itensLancar: EntradaMenu[] = [
    { cabecalho: "Novo lançamento" },
    { rotulo: "Receita", icone: "inn", acao: () => setReceita({ r: null }) },
    { rotulo: "Custo", icone: "out", acao: () => aoTrocarAba("custos") },
    { rotulo: "Faturamento", icone: "receipt", acao: () => aoTrocarAba("faturamento") },
    { rotulo: "Pagamento", icone: "wallet", acao: () => aoTrocarAba("pagamentos") },
  ];

  const abrirMenu = (tipo: Menu["tipo"], e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const ancora = e.currentTarget;
    setMenu((atual) => (atual && atual.ancora === ancora ? null : { tipo, ancora }));
  };

  const propsAba: PropsAbaEvento = {
    ...props,
    evento: ev,
    m,
    alertas,
    aoTrocarAba,
    buscas,
    aoBuscar: (chave, valor) => setBuscas((b) => ({ ...b, [chave]: valor })),
    aoAbrirReceita: (r) => setReceita({ r }),
    aoAbrirEtapas: setEtapas,
    aoVerPendencias: () => setPendencias(true),
  };

  return (
    <>
      <section className={`ws-head ${CLASSE_VERTICAL[ev.vertical] ?? ""}`}>
        <div className="ws-top">
          <div style={{ minWidth: 0, flex: "1 1 420px" }}>
            <button type="button" className="ws-back" onClick={aoVoltar}>
              <Icone nome="arrowL" tamanho="xs" /> Eventos
            </button>
            <div className="ws-id">{ev.id}</div>
            <h1 className="ws-title">{ev.nome}</h1>
            <div className="ws-meta">
              <ChipVertical vertical={ev.vertical} />
              <span className="meta-dot">·</span>
              <span>{tipoCurto(ev.tipo)}</span>
              <span className="meta-dot">·</span>
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                <IconeModalidade modalidade={ev.modalidade} />
                {ev.modalidade}
              </span>
              <span className="meta-dot">·</span>
              <span className="num">{intervaloDatas(ev.dataInicio, ev.dataFim)}</span>
              {prog && (
                <>
                  <span className="meta-dot">·</span>
                  <span>{prog}</span>
                </>
              )}
              <span style={{ marginLeft: 4 }} className="selos-linha">
                <SeloStatus status={ev.status} tipo="operacional" />
                <SeloOrigem evento={ev} />
                <SelosSituacaoCrm evento={ev} />
              </span>
            </div>
          </div>
          <div className="ws-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setWizard(true)}
            >
              <Icone nome="edit" tamanho="sm" />
              Editar
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon sm"
              aria-label="Mais ações"
              aria-haspopup="menu"
              aria-expanded={menu?.tipo === "mais"}
              onClick={(e) => abrirMenu("mais", e)}
            >
              <Icone nome="more" />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              aria-haspopup="menu"
              aria-expanded={menu?.tipo === "lancar"}
              onClick={(e) => abrirMenu("lancar", e)}
            >
              <Icone nome="plus" tamanho="sm" />
              Lançar <Icone nome="chevD" tamanho="xs" />
            </button>
          </div>
        </div>
        <div className="tabs" role="tablist" aria-label="Seções do evento">
          {ABAS_EVENTO.map((t) => {
            const on = t.id === aba;
            const n = contagens[t.id];
            return (
              <button
                key={t.id}
                id={`aba-evento-${t.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="painel-aba-evento"
                className={on ? "on" : undefined}
                onClick={() => aoTrocarAba(t.id)}
              >
                <Icone nome={t.icone} tamanho="sm" />
                {t.rotulo}
                {n != null && <span className="tcount">{n}</span>}
                {t.id === "visao" && temVencido(alertas) && (
                  <span
                    className="tcount"
                    style={{ background: "var(--vermelho-50)", color: "var(--vermelho)" }}
                    title="Há vencimentos sem baixa"
                  >
                    <span aria-hidden="true">!</span>
                    <span className="sr-only">Há vencimentos sem baixa</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div id="painel-aba-evento" role="tabpanel" aria-labelledby={`aba-evento-${aba}`}>
        {aba === "visao" && <AbaVisaoGeral {...propsAba} />}
        {aba === "receitas" && <AbaReceitas {...propsAba} />}
        {/* Custos, Faturamento e recebimentos, Pagamentos: Task 15. */}
        {aba === "resultado" && <AbaResultado {...propsAba} />}
      </div>

      {menu && (
        <MenuContexto
          ancora={menu.ancora}
          rotulo={menu.tipo === "mais" ? "Mais ações do evento" : "Novo lançamento"}
          itens={menu.tipo === "mais" ? itensMais : itensLancar}
          aoFechar={() => setMenu(null)}
        />
      )}

      {wizard && (
        <WizardEvento
          evento={ev}
          aoSalvar={(id, nome) => {
            setWizard(false);
            avisar("Cadastro atualizado", `${id} · ${nome}`);
          }}
          aoFechar={() => setWizard(false)}
        />
      )}

      {pendencias && (
        <GavetaAlertas
          alertas={alertas}
          titulo="Pendências do evento"
          destinoDe={(a) => ("aba" in a ? () => aoTrocarAba(a.aba) : undefined)}
          aoFechar={() => setPendencias(false)}
        />
      )}

      {excluindo && (
        <ExclusaoEvento
          evento={ev}
          dependentes={dependentesDoEvento(livro, ev.id)}
          ocupado={ocupado}
          aoConfirmar={() => void excluir()}
          aoFechar={() => setExcluindo(false)}
        />
      )}

      {receita && (
        <GavetaReceita
          evento={ev}
          receita={receita.r}
          livro={livro}
          aoSalvo={(titulo, descricao) => {
            setReceita(null);
            avisar(titulo, descricao);
          }}
          aoFechar={() => setReceita(null)}
        />
      )}

      {etapas && (
        <GavetaEtapas
          evento={ev}
          receita={etapas}
          livro={livro}
          hojeISO={hojeISO}
          aoSalvo={(titulo, descricao) => {
            setEtapas(null);
            avisar(titulo, descricao);
          }}
          aoFechar={() => setEtapas(null)}
        />
      )}
    </>
  );
}

/** Evento que não existe (excluído em outra aba, id antigo): o vazio do protótipo. */
export function EventoNaoEncontrado({ id, aoVoltar }: { id: string; aoVoltar: () => void }) {
  return (
    <div className="card">
      <div className="empty">
        <div className="e-icon">
          <Icone nome="search" />
        </div>
        <h4>Evento não encontrado</h4>
        <p>O evento {id} não existe (pode ter sido excluído).</p>
        <button type="button" className="btn btn-secondary" onClick={aoVoltar}>
          <Icone nome="arrowL" tamanho="sm" />
          Voltar aos eventos
        </button>
      </div>
    </div>
  );
}
