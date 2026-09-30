/**
 * A forma do instantâneo JSON dos 15 programas — espelha só o que é
 * importado pelo `mapear.ts`, não o arquivo `conteudo<SIGLA>.ts` inteiro
 * que o originou (ver apps/web/app/(programas)/programas/[slug]/).
 */

export interface ModuloInstantaneo {
  numero: string;
  titulo: string;
  cargaHoraria: string;
  descricao: string;
  topicos: string[];
}

export interface ProgramaInstantaneo {
  sigla: string;
  slug: string;
  nomeCompleto: string;
  visaoGeralHtml: string;
  problemaHtml: string;
  objetivoHtml: string | null;
  publicoHtml: string;
  publicoChips: string[];
  eixos: { titulo: string; descricao: string }[];
  resultadosHtml: string;
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: string }[];
  modulos: ModuloInstantaneo[];
  /**
   * Carga horária total, lida verbatim do `metaBar` da origem (ex.: "64
   * horas"). String vazia quando nenhuma entrada do `metaBar` bate com
   * `/^\d+\s+horas$/` — quem mapeia (mapear.ts) trata isso como ausente e
   * não sobrescreve o valor já existente no banco.
   */
  cargaHorariaTotal: string;
}

export interface Instantaneo {
  programas: ProgramaInstantaneo[];
}
