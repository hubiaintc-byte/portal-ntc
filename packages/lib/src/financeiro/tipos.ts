/**
 * Tipos do livro financeiro. Nomes de campo = os do protótipo FIN-05 v0.2.2
 * (mapa §2), sem os campos de comissão. Dinheiro sempre em centavos inteiros;
 * ids são `string` (no portal, o id do Payload em texto). Datas: `AAAA-MM-DD`.
 */

export type Centavos = number;

export type StatusOperacional = "Planejado" | "Em preparação" | "Em execução" | "Realizado" | "Encerrado";

export interface EventoFin {
  id: string;
  nome: string;
  vertical: string;
  tipo: string;
  modalidade: string;
  programa: string;
  modulo: string;
  cliente: string;
  cidade: string;
  uf: string;
  local: string;
  dataInicio: string;
  dataFim: string;
  cargaHoraria: number;
  responsavel: string;
  status: StatusOperacional;
  qtdPrevista: number;
  capacidade: number;
  efetivos: number;
  pagantesPrev: number;
  cortesiasPrev: number;
  /** "ID da oportunidade". */
  refCrm: string;
  refContratual: string;
  observacoes: string;
  // Integração com o CRM (portal).
  origem: "crm" | "financeiro";
  eventoComercialId: string | null;
  cadastroPendente: boolean;
  canceladoNoCrm: boolean;
}

export interface EtapaReceita {
  nome: string;
  base: "valor" | "percentual";
  valor: Centavos;
  percentual: number;
  concluida: boolean;
  dataConclusao: string;
}

export interface ReceitaFin {
  id: string;
  /** "" = receita corporativa. */
  eventoId: string;
  tipoLancamento: "Evento" | "Corporativa";
  centroCusto: string;
  cliente: string;
  segmento: string;
  origem: string;
  tipoReceita: string;
  etapa: string;
  qtde: number;
  valorUnit: Centavos;
  desconto: Centavos;
  pagantes: number;
  cortesias: number;
  /** Gravado só "Prevista" | "Contratada"; os demais status são derivados. */
  statusEconomico: string;
  criterioReconhecimento: string;
  etapas: EtapaReceita[];
  competencia: string;
  referencia: string;
  observacao: string;
}

/** Faturamento e recebimento na mesma linha (`fatrec` do protótipo). */
export interface FaturamentoFin {
  id: string;
  receitaId: string;
  eventoId: string;
  parcela: string;
  nf: string;
  dataFaturamento: string;
  valorFaturado: Centavos;
  vencimento: string;
  retencaoTributaria: Centavos;
  retencaoContratual: Centavos;
  retencaoContratualLiberada: Centavos;
  dataRecebimento: string;
  /** Acumulado. */
  valorRecebido: Centavos;
  contaId: string;
  quitado: boolean;
  observacao: string;
}

export interface CustoFin {
  id: string;
  eventoId: string;
  tipoLancamento: "Evento" | "Corporativa";
  centroCusto: string;
  compartilhada: boolean;
  origemLancamento: string;
  fase: string;
  categoria: string;
  subcategoria: string;
  descricao: string;
  fornecedor: string;
  documento: string;
  natureza: string;
  comportamento: string;
  driver: string;
  unidade: string;
  qtde: number;
  valorUnitPrev: Centavos;
  valorRealizado: Centavos;
  competencia: string;
  dataPrevista: string;
  /** Só corporativo; rótulo apenas, não gera recorrência. */
  periodicidade?: string;
  criterioApropriacao: string;
  observacao: string;
}

/** Título e baixa na mesma linha. */
export interface PagamentoFin {
  id: string;
  custoId: string;
  eventoId: string;
  documento: string;
  vencimento: string;
  /** Valor do título. */
  valor: Centavos;
  dataPagamento: string;
  /** Acumulado. */
  valorPago: Centavos;
  contaId: string;
  observacao: string;
}

export interface ContaFin {
  id: string;
  nome: string;
  tipo: string;
  banco: string;
  agencia: string;
  numero: string;
  saldoInicial: Centavos;
  dataSaldoInicial: string;
  ativa: boolean;
  observacao: string;
}

export interface LivroFinanceiro {
  eventos: EventoFin[];
  receitas: ReceitaFin[];
  faturamentos: FaturamentoFin[];
  custos: CustoFin[];
  pagamentos: PagamentoFin[];
  contas: ContaFin[];
}
