import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { atualizarProposta, criarProposta, criarVersaoProposta, dadosProposta } = await import(
  "./painelCrmEscrita",
);

afterEach(() => vi.clearAllMocks());

/** Dados mínimos válidos; cada teste sobrescreve o que quer testar. */
const base = {
  valorUnitario: "100", qtdPagantes: "10", cortesias: "0", percDesconto: "0",
  cliente: "1", programa: "2", lead: "7", tipo: "programa-completo",
  modulos: [], eventos: [], modalidade: "", replay: "", condPagto: "",
  condEspecificas: "", observacoes: "", elaborador: "", aprovador: "",
  validadeDias: "30", status: "rascunho",
};

/** Documento Lexical mínimo, no shape que o Payload grava em campo richText. */
function lex(texto: string): Record<string, unknown> {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [{ type: "text", format: 0, mode: "normal", style: "", text: texto, version: 1, detail: 0 }],
        },
      ],
    },
  };
}

const programaCompleto: Record<string, unknown> = {
  id: 2,
  sigla: "EDUTEC",
  nomeCompleto: "Programa EDUTEC",
  visaoGeral: lex("Visão geral do programa."),
  problema: lex("O problema que o programa enfrenta."),
  objetivo: lex("O objetivo do programa."),
  publicoAlvo: lex("Gestores da rede."),
  metodologia: lex("Metodologia do programa."),
  eixosTematicos: [
    { titulo: "Eixo 1", descricao: "Descrição do eixo 1." },
    { titulo: "Eixo 2", descricao: "Descrição do eixo 2." },
  ],
  diferenciais: [{ titulo: "Diferencial 1", descricao: "Descrição do diferencial." }],
  resultadosEsperados: [{ resultado: "Resultado A." }, { resultado: "Resultado B." }],
  docentes: [11],
};

const clienteBase: Record<string, unknown> = {
  id: 1,
  orgao: "Secretaria Municipal de Educação de Exemplo",
  sigla: "SME-EX",
  uf: "SP",
};

const moduloM1: Record<string, unknown> = {
  id: 10,
  numero: 1,
  titulo: "Módulo 1 do catálogo",
  cargaHoraria: "8 horas",
  ementa: lex("Ementa do módulo 1."),
};

const moduloM2: Record<string, unknown> = {
  id: 11,
  numero: 2,
  titulo: "Módulo 2 do catálogo",
  cargaHoraria: "8 horas",
  ementa: lex("Ementa do módulo 2."),
};

const especialista: Record<string, unknown> = {
  id: 11,
  nome: "Ana Ribeiro",
  titulacao: "doutorado",
  instituicao: "USP",
  cargoAtual: "Pesquisadora",
};

interface OpcoesPayloadFalso {
  programa?: Record<string, unknown> | null;
  /** Versão vigente devolvida pelo `find` de propostas (criarVersaoProposta). */
  vigente?: Record<string, unknown>;
  cliente?: Record<string, unknown>;
  modulos?: Record<string, unknown>[];
  especialistas?: Record<string, unknown>[];
  proposta?: Record<string, unknown>;
}

function payloadFalso(opcoes: OpcoesPayloadFalso = {}) {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 9, ...data }));
  const findByID = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "programas") return opcoes.programa ?? programaCompleto;
    if (collection === "clientes-crm") return opcoes.cliente ?? clienteBase;
    if (collection === "propostas") {
      return (
        opcoes.proposta ?? {
          id: 9,
          codigoBase: "NTC-PROP-2026-EDUTEC-SP-SME",
          codigo: "NTC-PROP-2026-EDUTEC-SP-SME-v01",
          versao: 1,
          modulosDetalhados: [],
        }
      );
    }
    throw new Error(`findByID inesperado: ${collection}`);
  });
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "propostas") return { docs: opcoes.vigente ? [opcoes.vigente] : [] };
    if (collection === "modulos") return { docs: opcoes.modulos ?? [] };
    if (collection === "especialistas") return { docs: opcoes.especialistas ?? [] };
    throw new Error(`find inesperado: ${collection}`);
  });
  obterPayloadMock.mockResolvedValue({ create, update, findByID, find });
  return { create, update, findByID, find };
}

