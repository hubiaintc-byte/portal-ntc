import { describe, expect, it } from "vitest";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";
import {
  calcularKpisComercial,
  followupsProximos,
  formatarMoedaBRL,
  abertasPorStatus,
  funilOportunidades,
  todosFollowups,
} from "./kpisComercial";

const opp = (extra: Partial<OportunidadeCrmResumo>): OportunidadeCrmResumo => ({
  id: "1", codigo: "OPO-1", clienteId: "1", clienteNome: "SEDUC-TO", programaSigla: "EDUTEC",
  valor: null, probabilidade: null, status: "em-qualificacao",
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
        opp({ id: "2", codigo: "OPO-2", valor: 40_000, probabilidade: 25, status: "proposta-enviada" }),
        opp({ id: "3", codigo: "OPO-3", valor: 999_999, probabilidade: 90, status: "perdida" }),
      ],
      [lead("novo"), lead("em-atendimento"), lead("novo")],
    );
    expect(kpis.oportunidadesAbertas).toBe(2);
    expect(kpis.valorEmNegociacao).toBe(140_000);
    expect(kpis.pipelinePonderado).toBe(60_000);
    expect(kpis.leadsNovos).toBe(2);
  });
});

describe("followupsProximos", () => {
  it("retorna abertas com follow-up na janela, ordenadas por data", () => {
    const lista = followupsProximos(
      [
        opp({ followupISO: "2026-07-20" }),
        opp({ id: "2", codigo: "OPO-2", followupISO: "2026-07-16" }),
        opp({ id: "3", codigo: "OPO-3", followupISO: "2026-08-01" }),
        opp({ id: "4", codigo: "OPO-4", followupISO: "2026-07-16", status: "cancelada" }),
      ],
      "2026-07-15",
    );
    expect(lista.map((o) => o.codigo)).toEqual(["OPO-2", "OPO-1"]);
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
  it("retorna abertas com followup, ordem ascendente, sem limite de 7 dias, excluindo fechadas", () => {
    const ops = [
      opp({ status: "em-negociacao", followupISO: "2026-09-01" }),
      opp({ status: "em-qualificacao", followupISO: "2026-07-20" }),
      opp({ status: "em-negociacao", followupISO: null }),      // sem followup: fora
      opp({ status: "contratada", followupISO: "2026-07-25" }), // fechada: fora
    ];
    expect(todosFollowups(ops).map((o) => o.followupISO)).toEqual(["2026-07-20", "2026-09-01"]);
  });

  it("lista vazia devolve vazio", () => {
    expect(todosFollowups([])).toEqual([]);
  });
});

describe("abertasPorStatus / funilOportunidades", () => {
  const ops = [
    opp({ status: "em-negociacao" }),
    opp({ status: "em-qualificacao" }),
    opp({ id: "2", codigo: "OPO-2", status: "em-negociacao" }),
    opp({ id: "3", codigo: "OPO-3", status: "contratada" }),
  ];

  it("conta abertas por status na ordem fixa da lista, omitindo zerados", () => {
    expect(abertasPorStatus(ops)).toEqual([
      { status: "em-qualificacao", rotulo: "Em qualificação", quantidade: 1 },
      { status: "em-negociacao", rotulo: "Em negociação", quantidade: 2 },
    ]);
  });

  it("funil traz todos os status abertos, incluindo zerados, na ordem do funil", () => {
    const funil = funilOportunidades(ops);
    expect(funil.map((f) => f.status)).toEqual([
      "em-qualificacao",
      "apresentacao-institucional",
      "proposta-enviada",
      "em-negociacao",
      "aprovada",
    ]);
    expect(funil.find((f) => f.status === "proposta-enviada")?.quantidade).toBe(0);
  });

  it("com lista vazia, abertasPorStatus é vazio e funil é todo zerado", () => {
    expect(abertasPorStatus([])).toEqual([]);
    expect(funilOportunidades([]).every((f) => f.quantidade === 0)).toBe(true);
  });
});
