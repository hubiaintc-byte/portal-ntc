import "server-only";

import {
  CAMPOS_TEXTO_PROGRAMA,
  situacaoPrograma,
  type CampoTextoPrograma,
  type DependentesModulo,
  type DependentesPrograma,
  type ItemTituloDescricao,
  type SituacaoPrograma,
} from "@ntc/lib";
import type { Payload, PayloadRequest } from "payload";

import { contarDependentesModulo, contarDependentesPrograma } from "@/lib/crm/exclusaoCatalogo";
import { idaEVoltaPreserva, lexicalParaMarkdown } from "@/lib/markdownLexical";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura do catálogo comercial gerido pelo CRM (spec catálogo §2–§4).
 * Programas têm rascunho: a situação cruza a linha principal (sem `draft`)
 * com a última versão (`draft: true`) — ver `situacaoPrograma`.
 */

export interface AreaOpcao {
  id: string;
  nome: string;
}

export interface ProgramaCrmResumo {
  id: string;
  sigla: string;
  nome: string;
  areaId: string | null;
  area: string | null;
  situacao: SituacaoPrograma;
  numModulos: number;
}

export interface ModuloCrmResumo {
  id: string;
  numero: number;
  titulo: string;
  tituloComercial: string | null;
  programaId: string | null;
  programaSigla: string | null;
  valor: number | null;
  replay: string | null;
  certificacao: string | null;
}

export interface ModuloDoPrograma {
  id: string;
  numero: number;
  titulo: string;
  cargaHoraria: string | null;
}

export interface ProgramaCatalogoDetalhe {
  id: string;
  situacao: SituacaoPrograma;
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  textos: Record<CampoTextoPrograma, string>;
  /** Campos cujo conteúdo atual não sobrevive ao editor — salvar o campo perderia formatação. */
  textosComPerda: CampoTextoPrograma[];
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
  modulos: ModuloDoPrograma[];
  dependentes: DependentesPrograma;
}

export interface ModuloCatalogoDetalhe {
  id: string;
  programaId: string;
  numero: string;
  titulo: string;
  ementa: string;
  ementaComPerda: boolean;
  cargaHoraria: string;
  tituloComercial: string;
  valor: string;
  replay: string;
  certificacao: string;
  dependentes: DependentesModulo;
}

function idDe(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return null;
}

function nomeDe(v: unknown, campo: string): string | null {
  if (v && typeof v === "object" && campo in v) {
    const x = (v as Record<string, unknown>)[campo];
    return typeof x === "string" ? x : null;
  }
  return null;
}

export async function listarAreasCrm(): Promise<AreaOpcao[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "areas", depth: 0, limit: 50, sort: "nome" });
  return res.docs.map((a) => ({ id: String(a.id), nome: a.nome }));
}

export async function listarProgramasCrm(): Promise<ProgramaCrmResumo[]> {
  const payload = await obterPayload();
  const [ultimas, principais, modulos] = await Promise.all([
    payload.find({ collection: "programas", depth: 1, limit: 200, draft: true, sort: "sigla" }),
    payload.find({ collection: "programas", depth: 0, limit: 200, draft: false, select: { _status: true } }),
    payload.find({ collection: "modulos", depth: 0, limit: 2000, select: { programa: true } }),
  ]);
  const statusPrincipal = new Map(principais.docs.map((p) => [String(p.id), p._status]));
  const contagem = new Map<string, number>();
  for (const m of modulos.docs) {
    const pid = idDe(m.programa);
    if (pid !== null) contagem.set(pid, (contagem.get(pid) ?? 0) + 1);
  }
  return ultimas.docs.map((p) => ({
    id: String(p.id),
    sigla: p.sigla ?? "",
    nome: p.nomeCompleto ?? "",
    areaId: idDe(p.area),
    area: nomeDe(p.area, "nome"),
    situacao: situacaoPrograma(statusPrincipal.get(String(p.id)), p._status),
    numModulos: contagem.get(String(p.id)) ?? 0,
  }));
}

