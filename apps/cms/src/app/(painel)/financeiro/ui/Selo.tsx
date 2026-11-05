"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Icone, type NomeIcone } from "./Icone";
import { PortalFin05 } from "./PortalFin05";

/**
 * Selos e marcadores do protótipo FIN-05: `.badge` (`badgeOp`/`badgeFin`),
 * `.vchip` (`vchip`), `.tag-validar` (`VALIDAR`) e o "i" de ajuda (`info`).
 */

export type CorSelo = "neutral" | "azul" | "verde" | "vermelho" | "dourado" | "outline" | "noite";

interface SeloProps {
  cor?: CorSelo;
  icone?: NomeIcone;
  children: ReactNode;
  /** Texto de apoio (atributo `title`), quando o selo resume algo. */
  titulo?: string;
}

/** `<span class="badge b-…">` com ícone `xs` opcional. */
export function Selo({ cor = "neutral", icone, children, titulo }: SeloProps) {
  return (
    <span className={`badge b-${cor}`} title={titulo}>
      {icone && <Icone nome={icone} tamanho="xs" />}
      {children}
    </span>
  );
}

/** `STATUS_OP` do protótipo: status operacional do evento → [cor, ícone]. */
const STATUS_OP: Record<string, [CorSelo, NomeIcone]> = {
  Planejado: ["outline", "circle-dashed"],
  "Em preparação": ["dourado", "clock"],
  "Em execução": ["azul", "play"],
  Realizado: ["verde", "check"],
  Encerrado: ["noite", "lock"],
};

/** `STATUS_FIN` do protótipo: status derivado de receita, custo, parcela e título → [cor, ícone]. */
const STATUS_FIN: Record<string, [CorSelo, NomeIcone]> = {
  Prevista: ["outline", "circle-dashed"],
  Contratada: ["azul", "file"],
  "Faturada parcialmente": ["dourado", "half"],
  Faturada: ["dourado", "receipt"],
  "Recebida parcialmente": ["azul", "half"],
  Recebida: ["verde", "check"],
  Previsto: ["outline", "circle-dashed"],
  Realizado: ["azul", "file"],
  "Pago parcialmente": ["dourado", "half"],
  Pago: ["verde", "check"],
  Programado: ["outline", "clock"],
  Vencido: ["vermelho", "alert"],
  Vencida: ["vermelho", "alert"],
};

interface SeloStatusProps {
  status: string;
  /** `operacional` = `badgeOp` (status do evento); `financeiro` = `badgeFin`. */
  tipo: "operacional" | "financeiro";
}

/** `badgeOp(s)` / `badgeFin(s)`: status desconhecido sai neutro com ponto, como no protótipo. */
export function SeloStatus({ status, tipo }: SeloStatusProps) {
  const [cor, icone] = (tipo === "operacional" ? STATUS_OP : STATUS_FIN)[status] ?? ["neutral", "dot"];
  return (
    <Selo cor={cor} icone={icone}>
      {status}
    </Selo>
  );
}

/** `VCLASS` do protótipo: vertical → classe de cor (`--vc`). */
export const CLASSE_VERTICAL: Record<string, string> = {
  Educação: "v-edu",
  "Gestão Pública": "v-gp",
  Saúde: "v-sau",
};

/** `vchip(v)`: quadradinho na cor da vertical + nome. */
export function ChipVertical({ vertical }: { vertical: string }) {
  return <span className={`vchip ${CLASSE_VERTICAL[vertical] ?? ""}`}>{vertical}</span>;
}

/** `VALIDAR(txt)`: marcador `[A VALIDAR]` (ou o texto dado, sem os colchetes). */
export function TagValidar({ texto = "A VALIDAR" }: { texto?: string }) {
  return <span className="tag-validar">[{texto}]</span>;
}

/**
 * `info(text)`: "i" de ajuda com a dica do protótipo (`.tip`), aberta no
 * hover e no foco. O texto também vai em `aria-label`, como no protótipo.
 */
export function Dica({ texto }: { texto: string }) {
  const alvo = useRef<HTMLSpanElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const [aberta, setAberta] = useState(false);

  // Mesma conta do protótipo: centraliza sobre o "i", cabe na janela, e
  // desce para baixo dele se não houver espaço em cima. Mede a caixa já
  // renderizada e só então a mostra (`.show`), sem piscar fora do lugar.
  useLayoutEffect(() => {
    const t = caixa.current;
    if (!aberta || !alvo.current || !t) return;
    const r = alvo.current.getBoundingClientRect();
    const w = Math.min(280, t.offsetWidth);
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.top - t.offsetHeight - 8;
    if (top < 8) top = r.bottom + 8;
    t.style.left = `${left}px`;
    t.style.top = `${top}px`;
    t.classList.add("show");
  }, [aberta]);

  const abrir = () => setAberta(true);
  const fechar = () => setAberta(false);

  return (
    <>
      <span
        ref={alvo}
        className="info-i"
        tabIndex={0}
        aria-label={texto}
        onMouseEnter={abrir}
        onMouseLeave={fechar}
        onFocus={abrir}
        onBlur={fechar}
      >
        <Icone nome="info" tamanho="xs" />
      </span>
      {/* Fora do `.view-enter`/modal (ambos com transform), para o `fixed` valer contra a janela. */}
      {aberta && (
        <PortalFin05>
          <div ref={caixa} className="tip" role="tooltip" style={{ left: -9999, top: -9999 }}>
            {texto}
          </div>
        </PortalFin05>
      )}
    </>
  );
}
