"use client";

import { useState } from "react";

import { formatarReais } from "@ntc/lib";

import type { ItemHistorico } from "@/lib/financeiro/leitura";

import { carregarHistoricoFinAcao } from "../../acoesFinanceiro";
import { Icone } from "./Icone";

/**
 * Bloco "Histórico" de um lançamento (spec §4.2 — não existe no protótipo;
 * usa o `.details` dos formulários dele). Recolhido por padrão; ao abrir pela
 * primeira vez chama `carregarHistoricoFinAcao` e lista, do mais recente ao
 * mais antigo, quem fez o quê e quando, com os campos que mudaram.
 */

export type SlugFin = "fin-eventos" | "fin-receitas" | "fin-faturamentos" | "fin-custos" | "fin-pagamentos" | "fin-contas";

interface HistoricoProps {
  slug: SlugFin;
  /** Id do lançamento (o histórico só existe para o que já foi gravado). */
  id: string;
  /** Rótulo legível por campo (`{ valorFaturado: "Valor faturado" }`); sem rótulo sai o nome do campo. */
  rotulos?: Record<string, string>;
  /** Campos em centavos, mostrados como `R$ 1.234,56`. */
  camposDinheiro?: readonly string[];
}

type Estado =
  | { fase: "fechado" }
  | { fase: "carregando" }
  | { fase: "pronto"; itens: ItemHistorico[] }
  | { fase: "erro"; erro: string };

const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function quandoLegivel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : QUANDO.format(d);
}

function valorLegivel(v: unknown, dinheiro: boolean): string {
  if (v === null || v === undefined || v === "") return "—";
  if (dinheiro && typeof v === "number") return formatarReais(v);
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const [a, m, d] = v.slice(0, 10).split("-");
    return `${d}/${m}/${a}`;
  }
  if (typeof v === "object") return Array.isArray(v) ? `${v.length} item(ns)` : "(alterado)";
  return String(v);
}

export function Historico({ slug, id, rotulos, camposDinheiro }: HistoricoProps) {
  const [estado, setEstado] = useState<Estado>({ fase: "fechado" });

  function alternar(e: React.SyntheticEvent<HTMLDetailsElement>) {
    if (!e.currentTarget.open || estado.fase === "carregando" || estado.fase === "pronto") return;
    setEstado({ fase: "carregando" });
    carregarHistoricoFinAcao(slug, id)
      .then((r) => setEstado(r.ok ? { fase: "pronto", itens: r.itens } : { fase: "erro", erro: r.erro }))
      .catch(() => setEstado({ fase: "erro", erro: "Não foi possível carregar o histórico. Tente novamente." }));
  }

  const dinheiro = new Set(camposDinheiro ?? []);

  return (
    <details className="details" onToggle={alternar}>
      <summary>
        <Icone nome="chevR" tamanho="sm" className="chev" />
        Histórico
        <span className="opt">quem lançou, quem alterou o quê e quando</span>
      </summary>
      <div className="hist-corpo" aria-live="polite">
        {estado.fase === "carregando" && <p className="muted">Carregando…</p>}
        {estado.fase === "erro" && (
          <div className="form-error">
            <Icone nome="alert" tamanho="sm" />
            {estado.erro}
          </div>
        )}
        {estado.fase === "pronto" && estado.itens.length === 0 && <p className="muted">Nenhum registro.</p>}
        {estado.fase === "pronto" &&
          estado.itens.map((item, i) => (
            <div key={`${item.quando}-${i}`} className="cline hist-item">
              <div className="hist-topo">
                <span className="cv">{item.acao}</span>
                <span className="muted num">{quandoLegivel(item.quando)}</span>
              </div>
              <div className="dim hist-quem">
                {item.quem}
              </div>
              {item.mudancas.length > 0 && (
                <ul className="hist-mudancas">
                  {item.mudancas.map((m) => (
                    <li key={m.campo}>
                      <b>{rotulos?.[m.campo] ?? m.campo}</b>: {valorLegivel(m.antes, dinheiro.has(m.campo))} →{" "}
                      {valorLegivel(m.depois, dinheiro.has(m.campo))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    </details>
  );
}
