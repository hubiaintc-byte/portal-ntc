import "server-only";

import {
  faltasParaPublicar,
  CAMPOS_TEXTO_PROGRAMA,
  faltasParaRascunho,
  lerNumeroModulo,
  podeExcluirModulo,
  podeExcluirPrograma,
  quantidadeModulosVaiPublicado,
  semItensVazios,
  semResultadosVazios,
  type CampoTextoPrograma,
  type ItemTituloDescricao,
} from "@ntc/lib";
import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";
import { situacaoDoPrograma } from "@/lib/cms/catalogoCrm";
import { numeroOuNulo } from "@/lib/cms/painelCrmEscrita";
import { contarDependentesModulo, contarDependentesPrograma } from "@/lib/crm/exclusaoCatalogo";
import { executarEmTransacao } from "@/lib/crm/transacao";
import { lexicalParaMarkdown, markdownParaLexical } from "@/lib/markdownLexical";
import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Escrita do catálogo comercial (spec catálogo §3–§6). Validação sempre
 * ANTES da primeira escrita — um `return { ok: false }` dentro de
 * `executarEmTransacao` comita (ver o helper).
 */

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

export interface DadosPrograma {
  sigla: string;
  nomeCompleto: string;
  areaId: string;
  cargaHorariaTotal: string;
  /** Só os textos que o usuário alterou (todos, num programa novo). Ausente = não tocar — preserva formatação que o editor não representa. */
  textos: Partial<Record<CampoTextoPrograma, string>>;
  eixos: ItemTituloDescricao[];
  diferenciais: ItemTituloDescricao[];
  resultados: string[];
}

export interface DadosModulo {
  programaId: string;
  numero: string;
  titulo: string;
  /** Ausente = não tocar (obrigatória só na criação) — preserva formatação que o editor não representa. */
  ementa?: string;
  cargaHoraria: string;
  tituloComercial: string;
  valor: string;
  replay: string;
  certificacao: string;
}

export type ResultadoComId = ResultadoEscrita & { id?: string };

// O tipo gerado descreve o documento completo e não admite `null` nem o Lexical
// do conversor (`children: unknown[]`); aqui o rascunho nasce parcial (coberto
// por `versions.drafts`) e a conversão acontece uma vez, no limite da Local API
// — mesmo padrão de `salvarConteudoCms`/`criarEventoDePdf`.
type ProgramaData = RequiredDataFromCollectionSlug<"programas">;
type ModuloData = RequiredDataFromCollectionSlug<"modulos">;

const textoOuNulo = (v: string) => (v.trim() === "" ? null : v.trim());
const richOuNulo = (md: string) => (md.trim() === "" ? null : markdownParaLexical(md));
const aparar = (itens: ItemTituloDescricao[]): ItemTituloDescricao[] =>
  itens.map((i) => ({ titulo: i.titulo.trim(), descricao: i.descricao.trim() }));

async function recalcularQuantidade(payload: Payload, programaId: string | number, req: PayloadRequest): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "modulos", where: { programa: { equals: programaId } }, req });
  const situacao = await situacaoDoPrograma(payload, programaId, req);
  if (quantidadeModulosVaiPublicado(situacao)) {
    await payload.update({ collection: "programas", id: programaId, data: { modulosQuantidade: totalDocs }, req });
  } else {
    await payload.update({
      collection: "programas",
      id: programaId,
      data: { modulosQuantidade: totalDocs, _status: "draft" },
      draft: true,
      req,
    });
  }
}

