import { Trabalho, TrabalhoFuncionario } from '../types';

export class TrabalhoModel {
  static create(data: Partial<Trabalho>): Trabalho {
    const now = new Date();
    
    // Calcular totalPago e lucro
    const totalPagoCentavos = data.funcionarios
      ? data.funcionarios.reduce((sum, f) => sum + f.valorPagoCentavos, 0)
      : 0;
    
    const lucroCentavos = (data.valorRecebidoCentavos || 0) - totalPagoCentavos;

    return {
      id: data.id || '',
      companyId: data.companyId || '',
      data: data.data || now,
      tipo: data.tipo || 'carga',
      tonelagem: data.tonelagem || 0,
      valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
      funcionarios: data.funcionarios || [],
      totalPagoCentavos,
      lucroCentavos,
      clienteNome: data.clienteNome, // Incluir clienteNome
      localDescricao: data.localDescricao, // Incluir localDescricao
      observacoes: data.observacoes,
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      deletedAt: data.deletedAt || null,
    };
  }

  static validate(trabalho: Partial<Trabalho>): string[] {
    const errors: string[] = [];

    if (!trabalho.companyId) {
      errors.push('CompanyId é obrigatório');
    }

    if (!trabalho.data) {
      errors.push('Data é obrigatória');
    }

    if (!trabalho.tipo || !['carga', 'descarga'].includes(trabalho.tipo)) {
      errors.push('Tipo inválido (deve ser carga ou descarga)');
    }

    if (trabalho.tonelagem === undefined || trabalho.tonelagem === null) {
      errors.push('Tonelagem é obrigatória');
    } else if (trabalho.tonelagem <= 0) {
      errors.push('Tonelagem deve ser maior que zero');
    }

    if (trabalho.valorRecebidoCentavos === undefined || trabalho.valorRecebidoCentavos === null) {
      errors.push('Valor recebido é obrigatório');
    } else if (trabalho.valorRecebidoCentavos < 0) {
      errors.push('Valor recebido não pode ser negativo');
    }

    // Funcionários são opcionais - podem ser adicionados depois
    // if (!trabalho.funcionarios || trabalho.funcionarios.length === 0) {
    //   errors.push('Pelo menos um funcionário deve ser associado ao trabalho');
    // }

    if (!trabalho.createdBy) {
      errors.push('CreatedBy é obrigatório');
    }

    return errors;
  }

  static calculateTotals(trabalho: Partial<Trabalho>): {
    totalPagoCentavos: number;
    lucroCentavos: number;
  } {
    const totalPagoCentavos = trabalho.funcionarios
      ? trabalho.funcionarios.reduce((sum, f) => sum + f.valorPagoCentavos, 0)
      : 0;
    
    const lucroCentavos = (trabalho.valorRecebidoCentavos || 0) - totalPagoCentavos;

    return { totalPagoCentavos, lucroCentavos };
  }

  static toFirestore(trabalho: Trabalho): Record<string, any> {
    const data: Record<string, any> = {
      companyId: trabalho.companyId,
      data: trabalho.data,
      tipo: trabalho.tipo,
      tonelagem: trabalho.tonelagem,
      valorRecebidoCentavos: trabalho.valorRecebidoCentavos,
      funcionarios: trabalho.funcionarios,
      totalPagoCentavos: trabalho.totalPagoCentavos,
      lucroCentavos: trabalho.lucroCentavos,
      createdBy: trabalho.createdBy,
      createdAt: trabalho.createdAt,
      updatedAt: trabalho.updatedAt,
      deletedAt: trabalho.deletedAt,
    };

    // Adicionar campos opcionais apenas se existirem
    if (trabalho.clienteNome !== undefined) {
      data.clienteNome = trabalho.clienteNome;
    }
    if (trabalho.localDescricao !== undefined) {
      data.localDescricao = trabalho.localDescricao;
    }
    if (trabalho.observacoes !== undefined) {
      data.observacoes = trabalho.observacoes;
    }

    return data;
  }

  static fromFirestore(id: string, data: any): Trabalho {
    return {
      id,
      companyId: data.companyId,
      data: data.data?.toDate() || new Date(),
      tipo: data.tipo,
      tonelagem: data.tonelagem,
      valorRecebidoCentavos: data.valorRecebidoCentavos,
      funcionarios: data.funcionarios || [],
      totalPagoCentavos: data.totalPagoCentavos,
      lucroCentavos: data.lucroCentavos,
      clienteNome: data.clienteNome,
      localDescricao: data.localDescricao,
      observacoes: data.observacoes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
    };
  }
}
