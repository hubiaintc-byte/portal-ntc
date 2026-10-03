/**
 * Seções institucionais do documento da proposta (17 a 23 do modelo aprovado,
 * docs/prototipos/proposta-modelo-v1.html linhas 360-369). Módulo puro — sem I/O.
 *
 * O corpo de cada uma é o texto da própria proposta, já convertido de Lexical
 * para HTML em `dados.ts` — vai para o documento tal e qual, sem escape
 * adicional (o escape acontece no nó de texto, em `lexicalDocumento.ts`).
 * Texto ausente devolve corpo vazio e `montarSecoes` omite a seção: o modelo
 * nunca imprime um título com nada embaixo, e inventar texto contratual é
 * proibido (CLAUDE.md §5.3).
 *
 * Os números de seção não aparecem aqui: `montarSecoes` numera pela posição
 * final, depois de descartar as vazias.
 */

import type { DadosDocumentoProposta } from "../dados";
import type { SecaoDocumento } from "../montar";

/**
 * Mobília fixa do Fechamento (modelo, linha 369) — transcrita do modelo, não
 * redigida aqui. Só sai quando há texto de fechamento: a citação sozinha
 * seria uma seção sem conteúdo próprio.
 */
const CITACAO_FECHAMENTO =
  '<div class="quote">Excelência institucional, rigor técnico e compromisso com a Administração Pública brasileira.</div>';

function semAcento(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * A seção 17 descreve a participação no evento ONLINE (plataforma EventON,
 * transmissão ao vivo, credencial individual). O spec §7 é explícito: o texto
 * equivalente para presencial não existe e não se inventa — então presencial e
 * híbrido simplesmente não trazem a seção, mesmo que o rótulo da modalidade
 * mencione "online" (é o caso de "Híbrido · presencial + online").
 */
export function modalidadeEhOnline(modalidade: string): boolean {
  const m = semAcento(modalidade);
  if (m.includes("presencial") || m.includes("hibrid")) return false;
  return m.includes("online");
}

export function secoesInstitucionais(d: DadosDocumentoProposta): SecaoDocumento[] {
  const c = d.conteudoHtml;
  const secoes: SecaoDocumento[] = [];

  if (modalidadeEhOnline(d.modalidade)) {
    secoes.push({
      chave: "eventon",
      titulo: "Condições de Participação · Evento Online EventON",
      corpoHtml: c.eventon,
    });
  }

  secoes.push(
    {
      chave: "certificacao-replay",
      titulo: "Certificação e Replay",
      corpoHtml: c.certificacaoReplay,
    },
    {
      chave: "cancelamento",
      titulo: "Cancelamento, Substituição e Reagendamento",
      corpoHtml: c.cancelamento,
    },
    {
      chave: "protecao-conteudo",
      titulo: "Proteção de Conteúdo e Direitos Autorais",
      corpoHtml: c.protecaoConteudo,
    },
    {
      chave: "fundamentacao-legal",
      titulo: "Fundamentação Legal e Segurança Jurídica",
      corpoHtml: c.fundamentacaoLegal,
    },
    {
      chave: "proximos-passos",
      titulo: "Próximos Passos",
      corpoHtml: c.proximosPassos,
    },
    {
      chave: "fechamento",
      titulo: "Fechamento Institucional",
      corpoHtml: c.fechamento.trim() ? `${c.fechamento}\n${CITACAO_FECHAMENTO}` : "",
    },
  );

  return secoes;
}
