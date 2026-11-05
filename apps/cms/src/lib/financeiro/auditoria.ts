import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from "payload";

/**
 * Histórico das coleções `fin-*` (spec §4.2): toda criação, alteração e
 * exclusão grava um item em `audit-log` com o `req` da escrita — mesma
 * transação — e `overrideAccess` (o `create` do `audit-log` é fechado a todos
 * pela REST). Erro na escrita do log propaga: a escrita do lançamento falha
 * junto (falha fechado).
 */

interface MetaColecaoFin {
  prefixo: string;
  rotulo: string;
  feminino: boolean;
}

/** Prefixos do protótipo FIN-05 (`PREFIX`: EV, RC, FR, CU, PG, CT). */
const COLECOES_FIN: Record<string, MetaColecaoFin> = {
  "fin-eventos": { prefixo: "EV", rotulo: "Evento", feminino: false },
  "fin-receitas": { prefixo: "RC", rotulo: "Receita", feminino: true },
  "fin-faturamentos": { prefixo: "FR", rotulo: "Faturamento", feminino: false },
  "fin-custos": { prefixo: "CU", rotulo: "Custo", feminino: false },
  "fin-pagamentos": { prefixo: "PG", rotulo: "Pagamento", feminino: false },
  "fin-contas": { prefixo: "CT", rotulo: "Conta", feminino: true },
};

/** Campos de relacionamento das coleções `fin-*` (comparados pelo id). */
const CAMPOS_RELACAO = ["eventoComercial", "evento", "receita", "custo", "conta"] as const;
const CAMPOS_IGNORADOS = new Set(["createdAt", "updatedAt"]);

/** Código legível do lançamento, no formato do protótipo: `codigoFin("fin-receitas", 3) === "RC-0003"`. */
export function codigoFin(slug: string, id: string | number): string {
  const meta = COLECOES_FIN[slug];
  const n = String(id).padStart(4, "0");
  return meta ? `${meta.prefixo}-${n}` : n;
}

type Verbo = "criado" | "alterado" | "excluído";

function descricaoFin(slug: string, id: string | number, verbo: Verbo): string {
  const meta = COLECOES_FIN[slug];
  if (!meta) return `${slug} ${id} ${verbo}`;
  const v = meta.feminino ? verbo.replace(/o$/, "a") : verbo;
  return `${meta.rotulo} ${codigoFin(slug, id)} ${v}`;
}

type Registro = Record<string, unknown>;

/**
 * O `doc` do `afterChange` sai populado na profundidade da chamada, e o
 * `previousDoc` vem com `depth: 0` — sem isto, todo relacionamento populado
 * pareceria "mudado". Troca o objeto populado pelo id, só nos campos de
 * relacionamento de topo (as linhas de `etapas` também têm `id`).
 */
function normalizar(doc: Registro): Registro {
  const r: Registro = { ...doc };
  for (const campo of CAMPOS_RELACAO) {
    const v = r[campo];
    if (v && typeof v === "object" && "id" in v) r[campo] = (v as { id: unknown }).id;
  }
  return r;
}

/** Campos que mudaram entre `antes` e `depois` (comparação por `JSON.stringify`). */
export function mudancasFin(
  antes: Registro,
  depois: Registro,
): Record<string, { antes: unknown; depois: unknown }> {
  const a = normalizar(antes);
  const d = normalizar(depois);
  const mudancas: Record<string, { antes: unknown; depois: unknown }> = {};
  for (const campo of new Set([...Object.keys(a), ...Object.keys(d)])) {
    if (CAMPOS_IGNORADOS.has(campo)) continue;
    const va = a[campo] ?? null;
    const vd = d[campo] ?? null;
    if (JSON.stringify(va) !== JSON.stringify(vd)) mudancas[campo] = { antes: va, depois: vd };
  }
  return mudancas;
}

async function gravar(
  req: PayloadRequest,
  slug: string,
  id: string | number,
  acao: "criar" | "atualizar" | "deletar",
  verbo: Verbo,
  metadata: Registro,
): Promise<void> {
  await req.payload.create({
    collection: "audit-log",
    data: {
      usuario: (req.user?.id as number | undefined) ?? null,
      acao,
      entidade: slug,
      entidadeId: String(id),
      descricao: descricaoFin(slug, id, verbo),
      metadata,
    },
    overrideAccess: true,
    req,
  });
}

/** `afterChange` das seis coleções `fin-*`. */
export const registrarAuditoriaFin: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  const registro = doc as Registro & { id: string | number };
  if (operation === "create") {
    await gravar(req, collection.slug, registro.id, "criar", "criado", {
      registro: normalizar(registro),
    });
    return doc;
  }
  const mudancas = mudancasFin((previousDoc ?? {}) as Registro, registro);
  if (Object.keys(mudancas).length === 0) return doc;
  await gravar(req, collection.slug, registro.id, "atualizar", "alterado", { mudancas });
  return doc;
};

/** `afterDelete` das seis coleções `fin-*`. */
export const registrarExclusaoFin: CollectionAfterDeleteHook = async ({
  doc,
  id,
  req,
  collection,
}) => {
  const registro = doc as Registro;
  await gravar(
    req,
    collection.slug,
    (registro.id as string | number | undefined) ?? id,
    "deletar",
    "excluído",
    {
      registro: normalizar(registro),
    },
  );
  return doc;
};
