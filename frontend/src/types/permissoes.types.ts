/**
 * Sistema de Permissões Granulares - Straxis SaaS
 * Alpha 11.0.0 - MAJOR (Breaking Change)
 * 29/01/2026
 */

// Enum de Permissões (Ações Específicas)
export enum Permissao {
  // Ponto
  BATER_PONTO_PROPRIO = 'bater_ponto_proprio',
  VER_PONTO_EQUIPE = 'ver_ponto_equipe',
  EDITAR_PONTO = 'editar_ponto',
  CORRIGIR_PONTO = 'corrigir_ponto',
  REGISTRAR_EXCECAO = 'registrar_excecao',
  
  // Trabalhos
  VER_TRABALHOS = 'ver_trabalhos',
  CRIAR_TRABALHO = 'criar_trabalho',
  EDITAR_TRABALHO = 'editar_trabalho',
  FINALIZAR_TRABALHO = 'finalizar_trabalho',
  EXCLUIR_TRABALHO = 'excluir_trabalho',
  EDITAR_TONELAGEM = 'editar_tonelagem',
  
  // Agendamentos
  VER_AGENDA = 'ver_agenda',
  CRIAR_AGENDAMENTO = 'criar_agendamento',
  CONFIRMAR_AGENDAMENTO = 'confirmar_agendamento',
  CANCELAR_AGENDAMENTO = 'cancelar_agendamento',
  EDITAR_AGENDAMENTO = 'editar_agendamento',
  
  // Clientes
  VER_CLIENTES = 'ver_clientes',
  CRIAR_CLIENTE = 'criar_cliente',
  EDITAR_CLIENTE = 'editar_cliente',
  DESATIVAR_CLIENTE = 'desativar_cliente',
  VER_HISTORICO_CLIENTE = 'ver_historico_cliente',
  
  // Funcionários
  VER_FUNCIONARIOS = 'ver_funcionarios',
  CRIAR_FUNCIONARIO = 'criar_funcionario',
  EDITAR_FUNCIONARIO = 'editar_funcionario',
  DESATIVAR_FUNCIONARIO = 'desativar_funcionario',
  VER_DADOS_PESSOAIS = 'ver_dados_pessoais',
  
  // Pagamentos
  VER_PAGAMENTOS = 'ver_pagamentos',
  MARCAR_PAGAMENTO = 'marcar_pagamento',
  EDITAR_PAGAMENTO = 'editar_pagamento',
  VER_VALORES_PAGOS = 'ver_valores_pagos',
  
  // Relatórios
  VER_DASHBOARD = 'ver_dashboard',
  VER_RELATORIOS_OPERACIONAIS = 'ver_relatorios_operacionais',
  VER_RELATORIOS_FINANCEIROS = 'ver_relatorios_financeiros',
  EXPORTAR_RELATORIOS = 'exportar_relatorios',
  VER_LUCRO = 'ver_lucro',
  
  // Configurações
  GERENCIAR_CARGOS = 'gerenciar_cargos',
  GERENCIAR_PERMISSOES = 'gerenciar_permissoes',
  VER_LOGS = 'ver_logs',
  CONFIGURAR_SISTEMA = 'configurar_sistema',
  GERENCIAR_EMPRESA = 'gerenciar_empresa',
}

// Interface de Cargo
export interface Cargo {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Permissao[];
  companyId: string;
  isSystem: boolean;  // Cargos padrão não podem ser excluídos
  cor?: string;  // Cor para identificação visual
  ordem?: number;  // Ordem de exibição
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date | null;
}

// Grupos de Permissões (para organização na UI)
export interface GrupoPermissoes {
  nome: string;
  descricao: string;
  permissoes: Permissao[];
  icone?: string;
}

