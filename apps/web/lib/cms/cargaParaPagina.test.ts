/**
 * Ida e volta da CARGA das 15 páginas, atravessando os dois apps: o que o
 * planejador da carga (`apps/cms`, `planejarCargaPaginas`) grava num CMS
 * vazio, mesclado como o Payload mescla um `update`, lido de volta pelo
 * adaptador do site (`docParaCampos`) e montado por `camposParaPagina` tem
 * de dar a página estática do instantâneo, campo a campo.
 *
 * Fica no `apps/web` porque o adaptador do site importa `@/lib/…` do web; o
 * planejador do cms é importado pelo caminho relativo — a cadeia dele
 * (`planejarCargaPaginas` → `paginaParaCampos` → `mapear`/`htmlParaLexical`
 * → `lexicalBuilders`) só usa imports relativos e `@ntc/lib`, para compilar
 * e rodar sob o `@/` do web.
 */
import { describe, expect, it, vi } from "vitest";

import { camposParaPagina, type ConteudoPrograma, type ExtrasEventos, type PaginaPrograma } from "@ntc/lib";
import type { Modulo, Programa } from "@ntc/types/payload-types";

vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({}) }));

import paginas from "../../../cms/src/seed/assets/paginas-programas.json";
import { romanoParaInteiro } from "../../../cms/src/lib/cms/importacaoProgramas/mapear";
import { paginaParaCampos } from "../../../cms/src/lib/cms/importacaoProgramas/paginaParaCampos";
import {
  planejarCargaPaginas,
  type ProgramaAtual,
} from "../../../cms/src/lib/cms/importacaoProgramas/planejarCargaPaginas";

import { docParaCampos } from "./programas";

type CartaoInstantaneo = PaginaPrograma["cartao"] & { sigla: string };
const instantaneo = paginas as unknown as { programas: ConteudoPrograma[]; cartoes: CartaoInstantaneo[] };

function extrasDe(p: ConteudoPrograma): ExtrasEventos {
  const status: ExtrasEventos["status"] = new Map();
  for (const m of p.modulos.itens) {
    const n = romanoParaInteiro(m.numero);
    if (n !== null && m.statusRotulo && m.statusTipo) status.set(n, { rotulo: m.statusRotulo, tipo: m.statusTipo });
  }
  return { modulosAbertos: { feature: p.modulosAbertos?.feature, miniStack: p.modulosAbertos?.miniStack }, status };
}

function cartaoDe(sigla: string): PaginaPrograma["cartao"] {
  const c = instantaneo.cartoes.find((k) => k.sigla === sigla);
  if (!c) throw new Error(`sem cartão para ${sigla}`);
  const { sigla: _s, ...cartao } = c;
  return cartao;
}

/** CMS vazio: o programa e os módulos existem (a carga nunca cria), sem conteúdo. */
function cmsVazio(estatico: ConteudoPrograma): ProgramaAtual {
  const { campos } = paginaParaCampos(estatico);
  return {
    id: 1,
    sigla: estatico.sigla,
    slug: null,
    nomeCompleto: null,
    cargaHorariaTotal: null,
    _status: "draft",
    visaoGeral: null,
    problema: null,
    objetivo: null,
    publicoAlvo: null,
    eixosTematicos: [],
    resultadosEsperados: [],
    diferenciais: [],
    faq: [],
    pagina: { identidadeVisual: "vertente", docentes: {}, cartao: {} },
    modulos: campos.modulos.map((m) => ({ id: 100 + m.numero, numero: m.numero, ementa: null, topicos: [] })),
  };
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Merge como o do Payload no update: grupos se mesclam, arrays, Lexical e folhas são substituídos. */
function mesclar(base: unknown, dados: Record<string, unknown>): Record<string, unknown> {
  const saida: Record<string, unknown> = ehObjeto(base) ? { ...base } : {};
  for (const [k, v] of Object.entries(dados)) {
    saida[k] = ehObjeto(v) && ehObjeto(saida[k]) && !("root" in v) ? mesclar(saida[k], v) : v;
  }
  return saida;
}

describe("carga → Payload → site: as 15 páginas saem iguais às estáticas", () => {
  it("o instantâneo tem os 15", () => {
    expect(instantaneo.programas).toHaveLength(15);
  });

  for (const estatico of instantaneo.programas) {
    it(estatico.slug, () => {
      const atual = cmsVazio(estatico);
      const plano = planejarCargaPaginas(atual, estatico, cartaoDe(estatico.sigla));
      expect(plano.divergencias).toEqual([]);
      expect(plano.avisos).toEqual([]);

      const { modulos: _m, ...programaAtual } = atual;
      const doc = {
        ...mesclar(programaAtual, plano.dados.programa ?? {}),
        area: { id: 1, sigla: estatico.vertical },
      } as unknown as Programa;
      const modulos = atual.modulos.map((m) => {
        const escrita = plano.dados.modulos.find((e) => e.id === m.id);
        return { ...m, programa: 1, ...(escrita?.data ?? {}) } as unknown as Modulo;
      });

      const campos = docParaCampos(doc, modulos);
      expect(campos.pagina.cartao).toEqual(cartaoDe(estatico.sigla));
      expect(camposParaPagina(campos, extrasDe(estatico))).toStrictEqual(estatico);
    });
  }
});