export async function listarModulosCrm(): Promise<ModuloCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "modulos", depth: 1, limit: 2000, sort: "numero" });
  return res.docs.map((m) => ({
    id: String(m.id),
    numero: m.numero,
    titulo: m.titulo,
    tituloComercial: m.comercial?.tituloComercial ?? null,
    programaId: idDe(m.programa),
    programaSigla: nomeDe(m.programa, "sigla"),
    valor: m.comercial?.valor ?? null,
    replay: m.comercial?.replay ?? null,
    certificacao: m.comercial?.certificacao ?? null,
  }));
}

export async function situacaoDoPrograma(
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<SituacaoPrograma> {
  const [principal, ultima] = await Promise.all([
    payload.findByID({ collection: "programas", id, depth: 0, draft: false, req }),
    payload.findByID({ collection: "programas", id, depth: 0, draft: true, req }),
  ]);
  return situacaoPrograma(principal._status, ultima._status);
}

export async function obterProgramaCatalogo(id: string): Promise<ProgramaCatalogoDetalhe | null> {
  const payload = await obterPayload();
  try {
    const [principal, p] = await Promise.all([
      payload.findByID({ collection: "programas", id, depth: 0, draft: false }),
      payload.findByID({ collection: "programas", id, depth: 0, draft: true }),
    ]);
    const [modulos, dependentes] = await Promise.all([
      payload.find({ collection: "modulos", where: { programa: { equals: id } }, depth: 0, limit: 200, sort: "numero" }),
      contarDependentesPrograma(payload, id),
    ]);
    const textos = {} as Record<CampoTextoPrograma, string>;
    const textosComPerda: CampoTextoPrograma[] = [];
    for (const { chave } of CAMPOS_TEXTO_PROGRAMA) {
      const doc: unknown = p[chave];
      textos[chave] = lexicalParaMarkdown(doc);
      if (!idaEVoltaPreserva(doc)) textosComPerda.push(chave);
    }
    return {
      id: String(p.id),
      situacao: situacaoPrograma(principal._status, p._status),
      sigla: p.sigla ?? "",
      nomeCompleto: p.nomeCompleto ?? "",
      areaId: idDe(p.area) ?? "",
      cargaHorariaTotal: p.cargaHorariaTotal ?? "",
      textos,
      textosComPerda,
      eixos: (p.eixosTematicos ?? []).map((e) => ({ titulo: e.titulo ?? "", descricao: e.descricao ?? "" })),
      diferenciais: (p.diferenciais ?? []).map((d) => ({ titulo: d.titulo ?? "", descricao: d.descricao ?? "" })),
      resultados: (p.resultadosEsperados ?? []).map((r) => r.resultado ?? ""),
      modulos: modulos.docs.map((m) => ({ id: String(m.id), numero: m.numero, titulo: m.titulo, cargaHoraria: m.cargaHoraria ?? null })),
      dependentes,
    };
  } catch (e) {
    console.error("[obterProgramaCatalogo]", e);
    return null;
  }
}

export async function obterModuloCatalogo(id: string): Promise<ModuloCatalogoDetalhe | null> {
  const payload = await obterPayload();
  try {
    const m = await payload.findByID({ collection: "modulos", id, depth: 0 });
    const dependentes = await contarDependentesModulo(payload, id);
    const valor = m.comercial?.valor;
    return {
      id: String(m.id),
      programaId: idDe(m.programa) ?? "",
      numero: String(m.numero),
      titulo: m.titulo,
      ementa: lexicalParaMarkdown(m.ementa),
      ementaComPerda: !idaEVoltaPreserva(m.ementa),
      cargaHoraria: m.cargaHoraria ?? "",
      tituloComercial: m.comercial?.tituloComercial ?? "",
      valor: valor === null || valor === undefined ? "" : String(valor).replace(".", ","),
      replay: m.comercial?.replay ?? "",
      certificacao: m.comercial?.certificacao ?? "",
      dependentes,
    };
  } catch (e) {
    console.error("[obterModuloCatalogo]", e);
    return null;
  }
}
