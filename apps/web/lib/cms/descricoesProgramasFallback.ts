/**
 * Textos curtos dos programas no menu "Programas" do cabeçalho
 * (`HeaderHome`) e no mapa do site — copiados 1:1 do JSX aprovado,
 * de onde saíram quando as duas listas passaram a ler do CMS
 * (`pagina.cartao.descricaoMenu`/`descricaoMapa`).
 *
 * Servem a dois usos: (1) o gerador do instantâneo
 * (`scripts/gerar-instantaneo-paginas-programas.mjs`) leva estes textos
 * para a carga no CMS; (2) `carregarListasProgramas` cai neles se a
 * leitura do CMS falhar. Sem imports: o gerador importa este arquivo
 * direto pelo Node.
 */

export interface DescricoesPrograma {
  menu: string;
  mapa: string;
}

export const DESCRICOES_PROGRAMAS_FALLBACK: Record<string, DescricoesPrograma> = {
  EDUTEC: {
    menu: "Educação Digital, Inovação e Tecnologias para Redes Públicas",
    mapa: "Educação Digital · Inovação · Tecnologias",
  },
  PEAR: {
    menu: "Alfabetização de Alta Performance e Recomposição da Aprendizagem",
    mapa: "Alfabetização e recomposição da aprendizagem",
  },
  PEI: {
    menu: "Educação Integral — Gestão, Currículo e Resultados",
    mapa: "Educação Integral · gestão e currículo",
  },
  PROGIR: {
    menu: "Gestão da Inclusão com Resultado",
    mapa: "Gestão da Inclusão com resultado",
  },
  PROGE: {
    menu: "Gestão Escolar, Coordenação Pedagógica e Resultados",
    mapa: "Gestão Escolar e coordenação pedagógica",
  },
  EGIDE: {
    menu: "IA, Dados e Governança da Transformação Digital",
    mapa: "IA, dados e governança digital",
  },
  VIVAESCOLA: {
    menu: "Convivência, Permanência, Bem-Estar e Proteção Integral",
    mapa: "Convivência, bem-estar e proteção integral",
  },
  PINEI: {
    menu: "Primeira Infância e Educação Infantil",
    mapa: "Primeira Infância e Educação Infantil",
  },
  FUTURA: {
    menu: "Ensino Médio, Itinerários de Futuro, Empregabilidade",
    mapa: "Ensino Médio e empregabilidade",
  },
  AGIP: {
    menu: "Governança, Integridade e Performance nas Contratações Públicas",
    mapa: "Governança e performance em contratações",
  },
  LIDERA: {
    menu: "Liderança, Direção Estratégica e Resultados na Administração",
    mapa: "Liderança e direção estratégica",
  },
  SIGA: {
    menu: "Soluções Inteligentes de Governança e Administração",
    mapa: "Soluções inteligentes de governança",
  },
  SIGS: {
    menu: "Saúde Inteligente, Governança Digital, IA e Transformação do SUS",
    mapa: "Sistema integrado de gestão em saúde",
  },
  "PROAPS+": {
    menu: "Alta Performance na Atenção Primária e Redes de Cuidado",
    mapa: "Atenção Primária e redes de cuidado",
  },
  "PROSUS+": {
    menu: "Governança, Financiamento e Performance no SUS",
    mapa: "Direção institucional em saúde pública",
  },
};
