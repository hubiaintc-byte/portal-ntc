/**
 * Lista canônica final dos 15 Programas Estratégicos do Grupo NTC.
 *
 * Fonte de verdade: mega-menu de "Programas" em
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html (linhas 2036–2060,
 * data-cms-link). Resolve CLAUDE.md §17.11.
 *
 * Cada programa tem:
 * - sigla (string, ex.: "EDUTEC", "PROSUS+") — usada como identificador
 *   editorial e em rotas como /programas/[slug] (slug = sigla
 *   minúscula sem +).
 * - nomeCompleto (string) — copy do mega-menu.
 * - area (AreaSigla) — vertical institucional.
 *
 * Este shell é o ponto de partida da Sessão 11 (páginas de Programa)
 * — o conteúdo editorial completo (visaoGeral, problema, objetivo,
 * publicoAlvo, eixos, módulos, etc.) é preenchido pela equipe via
 * /admin/collections/programas.
 */

import type { AreaSigla } from "../shared/types";

export interface ProgramaShell {
  sigla: string;
  nomeCompleto: string;
  area: AreaSigla;
}

export const PROGRAMAS_CANONICOS: ProgramaShell[] = [
  // NTC Educação (9)
  {
    sigla: "EDUTEC",
    nomeCompleto: "Educação Digital, Inovação e Tecnologias para Redes Públicas",
    area: "educacao",
  },
  {
    sigla: "PEAR",
    nomeCompleto: "Alfabetização de Alta Performance e Recomposição da Aprendizagem",
    area: "educacao",
  },
  {
    sigla: "PEI",
    nomeCompleto: "Educação Integral — Gestão, Currículo e Resultados",
    area: "educacao",
  },
  {
    sigla: "PROGIR",
    nomeCompleto: "Gestão da Inclusão com Resultado",
    area: "educacao",
  },
  {
    sigla: "PROGE",
    nomeCompleto: "Gestão Escolar, Coordenação Pedagógica e Resultados",
    area: "educacao",
  },
  {
    sigla: "EGIDE",
    nomeCompleto: "IA, Dados e Governança da Transformação Digital",
    area: "educacao",
  },
  {
    sigla: "VIVAESCOLA",
    nomeCompleto: "Convivência, Permanência, Bem-Estar e Proteção Integral",
    area: "educacao",
  },
  {
    sigla: "PINEI",
    nomeCompleto: "Primeira Infância e Educação Infantil",
    area: "educacao",
  },
  {
    sigla: "FUTURA",
    nomeCompleto: "Ensino Médio, Itinerários de Futuro, Empregabilidade",
    area: "educacao",
  },
  // NTC Gestão Pública (3)
  {
    sigla: "AGIP",
    nomeCompleto: "Governança, Integridade e Performance nas Contratações Públicas",
    area: "gestao-publica",
  },
  {
    sigla: "LIDERA",
    nomeCompleto: "Liderança, Direção Estratégica e Resultados na Administração",
    area: "gestao-publica",
  },
  {
    sigla: "SIGA",
    nomeCompleto: "Soluções Inteligentes de Governança e Administração",
    area: "gestao-publica",
  },
  // NTC Saúde (3)
  {
    sigla: "SIGS",
    nomeCompleto: "Saúde Inteligente, Governança Digital, IA e Transformação do SUS",
    area: "saude",
  },
  {
    sigla: "PROAPS+",
    nomeCompleto: "Alta Performance na Atenção Primária e Redes de Cuidado",
    area: "saude",
  },
  {
    sigla: "PROSUS+",
    nomeCompleto: "Governança, Financiamento e Performance no SUS",
    area: "saude",
  },
];

/**
 * Slug canônico a partir da sigla: minúsculas, `+` vira `-plus`.
 * Usado em /programas/[slug] e nos cards.
 *
 * Exemplos: "EDUTEC" → "edutec", "PROSUS+" → "prosus-plus",
 * "PROAPS+" → "proaps-plus". Alinhado ao que o seed.ts original já
 * persistiu no banco (autoSlug do nome aplicava esta regra).
 */
export function slugDoPrograma(sigla: string): string {
  return sigla.toLowerCase().replace(/\+/g, "-plus");
}
