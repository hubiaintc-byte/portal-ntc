"use client";

import { useEffect, useRef, useState } from "react";

import { isContratada, serieSegmento, seriePagantesCortesias, type ReceitaFin } from "@ntc/lib";

import { excluirReceitaFinAcao } from "../../acoesFinanceiro";
import { Confirmacao } from "../ui/Confirmacao";
import { CORES_GRAFICO as C, Grafico } from "../ui/Grafico";
import { Icone } from "../ui/Icone";
import { MenuContexto, type EntradaMenu } from "../ui/MenuContexto";
import { Dica, SeloStatus } from "../ui/Selo";
import { inteiro, moeda } from "../ui/formato";
import { Legenda } from "../visao/BlocosVisao";
import type { PropsAbaEvento } from "./AreaEvento";
import { MiniKpis } from "./AbaVisaoGeral";
import {
  ehAberto,
  linhasReceitas,
  percentualDe,
  receitasContratadas,
  resumoReceitas,
  type MiniKpi,
} from "./dadosArea";

/** Aba Receitas (`wsReceitas` do protótipo). */
export function AbaReceitas({
  evento: ev,
  m,
  livro,
  hojeISO,
  capacidades,
  avisar,
  aoTrocarAba,
  buscas,
  aoBuscar,
  aoAbrirReceita,
  aoAbrirEtapas,
}: PropsAbaEvento) {
  const aberto = ehAberto(ev);
  const busca = buscas.rec ?? "";
  const linhas = linhasReceitas(m, livro, hojeISO, busca);
  const resumo = resumoReceitas(m, livro, hojeISO);
  const contratadas = receitasContratadas(m);

  const [menu, setMenu] = useState<{
    ancora: HTMLElement;
    itens: EntradaMenu[];
    rotulo: string;
  } | null>(null);
  const [excluindo, setExcluindo] = useState<ReceitaFin | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const kpis: MiniKpi[] = [
    ["Receita contratada", moeda(m.contratada), `${resumo.nContratadas} receita(s) contratada(s)`],
    ["Prevista (não contratada)", moeda(m.prevista), "não entra no contratado"],
    aberto
      ? [
          "Pagantes · cortesias",
          `${inteiro(m.pagantes)} · ${inteiro(m.cortesias)}`,
          `${inteiro(m.participantes)} participantes`,
        ]
      : ["Faturada", moeda(m.faturada), `${percentualDe(m.faturada, m.contratada)} do contratado`],
    [
      "Clientes / órgãos",
      inteiro(resumo.orgaos),
      aberto ? "receitas por órgão" : `cliente principal: ${ev.cliente || "—"}`,
    ],
  ];

  const abrirEtapas = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (contratadas.length === 1) return aoAbrirEtapas(contratadas[0]!);
    setMenu({
      ancora: e.currentTarget,
      rotulo: "Etapas e reconhecimento",
      itens: contratadas.map((r) => ({
        rotulo: `${r.id} · ${r.cliente}`,
        icone: "layers",
        acao: () => aoAbrirEtapas(r),
      })),
    });
  };

  const abrirAcoes = (r: ReceitaFin, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const itens: EntradaMenu[] = [];
    // A gaveta de faturamento chega na Task 15; até lá, leva à aba.
    if (isContratada(r))
      itens.push({
        rotulo: "Registrar faturamento",
        icone: "receipt",
        acao: () => aoTrocarAba("faturamento"),
      });
    itens.push({ rotulo: "Editar receita", icone: "edit", acao: () => aoAbrirReceita(r) });
    if (capacidades.excluirFinanceiro)
      itens.push("-", {
        rotulo: "Excluir receita",
        icone: "trash",
        perigo: true,
        acao: () => setExcluindo(r),
      });
    setMenu({ ancora: e.currentTarget, rotulo: `Ações de ${r.id}`, itens });
  };

  // `deleteFlow('receita', …)`: confirma, exclui e avisa; recusa vira "Exclusão bloqueada".
  const excluir = async () => {
    if (!excluindo) return;
    const r = excluindo;
    const rotulo = `${r.id} · ${r.cliente}`;
    setOcupado(true);
    try {
      const res = await excluirReceitaFinAcao(r.id);
      setExcluindo(null);
      if (res.ok) avisar("Receita excluído(a)", rotulo);
      else avisar("Exclusão bloqueada", res.erro, "erro");
    } catch {
      setExcluindo(null);
      avisar("Não foi possível excluir", "Tente de novo.", "erro");
    } finally {
      setOcupado(false);
    }
  };

  const nColunas = aberto ? 11 : 9;

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <MiniKpis itens={kpis} />
      </div>

      <div className="card">
        <div className="toolbar">
          <BuscaAba
            valor={busca}
            aoMudar={(v) => aoBuscar("rec", v)}
            placeholder="Buscar cliente, segmento, tipo…"
          />
          <span className="fb-spacer" style={{ flex: 1 }} />
          <span className="muted" style={{ fontSize: 12.5 }}>
            {aberto
              ? "Evento aberto · receita por inscrição"
              : "In Company/B2G · valor global, etapas ou módulos"}
          </span>
          {!aberto && contratadas.length > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={abrirEtapas}>
              <Icone nome="layers" tamanho="sm" />
              Etapas e reconhecimento
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => aoAbrirReceita(null)}
          >
            <Icone nome="plus" tamanho="sm" />
            Adicionar receita
          </button>
        </div>

        {m.rf.length === 0 ? (
          <div className="empty">
            <div className="e-icon">
              <Icone nome="inn" />
            </div>
            <h4>Nenhuma receita registrada</h4>
            <p>
              {aberto
                ? "Registre as receitas por órgão/cliente: quantidade de inscrições, valor unitário, desconto, pagantes e cortesias."
                : "Registre o valor contratado (global, por etapa ou por módulo)."}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => aoAbrirReceita(null)}>
              <Icone nome="plus" tamanho="sm" />
              Adicionar receita
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <caption className="sr-only">Receitas do evento</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Cliente / órgão</th>
                  <th scope="col">Tipo</th>
                  {aberto ? (
                    <>
                      <th scope="col" className="r">
                        Inscrições × valor
                      </th>
                      <th scope="col" className="r">
                        Desconto
                      </th>
                      <th scope="col" className="c">
                        Pag. · Cort.
                      </th>
                    </>
                  ) : (
                    <th scope="col">Etapa / módulo</th>
                  )}
                  <th scope="col" className="r">
                    Valor contratado
                  </th>
                  <th scope="col" className="r">
                    Reconhecida{" "}
                    <Dica texto="Receita reconhecida por competência — etapas concluídas ou critério provisório de execução declarada. Contratada ≠ Reconhecida." />
                  </th>
                  <th scope="col" className="r">
                    Faturado <Dica texto="Vem dos faturamentos registrados." />
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 ? (
                  <tr>
                    <td colSpan={nColunas}>
                      <div className="empty" style={{ padding: 20 }}>
                        <p>Nenhuma receita corresponde à busca.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  linhas.map(({ r, f, reconhecida, etapasConcluidas, etapasTotal }) => (
                    <tr key={r.id}>
                      <td className="idc">{r.id}</td>
                      <td>
                        <div className="strong">{r.cliente}</div>
                        <div className="sub">{r.segmento}</div>
                      </td>
                      <td className="dim" style={{ whiteSpace: "nowrap" }}>
                        {r.tipoReceita}
                      </td>
                      {aberto ? (
                        <>
                          <td className="r num" style={{ whiteSpace: "nowrap" }}>
                            {inteiro(r.qtde)} × {moeda(r.valorUnit)}
                          </td>
                          <td className="r num">{moeda(r.desconto)}</td>
                          <td className="c num">
                            {inteiro(r.pagantes)} · {inteiro(r.cortesias)}
                          </td>
                        </>
                      ) : (
                        <td className="dim">{r.etapa || "—"}</td>
                      )}
                      <td className="r strong">
                        {r.statusEconomico === "Prevista" ? (
                          <span
                            className="muted num"
                            title="Receita prevista — não entra no contratado"
                          >
                            {moeda(f.valor)}
                          </span>
                        ) : (
                          <span className="num">{moeda(f.valor)}</span>
                        )}
                      </td>
                      <td className="r num">
                        {reconhecida ? moeda(reconhecida) : <span className="muted">—</span>}
                        {etapasTotal > 0 && (
                          <div className="sub">
                            {etapasConcluidas}/{etapasTotal} etapa(s)
                          </div>
                        )}
                      </td>
                      <td className="r">
                        <div className="minibar" style={{ justifyContent: "flex-end" }}>
                          {isContratada(r) ? (
                            <span
                              className="num"
                              style={{ width: "auto", color: "var(--tinta)", fontSize: 13 }}
                            >
                              {moeda(f.faturado)}
                            </span>
                          ) : (
                            <span className="muted" style={{ width: "auto" }}>
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <SeloStatus status={f.status} tipo="financeiro" />
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon sm"
                          aria-label={`Ações de ${r.id}`}
                          aria-haspopup="menu"
                          onClick={(e) => abrirAcoes(r, e)}
                        >
                          <Icone nome="more" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total contratado</td>
                  {aberto ? (
                    <>
                      <td />
                      <td className="r num">{moeda(resumo.descontoContratado)}</td>
                      <td className="c num">
                        {inteiro(m.pagantes)} · {inteiro(m.cortesias)}
                      </td>
                    </>
                  ) : (
                    <td />
                  )}
                  <td className="r num">{moeda(m.contratada)}</td>
                  <td className="r num">{moeda(resumo.reconhecidaTotal)}</td>
                  <td className="r num">{moeda(m.faturada)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {aberto && m.rf.length > 1 && (
        <div className="grid g-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Receita por segmento</h3>
                <div className="ch-sub">Composição da receita por segmento de cliente</div>
              </div>
            </div>
            <div className="card-body">
              <Grafico
                tipo="barrasHorizontais"
                dados={serieSegmento(m)}
                altura={220}
                rotulo="Receita contratada por segmento"
                cores={[C.azul]}
                larguraMaxBarra={16}
              />
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Pagantes e cortesias por órgão</h3>
                <div className="ch-sub">Cortesia não é custo negativo nem desconto</div>
              </div>
              <div className="ch-right">
                <Legenda
                  itens={[
                    ["Pagantes", C.azul],
                    ["Cortesias", C.dourado],
                  ]}
                />
              </div>
            </div>
            <div className="card-body">
              <Grafico
                tipo="barrasHorizontais"
                dados={seriePagantesCortesias(m)}
                altura={220}
                rotulo="Pagantes e cortesias por órgão"
                cores={[C.azul, C.dourado]}
                dinheiro={false}
                empilhado
                larguraMaxBarra={16}
              />
            </div>
          </div>
        </div>
      )}

      {menu && (
        <MenuContexto
          ancora={menu.ancora}
          rotulo={menu.rotulo}
          itens={menu.itens}
          aoFechar={() => setMenu(null)}
        />
      )}

      {excluindo && (
        <Confirmacao
          titulo="Excluir receita?"
          perigo
          rotuloConfirmar="Excluir"
          ocupado={ocupado}
          aoConfirmar={() => void excluir()}
          aoFechar={() => setExcluindo(null)}
        >
          <b>
            {excluindo.id} · {excluindo.cliente}
          </b>
          <br />
          <br />
          Esta ação remove o lançamento e recalcula os indicadores.
        </Confirmacao>
      )}
    </>
  );
}

/**
 * `toolbarSearch`/`bindWsSearch` do protótipo: a busca vale 200 ms depois da
 * última tecla. O texto é local; o valor aplicado mora na área do evento.
 */
export function BuscaAba({
  valor,
  aoMudar,
  placeholder,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  placeholder: string;
}) {
  const [texto, setTexto] = useState(valor);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className="search-in">
      <Icone nome="search" tamanho="sm" />
      <input
        type="search"
        value={texto}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          setTexto(v);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => aoMudar(v), 200);
        }}
      />
    </div>
  );
}
