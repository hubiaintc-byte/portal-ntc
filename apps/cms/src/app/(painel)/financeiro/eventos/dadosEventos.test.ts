import { describe, expect, it } from "vitest";

import type { EventoFin, LivroFinanceiro, ReceitaFin } from "@ntc/lib";

import { MSG_EVENTO_FIN_COM_LANCAMENTOS } from "@/lib/financeiro/exclusao";

import {
  aplicarFiltrosRecebidos,
  algumFiltroEventos,
  alternarOrdem,
  campoVisivel,
  camposSoLeitura,
  dadosDoForm,
  dependentesDoEvento,
  ESTADO_LISTA_INICIAL,
  exclusaoBloqueada,
  formDoEvento,
  limparFiltrosEventos,
  listarEventos,
  MSG_EVENTO_CRM_COM_LANCAMENTOS,
  passoDoCampo,
  totalPrevisto,
  validarForm,
  type FormEvento,
} from "./dadosEventos";

const HOJE = "2026-07-15";
const vazio: LivroFinanceiro = {
  eventos: [],
  receitas: [],
  faturamentos: [],
  custos: [],
  pagamentos: [],
  contas: [],
};

function ev(p: Partial<EventoFin> = {}): EventoFin {
  return {
    id: "1",
    nome: "Seminário",
    vertical: "Educação",
    tipo: "Evento aberto",
    modalidade: "Online ao vivo",
    programa: "",
    modulo: "",
    cliente: "",
    cidade: "Recife",
    uf: "PE",
    local: "",
    dataInicio: "2026-07-10",
    dataFim: "2026-07-10",
    cargaHoraria: 8,
    responsavel: "Departamento Financeiro",
    status: "Planejado",
    qtdPrevista: 0,
    capacidade: 0,
    efetivos: 0,
    pagantesPrev: 0,
    cortesiasPrev: 0,
    refCrm: "",
    refContratual: "",
    observacoes: "",
    origem: "financeiro",
    eventoComercialId: null,
    cadastroPendente: false,
    canceladoNoCrm: false,
    camposDoCrm: [],
    ...p,
  };
}

function receita(eventoId: string): ReceitaFin {
  return {
    id: `r${eventoId}`,
    eventoId,
    tipoLancamento: "Evento",
    centroCusto: "OPE",
    cliente: "X",
    segmento: "Estadual",
    origem: "",
    tipoReceita: "Inscrição",
    etapa: "",
    qtde: 1,
    valorUnit: 100,
    desconto: 0,
    pagantes: 0,
    cortesias: 0,
    statusEconomico: "Contratada",
    criterioReconhecimento: "",
    etapas: [],
    competencia: "",
    referencia: "",
    observacao: "",
  };
}

const formOk = (p: Partial<FormEvento> = {}): FormEvento => ({ ...formDoEvento(ev()), ...p });

describe("lista de eventos", () => {
  it("livro vazio: listas vazias e contagens zero", () => {
    const r = listarEventos(vazio, ESTADO_LISTA_INICIAL, HOJE);
    expect(r.lista).toEqual([]);
    expect(r.porVertical).toEqual({ all: 0, Educação: 0, "Gestão Pública": 0, Saúde: 0 });
  });

  it("abas contam com os filtros mas sem a vertical; a aba recorta a lista", () => {
    const livro = {
      ...vazio,
      eventos: [
        ev({ id: "1" }),
        ev({ id: "2", vertical: "Saúde" }),
        ev({ id: "3", modalidade: "Presencial" }),
      ],
    };
    const r = listarEventos(
      livro,
      { ...ESTADO_LISTA_INICIAL, vertical: "Saúde", modalidade: "Online ao vivo" },
      HOJE,
    );
    expect(r.porVertical).toMatchObject({ all: 2, Educação: 1, Saúde: 1 });
    expect(r.lista.map((e) => e.id)).toEqual(["2"]);
  });

  it("ordena por data, nome, id numérico e status", () => {
    const livro = {
      ...vazio,
      eventos: [
        ev({ id: "9", nome: "Bravo", dataInicio: "2026-01-01", status: "Realizado" }),
        ev({ id: "10", nome: "Alfa", dataInicio: "2026-03-01", status: "Planejado" }),
      ],
    };
    const ids = (sort: string) =>
      listarEventos(livro, { ...ESTADO_LISTA_INICIAL, sort }, HOJE).lista.map((e) => e.id);
    expect(ids("data-desc")).toEqual(["10", "9"]);
    expect(ids("data-asc")).toEqual(["9", "10"]);
    expect(ids("nome-asc")).toEqual(["10", "9"]);
    expect(ids("id-desc")).toEqual(["10", "9"]);
    expect(ids("status-asc")).toEqual(["10", "9"]);
  });

  it("ponto de alerta conta só Vencido e Pendente", () => {
    const livro = { ...vazio, eventos: [ev({ id: "1", status: "Em execução" })] };
    const a = listarEventos(livro, ESTADO_LISTA_INICIAL, HOJE).alertas["1"]!;
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((x) => x.severidade === "Vencido" || x.severidade === "Pendente")).toBe(true);
  });

  it("limpar mantém a aba de vertical; filtros recebidos limpam a busca e mantêm visualização", () => {
    const s = {
      ...ESTADO_LISTA_INICIAL,
      vertical: "Saúde",
      status: "Realizado",
      q: "x",
      view: "lista" as const,
    };
    expect(algumFiltroEventos(s)).toBe(true);
    const l = limparFiltrosEventos(s);
    expect(l).toMatchObject({ vertical: "Saúde", status: "all", q: "" });
    expect(algumFiltroEventos(l)).toBe(false);
    const r = aplicarFiltrosRecebidos(s, {
      periodo: "2026",
      vertical: "all",
      status: "Em execução",
      tipo: "all",
    });
    expect(r).toMatchObject({
      periodo: "2026",
      vertical: "all",
      status: "Em execução",
      q: "",
      view: "lista",
    });
  });

  it("alternarOrdem: mesma coluna inverte, outra começa descendo", () => {
    expect(alternarOrdem("data-desc", "data")).toBe("data-asc");
    expect(alternarOrdem("data-asc", "data")).toBe("data-desc");
    expect(alternarOrdem("data-asc", "nome")).toBe("nome-desc");
  });

  it("dependentes e bloqueio da exclusão de evento do CRM", () => {
    const livro = { ...vazio, eventos: [ev({ origem: "crm" })], receitas: [receita("1")] };
    expect(dependentesDoEvento(livro, "1")).toMatchObject({ receitas: 1, total: 1 });
    expect(exclusaoBloqueada(livro.eventos[0]!, livro)).toBe(true);
    expect(exclusaoBloqueada(ev(), livro)).toBe(false);
    expect(MSG_EVENTO_CRM_COM_LANCAMENTOS).toBe(MSG_EVENTO_FIN_COM_LANCAMENTOS);
  });
});

