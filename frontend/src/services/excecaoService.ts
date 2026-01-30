import { db } from '../config/firebase.config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Excecao, ExcecaoTipo } from '../types/funcionarios.types';

/**
 * Registra exceção (falta, meia diária, atraso, etc)
 */
export const registrarExcecao = async (
  funcionarioId: string,
  data: Date,
  tipo: ExcecaoTipo,
  motivo: string,
  justificativa: string | undefined,
  aprovadoPor: string,
  impactoFinanceiroCentavos: number,
  companyId: string
): Promise<string> => {
  const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
  const docRef = await addDoc(excecoesRef, {
    funcionarioId,
    data: Timestamp.fromDate(data),
    tipo,
    motivo,
    justificativa: justificativa || null,
    aprovadoPor,
    impactoFinanceiroCentavos,
    companyId,
    timestamp: Timestamp.fromDate(new Date()),
  });

  return docRef.id;
};

/**
 * Carrega exceções de um funcionário
 */
export const carregarExcecoes = async (
  funcionarioId: string,
  companyId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<Excecao[]> => {
  const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
  
  let q = query(
    excecoesRef,
    where('funcionarioId', '==', funcionarioId),
    orderBy('data', 'desc')
  );

  if (dataInicio) {
    q = query(q, where('data', '>=', Timestamp.fromDate(dataInicio)));
  }

  if (dataFim) {
    q = query(q, where('data', '<=', Timestamp.fromDate(dataFim)));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      funcionarioId: data.funcionarioId,
      data: data.data.toDate(),
      tipo: data.tipo,
      motivo: data.motivo,
      justificativa: data.justificativa,
      aprovadoPor: data.aprovadoPor,
      impactoFinanceiroCentavos: data.impactoFinanceiroCentavos,
      companyId: data.companyId,
      timestamp: data.timestamp.toDate(),
    };
  });
};

/**
 * Carrega exceções de todos os funcionários em um período
 */
export const carregarExcecoesEmpresa = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<Excecao[]> => {
  const excecoesRef = collection(db, `companies/${companyId}/excecoes`);
  const q = query(
    excecoesRef,
    where('data', '>=', Timestamp.fromDate(dataInicio)),
    where('data', '<=', Timestamp.fromDate(dataFim)),
    orderBy('data', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      funcionarioId: data.funcionarioId,
      data: data.data.toDate(),
      tipo: data.tipo,
      motivo: data.motivo,
      justificativa: data.justificativa,
      aprovadoPor: data.aprovadoPor,
      impactoFinanceiroCentavos: data.impactoFinanceiroCentavos,
      companyId: data.companyId,
      timestamp: data.timestamp.toDate(),
    };
  });
};

/**
 * Retorna label do tipo de exceção
 */
export const getTipoExcecaoLabel = (tipo: ExcecaoTipo): string => {
  switch (tipo) {
    case 'falta':
      return 'Falta';
    case 'meia_diaria':
      return 'Meia Diária';
    case 'atraso':
      return 'Atraso';
    case 'saida_antecipada':
      return 'Saída Antecipada';
    case 'hora_extra':
      return 'Hora Extra';
    default:
      return tipo;
  }
};
