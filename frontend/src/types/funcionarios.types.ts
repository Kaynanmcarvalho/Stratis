export type PontoStatus = 'trabalhando' | 'almoco' | 'deslocamento' | 'fora';
export type PontoTipo = 'entrada' | 'almoco_saida' | 'almoco_volta' | 'saida';
export type ExcecaoTipo = 'falta' | 'meia_diaria' | 'atraso' | 'saida_antecipada' | 'hora_extra';
export type FormaPagamento = 'dinheiro' | 'pix' | 'transferencia';
export type TipoContrato = 'clt' | 'diaria' | 'temporario';

export interface Localizacao {
  lat: number;
  lng: number;
  endereco: string;
  timestamp: Date;
}

export interface Ponto {
  id: string;
  funcionarioId: string;
  tipo: PontoTipo;
  timestamp: Date;
  localizacao: Localizacao;
  companyId: string;
  corrigido?: boolean;
  correcaoId?: string;
}

export interface TentativaPontoInvalida {
  id: string;
  funcionarioId: string;
  tipoTentado: PontoTipo;
  motivoRecusa: string;
  timestamp: Date;
  localizacao: Localizacao;
  companyId: string;
}

export interface Excecao {
  id: string;
  funcionarioId: string;
  data: Date;
  tipo: ExcecaoTipo;
  motivo: string;
  justificativa?: string;
  aprovadoPor: string;
  impactoFinanceiroCentavos: number;
  companyId: string;
  timestamp: Date;
}

export interface CorrecaoPonto {
  id: string;
  pontoOriginalId: string;
  funcionarioId: string;
  tipoOriginal: PontoTipo;
  timestampOriginal: Date;
  tipoCorrigido: PontoTipo;
  timestampCorrigido: Date;
  motivo: string;
  corrigidoPor: string;
  companyId: string;
  timestamp: Date;
}

export interface Pagamento {
  id: string;
  funcionarioId: string;
  data: Date;
  valorCalculadoCentavos: number;
  valorPagoCentavos: number;
  formaPagamento: FormaPagamento;
  comprovante?: string;
  pagoPor: string;
  observacoes?: string;
  companyId: string;
  timestamp: Date;
}

export interface Funcionario {
  id: string;
  userId: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  funcao: string;
  tipoContrato: TipoContrato;
  dataAdmissao: Date;
  avatar?: string;
  status: PontoStatus;
  ultimoPonto?: Ponto;
  pontosHoje: Ponto[];
  diariaBaseCentavos: number;
  pagoDia: boolean;
  companyId: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalTrabalho {
  id: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  raioPermitidoMetros: number;
  companyId: string;
}

export interface ValidacaoPonto {
  valido: boolean;
  erro?: string;
  avisos?: string[];
}

export interface StatsFuncionarios {
  total: number;
  trabalhando: number;
  almoco: number;
  fora: number;
  naoApareceram: number;
  atrasados: number;
}
