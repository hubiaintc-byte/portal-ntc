"use client";

import type { AlertaCorporativo, AlertaFin, Severidade } from "@ntc/lib";

import { Gaveta } from "../ui/Gaveta";
import { Icone, type NomeIcone } from "../ui/Icone";
import { Selo, type CorSelo } from "../ui/Selo";
import { moeda } from "../ui/formato";

/**
 * Pendências e alertas do protótipo FIN-05: `alertItem`, `alertSummary` e
 * `openAlertsDrawer` (Visão Executiva; reaproveitáveis nas outras telas).
 */

export type Alerta = AlertaFin | AlertaCorporativo;

/** `SEV_UI` do protótipo: severidade → [classe do ícone, ícone]. */
const SEV_UI: Record<Severidade, [string, NomeIcone]> = {
  Vencido: ["s-vencido", "alert"],
  Pendente: ["s-pendente", "clock"],
  Atenção: ["s-atencao", "info"],
  "A validar": ["s-validar", "scale"],
};

const COR_RESUMO: Record<Severidade, CorSelo> = {
  Vencido: "vermelho",
  Pendente: "dourado",
  Atenção: "azul",
  "A validar": "neutral",
};

const ehDeEvento = (a: Alerta): a is AlertaFin => !("corporativo" in a);

interface ItemAlertaProps {
  alerta: Alerta;
  /** `showEvent` do protótipo: prefixa o detalhe com "EV-… · nome —". */
  mostrarEvento?: boolean;
  /** Abre o lançamento; sem ele (tela que a pessoa não tem, ou da Fase 2) o item não é link. */
  aoAbrir?: () => void;
}

/** `alertItem(a, showEvent)`: botão quando leva a algum lugar, linha estática quando não. */
export function ItemAlerta({ alerta: a, mostrarEvento = true, aoAbrir }: ItemAlertaProps) {
  const [classe, icone] = SEV_UI[a.severidade];
  const prefixo =
    mostrarEvento && ehDeEvento(a) && a.eventoId ? `${a.eventoId} · ${a.eventoNome} — ` : "";
  const conteudo = (
    <>
      <div className={`aicon ${classe}`}>
        <Icone nome={icone} tamanho="sm" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="at">{a.titulo}</div>
        <div className="ad">
          {prefixo}
          {a.detalhe}
        </div>
      </div>
      <div>
        <div className="av">
          {a.valor != null ? <span className="num">{moeda(a.valor)}</span> : ""}
        </div>
        <div className="as" style={{ textAlign: "right" }}>
          {a.severidade}
        </div>
      </div>
    </>
  );
  if (!aoAbrir) return <div className="aitem sem-link">{conteudo}</div>;
  return (
    <button type="button" className="aitem" onClick={aoAbrir}>
      {conteudo}
    </button>
  );
}

/** `alertSummary(alerts)`: um selo por severidade presente, na ordem do protótipo. */
export function ResumoAlertas({ alertas }: { alertas: readonly Alerta[] }) {
  const c: Partial<Record<Severidade, number>> = {};
  for (const a of alertas) c[a.severidade] = (c[a.severidade] ?? 0) + 1;
  return (
    <>
      {(Object.keys(SEV_UI) as Severidade[])
        .filter((k) => c[k])
        .map((k) => (
          <Selo key={k} cor={COR_RESUMO[k]}>
            {c[k]} {k.toLowerCase()}
          </Selo>
        ))}
    </>
  );
}

interface GavetaAlertasProps {
  alertas: readonly Alerta[];
  titulo?: string;
  /** Destino de cada alerta (ou `undefined` se não for link). A gaveta fecha antes de navegar. */
  destinoDe: (a: Alerta) => (() => void) | undefined;
  aoFechar: () => void;
}

/** `openAlertsDrawer(alerts, title)` do protótipo. */
export function GavetaAlertas({
  alertas,
  titulo = "Pendências e alertas",
  destinoDe,
  aoFechar,
}: GavetaAlertasProps) {
  return (
    <Gaveta
      titulo={titulo}
      eyebrow="Pendências e controles"
      sub="Situações que pedem atenção. Clique para abrir o lançamento correspondente."
      aoFechar={aoFechar}
      corpoSemRecuo
    >
      <div style={{ padding: "14px 22px" }} className="asum">
        <ResumoAlertas alertas={alertas} />
      </div>
      <div className="alist">
        {alertas.length ? (
          alertas.map((a, i) => {
            const ir = destinoDe(a);
            return (
              <ItemAlerta
                key={i}
                alerta={a}
                aoAbrir={
                  ir &&
                  (() => {
                    aoFechar();
                    ir();
                  })
                }
              />
            );
          })
        ) : (
          <div className="empty">
            <p>Sem pendências.</p>
          </div>
        )}
      </div>
    </Gaveta>
  );
}