export async function salvarPrograma(
  id: string | null,
  dados: DadosPrograma,
  publicar: boolean,
  usuario: UsuarioAutenticado,
): Promise<ResultadoComId> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoComId> => {
      const sigla = dados.sigla.trim().toUpperCase();
      const eixos = semItensVazios(dados.eixos);
      const diferenciais = semItensVazios(dados.diferenciais);
      const resultados = semResultadosVazios(dados.resultados);

      const faltasRascunho = faltasParaRascunho({ sigla, nomeCompleto: dados.nomeCompleto });
      if (!publicar && faltasRascunho.length > 0) return { ok: false, erro: `Para salvar, preencha: ${faltasRascunho.join(", ")}.` };

      if (publicar) {
        let visaoGeral = dados.textos.visaoGeral;
        if (visaoGeral === undefined) {
          visaoGeral = id === null ? "" : lexicalParaMarkdown((await payload.findByID({ collection: "programas", id, depth: 0, draft: true, req })).visaoGeral);
        }
        const faltas = faltasParaPublicar({ sigla, nomeCompleto: dados.nomeCompleto, areaId: dados.areaId, cargaHorariaTotal: dados.cargaHorariaTotal, visaoGeral, eixos, diferenciais, resultados });
        if (faltas.length > 0) return { ok: false, erro: `Para publicar, preencha: ${faltas.join(", ")}.` };
      }

      const repetida = await payload.find({
        collection: "programas",
        where: { and: [{ sigla: { equals: sigla } }, ...(id !== null ? [{ id: { not_equals: id } }] : [])] },
        draft: true,
        limit: 1,
        depth: 0,
        req,
      });
      if (repetida.docs.length > 0) return { ok: false, erro: `Já existe um programa com a sigla ${sigla}.` };

      const textos: Record<string, unknown> = {};
      for (const { chave } of CAMPOS_TEXTO_PROGRAMA) {
        const md = dados.textos[chave];
        if (md !== undefined) textos[chave] = richOuNulo(md);
      }
      const bruto: Record<string, unknown> = {
        sigla,
        nomeCompleto: dados.nomeCompleto.trim(),
        area: dados.areaId === "" ? null : Number(dados.areaId),
        cargaHorariaTotal: textoOuNulo(dados.cargaHorariaTotal),
        ...textos,
        eixosTematicos: aparar(eixos),
        diferenciais: aparar(diferenciais),
        resultadosEsperados: resultados.map((resultado) => ({ resultado: resultado.trim() })),
        _status: publicar ? "published" : "draft",
      };
      const data = bruto as unknown as ProgramaData;

      const doc =
        id === null
          ? await payload.create({ collection: "programas", data, draft: !publicar, req })
          : await payload.update({ collection: "programas", id, data, draft: !publicar, req });
      return { ok: true, id: String(doc.id) };
    });
  } catch (e) {
    console.error("[salvarPrograma]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function excluirPrograma(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoEscrita> => {
      const r = podeExcluirPrograma(await contarDependentesPrograma(payload, id, req));
      if (!r.ok) return { ok: false, erro: r.motivo };
      await payload.delete({ collection: "programas", id, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[excluirPrograma]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function idDe(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return null;
}

export async function salvarModulo(id: string | null, dados: DadosModulo, usuario: UsuarioAutenticado): Promise<ResultadoComId> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoComId> => {
      const numero = lerNumeroModulo(dados.numero);
      if (numero === null) return { ok: false, erro: "Número do módulo deve ser um inteiro a partir de 1." };
      const faltas = [
        dados.programaId === "" ? "Programa" : null,
        dados.titulo.trim() === "" ? "Título" : null,
        (id === null || dados.ementa !== undefined) && (dados.ementa ?? "").trim() === "" ? "Ementa" : null,
      ].filter((f): f is string => f !== null);
      if (faltas.length > 0) return { ok: false, erro: `Preencha: ${faltas.join(", ")}.` };
      const valor = numeroOuNulo(dados.valor);
      if ((dados.valor.trim() !== "" && valor === null) || (valor !== null && valor < 0)) {
        return { ok: false, erro: "Valor de referência inválido." };
      }

      const emUso = await payload.count({
        collection: "modulos",
        where: {
          and: [
            { programa: { equals: dados.programaId } },
            { numero: { equals: numero } },
            ...(id !== null ? [{ id: { not_equals: id } }] : []),
          ],
        },
        req,
      });
      if (emUso.totalDocs > 0) {
        const destino = await payload.findByID({ collection: "programas", id: dados.programaId, depth: 0, draft: true, req });
        return { ok: false, erro: `Já existe o módulo ${numero} em ${destino.sigla}.` };
      }

      const programaAnterior = id === null ? null : idDe((await payload.findByID({ collection: "modulos", id, depth: 0, req })).programa);

      const bruto: Record<string, unknown> = {
        programa: Number(dados.programaId),
        numero,
        titulo: dados.titulo.trim(),
        ...(dados.ementa !== undefined ? { ementa: markdownParaLexical(dados.ementa) } : {}),
        cargaHoraria: textoOuNulo(dados.cargaHoraria),
        comercial: {
          tituloComercial: textoOuNulo(dados.tituloComercial),
          valor,
          replay: textoOuNulo(dados.replay),
          certificacao: textoOuNulo(dados.certificacao),
        },
      };
      const data = bruto as unknown as ModuloData;
      const doc =
        id === null
          ? await payload.create({ collection: "modulos", data, req })
          : await payload.update({ collection: "modulos", id, data, req });

      if (id === null || programaAnterior !== dados.programaId) await recalcularQuantidade(payload, dados.programaId, req);
      if (programaAnterior !== null && programaAnterior !== dados.programaId) await recalcularQuantidade(payload, programaAnterior, req);
      return { ok: true, id: String(doc.id) };
    });
  } catch (e) {
    console.error("[salvarModulo]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function excluirModulo(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req): Promise<ResultadoEscrita> => {
      const r = podeExcluirModulo(await contarDependentesModulo(payload, id, req));
      if (!r.ok) return { ok: false, erro: r.motivo };
      const modulo = await payload.findByID({ collection: "modulos", id, depth: 0, req });
      await payload.delete({ collection: "modulos", id, req });
      const programaId = idDe(modulo.programa);
      if (programaId !== null) await recalcularQuantidade(payload, Number(programaId), req);
      return { ok: true };
    });
  } catch (e) {
    console.error("[excluirModulo]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
