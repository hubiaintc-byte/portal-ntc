/**
 * Loader dos contatos institucionais (global `rodape`, Task 12).
 *
 * Todo texto de contato hoje é hard-coded em várias páginas (FooterHome,
 * /contato, /o-grupo, políticas). Esta função é o ponto único de leitura
 * para a Task 15 substituir esses literais — e o `CONTATOS_FALLBACK` é o
 * que garante que, se o banco cair ou um campo estiver vazio no CMS, o
 * rodapé (presente em toda página) continua mostrando os mesmos valores
 * reais de hoje em vez de sumir ou aparecer em branco.
 *
 * `carregarContatos` nunca lança — try/catch cobre a leitura inteira e
 * qualquer falha degrada para o fallback.
 *
 * Server-only — não importe no client.
 */

import { cache } from "react";

import type { Rodape } from "@ntc/types";
import { telefoneParaHref, whatsappParaHref } from "@ntc/lib";

import { obterPayload } from "./payloadClient";

export interface Contatos {
  telefone: string;
  telefoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  emailInstitucional: string;
  emailImprensa: string;
  emailDpo: string;
  emailSuporte: string;
  emailEventos: string;
  emailParcerias: string;
  endereco: string;
  razaoSocial: string;
  cnpj: string;
  verticais: { vertical: string; email: string; opcaoTelefone: string }[];
}

/**
 * Valores literais de hoje — mesmos do `PADRAO`/`VERTICAIS_PADRAO` do seed
 * (`apps/cms/src/seed/seedContatos.ts`), conferidos ali caractere a
 * caractere contra o site. `emailParcerias` fica "" porque não há valor
 * real dele em lugar nenhum do site hoje (CLAUDE.md §5.3 — não inventar
 * dado institucional); `razaoSocial` e `cnpj` vêm das páginas legais
 * (/termos-de-uso, /politica-de-privacidade, /lgpd), onde aparecem
 * consistentes.
 */
export const CONTATOS_FALLBACK: Contatos = {
  telefone: "(63) 3212-1199",
  telefoneHref: telefoneParaHref("(63) 3212-1199"),
  whatsapp: "(63) 98444-4040",
  whatsappHref: whatsappParaHref("(63) 98444-4040"),
  emailInstitucional: "contato@institutontc.com.br",
  emailImprensa: "imprensa@institutontc.com.br",
  emailDpo: "dpo@institutontc.com.br",
  emailSuporte: "suporte@institutontc.com.br",
  emailEventos: "eventosonline@institutontc.com.br",
  emailParcerias: "",
  endereco:
    "Instituto NTC do Brasil\nSCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001\nAsa Sul · CEP 70308-200 · Brasília – DF",
  razaoSocial: "Instituto NTC do Brasil",
  cnpj: "10.614.200/0001-98",
  verticais: [
    { vertical: "educacao", email: "educacao@institutontc.com.br", opcaoTelefone: "opção 1" },
    {
      vertical: "gestao-publica",
      email: "gestaopublica@institutontc.com.br",
      opcaoTelefone: "opção 2",
    },
    { vertical: "saude", email: "saude@institutontc.com.br", opcaoTelefone: "opção 3" },
  ],
};

/** String não vazia do CMS, senão o valor do fallback — campo a campo. */
function campo(valorCms: string | null | undefined, valorFallback: string): string {
  return typeof valorCms === "string" && valorCms.length > 0 ? valorCms : valorFallback;
}

/**
 * As 3 verticais de `CONTATOS_FALLBACK` são a lista canônica — o resultado
 * sempre tem as 3, nesta ordem. Para cada uma, procura a entrada
 * correspondente no CMS pela chave `vertical` (o array do Payload pode vir
 * incompleto — uma linha apagada no admin, ou um seed parcial) e mescla
 * `email`/`opcaoTelefone` campo a campo contra o fallback **daquela
 * vertical**, com o mesmo `campo()` usado nos escalares — nunca contra
 * `""`. Uma vertical ausente do CMS usa a entrada de fallback inteira;
 * uma vertical presente com um sub-campo vazio só perde aquele sub-campo.
 */
function mesclarVerticais(cmsVerticais: Rodape["verticais"]): Contatos["verticais"] {
  return CONTATOS_FALLBACK.verticais.map((fallback) => {
    const cms = cmsVerticais?.find((v) => v.vertical === fallback.vertical);
    return {
      vertical: fallback.vertical,
      email: campo(cms?.email, fallback.email),
      opcaoTelefone: campo(cms?.opcaoTelefone, fallback.opcaoTelefone),
    };
  });
}

export const carregarContatos = cache(async (): Promise<Contatos> => {
  try {
    const payload = await obterPayload();
    const g = (await payload.findGlobal({ slug: "rodape" })) as Rodape | null;
    if (!g) return CONTATOS_FALLBACK;

    const telefone = campo(g.telefoneInstitucional, CONTATOS_FALLBACK.telefone);
    const whatsapp = campo(g.whatsappInstitucional, CONTATOS_FALLBACK.whatsapp);
    const verticais = mesclarVerticais(g.verticais);

    return {
      telefone,
      telefoneHref: telefoneParaHref(telefone),
      whatsapp,
      whatsappHref: whatsappParaHref(whatsapp),
      emailInstitucional: campo(g.emailInstitucional, CONTATOS_FALLBACK.emailInstitucional),
      emailImprensa: campo(g.emailImprensa, CONTATOS_FALLBACK.emailImprensa),
      emailDpo: campo(g.emailDpo, CONTATOS_FALLBACK.emailDpo),
      emailSuporte: campo(g.emailSuporte, CONTATOS_FALLBACK.emailSuporte),
      emailEventos: campo(g.emailEventos, CONTATOS_FALLBACK.emailEventos),
      emailParcerias: campo(g.emailParcerias, CONTATOS_FALLBACK.emailParcerias),
      endereco: campo(g.enderecoCompleto, CONTATOS_FALLBACK.endereco),
      razaoSocial: campo(g.razaoSocial, CONTATOS_FALLBACK.razaoSocial),
      cnpj: campo(g.cnpj, CONTATOS_FALLBACK.cnpj),
      verticais,
    };
  } catch (erro) {
    console.error("[contatos] Falha ao carregar contatos institucionais.", erro);
    return CONTATOS_FALLBACK;
  }
});
