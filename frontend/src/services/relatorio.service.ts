import { apiService } from './api.service';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface RelatorioData {
  periodo: string;
  faturamentoTotalCentavos: number;
  custosTotaisCentavos: number;
  lucroTotalCentavos: number;
  quantidadeTrabalhos: number;
  trabalhos: any[];
}

export interface DadosRelatorioConsolidado {
  periodo: string;
  totalTrabalhos: number;
  totalToneladas: number;
  valorPago: number;
  valorPendente: number;
  clientes: Array<{
    id: string;
    nome: string;
    trabalhos: number;
    toneladas: number;
    valor: number;
  }>;
  funcionarios: Array<{
    id: string;
    nome: string;
    diarias: number;
    meias: number;
    valor: number;
  }>;
  excecoes: Array<{
    id: string;
    tipo: 'critico' | 'atencao' | 'info';
    descricao: string;
    data: Date;
  }>;
}

interface Trabalho {
  id: string;
  data: any;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  totalPagoCentavos: number;
  clienteId: string;
  clienteNome?: string;
  funcionarios: Array<{
    funcionarioId: string;
    nome: string;
    tipoDiaria: 'diaria' | 'meia';
    valorPagoCentavos: number;
  }>;
  status?: string;
  deletedAt?: any;
}

export const relatorioService = {
  /**
   * Relatório diário
   */
  async diario(data?: Date): Promise<RelatorioData> {
    const params = data ? { data: data.toISOString() } : {};
    const response = await apiService.get('/relatorios/diario', { params });
    return response.data.data;
  },

  /**
   * Relatório semanal
   */
  async semanal(data?: Date): Promise<RelatorioData> {
    const params = data ? { data: data.toISOString() } : {};
    const response = await apiService.get('/relatorios/semanal', { params });
    return response.data.data;
  },

  /**
   * Relatório mensal
   */
  async mensal(mes?: number, ano?: number): Promise<RelatorioData> {
    const params: any = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;
    const response = await apiService.get('/relatorios/mensal', { params });
    return response.data.data;
  },

  /**
   * Relatório por funcionário
   */
  async porFuncionario(
    funcionarioId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<any> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();
    const response = await apiService.get(`/relatorios/funcionario/${funcionarioId}`, {
      params,
    });
    return response.data.data;
  },

  /**
   * Gera relatório consolidado com dados REAIS do Firebase
   */
  async gerarRelatorioConsolidado(
    periodo: 'hoje' | 'semana' | 'mes' | 'personalizado',
    dataInicio?: Date,
    dataFim?: Date,
    companyId?: string
  ): Promise<DadosRelatorioConsolidado> {
    try {
      if (!companyId) {
        throw new Error('CompanyId é obrigatório');
      }

      // Calcular datas baseado no período
      let inicio: Date;
      let fim: Date;
      let periodoTexto: string;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      switch (periodo) {
        case 'hoje':
          inicio = new Date(hoje);
          fim = new Date(hoje);
          fim.setHours(23, 59, 59, 999);
          periodoTexto = 'Hoje';
          break;
        case 'semana':
          inicio = new Date(hoje);
          inicio.setDate(hoje.getDate() - hoje.getDay());
          fim = new Date(inicio);
          fim.setDate(inicio.getDate() + 6);
          fim.setHours(23, 59, 59, 999);
          periodoTexto = 'Semana Atual';
          break;
        case 'mes':
          inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
          periodoTexto = 'Mês Atual';
          break;
        case 'personalizado':
          if (!dataInicio || !dataFim) {
            throw new Error('Datas são obrigatórias para período personalizado');
          }
          inicio = new Date(dataInicio);
          fim = new Date(dataFim);
          periodoTexto = `${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`;
          break;
        default:
          throw new Error('Período inválido');
      }

      // Buscar trabalhos REAIS do Firebase
      const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
      const q = query(
        trabalhosRef,
        where('deletedAt', '==', null),
        where('data', '>=', Timestamp.fromDate(inicio)),
        where('data', '<=', Timestamp.fromDate(fim))
      );

      const snapshot = await getDocs(q);
      const trabalhos: Trabalho[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        trabalhos.push({
          id: doc.id,
          ...data,
          data: data.data?.toDate ? data.data.toDate() : new Date(data.data)
        } as Trabalho);
      });

      // Processar dados REAIS
      return await this.processarDadosReais(trabalhos, periodoTexto, companyId);
      
    } catch (error) {
      console.error('Erro ao gerar relatório consolidado:', error);
      throw error;
    }
  },

  /**
   * Processa trabalhos reais e gera relatório consolidado
   */
  async processarDadosReais(
    trabalhos: Trabalho[],
    periodo: string,
    companyId: string
  ): Promise<DadosRelatorioConsolidado> {
    // Calcular totais
    let totalToneladas = 0;
    let valorPago = 0;
    let valorPendente = 0;
    const clientesMap = new Map<string, { nome: string; trabalhos: number; toneladas: number; valor: number }>();
    const funcionariosMap = new Map<string, { nome: string; diarias: number; meias: number; valor: number }>();
    const excecoes: Array<{ id: string; tipo: 'critico' | 'atencao' | 'info'; descricao: string; data: Date }> = [];

    // Processar cada trabalho
    for (const trabalho of trabalhos) {
      // Tonelagem
      totalToneladas += trabalho.tonelagem || 0;

      // Valores (verificar se está pago ou pendente)
      const valorTrabalho = trabalho.valorRecebidoCentavos || 0;
      if (trabalho.status === 'pago' || trabalho.status === 'concluido') {
        valorPago += valorTrabalho;
      } else {
        valorPendente += valorTrabalho;
      }

      // Agrupar por cliente
      const clienteId = trabalho.clienteId || 'sem-cliente';
      const clienteNome = trabalho.clienteNome || 'Cliente não identificado';
      
      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, {
          nome: clienteNome,
          trabalhos: 0,
          toneladas: 0,
          valor: 0
        });
      }
      
      const cliente = clientesMap.get(clienteId)!;
      cliente.trabalhos++;
      cliente.toneladas += trabalho.tonelagem || 0;
      cliente.valor += valorTrabalho;

      // Agrupar por funcionário
      if (trabalho.funcionarios && Array.isArray(trabalho.funcionarios)) {
        for (const func of trabalho.funcionarios) {
          const funcId = func.funcionarioId;
          const funcNome = func.nome || 'Funcionário não identificado';
          
          if (!funcionariosMap.has(funcId)) {
            funcionariosMap.set(funcId, {
              nome: funcNome,
              diarias: 0,
              meias: 0,
              valor: 0
            });
          }
          
          const funcionario = funcionariosMap.get(funcId)!;
          if (func.tipoDiaria === 'diaria') {
            funcionario.diarias++;
          } else if (func.tipoDiaria === 'meia') {
            funcionario.meias++;
          }
          funcionario.valor += func.valorPagoCentavos || 0;
        }
      }

      // Identificar exceções
      if (trabalho.status === 'cancelado') {
        excecoes.push({
          id: `exc-${trabalho.id}`,
          tipo: 'critico',
          descricao: `Trabalho cancelado: ${clienteNome}`,
          data: trabalho.data
        });
      }
    }

    // Buscar faltas e ajustes (se houver collection específica)
    try {
      const faltasRef = collection(db, `companies/${companyId}/excecoes`);
      const faltasSnapshot = await getDocs(faltasRef);
      
      let totalFaltas = 0;
      let totalAjustes = 0;

      faltasSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tipo === 'falta') totalFaltas++;
        if (data.tipo === 'ajuste') totalAjustes++;
      });

      if (totalFaltas > 0) {
        excecoes.push({
          id: 'exc-faltas',
          tipo: 'critico',
          descricao: `${totalFaltas} falta${totalFaltas > 1 ? 's' : ''} registrada${totalFaltas > 1 ? 's' : ''}`,
          data: new Date()
        });
      }

      if (totalAjustes > 0) {
        excecoes.push({
          id: 'exc-ajustes',
          tipo: 'atencao',
          descricao: `${totalAjustes} ajuste${totalAjustes > 1 ? 's' : ''} de tonelagem`,
          data: new Date()
        });
      }
    } catch (error) {
      console.log('Collection de exceções não encontrada, ignorando...');
    }

    // Converter Maps para Arrays
    const clientes = Array.from(clientesMap.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    const funcionarios = Array.from(funcionariosMap.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    // Ordenar por relevância
    clientes.sort((a, b) => b.trabalhos - a.trabalhos);
    funcionarios.sort((a, b) => b.diarias - a.diarias);

    return {
      periodo,
      totalTrabalhos: trabalhos.length,
      totalToneladas,
      valorPago,
      valorPendente,
      clientes,
      funcionarios,
      excecoes
    };
  }
};
