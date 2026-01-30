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
import {
  Ponto,
  PontoTipo,
  Localizacao,
  TentativaPontoInvalida,
  CorrecaoPonto,
} from '../types/funcionarios.types';

/**
 * Registra ponto no Firebase
 */
export const registrarPonto = async (
  funcionarioId: string,
  tipo: PontoTipo,
  localizacao: Localizacao,
  companyId: string
): Promise<string> => {
  const pontosRef = collection(db, `companies/${companyId}/pontos`);
  const docRef = await addDoc(pontosRef, {
    funcionarioId,
    tipo,
    timestamp: Timestamp.fromDate(new Date()),
    localizacao: {
      lat: localizacao.lat,
      lng: localizacao.lng,
      endereco: localizacao.endereco,
      timestamp: Timestamp.fromDate(localizacao.timestamp),
    },
    companyId,
    corrigido: false,
    createdAt: Timestamp.fromDate(new Date()),
  });

  return docRef.id;
};

/**
 * Registra tentativa inválida de ponto
 */
export const registrarTentativaInvalida = async (
  funcionarioId: string,
  tipoTentado: PontoTipo,
  motivoRecusa: string,
  localizacao: Localizacao,
  companyId: string
): Promise<void> => {
  const tentativasRef = collection(db, `companies/${companyId}/pontosTentativasInvalidas`);
  await addDoc(tentativasRef, {
    funcionarioId,
    tipoTentado,
    motivoRecusa,
    timestamp: Timestamp.fromDate(new Date()),
    localizacao: {
      lat: localizacao.lat,
      lng: localizacao.lng,
      endereco: localizacao.endereco,
      timestamp: Timestamp.fromDate(localizacao.timestamp),
    },
    companyId,
  });
};

/**
 * Carrega pontos de um funcionário em uma data específica
 */
export const carregarPontosDia = async (
  funcionarioId: string,
  data: Date,
  companyId: string
): Promise<Ponto[]> => {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const pontosRef = collection(db, `companies/${companyId}/pontos`);
  const q = query(
    pontosRef,
    where('funcionarioId', '==', funcionarioId),
    where('timestamp', '>=', Timestamp.fromDate(inicioDia)),
    where('timestamp', '<=', Timestamp.fromDate(fimDia)),
    orderBy('timestamp', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      funcionarioId: data.funcionarioId,
      tipo: data.tipo,
      timestamp: data.timestamp.toDate(),
      localizacao: {
        lat: data.localizacao.lat,
        lng: data.localizacao.lng,
        endereco: data.localizacao.endereco,
        timestamp: data.localizacao.timestamp.toDate(),
      },
      companyId: data.companyId,
      corrigido: data.corrigido || false,
      correcaoId: data.correcaoId,
    };
  });
};

/**
 * Corrige ponto existente
 */
export const corrigirPonto = async (
  pontoOriginalId: string,
  funcionarioId: string,
  tipoOriginal: PontoTipo,
  timestampOriginal: Date,
  tipoCorrigido: PontoTipo,
  timestampCorrigido: Date,
  motivo: string,
  corrigidoPor: string,
  companyId: string
): Promise<void> => {
  // Registrar correção
  const correcoesRef = collection(db, `companies/${companyId}/correcoesPonto`);
  const correcaoDoc = await addDoc(correcoesRef, {
    pontoOriginalId,
    funcionarioId,
    tipoOriginal,
    timestampOriginal: Timestamp.fromDate(timestampOriginal),
    tipoCorrigido,
    timestampCorrigido: Timestamp.fromDate(timestampCorrigido),
    motivo,
    corrigidoPor,
    companyId,
    timestamp: Timestamp.fromDate(new Date()),
  });

  // Atualizar ponto original
  const pontoRef = doc(db, `companies/${companyId}/pontos`, pontoOriginalId);
  await updateDoc(pontoRef, {
    tipo: tipoCorrigido,
    timestamp: Timestamp.fromDate(timestampCorrigido),
    corrigido: true,
    correcaoId: correcaoDoc.id,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

/**
 * Carrega tentativas inválidas de um funcionário
 */
export const carregarTentativasInvalidas = async (
  funcionarioId: string,
  companyId: string,
  limite: number = 10
): Promise<TentativaPontoInvalida[]> => {
  const tentativasRef = collection(db, `companies/${companyId}/pontosTentativasInvalidas`);
  const q = query(
    tentativasRef,
    where('funcionarioId', '==', funcionarioId),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.slice(0, limite).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      funcionarioId: data.funcionarioId,
      tipoTentado: data.tipoTentado,
      motivoRecusa: data.motivoRecusa,
      timestamp: data.timestamp.toDate(),
      localizacao: {
        lat: data.localizacao.lat,
        lng: data.localizacao.lng,
        endereco: data.localizacao.endereco,
        timestamp: data.localizacao.timestamp.toDate(),
      },
      companyId: data.companyId,
    };
  });
};

/**
 * Carrega correções de ponto de um funcionário
 */
export const carregarCorrecoesPonto = async (
  funcionarioId: string,
  companyId: string,
  limite: number = 10
): Promise<CorrecaoPonto[]> => {
  const correcoesRef = collection(db, `companies/${companyId}/correcoesPonto`);
  const q = query(
    correcoesRef,
    where('funcionarioId', '==', funcionarioId),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.slice(0, limite).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      pontoOriginalId: data.pontoOriginalId,
      funcionarioId: data.funcionarioId,
      tipoOriginal: data.tipoOriginal,
      timestampOriginal: data.timestampOriginal.toDate(),
      tipoCorrigido: data.tipoCorrigido,
      timestampCorrigido: data.timestampCorrigido.toDate(),
      motivo: data.motivo,
      corrigidoPor: data.corrigidoPor,
      companyId: data.companyId,
      timestamp: data.timestamp.toDate(),
    };
  });
};