export const GRUPOS_PERMISSOES: GrupoPermissoes[] = [
  {
    nome: 'Ponto',
    descricao: 'Controle de ponto e presença',
    permissoes: [
      Permissao.BATER_PONTO_PROPRIO,
      Permissao.VER_PONTO_EQUIPE,
      Permissao.EDITAR_PONTO,
      Permissao.CORRIGIR_PONTO,
      Permissao.REGISTRAR_EXCECAO,
    ],
  },
  {
    nome: 'Trabalhos',
    descricao: 'Gestão de trabalhos e operações',
    permissoes: [
      Permissao.VER_TRABALHOS,
      Permissao.CRIAR_TRABALHO,
      Permissao.EDITAR_TRABALHO,
      Permissao.FINALIZAR_TRABALHO,
      Permissao.EXCLUIR_TRABALHO,
      Permissao.EDITAR_TONELAGEM,
    ],
  },
  {
    nome: 'Agendamentos',
    descricao: 'Planejamento e confirmação de serviços',
    permissoes: [
      Permissao.VER_AGENDA,
      Permissao.CRIAR_AGENDAMENTO,
      Permissao.CONFIRMAR_AGENDAMENTO,
      Permissao.CANCELAR_AGENDAMENTO,
      Permissao.EDITAR_AGENDAMENTO,
    ],
  },
  {
    nome: 'Clientes',
    descricao: 'Gestão de relacionamento com clientes',
    permissoes: [
      Permissao.VER_CLIENTES,
      Permissao.CRIAR_CLIENTE,
      Permissao.EDITAR_CLIENTE,
      Permissao.DESATIVAR_CLIENTE,
      Permissao.VER_HISTORICO_CLIENTE,
    ],
  },
  {
    nome: 'Funcionários',
    descricao: 'Gestão de equipe e recursos humanos',
    permissoes: [
      Permissao.VER_FUNCIONARIOS,
      Permissao.CRIAR_FUNCIONARIO,
      Permissao.EDITAR_FUNCIONARIO,
      Permissao.DESATIVAR_FUNCIONARIO,
      Permissao.VER_DADOS_PESSOAIS,
    ],
  },
  {
    nome: 'Pagamentos',
    descricao: 'Controle financeiro de pagamentos',
    permissoes: [
      Permissao.VER_PAGAMENTOS,
      Permissao.MARCAR_PAGAMENTO,
      Permissao.EDITAR_PAGAMENTO,
      Permissao.VER_VALORES_PAGOS,
    ],
  },
  {
    nome: 'Relatórios',
    descricao: 'Análises e indicadores',
    permissoes: [
      Permissao.VER_DASHBOARD,
      Permissao.VER_RELATORIOS_OPERACIONAIS,
      Permissao.VER_RELATORIOS_FINANCEIROS,
      Permissao.EXPORTAR_RELATORIOS,
      Permissao.VER_LUCRO,
    ],
  },
  {
    nome: 'Configurações',
    descricao: 'Administração do sistema',
    permissoes: [
      Permissao.GERENCIAR_CARGOS,
      Permissao.GERENCIAR_PERMISSOES,
      Permissao.VER_LOGS,
      Permissao.CONFIGURAR_SISTEMA,
      Permissao.GERENCIAR_EMPRESA,
    ],
  },
];

// Labels amigáveis para permissões
export const PERMISSAO_LABELS: Record<Permissao, string> = {
  // Ponto
  [Permissao.BATER_PONTO_PROPRIO]: 'Bater ponto próprio',
  [Permissao.VER_PONTO_EQUIPE]: 'Ver ponto da equipe',
  [Permissao.EDITAR_PONTO]: 'Editar ponto',
  [Permissao.CORRIGIR_PONTO]: 'Corrigir ponto',
  [Permissao.REGISTRAR_EXCECAO]: 'Registrar exceção (falta, hora extra)',
  
  // Trabalhos
  [Permissao.VER_TRABALHOS]: 'Ver trabalhos',
  [Permissao.CRIAR_TRABALHO]: 'Criar trabalho',
  [Permissao.EDITAR_TRABALHO]: 'Editar trabalho',
  [Permissao.FINALIZAR_TRABALHO]: 'Finalizar trabalho',
  [Permissao.EXCLUIR_TRABALHO]: 'Excluir trabalho',
  [Permissao.EDITAR_TONELAGEM]: 'Editar tonelagem (sensível)',
  
  // Agendamentos
  [Permissao.VER_AGENDA]: 'Ver agenda',
  [Permissao.CRIAR_AGENDAMENTO]: 'Criar agendamento',
  [Permissao.CONFIRMAR_AGENDAMENTO]: 'Confirmar agendamento',
  [Permissao.CANCELAR_AGENDAMENTO]: 'Cancelar agendamento',
  [Permissao.EDITAR_AGENDAMENTO]: 'Editar agendamento',
  
  // Clientes
  [Permissao.VER_CLIENTES]: 'Ver clientes',
  [Permissao.CRIAR_CLIENTE]: 'Criar cliente',
  [Permissao.EDITAR_CLIENTE]: 'Editar cliente',
  [Permissao.DESATIVAR_CLIENTE]: 'Desativar cliente',
  [Permissao.VER_HISTORICO_CLIENTE]: 'Ver histórico do cliente',
  
  // Funcionários
  [Permissao.VER_FUNCIONARIOS]: 'Ver funcionários',
  [Permissao.CRIAR_FUNCIONARIO]: 'Criar funcionário',
  [Permissao.EDITAR_FUNCIONARIO]: 'Editar funcionário',
  [Permissao.DESATIVAR_FUNCIONARIO]: 'Desativar funcionário',
  [Permissao.VER_DADOS_PESSOAIS]: 'Ver dados pessoais (CPF, salário)',
  
  // Pagamentos
  [Permissao.VER_PAGAMENTOS]: 'Ver pagamentos',
  [Permissao.MARCAR_PAGAMENTO]: 'Marcar pagamento (sensível)',
  [Permissao.EDITAR_PAGAMENTO]: 'Editar pagamento (sensível)',
  [Permissao.VER_VALORES_PAGOS]: 'Ver valores pagos',
  
  // Relatórios
  [Permissao.VER_DASHBOARD]: 'Ver dashboard',
  [Permissao.VER_RELATORIOS_OPERACIONAIS]: 'Ver relatórios operacionais',
  [Permissao.VER_RELATORIOS_FINANCEIROS]: 'Ver relatórios financeiros',
  [Permissao.EXPORTAR_RELATORIOS]: 'Exportar relatórios',
  [Permissao.VER_LUCRO]: 'Ver lucro (sensível)',
  
  // Configurações
  [Permissao.GERENCIAR_CARGOS]: 'Gerenciar cargos',
  [Permissao.GERENCIAR_PERMISSOES]: 'Gerenciar permissões',
  [Permissao.VER_LOGS]: 'Ver logs de auditoria',
  [Permissao.CONFIGURAR_SISTEMA]: 'Configurar sistema',
  [Permissao.GERENCIAR_EMPRESA]: 'Gerenciar empresa',
};

