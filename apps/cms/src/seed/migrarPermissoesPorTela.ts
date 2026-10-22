/**
 * Migração da etapa 1 das permissões por tela: converte o `perfil` legado
 * de cada usuário em `administrador`/`telas`. Só mexe em quem ainda não tem
 * nenhum dos dois. Idempotente.
 *
 * Dry-run por padrão (só lê e imprime o plano); aplica com
 * `PERMISSOES_MIGRAR_APLICAR=1`. Execução: `pnpm --filter @ntc/cms permissoes:migrar`.
 */

import { acessoDoPerfilLegado } from "../lib/cms/telas";
import type { TelaPainel } from "../lib/cms/telas";

const APLICAR = process.env.PERMISSOES_MIGRAR_APLICAR === "1";

export interface UsuarioParaMigrar {
  id: number;
  perfil?: string | null;
  administrador?: boolean | null;
  telas?: string[] | null;
}

export interface PlanoUsuario {
  id: number;
  administrador: boolean;
  telas: TelaPainel[];
}

/** Pura: só usuários sem `administrador` marcado e sem nenhuma tela. */
export function planejarMigracao(usuarios: UsuarioParaMigrar[]): PlanoUsuario[] {
  const plano: PlanoUsuario[] = [];
  for (const u of usuarios) {
    if (u.administrador || (u.telas && u.telas.length > 0)) continue;
    const acesso = acessoDoPerfilLegado(u.perfil);
    plano.push({ id: u.id, administrador: acesso.administrador, telas: [...acesso.telas] });
  }
  return plano;
}

async function main(): Promise<void> {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "users",
    limit: 1000,
    depth: 0,
    pagination: false,
  });
  const usuarios: UsuarioParaMigrar[] = docs.map((d) => {
    const u = d as unknown as UsuarioParaMigrar;
    return { id: u.id, perfil: u.perfil, administrador: u.administrador, telas: u.telas };
  });
  const plano = planejarMigracao(usuarios);

  console.log(`${APLICAR ? "APLICANDO" : "DRY-RUN"} — ${plano.length} de ${usuarios.length} usuário(s) a migrar`);
  let houveFalha = false;
  for (const p of plano) {
    const rotulo = `#${p.id} -> administrador=${p.administrador} telas=[${p.telas.join(", ")}]`;
    if (!APLICAR) {
      console.log(`  ${rotulo}`);
      continue;
    }
    try {
      await payload.update({
        collection: "users",
        id: p.id,
        data: { administrador: p.administrador, telas: p.telas },
      });
      console.log(`  ok ${rotulo}`);
    } catch (err) {
      houveFalha = true;
      console.error(`  ERRO ${rotulo}`, err);
    }
  }
  process.exit(houveFalha ? 1 : 0);
}

// Importável nos testes sem disparar `main()`.
if (!process.env.VITEST) {
  void main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
