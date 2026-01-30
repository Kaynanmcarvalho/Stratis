/**
 * Sistema de Registro de Decisões - Straxis SaaS
 * Alpha 13.0.0 - MAJOR (Breaking Change - Reconstrução Completa de Logs)
 * 29/01/2026
 * 
 * CRÍTICO: Sistema de auditoria com valor jurídico
 * - Imutabilidade garantida (hash SHA-256)
 * - Isolamento multiempresa forçado
 * - Identificação de IA vs Humano
 * - Rastreabilidade completa
 */

// Enum de Tipos de Decisão (30+ tipos)
export enum TipoDecisao {
  // Trabalhos
  TRABALHO_CRIADO = 'trabalho_criado',
  TRABALHO_EDITADO = 'trabalho_editado',
  TRABALHO_FINALIZADO = 'trabalho_finalizado',
  TRABALHO_EXCLUIDO = 'trabalho_excluido',
  TRABALHO_RESTAURADO = 'trabalho_restaurado',
  TONELAGEM_ALTERADA = 'tonelagem_alterada',
  
  // Agendamentos
  AGENDAMENTO_CRIADO = 'agendamento_criado',
  AGENDAMENTO_CONFIRMADO = 'agendamento_confirmado',
  AGENDAMENTO_CANCELADO = 'agendamento_cancelado',
  AGENDAMENTO_EDITADO = 'agendamento_editado',
  
  // Funcionários
  FUNCIONARIO_CRIADO = 'funcionario_criado',
  FUNCIONARIO_EDITADO = 'funcionario_editado',
  FUNCIONARIO_DESATIVADO = 'funcionario_desativado',
  FUNCIONARIO_REATIVADO = 'funcionario_reativado',
  
  // Ponto
  PONTO_BATIDO = 'ponto_batido',
  PONTO_CORRIGIDO = 'ponto_corrigido',
  EXCECAO_REGISTRADA = 'excecao_registrada',
  
  // Pagamentos
  PAGAMENTO_MARCADO = 'pagamento_marcado',
  PAGAMENTO_EDITADO = 'pagamento_editado',
  PAGAMENTO_CANCELADO = 'pagamento_cancelado',
  
  // Clientes
  CLIENTE_CRIADO = 'cliente_criado',
  CLIENTE_EDITADO = 'cliente_editado',
  CLIENTE_DESATIVADO = 'cliente_desativado',
  CLIENTE_REATIVADO = 'cliente_reativado',
  
  // Fechamento
  FECHAMENTO_GERADO = 'fechamento_gerado',
  FECHAMENTO_ENVIADO = 'fechamento_enviado',
  FECHAMENTO_CONFIGURADO = 'fechamento_configurado',
  
  // Permissões
  CARGO_CRIADO = 'cargo_criado',
  CARGO_EDITADO = 'cargo_editado',
  CARGO_EXCLUIDO = 'cargo_excluido',
  PERMISSOES_ALTERADAS = 'permissoes_alteradas',
  
  // Sistema
  CONFIGURACAO_ALTERADA = 'configuracao_alterada',
  USUARIO_CRIADO = 'usuario_criado',
  USUARIO_EDITADO = 'usuario_editado',
  USUARIO_DESATIVADO = 'usuario_desativado',
  
  // Acesso
  LOGIN_REALIZADO = 'login_realizado',
  LOGOUT_REALIZADO = 'logout_realizado',
  ACESSO_NEGADO = 'acesso_negado',
}

// Origem da Decisão
export enum OrigemDecisao {
  HUMANO = 'humano',
  IA_OPENAI = 'ia_openai',
  IA_GEMINI = 'ia_gemini',
  SISTEMA = 'sistema',
  WHATSAPP = 'whatsapp',
}

// Nível de Criticidade
export enum CriticidadeDecisao {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

// Interface de Registro de Decisão
export interface RegistroDecisao {
  id: string;
  companyId: string;  // NUNCA null - isolamento forçado
  userId: string | null;  // null apenas para IA/Sistema
  
  // Tipo e Origem
  tipo: TipoDecisao;
  origem: OrigemDecisao;
  criticidade: CriticidadeDecisao;
  
  // Descrição Humanizada
  titulo: string;  // Ex: "Trabalho criado"
  descricao: string;  // Ex: "João criou trabalho #1234 para Cliente ABC"
  
  // Dados Estruturados
  entidade: string;  // Ex: "trabalho", "funcionario", "pagamento"
  entidadeId: string;  // ID da entidade afetada
  acao: string;  // Ex: "criar", "editar", "excluir"
  
  // Contexto da Decisão
  antes: Record<string, any> | null;  // Estado anterior (para edições)
  depois: Record<string, any>;  // Estado novo
  motivoIA?: string;  // Se IA, explicação da decisão
  
  // Metadados de IA
  modeloIA?: string;  // Ex: "gpt-4", "gemini-pro"
  tokensUsados?: number;
  custoEstimadoCentavos?: number;
  confiancaIA?: number;  // 0-100
  
