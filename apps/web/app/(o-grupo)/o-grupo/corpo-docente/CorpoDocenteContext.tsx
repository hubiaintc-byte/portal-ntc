"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { TabId } from "./conteudoCorpoDocente";

type CorpoDocenteCtx = {
  tabRequest: { id: TabId; nonce: number } | null;
  requestTab: (id: TabId) => void;
};

const Ctx = createContext<CorpoDocenteCtx | null>(null);

export function CorpoDocenteProvider({ children }: { children: ReactNode }) {
  const [tabRequest, setTabRequest] = useState<CorpoDocenteCtx["tabRequest"]>(null);

  const requestTab = useCallback((id: TabId) => {
    setTabRequest({ id, nonce: Date.now() });
  }, []);

  const value = useMemo(() => ({ tabRequest, requestTab }), [tabRequest, requestTab]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCorpoDocenteCtx(): CorpoDocenteCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCorpoDocenteCtx must be used inside CorpoDocenteProvider");
  return ctx;
}
