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
}

export interface Instantaneo {
  geradoEm: string;
  programas: ProgramaInstantaneo[];
}
