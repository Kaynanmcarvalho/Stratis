import { db } from '../config/firebase.config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { Pagamento, FormaPagamento } from '../types/funcionarios.types';

/**
 * Registra pagamento de funcionário
 */
export const registrarPagamento = async (
  funcionarioId: string,
  data: Date,
  valorCalculadoCentavos: number,
  valorPagoCentavos: number,
  formaPagamento: FormaPagamento,
  pagoPor: string,
  companyId: string,
  comprovante?: string,
  observacoes?: string
): Promise<string> => {
  const pagamentosRef = collection(db, `companies/${companyId}/pagamentos`);
  const docRef = await addDoc(pagamentosRef, {
    funcionarioId,
    data: Timestamp.fromDate(data),
    valorCalculadoCentavos,
    valorPagoCentavos,
    formaPagamento,
    comprovante: comprovante || null,
    pagoPor,
    observacoes: observacoes || null,
    companyId,
    timestamp: Timestamp.fromDate(new Date()),
  });

  // Atualizar funcionário
  const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioId);
  await updateDoc(funcionarioRef, {
    ultimoPagamento: Timestamp.fromDate(data),
    updatedAt: Timestamp.fromDate(new Date()),
  });

  return docRef.id;
};

/**
 * Carrega histórico de pagamentos de um funcionário
 */
export const carregarPagamentos = async (
  funcionarioId: string,
  companyId: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<Pagamento[]> => {
  const pagamentosRef = collection(db, `companies/${companyId}/pagamentos`);
  
  let q = query(
    pagamentosRef,
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
      valorCalculadoCentavos: data.valorCalculadoCentavos,
      valorPagoCentavos: data.valorPagoCentavos,
      formaPagamento: data.formaPagamento,
      comprovante: data.comprovante,
      pagoPor: data.pagoPor,
      observacoes: data.observacoes,
      companyId: data.companyId,
      timestamp: data.timestamp.toDate(),
    };
  });
};

/**
 * Carrega pagamentos de todos os funcionários em um período
 */
export const carregarPagamentosEmpresa = async (
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<Pagamento[]> => {
  const pagamentosRef = collection(db, `companies/${companyId}/pagamentos`);
  const q = query(
    pagamentosRef,
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
      valorCalculadoCentavos: data.valorCalculadoCentavos,
      valorPagoCentavos: data.valorPagoCentavos,
      formaPagamento: data.formaPagamento,
      comprovante: data.comprovante,
      pagoPor: data.pagoPor,
      observacoes: data.observacoes,
      companyId: data.companyId,
      timestamp: data.timestamp.toDate(),
    };
  });
};

/**
 * Calcula total pago a um funcionário em um período
 */
export const calcularTotalPago = async (
  funcionarioId: string,
  companyId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<number> => {
  const pagamentos = await carregarPagamentos(
    funcionarioId,
    companyId,
    dataInicio,
    dataFim
  );

  return pagamentos.reduce((total, p) => total + p.valorPagoCentavos, 0);
};

/**
 * Retorna label da forma de pagamento
 */
export const getFormaPagamentoLabel = (forma: FormaPagamento): string => {
  switch (forma) {
    case 'dinheiro':
      return 'Dinheiro';
    case 'pix':
      return 'PIX';
    case 'transferencia':
      return 'Transferência';
    default:
      return forma;
  }
};