/** Dados do `payload.create`/`payload.update` da primeira chamada. */
function dadosDaChamada(mock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const chamada = mock.mock.calls[0]![0] as { data: Record<string, unknown> };
  return chamada.data;
}

describe("dadosProposta", () => {
  it("grava derivados calculados", () => {
    const d = dadosProposta(
      {
        valorUnitario: "100",
        qtdPagantes: "10",
        cortesias: "0",
        percDesconto: "10",
        cliente: "1",
        programa: "2",
        lead: "7",
        tipo: "programa-completo",
        modulos: [],
        eventos: [],
        modalidade: "",
        replay: "",
        condPagto: "",
        condEspecificas: "",
        observacoes: "",
        elaborador: "",
        aprovador: "",
        validadeDias: "30",
        status: "rascunho",
      },
      3, // clienteId
      7, // leadId
      { codigoBase: "NTC-PROP-2026-PROGE-SP-X", codigo: "NTC-PROP-2026-PROGE-SP-X-v01", versao: 1 },
    );
    expect(d.lead).toBe(7);
    expect(d.valorBruto).toBe(1000);
    expect(d.desconto).toBe(100);
    expect(d.valorLiquido).toBe(900);
    expect(typeof d.percDesconto).toBe("number");
    expect(d.percDesconto).toBe(10);
  });
});

