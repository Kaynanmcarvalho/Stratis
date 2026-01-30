/**
 * Serviço de Fechamento Automático - Straxis SaaS
 * Alpha 12.0.0 - MAJOR (Nova Funcionalidade Crítica)
 * 29/01/2026
 */

import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ConfiguracaoFechamento,
  FechamentoGeral,
  FechamentoPorFuncionario,
  DiariaCalculada,
  ValidacaoFechamento,
  ErroFechamento,
  AvisoFechamento,
  InsightsFechamento,
  TotaisFechamento,
} from '../types/fechamento.types';
import { carregarPontosDia } from './pontoService';
import { carregarPagamentos } from './pagamentoService';
import { calcularDiaria, calcularHorasTrabalhadas } from '../utils/pontoValidation';
import { Funcionario, Excecao } from '../types/funcionarios.types';

/**
 * Carrega configuração de fechamento da empresa
 */
export const carregarConfigFechamento = async (
  companyId: string
): Promise<ConfiguracaoFechamento | null> => {
  try {
    const configRef = doc(db, `companies/${companyId}/configuracoes`, 'fechamento');
    const configDoc = await getDoc(configRef);

    if (!configDoc.exists()) {
      return null;
    }

    const data = configDoc.data();
    return {
      id: configDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as ConfiguracaoFechamento;
  } catch (error) {
    console.error('Erro ao carregar configuração de fechamento:', error);
    return null;
  }
};

/**
 * Salva configuração de fechamento
 */
export const salvarConfigFechamento = async (
  config: Partial<ConfiguracaoFechamento>,
  userId: string
): Promise<void> => {
  const configRef = doc(db, `companies/${config.companyId}/configuracoes`, 'fechamento');
  
  const configDoc = await getDoc(configRef);
  
  if (configDoc.exists()) {
    // Atualizar
    await updateDoc(configRef, {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } else {
    // Criar
    await updateDoc(configRef, {
      ...config,
      createdAt: serverTimestamp(),
      createdBy: userId,
    });
  }
};

/**
 * Calcula diárias de um funcionário em um período
 */
export const calcularDiariasPeriodo = async (
  funcionario: Funcionario,
  companyId: string,
  periodo: { inicio: Date; fim: Date }
): Promise<DiariaCalculada[]> => {
  const diarias: DiariaCalculada[] = [];
  
  const dataAtual = new Date(periodo.inicio);
  while (dataAtual <= periodo.fim) {
    // 1. Buscar pontos do dia
    const pontos = await carregarPontosDia(funcionario.id, dataAtual, companyId);
    
    // 2. Buscar exceções do dia
    const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
    const inicioDia = new Date(dataAtual);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataAtual);
    fimDia.setHours(23, 59, 59, 999);
    
    const excecoesQuery = query(
      excecoesRef,
      where('funcionarioId', '==', funcionario.id),
      where('data', '>=', Timestamp.fromDate(inicioDia)),
      where('data', '<=', Timestamp.fromDate(fimDia))
    );
    const excecoesSnapshot = await getDocs(excecoesQuery);
    const excecoes = excecoesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      data: doc.data().data.toDate(),
    })) as Excecao[];
    
    // 3. Determinar tipo de diária
    let tipo: DiariaCalculada['tipo'];
    let valorCentavos: number;
    let horasTrabalhadas: number;
    let baseadoEm: 'ponto' | 'excecao';
    let observacao: string | undefined;
    
    const falta = excecoes.find(e => e.tipo === 'falta');
    const meiaDiaria = excecoes.find(e => e.tipo === 'meia_diaria');
    
    if (falta) {
      tipo = 'falta';
      valorCentavos = 0;
      horasTrabalhadas = 0;
      baseadoEm = 'excecao';
      observacao = falta.motivo;
    } else if (meiaDiaria) {
      tipo = 'meia';
      valorCentavos = Math.floor(funcionario.diariaBaseCentavos / 2);
      horasTrabalhadas = calcularHorasTrabalhadas(pontos);
      baseadoEm = 'excecao';
      observacao = meiaDiaria.motivo;
    } else if (pontos.length >= 4) {
      // Diária completa (bateu todos os pontos)
      const calculo = calcularDiaria(pontos, funcionario.diariaBaseCentavos);
      tipo = calculo.horasExtras > 0 ? 'hora_extra' : 'completa';
      valorCentavos = calculo.valorCentavos;
      horasTrabalhadas = calculo.horasTrabalhadas;
      baseadoEm = 'ponto';
      
      if (calculo.horasExtras > 0) {
        observacao = `${calculo.horasExtras.toFixed(1)}h extras`;
      }
    } else if (pontos.length > 0) {
      // Bateu alguns pontos mas não todos
      tipo = 'meia';
      valorCentavos = Math.floor(funcionario.diariaBaseCentavos / 2);
      horasTrabalhadas = calcularHorasTrabalhadas(pontos);
      baseadoEm = 'ponto';
      observacao = 'Ponto incompleto';
    } else {
      // Não bateu ponto e não tem exceção
      tipo = 'falta';
      valorCentavos = 0;
      horasTrabalhadas = 0;
      baseadoEm = 'ponto';
      observacao = 'Sem registro de ponto';
    }
    
    diarias.push({
      data: new Date(dataAtual),
      tipo,
      horasTrabalhadas,
      valorCentavos,
      baseadoEm,
      observacao,
    });
    
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return diarias;
};

