/**
 * Importa o export JSON do CRM legado (NTC_Comercial_Premium) para o Payload.
 *
 * Uso:
 *   CRM_JSON=/caminho/backup.json CRM_DRY_RUN=1 pnpm crm:importar   # só relata
 *   CRM_JSON=/caminho/backup.json pnpm crm:importar                 # executa
 *
 * Env vars em vez de flags porque o pnpm engole flags sem `--`.
 * Idempotente: reexecutar não duplica (chaves naturais — ver importadorCrm.ts).
 */
import fs from "node:fs";

import { getPayload, type RequiredDataFromCollectionSlug } from "payload";

import { slugDeRotulo } from "@ntc/lib";

import {
  planejarImportacao,
  type ExistentesNoBanco,
  type ExportCrmLegado,
} from "../lib/crm/importadorCrm";
import config from "../payload.config";

// Os selects do plano já saem validados contra as listas de @ntc/lib em
// importadorCrm.ts (slugValidado/ufValidada) — o valor é sempre um dos
// literais da coleção, ou null. Os tipos abaixo refletem essa garantia,
// evitando `any` na montagem dos `data` de create.
type TipoClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["tipo"];
type UfClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["uf"];
type EsferaClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["esfera"];
type AreaClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["area"];
type OrigemClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["origem"];
type StatusClienteCrm = RequiredDataFromCollectionSlug<"clientes-crm">["status"];
type UfOportunidade = RequiredDataFromCollectionSlug<"oportunidades">["uf"];
type OrigemOportunidade = RequiredDataFromCollectionSlug<"oportunidades">["origem"];
type StatusOportunidade = RequiredDataFromCollectionSlug<"oportunidades">["status"];

const caminho = process.env.CRM_JSON;
const dryRun = process.env.CRM_DRY_RUN === "1";
if (!caminho) {
  console.error("Defina CRM_JSON=/caminho/do/backup.json");
  process.exit(1);
}

const dados = JSON.parse(fs.readFileSync(caminho, "utf-8")) as ExportCrmLegado;
const payload = await getPayload({ config });

// ---- Carrega o estado atual do banco para os mapas de casamento ----
const [programas, modulos, eventos, clientes, contatos, oportunidades, usuarios] = await Promise.all([
  payload.find({ collection: "programas", depth: 0, limit: 500, draft: true }),
  payload.find({ collection: "modulos", depth: 0, limit: 1000, draft: true }),
  payload.find({ collection: "eventos", depth: 0, limit: 1000, draft: true }),
  payload.find({ collection: "clientes-crm", depth: 0, limit: 2000 }),
  payload.find({ collection: "contatos-crm", depth: 1, limit: 2000 }),
  payload.find({ collection: "oportunidades", depth: 0, limit: 2000 }),
  payload.find({ collection: "users", depth: 0, limit: 200 }),
]);

/** Relação pode vir populada (depth>0) ou como id cru — normaliza para string. */
const idRel = (v: unknown): string =>
  typeof v === "object" && v !== null && "id" in v ? String((v as { id: unknown }).id) : String(v);

const existentes: ExistentesNoBanco = {
  programasPorSigla: new Map(programas.docs.map((p) => [(p.sigla ?? "").toLowerCase(), String(p.id)])),
  modulosPorChave: new Map(
    modulos.docs.map((m) => [
      `${idRel(m.programa)}#${m.numero}`,
      { id: String(m.id), comercialVazio: !m.comercial?.tituloComercial && !m.comercial?.valor },
    ]),
  ),
  eventosPorNome: new Map(eventos.docs.map((e) => [slugDeRotulo(e.nome), String(e.id)])),
  clientesPorChave: new Map(
    clientes.docs.map((c) => [`${slugDeRotulo(c.orgao)}#${c.uf ?? ""}`, String(c.id)]),
  ),
  contatosPorChave: new Set(contatos.docs.map((c) => `${idRel(c.cliente)}#${slugDeRotulo(c.nome)}`)),
  oportunidadesPorCodigo: new Set(oportunidades.docs.map((o) => o.codigo)),
  usuariosPorEmail: new Map(usuarios.docs.map((u) => [u.email.toLowerCase(), String(u.id)])),
};

