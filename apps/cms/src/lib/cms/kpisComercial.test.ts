import { describe, expect, it } from "vitest";

import type { LeadCmsResumo } from "./painelCms";
import type { OportunidadeCrmResumo } from "./painelCrm";
import { calcularKpisComercial, followupsProximos, formatarMoedaBRL } from "./kpisComercial";

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