/**
 * Consolida fechamento de um funcionário
 */
export const consolidarFuncionario = async (
  funcionario: Funcionario,
  companyId: string,
  periodo: { inicio: Date; fim: Date }
): Promise<FechamentoPorFuncionario> => {
  const diarias = await calcularDiariasPeriodo(funcionario, companyId, periodo);
  const pagamentos = await carregarPagamentos(funcionario.id, companyId, periodo.inicio, periodo.fim);
  
  const diasCompletos = diarias.filter(d => d.tipo === 'completa').length;
  const meiaDiarias = diarias.filter(d => d.tipo === 'meia').length;
  const faltas = diarias.filter(d => d.tipo === 'falta').length;
  const horasExtras = diarias.filter(d => d.tipo === 'hora_extra');
  
  const valorTotalDiariasCentavos = diarias
    .filter(d => d.tipo === 'completa' || d.tipo === 'meia')
    .reduce((sum, d) => sum + d.valorCentavos, 0);
  
  const valorHorasExtrasCentavos = horasExtras
    .reduce((sum, d) => sum + (d.valorCentavos - funcionario.diariaBaseCentavos), 0);
  
  const valorTotalDevidoCentavos = valorTotalDiariasCentavos + valorHorasExtrasCentavos;
  const valorPagoCentavos = pagamentos.reduce((sum, p) => sum + p.valorPagoCentavos, 0);
  const saldoCentavos = valorTotalDevidoCentavos - valorPagoCentavos;
  
  return {
    funcionarioId: funcionario.id,
    nome: funcionario.nome,
    funcao: funcionario.funcao,
    diasCompletos,
    meiaDiarias,
    faltas,
    valorDiariaBaseCentavos: funcionario.diariaBaseCentavos,
    valorTotalDiariasCentavos,
    valorHorasExtrasCentavos,
    valorTotalDevidoCentavos,
    valorPagoCentavos,
    saldoCentavos,
    detalhamentoDias: diarias,
  };
};

/**
 * Valida antes de fechar
 */
