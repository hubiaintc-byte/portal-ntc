"use client";

import { useState } from "react";

import {
  CRIT_PROVISORIO,
  validarEtapas,
  valorReceita,
  type EventoFin,
  type LivroFinanceiro,
  type ReceitaFin,
} from "@ntc/lib";

import { salvarEtapasFinAcao } from "../../acoesFinanceiro";
import { Gaveta } from "../ui/Gaveta";
import { Icone } from "../ui/Icone";
import { Selo, TagValidar } from "../ui/Selo";
import { lerCampoDinheiro, moeda, textoAoSairDinheiro, textoDeCentavos } from "../ui/formato";
import {
  alternarConclusao,
  etapasParaEdicao,
  etapasParaSalvar,
  novaEtapa,
  reconhecidoComEtapas,
  somasEtapas,
  valorDaEtapa,
  type LinhaEtapa,
} from "./dadosArea";

/**
 * "Etapas e reconhecimento econômico" (`openEtapasDrawer` do protótipo): o
 * reconhecimento acontece quando a etapa/módulo é concluída. Grava só as
 * etapas (`salvarEtapasFinAcao`); o servidor ajusta o critério.
 */

interface GavetaEtapasProps {
  evento: EventoFin;
  receita: ReceitaFin;
  livro: LivroFinanceiro;
  hojeISO: string;
  aoSalvo: (titulo: string, descricao: string) => void;
  aoFechar: () => void;
}

