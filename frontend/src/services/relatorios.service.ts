import { db } from '../config/firebase.config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import {
  RelatorioData,
  TrabalhoDetalhado,
  FiltrosRelatorio,
  RelatorioExcecoes,
  RelatorioPagamentos,
  RelatorioCliente,
  ComparacaoPeriodos,
} from '../types/relatorios.types';

/**
 * Gera relatório consolidado com validação de consistência
 */
export const gerarRelatorio = async (
  companyId: string,
  filtros: FiltrosRelatorio
): Promise<RelatorioData> => {
  const { dataInicio, dataFim } = calcularPeriodo(filtros);

  // 1. Carregar trabalhos
  const trabalhos = await carregarTrabalhos(companyId, dataInicio, dataFim, filtros);

  // 2. Carregar exceções do período
  const excecoes = await carregarExcecoesPeriodo(companyId, dataInicio, dataFim);

  // 3. Carregar ajustes do período
  const ajustes = await carregarAjustesPeriodo(companyId, dataInicio, dataFim);

  // 4. Calcular totais
  const faturamentoTotal = trabalhos.reduce((sum, t) => sum + t.valorRecebidoCentavos, 0);
  const custosTotal = trabalhos.reduce((sum, t) => sum + t.totalPagoCentavos, 0);
  const lucroTotal = faturamentoTotal - custosTotal;
  const tonelagemTotal = trabalhos.reduce((sum, t) => sum + t.tonelagem, 0);

  const quantidadeCancelados = trabalhos.filter((t) => t.status === 'cancelado').length;
  const quantidadeAjustados = trabalhos.filter((t) => t.ajustes.length > 0).length;

  return {
    periodo: formatarPeriodo(filtros.periodo, dataInicio, dataFim),
    dataInicio,
    dataFim,
    faturamentoTotalCentavos: faturamentoTotal,
    custosTotaisCentavos: custosTotal,
    lucroTotalCentavos: lucroTotal,
    quantidadeTrabalhos: trabalhos.length,
    quantidadeCancelados,
    quantidadeAjustados,
    tonelagemTotal,
    trabalhos,
    excecoesTotais: excecoes,
    ajustesTotais: ajustes,
  };
};

/**
 * Carrega trabalhos com todos os detalhes
 */
const carregarTrabalhos = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date,
  filtros: FiltrosRelatorio
): Promise<TrabalhoDetalhado[]> => {
  const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);

  let q = query(
    trabalhosRef,
    where('data', '>=', Timestamp.fromDate(dataInicio)),
    where('data', '<=', Timestamp.fromDate(dataFim)),
    where('deletedAt', '==', null),
    orderBy('data', 'desc')
  );

  // Aplicar filtros adicionais
  if (filtros.clienteId) {
    q = query(q, where('clienteId', '==', filtros.clienteId));
  }

  if (filtros.tipo) {
    q = query(q, where('tipo', '==', filtros.tipo));
  }

  if (filtros.status) {
    q = query(q, where('status', '==', filtros.status));
  }

  const snapshot = await getDocs(q);

  const trabalhos: TrabalhoDetalhado[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Carregar funcionários do trabalho
    const funcionarios = await carregarFuncionariosTrabalho(companyId, docSnap.id);

    // Carregar exceções do trabalho
    const excecoes = await carregarExcecoesTrabalho(companyId, docSnap.id);

    // Carregar ajustes do trabalho
    const ajustes = await carregarAjustesTrabalho(companyId, docSnap.id);

    // Filtrar por funcionário se especificado
    if (filtros.funcionarioId) {
      const temFuncionario = funcionarios.some((f) => f.id === filtros.funcionarioId);
      if (!temFuncionario) continue;
    }

    trabalhos.push({
      id: docSnap.id,
      data: data.data.toDate(),
      tipo: data.tipo,
      status: data.status || 'concluido',
      clienteId: data.clienteId,
      clienteNome: data.clienteNome || 'Cliente não identificado',
      tonelagem: data.tonelagem,
      valorRecebidoCentavos: data.valorRecebidoCentavos,
      totalPagoCentavos: data.totalPagoCentavos,
      lucroCentavos: data.valorRecebidoCentavos - data.totalPagoCentavos,
      funcionarios,
      excecoes,
      ajustes,
      observacoes: data.observacoes,
      registradoPor: data.registradoPor || 'Sistema',
      registradoEm: data.createdAt?.toDate() || data.data.toDate(),
      alteradoEm: data.updatedAt?.toDate(),
    });
  }

  return trabalhos;
};

/**
 * Carrega funcionários de um trabalho com detalhes de pagamento
 */
const carregarFuncionariosTrabalho = async (
  companyId: string,
  trabalhoId: string
): Promise<any[]> => {
  // TODO: Implementar carregamento de funcionários do trabalho
  // Deve buscar de companies/{companyId}/trabalhos/{trabalhoId}/funcionarios
  return [];
};

/**
 * Carrega exceções de um trabalho
 */
