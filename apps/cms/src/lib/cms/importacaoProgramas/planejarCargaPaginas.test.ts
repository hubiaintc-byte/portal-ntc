import { describe, expect, it } from "vitest";

import type { ConteudoPrograma } from "@ntc/lib";

import paginas from "@/seed/assets/paginas-programas.json";
import instantaneo from "@/seed/assets/programas.json";

import { mapearPrograma } from "./mapear";
import { planejarCargaPaginas, temRascunhoPendente } from "./planejarCargaPaginas";
import type { PlanoCargaPagina, ProgramaAtual } from "./planejarCargaPaginas";
import type { ProgramaInstantaneo } from "./tipos";

const estaticos = (paginas as { programas: ConteudoPrograma[] }).programas;
const antigosPorSigla = new Map(
  (instantaneo as { programas: ProgramaInstantaneo[] }).programas.map((p) => [p.sigla, p]),
);

/** O que o CMS guarda hoje: o import de 30/09, sem nada da página. */
function atualDe30Set(estatico: ConteudoPrograma): ProgramaAtual {
  const antigo = antigosPorSigla.get(estatico.sigla);
  if (!antigo) throw new Error(`sem 30/09 para ${estatico.sigla}`);
  const { campos, modulos } = mapearPrograma(antigo);
  return {
    id: 1,
    sigla: antigo.sigla,
    slug: antigo.slug,
    nomeCompleto: antigo.nomeCompleto,
    cargaHorariaTotal: campos.cargaHorariaTotal ?? null,
    _status: "published",
    visaoGeral: campos.visaoGeral,
    problema: campos.problema,
    objetivo: campos.objetivo ?? null,
    publicoAlvo: campos.publicoAlvo,
    eixosTematicos: campos.eixosTematicos.map((e, i) => ({ ...e, id: `e${i}` })),
    resultadosEsperados: campos.resultadosEsperados.map((r, i) => ({ ...r, id: `r${i}` })),
    diferenciais: campos.diferenciais,
    faq: campos.faq,
    pagina: { identidadeVisual: "vertente", docentes: {}, cartao: {} },
    modulos: modulos.map((m) => ({
      id: 100 + m.numero,
      numero: m.numero,
      titulo: m.titulo,
      cargaHoraria: m.cargaHoraria,
      ementa: m.ementa,
      topicos: [],
    })),
  };
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Merge como o do Payload no update: grupos se mesclam, arrays e folhas são substituídos. */
function mesclar(base: unknown, dados: Record<string, unknown>): Record<string, unknown> {
  const saida: Record<string, unknown> = ehObjeto(base) ? { ...base } : {};
  for (const [k, v] of Object.entries(dados)) {
    saida[k] = ehObjeto(v) && ehObjeto(saida[k]) && !("root" in v) ? mesclar(saida[k], v) : v;
  }
  return saida;
}

function aplicar(atual: ProgramaAtual, plano: PlanoCargaPagina): ProgramaAtual {
  const programa = plano.dados.programa ? mesclar(atual, plano.dados.programa) : { ...atual };
  const modulos = atual.modulos.map((m) => {
    const escrita = plano.dados.modulos.find((e) => e.id === m.id);
    return escrita ? { ...m, ...escrita.data } : m;
  });
  return { ...(programa as unknown as ProgramaAtual), modulos };
}

function paginaDe(plano: PlanoCargaPagina): Record<string, unknown> {
  const pagina = plano.dados.programa?.pagina;
  return ehObjeto(pagina) ? pagina : {};
}

const primeiro = estaticos[0] as ConteudoPrograma;

describe("planejarCargaPaginas — os 15 contra o CMS de 30/09", () => {
  for (const estatico of estaticos) {
    it(estatico.sigla, () => {
      const plano = planejarCargaPaginas(atualDe30Set(estatico), estatico);
      expect(plano.divergencias).toEqual([]);
      expect(plano.acao).toBe("atualizar");
      expect(plano.semMudancas).toBe(false);
      const dados = plano.dados.programa ?? {};
      expect(dados._status).toBe("published");
      // Os três campos juntados em 30/09 são divididos (cada um com a sua parte).
      expect(dados).toHaveProperty("problema");
      expect(paginaDe(plano)).toHaveProperty("problemaDestaque");
      expect(dados).toHaveProperty("publicoAlvo");
      expect(paginaDe(plano)).toHaveProperty("publicoChips");
      expect(plano.dados.modulos).toHaveLength(estatico.modulos.itens.length);
      // Campos iguais nos dois lados não são reescritos.
      expect(dados).not.toHaveProperty("visaoGeral");
      expect(dados).not.toHaveProperty("eixosTematicos");
      expect(dados).not.toHaveProperty("faq");
    });
  }
});

describe("planejarCargaPaginas — regras", () => {
  it("atual null → sem-programa, nada a gravar", () => {
    const plano = planejarCargaPaginas(null, primeiro);
    expect(plano.acao).toBe("sem-programa");
    expect(plano.dados.programa).toBeNull();
    expect(plano.dados.modulos).toEqual([]);
  });

  it("visaoGeral com uma palavra trocada → divergente e não escrita", () => {
    const atual = atualDe30Set(primeiro);
    const visao = structuredClone(atual.visaoGeral) as {
      root: { children: { children: { text: string }[] }[] };
    };
    const texto = visao.root.children[0]?.children[0];
    if (!texto) throw new Error("fixture sem texto");
    texto.text = texto.text.replace(/\S+/, "Trocada");
    const plano = planejarCargaPaginas({ ...atual, visaoGeral: visao }, primeiro);
    expect(plano.acao).toBe("divergente");
    expect(plano.divergencias).toEqual(["visaoGeral"]);
    expect(plano.dados.programa).not.toHaveProperty("visaoGeral");
    // O resto continua sendo carregado.
    expect(paginaDe(plano).heroTitulo).toBeTruthy();
  });

  it("aplicar o plano e planejar de novo → sem mudanças (idempotente)", () => {
    for (const estatico of estaticos) {
      const atual = atualDe30Set(estatico);
      const depois = aplicar(atual, planejarCargaPaginas(atual, estatico));
      const segundo = planejarCargaPaginas(depois, estatico);
      expect(segundo.divergencias, estatico.sigla).toEqual([]);
      expect(segundo.dados.programa, estatico.sigla).toBeNull();
      expect(segundo.dados.modulos, estatico.sigla).toEqual([]);
      expect(segundo.semMudancas, estatico.sigla).toBe(true);
    }
  });

  it("cada documento dividido vai no mesmo update que a sua parte", () => {
    for (const estatico of estaticos) {
      const plano = planejarCargaPaginas(atualDe30Set(estatico), estatico);
      const dados = plano.dados.programa ?? {};
      expect("problema" in dados).toBe("problemaDestaque" in paginaDe(plano));
      expect("publicoAlvo" in dados).toBe("publicoChips" in paginaDe(plano));
      for (const m of plano.dados.modulos) {
        expect("ementa" in m.data, `${estatico.sigla} ${m.numero}`).toBe("topicos" in m.data);
      }
    }
  });

  it("problema divergente → nem o corpo nem o destaque são escritos", () => {
    const atual = atualDe30Set(primeiro);
    const problema = structuredClone(atual.problema) as { root: { children: unknown[] } };
    problema.root.children.push({
      type: "paragraph",
      version: 1,
      children: [{ type: "text", text: "Parágrafo novo do CRM.", format: 0, version: 1 }],
    });
    const plano = planejarCargaPaginas({ ...atual, problema }, primeiro);
    expect(plano.divergencias).toEqual(["problema"]);
    expect(plano.dados.programa).not.toHaveProperty("problema");
    expect(paginaDe(plano)).not.toHaveProperty("problemaDestaque");
    expect(paginaDe(plano)).toHaveProperty("publicoChips");
  });

  it("ementa divergente → nem a descrição nem os tópicos do módulo são escritos", () => {
    const atual = atualDe30Set(primeiro);
    const [m1, ...resto] = atual.modulos;
    if (!m1) throw new Error("fixture sem módulo");
    const plano = planejarCargaPaginas(
      { ...atual, modulos: [{ ...m1, ementa: { root: { children: [] } } }, ...resto] },
      primeiro,
    );
    // Ementa vazia no CMS não é divergência: é preenchida.
    expect(plano.divergencias).toEqual([]);

    const ementa = structuredClone(m1.ementa) as { root: { children: unknown[] } };
    ementa.root.children.splice(0, 1);
    const divergente = planejarCargaPaginas(
      { ...atual, modulos: [{ ...m1, ementa }, ...resto] },
      primeiro,
    );
    expect(divergente.divergencias).toEqual([`modulos[${m1.numero}].ementa`]);
    expect(divergente.dados.modulos.find((m) => m.id === m1.id)).toBeUndefined();
  });

  it("campo da página já editado no CMS não é sobrescrito", () => {
    const atual = atualDe30Set(primeiro);
    const plano = planejarCargaPaginas(
      { ...atual, pagina: { ...atual.pagina, heroTitulo: "Título editado no painel" } },
      primeiro,
    );
    expect(plano.divergencias).toEqual(["pagina.heroTitulo"]);
    expect(paginaDe(plano)).not.toHaveProperty("heroTitulo");
    expect(paginaDe(plano)).toHaveProperty("heroSubtitulo");
  });

  it("rascunho não publicado → divergente, nada gravado", () => {
    const plano = planejarCargaPaginas(
      { ...atualDe30Set(primeiro), rascunhoPendente: true },
      primeiro,
    );
    expect(plano.acao).toBe("divergente");
    expect(plano.divergencias).toEqual(["rascunho não publicado"]);
    expect(plano.dados.programa).toBeNull();
    expect(plano.dados.modulos).toEqual([]);
  });

  it("módulo ausente no CMS → divergência, nunca criado", () => {
    const atual = atualDe30Set(primeiro);
    const plano = planejarCargaPaginas({ ...atual, modulos: atual.modulos.slice(1) }, primeiro);
    expect(plano.divergencias).toEqual(["modulos[1]"]);
    expect(plano.dados.modulos.some((m) => m.numero === 1)).toBe(false);
  });

  it("módulo só no CMS → aviso, sem divergência", () => {
    const atual = atualDe30Set(primeiro);
    const extra = {
      id: 999,
      numero: 19,
      titulo: "Extra",
      cargaHoraria: "",
      ementa: null,
      topicos: [],
    };
    const plano = planejarCargaPaginas({ ...atual, modulos: [...atual.modulos, extra] }, primeiro);
    expect(plano.divergencias).toEqual([]);
    expect(plano.avisos).toContain("modulos[19]: só no CMS, não tocado");
  });

  it("identidade, imagens por caminho, sem media e cartão vazio", () => {
    const edutec = estaticos.find((p) => p.sigla === "EDUTEC") as ConteudoPrograma;
    const plano = planejarCargaPaginas(atualDe30Set(edutec), edutec);
    const pagina = paginaDe(plano);
    expect(pagina.identidadeVisual).toBe("EDUTEC");
    expect(pagina.heroImagemCaminho).toBe(edutec.hero.bgSrc);
    expect(pagina).not.toHaveProperty("heroImagem");
    const docentes = pagina.docentes as { coordenacao?: Record<string, unknown>[] };
    const coord = docentes.coordenacao?.[0];
    if (edutec.docentes.coordenacao[0]) {
      expect(coord?.imagemCaminho).toBe(edutec.docentes.coordenacao[0].imgSrc);
      expect(coord).not.toHaveProperty("imagem");
    }
    expect(pagina).not.toHaveProperty("cartao");
  });

  it("PROAPS+ e PROSUS+ casam com o +", () => {
    for (const sigla of ["PROAPS+", "PROSUS+"]) {
      const estatico = estaticos.find((p) => p.sigla === sigla) as ConteudoPrograma;
      expect(planejarCargaPaginas(atualDe30Set(estatico), estatico).acao).toBe("atualizar");
      const semMais = sigla.replace("+", "");
      expect(
        planejarCargaPaginas({ ...atualDe30Set(estatico), sigla: semMais }, estatico).acao,
      ).toBe("sem-programa");
    }
  });
});

describe("temRascunhoPendente", () => {
  const doc = {
    id: 1,
    sigla: "X",
    updatedAt: "a",
    _status: "published",
    eixosTematicos: [{ id: "1", titulo: "T" }],
  };
  it("mesma versão (só datas, status e ids de linha mudam) → não", () => {
    expect(
      temRascunhoPendente(doc, {
        ...doc,
        updatedAt: "b",
        _status: "draft",
        eixosTematicos: [{ id: "9", titulo: "T" }],
      }),
    ).toBe(false);
  });
  it("conteúdo diferente no rascunho → sim", () => {
    expect(
      temRascunhoPendente(doc, { ...doc, eixosTematicos: [{ id: "1", titulo: "Outro" }] }),
    ).toBe(true);
  });
});