  // Auditoria e Imutabilidade
  hash: string;  // SHA-256 do registro (garante imutabilidade)
  hashAnterior: string | null;  // Hash do registro anterior (blockchain-like)
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  
  // Verificação
  verificado: boolean;  // Se hash foi verificado
  integro: boolean;  // Se registro não foi adulterado
}

// Filtros de Busca
export interface FiltrosDecisao {
  companyId: string;  // OBRIGATÓRIO - isolamento forçado
  tipos?: TipoDecisao[];
  origens?: OrigemDecisao[];
  criticidades?: CriticidadeDecisao[];
  entidades?: string[];
  usuarioId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string;  // Busca em titulo/descricao
  limit?: number;
  offset?: number;
}

// Estatísticas de Decisões
export interface EstatisticasDecisoes {
  totalDecisoes: number;
  decisoesHumanas: number;
  decisoesIA: number;
  decisoesSistema: number;
  porTipo: Record<TipoDecisao, number>;
  porOrigem: Record<OrigemDecisao, number>;
  porCriticidade: Record<CriticidadeDecisao, number>;
  custoTotalIACentavos: number;
  tokensUsados: number;
}

// Labels Humanizados
export const TIPO_DECISAO_LABELS: Record<TipoDecisao, string> = {
  // Trabalhos
  [TipoDecisao.TRABALHO_CRIADO]: 'Trabalho criado',
  [TipoDecisao.TRABALHO_EDITADO]: 'Trabalho editado',
  [TipoDecisao.TRABALHO_FINALIZADO]: 'Trabalho finalizado',
  [TipoDecisao.TRABALHO_EXCLUIDO]: 'Trabalho excluído',
  [TipoDecisao.TRABALHO_RESTAURADO]: 'Trabalho restaurado',
  [TipoDecisao.TONELAGEM_ALTERADA]: 'Tonelagem alterada',
  
  // Agendamentos
  [TipoDecisao.AGENDAMENTO_CRIADO]: 'Agendamento criado',
  [TipoDecisao.AGENDAMENTO_CONFIRMADO]: 'Agendamento confirmado',
  [TipoDecisao.AGENDAMENTO_CANCELADO]: 'Agendamento cancelado',
  [TipoDecisao.AGENDAMENTO_EDITADO]: 'Agendamento editado',
  
  // Funcionários
  [TipoDecisao.FUNCIONARIO_CRIADO]: 'Funcionário criado',
  [TipoDecisao.FUNCIONARIO_EDITADO]: 'Funcionário editado',
  [TipoDecisao.FUNCIONARIO_DESATIVADO]: 'Funcionário desativado',
  [TipoDecisao.FUNCIONARIO_REATIVADO]: 'Funcionário reativado',
  
  // Ponto
  [TipoDecisao.PONTO_BATIDO]: 'Ponto batido',
  [TipoDecisao.PONTO_CORRIGIDO]: 'Ponto corrigido',
  [TipoDecisao.EXCECAO_REGISTRADA]: 'Exceção registrada',
  
  // Pagamentos
  [TipoDecisao.PAGAMENTO_MARCADO]: 'Pagamento marcado',
  [TipoDecisao.PAGAMENTO_EDITADO]: 'Pagamento editado',
  [TipoDecisao.PAGAMENTO_CANCELADO]: 'Pagamento cancelado',
  
  // Clientes
  [TipoDecisao.CLIENTE_CRIADO]: 'Cliente criado',
  [TipoDecisao.CLIENTE_EDITADO]: 'Cliente editado',
  [TipoDecisao.CLIENTE_DESATIVADO]: 'Cliente desativado',
  [TipoDecisao.CLIENTE_REATIVADO]: 'Cliente reativado',
  
  // Fechamento
  [TipoDecisao.FECHAMENTO_GERADO]: 'Fechamento gerado',
  [TipoDecisao.FECHAMENTO_ENVIADO]: 'Fechamento enviado',
  [TipoDecisao.FECHAMENTO_CONFIGURADO]: 'Fechamento configurado',
  
  // Permissões
  [TipoDecisao.CARGO_CRIADO]: 'Cargo criado',
  [TipoDecisao.CARGO_EDITADO]: 'Cargo editado',
  [TipoDecisao.CARGO_EXCLUIDO]: 'Cargo excluído',
  [TipoDecisao.PERMISSOES_ALTERADAS]: 'Permissões alteradas',
  
  // Sistema
  [TipoDecisao.CONFIGURACAO_ALTERADA]: 'Configuração alterada',
  [TipoDecisao.USUARIO_CRIADO]: 'Usuário criado',
  [TipoDecisao.USUARIO_EDITADO]: 'Usuário editado',
  [TipoDecisao.USUARIO_DESATIVADO]: 'Usuário desativado',
  
  // Acesso
  [TipoDecisao.LOGIN_REALIZADO]: 'Login realizado',
  [TipoDecisao.LOGOUT_REALIZADO]: 'Logout realizado',
  [TipoDecisao.ACESSO_NEGADO]: 'Acesso negado',
};

export const ORIGEM_DECISAO_LABELS: Record<OrigemDecisao, string> = {
  [OrigemDecisao.HUMANO]: 'Humano',
  [OrigemDecisao.IA_OPENAI]: 'IA (OpenAI)',
  [OrigemDecisao.IA_GEMINI]: 'IA (Gemini)',
  [OrigemDecisao.SISTEMA]: 'Sistema',
  [OrigemDecisao.WHATSAPP]: 'WhatsApp',
};

export const CRITICIDADE_DECISAO_LABELS: Record<CriticidadeDecisao, string> = {
  [CriticidadeDecisao.BAIXA]: 'Baixa',
  [CriticidadeDecisao.MEDIA]: 'Média',
  [CriticidadeDecisao.ALTA]: 'Alta',
  [CriticidadeDecisao.CRITICA]: 'Crítica',
};

// Cores para UI
export const ORIGEM_DECISAO_CORES: Record<OrigemDecisao, string> = {
  [OrigemDecisao.HUMANO]: '#4CAF50',
  [OrigemDecisao.IA_OPENAI]: '#2196F3',
  [OrigemDecisao.IA_GEMINI]: '#9C27B0',
  [OrigemDecisao.SISTEMA]: '#757575',
  [OrigemDecisao.WHATSAPP]: '#25D366',
};

export const CRITICIDADE_DECISAO_CORES: Record<CriticidadeDecisao, string> = {
  [CriticidadeDecisao.BAIXA]: '#4CAF50',
  [CriticidadeDecisao.MEDIA]: '#FF9800',
  [CriticidadeDecisao.ALTA]: '#F44336',
  [CriticidadeDecisao.CRITICA]: '#D32F2F',
};

// Mapeamento de Criticidade por Tipo
export const CRITICIDADE_POR_TIPO: Record<TipoDecisao, CriticidadeDecisao> = {
  // Trabalhos
  [TipoDecisao.TRABALHO_CRIADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.TRABALHO_EDITADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.TRABALHO_FINALIZADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.TRABALHO_EXCLUIDO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.TRABALHO_RESTAURADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.TONELAGEM_ALTERADA]: CriticidadeDecisao.CRITICA,
  
  // Agendamentos
  [TipoDecisao.AGENDAMENTO_CRIADO]: CriticidadeDecisao.BAIXA,
  [TipoDecisao.AGENDAMENTO_CONFIRMADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.AGENDAMENTO_CANCELADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.AGENDAMENTO_EDITADO]: CriticidadeDecisao.BAIXA,
  
  // Funcionários
  [TipoDecisao.FUNCIONARIO_CRIADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.FUNCIONARIO_EDITADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.FUNCIONARIO_DESATIVADO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.FUNCIONARIO_REATIVADO]: CriticidadeDecisao.ALTA,
  
  // Ponto
  [TipoDecisao.PONTO_BATIDO]: CriticidadeDecisao.BAIXA,
  [TipoDecisao.PONTO_CORRIGIDO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.EXCECAO_REGISTRADA]: CriticidadeDecisao.MEDIA,
  
  // Pagamentos
  [TipoDecisao.PAGAMENTO_MARCADO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.PAGAMENTO_EDITADO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.PAGAMENTO_CANCELADO]: CriticidadeDecisao.CRITICA,
  
  // Clientes
  [TipoDecisao.CLIENTE_CRIADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.CLIENTE_EDITADO]: CriticidadeDecisao.BAIXA,
  [TipoDecisao.CLIENTE_DESATIVADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.CLIENTE_REATIVADO]: CriticidadeDecisao.MEDIA,
  
  // Fechamento
  [TipoDecisao.FECHAMENTO_GERADO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.FECHAMENTO_ENVIADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.FECHAMENTO_CONFIGURADO]: CriticidadeDecisao.MEDIA,
  
  // Permissões
  [TipoDecisao.CARGO_CRIADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.CARGO_EDITADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.CARGO_EXCLUIDO]: CriticidadeDecisao.CRITICA,
  [TipoDecisao.PERMISSOES_ALTERADAS]: CriticidadeDecisao.CRITICA,
  
  // Sistema
  [TipoDecisao.CONFIGURACAO_ALTERADA]: CriticidadeDecisao.ALTA,
  [TipoDecisao.USUARIO_CRIADO]: CriticidadeDecisao.ALTA,
  [TipoDecisao.USUARIO_EDITADO]: CriticidadeDecisao.MEDIA,
  [TipoDecisao.USUARIO_DESATIVADO]: CriticidadeDecisao.CRITICA,
  
  // Acesso
  [TipoDecisao.LOGIN_REALIZADO]: CriticidadeDecisao.BAIXA,
  [TipoDecisao.LOGOUT_REALIZADO]: CriticidadeDecisao.BAIXA,
  [TipoDecisao.ACESSO_NEGADO]: CriticidadeDecisao.ALTA,
};
