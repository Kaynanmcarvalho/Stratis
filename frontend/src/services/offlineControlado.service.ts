/**
 * Serviço de Offline Controlado - Straxis SaaS
 * Alpha 14.0.0 - MAJOR
 * 29/01/2026
 * 
 * CRÍTICO: Sistema offline com controle total
 * - Isolamento multiempresa FORÇADO
 * - Validação de ações permitidas
 * - Detecção de conflitos
 * - Limites de tempo
 * - Integração com logs
 */

import {
  OperacaoOffline,
  AcaoOfflinePermitida,
  StatusOperacaoOffline,
  ValidacaoOperacao,
  ResultadoSincronizacao,
  TipoConflito,
  LIMITES_OFFLINE,
} from '../types/offline.types';
import { decisaoService } from './decisao.service';
import { TipoDecisao, OrigemDecisao } from '../types/decisao.types';

class OfflineControladoService {
  private dbName = 'straxis_offline_controlado';
  private storeName = 'operacoes';
  private db: IDBDatabase | null = null;

  /**
   * Inicializa IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('companyId', 'companyId', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestampLocal', 'timestampLocal', { unique: false });
        }
      };
    });
  }

  /**
   * Valida se ação é permitida offline
   */
  private validarAcaoPermitida(acao: string): boolean {
    return Object.values(AcaoOfflinePermitida).includes(acao as AcaoOfflinePermitida);
  }

  /**
   * Adiciona operação à fila (COM VALIDAÇÕES)
   */
  async adicionarOperacao(
    companyId: string,
    userId: string,
    acao: AcaoOfflinePermitida,
    entidade: string,
    entidadeId: string,
    dados: Record<string, any>,
    dadosAntes?: Record<string, any>
  ): Promise<string> {
    // VALIDAÇÃO CRÍTICA 1: companyId OBRIGATÓRIO
    if (!companyId) {
      throw new Error('CRÍTICO: companyId é obrigatório para isolamento multiempresa');
    }

    // VALIDAÇÃO CRÍTICA 2: userId OBRIGATÓRIO
    if (!userId) {
      throw new Error('CRÍTICO: userId é obrigatório');
    }

    // VALIDAÇÃO CRÍTICA 3: Ação permitida
    if (!this.validarAcaoPermitida(acao)) {
      throw new Error(`Ação "${acao}" não é permitida offline`);
    }

    // VALIDAÇÃO CRÍTICA 4: Limite de operações pendentes
    const pendentes = await this.buscarPendentes(companyId);
    if (pendentes.length >= LIMITES_OFFLINE.MAX_OPERACOES_PENDENTES) {
      throw new Error(
        `Limite de ${LIMITES_OFFLINE.MAX_OPERACOES_PENDENTES} operações pendentes atingido. Sincronize antes de continuar.`
      );
    }

    if (!this.db) await this.init();

    const operacao: OperacaoOffline = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      userId,
      acao,
      entidade,
      entidadeId,
      dados,
      dadosAntes,
      timestampLocal: new Date(),
      status: StatusOperacaoOffline.PENDENTE,
      tentativas: 0,
      ip: await this.obterIP(),
      userAgent: navigator.userAgent,
      localizacao: await this.obterLocalizacao(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(operacao);

      request.onsuccess = async () => {
        // Registrar no sistema de logs
        try {
          await decisaoService.registrar({
            companyId,
            userId,
            tipo: TipoDecisao.TRABALHO_CRIADO,  // Ajustar conforme ação
            origem: OrigemDecisao.SISTEMA,
            titulo: 'Ação registrada offline',
            descricao: `Ação "${acao}" registrada offline e será sincronizada`,
            entidade,
            entidadeId,
            acao: 'offline_queue',
            depois: {
              operacaoId: operacao.id,
              acao,
              timestampLocal: operacao.timestampLocal,
            },
          });
        } catch (error) {
          console.error('Erro ao registrar log offline:', error);
        }

        resolve(operacao.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Busca operações pendentes de uma empresa
   */
  async buscarPendentes(companyId: string): Promise<OperacaoOffline[]> {
    if (!companyId) {
      throw new Error('CRÍTICO: companyId é obrigatório');
    }

    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => {
        const operacoes = (request.result as OperacaoOffline[]).filter(
          (op) => op.status === StatusOperacaoOffline.PENDENTE
        );
        // Ordenar por timestamp
        operacoes.sort(
          (a, b) => a.timestampLocal.getTime() - b.timestampLocal.getTime()
        );
        resolve(operacoes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Atualiza status de operação
   */
  async atualizarStatus(
    operacaoId: string,
    status: StatusOperacaoOffline,
    conflito?: OperacaoOffline['conflito']
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(operacaoId);

      request.onsuccess = () => {
        const operacao = request.result as OperacaoOffline;
        if (operacao) {
          operacao.status = status;
          operacao.ultimaTentativa = new Date();
          if (status === StatusOperacaoOffline.SINCRONIZADA) {
            operacao.timestampSync = new Date();
          }
          if (conflito) {
            operacao.conflito = conflito;
          }
          store.put(operacao);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove operação da fila
   */
  async removerOperacao(operacaoId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(operacaoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Valida idade de operação
   */
  private validarIdadeOperacao(operacao: OperacaoOffline): boolean {
    const idadeHoras =
      (new Date().getTime() - operacao.timestampLocal.getTime()) / (1000 * 60 * 60);
    return idadeHoras <= LIMITES_OFFLINE.MAX_HORAS_OFFLINE;
  }

  /**
   * Busca operação mais antiga pendente
   */
  async buscarMaisAntigaPendente(companyId: string): Promise<OperacaoOffline | null> {
    const pendentes = await this.buscarPendentes(companyId);
    return pendentes.length > 0 ? pendentes[0] : null;
  }

  /**
   * Calcula idade da operação mais antiga (em horas)
   */
  async calcularIdadeMaisAntiga(companyId: string): Promise<number | null> {
    const maisAntiga = await this.buscarMaisAntigaPendente(companyId);
    if (!maisAntiga) return null;

    return (
      (new Date().getTime() - maisAntiga.timestampLocal.getTime()) / (1000 * 60 * 60)
    );
  }

  /**
   * Limpa todas as operações de uma empresa (ao fazer logout/trocar empresa)
   */
  async limparPorEmpresa(companyId: string): Promise<number> {
    if (!companyId) {
      throw new Error('CRÍTICO: companyId é obrigatório');
    }

    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('companyId');
      const request = index.openCursor(IDBKeyRange.only(companyId));
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtém IP do usuário (best effort)
   */
  private async obterIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  /**
   * Obtém localização do usuário (se permitido)
   */
  private async obterLocalizacao(): Promise<
    { latitude: number; longitude: number } | undefined
  > {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000 }
      );
    });
  }

  /**
   * Conta operações pendentes
   */
  async contarPendentes(companyId: string): Promise<number> {
    const pendentes = await this.buscarPendentes(companyId);
    return pendentes.length;
  }

  /**
   * Busca operações com conflito
   */
  async buscarComConflito(companyId: string): Promise<OperacaoOffline[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('companyId');
      const request = index.getAll(companyId);

      request.onsuccess = () => {
        const operacoes = (request.result as OperacaoOffline[]).filter(
          (op) => op.status === StatusOperacaoOffline.CONFLITO
        );
        resolve(operacoes);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineControladoService = new OfflineControladoService();
