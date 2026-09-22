import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Gate de sessão das Server Actions de Contatos institucionais
 * (`carregarContatosCms`/`salvarContatos`, tela Configurações).
 *
 * Mesmo risco das demais Server Actions do painel: sem a guarda, qualquer um
 * com a URL leria ou reescreveria telefone/e-mail/endereço institucionais —
 * dado exibido no rodapé de toda página do site. Mesmo padrão de mock de
 * acoes.conteudos.test.ts — `vi.mock` no topo (hoistado pelo Vitest) troca a
 * Local API, a autenticação e o cache do Next antes de acoes.ts resolver
 * seus imports.
 */
const findGlobal = vi.fn();
const updateGlobal = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ findGlobal, updateGlobal }),
}));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { carregarContatosCms, salvarContatos } = await import("./acoes");

const CONTATOS_VAZIOS = {
  telefoneInstitucional: "",
  whatsappInstitucional: "",
  emailInstitucional: "",
  emailImprensa: "",
  emailParcerias: "",
  emailDpo: "",
  emailSuporte: "",
  emailEventos: "",
  enderecoCompleto: "",
  razaoSocial: "",
  cnpj: "",
  verticais: [
    { vertical: "educacao", email: "", opcaoTelefone: "" },
    { vertical: "gestao-publica", email: "", opcaoTelefone: "" },
    { vertical: "saude", email: "", opcaoTelefone: "" },
  ],
};

const campos = {
  ...CONTATOS_VAZIOS,
  telefoneInstitucional: "(63) 3212-1199",
  whatsappInstitucional: "(63) 98444-4040",
  emailInstitucional: "contato@institutontc.com.br",
  enderecoCompleto: "SCS Quadra 9, Bloco C — Brasília/DF",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("carregarContatosCms (Server Action)", () => {
  it("sem sessão, devolve o formato vazio sem tocar a Local API", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);

    const r = await carregarContatosCms();

    expect(r).toEqual(CONTATOS_VAZIOS);
    expect(findGlobal).not.toHaveBeenCalled();
  });
});

describe("salvarContatos (Server Action)", () => {
  it("sem sessão, recusa antes de tocar a Local API", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);

    const r = await salvarContatos(campos);

    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/sessão/i);
    expect(updateGlobal).not.toHaveBeenCalled();
  });
});
