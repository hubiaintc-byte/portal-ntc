import { describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterDadosDocumentoProposta } = await import("./dados");

describe("obterDadosDocumentoProposta", () => {
  it("resolve cliente, programa, módulos e eventos populados", async () => {
    const propostaFalsa = {
      id: 42,
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      codigoBase: "NTC-PROP-2026-PROGE-SP-X",
      versao: 1,
      tipo: "programa-completo",
      status: "rascunho",
      modalidade: "Presencial",
      replay: null,
      condPagto: "À vista após NF · 15 dias",
      condEspecificas: null,
      dataCriacao: "2026-08-29T12:00:00.000Z",
      validade: "2026-09-28T12:00:00.000Z",
      elaborador: { id: 5, nome: "Ana Comercial" },
      cliente: {
        id: 3,
        orgao: "Secretaria de Educação de São Paulo",
        sigla: "SEDUC-SP",
        municipio: "São Paulo",
        uf: "SP",
        contatos: [
          { nome: "Beltrano Assessor", principal: false },
          { nome: "Fulano de Tal", principal: true },
        ],
      },
      programa: { id: 7, sigla: "PROGE", nomeCompleto: "Programa de Gestão Estratégica" },
      modulos: [{ id: 1, numero: 1, titulo: "Gestão Democrática", cargaHoraria: "40h" }],
      eventos: [],
      valorUnitario: 100,
      qtdPagantes: 10,
      cortesias: 2,
      percDesconto: 10,
      valorBruto: 1000,
      desconto: 100,
      valorLiquido: 900,
    };
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue(propostaFalsa),
    });

    const dados = await obterDadosDocumentoProposta("42");

    expect(dados).not.toBeNull();
    expect(dados?.clienteOrgao).toBe("Secretaria de Educação de São Paulo");
    expect(dados?.clienteDirigente).toBe("Fulano de Tal");
    expect(dados?.programaNome).toBe("Programa de Gestão Estratégica");
    expect(dados?.programaTemas).toBe("");
    expect(dados?.tipoTexto).toBe("Trilha Completa de Programa Estratégico");
    expect(dados?.itens).toEqual([
      { rotulo: "M1 · Gestão Democrática", cargaHoraria: "40h", valorUnitario: 100 },
    ]);
    expect(dados?.elaboradorNome).toBe("Ana Comercial");
  });

  it("carrega os campos da seção 3 que a Fase B2 não imprimia", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue({
        id: 1,
        codigo: "C-v01",
        codigoBase: "C",
        versao: 1,
        tipo: "customizada",
        cliente: {
          id: 3,
          orgao: "Secretaria Municipal de Educação de Palmas",
          sigla: "SEMED-Palmas",
          cnpj: "24.851.511/0001-85",
          email: "gabinete@semed.palmas.to.gov.br",
          contatos: [
            {
              nome: "Profa. Anice Moura",
              cargo: "Secretária Municipal de Educação",
              email: "anice@semed.palmas.to.gov.br",
              principal: true,
            },
          ],
        },
        programa: null,
        modulos: [],
        eventos: [],
        elaborador: { id: 5, nome: "Nicolas Coelho" },
        aprovador: { id: 6, nome: "Direção Executiva NTC" },
      }),
    });

    const dados = await obterDadosDocumentoProposta("1");

    expect(dados?.clienteCnpj).toBe("24.851.511/0001-85");
    expect(dados?.clienteDirigenteCargo).toBe("Secretária Municipal de Educação");
    // O e-mail do órgão vence o do contato principal.
    expect(dados?.clienteContatoEmail).toBe("gabinete@semed.palmas.to.gov.br");
    expect(dados?.aprovadorNome).toBe("Direção Executiva NTC");
  });

  it("sem e-mail no órgão, o contato institucional cai no contato principal", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue({
        id: 1,
        codigo: "C-v01",
        codigoBase: "C",
        versao: 1,
        tipo: "customizada",
        cliente: { id: 3, orgao: "Órgão", contatos: [{ nome: "Pessoa", email: "p@org.gov.br", principal: true }] },
        programa: null,
        modulos: [],
        eventos: [],
        elaborador: null,
      }),
    });

    const dados = await obterDadosDocumentoProposta("1");

    expect(dados?.clienteContatoEmail).toBe("p@org.gov.br");
    expect(dados?.clienteCnpj).toBe("");
    expect(dados?.aprovadorNome).toBe("");
  });

  it("devolve null quando a proposta não existe", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockRejectedValue(new Error("not found")),
    });

    const dados = await obterDadosDocumentoProposta("999");

    expect(dados).toBeNull();
  });

  it("usa fallbacks quando cliente/programa/elaborador não estão populados", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue({
        id: 1,
        codigo: "NTC-PROP-2026-X-v01",
        codigoBase: "NTC-PROP-2026-X",
        versao: 1,
        tipo: "customizada",
        cliente: 3, // não populado (id cru)
        programa: null,
        modulos: [],
        eventos: [],
        elaborador: null,
      }),
    });

    const dados = await obterDadosDocumentoProposta("1");

    expect(dados?.clienteOrgao).toBe("—");
    expect(dados?.programaNome).toBe("Programa Estratégico NTC");
    expect(dados?.elaboradorNome).toBe("Comercial NTC");
    expect(dados?.tipoTexto).toBe("Solução Customizada · In Company");
  });
});