describe("wizard de evento", () => {
  it("cada campo do validarEvento cai numa etapa (exceto nenhum)", () => {
    for (const c of ["nome", "vertical", "tipo", "programa", "modulo"])
      expect(passoDoCampo(c)).toBe(0);
    for (const c of [
      "modalidade",
      "dataInicio",
      "dataFim",
      "cargaHoraria",
      "local",
      "responsavel",
      "status",
    ])
      expect(passoDoCampo(c)).toBe(1);
    for (const c of ["cliente", "qtdPrevista", "efetivos"]) expect(passoDoCampo(c)).toBe(2);
    expect(passoDoCampo("refCrm")).toBe(-1);
  });

  it("data final anterior à inicial dá a mensagem do protótipo no campo", () => {
    expect(validarForm(formOk({ dataInicio: "2026-07-10", dataFim: "2026-07-09" }))).toEqual({
      ok: false,
      erro: "A data final não pode ser anterior à inicial.",
      campo: "dataFim",
    });
  });

  it("evento novo começa Planejado e sem carga horária (recusado)", () => {
    const f = formDoEvento(null);
    expect(f.status).toBe("Planejado");
    expect(validarForm({ ...formOk(), cargaHoraria: "" })).toMatchObject({ campo: "cargaHoraria" });
  });

  it("zeragens ao salvar e números", () => {
    const d = dadosDoForm(
      formOk({
        tipo: "Evento aberto",
        cliente: "Órgão",
        modalidade: "Online ao vivo",
        local: "Sala",
        pagantesPrev: "10",
        cargaHoraria: "8",
      }),
    );
    expect(d).toMatchObject({
      cliente: "",
      local: "",
      pagantesPrev: 10,
      cargaHoraria: 8,
      qtdPrevista: 0,
    });
    const b = dadosDoForm(
      formOk({ tipo: "In Company / Projeto B2G", pagantesPrev: "10", cortesiasPrev: "2" }),
    );
    expect(b).toMatchObject({ pagantesPrev: 0, cortesiasPrev: 0 });
  });

  it("campos condicionais", () => {
    const f = formOk({ tipo: "Evento aberto", modalidade: "Online ao vivo", status: "Planejado" });
    expect(campoVisivel("programa", f)).toBe(false);
    expect(campoVisivel("local", f)).toBe(false);
    expect(campoVisivel("cliente", f)).toBe(false);
    expect(campoVisivel("efetivos", f)).toBe(false);
    expect(campoVisivel("pagantesPrev", f)).toBe(true);
    const g = formOk({ tipo: "Programa", modalidade: "Híbrido", status: "Realizado" });
    expect(campoVisivel("programa", g)).toBe(true);
    expect(campoVisivel("local", g)).toBe(true);
    expect(campoVisivel("efetivos", g)).toBe(true);
    expect(campoVisivel("cortesiasPrev", g)).toBe(false);
    expect(totalPrevisto(formOk({ pagantesPrev: "10", cortesiasPrev: "" }))).toBe(10);
  });

  it("só leitura: só os campos que o CRM preencheu, e só em evento do CRM", () => {
    expect([
      ...camposSoLeitura(ev({ origem: "crm", camposDoCrm: ["nome", "dataInicio"] })),
    ]).toEqual(["nome", "dataInicio"]);
    expect(camposSoLeitura(ev()).size).toBe(0);
    expect(camposSoLeitura(null).size).toBe(0);
  });

  it("pendente do CRM vira formulário com os valores do CRM", () => {
    const f = formDoEvento(
      ev({ id: "crm-12", origem: "crm", cadastroPendente: true, cargaHoraria: 0, nome: "Turma" }),
    );
    expect(f).toMatchObject({ nome: "Turma", cargaHoraria: "" });
  });
});

describe("listarEventos com evento do CRM pendente (ruling R15)", () => {
  it("o pendente aparece na lista, sem ponto de alerta", () => {
    const pendentes = [
      ev({ id: "crm-7", origem: "crm", cadastroPendente: true, status: "Planejado" }),
      ev({ id: "crm-8", origem: "crm", cadastroPendente: true, status: "Em execução" }),
    ];
    const r = listarEventos({ ...vazio, eventos: pendentes }, ESTADO_LISTA_INICIAL, HOJE);
    expect(r.lista.map((e) => e.id).sort()).toEqual(["crm-7", "crm-8"]);
    expect(r.alertas["crm-7"]).toEqual([]);
    expect(r.alertas["crm-8"]).toEqual([]);
  });
});
