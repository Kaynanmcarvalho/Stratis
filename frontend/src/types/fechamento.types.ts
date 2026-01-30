/**
 * Tipos do Sistema de Fechamento Automático - Straxis SaaS
 * Alpha 12.0.0 - MAJOR (Nova Funcionalidade Crítica)
 * 29/01/2026
 */

// Configuração do Fechamento
export interface ConfiguracaoFechamento {
  id: string;
  companyId: string;
  
  // Frequência
  frequencia: 'diario' | 'semanal' | 'mensal';
  diaSemana?: number; // 0-6 (domingo-sábado)
  diaMes?: number; // 1-31
  horario: string; // "18:00"
  
  // Tipo
  tipoFechamento: 'por_equipe' | 'geral' | 'ambos';
  
  // Envio
  formasEnvio: ('whatsapp' | 'pdf' | 'email')[];
  destinatarios: Destinatario[];
  
  // Validações
  bloquearSeInconsistente: boolean;
  notificarPendencias: boolean;
  
  // Metadados
  ativo: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface Destinatario {
  tipo: 'dono' | 'gestor' | 'numero_especifico';
  valor: string; // telefone ou email
  nome?: string;
}

// Diária Calculada
export interface DiariaCalculada {
  data: Date;
  tipo: 'completa' | 'meia' | 'falta' | 'hora_extra';
  horasTrabalhadas: number;
  valorCentavos: number;
  baseadoEm: 'ponto' | 'excecao';
  observacao?: string;
}

// Fechamento por Funcionário
export interface FechamentoPorFuncionario {
  funcionarioId: string;
  nome: string;
  funcao: string;
  
  // Dias trabalhados
  diasCompletos: number;
  meiaDiarias: number;
  faltas: number;
  
  // Valores
  valorDiariaBaseCentavos: number;
  valorTotalDiariasCentavos: number;
  valorHorasExtrasCentavos: number;
  valorTotalDevidoCentavos: number;
  valorPagoCentavos: number;
  saldoCentavos: number;
  
  // Detalhamento
  detalhamentoDias: DiariaCalculada[];
}

// Fechamento por Equipe
export interface FechamentoPorEquipe {
  equipeNome: string;
  funcionarios: FechamentoPorFuncionario[];
  totalDiarias: number;
  custoTotalCentavos: number;
  totalPagoCentavos: number;
  saldoCentavos: number;
}

// Totais do Fechamento
export interface TotaisFechamento {
  totalFuncionarios: number;
  totalDiariasCompletas: number;
  totalMeiaDiarias: number;
  totalFaltas: number;
  totalHorasExtras: number;
  custoTotalCentavos: number;
  totalPagoCentavos: number;
  saldoGeralCentavos: number;
}

// Insights Automáticos
export interface InsightsFechamento {
  funcionariosComMaisMeiaDiaria: {
    funcionarioId: string;
    nome: string;
    quantidade: number;
    percentual: number;
  }[];
  
  faltasRecorrentes: {
    funcionarioId: string;
    nome: string;
    faltas: number;
    diasSemana: string[];
  }[];
  
  horasExtrasExcessivas: {
    funcionarioId: string;
    nome: string;
    horasExtras: number;
    custoAdicionalCentavos: number;
  }[];
  
  equipeMaisProdutiva?: {
    equipe: string;
    diasTrabalhados: number;
    eficiencia: number;
  };
  
  equipeMaisCara?: {
    equipe: string;
    custoCentavos: number;
    custoMedioPorDiaria: number;
  };
  
  variacaoEmRelacaoAoAnterior?: {
    custoTotal: { valor: number; percentual: number };
    diarias: { valor: number; percentual: number };
    faltas: { valor: number; percentual: number };
  };
  
  alertas: AlertaFechamento[];
}

export interface AlertaFechamento {
  tipo: 'custo_alto' | 'faltas_excessivas' | 'horas_extras_altas' | 'info';
  severidade: 'info' | 'warning' | 'critical';
  mensagem: string;
  acao: string;
}

// Validação de Fechamento
export interface ValidacaoFechamento {
  valido: boolean;
  errosCriticos: ErroFechamento[];
  avisos: AvisoFechamento[];
  podeFechar: boolean;
}

export interface ErroFechamento {
  tipo: 'funcionario_sem_ponto' | 'diaria_sem_valor' | 'trabalho_nao_finalizado' | 'excecao_nao_resolvida';
  funcionarioId?: string;
  funcionarioNome?: string;
  data?: Date;
  descricao: string;
  acaoCorretiva: string;
}

export interface AvisoFechamento {
  tipo: 'meia_diaria_frequente' | 'falta_sem_justificativa' | 'hora_extra_excessiva';
  funcionarioId?: string;
  funcionarioNome?: string;
  descricao: string;
}

// Fechamento Geral
export interface FechamentoGeral {
  id: string;
  numero: number; // Sequencial: #001, #002, etc
  companyId: string;
  
  // Período
  periodo: { inicio: Date; fim: Date };
  tipo: 'diario' | 'semanal' | 'mensal';
  
  // Consolidação
  porFuncionario: FechamentoPorFuncionario[];
  porEquipe: FechamentoPorEquipe[];
  totais: TotaisFechamento;
  insights: InsightsFechamento;
  validacoes: ValidacaoFechamento;
  
  // Status
  status: 'rascunho' | 'fechado' | 'ajustado' | 'cancelado';
  
  // Metadados
  geradoEm: Date;
  geradoPor: string;
  motivoManual?: string; // Se foi fechamento manual
  
  // Auditoria
  ajustes: AjusteFechamento[];
  
  // Imutabilidade
  hash: string; // Hash dos dados para garantir integridade
  
  // Arquivos
  pdfUrl?: string;
  excelUrl?: string;
}

export interface AjusteFechamento {
  data: Date;
  usuario: string;
  motivo: string;
  alteracoes: any;
  fechamentoAnteriorId: string;
  fechamentoNovoId: string;
}

// Labels
export const FREQUENCIA_LABELS: Record<ConfiguracaoFechamento['frequencia'], string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  mensal: 'Mensal',
};

export const DIAS_SEMANA_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

export const TIPO_FECHAMENTO_LABELS: Record<ConfiguracaoFechamento['tipoFechamento'], string> = {
  por_equipe: 'Por Equipe',
  geral: 'Geral',
  ambos: 'Ambos',
};

export const FORMA_ENVIO_LABELS: Record<ConfiguracaoFechamento['formasEnvio'][0], string> = {
  whatsapp: 'WhatsApp',
  pdf: 'PDF',
  email: 'E-mail',
};

export const STATUS_FECHAMENTO_LABELS: Record<FechamentoGeral['status'], string> = {
  rascunho: 'Rascunho',
  fechado: 'Fechado',
  ajustado: 'Ajustado',
  cancelado: 'Cancelado',
};