function lexical(...paragrafos: string[]): unknown {
  return {
    root: {
      type: "root",
      children: paragrafos.map((t) => ({
        type: "paragraph",
        version: 1,
        children: [{ type: "text", text: t, format: 0, version: 1 }],
      })),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

const BASE = {
  id: 9,
  codigo: "NTC-PROP-2026-EDUTEC-TO-v01",
  codigoBase: "NTC-PROP-2026-EDUTEC-TO",
  versao: 1,
  tipo: "modulo-avulso",
  cliente: 3,
  programa: { id: 7, sigla: "EDUTEC", nomeCompleto: "Programa de Educação e Tecnologia" },
  modulos: [],
  eventos: [],
  elaborador: null,
};

async function lerProposta(extra: Record<string, unknown>) {
  const findByID = vi.fn().mockResolvedValue({ ...BASE, ...extra });
  obterPayloadMock.mockResolvedValue({ findByID });
  const dados = await obterDadosDocumentoProposta("9");
  return { dados, findByID };
}

describe("obterDadosDocumentoProposta · conteúdo do documento", () => {
  it("proposta sem conteúdo devolve todas as chaves vazias e as listas vazias", async () => {
    const { dados } = await lerProposta({});

    expect(dados).not.toBeNull();
    expect(Object.values(dados?.conteudoHtml ?? {})).toHaveLength(12);
    for (const [chave, valor] of Object.entries(dados?.conteudoHtml ?? {})) {
      expect(valor, chave).toBe("");
    }
    expect(dados?.eixos).toEqual([]);
    expect(dados?.diferenciais).toEqual([]);
    expect(dados?.resultados).toEqual([]);
    expect(dados?.docentes).toEqual([]);
    expect(dados?.modulosDetalhados).toEqual([]);
    expect(dados?.secoesExtras).toEqual([]);
    expect(dados?.cargaHorariaTotalModulos).toBe("");
    expect(dados?.subtitulo).toBe("EDUTEC");
  });

  it("converte os 12 textos da própria proposta, bloco a bloco", async () => {
    const { dados } = await lerProposta({
      textoApresentacao: lexical("Apresentação.", "Segundo parágrafo."),
      textoContexto: lexical("Contexto."),
      textoObjetivos: lexical("Objetivos."),
      textoPublicoAlvo: lexical("Público."),
      textoMetodologia: lexical("Metodologia."),
      textoEventon: lexical("EventON."),
      textoCertificacaoReplay: lexical("Certificação."),
      textoCancelamento: lexical("Cancelamento."),
      textoProtecaoConteudo: lexical("Proteção."),
      textoFundamentacaoLegal: lexical("Fundamentação."),
      textoProximosPassos: lexical("Passos."),
      textoFechamento: lexical("Fechamento."),
    });

    expect(dados?.conteudoHtml.apresentacao).toBe("<p>Apresentação.</p><p>Segundo parágrafo.</p>");
    expect(dados?.conteudoHtml.contexto).toBe("<p>Contexto.</p>");
    expect(dados?.conteudoHtml.objetivos).toBe("<p>Objetivos.</p>");
    expect(dados?.conteudoHtml.publicoAlvo).toBe("<p>Público.</p>");
    expect(dados?.conteudoHtml.metodologia).toBe("<p>Metodologia.</p>");
    expect(dados?.conteudoHtml.eventon).toBe("<p>EventON.</p>");
    expect(dados?.conteudoHtml.certificacaoReplay).toBe("<p>Certificação.</p>");
    expect(dados?.conteudoHtml.cancelamento).toBe("<p>Cancelamento.</p>");
    expect(dados?.conteudoHtml.protecaoConteudo).toBe("<p>Proteção.</p>");
    expect(dados?.conteudoHtml.fundamentacaoLegal).toBe("<p>Fundamentação.</p>");
    expect(dados?.conteudoHtml.proximosPassos).toBe("<p>Passos.</p>");
    expect(dados?.conteudoHtml.fechamento).toBe("<p>Fechamento.</p>");
  });

  it("listas da proposta: campo nulo vira string vazia, nunca null", async () => {
    const { dados } = await lerProposta({
      eixos: [{ titulo: "Eixo 1", descricao: "Descrição" }, { titulo: null, descricao: null }],
      diferenciais: [{ titulo: "Dif", descricao: null }],
      resultados: [{ texto: "Resultado" }, { texto: null }],
    });

    expect(dados?.eixos).toEqual([
      { titulo: "Eixo 1", descricao: "Descrição" },
      { titulo: "", descricao: "" },
    ]);
    expect(dados?.diferenciais).toEqual([{ titulo: "Dif", descricao: "" }]);
    expect(dados?.resultados).toEqual(["Resultado", ""]);
  });

  // A carga horária e o subtítulo contam `modulosDetalhados` de código legível —
  // a MESMA fonte do Quadro Comercial (ver documentoProposta/modulos.ts). Antes
  // da fix wave contavam `doc.modulos`, e uma proposta com evento fazia a capa
  // e o Resumo falarem de um número de módulos que o Quadro não dividia.
  const detalhado = (numero: number, titulo: string, cargaHoraria: string | null) => ({
    modulo: { id: numero, numero, titulo, cargaHoraria },
  });

  it("carga horária total: módulos de mesma carga somam", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [
        detalhado(1, "A", "8h"),
        detalhado(2, "B", "8 horas"),
        detalhado(3, "C", "8h"),
      ],
    });

    expect(dados?.cargaHorariaTotalModulos).toBe("24h · 3 módulos · 8h por módulo");
    expect(dados?.subtitulo).toBe("Combo de Três Módulos · EDUTEC");
  });

  it("carga horária total: cargas diferentes não inventam total", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [
        detalhado(1, "A", "8h"),
        detalhado(2, "B", "16h · 2 dias"),
        detalhado(3, "C", null),
      ],
    });

    expect(dados?.cargaHorariaTotalModulos).toBe("3 módulos");
  });

  it("carga horária total: um módulo não repete 'por módulo'", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [detalhado(4, "A", "40h")],
    });

    expect(dados?.cargaHorariaTotalModulos).toBe("40h · 1 módulo");
    expect(dados?.subtitulo).toBe("Módulo Avulso · EDUTEC");
  });

  it("carga horária total: módulo único sem carga legível cai para o singular", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [detalhado(4, "A", "dia único")],
    });

    expect(dados?.cargaHorariaTotalModulos).toBe("1 módulo");
  });

  it("evento na proposta NÃO entra na contagem de módulos do documento", async () => {
    const { dados } = await lerProposta({
      modulos: [
        { id: 1, numero: 1, titulo: "A", cargaHoraria: "8h" },
        { id: 2, numero: 2, titulo: "B", cargaHoraria: "8h" },
        { id: 3, numero: 3, titulo: "C", cargaHoraria: "8h" },
      ],
      eventos: [{ id: 50, nome: "Seminário", cargaHoraria: "4h" }],
      modulosDetalhados: [detalhado(1, "A", "8h"), detalhado(2, "B", "8h"), detalhado(3, "C", "8h")],
    });

    // `itens` continua somando módulos + eventos (é a linha da Fase B2)...
    expect(dados?.itens).toHaveLength(4);
    // ...mas o subtítulo e a carga horária falam dos 3 módulos, como o Quadro.
    expect(dados?.subtitulo).toBe("Combo de Três Módulos · EDUTEC");
    expect(dados?.cargaHorariaTotalModulos).toBe("24h · 3 módulos · 8h por módulo");
  });

  it("módulo sem relação populada zera a contagem (todo-ou-nada)", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [detalhado(1, "A", "8h"), { modulo: 99, tituloExibido: "Órfão" }],
    });

    expect(dados?.cargaHorariaTotalModulos).toBe("");
    expect(dados?.subtitulo).toBe("EDUTEC");
  });

  it("docente vinculado sem campos livres usa a ficha do especialista", async () => {
    const { dados } = await lerProposta({
      docentes: [
        {
          especialista: {
            id: 11,
            nome: "Roberta Aquino",
            titulacao: "doutorado",
            instituicao: "Unicamp",
            cargoAtual: "Consultora educacional",
          },
          nome: null,
          credencial: null,
          eixo: "Cultura digital",
        },
      ],
    });

    expect(dados?.docentes).toEqual([
      {
        nome: "Roberta Aquino",
        credencial: "Doutorado · Unicamp · Consultora educacional",
        eixo: "Cultura digital",
      },
    ]);
  });

  it("docente vinculado com campos livres preserva a edição do usuário", async () => {
    const { dados } = await lerProposta({
      docentes: [
        {
          especialista: {
            id: 11,
            nome: "Roberta Aquino",
            titulacao: "doutorado",
            instituicao: "Unicamp",
          },
          nome: "Profa. Roberta Aquino",
          credencial: "Doutora em Ciências · Unicamp",
          eixo: null,
        },
      ],
    });

    expect(dados?.docentes).toEqual([
      {
        nome: "Profa. Roberta Aquino",
        credencial: "Doutora em Ciências · Unicamp",
        eixo: "",
      },
    ]);
  });

  it("docente sem vínculo usa os campos livres", async () => {
    const { dados } = await lerProposta({
      docentes: [{ especialista: null, nome: "Convidado NTC", credencial: "Mestre", eixo: "" }],
    });

    expect(dados?.docentes).toEqual([
      { nome: "Convidado NTC", credencial: "Mestre", eixo: "" },
    ]);
  });

  it("módulos detalhados: código com dois dígitos, título e ementa da proposta", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [
        {
          modulo: { id: 4, numero: 4, titulo: "Título do catálogo", cargaHoraria: "8h" },
          tituloExibido: "Título negociado",
          ementa: lexical("Ementa da proposta."),
        },
        {
          modulo: { id: 10, numero: 10, titulo: "Título do catálogo 10", cargaHoraria: null },
          tituloExibido: null,
          ementa: null,
        },
      ],
    });

    expect(dados?.modulosDetalhados).toEqual([
      {
        codigo: "M04",
        titulo: "Título negociado",
        cargaHoraria: "8h",
        ementaHtml: "<p>Ementa da proposta.</p>",
      },
      {
        codigo: "M10",
        titulo: "Título do catálogo 10",
        cargaHoraria: null,
        ementaHtml: "",
      },
    ]);
  });

  it("módulo detalhado com relação não populada não quebra a leitura", async () => {
    const { dados } = await lerProposta({
      modulosDetalhados: [{ modulo: 4, tituloExibido: "Só o título", ementa: null }],
    });

    expect(dados?.modulosDetalhados).toEqual([
      { codigo: "", titulo: "Só o título", cargaHoraria: null, ementaHtml: "" },
    ]);
  });

  it("seções extras: posição inválida ou ausente cai para o fim", async () => {
    const { dados } = await lerProposta({
      secoesExtras: [
        { titulo: "Anexo", corpo: lexical("Texto do anexo."), posicao: "antes-quadro-comercial" },
        { titulo: null, corpo: null, posicao: null },
      ],
    });

    expect(dados?.secoesExtras).toEqual([
      {
        titulo: "Anexo",
        corpoHtml: "<p>Texto do anexo.</p>",
        posicao: "antes-quadro-comercial",
      },
      { titulo: "", corpoHtml: "", posicao: "fim" },
    ]);
  });

  it("lê com profundidade suficiente para as relações dentro dos arrays", async () => {
    const { findByID } = await lerProposta({});

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "propostas", id: "9", depth: 2 }),
    );
  });
});
