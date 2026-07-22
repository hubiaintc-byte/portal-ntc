import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * criarVersaoProposta toca a Local API do Payload via obterPayload(); aqui
 * ela é mockada por completo (find/create/update em memória) para exercitar
 * a regra de negócio de forma determinística, sem banco.
 *
 * `vi.mock` no topo do módulo (hoistado pelo Vitest para antes dos imports)
 * garante que painelCrmEscrita.ts resolva "@/lib/payloadClient" já trocado
 * — diferente de vi.doMock após um import estático, que chegaria tarde
 * demais porque o módulo real já teria sido carregado e cacheado.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarVersaoProposta } = await import("./painelCrmEscrita");

describe("criarVersaoProposta — validade da nova versão", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function montarPayloadFalso(vigente: Record<string, unknown>) {
    let dadosCriados: Record<string, unknown> | undefined;
    const payloadFalso = {
      find: vi.fn().mockResolvedValue({ docs: [vigente] }),
      create: vi.fn(
        async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
          if (collection === "propostas") {
            dadosCriados = data;
            return { id: 11, ...data };
          }
          return { id: 99, ...data };
        },
      ),
      update: vi.fn().mockResolvedValue({}),
    };
    obterPayloadMock.mockResolvedValue(payloadFalso);
    return { payloadFalso, dadosCriados: () => dadosCriados };
  }

  const vigenteBase = {
    id: 10,
    codigoBase: "NTC-PROP-2026-PROGE-SP-X",
    codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
    versao: 1,
    status: "vigente",
    validadeDias: 45, // != 0 e != o default de 30, para provar que é lido da base
    oportunidade: null,
    cliente: 3,
    programa: 2,
    tipo: "programa-completo",
    modulos: [],
    eventos: [],
    valorUnitario: 100,
    qtdPagantes: 10,
    cortesias: 0,
    percDesconto: 10,
    valorBruto: 1000,
    desconto: 100,
    valorLiquido: 900,
    modalidade: null,
    replay: null,
    condPagto: null,
    condEspecificas: null,
    observacoes: null,
    elaborador: null,
    aprovador: null,
  };

  it("usa hoje + validadeDias da proposta base, não a dataCriacao", async () => {
    const { dadosCriados } = montarPayloadFalso(vigenteBase);

    const resultado = await criarVersaoProposta("NTC-PROP-2026-PROGE-SP-X", "Ajuste de escopo");

    expect(resultado.ok).toBe(true);
    const criados = dadosCriados();
    expect(criados).toBeDefined();
    // dataCriacao é "agora" (o relógio congelado).
    expect(criados?.dataCriacao).toBe("2026-07-22T12:00:00.000Z");
    // validade tem que ser hoje + validadeDias (45 dias), não igual à dataCriacao
    // (bug original: validade era gravada como agora.toISOString(), a versão
    // nascia vencida).
    expect(criados?.validade).toBe("2026-09-05T12:00:00.000Z");
    expect(criados?.validade).not.toBe(criados?.dataCriacao);
  });

  it("marca a versão anterior como substituída ANTES de criar a nova vigente", async () => {
    const { payloadFalso } = montarPayloadFalso(vigenteBase);

    await criarVersaoProposta("NTC-PROP-2026-PROGE-SP-X", "Ajuste de escopo");

    expect(payloadFalso.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, data: { status: "substituida" } }),
    );
    const [ordemUpdate] = payloadFalso.update.mock.invocationCallOrder;
    const [ordemCreateProposta] = payloadFalso.create.mock.invocationCallOrder;
    expect(ordemUpdate).toBeDefined();
    expect(ordemCreateProposta).toBeDefined();
    // Garante a ordem que evita duas vigentes simultâneas: nunca a nova
    // versão é criada antes de a anterior ser rebaixada.
    expect(ordemUpdate as number).toBeLessThan(ordemCreateProposta as number);
  });

  it("em falha na Local API, devolve erro genérico em vez de propagar exceção", async () => {
    obterPayloadMock.mockRejectedValue(new Error("conexão recusada"));

    const resultado = await criarVersaoProposta("NTC-PROP-2026-PROGE-SP-X", "Ajuste de escopo");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro).toBe("Não foi possível salvar. Tente novamente.");
    }
  });
});