// Permissões sensíveis (exigem confirmação extra)
export const PERMISSOES_SENSÍVEIS: Permissao[] = [
  Permissao.EDITAR_TONELAGEM,
  Permissao.MARCAR_PAGAMENTO,
  Permissao.EDITAR_PAGAMENTO,
  Permissao.EXCLUIR_TRABALHO,
  Permissao.DESATIVAR_CLIENTE,
  Permissao.DESATIVAR_FUNCIONARIO,
  Permissao.VER_LUCRO,
  Permissao.GERENCIAR_PERMISSOES,
];

// Cargos Padrão (Sugeridos)
export interface CargoTemplate {
  nome: string;
  descricao: string;
  permissoes: Permissao[];
  cor: string;
  ordem: number;
}

export const CARGOS_PADRAO: CargoTemplate[] = [
  {
    nome: 'Funcionário Operacional',
    descricao: 'Funcionário que executa trabalhos e bate ponto',
    cor: '#8E8E93',
    ordem: 1,
    permissoes: [
      Permissao.BATER_PONTO_PROPRIO,
      Permissao.VER_TRABALHOS,
    ],
  },
  {
    nome: 'Líder de Equipe',
    descricao: 'Coordena equipe, acompanha trabalhos e ponto',
    cor: '#5856D6',
    ordem: 2,
    permissoes: [
      Permissao.BATER_PONTO_PROPRIO,
      Permissao.VER_PONTO_EQUIPE,
      Permissao.VER_TRABALHOS,
      Permissao.VER_AGENDA,
      Permissao.VER_DASHBOARD,
      Permissao.VER_CLIENTES,
      Permissao.VER_FUNCIONARIOS,
    ],
  },
  {
    nome: 'Encarregado',
    descricao: 'Gerencia operação, confirma agendamentos e finaliza trabalhos',
    cor: '#FF9500',
    ordem: 3,
    permissoes: [
      Permissao.BATER_PONTO_PROPRIO,
      Permissao.VER_PONTO_EQUIPE,
      Permissao.EDITAR_PONTO,
      Permissao.REGISTRAR_EXCECAO,
      Permissao.VER_TRABALHOS,
      Permissao.CRIAR_TRABALHO,
      Permissao.EDITAR_TRABALHO,
      Permissao.FINALIZAR_TRABALHO,
      Permissao.VER_AGENDA,
      Permissao.CRIAR_AGENDAMENTO,
      Permissao.CONFIRMAR_AGENDAMENTO,
      Permissao.VER_DASHBOARD,
      Permissao.VER_RELATORIOS_OPERACIONAIS,
      Permissao.VER_CLIENTES,
      Permissao.EDITAR_CLIENTE,
      Permissao.VER_FUNCIONARIOS,
      Permissao.VER_PAGAMENTOS,
    ],
  },
  {
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema',
    cor: '#007AFF',
    ordem: 4,
    permissoes: Object.values(Permissao),  // Todas as permissões
  },
];