export function GavetaEtapas({
  evento: ev,
  receita: r,
  livro,
  hojeISO,
  aoSalvo,
  aoFechar,
}: GavetaEtapasProps) {
  const total = valorReceita(r);
  const [linhas, setLinhas] = useState<LinhaEtapa[]>(() => etapasParaEdicao(r, textoDeCentavos));
  const [proxima, setProxima] = useState(linhas.length);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const somas = somasEtapas(linhas, total);

  const mudar = (chave: number, p: Partial<LinhaEtapa>) => {
    setLinhas((ls) => ls.map((e) => (e.chave === chave ? { ...e, ...p } : e)));
    setErro(null);
  };

  const salvar = async () => {
    if (salvando) return;
    const limpa = etapasParaSalvar(linhas, hojeISO);
    const v = validarEtapas(r, limpa);
    if (!v.ok) return setErro(v.erro);
    setSalvando(true);
    try {
      const res = await salvarEtapasFinAcao(r.id, limpa);
      if (res.ok)
        aoSalvo(
          "Etapas atualizadas",
          `${limpa.length} etapa(s) · reconhecido ${moeda(reconhecidoComEtapas(r, limpa, livro, hojeISO), false)}`,
        );
      else setErro(res.erro);
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const rodape = (
    <>
      <span className="spacer" />
      <button type="button" className="btn btn-secondary" onClick={aoFechar}>
        Cancelar
      </button>
      <button
        type="button"
        className="btn btn-primary"
        disabled={salvando}
        onClick={() => void salvar()}
      >
        <Icone nome="check" tamanho="sm" />
        Salvar etapas
      </button>
    </>
  );

  return (
    <Gaveta
      titulo="Etapas e reconhecimento econômico"
      eyebrow={`${r.id} · Reconhecimento`}
      sub={ev.nome || r.cliente}
      aoFechar={aoFechar}
      rodape={rodape}
    >
      <div className="ctx-note" style={{ marginBottom: 14 }}>
        <Icone nome="info" tamanho="sm" />
        <div>
          O reconhecimento econômico ocorre quando a etapa/módulo é <b>concluída</b> — não quando é
          contratada nem quando é faturada.{" "}
          <b>Os valores por etapa são informados, nunca presumidos iguais.</b> Critério provisório —{" "}
          <TagValidar texto="VALIDAR COM CONTABILIDADE" />.
        </div>
      </div>
      {erro && (
        <div className="form-error" role="alert" style={{ marginBottom: 14 }}>
          <Icone nome="alert" tamanho="sm" />
          {erro}
        </div>
      )}
      <div className="summary-box" style={{ marginBottom: 14 }}>
        <div className="cline">
          <span className="cl">Receita contratada</span>
          <span className="cv num">{moeda(total)}</span>
        </div>
        <div className="cline">
          <span className="cl">Soma das etapas</span>
          <span className={`cv num${somas.diverge ? " neg" : ""}`}>
            {moeda(somas.soma, false)}
            {somas.diverge ? " · diverge do contratado" : ""}
          </span>
        </div>
        <div className="cline total">
          <span className="cl">Reconhecido (etapas concluídas)</span>
          <span className="cv num">{moeda(somas.concluido, false)}</span>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <caption className="sr-only">Etapas da receita {r.id}</caption>
          <thead>
            <tr>
              <th scope="col">Etapa / módulo</th>
              <th scope="col">Base</th>
              <th scope="col" className="r">
                Valor
              </th>
              <th scope="col">Concluída em</th>
              <th scope="col">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  Nenhuma etapa registrada. Sem etapas, o reconhecimento segue o critério &quot;
                  {r.criterioReconhecimento || CRIT_PROVISORIO}&quot;.
                </td>
              </tr>
            ) : (
              linhas.map((e, i) => {
                const rot = `etapa ${i + 1}`;
                const dinheiro = lerCampoDinheiro(e.textoValor);
                return (
                  <tr key={e.chave}>
                    <td>
                      <input
                        aria-label={`Nome da ${rot}`}
                        value={e.nome}
                        placeholder="Ex.: Módulo 01"
                        style={{ width: "100%" }}
                        onChange={(x) => mudar(e.chave, { nome: x.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Base da ${rot}`}
                        value={e.base === "percentual" ? "percentual" : "valor"}
                        onChange={(x) =>
                          mudar(e.chave, {
                            base: x.target.value === "percentual" ? "percentual" : "valor",
                          })
                        }
                      >
                        <option value="valor">Valor</option>
                        <option value="percentual">%</option>
                      </select>
                    </td>
                    <td className="r">
                      {e.base === "percentual" ? (
                        <>
                          <input
                            aria-label={`Percentual da ${rot}`}
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={e.percentual || ""}
                            style={{ width: 90, textAlign: "right" }}
                            onChange={(x) =>
                              mudar(e.chave, { percentual: Number(x.target.value) || 0 })
                            }
                          />{" "}
                          %<div className="sub num">{moeda(valorDaEtapa(e, total), false)}</div>
                        </>
                      ) : (
                        <input
                          aria-label={`Valor da ${rot}`}
                          inputMode="decimal"
                          aria-invalid={dinheiro.valido ? undefined : true}
                          value={e.textoValor}
                          style={{ width: 120, textAlign: "right" }}
                          onChange={(x) => {
                            const t = x.target.value;
                            mudar(e.chave, {
                              textoValor: t,
                              valor: lerCampoDinheiro(t).valor ?? 0,
                            });
                          }}
                          onBlur={() =>
                            mudar(e.chave, { textoValor: textoAoSairDinheiro(e.textoValor) })
                          }
                        />
                      )}
                    </td>
                    <td>
                      <input
                        aria-label={`Data de conclusão da ${rot}`}
                        type="date"
                        value={e.dataConclusao}
                        onChange={(x) => mudar(e.chave, { dataConclusao: x.target.value })}
                      />
                      <div className="sub">
                        {e.concluida ? (
                          <Selo cor="verde">Concluída</Selo>
                        ) : (
                          <span className="muted">Em aberto</span>
                        )}
                      </div>
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        aria-label={`${e.concluida ? "Reabrir" : "Concluir"} ${rot}`}
                        onClick={() =>
                          setLinhas((ls) =>
                            ls.map((y) =>
                              y.chave === e.chave ? alternarConclusao(y, hojeISO) : y,
                            ),
                          )
                        }
                      >
                        {e.concluida ? "Reabrir" : "Concluir"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon sm"
                        aria-label={`Remover ${rot}`}
                        onClick={() => setLinhas((ls) => ls.filter((y) => y.chave !== e.chave))}
                      >
                        <Icone nome="trash" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setLinhas((ls) => [...ls, novaEtapa(proxima)]);
            setProxima((p) => p + 1);
          }}
        >
          <Icone nome="plus" tamanho="xs" />
          Adicionar etapa
        </button>
      </div>
    </Gaveta>
  );
}
