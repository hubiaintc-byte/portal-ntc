/**
 * Listas controladas do módulo Financeiro — transcritas literalmente de
 * `PARAMS` do protótipo FIN-05 v0.2.2, sem os itens de comissão
 * (categoria "Comissões comerciais", modalidadesComissao, basesComissao,
 * condicoesAquisicao, vendedores), que ficam fora da Fase 1.
 */

export interface CategoriaCusto {
  nome: string;
  /** Afinidade contextual com a modalidade (apoio de UX; não gera custo). */
  mod: readonly ("on" | "pr")[];
  subs: readonly string[];
}

export interface CentroCusto {
  cod: string;
  nome: string;
}

export const CATEGORIAS_CUSTO: readonly CategoriaCusto[] = [
    { nome: "Instrutoria/Palestrantes", mod: ["on", "pr"], subs: ["Honorários", "Passagens", "Hospedagem", "Alimentação", "Deslocamento"] },
    { nome: "Planejamento e Curadoria", mod: ["on", "pr"], subs: ["Curadoria", "Preparação de conteúdo", "Coordenação técnica"] },
    { nome: "Criação e Design", mod: ["on", "pr"], subs: ["Identidade do evento", "Peças digitais", "Diagramação"] },
    { nome: "Material Gráfico e Divulgação", mod: ["on", "pr"], subs: ["Mídia paga", "Impressos", "Assessoria"] },
    { nome: "Tecnologia/Plataforma", mod: ["on"], subs: ["Licença de plataforma", "Configuração", "Integrações"] },
    { nome: "Estúdio", mod: ["on"], subs: ["Locação de estúdio", "Cenografia"] },
    { nome: "Operação Técnica/Transmissão", mod: ["on"], subs: ["Operador técnico", "Transmissão", "Link dedicado"] },
    { nome: "Audiovisual", mod: ["on", "pr"], subs: ["Som e projeção", "Captação", "Equipamentos"] },
    { nome: "Materiais Digitais", mod: ["on"], subs: ["E-books", "Apostilas digitais", "Templates"] },
    { nome: "Suporte ao Participante", mod: ["on"], subs: ["Central de suporte", "Monitoria"] },
    { nome: "Replay/Pós-produção", mod: ["on"], subs: ["Edição", "Legendagem", "Hospedagem de vídeo"] },
    { nome: "Armazenamento", mod: ["on"], subs: ["Nuvem", "Backup"] },
    { nome: "Espaço Físico", mod: ["pr"], subs: ["Locação", "Limpeza", "Segurança"] },
    { nome: "Estrutura do Evento", mod: ["pr"], subs: ["Montagem", "Mobiliário", "Sinalização"] },
    { nome: "Transporte e Logística", mod: ["pr"], subs: ["Passagens", "Hospedagem", "Traslados", "Frete"] },
    { nome: "Alimentação e Bebidas", mod: ["pr"], subs: ["Coffee break", "Almoço", "Água"] },
    { nome: "Material de Apoio", mod: ["pr"], subs: ["Kits", "Apostilas impressas", "Crachás"] },
    { nome: "Credenciamento", mod: ["pr"], subs: ["Sistema de credenciamento", "Recepção"] },
    { nome: "Organização Geral", mod: ["on", "pr"], subs: ["Equipe de apoio", "Coordenação local"] },
    { nome: "Apoio Local", mod: ["pr"], subs: ["Receptivo", "Serviços locais"] },
    { nome: "Certificados", mod: ["on", "pr"], subs: ["Emissão", "Validação digital"] },
    { nome: "Outras Despesas", mod: ["on", "pr"], subs: ["Diversas"] },
];

