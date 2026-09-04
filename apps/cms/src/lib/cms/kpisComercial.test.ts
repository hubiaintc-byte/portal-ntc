import { describe, expect, it } from "vitest";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";
import {
  calcularKpisComercial,
  followupsProximos,
  formatarMoedaBRL,
  abertasPorEstagio,
  funilOportunidades,
  todosFollowups,
} from "./kpisComercial";

/**
 * O campo `status` das fixtures é o espelho legado, mantido só porque o tipo o
 * exige — nenhuma asserção aqui depende dele. Quem manda é estagio + situacao.
 */
const opp = (extra: Partial<OportunidadeCrmResumo>): OportunidadeCrmResumo => ({
  id: "1", codigo: "OPO-1", clienteId: "1", clienteNome: "SEDUC-TO", programaSigla: "EDUTEC",
  valor: null, probabilidade: null, status: "em-qualificacao",
  estagio: "mapeada", situacao: "ativa", migracaoPendenteRevisao: false, migracaoFlag: null,
  dataAberturaISO: null, followupISO: null, responsavelNome: null,
  ...extra,
});

const lead = (status: string): LeadCmsResumo => ({
  id: "1", nome: "Fulano", email: "f@x.br", instituicao: "SEMED",
  tipo: "contato", status, data: "01/07/2026", dataISO: "2026-07-01",
});

describe("calcularKpisComercial", () => {
  it("conta abertas, soma valores e pondera pipeline; fechadas ficam de fora", () => {
    const kpis = calcularKpisComercial(
      [
        opp({ valor: 100_000, probabilidade: 50 }),
        opp({ id: "2", codigo: "OPO-2", valor: 40_000, probabilidade: 25, estagio: "proposta-enviada" }),
        opp({ id: "3", codigo: "OPO-3", valor: 999_999, probabilidade: 90, situacao: "perdida" }),
      ],
      [lead("novo"), lead("em-atendimento"), lead("novo")],
    );
    expect(kpis.oportunidadesAbertas).toBe(2);
    expect(kpis.valorEmNegociacao).toBe(140_000);
    expect(kpis.pipelinePonderado).toBe(60_000);
    expect(kpis.leadsNovos).toBe(2);
  });

  it("ganha e adiada/nurturing não contam como pipeline aberto", () => {
    const kpis = calcularKpisComercial(
      [
        opp({ valor: 10_000, probabilidade: 100 }),
        opp({ id: "2", codigo: "OPO-2", valor: 500_000, probabilidade: 100, estagio: "ganha" }),
        opp({
          id: "3",
          codigo: "OPO-3",
          valor: 300_000,
          probabilidade: 40,
          estagio: "negociacao-tramitacao",
          situacao: "adiada-nurturing",
        }),
      ],
      [],
    );
    expect(kpis.oportunidadesAbertas).toBe(1);
    expect(kpis.valorEmNegociacao).toBe(10_000);
    expect(kpis.pipelinePonderado).toBe(10_000);
  });
});

describe("negócio migrado de Contratada (achado da revisão)", () => {
  /**
   * Cenário exato do bug: a migração P0 leva "Contratada" para o estágio
   * `contratacao-em-formalizacao` com situação `ativa`. O espelho legado
   * traduz esse par de volta para "aprovada", que não é status fechado — e o
   * negócio já ganho reentrava no pipeline aberto.
   */
  const emFormalizacao = opp({
    id: "9",
    codigo: "OPO-9",
    valor: 480_000,
    probabilidade: 100,
    status: "aprovada",
    estagio: "contratacao-em-formalizacao",
    situacao: "ativa",
    followupISO: "2026-07-18",
  });

  it("não entra em oportunidades abertas, valor em negociação nem pipeline ponderado", () => {
    const kpis = calcularKpisComercial([emFormalizacao], []);
    expect(kpis.oportunidadesAbertas).toBe(0);
    expect(kpis.valorEmNegociacao).toBe(0);
    expect(kpis.pipelinePonderado).toBe(0);
  });

  it("continua aparecendo nos follow-ups, que ainda precisam de acompanhamento", () => {
    expect(followupsProximos([emFormalizacao], "2026-07-15").map((o) => o.codigo)).toEqual(["OPO-9"]);
    expect(todosFollowups([emFormalizacao]).map((o) => o.codigo)).toEqual(["OPO-9"]);
  });

  it("aparece no gráfico do funil, no seu próprio estágio", () => {
    const faixa = abertasPorEstagio([emFormalizacao]);
    expect(faixa).toEqual([
      { estagio: "contratacao-em-formalizacao", rotulo: "Contratação em Formalização", quantidade: 1 },
    ]);
  });
});

