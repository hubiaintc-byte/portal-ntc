import type { CollectionBeforeDeleteHook, Payload, PayloadRequest } from "payload";

import { podeExcluirModulo, podeExcluirPrograma, type DependentesModulo, type DependentesPrograma } from "@ntc/lib";

/**
 * Dependentes de programa e módulo do catálogo (spec catálogo §6). Uma só
 * contagem para a tela (estado do botão), a escrita (recusa antes do delete)
 * e o hook `beforeDelete` (falha fechado se a UI for contornada).
 *
 * Referências em `areas.programasDestacados` e em `programasRelacionados` de
 * outros programas NÃO bloqueiam: são hasMany em tabela `_rels`, que o banco
 * limpa sozinho no delete.
 */
export async function contarDependentesPrograma(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<DependentesPrograma> {
  const [modulos, propostas, leads, eventos, especialistas] = await Promise.all([
    payload.count({ collection: "modulos", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "propostas", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "leads", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "eventos", where: { programa: { equals: id } }, req }),
    payload.count({ collection: "especialistas", where: { programasRelacionados: { equals: id } }, req }),
  ]);
  return {
    modulos: modulos.totalDocs,
    propostas: propostas.totalDocs,
    leads: leads.totalDocs,
    eventos: eventos.totalDocs,
    especialistas: especialistas.totalDocs,
  };
}

/**
 * Proposta conta pelos dois caminhos: `modulos` (os contratados) e
 * `modulosDetalhados.modulo` (o conteúdo congelado do documento) — apagar um
 * módulo referenciado só pelo segundo dispararia o fail-safe da Sessão 2
 * (tabela por módulo some do PDF).
 */
export async function contarDependentesModulo(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<DependentesModulo> {
  const [propostas, eventosComerciais] = await Promise.all([
    payload.count({
      collection: "propostas",
      where: { or: [{ modulos: { equals: id } }, { "modulosDetalhados.modulo": { equals: id } }] },
      req,
    }),
    payload.count({ collection: "eventos-comerciais", where: { moduloCatalogo: { equals: id } }, req }),
  ]);
  return { propostas: propostas.totalDocs, eventosComerciais: eventosComerciais.totalDocs };
}

export const bloquearProgramaComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const r = podeExcluirPrograma(await contarDependentesPrograma(req.payload, id, req));
  if (!r.ok) throw new Error(r.motivo);
};

export const bloquearModuloComDependentes: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const r = podeExcluirModulo(await contarDependentesModulo(req.payload, id, req));
  if (!r.ok) throw new Error(r.motivo);
};