const plano = planejarImportacao(dados, existentes);

console.log("=== Plano de importação ===");
console.log(JSON.stringify(plano.resumo, null, 2));
for (const aviso of plano.avisos) console.log(`AVISO: ${aviso}`);

if (dryRun) {
  console.log("Dry-run: nada foi gravado.");
  process.exit(0);
}

/** Converte um id em string (garantido numérico pelo importador puro) para o formato que o Payload espera nas relações. */
const paraIdPayload = (id: string): number => Number(id);

// ---- Execução: clientes → contatos/oportunidades (refs resolvidas) → módulos/eventos ----
const idPorClienteLegado = new Map<string, string>();
for (const item of plano.criarClientes) {
  const doc = await payload.create({
    collection: "clientes-crm",
    data: {
      orgao: item.data.orgao,
      sigla: item.data.sigla,
      tipo: item.data.tipo as TipoClienteCrm,
      municipio: null,
      uf: item.data.uf as UfClienteCrm,
      esfera: item.data.esfera as EsferaClienteCrm,
      area: item.data.area as AreaClienteCrm,
      cnpj: item.data.cnpj,
      dirigente: item.data.dirigente,
      cargoDirigente: item.data.cargoDirigente,
      email: item.data.email,
      origem: item.data.origem as OrigemClienteCrm,
      potencial: item.data.potencial,
      status: item.data.status as StatusClienteCrm,
      responsavel: item.data.responsavel ? paraIdPayload(item.data.responsavel) : null,
      proximaAcao: item.data.proximaAcao,
    },
  });
  idPorClienteLegado.set(item.idLegado, String(doc.id));
}

/** Resolve o marcador `{ clienteLegadoId }` (cliente criado nesta mesma rodada) para o id numérico recém-criado. */
const resolverClienteId = (
  cliente: string | { clienteLegadoId: string },
  clienteLegadoId: string,
): number | null => {
  if (typeof cliente === "string") return paraIdPayload(cliente); // já era id do banco
  const novo = idPorClienteLegado.get(clienteLegadoId);
  return novo ? paraIdPayload(novo) : null;
};

for (const item of plano.criarContatos) {
  const clienteId = resolverClienteId(item.data.cliente, item.clienteLegadoId);
  if (clienteId === null) continue;
  await payload.create({
    collection: "contatos-crm",
    data: {
      nome: item.data.nome,
      cliente: clienteId,
      cargo: item.data.cargo,
      setor: item.data.setor,
      email: item.data.email,
      whatsapp: item.data.whatsapp,
      principal: item.data.principal,
      decisor: item.data.decisor,
    },
  });
}

for (const item of plano.criarOportunidades) {
  const clienteId = resolverClienteId(item.data.cliente, item.clienteLegadoId);
  if (clienteId === null) continue;
  await payload.create({
    collection: "oportunidades",
    data: {
      codigo: item.data.codigo,
      cliente: clienteId,
      programa: item.data.programa ? paraIdPayload(item.data.programa) : null,
      modulos: item.data.modulos.map(paraIdPayload),
      eventos: item.data.eventos.map(paraIdPayload),
      uf: item.data.uf as UfOportunidade,
      origem: item.data.origem as OrigemOportunidade,
      quantidade: item.data.quantidade,
      modalidade: item.data.modalidade,
      valor: item.data.valor,
      probabilidade: item.data.probabilidade,
      status: item.data.status as StatusOportunidade,
      dataAbertura: item.data.dataAbertura,
      dataPrevFechamento: item.data.dataPrevFechamento,
      proximaAcao: item.data.proximaAcao,
      followup: item.data.followup,
      responsavel: item.data.responsavel ? paraIdPayload(item.data.responsavel) : null,
      observacoes: item.data.observacoes,
    },
  });
}

for (const item of plano.atualizarModulos) {
  await payload.update({
    collection: "modulos",
    id: item.id,
    data: { comercial: item.comercial },
  });
}

for (const item of plano.atualizarEventos) {
  await payload.update({
    collection: "eventos",
    id: item.id,
    data: { comercial: item.comercial },
  });
}

console.log("Importação concluída.");
process.exit(0);
