import { paragrafosParaLexical } from "@/lib/lexicalBuilders";

import type { PalestranteFolder } from "./parsearFolderEvento";

/**
 * Casa os palestrantes do folder com os Especialistas existentes (por nome
 * normalizado) e cria os desconhecidos com `ocultarDoSite: true` para revisão
 * (spec 2026-07-09 §2). Erro ao criar um especialista não bloqueia o evento —
 * o nome entra em `pendentes` e aparece no relatório do modal.
 */

/** Superfície mínima da Local API usada aqui — permite mock nos testes. */
export interface PayloadPalestrantes {
  find(args: {
    collection: "especialistas";
    /** 0 = sem limite (o adapter usa pagination:false). */
    limit: number;
    depth: 0;
    overrideAccess: true;
  }): Promise<{ docs: { id: string | number; nome: string }[] }>;
  create(args: {
    collection: "especialistas";
    data: Record<string, unknown>;
    /** Cria como rascunho: relaxa a foto required da coleção. */
    draft: true;
    overrideAccess: true;
  }): Promise<{ id: string | number }>;
}

export interface ResultadoPalestrantes {
  ids: (string | number)[];
  vinculados: string[];
  criados: string[];
  pendentes: string[];
}

/** minúsculas, sem acentos, espaços colapsados. */
export function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deduz a titulação (select da coleção) da linha em caps do folder. */
export function mapearTitulacao(
  linha: string,
): "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao" {
  const chave = linha
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z]/g, "");
  if (chave.includes("POSDOUTOR")) return "pos-doutorado";
  if (chave.includes("DOUTOR")) return "doutorado";
  if (chave.includes("MESTR")) return "mestrado";
  return "especializacao";
}

/** Segmento após o primeiro "·" da linha de titulação, ou fallback editorial. */
function instituicaoDaLinha(linha: string): string {
  const parte = linha.split("·").map((p) => p.trim())[1] ?? "";
  return parte.length > 0 ? parte : "[instituição a confirmar]";
}

export async function casarOuCriarPalestrantes(
  payload: PayloadPalestrantes,
  palestrantes: PalestranteFolder[],
): Promise<ResultadoPalestrantes> {
  const resultado: ResultadoPalestrantes = { ids: [], vinculados: [], criados: [], pendentes: [] };
  if (palestrantes.length === 0) return resultado;

  const existentes = await payload.find({
    collection: "especialistas",
    limit: 0,
    depth: 0,
    overrideAccess: true,
  });
  const porNome = new Map(existentes.docs.map((d) => [normalizarNome(d.nome), d.id]));

  for (const palestrante of palestrantes) {
    const idExistente = porNome.get(normalizarNome(palestrante.nome));
    if (idExistente !== undefined) {
      resultado.ids.push(idExistente);
      resultado.vinculados.push(palestrante.nome);
      continue;
    }
    try {
      const criado = await payload.create({
        collection: "especialistas",
        data: {
          nome: palestrante.nome,
          titulacao: mapearTitulacao(palestrante.linhaTitulacao),
          instituicao: instituicaoDaLinha(palestrante.linhaTitulacao),
          curriculoCurto: paragrafosParaLexical(
            palestrante.minicurriculo.length > 0
              ? [palestrante.minicurriculo]
              : ["[minicurrículo a definir pela equipe editorial]"],
          ),
          ocultarDoSite: true,
        },
        draft: true,
        overrideAccess: true,
      });
      resultado.ids.push(criado.id);
      resultado.criados.push(palestrante.nome);
    } catch {
      resultado.pendentes.push(palestrante.nome);
    }
  }
  return resultado;
}