const carregarExcecoesTrabalho = async (
  companyId: string,
  trabalhoId: string
): Promise<any[]> => {
  // TODO: Implementar carregamento de exceções do trabalho
  return [];
};

/**
 * Carrega ajustes de um trabalho
 */
const carregarAjustesTrabalho = async (
  companyId: string,
  trabalhoId: string
): Promise<any[]> => {
  // TODO: Implementar carregamento de ajustes do trabalho
  return [];
};

/**
 * Carrega exceções do período
 */
const carregarExcecoesPeriodo = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<any[]> => {
  const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
  const q = query(
    excecoesRef,
    where('data', '>=', Timestamp.fromDate(dataInicio)),
    where('data', '<=', Timestamp.fromDate(dataFim)),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    data: doc.data().data.toDate(),
  }));
};

/**
 * Carrega ajustes do período
 */
const carregarAjustesPeriodo = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<any[]> => {
  // TODO: Implementar carregamento de ajustes
  // Deve buscar de companies/{companyId}/ajustes
  return [];
};

/**
 * Calcula período baseado nos filtros
 */
const calcularPeriodo = (filtros: FiltrosRelatorio): { dataInicio: Date; dataFim: Date } => {
  if (filtros.periodo === 'personalizado' && filtros.dataInicio && filtros.dataFim) {
    return {
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    };
  }

  const hoje = new Date();

  if (filtros.periodo === 'diario') {
    const inicio = new Date(hoje);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(hoje);
    fim.setHours(23, 59, 59, 999);
    return { dataInicio: inicio, dataFim: fim };
  }

  if (filtros.periodo === 'semanal') {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6); // Sábado
    fim.setHours(23, 59, 59, 999);
    return { dataInicio: inicio, dataFim: fim };
  }

  // Mensal
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
  return { dataInicio: inicio, dataFim: fim };
};

/**
 * Formata período para exibição
 */
const formatarPeriodo = (
  tipo: string,
  dataInicio: Date,
  dataFim: Date
): string => {
  if (tipo === 'diario') {
    return dataInicio.toLocaleDateString('pt-BR');
  }

  if (tipo === 'semanal') {
    return `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
  }

  if (tipo === 'mensal') {
    return dataInicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  return `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
};

/**
 * Gera relatório de exceções
 */
export const gerarRelatorioExcecoes = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<RelatorioExcecoes> => {
  // TODO: Implementar relatório de exceções
  return {
    periodo: `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`,
    totalExcecoes: 0,
    impactoFinanceiroTotalCentavos: 0,
    excecoesDetalhadas: [],
  };
};

/**
 * Gera relatório de pagamentos
 */
export const gerarRelatorioPagamentos = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<RelatorioPagamentos> => {
  // TODO: Implementar relatório de pagamentos
  return {
    periodo: `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`,
    totalCalculadoCentavos: 0,
    totalPagoCentavos: 0,
    totalPendenteCentavos: 0,
    pagamentosDetalhados: [],
  };
};

/**
 * Gera relatório por cliente
 */
export const gerarRelatorioCliente = async (
  companyId: string,
  clienteId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<RelatorioCliente> => {
  // TODO: Implementar relatório por cliente
  return {
    clienteId,
    clienteNome: '',
    periodo: `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`,
    quantidadeTrabalhos: 0,
    tonelagemTotal: 0,
    faturamentoTotalCentavos: 0,
    custosTotaisCentavos: 0,
    lucroTotalCentavos: 0,
    margemLucro: 0,
    frequenciaTrabalhos: 0,
    historicoAjustes: [],
    trabalhos: [],
  };
};

/**
 * Compara dois períodos
 */
export const compararPeriodos = async (
  companyId: string,
  filtrosAtual: FiltrosRelatorio,
  filtrosAnterior: FiltrosRelatorio
): Promise<ComparacaoPeriodos> => {
  const periodoAtual = await gerarRelatorio(companyId, filtrosAtual);
  const periodoAnterior = await gerarRelatorio(companyId, filtrosAnterior);

  const calcularVariacao = (atual: number, anterior: number): number => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  return {
    periodoAtual,
    periodoAnterior,
    variacoes: {
      faturamento: calcularVariacao(
        periodoAtual.faturamentoTotalCentavos,
        periodoAnterior.faturamentoTotalCentavos
      ),
      custos: calcularVariacao(
        periodoAtual.custosTotaisCentavos,
        periodoAnterior.custosTotaisCentavos
      ),
      lucro: calcularVariacao(
        periodoAtual.lucroTotalCentavos,
        periodoAnterior.lucroTotalCentavos
      ),
      trabalhos: calcularVariacao(
        periodoAtual.quantidadeTrabalhos,
        periodoAnterior.quantidadeTrabalhos
      ),
      tonelagem: calcularVariacao(
        periodoAtual.tonelagemTotal,
        periodoAnterior.tonelagemTotal
      ),
    },
  };
};

/**
 * Serviço de Relatórios - Consolidação Multi-Fonte
 * Integra trabalhos, exceções, pagamentos e ajustes
 */
export const relatorioService = {
  gerarRelatorioConsolidado: gerarRelatorio,
};