export const validarAntesDeFecha = async (
  companyId: string,
  periodo: { inicio: Date; fim: Date }
): Promise<ValidacaoFechamento> => {
  const erros: ErroFechamento[] = [];
  const avisos: AvisoFechamento[] = [];
  
  // Carregar funcionários ativos
  const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
  const funcionariosQuery = query(
    funcionariosRef,
    where('deletedAt', '==', null)
  );
  const funcionariosSnapshot = await getDocs(funcionariosQuery);
  const funcionarios = funcionariosSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dataAdmissao: doc.data().dataAdmissao?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Funcionario[];
  
  for (const func of funcionarios) {
    // Verificar valor de diária
    if (func.diariaBaseCentavos === 0 || !func.diariaBaseCentavos) {
      erros.push({
        tipo: 'diaria_sem_valor',
        funcionarioId: func.id,
        funcionarioNome: func.nome,
        descricao: `${func.nome} não tem valor de diária configurado`,
        acaoCorretiva: 'Configurar valor da diária em Funcionários',
      });
    }
    
    // Verificar pontos no período
    const dataAtual = new Date(periodo.inicio);
    while (dataAtual <= periodo.fim) {
      const pontos = await carregarPontosDia(func.id, dataAtual, companyId);
      
      // Buscar exceções
      const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
      const inicioDia = new Date(dataAtual);
      inicioDia.setHours(0, 0, 0, 0);
      const fimDia = new Date(dataAtual);
      fimDia.setHours(23, 59, 59, 999);
      
      const excecoesQuery = query(
        excecoesRef,
        where('funcionarioId', '==', func.id),
        where('data', '>=', Timestamp.fromDate(inicioDia)),
        where('data', '<=', Timestamp.fromDate(fimDia))
      );
      const excecoesSnapshot = await getDocs(excecoesQuery);
      const excecoes = excecoesSnapshot.docs;
      
      if (pontos.length === 0 && excecoes.length === 0) {
        erros.push({
          tipo: 'funcionario_sem_ponto',
          funcionarioId: func.id,
          funcionarioNome: func.nome,
          data: new Date(dataAtual),
          descricao: `${func.nome} não bateu ponto em ${dataAtual.toLocaleDateString('pt-BR')}`,
          acaoCorretiva: 'Registrar exceção (falta/férias) ou corrigir ponto',
        });
      }
      
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
  }
  
  return {
    valido: erros.length === 0,
    errosCriticos: erros,
    avisos,
    podeFechar: erros.length === 0,
  };
};

/**
 * Gera insights automáticos
 */
export const gerarInsights = (
  porFuncionario: FechamentoPorFuncionario[],
  fechamentoAnterior?: FechamentoGeral
): InsightsFechamento => {
  const insights: InsightsFechamento = {
    funcionariosComMaisMeiaDiaria: [],
    faltasRecorrentes: [],
    horasExtrasExcessivas: [],
    alertas: [],
  };
  
  // 1. Funcionários com muita meia diária
  for (const func of porFuncionario) {
    const totalDias = func.diasCompletos + func.meiaDiarias + func.faltas;
    if (totalDias === 0) continue;
    
    const percentualMeia = (func.meiaDiarias / totalDias) * 100;
    if (percentualMeia > 30) {
      insights.funcionariosComMaisMeiaDiaria.push({
        funcionarioId: func.funcionarioId,
        nome: func.nome,
        quantidade: func.meiaDiarias,
        percentual: percentualMeia,
      });
      
      insights.alertas.push({
        tipo: 'faltas_excessivas',
        severidade: 'warning',
        mensagem: `${func.nome} teve ${percentualMeia.toFixed(0)}% de meia diária`,
        acao: 'Verificar motivo e considerar ajuste de escala',
      });
    }
  }
  
  // 2. Faltas recorrentes
  for (const func of porFuncionario) {
    if (func.faltas >= 2) {
      insights.faltasRecorrentes.push({
        funcionarioId: func.funcionarioId,
        nome: func.nome,
        faltas: func.faltas,
        diasSemana: [], // TODO: Analisar padrão
      });
      
      insights.alertas.push({
        tipo: 'faltas_excessivas',
        severidade: 'warning',
        mensagem: `${func.nome} faltou ${func.faltas} vezes`,
        acao: 'Conversar com funcionário sobre frequência',
      });
    }
  }
  
  // 3. Horas extras excessivas
  for (const func of porFuncionario) {
    if (func.valorHorasExtrasCentavos > 0) {
      const horasExtras = func.detalhamentoDias
        .filter(d => d.tipo === 'hora_extra')
        .reduce((sum, d) => sum + d.horasTrabalhadas - 8, 0);
      
      if (horasExtras > 10) {
        insights.horasExtrasExcessivas.push({
          funcionarioId: func.funcionarioId,
          nome: func.nome,
          horasExtras,
          custoAdicionalCentavos: func.valorHorasExtrasCentavos,
        });
        
        insights.alertas.push({
          tipo: 'horas_extras_altas',
          severidade: 'warning',
          mensagem: `${func.nome} fez ${horasExtras.toFixed(1)}h extras`,
          acao: 'Revisar necessidade de horas extras',
        });
      }
    }
  }
  
  // 4. Comparativo com período anterior
  if (fechamentoAnterior) {
    const custoAtual = porFuncionario.reduce((sum, f) => sum + f.valorTotalDevidoCentavos, 0);
    const custoAnterior = fechamentoAnterior.totais.custoTotalCentavos;
    const variacaoCusto = ((custoAtual - custoAnterior) / custoAnterior) * 100;
    
    if (Math.abs(variacaoCusto) > 15) {
      insights.alertas.push({
        tipo: 'custo_alto',
        severidade: variacaoCusto > 0 ? 'critical' : 'info',
        mensagem: `Custo ${variacaoCusto > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(variacaoCusto).toFixed(1)}%`,
        acao: variacaoCusto > 0 
          ? 'Revisar alocação de equipe e horas extras'
          : 'Verificar se houve redução de operação',
      });
    }
  }
  
  return insights;
};

/**
 * Gera fechamento completo
 */
export const gerarFechamento = async (
  companyId: string,
  periodo: { inicio: Date; fim: Date },
  tipo: 'diario' | 'semanal' | 'mensal',
  userId: string,
  motivoManual?: string
): Promise<FechamentoGeral> => {
  // 1. Validar
  const validacoes = await validarAntesDeFecha(companyId, periodo);
  
  // 2. Carregar funcionários
  const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
  const funcionariosQuery = query(
    funcionariosRef,
    where('deletedAt', '==', null)
  );
  const funcionariosSnapshot = await getDocs(funcionariosQuery);
  const funcionarios = funcionariosSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dataAdmissao: doc.data().dataAdmissao?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Funcionario[];
  
  // 3. Consolidar por funcionário
  const porFuncionario = await Promise.all(
    funcionarios.map(f => consolidarFuncionario(f, companyId, periodo))
  );
  
  // 4. Calcular totais
  const totais: TotaisFechamento = {
    totalFuncionarios: porFuncionario.length,
    totalDiariasCompletas: porFuncionario.reduce((sum, f) => sum + f.diasCompletos, 0),
    totalMeiaDiarias: porFuncionario.reduce((sum, f) => sum + f.meiaDiarias, 0),
    totalFaltas: porFuncionario.reduce((sum, f) => sum + f.faltas, 0),
    totalHorasExtras: porFuncionario.reduce((sum, f) => {
      return sum + f.detalhamentoDias
        .filter(d => d.tipo === 'hora_extra')
        .reduce((s, d) => s + d.horasTrabalhadas - 8, 0);
    }, 0),
    custoTotalCentavos: porFuncionario.reduce((sum, f) => sum + f.valorTotalDevidoCentavos, 0),
    totalPagoCentavos: porFuncionario.reduce((sum, f) => sum + f.valorPagoCentavos, 0),
    saldoGeralCentavos: porFuncionario.reduce((sum, f) => sum + f.saldoCentavos, 0),
  };
  
  // 5. Gerar insights
  const insights = gerarInsights(porFuncionario);
  
  // 6. Gerar número sequencial
  const fechamentosRef = collection(db, `companies/${companyId}/fechamentos`);
  const fechamentosSnapshot = await getDocs(fechamentosRef);
  const numero = fechamentosSnapshot.size + 1;
  
  // 7. Calcular hash
  const hash = gerarHash({ porFuncionario, totais });
  
  return {
    id: '',
    numero,
    companyId,
    periodo,
    tipo,
    porFuncionario,
    porEquipe: [], // TODO: Implementar
    totais,
    insights,
    validacoes,
    status: 'fechado',
    geradoEm: new Date(),
    geradoPor: userId,
    motivoManual,
    ajustes: [],
    hash,
  };
};

/**
 * Salva fechamento no Firestore
 */
export const salvarFechamento = async (
  fechamento: FechamentoGeral
): Promise<string> => {
  const fechamentosRef = collection(db, `companies/${fechamento.companyId}/fechamentos`);
  
  const docRef = await addDoc(fechamentosRef, {
    ...fechamento,
    periodo: {
      inicio: Timestamp.fromDate(fechamento.periodo.inicio),
      fim: Timestamp.fromDate(fechamento.periodo.fim),
    },
    geradoEm: Timestamp.fromDate(fechamento.geradoEm),
    porFuncionario: fechamento.porFuncionario.map(f => ({
      ...f,
      detalhamentoDias: f.detalhamentoDias.map(d => ({
        ...d,
        data: Timestamp.fromDate(d.data),
      })),
    })),
  });
  
  return docRef.id;
};

/**
 * Carrega fechamentos da empresa
 */
export const carregarFechamentos = async (
  companyId: string,
  limite: number = 10
): Promise<FechamentoGeral[]> => {
  const fechamentosRef = collection(db, `companies/${companyId}/fechamentos`);
  const q = query(
    fechamentosRef,
    orderBy('numero', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.slice(0, limite).map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      periodo: {
        inicio: data.periodo.inicio.toDate(),
        fim: data.periodo.fim.toDate(),
      },
      geradoEm: data.geradoEm.toDate(),
      porFuncionario: data.porFuncionario.map((f: any) => ({
        ...f,
        detalhamentoDias: f.detalhamentoDias.map((d: any) => ({
          ...d,
          data: d.data.toDate(),
        })),
      })),
    } as FechamentoGeral;
  });
};

/**
 * Gera hash para integridade
 */
function gerarHash(dados: any): string {
  const str = JSON.stringify(dados);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