export const LISTAS_FIN = {
  verticais: ["Educação", "Gestão Pública", "Saúde"],
  tiposOperacao: ["Evento aberto", "In Company / Projeto B2G", "Programa", "Módulo", "Evento avulso"],
  modalidades: ["Online ao vivo", "Presencial", "Híbrido"],
  statusOperacional: ["Planejado", "Em preparação", "Em execução", "Realizado", "Encerrado"],
  statusReceita: ["Prevista", "Contratada", "Faturada parcialmente", "Faturada", "Recebida parcialmente", "Recebida"],
  statusCusto: ["Previsto", "Realizado", "Pago parcialmente", "Pago"],
  statusAlerta: ["OK", "Atenção", "Pendente", "Vencido", "A validar"],
  naturezas: ["Direto", "Indireto"],
  comportamentos: ["Fixo", "Variável", "Semivariável", "A validar"],
  fases: ["Pré-evento", "Execução", "Pós-evento", "Estrutura compartilhada"],
  segmentos: [
    "Estadual",
    "Municipal - Capital",
    "Municipal - Interior",
    "Câmaras",
    "Estaduais Independentes",
    "Federais e Outros",
    "Privado/Outro",
  ],
  origensReceita: ["Inscrição (evento aberto)", "Contrato B2G", "Adesão/Termo", "Outra"],
  tiposReceita: ["Inscrição", "Valor global", "Faturamento por etapa", "Faturamento por módulo"],
  drivers: [
    "Carga horária", "Participantes", "Pagantes", "Cortesias", "Turmas", "Módulos", "Especialistas",
    "Senioridade", "Modalidade", "Deslocamento", "Cidade/UF", "Dias", "Replay", "Tecnologia",
    "Customização", "Materiais", "Certificação", "Logística", "Escala", "Receita",
  ],
  unidades: ["un", "dia", "diária", "hora", "participante", "especialista", "trecho", "refeição", "kit", "mês", "serviço", "verba"],
  ufs: [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
  ],
  // Catálogo institucional de programas por vertical (nomenclatura NTC)
  programas: {
    "Educação": ["PROGE", "EDUTEC", "PEAR", "PEI", "PROGIR", "EGIDE", "PINEI", "VIVAESCOLA", "FUTURA"],
    "Gestão Pública": ["SIGA", "AGIP", "LIDERA"],
    "Saúde": ["PROSUS+", "PROAPS+", "SIGS"],
  } as Record<string, string[]>,
  centrosCusto: [
    { cod: "DIR", nome: "Diretoria" },
    { cod: "ADM", nome: "Administrativo e Financeiro" },
    { cod: "COM", nome: "Comercial B2G" },
    { cod: "OPE", nome: "Operações e Eventos" },
    { cod: "TEC", nome: "Tecnologia" },
    { cod: "MKT", nome: "Marketing institucional" },
    { cod: "EST", nome: "Estrutura compartilhada" },
  ] as CentroCusto[],
  categoriasCorporativas: [
    "Ocupação e utilidades", "Serviços administrativos", "Tecnologia e assinaturas", "Marketing institucional",
    "Despesas bancárias", "Tributos e taxas", "Pessoal e encargos", "Outras despesas corporativas",
  ],
  origensReceitaCorp: ["Consultoria institucional", "Patrocínio", "Convênio", "Receita financeira", "Outra receita corporativa"],
  tiposConta: ["Conta corrente", "Aplicação financeira", "Caixa interno"],
  tiposRetencao: ["Tributária", "Contratual"],
  tiposMovimento: ["Recebimento", "Pagamento", "Transferência", "Ajuste/avulso"],
  periodicidades: ["Única", "Mensal", "Bimestral", "Trimestral", "Anual"],
  criteriosReconhecimento: ["Execução declarada (provisório)", "Por etapa/módulo concluído", "Integral no encerramento"],
  responsaveis: [
    "Coordenação Educação", "Coordenação Gestão Pública", "Coordenação Saúde",
    "Coordenação de Eventos · EventON", "Departamento Financeiro",
  ],
  /** Taxonomia de custos — [BASELINE A LEVANTAR] (FIN-05 §9.1). */
  categorias: CATEGORIAS_CUSTO,
};

/** Nome do centro de custo; código desconhecido devolve o próprio código, vazio devolve "—". */
export function nomeCentro(cod: string): string {
  const c = LISTAS_FIN.centrosCusto.find((x) => x.cod === cod);
  return c ? c.nome : cod || "—";
}

/** Chaves de modalidade → afinidade de categorias (`modalidadeKeys` do protótipo). */
export function modalidadeKeys(modalidade: string): ("on" | "pr")[] {
  if (modalidade === "Online ao vivo") return ["on"];
  if (modalidade === "Presencial") return ["pr"];
  return ["on", "pr"];
}
