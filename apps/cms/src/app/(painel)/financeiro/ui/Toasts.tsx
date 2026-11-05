"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Icone } from "./Icone";
import { PortalFin05 } from "./PortalFin05";

/**
 * `toast(title, desc, kind)` do protótipo FIN-05: `.toasts > .toast(.err)`
 * com `role="status"`, some sozinho (3,4 s; erro 5,2 s), com a animação de
 * saída `.out`. Sai por `PortalFin05`, fora do `.view-enter` animado.
 *
 * Uso: `const { toasts, mostrar } = useToasts();` e renderizar `{toasts}`.
 * Navegar para outra tela remonta a tela e leva os toasts junto.
 */

interface ItemToast {
  id: number;
  titulo: string;
  descricao?: string;
  erro: boolean;
  saindo: boolean;
}

export type MostrarToast = (titulo: string, descricao?: string, tipo?: "ok" | "erro") => void;

export function useToasts(): { toasts: ReactNode; mostrar: MostrarToast } {
  const [itens, setItens] = useState<ItemToast[]>([]);
  const proximo = useRef(1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((x) => window.clearTimeout(x));
  }, []);

  const mostrar = useCallback<MostrarToast>((titulo, descricao, tipo = "ok") => {
    const id = proximo.current++;
    const erro = tipo === "erro";
    setItens((xs) => [...xs, { id, titulo, descricao, erro, saindo: false }]);
    timers.current.push(
      window.setTimeout(
        () => {
          setItens((xs) => xs.map((x) => (x.id === id ? { ...x, saindo: true } : x)));
          timers.current.push(
            window.setTimeout(() => setItens((xs) => xs.filter((x) => x.id !== id)), 250),
          );
        },
        erro ? 5200 : 3400,
      ),
    );
  }, []);

  const toasts =
    itens.length > 0 ? (
      <PortalFin05>
        <div className="toasts">
          {itens.map((t) => (
            <div
              key={t.id}
              className={`toast${t.erro ? " err" : ""}${t.saindo ? " out" : ""}`}
              role="status"
            >
              <div className="ti">
                <Icone nome={t.erro ? "alert" : "check"} tamanho="xs" />
              </div>
              <div>
                <div className="tt">{t.titulo}</div>
                {t.descricao && <div className="td">{t.descricao}</div>}
              </div>
            </div>
          ))}
        </div>
      </PortalFin05>
    ) : null;

  return { toasts, mostrar };
}
