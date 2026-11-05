import { readFileSync } from "node:fs";
import type { LivroFinanceiro } from "../tipos";

export type Saidas = Record<string, Record<string, Record<string, unknown>>>;

export interface FixtureParidade {
  hoje: string;
  db: LivroFinanceiro;
  saidas: Saidas;
}

/** Lê o fixture do protótipo e completa os campos de integração que ele não tem. */
export function carregarFixture(): FixtureParidade {
  const bruto = JSON.parse(
    readFileSync(new URL("./paridade-fin05.json", import.meta.url), "utf8"),
  ) as { hoje: string; db: Record<string, unknown[]>; saidas: Saidas };
  const db = {
    ...bruto.db,
    eventos: bruto.db.eventos!.map((e) => ({
      origem: "financeiro",
      eventoComercialId: null,
      cadastroPendente: false,
      canceladoNoCrm: false,
      camposDoCrm: [],
      ...(e as object),
    })),
  } as unknown as LivroFinanceiro;
  return { hoje: bruto.hoje, db, saidas: bruto.saidas };
}