describe("followupsProximos", () => {
  it("retorna abertas com follow-up na janela, ordenadas por data", () => {
    const lista = followupsProximos(
      [
        opp({ followupISO: "2026-07-20" }),
        opp({ id: "2", codigo: "OPO-2", followupISO: "2026-07-16" }),
        opp({ id: "3", codigo: "OPO-3", followupISO: "2026-08-01" }),
        opp({ id: "4", codigo: "OPO-4", followupISO: "2026-07-16", situacao: "adiada-nurturing" }),
      ],
      "2026-07-15",
    );
    expect(lista.map((o) => o.codigo)).toEqual(["OPO-2", "OPO-1"]);
  });

  it("oportunidade ganha some do follow-up mesmo com data marcada", () => {
    const lista = followupsProximos(
      [opp({ followupISO: "2026-07-16", estagio: "ganha" })],
      "2026-07-15",
    );
    expect(lista).toEqual([]);
  });
});

describe("formatarMoedaBRL", () => {
  it("formata inteiro em reais sem centavos", () => {
    const resultado = formatarMoedaBRL(140_000).replace(/\s/g, " ");
    const esperado = "R$ 140.000";
    expect(resultado).toBe(esperado);
  });
});

describe("todosFollowups", () => {
  it("retorna em acompanhamento com followup, ordem ascendente, sem limite de 7 dias", () => {
    const ops = [
      opp({ estagio: "negociacao-tramitacao", followupISO: "2026-09-01" }),
      opp({ estagio: "qualificada", followupISO: "2026-07-20" }),
      opp({ estagio: "negociacao-tramitacao", followupISO: null }), // sem followup: fora
      opp({ estagio: "ganha", followupISO: "2026-07-25" }), // ganha: fora
      opp({ estagio: "proposta-enviada", situacao: "perdida", followupISO: "2026-07-26" }), // perdida: fora
    ];
    expect(todosFollowups(ops).map((o) => o.followupISO)).toEqual(["2026-07-20", "2026-09-01"]);
  });

  it("lista vazia devolve vazio", () => {
    expect(todosFollowups([])).toEqual([]);
  });
});

describe("abertasPorEstagio / funilOportunidades", () => {
  const ops = [
    opp({ estagio: "negociacao-tramitacao" }),
    opp({ estagio: "qualificada" }),
    opp({ id: "2", codigo: "OPO-2", estagio: "negociacao-tramitacao" }),
    opp({ id: "3", codigo: "OPO-3", estagio: "ganha" }),
    opp({ id: "4", codigo: "OPO-4", estagio: "proposta-enviada", situacao: "perdida" }),
  ];

  it("conta ativas por estágio na ordem do funil, omitindo zerados", () => {
    expect(abertasPorEstagio(ops)).toEqual([
      { estagio: "qualificada", rotulo: "Qualificada", quantidade: 1 },
      { estagio: "negociacao-tramitacao", rotulo: "Negociação / Tramitação", quantidade: 2 },
    ]);
  });

  it("funil traz os 10 estágios anteriores a Ganha, incluindo zerados, na ordem", () => {
    const funil = funilOportunidades(ops);
    expect(funil.map((f) => f.estagio)).toEqual([
      "mapeada",
      "prospeccao-relacionamento",
      "demanda-identificada",
      "qualificada",
      "diagnostico-realizado",
      "solucao-em-construcao",
      "proposta-em-elaboracao",
      "proposta-enviada",
      "negociacao-tramitacao",
      "contratacao-em-formalizacao",
    ]);
    // Perdida não conta em lugar nenhum do gráfico; Ganha não é faixa do funil.
    expect(funil.find((f) => f.estagio === "proposta-enviada")?.quantidade).toBe(0);
  });

  it("com lista vazia, abertasPorEstagio é vazio e funil é todo zerado", () => {
    expect(abertasPorEstagio([])).toEqual([]);
    expect(funilOportunidades([]).every((f) => f.quantidade === 0)).toBe(true);
  });
});