describe("programa obrigatório na proposta (decisão do PO, 30/09/2026)", () => {
  it("criarProposta recusa sem programa, sem tocar o banco", async () => {
    expect(await criarProposta({ ...base, programa: "" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("atualizarProposta recusa sem programa, sem tocar o banco", async () => {
    expect(await atualizarProposta("9", { ...base, programa: "" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("recusa programa que não resolve para um id", async () => {
    expect(await criarProposta({ ...base, programa: "abc" })).toEqual({
      ok: false,
      erro: "Selecione o programa.",
    });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });
});

describe("pagantes e cortesias múltiplos do número de módulos", () => {
  const erro = "Pagantes e cortesias precisam ser múltiplos de 2 (número de módulos).";

  it("criarProposta recusa pagantes não múltiplo, sem tocar o banco", async () => {
    const { create } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    expect(await criarProposta({ ...base, modulos: ["10", "11"], qtdPagantes: "5", cortesias: "0" })).toEqual({
      ok: false,
      erro,
    });
    expect(create).not.toHaveBeenCalled();
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("criarProposta recusa cortesias não múltiplo, sem tocar o banco", async () => {
    const { create } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    expect(await criarProposta({ ...base, modulos: ["10", "11"], qtdPagantes: "10", cortesias: "3" })).toEqual({
      ok: false,
      erro,
    });
    expect(create).not.toHaveBeenCalled();
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("atualizarProposta recusa pagantes não múltiplo, sem tocar o banco", async () => {
    const { update } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    expect(await atualizarProposta("9", { ...base, modulos: ["10", "11"], qtdPagantes: "7" })).toEqual({
      ok: false,
      erro,
    });
    expect(update).not.toHaveBeenCalled();
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("atualizarProposta recusa cortesias não múltiplo, sem tocar o banco", async () => {
    const { update } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    expect(await atualizarProposta("9", { ...base, modulos: ["10", "11"], qtdPagantes: "10", cortesias: "1" })).toEqual({
      ok: false,
      erro,
    });
    expect(update).not.toHaveBeenCalled();
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("sem módulos a regra não se aplica", async () => {
    const { create } = payloadFalso();
    expect(await criarProposta({ ...base, modulos: [], qtdPagantes: "5", cortesias: "3" })).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("múltiplo exato é aceito", async () => {
    const { create } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    expect(
      await criarProposta({ ...base, modulos: ["10", "11"], qtdPagantes: "10", cortesias: "2" }),
    ).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("criarProposta grava o conteúdo do documento", () => {
  it("copia os 5 textos do programa tal e qual", async () => {
    const { create } = payloadFalso({ especialistas: [especialista] });
    expect(await criarProposta({ ...base })).toEqual({ ok: true });
    const data = dadosDaChamada(create);
    expect(data.textoApresentacao).toEqual(programaCompleto.visaoGeral);
    expect(data.textoContexto).toEqual(programaCompleto.problema);
    expect(data.textoObjetivos).toEqual(programaCompleto.objetivo);
    expect(data.textoPublicoAlvo).toEqual(programaCompleto.publicoAlvo);
    expect(data.textoMetodologia).toEqual(programaCompleto.metodologia);
  });

  it("grava os 7 institucionais em Lexical, com subtítulo h3 na certificação", async () => {
    const { create } = payloadFalso({ especialistas: [especialista] });
    await criarProposta({ ...base, replay: "30 dias" });
    const data = dadosDaChamada(create);
    const chaves = [
      "textoEventon",
      "textoCertificacaoReplay",
      "textoCancelamento",
      "textoProtecaoConteudo",
      "textoFundamentacaoLegal",
      "textoProximosPassos",
      "textoFechamento",
    ];
    for (const chave of chaves) {
      const doc = data[chave] as { root: { children: { type: string }[] } };
      expect(doc.root.children.length, chave).toBeGreaterThan(0);
      expect(doc.root.children[0]!.type, chave).toBeTypeOf("string");
    }
    const certificacao = data.textoCertificacaoReplay as {
      root: { children: { type: string; tag?: string; children?: { text?: string }[] }[] };
    };
    expect(certificacao.root.children[0]?.type).toBe("heading");
    expect(certificacao.root.children[0]?.tag).toBe("h3");
    expect(certificacao.root.children[0]?.children?.[0]?.text).toBe("Certificação");
    // Interpolação do contexto chegou ao texto gravado.
    const fechamento = data.textoFechamento as { root: { children: { children?: { text?: string }[] }[] } };
    expect(fechamento.root.children[0]?.children?.[0]?.text).toContain(
      "Secretaria Municipal de Educação de Exemplo",
    );
  });

  it("grava eixos, diferenciais, resultados e docentes", async () => {
    const { create } = payloadFalso({ especialistas: [especialista] });
    await criarProposta({ ...base });
    const data = dadosDaChamada(create);
    expect(data.eixos).toEqual([
      { titulo: "Eixo 1", descricao: "Descrição do eixo 1." },
      { titulo: "Eixo 2", descricao: "Descrição do eixo 2." },
    ]);
    expect(data.diferenciais).toEqual([
      { titulo: "Diferencial 1", descricao: "Descrição do diferencial." },
    ]);
    expect(data.resultados).toEqual([{ texto: "Resultado A." }, { texto: "Resultado B." }]);
    expect(data.docentes).toEqual([
      { especialista: 11, nome: "Ana Ribeiro", credencial: "Doutorado · USP · Pesquisadora", eixo: null },
    ]);
  });

  it("programa sem conteúdo não grava os campos correspondentes", async () => {
    const { create } = payloadFalso({ programa: { id: 2, sigla: "FUTURA", nomeCompleto: "Futura" } });
    expect(await criarProposta({ ...base })).toEqual({ ok: true });
    const data = dadosDaChamada(create);
    for (const chave of [
      "textoApresentacao",
      "textoContexto",
      "textoObjetivos",
      "textoPublicoAlvo",
      "textoMetodologia",
    ]) {
      expect(chave in data, chave).toBe(false);
    }
    expect(data.eixos).toEqual([]);
    expect(data.diferenciais).toEqual([]);
    expect(data.resultados).toEqual([]);
    expect(data.docentes).toEqual([]);
    // Os institucionais não dependem do programa.
    expect(data.textoFechamento).toBeDefined();
  });

  it("modulosDetalhados nasce com um item por módulo, com ementa do catálogo", async () => {
    const { create } = payloadFalso({ modulos: [moduloM1, moduloM2] });
    await criarProposta({ ...base, modulos: ["10", "11"], qtdPagantes: "10", cortesias: "0" });
    const data = dadosDaChamada(create);
    expect(data.modulosDetalhados).toEqual([
      { modulo: 10, tituloExibido: "Módulo 1 do catálogo", ementa: moduloM1.ementa },
      { modulo: 11, tituloExibido: "Módulo 2 do catálogo", ementa: moduloM2.ementa },
    ]);
  });
});

describe("atualizarProposta e os módulos detalhados", () => {
  const propostaComM1: Record<string, unknown> = {
    id: 9,
    codigoBase: "NTC-PROP-2026-EDUTEC-SP-SME",
    codigo: "NTC-PROP-2026-EDUTEC-SP-SME-v01",
    versao: 1,
    modulosDetalhados: [
      { id: "a1", modulo: 10, tituloExibido: "Título editado à mão", ementa: lex("Ementa editada à mão.") },
    ],
  };

  it("módulo acrescentado entra sem mexer nas entradas existentes", async () => {
    const { update } = payloadFalso({ proposta: propostaComM1, modulos: [moduloM2] });
    expect(
      await atualizarProposta("9", { ...base, modulos: ["10", "11"], qtdPagantes: "10", cortesias: "0" }),
    ).toEqual({ ok: true });
    const data = dadosDaChamada(update);
    expect(data.modulosDetalhados).toEqual([
      { id: "a1", modulo: 10, tituloExibido: "Título editado à mão", ementa: lex("Ementa editada à mão.") },
      { modulo: 11, tituloExibido: "Módulo 2 do catálogo", ementa: moduloM2.ementa },
    ]);
  });

  it("módulo removido tem a entrada descartada", async () => {
    const proposta: Record<string, unknown> = {
      ...propostaComM1,
      modulosDetalhados: [
        { id: "a1", modulo: 10, tituloExibido: "Título editado à mão", ementa: lex("Ementa editada à mão.") },
        { id: "a2", modulo: 11, tituloExibido: "Módulo 2 do catálogo", ementa: moduloM2.ementa },
      ],
    };
    const { update } = payloadFalso({ proposta });
    expect(await atualizarProposta("9", { ...base, modulos: ["10"], qtdPagantes: "10" })).toEqual({ ok: true });
    const data = dadosDaChamada(update);
    expect(data.modulosDetalhados).toEqual([
      { id: "a1", modulo: 10, tituloExibido: "Título editado à mão", ementa: lex("Ementa editada à mão.") },
    ]);
  });

  it("não inclui os 12 textos nem as outras listas no update", async () => {
    const { update } = payloadFalso({ proposta: propostaComM1, modulos: [moduloM2] });
    await atualizarProposta("9", { ...base, modulos: ["10", "11"], qtdPagantes: "10" });
    const data = dadosDaChamada(update);
    for (const chave of [
      "textoApresentacao",
      "textoContexto",
      "textoObjetivos",
      "textoPublicoAlvo",
      "textoMetodologia",
      "textoEventon",
      "textoCertificacaoReplay",
      "textoCancelamento",
      "textoProtecaoConteudo",
      "textoFundamentacaoLegal",
      "textoProximosPassos",
      "textoFechamento",
      "eixos",
      "diferenciais",
      "resultados",
      "docentes",
    ]) {
      expect(chave in data, chave).toBe(false);
    }
  });

  it("seleção de módulos inalterada não reescreve modulosDetalhados", async () => {
    const { update } = payloadFalso({ proposta: propostaComM1 });
    expect(await atualizarProposta("9", { ...base, modulos: ["10"], qtdPagantes: "10" })).toEqual({ ok: true });
    expect("modulosDetalhados" in dadosDaChamada(update)).toBe(false);
  });
});

const CAMPOS_TEXTO = [
  "textoApresentacao",
  "textoContexto",
  "textoObjetivos",
  "textoPublicoAlvo",
  "textoMetodologia",
  "textoEventon",
  "textoCertificacaoReplay",
  "textoCancelamento",
  "textoProtecaoConteudo",
  "textoFundamentacaoLegal",
  "textoProximosPassos",
  "textoFechamento",
];

describe("criarVersaoProposta copia o conteudo da versao vigente", () => {
  /** Vigente com conteúdo revisado à mão, relações populadas e ids de array. */
  const vigente: Record<string, unknown> = {
    id: 9,
    codigoBase: "NTC-PROP-2026-EDUTEC-SP-SME",
    codigo: "NTC-PROP-2026-EDUTEC-SP-SME-v01",
    versao: 1,
    validadeDias: 30,
    lead: 7,
    cliente: 1,
    programa: 2,
    tipo: "programa-completo",
    ...Object.fromEntries(CAMPOS_TEXTO.map((c) => [c, lex(`${c} revisado à mão.`)])),
    eixos: [{ id: "e1", titulo: "Eixo revisado", descricao: "Descrição revisada." }],
    diferenciais: [{ id: "d1", titulo: "Diferencial revisado", descricao: "Descrição." }],
    resultados: [{ id: "r1", texto: "Resultado revisado." }],
    docentes: [
      {
        id: "x1",
        especialista: { id: 11, nome: "Ana Ribeiro" },
        nome: "Ana Ribeiro",
        credencial: "Doutorado · USP · Pesquisadora",
        eixo: "Eixo revisado",
      },
    ],
    modulosDetalhados: [
      {
        id: "m1",
        modulo: { id: 10, titulo: "Módulo 1 do catálogo" },
        tituloExibido: "Título editado à mão",
        ementa: lex("Ementa editada à mão."),
      },
    ],
    secoesExtras: [
      { id: "s1", titulo: "Anexo I", corpo: lex("Corpo do anexo I."), posicao: "antes-quadro-comercial" },
      { id: "s2", titulo: "Anexo II", corpo: lex("Corpo do anexo II."), posicao: "fim" },
    ],
  };

  it("a nova versão nasce com os 12 textos e as 5 listas da vigente", async () => {
    const { create } = payloadFalso({ vigente });
    expect(await criarVersaoProposta("NTC-PROP-2026-EDUTEC-SP-SME", "Ajuste de preço")).toEqual({
      ok: true,
    });
    const data = dadosDaChamada(create);
    for (const campo of CAMPOS_TEXTO) {
      expect(data[campo], campo).toEqual(vigente[campo]);
    }
    // Listas copiadas sem os ids internos de item de array e com as relações
    // como id, nunca o objeto populado.
    expect(data.eixos).toEqual([{ titulo: "Eixo revisado", descricao: "Descrição revisada." }]);
    expect(data.diferenciais).toEqual([
      { titulo: "Diferencial revisado", descricao: "Descrição." },
    ]);
    expect(data.resultados).toEqual([{ texto: "Resultado revisado." }]);
    expect(data.docentes).toEqual([
      {
        especialista: 11,
        nome: "Ana Ribeiro",
        credencial: "Doutorado · USP · Pesquisadora",
        eixo: "Eixo revisado",
      },
    ]);
    expect(data.modulosDetalhados).toEqual([
      { modulo: 10, tituloExibido: "Título editado à mão", ementa: lex("Ementa editada à mão.") },
    ]);
  });

  it("as seções extras escritas à mão vêm com as posições preservadas", async () => {
    const { create } = payloadFalso({ vigente });
    expect(await criarVersaoProposta("NTC-PROP-2026-EDUTEC-SP-SME", "Ajuste")).toEqual({ ok: true });
    expect(dadosDaChamada(create).secoesExtras).toEqual([
      { titulo: "Anexo I", corpo: lex("Corpo do anexo I."), posicao: "antes-quadro-comercial" },
      { titulo: "Anexo II", corpo: lex("Corpo do anexo II."), posicao: "fim" },
    ]);
  });

  it("vigente sem conteúdo gera versão nova sem os campos, sem erro", async () => {
    const semConteudo: Record<string, unknown> = {
      id: 9,
      codigoBase: "NTC-PROP-2026-EDUTEC-SP-SME",
      codigo: "NTC-PROP-2026-EDUTEC-SP-SME-v01",
      versao: 1,
      validadeDias: 30,
      cliente: 1,
    };
    const { create } = payloadFalso({ vigente: semConteudo });
    expect(await criarVersaoProposta("NTC-PROP-2026-EDUTEC-SP-SME", "Revisão")).toEqual({ ok: true });
    const data = dadosDaChamada(create);
    for (const campo of [
      ...CAMPOS_TEXTO,
      "eixos",
      "diferenciais",
      "resultados",
      "docentes",
      "modulosDetalhados",
      "secoesExtras",
    ]) {
      expect(campo in data, campo).toBe(false);
    }
  });
});
