export type StatusTrabalho = 'concluido' | 'cancelado' | 'ajustado' | 'pendente';
export type TipoTrabalho = 'carga' | 'descarga';
export type PeriodoRelatorio = 'diario' | 'semanal' | 'mensal' | 'personalizado';

export interface ExcecaoRelatorio {
  id: string;
  tipo: 'falta' | 'meia_diaria' | 'atraso' | 'saida_antecipada' | 'hora_extra';
  motivo: string;
  impactoFinanceiroCentavos: number;
  funcionarioNome: string;
}

export interface AjusteRelatorio {
  id: string;
  tipo: 'tonelagem' | 'valor' | 'funcionario';
  valorAnterior: string;
  valorNovo: string;
  motivo: string;
  alteradoPor: string;
  dataAlteracao: Date;
}

export interface FuncionarioTrabalho {
  id: string;
  nome: string;
  funcao: string;
  diariaBaseCentavos: number;
  diariaPagaCentavos: number;
  horasExtras: number;
  excecoes: ExcecaoRelatorio[];
}

export interface TrabalhoDetalhado {
  id: string;
  data: Date;
  tipo: TipoTrabalho;
  status: StatusTrabalho;
  clienteId: string;
  clienteNome: string;
  tonelagem: number;
  valorRecebidoCentavos: number;
  totalPagoCentavos: number;
  lucroCentavos: number;
  funcionarios: FuncionarioTrabalho[];
  excecoes: ExcecaoRelatorio[];
  ajustes: AjusteRelatorio[];
  observacoes?: string;
  registradoPor: string;
  registradoEm: Date;
  alteradoEm?: Date;
}

export interface RelatorioData {
  periodo: string;
  dataInicio: Date;
  dataFim: Date;
  faturamentoTotalCentavos: number;
  custosTotaisCentavos: number;
  lucroTotalCentavos: number;
  quantidadeTrabalhos: number;
  quantidadeCancelados: number;
  quantidadeAjustados: number;
  tonelagemTotal: number;
  trabalhos: TrabalhoDetalhado[];
  excecoesTotais: ExcecaoRelatorio[];
  ajustesTotais: AjusteRelatorio[];
}

export interface FiltrosRelatorio {
  periodo: PeriodoRelatorio;
  dataInicio?: Date;
  dataFim?: Date;
  clienteId?: string;
  tipo?: TipoTrabalho;
  funcionarioId?: string;
  status?: StatusTrabalho;
}

export interface RelatorioExcecoes {
  periodo: string;
  totalExcecoes: number;
  impactoFinanceiroTotalCentavos: number;
  excecoesDetalhadas: {
    funcionarioId: string;
    funcionarioNome: string;
    faltas: number;
    meiaDiaria: number;
    atrasos: number;
    saidasAntecipadas: number;
    horasExtras: number;
    impactoTotalCentavos: number;
  }[];
}

export interface RelatorioPagamentos {
  periodo: string;
  totalCalculadoCentavos: number;
  totalPagoCentavos: number;
  totalPendenteCentavos: number;
  pagamentosDetalhados: {
    funcionarioId: string;
    funcionarioNome: string;
    valorCalculadoCentavos: number;
    valorPagoCentavos: number;
    diferencaCentavos: number;
    pagamentos: {
      data: Date;
      valorCentavos: number;
      formaPagamento: string;
      comprovante?: string;
    }[];
  }[];
}

export interface RelatorioCliente {
  clienteId: string;
  clienteNome: string;
  periodo: string;
  quantidadeTrabalhos: number;
  tonelagemTotal: number;
  faturamentoTotalCentavos: number;
  custosTotaisCentavos: number;
  lucroTotalCentavos: number;
  margemLucro: number;
  frequenciaTrabalhos: number; // trabalhos por mês
  historicoAjustes: AjusteRelatorio[];
  trabalhos: TrabalhoDetalhado[];
}

export interface ComparacaoPeriodos {
  periodoAtual: RelatorioData;
  periodoAnterior: RelatorioData;
  variacoes: {
    faturamento: number; // %
    custos: number; // %
    lucro: number; // %
    trabalhos: number; // %
    tonelagem: number; // %
  };
}
