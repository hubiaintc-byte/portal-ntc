import { paragrafosParaLexical, sessoesParaLexical, textoParaLexical } from "@/lib/lexicalBuilders";

import type { DadosFolderEvento } from "./parsearFolderEvento";

/**
 * Converte o resultado do parser nos campos da coleção `eventos` do Payload,
 * acompanhados do relatório de preenchimento exibido no modal de importação.
 * Campo sem dado é OMITIDO de `data` (fica vazio no rascunho) e entra em
 * `vazios` — o import nunca inventa conteúdo (CLAUDE.md §5.3).
 */
export interface CamposEventoImportado {
  data: Record<string, unknown>;
  preenchidos: string[];
  vazios: string[];
}

export function montarCamposEvento(dados: DadosFolderEvento): CamposEventoImportado {
  const data: Record<string, unknown> = {};
  const preenchidos: string[] = [];
  const vazios: string[] = [];

  function campo(rotulo: string, chave: string, valor: unknown, temValor: boolean) {
    if (temValor) {
      data[chave] = valor;
      preenchidos.push(rotulo);
    } else {
      vazios.push(rotulo);
    }
  }

  campo("Nome", "nome", dados.nome, Boolean(dados.nome));
  campo("Eyebrow", "eyebrow", dados.eyebrow, Boolean(dados.eyebrow));
  campo("Modalidade", "modalidade", dados.modalidade, Boolean(dados.modalidade));
  campo("Data de início", "dataInicio", dados.dataInicioISO, Boolean(dados.dataInicioISO));
  campo("Carga horária", "cargaHoraria", dados.cargaHoraria, Boolean(dados.cargaHoraria));
  campo(
    "Resumo",
    "resumo",
    dados.resumo ? dados.resumo.slice(0, 280) : null,
    Boolean(dados.resumo),
  );

  campo(
    "Público-alvo",
    "publicoAlvo",
    textoParaLexical(dados.publicoAlvo.map((p) => `- ${p}`).join("\n")),
    dados.publicoAlvo.length > 0,
  );
  campo(
    "Objetivos",
    "objetivos",
    paragrafosParaLexical([...dados.objetivo, ...dados.sobre]),
    dados.objetivo.length > 0 || dados.sobre.length > 0,
  );
  campo(
    "Conteúdo programático",
    "conteudoProgramatico",
    sessoesParaLexical(dados.sessoesConteudo),
    dados.sessoesConteudo.length > 0,
  );

  campo(
    "Programação detalhada",
    "programacaoDetalhada",
    dados.programacao.map((item) => ({
      horario: item.horario,
      titulo: item.titulo,
      descricao: [
        item.nomePalestrante ? `com ${item.nomePalestrante}` : null,
        item.descricao,
      ]
        .filter(Boolean)
        .join(" — "),
    })),
    dados.programacao.length > 0,
  );

  campo(
    "Diferenciais",
    "diferenciais",
    dados.diferenciais.map((d) => ({ titulo: d.titulo, descricao: d.descricao })),
    dados.diferenciais.length > 0,
  );

  campo("Valor", "valor", dados.valor, Boolean(dados.valor));
  campo("Replay", "replayDisponivel", dados.replayDisponivel, dados.replayDisponivel);
  if (dados.replayDisponivel && dados.prazoReplay) data.prazoReplay = dados.prazoReplay;

  campo(
    "Local / plataforma",
    "local",
    { nomeLocal: dados.plataforma },
    dados.modalidade === "online" && Boolean(dados.plataforma),
  );

  // Seções que o folder não traz — sempre reportadas para revisão manual.
  vazios.push("FAQ", "Capa do evento", "Link de inscrição");

  return { data, preenchidos, vazios };
}
