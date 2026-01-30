/**
 * Tipos do Sistema de Offline Controlado - Straxis SaaS
 * Alpha 14.0.0 - MAJOR (Sistema Offline Completo)
 * 29/01/2026
 * 
 * CRÍTICO: Modo offline com controle total
 */

// Ações permitidas offline (WHITELIST)
export enum AcaoOfflinePermitida {
  BATER_PONTO = 'bater_ponto',
  INICIAR_TRABALHO = 'iniciar_trabalho',
  PAUSAR_TRABALHO = 'pausar_trabalho',
  RETOMAR_TRABALHO = 'retomar_trabalho',
  FINALIZAR_TRABALHO = 'finalizar_trabalho',
  REGISTRAR_OBSERVACAO = 'registrar_observacao',
  MARCAR_EXCECAO_SIMPLES = 'marcar_excecao_simples',
}

// Status de operação offline
export enum StatusOperacaoOffline {
  PENDENTE = 'pendente',
  SINCRONIZANDO = 'sincronizando',
  SINCRONIZADA = 'sincronizada',
  FALHA = 'falha',
  EXPIRADA = 'expirada',
  CONFLITO = 'conflito',
}

// Tipo de conflito
export enum TipoConflito {
  MODIFICACAO_CONCORRENTE = 'modificacao_concorrente',
  DUPLICIDADE = 'duplicidade',
  DADOS_EXCLUIDOS = 'dados_excluidos',
  DADOS_INVALIDOS = 'dados_invalidos',
}

// Operação offline (estrutura completa)
export interface OperacaoOffline {
  id: string;
  companyId: string;  // OBRIGATÓRIO - isolamento
  userId: string;
  
  // Tipo de operação
  acao: AcaoOfflinePermitida;
  entidade: string;
  entidadeId: string;
  
  // Dados
  dados: Record<string, any>;
  dadosAntes?: Record<string, any>;  // Para updates
  
  // Timestamps
  timestampLocal: Date;  // Quando foi criada offline
  timestampSync?: Date;  // Quando foi sincronizada
  
  // Status e controle
  status: StatusOperacaoOffline;
  tentativas: number;
  ultimaTentativa?: Date;
  
  // Conflito (se houver)
  conflito?: {
    tipo: TipoConflito;
    mensagem: string;
    dadosServidor: Record<string, any>;
    resolucao?: 'manter_servidor' | 'manter_local' | 'mesclar' | 'manual';
  };
  
  // Metadados
  ip?: string;
  userAgent?: string;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
}

// Validação de operação
export interface ValidacaoOperacao {
  operacaoId: string;
  valida: boolean;
  motivo?: string;
  conflito?: {
    tipo: TipoConflito;
    mensagem: string;
    dadosServidor: Record<string, any>;
  };
  expirada: boolean;
  duplicada: boolean;
}

// Resultado de sincronização
export interface ResultadoSincronizacao {
  total: number;
  sincronizadas: number;
  falhas: number;
  conflitos: number;
  expiradas: number;
  detalhes: Array<{
    operacaoId: string;
    status: 'sucesso' | 'falha' | 'conflito' | 'expirada';
    mensagem?: string;
  }>;
}

// Estado do sistema offline
export interface EstadoOffline {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  syncError: string | null;
  oldestPendingAge: number | null;  // Em horas
}

// Configuração de limites
export const LIMITES_OFFLINE = {
  MAX_HORAS_OFFLINE: 24,
  MAX_TENTATIVAS: 3,
  INTERVALO_SYNC_MS: 5 * 60 * 1000,  // 5 minutos
  ALERTA_HORAS_OFFLINE: 12,
  MAX_OPERACOES_PENDENTES: 100,
};

// Labels humanizados
export const ACAO_OFFLINE_LABELS: Record<AcaoOfflinePermitida, string> = {
  [AcaoOfflinePermitida.BATER_PONTO]: 'Bater ponto',
  [AcaoOfflinePermitida.INICIAR_TRABALHO]: 'Iniciar trabalho',
  [AcaoOfflinePermitida.PAUSAR_TRABALHO]: 'Pausar trabalho',
  [AcaoOfflinePermitida.RETOMAR_TRABALHO]: 'Retomar trabalho',
  [AcaoOfflinePermitida.FINALIZAR_TRABALHO]: 'Finalizar trabalho',
  [AcaoOfflinePermitida.REGISTRAR_OBSERVACAO]: 'Registrar observação',
  [AcaoOfflinePermitida.MARCAR_EXCECAO_SIMPLES]: 'Marcar exceção',
};

export const STATUS_OPERACAO_LABELS: Record<StatusOperacaoOffline, string> = {
  [StatusOperacaoOffline.PENDENTE]: 'Pendente',
  [StatusOperacaoOffline.SINCRONIZANDO]: 'Sincronizando',
  [StatusOperacaoOffline.SINCRONIZADA]: 'Sincronizada',
  [StatusOperacaoOffline.FALHA]: 'Falha',
  [StatusOperacaoOffline.EXPIRADA]: 'Expirada',
  [StatusOperacaoOffline.CONFLITO]: 'Conflito',
};

export const TIPO_CONFLITO_LABELS: Record<TipoConflito, string> = {
  [TipoConflito.MODIFICACAO_CONCORRENTE]: 'Modificação concorrente',
  [TipoConflito.DUPLICIDADE]: 'Duplicidade',
  [TipoConflito.DADOS_EXCLUIDOS]: 'Dados excluídos',
  [TipoConflito.DADOS_INVALIDOS]: 'Dados inválidos',
};

// Cores para UI
export const STATUS_OPERACAO_CORES: Record<StatusOperacaoOffline, string> = {
  [StatusOperacaoOffline.PENDENTE]: '#FF9800',
  [StatusOperacaoOffline.SINCRONIZANDO]: '#2196F3',
  [StatusOperacaoOffline.SINCRONIZADA]: '#4CAF50',
  [StatusOperacaoOffline.FALHA]: '#F44336',
  [StatusOperacaoOffline.EXPIRADA]: '#9E9E9E',
  [StatusOperacaoOffline.CONFLITO]: '#FF5722',
};
