import type { EsferaInstitucional } from "@ntc/lib";
import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";

import type { TabId } from "./conteudoContato";

/**
 * Ponte client → `/api/forms/*` do RoteadorFormularios (/contato).
 *
 * As 4 abas do roteador (atendimento · proposta · equipe · imprensa)
 * colapsam em 2 tipos de Lead:
 *  - atendimento, imprensa → `tipo: 'contato'`  → POST /api/forms/contato
 *  - proposta, equipe      → `tipo: 'proposta'` → POST /api/forms/proposta
 *
 * Os <select> do front usam valores mais ricos que os enums do schema
 * (`MODALIDADE_PROPOSTA`, `ESFERA_INSTITUCIONAL`, `ASSUNTO_CONTATO`).
 * Este módulo normaliza os valores antes de enviar; o formulário cru
 * sempre vai inteiro em `payloadBruto` no servidor, então nada se perde.
 *
 * LGPD (CLAUDE.md §12): consentimento, versão da política, timestamp e
 * IP são gravados no Lead. O IP e o timestamp são resolvidos no servidor
 * (`extrairOrigem` + `new Date()`); aqui mandamos `aceito` + versão.
 */

export interface ResultadoEnvio {
  ok: boolean;
  message: string;
  erros?: Record<string, string>;
}

function valor(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return el.value.trim();
  }
  return "";
}

function montarOrigem() {
  const params = new URLSearchParams(window.location.search);
  return {
    pagina: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_term: params.get("utm_term") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
}

const consentimento = () => ({ aceito: true as const, politicaVersao: POLITICA_VERSAO_ATUAL });

/** `natureza` (proposta) → enum `esfera` do schema. Fallback: privada. */
function mapearEsfera(natureza: string): EsferaInstitucional {
  switch (natureza) {
    case "municipal":
      return "municipal";
    case "estadual":
      return "estadual";
    case "federal":
    case "judiciario":
    case "legislativo":
    case "autarquia":
      return "federal";
    case "terceiro-setor":
      return "terceiro-setor";
    default:
      return "privada";
  }
}

/** `modalidade` do front (incompany-presencial, turma-fechada, …) → enum do schema. */
function mapearModalidade(modalidade: string): "in-company" | "turma-aberta" | "sob-medida" | "proposta-livre" {
  if (modalidade.startsWith("incompany")) return "in-company";
  if (modalidade === "turma-fechada") return "turma-aberta";
  if (modalidade === "sob-medida") return "sob-medida";
  return "proposta-livre";
}

/** Faixa de participantes ("51-100", "ate-25", "500+") → número estimado (piso da faixa). */
function pisoFaixa(faixa: string): number | undefined {
  const m = faixa.match(/\d+/);
  return m ? Number(m[0]) : undefined;
}

function montarCorpo(kind: TabId, form: HTMLFormElement): { endpoint: string; body: Record<string, unknown> } {
  const origem = montarOrigem();
  const consentimentoLgpd = consentimento();

  if (kind === "atendimento") {
    return {
      endpoint: "/api/forms/contato",
      body: {
        nome: valor(form, "nome"),
        email: valor(form, "email"),
        telefone: valor(form, "telefone"),
        assunto: "duvida-institucional",
        instituicao: valor(form, "instituicao") || undefined,
        mensagem: valor(form, "mensagem"),
        origem,
        consentimentoLgpd,
      },
    };
  }

  if (kind === "imprensa") {
    const tipo = valor(form, "tipo");
    const deadline = valor(form, "deadline");
    const veiculo = valor(form, "veiculo");
    const pauta = valor(form, "pauta");
    const mensagem = [
      veiculo ? `Veículo: ${veiculo}` : "",
      tipo ? `Tipo de demanda: ${tipo}` : "",
      deadline ? `Deadline: ${deadline}` : "",
      pauta,
    ]
      .filter(Boolean)
      .join("\n");
    return {
      endpoint: "/api/forms/contato",
      body: {
        nome: valor(form, "nome"),
        email: valor(form, "email"),
        telefone: valor(form, "telefone"),
        assunto: "imprensa",
        instituicao: veiculo || undefined,
        mensagem,
        origem,
        consentimentoLgpd,
      },
    };
  }

  if (kind === "proposta") {
    return {
      endpoint: "/api/forms/proposta",
      body: {
        nome: valor(form, "nome"),
        email: valor(form, "email"),
        telefone: valor(form, "telefone"),
        cargo: valor(form, "cargo"),
        instituicao: valor(form, "instituicao"),
        esfera: mapearEsfera(valor(form, "natureza")),
        modalidade: mapearModalidade(valor(form, "modalidade")),
        participantesEstimados: pisoFaixa(valor(form, "participantes")),
        mensagem: valor(form, "contexto"),
        origem,
        consentimentoLgpd,
      },
    };
  }

  // kind === "equipe" → proposta in-company de grupo.
  const evento = valor(form, "evento");
  const inscritos = valor(form, "inscritos");
  const faturamento = valor(form, "faturamento");
  const observacoes = valor(form, "observacoes");
  const eventoUrl = valor(form, "evento_url");
  const cnpj = valor(form, "cnpj");
  const mensagem = [
    evento ? `Evento/turma: ${evento}` : "",
    eventoUrl ? `Link: ${eventoUrl}` : "",
    inscritos ? `Inscritos: ${inscritos}` : "",
    faturamento ? `Faturamento: ${faturamento}` : "",
    cnpj ? `CNPJ: ${cnpj}` : "",
    observacoes,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    endpoint: "/api/forms/proposta",
    body: {
      nome: valor(form, "nome"),
      email: valor(form, "email"),
      telefone: valor(form, "telefone"),
      cargo: valor(form, "cargo"),
      instituicao: valor(form, "instituicao"),
      esfera: "municipal" as EsferaInstitucional,
      modalidade: "in-company" as const,
      participantesEstimados: pisoFaixa(inscritos),
      mensagem: mensagem || "Inscrição de equipe.",
      origem,
      consentimentoLgpd,
    },
  };
}

/**
 * Envia o formulário ao endpoint correspondente. Lança apenas em erro de
 * rede; respostas de validação (422) voltam como `{ ok:false, erros }`.
 */
export async function enviarLead(kind: TabId, form: HTMLFormElement): Promise<ResultadoEnvio> {
  const { endpoint, body } = montarCorpo(kind, form);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Partial<ResultadoEnvio>;
  return {
    ok: Boolean(json.ok),
    message: json.message ?? (res.ok ? "Solicitação registrada." : "Não foi possível enviar agora."),
    erros: json.erros,
  };
}
